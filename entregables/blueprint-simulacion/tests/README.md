# Pruebas automáticas

Cuatro pruebas de navegador (Playwright con Chromium) que abren `index.html` desde un servidor propio y usan la herramienta como lo haría una persona, en modalidad presencial (almacén local del navegador, una pestaña por participante). No modifican la herramienta ni necesitan conexión.

## Cómo ejecutarlas

```
cd entregables/blueprint-simulacion
node tests/e2e.js           # regresión completa, cerca de un minuto
node tests/iconos.js        # unos 15 segundos
node tests/seguimiento.js   # unos 15 segundos
node tests/auditoria.js     # unos 20 segundos
```

Requisito: Node y Playwright con Chromium (`npm i -g playwright` y `npx playwright install chromium`). `lib.js` lo busca primero en el proyecto y después en la instalación global.

Cada comprobación imprime `OK` o `FAIL` con su nombre. Al final aparece `SIN ERRORES DE CONSOLA` (o la lista de errores) y `RESULTADO: n OK, m FAIL`. El código de salida es distinto de 0 si algo falla o si la página produjo errores de consola. Descargas, capturas y PDF quedan en `tests/salida/` (git la ignora); `SALIDA=/otra/carpeta` la cambia.

Las pruebas se ejecutan contra los HTML ya construidos. Después de cambiar algo en `src/`, hay que reconstruir con `python3 src/build.py` antes de probar.

## Qué cubre cada prueba

| Archivo | Comprobaciones | Qué cubre |
|---|---|---|
| `e2e.js` | 43 | Una sesión completa: un facilitador y siete participantes (dos representan a la EPS), dos rondas, revisión, cierre, exportaciones, recargas y accesos. |
| `iconos.js` | 8 | Iconografía: SVG decorativos, tamaños, sin acumulación al repintar, informe exportado con iconos, 390 px, archivo autocontenido desde `file://`. |
| `seguimiento.js` | 9 | Repintado estable del participante, seguimiento por participante, vista del participante en solo lectura, informe con portada e impresión a PDF. |
| `auditoria.js` | 11 | Correcciones de la auditoría de código: acceso a resultados, evidencia propia, corrección sin efectos duplicados, respuestas ajenas ocultas, CSV sin fórmulas, archivo con confirmación, sesión archivada sin cambios, salida que revoca el acceso. |
| `lib.js` | — | Ayudas comunes: servidor, navegador, clic con foco, descarga con reintento, entrada de participantes, lectura del almacén, esperas. |

### `e2e.js` por bloques

| Comprobaciones | Bloque |
|---|---|
| 1, 2, 2b | Crear la sesión con PIN; entran Ana (M.P.), Dani (IPS), Beto y Carla (EPS), Eli (ARL), Fer (Junta Regional) y Gus (AFP); cada uno ve rol, escenario, paso y acción esperada antes de iniciar. |
| 3 a 5b | Ronda 1, paso A1: la IPS ve instrucciones y ejemplo, guardar incompleto dice qué falta, el guardado se confirma, M.P. registra su vivencia con una observación. |
| 6, 6b, 7 | El facilitador recarga y sigue dentro sin PIN en la URL; el botón de avanzar aparece solo con las condiciones cumplidas; avance a A2. |
| 8 a 10 | Paso A2: finalidad no autorizada comprobada por el sistema, respuestas independientes de dos representantes de la EPS, solicitud simulada al custodio de la historia clínica, rectificación con dos versiones, avance a A3. |
| 11, 11b | De A3 a D3 con excepción justificada (sin justificación no avanza); sin rondas cerradas el cierre es «Pendiente de evidencia». |
| 12 a 16b | Valoración de los actores requeridos, cierre de la ronda 1, ronda 2 (propuesto) con acuse simulado, cierre de la ronda 2 y paso a revisión; las doce valoraciones no se mezclan entre rondas. |
| 17 a 21 | Revisar y cerrar: desacuerdo de la EPS, riesgo sin mitigación y conflicto de rol abierto, mitigación y comprobación, decisión final obligatoria, cierre documentado. |
| 22 a 22d | Informe: participantes, rondas, desacuerdos, barreras, requisitos, fórmula de cada indicador, percepción separada de observación, H1 a H4 y P1 a P4, tabla de valoraciones igual a los registros. |
| 23 a 23c | Exportaciones sin PIN ni huella del PIN: JSON completo, informe HTML con estilos, CSV de valoraciones. |
| 24 a 26 | El participante recupera identidad y estado al recargar; los resultados se abren con el código solo con la sesión cerrada; el PIN incorrecto se rechaza. |
| 27 | Vistas del participante a 1024 y 390 px sin desbordamiento horizontal (formulario de decisión, valoración, sesión cerrada y recorrido completo). |

Cada comprobación reúne varias condiciones con nombre. Si falla, la línea `FAIL` dice cuáles no se cumplen y se guarda una captura `e2e-fallo-<número>.png` en la carpeta de salida. Si la herramienta deja de responder a mitad del recorrido, la suite informa la etapa y el error, marca como `FAIL` las comprobaciones que no llegó a ejecutar y el total sigue siendo 43.

## Para ampliar las pruebas

- Los clics se hacen por DOM y con foco (`L.click`), porque la herramienta pospone el repintado mientras un campo de texto tiene el foco. Para leer la pantalla después de escribir, primero hay que mover el foco (`L.soltar`).
- Las condiciones que dependen de otra pestaña se esperan (`L.ve`, `L.esperar`), no se suponen tras una pausa fija.
- Lo guardado se lee del almacén local (una clave por documento, `sbsim_doc_v2:<ruta>`) con `L.estado(pagina, codigo)`: sesión, participantes, registros (todas las versiones) y registros vigentes.
- El orden de los participantes del mismo actor en tablas y desacuerdos depende de identificadores aleatorios: se compara sin depender del orden.
- El PIN de prueba (2468) se busca como dato suelto, no como subcadena, porque una marca de tiempo puede contener esas cifras.
- Antes de cada acción que escribe, `L.calma` espera a que no haya un latido inminente. Cada pestaña de participante escribe su señal de vida cada 30 segundos y el almacén local guarda el objeto completo desde la copia de la pestaña que escribe; dos escrituras de pestañas distintas separadas por pocos milisegundos se pisan. Sin esa espera, la suite fallaría de vez en cuando por esa razón y no por una regresión. `L.unirVarios` hace entrar a los participantes seguidos para que sus latidos queden agrupados y la espera sea corta.
- Después de la acción de un participante, los registros que produjo se leen cuando ya llegaron a la pestaña del facilitador (`asentado` en `e2e.js`), no en el instante siguiente al clic.
