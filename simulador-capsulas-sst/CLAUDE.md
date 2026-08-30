# Simulador Cápsulas SST · Rehavid S.A.S.

Simulador de un asesor de SST por WhatsApp para el segmento Independiente Empresa de ARL SURA. Un solo archivo HTML
sin backend (`dist/`), generado desde fuentes modulares (`src/`), 100 % autónomo desde v17 (librerías y fuente
incrustadas: cero peticiones de red; solo la voz necesita internet). Idioma del producto, del código y de los commits: español (Colombia).

## Qué hace
1. **Cápsulas** de formación (5 temas, con ramificación y quiz) — `src/data/capsulas.js`.
2. **Matriz de peligros IPEVR** (GTC 45:2012) por sector, a partir de una entrevista de un toque por peligro — `src/data/sectores.js`, motor en `src/js/engine.js`. Exporta PDF (jsPDF + autoTable), XLSX (SheetJS) y CSV.
3. **FURAT** (informe de accidente de trabajo, Res. 156/2005, formato F 2015 - PR v3) diligenciado **por voz**: el asesor escribe, la persona habla. Modo «guiones» (párrafos por capítulo con espacios en blanco que se leen o se dictan) y modo «pregunta a pregunta». Todo en `src/js/furat.js`.
4. **Conexión simulada con la base de la ARL** (`src/data/arl_db.js`, desde v18): el FURAT empieza identificando la
   empresa por NIT o cédula del empleador (demo: cédula 7700729 → «Bienvenido, Ariel Javier Ramírez», NIT 900703762);
   se elige al accidentado (el empleador o un trabajador registrado) y las secciones AF, I, II y V se autodiligencian
   desde la «base» (origen `base ARL (simulada)`), preguntando solo por el centro de trabajo y ofreciendo «corregir».
   La entrevista de voz queda solo para las secciones III y IV. Con «omitir» se diligencia todo por voz como antes.
   Al final, el asesor recuerda la investigación del accidente (Res. 1401/2007, 15 días) y los canales de ARL SURA.

## Estructura
```
src/index.html          armazón HTML (referencia css, datos y js)
src/styles.css          estilos
src/js/config.js        CONFIG (versión, persona, velocidad, preguntarFrecuencia)
src/data/*.js           contenido (cápsulas, sectores/peligros, pregunta de personas, acompañamiento SURA,
                        base ARL simulada arl_db.js: empresas por NIT/cédula y sus trabajadores)
src/js/engine.js        chat, GTC 45, matriz, exportes, modal accesible
src/js/furat.js         FURAT: campos, analizadores de voz (es-CO), guiones, capa de voz (Voice), exportes, diagnóstico
src/js/main.js          boot()
vendor/                 librerías de exporte (jsPDF 2.5.1, autoTable 3.8.2, SheetJS 0.18.5; byte-idénticas a npm)
                        y la fuente Inter variable (woff2); build.py las incrusta en el archivo único
build.py                genera dist/simulador_capsulas_sst_<version>.html (inyecta css, js en orden, imágenes,
                        librerías de vendor/ y fuente en base64: el dist no hace ninguna petición de red)
tests/audit_simulador.py  suite base (26 verificaciones, Playwright headless)
tests/test_furat.py       suite FURAT (119 verificaciones, con SpeechRecognition simulado)
docs/                   informes de auditoría y notas
iniciar_demo.py/.bat    opcional: sirve dist/ en http://localhost
```

## Cómo trabajar
- Edita solo `src/`. Luego `python3 build.py` y prueba **contra `dist/`**:
  `pip install playwright && playwright install chromium`, después
  `python3 tests/audit_simulador.py dist/simulador_capsulas_sst_v19.html out/` y
  `python3 tests/test_furat.py dist/simulador_capsulas_sst_v19.html out/`.
  Ambas suites deben quedar en 100 % antes de entregar. Para desarrollo rápido puedes abrir `src/index.html` directamente
  (el logo no sale en los PDF en ese modo y las librerías cargan del CDN; en `dist/` todo va incrustado).
- Al cambiar de versión, actualiza `version` en `src/js/config.js`; `build.py` nombra el archivo con ese valor.
- No retipes contenido: `src/data/*.js` es la única fuente de verdad de cápsulas y peligros.
- Estándar de entregables Rehavid: autor `Rehavid S.A.S.` en metadatos de PDF/XLSX; sin comentarios ni propiedades innecesarias en lo que se entrega al cliente.
- Dependencias: `vendor/` es la única fuente de las librerías del `dist` (verificadas byte a byte contra los SRI
  históricos del CDN); `src/index.html` conserva las etiquetas CDN con SRI solo para el modo de desarrollo. El `dist`
  funciona completo sin conexión (PDF, Excel, CSV y JSON incluidos); únicamente la voz necesita internet.

## Estado actual y prioridad (30/08/2026 · v19)
v17 corrige los hallazgos de la auditoría (analizadores de hora/dinero/duración/fecha, «repetir» en guiones, contador
de reinicios de voz, vigilante y carrera al reiniciar, fecha PENDIENTE, aviso de privacidad, confirmación antes de
borrar un FURAT en curso) e incrusta librerías y fuente: el archivo único no hace peticiones de red. v19 añade el
control total del micrófono: una sola activación, pausa por voz («parar», o «parar el micrófono» durante la
descripción, donde «para» suelto es narración y se acumula al relato), reanudación con un toque que repite el dato
pendiente, pausa que congela los temporizadores del dictado sin perder lo acumulado, y recuperación del permiso con
un toque tras un not-allowed (el stream se libera y el siguiente toque re-pide el permiso desde el chat). Suites:
26 + 119 verificaciones en 100 %.

El **paso pendiente sigue siendo la prueba con micrófono en Chrome real** (los mocks no reproducen a Chrome). Historial
en `docs/auditoria_voz_furat_v16.md`. Plan: publicar el `dist` en un hosting estático con HTTPS (GitHub Pages, Netlify,
Cloudflare Pages o Vercel: el permiso del micrófono queda recordado), decir «probando uno dos tres» y, si falla, pedir
«diagnóstico» y corregir según el último error (`not-allowed`, `audio-capture`, `network`, o sesiones sin texto).
Reglas que no se negocian: el HTML debe funcionar abierto directamente desde el disco; el micrófono no debe pedir permiso
en cada respuesta ni apagarse sin aviso; el asesor nunca se queda en silencio (ante cualquier fallo dice qué espera).

## Convenciones de código
- Sin frameworks ni compilación; scripts clásicos (no módulos) para que funcionen en `file://`.
- Todo texto que llega del usuario pasa por `esc()` antes de `innerHTML`; el markdown del chat solo admite *negrita* y _cursiva_.
- Analizadores de voz: `normTxt()` quita acentos y puntos de siglas; `wordsToNumbers()` convierte cifras habladas
  («un millón seiscientos mil», «nueve cero cero…», «doble cero»). Opciones de casillas en `OPT` con sinónimos (`s`).
- Guiones (`GUIONES`): plantilla con `{campo}`; el texto fijo entre campos es ancla para extraer valores de una lectura.
  Nunca dos espacios seguidos sin texto de enlace; evitar una sola palabra como ancla entre datos.
