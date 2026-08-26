# -*- coding: utf-8 -*-
"""Historia de usuario · Rehavid Gestión de proyectos v16 (VERSIÓN FINAL).
Ronda de aceptación: cada cargo verifica que sus hallazgos de la tercera ronda
quedaron aplicados, valida el modelo de administradores y firma la aceptación."""

PASOS = {
    0:  "Épica 0 · Modelo de administradores y accesos",
    1:  "Épica 1 · Venta y registro (botón «Crear»)",
    6:  "Épica 2 · Aceptación y negociación",
    7:  "Épica 3 · Requisitos de información",
    8:  "Épica 4 · Plan de trabajo final",
    9:  "Épica 5 · Ejecución («Actualizar» e «Hitos»)",
    12: "Transversal · Resumen, Actividades y Calendario",
    13: "Aceptación de la versión final",
}

ORDEN_ROLES = [
    ("CEO", "CEO"), ("Gerente", "Gerente"),
    ("Director de Proyectos", "Director de Proyectos"),
    ("Jefe de Operaciones", "Jefe de Operaciones"),
    ("Supervisor Contactabilidad", "Supervisor Contactabilidad"),
    ("Gestor de Datos 1", "Gestor de Datos 1"),
    ("Gestor de Datos 2", "Gestor de Datos 2"),
    ("Diseñador", "Diseñador"),
]

ACEPTACION = (13, "Firmar la aceptación de la versión final",
  "Termine las verificaciones de esta pestaña y diligencie su fila en la tabla «Decisión de salida a producción» "
  "de la pestaña «Resumen de observaciones» (Sí · Con ajustes menores · No), con nombre y fecha.",
  "La v16 aplica los cambios acordados de la tercera ronda. Si algo quedó mal aplicado, regístrelo aquí; si todo "
  "está conforme, esta es la versión que sale a producción (piloto controlado con respaldo JSON semanal).")

ADMIN_CHECK = (0, "Verificar su acceso de administrador",
  "Con su sesión: confirme que ve la sección «Configuración» (Parametrización y Bases y auditoría) en la barra "
  "lateral, los valores en dinero en el Resumen y las tarjetas, y el botón azul «Crear».",
  "Los administradores son CEO, Gerente, Director de Proyectos y Jefe de Operaciones: crean proyectos, ven costos "
  "y administran la configuración y las bases.")

NO_ADMIN_CHECK = (0, "Verificar los accesos de su cargo",
  "Con su sesión: confirme que la barra lateral NO muestra Configuración, que ningún módulo muestra valores en "
  "dinero (tarifas, valores contratados o facturados) y que el registro de ventas está bloqueado con explicación.",
  "Su cargo ve y gestiona todo lo operativo (Resumen, Actividades, Mi trabajo, Calendario y su ficha); los costos "
  "y la configuración son de los administradores.")

