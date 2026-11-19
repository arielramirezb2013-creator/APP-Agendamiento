# Simulación de la ruta de incapacidad · versión individual (asíncrona)

Versión de la herramienta para cuando no es posible reunir a los participantes. Cada persona entra sola, con el usuario y la contraseña que el investigador le asignó según su rol, y recorre la simulación con los demás actores simulados. Reemplaza la conducción en vivo de `../blueprint-simulacion` por un conductor automático y conserva el mismo contenido doctoral.

## Dos instrumentos

El investigador elige en el panel cuál se aplica. Los dos usan las mismas cuentas, la misma declaración de participación, la misma encuesta de perfil y el mismo panel.

| Instrumento | Qué recorre el participante | Qué mide | Dura |
|---|---|---|---|
| **Expediente de pensión de invalidez** (marco `DGIT-PENSION-R1`, el que viene puesto) | Uno de los cuatro expedientes sintéticos, dos veces: con los canales del flujo actual y con el módulo interoperable | H1 completitud de la evidencia en el punto que resuelve, H2 identificación de responsabilidades, H3 trazabilidad de los accesos | 25 a 45 min según el rol |
| **Recorrido de la ruta de incapacidad** | Los once pasos del service blueprint, comparando en cada paso lo de hoy con lo del módulo | Suficiencia de la información, finalidades, plazos y valoración de cada contrato de datos | 25 a 40 min según el rol |

## Los entregables

Las **cuentas de demostración** (usuarios `demo-…`, contraseña pública `DEMO-2026`) existen **solo en los archivos de demostración**. Lo que se publica para uso real no lleva ninguna: las cuentas del estudio las crea el investigador en su panel.

| Entregable | Archivo | Para qué |
|---|---|---|
| **Demostración** | `simulador-demo.html` | Abre con doble clic, sin conexión. Trae los cuatro expedientes sintéticos y quince cuentas de demostración: una por rol en PI-L01 y el ARL en PI-L02, PI-L03 y PI-L04. Sirve para conocer la herramienta, mostrarla y ensayar. Sus respuestas quedan marcadas y no entran al análisis. **No se publica para el estudio.** |
| Demostración del otro instrumento | `simulador-ruta-demo.html` | Igual, con el recorrido de la ruta de incapacidad y una cuenta de demostración por rol. Guarda su avance aparte de la otra demostración. |
| Demostración para artefacto | `simulador-demo-artefacto.html` | La misma demostración del expediente, sin la envoltura del documento, para publicarla como artefacto de consulta. No se publica para el estudio. |
| **Uso real · sitio web** | `paquete-web.zip` (carpeta `paquete-web/`) | Lo que se publica en Azure: simulador, panel del investigador, receptor opcional y guías. Su `configuracion.js` es una **plantilla sin estudio y sin cuentas**: hasta que se reemplaza por la que genera el panel, el sitio dice que no está configurado y no deja entrar a nadie. |
| Documentos sintéticos | `documentos-sinteticos.html` | Para el investigador: todos los documentos de los casos —solicitudes, dictámenes, constancias, certificados, historias clínicas con exámenes e imágenes diagnósticas, informes de higiene y de puesto, historia laboral—, con las dos versiones de cada soporte que tiene una. **No se publica a los participantes.** |
| **Uso real · archivo único** | `simulador.html` | El mismo simulador, **sin cuentas**. Es la base que el panel convierte en «simulador en un solo archivo» con las cuentas del estudio (momento «Publicar»). Abierto tal cual, explica eso y no deja entrar. |

Contenido del paquete: `index.html` (simulador), `configuracion.js` (plantilla sin cuentas, que se reemplaza por la del panel), `sw.js` (reapertura sin conexión), `administrador.html` (panel del investigador), `recibir.php` con `recibir-config.php` y `respuestas/` (receptor opcional), `guia-investigador.html`, `guia-despliegue.html` y `LEEME.txt`. La demostración no viaja dentro del paquete.

