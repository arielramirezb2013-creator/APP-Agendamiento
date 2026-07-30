/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC · MÓDULO 1 — DEFINIR
   Especificaciones de las 15 hojas del libro 01DEFINIR.xlsx
   Fuente: _dump/5a3b1823-01DEFINIR.txt (volcado celda por celda del original)
   ========================================================================== */
'use strict';

const SPECS_DEFINIR = (function(){

  /* ------------------------------------------------------------- helpers */
  const T   = (ctx, id) => ((ctx && ctx.all && ctx.all[id]) || {});
  const RS  = (o, k) => (o && Array.isArray(o[k]) ? o[k] : []);
  const txt = v => (v === null || v === undefined ? '' : String(v)).trim();
  function first(){
    for (let i = 0; i < arguments.length; i++){ const v = txt(arguments[i]); if (v) return v; }
    return '';
  }
  /** progreso escrito como 0-1 o como 0-100 → siempre 0-1 */
  const p01 = v => { const n = num(v); return n > 1 ? n / 100 : n; };

  /* roles ---------------------------------------------------------------- */
  const ROLES_PM = ['Champion / Sponsor', 'Dueño del Proceso', 'Finanzas',
                    'Mentor (MBB-BB)', 'Facilitador (GB-BB)',
                    'Team Member', 'Team Member', 'Team Member'];
  const ROLES_CH = ['Champion / Sponsor', 'Dueño del Proceso', 'Finanzas',
                    'Mentor (MBB-BB)', 'Facilitador (GB-BB)',
                    'Team member', 'Team member', 'Team member', 'Team member'];
  const ROLES_A3 = ['Champion / Sponsor', 'Dueño del Proceso', 'Finanzas',
                    'Mentor (MBB-BB)', 'Facilitador (GB-BB)', 'Team Member'];
  /** nombre del integrante i tomado de «Project Members» */
  function miembro(ctx, i){
    const r = RS(T(ctx, 'definir.project_members'), 'rows')[i];
    return r ? txt(r.nombre) : '';
  }

  /* escalas de la matriz de priorización --------------------------------- */
  const ESC_ALTO5 = [{ v:'5', l:'5 — Alto' }, { v:'4', l:'4' }, { v:'3', l:'3 — Medio' },
                     { v:'2', l:'2' }, { v:'1', l:'1 — Bajo' }];
  const ESC_COSTO = [{ v:'5', l:'5 — Costo bajo' }, { v:'4', l:'4' }, { v:'3', l:'3 — Medio' },
                     { v:'2', l:'2' }, { v:'1', l:'1 — Costo alto' }];
  const prioridad = r => num(r.cliente) * num(r.costos) * num(r.exito) * num(r.empresa) * num(r.beneficio);

  /* objetivo SMART concatenado ------------------------------------------- */
  function smartAuto(dd){
    const p = [txt(dd.s), txt(dd.m), txt(dd.a), txt(dd.r), txt(dd.t)].filter(x => x);
    if (!p.length) return '';
    return p.join(' ').replace(/\s+/g, ' ').trim();
  }

  /* preguntas EXACTAS del 5W2H (hoja «Clarificacion Problema») ----------- */
  const CLAR = [
    { k:'r_what', w:'What?', cell:'D12', q:[
      'Que esta pasando?',
      'Que tipo de problema es?',
      'Las especificaciones o lo que es o no un defecto están claros?',
      'La severidad del problema varia?'] },
    { k:'r_why', w:'Why?', cell:'D18', q:[
      'Por que es un problema?'] },
    { k:'r_who', w:'Who?', cell:'D23', q:[
      'A quien afecta el problema? Para el cliente? Para la empresa o negocio?',
      'Quien detecto el problema?',
      'Quien reporto el problema?',
      'A Quien se le reporto el problema?',
      'Quien se esta quejando?'] },
    { k:'r_where', w:'Where?', cell:'D29', q:[
      'Donde se observo el problema? En una pieza o producto?  En que área o lote?',
      'Donde se informo del problema?',
      'Donde ocurrió el problema?',
      'Ocurrió con el cliente?',
      'Ocurrió dentro de la empresa?'] },
    { k:'r_when', w:'When?', cell:'D36', q:[
      'Cuando el problema fue descubierto o reportado?',
      'En que turno se encontró el problema?',
      'Cuando fue la ultima vez que se reporto el problema?'] },
    { k:'r_howmuch', w:'How Much/ Many?', cell:'D40', q:[
      'Cual es la magnitud del problema?',
      'Se puede cuantificar en PPM?',
      'Cuanto producto esta implicado?',
      'Cuanto dinero, tiempo y personal esta costando el problema?',
      'Cual es el métrico del problema?',
      'Cual es la situacion ideal?',
      'Cual situacion actual?',
      'Cual es el Gap?'] },
    { k:'r_how', w:'How?', cell:'D49', q:[
      'Como ocurrió?',
      'Que procedimientos se usaron?',
      'Tenemos evidencia física del problema?',
      'Tenemos evidencia electrónica del problema? Correos, etc?'] }
  ];

  /* Pareto: nombres por defecto de las 6 categorías del original C26:H26 - */
  const PAR_DEF = ['A', 'B', 'C', 'D', 'E', 'Other'];
  const parCat  = (r, i) => txt(r.cat) || PAR_DEF[i] || ('Cat ' + (i + 1));

  /* ---------------------------------------------------------------- Gantt */
  const GANTT_SEED = [
    { t:'DEFINIR', f:1 }, { t:'Tarea 1' }, { t:'Tarea 2' }, { t:'Tarea 3' }, { t:'Tarea 4' },
    { t:'MEDIR', f:1 }, { t:'Tarea 1' }, { t:'Tarea 2' }, { t:'Tarea 3' },
    { t:'ANALIZAR', f:1 }, { t:'Tarea 1' }, { t:'Tarea 2' }, { t:'Tarea 3' },
    { t:'MEJORAR', f:1 }, { t:'Tarea 1' }, { t:'Tarea 2' }, { t:'Tarea 3' },
    { t:'CONTROLAR', f:1 }, { t:'Tarea 1' }, { t:'Tarea 2' }, { t:'Tarea 3' },
    { t:'AVANCE DEL PROYECTO', f:1 }, { t:'CIERRE DEL PROYECTO' }, { t:'RECONOCIMIENTO DEL EQUIPO' }
  ];
  const esAvance = r => /AVANCE DEL PROYECTO/i.test(txt(r && r.tarea));
  const esCierre = r => /CIERRE DEL PROYECTO|RECONOCIM/i.test(txt(r && r.tarea));
  /** siembra la estructura DMAIC del original sólo si la tabla está vacía */
  function seedGantt(d){
    const rows = RS(d, 'rows');
    if (!rows.length) return;
    const vacio = rows.every(r => !txt(r.tarea) && !txt(r.asignado) && !txt(r.inicio) &&
                                  !txt(r.fin) && !txt(r.progreso));
    if (!vacio) return;
    GANTT_SEED.forEach((s, i) => { if (rows[i]){ rows[i].tarea = s.t; rows[i].fase = !!s.f; } });
  }
  /** =SUM(D10:D13)/COUNT(D10:D13) — promedio de las tareas de la fase */
  function faseAvance(rows, i){
    const v = [];
    for (let j = i + 1; j < rows.length; j++){
      if (rows[j].fase) break;
      if (isNum(rows[j].progreso)) v.push(p01(rows[j].progreso));
    }
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
  }
  /** =SUM(D9,D14,D18,D22,D26)/5 — promedio de las 5 fases */
  function avanceProyecto(rows){
    const fs = [];
    rows.forEach((r, i) => { if (r.fase && !esAvance(r)) fs.push(faseAvance(rows, i)); });
    if (!fs.length) return NaN;
    return fs.reduce((a, b) => a + (isFinite(b) ? b : 0), 0) / fs.length;
  }
  /** avance efectivo de cualquier fila (fase, resumen o tarea) */
  function ganttAvance(r, i, rows){
    if (esAvance(r)) return avanceProyecto(rows);
    if (r.fase) return faseAvance(rows, i);
    return isNum(r.progreso) ? p01(r.progreso) : NaN;
  }
  /** =IF(OR(ISBLANK(...)),"",task_end-task_start+1) */
  function ganttDias(r){
    const n = dDiff(r.inicio, r.fin);
    return isFinite(n) ? n + 1 : NaN;
  }
  /** H7 = InicioDelProyecto-WEEKDAY(InicioDelProyecto,1)+2+7*(SemanaParaMostrar-1) */
  function ganttLunes(inicio, semana){
    const s = dParse(inicio); if (!s) return '';
    const wd = s.getDay() + 1;                     // WEEKDAY(...,1): domingo=1 … sábado=7
    return dAdd(dISO(s), -wd + 2 + 7 * (Math.max(1, num(semana) || 1) - 1));
  }

  /* Project Charter — categorías de ahorros (J23:J32) --------------------- */
  const CAT_AHORROS = ['Garantia', 'Scrap', 'Retrabajo', 'Suministros', 'Material',
                       'Inventario', 'Inventory', 'Cycle time', 'Ingresos', 'Desperdicios'];
  /** =SUM(N23:O29,N31:O32) → «Cycle time» (fila 30) NO suma */
  const sumaAhorros = (rows, k) => rows.reduce((a, r, i) =>
    a + (CAT_AHORROS[i] === 'Cycle time' ? 0 : num(r[k])), 0);
  const FASES_DMAIC = ['DEFINIR', 'MEDIR', 'ANALIZAR', 'MEJORAR', 'CONTROLAR'];

  /* herencia entre hojas (lo que el Excel hace con =D10) ------------------ */
  const hProblema = (d, ctx) => first(d.problema, T(ctx, 'definir.clarificacion_problema').definicion);
  const hObjetivo = (d, ctx) => first(d.objetivo, T(ctx, 'definir.objetivo_smart').smart,
                                      smartAuto(T(ctx, 'definir.objetivo_smart')));
  const hCaso     = (d, ctx) => first(d.businessCase, T(ctx, 'definir.tabla_identificacion').caso);
  const hNombre   = (d, ctx) => first(d.nombre, T(ctx, 'definir.gantt').proyecto,
                                      T(ctx, 'definir.sipoc').proceso,
                                      (ctx && ctx.proj ? ctx.proj.nombre : ''));
  /** duración sugerida (semanas) a partir del cronograma del Gantt */
  function semanasGantt(ctx){
    const rows = RS(T(ctx, 'definir.gantt'), 'rows').filter(r => r.inicio && r.fin);
    if (!rows.length) return NaN;
    let a = null, b = null;
    rows.forEach(r => {
      if (!a || r.inicio < a) a = r.inicio;
      if (!b || r.fin > b) b = r.fin;
    });
    const dd = dDiff(a, b);
    return isFinite(dd) ? Math.ceil((dd + 1) / 7) : NaN;
  }

  /* ======================================================================
     1 · MATRIZ DE PRIORIZACION DE PROYECTOS
     ==================================================================== */
  const T01 = {
    id:'definir.matriz_priorizacion', mod:'DEFINIR', sheet:'Matriz Priorizacion Proyectos',
    title:'Matriz de Priorizacion de Proyectos',
    desc:'Compara los proyectos candidatos con cinco criterios y elige el de mayor prioridad.',
    guide:[
      'Lista en cada fila un proyecto candidato (hasta 11 como en el original).',
      'Califica de 1 a 5 cada criterio. OJO: «Costos de Implementacion» va INVERTIDO (Alto: 1 · Bajo: 5).',
      'La Prioridad es el PRODUCTO de los cinco criterios (=C7*D7*E7*F7*G7), no la suma.',
      'La tabla se ordena sola de mayor a menor prioridad y resalta al ganador.',
      'Escribe la justificación en «Eleccion del proyecto:» — ese texto alimenta el Project Charter.'
    ],
    blocks:[
      { type:'note', tone:'info', text:'ESCALAS · Importancia para el Cliente: Alto 5 / Bajo 1 · ' +
        'Costos de Implementacion: Alto 1 / Bajo 5 (INVERTIDA) · Probabilidad de Éxito: Alto 5 / Bajo 1 · ' +
        'Importancia para la Empresa: Alto 5 / Bajo 1 · Beneficio Esperado: Alto 5 / Bajo 1.' },
      { type:'grid', key:'rows', title:'Matriz de Priorizacion de Proyectos', min:11, max:40,
        addLabel:'Agregar proyecto', sortBy:'prioridad', sortDir:'desc',
        rowStyle:(r, i, rows) => {
          const p = prioridad(r);
          if (!(p > 0)) return '';
          const mx = Math.max.apply(null, rows.map(prioridad));
          return p === mx ? 'cell-ok' : '';
        },
        cols:[
          { k:'proyecto',  label:'PROYECTO', input:'text', w:240, ph:'Nombre del proyecto candidato' },
          { k:'cliente',   label:'Importancia para el Cliente', input:'select', opts:ESC_ALTO5, w:120,
            help:'Alto: 5 · Bajo: 1' },
          { k:'costos',    label:'Costos de Implementacion', input:'select', opts:ESC_COSTO, w:120,
            help:'Alto: 1 · Bajo: 5 (escala invertida)' },
          { k:'exito',     label:'Probabilidad de Éxito Factibilidad', input:'select', opts:ESC_ALTO5, w:120,
            help:'Alto: 5 · Bajo: 1' },
          { k:'empresa',   label:'Importancia para la Empresa o Negocio', input:'select', opts:ESC_ALTO5, w:120,
            help:'Alto: 5 · Bajo: 1' },
          { k:'beneficio', label:'Beneficio Esperado', input:'select', opts:ESC_ALTO5, w:120,
            help:'Alto: 5 · Bajo: 1' },
          { k:'prioridad', label:'Prioridad del Proyecto', ro:true, fmt:'n0', databar:true, w:130,
            calc:(r) => prioridad(r) }
        ],
        foot:[
          { k:'__label', label:'MÁXIMA' },
          { k:'prioridad', fmt:'n0', calc:(rows) => Math.max.apply(null, [0].concat(rows.map(prioridad))) }
        ] },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows').filter(r => txt(r.proyecto));
          if (!rows.length) return [];
          let top = rows[0];
          rows.forEach(r => { if (prioridad(r) > prioridad(top)) top = r; });
          return [
            { label:'PROYECTOS EVALUADOS', value: fmt(rows.length, 'n0') },
            { label:'PRIORIDAD MÁXIMA', value: fmt(prioridad(top), 'n0'), tone:'ok' },
            { label:'PROYECTO GANADOR', value: txt(top.proyecto) || '—', tone:'ok',
              hint:'Producto de los 5 criterios' }
          ];
        } },
      { type:'fields', title:'Eleccion del proyecto:', cols:1, items:[
        { k:'eleccion', label:'Eleccion del proyecto:', input:'textarea', rows:5, w:1,
          ph:'Proyecto elegido y por qué (impacto en el cliente, costo, factibilidad, beneficio esperado).' }
      ] },
      { type:'insight' }
    ],
    xl:{
      fields:{ eleccion:'C19' },
      grids:[{ key:'rows', row:7, cols:{ proyecto:'B', cliente:'C', costos:'D', exito:'E',
                                         empresa:'F', beneficio:'G' } }]
      /* H7:H17 = C*D*E*F*G → fórmula, no se escribe */
    },
    bi:(d) => {
      const rows = RS(d, 'rows').filter(r => txt(r.proyecto));
      let top = null;
      rows.forEach(r => { if (!top || prioridad(r) > prioridad(top)) top = r; });
      return {
        'Proyectos evaluados': rows.length,
        'Prioridad máxima': top ? prioridad(top) : 0,
        'Proyecto priorizado': top ? txt(top.proyecto) : '',
        'Elección declarada': txt(d.eleccion) ? 1 : 0
      };
    }
  };

  /* ======================================================================
     2 · CLARIFICACION DEL PROBLEMA (5W2H · IS / CLARIFICATION)
     ==================================================================== */
  const T02 = {
    id:'definir.clarificacion_problema', mod:'DEFINIR', sheet:'Clarificacion Problema',
    title:'Clarificación del Problema',
    desc:'5W2H de clarificación: convierte el reporte inicial en una definición precisa del problema.',
    guide:[
      'Empieza copiando textualmente cómo se reportó el problema y sube una foto o bosquejo.',
      'La columna IS son las preguntas guía del original; responde en la columna CLARIFICATION (una por grupo).',
      'Responde con datos: cantidades, fechas, turnos, áreas, dinero. Evita causas y soluciones.',
      'Cierra con la «Definición del Problema»: qué, dónde, desde cuándo, cuánto y cuál es el GAP.',
      'Ese enunciado se hereda al Project Charter y al A3.'
    ],
    blocks:[
      { type:'fields', title:'Reporte inicial', cols:2, items:[
        { k:'reporte',  label:'Como se reporto inicialmente el problema', input:'textarea', rows:8, w:1,
          ph:'Transcribe el reporte tal como llegó (correo, queja, hallazgo, indicador).' },
        { k:'producto', label:'Producto o Numero de Parte:', input:'text', w:1 },
        { k:'cliente',  label:'Cliente:', input:'text', w:1 }
      ] },
      { type:'upload', k:'foto', label:'Foto, imagen o Bosquejo del Problema', h:260 },
      { type:'note', tone:'info', text:'Liste toda la información que podría ayudar a definir el problema con mayor exactitud.' },
      { type:'fields', title:'IS  /  CLARIFICATION', cols:2, items:(function(){
          const it = [];
          CLAR.forEach(g => {
            it.push({ k:'q_' + g.k, label:g.w + '  ·  IS', input:'textarea', rows:Math.max(3, g.q.length),
                      ro:true, w:1, calc:() => g.q.join('\n') });
            it.push({ k:g.k, label:g.w + '  ·  CLARIFICATION', input:'textarea',
                      rows:Math.max(3, g.q.length), w:1, ph:'Respuesta a las preguntas de ' + g.w });
          });
          return it;
        })() },
      { type:'fields', title:'problem statement and business case', cols:1, items:[
        { k:'definicion', label:'Definición del Problema (en base a toda la información escrita anteriormente)',
          input:'textarea', rows:8, w:1,
          ph:'En el proceso X, desde <fecha>, el <métrico> es <actual> frente a <ideal>, lo que genera un GAP de <…> y un costo de $<…>.' }
      ] },
      { type:'insight' }
    ],
    xl:{
      fields:{ reporte:'C5', producto:'C8', cliente:'C9',
               r_what:'D12', r_why:'D18', r_who:'D23', r_where:'D29',
               r_when:'D36', r_howmuch:'D40', r_how:'D49', definicion:'C55' },
      images:[{ k:'foto', anchor:'D5', w:1, h:6 }]
    },
    bi:(d) => {
      const resp = CLAR.filter(g => txt(d[g.k])).length;
      return {
        'Grupos 5W2H respondidos': resp,
        'Cobertura 5W2H': safeDiv(resp, CLAR.length),
        'Problema definido': txt(d.definicion) ? 1 : 0,
        'Evidencia gráfica': d.foto ? 1 : 0
      };
    }
  };

  /* ======================================================================
     3 · ÁRBOL CTQ
     ==================================================================== */
  const T03 = {
    id:'definir.arbol_ctq', mod:'DEFINIR', sheet:'Árbol CTQ (Critico Para Calida',
    title:'CARACTERISTICAS CRITICAS DE CALIDAD (CTQ)',
    desc:'Traduce la voz del cliente en conductores de calidad y en requisitos medibles (CTQ).',
    guide:[
      'Escribe la necesidad del cliente en su propio lenguaje (VOC), sin traducirla todavía.',
      'Del lado del conductor pon el atributo que la explica (oportunidad, trato, exactitud, seguridad).',
      'El CTQ debe ser medible: métrico + unidad + meta (ej. «agendamiento ≤ 48 horas hábiles»).',
      'Registra abajo los METRICOS que usarás para vigilar cada CTQ.',
      'El árbol de la derecha se dibuja solo con lo que escribas en la tabla.'
    ],
    blocks:[
      { type:'fields', title:'Encabezado', cols:3, items:[
        { k:'fecha', label:'FECHA:', input:'date' }
      ] },
      { type:'grid', key:'rows', title:'Árbol CTQ', min:24, max:60, addLabel:'Agregar necesidad',
        cols:[
          { k:'necesidad', label:'Necesidad del Cliente', input:'textarea', rows:2, w:240 },
          { k:'conductor', label:'Conductores de Calidad', input:'textarea', rows:2, w:240 },
          { k:'ctq',       label:'Requisitos de Calidad (CTQ)', input:'textarea', rows:2, w:260 }
        ] },
      { type:'diagram', kind:'ctq', key:'ctq', title:'Árbol CTQ (vista de diagrama)' },
      { type:'grid', key:'metricos', title:'METRICOS', min:3, max:12, addLabel:'Agregar métrico',
        cols:[
          { k:'metrico', label:'METRICOS', input:'text', w:420,
            ph:'Métrico con el que se vigila el CTQ (unidad y meta)' }
        ] },
      { type:'cards', items:(d) => {
          const n  = RS(d, 'rows').filter(r => txt(r.necesidad) || txt(r.ctq)).length;
          const c  = RS(d, 'rows').filter(r => txt(r.ctq)).length;
          const m  = RS(d, 'metricos').filter(r => txt(r.metrico)).length;
          if (!n && !m) return [];
          return [
            { label:'NECESIDADES', value: fmt(n, 'n0') },
            { label:'CTQ DEFINIDOS', value: fmt(c, 'n0'), tone: c ? 'ok' : 'warn' },
            { label:'MÉTRICOS', value: fmt(m, 'n0'), tone: m ? 'ok' : 'warn' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      fields:{ fecha:'D3' },
      grids:[
        { key:'rows',     row:5,  cols:{ necesidad:'B', conductor:'C', ctq:'D' } },
        { key:'metricos', row:29, cols:{ metrico:'C' } }
      ],
      diagrams:[{ key:'ctq', kind:'ctq', anchor:'F4' }]
    },
    bi:(d) => ({
      'Necesidades del cliente': RS(d, 'rows').filter(r => txt(r.necesidad)).length,
      'CTQ definidos': RS(d, 'rows').filter(r => txt(r.ctq)).length,
      'Métricos CTQ': RS(d, 'metricos').filter(r => txt(r.metrico)).length
    })
  };

  /* ======================================================================
     4 · SERIE DE TIEMPO — BASE LINE
     ==================================================================== */
  const T04 = {
    id:'definir.series_tiempo', mod:'DEFINIR', sheet:'Series de tiempo',
    title:'SERIE DE TIEMPO - BASE LINE',
    desc:'Línea base del métrico en el tiempo contra el objetivo (target) y el promedio.',
    guide:[
      'Define primero el Objetivo(Target) y el Proceso que estás midiendo.',
      'Carga mínimo 15-20 puntos consecutivos (días, semanas o meses) sin huecos.',
      'La columna Objetivo replica el target en todas las filas (=E3) y Promedio es el AVERAGE de la serie.',
      'Observa nivel, tendencia y variabilidad: eso es la línea base del proyecto.',
      'Este gráfico se incrusta en vivo en el A3 Definir.'
    ],
    blocks:[
      { type:'fields', title:'Encabezado', cols:3, items:[
        { k:'objetivo', label:'Objetivo(Target):', input:'number', step:'any', w:1 },
        { k:'proceso',  label:'Proceso:', input:'text', w:2,
          ph:'Proceso / servicio medido (ej. agendamiento de citas de fisioterapia)' }
      ] },
      { type:'grid', key:'rows', title:'Línea base', min:20, max:200, addLabel:'Agregar punto',
        cols:[
          { k:'tiempo',   label:'Tiempo(fecha,dias,meses)', input:'text', w:170 },
          { k:'metrico',  label:'Métrico\n(cantidad, dinero, porcentaje)', input:'number', step:'any',
            align:'right', w:170 },
          { k:'objetivo', label:'Objetivo\n(Target)', ro:true, fmt:'n2', w:130,
            calc:(r, i, rows, d) => (txt(d.objetivo) === '' ? NaN : num(d.objetivo)) },
          { k:'promedio', label:'Promedio\n(Mean)', ro:true, fmt:'n2', w:130,
            calc:(r, i, rows) => avg(rows, 'metrico') }
        ],
        foot:[
          { k:'__label', label:'PROMEDIO' },
          { k:'metrico', fmt:'n2', calc:(rows) => avg(rows, 'metrico') },
          { k:'objetivo', fmt:'n2', calc:(rows, d) => (txt(d.objetivo) === '' ? NaN : num(d.objetivo)) }
        ] },
      { type:'chart', kind:'lineTarget', title:'Serie de tiempo vs objetivo', h:340,
        data:(d) => {
          const rows = RS(d, 'rows').filter(r => isNum(r.metrico));
          return {
            labels: rows.map((r, i) => txt(r.tiempo) || String(i + 1)),
            values: rows.map(r => num(r.metrico)),
            target: txt(d.objetivo) === '' ? null : num(d.objetivo),
            mean:   avg(rows, 'metrico'),
            title:  txt(d.proceso), ylabel: txt(d.proceso)
          };
        } },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows').filter(r => isNum(r.metrico));
          if (!rows.length) return [];
          const m = avg(rows, 'metrico'), t = num(d.objetivo);
          const gap = txt(d.objetivo) === '' ? NaN : m - t;
          return [
            { label:'PUNTOS', value: fmt(rows.length, 'n0'),
              tone: rows.length >= 15 ? 'ok' : 'warn', hint:'Recomendado ≥ 15' },
            { label:'PROMEDIO (MEAN)', value: fmt(m, 'n2') },
            { label:'OBJETIVO (TARGET)', value: txt(d.objetivo) === '' ? '—' : fmt(t, 'n2') },
            { label:'GAP vs OBJETIVO', value: isFinite(gap) ? fmt(gap, 'n2') : '—',
              tone: isFinite(gap) ? (Math.abs(gap) < 1e-9 ? 'ok' : 'warn') : '' },
            { label:'DESV. ESTÁNDAR', value: fmt(stdev(rows.map(r => num(r.metrico))), 'n2'),
              hint:'Variabilidad de la línea base' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      /* B3:D3 y H3:J3 son sólo rótulos; las celdas de valor son E3 y K3 (E6 = E3 en el original) */
      fields:{ objetivo:'E3', proceso:'K3' },
      grids:[{ key:'rows', row:6, cols:{ tiempo:'C', metrico:'D' } }]
      /* E6:E25 (=E3) y F6:F25 (=G7=AVERAGE(D6:D25)) son fórmulas */
    },
    bi:(d) => {
      const rows = RS(d, 'rows').filter(r => isNum(r.metrico));
      const m = avg(rows, 'metrico');
      return {
        'Puntos de línea base': rows.length,
        'Promedio línea base': isFinite(m) ? m : 0,
        'Objetivo (target)': num(d.objetivo),
        'GAP línea base': isFinite(m) && txt(d.objetivo) !== '' ? m - num(d.objetivo) : 0,
        'Desviación estándar': stdev(rows.map(r => num(r.metrico))) || 0
      };
    }
  };

  /* ======================================================================
     5 · PARETO — BASE LINE
     ==================================================================== */
  const T05 = {
    id:'definir.pareto', mod:'DEFINIR', sheet:'Pareto',
    title:'GRAFICO PARETO - BASE LINE',
    desc:'Separa los pocos vitales de los muchos triviales: 80 % del problema en pocas categorías.',
    guide:[
      'Renombra las categorías (por defecto A, B, C, D, E, Other) y carga su frecuencia.',
      'Deja siempre «Other» al final: el acumulado se calcula en el orden de la tabla, como en el Excel.',
      'Porcentaje = frecuencia / TOTAL. El acumulado suma de arriba hacia abajo.',
      'Las categorías que llegan al 80 % acumulado son las que entran al alcance del proyecto.',
      'Puedes agregar más de 6 categorías; al exportar sólo las 6 primeras caen en C..H.'
    ],
    blocks:[
      { type:'grid', key:'rows', title:'Datos del Pareto', min:6, max:30, addLabel:'Agregar categoria',
        cols:[
          { k:'cat', label:'Categoria', input:'text', w:220, ph:'A, B, C, D, E, Other…' },
          { k:'fre', label:'Frecuencia', input:'number', step:'any', align:'right', w:130 },
          { k:'pct', label:'Porcentaje', ro:true, fmt:'p1', w:120,
            calc:(r, i, rows) => safeDiv(num(r.fre), sum(rows, 'fre')) },
          { k:'acum', label:'Porcentaje acumulado', ro:true, fmt:'p1', w:150, databar:true,
            calc:(r, i, rows) => safeDiv(sum(rows.slice(0, i + 1), 'fre'), sum(rows, 'fre')) }
        ],
        rowStyle:(r, i, rows) => {
          const a = safeDiv(sum(rows.slice(0, i + 1), 'fre'), sum(rows, 'fre'));
          const p = safeDiv(sum(rows.slice(0, i), 'fre'), sum(rows, 'fre'));
          if (!isFinite(a)) return '';
          return (p < 0.8 || !isFinite(p)) && num(r.fre) > 0 ? 'cell-ok' : '';
        },
        foot:[
          { k:'__label', label:'TOTAL' },
          { k:'fre', fmt:'n0', calc:(rows) => sum(rows, 'fre') },
          { k:'pct', fmt:'p0', calc:(rows) => (sum(rows, 'fre') ? 1 : NaN) }
        ] },
      { type:'chart', kind:'pareto', title:'GRAFICO PARETO - BASE LINE', h:360,
        data:(d) => {
          const rows = RS(d, 'rows').filter(r => isNum(r.fre) && num(r.fre) !== 0);
          const tot = sum(rows, 'fre');
          let ac = 0;
          const cum = rows.map(r => { ac += num(r.fre); return safeDiv(ac, tot); });
          return {
            labels: rows.map((r, i) => parCat(r, i)),
            values: rows.map(r => num(r.fre)),
            pct: rows.map(r => safeDiv(num(r.fre), tot)),
            cum: cum, total: tot, line80: 0.8
          };
        } },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows').filter(r => isNum(r.fre) && num(r.fre) > 0);
          if (!rows.length) return [];
          const tot = sum(rows, 'fre');
          let ac = 0, vital = 0;
          rows.forEach(r => { if (ac < 0.8 * tot){ vital++; ac += num(r.fre); } });
          const top = rows.slice().sort((a, b) => num(b.fre) - num(a.fre))[0];
          const idx = rows.indexOf(top);
          return [
            { label:'TOTAL', value: fmt(tot, 'n0') },
            { label:'CATEGORÍAS', value: fmt(rows.length, 'n0') },
            { label:'POCOS VITALES (80 %)', value: fmt(vital, 'n0'), tone:'ok',
              hint:'Categorías que acumulan el 80 %' },
            { label:'CATEGORÍA MAYOR', value: parCat(top, idx), tone:'warn',
              hint: fmt(safeDiv(num(top.fre), tot), 'p1') + ' del total' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      /* la tabla del original está TRANSPUESTA: categorías en C26:H26 y frecuencias en C27:H27 */
      transposed:[{ key:'rows', col:'C', maxCols:6, rows:{ cat:26, fre:27 } }]
      /* I27 =SUM(C27:H27), fila 28 (%) y fila 29 (acumulado) son fórmulas */
    },
    bi:(d) => {
      const rows = RS(d, 'rows').filter(r => isNum(r.fre) && num(r.fre) > 0);
      const tot = sum(rows, 'fre');
      let ac = 0, vital = 0;
      rows.slice().sort((a, b) => num(b.fre) - num(a.fre)).forEach(r => {
        if (ac < 0.8 * tot){ vital++; ac += num(r.fre); }
      });
      const top = rows.slice().sort((a, b) => num(b.fre) - num(a.fre))[0];
      return {
        'Total Pareto': tot,
        'Categorías': rows.length,
        'Pocos vitales (80%)': vital,
        'Peso de la categoría mayor': top ? safeDiv(num(top.fre), tot) : 0
      };
    }
  };

  /* ======================================================================
     6 · OBJETIVO SMART
     ==================================================================== */
  const T06 = {
    id:'definir.objetivo_smart', mod:'DEFINIR', sheet:'Objetivo SMART',
    title:'Objetivo del Proyecto',
    desc:'Construye el objetivo del proyecto con los cinco atributos SMART.',
    guide:[
      'Especifico: qué métrico y en qué proceso, sin ambigüedad.',
      'Medible: de cuánto a cuánto (línea base → meta), con la unidad.',
      'Alcanzable: por qué es viable con los recursos y el alcance definidos.',
      'Relevante: qué impacto tiene para el cliente, la ARL y la empresa.',
      'Periodo: fecha límite. Abajo se arma solo el «Objetivo SMART» concatenando los cinco.'
    ],
    blocks:[
      { type:'fields', title:'Objetivo del Proyecto', cols:1, items:[
        { k:'s', label:'S · Especifico(Specific):', input:'textarea', rows:2, w:1,
          ph:'Reducir el tiempo de agendamiento de citas…' },
        { k:'m', label:'M · Medible(Measurable):', input:'textarea', rows:2, w:1,
          ph:'…de 6,2 días a 3,0 días en promedio (reducción del 52 %)…' },
        { k:'a', label:'A · Alcanzable(Attainable):', input:'textarea', rows:2, w:1,
          ph:'…con el equipo y los recursos aprobados en el Project Charter…' },
        { k:'r', label:'R · Relevante(Relevant):', input:'textarea', rows:2, w:1,
          ph:'…para cumplir el acuerdo de servicio con la ARL y las empresas afiliadas…' },
        { k:'t', label:'T · Periodo de tiempo especifico(Time Based):', input:'textarea', rows:2, w:1,
          ph:'…antes del 31 de diciembre de 2026.' }
      ] },
      { type:'fields', title:'Objetivo SMART armado automáticamente', cols:1, items:[
        { k:'smartAuto', label:'Objetivo SMART (propuesto = S + M + A + R + T)', input:'textarea', rows:4,
          ro:true, w:1, calc:(d) => smartAuto(d) || '' }
      ] },
      { type:'note', tone:'info', text:(d) => smartAuto(d)
        ? 'Copia el texto propuesto al campo «Objetivo SMART» y ajústalo hasta que se lea como una sola frase.'
        : 'Completa S, M, A, R y T: el objetivo propuesto se arma solo con esos cinco campos.' },
      { type:'fields', title:'Objetivo SMART', cols:1, items:(d) => [
        { k:'smart', label:'Objetivo SMART', input:'textarea', rows:4, w:1,
          ph: smartAuto(d) || 'Redacción final del objetivo del proyecto (una sola frase).' }
      ] },
      { type:'cards', items:(d) => {
          const ok = ['s', 'm', 'a', 'r', 't'].filter(k => txt(d[k])).length;
          if (!ok && !txt(d.smart)) return [];
          return [
            { label:'ATRIBUTOS SMART', value: ok + '/5', tone: ok === 5 ? 'ok' : 'warn' },
            { label:'OBJETIVO FINAL', value: txt(d.smart) ? 'DEFINIDO' : 'PENDIENTE',
              tone: txt(d.smart) ? 'ok' : 'warn' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{ fields:{ s:'D3', m:'D5', a:'D7', r:'D9', t:'D11', smart:'D13' } },
    bi:(d) => ({
      'Atributos SMART completos': ['s', 'm', 'a', 'r', 't'].filter(k => txt(d[k])).length,
      'Objetivo SMART definido': txt(d.smart) || smartAuto(d) ? 1 : 0
    })
  };

  /* ======================================================================
     7 · SIPOC
     ==================================================================== */
  const T07 = {
    id:'definir.sipoc', mod:'DEFINIR', sheet:'SIPOC',
    title:'SIPOC',
    desc:'Vista de alto nivel del proceso: proveedores, entradas, proceso, salidas y clientes.',
    guide:[
      'Empieza por el PROCESS (5 a 7 pasos de alto nivel) y luego completa hacia los lados.',
      'OUTPUTS son los entregables del proceso; CUSTOMERS son quienes los reciben (ARL, empresa afiliada, paciente).',
      'INPUTS son los recursos que se consumen y SUPPLIERS quien los entrega.',
      'Define KEY METRICS de entrada, de proceso y de salida: son los candidatos a métrico del proyecto.',
      'El SIPOC delimita el alcance: lo que no aparece aquí queda fuera (Scope Out).'
    ],
    blocks:[
      { type:'fields', title:'Encabezado', cols:4, items:[
        { k:'proceso', label:'PROCESS NAME', input:'text', w:2 },
        { k:'fecha',   label:'DATE', input:'date', w:1 },
        { k:'owner',   label:'PROCESS OWNER', input:'text', w:2 },
        { k:'empresa', label:'COMPANY', input:'text', w:1 }
      ] },
      { type:'grid', key:'rows', title:'SIPOC', min:8, max:40, addLabel:'Agregar fila',
        cols:[
          { k:'sup', label:'SUPPLIERS\nPROVIDERS OF THE RESOURCES', input:'textarea', rows:2, w:180 },
          { k:'inp', label:'INPUTS\nRESOURCES REQUIRED', input:'textarea', rows:2, w:180 },
          { k:'pro', label:'PROCESS\nPROCESS DESCRPTION', input:'textarea', rows:2, w:200 },
          { k:'out', label:'OUTPUTS\nPROCESS DELIVERABLES', input:'textarea', rows:2, w:180 },
          { k:'cus', label:'CUSTOMERS\nSTAKEHOLDERS', input:'textarea', rows:2, w:180 }
        ] },
      { type:'diagram', kind:'sipoc', key:'sipoc', title:'SIPOC (vista de diagrama)' },
      { type:'fields', title:'KEY METRICS', cols:3, items:[
        { k:'kmInputs',  label:'INPUTS', input:'textarea', rows:6, w:1,
          ph:'Métricos de entrada (X): calidad de la orden, datos del afiliado…' },
        { k:'kmProcess', label:'PROCESS', input:'textarea', rows:6, w:1,
          ph:'Métricos de proceso: tiempo de ciclo, reprocesos, colas…' },
        { k:'kmOutputs', label:'OUTPUTS', input:'textarea', rows:6, w:1,
          ph:'Métricos de salida (Y): oportunidad, cumplimiento, satisfacción…' }
      ] },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows');
          const c = k => rows.filter(r => txt(r[k])).length;
          if (!rows.some(hasContent)) return [];
          return [
            { label:'SUPPLIERS', value: fmt(c('sup'), 'n0') },
            { label:'INPUTS', value: fmt(c('inp'), 'n0') },
            { label:'PASOS DEL PROCESO', value: fmt(c('pro'), 'n0'),
              tone: c('pro') >= 4 && c('pro') <= 8 ? 'ok' : 'warn', hint:'Ideal 5 a 7' },
            { label:'OUTPUTS', value: fmt(c('out'), 'n0') },
            { label:'CUSTOMERS', value: fmt(c('cus'), 'n0') }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      fields:{ proceso:'C3', owner:'C4', fecha:'F3', empresa:'F4',
               kmInputs:'B18', kmProcess:'D18', kmOutputs:'E18' },
      /* D7:D14 está fusionada: «pro» sólo se escribe en D7 */
      grids:[{ key:'rows', row:7, cols:{ sup:'B', inp:'C', pro:'D', out:'E', cus:'F' }, merged:['pro'] }],
      diagrams:[{ key:'sipoc', kind:'sipoc', anchor:'B7' }]
    },
    bi:(d) => {
      const rows = RS(d, 'rows');
      return {
        'Pasos del proceso (SIPOC)': rows.filter(r => txt(r.pro)).length,
        'Proveedores': rows.filter(r => txt(r.sup)).length,
        'Clientes / stakeholders': rows.filter(r => txt(r.cus)).length,
        'Key metrics definidos': ['kmInputs', 'kmProcess', 'kmOutputs'].filter(k => txt(d[k])).length
      };
    }
  };

  /* ======================================================================
     8 · BENEFICIOS O AHORROS POTENCIALES
     ==================================================================== */
  const benUnit = M => num(M['des2.metrico']);                       // C5 = costo unitario
  const T08 = {
    id:'definir.beneficios', mod:'DEFINIR', sheet:'Beneficios',
    title:'BENEFICIOS O AHORROS POTENCIALES',
    desc:'Tres escenarios de ahorro (DESEADO, GOAL, RETADORA) en unidades y en dinero.',
    guide:[
      'Fila «DESEADO»: métrico, BASE LINE - ACTUAL en unidades y el AHORRO esperado. El BENEFICIO es D-E.',
      'Fila «DESEADO ($)»: en la columna METRICO va el COSTO UNITARIO (celda C5) y en BASE LINE el valor actual en dinero.',
      'El ahorro en dinero de los tres escenarios se calcula como costo unitario × ahorro en unidades (=C5*E4).',
      'GOAL y RETADORA heredan la línea base del escenario DESEADO, igual que en el Excel (F7=D4-E7).',
      'Abajo registra los ENTREGABLES: HARD SAVINGS (dinero duro) y SOFT SAVINGS (beneficios no monetizables).'
    ],
    blocks:[
      { type:'note', tone:'warn', text:'El COSTO UNITARIO se escribe UNA sola vez, en la fila «DESEADO ($)» ' +
        'columna METRICO (celda C5 del original): con él se convierten a dinero los tres escenarios.' },
      { type:'matrix', key:'ben', title:'BENEFICIOS O AHORROS POTENCIALES',
        rows:[
          { k:'des1', l:'DESEADO' },        { k:'des2', l:'DESEADO ($)' },
          { k:'goal1', l:'GOAL' },          { k:'goal2', l:'GOAL ($)' },
          { k:'ret1', l:'RETADORA' },       { k:'ret2', l:'RETADORA ($)' }
        ],
        cols:[
          { k:'metrico', label:'METRICO  /  COSTO UNITARIO ($)', input:'text' },
          { k:'base',    label:'BASE LINE - ACTUAL', input:'number', align:'right', fmt:'n2' },
          { k:'ahorro',  label:'AHORRO', input:'number', align:'right', fmt:'n2' },
          { k:'benef',   label:'BENEFICIO - MEJORA', ro:true, fmt:'n2', align:'right' }
        ],
        calc:{
          /* F4 = D4-E4 */
          'des1.benef':  M => num(M['des1.base']) - num(M['des1.ahorro']),
          /* E5 = C5*E4 · F5 = D5-E5 */
          'des2.ahorro': M => benUnit(M) * num(M['des1.ahorro']),
          'des2.benef':  M => num(M['des2.base']) - benUnit(M) * num(M['des1.ahorro']),
          /* GOAL: hereda D4/D5 · F7 = D4-E7 · E8 = E7*C5 · F8 = D5-E8 */
          'goal1.base':  M => num(M['des1.base']),
          'goal1.benef': M => num(M['des1.base']) - num(M['goal1.ahorro']),
          'goal2.metrico': M => benUnit(M),
          'goal2.base':  M => num(M['des2.base']),
          'goal2.ahorro': M => num(M['goal1.ahorro']) * benUnit(M),
          'goal2.benef': M => num(M['des2.base']) - num(M['goal1.ahorro']) * benUnit(M),
          /* RETADORA: F10 = D4-E10 · E11 = C5*E10 · F11 = D5-E11 */
          'ret1.base':   M => num(M['des1.base']),
          'ret1.benef':  M => num(M['des1.base']) - num(M['ret1.ahorro']),
          'ret2.metrico': M => benUnit(M),
          'ret2.base':   M => num(M['des2.base']),
          'ret2.ahorro': M => benUnit(M) * num(M['ret1.ahorro']),
          'ret2.benef':  M => num(M['des2.base']) - benUnit(M) * num(M['ret1.ahorro'])
        } },
      { type:'fields', title:'Observaciones por escenario', cols:1, items:[
        { k:'notaDeseado',  label:'Observaciones — DESEADO', input:'textarea', rows:2, w:1 },
        { k:'notaGoal',     label:'Observaciones — GOAL', input:'textarea', rows:2, w:1 },
        { k:'notaRetadora', label:'Observaciones — RETADORA', input:'textarea', rows:2, w:1 }
      ] },
      { type:'chart', kind:'bar', title:'Ahorro en dinero por escenario', h:300,
        data:(d) => {
          const M = d.ben || {};
          const u = benUnit(M);
          return {
            labels:['DESEADO', 'GOAL', 'RETADORA'],
            values:[u * num(M['des1.ahorro']), num(M['goal1.ahorro']) * u, u * num(M['ret1.ahorro'])],
            fmt:'money', title:'Ahorro potencial ($)'
          };
        } },
      { type:'grid', key:'entregables', title:'ENTREGABLES DEL PROYECTO', min:14, max:40,
        addLabel:'Agregar entregable',
        cols:[
          { k:'hard', label:'HARD SAVINGS', input:'text', w:320,
            ph:'Ahorro duro y verificable en el P&G' },
          { k:'soft', label:'SOFT SAVINGS', input:'text', w:320,
            ph:'Beneficio no monetizable directamente (clima, imagen, riesgo)' }
        ] },
      { type:'cards', items:(d) => {
          const M = d.ben || {};
          const u = benUnit(M);
          if (!u && !num(M['des1.ahorro'])) return [];
          return [
            { label:'COSTO UNITARIO', value: fmt(u, 'money') },
            { label:'AHORRO $ DESEADO', value: fmt(u * num(M['des1.ahorro']), 'money'), tone:'ok' },
            { label:'AHORRO $ GOAL', value: fmt(num(M['goal1.ahorro']) * u, 'money'), tone:'ok' },
            { label:'AHORRO $ RETADORA', value: fmt(u * num(M['ret1.ahorro']), 'money'), tone:'warn' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      fields:{ notaDeseado:'H3', notaGoal:'H7', notaRetadora:'H10' },
      matrix:[{ key:'ben', map:{
        'des1.metrico':'C4', 'des1.base':'D4', 'des1.ahorro':'E4',
        'des2.metrico':'C5', 'des2.base':'D5',
        'goal1.metrico':'C7', 'goal1.ahorro':'E7',
        'ret1.metrico':'C10', 'ret1.ahorro':'E10'
      } }],
      /* B15:C28 (hard) y D15:E28 (soft); la fila 14 son los encabezados */
      grids:[{ key:'entregables', row:15, cols:{ hard:'B', soft:'D' } }]
      /* F4,E5,F5,F7,E8,F8,F10,E11,F11 son fórmulas */
    },
    bi:(d) => {
      const M = d.ben || {};
      const u = benUnit(M);
      return {
        'Costo unitario': u,
        'Ahorro $ escenario DESEADO': u * num(M['des1.ahorro']),
        'Ahorro $ escenario GOAL': num(M['goal1.ahorro']) * u,
        'Ahorro $ escenario RETADORA': u * num(M['ret1.ahorro']),
        'Hard savings listados': RS(d, 'entregables').filter(r => txt(r.hard)).length,
        'Soft savings listados': RS(d, 'entregables').filter(r => txt(r.soft)).length
      };
    }
  };

  /* ======================================================================
     9 · TABLA DE IDENTIFICACIÓN DEL PROYECTO
     ==================================================================== */
  const T09 = {
    id:'definir.tabla_identificacion', mod:'DEFINIR', sheet:'Tabla identificacion proyect',
    title:'TABLA DE IDENTIFICACIÓN DEL PROYECTO',
    desc:'Caso del negocio y los CTQ del proyecto con su línea base, objetivo, ideal y ahorro.',
    guide:[
      'El CASO DEL NEGOCIO responde: por qué este proyecto, por qué ahora y qué pasa si no se hace.',
      'Registra hasta tres CTQ; para cada uno LINEA BASE (hoy), OBJETIVO (meta del proyecto) e IDEAL (entitlement).',
      'AHORRO es el beneficio anualizado esperado de cerrar ese GAP.',
      'La LINEA BASE debe venir de la hoja «Series de tiempo», no de una estimación.',
      'Este caso del negocio se hereda al Business Case del Project Charter.'
    ],
    blocks:[
      { type:'fields', title:'CASO DEL NEGOCIO', cols:1, items:[
        { k:'caso', label:'CASO DEL NEGOCIO', input:'textarea', rows:9, w:1,
          ph:'Impacto del problema en el cliente, en la ARL y en el negocio; costo de no actuar; alineación estratégica.' }
      ] },
      { type:'grid', key:'rows', title:'CTQ del proyecto', min:3, max:3, fixed:true,
        cols:[
          { k:'ctq',    label:'CTQ', input:'textarea', rows:2, w:260 },
          { k:'base',   label:'LINEA BASE', input:'number', step:'any', align:'right', w:120 },
          { k:'obj',    label:'OBJETIVO', input:'number', step:'any', align:'right', w:120 },
          { k:'ideal',  label:'IDEAL', input:'number', step:'any', align:'right', w:120 },
          { k:'ahorro', label:'AHORRO', input:'number', step:'any', align:'right', w:140 }
        ],
        foot:[
          { k:'__label', label:'TOTAL' },
          { k:'ahorro', fmt:'money', calc:(rows) => sum(rows, 'ahorro') }
        ] },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows').filter(r => txt(r.ctq));
          if (!rows.length) return [];
          return [
            { label:'CTQ IDENTIFICADOS', value: fmt(rows.length, 'n0') },
            { label:'AHORRO TOTAL', value: fmt(sum(rows, 'ahorro'), 'money'), tone:'ok' },
            { label:'GAP PRINCIPAL', value: fmt(num(rows[0].base) - num(rows[0].obj), 'n2'),
              hint:'Línea base − objetivo del primer CTQ' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      fields:{ caso:'B4' },
      /* bloques en las filas 4, 7 y 10 (cada CTQ ocupa 3 filas fusionadas) */
      grids:[{ key:'rows', row:4, step:3,
               cols:{ ctq:'E', base:'G', obj:'H', ideal:'I', ahorro:'J' } }]
    },
    bi:(d) => {
      const rows = RS(d, 'rows').filter(r => txt(r.ctq));
      return {
        'CTQ del proyecto': rows.length,
        'Ahorro identificado': sum(rows, 'ahorro'),
        'Caso del negocio escrito': txt(d.caso) ? 1 : 0
      };
    }
  };

  /* ======================================================================
     10 · PROJECT MEMBERS
     ==================================================================== */
  const T10 = {
    id:'definir.project_members', mod:'DEFINIR', sheet:'Project Members',
    title:'PROJECT MEMBERS',
    desc:'Equipo del proyecto: rol, nombre y cargo de cada integrante.',
    guide:[
      'Los cinco primeros roles son fijos (Champion/Sponsor, Dueño del Proceso, Finanzas, Mentor, Facilitador).',
      'Agrega los Team Member que necesites: el rol se asigna solo al final de la lista.',
      'Finanzas valida los ahorros; sin su nombre el Project Charter queda incompleto.',
      'Estos nombres se heredan al Project Charter, a las firmas y al A3 Definir.',
      'Un equipo de 5 a 8 personas con dedicación real es lo recomendable.'
    ],
    blocks:[
      { type:'grid', key:'rows', title:'PROJECT MEMBERS', min:8, max:20, addLabel:'Agregar Team Member',
        cols:[
          { k:'role',   label:'ROLE', ro:true, w:190,
            calc:(r, i) => ROLES_PM[i] !== undefined ? ROLES_PM[i] : 'Team Member' },
          { k:'nombre', label:'NAME', input:'text', w:240 },
          { k:'job',    label:'JOB', input:'text', w:280, ph:'Cargo en la empresa / área' }
        ] },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows').filter(r => txt(r.nombre));
          if (!rows.length) return [];
          const clave = [0, 1, 2, 3, 4].filter(i => txt((RS(d, 'rows')[i] || {}).nombre)).length;
          return [
            { label:'INTEGRANTES', value: fmt(rows.length, 'n0'),
              tone: rows.length >= 5 && rows.length <= 8 ? 'ok' : 'warn' },
            { label:'ROLES CLAVE CUBIERTOS', value: clave + '/5', tone: clave === 5 ? 'ok' : 'warn',
              hint:'Champion, Dueño, Finanzas, Mentor, Facilitador' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      /* la columna B (ROLE) ya viene escrita en la plantilla: no se sobreescribe */
      grids:[{ key:'rows', row:4, cols:{ nombre:'C', job:'D' } }]
    },
    bi:(d) => {
      const rows = RS(d, 'rows');
      return {
        'Integrantes del equipo': rows.filter(r => txt(r.nombre)).length,
        'Roles clave cubiertos': [0, 1, 2, 3, 4].filter(i => txt((rows[i] || {}).nombre)).length,
        'Champion asignado': txt((rows[0] || {}).nombre) ? 1 : 0
      };
    }
  };

  /* ======================================================================
     11 · DIAGRAMA DE GANTT
     ==================================================================== */
  const T11 = {
    id:'definir.gantt', mod:'DEFINIR', sheet:'Gantt',
    title:'DIAGRAMA DE GANTT',
    desc:'Cronograma del proyecto por fases DMAIC con avance por tarea.',
    guide:[
      'La estructura DEFINIR / MEDIR / ANALIZAR / MEJORAR / CONTROLAR viene precargada: reemplaza «Tarea N» por tus tareas.',
      'Marca la casilla FASE sólo en las filas de fase; el avance de la fase es el promedio de sus tareas.',
      'PROGRESO se escribe entre 0 y 1 (o entre 0 y 100): 0,95 = 95 %.',
      'DÍAS = FIN − INICIO + 1, igual que la fórmula del original.',
      '«Semana a mostrar» mueve la ventana de 8 semanas del gráfico, empezando el lunes de esa semana.'
    ],
    blocks:[
      { type:'fields', title:'Encabezado', cols:3, items:(d) => [
        { k:'proyecto',    label:'Proyecto:', input:'text', w:2 },
        { k:'inicio',      label:'Fecha de inicio del proeycto', input:'date', w:1, ph: hoy() },
        { k:'empresa',     label:'Nombre de la empresa:', input:'text', w:2 },
        { k:'semana',      label:'Semana a mostrar:', input:'number', step:1, min:1, w:1 },
        { k:'responsable', label:'Responsable del proyecto:', input:'text', w:2 }
      ] },
      { type:'grid', key:'rows', title:'Cronograma', min:24, max:120, addLabel:'Agregar tarea',
        rowStyle:(r) => (r.fase ? 'cell-warn' : ''),
        cols:(d) => { seedGantt(d); return [
          { k:'fase',      label:'FASE', input:'check', w:60 },
          { k:'tarea',     label:'TAREA', input:'text', w:230 },
          { k:'asignado',  label:'ASIGNADO A', input:'text', w:170 },
          { k:'progreso',  label:'PROGRESO', input:'number', step:0.01, align:'right', w:110 },
          { k:'avance',    label:'AVANCE', ro:true, fmt:'p0', databar:true, w:110,
            calc:(r, i, rows) => ganttAvance(r, i, rows) },
          { k:'inicio',    label:'INICIO', input:'date', w:140 },
          { k:'fin',       label:'FIN', input:'date', w:140 },
          { k:'dias',      label:'DÍAS', ro:true, fmt:'n0', w:80, calc:(r) => ganttDias(r) }
        ]; },
        foot:[
          { k:'__label', label:'AVANCE DEL PROYECTO' },
          { k:'avance', fmt:'p0', calc:(rows) => avanceProyecto(rows) },
          { k:'dias', fmt:'n0', calc:(rows) => sum(rows.filter(r => !r.fase && !esAvance(r) && !esCierre(r))
              .map(r => ({ d: ganttDias(r) })).filter(x => isFinite(x.d)), 'd') }
        ] },
      { type:'chart', kind:'gantt', title:'DIAGRAMA DE GANTT', h:420,
        data:(d) => {
          const rows = RS(d, 'rows');
          const ini = txt(d.inicio) || hoy();
          const sem = Math.max(1, num(d.semana) || 1);
          return {
            tasks: rows.filter(r => txt(r.tarea) && r.inicio && r.fin).map((r) => {
              const i = rows.indexOf(r);
              return { label: txt(r.tarea), start: r.inicio, end: r.fin,
                       progress: ganttAvance(r, i, rows), fase: !!r.fase,
                       asignado: txt(r.asignado), dias: ganttDias(r) };
            }),
            start: ini, semana: sem, weekStart: ganttLunes(ini, sem), days: 56, hoy: hoy()
          };
        } },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows');
          const tareas = rows.filter(r => txt(r.tarea) && !r.fase);
          if (!tareas.length) return [];
          const av = avanceProyecto(rows);
          const conFecha = tareas.filter(r => r.inicio && r.fin);
          let ini = null, fin = null;
          conFecha.forEach(r => { if (!ini || r.inicio < ini) ini = r.inicio; if (!fin || r.fin > fin) fin = r.fin; });
          const dur = dDiff(ini, fin);
          return [
            { label:'AVANCE DEL PROYECTO', value: isFinite(av) ? fmt(av, 'p0') : '—',
              tone: av >= 0.99 ? 'ok' : (av >= 0.5 ? 'warn' : 'bad') },
            { label:'TAREAS', value: fmt(tareas.length, 'n0') },
            { label:'INICIO', value: ini ? fmt(ini, 'date') : '—' },
            { label:'FIN', value: fin ? fmt(fin, 'date') : '—' },
            { label:'DURACIÓN', value: isFinite(dur) ? fmt(dur + 1, 'n0') + ' días' : '—',
              hint: isFinite(dur) ? fmt(Math.ceil((dur + 1) / 7), 'n0') + ' semanas' : '' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      fields:{ proyecto:'C3', empresa:'C4', inicio:'E4', responsable:'C5', semana:'E6' },
      /* las filas de fase llevan =SUM()/COUNT() en D y todas llevan la fórmula de DÍAS en G */
      grids:[{ key:'rows', row:9, cols:{ tarea:'B', asignado:'C', progreso:'D', inicio:'E', fin:'F' },
               skipCalc:['progreso'] }]
    },
    bi:(d) => {
      const rows = RS(d, 'rows');
      const tareas = rows.filter(r => txt(r.tarea) && !r.fase && !esAvance(r));
      const av = avanceProyecto(rows);
      let ini = null, fin = null;
      rows.filter(r => r.inicio && r.fin).forEach(r => {
        if (!ini || r.inicio < ini) ini = r.inicio;
        if (!fin || r.fin > fin) fin = r.fin;
      });
      const dur = dDiff(ini, fin);
      return {
        'Avance del proyecto': isFinite(av) ? av : 0,
        'Tareas del cronograma': tareas.length,
        'Tareas terminadas': tareas.filter(r => p01(r.progreso) >= 1).length,
        'Duración (días)': isFinite(dur) ? dur + 1 : 0,
        'Duración (semanas)': isFinite(dur) ? Math.ceil((dur + 1) / 7) : 0
      };
    }
  };

  /* ======================================================================
     12 · PLAN DE COMUNICACIÓN
     ==================================================================== */
  const T12 = {
    id:'definir.plan_comunicacion', mod:'DEFINIR', sheet:'Plan de comunicacion',
    title:'PLAN DE COMUNICACIÓN',
    desc:'Quién se entera de qué, por qué medio y con qué frecuencia durante el proyecto.',
    guide:[
      'Una fila por tema de comunicación: avances, hallazgos, decisiones, cierre.',
      'El PROPOSITO dice qué se espera del receptor: informar, decidir o aprobar.',
      'Incluye siempre al Champion, a la ARL y a la empresa afiliada como audiencias.',
      'Define frecuencia realista (semanal, quincenal, por fase) y sostenla.',
      'Sin plan de comunicación el proyecto pierde patrocinio: es el riesgo #1 en DMAIC.'
    ],
    blocks:[
      { type:'fields', title:'Encabezado', cols:2, items:(d, ctx) => [
        { k:'proyecto', label:'PROYECTO:', input:'text', w:2,
          ph: first(T(ctx, 'definir.gantt').proyecto, (ctx && ctx.proj ? ctx.proj.nombre : '')) }
      ] },
      { type:'grid', key:'rows', title:'PLAN DE COMUNICACIÓN', min:6, max:40, addLabel:'Agregar comunicación',
        cols:[
          { k:'tema',        label:'TEMA', input:'textarea', rows:2, w:170 },
          { k:'proposito',   label:'PROPOSITO', input:'textarea', rows:2, w:190 },
          { k:'responsable', label:'RESPONSABLE', input:'text', w:150 },
          { k:'audiencia',   label:'AUDIENCIA', input:'text', w:170 },
          { k:'medio',       label:'MEDIO', input:'text', w:140, ph:'Correo, comité, tablero…' },
          { k:'lugar',       label:'LUGAR', input:'text', w:140 },
          { k:'frecuencia',  label:'FRECUENCIA', input:'text', w:140, ph:'Semanal, quincenal, por fase…' }
        ] },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows').filter(r => txt(r.tema));
          if (!rows.length) return [];
          const comp = rows.filter(r => txt(r.responsable) && txt(r.audiencia) && txt(r.frecuencia)).length;
          return [
            { label:'COMUNICACIONES', value: fmt(rows.length, 'n0') },
            { label:'COMPLETAS', value: comp + '/' + rows.length, tone: comp === rows.length ? 'ok' : 'warn',
              hint:'Con responsable, audiencia y frecuencia' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      fields:{ proyecto:'D3' },
      /* cada registro ocupa 3 filas fusionadas: 5, 8, 11, 14, 17, 20 */
      grids:[{ key:'rows', row:5, step:3,
               cols:{ tema:'B', proposito:'C', responsable:'D', audiencia:'E',
                      medio:'F', lugar:'G', frecuencia:'H' } }]
    },
    bi:(d) => {
      const rows = RS(d, 'rows').filter(r => txt(r.tema));
      return {
        'Comunicaciones planeadas': rows.length,
        'Comunicaciones completas': rows.filter(r => txt(r.responsable) && txt(r.audiencia) && txt(r.frecuencia)).length
      };
    }
  };

  /* ======================================================================
     13 · RECURSOS PARA EL PROYECTO
     ==================================================================== */
  const T13 = {
    id:'definir.recursos', mod:'DEFINIR', sheet:'Recursos',
    title:'RECURSOS PARA EL PROYECTO',
    desc:'Qué se necesita para ejecutar el proyecto y cómo se va a conseguir.',
    guide:[
      'Incluye recursos de los tres tipos: personas (horas), datos/sistemas y dinero.',
      'En DESCRIPCIÓN especifica cantidad y momento en que se necesita.',
      'En OBTENCIÓN escribe quién lo autoriza o de qué presupuesto sale.',
      'Un recurso sin responsable de obtención es un riesgo del proyecto.',
      'Lo que aquí quede sin resolver debe subir al Project Charter como restricción.'
    ],
    blocks:[
      { type:'grid', key:'rows', title:'RECURSOS PARA EL PROYECTO', min:7, max:30, addLabel:'Agregar recurso',
        cols:[
          { k:'recurso',     label:'RECURSO', input:'text', w:200 },
          { k:'descripcion', label:'DESCRIPCIÓN', input:'textarea', rows:2, w:340 },
          { k:'obtencion',   label:'OBTENCIÓN', input:'textarea', rows:2, w:260 }
        ] },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows').filter(r => txt(r.recurso));
          if (!rows.length) return [];
          const sin = rows.filter(r => !txt(r.obtencion)).length;
          return [
            { label:'RECURSOS', value: fmt(rows.length, 'n0') },
            { label:'SIN VÍA DE OBTENCIÓN', value: fmt(sin, 'n0'), tone: sin ? 'bad' : 'ok' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      /* cada bloque ocupa 4 filas fusionadas: 4, 8, 12, 16, 20, 24, 28 */
      grids:[{ key:'rows', row:4, step:4,
               cols:{ recurso:'B', descripcion:'C', obtencion:'G' } }]
    },
    bi:(d) => {
      const rows = RS(d, 'rows').filter(r => txt(r.recurso));
      return {
        'Recursos requeridos': rows.length,
        'Recursos sin vía de obtención': rows.filter(r => !txt(r.obtencion)).length
      };
    }
  };

  /* ======================================================================
     14 · PROJECT CHARTER
     ==================================================================== */
  const T14 = {
    id:'definir.project_charter', mod:'DEFINIR', sheet:'Project Charter',
    title:'Project Charter',
    desc:'Acta de constitución del proyecto: problema, caso, objetivo, alcance, equipo, ahorros y cronograma.',
    guide:[
      'Es el contrato del proyecto: se firma antes de pasar a MEDIR.',
      'Los campos vacíos muestran en gris el texto heredado de las hojas anteriores; escribe encima para ajustarlo.',
      'El equipo y los nombres de las firmas se toman de «Project Members» (como el =D10 del original).',
      'En Ahorros: «Cycle time» NO suma en el Total Benefit, igual que la fórmula =SUM(N23:O29,N31:O32).',
      'Scope In / Scope Out evitan el crecimiento del alcance: sé explícito con lo que queda fuera.',
      'Los Metricos Clave de cierre se comparan contra los mismos nombres de la fase DEFINIR.'
    ],
    blocks:[
      { type:'fields', title:'Project Charter', cols:2, items:(d, ctx) => [
        { k:'nombre', label:'Nombre del Proyecto', input:'text', w:2, ph: hNombre({}, ctx) }
      ] },
      { type:'grid', key:'equipo', title:'Equipo del proyecto', min:9, max:9, fixed:true,
        cols:[
          { k:'rol',    label:'ROL', ro:true, w:190,
            calc:(r, i) => ROLES_CH[i] !== undefined ? ROLES_CH[i] : 'Team member' },
          { k:'nombre', label:'NOMBRE', ro:true, w:300,
            calc:(r, i, rows, d, ctx) => first(r.nombre, miembro(ctx, i)) }
        ] },
      { type:'note', tone:'info', text:'El equipo se toma automáticamente de la hoja «Project Members»: edítalo allí.' },
      { type:'fields', title:'Enunciado del Problema · Business Case · Objetivo', cols:1, items:(d, ctx) => [
        { k:'problema', label:'Enunciado del Problema (Problem Statement)', input:'textarea', rows:6, w:1,
          ph: first(T(ctx, 'definir.clarificacion_problema').definicion,
                    'Se hereda de «Clarificación del Problema».') },
        { k:'businessCase', label:'Business Case', input:'textarea', rows:6, w:1,
          ph: first(T(ctx, 'definir.tabla_identificacion').caso,
                    'Se hereda de «Tabla de identificación del proyecto».') },
        { k:'objetivo', label:'Objetivo del Proyecto', input:'textarea', rows:6, w:1,
          ph: first(T(ctx, 'definir.objetivo_smart').smart,
                    smartAuto(T(ctx, 'definir.objetivo_smart')),
                    'Se hereda de «Objetivo SMART».') }
      ] },
      { type:'fields', title:'Alcance del Proyecto (Scope)', cols:2, items:(d, ctx) => [
        { k:'scopeIn',  label:'Scope In', input:'textarea', rows:5, w:1,
          ph:'Procesos, áreas, productos y periodo que SÍ entran.' },
        { k:'scopeOut', label:'Scope Out', input:'textarea', rows:5, w:1,
          ph:'Lo que queda explícitamente fuera del proyecto.' },
        { k:'duracion', label:'Duracion del proyecto (semanas)', input:'number', step:1, w:1,
          ph: isFinite(semanasGantt(ctx)) ? String(semanasGantt(ctx)) : '' }
      ] },
      { type:'fields', title:'Beneficios', cols:1, items:[
        { k:'beneficios', label:'Beneficios', input:'textarea', rows:5, w:1,
          ph:'Beneficios duros y blandos esperados para el cliente, la ARL y la empresa.' }
      ] },
      { type:'grid', key:'ahorros', title:'Ahorros', min:10, max:10, fixed:true,
        cols:[
          { k:'cat',   label:'Category', ro:true, w:170, calc:(r, i) => CAT_AHORROS[i] || '' },
          { k:'hard',  label:'Hard Benefit', input:'number', step:'any', align:'right', w:150 },
          { k:'soft',  label:'Soft Benefit', input:'number', step:'any', align:'right', w:150 },
          { k:'total', label:'Total', ro:true, fmt:'money', w:150,
            calc:(r) => num(r.hard) + num(r.soft) }
        ],
        rowStyle:(r, i) => (CAT_AHORROS[i] === 'Cycle time' ? 'cell-warn' : ''),
        foot:[
          { k:'__label', label:'Total Benefit' },
          { k:'hard',  fmt:'money', calc:(rows) => sumaAhorros(rows, 'hard') },
          { k:'soft',  fmt:'money', calc:(rows) => sumaAhorros(rows, 'soft') },
          { k:'total', fmt:'money', calc:(rows) => sumaAhorros(rows, 'hard') + sumaAhorros(rows, 'soft') }
        ] },
      { type:'note', tone:'warn', text:'«Cycle time» (fila 30 del original) queda FUERA del Total Benefit: ' +
        'la fórmula del Excel es =SUM(N23:O29,N31:O32).' },
      { type:'grid', key:'plan', title:'Plan de seguimiento - Cronograma general', min:5, max:5, fixed:true,
        cols:[
          { k:'fase',   label:'Fase', ro:true, w:170, calc:(r, i) => FASES_DMAIC[i] || '' },
          { k:'inicio', label:'Fecha inicio', input:'date', w:170 },
          { k:'fin',    label:'fecha final', input:'date', w:170 },
          { k:'dias',   label:'Días', ro:true, fmt:'n0', w:100,
            calc:(r) => { const n = dDiff(r.inicio, r.fin); return isFinite(n) ? n + 1 : NaN; } }
        ] },
      { type:'grid', key:'metDef', title:'Metricos Clave - fase DEFINIR', min:7, max:7, fixed:true,
        cols:[
          { k:'n',      label:'#', ro:true, w:44, calc:(r, i) => i + 1 },
          { k:'nombre', label:'Nombre', input:'text', w:260 },
          { k:'existe', label:'Existe', input:'select', opts:['Yes', 'No'], w:100 },
          { k:'base',   label:'Baseline', input:'number', step:'any', align:'right', w:120 },
          { k:'obj',    label:'Objetivo', input:'number', step:'any', align:'right', w:120 },
          { k:'ideal',  label:'Ideal', input:'number', step:'any', align:'right', w:120 }
        ] },
      { type:'grid', key:'metCie', title:'Metricos Clave - Cierre del Proyecto', min:7, max:7, fixed:true,
        cols:[
          { k:'n',       label:'#', ro:true, w:44, calc:(r, i) => i + 1 },
          { k:'nombre',  label:'Nombre', ro:true, w:260,
            calc:(r, i, rows, d) => txt((RS(d, 'metDef')[i] || {}).nombre) },
          { k:'mejoro',  label:'Mejoró', input:'select', opts:['Yes', 'No'], w:100 },
          { k:'base',    label:'Baseline', input:'number', step:'any', align:'right', w:120 },
          { k:'logrado', label:'Logrado', input:'number', step:'any', align:'right', w:120 },
          { k:'ideal',   label:'Ideal', input:'number', step:'any', align:'right', w:120 }
        ] },
      { type:'grid', key:'firmasDef', title:'Firma y Fecha - fase DEFINIR', min:5, max:5, fixed:true,
        cols:[
          { k:'nombre', label:'Nombre', ro:true, w:230,
            calc:(r, i, rows, d, ctx) => first(miembro(ctx, i), ROLES_CH[i]) },
          { k:'firma',  label:'Firma', input:'text', w:230 },
          { k:'fecha',  label:'Fecha', input:'date', w:160 }
        ] },
      { type:'grid', key:'firmasCie', title:'Firma y Fecha - Cierre del Proyecto', min:5, max:5, fixed:true,
        cols:[
          { k:'nombre', label:'Nombre', ro:true, w:230,
            calc:(r, i, rows, d, ctx) => first(miembro(ctx, i), ROLES_CH[i]) },
          { k:'firma',  label:'Firma', input:'text', w:230 },
          { k:'fecha',  label:'Fecha', input:'date', w:160 }
        ] },
      { type:'cards', items:(d, ctx) => {
          const ah = RS(d, 'ahorros');
          const th = sumaAhorros(ah, 'hard'), ts = sumaAhorros(ah, 'soft');
          const partes = [hProblema(d, ctx), hCaso(d, ctx), hObjetivo(d, ctx),
                          txt(d.scopeIn), txt(d.scopeOut)].filter(x => txt(x)).length;
          return [
            { label:'CHARTER COMPLETO', value: partes + '/5', tone: partes === 5 ? 'ok' : 'warn',
              hint:'Problema, caso, objetivo, scope in y out' },
            { label:'HARD BENEFIT', value: fmt(th, 'money'), tone: th ? 'ok' : '' },
            { label:'SOFT BENEFIT', value: fmt(ts, 'money') },
            { label:'TOTAL BENEFIT', value: fmt(th + ts, 'money'), tone:'ok',
              hint:'Sin «Cycle time»' },
            { label:'DURACIÓN', value: txt(d.duracion) ? fmt(d.duracion, 'n0') + ' semanas' : '—' },
            { label:'FIRMAS DEFINIR', value: RS(d, 'firmasDef').filter(r => txt(r.firma)).length + '/5',
              tone: RS(d, 'firmasDef').filter(r => txt(r.firma)).length === 5 ? 'ok' : 'warn' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      fields:{ nombre:'D6', problema:'D21', businessCase:'D29', objetivo:'D37',
               scopeIn:'D46', scopeOut:'D51', duracion:'R53', beneficios:'J7' },
      grids:[
        { key:'equipo',  row:10, cols:{ nombre:'E' } },              /* D10:D18 = roles de plantilla */
        { key:'ahorros', row:23, cols:{ hard:'N', soft:'P', total:'R' } }, /* N33/P33/R33 son fórmulas */
        { key:'plan',    rowsAt:[39, 41, 43, 46, 50], cols:{ fase:'J', inicio:'P', fin:'R' } },
        { key:'metDef',  row:57, cols:{ nombre:'D', existe:'E', base:'F', obj:'G', ideal:'H' } },
        { key:'metCie',  row:67, cols:{ mejoro:'E', base:'F', logrado:'G', ideal:'H' } },
        /* D69:D73 = =D59..=D63 (fórmula) · K56:K60 y K66:K70 = =D10..=D14 (fórmula) */
        { key:'firmasDef', row:56, cols:{ firma:'N', fecha:'P' } },
        { key:'firmasCie', row:66, cols:{ firma:'N', fecha:'P' } }
      ]
    },
    bi:(d, ctx) => {
      const ah = RS(d, 'ahorros');
      const th = sumaAhorros(ah, 'hard'), ts = sumaAhorros(ah, 'soft');
      return {
        'Hard benefit': th,
        'Soft benefit': ts,
        'Total benefit': th + ts,
        'Duración charter (semanas)': num(d.duracion),
        'Firmas fase DEFINIR': RS(d, 'firmasDef').filter(r => txt(r.firma)).length,
        'Charter completo': [hProblema(d, ctx), hCaso(d, ctx), hObjetivo(d, ctx),
                             txt(d.scopeIn), txt(d.scopeOut)].filter(x => txt(x)).length === 5 ? 1 : 0
      };
    }
  };

  /* ======================================================================
     15 · A3 DEFINIR
     ==================================================================== */
  const T15 = {
    id:'definir.a3_definir', mod:'DEFINIR', sheet:'A3 Definir',
    title:'A3 — DEFINE',
    desc:'Resumen de una sola página de la fase DEFINIR, listo para presentar a la dirección.',
    guide:[
      'El A3 se llena al final de DEFINIR: es el resumen, no el lugar donde se piensa.',
      'GRAFICO DEL PROBLEMA y el primer GRAFICO SECUNDARIO se incrustan en vivo desde «Series de tiempo» y «Pareto».',
      'GAP = IDEAL − BASELINE; el valor propuesto aparece en gris dentro del recuadro.',
      'Los TEAM MEMBER muestran en gris el nombre registrado en «Project Members».',
      'Si algo no cabe en la página, sobra: el A3 obliga a priorizar.'
    ],
    blocks:[
      { type:'a3', title:'DEFINE', cols:6, areas:(d, ctx) => {
          const base = num(d.baseline), ideal = num(d.ideal);
          const gap = (txt(d.baseline) === '' || txt(d.ideal) === '') ? '' : fmt(ideal - base, 'n2');
          const st = T(ctx, 'definir.series_tiempo');
          const a = [
            { k:'nombre', label:'PROJECT NAME:', w:6, h:56,
              ph: hNombre({}, ctx) || 'Nombre del proyecto' },
            { k:'problema', label:'PROBLEM STATEMENT AND BUSINESS', w:3, h:210,
              ph: first(T(ctx, 'definir.project_charter').problema,
                        T(ctx, 'definir.clarificacion_problema').definicion) },
            { k:'metricKey', label:'METRIC KEY', w:3, h:56,
              ph: first(txt(st.proceso), 'Métrico principal del proyecto') },
            { k:'baseline', label:'BASELINE', w:1, h:56,
              ph: isFinite(avg(RS(st, 'rows'), 'metrico')) ? fmt(avg(RS(st, 'rows'), 'metrico'), 'n2') : '' },
            { k:'ideal', label:'IDEAL', w:1, h:56 },
            { k:'gap', label:'GAP:', w:1, h:56, ph: gap ? 'GAP calculado: ' + gap : 'IDEAL − BASELINE' },
            { k:'objetivo', label:'OBJECTIVE', w:3, h:130,
              ph: first(T(ctx, 'definir.project_charter').objetivo,
                        T(ctx, 'definir.objetivo_smart').smart,
                        smartAuto(T(ctx, 'definir.objetivo_smart'))) },
            { k:'grafProblema', label:'GRAFICO DEL PROBLEMA', kind:'ref',
              ref:'definir.series_tiempo', w:3, h:230 }
          ];
          ROLES_A3.forEach((rol, i) => {
            a.push({ k:'tm' + (i + 1), label:rol, w:1, h:52, ph: miembro(ctx, i) });
          });
          a.push({ k:'grafSec1', label:'GRAFICO SECUNDARIO(PARETOS/OTRAS SERIES DE TIEMPO)',
                   kind:'ref', ref:'definir.pareto', w:3, h:210 });
          a.push({ k:'savings', label:'POTENTIAL SAVINGS', w:3, h:210,
                   ph:'Ahorro potencial del proyecto (hard y soft).' });
          a.push({ k:'grafSec2', label:'GRAFICO SECUNDARIO(PARETOS/OTRAS SERIES DE TIEMPO)',
                   kind:'image', w:3, h:210 });
          a.push({ k:'dateStart', label:'DATE — STAR', w:1, h:56, ph: T(ctx, 'definir.gantt').inicio || hoy() });
          a.push({ k:'dateFinish', label:'DATE — FINISH', w:1, h:56 });
          a.push({ k:'empresa', label:'Empresa:', w:1, h:56,
                   ph: first(T(ctx, 'definir.gantt').empresa, T(ctx, 'definir.sipoc').empresa,
                             (ctx && ctx.proj ? ctx.proj.empresa : '')) });
          return a;
        } },
      { type:'cards', items:(d) => {
          if (txt(d.baseline) === '' && txt(d.ideal) === '') return [];
          const base = num(d.baseline), ideal = num(d.ideal);
          return [
            { label:'BASELINE', value: fmt(base, 'n2') },
            { label:'IDEAL', value: fmt(ideal, 'n2') },
            { label:'GAP', value: fmt(ideal - base, 'n2'), tone: ideal - base === 0 ? 'ok' : 'warn',
              hint:'IDEAL − BASELINE' }
          ];
        } },
      { type:'insight' }
    ],
    xl:{
      fields:{ nombre:'D4', problema:'B7', objetivo:'B19',
               tm1:'F25', tm2:'F26', tm3:'F27', tm4:'F28', tm5:'F29', tm6:'F30',
               metricKey:'J7', baseline:'J11', ideal:'N11', gap:'J13',
               savings:'J39', dateStart:'J55', dateFinish:'N55', empresa:'J57' },
      images:[{ k:'grafSec2', anchor:'B47', w:7, h:12 }],
      refs:[
        { k:'grafProblema', anchor:'J16', ref:'definir.series_tiempo', w:7, h:21 },
        { k:'grafSec1',     anchor:'B32', ref:'definir.pareto', w:7, h:14 }
      ]
    },
    bi:(d) => ({
      'A3 Definir — baseline': num(d.baseline),
      'A3 Definir — ideal': num(d.ideal),
      'A3 Definir — gap': num(d.ideal) - num(d.baseline),
      'A3 Definir completo': [txt(d.problema), txt(d.objetivo), txt(d.metricKey)].filter(x => x).length === 3 ? 1 : 0
    })
  };

  return [T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12, T13, T14, T15];
})();

registerTools(SPECS_DEFINIR);
