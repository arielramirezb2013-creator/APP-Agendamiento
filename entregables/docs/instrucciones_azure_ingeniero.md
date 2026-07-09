# Rehavid Operaciones · Guía de despliegue en Azure

**Audiencia:** ingeniero de DevOps / sistemas que va a montar la infraestructura.
**Tiempo estimado de despliegue inicial:** 1 día hábil completo.
**Costo estimado:** USD 150–250/mes en fase piloto, USD 400–700/mes a escala (3000 usuarios).

---

## 1 · Pre-requisitos

Antes de empezar, asegúrate de tener:

- Cuenta Azure con suscripción activa y rol **Propietario** (o Colaborador con permisos sobre los servicios listados abajo).
- `az` CLI instalado · `az --version` debe responder. Si no: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
- Docker instalado localmente (para construir y subir la imagen del backend).
- Acceso de administrador al tenant de Microsoft 365 de Rehavid (para registrar la app en Entra ID).
- Los 3 archivos de este paquete:
  - `backend/` → código FastAPI
  - `ml/` → script de entrenamiento y `score.py`
  - `frontend/rehavid_v12_produccion.html`

**Login en Azure CLI:**

```bash
az login
az account set --subscription "<tu-subscription-id>"
az account show
```

---

## 2 · Variables · convención de nombres

Usa estos nombres consistentes en toda la guía. Si cambias uno, cámbialo en todos los comandos.

| Variable | Valor sugerido | Notas |
|---|---|---|
| `RG` | `rehavid-rg` | Resource group |
| `LOC` | `eastus` | Región. East US es la más barata para Latinoamérica |
| `ACR` | `rehavidacr` | Container registry (debe ser único globalmente, todo en minúsculas) |
| `COSMOS` | `rehavid-cosmos` | Cosmos DB account |
| `STORAGE` | `rehavidstorage` | Storage account (debe ser único globalmente) |
| `APP` | `rehavid-api` | Nombre del App Service |
| `PLAN` | `rehavid-plan` | App Service Plan |
| `KV` | `rehavid-kv` | Key Vault (único globalmente) |
| `AML_WS` | `rehavid-ml-ws` | Azure ML Workspace |
| `AML_ENDPOINT` | `rehavid-risk-endpoint` | Endpoint del modelo |
| `INSIGHTS` | `rehavid-insights` | Application Insights |

Exporta como variables de shell para reutilizar:

```bash
export RG=rehavid-rg
export LOC=eastus
export ACR=rehavidacr
export COSMOS=rehavid-cosmos
export STORAGE=rehavidstorage
export APP=rehavid-api
export PLAN=rehavid-plan
export KV=rehavid-kv
export AML_WS=rehavid-ml-ws
export INSIGHTS=rehavid-insights
```

---

## 3 · Resource Group

```bash
az group create --name $RG --location $LOC
```

---

## 4 · Cosmos DB (base de datos)

Cosmos DB con la API NoSQL almacena reservas, equipos, paquetes, usuarios, planes y auditoría.

```bash
# Crear la cuenta (modo serverless es lo más barato para arranque)
az cosmosdb create \
  --name $COSMOS \
  --resource-group $RG \
  --kind GlobalDocumentDB \
  --default-consistency-level Session \
  --locations regionName=$LOC \
  --capabilities EnableServerless

# Crear la base de datos
az cosmosdb sql database create \
  --account-name $COSMOS \
  --resource-group $RG \
  --name rehavid

# Crear los 7 containers (uno por tipo de documento)
for container in users equipos reservas paquetes planes solicitudes; do
  PK="/id"
  if [ "$container" = "users" ]; then PK="/email"; fi
  az cosmosdb sql container create \
    --account-name $COSMOS \
    --resource-group $RG \
    --database-name rehavid \
    --name $container \
    --partition-key-path $PK
done

# El container de auditoría se particiona por email del usuario (queries por usuario son comunes)
az cosmosdb sql container create \
  --account-name $COSMOS \
  --resource-group $RG \
  --database-name rehavid \
  --name auditoria \
  --partition-key-path /user_email
```

**Obtén las credenciales (las necesitas para el `.env`):**

```bash
az cosmosdb show --name $COSMOS --resource-group $RG --query documentEndpoint -o tsv
az cosmosdb keys list --name $COSMOS --resource-group $RG --query primaryMasterKey -o tsv
```

