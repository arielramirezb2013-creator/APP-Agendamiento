# Generador de `.xlsm` con macros

Herramienta para producir libros de Excel **habilitados para macros** con código VBA
propio, desde Python, sin necesidad de tener Microsoft Excel.

Se construyó porque el `.xlsm` que descarga la app HTML debe generarse en tiempo de
compilación e incrustarse en el HTML: la app debe funcionar sin red y sin servidor,
así que no puede fabricar el archivo en el navegador.

## Por qué existe

Un `.xlsm` es un ZIP OOXML que contiene `xl/vbaProject.bin`. Ese `.bin` no es XML:
es un **contenedor OLE (Compound File Binary)** con los módulos VBA comprimidos en
un formato propio de Microsoft (MS-OVBA). No hay librería de Python que lo escriba.

Las vías descartadas y por qué:

| Vía | Resultado |
|---|---|
| LibreOffice headless (`--convert-to xlsm`) | Descartada: LibreOffice no carga ningún archivo en este contenedor, ni siquiera un CSV. |
| `xlsxwriter.add_vba_project()` a secas | Insuficiente: embebe un `.bin` existente, no lo genera. |
| `olefile` | Insuficiente: solo lee; al escribir exige que el stream conserve el tamaño exacto. |

La solución fue implementar las dos piezas que faltaban.

## Componentes

| Archivo | Qué hace |
|---|---|
| `ovba.py` | Compresión y descompresión MS-OVBA (`[MS-OVBA]` 2.4.1). |
| `cfb.py` | Escritor de Compound File Binary v3 (`[MS-CFB]`), sectores de 512 B, con FAT, mini-FAT y árbol de directorio. |
| `vba_patch.py` | Lee un `vbaProject.bin`, sustituye el código fuente de sus módulos y lo reescribe. |
| `vbaProject_base.bin` | Proyecto VBA base sobre el que se inyecta el código. |
| `test_generador.py` | 25 comprobaciones sobre las cuatro etapas. |

### Procedencia del `.bin` base

`vbaProject_base.bin` proviene de los ejemplos de **XlsxWriter**
(`examples/vbaProject.bin`), licencia BSD-2-Clause. Se parte de un proyecto generado
por Excel real en lugar de fabricar uno desde cero, porque los streams `dir` y
`_VBA_PROJECT` codifican estructuras que Excel valida y que conviene no reinventar.

## Uso

```bash
pip install olefile xlsxwriter oletools
python3 test_generador.py        # 25 comprobaciones
```

```python
import vba_patch, xlsxwriter

vba_patch.patch("vbaProject_base.bin", "vbaProject.bin", {
    "Module1":      codigo_principal,   # str con el VBA
    "ThisWorkbook": codigo_eventos,     # Workbook_Open, etc.
})

wb = xlsxwriter.Workbook("salida.xlsm")
wb.set_vba_name("ThisWorkbook")
ws = wb.add_worksheet("Panel"); ws.set_vba_name("Sheet1")
# ... tablas, gráficos, formato condicional, botones ...
wb.add_vba_project("vbaProject.bin")
wb.close()
```

Los `set_vba_name()` son obligatorios: enlazan cada hoja con su módulo de código.

## Estado de verificación

Comprobado en este entorno:

- Ida y vuelta de compresión sobre los 6 streams del proyecto real y sobre textos
  de 0 a 65.000 bytes, incluidos los límites de chunk (4095 / 4096 / 4097).
- El escritor CFB reconstruye el contenedor base con los 13 streams **byte a byte**.
- Un módulo de 34.006 caracteres se inyecta y se relee idéntico.
- El `.xlsm` sale con gráfico y tabla nativos, `content-type` macroEnabled y el
  `vbaProject.bin` embebido sin alterar.
- **Verificación cruzada:** `oletools` —un parser independiente, escrito por
  terceros— detecta y extrae correctamente los módulos del contenedor generado.

**No verificado:** que Microsoft Excel abra el archivo y compile las macros. En este
contenedor no hay Excel. La verificación cruzada con `oletools` es evidencia fuerte
de que el contenedor está bien formado, pero no sustituye a una prueba en Excel.
Esa prueba hay que hacerla en una máquina con Office antes de dar el archivo por bueno.

## Limitaciones conocidas

1. **Macros bloqueadas al descargar.** Desde 2022, Excel bloquea las macros de los
   archivos que llegan de internet (marca *Mark of the Web*): se ven, pero no corren.
   El usuario debe hacer clic derecho → Propiedades → Desbloquear, o guardar el archivo
   en una Ubicación de confianza.
   *Consecuencia de diseño:* el libro tiene que ser **plenamente funcional sin macros**
   —fórmulas, gráficos, tablas y formato condicional nativos— y las macros deben añadir
   capacidades extra, no ser la condición para que funcione.
2. **Módulos disponibles fijos:** `Module1`, `ThisWorkbook`, `Sheet1`, `Sheet2`.
   Añadir módulos nuevos exige reescribir los registros `MODULE` del stream `dir`,
   que no está implementado. El límite de VBA es ~64 KB de fuente por módulo.
3. **Chunk final incompresible:** `ovba.compress` lanza excepción con datos
   aleatorios en un chunk final corto. No afecta a código VBA, que siempre comprime.
4. El proyecto base arrastra un módulo `ThisWorkbook1` heredado del archivo de origen.