ROLES = {

"CEO": dict(nombre="CEO", responsabilidad=(
    "Administrador. Decide la salida a producción."), filas=[
 ADMIN_CHECK,
 (0, "Cargar una base como administrador",
  "Cargue Base_BI.xlsx desde Bases y auditoría; observe el resumen y el aviso «Base cargada con éxito». Revise en "
  "la hoja Productos del Excel la columna nueva «responsable» (la fase 2 trae «Gestor de Datos 2» de ejemplo).",
  "La carga es tarea de administradores; la columna responsable permite dirigir un producto a un cargo puntual "
  "desde el Excel (p. ej. repartir entre los Gestores de Datos)."),
 (6, "Resolver desde «Para resolver como dirección»",
  "En Mi trabajo resuelva uno de los casos demo con las cuatro decisiones.",
  "La sección concentra los ajustes de todos los cargos; cada decisión queda en el historial."),
 (8, "Verificar la integridad comercial del plan",
  "Abra la ficha de DEM-001 → sección 4 → nueva versión: cambie las horas de un producto y apruebe; luego revise "
  "el producto y la bitácora.",
  "Las horas del plan quedan como «horas planificadas»; las horas vendidas NO cambian (condición de la 3.ª ronda). "
  "La bitácora registra «horas planificadas», no «horas»."),
 (8, "Verificar el bloqueo por coordinación",
  "Intente aprobar el plan de DEM-003 (su coordinación está En ajuste).",
  "La aprobación se bloquea explicando que la coordinación debe resolverse primero (condición de la 3.ª ronda)."),
 (12, "Verificar la restricción de los demás cargos",
  "Cambie la sesión a Gestor de Datos 1: confirme que no ve Configuración ni valores en dinero y que "
  "Parametrización muestra «Módulo restringido» con la explicación.",
  "La restricción es integral: barra lateral, columnas de valor, tarifas de tarjetas y campo Valor facturado."),
 ACEPTACION,
]),

"Gerente": dict(nombre="Gerente", responsabilidad=(
    "Administrador. Carga bases, resuelve ajustes y aprueba planes."), filas=[
 ADMIN_CHECK,
 (0, "Cargar la Base General",
  "Cargue Base_General.xlsx y verifique el resumen, el toast de éxito y los catálogos actualizados.",
  "El proyecto con activar = SI queda Activo con sus asignaciones; nada de lo existente se borra."),
 (6, "Negociar con contrapropuesta",
  "Resuelva un caso de «Para resolver como dirección» con contrapropuesta.",
  "La ronda queda en el historial y la tarjeta del líder muestra «decide la administración» mientras espera."),
 (7, "Verificar la solicitud consolidada obligatoria",
  "En una ficha con requisitos definidos use «Solicitud consolidada» e intente guardar sin contacto o sin evidencia.",
  "Contacto y evidencia son obligatorios y la opción «Sin registrar» ya no existe (hallazgo del Jefe, 3.ª ronda)."),
 (8, "Comparar venta contra plan",
  "En la sección 4 de la ficha revise la tabla comparativa: la columna del plan dice «Horas plan».",
  "El plan opera con horas planificadas y la venta conserva su línea base comercial."),
 (12, "Descargar conjuntos filtrados",
  "Aplique un filtro y descargue Productos «Filtrado» desde Bases y auditoría.",
  "La descarga respeta el corte visible (RN-07)."),
 ACEPTACION,
]),

"Director de Proyectos": dict(nombre="Director de Proyectos", responsabilidad=(
    "Administrador. Sus dos condiciones de la 3.ª ronda están aplicadas."), filas=[
 ADMIN_CHECK,
 (8, "Cerrar su condición 1: horas vendidas intocables",
  "En un plan nueva versión cambie las horas de un producto, apruebe y revise el producto y la bitácora.",
  "APLICADO: el plan guarda «horas planificadas»; las horas vendidas no cambian y cualquier ajuste comercial "
  "tendrá su propio flujo. Verifíquelo y ciérrelo o reábralo."),
 (8, "Cerrar su condición 2: la coordinación bloquea el plan",
  "Intente aprobar el plan de DEM-003 con su coordinación En ajuste.",
  "APLICADO: la aprobación se bloquea hasta resolver la coordinación."),
 (6, "Verificar «decide la administración»",
  "Revise su coordinación En ajuste de DEM-003 y un producto En ajuste.",
  "APLICADO: ambas tarjetas dicen quién tiene la siguiente acción («decide la administración»); las coordinaciones "
  "pendientes y en ajuste aparecen antes que las aceptadas."),
 (7, "Verificar el control de «Recibido»",
  "En el editor de requisitos marque uno como Recibido sin diligenciar la ubicación.",
  "APLICADO: la aplicación exige registrar dónde queda alojada la información; la ubicación queda en el requisito."),
 (9, "Verificar la ponderación de hitos",
  "Abra «Hitos» de su producto de mediciones.",
  "APLICADO: la nota explica que el avance global se pondera por las horas asignadas de cada hito."),
 (12, "Verificar su nuevo acceso de administrador",
  "Abra Parametrización y Bases y auditoría desde la barra lateral.",
  "Como administrador ahora accede a la configuración, ve los costos y resuelve ajustes desde su propia bandeja."),
 ACEPTACION,
]),

"Jefe de Operaciones": dict(nombre="Jefe de Operaciones", responsabilidad=(
    "Administrador. Sus hallazgos de la 3.ª ronda están aplicados."), filas=[
 ADMIN_CHECK,
 (7, "Cerrar su hallazgo de la solicitud consolidada",
  "Use «Solicitud consolidada» e intente guardar sin contacto o sin evidencia.",
  "APLICADO: ambos son obligatorios y «Sin registrar» desapareció; la gestión queda trazable."),
 (12, "Cerrar su hallazgo del calendario",
  "En Calendario haga clic en un día con uno o dos eventos (no use «+N más»).",
  "APLICADO: el día completo abre su detalle siempre, con la misma experiencia sin importar cuántos eventos tenga."),
 (6, "Verificar el orden de sus coordinaciones",
  "Abra Mi trabajo con varias coordinaciones.",
  "APLICADO: pendientes y en ajuste aparecen antes que las aceptadas, y su sección «Para resolver» concentra los "
  "ajustes de los líderes sin cambiar el selector de Rol."),
 (9, "Cerrar su hallazgo del sello de cierre",
  "Abra la ficha de DEM-004 (cerrado).",
  "APLICADO: la franja superior muestra «Cierre · Automático» con la fecha, de forma persistente."),
 (12, "Verificar el atajo «Mi cargo»",
  "En Actividades pulse la píldora «Mi cargo».",
  "APLICADO: el tablero y la lista quedan acotados a su cargo con un clic, y el chip del filtro lo muestra."),
 ACEPTACION,
]),

"Supervisor Contactabilidad": dict(nombre="Supervisor Contactabilidad", responsabilidad=(
    "Líder de cápsulas. Verifica sus accesos y sus hallazgos."), filas=[
 NO_ADMIN_CHECK,
 (6, "Revisar sus cápsulas",
  "En Mi trabajo revise sus dos tarjetas (en curso y pendientes con 120 personas a impactar).",
  "Su bandeja solo trae lo suyo; el contacto principal del proyecto aparece en la tarjeta."),
 (9, "Actualizar avance en cápsulas sin hitos",
  "En la cápsula pendiente: acéptela y use «Actualizar» tipo Avance moviendo el porcentaje.",
  "Sin hitos, el porcentaje manual actualiza el avance; con hitos, manda «Hitos» (y el formulario lo dice)."),
 (12, "Cerrar su hallazgo del cierre del maestro",
  "Abra la ficha de un proyecto cerrado (DEM-004).",
  "APLICADO: la ficha muestra el sello «Cierre · Automático» con su fecha; el maestro cierra solo cuando TODOS "
  "los productos cierran — usted solo declara los suyos."),
 (12, "Verificar el calendario y lo no programado",
  "Haga clic en un día del calendario y revise «Actividad no programada».",
  "El día abre su detalle; lo pendiente de fechas se abre para comprometerlas."),
 ACEPTACION,
]),

"Gestor de Datos 1": dict(nombre="Gestor de Datos 1", responsabilidad=(
    "Líder de BI. Su prioridad n.º 1 de la 3.ª ronda está aplicada."), filas=[
 NO_ADMIN_CHECK,
 (0, "Cerrar su prioridad 1: responsable desde el Excel",
  "Abra Base_BI.xlsx, hoja Productos: la columna «responsable» permite escribir el cargo (la fase 2 trae «Gestor "
  "de Datos 2»); pida a un administrador cargarla y revise Mi trabajo con la sesión de GD2.",
  "APLICADO: la base dirige cada producto al gestor elegido; si va vacío, asigna el motor."),
 (6, "Cerrar su prioridad 1: reasignación directa entre gestores",
  "En su tarjeta use «Reasignar cargo»: las opciones son Gestor de Datos 1 y 2, sin pasar por la administración.",
  "APLICADO: los gestores se reparten el trabajo entre sí según su carga; el movimiento queda en bitácora y la "
  "asignación vuelve a «Pendiente de aceptación»."),
 (7, "Cerrar su hallazgo de la ubicación",
  "En el editor de requisitos marque uno como Recibido: la aplicación exige la ubicación (columna nueva).",
  "APLICADO: dónde queda alojada la información es obligatorio al recibir, y queda visible en la tabla."),
 (9, "Cerrar su hallazgo de la ponderación de hitos",
  "Abra «Hitos» de su tablero.",
  "APLICADO: la nota explica la ponderación por horas asignadas (un hito de 40 h pesa el doble que uno de 20 h)."),
 ACEPTACION,
]),

"Gestor de Datos 2": dict(nombre="Gestor de Datos 2", responsabilidad=(
    "Gestor gemelo. Su prioridad n.º 1 de la 3.ª ronda está aplicada."), filas=[
 NO_ADMIN_CHECK,
 (6, "Cerrar su prioridad 1: reasignarse trabajo entre gestores",
  "Acepte su tablero demo y pruebe «Reasignar cargo» hacia Gestor de Datos 1; luego pida a GD1 devolvérselo.",
  "APLICADO: la reasignación entre gestores es directa, según la carga interna; todo queda en bitácora."),
 (0, "Verificar la columna responsable en la base",
  "Revise en Base_BI.xlsx la fase 2 con «Gestor de Datos 2» en la columna responsable.",
  "APLICADO: al cargarla, el producto llega directo a su bandeja."),
 (9, "Actualizar su producto",
  "Con la asignación aceptada, registre un avance con «Actualizar».",
  "Solo su cargo (o un administrador) actualiza su producto."),
 ACEPTACION,
]),

"Diseñador": dict(nombre="Diseñador", responsabilidad=(
    "Líder de diseño. Sus hallazgos de claridad están aplicados."), filas=[
 NO_ADMIN_CHECK,
 (6, "Cerrar su hallazgo del contacto",
  "Abra Mi trabajo: la línea superior de su tarjeta trae el contacto principal con su correo, sin abrir la ficha.",
  "APLICADO: contacto visible a un clic (su N°4 de la 3.ª ronda)."),
 (6, "Entender los botones según el estado",
  "Su producto demo está Suspendido: por eso ofrece «Reanudar» (no «Aceptar» ni «Declarar completado»). Reanúdelo "
  "y observe cómo cambian los botones: «Actualizar», «Hitos», «Declarar completado».",
  "Cada tarjeta muestra solo las acciones válidas para su estado; el estado se mueve con esas acciones, nunca "
  "editándolo directamente (así se protege la trazabilidad). La guía lo explica en «Mi trabajo»."),
 (9, "Completar el diseño",
  "Con el producto En ejecución, use «Declarar completado» con fecha real, horas y entregable.",
  "El botón aparece en productos Programados o En ejecución; con requisitos y plan resueltos, cierra automático."),
 (12, "Cerrar su hallazgo de «solo mi rol»",
  "En Actividades pulse la píldora «Mi cargo».",
  "APLICADO: el tablero y la lista quedan solo con sus actividades de diseño (su N°10 de la 3.ª ronda)."),
 (0, "Verificar la retroalimentación de la carga",
  "Pida a un administrador cargar su base y observe el aviso.",
  "APLICADO: además del resumen, aparece el aviso «Base cargada con éxito» (su N°3); la carga es de administradores."),
 ACEPTACION,
]),
}

