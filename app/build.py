#!/usr/bin/env python3
"""Ensambla la app en un único archivo HTML autocontenido.

Todo queda dentro del archivo: tipografía, estilos, lógica, el texto íntegro del
documento y el libro Excel en base64. Sin CDN, sin peticiones de red, sin
servidor. Se abre con doble clic.
"""
import base64
import html
import os
import re
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(AQUI, 'src')
DIST = os.path.join(AQUI, 'dist')
DOCX = os.path.join(AQUI, 'fuente', 'Documento_Tecnico_App_Modulacion_Financiera_Rehavid_V1.docx')
XLSM = os.path.join(DIST, 'Rehavid_Herramienta_Financiera.xlsm')
SALIDA = os.path.join(DIST, 'Rehavid_App_Modulacion_Financiera.html')


def leer(*partes):
    with open(os.path.join(*partes), encoding='utf-8') as fh:
        return fh.read()


# ----------------------------------------------------------------------
# Extracción del documento de Word
# ----------------------------------------------------------------------
def extraer_docx(ruta):
    """Devuelve (html, texto_plano) del documento, conservando tablas y títulos."""
    from docx import Document
    from docx.oxml.ns import qn
    from docx.table import Table
    from docx.text.paragraph import Paragraph

    doc = Document(ruta)

    def bloques(padre):
        for hijo in padre.element.body.iterchildren():
            if hijo.tag == qn('w:p'):
                yield Paragraph(hijo, padre)
            elif hijo.tag == qn('w:tbl'):
                yield Table(hijo, padre)

    salida, plano, ntab = [], [], 0
    for b in bloques(doc):
        if isinstance(b, Paragraph):
            t = b.text.strip()
            if not t:
                continue
            plano.append(t)
            estilo = (b.style.name or '').lower()
            m = re.match(r'heading (\d)', estilo)
            if m:
                n = min(int(m.group(1)) + 1, 4)
                salida.append(f'<h{n}>{html.escape(t)}</h{n}>')
            elif 'list' in estilo:
                salida.append(f'<li>{html.escape(t)}</li>')
            else:
                salida.append(f'<p>{html.escape(t)}</p>')
        else:
            ntab += 1
            filas = [[c.text.strip() for c in r.cells] for r in b.rows]
            for fila in filas:
                plano.append(' | '.join(fila))
            if not filas:
                continue
            cab, cuerpo = filas[0], filas[1:]
            # Una tabla de una sola celda es un recuadro destacado del documento
            if len(filas) == 1 and len(cab) == 1:
                salida.append(f'<div class="aviso"><p>{html.escape(cab[0])}</p></div>')
                continue
            th = ''.join(f'<th>{html.escape(c)}</th>' for c in cab)
            td = ''.join('<tr>' + ''.join(f'<td>{html.escape(c)}</td>' for c in fila) + '</tr>'
                         for fila in cuerpo)
            salida.append(f'<div class="tabla-caja"><table><caption>Tabla {ntab}</caption>'
                          f'<thead><tr>{th}</tr></thead><tbody>{td}</tbody></table></div>')

    # los <li> sueltos se agrupan en listas
    cuerpo = '\n'.join(salida)
    cuerpo = re.sub(r'(?:<li>.*?</li>\n?)+', lambda m: '<ul>' + m.group(0) + '</ul>', cuerpo, flags=re.S)
    return cuerpo, '\n'.join(plano)