## Qué hace el participante

Lo común a los dos instrumentos:

1. **Acceso.** Usuario y contraseña. La cuenta define el rol: trabajador, empleador, IPS, EPS, ARL, AFP, Junta Regional, Junta Nacional, MinTrabajo, MinSalud, SuperSalud o Jueces.
2. **Orientación**, en cuatro pantallas: qué es el estudio y qué se busca; el caso o el expediente con el que va a trabajar; cómo funciona la simulación; y qué le toca a su rol, en primera persona.
3. **Declaración de participación voluntaria.** Información del estudio, cuatro declaraciones necesarias y datos personales opcionales. Quien no acepta sale sin que quede nada guardado.
4. **Encuesta de perfil profesional.** Después de la declaración: edad, profesión de base, estudios complementarios, años en el rol, rol actual, trayectoria por entidades y con qué frecuencia participa en la ruta. No pide su nombre ni el de su entidad; sirve para leer sus respuestas sabiendo desde qué experiencia las da.
5. **Entrega.** Envío al receptor del sitio o descarga de un archivo que le manda al investigador, con un comentario final opcional.

Con el **instrumento del expediente**, entre la encuesta y la entrega:

- **El expediente**, con su ficha completa: la persona, su trayectoria laboral con empresas y cargos, lo clínico, la cronología, los actores con lo que custodia cada uno y los puntos de decisión con la evidencia que exige cada uno.
- **Las dos condiciones**, una después de la otra, en el orden que alterna el simulador según la cuenta, con el expediente reiniciado al empezar la segunda. En cada punto ve los soportes requeridos con su estado y su criterio de conformidad, declara con qué finalidad consulta, y puede consultar, solicitar o devolver lo que no cumple el criterio. Cada actuación cuesta horas virtuales —menos con el módulo— y hay un corte de 48 horas por condición. Decide, dice por qué y puede añadir lo que quiera.
- **Las preguntas de cierre**: a quién le corresponde cada una de las seis tareas del expediente (H2) y la reconstrucción de cuatro accesos con sus cinco elementos —quién, qué pieza, en qué momento, qué acción y con qué resultado— (H3).

Con el **recorrido de la ruta**, en su lugar:

- **Un recorrido de los once pasos.** Donde su rol interviene responde una actividad corta y compara, en el mismo paso, lo que haría hoy con lo que haría con el módulo; donde no interviene, lee el contexto y puede dejar una observación. Al cerrar valora el contrato de datos de su rol y responde cuatro preguntas de cierre (P1 a P4 en los datos).

**Los documentos del caso.** Cada soporte del expediente y cada pieza de la ruta que el participante tiene en la mano se abre como documento («Ver el documento»): la solicitud con su radicado, los dictámenes con sus tablas de deficiencia y rol laboral, las constancias, los certificados de afiliación y de IBC, la historia clínica con sus consultas, exámenes (espirometría, audiometría, neuroconducción) e imágenes diagnósticas (resonancia, radiografía de tórax) en esquema, los informes de higiene y de puesto con sus mediciones, la historia laboral. Son sintéticos —identificaciones con el prefijo `SIM-`, profesionales inventados, ningún logotipo, marca de agua en cada hoja— y coinciden con el instrumento: la versión no conforme tiene de verdad el defecto que la hace no conforme y la de referencia lo resuelve. En el expediente se abre la versión que el participante tiene en la mano, solo si la puede ver (la consultó con una finalidad autorizada, llegó al pedirla o ya estaba conforme). En la ruta, lo que no llegó a su entidad aparece tachado y no viaja en la página. Abrir un documento no cuesta horas ni queda registrado. El formato está en `src/docs/FORMATO.md`.

**Lo que ve el participante y lo que queda para el investigador.** Los códigos con que se asocian y analizan los resultados no aparecen en las pantallas del participante, ni siquiera en lo plegado, en las listas o en las etiquetas accesibles. En su lugar se lee lenguaje llano:

| En los datos y en el panel | Lo que lee el participante |
|---|---|
| Hipótesis H1–H3 (y H1–H4 de la ruta), subpreguntas SP, notas de medida y puntajes | Nada: la medida es asunto del investigador |
| Identificadores del caso y del marco (PI-L01, DGIT-PENSION-R1) | «El expediente de Mateo Roldán Vega» |
| Puntos P1, P2, P3 | «Punto 1 · Verificar dictamen y cobertura» |
| Soportes FIR, DIC, HC, AUD… | Su nombre: «la constancia de firmeza», «el dictamen de PCL» |
| Tareas y accesos R01, A1… de las preguntas de cierre | Numerados 1, 2, 3 |
| Pasos de la ruta A1–A3, E1–E5, D1–D3 | «Paso 7 · Apelación · validación experta» |
| Piezas de la ruta HC, APT, INC, HL, DIC | «historia clínica», «matriz de exposición»… |
| Rupturas r1–r5 y reglas ①–⑤ | El texto de la ruptura o el nombre de la regla |
| Preguntas de cierre P1–P4 | El enunciado de cada pregunta |
| «10 d.h.» | «10 días hábiles» |

Se mantienen las siglas del sector que el participante conoce (EPS, ARL, AFP, IPS, PCL, IBC, SG-SST, CIIU), los códigos diagnósticos CIE-10, los números de documento dentro de los soportes sintéticos (DIC-L02, RAD-L01), las iniciales «M.P.» de la persona del caso de la ruta y las referencias de jurisprudencia (T-…, SU-…). Los registros, el archivo de respuestas, el panel y el informe conservan todos los códigos. La traducción ocurre al pintar (`casoVista()` y `llano()` en el expediente; `llanoRuta()` y `pzN()` en la ruta), sin tocar los datos compartidos con la mesa ni el perfil sintético.

En esta versión la ruta se recorre una sola vez, con la ruta como funciona hoy; la comparación con el módulo se responde dentro de cada paso, una vez que el participante respondió lo suyo («Lo que el módulo añadiría a lo que usted tiene ahora»). Al cerrar, el contrato de datos se presenta como lo que el módulo propondría para su rol y la pantalla le pide decir si lo aceptaría.

Cada paso abre con un relato de qué está ocurriendo con el caso en ese momento y qué se juega allí, distinto en cada ronda. Debajo queda plegado el mapa del paso con los carriles del blueprint, y las preguntas llevan una línea que explica para qué se pregunta, sin sugerir la respuesta.

**Regla del relato.** Los once pasos tienen una decisión en `ESC.decisiones`, así que en los once el relato narra en qué estado llega el caso, por dónde viaja la evidencia y qué queda registrado, y deja en condicional el acto del rol que decide en ese paso: «de esa consulta depende si…», «lo que la EPS resuelva…», «el responsable del SG-SST decide qué manda…». Nunca nombra la opción elegida. Las dos rondas cierran con el mismo tipo de frase —qué queda registrado, dónde y a cargo de quién—, para que el tono no telegrafíe la respuesta.

Donde la simulación supone algo que la matriz de contratos no autoriza, lo dice en el propio paso (es el caso de D1 con el empleador). La ronda 1 no explica las reglas del módulo: la comprobación de la finalidad se presenta allí como una comparación con el contrato que se propondrá, sin marcarla en verde ni en rojo.

Las preguntas que se comparan entre rondas se formulan igual en las dos: la valoración del contrato, la comparación «frente a hoy» y, en la actividad de custodia, qué entrega y cuántos días. Si el enunciado cambiara de una ronda a otra, el informe compararía respuestas a preguntas distintas.

El sistema hace de los actores que no están conectados: pide evidencia al custodio, consulta por el módulo con la vista mínima del contrato, notifica y registra acuses. Todo lo que genera el sistema queda marcado como simulado y se cuenta aparte, y el registro distingue los actos de la propia entidad del participante de la reacción de los actores simulados.

