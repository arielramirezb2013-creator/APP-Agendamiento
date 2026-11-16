# Contrato técnico de la versión asíncrona

Este documento fija los formatos y las interfaces que comparten las tres piezas de la versión asíncrona:
el **simulador** del participante, el **panel del investigador** y el **receptor** opcional del servidor.
Quien cambie una pieza debe conservar lo que aquí se describe o actualizar este documento y las otras piezas.

## 1. Qué es y cómo se entrega

La versión de mesa (`../blueprint-simulacion`) reunía a un facilitador y a varios participantes al mismo tiempo.
La versión asíncrona la reemplaza cuando no es posible reunirlos: cada persona entra sola, con el usuario y la
contraseña que el investigador le asignó según su rol, recibe una orientación, declara su participación
voluntaria, responde la encuesta de perfil, recorre el instrumento con los demás actores simulados y entrega
sus respuestas.

Hay **dos instrumentos**, y el investigador elige en el panel cuál se aplica (`estudio.instrumento`): el
**expediente de pensión de invalidez** del marco `DGIT-PENSION-R1`, que es el que viene puesto, y el
**recorrido de la ruta de incapacidad** de once pasos del service blueprint. Las dos piezas de software son las
mismas: cambian el recorrido del participante y el informe del panel.

| Pieza | Archivo construido | Quién la usa |
|---|---|---|
| Demostración del expediente: quince cuentas de demostración y los cuatro expedientes | `simulador-demo.html` y, sin envoltura de documento, `simulador-demo-artefacto.html` | investigador, para conocer, mostrar y ensayar; **nunca se publica para el estudio** |
| Demostración de la ruta: una cuenta de demostración por rol | `simulador-ruta-demo.html` | ídem |
| Simulador de uso real en un solo archivo, sin cuentas | `simulador.html` | base que el panel convierte en el archivo único con las cuentas del estudio |
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
  datos-guion.js        textos de orientación, consentimiento, encuesta de perfil y conducción (objeto GUION)
  datos-expedientes.js  catálogo del instrumento de expediente (objeto EXP): marco, protocolo, piezas, estados, 4 expedientes
  datos-ramas.js        reglas de consecuencia del recorrido de la ruta (objeto RAMAS)
  exp-1-motor.js        motor del expediente (objeto EXPM): estado, actuaciones, completitud, acceso, H2 y H3, bloques
  sim-1-estado.js  sim-2-vistas.js  sim-3-eventos.js     simulador (los dos instrumentos)
  exp-2-estado.js  exp-3-vistas.js                       simulador: conducción y pantallas del expediente
  adm-1-proyecto.js  adm-2-vistas.js  adm-3-resultados.js  adm-5-expediente.js  adm-4-eventos.js   panel
  estilos.css  estilos-adm.css  estilos-informe.css      estilos propios (se suman a theme.css de la mesa)
  head-sim.html  skel-sim.html  head-adm.html  skel-adm.html
  servidor/             recibir.php, recibir-config.php, sw.js, htaccess-respuestas.txt, index-respuestas.html
  guias/                guia-despliegue.html, guia-investigador.html, LEEME.txt