Guarda ambos · van a `COSMOS_ENDPOINT` y `COSMOS_KEY`.

---

## 5 · Blob Storage (archivos: logos, adjuntos)

```bash
az storage account create \
  --name $STORAGE \
  --resource-group $RG \
  --location $LOC \
  --sku Standard_LRS \
  --kind StorageV2

# Containers
az storage container create --account-name $STORAGE --name logos --public-access blob
az storage container create --account-name $STORAGE --name attachments --public-access off

# Obtener connection string
az storage account show-connection-string \
  --name $STORAGE --resource-group $RG --query connectionString -o tsv
```

Guarda el connection string · va a `BLOB_CONNECTION_STRING`.

**Sube el logo de Rehavid (una sola vez):**

```bash
az storage blob upload \
  --account-name $STORAGE \
  --container-name logos \
  --name rehavid.png \
  --file ./Logo_Rehavid_para_formatos.png
```

---

## 6 · Microsoft Entra ID (SSO para empleados @rehavid.com.co)

**Esto requiere acceso al portal de Microsoft 365** (un admin del tenant). Si no eres el admin, escribe lo que necesitas y pídeselo:

1. Ve a https://portal.azure.com → **Microsoft Entra ID** → **App registrations** → **+ New registration**
2. Nombre: `Rehavid Operaciones`
3. Supported account types: **Single tenant** (solo cuentas de Rehavid)
4. Redirect URI: **Web** → `https://operaciones.rehavid.com.co/sso-callback`
5. Click **Register**
6. Anota: **Application (client) ID** y **Directory (tenant) ID**
7. Ve a **Certificates & secrets** → **+ New client secret** → 24 meses
8. **Copia el Value INMEDIATAMENTE** (no se vuelve a mostrar)
9. Ve a **API permissions** → asegúrate de tener `User.Read` (Microsoft Graph) ya está por defecto
10. Click **Grant admin consent for Rehavid**

Resultado · guarda los 3 valores:
- `AZURE_TENANT_ID` (Directory ID)
- `AZURE_CLIENT_ID` (Application ID)
- `AZURE_CLIENT_SECRET` (el value que copiaste)

---

## 7 · Key Vault (secretos)

Nunca metas secretos en `.env` en producción · van a Key Vault.

```bash
az keyvault create --name $KV --resource-group $RG --location $LOC

# Guarda los secretos
az keyvault secret set --vault-name $KV --name cosmos-key --value "<el-cosmos-key>"
az keyvault secret set --vault-name $KV --name blob-connstr --value "<el-blob-connstr>"
az keyvault secret set --vault-name $KV --name entra-client-secret --value "<el-secret>"
az keyvault secret set --vault-name $KV --name jwt-secret --value "$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')"
```

---

## 8 · Azure ML Workspace (modelo predictivo)

Esta sección es opcional en el día 1 · el backend funciona con un mock hasta que tengas el modelo entrenado.

```bash
# Crear el workspace
az ml workspace create \
  --name $AML_WS \
  --resource-group $RG \
  --location $LOC

# Compute cluster para entrenamiento (apagado cuando no se usa · no cuesta nada en reposo)
az ml compute create \
  --name cpu-cluster \
  --type AmlCompute \
  --resource-group $RG \
  --workspace-name $AML_WS \
  --size Standard_DS3_v2 \
  --min-instances 0 \
  --max-instances 2 \
  --idle-time-before-scale-down 120
```

**Cuando tengas el modelo entrenado** (`ml/modelo/modelo_riesgo_msk.pkl`), sigue esto:

