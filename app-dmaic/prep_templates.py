#!/usr/bin/env python3
"""
Prepara las plantillas Excel originales para embeberlas en la app HTML:
  1. Elimina medios huérfanos (no referenciados por ningún drawing) -> quita 4 MB de JPEGs.
  2. Detecta la imagen del logo (la más repetida) para que la app la sustituya por el logo de Rehavid.
  3. Re-comprime el .xlsx y lo deja listo para base64.
Salida: assets/tpl/<FILE>.xlsx  +  assets/tpl/manifest.json
"""
import zipfile, re, os, json, hashlib, collections, shutil

SRC = 'assets'
OUT = 'assets/tpl'
MAP = {
    '5a3b1823-01DEFINIR.xlsx':   '01DEFINIR',
    '9597d3fa-02MEDIR.xlsx':     '02MEDIR',
    'ce453cdb-03ANALIZAR.xlsx':  '03ANALIZAR',
    '18d3e978-04MEJORAR.xlsx':   '04MEJORAR',
    '8f140e27-05CONTROLAR.xlsx': '05CONTROLAR',
}

os.makedirs(OUT, exist_ok=True)
manifest = {}

for src, key in MAP.items():
    path = os.path.join(SRC, src)
    z = zipfile.ZipFile(path)
    names = z.namelist()

    # --- medios referenciados
    used = collections.Counter()
    for n in names:
        if re.match(r'xl/drawings/_rels/drawing\d+\.xml\.rels$', n):
            t = z.read(n).decode('utf8', 'ignore')
            for m in re.findall(r'\.\./media/([^"]+)', t):
                used[m] += 1
    all_media = {n.split('/')[-1] for n in names if n.startswith('xl/media/')}
    orphans = all_media - set(used)

    # --- logo = imagen usada más veces (>=2) ; si no, la usada en más hojas
    logo = None
    if used:
        cand, cnt = used.most_common(1)[0]
        if cnt >= 2:
            logo = cand
    # sha de las candidatas para reconocer el mismo logo entre libros
    hashes = {m: hashlib.md5(z.read('xl/media/' + m)).hexdigest()[:12] for m in used}

    # --- hojas y su orden real
    wb = z.read('xl/workbook.xml').decode('utf8')
    sheets = re.findall(r'<sheet name="([^"]*)"[^>]*r:id="(rId\d+)"', wb)
    rels = z.read('xl/_rels/workbook.xml.rels').decode('utf8')
    relmap = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]*)"', rels))
    sheetmap = {}
    for nm, rid in sheets:
        tgt = relmap.get(rid, '')
        tgt = tgt.replace('/xl/', '').lstrip('/')
        if not tgt.startswith('worksheets/'):
            tgt = 'worksheets/' + tgt.split('/')[-1]
        sheetmap[nm] = 'xl/' + tgt

    # --- reescribe el zip sin huérfanos
    dst = os.path.join(OUT, key + '.xlsx')
    zo = zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED, compresslevel=9)
    dropped = 0
    for it in z.infolist():
        base = it.filename.split('/')[-1]
        if it.filename.startswith('xl/media/') and base in orphans:
            dropped += it.file_size
            continue
        if it.filename.startswith('xl/printerSettings/'):
            dropped += it.file_size
            continue
        zo.writestr(it, z.read(it.filename))
    zo.close()

    manifest[key] = {
        'file': key + '.xlsx',
        'bytes': os.path.getsize(dst),
        'sheets': sheetmap,
        'logo': ('xl/media/' + logo) if logo else None,
        'logoHash': hashes.get(logo),
        'orphansRemoved': sorted(orphans),
        'savedKB': round(dropped / 1024),
    }
    print('%-12s %6.0f KB -> %6.0f KB  (logo: %s, huérfanos: %s)' % (
        key, os.path.getsize(path) / 1024, os.path.getsize(dst) / 1024,
        logo, ', '.join(sorted(orphans)) or '—'))

# limpia printerSettings de los rels que los referencian (evita warnings)
json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
tot = sum(m['bytes'] for m in manifest.values())
print('\nTOTAL plantillas: %.0f KB  (base64 ≈ %.0f KB)' % (tot / 1024, tot * 1.34 / 1024))
