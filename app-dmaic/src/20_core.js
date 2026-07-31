/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC · NÚCLEO
   App 100% autónoma: sin servidor, sin CDN, sin repositorios. Todo local.
   ========================================================================== */
'use strict';

/* ---------------------------------------------------------------- helpers */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => 'x' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/** Cuerpo de letra de una cifra KPI según su largo. La tarjeta no parte el
 *  valor («$ 46.800.000» dejaba el $ solo en el renglón de arriba), así que
 *  es el tamaño el que cede para que quepa entero en una sola línea. */
const kvCls = v => {
  const n = String(v == null ? '' : v).length;
  return n >= 18 ? ' vxs' : n >= 14 ? ' vsm' : n >= 11 ? ' vmd' : '';
};

function num(v){
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  const s = String(v).replace(/\s|\$|%/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}
function isNum(v){ return v !== null && v !== undefined && v !== '' && isFinite(num(v)); }
const arr      = r => Array.isArray(r) ? r : [];
const sum      = (rows, k) => arr(rows).reduce((a, r) => a + num(k ? r[k] : r), 0);
const vals     = (rows, k) => arr(rows).map(r => (k ? r[k] : r)).filter(isNum).map(num);
const count    = (rows, k) => vals(rows, k).length;
const avg      = (rows, k) => { const v = vals(rows, k); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN; };
const maxOf    = (rows, k) => { const v = vals(rows, k); return v.length ? Math.max.apply(null, v) : NaN; };
const minOf    = (rows, k) => { const v = vals(rows, k); return v.length ? Math.min.apply(null, v) : NaN; };
const safeDiv  = (a, b) => (num(b) === 0 ? NaN : num(a) / num(b));
const pct      = (a, b) => safeDiv(a, b);
const round    = (v, n) => { const p = Math.pow(10, n || 0); return Math.round(num(v) * p) / p; };
const clamp    = (v, a, b) => Math.min(b, Math.max(a, v));
function stdev(a, samp){                       // desviación estándar (muestral por defecto)
  const v = a.filter(isNum).map(num); const n = v.length;
  if (n < 2) return NaN;
  const m = v.reduce((x, y) => x + y, 0) / n;
  return Math.sqrt(v.reduce((s, x) => s + (x - m) * (x - m), 0) / (samp === false ? n : n - 1));
}
const median = a => { const v = a.filter(isNum).map(num).sort((x, y) => x - y); if (!v.length) return NaN;
  const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };

/* NORM.S.INV — Acklam / Wichura, precisión ~1e-9 (igual a Excel) */
function normsinv(p){
  if (!(p > 0 && p < 1)) return NaN;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
        b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
        c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
        d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425; let q, r, x;
  if (p < pl){ q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  else if (p <= 1 - pl){ q = p - 0.5; r = q * q;
    x = (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
  else { q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  // refinamiento Halley
  const e = 0.5 * erfc(-x / Math.SQRT2) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
  return x - u / (1 + x * u / 2);
}
function erfc(x){
  const z = Math.abs(x), t = 1 / (1 + z / 2);
  const r = t * Math.exp(-z*z - 1.26551223 + t*(1.00002368 + t*(0.37409196 + t*(0.09678418 +
    t*(-0.18628806 + t*(0.27886807 + t*(-1.13520398 + t*(1.48851587 + t*(-0.82215223 + t*0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
const normsdist = z => 1 - 0.5 * erfc(z / Math.SQRT2);
/* Nivel Sigma (con corrimiento 1.5σ, convención Six Sigma) */
function sigmaLevel(dpmo){
  const d = num(dpmo); if (!(d >= 0) || d >= 1e6) return 0;
  if (d <= 0) return 6;
  return clamp(normsinv(1 - d / 1e6) + 1.5, 0, 6);
}
/* Regresión lineal simple → {m,b,r2} */
function linreg(xs, ys){
  const n = Math.min(xs.length, ys.length); if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++){ const x = num(xs[i]), y = num(ys[i]); sx += x; sy += y; sxy += x*y; sxx += x*x; syy += y*y; }
  const den = n * sxx - sx * sx; if (!den) return null;
  const m = (n * sxy - sx * sy) / den, b = (sy - m * sx) / n;
  const dd = Math.sqrt((n*sxx - sx*sx) * (n*syy - sy*sy));
  return { m, b, r2: dd ? Math.pow((n*sxy - sx*sy) / dd, 2) : 0 };
}

/* ------------------------------------------------------------- formateo */
const NF = (min, max) => new Intl.NumberFormat('es-CO', { minimumFractionDigits: min, maximumFractionDigits: max });
const F = { n0:NF(0,0), n1:NF(1,1), n2:NF(2,2), n3:NF(3,3), auto:NF(0,2) };
function fmt(v, f){
  if (v === '' || v === null || v === undefined) return '';
  if (typeof v === 'number' && !isFinite(v)) return '—';
  const n = num(v);
  switch (f){
    case 'n0': return F.n0.format(n);
    case 'n1': return F.n1.format(n);
    case 'n2': return F.n2.format(n);
    case 'n3': return F.n3.format(n);
    case 'int': return F.n0.format(Math.round(n));
    case 'p0': return F.n0.format(n * 100) + '%';
    case 'p1': return F.n1.format(n * 100) + '%';
    case 'p2': return F.n2.format(n * 100) + '%';
    case 'pp1': return F.n1.format(n) + '%';           // ya viene en 0-100
    // espacio duro: si no, el $ se queda solo en una línea cuando el valor es largo
    case 'money': return '$\u00A0' + F.n0.format(n);
    case 'money2': return '$\u00A0' + F.n2.format(n);
    case 'date': return v ? new Date(v + 'T00:00:00').toLocaleDateString('es-CO') : '';
    default: return isNum(v) ? F.auto.format(n) : String(v);
  }
}
const dISO   = d => { const x = d instanceof Date ? d : new Date(d); return isNaN(x) ? '' : x.toISOString().slice(0, 10); };
const dParse = s => { if (!s) return null; const d = new Date(String(s).slice(0,10) + 'T00:00:00'); return isNaN(d) ? null : d; };
const dDiff  = (a, b) => { const x = dParse(a), y = dParse(b); return (x && y) ? Math.round((y - x) / 86400000) : NaN; };
const dAdd   = (s, n) => { const d = dParse(s); if (!d) return ''; d.setDate(d.getDate() + n); return dISO(d); };
const hoy    = () => dISO(new Date());

/* ------------------------------------------------------------ TOOLS reg */
const TOOLS = [];                         // se llena desde los archivos de specs
const TOOL_BY_ID = {};
function registerTools(list){
  arr(list).forEach(t => {
    if (TOOL_BY_ID[t.id]) { console.warn('TOOL duplicada', t.id); return; }
    TOOLS.push(t); TOOL_BY_ID[t.id] = t;
  });
}
const MODULES = [
  { id:'GUIA',      n:0, letter:'?', name:'GUÍA DE APLICACIÓN', en:'Manual', color:'#6D6796',
    guia:true, desc:'Manual Lean Six Sigma: qué es cada herramienta, cómo se usa y cómo se encadenan las fases.',
    file:null },
  { id:'DEFINIR',   n:1, letter:'D', name:'DEFINIR',   en:'Define',  color:'#2A1AA6',
    desc:'Delimitar el problema, el alcance, el equipo y la línea base.', file:'01DEFINIR' },
  { id:'MEDIR',     n:2, letter:'M', name:'MEDIR',     en:'Measure', color:'#3B26D3',
    desc:'Mapear el proceso y cuantificar el desempeño actual con datos.', file:'02MEDIR' },
  { id:'ANALIZAR',  n:3, letter:'A', name:'ANALIZAR',  en:'Analyze', color:'#6B4DE8',
    desc:'Encontrar y validar la causa raíz del problema.', file:'03ANALIZAR' },
  { id:'MEJORAR',   n:4, letter:'I', name:'MEJORAR',   en:'Improve', color:'#0E9E8F',
    desc:'Generar, priorizar e implementar las soluciones.', file:'04MEJORAR' },
  { id:'CONTROLAR', n:5, letter:'C', name:'CONTROLAR', en:'Control', color:'#0A9E5C',
    desc:'Estandarizar, controlar y sostener la mejora en el tiempo.', file:'05CONTROLAR' }
];
const MOD_BY_ID = {}; MODULES.forEach(m => MOD_BY_ID[m.id] = m);
const toolsOf = mod => TOOLS.filter(t => t.mod === mod);
/** Las 5 fases DMAIC (excluye la GUÍA, que es documentación, no un entregable) */
const FASES = MODULES.filter(m => !m.guia);
/** Herramientas que SÍ existen como hoja en los Excel originales.
 *  Las marcadas `extra:true` provienen del manual y sólo viven en la app
 *  y en el libro consolidado. */
const enPlantilla = t => !t.extra && t.xl && !MOD_BY_ID[t.mod].guia;

/* ------------------------------------------------------------ ESTADO/DB */
const DB_KEY  = 'rehavid_lss_dmaic_v1';
const CFG_KEY = 'rehavid_lss_cfg_v1';

const ST = {
  db:  { projects: [], activeId: null },
  cfg: { theme:'light', navmin:false, logos:{ arl:null, empresa:null, rehavid:null },
         brand:{ p1:'#0B5D6B', p2:'#12B3A6', p3:'#F5A623' },
         arlNombre:'', empresaNombre:'', autosave:true, lastRoute:'' },
  dirty:false, _t:null,

  load(){
    try { const r = localStorage.getItem(DB_KEY); if (r) ST.db = JSON.parse(r); } catch(e){ console.warn(e); }
    try { const c = localStorage.getItem(CFG_KEY); if (c) Object.assign(ST.cfg, JSON.parse(c)); } catch(e){}
    if (!ST.db.projects) ST.db.projects = [];
    if (!ST.db.projects.length) ST.newProject('Proyecto de mejora 1', true);
    if (!ST.proj()) ST.db.activeId = ST.db.projects[0].id;
  },
  save(now){
    ST.dirty = true;
    clearTimeout(ST._t);
    const go = () => {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(ST.db));
        localStorage.setItem(CFG_KEY, JSON.stringify(ST.cfg));
        ST.dirty = false; UI.saveBadge('ok');
      } catch(e){
        UI.saveBadge('bad');
        toast('No se pudo guardar: almacenamiento lleno. Exporta el proyecto (.json) para no perder datos.', 'bad', 9000);
      }
    };
    if (now) go(); else ST._t = setTimeout(go, 420);
  },
  proj(){ return ST.db.projects.find(p => p.id === ST.db.activeId) || null; },

  newProject(nombre, silent){
    const p = {
      id: uid(), nombre: nombre || 'Proyecto sin título',
      empresa:'', arl:'', area:'', lider:'', creado: hoy(), actualizado: hoy(),
      mods: { DEFINIR:true, MEDIR:true, ANALIZAR:true, MEJORAR:true, CONTROLAR:true },
      data: {}                                     // { toolId: {...} }
    };
    ST.db.projects.push(p); ST.db.activeId = p.id;
    if (!silent){ ST.save(true); toast('Proyecto creado: ' + p.nombre, 'ok'); }
    return p;
  },
  delProject(id){
    const i = ST.db.projects.findIndex(p => p.id === id); if (i < 0) return;
    ST.db.projects.splice(i, 1);
    if (!ST.db.projects.length) ST.newProject('Proyecto de mejora 1', true);
    if (!ST.proj()) ST.db.activeId = ST.db.projects[0].id;
    ST.save(true);
  },
  dupProject(id){
    const p = ST.db.projects.find(x => x.id === id); if (!p) return;
    const c = JSON.parse(JSON.stringify(p));
    c.id = uid(); c.nombre = p.nombre + ' (copia)'; c.creado = hoy();
    ST.db.projects.push(c); ST.db.activeId = c.id; ST.save(true);
    toast('Proyecto duplicado', 'ok');
  },
  /** datos de una herramienta del proyecto activo (crea si no existe) */
  d(toolId){
    const p = ST.proj(); if (!p) return {};
    if (!p.data[toolId]) p.data[toolId] = {};
    return p.data[toolId];
  },
  all(){ const p = ST.proj(); return p ? p.data : {}; },
  ctx(){ return { proj: ST.proj(), all: ST.all(), cfg: ST.cfg }; },
  touch(){ const p = ST.proj(); if (p) p.actualizado = hoy(); ST.save(); },
  modOn(m){
    if (MOD_BY_ID[m] && MOD_BY_ID[m].guia) return true;   // la guía nunca se apaga
    const p = ST.proj(); return !p || !p.mods ? true : p.mods[m] !== false;
  },
  activeMods(){ return FASES.filter(m => ST.modOn(m.id)); }
};

/* --------------------------------------------------------- completitud */
function toolFilled(t, data){
  const d = data || ST.d(t.id);
  return hasContent(d);
}
function hasContent(d){
  if (d === null || d === undefined) return false;
  if (typeof d === 'string') return d.trim() !== '';
  if (typeof d === 'number') return true;
  if (typeof d === 'boolean') return d;
  if (Array.isArray(d)) return d.some(hasContent);
  if (typeof d === 'object') return Object.keys(d).some(k => k !== '_' && hasContent(d[k]));
  return false;
}
function modProgress(mod){
  if (MOD_BY_ID[mod] && MOD_BY_ID[mod].guia) return 1;
  const ts = toolsOf(mod); if (!ts.length) return 0;
  return ts.filter(t => toolFilled(t)).length / ts.length;
}
function projProgress(){
  const ms = ST.activeMods(); if (!ms.length) return 0;
  return ms.reduce((a, m) => a + modProgress(m.id), 0) / ms.length;
}

/* -------------------------------------------------------------- toasts */
function toast(msg, tone, ms){
  const box = $('#toasts'); if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (tone || '');
  el.innerHTML = esc(msg);
  box.appendChild(el);
  setTimeout(() => { el.style.transition = '.25s'; el.style.opacity = '0'; el.style.transform = 'translateX(30px)';
    setTimeout(() => el.remove(), 260); }, ms || 3200);
}

/* -------------------------------------------------------------- modal */
function modal(opts){
  const o = document.createElement('div'); o.className = 'ovl';
  o.innerHTML = '<div class="mdl"><div class="mdl-h"><h3>' + esc(opts.title || '') + '</h3>' +
    '<div class="spacer"></div><button class="btn xs g" data-x>✕</button></div>' +
    '<div class="mdl-b">' + (opts.html || '') + '</div>' +
    '<div class="mdl-f">' + (opts.footer !== undefined ? opts.footer :
      '<button class="btn g" data-x>Cerrar</button>') + '</div></div>';
  document.body.appendChild(o);
  const close = () => o.remove();
  o.addEventListener('click', e => {
    if (e.target === o || e.target.closest('[data-x]')) close();
  });
  if (opts.onMount) opts.onMount(o, close);
  return { el:o, close };
}
function confirmar(msg, cb, danger){
  modal({ title:'Confirmar', html:'<p style="font-size:14px;line-height:1.6">' + esc(msg) + '</p>',
    footer:'<button class="btn g" data-x>Cancelar</button><button class="btn ' + (danger ? 'dg' : 'p') + '" data-ok>Aceptar</button>',
    onMount(o, close){ o.querySelector('[data-ok]').onclick = () => { close(); cb && cb(); }; } });
}
function prompt2(title, label, val, cb){
  modal({ title, html:'<div class="fld"><label>' + esc(label) + '</label><input class="inp" id="_pv" value="' + esc(val || '') + '"></div>',
    footer:'<button class="btn g" data-x>Cancelar</button><button class="btn p" data-ok>Aceptar</button>',
    onMount(o, close){
      const i = o.querySelector('#_pv'); setTimeout(() => { i.focus(); i.select(); }, 40);
      const ok = () => { const v = i.value.trim(); close(); if (v) cb(v); };
      o.querySelector('[data-ok]').onclick = ok;
      i.onkeydown = e => { if (e.key === 'Enter') ok(); };
    } });
}

/* ------------------------------------------------------------ descargas */
function download(blob, filename){
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(u); }, 600);
}
const b64ToBytes = b64 => { const s = atob(b64), n = s.length, a = new Uint8Array(n);
  for (let i = 0; i < n; i++) a[i] = s.charCodeAt(i); return a; };
function bytesToB64(u8){
  let s = '', C = 0x8000;
  for (let i = 0; i < u8.length; i += C) s += String.fromCharCode.apply(null, u8.subarray(i, i + C));
  return btoa(s);
}
async function fileToDataURL(file){
  return new Promise((res, rej) => { const r = new FileReader();
    r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}
/** Reduce una imagen a un ancho máximo para no reventar localStorage.
 *  `force` ('png'|'jpeg') obliga el formato de salida; si no, conserva
 *  PNG para PNG/SVG (necesitan transparencia) y JPEG para el resto. */
async function shrinkImage(dataURL, maxW, maxH, q, force){
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      let w = img.width || 600, h = img.height || 300;
      const s = Math.min(1, (maxW || 900) / w, (maxH || 900) / h);
      w = Math.max(1, Math.round(w * s)); h = Math.max(1, Math.round(h * s));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d');
      const keepAlpha = force ? force === 'png' : /^data:image\/(png|svg)/i.test(dataURL);
      if (!keepAlpha){ x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h); }
      x.drawImage(img, 0, 0, w, h);
      try { res(c.toDataURL(keepAlpha ? 'image/png' : 'image/jpeg', q || 0.86)); }
      catch(e){ res(dataURL); }
    };
    img.onerror = () => res(dataURL);
    img.src = dataURL;
  });
}

/* -------------------------------------------------------------- ROUTER */
const ROUTE = { mod:null, tool:null, view:'inicio' };
function go(view, mod, tool){
  ROUTE.view = view; ROUTE.mod = mod || null; ROUTE.tool = tool || null;
  ST.cfg.lastRoute = JSON.stringify(ROUTE); ST.save();
  UI.renderNav(); UI.renderView();
  const v = $('#view'); if (v) v.scrollTop = 0;
  if (window.innerWidth <= 900) document.body.classList.remove('navopen');
}