```bash
# 1) Registrar el modelo
az ml model create \
  --name modelo-riesgo-msk \
  --version 1 \
  --path ./ml/modelo \
  --resource-group $RG \
  --workspace-name $AML_WS

# 2) Crear un endpoint online
az ml online-endpoint create \
  --name rehavid-risk-endpoint \
  --auth-mode key \
  --resource-group $RG \
  --workspace-name $AML_WS

# 3) Crear el deployment (referencia score.py)
cat > deployment.yml <<'EOF'
$schema: https://azuremlschemas.azureedge.net/latest/managedOnlineDeployment.schema.json
name: blue
endpoint_name: rehavid-risk-endpoint
model: azureml:modelo-riesgo-msk:1
code_configuration:
  code: ./ml
  scoring_script: score.py
environment:
  conda_file: ./ml/conda.yml
  image: mcr.microsoft.com/azureml/openmpi4.1.0-ubuntu22.04
instance_type: Standard_DS2_v2
instance_count: 1
EOF

# 4) También necesitas un conda.yml mínimo
cat > ml/conda.yml <<'EOF'
name: rehavid-score
channels: [conda-forge]
dependencies:
  - python=3.11
  - pip
  - pip:
    - scikit-learn==1.5.2
    - shap==0.46.0
    - joblib==1.4.2
    - numpy==2.1.2
    - pandas==2.2.3
EOF

az ml online-deployment create \
  --file deployment.yml \
  --resource-group $RG \
  --workspace-name $AML_WS \
  --all-traffic

# 5) Obtener URL y key del endpoint
az ml online-endpoint show -n rehavid-risk-endpoint \
  --resource-group $RG --workspace-name $AML_WS --query scoring_uri -o tsv

az ml online-endpoint get-credentials -n rehavid-risk-endpoint \
  --resource-group $RG --workspace-name $AML_WS --query primaryKey -o tsv
```

Guarda ambos · van a `AZURE_ML_ENDPOINT` y `AZURE_ML_KEY`. Después cambia `AZURE_ML_ENABLED=true` en el App Service y el backend automáticamente empezará a usar el modelo real en vez del mock.

---

## 9 · Application Insights (telemetría y auditoría)

```bash
az monitor app-insights component create \
  --app $INSIGHTS \
  --location $LOC \
  --resource-group $RG \
  --application-type web

# Obtener connection string
az monitor app-insights component show \
  --app $INSIGHTS --resource-group $RG \
  --query connectionString -o tsv
```

Guarda · va a `APPINSIGHTS_CONNECTION_STRING`.

---

## 10 · Container Registry y build del backend

```bash
az acr create --resource-group $RG --name $ACR --sku Basic --admin-enabled true

# Login en el registry
az acr login --name $ACR

# Construir y subir la imagen
cd backend/
docker build -t $ACR.azurecr.io/rehavid-api:v1 .
docker push $ACR.azurecr.io/rehavid-api:v1
```

---

## 11 · App Service (donde corre el backend)

```bash
# Plan Linux (B1 alcanza para piloto, escalar a P1v3 si pasas de 500 usuarios concurrentes)
az appservice plan create \
  --name $PLAN \
  --resource-group $RG \
  --is-linux \
  --sku B1

# Web App con la imagen del container registry
az webapp create \
  --resource-group $RG \
  --plan $PLAN \
  --name $APP \
  --deployment-container-image-name $ACR.azurecr.io/rehavid-api:v1

# Configurar credenciales para que el App Service pueda jalar la imagen
ACR_PASS=$(az acr credential show --name $ACR --query passwords[0].value -o tsv)
az webapp config container set \
  --name $APP \
  --resource-group $RG \
  --container-image-name $ACR.azurecr.io/rehavid-api:v1 \
  --container-registry-url https://$ACR.azurecr.io \
  --container-registry-user $ACR \
  --container-registry-password $ACR_PASS

# Habilitar Managed Identity para que el App Service pueda leer Key Vault
az webapp identity assign --name $APP --resource-group $RG
PRINCIPAL_ID=$(az webapp identity show --name $APP --resource-group $RG --query principalId -o tsv)
az keyvault set-policy --name $KV --object-id $PRINCIPAL_ID --secret-permissions get list
```

**Configurar las variables de entorno (las referencias a Key Vault son automáticas):**

```bash
az webapp config appsettings set --name $APP --resource-group $RG --settings \
  COSMOS_ENDPOINT="https://$COSMOS.documents.azure.com:443/" \
  COSMOS_KEY="@Microsoft.KeyVault(SecretUri=https://$KV.vault.azure.net/secrets/cosmos-key/)" \
  COSMOS_DATABASE="rehavid" \
  BLOB_CONNECTION_STRING="@Microsoft.KeyVault(SecretUri=https://$KV.vault.azure.net/secrets/blob-connstr/)" \
  AZURE_TENANT_ID="<tu-tenant-id>" \
  AZURE_CLIENT_ID="<tu-client-id>" \
  AZURE_CLIENT_SECRET="@Microsoft.KeyVault(SecretUri=https://$KV.vault.azure.net/secrets/entra-client-secret/)" \
  AZURE_AUTHORITY="https://login.microsoftonline.com/<tu-tenant-id>" \
  AZURE_ML_ENABLED="false" \
  AZURE_ML_ENDPOINT="" \
  AZURE_ML_KEY="" \
  JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://$KV.vault.azure.net/secrets/jwt-secret/)" \
  ENVIRONMENT="production" \
  CORS_ORIGINS='["https://operaciones.rehavid.com.co"]' \
  APPINSIGHTS_CONNECTION_STRING="<el-connection-string>" \
  WEBSITES_PORT=8000
```

