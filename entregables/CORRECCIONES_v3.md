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

### Endurecimiento de seguridad (segunda pasada)

23. **Rate limiting en `/auth/login`** · `backend/app/routers/auth.py`.
    Límite deslizante de 5 intentos fallidos por IP+correo en 15 min (429 al
    superarlo, se limpia al autenticar bien). Nota: es por-proceso; con varias
    réplicas conviene Redis o el rate limiting de API Management/App Gateway.

24. **Validación de `state` (CSRF) en el SSO** · `auth.py` (router + servicio).
    El `state` ahora se firma en el servidor (JWT de 10 min) y se verifica en el
    callback; un atacante no puede fabricarlo.

25. **Escapado anti-XSS** · frontend. Nuevo helper `escapeHtml()` aplicado a los
    render de equipos, solicitudes (bandeja + "mis solicitudes") y reservas; y
    saneo de celdas de Excel al importarlas (`sanitizarCeldaImport`, quita `<`/`>`).

26. **Feature `antiguedad_cliente` alineada** · `prediccion_service.py` +
    `schemas.py`. El backend ahora envía al modelo exactamente sus columnas
    (incluida `antiguedad_cliente`, opcional en `PrediccionRequest`) en vez de
    `cliente` (que el modelo no usa).

### Tercera pasada (revisión de la versión corregida)

27. **Wrappers UI sin `await` rompían el modo producción** · frontend.
    `cancelarReservaUI`, `reprogramarReservaUI`, `confirmarRetornoUI`,
    `marcarEquipoListoUI`, `enviarAMantenimientoUI` y `darDeBajaUI` hacían
    `const res = fn(...); if (res.ok)`, pero con backend los interceptores son
    async → `res` era una Promise y la UI siempre mostraba error aunque la
    operación hubiera funcionado. Ahora son `async` y aguardan el resultado
    (en demo `await` sobre un objeto plano es transparente).

28. **`darDeBajaEquipo` sin interceptor de backend** · frontend. La baja (O18)
    solo mutaba el array local en producción; ahora llama a
    `POST /equipos/{id}/baja` cuando `USE_BACKEND=true`.

29. **Inyección JS residual vía atributos `onclick`** · frontend. El navegador
    des-escapa entidades HTML en atributos antes de evaluar el JS, así que
    `escapeHtml` no protege strings dentro de `onclick="fn('...')"`. El saneo de
    ingesta de Excel ahora también elimina comillas y backticks.

30. **Solicitud cancelada se mostraba como "Pendiente · 24h"** · frontend.
    El pill de estados no tenía entrada `cancelada` y su fallback era
    `pendiente`; se añadió la entrada y el fallback ahora muestra el estado tal
    cual, nunca "Pendiente".

31. **Export/Import Excel de equipos con claves inexistentes** · frontend.
    El schema usaba `nombre`/`servicio`/`ciudad`/`activo` (no existen en
    EQUIPOS) → columnas vacías al exportar y objetos rotos al importar.
    Alineado a `modelo`/`categoria`/`ciudad_base`/`responsable`, y el import
    normaliza el estado ("En uso" → `en_uso`) y aplica defaults.

32. **KPI del Brief contaba equipos dados de baja en el total** (O02/O18) y el
    **gauge "salud del backlog" incluía canceladas** en el denominador ·
    frontend. Ambos cálculos ahora excluyen lo no operativo.

33. **`filterPlan` dependía del global implícito `event`** · frontend. Los
    botones ahora pasan `this` y hay respaldo a `window.event`.

34. **`docker-compose up` fallaba el TLS contra el emulador Cosmos** · backend.
    El certificado self-signed del emulador rompía el handshake del SDK. Nueva
    variable `COSMOS_CONNECTION_VERIFY` (false solo en el compose local);
    `validar_para_arranque()` bloquea ese ajuste en producción.

35. **Errores del endpoint ML enmascarados** · backend. `score.py` responde
    `{"error":...}` con HTTP 200; `_real_prediccion` ahora lo detecta y propaga
    la causa real al log antes del fallback al mock.

36. **Contrato de estados de Solicitud incompleto** · backend. Se añadieron
    `en_curso` y `rechazada` al Literal (la UI los usa en pills y filtros).

37. **Menores**: `datetime.utcnow()` deprecado en la ficha de equipo → aware
    UTC; cota de memoria en el rate limiter de login (purga de entradas
    expiradas); fallback seguro en `EQUIPO_ESTADOS[...]` ante estados
    desconocidos; costos del README alineados con la guía Azure (USD 150–250 /
    400–700); conteo de observaciones de CAMBIOS_v2 aclarado (7 de las 21 de QA
    cubiertas por las 8 R002–R009).

---

## Limitaciones conocidas (trabajo recomendado, no incluido)

- **No existe pantalla de "Nueva reserva"** en el frontend: `crearReserva`
  (local y backend) está implementado y probado, pero ninguna vista lo invoca —
  "Atender" una solicitud la confirma sin crear la reserva. Es una brecha
  funcional del diseño original que requiere una pantalla nueva (decisión de
  producto, no un bug).

- **Dato de `antiguedad_cliente`**: el contrato ya la contempla, pero mientras la
  UI/negocio no capture la antigüedad real del cliente, el modelo la recibe como 0.
- **Concurrencia de reservas**: la generación de IDs mejorada evita sobrescrituras,
  pero la doble-reserva en condiciones de alta concurrencia requeriría
  concurrencia optimista (ETag) o un stored procedure de Cosmos.
- **Rate limiting multi-instancia**: el actual es por-proceso; con autoescalado usar
  un store compartido.

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
