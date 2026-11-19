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

SIM = ["nucleo.js", "doc-1-render.js", "sim-1-estado.js", "sim-2-vistas.js", "exp-2-estado.js", "exp-3-vistas.js", "sim-3-eventos.js"]
ADM = ["nucleo.js", "doc-1-render.js", "adm-1-proyecto.js", "adm-2-vistas.js", "adm-3-resultados.js", "adm-5-expediente.js", "adm-4-eventos.js"]


def leer(p):
    return pathlib.Path(p).read_text(encoding="utf-8")


def norm_clave(c):
    import unicodedata
    return re.sub(r"[\s\-–—_.]", "", unicodedata.normalize("NFKC", c).upper())


def huella_clave(usuario, clave, sal, iteraciones=ITER):
    """Igual que huellaClave() de nucleo.js: PBKDF2-HMAC-SHA256 sobre «usuario\\nCLAVE»."""
    return hashlib.pbkdf2_hmac("sha256", (usuario.strip().lower() + "\n" + norm_clave(clave)).encode(), sal.encode(), iteraciones).hex()


# Los otros tres expedientes del catálogo, cada uno con una cuenta de demostración del rol que lo decide,
# para que el archivo de demostración deje recorrer los cuatro casos sintéticos.
OTROS_EXPEDIENTES = [("PI-L02", "arl"), ("PI-L03", "arl"), ("PI-L04", "arl")]


def cuenta_demo(u, a, **extra):
    """La sal se deriva del usuario para que la construcción sea reproducible."""
    sal = hashlib.sha256(("sal-demo:" + u).encode()).hexdigest()[:16]
    c = {"u": u, "a": a, "s": sal, "h": huella_clave(u, CLAVE_DEMO, sal), "p": True}
    c.update(extra)
    return c


def config_demo(con_otros_expedientes=True):
    """Configuración SOLO para los archivos de demostración: una cuenta por rol, todas con la contraseña
    pública DEMO-2026. Nunca va en lo que se publica para uso real."""
    cuentas = [cuenta_demo("demo-" + PREFIJO.get(a, a), a) for a in ACTORES]
    if con_otros_expedientes:
        cuentas += [cuenta_demo("demo-" + PREFIJO.get(a, a) + "-" + e.split("-")[1].lower(), a, expediente=e) for e, a in OTROS_EXPEDIENTES]
    return {"formato": 1, "demo": {"clave": CLAVE_DEMO},
            "estudio": {"id": "demostracion", "instrumento": "expediente", "expediente": "PI-L01"},
            "kdf": {"alg": "PBKDF2-HMAC-SHA256", "iter": ITER}, "envio": None, "cuentas": cuentas, "generado": None}


# Plantilla de configuracion.js para el paquete de uso real: sin estudio y sin cuentas. El sitio dice que no
# está configurado hasta que se sube el configuracion.js que genera el panel del investigador.
PLANTILLA_CONFIG = """/* configuracion.js · PLANTILLA SIN CUENTAS

   Este paquete es la versión para uso real: no trae cuentas de demostración ni de ningún participante.
   Reemplace este archivo por el configuracion.js que genera el panel del investigador
   (administrador.html, momento «Publicar»). Mientras siga esta plantilla, el simulador dice que todavía
   no está configurado y no deja entrar a nadie.

   Para ver cómo funciona la herramienta sin configurar nada, use simulador-demo.html, que se entrega aparte. */
window.SIM_CONFIG = null;
"""


def json_seguro(o):
    """JSON que puede ir dentro de <script> sin cerrar la etiqueta."""
    return json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def estilos():
    extra = "".join(leer(AQUI / f) for f in ("estilos.css", "estilos-adm.css", "estilos-informe.css", "estilos-doc.css") if (AQUI / f).exists())
    return leer(MESA / "src/theme.css") + "\n  /* ===== Kit de iconos (iconos.css) ===== */\n  " + leer(MESA / "kit-iconos/iconos.css").strip() + "\n" + extra


def perfil_base():
    """El caso del proyecto, en el formato de perfiles, incluido en la construcción.
    Da el contenido real de los campos de las cinco piezas de evidencia, que el blueprint solo nombra."""
    p = RAIZ / "perfiles/perfil-ejemplo-mp.json"
    d = json.loads(leer(p))
    return "/* Perfil base del caso, desde perfiles/perfil-ejemplo-mp.json */\nconst PERFIL_BASE = " + json.dumps(d["perfiles"][0], ensure_ascii=False) + ";"


