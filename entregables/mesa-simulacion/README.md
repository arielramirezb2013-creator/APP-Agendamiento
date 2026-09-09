# Ruta de incapacidad · service blueprint y mesa de simulación

Un solo archivo (`mesa-simulacion-completa.html`, versión descargable con doctype; `index.html` es la misma aplicación en la forma que publica claude.ai). Tres secciones: el service blueprint como módulo principal, la mesa de simulación como módulo opcional y esta guía con la auditoría.

## Service blueprint

Mapa del servicio de la ruta de incapacidad del caso sintético M.P., en dos versiones que se conmutan: **HOY · red fragmentada** y **CON EL MÓDULO · blueprint federado**.

- **Fases y pasos**: antes (A1 inicio de la incapacidad, A2 certificados y prórrogas, A3 evidencia laboral), durante (E1 calificación de origen, E2 respuesta o controversia, E3 dictamen, E4 apelación y validación experta, E5 pago desde el día 181 y competencia) y después (D1 reintegro o reubicación, D2 prestación en firme o pensión, D3 seguimiento, queja o tutela). Se pueden ver todas o filtrar por fase.
- **Carriles**: acciones de M.P.; puntos de contacto y evidencia física; front (el actor visible que atiende o decide); back (custodia y trámite interno); procesos de soporte (módulo, estándares, vigilancia y control). Entre ellos, las tres líneas del service blueprint: interacción, visibilidad e interacción interna.
- **Fila de cierre**: rupturas r1 a r5 presentes en cada paso (HOY) o reglas ① a ⑤ del módulo que aplican (CON EL MÓDULO).
- **Versión multiactor («Ver desde»)**: al elegir uno de los 12 actores, el primer carril pasa a ser sus acciones en cada paso, los pasos donde no participa se atenúan, el mapa de actores lo resalta con sus relaciones y la ficha muestra su función, tensión, precedentes, contrato TO-BE y recorrido.
- **Validación**: por actor, semáforo del contrato (aceptar, ajustar, rechazar), campos, plazo, mejora frente a hoy en tres dimensiones y ajuste propuesto. Anotaciones sobre pasos (falta un punto de contacto, falta un actor o relación, conflicto de rol, otra). Riesgos éticos con mitigación. Gate de cuatro criterios con evidencia derivada y veredicto (pendiente, no avanza, avanza con ajustes, avanza). Exportación en JSON.

La validación se guarda en el navegador (clave `sbp_v1`).

## Mesa de simulación (módulo opcional)

Instrumento multiusuario para una sesión con actores reales: la facilitadora crea una mesa (HOY o CON EL MÓDULO, código de cuatro letras y PIN), asigna un perfil por actor y comparte el código o el enlace; cada participante ve su ficha, el reto vigente con su base normativa de referencia, registra su gestión (consultar, solicitar, decidir, notificar, controvertir, vigilar), responde solicitudes de evidencia con vista mínima y pasa el turno. La facilitadora sigue la mesa en tiempo real (perfiles, mapa vivo, actividad, alertas de reglas) y al cerrar obtiene el informe (indicadores, línea de tiempo, gestión por actor, evidencia que circuló, tensiones, H1 a H4, validación de contratos y gate), comparable con otra mesa y descargable en JSON o HTML.

Los enlaces con `#mesa=` abren directamente esta sección.

## Dónde viven los datos

- **Publicada como artefacto de claude.ai** con la capacidad `db`: los datos de la mesa son compartidos y en tiempo real entre quienes abran la página. Restricción de la plataforma: los participantes deben ser miembros de la organización de quien publicó el artefacto.
- **Abierta como archivo local**: modo local. Los datos viven en ese navegador; la mesa completa puede correrse en un solo computador abriendo una pestaña por actor.

Datos sintéticos. Las referencias normativas y los plazos son orientación ilustrativa: verifique vigencia y artículo antes de la sesión.
