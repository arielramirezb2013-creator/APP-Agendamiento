/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   SPECS MÓDULO 4 — MEJORAR   (libro Excel original: 04MEJORAR.xlsx · 6 hojas)
   ---------------------------------------------------------------------------
   Fuente de verdad: _dump/18d3e978-04MEJORAR.txt (volcado celda por celda).
   Hojas: Brainstorming · Seleccion de soluciones · Plan de accion ·
          Quick Improvement · Descripcion de la solucion · A3 Mejorar
   Toda fórmula del original está replicada como `calc` con la misma semántica
   (única fórmula del libro: K = PRODUCT(EFFORT:COST-BENEFIT)).
   JavaScript de navegador plano: sin módulos, sin librerías, sin red.
   ========================================================================== */
'use strict';

const SPECS_MEJORAR = (function(){

  /* ======================================================================
     HELPERS PRIVADOS DEL MÓDULO
     ==================================================================== */
  const XLF = '04MEJORAR';

  const T   = (ctx, id) => ((ctx && ctx.all && ctx.all[id]) || {});
  const RS  = (o, k) => (o && Array.isArray(o[k]) ? o[k] : []);
  const txt = v => (v === null || v === undefined ? '' : String(v)).trim();
  const filled = (rows, k) => arr(rows).filter(r => txt(r[k]) !== '');
  function first(){
    for (let i = 0; i < arguments.length; i++){ const v = txt(arguments[i]); if (v) return v; }
    return '';
  }
  /** líneas de un textarea → arreglo limpio */
  const lineas = v => txt(v).split(/\r?\n/).map(x => x.trim()).filter(x => x);
  const corta = (s, n) => { const t = txt(s); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

  /* ------------------------------------------------------------ escalas */
  /* 1..5 «entre más alto, mejor» */
  const ESC_5 = [{ v:'5', l:'5 — Muy alto' }, { v:'4', l:'4 — Alto' }, { v:'3', l:'3 — Medio' },
                 { v:'2', l:'2 — Bajo' }, { v:'1', l:'1 — Muy bajo' }];
  /* EFFORT va INVERTIDO: 5 = menor esfuerzo (así el PRODUCT premia lo fácil) */
  const ESC_EFFORT = [{ v:'5', l:'5 — Muy poco esfuerzo' }, { v:'4', l:'4 — Poco esfuerzo' },
                      { v:'3', l:'3 — Esfuerzo medio' }, { v:'2', l:'2 — Mucho esfuerzo' },
                      { v:'1', l:'1 — Esfuerzo enorme' }];
  const SI_NO = [{ v:'Sí', l:'Sí — solución elegida' }, { v:'No', l:'No' }];

  /** =PRODUCT(G:J) — Excel multiplica sólo las celdas con número;
   *  si TODAS están vacías, PRODUCT devuelve 0 (igual que el original). */
  function overall(r){
    const ks = ['effort', 'benefit', 'feas', 'cb'];
    let p = 1, n = 0;
    ks.forEach(k => { if (isNum(r[k])){ p *= num(r[k]); n++; } });
    return n ? p : 0;
  }
  const overallMax = rows => Math.max.apply(null, [0].concat(arr(rows).map(overall)));

  /** Matriz Impacto-Esfuerzo · punto medio = 3 (escala 1..5, EFFORT invertido) */
  function cuadrante(r){
    const e = num(r.effort), b = num(r.benefit);
    if (!(e > 0) || !(b > 0)) return { n:'', tone:'', hint:'' };
    const facil = e >= 3, alto = b >= 3;
    if (facil && alto)  return { n:'QUICK WINS',       tone:'ok',   hint:'Poco esfuerzo y alto beneficio: hazlo YA.' };
    if (!facil && alto) return { n:'PROYECTOS MAYORES', tone:'warn', hint:'Alto beneficio pero mucho esfuerzo: planifícalo y consigue recursos.' };
    if (facil && !alto) return { n:'RELLENOS',          tone:'',     hint:'Fácil pero poco beneficio: hazlo si sobra capacidad.' };
    return { n:'INGRATOS', tone:'bad', hint:'Mucho esfuerzo y poco beneficio: descártalo.' };
  }

  /* ------------------------------------------- herencia desde otras fases */
  /** Enunciado del problema traído de DEFINIR (Clarificación / Charter / A3) */
  function problemaHeredado(ctx){
    return first(T(ctx, 'definir.clarificacion_problema').definicion,
                 T(ctx, 'definir.project_charter').problema,
                 T(ctx, 'definir.a3_definir').problema,
                 T(ctx, 'analizar.descripcion_causa_raiz').problema);
  }

  /** Causas raíz VALIDADAS registradas en el módulo ANALIZAR.
   *  Recorre ctx.all buscando cualquier herramienta 'analizar.*' y extrae los
   *  campos de causa; si la herramienta tiene columna de validación, sólo trae
   *  las que quedaron validadas. Es tolerante al nombre exacto de las llaves
   *  para no acoplarse a la implementación de 62_specs_analizar.js. */
  function causasValidadas(ctx){
    const all = (ctx && ctx.all) || {};
    const out = [], seen = {};
    const push = v => {
      const s = txt(v);
      if (!s || s.length < 3) return;
      const k = s.toLowerCase();
      if (seen[k]) return;
      seen[k] = 1; out.push(s);
    };
    const esCausa = k => /causa|raiz|raíz|root|hipot/i.test(k);
    const esValid = k => /valid|verific|conclus|confirm|comprob|decision/i.test(k);
    /** ¿la columna de validación dice que SÍ? (tolerante a tildes y redacción) */
    function diceSi(v){
      const s = String(v == null ? '' : v).trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!s) return false;
      if (/^(no|n$|0|false|falso|descart|rechaz|invalid|sin |pendiente|nula|nulo)/.test(s)) return false;
      return /^(si|s$|y$|yes|x$|1|true|valid|confirm|verdad|acept|aprob|comprob|real|caus)/.test(s);
    }
    Object.keys(all).forEach(id => {
      if (id.indexOf('analizar.') !== 0) return;
      const d = all[id] || {};
      Object.keys(d).forEach(k => {
        const v = d[k];
        if (Array.isArray(v)){
          v.forEach(row => {
            if (!row || typeof row !== 'object') return;
            const ks = Object.keys(row).filter(x => x !== '_id');
            const ck = ks.filter(esCausa);
            if (!ck.length) return;
            const vk = ks.filter(x => esValid(x) && txt(row[x]) !== '');
            const ok = !vk.length || vk.some(x => diceSi(row[x]));
            if (ok) ck.forEach(x => push(row[x]));
          });
        } else if (typeof v === 'string' && esCausa(k)) push(v);
      });
    });
    return out.slice(0, 30);
  }
  /** Texto resumido de las causas raíz (para placeholders y pistas) */
  const causasTxt = ctx => causasValidadas(ctx).join(' · ');

  /* Soluciones elegidas en «Seleccion de soluciones» (para el plan y el A3) */
  function solucionesElegidas(ctx){
    const rows = RS(T(ctx, 'mejorar.seleccion_soluciones'), 'rows');
    const sel  = rows.filter(r => txt(r.sol) && /^s[ií]/i.test(txt(r.solucion)));
    const base = sel.length ? sel : filled(rows, 'sol').slice().sort((a, b) => overall(b) - overall(a));
    return base.map(r => txt(r.sol)).filter(x => x);
  }

  /* ------------------------------------------------------- plan de acción */
  const ESTATUS = ['NO REALIZADA', 'RETRASADA', 'EN CURSO', 'REALIZADA'];
  const TONO_EST = { 'NO REALIZADA':'bad', 'RETRASADA':'warn', 'EN CURSO':'info', 'REALIZADA':'ok' };
  const estatusDe = r => txt(r && r.estatus).toUpperCase();
  const esRealizada = r => estatusDe(r) === 'REALIZADA';
  /** vencida = FECHA LIMITE < hoy y el estatus no es REALIZADA */
  function diasVencida(r){
    if (!r || !txt(r.limite) || esRealizada(r)) return NaN;
    const dd = dDiff(r.limite, hoy());
    return (isFinite(dd) && dd > 0) ? dd : NaN;
  }
  const estaVencida = r => isFinite(diasVencida(r));
  function avisoPlan(r){
    if (!txt(r.accion) && !txt(r.problema)) return '';
    const v = diasVencida(r);
    if (isFinite(v)) return '⚠ RETRASADA · ' + fmt(v, 'n0') + ' día(s) de atraso';
    if (esRealizada(r)) return '✔ REALIZADA';
    if (!txt(r.limite)) return 'Sin fecha límite';
    const fal = dDiff(hoy(), r.limite);
    if (!isFinite(fal)) return '';
    return fal === 0 ? 'Vence HOY' : 'Faltan ' + fmt(fal, 'n0') + ' día(s)';
  }
  function resumenPlan(d){
    const rows = arr(d && d.rows).filter(r => txt(r.accion) || txt(r.problema));
    const n = rows.length;
    const real = rows.filter(esRealizada).length;
    const curso = rows.filter(r => estatusDe(r) === 'EN CURSO').length;
    const nore = rows.filter(r => estatusDe(r) === 'NO REALIZADA').length;
    const retr = rows.filter(r => estatusDe(r) === 'RETRASADA' || estaVencida(r)).length;
    return { n, real, curso, nore, retr, pct: safeDiv(real, n), rows };
  }

  /* =========================================================== ACCIONES UI
     Botón «traer causas raíz de ANALIZAR» de la hoja Brainstorming.
     Se expone en window porque el manejador va en el atributo onclick del
     bloque html (el renderer genérico no tiene enganche de acciones). */
  window.MEJ_traerCausas = function(){
    const ctx = (typeof ST !== 'undefined') ? ST.ctx() : { all:{} };
    const cs  = causasValidadas(ctx);
    if (!cs.length){ toast('Todavía no hay causas raíz registradas en ANALIZAR.', 'warn'); return; }
    const d = ST.d('mejorar.brainstorming');
    if (!Array.isArray(d.rows)) d.rows = [];
    const rows = d.rows;
    const ya = rows.map(r => txt(r.causa).toLowerCase());
    let n = 0;
    cs.forEach(c => {
      if (ya.indexOf(c.toLowerCase()) >= 0) return;
      const libre = rows.find(r => !txt(r.idea) && !txt(r.causa));
      if (libre) libre.causa = c; else rows.push({ _id: uid(), causa: c });
      n++;
    });
    ST.touch(); UI.renderView();
    toast(n ? ('Se trajeron ' + n + ' causa(s) raíz de ANALIZAR. Ahora escribe una solución para cada una.')
            : 'Las causas raíz de ANALIZAR ya estaban cargadas.', n ? 'ok' : '');
  };

  /* ======================================================================
     1 · BRAINSTORMING  (hoja «Brainstorming» del libro 04MEJORAR)
     Misma estructura que la de ANALIZAR, pero aquí las ideas son SOLUCIONES.
     ==================================================================== */
  const T_BRAIN = {
    id: 'mejorar.brainstorming',
    mod: 'MEJORAR',
    sheet: 'Brainstorming',
    title: 'BRAINSTORMING DE SOLUCIONES — AFFINITY DIAGRAM',
    desc: 'Lluvia de ideas del equipo para generar SOLUCIONES a las causas raíz validadas, y agruparlas por afinidad.',
    guide: [
      'Trae primero las CAUSAS RAIZ validadas de ANALIZAR con el botón: cada solución debe atacar una causa, no el síntoma.',
      'Regla de oro de la lluvia de ideas: primero cantidad, después calidad. No se critica ninguna idea mientras se generan.',
      'Escribe las CATEGORIES (una por línea) y clasifica cada idea: eso es el diagrama de afinidad.',
      'Vota las ideas (columna VOTOS) para tener un primer filtro antes de pasar a «Seleccion de soluciones».',
      'El bloque «LISTA DE SOLUCIONES» se arma solo y es lo que se exporta al recuadro B10:D17 del Excel original.',
      'Cierra la sesión con TEAM, DATE y PROJECT NAME diligenciados: es la evidencia de participación del equipo.'
    ],
    blocks: [
      { type:'fields', title:'BRAINSTORMING', cols:4, items:(d, ctx) => [
        { k:'proyecto',   label:'PROJECT NAME', input:'text', w:2,
          ph: first(T(ctx, 'definir.gantt').proyecto, (ctx && ctx.proj ? ctx.proj.nombre : ''), 'Nombre del proyecto') },
        { k:'fecha',      label:'DATE', input:'date', w:1, ph: hoy() },
        { k:'facilitad',  label:'FACILITADOR DE LA SESION', input:'text', w:1,
          ph:'Quien modera la lluvia de ideas' },
        { k:'categorias', label:'CATEGORIES', input:'textarea', rows:6, w:2,
          ph:'Una categoría por línea (ej.:\nAgendamiento\nComunicación con la ARL\nHistoria clínica\nPersonal)' },
        { k:'notas',      label:'NOTAS DE LA SESION', input:'textarea', rows:6, w:2,
          ph:'Acuerdos, reglas de la sesión, ideas descartadas y por qué.' }
      ] },
      { type:'grid', key:'equipo', title:'TEAM', min:5, max:20, addLabel:'Agregar integrante',
        cols:[
          { k:'nombre', label:'TEAM', input:'text', w:320, ph:'Nombre del integrante que participa en la sesión' }
        ] },
      { type:'html', render:(d, ctx) => {
          const n = causasValidadas(ctx).length;
          const c = corta(causasTxt(ctx), 220);
          return '<div class="note ' + (n ? 'info' : 'warn') + '" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
            '<span style="flex:1;min-width:220px">' +
              (n ? 'ANALIZAR tiene <b>' + esc(String(n)) + '</b> causa(s) raíz registradas: ' + esc(c)
                 : 'Todavía no hay causas raíz registradas en ANALIZAR. Vuelve aquí cuando termines la validación de causas: cada solución debe atacar una causa raíz validada.') +
            '</span>' +
            (n ? '<button class="btn sm p" type="button" onclick="MEJ_traerCausas()">⤒ Traer causas raíz de ANALIZAR</button>' : '') +
            '</div>';
        } },
      { type:'grid', key:'rows', title:'IDEAS DE SOLUCION', min:12, max:120,
        addLabel:'Agregar solución', sortBy:'votos', sortDir:'desc',
        cols:(d, ctx) => {
          const cats = lineas(d.categorias);
          const cs = causasValidadas(ctx);
          return [
            { k:'causa',     label:'CAUSA RAIZ QUE ATACA', input:'text', w:230,
              ph: cs.length ? corta(cs[0], 60) : 'Causa raíz validada en ANALIZAR' },
            { k:'idea',      label:'SOLUCION PROPUESTA (IDEA)', input:'textarea', rows:2, w:300,
              ph:'¿Qué se va a hacer? Empieza con un verbo: estandarizar, automatizar, eliminar…' },
            { k:'categoria', label:'CATEGORIA (AFINIDAD)', input: cats.length ? 'select' : 'text',
              opts: cats, w:180 },
            { k:'autor',     label:'PROPUESTA POR', input:'text', w:150 },
            { k:'votos',     label:'VOTOS', input:'number', step:1, min:0, align:'right', w:90, databar:true },
            { k:'nota',      label:'OBSERVACION', input:'textarea', rows:2, w:220 }
          ];
        },
        foot:[
          { k:'__label', label:'TOTAL VOTOS' },
          { k:'votos', fmt:'n0', calc:(rows) => sum(rows, 'votos') }
        ] },
      { type:'fields', title:'LISTA DE SOLUCIONES (se exporta al recuadro B10:D17 del Excel)', cols:1, items:[
        { k:'ideas', label:'LISTA DE SOLUCIONES', input:'textarea', rows:8, w:1, ro:true,
          calc:(d) => filled(RS(d, 'rows'), 'idea')
            .map((r, i) => (i + 1) + '. ' + txt(r.idea) +
              (txt(r.categoria) ? '  [' + txt(r.categoria) + ']' : '') +
              (isNum(r.votos) && num(r.votos) > 0 ? '  (' + fmt(r.votos, 'n0') + ' votos)' : ''))
            .join('\n') }
      ] },
      { type:'diagram', kind:'affinity', key:'afinidad', title:'AFFINITY DIAGRAM' },
      { type:'chart', kind:'bar', title:'Ideas por categoría de afinidad', h:300,
        data:(d) => {
          const rows = filled(RS(d, 'rows'), 'idea');
          const mapa = {}, orden = [];
          rows.forEach(r => {
            const c = txt(r.categoria) || 'SIN CATEGORIA';
            if (mapa[c] === undefined){ mapa[c] = 0; orden.push(c); }
            mapa[c]++;
          });
          return { labels: orden, values: orden.map(c => mapa[c]), name:'Ideas' };
        } },
      { type:'cards', items:(d) => {
          const rows = filled(RS(d, 'rows'), 'idea');
          if (!rows.length) return [];
          const cats = {}; rows.forEach(r => { if (txt(r.categoria)) cats[txt(r.categoria)] = 1; });
          const conCausa = rows.filter(r => txt(r.causa)).length;
          let top = rows[0];
          rows.forEach(r => { if (num(r.votos) > num(top.votos)) top = r; });
          return [
            { label:'IDEAS GENERADAS', value: fmt(rows.length, 'n0'),
              tone: rows.length >= 15 ? 'ok' : (rows.length >= 8 ? 'warn' : 'bad'),
              hint:'Una sesión sana produce 15 ideas o más' },
            { label:'CATEGORIAS DE AFINIDAD', value: fmt(Object.keys(cats).length, 'n0') },
            { label:'IDEAS LIGADAS A UNA CAUSA RAIZ', value: fmt(conCausa, 'n0'),
              tone: conCausa === rows.length ? 'ok' : 'warn',
              hint:'Lo ideal es que TODAS ataquen una causa validada' },
            { label:'IDEA MÁS VOTADA', value: corta(top.idea, 34) || '—',
              tone:'ok', hint: fmt(num(top.votos), 'n0') + ' voto(s)' },
            { label:'PARTICIPANTES', value: fmt(filled(RS(d, 'equipo'), 'nombre').length, 'n0') }
          ];
        } },
      { type:'note', tone:'info', text:'Las ideas de esta hoja NO se implementan todas: pasan a «Seleccion de soluciones», donde se califican por esfuerzo, beneficio, factibilidad y costo-beneficio. Una idea sin causa raíz asociada es una corazonada, no una mejora.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* B2 BRAINSTORMING · D3 AFFINITY DIAGRAM · B4 TEAM · C4 DATE · D4 CATEGORIES
         B5:B9 integrantes · C5 fecha · C6:C9 notas · D5:D9 categorías
         B10:D17 lista de ideas · B18 PROJECT NAME · C18:D19 nombre del proyecto */
      fields:{ fecha:'C5', notas:'C6', categorias:'D5', ideas:'B10', proyecto:'C18' },
      grids:[{ key:'equipo', row:5, endRow:9, cols:{ nombre:'B' } }],
      diagrams:[{ key:'afinidad', kind:'affinity', anchor:'E4', w:8, h:15 }]
    },
    bi: (d, ctx) => {
      const rows = filled(RS(d, 'rows'), 'idea');
      const cats = {}; rows.forEach(r => { if (txt(r.categoria)) cats[txt(r.categoria)] = 1; });
      return {
        'Ideas de solución generadas': rows.length,
        'Categorías de afinidad': Object.keys(cats).length,
        'Ideas ligadas a causa raíz': rows.filter(r => txt(r.causa)).length,
        'Votos emitidos': sum(rows, 'votos'),
        'Participantes de la sesión': filled(RS(d, 'equipo'), 'nombre').length,
        'Causas raíz disponibles en ANALIZAR': causasValidadas(ctx).length
      };
    }
  };

  /* ======================================================================
     2 · SELECCION DE SOLUCIONES
     K5 =PRODUCT(G5:J7) … K20 =PRODUCT(G20:J21)   (6 bloques de solución)
     ==================================================================== */
  const T_SEL = {
    id: 'mejorar.seleccion_soluciones',
    mod: 'MEJORAR',
    sheet: 'Seleccion de soluciones',
    title: 'SELECCIÓN DE SOLUCIONES',
    desc: 'Prioriza las soluciones candidatas con cuatro criterios (esfuerzo, beneficio, factibilidad y costo-beneficio) y elige cuáles se implementan.',
    guide: [
      'PROBLEM STATEMENT y VALIDATED ROOT CAUSE se escriben una sola vez: son la cabecera de toda la matriz (celdas fusionadas B5:B21 y C5:C21).',
      'POTENTIAL SOLUTIONS es la idea; PRACTICAL METHOD es CÓMO se haría en la práctica (quién, con qué, dónde).',
      'Califica 1 a 5. OJO con EFFORT: va INVERTIDO, 5 = menor esfuerzo, para que el OVERALL premie lo fácil.',
      'OVERALL = PRODUCTO de los cuatro criterios (=PRODUCT(G:J)), no la suma: una calificación baja castiga fuerte.',
      'La tabla se ordena sola de mayor a menor OVERALL y resalta la mejor solución.',
      'Marca SOLUTION = Sí en las que se van a implementar: esas pasan al Plan de Accion y al A3 Mejorar.'
    ],
    blocks: [
      { type:'note', tone:'info', text:'ESCALAS 1 a 5 · EFFORT: 5 = MENOR esfuerzo · 1 = esfuerzo enorme (INVERTIDA) · ' +
        'BENEFIT: 5 = mayor beneficio · FEASIBILITY: 5 = totalmente factible · COST-BENEFIT: 5 = mejor relación costo-beneficio. ' +
        'OVERALL = EFFORT × BENEFIT × FEASIBILITY × COST-BENEFIT (máximo posible 625).' },
      { type:'fields', title:'PROBLEM STATEMENT  /  VALIDATED ROOT CAUSE', cols:2, items:(d, ctx) => [
        { k:'problema',  label:'PROBLEM STATEMENT', input:'textarea', rows:7, w:1,
          ph: problemaHeredado(ctx) || 'Enunciado del problema (se hereda de DEFINIR › Clarificación del Problema).' },
        { k:'causaRaiz', label:'VALIDATED ROOT CAUSE', input:'textarea', rows:7, w:1,
          ph: causasTxt(ctx) || 'Causa raíz validada en ANALIZAR (Validacion de causas / Descripcion causa raiz).' }
      ] },
      { type:'grid', key:'rows', title:'MATRIZ DE SELECCIÓN DE SOLUCIONES', min:6, max:12,
        addLabel:'Agregar solución', sortBy:'overall', sortDir:'desc',
        rowStyle:(r, i, rows) => {
          if (/^s[ií]/i.test(txt(r.solucion))) return 'cell-ok';
          const o = overall(r);
          return (o > 0 && o === overallMax(rows)) ? 'cell-warn' : '';
        },
        cols:(d, ctx) => {
          const ideas = filled(RS(T(ctx, 'mejorar.brainstorming'), 'rows'), 'idea');
          return [
            { k:'sol',    label:'POTENTIAL SOLUTIONS', input:'textarea', rows:2, w:250,
              ph: ideas.length ? corta(ideas[0].idea, 60) : 'Solución candidata (viene del Brainstorming)' },
            { k:'metodo', label:'PRACTICAL METHOD', input:'textarea', rows:2, w:250,
              ph:'Cómo se haría: quién, con qué recurso, en qué punto del proceso' },
            { k:'effort',  label:'EFFORT', input:'select', opts:ESC_EFFORT, w:130,
              help:'ESCALA INVERTIDA · 5 = menor esfuerzo · 1 = esfuerzo enorme' },
            { k:'benefit', label:'BENEFIT', input:'select', opts:ESC_5, w:130,
              help:'5 = mayor beneficio para el cliente y el negocio' },
            { k:'feas',    label:'FEASIBILITY', input:'select', opts:ESC_5, w:130,
              help:'5 = totalmente factible con lo que ya tenemos' },
            { k:'cb',      label:'COST-BENEFIT', input:'select', opts:ESC_5, w:130,
              help:'5 = mejor relación costo-beneficio' },
            { k:'overall', label:'OVERALL', ro:true, fmt:'n0', databar:true, w:110,
              help:'=PRODUCT(EFFORT:COST-BENEFIT)', calc:(r) => overall(r) },
            { k:'cuadrante', label:'CUADRANTE (IMPACTO-ESFUERZO)', ro:true, w:170,
              calc:(r) => cuadrante(r).n },
            { k:'solucion', label:'SOLUTION', input:'select', opts:SI_NO, w:120,
              help:'¿Es la solución elegida para implementar?' }
          ];
        },
        foot:[
          { k:'__label', label:'MÁXIMO' },
          { k:'overall', fmt:'n0', calc:(rows) => overallMax(rows) }
        ] },
      { type:'chart', kind:'scatter', title:'MATRIZ IMPACTO-ESFUERZO (Esfuerzo vs Beneficio)', h:380,
        data:(d) => {
          const rows = filled(RS(d, 'rows'), 'sol');
          const pts = rows.map((r, i) => {
            const q = cuadrante(r);
            return { x: num(r.effort), y: num(r.benefit), l: corta(r.sol, 28),
                     label: corta(r.sol, 28), name: corta(r.sol, 28), r: Math.max(1, num(r.feas)),
                     tone: q.tone, grupo: q.n, overall: overall(r), i: i + 1 };
          }).filter(p => p.x > 0 && p.y > 0);
          return {
            points: pts,
            xs: pts.map(p => p.x), ys: pts.map(p => p.y),
            x: pts.map(p => p.x), y: pts.map(p => p.y),
            values: pts.map(p => p.y), labels: pts.map(p => p.l),
            series: [{ name:'Soluciones', points: pts }],
            xLabel:'EFFORT — esfuerzo (5 = menor esfuerzo)',
            yLabel:'BENEFIT — beneficio (5 = mayor beneficio)',
            xTitle:'EFFORT (5 = menor esfuerzo)', yTitle:'BENEFIT',
            xMin:0.5, xMax:5.5, yMin:0.5, yMax:5.5, xStep:1, yStep:1,
            refX:3, refY:3,
            quadrants:[
              { x0:3, x1:5.5, y0:3, y1:5.5, label:'QUICK WINS', tone:'ok' },
              { x0:0.5, x1:3, y0:3, y1:5.5, label:'PROYECTOS MAYORES', tone:'warn' },
              { x0:3, x1:5.5, y0:0.5, y1:3, label:'RELLENOS', tone:'info' },
              { x0:0.5, x1:3, y0:0.5, y1:3, label:'INGRATOS', tone:'bad' }
            ]
          };
        } },
      { type:'note', tone:'info', text:'CUADRANTES · QUICK WINS (poco esfuerzo, alto beneficio): se hacen ya. ' +
        'PROYECTOS MAYORES (mucho esfuerzo, alto beneficio): se planifican y se les asignan recursos. ' +
        'RELLENOS (poco esfuerzo, poco beneficio): sólo si sobra capacidad. ' +
        'INGRATOS (mucho esfuerzo, poco beneficio): se descartan. El punto medio de corte es 3.' },
      { type:'cards', items:(d) => {
          const rows = filled(RS(d, 'rows'), 'sol');
          if (!rows.length) return [];
          let top = rows[0];
          rows.forEach(r => { if (overall(r) > overall(top)) top = r; });
          const sel = rows.filter(r => /^s[ií]/i.test(txt(r.solucion)));
          const qw  = rows.filter(r => cuadrante(r).n === 'QUICK WINS').length;
          const ing = rows.filter(r => cuadrante(r).n === 'INGRATOS').length;
          return [
            { label:'SOLUCIONES EVALUADAS', value: fmt(rows.length, 'n0') },
            { label:'OVERALL MÁXIMO', value: fmt(overall(top), 'n0'), tone:'ok',
              hint:'Máximo teórico 625 (5×5×5×5)' },
            { label:'MEJOR SOLUCIÓN', value: corta(top.sol, 34) || '—', tone:'ok',
              hint: cuadrante(top).n || 'Califica los 4 criterios' },
            { label:'QUICK WINS', value: fmt(qw, 'n0'), tone: qw ? 'ok' : 'warn',
              hint:'Poco esfuerzo y alto beneficio' },
            { label:'INGRATOS', value: fmt(ing, 'n0'), tone: ing ? 'bad' : 'ok',
              hint:'Mucho esfuerzo y poco beneficio: descártalos' },
            { label:'SOLUCIONES ELEGIDAS (SOLUTION = Sí)', value: fmt(sel.length, 'n0'),
              tone: sel.length ? 'ok' : 'warn', hint:'Pasan al Plan de Accion' }
          ];
        } },
      { type:'note', tone:'warn', text:(d) => {
          const rows = filled(RS(d, 'rows'), 'sol');
          if (!rows.length) return '';
          const sinCal = rows.filter(r => overall(r) === 0).length;
          const sel = rows.filter(r => /^s[ií]/i.test(txt(r.solucion))).length;
          const p = [];
          if (sinCal) p.push(sinCal + ' solución(es) sin calificar: el OVERALL queda en 0 igual que en el Excel original.');
          if (!sel) p.push('Todavía no has marcado ninguna SOLUTION = Sí: sin solución elegida no hay Plan de Accion.');
          return p.join(' ');
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* B5:B21 y C5:C21 son celdas fusionadas (una sola por hoja).
         Bloques de solución: filas 5, 8, 11, 14, 17 y 20.
         La columna F (F3:F21) es una columna vacía de separación del formato.
         K (OVERALL) trae la fórmula =PRODUCT(G:J): NO se escribe. */
      fields:{ problema:'B5', causaRaiz:'C5' },
      grids:[{ key:'rows', rowsAt:[5, 8, 11, 14, 17, 20],
               cols:{ sol:'D', metodo:'E', effort:'G', benefit:'H', feas:'I', cb:'J', solucion:'L' } }]
    },
    bi: (d) => {
      const rows = filled(RS(d, 'rows'), 'sol');
      let top = null;
      rows.forEach(r => { if (!top || overall(r) > overall(top)) top = r; });
      return {
        'Soluciones evaluadas': rows.length,
        'OVERALL máximo': top ? overall(top) : 0,
        'Solución priorizada': top ? corta(top.sol, 60) : '',
        'Quick wins identificados': rows.filter(r => cuadrante(r).n === 'QUICK WINS').length,
        'Soluciones elegidas': rows.filter(r => /^s[ií]/i.test(txt(r.solucion))).length,
        'Causa raíz declarada': txt(d.causaRaiz) ? 1 : 0
      };
    }
  };

  /* ======================================================================
     3 · PLAN DE ACCION - MEJORA
     ==================================================================== */
  const T_PLAN = {
    id: 'mejorar.plan_accion',
    mod: 'MEJORAR',
    sheet: 'Plan de accion',
    title: 'PLAN DE ACCION - MEJORA',
    desc: 'Convierte cada solución elegida en acciones con responsable, fechas y estatus, y hace seguimiento hasta cerrarlas.',
    guide: [
      'Una fila = una acción concreta. Si no tiene responsable y fecha límite, no es una acción: es un deseo.',
      'PROBLEMA/CAUSA RAIZ se toma de ANALIZAR; ACCION DE MEJORA viene de las soluciones elegidas.',
      'ESTATUS sólo admite los cuatro estados del original: NO REALIZADA · RETRASADA · EN CURSO · REALIZADA.',
      'La columna AVISO marca sola las acciones vencidas (fecha límite pasada y estatus distinto de REALIZADA): el estatus NO se sobrescribe, lo cambia el equipo.',
      'REUNION DE EQUIPO(AVANCES) es la bitácora corta de cada seguimiento; RESULTADOS es la evidencia de que la acción sirvió.',
      'MEJORA A CONTROLAR indica qué queda para la fase CONTROLAR (estándar, plan de control o gráfico de control).'
    ],
    blocks: [
      { type:'fields', title:'Encabezado', cols:3, items:(d, ctx) => [
        { k:'proyecto', label:'Proyecto:', input:'text', w:2,
          ph: first(T(ctx, 'definir.gantt').proyecto, (ctx && ctx.proj ? ctx.proj.nombre : '')) },
        { k:'lider',    label:'Responsable del plan', input:'text', w:1,
          ph: first(T(ctx, 'definir.gantt').responsable, (ctx && ctx.proj ? ctx.proj.lider : '')) }
      ] },
      { type:'note', tone:'info', text:'LEYENDA DE ESTATUS · NO REALIZADA (no ha empezado) · RETRASADA (pasó la fecha límite) · ' +
        'EN CURSO (en ejecución) · REALIZADA (terminada y verificada).' },
      { type:'grid', key:'rows', title:'PLAN DE ACCION - MEJORA', min:12, max:24,
        addLabel:'Agregar acción de mejora',
        rowStyle:(r) => (estaVencida(r) ? 'cell-warn' : (esRealizada(r) ? 'cell-ok' : '')),
        cols:(d, ctx) => {
          const cs = causasValidadas(ctx);
          const sols = solucionesElegidas(ctx);
          return [
            { k:'problema',    label:'PROBLEMA/CAUSA RAIZ', input:'textarea', rows:2, w:230,
              ph: cs.length ? corta(cs[0], 55) : 'Causa raíz validada que ataca esta acción' },
            { k:'accion',      label:'ACCION DE MEJORA', input:'textarea', rows:2, w:250,
              ph: sols.length ? corta(sols[0], 55) : 'Qué se va a hacer (verbo + objeto + alcance)' },
            { k:'responsable', label:'RESPONSABLE', input:'text', w:150 },
            { k:'inicio',      label:'FECHA DE INICIO', input:'date', w:140 },
            { k:'reunion',     label:'REUNION DE EQUIPO(AVANCES)', input:'textarea', rows:2, w:200,
              ph:'Fecha y acuerdo del seguimiento' },
            { k:'limite',      label:'FECHA LIMITE', input:'date', w:140 },
            { k:'estatus',     label:'ESTATUS', input:'select', opts:ESTATUS, w:150,
              help:'NO REALIZADA · RETRASADA · EN CURSO · REALIZADA',
              tone:(v) => TONO_EST[txt(v).toUpperCase()] || '' },
            { k:'aviso',       label:'AVISO AUTOMATICO', ro:true, w:190,
              help:'Se calcula con FECHA LIMITE y hoy; no cambia el ESTATUS',
              calc:(r) => avisoPlan(r) },
            { k:'descripcion', label:'DESCRIPCION', input:'textarea', rows:2, w:220,
              ph:'Cómo se ejecutó la acción' },
            { k:'resultados',  label:'RESULTADOS', input:'textarea', rows:2, w:220,
              ph:'Qué cambió en el métrico después de la acción' },
            { k:'mejora',      label:'MEJORA A CONTROLAR', input:'textarea', rows:2, w:220,
              ph:'Qué se estandariza y se vigila en CONTROLAR' }
          ];
        } },
      { type:'cards', items:(d) => {
          const s = resumenPlan(d);
          if (!s.n) return [];
          return [
            { label:'ACCIONES DEL PLAN', value: fmt(s.n, 'n0') },
            { label:'% REALIZADAS', value: isFinite(s.pct) ? fmt(s.pct, 'p0') : '—',
              tone: s.pct >= 0.99 ? 'ok' : (s.pct >= 0.5 ? 'warn' : 'bad'),
              hint: fmt(s.real, 'n0') + ' de ' + fmt(s.n, 'n0') + ' acciones' },
            { label:'RETRASADAS', value: fmt(s.retr, 'n0'), tone: s.retr ? 'bad' : 'ok',
              hint:'Marcadas RETRASADA o con fecha límite vencida' },
            { label:'EN CURSO', value: fmt(s.curso, 'n0'), tone: s.curso ? 'warn' : '' },
            { label:'NO REALIZADAS', value: fmt(s.nore, 'n0'), tone: s.nore ? 'warn' : 'ok' }
          ];
        } },
      { type:'chart', kind:'gantt', title:'Cronograma de las acciones de mejora', h:380,
        data:(d) => {
          const rows = arr(d.rows).filter(r => txt(r.accion) && txt(r.inicio) && txt(r.limite));
          let ini = null;
          rows.forEach(r => { if (!ini || r.inicio < ini) ini = r.inicio; });
          return {
            tasks: rows.map(r => ({
              label: corta(r.accion, 40), start: r.inicio, end: r.limite,
              progress: esRealizada(r) ? 1 : (estatusDe(r) === 'EN CURSO' ? 0.5 : 0),
              asignado: txt(r.responsable), estatus: estatusDe(r),
              tone: estaVencida(r) ? 'bad' : (TONO_EST[estatusDe(r)] || ''),
              dias: (function(){ const n = dDiff(r.inicio, r.limite); return isFinite(n) ? n + 1 : NaN; })()
            })),
            start: ini || hoy(), semana:1, days:56, hoy: hoy()
          };
        } },
      { type:'note', tone:'warn', text:(d) => {
          const v = arr(d.rows).filter(estaVencida);
          if (!v.length) return '';
          return 'ATENCION · ' + v.length + ' acción(es) con la FECHA LIMITE vencida y estatus distinto de REALIZADA: ' +
            v.slice(0, 4).map(r => corta(r.accion, 40) + ' (' + fmt(diasVencida(r), 'n0') + ' días)').join(' · ') +
            (v.length > 4 ? ' …' : '') + '. Deberían pasar a RETRASADA o replantearse en la reunión de equipo.';
        } },
      { type:'fields', title:'REUNION EQUIPO RESULTADOS', cols:2, items:[
        { k:'reunionAvances',   label:'REUNION DE EQUIPO — AVANCES Y ACUERDOS', input:'textarea', rows:6, w:1,
          ph:'Fecha, asistentes, avances revisados, obstáculos y compromisos.' },
        { k:'reunionResultados', label:'REUNION EQUIPO RESULTADOS', input:'textarea', rows:6, w:1,
          ph:'Resultados obtenidos con el plan: qué mejoró el métrico y qué queda pendiente.' }
      ] },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* C3:D3 Proyecto · F3/G3/I3/K3 leyenda de estatus (rótulos de la plantilla)
         Encabezados en la fila 5 (B5:K5). Registros cada 2 filas: 6, 8, … 28.
         La columna B (PROBLEMA/CAUSA RAIZ) está fusionada en bloques de 6 filas
         (B6:B11, B12:B17, B18:B23, B24:B29): las anclas caen en las filas 6, 12,
         18 y 24, es decir en los registros 1, 4, 7 y 10.
         B30:F31 avances · G30:I31 es el rótulo «REUNION EQUIPO RESULTADOS»,
         por eso el texto de resultados se escribe en el bloque libre J30:K31. */
      fields:{ proyecto:'C3', reunionAvances:'B30', reunionResultados:'J30' },
      grids:[{ key:'rows', rowsAt:[6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
               cols:{ problema:'B', accion:'C', responsable:'D', inicio:'E', reunion:'F',
                      limite:'G', estatus:'H', descripcion:'I', resultados:'J', mejora:'K' } }]
    },
    bi: (d) => {
      const s = resumenPlan(d);
      return {
        'Acciones de mejora': s.n,
        'Acciones realizadas': s.real,
        '% acciones realizadas': isFinite(s.pct) ? s.pct : 0,
        'Acciones retrasadas': s.retr,
        'Acciones en curso': s.curso,
        'Acciones no realizadas': s.nore,
        'Mejoras a controlar': filled(s.rows, 'mejora').length
      };
    }
  };

  /* ======================================================================
     4 · QUICK IMPROVEMENT   (fichas antes / acción / después)
     ==================================================================== */
  /** Genera el bloque a3 de una ficha. n=1 es la que se exporta al Excel. */
  function fichaQI(n){
    const p = n === 1 ? '' : ('f' + n + '_');
    return { type:'a3', cols:6,
      title: n === 1 ? 'FICHA 1 — ANTES / ACCION / DESPUES (es la que se exporta al Excel)'
                     : ('FICHA ' + n + ' — ANTES / ACCION / DESPUES (adicional, sólo en la app y la impresión)'),
      areas:[
        { k:p + 'antes',       label:'Antes',   kind:'text', w:2, h:120,
          ph:'Cómo era antes: qué se hacía, cuánto tardaba, qué fallaba.' },
        { k:p + 'accion',      label:'Accion',  kind:'text', w:2, h:120,
          ph:'Qué se hizo exactamente (la mejora implementada).' },
        { k:p + 'despues',     label:'Despues', kind:'text', w:2, h:120,
          ph:'Cómo quedó: resultado medido después de la mejora.' },
        { k:p + 'imgAntes',    label:'Imagen — Antes',   kind:'image', w:2, h:210 },
        { k:p + 'imgAccion',   label:'Imagen — Accion',  kind:'image', w:2, h:210 },
        { k:p + 'imgDespues',  label:'Imagen — Despues', kind:'image', w:2, h:210 },
        { k:p + 'bigAntes',    label:'ANTES',   kind:'image', w:3, h:340 },
        { k:p + 'bigDespues',  label:'DESPUES', kind:'image', w:3, h:340 }
      ] };
  }
  const QI_FICHAS = [1, 2, 3];

  const T_QI = {
    id: 'mejorar.quick_improvement',
    mod: 'MEJORAR',
    sheet: 'Quick Improvement',
    title: 'QUICK IMPROVEMENT',
    desc: 'Ficha visual de una mejora rápida: antes, acción y después, con la evidencia fotográfica del cambio.',
    guide: [
      'El Quick Improvement se usa para las mejoras que se implementan YA (quick wins): una hoja, una mejora.',
      'Toma la foto del ANTES antes de tocar nada; sin ella la ficha pierde todo su valor.',
      'El texto va corto y concreto: qué había, qué se hizo, qué quedó. La foto cuenta el resto.',
      'Las dos imágenes grandes (ANTES y DESPUES) son las que se imprimen y se publican en la cartelera del área.',
      'Puedes registrar varias fichas: la FICHA 1 es la que se vuelca al Excel original; las demás quedan en la app y en el PDF.',
      'Cada Quick Improvement debe quedar también como acción en el Plan de Accion, para no perder la trazabilidad.'
    ],
    blocks: [].concat(
      [ { type:'fields', title:'Encabezado', cols:3, items:(d, ctx) => [
          { k:'departamento', label:'Departamento:', input:'text', w:1,
            ph: first(T(ctx, 'definir.sipoc').owner, (ctx && ctx.proj ? ctx.proj.area : '')) },
          { k:'proceso',      label:'Proceso:', input:'text', w:1,
            ph: first(T(ctx, 'definir.sipoc').proceso, T(ctx, 'definir.series_tiempo').proceso) },
          { k:'fecha',        label:'Fecha:', input:'date', w:1, ph: hoy() }
        ] },
        { type:'note', tone:'info', text:'Bloque superior: descripción y foto pequeña de Antes / Accion / Despues. ' +
          'Bloque inferior: las dos imágenes grandes ANTES y DESPUES, que son el corazón de la ficha.' } ],
      QI_FICHAS.map(fichaQI),
      [ { type:'cards', items:(d) => {
            const fotos = ['imgAntes', 'imgAccion', 'imgDespues', 'bigAntes', 'bigDespues'];
            const llenas = QI_FICHAS.filter(n => {
              const p = n === 1 ? '' : ('f' + n + '_');
              return txt(d[p + 'antes']) || txt(d[p + 'despues']) || d[p + 'bigAntes'] || d[p + 'bigDespues'];
            }).length;
            const f1 = fotos.filter(k => d[k]).length;
            if (!llenas && !f1) return [];
            return [
              { label:'FICHAS DILIGENCIADAS', value: fmt(llenas, 'n0'), tone: llenas ? 'ok' : 'warn' },
              { label:'IMÁGENES DE LA FICHA 1', value: fmt(f1, 'n0') + ' / 5',
                tone: f1 >= 2 ? 'ok' : 'warn', hint:'Antes, Accion, Despues y las dos grandes' },
              { label:'EVIDENCIA ANTES / DESPUES', value: (d.bigAntes && d.bigDespues) ? 'COMPLETA' : 'INCOMPLETA',
                tone: (d.bigAntes && d.bigDespues) ? 'ok' : 'warn' }
            ];
          } },
        { type:'note', tone:'warn', text:(d) => (d.bigAntes && !d.bigDespues)
            ? 'Falta la imagen grande del DESPUES: sin el par antes/después no se puede mostrar el impacto de la mejora.' : '' },
        { type:'insight' } ]
    ),
    xl: { file: XLF,
      /* B5:C5 Departamento (valor D5:F5) · G5:H5 Proceso (valor I5:L5) ·
         M5:N5 Fecha (valor O5:P5) · B6:F7 Antes · G6:K7 Accion · L6:P7 Despues
         B8:F13 / G8:K13 / L8:P13 imágenes pequeñas
         B14:I14 ANTES · J14:P14 DESPUES · B15:I41 y J15:P41 imágenes grandes.
         Sólo se exporta la FICHA 1 (las fichas 2 y 3 viven en la app). */
      fields:{ departamento:'D5', proceso:'I5', fecha:'O5',
               antes:'B6', accion:'G6', despues:'L6' },
      images:[
        { k:'imgAntes',   anchor:'B8',  w:5, h:6 },
        { k:'imgAccion',  anchor:'G8',  w:5, h:6 },
        { k:'imgDespues', anchor:'L8',  w:5, h:6 },
        { k:'bigAntes',   anchor:'B15', w:8, h:27 },
        { k:'bigDespues', anchor:'J15', w:7, h:27 }
      ]
    },
    bi: (d) => {
      const fichas = QI_FICHAS.filter(n => {
        const p = n === 1 ? '' : ('f' + n + '_');
        return txt(d[p + 'antes']) || txt(d[p + 'despues']) || d[p + 'bigAntes'] || d[p + 'bigDespues'];
      }).length;
      return {
        'Fichas Quick Improvement': fichas,
        'Imágenes de la ficha 1': ['imgAntes', 'imgAccion', 'imgDespues', 'bigAntes', 'bigDespues'].filter(k => d[k]).length,
        'Par antes/después completo': (d.bigAntes && d.bigDespues) ? 1 : 0
      };
    }
  };

  /* ======================================================================
     5 · DESCRIPCION DE LA SOLUCION
     «ESTABLECE LA MEJORA Y SOLUCION DEL PROBLEMA»
     ==================================================================== */
  const T_DESC = {
    id: 'mejorar.descripcion_solucion',
    mod: 'MEJORAR',
    sheet: 'Descripcion de la solucion',
    title: 'ESTABLECE LA MEJORA Y SOLUCION DEL PROBLEMA',
    desc: 'Relato completo de la solución: del problema y su causa raíz a la mejora implementada, las acciones y los resultados.',
    guide: [
      'PROBLEMA se escribe una sola vez (en el original es la celda fusionada B4:B14) y se hereda de DEFINIR.',
      'CAUSA RAIZ, MEJORA IMPLEMENTADA, ACCIONES REALIZADAS y RESULTADOS admiten dos bloques: una fila por causa raíz atendida.',
      'RESULTADOS debe traer números: métrico antes, métrico después y el porcentaje de mejora.',
      'Los bloques adicionales de ACCIONES REALIZADAS corresponden a las subdivisiones del formato original (E6, E8 y E13).',
      'La CONCLUSION (B15:F15) es el cierre que se lee en la presentación a la dirección.'
    ],
    blocks: [
      { type:'fields', title:'PROBLEMA  (celda fusionada B4:B14 del original: se escribe una sola vez)', cols:1,
        items:(d, ctx) => [
          { k:'problema', label:'PROBLEMA', input:'textarea', rows:6, w:1,
            ph: problemaHeredado(ctx) || 'Enunciado del problema (se hereda de DEFINIR › Clarificación del Problema).' }
        ] },
      { type:'grid', key:'rows', title:'CAUSA RAIZ · MEJORA IMPLEMENTADA · ACCIONES REALIZADAS · RESULTADOS',
        min:2, max:2, fixed:true,
        cols:(d, ctx) => {
          const cs = causasValidadas(ctx);
          const sols = solucionesElegidas(ctx);
          return [
            /* B4:B14 está fusionada: el PROBLEMA se escribe arriba una sola vez
               y aquí sólo se refleja en la primera fila (columna de sólo lectura). */
            { k:'problema',   label:'PROBLEMA', ro:true, w:220,
              calc:(r, i, rows, dd, cc) => i === 0 ? (txt(dd.problema) || problemaHeredado(cc)) : '' },
            { k:'causa',      label:'CAUSA RAIZ', input:'textarea', rows:4, w:220,
              ph: cs.length ? corta(cs[0], 60) : 'Causa raíz validada en ANALIZAR' },
            { k:'mejora',     label:'MEJORA IMPLEMENTADA', input:'textarea', rows:4, w:220,
              ph: sols.length ? corta(sols[0], 60) : 'Solución elegida e implementada' },
            { k:'acciones',   label:'ACCIONES REALIZADAS', input:'textarea', rows:4, w:220,
              ph:'Acciones concretas ejecutadas (ver Plan de Accion)' },
            { k:'resultados', label:'RESULTADOS', input:'textarea', rows:4, w:220,
              ph:'Métrico antes → después, % de mejora, ahorro' }
          ];
        } },
      { type:'fields', title:'ACCIONES REALIZADAS — bloques adicionales del formato', cols:3, items:[
        { k:'acciones2', label:'ACCIONES REALIZADAS (bloque 2 · E6:E7)', input:'textarea', rows:4, w:1 },
        { k:'acciones3', label:'ACCIONES REALIZADAS (bloque 3 · E8:E9)', input:'textarea', rows:4, w:1 },
        { k:'acciones5', label:'ACCIONES REALIZADAS (bloque 5 · E13:E14)', input:'textarea', rows:4, w:1 }
      ] },
      { type:'fields', title:'CONCLUSION', cols:1, items:[
        { k:'conclusion', label:'CONCLUSION', input:'textarea', rows:5, w:1,
          ph:'La causa raíz X se eliminó con la mejora Y; el métrico pasó de A a B (Z %) y queda por controlar…' }
      ] },
      { type:'cards', items:(d, ctx) => {
          const rows = arr(d.rows).filter(hasContent);
          if (!rows.length && !txt(d.problema)) return [];
          const cnt = k => filled(arr(d.rows), k).length;
          return [
            { label:'PROBLEMA DEFINIDO', value: txt(d.problema) ? 'SÍ' : 'NO',
              tone: txt(d.problema) ? 'ok' : 'bad' },
            { label:'CAUSAS RAIZ ATENDIDAS', value: fmt(cnt('causa'), 'n0'),
              tone: cnt('causa') ? 'ok' : 'warn',
              hint:'Validadas en ANALIZAR: ' + fmt(causasValidadas(ctx).length, 'n0') },
            { label:'MEJORAS IMPLEMENTADAS', value: fmt(cnt('mejora'), 'n0'), tone: cnt('mejora') ? 'ok' : 'warn' },
            { label:'RESULTADOS DOCUMENTADOS', value: fmt(cnt('resultados'), 'n0'),
              tone: cnt('resultados') ? 'ok' : 'warn' },
            { label:'CONCLUSION', value: txt(d.conclusion) ? 'ESCRITA' : 'PENDIENTE',
              tone: txt(d.conclusion) ? 'ok' : 'warn' }
          ];
        } },
      { type:'note', tone:'info', text:'Si los RESULTADOS no traen el métrico antes y después, la mejora no está demostrada: vuelve a la línea base de MEDIR y compara con el mismo métrico y el mismo periodo.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* B3:F3 encabezados · B4:B14 PROBLEMA (fusionada, sólo la fila 1 escribe)
         C4:C9 y C10:C14 CAUSA RAIZ · D4:D9 y D10:D14 MEJORA IMPLEMENTADA
         E4:E5, E6:E7, E8:E9, E10:E12 y E13:E14 ACCIONES REALIZADAS (3+2 bloques)
         F4:F9 y F10:F14 RESULTADOS · B15:F15 conclusión */
      fields:{ problema:'B4', acciones2:'E6', acciones3:'E8', acciones5:'E13', conclusion:'B15' },
      grids:[{ key:'rows', rowsAt:[4, 10],
               cols:{ causa:'C', mejora:'D', acciones:'E', resultados:'F' } }]
    },
    bi: (d) => ({
      'Causas raíz atendidas': filled(arr(d.rows), 'causa').length,
      'Mejoras implementadas': filled(arr(d.rows), 'mejora').length,
      'Resultados documentados': filled(arr(d.rows), 'resultados').length,
      'Conclusión escrita': txt(d.conclusion) ? 1 : 0
    })
  };

  /* ======================================================================
     6 · A3 MEJORAR
     ==================================================================== */
  const T_A3 = {
    id: 'mejorar.a3_mejorar',
    mod: 'MEJORAR',
    sheet: 'A3 Mejorar',
    title: 'A3 — MEJORAR',
    desc: 'Resumen de una sola página de la fase MEJORAR: mejoras implementadas, plan de acción, resultados antes-después y lo que queda por controlar.',
    guide: [
      'El A3 se llena AL FINAL de MEJORAR, con lo que ya quedó documentado en las otras hojas.',
      'LISTA DE MEJORAS: las soluciones que efectivamente se implementaron (viene de «Seleccion de soluciones»).',
      'PLAN DE ACCION PARA IMPLEMENTAR MEJORAS se incrusta en vivo desde la hoja «Plan de accion».',
      'TABLA ANTES Y DESPUES: métrico antes, métrico después y porcentaje de mejora, con las imágenes de evidencia.',
      'MEJORA A CONTROLAR es el puente con CONTROLAR: qué se estandariza, quién lo vigila y con qué gráfico.',
      'Si algo no cabe en la página, sobra: el A3 obliga a priorizar.'
    ],
    blocks: [
      { type:'a3', title:'MEJORAR', cols:2, areas:(d, ctx) => {
          const sols = solucionesElegidas(ctx);
          const s = resumenPlan(T(ctx, 'mejorar.plan_accion'));
          return [
            { k:'mejoras', label:'LISTA DE MEJORAS', kind:'text', w:1, h:300,
              ph: sols.length ? sols.slice(0, 6).map((x, i) => (i + 1) + '. ' + corta(x, 60)).join('\n')
                              : 'Mejoras implementadas (una por línea).' },
            { label:'PLAN DE ACCION PARA IMPLEMENTAR MEJORAS', kind:'ref',
              ref:'mejorar.plan_accion', w:1, h:300 },
            { k:'tabla', label:'TABLA ANTES Y DESPUES - RESULTADOS DE MEJORAS', kind:'text', w:1, h:320,
              ph:'Métrico · ANTES · DESPUES · % de mejora\n(ej.: oportunidad de la cita · 9,4 días · 3,1 días · 67 %)' },
            { k:'imgAntes', label:'ANTES (imagen)', kind:'image', w:1, h:160 },
            { k:'imgDespues', label:'DESPUES (imagen)', kind:'image', w:1, h:160 },
            { k:'imgResultados', label:'GRAFICO / EVIDENCIA DE RESULTADOS', kind:'image', w:1, h:160 },
            { k:'controlar', label:'MEJORA A CONTROLAR', kind:'text', w:2, h:220,
              ph: s.n ? ('Acciones del plan con mejora a controlar: ' +
                          filled(s.rows, 'mejora').map(r => corta(r.mejora, 40)).slice(0, 4).join(' · '))
                      : 'Qué se estandariza, quién lo vigila, con qué métrico y con qué frecuencia.' }
          ];
        } },
      { type:'cards', items:(d, ctx) => {
          const sel = T(ctx, 'mejorar.seleccion_soluciones');
          const elegidas = filled(RS(sel, 'rows'), 'sol').filter(r => /^s[ií]/i.test(txt(r.solucion))).length;
          const s = resumenPlan(T(ctx, 'mejorar.plan_accion'));
          const qi = T(ctx, 'mejorar.quick_improvement');
          const out = [];
          out.push({ label:'SOLUCIONES IMPLEMENTADAS', value: fmt(elegidas, 'n0'),
                     tone: elegidas ? 'ok' : 'warn' });
          if (s.n){
            out.push({ label:'AVANCE DEL PLAN DE ACCION', value: isFinite(s.pct) ? fmt(s.pct, 'p0') : '—',
                       tone: s.pct >= 0.99 ? 'ok' : (s.pct >= 0.5 ? 'warn' : 'bad'),
                       hint: fmt(s.real, 'n0') + ' de ' + fmt(s.n, 'n0') + ' acciones' });
            out.push({ label:'ACCIONES RETRASADAS', value: fmt(s.retr, 'n0'), tone: s.retr ? 'bad' : 'ok' });
            out.push({ label:'MEJORAS A CONTROLAR', value: fmt(filled(s.rows, 'mejora').length, 'n0'),
                       tone:'ok', hint:'Pasan a la fase CONTROLAR' });
          }
          out.push({ label:'EVIDENCIA QUICK IMPROVEMENT',
                     value: (qi.bigAntes || qi.bigDespues) ? 'SÍ' : 'NO',
                     tone: (qi.bigAntes && qi.bigDespues) ? 'ok' : 'warn' });
          return out;
        } },
      { type:'note', tone:'warn', text:(d, ctx) => {
          const s = resumenPlan(T(ctx, 'mejorar.plan_accion'));
          if (s.n && s.retr) return 'El plan de acción tiene ' + s.retr + ' acción(es) retrasada(s): la fase MEJORAR no se cierra con acciones abiertas.';
          if (!txt(d.controlar)) return 'Falta declarar la MEJORA A CONTROLAR: sin eso la fase CONTROLAR no sabe qué estandarizar ni qué vigilar.';
          return '';
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* B2:J2 MEJORAR · B3:E3 y F3:J3 rótulos · B4:E12 lista de mejoras
         F4:J12 plan de acción · B13:J13 rótulo · B14:E24 tabla antes/después
         F14:H18 y F19:H24 imágenes antes/después · I14:J24 evidencia
         B25:J25 rótulo MEJORA A CONTROLAR · B26:J33 texto */
      fields:{ mejoras:'B4', tabla:'B14', controlar:'B26' },
      images:[
        { k:'imgAntes',      anchor:'F14', w:3, h:5 },
        { k:'imgDespues',    anchor:'F19', w:3, h:6 },
        { k:'imgResultados', anchor:'I14', w:2, h:11 }
      ],
      refs:[{ k:'plan', anchor:'F4', ref:'mejorar.plan_accion', w:5, h:9 }]
    },
    bi: (d, ctx) => {
      const s = resumenPlan(T(ctx, 'mejorar.plan_accion'));
      return {
        'A3 Mejorar — secciones escritas': [d.mejoras, d.tabla, d.controlar].filter(x => txt(x)).length,
        'A3 Mejorar — total secciones': 3,
        'A3 Mejorar — imágenes': ['imgAntes', 'imgDespues', 'imgResultados'].filter(k => d[k]).length,
        'Avance del plan de mejora': isFinite(s.pct) ? s.pct : 0
      };
    }
  };

  /* ====================================================================== */
  return [T_BRAIN, T_SEL, T_PLAN, T_QI, T_DESC, T_A3];

})();

registerTools(SPECS_MEJORAR);
