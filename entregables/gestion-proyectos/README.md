# Rehavid · Gestión de proyectos v7

Aplicación web de un solo archivo que implementa la **Especificación funcional y flujograma
del proceso de gestión de proyectos, versión 1.1** (Rehavid S.A.S.).

| Archivo | Contenido |
|---|---|
| `Rehavid_Gestion_Proyectos_v7.html` | La aplicación. Se abre con doble clic; no requiere servidor. |
| `Mapa_de_usuario_y_validacion_Rehavid.xlsx` | Mapa de usuario y hoja de observaciones, una pestaña por cargo. |
| `ESPECIFICACION_FUNCIONAL_v1.1.txt` | Especificación vigente que se implementó. |
| `ESPECIFICACION_FUNCIONAL_v1.txt` | Versión 1.0, conservada como referencia. |
| `Rehavid_Gestion_Proyectos_v4_baseline.html` | Aplicación original, como línea base de comparación. |

---

## 1. Lo que cambió con la versión 1.1 de la especificación

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

## 2. Los nueve módulos

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

## 3. El flujo de once pasos

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

## 4. El Excel de validación con usuarios

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

## 5. Límites conocidos

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

## 6. Pendientes de definición

- Denominación técnica definitiva de **BVB**.
- Catálogo y fuente oficial del campo **PPR**.
- Titulares y suplentes de cada cargo en las reglas de asignación.
- Tiempos de servicio definitivos para aceptar, definir requisitos, programar y actualizar.
- Catálogo final de productos, tecnologías, complejidades y entregables, con sus tarifas.
- Canal de envío de correos y reglas de escalamiento.
