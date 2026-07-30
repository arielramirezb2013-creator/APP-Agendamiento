Attribute VB_Name = "RehavidDMAIC"
'==============================================================================
' REHAVID  ·  LEAN SIX SIGMA DMAIC
' Motor de macros del libro consolidado.
' Generado automaticamente por la app Rehavid LSS DMAIC (HTML standalone).
'==============================================================================
Option Explicit

Public Const APP_NOMBRE As String = "Rehavid Lean Six Sigma DMAIC"
Public Const APP_VER As String = "1.0"

'--- Colores de marca -----------------------------------------------------
Public Const C_PRIM As Long = 7036683      ' RGB(11,93,107)
Public Const C_ACC  As Long = 10925330     ' RGB(18,179,166)
Public Const C_OK   As Long = 7451183
Public Const C_WARN As Long = 2336757
Public Const C_BAD  As Long = 5000933

'==============================================================================
' PANEL DE CONTROL
'==============================================================================
Public Sub Rehavid_Panel()
    Dim s As String
    s = APP_NOMBRE & " v" & APP_VER & vbCrLf & String(46, "-") & vbCrLf & vbCrLf
    s = s & "1  Recalcular todo el libro" & vbCrLf
    s = s & "2  Actualizar tablero BI" & vbCrLf
    s = s & "3  Generar informe ejecutivo (nueva hoja)" & vbCrLf
    s = s & "4  Exportar el proyecto completo a PDF" & vbCrLf
    s = s & "5  Validar integridad DMAIC" & vbCrLf
    s = s & "6  Limpiar datos (conservando formatos)" & vbCrLf
    s = s & "7  Proteger / desproteger hojas" & vbCrLf & vbCrLf
    s = s & "Escriba el numero de la opcion:"
    Dim r As String
    r = InputBox(s, APP_NOMBRE)
    Select Case Trim(r)
        Case "1": Rehavid_RecalcularTodo
        Case "2": Rehavid_ActualizarBI
        Case "3": Rehavid_InformeEjecutivo
        Case "4": Rehavid_ExportarPDF
        Case "5": Rehavid_ValidarDMAIC
        Case "6": Rehavid_LimpiarDatos
        Case "7": Rehavid_AlternarProteccion
    End Select
End Sub

'==============================================================================
' RECALCULO
'==============================================================================
Public Sub Rehavid_RecalcularTodo()
    Application.Calculation = xlCalculationAutomatic
    Application.CalculateFullRebuild
    MsgBox "Libro recalculado por completo.", vbInformation, APP_NOMBRE
End Sub

