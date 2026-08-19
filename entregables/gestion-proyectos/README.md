# Rehavid · Gestión de proyectos v14

Aplicación web de un solo archivo que implementa la **Especificación funcional y flujograma
del proceso de gestión de proyectos, versión 1.1** (Rehavid S.A.S.).

| Archivo | Contenido |
|---|---|
| `Rehavid_Gestion_Proyectos_v15.html` | **La aplicación** (interfaz estilo Jira Premium). Se abre con doble clic; no requiere servidor. |
| `Rehavid_Gestion_Proyectos_v13.html` | Versión anterior, conservada mientras corre la segunda ronda de validación documentada en el mapa v13. |
| `bases/Base_BI.xlsx` | Base de alimentación del frente de **Tableros BI** (la llena Gestor de Datos 1 y 2). |
| `bases/Base_Diseno_Ergonomico.xlsx` | Base de alimentación del frente de **Diseño ergonómico** (la llena el Diseñador). |
| `bases/Base_General.xlsx` | Base de alimentación de los **demás productos y los catálogos**: empresas, PPR, productos y tarifas, órdenes de servicio (la llena Gerente / CEO). |
| `Mapa_de_usuario_y_validacion_Rehavid_v13.xlsx` | **Segunda ronda de validación**, actualizada a la versión 13: diagrama del proceso (incluida la alimentación por bases), mapa de usuario y una pestaña de observaciones por cargo. |
| `Mapa_de_usuario_y_validacion_Rehavid.xlsx` | Primera ronda (respondida), conservada como evidencia. |
| `ESPECIFICACION_FUNCIONAL_v1.1.txt` | Especificación vigente que se implementó. |
| `ESPECIFICACION_FUNCIONAL_v1.txt` | Versión 1.0, conservada como referencia. |
| `Rehavid_Gestion_Proyectos_v4_baseline.html` | Aplicación original, como línea base de comparación. |

---

## 0. Lo que cambió con la validación de usuarios

La versión 10 aplica las observaciones registradas en el Excel de validación por los revisores
(Director de Proyectos, Jefe de Operaciones, Gestor de Datos, Diseñador y Supervisor), y el
ajuste de usuarios y permisos definido por la gerencia.

**Usuarios y permisos (versión 12).** Los usuarios de la aplicación son **los cargos, y solo
los cargos**: CEO, Gerente, Director de Proyectos, Jefe de Operaciones, Supervisor
Contactabilidad, Gestor de Datos 1, Gestor de Datos 2 y Diseñador. La lista del selector de
sesión sale de una constante de la aplicación: **ninguna base guardada, importada o migrada
puede agregarle nombres** (la versión anterior tomaba la lista del catálogo de personas, que en
bases viejas venía contaminado con nombres de productos y actividades; al cargar, ese catálogo
ahora se depura automáticamente a los ocho cargos). Solo **CEO, Gerente, Director de Proyectos
y Jefe de Operaciones** pueden generar un nuevo proyecto (RN-01). El Director de Proyectos
coordina los Tipo 2 y lidera las mediciones; el Tablero BI corresponde a Gestor de Datos 1;
las cápsulas al Supervisor Contactabilidad; el diseño al Diseñador (parametrizable en el
módulo 08).

**Novedades de la versión 14 · interfaz estilo Jira Premium.**

- **Chrome tipo Jira:** barra superior blanca con buscador global y botón azul **Crear**
  (el registro de la venta, RN-01), barra lateral con «Para ti · Guía», accesos del espacio,
  las empresas con proyectos activos y la configuración; pestañas de vista subrayadas en azul
  (Resumen · Tablero · Lista · Calendario · Empresas y productos · Alertas · Mis asignaciones ·
  Planes de trabajo) y paleta Atlassian con lozenges de estado.
- **Tablero (nuevo):** las actividades como tarjetas kanban en cuatro columnas —Por hacer,
  En curso, En pausa y Finalizada— con chip de categoría, condición, avance, código y cargo;
  el estado se mueve con las acciones del proceso y cada tarjeta abre su ficha.
- **Lista (nueva):** todas las actividades en una tabla ordenable (código, actividad, empresa,
  categoría, responsable, estado, condición, avance, fechas y horas).