def js_cadena(nombre, valor):
    """Declara una constante JS con el texto en una cadena segura."""
    seguro = (valor.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${'))
    return f'const {nombre} = `{seguro}`;'


def construir():
    if not os.path.exists(XLSM):
        print('El libro Excel no existe todavía; generándolo…')
        subprocess.check_call([sys.executable, os.path.join(AQUI, 'generar_excel.py')])

    css = leer(SRC, 'estilos.css')
    fuente_b64 = base64.b64encode(open(os.path.join(SRC, 'fuentes', 'Outfit-variable.woff2'), 'rb').read()).decode()
    css = css.replace('__FUENTE_OUTFIT__', fuente_b64)

    doc_html, doc_plano = extraer_docx(DOCX)
    xlsm_b64 = base64.b64encode(open(XLSM, 'rb').read()).decode()

    plantilla = leer(SRC, 'plantilla.html')
    piezas = {
        '__ESTILOS__': css,
        '__DATOS_DOC__': leer(SRC, 'datos_documento.js'),
        '__DATOS_FORM__': leer(SRC, 'datos_formacion.js'),
        '__DATOS_FORM_EXTRA__': leer(SRC, 'datos_formacion_extra.js'),
        '__DOC_TEXTO__': js_cadena('DOC_HTML', doc_html) + '\n' + js_cadena('DOC_TEXTO_PLANO', doc_plano),
        '__XLSM__': f'const XLSM_B64 = "{xlsm_b64}";',
        '__ICONOS__': leer(SRC, 'iconos.js'),
        '__GRAFICOS__': leer(SRC, 'graficos.js'),
        '__NUCLEO__': leer(SRC, 'app_nucleo.js'),
        '__MOTOR__': leer(SRC, 'motor_financiero.js'),
        '__MOD_FORMACION__': leer(SRC, 'mod_formacion.js'),
        '__MOD_MANUAL__': leer(SRC, 'mod_manual.js'),
        '__MOD_HERRAMIENTA__': leer(SRC, 'mod_herramienta.js'),
    }
    for marca, contenido in piezas.items():
        if marca not in plantilla:
            raise SystemExit(f'La plantilla no contiene la marca {marca}')
        plantilla = plantilla.replace(marca, contenido)

    os.makedirs(DIST, exist_ok=True)
    with open(SALIDA, 'w', encoding='utf-8') as fh:
        fh.write(plantilla)

    verificar(plantilla)
    n = os.path.getsize(SALIDA)
    print(f'\nHTML generado: {SALIDA}')
    print(f'Peso: {n/1024:.0f} KB  ({n/1024/1024:.2f} MB)')
    print(f'  · tipografía embebida  {len(fuente_b64)/1024:>7.0f} KB')
    print(f'  · libro Excel embebido {len(xlsm_b64)/1024:>7.0f} KB')
    print(f'  · documento incrustado {len(doc_html)/1024:>7.0f} KB')
    return n


def verificar(txt):
    """Comprueba que el archivo no dependa de nada externo."""
    print('\nVerificación de autocontención:')
    fallos = []

    # cualquier URL http(s) fuera de texto de referencia
    externos = re.findall(r'(?:src|href)\s*=\s*["\'](https?:)?//[^"\']+', txt)
    if externos:
        fallos.append(f'{len(externos)} referencia(s) externa(s): {externos[:3]}')
    print(('  OK   ' if not externos else '  FALLA') + '  sin src/href externos')

    for patron, etq in [(r'<link\b', 'sin <link> a hojas de estilo'),
                        (r'@import', 'sin @import en CSS'),
                        (r'fetch\s*\(', 'sin llamadas fetch'),
                        (r'XMLHttpRequest', 'sin XMLHttpRequest'),
                        (r'new\s+WebSocket', 'sin WebSocket')]:
        hay = re.search(patron, txt)
        if hay:
            fallos.append(etq)
        print(('  OK   ' if not hay else '  FALLA') + '  ' + etq)

    for marca in re.findall(r'__[A-Z_]+__', txt):
        fallos.append(f'marca sin sustituir: {marca}')
    print(('  OK   ' if not re.search(r'__[A-Z_]+__', txt) else '  FALLA') + '  todas las marcas sustituidas')

    tiene_fuente = 'data:font/woff2;base64,' in txt
    print(('  OK   ' if tiene_fuente else '  FALLA') + '  tipografía incrustada como data URI')
    if not tiene_fuente:
        fallos.append('falta la tipografía')

    if fallos:
        print('\nFALLOS:')
        for f in fallos:
            print('  - ' + f)
        raise SystemExit(1)
    print('\n  El archivo no depende de ningún recurso externo.')


if __name__ == '__main__':
    construir()
