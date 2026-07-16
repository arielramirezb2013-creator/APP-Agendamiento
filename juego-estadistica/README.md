# Nibble · Juego de Estadística 🎮📊

App-juego educativa (100 % HTML, sin instalación) para aprender **estadística
descriptiva, cualitativa e intermedia** jugando. Un solo archivo que corre en
cualquier computador con navegador, **incluso sin internet**.

## 🚀 Cómo usar

Abre el archivo **`nibble-estadistica.html`** con doble clic (Chrome, Edge,
Firefox o Safari). No requiere servidor, ni conexión, ni dependencias.

## 🧩 Qué incluye

- **4 niveles** con desbloqueo progresivo (hay que aprobar con ≥ 60 % para
  avanzar):
  1. **Fundamentos** — población/muestra, tipos de variable, escalas de
     medición, tablas de frecuencia, gráficos de barras y circular.
  2. **Medidas y Distribuciones** — media, mediana, moda, cuartiles, rango,
     desviación estándar, coeficiente de variación, histograma, diagrama de
     cajas, valores atípicos y asimetría.
  3. **Estadística Intermedia** — distribución normal y regla 68-95-99.7,
     probabilidad y árbol de probabilidad, correlación/dispersión, intervalo de
     confianza, prueba de hipótesis y chi-cuadrado.
  4. **Estadística Aplicada** — correlación de Pearson (r), regresión lineal
     (ŷ = a + b·x) y predicción, coeficiente de determinación R², prueba t de
     Student (H₀/H₁, valor p vs α) y ANOVA (comparación de 3+ medias).
- **Módulo de Formación** por nivel: lecciones claras con gráficos y una
  **práctica interactiva** (clasificador de variables, calculadora de
  media/mediana/moda en vivo, curva normal con sliders μ y σ, y laboratorio de
  correlación/regresión que calcula r y R² en vivo al agregar puntos).
- **Módulo de Evaluación**: 45 preguntas en total (opción múltiple, numéricas y
  verdadero/falso), con **puntuación**, rachas y bonus.
- **Feedback inmediato**: si fallas, muestra la respuesta correcta y la
  **corrección paso a paso**. Si aciertas, también explica el porqué.
- **Gráficos vectoriales animados** al estilo de la lámina de referencia: curva
  de campana, histograma, dispersión con recta de regresión, diagrama de cajas,
  árbol de probabilidad, intervalo de confianza, chi-cuadrado, distribución t
  con zonas de rechazo, diagramas de cajas comparados (ANOVA), barras, circular,
  tabla de frecuencias y diagrama de puntos.
- **Modo reto / cronómetro** (opcional): cuenta atrás de 30 s por pregunta con
  **bonus por rapidez**; se activa con un interruptor en cada nivel.
- **Tablero de puntajes** local (los 50 mejores intentos): puesto, jugador,
  nivel, puntaje, precisión, estrellas y modo, con medallas 🥇🥈🥉 y exportación
  a Excel.
- **Descarga de resultados en Excel (`.xlsx` real)** con dos hojas:
  - **Resumen** (puntaje, aciertos, precisión y estrellas por nivel + total).
  - **Detalle** (cada pregunta con tu respuesta, la correcta y la corrección).
  - Si el navegador no permite `.xlsx`, cae automáticamente a `.csv`.
- **Informe en PDF** imprimible (botón «🖨️ PDF»): abre un informe con el resumen
  y todas las preguntas con sus correcciones; se guarda eligiendo «Guardar como
  PDF» en el diálogo de impresión (funciona offline, sin librerías).
- **Ficha acumulada por nivel** 📊: historial de intentos (evolución de la
  precisión), **dominio por tema** (barras rojo/verde según tus aciertos) y una
  sugerencia de qué reforzar.
- **Avatar de progreso** 🐣→👑: un rango que evoluciona con tus estrellas
  (Aprendiz curioso → Explorador → Analista → Estadístico → Experto → Maestro),
  con barra hacia el siguiente rango.
- **Tablero mejorado**: podio 🥇🥈🥉, filtro por nivel y avatar del jugador.
- **Gráficos interactivos**: pasa el cursor sobre barras, puntos o sectores para
  ver el valor exacto; animaciones de entrada y contador de puntaje animado.
- **Progreso guardado** en el navegador (localStorage) y efectos de juego
  (confeti, sonidos opcionales, puntos flotantes).

## ✅ Rigor del contenido

Las 45 preguntas y sus respuestas fueron **verificadas numéricamente** una por
una (media, mediana, moda, cuartiles, RIC, desviación estándar poblacional,
frecuencias relativas/acumuladas, regla empírica, probabilidades con árbol,
límites de intervalos de confianza, predicciones de regresión, R² = r²,
decisiones de prueba t y ANOVA, etc.).

## 🛠️ Detalles técnicos

- Un único archivo `.html` autocontenido: HTML + CSS + JavaScript, sin librerías
  externas ni llamadas de red (política CSP-friendly).
- Los gráficos son **SVG** dibujados dinámicamente; el `.xlsx` se genera con un
  escritor ZIP/OOXML propio en JavaScript puro.
- Responsive: funciona en computador, tablet y móvil.
