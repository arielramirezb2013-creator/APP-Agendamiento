/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   SPECS MÓDULO 2 — MEDIR   (libro Excel original: 02MEDIR.xlsx · 17 hojas)
   ---------------------------------------------------------------------------
   Fuente de verdad: _dump/9597d3fa-02MEDIR.txt (volcado celda por celda).
   Todas las fórmulas del Excel están replicadas como `calc` con la misma
   semántica. JavaScript de navegador plano: sin módulos, sin librerías.
   ========================================================================== */
'use strict';

const SPECS_MEDIR = (function(){

  /* ======================================================================
     HELPERS PRIVADOS DEL MÓDULO (no contaminan el ámbito global)
     ==================================================================== */
  const XLF = '02MEDIR';

  /** Redondeo hacia ARRIBA para tamaños de muestra (NaN si no calculable) */
  const ceilPos = v => (isFinite(v) && v > 0) ? Math.ceil(v) : NaN;

  /** Acepta proporción (0,05) o porcentaje (5) y devuelve siempre proporción */
  const prop = v => { const x = num(v); return x > 1 ? x / 100 : x; };

  /** Z = NORM.S.INV(α/2)*(-1)   con α = 1-(1-α)   [Excel: C10 / C9] */
  function zConf(conf){
    const c = prop(conf);
    if (!(c > 0 && c < 1)) return NaN;
    return normsinv((1 - c) / 2) * (-1);
  }

  /* --- Tamaño de muestra CUALITATIVO (proporciones) --- */
  /* Excel F6 : =C10^2*C5*(C6)/C11^2 */
  const nCualDesc = (z, p, e) => safeDiv(z * z * p * (1 - p), e * e);
  /* Excel F11: =(C4*(C10^2)*C5*C6)/((C4-1)*(C11^2)+(C10^2)*C5*C6) */
  const nCualCon = (N, z, p, e) =>
    safeDiv(N * z * z * p * (1 - p), (N - 1) * e * e + z * z * p * (1 - p));

  /* --- Tamaño de muestra CUANTITATIVO (media / desviación) --- */
  /* Excel F5 : =(C9^2*C5^2)/C10^2 */
  const nCuanDesc = (z, s, e) => safeDiv(z * z * s * s, e * e);
  /* Excel F10: =(C4*(C9^2)*(C5^2))/((C4-1)*(C10^2)+(C9^2)*C5^2) */
  const nCuanCon = (N, z, s, e) =>
    safeDiv(N * z * z * s * s, (N - 1) * e * e + z * z * s * s);

  /** Tamaño de muestra sugerido a partir de los datos de una hoja de cálculo */
  function nCualDe(t){
    const o = t || {}, z = zConf(o.conf), p = prop(o.p), e = prop(o.err), N = num(o.pobN);
    return N > 0 ? nCualCon(N, z, p, e) : nCualDesc(z, p, e);
  }
  function nCuanDe(t){
    const o = t || {}, z = zConf(o.conf), s = num(o.sigma), e = num(o.err), N = num(o.pobN);
    return N > 0 ? nCuanCon(N, z, s, e) : nCuanDesc(z, s, e);
  }

  /** Tono de tarjeta por umbrales (mayor es mejor) */
  const tone3 = (v, ok, warn) => !isFinite(v) ? '' : (v >= ok ? 'ok' : (v >= warn ? 'warn' : 'bad'));
  /** Tono invertido (menor es mejor) */
  const tone3i = (v, ok, warn) => !isFinite(v) ? '' : (v <= ok ? 'ok' : (v <= warn ? 'warn' : 'bad'));
  /** Nivel sigma formateado */
  const sigTxt = dpmo => isFinite(num(dpmo)) ? fmt(sigmaLevel(dpmo), 'n2') + ' σ' : '—';

  /** Marcas tipo tally (IIII̸ IIII̸ III) a partir de un conteo */
  function tally(n){
    const k = Math.max(0, Math.floor(num(n)));
    if (!k) return '';
    if (k > 150) return k + ' marcas';
    let s = '';
    for (let i = 0; i < Math.floor(k / 5); i++) s += 'IIII̸ ';
    for (let i = 0; i < k % 5; i++) s += 'I';
    return s.trim();
  }

  /** Filas con algún contenido */
  const filled = (rows, k) => arr(rows).filter(r => String((r && r[k]) == null ? '' : r[k]).trim() !== '');

  const MESES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO',
                 'SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE','ENERO'];

  const CAT_DEF = ['RAYONES','DEFORMACION','EXCESO DE MATERIAL','FALTA MATERIAL'];
  const catName = (d, i) => String((d && d['cat' + i]) || CAT_DEF[i - 1]);

  /* ---------------- RTY / FPY: cadena de 6 estaciones ------------------- */
  /* Excel:  D6=D5 · D(k)=D(k-1)-E(k-1)-F(k-1)+F(k-1) · G=D-E · H=G/D
             J6=D6-E6-F6 · J(k)=J(k-1)-E(k)-F(k) · K6=J6/D6 · K(k)=J(k)/J(k-1) */
  function rtyChain(d){
    const rows = arr(d.rows), res = [];
    for (let i = 0; i < 6; i++){
      const r = rows[i] || {};
      const def = num(r.defects), rew = num(r.rework);
      const pv = i === 0 ? null : res[i - 1];
      const inn = i === 0 ? num(d.inicio) : (pv.inn - pv.def - pv.rew + pv.rew);
      const out = inn - def;
      const yld = safeDiv(out, inn);
      const fo  = i === 0 ? (inn - def - rew) : (pv.fo - def - rew);
      const fy  = i === 0 ? safeDiv(fo, inn) : safeDiv(fo, pv.fo);
      res.push({ i:i, name: (r.name || ('ESTACION ' + (i + 1))), inn:inn, def:def, rew:rew,
                 out:out, yld:yld, fo:fo, fy:fy });
    }
    return res;
  }
  /** PRODUCT() sobre las estaciones con datos válidos */
  function chainProduct(res, k){
    let p = 1, n = 0;
    res.forEach(s => { if (s.inn > 0 && isFinite(s[k])){ p *= s[k]; n++; } });
    return n ? p : NaN;
  }

  /* ---------------- % VALOR AGREGADO ------------------------------------ */
  function vaSums(d){
    const rows = arr(d.rows);
    const s = (cat) => arr(rows).reduce((a, r) =>
      a + (String(r.categoria || '').toUpperCase() === cat ? num(r.tiempo) : 0), 0);
    const va = s('VA'), nva = s('NVA'), nvar = s('NVAR');
    return { va:va, nva:nva, nvar:nvar, totalXl: va + nva, total: va + nva + nvar };
  }

  /* ---------------- DPMO ------------------------------------------------- */
  function dpmoCalc(d){
    const rows = arr(d.rows);
    const units = sum(rows, 'units');
    const cats  = 4;                                   // Excel K7 =COUNT(D5:G5) => 4
    const opps  = units * cats;
    const defs  = rows.reduce((a, r) => a + num(r.c1) + num(r.c2) + num(r.c3) + num(r.c4), 0);
    const dpmo  = safeDiv(defs, opps) * 1e6;
    return { units:units, cats:cats, opps:opps, defs:defs, dpmo:dpmo,
             prop: safeDiv(defs, opps) };
  }

  /* ======================================================================
     1 · SWIN LINE  (SWIM LINE / DIAGRAM CROSS-FUNCTIONAL)
     ==================================================================== */
  const T_SWIM = {
    id: 'medir.swin_line',
    mod: 'MEDIR',
    sheet: 'Swin Line',
    title: 'SWIM LINE — Diagrama de flujo funcional cruzado',
    desc: 'DIAGRAM CROSS-FUNCTIONAL: dibuja el flujo del proceso por carriles (CUSTOMER y cada DEPARTAMENTO-AREA-FUNCION) para ver entregas, esperas y devoluciones entre áreas.',
    guide: [
      'Escribe primero NAME PROCESS: el proceso debe tener un inicio y un fin claros.',
      'Renombra los carriles con el área real que ejecuta la actividad (ej.: RECEPCIÓN, TERAPIA FÍSICA, FACTURACIÓN, ARL).',
      'Arrastra los pasos al carril del responsable; usa el símbolo correcto: proceso, decisión, documento, inicio/fin o conector.',
      'Cada vez que una flecha cruza de un carril a otro hay una entrega (hand-off): son los puntos donde más se pierde tiempo.',
      'Cierra con TIME LINE (tiempo del flujo), DISTANCE (recorrido), METRICS (qué se mide) y COMENTS - OBSERVATIONS.'
    ],
    blocks: [
      { type:'fields', title:'ENCABEZADO', cols:1, items:[
        { k:'proceso', label:'NAME PROCESS:', input:'text', ph:'Nombre del proceso mapeado', w:1 }
      ]},
      { type:'fields', title:'CARRILES (nombres editables)', cols:3, items:[
        { k:'customer', label:'CUSTOMER', input:'text', ph:'CUSTOMER' },
        { k:'dep1', label:'DEPARTAMENTO-AREA-FUNCION 1', input:'text', ph:'DEPARTAMENTO-AREA-FUNCION 1' },
        { k:'dep2', label:'DEPARTAMENTO-AREA-FUNCION 2', input:'text', ph:'DEPARTAMENTO-AREA-FUNCION 2' },
        { k:'dep3', label:'DEPARTAMENTO-AREA-FUNCION 3', input:'text', ph:'DEPARTAMENTO-AREA-FUNCION 3' },
        { k:'dep4', label:'DEPARTAMENTO-AREA-FUNCION 4', input:'text', ph:'DEPARTAMENTO-AREA-FUNCION 4' },
        { k:'dep5', label:'DEPARTAMENTO-AREA-FUNCION 5', input:'text', ph:'DEPARTAMENTO-AREA-FUNCION 5' },
        { k:'dep6', label:'DEPARTAMENTO-AREA-FUNCION 6', input:'text', ph:'DEPARTAMENTO-AREA-FUNCION 6' },
        { k:'dep7', label:'DEPARTAMENTO-AREA-FUNCION 7', input:'text', ph:'DEPARTAMENTO-AREA-FUNCION 7' },
        { k:'dep8', label:'DEPARTAMENTO-AREA-FUNCION 8', input:'text', ph:'DEPARTAMENTO-AREA-FUNCION 8' }
      ]},
      { type:'diagram', kind:'swimlane', key:'swim', h:600,
        title:'SWIM LINE · DIAGRAM CROSS-FUNCTIONAL — PROCESS STEPS',
        lanes: ['CUSTOMER','DEPARTAMENTO-AREA-FUNCION 1','DEPARTAMENTO-AREA-FUNCION 2',
                'DEPARTAMENTO-AREA-FUNCION 3','DEPARTAMENTO-AREA-FUNCION 4','DEPARTAMENTO-AREA-FUNCION 5',
                'DEPARTAMENTO-AREA-FUNCION 6','DEPARTAMENTO-AREA-FUNCION 7','DEPARTAMENTO-AREA-FUNCION 8'],
        laneKeys: ['customer','dep1','dep2','dep3','dep4','dep5','dep6','dep7','dep8'],
        lanesFrom: (d) => ['customer','dep1','dep2','dep3','dep4','dep5','dep6','dep7','dep8']
          .map((k, i) => String(d[k] || (i === 0 ? 'CUSTOMER' : 'DEPARTAMENTO-AREA-FUNCION ' + i))),
        symbols: [
          { k:'proceso',   l:'Proceso' },
          { k:'decision',  l:'Decisión' },
          { k:'documento', l:'Documento' },
          { k:'inicio',    l:'Inicio / Fin' },
          { k:'conector',  l:'Conector' }
        ]
      },
      { type:'fields', title:'RESUMEN DEL FLUJO', cols:2, items:[
        { k:'timeline', label:'TIME LINE',  input:'text', ph:'Tiempo total del flujo (ej.: 3 días / 47 min)' },
        { k:'distance', label:'DISTANCE',   input:'text', ph:'Distancia total recorrida (m)' },
        { k:'metrics',  label:'METRICS',    input:'text', ph:'Métricos asociados al flujo', w:2 },
        { k:'coments',  label:'COMENTS - OBSERVATIONS', input:'textarea', rows:3, w:2 }
      ]},
      { type:'note', tone:'info', text:'Cada cruce de carril es una entrega entre áreas. Marca dónde el flujo se devuelve (retrabajo) y dónde espera: esos son los candidatos naturales de mejora en MEJORAR.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ proceso:'C6', customer:'B12', dep1:'B14', dep2:'B18', dep3:'B22', dep4:'B26',
               dep5:'B30', dep6:'B34', dep7:'B38', dep8:'B42',
               timeline:'C47', distance:'C48', metrics:'C49', coments:'C50' },
      diagrams:[{ key:'swim', kind:'swimlane', anchor:'C14' }]
    },
    bi: (d) => {
      const g = d.swim || {};
      const pasos = arr(g.nodes || g.steps || g.items).length;
      return { swimPasos: pasos, swimCarriles: 9,
               swimProceso: String(d.proceso || ''), swimTimeLine: String(d.timeline || '') };
    }
  };

  /* ======================================================================
     2 · PROCESS MAPPING DETAILED
     ==================================================================== */
  const T_PMD = {
    id: 'medir.process_mapping_detailed',
    mod: 'MEDIR',
    sheet: 'Process Mapping Detailed',
    title: 'PROCESS MAPPING DETAILED — Mapa detallado del proceso',
    desc: 'Paso a paso del proceso con sus entradas (KPIV / X) y salidas (KPOV / Y), especificaciones, instrumentos de medición, nivel de calidad, tiempo de ciclo, distancia y costo de no conformancias.',
    guide: [
      'Un renglón por PASO real del proceso, en el orden en que ocurre.',
      "KPIV's (X's) son las variables de ENTRADA que controlas; KPOV's (Y's) son los resultados que el cliente percibe.",
      'TYPE OF INPUT clasifica cada X: Controlable, Ruido, Crítico o Estándar (SOP). Las X críticas y controlables son las que se llevan a ANALIZAR.',
      'GAGES es con qué se mide (formato, cronómetro, software, báscula) y SPECS el límite aceptable.',
      'CYCLE TIME, DISTANCE y COSTO/UNIDAD NO CONFORMANCIAS se totalizan abajo: son la línea base del desperdicio.'
    ],
    blocks: [
      { type:'fields', title:'ENCABEZADO', cols:2, items:[
        { k:'proceso',   label:'PROCESS NAME', input:'text', ph:'Nombre del proceso', w:1 },
        { k:'indicador', label:'INDICATOR-METRICS-VARIABLES', input:'text',
          ph:'Indicador / métrico / variables del proceso', w:1 }
      ]},
      { type:'grid', key:'rows', title:'PROCESS MAPPING DETAILED', min:10, max:38,
        addLabel:'Agregar paso',
        cols:[
          { k:'steps',      label:'STEPS', input:'text', w:180, help:'Paso del proceso' },
          { k:'kpiv',       label:"KPIV's (X's)", input:'text', w:160 },
          { k:'specsIn',    label:'SPECS', input:'text', w:110 },
          { k:'gagesIn',    label:'GAGES', input:'text', w:110 },
          { k:'tipo',       label:'TYPE OF INPUT', input:'select', w:140,
            opts:['Controlable','Ruido','Crítico','Estándar (SOP)'] },
          { k:'procesoTxt', label:'PROCESS', input:'text', w:150 },
          { k:'kpov',       label:"KPOV's (Y's)", input:'text', w:160 },
          { k:'specsOut',   label:'SPECS', input:'text', w:110 },
          { k:'gagesOut',   label:'GAGES', input:'text', w:110 },
          { k:'calidad',    label:'QUALITY LEVEL (DPU,PPM, DPMO, RTY, FTY)', input:'text', w:150 },
          { k:'ciclo',      label:'CYCLE TIME (S)', input:'number', align:'right', w:110 },
          { k:'distancia',  label:'DISTANCE (M)', input:'number', align:'right', w:105 },
          { k:'costo',      label:'COSTO/UNIDAD NO CONFORMANCIAS ($)', input:'number', align:'right', w:135 },
          { k:'obs',        label:'COMENTS - OBSERVATIONS', input:'text', w:180 }
        ],
        /* Excel: B44 =COUNT(B6:B42) · M44/N44/O44 =SUM(...) · P44 "TOTAL" */
        foot:[
          { k:'steps',     calc:(rows) => filled(rows, 'steps').length, fmt:'n0' },
          { k:'ciclo',     calc:(rows) => sum(rows, 'ciclo'), fmt:'n2' },
          { k:'distancia', calc:(rows) => sum(rows, 'distancia'), fmt:'n2' },
          { k:'costo',     calc:(rows) => sum(rows, 'costo'), fmt:'money' }
        ]
      },
      { type:'upload', k:'flujo', label:'PROCESS — diagrama / bosquejo del flujo (opcional)', h:280 },
      { type:'cards', title:'LÍNEA BASE DEL PROCESO', items:(d) => {
        const rows = arr(d.rows);
        const pasos = filled(rows, 'steps').length;
        const criticas = arr(rows).filter(r => r.tipo === 'Crítico' || r.tipo === 'Controlable').length;
        return [
          { label:'PASOS DEL PROCESO', value: fmt(pasos, 'n0'), hint:'COUNT(STEPS)' },
          { label:'CYCLE TIME TOTAL (S)', value: fmt(sum(rows, 'ciclo'), 'n2'), hint:'SUM(CYCLE TIME)' },
          { label:'DISTANCE TOTAL (M)', value: fmt(sum(rows, 'distancia'), 'n2'), hint:'SUM(DISTANCE)' },
          { label:'COSTO NO CONFORMANCIAS', value: fmt(sum(rows, 'costo'), 'money'), hint:'SUM(COSTO/UNIDAD)' },
          { label:"X's CONTROLABLES / CRÍTICAS", value: fmt(criticas, 'n0'),
            tone: criticas ? 'ok' : 'warn', hint:'Entradas a llevar a ANALIZAR' }
        ];
      }},
      { type:'chart', kind:'bar', title:'CYCLE TIME (S) por paso', h:320,
        data:(d) => {
          const rows = filled(arr(d.rows), 'steps');
          return { labels: rows.map(r => String(r.steps)),
                   values: rows.map(r => num(r.ciclo)) };
        }},
      { type:'note', tone:'info', text:'Los pasos con mayor CYCLE TIME o mayor COSTO/UNIDAD NO CONFORMANCIAS son los candidatos para el análisis de causa raíz. Verifica que cada KPOV tenga GAGE y SPEC: si no se puede medir, no se puede controlar.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ proceso:'D3', indicador:'B4' },
      grids:[{ key:'rows', row:6, cols:{ steps:'B', kpiv:'C', specsIn:'D', gagesIn:'E', tipo:'F',
        procesoTxt:'G', kpov:'I', specsOut:'J', gagesOut:'K', calidad:'L', ciclo:'M',
        distancia:'N', costo:'O', obs:'P' } }],
      images:[{ k:'flujo', anchor:'G6', w:2, h:20 }]
    },
    bi: (d) => {
      const rows = arr(d.rows);
      return {
        pmPasos: filled(rows, 'steps').length,
        pmCycleTime: sum(rows, 'ciclo'),
        pmDistancia: sum(rows, 'distancia'),
        pmCostoNoConf: sum(rows, 'costo'),
        pmXCriticas: arr(rows).filter(r => r.tipo === 'Crítico').length
      };
    }
  };

  /* ======================================================================
     3 · METRICOS DE DESEMPEÑO
     ==================================================================== */
  const T_METRICOS = {
    id: 'medir.metricos_desempeno',
    mod: 'MEDIR',
    sheet: 'Metricos de desempeño',
    title: 'MÉTRICOS DE DESEMPEÑO',
    desc: 'Relación entre el proceso y los métricos con los que se evalúa su desempeño (qué se mide, en qué unidad y con qué frecuencia).',
    guide: [
      'A la izquierda describe el PROCESO (alcance, inicio y fin, población atendida).',
      'A la derecha lista los MÉTRICOS: nombre, unidad, fórmula y frecuencia de medición.',
      'Usa métricos de las 4 familias: calidad (defectos), tiempo (ciclo/entrega), costo y satisfacción del afiliado.',
      'Cada métrico debe tener un dueño y una fuente de datos verificable.'
    ],
    blocks: [
      { type:'fields', title:'METRICOS DE DESEMPEÑO', cols:2, items:[
        { k:'proceso',  label:'PROCESO',  input:'textarea', rows:10,
          ph:'Describe el proceso: alcance, inicio, fin, responsables, volumen…' },
        { k:'metricos', label:'METRICOS', input:'textarea', rows:10,
          ph:'1) % de citas atendidas a tiempo — (citas a tiempo / citas programadas) — mensual\n2) …' }
      ]},
      { type:'note', tone:'info', text:'Un métrico sirve si cumple 3 condiciones: se puede medir con los datos que ya existen, el equipo puede influir en él y refleja lo que el cliente (afiliado / empresa / ARL) percibe.' },
      { type:'insight' }
    ],
    xl: { file: XLF, fields:{ proceso:'B4', metricos:'D4' } },
    bi: (d) => ({
      metricosDefinidos: String(d.metricos || '').split('\n').filter(s => s.trim() !== '').length
    })
  };

  /* ======================================================================
     4 · PLAN DE MUESTREO CUALITATIVO
     ==================================================================== */
  const T_PLAN_CUAL = {
    id: 'medir.plan_muestreo_cualitativo',
    mod: 'MEDIR',
    sheet: 'Plan de muestreo cualitativo',
    title: 'PLAN DE MUESTREO — DATOS CUALITATIVOS',
    desc: 'Plan de muestreo para datos por atributos (pasa/no pasa, conforme/no conforme). El TAMAÑO DE LA MUESTRA se trae automáticamente de la hoja «Tamaño de muestra cualitativos».',
    guide: [
      'Los datos cualitativos se CUENTAN (número de historias incompletas, de citas incumplidas, de hallazgos).',
      'Define primero qué se cuenta y cuál es la característica que hace que una unidad sea «no conforme».',
      'Si no conoces P, usa 0,5 (el escenario más exigente: da la muestra más grande).',
      'Diligencia la hoja «Tamaño de muestra cualitativos»: el tamaño calculado aparece aquí automáticamente.',
      'La ESTRATEGIA debe evitar sesgos: aleatoria, sistemática o estratificada por turno, sede o profesional.'
    ],
    blocks: [
      { type:'fields', title:'PLAN DE MUESTREO DATOS CUALITATIVOS', cols:1, items:[
        { k:'cuenta',         label:'¿QUE ES LO QUE SE VA A CONTAR?', input:'textarea', rows:2,
          ph:'Ej.: historias clínicas con registro incompleto' },
        { k:'pobN',           label:'TAMAÑO DE LA POBLACION (N)', input:'number', step:1,
          hint:'Déjalo vacío o en 0 si la población es desconocida / muy grande' },
        { k:'caracteristica', label:'CARACTERISTICA A MEDIR', input:'textarea', rows:2,
          ph:'Ej.: campo obligatorio sin diligenciar' },
        { k:'p',              label:'QUE PROPORCION DE LA POBLACION SE ESTIMA QUE CONTIENE ESTA CARACTERISTICA. (P)',
          input:'number', step:0.01, hint:'Proporción (0,30) o porcentaje (30). Si no se conoce, use 0,5' },
        { k:'err',            label:'MARGEN DE ERROR (E)', input:'number', step:0.01,
          hint:'Proporción (0,05) o porcentaje (5)' },
        { k:'conf',           label:'NIVEL DE CONFIANZA (1-α)', input:'number', step:0.01,
          hint:'0,90 · 0,95 · 0,99 (o 90 / 95 / 99)' },
        { k:'estrategia',     label:'ESTRATEGIA DE MUESTREO', input:'textarea', rows:3,
          ph:'Aleatoria simple / sistemática (1 de cada k) / estratificada por sede, turno o profesional' },
        { k:'muestra',        label:'TAMAÑO DE LA MUESTRA', ro:true, fmt:'n0',
          calc:(d, ctx) => {
            const t = (ctx && ctx.all && ctx.all['medir.tamano_muestra_cualitativos']) || null;
            let n = t ? nCualDe(t) : NaN;
            if (!isFinite(n) || n <= 0) n = nCualDe(d);
            return ceilPos(n);
          },
          hint:'Se calcula en la hoja «Tamaño de muestra cualitativos» (se redondea hacia arriba)' },
        { k:'frecuencia',     label:'FRECUENCIA DE MUESTREO', input:'textarea', rows:2,
          ph:'Ej.: 20 historias por semana, todos los martes, durante 6 semanas' }
      ]},
      { type:'note', tone:'warn', text:(d, ctx) => {
        const t = (ctx && ctx.all && ctx.all['medir.tamano_muestra_cualitativos']) || null;
        const n = ceilPos(t ? nCualDe(t) : NaN);
        return isFinite(n) ? '' :
          'Aún no hay tamaño de muestra calculado. Diligencia N, p, 1-α y E en la hoja «Tamaño de muestra cualitativos» (o en este mismo plan) para que el tamaño se calcule solo.';
      }},
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ cuenta:'B3', pobN:'B4', caracteristica:'B5', p:'B6', err:'B7', conf:'B8',
               estrategia:'B10', muestra:'B12', frecuencia:'B14' }
    },
    bi: (d, ctx) => {
      const t = (ctx && ctx.all && ctx.all['medir.tamano_muestra_cualitativos']) || null;
      let n = t ? nCualDe(t) : NaN;
      if (!isFinite(n) || n <= 0) n = nCualDe(d);
      return { planCualMuestra: ceilPos(n), planCualPoblacion: num(d.pobN) };
    }
  };

  /* ======================================================================
     5 · TAMAÑO DE MUESTRA CUALITATIVOS
     ==================================================================== */
  const T_N_CUAL = {
    id: 'medir.tamano_muestra_cualitativos',
    mod: 'MEDIR',
    sheet: 'Tamaño de muestra cualitativos',
    title: 'MUESTRA DATOS CUALITATIVOS — Tamaño de muestra',
    desc: 'Calcula el tamaño de muestra n para datos por atributos (proporciones), con población desconocida y con población conocida.',
    guide: [
      'N = tamaño de la población. Si no se conoce, usa el resultado de «población desconocida».',
      'p = proporción esperada de unidades con la característica; 1-p se calcula solo.',
      'Z se obtiene de NORM.S.INV(α/2)·(-1); con 95% de confianza Z ≈ 1,96.',
      'E = margen de error admisible. Bajar E de 10% a 5% multiplica por 4 el tamaño de muestra.',
      'El resultado se redondea SIEMPRE hacia arriba y se copia automáticamente al plan de muestreo cualitativo.'
    ],
    blocks: [
      { type:'fields', title:'DATOS', cols:2, items:[
        { k:'pobN',  label:'N', input:'number', step:1, hint:'Tamaño de la población (0 = desconocida)' },
        { k:'p',     label:'p', input:'number', step:0.01, hint:'Proporción estimada (0-1) o % (0-100)' },
        { k:'unoP',  label:'1-p', ro:true, fmt:'n3', calc:(d) => 1 - prop(d.p) },     /* C6 =1-C5 */
        { k:'conf',  label:'1-α', input:'number', step:0.01, hint:'Nivel de confianza: 0,95' },
        { k:'alfa',  label:'α', ro:true, fmt:'n3', calc:(d) => 1 - prop(d.conf) },    /* C8 =1-C7 */
        { k:'alfa2', label:'α/2', ro:true, fmt:'n3', calc:(d) => (1 - prop(d.conf)) / 2 }, /* C9 =C8/2 */
        { k:'z',     label:'Z', ro:true, fmt:'n3', calc:(d) => zConf(d.conf) },       /* C10 */
        { k:'err',   label:'E', input:'number', step:0.01, hint:'Margen de error (0,05 = 5%)' }
      ]},
      { type:'cards', title:'TAMAÑO DE MUESTRA', items:(d) => {
        const z = zConf(d.conf), p = prop(d.p), e = prop(d.err), N = num(d.pobN);
        const nd = nCualDesc(z, p, e), nc = nCualCon(N, z, p, e);
        return [
          { label:'n — Tamaño de la poblacion desconocida', value: isFinite(ceilPos(nd)) ? fmt(ceilPos(nd), 'n0') : '—',
            tone:'ok', hint:'n = Z²·p·(1-p) / E²  →  exacto: ' + (isFinite(nd) ? fmt(nd, 'n2') : '—') },
          { label:'n — Tamaño de la poblacion conocida', value: isFinite(ceilPos(nc)) ? fmt(ceilPos(nc), 'n0') : '—',
            tone:'ok', hint:'n = N·Z²·p·(1-p) / ((N-1)·E² + Z²·p·(1-p))  →  exacto: ' + (isFinite(nc) ? fmt(nc, 'n2') : '—') },
          { label:'Z (confianza)', value: isFinite(zConf(d.conf)) ? fmt(zConf(d.conf), 'n3') : '—',
            hint:'NORM.S.INV(α/2)·(-1)' },
          { label:'MUESTRA SUGERIDA', value: (() => {
              const n = N > 0 ? nc : nd; return isFinite(ceilPos(n)) ? fmt(ceilPos(n), 'n0') + ' unidades' : '—';
            })(),
            tone:'ok', hint: N > 0 ? 'Población conocida (N = ' + fmt(N, 'n0') + ')' : 'Población desconocida' }
        ];
      }},
      { type:'note', tone:'info', text:'Si el resultado con población conocida supera el 10% de N, considera censar (revisar el 100%) o ajustar el margen de error.' },
      { type:'insight' }
    ],
    xl: { file: XLF, fields:{ pobN:'C4', p:'C5', conf:'C7', err:'C11' } },
    bi: (d) => {
      const z = zConf(d.conf), p = prop(d.p), e = prop(d.err), N = num(d.pobN);
      return { nCualDesconocida: ceilPos(nCualDesc(z, p, e)),
               nCualConocida: ceilPos(nCualCon(N, z, p, e)),
               zCual: z };
    }
  };

  /* ======================================================================
     6 · PLAN DE MUESTREO CUANTITATIVO
     ==================================================================== */
  const T_PLAN_CUAN = {
    id: 'medir.plan_muestreo_cuantitativo',
    mod: 'MEDIR',
    sheet: 'Plan de muestreo cuantitativo',
    title: 'PLAN DE MUESTREO — DATOS CUANTITATIVOS',
    desc: 'Plan de muestreo para datos continuos (tiempos, pesos, costos, distancias). El TAMAÑO DE LA MUESTRA se trae automáticamente de la hoja «Tamaño de muestra cuantitativo».',
    guide: [
      'Los datos cuantitativos se MIDEN en una escala continua: minutos de espera, días de trámite, costo por caso.',
      'La desviación estándar estimada (S o σ) sale de una muestra piloto de 20-30 datos o de datos históricos.',
      'E (margen de error) va en las MISMAS unidades del dato (ej.: ±2 minutos), no en porcentaje.',
      'Diligencia la hoja «Tamaño de muestra cuantitativo»: el resultado se trae solo a este plan.',
      'Los datos continuos requieren muestras mucho más pequeñas que los datos por atributos: prefiérelos siempre que se pueda.'
    ],
    blocks: [
      { type:'fields', title:'PLAN DE MUESTREO DATOS CUANTITATIVOS', cols:1, items:[
        { k:'cuenta',         label:'QUE ES LO QUE SE VA A MEDIR', input:'textarea', rows:2,
          ph:'Ej.: minutos de espera entre la llegada y el inicio de la atención' },
        { k:'pobN',           label:'TAMAÑO DE LA POBLACION (N)', input:'number', step:1,
          hint:'Déjalo vacío o en 0 si la población es desconocida / muy grande' },
        { k:'caracteristica', label:'CARACTERISTICA A MEDIR', input:'textarea', rows:2,
          ph:'Ej.: tiempo de espera (min)' },
        { k:'sigma',          label:'DESVIACION ESTANDAR ESTIMADA (S o σ)', input:'number', step:0.01,
          hint:'De un piloto de 20-30 datos o de históricos' },
        { k:'err',            label:'MARGEN DE ERROR (E)', input:'number', step:0.01,
          hint:'En las mismas unidades de la medición' },
        { k:'conf',           label:'NIVEL DE CONFIANZA (1-α)', input:'number', step:0.01,
          hint:'0,90 · 0,95 · 0,99 (o 90 / 95 / 99)' },
        { k:'estrategia',     label:'ESTRATEGIA DE MUESTREO', input:'textarea', rows:3,
          ph:'Aleatoria simple / sistemática / estratificada por sede, turno o tipo de servicio' },
        { k:'muestra',        label:'TAMAÑO DE LA MUESTRA', ro:true, fmt:'n0',
          calc:(d, ctx) => {
            const t = (ctx && ctx.all && ctx.all['medir.tamano_muestra_cuantitativo']) || null;
            let n = t ? nCuanDe(t) : NaN;
            if (!isFinite(n) || n <= 0) n = nCuanDe(d);
            return ceilPos(n);
          },
          hint:'Se calcula en la hoja «Tamaño de muestra cuantitativo» (se redondea hacia arriba)' },
        { k:'frecuencia',     label:'FRECUENCIA DE MUESTREO', input:'textarea', rows:2,
          ph:'Ej.: 10 mediciones diarias en horas pico durante 3 semanas' }
      ]},
      { type:'note', tone:'warn', text:(d, ctx) => {
        const t = (ctx && ctx.all && ctx.all['medir.tamano_muestra_cuantitativo']) || null;
        const n = ceilPos(t ? nCuanDe(t) : NaN);
        return isFinite(n) ? '' :
          'Aún no hay tamaño de muestra calculado. Diligencia N, σ, 1-α y E en la hoja «Tamaño de muestra cuantitativo» (o en este mismo plan).';
      }},
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ cuenta:'B3', pobN:'B4', caracteristica:'B5', sigma:'B6', err:'B7', conf:'B8',
               estrategia:'B10', muestra:'B12', frecuencia:'B14' }
    },
    bi: (d, ctx) => {
      const t = (ctx && ctx.all && ctx.all['medir.tamano_muestra_cuantitativo']) || null;
      let n = t ? nCuanDe(t) : NaN;
      if (!isFinite(n) || n <= 0) n = nCuanDe(d);
      return { planCuanMuestra: ceilPos(n), planCuanPoblacion: num(d.pobN) };
    }
  };

  /* ======================================================================
     7 · TAMAÑO DE MUESTRA CUANTITATIVO
     ==================================================================== */
  const T_N_CUAN = {
    id: 'medir.tamano_muestra_cuantitativo',
    mod: 'MEDIR',
    sheet: 'Tamaño de muestra cuantitativo',
    title: 'MUESTRA DATOS CUANTITATIVOS — Tamaño de muestra',
    desc: 'Calcula el tamaño de muestra n para datos continuos (media), con población desconocida y con población conocida.',
    guide: [
      'σ (o S) es la variabilidad del dato; sale de un piloto de 20-30 mediciones.',
      'E se expresa en las unidades del dato: ±2 minutos, ±$5.000, ±0,5 días.',
      'Z se calcula con NORM.S.INV(α/2)·(-1); 95% de confianza ⇒ Z ≈ 1,96.',
      'Con población conocida N el resultado siempre es menor o igual que el de población desconocida.',
      'Redondea hacia arriba: el resultado se copia solo al plan de muestreo cuantitativo.'
    ],
    blocks: [
      { type:'fields', title:'DATOS', cols:2, items:[
        { k:'pobN',  label:'N', input:'number', step:1, hint:'Tamaño de la población (0 = desconocida)' },
        { k:'sigma', label:'σ', input:'number', step:0.01, hint:'Desviación estándar estimada' },
        { k:'conf',  label:'1-α', input:'number', step:0.01, hint:'Nivel de confianza: 0,95' },
        { k:'alfa',  label:'α', ro:true, fmt:'n3', calc:(d) => 1 - prop(d.conf) },       /* C7 =1-C6 */
        { k:'alfa2', label:'α/2', ro:true, fmt:'n3', calc:(d) => (1 - prop(d.conf)) / 2 }, /* C8 =C7/2 */
        { k:'z',     label:'Z', ro:true, fmt:'n3', calc:(d) => zConf(d.conf) },           /* C9 */
        { k:'err',   label:'E', input:'number', step:0.01, hint:'Margen de error, en unidades del dato' }
      ]},
      { type:'cards', title:'TAMAÑO DE MUESTRA', items:(d) => {
        const z = zConf(d.conf), s = num(d.sigma), e = num(d.err), N = num(d.pobN);
        const nd = nCuanDesc(z, s, e), nc = nCuanCon(N, z, s, e);
        return [
          { label:'n — Tamaño de lapoblacion desconocida', value: isFinite(ceilPos(nd)) ? fmt(ceilPos(nd), 'n0') : '—',
            tone:'ok', hint:'n = Z²·σ² / E²  →  exacto: ' + (isFinite(nd) ? fmt(nd, 'n2') : '—') },
          { label:'n — Tamaño de la poblacion conocida', value: isFinite(ceilPos(nc)) ? fmt(ceilPos(nc), 'n0') : '—',
            tone:'ok', hint:'n = N·Z²·σ² / ((N-1)·E² + Z²·σ²)  →  exacto: ' + (isFinite(nc) ? fmt(nc, 'n2') : '—') },
          { label:'Z (confianza)', value: isFinite(z) ? fmt(z, 'n3') : '—', hint:'NORM.S.INV(α/2)·(-1)' },
          { label:'MUESTRA SUGERIDA', value: (() => {
              const n = N > 0 ? nc : nd; return isFinite(ceilPos(n)) ? fmt(ceilPos(n), 'n0') + ' datos' : '—';
            })(),
            tone:'ok', hint: N > 0 ? 'Población conocida (N = ' + fmt(N, 'n0') + ')' : 'Población desconocida' }
        ];
      }},
      { type:'note', tone:'info', text:'Si el tamaño resulta impracticable, revisa E antes que la confianza: el error admisible es el que más pesa en la fórmula (va al cuadrado).' },
      { type:'insight' }
    ],
    xl: { file: XLF, fields:{ pobN:'C4', sigma:'C5', conf:'C6', err:'C10' } },
    bi: (d) => {
      const z = zConf(d.conf), s = num(d.sigma), e = num(d.err), N = num(d.pobN);
      return { nCuanDesconocida: ceilPos(nCuanDesc(z, s, e)),
               nCuanConocida: ceilPos(nCuanCon(N, z, s, e)),
               zCuan: z };
    }
  };

  /* ======================================================================
     8 · HOJAS DE VERIFICACION  (dos check sheets)
     ==================================================================== */
  const T_CHECK = {
    id: 'medir.hojas_verificacion',
    mod: 'MEDIR',
    sheet: 'Hojas de verificacion',
    title: 'HOJAS DE VERIFICACIÓN (CHECK SHEETS)',
    desc: 'Dos formatos de recolección en el puesto de trabajo: uno por criterio/defecto con conteo, frecuencia y acumulado; otro por símbolos con total.',
    guide: [
      'Imprime o diligencia en línea: la hoja se llena donde ocurre el hecho, no después.',
      'Los CRITERIOS deben ser mutuamente excluyentes y entendibles por quien registra.',
      'CONTEO se lleva con marcas (cada 5 marcas = un grupo); FRECUENCIA es el total del criterio y ACUMULADO la suma corrida.',
      'Registra siempre PROCESO, FECHA, TURNO y RESPONSABLE: sin estratificación los datos no sirven para ANALIZAR.',
      'Con la frecuencia por criterio se arma directamente el Pareto del módulo ANALIZAR.'
    ],
    blocks: [
      /* ---------------- HOJA 1 (izquierda, B:F) ---------------- */
      { type:'fields', title:'HOJA DE VERIFICACION — 1 (POR CRITERIO / DEFECTO)', cols:3, items:[
        { k:'proceso',       label:'PROCESO', input:'text' },
        { k:'fecha',         label:'FECHA', input:'date' },
        { k:'turno',         label:'TURNO', input:'select', opts:['1','2','3','MAÑANA','TARDE','NOCHE'] },
        { k:'responsable',   label:'RESPONSABLE', input:'text' },
        { k:'metrico',       label:'METRICO', input:'text', w:2 },
        { k:'equipo',        label:'EQUIPO DE MEDICION', input:'text', w:3 },
        { k:'instrucciones', label:'INSTRUCCIONES:', input:'textarea', rows:2, w:3,
          ph:'Cómo, cuándo y quién registra cada marca' }
      ]},
      { type:'grid', key:'rows', title:'REGISTRO POR CRITERIO', min:13, max:60, addLabel:'Agregar criterio',
        cols:[
          { k:'criterio', label:'CRITERIO', input:'text', w:220 },
          { k:'conteo',   label:'CONTEO', input:'number', step:1, align:'right', w:100,
            help:'Cantidad de marcas registradas' },
          { k:'marcas',   label:'MARCAS', ro:true, w:150, calc:(r) => tally(r.conteo) },
          { k:'frec',     label:'FRECUENCIA', ro:true, fmt:'n0', align:'right', w:110,
            calc:(r) => num(r.conteo) },
          { k:'acum',     label:'ACUMULADO', ro:true, fmt:'n0', align:'right', w:110,
            calc:(r, i, rows) => arr(rows).slice(0, i + 1).reduce((a, x) => a + num(x.conteo), 0) },
          { k:'obs',      label:'OBSERVACIONES', input:'text', w:220 }
        ],
        foot:[
          { k:'conteo', calc:(rows) => sum(rows, 'conteo'), fmt:'n0' },
          { k:'frec',   calc:(rows) => sum(rows, 'conteo'), fmt:'n0' },
          { k:'acum',   calc:(rows) => sum(rows, 'conteo'), fmt:'n0' }
        ]
      },
      { type:'chart', kind:'pareto', title:'Frecuencia por criterio', h:330,
        data:(d) => {
          const rows = filled(arr(d.rows), 'criterio')
            .map(r => ({ l:String(r.criterio), v:num(r.conteo) }))
            .filter(x => x.v > 0).sort((a, b) => b.v - a.v);
          return { labels: rows.map(x => x.l), values: rows.map(x => x.v) };
        }},
      /* ---------------- HOJA 2 (derecha, H:L) ---------------- */
      { type:'fields', title:'HOJA DE VERIFICACION — 2 (POR SIMBOLOS)', cols:3, items:[
        { k:'proceso2',       label:'PROCESO', input:'text' },
        { k:'fecha2',         label:'FECHA', input:'date' },
        { k:'turno2',         label:'TURNO', input:'select', opts:['1','2','3','MAÑANA','TARDE','NOCHE'] },
        { k:'responsable2',   label:'RESPONSABLE', input:'text' },
        { k:'metrico2',       label:'METRICO', input:'text', w:2 },
        { k:'equipo2',        label:'EQUIPO DE MEDICION', input:'text' },
        { k:'producto2',      label:'PRODUCTO', input:'text', w:2 },
        { k:'instrucciones2', label:'INSTRUCCIONES:', input:'textarea', rows:2, w:3,
          ph:'Dibuja o describe el símbolo que se marca en cada caso' },
        { k:'registro2',      label:'ÁREA DE REGISTRO (croquis / marcas)', input:'textarea', rows:8, w:3,
          ph:'Espacio libre para el croquis de la pieza, el plano de la sede o el registro de marcas' }
      ]},
      { type:'grid', key:'simbolos', title:'SIMBOLOS', min:4, max:20, addLabel:'Agregar símbolo',
        cols:[
          { k:'simbolo', label:'SIMBOLOS', input:'text', w:260, ph:'Símbolo y qué representa' },
          { k:'total',   label:'TOTAL', input:'number', step:1, align:'right', w:120 }
        ],
        foot:[ { k:'total', calc:(rows) => sum(rows, 'total'), fmt:'n0' } ]
      },
      { type:'cards', title:'RESUMEN DE LA VERIFICACIÓN', items:(d) => {
        const rows = arr(d.rows), tot = sum(rows, 'conteo');
        const top = filled(rows, 'criterio').map(r => ({ l:String(r.criterio), v:num(r.conteo) }))
          .sort((a, b) => b.v - a.v)[0];
        return [
          { label:'TOTAL REGISTROS (HOJA 1)', value: fmt(tot, 'n0') },
          { label:'CRITERIOS CON REGISTRO', value: fmt(arr(rows).filter(r => num(r.conteo) > 0).length, 'n0') },
          { label:'CRITERIO MÁS FRECUENTE', value: top && top.v > 0 ? top.l : '—',
            tone: top && top.v > 0 ? 'warn' : '',
            hint: top && top.v > 0 ? fmt(top.v, 'n0') + ' de ' + fmt(tot, 'n0') + ' (' + fmt(safeDiv(top.v, tot), 'p1') + ')' : '' },
          { label:'TOTAL SIMBOLOS (HOJA 2)', value: fmt(sum(arr(d.simbolos), 'total'), 'n0') }
        ];
      }},
      { type:'note', tone:'info', text:'Escribe el CONTEO como número: la columna MARCAS lo convierte en marcas tipo tally (grupos de 5) y FRECUENCIA / ACUMULADO se calculan solos.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ proceso:'C3', fecha:'E3', turno:'G3', responsable:'C4', metrico:'E4',
               equipo:'D5', instrucciones:'B6',
               proceso2:'I3', fecha2:'K3', turno2:'M3', responsable2:'I4', metrico2:'K4',
               equipo2:'I5', producto2:'K5', instrucciones2:'H6', registro2:'H7' },
      grids:[
        { key:'rows', row:8, cols:{ criterio:'B', conteo:'C', frec:'D', acum:'E', obs:'F' } },
        { key:'simbolos', row:9, step:2, cols:{ simbolo:'K', total:'L' } }
      ]
    },
    bi: (d) => ({
      checkTotal: sum(arr(d.rows), 'conteo'),
      checkCriterios: filled(arr(d.rows), 'criterio').length,
      checkSimbolos: sum(arr(d.simbolos), 'total')
    })
  };

  /* ======================================================================
     9 · PLAN DE RECOLECCION
     ==================================================================== */
  const T_RECOL = {
    id: 'medir.plan_recoleccion',
    mod: 'MEDIR',
    sheet: 'Plan de recoleccion',
    title: 'PLAN RECOLECCIÓN DE DATOS',
    desc: 'Define para cada medición: cómo se estratifica, su definición operacional, el tamaño de muestra, la fuente, el método y el responsable de recolectar.',
    guide: [
      'Una fila por MEDICIÓN. Si no puedes escribir su definición operacional, todavía no está lista para medirse.',
      'La DEFINICIÓN OPERACIONAL debe permitir que dos personas distintas midan lo mismo y obtengan el mismo dato.',
      'Los FACTORES DE ESTRATIFICACIÓN (sede, turno, profesional, tipo de servicio, día) son los que después explican las diferencias.',
      'El TAMAÑO DE LA MUESTRA sale de las hojas de tamaño de muestra cualitativo o cuantitativo.',
      'Antes de recolectar, acuerda con el equipo QUIÉN recopila y cómo se van a UTILIZAR y PRESENTAR los datos.'
    ],
    blocks: [
      { type:'grid', key:'rows', title:'PLAN RECOLECCION DE DATOS', min:10, max:40,
        addLabel:'Agregar medición',
        cols:[
          { k:'medicion',   label:'MEDICION', input:'text', w:180 },
          { k:'factores',   label:'FACTORES DE ESTRATIFICACION', input:'text', w:190 },
          { k:'definicion', label:'DEFINICION OPERACIONAL', input:'text', w:230 },
          { k:'tamano',     label:'TAMAÑO DE LA MUESTRA', input:'text', w:140 },
          { k:'fuente',     label:'FUENTE DE INFORMACION', input:'text', w:170 },
          { k:'metodo',     label:'METODO DE RECOPILACION', input:'text', w:180 },
          { k:'quien',      label:'QUIEN RECOPILA DATOS', input:'text', w:160 }
        ]
      },
      { type:'fields', title:'USO Y PRESENTACIÓN', cols:2, items:[
        { k:'utilizacion',  label:'UTILIZACION DE DATOS', input:'textarea', rows:7,
          ph:'¿Para qué se van a usar? ¿Qué decisión se toma con ellos?' },
        { k:'presentacion', label:'PRESENTACION DE DATOS', input:'textarea', rows:7,
          ph:'Pareto, histograma, serie de tiempo, gráfico de control, tabla resumen…' }
      ]},
      { type:'note', tone:'info', text:(d, ctx) => {
        const c1 = (ctx && ctx.all && ctx.all['medir.tamano_muestra_cualitativos']) || null;
        const c2 = (ctx && ctx.all && ctx.all['medir.tamano_muestra_cuantitativo']) || null;
        const n1 = ceilPos(c1 ? nCualDe(c1) : NaN), n2 = ceilPos(c2 ? nCuanDe(c2) : NaN);
        const p = [];
        if (isFinite(n1)) p.push('cualitativo n = ' + fmt(n1, 'n0'));
        if (isFinite(n2)) p.push('cuantitativo n = ' + fmt(n2, 'n0'));
        return p.length ? 'Tamaños de muestra ya calculados en este proyecto: ' + p.join(' · ') + '.'
                        : 'Calcula el tamaño de muestra en las hojas «Tamaño de muestra cualitativos» o «Tamaño de muestra cuantitativo» y trasládalo a la columna TAMAÑO DE LA MUESTRA.';
      }},
      { type:'insight' }
    ],
    xl: { file: XLF,
      grids:[{ key:'rows', row:4, cols:{ medicion:'B', factores:'C', definicion:'D', tamano:'E',
        fuente:'F', metodo:'G', quien:'H' } }],
      fields:{ utilizacion:'B15', presentacion:'F15' }
    },
    bi: (d) => ({
      recolMediciones: filled(arr(d.rows), 'medicion').length,
      recolConDefinicion: filled(arr(d.rows), 'definicion').length
    })
  };

  /* ======================================================================
     10 · YIELD
     ==================================================================== */
  const T_YIELD = {
    id: 'medir.yield',
    mod: 'MEDIR',
    sheet: 'YIELD',
    title: 'YIELD — Rendimiento del proceso',
    desc: 'Rendimiento simple: proporción de unidades buenas sobre el total procesado, y su complemento (proporción de defectos).',
    guide: [
      'PIEZAS TOTALES = todo lo procesado en el periodo; PIEZAS MALAS = lo que no cumplió.',
      'PIEZAS BUENAS se calcula solo (totales − malas): no lo escribas.',
      'YIELD = buenas / totales; DEFECTOS = malas / totales. Ambos deben sumar 100%.',
      'Este yield NO considera retrabajos ocultos: para eso usa RTY-FPY.',
      'El nivel sigma mostrado asume una sola oportunidad de defecto por unidad.'
    ],
    blocks: [
      { type:'fields', title:'YIELD', cols:3, items:[
        { k:'totales', label:'PIEZAS TOTALES', input:'number', step:1 },
        { k:'malas',   label:'PIEZAS MALAS', input:'number', step:1 },
        { k:'buenas',  label:'PIEZAS BUENAS', ro:true, fmt:'n0',
          calc:(d) => num(d.totales) - num(d.malas) },              /* D4 =D6-D5 */
        { k:'defectos', label:'DEFECTOS', ro:true, fmt:'p2',
          calc:(d) => safeDiv(d.malas, d.totales) },                /* G4 =D5/D6 */
        { k:'yield',    label:'YIELD', ro:true, fmt:'p2',
          calc:(d) => safeDiv(num(d.totales) - num(d.malas), num(d.totales)) } /* G5 =D4/D6 */
      ]},
      { type:'cards', items:(d) => {
        const tot = num(d.totales), mal = num(d.malas), bue = tot - mal;
        const y = safeDiv(bue, tot), dfe = safeDiv(mal, tot);
        const ppm = dfe * 1e6;
        return [
          { label:'YIELD', value: isFinite(y) ? fmt(y, 'p2') : '—', tone: tone3(y, 0.95, 0.85),
            hint:'PIEZAS BUENAS / PIEZAS TOTALES' },
          { label:'DEFECTOS', value: isFinite(dfe) ? fmt(dfe, 'p2') : '—', tone: tone3i(dfe, 0.05, 0.15),
            hint:'PIEZAS MALAS / PIEZAS TOTALES' },
          { label:'PIEZAS BUENAS', value: fmt(bue, 'n0'), hint:'PIEZAS TOTALES − PIEZAS MALAS' },
          { label:'PPM DEFECTUOSAS', value: isFinite(ppm) ? fmt(ppm, 'n0') : '—',
            hint:'% defectos × 1.000.000' },
          { label:'NIVEL SIGMA (aprox.)', value: isFinite(ppm) ? sigTxt(ppm) : '—',
            tone: tone3(isFinite(ppm) ? sigmaLevel(ppm) : NaN, 4, 3),
            hint:'Con 1 oportunidad de defecto por unidad' }
        ];
      }},
      { type:'chart', kind:'pie', title:'Composición de la producción', h:280,
        data:(d) => {
          const tot = num(d.totales), mal = num(d.malas);
          if (tot <= 0) return { labels:[], values:[] };
          return { labels:['PIEZAS BUENAS','PIEZAS MALAS'], values:[Math.max(0, tot - mal), mal] };
        }},
      { type:'note', tone:'info', text:'Un yield alto en la última inspección puede esconder retrabajo. Compáralo siempre con el FPY de la hoja RTY-FPY: si el FPY es mucho menor, el proceso está viviendo de las correcciones.' },
      { type:'insight' }
    ],
    xl: { file: XLF, fields:{ malas:'D5', totales:'D6' } },
    bi: (d) => {
      const tot = num(d.totales), mal = num(d.malas);
      const y = safeDiv(tot - mal, tot), dfe = safeDiv(mal, tot);
      return { yield: y, yieldDefectos: dfe, yieldPPM: dfe * 1e6,
               yieldSigma: isFinite(dfe) ? sigmaLevel(dfe * 1e6) : NaN,
               piezasTotales: tot, piezasMalas: mal };
    }
  };

  /* ======================================================================
     11 · RTY-FPY
     ==================================================================== */
  const T_RTY = {
    id: 'medir.rty_fpy',
    mod: 'MEDIR',
    sheet: 'RTY-FPY',
    title: 'RTY — FPY (Rolled Throughput Yield / First Pass Yield)',
    desc: 'Rendimiento encadenado de 6 estaciones: RTY (probabilidad de pasar todo el proceso sin defectos) y FPY (probabilidad de pasar bien a la primera, sin retrabajos).',
    guide: [
      'INICIO = unidades que entran a la primera estación; las entradas siguientes se calculan solas.',
      'Registra en cada estación los DEFECTS (unidades desechadas) y los REWORK (unidades corregidas).',
      'Yield = Out / In por estación; RTY = producto de todos los yields.',
      'FPY descuenta además el retrabajo: mide lo que sale bien a la primera, sin tocar.',
      'La brecha entre RTY y FPY es exactamente la «fábrica oculta»: el trabajo que se hace dos veces.',
      'Las estaciones sin datos (In = 0) no entran al producto: llena la cadena completa para un RTY real.'
    ],
    blocks: [
      { type:'fields', title:'INICIO', cols:3, items:[
        { k:'inicio', label:'INICIO — Unidades que entran (In)', input:'number', step:1, w:1 },
        { k:'proceso', label:'PROCESO', input:'text', ph:'Nombre del proceso / línea', w:2 }
      ]},
      { type:'grid', key:'rows', title:'ROLLED THROUGHPUTH YIELD · FIRST PASS YIELD', min:6, fixed:true,
        cols:[
          { k:'step',    label:'Step', ro:true, w:60, calc:(r, i) => i + 1 },
          { k:'name',    label:'Name', input:'text', w:170, ph:'ESTACION' },
          { k:'inn',     label:'In', ro:true, fmt:'n0', align:'right', w:100,
            calc:(r, i, rows, d) => rtyChain(d)[i].inn },
          { k:'defects', label:'Defects', input:'number', step:1, align:'right', w:100 },
          { k:'rework',  label:'Rework', input:'number', step:1, align:'right', w:100 },
          { k:'out',     label:'Out', ro:true, fmt:'n0', align:'right', w:100,
            calc:(r, i, rows, d) => rtyChain(d)[i].out },
          { k:'yld',     label:'Yield', ro:true, fmt:'p2', align:'right', w:100,
            calc:(r, i, rows, d) => rtyChain(d)[i].yld },
          { k:'fo',      label:'FPY Out', ro:true, fmt:'n0', align:'right', w:100,
            calc:(r, i, rows, d) => rtyChain(d)[i].fo },
          { k:'fy',      label:'FPY Yield', ro:true, fmt:'p2', align:'right', w:100,
            calc:(r, i, rows, d) => rtyChain(d)[i].fy }
        ],
        foot:[
          { k:'defects', calc:(rows) => sum(rows, 'defects'), fmt:'n0' },   /* D19 =SUM(E6:E11) */
          { k:'rework',  calc:(rows) => sum(rows, 'rework'), fmt:'n0' },    /* D20 =SUM(F6:F11) */
          { k:'out',     calc:(rows, d) => rtyChain(d)[5].out, fmt:'n0' },  /* D18 =G11 */
          { k:'yld',     calc:(rows, d) => chainProduct(rtyChain(d), 'yld'), fmt:'p2' }, /* H12 RTY */
          { k:'fo',      calc:(rows, d) => rtyChain(d)[5].fo, fmt:'n0' },   /* H18 =J11 */
          { k:'fy',      calc:(rows, d) => chainProduct(rtyChain(d), 'fy'), fmt:'p2' }   /* K12 FPY */
        ]
      },
      { type:'cards', title:'RESULTADOS', items:(d) => {
        const res = rtyChain(d);
        const rty = chainProduct(res, 'yld'), fpy = chainProduct(res, 'fy');
        const defs = sum(arr(d.rows), 'defects'), rew = sum(arr(d.rows), 'rework');
        return [
          { label:'RTY', value: isFinite(rty) ? fmt(rty, 'p2') : '—', tone: tone3(rty, 0.9, 0.75),
            hint:'PRODUCT(Yield de cada estación)' },
          { label:'FPY', value: isFinite(fpy) ? fmt(fpy, 'p2') : '—', tone: tone3(fpy, 0.9, 0.75),
            hint:'PRODUCT(FPY Yield de cada estación)' },
          { label:'PIEZAS BIEN', value: fmt(res[5].out, 'n0'), hint:'Out de la última estación' },
          { label:'PIEZAS BIEN A LA PRIMERA', value: fmt(res[5].fo, 'n0'),
            tone: res[5].fo < res[5].out ? 'warn' : '', hint:'FPY Out de la última estación' },
          { label:'DEFECTOS TOTAL', value: fmt(defs, 'n0'), tone: defs > 0 ? 'bad' : 'ok' },
          { label:'RETRABAJOS TOTAL', value: fmt(rew, 'n0'), tone: rew > 0 ? 'warn' : 'ok',
            hint:'Fábrica oculta' },
          { label:'NIVEL SIGMA (por RTY)', value: isFinite(rty) ? sigTxt((1 - rty) * 1e6) : '—',
            tone: tone3(isFinite(rty) ? sigmaLevel((1 - rty) * 1e6) : NaN, 4, 3) }
        ];
      }},
      { type:'chart', kind:'line', title:'Yield por estación (%)', h:320,
        data:(d) => {
          const res = rtyChain(d).filter(s => s.inn > 0);
          return { labels: res.map(s => s.name),
                   values: res.map(s => isFinite(s.yld) ? round(s.yld * 100, 2) : 0) };
        }},
      { type:'note', tone:'warn', text:(d) => {
        const res = rtyChain(d);
        const rty = chainProduct(res, 'yld'), fpy = chainProduct(res, 'fy');
        if (!isFinite(rty) || !isFinite(fpy)) return '';
        const g = rty - fpy;
        return g > 0.02
          ? 'La diferencia entre RTY (' + fmt(rty, 'p1') + ') y FPY (' + fmt(fpy, 'p1') + ') es de ' +
            fmt(g, 'p1') + ': ese porcentaje del volumen se está corrigiendo (fábrica oculta) y hoy no se ve en los indicadores.'
          : '';
      }},
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ inicio:'D5' },
      grids:[{ key:'rows', row:6, cols:{ name:'C', defects:'E', rework:'F' } }]
    },
    bi: (d) => {
      const res = rtyChain(d);
      return {
        rty: chainProduct(res, 'yld'),
        fpy: chainProduct(res, 'fy'),
        piezasBien: res[5].out,
        piezasBienPrimera: res[5].fo,
        defectosTotal: sum(arr(d.rows), 'defects'),
        retrabajosTotal: sum(arr(d.rows), 'rework')
      };
    }
  };

  /* ======================================================================
     12 · GRAFICO SERIE DE TIEMPO
     ==================================================================== */
  const T_SERIE = {
    id: 'medir.grafico_serie_tiempo',
    mod: 'MEDIR',
    sheet: 'Grafico Serie de tiempo',
    title: 'GRÁFICO SERIE DE TIEMPO',
    desc: 'Comportamiento del criterio medido mes a mes (13 periodos, ENERO a ENERO) para ver tendencia, estacionalidad y puntos atípicos antes de intervenir.',
    guide: [
      'Escribe en Criterio el nombre exacto del métrico y su unidad (ej.: % de citas incumplidas).',
      'Registra un valor por mes; deja vacíos los meses aún sin dato (no escribas ceros falsos).',
      'Mira primero el patrón: ¿tendencia, ciclos, saltos? Un salto suele coincidir con un cambio en el proceso.',
      'La línea base para el proyecto es el promedio de los meses previos a la mejora.',
      'Guarda esta serie: en CONTROLAR se compara contra el mismo gráfico después de implementar.'
    ],
    blocks: [
      { type:'fields', title:'GRAFICO SERIE DE TIEMPO', cols:2, items:[
        { k:'criterio', label:'Criterio:', input:'text', ph:'Métrico y unidad', w:2 }
      ]},
      { type:'matrix', key:'serie', title:'Periodo',
        rows: MESES.map((m, i) => ({ k:'m' + (i + 1), l:m })),
        cols:(d) => [{ k:'valor', label: String(d.criterio || 'VALOR'), input:'number', align:'right' }]
      },
      { type:'chart', kind:'line', title:'Serie de tiempo', h:340,
        data:(d) => {
          const S = d.serie || {}, L = [], V = [];
          MESES.forEach((m, i) => {
            const v = S['m' + (i + 1) + '.valor'];
            if (v !== '' && v !== null && v !== undefined){ L.push(m); V.push(num(v)); }
          });
          return { labels:L, values:V, name:String(d.criterio || 'Valor') };
        }},
      { type:'cards', title:'RESUMEN DE LA SERIE', items:(d) => {
        const S = d.serie || {}, V = [];
        MESES.forEach((m, i) => {
          const v = S['m' + (i + 1) + '.valor'];
          if (v !== '' && v !== null && v !== undefined) V.push(num(v));
        });
        if (!V.length) return [];
        const lr = linreg(V.map((x, i) => i), V);
        return [
          { label:'PERIODOS CON DATO', value: fmt(V.length, 'n0') },
          { label:'PROMEDIO', value: fmt(V.reduce((a, b) => a + b, 0) / V.length, 'n2') },
          { label:'MÍNIMO', value: fmt(Math.min.apply(null, V), 'n2') },
          { label:'MÁXIMO', value: fmt(Math.max.apply(null, V), 'n2') },
          { label:'DESV. ESTÁNDAR', value: V.length > 1 ? fmt(stdev(V), 'n2') : '—' },
          { label:'TENDENCIA (por periodo)', value: lr ? fmt(lr.m, 'n3') : '—',
            tone: lr ? (lr.m < 0 ? 'ok' : (lr.m > 0 ? 'warn' : '')) : '',
            hint: lr ? 'R² = ' + fmt(lr.r2, 'n3') : '' }
        ];
      }},
      { type:'note', tone:'info', text:'Antes de concluir que «mejoró» o «empeoró», verifica que el cambio esté fuera de la variación normal: la serie de tiempo muestra el patrón, el gráfico de control (CONTROLAR) confirma si el cambio es real.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ criterio:'C3' },
      matrix:[{ key:'serie', map:{
        'm1.valor':'C5',  'm2.valor':'C6',  'm3.valor':'C7',  'm4.valor':'C8',
        'm5.valor':'C9',  'm6.valor':'C10', 'm7.valor':'C11', 'm8.valor':'C12',
        'm9.valor':'C13', 'm10.valor':'C14','m11.valor':'C15','m12.valor':'C16',
        'm13.valor':'C17' } }]
    },
    bi: (d) => {
      const S = d.serie || {}, V = [];
      MESES.forEach((m, i) => {
        const v = S['m' + (i + 1) + '.valor'];
        if (v !== '' && v !== null && v !== undefined) V.push(num(v));
      });
      const lr = V.length > 1 ? linreg(V.map((x, i) => i), V) : null;
      return {
        serieCriterio: String(d.criterio || ''),
        seriePeriodos: V.length,
        seriePromedio: V.length ? V.reduce((a, b) => a + b, 0) / V.length : NaN,
        serieTendencia: lr ? lr.m : NaN
      };
    }
  };

  /* ======================================================================
     13 · %VALOR ADD
     ==================================================================== */
  const T_VA = {
    id: 'medir.valor_add',
    mod: 'MEDIR',
    sheet: '%VALOR ADD',
    title: '% VALUE ADD TIME — Porcentaje de valor agregado',
    desc: 'Clasifica cada actividad del proceso en VA (valor agregado), NVA (no valor agregado) o NVAR (necesario, no agrega valor) y calcula qué porcentaje del tiempo total agrega valor real para el cliente.',
    guide: [
      'VA: el cliente lo pagaría, transforma el servicio y se hace bien a la primera.',
      'NVA: esperas, transportes, reprocesos, revisiones dobles, búsquedas. Es desperdicio puro.',
      'NVAR: no agrega valor pero hoy es obligatorio (requisito legal de la ARL, registro contractual): se reduce, no se elimina.',
      'Mide los TIEMPOS en la misma unidad (minutos) y para una sola unidad de servicio.',
      'En procesos administrativos el VA suele ser menor al 10% del tiempo total: ahí está la oportunidad.',
      'Al exportar a Excel solo se totalizan VA y NVA (SUMIF del libro original); NVAR se conserva como categoría de la app.'
    ],
    blocks: [
      { type:'fields', title:'ENCABEZADO', cols:2, items:[
        { k:'proceso', label:'PROCESO:', input:'text', ph:'Proceso analizado', w:2 }
      ]},
      { type:'grid', key:'rows', title:'ACTIVIDADES', min:9, max:60, addLabel:'Agregar actividad',
        cols:[
          { k:'actividad', label:'ACTIVIDAD', input:'text', w:280 },
          { k:'categoria', label:'CATEGORIA', input:'select', w:120,
            opts:[{ v:'VA', l:'VA' }, { v:'NVA', l:'NVA' }, { v:'NVAR', l:'NVAR' }] },
          { k:'tiempo',    label:'TIEMPO', input:'number', step:0.01, align:'right', w:110 },
          { k:'pctFila',   label:'% DEL TOTAL', ro:true, fmt:'p1', align:'right', w:110,
            calc:(r, i, rows) => safeDiv(num(r.tiempo), sum(rows, 'tiempo')) }
        ],
        foot:[
          { k:'tiempo',  calc:(rows) => sum(rows, 'tiempo'), fmt:'n2' },
          { k:'pctFila', calc:(rows) => (sum(rows, 'tiempo') > 0 ? 1 : NaN), fmt:'p0' }
        ]
      },
      { type:'fields', title:'RESUMEN (como el Excel original)', cols:3, items:[
        { k:'_va',   label:'VALOR AGREGADO', ro:true, fmt:'n2', calc:(d) => vaSums(d).va },
        { k:'_vaP',  label:'% VALOR AGREGADO', ro:true, fmt:'p1',
          calc:(d) => { const s = vaSums(d); return safeDiv(s.va, s.total); } },
        { k:'_nvar', label:'NECESARIO NO VALOR AGREGADO (NVAR)', ro:true, fmt:'n2',
          calc:(d) => vaSums(d).nvar },
        { k:'_nva',  label:'VALOR NO AGREGADO', ro:true, fmt:'n2', calc:(d) => vaSums(d).nva },
        { k:'_nvaP', label:'% VALOR NO AGREGADO', ro:true, fmt:'p1',
          calc:(d) => { const s = vaSums(d); return safeDiv(s.nva, s.total); } },
        { k:'_nvarP', label:'% NVAR', ro:true, fmt:'p1',
          calc:(d) => { const s = vaSums(d); return safeDiv(s.nvar, s.total); } },
        { k:'_tot',  label:'TOTAL', ro:true, fmt:'n2', calc:(d) => vaSums(d).total },
        { k:'_totP', label:'% TOTAL', ro:true, fmt:'p0',
          calc:(d) => (vaSums(d).total > 0 ? 1 : NaN) }
      ]},
      { type:'cards', items:(d) => {
        const s = vaSums(d);
        const p = safeDiv(s.va, s.total);
        return [
          { label:'% VALOR AGREGADO', value: isFinite(p) ? fmt(p, 'p1') : '—',
            tone: tone3(p, 0.25, 0.1), hint:'VA / TOTAL' },
          { label:'TIEMPO VA', value: fmt(s.va, 'n2') },
          { label:'TIEMPO NVA', value: fmt(s.nva, 'n2'), tone: s.nva > s.va ? 'bad' : 'warn' },
          { label:'TIEMPO NVAR', value: fmt(s.nvar, 'n2'), tone: s.nvar > 0 ? 'warn' : '' },
          { label:'TIEMPO TOTAL', value: fmt(s.total, 'n2') },
          { label:'DESPERDICIO ELIMINABLE (NVA)', value: isFinite(safeDiv(s.nva, s.total)) ? fmt(safeDiv(s.nva, s.total), 'p1') : '—',
            tone: tone3i(safeDiv(s.nva, s.total), 0.3, 0.6), hint:'Objetivo directo de MEJORAR' }
        ];
      }},
      { type:'chart', kind:'pie', title:'Distribución del tiempo', h:300,
        data:(d) => {
          const s = vaSums(d);
          if (s.total <= 0) return { labels:[], values:[] };
          return { labels:['VALOR AGREGADO (VA)','VALOR NO AGREGADO (NVA)','NECESARIO NO VA (NVAR)'],
                   values:[s.va, s.nva, s.nvar] };
        }},
      { type:'note', tone:'info', text:'Ataca primero el NVA más grande (esperas y reprocesos) sin tocar el VA: eso reduce el tiempo total de ciclo sin afectar la calidad del servicio.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ proceso:'C3' },
      grids:[{ key:'rows', row:5, cols:{ actividad:'B', categoria:'C', tiempo:'D' } }]
    },
    bi: (d) => {
      const s = vaSums(d);
      return { vaTiempo: s.va, nvaTiempo: s.nva, nvarTiempo: s.nvar, vaTotal: s.total,
               vaPorcentaje: safeDiv(s.va, s.total), nvaPorcentaje: safeDiv(s.nva, s.total) };
    }
  };

  /* ======================================================================
     14 · PPM
     ==================================================================== */
  const T_PPM = {
    id: 'medir.ppm',
    mod: 'MEDIR',
    sheet: 'PPM',
    title: 'PPM — Parts Per Million (partes por millón)',
    desc: 'Unidades defectuosas por millón de unidades inspeccionadas, por proceso: la forma estándar de comparar desempeño entre procesos de volumen distinto.',
    guide: [
      'UNITS INSPECTED es el total revisado; DEFECTS son las UNIDADES defectuosas (no la cantidad de defectos).',
      'PASS, % DEFECTS, % PASS-YIELD y los PPM se calculan automáticamente.',
      'PPM defective = % de defectuosas × 1.000.000: sirve para comparar procesos de distinto tamaño.',
      'Si una unidad puede tener varios defectos, usa DPU o DPMO en lugar de PPM.',
      'Agrega una fila por proceso o por periodo para ver quién aporta más defectuosas.'
    ],
    blocks: [
      { type:'grid', key:'rows', title:'PARTS PER MILLION', min:5, max:60, addLabel:'Agregar proceso',
        cols:[
          { k:'proceso',  label:'PROCESS', input:'text', w:200 },
          { k:'units',    label:'UNITS INSPECTED', input:'number', step:1, align:'right', w:130 },
          { k:'defects',  label:'DEFECTS', input:'number', step:1, align:'right', w:110 },
          { k:'pass',     label:'PASS', ro:true, fmt:'n0', align:'right', w:100,
            calc:(r) => num(r.units) - num(r.defects) },                    /* E4 =C4-D4 */
          { k:'pctDef',   label:'% DEFECTS', ro:true, fmt:'p2', align:'right', w:110,
            calc:(r) => safeDiv(r.defects, r.units) },                      /* F4 =D4/C4 */
          { k:'pctPass',  label:'% PASS-YIELD', ro:true, fmt:'p2', align:'right', w:120,
            calc:(r) => safeDiv(num(r.units) - num(r.defects), num(r.units)) }, /* G4 =E4/C4 */
          { k:'ppmDef',   label:'PPM defective', ro:true, fmt:'n0', align:'right', w:120, databar:true,
            calc:(r) => safeDiv(r.defects, r.units) * 1e6 },                /* H4 =F4*1000000 */
          { k:'ppmPass',  label:'PPM PASS', ro:true, fmt:'n0', align:'right', w:120,
            calc:(r) => safeDiv(num(r.units) - num(r.defects), num(r.units)) * 1e6 }, /* I4 =G4*1000000 */
          { k:'sigma',    label:'NIVEL SIGMA', ro:true, align:'right', w:110,
            calc:(r) => { const p = safeDiv(r.defects, r.units);
                          return isFinite(p) ? fmt(sigmaLevel(p * 1e6), 'n2') : ''; } }
        ],
        foot:[
          { k:'units',   calc:(rows) => sum(rows, 'units'), fmt:'n0' },
          { k:'defects', calc:(rows) => sum(rows, 'defects'), fmt:'n0' },
          { k:'pass',    calc:(rows) => sum(rows, 'units') - sum(rows, 'defects'), fmt:'n0' },
          { k:'pctDef',  calc:(rows) => safeDiv(sum(rows, 'defects'), sum(rows, 'units')), fmt:'p2' },
          { k:'pctPass', calc:(rows) => safeDiv(sum(rows, 'units') - sum(rows, 'defects'), sum(rows, 'units')), fmt:'p2' },
          { k:'ppmDef',  calc:(rows) => safeDiv(sum(rows, 'defects'), sum(rows, 'units')) * 1e6, fmt:'n0' },
          { k:'ppmPass', calc:(rows) => safeDiv(sum(rows, 'units') - sum(rows, 'defects'), sum(rows, 'units')) * 1e6, fmt:'n0' }
        ]
      },
      { type:'cards', title:'CONSOLIDADO', items:(d) => {
        const rows = arr(d.rows);
        const u = sum(rows, 'units'), df = sum(rows, 'defects');
        const p = safeDiv(df, u), ppm = p * 1e6;
        return [
          { label:'UNITS INSPECTED', value: fmt(u, 'n0') },
          { label:'DEFECTS', value: fmt(df, 'n0'), tone: df > 0 ? 'warn' : 'ok' },
          { label:'% PASS-YIELD', value: isFinite(p) ? fmt(1 - p, 'p2') : '—', tone: tone3(1 - p, 0.95, 0.85) },
          { label:'PPM defective', value: isFinite(ppm) ? fmt(ppm, 'n0') : '—',
            tone: tone3i(ppm, 6210, 66807), hint:'≤ 6.210 PPM ≈ 4σ' },
          { label:'NIVEL SIGMA', value: isFinite(ppm) ? sigTxt(ppm) : '—',
            tone: tone3(isFinite(ppm) ? sigmaLevel(ppm) : NaN, 4, 3) }
        ];
      }},
      { type:'chart', kind:'bar', title:'PPM defective por proceso', h:320,
        data:(d) => {
          const rows = filled(arr(d.rows), 'proceso');
          return { labels: rows.map(r => String(r.proceso)),
                   values: rows.map(r => round(safeDiv(r.defects, r.units) * 1e6, 0)) };
        }},
      { type:'note', tone:'info', text:'Referencias de nivel sigma: 3σ ≈ 66.807 PPM · 4σ ≈ 6.210 PPM · 5σ ≈ 233 PPM · 6σ ≈ 3,4 PPM (con corrimiento de 1,5σ).' },
      { type:'insight' }
    ],
    xl: { file: XLF, grids:[{ key:'rows', row:4, cols:{ proceso:'B', units:'C', defects:'D' } }] },
    bi: (d) => {
      const rows = arr(d.rows), u = sum(rows, 'units'), df = sum(rows, 'defects');
      const p = safeDiv(df, u);
      return { ppmUnits: u, ppmDefects: df, ppmDefective: p * 1e6,
               ppmYield: 1 - p, ppmSigma: isFinite(p) ? sigmaLevel(p * 1e6) : NaN };
    }
  };

  /* ======================================================================
     15 · DPMO
     ==================================================================== */
  const T_DPMO = {
    id: 'medir.dpmo',
    mod: 'MEDIR',
    sheet: 'DPMO',
    title: 'DPMO — Defects Per Million Opportunities',
    desc: 'Defectos por millón de oportunidades: cuenta TODOS los defectos contra TODAS las oportunidades de fallar (unidades × categorías de defecto). Es la métrica que se traduce a nivel sigma.',
    guide: [
      'Renombra las 4 CATEGORIES con los defectos reales del proceso (por defecto: RAYONES, DEFORMACION, EXCESO DE MATERIAL, FALTA MATERIAL).',
      'Una fila por proceso, lote, sede o periodo; TOTAL DEFECTS se suma solo.',
      'TOTAL OPPORTUNITIES = UNITS × CATEGORIES: cada unidad puede fallar en cada categoría.',
      'DPMO = (TOTAL DEFECTS / TOTAL OPPORTUNITIES) × 1.000.000.',
      'El NIVEL SIGMA se calcula con el corrimiento estándar de 1,5σ (convención Six Sigma).',
      'Cuenta defectos, no unidades defectuosas: una misma unidad puede aportar varios defectos.'
    ],
    blocks: [
      { type:'fields', title:'CATEGORIES (nombres editables)', cols:4, items:[
        { k:'cat1', label:'CATEGORIA 1', input:'text', ph:'RAYONES' },
        { k:'cat2', label:'CATEGORIA 2', input:'text', ph:'DEFORMACION' },
        { k:'cat3', label:'CATEGORIA 3', input:'text', ph:'EXCESO DE MATERIAL' },
        { k:'cat4', label:'CATEGORIA 4', input:'text', ph:'FALTA MATERIAL' }
      ]},
      { type:'grid', key:'rows', title:'DEFECTS PER MILLION OPPORTUNITIES', min:10, max:10, fixed:true,
        cols:(d) => [
          { k:'proceso', label:'PROCESS', input:'text', w:200 },
          { k:'units',   label:'UNITS INSPECTED', input:'number', step:1, align:'right', w:130 },
          { k:'c1',      label: catName(d, 1), input:'number', step:1, align:'right', w:120 },
          { k:'c2',      label: catName(d, 2), input:'number', step:1, align:'right', w:120 },
          { k:'c3',      label: catName(d, 3), input:'number', step:1, align:'right', w:120 },
          { k:'c4',      label: catName(d, 4), input:'number', step:1, align:'right', w:120 },
          { k:'total',   label:'TOTAL DEFECTS', ro:true, fmt:'n0', align:'right', w:120,
            calc:(r) => num(r.c1) + num(r.c2) + num(r.c3) + num(r.c4) }   /* H7 =SUM(D7:G7) */
        ],
        /* Fila TOTAL (Excel B17:H17, SUBTOTAL sobre Tabla10) */
        foot:[
          { k:'units', calc:(rows) => sum(rows, 'units'), fmt:'n0' },
          { k:'c1',    calc:(rows) => sum(rows, 'c1'), fmt:'n0' },
          { k:'c2',    calc:(rows) => sum(rows, 'c2'), fmt:'n0' },
          { k:'c3',    calc:(rows) => sum(rows, 'c3'), fmt:'n0' },
          { k:'c4',    calc:(rows) => sum(rows, 'c4'), fmt:'n0' },
          { k:'total', calc:(rows) => rows.reduce((a, r) =>
              a + num(r.c1) + num(r.c2) + num(r.c3) + num(r.c4), 0), fmt:'n0' }
        ]
      },
      { type:'cards', title:'DPMO', items:(d) => {
        const c = dpmoCalc(d);
        return [
          { label:'UNITS', value: fmt(c.units, 'n0'), hint:'Total de unidades inspeccionadas' },
          { label:'CATEGORIES', value: fmt(c.cats, 'n0'), hint:'Oportunidades de defecto por unidad' },
          { label:'TOTAL OPPORTUNITIES', value: fmt(c.opps, 'n0'), hint:'UNITS × CATEGORIES' },
          { label:'TOTAL DEFECTS', value: fmt(c.defs, 'n0'), tone: c.defs > 0 ? 'warn' : 'ok' },
          { label:'DPMO', value: isFinite(c.dpmo) ? fmt(c.dpmo, 'n0') : '—',
            tone: tone3i(c.dpmo, 6210, 66807), hint:'(TOTAL DEFECTS / TOTAL OPPORTUNITIES) × 1.000.000' },
          { label:'NIVEL SIGMA', value: isFinite(c.dpmo) ? sigTxt(c.dpmo) : '—',
            tone: tone3(isFinite(c.dpmo) ? sigmaLevel(c.dpmo) : NaN, 4, 3),
            hint:'Con corrimiento de 1,5σ' },
          { label:'YIELD (por oportunidad)', value: isFinite(c.prop) ? fmt(1 - c.prop, 'p2') : '—',
            tone: tone3(1 - c.prop, 0.99, 0.95) }
        ];
      }},
      { type:'chart', kind:'pareto', title:'Defectos por categoría', h:330,
        data:(d) => {
          const rows = arr(d.rows);
          const items = [1, 2, 3, 4].map(i => ({ l: catName(d, i), v: sum(rows, 'c' + i) }))
            .filter(x => x.v > 0).sort((a, b) => b.v - a.v);
          return { labels: items.map(x => x.l), values: items.map(x => x.v) };
        }},
      { type:'note', tone:'info', text:'DPMO permite comparar procesos con distinto número de oportunidades. Si cambias el número de categorías, el DPMO cambia aunque el proceso sea el mismo: mantén la definición de oportunidades fija durante todo el proyecto.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ cat1:'D6', cat2:'E6', cat3:'F6', cat4:'G6' },
      grids:[{ key:'rows', row:7, cols:{ proceso:'B', units:'C', c1:'D', c2:'E', c3:'F', c4:'G' } }]
    },
    bi: (d) => {
      const c = dpmoCalc(d);
      return { dpmoUnits: c.units, dpmoOportunidades: c.opps, dpmoDefectos: c.defs,
               dpmo: c.dpmo, dpmoSigma: isFinite(c.dpmo) ? sigmaLevel(c.dpmo) : NaN };
    }
  };

  /* ======================================================================
     16 · DPU
     ==================================================================== */
  const T_DPU = {
    id: 'medir.dpu',
    mod: 'MEDIR',
    sheet: 'DPU',
    title: 'DPU — Defects Per Unit (defectos por unidad)',
    desc: 'Promedio de defectos por unidad inspeccionada: total de no conformancias dividido entre el total de unidades revisadas.',
    guide: [
      'Lista las NO CONFORMANCIAS encontradas y su cantidad; el TOTAL se suma solo.',
      'TOTAL INSPECCIONADAS es el número de unidades (historias, servicios, piezas) revisadas.',
      'DPU = total de defectos / total de unidades inspeccionadas. Puede ser mayor que 1.',
      'Con DPU se estima el rendimiento del proceso: Yield ≈ e^(−DPU) (distribución de Poisson).',
      'Si necesitas comparar con otros procesos, convierte a DPMO dividiendo entre el número de oportunidades por unidad.'
    ],
    blocks: [
      { type:'fields', title:'ENCABEZADO', cols:2, items:[
        { k:'proceso',        label:'PROCESO', input:'textarea', rows:3, ph:'Proceso inspeccionado' },
        { k:'inspeccionadas', label:'TOTAL INSPECCIONADAS', input:'number', step:1 }
      ]},
      { type:'grid', key:'rows', title:'NO CONFORMANCIAS', min:4, fixed:true,
        cols:[
          { k:'noconf', label:'NO CONFORMANCIAS', input:'text', w:320 },
          { k:'cant',   label:'CANTIDAD', input:'number', step:1, align:'right', w:130, databar:true }
        ],
        foot:[ { k:'cant', calc:(rows) => sum(rows, 'cant'), fmt:'n0' } ]   /* D8 =SUM(D4:D7) */
      },
      { type:'cards', items:(d) => {
        const defs = sum(arr(d.rows), 'cant'), u = num(d.inspeccionadas);
        const dpu = safeDiv(defs, u);                                       /* E7 =D8/E4 */
        const yld = isFinite(dpu) ? Math.exp(-dpu) : NaN;
        return [
          { label:'TOTAL', value: fmt(defs, 'n0'), hint:'Suma de no conformancias' },
          { label:'TOTAL INSPECCIONADAS', value: fmt(u, 'n0') },
          { label:'DPU', value: isFinite(dpu) ? fmt(dpu, 'n3') : '—',
            tone: tone3i(dpu, 0.05, 0.25), hint:'TOTAL defectos / TOTAL INSPECCIONADAS' },
          { label:'YIELD ESTIMADO (e^-DPU)', value: isFinite(yld) ? fmt(yld, 'p2') : '—',
            tone: tone3(yld, 0.95, 0.85), hint:'Probabilidad de una unidad sin defectos' },
          { label:'DEFECTOS POR 100 UNIDADES', value: isFinite(dpu) ? fmt(dpu * 100, 'n1') : '—' }
        ];
      }},
      { type:'chart', kind:'pareto', title:'No conformancias', h:300,
        data:(d) => {
          const rows = filled(arr(d.rows), 'noconf')
            .map(r => ({ l:String(r.noconf), v:num(r.cant) }))
            .filter(x => x.v > 0).sort((a, b) => b.v - a.v);
          return { labels: rows.map(x => x.l), values: rows.map(x => x.v) };
        }},
      { type:'note', tone:'info', text:'Un DPU de 0,30 significa 30 defectos por cada 100 unidades: aunque muchas unidades salgan buenas, cada defecto cuesta retrabajo, reclamos o reprogramación de citas.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ proceso:'B4', inspeccionadas:'E4' },
      grids:[{ key:'rows', row:4, cols:{ noconf:'C', cant:'D' } }]
    },
    bi: (d) => {
      const defs = sum(arr(d.rows), 'cant'), u = num(d.inspeccionadas);
      const dpu = safeDiv(defs, u);
      return { dpuDefectos: defs, dpuInspeccionadas: u, dpu: dpu,
               dpuYield: isFinite(dpu) ? Math.exp(-dpu) : NaN };
    }
  };

  /* ======================================================================
     17 · A3 MEDIR
     ==================================================================== */
  const T_A3 = {
    id: 'medir.a3_medir',
    mod: 'MEDIR',
    sheet: 'A3 Medir',
    title: 'A3 MEDIR — Resumen de la fase',
    desc: 'Una sola página con el cierre de la fase MEDIR: documentación del estado actual, sistema de medición (GR&R), línea base y evidencia de los datos medidos.',
    guide: [
      'El A3 se llena AL FINAL de la fase, con lo que ya quedó documentado en las demás hojas.',
      'DOCUMENTACION ESTADO ACTUAL: qué se mapeó (SWIM LINE, Process Mapping) y qué se encontró.',
      'SISTEMA DE MEDICION GR&R: cómo se validó que los datos son confiables (quién mide, con qué, repetibilidad y reproducibilidad).',
      'BASE LINE - ESTADO ACTUAL: el valor del métrico HOY (yield, DPMO, DPU, % VA, tiempo de ciclo).',
      'MEDICION DE DATOS: incrusta el gráfico de desempeño y adjunta histogramas o paretos como imagen.',
      'El OBJETIVO SMART se trae de DEFINIR: si cambió, corrígelo allá, no aquí.'
    ],
    blocks: [
      { type:'a3', title:'A3 — MEDIR', cols:2, areas:[
        { k:'doc',      label:'DOCUMENTACION ESTADO ACTUAL DEL PROCESO', kind:'text', h:300,
          ph:'Alcance mapeado, pasos críticos, hand-offs, hallazgos del mapa de proceso…' },
        { k:'grr',      label:'SISTEMA DE MEDICION GR&R', kind:'text', h:300,
          ph:'Instrumentos, operadores, repetibilidad, reproducibilidad, % R&R, decisión sobre la confiabilidad del dato…' },
        { k:'baseline', label:'BASE LINE - ESTADO ACTUAL', kind:'text', h:260,
          ph:'Métrico, valor actual, periodo, fuente de datos, tamaño de muestra…' },
        { label:'MEDICIONN DE DATOS (DESEMPEÑO DEL PROCESO, HISTOGRAMAS, PARETOS, ETC)',
          kind:'ref', ref:'medir.grafico_serie_tiempo', h:320 },
        { k:'smart',    label:'OBJETIVO SMART', kind:'ref', ref:'definir.smart', w:2, h:130 }
      ]},
      { type:'upload', k:'evidencia', label:'EVIDENCIA — histograma / pareto / gráfico de control (imagen)', h:300 },
      { type:'cards', title:'LÍNEA BASE MEDIDA EN ESTE PROYECTO', items:(d, ctx) => {
        const all = (ctx && ctx.all) || {};
        const y = all['medir.yield'] || {}, r = all['medir.rty_fpy'] || {},
              dp = all['medir.dpmo'] || {}, du = all['medir.dpu'] || {},
              va = all['medir.valor_add'] || {};
        const out = [];
        const yv = safeDiv(num(y.totales) - num(y.malas), num(y.totales));
        if (isFinite(yv)) out.push({ label:'YIELD', value: fmt(yv, 'p2'), tone: tone3(yv, 0.95, 0.85) });
        const res = rtyChain(r), rty = chainProduct(res, 'yld');
        if (isFinite(rty)) out.push({ label:'RTY', value: fmt(rty, 'p2'), tone: tone3(rty, 0.9, 0.75) });
        const c = dpmoCalc(dp);
        if (isFinite(c.dpmo)) out.push({ label:'DPMO', value: fmt(c.dpmo, 'n0'),
          tone: tone3i(c.dpmo, 6210, 66807), hint:'Nivel sigma ' + sigTxt(c.dpmo) });
        const dpu = safeDiv(sum(arr(du.rows), 'cant'), num(du.inspeccionadas));
        if (isFinite(dpu)) out.push({ label:'DPU', value: fmt(dpu, 'n3'), tone: tone3i(dpu, 0.05, 0.25) });
        const s = vaSums(va), pva = safeDiv(s.va, s.total);
        if (isFinite(pva)) out.push({ label:'% VALOR AGREGADO', value: fmt(pva, 'p1'), tone: tone3(pva, 0.25, 0.1) });
        if (!out.length) out.push({ label:'LÍNEA BASE', value:'—',
          hint:'Diligencia YIELD, RTY-FPY, DPMO, DPU o %VALOR ADD para ver aquí el consolidado' });
        return out;
      }},
      { type:'note', tone:'warn', text:(d, ctx) => {
        const sm = (ctx && ctx.all && ctx.all['definir.smart']) || null;
        return hasContent(sm) ? '' :
          'El OBJETIVO SMART aún no está diligenciado en DEFINIR › Objetivo SMART: complétalo allá para que aparezca automáticamente en este A3.';
      }},
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ doc:'B5', grr:'G5', baseline:'B21' },
      refs:[{ k:'smart', cell:'B36', from:'definir.smart' }],
      images:[{ k:'evidencia', anchor:'G21', w:5, h:18 }]
    },
    bi: (d) => ({
      a3MedirSecciones: [d.doc, d.grr, d.baseline].filter(x => String(x || '').trim() !== '').length,
      a3MedirTotalSecciones: 3
    })
  };

  /* ====================================================================== */
  return [
    T_SWIM, T_PMD, T_METRICOS, T_PLAN_CUAL, T_N_CUAL, T_PLAN_CUAN, T_N_CUAN,
    T_CHECK, T_RECOL, T_YIELD, T_RTY, T_SERIE, T_VA, T_PPM, T_DPMO, T_DPU, T_A3
  ];

})();

registerTools(SPECS_MEDIR);
