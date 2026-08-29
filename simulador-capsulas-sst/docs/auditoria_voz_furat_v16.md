# Auditoría del módulo FURAT por voz · errores E7 → E1 y correcciones E1 → E7

**Rehavid S.A.S.** · 28–29 de agosto de 2026 · Simulador Cápsulas SST · versión entregada: **v16**

## 1. Conclusión

Los siete errores reportados tienen dos raíces, no siete. La primera (E1, E4, E5, E6, E7) es la **capa de voz**: desde v11 usé el modo continuo del reconocimiento de Chrome con temporizadores propios (confirmar resultados intermedios, reintentos, retención) y esa combinación es frágil en Chrome real: sesiones que se cierran solas, resultados que llegan tarde o no llegan, y un micrófono que quedaba apagado sin que el app lo supiera. El mock de las pruebas automatizadas no reproduce esas quirks, por eso «todo pasaba» y en tu Chrome fallaba. La segunda raíz (E2, E3) es de **retroalimentación**: el app hacía cosas correctas sin decirlo en el chat y el usuario lo leía como congelamiento.

v16 reemplaza la capa de voz por el patrón más simple y probado del Web Speech API (una sesión corta por frase, encadenadas automáticamente, sin temporizadores), añade una **prueba de micrófono** al activar y un **diagnóstico** en el chat («diagnóstico») que muestra navegador, estado, último error y los últimos eventos del reconocedor. Mañana, con esos eventos a la vista, cualquier fallo restante se localiza en minutos en lugar de por deducción sobre capturas de pantalla.

## 2. Auditoría, del último error al primero

| # | Versión | Lo que viste | Causa raíz encontrada |
|---|---|---|---|
| **E7** | v15 | No pasó del capítulo I; dictaste 3 veces y no capturó nada | v15 reencendía la sesión continua tras cada cierre por silencio y, a la vez, mantenía abierta la captura de getUserMedia. En esa configuración el reconocedor arrancaba (botón rojo) pero no entregaba texto, y el app no tenía forma de saberlo ni de decírtelo: no existía ningún diagnóstico. Además, un `start()` que Chrome rechaza (sesión anterior aún cerrándose) se tragaba en silencio y no se reintentaba. |
| **E6** | v14 | Micrófono apagado sin aviso; solo se capturaban las colas de las lecturas | Al abrir el archivo directamente (`file://`) el modo manos libres estaba desactivado por diseño (temor a que Chrome pidiera permiso en cada reinicio). Cuando Chrome cerraba la sesión por silencio, el micrófono quedaba apagado, el único indicio era un cambio de texto en la barra, y tú seguías dictando; al tocarlo de nuevo solo entraba lo que decías después. |
| **E5** | v13 | Había que repetir respuestas varias veces | Tres causas: (a) en modo continuo Chrome tarda segundos en marcar «final» una frase corta y no había respuesta visible mientras tanto; (b) lo dicho mientras el asesor «escribía» se descartaba; (c) «cédula de ciudadanía» se confundía con el atajo «cédula: <número>». Las correcciones de v13 (confirmar intermedios estables, retener voz) mitigaron pero añadieron temporizadores que después empeoraron E6–E7. |
| **E4** | v13 | «Se congeló» tras dictar un número | No estaba congelado: el dato se registró en la tarjeta del guion (fuera de la vista) y el asesor no lo confirmaba en el chat; además el mensaje anterior decía «dato 8» cuando la tarjeta ya no mostraba números. Faltaba acuse por dato y estado acumulado. |
| **E3** | v13 | «Capté 7… luego Capté 6» | Cada mensaje contaba lo extraído de esa lectura parcial, no el acumulado del guion. Mensaje engañoso, no error de datos. |
| **E2** | v12 | Guion con numerales incómodos; había que bajar a la leyenda | Diseño: el número dentro del espacio obligaba a buscar la leyenda. Corregido en v13 con la guía en color dentro de cada espacio. |
| **E1** | v10 | Permiso de micrófono en cada respuesta | Cada respuesta abría una sesión nueva de reconocimiento y Chrome no recuerda el permiso para archivos `file://`. Mitigado desde v11 manteniendo abierta una captura de audio (getUserMedia) que sostiene el permiso; desde entonces no volviste a reportar prompts. |

