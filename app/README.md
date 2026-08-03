# App de modulación financiera · Rehavid

Aplicación construida a partir del **Documento Técnico Maestro para una app de
modulación financiera** de Rehavid S.A.S. (v1.0, 3 de agosto de 2026).

## El entregable

```
app/dist/Rehavid_App_Modulacion_Financiera.html     451 KB   ← la app
app/dist/Rehavid_Modelacion_Financiera_v1.xlsm       45 KB   ← el libro Excel
```

**Ábrelo con doble clic.** Un único archivo HTML, sin servidor, sin internet, sin
instalación. Todo va dentro: la tipografía, los estilos, la lógica, el texto
íntegro del documento y el libro de Excel en base64.

## Qué contiene

| N.º | Sección | Contenido |
|---|---|---|
| 0 | Portada y síntesis | Cifras del documento, ciclo del producto, alcance, base probatoria |
| 1 | Módulo 1 · Formación | Ocho unidades, nivel básico (documento) e intermedio (complemento) |
| 2 | Evaluación y certificado | Examen adaptativo, corrección inmediata, repregunta, 80 %, certificado |
| 3 | Módulo 2 · Operación | Roles, rutas, estados del modelo, mensajes de error |
| 4 | Módulo 3 · Especificación | Arquitectura, 15 fórmulas, 32 RF, 14 RNF, 16 casos de prueba, riesgos, MVP |
| 5 | Laboratorio financiero | Calculadora con las fórmulas de §8, capacidad máxima y CP-009 |
| 6 | Motor de análisis | 12 reglas deterministas sobre el documento, con la regla visible |
| 7 | Cómo funciona esta app | Manual de uso de la herramienta |
| 8 | Documento fuente | Texto íntegro, buscable |
| 9 | Fuentes y trazabilidad | 17 fuentes y la matriz tema → unidad → componente → requisito |
| 10 | Descargas | Libro Excel e impresión |

## Las tres reglas que gobiernan el contenido

1. **Todo dato de gráficos y tablas sale del documento.** El documento no
   contiene ninguna cifra financiera —es una decisión deliberada suya, §2.1— así
   que los gráficos cuentan elementos estructurales reales: requisitos, riesgos,
   fuentes, unidades. Los valores del laboratorio son un ejemplo neutro y así se
   declara en pantalla.
2. **Lo complementario va marcado.** Cada bloque lleva un distintivo de
   procedencia: *contenido del documento*, *aporte externo* o *dato faltante*.
3. **El análisis crítico se reporta tal cual.** Ver
   [`ANALISIS_CRITICO_DOCUMENTO_V1.md`](../ANALISIS_CRITICO_DOCUMENTO_V1.md).

## Decisiones tomadas ante vacíos del documento

Ambas se declaran dentro de la propia app, en la sección de evaluación:

- **Denominador del intento.** §5.4 no define «preguntas válidas» y §5.1 mete
  repreguntas dentro del examen. La app cuenta solo los 16 ítems base, que es la
  lectura que preserva el significado del 80 %.
- **Grupo de equivalencia.** §5.2 exige repreguntar con otro ítem del mismo
  objetivo, pero la Tabla 16 aporta una sola pregunta por unidad. La app usa la
  unidad como grupo de equivalencia y añade 19 ítems propios, marcados.

## Construir desde el código

```bash
pip install python-docx xlsxwriter olefile oletools playwright
python3 generar_excel.py     # libro .xlsm con macros
python3 build.py             # ensambla el HTML autocontenido y lo verifica
python3 probar.py            # 46 comprobaciones en Chromium sobre file://
```

### Estructura

```
app/
├── src/
│   ├── plantilla.html          esqueleto con marcas de sustitución
│   ├── estilos.css             identidad Rehavid y reglas de impresión
│   ├── datos_documento.js      las 58 tablas del documento, transcritas
│   ├── datos_formacion.js      8 unidades y 27 preguntas
│   ├── graficos.js             gráficos SVG escritos a mano
│   ├── app_nucleo.js           navegación, formación, evaluación
│   ├── app_modulos.js          laboratorio, motor, especificación
│   ├── app_arranque.js         montaje e impresión
│   └── fuentes/                Outfit variable, 32 KB
├── fuente/                     el .docx original
├── generar_excel.py            libro con macros
├── build.py                    ensamblado + verificación de autocontención
└── probar.py                   pruebas en navegador real
```

## Qué está verificado

`probar.py` abre el archivo con `file://` en Chromium, igual que lo hará el
usuario, y comprueba 46 cosas:

- Carga sin un solo error de consola; la tipografía embebida se aplica.
- Las 11 secciones renderizan con contenido; ningún SVG queda vacío.
- El motor produce 10 hallazgos y es **determinista**: dos ejecuciones dan lo mismo.
- El laboratorio concilia (F1), el servicio cuadra (F2), la deuda se amortiza por
  completo, el método bullet paga solo al vencimiento, y **CP-009 se cumple**:
  endurecer el covenant no aumenta la capacidad.
- **RN-FIN-02**: con servicio de deuda cero el DSCR sale «No calculable», no infinito.
- La evaluación toma 16 ítems balanceados 2 por unidad, corrige, repregunta con un
  ítem distinto que no puntúa, y 15/16 aprueba con 93,8 %.
- La descarga del `.xlsm` produce un archivo **byte a byte idéntico** al generado.
- En impresión: navegación oculta, texto justificado, gráficos indivisibles, filas
  de tabla indivisibles, encabezados repetidos y **ningún bloque más alto que una
  página** —que es lo que de verdad evita que algo salga cortado.
- Sin desbordamiento horizontal en 420 px de ancho.

`build.py` verifica además que el HTML no tenga `src`/`href` externos, ni
`<link>`, ni `@import`, ni `fetch`, ni `XMLHttpRequest`, ni `WebSocket`.

## Qué NO está verificado

**Que Excel abra el libro y compile las macros.** En este entorno no hay Office.
El contenedor VBA está validado con `oletools` (un parser independiente) y el
`.xlsm` con las herramientas de `herramientas/generador_xlsm/`, pero eso no
sustituye a abrirlo en Excel. Hazlo antes de darlo por bueno.

Ten en cuenta que **Excel bloquea las macros de los archivos descargados**: hay
que desbloquear el archivo en Propiedades. Por eso el libro está diseñado para
funcionar completo sin macros —fórmulas, gráficos y formato condicional son
nativos— y las macros solo añaden el redibujado del diagrama, la iteración de
escenarios, el cálculo de capacidad y la comprobación CP-009.