- **Calendario:** botón «Hoy», navegación por mes y panel **«Actividad no programada»** con las
  actividades abiertas sin fechas, para abrirlas y comprometer fechas.
- Todo el dominio se conserva: cargos, activación, asignación, coordinación, planes, cierre y
  las bases de alimentación (RN-01 a RN-18); 54 verificaciones de navegador en verde.

**Novedades de la versión 15 (simplificación).**

- **Cuatro pestañas**: Resumen (portafolio), Actividades (tablero o lista, con alternador),
  Mi trabajo (asignaciones, coordinaciones y alertas del cargo en sesión, con registro de
  avances y retrasos) y Calendario. Empresas y productos, Alertas, Mis asignaciones, Lista y
  Planes dejaron de ser módulos: la empresa es un filtro (barra lateral), las alertas viven en
  la tarjeta de cada producto, y el plan final vive en la ficha del proyecto.
- **Un solo botón «Actualizar» por producto**: avance, retraso, reprogramación, suspensión,
  reanudación, bloqueo, nota y próxima acción en el mismo formulario (observación repetida de
  la segunda ronda). Los hitos ganan «Agregar hito» y el responsable de una acción se elige
  entre los ocho cargos, ya no es texto libre.
- Guía alineada con la segunda ronda: paso a paso con botón en todos los pasos, solicitud
  consolidada y cierre estricto explicados, y nota honesta de persistencia por navegador.

**Novedades de la versión 13.**

- **Módulo 00 · Guía.** Primer módulo de la aplicación: qué es la herramienta, el flujo en
  seis pasos, cómo se alimenta con las tres bases de Excel y cómo se gestiona según el cargo.
  La primera vez que alguien abre la aplicación, arranca en la guía; después queda disponible
  en su pestaña.
- **Bases de alimentación en Excel.** Tres libros en `bases/`, uno por frente: `Base_BI.xlsx`
  (Tableros BI), `Base_Diseno_Ergonomico.xlsx` (Diseño ergonómico) y `Base_General.xlsx`
  (los demás productos **y los catálogos**: empresas, PPR, productos y tarifas, órdenes).
  Cada libro trae hoja de instrucciones, fila de pistas, ejemplos y listas desplegables.
- **Carga dentro de la aplicación.** En **Bases y auditoría → Cargar base** (o desde la guía)
  se sube el `.xlsx`; la aplicación lo lee sin ninguna librería externa, valida las hojas,
  **crea lo nuevo y actualiza lo que coincide** por código de proyecto y nombre de producto
  (no borra nada), aplica contactos, hitos, seguimiento y catálogos, y si el proyecto viene
  con `activar = SI` corre las validaciones de activación y genera las asignaciones por cargo.
  Al final muestra un resumen de lo cargado y todo queda en la bitácora (RN-18).

**Ajustes aplicados por observación de los revisores:**

