#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera el libro de registro de novedades para quien revise la app Rehavid LSS DMAIC."""
import json, os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule
from openpyxl.comments import Comment

AQUI = os.path.dirname(os.path.abspath(__file__))
INV = json.load(open(os.path.join(AQUI, 'inventario.json'), encoding='utf-8'))
SALIDA = os.path.join(AQUI, 'Registro_de_novedades_revision.xlsx')

# ---- paleta Rehavid -------------------------------------------------------
INDIGO, HONDO, VERDE = '3B26D3', '2A1AA6', '0FE17B'
LILA, BORDE, TINTA, GRIS = 'F6F5FE', 'DDD9F5', '171043', '544D80'
AMARILLO = 'FFF8DC'          # celdas que rellena el revisor
EJEMPLO = 'EFEDF9'

F = 'Arial'
def fuente(sz=10, b=False, color=TINTA, it=False):
    return Font(name=F, size=sz, bold=b, color=color, italic=it)

borde_fino = Border(*[Side(style='thin', color=BORDE)] * 4)
AJUSTE = Alignment(wrap_text=True, vertical='top')
ARRIBA = Alignment(vertical='top')

wb = Workbook()

def encabezar(ws, titulo, subtitulo, ancho_merge):
    ws['A1'] = titulo
    ws['A1'].font = fuente(15, True, INDIGO)
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=ancho_merge)
    ws['A2'] = subtitulo
    ws['A2'].font = fuente(9.5, color=GRIS)
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=ancho_merge)
    ws.row_dimensions[1].height = 22
    ws.row_dimensions[2].height = 26
    ws['A2'].alignment = AJUSTE

def fila_cabecera(ws, fila, cabeceras, anchos):
    for i, (h, w) in enumerate(zip(cabeceras, anchos), start=1):
        c = ws.cell(row=fila, column=i, value=h)
        c.font = fuente(9.5, True, 'FFFFFF')
        c.fill = PatternFill('solid', fgColor=INDIGO)
        c.alignment = Alignment(wrap_text=True, vertical='center', horizontal='center')
        c.border = borde_fino
        ws.column_dimensions[c.column_letter].width = w
    ws.row_dimensions[fila].height = 32

# =========================================================== INSTRUCCIONES
ws = wb.active
ws.title = 'Instrucciones'
encabezar(ws, 'Registro de novedades · Rehavid Lean Six Sigma DMAIC',
          'Libro para que quien revise la aplicación anote lo que encuentre. '
          'Aplicación revisada: versión 1.0.0, compilación 2026-11-12 (dato tomado de la propia app).', 6)
ws.column_dimensions['A'].width = 3
ws.column_dimensions['B'].width = 30
ws.column_dimensions['C'].width = 82

bloques = [
    ('Qué es este libro', [
        ('', 'Sirve para que anotes, sin perder nada, todo lo que veas mal, dudoso o mejorable '
             'mientras usas la aplicación. Rehavid lo usará para corregir.'),
        ('Hojas que tiene', '· Novedades: aquí anotas cada hallazgo, uno por fila. Es la hoja principal.\n'
                            '· Recorrido: lista guiada de lo que conviene probar, para no dejar zonas sin ver.\n'
                            '· Herramientas: las 78 herramientas de la app, para ir marcando las revisadas.\n'
                            '· Resumen: se llena solo con lo que escribas; no hay que tocarlo.'),
    ]),
    ('Cómo rellenarlo', [
        ('Celdas a rellenar', 'Las de fondo amarillo claro. Las blancas con fórmula y la hoja Resumen '
                              'se calculan solas: no las escribas.'),
        ('Una fila por novedad', 'Aunque dos fallos se parezcan, van en filas distintas si ocurren en '
                                 'sitios distintos.'),
        ('Lo que más ayuda', 'Los pasos exactos para reproducirlo. Si Rehavid no consigue repetir el '
                             'fallo, no puede corregirlo.'),
        ('Evidencia', 'Una captura de pantalla vale más que un párrafo. Guárdala con el mismo número '
                      'de la novedad (por ejemplo «novedad-07.png») y anota ese nombre en la columna Evidencia.'),
    ]),
    ('Cómo describir bien un hallazgo', [
        ('Qué esperabas', 'Lo que creías que iba a pasar. Ejemplo: «que el total sumara las seis filas».'),
        ('Qué ocurrió', 'Lo que pasó de verdad, con el número o el texto que viste en pantalla. '
                        'Ejemplo: «el total mostró 0».'),
        ('Pasos', 'Numerados y desde el principio: 1) abrí la app, 2) cargué la simulación, '
                  '3) entré en MEDIR › Capacidad del proceso, 4) cambié el USL a 4...'),
    ]),
    ('Qué significa cada severidad', [
        ('Alta', 'Un número sale mal, se pierde información, algo no funciona, o desaparece contenido '
                 'sin avisar. No se puede entregar así.'),
        ('Media', 'Funciona pero hace algo incorrecto o confuso que el cliente notaría.'),
        ('Baja', 'Detalle de presentación, texto mejorable, comodidad de uso.'),
    ]),
    ('Qué significa cada tipo', [
        ('Error', 'Algo que no funciona o se rompe.'),
        ('Dato incorrecto', 'Un cálculo, porcentaje o indicador que no cuadra.'),
        ('Contenido', 'Un texto, etiqueta o explicación equivocada, confusa o mal escrita.'),
        ('Mejora', 'Funciona, pero se te ocurre algo mejor.'),
        ('Duda', 'No sabes si es un fallo o es así a propósito. Anótala igual.'),
    ]),
    ('Estado (lo gestiona Rehavid)', [
        ('', 'Nueva · En revisión · Corregida · No procede · Duplicada. Déjalo en «Nueva»; '
             'Rehavid lo actualiza y responde en la última columna.'),
    ]),
]

