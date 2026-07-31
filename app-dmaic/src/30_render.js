/* ============================================================================
   RENDERER GENÉRICO DE BLOQUES
   ========================================================================== */
'use strict';

const R = {};

/* utilidades internas ------------------------------------------------- */
function callv(v, a, b, c, d, e){ return typeof v === 'function' ? v(a, b, c, d, e) : v; }
function rowsOf(d, key, min){
  if (!Array.isArray(d[key])) d[key] = [];
  const m = min || 0;
  while (d[key].length < m) d[key].push({ _id: uid() });
  d[key].forEach(r => { if (!r._id) r._id = uid(); });
  return d[key];
}
/** Construye el control de entrada.
 *  `ro` = la celda es calculada/solo lectura: se dibuja SIEMPRE como texto,
 *  porque el valor ya viene formateado en español ("1.234,5", "87,4%") y un
 *  <input type=number> rechazaría esa cadena y quedaría en blanco. */
function inputTag(cls, spec, val, attrs, ro){
  if (ro && spec.input !== 'textarea' && spec.input !== 'check')
    spec = Object.assign({}, spec, { input:'text' });
  const t = spec.input || 'text';
  const a = (attrs || '') + (spec.ph ? ' placeholder="' + esc(spec.ph) + '"' : '');
  if (t === 'textarea')
    return '<textarea class="' + cls + '" rows="' + (spec.rows || 3) + '"' + a + '>' + esc(val) + '</textarea>';
  if (t === 'select'){
    const os = callv(spec.opts) || [];
    return '<select class="' + cls + '"' + a + '><option value=""></option>' +
      os.map(o => { const v = (o && o.v !== undefined) ? o.v : o, l = (o && o.l !== undefined) ? o.l : o;
        return '<option value="' + esc(v) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') +
      '</select>';
  }
  if (t === 'check')
    return '<input type="checkbox" class="' + cls + '"' + (val ? ' checked' : '') + a + '>';
  if (t === 'color')
    return '<input type="color" class="' + cls + '" value="' + esc(val || '#12B3A6') + '"' + a + '>';
  const numish = (t === 'number' || t === 'money' || t === 'percent');
  return '<input type="' + (t === 'date' ? 'date' : numish ? 'number' : 'text') + '"' +
    (numish ? ' step="' + (spec.step || 'any') + '"' + (spec.min !== undefined ? ' min="' + spec.min + '"' : '') : '') +
    ' class="' + cls + (numish ? ' num' : '') + '" value="' + esc(val) + '"' + a + '>';
}

/* ---------------------------------------------------------------- CARD */
R.card = (title, body, extra) =>
  '<div class="card"' + (extra && extra.id ? ' id="' + extra.id + '"' : '') + '>' +
  (title ? '<div class="card-h"><h3>' + esc(title) + '</h3><div class="spacer"></div>' +
    ((extra && extra.tools) || '') + '</div>' : '') +
  '<div class="card-b' + (extra && extra.tight ? ' tight' : '') + '">' + body + '</div></div>';

/* -------------------------------------------------------------- BLOQUES */
R.block = function(b, t, d, ctx, idx){
  const fn = R['b_' + b.type];
  if (!fn){ return '<div class="note bad">Bloque desconocido: ' + esc(b.type) + '</div>'; }
  try { return fn(b, t, d, ctx, idx); }
  catch(e){ console.error('bloque', b.type, t.id, e);
    return '<div class="note bad">Error al dibujar «' + esc(b.title || b.type) + '»: ' + esc(e.message) + '</div>'; }
};

/* ----- fields ----- */
R.b_fields = function(b, t, d, ctx){
  const cols = b.cols || 2;
  const items = callv(b.items, d, ctx) || [];
  const inner = '<div class="fgrid" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' +
    items.map(f => {
      if (f.when && !f.when(d, ctx)) return '';
      const w = Math.min(f.w || 1, cols);
      const ro = !!f.ro || !!f.calc;
      let val = d[f.k];
      if (f.calc){ const r = f.calc(d, ctx); val = (typeof r === 'number' && !isFinite(r)) ? '' : (f.fmt ? fmt(r, f.fmt) : r); }
      else if (f.fmt && f.input !== 'date' && document.activeElement && document.activeElement.dataset &&
               document.activeElement.dataset.f === f.k) { /* no formatear mientras edita */ }
      const attrs = ' data-t="' + t.id + '" data-f="' + f.k + '"' + (ro ? ' readonly data-calc="1"' : '') +
        (f.input === 'select' && ro ? ' disabled' : '');
      const body = f.input === 'check'
        ? '<div class="chkw">' + inputTag('', f, d[f.k], attrs) + '<span>' + esc(f.label) + '</span></div>'
        : '<label>' + esc(f.label) + (f.req ? ' <span class="req">*</span>' : '') + '</label>' +
          inputTag('inp', f, val == null ? '' : val, attrs, ro) +
          (f.unit ? '<span class="unit">' + esc(f.unit) + '</span>' : '') +
          (f.hint ? '<div class="hint">' + esc(f.hint) + '</div>' : '');
      return '<div class="fld" style="grid-column:span ' + w + '">' + body + '</div>';
    }).join('') + '</div>';
  return b.bare ? inner : R.card(b.title, inner);
};

/* ----- grid ----- */
R.b_grid = function(b, t, d, ctx){
  const rows = rowsOf(d, b.key, b.min || 0);
  const cols = callv(b.cols, d, ctx) || [];
  let order = rows.map((r, i) => i);
  if (b.sortBy){
    const dir = b.sortDir === 'asc' ? 1 : -1;
    order.sort((x, y) => (num(rows[x][b.sortBy]) - num(rows[y][b.sortBy])) * dir);
  }
  // valores calculados (para databars y footer)
  const calcVal = (r, i) => {
    const o = {};
    cols.forEach(c => { o[c.k] = c.calc ? c.calc(r, i, rows, d, ctx) : r[c.k]; });
    return o;
  };
  const computed = rows.map(calcVal);
  const maxes = {};
  cols.forEach(c => { if (c.databar) maxes[c.k] = Math.max.apply(null, [1e-9].concat(computed.map(v => Math.abs(num(v[c.k]))))); });

  let h = '<div class="twrap"><table class="gt"><thead><tr><th class="rn"></th>' +
    cols.map(c => '<th' + (c.align === 'right' || c.input === 'number' || c.calc ? ' class="n"' : '') +
      (c.w ? ' style="min-width:' + (typeof c.w === 'number' ? c.w + 'px' : c.w) + '"' : '') +
      (c.help ? ' title="' + esc(c.help) + '"' : '') + '>' + esc(c.label) + '</th>').join('') +
    (b.fixed ? '' : '<th style="width:28px"></th>') + '</tr></thead><tbody>';

  order.forEach(i => {
    const r = rows[i], cv = computed[i];
    h += '<tr' + (b.rowStyle ? ' class="' + esc(b.rowStyle(r, i, rows, d, ctx) || '') + '"' : '') + '>' +
      '<td class="rn">' + (i + 1) + '</td>';
    cols.forEach(c => {
      const ro = !!c.calc || !!c.ro;
      let v = cv[c.k];
      if (ro) v = (typeof v === 'number' && !isFinite(v)) ? '' : (c.fmt ? fmt(v, c.fmt) : (v == null ? '' : v));
      const tone = c.tone ? (c.tone(cv[c.k], r, i, rows, d, ctx) || '') : '';
      const attrs = ' data-t="' + t.id + '" data-g="' + b.key + '" data-r="' + i + '" data-c="' + c.k + '"' +
        (ro ? ' readonly data-calc="1"' : '');
      let inner = inputTag('ci', c, v == null ? '' : v, attrs, ro);
      if (c.databar){
        const w = clamp(Math.abs(num(cv[c.k])) / maxes[c.k] * 100, 0, 100);
        inner = '<div class="databar"><i class="dbf" style="width:' + w.toFixed(1) + '%"></i>' + inner + '</div>';
      }
      h += '<td' + (tone ? ' class="cell-' + tone + '"' : '') + '>' + inner + '</td>';
    });
    if (!b.fixed) h += '<td><span class="rowdel" data-delrow="' + t.id + '|' + b.key + '|' + i + '" title="Eliminar fila">✕</span></td>';
    h += '</tr>';
  });
  h += '</tbody>';

  if (b.foot){
    const fs = callv(b.foot, rows, d, ctx) || [];
    h += '<tfoot><tr><td class="rn"></td>';
    cols.forEach((c, ci) => {
      const f = fs.find(x => x.k === c.k);
      if (f) h += '<td>' + esc(f.label !== undefined && ci === 0 ? f.label : fmt(f.calc(rows, d, ctx, computed), f.fmt)) + '</td>';
      else if (ci === 0) { const lb = fs.find(x => x.k === '__label'); h += '<td class="lbl">' + esc(lb ? lb.label : 'TOTAL') + '</td>'; }
      else h += '<td></td>';
    });
    if (!b.fixed) h += '<td></td>';
    h += '</tr></tfoot>';
  }
  h += '</table></div>';

  if (!b.fixed){
    h += '<div class="gt-bar"><button class="btn sm p" data-addrow="' + t.id + '|' + b.key + '">＋ ' +
      esc(b.addLabel || 'Agregar fila') + '</button>' +
      '<button class="btn sm g" data-addrow5="' + t.id + '|' + b.key + '">+5</button>' +
      '<div class="spacer"></div><span class="muted" style="font-size:11.5px">' + rows.length + ' fila(s)' +
      (b.max ? ' · máx ' + b.max : '') + '</span></div>';
  }
  return R.card(b.title, h, { tight:true, tools: b.tools || '' });
};

/* ----- matrix ----- */
R.b_matrix = function(b, t, d, ctx){
  if (!d[b.key]) d[b.key] = {};
  const M = d[b.key];
  const rws = callv(b.rows, d, ctx) || [], cls = callv(b.cols, d, ctx) || [];
  let h = '<div class="twrap"><table class="gt"><thead><tr><th></th>' +
    cls.map(c => '<th' + (c.align === 'right' ? ' class="n"' : '') + '>' + esc(c.label) + '</th>').join('') +
    '</tr></thead><tbody>';
  rws.forEach(rw => {
    const rk = rw.k !== undefined ? rw.k : rw, rl = rw.l !== undefined ? rw.l : rw;
    h += '<tr><td class="rn" style="width:auto;text-align:left;padding:6px 9px;font-weight:800;color:var(--tx2);font-size:11.5px;letter-spacing:.04em">' + esc(rl) + '</td>';
    cls.forEach(c => {
      const key = rk + '.' + c.k;
      const cf = b.calc && b.calc[key];
      let v = cf ? cf(M, d, ctx) : M[key];
      const ro = !!cf || c.ro;
      if (ro) v = (typeof v === 'number' && !isFinite(v)) ? '' : (c.fmt ? fmt(v, c.fmt) : v);
      h += '<td>' + inputTag('ci', c, v == null ? '' : v,
        ' data-t="' + t.id + '" data-m="' + b.key + '" data-mk="' + key + '"' +
        (ro ? ' readonly data-calc="1"' : ''), ro) + '</td>';
    });
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  return R.card(b.title, h, { tight:true });
};

/* ----- cards (KPI) ----- */
R.b_cards = function(b, t, d, ctx){
  const items = callv(b.items, d, ctx) || [];
  if (!items.length) return '';
  const inner = '<div class="kpis">' + items.map(k =>
    '<div class="kpi ' + (k.tone || '') + '"><div class="k-l">' + esc(k.label) + '</div>' +
    '<div class="k-v">' + esc(k.value) + '</div>' +
    (k.hint ? '<div class="k-h">' + esc(k.hint) + '</div>' : '') + '</div>').join('') + '</div>';
  return b.bare ? inner : R.card(b.title, inner);
};

/* ----- note ----- */
R.b_note = function(b, t, d, ctx){
  const txt = callv(b.text, d, ctx);
  if (!txt) return '';
  return '<div class="note ' + (b.tone || '') + '">' + (b.raw ? txt : esc(txt)) + '</div>';
};

/* ----- html (escape hatch) ----- */
R.b_html = function(b, t, d, ctx){
  const s = callv(b.render, d, ctx) || '';
  return b.title ? R.card(b.title, s, { tight: b.tight }) : s;
};

/* ----- chart ----- */
R.b_chart = function(b, t, d, ctx){
  let data;
  try { data = callv(b.data, d, ctx) || {}; }
  catch(e){ return R.card(b.title, '<div class="empty">Sin datos suficientes</div>'); }
  const svg = CHART.draw(b.kind, data, { h: b.h || 320, title: b.chartTitle });
  return R.card(b.title, '<div class="dg-wrap" data-chart="' + t.id + '|' + (b.key || b.kind) + '">' + svg + '</div>',
    { tools:'<button class="btn xs g" data-pngchart="' + t.id + '|' + (b.key || b.kind) + '">⤓ PNG</button>' });
};

/* ----- upload ----- */
R.b_upload = function(b, t, d, ctx){
  const v = d[b.k];
  const inner = '<div class="upz" style="height:' + (b.h || 220) + 'px" data-up="' + t.id + '|' + b.k + '">' +
    (v ? '<img src="' + v + '"><span class="rm" data-uprm="' + t.id + '|' + b.k + '">✕ quitar</span>'
       : '<div><div style="font-size:26px;opacity:.5">🖼️</div>' + esc(b.ph || 'Clic para subir imagen · o arrastra el archivo') + '</div>') +
    '</div>';
  return b.bare ? inner : R.card(b.label || b.title, inner);
};

/* ----- insight (motor de análisis) ----- */
R.b_insight = function(b, t, d, ctx){
  const list = (typeof ENGINE !== 'undefined') ? ENGINE.forTool(t, d, ctx) : [];
  if (!list || !list.length) return '';
  return '<div class="ins" style="margin-bottom:16px"><div class="ins-h">🧠 Interpretación y sugerencia de decisión</div>' +
    '<div class="ins-b">' + list.map(i =>
      '<div class="ins-item"><span class="ins-ic">' + (i.icon || '•') + '</span>' +
      '<span style="flex:1">' + (i.raw ? i.text : esc(i.text)) + '</span>' +
      '<span class="ins-sev sev-' + (i.sev || 'baja') + '">' + esc(i.sev || 'info') + '</span></div>').join('') +
    '</div></div>';
};

/* ----- a3 ----- */
R.b_a3 = function(b, t, d, ctx){
  const areas = callv(b.areas, d, ctx) || [];
  const cols = b.cols || 2;
  let h = '<div class="a3" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">';
  areas.forEach(a => {
    const span = Math.min(a.w || 1, cols);
    h += '<div class="a3-a" style="grid-column:span ' + span + (a.rows ? ';grid-row:span ' + a.rows : '') + '">' +
      '<div class="h">' + esc(a.label) + '</div><div class="b" style="min-height:' + (a.h || 110) + 'px">';
    if (a.kind === 'image'){
      const v = d[a.k];
      h += '<div class="upz" style="height:' + ((a.h || 110) - 16) + 'px" data-up="' + t.id + '|' + a.k + '">' +
        (v ? '<img src="' + v + '"><span class="rm" data-uprm="' + t.id + '|' + a.k + '">✕</span>' : '＋ imagen') + '</div>';
    } else if (a.kind === 'ref'){
      h += '<div data-a3ref="' + esc(a.ref) + '" style="font-size:12px">' + A3REF(a.ref, ctx, a) + '</div>';
    } else {
      h += '<textarea data-t="' + t.id + '" data-f="' + a.k + '" placeholder="' + esc(a.ph || '') + '" ' +
        'style="min-height:' + ((a.h || 110) - 18) + 'px">' + esc(d[a.k] || '') + '</textarea>';
    }
    h += '</div></div>';
  });
  h += '</div>';
  return R.card(b.title, h);
};

/** Incrusta en vivo el contenido de otra herramienta dentro de un A3 */
function A3REF(ref, ctx, a){
  const t = TOOL_BY_ID[ref];
  if (!t) return '<span class="muted">—</span>';
  const d = ST.d(ref);
  // busca el primer bloque graficable
  const cb = (t.blocks || []).find(b => b.type === 'chart');
  if (cb){
    try {
      const data = callv(cb.data, d, ctx) || {};
      return CHART.draw(cb.kind, data, { h: (a && a.h ? a.h - 30 : 150), compact:true });
    } catch(e){}
  }
  // si no, resumen textual
  const txt = summarize(t, d);
  return txt ? '<div style="font-size:12px;line-height:1.55;white-space:pre-wrap">' + esc(txt) + '</div>'
             : '<span class="muted">Sin datos en «' + esc(t.title) + '»</span>';
}
function summarize(t, d){
  const parts = [];
  (t.blocks || []).forEach(b => {
    if (b.type === 'fields') (callv(b.items, d, {}) || []).forEach(f => {
      if (!f.calc && d[f.k]) parts.push(f.label + ': ' + d[f.k]); });
    if (b.type === 'a3') (callv(b.areas, d, {}) || []).forEach(a => { if (a.kind !== 'image' && d[a.k]) parts.push(d[a.k]); });
    if (b.type === 'grid'){
      const rs = arr(d[b.key]).filter(hasContent);
      if (rs.length) parts.push(b.title ? (b.title + ': ' + rs.length + ' registro(s)') : (rs.length + ' registro(s)'));
    }
  });
  return parts.slice(0, 8).join('\n');
}

/* ----- diagram (delegado a DIAG) ----- */
R.b_diagram = function(b, t, d, ctx){
  return DIAG.render(b, t, d, ctx);
};

/* =========================================================== TOOL PAGE */
R.tool = function(t){
  const d = ST.d(t.id), ctx = ST.ctx(), m = MOD_BY_ID[t.mod];
  const soloLectura = !!m.guia;                       // los capítulos del manual no se editan
  const list0 = TOOLS.filter(x => x.mod === t.mod);
  let h = '<div class="page-h"><div style="flex:1">' +
    '<div class="crumb">' + esc(m.name) +
      (soloLectura ? ' · capítulo ' + (list0.findIndex(x => x.id === t.id) + 1) + ' de ' + list0.length
                   : ' · ' + m.n + '/5') + '</div>' +
    '<h1>' + esc(t.title) + '</h1>' +
    (t.desc ? '<div class="sub">' + esc(t.desc) + '</div>' : '') + '</div>' +
    '<div style="display:flex;gap:8px;align-items:center">' +
    (enPlantilla(t) ? '<span class="xlref" title="Hoja del Excel original">' + esc(t.sheet) + '</span>'
      : t.extra && !soloLectura ? '<span class="pill" title="Herramienta del manual, no existe como hoja del Excel">del manual</span>' : '') +
    (t.guide && t.guide.length ? '<button class="btn sm g" data-guide="' + t.id + '">? Ayuda</button>' : '') +
    (soloLectura ? '' : '<button class="btn sm g" data-cleartool="' + t.id + '">Limpiar</button>') +
    '</div></div>';
  // Cada bloque va en su propio contenedor para poder refrescar SÓLO los
  // derivados (gráficos, KPIs, interpretación) sin tocar los campos que el
  // usuario está escribiendo. Redibujar el formulario entero le robaba el foco
  // y se perdían las pulsaciones.
  h += '<div id="toolbody">';
  (t.blocks || []).forEach((b, i) => {
    h += '<div data-blk="' + i + '">' + R.block(b, t, d, ctx, i) + '</div>';
  });
  h += '</div>';
  // navegación anterior/siguiente (los capítulos del manual circulan entre ellos)
  const list = soloLectura ? list0
    : TOOLS.filter(x => ST.modOn(x.mod) && !MOD_BY_ID[x.mod].guia);
  const i = list.findIndex(x => x.id === t.id);
  h += '<div style="display:flex;gap:10px;margin-top:22px">' +
    (i > 0 ? '<button class="btn g" data-goto="' + list[i-1].id + '">← ' + esc(list[i-1].title) + '</button>' : '') +
    '<div class="spacer"></div>' +
    (i < list.length - 1 ? '<button class="btn p" data-goto="' + list[i+1].id + '">' + esc(list[i+1].title) + ' →</button>' : '') +
    '</div>';
  return h;
};
