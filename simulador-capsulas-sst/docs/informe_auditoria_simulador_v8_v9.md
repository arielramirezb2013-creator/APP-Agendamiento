# Auditoría y mejora · Simulador Cápsulas SST (v8 → v9)

**Rehavid S.A.S.** · 28 de agosto de 2026 · Archivo auditado: `simulador_capsulas_sst_v8__1_.html` (136,7 KB, 1.322 líneas)

## 1. Conclusión

El v8 no tiene errores de ejecución y su motor GTC 45:2012 es fiel: verifiqué las 44 combinaciones NP × NC contra la Tabla 8 (niveles I–IV) y la interpretación de NP contra la Tabla 5. Los problemas están en tres planos: **trazabilidad del método** (el app declara un procedimiento que no ejecuta), **calidad del entregable** (PDF ilegible y partido, sin Excel) y **deuda técnica** (dos motores duplicados, 10 funciones y 65 reglas CSS muertas, acoplamiento por índice). El v9 corrige los tres planos sin alterar una sola línea del contenido de cápsulas ni de las 39 preguntas, y supera 26/26 verificaciones automatizadas en Chromium (script incluido).

## 2. Hallazgos (v8)

| # | Severidad | Hallazgo | Evidencia |
|---|---|---|---|
| 1 | **Alta** | El NE nunca se declara. El bot dice "me dices… con qué frecuencia hay exposición" y la nota metodológica afirma "NE según la frecuencia declarada", pero cada opción de respuesta trae ND y NE empaquetados. `gAskExpo`, `EXPO_OPS`, `NEMAP` y `CTRLMAP` (el flujo de dos pasos) quedaron como código muerto. | Líneas 1258, 1272, 1299 |
| 2 | **Alta** | "9 de 9 requieren atención prioritaria" con respuestas mixtas. Con NC ≥ 25 y ND mínimo 2, casi todo cae en nivel I o II (es propiedad conservadora de GTC 45, no un error), pero sumar I + II anula la utilidad del mensaje. El motor tampoco soporta ND "Bajo" (GTC 45 Tabla 2: sin valor → nivel IV). | Corrida de prueba: 5 × I, 4 × II, 0 × III/IV |
| 3 | **Alta** | PDF: A3 a 4,6 pt (ilegible en móvil pese al claim "ideal para móvil"), autoTable partió las 27 columnas en dos páginas y las *medidas de intervención* quedaron huérfanas en la página 2; nivel III con texto blanco sobre amarillo. | `v8.pdf`, 2 páginas |
| 4 | Media | Controles existentes mal ubicados: `ctrlCols()` asigna por ND, no por tipo de control; "Amasadora; sin pausas" aparecía en la columna *Individuo*. | `ctrlCols`, línea 1252 |
| 5 | Media | Sin reinicio en móvil: `.rail` (y Reiniciar) se oculta bajo 640 px; la flecha "‹" era un `span` decorativo. | CSS línea 285 |
| 6 | Media | Deuda técnica: dos motores de chat paralelos (`state`/`playNode` y `G`/`gSay`, con `typingRow` y `typingRow2`), 10 funciones nunca invocadas, 8 `getElementById` a IDs inexistentes (`gStart()` lanzaría `TypeError`), 65 reglas CSS de versiones previas (home/fork/guión), `cond`/`adj`/`preguntas` vestigiales en `SECTORES`, `PREGUNTAS[i]` acoplado por posición a `peligros[i]`. | Análisis estático |
| 7 | Media | Dependencias CDN sin Subresource Integrity ni `crossorigin`; carga síncrona en `<head>`. | Líneas 442–443 |
| 8 | Baja | Diálogo de la matriz sin `role="dialog"`, sin gestión de foco ni trampa de tabulación; `prefers-reduced-motion` respetado solo en el motor de la matriz. | — |
| 9 | Baja | Contenido: línea ARL SURA "01800 051 1414" (verificado en sura.co: 01 8000 511 414 y 01 8000 941 414); el doc card promete "Excel" sin existir; "≤" no existe en Helvetica de jsPDF; "Nº expuestos" en realidad es el total de la empresa. | — |

Lo que **sí** está bien y se conservó: motor GTC 45 (NP, NR, niveles, aceptabilidad), escape de HTML consistente, CSV con BOM y `;` para Excel es-CO, referencia normativa por peligro (Res. 2400/1979, Dec. 1477/2014, Dec. 1496/2018, Res. 1792/1990, Res. 2646/2008, Ley 1503/2011, RETIE, Dec. 1072/2015), contenido de las cinco cápsulas y regla de 7/21/60 estándares de la Res. 0312/2019.

## 3. Cambios en v9

**Arquitectura**
- Un solo motor de chat (`say`, `options`, `bubble`) con un `run` único; `prefers-reduced-motion` → velocidad 0 en todo el app.
- Bloque `CONFIG` al inicio: `persona`, `remitente`, `velocidad`, `autor` y `preguntarFrecuencia`.
- Contenido extraído programáticamente del v8 (cero retipeo). Cada peligro tiene ID estable (`PAN-01`…`OFI-06`) y su pregunta embebida (`q`, `ops`); eliminados `cond`, `adj`, `preguntas` y los ND/NE plantilla.
- Eliminadas 10 funciones y 65 reglas CSS muertas. Scripts CDN con SRI (sha384), `crossorigin` y `defer`.

