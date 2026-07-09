# Rehavid Operaciones · Checklist de despliegue

Marca cada ítem cuando esté hecho. No saltes pasos · cada uno depende del anterior.

## Fase 1 · Preparación (1 día)

- [ ] Suscripción Azure activa con rol Propietario
- [ ] `az` CLI instalado y `az login` exitoso
- [ ] Docker instalado y funcionando localmente
- [ ] Acceso al admin de Microsoft 365 de Rehavid
- [ ] Backend probado localmente con `docker-compose up`
- [ ] Login en `http://localhost:8000/docs` con usuario seed
- [ ] Llamada a `POST /reservas` exitosa contra Cosmos emulator

## Fase 2 · Infraestructura Azure (2 días)

- [ ] Resource Group `rehavid-rg` creado en `eastus`
- [ ] Cosmos DB cuenta `rehavid-cosmos` con 7 containers
- [ ] Storage Account `rehavidstorage` con containers `logos` y `attachments`
- [ ] Logo de Rehavid subido a `logos/rehavid.png`
- [ ] App registrada en Entra ID, anotados `tenant_id`, `client_id`, `client_secret`
- [ ] Redirect URI configurada: `https://operaciones.rehavid.com.co/sso-callback`
- [ ] Permission `User.Read` con admin consent
- [ ] Key Vault `rehavid-kv` con 4 secretos: `cosmos-key`, `blob-connstr`, `entra-client-secret`, `jwt-secret`
- [ ] Application Insights `rehavid-insights` creado, connection string anotado
- [ ] Container Registry `rehavidacr` creado y `az acr login` exitoso

## Fase 3 · Backend (1 día)

- [ ] `docker build` exitoso, imagen subida a ACR como `rehavid-api:v1`
- [ ] App Service Plan `rehavid-plan` con SKU B1
- [ ] Web App `rehavid-api` apuntando a la imagen del ACR
- [ ] Managed Identity asignada al App Service
- [ ] Key Vault policy: App Service tiene `get list` sobre secrets
- [ ] Variables de entorno configuradas (15 settings con referencias a Key Vault)
- [ ] `python -m app.seed` ejecutado contra Cosmos productivo (10 equipos + 5 paquetes + 5 usuarios)
- [ ] `curl https://rehavid-api.azurewebsites.net/health` responde `{"status":"ok"}`
- [ ] `curl https://rehavid-api.azurewebsites.net/docs` muestra Swagger UI
- [ ] Login con `ariel.ramirez@rehavid.com.co` desde Swagger funciona y devuelve JWT

## Fase 4 · Frontend (medio día)

- [ ] HTML editado con `window.REHAVID_USE_BACKEND = true` y `REHAVID_API_URL`
- [ ] Static Web App `rehavid-frontend` desplegado
- [ ] URL temporal de Azure responde y carga el HTML
- [ ] DNS CNAME `operaciones.rehavid.com.co` apuntando al SWA
- [ ] DNS CNAME `api.rehavid.com.co` apuntando al App Service
- [ ] SSL verificado en ambos dominios (cadado verde en navegador)
- [ ] CORS_ORIGINS en el backend incluye `https://operaciones.rehavid.com.co`
- [ ] Login desde frontend productivo funciona
- [ ] Sincronización inicial (`sincronizarDatosIniciales`) trae datos del backend (logs en consola)

## Fase 5 · Predictivo Azure ML (1-2 semanas · cuando haya datos)

- [ ] CSV con 300+ evaluaciones recibido de Rehavid
- [ ] Columnas validadas: `servicio, ciudad, cliente, sector, personas, jornada, antiguedad_cliente, hallazgo_msk`
- [ ] `python entrenamiento_modelo.py` ejecutado, AUC ≥ 0.70
- [ ] Reporte `REPORTE_ENTRENAMIENTO.md` revisado y aprobado por Ariel
- [ ] Azure ML Workspace `rehavid-ml-ws` creado
- [ ] Compute cluster `cpu-cluster` (min 0, max 2 instancias)
- [ ] Modelo registrado como `modelo-riesgo-msk:1`
- [ ] Endpoint `rehavid-risk-endpoint` desplegado
- [ ] `score.py` validado: POST de prueba devuelve `{score, modelo_version, factores}`
- [ ] `AZURE_ML_ENDPOINT` y `AZURE_ML_KEY` agregados al App Service
- [ ] `AZURE_ML_ENABLED=true` activado
- [ ] App Service reiniciado y verificado que el predictivo ya no es mock

## Fase 6 · Producción (1 día)

- [ ] Backups continuos de Cosmos DB activados (Point-in-Time Restore)
- [ ] Firewall de Cosmos: deny by default, allow solo outbound IP del App Service y oficina de Rehavid
- [ ] Alertas en Application Insights:
  - [ ] Error rate > 5% en 5 minutos
  - [ ] Response time p95 > 2 segundos
  - [ ] Cosmos RU consumption > 80%
- [ ] Roles en Azure:
  - [ ] Ariel: Propietario del RG
  - [ ] Ingeniero/devops: Colaborador del RG
  - [ ] Otro Admin (backup): Lector del RG mínimo
- [ ] Documentación interna creada con:
  - [ ] URLs finales
  - [ ] Procedimiento de seed (cómo recrear DB)
  - [ ] Procedimiento de restore desde backup
  - [ ] Quién tiene acceso a cada cosa
- [ ] Pipeline CI/CD GitHub Actions probado con un commit dummy
- [ ] Secret `AZURE_CREDENTIALS` configurado en GitHub repo

## Fase 7 · Onboarding (continuo)

- [ ] Usuarios internos de Rehavid creados con sus emails reales
- [ ] Sesión de training con Liliana, Jhon, Danna (1 hora)
- [ ] Manual de usuario por nivel (4 PDFs: Admin, Operador, Coordinador, Solicitante)
- [ ] Onboarding de ARL SURA con Mónica Vargas
- [ ] Onboarding de JD TASS con Carlos / Patricia / Andrés
- [ ] Definido SLA interno: tiempo de respuesta ante incidencias
- [ ] Definida cadencia de revisión: semanal en Application Insights, mensual de costos

---

## Verificación final · "Está en producción"

Si las siguientes 5 acciones funcionan extremo a extremo desde un dispositivo externo a la oficina de Rehavid, el sistema está en producción:

1. Abrir `https://operaciones.rehavid.com.co`
2. Login con SSO usando una cuenta `@rehavid.com.co`
3. Crear una reserva nueva y verificar que se guarda en Cosmos
4. Cancelar la reserva · verificar que el equipo se libera
5. Ir a Predictivo · verificar que el score viene de Azure ML (no mock)

Si los 5 pasos pasan, listo. Anuncia el go-live.
