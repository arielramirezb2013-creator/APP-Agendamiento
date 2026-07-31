/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   SPECS EXTRA — FASE MEDIR   (herramientas del MANUAL que NO están en el Excel)
   ---------------------------------------------------------------------------
   Fuente: _dump/MANUAL_texto.txt · páginas 100 a 160
     p100-109  Evaluación del sistema de medición MSA · GR&R por variables
     p110-121  GR&R por atributos (concordancia · kappa)
     p124-133  Histograma, gráfica de caja y diagrama de dispersión
     p135-136  Resumen gráfico (informe estilo Minitab)
     p145-158  Análisis de capacidad del proceso (normal y no normal)

   Estas herramientas NO existen como hoja en los cinco libros de Excel
   originales: viven sólo en la app y en el libro consolidado, por eso van
   marcadas con `extra:true` y SIN mapeo `xl`.

   Todo el cálculo inferencial se delega en STATS (45_stats.js).
   JavaScript de navegador plano: sin módulos, sin librerías, sin red.
   ========================================================================== */
'use strict';

const SPECS_EXTRA_MEDIR = (function(){

  /* ======================================================================
     HELPERS PRIVADOS DEL MÓDULO (no contaminan el ámbito global)
     ==================================================================== */

  /** Valor numérico con valor por defecto cuando la celda está vacía */
  const gnum = (d, k, def) => {
    const v = (d || {})[k];
    return (v === null || v === undefined || v === '') ? def : num(v);
  };
  /** Texto limpio */
  const txt = v => String(v == null ? '' : v).trim();
  /** Filas con algún contenido en la columna `k` */
  const filled = (rows, k) => arr(rows).filter(r => txt(r && r[k]) !== '');
  /** ¿el resultado de STATS trae error? */
  const malo = r => !r || !!r.error;

  /** Tono por umbrales (mayor es mejor) */
  const tone3 = (v, ok, warn) => !isFinite(v) ? '' : (v >= ok ? 'ok' : (v >= warn ? 'warn' : 'bad'));
  /** Tono invertido (menor es mejor) */
  const tone3i = (v, ok, warn) => !isFinite(v) ? '' : (v <= ok ? 'ok' : (v <= warn ? 'warn' : 'bad'));

  /** Número formateado o guion largo */
  const nf = (v, f) => (isFinite(num(v)) && v !== null && v !== undefined && v !== '')
    ? fmt(v, f || 'n2') : '—';
  /** Porcentaje que YA viene en escala 0-100 (los % de STATS) */
  const pp = (v, dec) => isFinite(v) ? fmt(v, dec === 2 ? 'n2' : 'n1') + ' %' : '—';

  /* -------------------------------------------------------- tablas HTML */
  /** Construye una tabla `gt` escapando SIEMPRE el contenido.
   *  head: ['A','B'] · body: [[c1,c2], …] · cada celda puede ser
   *  string/number o { v:'texto', n:true (alinea a la derecha), tone:'ok|warn|bad', b:true } */
  function tabla(head, body, opts){
    const o = opts || {};
    let h = '<div class="twrap"><table class="gt"><thead><tr>';
    arr(head).forEach((c, i) => {
      const s = (c && typeof c === 'object') ? c : { v: c };
      h += '<th' + ((s.n || (o.numDesde !== undefined && i >= o.numDesde)) ? ' class="n"' : '') + '>' +
           esc(s.v) + '</th>';
    });
    h += '</tr></thead><tbody>';
    arr(body).forEach(fila => {
      h += '<tr>';
      arr(fila).forEach((c, i) => {
        const s = (c && typeof c === 'object') ? c : { v: c };
        const der = s.n || (o.numDesde !== undefined && i >= o.numDesde);
        h += '<td' + (s.tone ? ' class="cell-' + esc(s.tone) + '"' : '') +
             ' style="padding:6px 9px;font-size:12px' + (der ? ';text-align:right' : '') +
             (s.b ? ';font-weight:800' : '') + '">' + esc(s.v == null ? '' : s.v) + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }
  /** Aviso corto dentro de un bloque html */
  const aviso = (msg, tono) =>
    '<div class="note ' + esc(tono || 'info') + '">' + esc(msg) + '</div>';

  /* ------------------------------------------------- estadística básica */
  /** Serie numérica de una columna de la grilla */
  const serieDe = (rows, k) => vals(rows, k);

  /** Moda (valor más repetido); devuelve NaN si todos son únicos */
  function moda(v){
    if (!v.length) return NaN;
    const c = {};
    let mejor = NaN, nMejor = 1;
    v.forEach(x => {
      const k = String(round(x, 6));
      c[k] = (c[k] || 0) + 1;
      if (c[k] > nMejor){ nMejor = c[k]; mejor = x; }
    });
    return nMejor > 1 ? mejor : NaN;
  }
  /** Asimetría muestral (mismo estimador que Excel / Minitab) */
  function asimetria(v){
    const n = v.length, s = stdev(v);
    if (n < 3 || !(s > 0)) return NaN;
    const m = v.reduce((a, b) => a + b, 0) / n;
    let s3 = 0; v.forEach(x => { s3 += Math.pow((x - m) / s, 3); });
    return n / ((n - 1) * (n - 2)) * s3;
  }
  /** Curtosis muestral en exceso (0 = normal) */
  function curtosis(v){
    const n = v.length, s = stdev(v);
    if (n < 4 || !(s > 0)) return NaN;
    const m = v.reduce((a, b) => a + b, 0) / n;
    let s4 = 0; v.forEach(x => { s4 += Math.pow((x - m) / s, 4); });
    return (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * s4 -
           3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3));
  }
  /** Paquete completo de estadísticos descriptivos */
  function descrip(v){
    const n = v.length;
    if (!n) return { n:0 };
    const m = v.reduce((a, b) => a + b, 0) / n;
    const s = stdev(v);
    const q1 = STATS.quantil(v, 0.25), q3 = STATS.quantil(v, 0.75);
    return { n:n, media:m, mediana:median(v), moda:moda(v), s:s, varianza: s * s,
             min: Math.min.apply(null, v), max: Math.max.apply(null, v),
             rango: Math.max.apply(null, v) - Math.min.apply(null, v),
             q1:q1, q3:q3, iqr: q3 - q1,
             asimetria: asimetria(v), curtosis: curtosis(v),
             ee: n > 0 ? s / Math.sqrt(n) : NaN };
  }
  /** IC de la media por t de Student */
  function icMedia(v, conf){
    const n = v.length; if (n < 2) return [NaN, NaN];
    const a = 1 - (conf || 0.95);
    const m = v.reduce((x, y) => x + y, 0) / n, s = stdev(v);
    const t = STATS.tInv(1 - a / 2, n - 1);
    const e = t * s / Math.sqrt(n);
    return [m - e, m + e];
  }
  /** IC de la desviación estándar por chi-cuadrado */
  function icDesv(v, conf){
    const n = v.length; if (n < 2) return [NaN, NaN];
    const a = 1 - (conf || 0.95), s = stdev(v);
    const lo = STATS.chi2Inv(1 - a / 2, n - 1), hi = STATS.chi2Inv(a / 2, n - 1);
    if (!(lo > 0) || !(hi > 0)) return [NaN, NaN];
    return [s * Math.sqrt((n - 1) / lo), s * Math.sqrt((n - 1) / hi)];
  }
  /** IC no paramétrico de la mediana (estadísticos de orden · método del signo) */
  function icMediana(v, conf){
    const n = v.length; if (n < 6) return [NaN, NaN];
    const a = 1 - (conf || 0.95);
    const S = v.slice().sort((x, y) => x - y);
    /* k = mayor valor con P(Bin(n; 0,5) ≤ k) ≤ α/2; el IC es [x_(k+1), x_(n−k)].
       La acumulada se arma por recurrencia para no calcular factoriales. */
    const base = Math.pow(0.5, n);
    let comb = 1, acum = base, k = 0;
    while (k < n - k - 1 && acum + base * comb * (n - k) / (k + 1) <= a / 2){
      comb = comb * (n - k) / (k + 1);
      acum += base * comb;
      k++;
    }
    return [S[k], S[n - 1 - k]];
  }

  /* -------------------------- tabla de equivalencias Z ↔ σ ↔ DPMO ↔ Y --- */
  /** Nivel sigma de largo plazo (con corrimiento 1,5σ) → DPMO, rendimiento y Cp */
  function equivalencias(){
    const out = [];
    for (let s = 6; s >= 1; s--){
      const dpmo = STATS.normSF(s - 1.5) * 1e6;
      out.push({ sigma: s, z: s, cp: s / 3, dpmo: dpmo, rend: 1 - dpmo / 1e6 });
    }
    return out;
  }

  /* -------------------------------------------------- lectores de datos */
  /** Mediciones de una grilla `key` con columna `col` (por defecto «valor») */
  function datosDe(d, key, col){
    return serieDe(arr((d || {})[key]), col || 'valor');
  }
  /** Datos propios o, si están vacíos, los de la herramienta `ref` */
  function datosOref(d, ctx, key, col, refId, refKey, refCol){
    const propios = datosDe(d, key, col);
    if (propios.length >= 3) return { v: propios, origen: 'propios' };
    const otro = (ctx && ctx.all && ctx.all[refId]) || null;
    const v = otro ? serieDe(arr(otro[refKey]), refCol) : [];
    return { v: v, origen: v.length ? 'ref' : 'vacio' };
  }

  /* ======================================================================
     1 · EVALUACIÓN DEL SISTEMA DE MEDICIÓN · MSA (GR&R)
     Manual p100-121
     ==================================================================== */

  /** Resultado del GR&R por variables a partir de los datos de la hoja */
  function grrDe(d){
    const rows = arr(d.rows);
    const tol = num(d.tolerancia) > 0 ? num(d.tolerancia)
      : ((num(d.usl) - num(d.lsl)) > 0 ? num(d.usl) - num(d.lsl) : 0);
    return STATS.grrANOVA(rows, gnum(d, 'nPartes', 10), gnum(d, 'nOperadores', 3),
                          gnum(d, 'nReplicas', 3), tol);
  }
  /** Resultado del GR&R por atributos */
  const grrAtrDe = d => STATS.grrAtributos(arr(d.attr));

  /** Media de la parte a la que pertenece una fila (para la columna DIFERENCIA) */
  function mediaParte(r, rows){
    const p = txt(r && r.parte);
    if (!p) return NaN;
    const v = arr(rows).filter(x => txt(x.parte) === p && isNum(x.valor)).map(x => num(x.valor));
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
  }

  const T_MSA_GRR = {
    id: 'medir.msa_grr',
    mod: 'MEDIR',
    extra: true,
    sheet: 'MSA - GR&R (manual)',
    title: 'EVALUACIÓN DEL SISTEMA DE MEDICIÓN — MSA (GR&R)',
    desc: 'Valida el sistema de medición ANTES de medir el proceso: estudio R&R cruzado por variables (ANOVA) y análisis de concordancia por atributos (kappa). Evita datos de mala calidad que llevan a decisiones erróneas.',
    guide: [
      'El SISTEMA DE MEDICIÓN no es sólo el aparato: incluye el dispositivo (gage), las personas que miden, las partes medidas, el método y el ambiente.',
      'FUENTES DE VARIACIÓN DE UN GAGE: RESOLUCIÓN (capacidad de detectar un cambio tolerable), EXACTITUD (diferencia entre el promedio de las mediciones y el valor real, es decir el sesgo), LINEALIDAD (cambio de la exactitud a lo largo del rango de operación), ESTABILIDAD (consistencia de las medidas a través del tiempo), REPETIBILIDAD (variación del propio equipo) y REPRODUCIBILIDAD (variación entre operadores).',
      'MÉTODO POR VARIABLES (manual p104): identifica la característica a medir · revisa especificaciones y registra la tolerancia (LSL, Target, USL) · calibra el aparato · recolecta 10 piezas que representen todo el rango de variación de largo plazo · numera las piezas (información sólo para el analista) · 3 operarios miden las 10 piezas en orden ALEATORIO · repite el ciclo completo 3 veces (réplicas) · analiza con ANOVA.',
      'Los operarios NO deben saber qué pieza están midiendo ni qué midieron antes: por eso el orden es aleatorio y la numeración la conserva el analista.',
      'CRITERIO AIAG sobre el %GR&R (de la tolerancia o del estudio): < 10 % ACEPTABLE · 10 % a 30 % puede aceptarse según la aplicación, el costo y la criticidad · > 30 % INACEPTABLE, hay que mejorar o reemplazar el sistema de medición.',
      'ndc (número de categorías distintivas) = cuántos grupos diferentes distingue el sistema. Debe ser ≥ 5; por debajo de 4 el sistema no sirve para controlar el proceso porque no puede distinguir una pieza de otra.',
      'Un buen estudio tiene la MAYOR contribución en PARTE A PARTE. Si la mayor variación está en el GR&R, la repetibilidad o la reproducibilidad, el sistema de medición no es el adecuado.',
      'Si el problema es la REPETIBILIDAD (el equipo): comprende las capacidades del medidor, repara o reemplaza el aparato, ajústalo, mejora la colocación de la pieza o usa un dispositivo de sujeción.',
      'Si el problema es la REPRODUCIBILIDAD (los operadores): capacita en los estándares de medición, observa las diferencias entre operadores para saber si es entrenamiento, habilidad, procedimiento o actitud, y da entrenamiento adicional.',
      'MÉTODO POR ATRIBUTOS (manual p111): selecciona 30 o más unidades (≈ 50 % conformes y 50 % no conformes, incluyendo unidades dudosas), un experto define el ESTÁNDAR de cada una, 3 evaluadores las juzgan aleatoriamente y se repite 3 veces.',
      'CRITERIO POR ATRIBUTOS: kappa > 0,70 sistema aceptable · kappa > 0,90 sistema excelente · la concordancia contra el estándar debería ser ≥ 90 %.',
      'El GR&R se hace ANTES de recolectar los datos de la línea base: si el sistema de medición no es válido, todo lo que midas después también será inválido.'
    ],
    blocks: [
      /* ---------------- encabezado del estudio ---------------- */
      { type:'fields', title:'DATOS DEL ESTUDIO', cols:4, items:[
        { k:'caracteristica', label:'CARACTERÍSTICA O VARIABLE MEDIDA', input:'text', w:2,
          ph:'Ej.: diámetro externo del tubo, tiempo de atención (min)' },
        { k:'gage',      label:'GAGE / INSTRUMENTO', input:'text',
          ph:'Ej.: calibrador pie de rey 0,01 mm' },
        { k:'unidad',    label:'UNIDAD', input:'text', ph:'mm · min · kg' },
        { k:'lsl',       label:'LSL (límite inferior)', input:'number', step:'any' },
        { k:'target',    label:'TARGET (objetivo)', input:'number', step:'any' },
        { k:'usl',       label:'USL (límite superior)', input:'number', step:'any' },
        { k:'tolerancia', label:'TOLERANCIA (USL − LSL)', ro:true, fmt:'n3',
          calc:(d) => { const t = num(d.tolerancia);
            return t > 0 ? t : ((num(d.usl) - num(d.lsl)) > 0 ? num(d.usl) - num(d.lsl) : NaN); },
          hint:'Se usa para el % de tolerancia' },
        { k:'nPartes',    label:'N.º DE PARTES', input:'number', step:1, ph:'10',
          hint:'Por defecto 10' },
        { k:'nOperadores', label:'N.º DE OPERADORES', input:'number', step:1, ph:'3',
          hint:'Por defecto 3' },
        { k:'nReplicas',  label:'N.º DE RÉPLICAS', input:'number', step:1, ph:'3',
          hint:'Por defecto 3' },
        { k:'mediciones', label:'MEDICIONES REQUERIDAS', ro:true, fmt:'n0',
          calc:(d) => gnum(d, 'nPartes', 10) * gnum(d, 'nOperadores', 3) * gnum(d, 'nReplicas', 3),
          hint:'Partes × operadores × réplicas' },
        { k:'resolucion', label:'RESOLUCIÓN DEL GAGE', input:'number', step:'any',
          hint:'Mínima división que lee el instrumento' },
        { k:'calibrado',  label:'¿GAGE CALIBRADO Y VIGENTE?', input:'select',
          opts:['SÍ','NO','EN TRÁMITE'] },
        { k:'responsable', label:'ANALISTA RESPONSABLE', input:'text' },
        { k:'fecha',      label:'FECHA DEL ESTUDIO', input:'date' }
      ]},
      { type:'note', tone:'info', text:'Registra las mediciones en el ORDEN EN QUE SE HICIERON. El diseño debe quedar balanceado: cada operador mide TODAS las partes el mismo número de veces; si falta alguna combinación parte × operador, el ANOVA no se puede calcular.' },

      /* ---------------- captura de datos ---------------- */
      { type:'grid', key:'rows', title:'GR&R POR VARIABLES — CAPTURA DE DATOS', min:30, max:400,
        addLabel:'Agregar medición',
        cols:[
          { k:'parte',    label:'PARTE / PIEZA', input:'text', w:110,
            help:'Número que identifica la pieza (1 … 10)' },
          { k:'operador', label:'OPERADOR', input:'text', w:120,
            help:'Nombre o código del operario que midió' },
          { k:'replica',  label:'RÉPLICA', input:'number', step:1, w:90, align:'right',
            help:'1, 2 o 3: intento de medición' },
          { k:'valor',    label:'VALOR MEDIDO', input:'number', step:'any', w:130, align:'right' },
          { k:'dif',      label:'DIFERENCIA vs MEDIA DE LA PARTE', ro:true, fmt:'n3', w:150,
            calc:(r, i, rows) => { const m = mediaParte(r, rows);
              return (isNum(r.valor) && isFinite(m)) ? num(r.valor) - m : NaN; } }
        ],
        foot:[
          { k:'valor', calc:(rows) => avg(rows, 'valor'), fmt:'n3' },
          { k:'__label', label:'MEDIA GENERAL' }
        ]
      },

      /* ---------------- resultados por variables ---------------- */
      { type:'cards', title:'RESULTADOS GR&R POR VARIABLES (ANOVA)', items:(d) => {
        const r = grrDe(d);
        if (malo(r)) return [{ label:'ESTUDIO GR&R', value:'—', hint: r && r.error ? r.error : 'Sin datos' }];
        const est = r.pctEstudio.grr, con = r.pctContribucion.grr, tol = r.pctTolerancia.grr;
        return [
          { label:'%GR&R (VARIACIÓN DEL ESTUDIO)', value: pp(est, 2), tone: tone3i(est, 10, 30),
            hint:'6σ del GR&R sobre la variación total del estudio (SV)' },
          { label:'%CONTRIBUCIÓN GR&R', value: pp(con, 2), tone: tone3i(con, 1, 9),
            hint:'Varianza del GR&R sobre la varianza total' },
          { label:'%TOLERANCIA GR&R', value: pp(tol, 2), tone: tone3i(tol, 10, 30),
            hint: isFinite(tol) ? '6σ del GR&R sobre USL − LSL' : 'Escribe LSL y USL para calcularlo' },
          { label:'%CONTRIBUCIÓN PARTE A PARTE', value: pp(r.pctContribucion.parte, 2),
            tone: tone3(r.pctContribucion.parte, 90, 70),
            hint:'Debe ser la MAYOR: indica que el gage distingue las piezas' },
          { label:'ndc (CATEGORÍAS DISTINTIVAS)', value: fmt(r.ndc, 'n0'),
            tone: r.ndc >= 5 ? 'ok' : (r.ndc >= 4 ? 'warn' : 'bad'), hint:'Debe ser ≥ 5' },
          { label:'VEREDICTO AIAG', value: r.veredicto, tone: r.tono,
            hint:'< 10 % aceptable · 10–30 % marginal · > 30 % inaceptable' }
        ];
      }},
      { type:'html', title:'COMPONENTES DE LA VARIACIÓN', tight:true, render:(d) => {
        const r = grrDe(d);
        if (malo(r)) return aviso(r && r.error ? r.error : 'Registra las mediciones del estudio.', 'warn');
        const F = [
          ['Gage R&R (total)',            r.GRR,   r.varianzas.grr,             'grr'],
          ['  Repetibilidad (equipo, EV)', r.EV,   r.varianzas.repetibilidad,   'repetibilidad'],
          ['  Reproducibilidad (operadores, AV)', r.AV, r.varianzas.reproducibilidad, 'reproducibilidad'],
          ['    Operador',                 Math.sqrt(Math.max(0, r.varianzas.operador)), r.varianzas.operador, 'operador'],
          ['    Parte × Operador',         r.interaccion, r.varianzas.interaccion, 'interaccion'],
          ['Parte a parte (PV)',           r.PV,    r.varianzas.parte,           'parte'],
          ['Variación total (TV)',         r.TV,    r.varianzas.total,           'total']
        ];
        const cuerpo = F.map(f => [
          { v: f[0], b: /^(Gage|Parte a parte|Variación)/.test(f[0]) },
          { v: nf(f[1], 'n4'), n:true },
          { v: nf(6 * num(f[1]), 'n4'), n:true },
          { v: pp(r.pctContribucion[f[3]], 2), n:true },
          { v: pp(r.pctEstudio[f[3]], 2), n:true },
          { v: pp(r.pctTolerancia[f[3]], 2), n:true }
        ]);
        return tabla(['FUENTE DE VARIACIÓN', 'DESV. EST. (DE)', 'VARIACIÓN 6σ',
                      '% CONTRIBUCIÓN', '% ESTUDIO (SV)', '% TOLERANCIA'], cuerpo, { numDesde:1 }) +
          '<div class="hint" style="margin-top:8px">Modelo ajustado: ' + esc(r.modelo) +
          ' · partes = ' + esc(r.nPartes) + ' · operadores = ' + esc(r.nOperadores) +
          ' · réplicas = ' + esc(r.nReplicas) + ' · N = ' + esc(r.N) + '</div>';
      }},
      { type:'html', title:'TABLA ANOVA (dos factores con interacción)', tight:true, render:(d) => {
        const r = grrDe(d);
        if (malo(r)) return aviso('Aún no se puede calcular el ANOVA.', 'warn');
        const cuerpo = arr(r.tablaAnova).map(f => [
          { v: f.fuente + (f.nota ? ' — ' + f.nota : ''), b: f.fuente === 'Total' },
          { v: nf(f.gl, 'n0'), n:true },
          { v: nf(f.ss, 'n4'), n:true },
          { v: nf(f.ms, 'n4'), n:true },
          { v: nf(f.f, 'n3'), n:true },
          { v: isFinite(f.p) ? STATS.fmtP(f.p) : '—', n:true,
            tone: isFinite(f.p) ? (f.p < 0.05 ? 'ok' : '') : '' }
        ]);
        return tabla(['FUENTE', 'GL', 'SS', 'MS', 'F', 'valor p'], cuerpo, { numDesde:1 }) +
          '<div class="hint" style="margin-top:8px">Criterio AIAG: si el valor p de PARTE × OPERADOR es mayor que 0,25 la interacción se agrupa con el error y se recalcula el modelo sin interacción (es lo que hace Minitab con la segunda tabla).</div>';
      }},
      { type:'chart', kind:'bar', title:'Componentes de la variación (% de contribución)', h:320,
        data:(d) => {
          const r = grrDe(d);
          if (malo(r)) return { labels:[], values:[] };
          const v = [r.pctContribucion.grr, r.pctContribucion.repetibilidad,
                     r.pctContribucion.reproducibilidad, r.pctContribucion.parte];
          return { labels:['GAGE R&R', 'REPETIBILIDAD', 'REPRODUCIBILIDAD', 'PARTE A PARTE'],
                   values: v.map(x => isFinite(x) ? round(x, 2) : null),
                   tones:[ tone3i(r.pctContribucion.grr, 1, 9), 'info', 'info', 'ok' ],
                   yLabel:'% de la varianza total', unit:'%' };
        }},
      { type:'chart', kind:'boxplot', title:'Distribución de las mediciones por operador', h:340,
        data:(d) => {
          const rows = arr(d.rows), ops = [];
          rows.forEach(r => { const o = txt(r.operador); if (o && ops.indexOf(o) < 0) ops.push(o); });
          const g = ops.map(o => ({ name:o,
            values: rows.filter(r => txt(r.operador) === o && isNum(r.valor)).map(r => num(r.valor)) }))
            .filter(x => x.values.length);
          return { grupos: g, lsl: isNum(d.lsl) ? num(d.lsl) : null,
                   usl: isNum(d.usl) ? num(d.usl) : null,
                   target: isNum(d.target) ? num(d.target) : null,
                   yLabel: txt(d.caracteristica) || 'Valor medido' };
        }},
      { type:'chart', kind:'boxplot', title:'Distribución de las mediciones por parte', h:320,
        data:(d) => {
          const rows = arr(d.rows), ps = [];
          rows.forEach(r => { const p = txt(r.parte); if (p && ps.indexOf(p) < 0) ps.push(p); });
          const g = ps.slice(0, 20).map(p => ({ name:'Parte ' + p,
            values: rows.filter(r => txt(r.parte) === p && isNum(r.valor)).map(r => num(r.valor)) }))
            .filter(x => x.values.length);
          return { grupos: g, yLabel: txt(d.caracteristica) || 'Valor medido' };
        }},
      { type:'note', tone:'info', text:(d) => {
        const r = grrDe(d);
        return malo(r) ? '' : r.interpretacion;
      }},
      { type:'note', tone:'warn', text:(d) => {
        const r = grrDe(d);
        if (malo(r)) return r && r.error ? r.error : '';
        if (r.tono === 'ok' && r.ndcOk) return '';
        const acc = [];
        if (r.EV >= r.AV) acc.push('La mayor fuente de error es la REPETIBILIDAD (el equipo): comprende las capacidades del medidor, repáralo o reemplázalo, ajústalo, y mejora la colocación de la pieza o del gage al medir.');
        else acc.push('La mayor fuente de error es la REPRODUCIBILIDAD (los operadores): capacita en los estándares de medición, observa las diferencias entre operadores para saber si el problema es entrenamiento, habilidad, procedimiento o actitud, y da entrenamiento adicional.');
        if (!r.ndcOk) acc.push('Con ndc = ' + fmt(r.ndc, 'n0') + ' el sistema no distingue una pieza de otra: revisa la RESOLUCIÓN del gage o verifica que las 10 piezas representen realmente todo el rango de variación del proceso.');
        return 'ACCIONES SUGERIDAS · ' + acc.join(' ');
      }},
      { type:'note', tone:'info', text:'FUENTES DE VARIACIÓN DE UN GAGE (manual p101-102) · RESOLUCIÓN: capacidad de detectar un cambio tolerable; la regla práctica pide que el instrumento lea al menos 1/10 de la tolerancia. EXACTITUD: diferencia entre el promedio de las mediciones y el valor real (sesgo). LINEALIDAD: cambio de la exactitud a lo largo del rango de operación del instrumento. ESTABILIDAD: consistencia de las medidas a través del tiempo. REPETIBILIDAD: variación del propio dispositivo cuando el mismo operador mide la misma pieza. REPRODUCIBILIDAD: variación debida a los operadores que miden.' },

      /* ---------------- GR&R por atributos ---------------- */
      { type:'fields', title:'GR&R POR ATRIBUTOS — DATOS DEL ESTUDIO', cols:4, items:[
        { k:'atributo',   label:'ATRIBUTO EVALUADO', input:'text', w:2,
          ph:'Ej.: pieza conforme / no conforme, historia clínica completa' },
        { k:'experto',    label:'EXPERTO QUE FIJA EL ESTÁNDAR', input:'text' },
        { k:'fechaAtr',   label:'FECHA', input:'date' },
        { k:'nMuestras',  label:'N.º DE MUESTRAS', input:'number', step:1, ph:'30',
          hint:'30 o más, ≈ 50 % conformes' },
        { k:'nEvaluadores', label:'N.º DE EVALUADORES', input:'number', step:1, ph:'3' },
        { k:'nEnsayos',   label:'N.º DE ENSAYOS (RÉPLICAS)', input:'number', step:1, ph:'3' },
        { k:'evalReq',    label:'EVALUACIONES REQUERIDAS', ro:true, fmt:'n0',
          calc:(d) => gnum(d, 'nMuestras', 30) * gnum(d, 'nEvaluadores', 3) * gnum(d, 'nEnsayos', 3) }
      ]},
      { type:'grid', key:'attr', title:'GR&R POR ATRIBUTOS — JUICIOS', min:30, max:500,
        addLabel:'Agregar evaluación',
        cols:[
          { k:'parte',     label:'MUESTRA / UNIDAD', input:'text', w:120 },
          { k:'evaluador', label:'EVALUADOR', input:'text', w:130 },
          { k:'ensayo',    label:'ENSAYO', input:'number', step:1, w:80, align:'right' },
          { k:'resultado', label:'JUICIO DEL EVALUADOR', input:'select', w:150,
            opts:['Aceptar', 'Rechazar'] },
          { k:'estandar',  label:'ESTÁNDAR (EXPERTO)', input:'select', w:150,
            opts:['Aceptar', 'Rechazar'] },
          { k:'ok',        label:'¿COINCIDE?', ro:true, w:100,
            calc:(r) => { const a = txt(r.resultado).toUpperCase(), b = txt(r.estandar).toUpperCase();
              return (!a || !b) ? '' : (a === b ? 'SÍ' : 'NO'); } }
        ]
      },
      { type:'cards', title:'RESULTADOS GR&R POR ATRIBUTOS (concordancia · kappa)', items:(d) => {
        const r = grrAtrDe(d);
        if (malo(r)) return [{ label:'ESTUDIO POR ATRIBUTOS', value:'—',
                               hint: r && r.error ? r.error : 'Sin datos' }];
        const dentro = avg(arr(r.porEvaluador).map(x => ({ v:x.dentro })), 'v');
        return [
          { label:'KAPPA (referencia)', value: nf(r.kappa, 'n3'),
            tone: tone3(r.kappa, 0.9, 0.7), hint:'> 0,70 aceptable · > 0,90 excelente' },
          { label:'CONCORDANCIA DENTRO DE CADA EVALUADOR', value: isFinite(dentro) ? fmt(dentro, 'p1') : '—',
            tone: tone3(dentro, 0.9, 0.75), hint:'Repetibilidad: coincide consigo mismo' },
          { label:'CONCORDANCIA ENTRE EVALUADORES', value: nf(r.entreEvaluadores, 'p1'),
            tone: tone3(r.entreEvaluadores, 0.9, 0.75), hint:'Reproducibilidad entre operadores' },
          { label:'CONCORDANCIA vs ESTÁNDAR (EFICACIA)', value: nf(r.eficacia, 'p1'),
            tone: tone3(r.eficacia, 0.9, 0.8), hint:'Todos coinciden con el experto' },
          { label:'KAPPA DE FLEISS (entre evaluadores)', value: nf(r.kappaFleiss, 'n3'),
            tone: tone3(r.kappaFleiss, 0.9, 0.7) },
          { label:'VEREDICTO', value: r.veredicto, tone: r.tono,
            hint: fmt(r.evaluadores, 'n0') + ' evaluador(es) · ' + fmt(r.partes, 'n0') + ' muestra(s)' }
        ];
      }},
      { type:'html', title:'CONCORDANCIA POR EVALUADOR', tight:true, render:(d) => {
        const r = grrAtrDe(d);
        if (malo(r)) return aviso(r && r.error ? r.error : 'Registra los juicios del estudio por atributos.', 'warn');
        const cuerpo = arr(r.porEvaluador).map(e => [
          { v: e.evaluador, b:true },
          { v: fmt(e.nPartes, 'n0'), n:true },
          { v: nf(e.dentro, 'p1'), n:true, tone: tone3(e.dentro, 0.9, 0.75) },
          { v: fmt(e.aciertos, 'n0') + ' / ' + fmt(e.evaluadas, 'n0'), n:true },
          { v: nf(e.vsEstandar, 'p1'), n:true, tone: tone3(e.vsEstandar, 0.9, 0.8) },
          { v: nf(e.kappa, 'n3'), n:true, tone: tone3(e.kappa, 0.9, 0.7) }
        ]);
        return tabla(['EVALUADOR', 'MUESTRAS', '% CONCORDANCIA CONSIGO MISMO',
                      'ACIERTOS vs ESTÁNDAR', '% vs ESTÁNDAR', 'KAPPA'], cuerpo, { numDesde:1 });
      }},
      { type:'chart', kind:'bar', title:'Concordancia de cada evaluador contra el estándar', h:300,
        data:(d) => {
          const r = grrAtrDe(d);
          if (malo(r)) return { labels:[], values:[] };
          const E = arr(r.porEvaluador).filter(e => isFinite(e.vsEstandar));
          return { labels: E.map(e => e.evaluador),
                   values: E.map(e => round(e.vsEstandar * 100, 1)),
                   tones: E.map(e => tone3(e.vsEstandar, 0.9, 0.8)),
                   yLabel:'% de acuerdo con el experto', unit:'%' };
        }},
      { type:'chart', kind:'bar', title:'Repetibilidad individual de cada evaluador', h:300,
        data:(d) => {
          const r = grrAtrDe(d);
          if (malo(r)) return { labels:[], values:[] };
          const E = arr(r.porEvaluador).filter(e => isFinite(e.dentro));
          return { labels: E.map(e => e.evaluador),
                   values: E.map(e => round(e.dentro * 100, 1)),
                   tones: E.map(e => tone3(e.dentro, 0.9, 0.75)),
                   yLabel:'% que repite su propio juicio', unit:'%' };
        }},
      { type:'note', tone:'info', text:(d) => {
        const r = grrAtrDe(d);
        return malo(r) ? '' : r.interpretacion;
      }},
      { type:'note', tone:'info', text:'Si los porcentajes son bajos en EVALUADOR vs ESTÁNDAR hay que dar una mejor definición del criterio de aceptación, con estándares físicos o visuales y entrenamiento. Si los bajos son los de REPETIBILIDAD INDIVIDUAL, hay que apoyar al operador con mejores condiciones de inspección (iluminación, ayudas visuales, tiempo, ampliación).' },
      { type:'fields', title:'CONCLUSIÓN Y PLAN DE ACCIÓN', cols:2, items:[
        { k:'conclusion', label:'CONCLUSIÓN DEL ESTUDIO MSA', input:'textarea', rows:5, w:1,
          ph:'¿El sistema de medición es válido para medir la línea base del proyecto?' },
        { k:'acciones',   label:'ACCIONES A SEGUIR', input:'textarea', rows:5, w:1,
          ph:'Calibrar, reemplazar el gage, entrenar operadores, estandarizar el método, repetir el estudio…' }
      ]},
      { type:'insight' }
    ],
    bi: (d) => {
      const r = grrDe(d), a = grrAtrDe(d);
      const out = { msaEstudioValido: !malo(r) };
      if (!malo(r)){
        out.msaGRRestudio     = r.pctEstudio.grr;
        out.msaGRRcontribucion = r.pctContribucion.grr;
        out.msaGRRtolerancia  = r.pctTolerancia.grr;
        out.msaParteAparte    = r.pctContribucion.parte;
        out.msaNdc            = r.ndc;
        out.msaVeredicto      = r.veredicto;
        out.msaMediciones     = r.N;
      }
      if (!malo(a)){
        out.msaAtrKappa    = a.kappa;
        out.msaAtrEficacia = a.eficacia;
        out.msaAtrVeredicto = a.veredicto;
      }
      return out;
    }
  };

  /* ======================================================================
     2 · ANÁLISIS DE CAPACIDAD DEL PROCESO (Cp, Cpk, Pp, Ppk)
     Manual p145-158
     ==================================================================== */

  const capDatos = d => datosDe(d, 'rows', 'valor');
  const capNorm  = d => STATS.normalidad(capDatos(d), 0.05);
  const capRes   = d => STATS.capacidad(capDatos(d),
    isNum(d.lsl) ? num(d.lsl) : null,
    isNum(d.usl) ? num(d.usl) : null,
    isNum(d.target) ? num(d.target) : null,
    gnum(d, 'subgrupo', 1));

  /** Veredicto textual del Cpk según el manual */
  function veredictoCpk(cpk){
    if (!isFinite(cpk)) return { t:'—', tone:'' };
    if (cpk >= 1.67) return { t:'EXCELENTE (clase mundial)', tone:'ok' };
    if (cpk >= 1.33) return { t:'CAPAZ', tone:'ok' };
    if (cpk >= 1.00) return { t:'MARGINALMENTE CAPAZ', tone:'warn' };
    return { t:'NO CAPAZ', tone:'bad' };
  }

  const T_CAPACIDAD = {
    id: 'medir.capacidad_proceso',
    mod: 'MEDIR',
    extra: true,
    sheet: 'Capacidad del proceso',
    title: 'ANÁLISIS DE CAPACIDAD DEL PROCESO (Cp, Cpk, Pp, Ppk)',
    desc: 'Determina la capacidad y aptitud del proceso para cumplir las especificaciones técnicas deseadas y establece la línea base de partida para medir la mejora.',
    guide: [
      'METODOLOGÍA (manual p146): determina la variable de salida Y que vas a medir · verifica que el SISTEMA DE MEDICIÓN sea el adecuado (haz primero el GR&R) · verifica los requerimientos del cliente · valida las especificaciones con dibujos, procedimientos y con el cliente · recolecta la muestra · revisa si los datos son NORMALES · analiza e interpreta la capacidad.',
      'CORTO PLAZO: porción pequeña de la variación total (una sola máquina, un lote, un turno, un periodo corto). LARGO PLAZO: porción grande de la variación (varias máquinas, varios lotes, distintos turnos, periodo largo). Debes saber cuál de los dos tienes.',
      'Cp = índice de capacidad POTENCIAL, sin considerar dónde está la media: es lo que el proceso PODRÍA dar si estuviera centrado y con la mínima variación.',
      'Cpk = índice de capacidad POTENCIAL considerando la localización de la media respecto a los límites: mide el descentrado usando la variación de corto plazo.',
      'Pp y Ppk = índices de DESEMPEÑO real: lo que el proceso está dando hoy, calculados con la desviación estándar de TODOS los datos (largo plazo).',
      'Cpm = índice de Taguchi: penaliza la distancia de la media al TARGET, no sólo a los límites.',
      'PRUEBA DE NORMALIDAD (manual p149): si el valor p ≥ 0,05 se acepta que los datos siguen una distribución normal y se puede usar el análisis de capacidad normal.',
      'SI LOS DATOS NO SON NORMALES (manual p155-158): identifica primero el tipo de distribución que siguen (identificación de distribución individual con todas las distribuciones y transformaciones); elige la que tenga el mayor valor p, siempre que sea mayor que 0,05, o la más utilizada en la industria; también puedes transformar con Box-Cox o Johnson. Luego repite el estudio de capacidad con esa distribución.',
      'Se recomiendan MÍNIMO 30 mediciones; con menos, los índices son muy inestables. Si usas subgrupos racionales, indica el tamaño del subgrupo para separar la variación de corto y largo plazo.',
      'INTERPRETACIÓN DEL Cpk: < 1,00 proceso INCAPAZ · 1,00 a 1,33 MARGINAL · 1,33 a 1,67 CAPAZ · > 1,67 EXCELENTE.',
      'Si Cp es mucho mayor que Cpk el proceso está DESCENTRADO: centrar la media da una mejora inmediata sin tener que reducir la variación.',
      'Con este análisis defines la BASE LINE del proyecto: el punto de partida contra el que compararás la mejora en la fase CONTROLAR.'
    ],
    blocks: [
      { type:'fields', title:'CARACTERÍSTICA Y ESPECIFICACIONES', cols:4, items:[
        { k:'caracteristica', label:'CARACTERÍSTICA / VARIABLE Y', input:'text', w:2,
          ph:'Ej.: diámetro del tubo, tiempo de espera del paciente' },
        { k:'unidad',   label:'UNIDAD', input:'text', ph:'mm · min · %' },
        { k:'plazo',    label:'PLAZO DE LOS DATOS', input:'select',
          opts:['Corto plazo', 'Largo plazo'] },
        { k:'lsl',      label:'LSL (límite inferior de especificación)', input:'number', step:'any' },
        { k:'target',   label:'TARGET (objetivo)', input:'number', step:'any' },
        { k:'usl',      label:'USL (límite superior de especificación)', input:'number', step:'any' },
        { k:'subgrupo', label:'TAMAÑO DEL SUBGRUPO', input:'number', step:1, ph:'1',
          hint:'1 = datos individuales (usa el rango móvil)' },
        { k:'fuenteEsp', label:'FUENTE DE LA ESPECIFICACIÓN', input:'text', w:2,
          ph:'Plano, procedimiento, norma, requisito del cliente…' },
        { k:'responsable', label:'RESPONSABLE', input:'text' },
        { k:'fecha',    label:'FECHA', input:'date' },
        { k:'msaOk',    label:'¿EL SISTEMA DE MEDICIÓN YA FUE VALIDADO?', input:'select', w:2,
          opts:['SÍ, GR&R aceptable', 'NO', 'PENDIENTE'] }
      ]},
      { type:'note', tone:'warn', text:(d, ctx) => {
        const m = (ctx && ctx.all && ctx.all['medir.msa_grr']) || null;
        if (!m || !hasContent(m))
          return 'Antes de medir la capacidad, valida el sistema de medición en «Evaluación del sistema de medición — MSA (GR&R)». Si el gage no es capaz, los índices Cp/Cpk que calcules aquí no significan nada.';
        const r = grrDe(m);
        if (malo(r)) return '';
        return r.tono === 'ok' ? '' :
          'Atención: el estudio MSA de este proyecto arrojó un sistema de medición ' + r.veredicto +
          '. Una parte de la variación que verás aquí es error de medición, no del proceso.';
      }},
      { type:'grid', key:'rows', title:'MEDICIONES RECOLECTADAS', min:30, max:1000,
        addLabel:'Agregar medición',
        cols:[
          { k:'valor',    label:'VALOR MEDIDO', input:'number', step:'any', w:150, align:'right' },
          { k:'subgrupo', label:'SUBGRUPO / LOTE (opcional)', input:'text', w:150 },
          { k:'fecha',    label:'FECHA (opcional)', input:'date', w:140 },
          { k:'estado',   label:'¿DENTRO DE ESPECIFICACIÓN?', ro:true, w:150,
            calc:(r, i, rows, d) => {
              if (!isNum(r.valor)) return '';
              const v = num(r.valor);
              if (isNum(d.lsl) && v < num(d.lsl)) return 'FUERA (< LSL)';
              if (isNum(d.usl) && v > num(d.usl)) return 'FUERA (> USL)';
              return (isNum(d.lsl) || isNum(d.usl)) ? 'DENTRO' : '';
            },
            tone:(v) => v === 'DENTRO' ? 'ok' : (String(v).indexOf('FUERA') === 0 ? 'bad' : '') }
        ],
        foot:[
          { k:'valor', calc:(rows) => avg(rows, 'valor'), fmt:'n3' },
          { k:'__label', label:'MEDIA' }
        ]
      },
      { type:'note', tone:'warn', text:(d) => {
        const n = capDatos(d).length;
        if (!n) return 'Todavía no hay mediciones registradas.';
        return n < 30 ? 'Sólo hay ' + fmt(n, 'n0') + ' medición(es). El manual recomienda MÍNIMO 30 datos: con menos, la prueba de normalidad y los índices Cp/Cpk son muy inestables y pueden llevarte a una conclusión equivocada.' : '';
      }},

      /* ---------------- 1) normalidad ---------------- */
      { type:'cards', title:'1 · PRUEBA DE NORMALIDAD (Anderson-Darling)', items:(d) => {
        const r = capNorm(d);
        if (malo(r)) return [{ label:'NORMALIDAD', value:'—', hint: r && r.error ? r.error : '' }];
        return [
          { label:'n', value: fmt(r.n, 'n0') },
          { label:'ESTADÍSTICO AD', value: nf(r.AD, 'n4') },
          { label:'VALOR p', value: STATS.fmtP(r.p), tone: r.normal ? 'ok' : 'bad',
            hint:'Criterio: p ≥ 0,05 → distribución normal' },
          { label:'DISTRIBUCIÓN', value: r.normal ? 'NORMAL' : 'NO NORMAL', tone: r.normal ? 'ok' : 'bad' },
          { label:'ASIMETRÍA', value: nf(r.asimetria, 'n3'), hint:'0 = simétrica' },
          { label:'CURTOSIS', value: nf(r.curtosis, 'n3'), hint:'0 = como la normal' }
        ];
      }},
      { type:'note', tone:'info', text:(d) => {
        const r = capNorm(d);
        if (malo(r)) return '';
        return r.normal
          ? 'p = ' + STATS.fmtP(r.p) + ' ≥ 0,05 → se acepta que los datos siguen una distribución NORMAL: los índices Cp, Cpk, Pp, Ppk y Cpm de abajo son válidos.'
          : 'p = ' + STATS.fmtP(r.p) + ' < 0,05 → los datos NO siguen una distribución normal. Los índices calculados abajo son sólo de referencia.';
      }},
      { type:'note', tone:'warn', text:(d) => {
        const r = capNorm(d);
        if (malo(r) || r.normal) return '';
        return 'CAPACIDAD CON DATOS NO NORMALES (manual p155-158) · 1) Identifica primero el tipo de distribución que siguen los datos: prueba todas las distribuciones y transformaciones (Weibull, lognormal, exponencial, gamma, valor extremo…) y observa las gráficas de probabilidad; si los puntos se alinean sobre la recta, el ajuste es bueno. 2) Selecciona la distribución cuyo valor p sea mayor que 0,05; si varias cumplen, elige la de mayor p, la más usada en tu industria, o toma más muestras. 3) Como alternativa, transforma los datos con Box-Cox (λ óptimo) o con la familia Johnson y verifica de nuevo la normalidad. 4) Repite el estudio de capacidad con la distribución o la transformación elegida. También revisa si la no normalidad viene de mezclar turnos, máquinas o lotes: en ese caso estratifica y analiza cada grupo por separado.';
      }},

      /* ---------------- 2) índices de capacidad ---------------- */
      { type:'cards', title:'2 · ÍNDICES DE CAPACIDAD', items:(d) => {
        const r = capRes(d);
        if (malo(r)) return [{ label:'CAPACIDAD', value:'—', hint: r && r.error ? r.error : 'Sin datos' }];
        const ver = veredictoCpk(r.Cpk);
        return [
          { label:'Cp (potencial, corto plazo)', value: nf(r.Cp), tone: tone3(r.Cp, 1.33, 1),
            hint:'(USL − LSL) / 6σ dentro' },
          { label:'Cpk (real, corto plazo)', value: nf(r.Cpk), tone: ver.tone,
            hint:'Considera el descentrado de la media' },
          { label:'Pp (potencial, largo plazo)', value: nf(r.Pp), tone: tone3(r.Pp, 1.33, 1),
            hint:'(USL − LSL) / 6σ total' },
          { label:'Ppk (real, largo plazo)', value: nf(r.Ppk), tone: tone3(r.Ppk, 1.33, 1),
            hint:'Desempeño que está dando hoy el proceso' },
          { label:'Cpm (Taguchi vs TARGET)', value: nf(r.Cpm), tone: tone3(r.Cpm, 1.33, 1),
            hint: isFinite(r.Cpm) ? 'Penaliza la distancia al objetivo' : 'Escribe el TARGET para calcularlo' },
          { label:'VEREDICTO', value: ver.t, tone: ver.tone,
            hint:'Cpk < 1 incapaz · 1–1,33 marginal · 1,33–1,67 capaz · > 1,67 excelente' },
          { label:'Z BENCH CORTO PLAZO', value: nf(r.Zcorto), tone: tone3(r.Zcorto, 4, 3) },
          { label:'Z BENCH LARGO PLAZO', value: nf(r.Zlargo), tone: tone3(r.Zlargo, 2.5, 1.5) },
          { label:'NIVEL SIGMA', value: nf(r.sigmaNivel) + ' σ', tone: tone3(r.sigmaNivel, 4, 3),
            hint:'Z largo plazo + 1,5' },
          { label:'PPM DENTRO (corto plazo)', value: nf(r.ppmDentro, 'n0'),
            tone: tone3i(r.ppmDentro, 233, 6210) },
          { label:'PPM FUERA (largo plazo)', value: nf(r.ppmFuera, 'n0'),
            tone: tone3i(r.ppmFuera, 233, 6210) },
          { label:'PPM OBSERVADAS', value: nf(r.ppmObservado, 'n0'),
            hint: 'Contadas en los ' + fmt(r.n, 'n0') + ' datos capturados' },
          { label:'RENDIMIENTO ESPERADO', value: isFinite(r.rendimiento) ? fmt(r.rendimiento * 100, 'n4') + ' %' : '—',
            tone: tone3(r.rendimiento, 0.9973, 0.95),
            hint:'Proporción de unidades dentro de especificación a largo plazo' }
        ];
      }},
      { type:'html', title:'RESUMEN DEL ESTUDIO DE CAPACIDAD', tight:true, render:(d) => {
        const r = capRes(d);
        if (malo(r)) return aviso(r && r.error ? r.error : 'Registra las mediciones y los límites de especificación.', 'warn');
        const u = txt(d.unidad);
        const cuerpo = [
          [{ v:'n (mediciones)', b:true }, { v: fmt(r.n, 'n0'), n:true }, { v:'' }],
          [{ v:'Media', b:true }, { v: nf(r.media, 'n4') + (u ? ' ' + u : ''), n:true },
           { v:'Centro real del proceso' }],
          [{ v:'Mediana', b:true }, { v: nf(r.mediana, 'n4'), n:true }, { v:'' }],
          [{ v:'Mínimo · Máximo', b:true }, { v: nf(r.min, 'n4') + '  ·  ' + nf(r.max, 'n4'), n:true }, { v:'' }],
          [{ v:'σ DENTRO (corto plazo)', b:true }, { v: nf(r.sCorto, 'n5'), n:true },
           { v: r.metodoCorto }],
          [{ v:'σ TOTAL (largo plazo)', b:true }, { v: nf(r.sLargo, 'n5'), n:true },
           { v:'Desviación estándar de todos los datos' }],
          [{ v:'LSL · TARGET · USL', b:true },
           { v: nf(r.lsl, 'n4') + '  ·  ' + nf(r.target, 'n4') + '  ·  ' + nf(r.usl, 'n4'), n:true },
           { v:'Especificaciones validadas con el cliente' }],
          [{ v:'k (descentrado)', b:true }, { v: nf(r.k, 'p1'), n:true },
           { v:'0 % = media exactamente en el centro de la especificación' }],
          [{ v:'Cpi / Cps', b:true }, { v: nf(r.Cpi) + '  /  ' + nf(r.Cps), n:true },
           { v:'Capacidad contra el límite inferior y superior' }],
          [{ v:'Ppi / Pps', b:true }, { v: nf(r.Ppi) + '  /  ' + nf(r.Pps), n:true },
           { v:'Desempeño contra el límite inferior y superior' }],
          [{ v:'Tamaño de subgrupo', b:true }, { v: r.subgrupo ? fmt(r.subgrupo, 'n0') : '1 (individuales)', n:true },
           { v:'Define cómo se estima la variación de corto plazo' }]
        ];
        return tabla(['CONCEPTO', 'VALOR', 'NOTA'], cuerpo, {});
      }},
      { type:'chart', kind:'histogram', title:'Distribución de los datos, curva normal y especificaciones', h:360,
        data:(d) => ({ values: capDatos(d), bins: gnum(d, 'bins', 0) || null,
                       lsl: isNum(d.lsl) ? num(d.lsl) : null,
                       usl: isNum(d.usl) ? num(d.usl) : null,
                       target: isNum(d.target) ? num(d.target) : null }) },
      { type:'chart', kind:'boxplot', title:'Gráfica de caja del proceso', h:280,
        data:(d) => ({ grupos:[{ name: txt(d.caracteristica) || 'Proceso', values: capDatos(d) }],
                       lsl: isNum(d.lsl) ? num(d.lsl) : null,
                       usl: isNum(d.usl) ? num(d.usl) : null,
                       target: isNum(d.target) ? num(d.target) : null,
                       yLabel: txt(d.unidad) || '' }) },
      { type:'note', tone:'info', text:(d) => {
        const r = capRes(d);
        return malo(r) ? '' : r.interpretacion;
      }},

      /* ---------------- 3) equivalencias ---------------- */
      { type:'html', title:'EQUIVALENCIAS: NIVEL Z · NIVEL SIGMA · DPMO · RENDIMIENTO · Cp',
        tight:true, render:(d) => {
        const r = capRes(d);
        const actual = malo(r) ? NaN : r.sigmaNivel;
        const cuerpo = equivalencias().map(e => {
          const cerca = isFinite(actual) && Math.abs(actual - e.sigma) < 0.5;
          return [
            { v: fmt(e.sigma, 'n0') + ' σ', b:true, tone: cerca ? 'warn' : '' },
            { v: fmt(e.z, 'n2'), n:true },
            { v: fmt(e.cp, 'n2'), n:true },
            { v: fmt(e.dpmo, e.dpmo < 10 ? 'n1' : 'n0'), n:true },
            { v: fmt(e.rend * 100, 'n4') + ' %', n:true },
            { v: e.sigma >= 5 ? 'Clase mundial' : (e.sigma >= 4 ? 'Buena' : (e.sigma >= 3 ? 'Promedio de la industria' : 'No competitiva')) }
          ];
        });
        return tabla(['NIVEL SIGMA (LP)', 'NIVEL Z (CP)', 'Cp EQUIVALENTE', 'DPMO', 'RENDIMIENTO', 'LECTURA'],
                     cuerpo, { numDesde:1 }) +
          '<div class="hint" style="margin-top:8px">Calculado con el corrimiento clásico de 1,5σ: DPMO = Φ(−(Z − 1,5)) × 1.000.000. Ejemplo del manual (p153): con un Cp de 1,67 tienes un proceso de 5 σ y 0,57 partes por millón a corto plazo; a largo plazo, controlando la variación, quedarías en 3,5 σ y 233 partes por millón.' +
          (isFinite(actual) ? '<br>Tu proceso está hoy en <b>' + esc(fmt(actual, 'n2')) + ' σ</b>.' : '') + '</div>';
      }},
      { type:'note', tone:'info', text:'INTERPRETACIÓN DEL Cpk · menor que 1,00 → proceso INCAPAZ, produce fuera de especificación · entre 1,00 y 1,33 → MARGINAL, cualquier corrimiento genera defectos · entre 1,33 y 1,67 → CAPAZ, es el mínimo exigido en la mayoría de industrias · mayor que 1,67 → EXCELENTE, nivel de clase mundial. Compara siempre Cp con Cpk: si Cp es mucho mayor, el problema es el CENTRADO (más fácil de corregir); si ambos son bajos y parecidos, el problema es la VARIACIÓN.' },
      { type:'fields', title:'CONCLUSIÓN Y BASE LINE', cols:2, items:[
        { k:'baseline',   label:'BASE LINE DEL MÉTRICO (situación actual)', input:'textarea', rows:4,
          ph:'Ej.: Cpk actual 0,25 · 227.658 PPM · nivel sigma 0,75' },
        { k:'conclusion', label:'CONCLUSIÓN Y SIGUIENTE PASO', input:'textarea', rows:4,
          ph:'¿El proceso es capaz? ¿Hay que centrar la media, reducir la variación o revisar la especificación?' }
      ]},
      { type:'insight' }
    ],
    bi: (d) => {
      const r = capRes(d), nrm = capNorm(d);
      const out = { capN: capDatos(d).length };
      if (!malo(nrm)){ out.capNormalP = nrm.p; out.capEsNormal = !!nrm.normal; }
      if (!malo(r)){
        out.cp = r.Cp; out.cpk = r.Cpk; out.pp = r.Pp; out.ppk = r.Ppk; out.cpm = r.Cpm;
        out.capZcorto = r.Zcorto; out.capZlargo = r.Zlargo;
        out.capSigma = r.sigmaNivel; out.capPPM = r.ppmFuera;
        out.capRendimiento = r.rendimiento;
        out.capVeredicto = r.veredicto;
        out.capMedia = r.media; out.capDesv = r.sLargo;
      }
      return out;
    }
  };

  /* ======================================================================
     3 · HISTOGRAMA Y GRÁFICA DE CAJA
     Manual p125-126 y p132-133
     ==================================================================== */

  /** Grupos del histograma/caja: si hay columna GRUPO, separa; si no, un solo grupo */
  function gruposDe(d, key, colValor, colGrupo, nombreUnico){
    const rows = arr((d || {})[key]);
    const gs = [];
    rows.forEach(r => { const g = txt(r[colGrupo]); if (g && gs.indexOf(g) < 0) gs.push(g); });
    if (!gs.length)
      return [{ name: nombreUnico || 'Datos', values: serieDe(rows, colValor) }]
        .filter(x => x.values.length);
    const out = gs.map(g => ({ name:g,
      values: rows.filter(r => txt(r[colGrupo]) === g && isNum(r[colValor])).map(r => num(r[colValor])) }));
    const sinGrupo = rows.filter(r => !txt(r[colGrupo]) && isNum(r[colValor])).map(r => num(r[colValor]));
    if (sinGrupo.length) out.push({ name:'(sin grupo)', values: sinGrupo });
    return out.filter(x => x.values.length);
  }

  const T_HISTOGRAMA = {
    id: 'medir.histograma',
    mod: 'MEDIR',
    extra: true,
    sheet: 'Histograma y grafica de caja',
    title: 'HISTOGRAMA Y GRÁFICA DE CAJA',
    desc: 'Muestra cómo se comporta la frecuencia y la distribución de los datos del proceso, y compara la dispersión entre grupos con el diagrama de caja.',
    guide: [
      'HISTOGRAMA (manual p125-126): el eje horizontal es la escala de medición dividida en CLASES (intervalos) y el eje vertical la FRECUENCIA, es decir cuántos datos cayeron en cada clase. La MODA es la clase con mayor frecuencia.',
      'El número de clases se propone con la regla de STURGES (k = 1 + log₂ n) y se redondea a bordes «bonitos». Puedes forzar otro número en el campo CLASES si necesitas más o menos detalle.',
      'GRÁFICA DE CAJA (manual p133): el valor mínimo y el máximo son los bigotes; la caja va del primer cuartil (25 % de los datos) al tercer cuartil (75 %); la línea interna es la MEDIANA (50 %) y el punto es la MEDIA. Los puntos sueltos son valores atípicos (más de 1,5 · RIC fuera de la caja).',
      'Usa la columna GRUPO para comparar sedes, turnos, máquinas, profesionales o proveedores: cada valor distinto genera una caja. Ahí es donde se ve la ESTRATIFICACIÓN que después explicarás en ANALIZAR.',
      'Lee juntos los dos gráficos: el histograma te dice la FORMA (campana, sesgada, bimodal, truncada) y la caja te dice el CENTRO, la DISPERSIÓN y los ATÍPICOS.',
      'Una distribución bimodal (dos jorobas) casi siempre significa que estás mezclando dos poblaciones distintas: sepáralas con la columna GRUPO.',
      'ASIMETRÍA cercana a 0 y CURTOSIS cercana a 0 indican una forma parecida a la normal. Asimetría positiva = cola hacia la derecha; negativa = cola hacia la izquierda.',
      'Si vas a calcular Cp/Cpk, escribe también LSL, USL y TARGET: se dibujan sobre el histograma y sobre la caja.'
    ],
    blocks: [
      { type:'fields', title:'VARIABLE Y PRESENTACIÓN', cols:4, items:[
        { k:'variable', label:'VARIABLE MEDIDA', input:'text', w:2,
          ph:'Ej.: temperatura del horno (°C)' },
        { k:'unidad',   label:'UNIDAD', input:'text' },
        { k:'bins',     label:'CLASES (0 = automático)', input:'number', step:1, ph:'0',
          hint:'Regla de Sturges si lo dejas vacío' },
        { k:'lsl',      label:'LSL (opcional)', input:'number', step:'any' },
        { k:'target',   label:'TARGET (opcional)', input:'number', step:'any' },
        { k:'usl',      label:'USL (opcional)', input:'number', step:'any' },
        { k:'fuente',   label:'FUENTE DE LOS DATOS', input:'text' }
      ]},
      { type:'grid', key:'rows', title:'DATOS', min:20, max:1000, addLabel:'Agregar dato',
        cols:[
          { k:'valor', label:'VALOR', input:'number', step:'any', w:150, align:'right' },
          { k:'grupo', label:'GRUPO (opcional: sede, turno, máquina…)', input:'text', w:230 },
          { k:'nota',  label:'OBSERVACIÓN', input:'text', w:220 }
        ],
        foot:[
          { k:'valor', calc:(rows) => avg(rows, 'valor'), fmt:'n3' },
          { k:'__label', label:'MEDIA' }
        ]
      },
      { type:'chart', kind:'histogram', title:'Histograma', h:340,
        data:(d) => ({ values: datosDe(d, 'rows', 'valor'), bins: gnum(d, 'bins', 0) || null,
                       lsl: isNum(d.lsl) ? num(d.lsl) : null,
                       usl: isNum(d.usl) ? num(d.usl) : null,
                       target: isNum(d.target) ? num(d.target) : null }) },
      { type:'chart', kind:'boxplot', title:'Gráfica de caja', h:340,
        data:(d) => ({ grupos: gruposDe(d, 'rows', 'valor', 'grupo', txt(d.variable) || 'Datos'),
                       lsl: isNum(d.lsl) ? num(d.lsl) : null,
                       usl: isNum(d.usl) ? num(d.usl) : null,
                       target: isNum(d.target) ? num(d.target) : null,
                       yLabel: txt(d.unidad) || txt(d.variable) || '' }) },
      { type:'cards', title:'ESTADÍSTICOS PRINCIPALES', items:(d) => {
        const v = datosDe(d, 'rows', 'valor');
        if (v.length < 2) return [{ label:'DATOS', value: fmt(v.length, 'n0'), hint:'Registra al menos 2 valores' }];
        const s = descrip(v);
        return [
          { label:'n', value: fmt(s.n, 'n0') },
          { label:'MEDIA', value: nf(s.media, 'n3') },
          { label:'MEDIANA', value: nf(s.mediana, 'n3') },
          { label:'DESV. ESTÁNDAR', value: nf(s.s, 'n4') },
          { label:'RANGO', value: nf(s.rango, 'n3'), hint: nf(s.min, 'n3') + ' a ' + nf(s.max, 'n3') },
          { label:'RIC (Q3 − Q1)', value: nf(s.iqr, 'n3'), hint:'Dispersión del 50 % central' },
          { label:'ASIMETRÍA', value: nf(s.asimetria, 'n3'),
            tone: isFinite(s.asimetria) ? (Math.abs(s.asimetria) < 0.5 ? 'ok' : (Math.abs(s.asimetria) < 1 ? 'warn' : 'bad')) : '',
            hint:'0 = simétrica' },
          { label:'CURTOSIS', value: nf(s.curtosis, 'n3'),
            tone: isFinite(s.curtosis) ? (Math.abs(s.curtosis) < 1 ? 'ok' : 'warn') : '',
            hint:'0 = como la normal' }
        ];
      }},
      { type:'html', title:'ESTADÍSTICOS DESCRIPTIVOS POR GRUPO', tight:true, render:(d) => {
        const G = gruposDe(d, 'rows', 'valor', 'grupo', txt(d.variable) || 'Datos');
        if (!G.length) return aviso('Registra los datos para ver los estadísticos descriptivos.', 'info');
        const todos = datosDe(d, 'rows', 'valor');
        const filas = G.slice();
        if (G.length > 1) filas.push({ name:'TOTAL', values: todos });
        const cuerpo = filas.map(g => {
          const s = descrip(g.values);
          return [
            { v: g.name, b:true },
            { v: fmt(s.n, 'n0'), n:true },
            { v: nf(s.media, 'n3'), n:true },
            { v: nf(s.mediana, 'n3'), n:true },
            { v: isFinite(s.moda) ? nf(s.moda, 'n3') : '—', n:true },
            { v: nf(s.s, 'n4'), n:true },
            { v: nf(s.min, 'n3'), n:true },
            { v: nf(s.q1, 'n3'), n:true },
            { v: nf(s.q3, 'n3'), n:true },
            { v: nf(s.max, 'n3'), n:true },
            { v: nf(s.rango, 'n3'), n:true },
            { v: nf(s.iqr, 'n3'), n:true },
            { v: nf(s.asimetria, 'n2'), n:true },
            { v: nf(s.curtosis, 'n2'), n:true }
          ];
        });
        return tabla(['GRUPO', 'n', 'MEDIA', 'MEDIANA', 'MODA', 'DESV. EST.', 'MÍN', 'Q1', 'Q3',
                      'MÁX', 'RANGO', 'RIC', 'ASIMETRÍA', 'CURTOSIS'], cuerpo, { numDesde:1 }) +
          '<div class="hint" style="margin-top:8px">La MODA sólo se muestra cuando hay al menos un valor repetido. Q1 y Q3 se calculan por interpolación lineal (equivalente a PERCENTIL.INC de Excel).</div>';
      }},
      { type:'note', tone:'info', text:(d) => {
        const v = datosDe(d, 'rows', 'valor');
        if (v.length < 5) return '';
        const s = descrip(v);
        const p = [];
        p.push('n = ' + fmt(s.n, 'n0') + ' · media ' + nf(s.media, 'n3') + ' · mediana ' + nf(s.mediana, 'n3') + '.');
        if (isFinite(s.asimetria)){
          if (Math.abs(s.asimetria) < 0.5) p.push('La distribución es prácticamente SIMÉTRICA.');
          else p.push('La distribución está SESGADA hacia la ' + (s.asimetria > 0 ? 'DERECHA (cola de valores altos)' : 'IZQUIERDA (cola de valores bajos)') + ': la media se aleja de la mediana, así que reporta también la mediana.');
        }
        const G = gruposDe(d, 'rows', 'valor', 'grupo', 'Datos');
        if (G.length > 1) p.push('Hay ' + fmt(G.length, 'n0') + ' grupos: compara las cajas para ver si alguno está desplazado o es más disperso; si las diferencias parecen reales, pruébalas con ANOVA o Kruskal-Wallis en la fase ANALIZAR.');
        return p.join(' ');
      }},
      { type:'note', tone:'info', text:'Este histograma alimenta también la herramienta RESUMEN GRÁFICO: si dejas allí la grilla vacía, tomará automáticamente los datos capturados aquí.' },
      { type:'insight' }
    ],
    bi: (d) => {
      const v = datosDe(d, 'rows', 'valor');
      if (v.length < 2) return { histN: v.length };
      const s = descrip(v);
      return { histN: s.n, histMedia: s.media, histMediana: s.mediana, histDesv: s.s,
               histMin: s.min, histMax: s.max, histRango: s.rango, histIQR: s.iqr,
               histAsimetria: s.asimetria, histCurtosis: s.curtosis,
               histGrupos: gruposDe(d, 'rows', 'valor', 'grupo', 'Datos').length };
    }
  };

  /* ======================================================================
     4 · DIAGRAMA DE DISPERSIÓN
     Manual p129-131
     ==================================================================== */

  const dispXY = d => {
    const rows = arr(d.rows), X = [], Y = [], L = [];
    rows.forEach(r => {
      if (isNum(r.x) && isNum(r.y)){ X.push(num(r.x)); Y.push(num(r.y)); L.push(txt(r.etiqueta)); }
    });
    return { X:X, Y:Y, L:L };
  };

  const T_DISPERSION = {
    id: 'medir.dispersion',
    mod: 'MEDIR',
    extra: true,
    sheet: 'Diagrama de dispersion',
    title: 'DIAGRAMA DE DISPERSIÓN',
    desc: 'Diagrama matemático que muestra la relación entre dos variables a partir de la dispersión de sus datos, con la línea de tendencia y el coeficiente de correlación de Pearson.',
    guide: [
      'La variable X (PREDICTOR) es la que puedes modificar: es independiente. La variable Y (RESPUESTA) es la que cambia si modificas X.',
      'El COEFICIENTE DE PEARSON (r) mide el grado de asociación LINEAL entre las dos variables y va de −1 a +1.',
      'Lectura del manual (p129): r ≈ 0,16 → no hay correlación, coeficiente muy bajo, no hay relación entre las variables · r ≈ 0,84 → correlación moderada a fuerte, datos menos agrupados, hacia arriba: entre mayor X mayor Y · r ≈ −0,95 → correlación fuerte, datos muy agrupados, hacia abajo: entre menor X mayor Y.',
      'R² (coeficiente de determinación) es el porcentaje de la variación de Y que se explica por X. Un R² de 92 % indica alta relación y poca dispersión de los datos respecto a la línea.',
      'La ECUACIÓN DE REGRESIÓN describe cómo se comportan los datos y permite predecir: en el ejemplo del manual, Y = −10,01 + 0,3961 · X, así que con X = 53 se esperan 10,98 de peso.',
      'CORRELACIÓN NO IMPLICA CAUSALIDAD: dos variables pueden moverse juntas por una tercera variable oculta, por coincidencia o por la forma en que se recolectaron los datos.',
      'Aquí sólo EXPLORAS la relación. La VALIDACIÓN de la causa raíz se hace en la fase ANALIZAR con pruebas de hipótesis, regresión y, cuando se puede, con un experimento (DOE) en MEJORAR.',
      'Revisa siempre el gráfico antes que el número: un solo dato atípico puede inflar o destruir el valor de r, y una relación en forma de U da r ≈ 0 aunque la relación sea muy fuerte.'
    ],
    blocks: [
      { type:'fields', title:'VARIABLES', cols:4, items:[
        { k:'nombreX', label:'VARIABLE X (predictor · independiente)', input:'text', w:2,
          ph:'Ej.: temperatura del horno' },
        { k:'unidadX', label:'UNIDAD DE X', input:'text', ph:'°C' },
        { k:'fuente',  label:'FUENTE DE LOS DATOS', input:'text' },
        { k:'nombreY', label:'VARIABLE Y (respuesta · dependiente)', input:'text', w:2,
          ph:'Ej.: peso de la pieza' },
        { k:'unidadY', label:'UNIDAD DE Y', input:'text', ph:'g' },
        { k:'hipotesis', label:'HIPÓTESIS QUE SE EXPLORA', input:'text',
          ph:'¿Por qué crees que X afecta a Y?' }
      ]},
      { type:'grid', key:'rows', title:'PARES DE DATOS (X, Y)', min:15, max:500,
        addLabel:'Agregar par de datos',
        cols:[
          { k:'x',        label:'X', input:'number', step:'any', w:130, align:'right' },
          { k:'y',        label:'Y', input:'number', step:'any', w:130, align:'right' },
          { k:'etiqueta', label:'ETIQUETA (opcional)', input:'text', w:180 },
          { k:'ajustado', label:'Y AJUSTADO (línea de tendencia)', ro:true, fmt:'n3', w:160,
            calc:(r, i, rows, d) => {
              if (!isNum(r.x)) return NaN;
              const P = dispXY(d);
              const g = STATS.regresion(P.X, P.Y, 0.05);
              return malo(g) ? NaN : g.prediccion(num(r.x));
            } },
          { k:'residuo',  label:'RESIDUO (Y − ajustado)', ro:true, fmt:'n3', w:150,
            calc:(r, i, rows, d) => {
              if (!isNum(r.x) || !isNum(r.y)) return NaN;
              const P = dispXY(d);
              const g = STATS.regresion(P.X, P.Y, 0.05);
              return malo(g) ? NaN : num(r.y) - g.prediccion(num(r.x));
            } }
        ]
      },
      { type:'chart', kind:'scatter', title:'Diagrama de dispersión', h:380,
        data:(d) => {
          const P = dispXY(d);
          const ux = txt(d.unidadX), uy = txt(d.unidadY);
          return { points: P.X.map((x, i) => ({ x:x, y:P.Y[i], label:P.L[i] })),
                   xLabel: (txt(d.nombreX) || 'Variable X') + (ux ? ' — ' + ux : ''),
                   yLabel: (txt(d.nombreY) || 'Variable Y') + (uy ? ' — ' + uy : '') };
        }},
      { type:'chart', kind:'line', title:'Datos observados y línea de tendencia (ajuste lineal)', h:330,
        data:(d) => {
          const P = dispXY(d);
          if (P.X.length < 3) return { labels:[], series:[] };
          const g = STATS.regresion(P.X, P.Y, 0.05);
          const orden = P.X.map((x, i) => i).sort((a, b) => P.X[a] - P.X[b]);
          const xs = orden.map(i => P.X[i]);
          return { labels: xs.map(x => fmt(x, 'n2')),
                   series: [
                     { name:'Y observado', values: orden.map(i => P.Y[i]) },
                     { name:'Línea de tendencia', dash:'6 4',
                       values: malo(g) ? [] : xs.map(x => g.prediccion(x)) }
                   ],
                   yLabel: txt(d.nombreY) || 'Variable Y' };
        }},
      { type:'cards', title:'CORRELACIÓN Y AJUSTE', items:(d) => {
        const P = dispXY(d);
        const c = STATS.correl(P.X, P.Y, 0.05);
        if (malo(c)) return [{ label:'CORRELACIÓN', value:'—',
                               hint: c && c.error ? c.error : 'Registra al menos 3 pares (X, Y)' }];
        const g = STATS.regresion(P.X, P.Y, 0.05);
        return [
          { label:'n (pares)', value: fmt(c.n, 'n0') },
          { label:'COEFICIENTE DE PEARSON (r)', value: nf(c.r, 'n4'),
            tone: Math.abs(c.r) > 0.7 ? 'ok' : (Math.abs(c.r) > 0.3 ? 'warn' : 'bad'),
            hint: c.fuerza + ' · ' + c.direccion },
          { label:'R² (determinación)', value: nf(c.r2, 'p1'),
            tone: tone3(c.r2, 0.7, 0.5), hint:'% de la variación de Y explicada por X' },
          { label:'VALOR p', value: STATS.fmtP(c.p), tone: c.rechaza ? 'ok' : 'bad',
            hint: c.rechaza ? 'La correlación es significativa' : 'Puede deberse al azar' },
          { label:'IC 95 % DE r', value: isFinite(c.ic[0]) ? '[' + nf(c.ic[0], 'n3') + ' ; ' + nf(c.ic[1], 'n3') + ']' : '—' },
          { label:'ECUACIÓN DE REGRESIÓN', value: malo(g) ? '—' : g.ecuacion,
            hint:'Sirve para predecir Y a partir de X' }
        ];
      }},
      { type:'html', title:'INTERPRETACIÓN DEL COEFICIENTE DE PEARSON', tight:true, render:(d) => {
        const P = dispXY(d);
        const c = STATS.correl(P.X, P.Y, 0.05);
        const r = malo(c) ? NaN : Math.abs(c.r);
        const marca = (lo, hi) => (isFinite(r) && r > lo && r <= hi) ? 'warn' : '';
        const cuerpo = [
          [{ v:'|r| = 0,90 a 1,00', b:true, tone: marca(0.9, 1.0001) }, { v:'MUY FUERTE' },
           { v:'Los puntos están muy agrupados sobre la recta; la relación es prácticamente determinística.' }],
          [{ v:'|r| = 0,70 a 0,90', b:true, tone: marca(0.7, 0.9) }, { v:'FUERTE' },
           { v:'Relación clara; vale la pena llevar esta X a la fase ANALIZAR como causa potencial.' }],
          [{ v:'|r| = 0,50 a 0,70', b:true, tone: marca(0.5, 0.7) }, { v:'MODERADA' },
           { v:'Hay tendencia pero con dispersión: probablemente actúan otras variables.' }],
          [{ v:'|r| = 0,30 a 0,50', b:true, tone: marca(0.3, 0.5) }, { v:'DÉBIL' },
           { v:'Relación pobre; no tomes decisiones con este dato solo.' }],
          [{ v:'|r| = 0,00 a 0,30', b:true, tone: marca(-0.001, 0.3) }, { v:'NULA' },
           { v:'No hay asociación lineal; puede existir una relación no lineal, revisa el gráfico.' }]
        ];
        return tabla(['RANGO DE |r|', 'FUERZA', 'LECTURA'], cuerpo, {}) +
          '<div class="hint" style="margin-top:8px">El SIGNO indica la dirección: positivo, las dos variables crecen juntas; negativo, cuando una sube la otra baja.</div>';
      }},
      { type:'note', tone:'info', text:(d) => {
        const P = dispXY(d);
        const c = STATS.correl(P.X, P.Y, 0.05);
        return malo(c) ? '' : c.interpretacion;
      }},
      { type:'note', tone:'warn', text:'LA CORRELACIÓN NO IMPLICA CAUSALIDAD. Que X y Y se muevan juntas no demuestra que X cause a Y: puede haber una tercera variable que mueva a las dos, la relación puede ser al revés, o puede ser pura coincidencia. Este diagrama sirve para EXPLORAR y priorizar; la VALIDACIÓN de la causa raíz se hace en la fase ANALIZAR con pruebas de hipótesis y regresión, y se confirma en MEJORAR cambiando X a propósito (piloto o diseño de experimentos) para ver si Y responde.' },
      { type:'fields', title:'CONCLUSIÓN', cols:1, items:[
        { k:'conclusion', label:'¿QUÉ SE CONCLUYE Y QUÉ SE VALIDARÁ EN ANALIZAR?', input:'textarea', rows:4 }
      ]},
      { type:'insight' }
    ],
    bi: (d) => {
      const P = dispXY(d);
      const c = STATS.correl(P.X, P.Y, 0.05);
      if (malo(c)) return { dispPares: P.X.length };
      const g = STATS.regresion(P.X, P.Y, 0.05);
      return { dispPares: c.n, dispR: c.r, dispR2: c.r2, dispP: c.p,
               dispFuerza: c.fuerza, dispSignificativa: !!c.rechaza,
               dispPendiente: malo(g) ? NaN : g.pendiente,
               dispEcuacion: malo(g) ? '' : g.ecuacion,
               dispX: txt(d.nombreX), dispY: txt(d.nombreY) };
    }
  };

  /* ======================================================================
     5 · RESUMEN GRÁFICO
     Manual p135-136
     ==================================================================== */

  const resDatos = (d, ctx) =>
    datosOref(d, ctx, 'rows', 'valor', 'medir.histograma', 'rows', 'valor');

  const T_RESUMEN = {
    id: 'medir.resumen_grafico',
    mod: 'MEDIR',
    extra: true,
    sheet: 'Resumen grafico',
    title: 'RESUMEN GRÁFICO',
    desc: 'Informe que resume los datos con variedad de estadísticos: presentación y distribución de los datos, prueba de normalidad, intervalos de confianza del 95 %, histograma y gráfica de caja.',
    guide: [
      'Si dejas la grilla de abajo vacía, el resumen toma automáticamente los datos capturados en «Histograma y gráfica de caja». Si escribes datos propios, esos mandan.',
      'PRUEBA DE NORMALIDAD (Anderson-Darling): si el valor p es mayor a 0,05 los datos siguen una distribución normal.',
      'MEDIA: promedio de los datos. DESVIACIÓN ESTÁNDAR: qué tanto se dispersan los datos respecto a la media. VARIANZA: la desviación estándar al cuadrado, mide la variabilidad respecto a la media. N: número de datos.',
      'CUARTILES: son la descripción de la gráfica de caja (mínimo, 25 %, mediana, 75 %, máximo).',
      'ASIMETRÍA: forma de la distribución de probabilidad (hacia dónde se va la cola). CURTOSIS: grado de apuntamiento o achatamiento de la distribución.',
      'INTERVALOS DE CONFIANZA DEL 95 %: rango donde con 95 % de confianza está el verdadero valor poblacional de la media, de la mediana y de la desviación estándar. Si el intervalo de la media es muy ancho, necesitas más datos.',
      'La gráfica de caja de abajo corresponde al mismo histograma de arriba: léelas juntas.',
      'Este resumen es la fotografía estadística de la LÍNEA BASE: guárdalo para compararlo contra el mismo resumen después de la mejora, en la fase CONTROLAR.'
    ],
    blocks: [
      { type:'fields', title:'VARIABLE', cols:4, items:[
        { k:'variable', label:'VARIABLE RESUMIDA', input:'text', w:2,
          ph:'Ej.: tiempo de calentamiento del horno (min)' },
        { k:'unidad',   label:'UNIDAD', input:'text' },
        { k:'conf',     label:'NIVEL DE CONFIANZA', input:'select', opts:['90 %', '95 %', '99 %'],
          hint:'Por defecto 95 %' },
        { k:'periodo',  label:'PERIODO / ALCANCE DE LOS DATOS', input:'text', w:2 },
        { k:'responsable', label:'RESPONSABLE', input:'text' },
        { k:'fecha',    label:'FECHA', input:'date' }
      ]},
      { type:'note', tone:'info', text:(d, ctx) => {
        const r = resDatos(d, ctx);
        if (r.origen === 'ref') return 'Se están usando los ' + fmt(r.v.length, 'n0') + ' datos capturados en «Histograma y gráfica de caja». Para usar otros, escríbelos en la grilla de abajo.';
        if (r.origen === 'vacio') return 'Captura los datos abajo, o diligencia primero «Histograma y gráfica de caja» para que el resumen los tome de allí.';
        return 'Se están usando los ' + fmt(r.v.length, 'n0') + ' datos propios de esta hoja.';
      }},
      { type:'grid', key:'rows', title:'DATOS PROPIOS (opcional)', min:10, max:1000,
        addLabel:'Agregar dato',
        cols:[
          { k:'valor', label:'VALOR', input:'number', step:'any', w:150, align:'right' },
          { k:'nota',  label:'OBSERVACIÓN', input:'text', w:260 }
        ],
        foot:[
          { k:'valor', calc:(rows) => avg(rows, 'valor'), fmt:'n3' },
          { k:'__label', label:'MEDIA' }
        ]
      },
      { type:'cards', title:'PRUEBA DE NORMALIDAD (Anderson-Darling)', items:(d, ctx) => {
        const r = STATS.normalidad(resDatos(d, ctx).v, 0.05);
        if (malo(r)) return [{ label:'NORMALIDAD', value:'—', hint: r && r.error ? r.error : '' }];
        return [
          { label:'ESTADÍSTICO AD', value: nf(r.AD, 'n4') },
          { label:'VALOR p', value: STATS.fmtP(r.p), tone: r.normal ? 'ok' : 'bad' },
          { label:'CONCLUSIÓN', value: r.normal ? 'DATOS NORMALES' : 'DATOS NO NORMALES',
            tone: r.normal ? 'ok' : 'bad', hint:'Criterio: p > 0,05 → distribución normal' }
        ];
      }},
      { type:'html', title:'ESTADÍSTICOS DESCRIPTIVOS', tight:true, render:(d, ctx) => {
        const v = resDatos(d, ctx).v;
        if (v.length < 2) return aviso('Se necesitan al menos 2 datos para el resumen gráfico.', 'warn');
        const conf = txt(d.conf) === '90 %' ? 0.90 : (txt(d.conf) === '99 %' ? 0.99 : 0.95);
        const s = descrip(v);
        const nr = STATS.normalidad(v, 1 - conf);
        const im = icMedia(v, conf), id = icMediana(v, conf), is = icDesv(v, conf);
        const cuerpo = [
          [{ v:'N (número de datos)', b:true }, { v: fmt(s.n, 'n0'), n:true }],
          [{ v:'Media', b:true }, { v: nf(s.media, 'n4'), n:true }],
          [{ v:'Error estándar de la media', b:true }, { v: nf(s.ee, 'n4'), n:true }],
          [{ v:'Desviación estándar', b:true }, { v: nf(s.s, 'n4'), n:true }],
          [{ v:'Varianza', b:true }, { v: nf(s.varianza, 'n4'), n:true }],
          [{ v:'Asimetría', b:true }, { v: nf(s.asimetria, 'n4'), n:true }],
          [{ v:'Curtosis', b:true }, { v: nf(s.curtosis, 'n4'), n:true }],
          [{ v:'Mínimo', b:true }, { v: nf(s.min, 'n4'), n:true }],
          [{ v:'1.er cuartil (Q1 · 25 %)', b:true }, { v: nf(s.q1, 'n4'), n:true }],
          [{ v:'Mediana (50 %)', b:true }, { v: nf(s.mediana, 'n4'), n:true }],
          [{ v:'3.er cuartil (Q3 · 75 %)', b:true }, { v: nf(s.q3, 'n4'), n:true }],
          [{ v:'Máximo', b:true }, { v: nf(s.max, 'n4'), n:true }],
          [{ v:'Rango', b:true }, { v: nf(s.rango, 'n4'), n:true }],
          [{ v:'Rango intercuartílico (RIC)', b:true }, { v: nf(s.iqr, 'n4'), n:true }],
          [{ v:'Anderson-Darling (AD)', b:true }, { v: nf(malo(nr) ? NaN : nr.AD, 'n4'), n:true }],
          [{ v:'Valor p (normalidad)', b:true }, { v: malo(nr) ? '—' : STATS.fmtP(nr.p), n:true }]
        ];
        const pctC = fmt(conf, 'p0');
        const ic = [
          [{ v:'IC ' + pctC + ' de la MEDIA', b:true },
           { v: isFinite(im[0]) ? '[ ' + nf(im[0], 'n4') + '  ;  ' + nf(im[1], 'n4') + ' ]' : '—', n:true },
           { v:'t de Student con ' + fmt(Math.max(0, s.n - 1), 'n0') + ' grados de libertad' }],
          [{ v:'IC ' + pctC + ' de la MEDIANA', b:true },
           { v: isFinite(id[0]) ? '[ ' + nf(id[0], 'n4') + '  ;  ' + nf(id[1], 'n4') + ' ]' : '—', n:true },
           { v: v.length < 6 ? 'Se necesitan al menos 6 datos' : 'No paramétrico, por estadísticos de orden (método del signo)' }],
          [{ v:'IC ' + pctC + ' de la DESV. ESTÁNDAR', b:true },
           { v: isFinite(is[0]) ? '[ ' + nf(is[0], 'n4') + '  ;  ' + nf(is[1], 'n4') + ' ]' : '—', n:true },
           { v:'Chi-cuadrado con ' + fmt(Math.max(0, s.n - 1), 'n0') + ' grados de libertad' }]
        ];
        return tabla(['ESTADÍSTICO', 'VALOR'], cuerpo, { numDesde:1 }) +
          '<div style="height:12px"></div>' +
          tabla(['INTERVALO DE CONFIANZA', 'RANGO', 'MÉTODO'], ic, {});
      }},
      { type:'chart', kind:'histogram', title:'Histograma con curva normal', h:330,
        data:(d, ctx) => ({ values: resDatos(d, ctx).v }) },
      { type:'chart', kind:'boxplot', title:'Gráfica de caja', h:250,
        data:(d, ctx) => ({ grupos:[{ name: txt(d.variable) || 'Datos', values: resDatos(d, ctx).v }],
                            yLabel: txt(d.unidad) || '' }) },
      { type:'note', tone:'info', text:(d, ctx) => {
        const v = resDatos(d, ctx).v;
        if (v.length < 5) return '';
        const nr = STATS.normalidad(v, 0.05);
        return malo(nr) ? '' : nr.interpretacion;
      }},
      { type:'fields', title:'LECTURA DEL RESUMEN', cols:1, items:[
        { k:'lectura', label:'¿QUÉ MUESTRA EL RESUMEN SOBRE EL PROCESO?', input:'textarea', rows:4,
          ph:'Centro, dispersión, forma, atípicos, normalidad y qué implica para el proyecto' }
      ]},
      { type:'insight' }
    ],
    bi: (d, ctx) => {
      const v = resDatos(d, ctx).v;
      if (v.length < 2) return { resumenN: v.length };
      const s = descrip(v), nr = STATS.normalidad(v, 0.05);
      const im = icMedia(v, 0.95);
      return { resumenN: s.n, resumenMedia: s.media, resumenMediana: s.mediana,
               resumenDesv: s.s, resumenVarianza: s.varianza,
               resumenICmediaInf: im[0], resumenICmediaSup: im[1],
               resumenNormalP: malo(nr) ? NaN : nr.p,
               resumenEsNormal: malo(nr) ? false : !!nr.normal };
    }
  };

  /* ======================================================================
     6 · PLAN MSA
     Manual p100-121 (planeación del estudio de sistema de medición)
     ==================================================================== */

  /** Resolución requerida por la regla del 10: 1/10 de la tolerancia */
  const resReq = tol => (num(tol) > 0 ? num(tol) / 10 : NaN);

  const T_MSA_PLAN = {
    id: 'medir.msa_plan',
    mod: 'MEDIR',
    extra: true,
    sheet: 'Plan MSA',
    title: 'PLAN MSA — PLANEACIÓN DEL ESTUDIO DEL SISTEMA DE MEDICIÓN',
    desc: 'Define, antes de medir, qué gage se usa para cada variable, con qué resolución, quién ejecuta el estudio, cuándo, cuál es el criterio de aceptación y qué se hace si el sistema de medición no resulta capaz.',
    guide: [
      'Un dato malo cuesta más que no tener dato: si el sistema de medición no es válido, la línea base, el Cpk y todas las decisiones del proyecto quedan comprometidas.',
      'REGLA DEL 10 (regla de oro de la resolución): el instrumento debe poder leer al menos 1/10 de la TOLERANCIA (USL − LSL) o 1/10 de la variación del proceso (6σ). Si la tolerancia es 1,0 mm, el gage debe leer 0,1 mm o menos.',
      'Un gage con resolución insuficiente produce muchos datos repetidos, pocas categorías distintivas (ndc bajo) y hace parecer que el proceso no varía cuando en realidad sí lo hace.',
      'Para cada variable crítica del proceso (las Y y las X clave del mapa detallado) define: qué se mide, con qué gage, con qué resolución, quién mide, cada cuánto y contra qué criterio.',
      'Elige el TIPO DE ESTUDIO según el dato: VARIABLES (continuo) → GR&R cruzado por ANOVA · ATRIBUTOS (pasa/no pasa, conforme/no conforme) → análisis de concordancia con kappa.',
      'Antes del estudio verifica siempre: gage CALIBRADO y con certificado vigente, método de medición documentado, piezas que cubran todo el rango de variación, y operadores que midan como lo hacen todos los días.',
      'CRITERIO DE ACEPTACIÓN por variables: %GR&R < 10 % aceptable · 10 % a 30 % aceptable según costo y criticidad · > 30 % inaceptable; y ndc ≥ 5. Por atributos: kappa > 0,70 aceptable, > 0,90 excelente y eficacia contra el estándar ≥ 90 %.',
      'Si el sistema NO es capaz, el plan de acción típico es: calibrar o ajustar el equipo · reemplazar el gage por uno de mayor resolución · estandarizar y documentar el método de medición · fabricar un dispositivo de sujeción o posicionamiento · entrenar y certificar a los evaluadores · definir muestras patrón (límites físicos de aceptación) para los atributos · y repetir el estudio antes de recolectar la línea base.',
      'Deja registrada la periodicidad: el MSA no es de una sola vez, se repite tras calibraciones, cambios de gage, cambios de método o rotación de personal.'
    ],
    blocks: [
      { type:'fields', title:'ALCANCE DEL PLAN', cols:4, items:[
        { k:'proceso',   label:'PROCESO', input:'text', w:2 },
        { k:'area',      label:'ÁREA / SEDE', input:'text' },
        { k:'fecha',     label:'FECHA DEL PLAN', input:'date' },
        { k:'lider',     label:'LÍDER DEL PROYECTO', input:'text' },
        { k:'analista',  label:'ANALISTA MSA', input:'text' },
        { k:'periodicidad', label:'PERIODICIDAD DEL MSA', input:'select',
          opts:['Al inicio del proyecto', 'Semestral', 'Anual', 'Tras cada calibración',
                'Tras cambio de gage o método', 'Tras rotación de personal'], w:2 }
      ]},
      { type:'fields', title:'REGLA DEL 10 — RESOLUCIÓN REQUERIDA', cols:4, items:[
        { k:'caracteristica', label:'CARACTERÍSTICA PRINCIPAL', input:'text', w:2 },
        { k:'lsl',       label:'LSL', input:'number', step:'any' },
        { k:'usl',       label:'USL', input:'number', step:'any' },
        { k:'tolerancia', label:'TOLERANCIA (USL − LSL)', ro:true, fmt:'n4',
          calc:(d) => { const t = num(d.usl) - num(d.lsl); return t > 0 ? t : NaN; } },
        { k:'resReq',    label:'RESOLUCIÓN REQUERIDA (tolerancia / 10)', ro:true, fmt:'n5',
          calc:(d) => resReq(num(d.usl) - num(d.lsl)),
          hint:'El gage debe leer este valor o menos' },
        { k:'resGage',   label:'RESOLUCIÓN REAL DEL GAGE', input:'number', step:'any' },
        { k:'veredictoRes', label:'¿CUMPLE LA REGLA DEL 10?', ro:true,
          calc:(d) => {
            const req = resReq(num(d.usl) - num(d.lsl)), real = num(d.resGage);
            if (!isFinite(req) || !(real > 0)) return '';
            return real <= req ? 'SÍ CUMPLE' : 'NO CUMPLE';
          } }
      ]},
      { type:'cards', items:(d) => {
        const tol = num(d.usl) - num(d.lsl);
        const req = resReq(tol), real = num(d.resGage);
        const rel = (tol > 0 && real > 0) ? real / tol : NaN;   // resolución sobre tolerancia
        const ok = (req > 0 && real > 0) ? real <= req : null;
        return [
          { label:'TOLERANCIA', value: tol > 0 ? fmt(tol, 'n4') : '—' },
          { label:'RESOLUCIÓN REQUERIDA', value: isFinite(req) ? fmt(req, 'n5') : '—',
            hint:'1/10 de la tolerancia' },
          { label:'RESOLUCIÓN DEL GAGE', value: real > 0 ? fmt(real, 'n5') : '—' },
          { label:'RESOLUCIÓN / TOLERANCIA', value: isFinite(rel) ? fmt(rel, 'p1') : '—',
            tone: isFinite(rel) ? (rel <= 0.1 ? 'ok' : (rel <= 0.2 ? 'warn' : 'bad')) : '',
            hint:'Debe ser ≤ 10 %' },
          { label:'REGLA DEL 10', value: ok === null ? '—' : (ok ? 'CUMPLE' : 'NO CUMPLE'),
            tone: ok === null ? '' : (ok ? 'ok' : 'bad'),
            hint: ok === false ? 'Consigue un instrumento con mayor resolución' : '' }
        ];
      }},
      { type:'grid', key:'rows', title:'PLAN DE ESTUDIOS MSA POR VARIABLE', min:8, max:60,
        addLabel:'Agregar variable a medir',
        cols:[
          { k:'variable',  label:'QUÉ SE MIDE (Y / X CRÍTICA)', input:'text', w:190 },
          { k:'gage',      label:'GAGE / INSTRUMENTO', input:'text', w:170 },
          { k:'resolucion', label:'RESOLUCIÓN', input:'text', w:110, align:'right' },
          { k:'tolerancia', label:'TOLERANCIA', input:'number', step:'any', w:110, align:'right' },
          { k:'regla10',   label:'RESOLUCIÓN REQUERIDA', ro:true, fmt:'n5', w:140,
            calc:(r) => resReq(r.tolerancia) },
          { k:'tipo',      label:'TIPO DE ESTUDIO', input:'select', w:140,
            opts:['GR&R por variables', 'GR&R por atributos', 'Linealidad y sesgo', 'Estabilidad'] },
          { k:'quien',     label:'QUIÉN LO EJECUTA', input:'text', w:150 },
          { k:'cuando',    label:'CUÁNDO', input:'date', w:130 },
          { k:'criterio',  label:'CRITERIO DE ACEPTACIÓN', input:'text', w:200,
            ph:'%GR&R < 10 % y ndc ≥ 5' },
          { k:'estado',    label:'ESTADO', input:'select', w:130,
            opts:['Programado', 'En ejecución', 'Aceptado', 'Marginal', 'Rechazado'] }
        ],
        foot:[
          { k:'tolerancia', calc:(rows) => filled(rows, 'variable').length, fmt:'n0' },
          { k:'__label', label:'VARIABLES PLANEADAS' }
        ]
      },
      { type:'html', title:'ESTADO DEL PLAN', tight:true, render:(d) => {
        const rows = filled(arr(d.rows), 'variable');
        if (!rows.length) return aviso('Registra las variables que van a someterse a estudio MSA.', 'info');
        const est = ['Programado', 'En ejecución', 'Aceptado', 'Marginal', 'Rechazado'];
        const tonos = { 'Aceptado':'ok', 'Marginal':'warn', 'Rechazado':'bad' };
        const cuerpo = est.map(e => {
          const n = rows.filter(r => txt(r.estado) === e).length;
          return [{ v:e, b:true }, { v: fmt(n, 'n0'), n:true, tone: n ? (tonos[e] || '') : '' },
                  { v: fmt(safeDiv(n, rows.length), 'p1'), n:true }];
        });
        const sinEstado = rows.filter(r => est.indexOf(txt(r.estado)) < 0).length;
        if (sinEstado) cuerpo.push([{ v:'Sin clasificar', b:true }, { v: fmt(sinEstado, 'n0'), n:true },
                                    { v: fmt(safeDiv(sinEstado, rows.length), 'p1'), n:true }]);
        return tabla(['ESTADO', 'VARIABLES', '%'], cuerpo, { numDesde:1 });
      }},
      { type:'note', tone:'info', text:'CRITERIOS DE ACEPTACIÓN DE REFERENCIA · Por VARIABLES (AIAG): %GR&R menor a 10 % → sistema aceptable; entre 10 % y 30 % → puede aceptarse según la aplicación, el costo del gage y la criticidad de la característica; mayor a 30 % → no aceptable, hay que mejorar o reemplazar el sistema de medición. Además el ndc (número de categorías distintivas) debe ser 5 o más. Por ATRIBUTOS: kappa mayor a 0,70 → aceptable; mayor a 0,90 → excelente; la concordancia contra el estándar del experto debería ser 90 % o más.' },
      { type:'grid', key:'acciones', title:'PLAN DE ACCIÓN SI EL SISTEMA DE MEDICIÓN NO ES CAPAZ',
        min:6, max:40, addLabel:'Agregar acción',
        cols:[
          { k:'hallazgo',  label:'HALLAZGO', input:'text', w:200,
            ph:'Ej.: reproducibilidad alta entre operadores' },
          { k:'causa',     label:'FUENTE DE VARIACIÓN', input:'select', w:160,
            opts:['Resolución', 'Exactitud (sesgo)', 'Linealidad', 'Estabilidad',
                  'Repetibilidad (equipo)', 'Reproducibilidad (operadores)', 'Método / criterio'] },
          { k:'accion',    label:'ACCIÓN', input:'text', w:240,
            ph:'Calibrar · reemplazar gage · estandarizar método · entrenar y certificar · muestras patrón' },
          { k:'responsable', label:'RESPONSABLE', input:'text', w:150 },
          { k:'fecha',     label:'FECHA COMPROMISO', input:'date', w:140 },
          { k:'verificacion', label:'CÓMO SE VERIFICA', input:'text', w:190,
            ph:'Repetir el GR&R y alcanzar el criterio' },
          { k:'estado',    label:'ESTADO', input:'select', w:130,
            opts:['Pendiente', 'En curso', 'Cerrada'] }
        ]
      },
      { type:'note', tone:'warn', text:(d, ctx) => {
        const m = (ctx && ctx.all && ctx.all['medir.msa_grr']) || null;
        if (!m || !hasContent(m)) return 'Cuando ejecutes el plan, registra las mediciones en «Evaluación del sistema de medición — MSA (GR&R)»: allí se calculan el %GR&R, el ndc y el kappa que cierran este plan.';
        const r = grrDe(m);
        if (malo(r)) return '';
        return 'Resultado actual del estudio ejecutado: %GR&R = ' +
          pp(isFinite(r.pctTolerancia.grr) ? r.pctTolerancia.grr : r.pctEstudio.grr, 2) +
          ' · ndc = ' + fmt(r.ndc, 'n0') + ' · sistema ' + r.veredicto +
          (r.tono === 'ok' ? '. Puedes proceder a recolectar la línea base.' : '. Ejecuta el plan de acción antes de recolectar la línea base.');
      }},
      { type:'fields', title:'DECISIÓN', cols:2, items:[
        { k:'decision', label:'¿SE AUTORIZA RECOLECTAR LA LÍNEA BASE?', input:'select',
          opts:['SÍ, el sistema de medición es válido', 'NO, primero se ejecutan las acciones',
                'CONDICIONADO (aceptable según costo y criticidad)'] },
        { k:'observaciones', label:'OBSERVACIONES', input:'textarea', rows:4 }
      ]},
      { type:'insight' }
    ],
    bi: (d) => {
      const rows = filled(arr(d.rows), 'variable');
      const acc = filled(arr(d.acciones), 'accion');
      const tol = num(d.usl) - num(d.lsl);
      const req = resReq(tol), real = num(d.resGage);
      return {
        msaPlanVariables: rows.length,
        msaPlanAceptados: rows.filter(r => txt(r.estado) === 'Aceptado').length,
        msaPlanRechazados: rows.filter(r => txt(r.estado) === 'Rechazado').length,
        msaPlanAcciones: acc.length,
        msaPlanAccionesAbiertas: acc.filter(r => txt(r.estado) !== 'Cerrada').length,
        msaPlanResolucionReq: req,
        msaPlanResolucionGage: real > 0 ? real : NaN,
        msaPlanRegla10: (req > 0 && real > 0) ? (real <= req) : null,
        msaPlanDecision: txt(d.decision)
      };
    }
  };

  /* ====================================================================== */
  return [ T_MSA_GRR, T_CAPACIDAD, T_HISTOGRAMA, T_DISPERSION, T_RESUMEN, T_MSA_PLAN ];

})();

registerTools(SPECS_EXTRA_MEDIR);
