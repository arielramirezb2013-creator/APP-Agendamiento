"""Escritor minimo de Compound File Binary ([MS-CFB] v3, sectores de 512 bytes)."""
import struct

SECTOR = 512
MINI_SECTOR = 64
MINI_CUTOFF = 4096

FREESECT = 0xFFFFFFFF
ENDOFCHAIN = 0xFFFFFFFE
FATSECT = 0xFFFFFFFD
DIFSECT = 0xFFFFFFFC
NOSTREAM = 0xFFFFFFFF

T_STORAGE, T_STREAM, T_ROOT = 1, 2, 5


class Entry:
    def __init__(self, name, kind, data=b"", clsid=b"\x00" * 16):
        self.name = name
        self.kind = kind
        self.data = data
        self.clsid = clsid
        self.children = []
        self.left = self.right = self.child = NOSTREAM
        self.start = ENDOFCHAIN
        self.size = 0
        self.index = None


def _sortkey(e):
    # [MS-CFB] 2.6.4: primero longitud del nombre, luego nombre en mayusculas.
    return (len(e.name), e.name.upper())


def _build_tree(entries):
    """Arbol binario balanceado a partir de los hermanos ordenados."""
    entries = sorted(entries, key=_sortkey)

    def rec(lo, hi):
        if lo > hi:
            return NOSTREAM
        mid = (lo + hi) // 2
        e = entries[mid]
        e.left = rec(lo, mid - 1)
        e.right = rec(mid + 1, hi)
        return e.index

    return rec(0, len(entries) - 1)


def _chain(fat, sectors):
    for i in range(len(sectors) - 1):
        fat[sectors[i]] = sectors[i + 1]
    if sectors:
        fat[sectors[-1]] = ENDOFCHAIN


