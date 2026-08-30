"""
Genera el archivo único dist/simulador_capsulas_sst_<version>.html a partir de src/.
Inserta la hoja de estilos, los scripts (en orden), las imágenes como data URL, y desde v17 también
las librerías de exporte (vendor/, byte-idénticas a las distribuciones oficiales de npm) y la fuente
Inter variable: el archivo resultante no hace ninguna petición de red; solo la voz necesita internet.
Uso: python3 build.py            → dist/simulador_capsulas_sst_v17.html (versión leída de src/js/config.js)
"""
import base64, os, re, sys

RAIZ = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(RAIZ, "src"); DIST = os.path.join(RAIZ, "dist"); VENDOR = os.path.join(RAIZ, "vendor")
ORDEN = ["js/config.js", "data/capsulas.js", "data/sectores.js", "data/personas_q.js", "data/sura.js", "data/arl_db.js", "js/engine.js", "js/furat.js", "js/main.js"]
LIBS = ["jspdf.umd.min.js", "jspdf.plugin.autotable.min.js", "xlsx.full.min.js"]

def leer(rel): return open(os.path.join(SRC, rel), encoding="utf-8").read()
def leer_vendor(rel): return open(os.path.join(VENDOR, rel), encoding="utf-8").read()
def data_url(rel): return "data:image/png;base64," + base64.b64encode(open(os.path.join(SRC, rel), "rb").read()).decode("ascii")

html = leer("index.html")
version = re.search(r'version:\s*"([^"]+)"', leer("js/config.js")).group(1)
js = "\n".join(leer(p).replace('"use strict";\n', "", 1) for p in ORDEN)
html = html.replace('<link rel="stylesheet" href="styles.css">', "<style>\n" + leer("styles.css").rstrip() + "\n</style>")

# Fuente Inter variable incrustada: sin peticiones a fonts.googleapis.com / fonts.gstatic.com.
font64 = base64.b64encode(open(os.path.join(VENDOR, "inter-latin-wght-normal.woff2"), "rb").read()).decode("ascii")
fface = ("<style>\n@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;"
         "src:url(data:font/woff2;base64," + font64 + ") format('woff2-variations');}\n</style>")
html = re.sub(r'<link rel="preconnect"[^>]*>\n?', "", html)
html = re.sub(r'<link href="https://fonts\.googleapis\.com[^>]*>', lambda m: fface, html, count=1)

# Librerías de exporte incrustadas: PDF y Excel funcionan sin conexión y sin CDN.
libs = "\n".join('<script>\n' + leer_vendor(f).rstrip() + '\n</script>' for f in LIBS)
html = re.sub(r'(<script defer src="https://cdnjs\.cloudflare\.com[^>]*></script>\n?)+', lambda m: libs + "\n", html, count=1)

html = re.sub(r'(<script src="[^"]+"></script>\n?)+', lambda m: '<script>\n"use strict";\n' + js.strip() + "\n</script>\n", html, count=1)
html = html.replace('href="assets/icon.png"', 'href="' + data_url("assets/icon.png") + '"').replace('src="assets/logo.png"', 'src="' + data_url("assets/logo.png") + '"')
html = html.replace("{{VERSION}}", version)
html = html.replace("<!-- Simulador Cápsulas SST · Rehavid S.A.S. · fuente modular; el archivo único se genera con build.py -->", f"<!-- Simulador Cápsulas SST · Rehavid S.A.S. · {version} · generado por build.py a partir de src/ -->")
os.makedirs(DIST, exist_ok=True)
salida = os.path.join(DIST, f"simulador_capsulas_sst_{version}.html")
open(salida, "w", encoding="utf-8").write(html)
print(f"{os.path.relpath(salida, RAIZ)} · {len(html.encode('utf-8'))/1024:.1f} KB · {version}")