**Método GTC 45**
- `CONFIG.preguntarFrecuencia`: `false` (por defecto) conserva el flujo de un toque, pero la nota metodológica ahora dice la verdad ("NE estimado a partir de la situación descrita"); `true` pregunta el NE por peligro (Permanente 4 · Frecuente 3 · Ocasional 2 · Esporádica 1) y marca cada fila como declarada. Los peligros de sismo mantienen NE fijo = 1 (`neFijo`).
- Resultado por distribución de niveles (🔴 I · 🟠 II · 🟡 III · 🟢 IV) en chat, panel lateral, modal, PDF y Excel; manejo del caso "ningún peligro aplica".
- Soporte de ND "B" en `GTC45.valorar` (sin NP/NR, nivel IV, "Aceptable") para que el contenido pueda usarlo cuando la eficacia del control sea alta.
- Clasificación del control declarado en Fuente / Medio / Individuo por palabras clave (`clasificarControl`). Las 117 opciones clasificadas están en `clasificacion_controles.csv` para validación del equipo.
- Columna "Nº expuestos (total empresa)"; canales ARL SURA corregidos (sura.co/arl).

**Entregables**
- PDF A3 en 3 páginas: (1) ranking coloreado por NR + acompañamiento ARL SURA + método, (2) bloque A: identificación y controles existentes, (3) bloque B: evaluación, valoración y medidas, con ID y peligro repetidos, 7 pt, nivel III con texto oscuro, metadatos `Author: Rehavid S.A.S.`.
- Exporte **.xlsx** real (SheetJS 0.18.5): hoja "Matriz IPEVR" con metadatos y hoja "Método"; propiedades del libro con autor Rehavid S.A.S.
- CSV con ID y escape de `\r`; sin conexión, PDF y Excel avisan "Requiere conexión" en lugar de fallar; CSV e impresión siguen operando.

**UX y accesibilidad**
- Flecha "‹" del encabezado reinicia (visible en móvil) y todo flujo termina con "🏠 Volver al inicio".
- Diálogo con `role="dialog"`, `aria-modal`, foco al abrir, trampa de Tab, restauración de foco al cerrar; reloj de la barra de estado se actualiza cada 30 s; impresión solo cuando existe matriz.

## 4. Verificación (script `audit_simulador.py`)

```
pip install playwright && playwright install chromium
python3 audit_simulador.py simulador_capsulas_sst_v9.html salida/
```

26 verificaciones: integridad de grafos de cápsulas (nodos alcanzables, sin callejones, quiz con respuesta correcta) y de datos (39 peligros, NC ∈ {10, 25, 60, 100}, ND ∈ {10, 6, 2, B}, NE ∈ {4, 3, 2, 1}); tabla GTC 45 completa; ND "B"; flujo de matriz estándar y con NE declarado; orden por NR y NR = ND × NE × NC en cada fila; exportes PDF (3 páginas), XLSX (abre con openpyxl) y CSV (28 columnas); foco y cierre del diálogo; cinco cápsulas por todas sus ramas; comportamiento sin CDN; reinicio en móvil; cero errores de consola. Resultado en v9: **26/26**. El mismo script sirve como prueba de regresión para v10+.

## 5. Decisiones pendientes para Rehavid

1. **Valor por defecto de `preguntarFrecuencia`.** Lo dejé en `false` para no alterar la UX de un toque que diseñaron deliberadamente. Para la demostración ante ARL SURA recomiendo `true`: el argumento "no asumimos nada" solo es cierto en ese modo. Costo: ~8 toques adicionales por matriz.
2. **Uso de ND "B".** El motor lo soporta; decidir si alguna tercera opción ("controlado y verificado") debe mapear a B. Con autodeclaración sin verificación, mantener ND = 2 es la lectura conservadora; el impacto es que un negocio bien controlado nunca verá un nivel IV.
3. **Validar `clasificacion_controles.csv`** (117 filas): si alguna asignación Fuente/Medio/Individuo no convence, basta ajustar la lista `CTRL_KW` o el texto `c` de la opción.
4. **Persona de la demo.** El nombre "Carlos" sigue fijo en `CONFIG.persona`; el flujo no tiene entrada de texto. Si se desea capturar el nombre, es un cambio de diseño del chat, no de código.
5. **Cápsula "Manejo de cargas".** Dice "evita levantar más de ~25 kg solo"; la Res. 2400/1979 art. 392 diferencia 25 kg (hombres) y 12,5 kg (mujeres). No lo modifiqué por ser contenido editorial de Rehavid; sugiero citar el artículo.

## 6. Archivos

- `simulador_capsulas_sst_v9.html` — app completa (143,9 KB), autor Rehavid S.A.S.
- `audit_simulador.py` — auditoría funcional reproducible.
- `clasificacion_controles.csv` — 117 controles declarados clasificados en Fuente/Medio/Individuo.
