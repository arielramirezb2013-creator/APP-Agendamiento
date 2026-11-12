#!/usr/bin/env python3
"""Ensambla la herramienta en un solo HTML a partir de las fuentes de esta carpeta.

Uso:  python3 src/build.py        (desde entregables/blueprint-simulacion)
Salidas, en la carpeta padre:
  index.html                         forma para publicar como artefacto (sin doctype)
  service-blueprint-simulacion.html  archivo descargable autocontenido
El kit de iconos se toma de ../kit-iconos (iconos.css e iconos.js).
"""
import pathlib

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent
KIT = OUT / "kit-iconos"
PARTES = ["datos-blueprint.js", "datos-escenario.js", "app-1-base.js", "app-2-estado.js",
          "app-3-participante.js", "app-4-facilitador.js", "app-5-eventos.js"]


def leer(p):
    return pathlib.Path(p).read_text(encoding="utf-8")


def construir():
    css = (leer(SRC / "theme.css") + "\n  /* ===== Kit de iconos (iconos.css) ===== */\n  "
           + leer(KIT / "iconos.css").strip() + "\n")
    cabeza = leer(SRC / "head.html") + "<style>\n" + css + "</style>\n"
    cuerpo = (leer(SRC / "skel.html") + "<script>\n" + leer(KIT / "iconos.js").strip() + "\n</script>\n<script>\n"
              + "".join(leer(SRC / p) for p in PARTES) + "</script>\n")
    (OUT / "index.html").write_text(cabeza + cuerpo, encoding="utf-8")
    (OUT / "service-blueprint-simulacion.html").write_text(
        '<!doctype html>\n<html lang="es"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        + cabeza + "</head><body>\n" + cuerpo + "\n</body></html>\n", encoding="utf-8")
    return len(cabeza + cuerpo)


if __name__ == "__main__":
    print("construido:", construir(), "caracteres")
