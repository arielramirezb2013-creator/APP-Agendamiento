# Rehavid · Gestión de proyectos v6

Aplicación web de un solo archivo que implementa la **Especificación funcional y flujograma
del proceso de gestión de proyectos v1.0** (Rehavid S.A.S., 11 de agosto de 2026).

| Archivo | Contenido |
|---|---|
| `Rehavid_Gestion_Proyectos_v6.html` | La aplicación. Se abre con doble clic; no requiere servidor ni instalación. |
| `Rehavid_Gestion_Proyectos_v4_baseline.html` | Versión anterior, conservada como línea base de comparación. |
| `ESPECIFICACION_FUNCIONAL_v1.txt` | Texto de la especificación que se implementó. |

---

## 1. Los siete módulos

| # | Módulo | Qué resuelve |
|---|---|---|
| 01 | **Dashboard** | Totales de todo el portafolio y agregados por empresa, tipo de proyecto, PPR y estado operativo, con filtros combinables. |
| 02 | **Empresas y productos** | Cada empresa con sus proyectos, sus productos vendidos, el avance de cada uno, su gestión individual y el plan de trabajo del proyecto. |
| 03 | **Alertas** | Primero la empresa, luego el producto que está atrasado o requiere acción. |
| 04 | **Mis asignaciones** | Lo que está a cargo del usuario en sesión: aceptar, contactar, programar, actualizar. |
| 05 | **Calendario** | Programación consolidada o por empresa, con festivos de Colombia. |
| 06 | **Parametrización** | Productos con horas y valor hora, PPR, empresas, órdenes de servicio, responsables con rol, reglas de asignación y acuerdos de servicio. |
| 07 | **Bases y auditoría** | Descargar y subir bases, bandeja de notificaciones e historial completo de cambios. |

El registro de una venta se abre desde el botón **+ Venta realizada** de la barra superior,
disponible en cualquier módulo.

---

## 2. Dashboard general

Suma **todas las empresas y todos los tipos de proyecto**, y se filtra por PPR, empresa,
tipo de proyecto, estado del proyecto y estado operativo. Contiene:

- Seis indicadores: proyectos activos, productos vendidos, pendientes de programar,
  retrasados, en riesgo y alertas abiertas. Cada uno es además un filtro rápido.
- Instrumentos de consumo de horas, avance ponderado, facturación y distribución de la
  condición de los productos abiertos.
- Cuatro tablas de agregación —por empresa, por tipo, por PPR y por estado operativo— con
  totales de proyectos, productos, horas vendidas y ejecutadas, valor, avance y alertas.
  Un clic en cualquier fila filtra todo el tablero.
- Detalle de proyectos ordenable por condición, compromiso, empresa, valor o actualización.

## 3. Empresas, productos y plan de trabajo

Jerarquía **empresa → proyecto → producto**. Cada producto muestra estado operativo,
condición de gestión, responsable, avance real frente al esperado, horas, saldo, valor,
programación vigente, desviación frente al plan original, entregable y alertas.

**El plan de trabajo** vive dentro del proyecto, como diagrama de barras: cada producto es
una barra con su avance, los hitos son rombos y el plan original queda dibujado como línea
punteada debajo. Cuando se registra un retraso, la aplicación desplaza la fecha objetivo y,
si se indica, también los hitos pendientes: el plan se modifica con los avances y los
retrasos, y la desviación frente a la línea base queda visible y medida en días.

### Permisos por responsable

| Rol | Qué puede hacer |
|---|---|
| **Responsable** | Aceptar sus asignaciones y registrar avances, retrasos, suspensiones, reanudaciones y finalización **de los productos que tiene a cargo**. |
| **Coordinación** | Todo lo anterior en los proyectos que coordina, más reasignar, contactar, programar y cerrar productos. |
| **Administrador** | Intervenir en cualquier proyecto y parametrizar la aplicación. |

Los botones de una acción no permitida aparecen deshabilitados y explican por qué al pasar
el cursor; además cada producto muestra el aviso de quién es el único que puede tocar sus
avances. El usuario en sesión se elige en la barra superior y es el que queda firmando la
bitácora.

## 4. Parametrización

- **Productos**: nombre, categoría de enrutamiento, **costo en horas** y **valor hora**. Al
  registrar una venta, elegir un producto del catálogo carga horas y tarifa; el valor del
  proyecto es la suma de horas × valor hora de sus productos.
- **PPR**: alta y baja con descripción.
- **Empresas**: alta y baja con NIT y notas.
- **Órdenes de servicio**: alta y baja, asociadas a empresa y fecha.
- **Responsables**: alta y baja con rol, que es lo que define los permisos.
- **Reglas de asignación** y **acuerdos de servicio** (tiempos para aceptar, contactar,
  programar y actualizar, tolerancia de avance y aviso de consumo de horas).

Al quitar del catálogo un valor que aparece en proyectos, la aplicación avisa en cuáles y
aclara que los proyectos conservan el dato.

## 5. Bases de datos