```

`build.py` toma de la versión de mesa, sin copiarlos, `datos-blueprint.js` (BP, SIM, SB), `datos-escenario.js`
(ESC), `theme.css` y el kit de iconos. Cada página queda así: estilos, esqueleto, kit de iconos y un único
`<script>` con todo el código dentro de una función anónima en modo estricto, en este orden: datos, `nucleo.js`
y los módulos de la página. Dentro de esa función todos los módulos comparten ámbito.

`build.py` separa lo de demostración de lo de uso real. **Demostración**: `simulador-demo.html` (expediente, quince
cuentas `demo-…`: una por rol en PI-L01 y el ARL en PI-L02, PI-L03 y PI-L04), `simulador-demo-artefacto.html` (el mismo
sin envoltura de documento) y `simulador-ruta-demo.html` (el otro instrumento, una cuenta por rol, con su propio
`estudio.id` = `demostracion-ruta` para que su avance no se mezcle con el de la otra demostración). Todo archivo con
cuentas de demostración lleva «demo» en el nombre. **Uso real**:
`simulador.html` con `SIM_CONFIG_INCLUIDA=null` y el paquete web, cuyo `configuracion.js` es la plantilla
`window.SIM_CONFIG = null;` sin estudio ni cuentas. Todas las páginas llevan el mismo código; lo único que cambia es
la configuración incluida. Las cuentas de demostración solo las genera `config_demo()` y solo para la demostración;
`tests/entregables.js` comprueba que no aparezcan en nada de uso real.

Sin configuración válida el simulador no deja entrar y explica el caso: el sitio con la plantilla del paquete
(`CFG.plantilla`), el sitio sin `configuracion.js` (`CFG.enSitio`) o el archivo único de uso real.

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
  demo: { clave: "DEMO-2026" },        // SOLO en la demostración; la configuración del panel nunca lo lleva
  estudio: { id, titulo, subtitulo, programa, institucion, investigador, director, contacto, comite, cierre,
             instrumento: "expediente" | "ruta",     // cuál se aplica; si falta, "ruta"
             expediente: "PI-L01"…"PI-L04",          // solo con instrumento "expediente": sobre cuál trabajan todos
             perfil: "<id de caso cargado>" },       // solo con instrumento "ruta": el caso con el que recorren todos
  consentimiento: { version: "1", adicional: "párrafo opcional del investigador" },   // puede traer también info, declaraciones… para reemplazar las del guion
  kdf: { alg: "PBKDF2-HMAC-SHA256", iter: 5000 },
  envio: null,                         // o { url: "recibir.php", clave: "<clave de envío>", modo: "progresivo" | "final" }
  perfiles: [ … ],                     // casos cargados para el instrumento "ruta" (perfiles/FORMATO-PERFILES.md)
  cuentas: [ { u: "eps-01", a: "eps", s: "<sal>", h: "<huella>", p: true, perfil: "<id>", expediente: "PI-L02" } ],
           // p: cuenta de prueba; perfil: caso propio (ruta); expediente: expediente propio (lo usa la demostración;
           // el panel no lo escribe, porque el protocolo pide el mismo expediente para todos)
  generado: "2026-11-12T19:00:00.000Z"
};
```

- `estudio.id` cumple `RE_ID` y distingue una sesión de simulación de otra. Forma parte de la llave con que el
  navegador del participante guarda el avance (`simasinc:v1:<estudio.id>:<usuario>`), así que dos sesiones
  distintas no se pisan en el mismo navegador. No se cambia con el estudio en marcha. Los campos vacíos de `estudio` toman el valor de `GUION.estudio`.
- La configuración **nunca** contiene contraseñas en claro, ni las claves de administración (ni la del
  investigador ni la del perfil técnico), ni etiquetas privadas de las cuentas.
- `configuracion.js` se reemplaza en el servidor sin reconstruir la página. Al abrir, el simulador lo vuelve a
  pedir con `cache: "no-cache"` (`revisarConfiguracion()` en `sim-3-eventos.js`); si cambió y la persona todavía
  no ha entrado, recarga una vez (marca en `sessionStorage` con la huella del texto, para no entrar en bucle). Así
  un navegador que guardó la plantilla o unas cuentas viejas por frescura heurística se pone al día solo. El
  servidor debe además mandar `Cache-Control: no-cache` para `index.html`, `configuracion.js` y `sw.js`.
- `estudio.instrumento` y `estudio.expediente` entran en la firma de la configuración: si el investigador los
  cambia, el panel marca la publicada como desactualizada.
