/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC · TABLERO DE INTELIGENCIA DE NEGOCIO
   Consolida las 53 herramientas del proyecto en seis pestañas de lectura
   gerencial.  Sin librerías, sin red: sólo los helpers globales, CHART y ENGINE.

   API pública
     BI.render(ctx) -> string con el HTML completo de la página
     BI.kpis(ctx)   -> [{label, value, tone, hint}]
     BI.bind(root)  -> engancha las pestañas y los filtros propios del tablero

   Reglas de la casa
     · Todo dato de usuario pasa por esc() antes de entrar al HTML.
     · Nunca se muestra NaN/Infinity: los vacíos se dibujan como «—».
     · Los módulos apagados (ST.modOn) no aportan datos ni cuentan para el avance.
     · Con el proyecto vacío se dibujan estados vacíos con enlace a la herramienta.
   ========================================================================== */
'use strict';

const BI = (function(){

  /* ======================================================== utilidades === */

  const T_ = v => (v === null || v === undefined) ? '' : String(v).trim();
  const A_ = v => Array.isArray(v) ? v : [];
  /** ¿el valor es un número utilizable? (NaN, '', null y undefined no lo son)
   *  OJO: num() convierte NaN en 0, por eso aquí NO se puede usar num() a secas. */
  function fin(v){
    if (v === null || v === undefined || v === '') return false;
    if (typeof v === 'boolean') return false;
    if (typeof v === 'number') return isFinite(v);
    const s = String(v).trim();
    if (s === '' || !/\d/.test(s)) return false;
    return isFinite(num(s));
  }
  /** primer argumento finito; NaN si ninguno lo es */
  function firstFin(){
    for (let i = 0; i < arguments.length; i++) if (fin(arguments[i])) return num(arguments[i]);
    return NaN;
  }
  /** primer argumento con texto */
  function firstTxt(){
    for (let i = 0; i < arguments.length; i++){ const s = T_(arguments[i]); if (s) return s; }
    return '';
  }
  /** formato seguro: los vacíos salen como «—», nunca como NaN */
  function F(v, f){ return fin(v) ? fmt(num(v), f || 'n2') : '—'; }
  /** ancho de barra en % (0-100) siempre válido */
  function pw(v){ const n = num(v) * 100; return clamp(isFinite(n) ? n : 0, 0, 100).toFixed(1); }
  /** recorta un texto largo para tablas y etiquetas */
  function corto(s, n){ const t = T_(s); return t.length > n ? t.slice(0, Math.max(1, n - 1)) + '…' : t; }
  /** semáforo «más es mejor» / «menos es mejor» */
  const tono    = (v, ok, warn) => !fin(v) ? '' : (num(v) >= ok ? 'ok' : (num(v) >= warn ? 'warn' : 'bad'));
  const tonoInv = (v, ok, warn) => !fin(v) ? '' : (num(v) <= ok ? 'ok' : (num(v) <= warn ? 'warn' : 'bad'));

  /* categorías de ahorro del Project Charter (mismo orden del Excel original;
     «Cycle time» NO suma en el Total Benefit: =SUM(N23:O29,N31:O32)) */
  const CAT_AH = ['Garantia', 'Scrap', 'Retrabajo', 'Suministros', 'Material',
                  'Inventario', 'Inventory', 'Cycle time', 'Ingresos', 'Desperdicios'];
  const CAT_FUERA = 'Cycle time';
  const sumaAh = (rows, k) => A_(rows).reduce((a, r, i) =>
    a + (CAT_AH[i] === CAT_FUERA ? 0 : num(r[k])), 0);

  const ESTATUS_PLAN = ['REALIZADA', 'EN CURSO', 'RETRASADA', 'NO REALIZADA'];
  const TONO_ESTATUS = { 'REALIZADA':'ok', 'EN CURSO':'info', 'RETRASADA':'bad', 'NO REALIZADA':'warn' };

  const PESTANAS = [
    { k:'resumen',    n:'RESUMEN EJECUTIVO' },
    { k:'desempeno',  n:'DESEMPEÑO' },
    { k:'financiero', n:'FINANCIERO' },
    { k:'ejecucion',  n:'EJECUCIÓN' },
    { k:'calidad',    n:'CALIDAD DEL ANÁLISIS' },
    { k:'riesgos',    n:'RIESGOS Y DECISIONES' }
  ];

  /* estado propio del tablero (no se persiste: es sólo de la vista) */
  let TAB = 'resumen';
  const FIL = { mod:'', faltantes:false, resp:'', vencidas:false };

  /* ============================================================ acceso === */

  /** foto de los datos del proyecto para una pasada de dibujo */
  function snap(ctx){
    const c = ctx || ((typeof ST !== 'undefined' && ST.ctx) ? ST.ctx() : { proj:null, all:{}, cfg:{} });
    return { ctx:c, proj:c.proj || {}, all:c.all || {}, cfg:c.cfg || {}, _bi:{} };
  }
  /** ¿está encendido el módulo de esta herramienta? */
  function modActivo(mod){
    if (!mod) return true;
    return (typeof ST !== 'undefined' && ST.modOn) ? !!ST.modOn(mod) : true;
  }
  /** datos de una herramienta; {} si no existe o si su módulo está apagado */
  function D(S, id){
    const t = (typeof TOOL_BY_ID !== 'undefined') ? TOOL_BY_ID[id] : null;
    if (!t || !modActivo(t.mod)) return {};
    return (S.all && S.all[id]) || {};
  }
  /** salida del gancho `bi` de una herramienta (memorizada, a prueba de errores) */
  function BIH(S, id){
    if (S._bi[id]) return S._bi[id];
    let out = {};
    const t = (typeof TOOL_BY_ID !== 'undefined') ? TOOL_BY_ID[id] : null;
    if (t && typeof t.bi === 'function' && modActivo(t.mod)){
      try { out = t.bi(D(S, id), S.ctx) || {}; }
      catch(e){ console.warn('BI · gancho bi de', id, e); out = {}; }
    }
    S._bi[id] = out;
    return out;
  }
  const filas = (S, id, key) => A_(D(S, id)[key || 'rows']);

  /* ============================================================ ENGINE === */

  function eng(S){
    const o = { salud:NaN, semaforo:'', resumen:'', hallazgos:[], decisiones:[], riesgos:[], siguientePaso:null };
    if (typeof ENGINE === 'undefined' || !ENGINE || typeof ENGINE.global !== 'function') return o;
    try {
      const g = ENGINE.global(S.ctx) || {};
      o.salud       = fin(g.salud) ? clamp(num(g.salud), 0, 100) : NaN;
      o.semaforo    = T_(g.semaforo).toLowerCase();
      o.resumen     = T_(g.resumen);
      o.hallazgos   = A_(g.hallazgos);
      o.decisiones  = A_(g.decisiones);
      o.riesgos     = A_(g.riesgos);
      o.siguientePaso = g.siguientePaso || null;
    } catch(e){ console.warn('BI · ENGINE.global', e); }
    return o;
  }
  function narrativa(S){
    if (typeof ENGINE === 'undefined' || !ENGINE || typeof ENGINE.narrativa !== 'function') return '';
    try {
      const n = ENGINE.narrativa(S.ctx);
      return Array.isArray(n) ? n.map(T_).filter(Boolean).join(' ') : T_(n);
    } catch(e){ console.warn('BI · ENGINE.narrativa', e); return ''; }
  }
  function siguientePaso(S, g){
    let sp = g && g.siguientePaso;
    if ((!sp || !T_(sp.toolId)) && typeof ENGINE !== 'undefined' && ENGINE &&
        typeof ENGINE.recomendarSiguiente === 'function'){
      try { sp = ENGINE.recomendarSiguiente(S.ctx) || sp; } catch(e){ /* sin recomendación */ }
    }
    if (!sp) return null;
    const tid = T_(sp.toolId || sp.tool || sp.id);
    return { toolId: (typeof TOOL_BY_ID !== 'undefined' && TOOL_BY_ID[tid]) ? tid : '',
             motivo: firstTxt(sp.motivo, sp.texto, sp.text, sp.razon) };
  }
  /** normaliza un riesgo / decisión / hallazgo del motor a una forma dibujable */
  function itemNorm(x){
    if (x === null || x === undefined) return null;
    if (typeof x === 'string' || typeof x === 'number'){
      const s = T_(x); return s ? { text:s, sev:'media', icon:'•', toolId:'' } : null;
    }
    if (typeof x !== 'object') return null;
    const text = firstTxt(x.texto, x.text, x.msg, x.mensaje, x.titulo, x.title,
                          x.riesgo, x.decision, x.descripcion, x.detalle);
    if (!text) return null;
    let sev = T_(x.sev || x.severidad || x.nivel || x.prioridad).toLowerCase();
    if (sev === 'critica' || sev === 'crítica' || sev === 'alto') sev = 'alta';
    if (sev === 'medio') sev = 'media';
    if (sev === 'bajo' || sev === 'info') sev = 'baja';
    if (['alta', 'media', 'baja', 'ok'].indexOf(sev) < 0) sev = 'media';
    const tid = T_(x.toolId || x.tool || x.herramienta);
    return { text: text, sev: sev, icon: T_(x.icon) || '•',
             toolId: (typeof TOOL_BY_ID !== 'undefined' && TOOL_BY_ID[tid]) ? tid : '' };
  }
  const ORD_SEV = { alta:0, media:1, baja:2, ok:3 };
  function listaNorm(a){
    return A_(a).map(itemNorm).filter(Boolean)
      .sort((x, y) => (ORD_SEV[x.sev] - ORD_SEV[y.sev]));
  }

  /* ============================================ bloques de presentación === */

  function card(title, body, tight, tools){
    return '<div class="card">' +
      (title ? '<div class="card-h"><h3>' + esc(title) + '</h3><div class="spacer"></div>' +
        (tools || '') + '</div>' : '') +
      '<div class="card-b' + (tight ? ' tight' : '') + '">' + body + '</div></div>';
  }
  function vacio(msg, toolId, icono){
    const t = (typeof TOOL_BY_ID !== 'undefined') ? TOOL_BY_ID[toolId] : null;
    return '<div class="empty"><div class="ic">' + esc(icono || '📄') + '</div>' +
      '<div>' + esc(msg) + '</div>' +
      (t ? '<div style="margin-top:12px"><button class="btn sm p" data-goto="' + esc(t.id) + '">' +
           'Diligenciar «' + esc(t.title) + '» →</button></div>' : '') + '</div>';
  }
  function chartCard(title, kind, data, h, toolId, msgVacio){
    let svg = '';
    try { svg = CHART.draw(kind, data || {}, { h: h || 300 }); }
    catch(e){ console.warn('BI · gráfico', kind, e); svg = ''; }
    if (!svg) svg = '<div class="empty">Sin datos suficientes para graficar</div>';
    if (/class="empty"/.test(svg) && toolId) svg = vacio(msgVacio || 'Sin datos suficientes para graficar', toolId, '📊');
    return card(title, '<div class="dg-wrap">' + svg + '</div>');
  }
  function kpiHTML(list){
    const L = A_(list);
    if (!L.length) return '';
    return '<div class="kpis">' + L.map(k =>
      '<div class="kpi ' + esc(k.tone || '') + '">' +
      '<div class="k-l">' + esc(k.label) + '</div>' +
      '<div class="k-v">' + esc(k.value) + '</div>' +
      (k.hint ? '<div class="k-h">' + esc(k.hint) + '</div>' : '') + '</div>').join('') + '</div>';
  }
  function dato(l, v){
    return '<div><div style="font-size:10px;letter-spacing:.09em;text-transform:uppercase;' +
      'color:var(--tx3);font-weight:800">' + esc(l) + '</div>' +
      '<div style="font-size:13.5px;font-weight:600;margin-top:3px;line-height:1.35">' +
      esc(T_(v) || '—') + '</div></div>';
  }
  function barra(pctFrac, color){
    return '<div class="progress"><i style="width:' + pw(pctFrac) +
      '%' + (color ? ';background:' + esc(color) : '') + '"></i></div>';
  }
  /** tabla simple: cols=[{l,align,w}] · rows=[{c:[celdas ya escapadas], cls:''}] */
  function tabla(cols, rows){
    if (!A_(rows).length) return '';
    let h = '<div class="twrap"><table class="gt"><thead><tr>' +
      A_(cols).map(c => '<th' + (c.align === 'right' ? ' class="n"' : '') +
        (c.w ? ' style="min-width:' + esc(String(c.w)) + 'px"' : '') + '>' + esc(c.l) + '</th>').join('') +
      '</tr></thead><tbody>';
    rows.forEach(r => {
      h += '<tr' + (r.cls ? ' class="' + esc(r.cls) + '"' : '') + '>' +
        A_(r.c).map((celda, i) => '<td style="padding:7px 9px;font-size:12.5px' +
          ((cols[i] && cols[i].align === 'right') ? ';text-align:right;font-family:var(--fm)' : '') + '">' +
          celda + '</td>').join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  }
  function insBox(titulo, icono, items, sinTexto){
    if (!items.length) return card(titulo, '<div class="note ok">' + esc(sinTexto) + '</div>');
    return '<div class="ins" style="margin-bottom:16px">' +
      '<div class="ins-h">' + esc(icono) + ' ' + esc(titulo) + '</div><div class="ins-b">' +
      items.map(i =>
        '<div class="ins-item"><span class="ins-ic">' + esc(i.icon) + '</span>' +
        '<span style="flex:1">' + esc(i.text) + '</span>' +
        (i.toolId ? '<button class="btn xs g" data-goto="' + esc(i.toolId) + '">Abrir</button>' : '') +
        '<span class="ins-sev sev-' + esc(i.sev) + '">' + esc(i.sev) + '</span></div>').join('') +
      '</div></div>';
  }

  /* ================================================= métricas derivadas === */

  /** avance por fase DMAIC, respetando los módulos apagados */
  function avancePorFase(){
    if (typeof FASES === 'undefined') return [];
    return FASES.filter(m => modActivo(m.id)).map(m => ({
      id: m.id, nombre: m.name, color: m.color, letra: m.letter,
      pct: (typeof modProgress === 'function') ? num(modProgress(m.id)) : 0,
      total: (typeof toolsOf === 'function') ? toolsOf(m.id).length : 0,
      llenas: (typeof toolsOf === 'function')
        ? toolsOf(m.id).filter(t => (typeof toolFilled === 'function') && toolFilled(t)).length : 0
    }));
  }
  const avanceGlobal = () => (typeof projProgress === 'function') ? num(projProgress()) : NaN;

  /* ---- cronograma (Gantt de DEFINIR) ---- */
  const p01 = v => { const n = num(v); return isFinite(n) ? clamp(n > 1 ? n / 100 : n, 0, 1) : NaN; };
  const esAvanceFila = r => /AVANCE DEL PROYECTO/i.test(T_(r && r.tarea));
  /** =SUM(D10:D13)/COUNT(D10:D13) — promedio de las tareas que cuelgan de la fase */
  function faseAvance(rows, i){
    const v = [];
    for (let j = i + 1; j < rows.length; j++){
      if (rows[j].fase) break;
      if (fin(rows[j].progreso)) v.push(p01(rows[j].progreso));
    }
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
  }
  function ganttResumen(S){
    const rows = filas(S, 'definir.gantt');
    const tareas = rows.filter(r => T_(r.tarea) && !r.fase && !esAvanceFila(r));
    const fases = [];
    rows.forEach((r, i) => { if (r.fase && !esAvanceFila(r) && T_(r.tarea))
      fases.push({ nombre: T_(r.tarea), pct: faseAvance(rows, i) }); });
    const av = fases.length
      ? fases.reduce((a, f) => a + (fin(f.pct) ? num(f.pct) : 0), 0) / fases.length : NaN;
    const hoyISO = (typeof hoy === 'function') ? hoy() : '';
    const vencidas = tareas.filter(r => T_(r.fin) && dDiff(r.fin, hoyISO) > 0 && !(p01(r.progreso) >= 1));
    let ini = '', fin_ = '';
    rows.forEach(r => {
      if (T_(r.inicio) && (!ini || r.inicio < ini)) ini = T_(r.inicio);
      if (T_(r.fin) && (!fin_ || r.fin > fin_)) fin_ = T_(r.fin);
    });
    return { rows: rows, tareas: tareas, fases: fases, avance: av,
             vencidas: vencidas, inicio: ini, fin: fin_,
             terminadas: tareas.filter(r => p01(r.progreso) >= 1).length };
  }

  /* ---- plan de acción de MEJORAR ---- */
  const estatusDe = r => T_(r && r.estatus).toUpperCase();
  const esRealizada = r => estatusDe(r) === 'REALIZADA';
  function planResumen(S){
    const rows = filas(S, 'mejorar.plan_accion').filter(r => T_(r.accion) || T_(r.problema));
    const hoyISO = (typeof hoy === 'function') ? hoy() : '';
    const vencidas = rows.filter(r => T_(r.limite) && !esRealizada(r) && dDiff(r.limite, hoyISO) > 0);
    const porEstatus = {};
    ESTATUS_PLAN.forEach(e => porEstatus[e] = 0);
    let sinEstatus = 0;
    rows.forEach(r => {
      const e = estatusDe(r);
      if (porEstatus[e] !== undefined) porEstatus[e]++; else sinEstatus++;
    });
    const resp = {};
    rows.forEach(r => {
      const k = T_(r.responsable) || 'SIN RESPONSABLE';
      if (!resp[k]) resp[k] = { n:0, real:0, venc:0 };
      resp[k].n++;
      if (esRealizada(r)) resp[k].real++;
      if (T_(r.limite) && !esRealizada(r) && dDiff(r.limite, hoyISO) > 0) resp[k].venc++;
    });
    return { rows: rows, n: rows.length, real: porEstatus['REALIZADA'],
             curso: porEstatus['EN CURSO'], retr: porEstatus['RETRASADA'],
             nore: porEstatus['NO REALIZADA'], sinEstatus: sinEstatus,
             pct: safeDiv(porEstatus['REALIZADA'], rows.length),
             vencidas: vencidas, porResponsable: resp, hoy: hoyISO };
  }

  /* ---- calidad del proceso (MEDIR) ---- */
  function calidad(S){
    const dpmo = BIH(S, 'medir.dpmo'), ppm = BIH(S, 'medir.ppm'), yld = BIH(S, 'medir.yield'),
          rty  = BIH(S, 'medir.rty_fpy'), va = BIH(S, 'medir.valor_add'), dpu = BIH(S, 'medir.dpu');
    return {
      sigma:  firstFin(dpmo.dpmoSigma, ppm.ppmSigma, yld.yieldSigma),
      dpmo:   firstFin(dpmo.dpmo, ppm.ppmDefective),
      rty:    firstFin(rty.rty),
      fpy:    firstFin(rty.fpy),
      yield:  firstFin(yld['yield'], ppm.ppmYield, dpu.dpuYield),
      va:     firstFin(va.vaPorcentaje),
      dpu:    firstFin(dpu.dpu),
      defectos: firstFin(dpmo.dpmoDefectos, ppm.ppmDefects, dpu.dpuDefectos)
    };
  }

  /* ---- métricos clave del Project Charter ---- */
  function metricosCharter(S){
    const ch = D(S, 'definir.project_charter');
    const ci = D(S, 'controlar.charter_cierre');
    const def = A_(ch.metDef), cieCh = A_(ch.metCie), cieC = A_(ci.metCie);
    const out = [];
    def.forEach((m, i) => {
      const nombre = T_(m.nombre);
      if (!nombre) return;
      const base  = fin(m.base) ? num(m.base) : NaN;
      const obj   = fin(m.obj) ? num(m.obj) : NaN;
      const ideal = fin(m.ideal) ? num(m.ideal) : NaN;
      const rc = cieC[i] || {}, rd = cieCh[i] || {};
      const logrado = fin(rc.logrado) ? num(rc.logrado) : (fin(rd.logrado) ? num(rd.logrado) : NaN);
      let cumpl = NaN;
      if (fin(base) && fin(obj) && fin(logrado)){
        cumpl = (num(obj) - num(base) === 0)
          ? (Math.abs(logrado - obj) < 1e-9 ? 1 : NaN)
          : (logrado - base) / (obj - base);
      }
      out.push({ n: i + 1, nombre: nombre, base: base, obj: obj, ideal: ideal,
                 logrado: logrado, cumpl: cumpl,
                 mejoro: /^y|^s/i.test(T_(rc.mejoro || rd.mejoro)) });
    });
    return out;
  }

  /* ---- finanzas ---- */
  /** el costo de implementación se rastrea en RECURSOS: cifras escritas con $ */
  function costoImplementacion(S){
    const rows = filas(S, 'definir.recursos');
    let total = 0, n = 0;
    rows.forEach(r => {
      const txt = [r.descripcion, r.obtencion, r.recurso].map(T_).join(' ');
      const m = txt.match(/\$\s*[\d.,]+/g);
      if (!m) return;
      m.forEach(x => { const v = num(x); if (fin(v) && v > 0){ total += v; n++; } });
    });
    return { total: n ? total : NaN, n: n };
  }
  function finanzas(S){
    const ch  = D(S, 'definir.project_charter');
    const ahorros = A_(ch.ahorros);
    /* si nadie ha escrito una sola cifra de ahorro, no se muestra «$ 0»: se muestra «—» */
    const hayAhorros = ahorros.some(r => fin(r.hard) || fin(r.soft));
    const hard = hayAhorros ? sumaAh(ahorros, 'hard') : NaN;
    const soft = hayAhorros ? sumaAh(ahorros, 'soft') : NaN;
    const ben = BIH(S, 'definir.beneficios');
    const positivo = v => (fin(v) && num(v) > 0) ? num(v) : NaN;
    const escGoal = positivo(ben['Ahorro $ escenario GOAL']);
    const escDes  = positivo(ben['Ahorro $ escenario DESEADO']);
    const escRet  = positivo(ben['Ahorro $ escenario RETADORA']);
    const totalCharter = hayAhorros ? sumaAh(ahorros, 'hard') + sumaAh(ahorros, 'soft') : NaN;
    const proyectado = (fin(totalCharter) && num(totalCharter) > 0)
      ? num(totalCharter) : firstFin(escGoal, escDes, escRet);

    const cie = BIH(S, 'controlar.charter_cierre');
    const cumpleCierre = firstFin(cie['Cierre — cumplimiento de objetivos']);
    const plan = planResumen(S);
    let factor = NaN, base = '';
    if (fin(cumpleCierre) && num(cumpleCierre) > 0){
      factor = clamp(num(cumpleCierre), 0, 1);
      base = 'cumplimiento de los métricos de cierre';
    } else if (fin(plan.pct) && plan.n){
      factor = clamp(num(plan.pct), 0, 1);
      base = '% de acciones de mejora realizadas';
    }
    const logrado = (fin(proyectado) && fin(factor)) ? num(proyectado) * num(factor) : NaN;

    const costo = costoImplementacion(S);
    const roi = (fin(logrado) && fin(costo.total) && num(costo.total) > 0)
      ? (num(logrado) - num(costo.total)) / num(costo.total) : NaN;
    const payback = (fin(costo.total) && fin(logrado) && num(logrado) > 0)
      ? num(costo.total) / (num(logrado) / 12) : NaN;

    return { hard: hard, soft: soft, totalCharter: totalCharter, ahorros: ahorros,
             escGoal: escGoal, escDes: escDes, escRet: escRet,
             proyectado: proyectado, logrado: logrado, factor: factor, baseFactor: base,
             costo: costo.total, costoN: costo.n, roi: roi, payback: payback,
             costoUnitario: firstFin(ben['Costo unitario']) };
  }

  /* ---- resultado antes/después ---- */
  function resultado(S){
    const ad = BIH(S, 'controlar.grafico_antes_despues');
    const d  = D(S, 'controlar.grafico_antes_despues');
    const st = D(S, 'definir.series_tiempo');
    const rowsST = A_(st.rows).filter(r => fin(r.metrico));
    const promBase = rowsST.length ? avg(rowsST, 'metrico') : NaN;
    const objBase  = fin(st.objetivo) ? num(st.objetivo) : NaN;
    /* variación objetivo: la pactada en el charter (primer métrico con datos)
       o, si no la hay, la que se desprende de la línea base vs el target */
    let varObj = NaN;
    metricosCharter(S).some(m => {
      if (fin(m.base) && fin(m.obj) && num(m.base) !== 0){ varObj = (m.obj - m.base) / Math.abs(m.base); return true; }
      return false;
    });
    if (!fin(varObj) && fin(promBase) && fin(objBase) && num(promBase) !== 0)
      varObj = (objBase - promBase) / Math.abs(promBase);
    /* el gancho bi devuelve 0 cuando no hay comparación: sin periodos comparados
       no hay resultado que reportar, así que se deja vacío en vez de un 0 falso */
    const periodos = firstFin(ad['Antes-Después — periodos comparados']);
    const hayAD = fin(periodos) && num(periodos) > 0;
    const v = k => hayAD ? firstFin(ad[k]) : NaN;
    return {
      criterio: firstTxt(d.criterio, st.proceso),
      menorMejor: T_(d.direccion) !== 'Mayor es mejor',
      antes:   v('Antes-Después — promedio antes'),
      despues: v('Antes-Después — promedio después'),
      varAbs:  v('Antes-Después — variación absoluta'),
      varPct:  v('Antes-Después — variación %'),
      mejora:  v('Antes-Después — mejora lograda %'),
      periodos: hayAD ? num(periodos) : NaN,
      promBase: promBase, objetivo: objBase, varObjetivo: varObj
    };
  }

  /* ---- causas raíz y soluciones ---- */
  function cadena(S){
    const cl = D(S, 'definir.clarificacion_problema');
    const ch = D(S, 'definir.project_charter');
    const rz = D(S, 'analizar.descripcion_causa_raiz');
    const vc = filas(S, 'analizar.validacion_de_causas');
    const ss = filas(S, 'mejorar.seleccion_soluciones');
    const ds = filas(S, 'mejorar.descripcion_solucion');
    const pc = filas(S, 'controlar.plan_de_control');

    const problema = firstTxt(ch.problema, cl.definicion, rz.problema,
                              D(S, 'mejorar.descripcion_solucion').problema);
    const validadas = vc.filter(r => T_(r.causa) && num(r.check) === 1).map(r => T_(r.causa));
    const declaradas = [rz.causa1, rz.causa2].map(T_).filter(Boolean);
    const causas = declaradas.length ? declaradas : validadas;
    const elegidas = ss.filter(r => T_(r.sol) && /^s[ií]/i.test(T_(r.solucion))).map(r => T_(r.sol));
    const implementadas = ds.filter(r => T_(r.mejora)).map(r => T_(r.mejora));
    const soluciones = elegidas.length ? elegidas : implementadas;
    const controles = pc.filter(r => T_(r.caracteristica) || T_(r.paso))
      .map(r => firstTxt(r.caracteristica, r.paso));
    return { problema: problema, validadas: validadas, causas: causas,
             soluciones: soluciones, elegidas: elegidas, implementadas: implementadas,
             controles: controles };
  }

  /* ==================================================== KPIs del tablero == */

  function kpis(ctx){
    const S = snap(ctx);
    const q = calidad(S), f = finanzas(S), r = resultado(S), c = cadena(S);
    const plan = planResumen(S);
    const av = avanceGlobal();
    const K = [];

    K.push({ label:'NIVEL SIGMA', value: F(q.sigma, 'n2'),
      tone: tono(q.sigma, 4, 3), hint:'Con corrimiento de 1,5σ · meta 6,0' });
    K.push({ label:'DPMO', value: F(q.dpmo, 'n0'),
      tone: tonoInv(q.dpmo, 6210, 66807), hint:'Defectos por millón de oportunidades' });
    K.push({ label:'RTY', value: F(q.rty, 'p1'),
      tone: tono(q.rty, 0.9, 0.7), hint:'Rendimiento encadenado del proceso' });
    K.push({ label:'FPY', value: F(q.fpy, 'p1'),
      tone: tono(q.fpy, 0.9, 0.7), hint:'Bien a la primera, sin retrabajos' });
    K.push({ label:'% VALOR AGREGADO', value: F(q.va, 'p1'),
      tone: tono(q.va, 0.25, 0.1), hint:'Tiempo VA sobre el tiempo total' });
    K.push({ label:'YIELD', value: F(q.yield, 'p1'),
      tone: tono(q.yield, 0.95, 0.85), hint:'Unidades buenas sobre el total' });
    K.push({ label:'AHORRO PROYECTADO', value: F(f.proyectado, 'money'),
      tone: fin(f.proyectado) && num(f.proyectado) > 0 ? 'ok' : '',
      hint:'Total Benefit del Project Charter' });
    K.push({ label:'AHORRO LOGRADO', value: F(f.logrado, 'money'),
      tone: fin(f.logrado) && fin(f.proyectado) ? tono(safeDiv(f.logrado, f.proyectado), 0.8, 0.4) : '',
      hint: f.baseFactor ? 'Estimado con el ' + f.baseFactor : 'Falta el cierre del proyecto' });
    K.push({ label:'% AVANCE DMAIC', value: F(av, 'p0'),
      tone: tono(av, 0.9, 0.4), hint:'Herramientas diligenciadas por fase' });
    K.push({ label:'CAUSAS RAÍZ VALIDADAS', value: F(c.validadas.length, 'n0'),
      tone: c.validadas.length ? 'ok' : 'warn', hint:'CHECK = 1 en la verificación de causas' });
    K.push({ label:'ACCIONES DE MEJORA',
      value: plan.n ? (fmt(plan.real, 'n0') + ' / ' + fmt(plan.n, 'n0')) : '—',
      tone: plan.n ? tono(plan.pct, 0.99, 0.5) : '',
      hint: plan.n ? fmt(plan.pct, 'p0') + ' realizadas' : 'Plan de acción vacío' });
    K.push({ label:'VARIACIÓN LOGRADA', value: F(r.mejora, 'p1'),
      tone: fin(r.mejora) ? (num(r.mejora) > 0 ? (fin(r.varObjetivo) &&
              Math.abs(num(r.mejora)) + 1e-12 < Math.abs(num(r.varObjetivo)) ? 'warn' : 'ok') : 'bad') : '',
      hint: fin(r.varObjetivo) ? 'Objetivo pactado: ' + fmt(Math.abs(num(r.varObjetivo)), 'p1')
                               : 'Antes vs después del proyecto' });
    return K;
  }

  /* ================================================ 1 · RESUMEN EJECUTIVO = */

  function periodoProyecto(S){
    const g = ganttResumen(S);
    const ch = D(S, 'definir.project_charter');
    const plan = A_(ch.plan);
    let ini = g.inicio, fin_ = g.fin;
    plan.forEach(p => {
      if (T_(p.inicio) && (!ini || p.inicio < ini)) ini = T_(p.inicio);
      if (T_(p.fin) && (!fin_ || p.fin > fin_)) fin_ = T_(p.fin);
    });
    const gd = D(S, 'definir.gantt');
    if (!ini) ini = firstTxt(gd.inicio, S.proj.creado);
    if (!ini && !fin_) return '';
    return (ini ? fmt(ini, 'date') : '—') + '  →  ' + (fin_ ? fmt(fin_, 'date') : '—');
  }

  function secResumen(S){
    const g = eng(S), av = avanceGlobal(), fases = avancePorFase();
    const gd = D(S, 'definir.gantt'), ch = D(S, 'definir.project_charter');
    const nombre = firstTxt(ch.nombre, gd.proyecto, S.proj.nombre, 'Proyecto sin título');
    const nar = narrativa(S);
    const sem = ['ok', 'warn', 'bad'].indexOf(g.semaforo) >= 0 ? g.semaforo : '';
    const colSem = sem === 'ok' ? 'var(--ok)' : sem === 'warn' ? 'var(--warn)' : sem === 'bad' ? 'var(--bad)' : 'var(--br-2)';

    let h = card('Ficha del proyecto',
      '<div class="fgrid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:14px">' +
      dato('Proyecto', nombre) +
      dato('Empresa afiliada', firstTxt(S.proj.empresa, gd.empresa, D(S, 'definir.sipoc').empresa)) +
      dato('ARL contratante', S.proj.arl) +
      dato('Líder del proyecto', firstTxt(S.proj.lider, gd.responsable)) +
      dato('Área o proceso', firstTxt(S.proj.area, D(S, 'definir.series_tiempo').proceso)) +
      dato('Periodo', periodoProyecto(S)) +
      '</div>' +
      '<div style="margin-top:16px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<span style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--tx3)">' +
      'Avance global DMAIC</span><div class="spacer"></div>' +
      '<span style="font-family:var(--fm);font-weight:800;font-size:15px">' + esc(F(av, 'p0')) + '</span></div>' +
      barra(av) + '</div>');

    /* semáforo de salud + narrativa */
    h += '<div class="grid2">' +
      card('Salud del proyecto',
        '<div style="display:flex;align-items:center;gap:18px">' +
        '<div style="font-size:46px;font-weight:800;font-family:var(--fm);color:' + colSem + ';line-height:1">' +
        esc(fin(g.salud) ? fmt(Math.round(num(g.salud)), 'n0') : '—') + '</div>' +
        '<div style="flex:1">' + barra(fin(g.salud) ? num(g.salud) / 100 : 0,
          sem ? colSem : '') +
        '<div style="font-size:12.5px;color:var(--tx2);margin-top:8px">' +
        esc(g.resumen || 'El motor de análisis todavía no tiene datos suficientes para calificar el proyecto.') +
        '</div></div></div>') +
      card('Narrativa del proyecto',
        nar ? '<div style="font-size:13px;line-height:1.65">' + esc(nar) + '</div>'
            : '<div class="note">Diligencia las herramientas de DEFINIR y MEDIR para que el motor redacte la ' +
              'narrativa del proyecto.</div>') +
      '</div>';

    h += '<div class="sect-t">Indicadores clave</div>';
    h += kpiHTML(kpis(S.ctx));

    /* avance por fase */
    if (fases.length){
      h += chartCard('AVANCE POR FASE DMAIC', 'bar', {
        labels: fases.map(f => f.nombre),
        values: fases.map(f => num(f.pct) * 100),
        colors: fases.map(f => f.color),
        fmt:'pp1', title:'% de herramientas diligenciadas por fase'
      }, 300);
      h += card('Detalle del avance por fase',
        fases.map(f =>
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:11px">' +
          '<div class="nv-dot" style="background:' + esc(f.color) + ';width:28px;height:28px;flex:0 0 28px;font-size:12px">' +
          esc(f.letra) + '</div>' +
          '<div style="flex:1"><div style="display:flex;gap:8px;font-size:12px;margin-bottom:4px">' +
          '<b>' + esc(f.nombre) + '</b><div class="spacer"></div>' +
          '<span class="muted">' + esc(fmt(f.llenas, 'n0') + ' / ' + fmt(f.total, 'n0')) + '</span>' +
          '<span style="font-family:var(--fm);font-weight:800">' + esc(F(f.pct, 'p0')) + '</span></div>' +
          barra(f.pct, f.color) + '</div>' +
          '<button class="btn xs g" data-bimod="' + esc(f.id) + '">Ver</button></div>').join(''));
    } else {
      h += card('Avance por fase DMAIC', vacio('No hay fases activas: revisa los módulos habilitados del proyecto en Ajustes.'));
    }
    return h;
  }

  /* ======================================================= 2 · DESEMPEÑO = */

  function secDesempeno(S){
    const st = D(S, 'definir.series_tiempo');
    const rowsST = A_(st.rows).filter(r => fin(r.metrico));
    const pa = filas(S, 'definir.pareto').filter(r => fin(r.fre) && num(r.fre) > 0);
    const ad = D(S, 'controlar.grafico_antes_despues');
    const rowsAD = A_(ad.rows).filter(r => T_(r.periodo) || fin(r.antes) || fin(r.despues));
    const ms = D(S, 'medir.grafico_serie_tiempo');
    const r = resultado(S), q = calidad(S);

    let h = kpiHTML([
      { label:'PROMEDIO LÍNEA BASE', value: F(r.promBase, 'n2'),
        hint: rowsST.length ? fmt(rowsST.length, 'n0') + ' punto(s) medidos' : 'Sin línea base' },
      { label:'OBJETIVO (TARGET)', value: F(r.objetivo, 'n2'), hint:'Series de tiempo · DEFINIR' },
      { label:'PROMEDIO DESPUÉS', value: F(r.despues, 'n2'),
        hint: fin(r.periodos) ? fmt(r.periodos, 'n0') + ' periodo(s) comparados' : 'Sin datos de cierre' },
      { label:'MEJORA LOGRADA', value: F(r.mejora, 'p1'),
        tone: fin(r.mejora) ? (num(r.mejora) > 0 ? 'ok' : 'bad') : '',
        hint: r.menorMejor ? 'Menor es mejor' : 'Mayor es mejor' },
      { label:'NIVEL SIGMA', value: F(q.sigma, 'n2'), tone: tono(q.sigma, 4, 3) },
      { label:'DPU', value: F(q.dpu, 'n3'), tone: tonoInv(q.dpu, 0.1, 0.5), hint:'Defectos por unidad' }
    ]);

    /* serie de tiempo con objetivo y promedio */
    h += chartCard('SERIE DE TIEMPO — LÍNEA BASE vs OBJETIVO', 'lineTarget', {
      labels: rowsST.map((x, i) => T_(x.tiempo) || String(i + 1)),
      values: rowsST.map(x => num(x.metrico)),
      target: fin(st.objetivo) ? num(st.objetivo) : null,
      mean: rowsST.length ? avg(rowsST, 'metrico') : null,
      title: T_(st.proceso), ylabel: T_(st.proceso)
    }, 340, 'definir.series_tiempo', 'Todavía no hay línea base: carga la serie de tiempo del métrico.');

    /* pareto + antes/después */
    h += '<div class="grid2">';
    if (pa.length){
      h += chartCard('PARETO DE LA LÍNEA BASE', 'pareto', {
        labels: pa.map((x, i) => T_(x.cat) || ('Categoría ' + (i + 1))),
        values: pa.map(x => num(x.fre)), line80: 0.8
      }, 320);
    } else {
      h += card('PARETO DE LA LÍNEA BASE',
        vacio('Sin categorías con frecuencia registrada.', 'definir.pareto', '📊'));
    }
    if (rowsAD.length){
      h += chartCard('ANTES Y DESPUÉS DEL PROYECTO', 'beforeAfter', {
        labels: rowsAD.map((x, i) => T_(x.periodo) || String(i + 1)),
        antes:   rowsAD.map(x => fin(x.antes) ? num(x.antes) : null),
        despues: rowsAD.map(x => fin(x.despues) ? num(x.despues) : null),
        names:['ANTES', 'DESPUES'],
        meanBefore: fin(r.antes) ? num(r.antes) : null,
        meanAfter:  fin(r.despues) ? num(r.despues) : null,
        menorMejor: r.menorMejor, title: T_(ad.criterio), ylabel: T_(ad.criterio)
      }, 320);
    } else {
      h += card('ANTES Y DESPUÉS DEL PROYECTO',
        vacio('Aún no hay comparación antes/después del proyecto.', 'controlar.grafico_antes_despues', '📈'));
    }
    h += '</div>';

    /* histograma de la línea base (si hay datos suficientes) */
    const valores = rowsST.map(x => num(x.metrico));
    if (valores.length >= 3){
      h += chartCard('DISTRIBUCIÓN DE LA LÍNEA BASE (HISTOGRAMA)', 'histogram',
        { values: valores, title: T_(st.proceso) }, 320);
    }

    /* serie mensual de MEDIR */
    const SM = ms.serie || {}, LM = [], VM = [];
    ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
     'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE', 'ENERO'].forEach((mes, i) => {
      const v = SM['m' + (i + 1) + '.valor'];
      if (v !== '' && v !== null && v !== undefined){ LM.push(mes); VM.push(num(v)); }
    });
    if (VM.length){
      h += chartCard('SERIE DE TIEMPO MENSUAL (MEDIR)', 'line',
        { labels: LM, values: VM, name: T_(ms.criterio) || 'Valor' }, 320);
    }

    /* tabla de métricos clave del charter */
    const M = metricosCharter(S);
    if (M.length){
      const rows = M.map(m => {
        const tn = !fin(m.cumpl) ? '' : (num(m.cumpl) >= 1 ? 'cell-ok' : (num(m.cumpl) >= 0.7 ? 'cell-warn' : 'cell-bad'));
        const pill = !fin(m.cumpl)
          ? '<span class="pill">PENDIENTE</span>'
          : (num(m.cumpl) >= 1 ? '<span class="pill ok">CUMPLE</span>'
            : (num(m.cumpl) >= 0.7 ? '<span class="pill warn">CERCA</span>'
              : '<span class="pill bad">NO CUMPLE</span>'));
        return { cls: tn, c:[
          esc(m.nombre),
          esc(F(m.base, 'n2')), esc(F(m.obj, 'n2')), esc(F(m.ideal, 'n2')),
          esc(F(m.logrado, 'n2')),
          esc(fin(m.cumpl) ? fmt(clamp(num(m.cumpl), -9.99, 9.99), 'p0') : '—'),
          pill
        ] };
      });
      h += card('MÉTRICOS CLAVE DEL PROJECT CHARTER',
        tabla([{ l:'MÉTRICO', w:220 }, { l:'BASELINE', align:'right' }, { l:'OBJETIVO', align:'right' },
               { l:'IDEAL', align:'right' }, { l:'LOGRADO', align:'right' },
               { l:'% CUMPLIMIENTO', align:'right' }, { l:'ESTADO' }], rows) +
        '<div class="gt-bar"><span class="muted" style="font-size:11.5px">' +
        '% cumplimiento = (LOGRADO − BASELINE) / (OBJETIVO − BASELINE)</span><div class="spacer"></div>' +
        '<button class="btn xs g" data-goto="definir.project_charter">Project Charter</button>' +
        '<button class="btn xs g" data-goto="controlar.charter_cierre">Cierre del proyecto</button></div>',
        true);
    } else {
      h += card('MÉTRICOS CLAVE DEL PROJECT CHARTER',
        vacio('Registra los Metricos Clave de la fase DEFINIR para comparar Baseline, Objetivo, Ideal y Logrado.',
              'definir.project_charter', '📋'));
    }
    return h;
  }

  /* ====================================================== 3 · FINANCIERO = */

  function secFinanciero(S){
    const f = finanzas(S);
    const cats = [];
    CAT_AH.forEach((c, i) => {
      const r = f.ahorros[i] || {};
      const hard = num(r.hard), soft = num(r.soft);
      if (hard || soft) cats.push({ cat: c, hard: hard, soft: soft, fuera: c === CAT_FUERA });
    });
    const dentro = cats.filter(c => !c.fuera);

    let h = kpiHTML([
      { label:'HARD BENEFIT', value: F(f.hard, 'money'),
        tone: f.hard > 0 ? 'ok' : '', hint:'Ahorro duro y verificable' },
      { label:'SOFT BENEFIT', value: F(f.soft, 'money'), hint:'Beneficio no monetizable directo' },
      { label:'TOTAL BENEFIT', value: F(f.totalCharter, 'money'),
        tone: f.totalCharter > 0 ? 'ok' : '', hint:'Sin «Cycle time», igual al Excel' },
      { label:'AHORRO PROYECTADO', value: F(f.proyectado, 'money'),
        hint: f.totalCharter > 0 ? 'Project Charter' : 'Escenario de «Beneficios»' },
      { label:'AHORRO LOGRADO', value: F(f.logrado, 'money'),
        tone: fin(f.logrado) && fin(f.proyectado) ? tono(safeDiv(f.logrado, f.proyectado), 0.8, 0.4) : '',
        hint: f.baseFactor ? 'Estimado con el ' + f.baseFactor : 'Falta cerrar el proyecto' },
      { label:'COSTO DE IMPLEMENTACIÓN', value: F(f.costo, 'money'),
        hint: f.costoN ? fmt(f.costoN, 'n0') + ' cifra(s) detectadas en RECURSOS' : 'Sin costo registrado' },
      { label:'ROI SIMPLE', value: F(f.roi, 'p0'),
        tone: tono(f.roi, 1, 0), hint:'(Ahorro logrado − Costo) / Costo' },
      { label:'PAYBACK', value: fin(f.payback) ? (fmt(f.payback, 'n1') + ' meses') : '—',
        tone: tonoInv(f.payback, 6, 12), hint:'Con el ahorro logrado anualizado' }
    ]);

    /* hard vs soft por categoría */
    if (dentro.length){
      h += chartCard('HARD vs SOFT BENEFIT POR CATEGORÍA', 'stacked', {
        labels: dentro.map(c => c.cat),
        series: [{ name:'HARD BENEFIT', values: dentro.map(c => c.hard), color:'#0B5D6B' },
                 { name:'SOFT BENEFIT', values: dentro.map(c => c.soft), color:'#12B3A6' }],
        fmt:'money', title:'Ahorros pactados en el Project Charter'
      }, 340);
    } else {
      h += card('HARD vs SOFT BENEFIT POR CATEGORÍA',
        vacio('Registra los ahorros por categoría en el Project Charter.', 'definir.project_charter', '💰'));
    }

    /* waterfall del ahorro */
    if (dentro.length){
      const labels = ['LÍNEA BASE'].concat(dentro.map(c => c.cat)).concat(['BENEFICIO TOTAL']);
      const values = [0].concat(dentro.map(c => c.hard + c.soft)).concat([f.totalCharter]);
      const types  = ['t'].concat(dentro.map(() => '')).concat(['t']);
      h += chartCard('CASCADA DEL AHORRO DEL PROYECTO', 'waterfall',
        { labels: labels, values: values, types: types, fmt:'money',
          title:'De la línea base al beneficio total pactado' }, 340);
    }

    /* escenarios de la hoja Beneficios */
    if (fin(f.escDes) || fin(f.escGoal) || fin(f.escRet)){
      h += chartCard('AHORRO POR ESCENARIO (HOJA «BENEFICIOS»)', 'bar', {
        labels:['DESEADO', 'GOAL', 'RETADORA'],
        values:[fin(f.escDes) ? num(f.escDes) : 0, fin(f.escGoal) ? num(f.escGoal) : 0,
                fin(f.escRet) ? num(f.escRet) : 0],
        tones:['info', 'ok', 'warn'], fmt:'money',
        title: fin(f.costoUnitario) ? ('Costo unitario: ' + fmt(f.costoUnitario, 'money')) : ''
      }, 300);
    }

    /* nota metodológica */
    h += '<div class="note">' +
      '<b>Cómo se calcula.</b> El AHORRO PROYECTADO es el <i>Total Benefit</i> del Project Charter ' +
      '(hard + soft, sin «Cycle time», igual a la fórmula del Excel). ' +
      'El AHORRO LOGRADO es un estimado: ahorro proyectado × ' +
      esc(f.baseFactor || 'cumplimiento del cierre') + '. ' +
      'El COSTO DE IMPLEMENTACIÓN se rastrea en DEFINIR › Recursos: escribe las cifras con el signo $ ' +
      '(por ejemplo «$ 4.500.000 de honorarios») para que entren al ROI y al payback.' +
      '</div>';

    if (!fin(f.costo)){
      h += card('Costo de implementación',
        vacio('No hay cifras en $ registradas en RECURSOS: sin costo no se puede calcular el ROI ni el payback.',
              'definir.recursos', '🧾'));
    }
    return h;
  }

  /* ======================================================= 4 · EJECUCIÓN = */

  function secEjecucion(S){
    const g = ganttResumen(S), plan = planResumen(S);
    const gd = D(S, 'definir.gantt');
    const fases = avancePorFase();

    let h = kpiHTML([
      { label:'AVANCE DEL CRONOGRAMA', value: F(g.avance, 'p0'),
        tone: tono(g.avance, 0.99, 0.5), hint:'Promedio de las fases del Gantt' },
      { label:'TAREAS DEL PROYECTO', value: F(g.tareas.length, 'n0'),
        hint: fmt(g.terminadas, 'n0') + ' terminada(s)' },
      { label:'TAREAS VENCIDAS', value: F(g.vencidas.length, 'n0'),
        tone: g.vencidas.length ? 'bad' : 'ok', hint:'Fecha fin pasada y avance < 100 %' },
      { label:'ACCIONES DE MEJORA', value: plan.n ? fmt(plan.n, 'n0') : '—',
        hint: plan.n ? fmt(plan.real, 'n0') + ' realizada(s)' : 'Plan de acción vacío' },
      { label:'% ACCIONES REALIZADAS', value: F(plan.pct, 'p0'),
        tone: plan.n ? tono(plan.pct, 0.99, 0.5) : '' },
      { label:'ACCIONES VENCIDAS', value: F(plan.vencidas.length, 'n0'),
        tone: plan.vencidas.length ? 'bad' : 'ok', hint:'Fecha límite pasada sin cerrar' }
    ]);

    /* Gantt del proyecto */
    const tareasG = g.rows.filter(r => T_(r.tarea) && T_(r.inicio) && T_(r.fin));
    if (tareasG.length){
      h += chartCard('DIAGRAMA DE GANTT DEL PROYECTO', 'gantt', {
        tasks: tareasG.map((r) => {
          const i = g.rows.indexOf(r);
          const avc = r.fase ? faseAvance(g.rows, i) : p01(r.progreso);
          return { label: corto(r.tarea, 46), start: T_(r.inicio), end: T_(r.fin),
                   progress: fin(avc) ? num(avc) : 0, fase: !!r.fase,
                   asignado: T_(r.asignado),
                   tone: (!r.fase && T_(r.fin) && dDiff(r.fin, plan.hoy) > 0 && !(p01(r.progreso) >= 1)) ? 'bad' : '' };
        }),
        start: firstTxt(gd.inicio, g.inicio, plan.hoy), semana: Math.max(1, num(gd.semana) || 1),
        days: 56, hoy: plan.hoy
      }, 420);
    } else {
      h += card('DIAGRAMA DE GANTT DEL PROYECTO',
        vacio('El cronograma no tiene tareas con fecha de inicio y fin.', 'definir.gantt', '🗓️'));
    }

    /* avance por fase: del Gantt si existe; si no, de la completitud de la app */
    const barrasFase = g.fases.length
      ? { labels: g.fases.map(x => corto(x.nombre, 22)),
          values: g.fases.map(x => (fin(x.pct) ? num(x.pct) : 0) * 100),
          titulo:'% de avance por fase del cronograma' }
      : { labels: fases.map(x => x.nombre), values: fases.map(x => num(x.pct) * 100),
          titulo:'% de herramientas diligenciadas por fase' };
    if (barrasFase.labels.length){
      h += chartCard('% AVANCE POR FASE', 'hbar',
        { labels: barrasFase.labels, values: barrasFase.values, fmt:'pp1',
          title: barrasFase.titulo }, 300);
    }

    /* tareas vencidas del cronograma */
    if (g.vencidas.length){
      h += card('TAREAS DEL CRONOGRAMA VENCIDAS',
        tabla([{ l:'TAREA', w:240 }, { l:'ASIGNADO A' }, { l:'FIN' },
               { l:'DÍAS DE ATRASO', align:'right' }, { l:'AVANCE', align:'right' }],
          g.vencidas.map(r => ({ cls:'cell-bad', c:[
            esc(corto(r.tarea, 70)), esc(T_(r.asignado) || '—'), esc(fmt(r.fin, 'date')),
            esc(fmt(dDiff(r.fin, plan.hoy), 'n0')),
            esc(fin(p01(r.progreso)) ? fmt(p01(r.progreso), 'p0') : '0%')
          ] }))) +
        '<div class="gt-bar"><div class="spacer"></div>' +
        '<button class="btn xs g" data-goto="definir.gantt">Abrir el Gantt</button></div>', true);
    }

    /* plan de acción */
    h += '<div class="sect-t">Plan de acción de la fase MEJORAR</div>';
    if (!plan.n){
      h += card('PLAN DE ACCIÓN',
        vacio('No hay acciones de mejora registradas.', 'mejorar.plan_accion', '🛠️'));
      return h;
    }

    h += '<div class="grid2">';
    h += chartCard('ESTATUS DE LAS ACCIONES', 'pie', {
      labels: ESTATUS_PLAN.concat(plan.sinEstatus ? ['SIN ESTATUS'] : []),
      values: [plan.real, plan.curso, plan.retr, plan.nore].concat(plan.sinEstatus ? [plan.sinEstatus] : []),
      tones:  ['ok', 'info', 'bad', 'warn', ''],
      fmt:'n0', title:'Distribución del plan de acción'
    }, 300);

    /* cumplimiento por responsable */
    const resps = Object.keys(plan.porResponsable);
    if (resps.length){
      resps.sort((a, b) => safeDiv(plan.porResponsable[b].real, plan.porResponsable[b].n) -
                           safeDiv(plan.porResponsable[a].real, plan.porResponsable[a].n));
      h += chartCard('CUMPLIMIENTO POR RESPONSABLE', 'hbar', {
        labels: resps.map(r => corto(r, 28)),
        values: resps.map(r => num(safeDiv(plan.porResponsable[r].real, plan.porResponsable[r].n)) * 100),
        fmt:'pp1', title:'% de acciones realizadas'
      }, Math.max(220, 60 + resps.length * 34));
    }
    h += '</div>';

    /* tabla por responsable */
    if (resps.length){
      h += card('DETALLE POR RESPONSABLE',
        tabla([{ l:'RESPONSABLE', w:200 }, { l:'ACCIONES', align:'right' },
               { l:'REALIZADAS', align:'right' }, { l:'VENCIDAS', align:'right' },
               { l:'CUMPLIMIENTO', align:'right' }],
          resps.map(r => {
            const x = plan.porResponsable[r], p = safeDiv(x.real, x.n);
            return { cls: x.venc ? 'cell-warn' : (num(p) >= 1 ? 'cell-ok' : ''), c:[
              esc(r), esc(fmt(x.n, 'n0')), esc(fmt(x.real, 'n0')), esc(fmt(x.venc, 'n0')),
              esc(F(p, 'p0'))
            ] };
          })), true);
    }

    /* acciones vencidas */
    if (plan.vencidas.length){
      h += card('ACCIONES DE MEJORA VENCIDAS',
        tabla([{ l:'ACCIÓN DE MEJORA', w:260 }, { l:'RESPONSABLE' }, { l:'FECHA LÍMITE' },
               { l:'DÍAS VENCIDA', align:'right' }, { l:'ESTATUS' }],
          plan.vencidas.map(r => ({ cls:'cell-bad', c:[
            esc(corto(firstTxt(r.accion, r.problema), 80)),
            esc(T_(r.responsable) || '—'),
            esc(fmt(r.limite, 'date')),
            esc(fmt(dDiff(r.limite, plan.hoy), 'n0')),
            '<span class="pill ' + esc(TONO_ESTATUS[estatusDe(r)] === 'ok' ? 'ok' : 'warn') + '">' +
              esc(estatusDe(r) || 'SIN ESTATUS') + '</span>'
          ] }))) +
        '<div class="gt-bar"><span class="muted" style="font-size:11.5px">' +
        'Vencida = fecha límite pasada y estatus distinto de REALIZADA.</span><div class="spacer"></div>' +
        '<button class="btn xs p" data-goto="mejorar.plan_accion">Abrir el plan de acción</button></div>', true);
    } else {
      h += '<div class="note ok">Ninguna acción del plan de mejora está vencida.</div>';
    }
    return h;
  }

  /* ============================================ 5 · CALIDAD DEL ANÁLISIS = */

  function completitud(){
    if (typeof FASES === 'undefined' || typeof toolsOf !== 'function') return [];
    return FASES.filter(m => modActivo(m.id)).map(m => {
      const ts = toolsOf(m.id);
      const items = ts.map(t => ({ id: t.id, title: t.title,
        llena: (typeof toolFilled === 'function') ? !!toolFilled(t) : false }));
      const llenas = items.filter(x => x.llena).length;
      return { id: m.id, nombre: m.name, color: m.color, letra: m.letter,
               total: items.length, llenas: llenas,
               pct: items.length ? llenas / items.length : 0, items: items };
    });
  }

  function secCalidad(S){
    const mods = completitud();
    const totalT = mods.reduce((a, m) => a + m.total, 0);
    const totalL = mods.reduce((a, m) => a + m.llenas, 0);

    let h = kpiHTML([
      { label:'HERRAMIENTAS CON DATOS', value: totalT ? (fmt(totalL, 'n0') + ' / ' + fmt(totalT, 'n0')) : '—',
        tone: totalT ? tono(safeDiv(totalL, totalT), 0.9, 0.4) : '',
        hint:'Sólo de los módulos activos' },
      { label:'COMPLETITUD GLOBAL', value: F(safeDiv(totalL, totalT), 'p0'),
        tone: tono(safeDiv(totalL, totalT), 0.9, 0.4) },
      { label:'FASES ACTIVAS', value: F(mods.length, 'n0'), hint:'De 5 fases DMAIC' },
      { label:'HERRAMIENTAS PENDIENTES', value: F(totalT - totalL, 'n0'),
        tone: (totalT - totalL) ? 'warn' : 'ok' }
    ]);

    if (mods.length){
      h += chartCard('COMPLETITUD POR MÓDULO', 'bar', {
        labels: mods.map(m => m.nombre),
        values: mods.map(m => num(m.pct) * 100),
        colors: mods.map(m => m.color), fmt:'pp1',
        title:'% de herramientas diligenciadas'
      }, 300);
    }

    /* filtros del panel */
    const opciones = ['<option value="">Todos los módulos</option>'].concat(
      mods.map(m => '<option value="' + esc(m.id) + '"' + (FIL.mod === m.id ? ' selected' : '') + '>' +
        esc(m.nombre) + '</option>')).join('');
    h += '<div class="card"><div class="card-b" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">' +
      '<div class="fld" style="min-width:230px;margin:0"><label>Módulo</label>' +
      '<select class="inp" data-bifmod>' + opciones + '</select></div>' +
      '<div class="chkw"><input type="checkbox" data-bifalt' + (FIL.faltantes ? ' checked' : '') + '>' +
      '<span>Mostrar sólo las herramientas pendientes</span></div>' +
      '</div></div>';

    const visibles = mods.filter(m => !FIL.mod || m.id === FIL.mod);
    visibles.forEach(m => {
      const items = m.items.filter(x => !FIL.faltantes || !x.llena);
      const cuerpo = items.length
        ? '<div class="grid3">' + items.map(x =>
            '<div style="display:flex;align-items:center;gap:9px;padding:7px 9px;border:1px solid var(--bd);' +
            'border-radius:8px;background:var(--d)">' +
            '<span class="pill ' + (x.llena ? 'ok' : 'warn') + '">' + (x.llena ? 'con datos' : 'vacío') + '</span>' +
            '<span style="flex:1;font-size:12.3px;line-height:1.3;min-width:0">' + esc(corto(x.title, 46)) + '</span>' +
            '<button class="btn xs ' + (x.llena ? 'g' : 'p') + '" data-goto="' + esc(x.id) + '">' +
            (x.llena ? 'Ver' : 'Llenar') + '</button></div>').join('') + '</div>'
        : '<div class="note ok">Todas las herramientas de esta fase tienen datos.</div>';
      h += card(m.nombre + ' · ' + fmt(m.llenas, 'n0') + ' / ' + fmt(m.total, 'n0') + ' (' + fmt(m.pct, 'p0') + ')',
        barra(m.pct, m.color) + '<div style="height:12px"></div>' + cuerpo);
    });
    if (!visibles.length) h += card('Completitud', vacio('No hay módulos activos para mostrar.'));

    /* trazabilidad */
    h += '<div class="sect-t">Trazabilidad del proyecto</div>';
    h += trazabilidad(S);
    return h;
  }

  function eslabon(titulo, lista, roto, toolId, ayuda){
    const items = A_(lista).filter(Boolean).slice(0, 5);
    return '<div class="a3-a" style="min-width:0">' +
      '<div class="h" style="background:' + (roto ? 'var(--bad)' : 'var(--br-4, #0B5D6B)') + '">' +
      esc(titulo) + (roto ? ' · ESLABÓN ROTO' : '') + '</div>' +
      '<div class="b" style="min-height:120px;font-size:12.3px;line-height:1.5">' +
      (items.length
        ? '<ul style="margin:0;padding-left:16px">' + items.map(x =>
            '<li style="margin-bottom:5px">' + esc(corto(x, 120)) + '</li>').join('') + '</ul>' +
          (A_(lista).length > items.length
            ? '<div class="muted" style="font-size:11px;margin-top:5px">+ ' +
              fmt(A_(lista).length - items.length, 'n0') + ' más</div>' : '')
        : '<div class="muted" style="font-size:12px">' + esc(ayuda) + '</div>') +
      '<div style="margin-top:9px"><button class="btn xs ' + (roto ? 'p' : 'g') + '" data-goto="' +
      esc(toolId) + '">' + (roto ? 'Completar' : 'Abrir') + '</button></div>' +
      '</div></div>';
  }

  function trazabilidad(S){
    const c = cadena(S);
    const rotos = [];
    if (!c.problema) rotos.push('No hay ENUNCIADO DEL PROBLEMA: sin problema declarado no se puede trazar nada.');
    if (!c.causas.length) rotos.push('No hay CAUSA RAÍZ validada: las soluciones estarían atacando síntomas.');
    if (!c.soluciones.length) rotos.push('No hay SOLUCIÓN elegida ni implementada para las causas raíz.');
    if (!c.controles.length) rotos.push('No hay PUNTO DE CONTROL: la mejora no está protegida y se pierde con el tiempo.');
    if (c.causas.length && !c.validadas.length)
      rotos.push('Hay causas raíz declaradas pero ninguna quedó VERIFICADA con datos (CHECK = 1).');

    let h = card('CADENA PROBLEMA → CAUSA RAÍZ → SOLUCIÓN → CONTROL',
      '<div class="a3" style="grid-template-columns:repeat(4,minmax(0,1fr))">' +
      eslabon('1 · PROBLEMA', c.problema ? [c.problema] : [], !c.problema,
        'definir.clarificacion_problema', 'Declara el problema con dato, lugar y periodo.') +
      eslabon('2 · CAUSA RAÍZ', c.causas, !c.causas.length,
        'analizar.descripcion_causa_raiz', 'Valida las causas y declara la causa raíz.') +
      eslabon('3 · SOLUCIÓN', c.soluciones, !c.soluciones.length,
        'mejorar.seleccion_soluciones', 'Elige e implementa las soluciones contra la causa raíz.') +
      eslabon('4 · CONTROL', c.controles, !c.controles.length,
        'controlar.plan_de_control', 'Define qué se vigila, con qué frecuencia y quién responde.') +
      '</div>');

    h += rotos.length
      ? '<div class="note bad"><b>Eslabones rotos de la trazabilidad</b><br>' +
        rotos.map(x => '· ' + esc(x)).join('<br>') + '</div>'
      : '<div class="note ok">La cadena problema → causa raíz → solución → control está completa: ' +
        'cada eslabón tiene evidencia registrada en la herramienta correspondiente.</div>';

    /* causas verificadas vs declaradas */
    if (c.validadas.length || c.causas.length){
      h += card('Causas raíz verificadas con datos',
        tabla([{ l:'CAUSA', w:320 }, { l:'ESTADO' }],
          c.causas.map(x => ({
            cls: c.validadas.some(v => v.toLowerCase() === x.toLowerCase()) ? 'cell-ok' : 'cell-warn',
            c:[ esc(corto(x, 120)),
                c.validadas.some(v => v.toLowerCase() === x.toLowerCase())
                  ? '<span class="pill ok">VERIFICADA</span>'
                  : '<span class="pill warn">SIN VERIFICAR</span>' ]
          })).concat(c.validadas.filter(v =>
            !c.causas.some(x => x.toLowerCase() === v.toLowerCase())).map(v => ({
              cls:'', c:[ esc(corto(v, 120)), '<span class="pill">VERIFICADA, NO DECLARADA</span>' ] })))
        ), true);
    }
    return h;
  }

  /* ================================================ 6 · RIESGOS Y DECISIONES */

  function secRiesgos(S){
    const g = eng(S);
    const riesgos = listaNorm(g.riesgos);
    const decisiones = listaNorm(g.decisiones);
    const hallazgos = listaNorm(g.hallazgos);
    const sp = siguientePaso(S, g);
    const plan = planResumen(S), gt = ganttResumen(S), c = cadena(S), f = finanzas(S);

    /* riesgos operativos que el tablero detecta por su cuenta */
    const propios = [];
    if (plan.vencidas.length)
      propios.push({ text: fmt(plan.vencidas.length, 'n0') + ' acción(es) del plan de mejora con la fecha límite vencida.',
        sev:'alta', icon:'⏰', toolId:'mejorar.plan_accion' });
    if (gt.vencidas.length)
      propios.push({ text: fmt(gt.vencidas.length, 'n0') + ' tarea(s) del cronograma vencidas sin llegar al 100 %.',
        sev:'media', icon:'🗓️', toolId:'definir.gantt' });
    if (!c.causas.length)
      propios.push({ text:'El proyecto no tiene causa raíz declarada: las soluciones se estarían diseñando contra el síntoma.',
        sev:'alta', icon:'🎯', toolId:'analizar.descripcion_causa_raiz' });
    if (c.soluciones.length && !c.controles.length)
      propios.push({ text:'Hay soluciones implementadas sin plan de control: la mejora no está protegida en el tiempo.',
        sev:'alta', icon:'🛡️', toolId:'controlar.plan_de_control' });
    if (!fin(f.proyectado) || num(f.proyectado) <= 0)
      propios.push({ text:'El proyecto no tiene ahorro cuantificado: sin cifra financiera pierde patrocinio ante la ARL y la empresa.',
        sev:'media', icon:'💰', toolId:'definir.project_charter' });
    const sinResp = plan.rows.filter(r => !T_(r.responsable)).length;
    if (sinResp)
      propios.push({ text: fmt(sinResp, 'n0') + ' acción(es) de mejora sin responsable asignado.',
        sev:'media', icon:'👤', toolId:'mejorar.plan_accion' });

    const todos = riesgos.concat(propios).sort((x, y) => ORD_SEV[x.sev] - ORD_SEV[y.sev]);

    let h = kpiHTML([
      { label:'RIESGOS ABIERTOS', value: F(todos.length, 'n0'),
        tone: todos.filter(x => x.sev === 'alta').length ? 'bad' : (todos.length ? 'warn' : 'ok'),
        hint: fmt(todos.filter(x => x.sev === 'alta').length, 'n0') + ' de severidad alta' },
      { label:'DECISIONES PENDIENTES', value: F(decisiones.length, 'n0'),
        tone: decisiones.length ? 'warn' : 'ok' },
      { label:'HALLAZGOS DEL MOTOR', value: F(hallazgos.length, 'n0') },
      { label:'SALUD DEL PROYECTO', value: fin(g.salud) ? fmt(Math.round(num(g.salud)), 'n0') + ' / 100' : '—',
        tone: ['ok', 'warn', 'bad'].indexOf(g.semaforo) >= 0 ? g.semaforo : '' }
    ]);

    h += insBox('RIESGOS PRIORIZADOS', '⚠️', todos,
      'No se detectan riesgos abiertos con la información registrada hasta hoy.');
    h += insBox('DECISIONES POR TOMAR', '🧭', decisiones,
      'El motor no tiene decisiones pendientes registradas para este proyecto.');
    if (hallazgos.length) h += insBox('HALLAZGOS DEL ANÁLISIS', '🔎', hallazgos, '');

    /* siguiente paso recomendado */
    const t = (sp && sp.toolId && typeof TOOL_BY_ID !== 'undefined') ? TOOL_BY_ID[sp.toolId] : null;
    h += card('RECOMENDACIÓN DEL SIGUIENTE PASO',
      t
        ? '<div style="font-size:13px;line-height:1.6;margin-bottom:12px">' +
          esc(sp.motivo || 'Continúa el proyecto por esta herramienta.') + '</div>' +
          '<button class="btn p" data-goto="' + esc(t.id) + '">Ir a «' + esc(t.title) + '» →</button>'
        : (todos.length
            ? '<div style="font-size:13px;line-height:1.6;margin-bottom:12px">' +
              esc('Atiende primero el riesgo de mayor severidad: ' + todos[0].text) + '</div>' +
              (todos[0].toolId ? '<button class="btn p" data-goto="' + esc(todos[0].toolId) + '">' +
                'Abrir la herramienta →</button>' : '')
            : vacio('Completa la información del proyecto para recibir una recomendación del motor de análisis.')));
    return h;
  }

  /* ============================================================ ARMADO === */

  function panel(S){
    try {
      if (TAB === 'desempeno')  return secDesempeno(S);
      if (TAB === 'financiero') return secFinanciero(S);
      if (TAB === 'ejecucion')  return secEjecucion(S);
      if (TAB === 'calidad')    return secCalidad(S);
      if (TAB === 'riesgos')    return secRiesgos(S);
      return secResumen(S);
    } catch(e){
      console.error('BI · panel', TAB, e);
      return '<div class="note bad"><b>No se pudo dibujar esta sección del tablero.</b><br>' +
        esc(e && e.message ? e.message : String(e)) +
        '<br><br>Tus datos están a salvo: cambia de pestaña o revisa la herramienta que acabas de editar.</div>';
    }
  }

  function tabsHTML(){
    return '<div class="tabs">' + PESTANAS.map(p =>
      '<div class="tab' + (TAB === p.k ? ' on' : '') + '" data-bitab="' + esc(p.k) + '">' +
      esc(p.n) + '</div>').join('') + '</div>';
  }

  function render(ctx){
    const S = snap(ctx);
    const gd = D(S, 'definir.gantt'), ch = D(S, 'definir.project_charter');
    const nombre = firstTxt(ch.nombre, gd.proyecto, S.proj.nombre, 'Proyecto sin título');
    const av = avanceGlobal();

    let h = '<div class="page-h"><div style="flex:1">' +
      '<div class="crumb">Rehavid · Inteligencia de negocio</div>' +
      '<h1>Tablero del proyecto</h1>' +
      '<div class="sub">' + esc(nombre) + ' · ' +
      esc(firstTxt(S.proj.empresa, gd.empresa, 'Empresa sin registrar')) + ' · ' +
      esc(firstTxt(S.proj.arl, 'ARL sin registrar')) + '</div></div>' +
      '<div style="text-align:right">' +
      '<div style="font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--tx3);font-weight:800">' +
      'Avance DMAIC</div>' +
      '<div style="font-size:26px;font-weight:800;font-family:var(--fm);color:var(--br-2);line-height:1.1">' +
      esc(F(av, 'p0')) + '</div></div></div>';

    h += tabsHTML();
    h += '<div id="bi-panel">' + panel(S) + '</div>';
    return h;
  }

  /* ============================================================ EVENTOS === */

  function repintar(root){
    const box = root && root.querySelector('#bi-panel');
    if (!box) return;
    box.innerHTML = panel(snap(null));
    bindPanel(root);
  }

  /** engancha los filtros que viven dentro del panel activo */
  function bindPanel(root){
    if (!root) return;
    const sel = root.querySelector('[data-bifmod]');
    if (sel) sel.addEventListener('change', () => { FIL.mod = sel.value || ''; repintar(root); });

    const chk = root.querySelector('[data-bifalt]');
    if (chk) chk.addEventListener('change', () => { FIL.faltantes = !!chk.checked; repintar(root); });

    Array.prototype.slice.call(root.querySelectorAll('[data-bimod]')).forEach(el => {
      el.addEventListener('click', () => {
        const m = el.getAttribute('data-bimod');
        if (typeof go === 'function') go('modulo', m);
      });
    });
  }

  function bind(root){
    if (!root) return;
    Array.prototype.slice.call(root.querySelectorAll('[data-bitab]')).forEach(el => {
      el.addEventListener('click', () => {
        const k = el.getAttribute('data-bitab') || 'resumen';
        if (k === TAB) return;
        TAB = k;
        Array.prototype.slice.call(root.querySelectorAll('[data-bitab]')).forEach(x =>
          x.classList.toggle('on', x.getAttribute('data-bitab') === TAB));
        repintar(root);
      });
    });
    bindPanel(root);
  }

  /* =============================================================== API === */
  return {
    render: render,
    kpis: kpis,
    bind: bind,
    /** cambia la pestaña activa desde fuera (por ejemplo, desde un acceso rápido) */
    tab(k){ if (PESTANAS.some(p => p.k === k)) TAB = k; return TAB; },
    tabs: PESTANAS
  };

})();
