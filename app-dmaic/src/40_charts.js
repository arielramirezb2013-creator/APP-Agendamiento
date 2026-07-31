/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC · MOTOR DE GRÁFICOS
   SVG puro: sin librerías, sin CDN, sin red. Tema claro/oscuro con variables CSS.

   API pública
     CHART.draw(kind, data, opts) -> string con el <svg> completo
     CHART.toPNG(svgElement|markup, escala) -> Promise<Blob>
     CHART.palette -> colores de la marca
     CHART.kinds   -> tipos disponibles:
        line · lineTarget · bar · hbar · stacked · pareto · beforeAfter · gantt
        control · histogram · pie · scatter · radar · waterfall · boxplot

   opts = { h:number, w:number, title:string, compact:boolean }
   Si no hay datos suficientes devuelve '<div class="empty">…</div>'.
   ========================================================================== */
'use strict';

const CHART = (function(){

  const NS = 'http://www.w3.org/2000/svg';

  /* ----------------------------------------------------------- paleta */
  /* paleta CATEGÓRICA: tonos consecutivos bien separados (series múltiples) */
  /* Paleta categórica de marca: arranca en el índigo Rehavid y se separa en
     tono, no sólo en claridad, para que las series sigan distinguiéndose
     impresas en escala de grises. */
  const PAL = ['#3B26D3', '#0FA968', '#E8890C', '#6B4DE8', '#0E9E8F', '#C2318F',
               '#8577F5', '#5C7CE0', '#B06A00', '#0A7BA8', '#7A3FD1', '#2A1AA6'];
  /* colores de MARCA con rol fijo (no dependen del orden de la paleta) */
  const BR = { p1:'#3B26D3', p2:'#6B4DE8', p3:'#0FE17B' };
  const TONES = { ok:'#0A9E5C', warn:'#C97A06', bad:'#D92D46', info:'#3B26D3',
                  p1:'#3B26D3', p2:'#6B4DE8', p3:'#0FE17B', '':null };
  /* variables del tema que se resuelven al exportar a PNG */
  const VARS = ['--tx', '--tx2', '--tx3', '--bd', '--bd2', '--d', '--d2', '--d3', '--d4',
                '--ok', '--warn', '--bad', '--info', '--br-1', '--br-2', '--br-3'];

  /* estilos (en atributo style: las variables CSS NO se sustituyen en los
     atributos de presentación de SVG, sólo en declaraciones CSS reales) */
  const S_TX   = 'fill:var(--tx,#171043)';
  const S_AX   = 'fill:var(--tx2,#544D80)';
  const S_AX3  = 'fill:var(--tx3,#8B85AE)';
  const S_GRID = 'stroke:var(--bd,rgba(59,38,211,.16))';
  const S_LINE = 'stroke:var(--tx3,#8B85AE)';
  const S_BG2  = 'fill:var(--d3,#182A31)';
  const S_BG   = 'fill:var(--d2,#132025)';

  const FONT = 'Segoe UI,system-ui,-apple-system,Helvetica Neue,Arial,sans-serif';

  const CSS =
    '<style data-anim="1">' +
    '.cx text{user-select:none;-webkit-user-select:none}' +
    '.cx .an{animation:cxfade .45s ease-out both}' +
    '.cx .gw{animation:cxgrow .5s cubic-bezier(.22,.85,.3,1) both;' +
      'transform-box:fill-box;transform-origin:bottom}' +
    '.cx .gwl{animation:cxgrowl .5s cubic-bezier(.22,.85,.3,1) both;' +
      'transform-box:fill-box;transform-origin:left}' +
    '.cx .hit{transition:opacity .15s}.cx .hit:hover{opacity:.78}' +
    '@keyframes cxfade{from{opacity:0}to{opacity:1}}' +
    '@keyframes cxgrow{from{opacity:.25;transform:scaleY(.02)}to{opacity:1;transform:none}}' +
    '@keyframes cxgrowl{from{opacity:.25;transform:scaleX(.02)}to{opacity:1;transform:none}}' +
    '</style>';

  const MES3 = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

  /* =========================================================== utilidades */
  const ar   = v => (Array.isArray(v) ? v : []);
  const str  = v => (v === null || v === undefined ? '' : String(v));
  const r2   = v => { const n = Math.round(num(v) * 100) / 100; return isFinite(n) ? n : 0; };
  const nul  = v => (v === null || v === undefined || v === '' || !isFinite(num(v))) ? null : num(v);
  const tw   = (s, size) => str(s).length * (size || 11) * 0.56;
  const ell  = (s, n) => { const t = str(s); return t.length > n ? t.slice(0, Math.max(1, n - 1)) + '…' : t; };
  const toneC = t => (t && TONES[t]) || null;
  const dly  = i => 'animation-delay:' + Math.min(0.5, i * 0.03).toFixed(2) + 's';
  /* y de una etiqueta de valor colocada ENCIMA de un punto/barra, sin salirse */
  const vyUp   = (g, y, size, off) => Math.max(g.y + size * 0.9, y - (off === undefined ? 8 : off));
  /* … y colocada DEBAJO (valores negativos) */
  const vyDown = (g, y, size, off) => Math.min(g.y + g.h - 2, y + size + (off === undefined ? 2 : off));
  /* centra un texto sin que se salga del lienzo */
  const cxFit = (x, s, size, W) => {
    const h = tw(s, size) / 2 + 3;
    return clamp(x, h, Math.max(h, W - h));
  };

  function tag(name, a, inner){
    let s = '<' + name;
    if (a) for (const k in a){
      const v = a[k];
      if (v === null || v === undefined || v === false || v === '') continue;
      s += ' ' + k + '="' + esc(v) + '"';
    }
    return (inner === undefined || inner === null) ? s + '/>' : s + '>' + inner + '</' + name + '>';
  }
  const tip = s => (str(s) ? '<title>' + esc(str(s)) + '</title>' : '');

  /** texto; o = {anchor, dy, size, bold, style, rot, op, cls, tip} */
  function T(x, y, s, o){
    o = o || {};
    return tag('text', {
      x: r2(x), y: r2(y),
      'text-anchor': o.anchor || null,
      'dominant-baseline': o.dy || null,
      'font-size': o.size || 11,
      'font-weight': o.bold ? 700 : (o.weight || null),
      style: o.style || S_AX,
      opacity: o.op || null,
      class: o.cls || null,
      transform: o.rot ? ('rotate(' + o.rot + ' ' + r2(x) + ' ' + r2(y) + ')') : null
    }, esc(str(s)) + tip(o.tip));
  }
  function LN(x1, y1, x2, y2, style, a){
    const at = { x1:r2(x1), y1:r2(y1), x2:r2(x2), y2:r2(y2), style: style || S_GRID };
    if (a) for (const k in a) at[k] = a[k];
    const inner = at.__in; delete at.__in;
    return tag('line', at, inner);
  }
  /** color de texto legible sobre un fondo dado */
  function ink(hex){
    const h = str(hex).replace('#', '');
    if (h.length < 6) return '#0E1518';
    const r = parseInt(h.slice(0, 2), 16), v = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * v + 0.114 * b) > 150 ? '#0E1518' : '#FFFFFF';
  }
  function RC(x, y, w, h, a){
    const at = { x:r2(x), y:r2(y), width:r2(Math.max(0, w)), height:r2(Math.max(0, h)) };
    if (a) for (const k in a) at[k] = a[k];
    const inner = at.__in; delete at.__in;
    return tag('rect', at, inner);
  }
  function PT(dd, a){
    const at = { d: dd, fill:'none' };
    if (a) for (const k in a) at[k] = a[k];
    const inner = at.__in; delete at.__in;
    return tag('path', at, inner);
  }
  function CI(cx, cy, r, a){
    const at = { cx:r2(cx), cy:r2(cy), r:r2(r) };
    if (a) for (const k in a) at[k] = a[k];
    const inner = at.__in; delete at.__in;
    return tag('circle', at, inner);
  }

  /* ------------------------------------------------------ números bonitos */
  function niceNum(x, redondear){
    if (!(x > 0)) return 1;
    const e = Math.floor(Math.log(x) / Math.LN10);
    const f = x / Math.pow(10, e);
    let nf;
    if (redondear) nf = f < 1.5 ? 1 : (f < 3 ? 2 : (f < 7 ? 5 : 10));
    else           nf = f <= 1 ? 1 : (f <= 2 ? 2 : (f <= 5 ? 5 : 10));
    return nf * Math.pow(10, e);
  }
  /** escala con ticks legibles (algoritmo "nice numbers" de Heckbert) */
  function scaleOf(mn, mx, n){
    n = Math.max(2, n || 5);
    mn = isFinite(mn) ? mn : 0; mx = isFinite(mx) ? mx : 1;
    if (mn > mx){ const t = mn; mn = mx; mx = t; }
    if (mn === mx){
      if (mn === 0){ mn = 0; mx = 1; }
      else { const p = Math.abs(mn) * 0.12; mn -= p; mx += p; }
    }
    const rango = niceNum(mx - mn, false);
    const step  = niceNum(rango / (n - 1), true);
    const lo = Math.floor(mn / step) * step;
    const hi = Math.ceil(mx / step) * step;
    const ticks = [];
    for (let i = 0; i <= Math.round((hi - lo) / step) + 0.5 && ticks.length < 60; i++)
      ticks.push(round(lo + i * step, 10));
    const sc = { min: lo, max: hi, step: step, ticks: ticks };
    sc.big = Math.max(Math.abs(sc.min), Math.abs(sc.max));
    return sc;
  }
  /** Bordes de clase del histograma: paso redondeado SIN inflar el rango
   *  (scaleOf agranda el dominio y se comería la mitad de las clases). */
  function binEdges(mn, mx, k){
    k = clamp(k, 3, 30);
    if (!(mx > mn)){ mn = mn - 0.5; mx = mx + 0.5; }
    let step = niceNum((mx - mn) / k, true);
    if (!(step > 0)) step = 1;
    let lo = Math.floor(mn / step) * step, hi = Math.ceil(mx / step) * step;
    let n = Math.round((hi - lo) / step);
    /* si el redondeo dejó muy pocas clases, se afina el paso */
    let guard = 0;
    while (n < Math.max(3, Math.round(k * 0.6)) && guard++ < 4){
      step = step / 2;
      lo = Math.floor(mn / step) * step; hi = Math.ceil(mx / step) * step;
      n = Math.round((hi - lo) / step);
    }
    const e = [];
    for (let i = 0; i <= n && e.length < 64; i++) e.push(round(lo + i * step, 10));
    return { edges: e, step: step, min: lo, max: hi, big: Math.max(Math.abs(lo), Math.abs(hi)) };
  }
  function decOf(step){
    const s = Math.abs(num(step));
    if (!(s > 0) || s >= 1) return 0;
    return Math.min(4, Math.max(0, Math.ceil(-Math.log(s) / Math.LN10)));
  }
  function axFmt(v, step, big){
    if (!isFinite(v)) return '';
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (big >= 1e7) return fmt(v / 1e6, a >= 1e6 ? 'n1' : 'n2') + ' M';
    if (big >= 2e4) return fmt(v / 1e3, 'n0') + ' k';
    return fmt(v, 'n' + Math.min(3, decOf(step)));
  }
  /** formateador de valores según d.fmt / d.unit */
  function mkFmt(d, sc){
    const f = d && d.fmt, u = d && d.unit ? ' ' + str(d.unit) : '';
    if (f && /^p/.test(f))            return v => fmt(v, f);
    if (f === 'money' || f === 'money2') return v => '$ ' + axFmt(v, sc.step, sc.big);
    if (f)                            return v => fmt(v, f) + u;
    return v => axFmt(v, sc.step, sc.big) + u;
  }

  /* ------------------------------------------------------------ layout */
  function dims(opts){
    opts = opts || {};
    const compact = !!opts.compact;
    const W = Math.max(240, num(opts.w) || (compact ? 520 : 880));
    const H = Math.max(compact ? 120 : 170, num(opts.h) || 320);
    return { W: W, H: H, compact: compact, size: compact ? 9.5 : 10.5 };
  }
  function yWidth(sc, size, f){
    let w = 0;
    sc.ticks.forEach(v => { w = Math.max(w, tw(f ? f(v) : axFmt(v, sc.step, sc.big), size)); });
    return Math.min(w, 96);
  }
  /** decide rotación / salto / recorte de las etiquetas del eje X */
  /** Parte una etiqueta en renglones que quepan en `w` px, hasta `max` líneas.
   *  Devuelve null si ni partiéndola cabe (entonces habrá que rotarla). */
  function wrapLbl(s, w, size, max){
    const t = str(s).trim();
    if (!t) return [''];
    if (tw(t, size) <= w) return [t];
    const pal = t.split(/\s+/), out = [];
    let cur = '';
    for (let i = 0; i < pal.length; i++){
      const p = pal[i];
      const trial = cur ? cur + ' ' + p : p;
      if (tw(trial, size) <= w){ cur = trial; continue; }
      if (cur) out.push(cur);
      // una palabra suelta más ancha que el hueco: no hay reparto posible
      if (tw(p, size) > w) return null;
      cur = p;
      if (out.length >= max) return null;
    }
    if (cur) out.push(cur);
    return out.length <= max ? out : null;
  }

  function planX(labels, w, size, compact){
    const n = Math.max(1, labels.length);
    const slot = w / n;
    const capRot = Math.max(6, Math.floor((compact ? 62 : 112) / (size * 0.56)));
    let cap = compact ? 16 : 30, maxw = 0;
    labels.forEach(l => { maxw = Math.max(maxw, tw(ell(l, cap), size)); });
    if (maxw <= slot - 5)
      return { rot:0, every: Math.max(1, Math.ceil((maxw + 6) / Math.max(1, slot))), cap:cap, h: size + 13 };

    /* Antes de rotar y recortar: intentar repartir la etiqueta en renglones.
       Se lee mucho mejor horizontal y completa que en diagonal y cortada. */
    const maxLin = compact ? 2 : 3;
    const anchoTxt = Math.max(28, slot - 8);
    if (anchoTxt >= 34){
      const lineas = [];
      let ok = true, alto = 1;
      for (let i = 0; i < labels.length; i++){
        if (!str(labels[i])){ lineas.push(['']); continue; }
        const L = wrapLbl(labels[i], anchoTxt, size, maxLin);
        if (!L){ ok = false; break; }
        lineas.push(L); alto = Math.max(alto, L.length);
      }
      if (ok) return { rot:0, every:1, cap:200, wrap:lineas, ancho:anchoTxt,
                       h: alto * (size + 3) + 12 };
    }

    cap = capRot; maxw = 0;
    labels.forEach(l => { maxw = Math.max(maxw, tw(ell(l, cap), size)); });
    const every = slot >= 12 ? 1 : Math.ceil(12 / Math.max(1, slot));
    return { rot:-38, every:every, cap:cap, h: maxw * 0.62 + 14 };
  }
  /** Ajusta los márgenes laterales para que NINGUNA etiqueta del eje X quede
   *  cortada por el viewBox (las rotadas se derraman hacia abajo-izquierda y
   *  las horizontales de las series de puntos sobresalen media etiqueta). */
  function xPlan(L, size, compact, mlBase, mrBase, W, banda){
    const n = Math.max(1, L.length);
    /* margen izquierdo mínimo: NINGUNA etiqueta rotada puede salirse por la
       izquierda; la que manda no es siempre la primera, porque las etiquetas
       largas se derraman ~0,79·ancho hacia la izquierda de su propio tick. */
    const needL = (px, ml, mr) => {
      const w0 = Math.max(1, W - ml - mr);
      const paso = banda ? w0 / n : (n > 1 ? w0 / (n - 1) : w0);
      const off0 = banda ? paso / 2 : 0;
      let need = 0;
      for (let i = 0; i < L.length; i++){
        const off = off0 + i * paso;
        if (off > 260) break;                       // más allá ya nada desborda
        if (px.every > 1 && (i % px.every)) continue;
        if (!str(L[i])) continue;
        const req = 0.79 * tw(ell(L[i], px.cap), size) + 8 - off;
        if (req > need) need = req;
      }
      return need;
    };
    const ajusta = (px, ml, mr) => {
      if (px.rot) return [Math.min(Math.max(ml, needL(px, ml, mr)), W * 0.45), mrBase];
      if (!banda){
        const half = t => tw(ell(t, px.cap), size) / 2 + 5;
        return [Math.min(Math.max(ml, half(L[0])), W * 0.32),
                Math.min(Math.max(mr, half(L[L.length - 1])), W * 0.32)];
      }
      return [ml, mr];
    };
    let ml = mlBase, mr = mrBase;
    let px = planX(L, W - ml - mr, size, compact);
    for (let k = 0; k < 2; k++){
      const a = ajusta(px, ml, mr); ml = a[0]; mr = a[1];
      px = planX(L, W - ml - mr, size, compact);
    }
    /* dos pasadas finales YA con el px definitivo (px no se recalcula después) */
    for (let k = 0; k < 2; k++){ const a = ajusta(px, ml, mr); ml = a[0]; mr = a[1]; }
    return { ml: ml, mr: mr, px: px };
  }
  function xLabels(g, labels, xs, px, size){
    let s = '';
    labels.forEach((l, i) => {
      if (px.every > 1 && (i % px.every)) return;
      if (!str(l)) return;
      const x = xs[i];
      if (px.rot) s += T(x - 2, g.y + g.h + 10, ell(l, px.cap),
                         { anchor:'end', rot:px.rot, size:size, style:S_AX, dy:'middle', tip:l });
      else if (px.wrap){
        // etiqueta horizontal repartida en renglones centrados bajo su tick
        (px.wrap[i] || ['']).forEach((ln, j) =>
          s += T(x, g.y + g.h + size + 5 + j * (size + 3), ln,
                 { anchor:'middle', size:size, style:S_AX, tip:l }));
      }
      else        s += T(x, g.y + g.h + size + 5, ell(l, px.cap),
                         { anchor:'middle', size:size, style:S_AX, tip:l });
    });
    return s;
  }
  function yGrid(g, sc, size, f, o){
    o = o || {};
    let s = '';
    const H = sc.max - sc.min || 1;
    sc.ticks.forEach(v => {
      const y = g.y + g.h - (v - sc.min) / H * g.h;
      if (y < g.y - 0.5 || y > g.y + g.h + 0.5) return;
      s += LN(g.x, y, g.x + g.w, y, S_GRID, { opacity: v === 0 ? 0.9 : 0.4 });
      if (!o.noLabels) s += T(g.x - 7, y, f ? f(v) : axFmt(v, sc.step, sc.big),
                              { anchor:'end', dy:'middle', size:size, style:S_AX });
    });
    return s;
  }
  function axisFrame(g){
    return LN(g.x, g.y, g.x, g.y + g.h, S_LINE, { opacity:0.45 }) +
           LN(g.x, g.y + g.h, g.x + g.w, g.y + g.h, S_LINE, { opacity:0.45 });
  }
  function caption(opts, d, W, size){
    const t = (opts && opts.title) || (d && d.title) || '';
    return t ? T(10, 14, ell(t, Math.floor(W / (size * 0.62))),
                 { size: size + 1, bold:true, style:S_TX, tip:t }) : '';
  }
  function yTitle(g, s, size){
    if (!str(s)) return '';
    const x = 12, y = g.y + g.h / 2;
    return T(x, y, ell(s, Math.floor(g.h / (size * 0.6))),
             { anchor:'middle', size:size, style:S_AX3,
               rot: -90, dy:'middle', tip:s });
  }

  /* ------------------------------------------------------------ leyenda */
  /** Ancho de texto sensible a las mayúsculas: el factor 0,56 de tw() vale para
   *  texto mixto, pero los rótulos de leyenda van en versales y se quedaban
   *  cortos, de modo que una entrada se montaba sobre la siguiente. */
  function twCaps(s, size){
    const t = str(s);
    let u = 0;
    for (let i = 0; i < t.length; i++){
      const c = t.charAt(i);
      u += c === ' ' ? 0.30
         : (c >= 'A' && c <= 'Z') || c === 'Ñ' || c === '%' || c === 'Á' || c === 'É' ||
           c === 'Í' || c === 'Ó' || c === 'Ú' ? 0.68
         : 0.55;
    }
    return u * (size || 11);
  }

  function legendLay(items, w, size){
    const box = 12, gap = 20;
    const rows = [[]];
    let rw = 0;
    items.forEach(it => {
      const iw = box + 6 + twCaps(it.name, size) + gap;
      if (rw + iw > w && rows[rows.length - 1].length){ rows.push([]); rw = 0; }
      rows[rows.length - 1].push({ it: it, w: iw }); rw += iw;
    });
    return { rows: rows, h: rows.length * (size + 7), gap: gap, box: box, size: size };
  }
  function legendDraw(lay, x, y, w){
    let s = '', yy = y + lay.size / 2;
    lay.rows.forEach(rr => {
      const total = rr.reduce((a, b) => a + b.w, 0) - lay.gap;
      let xx = x + Math.max(0, (w - total) / 2);
      rr.forEach(e => {
        const it = e.it;
        if (it.shape === 'line')
          s += LN(xx, yy, xx + lay.box, yy, 'stroke:' + it.color,
                  { 'stroke-width':2.6, 'stroke-linecap':'round', 'stroke-dasharray': it.dash || null });
        else if (it.shape === 'dot')
          s += CI(xx + lay.box / 2, yy, 4.2, { fill: it.color });
        else
          s += RC(xx, yy - 5, lay.box, 10, { rx:2.5, fill: it.color, opacity: it.op || null });
        s += T(xx + lay.box + 6, yy, it.name, { size: lay.size, dy:'middle', style:S_AX, tip: it.tip || it.name });
        xx += e.w;
      });
      yy += lay.size + 7;
    });
    return s;
  }

  /* ------------------------------------------------------------- lienzo */
  function svgWrap(W, H, inner){
    return '<svg xmlns="' + NS + '" viewBox="0 0 ' + r2(W) + ' ' + r2(H) + '"' +
      ' width="100%" height="' + r2(H) + '" preserveAspectRatio="xMidYMid meet"' +
      ' class="cx" role="img" font-family="' + FONT + '" style="display:block;max-width:100%">' +
      CSS + inner + '</svg>';
  }
  function empty(msg){
    return '<div class="empty"><div class="ic">📊</div>' +
      esc(msg || 'Sin datos suficientes para graficar') + '</div>';
  }

  /* ----------------------------------------------------- normalizadores */
  function labelsOf(d, n){
    const l = ar(d.labels).map(str);
    while (l.length < n) l.push(String(l.length + 1));
    return l.slice(0, Math.max(n, 0) || l.length);
  }
  function seriesOf(d){
    let S = ar(d.series).slice();
    if (!S.length && Array.isArray(d.values)) S = [{ name: d.name || d.serie || 'Serie', values: d.values }];
    return S.map((s, i) => ({
      name:   str(s.name || s.label || ('Serie ' + (i + 1))),
      values: ar(s.values).map(nul),
      color:  s.color || (toneC(s.tone)) || PAL[i % PAL.length],
      dash:   s.dash || null
    })).filter(s => s.values.length);
  }
  function rangeOf(seriesList, forzarCero){
    let mn = Infinity, mx = -Infinity;
    seriesList.forEach(s => s.values.forEach(v => {
      if (v === null) return;
      if (v < mn) mn = v; if (v > mx) mx = v;
    }));
    if (!isFinite(mn)){ mn = 0; mx = 1; }
    if (forzarCero){ mn = Math.min(0, mn); mx = Math.max(0, mx); }
    return [mn, mx];
  }

  /* ======================================================== TIPOS (K) === */
  const K = {};

  /* ------------------------------------------------------------- line */
  K.line = function(d, opts){
    const D = dims(opts), size = D.size;
    const SS = seriesOf(d);
    if (!SS.length) return empty();
    const n = SS.reduce((a, s) => Math.max(a, s.values.length), 0);
    if (!n || !SS.some(s => s.values.some(v => v !== null))) return empty();
    const L = labelsOf(d, n);
    const rg = rangeOf(SS, false);
    const sc = scaleOf(rg[0], rg[1], D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);

    const yl = str(d.yLabel || d.ylabel || '');
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const items = SS.length > 1 ? SS.map(s => ({ name:s.name, color:s.color, shape:'line', dash:s.dash })) : [];
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf) + (yl ? 16 : 0), 16, D.W, false);
    const mt = 12 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const lay = items.length ? legendLay(items, D.W - ml - mr, size) : { rows:[], h:0 };
    const mb = px.h + lay.h + 6;
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - mb) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const xs = n > 1 ? L.map((_, i) => g.x + i * g.w / (n - 1)) : [g.x + g.w / 2];

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g) + yTitle(g, yl, size);
    s += xLabels(g, L, xs, px, size);

    SS.forEach((se, k) => {
      let p = '', open = false;
      se.values.forEach((v, i) => {
        if (v === null || i >= xs.length){ open = false; return; }
        p += (open ? 'L' : 'M') + r2(xs[i]) + ' ' + r2(Y(v)) + ' '; open = true;
      });
      if (p) s += PT(p.trim(), { stroke: se.color, 'stroke-width': D.compact ? 1.8 : 2.4,
        'stroke-linejoin':'round', 'stroke-linecap':'round',
        'stroke-dasharray': se.dash || null, class:'an', style: dly(k) });
      if (n <= 45) se.values.forEach((v, i) => {
        if (v === null || i >= xs.length) return;
        s += CI(xs[i], Y(v), D.compact ? 2.4 : 3.4, { fill: se.color, class:'an hit',
          __in: tip((SS.length > 1 ? se.name + ' · ' : '') + L[i] + ': ' + vf(v)) });
      });
      if (SS.length === 1 && n <= 12 && !D.compact)
        se.values.forEach((v, i) => { if (v === null || i >= xs.length) return;
          const et = vf(v);
          s += T(cxFit(xs[i], et, size - 0.5, D.W), vyUp(g, Y(v), size, 9), et,
                 { anchor:'middle', size: size - 0.5, style:S_AX, cls:'an' }); });
    });
    if (lay.h) s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* ------------------------------------------------------- lineTarget */
  K.lineTarget = function(d, opts){
    const D = dims(opts), size = D.size;
    const V = ar(d.values).map(nul);
    if (!V.length || !V.some(v => v !== null)) return empty();
    const n = V.length, L = labelsOf(d, n);
    const tgtArr = Array.isArray(d.target) ? d.target.map(nul) : null;
    const tgt = tgtArr ? null : nul(d.target);
    const mean = nul(d.mean) !== null ? nul(d.mean) : (V.filter(v => v !== null).reduce((a, b) => a + b, 0) /
                 Math.max(1, V.filter(v => v !== null).length));

    const pool = [{ values:V }];
    if (tgtArr) pool.push({ values: tgtArr });
    if (tgt !== null) pool.push({ values:[tgt] });
    if (mean !== null && isFinite(mean)) pool.push({ values:[mean] });
    const rg = rangeOf(pool, false);
    const sc = scaleOf(rg[0], rg[1], D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);

    const yl = str(d.yLabel || d.ylabel || '');
    const items = [{ name:'SERIE', color:BR.p2, shape:'line' }];
    if (tgt !== null || tgtArr) items.push({ name:'OBJETIVO (TARGET)', color:TONES.warn, shape:'line', dash:'7 4' });
    if (isFinite(mean)) items.push({ name:'PROMEDIO (MEAN)', color:TONES.info, shape:'line', dash:'2 4' });

    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf) + (yl ? 16 : 0), 16, D.W, false);
    const mt = 12 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const lay = legendLay(items, D.W - ml - mr, size);
    const mb = px.h + lay.h + 6;
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - mb) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const xs = n > 1 ? L.map((_, i) => g.x + i * g.w / (n - 1)) : [g.x + g.w / 2];

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g) + yTitle(g, yl, size);
    s += xLabels(g, L, xs, px, size);

    if (isFinite(mean))
      s += LN(g.x, Y(mean), g.x + g.w, Y(mean), 'stroke:' + TONES.info,
              { 'stroke-width':1.6, 'stroke-dasharray':'2 4', opacity:.9, class:'an',
                __in: tip('PROMEDIO: ' + vf(mean)) });
    if (tgt !== null)
      s += LN(g.x, Y(tgt), g.x + g.w, Y(tgt), 'stroke:' + TONES.warn,
              { 'stroke-width':2, 'stroke-dasharray':'7 4', class:'an',
                __in: tip('OBJETIVO: ' + vf(tgt)) });
    if (tgtArr){
      let p = '', open = false;
      tgtArr.forEach((v, i) => { if (v === null || i >= xs.length){ open = false; return; }
        p += (open ? 'L' : 'M') + r2(xs[i]) + ' ' + r2(Y(v)) + ' '; open = true; });
      if (p) s += PT(p.trim(), { stroke:TONES.warn, 'stroke-width':2, 'stroke-dasharray':'7 4', class:'an' });
    }
    let p = '', open = false;
    V.forEach((v, i) => { if (v === null){ open = false; return; }
      p += (open ? 'L' : 'M') + r2(xs[i]) + ' ' + r2(Y(v)) + ' '; open = true; });
    if (p) s += PT(p.trim(), { stroke:BR.p2, 'stroke-width': D.compact ? 1.9 : 2.6,
      'stroke-linejoin':'round', 'stroke-linecap':'round', class:'an' });
    V.forEach((v, i) => { if (v === null) return;
      const fuera = (tgt !== null) && ((d.menorMejor ? v > tgt : v < tgt));
      s += CI(xs[i], Y(v), D.compact ? 2.6 : 3.6, { fill: fuera ? TONES.warn : BR.p2, class:'an hit',
        __in: tip(L[i] + ': ' + vf(v) + (tgt !== null ? ' · objetivo ' + vf(tgt) : '')) });
    });
    if (n <= 12 && !D.compact)
      V.forEach((v, i) => { if (v === null) return;
        const et = vf(v);
        s += T(cxFit(xs[i], et, size - 0.5, D.W), vyUp(g, Y(v), size, 9), et,
               { anchor:'middle', size:size - 0.5, style:S_AX, cls:'an' }); });
    s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* -------------------------------------------------------------- bar */
  K.bar = function(d, opts){
    const D = dims(opts), size = D.size;
    const V = ar(d.values).map(nul);
    if (!V.length || !V.some(v => v !== null)) return empty();
    const n = V.length, L = labelsOf(d, n);
    const rg = rangeOf([{ values:V }], true);
    const sc = scaleOf(rg[0], rg[1], D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);
    const cols = ar(d.colors), tns = ar(d.tones);

    const yl = str(d.yLabel || d.ylabel || '');
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf) + (yl ? 16 : 0), 16, D.W, true);
    const mt = 16 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - px.h - 8) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const slot = g.w / n, bw = Math.min(slot * 0.68, 64);
    const xs = V.map((_, i) => g.x + (i + 0.5) * slot);
    const y0 = Y(0);

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g) + yTitle(g, yl, size);
    V.forEach((v, i) => {
      if (v === null) return;
      const c = cols[i] || toneC(tns[i]) || d.color || BR.p2;
      const y = Y(v), top = Math.min(y, y0), h = Math.abs(y0 - y);
      s += RC(xs[i] - bw / 2, top, bw, Math.max(1, h), { rx: Math.min(4, bw / 4), fill: c,
        class:'gw hit', style: dly(i), __in: tip(L[i] + ': ' + vf(v)) });
      if (n <= 16 && !D.compact){
        const et = vf(v);
        s += T(cxFit(xs[i], et, size, D.W), v >= 0 ? vyUp(g, top, size, 6) : vyDown(g, top + h, size), et,
               { anchor:'middle', size:size, style:S_TX, cls:'an' });
      }
    });
    s += xLabels(g, L, xs, px, size);
    return svgWrap(D.W, D.H, s);
  };

  /* ------------------------------------------------------------- hbar */
  K.hbar = function(d, opts){
    const D = dims(opts), size = D.size;
    const V = ar(d.values).map(nul);
    if (!V.length || !V.some(v => v !== null)) return empty();
    const n = V.length, L = labelsOf(d, n);
    const rg = rangeOf([{ values:V }], true);
    const sc = scaleOf(rg[0], rg[1], D.compact ? 3 : 5);
    const vf = mkFmt(d, sc);
    const cols = ar(d.colors), tns = ar(d.tones);

    const capN = Math.max(6, Math.floor((D.W * 0.34) / (size * 0.56)));
    let nw = 0; L.forEach(l => { nw = Math.max(nw, tw(ell(l, capN), size)); });
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    let vw = 0; V.forEach(v => { if (v !== null) vw = Math.max(vw, tw(vf(v), size)); });
    const ml = Math.min(D.W * 0.42, nw + 12), mr = clamp(vw + 14, 40, D.W * 0.3),
          mt = 12 + cap, mb = size + 16;
    const rowH = Math.max(14, Math.min(38, (D.H - mt - mb) / n));
    const H = Math.max(D.H, mt + mb + rowH * n);
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: rowH * n };
    const X = v => g.x + (v - sc.min) / (sc.max - sc.min || 1) * g.w;
    const bh = Math.min(rowH * 0.62, 22);

    let s = caption(opts, d, D.W, size);
    sc.ticks.forEach(v => {
      const x = X(v);
      s += LN(x, g.y, x, g.y + g.h, S_GRID, { opacity: v === 0 ? 0.9 : 0.4 });
      s += T(x, g.y + g.h + size + 4, vf(v), { anchor:'middle', size:size, style:S_AX });
    });
    s += LN(X(Math.max(sc.min, 0)), g.y, X(Math.max(sc.min, 0)), g.y + g.h, S_LINE, { opacity:.45 });
    const x0 = X(Math.max(sc.min, Math.min(sc.max, 0)));
    V.forEach((v, i) => {
      const cy = g.y + (i + 0.5) * rowH;
      s += T(g.x - 8, cy, ell(L[i], capN), { anchor:'end', dy:'middle', size:size, style:S_AX, tip:L[i] });
      if (v === null) return;
      const x = X(v), left = Math.min(x, x0), w = Math.abs(x - x0);
      const c = cols[i] || toneC(tns[i]) || d.color || PAL[i % PAL.length];
      s += RC(left, cy - bh / 2, Math.max(1, w), bh, { rx: Math.min(4, bh / 3), fill: c,
        class:'gwl hit', style: dly(i), __in: tip(L[i] + ': ' + vf(v)) });
      s += T(v >= 0 ? left + w + 6 : left - 6, cy, vf(v),
             { anchor: v >= 0 ? 'start' : 'end', dy:'middle', size:size, style:S_TX, cls:'an' });
    });
    return svgWrap(D.W, H, s);
  };

  /* ---------------------------------------------------------- stacked */
  K.stacked = function(d, opts){
    const D = dims(opts), size = D.size;
    const SS = seriesOf(d);
    if (!SS.length) return empty();
    const n = SS.reduce((a, s) => Math.max(a, s.values.length), 0);
    if (!n) return empty();
    const L = labelsOf(d, n);
    let mx = 0, mn = 0;
    for (let i = 0; i < n; i++){
      let pos = 0, neg = 0;
      SS.forEach(s => { const v = s.values[i]; if (v === null) return; if (v >= 0) pos += v; else neg += v; });
      mx = Math.max(mx, pos); mn = Math.min(mn, neg);
    }
    if (mx === 0 && mn === 0) return empty();
    const sc = scaleOf(mn, mx, D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);
    const items = SS.map(s => ({ name:s.name, color:s.color }));
    const yl = str(d.yLabel || d.ylabel || '');
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf) + (yl ? 16 : 0), 16, D.W, true);
    const mt = 14 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const lay = legendLay(items, D.W - ml - mr, size);
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - px.h - lay.h - 8) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const slot = g.w / n, bw = Math.min(slot * 0.7, 70);
    const xs = L.map((_, i) => g.x + (i + 0.5) * slot);

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g) + yTitle(g, yl, size);
    for (let i = 0; i < n; i++){
      let accP = 0, accN = 0;
      SS.forEach((se, k) => {
        const v = se.values[i]; if (v === null || v === 0) return;
        let y1, y2;
        if (v >= 0){ y1 = Y(accP + v); y2 = Y(accP); accP += v; }
        else { y1 = Y(accN); y2 = Y(accN + v); accN += v; }
        s += RC(xs[i] - bw / 2, Math.min(y1, y2), bw, Math.max(1, Math.abs(y2 - y1)),
          { fill: se.color, class:'an hit', style: dly(k), __in: tip(L[i] + ' · ' + se.name + ': ' + vf(v)) });
      });
    }
    s += xLabels(g, L, xs, px, size);
    s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* ----------------------------------------------------------- pareto */
  K.pareto = function(d, opts){
    const D = dims(opts), size = D.size;
    let items = ar(d.labels).map((l, i) => ({ l: str(l), v: num(ar(d.values)[i]) }))
      .filter(x => isFinite(x.v) && x.v > 0);
    if (!items.length) return empty('Sin datos para el Pareto: registra categorías con frecuencia > 0');
    items.sort((a, b) => b.v - a.v);                 // el Pareto SIEMPRE va descendente
    const total = items.reduce((a, b) => a + b.v, 0);
    let ac = 0;
    items.forEach(x => { ac += x.v; x.cum = total ? ac / total : 0; });
    const L = items.map(x => x.l), V = items.map(x => x.v);
    const corte = clamp(num(d.line80) || 0.8, 0.1, 1);

    const sc = scaleOf(0, Math.max.apply(null, V), D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);
    const items2 = [
      { name:'FRECUENCIA', color:BR.p2 },
      { name:'% ACUMULADO', color:BR.p3, shape:'line' },
      { name: fmt(corte, 'p0') + ' DE CORTE', color:TONES.bad, shape:'line', dash:'6 4' }
    ];
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf), 14 + tw('100%', size) + 8, D.W, true);
    const mt = 16 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const lay = legendLay(items2, D.W - ml - mr, size);
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - px.h - lay.h - 8) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const Y2 = p => g.y + g.h - clamp(p, 0, 1) * g.h;
    const slot = g.w / items.length, bw = Math.min(slot * 0.72, 62);
    const xs = items.map((_, i) => g.x + (i + 0.5) * slot);

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g);
    /* eje secundario 0-100 % */
    for (let p = 0; p <= 1.0001; p += 0.25){
      const y = Y2(p);
      s += T(g.x + g.w + 7, y, fmt(p, 'p0'), { dy:'middle', size:size, style:S_AX3 });
      if (p > 0 && p < 1) s += LN(g.x + g.w, y, g.x + g.w + 3, y, S_GRID, { opacity:.6 });
    }
    s += LN(g.x + g.w, g.y, g.x + g.w, g.y + g.h, S_LINE, { opacity:.45 });

    /* pocos vitales */
    let vitales = 0, acc = 0;
    items.forEach(x => { if (acc < corte * total){ vitales++; acc += x.v; } });
    if (vitales > 0 && vitales < items.length)
      s += RC(g.x, g.y, slot * vitales, g.h, { fill:BR.p2, opacity:.06 });

    items.forEach((x, i) => {
      s += RC(xs[i] - bw / 2, Y(x.v), bw, Math.max(1, g.y + g.h - Y(x.v)),
        { rx:3, fill: i < vitales ? BR.p2 : BR.p1, class:'gw hit', style: dly(i),
          __in: tip(x.l + ': ' + vf(x.v) + ' · ' + fmt(x.v / total, 'p1') +
                    ' · acumulado ' + fmt(x.cum, 'p1')) });
    });
    /* línea de % acumulado */
    let p = '';
    items.forEach((x, i) => { p += (i ? 'L' : 'M') + r2(xs[i]) + ' ' + r2(Y2(x.cum)) + ' '; });
    s += PT(p.trim(), { stroke:BR.p3, 'stroke-width':2.4, 'stroke-linejoin':'round', class:'an' });
    items.forEach((x, i) => {
      s += CI(xs[i], Y2(x.cum), 3.4, { fill:BR.p3, class:'an hit',
        __in: tip('Acumulado en «' + x.l + '»: ' + fmt(x.cum, 'p1')) });
      if (items.length <= 12 && !D.compact)
        s += T(cxFit(xs[i], fmt(x.cum, 'p0'), size - 0.5, D.W), vyUp(g, Y2(x.cum), size, 8), fmt(x.cum, 'p0'),
               { anchor:'middle', size:size - 0.5, bold:true, style:'fill:' + BR.p3, cls:'an' });
    });
    /* línea de corte (80 %) */
    s += LN(g.x, Y2(corte), g.x + g.w, Y2(corte), 'stroke:' + TONES.bad,
            { 'stroke-width':1.6, 'stroke-dasharray':'6 4', opacity:.9,
              __in: tip('Regla de Pareto: ' + fmt(corte, 'p0') + ' del total') });
    s += xLabels(g, L, xs, px, size);
    s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* ----------------------------------------------------- beforeAfter */
  K.beforeAfter = function(d, opts){
    const D = dims(opts), size = D.size;
    const A1 = ar(Array.isArray(d.antes) ? d.antes : d.before).map(nul);
    const B1 = ar(Array.isArray(d.despues) ? d.despues : d.after).map(nul);
    const n = Math.max(A1.length, B1.length);
    if (!n || (!A1.some(v => v !== null) && !B1.some(v => v !== null))) return empty();
    const L = labelsOf(d, n);
    const rg = rangeOf([{ values:A1 }, { values:B1 }], true);
    const sc = scaleOf(rg[0], rg[1], D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);
    const nA = str(ar(d.names)[0] || 'ANTES'), nB = str(ar(d.names)[1] || 'DESPUES');
    const cA = BR.p1, cB = BR.p2;
    const menorMejor = d.menorMejor;

    const items = [{ name:nA, color:cA }, { name:nB, color:cB }];
    const mA = nul(d.meanBefore), mB = nul(d.meanAfter);
    if (mA !== null) items.push({ name:'PROMEDIO ' + nA, color:cA, shape:'line', dash:'5 4' });
    if (mB !== null) items.push({ name:'PROMEDIO ' + nB, color:cB, shape:'line', dash:'5 4' });

    const yl = str(d.yLabel || d.ylabel || '');
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf) + (yl ? 16 : 0), 16, D.W, true);
    const mt = 22 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const lay = legendLay(items, D.W - ml - mr, size);
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - px.h - lay.h - 8) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const slot = g.w / n, bw = Math.min(slot * 0.34, 34);
    const xs = L.map((_, i) => g.x + (i + 0.5) * slot);
    const y0 = Y(0);

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g) + yTitle(g, yl, size);
    for (let i = 0; i < n; i++){
      const a = A1[i] === undefined ? null : A1[i], b = B1[i] === undefined ? null : B1[i];
      if (a !== null){
        const y = Y(a);
        s += RC(xs[i] - bw - 2, Math.min(y, y0), bw, Math.max(1, Math.abs(y0 - y)),
          { rx:3, fill:cA, class:'gw hit', style: dly(i), __in: tip(L[i] + ' · ' + nA + ': ' + vf(a)) });
      }
      if (b !== null){
        const y = Y(b);
        s += RC(xs[i] + 2, Math.min(y, y0), bw, Math.max(1, Math.abs(y0 - y)),
          { rx:3, fill:cB, class:'gw hit', style: dly(i), __in: tip(L[i] + ' · ' + nB + ': ' + vf(b)) });
      }
      if (a !== null && b !== null && a !== 0 && !D.compact){
        const dl = (b - a) / Math.abs(a);
        const mejora = (menorMejor === undefined || menorMejor === null) ? null : (menorMejor ? dl < 0 : dl > 0);
        const col = mejora === null ? 'var(--tx2,#544D80)' : (mejora ? TONES.ok : TONES.bad);
        const yy = vyUp(g, Math.min(Y(a), Y(b)), size, 7);
        const et = (dl > 0 ? '▲ +' : (dl < 0 ? '▼ ' : '')) +
                   (Math.abs(dl) > 10 ? '>1.000%' : fmt(dl, 'p1'));
        s += T(cxFit(xs[i], et, size - 0.5, D.W), yy, et,
               { anchor:'middle', size:size - 0.5, bold:true, style:'fill:' + col, cls:'an',
                 tip:'Variación de ' + nA + ' a ' + nB + ': ' + fmt(dl, 'p1') });
      }
    }
    if (mA !== null) s += LN(g.x, Y(mA), g.x + g.w, Y(mA), 'stroke:' + cA,
      { 'stroke-width':1.5, 'stroke-dasharray':'5 4', opacity:.85, __in: tip('Promedio ' + nA + ': ' + vf(mA)) });
    if (mB !== null) s += LN(g.x, Y(mB), g.x + g.w, Y(mB), 'stroke:' + cB,
      { 'stroke-width':1.5, 'stroke-dasharray':'5 4', opacity:.85, __in: tip('Promedio ' + nB + ': ' + vf(mB)) });
    s += xLabels(g, L, xs, px, size);
    s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* ------------------------------------------------------------ gantt */
  K.gantt = function(d, opts){
    const D = dims(opts), size = D.size;
    const TS = ar(d.tasks).map(t => ({
      name: str(t.name || t.label || t.tarea || ''),
      start: str(t.start || t.inicio || ''),
      end:   str(t.end || t.fin || t.limite || ''),
      prog:  clamp(num(t.progress !== undefined ? t.progress : t.avance), 0, 1),
      fase:  !!t.fase,
      color: t.color || toneC(t.tone) || null,
      info:  str(t.asignado || t.responsable || ''),
      est:   str(t.estatus || '')
    })).filter(t => t.name && dParse(t.start) && dParse(t.end));
    if (!TS.length) return empty('Registra tareas con fecha de inicio y fin para ver el Gantt');

    let ini = null, fin = null;
    TS.forEach(t => {
      if (!ini || t.start < ini) ini = t.start;
      if (!fin || t.end > fin) fin = t.end;
    });
    const dIni = str(d.start || d.inicio || '');
    if (dIni && dParse(dIni) && dIni < ini) ini = dIni;
    if (fin < ini){ const t = ini; ini = fin; fin = t; }
    const dias = Math.max(1, dDiff(ini, fin) + 1);
    const hoyISO = str(d.today || d.hoy || '') || hoy();

    const capN = Math.max(8, Math.floor((D.W * 0.32) / (size * 0.56)));
    let nw = 0; TS.forEach(t => { nw = Math.max(nw, tw(ell(t.name, capN), size)); });
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const ml = Math.min(D.W * 0.38, Math.max(90, nw + 14));
    const mr = 44, hdr = 34 + cap, rowH = D.compact ? 16 : 22;
    const H = Math.max(D.H, hdr + TS.length * rowH + 26);
    const g = { x: ml, y: hdr, w: D.W - ml - mr, h: TS.length * rowH };
    const ppd = g.w / dias;                                   // píxeles por día
    const X = iso => g.x + clamp(dDiff(ini, iso), 0, dias) * ppd;

    let s = caption(opts, d, D.W, size);
    /* franjas por mes */
    const d0 = dParse(ini), d1 = dParse(fin);
    let cur = new Date(d0.getFullYear(), d0.getMonth(), 1), k = 0;
    while (cur <= d1 && k < 80){
      const finMes = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
      const a = dISO(cur) < ini ? ini : dISO(cur);
      const b = dISO(finMes) > fin ? fin : dISO(finMes);
      const x1 = X(a), x2 = g.x + Math.min(dias, dDiff(ini, b) + 1) * ppd;
      if (k % 2) s += RC(x1, g.y, x2 - x1, g.h, { style:S_BG2, opacity:.5 });
      if (x2 - x1 > 26)
        s += T((x1 + x2) / 2, g.y - 20, MES3[cur.getMonth()] + ' ' + String(cur.getFullYear()).slice(2),
               { anchor:'middle', size:size, bold:true, style:S_AX });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1); k++;
    }
    /* ticks de fecha */
    const marcas = [];
    if (dias <= 26){
      for (let i = 0; i < dias; i++){ const iso = dAdd(ini, i); marcas.push([iso, String(dParse(iso).getDate())]); }
    } else if (dias <= 140){
      const dd = dParse(ini);
      while (dd.getDay() !== 1) dd.setDate(dd.getDate() + 1);
      while (dISO(dd) <= fin){ const iso = dISO(dd);
        marcas.push([iso, dParse(iso).getDate() + '/' + (dParse(iso).getMonth() + 1)]);
        dd.setDate(dd.getDate() + 7); }
    } else {
      let m = new Date(d0.getFullYear(), d0.getMonth(), 1);
      while (dISO(m) <= fin){ if (dISO(m) >= ini) marcas.push([dISO(m), MES3[m.getMonth()]]);
        m = new Date(m.getFullYear(), m.getMonth() + 1, 1); }
    }
    const salto = Math.ceil(marcas.length / Math.max(1, Math.floor(g.w / 30)));
    marcas.forEach((mk, i) => {
      const x = X(mk[0]);
      s += LN(x, g.y, x, g.y + g.h, S_GRID, { opacity:.5 });
      if (!(i % salto)) s += T(x, g.y - 6, mk[1], { anchor:'middle', size:size - 0.5, style:S_AX3 });
    });
    s += LN(g.x, g.y, g.x + g.w, g.y, S_LINE, { opacity:.45 });

    /* filas */
    TS.forEach((t, i) => {
      const y = g.y + i * rowH, cy = y + rowH / 2;
      if (i % 2) s += RC(g.x, y, g.w, rowH, { style:S_BG2, opacity:.28 });
      s += T(6, cy, ell(t.name, capN), { dy:'middle', size:size, bold:t.fase,
        style: t.fase ? S_TX : S_AX, tip: t.name + (t.info ? ' · ' + t.info : '') });
      const x1 = X(t.start), x2 = g.x + Math.min(dias, dDiff(ini, t.end) + 1) * ppd;
      const w = Math.max(2, x2 - x1);
      const col = t.color || (t.fase ? BR.p1 : BR.p2);
      const bh = t.fase ? Math.min(8, rowH - 8) : Math.min(rowH - 8, 13);
      const ttip = t.name + ' · ' + fmt(t.start, 'date') + ' → ' + fmt(t.end, 'date') +
        ' · ' + fmt(dDiff(t.start, t.end) + 1, 'n0') + ' día(s) · avance ' + fmt(t.prog, 'p0') +
        (t.info ? ' · ' + t.info : '') + (t.est ? ' · ' + t.est : '');
      /* carril (pendiente) + relleno sólido del avance: contraste inequívoco */
      s += RC(x1, cy - bh / 2, w, bh, { rx: t.fase ? 2 : 3.5, fill: col, 'fill-opacity':.20,
        stroke: col, 'stroke-opacity':.55, 'stroke-width':1,
        class:'gwl hit', style: dly(i), __in: tip(ttip) });
      if (t.prog > 0)
        s += RC(x1, cy - bh / 2, Math.max(1.5, w * t.prog), bh,
          { rx: t.fase ? 2 : 3.5, fill: col, class:'gwl', style: dly(i), __in: tip(ttip) });
      if (!D.compact)
        s += T(x2 + 5, cy, fmt(t.prog, 'p0'), { dy:'middle', size:size - 1,
          style: t.prog >= 1 ? 'fill:' + TONES.ok : S_AX3 });
    });
    s += RC(g.x, g.y, g.w, g.h, { fill:'none', style:S_LINE, 'stroke-opacity':.35 });

    /* línea de HOY */
    if (hoyISO >= ini && hoyISO <= fin){
      const x = X(hoyISO) + ppd / 2;
      s += LN(x, g.y - 2, x, g.y + g.h + 2, 'stroke:' + TONES.bad,
              { 'stroke-width':1.6, 'stroke-dasharray':'4 3', __in: tip('HOY · ' + fmt(hoyISO, 'date')) });
      s += T(x, g.y + g.h + 14, 'HOY', { anchor:'middle', size:size - 0.5, bold:true, style:'fill:' + TONES.bad });
    }
    s += T(6, H - 6, ell(fmt(ini, 'date') + ' → ' + fmt(fin, 'date') + ' · ' +
      fmt(dias, 'n0') + ' días · ' + fmt(TS.length, 'n0') + ' tarea(s)',
      Math.floor((D.W - 12) / ((size - 0.5) * 0.56))), { size: size - 0.5, style:S_AX3 });
    return svgWrap(D.W, H, s);
  };

  /* ---------------------------------------------------------- control */
  K.control = function(d, opts){
    const D = dims(opts), size = D.size;
    const V = ar(d.values).map(nul);
    const idx = [], vv = [];
    V.forEach((v, i) => { if (v !== null){ idx.push(i); vv.push(v); } });
    if (vv.length < 2) return empty('Se necesitan al menos 2 puntos para la carta de control');
    const L = labelsOf(d, V.length);
    const tipoK = str(d.kind || 'X').toUpperCase();

    let cl = nul(d.cl);
    if (cl === null) cl = vv.reduce((a, b) => a + b, 0) / vv.length;
    let ucl = nul(d.ucl), lcl = nul(d.lcl);
    let sg;
    if (ucl !== null) sg = (ucl - cl) / 3;
    else if (lcl !== null) sg = (cl - lcl) / 3;
    else { const s0 = stdev(vv); sg = isFinite(s0) ? s0 : 0; }
    if (!isFinite(sg) || sg <= 0) sg = Math.max(1e-9, Math.abs(cl) * 0.02);
    if (ucl === null) ucl = cl + 3 * sg;
    if (lcl === null){ lcl = cl - 3 * sg; if (/^(P|NP|C|U)$/.test(tipoK) && lcl < 0) lcl = 0; }

    /* ---- reglas de Nelson 1 a 4 ---- */
    const viol = {};
    const mark = (i, r) => { (viol[i] = viol[i] || []); if (viol[i].indexOf(r) < 0) viol[i].push(r); };
    vv.forEach((v, i) => { if (v > ucl + 1e-12 || v < lcl - 1e-12) mark(i, 1); });
    let run = 0, lado = 0;
    vv.forEach((v, i) => {
      const s2 = v > cl ? 1 : (v < cl ? -1 : 0);
      if (s2 !== 0 && s2 === lado) run++; else { lado = s2; run = s2 === 0 ? 0 : 1; }
      if (run >= 9) for (let j = i - 8; j <= i; j++) mark(j, 2);
    });
    let inc = 1, dec = 1;
    for (let i = 1; i < vv.length; i++){
      inc = vv[i] > vv[i - 1] ? inc + 1 : 1;
      dec = vv[i] < vv[i - 1] ? dec + 1 : 1;
      if (inc >= 6) for (let j = i - 5; j <= i; j++) mark(j, 3);
      if (dec >= 6) for (let j = i - 5; j <= i; j++) mark(j, 3);
    }
    let alt = 1;
    for (let i = 2; i < vv.length; i++){
      const a = vv[i] - vv[i - 1], b = vv[i - 1] - vv[i - 2];
      alt = (a * b < 0) ? alt + 1 : 1;
      if (alt >= 13) for (let j = i - 13; j <= i; j++) if (j >= 0) mark(j, 4);
    }
    const reglas = {};
    Object.keys(viol).forEach(i => viol[i].forEach(r => reglas[r] = true));

    const rg = rangeOf([{ values: vv }, { values:[ucl, lcl, cl] }], false);
    const sc = scaleOf(rg[0], rg[1], D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);
    const items = [
      { name:'VALOR', color:BR.p2, shape:'line' },
      { name:'LC (línea central)', color:BR.p3, shape:'line' },
      { name:'LCS / LCI (±3σ)', color:TONES.bad, shape:'line', dash:'6 4' }
    ];
    if (Object.keys(reglas).length)
      items.push({ name:'FUERA DE CONTROL · reglas ' + Object.keys(reglas).sort().join(', '),
                   color:TONES.bad, shape:'dot' });

    const yl = str(d.yLabel || d.ylabel || '');
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf) + (yl ? 16 : 0),
                     16 + tw('LCS', size) + 10, D.W, false);
    const mt = 14 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const lay = legendLay(items, D.W - ml - mr, size);
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - px.h - lay.h - 8) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const n = V.length;
    const xs = n > 1 ? L.map((_, i) => g.x + i * g.w / (n - 1)) : [g.x + g.w / 2];

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g) + yTitle(g, yl, size);
    /* zonas ±1σ y ±2σ */
    [[1, .05], [2, .035]].forEach(z => {
      const a = Y(cl + z[0] * sg), b = Y(cl - z[0] * sg);
      s += RC(g.x, Math.min(a, b), g.w, Math.abs(b - a), { fill:BR.p2, opacity: z[1] });
    });
    s += LN(g.x, Y(cl), g.x + g.w, Y(cl), 'stroke:' + BR.p3, { 'stroke-width':1.8, __in: tip('LC: ' + vf(cl)) });
    s += T(g.x + g.w + 6, Y(cl), 'LC', { dy:'middle', size:size - 0.5, style:'fill:' + BR.p3, tip:'LC = ' + vf(cl) });
    [[ucl, 'LCS'], [lcl, 'LCI']].forEach(z => {
      if (z[0] === null || !isFinite(z[0])) return;
      const y = Y(z[0]);
      if (y < g.y - 1 || y > g.y + g.h + 1) return;
      s += LN(g.x, y, g.x + g.w, y, 'stroke:' + TONES.bad,
              { 'stroke-width':1.8, 'stroke-dasharray':'6 4', __in: tip(z[1] + ': ' + vf(z[0])) });
      s += T(g.x + g.w + 6, y, z[1], { dy:'middle', size:size - 0.5, style:'fill:' + TONES.bad,
             tip: z[1] + ' = ' + vf(z[0]) });
    });

    let p = '', open = false;
    V.forEach((v, i) => { if (v === null){ open = false; return; }
      p += (open ? 'L' : 'M') + r2(xs[i]) + ' ' + r2(Y(v)) + ' '; open = true; });
    s += PT(p.trim(), { stroke:BR.p2, 'stroke-width':2, 'stroke-linejoin':'round', class:'an' });
    vv.forEach((v, j) => {
      const i = idx[j], mal = viol[j];
      s += CI(xs[i], Y(v), mal ? 4.6 : 3.4, { fill: mal ? TONES.bad : BR.p2, class:'an hit',
        __in: tip(L[i] + ': ' + vf(v) + (mal ? ' · FUERA DE CONTROL (regla ' + mal.join(', ') + ')' : '')) });
      if (mal && !D.compact)
        s += T(cxFit(xs[i], mal.join(','), size - 1.5, D.W), vyUp(g, Y(v), size, 9), mal.join(','),
          { anchor:'middle', size:size - 1.5, bold:true, style:'fill:' + TONES.bad, cls:'an' });
    });
    s += xLabels(g, L, xs, px, size);
    s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* -------------------------------------------------------- histogram */
  K.histogram = function(d, opts){
    const D = dims(opts), size = D.size;
    const V = ar(d.values).filter(isNum).map(num);
    if (V.length < 3) return empty('Se necesitan al menos 3 datos para el histograma');
    const mn = Math.min.apply(null, V), mx = Math.max.apply(null, V);
    const kS = clamp(num(d.bins) || (Math.ceil(Math.log(V.length) / Math.LN2) + 1), 3, 30);
    const bs = binEdges(mn, mx, kS);        // regla de Sturges con bordes redondeados
    const edges = bs.edges;
    if (edges.length < 2) return empty();
    const nb = edges.length - 1;
    const cnt = new Array(nb).fill(0);
    V.forEach(v => {
      let i = Math.floor((v - bs.min) / bs.step);
      i = clamp(i, 0, nb - 1);
      cnt[i]++;
    });
    const m = V.reduce((a, b) => a + b, 0) / V.length;
    const sd = stdev(V);
    const lsl = nul(d.lsl), usl = nul(d.usl), tgt = nul(d.target);

    const maxC = Math.max.apply(null, cnt);
    let pico = maxC;
    if (isFinite(sd) && sd > 0)
      pico = Math.max(maxC, V.length * bs.step / (sd * Math.sqrt(2 * Math.PI)));
    const sc = scaleOf(0, pico, D.compact ? 4 : 5);
    const items = [{ name:'FRECUENCIA', color:BR.p2 }];
    if (isFinite(sd) && sd > 0) items.push({ name:'CURVA NORMAL', color:BR.p3, shape:'line' });
    if (lsl !== null) items.push({ name:'LSL', color:TONES.bad, shape:'line', dash:'6 4' });
    if (usl !== null) items.push({ name:'USL', color:TONES.bad, shape:'line', dash:'6 4' });
    if (tgt !== null) items.push({ name:'TARGET', color:TONES.info, shape:'line', dash:'2 4' });

    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const mr = 30, ml = Math.max(28, 14 + yWidth(sc, size)), mt = 14 + cap;
    const lay = legendLay(items, D.W - ml - mr, size);
    const bot = size + 16 + lay.h;
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - bot) };
    const lo = Math.min(bs.min, lsl === null ? Infinity : lsl, tgt === null ? Infinity : tgt);
    const hi = Math.max(bs.max, usl === null ? -Infinity : usl, tgt === null ? -Infinity : tgt);
    const X = v => g.x + (v - lo) / (hi - lo || 1) * g.w;
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, v => fmt(v, 'n0')) + axisFrame(g);
    cnt.forEach((c, i) => {
      const x1 = X(edges[i]), x2 = X(edges[i + 1]);
      if (c <= 0) return;
      s += RC(x1 + 0.5, Y(c), Math.max(1, x2 - x1 - 1), Math.max(1, g.y + g.h - Y(c)),
        { fill:BR.p2, opacity:.85, class:'gw hit', style: dly(i),
          __in: tip('[' + fmt(edges[i], 'n2') + ' — ' + fmt(edges[i + 1], 'n2') + '): ' +
                    fmt(c, 'n0') + ' dato(s) · ' + fmt(c / V.length, 'p1')) });
    });
    /* etiquetas del eje X en los bordes de clase */
    const salto = Math.ceil(edges.length / Math.max(1, Math.floor(g.w / 46)));
    edges.forEach((e, i) => {
      if (i % salto) return;
      s += T(X(e), g.y + g.h + size + 4, axFmt(e, bs.step, bs.big),
             { anchor:'middle', size:size - 0.5, style:S_AX });
    });
    /* campana normal superpuesta */
    if (isFinite(sd) && sd > 0){
      let p = '';
      const NP = 90;
      for (let i = 0; i <= NP; i++){
        const x = lo + (hi - lo) * i / NP;
        const y = V.length * bs.step * Math.exp(-Math.pow(x - m, 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
        p += (i ? 'L' : 'M') + r2(X(x)) + ' ' + r2(Y(y)) + ' ';
      }
      s += PT(p.trim(), { stroke:BR.p3, 'stroke-width':2, class:'an',
        __in: tip('Normal · media ' + fmt(m, 'n2') + ' · σ ' + fmt(sd, 'n3')) });
    }
    const marca = (v, col, txtl, dash) => {
      if (v === null) return '';
      const x = X(v);
      return LN(x, g.y, x, g.y + g.h, 'stroke:' + col,
                { 'stroke-width':1.8, 'stroke-dasharray': dash, __in: tip(txtl + ': ' + fmt(v, 'n2')) }) +
             T(x, g.y - 3, txtl, { anchor:'middle', size:size - 0.5, bold:true, style:'fill:' + col });
    };
    s += marca(lsl, TONES.bad, 'LSL', '6 4') + marca(usl, TONES.bad, 'USL', '6 4') +
         marca(tgt, TONES.info, 'TARGET', '2 4') +
         marca(m, BR.p1, 'X̄', '4 3');
    if (lsl !== null && usl !== null && isFinite(sd) && sd > 0){
      const cp = (usl - lsl) / (6 * sd);
      const cpk = Math.min((usl - m) / (3 * sd), (m - lsl) / (3 * sd));
      const et = 'Cp ' + fmt(cp, 'n2') + ' · Cpk ' + fmt(cpk, 'n2');
      const ew = tw(et, size) + 14;
      s += RC(g.x + g.w - ew - 4, g.y + 5, ew, size + 9,
              { rx:5, style:S_BG, opacity:.88 }) +
           T(g.x + g.w - 11, g.y + 5 + (size + 9) / 2, et,
             { anchor:'end', dy:'middle', size:size, bold:true,
               style:'fill:' + (cpk >= 1.33 ? TONES.ok : (cpk >= 1 ? TONES.warn : TONES.bad)),
               tip:'Cp = capacidad potencial · Cpk = capacidad real (centrado)' });
    }
    s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* -------------------------------------------------------------- pie */
  K.pie = function(d, opts){
    const D = dims(opts), size = D.size;
    const items = ar(d.labels).map((l, i) => ({ l: str(l), v: num(ar(d.values)[i]),
      c: ar(d.colors)[i] || toneC(ar(d.tones)[i]) || PAL[i % PAL.length] }))
      .filter(x => isFinite(x.v) && x.v > 0);
    if (!items.length) return empty();
    const total = items.reduce((a, b) => a + b.v, 0);
    if (!(total > 0)) return empty();

    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const capN = 26;
    let lw = 0; items.forEach(x => { lw = Math.max(lw, tw(ell(x.l, capN), size)); });
    const legW = Math.min(D.W * 0.46, lw + 92);
    const zona = { x: 8, y: cap + 6, w: D.W - legW - 12, h: D.H - cap - 14 };
    const R = Math.max(24, Math.min(zona.w, zona.h) / 2 - 6);
    const cx = zona.x + zona.w / 2, cy = zona.y + zona.h / 2;
    const ri = R * 0.58;
    const vf = d.fmt ? (v => fmt(v, d.fmt)) : (v => fmt(v, 'n0'));

    let s = caption(opts, d, D.W, size);
    if (items.length === 1){
      s += CI(cx, cy, (R + ri) / 2, { fill:'none', stroke: items[0].c, 'stroke-width': r2(R - ri),
        class:'an', __in: tip(items[0].l + ': ' + vf(items[0].v) + ' · 100%') });
    } else {
      let a0 = -Math.PI / 2;
      items.forEach((x, i) => {
        const ang = x.v / total * Math.PI * 2, a1 = a0 + ang;
        const laf = ang > Math.PI ? 1 : 0;
        const p = 'M' + r2(cx + R * Math.cos(a0)) + ' ' + r2(cy + R * Math.sin(a0)) +
          'A' + r2(R) + ' ' + r2(R) + ' 0 ' + laf + ' 1 ' + r2(cx + R * Math.cos(a1)) + ' ' + r2(cy + R * Math.sin(a1)) +
          'L' + r2(cx + ri * Math.cos(a1)) + ' ' + r2(cy + ri * Math.sin(a1)) +
          'A' + r2(ri) + ' ' + r2(ri) + ' 0 ' + laf + ' 0 ' + r2(cx + ri * Math.cos(a0)) + ' ' + r2(cy + ri * Math.sin(a0)) + 'Z';
        s += PT(p, { fill: x.c, class:'an hit', style: dly(i),
          __in: tip(x.l + ': ' + vf(x.v) + ' · ' + fmt(x.v / total, 'p1')) });
        if (ang > 0.32 && !D.compact){
          const am = (a0 + a1) / 2, rr = (R + ri) / 2;
          s += T(cx + rr * Math.cos(am), cy + rr * Math.sin(am), fmt(x.v / total, 'p0'),
                 { anchor:'middle', dy:'middle', size:size, bold:true, style:'fill:' + ink(x.c) });
        }
        a0 = a1;
      });
    }
    s += T(cx, cy - 4, fmt(total, 'n0'), { anchor:'middle', dy:'middle', size: size + 6, bold:true, style:S_TX });
    s += T(cx, cy + 12, 'TOTAL', { anchor:'middle', dy:'middle', size: size - 1, style:S_AX3 });

    /* leyenda lateral: se recorta al ancho y al alto disponibles */
    const lx = D.W - legW + 6;
    const wPct = tw('100,0%', size);
    const capL = Math.max(4, Math.min(capN,
      Math.floor((D.W - 8 - wPct - 6 - (lx + 16)) / (size * 0.56))));
    const disp = D.H - cap - 14;
    let paso = Math.min(22, disp / Math.max(1, items.length)), vis = items;
    if (paso < 11){
      paso = 11;
      vis = items.slice(0, Math.max(1, Math.floor(disp / paso) - 1));
    }
    let ly = cap + 10 + Math.max(0, (disp - (vis.length + (vis.length < items.length ? 1 : 0)) * paso) / 2);
    vis.forEach(x => {
      s += RC(lx, ly - 5, 11, 10, { rx:2.5, fill: x.c });
      s += T(lx + 16, ly, ell(x.l, capL), { dy:'middle', size:size, style:S_AX, tip:x.l });
      s += T(D.W - 8, ly, fmt(x.v / total, 'p1'), { anchor:'end', dy:'middle', size:size, bold:true, style:S_TX,
        tip: vf(x.v) });
      ly += paso;
    });
    if (vis.length < items.length)
      s += T(lx + 16, ly, '+ ' + fmt(items.length - vis.length, 'n0') + ' categoría(s) más',
             { dy:'middle', size:size - 0.5, style:S_AX3 });
    return svgWrap(D.W, D.H, s);
  };

  /* ---------------------------------------------------------- scatter */
  K.scatter = function(d, opts){
    const D = dims(opts), size = D.size;
    const P = ar(d.points).map((p, i) => ({
      x: nul(p.x), y: nul(p.y),
      l: str(p.label !== undefined ? p.label : (p.l !== undefined ? p.l : p.name)),
      c: p.color || toneC(p.tone) || PAL[i % PAL.length],
      r: nul(p.r)
    })).filter(p => p.x !== null && p.y !== null);
    if (!P.length) return empty();

    const xsv = P.map(p => p.x), ysv = P.map(p => p.y);
    const xmn = nul(d.xMin) !== null ? nul(d.xMin) : Math.min.apply(null, xsv);
    const xmx = nul(d.xMax) !== null ? nul(d.xMax) : Math.max.apply(null, xsv);
    const ymn = nul(d.yMin) !== null ? nul(d.yMin) : Math.min.apply(null, ysv);
    const ymx = nul(d.yMax) !== null ? nul(d.yMax) : Math.max.apply(null, ysv);
    const scx = scaleOf(xmn, xmx, D.compact ? 4 : 6);
    const scy = scaleOf(ymn, ymx, D.compact ? 4 : 5);
    const xl = str(d.xLabel || d.xTitle || d.xlabel || '');
    const yl = str(d.yLabel || d.yTitle || d.ylabel || '');

    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const ml = Math.max(28, 14 + yWidth(scy, size) + (yl ? 16 : 0)), mr = 30, mt = 14 + cap;
    const mb = size + 14 + (xl ? size + 8 : 0);
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - mb) };
    const X = v => g.x + (v - scx.min) / (scx.max - scx.min || 1) * g.w;
    const Y = v => g.y + g.h - (v - scy.min) / (scy.max - scy.min || 1) * g.h;

    let s = caption(opts, d, D.W, size);
    /* cuadrantes */
    ar(d.quadrants).forEach(q => {
      const col = toneC(q.tone) || BR.p3;
      if (q.x0 !== undefined && q.x1 !== undefined){
        const x1 = X(clamp(num(q.x0), scx.min, scx.max)), x2 = X(clamp(num(q.x1), scx.min, scx.max));
        const y1 = Y(clamp(num(q.y1 !== undefined ? q.y1 : q.y0), scy.min, scy.max));
        const y2 = Y(clamp(num(q.y0), scy.min, scy.max));
        s += RC(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1),
          { fill: col, opacity:.09 });
        s += T((x1 + x2) / 2, Math.min(y1, y2) + size + 4, str(q.label),
          { anchor:'middle', size:size, bold:true, style:'fill:' + col, op:.9 });
      } else if (q.x !== undefined && q.y !== undefined){
        s += T(X(num(q.x)), Y(num(q.y)), str(q.label),
          { anchor:'middle', dy:'middle', size:size, bold:true, style:'fill:' + col, op:.8 });
      }
    });
    /* rejilla */
    s += yGrid(g, scy, size, v => axFmt(v, scy.step, scy.big));
    scx.ticks.forEach(v => {
      const x = X(v);
      if (x < g.x - 0.5 || x > g.x + g.w + 0.5) return;
      s += LN(x, g.y, x, g.y + g.h, S_GRID, { opacity:.4 });
      s += T(x, g.y + g.h + size + 4, axFmt(v, scx.step, scx.big), { anchor:'middle', size:size, style:S_AX });
    });
    s += axisFrame(g);
    /* líneas de referencia */
    if (nul(d.refX) !== null) s += LN(X(nul(d.refX)), g.y, X(nul(d.refX)), g.y + g.h,
      'stroke:' + TONES.warn, { 'stroke-width':1.4, 'stroke-dasharray':'5 4', opacity:.75 });
    if (nul(d.refY) !== null) s += LN(g.x, Y(nul(d.refY)), g.x + g.w, Y(nul(d.refY)),
      'stroke:' + TONES.warn, { 'stroke-width':1.4, 'stroke-dasharray':'5 4', opacity:.75 });

    const rmax = P.reduce((a, p) => Math.max(a, p.r === null ? 0 : p.r), 0);
    P.forEach((p, i) => {
      const rr = rmax > 0 && p.r !== null ? clamp(3.5 + p.r / rmax * 4.5, 3.5, 9) : (D.compact ? 4 : 5.5);
      s += CI(X(p.x), Y(p.y), rr, { fill: p.c, opacity:.9, class:'an hit', style: dly(i),
        __in: tip((p.l ? p.l + ' · ' : '') + (xl ? xl.split('—')[0].trim() + ' ' : '') + fmt(p.x, 'n2') +
                  ' / ' + (yl ? yl.split('—')[0].trim() + ' ' : '') + fmt(p.y, 'n2')) });
      if (p.l && P.length <= 20 && !D.compact){
        const et = ell(p.l, 24), ew = tw(et, size - 0.5);
        const der = X(p.x) + rr + 3 + ew <= D.W - 4;
        s += T(der ? X(p.x) + rr + 3 : Math.max(ew + 2, X(p.x) - rr - 3), Y(p.y), et,
               { anchor: der ? null : 'end', dy:'middle', size:size - 0.5, style:S_AX, tip:p.l });
      }
    });
    if (xl) s += T(g.x + g.w / 2, D.H - 4, ell(xl, Math.floor(g.w / (size * 0.58))),
      { anchor:'middle', size:size, style:S_AX3, tip:xl });
    if (yl) s += yTitle(g, yl, size);
    return svgWrap(D.W, D.H, s);
  };

  /* ------------------------------------------------------------ radar */
  K.radar = function(d, opts){
    const D = dims(opts), size = D.size;
    const AXS = ar(d.axes).map(str);
    const SS = seriesOf(d);
    if (AXS.length < 3 || !SS.length) return empty('El radar necesita al menos 3 ejes con datos');
    const m = AXS.length;
    let mx = 0;
    SS.forEach(s => s.values.forEach(v => { if (v !== null && v > mx) mx = v; }));
    if (!(mx > 0)) return empty();
    const sc = scaleOf(0, mx, 4);
    const items = SS.map(s => ({ name:s.name, color:s.color }));

    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const lay = legendLay(items, D.W - 20, size);
    const zona = { y: cap + 8, h: D.H - cap - lay.h - 18 };
    const cx = D.W / 2, cy = zona.y + zona.h / 2;
    /* el radio deja sitio a las etiquetas de los ejes (arriba, abajo y a los lados) */
    const lwmax = AXS.reduce((a, x) => Math.max(a, tw(ell(x, 18), size)), 0);
    const R = Math.max(22, Math.min(D.W / 2 - 18 - lwmax, zona.h / 2 - (size + 16)));
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / m;
    const PX = (i, v) => [cx + R * (v / sc.max) * Math.cos(ang(i)), cy + R * (v / sc.max) * Math.sin(ang(i))];

    let s = caption(opts, d, D.W, size);
    sc.ticks.forEach(t => {
      if (t <= 0) return;
      let p = '';
      for (let i = 0; i < m; i++){ const q = PX(i, t); p += (i ? 'L' : 'M') + r2(q[0]) + ' ' + r2(q[1]) + ' '; }
      s += PT(p + 'Z', { style:S_GRID, opacity:.5 });
      s += T(cx + 3, cy - R * (t / sc.max), axFmt(t, sc.step, sc.big),
             { size:size - 1.5, dy:'middle', style:S_AX3 });
    });
    for (let i = 0; i < m; i++){
      const q = PX(i, sc.max);
      s += LN(cx, cy, q[0], q[1], S_GRID, { opacity:.55 });
      const a = ang(i), lx = cx + (R + 12) * Math.cos(a), ly = cy + (R + 12) * Math.sin(a);
      const anc = Math.cos(a) > 0.25 ? 'start' : (Math.cos(a) < -0.25 ? 'end' : 'middle');
      s += T(lx, ly, ell(AXS[i], 18), { anchor:anc, dy:'middle', size:size, style:S_AX, tip:AXS[i] });
    }
    SS.forEach((se, k) => {
      let p = '';
      for (let i = 0; i < m; i++){
        const v = se.values[i] === null || se.values[i] === undefined ? 0 : se.values[i];
        const q = PX(i, clamp(v, sc.min, sc.max));
        p += (i ? 'L' : 'M') + r2(q[0]) + ' ' + r2(q[1]) + ' ';
      }
      s += PT(p + 'Z', { fill: se.color, 'fill-opacity':.16, stroke: se.color,
        'stroke-width':2.2, 'stroke-linejoin':'round', class:'an', style: dly(k) });
      for (let i = 0; i < m; i++){
        const v = se.values[i]; if (v === null || v === undefined) continue;
        const q = PX(i, clamp(v, sc.min, sc.max));
        s += CI(q[0], q[1], 3.2, { fill: se.color, class:'an hit',
          __in: tip(se.name + ' · ' + AXS[i] + ': ' + fmt(v, 'n2')) });
      }
    });
    s += legendDraw(lay, 10, D.H - lay.h - 4, D.W - 20);
    return svgWrap(D.W, D.H, s);
  };

  /* -------------------------------------------------------- waterfall */
  K.waterfall = function(d, opts){
    const D = dims(opts), size = D.size;
    const V = ar(d.values).map(v => num(v));
    if (!V.length) return empty();
    const L = labelsOf(d, V.length);
    const tipos = ar(d.types);
    const esTotal = i => (tipos[i] ? /^(t|a)/i.test(str(tipos[i])) : /total|acumulad|neto|final/i.test(L[i]));

    let acc = 0;
    const barras = V.map((v, i) => {
      if (esTotal(i)){                       // barra de total: siempre desde cero
        const b = (i === 0) ? v : acc;
        acc = b;
        return { a: 0, b: b, v: b, total: true };
      }
      const a = acc; acc = acc + v;
      return { a: a, b: acc, v: v, total: false };
    });
    let mn = 0, mx = 0;
    barras.forEach(x => { mn = Math.min(mn, x.a, x.b); mx = Math.max(mx, x.a, x.b); });
    const sc = scaleOf(mn, mx, D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);
    const items = [{ name:'AUMENTA', color:TONES.ok }, { name:'DISMINUYE', color:TONES.bad },
                   { name:'TOTAL', color:BR.p1 }];

    const yl = str(d.yLabel || d.ylabel || '');
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf) + (yl ? 16 : 0), 16, D.W, true);
    const mt = 18 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const lay = legendLay(items, D.W - ml - mr, size);
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - px.h - lay.h - 8) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const n = V.length, slot = g.w / n, bw = Math.min(slot * 0.62, 56);
    const xs = L.map((_, i) => g.x + (i + 0.5) * slot);

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g) + yTitle(g, yl, size);
    barras.forEach((x, i) => {
      const y1 = Y(x.a), y2 = Y(x.b);
      const col = x.total ? BR.p1 : (x.b >= x.a ? TONES.ok : TONES.bad);
      s += RC(xs[i] - bw / 2, Math.min(y1, y2), bw, Math.max(1.5, Math.abs(y2 - y1)),
        { rx:3, fill: col, class:'an hit', style: dly(i),
          __in: tip(L[i] + ': ' + vf(x.v) + ' · acumulado ' + vf(x.b)) });
      if (i < n - 1)
        s += LN(xs[i] + bw / 2, y2, xs[i + 1] - bw / 2, y2, S_LINE,
                { 'stroke-dasharray':'3 3', opacity:.55 });
      if (!D.compact && n <= 18){
        const et = (x.total || x.v < 0 ? '' : '+') + vf(x.v);
        s += T(cxFit(xs[i], et, size - 0.5, D.W), vyUp(g, Math.min(y1, y2), size, 6), et,
               { anchor:'middle', size:size - 0.5, style:S_TX, cls:'an' });
      }
    });
    s += xLabels(g, L, xs, px, size);
    s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* ---------------------------------------------------------- boxplot */
  /** Resumen de 5 números + bigotes de Tukey (1,5·RIC) + atípicos.
   *  Los cuartiles usan interpolación lineal (igual que PERCENTIL.INC de
   *  Excel y que STATS.quantil), para que la caja coincida con las tablas. */
  function boxStats(v){
    const s = v.slice().sort((a, b) => a - b), n = s.length;
    const q = p => {
      const h = (n - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
      return s[lo] + (h - lo) * (s[hi] - s[lo]);
    };
    const q1 = q(0.25), q2 = q(0.5), q3 = q(0.75), iqr = q3 - q1;
    const cLo = q1 - 1.5 * iqr, cHi = q3 + 1.5 * iqr;
    let wlo = null, whi = null;
    const out = [];
    s.forEach(x => {
      if (x < cLo || x > cHi) out.push(x);
      else { if (wlo === null) wlo = x; whi = x; }
    });
    if (wlo === null){ wlo = s[0]; whi = s[n - 1]; }
    return { n: n, min: s[0], max: s[n - 1], q1: q1, q2: q2, q3: q3, iqr: iqr,
             wlo: wlo, whi: whi, out: out, media: s.reduce((a, b) => a + b, 0) / n };
  }
  /** Grupos de un boxplot: {grupos:[{name,values}]} · {labels,series:[[],[]]} · {values:[[],[]]} */
  function boxGroups(d){
    let L = ar(d.grupos).length ? ar(d.grupos) : ar(d.groups);
    if (!L.length){
      const S = ar(d.series).length ? ar(d.series) : ar(d.values);
      L = S.map(x => (Array.isArray(x) ? { values: x } : x));
    }
    const et = ar(d.labels).map(str);
    return L.map((g, i) => {
      const src = Array.isArray(g) ? g : (g ? (g.values || g.valores || g.datos || g.v) : null);
      const v = ar(src).filter(isNum).map(num);
      const nm = Array.isArray(g) ? '' : str(g && (g.name || g.label || g.nombre));
      return { name: nm || et[i] || ('Grupo ' + (i + 1)), v: v,
               color: (g && !Array.isArray(g) && (g.color || toneC(g.tone))) || PAL[i % PAL.length] };
    }).filter(g => g.v.length);
  }

  K.boxplot = function(d, opts){
    const D = dims(opts), size = D.size;
    const GS = boxGroups(d);
    if (!GS.length) return empty('Registra al menos un grupo con datos para el diagrama de caja');
    GS.forEach(g => { g.st = boxStats(g.v); });

    const pool = [];
    GS.forEach(g => { pool.push(g.st.wlo, g.st.whi); g.st.out.forEach(x => pool.push(x)); });
    const lsl = nul(d.lsl), usl = nul(d.usl), tgt = nul(d.target);
    if (lsl !== null) pool.push(lsl);
    if (usl !== null) pool.push(usl);
    if (tgt !== null) pool.push(tgt);
    const rg = rangeOf([{ values: pool }], false);
    const sc = scaleOf(rg[0], rg[1], D.compact ? 4 : 6);
    const vf = mkFmt(d, sc);
    const L = GS.map(g => g.name);
    const hayOut = GS.some(g => g.st.out.length);

    const items = [{ name:'CAJA Q1–Q3', color:PAL[0], op:.32 },
                   { name:'MEDIANA', color:PAL[0], shape:'line' },
                   { name:'MEDIA', color:PAL[2], shape:'dot' }];
    if (hayOut) items.push({ name:'ATÍPICOS (> 1,5 · RIC)', color:TONES.bad, shape:'dot' });
    if (lsl !== null || usl !== null)
      items.push({ name:'LSL / USL', color:TONES.bad, shape:'line', dash:'6 4' });
    if (tgt !== null) items.push({ name:'TARGET', color:TONES.info, shape:'line', dash:'2 4' });

    const yl = str(d.yLabel || d.ylabel || '');
    const cap = (opts && opts.title) || d.title ? 20 : 0;
    const XP = xPlan(L, size, D.compact, 14 + yWidth(sc, size, vf) + (yl ? 16 : 0), 16, D.W, true);
    const mt = 16 + cap;
    const ml = XP.ml, mr = XP.mr, px = XP.px;
    const lay = legendLay(items, D.W - ml - mr, size);
    const g = { x: ml, y: mt, w: D.W - ml - mr, h: Math.max(40, D.H - mt - px.h - lay.h - 8) };
    const Y = v => g.y + g.h - (v - sc.min) / (sc.max - sc.min || 1) * g.h;
    const n = GS.length, slot = g.w / n;
    const bw = Math.min(slot * 0.52, 62);
    const xs = GS.map((_, i) => g.x + (i + 0.5) * slot);

    let s = caption(opts, d, D.W, size) + yGrid(g, sc, size, vf) + axisFrame(g) + yTitle(g, yl, size);

    /* referencias de especificación, por debajo de las cajas */
    const marca = (v, col, txt, dash) => {
      if (v === null) return '';
      const y = Y(v);
      if (y < g.y - 1 || y > g.y + g.h + 1) return '';
      return LN(g.x, y, g.x + g.w, y, 'stroke:' + col,
                { 'stroke-width':1.6, 'stroke-dasharray':dash, opacity:.9,
                  __in: tip(txt + ': ' + vf(v)) }) +
             T(g.x + 3, y - 3, txt, { size:size - 1, bold:true, style:'fill:' + col });
    };
    s += marca(lsl, TONES.bad, 'LSL', '6 4') + marca(usl, TONES.bad, 'USL', '6 4') +
         marca(tgt, TONES.info, 'TARGET', '2 4');

    GS.forEach((gr, i) => {
      const st = gr.st, c = gr.color, x = xs[i];
      const yQ1 = Y(st.q1), yQ3 = Y(st.q3), yMe = Y(st.q2);
      const yLo = Y(st.wlo), yHi = Y(st.whi);
      const cw = bw * 0.46;                                  // media caña de los topes
      const ttip = gr.name + ' · n = ' + fmt(st.n, 'n0') +
        ' · Mín ' + vf(st.min) + ' · Q1 ' + vf(st.q1) + ' · Mediana ' + vf(st.q2) +
        ' · Q3 ' + vf(st.q3) + ' · Máx ' + vf(st.max) + ' · RIC ' + vf(st.iqr) +
        ' · Media ' + vf(st.media) + (st.out.length ? ' · ' + st.out.length + ' atípico(s)' : '');

      /* bigotes: línea vertical + tope horizontal */
      s += LN(x, yHi, x, yQ3, 'stroke:' + c, { 'stroke-width':1.5, opacity:.9, class:'an', style: dly(i) });
      s += LN(x, yQ1, x, yLo, 'stroke:' + c, { 'stroke-width':1.5, opacity:.9, class:'an', style: dly(i) });
      s += LN(x - cw, yHi, x + cw, yHi, 'stroke:' + c, { 'stroke-width':1.8, class:'an', style: dly(i),
        __in: tip('Bigote superior: ' + vf(st.whi)) });
      s += LN(x - cw, yLo, x + cw, yLo, 'stroke:' + c, { 'stroke-width':1.8, class:'an', style: dly(i),
        __in: tip('Bigote inferior: ' + vf(st.wlo)) });
      /* caja Q1–Q3 */
      s += RC(x - bw / 2, Math.min(yQ1, yQ3), bw, Math.max(1.5, Math.abs(yQ1 - yQ3)),
        { rx:3, fill: c, 'fill-opacity':.32, stroke: c, 'stroke-width':1.8,
          class:'an hit', style: dly(i), __in: tip(ttip) });
      /* mediana */
      s += LN(x - bw / 2, yMe, x + bw / 2, yMe, 'stroke:' + c,
        { 'stroke-width':2.8, 'stroke-linecap':'round', class:'an', style: dly(i),
          __in: tip('Mediana: ' + vf(st.q2)) });
      /* media: rombo */
      const rr = Math.min(5.2, bw * 0.16 + 2.6), ym = Y(st.media);
      s += PT('M' + r2(x) + ' ' + r2(ym - rr) + 'L' + r2(x + rr) + ' ' + r2(ym) +
              'L' + r2(x) + ' ' + r2(ym + rr) + 'L' + r2(x - rr) + ' ' + r2(ym) + 'Z',
        { fill: PAL[2], stroke: ink(PAL[2]), 'stroke-width':.8, class:'an hit', style: dly(i),
          __in: tip('Media: ' + vf(st.media)) });
      /* atípicos */
      st.out.forEach(v => {
        s += CI(x, Y(v), D.compact ? 2.6 : 3.2, { fill:TONES.bad, opacity:.92, class:'an hit',
          __in: tip(gr.name + ' · ATÍPICO: ' + vf(v)) });
      });
      /* etiqueta de la mediana cuando caben */
      if (n <= 10 && !D.compact){
        const et = vf(st.q2);
        s += T(cxFit(x + bw / 2 + 4 + tw(et, size - 0.5) / 2, et, size - 0.5, D.W), yMe + 3.5, et,
               { anchor:'middle', size: size - 0.5, style:S_AX, cls:'an' });
      }
    });

    s += xLabels(g, L, xs, px, size);
    s += legendDraw(lay, g.x, D.H - lay.h - 2, g.w);
    return svgWrap(D.W, D.H, s);
  };

  /* ============================================================== draw */
  function draw(kind, data, opts){
    const d = data || {}, o = opts || {};
    const fn = K[kind];
    if (!fn) return empty('Tipo de gráfico no reconocido: ' + str(kind));
    try {
      const out = fn(d, o);
      return out || empty();
    } catch(e){
      console.error('CHART.draw', kind, e);
      return empty('No se pudo dibujar el gráfico');
    }
  }

  /* =============================================================== PNG */
  function toPNG(svgEl, scale){
    return new Promise(function(resolve, reject){
      try {
        let el = svgEl;
        if (typeof el === 'string'){
          /* se parsea como XML (nunca con innerHTML: cero superficie de inyección) */
          const doc = new DOMParser().parseFromString(el, 'image/svg+xml');
          el = doc && doc.documentElement;
        }
        if (!el || String(el.nodeName).toLowerCase() !== 'svg')
          return reject(new Error('No hay ningún gráfico SVG para exportar'));
        const s = clamp(num(scale) || 2, 1, 6);
        const vb = str(el.getAttribute('viewBox')).split(/[\s,]+/).map(Number).filter(x => isFinite(x));
        let w = 0, h = 0;
        if (vb.length === 4){ w = vb[2]; h = vb[3]; }
        if (!(w > 0)){
          const bb = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
          w = (bb && bb.width) || 900; h = (bb && bb.height) || 380;
        }
        w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));

        const c = el.cloneNode(true);
        c.setAttribute('xmlns', NS);
        c.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        c.setAttribute('width', w);
        c.setAttribute('height', h);
        c.setAttribute('viewBox', vb.length === 4 ? vb.join(' ') : ('0 0 ' + w + ' ' + h));
        /* fuera las animaciones: un render estático las congelaría en el fotograma 0 */
        Array.prototype.slice.call(c.querySelectorAll('style[data-anim]')).forEach(x => x.parentNode.removeChild(x));

        /* resolver las variables del tema para conservar los colores */
        let decl = '', bg = '#FFFFFF';
        try {
          const cs = getComputedStyle(document.documentElement);
          VARS.forEach(v => { const x = str(cs.getPropertyValue(v)).trim(); if (x) decl += v + ':' + x + ';'; });
          bg = str(cs.getPropertyValue('--d2')).trim() || bg;
        } catch(e){}
        c.setAttribute('style', decl + str(c.getAttribute('style')));

        const bgr = document.createElementNS(NS, 'rect');
        bgr.setAttribute('x', vb.length === 4 ? vb[0] : 0);
        bgr.setAttribute('y', vb.length === 4 ? vb[1] : 0);
        bgr.setAttribute('width', w);
        bgr.setAttribute('height', h);
        bgr.setAttribute('fill', bg);
        c.insertBefore(bgr, c.firstChild);

        const xml = new XMLSerializer().serializeToString(c);
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
        const img = new Image();
        img.onload = function(){
          try {
            const cv = document.createElement('canvas');
            cv.width = Math.round(w * s); cv.height = Math.round(h * s);
            const x = cv.getContext('2d');
            x.fillStyle = bg; x.fillRect(0, 0, cv.width, cv.height);
            x.drawImage(img, 0, 0, cv.width, cv.height);
            if (cv.toBlob) cv.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo generar el PNG')), 'image/png');
            else {
              const du = cv.toDataURL('image/png');
              resolve(new Blob([b64ToBytes(du.split(',')[1])], { type:'image/png' }));
            }
          } catch(err){ reject(err); }
        };
        img.onerror = function(){ reject(new Error('No se pudo convertir el SVG a imagen')); };
        img.src = url;
      } catch(e){ reject(e); }
    });
  }

  /* ============================================================= API */
  return {
    draw: draw,
    toPNG: toPNG,
    palette: PAL,
    tones: TONES,
    kinds: Object.keys(K),
    empty: empty,
    scaleOf: scaleOf,
    niceNum: niceNum
  };
})();