# --- Pestaña 1 · Historia de usuario (versión final) ---
MAPA = []
def _m(paso, rol, hace, modulo, produce, necesita):
    MAPA.append((paso, rol, hace, modulo, produce, necesita))

TODOS = [r[0] for r in ORDEN_ROLES]
ADMINS = ["CEO", "Gerente", "Director de Proyectos", "Jefe de Operaciones"]
LIDERES = [("Director de Proyectos", "mediciones objetivas"), ("Gestor de Datos 1", "Tablero BI"),
           ("Supervisor Contactabilidad", "cápsulas"), ("Diseñador", "diseño")]

for rol in ADMINS:
    _m(0, rol, "Administra: crea proyectos, ve los costos, carga las bases de Excel y gestiona Parametrización y Bases y auditoría.",
       "Crear · Configuración (barra lateral)", "Catálogos, bases y ventas administrados", "Ser administrador (CEO, Gerente, Director, Jefe)")
for rol in [r for r in TODOS if r not in ADMINS]:
    _m(0, rol, "Gestiona todo lo operativo sin ver costos ni configuración: su bandeja, sus actividades, el calendario y las fichas.",
       "Resumen · Actividades · Mi trabajo · Calendario", "Gestión operativa completa de su frente", "Cualquier cargo")
for rol in ADMINS:
    _m(1, rol, "Registra la venta con «Crear»: catálogos, productos con horas y fecha solicitada, contactos; activación automática con 14 validaciones.",
       "Crear (barra superior)", "Proyecto Activo con asignaciones por cargo", "Ser administrador (RN-01)")
