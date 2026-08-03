#!/usr/bin/env python3
"""Genera el libro Excel con macros de la app de modulación financiera.

Los datos se leen de los mismos archivos JS que usa el HTML, ejecutándolos con
Node, para que no haya dos copias del contenido que puedan divergir.

Regla de diseño: el libro debe funcionar completo SIN macros. Las fórmulas,
gráficos, tablas y formato condicional son nativos. Las macros solo añaden el
redibujado del diagrama de flujo y la iteración de escenarios.
"""
import json
import os
import subprocess
import sys

import xlsxwriter

AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(AQUI, 'src')
sys.path.insert(0, os.path.join(os.path.dirname(AQUI), 'herramientas', 'generador_xlsm'))
import vba_patch  # noqa: E402

BASE_VBA = os.path.join(os.path.dirname(AQUI), 'herramientas', 'generador_xlsm', 'vbaProject_base.bin')

MORADO, VERDE = '#4025CE', '#02E577'
MORADO_OSC, VERDE_OSC = '#2A1788', '#00A055'
LAVANDA, PAPEL2 = '#EBE7FB', '#FBFAFE'
ROJO = '#B23B5C'


def leer_datos():
    """Ejecuta los archivos JS de datos en Node y devuelve su contenido como JSON."""
    claves = ['FORMULAS', 'REGLAS_FIN', 'ESTADOS', 'RUTAS', 'MENSAJES']
    # Los archivos declaran con const, que no se expone al contexto de vm:
    # se concatenan en un solo script que termina evaluando el objeto.
    fuente = open(os.path.join(SRC, 'datos_documento.js'), encoding='utf-8').read()
    guion = (fuente + '\nprocess.stdout.write(JSON.stringify({' +
             ','.join(claves) + '}));\n')
    p = os.path.join(AQUI, '_dump.js')
    open(p, 'w').write(guion)
    try:
        out = subprocess.check_output(['node', p], text=True)
    finally:
        os.remove(p)
    return json.loads(out)


