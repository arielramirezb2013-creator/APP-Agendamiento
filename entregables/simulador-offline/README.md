# Simulación de la ruta de incapacidad · versión individual (asíncrona)

Versión de la herramienta para cuando no es posible reunir a los participantes. Cada persona entra sola, con el usuario y la contraseña que el investigador le asignó según su rol, y recorre la simulación con los demás actores simulados. Reemplaza la conducción en vivo de `../blueprint-simulacion` por un conductor automático y conserva el mismo contenido doctoral.

## Los dos entregables

| Entregable | Archivo | Para qué |
|---|---|---|
| 1. Simulador en un solo archivo | `simulador.html` | Abre con doble clic, sin conexión. Trae una cuenta de demostración por rol (usuarios `demo-…`, contraseña `DEMO-2026`). Sirve para probar y para enviar tal cual. |
| 2. Paquete para el sitio web | `paquete-web.zip` (carpeta `paquete-web/`) | Lo que se le entrega a quien publica: simulador, configuración, panel del investigador, receptor opcional y guías. |

Contenido del paquete: `index.html` (simulador), `configuracion.js` (estudio y cuentas), `sw.js` (reapertura sin conexión), `administrador.html` (panel del investigador), `recibir.php` con `recibir-config.php` y `respuestas/` (receptor opcional), `guia-investigador.html`, `guia-despliegue.html` y `LEEME.txt`.

## Qué hace el participante

1. **Acceso.** Usuario y contraseña. La cuenta define el rol: trabajador, empleador, IPS, EPS, ARL, AFP, Junta Regional, Junta Nacional, MinTrabajo, MinSalud, SuperSalud o Jueces.
2. **Orientación.** Cuatro pantallas: qué es el estudio y qué se busca; el caso sintético, con la ficha de M.P. y la historia de cómo llegó al día 150; cómo funciona la simulación; y su rol, presentado en primera persona.
3. **Declaración de participación voluntaria.** Información del estudio, cuatro declaraciones necesarias y datos personales opcionales. Quien no acepta sale sin que quede nada guardado.
4. **Dos rondas.** La ruta como funciona hoy y la ruta con el módulo propuesto. En cada uno de los once pasos ve qué ocurre; si su rol interviene responde una actividad, y si no, lee el contexto. Al cierre de cada ronda valora el contrato de datos de su rol y responde P1 a P4.
5. **Entrega.** Envío al receptor del sitio o descarga de un archivo que le manda al investigador.

Al cerrar la ronda 1 el contrato de datos todavía no se ha vivido: la pantalla lo presenta como lo que el módulo propondría para su rol y le pide decir si lo aceptaría. Al cerrar la ronda 2 lo valora ya recorrido. La misma pregunta de comparación se repite en las dos rondas, con una nota que explica por qué.

Cada paso abre con un relato de qué está ocurriendo con el caso en ese momento y qué se juega allí, distinto en cada ronda. Debajo queda plegado el mapa del paso con los carriles del blueprint, y las preguntas llevan una línea que explica para qué se pregunta, sin sugerir la respuesta.

El relato describe la situación y no resuelve lo que el participante tiene que decidir: donde el escenario pone una decisión en sus manos —calificar el origen, abrir la controversia, dictaminar, apelar, pagar— el relato la deja abierta. Donde la simulación supone algo que la matriz de contratos no autoriza, lo dice en el propio paso (es el caso de D1 con el empleador). La ronda 1 no explica las reglas del módulo: la comprobación de la finalidad se presenta allí como una comparación con el contrato que se propondrá, no como una calificación de la respuesta.

El sistema hace de los actores que no están conectados: pide evidencia al custodio, consulta por el módulo con la vista mínima del contrato, notifica y registra acuses. Todo lo que genera el sistema queda marcado como simulado y se cuenta aparte, y el registro distingue los actos de la propia entidad del participante de la reacción de los actores simulados.

## Pausa, reanudación y fallas

