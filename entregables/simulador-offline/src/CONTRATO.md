# Contrato técnico de la versión asíncrona

Este documento fija los formatos y las interfaces que comparten las tres piezas de la versión asíncrona:
el **simulador** del participante, el **panel del investigador** y el **receptor** opcional del servidor.
Quien cambie una pieza debe conservar lo que aquí se describe o actualizar este documento y las otras piezas.

## 1. Qué es y cómo se entrega

La versión de mesa (`../blueprint-simulacion`) reunía a un facilitador y a varios participantes al mismo tiempo.
La versión asíncrona la reemplaza cuando no es posible reunirlos: cada persona entra sola, con el usuario y la
contraseña que el investigador le asignó según su rol, recibe una orientación, declara su participación
voluntaria, recorre las dos rondas con los demás actores simulados y entrega sus respuestas.

| Pieza | Archivo construido | Quién la usa |
|---|---|---|
| Simulador en un solo archivo, con cuentas de demostración | `simulador.html` | investigador, para probar o enviar tal cual |
| Simulador del sitio | `paquete-web/index.html` + `configuracion.js` + `sw.js` | participantes |
| Panel del investigador | `paquete-web/administrador.html` | investigador (desde su equipo o desde el sitio) |
| Receptor opcional | `paquete-web/recibir.php` + `recibir-config.php` + `respuestas/` | servidor |
| Guías | `paquete-web/guia-despliegue.html`, `guia-investigador.html`, `LEEME.txt` | quien publica y el investigador |

Todo funciona sin servidor de aplicación: el simulador y el panel son archivos estáticos que también abren con
doble clic (`file://`). No hacen ninguna petición a terceros. El receptor es opcional.

## 2. Fuentes y construcción

```
src/
  build.py              construye todo:  python3 src/build.py   (desde entregables/simulador-offline)
  nucleo.js             utilidades comunes del simulador y del panel
  datos-guion.js        textos de orientación, consentimiento y conducción (objeto GUION)
  sim-1-estado.js  sim-2-vistas.js  sim-3-eventos.js     simulador
  adm-1-proyecto.js  adm-2-vistas.js  adm-3-resultados.js  adm-4-eventos.js   panel
  estilos.css  estilos-adm.css  estilos-informe.css      estilos propios (se suman a theme.css de la mesa)
  head-sim.html  skel-sim.html  head-adm.html  skel-adm.html
  servidor/             recibir.php, recibir-config.php, sw.js, htaccess-respuestas.txt, index-respuestas.html
  guias/                guia-despliegue.html, guia-investigador.html, LEEME.txt
```

`build.py` toma de la versión de mesa, sin copiarlos, `datos-blueprint.js` (BP, SIM, SB), `datos-escenario.js`
(ESC), `theme.css` y el kit de iconos. Cada página queda así: estilos, esqueleto, kit de iconos y un único
`<script>` con todo el código dentro de una función anónima en modo estricto, en este orden: datos, `nucleo.js`
y los módulos de la página. Dentro de esa función todos los módulos comparten ámbito.

## 3. Núcleo común (`nucleo.js`)

Constantes: `INSTRUMENTO = "simulador_blueprint_asincrono"`, `FORMATO = 1`, `VERSION`, `KDF = { alg, iter }`.

