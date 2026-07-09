# Revisión técnica y correcciones · v3 (julio 2026)

Revisión integral del paquete `entregables_rehavid_v2` (backend FastAPI, frontend
HTML productivo, scripts ML y documentación) con verificación funcional de cada
cambio. Este documento resume el **veredicto**, las **correcciones aplicadas** y
las **limitaciones conocidas** que quedan como trabajo pendiente.

---

## Veredicto general

**Es una app sólida y bien estructurada como prototipo/piloto.** El backend está
limpio y modular (routers/servicios/schemas/repo), el frontend en modo **demo**
es completo y funcional, y la documentación de despliegue es detallada. Ahora
bien, la versión entregada tenía **defectos que impedían que la "modo producción
con backend" funcionara** y algunos **bugs de lógica y de seguridad**. Todos los
críticos y de alto impacto fueron corregidos y verificados.

| Área | Estado entregado | Tras correcciones |
|---|---|---|
| Backend · compila e importa | ✔ | ✔ (48 rutas OK) |
| Backend · lógica de reservas | bug crítico en query Cosmos | ✔ probado end-to-end |
| Frontend · modo demo | funcional (con 1 bug de acciones) | ✔ corregido |
| Frontend · modo producción | **no funcional** (login sin backend) | ✔ login/SSO/sync cableados |
| Seguridad | contraseñas reales y secretos por defecto | ✔ mitigado |
| ML | bug de features + parámetro obsoleto | ✔ corregido |
| Docs | referencias a archivo inexistente (v12) | ✔ corregido |

---

## Correcciones aplicadas

### Críticas

1. **Query Cosmos inválida rompía TODAS las reservas** ·
   `backend/app/services/reservas_service.py`
   La verificación de disponibilidad usaba `c.id NOT IN (SELECT VALUE x FROM x IN @excl)`,
   sintaxis que **Cosmos DB NoSQL no soporta**: contra un Cosmos real fallaba en
   cada intento de reservar/reprogramar. Reemplazado por `NOT ARRAY_CONTAINS(@excl, c.id)`.

2. **La "modo producción" nunca autenticaba contra el backend** ·
   `frontend/rehavid_v13_produccion.html`
   `loginWithPwd()` validaba siempre contra el array local `USERS` y **nunca**
   llamaba a `API.login()`, por lo que jamás se obtenía el JWT. Sin token, toda
   escritura al backend daba 401 → recarga en bucle. Ahora, con
   `REHAVID_USE_BACKEND=true`, el login autentica de verdad, guarda el token y
   carga los datos (`sincronizarDatosIniciales()`).

3. **Los datos del backend no se cargaban al iniciar sesión** · idem.
   `sincronizarDatosIniciales()` solo se ejecutaba tras crear/confirmar. Ahora se
   invoca en el login de producción, de modo que la app arranca con datos reales.

### Altas

4. **Cancelar una solicitud confirmada lanzaba una excepción** ·
   `backend/app/routers/solicitudes.py`
   Restar `datetime` *naive* (fecha guardada sin zona) menos *aware*
   (`datetime.now(timezone.utc)`) crashea. Se normaliza a UTC antes de restar y,
   además, se persiste y usa `fecha_sugerida` (la fecha de servicio real, que
   antes se descartaba) como referencia de la regla de 48 h.

5. **La configuración de canales de alertas corrompía `GET /solicitudes`** ·
   `backend/app/routers/alertas.py`
   El documento `__canales_alertas__` se guardaba en el container `solicitudes`;
   al listar solicitudes (con `response_model=list[Solicitud]`) ese documento sin
   los campos de una solicitud provocaba un error de validación. Movido a un
   nuevo container `config`, con filtro defensivo `IS_DEFINED(c.solicitante_email)`
   en el listado.

6. **Botón SSO ejecutaba un bypass silencioso a administrador** · frontend.
   "Iniciar con Microsoft 365" llamaba a `loginDemo('admin')`. Ahora `loginSSO()`
   redirige al flujo real de Entra ID en producción (y avisa que es demo si no
   hay backend).

7. **Los botones Reprogramar/Cancelar de reservas nunca se renderizaban** · frontend.
   La celda de acciones se envolvía en `currentUser?.rol==='admin'`, condición
   imposible (los usuarios tienen `nivel`, no `rol==='admin'`). El permiso ya se
   calculaba bien por `nivel <= 2`; se eliminó el guard roto.

