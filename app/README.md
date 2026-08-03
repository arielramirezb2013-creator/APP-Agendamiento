# App de modulación financiera · Rehavid

Construida a partir del **Documento Técnico Maestro para una app de modulación
financiera** de Rehavid S.A.S. (v1.0, 3 de agosto de 2026).

## El entregable

```
app/dist/Rehavid_App_Modulacion_Financiera.html   ~500 KB   ← la app
app/dist/Rehavid_Herramienta_Financiera.xlsm       ~35 KB   ← el libro Excel
```

**Ábrela con doble clic.** Un único archivo HTML: sin servidor, sin internet, sin
instalación. Todo va dentro —tipografía, lógica, el texto íntegro del documento y
el libro de Excel en base64—. Nada sale del equipo.

## Tres módulos

### 1 · Formación
Conceptos básicos e intermedios de modelación financiera para el equipo interno.

| Sección | Contenido |
|---|---|
| Ruta de aprendizaje | Avance, las ocho unidades y los referentes de §4.3 |
| Unidades U1–U8 | Nivel básico (§4.2 del documento) e intermedio (aporte externo), fórmulas, reglas RN-FIN, términos clave, errores frecuentes y la actividad de la unidad |
| Actividades formativas | Las ocho de §4.4 con su producto de aprendizaje y procedimiento |
| Laboratorio Risk Simulator | Los diez puntos obligatorios de §9.1 y el flujo de §9.2 |
| Glosario | 30 términos que el documento usa y no define uno a uno |
| Evaluación certificable | 16 ítems, corrección inmediata, repregunta equivalente, umbral del 80 % |
| Certificado | Emisión, contenido exigido por §5.5 y control de expedición de §5.6 |

### 2 · Manual de uso y operación
Cómo se usa la app y cómo opera cada rol: perfiles y permisos, rutas por rol,
estados del modelo, mensajes y bloqueos, interoperabilidad con Risk Simulator,
calidad del dato y marco jurídico, más el documento fuente con su revisión.

### 3 · Herramienta financiera
Donde se trabaja. Catorce pantallas operativas que cubren MF-05 a MF-11:

| Pantalla | Qué hace |
|---|---|
| Panel | Indicadores, bloqueos, perfil de deuda, cobertura, liquidez y calendario |
| Proyecto | Propósito, responsable, alcance, horizonte, moneda y estado (RF-009) |
| Supuestos | Tabla editable con fuente, racional, responsable y tipo (RF-010, RN-FIN-05/06) |
| Deuda | Varios tramos, método, gracia, base de días y conciliación por tramo (F1, F2) |
| Flujo y CFADS | Mapeo de líneas elegibles: lo que no es caja disponible se excluye (F3) |
| Covenants | Indicador, umbral, frecuencia, cura, consecuencia, fuente y vigencia (RN-FIN-03) |
| Liquidez | Caja mínima, brecha, periodos en déficit y causa principal (F6, F7) |
| Capacidad | Máximo factible por bisección, restricción vinculante y prueba CP-009 (F5) |
| Escenarios | Guardar, comparar y cargar sin alterar el original (RF-017) |
| Simulación | Exporta especificación con huella, importa resultados validando correspondencia (RF-018/019) |
| Auditoría | 14 reglas sobre el modelo, cada hallazgo con su regla visible (RF-022) |
| Backtesting | Proyección fijada frente a observado, con «No aplicable» cuando la base no sirve (§8.6) |
| Decisión | Responsable, comentario y riesgo residual (RN-FIN-10) |
| Reportes | Informe imprimible, exportación del modelo y descarga del libro Excel |

## Las tres reglas que gobiernan el contenido

1. **Ningún dato inventado.** El documento no contiene ninguna cifra financiera
   —decisión deliberada suya, §2.1—, así que los valores cargados en la
   herramienta son un ejemplo neutro y así se declara en pantalla.
2. **Lo complementario va marcado.** Cada bloque lleva su distintivo:
   *contenido del documento*, *aporte externo* o *dato faltante*.
3. **Lo que el documento no define, no se calcula.** La probabilidad de ruptura
   no se computa porque §8.5 no dice qué constituye una ruptura.

## Decisiones tomadas ante vacíos del documento

Ambas se declaran dentro de la app:

- **Denominador del intento.** §5.4 no define «preguntas válidas» y §5.1 mete
  repreguntas dentro del examen. La app cuenta solo los 16 ítems base.
- **Grupo de equivalencia.** §5.2 exige repreguntar con otro ítem del mismo
  objetivo, pero la Tabla 16 da una sola pregunta por unidad. La app usa la
  unidad como grupo de equivalencia y añade 17 ítems propios, marcados.

## El libro Excel

**Contiene solo la herramienta financiera.** Ningún material de formación.

| Hoja | Contenido |
|---|---|
| Panel | Parámetros, indicadores y tres gráficos nativos |
| Modelo | Calendario con 780 fórmulas vivas, incluida RN-FIN-02 |
| Escenarios | Comparación e iteración |
| Flujos | Tabla de nodos del diagrama editable |
| Supuestos | Campos de RN-FIN-05 con resaltado de fuente vacía |
| Covenants | Los cinco campos de RN-FIN-03 |

**Diseñado para funcionar sin macros**, porque Excel las bloquea al descargar
(*Mark of the Web*): hay que desbloquear el archivo en Propiedades. Las fórmulas,
gráficos y formato condicional son nativos; las macros solo añaden el redibujado
del flujo, la iteración de escenarios, el cálculo de capacidad y CP-009.

## Construir y probar

```bash
pip install python-docx xlsxwriter olefile oletools playwright
python3 generar_excel.py     # libro .xlsm con macros
python3 build.py             # ensambla el HTML y verifica autocontención
python3 probar.py            # 71 comprobaciones en Chromium sobre file://
```

### Estructura

```
app/
├── src/
│   ├── plantilla.html            carcasa con marcas de sustitución
│   ├── estilos.css               identidad Rehavid, carcasa de app e impresión
│   ├── iconos.js                 38 iconos SVG dibujados a mano
│   ├── graficos.js               gráficos SVG sin librerías
│   ├── datos_documento.js        las 58 tablas del documento
│   ├── datos_formacion.js        8 unidades y 25 preguntas
│   ├── datos_formacion_extra.js  actividades, glosario, referentes, §9.1
│   ├── app_nucleo.js             estado, navegación e impresión
│   ├── motor_financiero.js       fórmulas §8 y 14 reglas de validación
│   ├── mod_formacion.js          módulo 1
│   ├── mod_manual.js             módulo 2 y revisión del documento
│   └── mod_herramienta.js        módulo 3
├── fuente/                       el .docx original
├── generar_excel.py · build.py · probar.py
```

## Qué está verificado

`probar.py` abre el archivo con `file://` en Chromium y comprueba 71 cosas:

- Carga sin un error de consola; las 29 secciones renderizan con contenido.
- **El libro Excel no contiene material de formación**: seis hojas financieras.
- Formación completa: 8 unidades, 8 actividades, 10 puntos de §9.1, 30 términos,
  6 referentes, 25 preguntas y el control de expedición de §5.6.
- Motor financiero: F1 concilia, F2 cuadra, **F3 excluye las líneas no elegibles**,
  F5 identifica la restricción vinculante, **CP-009 se cumple** y **RN-FIN-02**
  devuelve «No calculable» con servicio cero.
- Validaciones: VAL-04 aparece al quitar la fuente del covenant y desaparece al
  reponerla; VAL-09 detecta el caso CP-010; la auditoría es determinista.
- Operaciones reales: añadir y borrar supuestos, añadir un segundo tramo que el
  modelo agrega, calcular capacidad, guardar escenarios.
- Simulación: **CP-011 rechaza el archivo con huella distinta** e importa cuando
  coincide, marcándolo como ejecución externa.
- Evaluación: 16 ítems balanceados, corrección, repregunta que no puntúa,
  15/16 = 93,8 % y certificado con nombre y cargo.
- Descarga del `.xlsm` byte a byte idéntica al generado.
- Impresión: barra y lateral ocultas, filas indivisibles, encabezados repetidos,
  texto justificado y **ningún bloque más alto que una página**.
- Sin desbordamiento horizontal a 420 px.

## Qué NO está verificado

**Que Excel abra el libro y compile las macros.** No hay Office en este entorno.
El contenedor VBA está validado con `oletools` (parser independiente), pero eso no
sustituye a abrirlo en Excel. Hazlo antes de darlo por bueno.