| Grupo | Funciones |
|---|---|
| Pintado | `$(id)`, `pintar(id, html, conservar)`, `setHtml(el, html, conservar)`: reemplaza solo si cambió; con `conservar` mantiene desplazamiento de `.twrap`, `<details data-det>` abiertos, foco y cursor (el foco se busca por `data-act`/`data-in` + `data-arg` + `data-v`) |
| Texto | `esc(s)` (obligatorio en todo texto que llegue al HTML), `nom(id)`, `nomL(id)`, `plural(n, uno, varios)`, `etiqueta(ops, v)`, `A[id]` actor, `EV[k]` pieza, `FIN[id]` finalidad, `CIRC` |
| Iconos | `ICO` (mapa por concepto), `ico(id, sz, label)`, `icoActor(id, sz)`; `sz`: `"sm"` 16 px, sin valor 20 px, `"lg"` 24 px |
| Tiempo e identificadores | `ahora()`, `hora(t)`, `fecha(t)`, `fechaArchivo(t)`, `clone(o)`, `num(v)`, `hex(bytes)`, `azar(n)` bytes aleatorios, `uid()` |
| Cifrado | `SHA.bytes(m)`, `SHA.hex(m)`, `SHA.hmac(k, m)`, `SHA.pbkdf2(clave, sal, iter)`; `normUsuario`, `normClave`, `huellaClave(usuario, clave, sal, iter)`, `igualSeguro(a, b)` |
| Integridad | `canonico(v)` JSON con llaves ordenadas, `huellaDoc(doc)` SHA-256 del documento sin `huella` |
| Blueprint | `PASOS` (11 pasos), `PIDX`, `vModo(modo)`, `rondaDef(id)`, `modoDe(ronda)`, `reglasDe(p, modo)`, `piezasCustodia(p, actor)`, `finalidadDe(actor)`, `actividadDe(p, actor, modo)`, `bloquesDe(actor, modo)`, `vistaDe(actor, pieza, pasoId)`, `comprobarFinalidad(actor, finId, piezas, pasoId)`, `camposTxt`, `retenidosTxt` |
| Registros | `vigentesDe(regs)` descarta lo reemplazado y sus efectos, `cumple(r, filtro)`, `resumenActividad(payload)` |
| Validación | `RE_ID`, `validarConfig(c)` y `validarRespuesta(doc)`: devuelven la lista de errores (vacía si es válido) |
| Archivos | `initDescargas()`, `descargarArchivo(nombre, datos, mime)`, `csvCelda(v)` neutraliza fórmulas, `csvTabla(cols, rows)` separador `;` |

Quien necesite algo más lo añade en sus propios módulos. `nucleo.js` no se cambia sin acordarlo.

## 4. Cuentas y contraseñas

- Una cuenta = un usuario + una contraseña + un rol (`tra emp ips eps arl afp jr jn mintrabajo minsalud supersalud jueces`).
  Se recomienda una cuenta por persona.
- Usuario: `^[a-z0-9][a-z0-9._-]{0,39}$`. Se compara en minúsculas y sin espacios (`normUsuario`).
- La contraseña no distingue mayúsculas ni cuenta espacios, guiones, puntos o guiones bajos (`normClave`).
  El panel las genera con el alfabeto `ABCDEFGHJKMNPQRSTUVWXYZ23456789` en dos grupos de cuatro: `K7QF-M2XD`.
- Huella: `huellaClave(usuario, clave, sal, iter)` = PBKDF2-HMAC-SHA256 en hexadecimal de la cadena
  `usuario + "\n" + CLAVE_NORMALIZADA`, con la sal como texto y 5000 iteraciones. En Python:
  `hashlib.pbkdf2_hmac("sha256", (u + "\n" + CLAVE).encode(), sal.encode(), 5000).hex()`.
- Sal por cuenta: 16 caracteres hexadecimales aleatorios (`hex(azar(8))`).
- Llave de reanudación (no viaja en la configuración): `huellaClave(usuario, clave, sal + ":reanudar", iter)`.
  El simulador la calcula al entrar y la envía al receptor para poder recuperar el avance desde otro dispositivo.

El acceso se comprueba en el navegador. Sirve para asignar el rol y para que nadie entre por descuido, no para
proteger información: el caso es sintético. La protección real del sitio es del servidor (HTTPS y control de acceso).

## 5. Configuración del estudio (`configuracion.js`)

```js
window.SIM_CONFIG = {
  formato: 1,
  demo: { clave: "DEMO-2026" },        // solo en la configuración de demostración; si no, se omite o es null
  estudio: { id, titulo, subtitulo, programa, institucion, investigador, director, contacto, comite, cierre },
  consentimiento: { version: "1", adicional: "párrafo opcional del investigador" },   // puede traer también info, declaraciones… para reemplazar las del guion
  kdf: { alg: "PBKDF2-HMAC-SHA256", iter: 5000 },
  envio: null,                         // o { url: "recibir.php", clave: "<clave de envío>", modo: "progresivo" | "final" }
  cuentas: [ { u: "eps-01", a: "eps", s: "<sal>", h: "<huella>", p: true } ],   // p: cuenta de prueba (opcional)
  generado: "2026-11-12T19:00:00.000Z"
};
```