| Observación | Cómo quedó |
|---|---|
| Vendedor editable y datos sin validar (Director) | Vendedor, cargo y fecha quedan **bloqueados a la sesión**; empresa y PPR se validan **contra el catálogo**; cada producto exige **fecha solicitada** antes de activar. |
| La coordinación no era una tarea gestionable (Director, Jefe de Operaciones) | La coordinación es ahora una **asignación independiente** del proyecto maestro, con su ciclo *Pendiente · En ajuste · Aceptada*, aceptación, ajuste, historial y trazabilidad propios. En la demo, la coordinación Tipo 1 de DEM-002 nace pendiente para poder probar el flujo. |
| Resolver un ajuste solo permitía aceptar (Director, Jefe de Operaciones) | La resolución tiene **cuatro decisiones**: aceptar la propuesta, mantener la fecha solicitada, **contrapropuesta** (sigue en ajuste) y **devolver para reformulación**; cada ronda queda en el historial de la asignación. |
| Requisitos gestionados producto por producto (Director, Jefe de Operaciones) | Botón **«Solicitud consolidada»** en la ficha del proyecto: agrupa los requisitos definidos de todos los productos en una sola solicitud con fecha, medio, contacto, asistentes y evidencia. |
| Pendientes del cliente sin seguimiento (Director, Jefe de Operaciones) | La respuesta registra **dónde queda alojada la información** y, si queda pendiente, **nueva fecha comprometida, responsable del seguimiento y próxima gestión**; al vencerse la fecha comprometida se genera alerta. |
| El plan final se aprobaba con asignaciones sin resolver (Director) | La aprobación se **bloquea** si hay asignaciones pendientes o en ajuste, o productos abiertos sin fechas; el editor permite **modificar horas y fechas de hitos**; al aprobar se **advierte** si alguna fecha cae en festivo de Colombia o fin de semana. |
| Comparación venta vs. final poco explícita (Director) | El módulo de planes muestra la tabla **«Plan de venta frente a plan final»** por producto, con diferencia en días resaltada, y los compromisos del cliente y de Rehavid a la vista. |
| Sin interfaz para actualizar hitos (Director) | Acción **«Actualizar hitos»**: porcentaje, fecha y horas de cada hito; el avance global se recalcula. |
| Faltaba «Bloqueo» como novedad (Director) | Tipo **Bloqueo** agregado; retraso, suspensión, bloqueo y reprogramación exigen causa, acción, responsable y nueva fecha. |
| Botones poco claros (Diseñador, Jefe de Operaciones) | La tarjeta del producto ofrece botones explícitos: **Registrar avance, Registrar novedad, Suspender / Reanudar, Próxima acción, Actualizar hitos**; el botón del plan se llama **«Plan de trabajo»** y resalta. |
| El cierre pasaba con requisitos sin resolver (Director) | El cierre exige **todo requisito resuelto** (recibido o exceptuado con justificación) y **plan de trabajo final aprobado**, además de fecha real, horas y entregable. |
| Producto cerrado sin poder registrar novedades (Gestor de Datos) | En productos cerrados se puede **registrar una observación** que queda en bitácora sin modificar el estado. |
| Gestionar la alerta exigía abrir la ficha (Jefe de Operaciones) | Cada alerta trae el **botón de la acción que la resuelve** (aceptar, resolver, solicitar, responder, novedad, plan…). |
| Alertas y calendario mezclaban líderes (Gestor de Datos) | El filtro por cargo **poda las filas de alertas y los eventos del calendario** a los productos de ese líder. |
| Mis asignaciones confusa (Diseñador) | Selector **«Rol»** con la sesión por defecto, resumen *Pendientes · En ajuste · Aceptadas · Coordinación*, tarjetas con plan estimado, contacto principal y acceso al proyecto, y estado vacío claro. |
| Cápsulas medidas en personas (Supervisor) | Campo **«Personas a impactar»** en los productos de cápsulas, visible en la tarjeta y en el conjunto descargable. |
| Reprogramar desde el calendario (Jefe de Operaciones) | El detalle del día ofrece **«Registrar novedad»** sobre los productos propios sin salir del calendario. |

**Pendientes de definición que dejaron los revisores** (no son cambios de la aplicación):
la tabla de equivalencias entre horas y personas a impactar en cápsulas; el procedimiento de
grabaciones en sitio; el flujo de recepción de cápsulas con orden de servicio y profesional
SST; y la homologación del cargo contractual del Diseñador («Diseñador de Experiencias
Laborales»).

---

## 0bis. Un tablero que responde al clic

Todo lo que se ve significa algo, y todo lo que significa algo se puede pulsar. El gesto
central es el que pidió Rehavid: **hacer clic sobre una barra o sobre una parte de un
gráfico acota el tablero entero**.

| Se pulsa | Qué acota |
|---|---|
| **Una porción del anillo** de tipo de proyecto o de estado operativo | Ese tipo, o ese estado del producto |
| **Un tramo de una barra apilada** (empresa o PPR) | Dos cosas a la vez: la empresa —o el PPR— **y** la condición del tramo |
| **La pista o el valor de la barra** | Solo la empresa o el PPR de esa fila |
| **Un renglón de la leyenda** o de la mini-leyenda de condiciones | Ese valor |
| **Una pastilla** de estado, condición, asignación o alerta | Su dimensión, en cualquier módulo |
| **Un indicador** del encabezado y su sublínea | El encuadre correspondiente: activos, borradores, sin resolver, en riesgo |
| **El punto de condición o la barra del diagrama** de plan de trabajo | Acota por condición, o abre el producto |
| **El encabezado de cualquier tabla** | Ordena esa columna, ascendente y descendente |