# ----------------------------------------------------------------------
# Código VBA
# ----------------------------------------------------------------------
VBA_MODULO = r'''
Option Explicit

' ====================================================================
' Rehavid - App de modulacion financiera
' Estas macros AGREGAN capacidades. El libro funciona sin ellas:
' las formulas, graficos y tablas son nativos de Excel.
' ====================================================================

Public Const C_MORADO As Long = 13509952   ' RGB(64,37,206) en orden BGR
Public Const C_VERDE   As Long = 7857410   ' RGB(2,229,119) en orden BGR
Public Const C_LINEA   As Long = 16112101

' --------------------------------------------------------------------
' Redibuja el diagrama a partir de la tabla de la hoja "Flujos".
' Cada fila es un nodo; la columna Tipo define la forma.
' --------------------------------------------------------------------
Public Sub RedibujarFlujo()
    Dim ws As Worksheet, sh As Shape
    Dim i As Long, ultima As Long
    Dim y As Double, x As Double
    Dim texto As String, tipo As String

    On Error GoTo Fallo
    Set ws = ThisWorkbook.Worksheets("Flujos")
    Application.ScreenUpdating = False

    For i = ws.Shapes.Count To 1 Step -1
        Set sh = ws.Shapes(i)
        If Left$(sh.Name, 3) = "FL_" Then sh.Delete
    Next i

    ultima = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If ultima < 2 Then
        MsgBox "No hay nodos en la hoja Flujos.", vbInformation, "Rehavid"
        GoTo Salir
    End If

    y = 20
    x = 360
    For i = 2 To ultima
        texto = CStr(ws.Cells(i, 2).Value)
        tipo = LCase$(CStr(ws.Cells(i, 3).Value))

        If tipo = "decision" Then
            Set sh = ws.Shapes.AddShape(msoShapeDiamond, x, y, 250, 66)
        ElseIf tipo = "inicio" Or tipo = "fin" Then
            Set sh = ws.Shapes.AddShape(msoShapeRoundedRectangle, x, y, 250, 48)
        Else
            Set sh = ws.Shapes.AddShape(msoShapeRectangle, x, y, 250, 48)
        End If

        sh.Name = "FL_nodo_" & i
        sh.TextFrame2.TextRange.Text = CStr(ws.Cells(i, 1).Value) & ". " & texto
        sh.TextFrame2.TextRange.Font.Size = 10
        sh.TextFrame2.TextRange.Font.Name = "Calibri"

        If tipo = "inicio" Or tipo = "fin" Then
            sh.Fill.ForeColor.RGB = C_VERDE
            sh.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(11, 61, 36)
        Else
            sh.Fill.ForeColor.RGB = C_MORADO
            sh.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
        End If
        sh.Line.Visible = msoFalse

        If i > 2 Then ConectarNodos ws, "FL_nodo_" & (i - 1), "FL_nodo_" & i

        If tipo = "decision" Then
            y = y + 96
        Else
            y = y + 78
        End If
    Next i

Salir:
    Application.ScreenUpdating = True
    Exit Sub
Fallo:
    Application.ScreenUpdating = True
    MsgBox "No se pudo redibujar: " & Err.Description, vbExclamation, "Rehavid"
End Sub

Private Sub ConectarNodos(ws As Worksheet, origen As String, destino As String)
    Dim c As Shape
    On Error Resume Next
    Set c = ws.Shapes.AddConnector(msoConnectorStraight, 0, 0, 10, 10)
    c.Name = "FL_con_" & origen
    c.ConnectorFormat.BeginConnect ws.Shapes(origen), 3
    c.ConnectorFormat.EndConnect ws.Shapes(destino), 1
    c.Line.ForeColor.RGB = C_MORADO
    c.Line.Weight = 1.5
    c.Line.EndArrowheadStyle = msoArrowheadTriangle
End Sub

' --------------------------------------------------------------------
' Recorre la hoja Escenarios, aplica cada juego de parametros al Panel,
' recalcula y devuelve los resultados a la fila del escenario.
' Sin macros esto se hace a mano, copiando los parametros al Panel.
' --------------------------------------------------------------------
Public Sub IterarEscenarios()
    Dim wsE As Worksheet, wsP As Worksheet
    Dim i As Long, ultima As Long
    Dim guardado(1 To 7) As Variant
    Dim celdas As Variant

    On Error GoTo Fallo
    Set wsE = ThisWorkbook.Worksheets("Escenarios")
    Set wsP = ThisWorkbook.Worksheets("Panel")
    celdas = Array("C5", "C6", "C9", "C10", "C13", "C14", "C15")

    For i = 1 To 7
        guardado(i) = wsP.Range(celdas(i - 1)).Value
    Next i

    Application.ScreenUpdating = False
    ultima = wsE.Cells(wsE.Rows.Count, 1).End(xlUp).Row

    For i = 4 To ultima
        If Len(CStr(wsE.Cells(i, 1).Value)) > 0 Then
            wsP.Range("C5").Value = wsE.Cells(i, 2).Value
            wsP.Range("C6").Value = wsE.Cells(i, 3).Value
            wsP.Range("C9").Value = wsE.Cells(i, 4).Value
            wsP.Range("C10").Value = wsE.Cells(i, 5).Value
            wsP.Range("C13").Value = wsE.Cells(i, 6).Value
            wsP.Range("C15").Value = wsE.Cells(i, 7).Value
            Application.Calculate

            wsE.Cells(i, 8).Value = wsP.Range("C20").Value
            wsE.Cells(i, 9).Value = wsP.Range("C21").Value
            wsE.Cells(i, 10).Value = wsP.Range("C22").Value
            wsE.Cells(i, 11).Value = wsP.Range("C23").Value
        End If
    Next i

    For i = 1 To 7
        wsP.Range(celdas(i - 1)).Value = guardado(i)
    Next i
    Application.Calculate
    Application.ScreenUpdating = True
    MsgBox "Escenarios recalculados. Los parametros del Panel quedaron como estaban.", _
           vbInformation, "Rehavid"
    Exit Sub
Fallo:
    Application.ScreenUpdating = True
    MsgBox "No se pudo iterar: " & Err.Description, vbExclamation, "Rehavid"
End Sub

' --------------------------------------------------------------------
' Capacidad maxima de deuda (formula F5 del documento):
' maximizar el monto sujeto a DSCR >= covenant y caja final >= caja minima
' en todos los periodos. Se resuelve por biseccion, 60 iteraciones.
' El documento admite busqueda iterativa, optimizacion o Goal Seek y no fija
' tolerancia: la eleccion de biseccion es una decision de esta implementacion.
' --------------------------------------------------------------------
Private Function EsFactible(ByVal monto As Double) As Boolean
    Dim wsP As Worksheet
    Set wsP = ThisWorkbook.Worksheets("Panel")
    wsP.Range("C5").Value = monto
    Application.Calculate
    EsFactible = (CStr(wsP.Range("C24").Value) = "Factible")
End Function

Public Function BuscarCapacidad() As Double
    Dim wsP As Worksheet
    Dim guardado As Double, lo As Double, hi As Double, mid As Double
    Dim k As Long

    Set wsP = ThisWorkbook.Worksheets("Panel")
    guardado = wsP.Range("C5").Value
    lo = 1
    hi = guardado * 8 + 1000000

    If Not EsFactible(lo) Then
        wsP.Range("C5").Value = guardado
        Application.Calculate
        BuscarCapacidad = 0
        Exit Function
    End If

    If EsFactible(hi) Then
        wsP.Range("C5").Value = guardado
        Application.Calculate
        BuscarCapacidad = hi
        Exit Function
    End If

    For k = 1 To 60
        mid = (lo + hi) / 2
        If EsFactible(mid) Then lo = mid Else hi = mid
    Next k

    wsP.Range("C5").Value = guardado
    Application.Calculate
    BuscarCapacidad = lo
End Function

Public Sub CalcularCapacidad()
    Dim wsP As Worksheet
    Dim cap As Double, dscrMin As Double, brechaMin As Double
    Dim guardado As Double, vinculante As String

    On Error GoTo Fallo
    Set wsP = ThisWorkbook.Worksheets("Panel")
    Application.ScreenUpdating = False

    cap = BuscarCapacidad()
    guardado = wsP.Range("C5").Value

    ' Se mira que restriccion falla justo por encima del maximo
    wsP.Range("C5").Value = cap * 1.02
    Application.Calculate
    dscrMin = 0
    On Error Resume Next
    dscrMin = wsP.Range("C20").Value
    On Error GoTo Fallo
    brechaMin = wsP.Range("C21").Value

    If dscrMin < wsP.Range("C13").Value And brechaMin < 0 Then
        vinculante = "cobertura y liquidez a la vez"
    ElseIf dscrMin < wsP.Range("C13").Value Then
        vinculante = "cobertura (DSCR bajo el covenant)"
    ElseIf brechaMin < 0 Then
        vinculante = "liquidez (caja bajo el minimo)"
    Else
        vinculante = "ninguna en el rango explorado"
    End If

    wsP.Range("C5").Value = guardado
    Application.Calculate

    wsP.Range("C25").Value = cap
    wsP.Range("C25").NumberFormat = "#,##0"
    wsP.Range("C26").Value = vinculante
    Application.ScreenUpdating = True

    MsgBox "Capacidad maxima factible: " & Format(cap, "#,##0") & vbCrLf & _
           "Restriccion vinculante: " & vinculante & vbCrLf & vbCrLf & _
           "En el maximo la holgura es cero: cualquier desviacion produce incumplimiento. " & _
           "Capacidad matematica no es monto recomendado.", vbInformation, "Rehavid"
    Exit Sub
Fallo:
    Application.ScreenUpdating = True
    MsgBox "No se pudo calcular: " & Err.Description, vbExclamation, "Rehavid"
End Sub

' --------------------------------------------------------------------
' Comprobacion de monotonia del caso de prueba CP-009:
' endurecer el covenant no puede aumentar la capacidad factible.
' --------------------------------------------------------------------
Public Sub ComprobarMonotonia()
    Dim wsP As Worksheet
    Dim covOriginal As Double, capA As Double, capB As Double

    On Error GoTo Fallo
    Set wsP = ThisWorkbook.Worksheets("Panel")
    Application.ScreenUpdating = False
    covOriginal = wsP.Range("C13").Value

    capA = BuscarCapacidad()
    wsP.Range("C13").Value = covOriginal * 1.15
    Application.Calculate
    capB = BuscarCapacidad()
    wsP.Range("C13").Value = covOriginal
    Application.Calculate
    Application.ScreenUpdating = True

    If capB <= capA + 0.5 Then
        MsgBox "CP-009 se cumple." & vbCrLf & vbCrLf & _
               "Covenant " & Format(covOriginal, "0.00") & "  ->  capacidad " & Format(capA, "#,##0") & vbCrLf & _
               "Covenant " & Format(covOriginal * 1.15, "0.00") & "  ->  capacidad " & Format(capB, "#,##0") & vbCrLf & vbCrLf & _
               "Endurecer la restriccion no aumento la capacidad.", vbInformation, "Rehavid"
    Else
        MsgBox "CP-009 NO se cumple: la capacidad aumento al endurecer el covenant. " & _
               "Hay un error en el modelo.", vbCritical, "Rehavid"
    End If
    Exit Sub
Fallo:
    Application.ScreenUpdating = True
    MsgBox "No se pudo comprobar: " & Err.Description, vbExclamation, "Rehavid"
End Sub

' --------------------------------------------------------------------
Public Sub ExportarPDF()
    Dim ruta As String
    On Error GoTo Fallo
    ruta = ThisWorkbook.Path
    If Len(ruta) = 0 Then
        MsgBox "Guarde el libro antes de exportar a PDF.", vbInformation, "Rehavid"
        Exit Sub
    End If
    ThisWorkbook.ExportAsFixedFormat _
        Type:=xlTypePDF, _
        Filename:=ruta & Application.PathSeparator & "Rehavid_Modelacion_Financiera.pdf", _
        Quality:=xlQualityStandard, OpenAfterPublish:=False
    MsgBox "PDF generado junto al libro.", vbInformation, "Rehavid"
    Exit Sub
Fallo:
    MsgBox "No se pudo exportar: " & Err.Description, vbExclamation, "Rehavid"
End Sub

Public Sub IrAPanel()
    ThisWorkbook.Worksheets("Panel").Activate
    ThisWorkbook.Worksheets("Panel").Range("C5").Select
End Sub
'''