for rol, prod in LIDERES:
    _m(6, rol, f"Acepta o negocia la asignación de {prod}; las tarjetas en ajuste dicen «decide la administración».",
       "Mi trabajo", "Asignación aceptada o en negociación con historial", "Tarea generada por el motor")
_m(6, "Gestor de Datos 1", "Se reparte el trabajo con su gestor gemelo mediante «Reasignar cargo» (directo entre gestores).",
   "Mi trabajo · Reasignar cargo", "Producto reasignado con bitácora", "Producto del frente de datos")
_m(6, "Gestor de Datos 2", "Se reparte el trabajo con su gestor gemelo mediante «Reasignar cargo» (directo entre gestores).",
   "Mi trabajo · Reasignar cargo", "Producto reasignado con bitácora", "Producto del frente de datos")
for rol in ADMINS:
    _m(6, rol, "Resuelve los ajustes de todos los cargos desde «Para resolver como dirección» (cuatro decisiones).",
       "Mi trabajo", "Negociaciones resueltas con historial", "Ajuste propuesto por un líder o coordinador")
for rol, prod in LIDERES:
    _m(7, rol, f"Define los requisitos de {prod}; al marcar Recibido registra la ubicación de la información (obligatoria).",
       "Tarjeta del producto · Requisitos", "Requisitos trazables con ubicación", "Asignación aceptada")
