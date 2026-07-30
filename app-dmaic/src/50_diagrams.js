/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   50_diagrams.js — LIENZOS INTERACTIVOS DE LOS DIAGRAMAS DEL MÉTODO
   ---------------------------------------------------------------------------
   Un solo motor dibuja los ocho diagramas en SVG puro (sin librerías, sin CDN,
   sin canvas obligatorio) en DOS MODOS con la MISMA geometría:

     · modo 'ui'    → el diagrama es editable: los textos son <input>/<textarea>
                      dentro de <foreignObject> y hay botones ＋ / ✕ por nodo.
     · modo 'print' → el mismo dibujo con <text> plano, colores fijos y fondo
                      blanco: es el que se exporta a PNG y se incrusta en Excel.

   API PÚBLICA
   -----------
     DIAG.render(b, t, d, ctx) -> string HTML   (bloque {type:'diagram', ...})
     DIAG.svg(kind, d, key, opts) -> string SVG puro (export PNG / Excel)
     DIAG.bind(root) -> void                    (engancha eventos, una sola vez)
     DIAG.set(toolId, key, ruta, valor) -> void (escribe en el modelo + ST.touch)
     DIAG.setPath('toolId|key|ruta', valor)     (lo usa 90_app.js con data-diag)
     DIAG.toText(kind, d, key) -> string        (volcado indentado para Excel)

   DE DÓNDE SALEN LOS DATOS
   ------------------------
   1) Si el bloque declara `grid`/`textField`/... (o si la herramienta tiene una
      tabla con las columnas del diagrama), el lienzo EDITA ESA TABLA: cada caja
      lleva  data-dgt="<toolId>" data-dgg="<grid>" data-dgr="<fila>" data-dgc="<col>"
      y los campos sueltos  data-dgt="<toolId>" data-dgf="<clave>".
      Así el diagrama y la tabla son SIEMPRE el mismo dato.
   2) Si no hay tabla, el diagrama guarda su propio estado en d[b.key] y las
      cajas llevan  data-diag="<toolId>|<key>|<ruta>"  (DIAG.setPath / DIAG.set).

   Los botones usan  data-dga="<op>|<arg>|<arg>…"  (argumentos URI-encoded);
   las operaciones que empiezan por «!» piden confirmación antes de ejecutarse.
   Ops: gadd · gins · gdel · gset (tabla) · dset · dsetj · dpush · ddel · dmove (propio).
   Todo cambio llama ST.touch(): el autosave global sigue siendo el mismo.
   ========================================================================== */
'use strict';