- El simulador de archivo único trae la configuración dentro del HTML, en esta línea exacta:
  `<script>/*CONFIG:INICIO*/window.SIM_CONFIG_INCLUIDA=<JSON|null>;/*CONFIG:FIN*/</script>`.
  Si `SIM_CONFIG_INCLUIDA` no es `null`, manda sobre `configuracion.js`. Para producir un simulador de archivo
  único con cuentas reales se reemplaza lo que hay entre los dos marcadores por
  `window.SIM_CONFIG_INCLUIDA=<JSON>;` con `<` escrito como `\u003c` y U+2028/U+2029 como `\u2028`/`\u2029`, como
  hacen `json_seguro()` en `build.py` y `jsonEnScript()` en el panel, para que el JSON no cierre la etiqueta.

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
  escenario: "mp_sura",                               // con el expediente: "DGIT-PENSION-R1"
  sesion: { codigo, nombre, escenario, modalidad: "asincrona", estado: "en_curso" | "cerrada", creada, cerrada?,
            // instrumento "ruta":
            rondaActual, pasoActual, rondas: { R1: { estado, iniciada?, cerrada?, pasos: { A1: { estado, iniciado?, completado? } } }, R2: … },
            // instrumento "expediente":
            instrumento: "expediente", expediente: "PI-L01", orden: ["modulo", "actual"], bloque, total,
            condiciones: { actual: { cerrada, horas, completitud }, modulo: … } },
  expediente: { … },                                  // solo con el instrumento de expediente; ver abajo
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
- `avance` es `{ ronda, paso, hechas, total }` con la ruta y `{ condicion, bloque, de, hechas, total }` con el
  expediente. `estado` es `"completa"` cuando el participante cerró todo el recorrido de su instrumento.

Con el instrumento de expediente, el documento trae además el bloque `expediente`, que es el que lee el informe:

```js
expediente: {
  marco: "DGIT-PENSION-R1", caso: "PI-L01", origen: "laboral", orden: ["modulo", "actual"], corteHoras: 48,
  condiciones: {                                    // una entrada por condición recorrida
    actual: {
      horas,                                        // horas virtuales gastadas
      soportes: { FIR: { estado, ver, visto, solicitado, llegado, verificado, aceptado }, … },
      accesos: [ { h, actor, pieza, finalidad, accion, denegado, cond } ],
      completitud: { ok, total, conformes[], faltan[], pct },     // en el punto que resuelve
      instantanea: { h, completitud },              // la que pide el protocolo, anterior a esa decisión
      puntos: { P1: { cerrado, decision, cual, completitud, horas }, … }
    },
    modulo: { … }
  },
  h2: { ok, total, pct, detalle: [ { id, dada, ref, correcta } ] },
  h3: { ok, total, pct, campos, camposTotal, detalle: [ { id, ref, campos: [ { k, dada, ref, correcta } ], correcta } ] }
}
```

Ese bloque es también lo que permite **continuar en otro dispositivo**: `restaurarDe(doc)` reconstruye con él
el estado de cada condición (`expDesdeDoc`), de modo que al retomar desde el receptor o desde un archivo de
avance vuelven los soportes conseguidos, las horas gastadas, los accesos y los puntos cerrados.

Un soporte cuenta para la completitud solo si `llegado && aceptado && estado === "conforme"`. El costo en horas
de cada actuación está en `EXPM.horas` (flujo actual: consultar 2, solicitar 20, devolver 20, verificar 1,
decidir 1; módulo: 1, 6, 6, 0,5 y 0,5) y el corte de 48 horas no se puede pasar: el simulador rechaza la
actuación que no alcance y dice cuántas horas quedan.

### Registros

Bitácora de solo anexar. Una corrección es un registro nuevo con `reemplaza` y `version + 1`.

```js
{ id, t, sesion, escenario, ronda: "R1" | "R2", modo: "actual" | "propuesto", paso: "A1"…"D3" | "—", dia,
  origen: "participante" | "sistema", participanteId, participanteNombre, actor, tipo, payload, reemplaza, version }
```

Con el instrumento de expediente, `ronda` y `modo` llevan la condición (`"actual"` o `"modulo"`), `paso` el punto
(`"P1"`…`"P3"` o `"—"`) y cada registro trae además `expediente: "PI-L01"`.