r = 4
for titulo, filas in bloques:
    ws.cell(row=r, column=2, value=titulo).font = fuente(11, True, HONDO)
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3)
    ws.cell(row=r, column=2).fill = PatternFill('solid', fgColor=LILA)
    ws.cell(row=r, column=3).fill = PatternFill('solid', fgColor=LILA)
    ws.row_dimensions[r].height = 20
    r += 1
    for et, tx in filas:
        if et:
            c = ws.cell(row=r, column=2, value=et); c.font = fuente(9.5, True); c.alignment = AJUSTE
        c = ws.cell(row=r, column=3, value=tx); c.font = fuente(9.5); c.alignment = AJUSTE
        ws.row_dimensions[r].height = max(14, 12 * (1 + tx.count('\n')) + 10 * (len(tx) // 110))
        r += 1
    r += 1

ws.cell(row=r, column=2, value='Ejemplo de una novedad bien escrita').font = fuente(11, True, HONDO)
ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3)
ws.cell(row=r, column=2).fill = PatternFill('solid', fgColor=LILA)
ws.cell(row=r, column=3).fill = PatternFill('solid', fgColor=LILA)
r += 1
ejemplo_txt = (
    'Fase: MEDIR   |   Herramienta: Capacidad del proceso   |   Tipo: Dato incorrecto   |   Severidad: Alta\n'
    'Qué pasó: el Cpk sale negativo con datos correctos.\n'
    'Pasos: 1) abrí la app con doble clic. 2) pulsé «Cargar simulación». 3) entré en MEDIR › 19. Capacidad '
    'del proceso. 4) miré la tarjeta Cpk.\n'
    'Qué esperaba: un Cpk positivo, porque la media está dentro de los límites.\n'
    'Qué ocurrió: mostró Cpk −0,45.\n'
    'Evidencia: novedad-01.png   |   Navegador: Chrome 131 en Windows 11')
c = ws.cell(row=r, column=3, value=ejemplo_txt)
c.font = fuente(9.5, it=True, color=GRIS); c.alignment = AJUSTE
c.fill = PatternFill('solid', fgColor=EJEMPLO); c.border = borde_fino
ws.row_dimensions[r].height = 92
ws.cell(row=r, column=2, value='Así de concreto').font = fuente(9.5, True)
ws.cell(row=r, column=2).alignment = AJUSTE

ws.sheet_view.showGridLines = False

# ================================================================ NOVEDADES
ws = wb.create_sheet('Novedades')
encabezar(ws, 'Novedades encontradas',
          'Una fila por hallazgo. Rellena las columnas de fondo amarillo; el número se pone solo. '
          'La fila gris es un ejemplo: puedes borrarla.', 15)

CAB = ['N.º', 'Fecha', 'Revisor', 'Fase o módulo', 'Herramienta o pantalla', 'Tipo', 'Severidad',
       'Qué pasó (resumen en una línea)', 'Pasos exactos para reproducirlo',
       'Qué esperabas que pasara', 'Qué ocurrió en realidad', 'Evidencia (nombre de la captura)',
       'Navegador y equipo', 'Estado', 'Respuesta de Rehavid']
ANCHOS = [6, 11, 16, 15, 26, 15, 11, 34, 42, 28, 28, 20, 20, 13, 32]
fila_cabecera(ws, 3, CAB, ANCHOS)

FILA_EJ, PRIMERA, ULTIMA = 4, 5, 204

ejemplo = ['', '2026-11-12', 'Nombre del revisor', 'MEDIR', '19. Capacidad del proceso',
           'Dato incorrecto', 'Alta', 'EJEMPLO (borra esta fila) · el Cpk sale negativo',
           '1) Abrí la app con doble clic. 2) Pulsé «Cargar simulación». '
           '3) Entré en MEDIR › 19. Capacidad del proceso. 4) Miré la tarjeta Cpk.',
           'Un Cpk positivo, porque la media está dentro de los límites.',
           'Mostró Cpk −0,45.', 'novedad-01.png', 'Chrome 131 · Windows 11', 'Nueva', '']
for i, v in enumerate(ejemplo, start=1):
    c = ws.cell(row=FILA_EJ, column=i, value=v)
    c.font = fuente(9, it=True, color=GRIS)
    c.alignment = AJUSTE if i >= 8 else ARRIBA
    c.fill = PatternFill('solid', fgColor=EJEMPLO)
    c.border = borde_fino
ws.row_dimensions[FILA_EJ].height = 58
# el ejemplo no se numera: si se numerara, la primera novedad real empezaria en 2
ws.cell(row=FILA_EJ, column=1).value = 'ej.'
ws.cell(row=FILA_EJ, column=1).alignment = Alignment(horizontal='center', vertical='top')

for fl in range(PRIMERA, ULTIMA + 1):
    for col in range(1, 16):
        c = ws.cell(row=fl, column=col)
        c.font = fuente(9.5)
        c.alignment = AJUSTE if col >= 8 else ARRIBA
        c.border = borde_fino
        if col in (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13):
            c.fill = PatternFill('solid', fgColor=AMARILLO)
    ws.cell(row=fl, column=1).value = '=IF($H{0}="","",COUNTA($H$5:$H{0}))'.format(fl)
    ws.cell(row=fl, column=1).alignment = Alignment(horizontal='center', vertical='top')
    ws.cell(row=fl, column=2).number_format = 'yyyy-mm-dd'
    ws.row_dimensions[fl].height = 30

mods = [m['nombre'] if m['id'] != 'GUIA' else 'GUÍA' for m in INV['modulos']]
lista_mod = ','.join(mods + ['Tablero BI', 'Impresión', 'Exportación a Excel',
                             'Proyectos y empresas', 'Simulación', 'General / varias'])
val = {
    'D': lista_mod,
    'F': 'Error,Dato incorrecto,Contenido,Mejora,Duda',
    'G': 'Alta,Media,Baja',
    'N': 'Nueva,En revisión,Corregida,No procede,Duplicada',
}
for col, lista in val.items():
    dv = DataValidation(type='list', formula1='"{}"'.format(lista), allow_blank=True, showDropDown=False)
    dv.error = 'Elige un valor de la lista desplegable.'
    dv.errorTitle = 'Valor no válido'
    ws.add_data_validation(dv)
    dv.add('{0}{1}:{0}{2}'.format(col, FILA_EJ, ULTIMA))

ws.conditional_formatting.add('G{}:G{}'.format(PRIMERA, ULTIMA),
    CellIsRule(operator='equal', formula=['"Alta"'],
               fill=PatternFill('solid', fgColor='FBD5D5'), font=Font(name=F, size=9.5, bold=True, color='9C1C1C')))
ws.conditional_formatting.add('G{}:G{}'.format(PRIMERA, ULTIMA),
    CellIsRule(operator='equal', formula=['"Media"'],
               fill=PatternFill('solid', fgColor='FDF0D5'), font=Font(name=F, size=9.5, color='8A5A00')))
ws.conditional_formatting.add('N{}:N{}'.format(PRIMERA, ULTIMA),
    CellIsRule(operator='equal', formula=['"Corregida"'],
               fill=PatternFill('solid', fgColor='D9F5E6'), font=Font(name=F, size=9.5, color='0A6B3D')))

ws.freeze_panes = 'C4'
ws.auto_filter.ref = 'A3:O{}'.format(ULTIMA)
ws.cell(row=3, column=1).comment = Comment(
    'Se numera solo según vayas rellenando la columna «Qué pasó». No escribas aquí.', 'Rehavid', width=240, height=70)
ws.sheet_view.showGridLines = False

# ================================================================ RECORRIDO
ws = wb.create_sheet('Recorrido')
encabezar(ws, 'Recorrido guiado de revisión',
          'Lista de lo que conviene probar para no dejar zonas sin ver. Marca el resultado de cada punto. '
          'Lo que falle, anótalo además en la hoja Novedades.', 5)
fila_cabecera(ws, 3, ['Área', 'Qué comprobar', 'Cómo hacerlo', 'Resultado', 'Observaciones'],
              [22, 46, 58, 14, 40])

RECORRIDO = [
    ('Arranque', [
        ('La app abre sin internet', 'Guarda el archivo .html en el escritorio y ábrelo con doble clic, con el wifi apagado.'),
        ('No aparece ningún error', 'Si tu navegador tiene consola (F12), míralas: no debería haber errores en rojo.'),
        ('Se ve el logo de Rehavid', 'Arriba a la izquierda.'),
    ]),
    ('Proyectos y empresas', [
        ('Crear un proyecto', 'Proyectos › Nuevo proyecto. Ponle nombre y empresa.'),
        ('Dos proyectos de la MISMA empresa', 'Crea otro con exactamente la misma empresa. Deben quedar agrupados juntos.'),
        ('Un proyecto de OTRA empresa', 'Crea un tercero con otra empresa. Debe salir en su propio grupo.'),
        ('Los datos no se cruzan', 'Escribe un texto distinto en la misma herramienta de cada proyecto. '
                                   'Cambia de uno a otro y comprueba que cada uno conserva el suyo.'),
        ('Los logos no se cruzan', 'Ajustes › Logotipos: sube un logo de empresa distinto en dos proyectos. '
                                   'Al cambiar de proyecto debe cambiar el logo de arriba.'),
        ('Todo sigue tras cerrar', 'Cierra el navegador, vuelve a abrir el archivo y comprueba que no se perdió nada.'),
        ('Duplicar y eliminar', 'Prueba los botones Duplicar y Eliminar de una tarjeta de proyecto.'),
    ]),
    ('Simulación', [
        ('Cargar la simulación', 'Botón «Cargar simulación». Debe crear un proyecto aparte, marcado como simulación.'),
        ('No toca tus proyectos', 'Comprueba que los proyectos que creaste antes siguen con sus datos.'),
        ('Recorrer el caso completo', 'Entra por las cinco fases y mira que todo tenga datos y gráficos.'),
        ('Limpiar la simulación', 'Debe borrar solo ese proyecto y dejar los tuyos intactos.'),
    ]),
    ('Fases DMAIC', [
        ('DEFINIR · 15 formatos', 'Recórrelos. Escribe en los campos y comprueba que lo escrito se queda.'),
        ('MEDIR · 23 formatos', 'Fíjate sobre todo en los cálculos: sigma, capacidad, muestreo, GR&R.'),
        ('ANALIZAR · 10 formatos', 'Ishikawa, 5 porqués, árbol, prueba de hipótesis.'),
        ('MEJORAR · 8 formatos', 'Selección de soluciones, plan de acción, poka yoke.'),
        ('CONTROLAR · 10 formatos', 'Estándares, plan de control, cartas de control, cierre.'),
        ('Los números cuadran', 'Compara con lo que daría a mano o en el Excel original. Cualquier diferencia es importante.'),
        ('Escribir funciona en todos lados', 'Prueba a escribir en tablas, en campos largos y en listas desplegables.'),
    ]),
    ('Guía de uso', [
        ('Los 12 capítulos se ven', 'Módulo CÓMO SE USA. Mira que no falte texto ni queden huecos.'),
        ('Las infografías se dibujan', 'Deben verse completas, sin texto salido ni encimado.'),
    ]),
    ('Tablero BI', [
        ('Todas las pestañas abren', 'Botón BI arriba.'),
        ('Los indicadores cuadran', 'Compara un par con lo que viste en las herramientas.'),
        ('Con proyecto vacío no se rompe', 'Abre el BI en un proyecto sin datos: no debe mostrar errores raros.'),
    ]),
    ('Motor de decisión', [
        ('Sugerencias por fase', 'Al final de cada herramienta y de cada fase.'),
        ('La conclusión concuerda', 'Que lo que dice el texto coincida con el número que muestra al lado.'),
    ]),
    ('Trazabilidad', [
        ('Un dato viaja', 'Escribe el problema en DEFINIR y comprueba que aparece en el Project Charter y en el A3.'),
        ('No pisa lo tuyo', 'Si ya habías escrito algo distinto en el destino, no debe sobrescribirlo.'),
    ]),
    ('Impresión', [
        ('Imprimir una herramienta', 'Botón de impresora dentro de la herramienta.'),
        ('Imprimir una fase', 'Desde la portada de la fase.'),
        ('Imprimir el informe completo', 'Botón de impresora de la barra de arriba.'),
        ('Nada cortado', 'Revisa la vista previa: ninguna tabla ni gráfico debe salirse del margen '
                         'ni quedar partido entre dos hojas.'),
        ('La portada lleva el logo correcto', 'El de la empresa del proyecto que estás imprimiendo.'),
    ]),
    ('Exportar', [
        ('Excel de una fase', 'Exportar › Excel de esta fase. Ábrelo y comprueba que los datos están en su sitio.'),
        ('Los 5 libros (.zip)', 'Que estén los cinco y se abran.'),
        ('Consolidado .xlsx', 'Un solo libro con todo.'),
        ('Consolidado con macros .xlsm', 'Ábrelo en Excel y confirma que las macros corren.'),
        ('Las fórmulas originales siguen', 'En los libros exportados, que las fórmulas del Excel original no se perdieran.'),
        ('Copia de seguridad .json', 'Expórtala, borra el proyecto y vuelve a importarla.'),
    ]),
    ('Presentación', [
        ('Textos bien alineados', 'Que no haya texto encimado, cortado ni fuera de su recuadro.'),
        ('Se ve bien en tu pantalla', 'Prueba a cambiar el tamaño de la ventana.'),
        ('Modo claro y oscuro', 'Botón de tema arriba a la derecha.'),
    ]),
]

r = 4
primera_rec = 4
for area, puntos in RECORRIDO:
    for i, (que, como) in enumerate(puntos):
        ws.cell(row=r, column=1, value=area if i == 0 else '').font = fuente(9.5, True, HONDO)
        ws.cell(row=r, column=1).alignment = AJUSTE
        ws.cell(row=r, column=2, value=que).font = fuente(9.5)
        ws.cell(row=r, column=3, value=como).font = fuente(9, color=GRIS)
        for col in (2, 3):
            ws.cell(row=r, column=col).alignment = AJUSTE
        for col in (4, 5):
            ws.cell(row=r, column=col).fill = PatternFill('solid', fgColor=AMARILLO)
            ws.cell(row=r, column=col).font = fuente(9.5)
            ws.cell(row=r, column=col).alignment = AJUSTE
        for col in range(1, 6):
            ws.cell(row=r, column=col).border = borde_fino
        if i == 0:
            for col in range(1, 6):
                ws.cell(row=r, column=col).fill = PatternFill('solid', fgColor=LILA) if col <= 3 \
                    else PatternFill('solid', fgColor=AMARILLO)
        ws.row_dimensions[r].height = 28
        r += 1
ultima_rec = r - 1

dv = DataValidation(type='list', formula1='"OK,Falla,No aplica,Sin probar"', allow_blank=True, showDropDown=False)
ws.add_data_validation(dv)
dv.add('D{}:D{}'.format(primera_rec, ultima_rec))
ws.conditional_formatting.add('D{}:D{}'.format(primera_rec, ultima_rec),
    CellIsRule(operator='equal', formula=['"Falla"'],
               fill=PatternFill('solid', fgColor='FBD5D5'), font=Font(name=F, size=9.5, bold=True, color='9C1C1C')))
ws.conditional_formatting.add('D{}:D{}'.format(primera_rec, ultima_rec),
    CellIsRule(operator='equal', formula=['"OK"'],
               fill=PatternFill('solid', fgColor='D9F5E6'), font=Font(name=F, size=9.5, color='0A6B3D')))
ws.freeze_panes = 'A4'
ws.auto_filter.ref = 'A3:E{}'.format(ultima_rec)
ws.sheet_view.showGridLines = False

# ============================================================= HERRAMIENTAS
ws = wb.create_sheet('Herramientas')
encabezar(ws, 'Las 78 herramientas de la aplicación',
          'Listado tomado de la propia app (6 módulos, 78 herramientas). Marca las que vayas revisando '
          'para no repetir ni dejarte ninguna.', 6)
fila_cabecera(ws, 3, ['Módulo', 'N.º', 'Herramienta', 'Hoja del Excel original', 'Revisada', 'Observaciones'],
              [16, 6, 52, 30, 13, 44])

orden = {m['id']: i for i, m in enumerate(INV['modulos'])}
tools = sorted(INV['tools'], key=lambda t: orden.get(t['mod'], 99))
r = 4
primera_h = 4
mod_actual, n = None, 0
for t in tools:
    if t['mod'] != mod_actual:
        mod_actual, n = t['mod'], 0
    n += 1
    nombre_mod = next((m['nombre'] for m in INV['modulos'] if m['id'] == t['mod']), t['mod'])
    ws.cell(row=r, column=1, value=nombre_mod).font = fuente(9, True, HONDO)
    ws.cell(row=r, column=2, value=n).font = fuente(9)
    ws.cell(row=r, column=2).alignment = Alignment(horizontal='center')
    ws.cell(row=r, column=3, value=t['title']).font = fuente(9.5)
    ws.cell(row=r, column=4, value=t['hoja'] or ('—' if t['extra'] else '')).font = fuente(9, color=GRIS)
    for col in (5, 6):
        ws.cell(row=r, column=col).fill = PatternFill('solid', fgColor=AMARILLO)
        ws.cell(row=r, column=col).font = fuente(9.5)
    for col in range(1, 7):
        ws.cell(row=r, column=col).border = borde_fino
        ws.cell(row=r, column=col).alignment = AJUSTE
    ws.row_dimensions[r].height = 22
    r += 1
ultima_h = r - 1

dv = DataValidation(type='list', formula1='"Sí,No,Parcial,Con novedad"', allow_blank=True, showDropDown=False)
ws.add_data_validation(dv)
dv.add('E{}:E{}'.format(primera_h, ultima_h))
ws.conditional_formatting.add('E{}:E{}'.format(primera_h, ultima_h),
    CellIsRule(operator='equal', formula=['"Con novedad"'],
               fill=PatternFill('solid', fgColor='FBD5D5'), font=Font(name=F, size=9.5, bold=True, color='9C1C1C')))
ws.conditional_formatting.add('E{}:E{}'.format(primera_h, ultima_h),
    CellIsRule(operator='equal', formula=['"Sí"'],
               fill=PatternFill('solid', fgColor='D9F5E6'), font=Font(name=F, size=9.5, color='0A6B3D')))
ws.freeze_panes = 'A4'
ws.auto_filter.ref = 'A3:F{}'.format(ultima_h)
ws.sheet_view.showGridLines = False

# ================================================================== RESUMEN
ws = wb.create_sheet('Resumen')
encabezar(ws, 'Resumen de la revisión',
          'Se calcula solo a partir de lo que escribas en las otras hojas. No hay que rellenar nada aquí.', 4)
ws.column_dimensions['A'].width = 3
ws.column_dimensions['B'].width = 34
ws.column_dimensions['C'].width = 14
ws.column_dimensions['D'].width = 54

N0, N1 = PRIMERA, ULTIMA

def seccion(fila, titulo):
    c = ws.cell(row=fila, column=2, value=titulo)
    c.font = fuente(11, True, HONDO)
    for col in (2, 3, 4):
        ws.cell(row=fila, column=col).fill = PatternFill('solid', fgColor=LILA)
    ws.row_dimensions[fila].height = 20

def linea(fila, etiqueta, formula, nota=''):
    ws.cell(row=fila, column=2, value=etiqueta).font = fuente(9.5)
    c = ws.cell(row=fila, column=3, value=formula)
    c.font = fuente(11, True, INDIGO)
    c.alignment = Alignment(horizontal='center')
    c.border = borde_fino
    ws.cell(row=fila, column=4, value=nota).font = fuente(9, color=GRIS)
    ws.cell(row=fila, column=4).alignment = AJUSTE
    ws.row_dimensions[fila].height = 18

r = 4
seccion(r, 'Novedades registradas'); r += 1
linea(r, 'Total de novedades', '=COUNTA(Novedades!$H${}:$H${})'.format(N0, N1),
      'Filas con algo escrito en «Qué pasó». No cuenta la fila de ejemplo.'); r += 1
for sev, nota in [('Alta', 'Impiden entregar: hay que corregirlas.'),
                  ('Media', 'Se ven y hay que corregirlas, pero no bloquean.'),
                  ('Baja', 'Detalles de presentación o comodidad.')]:
    linea(r, 'Severidad {}'.format(sev),
          '=COUNTIFS(Novedades!$G${}:$G${},"{}")'.format(N0, N1, sev), nota); r += 1
r += 1

seccion(r, 'Por tipo'); r += 1
for tp in ['Error', 'Dato incorrecto', 'Contenido', 'Mejora', 'Duda']:
    linea(r, tp, '=COUNTIFS(Novedades!$F${}:$F${},"{}")'.format(N0, N1, tp)); r += 1
r += 1

seccion(r, 'Por estado'); r += 1
for es in ['Nueva', 'En revisión', 'Corregida', 'No procede', 'Duplicada']:
    linea(r, es, '=COUNTIFS(Novedades!$N${}:$N${},"{}")'.format(N0, N1, es)); r += 1
r += 1

seccion(r, 'Dónde se concentran'); r += 1
for m in mods + ['Tablero BI', 'Impresión', 'Exportación a Excel', 'Proyectos y empresas', 'Simulación']:
    linea(r, m, '=COUNTIFS(Novedades!$D${}:$D${},"{}")'.format(N0, N1, m)); r += 1
r += 1

seccion(r, 'Avance del recorrido'); r += 1
linea(r, 'Puntos comprobados', '=COUNTA(Recorrido!$D${}:$D${})'.format(primera_rec, ultima_rec),
      'De {} puntos del recorrido guiado.'.format(ultima_rec - primera_rec + 1)); r += 1
linea(r, 'Puntos en OK', '=COUNTIFS(Recorrido!$D${}:$D${},"OK")'.format(primera_rec, ultima_rec)); r += 1
linea(r, 'Puntos que fallan', '=COUNTIFS(Recorrido!$D${}:$D${},"Falla")'.format(primera_rec, ultima_rec)); r += 1
linea(r, '% del recorrido hecho',
      '=IFERROR(COUNTA(Recorrido!$D${0}:$D${1})/{2},0)'.format(primera_rec, ultima_rec, ultima_rec - primera_rec + 1));
ws.cell(row=r, column=3).number_format = '0%'; r += 1
r += 1

seccion(r, 'Avance por herramientas'); r += 1
linea(r, 'Herramientas revisadas', '=COUNTA(Herramientas!$E${}:$E${})'.format(primera_h, ultima_h),
      'De las {} herramientas de la app.'.format(ultima_h - primera_h + 1)); r += 1
linea(r, 'Herramientas con novedad',
      '=COUNTIFS(Herramientas!$E${}:$E${},"Con novedad")'.format(primera_h, ultima_h)); r += 1
linea(r, '% de herramientas vistas',
      '=IFERROR(COUNTA(Herramientas!$E${0}:$E${1})/{2},0)'.format(primera_h, ultima_h, ultima_h - primera_h + 1))
ws.cell(row=r, column=3).number_format = '0%'

ws.sheet_view.showGridLines = False

# ---- impresion: que cada hoja quepa a lo ancho si el revisor la imprime ----
for hoja in wb.worksheets:
    hoja.page_setup.orientation = 'landscape'
    hoja.page_setup.fitToWidth = 1
    hoja.page_setup.fitToHeight = 0
    hoja.sheet_properties.pageSetUpPr.fitToPage = True
    hoja.print_title_rows = '1:3'
    hoja.page_margins.left = hoja.page_margins.right = 0.4
    hoja.page_margins.top = hoja.page_margins.bottom = 0.5

wb.save(SALIDA)
print('guardado:', SALIDA)
print('recorrido: filas {}..{} ({} puntos)'.format(primera_rec, ultima_rec, ultima_rec - primera_rec + 1))
print('herramientas: filas {}..{} ({})'.format(primera_h, ultima_h, ultima_h - primera_h + 1))
