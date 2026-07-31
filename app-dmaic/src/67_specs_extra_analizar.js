/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   SPECS EXTRA — FASE ANALIZAR  (herramientas del MANUAL que NO están en el Excel)
   ---------------------------------------------------------------------------
   Fuente: _dump/MANUAL_texto.txt · páginas 178 a 215
     p180-181  Estadística inferencial · criterio de decisión del valor p
     p182-189  Prueba de hipótesis comparando MEDIAS (datos normales)
               1 sample t-Test · 2 sample t-Test · One Way ANOVA
     p190-194  Prueba de hipótesis comparando MEDIANAS (datos no normales)
               Kruskal-Wallis · Mood´s median test
     p195-198  Prueba de hipótesis comparando DESVIACIÓN ESTÁNDAR (variación)
               F-test (2 muestras) · Levene / Brown-Forsythe (3 o más)
     p199-203  Prueba de hipótesis comparando PROPORCIONES (porcentajes)
               1 Proportion · 2 Proportions · Chi-Square
     p204-211  Correlación (Pearson) y Regresión lineal simple
     p212-215  Finalización de la validación de causas y causa raíz

   Estas herramientas NO existen como hoja en los cinco libros de Excel
   originales: viven sólo en la app y en el libro consolidado, por eso van
   marcadas con `extra:true` y SIN mapeo `xl`.

   Todo el cálculo inferencial se delega en STATS (45_stats.js).
   JavaScript de navegador plano: sin módulos, sin librerías, sin red.
   ========================================================================== */
'use strict';