'==============================================================================
' INDICADORES  (funciones de hoja de calculo, usables como formula)
'==============================================================================
Public Function REHAVID_SIGMA(dpmo As Double) As Double
Attribute REHAVID_SIGMA.VB_Description = "Nivel sigma a partir del DPMO (con corrimiento de 1,5 sigma)"
    On Error GoTo E
    If dpmo <= 0 Then REHAVID_SIGMA = 6: Exit Function
    If dpmo >= 1000000# Then REHAVID_SIGMA = 0: Exit Function
    REHAVID_SIGMA = Application.WorksheetFunction.Norm_S_Inv(1 - dpmo / 1000000#) + 1.5
    If REHAVID_SIGMA < 0 Then REHAVID_SIGMA = 0
    If REHAVID_SIGMA > 6 Then REHAVID_SIGMA = 6
    Exit Function
E:  REHAVID_SIGMA = CVErr(xlErrValue)
End Function

Public Function REHAVID_DPMO(defectos As Double, unidades As Double, oportunidades As Double) As Variant
    If unidades * oportunidades = 0 Then REHAVID_DPMO = CVErr(xlErrDiv0): Exit Function
    REHAVID_DPMO = defectos / (unidades * oportunidades) * 1000000#
End Function

Public Function REHAVID_RTY(ParamArray yields() As Variant) As Double
    Dim i As Long, r As Double
    r = 1
    For i = LBound(yields) To UBound(yields)
        If IsNumeric(yields(i)) Then r = r * CDbl(yields(i))
    Next
    REHAVID_RTY = r
End Function

Public Function REHAVID_MUESTRA_CUAL(N As Double, p As Double, e As Double, conf As Double) As Variant
    Dim z As Double
    On Error GoTo Er
    z = -Application.WorksheetFunction.Norm_S_Inv((1 - conf) / 2)
    If e = 0 Then REHAVID_MUESTRA_CUAL = CVErr(xlErrDiv0): Exit Function
    If N > 0 Then
        REHAVID_MUESTRA_CUAL = Application.WorksheetFunction.RoundUp( _
            (N * z ^ 2 * p * (1 - p)) / ((N - 1) * e ^ 2 + z ^ 2 * p * (1 - p)), 0)
    Else
        REHAVID_MUESTRA_CUAL = Application.WorksheetFunction.RoundUp(z ^ 2 * p * (1 - p) / e ^ 2, 0)
    End If
    Exit Function
Er: REHAVID_MUESTRA_CUAL = CVErr(xlErrValue)
End Function

Public Function REHAVID_MUESTRA_CUANT(N As Double, sigma As Double, e As Double, conf As Double) As Variant
    Dim z As Double
    On Error GoTo Er
    z = -Application.WorksheetFunction.Norm_S_Inv((1 - conf) / 2)
    If e = 0 Then REHAVID_MUESTRA_CUANT = CVErr(xlErrDiv0): Exit Function
    If N > 0 Then
        REHAVID_MUESTRA_CUANT = Application.WorksheetFunction.RoundUp( _
            (N * z ^ 2 * sigma ^ 2) / ((N - 1) * e ^ 2 + z ^ 2 * sigma ^ 2), 0)
    Else
        REHAVID_MUESTRA_CUANT = Application.WorksheetFunction.RoundUp(z ^ 2 * sigma ^ 2 / e ^ 2, 0)
    End If
    Exit Function
Er: REHAVID_MUESTRA_CUANT = CVErr(xlErrValue)
End Function

Public Function REHAVID_CPK(media As Double, s As Double, lsl As Double, usl As Double) As Variant
    If s = 0 Then REHAVID_CPK = CVErr(xlErrDiv0): Exit Function
    Dim a As Double, b As Double
    a = (usl - media) / (3 * s)
    b = (media - lsl) / (3 * s)
    REHAVID_CPK = IIf(a < b, a, b)
End Function

Public Function REHAVID_INTERPRETA(sigma As Double) As String
    Select Case True
        Case sigma < 2:  REHAVID_INTERPRETA = "CRITICO - proceso fuera de control"
        Case sigma < 3:  REHAVID_INTERPRETA = "MUY BAJO - re-disenar el proceso"
        Case sigma < 4:  REHAVID_INTERPRETA = "BAJO - por debajo del promedio de la industria"
        Case sigma < 5:  REHAVID_INTERPRETA = "ACEPTABLE - promedio de la industria"
        Case sigma < 6:  REHAVID_INTERPRETA = "BUENO - por encima del promedio"
        Case Else:       REHAVID_INTERPRETA = "CLASE MUNDIAL"
    End Select
End Function

'==============================================================================
' TABLERO BI
'==============================================================================
Public Sub Rehavid_ActualizarBI()
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("BI")
    On Error GoTo 0
    If ws Is Nothing Then
        MsgBox "No se encontro la hoja BI en este libro.", vbExclamation, APP_NOMBRE
        Exit Sub
    End If
    Application.ScreenUpdating = False
    ws.Calculate
    SemaforoRango ws.Range("SEMAFORO_BI")
    Application.ScreenUpdating = True
    MsgBox "Tablero BI actualizado.", vbInformation, APP_NOMBRE
End Sub

Private Sub SemaforoRango(r As Range)
    Dim c As Range
    On Error Resume Next
    For Each c In r
        If IsNumeric(c.Value) And c.Value <> "" Then
            If c.Value >= 0.9 Then
                c.Interior.Color = RGB(47, 191, 113)
            ElseIf c.Value >= 0.6 Then
                c.Interior.Color = RGB(245, 166, 35)
            Else
                c.Interior.Color = RGB(229, 72, 77)
            End If
            c.Font.Color = RGB(255, 255, 255)
        End If
    Next
End Sub

'==============================================================================
' INFORME EJECUTIVO
'==============================================================================
Public Sub Rehavid_InformeEjecutivo()
    Dim ws As Worksheet, o As Worksheet, r As Long
    Application.ScreenUpdating = False
    On Error Resume Next
    Application.DisplayAlerts = False
    ThisWorkbook.Worksheets("INFORME").Delete
    Application.DisplayAlerts = True
    On Error GoTo 0
    Set o = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
    o.Name = "INFORME"

    With o
        .Range("B2").Value = "INFORME EJECUTIVO - LEAN SIX SIGMA DMAIC"
        .Range("B2").Font.Size = 18
        .Range("B2").Font.Bold = True
        .Range("B2").Font.Color = C_PRIM
        .Range("B3").Value = "Generado el " & Format(Now, "dd/mm/yyyy hh:mm")
        .Range("B3").Font.Italic = True
        r = 5
        .Cells(r, 2).Value = "FASE": .Cells(r, 3).Value = "HOJAS": .Cells(r, 4).Value = "DILIGENCIADAS": .Cells(r, 5).Value = "AVANCE"
        .Range(.Cells(r, 2), .Cells(r, 5)).Font.Bold = True
        .Range(.Cells(r, 2), .Cells(r, 5)).Interior.Color = C_PRIM
        .Range(.Cells(r, 2), .Cells(r, 5)).Font.Color = RGB(255, 255, 255)
        r = r + 1
        Dim fases As Variant, i As Long
        fases = Array("DEFINIR", "MEDIR", "ANALIZAR", "MEJORAR", "CONTROLAR")
        For i = 0 To UBound(fases)
            Dim tot As Long, llenas As Long
            ContarFase CStr(fases(i)), tot, llenas
            .Cells(r, 2).Value = fases(i)
            .Cells(r, 3).Value = tot
            .Cells(r, 4).Value = llenas
            If tot > 0 Then .Cells(r, 5).Value = llenas / tot
            .Cells(r, 5).NumberFormat = "0.0%"
            r = r + 1
        Next
        .Columns("B:E").AutoFit
        .Range("B2").Select
    End With
    Application.ScreenUpdating = True
    MsgBox "Informe ejecutivo generado en la hoja INFORME.", vbInformation, APP_NOMBRE
End Sub

Private Sub ContarFase(fase As String, ByRef total As Long, ByRef llenas As Long)
    Dim ws As Worksheet
    total = 0: llenas = 0
    For Each ws In ThisWorkbook.Worksheets
        If UCase(Left(ws.Name, Len(fase))) = UCase(fase) Then
            total = total + 1
            If Application.WorksheetFunction.CountA(ws.UsedRange) > 12 Then llenas = llenas + 1
        End If
    Next
End Sub

'==============================================================================
' UTILIDADES
'==============================================================================
Public Sub Rehavid_ExportarPDF()
    Dim ruta As String
    ruta = Application.GetSaveAsFilename( _
        InitialFileName:="Rehavid DMAIC " & Format(Date, "yyyy-mm-dd"), _
        FileFilter:="PDF (*.pdf), *.pdf")
    If ruta = "False" Then Exit Sub
    ThisWorkbook.ExportAsFixedFormat Type:=xlTypePDF, Filename:=ruta, _
        Quality:=xlQualityStandard, IncludeDocProperties:=True, OpenAfterPublish:=True
End Sub

Public Sub Rehavid_ValidarDMAIC()
    Dim ws As Worksheet, msg As String, faltan As Long
    For Each ws In ThisWorkbook.Worksheets
        If Application.WorksheetFunction.CountA(ws.UsedRange) <= 12 Then
            msg = msg & "  - " & ws.Name & vbCrLf
            faltan = faltan + 1
        End If
    Next
    If faltan = 0 Then
        MsgBox "Integridad DMAIC correcta: todas las hojas tienen informacion.", vbInformation, APP_NOMBRE
    Else
        MsgBox "Hojas sin diligenciar (" & faltan & "):" & vbCrLf & vbCrLf & msg, vbExclamation, APP_NOMBRE
    End If
End Sub

Public Sub Rehavid_LimpiarDatos()
    If MsgBox("Se borraran los DATOS conservando formatos y formulas." & vbCrLf & _
              "Esta accion no se puede deshacer. Continuar?", _
              vbYesNo + vbExclamation, APP_NOMBRE) <> vbYes Then Exit Sub
    Dim ws As Worksheet, c As Range
    Application.ScreenUpdating = False
    For Each ws In ThisWorkbook.Worksheets
        On Error Resume Next
        For Each c In ws.UsedRange.SpecialCells(xlCellTypeConstants)
            If Not c.Locked Then c.ClearContents
        Next
        On Error GoTo 0
    Next
    Application.ScreenUpdating = True
    MsgBox "Datos limpiados.", vbInformation, APP_NOMBRE
End Sub

Public Sub Rehavid_AlternarProteccion()
    Dim ws As Worksheet, proteger As Boolean
    proteger = Not ThisWorkbook.Worksheets(1).ProtectContents
    For Each ws In ThisWorkbook.Worksheets
        On Error Resume Next
        If proteger Then
            ws.Protect UserInterfaceOnly:=True, AllowFormattingCells:=True
        Else
            ws.Unprotect
        End If
        On Error GoTo 0
    Next
    MsgBox IIf(proteger, "Hojas protegidas.", "Hojas desprotegidas."), vbInformation, APP_NOMBRE
End Sub

Public Sub Rehavid_IrA(nombreHoja As String)
    On Error Resume Next
    ThisWorkbook.Worksheets(nombreHoja).Activate
End Sub