Reglas de la interacción:

- **Clic reemplaza, Ctrl+clic suma.** Un clic deja solo lo elegido; con Ctrl (o Cmd) se
  comparan dos empresas o dos condiciones. Volver a pulsar lo mismo lo deshace.
- **Ningún gráfico se borra a sí mismo.** Al acotar por *Tipo 1*, el anillo de tipos sigue
  mostrando *Tipo 2* atenuado, para poder comparar y cambiar de selección sin limpiar antes.
  Cada gráfico se calcula con todos los filtros menos el propio.
- **Los productos que no cumplen se atenúan, no desaparecen.** Un filtro de condición o de
  cargo deja las demás tarjetas del proyecto a la vista, apagadas: se ve el efecto sin perder
  el contexto.
- **Siempre se sabe dónde se está y cómo salir.** La fila de distintivos abre con «N de M
  proyecto(s)» y cierra con «Limpiar todo»; el selector correspondiente se marca en morado y
  dice «2 seleccionados» cuando hay varios; y todo estado vacío ofrece deshacer los filtros
  que lo provocaron.
- **También funciona con el teclado.** Las piezas de los gráficos son alcanzables con el
  tabulador y se activan con Enter o barra espaciadora.
- **Se anima al entrar** —los anillos aparecen, las barras se extienden, las cifras
  cuentan— y no se anima nada si el sistema pide movimiento reducido.

Dos correcciones de fondo que trajo este trabajo:

1. El anillo de **estado operativo** cuenta productos, pero al pulsarlo filtraba por el
   estado global del *proyecto*: los números no cuadraban. Ahora existe la dimensión
   **estado del producto** y lo que se cuenta es lo que se filtra.
2. La **categoría** del producto era texto muerto y no había forma de filtrar por ella;
   ahora es pulsable y tiene su propio selector en la barra.

---

## 1. La imagen de la aplicación

La versión 8 adoptó el lenguaje visual del **tablero Rehavid** que ya usa la operación, para que
ambas aplicaciones se reconozcan como una sola familia. No se trasladó ningún contenido del
tablero: solo su forma.

| Elemento | Cómo se aplicó |
|---|---|
| **Hoja blanca centrada** | La aplicación vive en una hoja de esquinas redondeadas sobre fondo lila `#f0eefa`, no ocupando el borde de la pantalla. |
| **Cabecera morada** | Franja `#4125CF` con la marca a la izquierda, el módulo en versalitas y la sesión a la derecha. |
| **Franja degradada** | Cuatro píxeles de morado a verde `#00C878` separan la cabecera de la navegación. |
| **Pestañas con icono** | Los nueve módulos son pestañas sobre `#1e0f8a`; la activa se vuelve blanca con subrayado verde. Reemplazan la barra lateral oscura de la versión anterior. |
| **Iconos de línea** | 24 iconos SVG de trazo 2, dibujados en el archivo: sin fuentes ni librerías externas. |
| **Títulos subrayados en verde** | Cada título de sección va en versalitas moradas de 10 px con una línea verde debajo. |
| **Tipografía compacta** | Segoe UI de 10 a 12 px; los números en 17 a 24 px con cifras tabulares. |
| **Tablas de encabezado morado** | Cabecera `#4125CF` en versalitas blancas, filas separadas por medio píxel lila y realce lila al pasar el cursor. |

La paleta de los gráficos se reasignó a los colores de marca (morado, verde, índigo, ámbar,
azul) y las tres condiciones de gestión conservan su semáforo: verde *en tiempo*, ámbar *en
riesgo*, rojo *retrasado*.

---

## 2. Lo que cambió con la versión 1.1 de la especificación