Errores de mi proceso, también auditados: (1) confié en pruebas con un reconocedor simulado para validar comportamiento de Chrome real; (2) corregí síntomas con temporizadores en lugar de simplificar la capa de voz; (3) no di al usuario ningún instrumento para ver qué hacía el micrófono.

## 3. Correcciones aplicadas, del primero al último (todas en v16)

1. **E1 · permiso único.** Se conserva la captura de audio abierta durante la entrevista (se libera al terminar o reiniciar) y se pide el permiso una sola vez al tocar «🎙️ Activar micrófono». Funciona con el archivo abierto directamente; `iniciar_demo.py` deja de ser necesario.
2. **E2 · guía en color** en cada espacio del guion (sin números ni leyenda); dato puntual nombrándolo («teléfono: 310…»).
3. **E3 · estado acumulado** en cada mensaje: «Llevo x de y datos de este guion. Faltan: (…). Dime ahora (…)».
4. **E4 · acuse por dato** dictado («✅ (…) → valor · Ahora (…)»), «¿qué pasó?»/«ayuda»/«?» responden con el estado, y una red de seguridad convierte cualquier error interno en un mensaje del asesor en lugar de silencio.
5. **E5 · reconocimiento simplificado.** Nueva capa de voz: una sesión **no continua** por frase; Chrome cierra la sesión al final de cada frase y entrega el texto final; el app abre la siguiente sesión de inmediato (120 ms) y un vigilante la reabre cada 1,5 s si algo se pierde. Sin resultados intermedios como respuesta, sin temporizadores de confirmación, sin deduplicación. Lo dicho mientras el asesor escribe se retiene 8 s y se aplica al siguiente espacio. La descripción larga se acumula por frases y se cierra con una pausa de 3,5 s o diciendo «listo».
6. **E6 · micrófono que no muere.** Manos libres con el archivo abierto directamente; estados visibles («🔴 escuchando», «🎙️ reconectando…»); si queda apagado (permiso denegado, sin conexión, pausa manual) el asesor lo dice en el chat y explica cómo seguir. Un permiso denegado o la falta de internet detienen los reintentos.
7. **E7 · visibilidad.** Prueba rápida al activar («di *probando uno dos tres*»): si en 12 s no llega texto, el asesor muestra el diagnóstico y deja escribir. En cualquier momento, «diagnóstico» (por voz o escrito) muestra navegador, origen, estado, último error, pistas y los últimos 14 eventos del reconocedor; también está anotado en el panel lateral del escritorio.

Verificación automatizada (reconocedor simulado, ahora con sesiones no continuas): `test_furat.py` **80/80**; suite base `audit_simulador.py` **26/26**. Esta verificación demuestra la lógica del app, no el comportamiento de Chrome: eso se valida mañana con la prueba de micrófono y el diagnóstico.

## 4. Plan para mañana

1. Abrir `simulador_capsulas_sst_v16.html` en **Google Chrome** (no Chromium/Brave: sin claves de Google el reconocimiento devuelve siempre «network»). Con internet.
2. FURAT → guiones → «Activar micrófono» → permitir → decir «probando uno dos tres». Tres resultados posibles:
   - «✅ Te escuché…»: la voz funciona; se continúa con los guiones.
   - Aviso a los 12 s: escribir «diagnóstico» y enviarme la captura. El último error dirá si es permiso (`not-allowed`), sin micrófono (`audio-capture`), sin internet o cuenta de Google (`network`), o sesiones que arrancan sin texto (dispositivo de entrada equivocado en el candado de Chrome).
   - Si Chrome vuelve a pedir permiso en cada frase: es la señal de que la captura abierta no sostiene el permiso en su versión de Chrome; en ese caso el plan B es publicar el HTML en https (un archivo, sin backend) o usar `iniciar_demo.py`.
3. Con la voz confirmada, repetir el guion 1 completo de un tirón y enviarme el chat: con los eventos del diagnóstico ajusto en minutos anclas, sinónimos o tiempos.

## 5. Archivos

- `simulador_capsulas_sst_v16.html` — app completa (funciona abierta directamente).
- `test_furat.py` — suite del módulo FURAT (80 verificaciones) · `audit_simulador.py` — suite base (26).
- `iniciar_demo.py` / `iniciar_demo.bat` — opcionales.
