# Cambios · v2 (mayo 2026)

## Resumen

Esta versión incorpora **21 observaciones** identificadas en la revisión de QA por parte de Rehavid sobre la versión inicial. De las 21:

- **7 ya estaban resueltas** en la v1 (R002-R009 del Excel original)
- **14 fueron implementadas** en esta entrega

## Las 14 observaciones aplicadas

| Obs | Tema | Implementación |
|-----|------|---------------|
| O02 | KPI Equipos del Brief | Muestra `disponibles / total` (ej: `8 / 10`) en tiempo real, no el total estático. |
| O04 | Ficha individual del equipo | Modal completo al clic en serial: métricas de uso, accesorios, historial de reservas, próxima reserva. Endpoint backend: `GET /equipos/{id}/ficha`. |
| O06 | Bug `e.nombre` undefined | Corregido el referenciado `e.nombre` (que no existe en EQUIPOS) por `e.categoria + e.modelo`. Aplica al portal solicitante y al motor de findings. |
| O07 | Tumeke en hoja de stock | Tarjeta especial "Software / IA · Sin unidad física" con badge "Uso ilimitado". Visible en stock pero excluido del conteo de equipos disponibles. |
| O08 | Paquetes descuentan múltiples equipos | Nuevo campo `equipos_ids[]` en Reserva. Al crear con paquete, asigna UN equipo por categoría requerida. Al cancelar, libera TODOS. SQL Cosmos usa `ARRAY_CONTAINS`. |
| O09 | Disponibilidad real en paquetes | Badge tri-estado en cada tarjeta de paquete: **Disponible** / **Parcialmente ocupado** / **No disponible**, calculado cruzando equipos requeridos vs reservas activas. Muestra fecha próxima de disponibilidad total. |
| O10 | Indicador en formulario nueva solicitud | Al seleccionar servicio + ciudad + fecha, muestra preview con saturación (alta/media/baja) y cantidad de equipos libres. Alerta sin bloquear. |
| O11 | Acciones del solicitante | Tabla "Mis solicitudes" con columna Acciones: **Editar/Cancelar** (pendiente), **Observación/Cancelar 48h** (confirmada), **solo lectura** (finalizada). Endpoints: `PUT /solicitudes/{id}`, `POST /solicitudes/{id}/cancelar`, `POST /solicitudes/{id}/observacion`. |
| O16 | Accesorios dinámicos en formulario | Al elegir servicio en nueva solicitud, lista de accesorios típicos del kit aparece con checkboxes y cantidades editables. Definidos en `ACCESORIOS_POR_SERVICIO`. |
| O17 | Notificación al operador | **Badge numérico** en menú "Reservas" con solicitudes pendientes sin atender. **Bandeja de entrada** en la vista Reservas con las últimas 5 pendientes, marca urgentes (>12h). Endpoint `GET /solicitudes/badge/pendientes`. |
| O18 | Estados intermedios + de baja | Nuevos estados: `en_revision` (post-uso, requiere revisión) y `de_baja` (retirado de operación). Botón "Dar de baja" solo para Admin Global, con verificación de reservas activas. Endpoint `POST /equipos/{id}/baja`. |
| O19 | Datos del profesional | 6 campos obligatorios en nueva solicitud: cantidad de profesionales, perfil/cargo, nombre, especialidad, teléfono, correo. Persistidos en `Solicitud.profesional`. |
| O20 | Permisos sobre paquetes | Botones Editar/Eliminar de paquete solo visibles para nivel ≤ 2. Solicitantes (nivel 4) solo pueden elegir paquetes existentes. |
| O21 | Alertas logísticas externas | Módulo completo: configuración de canales (WhatsApp, correo, Teams), detección automática de 4 tipos de alerta (tránsito salida, retorno vencido, mantención próxima, preparación pendiente), botón "Enviar" por alerta. Endpoints: `GET /alertas/canales`, `PUT /alertas/canales`, `GET /alertas/detectadas`, `POST /alertas/enviar`. Integración real con APIs externas queda como TODO documentado en el código. |

## Archivos modificados/creados

### Frontend simulación
- `rehavid_operaciones_v12.html` (527 KB) — versión simulación con las 14 observaciones aplicadas. JS 241,910 chars, validado.

### Frontend productivo
- `frontend/rehavid_v13_produccion.html` (537 KB) — combina las 14 observaciones + capa API de backend. Modo dual: demo local o producción con `window.REHAVID_USE_BACKEND = true`.

### Backend FastAPI
- **Modificados:** `services/reservas_service.py` (lógica `equipos_ids[]` + `dar_de_baja_equipo`), `models/schemas.py` (nuevos schemas Solicitud, ProfesionalRequerido, AccesorioSolicitado, ConfiguracionCanales, etc.), `routers/equipos.py` (ficha y baja), `main.py` (registro de nuevos routers), `requirements.txt` (email-validator agregado).
- **Nuevos:** `routers/solicitudes.py` (8 endpoints O11/O17/O19), `routers/alertas.py` (4 endpoints O21).
- **Endpoints REST totales:** 44 (era 32).

## Tests pasados

```
v12 simulación · JS válido, 14/14 observaciones verificadas funcionalmente.
Backend · 22 archivos Python compilan, 44 endpoints REST registrados.
O08 (paquetes equipos_ids[]) probado in-memory: asigna múltiples · libera todos al cancelar ✓
O18 (de_baja) probado: bloquea reservas + filtro en verificarDisponibilidad ✓
```

## Próximos pasos para Rehavid

1. Validar el HTML de simulación `rehavid_operaciones_v12.html` con el equipo (Liliana, Jhon, Danna).
2. Recolectar feedback sobre los 14 cambios — especialmente O17 (bandeja de entrada) y O21 (canales de alertas).
3. Decidir si los canales de alertas son críticos para el día 1 del piloto, o si se difieren a la fase 2 (la integración real con WhatsApp Business API requiere cuenta Meta verificada · ~3 semanas).
4. Si validan el v12, levantar el v13_produccion en local con `docker-compose up` y verificar que el frontend habla con el backend correctamente.
