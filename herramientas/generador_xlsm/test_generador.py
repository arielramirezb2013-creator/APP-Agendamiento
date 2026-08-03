"""Pruebas del generador de .xlsm con macros.

Ejecutar:  python3 test_generador.py
Requiere:  pip install olefile xlsxwriter oletools
"""
import os
import random
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cfb
import olefile
import ovba
import vba_patch

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vbaProject_base.bin")
fallos = []


def check(nombre, condicion):
    print(("  OK   " if condicion else "  FALLA") + "  " + nombre)
    if not condicion:
        fallos.append(nombre)


def test_compresion():
    print("\n[1] Compresion MS-OVBA")
    o = olefile.OleFileIO(BASE)
    for path in o.listdir():
        name = "/".join(path)
        raw = o.openstream(name).read()
        if path[-1] == "dir":
            datos = ovba.decompress(raw)
        else:
            try:
                _, datos = vba_patch._find_text_offset(raw)
            except ValueError:
                continue
        check("roundtrip %s (%d bytes)" % (name, len(datos)),
              ovba.decompress(ovba.compress(datos)) == datos)

    random.seed(7)
    for n in (0, 1, 3, 4095, 4096, 4097, 8192, 65000):
        s = bytes(random.choice(b"abcdefg \r\n") for _ in range(n))
        check("roundtrip texto de %d bytes" % n, ovba.decompress(ovba.compress(s)) == s)


def test_cfb():
    print("\n[2] Escritor CFB: reconstruir el contenedor base")
    o = olefile.OleFileIO(BASE)
    orig = {"/".join(p): o.openstream("/".join(p)).read() for p in o.listdir()}

    vba = cfb.Entry("VBA", cfb.T_STORAGE)
    vba.children = [cfb.Entry(k.split("/")[1], cfb.T_STREAM, v)
                    for k, v in orig.items() if k.startswith("VBA/")]
    top = [cfb.Entry(k, cfb.T_STREAM, v) for k, v in orig.items() if "/" not in k]
    top.append(vba)
    cfb.write("_test_rebuilt.bin", top)

    got = {"/".join(p): olefile.OleFileIO("_test_rebuilt.bin").openstream("/".join(p)).read()
           for p in olefile.OleFileIO("_test_rebuilt.bin").listdir()}
    check("misma estructura de streams", set(orig) == set(got))
    check("contenido identico en los %d streams" % len(orig),
          all(orig[k] == got.get(k) for k in orig))
    os.remove("_test_rebuilt.bin")


def test_inyeccion():
    print("\n[3] Inyeccion de codigo propio")
    modulo = "Option Explicit\n\n" + "\n".join(
        "Public Function Aux%d(ByVal x As Double) As Double\n    Aux%d = x * %d\nEnd Function"
        % (i, i, i) for i in range(1, 400))
    libro = "Option Explicit\n\nPrivate Sub Workbook_Open()\n    MsgBox \"listo\"\nEnd Sub\n"

    vba_patch.patch(BASE, "_test_custom.bin",
                    {"Module1": modulo, "ThisWorkbook": libro})
    mods = vba_patch.read_modules("_test_custom.bin")

    def norm(s):
        return s.replace("\r\n", "\n").strip()

    check("Module1 (%d chars) se relee identico" % len(modulo),
          norm(mods["Module1"].split("\r\n", 1)[1]) == norm(modulo))
    check("ThisWorkbook se relee identico",
          norm(mods["ThisWorkbook"].split("\r\n", 1)[1]) == norm(libro))
    check("cache compilado __SRP eliminado",
          not any("__SRP" in "/".join(p)
                  for p in olefile.OleFileIO("_test_custom.bin").listdir()))


def test_xlsm():
    print("\n[4] Ensamblado del .xlsm")
    import xlsxwriter

    wb = xlsxwriter.Workbook("_test.xlsm")
    wb.set_vba_name("ThisWorkbook")
    ws = wb.add_worksheet("Panel")
    ws.set_vba_name("Sheet1")
    ws.write_row("A1", ["Etapa", "Valor"])
    for r, row in enumerate([["Diagnostico", 12], ["Diseno", 18], ["Piloto", 7]], 1):
        ws.write_row(r, 0, row)
    ws.add_table(0, 0, 3, 1, {"name": "TblEtapas",
                              "columns": [{"header": "Etapa"}, {"header": "Valor"}]})
    ws.conditional_format(1, 1, 3, 1, {"type": "data_bar", "bar_color": "#02E577"})
    ch = wb.add_chart({"type": "column"})
    ch.add_series({"categories": ["Panel", 1, 0, 3, 0], "values": ["Panel", 1, 1, 3, 1],
                   "fill": {"color": "#4025CE"}})
    ws.insert_chart("E2", ch)
    ws.insert_button("A8", {"macro": "Aux1", "caption": "Ejecutar"})
    wb.add_vba_project("_test_custom.bin")
    wb.close()

    z = zipfile.ZipFile("_test.xlsm")
    n = z.namelist()
    check("vbaProject.bin embebido", "xl/vbaProject.bin" in n)
    check("grafico nativo presente", "xl/charts/chart1.xml" in n)
    check("tabla nativa presente", "xl/tables/table1.xml" in n)
    check("content-type macroEnabled",
          "macroEnabled" in z.read("[Content_Types].xml").decode())
    check("vbaProject embebido sin alterar",
          z.read("xl/vbaProject.bin") == open("_test_custom.bin", "rb").read())


def test_parser_independiente():
    print("\n[5] Verificacion cruzada con oletools (parser ajeno)")
    try:
        from oletools.olevba import VBA_Parser
    except ImportError:
        print("  OMITIDO  oletools no instalado")
        return
    p = VBA_Parser("_test.xlsm")
    check("oletools detecta las macros", p.detect_vba_macros())
    nombres = {vba_name for _, _, vba_name, _ in p.extract_macros()}
    check("oletools extrae Module1", any("Module1" in x for x in nombres))
    check("oletools extrae ThisWorkbook", any("ThisWorkbook" in x for x in nombres))
    for f in ("_test_custom.bin", "_test.xlsm"):
        if os.path.exists(f):
            os.remove(f)


if __name__ == "__main__":
    test_compresion()
    test_cfb()
    test_inyeccion()
    test_xlsm()
    test_parser_independiente()
    print("\n" + "=" * 58)
    if fallos:
        print("FALLARON %d comprobaciones:" % len(fallos))
        for f in fallos:
            print("  - " + f)
        sys.exit(1)
    print("Todas las comprobaciones pasaron.")
    print("NO verificado aqui: apertura real en Microsoft Excel (no disponible).")
