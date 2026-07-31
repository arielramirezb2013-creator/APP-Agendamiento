# REHAVID · Lean Six Sigma DMAIC

Aplicación **autónoma en un solo archivo HTML** que replica íntegramente la
herramienta DMAIC en Excel (5 libros · 53 formatos), incorpora el **manual
Lean Six Sigma recreado como módulo de consulta**, añade las **herramientas
estadísticas del manual que no existían en los Excel**, y suma tablero de
inteligencia de negocio, motor de interpretación y exportación avanzada.

> **Sin servidor. Sin internet. Sin instalación. Sin repositorios.**
> Se abre con doble clic en `REHAVID_LSS_DMAIC.html`.

---

## 1. Qué entrega

| Entregable | Archivo | Contenido |
|---|---|---|
| Aplicación | `REHAVID_LSS_DMAIC.html` | La app completa, un solo archivo |
| Código fuente | `app-dmaic/src/*.js` | Módulos que se concatenan al construir |
| Plantillas Excel | `app-dmaic/assets/tpl/*.xlsx` | Los 5 libros originales, depurados |
| Macros | `app-dmaic/assets/vbaProject.bin` | Proyecto VBA del libro consolidado |
| Macros (fuente) | `app-dmaic/assets/macros/*.bas` | Código VBA legible |

## 2. Las 5 fases y sus 53 formatos

| # | Fase | Formatos | Contenido |
|---|------|---------:|-----------|
| 1 | **DEFINIR** | 15 | Matriz de priorización, clarificación del problema (5W2H), árbol CTQ, serie de tiempo, Pareto, objetivo SMART, SIPOC, beneficios, tabla de identificación, miembros del proyecto, Gantt, plan de comunicación, recursos, Project Charter, A3 Definir |
| 2 | **MEDIR** | 17 | Swim line, mapeo detallado del proceso, métricos de desempeño, planes y tamaños de muestra (cualitativo y cuantitativo), hojas de verificación, plan de recolección, YIELD, RTY-FPY, serie de tiempo, % valor agregado, PPM, DPMO, DPU, A3 Medir |
| 3 | **ANALIZAR** | 7 | Brainstorming/afinidad, Ishikawa (6M y 4P), 5 Por qué, árbol de causas, validación de causas, descripción de causa raíz, A3 Analizar |
| 4 | **MEJORAR** | 6 | Brainstorming de soluciones, selección de soluciones, plan de acción, Quick Improvement, descripción de la solución, A3 Mejorar |
| 5 | **CONTROLAR** | 8 | Estándares de trabajo (3 formatos), plan de control, gráfico antes/después, A3 Controlar, Project Charter de cierre, A3 final |

## 2 bis. Módulo GUÍA y herramientas del manual

Además de los 53 formatos del Excel, la app incluye:

### Módulo «Cómo se usa» (GUÍA DE APLICACIÓN)
El manual Lean Six Sigma **recreado**, no copiado: 12 capítulos redactados de
nuevo y conectados con las herramientas reales de la app (cada explicación
lleva un botón que abre el formato correspondiente).

1. Cómo usar esta aplicación · 2. Qué es Lean (7 desperdicios, valor agregado)
· 3. Qué es Six Sigma (nivel sigma, ejemplo de las donas) · 4. Qué es Lean Six
Sigma (niveles y estructura de roles) · 5. Qué es DMAIC · 6. Selección de
proyectos · 7-11. Una guía por fase (orden de llenado, encadenamiento entre
herramientas, errores típicos y criterio de salida) · 12. Cierre y presentación
final.

### Herramientas del manual ausentes en los Excel
Estaban explicadas en el manual pero no tenían formato en los libros; ahora
existen dentro de su fase, con cálculo estadístico real:

| Fase | Herramienta |
|---|---|
| MEDIR | MSA · GR&R por variables (ANOVA, %Contribución, %Estudio, ndc) y por atributos (kappa) |
| MEDIR | Capacidad del proceso: Cp, Cpk, Pp, Ppk, Cpm, Z corto/largo, PPM, prueba de normalidad |
| MEDIR | Histograma y gráfica de caja · Diagrama de dispersión · Resumen gráfico · Plan MSA |
| ANALIZAR | Pruebas de hipótesis: t (1, 2, pareada), ANOVA, Kruskal-Wallis, Mood, F, Levene, proporciones, Chi² |
| ANALIZAR | Correlación (Pearson) y regresión con predicción · Niveles de causa |
| MEJORAR | Poka Yoke (niveles I, II y III) · Catálogo de modelos de mejora |
| CONTROLAR | Gráficos de control I-MR, X̄-R, X̄-S, P, NP, C, U con las 8 reglas de Nelson · Plan de reacción |