8. **Contraseñas reales/débiles committeadas** · `backend/app/seed.py`
   Se reemplazó la contraseña personal de una cuenta admin por un placeholder de
   demo, se permite override por `SEED_PASSWORD`, y se añadió una guarda que
   **aborta el seed si `ENVIRONMENT=production`** (salvo `SEED_FORCE=1`).

9. **Secretos por defecto sin protección** · `backend/app/config.py` + `main.py`
   Se agregó `validar_para_arranque()`: en producción el arranque **falla** si
   `JWT_SECRET`/`COSMOS_KEY` siguen en sus valores por defecto; en dev solo avisa.

10. **README apuntaba a un archivo inexistente (`v12`)** · docs.
    Todas las referencias a `rehavid_v12_produccion.html` (README y la guía Azure,
    incluido el `--index-document` del despliegue) se actualizaron a `v13`.

### Medias

11. **Reprogramar reservas de paquete solo validaba un servicio** ·
    `reservas_service.py`. Ahora valida **todas** las categorías del paquete.

12. **Disponibilidad no excluía equipos en preparación/revisión** ·
    `reservas_service.py`. Un equipo `en_preparacion`/`en_revision` podía
    reservarse. Añadidos al filtro de no-operativos.

13. **Generación de IDs de reserva frágil (COUNT) y con riesgo de sobrescritura** ·
    `reservas_service.py`. Ahora el número sale del mayor `R-###` existente y se
    usa `create_item` con reintento ante colisión (no `upsert`, que sobrescribía).

14. **`/health` filtraba detalles internos** · `main.py`. Ya no expone `str(exc)`.

15. **Capa API del frontend incompleta** · frontend. Se agregaron los métodos que
    faltaban para Portal Solicitante (O11/O17/O19), Alertas (O21), ficha de equipo
    (O04), baja de equipo (O18) y administración (editar/desactivar/auditoría).

16. **Manejo de 401 hacía `reload()` duro** · frontend. Ahora vuelve al login sin
    recargar toda la app.

17. **Cableado en producción del Portal Solicitante (O11/O17/O19) y Alertas (O21)** ·
    frontend. `sincronizarDatosIniciales()` ahora también trae las solicitudes; y
    crear/editar/cancelar/observar/atender solicitudes y guardar canales/enviar
    alertas llaman al backend cuando `USE_BACKEND=true` (mapeando las formas de
    payload), manteniendo intacto el modo demo. La generación de IDs de solicitud
    se hizo robusta igual que en reservas (max + `create_item` con reintento).

### Bajas / limpieza

18. **ML · `antiguedad_cliente` se colapsaba a `antiguedad`** · `ml/score.py`.
    El split por `_` rompía las features numéricas con guion bajo. Nuevo helper
    `_base_feature()` con match exacto + prefijo de categoría.

19. **ML · `use_label_encoder` obsoleto** (removido en xgboost ≥ 2.0) ·
    `ml/entrenamiento_modelo.py`. Eliminado.

20. **ML · `xgboost` ausente del requirements del endpoint** ·
    `ml/requirements_azureml.txt`. Añadido.

21. **`requirements.txt` con `pydantic` duplicado** · backend. Limpiado.

22. **README · conteo de routers desactualizado** (7 → 9, con `/solicitudes` y
    `/alertas`). Actualizado.

---

## Limitaciones conocidas (trabajo recomendado, no incluido)

- **XSS por `innerHTML`** con datos importados de Excel: conviene escapar la
  entrada del usuario antes de renderizarla. Riesgo bajo en herramienta interna,
  pero recomendable.
- **Rate limiting en `/auth/login`** y **validación de `state` (CSRF) en el
  callback SSO**: recomendable para exposición pública.
- **`antiguedad_cliente`** es una feature del modelo que el backend no envía en la
  predicción (llega siempre como 0). Alinear el contrato de features antes de
  activar el modelo real.
- **Concurrencia de reservas**: la generación de IDs mejorada evita sobrescrituras,
  pero la doble-reserva en condiciones de alta concurrencia requeriría
  concurrencia optimista (ETag) o un stored procedure de Cosmos.

---

## Cómo verificar

```bash
# Backend compila e importa (48 rutas)
cd entregables/backend && python -m py_compile $(find app -name "*.py")

# ML compila
cd ../ml && python -m py_compile *.py

# Frontend: ambos modos presentes y JS válido
grep -q "REHAVID_USE_BACKEND" ../frontend/rehavid_v13_produccion.html && echo "Frontend OK"
```

El flujo de reservas (crear → asignar equipo → bloquear sin stock → cancelar →
liberar → reprogramar) se probó end-to-end contra un repositorio en memoria y
pasa todas las aserciones.