## El instrumento del expediente

El catálogo está en `src/datos-expedientes.js`, transcrito del documento del instrumento: el marco (pregunta, problema, tres subpreguntas y tres hipótesis con su variable y su regla), el protocolo (aplicación, reinicio, corte de 48 horas virtuales y las dos condiciones), las catorce piezas de soporte, los tres estados de conformidad y los cuatro expedientes.

| Expediente | Quién solicita | Puntos | Punto que resuelve | Conformes al radicar |
|---|---|---|---|---|
| PI-L01 | Mateo Roldán Vega, montacarguista | P1 · P2 · P3 | P2 | 4 de 5 |
| PI-L02 | Javier Pardo Navas | P1 · P2 | P2 | 2 de 4 |
| PI-L03 | Mónica Beltrán Rivas | P1 · P2 · P3 | P2 | 2 de 4 |
| PI-L04 | Elena Marín Cuéllar | P1 · P2 | P2 | 4 de 6 |

Cómo se miden las tres hipótesis:

- **H1 · completitud.** Elementos requeridos disponibles y conformes ÷ total de requeridos, en el punto que resuelve, comparando las dos condiciones del mismo expediente en puntos porcentuales. Un soporte solicitado no cuenta hasta que llega, se verifica contra su criterio y se acepta. La diferencia se calcula participación por participación, de modo que cada persona es su propio control.
- **H2 · responsabilidades.** Aciertos sobre las seis tareas del expediente, contra la respuesta de referencia del documento.
- **H3 · trazabilidad.** Accesos reconstruidos por completo sobre cuatro: cuentan solo si coinciden los cinco elementos. El informe también reporta cuántos elementos de los veinte acertó cada persona y cuál de los cinco se pierde más.

Lo que el recorrido respeta del protocolo: el expediente se reinicia entre condiciones, el orden se alterna entre participantes, queda la instantánea anterior a la decisión que resuelve, los estados solo cambian cuando el soporte llega y se acepta, y el corte de 48 horas no se puede pasar: una actuación que no alcance se rechaza diciendo cuántas horas quedan.

Decisiones de diseño del recorrido, para que quepa en los 45 minutos del estudio sin perder la medida:

- Los puntos **posteriores** a la decisión que resuelve se leen como tramo ilustrativo —con lo que quedaría conforme según el expediente que el participante deja— en lugar de volverse a decidir en cada condición. Afecta igual a las dos condiciones, así que la comparación no se desequilibra.
- Un rol que **no decide** pero custodia algo que un punto requiere recorre ese punto desde su lado (entregar o no lo que se le pide) y lee el contexto de los demás; también responde H2 y H3.
- El **control de acceso por finalidad** se aplica de verdad: una consulta declarada como control administrativo no abre las piezas clínicas (HC, AUD, FUN) y la denegación queda registrada.

## Pausa, reanudación y fallas