for rol in ["Director de Proyectos", "Jefe de Operaciones"]:
    _m(7, rol, "Consolida los requisitos en UNA solicitud con contacto y evidencia obligatorios.",
       "Ficha · Solicitud consolidada", "Solicitud trazable al cliente", "Requisitos definidos")
    _m(8, rol, "Construye y versiona el plan final con horas PLANIFICADAS (las vendidas no cambian); bloqueado si hay asignaciones o coordinación sin resolver.",
       "Ficha · sección 4", "Plan final íntegro (RN-13, RN-14)", "Asignaciones y coordinación aceptadas")
for rol in [r for r, _ in LIDERES] + ["Jefe de Operaciones", "Gestor de Datos 2"]:
    _m(9, rol, "Registra avances y retrasos con «Actualizar» y gestiona hitos (ponderados por horas) con «Hitos»; declara completado y el cierre es automático.",
       "Mi trabajo", "Panel al día y cierres automáticos con sello", "Ser el cargo responsable (RN-12)")
for rol in TODOS:
    _m(12, rol, "Consulta Resumen, Actividades (con «Mi cargo»), Calendario (día completo clicable) y la ficha; los administradores además descargan y auditan.",
       "Resumen · Actividades · Calendario", "Lectura del portafolio", "Ninguno")
for rol in TODOS:
    _m(13, rol, "Firma la aceptación de la versión final en la tabla de decisión.",
       "Este archivo · Resumen de observaciones", "Sí · Con ajustes menores · No", "Verificaciones de su pestaña terminadas")