| Componente | Cómo quedó en la aplicación |
|---|---|
| **Roles por cargo** | Ya no hay nombres propios en la lógica. Las reglas asignan a *Jefe de Operaciones*, *Director de Proyectos*, *Gestor de Datos*, *Diseñador Ergónomo* y *Supervisor de Proyectos Especiales*. En Parametrización se define qué persona ocupa cada cargo (RN-02). |
| **Vendedores autorizados** | Solo CEO, Gerente y Director de Proyectos pueden registrar ventas; el módulo lo bloquea para los demás (RN-01). |
| **Cápsulas** | Nueva categoría de producto con su cargo responsable. |
| **Observaciones de la venta** | Campo obligatorio; sin él no se activa el proyecto. |
| **Negociación de capacidad** | Cada asignación vive en tres estados: *Pendiente de aceptación*, *En ajuste*, *Aceptada*. El responsable acepta o propone otra fecha declarando tiempo requerido de producción y capacidad disponible; la coordinación resuelve (RN-10). |
| **Requisitos de información** | El líder de cada producto define qué necesita; la coordinación los consolida, los solicita al cliente y registra la respuesta, con fecha, responsable y evidencia (RN-11, RN-12). |
| **Plan de trabajo final** | Versionado. Contrasta el plan de la venta con la capacidad aceptada y las fechas acordadas; cada cambio crea una versión nueva con usuario, fecha y motivo, y queda el histórico consultable (RN-13, RN-14). |
| **Cierre automático** | El líder declara *Completado* y carga evidencia; la aplicación valida y pasa el producto a *Cerrado* sin acción manual. Cuando todos los productos quedan cerrados, cierra el proyecto maestro y lo consolida (RN-16, RN-17). |
| **Estados nuevos** | Producto: *Pendiente de información · Programado · En ejecución · Suspendido · Completado · Cerrado*. |
| **Datos descargables** | Los ocho conjuntos del §5, completos o filtrados (RN-07). |

---

## 3. Los nueve módulos

| # | Módulo | Qué resuelve |
|---|---|---|
| 01 | **Dashboard** | Portafolio por tipo de proyecto, empresa, PPR y estado operativo, con filtros combinables. |
| 02 | **Empresas y productos** | Al elegir una empresa se abre su ficha: datos, contactos, indicadores, proyectos, plan de trabajo y cada producto con su gestión. |
| 03 | **Alertas** | Agrupadas por empresa y por producto; al abrir una empresa se gestiona con la misma ficha del módulo 02. |
| 04 | **Mis asignaciones** | Lo que corresponde a un cargo: aceptar o proponer ajuste de fecha y capacidad. |
| 05 | **Planes de trabajo** | Plan final versionado por proyecto, con diagrama de barras y comparación contra el plan de la venta. |
| 06 | **Calendario** | Programación consolidada o por empresa, con festivos de Colombia. |
| 07 | **Nuevo proyecto** | Registro de la venta en cuatro pasos con las doce validaciones previas a la activación. |
| 08 | **Parametrización** | Productos con horas y valor hora, PPR, empresas, órdenes de servicio, personas y cargos, reglas de asignación y acuerdos de servicio. |
| 09 | **Bases y auditoría** | Descarga de los ocho conjuntos, carga de bases, bandeja de tareas e historial de cambios. |

### El dashboard

Cuatro indicadores, después **por tipo de proyecto** (anillo con la coordinación que le corresponde a cada
tipo), después **por empresa** (barras apiladas por condición de gestión) y abajo **por PPR** y **por estado
operativo**. Nada más: es un tablero de lectura, no una tabla de trabajo. Cualquier barra o segmento filtra
todo el tablero, y un clic en una empresa abre su ficha.

### La ficha de la empresa

Cabecera con la razón social, el NIT y el resumen de sus proyectos; siete indicadores (horas vendidas,
ejecutadas, saldo, valor, facturado, avance ponderado y productos abiertos); los contactos del cliente; y
por cada proyecto, el plan de trabajo y una tarjeta por producto con: cargo responsable y persona, estado
operativo, condición, estado de la asignación, avance real contra el esperado, horas y saldo, programación
vigente y desviación frente al plan de la venta, requisitos de información recibidos y pendientes, próxima
acción, entregable, última actualización, alertas abiertas y las últimas novedades registradas.

**Cada líder gestiona solo sus productos.** Los botones de un producto ajeno aparecen deshabilitados y
explican de quién es la responsabilidad. Desde la tarjeta se registra la novedad —avance, retraso,
suspensión, reanudación o reprogramación— y esa novedad actualiza el avance, las horas y, cuando hay
retraso, la fecha objetivo y los hitos pendientes, dejando la línea base para medir la desviación en días.