def write(path, tree):
    """tree: Entry raiz con .children (storages/streams anidados)."""
    # --- numerar entradas en orden: raiz, luego recorrido por niveles ---
    root = Entry("Root Entry", T_ROOT)
    root.children = tree
    flat = [root]

    def collect(e):
        for c in e.children:
            flat.append(c)
        for c in e.children:
            collect(c)

    collect(root)
    for i, e in enumerate(flat):
        e.index = i

    # --- separar streams grandes y pequenos ---
    small, big = [], []
    for e in flat:
        if e.kind == T_STREAM:
            (small if len(e.data) < MINI_CUTOFF else big).append(e)

    # --- mini stream ---
    mini_stream = bytearray()
    mini_fat = []
    for e in small:
        first = len(mini_stream) // MINI_SECTOR
        n = max(1, (len(e.data) + MINI_SECTOR - 1) // MINI_SECTOR)
        mini_stream += e.data + b"\x00" * (n * MINI_SECTOR - len(e.data))
        secs = list(range(first, first + n))
        for k in range(n - 1):
            while len(mini_fat) <= secs[k]:
                mini_fat.append(FREESECT)
            mini_fat[secs[k]] = secs[k + 1]
        while len(mini_fat) <= secs[-1]:
            mini_fat.append(FREESECT)
        mini_fat[secs[-1]] = ENDOFCHAIN
        e.start = first
        e.size = len(e.data)

    # --- asignacion de sectores normales ---
    payloads = []          # (lista_de_sectores, bytes) en orden de asignacion
    next_sector = 0

    def alloc(data):
        nonlocal next_sector
        n = max(1, (len(data) + SECTOR - 1) // SECTOR)
        secs = list(range(next_sector, next_sector + n))
        next_sector += n
        payloads.append((secs, data + b"\x00" * (n * SECTOR - len(data))))
        return secs

    for e in big:
        secs = alloc(e.data)
        e.start = secs[0]
        e.size = len(e.data)

    if mini_stream:
        secs = alloc(bytes(mini_stream))
        root.start = secs[0]
        root.size = len(mini_stream)
    else:
        root.start, root.size = ENDOFCHAIN, 0

    minifat_secs = []
    if mini_fat:
        mf = b"".join(struct.pack("<I", v) for v in mini_fat)
        pad = (-len(mf)) % SECTOR
        minifat_secs = alloc(mf + b"\xff" * pad)

    # --- directorio ---
    dir_count = ((len(flat) + 3) // 4) * 4
    dir_secs = alloc(b"\x00" * (dir_count * 128))

    # --- dimensionar la FAT (iterativo: la FAT ocupa sectores) ---
    data_sectors = next_sector
    fat_sectors = 1
    while True:
        total = data_sectors + fat_sectors
        need = max(1, (total * 4 + SECTOR - 1) // SECTOR)
        if need == fat_sectors:
            break
        fat_sectors = need
    fat_secs = list(range(data_sectors, data_sectors + fat_sectors))
    total_sectors = data_sectors + fat_sectors

    fat = [FREESECT] * (fat_sectors * SECTOR // 4)
    for secs, _ in payloads:
        _chain(fat, secs)
    for s in fat_secs:
        fat[s] = FATSECT

    # --- construir arbol de directorio ---
    for e in flat:
        if e.children:
            e.child = _build_tree(e.children)

    dir_bytes = bytearray()
    for e in flat:
        raw = e.name.encode("utf-16-le") + b"\x00\x00"
        raw = raw[:64].ljust(64, b"\x00")
        dir_bytes += raw
        dir_bytes += struct.pack("<H", min(len(e.name) * 2 + 2, 64))
        dir_bytes += struct.pack("<BB", e.kind, 1)          # 1 = negro
        dir_bytes += struct.pack("<III", e.left, e.right, e.child)
        dir_bytes += e.clsid
        dir_bytes += struct.pack("<I", 0)                    # state bits
        dir_bytes += b"\x00" * 16                            # tiempos
        dir_bytes += struct.pack("<I", e.start if e.kind != T_STORAGE else 0)
        dir_bytes += struct.pack("<Q", e.size if e.kind != T_STORAGE else 0)
    dir_bytes += b"\x00" * (dir_count * 128 - len(dir_bytes))
    # reescribir el sector del directorio ya reservado
    for i, (secs, data) in enumerate(payloads):
        if secs == dir_secs:
            payloads[i] = (secs, bytes(dir_bytes).ljust(len(secs) * SECTOR, b"\x00"))

    # --- cabecera ---
    header = bytearray()
    header += b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"
    header += b"\x00" * 16                                   # CLSID
    header += struct.pack("<HH", 0x003E, 0x0003)             # version menor/mayor
    header += struct.pack("<H", 0xFFFE)                      # orden de bytes
    header += struct.pack("<HH", 9, 6)                       # 2^9=512, 2^6=64
    header += b"\x00" * 6
    header += struct.pack("<I", 0)                           # num dir sectors (v3)
    header += struct.pack("<I", fat_sectors)
    header += struct.pack("<I", dir_secs[0])
    header += struct.pack("<I", 0)                           # transaccion
    header += struct.pack("<I", MINI_CUTOFF)
    header += struct.pack("<I", minifat_secs[0] if minifat_secs else ENDOFCHAIN)
    header += struct.pack("<I", len(minifat_secs))
    header += struct.pack("<I", ENDOFCHAIN)                  # primer DIFAT
    header += struct.pack("<I", 0)                           # num DIFAT
    difat = [fat_secs[i] if i < len(fat_secs) else FREESECT for i in range(109)]
    if len(fat_secs) > 109:
        raise ValueError("archivo demasiado grande para DIFAT en cabecera")
    for v in difat:
        header += struct.pack("<I", v)
    assert len(header) == SECTOR, len(header)

    # --- ensamblar ---
    out = bytearray(header)
    body = bytearray(b"\x00" * (total_sectors * SECTOR))
    for secs, data in payloads:
        for i, s in enumerate(secs):
            body[s * SECTOR:(s + 1) * SECTOR] = data[i * SECTOR:(i + 1) * SECTOR]
    fat_raw = b"".join(struct.pack("<I", v) for v in fat)
    for i, s in enumerate(fat_secs):
        body[s * SECTOR:(s + 1) * SECTOR] = fat_raw[i * SECTOR:(i + 1) * SECTOR]
    out += body
    with open(path, "wb") as fh:
        fh.write(out)
    return len(out)