- `estudio.id` cumple `RE_ID` y distingue una sesión de simulación de otra. Forma parte de la llave con que el
  navegador del participante guarda el avance (`simasinc:v1:<estudio.id>:<usuario>`), así que dos sesiones
  distintas no se pisan en el mismo navegador. No se cambia con el estudio en marcha. Los campos vacíos de `estudio` toman el valor de `GUION.estudio`.
- La configuración **nunca** contiene contraseñas en claro, ni la clave de administración, ni etiquetas privadas
  de las cuentas.
- El simulador de archivo único trae la configuración dentro del HTML, en esta línea exacta:
  `<script>/*CONFIG:INICIO*/window.SIM_CONFIG_INCLUIDA=<JSON|null>;/*CONFIG:FIN*/</script>`.
  Si `SIM_CONFIG_INCLUIDA` no es `null`, manda sobre `configuracion.js`. Para producir un simulador de archivo
  único con cuentas reales se reemplaza lo que hay entre los dos marcadores por
  `window.SIM_CONFIG_INCLUIDA=<JSON>;` con `<` escrito como `<`.

## 6. Documento de respuestas

Es lo que el participante descarga (`respuestas-<usuario>-<fecha>.json`, o `avance-…` si no ha terminado) y lo
que el simulador envía al receptor. Un documento parcial sirve además para continuar en otro dispositivo.

```js
{
  instrumento: "simulador_blueprint_asincrono", formato: 1, version: "1.0",
  estudio: { id, titulo, configuracion },             // configuracion = `generado` de la configuración usada
  cuenta: { usuario, actor, prueba, demo },           // nunca la contraseña ni su huella
  participante: { id, anonimo, datos: { nombre?, entidad?, cargo?, experiencia?, correo?, telefono? }, resumen },
  consentimiento: { aceptado: true, t, version, declaraciones: { orientacion, voluntaria, academico, uso, datos? }, texto: [ … ] },
  estado: "completa" | "parcial",
  avance: { ronda, paso, hechas, total },
  escenario: "mp_sura",
  sesion: { codigo, nombre, escenario, modalidad: "asincrona", estado: "en_curso" | "cerrada", creada, cerrada?,
            rondaActual, pasoActual, rondas: { R1: { estado, iniciada?, cerrada?, pasos: { A1: { estado, iniciado?, completado? } } }, R2: … } },
  registros: [ … ],
  generado: "ISO 8601",
  huella: "<SHA-256 del resto del documento en JSON canónico>"
}
```

- `participante.id`: `p` + 16 hexadecimales, aleatorio por dispositivo. Identifica una participación. Cada
  recorrido se guarda por separado: una misma persona que recorra la simulación dos veces produce dos.
  Dos documentos con el mismo `participante.id` son versiones del mismo recorrido: vale el más reciente (`generado`).
- `participante.datos` solo trae lo que la persona decidió escribir. Si `anonimo` es `true`, viene vacío.
- En los registros la persona aparece con el alias `participanteNombre` = su usuario, nunca con su nombre.
- `cuenta.prueba` o `cuenta.demo` en `true`: no entra al análisis salvo que el investigador lo pida.

### Registros

Bitácora de solo anexar. Una corrección es un registro nuevo con `reemplaza` y `version + 1`.

```js
{ id, t, sesion, escenario, ronda: "R1" | "R2", modo: "actual" | "propuesto", paso: "A1"…"D3" | "—", dia,
  origen: "participante" | "sistema", participanteId, participanteNombre, actor, tipo, payload, reemplaza, version }
```

`vigentesDe(registros)` devuelve los que cuentan: quita los reemplazados y los efectos del sistema que nacieron
de un registro reemplazado (`payload.origenActividad`).