---

## 4. El flujo de once pasos

| Paso de la especificación | Dónde ocurre en la aplicación |
|---|---|
| 1–2 · Venta y registro obligatorio | Módulo 07, asistente de cuatro pasos |
| 3 · Validación y activación | Paso 4 del asistente: doce controles; sin superarlos no activa (RN-04) |
| 4–5 · Motor de asignación y tareas | Al activar: coordinación por tipo más una tarea por producto, todas por cargo (RN-08, RN-09) |
| 6 · Aceptación y negociación de capacidad | Módulo 04 y tarjetas de producto: *Aceptar* o *Proponer ajuste*; la coordinación resuelve |
| 7 · Centralización de requisitos y contacto | *Requisitos de información* (líder) → *Solicitar al cliente* y *Registrar respuesta* (coordinación) |
| 8 · Plan de trabajo final | Módulo 05 o la ficha del proyecto: construir y versionar |
| 9 · Ejecución y actualización | *Registrar novedad* en cada producto |
| 10 · Producto completado y cierre | *Declarar completado* con fecha real, horas y evidencia; la aplicación valida y cierra |
| 11 · Cierre del proyecto maestro | Automático cuando todos los productos quedan cerrados |

### Alertas de gestión

Doce alertas, todas con plazos configurables: asignación sin aceptar, ajuste de capacidad sin resolver,
requisitos sin definir, información no solicitada al cliente, información pendiente del cliente, sin plan de
trabajo final, sin programación, próximo a vencer, retrasado, suspendido, sin actualización, desviación de
horas y completado sin poder cerrar.

---

## 5. El Excel de validación con usuarios

`Mapa_de_usuario_y_validacion_Rehavid.xlsx` tiene nueve pestañas:

- **Mapa de usuario**: 52 intervenciones que cruzan cada cargo con los once pasos del proceso, indicando
  qué hace, en qué módulo, qué dato o decisión produce y qué necesita para poder hacerlo.
- **Una pestaña por cargo** (CEO, Gerente, Director de Proyectos, Jefe de Operaciones, Gestor de Datos,
  Diseñador Ergónomo, Supervisor de Proyectos Especiales) con entre 16 y 20 actividades a revisar. Cada
  fila trae el momento del proceso, la actividad, el paso a paso concreto dentro de la aplicación y el
  resultado esperado; y cuatro columnas vacías para que la persona escriba: si funciona, qué tan claro le
  resultó, sus observaciones y qué cambiaría.
- **Resumen de observaciones**: para consolidar todo con severidad, decisión y responsable.

La pestaña del Supervisor de Proyectos Especiales se llama `Supervisor Proyectos Especiales` porque Excel
limita los nombres de hoja a 31 caracteres; el cargo completo aparece dentro de la hoja.

---

## 6. Límites conocidos

La aplicación guarda en el almacenamiento local del navegador. Eso alcanza para operar y validar el
proceso completo, pero no para el uso multiusuario que describe la especificación:

- **El correo no se envía solo.** Cada asignación genera la tarea con el contenido mínimo definido y queda
  en una bandeja consultable, con opción de abrirla en el cliente de correo.
- **Los cargos no son autenticación.** El selector de sesión define permisos y firma la bitácora, pero
  cualquiera puede cambiarlo: es una convención de trabajo, no seguridad.
- **No hay concurrencia.** Dos personas en dos navegadores tienen dos bases distintas; el intercambio se
  hace con los respaldos JSON.

El paso natural es mover la persistencia al backend que ya existe en `entregables/backend` (FastAPI +
Cosmos) y añadir autenticación, envío de correo y permisos reales por cargo.

## 7. Pendientes de definición

- Denominación técnica definitiva de **BVB**.
- Catálogo y fuente oficial del campo **PPR**.
- Titulares y suplentes de cada cargo en las reglas de asignación.
- Tiempos de servicio definitivos para aceptar, definir requisitos, programar y actualizar.
- Catálogo final de productos, tecnologías, complejidades y entregables, con sus tarifas.
- Canal de envío de correos y reglas de escalamiento.
