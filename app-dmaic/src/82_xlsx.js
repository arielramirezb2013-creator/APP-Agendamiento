/* ============================================================================
   XLSX · inyección de datos sobre las PLANTILLAS ORIGINALES
   Conserva formato, colores, celdas combinadas, gráficos y fórmulas del Excel
   original: sólo escribe los valores del usuario en sus celdas.
   ========================================================================== */
'use strict';

const XL = (function(){

  /* ------------------------------------------------------- referencias A1 */
  function colNum(c){ let n = 0; for (let i = 0; i < c.length; i++) n = n * 26 + (c.charCodeAt(i) - 64); return n; }
  function colName(n){ let s = ''; while (n > 0){ const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; } return s; }
  function refParts(ref){ const m = /^([A-Z]+)(\d+)$/.exec(String(ref).toUpperCase()); return m ? { c: m[1], r: +m[2], cn: colNum(m[1]) } : null; }
  const shift = (ref, dr, dc) => { const p = refParts(ref); return p ? colName(p.cn + (dc || 0)) + (p.r + (dr || 0)) : ref; };

  /* fecha → serial de Excel (base 1899-12-30) */
  function serial(v){
    const d = (v instanceof Date) ? v : dParse(v);
    if (!d) return null;
    return Math.round((d.getTime() - Date.UTC(1899, 11, 30)) / 86400000);
  }
  const xmlEsc = s => String(s).replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]))
                               .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  /* ------------------------------------------------- escritura de celdas */
  /** Escribe un lote de celdas en el XML de una hoja.
   *  cells = { 'B3': valor, ... }  (valor: string | number | Date | {v,t} )
   *  Nunca sobreescribe celdas que contienen fórmula. */
  function writeCells(xml, cells){
    const refs = Object.keys(cells).filter(r => refParts(r));
    if (!refs.length) return xml;

    // agrupa por fila
    const byRow = {};
    refs.forEach(r => { const p = refParts(r); (byRow[p.r] = byRow[p.r] || []).push({ ref:r, p, v: cells[r] }); });

    // asegura <sheetData>
    if (xml.indexOf('<sheetData>') < 0){
      xml = xml.replace(/<sheetData\s*\/>/, '<sheetData></sheetData>');
      if (xml.indexOf('<sheetData>') < 0) return xml;
    }

    Object.keys(byRow).map(Number).sort((a, b) => a - b).forEach(rn => {
      const list = byRow[rn].sort((a, b) => a.p.cn - b.p.cn);
      let rowRe = new RegExp('<row r="' + rn + '"([^>]*?)(/>|>([\\s\\S]*?)</row>)');
      let m = rowRe.exec(xml);
      if (!m){
        // crear la fila en su posición ordenada
        const cellsXml = list.map(x => cellXml(x.ref, x.v, null)).join('');
        const newRow = '<row r="' + rn + '">' + cellsXml + '</row>';
        const all = [];
        const rx = /<row r="(\d+)"/g; let mm;
        while ((mm = rx.exec(xml))) all.push({ n:+mm[1], i: mm.index });
        const nxt = all.find(x => x.n > rn);
        if (nxt) xml = xml.slice(0, nxt.i) + newRow + xml.slice(nxt.i);
        else {
          const e = xml.indexOf('</sheetData>');
          xml = xml.slice(0, e) + newRow + xml.slice(e);
        }
        return;
      }
      const attrs = m[1];
      let inner = m[2] === '/>' ? '' : (m[3] || '');
      list.forEach(x => { inner = putCell(inner, x.ref, x.v); });
      xml = xml.slice(0, m.index) + '<row r="' + rn + '"' + attrs + '>' + inner + '</row>' + xml.slice(m.index + m[0].length);
    });
    return xml;
  }

  function putCell(inner, ref, val){
    const p = refParts(ref);
    const re = new RegExp('<c r="' + ref + '"([^>]*?)(/>|>([\\s\\S]*?)</c>)');
    const m = re.exec(inner);
    if (m){
      const attrs = m[1] || '';
      const body  = m[2] === '/>' ? '' : (m[3] || '');
      if (/<f[\s>]/.test(body)) return inner;                 // no tocar fórmulas
      const s = (/ s="(\d+)"/.exec(attrs) || [])[1] || null;
      return inner.slice(0, m.index) + cellXml(ref, val, s) + inner.slice(m.index + m[0].length);
    }
    // insertar respetando el orden de columnas
    const rx = /<c r="([A-Z]+)(\d+)"/g; let mm, pos = -1;
    while ((mm = rx.exec(inner))){
      if (colNum(mm[1]) > p.cn){ pos = mm.index; break; }
    }
    const xmlC = cellXml(ref, val, null);
    return pos < 0 ? inner + xmlC : inner.slice(0, pos) + xmlC + inner.slice(pos);
  }

  function cellXml(ref, val, style){
    const st = style ? ' s="' + style + '"' : '';
    if (val === null || val === undefined || val === '') return '<c r="' + ref + '"' + st + '/>';
    if (typeof val === 'object' && val.t === 'date'){
      const s = serial(val.v);
      return s === null ? '<c r="' + ref + '"' + st + '/>' : '<c r="' + ref + '"' + st + '><v>' + s + '</v></c>';
    }
    if (typeof val === 'object' && val.t === 'formula')
      return '<c r="' + ref + '"' + st + '><f>' + xmlEsc(val.v) + '</f></c>';
    if (typeof val === 'boolean')
      return '<c r="' + ref + '"' + st + ' t="b"><v>' + (val ? 1 : 0) + '</v></c>';
    if (typeof val === 'number' && isFinite(val))
      return '<c r="' + ref + '"' + st + '><v>' + val + '</v></c>';
    // texto (o número como texto si viene con formato)
    const s = String(val);
    if (s !== '' && /^-?\d+(\.\d+)?$/.test(s.trim()))
      return '<c r="' + ref + '"' + st + '><v>' + parseFloat(s) + '</v></c>';
    return '<c r="' + ref + '"' + st + ' t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(s) + '</t></is></c>';
  }

  /* --------------------------------------------- recálculo al abrir Excel */
  function forceRecalc(files){
    delete files['xl/calcChain.xml'];
    if (files['[Content_Types].xml']){
      let ct = ZIP.dec(files['[Content_Types].xml']);
      ct = ct.replace(/<Override[^>]*calcChain\.xml"[^>]*\/>/g, '');
      files['[Content_Types].xml'] = ZIP.enc(ct);
    }
    if (files['xl/_rels/workbook.xml.rels']){
      let rl = ZIP.dec(files['xl/_rels/workbook.xml.rels']);
      rl = rl.replace(/<Relationship[^>]*calcChain\.xml"[^>]*\/>/g, '');
      files['xl/_rels/workbook.xml.rels'] = ZIP.enc(rl);
    }
    if (files['xl/workbook.xml']){
      let wb = ZIP.dec(files['xl/workbook.xml']);
      if (/<calcPr[^>]*\/>/.test(wb))
        wb = wb.replace(/<calcPr([^>]*)\/>/, (s, a) =>
          '<calcPr' + a.replace(/\s*fullCalcOnLoad="[^"]*"/, '') + ' fullCalcOnLoad="1"/>');
      else wb = wb.replace('</workbook>', '<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>');
      files['xl/workbook.xml'] = ZIP.enc(wb);
    }
  }

  /* --------------------------------------------------- inserción de logos */
  /** Sustituye la imagen del logo dentro de la plantilla conservando su nombre
   *  de archivo (así no hay que tocar rels ni [Content_Types]).
   *  Convierte SIEMPRE al formato que declara la extensión original. */
  async function swapLogo(files, mediaPath, dataURL){
    if (!mediaPath || !dataURL || !files[mediaPath]) return;
    try {
      const wantPng = /\.png$/i.test(mediaPath);
      const shrunk = await shrinkImage(dataURL, 640, 320, .92, wantPng ? 'png' : 'jpeg');
      files[mediaPath] = b64ToBytes(shrunk.split(',')[1]);
    } catch(e){ console.warn('No se pudo sustituir el logo:', e); }
  }

  /** Obtiene el PNG de un diagrama, sea cual sea la API que exponga DIAG. */
  async function diagramPNG(kind, d, key){
    if (typeof DIAG === 'undefined') return null;
    try {
      if (DIAG.png) return await DIAG.png(kind, d, key, 2);
      if (DIAG.svg && typeof CHART !== 'undefined' && CHART.toPNG){
        const markup = DIAG.svg(kind, d, key, { w:1200 });
        if (!markup) return null;
        const host = document.createElement('div');
        host.style.cssText = 'position:fixed;left:-9999px;top:0';
        host.innerHTML = markup;
        document.body.appendChild(host);
        const svg = host.querySelector('svg');
        const blob = svg ? await CHART.toPNG(svg, 2) : null;
        host.remove();
        if (!blob) return null;
        return await new Promise(r => { const fr = new FileReader();
          fr.onload = () => r(fr.result); fr.onerror = () => r(null); fr.readAsDataURL(blob); });
      }
    } catch(e){ console.warn('diagrama → PNG', kind, e); }
    return null;
  }

  /* ------------------------------------------- inserción de imágenes libres */
  let _imgSeq = 0;
  async function addImage(files, sheetPath, dataURL, anchor, wCells, hCells){
    if (!dataURL) return;
    const p = refParts(anchor); if (!p) return;
    const small = await shrinkImage(dataURL, 1400, 1400, .85);
    const isPng = /^data:image\/png/i.test(small);
    const bytes = b64ToBytes(small.split(',')[1]);
    const ext = isPng ? 'png' : 'jpeg';

    // nombre libre en xl/media
    let n = 1; while (files['xl/media/rvimg' + n + '.' + ext]) n++;
    const mediaName = 'rvimg' + n + '.' + ext;
    files['xl/media/' + mediaName] = bytes;

    // Content_Types
    let ct = ZIP.dec(files['[Content_Types].xml']);
    if (ct.indexOf('Extension="' + ext + '"') < 0)
      ct = ct.replace('<Types', '<Types').replace(/(<Types[^>]*>)/,
        '$1<Default Extension="' + ext + '" ContentType="image/' + (isPng ? 'png' : 'jpeg') + '"/>');
    files['[Content_Types].xml'] = ZIP.enc(ct);

    // ¿la hoja ya tiene drawing?
    const sheetFile = sheetPath.split('/').pop();
    const relPath = 'xl/worksheets/_rels/' + sheetFile + '.rels';
    let sheetXml = ZIP.dec(files[sheetPath]);
    let drawPath = null, relsXml = files[relPath] ? ZIP.dec(files[relPath]) : null;

    if (relsXml){
      const dm = /Target="\.\.\/(drawings\/drawing\d+\.xml)"/.exec(relsXml);
      if (dm) drawPath = 'xl/' + dm[1];
    }
    if (!drawPath){
      let k = 1; while (files['xl/drawings/drawing' + k + '.xml']) k++;
      drawPath = 'xl/drawings/drawing' + k + '.xml';
      files[drawPath] = ZIP.enc('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" ' +
        'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"></xdr:wsDr>');
      files['xl/drawings/_rels/' + drawPath.split('/').pop() + '.rels'] = ZIP.enc(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');
      // enlaza la hoja con el drawing
      if (!relsXml) relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
      let rid = 'rIdRV' + (++_imgSeq);
      relsXml = relsXml.replace('</Relationships>',
        '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../' +
        drawPath.replace('xl/', '') + '"/></Relationships>');
      files[relPath] = ZIP.enc(relsXml);
      if (!/<drawing /.test(sheetXml))
        sheetXml = sheetXml.replace('</worksheet>', '<drawing r:id="' + rid + '"/></worksheet>');
      files[sheetPath] = ZIP.enc(sheetXml);
      let ctd = ZIP.dec(files['[Content_Types].xml']);
      if (ctd.indexOf(drawPath) < 0)
        ctd = ctd.replace('</Types>', '<Override PartName="/' + drawPath +
          '" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>');
      files['[Content_Types].xml'] = ZIP.enc(ctd);
    }

    // relación imagen ← drawing
    const dRelPath = 'xl/drawings/_rels/' + drawPath.split('/').pop() + '.rels';
    let dRels = files[dRelPath] ? ZIP.dec(files[dRelPath]) :
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
    const imgRid = 'rIdRVI' + (++_imgSeq);
    dRels = dRels.replace('</Relationships>',
      '<Relationship Id="' + imgRid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' +
      mediaName + '"/></Relationships>');
    files[dRelPath] = ZIP.enc(dRels);

    // ancla de dos celdas
    const c0 = p.cn - 1, r0 = p.r - 1;
    const c1 = c0 + (wCells || 6), r1 = r0 + (hCells || 8);
    const id = 9000 + (++_imgSeq);
    const anchorXml =
      '<xdr:twoCellAnchor editAs="oneCell">' +
      '<xdr:from><xdr:col>' + c0 + '</xdr:col><xdr:colOff>19050</xdr:colOff><xdr:row>' + r0 + '</xdr:row><xdr:rowOff>19050</xdr:rowOff></xdr:from>' +
      '<xdr:to><xdr:col>' + c1 + '</xdr:col><xdr:colOff>-19050</xdr:colOff><xdr:row>' + r1 + '</xdr:row><xdr:rowOff>-19050</xdr:rowOff></xdr:to>' +
      '<xdr:pic><xdr:nvPicPr><xdr:cNvPr id="' + id + '" name="Imagen ' + id + '"/>' +
      '<xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>' +
      '<xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="' + imgRid + '"/>' +
      '<a:stretch><a:fillRect/></a:stretch></xdr:blipFill>' +
      '<xdr:spPr><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic>' +
      '<xdr:clientData/></xdr:twoCellAnchor>';
    let dx = ZIP.dec(files[drawPath]);
    dx = dx.replace('</xdr:wsDr>', anchorXml + '</xdr:wsDr>');
    files[drawPath] = ZIP.enc(dx);
  }

  /* ================================================== RECOLECCIÓN DE DATOS */
  /** Convierte una TOOL + sus datos en { 'HojaX': {celda:valor}, ... } */
  function collect(tool, d, ctx){
    const out = {}, imgs = [];
    const map = tool.xl; if (!map) return { cells: out, imgs };

    const put = (ref, v) => { if (ref && v !== undefined && v !== null && v !== '') out[ref] = v; };

    // campos sueltos
    if (map.fields) Object.keys(map.fields).forEach(k => {
      let v = d[k];
      if (v === undefined || v === '') {
        const blk = findField(tool, k);
        if (blk && blk.calc){ const r = blk.calc(d, ctx); v = (typeof r === 'number' && !isFinite(r)) ? '' : r; }
      }
      if (v === undefined || v === '') return;
      const spec = findField(tool, k);
      put(map.fields[k], (spec && spec.input === 'date') ? { t:'date', v } : v);
    });

    /* tablas normales (una fila del modelo = una fila de la hoja)
       Extensiones soportadas:
         row / step      fila inicial y salto entre registros
         rowsAt:[...]    lista explícita de filas (bloques irregulares)
         endRow          última fila disponible en la plantilla
         merged:['k']    columnas fusionadas: sólo se escribe la celda ancla */
    arr(map.grids).forEach(g => {
      const rows = arr(d[g.key]);
      const blk = (tool.blocks || []).find(b => b.type === 'grid' && b.key === g.key);
      const cols = blk ? (callv(blk.cols, d, ctx) || []) : [];
      const merged = arr(g.merged);
      // columnas cuyo valor calculado NO se escribe: la plantilla ya trae su fórmula
      const omitir = arr(g.skipCalc).concat(arr(map.skipCalc));
      const filas = arr(g.rowsAt).length ? g.rowsAt
        : rows.map((_, i) => g.row + i * (g.step || 1))
              .filter(rn => !g.endRow || rn <= g.endRow);

      rows.slice(0, filas.length).forEach((r, i) => {
        Object.keys(g.cols || {}).forEach(ck => {
          if (merged.indexOf(ck) >= 0 && i > 0) return;      // celda combinada
          if (omitir.indexOf(ck) >= 0) return;               // la hoja ya trae la fórmula
          const cs = cols.find(c => c.k === ck);
          let v = r[ck];
          if (cs && cs.calc){ const rv = cs.calc(r, i, rows, d, ctx); v = (typeof rv === 'number' && !isFinite(rv)) ? '' : rv; }
          if (v === undefined || v === '') return;
          put(g.cols[ck] + filas[i], (cs && cs.input === 'date') ? { t:'date', v } : v);
        });
      });
    });

    /* tablas TRANSPUESTAS (una fila del modelo = una COLUMNA de la hoja).
       Ej. Pareto: categorías en C26:H26 y frecuencias en C27:H27
         transposed:[{ key:'rows', col:'C', maxCols:6, rows:{ cat:26, fre:27 } }] */
    arr(map.transposed).forEach(tp => {
      const rows = arr(d[tp.key]);
      const blk = (tool.blocks || []).find(b => b.type === 'grid' && b.key === tp.key);
      const cols = blk ? (callv(blk.cols, d, ctx) || []) : [];
      const c0 = colNum(tp.col || 'C');
      rows.slice(0, tp.maxCols || rows.length).forEach((r, i) => {
        Object.keys(tp.rows || {}).forEach(ck => {
          const cs = cols.find(c => c.k === ck);
          let v = r[ck];
          if (cs && cs.calc){ const rv = cs.calc(r, i, rows, d, ctx); v = (typeof rv === 'number' && !isFinite(rv)) ? '' : rv; }
          if (v === undefined || v === '') return;
          put(colName(c0 + i) + tp.rows[ck], v);
        });
      });
    });

    // matrices
    arr(map.matrix).forEach(mx => {
      const M = d[mx.key] || {};
      const blk = (tool.blocks || []).find(b => b.type === 'matrix' && b.key === mx.key);
      Object.keys(mx.map || {}).forEach(key => {
        let v = M[key];
        if ((v === undefined || v === '') && blk && blk.calc && blk.calc[key]){
          const rv = blk.calc[key](M, d, ctx); v = (typeof rv === 'number' && !isFinite(rv)) ? '' : rv;
        }
        put(mx.map[key], v);
      });
    });

    // imágenes
    arr(map.images).forEach(im => { if (d[im.k]) imgs.push({ data:d[im.k], anchor:im.anchor, w:im.w, h:im.h }); });

    return { cells: out, imgs };
  }
  function findField(tool, k){
    let f = null;
    (tool.blocks || []).forEach(b => {
      if (b.type === 'fields'){ const x = (callv(b.items, {}, {}) || []).find(i => i.k === k); if (x) f = x; }
      if (b.type === 'a3'){ const x = (callv(b.areas, {}, {}) || []).find(i => i.k === k); if (x && !f) f = x; }
    });
    return f;
  }

  /* ================================================== EXPORTAR UN MÓDULO */
  async function exportModule(modId, opts){
    opts = opts || {};
    const mod = MOD_BY_ID[modId];
    const man = TPL_MANIFEST[mod.file];
    if (!man) throw new Error('No hay plantilla para ' + modId);
    const bytes = b64ToBytes(TPL_DATA[mod.file]);
    const files = await ZIP.read(bytes);
    const ctx = ST.ctx(), proj = ST.proj();

    // logo Rehavid / ARL en lugar del original
    const logo = ST.cfg.logos.rehavid || REHAVID_LOGO_PNG;
    if (man.logo) await swapLogo(files, man.logo, logo);

    let escritas = 0;
    for (const t of toolsOf(modId)){
      const path = man.sheets[t.sheet];
      if (!path || !files[path]) { console.warn('hoja no encontrada:', t.sheet); continue; }
      const d = ST.d(t.id);
      const { cells, imgs } = collect(t, d, ctx);
      const n = Object.keys(cells).length;
      if (n){
        files[path] = ZIP.enc(writeCells(ZIP.dec(files[path]), cells));
        escritas += n;
      }
      for (const im of imgs) await addImage(files, path, im.data, im.anchor, im.w, im.h);
      // diagramas → imagen
      for (const dg of arr(t.xl && t.xl.diagrams)){
        const png = await diagramPNG(dg.kind, d, dg.key);
        if (png) await addImage(files, path, png, dg.anchor, dg.w || 12, dg.h || 20);
      }
    }

    forceRecalc(files);
    const out = await ZIP.write(files);
    const nom = sanitize((proj ? proj.nombre : 'Proyecto')) + ' - ' + mod.n + ' ' + mod.name;
    if (!opts.raw) download(new Blob([out], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), nom + '.xlsx');
    return { bytes: out, name: nom + '.xlsx', celdas: escritas };
  }

  /* ============================= EXPORTAR TODOS (ZIP con los 5 libros) */
  async function exportAllTemplates(){
    const proj = ST.proj();
    const pack = {};
    for (const m of ST.activeMods()){
      const r = await exportModule(m.id, { raw:true });
      pack[r.name] = r.bytes;
    }
    // manual + informe
    pack['LEEME.txt'] = ZIP.enc(readme());
    const z = await ZIP.write(pack);
    download(new Blob([z], { type:'application/zip' }), sanitize(proj.nombre) + ' - DMAIC completo (Excel).zip');
    return Object.keys(pack).length;
  }

  function readme(){
    const p = ST.proj();
    return 'REHAVID · LEAN SIX SIGMA DMAIC\r\n' +
      '==============================\r\n\r\n' +
      'Proyecto : ' + p.nombre + '\r\n' +
      'Empresa  : ' + (p.empresa || '—') + '\r\n' +
      'ARL      : ' + (p.arl || '—') + '\r\n' +
      'Líder    : ' + (p.lider || '—') + '\r\n' +
      'Generado : ' + new Date().toLocaleString('es-CO') + '\r\n' +
      'Avance   : ' + fmt(projProgress(), 'p1') + '\r\n\r\n' +
      'Este paquete contiene los libros de Excel originales de la metodología\r\n' +
      'DMAIC con la información del proyecto ya diligenciada. Las fórmulas se\r\n' +
      'recalculan al abrir cada archivo.\r\n\r\n' +
      'Archivos:\r\n' + ST.activeMods().map(m => '  ' + m.n + '. ' + m.name).join('\r\n') + '\r\n';
  }

  const sanitize = s => String(s || 'Proyecto').replace(/[\\/:*?"<>|]/g, '-').slice(0, 80).trim();

  return { exportModule, exportAllTemplates, writeCells, collect, colName, colNum, refParts,
           shift, serial, forceRecalc, addImage, sanitize, xmlEsc, cellXml, diagramPNG, swapLogo };
})();
