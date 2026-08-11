# Rehavid · Gestión de proyectos v5

Aplicación web de un solo archivo que implementa la **Especificación funcional y flujograma
del proceso de gestión de proyectos v1.0** (Rehavid S.A.S., 11 de agosto de 2026).

| Archivo | Contenido |
|---|---|
| `Rehavid_Gestion_Proyectos_v5.html` | La aplicación. Se abre con doble clic; no requiere servidor ni instalación. |
| `Rehavid_Gestion_Proyectos_v4_baseline.html` | Versión anterior, conservada como línea base de comparación. |
| `ESPECIFICACION_FUNCIONAL_v1.txt` | Texto de la especificación que se implementó. |

---

## 1. El cambio estructural

La decisión central de la especificación es que **una venta crea un proyecto maestro y cada
producto vendido se convierte en un frente de trabajo independiente**. La versión 4 no tenía
esa estructura: el "producto" era apenas un texto dentro de cada actividad, sin horas,
responsable, estado ni entregable propios.

| | v4 | v5 |
|---|---|---|
| Unidad de trabajo | Actividad con un campo de texto «producto» | **Producto** con horas, responsable, fechas, estado, condición, entregable y novedades |
| Horas | Un número suelto en el proyecto | Suma automática de las horas de los productos (RN-03) |
| Estados | Una sola escala de 7 etapas mezclada con el estado | Tres capas separadas: estado operativo (6), condición de gestión (3) y eventos |
| Asignación | Manual | Motor de reglas configurable que corre en paralelo y genera notificaciones |
| Contactos | Un nombre, un correo, un teléfono | Entre uno y tres contactos con cargo y principal identificado |
| Alertas | Un semáforo derivado | Ocho alertas de gestión con acuerdos de servicio configurables |
| Trazabilidad | Texto libre firmado como «Usuario» | Bitácora con usuario, fecha, dato anterior, dato nuevo y motivo |

Los datos de la versión 4 se migran solos: al abrir la v5 en el mismo navegador se detecta la
base anterior, cada grupo de actividades se convierte en un producto y las actividades pasan a
ser hitos o sesiones de ese producto (`migrateLegacyProject`). La conversión queda registrada
en la bitácora de cada proyecto.

---

## 2. Módulos (§9 de la especificación)

| Módulo pedido | Dónde está |
|---|---|
| 1. Registro de venta | Botón **Registrar venta** → asistente de 4 pasos con validación previa |
| 2. Motor de asignación | Administración → *Motor de asignación* (reglas editables) |
| 3. Mis asignaciones | Vista lateral, con selector de responsable y acciones de gestión |
| 4. Panel de portafolio | Vista inicial: indicadores, horas, estado operativo y tabla principal |
| 5. Detalle del proyecto | Ficha lateral con proyecto maestro, productos, contactos, bitácora y cierre |
| 6. Calendario | Consolidado o por empresa, con festivos de Colombia |
| 7. Centro de alertas | Vista lateral, agrupada por tipo de alerta |
| 8. Administración y auditoría | Catálogos, acuerdos de servicio, reglas, respaldos e historial |

---

## 3. Reglas de negocio (§8)

| Regla | Cómo se hace cumplir |
|---|---|
| RN-01 · una venta, un proyecto maestro | `nextProjectCode()` genera un ID único correlativo; el asistente crea un solo proyecto |
| RN-02 · productos con vida propia | `makeProduct()` da a cada producto horas, responsable, fechas, estado, entregable y novedades |
| RN-03 · suma de horas | `projectHoursSold()` calcula el total; el campo no es editable a mano |
| RN-04 · activación validada | `ACTIVATION_CHECKS` (10 controles); el botón *Activar* está deshabilitado hasta superarlos |
| RN-05 · reglas en paralelo | `planAssignments()` evalúa todas las reglas y genera una asignación por producto más la coordinación |
| RN-06 · aceptación obligatoria | El producto queda «sin aceptar» hasta la acción *Aceptar asignación*; la alerta lo vigila; *Reasignar* exige motivo y reinicia la aceptación |
| RN-07 · plan ≠ programación | El plan estimado es un campo de la venta; `scheduleConfirmed` solo se marca desde la acción *Programar*, que exige contacto previo |
| RN-08 · excepciones completas | Los formularios de suspensión y de retraso exigen causa, acción, responsable y nueva fecha |
| RN-09 · reanudación como evento | *Reanudar* crea una novedad de tipo «Reanudación» y devuelve el producto a «En ejecución» |
| RN-10 · entregable para finalizar | `canCloseProduct()` y el formulario de finalización exigen entregable o evidencia |
| RN-11 · cierre del maestro | `canCloseProject()` habilita el cierre solo con todos los productos cerrados |
| RN-12 · auditoría | `collectDiffs()` compara la ficha antes y después; los cambios sensibles piden motivo (`askReason`) |
| RN-13 · cálculo automático | `projectGlobalState()`, `projectCondition()` y `projectProgress()` derivan del estado de los productos |
| RN-14 · catálogos administrables | Empresas, PPR, productos, tecnologías, responsables, vendedores, entregables y reglas se editan en Administración |

### Cómo se calculan estado y condición

- **Estado global del proyecto**: el estado operativo *menos avanzado* de sus productos
  (el eslabón débil). Si un producto sigue pendiente de contacto, el proyecto aparece
  pendiente de contacto aunque otros ya estén en ejecución.
- **Condición de gestión**: `Retrasado` si algún producto abierto venció o su suspensión pasó
  la fecha de revisión; `En riesgo` si tiene alguna alerta abierta; `En tiempo` en el resto.
- **Avance**: promedio de los productos ponderado por horas vendidas. Dentro de un producto,
  si hay hitos el avance se calcula desde ellos ponderando por horas asignadas.

