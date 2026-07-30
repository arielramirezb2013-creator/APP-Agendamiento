/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC · BIBLIOTECA ESTADÍSTICA INFERENCIAL
   ---------------------------------------------------------------------------
   JavaScript de navegador plano: sin librerías, sin CDN, sin red.
   Depende únicamente de los helpers globales de 20_core.js
   (num, isNum, arr, stdev, median, normsinv, normsdist, erfc, sigmaLevel,
    clamp, round, safeDiv, fmt).

   Convención de salida: TODA prueba de hipótesis devuelve, como mínimo
       { estadistico, gl, p, decision, interpretacion }
   más los insumos del cálculo (n, medias, IC, valores críticos…) y el
   indicador booleano `rechaza`. Los textos están en español de Colombia y
   listos para mostrarse tal cual en la interfaz.

   Precisión objetivo de las distribuciones: |error| <= 1e-9.
   ========================================================================== */
'use strict';

const STATS = (function(){

  /* ======================================================================
     0. UTILIDADES INTERNAS
     ==================================================================== */

  const NFC = {};
  /** Formato numérico es-CO con `d` decimales fijos */
  function fnum(v, d){
    d = (d === undefined) ? 3 : d;
    if (v === null || v === undefined || !isFinite(v)) return '—';
    const k = 'n' + d;
    if (!NFC[k]) NFC[k] = new Intl.NumberFormat('es-CO',
      { minimumFractionDigits: d, maximumFractionDigits: d });
    return NFC[k].format(v);
  }
  /** «p = 0,0021» / «p < 0,0001» */
  function fpTxt(p){
    if (!isFinite(p)) return 'p = —';
    if (p < 0.0001) return 'p < 0,0001';
    return 'p = ' + fnum(p, 4);
  }
  const fp   = p => (isFinite(p) ? (p < 0.0001 ? '< 0,0001' : fnum(p, 4)) : '—');
  const fa   = a => fnum(num(a), num(a) >= 0.01 ? 2 : 3);
  const pct1 = v => (isFinite(v) ? fnum(v, 1) + ' %' : '—');

  const ALFA = 0.05;
  const alfaOk = a => { const x = num(a); return (x > 0 && x < 1) ? x : ALFA; };

  /** Separador interno para claves compuestas (nunca aparece en los datos) */
  const SEP = '\u0001';

  const nulo = v => (v === null || v === undefined || v === '' || !isFinite(num(v))) ? null : num(v);

  /** Array numérico limpio a partir de números, textos o filas {valor|v|value} */
  function serie(a){
    if (!Array.isArray(a)) return [];
    const out = [];
    for (let i = 0; i < a.length; i++){
      const x = a[i];
      if (x && typeof x === 'object' && !Array.isArray(x)){
        const y = x.valor !== undefined ? x.valor : (x.v !== undefined ? x.v : x.value);
        if (isNum(y)) out.push(num(y));
      } else if (isNum(x)) out.push(num(x));
    }
    return out;
  }
  const ord   = v => v.slice().sort((a, b) => a - b);
  const suma  = v => v.reduce((a, b) => a + b, 0);
  const mean  = v => (v.length ? suma(v) / v.length : NaN);
  const varS  = v => { const n = v.length; if (n < 2) return NaN; const m = mean(v);
                       return v.reduce((a, x) => a + (x - m) * (x - m), 0) / (n - 1); };
  const sd    = v => Math.sqrt(varS(v));
  const med   = v => median(v);
  const rango = v => (v.length ? Math.max.apply(null, v) - Math.min.apply(null, v) : NaN);

  /** Percentil por interpolación lineal (equivalente a PERCENTIL.INC de Excel) */
  function quantil(v, q){
    const s = ord(v), n = s.length;
    if (!n) return NaN;
    if (n === 1) return s[0];
    const h = (n - 1) * clamp(num(q), 0, 1);
    const lo = Math.floor(h), hi = Math.ceil(h);
    return s[lo] + (h - lo) * (s[hi] - s[lo]);
  }

  /** Grupos → [{nombre, valores, n, media, s, suma}] */
  function grupos(g){
    let lista = g;
    if (!Array.isArray(lista) && lista && typeof lista === 'object' && Array.isArray(lista.series))
      lista = lista.series.map((s, i) => ({ name: (arr(lista.labels)[i] || ('Grupo ' + (i + 1))), values: s }));
    const out = [];
    arr(lista).forEach((x, i) => {
      let nombre = 'Grupo ' + (i + 1), v = null;
      if (Array.isArray(x)) v = serie(x);
      else if (x && typeof x === 'object'){
        nombre = String(x.name || x.nombre || x.label || x.etiqueta || nombre);
        v = serie(x.values || x.valores || x.datos || x.v || []);
      }
      if (v && v.length)
        out.push({ nombre: nombre, valores: v, n: v.length, media: mean(v), s: sd(v), suma: suma(v) });
    });
    return out;
  }

  /** Rangos con promedio en los empates → {r:[], empates:[t,…]} */
  function rangosDe(v){
    const idx = v.map((x, i) => ({ x: x, i: i })).sort((a, b) => a.x - b.x);
    const r = new Array(v.length), emp = [];
    let i = 0;
    while (i < idx.length){
      let j = i;
      while (j + 1 < idx.length && idx[j + 1].x === idx[i].x) j++;
      const rr = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k].i] = rr;
      if (j > i) emp.push(j - i + 1);
      i = j + 1;
    }
    return { r: r, empates: emp };
  }

  /** Decisión estándar de una prueba de hipótesis */
  function decidir(p, alfa, siRechaza, siNo){
    const a = alfaOk(alfa);
    if (!isFinite(p))
      return { rechaza: false, decision: 'Sin decisión',
               interpretacion: 'No hay datos suficientes para concluir la prueba.' };
    const ok = p < a;
    return {
      rechaza: ok,
      decision: (ok ? 'Se rechaza H₀' : 'No se rechaza H₀') + ' (α = ' + fa(a) + ')',
      interpretacion: fpTxt(p) + (ok ? ' < ' : ' ≥ ') + fa(a) + ' → ' +
        (ok ? 'se rechaza H₀: ' + siRechaza : 'no se rechaza H₀: ' + siNo)
    };
  }
  /** Resultado inválido con la misma forma que uno válido */
  function fallo(msg, extra){
    const base = { estadistico: NaN, gl: NaN, p: NaN, rechaza: false,
                   decision: 'Sin decisión', interpretacion: msg, error: msg };
    if (extra) for (const k in extra) base[k] = extra[k];
    return base;
  }

  /* ======================================================================
     1. DISTRIBUCIONES  (funciones base)
     ==================================================================== */

  /* --- ln Γ(x) · Lanczos g = 7, n = 9 (error relativo < 1e-15) --------- */
  const LZ = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
              771.32342877765313, -176.61502916214059, 12.507343278686905,
              -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lnGamma(x){
    x = num(x);
    if (!isFinite(x)) return NaN;
    if (x <= 0 && x === Math.round(x)) return Infinity;      // polos en 0, -1, -2…
    if (x < 0.5)                                             // reflexión de Euler
      return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lnGamma(1 - x);
    const z = x - 1;
    let a = LZ[0];
    const t = z + 7.5;
    for (let i = 1; i < 9; i++) a += LZ[i] / (z + i);
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
  }
  /** Γ(x) para todo x real (salvo los polos) */
  function gamma(x){
    x = num(x);
    if (!isFinite(x)) return NaN;
    if (x <= 0 && x === Math.round(x)) return NaN;
    if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
    return Math.exp(lnGamma(x));
  }

  /* --- Beta incompleta regularizada I_x(a,b) · fracción continua Lentz -- */
  const FPMIN = 1e-300, EPSF = 3e-16;
  function betacf(x, a, b){
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 400; m++){
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < EPSF) break;
    }
    return h;
  }
  function betainc(x, a, b){
    x = num(x); a = num(a); b = num(b);
    if (!(a > 0) || !(b > 0) || !isFinite(x)) return NaN;
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) +
                        a * Math.log(x) + b * Math.log(1 - x));
    return (x < (a + 1) / (a + b + 2))
      ? bt * betacf(x, a, b) / a
      : 1 - bt * betacf(1 - x, b, a) / b;
  }

  /* --- Gamma incompleta P(a,x): serie + fracción continua --------------- */
  function gser(a, x){
    let ap = a, s = 1 / a, del = s;
    for (let n = 1; n <= 1200; n++){
      ap++; del *= x / ap; s += del;
      if (Math.abs(del) < Math.abs(s) * 1e-16) break;
    }
    return s * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  function gcf(a, x){                                   // devuelve Q(a,x)
    let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
    for (let i = 1; i <= 1200; i++){
      const an = -i * (i - a);
      b += 2;
      d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-16) break;
    }
    return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
  }
  /** P(a,x): función gamma incompleta regularizada inferior */
  function gammaP(a, x){
    a = num(a); x = num(x);
    if (!(a > 0) || !(x >= 0)) return NaN;
    if (x === 0) return 0;
    if (!isFinite(x)) return 1;
    return (x < a + 1) ? gser(a, x) : 1 - gcf(a, x);
  }
  /** Q(a,x) = 1 − P(a,x) calculada DIRECTAMENTE.
   *  Nunca como 1 − P: en la cola (Q ~ 1e-10) esa resta perdería 9 cifras. */
  function gammaQ(a, x){
    a = num(a); x = num(x);
    if (!(a > 0) || !(x >= 0)) return NaN;
    if (x === 0) return 1;
    if (!isFinite(x)) return 0;
    return (x < a + 1) ? 1 - gser(a, x) : gcf(a, x);
  }

  /* --- inversor genérico por bisección para CDF monótonas --------------- */
  function invBisec(cdf, p, lo, hi){
    let a = lo, b = hi;
    // asegura que el intervalo contiene la raíz
    let k = 0;
    while (cdf(a) > p && k++ < 200) { const w = b - a; a -= Math.max(1, w); }
    k = 0;
    while (cdf(b) < p && k++ < 200) { const w = b - a; b += Math.max(1, w); }
    for (let i = 0; i < 160; i++){
      const m = (a + b) / 2;
      if (cdf(m) < p) a = m; else b = m;
      if (b - a < 1e-13 * Math.max(1, Math.abs(m))) break;
    }
    return (a + b) / 2;
  }

  /* --- Normal ----------------------------------------------------------
     Se apoyan en normsdist / normsinv del núcleo (20_core.js) y las refinan:
     la erfc racional del núcleo tiene un error ~1e-7, insuficiente para los
     valores p de las pruebas. Aquí erfc(x) = Q(1/2, x²) con la gamma
     incompleta ya implementada (error ~1e-15) y la inversa se pule con dos
     pasos de Newton partiendo de la semilla del núcleo. Los resultados
     coinciden con normsdist/normsinv hasta su propia precisión.            */
  /** Densidad normal estándar */
  const normPDF = z => Math.exp(-num(z) * num(z) / 2) / Math.sqrt(2 * Math.PI);
  /** erfc de alta precisión mediante la gamma incompleta */
  function erfcHP(x){
    const a = Math.abs(x);
    const q = gammaQ(0.5, a * a);
    return x >= 0 ? q : 2 - q;
  }
  function normCDF(z){
    z = num(z);
    if (!isFinite(z)) return z > 0 ? 1 : 0;
    if (z === 0) return 0.5;
    return 0.5 * erfcHP(-z / Math.SQRT2);
  }
  /** Cola superior 1 − Φ(z), sin la cancelación de restarle 1 a un número ≈ 1 */
  function normSF(z){
    z = num(z);
    if (!isFinite(z)) return z > 0 ? 0 : 1;
    return 0.5 * erfcHP(z / Math.SQRT2);
  }
  function normInv(p){
    p = num(p);
    if (!(p > 0 && p < 1)) return NaN;
    if (p > 0.5) return -normInv(1 - p);          // se resuelve siempre en la cola inferior
    let z = normsinv(p);                          // semilla: Acklam/Wichura del núcleo
    if (!isFinite(z)) return NaN;
    for (let i = 0; i < 3; i++){
      const d = normPDF(z);
      if (!(d > 1e-300)) break;
      const e = normCDF(z) - p;
      if (!isFinite(e)) break;
      z -= e / d;
    }
    return z;
  }

  /* --- t de Student ----------------------------------------------------- */
  function tCDF(t, gl){
    t = num(t); gl = num(gl);
    if (!(gl > 0) || !isFinite(t)) return (t > 0 ? 1 : 0);
    const x = gl / (gl + t * t);
    const p = 0.5 * betainc(x, gl / 2, 0.5);
    return t > 0 ? 1 - p : p;
  }
  function tInv(p, gl){
    p = num(p); gl = num(gl);
    if (!(gl > 0) || !(p > 0 && p < 1)) return NaN;
    if (p === 0.5) return 0;
    return invBisec(x => tCDF(x, gl), p, -60, 60);
  }
  /** Cola superior de la t, calculada directamente (sin restar a 1) */
  function tSF(t, gl){
    t = num(t); gl = num(gl);
    if (!(gl > 0) || !isFinite(t)) return t > 0 ? 0 : 1;
    const c = 0.5 * betainc(gl / (gl + t * t), gl / 2, 0.5);
    return t > 0 ? c : 1 - c;
  }
  /** p bilateral de un estadístico t (exacto incluso para p ~ 1e-15) */
  const tP2 = (t, gl) => clamp(betainc(gl / (gl + t * t), gl / 2, 0.5), 0, 1);

  /* --- F de Fisher-Snedecor -------------------------------------------- */
  function fCDF(f, gl1, gl2){
    f = num(f); gl1 = num(gl1); gl2 = num(gl2);
    if (!(gl1 > 0) || !(gl2 > 0)) return NaN;
    if (!(f > 0)) return 0;
    if (!isFinite(f)) return 1;
    return betainc(gl1 * f / (gl1 * f + gl2), gl1 / 2, gl2 / 2);
  }
  /** Cola superior de la F: 1 − I_x(a,b) = I_{1−x}(b,a), sin cancelación */
  function fSF(f, gl1, gl2){
    f = num(f); gl1 = num(gl1); gl2 = num(gl2);
    if (!(gl1 > 0) || !(gl2 > 0)) return NaN;
    if (!(f > 0)) return 1;
    if (!isFinite(f)) return 0;
    return betainc(gl2 / (gl1 * f + gl2), gl2 / 2, gl1 / 2);
  }
  function fInv(p, gl1, gl2){
    p = num(p); gl1 = num(gl1); gl2 = num(gl2);
    if (!(gl1 > 0) || !(gl2 > 0) || !(p > 0 && p < 1)) return NaN;
    return invBisec(x => fCDF(x, gl1, gl2), p, 0, 10);
  }

  /* --- Chi cuadrado ----------------------------------------------------- */
  function chi2CDF(x, gl){
    x = num(x); gl = num(gl);
    if (!(gl > 0)) return NaN;
    if (!(x > 0)) return 0;
    return gammaP(gl / 2, x / 2);
  }
  /** Cola superior de la chi cuadrado (valor p directo) */
  function chi2SF(x, gl){
    x = num(x); gl = num(gl);
    if (!(gl > 0)) return NaN;
    if (!(x > 0)) return 1;
    return gammaQ(gl / 2, x / 2);
  }
  function chi2Inv(p, gl){
    p = num(p); gl = num(gl);
    if (!(gl > 0) || !(p > 0 && p < 1)) return NaN;
    return invBisec(x => chi2CDF(x, gl), p, 0, Math.max(10, 2 * gl));
  }

  /* ======================================================================
     2. PRUEBAS DE HIPÓTESIS
     ==================================================================== */

  /* ------------------------------------------------ t de 1 muestra ----- */
  function tTest1(datos, mu0, alfa){
    const V = serie(datos), a = alfaOk(alfa), m0 = num(mu0);
    const n = V.length;
    if (n < 2) return fallo('Se necesitan al menos 2 datos para la prueba t de una muestra.',
      { n: n, mu0: m0, alfa: a });
    const m = mean(V), s = sd(V), gl = n - 1;
    const se = s / Math.sqrt(n);
    if (!(se > 0)) return fallo('Todos los datos son iguales: la desviación estándar es cero.',
      { n: n, media: m, s: s, mu0: m0, alfa: a });
    const t = (m - m0) / se;
    const p = tP2(t, gl);
    const tc = tInv(1 - a / 2, gl);
    const ic = [m - tc * se, m + tc * se];
    const d = decidir(p, a,
      'la media del proceso (' + fnum(m, 3) + ') SÍ difiere de ' + fnum(m0, 3) + '.',
      'no hay evidencia de que la media (' + fnum(m, 3) + ') sea distinta de ' + fnum(m0, 3) + '.');
    return { prueba: 't de una muestra', n: n, media: m, s: s, se: se, mu0: m0,
             diferencia: m - m0, estadistico: t, gl: gl, p: p, tCritico: tc, ic: ic,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' IC ' + fnum((1 - a) * 100, 0) + ' %: [' +
               fnum(ic[0], 3) + '; ' + fnum(ic[1], 3) + '].' };
  }

  /* ------------------------------------------------ t de 2 muestras ---- */
  function tTest2(a1, b1, alfa, iguales){
    const A = serie(a1), B = serie(b1), a = alfaOk(alfa);
    const na = A.length, nb = B.length;
    if (na < 2 || nb < 2) return fallo('Cada muestra necesita al menos 2 datos.',
      { n1: na, n2: nb, alfa: a });
    const ma = mean(A), mb = mean(B), sa = sd(A), sb = sd(B);
    const va = sa * sa, vb = sb * sb;
    let se, gl, metodo;
    if (iguales){
      const sp2 = ((na - 1) * va + (nb - 1) * vb) / (na + nb - 2);
      se = Math.sqrt(sp2 * (1 / na + 1 / nb));
      gl = na + nb - 2;
      metodo = 'agrupada (varianzas iguales)';
    } else {
      se = Math.sqrt(va / na + vb / nb);
      const den = (va / na) * (va / na) / (na - 1) + (vb / nb) * (vb / nb) / (nb - 1);
      gl = den > 0 ? Math.pow(va / na + vb / nb, 2) / den : (na + nb - 2);
      metodo = 'Welch (varianzas distintas)';
    }
    if (!(se > 0)) return fallo('Las dos muestras no tienen variabilidad: la prueba no aplica.',
      { n1: na, n2: nb, media1: ma, media2: mb, alfa: a });
    const dif = ma - mb;
    const t = dif / se;
    const p = tP2(t, gl);
    const tc = tInv(1 - a / 2, gl);
    const ic = [dif - tc * se, dif + tc * se];
    const d = decidir(p, a,
      'las medias SON estadísticamente diferentes (' + fnum(ma, 3) + ' vs. ' + fnum(mb, 3) + ').',
      'las medias NO son estadísticamente diferentes (' + fnum(ma, 3) + ' vs. ' + fnum(mb, 3) + ').');
    return { prueba: 't de dos muestras · ' + metodo, metodo: metodo,
             n1: na, n2: nb, media1: ma, media2: mb, s1: sa, s2: sb,
             diferencia: dif, se: se, estadistico: t, gl: gl, p: p, tCritico: tc, ic: ic,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' Diferencia = ' + fnum(dif, 3) +
               '; IC ' + fnum((1 - a) * 100, 0) + ' %: [' + fnum(ic[0], 3) + '; ' + fnum(ic[1], 3) + '].' };
  }

  /* ------------------------------------------------ t pareada ---------- */
  function tTestPar(a1, b1, alfa){
    const A = serie(a1), B = serie(b1), a = alfaOk(alfa);
    const n = Math.min(A.length, B.length);
    if (n < 2) return fallo('Se necesitan al menos 2 pares completos de datos.', { n: n, alfa: a });
    const D = [];
    for (let i = 0; i < n; i++) D.push(A[i] - B[i]);
    const m = mean(D), s = sd(D), gl = n - 1, se = s / Math.sqrt(n);
    if (!(se > 0)) return fallo('Todas las diferencias son idénticas: la prueba t pareada no aplica.',
      { n: n, mediaDif: m, alfa: a });
    const t = m / se, p = tP2(t, gl), tc = tInv(1 - a / 2, gl);
    const ic = [m - tc * se, m + tc * se];
    const d = decidir(p, a,
      'SÍ hay un cambio real entre el antes y el después (diferencia media = ' + fnum(m, 3) + ').',
      'no hay evidencia de cambio entre el antes y el después (diferencia media = ' + fnum(m, 3) + ').');
    return { prueba: 't pareada', n: n, media1: mean(A.slice(0, n)), media2: mean(B.slice(0, n)),
             mediaDif: m, sDif: s, se: se, estadistico: t, gl: gl, p: p, tCritico: tc, ic: ic,
             diferencias: D, alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' IC ' + fnum((1 - a) * 100, 0) + ' %: [' +
               fnum(ic[0], 3) + '; ' + fnum(ic[1], 3) + '].' };
  }

  /* ------------------------------------------------ ANOVA de un factor -- */
  function anovaCore(G){
    const k = G.length;
    const todos = [].concat.apply([], G.map(g => g.valores));
    const N = todos.length, gm = mean(todos);
    let ssb = 0, ssw = 0;
    G.forEach(g => {
      const m = mean(g.valores);
      ssb += g.valores.length * (m - gm) * (m - gm);
      g.valores.forEach(x => { ssw += (x - m) * (x - m); });
    });
    const glb = k - 1, glw = N - k;
    const msb = glb > 0 ? ssb / glb : NaN;
    const msw = glw > 0 ? ssw / glw : NaN;
    let F, p;
    if (!(msw > 0)){ F = ssb > 0 ? Infinity : NaN; p = ssb > 0 ? 0 : NaN; }
    else { F = msb / msw; p = fSF(F, glb, glw); }
    return { k: k, N: N, gm: gm, ssb: ssb, ssw: ssw, sst: ssb + ssw,
             glb: glb, glw: glw, msb: msb, msw: msw, F: F, p: p };
  }

  function anova1(gs, alfa){
    const G = grupos(gs), a = alfaOk(alfa);
    if (G.length < 2) return fallo('El ANOVA necesita al menos 2 grupos con datos.', { alfa: a });
    if (G.some(g => g.n < 2)) return fallo('Cada grupo debe tener al menos 2 observaciones.', { alfa: a });
    const c = anovaCore(G);
    const eta2 = c.sst > 0 ? c.ssb / c.sst : NaN;
    const fc = fInv(1 - a, c.glb, c.glw);
    const tabla = [
      { fuente: 'Entre grupos (factor)',  gl: c.glb, ss: c.ssb, ms: c.msb, f: c.F, p: c.p },
      { fuente: 'Dentro de grupos (error)', gl: c.glw, ss: c.ssw, ms: c.msw, f: NaN, p: NaN },
      { fuente: 'Total', gl: c.glb + c.glw, ss: c.sst, ms: NaN, f: NaN, p: NaN }
    ];
    const mejor = G.slice().sort((x, y) => y.media - x.media)[0];
    const peor  = G.slice().sort((x, y) => x.media - y.media)[0];
    const d = decidir(c.p, a,
      'al menos un grupo tiene una media diferente (mayor: «' + mejor.nombre + '» = ' +
        fnum(mejor.media, 3) + '; menor: «' + peor.nombre + '» = ' + fnum(peor.media, 3) + ').',
      'todas las medias son estadísticamente iguales: el factor NO explica la variación.');
    return { prueba: 'ANOVA de un factor (One Way)', grupos: G.map(g => ({
               nombre: g.nombre, n: g.n, media: g.media, s: g.s })),
             k: c.k, N: c.N, mediaGlobal: c.gm,
             ss: { entre: c.ssb, dentro: c.ssw, total: c.sst },
             ms: { entre: c.msb, dentro: c.msw },
             estadistico: c.F, gl: [c.glb, c.glw], glEntre: c.glb, glDentro: c.glw,
             p: c.p, fCritico: fc, r2: eta2, eta2: eta2,
             sPooled: Math.sqrt(c.msw), tablaAnova: tabla,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' El factor explica el ' + pct1(eta2 * 100) +
               ' de la variación total (R²).' };
  }

  /* ------------------------------------------------ Kruskal-Wallis ----- */
  function kruskal(gs, alfa){
    const G = grupos(gs), a = alfaOk(alfa);
    if (G.length < 2) return fallo('Kruskal-Wallis necesita al menos 2 grupos con datos.', { alfa: a });
    const todos = [], idg = [];
    G.forEach((g, i) => g.valores.forEach(v => { todos.push(v); idg.push(i); }));
    const N = todos.length;
    if (N < 3) return fallo('Se necesitan al menos 3 observaciones en total.', { alfa: a });
    const R = rangosDe(todos);
    const sumR = new Array(G.length).fill(0);
    R.r.forEach((rr, i) => { sumR[idg[i]] += rr; });
    let H = 0;
    G.forEach((g, i) => { H += sumR[i] * sumR[i] / g.n; });
    H = 12 / (N * (N + 1)) * H - 3 * (N + 1);
    const emp = R.empates.reduce((x, t) => x + (t * t * t - t), 0);
    const C = 1 - emp / (N * N * N - N);
    const Hc = C > 0 ? H / C : H;
    const gl = G.length - 1;
    const p = chi2SF(Hc, gl);
    const xc = chi2Inv(1 - a, gl);
    const meds = G.map((g, i) => ({ nombre: g.nombre, n: g.n, mediana: med(g.valores),
                                    rangoMedio: sumR[i] / g.n }));
    const d = decidir(p, a,
      'al menos una MEDIANA es diferente entre los grupos.',
      'las medianas de los grupos son estadísticamente iguales.');
    return { prueba: 'Kruskal-Wallis (medianas, sin supuesto de normalidad)',
             grupos: meds, k: G.length, N: N, H: H, Hcorregido: Hc, correccionEmpates: C,
             estadistico: Hc, gl: gl, p: p, chi2Critico: xc,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' Se usa cuando los datos NO son normales o hay atípicos.' };
  }

  /* ------------------------------------------------ Mood (medianas) ---- */
  function moodMedian(gs, alfa){
    const G = grupos(gs), a = alfaOk(alfa);
    if (G.length < 2) return fallo('La prueba de la mediana de Mood necesita al menos 2 grupos.', { alfa: a });
    const todos = [].concat.apply([], G.map(g => g.valores));
    const M = med(todos);
    const arriba = [], abajo = [];
    G.forEach(g => {
      let s = 0;
      g.valores.forEach(v => { if (v > M) s++; });
      arriba.push(s); abajo.push(g.n - s);
    });
    const res = chi2Indep([arriba, abajo], a);
    const detalle = G.map((g, i) => ({ nombre: g.nombre, n: g.n, mediana: med(g.valores),
                                       sobre: arriba[i], bajo: abajo[i] }));
    const d = decidir(res.p, a,
      'al menos un grupo tiene una MEDIANA distinta de las demás.',
      'todos los grupos comparten la misma mediana.');
    return { prueba: 'Prueba de la mediana de Mood', grupos: detalle,
             medianaGlobal: M, tabla: [arriba, abajo],
             estadistico: res.estadistico, gl: res.gl, p: res.p,
             chi2Critico: chi2Inv(1 - a, res.gl), advertencia: res.advertencia,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' Mediana global = ' + fnum(M, 3) +
               '. Es la prueba de medianas más robusta frente a datos atípicos.' };
  }

  /* ------------------------------------------------ F de 2 varianzas --- */
  function fTest2(a1, b1, alfa){
    const A = serie(a1), B = serie(b1), a = alfaOk(alfa);
    if (A.length < 2 || B.length < 2)
      return fallo('Cada muestra necesita al menos 2 datos para comparar varianzas.', { alfa: a });
    const s1 = sd(A), s2 = sd(B), v1 = s1 * s1, v2 = s2 * s2;
    if (!(v1 > 0) || !(v2 > 0))
      return fallo('Alguna muestra no tiene variabilidad (desviación estándar cero).', { alfa: a });
    const gl1 = A.length - 1, gl2 = B.length - 1;
    const F = v1 / v2;
    const c = fCDF(F, gl1, gl2);
    const p = 2 * Math.min(c, 1 - c);
    const d = decidir(p, a,
      'las VARIANZAS son estadísticamente diferentes (s₁ = ' + fnum(s1, 3) +
        ' vs. s₂ = ' + fnum(s2, 3) + '): usa la prueba t de Welch.',
      'las varianzas son estadísticamente iguales: puedes usar la prueba t agrupada (pooled).');
    return { prueba: 'Prueba F de comparación de varianzas',
             n1: A.length, n2: B.length, s1: s1, s2: s2, var1: v1, var2: v2,
             razon: F, estadistico: F, gl: [gl1, gl2], gl1: gl1, gl2: gl2, p: p,
             fCriticoInf: fInv(a / 2, gl1, gl2), fCriticoSup: fInv(1 - a / 2, gl1, gl2),
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' F = ' + fnum(F, 4) + ' con ' + gl1 + ' y ' + gl2 + ' gl.' };
  }

  /* ------------------------------------------------ Levene / Brown-F --- */
  function levene(gs, alfa){
    const G = grupos(gs), a = alfaOk(alfa);
    if (G.length < 2) return fallo('La prueba de Levene necesita al menos 2 grupos.', { alfa: a });
    if (G.some(g => g.n < 2)) return fallo('Cada grupo debe tener al menos 2 observaciones.', { alfa: a });
    /* Brown-Forsythe: desviaciones absolutas respecto a la MEDIANA (robusta) */
    const Z = G.map(g => {
      const m = med(g.valores);
      return { nombre: g.nombre, valores: g.valores.map(v => Math.abs(v - m)),
               n: g.n, media: NaN, s: NaN, suma: NaN };
    });
    const c = anovaCore(Z);
    const fc = fInv(1 - a, c.glb, c.glw);
    const det = G.map(g => ({ nombre: g.nombre, n: g.n, s: g.s, varianza: g.s * g.s,
                              mediana: med(g.valores) }));
    const d = decidir(c.p, a,
      'las VARIANZAS no son homogéneas: los grupos tienen dispersiones distintas.',
      'las varianzas son homogéneas (homocedasticidad): se cumple el supuesto del ANOVA.');
    return { prueba: 'Levene / Brown-Forsythe (homogeneidad de varianzas)',
             grupos: det, k: c.k, N: c.N,
             estadistico: c.F, W: c.F, gl: [c.glb, c.glw], gl1: c.glb, gl2: c.glw,
             p: c.p, fCritico: fc,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion +
               ' Se calcula sobre |xᵢ − mediana del grupo|, por eso resiste datos atípicos.' };
  }

  /* ------------------------------------------------ 1 proporción ------- */
  function prop1(x, n, p0, alfa){
    const X = num(x), N = num(n), P0 = num(p0) > 1 ? num(p0) / 100 : num(p0), a = alfaOk(alfa);
    if (!(N > 0) || X < 0 || X > N)
      return fallo('Revisa los datos: 0 ≤ x ≤ n y n > 0.', { alfa: a });
    if (!(P0 > 0 && P0 < 1))
      return fallo('La proporción de referencia p₀ debe estar entre 0 y 1.', { alfa: a });
    const ph = X / N;
    const se0 = Math.sqrt(P0 * (1 - P0) / N);
    const z = (ph - P0) / se0;
    const p = 2 * normSF(Math.abs(z));
    const zc = normInv(1 - a / 2);
    /* IC de Wilson (mejor cobertura que el de Wald, sobre todo con n pequeño) */
    const den = 1 + zc * zc / N;
    const cen = (ph + zc * zc / (2 * N)) / den;
    const half = zc * Math.sqrt(ph * (1 - ph) / N + zc * zc / (4 * N * N)) / den;
    const ic = [clamp(cen - half, 0, 1), clamp(cen + half, 0, 1)];
    const d = decidir(p, a,
      'la proporción observada (' + fnum(ph * 100, 2) + ' %) SÍ difiere de ' + fnum(P0 * 100, 2) + ' %.',
      'no hay evidencia de que la proporción difiera de ' + fnum(P0 * 100, 2) + ' %.');
    return { prueba: 'Prueba Z de una proporción', x: X, n: N, p0: P0, proporcion: ph,
             estadistico: z, gl: NaN, p: p, zCritico: zc, ic: ic, se: se0,
             advertencia: (N * P0 < 5 || N * (1 - P0) < 5)
               ? 'Muestra pequeña (n·p₀ < 5): la aproximación normal puede ser imprecisa.' : '',
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' IC ' + fnum((1 - a) * 100, 0) + ' % (Wilson): [' +
               fnum(ic[0] * 100, 2) + ' %; ' + fnum(ic[1] * 100, 2) + ' %].' };
  }

  /* ------------------------------------------------ 2 proporciones ----- */
  function prop2(x1, n1, x2, n2, alfa){
    const X1 = num(x1), N1 = num(n1), X2 = num(x2), N2 = num(n2), a = alfaOk(alfa);
    if (!(N1 > 0) || !(N2 > 0) || X1 < 0 || X2 < 0 || X1 > N1 || X2 > N2)
      return fallo('Revisa los datos: 0 ≤ x ≤ n en ambos grupos y n > 0.', { alfa: a });
    const p1 = X1 / N1, p2 = X2 / N2, dif = p1 - p2;
    const pp = (X1 + X2) / (N1 + N2);
    const se0 = Math.sqrt(pp * (1 - pp) * (1 / N1 + 1 / N2));
    if (!(se0 > 0))
      return fallo('Las dos proporciones son 0 % o 100 %: la prueba no aplica.', { alfa: a });
    const z = dif / se0;
    const p = 2 * normSF(Math.abs(z));
    const zc = normInv(1 - a / 2);
    const seD = Math.sqrt(p1 * (1 - p1) / N1 + p2 * (1 - p2) / N2);
    const ic = [dif - zc * seD, dif + zc * seD];
    const d = decidir(p, a,
      'las proporciones SON diferentes (' + fnum(p1 * 100, 2) + ' % vs. ' + fnum(p2 * 100, 2) + ' %).',
      'las proporciones NO son estadísticamente diferentes (' + fnum(p1 * 100, 2) +
        ' % vs. ' + fnum(p2 * 100, 2) + ' %).');
    return { prueba: 'Prueba Z de dos proporciones',
             x1: X1, n1: N1, x2: X2, n2: N2, p1: p1, p2: p2, pAgrupada: pp,
             diferencia: dif, estadistico: z, gl: NaN, p: p, zCritico: zc, se: se0, ic: ic,
             advertencia: (N1 * pp < 5 || N2 * pp < 5)
               ? 'Conteos esperados < 5: la aproximación normal puede ser imprecisa.' : '',
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' Diferencia = ' + fnum(dif * 100, 2) +
               ' puntos porcentuales; IC ' + fnum((1 - a) * 100, 0) + ' %: [' +
               fnum(ic[0] * 100, 2) + ' %; ' + fnum(ic[1] * 100, 2) + ' %].' };
  }

  /* ------------------------------------------------ Chi² independencia - */
  function chi2Indep(tabla, alfa){
    const a = alfaOk(alfa);
    let T = tabla, filas = null, cols = null;
    if (T && !Array.isArray(T) && typeof T === 'object'){
      filas = arr(T.filas || T.rows).map(String);
      cols  = arr(T.columnas || T.cols).map(String);
      T = T.datos || T.data || T.tabla;
    }
    const M = arr(T).map(f => arr(f).map(v => num(v))).filter(f => f.length);
    if (M.length < 2 || M[0].length < 2)
      return fallo('La tabla de contingencia debe tener al menos 2 filas y 2 columnas.', { alfa: a });
    const nc = Math.max.apply(null, M.map(f => f.length));
    M.forEach(f => { while (f.length < nc) f.push(0); });
    const nf = M.length;
    const totF = M.map(f => suma(f));
    const totC = [];
    for (let j = 0; j < nc; j++){ let s = 0; for (let i = 0; i < nf; i++) s += M[i][j]; totC.push(s); }
    const N = suma(totF);
    if (!(N > 0)) return fallo('La tabla está vacía: todos los conteos son cero.', { alfa: a });
    const E = [], contrib = [];
    let x2 = 0, menores5 = 0, minE = Infinity;
    for (let i = 0; i < nf; i++){
      E.push([]); contrib.push([]);
      for (let j = 0; j < nc; j++){
        const e = totF[i] * totC[j] / N;
        E[i].push(e);
        const c = e > 0 ? Math.pow(M[i][j] - e, 2) / e : 0;
        contrib[i].push(c);
        x2 += c;
        if (e < 5) menores5++;
        if (e < minE) minE = e;
      }
    }
    const gl = (nf - 1) * (nc - 1);
    const p = chi2SF(x2, gl);
    const xc = chi2Inv(1 - a, gl);
    const V = Math.sqrt(x2 / (N * Math.min(nf - 1, nc - 1)));   // V de Cramér
    const fuerza = V >= 0.5 ? 'fuerte' : (V >= 0.3 ? 'moderada' : (V >= 0.1 ? 'débil' : 'nula'));
    const d = decidir(p, a,
      'las dos variables SÍ están asociadas (no son independientes).',
      'no hay evidencia de asociación: las variables son independientes.');
    const adv = menores5 > 0
      ? menores5 + ' celda(s) con frecuencia esperada < 5 (mínima = ' + fnum(minE, 2) +
        '): agrupa categorías o usa la prueba exacta de Fisher.' : '';
    return { prueba: 'Chi cuadrado de independencia',
             filas: filas, columnas: cols, observado: M, esperado: E, contribucion: contrib,
             totalFilas: totF, totalColumnas: totC, N: N,
             estadistico: x2, gl: gl, p: p, chi2Critico: xc, cramerV: V, advertencia: adv,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: d.interpretacion + ' V de Cramér = ' + fnum(V, 3) +
               ' (asociación ' + fuerza + ').' + (adv ? ' ⚠ ' + adv : '') };
  }

  /* ------------------------------------------------ Normalidad (A-D) --- */
  function normalidad(datos, alfa){
    const V = serie(datos), a = alfaOk(alfa);
    const n = V.length;
    if (n < 5) return fallo('Se necesitan al menos 5 datos para evaluar la normalidad.',
      { n: n, AD: NaN, normal: false, alfa: a });
    const m = mean(V), s = sd(V);
    if (!(s > 0)) return fallo('Todos los datos son iguales: no se puede evaluar la normalidad.',
      { n: n, media: m, s: s, AD: NaN, normal: false, alfa: a });
    const S = ord(V);
    let A2 = 0, valido = true;
    for (let i = 0; i < n; i++){
      const p1 = normCDF((S[i] - m) / s);
      const p2 = normCDF((S[n - 1 - i] - m) / s);
      const l1 = clamp(p1, 1e-15, 1 - 1e-15), l2 = clamp(1 - p2, 1e-15, 1 - 1e-15);
      if (!isFinite(l1) || !isFinite(l2)){ valido = false; break; }
      A2 += (2 * (i + 1) - 1) * (Math.log(l1) + Math.log(l2));
    }
    if (!valido) return fallo('No fue posible calcular el estadístico de Anderson-Darling.',
      { n: n, AD: NaN, normal: false, alfa: a });
    A2 = -n - A2 / n;
    const AD = A2 * (1 + 0.75 / n + 2.25 / (n * n));      // ajuste D'Agostino-Stephens
    let p;
    if (AD >= 0.6)      p = Math.exp(1.2937 - 5.709 * AD + 0.0186 * AD * AD);
    else if (AD > 0.34) p = Math.exp(0.9177 - 4.279 * AD - 1.38 * AD * AD);
    else if (AD > 0.2)  p = 1 - Math.exp(-8.318 + 42.796 * AD - 59.938 * AD * AD);
    else                p = 1 - Math.exp(-13.436 + 101.14 * AD - 223.73 * AD * AD);
    p = clamp(p, 0, 1);
    const normal = p >= a;
    const asim = (function(){
      let s3 = 0; V.forEach(x => { s3 += Math.pow((x - m) / s, 3); });
      return (n > 2) ? n / ((n - 1) * (n - 2)) * s3 : NaN;
    })();
    const curt = (function(){
      let s4 = 0; V.forEach(x => { s4 += Math.pow((x - m) / s, 4); });
      return (n > 3) ? (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * s4 -
        3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3)) : NaN;
    })();
    return { prueba: 'Anderson-Darling (normalidad)', n: n, media: m, s: s,
             mediana: med(V), asimetria: asim, curtosis: curt,
             A2: A2, AD: AD, estadistico: AD, gl: NaN, p: p, normal: normal,
             alfa: a, rechaza: !normal,
             decision: normal ? 'No se rechaza H₀ (α = ' + fa(a) + ')' : 'Se rechaza H₀ (α = ' + fa(a) + ')',
             interpretacion: fpTxt(p) + (normal ? ' ≥ ' : ' < ') + fa(a) + ' → ' + (normal
               ? 'no se rechaza H₀: los datos SÍ siguen una distribución normal; puedes usar pruebas paramétricas (t, ANOVA, Cp/Cpk).'
               : 'se rechaza H₀: los datos NO son normales; usa pruebas no paramétricas (Kruskal-Wallis, Mood) o transforma los datos.') +
               ' AD = ' + fnum(AD, 4) + '.' };
  }

  /* ------------------------------------------------ Correlación -------- */
  function fuerzaR(r){
    const x = Math.abs(r);
    if (!isFinite(x)) return 'indeterminada';
    if (x > 0.9) return 'Muy fuerte';
    if (x > 0.7) return 'Fuerte';
    if (x > 0.5) return 'Moderada';
    if (x > 0.3) return 'Débil';
    return 'Nula';
  }
  function correl(xs, ys, alfa){
    const X = [], Y = [], a = alfaOk(alfa);
    const A = arr(xs), B = arr(ys);
    const n0 = Math.min(A.length, B.length);
    for (let i = 0; i < n0; i++){
      if (isNum(A[i]) && isNum(B[i])){ X.push(num(A[i])); Y.push(num(B[i])); }
    }
    const n = X.length;
    if (n < 3) return fallo('Se necesitan al menos 3 pares (x, y) para la correlación.',
      { n: n, r: NaN, r2: NaN, alfa: a });
    const mx = mean(X), my = mean(Y);
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++){
      sxy += (X[i] - mx) * (Y[i] - my);
      sxx += (X[i] - mx) * (X[i] - mx);
      syy += (Y[i] - my) * (Y[i] - my);
    }
    if (!(sxx > 0) || !(syy > 0))
      return fallo('Una de las dos variables es constante: la correlación no está definida.',
        { n: n, r: NaN, r2: NaN, alfa: a });
    const r = clamp(sxy / Math.sqrt(sxx * syy), -1, 1);
    const gl = n - 2;
    const den = 1 - r * r;
    const t = den > 0 ? r * Math.sqrt(gl / den) : (r > 0 ? Infinity : -Infinity);
    const p = den > 0 ? tP2(t, gl) : 0;
    /* IC por transformación z de Fisher */
    let ic = [NaN, NaN];
    if (n > 3 && Math.abs(r) < 1){
      const zr = 0.5 * Math.log((1 + r) / (1 - r));
      const se = 1 / Math.sqrt(n - 3), zc = normInv(1 - a / 2);
      const lo = zr - zc * se, hi = zr + zc * se;
      ic = [Math.tanh(lo), Math.tanh(hi)];
    }
    const f = fuerzaR(r);
    const dir = r > 0 ? 'positiva (crecen juntas)' : (r < 0 ? 'negativa (cuando una sube, la otra baja)' : 'nula');
    const d = decidir(p, a,
      'la correlación SÍ es estadísticamente significativa.',
      'la correlación NO es significativa: puede deberse al azar.');
    return { prueba: 'Correlación de Pearson', n: n, r: r, r2: r * r,
             mediaX: mx, mediaY: my, sX: Math.sqrt(sxx / (n - 1)), sY: Math.sqrt(syy / (n - 1)),
             covarianza: sxy / (n - 1), estadistico: t, gl: gl, p: p,
             tCritico: tInv(1 - a / 2, gl), ic: ic, fuerza: f, direccion: dir,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: 'r = ' + fnum(r, 4) + ' → correlación ' + f.toUpperCase() + ' ' + dir +
               '; R² = ' + pct1(r * r * 100) + ' de la variación de Y se explica por X. ' +
               d.interpretacion + (isFinite(ic[0]) ? ' IC ' + fnum((1 - a) * 100, 0) + ' % de r: [' +
               fnum(ic[0], 3) + '; ' + fnum(ic[1], 3) + '].' : '') +
               ' Recuerda: correlación NO implica causalidad.' };
  }

  /* ------------------------------------------------ Regresión lineal --- */
  function regresion(xs, ys, alfa){
    const X = [], Y = [], a = alfaOk(alfa);
    const A = arr(xs), B = arr(ys);
    const n0 = Math.min(A.length, B.length);
    for (let i = 0; i < n0; i++){
      if (isNum(A[i]) && isNum(B[i])){ X.push(num(A[i])); Y.push(num(B[i])); }
    }
    const n = X.length;
    if (n < 3) return fallo('Se necesitan al menos 3 pares (x, y) para ajustar la regresión.',
      { n: n, pendiente: NaN, intercepto: NaN, r2: NaN, alfa: a });
    const mx = mean(X), my = mean(Y);
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++){
      sxy += (X[i] - mx) * (Y[i] - my);
      sxx += (X[i] - mx) * (X[i] - mx);
      syy += (Y[i] - my) * (Y[i] - my);
    }
    if (!(sxx > 0)) return fallo('La variable X es constante: no se puede ajustar una recta.',
      { n: n, pendiente: NaN, intercepto: NaN, r2: NaN, alfa: a });
    const m = sxy / sxx, b = my - m * mx;
    const pred = x => m * num(x) + b;
    const ajust = X.map(pred);
    const resid = Y.map((y, i) => y - ajust[i]);
    const sse = resid.reduce((s, e) => s + e * e, 0);
    const ssr = syy - sse, sst = syy;
    const gl = n - 2;
    const sYX = Math.sqrt(sse / gl);                       // error estándar de la estimación
    const seM = sYX / Math.sqrt(sxx);
    const seB = sYX * Math.sqrt(1 / n + mx * mx / sxx);
    const t = seM > 0 ? m / seM : (m === 0 ? 0 : Infinity);
    const p = seM > 0 ? tP2(t, gl) : 0;
    const tc = tInv(1 - a / 2, gl);
    const ic = [m - tc * seM, m + tc * seM];
    const r2 = sst > 0 ? ssr / sst : NaN;
    const r = clamp(sxy / Math.sqrt(sxx * syy), -1, 1);
    const F = sse > 0 ? (ssr / 1) / (sse / gl) : Infinity;
    const ecu = 'Y = ' + fnum(m, 4) + ' · X ' + (b >= 0 ? '+ ' : '− ') + fnum(Math.abs(b), 4);
    const d = decidir(p, a,
      'la pendiente es significativa: X SÍ predice a Y.',
      'la pendiente no es significativa: X no aporta información para predecir a Y.');
    return { prueba: 'Regresión lineal simple', n: n,
             pendiente: m, intercepto: b, m: m, b: b, r: r, r2: r2,
             ecuacion: ecu, errorEstandar: sYX, sePendiente: seM, seIntercepto: seB,
             estadistico: t, gl: gl, p: p, tCritico: tc, ic: ic, F: F,
             ss: { regresion: ssr, error: sse, total: sst },
             ajustados: ajust, residuos: resid,
             prediccion: pred, predecir: pred,
             alfa: a, rechaza: d.rechaza, decision: d.decision,
             interpretacion: 'Ecuación: ' + ecu + '. R² = ' + pct1(r2 * 100) +
               ' de la variación de Y se explica por X; error estándar = ' + fnum(sYX, 4) +
               '. Por cada unidad que aumenta X, Y cambia en ' + fnum(m, 4) + '. ' + d.interpretacion };
  }

  /* ======================================================================
     3. CONSTANTES AIAG / ASTM PARA CARTAS DE CONTROL  (n = 2 … 25)
     ==================================================================== */
  const CTE = (function(){
    /*        n:   d2,     d3,     A2,    A3,    c4,     B3,    B4,    D3,    D4 */
    const T = {
      2:  [1.128, 0.853, 1.880, 2.659, 0.7979, 0.000, 3.267, 0.000, 3.267],
      3:  [1.693, 0.888, 1.023, 1.954, 0.8862, 0.000, 2.568, 0.000, 2.574],
      4:  [2.059, 0.880, 0.729, 1.628, 0.9213, 0.000, 2.266, 0.000, 2.282],
      5:  [2.326, 0.864, 0.577, 1.427, 0.9400, 0.000, 2.089, 0.000, 2.114],
      6:  [2.534, 0.848, 0.483, 1.287, 0.9515, 0.030, 1.970, 0.000, 2.004],
      7:  [2.704, 0.833, 0.419, 1.182, 0.9594, 0.118, 1.882, 0.076, 1.924],
      8:  [2.847, 0.820, 0.373, 1.099, 0.9650, 0.185, 1.815, 0.136, 1.864],
      9:  [2.970, 0.808, 0.337, 1.032, 0.9693, 0.239, 1.761, 0.184, 1.816],
      10: [3.078, 0.797, 0.308, 0.975, 0.9727, 0.284, 1.716, 0.223, 1.777],
      11: [3.173, 0.787, 0.285, 0.927, 0.9754, 0.321, 1.679, 0.256, 1.744],
      12: [3.258, 0.778, 0.266, 0.886, 0.9776, 0.354, 1.646, 0.283, 1.717],
      13: [3.336, 0.770, 0.249, 0.850, 0.9794, 0.382, 1.618, 0.307, 1.693],
      14: [3.407, 0.763, 0.235, 0.817, 0.9810, 0.406, 1.594, 0.328, 1.672],
      15: [3.472, 0.756, 0.223, 0.789, 0.9823, 0.428, 1.572, 0.347, 1.653],
      16: [3.532, 0.750, 0.212, 0.763, 0.9835, 0.448, 1.552, 0.363, 1.637],
      17: [3.588, 0.744, 0.203, 0.739, 0.9845, 0.466, 1.534, 0.378, 1.622],
      18: [3.640, 0.739, 0.194, 0.718, 0.9854, 0.482, 1.518, 0.391, 1.608],
      19: [3.689, 0.734, 0.187, 0.698, 0.9862, 0.497, 1.503, 0.403, 1.597],
      20: [3.735, 0.729, 0.180, 0.680, 0.9869, 0.510, 1.490, 0.415, 1.585],
      21: [3.778, 0.724, 0.173, 0.663, 0.9876, 0.523, 1.477, 0.425, 1.575],
      22: [3.819, 0.720, 0.167, 0.647, 0.9882, 0.534, 1.466, 0.434, 1.566],
      23: [3.858, 0.716, 0.162, 0.633, 0.9887, 0.545, 1.455, 0.443, 1.557],
      24: [3.895, 0.712, 0.157, 0.619, 0.9892, 0.555, 1.445, 0.451, 1.548],
      25: [3.931, 0.708, 0.153, 0.606, 0.9896, 0.565, 1.435, 0.459, 1.541]
    };
    const K = ['d2', 'd3', 'A2', 'A3', 'c4', 'B3', 'B4', 'D3', 'D4'];
    const O = {}; K.forEach(k => O[k] = {});
    for (const n in T) K.forEach((k, i) => { O[k][n] = T[n][i]; });
    /** c4 exacto para n > 25 (fórmula con función gamma) */
    O.c4de = n => (n >= 2 && n <= 25) ? O.c4[n]
      : (n > 25 ? Math.sqrt(2 / (n - 1)) * Math.exp(lnGamma(n / 2) - lnGamma((n - 1) / 2)) : NaN);
    /** d2 (se satura en n = 25: más allá conviene la carta X̄-S) */
    O.d2de = n => O.d2[clamp(Math.round(n), 2, 25)];
    O.d3de = n => O.d3[clamp(Math.round(n), 2, 25)];
    O.get  = (k, n) => O[k][clamp(Math.round(n), 2, 25)];
    O.tabla = T;
    return O;
  })();

  /* ======================================================================
     4. CAPACIDAD DEL PROCESO
     ==================================================================== */
  function capacidad(datos, lsl, usl, target, subgrupo){
    const LSL = nulo(lsl), USL = nulo(usl), T = nulo(target);
    let subs = null, V;
    if (Array.isArray(datos) && datos.length && Array.isArray(datos[0])){
      subs = datos.map(serie).filter(x => x.length >= 2);
      V = [].concat.apply([], subs);
    } else {
      V = serie(datos);
      const t = Math.floor(num(subgrupo));
      if (t >= 2 && V.length >= 2 * t){
        subs = [];
        for (let i = 0; i + t <= V.length; i += t) subs.push(V.slice(i, i + t));
      }
    }
    const n = V.length;
    if (n < 2) return fallo('Se necesitan al menos 2 datos para estudiar la capacidad.', { n: n });
    if (LSL === null && USL === null)
      return fallo('Define al menos un límite de especificación (LSL o USL).', { n: n });
    if (LSL !== null && USL !== null && LSL >= USL)
      return fallo('El límite inferior (LSL) debe ser menor que el superior (USL).', { n: n });

    const media = mean(V);
    const sLargo = sd(V);                                  // variación total / a largo plazo
    let sCorto, metodoCorto, tam = 0;
    if (subs && subs.length >= 2){
      tam = Math.round(mean(subs.map(s => s.length)));
      if (tam <= 10){
        const rb = mean(subs.map(s => rango(s)));
        sCorto = rb / CTE.d2de(tam);
        metodoCorto = 'R̄/d₂ con subgrupos de n = ' + tam;
      } else {
        const sb = mean(subs.map(s => sd(s)));
        sCorto = sb / CTE.c4de(tam);
        metodoCorto = 'S̄/c₄ con subgrupos de n = ' + tam;
      }
    } else {
      const MR = [];
      for (let i = 1; i < n; i++) MR.push(Math.abs(V[i] - V[i - 1]));
      const mrb = MR.length ? mean(MR) : NaN;
      sCorto = mrb / 1.128;                                // d2 con n = 2
      metodoCorto = 'R̄móvil/d₂ (datos individuales)';
    }
    if (!(sCorto > 0)) sCorto = sLargo;
    if (!(sLargo > 0))
      return fallo('Todos los datos son iguales: no hay variación que evaluar.',
        { n: n, media: media, sLargo: 0, sCorto: 0 });

    const t3c = 3 * sCorto, t3l = 3 * sLargo;
    const Cp  = (LSL !== null && USL !== null) ? (USL - LSL) / (2 * t3c) : NaN;
    const Cpi = LSL !== null ? (media - LSL) / t3c : NaN;
    const Cps = USL !== null ? (USL - media) / t3c : NaN;
    const Cpk = Math.min(isFinite(Cpi) ? Cpi : Infinity, isFinite(Cps) ? Cps : Infinity);
    const Pp  = (LSL !== null && USL !== null) ? (USL - LSL) / (2 * t3l) : NaN;
    const Ppi = LSL !== null ? (media - LSL) / t3l : NaN;
    const Pps = USL !== null ? (USL - media) / t3l : NaN;
    const Ppk = Math.min(isFinite(Ppi) ? Ppi : Infinity, isFinite(Pps) ? Pps : Infinity);
    const Cpm = (LSL !== null && USL !== null && T !== null)
      ? (USL - LSL) / (6 * Math.sqrt(sLargo * sLargo + Math.pow(media - T, 2))) : NaN;
    const k = (LSL !== null && USL !== null)
      ? Math.abs(media - (LSL + USL) / 2) / ((USL - LSL) / 2) : NaN;   // descentrado

    const colas = (s) => {
      const inf = LSL !== null ? normCDF((LSL - media) / s) : 0;
      const sup = USL !== null ? normSF((USL - media) / s) : 0;
      return { inf: inf, sup: sup, tot: clamp(inf + sup, 0, 1) };
    };
    const cD = colas(sCorto), cF = colas(sLargo);
    const ppmDentro = cD.tot * 1e6, ppmFuera = cF.tot * 1e6;
    let fueraObs = 0;
    V.forEach(v => { if ((LSL !== null && v < LSL) || (USL !== null && v > USL)) fueraObs++; });
    const ppmObservado = fueraObs / n * 1e6;
    /* Φ⁻¹(1−p) = −Φ⁻¹(p): así no se pierde precisión cuando p es diminuto */
    const Zbench = pTot => clamp(pTot <= 0 ? 6 : (pTot >= 1 ? -6 : -normInv(pTot)), -6, 6);
    const Zcorto = Zbench(cD.tot), Zlargo = Zbench(cF.tot);
    const sigmaNivel = clamp(Zlargo + 1.5, 0, 6);

    const cpkTxt = isFinite(Cpk) ? fnum(Cpk, 2) : '—';
    let vered, tono;
    if (!isFinite(Cpk)) { vered = 'sin evaluar'; tono = ''; }
    else if (Cpk >= 1.67){ vered = 'EXCELENTE (clase mundial)'; tono = 'ok'; }
    else if (Cpk >= 1.33){ vered = 'CAPAZ'; tono = 'ok'; }
    else if (Cpk >= 1.00){ vered = 'MARGINALMENTE CAPAZ'; tono = 'warn'; }
    else                 { vered = 'NO CAPAZ'; tono = 'bad'; }
    let centro = '';
    if (isFinite(Cp) && isFinite(Cpk)){
      if (Cp - Cpk > 0.15)
        centro = ' El proceso está DESCENTRADO (Cp = ' + fnum(Cp, 2) + ' > Cpk = ' + cpkTxt +
                 '): centrar la media daría una mejora inmediata sin reducir la variación.';
      else centro = ' El proceso está bien CENTRADO (Cp ≈ Cpk).';
    }
    const interpretacion = 'Cpk = ' + cpkTxt + ' → proceso ' + vered + '. ' +
      'Se esperan ' + fnum(ppmFuera, 0) + ' PPM fuera de especificación a largo plazo ' +
      '(' + fnum(ppmDentro, 0) + ' PPM a corto plazo); nivel sigma = ' + fnum(sigmaNivel, 2) + ' σ.' +
      centro + ' Criterio: Cpk ≥ 1,33 capaz · 1,00–1,33 marginal · < 1,00 no capaz.';

    return { n: n, media: media, mediana: med(V), min: Math.min.apply(null, V), max: Math.max.apply(null, V),
             lsl: LSL, usl: USL, target: T, subgrupo: tam,
             sLargo: sLargo, sCorto: sCorto, metodoCorto: metodoCorto,
             Cp: Cp, Cpk: Cpk, Cpi: Cpi, Cps: Cps,
             Pp: Pp, Ppk: Ppk, Ppi: Ppi, Pps: Pps, Cpm: Cpm, k: k,
             Zcorto: Zcorto, Zlargo: Zlargo,
             ppmDentro: ppmDentro, ppmFuera: ppmFuera, ppmObservado: ppmObservado,
             rendimiento: 1 - cF.tot, sigmaNivel: sigmaNivel, veredicto: vered, tono: tono,
             interpretacion: interpretacion };
  }

  /* ======================================================================
     5. MSA · GR&R
     ==================================================================== */
  function grrANOVA(datos, nPartes, nOperadores, nReplicas, tolerancia){
    const D = [];
    arr(datos).forEach(r => {
      if (!r || typeof r !== 'object') return;
      const v = r.valor !== undefined ? r.valor : (r.v !== undefined ? r.v : r.medida);
      if (!isNum(v)) return;
      const pz = r.parte !== undefined ? r.parte : (r.pieza !== undefined ? r.pieza : r.item);
      const op = r.operador !== undefined ? r.operador : (r.evaluador !== undefined ? r.evaluador : r.op);
      const rp = r.replica !== undefined ? r.replica : (r.ensayo !== undefined ? r.ensayo : r.rep);
      if (pz === undefined || pz === null || pz === '') return;
      D.push({ p: String(pz), o: String(op === undefined || op === null || op === '' ? 'A' : op),
               r: String(rp === undefined || rp === null || rp === '' ? '1' : rp), v: num(v) });
    });
    if (D.length < 4) return fallo('Registra las mediciones (parte, operador, réplica, valor) del estudio GR&R.');

    const PS = [], OS = [];
    D.forEach(x => { if (PS.indexOf(x.p) < 0) PS.push(x.p); if (OS.indexOf(x.o) < 0) OS.push(x.o); });
    const P = num(nPartes) >= 2 ? Math.min(PS.length, Math.round(num(nPartes))) : PS.length;
    const O = num(nOperadores) >= 1 ? Math.min(OS.length, Math.round(num(nOperadores))) : OS.length;
    const partes = PS.slice(0, P), opers = OS.slice(0, O);

    /* celdas parte × operador */
    const cel = {}, key = (p, o) => p + SEP + o;
    D.forEach(x => {
      if (partes.indexOf(x.p) < 0 || opers.indexOf(x.o) < 0) return;
      (cel[key(x.p, x.o)] = cel[key(x.p, x.o)] || []).push(x.v);
    });
    let R = 0, faltan = 0;
    partes.forEach(p => opers.forEach(o => {
      const c = cel[key(p, o)];
      if (!c || !c.length) faltan++;
      else R = Math.max(R, c.length);
    }));
    if (num(nReplicas) >= 1) R = Math.min(R, Math.max(1, Math.round(num(nReplicas))));
    if (faltan) return fallo('El estudio está incompleto: faltan ' + faltan +
      ' combinación(es) parte × operador. El GR&R por ANOVA exige un diseño balanceado.');
    if (P < 2) return fallo('Se necesitan al menos 2 partes (idealmente 10) para el estudio GR&R.');
    if (R < 2) return fallo('Se necesitan al menos 2 réplicas por parte y operador para separar la repetibilidad.');

    const todos = [];
    partes.forEach(p => opers.forEach(o => { cel[key(p, o)].slice(0, R).forEach(v => todos.push(v)); }));
    const N = P * O * R, gm = mean(todos);
    const mediaCel = {}, mediaParte = {}, mediaOper = {};
    partes.forEach(p => {
      const acc = [];
      opers.forEach(o => {
        const c = cel[key(p, o)].slice(0, R);
        mediaCel[key(p, o)] = mean(c);
        c.forEach(v => acc.push(v));
      });
      mediaParte[p] = mean(acc);
    });
    opers.forEach(o => {
      const acc = [];
      partes.forEach(p => cel[key(p, o)].slice(0, R).forEach(v => acc.push(v)));
      mediaOper[o] = mean(acc);
    });

    let ssP = 0, ssO = 0, ssPO = 0, ssE = 0;
    partes.forEach(p => { ssP += O * R * Math.pow(mediaParte[p] - gm, 2); });
    opers.forEach(o => { ssO += P * R * Math.pow(mediaOper[o] - gm, 2); });
    partes.forEach(p => opers.forEach(o => {
      const mc = mediaCel[key(p, o)];
      ssPO += R * Math.pow(mc - mediaParte[p] - mediaOper[o] + gm, 2);
      cel[key(p, o)].slice(0, R).forEach(v => { ssE += (v - mc) * (v - mc); });
    }));
    const sst = ssP + ssO + ssPO + ssE;
    const glP = P - 1, glO = O - 1, glPO = glP * glO, glE = P * O * (R - 1);
    const msP = glP > 0 ? ssP / glP : NaN;
    const msO = glO > 0 ? ssO / glO : NaN;
    const msPO = glPO > 0 ? ssPO / glPO : NaN;
    const msE = glE > 0 ? ssE / glE : NaN;

    let fPO = NaN, pPO = NaN;
    if (glPO > 0 && msE > 0){ fPO = msPO / msE; pPO = fSF(fPO, glPO, glE); }
    const agrupa = !(glPO > 0) || !(pPO >= 0) || pPO > 0.25;    // criterio AIAG (α = 0,25)

    let vRep, vOper, vInter, vPart, msErr, glErr, ssErr;
    if (agrupa){
      ssErr = ssE + (glPO > 0 ? ssPO : 0);
      glErr = glE + (glPO > 0 ? glPO : 0);
      msErr = glErr > 0 ? ssErr / glErr : NaN;
      vRep  = Math.max(0, msErr);
      vOper = glO > 0 ? Math.max(0, (msO - msErr) / (P * R)) : 0;
      vInter = 0;
      vPart = Math.max(0, (msP - msErr) / (O * R));
    } else {
      ssErr = ssE; glErr = glE; msErr = msE;
      vRep  = Math.max(0, msE);
      vOper = glO > 0 ? Math.max(0, (msO - msPO) / (P * R)) : 0;
      vInter = Math.max(0, (msPO - msE) / R);
      vPart = Math.max(0, (msP - msPO) / (O * R));
    }
    const vAV = vOper + vInter;
    const vGRR = vRep + vAV;
    const vTV = vGRR + vPart;

    const S = v => Math.sqrt(Math.max(0, v));
    const sdRep = S(vRep), sdOper = S(vOper), sdInter = S(vInter),
          sdAV = S(vAV), sdGRR = S(vGRR), sdPV = S(vPart), sdTV = S(vTV);
    const K6 = 6;                                           // 6σ (AIAG 4.ª edición)
    const est = s => (sdTV > 0 ? 100 * s / sdTV : NaN);
    const con = v => (vTV > 0 ? 100 * v / vTV : NaN);
    const TOL = num(tolerancia);
    const tol = s => (TOL > 0 ? 100 * K6 * s / TOL : NaN);

    const pctContribucion = { repetibilidad: con(vRep), reproducibilidad: con(vAV),
                              operador: con(vOper), interaccion: con(vInter),
                              grr: con(vGRR), parte: con(vPart), total: vTV > 0 ? 100 : NaN };
    const pctEstudio = { repetibilidad: est(sdRep), reproducibilidad: est(sdAV),
                         operador: est(sdOper), interaccion: est(sdInter),
                         grr: est(sdGRR), parte: est(sdPV), total: sdTV > 0 ? 100 : NaN };
    const pctTolerancia = { repetibilidad: tol(sdRep), reproducibilidad: tol(sdAV),
                            operador: tol(sdOper), interaccion: tol(sdInter),
                            grr: tol(sdGRR), parte: tol(sdPV),
                            total: TOL > 0 ? tol(sdTV) : NaN };
    const ndc = sdGRR > 0 ? Math.floor(1.41 * sdPV / sdGRR) : 0;

    const pctRef = (TOL > 0 && isFinite(pctTolerancia.grr)) ? pctTolerancia.grr : pctEstudio.grr;
    const base = (TOL > 0 && isFinite(pctTolerancia.grr)) ? '% de la tolerancia' : '% de la variación del estudio';
    let vered, tono;
    if (!isFinite(pctRef)){ vered = 'SIN EVALUAR'; tono = ''; }
    else if (pctRef < 10){ vered = 'ACEPTABLE'; tono = 'ok'; }
    else if (pctRef <= 30){ vered = 'MARGINAL (aceptable según costo, criticidad y aplicación)'; tono = 'warn'; }
    else { vered = 'INACEPTABLE'; tono = 'bad'; }
    const ndcOk = ndc >= 5;

    const fila = (f, gl, ss, ms, F, p) => ({ fuente: f, gl: gl, ss: ss, ms: ms, f: F, p: p });
    const tablaAnova = [
      fila('Parte (pieza)', glP, ssP, msP,
           agrupa ? (msErr > 0 ? msP / msErr : NaN) : (msPO > 0 ? msP / msPO : NaN),
           agrupa ? (msErr > 0 ? fSF(msP / msErr, glP, glErr) : NaN)
                  : (msPO > 0 ? fSF(msP / msPO, glP, glPO) : NaN)),
      fila('Operador (evaluador)', glO, ssO, msO,
           glO > 0 ? (agrupa ? (msErr > 0 ? msO / msErr : NaN) : (msPO > 0 ? msO / msPO : NaN)) : NaN,
           glO > 0 ? (agrupa ? (msErr > 0 ? fSF(msO / msErr, glO, glErr) : NaN)
                             : (msPO > 0 ? fSF(msO / msPO, glO, glPO) : NaN)) : NaN),
      fila('Parte × Operador', glPO, ssPO, msPO, fPO, pPO),
      fila('Repetibilidad (error)', glErr, ssErr, msErr, NaN, NaN),
      fila('Total', N - 1, sst, NaN, NaN, NaN)
    ];
    if (agrupa && glPO > 0) tablaAnova[2].nota = 'agrupada con el error (p > 0,25)';

    const interpretacion = '%GR&R = ' + fnum(pctRef, 2) + ' ' + base + ' → sistema de medición ' +
      vered + '. ndc = ' + ndc + ' categoría(s) distinguible(s) ' +
      (ndcOk ? '(≥ 5: correcto)' : '(< 5: el sistema NO distingue bien entre las piezas)') + '. ' +
      'La mayor fuente de error es ' +
      (sdRep >= sdAV ? 'la REPETIBILIDAD (el equipo/instrumento)' : 'la REPRODUCIBILIDAD (los operadores)') +
      '. Criterio AIAG: < 10 % aceptable · 10–30 % marginal · > 30 % inaceptable.';

    return { prueba: 'GR&R por ANOVA (MSA · AIAG)',
             nPartes: P, nOperadores: O, nReplicas: R, N: N, media: gm, tolerancia: TOL > 0 ? TOL : NaN,
             modelo: agrupa ? 'sin interacción (agrupada con el error)' : 'con interacción parte × operador',
             varianzas: { repetibilidad: vRep, operador: vOper, interaccion: vInter,
                          reproducibilidad: vAV, grr: vGRR, parte: vPart, total: vTV },
             repetibilidad: sdRep, EV: sdRep,
             reproducibilidad: sdAV, AV: sdAV,
             interaccion: sdInter, grr: sdGRR, GRR: sdGRR,
             partToPart: sdPV, PV: sdPV, total: sdTV, TV: sdTV,
             variacion6s: { EV: K6 * sdRep, AV: K6 * sdAV, GRR: K6 * sdGRR,
                            PV: K6 * sdPV, TV: K6 * sdTV },
             pctContribucion: pctContribucion, pctEstudio: pctEstudio, pctTolerancia: pctTolerancia,
             ndc: ndc, ndcOk: ndcOk, tablaAnova: tablaAnova,
             estadistico: pctRef, gl: [glP, glO, glPO, glErr], p: pPO,
             veredicto: vered, tono: tono, decision: 'Sistema de medición ' + vered,
             interpretacion: interpretacion };
  }

  /* ------------------------------------------------ GR&R por atributos - */
  function grrAtributos(datos){
    const D = [];
    arr(datos).forEach(r => {
      if (!r || typeof r !== 'object') return;
      const pz = r.parte !== undefined ? r.parte : (r.pieza !== undefined ? r.pieza : r.item);
      const ev = r.evaluador !== undefined ? r.evaluador : (r.operador !== undefined ? r.operador : r.op);
      const en = r.ensayo !== undefined ? r.ensayo : (r.replica !== undefined ? r.replica : r.rep);
      const rs = r.resultado !== undefined ? r.resultado : (r.valor !== undefined ? r.valor : r.v);
      const st = r.estandar !== undefined ? r.estandar : (r.patron !== undefined ? r.patron : r.ref);
      if (pz === undefined || pz === null || pz === '' || rs === undefined || rs === null || rs === '') return;
      D.push({ p: String(pz), e: String(ev === undefined || ev === null || ev === '' ? 'A' : ev),
               t: String(en === undefined || en === null || en === '' ? '1' : en),
               r: String(rs).trim().toUpperCase(),
               s: (st === undefined || st === null || st === '') ? null : String(st).trim().toUpperCase() });
    });
    if (D.length < 4) return fallo('Registra las evaluaciones (parte, evaluador, ensayo, resultado, estándar).');

    const partes = [], evs = [], cats = [];
    D.forEach(x => {
      if (partes.indexOf(x.p) < 0) partes.push(x.p);
      if (evs.indexOf(x.e) < 0) evs.push(x.e);
      if (cats.indexOf(x.r) < 0) cats.push(x.r);
      if (x.s && cats.indexOf(x.s) < 0) cats.push(x.s);
    });
    const std = {};
    D.forEach(x => { if (x.s) std[x.p] = x.s; });
    const conStd = partes.filter(p => std[p] !== undefined);

    /* ---- concordancia por evaluador ---- */
    const porEvaluador = evs.map(e => {
      let dentro = 0, vsStd = 0, nP = 0, nStd = 0;
      const M = {};                                        // matriz evaluador × estándar
      partes.forEach(p => {
        const rr = D.filter(x => x.e === e && x.p === p).map(x => x.r);
        if (!rr.length) return;
        nP++;
        const igual = rr.every(v => v === rr[0]);
        if (igual) dentro++;
        if (std[p] !== undefined){
          nStd++;
          if (igual && rr[0] === std[p]) vsStd++;
          rr.forEach(v => { const k = v + SEP + std[p]; M[k] = (M[k] || 0) + 1; });
        }
      });
      /* kappa de Cohen evaluador vs. estándar */
      let tot = 0, ac = 0;
      const fE = {}, fS = {};
      for (const k in M){
        const par = k.split(SEP);
        tot += M[k];
        if (par[0] === par[1]) ac += M[k];
        fE[par[0]] = (fE[par[0]] || 0) + M[k];
        fS[par[1]] = (fS[par[1]] || 0) + M[k];
      }
      let pe = 0;
      if (tot > 0) cats.forEach(c => { pe += ((fE[c] || 0) / tot) * ((fS[c] || 0) / tot); });
      const po = tot > 0 ? ac / tot : NaN;
      const kappa = (tot > 0 && pe < 1) ? (po - pe) / (1 - pe) : NaN;
      return { evaluador: e, nPartes: nP, dentro: nP ? dentro / nP : NaN,
               vsEstandar: nStd ? vsStd / nStd : NaN, kappa: kappa,
               aciertos: vsStd, evaluadas: nStd, consistentes: dentro };
    });

    /* ---- concordancia entre evaluadores y contra el estándar ---- */
    let entre = 0, todosStd = 0, nEval = 0, nEvalStd = 0;
    partes.forEach(p => {
      const rr = D.filter(x => x.p === p).map(x => x.r);
      if (!rr.length) return;
      nEval++;
      const igual = rr.every(v => v === rr[0]);
      if (igual) entre++;
      if (std[p] !== undefined){
        nEvalStd++;
        if (igual && rr[0] === std[p]) todosStd++;
      }
    });

    /* ---- kappa de Fleiss entre evaluadores ---- */
    let kappaFleiss = NaN, notaFleiss = '';
    (function(){
      const conteos = [], nn = [];
      partes.forEach(p => {
        const rr = D.filter(x => x.p === p).map(x => x.r);
        if (rr.length < 2) return;
        const c = cats.map(cc => rr.filter(v => v === cc).length);
        conteos.push(c); nn.push(rr.length);
      });
      if (conteos.length < 2){ notaFleiss = 'Muy pocas piezas con evaluaciones repetidas.'; return; }
      const n0 = nn[0];
      if (!nn.every(x => x === n0)){
        notaFleiss = 'El número de evaluaciones por pieza no es constante: kappa de Fleiss aproximado.';
      }
      const Ni = conteos.length;
      let Pbar = 0;
      const pj = cats.map(() => 0);
      let tot = 0;
      conteos.forEach((c, i) => {
        const n = nn[i];
        if (n < 2) return;
        let s = 0;
        c.forEach((x, j) => { s += x * x; pj[j] += x; });
        tot += n;
        Pbar += (s - n) / (n * (n - 1));
      });
      Pbar /= Ni;
      let Pe = 0;
      pj.forEach(x => { const q = tot > 0 ? x / tot : 0; Pe += q * q; });
      kappaFleiss = (Pe < 1) ? (Pbar - Pe) / (1 - Pe) : NaN;
    })();

    const kProm = (function(){
      const ks = porEvaluador.map(x => x.kappa).filter(isFinite);
      return ks.length ? mean(ks) : NaN;
    })();
    const kRef = isFinite(kProm) ? kProm : kappaFleiss;
    const efec = nEvalStd ? todosStd / nEvalStd : NaN;

    let vered, tono;
    if (!isFinite(kRef)){ vered = 'SIN EVALUAR'; tono = ''; }
    else if (kRef >= 0.9){ vered = 'EXCELENTE'; tono = 'ok'; }
    else if (kRef >= 0.75){ vered = 'ACEPTABLE'; tono = 'ok'; }
    else if (kRef >= 0.4){ vered = 'MARGINAL: requiere mejora'; tono = 'warn'; }
    else { vered = 'INACEPTABLE'; tono = 'bad'; }

    const interpretacion = 'Kappa = ' + fnum(kRef, 3) + ' → concordancia ' + vered + '. ' +
      'Concordancia dentro de cada evaluador (repetibilidad): ' +
      pct1(mean(porEvaluador.map(x => x.dentro).filter(isFinite)) * 100) + '; ' +
      'entre evaluadores (reproducibilidad): ' + pct1(entre / Math.max(1, nEval) * 100) + '; ' +
      'contra el estándar (eficacia): ' + pct1(efec * 100) + '. ' +
      'Criterio AIAG: kappa ≥ 0,75 buena concordancia · < 0,40 concordancia pobre; ' +
      'la eficacia contra el estándar debería ser ≥ 90 %.' +
      (notaFleiss ? ' ⚠ ' + notaFleiss : '');

    return { prueba: 'GR&R por atributos (concordancia · kappa)',
             partes: partes.length, evaluadores: evs.length, categorias: cats,
             porEvaluador: porEvaluador,
             entreEvaluadores: nEval ? entre / nEval : NaN,
             todosVsEstandar: efec, eficacia: efec,
             kappaPromedio: kProm, kappaFleiss: kappaFleiss, kappa: kRef,
             estadistico: kRef, gl: NaN, p: NaN,
             veredicto: vered, tono: tono, decision: 'Sistema de medición por atributos ' + vered,
             interpretacion: interpretacion };
  }

  /* ======================================================================
     6. CARTAS DE CONTROL · 8 REGLAS DE NELSON
     ==================================================================== */

  /** Detecta las 8 reglas de Nelson.
   *  cl y sg pueden ser números o arreglos (límites variables: cartas P y U). */
  function nelson(V, cl, sg, lim){
    const n = V.length;
    const C = i => (Array.isArray(cl) ? num(cl[i]) : num(cl));
    const S = i => (Array.isArray(sg) ? num(sg[i]) : num(sg));
    const U = i => (lim && lim.ucl !== undefined) ? (Array.isArray(lim.ucl) ? nulo(lim.ucl[i]) : nulo(lim.ucl)) : null;
    const L = i => (lim && lim.lcl !== undefined) ? (Array.isArray(lim.lcl) ? nulo(lim.lcl[i]) : nulo(lim.lcl)) : null;
    const z = V.map((v, i) => { const s = S(i); return s > 0 ? (v - C(i)) / s : 0; });

    const viol = {};
    const reglas = { n1:0, n2:0, n3:0, n4:0, n5:0, n6:0, n7:0, n8:0 };
    const mark = (i, r) => {
      if (i < 0 || i >= n) return;
      const a = (viol[i] = viol[i] || []);
      if (a.indexOf(r) < 0){ a.push(r); a.sort(); reglas['n' + r]++; }
    };

    /* 1 · un punto más allá de ±3σ (o de los límites reales, si se pasan) */
    for (let i = 0; i < n; i++){
      const u = U(i), l = L(i);
      const fuera = (u !== null || l !== null)
        ? ((u !== null && V[i] > u + 1e-12) || (l !== null && V[i] < l - 1e-12))
        : Math.abs(z[i]) > 3;
      if (fuera) mark(i, 1);
    }
    /* 2 · nueve puntos consecutivos del mismo lado de la línea central */
    let run = 0, lado = 0;
    for (let i = 0; i < n; i++){
      const s = z[i] > 0 ? 1 : (z[i] < 0 ? -1 : 0);
      if (s !== 0 && s === lado) run++; else { lado = s; run = s === 0 ? 0 : 1; }
      if (run >= 9) for (let j = i - 8; j <= i; j++) mark(j, 2);
    }
    /* 3 · seis puntos consecutivos ascendentes o descendentes */
    let inc = 1, dec = 1;
    for (let i = 1; i < n; i++){
      inc = V[i] > V[i - 1] ? inc + 1 : 1;
      dec = V[i] < V[i - 1] ? dec + 1 : 1;
      if (inc >= 6) for (let j = i - 5; j <= i; j++) mark(j, 3);
      if (dec >= 6) for (let j = i - 5; j <= i; j++) mark(j, 3);
    }
    /* 4 · catorce puntos consecutivos alternando arriba y abajo */
    let alt = 1;
    for (let i = 2; i < n; i++){
      const a = V[i] - V[i - 1], b = V[i - 1] - V[i - 2];
      alt = (a * b < 0) ? alt + 1 : 1;
      if (alt >= 13) for (let j = i - 13; j <= i; j++) mark(j, 4);
    }
    /* 5 · dos de tres puntos consecutivos más allá de 2σ, del mismo lado */
    for (let i = 2; i < n; i++){
      [1, -1].forEach(sg2 => {
        const idx = [];
        for (let j = i - 2; j <= i; j++) if (z[j] * sg2 > 2) idx.push(j);
        if (idx.length >= 2) idx.forEach(j => mark(j, 5));
      });
    }
    /* 6 · cuatro de cinco puntos consecutivos más allá de 1σ, del mismo lado */
    for (let i = 4; i < n; i++){
      [1, -1].forEach(sg2 => {
        const idx = [];
        for (let j = i - 4; j <= i; j++) if (z[j] * sg2 > 1) idx.push(j);
        if (idx.length >= 4) idx.forEach(j => mark(j, 6));
      });
    }
    /* 7 · quince puntos consecutivos dentro de ±1σ (variabilidad sospechosamente baja) */
    for (let i = 14; i < n; i++){
      let ok = true;
      for (let j = i - 14; j <= i; j++) if (!(Math.abs(z[j]) < 1)){ ok = false; break; }
      if (ok) for (let j = i - 14; j <= i; j++) mark(j, 7);
    }
    /* 8 · ocho puntos consecutivos fuera de ±1σ, a ambos lados (mezcla) */
    for (let i = 7; i < n; i++){
      let ok = true;
      for (let j = i - 7; j <= i; j++) if (!(Math.abs(z[j]) > 1)){ ok = false; break; }
      if (ok) for (let j = i - 7; j <= i; j++) mark(j, 8);
    }

    const fueraDeControl = Object.keys(viol).map(Number).sort((a, b) => a - b);
    return { viol: viol, reglas: reglas, fueraDeControl: fueraDeControl, z: z };
  }

  const NELSON_TXT = {
    1: '1 punto fuera de los límites de control (±3σ)',
    2: '9 puntos seguidos del mismo lado de la línea central',
    3: '6 puntos seguidos en ascenso o en descenso (tendencia)',
    4: '14 puntos seguidos alternando arriba y abajo',
    5: '2 de 3 puntos seguidos más allá de 2σ del mismo lado',
    6: '4 de 5 puntos seguidos más allá de 1σ del mismo lado',
    7: '15 puntos seguidos dentro de ±1σ (variación demasiado baja)',
    8: '8 puntos seguidos fuera de ±1σ a ambos lados (mezcla de poblaciones)'
  };

  /** Empaqueta la salida común de todas las cartas */
  function cartaOut(tipo, nombre, puntos, cl, ucl, lcl, sg, extra){
    const nn = nelson(puntos, cl, sg, { ucl: ucl, lcl: lcl });
    const activas = [];
    for (let r = 1; r <= 8; r++) if (nn.reglas['n' + r]) activas.push(r);
    const estable = nn.fueraDeControl.length === 0;
    const prom = v => (Array.isArray(v) ? mean(v.filter(isFinite)) : num(v));
    const interpretacion = estable
      ? 'Proceso ESTABLE (bajo control estadístico): los ' + puntos.length +
        ' puntos caen dentro de los límites y no se detecta ningún patrón (reglas de Nelson 1 a 8). ' +
        'Solo actúa causa común: ya puedes evaluar la capacidad y predecir el desempeño.'
      : 'Proceso INESTABLE: ' + nn.fueraDeControl.length + ' de ' + puntos.length +
        ' punto(s) señalan causa especial (regla' + (activas.length > 1 ? 's' : '') + ' ' +
        activas.join(', ') + ' → ' + activas.map(r => NELSON_TXT[r]).join('; ') + '). ' +
        'Investiga y elimina las causas especiales ANTES de calcular la capacidad del proceso.';
    const out = { tipo: tipo, carta: nombre, puntos: puntos,
                  cl: prom(cl), ucl: prom(ucl), lcl: prom(lcl), sigma: prom(sg),
                  cls: Array.isArray(cl) ? cl : null,
                  ucls: Array.isArray(ucl) ? ucl : puntos.map(() => num(ucl)),
                  lcls: Array.isArray(lcl) ? lcl : puntos.map(() => num(lcl)),
                  n: puntos.length, fueraDeControl: nn.fueraDeControl,
                  violaciones: nn.viol, reglas: nn.reglas, reglasActivas: activas,
                  z: nn.z, estable: estable, interpretacion: interpretacion };
    if (extra) for (const k in extra) out[k] = extra[k];
    return out;
  }

  /* ---- I-MR (individuales y rango móvil) ------------------------------ */
  function cartaIMR(datos){
    const V = serie(datos);
    if (V.length < 2) return fallo('Se necesitan al menos 2 observaciones individuales.',
      { puntos: V, estable: false, reglas: {}, fueraDeControl: [] });
    const MR = [];
    for (let i = 1; i < V.length; i++) MR.push(Math.abs(V[i] - V[i - 1]));
    const cl = mean(V), mrb = mean(MR);
    let sg = mrb / CTE.d2[2];
    if (!(sg > 0)) sg = sd(V) || 1e-9;
    const out = cartaOut('I-MR', 'Carta de individuales (X)', V, cl, cl + 3 * sg, cl - 3 * sg, sg);
    const sgMR = CTE.d3[2] * mrb / CTE.d2[2];
    const uclMR = CTE.D4[2] * mrb, lclMR = CTE.D3[2] * mrb;
    out.mr = cartaOut('MR', 'Carta de rango móvil (MR)', MR, mrb, uclMR, lclMR,
                      sgMR > 0 ? sgMR : (mrb / 3 || 1e-9));
    out.rango = out.mr;
    out.mrBarra = mrb;
    out.sigmaCorto = sg;
    out.media = cl;
    if (!out.mr.estable && out.estable)
      out.interpretacion += ' ⚠ La carta de rango móvil (MR) SÍ muestra señales: la variabilidad no es estable.';
    return out;
  }

  /* ---- X̄-R ----------------------------------------------------------- */
  function cartaXbarR(subgrupos){
    const G = grupos(subgrupos);
    if (G.length < 2) return fallo('Se necesitan al menos 2 subgrupos.',
      { puntos: [], estable: false, reglas: {}, fueraDeControl: [] });
    const tam = Math.round(mean(G.map(g => g.n)));
    if (tam < 2) return fallo('Cada subgrupo debe tener al menos 2 mediciones (usa la carta I-MR).',
      { puntos: [], estable: false, reglas: {}, fueraDeControl: [] });
    if (tam > 10) return cartaXbarS(subgrupos);
    const M = G.map(g => g.media), R = G.map(g => rango(g.valores));
    const xbb = mean(M), rb = mean(R);
    const A2 = CTE.get('A2', tam), d2 = CTE.get('d2', tam),
          d3 = CTE.get('d3', tam), D3 = CTE.get('D3', tam), D4 = CTE.get('D4', tam);
    const sgProc = rb / d2;                                  // sigma del proceso
    let sgX = sgProc / Math.sqrt(tam);                       // sigma de las medias
    if (!(sgX > 0)) sgX = 1e-9;
    const out = cartaOut('Xbar-R', 'Carta X̄ (medias)', M, xbb,
                         xbb + A2 * rb, xbb - A2 * rb, sgX);
    let sgR = d3 * rb / d2; if (!(sgR > 0)) sgR = (rb / 3) || 1e-9;
    out.r = cartaOut('R', 'Carta R (rangos)', R, rb, D4 * rb, D3 * rb, sgR);
    out.rango = out.r;
    out.subgrupo = tam; out.rBarra = rb; out.granMedia = xbb;
    out.sigmaCorto = sgProc;
    out.constantes = { A2: A2, d2: d2, d3: d3, D3: D3, D4: D4 };
    if (!out.r.estable && out.estable)
      out.interpretacion += ' ⚠ La carta R SÍ muestra señales: la variabilidad DENTRO de los subgrupos no es estable; estabilízala primero.';
    return out;
  }

  /* ---- X̄-S ----------------------------------------------------------- */
  function cartaXbarS(subgrupos){
    const G = grupos(subgrupos);
    if (G.length < 2) return fallo('Se necesitan al menos 2 subgrupos.',
      { puntos: [], estable: false, reglas: {}, fueraDeControl: [] });
    const tam = Math.round(mean(G.map(g => g.n)));
    if (tam < 2) return fallo('Cada subgrupo debe tener al menos 2 mediciones (usa la carta I-MR).',
      { puntos: [], estable: false, reglas: {}, fueraDeControl: [] });
    const M = G.map(g => g.media), S = G.map(g => sd(g.valores));
    const xbb = mean(M), sb = mean(S);
    const A3 = CTE.get('A3', tam), c4 = CTE.c4de(tam),
          B3 = CTE.get('B3', tam), B4 = CTE.get('B4', tam);
    const sgProc = sb / c4;
    let sgX = sgProc / Math.sqrt(tam); if (!(sgX > 0)) sgX = 1e-9;
    const out = cartaOut('Xbar-S', 'Carta X̄ (medias)', M, xbb,
                         xbb + A3 * sb, xbb - A3 * sb, sgX);
    let sgS = sgProc * Math.sqrt(1 - c4 * c4); if (!(sgS > 0)) sgS = (sb / 3) || 1e-9;
    out.s = cartaOut('S', 'Carta S (desviaciones)', S, sb, B4 * sb, B3 * sb, sgS);
    out.rango = out.s;
    out.subgrupo = tam; out.sBarra = sb; out.granMedia = xbb;
    out.sigmaCorto = sgProc;
    out.constantes = { A3: A3, c4: c4, B3: B3, B4: B4 };
    if (!out.s.estable && out.estable)
      out.interpretacion += ' ⚠ La carta S SÍ muestra señales: la variabilidad dentro de los subgrupos no es estable.';
    return out;
  }

  /* ---- P (proporción de defectuosos, n variable) ---------------------- */
  function cartaP(defectuosos, tamanos){
    const D = serie(defectuosos);
    let N = serie(tamanos);
    if (N.length === 1 && D.length > 1) N = D.map(() => N[0]);
    if (!N.length && isNum(tamanos)) N = D.map(() => num(tamanos));
    if (D.length < 2 || N.length < D.length)
      return fallo('Registra el número de defectuosos y el tamaño de muestra de cada periodo.',
        { puntos: [], estable: false, reglas: {}, fueraDeControl: [] });
    const P = D.map((d, i) => (N[i] > 0 ? d / N[i] : NaN));
    if (P.some(x => !isFinite(x)))
      return fallo('Hay periodos con tamaño de muestra igual a cero.',
        { puntos: P, estable: false, reglas: {}, fueraDeControl: [] });
    const pb = suma(D) / suma(N);
    const sg = N.map(n => Math.sqrt(Math.max(0, pb * (1 - pb) / n)));
    const ucl = sg.map(s => Math.min(1, pb + 3 * s));
    const lcl = sg.map(s => Math.max(0, pb - 3 * s));
    const out = cartaOut('P', 'Carta P (proporción de defectuosos)', P, pb, ucl, lcl, sg);
    out.pBarra = pb; out.defectuosos = D; out.tamanos = N;
    out.limitesVariables = N.some(x => x !== N[0]);
    out.interpretacion += ' p̄ = ' + fnum(pb * 100, 2) + ' % de unidades defectuosas.' +
      (out.limitesVariables ? ' Los límites son escalonados porque el tamaño de muestra cambia.' : '');
    return out;
  }

  /* ---- NP (número de defectuosos, n constante) ------------------------ */
  function cartaNP(d, n){
    const D = serie(d);
    let N = isNum(n) ? num(n) : NaN;
    if (!isFinite(N)){ const a = serie(n); N = a.length ? mean(a) : NaN; }
    if (D.length < 2 || !(N > 0))
      return fallo('Registra el número de defectuosos y un tamaño de muestra constante n > 0.',
        { puntos: D, estable: false, reglas: {}, fueraDeControl: [] });
    const npb = mean(D), pb = npb / N;
    let sg = Math.sqrt(Math.max(0, npb * (1 - pb)));
    if (!(sg > 0)) sg = 1e-9;
    const out = cartaOut('NP', 'Carta NP (número de defectuosos)', D, npb,
                         Math.min(N, npb + 3 * sg), Math.max(0, npb - 3 * sg), sg);
    out.npBarra = npb; out.pBarra = pb; out.tamano = N;
    out.interpretacion += ' Promedio: ' + fnum(npb, 2) + ' defectuosos por muestra de ' +
      fnum(N, 0) + ' unidades (p̄ = ' + fnum(pb * 100, 2) + ' %).';
    return out;
  }

  /* ---- C (número de defectos, área constante) ------------------------- */
  function cartaC(c){
    const C = serie(c);
    if (C.length < 2)
      return fallo('Registra el número de defectos de al menos 2 unidades de inspección.',
        { puntos: C, estable: false, reglas: {}, fueraDeControl: [] });
    const cb = mean(C);
    let sg = Math.sqrt(Math.max(0, cb));
    if (!(sg > 0)) sg = 1e-9;
    const out = cartaOut('C', 'Carta C (defectos por unidad de inspección)', C, cb,
                         cb + 3 * sg, Math.max(0, cb - 3 * sg), sg);
    out.cBarra = cb;
    out.interpretacion += ' c̄ = ' + fnum(cb, 2) + ' defectos por unidad de inspección.';
    return out;
  }

  /* ---- U (defectos por unidad, área variable) ------------------------- */
  function cartaU(c, n){
    const C = serie(c);
    let N = serie(n);
    if (N.length === 1 && C.length > 1) N = C.map(() => N[0]);
    if (!N.length && isNum(n)) N = C.map(() => num(n));
    if (C.length < 2 || N.length < C.length)
      return fallo('Registra los defectos y el tamaño (área, unidades u horas) de cada muestra.',
        { puntos: [], estable: false, reglas: {}, fueraDeControl: [] });
    if (N.some(x => !(x > 0)))
      return fallo('Hay muestras con tamaño de inspección igual a cero.',
        { puntos: [], estable: false, reglas: {}, fueraDeControl: [] });
    const U = C.map((x, i) => x / N[i]);
    const ub = suma(C) / suma(N);
    const sg = N.map(x => Math.sqrt(Math.max(0, ub / x)));
    const ucl = sg.map(s => ub + 3 * s);
    const lcl = sg.map(s => Math.max(0, ub - 3 * s));
    const out = cartaOut('U', 'Carta U (defectos por unidad)', U, ub, ucl, lcl, sg);
    out.uBarra = ub; out.defectos = C; out.tamanos = N;
    out.limitesVariables = N.some(x => x !== N[0]);
    out.interpretacion += ' ū = ' + fnum(ub, 3) + ' defectos por unidad.' +
      (out.limitesVariables ? ' Los límites son escalonados porque el tamaño inspeccionado cambia.' : '');
    return out;
  }

  /* ======================================================================
     7. API PÚBLICA
     ==================================================================== */
  return {
    /* distribuciones */
    gamma: gamma, lnGamma: lnGamma, betainc: betainc,
    gammaP: gammaP, gammaQ: gammaQ,
    normCDF: normCDF, normInv: normInv, normPDF: normPDF,
    tCDF: tCDF, tInv: tInv, tSF: tSF,
    fCDF: fCDF, fInv: fInv, fSF: fSF,
    chi2CDF: chi2CDF, chi2Inv: chi2Inv, chi2SF: chi2SF,
    normSF: normSF,
    /* pruebas de hipótesis */
    tTest1: tTest1, tTest2: tTest2, tTestPar: tTestPar,
    anova1: anova1, kruskal: kruskal, moodMedian: moodMedian,
    fTest2: fTest2, levene: levene,
    prop1: prop1, prop2: prop2, chi2Indep: chi2Indep,
    normalidad: normalidad, correl: correl, regresion: regresion,
    /* capacidad */
    capacidad: capacidad,
    /* MSA */
    grrANOVA: grrANOVA, grrAtributos: grrAtributos,
    /* cartas de control */
    cartaIMR: cartaIMR, cartaXbarR: cartaXbarR, cartaXbarS: cartaXbarS,
    cartaP: cartaP, cartaNP: cartaNP, cartaC: cartaC, cartaU: cartaU,
    nelson: nelson,
    /* utilidades y constantes */
    CTE: CTE, NELSON: NELSON_TXT,
    serie: serie, grupos: grupos, quantil: quantil, rangos: rangosDe,
    media: mean, desv: sd, varianza: varS, fmtP: fp
  };
})();
