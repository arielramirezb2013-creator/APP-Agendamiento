# Evidencia Lab · Curso práctico de Design Thinking, hipótesis, GQM y prototipado 🧪

**Evidencia Lab** es una app de autoformación **100 % HTML** (un solo archivo, sin
instalación ni internet) construida a partir del manual *"Curso práctico de Design
Thinking, hipótesis, GQM y prototipado"*. Permite **aprender iterando con
infografías interactivas**, **evaluar el aprendizaje** con retroalimentación paso a
paso y **construir la hoja de evidencia** del taller (plantillas A–G).

## 🚀 Cómo usar

Abre **`evidencia-lab.html`** con doble clic en Chrome, Edge, Firefox o Safari.
No requiere servidor, conexión ni dependencias. El progreso se guarda en el
navegador (localStorage).

## 🧩 Qué incluye

- **7 módulos · 31 lecciones** que siguen el manual: encuadre y caso TurnoFácil,
  Design Thinking, hipótesis, Goal–Question–Metric, prototipos, del prototipo al
  experimento, y sprint integrador con pitch y rúbrica.
- **28 infografías interactivas** (SVG dibujado en vivo) con dos modos:
  - **Explorar**: tocar nodos, voltear tarjetas, deslizar minuteros, arrastrar
    puntos, mover deslizadores. Incluye las seis figuras del manual (ruta de
    aprendizaje, zigzag divergir/converger, anatomía de la hipótesis, árbol GQM,
    escalera de prototipos y ciclo de evidencia) más matrices y simuladores
    (impacto × incertidumbre, umbrales y salvaguardas, fidelidad por dimensión,
    protocolo de 15 minutos, matriz de decisión, rúbrica, lista de verificación).
  - **Reto** (24 infografías): la misma pieza se convierte en una prueba de
    conocimiento por interacción: clasificar arrastrando tarjetas, emparejar,
    ordenar, armar la hipótesis o el Goal pieza a pieza, diagnosticar REFTA,
    calcular prioridades y aplicar reglas de decisión a escenarios. Se supera con
    ≥ 80 %.
- **65 preguntas** de evaluación por módulo (opción múltiple, verdadero/falso,
  selección múltiple y ordenamiento) con **corrección paso a paso**, puntos,
  rachas y estrellas, más un **examen final integrador** de 15 preguntas.
- **Constructor de insight y pregunta HMW** con detector de soluciones
  encubiertas, **constructor del Goal**, **simulador de umbrales** (línea base,
  canal digital/no digital, carga del personal, éxito de tarea).
- **Mi hoja de evidencia**: sprint integrador guiado en 7 pasos con las
  plantillas A–G del manual (mapa del reto, prioridad de supuestos con matriz en
  vivo, tarjeta de hipótesis con autoverificación REFTA, árbol GQM, ficha de
  prototipo y prueba, registro de observación con matriz de decisión, pitch de
  90 s generado automáticamente, rúbrica ponderada y ticket de salida), con
  **cronómetro de 45 minutos** que anuncia los cortes de tiempo.
- **Mi dominio**: dominio por tema, retos superados e historial de intentos.
- **Exportación** a **Excel real (`.xlsx`)** e **informe imprimible / PDF** de
  resultados, progreso y hoja de evidencia. Glosario y fuentes verificables.
- Tema claro/oscuro, sonidos opcionales, confeti y diseño responsive.

## ✅ Verificación

Recorrido completo en Chromium headless (Playwright): 31 lecciones, 24 retos,
7 evaluaciones, examen final, los 7 pasos de la hoja de evidencia y las
exportaciones, con **0 errores de JavaScript** y sin desplazamiento horizontal
en móvil. Los archivos `.xlsx` generados validan como ZIP/OOXML.

## 🛠️ Detalles técnicos

Un único archivo `.html` autocontenido (HTML + CSS + JavaScript) sin librerías
ni llamadas de red. Los gráficos son SVG generados dinámicamente; el `.xlsx` se
produce con un escritor ZIP/OOXML propio en JavaScript puro.