- El avance se guarda en el dispositivo en cada cambio, con una copia de respaldo.
- «Pausar» explica cómo retomar. Al volver a entrar aparece «Bienvenido de nuevo» con el paso donde quedó y cuánto lleva.
- Si la página se recarga o el navegador se cierra de forma inesperada, se restablece el mismo paso con el borrador del formulario.
- Si se cae la conexión, la simulación continúa. Con receptor, los envíos pendientes salen solos al volver la conexión.
- En el sitio web, después de la primera visita la página abre aunque no haya conexión.
- Para continuar en otro dispositivo: con receptor, basta entrar con el mismo usuario y contraseña; sin receptor, se descarga un archivo de avance y se carga en el otro equipo.
- Si el navegador no permite guardar, el simulador lo advierte y sigue funcionando mientras la pestaña esté abierta.

## Varias sesiones de simulación

El panel guarda cada sesión por separado, con su identificador, sus cuentas y las respuestas de sus
participantes. Sirve para repetir la simulación con otro grupo, en otra entidad o en otro momento del proyecto.

- **No se mezclan.** Cada sesión lleva un identificador propio que viaja en la configuración y en cada
  respuesta. Si importa un archivo de otra sesión, el panel lo señala y no lo suma a ese análisis.
- **Por participante.** Cada persona entra con su usuario y cada recorrido queda con su propio identificador de
  participación. Si alguien recorre la simulación dos veces, aparecen las dos por separado.
- **En el navegador del participante.** El avance se guarda bajo el identificador de la sesión, así que una
  misma persona puede participar en dos sesiones desde el mismo navegador sin perder ninguna.
- **En el servidor.** El receptor guarda un archivo por sesión, usuario y participación.
- **Duplicar.** Una sesión nueva puede copiar los datos y las cuentas de otra, siempre con contraseñas nuevas y
  sin copiar las respuestas.

## Qué hace el investigador

Todo desde `administrador.html`, que abre con doble clic o desde el sitio. Vea `guia-investigador.html`.

0. **Estudios.** Varias sesiones de simulación guardadas por separado: crear, duplicar con cuentas nuevas, abrir y eliminar.
1. **Estudio.** Datos del estudio, texto adicional de la declaración y forma de entrega.
2. **Cuentas.** Una cuenta por participante, con su rol. El panel genera usuario, contraseña e invitación.
3. **Publicar.** Descarga `configuracion.js` (y `recibir-config.php` si hay receptor) para quien publica. También genera un simulador de un solo archivo con las cuentas reales.
4. **Respuestas.** Importa los archivos que le envían o los trae del servidor.
5. **Seguimiento.** En qué va cada participante, qué respondió y qué problemas tuvo.
6. **Resultados.** Informe consolidado por rol y ronda, tablas en CSV, datos en JSON e informe imprimible.

## Seguridad y privacidad: qué es y qué no es

- El acceso del simulador se comprueba en el navegador. Asigna el rol y evita entradas por descuido. **No es un mecanismo de seguridad.** La protección del sitio es del servidor: HTTPS y control de acceso.
- La configuración publicada no contiene contraseñas: solo su huella (PBKDF2-HMAC-SHA256, 5000 iteraciones, sal por cuenta).
- Las respuestas no llevan la contraseña ni su huella. Los datos personales son opcionales y van solo en la ficha del participante; en los registros la persona aparece con el alias de su cuenta.
- Cada documento de respuestas trae una huella de integridad. Detecta archivos alterados o incompletos; no prueba quién lo escribió.
- Ninguna página hace peticiones a terceros.
- El texto de la declaración es una plantilla. Debe validarse con el comité de ética de la institución antes de usarla.

## Decisiones de contenido que conviene confirmar

