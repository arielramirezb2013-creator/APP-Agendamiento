#!/usr/bin/env python3
"""Construye el simulador asíncrono (archivo único) y el paquete web.

Uso:  python3 src/build.py            (desde entregables/simulador-offline)

Fuentes compartidas con la versión de mesa (una sola fuente de verdad para el contenido doctoral):
  ../blueprint-simulacion/src/datos-blueprint.js, datos-escenario.js, theme.css y kit-iconos/.
"""
import hashlib, json, pathlib, re, secrets, shutil, sys, zipfile

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
MESA = RAIZ.parent / "blueprint-simulacion"
PAQUETE = RAIZ / "paquete-web"
ITER = 5000
CLAVE_DEMO = "DEMO-2026"
ACTORES = ["tra", "emp", "ips", "eps", "arl", "afp", "jr", "jn", "mintrabajo", "minsalud", "supersalud", "jueces"]
PREFIJO = {"tra": "trabajador", "emp": "empleador", "jr": "juntaregional", "jn": "juntanacional"}

SIM = ["nucleo.js", "sim-1-estado.js", "sim-2-vistas.js", "sim-3-eventos.js"]
ADM = ["nucleo.js", "adm-1-proyecto.js", "adm-2-vistas.js", "adm-3-resultados.js", "adm-4-eventos.js"]


def leer(p):
    return pathlib.Path(p).read_text(encoding="utf-8")


def norm_clave(c):
    import unicodedata
    return re.sub(r"[\s\-–—_.]", "", unicodedata.normalize("NFKC", c).upper())


def huella_clave(usuario, clave, sal, iteraciones=ITER):
    """Igual que huellaClave() de nucleo.js: PBKDF2-HMAC-SHA256 sobre «usuario\\nCLAVE»."""
    return hashlib.pbkdf2_hmac("sha256", (usuario.strip().lower() + "\n" + norm_clave(clave)).encode(), sal.encode(), iteraciones).hex()


def config_demo():
    """Una cuenta de demostración por rol. La sal se deriva del usuario para que la construcción sea reproducible."""
    cuentas = []
    for a in ACTORES:
        u = "demo-" + PREFIJO.get(a, a)
        sal = hashlib.sha256(("sal-demo:" + u).encode()).hexdigest()[:16]
        cuentas.append({"u": u, "a": a, "s": sal, "h": huella_clave(u, CLAVE_DEMO, sal), "p": True})
    return {"formato": 1, "demo": {"clave": CLAVE_DEMO}, "estudio": {"id": "demostracion"},
            "kdf": {"alg": "PBKDF2-HMAC-SHA256", "iter": ITER}, "envio": None, "cuentas": cuentas, "generado": None}


def json_seguro(o):
    """JSON que puede ir dentro de <script> sin cerrar la etiqueta."""
    return json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def estilos():
    extra = "".join(leer(AQUI / f) for f in ("estilos.css", "estilos-adm.css", "estilos-informe.css") if (AQUI / f).exists())
    return leer(MESA / "src/theme.css") + "\n  /* ===== Kit de iconos (iconos.css) ===== */\n  " + leer(MESA / "kit-iconos/iconos.css").strip() + "\n" + extra


def aplicacion(partes):
    datos = [MESA / "src/datos-blueprint.js", MESA / "src/datos-escenario.js", AQUI / "datos-guion.js"]
    cuerpo = "\n".join(leer(p).rstrip() for p in datos + [AQUI / x for x in partes])
    return '(function () {\n"use strict";\n' + cuerpo + "\n})();"


def pagina(cabeza, esqueleto, partes, incluida=None, externa=False, rol="participante", doctype=True, con_config=True):
    cfg = "<script>/*CONFIG:INICIO*/window.SIM_CONFIG_INCLUIDA=" + (json_seguro(incluida) if incluida else "null") + ";/*CONFIG:FIN*/</script>\n" if con_config else ""
    ext = '<script src="configuracion.js"></script>\n' if externa else ""
    cuerpo = (leer(AQUI / esqueleto).rstrip() + "\n" + cfg + ext + "<script>\n" + leer(MESA / "kit-iconos/iconos.js").strip() + "\n</script>\n<script>\n" + aplicacion(partes) + "\n</script>\n")
    cab = leer(AQUI / cabeza).rstrip() + "\n<style>\n" + estilos() + "</style>\n"
    if not doctype:   # forma para publicar como artefacto: el visor pone el esqueleto del documento
        return cab + cuerpo
    return ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            + cab + '</head>\n<body data-rol="' + rol + '">\n' + cuerpo + "</body>\n</html>\n")


def escribir(ruta, texto):
    ruta = pathlib.Path(ruta); ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(texto, encoding="utf-8", newline="\n")
    print(f"  {ruta.relative_to(RAIZ)}  {len(texto.encode()):>8,} bytes".replace(",", "."))


def comprimir(carpeta, destino):
    """Zip reproducible: orden fijo y fecha fija."""
    with zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in sorted(p for p in carpeta.rglob("*") if p.is_file()):
            info = zipfile.ZipInfo(str(pathlib.PurePosixPath(carpeta.name) / f.relative_to(carpeta).as_posix()), date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED; info.external_attr = 0o644 << 16
            z.writestr(info, f.read_bytes())
    print(f"  {destino.relative_to(RAIZ)}  {destino.stat().st_size:>8,} bytes".replace(",", "."))


def main():
    demo = config_demo()
    print("Simulador (archivo único, con cuentas de demostración):")
    escribir(RAIZ / "simulador.html", pagina("head-sim.html", "skel-sim.html", SIM, incluida=demo))
    escribir(RAIZ / "simulador-artefacto.html", pagina("head-sim.html", "skel-sim.html", SIM, incluida=demo, doctype=False))
    if all((AQUI / x).exists() for x in ADM):
        print("Paquete web:")
        escribir(PAQUETE / "index.html", pagina("head-sim.html", "skel-sim.html", SIM, externa=True))
        escribir(PAQUETE / "configuracion.js", "/* Configuración de demostración. Reemplácela por la que genera el panel del investigador (administrador.html). */\nwindow.SIM_CONFIG = " + json.dumps(demo, ensure_ascii=False, indent=1) + ";\n")
        escribir(PAQUETE / "administrador.html", pagina("head-adm.html", "skel-adm.html", ADM, rol="admin", con_config=False))
        for origen, destino in [("servidor/sw.js", "sw.js"), ("servidor/recibir.php", "recibir.php"), ("servidor/recibir-config.php", "recibir-config.php"), ("servidor/htaccess-respuestas.txt", "respuestas/.htaccess"), ("servidor/index-respuestas.html", "respuestas/index.html"),
                                ("guias/LEEME.txt", "LEEME.txt"), ("guias/guia-despliegue.html", "guia-despliegue.html"), ("guias/guia-investigador.html", "guia-investigador.html")]:
            if (AQUI / origen).exists(): escribir(PAQUETE / destino, leer(AQUI / origen))
            else: print("  (falta la fuente " + origen + ")")
        comprimir(PAQUETE, RAIZ / "paquete-web.zip")
    else:
        print("Paquete web: pendiente (faltan módulos del panel del investigador).")


if __name__ == "__main__":
    sys.exit(main())