**Sembrar la DB inicial** (los 10 equipos, 5 paquetes, 5 usuarios demo):

```bash
# Conectarse al container y correr el seed
az webapp ssh --name $APP --resource-group $RG
# Dentro del SSH:
python -m app.seed
exit
```

Alternativamente, corre el seed desde tu máquina contra Cosmos DB directamente:

```bash
cd backend/
# Edita .env con COSMOS_ENDPOINT y COSMOS_KEY apuntando al Cosmos productivo
python -m app.seed
```

**Verificar que arrancó:**

```bash
curl https://$APP.azurewebsites.net/health
# Esperado: {"status":"ok","cosmos":"ok"}

curl https://$APP.azurewebsites.net/docs
# Debe mostrar Swagger UI
```

---

## 12 · Frontend (Static Web App o Storage)

El HTML es un único archivo, así que tienes dos opciones:

### Opción A · Azure Static Web Apps (recomendado)

```bash
az staticwebapp create \
  --name rehavid-frontend \
  --resource-group $RG \
  --location $LOC \
  --sku Free
```

Antes de subirlo, edita el HTML para apuntar al backend. Al inicio del archivo (en el `<head>`), agrega:

```html
<script>
  window.REHAVID_USE_BACKEND = true;
  window.REHAVID_API_URL = 'https://rehavid-api.azurewebsites.net';
</script>
```

Luego súbelo:

```bash
az staticwebapp deploy \
  --name rehavid-frontend \
  --source ./frontend \
  --app-location "."
```

### Opción B · Blob Storage como sitio estático (más barato)

```bash
az storage blob service-properties update \
  --account-name $STORAGE \
  --static-website \
  --index-document rehavid_v12_produccion.html

az storage blob upload \
  --account-name $STORAGE \
  --container-name '$web' \
  --name rehavid_v12_produccion.html \
  --file ./frontend/rehavid_v12_produccion.html
```

---

## 13 · DNS · operaciones.rehavid.com.co

En el panel del DNS de Rehavid (probablemente GoDaddy o el proveedor del dominio):

```
operaciones.rehavid.com.co    CNAME    <nombre-del-static-web-app>.azurestaticapps.net
api.rehavid.com.co            CNAME    rehavid-api.azurewebsites.net
```

Luego en Azure, valida el dominio personalizado:

```bash
az webapp config hostname add \
  --webapp-name $APP \
  --resource-group $RG \
  --hostname api.rehavid.com.co

# Habilitar HTTPS gratis con cert administrado
az webapp config ssl create \
  --resource-group $RG \
  --name $APP \
  --hostname api.rehavid.com.co
```

---

## 14 · CI/CD (GitHub Actions)

Crea `.github/workflows/deploy.yml` en el repo:

```yaml
name: Build and deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Build and push backend
        run: |
          az acr login --name rehavidacr
          docker build -t rehavidacr.azurecr.io/rehavid-api:${{ github.sha }} ./backend
          docker push rehavidacr.azurecr.io/rehavid-api:${{ github.sha }}

      - name: Deploy to App Service
        run: |
          az webapp config container set \
            --name rehavid-api \
            --resource-group rehavid-rg \
            --container-image-name rehavidacr.azurecr.io/rehavid-api:${{ github.sha }}

          az webapp restart --name rehavid-api --resource-group rehavid-rg
```

Crea el service principal y guarda el JSON como secret `AZURE_CREDENTIALS` en GitHub:

```bash
az ad sp create-for-rbac --name rehavid-cicd \
  --role contributor \
  --scopes /subscriptions/<sub-id>/resourceGroups/$RG \
  --sdk-auth
```

---

## 15 · Estimación de costos mensuales

