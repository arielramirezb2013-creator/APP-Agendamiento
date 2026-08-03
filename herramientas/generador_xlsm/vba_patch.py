"""Reemplaza el codigo fuente de los modulos de un vbaProject.bin."""
import olefile
import cfb
import ovba


def _find_text_offset(raw):
    """Devuelve el offset donde arranca el contenedor comprimido con la fuente."""
    for k in range(len(raw)):
        if raw[k] != 1:
            continue
        try:
            d = ovba.decompress(raw[k:])
        except Exception:
            continue
        if b"Attribute VB_Name" in d[:400]:
            return k, d
    raise ValueError("no se encontro la fuente en el modulo")


def read_modules(bin_path):
    o = olefile.OleFileIO(bin_path)
    mods = {}
    for path in o.listdir():
        name = "/".join(path)
        if not name.startswith("VBA/"):
            continue
        short = path[1]
        if short in ("dir", "_VBA_PROJECT") or short.startswith("__SRP"):
            continue
        raw = o.openstream(name).read()
        try:
            off, src = _find_text_offset(raw)
        except ValueError:
            continue
        mods[short] = src.decode("latin-1")
    return mods


def patch(bin_path, out_path, new_sources, drop_srp=True):
    """new_sources: {'Module1': 'codigo...'} sin la linea Attribute VB_Name."""
    o = olefile.OleFileIO(bin_path)
    streams = {"/".join(p): o.openstream("/".join(p)).read() for p in o.listdir()}

    for mod, code in new_sources.items():
        key = "VBA/" + mod
        if key not in streams:
            raise KeyError("el proyecto no tiene el modulo %r (disponibles: %s)"
                           % (mod, sorted(k.split("/")[1] for k in streams if "/" in k)))
        raw = streams[key]
        off, old = _find_text_offset(raw)
        attr = old.split(b"\r\n")[0]                    # conserva Attribute VB_Name
        body = code.replace("\r\n", "\n").replace("\n", "\r\n").encode("latin-1")
        streams[key] = raw[:off] + ovba.compress(attr + b"\r\n" + body)

    if drop_srp:
        # cache compilado obsoleto: se elimina para forzar recompilacion
        streams = {k: v for k, v in streams.items() if "__SRP" not in k}

    vba = cfb.Entry("VBA", cfb.T_STORAGE)
    vba.children = [cfb.Entry(k.split("/")[1], cfb.T_STREAM, v)
                    for k, v in streams.items() if k.startswith("VBA/")]
    top = [cfb.Entry(k, cfb.T_STREAM, v) for k, v in streams.items() if "/" not in k]
    top.append(vba)
    return cfb.write(out_path, top)
