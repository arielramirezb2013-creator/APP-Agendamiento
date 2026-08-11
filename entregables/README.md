# Rehavid Operaciones · Paquete de despliegue

**Versión:** 1.0
**Fecha:** Mayo 2026
**Para:** Rehavid S.A.S. · Ariel Ramírez

Este paquete contiene los 4 entregables productivos para llevar la app de operaciones de Rehavid desde el prototipo HTML a producción en Azure.

---

## Estructura

```
entregables/
├── README.md                       ← este archivo
│
├── backend/                        ← Entregable 1 · API FastAPI
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── seed.py
│       ├── db/cosmos.py
│       ├── models/schemas.py
│       ├── services/
│       │   ├── auth.py
│       │   ├── reservas_service.py     ← LÓGICA R002-R009
│       │   └── prediccion_service.py
│       └── routers/
│           ├── auth.py
│           ├── reservas.py
│           ├── equipos.py
│           ├── paquetes.py
│           ├── predictivo.py
│           ├── planes.py
│           └── admin.py
│
├── ml/                             ← Entregable 2 · Modelo predictivo
│   ├── entrenamiento_modelo.py     ← Script que se corre con los datos reales
│   ├── generar_dataset_muestra.py  ← Genera datos sintéticos para testing
│   ├── score.py                    ← Lo que se despliega en Azure ML
│   ├── requirements_azureml.txt
│   ├── data/                       ← (datos generados por el script de muestra)
│   └── modelo/                     ← (artefactos generados por el entrenamiento)
│
├── frontend/                       ← Entregable 3 · HTML productivo
│   └── rehavid_v13_produccion.html
│
├── docs/                           ← Entregable 4 · Documentación de despliegue
│   ├── instrucciones_azure_ingeniero.md
│   └── CHECKLIST_DESPLIEGUE.md
│
└── gestion-proyectos/              ← App de gestión de proyectos (producto aparte)
    ├── README.md                                    ← trazabilidad contra la especificación
    ├── Rehavid_Gestion_Proyectos_v7.html            ← la aplicación
    ├── Mapa_de_usuario_y_validacion_Rehavid.xlsx    ← mapa de usuario y hoja de observaciones
    ├── ESPECIFICACION_FUNCIONAL_v1.1.txt            ← especificación vigente
    ├── ESPECIFICACION_FUNCIONAL_v1.txt
    └── Rehavid_Gestion_Proyectos_v4_baseline.html
```

> **Nota:** `gestion-proyectos/` es un producto independiente del sistema de agendamiento.
> Implementa la *Especificación funcional y flujograma del proceso de gestión de proyectos v1.1*
> (venta → activación → asignación → programación → ejecución → cierre por producto).

---

## Resumen de los 4 entregables

### 1 · Backend FastAPI

API REST en Python 3.11 con FastAPI. Contiene:

- **Lógica de negocio completa R002–R009** (la misma que está en el HTML, ahora en Python).
- Autenticación dual: email/password (clientes externos) + Microsoft Entra ID SSO (empleados de Rehavid).
- 9 routers: `/auth`, `/reservas`, `/equipos`, `/paquetes`, `/predictivo`, `/planes`, `/admin`, `/solicitudes` (O11/O17/O19), `/alertas` (O21).
- Conexión a Cosmos DB con repositorio simple por container.
- Dockerfile multi-stage para deployment en Azure App Service.
- `docker-compose.yml` con Cosmos emulator para desarrollo local.

**Levantar localmente:**

```bash
cd backend/
cp .env.example .env
# Editar .env con credenciales (al menos COSMOS_ENDPOINT y COSMOS_KEY)
docker-compose up
python -m app.seed              # Cargar datos iniciales
# Abrir http://localhost:8000/docs
```

### 2 · Modelo ML predictivo

Script Python para entrenar un modelo Gradient Boosting / XGBoost sobre el histórico de evaluaciones MSK de Rehavid.

- Genera 6 artefactos: el modelo `.pkl`, el explainer SHAP, el reporte de métricas, gráfico de importancia, etc.
- Requiere ≥100 filas (recomendado: 300+) en el CSV de entrada.
- El script `score.py` aparte se sube a Azure ML como endpoint.

**Probar end-to-end con datos sintéticos:**

```bash
cd ml/
pip install -r requirements_azureml.txt scikit-learn shap matplotlib pandas
python generar_dataset_muestra.py --output data/evaluaciones_muestra.csv --n 400
python entrenamiento_modelo.py --data data/evaluaciones_muestra.csv --output modelo/
# Revisa modelo/REPORTE_ENTRENAMIENTO.md
```

**Con datos reales de Rehavid:**

Cuando tengas el CSV con 300+ evaluaciones históricas etiquetadas (`hallazgo_msk` = 0/1), reemplaza el muestra por el real:

```bash
python entrenamiento_modelo.py --data data/evaluaciones_historicas.csv --output modelo/
```

### 3 · Frontend productivo

`rehavid_v13_produccion.html` · un único archivo HTML con toda la app.

Modos:
- **Demo local (default):** funciona con los arrays embebidos · útil para presentaciones y testing offline.
- **Producción (con backend):** agregar `window.REHAVID_USE_BACKEND = true` y `window.REHAVID_API_URL` antes de cargar el HTML.

```html
<!-- Antes del <script> principal -->
<script>
  window.REHAVID_USE_BACKEND = true;
  window.REHAVID_API_URL = 'https://api.rehavid.com.co';
</script>
```

