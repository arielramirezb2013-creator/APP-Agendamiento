/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   75_engine.js — MOTOR DE ANÁLISIS, INTERPRETACIÓN Y SUGERENCIA PARA DECISIÓN
   ---------------------------------------------------------------------------
   100 % local, determinístico (reglas + estadística). Sin IA externa, sin red,
   sin librerías. JavaScript de navegador plano: el archivo se concatena en un
   solo HTML, así que NO usa import/export/require.

   API PÚBLICA
     ENGINE.forTool(tool, d, ctx) -> [{icon, text, sev:'alta|media|baja|ok'}]
     ENGINE.global(ctx)           -> {salud, semaforo, resumen, hallazgos,
                                      decisiones, riesgos, siguientePaso}
     ENGINE.recomendarSiguiente(ctx) -> {toolId, motivo}
     ENGINE.narrativa(ctx)        -> string (resumen ejecutivo en prosa)

   REGLA DE ORO DE LOS MENSAJES: siempre con el número que los respalda.
   Nunca truena si faltan datos: devuelve [] o un mensaje de «falta información».
   ========================================================================== */
'use strict';

const ENGINE = (function(){

  /* ======================================================================
     1 · UTILIDADES PRIVADAS
     ==================================================================== */
  const T   = (ctx, id) => ((ctx && ctx.all && ctx.all[id]) || {});
  const RS  = (o, k) => (o && Array.isArray(o[k]) ? o[k] : []);
  const tx  = v => (v === null || v === undefined ? '' : String(v)).trim();
  const fl  = (rows, k) => arr(rows).filter(r => tx(r && r[k]) !== '');
  const corta = (s, n) => { const t = tx(s); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
  const lista = (a, n) => arr(a).slice(0, n || 3).join(' · ');

  const n0  = v => (isFinite(num(v)) ? fmt(v, 'n0') : '—');
  const n1  = v => (isFinite(num(v)) ? fmt(v, 'n1') : '—');
  const n2  = v => (isFinite(num(v)) ? fmt(v, 'n2') : '—');
  const n3  = v => (isFinite(num(v)) ? fmt(v, 'n3') : '—');
  const p0  = v => (isFinite(v) ? fmt(v, 'p0') : '—');
  const p1  = v => (isFinite(v) ? fmt(v, 'p1') : '—');
  const mny = v => fmt(num(v), 'money');
  const fch = v => (tx(v) ? fmt(tx(v), 'date') : '—');

  /* mensajes ------------------------------------------------------------- */
  const SEV_ORD = { alta:0, media:1, baja:2, ok:3 };
  const MSG   = (icon, text, sev) => ({ icon: icon, text: text, sev: sev || 'baja' });
  const ALTA  = t => MSG('⛔', t, 'alta');
  const AVISO = t => MSG('⚠️', t, 'media');
  const INFO  = t => MSG('ℹ️', t, 'baja');
  const BIEN  = t => MSG('✅', t, 'ok');
  const FALTA = t => MSG('📝', t, 'media');
  const IDEA  = t => MSG('💡', t, 'baja');
  const META  = t => MSG('🎯', t, 'baja');
  const RELOJ = t => MSG('⏱️', t, 'media');
  const GANA  = t => MSG('🏆', t, 'ok');
  const PLATA = t => MSG('💰', t, 'media');
  const ordenar = list => arr(list).filter(Boolean)
    .sort((a, b) => (SEV_ORD[a.sev] === undefined ? 2 : SEV_ORD[a.sev]) -
                    (SEV_ORD[b.sev] === undefined ? 2 : SEV_ORD[b.sev]));

  /* progreso escrito 0-1 o 0-100 → siempre 0-1 */
  const p01 = v => { const n = num(v); return n > 1 ? n / 100 : n; };
  /** proporción tolerante: 0,05 o 5 → 0,05 */
  const prop = v => { const x = num(v); return x > 1 ? x / 100 : x; };
  /** Z de un nivel de confianza (igual que las hojas de tamaño de muestra) */
  function zConf(c){
    const x = prop(c);
    return (x > 0 && x < 1) ? normsinv((1 - x) / 2) * (-1) : NaN;
  }
  /** ¿el módulo está activo en el proyecto? */
  function modActivo(ctx, mod){
    const p = ctx && ctx.proj;
    if (!p || !p.mods) return true;
    return p.mods[mod] !== false;
  }
  /** ¿la herramienta tiene algo escrito? */
  function lleno(ctx, id){
    const d = (ctx && ctx.all) ? ctx.all[id] : null;
    if (!d) return false;
    if (typeof hasContent === 'function') return hasContent(d);
    return Object.keys(d).length > 0;
  }

  /* ======================================================================
     2 · INTERPRETACIÓN ESTADÍSTICA COMPARTIDA
     ==================================================================== */

  /** Clasificación del nivel sigma (convención Six Sigma, corrimiento 1,5σ) */
  function claseSigma(s){
    if (!isFinite(s)) return null;
    if (s < 3) return { n:'CRÍTICO', sev:'alta', ic:'⛔',
      d:'Por debajo de 3σ el proceso falla en más del 6,7 % de las oportunidades (más de 66.807 DPMO): exige intervención estructural inmediata, no ajustes.' };
    if (s < 4) return { n:'BAJO', sev:'alta', ic:'⛔',
      d:'Está por debajo del promedio de la industria (4σ ≈ 6.210 DPMO); cada punto sigma vale aproximadamente 10x en defectos.' };
    if (s < 5) return { n:'ACEPTABLE', sev:'media', ic:'⚠️',
      d:'Está en el promedio de la industria (4σ ≈ 6.210 DPMO · 5σ ≈ 233 DPMO); el siguiente salto exige rediseñar el proceso, no sólo controlarlo.' };
    return { n:'CLASE MUNDIAL', sev:'ok', ic:'✅',
      d:'Por encima de 5σ (≤ 233 DPMO) el desempeño es de clase mundial: el foco pasa de mejorar a SOSTENER con el plan de control.' };
  }

  /** Mensaje maestro de nivel sigma, con el foco del Pareto si existe */
  function msgSigma(etiqueta, dpmo, ctx){
    const v = num(dpmo);
    if (!isFinite(v) || v <= 0) return null;
    const s = sigmaLevel(v), c = claseSigma(s);
    if (!c) return null;
    let t = etiqueta + ' = ' + n0(v) + ' → nivel sigma ' + n2(s) + 'σ (' + c.n + '). ' + c.d;
    const pv = ctx ? paretoCtx(ctx) : null;
    if (pv && pv.vitales.length)
      t += ' Prioriza las ' + pv.vitales.length + ' categoría(s) que concentran el ' +
           p1(pv.acum) + ' del Pareto (' + lista(pv.vitales.map(x => x.cat), 3) + ').';
    return MSG(c.ic, t, c.sev);
  }

  /** Cuánto vale llegar a 4σ */
  function msgSalto4Sigma(dpmo){
    const v = num(dpmo), s = sigmaLevel(v);
    if (!isFinite(s) || s >= 4 || !(v > 6210)) return null;
    return IDEA('Llevar el proceso a 4σ significa bajar de ' + n0(v) + ' a 6.210 DPMO: ' +
      p1(safeDiv(v - 6210, v)) + ' menos defectos. Ese es el tamaño real de la oportunidad y la cifra que se lleva al Business Case.');
  }

  /* --------------------------------------------------------------- Pareto */
  const PAR_DEF = ['A', 'B', 'C', 'D', 'E', 'Other'];
  function paretoDe(d){
    const raw = RS(d, 'rows'), rows = [];
    raw.forEach((r, i) => {
      if (!isNum(r.fre) || num(r.fre) <= 0) return;
      rows.push({ cat: tx(r.cat) || PAR_DEF[i] || ('Categoría ' + (i + 1)), fre: num(r.fre), i: i });
    });
    if (!rows.length) return null;
    const tot = rows.reduce((a, r) => a + r.fre, 0);
    const ord = rows.slice().sort((a, b) => b.fre - a.fre);
    let ac = 0; const vit = [];
    for (let i = 0; i < ord.length; i++){
      if (ac >= 0.8 * tot) break;
      vit.push(ord[i]); ac += ord[i].fre;
    }
    const otro = rows.filter(r => /^other|otros?$/i.test(r.cat))
                     .reduce((a, r) => a + r.fre, 0);
    return { total: tot, n: rows.length, vitales: vit, acum: safeDiv(ac, tot),
             top: ord[0], ord: ord, otros: otro };
  }
  const paretoCtx = ctx => paretoDe(T(ctx, 'definir.pareto'));

  /* ---------------------------------------------------------- series 0-∞ */
  /** Análisis completo de una serie: nivel, tendencia, estabilidad y meta */
  function analizarSerie(vals, objetivo, unidad, minPuntos){
    const V = arr(vals).filter(isNum).map(num);
    const out = [];
    const u = tx(unidad) ? ' ' + tx(unidad) : '';
    const minP = minPuntos || 15;
    if (!V.length) return out;
    const m  = V.reduce((a, b) => a + b, 0) / V.length;
    const sd = V.length > 1 ? stdev(V) : NaN;
    const cv = safeDiv(sd, Math.abs(m));
    const lr = V.length > 1 ? linreg(V.map((x, i) => i), V) : null;

    if (V.length < minP)
      out.push(AVISO('La línea base tiene sólo ' + n0(V.length) + ' punto(s); se recomiendan al menos ' +
        minP + ' periodos consecutivos. Con menos datos no se puede distinguir una tendencia real de la variación normal del proceso.'));
    else
      out.push(BIEN('Línea base con ' + n0(V.length) + ' puntos: promedio ' + n2(m) + u +
        ', desviación estándar ' + n2(sd) + u + '.'));

    if (isFinite(cv)){
      if (cv > 0.25)
        out.push(AVISO('Variabilidad ALTA: coeficiente de variación ' + p1(cv) +
          ' (desviación ' + n2(sd) + u + ' sobre un promedio de ' + n2(m) + u +
          '). Antes de mover el promedio hay que reducir la dispersión: la inconsistencia es el problema, no el nivel.'));
      else if (cv > 0.10)
        out.push(INFO('Variabilidad MODERADA: coeficiente de variación ' + p1(cv) +
          ' (± ' + n2(sd) + u + ' alrededor de ' + n2(m) + u + '). Es un proceso manejable pero aún no estable.'));
      else
        out.push(BIEN('Proceso ESTABLE: coeficiente de variación ' + p1(cv) +
          ' (± ' + n2(sd) + u + ' sobre ' + n2(m) + u + '). La variación es predecible: el problema es de nivel, no de consistencia.'));
    }

    if (lr && isFinite(lr.m)){
      const dir = lr.m < 0 ? 'a la BAJA' : (lr.m > 0 ? 'al ALZA' : 'PLANA');
      const conf = lr.r2 >= 0.5 ? 'la tendencia explica el ' + p0(lr.r2) + ' de la variación (R² = ' + n3(lr.r2) + '): es una tendencia sólida'
                                : 'la tendencia sólo explica el ' + p0(lr.r2) + ' de la variación (R² = ' + n3(lr.r2) + '): es ruido, no tendencia';
      out.push(INFO('Tendencia ' + dir + ': ' + n3(lr.m) + u + ' por periodo (' +
        n2(lr.m * V.length) + u + ' acumulados en los ' + V.length + ' periodos medidos); ' + conf + '.'));
    }

    if (isNum(objetivo)){
      const o = num(objetivo), gap = m - o;
      const menorMejor = m > o;
      if (Math.abs(gap) < 1e-9)
        out.push(BIEN('El promedio (' + n2(m) + u + ') YA está sobre el objetivo (' + n2(o) + u + ').'));
      else if ((menorMejor && m > o) || (!menorMejor && m < o)){
        out.push(META('GAP contra el objetivo: promedio ' + n2(m) + u + ' vs objetivo ' + n2(o) + u +
          ' → faltan ' + n2(Math.abs(gap)) + u + ' (' + p1(safeDiv(Math.abs(gap), Math.abs(o) || 1)) +
          ' sobre la meta). Ese GAP es el tamaño del proyecto y va textual en el Objetivo SMART.'));
        if (lr && isFinite(lr.m) && lr.m !== 0){
          const avanzaBien = menorMejor ? lr.m < 0 : lr.m > 0;
          if (avanzaBien){
            const k = Math.abs(gap / lr.m);
            if (isFinite(k) && k > 0 && k < 1000)
              out.push(IDEA('Al ritmo actual (' + n3(lr.m) + u + ' por periodo) el objetivo se alcanzaría en ' +
                n0(Math.ceil(k)) + ' periodo(s) más sin intervenir. Si el proyecto no acorta ese plazo, no está aportando valor.'));
          } else {
            out.push(ALTA('La tendencia va en dirección CONTRARIA al objetivo (' + n3(lr.m) + u +
              ' por periodo alejándose de la meta): sin intervención el GAP de ' + n2(Math.abs(gap)) + u + ' seguirá creciendo.'));
          }
        }
      } else {
        out.push(BIEN('El promedio (' + n2(m) + u + ') ya cumple el objetivo (' + n2(o) + u +
          '), con holgura de ' + n2(Math.abs(gap)) + u + '. Verifica que el objetivo siga siendo retador: si ya se cumple, el proyecto debe apuntar al valor IDEAL.'));
      }
    } else {
      out.push(FALTA('No hay objetivo (target) definido para la serie: sin meta no se puede calcular el GAP ni dimensionar el proyecto.'));
    }

    if (V.length > 2 && isFinite(sd) && sd > 0){
      const fuera = V.filter(x => Math.abs(x - m) > 3 * sd).length;
      if (fuera)
        out.push(AVISO(n0(fuera) + ' punto(s) fuera de ± 3σ (' + n2(m - 3 * sd) + u + ' a ' +
          n2(m + 3 * sd) + u + '): son causas ESPECIALES. Investiga qué pasó en esos periodos antes de promediarlos dentro de la línea base.'));
    }
    return out;
  }

  /* ======================================================================
     3 · LECTORES DE ESTADO ENTRE FASES (coherencia DMAIC)
     ==================================================================== */

  /** Línea base declarada en DEFINIR › Series de tiempo */
  function baseDefinir(ctx){
    const st = T(ctx, 'definir.series_tiempo');
    const rows = RS(st, 'rows').filter(r => isNum(r.metrico));
    return { proceso: tx(st.proceso), n: rows.length,
             valores: rows.map(r => num(r.metrico)),
             prom: rows.length ? avg(rows, 'metrico') : NaN,
             objetivo: tx(st.objetivo) === '' ? NaN : num(st.objetivo) };
  }
  /** Serie de 13 periodos de MEDIR › Grafico Serie de tiempo */
  function serieMedir(ctx){
    const t = T(ctx, 'medir.grafico_serie_tiempo'), S = t.serie || {}, V = [];
    for (let i = 1; i <= 13; i++){
      const v = S['m' + i + '.valor'];
      if (v !== '' && v !== null && v !== undefined && isNum(v)) V.push(num(v));
    }
    return { criterio: tx(t.criterio), n: V.length, valores: V,
             prom: V.length ? V.reduce((a, b) => a + b, 0) / V.length : NaN };
  }
  /** DPMO consolidado de MEDIR */
  function dpmoDe(d){
    const rows = RS(d, 'rows');
    const units = sum(rows, 'units');
    const defs  = rows.reduce((a, r) => a + num(r.c1) + num(r.c2) + num(r.c3) + num(r.c4), 0);
    const opps  = units * 4;
    return { units: units, defs: defs, opps: opps, cats: 4, dpmo: safeDiv(defs, opps) * 1e6 };
  }
  const dpmoCtx = ctx => dpmoDe(T(ctx, 'medir.dpmo'));
  /** PPM consolidado de MEDIR */
  function ppmDe(d){
    const rows = RS(d, 'rows');
    const u = sum(rows, 'units'), df = sum(rows, 'defects');
    return { units: u, defects: df, prop: safeDiv(df, u), ppm: safeDiv(df, u) * 1e6, rows: rows };
  }
  /** ¿Hay línea base cuantificada en alguna parte del proyecto? */
  function hayBaseline(ctx){
    const b = baseDefinir(ctx), s = serieMedir(ctx), dp = dpmoCtx(ctx), pp = ppmDe(T(ctx, 'medir.ppm'));
    const met = RS(T(ctx, 'definir.project_charter'), 'metDef').filter(r => tx(r.nombre) && isNum(r.base));
    return { ok: (b.n > 0 || s.n > 0 || dp.opps > 0 || pp.units > 0 || met.length > 0),
             def: b, med: s, dpmo: dp, ppm: pp, metricos: met };
  }
  /** Causas validadas (CHECK = 1) en ANALIZAR */
  function causasValidadas(ctx){
    const v = T(ctx, 'analizar.validacion_de_causas');
    const rows = fl(RS(v, 'rows'), 'causa');
    const ok = rows.filter(r => num(r.check) === 1);
    const raiz = T(ctx, 'analizar.descripcion_causa_raiz');
    const declaradas = [raiz.causa1, raiz.causa2].map(tx).filter(x => x);
    return { total: rows.length, validadas: ok.length, rows: rows, ok: ok,
             pct: safeDiv(ok.length, rows.length),
             nombres: ok.map(r => tx(r.causa)), declaradas: declaradas };
  }
  /** Soluciones evaluadas / elegidas en MEJORAR */
  function overallSol(r){
    const ks = ['effort', 'benefit', 'feas', 'cb'];
    let p = 1, n = 0;
    ks.forEach(k => { if (isNum(r[k])){ p *= num(r[k]); n++; } });
    return n ? p : 0;
  }
  function cuadranteSol(r){
    const e = num(r.effort), b = num(r.benefit);
    if (!(e > 0) || !(b > 0)) return { n:'', sev:'', hint:'' };
    const facil = e >= 3, alto = b >= 3;
    if (facil && alto)  return { n:'QUICK WINS', sev:'ok',
      hint:'poco esfuerzo y alto beneficio: se ejecuta YA' };
    if (!facil && alto) return { n:'PROYECTOS MAYORES', sev:'media',
      hint:'alto beneficio pero mucho esfuerzo: se planifica y se le asignan recursos' };
    if (facil && !alto) return { n:'RELLENOS', sev:'baja',
      hint:'fácil pero de poco beneficio: sólo si sobra capacidad' };
    return { n:'INGRATOS', sev:'alta', hint:'mucho esfuerzo y poco beneficio: se descarta' };
  }
  function solucionesDe(ctx){
    const rows = fl(RS(T(ctx, 'mejorar.seleccion_soluciones'), 'rows'), 'sol');
    const ord = rows.slice().sort((a, b) => overallSol(b) - overallSol(a));
    const sel = rows.filter(r => /^s[ií]/i.test(tx(r.solucion)));
    return { rows: rows, ord: ord, sel: sel,
             qw:  rows.filter(r => cuadranteSol(r).n === 'QUICK WINS'),
             pm:  rows.filter(r => cuadranteSol(r).n === 'PROYECTOS MAYORES'),
             rel: rows.filter(r => cuadranteSol(r).n === 'RELLENOS'),
             ing: rows.filter(r => cuadranteSol(r).n === 'INGRATOS'),
             sinCal: rows.filter(r => overallSol(r) === 0) };
  }
  /** Plan de acción de MEJORAR */
  const estatusDe   = r => tx(r && r.estatus).toUpperCase();
  const esRealizada = r => estatusDe(r) === 'REALIZADA';
  function diasVencida(r){
    if (!r || !tx(r.limite) || esRealizada(r)) return NaN;
    const dd = dDiff(r.limite, hoy());
    return (isFinite(dd) && dd > 0) ? dd : NaN;
  }
  function planAccionDe(ctx){
    const rows = RS(T(ctx, 'mejorar.plan_accion'), 'rows').filter(r => tx(r.accion) || tx(r.problema));
    const real = rows.filter(esRealizada);
    const venc = rows.filter(r => isFinite(diasVencida(r)));
    return { rows: rows, n: rows.length, real: real.length, venc: venc,
             curso: rows.filter(r => estatusDe(r) === 'EN CURSO').length,
             nore:  rows.filter(r => estatusDe(r) === 'NO REALIZADA').length,
             sinResp: rows.filter(r => !tx(r.responsable)),
             sinFecha: rows.filter(r => !tx(r.limite)),
             pct: safeDiv(real.length, rows.length) };
  }
  /** Antes / después de CONTROLAR */
  function adStats(d){
    const rows = RS(d, 'rows').filter(r => isNum(r.antes) || isNum(r.despues));
    const A = rows.filter(r => isNum(r.antes)).map(r => num(r.antes));
    const B = rows.filter(r => isNum(r.despues)).map(r => num(r.despues));
    const ma = A.length ? A.reduce((x, y) => x + y, 0) / A.length : NaN;
    const mb = B.length ? B.reduce((x, y) => x + y, 0) / B.length : NaN;
    const menorMejor = tx(d.direccion) !== 'Mayor es mejor';
    const pct = safeDiv(mb - ma, ma);
    return { A: A, B: B, ma: ma, mb: mb, dif: mb - ma, pct: pct, menorMejor: menorMejor,
             criterio: tx(d.criterio),
             mejora: isFinite(pct) ? (menorMejor ? -pct : pct) : NaN };
  }
  const adCtx = ctx => adStats(T(ctx, 'controlar.grafico_antes_despues'));
  /** Plan de control de CONTROLAR */
  function planControlDe(ctx){
    const d = T(ctx, 'controlar.plan_de_control');
    const rows = RS(d, 'rows').filter(r => tx(r.paso) || tx(r.caracteristica));
    const c = k => fl(rows, k).length;
    return { d: d, rows: rows, n: rows.length,
             especs: c('especificaciones'), tecnica: c('tecnica'), metodo: c('metodo'),
             frecuencia: c('frecuencia'), acciones: c('acciones'), responsable: c('responsable'),
             documento: c('documento'),
             completo: rows.filter(r => tx(r.especificaciones) && tx(r.tecnica) &&
                                        tx(r.frecuencia) && tx(r.acciones) && tx(r.responsable)).length };
  }
  /** ¿el valor logrado alcanzó el objetivo? (respeta la dirección base→objetivo) */
  function cumpleObj(base, obj, log){
    if (!isNum(obj) || !isNum(log)) return null;
    const b = num(base), o = num(obj), l = num(log);
    if (!isNum(base) || b === o) return l === o ? true : null;
    return o < b ? l <= o : l >= o;
  }
  /** ¿el métrico mejoró respecto de su línea base? */
  function mejoroMetrico(base, obj, log){
    if (!isNum(base) || !isNum(log)) return null;
    const b = num(base), l = num(log);
    if (l === b) return false;
    if (!isNum(obj)) return null;
    return num(obj) < b ? l < b : l > b;
  }
  /** Métricos de cierre emparejados DEFINIR ↔ CONTROLAR */
  function metricosCierre(ctx){
    const def = RS(T(ctx, 'definir.project_charter'), 'metDef');
    const cie = RS(T(ctx, 'controlar.charter_cierre'), 'metCie');
    const par = [];
    def.forEach((m, i) => {
      if (!tx(m.nombre)) return;
      const c = cie[i] || {};
      par.push({ i: i, nombre: tx(m.nombre), base: m.base, obj: m.obj, ideal: m.ideal,
                 logrado: c.logrado, mejoro: mejoroMetrico(m.base, m.obj, c.logrado),
                 cumple: cumpleObj(m.base, m.obj, c.logrado) });
    });
    return { pares: par,
             conDato: par.filter(x => isNum(x.logrado)),
             mejoran: par.filter(x => x.mejoro === true),
             empeoran: par.filter(x => x.mejoro === false && isNum(x.logrado)),
             cumplen: par.filter(x => x.cumple === true),
             firmas: fl(RS(T(ctx, 'controlar.charter_cierre'), 'firmasCie'), 'firma').length };
  }
  /** Objetivo cuantitativo del proyecto (para comparar con el resultado) */
  function objetivoCuantitativo(ctx){
    const b = baseDefinir(ctx);
    if (isFinite(b.objetivo) && b.n)
      return { obj: b.objetivo, base: b.prom, fuente: 'DEFINIR › Series de tiempo' };
    const ch = RS(T(ctx, 'definir.project_charter'), 'metDef')
      .filter(r => tx(r.nombre) && isNum(r.obj));
    if (ch.length)
      return { obj: num(ch[0].obj), base: isNum(ch[0].base) ? num(ch[0].base) : NaN,
               fuente: 'Project Charter · métrico «' + tx(ch[0].nombre) + '»' };
    const ti = RS(T(ctx, 'definir.tabla_identificacion'), 'rows')
      .filter(r => tx(r.ctq) && isNum(r.obj));
    if (ti.length)
      return { obj: num(ti[0].obj), base: isNum(ti[0].base) ? num(ti[0].base) : NaN,
               fuente: 'Tabla de identificación · CTQ «' + corta(ti[0].ctq, 34) + '»' };
    return null;
  }

  /* --------------------------------------------- texto: meta y plazo SMART */
  const MESES_RX = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre';
  function numerosDe(s){
    const m = String(s || '').match(/-?\d[\d.,]*\s*(?:%|min|minutos?|h|horas?|d[ií]as?|semanas?|meses?|puntos?)?/gi);
    return (m || []).map(x => x.trim()).filter(x => /\d/.test(x));
  }
  function tienePlazo(s){
    const t = String(s || '');
    const rx = [
      new RegExp('\\b(' + MESES_RX + ')\\b(\\s+de\\s+\\d{4})?', 'i'),
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/,
      /\b(20\d{2})\b/,
      /\b(en|dentro de|antes del|antes de|a más tardar|a mas tardar|máximo|maximo|durante|plazo de|al cabo de)\b[^.;]{0,24}?\b\d+\s*(d[ií]as?|semanas?|meses?|trimestres?|a[nñ]os?)\b/i,
      /\b\d+\s*(d[ií]as?|semanas?|meses?|trimestres?|a[nñ]os?)\b/i,
      /\b(Q[1-4]|primer|segundo|tercer|cuarto)\s+(trimestre|semestre)\b/i
    ];
    for (let i = 0; i < rx.length; i++){
      const m = t.match(rx[i]);
      if (m) return m[0].trim();
    }
    return '';
  }
  /** Texto del objetivo del proyecto, venga de donde venga */
  function objetivoTexto(ctx){
    const sm = T(ctx, 'definir.objetivo_smart');
    const auto = ['s', 'm', 'a', 'r', 't'].map(k => tx(sm[k])).filter(x => x).join(' ');
    return tx(sm.smart) || auto ||
           tx(T(ctx, 'definir.project_charter').objetivo) ||
           tx(T(ctx, 'definir.a3_definir').objetivo);
  }
  /** Texto del problema del proyecto */
  function problemaTexto(ctx){
    return tx(T(ctx, 'definir.clarificacion_problema').definicion) ||
           tx(T(ctx, 'definir.project_charter').problema) ||
           tx(T(ctx, 'definir.a3_definir').problema) ||
           tx(T(ctx, 'analizar.descripcion_causa_raiz').problema);
  }

  /* ======================================================================
     4 · REGLAS POR HERRAMIENTA  (se completan más abajo)
     ==================================================================== */
  const REGLAS = {};

  /* ---------------------------------------------------------------------
     4.1 · DEFINIR
     ------------------------------------------------------------------- */

  /* Matriz de priorización de proyectos ---------------------------------- */
  REGLAS['definir.matriz_priorizacion'] = function(d){
    const out = [];
    const rows = RS(d, 'rows').filter(r => tx(r.proyecto));
    const pr = r => num(r.cliente) * num(r.costos) * num(r.exito) * num(r.empresa) * num(r.beneficio);
    if (!rows.length)
      return [FALTA('No hay proyectos candidatos cargados. Escribe al menos 2 y califícalos de 1 a 5 en los cinco criterios: la Prioridad es el PRODUCTO de las cinco calificaciones (máximo 3.125 = 5⁵).')];
    const ord = rows.slice().sort((a, b) => pr(b) - pr(a));
    const mx  = pr(ord[0]);
    const sinCal = rows.filter(r => pr(r) <= 0);

    if (mx <= 0){
      out.push(ALTA('Los ' + n0(rows.length) + ' proyectos están SIN calificar: la prioridad queda en 0 para todos y no hay con qué decidir. Recuerda que «Costos de Implementacion» va invertido (Alto = 1 · Bajo = 5).'));
    } else {
      const emp = ord.filter(r => pr(r) === mx);
      if (emp.length > 1){
        out.push(AVISO('EMPATE entre ' + n0(emp.length) + ' proyectos con prioridad ' + n0(mx) + ': ' +
          lista(emp.map(r => '«' + corta(r.proyecto, 30) + '»'), 4) +
          '. Desempata con el criterio de mayor peso para REHAVID (Importancia para el Cliente) o revisa la calificación de costo del más caro.'));
      } else {
        const seg  = ord[1] ? pr(ord[1]) : 0;
        const vent = seg > 0 ? safeDiv(mx - seg, seg) : NaN;
        const ventTxt = seg > 0
          ? (vent >= 1 ? ', ' + n1(safeDiv(mx, seg)) + ' veces la prioridad del segundo'
                       : ', ' + p0(vent) + ' por encima del segundo') +
            ' («' + corta(ord[1].proyecto, 30) + '», ' + n0(seg) + ')'
          : '';
        out.push(GANA('Proyecto ganador: «' + corta(ord[0].proyecto, 44) + '» con prioridad ' + n0(mx) +
          ' de 3.125 posibles (' + p0(safeDiv(mx, 3125)) + ' del máximo)' + ventTxt +
          '. Escríbelo en «Eleccion del proyecto» y llévalo al Project Charter.'));
      }
      if (mx < 243)
        out.push(AVISO('Ningún candidato supera 243 puntos (calificar 3 en los cinco criterios = 3⁵ = 243). El mejor llega a ' + n0(mx) +
          ': revisa si el problema amerita un DMAIC completo o si se resuelve con un Quick Improvement de MEJORAR.'));
      else if (mx >= 1024)
        out.push(BIEN('La prioridad del ganador (' + n0(mx) + ') está por encima de 1.024 (4⁵): es un proyecto de alto retorno y baja fricción. Arráncalo primero.'));
    }
    if (sinCal.length)
      out.push(AVISO(n0(sinCal.length) + ' de ' + n0(rows.length) + ' proyecto(s) con algún criterio en blanco: su prioridad queda en 0 y salen de la comparación (' +
        lista(sinCal.map(r => '«' + corta(r.proyecto, 24) + '»'), 3) + ').'));
    if (rows.length < 3)
      out.push(INFO('Sólo hay ' + n0(rows.length) + ' candidato(s). Con menos de 3 alternativas la matriz no prioriza: justifica el proyecto en «Eleccion del proyecto».'));
    if (!tx(d.eleccion))
      out.push(FALTA('Falta la justificación en «Eleccion del proyecto»: ese texto alimenta el Business Case del Project Charter y es lo que se presenta al Champion.'));
    return out;
  };

  /* Clarificación del problema (5W2H) ------------------------------------ */
  REGLAS['definir.clarificacion_problema'] = function(d){
    const out = [];
    const G = ['r_what', 'r_why', 'r_who', 'r_where', 'r_when', 'r_howmuch', 'r_how'];
    const resp = G.filter(k => tx(d[k])).length;
    if (!resp && !tx(d.definicion))
      return [FALTA('Clarificación vacía. Responde los 7 grupos del 5W2H con datos (cantidades, fechas, turnos, áreas, dinero) y cierra con la «Definición del Problema».')];
    if (resp < G.length)
      out.push(AVISO('5W2H respondido en ' + n0(resp) + ' de 7 grupos (' + p0(safeDiv(resp, 7)) +
        '). Faltan: ' + lista(G.filter(k => !tx(d[k])).map(k => k.replace('r_', '').toUpperCase()), 7) + '.'));
    else
      out.push(BIEN('5W2H completo: los 7 grupos están respondidos. El problema está delimitado en qué, por qué, quién, dónde, cuándo, cuánto y cómo.'));
    const def = tx(d.definicion);
    if (!def)
      out.push(ALTA('Falta la «Definición del Problema»: es el enunciado que se hereda al Project Charter y al A3. Sin él, MEDIR no sabe qué medir.'));
    else {
      const nm = numerosDe(def);
      if (!nm.length)
        out.push(ALTA('La definición del problema NO tiene ningún dato numérico. Reescríbela con la forma: «En el proceso X, desde <fecha>, el <métrico> es <actual> frente a <ideal>, con un GAP de <…> y un costo de $<…>».'));
      else
        out.push(BIEN('La definición del problema está cuantificada (' + lista(nm, 3) + '): así se puede medir el GAP y demostrar la mejora en CONTROLAR.'));
      if (/\b(por (falta|culpa|ausencia)|debido a|porque|se debe a)\b/i.test(def))
        out.push(AVISO('La definición parece incluir una CAUSA («por falta de…», «debido a…»). En DEFINIR se describe el efecto con datos; las causas se buscan en ANALIZAR.'));
      if (/\b(implementar|comprar|contratar|capacitar|instalar|automatizar)\b/i.test(def))
        out.push(AVISO('La definición parece incluir una SOLUCIÓN. Un problema bien definido no dice qué hacer: dice qué está pasando y cuánto cuesta.'));
    }
    if (!d.foto)
      out.push(INFO('No hay foto ni bosquejo del problema. Una imagen del punto de falla acelera el consenso del equipo y sirve de evidencia ante la ARL.'));
    return out;
  };

  /* Objetivo SMART -------------------------------------------------------- */
  REGLAS['definir.objetivo_smart'] = function(d, ctx){
    const out = [];
    const P5 = [['s', 'S · Específico'], ['m', 'M · Medible'], ['a', 'A · Alcanzable'],
                ['r', 'R · Relevante'], ['t', 'T · Periodo de tiempo']];
    const puestos = P5.filter(x => tx(d[x[0]]));
    const auto = P5.map(x => tx(d[x[0]])).filter(x => x).join(' ');
    const full = tx(d.smart) || auto;
    if (!full)
      return [FALTA('Objetivo SMART vacío. Escribe los cinco atributos: qué métrico y proceso (S), de cuánto a cuánto (M), por qué es viable (A), qué impacto tiene (R) y para cuándo (T).')];

    if (puestos.length < 5)
      out.push(AVISO('Faltan ' + n0(5 - puestos.length) + ' de los 5 atributos SMART: ' +
        lista(P5.filter(x => !tx(d[x[0]])).map(x => x[1]), 5) + '.'));
    else
      out.push(BIEN('Los 5 atributos SMART están escritos (S, M, A, R y T).'));

    const nm = numerosDe(full);
    if (!nm.length)
      out.push(ALTA('El objetivo NO tiene meta numérica: sin un «de cuánto a cuánto» no se puede declarar el éxito ni calcular el ahorro. Escribe el valor de la línea base y el valor objetivo con su unidad.'));
    else
      out.push(BIEN('Meta numérica detectada: ' + lista(nm, 3) + '. Verifica que incluya el valor de partida Y el valor de llegada, no sólo uno de los dos.'));

    if (nm.length === 1)
      out.push(AVISO('Sólo hay UN número en el objetivo (' + nm[0] + '). Un objetivo medible lleva dos: línea base y meta (por ejemplo «de 6,2 días a 3,0 días»).'));

    const pz = tienePlazo(full);
    if (!pz)
      out.push(ALTA('El objetivo NO tiene plazo: sin fecha límite no hay compromiso ni forma de evaluar el cumplimiento. Agrega una fecha concreta o un horizonte («antes del 31 de diciembre de 2026», «en 12 semanas»).'));
    else
      out.push(BIEN('Plazo detectado: «' + corta(pz, 40) + '».'));

    if (!tx(d.smart) && auto)
      out.push(IDEA('El objetivo propuesto ya está armado con S+M+A+R+T pero el campo «Objetivo SMART» sigue vacío: cópialo y ajústalo hasta que se lea como una sola frase. Es el texto que se hereda al Project Charter.'));

    /* coherencia con la línea base de DEFINIR */
    const b = baseDefinir(ctx);
    if (b.n && isFinite(b.prom) && nm.length){
      const hayBase = nm.some(x => Math.abs(num(x) - b.prom) / (Math.abs(b.prom) || 1) < 0.05);
      if (!hayBase)
        out.push(INFO('La línea base medida en «Series de tiempo» es ' + n2(b.prom) + ' (' + n0(b.n) +
          ' puntos) y ese valor no aparece en el objetivo. Ancla el objetivo a la línea base real, no a una estimación.'));
    }
    if (isFinite(b.objetivo) && isFinite(b.prom) && b.n){
      const red = safeDiv(Math.abs(b.prom - b.objetivo), Math.abs(b.prom));
      if (isFinite(red))
        out.push(META('Según «Series de tiempo» la meta implica pasar de ' + n2(b.prom) + ' a ' + n2(b.objetivo) +
          ': una variación del ' + p1(red) + '. Ese porcentaje debe aparecer textual en el atributo M (Medible).'));
    }
    return out;
  };

  /* Pareto (base line) ---------------------------------------------------- */
  REGLAS['definir.pareto'] = function(d){
    const out = [];
    const P = paretoDe(d);
    if (!P)
      return [FALTA('El Pareto está vacío. Carga las categorías del problema con su frecuencia: son los datos que definen el alcance del proyecto.')];
    if (P.n < 3)
      out.push(AVISO('Sólo hay ' + n0(P.n) + ' categoría(s) con datos: con menos de 3 el Pareto no discrimina nada. Estratifica el problema (por sede, turno, profesional, tipo de servicio o causa) y vuelve a contar.'));
    const nv = P.vitales.length;
    if (nv){
      out.push(GANA('POCOS VITALES: ' + n0(nv) + ' de ' + n0(P.n) + ' categoría(s) concentran el ' +
        p1(P.acum) + ' de los ' + n0(P.total) + ' casos → ' +
        lista(P.vitales.map(x => x.cat + ' (' + n0(x.fre) + ', ' + p1(safeDiv(x.fre, P.total)) + ')'), 4) +
        '. Atacando esas ' + n0(nv) + ' cubres 4 de cada 5 problemas: ése es el alcance del proyecto.'));
      if (safeDiv(nv, P.n) > 0.5)
        out.push(AVISO('El Pareto está PLANO: se necesitan ' + n0(nv) + ' de ' + n0(P.n) +
          ' categorías (' + p0(safeDiv(nv, P.n)) + ') para llegar al 80 %. No hay «pocos vitales»: reestratifica los datos con otro criterio antes de seguir a MEDIR.'));
    }
    if (P.top)
      out.push(INFO('Categoría mayor: «' + P.top.cat + '» con ' + n0(P.top.fre) + ' casos (' +
        p1(safeDiv(P.top.fre, P.total)) + ' del total). Es la primera candidata a la cabeza del Ishikawa.'));
    if (P.otros > 0 && safeDiv(P.otros, P.total) > 0.20)
      out.push(AVISO('La categoría «Other» concentra ' + n0(P.otros) + ' casos (' + p1(safeDiv(P.otros, P.total)) +
        '): por encima del 20 % está escondiendo información. Ábrela y clasifica lo que hay adentro.'));
    return out;
  };

  /* Serie de tiempo — línea base de DEFINIR ------------------------------- */
  REGLAS['definir.series_tiempo'] = function(d){
    const rows = RS(d, 'rows').filter(r => isNum(r.metrico));
    if (!rows.length)
      return [FALTA('La línea base está vacía. Carga al menos 15-20 puntos consecutivos del métrico (días, semanas o meses) sin huecos: sin línea base no se puede dimensionar el proyecto ni demostrar la mejora en CONTROLAR.')];
    const obj = tx(d.objetivo) === '' ? null : num(d.objetivo);
    return analizarSerie(rows.map(r => num(r.metrico)), obj, '', 15);
  };

  /* Beneficios / ahorros potenciales ------------------------------------- */
  REGLAS['definir.beneficios'] = function(d, ctx){
    const out = [];
    const M = d.ben || {};
    const u     = num(M['des2.metrico']);          /* costo unitario (C5) */
    const ahU   = num(M['des1.ahorro']);
    const baseU = num(M['des1.base']);
    const base$ = num(M['des2.base']);
    const goalU = num(M['goal1.ahorro']);
    const retU  = num(M['ret1.ahorro']);
    const ah$   = u * ahU;

    if (!u && !ahU && !base$ && !baseU)
      return [FALTA('No hay beneficios cuantificados. Escribe la línea base actual, el ahorro esperado y el COSTO UNITARIO (fila «DESEADO ($)», columna METRICO): con esos tres datos se calcula el ahorro en dinero de los tres escenarios.')];
    if (!u)
      out.push(AVISO('Falta el COSTO UNITARIO en la fila «DESEADO ($)» columna METRICO (celda C5 del original): sin él los ahorros de los tres escenarios quedan en $ 0 y el proyecto no tiene caso de negocio.'));

    const ratio = base$ > 0 ? safeDiv(ah$, base$) : safeDiv(ahU, baseU);
    const refTxt = base$ > 0
      ? mny(ah$) + ' sobre una línea base de ' + mny(base$)
      : n2(ahU) + ' sobre una línea base de ' + n2(baseU) + ' unidades';
    if (isFinite(ratio) && ratio > 0){
      if (ratio < 0.10)
        out.push(PLATA('BAJO IMPACTO: el ahorro proyectado equivale al ' + p1(ratio) + ' de la línea base (' + refTxt +
          '). Por debajo del 10 % el esfuerzo de un DMAIC completo no se justifica: sube la ambición del escenario GOAL, amplía el alcance o resuélvelo como Quick Improvement.'));
      else if (ratio < 0.25)
        out.push(AVISO('Impacto MODERADO: el ahorro proyectado es el ' + p1(ratio) + ' de la línea base (' + refTxt +
          '). Es defendible, pero revisa si el escenario RETADORA no está subestimado.'));
      else
        out.push(BIEN('Impacto ALTO: el ahorro proyectado es el ' + p1(ratio) + ' de la línea base (' + refTxt +
          '). El caso de negocio se sostiene solo ante el Champion y ante la ARL.'));
    }
    if (u && ahU)
      out.push(PLATA('Ahorro en dinero por escenario · DESEADO ' + mny(u * ahU) + ' · GOAL ' + mny(u * goalU) +
        ' · RETADORA ' + mny(u * retU) + ' (costo unitario ' + mny(u) + ').'));
    if (ahU && goalU && goalU < ahU)
      out.push(AVISO('El escenario GOAL (' + n2(goalU) + ') es MENOR que el DESEADO (' + n2(ahU) +
        '): la escala debe ser creciente DESEADO ≤ GOAL ≤ RETADORA. Revisa las cifras antes de firmar el charter.'));
    if (goalU && retU && retU < goalU)
      out.push(AVISO('El escenario RETADORA (' + n2(retU) + ') es MENOR que el GOAL (' + n2(goalU) +
        '): por definición la meta retadora debe superar a la meta comprometida.'));
    const hard = fl(RS(d, 'entregables'), 'hard').length;
    const soft = fl(RS(d, 'entregables'), 'soft').length;
    if (!hard && !soft)
      out.push(FALTA('No hay ENTREGABLES registrados. Lista los HARD SAVINGS (dinero verificable en el P&G) y los SOFT SAVINGS (clima, imagen, riesgo): Finanzas sólo firma los primeros.'));
    else
      out.push(INFO('Entregables declarados: ' + n0(hard) + ' hard savings y ' + n0(soft) +
        ' soft savings.' + (hard ? '' : ' Sin ningún hard saving el proyecto no aporta al resultado financiero: revísalo con Finanzas.')));
    /* coherencia con la tabla de identificación */
    const ti = sum(RS(T(ctx, 'definir.tabla_identificacion'), 'rows'), 'ahorro');
    if (ti > 0 && ah$ > 0 && Math.abs(safeDiv(ti - ah$, ah$)) > 0.20)
      out.push(AVISO('El ahorro de esta hoja (' + mny(ah$) + ') difiere en ' + p0(Math.abs(safeDiv(ti - ah$, ah$))) +
        ' del declarado en la «Tabla de identificación del proyecto» (' + mny(ti) + '). Concilia las dos cifras: el charter sólo puede llevar una.'));
    return out;
  };

  /* Tabla de identificación del proyecto ---------------------------------- */
  REGLAS['definir.tabla_identificacion'] = function(d, ctx){
    const out = [];
    const rows = RS(d, 'rows').filter(r => tx(r.ctq));
    if (!tx(d.caso) && !rows.length)
      return [FALTA('Sin CASO DEL NEGOCIO ni CTQ. Responde por qué este proyecto, por qué ahora y qué pasa si no se hace, y registra al menos un CTQ con su línea base, objetivo, ideal y ahorro.')];
    if (!tx(d.caso))
      out.push(AVISO('Falta el CASO DEL NEGOCIO: es el texto que se hereda al Business Case del Project Charter y el que sostiene el proyecto ante la dirección.'));
    if (!rows.length)
      out.push(AVISO('No hay CTQ registrados: sin métrico crítico para la calidad no hay contra qué medir el resultado.'));
    rows.forEach((r, i) => {
      if (!isNum(r.base))
        out.push(FALTA('El CTQ ' + (i + 1) + ' («' + corta(r.ctq, 34) + '») no tiene LINEA BASE. Tómala de la hoja «Series de tiempo», no de una estimación.'));
      else if (isNum(r.obj)){
        const gap = num(r.base) - num(r.obj);
        out.push(META('CTQ ' + (i + 1) + ' «' + corta(r.ctq, 30) + '»: de ' + n2(r.base) + ' a ' + n2(r.obj) +
          ' → GAP de ' + n2(Math.abs(gap)) + ' (' + p1(safeDiv(Math.abs(gap), Math.abs(num(r.base)) || 1)) + ')' +
          (isNum(r.ahorro) && num(r.ahorro) ? ' con un ahorro asociado de ' + mny(r.ahorro) : '') + '.'));
      }
    });
    const ah = sum(rows, 'ahorro');
    if (ah > 0)
      out.push(PLATA('Ahorro total identificado: ' + mny(ah) + ' en ' + n0(rows.length) + ' CTQ. Esta cifra debe coincidir con la hoja «Beneficios» y con el Total Benefit del Project Charter.'));
    /* baseline vs serie de tiempo */
    const b = baseDefinir(ctx);
    if (b.n && rows.length && isNum(rows[0].base) && isFinite(b.prom)){
      const dif = Math.abs(safeDiv(num(rows[0].base) - b.prom, b.prom || 1));
      if (dif > 0.10)
        out.push(AVISO('La línea base del primer CTQ (' + n2(rows[0].base) + ') se aparta ' + p0(dif) +
          ' del promedio medido en «Series de tiempo» (' + n2(b.prom) + ' con ' + n0(b.n) + ' puntos). Usa el dato medido.'));
    }
    return out;
  };

  /* Project Members ------------------------------------------------------- */
  REGLAS['definir.project_members'] = function(d){
    const out = [];
    const rows = RS(d, 'rows');
    const conNombre = rows.filter(r => tx(r.nombre));
    if (!conNombre.length)
      return [FALTA('Equipo sin integrantes. Registra al menos los 5 roles clave: Champion/Sponsor, Dueño del Proceso, Finanzas, Mentor (MBB-BB) y Facilitador (GB-BB).')];
    const ROL = ['Champion / Sponsor', 'Dueño del Proceso', 'Finanzas', 'Mentor (MBB-BB)', 'Facilitador (GB-BB)'];
    const faltan = [0, 1, 2, 3, 4].filter(i => !tx((rows[i] || {}).nombre)).map(i => ROL[i]);
    if (faltan.length)
      out.push(AVISO('Faltan ' + n0(faltan.length) + ' de los 5 roles clave: ' + lista(faltan, 5) +
        '.' + (faltan.indexOf('Finanzas') >= 0 ? ' Sin Finanzas nadie valida los ahorros y el charter queda incompleto.' : '')));
    else
      out.push(BIEN('Los 5 roles clave están cubiertos. El equipo tiene ' + n0(conNombre.length) + ' integrante(s).'));
    if (conNombre.length > 8)
      out.push(AVISO('El equipo tiene ' + n0(conNombre.length) + ' integrantes: por encima de 8 las reuniones dejan de decidir. Deja un núcleo de 5 a 8 y consulta al resto por tema.'));
    const sinCargo = conNombre.filter(r => !tx(r.job)).length;
    if (sinCargo)
      out.push(INFO(n0(sinCargo) + ' integrante(s) sin cargo (JOB): el cargo es lo que define la autoridad para ejecutar las acciones de MEJORAR.'));
    return out;
  };

  /* Diagrama de Gantt ----------------------------------------------------- */
  REGLAS['definir.gantt'] = function(d){
    const out  = [];
    const rows = RS(d, 'rows');
    const esAv = r => /AVANCE DEL PROYECTO/i.test(tx(r && r.tarea));
    const tareas = rows.filter(r => tx(r.tarea) && !r.fase && !esAv(r));
    if (!tareas.length)
      return [FALTA('El cronograma está vacío. Reemplaza «Tarea N» por las tareas reales de cada fase DMAIC y ponles INICIO, FIN, ASIGNADO A y PROGRESO.')];

    /* avance por fase, igual que la fórmula del original */
    const fases = [];
    rows.forEach((r, i) => {
      if (!r.fase || esAv(r)) return;
      const hijos = [];
      for (let j = i + 1; j < rows.length; j++){
        if (rows[j].fase) break;
        if (tx(rows[j].tarea)) hijos.push(rows[j]);
      }
      const v = hijos.filter(x => isNum(x.progreso)).map(x => p01(x.progreso));
      fases.push({ nombre: tx(r.tarea), hijos: hijos,
                   avance: v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN,
                   conFecha: hijos.filter(x => tx(x.inicio) && tx(x.fin)).length });
    });
    let avance = NaN;
    if (fases.length)
      avance = fases.reduce((a, f) => a + (isFinite(f.avance) ? f.avance : 0), 0) / fases.length;
    else {
      const v = tareas.filter(x => isNum(x.progreso)).map(x => p01(x.progreso));
      avance = v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
    }

    let ini = null, fin = null;
    tareas.forEach(r => {
      if (tx(r.inicio) && (!ini || r.inicio < ini)) ini = r.inicio;
      if (tx(r.fin) && (!fin || r.fin > fin)) fin = r.fin;
    });
    const dias = r => { const n = dDiff(r.inicio, r.fin); return isFinite(n) ? n + 1 : NaN; };

    /* tareas vencidas */
    const venc = tareas.filter(r => tx(r.fin) && dDiff(r.fin, hoy()) > 0 && p01(r.progreso) < 1)
      .sort((a, b) => dDiff(b.fin, hoy()) - dDiff(a.fin, hoy()));
    if (venc.length)
      out.push(ALTA(n0(venc.length) + ' tarea(s) VENCIDA(S) (fin anterior a hoy y progreso menor al 100 %): ' +
        lista(venc.slice(0, 3).map(r => '«' + corta(r.tarea, 26) + '» ' + n0(dDiff(r.fin, hoy())) + ' día(s) de atraso, ' +
          p0(p01(r.progreso)) + ' de avance'), 3) + (venc.length > 3 ? ' y ' + n0(venc.length - 3) + ' más' : '') +
        '. Replantéalas en la reunión de equipo o mueve la fecha con justificación.'));
    else
      out.push(BIEN('No hay tareas vencidas: todas las que ya tenían fecha de fin están al 100 % o siguen en plazo.'));

    /* fases sin fecha */
    const fSinFecha = fases.filter(f => f.hijos.length && !f.conFecha).map(f => f.nombre);
    const fVacias   = fases.filter(f => !f.hijos.length).map(f => f.nombre);
    if (fSinFecha.length)
      out.push(AVISO('Fase(s) sin ninguna fecha programada: ' + lista(fSinFecha, 5) +
        '. Una fase sin fechas no entra en la ruta crítica ni se puede controlar.'));
    if (fVacias.length)
      out.push(AVISO('Fase(s) sin tareas: ' + lista(fVacias, 5) + '. Cada fase DMAIC debe tener al menos una tarea con responsable.'));

    /* sin responsable / sin fechas */
    const sinResp = tareas.filter(r => !tx(r.asignado)).length;
    if (sinResp)
      out.push(AVISO(n0(sinResp) + ' de ' + n0(tareas.length) + ' tarea(s) sin ASIGNADO A (' +
        p0(safeDiv(sinResp, tareas.length)) + '): una tarea sin dueño no se ejecuta.'));
    const sinFecha = tareas.filter(r => !tx(r.inicio) || !tx(r.fin)).length;
    if (sinFecha)
      out.push(AVISO(n0(sinFecha) + ' de ' + n0(tareas.length) + ' tarea(s) sin fecha de inicio o de fin: no se pueden programar ni medir.'));

    /* ruta crítica aproximada (por duración) */
    const crit = tareas.filter(r => isFinite(dias(r))).sort((a, b) => dias(b) - dias(a)).slice(0, 3);
    if (crit.length && ini && fin){
      const dur = dDiff(ini, fin) + 1;
      const sumaCrit = crit.reduce((a, r) => a + dias(r), 0);
      out.push(RELOJ('Ruta crítica aproximada (tareas más largas): ' +
        lista(crit.map(r => '«' + corta(r.tarea, 24) + '» ' + n0(dias(r)) + ' días'), 3) +
        '. Suman ' + n0(sumaCrit) + ' de los ' + n0(dur) + ' días del cronograma (' +
        p0(safeDiv(sumaCrit, dur)) + '): si alguna se atrasa, se atrasa el proyecto completo.'));
    }

    /* proyección de cierre */
    if (ini && fin && isFinite(avance)){
      const dur   = dDiff(ini, fin) + 1;
      const trans = dDiff(ini, hoy()) + 1;
      out.push(INFO('Avance del proyecto ' + p0(avance) + ' · del ' + fch(ini) + ' al ' + fch(fin) +
        ' (' + n0(dur) + ' días · ' + n0(Math.ceil(dur / 7)) + ' semanas).'));
      if (trans > 0 && dur > 0){
        const esperado = clamp(safeDiv(trans, dur), 0, 1);
        if (avance > 0.02){
          const estim = Math.round(trans / avance);
          const proy  = dAdd(ini, estim - 1);
          const desv  = dDiff(fin, proy);
          if (isFinite(desv) && desv > 0)
            out.push(ALTA('PROYECCIÓN DE CIERRE: con ' + p0(avance) + ' de avance real en ' + n0(trans) + ' de ' + n0(dur) +
              ' días transcurridos (' + p0(esperado) + ' del calendario), el cierre proyectado es el ' + fch(proy) +
              ': ' + n0(desv) + ' día(s) DESPUÉS de lo planeado (' + fch(fin) + '). Recorta alcance, agrega recursos o renegocia la fecha con el Champion.'));
          else if (isFinite(desv))
            out.push(BIEN('PROYECCIÓN DE CIERRE: con ' + p0(avance) + ' de avance en ' + n0(trans) + ' de ' + n0(dur) +
              ' días, el cierre proyectado es el ' + fch(proy) + ': ' + n0(Math.abs(desv)) + ' día(s) ANTES de lo planeado (' + fch(fin) + ').'));
        }
        if (isFinite(esperado) && esperado - avance > 0.15)
          out.push(ALTA('El proyecto va RETRASADO: ha transcurrido el ' + p0(esperado) + ' del calendario y el avance real es ' +
            p0(avance) + ' — una brecha de ' + n0((esperado - avance) * 100) + ' puntos porcentuales.'));
      }
      if (dDiff(fin, hoy()) > 0 && avance < 0.99)
        out.push(ALTA('La fecha de fin del cronograma (' + fch(fin) + ') ya pasó hace ' + n0(dDiff(fin, hoy())) +
          ' día(s) y el avance es ' + p0(avance) + '. El cronograma está vencido: reprográmalo formalmente.'));
    }
    if (!tx(d.responsable))
      out.push(FALTA('Falta el «Responsable del proyecto» en el encabezado del Gantt: es el nombre que se hereda al Plan de Acción de MEJORAR.'));
    return out;
  };

  /* Project Charter ------------------------------------------------------- */
  REGLAS['definir.project_charter'] = function(d, ctx){
    const out = [];
    const partes = [
      ['problema', 'Enunciado del Problema', tx(d.problema) || tx(T(ctx, 'definir.clarificacion_problema').definicion)],
      ['businessCase', 'Business Case', tx(d.businessCase) || tx(T(ctx, 'definir.tabla_identificacion').caso)],
      ['objetivo', 'Objetivo del Proyecto', tx(d.objetivo) || objetivoTexto(ctx)],
      ['scopeIn', 'Scope In', tx(d.scopeIn)],
      ['scopeOut', 'Scope Out', tx(d.scopeOut)]
    ];
    const ok = partes.filter(x => x[2]);
    if (!ok.length)
      return [FALTA('El Project Charter está vacío. Es el contrato del proyecto y se firma ANTES de pasar a MEDIR: problema, caso del negocio, objetivo, scope in y scope out.')];
    if (ok.length < 5)
      out.push(ALTA('Charter incompleto: ' + n0(ok.length) + ' de 5 apartados (' +
        lista(partes.filter(x => !x[2]).map(x => x[1]), 5) + ' sin escribir). Sin Scope Out el alcance crece solo.'));
    else
      out.push(BIEN('Charter completo en sus 5 apartados: problema, caso del negocio, objetivo, scope in y scope out.'));

    const objTxt = tx(d.objetivo) || objetivoTexto(ctx);
    if (objTxt && !numerosDe(objTxt).length)
      out.push(ALTA('El objetivo del charter NO tiene meta numérica. Un charter sin cifra objetivo no se puede cerrar: nadie podrá decir si el proyecto cumplió.'));

    const ah  = RS(d, 'ahorros');
    const CAT = ['Garantia', 'Scrap', 'Retrabajo', 'Suministros', 'Material', 'Inventario',
                 'Inventory', 'Cycle time', 'Ingresos', 'Desperdicios'];
    const suma = k => ah.reduce((a, r, i) => a + (CAT[i] === 'Cycle time' ? 0 : num(r[k])), 0);
    const th = suma('hard'), ts = suma('soft');
    if (th + ts > 0)
      out.push(PLATA('Total Benefit pactado: ' + mny(th + ts) + ' (hard ' + mny(th) + ' · soft ' + mny(ts) +
        '). Recuerda que «Cycle time» no suma, igual que la fórmula =SUM(N23:O29,N31:O32).' +
        (th === 0 ? ' Sin ningún hard benefit Finanzas no podrá certificar el ahorro.' : '')));
    else
      out.push(AVISO('No hay ahorros cuantificados en la tabla de Ahorros: sin Total Benefit el charter no tiene caso financiero.'));

    const met = fl(RS(d, 'metDef'), 'nombre');
    if (!met.length)
      out.push(ALTA('No hay «Metricos Clave - fase DEFINIR». Sin ellos la hoja de CIERRE en CONTROLAR no tiene contra qué comparar y el proyecto no se puede cerrar formalmente.'));
    else {
      const sinBase = met.filter(r => !isNum(r.base)).length;
      const sinObj  = met.filter(r => !isNum(r.obj)).length;
      out.push(INFO(n0(met.length) + ' métrico(s) clave registrados' +
        (sinBase ? ' · ' + n0(sinBase) + ' sin Baseline' : '') +
        (sinObj ? ' · ' + n0(sinObj) + ' sin Objetivo' : '') +
        (!sinBase && !sinObj ? ', todos con línea base y objetivo.' : '. Complétalos: son la vara de medir del cierre.')));
    }
    const fd = fl(RS(d, 'firmasDef'), 'firma').length;
    if (fd < 5)
      out.push(AVISO('Faltan ' + n0(5 - fd) + ' firma(s) de la fase DEFINIR (' + n0(fd) +
        '/5). El charter sin firmar no compromete recursos: consíguelas antes de arrancar MEDIR.'));
    else
      out.push(BIEN('Las 5 firmas de la fase DEFINIR están registradas: el proyecto está formalmente autorizado.'));
    if (!isNum(d.duracion))
      out.push(FALTA('Falta la «Duracion del proyecto (semanas)». Tómala del cronograma del Gantt.'));
    return out;
  };

  /* ---------------------------------------------------------------------
     4.2 · MEDIR
     ------------------------------------------------------------------- */

  /* aviso de coherencia: MEDIR sin problema definido en DEFINIR */
  function avisoSinDefinir(ctx){
    if (problemaTexto(ctx)) return null;
    return AVISO('Todavía no hay un enunciado de problema en DEFINIR (Clarificación / Project Charter). Medir sin problema definido produce datos que nadie usa: cierra DEFINIR primero.');
  }

  /* DPMO ------------------------------------------------------------------ */
  REGLAS['medir.dpmo'] = function(d, ctx){
    const out = [];
    const c = dpmoDe(d);
    if (!(c.opps > 0))
      return [FALTA('DPMO sin datos. Registra las UNITS INSPECTED por proceso y los defectos de cada una de las 4 categorías: DPMO = (defectos totales / (unidades × 4)) × 1.000.000.')];
    out.push(INFO('Base del cálculo: ' + n0(c.units) + ' unidades × ' + n0(c.cats) + ' categorías = ' +
      n0(c.opps) + ' oportunidades de defecto · ' + n0(c.defs) + ' defectos encontrados (' +
      p2p(safeDiv(c.defs, c.opps)) + ' de las oportunidades).'));
    const ms = msgSigma('DPMO', c.dpmo, ctx); if (ms) out.push(ms);
    const salto = msgSalto4Sigma(c.dpmo); if (salto) out.push(salto);
    /* categoría dominante */
    const rows = RS(d, 'rows');
    const CATD = ['RAYONES', 'DEFORMACION', 'EXCESO DE MATERIAL', 'FALTA MATERIAL'];
    const cats = [1, 2, 3, 4].map(i => ({ l: tx(d['cat' + i]) || CATD[i - 1], v: sum(rows, 'c' + i) }))
      .filter(x => x.v > 0).sort((a, b) => b.v - a.v);
    if (cats.length){
      out.push(META('La categoría «' + cats[0].l + '» aporta ' + n0(cats[0].v) + ' de ' + n0(c.defs) +
        ' defectos (' + p1(safeDiv(cats[0].v, c.defs)) + '): es la primera que entra al Ishikawa y al alcance del proyecto.'));
      let ac = 0, k = 0;
      cats.forEach(x => { if (ac < 0.8 * c.defs){ ac += x.v; k++; } });
      if (k && k < cats.length)
        out.push(IDEA('Con ' + n0(k) + ' de ' + n0(cats.length) + ' categorías se cubre el ' + p1(safeDiv(ac, c.defs)) +
          ' de los defectos: ' + lista(cats.slice(0, k).map(x => x.l), 3) + '.'));
    }
    /* proceso peor */
    const pr = rows.filter(r => tx(r.proceso) && num(r.units) > 0)
      .map(r => ({ l: tx(r.proceso), u: num(r.units),
                   dd: safeDiv(num(r.c1) + num(r.c2) + num(r.c3) + num(r.c4), num(r.units) * 4) * 1e6 }))
      .sort((a, b) => b.dd - a.dd);
    if (pr.length > 1)
      out.push(AVISO('El peor desempeño es «' + pr[0].l + '» con ' + n0(pr[0].dd) + ' DPMO (' +
        n2(sigmaLevel(pr[0].dd)) + 'σ) frente al mejor, «' + pr[pr.length - 1].l + '», con ' +
        n0(pr[pr.length - 1].dd) + ' DPMO (' + n2(sigmaLevel(pr[pr.length - 1].dd)) +
        'σ). Esa diferencia entre procesos comparables es la oportunidad más barata: estandariza hacia el mejor.'));
    const av = avisoSinDefinir(ctx); if (av) out.push(av);
    return out;
  };
  /* porcentaje con 2 decimales para proporciones muy pequeñas */
  function p2p(v){ return isFinite(v) ? fmt(v, 'p2') : '—'; }

  /* PPM ------------------------------------------------------------------- */
  REGLAS['medir.ppm'] = function(d, ctx){
    const out = [];
    const c = ppmDe(d);
    if (!(c.units > 0))
      return [FALTA('PPM sin datos. Registra UNITS INSPECTED y DEFECTS (unidades defectuosas, no cantidad de defectos) por proceso.')];
    out.push(INFO('Consolidado: ' + n0(c.defects) + ' unidades defectuosas de ' + n0(c.units) +
      ' inspeccionadas → ' + p2p(c.prop) + ' de defectuosas · % PASS-YIELD ' + p2p(1 - c.prop) + '.'));
    const ms = msgSigma('PPM defective', c.ppm, ctx); if (ms) out.push(ms);
    const salto = msgSalto4Sigma(c.ppm); if (salto) out.push(salto);
    const pr = c.rows.filter(r => tx(r.proceso) && num(r.units) > 0)
      .map(r => ({ l: tx(r.proceso), u: num(r.units), df: num(r.defects),
                   ppm: safeDiv(num(r.defects), num(r.units)) * 1e6 }))
      .sort((a, b) => b.ppm - a.ppm);
    if (pr.length > 1){
      out.push(AVISO('Proceso más crítico: «' + pr[0].l + '» con ' + n0(pr[0].ppm) + ' PPM (' +
        n2(sigmaLevel(pr[0].ppm)) + 'σ · ' + n0(pr[0].df) + ' de ' + n0(pr[0].u) + ' unidades). ' +
        'El mejor, «' + pr[pr.length - 1].l + '», está en ' + n0(pr[pr.length - 1].ppm) + ' PPM: hay ' +
        n0(safeDiv(pr[0].ppm, Math.max(1, pr[pr.length - 1].ppm))) + 'x de diferencia entre ambos.'));
    }
    if (c.units < 100)
      out.push(AVISO('Sólo ' + n0(c.units) + ' unidades inspeccionadas: con menos de 100 el PPM es muy inestable (cada unidad defectuosa mueve el indicador ' +
        n0(safeDiv(1e6, c.units)) + ' PPM). Aumenta la muestra antes de concluir.'));
    return out;
  };

  /* DPU ------------------------------------------------------------------- */
  REGLAS['medir.dpu'] = function(d){
    const out = [];
    const defs = sum(RS(d, 'rows'), 'cant'), u = num(d.inspeccionadas);
    if (!(u > 0) || !RS(d, 'rows').length)
      return [FALTA('DPU sin datos. Registra las NO CONFORMANCIAS con su cantidad y el TOTAL INSPECCIONADAS: DPU = defectos / unidades.')];
    const dpu = safeDiv(defs, u), yld = isFinite(dpu) ? Math.exp(-dpu) : NaN;
    out.push(INFO('DPU = ' + n3(dpu) + ' (' + n0(defs) + ' defectos en ' + n0(u) + ' unidades) → ' +
      n1(dpu * 100) + ' defectos por cada 100 unidades.'));
    if (isFinite(yld)){
      const mal = 1 - yld;
      const sev = yld >= 0.95 ? 'ok' : (yld >= 0.85 ? 'media' : 'alta');
      out.push(MSG(sev === 'ok' ? '✅' : (sev === 'media' ? '⚠️' : '⛔'),
        'Yield estimado (Poisson, e^−DPU) = ' + p1(yld) + ': de cada 100 unidades ' + n0(Math.round(mal * 100)) +
        ' salen con al menos un defecto. Ese es el trabajo que se rehace o se pierde.', sev));
    }
    const ms = msgSigma('DPU convertido a DPMO (1 oportunidad por unidad)', dpu * 1e6, null);
    if (ms && dpu <= 1) out.push(ms);
    const nc = fl(RS(d, 'rows'), 'noconf').map(r => ({ l: tx(r.noconf), v: num(r.cant) }))
      .filter(x => x.v > 0).sort((a, b) => b.v - a.v);
    if (nc.length){
      out.push(META('No conformancia dominante: «' + nc[0].l + '» con ' + n0(nc[0].v) + ' de ' + n0(defs) +
        ' defectos (' + p1(safeDiv(nc[0].v, defs)) + '). Empieza por ahí.'));
      if (nc.length > 1){
        let ac = 0, k = 0;
        nc.forEach(x => { if (ac < 0.8 * defs){ ac += x.v; k++; } });
        out.push(IDEA(n0(k) + ' de ' + n0(nc.length) + ' no conformancias acumulan el ' + p1(safeDiv(ac, defs)) +
          ' de los defectos: ' + lista(nc.slice(0, k).map(x => x.l), 3) + '.'));
      }
    }
    if (dpu > 1)
      out.push(ALTA('DPU mayor que 1 (' + n3(dpu) + '): en promedio cada unidad sale con más de un defecto. El proceso no está bajo control: la prioridad es contener antes de optimizar.'));
    return out;
  };

  /* YIELD ----------------------------------------------------------------- */
  REGLAS['medir.yield'] = function(d, ctx){
    const out = [];
    const tot = num(d.totales), mal = num(d.malas);
    if (!(tot > 0))
      return [FALTA('YIELD sin datos. Escribe PIEZAS TOTALES y PIEZAS MALAS del periodo: el yield y el porcentaje de defectos se calculan solos.')];
    const bue = tot - mal, y = safeDiv(bue, tot), dfe = safeDiv(mal, tot), ppm = dfe * 1e6;
    if (mal > tot)
      out.push(ALTA('Las PIEZAS MALAS (' + n0(mal) + ') superan a las TOTALES (' + n0(tot) + '): revisa la captura, el dato es imposible.'));
    out.push(INFO('YIELD = ' + p2p(y) + ' (' + n0(bue) + ' buenas de ' + n0(tot) + ') · DEFECTOS = ' +
      p2p(dfe) + ' (' + n0(mal) + ' unidades).'));
    const ms = msgSigma('PPM defectuosas', ppm, ctx); if (ms) out.push(ms);
    /* comparación con FPY */
    const r = T(ctx, 'medir.rty_fpy');
    const ch = rtyCadena(r);
    const fpy = ch ? ch.fpy : NaN;
    if (isFinite(fpy) && isFinite(y) && y - fpy > 0.02)
      out.push(ALTA('El YIELD de inspección final (' + p1(y) + ') es ' + n1((y - fpy) * 100) +
        ' puntos mayor que el FPY de la hoja RTY-FPY (' + p1(fpy) + '): ese diferencial es retrabajo. El proceso está viviendo de las correcciones (fábrica oculta).'));
    if (isFinite(y) && y >= 0.95 && isFinite(fpy) && fpy < 0.85)
      out.push(AVISO('Un yield final del ' + p1(y) + ' con un FPY del ' + p1(fpy) +
        ' significa que la calidad se está «inspeccionando», no construyendo. Ataca la primera pasada, no la inspección.'));
    return out;
  };

  /* RTY / FPY -------------------------------------------------------------- */
  function rtyCadena(d){
    const rows = arr(d && d.rows);
    if (!rows.length && !num(d && d.inicio)) return null;
    const res = [];
    for (let i = 0; i < 6; i++){
      const r = rows[i] || {};
      const def = num(r.defects), rew = num(r.rework);
      const pv = i === 0 ? null : res[i - 1];
      const inn = i === 0 ? num(d.inicio) : (pv.inn - pv.def - pv.rew + pv.rew);
      const out = inn - def;
      const yld = safeDiv(out, inn);
      const fo  = i === 0 ? (inn - def - rew) : (pv.fo - def - rew);
      const fy  = i === 0 ? safeDiv(fo, inn) : safeDiv(fo, pv.fo);
      res.push({ i: i, name: tx(r.name) || ('ESTACION ' + (i + 1)), inn: inn, def: def, rew: rew,
                 out: out, yld: yld, fo: fo, fy: fy });
    }
    const prod = k => { let p = 1, n = 0;
      res.forEach(s => { if (s.inn > 0 && isFinite(s[k])){ p *= s[k]; n++; } });
      return n ? p : NaN; };
    return { res: res, rty: prod('yld'), fpy: prod('fy'),
             activas: res.filter(s => s.inn > 0),
             defs: sum(rows, 'defects'), rew: sum(rows, 'rework'), inicio: num(d.inicio) };
  }
  REGLAS['medir.rty_fpy'] = function(d, ctx){
    const out = [];
    const c = rtyCadena(d);
    if (!c || !(c.inicio > 0))
      return [FALTA('RTY-FPY sin datos. Escribe el INICIO (unidades que entran a la primera estación) y, por estación, los DEFECTS y los REWORK: las entradas siguientes se calculan solas.')];
    if (!isFinite(c.rty))
      return [FALTA('Aún no hay estaciones con datos suficientes para calcular el RTY. Llena al menos la primera estación.')];

    out.push(INFO('Cadena de ' + n0(c.activas.length) + ' estación(es) sobre ' + n0(c.inicio) +
      ' unidades de entrada · RTY = ' + p1(c.rty) + ' · FPY = ' + p1(c.fpy) + '.'));
    const ms = msgSigma('RTY convertido a DPMO', (1 - c.rty) * 1e6, ctx); if (ms) out.push(ms);

    const brecha = c.rty - c.fpy;
    if (isFinite(brecha) && brecha > 0.02){
      const uds = c.rew;
      out.push(ALTA('FÁBRICA OCULTA: la brecha entre RTY (' + p1(c.rty) + ') y FPY (' + p1(c.fpy) + ') es de ' +
        n1(brecha * 100) + ' puntos porcentuales. Sobre ' + n0(c.inicio) + ' unidades de entrada son ' +
        n0(c.rew) + ' unidad(es) retrabajada(s) (' + p1(safeDiv(uds, c.inicio)) +
        ' del volumen): trabajo que se hace dos veces, no se factura y hoy no aparece en ningún indicador. Cuantifícalo en horas y en dinero y llévalo al Business Case.'));
    } else if (isFinite(brecha) && brecha >= 0){
      out.push(BIEN('RTY (' + p1(c.rty) + ') y FPY (' + p1(c.fpy) + ') casi coinciden (' + n1(brecha * 100) +
        ' puntos): prácticamente no hay retrabajo oculto. Lo que se pierde, se pierde de una vez.'));
    }
    /* cuello de botella */
    const act = c.activas.filter(s => isFinite(s.yld));
    if (act.length > 1){
      const peor = act.slice().sort((a, b) => a.yld - b.yld)[0];
      out.push(META('Estación cuello de botella: «' + peor.name + '» con yield ' + p1(peor.yld) + ' (' +
        n0(peor.def) + ' defectos y ' + n0(peor.rew) + ' retrabajos sobre ' + n0(peor.inn) +
        ' unidades). Subirla al ' + p0(Math.min(0.99, peor.yld + 0.05)) + ' elevaría el RTY a ' +
        p1(c.rty * safeDiv(Math.min(0.99, peor.yld + 0.05), peor.yld)) + '.'));
      const conRew = act.filter(s => s.rew > 0).sort((a, b) => b.rew - a.rew);
      if (conRew.length)
        out.push(AVISO('El retrabajo se concentra en «' + conRew[0].name + '» con ' + n0(conRew[0].rew) +
          ' de ' + n0(c.rew) + ' unidades retrabajadas (' + p1(safeDiv(conRew[0].rew, c.rew)) + ').'));
    }
    if (c.activas.length < 6)
      out.push(INFO('Sólo ' + n0(c.activas.length) + ' de 6 estaciones tienen datos: las estaciones con In = 0 no entran al producto, así que el RTY mostrado es OPTIMISTA. Llena la cadena completa para un RTY real.'));
    return out;
  };

  /* % VALOR AGREGADO ------------------------------------------------------- */
  REGLAS['medir.valor_add'] = function(d){
    const out = [];
    const rows = RS(d, 'rows');
    const s = cat => rows.reduce((a, r) => a + (String(r.categoria || '').toUpperCase() === cat ? num(r.tiempo) : 0), 0);
    const va = s('VA'), nva = s('NVA'), nvar = s('NVAR'), total = va + nva + nvar;
    if (!(total > 0))
      return [FALTA('No hay actividades con tiempo. Lista las actividades del proceso, clasifícalas en VA / NVA / NVAR y mide su TIEMPO en la misma unidad (minutos) para una sola unidad de servicio.')];
    const pva = safeDiv(va, total), pnva = safeDiv(nva, total), pnvar = safeDiv(nvar, total);
    out.push(INFO('Tiempo total del proceso: ' + n2(total) + ' · VA ' + n2(va) + ' (' + p1(pva) +
      ') · NVA ' + n2(nva) + ' (' + p1(pnva) + ') · NVAR ' + n2(nvar) + ' (' + p1(pnvar) + ').'));
    if (pva < 0.25)
      out.push(ALTA('DESPERDICIO DOMINANTE: el valor agregado es sólo el ' + p1(pva) + ' del tiempo total (' +
        n2(va) + ' de ' + n2(total) + '). El ' + p1(1 - pva) + ' del tiempo el afiliado espera sin recibir valor. ' +
        'Por debajo del 25 % de VA la prioridad es un VALUE STREAM MAPPING del flujo completo, no optimizar tareas sueltas: eliminando el NVA se puede recortar hasta ' +
        n2(nva) + ' del tiempo de ciclo sin tocar la calidad del servicio.'));
    else
      out.push(BIEN('El valor agregado es el ' + p1(pva) + ' del tiempo total: está por encima del umbral del 25 %. Sigue atacando el NVA (' +
        n2(nva) + ' · ' + p1(pnva) + ') que aún es eliminable.'));
    const nvaRows = rows.filter(r => String(r.categoria || '').toUpperCase() === 'NVA' && num(r.tiempo) > 0)
      .sort((a, b) => num(b.tiempo) - num(a.tiempo));
    if (nvaRows.length)
      out.push(META('El NVA más costoso es «' + corta(nvaRows[0].actividad, 40) + '» con ' + n2(nvaRows[0].tiempo) +
        ' (' + p1(safeDiv(num(nvaRows[0].tiempo), total)) + ' del tiempo total). Eliminarlo es la primera solución candidata de MEJORAR.'));
    if (pnvar > 0.40)
      out.push(AVISO('El NVAR (necesario pero sin valor) pesa ' + p1(pnvar) + ' del tiempo: es alto. Revisa cuáles de esos requisitos son realmente exigencia de la ARL o del contrato y cuáles son costumbre interna: los segundos son NVA disfrazado.'));
    const sinCat = rows.filter(r => tx(r.actividad) && !tx(r.categoria)).length;
    if (sinCat)
      out.push(FALTA(n0(sinCat) + ' actividad(es) sin clasificar en VA / NVA / NVAR: quedan fuera del cálculo y subestiman el desperdicio.'));
    return out;
  };

  /* Serie de tiempo de MEDIR ---------------------------------------------- */
  REGLAS['medir.grafico_serie_tiempo'] = function(d, ctx){
    const S = d.serie || {}, V = [];
    for (let i = 1; i <= 13; i++){
      const v = S['m' + i + '.valor'];
      if (v !== '' && v !== null && v !== undefined && isNum(v)) V.push(num(v));
    }
    if (!V.length)
      return [FALTA('La serie de 13 periodos está vacía. Registra un valor por mes (deja en blanco los meses sin dato, no escribas ceros falsos): esta serie es la línea base contra la que se compara en CONTROLAR.')];
    const b = baseDefinir(ctx);
    const obj = isFinite(b.objetivo) ? b.objetivo : null;
    const out = analizarSerie(V, obj, '', 12);
    if (!tx(d.criterio))
      out.push(FALTA('Falta el nombre del CRITERIO con su unidad (ej.: «% de citas incumplidas»). Sin unidad la serie no es comparable con el gráfico ANTES-DESPUES de CONTROLAR.'));
    if (b.n && isFinite(b.prom)){
      const m = V.reduce((a, x) => a + x, 0) / V.length;
      const dif = Math.abs(safeDiv(m - b.prom, b.prom || 1));
      if (isFinite(dif) && dif > 0.15)
        out.push(AVISO('El promedio de esta serie (' + n2(m) + ') difiere ' + p0(dif) +
          ' del de «DEFINIR › Series de tiempo» (' + n2(b.prom) + ' con ' + n0(b.n) +
          ' puntos). Si son el mismo métrico, unifica la fuente de datos antes de seguir a ANALIZAR.'));
    }
    const av = avisoSinDefinir(ctx); if (av) out.push(av);
    return out;
  };

  /* Tamaños de muestra ----------------------------------------------------- */
  function muestraStats(ctx){
    function nCual(o){
      const z = zConf(o && o.conf), p = prop(o && o.p), e = prop(o && o.err), N = num(o && o.pobN);
      const nd = safeDiv(z * z * p * (1 - p), e * e);
      const nc = safeDiv(N * z * z * p * (1 - p), (N - 1) * e * e + z * z * p * (1 - p));
      const n  = N > 0 ? nc : nd;
      return { z: z, p: p, e: e, N: N, n: (isFinite(n) && n > 0) ? Math.ceil(n) : NaN };
    }
    function nCuan(o){
      const z = zConf(o && o.conf), s = num(o && o.sigma), e = num(o && o.err), N = num(o && o.pobN);
      const nd = safeDiv(z * z * s * s, e * e);
      const nc = safeDiv(N * z * z * s * s, (N - 1) * e * e + z * z * s * s);
      const n  = N > 0 ? nc : nd;
      return { z: z, s: s, e: e, N: N, n: (isFinite(n) && n > 0) ? Math.ceil(n) : NaN };
    }
    let a = nCual(T(ctx, 'medir.tamano_muestra_cualitativos'));
    if (!isFinite(a.n)) a = nCual(T(ctx, 'medir.plan_muestreo_cualitativo'));
    let b = nCuan(T(ctx, 'medir.tamano_muestra_cuantitativo'));
    if (!isFinite(b.n)) b = nCuan(T(ctx, 'medir.plan_muestreo_cuantitativo'));
    const plan = [];
    RS(T(ctx, 'medir.plan_recoleccion'), 'rows').forEach(r => {
      const v = num(r.tamano);
      if (v > 0) plan.push({ medicion: tx(r.medicion) || 'medición sin nombre', n: v });
    });
    const insp = sum(RS(T(ctx, 'medir.dpmo'), 'rows'), 'units') +
                 sum(RS(T(ctx, 'medir.ppm'), 'rows'), 'units');
    return { cual: a, cuan: b, plan: plan, inspeccionadas: insp };
  }
  /** compara la muestra planificada / recolectada contra la calculada */
  function msgMuestra(ctx){
    const out = [], m = muestraStats(ctx);
    const nCal = isFinite(m.cual.n) ? m.cual.n : (isFinite(m.cuan.n) ? m.cuan.n : NaN);
    if (!isFinite(nCal)) return out;
    const esCual = isFinite(m.cual.n);
    m.plan.forEach(x => {
      if (x.n < nCal){
        let extra = '';
        if (esCual && isFinite(m.cual.z)){
          const eReal = m.cual.z * Math.sqrt(m.cual.p * (1 - m.cual.p) / x.n);
          if (isFinite(eReal))
            extra = ' Con n = ' + n0(x.n) + ' el margen de error real sube de ± ' + p1(m.cual.e) +
                    ' a ± ' + p1(eReal) + '.';
        } else if (isFinite(m.cuan.z) && m.cuan.s > 0){
          const eReal = m.cuan.z * m.cuan.s / Math.sqrt(x.n);
          if (isFinite(eReal))
            extra = ' Con n = ' + n0(x.n) + ' el margen de error real sube de ± ' + n2(m.cuan.e) +
                    ' a ± ' + n2(eReal) + ' unidades.';
        }
        out.push(ALTA('MUESTRA INSUFICIENTE en «' + corta(x.medicion, 34) + '»: se planificaron ' + n0(x.n) +
          ' unidades y la muestra CALCULADA es ' + n0(nCal) + ' (faltan ' + n0(nCal - x.n) + ').' + extra +
          ' Con una muestra menor las conclusiones de MEDIR no son defendibles.'));
      } else {
        out.push(BIEN('La medición «' + corta(x.medicion, 34) + '» planifica ' + n0(x.n) +
          ' unidades, por encima de la muestra calculada (' + n0(nCal) + '): el dato será representativo.'));
      }
    });
    if (m.inspeccionadas > 0 && m.inspeccionadas < nCal)
      out.push(AVISO('Las unidades realmente inspeccionadas en DPMO/PPM suman ' + n0(m.inspeccionadas) +
        ', por debajo de la muestra calculada (' + n0(nCal) + '): faltan ' + n0(nCal - m.inspeccionadas) +
        ' unidades para cerrar el plan de recolección.'));
    return out;
  }

  REGLAS['medir.tamano_muestra_cualitativos'] = function(d, ctx){
    const out = [];
    const z = zConf(d.conf), p = prop(d.p), e = prop(d.err), N = num(d.pobN);
    if (!isFinite(z) || !(e > 0) || !(p >= 0 && p <= 1))
      return [FALTA('Faltan datos para calcular el tamaño de muestra. Escribe p (proporción esperada; usa 0,5 si no la conoces), 1-α (nivel de confianza, típico 0,95) y E (margen de error, ej. 0,05).')];
    const nd = safeDiv(z * z * p * (1 - p), e * e);
    const nc = safeDiv(N * z * z * p * (1 - p), (N - 1) * e * e + z * z * p * (1 - p));
    const n  = N > 0 ? nc : nd;
    out.push(INFO('Con Z = ' + n3(z) + ' (confianza ' + p0(prop(d.conf)) + '), p = ' + n2(p) + ' y E = ± ' +
      p1(e) + ' la muestra es ' + n0(Math.ceil(n)) + ' unidades' +
      (N > 0 ? ' (población conocida N = ' + n0(N) + '; con población desconocida serían ' + n0(Math.ceil(nd)) + ')' : ' (población desconocida)') + '.'));
    if (N > 0 && safeDiv(n, N) > 0.10)
      out.push(AVISO('La muestra (' + n0(Math.ceil(n)) + ') es el ' + p0(safeDiv(n, N)) + ' de la población (' +
        n0(N) + '): por encima del 10 % conviene censar el 100 % o ampliar el margen de error.'));
    if (e > 0.10)
      out.push(AVISO('El margen de error es ± ' + p1(e) + ': por encima de ± 10 % el resultado no permite decidir. Bajarlo a ± 5 % multiplica por 4 el tamaño de muestra (de ' +
        n0(Math.ceil(nd)) + ' a ' + n0(Math.ceil(safeDiv(z * z * p * (1 - p), 0.05 * 0.05))) + ').'));
    if (Math.abs(p - 0.5) < 1e-9)
      out.push(INFO('Con p = 0,5 estás usando el escenario más exigente (la muestra más grande posible): es correcto cuando no se conoce la proporción real.'));
    return out.concat(msgMuestra(ctx));
  };

  REGLAS['medir.tamano_muestra_cuantitativo'] = function(d, ctx){
    const out = [];
    const z = zConf(d.conf), s = num(d.sigma), e = num(d.err), N = num(d.pobN);
    if (!isFinite(z) || !(e > 0) || !(s > 0))
      return [FALTA('Faltan datos para calcular el tamaño de muestra. Escribe σ (desviación estándar de un piloto de 20-30 datos), 1-α (confianza, típico 0,95) y E (margen de error en las unidades del dato).')];
    const nd = safeDiv(z * z * s * s, e * e);
    const nc = safeDiv(N * z * z * s * s, (N - 1) * e * e + z * z * s * s);
    const n  = N > 0 ? nc : nd;
    out.push(INFO('Con Z = ' + n3(z) + ' (confianza ' + p0(prop(d.conf)) + '), σ = ' + n2(s) + ' y E = ± ' +
      n2(e) + ' la muestra es ' + n0(Math.ceil(n)) + ' datos' +
      (N > 0 ? ' (población conocida N = ' + n0(N) + ')' : ' (población desconocida)') + '.'));
    if (safeDiv(e, s) < 0.25)
      out.push(AVISO('El margen de error (± ' + n2(e) + ') es apenas el ' + p0(safeDiv(e, s)) +
        ' de la desviación estándar (' + n2(s) + '): por eso la muestra sale en ' + n0(Math.ceil(n)) +
        ' datos. Antes de bajar la confianza, revisa si E puede ampliarse: va al cuadrado en la fórmula.'));
    const b = baseDefinir(ctx);
    if (b.n > 2){
      const sdReal = stdev(b.valores);
      if (isFinite(sdReal) && s > 0 && Math.abs(safeDiv(sdReal - s, s)) > 0.30)
        out.push(AVISO('La desviación estándar real de la línea base de DEFINIR es ' + n2(sdReal) +
          ' y aquí estás usando σ = ' + n2(s) + ' (' + p0(Math.abs(safeDiv(sdReal - s, s))) +
          ' de diferencia): recalcula con el dato medido, no con el estimado.'));
    }
    return out.concat(msgMuestra(ctx));
  };

  REGLAS['medir.plan_muestreo_cualitativo'] = function(d, ctx){
    const out = [];
    if (!tx(d.cuenta) && !tx(d.caracteristica))
      return [FALTA('Plan de muestreo cualitativo vacío. Define QUÉ se va a contar, cuál es la característica que hace «no conforme» a una unidad y la estrategia de muestreo.')].concat(msgMuestra(ctx));
    if (!tx(d.estrategia))
      out.push(AVISO('Falta la ESTRATEGIA DE MUESTREO: sin ella el muestreo termina siendo «lo que había a la mano», que es la principal fuente de sesgo. Define si es aleatoria, sistemática (1 de cada k) o estratificada por sede, turno o profesional.'));
    if (!tx(d.frecuencia))
      out.push(AVISO('Falta la FRECUENCIA DE MUESTREO: sin ella no se puede planear la recolección ni estimar cuándo estará la línea base.'));
    return out.concat(msgMuestra(ctx));
  };
  REGLAS['medir.plan_muestreo_cuantitativo'] = REGLAS['medir.plan_muestreo_cualitativo'];

  REGLAS['medir.plan_recoleccion'] = function(d, ctx){
    const out = [];
    const rows = fl(RS(d, 'rows'), 'medicion');
    if (!rows.length)
      return [FALTA('Plan de recolección vacío. Una fila por medición con su definición operacional, tamaño de muestra, fuente, método y responsable: sin esto los datos de MEDIR no serán comparables.')];
    const sinDef  = rows.filter(r => !tx(r.definicion)).length;
    const sinTam  = rows.filter(r => !tx(r.tamano)).length;
    const sinQuien = rows.filter(r => !tx(r.quien)).length;
    out.push(INFO(n0(rows.length) + ' medición(es) planificadas.'));
    if (sinDef)
      out.push(ALTA(n0(sinDef) + ' de ' + n0(rows.length) + ' medición(es) sin DEFINICIÓN OPERACIONAL (' +
        p0(safeDiv(sinDef, rows.length)) + '): si dos personas no obtienen el mismo dato, el dato no sirve.'));
    if (sinTam)
      out.push(AVISO(n0(sinTam) + ' medición(es) sin TAMAÑO DE MUESTRA: tómalo de las hojas de tamaño de muestra cualitativo o cuantitativo.'));
    if (sinQuien)
      out.push(AVISO(n0(sinQuien) + ' medición(es) sin responsable de recolectar: sin dueño el dato no llega.'));
    if (!tx(d.utilizacion))
      out.push(FALTA('Falta declarar la UTILIZACIÓN DE DATOS: qué decisión se toma con cada medición. Si no hay decisión asociada, no midas.'));
    return out.concat(msgMuestra(ctx));
  };

  REGLAS['medir.metricos_desempeno'] = function(d, ctx){
    const out = [];
    const met = String(d.metricos || '').split('\n').filter(s => s.trim() !== '');
    if (!met.length && !tx(d.proceso))
      return [FALTA('Sin proceso ni métricos descritos. Lista los métricos con nombre, unidad, fórmula y frecuencia: son los que después se controlan en CONTROLAR.')];
    if (!met.length)
      out.push(AVISO('El proceso está descrito pero no hay métricos: sin métrico no hay línea base ni forma de probar la mejora.'));
    else {
      out.push(INFO(n0(met.length) + ' métrico(s) declarados. Verifica que cubran las 4 familias: calidad (defectos), tiempo (ciclo/entrega), costo y satisfacción del afiliado.'));
      const conNum = met.filter(x => /\d/.test(x)).length;
      if (!conNum)
        out.push(AVISO('Ningún métrico incluye cifras ni unidades. Un métrico sin unidad ni fórmula no se puede recolectar de forma consistente.'));
    }
    const av = avisoSinDefinir(ctx); if (av) out.push(av);
    return out;
  };

  /* ---------------------------------------------------------------------
     4.3 · ANALIZAR
     ------------------------------------------------------------------- */

  /* aviso de coherencia: analizar sin línea base */
  function avisoSinBaseline(ctx){
    const b = hayBaseline(ctx);
    if (b.ok) return null;
    return ALTA('No hay línea base cuantificada en el proyecto (ni serie de tiempo, ni DPMO/PPM, ni métricos clave con Baseline). ANALIZAR sin dato de partida produce opiniones, no causas: vuelve a MEDIR antes de seguir.');
  }
  /** Foco del Pareto, para orientar el análisis de causas */
  function msgFocoPareto(ctx){
    const P = paretoCtx(ctx);
    if (!P || !P.vitales.length) return null;
    return META('Foco heredado del Pareto de DEFINIR: ' + n0(P.vitales.length) + ' categoría(s) concentran el ' +
      p1(P.acum) + ' de los ' + n0(P.total) + ' casos (' + lista(P.vitales.map(x => x.cat), 3) +
      '). El análisis de causas debe apuntar ahí, no a todo el proceso.');
  }

  /* Brainstorming --------------------------------------------------------- */
  REGLAS['analizar.brainstorming'] = function(d, ctx){
    const out = [];
    const ideas = fl(RS(d, 'ideas'), 'idea');
    if (!ideas.length)
      return [FALTA('Lluvia de ideas vacía. Genera con el equipo TODAS las causas posibles del problema (sin filtrar) y agrúpalas por afinidad: esas categorías se convierten en las espinas del Ishikawa.')]
        .concat([avisoSinBaseline(ctx)].filter(Boolean));
    out.push(INFO(n0(ideas.length) + ' idea(s)/causa(s) registradas.' +
      (ideas.length < 15 ? ' Para un problema real se esperan 20 o más: la regla de la lluvia de ideas es cantidad primero, calidad después.' : '')));
    const sinCat = ideas.filter(r => !tx(r.cat)).length;
    if (sinCat)
      out.push(AVISO(n0(sinCat) + ' de ' + n0(ideas.length) + ' idea(s) sin categoría de afinidad (' +
        p0(safeDiv(sinCat, ideas.length)) + '): quedan fuera del diagrama de afinidad y no llegan al Ishikawa.'));
    const conVoto = ideas.filter(r => num(r.votos) > 0);
    if (conVoto.length){
      const top = conVoto.slice().sort((a, b) => num(b.votos) - num(a.votos))[0];
      out.push(META('La idea más votada es «' + corta(top.idea, 40) + '» con ' + n0(top.votos) +
        ' voto(s). El voto del equipo prioriza qué se verifica primero, pero NO valida la causa: eso lo hace el dato.'));
    } else {
      out.push(IDEA('Ninguna idea tiene votos. Prioriza con el equipo (multivotación) para decidir cuáles causas se verifican primero con datos.'));
    }
    const fp = msgFocoPareto(ctx); if (fp) out.push(fp);
    const ab = avisoSinBaseline(ctx); if (ab) out.push(ab);
    return out;
  };

  /* Ishikawa -------------------------------------------------------------- */
  REGLAS['analizar.diagramas_ishikawa'] = function(d, ctx){
    const out = [];
    const M6 = [['m1', 'Mediciones'], ['m2', 'Materiales'], ['m3', 'Mano de Obra'],
                ['m4', 'Medio Ambiente'], ['m5', 'Métodos'], ['m6', 'Maquinaria']];
    const P4 = [['p1', 'Politicas'], ['p2', 'Personal'], ['p3', 'Procedimientos'], ['p4', 'Instalaciones']];
    const nombre = x => tx(d[x[0]]) || x[1];
    const espinas = M6.concat(P4).map(nombre);
    const causas = RS(d, 'causas').filter(r => tx(r.causa) || tx(r.subcausa));
    if (!causas.length)
      return [FALTA('El Ishikawa no tiene causas. Reparte las ideas del Brainstorming en las espinas (una causa por renglón) y por cada una pregunta «¿por qué ocurre?» para llegar a la SUBCAUSA de nivel 2.')]
        .concat([msgFocoPareto(ctx), avisoSinBaseline(ctx)].filter(Boolean));

    if (!tx(d.problema1) && !tx(d.problema2))
      out.push(ALTA('Falta el PROBLEMA en la cabeza del pescado. Sin efecto declarado (con dato, lugar y periodo) el diagrama recoge causas de cualquier cosa.'));

    const cuenta = {};
    espinas.forEach(e => { cuenta[e.toUpperCase()] = 0; });
    causas.forEach(r => {
      const k = tx(r.espina).toUpperCase();
      if (cuenta[k] !== undefined) cuenta[k]++;
    });
    const conCausas = espinas.filter(e => cuenta[e.toUpperCase()] > 0);
    const vacias    = espinas.filter(e => !cuenta[e.toUpperCase()]);
    const ord = conCausas.slice().sort((a, b) => cuenta[b.toUpperCase()] - cuenta[a.toUpperCase()]);

    if (ord.length){
      const top = ord[0], v = cuenta[top.toUpperCase()];
      out.push(META('FOCO DEL ANÁLISIS: la espina «' + top + '» concentra ' + n0(v) + ' de ' + n0(causas.length) +
        ' causas (' + p1(safeDiv(v, causas.length)) + '). Empieza por ahí la verificación con datos: es donde el equipo ve más mecanismos de falla.'));
      if (ord.length > 1)
        out.push(INFO('Distribución por espina: ' +
          lista(ord.slice(0, 5).map(e => e + ' ' + n0(cuenta[e.toUpperCase()])), 5) + '.'));
    }
    if (vacias.length)
      out.push(AVISO(n0(vacias.length) + ' espina(s) SIN causas: ' + lista(vacias, 10) +
        '. Una espina vacía suele ser un punto ciego del equipo, no un área sin problemas: revísala explícitamente antes de cerrar el diagrama.'));

    const subs = causas.filter(r => tx(r.subcausa)).length;
    if (!subs)
      out.push(ALTA('No hay ninguna SUBCAUSA de nivel 2: el análisis se quedó en síntomas. Por cada causa pregunta «¿por qué ocurre?» al menos una vez más — ahí es donde aparece la causa raíz accionable.'));
    else
      out.push(BIEN(n0(subs) + ' de ' + n0(causas.length) + ' causa(s) tienen subcausa de nivel 2 (' +
        p0(safeDiv(subs, causas.length)) + '): el análisis está bajando de nivel.'));

    const conEvid = causas.filter(r => tx(r.obs)).length;
    if (!conEvid)
      out.push(AVISO('Ninguna causa tiene EVIDENCIA / OBSERVACIONES. El Ishikawa muestra causas POSIBLES: ninguna pasa a MEJORAR sin verificarse en «Validacion de causas».'));

    const v = causasValidadas(ctx);
    if (causas.length && !v.total)
      out.push(IDEA('Hay ' + n0(causas.length) + ' causa(s) posibles y el plan de verificación está vacío: usa el botón «⤵ Causas del Ishikawa» de la hoja «Validacion de causas» para traerlas sin volver a escribirlas.'));
    const fp = msgFocoPareto(ctx); if (fp) out.push(fp);
    const ab = avisoSinBaseline(ctx); if (ab) out.push(ab);
    return out;
  };

  /* 5 Why´s --------------------------------------------------------------- */
  REGLAS['analizar.5_whys'] = function(d, ctx){
    const out = [];
    const bloques = [['w1', 'ANÁLISIS 1'], ['w2', 'ANÁLISIS 2']];
    let algo = false;
    bloques.forEach(function(b){
      const pfx = b[0], nom = b[1];
      const steps = [1, 2, 3, 4, 5].map(i => ({
        n: i, why: tx(d[pfx + '_why' + i]), nec: tx(d[pfx + '_nec' + i]).toUpperCase(),
        how: tx(d[pfx + '_how' + i])
      }));
      const usados = steps.filter(s => s.why);
      const problema = tx(d[pfx + '_problema']);
      const raiz = tx(d[pfx + '_raiz']);
      if (!usados.length && !problema && !raiz) return;
      algo = true;
      if (!problema)
        out.push(AVISO(nom + ': falta el PROBLEM de partida. La cadena de porqués debe arrancar de un problema concreto y medido, no de una opinión.'));
      if (usados.length < 5)
        out.push(AVISO(nom + ': la cadena tiene ' + n0(usados.length) + ' de 5 niveles' +
          (usados.length ? ' (falta(n) el Why ' + steps.filter(s => !s.why).map(s => s.n).join(', ') + ')' : '') +
          '. Con menos de 5 porqués casi siempre se llega a un síntoma, no a la causa raíz: sigue preguntando hasta algo sobre lo que el equipo pueda actuar.'));
      else
        out.push(BIEN(nom + ': cadena completa de 5 niveles.'));
      const pend = usados.filter(s => s.nec === 'SI' && !s.how);
      if (pend.length)
        out.push(ALTA(nom + ': ' + n0(pend.length) + ' porqué(s) marcados «Is confirmation necessary? = SI» SIN indicar cómo se confirman (Why ' +
          pend.map(s => s.n).join(', ') + '). Una hipótesis sin dato que la confirme no sostiene una causa raíz.'));
      const confirm = usados.filter(s => s.nec === 'SI' && s.how).length;
      const sinMarca = usados.filter(s => !s.nec).length;
      if (sinMarca)
        out.push(AVISO(nom + ': ' + n0(sinMarca) + ' porqué(s) sin responder «Is confirmation necessary?». Decide para cada nivel si es hecho comprobado o hipótesis.'));
      if (confirm)
        out.push(BIEN(nom + ': ' + n0(confirm) + ' porqué(s) confirmados con evidencia declarada.'));
      if (!raiz)
        out.push(AVISO(nom + ': falta la Root Cause (CAUSA RAIZ). Escríbela sólo cuando sea accionable por el equipo y esté confirmada con datos.'));
      const ultimo = usados.length ? usados[usados.length - 1].why : '';
      if (ultimo && /\b(no cumpl|falta de (compromiso|interés|interes|cultura)|descuido|no le importa|negligen|la gente no)\b/i.test(ultimo))
        out.push(ALTA(nom + ': el último porqué («' + corta(ultimo, 44) + '») culpa a las personas. La cadena está incompleta: pregunta por qué el PROCESO permite que eso ocurra — ahí está la causa accionable.'));
    });
    if (!algo)
      return [FALTA('Los dos análisis de 5 Why´s están vacíos. Parte de un problema medido y pregunta «¿por qué?» cinco veces; marca cuáles porqués son hipótesis y con qué dato se confirman.')]
        .concat([avisoSinBaseline(ctx)].filter(Boolean));
    const ab = avisoSinBaseline(ctx); if (ab) out.push(ab);
    return out;
  };

  /* Tree diagram ---------------------------------------------------------- */
  REGLAS['analizar.tree_diagram'] = function(d){
    const out = [];
    const nodos = fl(RS(d, 'nodos'), 'texto');
    if (!nodos.length)
      return [FALTA('El árbol está vacío. Descompón el problema por niveles (NIVEL 1, 2, 3…) y marca como ROOT CAUSE las ramas donde el equipo puede actuar.')];
    const raices = nodos.filter(r => tx(r.tipo).toUpperCase() === 'ROOT CAUSE');
    const niv = Math.max.apply(null, [0].concat(nodos.map(r => num(r.nivel) || 1)));
    out.push(INFO(n0(nodos.length) + ' nodo(s) en ' + n0(niv) + ' nivel(es) de profundidad.'));
    if (niv < 3)
      out.push(AVISO('El árbol sólo baja ' + n0(niv) + ' nivel(es): con menos de 3 se queda en la descripción del problema. Sigue descomponiendo hasta llegar a algo verificable.'));
    if (!raices.length)
      out.push(ALTA('Ningún nodo está marcado como ROOT CAUSE: el árbol no concluye. Marca las ramas terminales sobre las que el equipo puede actuar.'));
    else
      out.push(BIEN(n0(raices.length) + ' nodo(s) marcados como ROOT CAUSE: ' +
        lista(raices.slice(0, 3).map(r => '«' + corta(r.texto, 30) + '»'), 3) +
        '. Llévalos al plan de verificación de causas.'));
    if (!tx(d.problema))
      out.push(AVISO('Falta el enunciado del problema en la raíz del árbol.'));
    return out;
  };

  /* Validación de causas -------------------------------------------------- */
  REGLAS['analizar.validacion_de_causas'] = function(d, ctx){
    const out = [];
    const rows = fl(RS(d, 'rows'), 'causa');
    const sols = solucionesDe(ctx);
    const plan = planAccionDe(ctx);
    if (!rows.length){
      out.push(FALTA('El plan de verificación de causas está vacío. Trae las causas con los botones «⤵ Causas del Ishikawa» y «⤵ Causas de los 5 Why´s» y define, para cada una, con qué dato se confirma o se descarta.'));
      if (sols.rows.length || plan.n)
        out.push(ALTA('ATENCIÓN: ya hay ' + n0(sols.rows.length) + ' solución(es) evaluadas y ' + n0(plan.n) +
          ' acción(es) en MEJORAR, pero NINGUNA causa validada. Se está invirtiendo en soluciones contra causas no probadas: es la forma más cara de equivocarse. Regresa y valida con datos.'));
      return out;
    }
    const ok  = rows.filter(r => num(r.check) === 1);
    const enc = rows.filter(r => num(r.check) !== 1 && tx(r.accion));
    const sin = rows.filter(r => num(r.check) !== 1 && !tx(r.accion));
    const pct = safeDiv(ok.length, rows.length);
    out.push(MSG(ok.length ? (pct >= 0.6 ? '✅' : '⚠️') : '⛔',
      'VERIFICACIÓN: ' + n0(ok.length) + ' de ' + n0(rows.length) + ' causa(s) confirmadas con datos (CHECK = 1) → ' +
      p0(pct) + '. ' + n0(enc.length) + ' en verificación y ' + n0(sin.length) + ' sin plan.',
      ok.length ? (pct >= 0.6 ? 'ok' : 'media') : 'alta'));
    if (ok.length)
      out.push(META('Causas VALIDADAS que pasan a MEJORAR: ' +
        lista(ok.slice(0, 4).map(r => '«' + corta(r.causa, 34) + '»'), 4) +
        (ok.length > 4 ? ' y ' + n0(ok.length - 4) + ' más' : '') + '. Sobre las demás no se invierte tiempo ni dinero.'));
    if (sin.length)
      out.push(AVISO(n0(sin.length) + ' causa(s) SIN acción de verificación definida: no se están probando ni descartando, sólo ocupando la lista.'));
    const sinResp = rows.filter(r => num(r.check) !== 1 && !tx(r.responsable)).length;
    if (sinResp)
      out.push(AVISO(n0(sinResp) + ' verificación(es) pendientes SIN responsable: una verificación sin dueño no se hace.'));
    const sinFecha = rows.filter(r => num(r.check) !== 1 && !tx(r.fecha)).length;
    if (sinFecha)
      out.push(AVISO(n0(sinFecha) + ' verificación(es) pendientes SIN fecha de validación.'));
    const venc = rows.filter(r => num(r.check) !== 1 && tx(r.fecha) && dDiff(r.fecha, hoy()) > 0);
    if (venc.length)
      out.push(ALTA(n0(venc.length) + ' verificación(es) VENCIDA(S) (fecha pasada y sin CHECK = 1): ' +
        lista(venc.slice(0, 3).map(r => '«' + corta(r.causa, 26) + '» ' + n0(dDiff(r.fecha, hoy())) + ' día(s)'), 3) + '.'));
    if (!ok.length && (sols.rows.length || plan.n))
      out.push(ALTA('NINGUNA causa está validada y en MEJORAR ya hay ' + n0(sols.rows.length) + ' solución(es) y ' +
        n0(plan.n) + ' acción(es). Sin causa raíz probada las soluciones atacan síntomas: el problema regresa apenas se suelta el seguimiento.'));
    if (pct < 0.6 && rows.length >= 3)
      out.push(AVISO('Sólo el ' + p0(pct) + ' de las causas está verificado. Se recomienda cerrar al menos el 60 % antes de abrir MEJORAR: es lo que separa un DMAIC de un plan de buenas intenciones.'));
    return out;
  };

  /* Descripción de la causa raíz ------------------------------------------ */
  REGLAS['analizar.descripcion_causa_raiz'] = function(d, ctx){
    const out = [];
    const v = causasValidadas(ctx);
    const dec = [d.causa1, d.causa2].map(tx).filter(x => x);
    const des = [tx(d.causa1) && tx(d.desc1), tx(d.causa2) && tx(d.desc2)].filter(Boolean).length;
    if (!dec.length){
      out.push(ALTA('No hay ninguna CAUSA RAIZ declarada. Sin causa raíz no se puede abrir MEJORAR: las soluciones se diseñan contra la causa, no contra el síntoma.'));
      if (v.validadas)
        out.push(IDEA('Ya hay ' + n0(v.validadas) + ' causa(s) con CHECK = 1 en el plan de verificación: ' +
          lista(v.nombres.slice(0, 3).map(x => '«' + corta(x, 30) + '»'), 3) + '. Escríbelas aquí con su descripción.'));
      return out;
    }
    out.push(BIEN(n0(dec.length) + ' causa(s) raíz declaradas' + (des < dec.length ? ' pero sólo ' + n0(des) + ' con DESCRIPCIÓN del mecanismo.' : ', todas con descripción del mecanismo.')));
    if (des < dec.length)
      out.push(AVISO('Falta explicar CÓMO la causa produce el efecto y con qué evidencia quedó probada: sin mecanismo, la causa raíz es una afirmación.'));
    if (!v.validadas)
      out.push(ALTA('Las causas raíz están declaradas pero NINGUNA tiene CHECK = 1 en «Validacion de causas»: la causa raíz se sustenta con un dato, no con el consenso del equipo.'));
    else {
      const fuera = dec.filter(c => !v.nombres.some(x => x.toUpperCase().indexOf(c.toUpperCase().slice(0, 18)) >= 0 ||
                                                          c.toUpperCase().indexOf(x.toUpperCase().slice(0, 18)) >= 0));
      if (fuera.length)
        out.push(AVISO(n0(fuera.length) + ' causa(s) raíz declaradas no coinciden con ninguna de las ' + n0(v.validadas) +
          ' causas verificadas (CHECK = 1). Verifica que la causa que vas a atacar sea exactamente la que se probó con datos.'));
      else
        out.push(BIEN('Las causas raíz declaradas corresponden a causas verificadas con datos: la fase ANALIZAR está cerrada correctamente.'));
    }
    if (!tx(d.conclusion))
      out.push(FALTA('Falta la CONCLUSION DEL ANALISIS: es el puente hacia MEJORAR, donde se dice qué se va a intervenir. Cada causa raíz debe originar al menos una solución.'));
    return out;
  };

  /* ---------------------------------------------------------------------
     4.4 · MEJORAR
     ------------------------------------------------------------------- */

  /* aviso de coherencia: mejorar sin causa raíz validada */
  function avisoSinCausa(ctx){
    const v = causasValidadas(ctx);
    if (v.validadas || v.declaradas.length) return null;
    return ALTA('No hay ninguna causa raíz validada en ANALIZAR (0 causas con CHECK = 1 y 0 causas raíz declaradas). Toda solución diseñada aquí es una apuesta: vuelve a ANALIZAR y prueba la causa con datos antes de invertir.');
  }

  REGLAS['mejorar.brainstorming'] = function(d, ctx){
    const out = [];
    const ideas = fl(RS(d, 'rows'), 'idea');
    const v = causasValidadas(ctx);
    if (!ideas.length){
      out.push(FALTA('Lluvia de ideas de SOLUCIONES vacía. Trae las causas raíz de ANALIZAR y genera al menos 2 o 3 soluciones por causa antes de calificar.'));
      const a = avisoSinCausa(ctx); if (a) out.push(a);
      return out;
    }
    out.push(INFO(n0(ideas.length) + ' solución(es) candidatas generadas.'));
    if (v.validadas || v.declaradas.length){
      const nCausas = v.declaradas.length || v.validadas;
      out.push(INFO('Hay ' + n0(nCausas) + ' causa(s) raíz para atacar y ' + n0(ideas.length) +
        ' idea(s): ' + n1(safeDiv(ideas.length, nCausas)) + ' solución(es) por causa. Se recomiendan al menos 3 por causa para poder elegir.'));
    }
    const a = avisoSinCausa(ctx); if (a) out.push(a);
    return out;
  };

  /* Selección de soluciones ------------------------------------------------ */
  REGLAS['mejorar.seleccion_soluciones'] = function(d, ctx){
    const out = [];
    const S = solucionesDe(ctx);
    if (!S.rows.length){
      out.push(FALTA('No hay soluciones para evaluar. Escribe las candidatas (POTENTIAL SOLUTIONS) con su método práctico y califícalas de 1 a 5 en EFFORT (invertido: 5 = menor esfuerzo), BENEFIT, FEASIBILITY y COST-BENEFIT.'));
      const a = avisoSinCausa(ctx); if (a) out.push(a);
      return out;
    }
    const top = S.ord[0], mx = overallSol(top);
    if (mx > 0){
      const seg = S.ord[1] ? overallSol(S.ord[1]) : 0;
      out.push(GANA('RANKING · 1º «' + corta(top.sol, 38) + '» con OVERALL ' + n0(mx) + ' de 625 posibles (' +
        p0(safeDiv(mx, 625)) + ' del máximo)' +
        (seg > 0 ? ' · 2º «' + corta(S.ord[1].sol, 28) + '» ' + n0(seg) : '') +
        (S.ord[2] ? ' · 3º «' + corta(S.ord[2].sol, 24) + '» ' + n0(overallSol(S.ord[2])) : '') +
        '. Recuerda que el OVERALL es un PRODUCTO: una sola calificación baja hunde la solución.'));
    } else {
      out.push(ALTA('Las ' + n0(S.rows.length) + ' soluciones están sin calificar: el OVERALL queda en 0 para todas (igual que en el Excel original) y la matriz no prioriza nada.'));
    }
    /* matriz impacto-esfuerzo */
    out.push(INFO('MATRIZ IMPACTO-ESFUERZO (corte en 3): ' + n0(S.qw.length) + ' QUICK WINS · ' +
      n0(S.pm.length) + ' PROYECTOS MAYORES · ' + n0(S.rel.length) + ' RELLENOS · ' + n0(S.ing.length) + ' INGRATOS.'));
    if (S.qw.length)
      out.push(BIEN('EJECUTA PRIMERO los ' + n0(S.qw.length) + ' QUICK WIN(S) — poco esfuerzo y alto beneficio: ' +
        lista(S.qw.slice(0, 3).map(r => '«' + corta(r.sol, 30) + '» (OVERALL ' + n0(overallSol(r)) + ')'), 3) +
        '. Dan resultado visible en semanas y compran credibilidad para el resto del proyecto.'));
    else if (mx > 0)
      out.push(AVISO('No hay ningún QUICK WIN (esfuerzo ≥ 3 y beneficio ≥ 3). Sin victorias tempranas el proyecto pierde patrocinio: busca una versión reducida de la mejor solución que se pueda pilotear en una sede o en un turno.'));
    if (S.pm.length)
      out.push(AVISO('PLANIFICA los ' + n0(S.pm.length) + ' PROYECTO(S) MAYOR(ES) — alto beneficio pero mucho esfuerzo: ' +
        lista(S.pm.slice(0, 3).map(r => '«' + corta(r.sol, 30) + '»'), 3) +
        '. Necesitan presupuesto, cronograma propio y aval del Champion: no los arranques sin recursos asignados.'));
    if (S.ing.length)
      out.push(ALTA('DESCARTA los ' + n0(S.ing.length) + ' INGRATO(S) — mucho esfuerzo y poco beneficio: ' +
        lista(S.ing.slice(0, 3).map(r => '«' + corta(r.sol, 30) + '»'), 3) +
        '. Consumen el equipo sin mover el métrico.'));
    if (S.rel.length)
      out.push(INFO(n0(S.rel.length) + ' RELLENO(S) (fácil pero de poco beneficio): déjalos para cuando sobre capacidad, no ocupan la ruta crítica.'));
    if (S.sinCal.length)
      out.push(AVISO(n0(S.sinCal.length) + ' de ' + n0(S.rows.length) + ' solución(es) sin calificar los 4 criterios: quedan con OVERALL 0 y fuera del ranking.'));
    if (!S.sel.length)
      out.push(ALTA('Ninguna solución está marcada con SOLUTION = Sí. Sin solución elegida no hay Plan de Accion' +
        (mx > 0 ? ': la mejor calificada es «' + corta(top.sol, 34) + '» (OVERALL ' + n0(mx) + ').' : '.')));
    else
      out.push(BIEN(n0(S.sel.length) + ' solución(es) elegidas para implementar: ' +
        lista(S.sel.slice(0, 3).map(r => '«' + corta(r.sol, 30) + '»'), 3) + '. Pasan al Plan de Accion y al A3 Mejorar.'));
    const sinMetodo = S.rows.filter(r => !tx(r.metodo)).length;
    if (sinMetodo)
      out.push(AVISO(n0(sinMetodo) + ' solución(es) sin PRACTICAL METHOD: si no está escrito quién, con qué y en qué punto del proceso, la solución no es implementable.'));
    if (!tx(d.causaRaiz)){
      const v = causasValidadas(ctx);
      out.push(v.validadas || v.declaradas.length
        ? FALTA('El campo VALIDATED ROOT CAUSE está vacío aunque ANALIZAR ya tiene causa raíz (' +
            lista((v.declaradas.length ? v.declaradas : v.nombres).slice(0, 2).map(x => '«' + corta(x, 30) + '»'), 2) +
            '): cópiala aquí para que quede trazable qué causa ataca cada solución.')
        : ALTA('El campo VALIDATED ROOT CAUSE está vacío y no hay causa validada en ANALIZAR: las soluciones no tienen contra qué justificarse.'));
    }
    const a = avisoSinCausa(ctx); if (a) out.push(a);
    return out;
  };

  /* Plan de acción --------------------------------------------------------- */
  REGLAS['mejorar.plan_accion'] = function(d, ctx){
    const out = [];
    const P = planAccionDe(ctx);
    const S = solucionesDe(ctx);
    if (!P.n){
      out.push(FALTA('El plan de acción está vacío. Convierte cada solución elegida en acciones concretas con responsable, fecha de inicio, fecha límite y estatus.'));
      if (S.sel.length)
        out.push(AVISO('Ya hay ' + n0(S.sel.length) + ' solución(es) marcadas SOLUTION = Sí en la matriz de selección (' +
          lista(S.sel.slice(0, 2).map(r => '«' + corta(r.sol, 28) + '»'), 2) + ') y ninguna acción planeada: una solución sin plan no se ejecuta.'));
      const a = avisoSinCausa(ctx); if (a) out.push(a);
      return out;
    }
    out.push(MSG(P.pct >= 0.99 ? '✅' : (P.pct >= 0.5 ? '⚠️' : '⛔'),
      'CUMPLIMIENTO DEL PLAN: ' + n0(P.real) + ' de ' + n0(P.n) + ' acciones REALIZADAS (' + p0(P.pct) + ') · ' +
      n0(P.curso) + ' en curso · ' + n0(P.nore) + ' no realizadas.',
      P.pct >= 0.99 ? 'ok' : (P.pct >= 0.5 ? 'media' : 'alta')));
    if (P.venc.length){
      const ord = P.venc.slice().sort((a, b) => diasVencida(b) - diasVencida(a));
      const maxD = diasVencida(ord[0]);
      out.push(ALTA(n0(P.venc.length) + ' de ' + n0(P.n) + ' acción(es) VENCIDA(S) (' + p0(safeDiv(P.venc.length, P.n)) +
        '), la más atrasada por ' + n0(maxD) + ' día(s): ' +
        lista(ord.slice(0, 3).map(r => '«' + corta(r.accion, 26) + '» ' + n0(diasVencida(r)) + ' día(s)' +
          (tx(r.responsable) ? ' · ' + corta(r.responsable, 18) : ' · SIN RESPONSABLE')), 3) +
        '. Pásalas a RETRASADA y replantéalas en la reunión de equipo: replanear una vez es gestión, tres veces es abandono.'));
    } else {
      out.push(BIEN('No hay acciones vencidas: todas las fechas límite se están cumpliendo.'));
    }
    if (P.sinResp.length)
      out.push(ALTA(n0(P.sinResp.length) + ' de ' + n0(P.n) + ' acción(es) SIN RESPONSABLE (' +
        p0(safeDiv(P.sinResp.length, P.n)) + '): ' +
        lista(P.sinResp.slice(0, 3).map(r => '«' + corta(r.accion, 28) + '»'), 3) +
        '. Sin dueño no es una acción, es un deseo.'));
    if (P.sinFecha.length)
      out.push(ALTA(n0(P.sinFecha.length) + ' de ' + n0(P.n) + ' acción(es) SIN FECHA LIMITE (' +
        p0(safeDiv(P.sinFecha.length, P.n)) + '): no se pueden vencer, así que nunca se cierran.'));
    const sinIni = P.rows.filter(r => !tx(r.inicio)).length;
    if (sinIni)
      out.push(AVISO(n0(sinIni) + ' acción(es) sin FECHA DE INICIO: no aparecen en el cronograma del plan.'));
    const realSinRes = P.rows.filter(r => esRealizada(r) && !tx(r.resultados)).length;
    if (realSinRes)
      out.push(AVISO(n0(realSinRes) + ' acción(es) marcadas REALIZADA sin RESULTADOS escritos: sin evidencia de qué cambió en el métrico no se puede afirmar que la acción sirvió.'));
    const mejoras = fl(P.rows, 'mejora').length;
    if (P.real && !mejoras)
      out.push(AVISO('Ninguna acción declara «MEJORA A CONTROLAR». Sin eso la fase CONTROLAR no sabe qué estandarizar ni qué vigilar: la mejora se pierde en 3 meses.'));
    else if (mejoras)
      out.push(BIEN(n0(mejoras) + ' mejora(s) declaradas «a controlar»: son las que deben aparecer en el Plan de Control y en los estándares de trabajo.'));
    if (S.sel.length && P.n < S.sel.length)
      out.push(AVISO('Hay ' + n0(S.sel.length) + ' solución(es) elegidas y sólo ' + n0(P.n) +
        ' acción(es) en el plan: normalmente cada solución requiere varias acciones. Revisa que ninguna solución elegida haya quedado sin plan.'));
    if (!tx(d.reunionAvances) && P.n)
      out.push(FALTA('No hay bitácora de REUNION DE EQUIPO: sin seguimiento periódico el plan de acción se detiene en la segunda semana.'));
    const a = avisoSinCausa(ctx); if (a) out.push(a);
    return out;
  };

  REGLAS['mejorar.quick_improvement'] = function(d){
    const out = [];
    const fichas = [1, 2, 3].map(n => {
      const p = n === 1 ? '' : ('f' + n + '_');
      return { n: n, antes: tx(d[p + 'antes']), accion: tx(d[p + 'accion']), despues: tx(d[p + 'despues']) };
    }).filter(f => f.antes || f.accion || f.despues);
    if (!fichas.length)
      return [FALTA('No hay ninguna ficha ANTES / ACCION / DESPUES. Documenta las mejoras rápidas: son la evidencia visual del avance y lo que más convence al Champion y a la ARL.')];
    out.push(INFO(n0(fichas.length) + ' ficha(s) de mejora rápida documentadas.'));
    const incompletas = fichas.filter(f => !f.antes || !f.accion || !f.despues);
    if (incompletas.length)
      out.push(AVISO(n0(incompletas.length) + ' ficha(s) incompletas (falta ANTES, ACCION o DESPUES): la ficha sólo demuestra la mejora cuando tiene los tres momentos.'));
    const conNum = fichas.filter(f => numerosDe(f.despues).length).length;
    if (!conNum)
      out.push(AVISO('Ninguna ficha cuantifica el DESPUES. Escribe el resultado medido (minutos, casos, %) — «quedó mejor» no es un resultado.'));
    return out;
  };

  REGLAS['mejorar.descripcion_solucion'] = function(d, ctx){
    const out = [];
    const campos = Object.keys(d || {}).filter(k => k !== '_' && tx(d[k]));
    if (!campos.length)
      return [FALTA('Descripción de la solución vacía. Explica qué se implementó, cómo funciona y qué evidencia hay de que la causa raíz quedó bloqueada.')];
    if (!tx(d.conclusion))
      out.push(FALTA('Falta la CONCLUSION: es el texto que se hereda al A3 final y al informe de cierre para la ARL.'));
    const S = solucionesDe(ctx);
    if (S.sel.length)
      out.push(INFO('Soluciones elegidas en la matriz: ' + lista(S.sel.slice(0, 3).map(r => '«' + corta(r.sol, 30) + '»'), 3) +
        '. Verifica que la descripción cubra todas.'));
    return out;
  };

  /* ---------------------------------------------------------------------
     4.5 · CONTROLAR
     ------------------------------------------------------------------- */

  /* aviso de coherencia: controlar sin mejora implementada */
  function avisoSinMejora(ctx){
    const P = planAccionDe(ctx), S = solucionesDe(ctx);
    if (P.real > 0 || S.sel.length) return null;
    return ALTA('Todavía no hay ninguna solución implementada en MEJORAR (0 acciones REALIZADAS y 0 soluciones marcadas SOLUTION = Sí). Controlar antes de mejorar es estandarizar el problema: cierra MEJORAR primero.');
  }

  /* Gráfico antes / después ------------------------------------------------ */
  REGLAS['controlar.grafico_antes_despues'] = function(d, ctx){
    const out = [];
    const s = adStats(d);
    if (!s.A.length && !s.B.length){
      out.push(FALTA('El gráfico ANTES-DESPUES está vacío. Carga el mismo criterio, con la misma unidad y la misma forma de medir que la línea base de MEDIR: al menos 4-6 periodos de cada lado.'));
      const a = avisoSinMejora(ctx); if (a) out.push(a);
      return out;
    }
    if (!s.A.length || !s.B.length){
      out.push(AVISO('Faltan datos de un lado de la comparación: ' + n0(s.A.length) + ' periodo(s) ANTES y ' +
        n0(s.B.length) + ' DESPUES. Sin ambos lados no hay resultado que reportar.'));
      const a = avisoSinMejora(ctx); if (a) out.push(a);
      return out;
    }
    const dirTxt = s.menorMejor ? 'menor es mejor' : 'mayor es mejor';
    out.push(INFO('Promedio ANTES ' + n2(s.ma) + ' (' + n0(s.A.length) + ' periodos) → promedio DESPUES ' +
      n2(s.mb) + ' (' + n0(s.B.length) + ' periodos). Variación absoluta ' + n2(s.dif) + ' · variación ' +
      p1(s.pct) + ' · criterio «' + dirTxt + '».'));

    /* ¿mejoró? */
    if (isFinite(s.mejora) && s.mejora > 0)
      out.push(BIEN('MEJORA LOGRADA: ' + p1(s.mejora) + ' en la dirección correcta (' + dirTxt + '). ' +
        'Es la cifra que se lleva al A3 final, al cierre del charter y al informe para la ARL.'));
    else if (isFinite(s.mejora) && s.mejora < 0)
      out.push(ALTA('El indicador se movió en dirección CONTRARIA a la esperada: ' + p1(Math.abs(s.mejora)) +
        ' de EMPEORAMIENTO (de ' + n2(s.ma) + ' a ' + n2(s.mb) + '). Revisa si el estándar se está ejecutando, si el plan de control está operando y si la causa raíz era la correcta: puede que la solución haya atacado un síntoma.'));
    else
      out.push(AVISO('No hay variación medible entre el antes y el después (' + n2(s.ma) + ' vs ' + n2(s.mb) +
        '): la solución implementada no movió el métrico. Vuelve a ANALIZAR: la causa atacada no era la causa raíz.'));

    /* contra el objetivo pactado */
    const O = objetivoCuantitativo(ctx);
    if (O && isNum(O.obj)){
      const base = isFinite(O.base) ? O.base : s.ma;
      const metaVar = safeDiv(num(O.obj) - base, Math.abs(base) || 1);
      const metaOrient = s.menorMejor ? -metaVar : metaVar;
      const cumplimiento = safeDiv(s.mejora, metaOrient);
      const falta = num(O.obj) - s.mb;
      if (isFinite(metaOrient) && metaOrient > 0){
        if (isFinite(cumplimiento) && cumplimiento >= 1.10)
          out.push(BIEN('OBJETIVO SUPERADO: la meta pactada era llegar a ' + n2(O.obj) + ' desde ' + n2(base) +
            ' (' + p1(metaOrient) + ' de mejora) y se logró ' + p1(s.mejora) + ' → ' + p0(cumplimiento) +
            ' del objetivo. Fuente de la meta: ' + O.fuente + '. Documenta qué permitió superarla y replícalo.'));
        else if (isFinite(cumplimiento) && cumplimiento >= 1)
          out.push(BIEN('OBJETIVO CUMPLIDO: la meta era ' + n2(O.obj) + ' desde ' + n2(base) + ' (' + p1(metaOrient) +
            ' de mejora); el resultado es ' + n2(s.mb) + ' (' + p1(s.mejora) + ') → ' + p0(cumplimiento) +
            ' del objetivo. Fuente de la meta: ' + O.fuente + '.'));
        else
          out.push(AVISO('QUEDÓ CORTO: la meta era ' + n2(O.obj) + ' desde ' + n2(base) + ' (' + p1(metaOrient) +
            ' de mejora) y se logró ' + n2(s.mb) + ' (' + p1(s.mejora) + ') → ' + p0(cumplimiento) +
            ' del objetivo; faltan ' + n2(Math.abs(falta)) + ' unidades. Fuente de la meta: ' + O.fuente +
            '. Decide con el Champion: cerrar con lo logrado y abrir un segundo ciclo, o extender el plan de acción.'));
      }
    } else {
      out.push(FALTA('No hay objetivo cuantitativo registrado (ni en «Series de tiempo», ni en los Metricos Clave del Charter, ni en la Tabla de identificación): no se puede decir si el resultado cumplió la meta, sólo si cambió.'));
    }

    /* solidez estadística */
    const nMin = Math.min(s.A.length, s.B.length);
    if (nMin < 4)
      out.push(AVISO('Sólo ' + n0(nMin) + ' periodo(s) comparables a cada lado: con menos de 4 el cambio puede ser variación normal del proceso. Agrega puntos antes de declarar la mejora ante la ARL.'));
    if (s.A.length > 1 && s.B.length > 1){
      const sa = stdev(s.A), sb = stdev(s.B);
      if (isFinite(sa) && isFinite(sb)){
        const dif = Math.abs(s.dif), sp = Math.sqrt((sa * sa + sb * sb) / 2);
        if (isFinite(sp) && sp > 0){
          const señal = safeDiv(dif, sp);
          if (señal < 1)
            out.push(AVISO('La diferencia entre los promedios (' + n2(dif) + ') es MENOR que la variación propia del proceso (desviación combinada ' +
              n2(sp) + '): la señal no se distingue del ruido. Confirma con el gráfico de control antes de declarar la mejora.'));
          else
            out.push(BIEN('La diferencia entre promedios (' + n2(dif) + ') es ' + n1(señal) +
              ' veces la desviación combinada (' + n2(sp) + '): el cambio se distingue de la variación normal del proceso.'));
        }
        if (isFinite(sa) && isFinite(sb) && sa > 0){
          const red = safeDiv(sa - sb, sa);
          if (red > 0.15)
            out.push(BIEN('Además del nivel, bajó la VARIABILIDAD: la desviación pasó de ' + n2(sa) + ' a ' + n2(sb) +
              ' (' + p1(red) + ' menos). Un proceso más predecible es tan valioso como uno más rápido.'));
          else if (red < -0.15)
            out.push(AVISO('La VARIABILIDAD aumentó: la desviación pasó de ' + n2(sa) + ' a ' + n2(sb) +
              ' (' + p1(Math.abs(red)) + ' más). Aunque el promedio mejore, el servicio se volvió menos predecible: revísalo en el plan de control.'));
        }
      }
    }
    if (!tx(d.comentarios))
      out.push(FALTA('Faltan los COMENTARIOS: sin contexto (desde cuándo opera la mejora, qué más cambió en el periodo, qué evidencia respalda el dato) el gráfico se presta para discusiones.'));
    const a = avisoSinMejora(ctx); if (a) out.push(a);
    return out;
  };

  /* Plan de control -------------------------------------------------------- */
  REGLAS['controlar.plan_de_control'] = function(d, ctx){
    const out = [];
    const C = planControlDe(ctx);
    const mejoras = fl(RS(T(ctx, 'mejorar.plan_accion'), 'rows'), 'mejora');
    if (!C.n){
      out.push(FALTA('El plan de control está vacío. Una fila por punto de control sobre las X críticas y sobre lo que quedó como «mejora a controlar» en MEJORAR.'));
      if (mejoras.length)
        out.push(ALTA('En MEJORAR quedaron ' + n0(mejoras.length) + ' mejora(s) declaradas «a controlar» (' +
          lista(mejoras.slice(0, 2).map(x => '«' + corta(x, 28) + '»'), 2) +
          ') y no hay ni un punto de control: sin plan de control la mejora se pierde en 3 a 6 meses.'));
      const a = avisoSinMejora(ctx); if (a) out.push(a);
      return out;
    }
    const pc = safeDiv(C.completo, C.n);
    out.push(MSG(C.completo === C.n ? '✅' : (C.completo ? '⚠️' : '⛔'),
      'PLAN DE CONTROL: ' + n0(C.n) + ' punto(s) de control · ' + n0(C.completo) + ' completos (' + p0(pc) +
      ') — se considera completo cuando tiene especificación, técnica de medición, frecuencia, acción correctiva y responsable.',
      C.completo === C.n ? 'ok' : (C.completo ? 'media' : 'alta')));
    const falt = [
      ['metodo', C.n - C.metodo, 'sin MÉTODO DE CONTROL (gráfico de control, checklist, poka-yoke o auditoría): no está definido cómo se registra el dato'],
      ['frecuencia', C.n - C.frecuencia, 'sin FRECUENCIA: «cuando se pueda» no es un plan — sin frecuencia el control no existe'],
      ['responsable', C.n - C.responsable, 'sin RESPONSABLE: lo que es de todos no es de nadie; escribe un cargo, no un área'],
      ['especificaciones', C.n - C.especs, 'sin ESPECIFICACIÓN (LIE / LSE / meta): sin límite no se puede saber cuándo reaccionar'],
      ['acciones', C.n - C.acciones, 'sin ACCIÓN CORRECTIVA: el control sirve para reaccionar, no sólo para observar'],
      ['tecnica', C.n - C.tecnica, 'sin TÉCNICA DE MEDICIÓN: dos personas medirán distinto'],
      ['documento', C.n - C.documento, 'sin DOCUMENTO de registro: sin evidencia el control no es auditable ante la ARL']
    ];
    falt.forEach(function(f){
      if (f[1] > 0)
        out.push(MSG(f[0] === 'frecuencia' || f[0] === 'responsable' ? '⛔' : '⚠️',
          n0(f[1]) + ' de ' + n0(C.n) + ' punto(s) (' + p0(safeDiv(f[1], C.n)) + ') ' + f[2] + '.',
          (f[0] === 'frecuencia' || f[0] === 'responsable') ? 'alta' : 'media'));
    });
    if (C.completo === C.n)
      out.push(BIEN('Los ' + n0(C.n) + ' puntos de control están completos: el proceso queda vigilado con especificación, medición, frecuencia, reacción y dueño.'));
    if (mejoras.length && C.n < mejoras.length)
      out.push(AVISO('Hay ' + n0(mejoras.length) + ' mejora(s) declaradas «a controlar» en MEJORAR y sólo ' + n0(C.n) +
        ' punto(s) de control: revisa que ninguna mejora haya quedado sin vigilancia.'));
    if (!tx(d.aprobado))
      out.push(ALTA('El plan de control NO está APROBADO (pie del formato en blanco): sin aprobación formal no es exigible al proceso ni presentable ante la ARL.'));
    if (!tx(d.actualizacion))
      out.push(FALTA('Falta la fecha de ACTUALIZACION (próxima revisión del plan): un plan de control sin fecha de revisión envejece y se abandona.'));
    const a = avisoSinMejora(ctx); if (a) out.push(a);
    return out;
  };

  /* Estándares de trabajo --------------------------------------------------- */
  function reglaEstandar(claves){
    return function(d, ctx){
      const out = [];
      let n = 0;
      claves.forEach(function(c){ n += fl(RS(d, c[0]), c[1]).length; });
      if (!n)
        return [FALTA('Estándar de trabajo vacío. Documenta los pasos del proceso YA MEJORADO: sin estándar escrito la mejora depende de quién esté de turno.')]
          .concat([avisoSinMejora(ctx)].filter(Boolean));
      out.push(BIEN(n0(n) + ' paso(s)/actividad(es) documentadas en este estándar de trabajo.'));
      if (n < 4)
        out.push(AVISO('Sólo ' + n0(n) + ' paso(s) documentados: un estándar con menos de 4 pasos rara vez alcanza a describir el trabajo real. Verifica que cubra el proceso completo, no sólo el cambio.'));
      const mej = fl(RS(T(ctx, 'mejorar.plan_accion'), 'rows'), 'mejora').length;
      if (mej)
        out.push(INFO('En MEJORAR quedaron ' + n0(mej) + ' mejora(s) «a controlar»: comprueba que todas estén reflejadas en algún estándar o en el plan de control.'));
      const a = avisoSinMejora(ctx); if (a) out.push(a);
      return out;
    };
  }
  REGLAS['controlar.estandar_1'] = reglaEstandar([['pasos', 'paso'], ['pasosDer', 'paso']]);
  REGLAS['controlar.estandar_2'] = reglaEstandar([['rows', 'actividad']]);
  REGLAS['controlar.estandar_3'] = reglaEstandar([['procedimiento', 'paso'], ['herramientas', 'herramienta']]);

  /* Project Charter — cierre ----------------------------------------------- */
  REGLAS['controlar.charter_cierre'] = function(d, ctx){
    const out = [];
    const K = metricosCierre(ctx);
    const s = adCtx(ctx);
    if (!K.pares.length){
      out.push(ALTA('No hay «Metricos Clave» registrados en DEFINIR › Project Charter: sin ellos no hay contra qué comparar el cierre y el proyecto no se puede cerrar formalmente.'));
      return out;
    }
    if (!K.conDato.length){
      out.push(ALTA('Ninguno de los ' + n0(K.pares.length) + ' métricos clave tiene valor LOGRADO. Registra el resultado tomándolo del gráfico ANTES-DESPUES o de la serie de seguimiento, no de una estimación.'));
      if (isFinite(s.mb))
        out.push(IDEA('El promedio DESPUES del gráfico ANTES-DESPUES es ' + n2(s.mb) +
          ': úsalo como valor LOGRADO del métrico principal.'));
      return out;
    }
    out.push(INFO('CIERRE: ' + n0(K.conDato.length) + ' de ' + n0(K.pares.length) + ' métrico(s) con resultado · ' +
      n0(K.mejoran.length) + ' mejoraron · ' + n0(K.cumplen.length) + ' cumplen el objetivo pactado.'));
    K.conDato.slice(0, 5).forEach(function(x){
      const delta = isNum(x.base) ? num(x.logrado) - num(x.base) : NaN;
      const pctv  = isNum(x.base) ? safeDiv(delta, Math.abs(num(x.base)) || 1) : NaN;
      out.push(MSG(x.cumple === true ? '✅' : (x.mejoro === true ? '⚠️' : '⛔'),
        '«' + corta(x.nombre, 34) + '»: base ' + n2(x.base) + ' → logrado ' + n2(x.logrado) +
        (isFinite(delta) ? ' (' + n2(delta) + ' · ' + p1(pctv) + ')' : '') +
        ' · objetivo ' + n2(x.obj) + ' → ' +
        (x.cumple === true ? 'CUMPLE el objetivo.'
         : (x.mejoro === true ? 'mejoró pero NO alcanza el objetivo (faltan ' + n2(Math.abs(num(x.obj) - num(x.logrado))) + ').'
         : 'NO mejoró respecto de la línea base.')),
        x.cumple === true ? 'ok' : (x.mejoro === true ? 'media' : 'alta')));
    });

    const todosMejoran = K.conDato.length && K.mejoran.length === K.conDato.length;
    const todosCumplen = K.conDato.length && K.cumplen.length === K.conDato.length;
    if (todosCumplen)
      out.push(BIEN('DECISIÓN SUGERIDA · CERRAR Y REPLICAR: los ' + n0(K.conDato.length) +
        ' métricos con resultado cumplen el objetivo pactado. Firma el acta de cierre, entrega el proceso a su dueño con el plan de control operando y REPLICA el estándar en las demás sedes o servicios de la ARL. Programa una auditoría de sostenimiento a los 3 y 6 meses.'));
    else if (todosMejoran)
      out.push(AVISO('DECISIÓN SUGERIDA · CERRAR PARCIALMENTE: los ' + n0(K.conDato.length) +
        ' métricos mejoraron pero sólo ' + n0(K.cumplen.length) + ' cumplen el objetivo (' +
        p0(safeDiv(K.cumplen.length, K.conDato.length)) +
        '). Cierra el ciclo documentando lo logrado y abre un segundo ciclo DMAIC para el GAP restante, o renegocia la meta con el Champion con la evidencia en la mano.'));
    else
      out.push(ALTA('DECISIÓN SUGERIDA · VOLVER A ANALIZAR: ' + n0(K.empeoran.length) + ' de ' + n0(K.conDato.length) +
        ' métrico(s) NO mejoraron (' + lista(K.empeoran.slice(0, 3).map(x => '«' + corta(x.nombre, 26) + '»'), 3) +
        '). El proyecto no puede cerrarse: la causa raíz atacada no explica el problema o la solución no se está ejecutando. Revisa el plan de control antes de reabrir el análisis.'));

    const marcados = RS(T(ctx, 'controlar.charter_cierre'), 'metCie').filter(r => /^y/i.test(tx(r.mejoro))).length;
    if (marcados !== K.mejoran.length && K.conDato.length)
      out.push(AVISO('La columna «Mejoró» está marcada Yes en ' + n0(marcados) + ' métrico(s) pero los datos muestran mejora en ' +
        n0(K.mejoran.length) + '. Ajusta la marca al dato: el cierre se audita.'));
    if (K.firmas < 5)
      out.push(ALTA('Faltan ' + n0(5 - K.firmas) + ' firma(s) de cierre (' + n0(K.firmas) +
        '/5). Sin las firmas del Champion, el Dueño del Proceso, Finanzas, el Mentor y el Facilitador el proyecto NO se cierra: queda en seguimiento.'));
    else
      out.push(BIEN('Las 5 firmas de cierre están registradas: el proyecto está formalmente aceptado.'));
    return out;
  };

  /* A3 (todos) -------------------------------------------------------------- */
  function reglaA3(nombre, campos){
    return function(d){
      const out = [];
      const puestos = campos.filter(c => tx(d[c[0]]));
      if (!puestos.length)
        return [FALTA(nombre + ' vacío. Es el resumen de una página que se presenta a la dirección: se escribe al final de la fase, cuando los datos ya están.')];
      if (puestos.length < campos.length)
        out.push(AVISO(nombre + ': ' + n0(puestos.length) + ' de ' + n0(campos.length) + ' recuadros diligenciados (' +
          p0(safeDiv(puestos.length, campos.length)) + '). Faltan: ' +
          lista(campos.filter(c => !tx(d[c[0]])).map(c => c[1]), 6) + '.'));
      else
        out.push(BIEN(nombre + ' completo en sus ' + n0(campos.length) + ' recuadros.'));
      const conNum = puestos.filter(c => numerosDe(d[c[0]]).length).length;
      if (!conNum)
        out.push(AVISO('Ningún recuadro del A3 tiene cifras. Un A3 sin números es un relato: incluye la línea base, la meta y el resultado logrado.'));
      return out;
    };
  }
  REGLAS['definir.a3_definir'] = reglaA3('A3 Definir',
    [['nombre', 'PROJECT NAME'], ['problema', 'PROBLEM STATEMENT AND BUSINESS CASE'],
     ['metricKey', 'METRIC KEY'], ['baseline', 'BASELINE'], ['ideal', 'IDEAL'],
     ['objetivo', 'OBJECTIVE'], ['savings', 'POTENTIAL SAVINGS']]);
  REGLAS['medir.a3_medir'] = reglaA3('A3 Medir',
    [['doc', 'DOCUMENTACION ESTADO ACTUAL DEL PROCESO'], ['grr', 'SISTEMA DE MEDICION GR&R'],
     ['baseline', 'BASE LINE - ESTADO ACTUAL']]);
  REGLAS['analizar.a3_analizar'] = reglaA3('A3 Analizar',
    [['analisis', 'ANALISIS DE LA CAUSA RAIZ'], ['causas', 'CAUSAS POTENCIALES'],
     ['raiz', 'IDENTIFICACION DE LA CAUSA RAIZ DEL PROBLEMA']]);
  REGLAS['mejorar.a3_mejorar'] = reglaA3('A3 Mejorar',
    [['mejoras', 'LISTA DE MEJORAS'], ['tabla', 'TABLA ANTES Y DESPUES - RESULTADOS'],
     ['controlar', 'MEJORA A CONTROLAR']]);
  REGLAS['controlar.a3_controlar'] = reglaA3('A3 Controlar',
    [['control', 'CONTROL - PROCESO'], ['estandarizacion', 'ESTANDARIZACION NUEVO PROCESO'],
     ['beneficios', 'BENEFICIOS']]);

  REGLAS['controlar.a3_final'] = function(d, ctx){
    const out = [];
    const campos = [['definir', 'DEFINIR'], ['medirAnalizar', 'MEDIR + ANALIZAR'],
                    ['mejorar', 'MEJORAR'], ['controlar', 'CONTROLAR']];
    const puestos = campos.filter(c => tx(d[c[0]]));
    if (!puestos.length){
      out.push(FALTA('El A3 final está vacío. Usa el botón «Armar A3 final» para traer automáticamente lo mejor de las 5 fases y luego ajusta la redacción.'));
      return out;
    }
    if (puestos.length < campos.length)
      out.push(AVISO('A3 final con ' + n0(puestos.length) + ' de 4 bloques (' +
        lista(campos.filter(c => !tx(d[c[0]])).map(c => c[1]), 4) + ' pendiente(s)).'));
    else
      out.push(BIEN('A3 final completo en sus 4 bloques (DEFINIR, MEDIR+ANALIZAR, MEJORAR, CONTROLAR).'));
    const s = adCtx(ctx);
    if (isFinite(s.mejora) && !numerosDe(tx(d.controlar)).length)
      out.push(IDEA('El resultado medido es ' + p1(s.mejora) + ' de mejora (de ' + n2(s.ma) + ' a ' + n2(s.mb) +
        ') y el bloque CONTROLAR no lo menciona: esa cifra es la conclusión del A3.'));
    return out;
  };

  /* ======================================================================
     5 · API PÚBLICA
     ==================================================================== */
  function forTool(tool, d, ctx){
    try {
      const id = (tool && tool.id) ? tool.id : String(tool || '');
      if (!id) return [];
      const c  = ctx || { all:{}, proj:null };
      const dd = d || ((c.all && c.all[id]) || {});
      const fn = REGLAS[id];
      let out = [];
      if (fn){
        try { out = arr(fn(dd, c, tool)) || []; }
        catch(e){ console.warn('ENGINE.forTool', id, e); out = []; }
      }
      if (!out.length && !lleno(c, id) && fn === undefined && tool && tool.title)
        out = [FALTA('«' + tool.title + '» está vacía. Diligénciala para que el motor pueda interpretarla y aportar al tablero del proyecto.')];
      return ordenar(out).slice(0, 12);
    } catch(e){ console.warn('ENGINE.forTool', e); return []; }
  }

  /* --------------------------------------------------- avance por fase */
  const MODS = ['DEFINIR', 'MEDIR', 'ANALIZAR', 'MEJORAR', 'CONTROLAR'];
  function avanceFases(ctx){
    const lista = [];
    const todas = (typeof TOOLS !== 'undefined' && Array.isArray(TOOLS)) ? TOOLS : [];
    MODS.forEach(function(m){
      if (!modActivo(ctx, m)) return;
      const ts = todas.filter(t => t.mod === m);
      if (!ts.length) return;
      const ll = ts.filter(t => lleno(ctx, t.id)).length;
      lista.push({ mod: m, n: ts.length, llenas: ll, pct: safeDiv(ll, ts.length) });
    });
    return lista;
  }
  function avanceGlobal(ctx){
    const f = avanceFases(ctx);
    if (!f.length) return 0;
    return f.reduce((a, x) => a + (isFinite(x.pct) ? x.pct : 0), 0) / f.length;
  }

  /* ------------------------------------------------ tablero de calidad */
  /** Chequeos de CALIDAD del proyecto (no de cantidad de campos llenos) */
  function chequeos(ctx){
    const C = [];
    const add = (mod, peso, val, etq) => C.push({ mod: mod, peso: peso, val: clamp(val, 0, 1), etq: etq });

    /* DEFINIR */
    const mp = RS(T(ctx, 'definir.matriz_priorizacion'), 'rows').filter(r => tx(r.proyecto));
    add('DEFINIR', 6, mp.length ? 1 : 0, 'Proyecto priorizado con la matriz');
    const objT = objetivoTexto(ctx);
    const conMeta = objT && numerosDe(objT).length ? 1 : 0;
    const conPlazo = objT && tienePlazo(objT) ? 1 : 0;
    add('DEFINIR', 10, (conMeta * 0.6 + conPlazo * 0.4), 'Objetivo SMART con meta numérica y plazo');
    const ch = T(ctx, 'definir.project_charter');
    const partesCh = [tx(ch.problema) || problemaTexto(ctx), tx(ch.businessCase), objT,
                      tx(ch.scopeIn), tx(ch.scopeOut)].filter(x => tx(x)).length;
    add('DEFINIR', 8, safeDiv(partesCh, 5), 'Project Charter completo');
    const P = paretoCtx(ctx);
    add('DEFINIR', 5, P ? (P.vitales.length && safeDiv(P.vitales.length, P.n) <= 0.5 ? 1 : 0.5) : 0,
        'Pareto con pocos vitales identificados');

    /* MEDIR */
    const B = hayBaseline(ctx);
    const bd = B.def.n, bm = B.med.n;
    add('MEDIR', 12, B.ok ? clamp(safeDiv(Math.max(bd, bm), 15), 0.35, 1) : 0,
        'Línea base cuantificada');
    const dp = B.dpmo, pp = B.ppm;
    const sig = dp.opps > 0 ? sigmaLevel(dp.dpmo) : (pp.units > 0 ? sigmaLevel(pp.ppm) : NaN);
    add('MEDIR', 8, isFinite(sig) ? clamp(sig / 6, 0, 1) : 0, 'Desempeño en nivel sigma');

    /* ANALIZAR */
    const V = causasValidadas(ctx);
    add('ANALIZAR', 14, V.validadas ? clamp(V.pct + 0.3, 0, 1) : 0, 'Causa raíz validada con datos');
    add('ANALIZAR', 4, V.declaradas.length ? 1 : 0, 'Causa raíz declarada y descrita');

    /* MEJORAR */
    const S = solucionesDe(ctx);
    add('MEJORAR', 8, S.sel.length ? 1 : (S.rows.length ? 0.4 : 0), 'Soluciones evaluadas y elegidas');
    const PA = planAccionDe(ctx);
    add('MEJORAR', 10, PA.n ? clamp(PA.pct, 0, 1) * (PA.venc.length ? 0.8 : 1) : 0,
        'Plan de acción ejecutado');

    /* CONTROLAR */
    const PC = planControlDe(ctx);
    add('CONTROLAR', 8, PC.n ? safeDiv(PC.completo, PC.n) : 0, 'Plan de control completo');
    const ad = adCtx(ctx);
    add('CONTROLAR', 12, isFinite(ad.mejora) ? clamp(ad.mejora > 0 ? 0.6 + clamp(ad.mejora, 0, 0.4) : 0, 0, 1) : 0,
        'Resultado ANTES-DESPUES demostrado');
    const K = metricosCierre(ctx);
    add('CONTROLAR', 5, K.conDato.length ? safeDiv(K.cumplen.length, K.conDato.length) : 0,
        'Métricos de cierre que cumplen el objetivo');
    return C.filter(x => modActivo(ctx, x.mod));
  }

  function calidad(ctx){
    const C = chequeos(ctx);
    const den = C.reduce((a, x) => a + x.peso, 0);
    if (!den) return 0;
    return C.reduce((a, x) => a + x.peso * x.val, 0) / den;
  }

  /* ---------------------------------------------- siguiente paso sugerido */
  function recomendarSiguiente(ctx){
    try {
      const c = ctx || { all:{}, proj:null };
      const V  = causasValidadas(c);
      const S  = solucionesDe(c);
      const PA = planAccionDe(c);
      const PC = planControlDe(c);
      const B  = hayBaseline(c);
      const ad = adCtx(c);
      const K  = metricosCierre(c);
      const objT = objetivoTexto(c);
      const P  = paretoCtx(c);

      const pasos = [
        { mod:'DEFINIR', id:'definir.matriz_priorizacion',
          ok: RS(T(c, 'definir.matriz_priorizacion'), 'rows').filter(r => tx(r.proyecto)).length > 0,
          motivo:'Todavía no hay proyectos priorizados. Empieza por la Matriz de Priorización: define cuál problema vale un DMAIC antes de invertir el tiempo del equipo.' },
        { mod:'DEFINIR', id:'definir.clarificacion_problema',
          ok: !!problemaTexto(c),
          motivo:'Falta el enunciado del problema. Diligencia la Clarificación del Problema (5W2H) con datos: qué, dónde, desde cuándo, cuánto y cuál es el GAP.' },
        { mod:'DEFINIR', id:'definir.series_tiempo',
          ok: B.def.n > 0 || B.med.n > 0 || B.dpmo.opps > 0 || B.ppm.units > 0,
          motivo:'No hay línea base. Carga la Serie de Tiempo con al menos 15 puntos: sin línea base no se puede dimensionar el proyecto ni demostrar la mejora al cerrar.' },
        { mod:'DEFINIR', id:'definir.objetivo_smart',
          ok: !!(objT && numerosDe(objT).length && tienePlazo(objT)),
          motivo: objT ? 'El Objetivo SMART está incompleto: le falta meta numérica o plazo. Sin «de cuánto a cuánto y para cuándo» el proyecto no se puede cerrar.'
                       : 'Falta el Objetivo SMART: es lo que convierte el problema en un compromiso medible con fecha.' },
        { mod:'DEFINIR', id:'definir.pareto',
          ok: !!P,
          motivo:'Sin Pareto no sabes dónde está concentrado el problema. Cárgalo: define el alcance del proyecto y evita dispersar el esfuerzo.' },
        { mod:'DEFINIR', id:'definir.project_charter',
          ok: !!tx(T(c, 'definir.project_charter').problema) || !!tx(T(c, 'definir.project_charter').objetivo),
          motivo:'Falta firmar el Project Charter: es el contrato del proyecto y se firma ANTES de pasar a MEDIR.' },
        { mod:'MEDIR', id:'medir.dpmo',
          ok: B.dpmo.opps > 0 || B.ppm.units > 0 || B.med.n > 0,
          motivo:'Falta cuantificar el desempeño actual. Calcula el DPMO (o el PPM) para traducir el problema a nivel sigma y compararlo con el estándar de la industria.' },
        { mod:'MEDIR', id:'medir.valor_add',
          ok: sum(RS(T(c, 'medir.valor_add'), 'rows'), 'tiempo') > 0,
          motivo:'Falta el % de valor agregado. Clasifica las actividades en VA / NVA / NVAR: en procesos administrativos ahí suele estar la mayor oportunidad de tiempo.' },
        { mod:'ANALIZAR', id:'analizar.diagramas_ishikawa',
          ok: RS(T(c, 'analizar.diagramas_ishikawa'), 'causas').filter(r => tx(r.causa) || tx(r.subcausa)).length > 0,
          motivo:'No hay causas identificadas. Arma el Ishikawa con las ideas del Brainstorming y baja a nivel 2 (subcausas) preguntando «¿por qué ocurre?».' },
        { mod:'ANALIZAR', id:'analizar.validacion_de_causas',
          ok: V.validadas > 0,
          motivo: V.total ? 'Hay ' + n0(V.total) + ' causa(s) posibles y ninguna verificada con datos. Cierra el Plan de Verificación de Causas: sólo las que queden con CHECK = 1 pasan a MEJORAR.'
                          : 'Falta validar las causas con datos. Trae las causas del Ishikawa y de los 5 Why´s y define con qué dato se confirma o se descarta cada una.' },
        { mod:'ANALIZAR', id:'analizar.descripcion_causa_raiz',
          ok: V.declaradas.length > 0,
          motivo:'Falta declarar la CAUSA RAIZ y explicar su mecanismo. Es el puente hacia MEJORAR: cada causa raíz debe originar al menos una solución.' },
        { mod:'MEJORAR', id:'mejorar.seleccion_soluciones',
          ok: S.sel.length > 0,
          motivo: S.rows.length ? 'Hay ' + n0(S.rows.length) + ' solución(es) evaluadas y ninguna marcada SOLUTION = Sí. Elige cuáles se implementan: empieza por los Quick Wins.'
                                : 'Falta evaluar las soluciones. Califica esfuerzo, beneficio, factibilidad y costo-beneficio, y clasifícalas en la matriz Impacto-Esfuerzo.' },
        { mod:'MEJORAR', id:'mejorar.plan_accion',
          ok: PA.n > 0 && PA.pct >= 0.99 && !PA.venc.length,
          motivo: PA.n ? 'El Plan de Acción está en ' + p0(PA.pct) + ' de cumplimiento' +
                         (PA.venc.length ? ' con ' + n0(PA.venc.length) + ' acción(es) vencida(s)' : '') +
                         '. Ciérralo antes de pasar a CONTROLAR: no se controla lo que aún no se implementó.'
                       : 'Falta el Plan de Acción: convierte cada solución elegida en acciones con responsable y fecha límite.' },
        { mod:'CONTROLAR', id:'controlar.plan_de_control',
          ok: PC.n > 0 && PC.completo === PC.n,
          motivo: PC.n ? 'El Plan de Control tiene ' + n0(PC.n - PC.completo) + ' punto(s) incompletos (falta frecuencia, responsable o acción correctiva). Complétalo: sin control, la mejora se pierde en 3 a 6 meses.'
                       : 'Falta el Plan de Control: define qué se vigila, cómo se mide, cada cuánto, quién responde y qué se hace cuando el proceso se sale de especificación.' },
        { mod:'CONTROLAR', id:'controlar.grafico_antes_despues',
          ok: isFinite(ad.mejora) && ad.mejora > 0,
          motivo: (ad.A.length || ad.B.length)
                    ? 'El gráfico ANTES-DESPUES aún no demuestra mejora. Completa los periodos posteriores a la implementación (mínimo 4) con el mismo criterio y la misma unidad.'
                    : 'Falta el gráfico ANTES-DESPUES: es la evidencia del resultado del proyecto para el Champion y para la ARL.' },
        { mod:'CONTROLAR', id:'controlar.charter_cierre',
          ok: K.conDato.length > 0 && K.firmas >= 5,
          motivo: K.conDato.length ? 'Faltan ' + n0(Math.max(0, 5 - K.firmas)) + ' firma(s) de cierre. Sin ellas el proyecto no se cierra: queda en seguimiento.'
                                   : 'Falta registrar el valor LOGRADO de los métricos clave en el Charter de cierre y recoger las 5 firmas de aceptación.' }
      ];
      for (let i = 0; i < pasos.length; i++){
        const p = pasos[i];
        if (!modActivo(c, p.mod)) continue;
        if (!p.ok) return { toolId: p.id, motivo: p.motivo, mod: p.mod };
      }
      return { toolId:'controlar.a3_final', mod:'CONTROLAR',
        motivo:'Las cinco fases están cerradas con evidencia. Arma el A3 final con lo mejor de cada fase, preséntalo al Champion y a la ARL, y programa la auditoría de sostenimiento a los 3 y 6 meses.' };
    } catch(e){ console.warn('ENGINE.recomendarSiguiente', e); return { toolId:'', motivo:'' }; }
  }

  /* ------------------------------------------------------------ global */
  const CLAVE = ['definir.matriz_priorizacion', 'definir.objetivo_smart', 'definir.pareto',
                 'definir.series_tiempo', 'definir.beneficios', 'definir.gantt',
                 'definir.project_charter', 'medir.dpmo', 'medir.ppm', 'medir.dpu',
                 'medir.yield', 'medir.rty_fpy', 'medir.valor_add', 'medir.grafico_serie_tiempo',
                 'medir.plan_recoleccion', 'analizar.diagramas_ishikawa', 'analizar.5_whys',
                 'analizar.validacion_de_causas', 'analizar.descripcion_causa_raiz',
                 'mejorar.seleccion_soluciones', 'mejorar.plan_accion',
                 'controlar.grafico_antes_despues', 'controlar.plan_de_control',
                 'controlar.charter_cierre'];
  const MOD_DE = id => String(id).split('.')[0].toUpperCase();

  function globalCtx(ctx){
    try {
      const c = ctx || { all:{}, proj:null };
      const av  = avanceGlobal(c);
      const cal = calidad(c);
      const salud = clamp(Math.round(av * 35 + cal * 65), 0, 100);
      const semaforo = salud >= 70 ? 'ok' : (salud >= 40 ? 'warn' : 'bad');

      /* hallazgos: se recogen de las herramientas clave con datos */
      const hallazgos = [], vistos = {};
      CLAVE.forEach(function(id){
        const mod = MOD_DE(id);
        if (!modActivo(c, mod)) return;
        if (!lleno(c, id)) return;
        const t = (typeof TOOL_BY_ID !== 'undefined' && TOOL_BY_ID[id]) ? TOOL_BY_ID[id] : { id: id };
        forTool(t, (c.all || {})[id] || {}, c).forEach(function(m){
          if (m.sev === 'baja') return;
          const k = m.text.slice(0, 60);
          if (vistos[k]) return;
          vistos[k] = 1;
          hallazgos.push({ icon: m.icon, text: m.text, sev: m.sev, mod: mod, toolId: id,
                           tool: t.title || id });
        });
      });
      const ord = ordenar(hallazgos);
      const riesgos    = ord.filter(x => x.sev === 'alta');
      const logros     = ord.filter(x => x.sev === 'ok');
      const siguiente  = recomendarSiguiente(c);

      /* decisiones sugeridas: lo accionable, en orden de impacto */
      const decisiones = [];
      const V = causasValidadas(c), S = solucionesDe(c), PA = planAccionDe(c),
            PC = planControlDe(c), ad = adCtx(c), K = metricosCierre(c), B = hayBaseline(c);
      if (siguiente && siguiente.toolId)
        decisiones.push(MSG('➡️', 'SIGUIENTE PASO · ' + siguiente.motivo, 'media'));
      if (!B.ok)
        decisiones.push(ALTA('DECISIÓN: no avanzar a ANALIZAR hasta tener línea base. Sin dato de partida el proyecto no puede demostrar resultado al cerrar.'));
      if (V.total && !V.validadas)
        decisiones.push(ALTA('DECISIÓN: detener el diseño de soluciones. Hay ' + n0(V.total) +
          ' causa(s) posibles y 0 validadas: primero se prueba la causa con datos, después se invierte.'));
      if (S.qw.length && !S.sel.length)
        decisiones.push(AVISO('DECISIÓN: aprobar de inmediato los ' + n0(S.qw.length) +
          ' QUICK WIN(S) identificados (poco esfuerzo, alto beneficio) para conseguir resultados visibles en semanas.'));
      if (S.ing.length)
        decisiones.push(AVISO('DECISIÓN: descartar las ' + n0(S.ing.length) +
          ' solución(es) del cuadrante INGRATOS (mucho esfuerzo, poco beneficio): consumen el equipo sin mover el métrico.'));
      if (PA.venc.length)
        decisiones.push(ALTA('DECISIÓN: escalar al Champion las ' + n0(PA.venc.length) +
          ' acción(es) vencidas del plan de mejora (' + p0(safeDiv(PA.venc.length, PA.n || 1)) +
          ' del plan). Replanear una vez es gestión; tres veces es abandono.'));
      if (PC.n && PC.completo < PC.n)
        decisiones.push(AVISO('DECISIÓN: completar ' + n0(PC.n - PC.completo) + ' de ' + n0(PC.n) +
          ' punto(s) del plan de control antes de entregar el proceso a su dueño.'));
      if (isFinite(ad.mejora) && ad.mejora > 0 && K.conDato.length && K.cumplen.length === K.conDato.length)
        decisiones.push(BIEN('DECISIÓN: CERRAR el proyecto y REPLICAR el estándar en las demás sedes o servicios; programar auditoría de sostenimiento a los 3 y 6 meses.'));
      else if (isFinite(ad.mejora) && ad.mejora <= 0 && (ad.A.length && ad.B.length))
        decisiones.push(ALTA('DECISIÓN: VOLVER A ANALIZAR. El resultado no mejoró (' + p1(ad.mejora) +
          '): la causa atacada no explica el problema o la solución no se está ejecutando.'));

      const fases = avanceFases(c);
      const resumen = 'Avance DMAIC ' + p0(av) + ' · calidad de la evidencia ' + p0(cal) +
        (B.dpmo.opps > 0 ? ' · nivel sigma ' + n2(sigmaLevel(B.dpmo.dpmo)) + 'σ' :
         (B.ppm.units > 0 ? ' · nivel sigma ' + n2(sigmaLevel(B.ppm.ppm)) + 'σ' : '')) +
        ' · ' + n0(V.validadas) + ' de ' + n0(V.total) + ' causas validadas' +
        (PA.n ? ' · plan de acción ' + p0(PA.pct) : '') +
        (isFinite(ad.mejora) ? ' · mejora lograda ' + p1(ad.mejora) : '') +
        ' · ' + n0(riesgos.length) + ' riesgo(s) abierto(s).';

      return { salud: salud, semaforo: semaforo, resumen: resumen,
               avance: av, calidad: cal, fases: fases,
               hallazgos: ord.slice(0, 24), decisiones: decisiones,
               riesgos: riesgos.slice(0, 16), logros: logros.slice(0, 10),
               siguientePaso: siguiente };
    } catch(e){
      console.warn('ENGINE.global', e);
      return { salud:0, semaforo:'bad', resumen:'No fue posible evaluar el proyecto.',
               avance:0, calidad:0, fases:[], hallazgos:[], decisiones:[], riesgos:[], logros:[],
               siguientePaso:{ toolId:'', motivo:'' } };
    }
  }

  /* --------------------------------------------------------- narrativa */
  function narrativa(ctx){
    try {
      const c = ctx || { all:{}, proj:null };
      const p = c.proj || {};
      const g = globalCtx(c);
      const B = hayBaseline(c), V = causasValidadas(c), S = solucionesDe(c),
            PA = planAccionDe(c), PC = planControlDe(c), ad = adCtx(c), K = metricosCierre(c);
      const P = paretoCtx(c);
      const obj = objetivoTexto(c), prob = problemaTexto(c);

      /* ---- párrafo 1: qué se está resolviendo y desde qué línea base ---- */
      const a = [];
      a.push('El proyecto «' + (tx(p.nombre) || 'sin título') + '»' +
        (tx(p.empresa) ? ', ejecutado por REHAVID para ' + tx(p.empresa) : ', ejecutado por REHAVID') +
        (tx(p.arl) ? ' bajo el contrato con ' + tx(p.arl) : '') +
        (tx(p.area) ? ' en el proceso de ' + tx(p.area) : '') +
        ', presenta un avance DMAIC del ' + p0(g.avance) + ' y una salud de proyecto de ' +
        n0(g.salud) + ' sobre 100 (' +
        (g.semaforo === 'ok' ? 'verde' : (g.semaforo === 'warn' ? 'amarillo' : 'rojo')) + ').');
      if (prob) a.push('El problema definido es: ' + corta(prob, 320));
      if (obj) a.push('El objetivo comprometido es: ' + corta(obj, 320) +
        (numerosDe(obj).length ? '' : ' (sin meta numérica declarada, lo que impide verificar su cumplimiento)') +
        (tienePlazo(obj) ? '' : ' (sin plazo declarado)') + '.');
      if (B.def.n)
        a.push('La línea base se estableció con ' + n0(B.def.n) + ' punto(s) de medición y un promedio de ' +
          n2(B.def.prom) + (isFinite(B.def.objetivo) ? ', frente a un objetivo de ' + n2(B.def.objetivo) +
            ' (GAP de ' + n2(Math.abs(B.def.prom - B.def.objetivo)) + ')' : '') + '.');
      else if (B.med.n)
        a.push('La línea base se tomó de la serie de ' + n0(B.med.n) + ' periodos de MEDIR, con un promedio de ' +
          n2(B.med.prom) + '.');
      if (B.dpmo.opps > 0)
        a.push('El desempeño medido es de ' + n0(B.dpmo.dpmo) + ' DPMO sobre ' + n0(B.dpmo.opps) +
          ' oportunidades, equivalente a un nivel sigma de ' + n2(sigmaLevel(B.dpmo.dpmo)) + 'σ (' +
          (claseSigma(sigmaLevel(B.dpmo.dpmo)) || {}).n + ').');
      else if (B.ppm.units > 0)
        a.push('El desempeño medido es de ' + n0(B.ppm.ppm) + ' PPM sobre ' + n0(B.ppm.units) +
          ' unidades inspeccionadas, equivalente a ' + n2(sigmaLevel(B.ppm.ppm)) + 'σ.');
      if (P && P.vitales.length)
        a.push('El análisis de Pareto concentra el ' + p1(P.acum) + ' de los ' + n0(P.total) +
          ' casos en ' + n0(P.vitales.length) + ' categoría(s): ' + lista(P.vitales.map(x => x.cat), 3) + '.');
      if (!B.ok)
        a.push('El proyecto todavía no cuenta con una línea base cuantificada, lo que impide dimensionar el GAP y demostrar el resultado al cierre.');

      /* ---- párrafo 2: causas, soluciones, resultado y decisión ---- */
      const b = [];
      if (V.total)
        b.push('En ANALIZAR se identificaron ' + n0(V.total) + ' causa(s) posibles, de las cuales ' +
          n0(V.validadas) + ' quedaron confirmadas con datos (' + p0(V.pct) + ')' +
          (V.nombres.length ? ': ' + lista(V.nombres.slice(0, 3).map(x => corta(x, 60)), 3) : '') + '.');
      else
        b.push('La fase ANALIZAR aún no registra causas verificadas con datos.');
      if (S.rows.length)
        b.push('En MEJORAR se evaluaron ' + n0(S.rows.length) + ' solución(es) con la matriz Impacto-Esfuerzo (' +
          n0(S.qw.length) + ' quick wins, ' + n0(S.pm.length) + ' proyectos mayores y ' + n0(S.ing.length) +
          ' ingratos) y se eligieron ' + n0(S.sel.length) + ' para implementar.');
      if (PA.n)
        b.push('El plan de acción tiene ' + n0(PA.n) + ' actividad(es) con un cumplimiento del ' + p0(PA.pct) +
          (PA.venc.length ? ' y ' + n0(PA.venc.length) + ' acción(es) vencidas' : ' y ninguna acción vencida') + '.');
      if (PC.n)
        b.push('El plan de control cubre ' + n0(PC.n) + ' punto(s), de los cuales ' + n0(PC.completo) +
          ' están completos (' + p0(safeDiv(PC.completo, PC.n)) + ').');
      if (isFinite(ad.mejora))
        b.push('El resultado medido pasa de un promedio de ' + n2(ad.ma) + ' a ' + n2(ad.mb) + ', una mejora del ' +
          p1(ad.mejora) + ' sobre ' + n0(Math.min(ad.A.length, ad.B.length)) + ' periodo(s) comparables.');
      if (K.conDato.length)
        b.push('De los ' + n0(K.pares.length) + ' métricos clave del charter, ' + n0(K.conDato.length) +
          ' tienen resultado de cierre y ' + n0(K.cumplen.length) + ' cumplen el objetivo pactado; hay ' +
          n0(K.firmas) + ' de 5 firmas de cierre.');
      if (g.riesgos.length)
        b.push('Quedan ' + n0(g.riesgos.length) + ' riesgo(s) de severidad alta abiertos, encabezados por: ' +
          corta(g.riesgos[0].text, 200));
      if (g.siguientePaso && g.siguientePaso.motivo)
        b.push('Recomendación inmediata: ' + g.siguientePaso.motivo);

      return a.join(' ') + '\n\n' + b.join(' ');
    } catch(e){
      console.warn('ENGINE.narrativa', e);
      return 'No fue posible generar el resumen ejecutivo con la información disponible.';
    }
  }

  return {
    forTool: forTool,
    global: globalCtx,
    recomendarSiguiente: recomendarSiguiente,
    narrativa: narrativa,
    avanceFases: avanceFases,
    chequeos: chequeos,
    _R: REGLAS,
    _u: { T:T, RS:RS, tx:tx, fl:fl, corta:corta, n0:n0, n1:n1, n2:n2, n3:n3, p0:p0, p1:p1,
          mny:mny, fch:fch, MSG:MSG, ALTA:ALTA, AVISO:AVISO, INFO:INFO, BIEN:BIEN, FALTA:FALTA,
          IDEA:IDEA, META:META, RELOJ:RELOJ, GANA:GANA, PLATA:PLATA, ordenar:ordenar,
          p01:p01, prop:prop, zConf:zConf, modActivo:modActivo, lleno:lleno,
          claseSigma:claseSigma, msgSigma:msgSigma, msgSalto4Sigma:msgSalto4Sigma,
          paretoDe:paretoDe, paretoCtx:paretoCtx, analizarSerie:analizarSerie,
          baseDefinir:baseDefinir, serieMedir:serieMedir, dpmoDe:dpmoDe, dpmoCtx:dpmoCtx,
          ppmDe:ppmDe, hayBaseline:hayBaseline, causasValidadas:causasValidadas,
          overallSol:overallSol, cuadranteSol:cuadranteSol, solucionesDe:solucionesDe,
          estatusDe:estatusDe, esRealizada:esRealizada, diasVencida:diasVencida,
          planAccionDe:planAccionDe, adStats:adStats, adCtx:adCtx, planControlDe:planControlDe,
          cumpleObj:cumpleObj, mejoroMetrico:mejoroMetrico, metricosCierre:metricosCierre,
          objetivoCuantitativo:objetivoCuantitativo, numerosDe:numerosDe, tienePlazo:tienePlazo,
          objetivoTexto:objetivoTexto, problemaTexto:problemaTexto, lista:lista }
  };
})();
