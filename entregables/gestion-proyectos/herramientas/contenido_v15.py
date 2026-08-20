# -*- coding: utf-8 -*-
"""Contenido de la historia de usuario · Rehavid Gestión de proyectos v15.
Tercera ronda: decide si la versión sale a producción. Estructura por épicas;
cada cargo valida sus actividades, cierra sus hallazgos de la segunda ronda
(marcados CORREGIDO EN v15 o PENDIENTE) y da su veredicto."""

PASOS = {
    0:  "Épica 0 · Guía y alimentación por bases de Excel",
    1:  "Épica 1 · Venta y registro (botón «Crear»)",
    3:  "Épica 2 · Validación y activación automática",
    4:  "Épica 3 · Asignación por cargo (Mi trabajo)",
    6:  "Épica 4 · Aceptación y negociación de capacidad",
    7:  "Épica 5 · Requisitos de información",
    8:  "Épica 6 · Plan de trabajo final (en la ficha)",
    9:  "Épica 7 · Ejecución: avances y retrasos («Actualizar»)",
    10: "Épica 8 · Completado y cierre del producto",
    11: "Épica 9 · Cierre del proyecto maestro",
    12: "Transversal · Resumen, Actividades y Calendario",
    13: "Veredicto · ¿Lista para producción?",
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

VEREDICTO = (13, "Dar el veredicto de salida a producción",
  "Termine las actividades de esta pestaña, registre sus observaciones y vaya a la pestaña «Resumen de observaciones»: "
  "diligencie su fila en la tabla «Decisión de salida a producción» (Sí · Con ajustes menores · No) con sus condiciones.",
  "Cada cargo deja un veredicto explícito. La versión sale a producción solo si ningún cargo responde «No» y "
  "las condiciones registradas quedan acordadas con la dirección.")

BASE_REVIEW = lambda base, quien: (0, f"Revisar el archivo {base}",
  f"Abra el Excel {base} (entregado junto a este archivo). Revise la hoja Instrucciones, los encabezados, la fila "
  "gris de pistas, los ejemplos y las listas desplegables; diligencie una fila real de prueba y cárguela en la app "
  "(barra lateral → Bases y auditoría → «Cargar base de alimentación (Excel)»).",
  f"El archivo alcanza para alimentar el módulo sin ayuda externa ({quien}). Registre aquí lo que falte o sobre: "
  "columnas, listas, pistas o validaciones.")

ROLES = {

"CEO": dict(nombre="CEO", responsabilidad=(
    "Dirección. Registra ventas, resuelve ajustes, aprueba planes y decide la salida a producción."), filas=[
 (0, "Recorrer la guía nueva con pantallazos",
  "Abra la aplicación en una ventana privada (arranca en la guía) y recorra «Los módulos, uno a uno: qué hace cada botón»: "
  "texto, lista de botones y funciones, pantallazo y botón «Abrir» de cada módulo, y «El total del app».",
  "La guía explica qué hace y qué permite cada módulo con su captura real; los seis pasos del flujo tienen botón; "
  "la nota de persistencia dice dónde viven los datos y cómo operar entre varios mientras no hay servidor."),
 BASE_REVIEW("Base_General.xlsx", "la llena la dirección"),
 (1, "Registrar una venta con el botón «Crear»",
  "Pulse el botón azul «Crear» (barra superior). Verifique vendedor, cargo y fecha bloqueados a su sesión; "
  "complete empresa y PPR del catálogo, productos con horas y fecha solicitada, y el contacto principal.",
  "El registro exige los datos obligatorios (RN-04) y el vendedor queda amarrado a la sesión (RN-01)."),
 (3, "Activar y probar el control de duplicados",
  "Active el proyecto; luego intente registrar otra venta con la misma empresa y PPR.",
  "Las 14 validaciones deciden la activación; el duplicado se advierte antes de activar."),
 (6, "Resolver un ajuste desde «Para resolver como dirección»",
  "Abra Mi trabajo con su sesión: la sección «Para resolver como dirección» lista los ajustes de todos los cargos "
  "(en la demo: el Tablero BI de DEM-001 y la coordinación de DEM-003). Use «Resolver ajuste» y pruebe las cuatro decisiones.",
  "Aceptar, mantener, contrapropuesta y devolver existen y quedan en el historial. PENDIENTE reconocido: el turno "
  "del líder tras una contrapropuesta todavía no muestra botón de aceptación — confirme si bloquea la salida."),
 (8, "Aprobar el plan final desde la ficha",
  "Abra un proyecto desde el Resumen y use la sección «4. Plan de trabajo final» (el módulo aparte se retiró).",
  "El plan se construye, versiona y compara contra la venta dentro de la ficha; la aprobación sigue bloqueada si "
  "hay asignaciones sin resolver."),
 (9, "Controlar el portafolio en el Resumen",
  "Revise los indicadores, la tabla de proyectos (estado · avance · fecha prevista · propietario · última "
  "actualización) y acote con clic en los gráficos.",
  "La tabla resume el portafolio maestro y cada clic filtra el módulo completo; «Limpiar todo» restaura."),
 (12, "Verificar que las alertas ya no saturan",
  "Entre a Mi trabajo con su sesión y luego con el selector en otro cargo.",
  "Las alertas viven dentro de la tarjeta de cada producto y cada uno ve las suyas (corrige la saturación "
  "reportada en la segunda ronda)."),
 (12, "Parametrizar y auditar",
  "Desde la barra lateral abra Parametrización (edite una tarifa) y Bases y auditoría (revise el historial).",
  "La tarifa nueva alimenta la próxima venta; la bitácora conserva usuario, fecha, valor anterior, nuevo y motivo (RN-18)."),
 VEREDICTO,
]),

"Gerente": dict(nombre="Gerente", responsabilidad=(
    "Gerencia. Registra ventas, resuelve ajustes, administra catálogos y carga la Base General."), filas=[
 (0, "Recorrer la guía nueva con pantallazos",
  "Abra la pestaña «Guía» y recorra los módulos uno a uno y el total del app.",
  "Cada módulo tiene texto, captura y acceso directo; el flujo total queda claro para un usuario nuevo."),
 BASE_REVIEW("Base_General.xlsx", "la llena la dirección"),
 (0, "Cargar la Base General y verificar el resumen",
  "Cargue Base_General.xlsx diligenciada. Revise el resumen de carga y luego el Resumen y las Actividades.",
  "El resumen reporta proyectos, productos, contactos, hitos, seguimiento y catálogos; con activar = SI el "
  "proyecto queda Activo con asignaciones por cargo, y aparece en la tabla de proyectos y en el tablero."),
 (0, "Verificar la recarga no destructiva",
  "Cargue dos veces la misma base.",
  "La segunda carga actualiza sin duplicar (proyectos por código, productos por nombre)."),
 (1, "Registrar una venta completa",
  "Con «Crear», registre una venta de dos productos de categorías distintas.",
  "Cada producto exige horas, tarifa y fecha solicitada; el asistente muestra las asignaciones que generará el motor."),
 (6, "Negociar capacidad desde «Para resolver como dirección»",
  "Su Mi trabajo trae la sección «Para resolver como dirección» con dos casos demo: el Tablero BI de DEM-001 y la "
  "coordinación de DEM-003. Resuelva uno con contrapropuesta; observe el estado que queda.",
  "La ronda queda en el historial. PENDIENTE reconocido: el líder aún no tiene botón para aceptar la "
  "contrapropuesta — evalúe la urgencia."),
 (7, "Registrar la respuesta del cliente",
  "En un producto con requisitos solicitados registre una respuesta «No recibido» con fecha comprometida y "
  "responsable (ahora se elige entre los ocho cargos).",
  "El compromiso queda registrado y vence con alerta; el responsable ya no es texto libre."),
 (8, "Comparar plan de venta contra plan final",
  "En la ficha del proyecto, sección 4, revise la tabla comparativa y el gantt.",
  "Fechas de venta, plan final, diferencia en días y compromisos de ambas partes a la vista."),
 (9, "Revisar Actividades en sus dos modos",
  "En Actividades alterne Tablero ⇄ Lista con las píldoras; ordene la lista por avance y por última actualización.",
  "Un solo módulo con las dos vistas; el orden numérico y cronológico es correcto."),
 (12, "Descargar conjuntos filtrados",
  "Aplique un filtro de empresa y descargue Productos y Seguimiento desde Bases y auditoría.",
  "La descarga refleja el corte visible (RN-07); sin filtros, ambas descargas coinciden."),
 VEREDICTO,
]),

"Director de Proyectos": dict(nombre="Director de Proyectos", responsabilidad=(
    "Coordina los Tipo 2 y lidera mediciones. Valida el cierre de sus 19 hallazgos de la segunda ronda."), filas=[
 (0, "Cerrar su hallazgo de la guía",
  "Revise la guía: botón «Abrir» en los seis pasos, texto del paso 4 (solicitud consolidada del coordinador), "
  "paso 6 (cierre exige plan aprobado y requisitos resueltos) y la nota de persistencia/multiusuario.",
  "CORREGIDO EN v15: los tres puntos de su observación N°1 quedaron alineados. Verifíquelo y ciérrelo o reábralo."),
 (4, "Revisar sus coordinaciones Tipo 2 en Mi trabajo",
  "Abra Mi trabajo: la demo trae la coordinación de DEM-001 (aceptada) y la de DEM-003 «En ajuste» con la "
  "propuesta que usted mismo hizo por el corrimiento de la parada de mantenimiento.",
  "Cada coordinación es una tarjeta independiente con su ciclo y su historial; la que está en ajuste espera la "
  "decisión de la dirección."),
 (6, "Aceptar producto y proponer ajuste",
  "Acepte la «Medición objetiva de carga postural» (DEM-003) que llega pendiente en su bandeja, declarando tiempo "
  "y capacidad; en otro producto proponga ajuste.",
  "PENDIENTE reconocido: la coherencia de fechas (inicio posterior al cierre) y el contraste horas/capacidad aún "
  "no se validan — confirme si bloquea la salida a producción."),
 (7, "Definir y consolidar requisitos",
  "Defina requisitos en dos productos y use «Solicitud consolidada» en la cabecera del proyecto.",
  "Una sola solicitud agrupa todos los requisitos definidos. PENDIENTE reconocido: la solicitud individual por "
  "producto sigue disponible y los estados manuales sin evidencia — priorícelo en su veredicto."),
 (8, "Plan final con bloqueos, desde la ficha",
  "Construya el plan con una asignación en ajuste (debe bloquear); resuélvala y apruebe.",
  "El bloqueo por asignaciones funciona; el módulo aparte se retiró y todo pasa en la ficha. PENDIENTE reconocido: "
  "las horas del plan aún tocan las horas vendidas (línea base comercial) — confirme severidad."),
 (9, "Registrar un retraso con «Actualizar»",
  "En Mi trabajo use «Actualizar» en su producto: tipo Retraso, causa, acción, responsable (cargo) y nueva fecha.",
  "CORREGIDO EN v15: un solo botón y formulario para avance, retraso, reprogramación, suspensión, bloqueo, nota y "
  "próxima acción; el responsable se elige entre los ocho cargos (su N°17)."),
 (9, "Crear un hito nuevo",
  "Use «Hitos» y agregue un hito con nombre, fecha y horas; actualice el porcentaje de otro.",
  "CORREGIDO EN v15: los hitos se crean desde el modal (su N°11/16 parcial); el avance global se recalcula. "
  "PENDIENTE: mover fechas de hitos aún no exige versión del plan."),
 (9, "Registrar un Bloqueo",
  "Con «Actualizar», tipo Bloqueo: causa, acción, responsable y nueva fecha.",
  "El tipo existe y desplaza fechas conservando la línea base. PENDIENTE: aún no genera alerta activa propia."),
 (10, "Probar el cierre estricto",
  "Declare completado un producto con un requisito sin resolver.",
  "La validación impide cerrar y lo explica. PENDIENTE reconocido: subsanar un «Completado» atascado aún exige "
  "pasos manuales — confirme si bloquea la salida."),
 (11, "Cierre automático del maestro",
  "Cierre todos los productos de un proyecto de prueba.",
  "El maestro cierra solo con el consolidado de horas en bitácora. PENDIENTE: acta formal de cierre."),
 (12, "Revisar Resumen, Actividades y Calendario",
  "Recorra las cuatro pestañas con sus filtros y el panel de actividad no programada.",
  "Cuatro módulos sin información repetida; la ficha se abre desde cualquiera."),
 VEREDICTO,
]),

"Jefe de Operaciones": dict(nombre="Jefe de Operaciones", responsabilidad=(
    "Coordina los Tipo 1 y el acompañamiento técnico."), filas=[
 (0, "Verificar en la guía quién hace qué",
  "Lea en la guía la tabla por cargo, la sección de bases y los pantallazos de los módulos.",
  "La guía dice quién vende (RN-01), quién carga cada base y qué permite cada módulo, con captura real."),
 (1, "Registrar una venta Tipo 1",
  "Con «Crear», registre una venta Tipo 1 completa.",
  "Vendedor, cargo y fecha bloqueados; la coordinación Tipo 1 le llegará a usted."),
 (4, "Recibir la coordinación Tipo 1 en Mi trabajo",
  "Abra Mi trabajo en su sesión.",
  "La coordinación aparece como tarjeta pendiente con plan estimado y contacto principal."),
 (6, "Aceptar la coordinación y resolver ajustes",
  "Acepte declarando capacidad; luego resuelva un ajuste de un líder con las cuatro decisiones.",
  "Cada ronda queda en el historial de la asignación y en la bitácora."),
 (7, "Consolidar los requisitos del proyecto",
  "Use «Solicitud consolidada» en la cabecera de la ficha.",
  "Una sola gestión frente al cliente con fecha, medio, contacto y evidencia."),
 (8, "Construir el plan Tipo 1 en la ficha",
  "Sección 4 de la ficha: fechas por producto, hitos y compromisos de ambas partes; versione moviendo un hito.",
  "El editor permite fechas, horas e hitos; la versión anterior se conserva como línea base."),
 (9, "Suspender y reanudar con «Actualizar»",
  "En un producto propio use «Actualizar» tipo Suspensión (causa, acción, responsable, fecha) y luego el botón "
  "«Reanudar» que aparece en la tarjeta suspendida.",
  "La suspensión exige los campos de RN-15; la tarjeta suspendida ofrece Reanudar de inmediato."),
 (9, "Gestionar desde el calendario",
  "En Calendario abra un día con eventos y registre una novedad; revise el panel «Actividad no programada».",
  "El día lista solo los eventos del corte visible; lo no programado se abre para comprometer fechas."),
 (10, "Cierre automático de un producto",
  "Declare completado un producto propio con todo resuelto.",
  "Pasa a Cerrado sin acción manual, con fecha real, horas y entregable registrados."),
 (12, "Filtrar Actividades por cargo",
  "En Actividades filtre por cargo responsable y alterne tablero/lista.",
  "Ambos modos respetan el filtro; las tarjetas muestran empresa, categoría y condición."),
 VEREDICTO,
]),

"Supervisor Contactabilidad": dict(nombre="Supervisor Contactabilidad", responsabilidad=(
    "Lidera las cápsulas. Valida el cierre de sus hallazgos de saturación y de avance."), filas=[
 (0, "Cerrar su hallazgo de saturación de alertas",
  "Abra Mi trabajo en su sesión.",
  "CORREGIDO EN v15: solo ve sus asignaciones y sus alertas (dentro de cada tarjeta); el módulo global de alertas "
  "se retiró. Verifíquelo."),
 BASE_REVIEW("Base_General.xlsx", "las cápsulas viajan en la hoja Productos"),
 (0, "Verificar personas a impactar en la base",
  "En Base_General.xlsx, hoja Productos, ubique la columna personas_a_impactar; cargue una cápsula con 150 y "
  "revise su tarjeta.",
  "La columna existe en la hoja Productos (su N°10 de la segunda ronda apuntaba al conjunto descargable); el valor "
  "llega a la tarjeta. PENDIENTE reconocido: la homologación horas ↔ personas — priorícela en su veredicto."),
 (4, "Revisar sus asignaciones de cápsulas",
  "En Mi trabajo revise sus dos tarjetas demo: las cápsulas en curso (DEM-001) y las «Cápsulas de seguridad para "
  "líderes de línea» (DEM-002) pendientes, con 120 personas a impactar y su hoja de vida de contenidos definida.",
  "Los botones «Aceptar asignación» y «Proponer ajuste» están en la propia tarjeta pendiente (su N°3 de la "
  "segunda ronda: verifique que ahora es visible)."),
 (6, "Aceptar y proponer ajuste",
  "Acepte las cápsulas pendientes declarando tiempo y capacidad; luego proponga un ajuste por disponibilidad de "
  "producción.",
  "La aceptación queda en el historial de la asignación con usuario y fecha."),
 (7, "Definir insumos y ver su trazabilidad",
  "Defina los insumos de las cápsulas como requisitos; pida la solicitud consolidada al coordinador y registre "
  "después una respuesta.",
  "Cada requisito muestra estado, quién lo definió, cuándo se solicitó y la respuesta en la tabla de la tarjeta. "
  "PENDIENTE reconocido: el escalamiento detallado por observación — evalúe si alcanza para producción."),
 (9, "Registrar avance con «Actualizar»",
  "En una cápsula SIN hitos use «Actualizar» tipo Avance y mueva el porcentaje; en una CON hitos, use «Hitos».",
  "CORREGIDO EN v15: sin hitos el porcentaje manual sí actualiza; con hitos el formulario lo dice y el avance se "
  "calcula desde ellos (su N°9). Verifique ambos casos."),
 (9, "Reprogramar una grabación",
  "«Actualizar» tipo Reprogramación con causa, acción, responsable y nueva fecha.",
  "La reprogramación desplaza la fecha objetivo conservando la línea base, y queda en la línea de tiempo."),
 (10, "Cargar el entregable y completar",
  "Declare completado con fecha real, horas y entregable.",
  "Con requisitos resueltos y plan aprobado, cierra automáticamente y el avance queda en 100 %."),
 (11, "Entender el cierre del maestro",
  "Lea en la guía y en la ficha qué significa el cierre del proyecto maestro.",
  "CORREGIDO EN v15 (claridad): el cierre del maestro es automático cuando TODOS los productos cierran; usted solo "
  "cierra los suyos (su N°15). Confirme que ahora es claro."),
 VEREDICTO,
]),

"Gestor de Datos 1": dict(nombre="Gestor de Datos 1", responsabilidad=(
    "Lidera el Tablero BI. Valida el botón único y los hitos, sus hallazgos de la segunda ronda."), filas=[
 BASE_REVIEW("Base_BI.xlsx", "la llena su frente"),
 (0, "Confirmar la asignación al cargar la base",
  "Cargue Base_BI.xlsx con activar = SI y revise Mi trabajo.",
  "El tablero llega asignado a Gestor de Datos 1 por regla del motor. PENDIENTE reconocido: la columna para elegir "
  "responsable (1 o 2) desde el Excel — priorícela en su veredicto (su N°1)."),
 (4, "Revisar la asignación en Mi trabajo",
  "Abra Mi trabajo en su sesión.",
  "Su bandeja demo trae el «Tablero BI de control · fase 2» (DEM-003) pendiente de aceptar y el tablero de DEM-001 "
  "en ajuste esperando a la dirección, con las alertas dentro de cada tarjeta."),
 (6, "Aceptar y negociar",
  "Acepte la fase 2 declarando tiempo y capacidad; observe en la otra tarjeta la negociación en curso.",
  "El ciclo Pendiente → En ajuste → Aceptada se conserva con su historial."),
 (9, "Cerrar su hallazgo del botón duplicado",
  "En su producto use «Actualizar»: registre un avance; luego vuelva y registre un retraso en el mismo formulario.",
  "CORREGIDO EN v15: «Registrar avance» y «Registrar novedad» se unificaron en un botón y formulario con el tipo "
  "adentro (su N°8). Verifíquelo."),
 (9, "Cerrar su hallazgo de hitos",
  "Use «Hitos»: actualice el porcentaje de un hito puntual y agregue un hito nuevo.",
  "CORREGIDO EN v15: se elige qué hito avanza y se crean hitos nuevos (su N°9); con hitos, el avance global se "
  "calcula desde ellos y el formulario lo explica."),
 (7, "Requisitos de datos con ubicación",
  "Defina requisitos, y al recibir la respuesta registre dónde queda alojada la información.",
  "La ubicación queda como constancia del recibido a satisfacción."),
 (10, "Cerrar y observar después del cierre",
  "Declare completado con el enlace del tablero; luego use «Actualizar» (queda solo Nota) en el producto cerrado.",
  "El cierre es automático con todo resuelto; la observación posterior queda en bitácora sin cambiar el estado."),
 (12, "Cerrar su hallazgo de la descarga filtrada",
  "En Actividades filtre por su cargo; luego en Bases y auditoría use la descarga «Filtrado» de Seguimiento.",
  "El botón «Filtrado» se habilita cuando hay filtros activos y explica el corte que toma (su N°16: verifique si "
  "ahora es claro; si no, descríbalo)."),
 (12, "Verificar que no puede crear proyectos",
  "Intente usar el botón «Crear» con su sesión.",
  "El registro se bloquea explicando los cargos autorizados (RN-01); cargar una base con proyectos nuevos es la "
  "vía de alimentación, no una venta suya (su N°17: confirme que la distinción es clara)."),
 VEREDICTO,
]),

"Gestor de Datos 2": dict(nombre="Gestor de Datos 2", responsabilidad=(
    "Cargo gemelo de datos; recibe trabajo por reasignación."), filas=[
 (0, "Leer cómo se alimenta su frente",
  "Abra la guía, sección «Cómo se alimenta la aplicación», y el pantallazo de Bases y auditoría.",
  "La Base BI corresponde a los Gestores de Datos 1 y 2. PENDIENTE reconocido: elegir el responsable (1 o 2) desde "
  "el Excel — confirme prioridad en su veredicto (su N°1)."),
 (4, "Revisar su bandeja demostrativa",
  "Abra Mi trabajo en su sesión.",
  "La base demostrativa trae el «Tablero de control de indicadores» (DEM-002) reasignado a su cargo por la "
  "dirección, en «Pendiente de aceptación», para que practique el flujo completo."),
 (6, "Aceptar la asignación reasignada",
  "En esa tarjeta use «Aceptar asignación» declarando tiempo y capacidad.",
  "La asignación pasa a Aceptada a nombre de su cargo y aparecen los botones de ejecución («Actualizar», «Hitos», "
  "«Requisitos de información»)."),
 (6, "Recibir un producto por reasignación",
  "Pida a la dirección reasignar el tablero a su cargo («Reasignar cargo» en la tarjeta) y revise Mi trabajo.",
  "La asignación vuelve a «Pendiente de aceptación» a nombre de su cargo y los botones de aceptar aparecen en su "
  "bandeja. PENDIENTE reconocido de su N°3/4: solicitar la reasignación desde su propio cargo aún no existe — "
  "verifique si al menos la aceptación tras la reasignación ya funciona y priorice lo que falte."),
 (9, "Actualizar el producto recibido",
  "Con la asignación aceptada, use «Actualizar» para un avance con horas.",
  "Solo su cargo (o la dirección) puede actualizarlo; queda a nombre del cargo."),
 (9, "Comprobar el bloqueo sobre productos ajenos",
  "Intente actualizar un producto de otro cargo desde Actividades.",
  "Los botones aparecen deshabilitados con la razón."),
 (12, "Consultar Resumen y Actividades",
  "Recorra el Resumen (clic en gráficos) y Actividades en tablero y lista.",
  "La consulta es libre; los filtros y las píldoras «Mis actividades» acotan a su cargo."),
 (12, "Descargar un conjunto",
  "Descargue Productos desde Bases y auditoría.",
  "La descarga funciona para cualquier cargo; la edición sigue restringida."),
 VEREDICTO,
]),

"Diseñador": dict(nombre="Diseñador", responsabilidad=(
    "Lidera los productos de diseño. Valida el cierre de sus hallazgos de claridad."), filas=[
 (0, "Cerrar su hallazgo de términos",
  "Lea en la guía quiénes son la «dirección» y cómo se llaman los módulos; recorra los pantallazos.",
  "CORREGIDO EN v15: la guía dice que la dirección son CEO y Gerente, y cada módulo tiene texto y captura "
  "(sus N°3/5/6). Verifique que los términos ya son claros; si «Solicitar al cliente» aún confunde, obsérvelo."),
 BASE_REVIEW("Base_Diseno_Ergonomico.xlsx", "la llena su frente"),
 (0, "Cargar con activar = NO y ver el motivo",
  "Cargue la base dejando activar = NO y lea el resumen de carga; luego busque el proyecto en el Resumen.",
  "El resumen dice que quedó en Borrador y el porqué (su N°1: verifique que ahora el motivo es visible); el "
  "proyecto aparece como Borrador en la tabla."),
 (4, "Encontrar su asignación en Mi trabajo",
  "Abra Mi trabajo en su sesión.",
  "Su producto de diseño aparece con la complejidad visible. Revise si el contacto principal del proyecto se ve "
  "donde lo necesita (su N°2 quedó parcial: repórtelo si falta)."),
 (6, "Aceptar o proponer ajuste con claridad",
  "En la tarjeta pendiente use «Aceptar asignación» o «Proponer ajuste» (ya no se hace por novedad).",
  "CORREGIDO EN v15 (claridad): los botones del flujo coinciden con la instrucción (su N°4)."),
 (7, "Definir los insumos del diseño",
  "Use «Requisitos de información» y registre planos, fichas y accesos.",
  "Los insumos quedan definidos para la solicitud consolidada del coordinador (el coordinador de su proyecto es "
  "el cargo que dice la tarjeta)."),
 (9, "Cerrar su hallazgo del panel duplicado",
  "Use «Actualizar»: registre un avance; reabra y registre una novedad tipo Nota; observe la próxima acción al final.",
  "CORREGIDO EN v15: un solo botón y panel con el tipo adentro y la próxima acción integrada una sola vez "
  "(sus N°9/10). Verifíquelo."),
 (9, "Ver el hito en el plan",
  "Agregue un hito con «Hitos» y ábralo en la ficha → sección 4 (gantt).",
  "El hito aparece como rombo sobre la línea de tiempo del plan (su N°8: verifique que ahora es visible)."),
 (10, "Completar el diseño",
  "Declare completado con fecha real, horas y entregable.",
  "Con requisitos y plan resueltos, cierra automáticamente."),
 (12, "Revisar sus actividades y calendario",
  "En Actividades use la píldora «Mis actividades»; en Calendario filtre por su cargo.",
  "Ambos quedan acotados a su trabajo."),
 VEREDICTO,
]),
}

# --- Pestaña 1 · Historia de usuario: (paso/épica, rol, qué hace, módulo, produce, necesita) ---
MAPA = []
def _m(paso, rol, hace, modulo, produce, necesita):
    MAPA.append((paso, rol, hace, modulo, produce, necesita))

TODOS = [r[0] for r in ORDEN_ROLES]
DIRECCION = ["CEO", "Gerente"]
VENDEDORES = ["CEO", "Gerente", "Director de Proyectos", "Jefe de Operaciones"]
LIDERES = [("Director de Proyectos", "mediciones objetivas"), ("Gestor de Datos 1", "Tablero BI"),
           ("Supervisor Contactabilidad", "cápsulas"), ("Diseñador", "diseño")]

for rol in TODOS:
    _m(0, rol, "Recorre la guía: qué hace y qué permite cada módulo con su pantallazo, el flujo total del app y cómo se alimenta con las bases.",
       "Guía (Para ti)", "Usuario ubicado, con accesos directos", "Ninguno: la primera visita arranca ahí")
for rol, base in [("Gestor de Datos 1", "Base_BI.xlsx"), ("Diseñador", "Base_Diseno_Ergonomico.xlsx"),
                  ("Gerente", "Base_General.xlsx"), ("CEO", "Base_General.xlsx")]:
    _m(0, rol, f"Diligencia y carga {base}: la app valida, crea o actualiza sin borrar y activa lo marcado con activar = SI.",
       "Bases y auditoría (barra lateral)", "Módulos poblados con resumen de carga y bitácora", "La base diligenciada según su hoja Instrucciones")
for rol in VENDEDORES:
    _m(1, rol, "Registra la venta con el botón «Crear»: empresa y PPR del catálogo, productos con horas y fecha solicitada, contactos.",
       "Crear (barra superior)", "Proyecto en borrador con productos y contactos", "Cargo autorizado (RN-01) y catálogos parametrizados")
    _m(3, rol, "Supera las 14 validaciones y activa; el motor genera las asignaciones y tareas por cargo.",
       "Crear · paso 4", "Proyecto Activo con asignaciones", "Datos obligatorios completos")
_m(4, "Director de Proyectos", "Recibe la coordinación Tipo 2 como asignación propia.", "Mi trabajo", "Coordinación aceptada o en ajuste, con historial", "Proyecto Tipo 2 activo")
_m(4, "Jefe de Operaciones", "Recibe la coordinación Tipo 1 como asignación propia.", "Mi trabajo", "Coordinación aceptada o en ajuste, con historial", "Proyecto Tipo 1 activo")
for rol, prod in LIDERES:
    _m(6, rol, f"Acepta la asignación de {prod} declarando tiempo y capacidad, o propone ajuste justificado.",
       "Mi trabajo · tarjeta del producto", "Asignación Aceptada o En ajuste", "Tarea generada por el motor")
for rol in DIRECCION:
    _m(6, rol, "Resuelve los ajustes propuestos (aceptar · mantener · contrapropuesta · devolver), incluidos los de coordinación.",
       "Mi trabajo (selector Rol)", "Decisión con motivo e historial", "Ajuste propuesto por un líder o coordinador")
for rol, prod in LIDERES:
    _m(7, rol, f"Define los requisitos de información de {prod}.", "Tarjeta del producto", "Requisitos definidos con autor y fecha", "Asignación aceptada")
for rol in ["Director de Proyectos", "Jefe de Operaciones"]:
    _m(7, rol, "Consolida los requisitos del proyecto en UNA solicitud al cliente y registra las respuestas.",
       "Ficha del proyecto · Solicitud consolidada", "Requisitos solicitados; pendientes con compromiso", "Requisitos definidos por los líderes")
    _m(8, rol, "Construye y versiona el plan final: fechas, horas e hitos; bloqueado si hay asignaciones sin resolver; comparado contra la venta.",
       "Ficha del proyecto · sección 4", "Plan final versionado (RN-13, RN-14)", "Asignaciones aceptadas")
for rol in [r for r, _ in LIDERES] + ["Jefe de Operaciones", "Gestor de Datos 2"]:
    _m(9, rol, "Registra avances y retrasos de SUS productos con «Actualizar» (avance, retraso, reprogramación, suspensión, bloqueo, nota y próxima acción) y gestiona hitos con «Hitos».",
       "Mi trabajo · botón Actualizar", "Panel al día: avance, horas, fechas, línea de tiempo", "Ser el cargo responsable (RN-12)")
    _m(10, rol, "Declara el producto completado; la app valida requisitos y plan y cierra automáticamente.",
       "Tarjeta del producto", "Producto Cerrado o detalle de lo que falta", "Requisitos resueltos y plan aprobado")
for rol in DIRECCION:
    _m(11, rol, "Verifica el cierre automático del maestro con su consolidado de horas.", "Resumen · ficha", "Proyecto Cerrado", "Todos los productos cerrados")
    _m(12, rol, "Parametriza catálogos, tarifas y reglas del motor.", "Parametrización (barra lateral)", "Catálogos vigentes", "Permiso de dirección")
for rol in TODOS:
    _m(12, rol, "Consulta el Resumen (clic en gráficos), las Actividades (tablero o lista) y el Calendario; descarga los conjuntos.",
       "Resumen · Actividades · Calendario · Bases", "Lectura del portafolio y descargas", "Ninguno: la consulta es libre")
for rol in TODOS:
    _m(13, rol, "Da su veredicto de salida a producción en la pestaña «Resumen de observaciones».",
       "Este archivo · Decisión de salida a producción", "Sí · Con ajustes menores · No, con condiciones", "Haber terminado las actividades de su pestaña")