- El avance se guarda en el dispositivo en cada cambio, con una copia de respaldo.
- «Pausar» explica cómo retomar. Al volver a entrar aparece «Bienvenido de nuevo» con el paso donde quedó y cuánto lleva.
- Si la página se recarga o el navegador se cierra de forma inesperada, se restablece el mismo paso con el borrador del formulario.
- Si se cae la conexión, la simulación continúa. Con receptor, los envíos pendientes salen solos al volver la conexión.
- En el sitio web, después de la primera visita la página abre aunque no haya conexión.
- Para continuar en otro dispositivo: con receptor, basta entrar con el mismo usuario y contraseña; sin receptor, se descarga un archivo de avance y se carga en el otro equipo. Con el instrumento del expediente, el estado del expediente viaja en el documento —lo que cada soporte alcanzó a conseguir, las horas gastadas, los accesos y los puntos cerrados—, así que al retomar vuelve como estaba.
- Si el navegador no permite guardar, el simulador lo advierte y sigue funcionando mientras la pestaña esté abierta.
- Cuando el investigador sube una configuración nueva —la primera, sobre la plantilla del paquete, o una con cuentas cambiadas—, el simulador la vuelve a pedir al abrirse y, si cambió y la persona todavía no ha entrado, se recarga una vez. El servidor debe mandar `Cache-Control: no-cache` para `index.html`, `configuracion.js` y `sw.js`; en Apache ya lo hace el `.htaccess` del paquete.

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
1. **Estudio.** Datos del estudio, texto adicional de la declaración, **instrumento y expediente** con el que trabajan todos, los **dos perfiles de administración** y la forma de entrega.
2. **Cuentas.** Una cuenta por participante, con su rol. El panel genera usuario, contraseña e invitación.
3. **Publicar.** Descarga `configuracion.js` (y `recibir-config.php` si hay receptor) para quien publica. También genera un simulador de un solo archivo con las cuentas reales.
4. **Respuestas.** Importa los archivos que le envían o los trae del servidor.
5. **Seguimiento.** En qué va cada participante, qué respondió y qué problemas tuvo.
6. **Resultados.** Informe consolidado del instrumento que se aplique, tablas en CSV, datos en JSON e informe imprimible.

### Los dos perfiles de administración

El panel abre con dos claves distintas, y el perfil depende de la clave con la que se entre:

- **Investigador:** todo el panel.
- **Perfil técnico**, para quien ayuda a montar la herramienta: solo «Estudio» y «Publicar» —la dirección del sitio, el receptor con su prueba y los archivos para subirlos—. No ve las contraseñas de los participantes, ni las respuestas, ni el seguimiento, ni los resultados, ni las copias de seguridad; los despachadores de clics y de campos rechazan cualquier acción fuera de esa lista.

El investigador crea, cambia o quita esa clave en «Estudio → Perfiles de administración». Las dos quedan guardadas como huella PBKDF2 junto al índice del panel. Separan lo que cada perfil ve y hace dentro del panel; no cifran lo que el navegador guarda.

### Qué trae el informe del expediente

Capítulos: quiénes participaron y su perfil profesional; **H1** con la completitud en el punto que resuelve por condición, por rol, por expediente y participación por participación, las horas gastadas y el soporte en el que se rompe la completitud; las **actuaciones y decisiones** con las finalidades declaradas y lo que el control de acceso denegó; **H2** tarea por tarea con la atribución equivocada más frecuente; **H3** con el elemento que más se pierde y el detalle de cada acceso; **lo que escribieron** los participantes, con una caja de búsqueda que filtra por cualquier columna; y el **registro completo**, para auditar cualquier cifra.

## Seguridad y privacidad: qué es y qué no es

- El acceso del simulador se comprueba en el navegador. Asigna el rol y evita entradas por descuido. **No es un mecanismo de seguridad.** La protección del sitio es del servidor: HTTPS y control de acceso.
- La configuración publicada no contiene contraseñas: solo su huella (PBKDF2-HMAC-SHA256, 5000 iteraciones, sal por cuenta).
- Las respuestas no llevan la contraseña ni su huella. Los datos personales son opcionales y van solo en la ficha del participante; en los registros la persona aparece con el alias de su cuenta.
- Cada documento de respuestas trae una huella de integridad. Detecta archivos alterados o incompletos; no prueba quién lo escribió.
- Ninguna página hace peticiones a terceros.
- Los accesos de administración están protegidos y sus credenciales no aparecen en las exportaciones.
- El texto de la declaración es una plantilla. Debe validarse con el comité de ética de la institución antes de usarla.

## Decisiones de contenido que conviene confirmar