Estas herramientas se marcan como `extra`: alimentan la app, el tablero BI y el
libro consolidado, pero no se escriben en las plantillas Excel originales
(porque allí no existe la hoja correspondiente).

## 2 ter. Lo que la app hace y el Excel no podía

### El dato se escribe una sola vez
Los formatos comparten información. La app resuelve cada **hecho** del proyecto
desde su fuente y lo propaga al resto: escribir el problema una vez llena
**17 campos** en las cinco fases. Sólo rellena huecos — nunca sobrescribe lo
que usted redactó.

### Trazabilidad con eslabón roto visible
Una cadena de diez eslabones —problema · métrico · línea base · desempeño ·
causa raíz · causa validada · solución · acción · resultado · control— señala
**dónde se rompe**, que es el punto exacto donde el proyecto pasa de apoyarse
en datos a apoyarse en supuestos.

### Puerta de decisión al cerrar cada fase
Cada fase termina con 4 a 6 criterios contrastados contra los datos reales, un
semáforo y una recomendación: **avanzar**, **avanzar con riesgo documentado** o
**no avanzar**, con enlace a lo que falta. Ejemplo real: *«Al menos una causa
está validada con datos, no con opinión»* — si falla, la puerta a MEJORAR no
se abre.

### Impresión paginada
Informe con portada y logos en tres alcances: **un formato**, **una fase** o el
**proyecto completo**. Ninguna tabla, gráfico o ficha queda partida entre
hojas, y el encabezado de tabla se repite al cambiar de página.

### Simulación de un caso real
Un botón carga un proyecto completo del negocio de Rehavid (una ARL contrata
intervenir el servicio de terapia de una empresa afiliada): 55 formatos, 83 %
de avance, para recorrer la herramienta funcionando. Otro botón la deja en
blanco para empezar el proyecto real.

## 3. Funcionamiento por módulos o completo

Cada proyecto activa o desactiva las fases que la empresa requiera
(**Ajustes → Módulos del proyecto activo**). Los módulos apagados desaparecen
del menú, del tablero BI, de los indicadores y de la exportación.

Casos típicos:
- **Diagnóstico rápido** → sólo DEFINIR + MEDIR.
- **Investigación de un evento** → DEFINIR + ANALIZAR.
- **Intervención completa** → las 5 fases.

Cada empresa atendida se maneja como un **proyecto independiente**
(**🗂️ Proyectos**), con sus propios datos, logos y avance.

## 4. Exportación a Excel

### 4.1 Libros originales (fidelidad total)
La app trae embebidas las **plantillas originales** de la metodología. Al
exportar, escribe los datos del usuario **en sus celdas exactas**, conservando
formato, colores, celdas combinadas, gráficos y fórmulas. El resultado es
idéntico al Excel original, ya diligenciado, y recalcula al abrirse.

- Un libro por fase, o los 5 comprimidos en `.zip`.
- El logotipo de la herramienta se reemplaza por el de **Rehavid**.
- Las fotos, ayudas visuales y diagramas se insertan como imágenes reales.

### 4.2 Libro consolidado con macros (`.xlsm`)
Un único archivo con:
- **Portada** con los datos del proyecto y el resumen ejecutivo.
- **Índice** con hipervínculos a cada formato.
- **Tablero BI** con fórmulas vivas y semáforos por formato condicional.
- Las 53 hojas con encabezados, validaciones de lista, formato condicional,
  barras de datos y filas de total con `SUM` real.
- **Módulo de macros VBA `RehavidDMAIC`**:

| Macro | Qué hace |
|---|---|
| `Rehavid_Panel` | Panel de control con todas las opciones |
| `Rehavid_RecalcularTodo` | Reconstrucción completa del libro |
| `Rehavid_ActualizarBI` | Refresca el tablero y pinta los semáforos |
| `Rehavid_InformeEjecutivo` | Crea la hoja INFORME con el avance por fase |
| `Rehavid_ExportarPDF` | Exporta el proyecto completo a PDF |
| `Rehavid_ValidarDMAIC` | Lista las hojas sin diligenciar |
| `Rehavid_LimpiarDatos` | Borra datos conservando formatos y fórmulas |
| `Rehavid_AlternarProteccion` | Protege/desprotege todas las hojas |

