#!/usr/bin/env python3
"""
Ensambla la app Rehavid LSS DMAIC en UN SOLO archivo HTML autónomo.

  python3 build.py            -> REHAVID_LSS_DMAIC.html  (en la raíz del repo)

No requiere red, ni CDN, ni servidor: el HTML resultante se abre con doble clic.
"""
import base64, json, os, re, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, 'src')
ASSET= os.path.join(HERE, 'assets')
OUT  = os.path.abspath(os.path.join(HERE, '..', 'REHAVID_LSS_DMAIC.html'))
VERSION = '1.0.0'

# Orden de concatenación (los datos van primero: son constantes sin dependencias)
ORDER = [
    '05_data.js',
    '15_icons.js',          # generado aquí
    '20_core.js',
    '40_charts.js',
    '45_stats.js',
    '50_diagrams.js',
    '30_render.js',
    '60_specs_definir.js',
    '61_specs_medir.js',
    '62_specs_analizar.js',
    '63_specs_mejorar.js',
    '64_specs_controlar.js',
    '65_specs_guia.js',
    '66_specs_extra_medir.js',
    '67_specs_extra_analizar.js',
    '68_specs_extra_mc.js',
    '75_engine.js',
    '70_bi.js',
    '80_zip.js',
    '82_xlsx.js',
    '83_xlsxgen.js',
    '86_print.js',
    '87_demo.js',
    '88_infografias.js',
    '89_flujo.js',
    '90_app.js',
]


def gen_data_js():
    """Genera src/05_data.js con las plantillas Excel, el VBA y el logo."""
    man = json.load(open(os.path.join(ASSET, 'tpl', 'manifest.json'), encoding='utf-8'))
    tpl = {}
    for key, info in man.items():
        raw = open(os.path.join(ASSET, 'tpl', info['file']), 'rb').read()
        tpl[key] = base64.b64encode(raw).decode()

    vba = ''
    p = os.path.join(ASSET, 'vbaProject.b64')
    if os.path.exists(p):
        vba = open(p).read().strip()

    logo = open(os.path.join(ASSET, 'rehavid_logo.b64')).read().strip()

    # el manifest sin las rutas de medios huérfanos (no hacen falta en runtime)
    slim = {k: {'sheets': v['sheets'], 'logo': v['logo']} for k, v in man.items()}

    js = [
        '/* ===========================================================================',
        '   DATOS EMBEBIDOS — generado por build.py, no editar a mano',
        '   · TPL_DATA        plantillas .xlsx originales de la metodología (base64)',
        '   · TPL_MANIFEST    nombre de hoja -> ruta dentro del .xlsx',
        '   · VBA_B64         módulo de macros VBA del libro consolidado',
        '   · REHAVID_LOGO_PNG  logotipo por defecto',
        '   ======================================================================== */',
        "'use strict';",
        "const APP_VERSION = '%s';" % VERSION,
        "const APP_BUILD = '%s';" % datetime.date.today().isoformat(),
        'const TPL_MANIFEST = %s;' % json.dumps(slim, ensure_ascii=False, separators=(',', ':')),
        'const REHAVID_LOGO_PNG = %s;' % json.dumps(logo),
        'const VBA_B64 = %s;' % json.dumps(vba),
        'const TPL_DATA = {',
    ]
    for k, v in tpl.items():
        js.append('%s: %s,' % (json.dumps(k), json.dumps(v)))
    js.append('};')
    txt = '\n'.join(js)
    open(os.path.join(SRC, '05_data.js'), 'w', encoding='utf-8').write(txt)
    return len(txt)


def main():
    n = gen_data_js()
    print('05_data.js generado (%.0f KB)' % (n / 1024))

    css = open(os.path.join(SRC, '10_style.css'), encoding='utf-8').read()

    stubs = os.path.join(HERE, 'src_stubs')
    usar_stubs = '--stubs' in sys.argv

    parts, faltan = [], []
    for f in ORDER:
        p = os.path.join(SRC, f)
        if not os.path.exists(p) and usar_stubs and os.path.exists(os.path.join(stubs, f)):
            p = os.path.join(stubs, f)
            print('  (stub) %s' % f)
        if not os.path.exists(p):
            faltan.append(f)
            parts.append('/* ===== %s : NO ENCONTRADO ===== */' % f)
            continue
        body = open(p, encoding='utf-8').read()
        # quitar 'use strict' repetidos (ya va uno global) y cierres de módulo
        body = re.sub(r"^\s*['\"]use strict['\"];\s*$", '', body, flags=re.M)
        parts.append('/* ═══════════════════ %s ═══════════════════ */\n%s' % (f, body))

    if faltan:
        print('AVISO · faltan estos archivos:', ', '.join(faltan))

    js = '\n\n'.join(parts) + '\n\n/* ── arranque ── */\ndocument.addEventListener("DOMContentLoaded", boot);\n'

    html = """<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5">
<meta name="description" content="Rehavid · Herramienta Lean Six Sigma DMAIC. Aplicación autónoma, sin servidor ni internet.">
<meta name="color-scheme" content="dark light">
<title>Rehavid · Lean Six Sigma DMAIC</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%233B26D3'/%3E%3Cpath d='M18 78 L46 22 L46 50 L32 78 Z' fill='%230FE17B'/%3E%3Cpath d='M52 78 L74 40 L74 78 Z' fill='%230FE17B'/%3E%3C/svg%3E">
<style>
__CSS__
</style>
</head>
<body>
<div id="app">
  <header id="topbar"></header>
  <div id="main">
    <nav id="nav"></nav>
    <main id="view"></main>
  </div>
</div>
<div id="toasts"></div>
<noscript><div style="padding:40px;font-family:sans-serif">Esta aplicación necesita JavaScript activado.</div></noscript>
<script>
__JS__
</script>
</body>
</html>
"""
    html = html.replace('__CSS__', css).replace('__JS__', js)
    open(OUT, 'w', encoding='utf-8').write(html)
    kb = os.path.getsize(OUT) / 1024
    print('\n✓ %s  (%.0f KB)' % (OUT, kb))

    # Variante para publicar como página web: el servicio aporta el envoltorio
    # <!doctype html><head></head><body>, así que aquí va sólo el contenido.
    art = os.path.join(HERE, 'REHAVID_LSS_DMAIC.artifact.html')
    open(art, 'w', encoding='utf-8').write(
        '<title>Rehavid · Lean Six Sigma DMAIC</title>\n'
        '<style>\n' + css + '\n'
        # el envoltorio externo no trae nuestro reset de altura completa
        'html,body{height:100%;margin:0;overflow:hidden}\n'
        '</style>\n'
        '<div id="app">\n'
        '  <header id="topbar"></header>\n'
        '  <div id="main">\n'
        '    <nav id="nav"></nav>\n'
        '    <main id="view"></main>\n'
        '  </div>\n'
        '</div>\n'
        '<div id="toasts"></div>\n'
        '<script>\n' + js + '\n</script>\n')
    print('✓ %s  (%.0f KB)  · versión publicable' % (art, os.path.getsize(art) / 1024))
    if faltan:
        print('  (build parcial: %d archivo(s) pendiente(s))' % len(faltan))
    return 0 if not faltan else 1


if __name__ == '__main__':
    sys.exit(main())
