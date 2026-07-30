/* ============================================================================
   GENERADOR DEL LIBRO CONSOLIDADO  ·  "TODO EN UNO"
   Construye desde cero un .xlsx / .xlsm con las 53 hojas, portada, índice
   con hipervínculos, tablero BI con fórmulas vivas entre hojas, tablas de
   Excel, validaciones, formato condicional y el módulo de macros VBA.
   ========================================================================== */
'use strict';

const GEN = (function(){

  const E = XL.xmlEsc;
  const cn = XL.colName;

  /** Vuelca un diagrama a texto indentado para la hoja de Excel.
   *  Usa DIAG.toText si existe; si no, recorre la estructura genéricamente. */
  function diagramTexto(kind, d, key){
    if (typeof DIAG !== 'undefined' && DIAG.toText){
      try { const s = DIAG.toText(kind, d, key); if (s) return s; } catch(e){}
    }
    const walk = (v, ind, etiqueta) => {
      const pad = '   '.repeat(ind);
      if (v === null || v === undefined || v === '') return [];
      if (typeof v !== 'object') return [pad + (etiqueta ? etiqueta + ': ' : '• ') + v];
      if (Array.isArray(v)) return v.reduce((a, x) => a.concat(walk(x, ind)), []);
      return Object.keys(v).filter(k => k !== '_id' && k !== '_')
        .reduce((a, k) => a.concat(walk(v[k], ind + 1, k)), etiqueta ? [pad + etiqueta.toUpperCase()] : []);
    };
    return walk(d[key], 0).join('\n');
  }

  /* ------------------------------------------------------------ ESTILOS */
  /* Índices de estilo (s="n") usados por el generador:
     0 normal · 1 título · 2 subtítulo · 3 encabezado tabla · 4 celda texto
     5 celda número · 6 celda % · 7 celda $ · 8 fecha · 9 etiqueta campo
     10 valor campo · 11 total · 12 total % · 13 KPI grande · 14 nota
     15 banda fase · 16 celda calculada · 17 hipervínculo · 18 total $ */
  function stylesXml(){
    const font = (sz, b, color, name, i, u) =>
      '<font><sz val="' + sz + '"/>' + (b ? '<b/>' : '') + (i ? '<i/>' : '') + (u ? '<u/>' : '') +
      '<color rgb="' + color + '"/><name val="' + (name || 'Calibri') + '"/><family val="2"/></font>';
    const fill = rgb => rgb ? '<fill><patternFill patternType="solid"><fgColor rgb="' + rgb +
      '"/><bgColor indexed="64"/></patternFill></fill>' : '<fill><patternFill patternType="none"/></fill>';
    const bd = (c, st) => '<border><left style="' + st + '"><color rgb="' + c + '"/></left>' +
      '<right style="' + st + '"><color rgb="' + c + '"/></right>' +
      '<top style="' + st + '"><color rgb="' + c + '"/></top>' +
      '<bottom style="' + st + '"><color rgb="' + c + '"/></bottom><diagonal/></border>';

    const fonts = [
      font(11, 0, 'FF243B40'),                       // 0
      font(20, 1, 'FFFFFFFF', 'Calibri'),            // 1 título
      font(12, 1, 'FF0B5D6B'),                       // 2 subtítulo
      font(10, 1, 'FFFFFFFF'),                       // 3 encabezado
      font(11, 0, 'FF243B40'),                       // 4
      font(10, 1, 'FF4A666E'),                       // 5 etiqueta
      font(11, 1, 'FF0B5D6B'),                       // 6 valor
      font(11, 1, 'FF0B5D6B'),                       // 7 total
      font(22, 1, 'FF0B5D6B'),                       // 8 KPI
      font(10, 0, 'FF7C949B', null, 1),              // 9 nota cursiva
      font(11, 1, 'FFFFFFFF'),                       // 10 banda
      font(11, 0, 'FF12B3A6', null, 0, 1)            // 11 link
    ].join('');
    const fills = [fill(null), fill(null),
      fill('FF0B5D6B'),   // 2 primario
      fill('FF12B3A6'),   // 3 acento
      fill('FFE7EFF1'),   // 4 gris claro
      fill('FFF7FAFB'),   // 5 casi blanco
      fill('FFFFF4E0'),   // 6 ámbar suave
      fill('FF0A3F49')    // 7 primario oscuro
    ].join('');
    const borders = [
      '<border><left/><right/><top/><bottom/><diagonal/></border>',
      bd('FFB9CDD2', 'thin'),
      bd('FF0B5D6B', 'medium'),
      '<border><left style="thin"><color rgb="FFB9CDD2"/></left><right style="thin"><color rgb="FFB9CDD2"/></right>' +
      '<top style="thin"><color rgb="FFB9CDD2"/></top><bottom style="double"><color rgb="FF0B5D6B"/></bottom><diagonal/></border>'
    ].join('');

    const numFmts = '<numFmts count="4">' +
      '<numFmt numFmtId="164" formatCode="#,##0"/>' +
      '<numFmt numFmtId="165" formatCode="0.0%"/>' +
      '<numFmt numFmtId="166" formatCode="&quot;$&quot;\\ #,##0"/>' +
      '<numFmt numFmtId="167" formatCode="#,##0.00"/></numFmts>';

    /* xf(font, fill, border, numFmt, align, wrap) */
    const xf = (f, fl, b, nf, al, wr, ind) =>
      '<xf numFmtId="' + (nf || 0) + '" fontId="' + f + '" fillId="' + fl + '" borderId="' + b +
      '" applyFont="1" applyFill="1" applyBorder="1"' + (nf ? ' applyNumberFormat="1"' : '') +
      (al || wr ? ' applyAlignment="1"><alignment' + (al ? ' horizontal="' + al + '"' : '') +
        ' vertical="center"' + (wr ? ' wrapText="1"' : '') + (ind ? ' indent="' + ind + '"' : '') + '/></xf>'
      : '><alignment vertical="center"/></xf>');

    const xfs = [
      xf(0, 0, 0),                       // 0 normal
      xf(1, 2, 0, 0, 'left'),            // 1 título
      xf(2, 0, 0, 0, 'left'),            // 2 subtítulo
      xf(3, 3, 1, 0, 'center', 1),       // 3 encabezado tabla
      xf(4, 0, 1, 0, 'left', 1),         // 4 texto
      xf(4, 0, 1, 164, 'right'),         // 5 número
      xf(4, 0, 1, 165, 'right'),         // 6 porcentaje
      xf(4, 0, 1, 166, 'right'),         // 7 dinero
      xf(4, 0, 1, 14, 'center'),         // 8 fecha
      xf(5, 4, 1, 0, 'left'),            // 9 etiqueta
      xf(6, 5, 1, 0, 'left', 1),         // 10 valor
      xf(7, 4, 3, 164, 'right'),         // 11 total
      xf(7, 4, 3, 165, 'right'),         // 12 total %
      xf(8, 0, 0, 0, 'center'),          // 13 KPI
      xf(9, 0, 0, 0, 'left', 1),         // 14 nota
      xf(10, 7, 0, 0, 'left'),           // 15 banda fase
      xf(6, 5, 1, 167, 'right'),         // 16 calculada
      xf(11, 0, 0, 0, 'left'),           // 17 hipervínculo
      xf(7, 4, 3, 166, 'right'),         // 18 total $
      xf(4, 6, 1, 0, 'left', 1)          // 19 destacado ámbar
    ].join('');

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' + numFmts +
      '<fonts count="12">' + fonts + '</fonts>' +
      '<fills count="8">' + fills + '</fills>' +
      '<borders count="4">' + borders + '</borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="20">' + xfs + '</cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '<dxfs count="4">' +
        '<dxf><font><color rgb="FF0E5B32"/></font><fill><patternFill><bgColor rgb="FFC6EFCE"/></patternFill></fill></dxf>' +
        '<dxf><font><color rgb="FF9C5700"/></font><fill><patternFill><bgColor rgb="FFFFEB9C"/></patternFill></fill></dxf>' +
        '<dxf><font><color rgb="FF9C0006"/></font><fill><patternFill><bgColor rgb="FFFFC7CE"/></patternFill></fill></dxf>' +
        '<dxf><font><b/><color rgb="FF0B5D6B"/></font></dxf>' +
      '</dxfs>' +
      '<tableStyles count="0" defaultTableStyle="TableStyleMedium2"/></styleSheet>';
  }

  /* ------------------------------------------------------ hoja: builder */
  function Sheet(name){
    this.name = name;
    this.rows = {};        // r -> { c -> {v,s,f,t} }
    this.merges = [];
    this.cols = [];
    this.max = 0;
    this.maxc = 0;
    this.dv = [];
    this.cf = [];
    this.links = [];
    this.tables = [];
    this.freeze = null;
  }
  Sheet.prototype.set = function(r, c, v, s, f){
    if (!this.rows[r]) this.rows[r] = {};
    this.rows[r][c] = { v, s, f };
    if (r > this.max) this.max = r;
    if (c > this.maxc) this.maxc = c;
    return this;
  };
  Sheet.prototype.text  = function(r, c, v, s){ return this.set(r, c, v, s === undefined ? 4 : s); };
  Sheet.prototype.numb  = function(r, c, v, s){ return this.set(r, c, isNum(v) ? num(v) : null, s === undefined ? 5 : s); };
  Sheet.prototype.form  = function(r, c, f, s){ return this.set(r, c, null, s === undefined ? 16 : s, f); };
  Sheet.prototype.merge = function(a){ this.merges.push(a); return this; };
  Sheet.prototype.band  = function(r, c1, c2, t){
    this.set(r, c1, t, 15);
    for (let c = c1 + 1; c <= c2; c++) this.set(r, c, null, 15);
    this.merge(cn(c1) + r + ':' + cn(c2) + r);
    return this;
  };

  function sheetXml(sh){
    let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheetPr><outlinePr summaryBelow="1" summaryRight="1"/><pageSetUpPr fitToPage="1"/></sheetPr>' +
      '<dimension ref="A1:' + cn(Math.max(1, sh.maxc)) + Math.max(1, sh.max) + '"/>' +
      '<sheetViews><sheetView showGridLines="0"' + (sh.name === 'PORTADA' ? ' tabSelected="1"' : '') +
      ' workbookViewId="0">' +
      (sh.freeze ? '<pane ySplit="' + sh.freeze + '" topLeftCell="A' + (sh.freeze + 1) +
        '" activePane="bottomLeft" state="frozen"/>' : '') +
      '</sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="16.5" x14ac:dyDescent="0.25" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"/>';

    if (sh.cols.length){
      x += '<cols>' + sh.cols.map((w, i) => w ?
        '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>' : '').join('') + '</cols>';
    }

    x += '<sheetData>';
    Object.keys(sh.rows).map(Number).sort((a, b) => a - b).forEach(r => {
      const row = sh.rows[r];
      const cs = Object.keys(row).map(Number).sort((a, b) => a - b);
      x += '<row r="' + r + '">';
      cs.forEach(c => {
        const cell = row[c], ref = cn(c) + r;
        const st = cell.s ? ' s="' + cell.s + '"' : '';
        if (cell.f){ x += '<c r="' + ref + '"' + st + '><f>' + E(cell.f) + '</f></c>'; return; }
        const v = cell.v;
        if (v === null || v === undefined || v === ''){ x += '<c r="' + ref + '"' + st + '/>'; return; }
        if (typeof v === 'number' && isFinite(v)){ x += '<c r="' + ref + '"' + st + '><v>' + v + '</v></c>'; return; }
        if (v instanceof Date || (typeof v === 'object' && v.t === 'date')){
          const s = XL.serial(v.v !== undefined ? v.v : v);
          x += s === null ? '<c r="' + ref + '"' + st + '/>' : '<c r="' + ref + '"' + st + '><v>' + s + '</v></c>';
          return;
        }
        x += '<c r="' + ref + '"' + st + ' t="inlineStr"><is><t xml:space="preserve">' + E(v) + '</t></is></c>';
      });
      x += '</row>';
    });
    x += '</sheetData>';

    if (sh.merges.length)
      x += '<mergeCells count="' + sh.merges.length + '">' +
        sh.merges.map(m => '<mergeCell ref="' + m + '"/>').join('') + '</mergeCells>';

    sh.cf.forEach(c => { x += c; });

    if (sh.dv.length)
      x += '<dataValidations count="' + sh.dv.length + '">' + sh.dv.join('') + '</dataValidations>';

    if (sh.links.length)
      x += '<hyperlinks>' + sh.links.map(l =>
        '<hyperlink ref="' + l.ref + '" location="' + E(l.loc) + '" display="' + E(l.disp) + '"/>').join('') + '</hyperlinks>';

    x += '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>' +
         '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>';

    if (sh.tables.length)
      x += '<tableParts count="' + sh.tables.length + '">' +
        sh.tables.map(t => '<tablePart r:id="' + t.rid + '"/>').join('') + '</tableParts>';

    x += '</worksheet>';
    return x;
  }

  /* ------------------------------------------------- nombre de hoja legal */
  const used = {};
  function safeName(s){
    let n = String(s).replace(/[\[\]\*\?\/\\:]/g, '-').slice(0, 31).trim() || 'Hoja';
    let b = n, i = 2;
    while (used[n.toLowerCase()]) { n = (b.slice(0, 28) + ' ' + i).slice(0, 31); i++; }
    used[n.toLowerCase()] = 1;
    return n;
  }

  /* ==================================================== CONSTRUIR HOJAS */
  function buildToolSheet(t, ctx){
    const d = ST.d(t.id);
    const sh = new Sheet(safeName(t.title));
    sh.cols = [3, 30, 24, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
    let r = 2;

    // banda de título
    sh.set(r, 2, t.title, 1);
    for (let c = 3; c <= 12; c++) sh.set(r, c, null, 1);
    sh.merge('B' + r + ':L' + r);
    r++;
    sh.set(r, 2, MOD_BY_ID[t.mod].n + '. ' + t.mod + '  ·  hoja original: ' + t.sheet, 14);
    sh.merge('B' + r + ':L' + r);
    r += 2;
    sh.freeze = 3;

    (t.blocks || []).forEach(b => {
      try { r = writeBlock(sh, b, t, d, ctx, r); }
      catch(e){ console.warn('gen bloque', t.id, b.type, e); }
    });
    return sh;
  }

  function writeBlock(sh, b, t, d, ctx, r){
    switch (b.type){

      case 'fields': {
        if (b.title){ sh.band(r, 2, 12, b.title); r++; }
        const items = callv(b.items, d, ctx) || [];
        items.forEach(f => {
          if (f.when && !f.when(d, ctx)) return;
          let v = d[f.k];
          if (f.calc){ const x = f.calc(d, ctx); v = (typeof x === 'number' && !isFinite(x)) ? '' : x; }
          sh.text(r, 2, f.label, 9);
          const st = f.input === 'date' ? 8 : (f.fmt === 'money' ? 7 : (/^p\d/.test(f.fmt || '') ? 6 : (isNum(v) && f.input === 'number' ? 5 : 10)));
          if (f.input === 'date' && v) sh.set(r, 3, { t:'date', v }, 8);
          else if (isNum(v) && f.input !== 'text' && f.input !== 'textarea') sh.numb(r, 3, v, st);
          else sh.text(r, 3, v == null ? '' : String(v), 10);
          for (let c = 4; c <= 12; c++) sh.set(r, c, null, 10);
          sh.merge('C' + r + ':L' + r);
          r++;
        });
        return r + 1;
      }

      case 'grid': {
        if (b.title){ sh.band(r, 2, 12, b.title); r++; }
        const rows = arr(d[b.key]);
        const cols = callv(b.cols, d, ctx) || [];
        const hr = r;
        cols.forEach((c, i) => sh.text(hr, 2 + i, c.label.replace(/\n/g, ' '), 3));
        r++;
        const first = r;
        const list = rows.length ? rows : [{}];
        list.forEach((row, i) => {
          cols.forEach((c, ci) => {
            let v = c.calc ? c.calc(row, i, rows, d, ctx) : row[c.k];
            if (typeof v === 'number' && !isFinite(v)) v = '';
            const st = c.input === 'date' ? 8 :
                       (/^p\d/.test(c.fmt || '') ? 6 :
                       (c.fmt === 'money' ? 7 : (c.calc ? 16 : (isNum(v) && c.input === 'number' ? 5 : 4))));
            if (c.input === 'date' && v) sh.set(r, 2 + ci, { t:'date', v }, 8);
            else if (isNum(v) && (c.input === 'number' || c.calc)) sh.numb(r, 2 + ci, v, st);
            else sh.text(r, 2 + ci, v == null ? '' : String(v), st);
          });
          r++;
        });
        const last = r - 1;

        // totales con FÓRMULA VIVA
        if (b.foot){
          const fs = callv(b.foot, rows, d, ctx) || [];
          sh.text(r, 2, 'TOTAL', 11);
          cols.forEach((c, ci) => {
            if (ci === 0) return;
            const f = fs.find(x => x.k === c.k);
            if (f){
              const col = cn(2 + ci);
              const st = /^p\d/.test(f.fmt || '') ? 12 : (f.fmt === 'money' ? 18 : 11);
              sh.form(r, 2 + ci, 'SUM(' + col + first + ':' + col + last + ')', st);
            } else sh.set(r, 2 + ci, null, 11);
          });
          r++;
        }

        // validación de listas
        cols.forEach((c, ci) => {
          if (c.input === 'select'){
            const os = (callv(c.opts) || []).map(o => (o && o.v !== undefined) ? o.v : o);
            if (os.length && os.join(',').length < 250){
              sh.dv.push('<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" ' +
                'sqref="' + cn(2 + ci) + first + ':' + cn(2 + ci) + (last + 30) + '">' +
                '<formula1>"' + E(os.join(',')) + '"</formula1></dataValidation>');
            }
          }
          // barras de datos en columnas de prioridad/puntaje
          if (c.databar){
            sh.cf.push('<conditionalFormatting sqref="' + cn(2 + ci) + first + ':' + cn(2 + ci) + last + '">' +
              '<cfRule type="dataBar" priority="' + (sh.cf.length + 1) + '"><dataBar><cfvo type="min"/><cfvo type="max"/>' +
              '<color rgb="FF12B3A6"/></dataBar></cfRule></conditionalFormatting>');
          }
        });
        return r + 1;
      }

      case 'matrix': {
        if (b.title){ sh.band(r, 2, 12, b.title); r++; }
        const M = d[b.key] || {};
        const rws = callv(b.rows, d, ctx) || [], cls = callv(b.cols, d, ctx) || [];
        sh.text(r, 2, '', 3);
        cls.forEach((c, i) => sh.text(r, 3 + i, c.label, 3));
        r++;
        rws.forEach(rw => {
          const rk = rw.k !== undefined ? rw.k : rw, rl = rw.l !== undefined ? rw.l : rw;
          sh.text(r, 2, rl, 9);
          cls.forEach((c, i) => {
            const key = rk + '.' + c.k;
            let v = (b.calc && b.calc[key]) ? b.calc[key](M, d, ctx) : M[key];
            if (typeof v === 'number' && !isFinite(v)) v = '';
            if (isNum(v)) sh.numb(r, 3 + i, v, /^p\d/.test(c.fmt || '') ? 6 : (c.fmt === 'money' ? 7 : 5));
            else sh.text(r, 3 + i, v == null ? '' : String(v), 4);
          });
          r++;
        });
        return r + 1;
      }

      case 'a3': {
        if (b.title){ sh.band(r, 2, 12, b.title); r++; }
        const areas = callv(b.areas, d, ctx) || [];
        areas.forEach(a => {
          if (a.kind === 'ref') return;
          sh.text(r, 2, a.label, 9);
          sh.merge('B' + r + ':L' + r);
          r++;
          sh.text(r, 2, a.kind === 'image' ? (d[a.k] ? '[imagen adjunta en la app]' : '') : (d[a.k] || ''), 10);
          for (let c = 3; c <= 12; c++) sh.set(r, c, null, 10);
          sh.merge('B' + r + ':L' + r);
          r += 2;
        });
        return r;
      }

      case 'cards': {
        const items = callv(b.items, d, ctx) || [];
        if (!items.length) return r;
        if (b.title){ sh.band(r, 2, 12, b.title); r++; }
        items.forEach((k, i) => {
          sh.text(r, 2 + (i % 3) * 3, k.label, 9);
          sh.text(r + 1, 2 + (i % 3) * 3, String(k.value), 13);
          if (i % 3 === 2) r += 2;
        });
        return r + 3;
      }

      case 'upload':
        if (d[b.k]){ sh.text(r, 2, (b.label || 'Imagen') + ': adjunta en la aplicación', 14); return r + 2; }
        return r;

      case 'diagram': {
        if (b.title){ sh.band(r, 2, 12, b.title); r++; }
        const txt = diagramTexto(b.kind, d, b.key);
        String(txt || '(sin contenido)').split('\n').slice(0, 200).forEach(l => {
          sh.text(r, 2, l, 4); sh.merge('B' + r + ':L' + r); r++;
        });
        return r + 1;
      }

      case 'note': {
        const txt = callv(b.text, d, ctx);
        if (!txt) return r;
        sh.text(r, 2, String(txt).replace(/<[^>]+>/g, ''), 14);
        sh.merge('B' + r + ':L' + r);
        return r + 2;
      }

      case 'insight': {
        const list = (typeof ENGINE !== 'undefined') ? ENGINE.forTool(t, d, ctx) : [];
        if (!list || !list.length) return r;
        sh.band(r, 2, 12, 'INTERPRETACIÓN Y SUGERENCIA'); r++;
        list.forEach(i => {
          sh.text(r, 2, '[' + (i.sev || 'info').toUpperCase() + '] ' + String(i.text).replace(/<[^>]+>/g, ''), 19);
          sh.merge('B' + r + ':L' + r); r++;
        });
        return r + 1;
      }
    }
    return r;
  }

  /* ------------------------------------------------------------ PORTADA */
  function buildPortada(ctx){
    const p = ST.proj();
    const sh = new Sheet('PORTADA');
    sh.cols = [3, 26, 26, 26, 26, 26, 20, 20];
    sh.set(2, 2, 'LEAN SIX SIGMA · DMAIC', 1);
    for (let c = 3; c <= 7; c++) sh.set(2, c, null, 1);
    sh.merge('B2:G2');
    sh.set(3, 2, 'Herramienta de mejora continua · Rehavid', 2); sh.merge('B3:G3');
    let r = 6;
    [['Proyecto', p.nombre], ['Empresa atendida', p.empresa], ['ARL contratante', p.arl],
     ['Área o proceso', p.area], ['Líder del proyecto', p.lider], ['Fecha de inicio', p.creado],
     ['Última actualización', p.actualizado],
     ['Avance DMAIC', fmt(projProgress(), 'p1')],
     ['Módulos activos', ST.activeMods().map(m => m.name).join(', ')],
     ['Generado', new Date().toLocaleString('es-CO')]
    ].forEach(x => {
      sh.text(r, 2, x[0], 9);
      sh.text(r, 3, x[1] || '—', 10);
      for (let c = 4; c <= 7; c++) sh.set(r, c, null, 10);
      sh.merge('C' + r + ':G' + r);
      r++;
    });
    r++;
    sh.band(r, 2, 7, 'RESUMEN EJECUTIVO'); r++;
    const nar = (typeof ENGINE !== 'undefined') ? ENGINE.narrativa(ctx) : '';
    String(nar || 'Complete la información del proyecto para generar el resumen.')
      .split(/\n+/).forEach(l => { sh.text(r, 2, l, 14); sh.merge('B' + r + ':G' + r); r++; });
    r++;
    sh.text(r, 2, 'Presione ALT+F8 y ejecute «Rehavid_Panel» para abrir el panel de macros.', 19);
    sh.merge('B' + r + ':G' + r);
    return sh;
  }

  /* -------------------------------------------------------------- ÍNDICE */
  function buildIndice(sheetNames){
    const sh = new Sheet('INDICE');
    sh.cols = [3, 8, 44, 22, 14];
    sh.set(2, 2, 'ÍNDICE DE FORMATOS', 1);
    for (let c = 3; c <= 5; c++) sh.set(2, c, null, 1);
    sh.merge('B2:E2');
    let r = 4;
    sh.text(r, 2, '#', 3); sh.text(r, 3, 'FORMATO', 3); sh.text(r, 4, 'FASE', 3); sh.text(r, 5, 'ESTADO', 3);
    r++;
    sh.freeze = r - 1;
    let n = 0;
    sheetNames.forEach(x => {
      n++;
      sh.numb(r, 2, n, 5);
      sh.text(r, 3, x.title, 17);
      sh.links.push({ ref:'D' + r, loc:"'" + x.sheet + "'!A1", disp:x.title });
      sh.set(r, 3, x.title, 17);
      sh.text(r, 4, x.mod, 4);
      sh.text(r, 5, x.full ? 'Diligenciado' : 'Vacío', 4);
      sh.links[sh.links.length - 1].ref = 'C' + r;
      r++;
    });
    sh.cf.push('<conditionalFormatting sqref="E5:E' + (r - 1) + '">' +
      '<cfRule type="containsText" dxfId="0" priority="1" operator="containsText" text="Diligenciado">' +
      '<formula>NOT(ISERROR(SEARCH("Diligenciado",E5)))</formula></cfRule></conditionalFormatting>');
    return sh;
  }

  /* ------------------------------------------------------------ TABLERO */
  function buildBI(ctx){
    const sh = new Sheet('BI');
    sh.cols = [3, 34, 20, 20, 20, 20, 20, 20];
    sh.set(2, 2, 'TABLERO DE INDICADORES', 1);
    for (let c = 3; c <= 7; c++) sh.set(2, c, null, 1);
    sh.merge('B2:G2');
    let r = 4;

    const kpis = (typeof BI !== 'undefined' && BI.kpis) ? BI.kpis(ctx) : [];
    sh.band(r, 2, 7, 'INDICADORES CLAVE'); r++;
    sh.text(r, 2, 'INDICADOR', 3); sh.text(r, 3, 'VALOR', 3); sh.text(r, 4, 'LECTURA', 3);
    for (let c = 5; c <= 7; c++) sh.text(r, c, '', 3);
    r++;
    const kpiFirst = r;
    kpis.forEach(k => {
      sh.text(r, 2, k.label, 4);
      sh.text(r, 3, String(k.value), 10);
      sh.text(r, 4, k.hint || '', 4);
      for (let c = 5; c <= 7; c++) sh.set(r, c, null, 4);
      sh.merge('E' + r + ':G' + r);
      r++;
    });
    r++;

    /* --- indicadores CALCULADOS EN VIVO con las funciones VBA --- */
    sh.band(r, 2, 7, 'CÁLCULO EN VIVO (funciones de macro)'); r++;
    const dpmoTool = TOOL_BY_ID['medir.dpmo'];
    const dDpmo = dpmoTool ? ST.d(dpmoTool.id) : {};
    const rowsD = arr(dDpmo.rows);
    const unidades = sum(rowsD, 'unidades') || sum(rowsD, 'units') || 0;
    const defectos = rowsD.reduce((a, x) => a + sum([x], 'c1') + sum([x], 'c2') + sum([x], 'c3') + sum([x], 'c4'), 0);

    sh.text(r, 2, 'Unidades inspeccionadas', 9); sh.numb(r, 3, unidades, 5);
    sh.set(r, 4, null, 4); r++;
    sh.text(r, 2, 'Defectos totales', 9); sh.numb(r, 3, defectos, 5); r++;
    sh.text(r, 2, 'Oportunidades por unidad', 9); sh.numb(r, 3, 4, 5); r++;
    const rU = r - 3, rD = r - 2, rO = r - 1;
    sh.text(r, 2, 'DPMO', 9);
    sh.form(r, 3, 'IFERROR(REHAVID_DPMO(C' + rD + ',C' + rU + ',C' + rO + '),0)', 16);
    sh.text(r, 4, 'Defectos por millón de oportunidades', 14); r++;
    const rDp = r - 1;
    sh.text(r, 2, 'Nivel Sigma', 9);
    sh.form(r, 3, 'IFERROR(REHAVID_SIGMA(C' + rDp + '),0)', 16);
    sh.text(r, 4, 'Con corrimiento de 1,5σ', 14); r++;
    const rSg = r - 1;
    sh.text(r, 2, 'Interpretación', 9);
    sh.form(r, 3, 'IFERROR(REHAVID_INTERPRETA(C' + rSg + '),"")', 10);
    for (let c = 4; c <= 7; c++) sh.set(r, c, null, 10);
    sh.merge('C' + r + ':G' + r);
    r += 2;

    /* --- avance por fase --- */
    sh.band(r, 2, 7, 'AVANCE POR FASE'); r++;
    sh.text(r, 2, 'FASE', 3); sh.text(r, 3, 'FORMATOS', 3); sh.text(r, 4, 'DILIGENCIADOS', 3); sh.text(r, 5, 'AVANCE', 3);
    for (let c = 6; c <= 7; c++) sh.text(r, c, '', 3);
    r++;
    const fFirst = r;
    MODULES.forEach(m => {
      const ts = toolsOf(m.id);
      sh.text(r, 2, m.n + '. ' + m.name, 4);
      sh.numb(r, 3, ts.length, 5);
      sh.numb(r, 4, ts.filter(t => toolFilled(t)).length, 5);
      sh.form(r, 5, 'IFERROR(D' + r + '/C' + r + ',0)', 6);
      r++;
    });
    const fLast = r - 1;
    sh.text(r, 2, 'TOTAL DMAIC', 11);
    sh.form(r, 3, 'SUM(C' + fFirst + ':C' + fLast + ')', 11);
    sh.form(r, 4, 'SUM(D' + fFirst + ':D' + fLast + ')', 11);
    sh.form(r, 5, 'IFERROR(D' + r + '/C' + r + ',0)', 12);
    // semáforo sobre el rango de avance
    sh.cf.push('<conditionalFormatting sqref="E' + fFirst + ':E' + r + '">' +
      '<cfRule type="cellIs" dxfId="0" priority="1" operator="greaterThanOrEqual"><formula>0.9</formula></cfRule>' +
      '<cfRule type="cellIs" dxfId="1" priority="2" operator="greaterThanOrEqual"><formula>0.6</formula></cfRule>' +
      '<cfRule type="cellIs" dxfId="2" priority="3" operator="lessThan"><formula>0.6</formula></cfRule>' +
      '</conditionalFormatting>');
    sh._semaforo = 'E' + fFirst + ':E' + r;
    r += 2;

    /* --- riesgos y decisiones --- */
    const g = (typeof ENGINE !== 'undefined') ? ENGINE.global(ctx) : null;
    if (g){
      sh.band(r, 2, 7, 'HALLAZGOS Y DECISIONES SUGERIDAS'); r++;
      arr(g.decisiones).concat(arr(g.riesgos)).slice(0, 40).forEach(x => {
        const txt = typeof x === 'string' ? x : (x.text || '');
        const sev = (x && x.sev) || 'baja';
        sh.text(r, 2, '[' + sev.toUpperCase() + '] ' + String(txt).replace(/<[^>]+>/g, ''), 19);
        sh.merge('B' + r + ':G' + r);
        r++;
      });
    }
    return sh;
  }

  /* ================================================== ARMAR EL LIBRO */
  async function exportConsolidado(conMacros){
    const ctx = ST.ctx(), proj = ST.proj();
    for (const k in used) delete used[k];

    const sheets = [];
    sheets.push(buildPortada(ctx));
    const idx = new Sheet('INDICE'); // se llena luego
    sheets.push(idx);
    sheets.push(buildBI(ctx));

    const meta = [];
    ST.activeMods().forEach(m => {
      toolsOf(m.id).forEach(t => {
        const sh = buildToolSheet(t, ctx);
        sheets.push(sh);
        meta.push({ sheet: sh.name, title: t.title, mod: m.name, full: toolFilled(t) });
      });
    });
    // reconstruye el índice ya con los nombres finales
    used['indice'] = 1;
    const realIdx = buildIndice(meta);
    realIdx.name = 'INDICE';
    sheets[1] = realIdx;

    /* ---- ensamblar el paquete ---- */
    const files = {};
    const ext = conMacros ? 'xlsm' : 'xlsx';
    const mainType = conMacros
      ? 'application/vnd.ms-excel.sheet.macroEnabled.main+xml'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml';

    let ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      (conMacros ? '<Default Extension="bin" ContentType="application/vnd.ms-office.vbaProject"/>' : '') +
      '<Override PartName="/xl/workbook.xml" ContentType="' + mainType + '"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>';
    sheets.forEach((s, i) => {
      ct += '<Override PartName="/xl/worksheets/sheet' + (i + 1) +
        '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
    });
    ct += '</Types>';
    files['[Content_Types].xml'] = ct;

    files['_rels/.rels'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
      '</Relationships>';

    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    files['docProps/core.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
      'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
      'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>' + E(proj.nombre) + '</dc:title>' +
      '<dc:subject>Lean Six Sigma DMAIC</dc:subject>' +
      '<dc:creator>Rehavid</dc:creator><cp:lastModifiedBy>Rehavid LSS DMAIC</cp:lastModifiedBy>' +
      '<dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created>' +
      '<dcterms:modified xsi:type="dcterms:W3CDTF">' + now + '</dcterms:modified>' +
      '<cp:category>Mejora continua</cp:category></cp:coreProperties>';
    files['docProps/app.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" ' +
      'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
      '<Application>Rehavid LSS DMAIC</Application><Company>Rehavid</Company></Properties>';

    let wbRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
    let wbSheets = '';
    sheets.forEach((s, i) => {
      const rid = 'rId' + (i + 1);
      wbRels += '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>';
      wbSheets += '<sheet name="' + E(s.name) + '" sheetId="' + (i + 1) + '" r:id="' + rid + '"/>';
      files['xl/worksheets/sheet' + (i + 1) + '.xml'] = sheetXml(s);
    });
    const nStyle = sheets.length + 1;
    wbRels += '<Relationship Id="rId' + nStyle + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>';
    if (conMacros)
      wbRels += '<Relationship Id="rIdVBA" Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="vbaProject.bin"/>';
    wbRels += '</Relationships>';
    files['xl/_rels/workbook.xml.rels'] = wbRels;
    files['xl/styles.xml'] = stylesXml();

    // nombre definido para el semáforo que usa la macro
    const bi = sheets[2];
    const defNames = '<definedNames>' +
      (bi && bi._semaforo ? '<definedName name="SEMAFORO_BI">BI!$' +
        bi._semaforo.replace(/(\w)(\d+):(\w)(\d+)/, '$1$$$2:$$$3$$$4') + '</definedName>' : '') +
      '</definedNames>';

    files['xl/workbook.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<fileVersion appName="xl" lastEdited="7" lowestEdited="7"/>' +
      '<workbookPr' + (conMacros ? ' codeName="ThisWorkbook"' : '') + ' defaultThemeVersion="166925"/>' +
      '<bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="14000"/></bookViews>' +
      '<sheets>' + wbSheets + '</sheets>' + defNames +
      '<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>';

    if (conMacros) files['xl/vbaProject.bin'] = b64ToBytes(VBA_B64);

    const bytes = await ZIP.write(files);
    const name = XL.sanitize(proj.nombre) + ' - DMAIC TODO EN UNO.' + ext;
    download(new Blob([bytes], { type: conMacros
      ? 'application/vnd.ms-excel.sheet.macroEnabled.12'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), name);
    return { hojas: sheets.length, nombre: name };
  }

  /* ------------------------------------------------------------ CSV */
  async function exportCSV(){
    const ctx = ST.ctx(), proj = ST.proj(), pack = {};
    const q = v => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    ST.activeMods().forEach(m => {
      toolsOf(m.id).forEach(t => {
        const d = ST.d(t.id);
        (t.blocks || []).forEach(b => {
          if (b.type !== 'grid') return;
          const rows = arr(d[b.key]); if (!rows.length) return;
          const cols = callv(b.cols, d, ctx) || [];
          let csv = '﻿' + cols.map(c => q(c.label.replace(/\n/g, ' '))).join(';') + '\r\n';
          rows.forEach((r, i) => {
            csv += cols.map(c => {
              let v = c.calc ? c.calc(r, i, rows, d, ctx) : r[c.k];
              if (typeof v === 'number' && !isFinite(v)) v = '';
              return q(v);
            }).join(';') + '\r\n';
          });
          pack[XL.sanitize(m.name + ' - ' + t.title + (b.title ? ' - ' + b.title : '')) + '.csv'] = ZIP.enc(csv);
        });
      });
    });
    if (!Object.keys(pack).length){ toast('No hay tablas con datos para exportar', 'warn'); return 0; }
    const z = await ZIP.write(pack);
    download(new Blob([z], { type:'application/zip' }), XL.sanitize(proj.nombre) + ' - datos CSV.zip');
    return Object.keys(pack).length;
  }

  return { exportConsolidado, exportCSV, Sheet, sheetXml, stylesXml, safeName };
})();