`vigentesDe(registros)` devuelve los que cuentan: quita los reemplazados y los efectos del sistema que nacieron
de un registro reemplazado (`payload.origenActividad`).

| `tipo` | `origen` | `payload` |
|---|---|---|
| `actividad` | participante | común: `tipo`, `obs`, `abierto`. **decide**: `suficiencia` (suficiente, parcial, insuficiente), `falta[]` piezas, `finalidad`, `decision`, `decisionTxt`, `responde` (`yo`, id de actor, `nadie`), `dias`, `notifica[]`, `comprobacion { finalidadAutorizada, piezasPermitidas{pieza:[campos]}, piezasDenegadas[], piezasPropias[] }`. **custodia**: `respuesta` (completa, parcial, denegar), `dias`, `piezas[]`, `pide`. **focal**: `sabe` (si, parcial, no), `responde`, `dias` (o null), `hizo[]`. **soporte**: `ve` (si, parcial, no), `accion` (ninguna, requerir, ordenar) |
| `valoracion` | participante | `semaforo` (aceptar, ajustar, rechazar), `ajuste`, `mejora` (mejor, igual, peor). `paso: "—"` |
| `preguntas` | participante | `P1`, `P2` (si, parcial, no), `P3[]`, `P4` texto, y `P1cual`, `P2cual`, `P3cual`. `paso: "—"` |
| `observacion` | participante | `texto`; `pasos[]` si es de un tramo de contexto; `cond` y `puntos[]` con el expediente; `final: true` si es el comentario de cierre |
| `encuesta` | participante | la encuesta de perfil: `edad`, `formacion`, `formacionCual`, `complementarios`, `experiencia`, `rolActual`, `trayectoria`, `frecuencia`, `otrosRoles`. `paso: "—"`. Una corrección reemplaza la anterior |
| `solicitud` | sistema | `simulado`, `de`, `a`, `piezas[]`, `finalidad`, `autorizada`; `guion: true` si el sistema la hace para que el custodio responda; `origenActividad` si nace de una decisión |
| `consulta` | sistema | `simulado`, `de`, `a`, `pieza` (o null con `metadatos: true`), `campos[]`, `denegada`, `motivo`, `finalidad`, `guion` u `origenActividad` |
| `notificacion` | sistema | `simulado`, `de`, `a[]`, `acuse`, `nota`, `origenActividad` |
| `acuse` | sistema | `simulado`, `de`, `a`, `nota`, `origenActividad` |
| `respuesta` | sistema | `solicitud`, `de`, `a`, `respuesta`, `dias`, `origenActividad` (enlaza la respuesta del custodio) |
| `inicio_ronda`, `avance`, `cierre_ronda` | sistema | conducción automática: `ronda`; `de[]`, `a`, `bloque` |
| `punto` | participante | **expediente**: `cond`, `punto`, `como` (`decide` \| `aporta`), `decision`, `decisionTxt`, `porQue`, `obs`, `completitud { ok, total, conformes[], faltan[], pct }`, `horas`, `resuelve`, `soportes [{ k, estado, aceptado }]` |
| `actuacion` | participante | **expediente**: `cond`, `punto`, `pieza`, `que` (`consultar` \| `solicitar` \| `devolver` \| `aceptar` \| `rechazar`), `finalidad`, `horas`, `denegado`, `texto`, `horasTotal` |
| `h2` | participante | **expediente**: `expediente`, `respuestas { R01…R06 }`, `calificacion { ok, total, pct, detalle }`. `paso: "—"` |
| `h3` | participante | **expediente**: `expediente`, `respuestas { A1…A4: { actor, pieza, momento, accion, resultado } }`, `calificacion { ok, total, pct, campos, camposTotal, detalle }`. `paso: "—"` |
| `inicio_condicion`, `cierre_condicion`, `cierre` | sistema | **expediente**: conducción: `cond`, `ronda`, `expediente`; al cerrar, `horas` y `completitud` |

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
| `simasinc-admin:v1` | índice: `admin` (huella de la clave del investigador), `tecnico` (la del perfil técnico, o nada), `actual` y la ficha de cada estudio (`clave`, `id`, `titulo`, `creado`, `modificado`, `cuentas`, `respuestas`, `completas`) |
| `simasinc-admin:v1:p:<clave>` | el proyecto de ese estudio |
| `simasinc-admin:v1:r:<clave>` | sus respuestas importadas |
| `simasinc-admin:v1:abierto` | desbloqueo de la pestaña (`sessionStorage`), con el prefijo del perfil que lo dejó (`i:` o `t:`) |