const SPECS_EXTRA_ANALIZAR = (function(){

  /* ======================================================================
     HELPERS PRIVADOS DEL MÓDULO (no contaminan el ámbito global)
     ==================================================================== */

  /** Texto limpio */
  const txt = v => String(v === null || v === undefined ? '' : v).trim();
  /** Filas con contenido en la columna `k` */
  const filled = (rows, k) => arr(rows).filter(r => txt(r && r[k]) !== '');
  /** Primer valor no vacío */
  const or = (a, b) => txt(a) !== '' ? txt(a) : b;
  /** Datos de otra herramienta del proyecto activo */
  const dataOf = (ctx, id) => (ctx && ctx.all && ctx.all[id]) || {};
  /** ¿el resultado de STATS es inutilizable? */
  const malo = r => !r || !!r.error;
  /** ¿es un número real y utilizable? (NaN de STATS incluido) */
  const fin = v => (typeof v === 'number') ? isFinite(v) : isNum(v);
  /** Número formateado o guion largo */
  const nf = (v, f) => fin(v) ? fmt(v, f || 'n2') : '—';
  /** Grados de libertad, que pueden venir como número o como par [gl1, gl2] */
  const glTxt = g => Array.isArray(g)
    ? g.map(x => nf(x, 'n0')).join(' y ')
    : (fin(g) ? (num(g) % 1 === 0 ? nf(g, 'n0') : nf(g, 'n2')) : '—');
  /** Nivel de significancia α (por defecto 0,05 como manda el manual) */
  const alfaDe = d => { const a = num(d && d.alfa); return (a > 0 && a < 1) ? a : 0.05; };
  /** Opciones de α para los selectores */
  const OPTS_ALFA = [
    { v:'0,05', l:'0,05 — 95 % de confianza (estándar del manual)' },
    { v:'0,01', l:'0,01 — 99 % de confianza (decisión crítica)' },
    { v:'0,10', l:'0,10 — 90 % de confianza (exploratorio)' }
  ];

  /** Deduplica por texto en MAYÚSCULAS conservando el orden */
  function dedup(list){
    const seen = {}, out = [];
    arr(list).forEach(x => {
      const k = txt(x && x.txt !== undefined ? x.txt : x).toUpperCase();
      if (!k || seen[k]) return;
      seen[k] = 1; out.push(x);
    });
    return out;
  }

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

  /** Criterio de decisión del manual (p181). Se muestra SIEMPRE. */
  const CRITERIO =
    'CRITERIO DE DECISIÓN DEL VALOR p (manual p181): si p ≤ 0,05 se RECHAZA H₀ y se acepta H₁ ' +
    '→ SÍ hay diferencia estadísticamente significativa. Si p > 0,05 NO se rechaza H₀ ' +
    '→ no hay evidencia suficiente para afirmar que exista diferencia. ' +
    'El valor p es la probabilidad de observar una diferencia como la medida (o mayor) si en ' +
    'realidad H₀ fuera cierta: entre más pequeño, más difícil es explicar el resultado por puro azar.';

  /* ======================================================================
     1 · PRUEBA DE HIPÓTESIS
     Manual p180 a p203
     ==================================================================== */

  /* ---------------- lectura de los datos capturados ---------------------- */

  /** Grupos {nombre, valores[]} a partir de la grilla valor + grupo.
   *  El formato sirve tal cual para STATS.grupos() y para CHART kind 'boxplot'. */
  function gruposDe(d){
    const mapa = {}, orden = [];
    arr(d && d.rows).forEach(r => {
      if (!isNum(r && r.valor)) return;
      const g = txt(r.grupo) || 'MUESTRA 1';
      if (!mapa[g]){ mapa[g] = []; orden.push(g); }
      mapa[g].push(num(r.valor));
    });
    return orden.map(g => ({ nombre: g, valores: mapa[g] }));
  }
  /** Todos los valores numéricos, sin importar el grupo */
  const todosDe = d => vals(arr(d && d.rows), 'valor');

  /** Filas de la tabla de proporciones: {grupo, x, n} */
  function propsDe(d){
    return arr(d && d.props)
      .map(r => ({ grupo: txt(r && r.grupo), x: num(r && r.x), n: num(r && r.n) }))
      .filter(r => r.n > 0 && r.x >= 0 && r.x <= r.n);
  }

  /* ---------------- catálogo de pruebas (H₀ / H₁ del manual) ------------- */

  const FAMILIAS = [
    { v:'MEDIAS',       l:'Comparar MEDIAS o promedios — datos NORMALES (p182)' },
    { v:'MEDIANAS',     l:'Comparar MEDIANAS — datos NO normales o con atípicos (p190)' },
    { v:'VARIANZAS',    l:'Comparar DESVIACIONES ESTÁNDAR o varianzas — variación (p195)' },
    { v:'PROPORCIONES', l:'Comparar PROPORCIONES o porcentajes — datos no continuos (p199)' }
  ];

  const PRUEBAS = {
    T1: { fam:'MEDIAS', nombre:'1 sample t-Test — t de una muestra', est:'t',
          cuando:'Comparar el promedio de UNA muestra contra un valor específico, histórico u objetivo.',
          h0: d => 'H₀: la media del proceso es IGUAL al valor de referencia (μ = ' + nf(num(d.mu0), 'n3') + ')',
          h1: d => 'H₁: la media del proceso es DIFERENTE del valor de referencia (μ ≠ ' + nf(num(d.mu0), 'n3') + ')' },
    T2: { fam:'MEDIAS', nombre:'2 sample t-Test — t de dos muestras', est:'t',
          cuando:'Comparar los promedios de DOS muestras independientes (turno A vs. turno B, ruta nueva vs. vieja).',
          h0: () => 'H₀: las medias de las dos muestras son IGUALES (μ₁ = μ₂)',
          h1: () => 'H₁: las medias de las dos muestras son DIFERENTES (μ₁ ≠ μ₂)' },
    TPAR: { fam:'MEDIAS', nombre:'Paired t-Test — t pareada', est:'t',
          cuando:'Comparar el ANTES y el DESPUÉS sobre las MISMAS unidades (mismo operario, misma máquina, misma pieza).',
          h0: () => 'H₀: la diferencia media entre el antes y el después es CERO (μ_d = 0)',
          h1: () => 'H₁: la diferencia media entre el antes y el después es DISTINTA de cero (μ_d ≠ 0)' },
    ANOVA: { fam:'MEDIAS', nombre:'One Way ANOVA — análisis de varianza de un factor', est:'F',
          cuando:'Comparar los promedios de TRES O MÁS muestras a la vez con un solo factor a varios niveles.',
          h0: () => 'H₀: todas las medias de los grupos son IGUALES (μ₁ = μ₂ = … = μk)',
          h1: () => 'H₁: al menos UNA media es diferente de las demás' },
    KW: { fam:'MEDIANAS', nombre:'Kruskal-Wallis test', est:'H (χ²)',
          cuando:'Comparar las medianas de dos o más muestras que NO son normales y NO tienen valores extremos.',
          h0: () => 'H₀: todas las medianas de los grupos son IGUALES',
          h1: () => 'H₁: al menos una MEDIANA es diferente de las demás' },
    MOOD: { fam:'MEDIANAS', nombre:'Mood´s median test — prueba de la mediana de Mood', est:'χ²',
          cuando:'Comparar las medianas de dos o más muestras que SÍ contienen valores extremos (outliers).',
          h0: () => 'H₀: todos los grupos comparten la MISMA mediana',
          h1: () => 'H₁: al menos un grupo tiene una MEDIANA distinta' },
    F2: { fam:'VARIANZAS', nombre:'F-test — prueba F de dos varianzas', est:'F',
          cuando:'Comparar la desviación estándar de DOS muestras con distribución normal.',
          h0: () => 'H₀: las dos desviaciones estándar son IGUALES (σ₁ = σ₂)',
          h1: () => 'H₁: las dos desviaciones estándar son DIFERENTES (σ₁ ≠ σ₂)' },
    LEVENE: { fam:'VARIANZAS', nombre:'Levene´s test / Brown-Forsythe — varianzas iguales', est:'W (F)',
          cuando:'Comparar la desviación estándar de TRES O MÁS muestras, o de datos que no son normales.',
          h0: () => 'H₀: todas las desviaciones estándar son IGUALES (σ₁ = σ₂ = … = σk)',
          h1: () => 'H₁: al menos una desviación estándar es diferente' },
    P1: { fam:'PROPORCIONES', nombre:'1 Proportion test — prueba Z de una proporción', est:'Z',
          cuando:'Comparar un porcentaje contra una proporción específica o histórica (por ejemplo 3 % de defectos).',
          h0: d => 'H₀: la proporción de la muestra es IGUAL a la de referencia (p = ' + nf(num(d.p0), 'n2') + ')',
          h1: d => 'H₁: la proporción de la muestra es DIFERENTE de la de referencia (p ≠ ' + nf(num(d.p0), 'n2') + ')' },
    P2: { fam:'PROPORCIONES', nombre:'2 Proportions test — prueba Z de dos proporciones', est:'Z',
          cuando:'Comparar DOS porcentajes entre sí (defectos de la máquina A vs. la máquina B).',
          h0: () => 'H₀: las dos proporciones son IGUALES (p₁ = p₂)',
          h1: () => 'H₁: las dos proporciones son DIFERENTES (p₁ ≠ p₂)' },
    CHI2: { fam:'PROPORCIONES', nombre:'Chi-Square test — chi cuadrado de asociación', est:'χ²',
          cuando:'Comparar TRES O MÁS porcentajes entre sí, o probar si dos variables categóricas están asociadas.',
          h0: () => 'H₀: todas las proporciones son IGUALES: las variables son INDEPENDIENTES',
          h1: () => 'H₁: al menos una proporción es diferente: SÍ hay asociación' }
  };

  const OPTS_MEDIAS = [
    { v:'T1',    l:'1 sample t-Test — una muestra contra un valor de referencia' },
    { v:'T2',    l:'2 sample t-Test — dos muestras independientes' },
    { v:'TPAR',  l:'Paired t-Test — t pareada (antes / después sobre la misma unidad)' },
    { v:'ANOVA', l:'One Way ANOVA — tres o más muestras' }
  ];
  const OPTS_MEDIANAS = [
    { v:'KW',   l:'Kruskal-Wallis — dos o más muestras SIN valores extremos' },
    { v:'MOOD', l:'Mood´s median test — dos o más muestras CON valores extremos' }
  ];
  const OPTS_VAR = [
    { v:'F2',     l:'F-test — dos muestras (datos normales)' },
    { v:'LEVENE', l:'Levene / Brown-Forsythe — tres o más muestras o datos no normales' }
  ];
  const OPTS_PROP = [
    { v:'P1',   l:'1 Proportion test — un porcentaje contra una referencia' },
    { v:'P2',   l:'2 Proportions test — dos porcentajes entre sí' },
    { v:'CHI2', l:'Chi-Square test — tres o más porcentajes / asociación' }
  ];

  /** Familia elegida */
  const famDe = d => {
    const f = txt(d && d.objetivo).toUpperCase();
    return FAMILIAS.some(x => x.v === f) ? f : 'MEDIAS';
  };
  /** Clave de la prueba elegida dentro de la familia */
  function pruebaDe(d){
    const f = famDe(d);
    if (f === 'MEDIAS')       return PRUEBAS[txt(d.pruebaMedias)]   ? txt(d.pruebaMedias)   : 'T2';
    if (f === 'MEDIANAS')     return PRUEBAS[txt(d.pruebaMedianas)] ? txt(d.pruebaMedianas) : 'KW';
    if (f === 'VARIANZAS')    return PRUEBAS[txt(d.pruebaVar)]      ? txt(d.pruebaVar)      : 'F2';
    return PRUEBAS[txt(d.pruebaProp)] ? txt(d.pruebaProp) : 'P1';
  }
  const specDe = d => PRUEBAS[pruebaDe(d)] || PRUEBAS.T2;

  /* ---------------- ejecución de la prueba ------------------------------ */

  /** Corre la prueba seleccionada con STATS. Devuelve null si faltan datos. */
  function correr(d){
    if (!d) return null;
    const a = alfaDe(d), k = pruebaDe(d);

    if (famDe(d) === 'PROPORCIONES'){
      const R = propsDe(d);
      if (k === 'P1'){
        if (!R.length) return null;
        return STATS.prop1(R[0].x, R[0].n, num(d.p0), a);
      }
      if (k === 'P2'){
        if (R.length < 2) return null;
        return STATS.prop2(R[0].x, R[0].n, R[1].x, R[1].n, a);
      }
      if (R.length < 2) return null;
      return STATS.chi2Indep({
        filas: ['EVENTOS (defectos, éxitos…)', 'RESTO DE LA MUESTRA'],
        columnas: R.map(r => r.grupo || '—'),
        datos: [R.map(r => r.x), R.map(r => Math.max(0, r.n - r.x))]
      }, a);
    }

    const G = gruposDe(d);
    if (!G.length) return null;
    switch (k){
      case 'T1':     return STATS.tTest1(G[0].valores, num(d.mu0), a);
      case 'T2':     return G.length < 2 ? null
                       : STATS.tTest2(G[0].valores, G[1].valores, a, txt(d.varIguales) === 'POOL');
      case 'TPAR':   return G.length < 2 ? null : STATS.tTestPar(G[0].valores, G[1].valores, a);
      case 'ANOVA':  return STATS.anova1(G, a);
      case 'KW':     return STATS.kruskal(G, a);
      case 'MOOD':   return STATS.moodMedian(G, a);
      case 'F2':     return G.length < 2 ? null : STATS.fTest2(G[0].valores, G[1].valores, a);
      case 'LEVENE': return STATS.levene(G, a);
    }
    return null;
  }

  /* ---------------- normalidad y recomendación de familia --------------- */

  /** ¿Cuántos datos quedan fuera de los bigotes (regla 1,5 · RIC)? */
  function atipicos(v){
    if (v.length < 4) return 0;
    const q1 = STATS.quantil(v, 0.25), q3 = STATS.quantil(v, 0.75), ric = q3 - q1;
    if (!(ric > 0)) return 0;
    const lo = q1 - 1.5 * ric, hi = q3 + 1.5 * ric;
    return v.filter(x => x < lo || x > hi).length;
  }

  /** Diagnóstico por grupo: n, media, mediana, s, Anderson-Darling y atípicos */
  function diagnostico(d){
    const a = alfaDe(d);
    return gruposDe(d).map(g => {
      const r = STATS.normalidad(g.valores, a);
      return {
        nombre: g.nombre, n: g.valores.length,
        media: avg(g.valores), mediana: median(g.valores), s: stdev(g.valores),
        ad: malo(r) ? NaN : r.AD, p: malo(r) ? NaN : r.p,
        normal: !malo(r) && !!r.normal, error: malo(r) ? (r && r.error) || '' : '',
        out: atipicos(g.valores)
      };
    });
  }

  /** Familia y prueba RECOMENDADAS a partir de la normalidad y del nº de grupos */
  function recomendacion(d){
    const D = diagnostico(d), k = D.length;
    if (!k) return { fam:'', prueba:'', txt:'Registra los datos (valor + grupo) para que la app evalúe la normalidad y recomiende la prueba.' };
    const conAD = D.filter(x => fin(x.p));
    const noNormales = conAD.filter(x => !x.normal).length;
    const conOut = D.filter(x => x.out > 0).length;
    if (!conAD.length)
      return { fam:'', prueba:'', txt:'Cada grupo necesita al menos 5 datos para poder evaluar la normalidad con Anderson-Darling. Registra más observaciones.' };

    if (noNormales === 0){
      const p = k === 1 ? 'T1' : (k === 2 ? 'T2' : 'ANOVA');
      return { fam:'MEDIAS', prueba:p,
        txt:'Los ' + k + ' grupo(s) SÍ siguen una distribución normal (Anderson-Darling con p ≥ ' +
            nf(alfaDe(d), 'n2') + '). El manual recomienda comparar MEDIAS con ' +
            PRUEBAS[p].nombre + '. Si lo que te interesa es la variación y no el promedio, ' +
            'usa ' + (k === 2 ? 'F-test' : 'Levene / Brown-Forsythe') + '.' };
    }
    const p = conOut ? 'MOOD' : 'KW';
    return { fam:'MEDIANAS', prueba:p,
      txt: noNormales + ' de ' + conAD.length + ' grupo(s) NO siguen una distribución normal' +
        (conOut ? ' y ' + conOut + ' grupo(s) tienen valores extremos (outliers)' : '') +
        '. El manual recomienda comparar MEDIANAS con ' + PRUEBAS[p].nombre +
        '. También puedes usar Levene / Brown-Forsythe si comparas variación, porque no exige normalidad.' };
  }

  /** ¿La prueba elegida coincide con la recomendada? */
  function coincide(d){
    const r = recomendacion(d);
    if (!r.fam) return null;
    return r.fam === famDe(d);
  }

  /* ---------------- redacción de la conclusión de negocio --------------- */

  function conclusionNegocio(d){
    const r = correr(d);
    if (malo(r)) return '';
    const y = or(d.variable, 'la variable de respuesta');
    const c = txt(d.causa);
    const enc = r.rechaza
      ? 'DECISIÓN: se RECHAZA H₀. Con ' + nf((1 - alfaDe(d)) * 100, 'n0') +
        ' % de confianza SÍ existe una diferencia estadísticamente significativa en ' + y + '. ' +
        (c ? 'La causa «' + c + '» queda VALIDADA con datos: pasa a la fase MEJORAR como causa sobre la que se actúa. ' : '')
      : 'DECISIÓN: NO se rechaza H₀. No hay evidencia suficiente para afirmar que exista una diferencia en ' + y + '. ' +
        (c ? 'La causa «' + c + '» NO queda validada con esta prueba: descártala, o recolecta más datos y repite el análisis antes de invertir en una solución. ' : '');
    return enc + r.interpretacion;
  }

  /* ---------------- la herramienta -------------------------------------- */

  const T_HIPOTESIS = {
    id: 'analizar.prueba_hipotesis',
    mod: 'ANALIZAR',
    extra: true,
    sheet: 'Prueba de hipotesis',
    title: 'PRUEBA DE HIPÓTESIS — VALIDACIÓN ESTADÍSTICA DE LA CAUSA',
    desc: 'Estadística inferencial para validar con datos si la causa potencial realmente afecta la salida del proceso: compara medias, medianas, desviaciones estándar o proporciones y decide con el valor p.',
    guide: [
      'La prueba de hipótesis es el paso que convierte una OPINIÓN del equipo en una CONCLUSIÓN con evidencia: es lo que le da certeza a la causa raíz (manual p180).',
      'H₀ (hipótesis nula) siempre dice que «algo es IGUAL a otro algo»: no se desea probar. H₁ (hipótesis alternativa) dice que «algo es DIFERENTE»: es la que se desea probar (p181).',
      'CRITERIO: si p ≤ 0,05 se rechaza H₀ y se acepta H₁ (SÍ hay diferencia significativa). Si p > 0,05 NO se rechaza H₀ (no hay evidencia de diferencia).',
      'PRIMERO evalúa la normalidad. Si los datos son normales se comparan MEDIAS (t y ANOVA); si no lo son, se comparan MEDIANAS (Kruskal-Wallis o Mood). La app lo hace por ti con Anderson-Darling y te recomienda la familia.',
      'Captura los datos en una sola tabla: una fila por observación, con su VALOR y el nombre del GRUPO o muestra a la que pertenece. Los grupos se detectan solos por el texto que escribas.',
      'MEDIAS: 1 muestra contra un valor de referencia (1 sample t) · 2 muestras independientes (2 sample t) · antes y después de la MISMA unidad (t pareada) · 3 o más muestras (One Way ANOVA).',
      'MEDIANAS: Kruskal-Wallis cuando los datos no son normales pero no hay valores extremos; Mood´s median test cuando SÍ hay outliers, porque es la más robusta frente a ellos (p191-194).',
      'VARIANZAS: F-test para dos muestras normales; Levene / Brown-Forsythe para tres o más o para datos no normales. Menos variación suele valer tanto como mejor promedio (p195-198).',
      'PROPORCIONES: para datos NO continuos (porcentaje de defectos, de quejas, de reprocesos). 1 proporción contra una referencia, 2 proporciones entre sí, o Chi cuadrado para tres o más (p199-203).',
      'El orden de los grupos importa en las pruebas de dos muestras: se toman los DOS PRIMEROS grupos en el orden en que aparecen en la tabla. En la t pareada las filas se emparejan por posición.',
      'No confundas significancia estadística con importancia práctica: revisa siempre el tamaño de la diferencia y el intervalo de confianza, no solo el valor p.',
      'Interpreta el gráfico de caja junto con el número: medias distintas con poco traslape entre las cajas confirman visualmente la diferencia (p187).'
    ],
    blocks: [
      { type:'fields', title:'ENCABEZADO — ¿QUÉ CAUSA SE ESTÁ VALIDANDO?', cols:3, items:[
        { k:'causa',    label:'CAUSA POTENCIAL A VALIDAR', input:'text', w:2,
          ph:'Causa tomada del Ishikawa, de los 5 Why´s o del árbol' },
        { k:'fecha',    label:'FECHA DEL ANÁLISIS', input:'date' },
        { k:'variable', label:'VARIABLE DE RESPUESTA Y (lo que se mide)', input:'text', w:2,
          ph:'Ej.: tiempo de recorrido, dureza de la pieza, % de defectos' },
        { k:'unidad',   label:'UNIDAD', input:'text', ph:'min · mm · % · $' },
        { k:'factor',   label:'FACTOR X (lo que cambia entre grupos)', input:'text', w:2,
          ph:'Ej.: ruta, turno, máquina, mezcla de pintura, proveedor' },
        { k:'alfa',     label:'NIVEL DE SIGNIFICANCIA α', input:'select', opts: OPTS_ALFA,
          hint:'Por defecto 0,05 (95 % de confianza)' },
        { k:'fuente',   label:'FUENTE Y PERIODO DE LOS DATOS', input:'text', w:3,
          ph:'¿De dónde salen los datos, quién los tomó y en qué periodo?' }
      ]},

      { type:'fields', title:'PASO 1 — ¿QUÉ QUIERES COMPARAR?', cols:2, items:[
        { k:'objetivo', label:'OBJETIVO DE LA COMPARACIÓN', input:'select', opts: FAMILIAS, w:2,
          hint:'Del objetivo depende la familia de pruebas que ofrece el manual' },
        { k:'pruebaMedias', label:'PRUEBA PARA MEDIAS', input:'select', opts: OPTS_MEDIAS, w:2,
          when: d => famDe(d) === 'MEDIAS' },
        { k:'mu0', label:'VALOR DE REFERENCIA μ₀ (media histórica u objetivo)', input:'number', step:'any',
          when: d => famDe(d) === 'MEDIAS' && pruebaDe(d) === 'T1' },
        { k:'varIguales', label:'SUPUESTO DE VARIANZAS', input:'select',
          opts:[{ v:'WELCH', l:'Welch — varianzas distintas (recomendado)' },
                { v:'POOL',  l:'Agrupada (pooled) — varianzas iguales' }],
          when: d => famDe(d) === 'MEDIAS' && pruebaDe(d) === 'T2',
          hint:'Si el F-test dice que las varianzas son iguales, puedes usar la agrupada' },
        { k:'pruebaMedianas', label:'PRUEBA PARA MEDIANAS', input:'select', opts: OPTS_MEDIANAS, w:2,
          when: d => famDe(d) === 'MEDIANAS' },
        { k:'pruebaVar', label:'PRUEBA PARA DESVIACIONES / VARIANZAS', input:'select', opts: OPTS_VAR, w:2,
          when: d => famDe(d) === 'VARIANZAS' },
        { k:'pruebaProp', label:'PRUEBA PARA PROPORCIONES', input:'select', opts: OPTS_PROP, w:2,
          when: d => famDe(d) === 'PROPORCIONES' },
        { k:'p0', label:'PROPORCIÓN DE REFERENCIA p₀ (en % o en fracción)', input:'number', step:'any',
          when: d => famDe(d) === 'PROPORCIONES' && pruebaDe(d) === 'P1',
          hint:'Escribe 3 para 3 %, o 0,03: la app entiende las dos formas' }
      ]},

      { type:'html', title:'MAPA DE DECISIÓN DEL MANUAL', tight:true, render:(d) => {
        const f = famDe(d), k = pruebaDe(d);
        const mk = (fam, filas) => filas.map(x => [
          { v: fam, b:true, tone: fam === f ? 'ok' : '' },
          { v: PRUEBAS[x].nombre, b: x === k, tone: x === k ? 'ok' : '' },
          { v: PRUEBAS[x].cuando }
        ]);
        const cuerpo = []
          .concat(mk('MEDIAS (p182)',       ['T1', 'T2', 'TPAR', 'ANOVA']))
          .concat(mk('MEDIANAS (p190)',     ['KW', 'MOOD']))
          .concat(mk('VARIANZAS (p195)',    ['F2', 'LEVENE']))
          .concat(mk('PROPORCIONES (p199)', ['P1', 'P2', 'CHI2']));
        return tabla(['OBJETIVO', 'PRUEBA', '¿CUÁNDO SE USA?'], cuerpo, {}) +
          '<div class="hint" style="margin-top:8px">En verde queda marcada la familia y la prueba que tienes seleccionadas.</div>';
      }},

      { type:'grid', key:'rows', title:'PASO 2 — DATOS RECOLECTADOS (una fila por observación)',
        min:15, max:600, addLabel:'Agregar observación',
        cols:[
          { k:'valor', label:'VALOR MEDIDO (Y)', input:'number', step:'any', w:150, align:'right' },
          { k:'grupo', label:'GRUPO / MUESTRA (nivel del factor X)', input:'text', w:'2fr',
            ph:'Ej.: RUTA NUEVA · RUTA VIEJA · MEZCLA 1 · TURNO A' },
          { k:'obs',   label:'OBSERVACIÓN (opcional)', input:'text', w:'2fr' }
        ],
        foot:[
          { k:'valor', label:'DATOS VÁLIDOS' },
          { k:'grupo', calc:(rows) => {
              const g = {}; let n = 0;
              arr(rows).forEach(r => { const t = txt(r.grupo); if (isNum(r.valor) && t && !g[t]){ g[t] = 1; n++; } });
              return n; }, fmt:'n0' }
        ]
      },

      { type:'note', tone:'info',
        text:'En las pruebas de DOS muestras (2 sample t, t pareada, F-test, 2 proporciones) se usan los DOS PRIMEROS grupos según el orden en que aparecen en la tabla. En la t pareada las observaciones se emparejan por posición: la 1ª del grupo A con la 1ª del grupo B, y así sucesivamente.' },

      { type:'grid', key:'props', title:'PASO 2 (BIS) — DATOS PARA PROPORCIONES (eventos y tamaño de muestra)',
        min:3, max:40, addLabel:'Agregar muestra',
        cols:[
          { k:'grupo', label:'MUESTRA / GRUPO', input:'text', w:'2fr',
            ph:'Ej.: MÁQUINA A · MÁQUINA B · TURNO 1' },
          { k:'x', label:'NÚMERO DE EVENTOS (defectos, quejas, éxitos)', input:'number', step:1, w:190, align:'right' },
          { k:'n', label:'NÚMERO DE ENSAYOS (tamaño de muestra)', input:'number', step:1, w:190, align:'right' },
          { k:'p', label:'PROPORCIÓN', ro:true, fmt:'p2', w:120,
            calc:(r) => num(r.n) > 0 ? safeDiv(num(r.x), num(r.n)) : NaN,
            tone:(v) => fin(v) ? (num(v) > 0.1 ? 'bad' : (num(v) > 0.05 ? 'warn' : 'ok')) : '' }
        ],
        foot:[
          { k:'grupo', label:'TOTAL' },
          { k:'x', calc:(rows) => sum(rows, 'x'), fmt:'n0' },
          { k:'n', calc:(rows) => sum(rows, 'n'), fmt:'n0' },
          { k:'p', calc:(rows) => safeDiv(sum(rows, 'x'), sum(rows, 'n')), fmt:'p2' }
        ]
      },

      { type:'html', title:'PASO 3 — PRUEBA DE NORMALIDAD Y RECOMENDACIÓN (Anderson-Darling)',
        tight:true, render:(d) => {
          const D = diagnostico(d), a = alfaDe(d);
          if (!D.length)
            return aviso('Registra los datos en la tabla de observaciones para evaluar la normalidad de cada grupo.', 'info');
          const cuerpo = D.map(g => [
            { v: g.nombre, b:true },
            { v: nf(g.n, 'n0'), n:true },
            { v: nf(g.media, 'n3'), n:true },
            { v: nf(g.mediana, 'n3'), n:true },
            { v: nf(g.s, 'n3'), n:true },
            { v: nf(g.ad, 'n4'), n:true },
            { v: fin(g.p) ? STATS.fmtP(g.p) : (g.error || '—'), n:true },
            { v: fin(g.p) ? (g.normal ? 'NORMAL' : 'NO NORMAL') : '—',
              tone: fin(g.p) ? (g.normal ? 'ok' : 'warn') : '' },
            { v: nf(g.out, 'n0'), n:true, tone: g.out ? 'warn' : '' }
          ]);
          const rec = recomendacion(d);
          const ok = coincide(d);
          return tabla(['GRUPO', 'n', 'MEDIA', 'MEDIANA', 'DESV. EST.', 'AD', 'VALOR p', 'VEREDICTO', 'ATÍPICOS'],
                       cuerpo, { numDesde:1 }) +
            aviso('RECOMENDACIÓN DE LA APP · ' + rec.txt, ok === false ? 'warn' : 'info') +
            (ok === false
              ? aviso('Ojo: seleccionaste la familia ' + famDe(d) + ' y la recomendación es ' + rec.fam +
                      '. Puedes continuar, pero deja escrito en la conclusión por qué mantienes tu elección.', 'warn')
              : '') +
            '<div class="hint" style="margin-top:8px">H₀ de Anderson-Darling: los datos SIGUEN una distribución normal. ' +
            'Si p ≥ ' + esc(fmt(a, 'n2')) + ' no se rechaza y el grupo se declara NORMAL. ' +
            'ATÍPICOS = datos fuera de los bigotes (regla 1,5 · RIC): si los hay, el manual manda usar Mood´s median test.</div>';
        }},

      { type:'cards', title:'PASO 4 — RESULTADO DE LA PRUEBA', items:(d) => {
        const r = correr(d), S = specDe(d);
        if (malo(r)) return [{ label:'RESULTADO', value:'—', tone:'warn',
          hint: (r && r.error) ? r.error : 'Faltan datos para correr ' + S.nombre }];
        const est = fin(r.estadistico) ? nf(r.estadistico, 'n4') : '—';
        return [
          { label:'PRUEBA APLICADA', value: S.est, hint: S.nombre },
          { label:'ESTADÍSTICO ' + S.est, value: est },
          { label:'GRADOS DE LIBERTAD', value: glTxt(r.gl) },
          { label:'VALOR p', value: STATS.fmtP(r.p),
            tone: r.rechaza ? 'bad' : 'ok',
            hint: r.rechaza ? 'p ≤ α → hay diferencia significativa' : 'p > α → sin diferencia significativa' },
          { label:'NIVEL α', value: fmt(alfaDe(d), 'n2'),
            hint: nf((1 - alfaDe(d)) * 100, 'n0') + ' % de confianza' },
          { label:'DECISIÓN', value: r.rechaza ? 'SE RECHAZA H₀' : 'NO SE RECHAZA H₀',
            tone: r.rechaza ? 'bad' : 'ok',
            hint: r.rechaza ? 'Se acepta H₁' : 'Se mantiene H₀' }
        ];
      }},

      { type:'html', title:'HIPÓTESIS Y ESTADÍSTICOS DE LA PRUEBA', tight:true, render:(d) => {
        const r = correr(d), S = specDe(d);
        const base = [
          [{ v:'PRUEBA', b:true }, { v: S.nombre }],
          [{ v:'¿CUÁNDO SE USA?', b:true }, { v: S.cuando }],
          [{ v:'H₀ · HIPÓTESIS NULA', b:true }, { v: S.h0(d) }],
          [{ v:'H₁ · HIPÓTESIS ALTERNATIVA', b:true }, { v: S.h1(d) }],
          [{ v:'NIVEL DE SIGNIFICANCIA α', b:true },
           { v: fmt(alfaDe(d), 'n2') + '  (' + nf((1 - alfaDe(d)) * 100, 'n0') + ' % de confianza)' }]
        ];
        if (malo(r))
          return tabla(['CONCEPTO', 'DETALLE'], base, {}) +
            aviso((r && r.error) ? r.error : 'Aún no hay datos suficientes para calcular esta prueba.', 'warn');
        base.push([{ v:'ESTADÍSTICO ' + S.est, b:true }, { v: nf(r.estadistico, 'n4') }]);
        base.push([{ v:'GRADOS DE LIBERTAD', b:true }, { v: glTxt(r.gl) }]);
        base.push([{ v:'VALOR p', b:true }, { v: STATS.fmtP(r.p), tone: r.rechaza ? 'bad' : 'ok' }]);
        base.push([{ v:'DECISIÓN', b:true },
                   { v: r.decision, tone: r.rechaza ? 'bad' : 'ok' }]);
        if (Array.isArray(r.ic) && fin(r.ic[0]))
          base.push([{ v:'INTERVALO DE CONFIANZA', b:true },
                     { v:'[' + nf(r.ic[0], 'n4') + ' ; ' + nf(r.ic[1], 'n4') + ']' }]);
        if (fin(r.r2)) base.push([{ v:'R² DEL FACTOR', b:true },
                                  { v: nf(r.r2, 'p1') + ' de la variación total explicada por el factor' }]);
        if (fin(r.cramerV)) base.push([{ v:'V DE CRAMÉR', b:true }, { v: nf(r.cramerV, 'n3') }]);
        let extra = '';
        if (txt(r.advertencia)) extra += aviso('⚠ ' + r.advertencia, 'warn');
        return tabla(['CONCEPTO', 'DETALLE'], base, {}) + extra;
      }},

      { type:'html', title:'DETALLE POR GRUPO', tight:true, render:(d) => {
        const f = famDe(d);
        if (f === 'PROPORCIONES'){
          const R = propsDe(d);
          if (!R.length) return aviso('Registra las muestras en la tabla de proporciones.', 'info');
          const tot = R.reduce((a, x) => a + x.n, 0), totx = R.reduce((a, x) => a + x.x, 0);
          const cuerpo = R.map(x => [
            { v: x.grupo || '—', b:true },
            { v: nf(x.x, 'n0'), n:true },
            { v: nf(x.n, 'n0'), n:true },
            { v: nf(safeDiv(x.x, x.n), 'p2'), n:true }
          ]);
          cuerpo.push([{ v:'GLOBAL', b:true }, { v: nf(totx, 'n0'), n:true },
                       { v: nf(tot, 'n0'), n:true }, { v: nf(safeDiv(totx, tot), 'p2'), n:true }]);
          return tabla(['MUESTRA', 'EVENTOS', 'ENSAYOS', 'PROPORCIÓN'], cuerpo, { numDesde:1 });
        }
        const G = gruposDe(d);
        if (!G.length) return aviso('Registra los datos en la tabla de observaciones.', 'info');
        const cuerpo = G.map(g => {
          const v = g.valores;
          return [
            { v: g.nombre, b:true },
            { v: nf(v.length, 'n0'), n:true },
            { v: nf(avg(v), 'n3'), n:true },
            { v: nf(median(v), 'n3'), n:true },
            { v: nf(stdev(v), 'n3'), n:true },
            { v: nf(Math.min.apply(null, v), 'n3'), n:true },
            { v: nf(Math.max.apply(null, v), 'n3'), n:true },
            { v: nf(STATS.quantil(v, 0.25), 'n3'), n:true },
            { v: nf(STATS.quantil(v, 0.75), 'n3'), n:true }
          ];
        });
        return tabla(['GRUPO', 'n', 'MEDIA', 'MEDIANA', 'DESV. EST.', 'MÍNIMO', 'MÁXIMO', 'Q1', 'Q3'],
                     cuerpo, { numDesde:1 });
      }},

      { type:'chart', kind:'boxplot', title:'Gráfica de caja por grupo (distribución, traslape y atípicos)', h:400,
        data:(d) => {
          const G = gruposDe(d);
          const o = { grupos: G,
                      yLabel: or(d.variable, 'Variable de respuesta') +
                              (txt(d.unidad) ? ' — ' + txt(d.unidad) : '') };
          if (pruebaDe(d) === 'T1' && isNum(d.mu0)) o.target = num(d.mu0);
          return o;
        }},

      { type:'chart', kind:'bar', title:'Comparación de medias por grupo', h:300,
        data:(d) => {
          const G = gruposDe(d);
          return { labels: G.map(g => g.nombre), values: G.map(g => avg(g.valores)),
                   yLabel: or(d.variable, 'Media del grupo') };
        }},

      { type:'chart', kind:'bar', title:'Comparación de proporciones por muestra', h:300,
        data:(d) => {
          const R = propsDe(d);
          return { labels: R.map(r => r.grupo || '—'),
                   values: R.map(r => safeDiv(r.x, r.n)), fmt:'p1',
                   yLabel:'Proporción observada' };
        }},

      { type:'note', tone:'warn', text: CRITERIO },

      { type:'note', tone:'info', text:(d) => conclusionNegocio(d) },

      { type:'fields', title:'PASO 5 — CONCLUSIÓN EN LENGUAJE DE NEGOCIO', cols:2, items:[
        { k:'veredicto', label:'¿LA CAUSA QUEDA VALIDADA?', input:'select',
          opts:['SÍ — la causa afecta el resultado y pasa a MEJORAR',
                'NO — la causa se descarta con datos',
                'NO CONCLUYENTE — se necesitan más datos'] },
        { k:'accion', label:'SIGUIENTE PASO', input:'text',
          ph:'¿Qué se hace con este resultado?' },
        { k:'conclusion', label:'CONCLUSIÓN PARA EL EQUIPO Y LA DIRECCIÓN (sin jerga estadística)',
          input:'textarea', rows:5, w:2,
          ph:'Ejemplo: la ruta nueva reduce en promedio 2,2 días el recorrido (p = 0,030), por lo que la ruta SÍ explica la diferencia de tiempo.' }
      ]},
      { type:'insight' }
    ],
    bi: (d) => {
      const r = correr(d), G = gruposDe(d), S = specDe(d), D = diagnostico(d);
      const base = {
        hipCausa: txt(d.causa),
        hipObjetivo: famDe(d),
        hipPrueba: S.nombre,
        hipAlfa: alfaDe(d),
        hipGrupos: G.length || propsDe(d).length,
        hipN: todosDe(d).length,
        hipNormales: D.filter(x => x.normal).length,
        hipAtipicos: D.reduce((a, x) => a + x.out, 0),
        hipVeredicto: txt(d.veredicto)
      };
      if (malo(r)) return base;
      base.hipEstadistico = fin(r.estadistico) ? num(r.estadistico) : NaN;
      base.hipP = fin(r.p) ? num(r.p) : NaN;
      base.hipRechaza = !!r.rechaza;
      base.hipDecision = r.decision;
      if (fin(r.r2)) base.hipR2 = num(r.r2);
      return base;
    }
  };

  /* ======================================================================
     2 · CORRELACIÓN Y REGRESIÓN
     Manual p204 a p211
     ==================================================================== */

  /** Pares (X, Y) completos y su etiqueta */
  function paresXY(d){
    const X = [], Y = [], L = [];
    arr(d && d.rows).forEach(r => {
      if (!isNum(r && r.x) || !isNum(r && r.y)) return;
      X.push(num(r.x)); Y.push(num(r.y)); L.push(txt(r.etiqueta));
    });
    return { X:X, Y:Y, L:L };
  }
  const nomX = d => or(d && d.nombreX, 'Variable X') +
                    (txt(d && d.unidadX) ? ' — ' + txt(d.unidadX) : '');
  const nomY = d => or(d && d.nombreY, 'Variable Y') +
                    (txt(d && d.unidadY) ? ' — ' + txt(d.unidadY) : '');
  /** Regresión cacheada por llamada (barata: n pequeño) */
  const regDe = d => { const P = paresXY(d); return STATS.regresion(P.X, P.Y, alfaDe(d)); };
  const corDe = d => { const P = paresXY(d); return STATS.correl(P.X, P.Y, alfaDe(d)); };

  const T_CORRELACION = {
    id: 'analizar.correlacion_regresion',
    mod: 'ANALIZAR',
    extra: true,
    sheet: 'Correlacion y regresion',
    title: 'CORRELACIÓN Y REGRESIÓN — RELACIÓN ENTRE X y Y',
    desc: 'Mide con el coeficiente de Pearson qué tan relacionadas están la causa (X) y el efecto (Y), ajusta la recta Y = a + bX y permite predecir el resultado del proceso al cambiar la entrada.',
    guide: [
      'La variable X (PREDICTOR) es la que puedes modificar: es independiente. La variable Y (RESPUESTA) es la que cambia si modificas X (manual p205).',
      'El COEFICIENTE DE PEARSON (r) mide el grado de asociación LINEAL entre las dos variables y va de −1 a +1.',
      'Lectura del manual (p207): r cerca de +1 → relación DIRECTA FUERTE, los datos suben juntos y están muy agrupados sobre la recta. r cerca de −1 → relación INVERSA FUERTE, cuando una sube la otra baja. r cerca de 0 → relación NULA, coeficiente muy bajo, no hay ninguna relación entre las variables.',
      'R² (R-cuad) representa el porcentaje de la variación de la salida que explica el modelo: si está cerca del 100 % la relación es mayor y hay poca dispersión respecto a la línea (p206, p211).',
      'La ECUACIÓN DE REGRESIÓN describe cómo se comportan los datos y sirve para PREDECIR: en el ejemplo del manual, Y = −10,01 + 0,3961 · X, así que con X = 53 °C se esperan 10,98 de peso.',
      'El VALOR p de la pendiente decide si la relación es real: si p ≤ 0,05 la pendiente es significativa y X sí predice a Y; si p > 0,05 la relación puede deberse al azar (ejemplo del manual: p = 0,106 → no hay correlación).',
      'El ERROR ESTÁNDAR de la estimación mide, en las unidades de Y, qué tanto se alejan los puntos de la recta: entre más pequeño, mejor predice el modelo.',
      'Revisa los RESIDUOS: si forman una curva, una U o un embudo, el modelo lineal no es el adecuado y el manual sugiere modelos cuadráticos o cúbicos (p209).',
      'CORRELACIÓN NO IMPLICA CAUSALIDAD: dos variables pueden moverse juntas por una tercera variable oculta o por pura coincidencia. La causalidad se confirma cambiando X a propósito en un piloto o en un diseño de experimentos.',
      'Un solo dato atípico puede inflar o destruir el valor de r: mira siempre el diagrama de dispersión antes de creerle al número.'
    ],
    blocks: [
      { type:'fields', title:'VARIABLES ANALIZADAS', cols:4, items:[
        { k:'causa',   label:'CAUSA POTENCIAL QUE SE VALIDA', input:'text', w:2,
          ph:'¿Qué causa del Ishikawa o de los 5 Why´s se está probando?' },
        { k:'fecha',   label:'FECHA', input:'date' },
        { k:'alfa',    label:'NIVEL DE SIGNIFICANCIA α', input:'select', opts: OPTS_ALFA },
        { k:'nombreX', label:'VARIABLE X (predictor · independiente)', input:'text', w:2,
          ph:'Ej.: temperatura del horno, número de personal' },
        { k:'unidadX', label:'UNIDAD DE X', input:'text', ph:'°C' },
        { k:'fuente',  label:'FUENTE DE LOS DATOS', input:'text' },
        { k:'nombreY', label:'VARIABLE Y (respuesta · dependiente)', input:'text', w:2,
          ph:'Ej.: peso de la pieza, tiempo de elaboración' },
        { k:'unidadY', label:'UNIDAD DE Y', input:'text', ph:'g' },
        { k:'hipotesis', label:'RELACIÓN QUE SE ESPERA', input:'text',
          ph:'¿Por qué crees que X afecta a Y?' }
      ]},

      { type:'grid', key:'rows', title:'PARES DE DATOS (X, Y)', min:15, max:500,
        addLabel:'Agregar par de datos',
        cols:[
          { k:'x',        label:'X (predictor)', input:'number', step:'any', w:140, align:'right' },
          { k:'y',        label:'Y (respuesta)', input:'number', step:'any', w:140, align:'right' },
          { k:'etiqueta', label:'ETIQUETA (opcional)', input:'text', w:'2fr' },
          { k:'ajustado', label:'Y AJUSTADO POR LA RECTA', ro:true, fmt:'n3', w:170,
            calc:(r, i, rows, d) => {
              if (!isNum(r.x)) return NaN;
              const g = regDe(d);
              return malo(g) ? NaN : g.prediccion(num(r.x));
            } },
          { k:'residuo',  label:'RESIDUO (Y − ajustado)', ro:true, fmt:'n3', w:160,
            calc:(r, i, rows, d) => {
              if (!isNum(r.x) || !isNum(r.y)) return NaN;
              const g = regDe(d);
              return malo(g) ? NaN : num(r.y) - g.prediccion(num(r.x));
            } }
        ],
        foot:[
          { k:'x', label:'PARES VÁLIDOS' },
          { k:'y', calc:(rows, d) => paresXY(d).X.length, fmt:'n0' }
        ]
      },

      { type:'chart', kind:'scatter', title:'Diagrama de dispersión con la recta de regresión ajustada', h:400,
        data:(d) => {
          const P = paresXY(d);
          const pts = P.X.map((x, i) => ({ x:x, y:P.Y[i], label:P.L[i], r:1 }));
          const g = regDe(d);
          if (!malo(g) && P.X.length >= 3){
            const mn = Math.min.apply(null, P.X), mx = Math.max.apply(null, P.X);
            if (mx > mn){
              const N = 120;
              for (let i = 0; i <= N; i++){
                const x = mn + (mx - mn) * i / N;
                pts.push({ x:x, y: g.prediccion(x), color:'#F5A623', r:1e-6 });
              }
            }
          }
          return { points: pts, xLabel: nomX(d), yLabel: nomY(d) };
        }},

      { type:'cards', title:'CORRELACIÓN DE PEARSON Y AJUSTE DE LA RECTA', items:(d) => {
        const c = corDe(d);
        if (malo(c)) return [{ label:'CORRELACIÓN', value:'—', tone:'warn',
          hint:(c && c.error) ? c.error : 'Registra al menos 3 pares (X, Y)' }];
        const g = regDe(d);
        return [
          { label:'n (PARES)', value: nf(c.n, 'n0') },
          { label:'COEFICIENTE DE PEARSON r', value: nf(c.r, 'n4'),
            tone: Math.abs(c.r) > 0.7 ? 'ok' : (Math.abs(c.r) > 0.3 ? 'warn' : 'bad'),
            hint: c.fuerza + ' · ' + c.direccion },
          { label:'R² (R-CUAD)', value: nf(c.r2, 'p1'),
            tone: c.r2 >= 0.7 ? 'ok' : (c.r2 >= 0.5 ? 'warn' : 'bad'),
            hint:'% de la variación de Y explicada por X' },
          { label:'ECUACIÓN DE REGRESIÓN', value: malo(g) ? '—' : g.ecuacion,
            hint:'Y = a + b · X' },
          { label:'VALOR p DE LA PENDIENTE', value: malo(g) ? '—' : STATS.fmtP(g.p),
            tone: (!malo(g) && g.rechaza) ? 'ok' : 'bad',
            hint: (!malo(g) && g.rechaza) ? 'X sí predice a Y' : 'La relación puede deberse al azar' },
          { label:'ERROR ESTÁNDAR DE LA ESTIMACIÓN', value: malo(g) ? '—' : nf(g.errorEstandar, 'n4'),
            hint:'Dispersión típica de los puntos alrededor de la recta, en unidades de Y' },
          { label:'PENDIENTE b', value: malo(g) ? '—' : nf(g.pendiente, 'n4'),
            hint:'Cambio esperado en Y por cada unidad que sube X' },
          { label:'INTERCEPTO a', value: malo(g) ? '—' : nf(g.intercepto, 'n4'),
            hint:'Valor de Y cuando X = 0' }
        ];
      }},

      { type:'fields', title:'PREDECIR Y A PARTIR DE UN VALOR DE X', cols:3, items:[
        { k:'predX', label:'VALOR DE X PARA PREDECIR', input:'number', step:'any',
          ph:'Ej.: 53' },
        { k:'predY', label:'Y PREDICHO POR EL MODELO', ro:true, fmt:'n4',
          calc:(d) => {
            if (!isNum(d.predX)) return NaN;
            const g = regDe(d);
            return malo(g) ? NaN : g.prediccion(num(d.predX));
          },
          hint:'Se calcula con la ecuación de regresión ajustada' },
        { k:'predNota', label:'LECTURA DE LA PREDICCIÓN', ro:true,
          calc:(d) => {
            const g = regDe(d);
            if (malo(g)) return 'Faltan datos para ajustar la recta';
            if (!isNum(d.predX)) return 'Escribe un valor de X';
            const P = paresXY(d);
            const mn = Math.min.apply(null, P.X), mx = Math.max.apply(null, P.X);
            const x = num(d.predX);
            const fuera = (x < mn || x > mx);
            return (g.rechaza ? 'Modelo significativo. ' : 'Ojo: la pendiente NO es significativa. ') +
              (fuera ? 'Además el valor está FUERA del rango medido (' + nf(mn, 'n2') + ' a ' +
                       nf(mx, 'n2') + '): extrapolar es riesgoso.'
                     : 'El valor está dentro del rango medido, la predicción es razonable.');
          } }
      ]},

      { type:'chart', kind:'bar', title:'Residuos (Y observado − Y ajustado) ordenados por X', h:300,
        data:(d) => {
          const P = paresXY(d);
          const g = regDe(d);
          if (malo(g) || P.X.length < 3) return { labels:[], values:[] };
          const orden = P.X.map((x, i) => i).sort((a, b) => P.X[a] - P.X[b]);
          return { labels: orden.map(i => P.L[i] || fmt(P.X[i], 'n2')),
                   values: orden.map(i => P.Y[i] - g.prediccion(P.X[i])),
                   yLabel:'Residuo (unidades de Y)' };
        }},

      { type:'html', title:'INTERPRETACIÓN DEL COEFICIENTE DE PEARSON (manual p207)', tight:true,
        render:(d) => {
          const c = corDe(d);
          const r = malo(c) ? NaN : Math.abs(c.r);
          const marca = (lo, hi) => (fin(r) && r > lo && r <= hi) ? 'warn' : '';
          const cuerpo = [
            [{ v:'|r| = 0,90 a 1,00', b:true, tone: marca(0.9, 1.0001) }, { v:'MUY FUERTE' },
             { v:'Datos muy agrupados sobre la recta: la relación es casi determinística.' }],
            [{ v:'|r| = 0,70 a 0,90', b:true, tone: marca(0.7, 0.9) }, { v:'FUERTE' },
             { v:'Relación clara: la X es una causa potencial seria, vale la pena validarla con prueba de hipótesis.' }],
            [{ v:'|r| = 0,50 a 0,70', b:true, tone: marca(0.5, 0.7) }, { v:'MODERADA' },
             { v:'Hay tendencia pero con dispersión: probablemente actúan otras variables además de X.' }],
            [{ v:'|r| = 0,30 a 0,50', b:true, tone: marca(0.3, 0.5) }, { v:'DÉBIL' },
             { v:'Relación pobre: no tomes decisiones solo con este dato.' }],
            [{ v:'|r| = 0,00 a 0,30', b:true, tone: marca(-0.001, 0.3) }, { v:'NULA' },
             { v:'No hay asociación lineal. Puede existir una relación curva: revisa el gráfico.' }]
          ];
          return tabla(['RANGO DE |r|', 'FUERZA', 'LECTURA'], cuerpo, {}) +
            '<div class="hint" style="margin-top:8px">El SIGNO indica la dirección: ' +
            'r POSITIVO cerca de +1 → relación DIRECTA (entre mayor X, mayor Y). ' +
            'r NEGATIVO cerca de −1 → relación INVERSA (entre menor X, mayor Y). ' +
            'r cerca de 0 → relación NULA.</div>';
        }},

      { type:'html', title:'TABLA DE RESULTADOS DE LA REGRESIÓN', tight:true, render:(d) => {
        const g = regDe(d), c = corDe(d);
        if (malo(g)) return aviso((g && g.error) || 'Registra al menos 3 pares (X, Y) para ajustar la regresión.', 'info');
        const cuerpo = [
          [{ v:'ECUACIÓN DE REGRESIÓN', b:true }, { v: g.ecuacion }],
          [{ v:'PENDIENTE b (± error estándar)', b:true },
           { v: nf(g.pendiente, 'n4') + '  ±  ' + nf(g.sePendiente, 'n4') }],
          [{ v:'INTERCEPTO a (± error estándar)', b:true },
           { v: nf(g.intercepto, 'n4') + '  ±  ' + nf(g.seIntercepto, 'n4') }],
          [{ v:'ESTADÍSTICO t DE LA PENDIENTE', b:true }, { v: nf(g.estadistico, 'n4') }],
          [{ v:'GRADOS DE LIBERTAD', b:true }, { v: glTxt(g.gl) }],
          [{ v:'VALOR p DE LA PENDIENTE', b:true },
           { v: STATS.fmtP(g.p), tone: g.rechaza ? 'ok' : 'bad' }],
          [{ v:'IC ' + nf((1 - alfaDe(d)) * 100, 'n0') + ' % DE LA PENDIENTE', b:true },
           { v:'[' + nf(g.ic[0], 'n4') + ' ; ' + nf(g.ic[1], 'n4') + ']' }],
          [{ v:'ERROR ESTÁNDAR DE LA ESTIMACIÓN (S)', b:true }, { v: nf(g.errorEstandar, 'n4') }],
          [{ v:'R² (R-CUAD)', b:true }, { v: nf(g.r2, 'p2') }],
          [{ v:'r DE PEARSON', b:true },
           { v: malo(c) ? nf(g.r, 'n4') : nf(c.r, 'n4') + '  (' + c.fuerza + ')' }],
          [{ v:'DECISIÓN SOBRE LA PENDIENTE', b:true },
           { v: g.decision, tone: g.rechaza ? 'ok' : 'bad' }]
        ];
        return tabla(['CONCEPTO', 'RESULTADO'], cuerpo, {});
      }},

      { type:'note', tone:'warn', text: CRITERIO },
      { type:'note', tone:'info', text:(d) => { const c = corDe(d); return malo(c) ? '' : c.interpretacion; } },
      { type:'note', tone:'info', text:(d) => { const g = regDe(d); return malo(g) ? '' : g.interpretacion; } },
      { type:'note', tone:'warn', text:'LA CORRELACIÓN NO IMPLICA CAUSALIDAD. Que X y Y se muevan juntas no demuestra que X cause a Y: puede haber una tercera variable que mueva a las dos, la relación puede ir al revés, o puede ser coincidencia. La causalidad se confirma cambiando X a propósito (piloto o diseño de experimentos) en la fase MEJORAR y comprobando que Y responde.' },

      { type:'fields', title:'CONCLUSIÓN', cols:2, items:[
        { k:'veredicto', label:'¿LA RELACIÓN VALIDA LA CAUSA?', input:'select',
          opts:['SÍ — X explica el comportamiento de Y y pasa a MEJORAR',
                'NO — no hay relación, la causa se descarta',
                'PARCIAL — hay relación pero faltan otras variables'] },
        { k:'uso', label:'¿PARA QUÉ SE VA A USAR EL MODELO?', input:'text',
          ph:'Ej.: fijar la temperatura de operación en el estándar' },
        { k:'conclusion', label:'CONCLUSIÓN EN LENGUAJE DE NEGOCIO', input:'textarea', rows:5, w:2,
          ph:'Ejemplo: por cada grado que sube la temperatura, el peso aumenta 0,396 g (R² = 92 %), por lo que la temperatura sí controla el peso del producto.' }
      ]},
      { type:'insight' }
    ],
    bi: (d) => {
      const P = paresXY(d), c = corDe(d);
      if (malo(c)) return { corrPares: P.X.length, corrX: txt(d.nombreX), corrY: txt(d.nombreY) };
      const g = regDe(d);
      const o = { corrPares: c.n, corrR: c.r, corrR2: c.r2, corrP: c.p,
                  corrFuerza: c.fuerza, corrDireccion: c.direccion,
                  corrSignificativa: !!c.rechaza,
                  corrX: txt(d.nombreX), corrY: txt(d.nombreY),
                  corrVeredicto: txt(d.veredicto) };
      if (!malo(g)){
        o.corrPendiente = g.pendiente;
        o.corrIntercepto = g.intercepto;
        o.corrEcuacion = g.ecuacion;
        o.corrPPendiente = g.p;
        o.corrErrorEstandar = g.errorEstandar;
      }
      return o;
    }
  };

  /* ======================================================================
     3 · NIVELES DE CAUSA  (SÍNTOMA → CAUSA APARENTE → CAUSA RAÍZ)
     Manual p169-177 (herramientas de análisis) y p212-215 (causa raíz)
     ==================================================================== */

  const NIVELES = ['SÍNTOMA', 'CAUSA APARENTE', 'CAUSA RAÍZ'];
  const NIV_DEF = [
    ['SÍNTOMA', 'Lo que se VE y se mide: el dolor reportado.',
     'Es el efecto visible, no explica nada. Si sólo atacas el síntoma, el problema regresa.',
     'La bomba sale con defecto de pintura.'],
    ['CAUSA APARENTE', 'La primera explicación que aparece al preguntar «¿por qué?».',
     'Es cierta pero incompleta: todavía se puede seguir preguntando por qué. Si actúas aquí, la solución es un parche.',
     'La temperatura de la máquina estaba baja.'],
    ['CAUSA RAÍZ', 'El origen accionable y verificable con datos.',
     'Al eliminarla el problema NO vuelve. Debe ser controlable por la organización y estar confirmada con evidencia.',
     'No existe estándar ni alarma que avise cuando la temperatura sale del rango.']
  ];

  /* ---------------- lectura del ISHIKAWA (tabla + lienzo) ---------------- */

  const nodeText = v => (v && typeof v === 'object')
    ? txt(v.t || v.text || v.txt || v.causa || v.label || v.l) : txt(v);
  const nodeKids = v => (v && typeof v === 'object')
    ? arr(v.subs || v.sub || v.children || v.hijos || v.items) : [];

  /** Causas escritas en la tabla del Ishikawa */
  function ishTabla(d){
    const out = [];
    arr(d && d.causas).forEach(r => {
      const c = txt(r && r.causa), s = txt(r && r.subcausa), e = txt(r && r.espina) || '—';
      if (c) out.push({ txt: c, src: 'Ishikawa · ' + e, nivel:'CAUSA APARENTE' });
      if (s) out.push({ txt: s, src: 'Ishikawa · ' + e + ' (subcausa)', nivel:'CAUSA APARENTE' });
    });
    return out;
  }
  /** Causas dibujadas en el lienzo del Ishikawa (lectura tolerante) */
  function ishLienzo(g, etq){
    const out = [];
    if (!g || typeof g !== 'object') return out;
    const raw = g.spines || g.espinas || g.branches || g.ramas || g;
    let list = [];
    if (Array.isArray(raw)) list = raw;
    else list = Object.keys(raw).map(k => {
      const v = raw[k];
      if (Array.isArray(v)) return { k:k, causes:v };
      if (v && typeof v === 'object'){ const o = { k:k }; for (const p in v) o[p] = v[p]; return o; }
      return null;
    }).filter(Boolean);
    list.forEach(s => {
      const sn = txt(s.name || s.l || s.label || s.titulo || s.k) || '—';
      arr(s.causes || s.causas || s.items || s.nodes).forEach(c => {
        const t = nodeText(c);
        if (t) out.push({ txt: t, src: 'Ishikawa ' + etq + ' · ' + sn, nivel:'CAUSA APARENTE' });
        nodeKids(c).forEach(x => {
          const t2 = nodeText(x);
          if (t2) out.push({ txt: t2, src: 'Ishikawa ' + etq + ' · ' + sn + ' (subcausa)', nivel:'CAUSA APARENTE' });
        });
      });
    });
    return out;
  }
  function causasIshikawa(ctx){
    const d = dataOf(ctx, 'analizar.diagramas_ishikawa');
    return dedup(ishTabla(d)
      .concat(ishLienzo(d && d.ish6m, '6M'))
      .concat(ishLienzo(d && d.ish4p, '4P')));
  }

  /* ---------------- lectura de los 5 WHY´S ------------------------------ */

  const wk = (p, n, i) => p + '_' + n + (i === undefined ? '' : i);
  /** Porqués y causa raíz de un bloque de 5 Why´s ('w1' o 'w2') */
  function whyDe(d, p){
    const out = [];
    for (let i = 1; i <= 5; i++){
      const t = txt(d && d[wk(p, 'why', i)]);
      if (t) out.push({ txt: t, src: '5 Why´s · Why ' + i,
                        nivel: i >= 4 ? 'CAUSA RAÍZ' : 'CAUSA APARENTE' });
    }
    const raiz = txt(d && d[wk(p, 'raiz')]);
    if (raiz) out.push({ txt: raiz, src: '5 Why´s · Root Cause', nivel:'CAUSA RAÍZ', raiz:true });
    const prob = txt(d && d[wk(p, 'problema')]);
    if (prob) out.unshift({ txt: prob, src: '5 Why´s · Problem', nivel:'SÍNTOMA' });
    return out;
  }
  function causas5Why(ctx){
    const d = dataOf(ctx, 'analizar.5_whys');
    return dedup(whyDe(d, 'w1').concat(whyDe(d, 'w2')));
  }
  /** Causas ya verificadas con datos en el plan de verificación (CHECK = 1) */
  function causasValidadas(ctx){
    const d = dataOf(ctx, 'analizar.validacion_de_causas');
    return dedup(arr(d && d.rows).filter(r => txt(r && r.causa) && num(r && r.check) === 1)
      .map(r => ({ txt: txt(r.causa), src:'Verificación de causas · CHECK = 1',
                   nivel:'CAUSA RAÍZ', raiz:true })));
  }

  /* ---------------- importación a la tabla de niveles ------------------- */

  /** Agrega causas a la tabla de NIVELES DE CAUSA sin duplicar */
  function importarNiveles(list){
    const d = ST.d('analizar.niveles_causa');
    if (!Array.isArray(d.rows)) d.rows = [];
    const has = {};
    d.rows.forEach(r => { const k = txt(r.causa).toUpperCase(); if (k) has[k] = 1; });
    let n = 0;
    dedup(list).forEach(c => {
      const k = txt(c.txt).toUpperCase();
      if (!k || has[k]) return;
      has[k] = 1; n++;
      const nuevo = { causa: c.txt, origen: c.src || '', nivel: c.nivel || 'CAUSA APARENTE',
                      raiz: c.raiz ? 'SI' : 'NO' };
      const libre = d.rows.find(r => txt(r.causa) === '' && txt(r.origen) === '' &&
                                     txt(r.evidencia) === '');
      if (libre){ for (const p in nuevo) libre[p] = nuevo[p]; }
      else { nuevo._id = uid(); d.rows.push(nuevo); }
    });
    return n;
  }

  const BTN_NIVELES =
    '<button class="btn xs g" data-impniveles="ishikawa" title="Trae las causas del diagrama Ishikawa (tabla y lienzo)">' +
      '⤵ Causas del Ishikawa</button>' +
    '<button class="btn xs g" data-impniveles="5why" title="Trae los porqués y la causa raíz de los 5 Why´s">' +
      '⤵ Causas de los 5 Why´s</button>' +
    '<button class="btn xs g" data-impniveles="validadas" title="Trae las causas con CHECK = 1 del plan de verificación">' +
      '⤵ Causas verificadas</button>';

  document.addEventListener('click', function(e){
    const el = (e.target && e.target.closest) ? e.target.closest('[data-impniveles]') : null;
    if (!el) return;
    e.preventDefault();
    if (typeof ST === 'undefined') return;
    const src = el.getAttribute('data-impniveles'), ctx = ST.ctx();
    const list = src === 'ishikawa'  ? causasIshikawa(ctx)
               : src === '5why'      ? causas5Why(ctx)
               : src === 'validadas' ? causasValidadas(ctx)
               : causasIshikawa(ctx).concat(causas5Why(ctx)).concat(causasValidadas(ctx));
    const n = importarNiveles(list);
    ST.touch();
    if (typeof UI !== 'undefined' && UI.softRefresh) UI.softRefresh();
    if (typeof toast === 'function')
      toast(n ? ('Se importaron ' + n + ' causa(s) para clasificar por nivel')
              : 'No hay causas nuevas para importar: diligencia primero el Ishikawa, los 5 Why´s o el plan de verificación',
            n ? 'ok' : 'warn');
  });

  /* ---------------- conteos ---------------------------------------------- */

  const nivFilas = d => filled(arr(d && d.rows), 'causa');
  const porNivel = (d, niv) => nivFilas(d).filter(r => or(r.nivel, 'CAUSA APARENTE') === niv);
  const raices   = d => nivFilas(d).filter(r => txt(r.raiz) === 'SI');

  const T_NIVELES = {
    id: 'analizar.niveles_causa',
    mod: 'ANALIZAR',
    extra: true,
    sheet: 'Niveles de causa',
    title: 'NIVELES DE CAUSA — SÍNTOMA · CAUSA APARENTE · CAUSA RAÍZ',
    desc: 'Obliga a clasificar cada causa detectada en su nivel real y a marcar cuál es la causa raíz, para no gastar recursos atacando síntomas ni parchando causas aparentes.',
    guide: [
      'Todo problema se puede leer en tres niveles: SÍNTOMA (lo que se ve y se mide), CAUSA APARENTE (la primera explicación) y CAUSA RAÍZ (el origen accionable que, al eliminarlo, evita que el problema vuelva).',
      'El error más común de un proyecto DMAIC es actuar sobre el síntoma o sobre la causa aparente: la mejora se ve por unas semanas y el problema regresa.',
      'Usa los botones de la tarjeta para TRAER las causas del Ishikawa, de los 5 Why´s y del plan de verificación: no las vuelvas a escribir.',
      'Regla práctica: si a una causa todavía le puedes preguntar «¿y por qué pasa eso?» y obtienes una respuesta útil, entonces NO es la causa raíz, es aparente. Sigue bajando un nivel (5 Why´s o Tree diagram).',
      'Una CAUSA RAÍZ debe cumplir tres condiciones: es accionable por la organización, está confirmada con datos o evidencia, y al eliminarla el problema no reaparece.',
      'La columna EVIDENCIA es obligatoria en las causas raíz: una causa no se valida por consenso del equipo, se valida con un dato (prueba de hipótesis, correlación, verificación en campo).',
      'Marca RAÍZ = SI sólo a las causas que vas a atacar en la fase MEJORAR. Cada causa raíz debe originar al menos una solución en el plan de acción.',
      'Si una causa raíz no se puede intervenir (no depende de la empresa, no hay recursos), no es causa raíz operativa: sigue bajando o cambia el alcance del proyecto.',
      'Cierra con la tabla de causa raíz del manual (p215): problema, causa raíz y descripción de cómo esa causa produce el efecto.'
    ],
    blocks: [
      { type:'fields', title:'PROBLEMA ANALIZADO', cols:3, items:[
        { k:'problema', label:'PROBLEMA (síntoma reportado, con dato y periodo)', input:'textarea', rows:3, w:2,
          ph:'El mismo enunciado del project charter, con su línea base' },
        { k:'fecha', label:'FECHA DE LA CLASIFICACIÓN', input:'date' },
        { k:'equipo', label:'EQUIPO QUE CLASIFICA', input:'text', w:2,
          ph:'Quiénes participaron en la sesión' },
        { k:'metodo', label:'MÉTODO USADO PARA BAJAR DE NIVEL', input:'select',
          opts:['5 Why´s', 'Tree diagram / Why', 'Ishikawa + 5 Why´s', 'Verificación en campo', 'Prueba de hipótesis'] }
      ]},

      { type:'html', title:'LOS TRES NIVELES DE CAUSA', tight:true, render:() => {
        return tabla(['NIVEL', '¿QUÉ ES?', '¿POR QUÉ IMPORTA?', 'EJEMPLO'],
          NIV_DEF.map((x, i) => [
            { v: x[0], b:true, tone: i === 0 ? 'bad' : (i === 1 ? 'warn' : 'ok') },
            { v: x[1] }, { v: x[2] }, { v: x[3] }
          ]), {}) +
          '<div class="hint" style="margin-top:8px">La ruta del análisis es SÍNTOMA → CAUSA APARENTE → CAUSA RAÍZ. ' +
          'Sólo las causas del último nivel pasan a la fase MEJORAR.</div>';
      }},

      { type:'grid', key:'rows', title:'CLASIFICACIÓN DE LAS CAUSAS DETECTADAS',
        min:12, max:120, addLabel:'Agregar causa', tools: BTN_NIVELES,
        cols:[
          { k:'causa',  label:'CAUSA DETECTADA', input:'text', w:'3fr',
            ph:'Causa tal como quedó escrita en el Ishikawa o en los 5 Why´s' },
          { k:'origen', label:'ORIGEN (herramienta)', input:'text', w:'2fr',
            ph:'Ishikawa · 5 Why´s · Tree diagram · campo' },
          { k:'nivel',  label:'NIVEL DE CAUSA', input:'select', opts: NIVELES, w:170,
            tone:(v) => v === 'CAUSA RAÍZ' ? 'ok' : (v === 'SÍNTOMA' ? 'bad' : (v ? 'warn' : '')) },
          { k:'porque', label:'¿POR QUÉ PASA ESO? (siguiente nivel)', input:'text', w:'3fr',
            ph:'Si tiene respuesta útil, la causa todavía es APARENTE' },
          { k:'evidencia', label:'EVIDENCIA O DATO QUE LA RESPALDA', input:'text', w:'3fr',
            ph:'Prueba de hipótesis, correlación, verificación en campo, registro' },
          { k:'accionable', label:'¿ES ACCIONABLE?', input:'select', opts:['SI','NO'], w:130,
            tone:(v) => v === 'SI' ? 'ok' : (v === 'NO' ? 'bad' : '') },
          { k:'raiz', label:'¿ES LA RAÍZ?', input:'select', opts:['SI','NO'], w:130,
            tone:(v) => v === 'SI' ? 'ok' : '' },
          { k:'estado', label:'ESTADO', ro:true, w:190,
            calc:(r) => {
              if (txt(r.causa) === '') return '';
              const niv = or(r.nivel, ''), raiz = txt(r.raiz) === 'SI';
              if (!niv) return 'SIN CLASIFICAR';
              if (raiz && niv !== 'CAUSA RAÍZ') return 'MARCADA RAÍZ EN NIVEL ERRADO';
              if (raiz && !txt(r.evidencia)) return 'RAÍZ SIN EVIDENCIA';
              if (raiz && txt(r.accionable) === 'NO') return 'RAÍZ NO ACCIONABLE';
              if (raiz) return 'CAUSA RAÍZ CONFIRMADA';
              if (niv === 'CAUSA RAÍZ') return 'RAÍZ SIN MARCAR';
              if (niv === 'SÍNTOMA') return 'SÍNTOMA — NO SE ATACA';
              return txt(r.porque) ? 'SIGUE BAJANDO DE NIVEL' : 'PENDIENTE PREGUNTAR POR QUÉ';
            },
            tone:(v) => v === 'CAUSA RAÍZ CONFIRMADA' ? 'ok'
                      : (v === 'SÍNTOMA — NO SE ATACA' || v === 'SIN CLASIFICAR' ||
                         v === 'MARCADA RAÍZ EN NIVEL ERRADO' || v === 'RAÍZ SIN EVIDENCIA' ||
                         v === 'RAÍZ NO ACCIONABLE' ? 'bad' : (v ? 'warn' : '')) }
        ],
        foot:[
          { k:'causa', label:'TOTAL CAUSAS' },
          { k:'nivel', calc:(rows) => arr(rows).filter(r => txt(r.causa) && or(r.nivel, '') === 'CAUSA RAÍZ').length,
            fmt:'n0' },
          { k:'raiz',  calc:(rows) => arr(rows).filter(r => txt(r.causa) && txt(r.raiz) === 'SI').length,
            fmt:'n0' }
        ]
      },

      { type:'cards', title:'RESUMEN DE LA CLASIFICACIÓN', items:(d) => {
        const R = nivFilas(d);
        const sin = R.filter(r => !txt(r.nivel)).length;
        const rz  = raices(d);
        const sinEv = rz.filter(r => !txt(r.evidencia)).length;
        const noAcc = rz.filter(r => txt(r.accionable) === 'NO').length;
        return [
          { label:'CAUSAS CLASIFICADAS', value: fmt(R.length, 'n0') },
          { label:'SÍNTOMAS', value: fmt(porNivel(d, 'SÍNTOMA').length, 'n0'),
            tone:'bad', hint:'No se atacan: son el efecto' },
          { label:'CAUSAS APARENTES', value: fmt(porNivel(d, 'CAUSA APARENTE').length, 'n0'),
            tone:'warn', hint:'Sigue preguntando por qué' },
          { label:'CAUSAS RAÍZ', value: fmt(porNivel(d, 'CAUSA RAÍZ').length, 'n0'),
            tone: porNivel(d, 'CAUSA RAÍZ').length ? 'ok' : 'warn' },
          { label:'MARCADAS COMO RAÍZ', value: fmt(rz.length, 'n0'),
            tone: rz.length ? 'ok' : 'warn', hint:'Pasan a la fase MEJORAR' },
          { label:'RAÍCES SIN EVIDENCIA', value: fmt(sinEv, 'n0'),
            tone: sinEv ? 'bad' : 'ok', hint:'Una causa raíz sin dato no está validada' },
          { label:'RAÍCES NO ACCIONABLES', value: fmt(noAcc, 'n0'),
            tone: noAcc ? 'bad' : 'ok', hint:'Si no se puede intervenir, no es causa raíz operativa' },
          { label:'SIN CLASIFICAR', value: fmt(sin, 'n0'), tone: sin ? 'warn' : 'ok' }
        ];
      }},

      { type:'chart', kind:'bar', title:'Causas por nivel', h:280,
        data:(d) => ({
          labels: NIVELES,
          values: NIVELES.map(n => porNivel(d, n).length),
          tones: ['bad', 'warn', 'ok'],
          yLabel:'Número de causas' })},

      { type:'html', title:'CAUSAS RAÍZ MARCADAS (las que pasan a MEJORAR)', tight:true,
        render:(d) => {
          const R = raices(d);
          if (!R.length)
            return aviso('Todavía no hay ninguna causa marcada con RAÍZ = SI. Baja de nivel con los 5 Why´s o el Tree diagram hasta encontrar el origen accionable.', 'warn');
          const cuerpo = R.map(r => [
            { v: txt(r.causa), b:true },
            { v: txt(r.origen) || '—' },
            { v: or(r.nivel, '—'), tone: or(r.nivel, '') === 'CAUSA RAÍZ' ? 'ok' : 'bad' },
            { v: txt(r.evidencia) || 'SIN EVIDENCIA', tone: txt(r.evidencia) ? '' : 'bad' },
            { v: or(r.accionable, '—'), tone: txt(r.accionable) === 'SI' ? 'ok' : 'bad' }
          ]);
          return tabla(['CAUSA RAÍZ', 'ORIGEN', 'NIVEL DECLARADO', 'EVIDENCIA', '¿ACCIONABLE?'], cuerpo, {});
        }},

      { type:'note', tone:'info', text:(d, ctx) => {
        const disp = causasIshikawa(ctx).length + causas5Why(ctx).length + causasValidadas(ctx).length;
        return disp
          ? 'Hay ' + disp + ' causa(s) disponibles en el Ishikawa, los 5 Why´s y el plan de verificación: usa los botones de la tarjeta para traerlas sin volver a escribirlas.'
          : 'Diligencia primero el Ishikawa, los 5 Why´s o el plan de verificación: desde allí se importan las causas a esta tabla.';
      }},

      { type:'note', tone:'warn', text:(d) => {
        const rz = raices(d);
        if (!rz.length) return 'Todavía no hay ninguna causa marcada como RAÍZ. La fase ANALIZAR no se puede cerrar sin al menos una causa raíz accionable y confirmada con datos.';
        const sinEv = rz.filter(r => !txt(r.evidencia)).length;
        const noAcc = rz.filter(r => txt(r.accionable) === 'NO').length;
        if (sinEv) return sinEv + ' causa(s) raíz no tienen evidencia registrada. Una causa NO se valida por consenso del equipo: se valida con un dato. Usa la prueba de hipótesis o la correlación y regresión de esta misma fase.';
        if (noAcc) return noAcc + ' causa(s) raíz están marcadas como NO accionables. Si no se pueden intervenir, no son causa raíz operativa: sigue bajando un nivel o replantea el alcance del proyecto.';
        return 'Las ' + rz.length + ' causa(s) raíz están accionables y con evidencia: pasa cada una al plan de acción de la fase MEJORAR.';
      }},

      { type:'fields', title:'CIERRE — CAUSA RAÍZ DEL PROBLEMA (manual p215)', cols:1, items:[
        { k:'causaRaiz', label:'CAUSA RAÍZ SELECCIONADA', input:'textarea', rows:3,
          ph:'La causa (o causas) que se van a eliminar en la fase MEJORAR' },
        { k:'descripcion', label:'DESCRIPCIÓN: ¿por qué es la causa? ¿qué tanto afecta?', input:'textarea', rows:5,
          ph:'Explica el mecanismo: cómo esa causa produce el problema, con qué datos, análisis y gráficos se comprobó' },
        { k:'siguiente', label:'¿QUÉ SE HACE EN MEJORAR CON ESTA CAUSA RAÍZ?', input:'textarea', rows:3,
          ph:'Cada causa raíz debe originar al menos una solución en el plan de acción' }
      ]},
      { type:'insight' }
    ],
    bi: (d) => {
      const R = nivFilas(d), rz = raices(d);
      return {
        nivCausas: R.length,
        nivSintomas: porNivel(d, 'SÍNTOMA').length,
        nivAparentes: porNivel(d, 'CAUSA APARENTE').length,
        nivRaices: porNivel(d, 'CAUSA RAÍZ').length,
        nivMarcadasRaiz: rz.length,
        nivRaicesSinEvidencia: rz.filter(r => !txt(r.evidencia)).length,
        nivRaicesNoAccionables: rz.filter(r => txt(r.accionable) === 'NO').length,
        nivSinClasificar: R.filter(r => !txt(r.nivel)).length,
        nivPctRaiz: safeDiv(rz.length, R.length),
        nivCausaRaiz: txt(d.causaRaiz)
      };
    }
  };

  /* ====================================================================== */
  return [ T_HIPOTESIS, T_CORRELACION, T_NIVELES ];

})();

registerTools(SPECS_EXTRA_ANALIZAR);