| `tipo` | `origen` | `payload` |
|---|---|---|
| `actividad` | participante | común: `tipo`, `obs`, `abierto`. **decide**: `suficiencia` (suficiente, parcial, insuficiente), `falta[]` piezas, `finalidad`, `decision`, `decisionTxt`, `responde` (`yo`, id de actor, `nadie`), `dias`, `notifica[]`, `comprobacion { finalidadAutorizada, piezasPermitidas{pieza:[campos]}, piezasDenegadas[], piezasPropias[] }`. **custodia**: `respuesta` (completa, parcial, denegar), `dias`, `piezas[]`, `pide`. **focal**: `sabe` (si, parcial, no), `responde`, `dias` (o null), `hizo[]`. **soporte**: `ve` (si, parcial, no), `accion` (ninguna, requerir, ordenar) |
| `valoracion` | participante | `semaforo` (aceptar, ajustar, rechazar), `ajuste`, `mejora` (mejor, igual, peor). `paso: "—"` |
| `preguntas` | participante | `P1`, `P2` (si, parcial, no), `P3[]`, `P4` texto, y `P1cual`, `P2cual`, `P3cual`. `paso: "—"` |
| `observacion` | participante | `texto`; `pasos[]` si es de un tramo de contexto; `final: true` si es el comentario de cierre |
| `solicitud` | sistema | `simulado`, `de`, `a`, `piezas[]`, `finalidad`, `autorizada`; `guion: true` si el sistema la hace para que el custodio responda; `origenActividad` si nace de una decisión |
| `consulta` | sistema | `simulado`, `de`, `a`, `pieza` (o null con `metadatos: true`), `campos[]`, `denegada`, `motivo`, `finalidad`, `guion` u `origenActividad` |
| `notificacion` | sistema | `simulado`, `de`, `a[]`, `acuse`, `nota`, `origenActividad` |
| `acuse` | sistema | `simulado`, `de`, `a`, `nota`, `origenActividad` |
| `respuesta` | sistema | `solicitud`, `de`, `a`, `respuesta`, `dias`, `origenActividad` (enlaza la respuesta del custodio) |
| `inicio_ronda`, `avance`, `cierre_ronda` | sistema | conducción automática: `ronda`; `de[]`, `a`, `bloque` |

Todo lo que el sistema hace en nombre de un actor no conectado lleva `payload.simulado: true`. En tablas e
indicadores lo simulado se cuenta y se rotula aparte de lo que respondieron los participantes.

Qué actividad tiene cada rol en cada paso lo decide `actividadDe(paso, actor, modo)`; el recorrido completo de
un rol en una ronda lo da `bloquesDe(actor, modo)`. Actividades esperadas por rol (suma de las dos rondas):
trabajador 22, empleador 14, IPS 12, EPS 14, ARL 8, AFP 6, Junta Regional 8, Junta Nacional 2, MinTrabajo 7,
MinSalud 4, SuperSalud 4, Jueces 4. Además, por ronda, una `valoracion` y un registro `preguntas`.

## 7. Receptor del servidor (opcional)

Una sola dirección (por defecto `recibir.php`, junto a `index.html`). Siempre `POST`. El cuerpo es JSON enviado
como `text/plain;charset=UTF-8` (así una petición entre orígenes no necesita verificación previa); también se
aceptan los mismos campos como formulario (`application/x-www-form-urlencoded`). La respuesta es JSON:
`{ "ok": true, … }` o `{ "ok": false, "error": "…" }` con el código HTTP que corresponda (400, 403, 404, 413, 500).

| `accion` | Campos | Respuesta |
|---|---|---|
| `probar` | `clave` | `{ ok, version, guarda: true }` |
| `guardar` | `clave`, `documento`, `reanudar` (opcional) | `{ ok, recibido }`. Reemplaza la versión anterior del mismo `estudio.id` + `cuenta.usuario` + `participante.id` |
| `recuperar` | `clave`, `estudio`, `usuario`, `reanudar` | `{ ok, documento }` con el más reciente de ese estudio y usuario cuya llave de reanudación coincide, o `documento: null` |
| `retirar` | `clave`, `estudio`, `usuario`, `participante` | `{ ok }`. Elimina ese documento |
| `listar` | `claveAdmin`, `estudio` (opcional) | `{ ok, documentos: [ { recibido, documento } ] }`. Si llega como formulario, responde como archivo adjunto `respuestas-<fecha>.json` con ese mismo contenido |
| `borrar` | `claveAdmin`, `estudio`, `usuario`, `participante` | `{ ok }` |