def documentos():
    """Los documentos sintéticos de los casos (src/docs/): base.js primero y luego cada caso, en orden fijo."""
    d = AQUI / "docs"
    if not (d / "base.js").exists():
        return "const DOCS = { exp:{}, ruta:{} };"
    otros = sorted(p for p in d.glob("*.js") if p.name != "base.js")
    return "\n".join(leer(p).rstrip() for p in [d / "base.js"] + otros)


def aplicacion(partes):
    datos = [MESA / "src/datos-blueprint.js", MESA / "src/datos-escenario.js", AQUI / "datos-guion.js"]
    cuerpo = "\n".join(leer(p).rstrip() for p in datos)
    cuerpo += "\n" + perfil_base() + "\n" + leer(AQUI / "datos-ramas.js").rstrip()
    cuerpo += "\n" + leer(AQUI / "datos-expedientes.js").rstrip() + "\n" + leer(AQUI / "exp-1-motor.js").rstrip()
    cuerpo += "\n" + documentos()
    # El visor de documentos puede faltar mientras se generan: la construcción no se rompe por eso.
    cuerpo += "\n" + "\n".join(leer(AQUI / x).rstrip() for x in partes if (AQUI / x).exists() or x != "doc-1-render.js")
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
    print("Demostración (archivo único, con cuentas de demostración y los cuatro expedientes):")
    escribir(RAIZ / "simulador-demo.html", pagina("head-sim.html", "skel-sim.html", SIM, incluida=demo))
    escribir(RAIZ / "simulador-demo-artefacto.html", pagina("head-sim.html", "skel-sim.html", SIM, incluida=demo, doctype=False))
    # Variante con el otro instrumento: la ruta de incapacidad de once pasos del service blueprint.
    # Su propio estudio: así su avance no se mezcla con el de la otra demostración en el mismo navegador.
    ruta = config_demo(con_otros_expedientes=False); ruta["estudio"].update({"id": "demostracion-ruta", "instrumento": "ruta"}); ruta["estudio"].pop("expediente", None)
    escribir(RAIZ / "simulador-ruta-demo.html", pagina("head-sim.html", "skel-sim.html", SIM, incluida=ruta))
    # Para el investigador: todos los documentos sintéticos de los casos, con sus versiones. No va en el paquete.
    if (AQUI / "doc-1-render.js").exists(): escribir(RAIZ / "documentos-sinteticos.html", pagina("head-docs.html", "skel-docs.html", ["nucleo.js", "doc-1-render.js", "anexo-docs.js"], rol="documentos", con_config=False))
    print("Uso real (sin cuentas de demostración):")
    # Archivo único sin configuración: el panel le pone las cuentas del estudio («Publicar → Simulador en un solo archivo»).
    escribir(RAIZ / "simulador.html", pagina("head-sim.html", "skel-sim.html", SIM, incluida=None))
    for viejo in ("simulador-ruta.html", "simulador-artefacto.html"):   # nombres anteriores de las demostraciones
        if (RAIZ / viejo).exists(): (RAIZ / viejo).unlink(); print("  (se retiró " + viejo + ")")
    print("Paquete web (uso real):")
    escribir(PAQUETE / "index.html", pagina("head-sim.html", "skel-sim.html", SIM, externa=True))
    escribir(PAQUETE / "configuracion.js", PLANTILLA_CONFIG)
    faltan = [x for x in ADM if not (AQUI / x).exists()]
    if faltan: print("  (panel del investigador pendiente: faltan " + ", ".join(faltan) + ")")
    else: escribir(PAQUETE / "administrador.html", pagina("head-adm.html", "skel-adm.html", ADM, rol="admin", con_config=False))
    for origen, destino in [("servidor/sw.js", "sw.js"), ("servidor/recibir.php", "recibir.php"), ("servidor/recibir-config.php", "recibir-config.php"), ("servidor/htaccess-respuestas.txt", "respuestas/.htaccess"), ("servidor/htaccess-sitio.txt", ".htaccess"), ("servidor/index-respuestas.html", "respuestas/index.html"),
                            ("guias/LEEME.txt", "LEEME.txt"), ("guias/guia-despliegue.html", "guia-despliegue.html"), ("guias/guia-investigador.html", "guia-investigador.html")]:
        if (AQUI / origen).exists(): escribir(PAQUETE / destino, leer(AQUI / origen))
        else: print("  (falta la fuente " + origen + ")")
    comprimir(PAQUETE, RAIZ / "paquete-web.zip")


if __name__ == "__main__":
    sys.exit(main())