### 4 · Instrucciones de despliegue Azure

`docs/instrucciones_azure_ingeniero.md` · 19 secciones paso a paso con todos los comandos `az cli` necesarios:

1. Pre-requisitos
2. Convención de variables
3. Resource Group
4. Cosmos DB (7 containers)
5. Blob Storage
6. Entra ID (SSO)
7. Key Vault (secretos)
8. Azure ML Workspace + endpoint
9. Application Insights
10. Container Registry
11. App Service (backend)
12. Static Web App (frontend)
13. DNS personalizado
14. CI/CD con GitHub Actions
15. Estimación de costos ($71-$458/mes)
16. Mantenimiento operacional
17. Troubleshooting
18. Checklist post-despliegue
19. Contactos

---

## Orden recomendado de implementación

| Sprint | Tarea | Quién | Días |
|---|---|---|---|
| 1.1 | Revisar backend localmente con docker-compose | Ingeniero | 1 |
| 1.2 | Crear suscripción Azure y registrar app en Entra ID | Admin M365 + Ariel | 1 |
| 1.3 | Desplegar Resource Group, Cosmos, Storage, Key Vault, App Service | Ingeniero | 2 |
| 1.4 | Migrar logo, sembrar usuarios iniciales, hacer login de prueba | Ingeniero + Ariel | 1 |
| 1.5 | Configurar DNS, SSL, frontend en Static Web App | Ingeniero | 1 |
| 1.6 | **Hito 1: app en aire con datos demo** | | |
| 2.1 | Migrar las 57 reservas reales a Cosmos | Ariel + Ingeniero | 1 |
| 2.2 | UAT con Ariel, Danna, Jhon, Liliana | Equipo Rehavid | 5 |
| 2.3 | **Hito 2: piloto operativo con equipo interno** | | |
| 3.1 | Recolectar histórico de evaluaciones MSK (300+ filas etiquetadas) | Ariel | 2-3 sem |
| 3.2 | Entrenar modelo, validar AUC, desplegar en Azure ML | Ingeniero + Ariel | 2 |
| 3.3 | Activar `AZURE_ML_ENABLED=true` en producción | Ingeniero | < 1h |
| 3.4 | **Hito 3: predictivo real en producción** | | |
| 4.1 | Onboarding de usuarios externos (ARL SURA, JD TASS) | Ariel | continuo |
| 4.2 | Monitoreo, ajustes, reentrenamiento mensual del modelo | Ingeniero + Ariel | continuo |

---

## Lo que sí funciona en producción con este código

- Las 8 observaciones del Excel (R002 a R009) están implementadas y probadas.
- Bloqueo de reservas cuando se agota el stock.
- Estados de equipo: disponible / en_uso / en_preparacion / en_mantenimiento / en_transito.
- Trazabilidad por serial único de cada equipo (53 accesorios contemplados).
- Reprogramación y cancelación de reservas con historial de auditoría.
- Paquetes que descuentan múltiples equipos simultáneamente.
- Confirmación de retorno con preparación (lavado de camisetas Xsens, etc.).
- 4 niveles de permisos (Admin → Operador → Coordinador → Solicitante).
- Login dual: email/password y SSO con Microsoft Entra ID.
- Endpoint predictivo con fallback automático: usa Azure ML si está habilitado, sino devuelve mock con la misma estructura. El frontend no nota la diferencia.

## Lo que requiere trabajo humano antes del go-live

- **Datos históricos del predictivo:** Rehavid debe entregar un CSV con 300+ evaluaciones MSK etiquetadas (hallazgo sí/no) para que el modelo aprenda. Sin esto, el predictivo muestra el mock.
- **Credenciales Azure:** Rehavid (Ariel) debe crear/proveer la suscripción Azure y el admin de Microsoft 365 debe registrar la app en Entra ID.
- **Migración de datos:** las 57 reservas actuales deben migrarse del Excel a Cosmos vía el seed script o un import puntual.
- **UAT con usuarios reales:** 1-2 semanas con Liliana, Jhon, Danna probando flujos reales antes de abrir a clientes externos.

## Lo que es incierto y vale la pena nombrar

- **Costos reales en Azure:** las cifras de la guía son estimaciones; la factura real depende del tráfico y consumo de RU en Cosmos.
- **AUC real del modelo:** sobre datos sintéticos da ~0.72. Con datos reales puede dar 0.70-0.85 dependiendo de la calidad del histórico.
- **Integraciones futuras:** si Rehavid quiere conectar con sistemas existentes (ARL SURA, JD TASS), eso es trabajo adicional no contemplado aquí.

---

## Verificación rápida del paquete

Antes de empezar a desplegar, valida que todo está aquí:

```bash
# Backend Python (debe pasar sin errores)
cd backend/
python -m py_compile $(find app -name "*.py")
echo "Backend OK"

# Frontend (debe encontrar ambos modos)
grep -q "REHAVID_USE_BACKEND" frontend/rehavid_v13_produccion.html && echo "Frontend OK"

# Docs
test -f docs/instrucciones_azure_ingeniero.md && echo "Docs OK"

# ML
cd ml/
python -m py_compile entrenamiento_modelo.py score.py generar_dataset_muestra.py
echo "ML OK"
```

Si los 4 echo aparecen, el paquete está íntegro.