- `clave` es la clave de envío: está en `configuracion.js` y la conocen todos los participantes. Solo frena el
  ruido. `claveAdmin` es una clave larga y aleatoria que solo conoce el investigador; el servidor guarda su SHA-256.
- El receptor valida: instrumento y formato, identificadores con expresiones regulares estrictas, tamaño máximo
  (1 MB por documento), número máximo de documentos, y nunca usa texto del cliente para armar rutas sin validarlo.
- Guarda cada documento en `respuestas/<estudio>~<usuario>~<participante>.json.php` (la virgulilla no puede
  aparecer en un identificador, así que el nombre no es ambiguo). La primera línea del archivo es
  `<?php http_response_code(404); exit; __halt_compiler();` para que no pueda leerse desde la web aunque el
  servidor ignore `.htaccess`; el resto es un JSON con `recibido`, `reanudar_sha256` y `documento`, escrito
  con `<` y `>` como secuencias `\u` para que no quede ninguna etiqueta dentro.
- `recibir-config.php` devuelve un arreglo PHP. Con las claves vacías el receptor responde 403 a todo: no queda
  abierto por omisión. El panel genera este archivo exactamente con esta forma (las claves son cadenas entre
  comillas simples; el panel escapa `\` y `'`):

  ```php
  <?php
  // Configuración del receptor de respuestas. La genera el panel del investigador (momento «Publicar»).
  return [
      'clave_envio' => 'CLAVE-DE-ENVIO',
      'clave_admin_sha256' => 'SHA-256 en hexadecimal de la clave de administración del servidor',
      'carpeta' => __DIR__ . '/respuestas',
      'max_bytes' => 1048576,
      'max_documentos' => 2000,
  ];
  ```

  La clave de envío y la clave de administración del servidor se generan en el panel con `hex(azar(16))`
  (32 hexadecimales). El panel guarda la clave de administración del servidor en el proyecto y solo publica
  su SHA-256 (`SHA.hex(clave)`).
- El simulador llama con `credentials: "same-origin"`. Envía en segundo plano; si falla, reintenta al volver la
  conexión y cada minuto, y el participante siempre puede descargar su archivo.

## 8. Panel del investigador

El panel guarda **varias sesiones de simulación** (estudios) en el `localStorage` del navegador del
investigador, cada una con sus cuentas y las respuestas de sus participantes:

| Llave | Contenido |
|---|---|
| `simasinc-admin:v1` | índice: huella de la clave de administración, `actual` y la ficha de cada estudio (`clave`, `id`, `titulo`, `creado`, `modificado`, `cuentas`, `respuestas`, `completas`) |
| `simasinc-admin:v1:p:<clave>` | el proyecto de ese estudio |
| `simasinc-admin:v1:r:<clave>` | sus respuestas importadas |
| `simasinc-admin:v1:abierto` | desbloqueo de la pestaña (`sessionStorage`) |

`clave` es una llave interna estable (`e` + 10 hexadecimales) que no cambia aunque el investigador edite el
identificador público `estudio.id`. El formato anterior, de un solo estudio dentro de `simasinc-admin:v1`, se
migra al abrir. La clave de administración se guarda como huella (PBKDF2 con sal) y nunca aparece en ninguna
exportación. Un documento cuyo `estudio.id` corresponde a otro estudio guardado se señala y no entra en el
análisis del estudio abierto.

Momentos del panel: **Estudios** (lista de sesiones guardadas; crear, duplicar con cuentas nuevas, abrir y
eliminar), **Estudio** (datos del estudio, texto adicional del consentimiento, forma de entrega, copia de
seguridad), **Cuentas** (crear por rol, contraseñas, etiqueta privada, invitaciones), **Publicar** (descargar
`configuracion.js`, `recibir-config.php` y el simulador de archivo único con las cuentas), **Respuestas**
(importar archivos o traerlos del servidor, validar, excluir), **Seguimiento** (en qué va cada participante,
qué respondió, qué problemas tuvo) y **Resultados** (informe consolidado, tablas, exportaciones).

Interfaz entre módulos del panel:

```js
// adm-3-resultados.js: análisis puro, sin leer el estado del panel
analizar(docs, opciones)   // docs: documentos de respuestas ya validados y sin duplicados
                           // opciones: { cuentas: [{ u, a, etiqueta, p }], estudio }
                           // → { resumen, capitulos: [{ id, n, titulo, icono, intro, tablas: [id…] }], tablas: { id: { titulo, cols, rows, nota } } }
vistaResultados(an)        // → HTML del informe en pantalla (<div class="card informe" id="informe">…)
informeHtml(an, estudio)   // → documento HTML completo, imprimible en A4
csvDeTabla(an, id)         // → texto CSV de una tabla;  csvDeTodas(an) → todas, separadas por título
datosConsolidados(docs, opciones)   // → objeto para exportar como JSON, sin credenciales
```

Acciones que el informe pone en sus botones y que atiende `adm-4-eventos.js`:
`data-act="csv" data-arg="<id de tabla>"`, `csv-todo`, `informe-html`, `informe-imprimir`, `datos-json`.

## 9. Reglas que no se negocian

- No se renombra H1 como completitud ni H2 como trazabilidad. Las hipótesis se muestran tal como están en
  `ESC.hipotesis`; mientras digan «pendiente de confirmar» se dejan así.
- Los accesos de administración están protegidos y sus credenciales no aparecen en ninguna exportación.
- Los iconos son pictogramas del kit; no se dibujan logotipos de marcas reales.
- Ningún nombre, correo o dato personal del investigador se escribe en el código: se configura en el panel.
- Ninguna petición a terceros (fuentes, analítica, CDN). Todo texto dinámico pasa por `esc()`.
- Lo simulado por el sistema siempre va rotulado. No se inventan cifras: los días son los que declaran los
  participantes y los plazos del escenario son supuestos de simulación.
- Español claro, trato de usted, sin tecnicismos innecesarios. Accesible con teclado y lector de pantalla.

## 10. Pruebas

| Prueba | Qué cubre |
|---|---|
| `node tests/motor.js` | motor sin navegador: los 12 roles completan las dos rondas; con `--muestras` escribe doce documentos de respuestas en `tests/salida/muestras/` |
| `node tests/simulador.js` | navegador, archivo local sin red: los 12 roles por la interfaz, acceso, declaración, pausa, reanudación, cierre inesperado, respaldo, archivo de avance, retiro, teléfono y teclado |
| `node tests/simulador-red.js` | navegador, sitio con receptor simulado: envío a medida que avanza, caída de conexión, reintento, recuperación en otro dispositivo, envío al final, reapertura sin conexión, sitio sin configurar |
| `node tests/servidor.js` | receptor PHP real con `php -S` |
| `node tests/panel.js` | panel del investigador: clave, estudio, cuentas, publicación, importación, seguimiento, informe, copia de seguridad y varias sesiones |

`tests/lib.js` trae las ayudas comunes: `servir(dir, extra)` servidor estático en el proceso, `lanzar()`,
`pagina(ctx, errores, permitido)` que anota errores de consola y peticiones externas, `clic`, `hay`, `texto`,
`descargar`, `contador(titulo)` con `ok(cond, texto, detalle)` y `fin()`, `temporal()`, y el recorrido del
simulador por la interfaz: `entrarDemo(pg, usuario, clave)`, `pasarOrientacion`, `aceptarDeclaracion(pg, datos)`,
`llenarActividad`, `llenarValoracion`, `pantalla(pg, n)` y `recorrerInterfaz(pg, variante, parar)`.
Playwright está en `/opt/node22/lib/node_modules/playwright` (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`).