- **Evidencia propia.** Un actor no necesita contrato para usar la evidencia que él mismo custodia (por ejemplo, la EPS y los certificados de incapacidad en A2).
- **D1, empleador e historia clínica.** El paso dice que el empleador «reubica con las restricciones (vista mínima)», pero su contrato no incluye la historia clínica. El simulador le concede en D1 los campos «restricciones funcionales» y «concepto de rehabilitación» (`GUION.vistasPaso` en `src/datos-guion.js`) y lo advierte en pantalla como supuesto de la simulación (`GUION.pasos.D1.supuesto`).
- **ARL en E5.** Responde como apoyo, igual que en la herramienta de mesa. La situación del catálogo que le pedía decidir si asume la prestación no se muestra (`GUION.retosOmitidos`).
- **Pregunta «frente a hoy» al cerrar el recorrido.** Se valora un contrato que el participante todavía no vivió: la pantalla lo dice así.
- **Sin ejemplos de respuesta.** Las actividades no muestran ejemplos, para no inducir las respuestas.
- **El relato y el rol de M.P.** El relato describe por dónde viaja la evidencia, y en algunos pasos eso incluye la gestión que hoy recae sobre la trabajadora (en A3, que es ella quien tiene que pedirle la matriz al empleador). Es contenido del blueprint y es el hecho que el módulo pretende cambiar, pero para el rol de M.P. queda escrito encima de la pregunta «¿qué le tocó hacer por su cuenta?». Al leer ese indicador conviene tenerlo presente.
- **Hipótesis.** El instrumento del expediente trae las tres del documento del marco (H1 completitud, H2 identificación de responsabilidades, H3 trazabilidad de los accesos), textuales y con su regla de medida. El recorrido de la ruta conserva las cuatro de `datos-escenario.js` con su formulación «pendiente de confirmar». Ninguna se reescribe ni se renombra.
- **El recorrido de la ruta se conserva** como segundo instrumento, no se reemplaza: `simulador-ruta-demo.html` y todas sus pruebas siguen en verde.

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
| `datos-guion.js` | Textos de orientación, declaración, encuesta de perfil y conducción de los dos instrumentos |
| `datos-expedientes.js` | Catálogo del instrumento del expediente: marco, protocolo, piezas, estados y los cuatro expedientes |
| `datos-ramas.js` | Reglas de consecuencia del recorrido de la ruta: lo que cambia en el caso según lo que responde el participante |
| `exp-1-motor.js` | Expediente: estado, actuaciones con su costo en horas, completitud, control de acceso, calificación de H2 y H3, y los bloques del recorrido |
| `exp-2-estado.js`, `exp-3-vistas.js` | Expediente: conducción de las dos condiciones y pantallas |
| `sim-1-estado.js`, `sim-2-vistas.js`, `sim-3-eventos.js` | Simulador: estado y conductor automático, pantallas, eventos |
| `adm-1-proyecto.js` | Panel: estudios guardados, almacenamiento, cuentas, perfiles de administración, configuración publicada y respuestas |
| `adm-2-vistas.js`, `adm-4-eventos.js` | Panel: pantallas, eventos e inicio |
| `adm-3-resultados.js` | Panel: análisis del recorrido de la ruta, informe imprimible y exportaciones, y lo que comparten los dos informes |
| `adm-5-expediente.js` | Panel: análisis del instrumento del expediente (H1, H2, H3, actuaciones, textos y registro) |
| `servidor/` | `recibir.php`, `recibir-config.php`, `sw.js` y protección de la carpeta de respuestas |
| `guias/` | Guías del paquete |
| `estilos*.css`, `head-*.html`, `skel-*.html` | Estilos propios y esqueletos de página |

`build.py` escribe por separado lo de demostración y lo de uso real. Demostración: `simulador-demo.html`, `simulador-ruta-demo.html` y `simulador-demo-artefacto.html` (la demostración sin la envoltura del documento, para publicarla como artefacto). Todo archivo con cuentas de demostración lleva «demo» en el nombre. Uso real: `simulador.html` sin configuración y el paquete web con la plantilla de `configuracion.js`. Las cuentas de demostración solo se generan para los archivos de demostración (`config_demo()`); la plantilla del paquete es `PLANTILLA_CONFIG`.

## Pruebas