| Servicio | Configuración piloto | Costo estimado | Configuración escala (3000 usuarios) | Costo estimado |
|---|---|---|---|---|
| App Service Plan | B1 (1 vCPU, 1.75 GB) | $13 | P1v3 (2 vCPU, 8 GB) | $145 |
| Cosmos DB | Serverless | $25 | Provisioned 1000 RU/s | $58 |
| Storage | LRS 100 GB | $2 | LRS 500 GB | $10 |
| Container Registry | Basic | $5 | Standard | $20 |
| Key Vault | Standard | $1 | Standard | $5 |
| Application Insights | 5 GB ingesta | $15 | 30 GB ingesta | $80 |
| Azure ML Workspace | Sin endpoint | $0 | DS2_v2 always-on | $90 |
| Static Web App | Free | $0 | Standard | $10 |
| Bandwidth + otros | | $10 | | $40 |
| **Total** | | **~$71** | | **~$458** |

Cuando agregues SSL personalizado y backup geo-redundante, súmale 30% más. Los valores son orientativos · consulta el Pricing Calculator de Azure para tu suscripción específica.

---

## 16 · Mantenimiento operacional

### Diario
- Application Insights · Failures dashboard. Si hay 5xx, investigar.
- Cosmos DB · Metrics → consumo RU. Si > 80%, escalar.

### Semanal
- Revisar `auditoria` container: actividad inusual, intentos de login fallidos.
- Backups · Cosmos DB tiene backup continuo. Verificar política.

### Mensual
- Rotar `JWT_SECRET` y `client_secret` de Entra ID (cada 12 meses obligatorio).
- Reentrenar el modelo ML con los datos nuevos del mes.
- Actualizar dependencias del backend (`pip list --outdated`).

### Trimestral
- Auditoría de seguridad: revisar usuarios activos, niveles de permiso.
- Revisar factura · si el costo subió >30%, investigar qué servicio.

---

## 17 · Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Frontend muestra "No se pudo sincronizar" | Backend no responde o CORS | Verificar `curl https://api.rehavid.com.co/health` y que el dominio del frontend esté en `CORS_ORIGINS` |
| Login falla con "Usuario no autorizado" | Usuario no existe en Cosmos | Crear desde `/admin/users` (un admin nivel 1) |
| Predictivo siempre devuelve mock | `AZURE_ML_ENABLED=false` | Activar y verificar `AZURE_ML_ENDPOINT` y `AZURE_ML_KEY` |
| 503 al arrancar | Cosmos DB sin alcanzar | Verificar firewall del Cosmos, debe permitir el outbound IP del App Service |
| Cosmos: throttling | Muchas requests | Cambiar de serverless a provisioned con autoscale |
| Cold start lento (>10s) | Plan B1 hibernando | Subir a P1v3 (always-on) o configurar warmup endpoint |

---

## 18 · Checklist post-despliegue

Antes de declarar producción, verifica que pasa todo lo siguiente:

- [ ] `GET /health` responde 200 con `cosmos: ok`
- [ ] Login con `ariel.ramirez@rehavid.com.co` / `13011976` funciona
- [ ] Crear una reserva de prueba y verificar que aparece en Cosmos
- [ ] Cancelar la reserva de prueba · el equipo se libera
- [ ] Frontend en `operaciones.rehavid.com.co` carga con HTTPS
- [ ] Application Insights recibe trazas de los requests
- [ ] Backup automático de Cosmos activado (Continuous backup)
- [ ] Alertas configuradas: error rate >5%, RU consumption >80%, response time >2s
- [ ] Firewall de Cosmos limita acceso solo al App Service y a IPs administrativas
- [ ] El secret JWT está en Key Vault, no en variables de entorno literales
- [ ] CORS_ORIGINS solo incluye dominios de Rehavid (no `*`)
- [ ] Plan de DRP documentado: cómo restaurar desde backup, RTO/RPO acordados

---

## 19 · Contactos

Ante dudas durante el despliegue:

- **Microsoft Support** (incluido en la suscripción Azure): https://portal.azure.com → Help + support
- **Documentación FastAPI:** https://fastapi.tiangolo.com
- **Documentación Cosmos:** https://learn.microsoft.com/en-us/azure/cosmos-db
- **Documentación Azure ML:** https://learn.microsoft.com/en-us/azure/machine-learning

**Cuando termines el despliegue, documenta en una página interna:**
- URLs finales de frontend y API
- Quién tiene acceso a Azure portal (ideal: 2 personas, no solo una)
- Dónde está el repo del código
- Cómo correr el seed inicial si hay que recrear la DB