Y **funciones de hoja de cálculo** utilizables como cualquier fórmula:

```excel
=REHAVID_SIGMA(41667)                      → 3,23   (nivel sigma desde DPMO)
=REHAVID_DPMO(defectos; unidades; oport.)  → DPMO
=REHAVID_RTY(H6;H7;H8;H9)                  → rolled throughput yield
=REHAVID_CPK(media; s; LSL; USL)           → capacidad del proceso
=REHAVID_MUESTRA_CUAL(N; p; e; confianza)  → tamaño de muestra cualitativa
=REHAVID_MUESTRA_CUANT(N; σ; e; confianza) → tamaño de muestra cuantitativa
=REHAVID_INTERPRETA(3,23)                  → "BAJO - por debajo del promedio…"
```

> Al abrir el `.xlsm`, Excel pedirá **Habilitar contenido** para activar las macros.

### 4.3 Otros formatos
- `.json` — copia de seguridad completa (respaldar / restaurar / mover de equipo).
- `.csv` — todas las tablas del proyecto, para análisis externo.
- **PDF** — informe paginado por formato, por fase o completo.

## 5. Logotipos

| Logo | Origen |
|---|---|
| **Rehavid** | Incluido. Reemplazable por el oficial en *Ajustes* |
| **ARL contratante** | Se sube desde la app |
| **Empresa atendida** | Se sube desde la app |

Aparecen en la barra superior, en la portada del libro consolidado y estampados
en los Excel exportados.

## 5 bis. Identidad visual

Paleta de marca Rehavid: índigo `#3B26D3` y verde `#0FE17B` sobre fondo blanco,
con neutros sesgados al índigo. Las cinco fases progresan de índigo a verde,
narrando visualmente el recorrido DMAIC. Iconografía SVG propia con símbolos
del método (espina de pescado, Pareto, carta de control) en lugar de emojis.
El tema oscuro sigue disponible con el conmutador.

> El logotipo incluido es una **reconstrucción vectorial** de la marca. Si
> tiene el archivo oficial, cárguelo en *Ajustes → Logotipos* y reemplazará al
> incluido en toda la app y en los Excel exportados.

## 6. Motor de análisis, interpretación y decisión

No es un formulario pasivo: en cada formato, y en el tablero, la app calcula,
interpreta y **sugiere la decisión**, siempre con el número que la respalda.

- Nivel sigma a partir de DPMO/PPM/DPU y su lectura frente a la industria.
- Brecha RTY vs FPY → cuantifica la *fábrica oculta* (retrabajo).
- Pareto → identifica las *pocas vitales* que concentran el 80%.
- Matriz impacto-esfuerzo → clasifica soluciones (Quick Win, proyecto mayor…).
- Coherencia entre fases → alerta si se va a MEJORAR sin causa raíz validada.
- Gantt → tareas vencidas, ruta crítica aproximada y proyección de cierre.
- Cierre → si los métricos mejoraron recomienda cerrar y replicar; si no,
  devolver a ANALIZAR.

## 7. Almacenamiento y privacidad

Todo vive en el `localStorage` del navegador del equipo. **Ningún dato sale
del computador**: no hay servidor, ni analítica, ni peticiones de red. Por eso
conviene exportar el `.json` periódicamente como respaldo.

## 8. Compilar desde el código fuente

```bash
cd app-dmaic
python3 prep_templates.py    # depura las plantillas Excel  (opcional)
python3 build_vba.py         # regenera el proyecto VBA     (opcional)
python3 build.py             # ensambla REHAVID_LSS_DMAIC.html
python3 test_app.py          # pruebas headless + validación de los Excel
```

Requisitos sólo para compilar: Python 3 y, para las pruebas, `playwright`,
`openpyxl` y `oletools`. **La app terminada no requiere nada.**

## 9. Compatibilidad

| Navegador | Estado |
|---|---|
| Chrome / Edge 90+ | Completo |
| Firefox 113+ | Completo |
| Safari 16.4+ | Completo |
| Navegadores antiguos | La app funciona; la exportación a Excel puede fallar |

La exportación usa `CompressionStream`, nativo de los navegadores modernos.