```
node tests/entregables.js      # qué archivo es para qué: demostración con cuentas, uso real sin ellas
node tests/motor.js            # sin navegador: los 12 roles completan el recorrido de la ruta
node tests/expediente.js       # el instrumento del expediente: catálogo, condiciones, corte y medidas
node tests/simulador.js        # navegador, archivo local sin red
node tests/simulador-red.js    # navegador, sitio con receptor simulado
node tests/servidor.js         # receptor PHP real con php -S
node tests/panel.js            # panel del investigador, de punta a punta
node tests/documentos.js       # sin navegador: los documentos sintéticos frente al instrumento
```

Requieren Node, Playwright con Chromium y, para el receptor, PHP. Las pruebas se ejecutan contra los archivos construidos: reconstruya antes de probar.

| Prueba | Qué comprueba |
|---|---|
| `entregables.js` | Que `simulador.html` y **todos** los archivos de `paquete-web.zip` —incluidas las guías y el LEEME— no traigan ninguna cuenta de demostración, ni sus usuarios, ni su contraseña; que todo archivo que sí las trae lleve «demo» en el nombre; que digan con claridad qué falta y no dejen entrar; que la demostración no viaje en el paquete; y que `simulador-demo.html` traiga sus quince cuentas y deje recorrer los cuatro expedientes. |
| `documentos.js` | Que cada expediente traiga un documento por soporte y por versión, con el número y la fecha que dice el instrumento; que todo documento tenga la forma de `src/docs/FORMATO.md` y sus figuras los datos que necesitan; que las identificaciones sean sintéticas (`SIM-`) y no haya correos, direcciones web ni teléfonos; que ningún texto traiga códigos de análisis; que en la ruta cada campo de cada pieza esté marcado para poder tacharlo; y que el visor pinte cada documento con su marca de sintético y sin dejar ver lo tachado. |
| `motor.js` | Cada rol recorre la ruta y entrega un documento válido y sin credenciales. Con `--muestras` escribe doce documentos de ejemplo. |
| `expediente.js` | El cociente «Inicio n/m» del documento frente al que se calcula de la tabla de soportes en los diez puntos; custodios, responsabilidades y accesos coherentes; el orden alternado de las condiciones; los doce roles completan el instrumento dentro de los 45 minutos; el corte de 48 horas; un soporte pedido no cuenta hasta verificarlo y aceptarlo; la denegación de lo clínico a una finalidad de control administrativo; el reinicio entre condiciones; el contraste de horas y de completitud entre las dos condiciones; la pausa y el regreso a mitad del expediente; y que en ninguna pantalla del participante —también en lo plegado, los avisos y los formularios a medio llenar— aparezcan códigos de análisis. |
| `simulador.js` | Los 12 roles por la interfaz desde `file://`; acceso, declaración, rechazo, recarga con borrador, pausa, cierre inesperado, corrección de respuestas, respaldo, archivo de avance, retiro, navegador sin almacenamiento; teléfono (390, 360 y 320 px), nombres accesibles, foco y teclado; y que el participante no vea códigos de análisis ni nombres internos en ningún estado de la pantalla. |
| `simulador-red.js` | Envío a medida que avanza, caída de conexión y reintento, falla del servidor, recuperación en otro dispositivo, envío al final, retiro, reapertura sin conexión y sitio sin configurar. |
| `servidor.js` | Protocolo del receptor, validaciones, rutas maliciosas, código PHP dentro de una respuesta, límites, envíos simultáneos y recorrido de punta a punta con el simulador. |
| `panel.js` | Clave de administración, los dos perfiles con lo que cada uno puede hacer, estudio, elección de instrumento y expediente, cuentas, `configuracion.js` y `recibir-config.php`, simulador de archivo único, importación (con archivos alterados y de otra sesión), seguimiento (también el del expediente, por condición y punto), los dos informes con sus exportaciones, la búsqueda en los textos libres, copia de seguridad y varias sesiones de simulación. |