### Las ocho alertas (§7.3)

| Alerta | Se dispara cuando |
|---|---|
| Asignación no aceptada | Pasaron más horas que el acuerdo sin aceptar la tarea |
| Cliente no contactado | Hay asignación aceptada y no hay registro de contacto pasado el plazo |
| Sin programación | El producto no tiene fechas confirmadas pasado el plazo desde la activación |
| Próximo a vencer | Faltan pocos días y el avance real está por debajo del esperado, con tolerancia configurable |
| Retrasado | La fecha objetivo venció sin finalizar |
| Suspendido | El producto está detenido; si falta causa, responsable o fecha de revisión, se advierte |
| Sin actualización | Pasó el periodo de control sin registrar novedades |
| Desviación de horas | El consumo alcanzó el porcentaje de aviso o superó las horas vendidas |

Todos los plazos son parámetros editables en **Administración → Acuerdos de servicio**, tal
como recomienda §6: cambiar los acuerdos no exige tocar el código.

---

## 4. Criterios mínimos de aceptación (§10)

| # | Criterio | Estado |
|---|---|---|
| 01 | Registrar una venta con varios productos y hasta tres contactos | Cumple |
| 02 | No activar sin datos obligatorios ni con productos sin horas | Cumple |
| 03 | ID único y registros separados por producto | Cumple |
| 04 | Horas totales y estado global automáticos | Cumple |
| 05 | Notificaciones simultáneas según tipo y productos | Cumple · se generan en la bandeja; el envío por correo necesita servidor |
| 06 | Tarea visible por responsable con aceptar o reasignar | Cumple |
| 07 | Registrar contacto y programación confirmada | Cumple |
| 08 | Calendario por empresa y consolidado | Cumple |
| 09 | Actualizar avance, horas, novedades, retraso, suspensión y reanudación | Cumple |
| 10 | Exigir causa y plan de acción en retraso o suspensión | Cumple |
| 11 | No finalizar un producto sin evidencia | Cumple |
| 12 | No cerrar el maestro con productos abiertos | Cumple |
| 13 | Bitácora de cambios, notificaciones, responsables y fechas | Cumple |
| 14 | Filtrar y exportar por empresa, PPR, tipo, producto, responsable, estado y periodo | Cumple · el CSV sale con una fila por producto |
| 15 | Vista principal centrada en alertas y compromisos | Cumple |

---

## 5. Correcciones aplicadas sobre la versión 4

1. **Edición sin saltos.** Escribir en la ficha ya no redibuja el formulario: no se pierde el
   foco ni se cierran las secciones. Solo se redibuja cuando cambia la estructura (categoría de
   enrutamiento, estado), conservando foco, cursor y posición de desplazamiento.
2. **Importación CSV no destructiva.** Solo se actualizan las columnas presentes en el archivo;
   las ausentes conservan su valor. Cada cambio queda en la bitácora.
3. **Avance consistente.** Producto y proyecto usan la misma base de cálculo ponderada por horas.
4. **Finalizado = 100 %.** Marcar un producto como finalizado o cerrado fija su avance en 100.
5. **Cierre protegido.** Salir de la ficha con cambios sin guardar pide confirmación, y el
   navegador avisa antes de cerrar la pestaña.
6. **Datos demostrativos marcados.** Cada proyecto demo lleva su etiqueta y hay un botón para
   eliminar solo esos registros sin tocar los reales.
7. **Listas de autocompletado únicas.** Se generan una sola vez en el documento.
8. **Secciones persistentes.** Lo que el usuario deja abierto sigue abierto tras cada redibujado.
9. **Códigos sin colisión.** El correlativo se calcula sobre los códigos existentes y verifica
   que el resultado no esté en uso.
10. **Sin código muerto.** Todos los parámetros configurables afectan alguna regla; los valores
    monetarios se muestran en el panel y en la consolidación.

Además: buscador visible en móvil, ficha con `role="dialog"`, `aria-modal`, retención del foco
dentro de la ficha y del cuadro de diálogo, etiquetas en todos los campos y avisos con `aria-live`.

---

## 6. Límites conocidos

La aplicación guarda en el almacenamiento local del navegador. Eso alcanza para operar y para
validar el proceso, pero no para el uso multiusuario que describe la especificación:

- **El correo no se envía solo.** Cada asignación genera la notificación con el contenido mínimo
  de §6 en una bandeja consultable, con opción de abrirla en el cliente de correo. El envío
  automático exige un servidor.
- **No hay usuarios reales ni permisos.** El selector de usuario de la barra superior define
  quién queda firmando la bitácora; es una convención, no una autenticación.
- **No hay concurrencia.** Dos personas en dos navegadores tienen dos bases distintas. El
  intercambio se hace hoy con los respaldos JSON.

El paso natural es mover la persistencia al backend que ya existe en `entregables/backend`
(FastAPI + Cosmos) y añadir autenticación, envío de correo y permisos por rol: exactamente la
fase 3 que plantea §11 de la especificación.

## 7. Pendientes de definición (§11)

La especificación deja abiertos varios puntos que la aplicación deja parametrizados a propósito,
para no fijar en el código decisiones que Rehavid todavía no ha tomado:

- Denominación técnica definitiva de **BVB** (hoy está en el catálogo de tecnologías tal como se suministró).
- Catálogo y fuente oficial del campo **PPR**.
- Responsables titulares y suplentes de cada regla de asignación.
- Tiempos de servicio definitivos para aceptar, contactar, programar y actualizar.
- Catálogo final de productos, tecnologías, complejidades y entregables.
- Roles autorizados para editar horas, responsables, fechas y cierres.
- Canal de envío de correos y reglas de escalamiento.
- Responsable que aprueba el cierre administrativo del proyecto maestro.