VBA_THISWORKBOOK = r'''
Option Explicit

Private Sub Workbook_Open()
    On Error Resume Next
    ThisWorkbook.Worksheets("Panel").Activate
    Application.StatusBar = "Rehavid - Modelacion financiera. Las macros estan activas."
    On Error GoTo 0
End Sub

Private Sub Workbook_BeforeClose(Cancel As Boolean)
    On Error Resume Next
    Application.StatusBar = False
    On Error GoTo 0
End Sub
'''


def construir(destino):
    D = leer_datos()
    vba_bin = os.path.join(AQUI, '_vba_tmp.bin')
    vba_patch.patch(BASE_VBA, vba_bin,
                    {'Module1': VBA_MODULO, 'ThisWorkbook': VBA_THISWORKBOOK})

    wb = xlsxwriter.Workbook(destino, {'nan_inf_to_errors': True})
    wb.set_vba_name('ThisWorkbook')

    # ---------------- formatos ----------------
    f = {
        'titulo': wb.add_format({'bold': True, 'font_size': 17, 'font_color': MORADO, 'font_name': 'Calibri'}),
        'sub': wb.add_format({'font_size': 10, 'font_color': '#5A4A95', 'italic': True, 'text_wrap': True, 'valign': 'top'}),
        'h2': wb.add_format({'bold': True, 'font_size': 12, 'font_color': MORADO_OSC, 'bottom': 1, 'border_color': LAVANDA}),
        'th': wb.add_format({'bold': True, 'font_color': 'white', 'bg_color': MORADO, 'border': 1,
                             'border_color': MORADO, 'text_wrap': True, 'valign': 'vcenter', 'font_size': 9}),
        'rot': wb.add_format({'bold': True, 'font_size': 9, 'font_color': '#5A4A95'}),
        'txt': wb.add_format({'text_wrap': True, 'valign': 'top', 'border': 1, 'border_color': LAVANDA, 'font_size': 9}),
        'txtz': wb.add_format({'text_wrap': True, 'valign': 'top', 'border': 1, 'border_color': LAVANDA,
                               'font_size': 9, 'bg_color': PAPEL2}),
        'ent': wb.add_format({'border': 1, 'border_color': MORADO, 'bg_color': '#FFFDF0',
                              'num_format': '#,##0.00', 'bold': True}),
        'entp': wb.add_format({'border': 1, 'border_color': MORADO, 'bg_color': '#FFFDF0',
                               'num_format': '0.00"%"', 'bold': True}),
        'enti': wb.add_format({'border': 1, 'border_color': MORADO, 'bg_color': '#FFFDF0',
                               'num_format': '#,##0', 'bold': True}),
        'num': wb.add_format({'num_format': '#,##0', 'border': 1, 'border_color': LAVANDA, 'font_size': 9}),
        'num2': wb.add_format({'num_format': '#,##0.00', 'border': 1, 'border_color': LAVANDA, 'font_size': 9}),
        'kpi': wb.add_format({'num_format': '#,##0.00', 'bold': True, 'font_size': 13,
                              'font_color': MORADO, 'border': 1, 'border_color': LAVANDA}),
        'kpin': wb.add_format({'num_format': '#,##0', 'bold': True, 'font_size': 13,
                               'font_color': MORADO, 'border': 1, 'border_color': LAVANDA}),
        'nota': wb.add_format({'font_size': 8.5, 'font_color': '#8478B2', 'text_wrap': True, 'valign': 'top'}),
        'aviso': wb.add_format({'font_size': 9, 'bg_color': '#FBF3E0', 'font_color': '#B8770F',
                                'text_wrap': True, 'valign': 'top', 'border': 1, 'border_color': '#E8D9B0'}),
        'ok': wb.add_format({'font_size': 9, 'bg_color': '#DCF9E9', 'font_color': VERDE_OSC,
                             'text_wrap': True, 'valign': 'top', 'border': 1, 'border_color': '#A9E9C6'}),
    }

    # ================= PANEL =================
    P = wb.add_worksheet('Panel'); P.set_vba_name('Sheet1')
    P.hide_gridlines(2)
    P.set_column('A:A', 2); P.set_column('B:B', 34); P.set_column('C:C', 16)
    P.set_column('D:D', 3); P.set_column('E:N', 11)

    P.write('B2', 'Rehavid · Modelación financiera', f['titulo'])
    P.write('B3', 'Deuda, cobertura, liquidez y capacidad · fórmulas F1 a F7 del documento técnico maestro v1.0', f['sub'])

    P.merge_range('B4:C4', 'PARÁMETROS DE LA OBLIGACIÓN', f['h2'])
    params = [
        ('Monto de deuda',                1_000_000, 'enti', 'monto'),
        ('Tasa nominal anual (%)',              12.0, 'entp', 'tasa'),
        ('Número de periodos',                    12, 'enti', 'plazo'),
        ('Periodos por año',                       4, 'enti', 'm'),
    ]
    fila = 4
    for etq, val, fmt, nombre in params:
        P.write(fila, 1, etq, f['rot'])
        P.write_number(fila, 2, val, f[fmt])
        wb.define_name(nombre, f"=Panel!$C${fila+1}")
        fila += 1

    P.write(fila, 1, 'Método de amortización', f['rot'])
    P.write_string(fila, 2, 'frances', f['ent'])
    P.data_validation(fila, 2, fila, 2,
                      {'validate': 'list', 'source': ['frances', 'aleman', 'bullet']})
    wb.define_name('metodo', f"=Panel!$C${fila+1}")
    fila += 1
    P.write(fila, 1, 'Periodos de gracia de principal', f['rot'])
    P.write_number(fila, 2, 0, f['enti'])
    wb.define_name('gracia', f"=Panel!$C${fila+1}")
    fila += 1

    P.merge_range(fila, 1, fila, 2, 'FLUJO DISPONIBLE', f['h2']); fila += 1
    P.write(fila, 1, 'CFADS del primer periodo', f['rot'])
    P.write_number(fila, 2, 120_000, f['enti']); wb.define_name('cfads0', f"=Panel!$C${fila+1}"); fila += 1
    P.write(fila, 1, 'Crecimiento del CFADS por periodo (%)', f['rot'])
    P.write_number(fila, 2, 0, f['entp']); wb.define_name('crec', f"=Panel!$C${fila+1}"); fila += 1

    P.merge_range(fila, 1, fila, 2, 'RESTRICCIONES', f['h2']); fila += 1
    P.write(fila, 1, 'Covenant DSCR mínimo', f['rot'])
    P.write_number(fila, 2, 1.20, f['ent']); wb.define_name('covenant', f"=Panel!$C${fila+1}"); fila += 1
    P.write(fila, 1, 'Caja inicial', f['rot'])
    P.write_number(fila, 2, 150_000, f['enti']); wb.define_name('caja0', f"=Panel!$C${fila+1}"); fila += 1
    P.write(fila, 1, 'Caja mínima exigida', f['rot'])
    P.write_number(fila, 2, 80_000, f['enti']); wb.define_name('cajamin', f"=Panel!$C${fila+1}"); fila += 1

    P.merge_range('B17:C17', 'INDICADORES', f['h2'])
    P.write('B18', 'Tasa del periodo', f['rot'])
    P.write_formula('C18', '=tasa/100/m', wb.add_format({'num_format': '0.0000', 'border': 1, 'border_color': LAVANDA}))
    P.write('B19', 'Periodos amortizables', f['rot'])
    P.write_formula('C19', '=MAX(plazo-gracia,1)', f['num'])
    P.write('B20', 'DSCR mínimo del horizonte', f['rot'])
    # MIN ignora las celdas de texto, de modo que "No calculable" y "" quedan fuera
    # sin necesidad de formula matricial (que exigiria Ctrl+Mayus+Intro en Excel antiguo).
    P.write_formula('C20', '=MIN(Modelo!$H$4:$H$63)', f['kpi'])
    P.write('B21', 'Brecha mínima de caja', f['rot'])
    P.write_formula('C21', '=MIN(Modelo!$K$4:$K$63)', f['kpin'])
    P.write('B22', 'Servicio total del horizonte', f['rot'])
    P.write_formula('C22', '=SUM(Modelo!$E$4:$E$63)', f['kpin'])
    P.write('B23', 'Interés total', f['rot'])
    P.write_formula('C23', '=SUM(Modelo!$C$4:$C$63)', f['kpin'])
    P.write('B24', 'Escenario factible', f['rot'])
    P.write_formula('C24', '=IF(AND(C20>=covenant,C21>=0),"Factible","No factible")',
                    wb.add_format({'bold': True, 'font_size': 12, 'border': 1, 'border_color': LAVANDA}))

    P.write('B25', 'Capacidad máxima factible', f['rot'])
    P.write_string('C25', 'pulse el botón', wb.add_format({'font_size': 9, 'font_color': '#8478B2',
                                                           'border': 1, 'border_color': LAVANDA}))
    P.write('B26', 'Restricción vinculante', f['rot'])
    P.write_string('C26', '—', wb.add_format({'font_size': 9, 'font_color': '#8478B2',
                                              'border': 1, 'border_color': LAVANDA}))

    P.conditional_format('C24', {'type': 'text', 'criteria': 'containing', 'value': 'No factible',
                                 'format': wb.add_format({'font_color': ROJO, 'bold': True})})
    P.conditional_format('C24', {'type': 'text', 'criteria': 'containing', 'value': 'Factible',
                                 'format': wb.add_format({'font_color': VERDE_OSC, 'bold': True})})
    P.conditional_format('C20', {'type': 'cell', 'criteria': '<', 'value': 'covenant',
                                 'format': wb.add_format({'font_color': ROJO, 'bold': True, 'num_format': '#,##0.00'})})
    P.conditional_format('C21', {'type': 'cell', 'criteria': '<', 'value': 0,
                                 'format': wb.add_format({'font_color': ROJO, 'bold': True, 'num_format': '#,##0'})})

    P.merge_range('E2:N4',
                  'Los valores de este libro son un EJEMPLO NEUTRO. El documento técnico maestro no contiene '
                  'ninguna cifra financiera: ni tasas, ni plazos, ni montos, ni umbrales de covenant, ni caja '
                  'mínima. Reemplácelos por los datos reales antes de usar el modelo para decidir.', f['aviso'])
    P.merge_range('E5:N6',
                  'Este libro funciona sin macros: las fórmulas, los gráficos y el formato condicional son '
                  'nativos de Excel. Las macros solo añaden el redibujado del diagrama de flujo, la iteración '
                  'de escenarios y la comprobación CP-009.', f['ok'])

    # gráficos nativos
    ch1 = wb.add_chart({'type': 'column', 'subtype': 'stacked'})
    ch1.add_series({'name': 'Principal', 'categories': '=Modelo!$A$4:$A$27',
                    'values': '=Modelo!$D$4:$D$27', 'fill': {'color': MORADO}, 'border': {'none': True}})
    ch1.add_series({'name': 'Interés', 'categories': '=Modelo!$A$4:$A$27',
                    'values': '=Modelo!$C$4:$C$27', 'fill': {'color': VERDE}, 'border': {'none': True}})
    ch1.set_title({'name': 'Perfil de deuda · principal e interés por periodo'})
    ch1.set_legend({'position': 'bottom'})
    ch1.set_size({'width': 470, 'height': 250})
    ch1.set_y_axis({'major_gridlines': {'visible': True, 'line': {'color': LAVANDA}}})
    P.insert_chart('E8', ch1)

    ch2 = wb.add_chart({'type': 'line'})
    ch2.add_series({'name': 'DSCR', 'categories': '=Modelo!$A$4:$A$27', 'values': '=Modelo!$H$4:$H$27',
                    'line': {'color': MORADO, 'width': 2.25},
                    'marker': {'type': 'circle', 'size': 5, 'fill': {'color': MORADO}}})
    ch2.add_series({'name': 'Covenant', 'categories': '=Modelo!$A$4:$A$27', 'values': '=Modelo!$L$4:$L$27',
                    'line': {'color': ROJO, 'width': 1.5, 'dash_type': 'dash'}, 'marker': {'type': 'none'}})
    ch2.set_title({'name': 'Cobertura · DSCR frente al covenant'})
    ch2.set_legend({'position': 'bottom'})
    ch2.set_size({'width': 470, 'height': 250})
    P.insert_chart('E22', ch2)

    ch3 = wb.add_chart({'type': 'line'})
    ch3.add_series({'name': 'Caja final', 'categories': '=Modelo!$A$4:$A$27', 'values': '=Modelo!$J$4:$J$27',
                    'line': {'color': MORADO, 'width': 2.25},
                    'marker': {'type': 'circle', 'size': 5, 'fill': {'color': MORADO}}})
    ch3.add_series({'name': 'Caja mínima', 'categories': '=Modelo!$A$4:$A$27', 'values': '=Modelo!$M$4:$M$27',
                    'line': {'color': ROJO, 'width': 1.5, 'dash_type': 'dash'}, 'marker': {'type': 'none'}})
    ch3.set_title({'name': 'Liquidez · caja final frente a la caja mínima'})
    ch3.set_legend({'position': 'bottom'})
    ch3.set_size({'width': 470, 'height': 250})
    P.insert_chart('E36', ch3)

    P.insert_button('B28', {'macro': 'CalcularCapacidad', 'caption': 'Calcular capacidad',
                            'width': 152, 'height': 28})
    P.insert_button('B38', {'macro': 'RedibujarFlujo', 'caption': 'Redibujar flujo',
                            'width': 152, 'height': 28})
    P.insert_button('B30', {'macro': 'IterarEscenarios', 'caption': 'Iterar escenarios',
                            'width': 152, 'height': 28})
    P.insert_button('B32', {'macro': 'ComprobarMonotonia', 'caption': 'Comprobar CP-009',
                            'width': 152, 'height': 28})
    P.insert_button('B34', {'macro': 'ExportarPDF', 'caption': 'Exportar a PDF',
                            'width': 152, 'height': 28})
    P.write('B36', 'Los cinco botones requieren macros habilitadas.', f['nota'])

    # ================= MODELO =================
    M = wb.add_worksheet('Modelo'); M.set_vba_name('Sheet2')
    M.hide_gridlines(2)
    M.write('A1', 'Calendario de deuda, cobertura y liquidez', f['titulo'])
    M.write('A2', 'Cada columna implementa una fórmula del §8 del documento. Cambie los parámetros en la hoja Panel.', f['sub'])
    cabs = ['Periodo', 'Saldo inicial', 'Interés', 'Principal', 'Servicio', 'Saldo final',
            'CFADS', 'DSCR', 'Caja inicial', 'Caja final', 'Brecha', 'Covenant', 'Caja mínima']
    for c, t in enumerate(cabs):
        M.write(2, c, t, f['th'])
    M.set_column('A:A', 8); M.set_column('B:M', 14)
    M.freeze_panes(3, 1)

    NF = 60
    for i in range(NF):
        r = 3 + i               # fila 0-index
        e = r + 1               # fila Excel
        ant = r                 # fila anterior en Excel es r (porque e-1)
        t = i + 1
        activo = f'({t}<=plazo)'
        M.write_formula(r, 0, f'=IF({t}<=plazo,{t},"")', f['num'])
        if i == 0:
            M.write_formula(r, 1, f'=IF({activo},monto,"")', f['num'])
            M.write_formula(r, 8, f'=IF({activo},caja0,"")', f['num'])
        else:
            M.write_formula(r, 1, f'=IF({activo},F{ant},"")', f['num'])
            M.write_formula(r, 8, f'=IF({activo},J{ant},"")', f['num'])
        M.write_formula(r, 2, f'=IF({activo},B{e}*tasa/100/m,"")', f['num'])
        M.write_formula(
            r, 3,
            f'=IF({activo},IF({t}<=gracia,0,'
            f'IF(metodo="frances",MIN(B{e},IF(tasa>0,monto*(tasa/100/m)/(1-(1+tasa/100/m)^-MAX(plazo-gracia,1)),'
            f'monto/MAX(plazo-gracia,1))-C{e}),'
            f'IF(metodo="aleman",MIN(B{e},monto/MAX(plazo-gracia,1)),'
            f'IF({t}=plazo,B{e},0)))),"")', f['num'])
        M.write_formula(r, 4, f'=IF({activo},C{e}+D{e},"")', f['num'])
        M.write_formula(r, 5, f'=IF({activo},B{e}-D{e},"")', f['num'])
        M.write_formula(r, 6, f'=IF({activo},cfads0*(1+crec/100)^{i},"")', f['num'])
        # RN-FIN-02: servicio cero -> No calculable, nunca infinito
        M.write_formula(r, 7, f'=IF({activo},IF(E{e}=0,"No calculable",G{e}/E{e}),"")', f['num2'])
        M.write_formula(r, 9, f'=IF({activo},I{e}+G{e}-E{e},"")', f['num'])
        M.write_formula(r, 10, f'=IF({activo},J{e}-cajamin,"")', f['num'])
        M.write_formula(r, 11, f'=IF({activo},covenant,"")', f['num2'])
        M.write_formula(r, 12, f'=IF({activo},cajamin,"")', f['num'])

    M.conditional_format(3, 7, 3 + NF - 1, 7,
                         {'type': 'cell', 'criteria': '<', 'value': 'covenant',
                          'format': wb.add_format({'font_color': ROJO, 'bold': True, 'num_format': '#,##0.00'})})
    M.conditional_format(3, 10, 3 + NF - 1, 10,
                         {'type': 'cell', 'criteria': '<', 'value': 0,
                          'format': wb.add_format({'font_color': ROJO, 'bold': True, 'num_format': '#,##0'})})
    M.conditional_format(3, 4, 3 + NF - 1, 4, {'type': 'data_bar', 'bar_color': MORADO})
    M.conditional_format(3, 6, 3 + NF - 1, 6, {'type': 'data_bar', 'bar_color': VERDE})

    M.write(3 + NF + 1, 0,
            'RN-FIN-02: cuando el servicio de deuda es cero, el DSCR se muestra como "No calculable", '
            'nunca como infinito. La columna H implementa esa regla.', f['nota'])

    # ================= ESCENARIOS =================
    E = wb.add_worksheet('Escenarios'); E.set_vba_name('Sheet3')
    E.hide_gridlines(2)
    E.write('A1', 'Comparación de escenarios', f['titulo'])
    E.write('A2', 'Los resultados se llenan con el botón «Iterar escenarios» del Panel. '
                  'Sin macros, copie los parámetros de una fila al Panel y lea los indicadores.', f['sub'])
    ecabs = ['Escenario', 'Monto', 'Tasa %', 'CFADS', 'Crecim. %', 'Covenant', 'Caja mín.',
             'DSCR mín.', 'Brecha mín.', 'Servicio total', 'Interés total']
    for c, t in enumerate(ecabs):
        E.write(2, c, t, f['th'])
    E.set_column('A:A', 22); E.set_column('B:K', 14)
    escenarios = [
        ('Base (ejemplo neutro)', 1_000_000, 12.0, 120_000, 0.0, 1.20, 80_000),
        ('CFADS -15 %',           1_000_000, 12.0, 102_000, 0.0, 1.20, 80_000),
        ('Tasa +400 pb',          1_000_000, 16.0, 120_000, 0.0, 1.20, 80_000),
        ('Covenant 1,35',         1_000_000, 12.0, 120_000, 0.0, 1.35, 80_000),
        ('Caja mínima 120k',      1_000_000, 12.0, 120_000, 0.0, 1.20, 120_000),
    ]
    for i, fila_e in enumerate(escenarios):
        r = 3 + i
        E.write(r, 0, fila_e[0], f['txt'] if i % 2 else f['txtz'])
        for c, v in enumerate(fila_e[1:], start=1):
            E.write_number(r, c, v, f['num2'] if c in (2, 4, 5) else f['num'])
        for c in range(7, 11):
            E.write_blank(r, c, f['num2'] if c == 7 else f['num'])
    E.merge_range('A10:K11',
                  'Estos cinco escenarios son un ejemplo neutro para demostrar el mecanismo. No corresponden a '
                  'ninguna operación de Rehavid. RN-FIN-05: toda variable de entrada debe identificar fuente, '
                  'responsable, fecha y racional.', f['aviso'])

    E.write('A14', 'Supuestos y su fuente', f['h2'])
    for c, t in enumerate(['Variable', 'Valor', 'Unidad', 'Fuente', 'Responsable', 'Racional']):
        E.write(14, c, t, f['th'])
    for i in range(8):
        for c in range(6):
            E.write_blank(15 + i, c, f['txt'] if i % 2 else f['txtz'])
    E.write(24, 0, 'RN-FIN-05 y RF-010: un supuesto sin fuente queda en borrador y no puede aprobarse.', f['nota'])

    # ================= FLUJOS =================
    FL = wb.add_worksheet('Flujos'); FL.set_vba_name('Sheet4')
    FL.hide_gridlines(2)
    FL.write('A1', 'Flujo del modelador', f['titulo'])
    FL.write('A2', 'Edite, añada o elimine filas y pulse «Redibujar flujo» en el Panel. '
                   'Sin macros, la tabla sigue siendo la descripción del proceso.', f['sub'])
    for c, t in enumerate(['N.º', 'Nodo', 'Tipo']):
        FL.write(2, c, t, f['th'])
    FL.set_column('A:A', 6); FL.set_column('B:B', 46); FL.set_column('C:C', 14)
    pasos = [(1, 'Crear proyecto y declarar propósito, responsable y alcance', 'inicio')]
    pasos += [(i + 2, p, 'decision' if 'valid' in p.lower() or 'revis' in p.lower() else 'proceso')
              for i, p in enumerate(D['RUTAS'][1]['pasos'][1:-1] if 'RUTAS' in D else [])]
    if len(pasos) == 1:   # RUTAS no exportado: se usa la ruta del modelador del documento
        pasos = [
            (1, 'Crear proyecto: propósito, responsable, horizonte, moneda', 'inicio'),
            (2, 'Registrar fuentes, supuestos y escenarios', 'proceso'),
            (3, 'Configurar obligaciones de deuda', 'proceso'),
            (4, 'Definir el mapeo del CFADS', 'proceso'),
            (5, 'Registrar covenants y condiciones de liquidez', 'proceso'),
            (6, '¿Las validaciones de integridad pasan?', 'decision'),
            (7, 'Calcular calendario, DSCR, caja y capacidad', 'proceso'),
            (8, 'Comparar escenarios determinísticos', 'proceso'),
            (9, 'Exportar el modelo para Risk Simulator', 'proceso'),
            (10, 'Importar resultados y validar correspondencia', 'proceso'),
            (11, '¿El revisor aprueba la versión?', 'decision'),
            (12, 'Cerrar versión aprobada y registrar decisión', 'fin'),
        ]
    for i, (n, txt, tipo) in enumerate(pasos):
        r = 3 + i
        FL.write_number(r, 0, n, f['num'])
        FL.write(r, 1, txt, f['txt'] if i % 2 else f['txtz'])
        FL.write(r, 2, tipo, f['txt'] if i % 2 else f['txtz'])
        FL.data_validation(r, 2, r, 2,
                           {'validate': 'list', 'source': ['inicio', 'proceso', 'decision', 'fin']})

    # ================= SUPUESTOS =================
    D = wb.add_worksheet('Supuestos'); D.set_vba_name('Sheet5')
    D.hide_gridlines(2)
    D.write('A1', 'Supuestos y su fuente', f['titulo'])
    D.write('A2', 'RN-FIN-05: toda variable de entrada debe identificar fuente, responsable, fecha y racional. '
                  'RN-FIN-06: histórico, presupuesto y proyección no se mezclan sin etiqueta.', f['sub'])
    for c, t in enumerate(['Variable', 'Valor', 'Unidad', 'Tipo', 'Periodo', 'Fuente', 'Racional', 'Responsable', 'Fecha']):
        D.write(2, c, t, f['th'])
    D.set_column('A:A', 30); D.set_column('B:B', 13); D.set_column('C:C', 14)
    D.set_column('D:D', 14); D.set_column('E:E', 18); D.set_column('F:G', 38); D.set_column('H:I', 16)
    for i in range(24):
        for c in range(9):
            D.write_blank(3 + i, c, f['txt'] if i % 2 else f['txtz'])
        D.data_validation(3 + i, 3, 3 + i, 3,
                          {'validate': 'list', 'source': ['Dato histórico', 'Presupuesto', 'Proyección']})
    D.conditional_format(3, 5, 26, 5,
                         {'type': 'blanks',
                          'format': wb.add_format({'bg_color': '#FAE7EC', 'border': 1, 'border_color': LAVANDA})})
    D.write(29, 0, 'Las celdas de Fuente vacías se resaltan: un supuesto sin fuente deja el modelo en borrador (RF-010).', f['nota'])

    # ================= COVENANTS =================
    C = wb.add_worksheet('Covenants'); C.set_vba_name('Sheet6')
    C.hide_gridlines(2)
    C.write('A1', 'Covenants y restricciones', f['titulo'])
    C.write('A2', 'RN-FIN-03: tipo, umbral, periodo, fuente y vigencia. El umbral proviene del contrato: '
                  'la app no debe inventarlo (§8.2).', f['sub'])
    for c, t in enumerate(['Indicador', 'Umbral', 'Frecuencia', 'Periodo de cura', 'Consecuencia',
                           'Fuente contractual', 'Vigente desde', 'Vigente hasta']):
        C.write(2, c, t, f['th'])
    C.set_column('A:A', 26); C.set_column('B:B', 11); C.set_column('C:C', 16)
    C.set_column('D:D', 18); C.set_column('E:F', 34); C.set_column('G:H', 15)
    C.write(3, 0, 'DSCR mínimo', f['txtz'])
    C.write_formula(3, 1, '=covenant', f['num2'])
    C.write(3, 2, 'Cada periodo', f['txtz'])
    for c in range(3, 8):
        C.write_blank(3, c, f['txtz'])
    for i in range(1, 12):
        for c in range(8):
            C.write_blank(3 + i, c, f['txt'] if i % 2 else f['txtz'])
    C.conditional_format(3, 5, 14, 5,
                         {'type': 'blanks',
                          'format': wb.add_format({'bg_color': '#FAE7EC', 'border': 1, 'border_color': LAVANDA})})
    C.merge_range('A17:H18',
                  'Un covenant sin fuente permite guardar borrador, pero impide aprobar el modelo y calcular la '
                  'capacidad máxima definitiva (CP-008). El periodo de cura y la consecuencia determinan el efecto '
                  'real del incumplimiento: no es lo mismo 90 días de cura que aceleración inmediata.', f['aviso'])

    # ---- ajustes de impresión en todas las hojas ----
    for ws in (P, M, E, FL, D, C):
        ws.set_landscape()
        ws.set_paper(1)                 # Carta
        ws.fit_to_pages(1, 0)
        ws.set_margins(0.5, 0.5, 0.6, 0.5)
        ws.repeat_rows(2)
        ws.set_footer('&L&"Calibri"&8Rehavid S.A.S. · Modelación financiera&R&"Calibri"&8Página &P de &N')

    wb.add_vba_project(vba_bin)
    wb.close()
    os.remove(vba_bin)
    return os.path.getsize(destino)


if __name__ == '__main__':
    destino = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, 'dist', 'Rehavid_Modelacion_Financiera_v1.xlsm')
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    n = construir(destino)
    print(f'Libro generado: {destino}  ({n/1024:.0f} KB)')