- **Descargar**: base completa en JSON (proyectos, productos, hitos, contactos, bitácora,
  notificaciones y parametrización), y extractos CSV de productos, alertas y auditoría.
- **Subir**: JSON reemplaza toda la base previa confirmación; CSV actualiza **solo las
  columnas presentes en el archivo** y registra cada cambio en la bitácora.

---

## 6. El flujo del documento, paso a paso

| Paso de la especificación | Dónde ocurre |
|---|---|
| 5.1–5.2 Venta y registro | Botón **+ Venta realizada** → asistente de cuatro pasos |
| 5.3 Validación previa | Paso 4: diez controles; sin superarlos el proyecto queda en borrador (RN-04) |
| 5.4 Creación del proyecto maestro | ID único automático y un registro independiente por producto |
| 5.5 Asignación y notificación | Motor de reglas en paralelo; notificaciones con el contenido mínimo de §6 |
| 5.6 Aceptación | Acción *Aceptar asignación*, con trazabilidad (RN-06) |
| 5.7 Contacto y programación | *Registrar contacto* habilita *Programar*; el plan preliminar pasa a programación confirmada (RN-07) |
| 5.8 Ejecución | *Registrar avance*: avance, horas y próxima acción |
| 5.9 Retraso, suspensión y reanudación | *Registrar retraso*, *Suspender* y *Reanudar*, siempre con causa, acción, responsable y nueva fecha (RN-08, RN-09) |
| 5.10 Cierre por producto | *Finalizar* exige entregable (RN-10); luego *Cerrar producto* |
| 5.11 Cierre del maestro | Solo con todos los productos cerrados; consolida horas, entregables e historial (RN-11) |

### Reglas de negocio

RN-01 a RN-14 se hacen cumplir en el código, no solo en la interfaz: identificador único,
productos con vida propia, horas totales como suma automática, activación validada, reglas
en paralelo, aceptación obligatoria, plan estimado distinto de programación confirmada,
excepciones con causa y plan de acción, entregable para finalizar, cierre en cascada,
auditoría con motivo en los cambios sensibles, estado y condición calculados, y catálogos
administrables sin tocar el código.

### Estado, condición y alertas

- **Estado global del proyecto**: el estado operativo *menos avanzado* de sus productos.
- **Condición**: `Retrasado` si algún producto abierto venció o su suspensión pasó la fecha
  de revisión; `En riesgo` si tiene alguna alerta; `En tiempo` en el resto.
- **Ocho alertas**: asignación no aceptada, cliente no contactado, sin programación, próximo
  a vencer, retrasado, suspendido, sin actualización y desviación de horas. Todos los plazos
  son parámetros editables.

---

## 7. Correcciones aplicadas sobre la versión 4

1. Escribir en la ficha ya no redibuja el formulario: no se pierde el foco ni se cierran las
   secciones abiertas.
2. La importación CSV no borra los campos ausentes en el archivo.
3. Avance consistente entre producto y proyecto, ponderado por horas.
4. Un producto finalizado o cerrado cuenta 100 %.
5. Cerrar la ficha con cambios sin guardar pide confirmación.
6. Datos demostrativos marcados y eliminables por separado.
7. Listas de autocompletado únicas en el documento.
8. El estado abierto de secciones y planes se conserva entre redibujados.
9. Códigos de proyecto sin colisión.
10. Sin código muerto: todos los parámetros configurables afectan alguna regla y los valores
    monetarios se muestran en el tablero.

Además: buscador visible en móvil, diálogo con foco retenido, etiquetas en todos los campos,
avisos con `aria-live` y ninguna vista con desbordamiento horizontal a 380 px.

---

## 8. Límites conocidos

La aplicación guarda en el almacenamiento local del navegador. Eso alcanza para operar y
validar el proceso, pero no para el uso multiusuario que describe la especificación:

- **El correo no se envía solo.** Cada asignación genera la notificación con el contenido
  mínimo de §6 en una bandeja consultable, con opción de abrirla en el cliente de correo.
- **Los roles no son autenticación.** El selector de usuario define permisos y firma la
  bitácora, pero cualquiera puede cambiarlo: es una convención de trabajo, no seguridad.
- **No hay concurrencia.** Dos personas en dos navegadores tienen dos bases distintas; el
  intercambio se hace con los respaldos JSON.

El paso natural es mover la persistencia al backend que ya existe en `entregables/backend`
(FastAPI + Cosmos) y añadir autenticación, envío de correo y permisos por rol reales:
la fase 3 que plantea §11 de la especificación.

## 9. Pendientes de definición (§11)

- Denominación técnica definitiva de **BVB**.
- Catálogo y fuente oficial del campo **PPR**.
- Responsables titulares y suplentes de cada regla de asignación.
- Tiempos de servicio definitivos para aceptar, contactar, programar y actualizar.
- Catálogo final de productos, tecnologías, complejidades y entregables, con sus tarifas.
- Roles autorizados para editar horas, responsables, fechas y cierres.
- Canal de envío de correos y reglas de escalamiento.
- Responsable que aprueba el cierre administrativo del proyecto maestro.
