# App de modelación financiera · pliego acordado

**Estado:** en espera del documento fuente. Sin él no se escribe contenido.
**Rama:** `claude/html-app-graphics-tables-76oox7`

---

## Norte del proyecto

**Modelación financiera.** Todo el contenido, las visualizaciones, el módulo
formativo y el motor de análisis se subordinan a ese foco. Si algo no sirve a la
modelación financiera, no entra.

> Nota terminológica pendiente: el encargo llegó como "modulación financiera".
> Se desarrolla asumiendo **modelación financiera** (construcción de modelos
> financieros: supuestos, proyecciones, escenarios, sensibilidad, valoración).
> Si el término apuntaba a otra cosa, corregir antes de escribir contenido.

## Documento fuente

Un `.docx`: la **carta de creación de la app**. Aún no entregado.
Es la única fuente de contenido. Se incrustará íntegro en el HTML porque el motor
de análisis funciona sin red y necesita el texto dentro del archivo.

## Entregable 1 · App HTML

Archivo **único y autocontenido**. Se abre con doble clic. Sin servidor, sin
GitHub, sin CDN, sin conexión.

Consecuencia técnica: nada de Google Fonts, ECharts ni XLSX desde CDN — que es lo
que hace la app existente en `entregables/frontend/` y por lo que esa se degrada
sin red. Los gráficos van dibujados a mano en SVG/Canvas y la tipografía va
incrustada o con alternativa local.

### Módulos

1. **Formación** · conceptos básicos e intermedios de modelación financiera.
   Público: equipo interno de Rehavid.
2. **Cómo funciona esta app** · manual de uso de esta herramienta: navegación,
   lectura de cada gráfico, uso del motor, impresión y descarga del Excel.
   Si la carta describe un producto distinto, va en sección aparte y separada.
3. **Contenido de la carta** · síntesis, gráficos, tablas e infografías, más el
   texto íntegro consultable.
4. **Motor de análisis** · ver abajo.

### Motor de análisis, lectura y sugerencias

**100 % offline y determinista.** Reglas, umbrales y diccionarios en JavaScript,
derivados de la carta y **visibles dentro de la propia app** para que se puedan
auditar.

Salidas previstas: vacíos y ambigüedades · riesgos y supuestos no verificados ·
coherencia interna (objetivos contra alcance, plazos y recursos) · ruta de
trabajo priorizada.

Límite que la interfaz debe declarar: el motor no comprende el texto. Detecta
patrones, ausencias y contradicciones formales. Es reproducible y auditable; no
sustituye a un revisor humano.

### Impresión

Justificada, centrada, ordenada. **Ninguna tabla ni gráfico partido entre
páginas.** Selector Carta / A4, por defecto Carta.

### Identidad visual

App independiente en su función, integrada en lo visual con Rehavid, según el
manual de identidad recogido en `entregables/frontend/rehavid_v13_produccion.html`:

- Tipografía Outfit
- Morado `#4025CE` · verde `#02E577` · blanco
- Texto tintado en morado, sin grises neutros
- Radios de 2 px

## Entregable 2 · Libro Excel con macros

Descargable desde el HTML. En modelación financiera el Excel no es un anexo: es
donde vive el modelo.

Debe permitir **graficar, modificar e iterar flujos y escenarios**. Gráficos,
tablas e infografías al mejor nivel que permite Excel.

### Regla de diseño obligatoria

**El libro funciona completo sin macros.** Fórmulas, gráficos, tablas y formato
condicional nativos. Las macros añaden capacidades encima; no son la condición
para que el archivo sirva.

Motivo: desde 2022 Excel bloquea las macros de los archivos descargados de
internet (*Mark of the Web*). El usuario tendría que desbloquear el archivo a
mano. Sin esta regla, "súper avanzado" se convierte en "no me funciona nada".

### Infraestructura · ya construida y probada

`herramientas/generador_xlsm/` — compresor MS-OVBA, escritor de Compound File
Binary e inyector de código VBA. 25 comprobaciones en verde, incluida
verificación cruzada con `oletools` (parser de terceros).

Pendiente de verificar en una máquina con Office: que Excel abra el archivo y
compile las macros. Aquí no hay Excel.

## Compromisos de contenido

1. **Todo dato de gráficos y tablas sale de la carta.** Si una visualización
   necesita una cifra que la carta no tiene, se marca como faltante a la vista.
   No se rellena.
2. **Lo complementario va señalado como aporte externo**, con su fuente visible,
   separado de lo que dice el documento.
3. **El análisis crítico se reporta tal cual.** Si la carta tiene datos flojos o
   conclusiones sin sustento, se dice; no se maquilla en la visualización.

## Orden de trabajo

| # | Paso | Estado |
|---|---|---|
| 0 | Generador de `.xlsm` con macros | Hecho y probado |
| 1 | Recibir el `.docx` | En espera |
| 2 | Extracción literal del documento | — |
| 3 | **Análisis crítico** — primer entregable, antes de cualquier código | — |
| 4 | Acordar qué contenido se complementa y con qué fuente | — |
| 5 | Construir el HTML | — |
| 6 | Construir el libro Excel | — |