const DIAG = (function(){

  /* ======================================================================
     0 · UTILIDADES
     ==================================================================== */
  const T2  = v => String(v === null || v === undefined ? '' : v).trim();
  const UP  = v => T2(v).toUpperCase();
  const A   = v => (Array.isArray(v) ? v : []);
  const n1  = v => { const x = Math.round(Number(v) * 10) / 10; return isFinite(x) ? x : 0; };
  const cap = (v, a, b) => Math.min(b, Math.max(a, v));
  let SEQ = 0;

  function safe(fn, dflt){
    try { return fn(); } catch(e){ console.warn('DIAG', e); return dflt; }
  }
  function jparse(s, dflt){
    try { const v = JSON.parse(s); return v === undefined ? dflt : v; } catch(e){ return dflt; }
  }
  const q = v => String(v === null || v === undefined ? '' : v).replace(/"/g, '\\"');

  /* ---- rutas dentro del modelo propio (d[key]) ------------------------- */
  function getIn(o, path){
    const ps = String(path === undefined || path === null ? '' : path).split('.').filter(s => s !== '');
    let cur = o;
    for (let i = 0; i < ps.length; i++){
      if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
      cur = cur[ps[i]];
    }
    return cur;
  }
  function setIn(o, path, v){
    const ps = String(path === undefined || path === null ? '' : path).split('.').filter(s => s !== '');
    if (!ps.length || !o || typeof o !== 'object') return;
    let cur = o;
    for (let i = 0; i < ps.length - 1; i++){
      const k = ps[i], isIdx = /^\d+$/.test(ps[i + 1]);
      if (cur[k] === null || cur[k] === undefined || typeof cur[k] !== 'object') cur[k] = isIdx ? [] : {};
      cur = cur[k];
    }
    cur[ps[ps.length - 1]] = v;
  }
  function arrIn(o, path){
    let v = getIn(o, path);
    if (!Array.isArray(v)){ v = []; setIn(o, path, v); }
    return v;
  }

  /* ---- contexto / catálogo -------------------------------------------- */
  function ctxOf(){
    return (typeof ST !== 'undefined' && ST.ctx) ? ST.ctx() : { proj:null, all:{}, cfg:{} };
  }
  function dataOf(toolId){
    return (typeof ST !== 'undefined' && ST.d) ? ST.d(toolId) : {};
  }
  /** Localiza el bloque de diagrama (kind,key) dentro del catálogo de TOOLS */
  function findBlock(kind, key){
    if (typeof TOOLS === 'undefined') return null;
    let loose = null;
    for (let i = 0; i < TOOLS.length; i++){
      const t = TOOLS[i], bs = A(t.blocks);
      for (let j = 0; j < bs.length; j++){
        const b = bs[j];
        if (b.type !== 'diagram' || b.kind !== kind) continue;
        if (key && (b.key || b.kind) === key) return { t:t, b:b };
        if (!loose) loose = { t:t, b:b };
      }
    }
    return key ? null : loose;
  }
  function gridBlock(t, key){
    if (!t || !key) return null;
    return A(t.blocks).find(b => b.type === 'grid' && b.key === key) || null;
  }
  function colsOf(b, d, ctx){
    if (!b) return [];
    return (typeof b.cols === 'function' ? safe(() => b.cols(d, ctx), []) : b.cols) || [];
  }
  /** Busca en la herramienta la tabla que tiene las columnas que pide el diagrama.
   *  need = { rol: /regex/ }  (se resuelven EN ORDEN y sin repetir columna). */
  function findGrid(t, need, d, ctx){
    if (!t) return null;
    const roles = Object.keys(need);
    let best = null;
    A(t.blocks).forEach(b => {
      if (b.type !== 'grid') return;
      const cols = colsOf(b, d, ctx), map = {}, taken = {};
      let ok = 0;
      roles.forEach(rol => {
        const c = cols.find(x => x && x.k && !taken[x.k] && need[rol].test(x.k));
        if (c){ map[rol] = c.k; taken[c.k] = 1; ok++; }
      });
      if (ok === roles.length && !best) best = { key:b.key, map:map, cols:cols, block:b };
    });
    return best;
  }
  /** Primer campo suelto de la herramienta cuya clave case con el patrón */
  function findField(t, re, d, ctx){
    if (!t) return '';
    let out = '';
    A(t.blocks).forEach(b => {
      if (out || b.type !== 'fields') return;
      const items = (typeof b.items === 'function' ? safe(() => b.items(d, ctx), []) : b.items) || [];
      const it = items.find(x => x && x.k && !x.calc && !x.ro && re.test(x.k));
      if (it) out = it.k;
    });
    return out;
  }
  function rowsFor(d, key){
    if (typeof rowsOf === 'function') return rowsOf(d, key, 0);
    if (!Array.isArray(d[key])) d[key] = [];
    return d[key];
  }
  function gridMax(toolId, key){
    const t = (typeof TOOL_BY_ID !== 'undefined') ? TOOL_BY_ID[toolId] : null;
    const b = gridBlock(t, key);
    return (b && b.max) || 400;
  }
  function rowEmpty(r, cols){
    if (!r) return true;
    const ks = cols && cols.length ? cols : Object.keys(r);
    return !ks.some(k => k !== '_id' && T2(r[k]) !== '');
  }

  /* ======================================================================
     1 · ENLACES (bindings) Y ACCIONES
     ==================================================================== */
  const bF = (t, f, re) => ' data-dgt="' + esc(t) + '" data-dgf="' + esc(f) + '"' + (re ? ' data-dgre="1"' : '');
  const bG = (t, g, r, c, re) => ' data-dgt="' + esc(t) + '" data-dgg="' + esc(g) + '" data-dgr="' + r +
                                 '" data-dgc="' + esc(c) + '"' + (re ? ' data-dgre="1"' : '');
  const bD = (t, k, p, re) => ' data-diag="' + esc(t + '|' + k + '|' + p) + '"' + (re ? ' data-dgre="1"' : '');

  function act(op, args){
    const s = [op].concat(A(args).map(a => encodeURIComponent(a === null || a === undefined ? '' : String(a)))).join('|');
    return ' data-dga="' + esc(s) + '"';
  }

  /** Ejecuta la acción de un botón del lienzo.
   *  Un «!» delante de la operación pide confirmación (acciones destructivas). */
  function run(raw){
    const p = String(raw || '').split('|');
    let op = p[0];
    if (op.charAt(0) === '!'){
      const resto = p.slice(0); resto[0] = op.slice(1);
      const seguir = () => run(resto.join('|'));
      if (typeof confirmar === 'function')
        confirmar('Esta acción reemplaza lo que ya está escrito en el diagrama. ¿Continuar?', seguir, true);
      else seguir();
      return;
    }
    const a = p.slice(1).map(s => { try { return decodeURIComponent(s); } catch(e){ return s; } });
    const tid = a[0];
    if (!tid || typeof ST === 'undefined') return;
    const d = ST.d(tid);

    if (op === 'gadd' || op === 'gins'){
      const key = a[1];
      const rows = rowsFor(d, key);
      const preset = jparse(op === 'gadd' ? a[2] : a[3], {}) || {};
      const t = (typeof TOOL_BY_ID !== 'undefined') ? TOOL_BY_ID[tid] : null;
      const cols = colsOf(gridBlock(t, key), d, ctxOf()).map(c => c.k);
      const nueva = Object.assign({ _id: (typeof uid === 'function' ? uid() : 'x' + (++SEQ)) }, preset);
      if (op === 'gins'){
        rows.splice(cap(Math.round(num(a[2])), 0, rows.length), 0, nueva);
      } else {
        const libre = rows.findIndex(r => rowEmpty(r, cols));
        if (libre >= 0) Object.assign(rows[libre], preset);
        else if (rows.length < gridMax(tid, key)) rows.push(nueva);
      }
    }
    else if (op === 'gdel'){
      const rows = rowsFor(d, a[1]);
      const i = Math.round(num(a[2])), c = Math.max(1, Math.round(num(a[3]) || 1));
      if (i >= 0 && i < rows.length) rows.splice(i, c);
      const t = (typeof TOOL_BY_ID !== 'undefined') ? TOOL_BY_ID[tid] : null;
      const gb = gridBlock(t, a[1]);
      if (gb && gb.min && typeof rowsOf === 'function') rowsOf(d, a[1], gb.min);
    }
    else if (op === 'gset'){
      const rows = rowsFor(d, a[1]), i = Math.round(num(a[2]));
      if (rows[i]) rows[i][a[3]] = a[4];
    }
    else if (op === 'dset'){
      if (!d[a[1]] || typeof d[a[1]] !== 'object') d[a[1]] = {};
      setIn(d[a[1]], a[2], a[3]);
    }
    else if (op === 'dsetj'){
      if (!d[a[1]] || typeof d[a[1]] !== 'object') d[a[1]] = {};
      setIn(d[a[1]], a[2], jparse(a[3], ''));
    }
    else if (op === 'dpush'){
      if (!d[a[1]] || typeof d[a[1]] !== 'object') d[a[1]] = {};
      const list = arrIn(d[a[1]], a[2]);
      if (list.length < 400) list.push(jparse(a[3], ''));
    }
    else if (op === 'ddel'){
      if (!d[a[1]] || typeof d[a[1]] !== 'object') return;
      const list = arrIn(d[a[1]], a[2]), i = Math.round(num(a[3]));
      if (i >= 0 && i < list.length) list.splice(i, 1);
    }
    else if (op === 'dmove'){
      if (!d[a[1]] || typeof d[a[1]] !== 'object') return;
      const list = arrIn(d[a[1]], a[2]);
      const i = Math.round(num(a[3])), j = cap(i + Math.round(num(a[4])), 0, list.length - 1);
      if (i >= 0 && i < list.length && j !== i){ const x = list.splice(i, 1)[0]; list.splice(j, 0, x); }
    }
    else return;

    ST.touch();
    repaint();
  }

  function repaint(){
    if (typeof UI === 'undefined') return;
    if (UI.renderView) UI.renderView();
    if (UI.renderNav) UI.renderNav();
  }

  /* ======================================================================
     2 · PALETAS Y PRIMITIVAS SVG
     ==================================================================== */
  const PAL_UI = {
    mode:'ui',  paper:'transparent', box:'var(--d2)', box2:'var(--d3)', bd:'var(--bd)',
    line:'var(--tx3)', tx:'var(--tx)', tx2:'var(--tx2)', tx3:'var(--tx3)',
    p1:'#0B5D6B', p2:'#12B3A6', p3:'#F5A623', p4:'#0A3F49',
    ok:'#2FBF71', warn:'#F5A623', bad:'#E5484D', inv:'#FFFFFF', band:'rgba(18,179,166,.07)'
  };
  const PAL_PR = {
    mode:'print', paper:'#FFFFFF', box:'#F7FAFB', box2:'#EDF4F6', bd:'#A9C3C9',
    line:'#7C949B', tx:'#0E2229', tx2:'#41616A', tx3:'#7C949B',
    p1:'#0B5D6B', p2:'#12B3A6', p3:'#F5A623', p4:'#0A3F49',
    ok:'#2FBF71', warn:'#F5A623', bad:'#E5484D', inv:'#FFFFFF', band:'#F2F8F9'
  };
  const SIPOC_COL = ['#0A3F49', '#0B5D6B', '#12B3A6', '#0E8E86', '#F5A623'];
  const CAT_COL   = ['#0B5D6B', '#12B3A6', '#F5A623', '#7C5CBF', '#E5854D', '#2FBF71',
                     '#3B9EFF', '#0A3F49', '#C77B12', '#12897F'];

  function theme(mode){
    const T = Object.create(mode === 'print' ? PAL_PR : PAL_UI);
    SEQ++;
    T.ar  = 'dgar' + SEQ;
    T.ar2 = 'dgab' + SEQ;
    return T;
  }
  function sty(o){
    const p = [];
    if (o.fill)   p.push('fill:' + o.fill);
    if (o.stroke) p.push('stroke:' + o.stroke);
    if (o.sw !== undefined && o.sw !== null) p.push('stroke-width:' + o.sw);
    if (o.dash)   p.push('stroke-dasharray:' + o.dash);
    if (o.op !== undefined && o.op !== null) p.push('opacity:' + o.op);
    if (o.fs)     p.push('font-size:' + o.fs + 'px');
    if (o.fw)     p.push('font-weight:' + o.fw);
    if (o.ls)     p.push('letter-spacing:' + o.ls + 'px');
    if (o.cap)    p.push('stroke-linecap:' + o.cap);
    if (o.join)   p.push('stroke-linejoin:' + o.join);
    if (o.extra)  p.push(o.extra);
    return ' style="' + p.join(';') + '"';
  }
  const rect = (x, y, w, h, r, o) =>
    '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(Math.max(0, w)) + '" height="' + n1(Math.max(0, h)) +
    '" rx="' + n1(r || 0) + '"' + sty(o || {}) + '/>';
  const line = (x1, y1, x2, y2, o) =>
    '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '"' + sty(o || {}) + '/>';
  const path = (dd, o) => '<path d="' + dd + '"' + sty(o || {}) + '/>';
  const poly = (pts, o) =>
    '<polygon points="' + pts.map(p => n1(p[0]) + ',' + n1(p[1])).join(' ') + '"' + sty(o || {}) + '/>';
  const circ = (cx, cy, r, o) =>
    '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(r) + '"' + sty(o || {}) + '/>';

  /** flecha recta con punta */
  function arrow(T, x1, y1, x2, y2, o){
    const s = Object.assign({ stroke:T.line, sw:1.4, fill:'none', cap:'round' }, o || {});
    return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) +
      '" marker-end="url(#' + (s.accent ? T.ar2 : T.ar) + ')"' + sty(s) + '/>';
  }
  /** flecha en codo ortogonal (de un lado derecho a un lado izquierdo) */
  function elbow(T, x1, y1, x2, y2, o){
    const mx = (x1 + x2) / 2;
    const dd = 'M' + n1(x1) + ',' + n1(y1) + ' H' + n1(mx) + ' V' + n1(y2) + ' H' + n1(x2);
    const s = Object.assign({ stroke:T.line, sw:1.3, fill:'none', join:'round' }, o || {});
    return '<path d="' + dd + '" marker-end="url(#' + (s.accent ? T.ar2 : T.ar) + ')"' + sty(s) + '/>';
  }

  function defs(T){
    const mk = (id, col) =>
      '<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">' +
      '<path d="M0,0 L10,5 L0,10 z" style="fill:' + col + '"/></marker>';
    return '<defs>' + mk(T.ar, T.line) + mk(T.ar2, T.p2) + '</defs>';
  }

  /* ---- texto plano con ajuste de línea (modo print y textos fijos) ----- */
  function wrapLines(s, w, fs, maxLines){
    const words = T2(s).split(/\s+/).filter(Boolean);
    const cpl = Math.max(6, Math.floor(w / (fs * 0.545)));
    const out = [];
    let cur = '';
    words.forEach(wd => {
      let word = wd;
      while (word.length > cpl){
        if (cur){ out.push(cur); cur = ''; }
        out.push(word.slice(0, cpl - 1) + '-');
        word = word.slice(cpl - 1);
      }
      if (!cur) cur = word;
      else if ((cur + ' ' + word).length <= cpl) cur += ' ' + word;
      else { out.push(cur); cur = word; }
    });
    if (cur) out.push(cur);
    if (maxLines && out.length > maxLines){
      const t = out.slice(0, maxLines);
      t[maxLines - 1] = T2(t[maxLines - 1]).slice(0, Math.max(1, cpl - 1)) + '…';
      return t;
    }
    return out;
  }
  function textBox(x, y, w, h, s, o){
    o = o || {};
    const fs = o.fs || 12, lh = o.lh || fs * 1.24;
    if (T2(s) === '') return '';
    const maxL = Math.max(1, Math.floor((h - 2) / lh));
    const lines = wrapLines(s, w - 4, fs, maxL);
    if (!lines.length) return '';
    const al = o.align || 'left';
    const anchor = al === 'center' ? 'middle' : al === 'right' ? 'end' : 'start';
    const tx = al === 'center' ? x + w / 2 : al === 'right' ? x + w - 2 : x + 2;
    const y0 = y + h / 2 - (lines.length - 1) * lh / 2 + fs * 0.35;
    return '<text x="' + n1(tx) + '" y="' + n1(y0) + '" text-anchor="' + anchor + '"' +
      sty({ fill:o.color || '#0E2229', fs:fs, fw:o.fw || 600, ls:o.ls }) + '>' +
      lines.map((l, i) => '<tspan x="' + n1(tx) + '"' + (i ? ' dy="' + n1(lh) + '"' : '') + '>' + esc(l) + '</tspan>').join('') +
      '</text>';
  }
  /** alto que necesita una caja para mostrar el texto completo (hasta maxL líneas) */
  function boxH(s, w, fs, min, maxL, pad){
    const l = Math.min(maxL || 3, Math.max(1, wrapLines(s, w, fs, 0).length));
    return Math.max(min, Math.round(l * fs * 1.24 + (pad === undefined ? 12 : pad)));
  }
  /** rótulo de una sola línea */
  function label(x, y, s, o){
    o = o || {};
    if (T2(s) === '') return '';
    const al = o.align || 'left';
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" text-anchor="' +
      (al === 'center' ? 'middle' : al === 'right' ? 'end' : 'start') + '"' +
      sty({ fill:o.color || '#41616A', fs:o.fs || 10, fw:o.fw || 800, ls:o.ls }) + '>' + esc(s) + '</text>';
  }

  /* ---- campo editable (foreignObject) o texto plano ------------------- */
  function fo(x, y, w, h, inner, extra){
    return '<foreignObject x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(Math.max(1, w)) +
      '" height="' + n1(Math.max(1, h)) + '">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;' +
      'justify-content:' + ((extra && extra.jc) || 'flex-start') + ';overflow:hidden;box-sizing:border-box;' +
      'padding:' + ((extra && extra.pad) !== undefined ? extra.pad : '0 4px') + '">' + inner + '</div></foreignObject>';
  }
  function field(T, x, y, w, h, o){
    o = o || {};
    const v = T2(o.v);
    if (T.mode !== 'ui' || !o.bind){
      if (o.sel && v === '') return '';
      return textBox(x, y, w, h, v, o);
    }
    const fs = o.fs || 12;
    const base = 'width:100%;height:100%;box-sizing:border-box;border:0;background:transparent;outline:none;' +
      'font-family:inherit;font-size:' + fs + 'px;font-weight:' + (o.fw || 600) + ';' +
      'color:' + (o.color || 'var(--tx)') + ';text-align:' +
      (o.align === 'center' ? 'center' : o.align === 'right' ? 'right' : 'left') +
      ';padding:0;margin:0;line-height:1.25;letter-spacing:' + (o.ls ? o.ls + 'px' : 'normal') + ';';
    let el;
    if (o.sel){
      const opts = A(o.sel).map(op => {
        const ov = (op && op.v !== undefined) ? op.v : op;
        const ol = (op && op.l !== undefined) ? op.l : op;
        return '<option value="' + esc(ov) + '"' + (T2(ov) === v ? ' selected="selected"' : '') + '>' + esc(ol) + '</option>';
      }).join('');
      el = '<select style="' + base + 'cursor:pointer" ' + (o.title ? 'title="' + esc(o.title) + '" ' : '') + o.bind + '>' +
        (o.noEmpty ? '' : '<option value=""></option>') + opts + '</select>';
    } else if (o.ml){
      el = '<textarea style="' + base + 'resize:none;overflow:auto" placeholder="' + esc(o.ph || '') + '"' +
        o.bind + '>' + esc(v) + '</textarea>';
    } else {
      el = '<input type="text" style="' + base + '" placeholder="' + esc(o.ph || '') + '" value="' + esc(v) + '"' +
        o.bind + '/>';
    }
    return fo(x, y, w, h, el, { jc: o.align === 'center' ? 'center' : 'flex-start', pad: o.pad });
  }

  /** botón redondo del lienzo (solo modo ui) */
  function btn(T, x, y, s, glyph, action, title, tone){
    if (T.mode !== 'ui' || !action) return '';
    const col = tone === 'bad' ? 'var(--bad)' : tone === 'ok' ? 'var(--br-2)'
              : tone === 'inv' ? '#FFFFFF' : 'var(--tx2)';
    const bg  = tone === 'inv' ? 'rgba(255,255,255,.18)' : 'var(--d3)';
    const bd  = tone === 'inv' ? 'rgba(255,255,255,.45)' : 'var(--bd)';
    const inner = '<button type="button"' + (title ? ' title="' + esc(title) + '"' : '') + action +
      ' style="width:100%;height:100%;border-radius:50%;border:1px solid ' + bd + ';background:' + bg +
      ';color:' + col + ';font-size:' + Math.round(s * 0.6) + 'px;line-height:1;cursor:pointer;display:flex;' +
      'align-items:center;justify-content:center;padding:0;font-weight:700">' + esc(glyph) + '</button>';
    return fo(x, y, s, s, inner, { jc:'center', pad:'0' });
  }

  function svgWrap(T, w, h, body){
    const W = Math.max(120, Math.round(w)), H = Math.max(120, Math.round(h));
    const head = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W +
      '" height="' + H + '" data-w="' + W + '"';
    const st = T.mode === 'ui'
      ? ' class="dgsvg" style="max-width:100%;height:auto;font-family:var(--ff);display:block"'
      : ' style="font-family:\'Segoe UI\',Arial,Helvetica,sans-serif;display:block"';
    return head + st + '>' + defs(T) +
      (T.mode === 'print' ? rect(0, 0, W, H, 0, { fill:T.paper }) : '') + body + '</svg>';
  }

  /* ======================================================================
     3 · MODELOS  (normalizan tabla / campos / estado propio)
     ==================================================================== */
  const M6_DEF = [
    { l:'Mediciones', pos:'top' }, { l:'Materiales', pos:'top' }, { l:'Mano de Obra', pos:'top' },
    { l:'Medio Ambiente', pos:'bottom' }, { l:'Métodos', pos:'bottom' }, { l:'Maquinaria', pos:'bottom' }
  ];
  const P4_DEF = [
    { l:'Politicas', pos:'top' }, { l:'Personal', pos:'top' },
    { l:'Procedimientos', pos:'bottom' }, { l:'Instalaciones', pos:'bottom' }
  ];
  const SIM = [
    { k:'proceso',   l:'Proceso' },
    { k:'decision',  l:'Decisión' },
    { k:'documento', l:'Documento' },
    { k:'inicio',    l:'Inicio / Fin' },
    { k:'espera',    l:'Espera' },
    { k:'datos',     l:'Datos' },
    { k:'conector',  l:'Conector' }
  ];
  const SIM_L = k => (SIM.find(s => s.k === k) || SIM[0]).l;

  /* ---------------------------------------------------------- ISHIKAWA */
  function mIshikawa(o){
    const b = o.b || {}, t = o.t, d = o.d, ctx = o.ctx, tid = o.toolId, key = o.key;
    const diag = b.diag || '';
    const g = b.grid ? { key:b.grid, map:{
                          txt: b.textField || 'causa',
                          esp: b.spineField || 'espina',
                          sub: b.subField || 'subcausa',
                          dia: b.diagField || 'diag' } }
                     : findGrid(t, { esp:/^(espina|rama|categor|spine|m$)/i,
                                     txt:/^(causa|idea|texto|txt)$/i }, d, ctx);

    /* --- espinas --- */
    let branches = [];
    if (typeof b.spinesFrom === 'function'){
      branches = A(safe(() => b.spinesFrom(d), [])).map((s, i) => ({
        nombre: T2(s.l || s.nombre || s.label) || ('Espina ' + (i + 1)),
        pos: s.pos || (i % 2 ? 'bottom' : 'top'),
        bind: s.k ? bF(tid, s.k, 1) : null
      }));
    } else if (A(b.spineKeys).length){
      branches = A(b.spineKeys).map((k, i) => ({
        nombre: T2(d[k]) || ((diag === '4P' ? P4_DEF : M6_DEF)[i] || {}).l || ('Espina ' + (i + 1)),
        pos: ((diag === '4P' ? P4_DEF : M6_DEF)[i] || {}).pos || (i % 2 ? 'bottom' : 'top'),
        bind: bF(tid, k, 1)
      }));
    }

    const headKey = b.problemKey || findField(t, /^(problema|problem|efecto|defecto)/i, d, ctx);
    let head = typeof b.headFrom === 'function' ? T2(safe(() => b.headFrom(d), '')) : '';
    if (!head && headKey) head = T2(d[headKey]);

    /* --- modo TABLA --- */
    if (g && branches.length){
      const rows = rowsFor(d, g.key), mp = g.map;
      const idx = {}; branches.forEach((br, i) => { idx[UP(br.nombre)] = i; });
      branches.forEach(br => { br.causas = []; });
      let huerf = 0;
      rows.forEach((r, i) => {
        const esp = T2(r[mp.esp]);
        if (!esp) return;
        if (diag && mp.dia && T2(r[mp.dia]) && T2(r[mp.dia]) !== diag) return;
        const j = idx[UP(esp)];
        if (j === undefined){ if (T2(r[mp.txt]) || T2(r[mp.sub])) huerf++; return; }
        branches[j].causas.push({
          v: T2(r[mp.txt]),
          bind: bG(tid, g.key, i, mp.txt),
          del: act('gdel', [tid, g.key, i, 1]),
          subs: mp.sub ? [{ v:T2(r[mp.sub]), bind:bG(tid, g.key, i, mp.sub), ph:'Subcausa (¿por qué?)' }] : []
        });
      });
      branches.forEach(br => {
        const preset = {};
        preset[mp.esp] = br.nombre;
        if (diag && mp.dia) preset[mp.dia] = diag;
        br.add = act('gadd', [tid, g.key, JSON.stringify(preset)]);
      });
      return {
        kind:'ishikawa', src:'grid', diag:diag,
        head:{ v:head, bind: headKey ? bF(tid, headKey, 1) : null, ph:'Problema (efecto)' },
        branches: branches,
        aviso: huerf ? (huerf + ' causa(s) de la tabla no tienen una espina válida: revisa la columna de espina.') : '',
        tools: []
      };
    }

    /* --- modo PROPIO --- */
    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    const S = d[key];
    if (!Array.isArray(S.ramas) || !S.ramas.length){
      S.ramas = (branches.length ? branches.map(x => ({ nombre:x.nombre, pos:x.pos, causas:[] }))
                                 : M6_DEF.map(x => ({ nombre:x.l, pos:x.pos, causas:[] })));
    }
    const ramas = A(S.ramas).map((r, i) => {
      if (!Array.isArray(r.causas)) r.causas = [];
      return {
        nombre: T2(r.nombre) || ('Espina ' + (i + 1)),
        pos: r.pos === 'bottom' ? 'bottom' : (r.pos === 'top' ? 'top' : (i % 2 ? 'bottom' : 'top')),
        bind: bD(tid, key, 'ramas.' + i + '.nombre', 1),
        del: act('ddel', [tid, key, 'ramas', i]),
        add: act('dpush', [tid, key, 'ramas.' + i + '.causas', JSON.stringify({ txt:'', sub:[] })]),
        causas: A(r.causas).map((c, j) => ({
          v: T2(c && c.txt !== undefined ? c.txt : c),
          bind: bD(tid, key, 'ramas.' + i + '.causas.' + j + '.txt'),
          del: act('ddel', [tid, key, 'ramas.' + i + '.causas', j]),
          addSub: act('dpush', [tid, key, 'ramas.' + i + '.causas.' + j + '.sub', JSON.stringify('')]),
          subs: A(c && c.sub).map((s, k) => ({
            v: T2(s && s.txt !== undefined ? s.txt : s),
            bind: bD(tid, key, 'ramas.' + i + '.causas.' + j + '.sub.' + k),
            del: act('ddel', [tid, key, 'ramas.' + i + '.causas.' + j + '.sub', k])
          }))
        }))
      };
    });
    return {
      kind:'ishikawa', src:'self', diag:diag,
      head:{ v: T2(S.problema) || head, bind: bD(tid, key, 'problema'), ph:'Problema (efecto)' },
      branches: ramas, aviso:'',
      tools: [
        { l:'6M (manufactura)', a: act('!dsetj', [tid, key, 'ramas',
            JSON.stringify(M6_DEF.map(x => ({ nombre:x.l, pos:x.pos, causas:[] })))]),
          ti:'Reemplaza las espinas por las 6M: Mediciones, Materiales, Mano de Obra, Medio Ambiente, Métodos y Maquinaria' },
        { l:'4P (servicios)', a: act('!dsetj', [tid, key, 'ramas',
            JSON.stringify(P4_DEF.map(x => ({ nombre:x.l, pos:x.pos, causas:[] })))]),
          ti:'Reemplaza las espinas por las 4P de servicios: Politicas, Personal, Procedimientos e Instalaciones' },
        { l:'＋ Espina', a: act('dpush', [tid, key, 'ramas', JSON.stringify({ nombre:'', causas:[] })]) }
      ]
    };
  }

  /* ----------------------------------------------------------- 5 WHY´S */
  function mFivewhy(o){
    const b = o.b || {}, t = o.t, d = o.d, ctx = o.ctx, tid = o.toolId, key = o.key;
    const data = typeof b.data === 'function' ? safe(() => b.data(d, o.ctx), null) : null;
    const pk = (data && data.keys && data.keys.problem) || b.problemKey ||
               findField(t, /^(problema|problem)/i, d, ctx);
    const rk = (data && data.keys && data.keys.root) || b.rootKey ||
               findField(t, /^(raiz|root|causaraiz)/i, d, ctx);
    const steps = (data && A(data.steps).length) ? A(data.steps) : A(b.steps);

    if (pk || steps.length){
      const ws = [];
      for (let i = 0; i < 5; i++){
        const s = steps[i] || {};
        const ks = s.keys || { why:s.why, nec:s.nec, how:s.how };
        const kw = T2(ks.why), kn = T2(ks.nec), kh = T2(ks.how);
        ws.push({
          n: i + 1,
          txt:  { v: kw ? T2(d[kw]) : T2(s.why),  bind: kw ? bF(tid, kw) : null },
          conf: { v: kn ? T2(d[kn]) : T2(s.nec),  bind: kn ? bF(tid, kn, 1) : null },
          como: { v: kh ? T2(d[kh]) : T2(s.how),  bind: kh ? bF(tid, kh) : null }
        });
      }
      return {
        kind:'fivewhy', src:'grid',
        problema: { v: pk ? T2(d[pk]) : T2(data && data.problem), bind: pk ? bF(tid, pk) : null },
        whys: ws,
        root: { v: rk ? T2(d[rk]) : T2(data && data.root), bind: rk ? bF(tid, rk) : null },
        tools: []
      };
    }

    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    const S = d[key];
    if (!Array.isArray(S.whys)) S.whys = [];
    while (S.whys.length < 5) S.whys.push({ txt:'', conf:'', como:'' });
    return {
      kind:'fivewhy', src:'self',
      problema: { v:T2(S.problema), bind: bD(tid, key, 'problema') },
      whys: S.whys.slice(0, 7).map((w, i) => ({
        n: i + 1,
        txt:  { v:T2(w && w.txt),  bind: bD(tid, key, 'whys.' + i + '.txt') },
        conf: { v:T2(w && w.conf), bind: bD(tid, key, 'whys.' + i + '.conf', 1) },
        como: { v:T2(w && w.como), bind: bD(tid, key, 'whys.' + i + '.como') }
      })),
      root: { v:T2(S.root), bind: bD(tid, key, 'root') },
      tools: []
    };
  }

  /* ------------------------------------------------------------- ÁRBOL */
  function mTree(o){
    const b = o.b || {}, t = o.t, d = o.d, ctx = o.ctx, tid = o.toolId, key = o.key;
    const g = b.grid ? { key:b.grid, map:{ txt:b.textField || 'texto', lvl:b.levelField || 'nivel',
                                           tip:b.typeField || 'tipo' } }
                     : findGrid(t, { lvl:/^(nivel|level|lvl)$/i, txt:/^(texto|txt|nodo|causa)$/i }, d, ctx);
    const flag = b.rootFlag || 'ROOT CAUSE';

    if (g){
      const rows = rowsFor(d, g.key), mp = g.map;
      const rootKey = b.problemKey || b.rootKey || findField(t, /^(problema|problem)/i, d, ctx);
      const rootTxt = typeof b.rootFrom === 'function' ? T2(safe(() => b.rootFrom(d), '')) : T2(d[rootKey]);
      const root = { v: rootTxt || '', bind: rootKey ? bF(tid, rootKey, 1) : null,
                     lvl:0, i:-1, end:-1, kids:[], raiz:false, ph:'Problema (nodo raíz)' };
      const stack = [root];
      rows.forEach((r, i) => {
        const tx = T2(r[mp.txt]), lvRaw = T2(r[mp.lvl]);
        if (!tx && !lvRaw) return;
        const lv = cap(Math.round(num(lvRaw) || 1), 1, 6);
        const nd = { v:tx, bind: bG(tid, g.key, i, mp.txt), lvl:lv, i:i, end:i, kids:[],
                     raiz: UP(r[mp.tip]) === UP(flag),
                     del: act('gdel', [tid, g.key, i, 1]) };
        nd.marca = mp.tip ? act('gset', [tid, g.key, i, mp.tip, nd.raiz ? (A(b.types)[0] || 'WHY') : flag]) : null;
        while (stack.length > lv) stack.pop();
        (stack[stack.length - 1] || root).kids.push(nd);
        stack.push(nd);
      });
      /* rangos del subárbol para insertar / borrar en bloque */
      (function fin(nd){
        A(nd.kids).forEach(fin);
        nd.end = Math.max(nd.i, A(nd.kids).reduce((a, k) => Math.max(a, k.end), nd.i));
      })(root);
      (function acc(nd){
        A(nd.kids).forEach(acc);
        const pre = {};
        pre[mp.lvl] = Math.min(6, nd.lvl + 1);
        pre[mp.txt] = '';
        nd.add = act('gins', [tid, g.key, nd.end + 1, JSON.stringify(pre)]);
        if (nd.i >= 0) nd.del = act('gdel', [tid, g.key, nd.i, nd.end - nd.i + 1]);
      })(root);
      return { kind:'tree', src:'grid', root:root, flag:flag, tools:[] };
    }

    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    const S = d[key];
    if (typeof S.txt !== 'string') S.txt = T2(S.txt);
    if (!Array.isArray(S.hijos)) S.hijos = [];
    const walk = (nd, p, lvl) => {
      const node = {
        v: T2(nd.txt), bind: bD(tid, key, p ? p + '.txt' : 'txt'), lvl:lvl, raiz: !!nd.raiz, kids:[],
        add: act('dpush', [tid, key, (p ? p + '.hijos' : 'hijos'), JSON.stringify({ txt:'', hijos:[] })]),
        marca: act('dsetj', [tid, key, (p ? p + '.raiz' : 'raiz'), JSON.stringify(!nd.raiz)])
      };
      if (!Array.isArray(nd.hijos)) nd.hijos = [];
      node.kids = nd.hijos.map((h, i) => {
        const cp = (p ? p + '.hijos.' + i : 'hijos.' + i);
        const c = walk(h, cp, lvl + 1);
        c.del = act('ddel', [tid, key, (p ? p + '.hijos' : 'hijos'), i]);
        return c;
      });
      return node;
    };
    const root = walk(S, '', 0);
    root.ph = 'Problema (nodo raíz)';
    return { kind:'tree', src:'self', root:root, flag:flag, tools:[
      { l:'＋ Rama', a: root.add, ti:'Agrega una rama de primer nivel' }
    ]};
  }

  /* ------------------------------------------------------------- SIPOC */
  function mSipoc(o){
    const b = o.b || {}, t = o.t, d = o.d, ctx = o.ctx, tid = o.toolId, key = o.key;
    const COLS = [
      { k:'s', letra:'S', l:'SUPPLIERS',  sub:'PROVEEDORES DEL RECURSO' },
      { k:'i', letra:'I', l:'INPUTS',     sub:'RECURSOS REQUERIDOS' },
      { k:'p', letra:'P', l:'PROCESS',    sub:'DESCRIPCIÓN DEL PROCESO' },
      { k:'o', letra:'O', l:'OUTPUTS',    sub:'ENTREGABLES DEL PROCESO' },
      { k:'c', letra:'C', l:'CUSTOMERS',  sub:'CLIENTES / STAKEHOLDERS' }
    ];
    const g = (b.grid && b.map) ? { key:b.grid, map:b.map }
            : findGrid(t, { s:/^(sup|s$|prove)/i, i:/^(inp|i$|entr)/i, p:/^(pro|p$|proc)/i,
                            o:/^(out|o$|sal)/i, c:/^(cus|c$|clie)/i }, d, ctx);

    if (g){
      const rows = rowsFor(d, g.key), mp = g.map;
      const cols = COLS.map(c => {
        const ck = mp[c.k];
        const cards = [];
        let vacia = -1;
        rows.forEach((r, i) => {
          if (T2(r[ck]) !== '') cards.push({ v:T2(r[ck]), bind:bG(tid, g.key, i, ck),
                                             del: act('gset', [tid, g.key, i, ck, '']) });
          else if (vacia < 0) vacia = i;
        });
        /* siempre queda una tarjeta libre al final para seguir escribiendo:
           si no hay hueco, apunta a la fila siguiente (se crea al escribir) */
        if (vacia < 0) vacia = rows.length;
        cards.push({ v:'', bind:bG(tid, g.key, vacia, ck, 1), nuevo:true });
        return Object.assign({}, c, { cards:cards,
          add: act('gadd', [tid, g.key, JSON.stringify({})]) });
      });
      return { kind:'sipoc', src:'grid', cols:cols, tools:[
        { l:'＋ Fila', a: act('gadd', [tid, g.key, JSON.stringify({})]), ti:'Agrega una fila a la tabla SIPOC' }
      ]};
    }

    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    const S = d[key];
    const cols = COLS.map(c => {
      if (!Array.isArray(S[c.k])) S[c.k] = [];
      const list = S[c.k];
      const cards = list.map((v, i) => ({
        v: T2(v && v.txt !== undefined ? v.txt : v),
        bind: bD(tid, key, c.k + '.' + i),
        del: act('ddel', [tid, key, c.k, i])
      }));
      cards.push({ v:'', bind:null, nuevo:true, addBtn: act('dpush', [tid, key, c.k, JSON.stringify('')]) });
      return Object.assign({}, c, { cards:cards, add: act('dpush', [tid, key, c.k, JSON.stringify('')]) });
    });
    return { kind:'sipoc', src:'self', cols:cols, tools:[] };
  }

  /* ---------------------------------------------------------- AFINIDAD */
  function mAffinity(o){
    const b = o.b || {}, t = o.t, d = o.d, ctx = o.ctx, tid = o.toolId, key = o.key;
    const g = b.grid ? { key:b.grid, map:{ txt:b.textField || 'idea', cat:b.catField || 'cat' } }
                     : findGrid(t, { txt:/^(idea|solucion|texto|causa)$/i, cat:/^(cat|categoria|categoría)/i }, d, ctx);
    /* categorías */
    let cats = [];
    let catBind = null, catDel = null, catAdd = null;
    const catsGrid = b.catsGrid || null, catsField = b.catsField || 'cat';
    if (typeof b.catsFrom === 'function') cats = A(safe(() => b.catsFrom(d), [])).map(T2).filter(Boolean);
    if (!cats.length && catsGrid){
      cats = rowsFor(d, catsGrid).map(r => T2(r[catsField])).filter(Boolean);
    }
    if (!cats.length && g){
      const col = colsOf(gridBlock(t, g.key), d, ctx).find(c => c.k === g.map.cat);
      const opts = col && (typeof col.opts === 'function' ? safe(() => col.opts(d, ctx), []) : col.opts);
      cats = A(opts).map(x => T2(x && x.v !== undefined ? x.v : x)).filter(Boolean);
    }

    if (g){
      const rows = rowsFor(d, g.key), mp = g.map;
      if (!cats.length){
        const seen = {};
        rows.forEach(r => { const c = T2(r[mp.cat]); if (c && !seen[UP(c)]){ seen[UP(c)] = 1; cats.push(c); } });
      }
      if (!cats.length) cats = M6_DEF.map(x => x.l);
      const idx = {}; cats.forEach((c, i) => { idx[UP(c)] = i; });
      const grupos = cats.map((c, i) => ({ nombre:c, ideas:[],
        bind: catsGrid ? bG(tid, catsGrid, i, catsField, 1) : null,
        add:  act('gadd', [tid, g.key, JSON.stringify((function(){ const p = {}; p[mp.cat] = c; return p; })())]) }));
      const sin = { nombre:'SIN CATEGORÍA', ideas:[], sin:true, add:
        act('gadd', [tid, g.key, JSON.stringify({})]) };
      rows.forEach((r, i) => {
        const tx = T2(r[mp.txt]), ca = T2(r[mp.cat]);
        if (!tx && !ca) return;
        const card = { v:tx, cat:ca, bind: bG(tid, g.key, i, mp.txt),
                       catBind: bG(tid, g.key, i, mp.cat, 1),
                       del: act('gdel', [tid, g.key, i, 1]) };
        const j = idx[UP(ca)];
        if (j === undefined) sin.ideas.push(card); else grupos[j].ideas.push(card);
      });
      if (sin.ideas.length) grupos.push(sin);
      return { kind:'affinity', src:'grid', cats:cats, grupos:grupos, tools:
        catsGrid ? [{ l:'＋ Categoría', a: act('gadd', [tid, catsGrid, JSON.stringify({})]) }] : [] };
    }

    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    const S = d[key];
    if (!Array.isArray(S.cats) || !S.cats.length) S.cats = cats.length ? cats.slice() : M6_DEF.map(x => x.l);
    if (!Array.isArray(S.ideas)) S.ideas = [];
    const lista = S.cats.map(T2);
    const idx = {}; lista.forEach((c, i) => { idx[UP(c)] = i; });
    const grupos = lista.map((c, i) => ({
      nombre:c, ideas:[],
      bind: bD(tid, key, 'cats.' + i, 1),
      del:  act('ddel', [tid, key, 'cats', i]),
      add:  act('dpush', [tid, key, 'ideas', JSON.stringify({ txt:'', cat:c })])
    }));
    const sin = { nombre:'SIN CATEGORÍA', ideas:[], sin:true,
                  add: act('dpush', [tid, key, 'ideas', JSON.stringify({ txt:'', cat:'' })]) };
    A(S.ideas).forEach((it, i) => {
      const card = { v:T2(it && it.txt), cat:T2(it && it.cat),
                     bind: bD(tid, key, 'ideas.' + i + '.txt'),
                     catBind: bD(tid, key, 'ideas.' + i + '.cat', 1),
                     del: act('ddel', [tid, key, 'ideas', i]) };
      const j = idx[UP(card.cat)];
      if (j === undefined) sin.ideas.push(card); else grupos[j].ideas.push(card);
    });
    if (sin.ideas.length) grupos.push(sin);
    return { kind:'affinity', src:'self', cats:lista, grupos:grupos, tools:[
      { l:'＋ Categoría', a: act('dpush', [tid, key, 'cats', JSON.stringify('NUEVA CATEGORÍA')]) }
    ]};
  }

  /* --------------------------------------------------------- SWIM LANE */
  function mSwimlane(o){
    const b = o.b || {}, t = o.t, d = o.d, ctx = o.ctx, tid = o.toolId, key = o.key;
    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    const S = d[key];
    if (!Array.isArray(S.pasos)) S.pasos = [];

    /* carriles: de campos sueltos (laneKeys) o del estado propio */
    let carriles = [];
    const lk = A(b.laneKeys);
    if (lk.length){
      const nom = typeof b.lanesFrom === 'function' ? A(safe(() => b.lanesFrom(d), [])) : [];
      carriles = lk.map((k, i) => ({
        nombre: T2(d[k]) || T2(nom[i]) || T2(A(b.lanes)[i]) || ('CARRIL ' + (i + 1)),
        bind: bF(tid, k, 1)
      }));
    } else {
      if (!Array.isArray(S.carriles) || !S.carriles.length){
        S.carriles = [{ nombre:'CLIENTE' }, { nombre:'ÁREA 1' }, { nombre:'ÁREA 2' }, { nombre:'ÁREA 3' }];
      }
      carriles = S.carriles.map((c, i) => ({
        nombre: T2(c && c.nombre) || ('CARRIL ' + (i + 1)),
        bind: bD(tid, key, 'carriles.' + i + '.nombre', 1),
        del:  act('ddel', [tid, key, 'carriles', i])
      }));
    }

    const simbolos = A(b.symbols).length
      ? SIM.filter(s => A(b.symbols).some(x => T2(x.k || x) === s.k)).concat(
          SIM.filter(s => !A(b.symbols).some(x => T2(x.k || x) === s.k)))
      : SIM;

    let maxCol = 0;
    const pasos = A(S.pasos).map((p, i) => {
      const col = Math.max(0, Math.round(num(p && p.col)));
      const car = cap(Math.round(num(p && p.carril)), 0, Math.max(0, carriles.length - 1));
      maxCol = Math.max(maxCol, col);
      return {
        i:i, col:col, carril:car,
        tipo: T2(p && p.tipo) || 'proceso',
        v: T2(p && p.txt),
        bind: bD(tid, key, 'pasos.' + i + '.txt'),
        tipoBind: bD(tid, key, 'pasos.' + i + '.tipo', 1),
        del: act('ddel', [tid, key, 'pasos', i]),
        izq: act('dset', [tid, key, 'pasos.' + i + '.col', Math.max(0, col - 1)]),
        der: act('dset', [tid, key, 'pasos.' + i + '.col', col + 1]),
        arr: act('dset', [tid, key, 'pasos.' + i + '.carril', Math.max(0, car - 1)]),
        aba: act('dset', [tid, key, 'pasos.' + i + '.carril', Math.min(carriles.length - 1, car + 1)])
      };
    });
    const nCols = Math.max(6, maxCol + 2);
    const nuevo = (car, col) => act('dpush', [tid, key, 'pasos',
      JSON.stringify({ carril:car, col:col, tipo:(col === 0 ? 'inicio' : 'proceso'), txt:'' })]);

    const filas = [
      { k:'tl', l:'TIME LINE' },
      { k:'ds', l:'DISTANCE' },
      { k:'mt', l:'METRICS'  }
    ].map(f => {
      if (!Array.isArray(S[f.k])) S[f.k] = [];
      return { l:f.l, celdas: Array.apply(null, Array(nCols)).map((x, c) => ({
        v: T2(S[f.k][c]), bind: bD(tid, key, f.k + '.' + c) })) };
    });

    return {
      kind:'swimlane', src:'self', carriles:carriles, pasos:pasos, nCols:nCols,
      simbolos:simbolos, nuevo:nuevo, filas:filas,
      proceso: T2(d[findField(t, /^(proceso|process|nombre)/i, d, ctx)]),
      tools: lk.length ? [] : [
        { l:'＋ Carril', a: act('dpush', [tid, key, 'carriles', JSON.stringify({ nombre:'NUEVO CARRIL' })]) }
      ]
    };
  }

  /* --------------------------------------------------------------- CTQ */
  function mCtq(o){
    const b = o.b || {}, t = o.t, d = o.d, ctx = o.ctx, tid = o.toolId, key = o.key;
    const g = (b.grid && b.map) ? { key:b.grid, map:b.map }
            : findGrid(t, { nec:/^(neces|voc|cliente|necesidad)/i,
                            drv:/^(conduct|driver|drv)/i,
                            ctq:/^(ctq|requisi)/i }, d, ctx);
    if (g){
      const rows = rowsFor(d, g.key), mp = g.map;
      const necs = [];
      let cur = null, curDrv = null;
      rows.forEach((r, i) => {
        const nv = T2(r[mp.nec]), dv = T2(r[mp.drv]), cv = T2(r[mp.ctq]);
        if (!nv && !dv && !cv) return;
        if (nv || !cur){
          cur = { v:nv, bind:bG(tid, g.key, i, mp.nec), i:i, end:i, kids:[],
                  del: act('gdel', [tid, g.key, i, 1]) };
          necs.push(cur); curDrv = null;
        }
        cur.end = i;
        if (dv || !curDrv){
          curDrv = { v:dv, bind:bG(tid, g.key, i, mp.drv), i:i, kids:[] };
          cur.kids.push(curDrv);
        }
        if (cv || !curDrv.kids.length){
          curDrv.kids.push({ v:cv, bind:bG(tid, g.key, i, mp.ctq), i:i });
        }
      });
      necs.forEach(nd => {
        const pre = {}; pre[mp.nec] = ''; pre[mp.drv] = ''; pre[mp.ctq] = '';
        nd.add = act('gins', [tid, g.key, nd.end + 1, JSON.stringify(pre)]);
        A(nd.kids).forEach(k => { k.add = nd.add; });
      });
      const preN = {}; preN[mp.nec] = '';
      return { kind:'ctq', src:'grid', necs:necs, tools:[
        { l:'＋ Necesidad', a: act('gadd', [tid, g.key, JSON.stringify(preN)]) }
      ]};
    }

    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    const S = d[key];
    if (!Array.isArray(S.necesidades) || !S.necesidades.length)
      S.necesidades = [{ txt:'', conductores:[{ txt:'', ctqs:[{ txt:'' }] }] }];
    const necs = S.necesidades.map((nd, i) => {
      if (!Array.isArray(nd.conductores)) nd.conductores = [];
      return {
        v:T2(nd.txt), bind: bD(tid, key, 'necesidades.' + i + '.txt'),
        del: act('ddel', [tid, key, 'necesidades', i]),
        add: act('dpush', [tid, key, 'necesidades.' + i + '.conductores',
                           JSON.stringify({ txt:'', ctqs:[{ txt:'' }] })]),
        kids: nd.conductores.map((cd, j) => {
          if (!Array.isArray(cd.ctqs)) cd.ctqs = [];
          return {
            v:T2(cd.txt), bind: bD(tid, key, 'necesidades.' + i + '.conductores.' + j + '.txt'),
            del: act('ddel', [tid, key, 'necesidades.' + i + '.conductores', j]),
            add: act('dpush', [tid, key, 'necesidades.' + i + '.conductores.' + j + '.ctqs',
                               JSON.stringify({ txt:'' })]),
            kids: cd.ctqs.map((qd, k) => ({
              v:T2(qd && qd.txt !== undefined ? qd.txt : qd),
              bind: bD(tid, key, 'necesidades.' + i + '.conductores.' + j + '.ctqs.' + k + '.txt'),
              del: act('ddel', [tid, key, 'necesidades.' + i + '.conductores.' + j + '.ctqs', k])
            }))
          };
        })
      };
    });
    return { kind:'ctq', src:'self', necs:necs, tools:[
      { l:'＋ Necesidad', a: act('dpush', [tid, key, 'necesidades',
          JSON.stringify({ txt:'', conductores:[{ txt:'', ctqs:[{ txt:'' }] }] })]) }
    ]};
  }

  /* -------------------------------------------------------- FLUJOGRAMA */
  function mFlow(o){
    const b = o.b || {}, d = o.d, tid = o.toolId, key = o.key;
    const g = b.grid ? { key:b.grid, map:{ txt:b.textField || 'paso', tip:b.typeField || 'tipo' } } : null;
    if (g){
      const rows = rowsFor(d, g.key), mp = g.map;
      const pasos = [];
      rows.forEach((r, i) => {
        const tx = T2(r[mp.txt]);
        if (!tx && !T2(r[mp.tip])) return;
        pasos.push({ v:tx, tipo:T2(r[mp.tip]) || 'proceso',
          bind: bG(tid, g.key, i, mp.txt),
          tipoBind: mp.tip ? bG(tid, g.key, i, mp.tip, 1) : null,
          del: act('gdel', [tid, g.key, i, 1]) });
      });
      return { kind:'flow', src:'grid', pasos:pasos, tools:[
        { l:'＋ Paso', a: act('gadd', [tid, g.key, JSON.stringify({})]) }
      ]};
    }
    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    const S = d[key];
    if (!Array.isArray(S.pasos) || !S.pasos.length)
      S.pasos = [{ tipo:'inicio', txt:'' }, { tipo:'proceso', txt:'' }, { tipo:'inicio', txt:'' }];
    return {
      kind:'flow', src:'self',
      pasos: S.pasos.map((p, i) => ({
        v:T2(p && p.txt), tipo:T2(p && p.tipo) || 'proceso',
        bind: bD(tid, key, 'pasos.' + i + '.txt'),
        tipoBind: bD(tid, key, 'pasos.' + i + '.tipo', 1),
        del: act('ddel', [tid, key, 'pasos', i]),
        sube: act('dmove', [tid, key, 'pasos', i, -1]),
        baja: act('dmove', [tid, key, 'pasos', i, 1])
      })),
      tools: [{ l:'＋ Paso', a: act('dpush', [tid, key, 'pasos', JSON.stringify({ tipo:'proceso', txt:'' })]) }]
    };
  }

  const MODEL = { ishikawa:mIshikawa, fivewhy:mFivewhy, tree:mTree, sipoc:mSipoc,
                  affinity:mAffinity, swimlane:mSwimlane, ctq:mCtq, flow:mFlow };

  /* ======================================================================
     4 · DIBUJO
     ==================================================================== */

  /* --------------------------------------------------------- ISHIKAWA */
  function dIshikawa(M, T){
    const CW = 186, SGAP = 5, HEADW = 214, HEADH = 104, SL = 0.30, SPACE = 262;
    const tops = [], bots = [];
    M.branches.forEach(br => { (br.pos === 'bottom' ? bots : tops).push(br); });
    /* cada caja crece con su texto: nada queda cortado ni en pantalla ni en el PNG */
    const causeH = c => boxH(c.v, CW - 30, 11.5, 30, 3);
    const subH   = s => boxH(s.v, CW - 52, 10.5, 22, 2, 8);
    const subsH  = c => A(c.subs).reduce((a, s) => a + subH(s) + SGAP, 0);
    const blockH = c => causeH(c) + (A(c.subs).length ? subsH(c) + 4 : 0) + 14;
    const sideLen = list => {
      let m = 152;
      list.forEach(br => {
        let off = 58;
        A(br.causas).forEach(c => { off += blockH(c); });
        m = Math.max(m, off + 26);
      });
      return m;
    };
    const lenT = sideLen(tops), lenB = sideLen(bots);
    const nMax = Math.max(tops.length, bots.length, 1);
    const x0 = 26 + CW + 18 + SL * Math.max(lenT, lenB);
    const headX = x0 + 84 + (nMax - 1) * SPACE + 92;
    const W = headX + HEADW + 26;
    const yS = 54 + lenT;
    const H = yS + lenB + 54;
    let s = '';

    /* espina central + cabeza */
    s += line(x0, yS, headX + 4, yS, { stroke:T.p1, sw:6, cap:'round' });
    s += poly([[headX, yS - HEADH / 2], [headX + HEADW - 34, yS - HEADH / 2], [headX + HEADW, yS],
               [headX + HEADW - 34, yS + HEADH / 2], [headX, yS + HEADH / 2]],
              { fill:T.p1, stroke:T.p4, sw:1.5, join:'round' });
    s += label(headX + 12, yS - HEADH / 2 - 10, 'PROBLEMA · EFECTO', { color:T.p2, fs:10.5, ls:1 });
    s += field(T, headX + 14, yS - HEADH / 2 + 12, HEADW - 56, HEADH - 24, {
      v:M.head.v, bind:M.head.bind, ph:M.head.ph, ml:true, fs:12.5, fw:800,
      color: T.mode === 'ui' ? '#FFFFFF' : T.inv, align:'left' });

    /* espinas */
    const side = (list, dir, boneLen) => {
      list.forEach((br, j) => {
        const baseX = x0 + 84 + j * SPACE;
        const tipX = baseX - SL * boneLen, tipY = yS + dir * boneLen;
        s += line(baseX, yS, tipX, tipY, { stroke:T.p1, sw:3, cap:'round' });

        /* caja del nombre de la espina */
        const lw = 162, lh = 34;
        const lx = tipX - lw / 2, ly = dir < 0 ? tipY - lh - 4 : tipY + 4;
        s += rect(lx, ly, lw, lh, 7, { fill:T.p1, stroke:T.p4, sw:1.2 });
        s += field(T, lx + 8, ly + 5, lw - 34, lh - 10, {
          v:br.nombre, bind:br.bind, ph:'Espina', fs:11.5, fw:800,
          color:'#FFFFFF', align:'left', ls:0.3 });
        s += btn(T, lx + lw - 24, ly + lh / 2 - 9, 18, '＋', br.add, 'Agregar causa a ' + br.nombre, 'inv');
        if (br.del) s += btn(T, lx - 11, ly + lh / 2 - 9, 18, '✕', br.del, 'Quitar espina', 'bad');

        /* causas */
        let cur = 58;
        A(br.causas).forEach(c => {
          const ch = causeH(c);
          const off = cur + ch / 2;
          const px = baseX - SL * off, py = yS + dir * off;
          const bx = px - 13 - CW, by = py - ch / 2;
          s += line(px - 13, py, px, py, { stroke:T.line, sw:1.3 });
          s += circ(px, py, 2.6, { fill:T.p2 });
          s += rect(bx, by, CW, ch, 6, { fill:T.box, stroke:T.bd, sw:1.1 });
          s += field(T, bx + 8, by + 3, CW - (c.del ? 30 : 14), ch - 6, {
            v:c.v, bind:c.bind, ph:'Causa posible', ml:true, fs:11.5, fw:600, color:T.tx });
          if (c.del) s += btn(T, bx + CW - 19, by + 5, 16, '✕', c.del, 'Quitar causa', 'bad');

          /* subcausas (siempre más lejos de la espina que su causa) */
          let so = 0;
          A(c.subs).forEach(sb => {
            const sh = subH(sb);
            const sy = dir < 0 ? by - so - sh - SGAP : by + ch + SGAP + so;
            const sx = bx + 26;
            s += path('M' + n1(bx + 13) + ',' + n1(dir < 0 ? by : by + ch) +
                      ' V' + n1(sy + sh / 2) + ' H' + n1(sx),
                      { stroke:T.line, sw:1, dash:'2 3', fill:'none' });
            s += rect(sx, sy, CW - 26, sh, 5, { fill:T.box2, stroke:T.bd, sw:1 });
            s += field(T, sx + 7, sy + 2, CW - 26 - (sb.del ? 32 : 14), sh - 4, {
              v:sb.v, bind:sb.bind, ph:sb.ph || 'Subcausa', ml:true, fs:10.5, fw:600, color:T.tx2 });
            if (sb.del) s += btn(T, sx + CW - 26 - 19, sy + 4, 14, '✕', sb.del, 'Quitar subcausa', 'bad');
            so += sh + SGAP;
          });
          if (c.addSub) s += btn(T, bx - 20, py - 8, 16, '＋', c.addSub, 'Agregar subcausa');
          cur += blockH(c);
        });
      });
    };
    side(tops, -1, lenT);
    side(bots, 1, lenB);

    s += label(26, 26, 'ISHIKAWA · CAUSA — EFECTO' + (M.diag ? '  (' + M.diag + ')' : ''),
               { color:T.tx3, fs:11, ls:1.2 });
    return svgWrap(T, W, H, s);
  }

  /* ----------------------------------------------------------- 5 WHY´S */
  function dFivewhy(M, T){
    const W = 1080, BX = 46, BW = 470, RH = 70, GAP = 30, PX = 566, PW = 468;
    const nW = M.whys.length;
    let s = '';
    let y = 46;
    s += label(BX, 26, 'PROBLEM · PROBLEMA', { color:T.tx3, fs:10.5, ls:1.2 });
    s += rect(BX, y, BW, RH, 9, { fill:T.p1, stroke:T.p4, sw:1.4 });
    s += field(T, BX + 12, y + 8, BW - 24, RH - 16, { v:M.problema.v, bind:M.problema.bind,
      ph:'Enuncia el problema con datos: qué, dónde, cuándo y cuánto', ml:true, fs:12.5, fw:700, color:'#FFFFFF' });
    s += label(PX, 26, 'IS CONFIRMATION NECESSARY? · HOW IS THIS CONFIRMED',
               { color:T.tx3, fs:10.5, ls:1.2 });

    let py = y + RH;
    M.whys.forEach((w, i) => {
      const ry = y + RH + GAP + i * (RH + GAP);
      /* flecha desde el bloque anterior */
      s += arrow(T, BX + BW / 2, py + 3, BX + BW / 2, ry - 4, { stroke:T.p2, sw:2, accent:true });
      /* caja del porqué */
      s += rect(BX, ry, BW, RH, 9, { fill:T.box, stroke:T.p2, sw:1.4 });
      s += rect(BX, ry, 6, RH, 3, { fill:T.p2 });
      s += label(BX + 14, ry + 16, 'WHY ' + w.n + ' — ¿POR QUÉ?', { color:T.p2, fs:10, ls:1 });
      s += field(T, BX + 14, ry + 22, BW - 28, RH - 30, { v:w.txt.v, bind:w.txt.bind,
        ph: i === 0 ? '¿Por qué ocurre el problema?' : '¿Por qué ocurre lo anterior?',
        ml:true, fs:12, fw:600, color:T.tx });

      /* panel de confirmación */
      s += rect(PX, ry, PW, RH, 9, { fill:T.box2, stroke:T.bd, sw:1.1 });
      s += line(BX + BW + 6, ry + RH / 2, PX - 8, ry + RH / 2, { stroke:T.line, sw:1, dash:'3 3' });
      s += label(PX + 12, ry + 17, 'IS CONFIRMATION NECESSARY?', { color:T.tx3, fs:9.5, ls:.6 });
      const conf = UP(w.conf.v);
      s += rect(PX + 12, ry + 24, 78, 28, 6, {
        fill: conf === 'SI' ? 'rgba(245,166,35,.16)' : conf === 'NO' ? 'rgba(47,191,113,.14)' : T.box,
        stroke: conf === 'SI' ? T.p3 : conf === 'NO' ? T.ok : T.bd, sw:1.2 });
      s += field(T, PX + 18, ry + 26, 66, 24, { v:w.conf.v, bind:w.conf.bind, sel:['SI', 'NO'],
        fs:11.5, fw:800, color: conf === 'SI' ? T.p3 : conf === 'NO' ? T.ok : T.tx2, align:'center' });
      s += label(PX + 104, ry + 17, 'HOW IS THIS CONFIRMED', { color:T.tx3, fs:9.5, ls:.6 });
      s += rect(PX + 104, ry + 24, PW - 116, 28, 6, { fill:T.box, stroke:T.bd, sw:1 });
      s += field(T, PX + 110, ry + 26, PW - 128, 24, { v:w.como.v, bind:w.como.bind,
        ph:'Dato, evidencia o prueba con la que se confirma', fs:11.5, fw:600, color:T.tx });
      py = ry + RH;
    });

    const ry = py + GAP + 6;
    s += arrow(T, BX + BW / 2, py + 3, BX + BW / 2, ry - 4, { stroke:T.bad, sw:2 });
    const RW = W - BX * 2;
    s += rect(BX, ry, RW, 80, 10, { fill: T.mode === 'ui' ? 'rgba(229,72,77,.10)' : '#FDECEC',
      stroke:T.bad, sw:1.6 });
    s += label(BX + 16, ry + 20, 'ROOT CAUSE — CAUSA RAÍZ', { color:T.bad, fs:11, ls:1.1 });
    s += field(T, BX + 16, ry + 28, RW - 32, 44, { v:M.root.v, bind:M.root.bind,
      ph:'Causa raíz a la que se llegó: debe ser accionable y estar confirmada con datos',
      ml:true, fs:13, fw:700, color:T.tx });
    return svgWrap(T, W, ry + 80 + 30, s);
  }

  /* ------------------------------------------------------------- ÁRBOL */
  /** Layout jerárquico horizontal: cada nodo tiene su propio alto (según el texto),
   *  los padres se centran sobre el bloque de sus hijos y nunca se solapan. */
  function layoutTree(root, NW, HG, VG, x0, y0, hOf){
    let cur = y0, maxD = 0, bottom = y0, ult = {};
    (function walk(nd, depth){
      nd.depth = depth; maxD = Math.max(maxD, depth);
      nd.x = x0 + depth * (NW + HG);
      nd.h = hOf(nd, depth);
      const kids = A(nd.kids);
      if (!kids.length){ nd.y = cur; cur += nd.h + VG; }
      else {
        kids.forEach(k => walk(k, depth + 1));
        const f = kids[0], l = kids[kids.length - 1];
        nd.y = (f.y + l.y + l.h) / 2 - nd.h / 2;
      }
      if (ult[depth] !== undefined && nd.y < ult[depth] + VG) nd.y = ult[depth] + VG;
      ult[depth] = nd.y + nd.h;
      bottom = Math.max(bottom, nd.y + nd.h);
    })(root, 0);
    return { h: Math.max(cur - y0, bottom - y0), maxD: maxD };
  }
  function dTree(M, T){
    const NW = 214, HG = 78, VG = 16, X0 = 26, Y0 = 52;
    const hOf = (nd, dep) => boxH(nd.v, NW - 30, 11.5, 58, 4, (dep === 0 || nd.raiz) ? 26 : 14);
    const lay = layoutTree(M.root, NW, HG, VG, X0, Y0, hOf);
    const W = X0 + (lay.maxD + 1) * (NW + HG) + 34;
    const H = Math.max(200, Y0 + lay.h + 34);
    let s = label(X0, 28, 'TREE DIAGRAM / WHY — ÁRBOL DE CAUSAS', { color:T.tx3, fs:11, ls:1.2 });

    (function draw(nd){
      const raiz = !!nd.raiz, root = nd.depth === 0, NH = nd.h;
      const fill = root ? T.p1 : raiz ? (T.mode === 'ui' ? 'rgba(229,72,77,.12)' : '#FDECEC') : T.box;
      const bd   = root ? T.p4 : raiz ? T.bad : T.bd;
      const col  = root ? '#FFFFFF' : T.tx;
      A(nd.kids).forEach(k => {
        s += elbow(T, nd.x + NW, nd.y + NH / 2, k.x - 2, k.y + k.h / 2,
                   { stroke: k.raiz ? T.bad : T.line, sw:1.3 });
      });
      s += rect(nd.x, nd.y, NW, NH, 8, { fill:fill, stroke:bd, sw: root || raiz ? 1.7 : 1.1 });
      if (raiz) s += rect(nd.x, nd.y, 5, NH, 3, { fill:T.bad });
      if (root) s += label(nd.x + 12, nd.y + 15, 'PROBLEMA', { color:T.p2, fs:9, ls:1 });
      if (raiz) s += label(nd.x + 12, nd.y + 15, '★ ROOT CAUSE', { color:T.bad, fs:9, ls:.8 });
      const off = (root || raiz) ? 20 : 7;
      s += field(T, nd.x + 11, nd.y + off, NW - 24, NH - off - 7, {
        v:nd.v, bind:nd.bind, ph: nd.ph || (nd.depth === 1 ? '¿Por qué ocurre?' : 'Causa / porqué'),
        ml:true, fs:11.5, fw:650, color:col });
      s += btn(T, nd.x + NW - 12, nd.y + NH / 2 - 10, 20, '＋', nd.add, 'Agregar causa hija', root ? 'inv' : 'ok');
      if (nd.del) s += btn(T, nd.x + NW - 12, nd.y - 9, 18, '✕', nd.del, 'Quitar nodo y sus hijos', 'bad');
      if (nd.marca && !root) s += btn(T, nd.x + NW - 12, nd.y + NH - 9, 18, '★', nd.marca,
        raiz ? 'Quitar marca de causa raíz' : 'Marcar como CAUSA RAÍZ', raiz ? 'bad' : '');
      A(nd.kids).forEach(draw);
    })(M.root);
    return svgWrap(T, W, H, s);
  }

  /* ------------------------------------------------------------- SIPOC */
  function dSipoc(M, T){
    const CW = 206, GAP = 22, HDR = 64, CG = 9, X0 = 26, Y0 = 26;
    const cardH = cd => boxH(cd.v, CW - 40, 11.5, 46, 5);
    const W = X0 * 2 + M.cols.length * CW + (M.cols.length - 1) * GAP;
    const alto = M.cols.reduce((a, c) => Math.max(a,
      c.cards.reduce((b, cd) => b + cardH(cd) + CG, 0)), 0);
    const H = Y0 + HDR + 18 + alto + 40;
    let s = '';
    M.cols.forEach((c, j) => {
      const x = X0 + j * (CW + GAP), col = SIPOC_COL[j % SIPOC_COL.length];
      /* cabecera en forma de galón (flecha) */
      const y = Y0, h = HDR, nk = 20;
      s += poly([[x, y], [x + CW - nk, y], [x + CW, y + h / 2], [x + CW - nk, y + h],
                 [x, y + h], [x + nk, y + h / 2]], { fill:col, stroke:col, sw:1, join:'round' });
      s += '<text x="' + n1(x + nk + 10) + '" y="' + n1(y + h / 2 + 9) + '"' +
           sty({ fill:'#FFFFFF', fs:26, fw:800 }) + '>' + esc(c.letra) + '</text>';
      s += label(x + nk + 34, y + h / 2 - 2, c.l, { color:'#FFFFFF', fs:12, ls:.8 });
      s += label(x + nk + 34, y + h / 2 + 13, c.sub, { color:'rgba(255,255,255,.78)', fs:8.5, fw:700, ls:.3 });

      let cy = Y0 + HDR + 18;
      /* las tarjetas vacías de captura no se exportan */
      (T.mode === 'ui' ? c.cards : c.cards.filter(x => !x.nuevo)).forEach(cd => {
        const CH = cardH(cd), nuevo = !!cd.nuevo;
        s += rect(x, cy, CW, CH, 8, {
          fill: nuevo ? 'transparent' : T.box, stroke:T.bd,
          sw: nuevo ? 1 : 1.1, dash: nuevo ? '4 4' : '' });
        s += rect(x, cy, 4, CH, 2, { fill: nuevo ? 'transparent' : col, op: nuevo ? 0 : .85 });
        s += field(T, x + 12, cy + 5, CW - (cd.del ? 34 : 22), CH - 10, {
          v:cd.v, bind:cd.bind, ph: nuevo ? '＋ escribe aquí…' : '', ml:true, fs:11.5, fw:600, color:T.tx });
        if (cd.del) s += btn(T, x + CW - 20, cy + CH / 2 - 8, 16, '✕', cd.del, 'Vaciar tarjeta', 'bad');
        if (cd.addBtn) s += btn(T, x + CW - 20, cy + CH / 2 - 8, 16, '＋', cd.addBtn, 'Agregar tarjeta', 'ok');
        cy += CH + CG;
      });
    });
    s += label(X0, H - 14, 'El SIPOC delimita el alcance: lo que no aparece aquí queda fuera (Scope Out).',
               { color:T.tx3, fs:10, fw:600 });
    return svgWrap(T, W, H, s);
  }

  /* ---------------------------------------------------------- AFINIDAD */
  function dAffinity(M, T){
    const CW = 232, GAP = 16, HDR = 46, CG = 9, X0 = 22, Y0 = 24;
    const grupos = M.grupos.length ? M.grupos : [{ nombre:'CATEGORÍA', ideas:[] }];
    const sel = T.mode === 'ui';
    const cardH = c => boxH(c.v, CW - 40, 11.5, sel ? 56 : 40, 4, sel ? 34 : 12);
    const W = X0 * 2 + grupos.length * CW + (grupos.length - 1) * GAP;
    const alto = Math.max(30, grupos.reduce((a, g) => Math.max(a,
      g.ideas.reduce((b, c) => b + cardH(c) + CG, 0)), 0));
    const H = Y0 + HDR + 12 + alto + 30 + 36;      /* + caja ＋ y pie */
    const catOpts = M.cats.slice();
    let s = '';
    grupos.forEach((g, j) => {
      const x = X0 + j * (CW + GAP);
      const col = g.sin ? T.tx3 : CAT_COL[j % CAT_COL.length];
      s += rect(x, Y0, CW, HDR, 8, { fill:col, stroke:col, sw:1 });
      s += field(T, x + 12, Y0 + 8, CW - (g.del ? 66 : 46), HDR - 16, {
        v:g.nombre, bind:g.bind, ph:'Categoría', fs:12, fw:800, color:'#FFFFFF', ls:.4 });
      s += rect(x + CW - (g.del ? 56 : 36), Y0 + HDR / 2 - 10, 24, 20, 10,
                { fill:'rgba(255,255,255,.22)' });
      s += label(x + CW - (g.del ? 44 : 24), Y0 + HDR / 2 + 4, String(g.ideas.length),
                 { color:'#FFFFFF', fs:11, fw:800, align:'center' });
      if (g.del) s += btn(T, x + CW - 26, Y0 + HDR / 2 - 9, 18, '✕', g.del, 'Quitar categoría', 'inv');

      let cy = Y0 + HDR + 12;
      g.ideas.forEach(c => {
        const CH = cardH(c);
        s += rect(x, cy, CW, CH, 8, { fill:T.box, stroke:T.bd, sw:1.1 });
        s += rect(x, cy, 4, CH, 2, { fill:col, op:.9 });
        s += field(T, x + 12, cy + 5, CW - 34, CH - (sel ? 30 : 10), {
          v:c.v, bind:c.bind, ph:'Idea / causa posible', ml:true, fs:11.5, fw:600, color:T.tx });
        if (c.del) s += btn(T, x + CW - 22, cy + 6, 16, '✕', c.del, 'Quitar idea', 'bad');
        if (sel && c.catBind){
          s += rect(x + 12, cy + CH - 24, CW - 26, 19, 5, { fill:T.box2, stroke:T.bd, sw:.9 });
          s += field(T, x + 15, cy + CH - 23, CW - 32, 17, { v:c.cat, bind:c.catBind, sel:catOpts,
            fs:10, fw:700, color:T.tx2, title:'Mover la tarjeta a otra categoría' });
        }
        cy += CH + CG;
      });
      if (g.add && T.mode === 'ui'){
        s += rect(x, cy, CW, 30, 8, { fill:'transparent', stroke:T.bd, sw:1, dash:'4 4' });
        s += btn(T, x + CW / 2 - 11, cy + 4, 22, '＋', g.add, 'Agregar idea en ' + g.nombre, 'ok');
      }
    });
    s += label(X0, H - 16, 'AFFINITY DIAGRAM — agrupa las ideas por afinidad; cada columna es una categoría.',
               { color:T.tx3, fs:10, fw:600 });
    return svgWrap(T, W, H, s);
  }

  /* --------------------------------------------------------- SWIM LANE */
  function shapePath(T, tipo, cx, cy, w, h, o){
    const l = cx - w / 2, r = cx + w / 2, t = cy - h / 2, b = cy + h / 2;
    const st = Object.assign({ fill:T.box, stroke:T.p1, sw:1.5, join:'round' }, o || {});
    switch (tipo){
      case 'decision':
        return poly([[cx, t], [r, cy], [cx, b], [l, cy]], st);
      case 'inicio':
        return rect(l, t, w, h, h / 2, st);
      case 'documento':
        return path('M' + n1(l) + ',' + n1(t) + ' H' + n1(r) + ' V' + n1(b - 8) +
          ' q' + n1(-w / 4) + ',10 ' + n1(-w / 2) + ',0 q' + n1(-w / 4) + ',-10 ' + n1(-w / 2) + ',0 Z', st);
      case 'espera':
        return path('M' + n1(l) + ',' + n1(t) + ' H' + n1(r - h / 2) + ' a' + n1(h / 2) + ',' + n1(h / 2) +
          ' 0 0 1 0,' + n1(h) + ' H' + n1(l) + ' Z', st);
      case 'datos':
        return poly([[l + 14, t], [r, t], [r - 14, b], [l, b]], st);
      case 'conector':
        return circ(cx, cy, h / 2, st);
      default:
        return rect(l, t, w, h, 7, st);
    }
  }
  function dSwimlane(M, T){
    const LW = 172, CW = 182, LH = 96, X0 = 22, TOP = 62, FH = 38;
    const nL = Math.max(1, M.carriles.length), nC = M.nCols;
    const W = X0 * 2 + LW + nC * CW;
    const H = TOP + nL * LH + M.filas.length * FH + 30;
    const gx = X0 + LW;
    let s = '';

    /* cabecera */
    s += rect(X0, 26, LW + nC * CW, 26, 6, { fill:T.p1 });
    s += label(X0 + 12, 44, 'PROCESS STEPS' + (M.proceso ? ' — ' + UP(M.proceso) : ''),
               { color:'#FFFFFF', fs:11, ls:1 });
    for (let c = 0; c < nC; c++){
      s += label(gx + c * CW + CW / 2, 44, String(c + 1), { color:'rgba(255,255,255,.65)', fs:10, align:'center' });
    }

    /* carriles */
    M.carriles.forEach((car, i) => {
      const y = TOP + i * LH;
      s += rect(X0, y, LW + nC * CW, LH, 0, { fill: i % 2 ? T.band : 'transparent', stroke:T.bd, sw:1 });
      s += rect(X0, y, LW, LH, 0, { fill:T.box2, stroke:T.bd, sw:1 });
      s += field(T, X0 + 10, y + LH / 2 - 18, LW - (car.del ? 40 : 20), 36, {
        v:car.nombre, bind:car.bind, ph:'Área / función', ml:true, fs:11.5, fw:800, color:T.tx });
      if (car.del) s += btn(T, X0 + LW - 24, y + LH / 2 - 8, 16, '✕', car.del, 'Quitar carril', 'bad');
      for (let c = 1; c < nC; c++) s += line(gx + c * CW, y, gx + c * CW, y + LH, { stroke:T.bd, sw:.6 });
    });

    /* conectores entre pasos consecutivos */
    const ord = M.pasos.slice().sort((a, b) => (a.col - b.col) || (a.carril - b.carril));
    const cxy = p => ({ x: gx + p.col * CW + CW / 2, y: TOP + p.carril * LH + LH / 2 - 8 });
    const SW = 146, SHh = 52;
    for (let i = 0; i < ord.length - 1; i++){
      const a = cxy(ord[i]), b = cxy(ord[i + 1]);
      if (ord[i].col === ord[i + 1].col && ord[i].carril !== ord[i + 1].carril){
        const dir = b.y > a.y ? 1 : -1;
        s += arrow(T, a.x, a.y + dir * SHh / 2, b.x, b.y - dir * (SHh / 2 + 3), { stroke:T.p2, sw:1.5, accent:true });
      } else if (ord[i].col !== ord[i + 1].col){
        s += elbow(T, a.x + SW / 2, a.y, b.x - SW / 2 - 3, b.y, { stroke:T.p2, sw:1.5, accent:true });
      }
    }

    /* pasos */
    M.pasos.forEach(p => {
      const c = cxy(p);
      const dec = p.tipo === 'decision';
      s += shapePath(T, p.tipo, c.x, c.y, SW, SHh, {
        fill: p.tipo === 'inicio' ? (T.mode === 'ui' ? 'rgba(18,179,166,.14)' : '#E6F7F5') : T.box,
        stroke: p.tipo === 'decision' ? T.p3 : T.p1, sw:1.5 });
      s += field(T, c.x - (dec ? SW / 2 - 22 : SW / 2 - 9), c.y - 17, (dec ? SW - 44 : SW - 18), 34, {
        v:p.v, bind:p.bind, ph:SIM_L(p.tipo), ml:true, fs:11, fw:600, color:T.tx, align:'center' });
      if (T.mode === 'ui'){
        const by = c.y + SHh / 2 + 3, bx = c.x - SW / 2;
        s += fo(bx, by, 62, 18,
          '<select' + p.tipoBind + ' title="Símbolo del paso" style="width:100%;height:100%;font-size:9.5px;' +
          'font-family:inherit;border:1px solid var(--bd);border-radius:4px;background:var(--d3);color:var(--tx2);' +
          'padding:0 2px;cursor:pointer">' +
          SIM.map(x => '<option value="' + esc(x.k) + '"' + (x.k === p.tipo ? ' selected="selected"' : '') + '>' +
            esc(x.l) + '</option>').join('') + '</select>', { pad:'0' });
        s += btn(T, bx + 66, by, 18, '←', p.izq, 'Mover a la columna anterior');
        s += btn(T, bx + 86, by, 18, '→', p.der, 'Mover a la columna siguiente');
        s += btn(T, bx + 106, by, 18, '↑', p.arr, 'Subir de carril');
        s += btn(T, bx + 126, by, 18, '↓', p.aba, 'Bajar de carril');
        s += btn(T, c.x + SW / 2 - 6, c.y - SHh / 2 - 8, 16, '✕', p.del, 'Quitar paso', 'bad');
      }
    });

    /* celdas vacías: botón para crear un paso ahí mismo */
    if (T.mode === 'ui'){
      const ocupada = {};
      M.pasos.forEach(p => { ocupada[p.carril + ':' + p.col] = 1; });
      for (let i = 0; i < nL; i++){
        for (let c = 0; c < nC; c++){
          if (ocupada[i + ':' + c]) continue;
          s += btn(T, gx + c * CW + CW / 2 - 10, TOP + i * LH + LH / 2 - 18, 20, '＋',
                   M.nuevo(i, c), 'Agregar un paso aquí');
        }
      }
    }

    /* TIME LINE / DISTANCE / METRICS */
    M.filas.forEach((f, i) => {
      const y = TOP + nL * LH + i * FH;
      s += rect(X0, y, LW, FH, 0, { fill:T.p4, stroke:T.bd, sw:1 });
      s += label(X0 + 12, y + FH / 2 + 4, f.l, { color:'#FFFFFF', fs:10.5, ls:1 });
      f.celdas.forEach((cd, c) => {
        s += rect(gx + c * CW, y, CW, FH, 0, { fill:T.box, stroke:T.bd, sw:.8 });
        s += field(T, gx + c * CW + 8, y + 6, CW - 16, FH - 12, {
          v:cd.v, bind:cd.bind, fs:11, fw:600, color:T.tx2, align:'center' });
      });
    });
    return svgWrap(T, W, H, s);
  }

  /* --------------------------------------------------------------- CTQ */
  function dCtq(M, T){
    const NW = 252, HG = 66, VG = 14, X0 = 26, Y0 = 66;
    const root = { kids: M.necs, v:'', bind:null };
    const hOf = nd => boxH(nd.v, NW - 34, 11.5, 56, 4, 14);
    const lay = layoutTree(root, NW, HG, VG, X0 - (NW + HG), Y0, hOf);   // el raíz virtual queda fuera
    const W = X0 * 2 + 3 * NW + 2 * HG;
    const H = Math.max(220, Y0 + lay.h + 34);
    const HEAD = ['NECESIDAD DEL CLIENTE (VOC)', 'CONDUCTORES DE CALIDAD', 'REQUISITOS DE CALIDAD (CTQ)'];
    let s = '';
    HEAD.forEach((h, i) => {
      const x = X0 + i * (NW + HG);
      s += rect(x, 26, NW, 28, 6, { fill: i === 2 ? T.p2 : i === 1 ? T.p1 : T.p4 });
      s += label(x + NW / 2, 44, h, { color:'#FFFFFF', fs:10.5, ls:.8, align:'center' });
    });
    (function draw(nd, lvl){
      A(nd.kids).forEach(k => {
        if (lvl >= 0) s += elbow(T, nd.x + NW, nd.y + nd.h / 2, k.x - 2, k.y + k.h / 2, { stroke:T.line, sw:1.2 });
        draw(k, lvl + 1);
      });
      if (lvl < 0) return;
      const NH = nd.h, col = lvl === 2 ? T.p2 : lvl === 1 ? T.p1 : T.p4;
      s += rect(nd.x, nd.y, NW, NH, 8, { fill:T.box, stroke:T.bd, sw:1.1 });
      s += rect(nd.x, nd.y, 5, NH, 2, { fill:col });
      s += field(T, nd.x + 13, nd.y + 5, NW - (nd.del ? 44 : 26), NH - 10, {
        v:nd.v, bind:nd.bind, ml:true, fs:11.5, fw:600, color:T.tx,
        ph: lvl === 0 ? 'Necesidad del cliente' : lvl === 1 ? 'Conductor de calidad' : 'Requisito medible (CTQ)' });
      if (nd.add && lvl < 2) s += btn(T, nd.x + NW - 12, nd.y + NH / 2 - 10, 20, '＋', nd.add,
        lvl === 0 ? 'Agregar conductor' : 'Agregar requisito CTQ', 'ok');
      if (nd.del) s += btn(T, nd.x + NW - 12, nd.y - 9, 18, '✕', nd.del, 'Quitar', 'bad');
    })(root, -1);
    return svgWrap(T, W, H, s);
  }

  /* -------------------------------------------------------- FLUJOGRAMA */
  function dFlow(M, T){
    const BW = 300, BH = 58, VG = 34, X0 = 40, Y0 = 34;
    const n = Math.max(1, M.pasos.length);
    const W = X0 + BW + 150;
    const H = Y0 + n * (BH + VG) + 30;
    const cx = X0 + BW / 2;
    let s = '';
    M.pasos.forEach((p, i) => {
      const cy = Y0 + i * (BH + VG) + BH / 2;
      if (i) s += arrow(T, cx, cy - BH / 2 - VG + 4, cx, cy - BH / 2 - 4, { stroke:T.p2, sw:1.8, accent:true });
      s += shapePath(T, p.tipo, cx, cy, BW, BH, {
        fill: p.tipo === 'inicio' ? (T.mode === 'ui' ? 'rgba(18,179,166,.14)' : '#E6F7F5') : T.box,
        stroke: p.tipo === 'decision' ? T.p3 : T.p1, sw:1.5 });
      const dec = p.tipo === 'decision';
      s += field(T, cx - (dec ? BW / 4 : BW / 2 - 14), cy - 19, (dec ? BW / 2 : BW - 28), 38, {
        v:p.v, bind:p.bind, ph:SIM_L(p.tipo), ml:true, fs:12, fw:600, color:T.tx, align:'center' });
      if (T.mode === 'ui'){
        const bx = X0 + BW + 12;
        s += fo(bx, cy - 9, 74, 18,
          '<select' + p.tipoBind + ' title="Símbolo" style="width:100%;height:100%;font-size:9.5px;font-family:inherit;' +
          'border:1px solid var(--bd);border-radius:4px;background:var(--d3);color:var(--tx2);padding:0 2px;cursor:pointer">' +
          SIM.map(x => '<option value="' + esc(x.k) + '"' + (x.k === p.tipo ? ' selected="selected"' : '') + '>' +
            esc(x.l) + '</option>').join('') + '</select>', { pad:'0' });
        s += btn(T, bx + 80, cy - 9, 18, '↑', p.sube, 'Subir');
        s += btn(T, bx + 100, cy - 9, 18, '↓', p.baja, 'Bajar');
        s += btn(T, bx + 120, cy - 9, 18, '✕', p.del, 'Quitar paso', 'bad');
      }
    });
    return svgWrap(T, W, H, s);
  }

  const DRAW = { ishikawa:dIshikawa, fivewhy:dFivewhy, tree:dTree, sipoc:dSipoc,
                 affinity:dAffinity, swimlane:dSwimlane, ctq:dCtq, flow:dFlow };

  /* ======================================================================
     5 · API PÚBLICA
     ==================================================================== */
  const AYUDA = {
    ishikawa:'Escribe el problema en la cabeza del pescado y agrega causas con ＋ en cada espina.',
    fivewhy:'Cada «Why» debe ser la causa del anterior; marca SI cuando haya que confirmarlo con datos.',
    tree:'＋ agrega una causa hija · ★ marca el nodo como CAUSA RAÍZ · ✕ elimina el nodo y sus hijos.',
    sipoc:'Escribe de derecha a izquierda: primero PROCESS, luego OUTPUTS y CUSTOMERS.',
    swimlane:'Haz clic en ＋ dentro de una celda vacía para crear un paso; las flechas se dibujan solas.',
    affinity:'Cambia la categoría de una tarjeta con el selector inferior: se mueve de columna sola.',
    ctq:'Cada necesidad se traduce en conductores y cada conductor en un requisito medible (CTQ).',
    flow:'Agrega pasos y elige el símbolo del flujograma en cada uno.'
  };

  function build(kind, o){
    const f = MODEL[kind];
    if (!f) return null;
    return f(o);
  }

  function render(b, t, d, ctx){
    const kind = b.kind, key = b.key || b.kind;
    const tid = t ? t.id : '';
    if (!MODEL[kind] || !DRAW[kind])
      return R.card(b.title, '<div class="note bad">Diagrama no soportado: ' + esc(String(kind)) + '</div>');
    const M = safe(() => build(kind, { b:b, t:t, d:d, ctx:ctx || ctxOf(), key:key, toolId:tid }), null);
    if (!M) return R.card(b.title, '<div class="note bad">No se pudo construir el diagrama.</div>');
    const T = theme('ui');
    const dib = safe(() => DRAW[kind](M, T), '');
    const id = tid + '|' + key;

    let tb = '';
    A(M.tools).forEach(x => {
      tb += '<button class="btn xs g" type="button"' + (x.ti ? ' title="' + esc(x.ti) + '"' : '') + x.a + '>' +
        esc(x.l) + '</button>';
    });
    tb += '<div class="spacer" style="flex:1"></div>' +
      '<button class="btn xs g" type="button" data-dgzoom="' + esc(id) + '|-" title="Reducir">−</button>' +
      '<button class="btn xs g" type="button" data-dgzoom="' + esc(id) + '|0" title="Ajustar al ancho">100%</button>' +
      '<button class="btn xs g" type="button" data-dgzoom="' + esc(id) + '|+" title="Ampliar">＋</button>';

    const body =
      '<div class="dg-tb">' + tb + '</div>' +
      '<div class="dg-wrap" data-dgm="' + esc(id) + '" style="padding:10px">' + dib + '</div>' +
      (M.aviso ? '<div class="note warn" style="margin:10px 12px 0">' + esc(M.aviso) + '</div>' : '') +
      '<div class="hint" style="padding:8px 12px 10px;color:var(--tx3);font-size:11.5px">' +
        esc(AYUDA[kind] || '') + '</div>';

    return R.card(b.title, body, { tight:true,
      tools:'<button class="btn xs g" type="button" data-dgpng="' + esc(kind + '|' + key + '|' + tid) +
            '" title="Descargar el diagrama como imagen">⤓ PNG</button>' });
  }

  function svg(kind, d, key, opts){
    const o = opts || {};
    if (!MODEL[kind] || !DRAW[kind]) return '';
    const fb = (o.block && o.tool) ? { b:o.block, t:o.tool } : findBlock(kind, key);
    const tid = o.toolId || (fb && fb.t ? fb.t.id : '');
    const dd = d || (tid ? dataOf(tid) : {});
    const M = safe(() => build(kind, { b: fb ? fb.b : null, t: fb ? fb.t : null, d:dd,
                                       ctx:ctxOf(), key: key || kind, toolId:tid }), null);
    if (!M) return '';
    const T = theme('print');
    return safe(() => DRAW[kind](M, T), '');
  }

  /* ---- volcado a texto indentado (hoja de Excel) ---------------------- */
  function toText(kind, d, key){
    const fb = findBlock(kind, key);
    const tid = fb && fb.t ? fb.t.id : '';
    const M = safe(() => build(kind, { b: fb ? fb.b : null, t: fb ? fb.t : null, d:d || {},
                                       ctx:ctxOf(), key: key || kind, toolId:tid }), null);
    if (!M) return '';
    const L = [];
    const P = (n, s) => { if (T2(s) !== '') L.push('   '.repeat(n) + s); };
    if (kind === 'ishikawa'){
      P(0, 'PROBLEMA: ' + M.head.v);
      M.branches.forEach(br => {
        P(0, UP(br.nombre));
        A(br.causas).forEach(c => { P(1, '• ' + c.v);
          A(c.subs).forEach(s => P(2, '- ' + s.v)); });
      });
    } else if (kind === 'fivewhy'){
      P(0, 'PROBLEM: ' + M.problema.v);
      M.whys.forEach(w => {
        P(1, 'Why ' + w.n + ': ' + w.txt.v);
        if (T2(w.conf.v)) P(2, 'Is confirmation necessary?: ' + w.conf.v);
        if (T2(w.como.v)) P(2, 'How is this confirmed: ' + w.como.v);
      });
      P(0, 'ROOT CAUSE: ' + M.root.v);
    } else if (kind === 'tree' || kind === 'ctq'){
      const walk = (nd, lv) => {
        P(lv, (nd.raiz ? '★ ' : lv ? '• ' : '') + nd.v);
        A(nd.kids).forEach(k => walk(k, lv + 1));
      };
      if (kind === 'tree') walk(M.root, 0);
      else M.necs.forEach(nd => walk(nd, 0));
    } else if (kind === 'sipoc'){
      M.cols.forEach(c => { P(0, c.letra + ' — ' + c.l);
        c.cards.forEach(cd => { if (!cd.nuevo) P(1, '• ' + cd.v); }); });
    } else if (kind === 'affinity'){
      M.grupos.forEach(g => { P(0, UP(g.nombre));
        g.ideas.forEach(i => P(1, '• ' + i.v)); });
    } else if (kind === 'swimlane'){
      M.carriles.forEach((c, i) => {
        P(0, UP(c.nombre));
        M.pasos.filter(p => p.carril === i).sort((a, b) => a.col - b.col)
          .forEach(p => P(1, (p.col + 1) + '. [' + SIM_L(p.tipo) + '] ' + p.v));
      });
      M.filas.forEach(f => P(0, f.l + ': ' + f.celdas.map(c => c.v).filter(Boolean).join(' | ')));
    } else if (kind === 'flow'){
      M.pasos.forEach((p, i) => P(0, (i + 1) + '. [' + SIM_L(p.tipo) + '] ' + p.v));
    }
    return L.join('\n');
  }

  /* ---- escritura en el modelo propio ---------------------------------- */
  function set(toolId, key, ruta, valor){
    if (typeof ST === 'undefined' || !toolId || !key) return;
    const d = ST.d(toolId);
    if (!d[key] || typeof d[key] !== 'object') d[key] = {};
    setIn(d[key], ruta, valor);
    ST.touch();
  }
  function setPath(spec, valor){
    const s = String(spec || '');
    const i = s.indexOf('|'); if (i < 0) return;
    const j = s.indexOf('|', i + 1); if (j < 0) return;
    set(s.slice(0, i), s.slice(i + 1, j), s.slice(j + 1), valor);
  }

  /* ---- escritura desde los enlaces data-dg* --------------------------- */
  function writeFrom(el){
    if (!el || !el.getAttribute) return false;
    const val = (el.type === 'checkbox') ? el.checked : el.value;
    const dg = el.getAttribute('data-diag');
    if (dg){ setPath(dg, val); mirror('[data-diag="' + q(dg) + '"]', el, val); return true; }
    const tid = el.getAttribute('data-dgt');
    if (!tid || typeof ST === 'undefined') return false;
    const d = ST.d(tid);
    const f = el.getAttribute('data-dgf');
    if (f){
      d[f] = val; ST.touch();
      mirror('[data-t="' + q(tid) + '"][data-f="' + q(f) + '"],[data-dgt="' + q(tid) + '"][data-dgf="' + q(f) + '"]', el, val);
      return true;
    }
    const g = el.getAttribute('data-dgg');
    if (g){
      const r = Math.round(num(el.getAttribute('data-dgr'))), c = el.getAttribute('data-dgc');
      const rows = rowsFor(d, g);
      /* la tarjeta puede apuntar a una fila que todavía no existe (hueco libre
         al final de una columna): se crea al escribir. */
      if (r >= rows.length && r < rows.length + 40 && r < gridMax(tid, g))
        while (rows.length <= r) rows.push({ _id: (typeof uid === 'function' ? uid() : 'x' + (++SEQ)) });
      if (rows[r]){
        rows[r][c] = val; ST.touch();
        mirror('[data-t="' + q(tid) + '"][data-g="' + q(g) + '"][data-r="' + r + '"][data-c="' + q(c) + '"],' +
               '[data-dgt="' + q(tid) + '"][data-dgg="' + q(g) + '"][data-dgr="' + r + '"][data-dgc="' + q(c) + '"]',
               el, val);
      }
      return true;
    }
    return false;
  }
  /** refleja el valor en las demás cajas enlazadas al mismo dato (sin redibujar) */
  function mirror(sel, el, val){
    let list = [];
    try { list = $$(sel); } catch(e){ return; }
    list.forEach(x => { if (x !== el && x.value !== val) x.value = val; });
  }

  /* ---- PNG ------------------------------------------------------------ */
  function toPNGBlob(markup, scale){
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const w = img.width || 1200, h = img.height || 800, k = scale || 2;
        const c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        const x = c.getContext('2d');
        x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, c.width, c.height);
        x.scale(k, k); x.drawImage(img, 0, 0);
        try { c.toBlob(b => b ? res(b) : rej(new Error('canvas')), 'image/png'); }
        catch(e){ rej(e); }
      };
      img.onerror = () => rej(new Error('svg'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
    });
  }
  async function png(kind, d, key, scale){
    const markup = svg(kind, d, key, { });
    if (!markup) return null;
    const blob = await toPNGBlob(markup, scale || 2);
    return await new Promise(r => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result);
      fr.onerror = () => r(null);
      fr.readAsDataURL(blob);
    });
  }

  /* ---- zoom por lienzo ------------------------------------------------ */
  const ZOOM = {};
  function applyZoom(root){
    $$('.dg-wrap[data-dgm]', root || document).forEach(w => {
      const id = w.getAttribute('data-dgm'), sv = w.querySelector('svg');
      if (!sv) return;
      const z = ZOOM[id];
      const nat = num(sv.getAttribute('data-w')) || 1000;
      if (!z){ sv.style.width = ''; sv.style.maxWidth = '100%'; }
      else { sv.style.maxWidth = 'none'; sv.style.width = Math.round(nat * z) + 'px'; }
    });
  }

  /* ======================================================================
     6 · EVENTOS
     ==================================================================== */
  let BOUND = false;
  function bind(root){
    applyZoom(root);
    if (BOUND) return;
    BOUND = true;

    document.addEventListener('click', e => {
      const t = e.target;
      if (!t || !t.closest) return;
      let el;
      if ((el = t.closest('[data-dga]'))){
        e.preventDefault();
        run(el.getAttribute('data-dga'));
        return;
      }
      if ((el = t.closest('[data-dgzoom]'))){
        e.preventDefault();
        const p = String(el.getAttribute('data-dgzoom')).split('|');
        const id = p[0], op = p[1];
        const cur = ZOOM[id] || 1;
        ZOOM[id] = op === '+' ? Math.min(2.5, cur + 0.2) : op === '-' ? Math.max(0.4, cur - 0.2) : 0;
        applyZoom(document);
        return;
      }
      if ((el = t.closest('[data-dgpng]'))){
        e.preventDefault();
        const p = String(el.getAttribute('data-dgpng')).split('|');
        const kind = p[0], key = p[1], tid = p[2];
        const markup = svg(kind, dataOf(tid), key, {});
        if (!markup){ if (typeof toast === 'function') toast('No hay nada que exportar todavía', 'warn'); return; }
        toPNGBlob(markup, 2).then(b => {
          if (typeof download === 'function') download(b, 'diagrama_' + kind + '.png');
        }).catch(() => { if (typeof toast === 'function') toast('No se pudo generar el PNG', 'bad'); });
        return;
      }
    });

    /* escritura en vivo: no redibuja (para no perder el cursor) */
    document.addEventListener('input', e => {
      const el = e.target;
      if (!el || !el.getAttribute) return;
      if (!el.getAttribute('data-diag') && !el.getAttribute('data-dgt')) return;
      writeFrom(el);
    });
    /* al confirmar (blur / select) sí se redibuja cuando el cambio mueve cosas */
    document.addEventListener('change', e => {
      const el = e.target;
      if (!el || !el.getAttribute) return;
      if (!el.getAttribute('data-diag') && !el.getAttribute('data-dgt')) return;
      writeFrom(el);
      if (el.tagName === 'SELECT' || el.getAttribute('data-dgre')) setTimeout(repaint, 0);
    });
  }

  return {
    render: render,
    svg: svg,
    bind: bind,
    set: set,
    setPath: setPath,
    toText: toText,
    png: png,
    model: build,
    kinds: Object.keys(DRAW)
  };
})();