`clave` es una llave interna estable (`e` + 10 hexadecimales) que no cambia aunque el investigador edite el
identificador público `estudio.id`. El formato anterior, de un solo estudio dentro de `simasinc-admin:v1`, se
migra al abrir. Las dos claves de administración se guardan como huella (PBKDF2 con sal) y nunca aparecen en
ninguna exportación ni en las copias de seguridad. Un documento cuyo `estudio.id` corresponde a otro estudio
guardado se señala y no entra en el análisis del estudio abierto.

**Dos perfiles de administración.** La clave con la que se entra decide el perfil: el del **investigador**, con
todo el panel, o el **técnico**, con solo «Estudio» (ficha de lo que se publica, dirección del sitio, receptor y
su prueba) y «Publicar». Las listas `MOMENTOS_TECNICO`, `ACC_TECNICO` e `IN_TECNICO` de `adm-2-vistas.js` son las
únicas vistas, acciones y campos que ese perfil puede usar; los despachadores de clics y de campos de
`adm-4-eventos.js` rechazan todo lo demás, no solo lo que no se pinta. Es una separación de lo que cada perfil ve
y hace dentro del panel: no cifra lo que el navegador guarda.

Momentos del panel: **Estudios** (lista de sesiones guardadas; crear, duplicar con cuentas nuevas, abrir y
eliminar), **Estudio** (datos del estudio, texto adicional del consentimiento, instrumento y expediente,
perfiles de administración, casos cargados para la ruta, forma de entrega, copia de seguridad), **Cuentas** (crear por rol, contraseñas, etiqueta privada, invitaciones), **Publicar** (descargar
`configuracion.js`, `recibir-config.php` y el simulador de archivo único con las cuentas), **Respuestas**
(importar archivos o traerlos del servidor, validar, excluir), **Seguimiento** (en qué va cada participante,
qué respondió, qué problemas tuvo) y **Resultados** (informe consolidado, tablas, exportaciones).

Interfaz entre módulos del panel:

```js
// adm-3-resultados.js: análisis puro, sin leer el estado del panel
analizar(docs, opciones)   // recorrido de la ruta. docs: documentos de respuestas ya validados y sin duplicados
                           // opciones: { cuentas: [{ u, a, etiqueta, p }], estudio }
                           // → { resumen, capitulos: [{ id, n, titulo, icono, intro, tablas: [id…] }], tablas: { id: { titulo, cols, rows, nota } } }
vistaResultados(an)        // → HTML del informe en pantalla (<div class="card informe" id="informe">…)
informeHtml(an, estudio)   // → documento HTML completo, imprimible en A4
csvDeTabla(an, id)         // → texto CSV de una tabla;  csvDeTodas(an) → todas, separadas por título
datosConsolidados(docs, opciones)   // → objeto para exportar como JSON, sin credenciales
COMUN                      // utilidades que comparte el otro informe (texto, cifras, encuesta de perfil, filtro)

// adm-5-expediente.js: el otro instrumento, con la misma forma de salida
analizarExp(docs, opciones)         // → { resumen, capitulos, tablas, buscable: "textos" }
datosExpConsolidados(docs, opciones)   // opciones puede traer `analisis` para no repetir el análisis
```

