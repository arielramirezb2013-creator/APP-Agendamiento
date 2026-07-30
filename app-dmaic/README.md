# REHAVID · Lean Six Sigma DMAIC

Aplicación **autónoma en un solo archivo HTML** que replica íntegramente la
herramienta DMAIC en Excel (5 libros · 53 formatos) y le agrega tablero de
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
- Impresión / PDF desde el navegador.

## 5. Logotipos

| Logo | Origen |
|---|---|
| **Rehavid** | Incluido. Reemplazable por el oficial en *Ajustes* |
| **ARL contratante** | Se sube desde la app |
| **Empresa atendida** | Se sube desde la app |

Aparecen en la barra superior, en la portada del libro consolidado y estampados
en los Excel exportados.

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
