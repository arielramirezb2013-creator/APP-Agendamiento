#!/usr/bin/env python3
"""
Construye un vbaProject.bin válido (contenedor OLE/CFB + MS-OVBA) con las macros
avanzadas del libro consolidado Rehavid LSS DMAIC.

El binario es CONSTANTE (no depende del proyecto del usuario), así que se genera
aquí una sola vez, se valida, y se embebe en base64 dentro de la app HTML.
La app sólo lo copia dentro del .xlsm que arma en el navegador.

Salida: assets/vbaProject.bin  +  assets/vbaProject.b64  +  assets/macros/*.bas
"""
import struct, os, io

# ══════════════════════════════════════════════════════ MS-OVBA compression
def ovba_compress(data: bytes) -> bytes:
    """Contenedor comprimido MS-OVBA usando únicamente tokens literales
    (válido y trivialmente correcto: el descompresor no exige coincidencias)."""
    out = bytearray(b'\x01')                       # SignatureByte
    pos = 0
    while pos < len(data):
        # Buscar cuántos bytes caben en un chunk: cada 8 literales cuestan 9 bytes
        # y el chunk comprimido no puede superar 4096 bytes de datos.
        n = min(len(data) - pos, 4096)
        while ((n + 7) // 8) + n > 4096:
            n -= 8
        chunk = data[pos:pos + n]
        body = bytearray()
        i = 0
        while i < len(chunk):
            grp = chunk[i:i + 8]
            body.append(0x00)                      # FlagByte: los 8 son literales
            body += grp
            i += 8
        # Header: bits 0-11 = size-1 | signature 0b011 << 12 | flag 1 << 15
        hdr = (len(body) - 1) & 0x0FFF | 0x3000 | 0x8000
        out += struct.pack('<H', hdr)
        out += body
        pos += n
    return bytes(out)


# ══════════════════════════════════════════════════════════════ dir stream
def rec(rid, payload):
    return struct.pack('<HI', rid, len(payload)) + payload

def build_dir(modules, project_name=b'VBAProject'):
    d = bytearray()
    # --- PROJECTINFORMATION
    d += rec(0x0001, struct.pack('<I', 0x00000001))                 # SYSKIND (32-bit win)
    d += rec(0x0002, struct.pack('<I', 0x00000409))                 # LCID
    d += rec(0x0014, struct.pack('<I', 0x00000409))                 # LCIDINVOKE
    d += rec(0x0003, struct.pack('<H', 0x04E4))                     # CODEPAGE 1252
    d += rec(0x0004, project_name)                                  # NAME
    d += rec(0x0005, b'') + struct.pack('<HI', 0x0040, 0)           # DOCSTRING + unicode
    d += rec(0x0006, b'') + struct.pack('<HI', 0x003D, 0)           # HELPFILEPATH1 + 2
    d += rec(0x0007, struct.pack('<I', 0))                          # HELPCONTEXT
    d += rec(0x0008, struct.pack('<I', 0))                          # LIBFLAGS
    # PROJECTVERSION: el campo tras el Id es Reserved (fijo 0x00000004), NO la longitud
    d += struct.pack('<HIIH', 0x0009, 0x00000004, 0x00000001, 0x0000)   # VERSION
    d += rec(0x000C, b'') + struct.pack('<HI', 0x003C, 0)           # CONSTANTS + unicode

    # --- PROJECTREFERENCES: referencia a la librería de VBA (stdole/VBA)
    #  REFERENCENAME
    d += rec(0x0016, b'stdole')
    d += struct.pack('<HI', 0x003E, len('stdole'.encode('utf-16-le')))
    d += 'stdole'.encode('utf-16-le')
    #  REFERENCEREGISTERED
    libid = b'*\\G{00020430-0000-0000-C000-000000000046}#2.0#0#C:\\Windows\\System32\\stdole2.tlb#OLE Automation'
    inner = struct.pack('<I', len(libid)) + libid + struct.pack('<IH', 0, 0)
    d += struct.pack('<HI', 0x000D, len(inner)) + inner

    # --- PROJECTMODULES
    d += rec(0x000F, struct.pack('<H', len(modules)))
    d += rec(0x0013, struct.pack('<H', 0x0001))                     # PROJECTCOOKIE

    for name, src, is_doc in modules:
        nb = name.encode('cp1252')
        nu = name.encode('utf-16-le')
        d += rec(0x0019, nb)                                        # MODULENAME
        d += struct.pack('<HI', 0x0047, len(nu)) + nu               # MODULENAMEUNICODE
        d += rec(0x001A, nb)                                        # STREAMNAME
        d += struct.pack('<HI', 0x0032, len(nu)) + nu               # STREAMNAMEUNICODE
        d += rec(0x001C, b'')                                       # DOCSTRING
        d += struct.pack('<HI', 0x0048, 0)
        d += rec(0x0031, struct.pack('<I', 0))                      # TEXTOFFSET
        d += rec(0x001E, struct.pack('<I', 0))                      # HELPCONTEXT
        d += rec(0x002C, struct.pack('<H', 0xFFFF))                 # COOKIE
        d += rec(0x0022 if is_doc else 0x0021, b'')                 # TYPE (doc / procedural)
        d += rec(0x002B, b'')                                       # END
    d += rec(0x0010, b'')                                           # TERMINATOR
    return bytes(d)


# ═════════════════════════════════════════════════════════ CFB / OLE writer
FREESECT, ENDOFCHAIN, FATSECT, DIFSECT = 0xFFFFFFFF, 0xFFFFFFFE, 0xFFFFFFFD, 0xFFFFFFFC
SEC, MINI = 512, 64

class Entry:
    def __init__(self, name, typ):
        self.name, self.typ = name, typ
        self.data = b''
        self.children = []
        self.left = self.right = self.child = 0xFFFFFFFF
        self.start = ENDOFCHAIN
        self.size = 0
        self.idx = 0

def _sort_key(name):
    # Orden CFB: primero por longitud del nombre, luego por nombre en MAYÚSCULAS
    return (len(name), name.upper())

def _build_tree(entries):
    """Construye un árbol balanceado a partir de la lista ordenada."""
    if not entries:
        return 0xFFFFFFFF
    mid = len(entries) // 2
    e = entries[mid]
    e.left = _build_tree(entries[:mid])
    e.right = _build_tree(entries[mid + 1:])
    return e.idx

def write_cfb(root_children, path):
    # --- aplanar la jerarquía y asignar índices
    flat = []
    root = Entry('Root Entry', 5)
    flat.append(root); root.idx = 0

    def walk(parent, kids):
        ordered = sorted(kids, key=lambda e: _sort_key(e.name))
        for k in ordered:
            k.idx = len(flat); flat.append(k)
        for k in ordered:
            if k.children:
                walk(k, k.children)
        parent.child = _build_tree(ordered)
    walk(root, root_children)

    # --- separar streams grandes (FAT) y pequeños (miniFAT)
    big, small = [], []
    for e in flat:
        if e.typ == 2:
            (big if len(e.data) >= 4096 else small).append(e)

    # --- mini stream
    mini_data = bytearray()
    mini_fat = []
    for e in small:
        e.size = len(e.data)
        e.start = len(mini_data) // MINI
        n = (len(e.data) + MINI - 1) // MINI or 1
        first = len(mini_fat)
        for i in range(n):
            mini_fat.append(first + i + 1 if i < n - 1 else ENDOFCHAIN)
        mini_data += e.data + b'\x00' * (n * MINI - len(e.data))

    sectors = []           # lista de bloques de 512 B (contenido)
    fat = []               # entrada FAT por sector

    def alloc(data):
        """Copia data en sectores consecutivos, devuelve el primer sector."""
        if not data:
            return ENDOFCHAIN
        n = (len(data) + SEC - 1) // SEC
        first = len(sectors)
        for i in range(n):
            sectors.append(data[i * SEC:(i + 1) * SEC].ljust(SEC, b'\x00'))
            fat.append(first + i + 1 if i < n - 1 else ENDOFCHAIN)
        return first

    # streams grandes
    for e in big:
        e.size = len(e.data)
        e.start = alloc(e.data)

    # mini stream (colgado del Root Entry)
    root.start = alloc(bytes(mini_data))
    root.size = len(mini_data)

    # miniFAT
    mf = b''.join(struct.pack('<I', x) for x in mini_fat)
    mf = mf.ljust(((len(mf) + SEC - 1) // SEC) * SEC, b'\xFF') if mf else b''
    mini_fat_start = alloc(mf) if mf else ENDOFCHAIN
    mini_fat_cnt = (len(mf) // SEC) if mf else 0

    # directorio
    def dir_entry(e):
        nm = e.name.encode('utf-16-le') + b'\x00\x00'
        b = bytearray(128)
        b[0:len(nm)] = nm
        struct.pack_into('<H', b, 64, len(nm))
        b[66] = e.typ
        b[67] = 1                                   # black
        struct.pack_into('<III', b, 68, e.left, e.right, e.child)
        struct.pack_into('<I', b, 116, e.start if e.typ != 1 else 0)
        struct.pack_into('<Q', b, 120, e.size if e.typ != 1 else 0)
        return bytes(b)

    dir_data = b''.join(dir_entry(e) for e in flat)
    dir_data = dir_data.ljust(((len(dir_data) + SEC - 1) // SEC) * SEC, b'\x00')
    dir_start = alloc(dir_data)

    # --- FAT (iterar hasta estabilizar: la FAT ocupa sectores que van en la FAT)
    n_fat = 1
    while True:
        total = len(sectors) + n_fat
        need = (total * 4 + SEC - 1) // SEC
        if need <= n_fat:
            break
        n_fat = need
    fat_start = len(sectors)
    full_fat = list(fat) + [FATSECT] * n_fat
    fat_bytes = b''.join(struct.pack('<I', x) for x in full_fat)
    fat_bytes = fat_bytes.ljust(n_fat * SEC, b'\xFF')
    fat_sectors = [fat_bytes[i * SEC:(i + 1) * SEC] for i in range(n_fat)]

    # --- cabecera
    h = bytearray(512)
    h[0:8] = b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1'
    struct.pack_into('<H', h, 24, 0x003E)
    struct.pack_into('<H', h, 26, 0x0003)
    struct.pack_into('<H', h, 28, 0xFFFE)
    struct.pack_into('<H', h, 30, 9)
    struct.pack_into('<H', h, 32, 6)
    struct.pack_into('<I', h, 44, n_fat)
    struct.pack_into('<I', h, 48, dir_start)
    struct.pack_into('<I', h, 56, 0x00001000)
    struct.pack_into('<I', h, 60, mini_fat_start)
    struct.pack_into('<I', h, 64, mini_fat_cnt)
    struct.pack_into('<I', h, 68, ENDOFCHAIN)
    struct.pack_into('<I', h, 72, 0)
    for i in range(109):
        struct.pack_into('<I', h, 76 + i * 4, fat_start + i if i < n_fat else FREESECT)

    with open(path, 'wb') as f:
        f.write(bytes(h))
        for s in sectors:
            f.write(s)
        for s in fat_sectors:
            f.write(s)
    return os.path.getsize(path)


# ═════════════════════════════════════════════════════════════ MACROS VBA
MOD_MAIN = r'''Attribute VB_Name = "RehavidDMAIC"
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
'''

MOD_THIS = r'''Attribute VB_Name = "ThisWorkbook"
Attribute VB_Base = "0{00020819-0000-0000-C000-000000000046}"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Attribute VB_TemplateDerived = False
Attribute VB_Customizable = True
Option Explicit

Private Sub Workbook_Open()
    Application.Calculation = xlCalculationAutomatic
    Application.CalculateFullRebuild
End Sub
'''


def main():
    os.makedirs('assets/macros', exist_ok=True)
    modules = [('RehavidDMAIC', MOD_MAIN, False), ('ThisWorkbook', MOD_THIS, True)]

    vba = Entry('VBA', 1)
    vba.children.append(Entry('_VBA_PROJECT', 2))
    vba.children[-1].data = b'\xCC\x61\xFF\xFF\x00\x00\x00'
    d = Entry('dir', 2)
    d.data = ovba_compress(build_dir(modules))
    vba.children.append(d)
    for name, src, _ in modules:
        m = Entry(name, 2)
        m.data = ovba_compress(src.replace('\n', '\r\n').encode('cp1252', 'replace'))
        vba.children.append(m)

    proj = Entry('PROJECT', 2)
    proj.data = (
        'ID="{5B4A7C21-9F3E-4D18-8C6A-1E2F3A4B5C6D}"\r\n'
        'Document=ThisWorkbook/&H00000000\r\n'
        'Module=RehavidDMAIC\r\n'
        'Name="VBAProject"\r\n'
        'HelpContextID="0"\r\n'
        'VersionCompatible32="393222000"\r\n'
        '\r\n'
        '[Host Extender Info]\r\n'
        '&H00000001={3832D640-CF90-11CF-8E43-00A0C911005A};VBE;&H00000000\r\n'
    ).encode('cp1252')

    wm = Entry('PROJECTwm', 2)
    wmb = bytearray()
    for name, _, _ in modules:
        wmb += name.encode('cp1252') + b'\x00' + name.encode('utf-16-le') + b'\x00\x00'
    wmb += b'\x00\x00'
    wm.data = bytes(wmb)

    size = write_cfb([vba, proj, wm], 'assets/vbaProject.bin')
    print('vbaProject.bin  %d bytes' % size)

    import base64
    b = open('assets/vbaProject.bin', 'rb').read()
    open('assets/vbaProject.b64', 'w').write(base64.b64encode(b).decode())
    open('assets/macros/RehavidDMAIC.bas', 'w', encoding='cp1252', errors='replace').write(
        MOD_MAIN.replace('\n', '\r\n'))
    print('base64          %d chars' % len(base64.b64encode(b)))


if __name__ == '__main__':
    main()