- **Evidencia propia.** Un actor no necesita contrato para usar la evidencia que él mismo custodia (por ejemplo, la EPS y los certificados de incapacidad en A2).
- **D1, empleador e historia clínica.** El paso dice que el empleador «reubica con las restricciones (vista mínima)», pero su contrato no incluye la historia clínica. El simulador le concede en D1 los campos «restricciones funcionales» y «concepto de rehabilitación» (`GUION.vistasPaso` en `src/datos-guion.js`) y lo advierte en pantalla como supuesto de la simulación (`GUION.pasos.D1.supuesto`).
- **ARL en E5.** Responde como apoyo, igual que en la herramienta de mesa. La situación del catálogo que le pedía decidir si asume la prestación no se muestra (`GUION.retosOmitidos`).
- **Pregunta «frente a hoy» en la ronda 1.** Se conserva en las dos rondas para poder comparar y se explica con una nota.
- **Sin ejemplos de respuesta.** Las actividades no muestran ejemplos, para no inducir las respuestas.
- **Hipótesis H1 a H4.** Conservan su formulación «pendiente de confirmar» de `datos-escenario.js`.

## Construcción

```
cd entregables/simulador-offline
python3 src/build.py
```

`build.py` toma de `../blueprint-simulacion`, sin copiarlos, el contenido doctoral (`src/datos-blueprint.js`, `src/datos-escenario.js`), el sistema visual (`src/theme.css`) y el kit de iconos. Lo propio de esta versión está en `src/`:

| Archivo | Contenido |
|---|---|
| `CONTRATO.md` | Formatos e interfaces: cuentas, configuración, documento de respuestas, registros, receptor y panel |
| `nucleo.js` | Utilidades comunes: pintado estable, iconos, SHA-256 y PBKDF2, huella de integridad, reglas del blueprint, CSV |
| `datos-guion.js` | Textos de orientación, declaración y conducción |
| `sim-1-estado.js`, `sim-2-vistas.js`, `sim-3-eventos.js` | Simulador: estado y conductor automático, pantallas, eventos |
| `adm-1-proyecto.js` | Panel: estudios guardados, almacenamiento, cuentas, configuración publicada y respuestas |
| `adm-2-vistas.js`, `adm-4-eventos.js` | Panel: pantallas, eventos e inicio |
| `adm-3-resultados.js` | Panel: análisis consolidado, informe imprimible y exportaciones |
| `servidor/` | `recibir.php`, `recibir-config.php`, `sw.js` y protección de la carpeta de respuestas |
| `guias/` | Guías del paquete |
| `estilos*.css`, `head-*.html`, `skel-*.html` | Estilos propios y esqueletos de página |

`simulador-artefacto.html` es el mismo simulador sin la envoltura del documento, para publicarlo como artefacto.

## Pruebas

```
node tests/motor.js            # sin navegador: los 12 roles completan las dos rondas
node tests/simulador.js        # navegador, archivo local sin red
node tests/simulador-red.js    # navegador, sitio con receptor simulado
node tests/servidor.js         # receptor PHP real con php -S
node tests/panel.js            # panel del investigador, de punta a punta
```

Requieren Node, Playwright con Chromium y, para el receptor, PHP. Las pruebas se ejecutan contra los archivos construidos: reconstruya antes de probar.

| Prueba | Qué comprueba |
|---|---|
| `motor.js` | Cada rol recorre las dos rondas y entrega un documento válido y sin credenciales. Con `--muestras` escribe doce documentos de ejemplo. |
| `simulador.js` | Los 12 roles por la interfaz desde `file://`; acceso, declaración, rechazo, recarga con borrador, pausa, cierre inesperado, corrección de respuestas, respaldo, archivo de avance, retiro, navegador sin almacenamiento; teléfono (390, 360 y 320 px), nombres accesibles, foco y teclado. |
| `simulador-red.js` | Envío a medida que avanza, caída de conexión y reintento, falla del servidor, recuperación en otro dispositivo, envío al final, retiro, reapertura sin conexión y sitio sin configurar. |
| `servidor.js` | Protocolo del receptor, validaciones, rutas maliciosas, código PHP dentro de una respuesta, límites, envíos simultáneos y recorrido de punta a punta con el simulador. |
| `panel.js` | Clave de administración, estudio, cuentas, `configuracion.js` y `recibir-config.php`, simulador de archivo único, importación (con archivos alterados y de otra sesión), seguimiento, informe y exportaciones, copia de seguridad y varias sesiones de simulación. |