Las dos funciones devuelven la misma forma, así que `vistaResultados`, `informeHtml` y los CSV sirven para los
dos informes. `resumen` puede traer `cifras`, `ficha`, `kicker` y `pie` para que el informe en pantalla y el
imprimible usen las cifras y la portada del instrumento. `an.buscable` nombra la tabla que lleva caja de
búsqueda en pantalla: filtra las filas por palabras (sin tildes, todas deben aparecer) sin tocar la exportación.
El panel elige el analizador con `esProyectoExpediente()`.

Acciones que el informe pone en sus botones y que atiende `adm-4-eventos.js`:
`data-act="csv" data-arg="<id de tabla>"`, `csv-todo`, `informe-html`, `informe-imprimir`, `datos-json`.

## 9. Reglas que no se negocian

- Cada instrumento muestra sus hipótesis tal como están en su fuente, sin reescribirlas ni renombrarlas: las
  cuatro del recorrido de la ruta, como están en `ESC.hipotesis` y mientras digan «pendiente de confirmar», y
  las tres del expediente, como están en `EXP.marco.hipotesis` (H1 completitud de la evidencia, H2
  identificación de responsabilidades, H3 trazabilidad de los accesos), con su variable y su regla de medida.
  No se mezclan ni se numeran de nuevo: son dos conjuntos distintos, de dos instrumentos distintos.
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
| `node tests/entregables.js` | qué archivo es para qué: ni `simulador.html` ni ningún archivo del zip (guías incluidas) lleva cuentas de demostración, sus usuarios o su contraseña; todo archivo que las lleva tiene «demo» en el nombre; lo de uso real lo dice al abrirse y se pone al día cuando cambia `configuracion.js` en el servidor; la demostración trae sus quince cuentas, sus cuatro expedientes y su propia orientación |
| `node tests/motor.js` | motor sin navegador: los 12 roles completan el recorrido de la ruta; con `--muestras` escribe doce documentos de respuestas en `tests/salida/muestras/` |
| `node tests/expediente.js` | instrumento de expediente: el catálogo frente al documento, el orden alternado, los 12 roles dentro de los 45 minutos, el corte de 48 horas, la conformidad que solo cuenta al verificar y aceptar, el acceso por finalidad, el reinicio entre condiciones, el contraste entre las dos y la pausa a mitad del expediente |
| `node tests/simulador.js` | navegador, archivo local sin red: los 12 roles por la interfaz, acceso, declaración, pausa, reanudación, cierre inesperado, respaldo, archivo de avance, retiro, teléfono y teclado |
| `node tests/simulador-red.js` | navegador, sitio con receptor simulado: envío a medida que avanza, caída de conexión, reintento, recuperación en otro dispositivo, envío al final, reapertura sin conexión, sitio sin configurar |
| `node tests/servidor.js` | receptor PHP real con `php -S` |
| `node tests/panel.js` | panel del investigador: las dos claves y lo que cada perfil puede hacer, estudio, instrumento y expediente, cuentas, publicación, importación, seguimiento, los dos informes con sus exportaciones y su búsqueda, copia de seguridad y varias sesiones |

`tests/lib.js` trae las ayudas comunes: `servir(dir, extra)` servidor estático en el proceso, `lanzar()`,
`pagina(ctx, errores, permitido)` que anota errores de consola y peticiones externas, `clic`, `hay`, `texto`,
`descargar`, `contador(titulo)` con `ok(cond, texto, detalle)` y `fin()`, `temporal()`, y el recorrido del
simulador por la interfaz: `entrarDemo(pg, usuario, clave)`, `pasarOrientacion`, `aceptarDeclaracion(pg, datos)`,
`llenarActividad`, `llenarValoracion`, `llenarEncuesta`, `pantalla(pg, n)` y `recorrerInterfaz(pg, variante, parar)`.
`tests/motor.js` exporta además `recorrerExpediente(M, usuario, clave, opc)`, el recorrido determinista del
instrumento de expediente que comparten `tests/expediente.js` y `tests/panel.js`.
Playwright está en `/opt/node22/lib/node_modules/playwright` (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`).
