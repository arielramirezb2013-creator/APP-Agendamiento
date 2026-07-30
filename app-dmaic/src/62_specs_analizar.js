/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   SPECS MÓDULO 3 — ANALIZAR   (libro Excel original: 03ANALIZAR.xlsx · 7 hojas)
   ---------------------------------------------------------------------------
   Fuente de verdad: _dump/ce453cdb-03ANALIZAR.txt (volcado celda por celda).
   Hojas: Brainstorming · Diagramas Ishikawa · 5 Why´s · Tree diagram ·
          Validacion de causas · Descripcion causa raiz · A3 Analizar.

   JavaScript de navegador plano: sin módulos, sin librerías, sin fetch.
   ---------------------------------------------------------------------------
   CONTRATO DE DATOS DE LOS DIAGRAMAS DE ESTE MÓDULO (para 50_diagrams.js)
   ---------------------------------------------------------------------------
   Todos los bloques {type:'diagram'} de ANALIZAR exponen `data:(d,ctx)=>{...}`
   con la estructura YA RESUELTA para dibujar, y declaran de dónde sale cada
   dato para que el lienzo pueda editar EN VIVO reutilizando los enlaces que ya
   maneja 90_app.js:

     · celdas de una tabla →  data-t="<toolId>" data-g="<grid>" data-r="<i>" data-c="<col>"
     · campos sueltos      →  data-t="<toolId>" data-f="<clave>"
     · estado propio       →  data-diag="<toolId>|<key>|<ruta>"  (DIAG.setPath)

   kind:'affinity' → data = { cats:[..], groups:[{cat, items:[{i,text,cat,votos}]}],
                              sin:[..], grid:'ideas', textField:'idea', catField:'cat' }
   kind:'ishikawa' → data = { head, spines:[{k,l,pos,causes:[{i,text,subs:[{text}]}]}],
                              grid:'causas', diag:'6M'|'4P' }
   kind:'fivewhy'  → data = { problem, steps:[{n,why,nec,how,keys:{...}}], root, keys:{...} }
   kind:'tree'     → data = { root:{text,kind,lvl,i,kids:[..]}, grid:'nodos',
                              textField:'texto', levelField:'nivel', typeField:'tipo' }
   ========================================================================== */
'use strict';

const SPECS_ANALIZAR = (function(){

  /* ======================================================================
     HELPERS PRIVADOS DEL MÓDULO (encapsulados en el IIFE)
     ==================================================================== */
  const XLF = '03ANALIZAR';

  /** Texto seguro y sin espacios sobrantes */
  const txt = v => String(v === null || v === undefined ? '' : v).trim();
  /** Filas con contenido en la columna k */
  const filled = (rows, k) => arr(rows).filter(r => txt(r && r[k]) !== '');
  /** Primer valor no vacío */
  const or = (a, b) => txt(a) !== '' ? txt(a) : b;
  /** Datos de otra herramienta del proyecto */
  const dataOf = (ctx, id) => (ctx && ctx.all && ctx.all[id]) || {};
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

  /* ---------------- BRAINSTORMING / AFFINITY ---------------------------- */
  /* Categorías por defecto = las 6M del Ishikawa (el brainstorming alimenta
     el diagrama causa-efecto). */
  const CAT_DEF = ['Mediciones', 'Materiales', 'Mano de Obra',
                   'Medio Ambiente', 'Métodos', 'Maquinaria'];
  function catList(d){
    const c = filled(arr(d && d.cats), 'cat').map(r => txt(r.cat));
    return c.length ? c : CAT_DEF.slice();
  }
  function affinity(d){
    const cats = catList(d), rows = arr(d && d.ideas);
    const groups = cats.map(c => ({ cat: c, items: [] }));
    const idx = {}; groups.forEach((g, i) => { idx[g.cat.toUpperCase()] = i; });
    const sin = [];
    rows.forEach((r, i) => {
      const t = txt(r.idea); if (!t) return;
      const it = { i: i, text: t, cat: txt(r.cat), votos: num(r.votos) };
      const g = idx[txt(r.cat).toUpperCase()];
      if (g === undefined) sin.push(it); else groups[g].items.push(it);
    });
    return { cats: cats, groups: groups, sin: sin,
             grid: 'ideas', textField: 'idea', catField: 'cat' };
  }

  /* ---------------- ISHIKAWA -------------------------------------------- */
  const M6 = [
    { k:'m1', l:'Mediciones',    pos:'top'    },
    { k:'m2', l:'Materiales',    pos:'top'    },
    { k:'m3', l:'Mano de Obra',  pos:'top'    },
    { k:'m4', l:'Medio Ambiente', pos:'bottom' },
    { k:'m5', l:'Métodos',       pos:'bottom' },
    { k:'m6', l:'Maquinaria',    pos:'bottom' }
  ];
  const P4 = [
    { k:'p1', l:'Politicas',      pos:'top'    },
    { k:'p2', l:'Personal',       pos:'top'    },
    { k:'p3', l:'Procedimientos', pos:'bottom' },
    { k:'p4', l:'Instalaciones',  pos:'bottom' }
  ];
  /** Nombres reales de las espinas (los del Excel se pueden renombrar) */
  const spineNames = (d, def) => def.map(s => or(d && d[s.k], s.l));
  const spinesOf   = (d, def) => def.map(s => ({ k: s.k, l: or(d && d[s.k], s.l), pos: s.pos }));
  const espinasAll = d => spineNames(d, M6).concat(spineNames(d, P4));

  /** Causas capturadas en la tabla del Ishikawa (fuente principal) */
  function ishRows(d, diag){
    const out = [];
    arr(d && d.causas).forEach((r, i) => {
      if (diag && txt(r.diag) && txt(r.diag) !== diag) return;
      const c = txt(r.causa), s = txt(r.subcausa);
      if (!c && !s) return;
      out.push({ i: i, diag: or(r.diag, '6M'), spine: txt(r.espina) || '—',
                 txt: c || s, sub: !c, subcausa: s, obs: txt(r.obs) });
    });
    return out;
  }
  /** Lectura TOLERANTE del estado propio del lienzo (d.ish6m / d.ish4p) */
  const nodeText = v => (v && typeof v === 'object')
    ? txt(v.t || v.text || v.txt || v.causa || v.label || v.l) : txt(v);
  const nodeKids = v => (v && typeof v === 'object')
    ? arr(v.subs || v.sub || v.children || v.hijos || v.items) : [];
  function ishCanvas(g, diag){
    const out = [];
    if (!g || typeof g !== 'object') return out;
    const raw = g.spines || g.espinas || g.branches || g.ramas || g;
    let list = [];
    if (Array.isArray(raw)) list = raw;
    else list = Object.keys(raw).map(k => {
      const v = raw[k];
      if (Array.isArray(v)) return { k: k, causes: v };
      if (v && typeof v === 'object') { const o = { k: k }; for (const p in v) o[p] = v[p]; return o; }
      return null;
    }).filter(Boolean);
    list.forEach(s => {
      const sn = txt(s.name || s.l || s.label || s.titulo || s.k) || '—';
      arr(s.causes || s.causas || s.items || s.nodes).forEach(c => {
        const t = nodeText(c);
        if (t) out.push({ diag: diag, spine: sn, txt: t, sub: false });
        nodeKids(c).forEach(x => {
          const t2 = nodeText(x);
          if (t2) out.push({ diag: diag, spine: sn, txt: t2, sub: true });
        });
      });
    });
    return out;
  }
  /** Todas las causas del Ishikawa: tabla + lienzo, sin repetir */
  function ishAll(d){
    return dedup(ishRows(d, '').concat(ishCanvas(d && d.ish6m, '6M'))
                              .concat(ishCanvas(d && d.ish4p, '4P')));
  }
  /** Estructura lista para dibujar el pescado */
  function ishData(d, def, diag, prob){
    const spines = spinesOf(d, def).map(s => ({ k: s.k, l: s.l, pos: s.pos, causes: [] }));
    const idx = {}; spines.forEach((s, i) => { idx[s.l.toUpperCase()] = i; });
    ishRows(d, diag).forEach(r => {
      const i = idx[r.spine.toUpperCase()];
      if (i === undefined) return;
      if (r.sub && spines[i].causes.length){
        spines[i].causes[spines[i].causes.length - 1].subs.push({ text: r.subcausa, i: r.i });
      } else {
        spines[i].causes.push({ i: r.i, text: r.txt,
          subs: r.subcausa && !r.sub ? [{ text: r.subcausa, i: r.i }] : [] });
      }
    });
    ishCanvas(d && d[diag === '6M' ? 'ish6m' : 'ish4p'], diag).forEach(r => {
      const i = idx[r.spine.toUpperCase()];
      if (i === undefined) return;
      if (spines[i].causes.some(c => c.text.toUpperCase() === r.txt.toUpperCase())) return;
      if (r.sub && spines[i].causes.length) spines[i].causes[spines[i].causes.length - 1].subs.push({ text: r.txt });
      else spines[i].causes.push({ text: r.txt, subs: [] });
    });
    return { head: txt(prob) || 'Problema', diag: diag, spines: spines,
             grid: 'causas', textField: 'causa', spineField: 'espina' };
  }

  /* ---------------- 5 WHY´S --------------------------------------------- */
  const W = [1, 2, 3, 4, 5];
  /** Claves planas de un bloque de 5 Why´s ('w1' o 'w2') */
  const wk = (p, n, i) => p + '_' + n + (i === undefined ? '' : i);
  function fiveWhy(d, p){
    return {
      problem: txt(d && d[wk(p, 'problema')]),
      root:    txt(d && d[wk(p, 'raiz')]),
      steps: W.map(i => ({
        n: i,
        why: txt(d && d[wk(p, 'why', i)]),
        nec: txt(d && d[wk(p, 'nec', i)]),
        how: txt(d && d[wk(p, 'how', i)]),
        keys: { why: wk(p, 'why', i), nec: wk(p, 'nec', i), how: wk(p, 'how', i) }
      })),
      keys: { problem: wk(p, 'problema'), root: wk(p, 'raiz') }
    };
  }
  /** Ítems del formulario de un bloque de 5 Why´s */
  function whyItems(p){
    const it = [{ k: wk(p, 'problema'), label:'PROBLEM', input:'textarea', rows:3, w:3,
      ph:'Enuncia el problema con datos: qué, dónde, cuándo y cuánto' }];
    W.forEach(i => {
      it.push({ k: wk(p, 'why', i), label:'Why ' + i + ' — ¿Por qué?', input:'text',
        ph: i === 1 ? '¿Por qué ocurre el problema?' : '¿Por qué ocurre lo anterior?' });
      it.push({ k: wk(p, 'nec', i), label:'Is confirmation necessary? (' + i + ')',
        input:'select', opts:['SI','NO'] });
      it.push({ k: wk(p, 'how', i), label:'How is this confirmed (' + i + ')', input:'text',
        ph:'Dato, evidencia o prueba con la que se confirma' });
    });
    it.push({ k: wk(p, 'raiz'), label:'Root Cause — CAUSA RAIZ', input:'textarea', rows:2, w:3,
      ph:'Causa raíz a la que se llegó: debe ser accionable y estar confirmada con datos' });
    return it;
  }
  /** Causas candidatas que aporta un bloque de 5 Why´s */
  function whyCausas(d, p){
    const out = [], f = fiveWhy(d, p);
    f.steps.forEach(s => { if (s.why) out.push({ txt: s.why, src: '5 Why´s · Why ' + s.n }); });
    if (f.root) out.push({ txt: f.root, src: '5 Why´s · Root Cause' });
    return out;
  }

  /* ---------------- TREE DIAGRAM ---------------------------------------- */
  const TIPOS_TREE = ['WHY', 'ROOT CAUSE'];
  /** Convierte el esquema indentado (NIVEL + TEXTO) en un árbol anidado */
  function treeData(d){
    const root = { text: or(d && d.problema, 'Problem'), kind:'PROBLEM', lvl:0, i:-1, kids:[] };
    const stack = [root];
    arr(d && d.nodos).forEach((r, i) => {
      const t = txt(r.texto); if (!t) return;
      const lv = Math.max(1, Math.min(9, Math.round(num(r.nivel) || 1)));
      const node = { text: t, kind: or(r.tipo, 'WHY'), lvl: lv, i: i, kids: [],
                     raiz: or(r.tipo, 'WHY') === 'ROOT CAUSE' };
      while (stack.length > lv) stack.pop();
      (stack[stack.length - 1] || root).kids.push(node);
      stack.push(node);
    });
    return { root: root, grid:'nodos', textField:'texto', levelField:'nivel', typeField:'tipo',
             types: TIPOS_TREE };
  }
  const treeRaices = d => arr(d && d.nodos)
    .filter(r => txt(r.texto) && or(r.tipo, 'WHY') === 'ROOT CAUSE');

  /* ---------------- ORIGEN DE CAUSAS PARA LA VALIDACIÓN ------------------ */
  function causasIshikawa(ctx){
    const d = dataOf(ctx, 'analizar.diagramas_ishikawa');
    return ishAll(d).map(c => ({ txt: c.txt, src: 'Ishikawa · ' + c.spine }));
  }
  function causas5Why(ctx){
    const d = dataOf(ctx, 'analizar.5_whys');
    return whyCausas(d, 'w1').concat(whyCausas(d, 'w2'));
  }

  /** Agrega causas a la tabla de «Validacion de causas» sin duplicar */
  function importarCausas(list){
    const d = ST.d('analizar.validacion_de_causas');
    if (!Array.isArray(d.rows)) d.rows = [];
    const has = {};
    d.rows.forEach(r => { const k = txt(r.causa).toUpperCase(); if (k) has[k] = 1; });
    let n = 0;
    dedup(list).forEach(c => {
      const k = txt(c.txt).toUpperCase();
      if (!k || has[k]) return;
      has[k] = 1; n++;
      const libre = d.rows.find(r => txt(r.causa) === '' && txt(r.accion) === '' &&
                                     txt(r.responsable) === '' && txt(r.comentarios) === '');
      if (libre){ libre.causa = c.txt; if (!txt(libre.comentarios)) libre.comentarios = c.src || ''; }
      else d.rows.push({ _id: uid(), causa: c.txt, comentarios: c.src || '' });
    });
    return n;
  }

  /* Botones «traer causas» de la tarjeta de validación (HTML estático) */
  const BTN_IMPORT =
    '<button class="btn xs g" data-impcausas="ishikawa" title="Trae las causas del diagrama Ishikawa">' +
      '⤵ Causas del Ishikawa</button>' +
    '<button class="btn xs g" data-impcausas="5why" title="Trae los porqués y las causas raíz de los 5 Why´s">' +
      '⤵ Causas de los 5 Why´s</button>';

  document.addEventListener('click', function(e){
    const el = (e.target && e.target.closest) ? e.target.closest('[data-impcausas]') : null;
    if (!el) return;
    e.preventDefault();
    if (typeof ST === 'undefined') return;
    const src = el.getAttribute('data-impcausas'), ctx = ST.ctx();
    const list = src === 'ishikawa' ? causasIshikawa(ctx)
               : src === '5why'     ? causas5Why(ctx)
               : causasIshikawa(ctx).concat(causas5Why(ctx));
    const n = importarCausas(list);
    ST.touch();
    if (typeof UI !== 'undefined' && UI.softRefresh) UI.softRefresh();
    if (typeof toast === 'function')
      toast(n ? ('Se importaron ' + n + ' causa(s) posible(s)')
              : 'No hay causas nuevas para importar: diligencia primero el Ishikawa o los 5 Why´s',
            n ? 'ok' : 'warn');
  });

  /* ======================================================================
     1 · BRAINSTORMING  (+ AFFINITY DIAGRAM)
     ==================================================================== */
  const T_BRAIN = {
    id: 'analizar.brainstorming',
    mod: 'ANALIZAR',
    sheet: 'Brainstorming',
    title: 'BRAINSTORMING — Lluvia de ideas y AFFINITY DIAGRAM',
    desc: 'Genera con el equipo todas las causas posibles del problema y agrúpalas por afinidad (AFFINITY DIAGRAM) en las categorías que después se convierten en las espinas del Ishikawa.',
    guide: [
      'Primero DIVERGE: 15 minutos escribiendo ideas sin juzgar, sin discutir y sin filtrar. Cantidad antes que calidad.',
      'Una idea por renglón y redactada como CAUSA («la agenda se cruza porque…»), no como solución.',
      'Después CONVERGE: define las CATEGORIES y asigna cada idea a una categoría; el AFFINITY DIAGRAM las agrupa solo.',
      'Usa VOTOS para multivotar (cada participante reparte 3 a 5 puntos): las ideas más votadas pasan al Ishikawa.',
      'Las ideas sin categoría quedan aparte: reubícalas o crea una categoría nueva antes de cerrar la sesión.',
      'Cierra con COMENTARIOS: acuerdos, ideas descartadas y quién sigue con qué.'
    ],
    blocks: [
      { type:'fields', title:'BRAINSTORMING — ENCABEZADO', cols:3, items:[
        { k:'team',     label:'TEAM', input:'textarea', rows:3, w:1,
          ph:'Integrantes de la sesión (uno por línea)' },
        { k:'date',     label:'DATE', input:'date' },
        { k:'proyecto', label:'PROJECT NAME', input:'text', ph:'Nombre del proyecto de mejora' }
      ]},
      { type:'grid', key:'cats', title:'CATEGORIES — Categorías de afinidad', min:5, max:12,
        addLabel:'Agregar categoría',
        cols:[
          { k:'cat',  label:'CATEGORIES', input:'text', w:'2fr',
            ph:'Ej.: Mediciones, Materiales, Mano de Obra, Medio Ambiente, Métodos, Maquinaria' },
          { k:'desc', label:'¿QUÉ AGRUPA?', input:'text', w:'3fr',
            ph:'Qué tipo de ideas van en esta categoría' }
        ]
      },
      { type:'grid', key:'ideas', title:'IDEAS — LLUVIA DE IDEAS', min:8, max:120,
        addLabel:'Agregar idea',
        cols:(d) => [
          { k:'idea',  label:'IDEA / CAUSA POSIBLE', input:'text', w:'4fr',
            ph:'Escribe la idea tal como la dijo el participante' },
          { k:'cat',   label:'CATEGORIA (AFFINITY)', input:'select', w:'2fr', opts: catList(d) },
          { k:'quien', label:'PROPONE', input:'text', w:'1fr' },
          { k:'votos', label:'VOTOS', input:'number', step:1, align:'right', w:90,
            help:'Multivotación del equipo (opcional)' }
        ],
        foot:[
          { k:'idea',  label:'TOTAL IDEAS' },
          { k:'votos', calc:(rows) => sum(rows, 'votos'), fmt:'n0' }
        ]
      },
      { type:'diagram', kind:'affinity', key:'aff', h:460,
        title:'AFFINITY DIAGRAM — Ideas agrupadas por categoría',
        tool:'analizar.brainstorming', grid:'ideas', textField:'idea', catField:'cat',
        catsGrid:'cats', catsField:'cat', editable:true, movable:true,
        catsFrom:(d) => catList(d),
        data:(d) => affinity(d)
      },
      { type:'fields', title:'CIERRE DE LA SESIÓN', cols:1, items:[
        { k:'comentarios', label:'COMENTARIOS / ACUERDOS', input:'textarea', rows:3, w:1,
          ph:'Acuerdos, ideas descartadas y responsables del siguiente paso' },
        { k:'ideasTxt', label:'IDEAS (texto consolidado — se exporta a B10:D17 del Excel)',
          input:'textarea', rows:5, ro:true,
          calc:(d) => filled(arr(d.ideas), 'idea')
            .map((r, i) => (i + 1) + '. ' + txt(r.idea) + (txt(r.cat) ? '  [' + txt(r.cat) + ']' : ''))
            .join('\n') },
        { k:'catsTxt', label:'CATEGORIES (texto consolidado — se exporta a D5:D9 del Excel)',
          input:'textarea', rows:3, ro:true,
          calc:(d) => catList(d).join('\n') }
      ]},
      { type:'chart', kind:'bar', title:'Ideas por categoría', h:300,
        data:(d) => {
          const a = affinity(d);
          return { labels: a.groups.map(g => g.cat).concat(a.sin.length ? ['(SIN CATEGORÍA)'] : []),
                   values: a.groups.map(g => g.items.length).concat(a.sin.length ? [a.sin.length] : []) };
        }},
      { type:'cards', title:'RESULTADO DE LA SESIÓN', items:(d) => {
        const a = affinity(d), rows = filled(arr(d.ideas), 'idea');
        const top = rows.slice().sort((x, y) => num(y.votos) - num(x.votos))[0];
        const vacias = a.groups.filter(g => !g.items.length).length;
        return [
          { label:'IDEAS GENERADAS', value: fmt(rows.length, 'n0'),
            tone: rows.length >= 15 ? 'ok' : (rows.length ? 'warn' : ''),
            hint:'Una sesión productiva genera 15 ideas o más' },
          { label:'CATEGORÍAS (AFFINITY)', value: fmt(a.cats.length, 'n0'),
            hint: vacias ? fmt(vacias, 'n0') + ' categoría(s) sin ideas' : 'Todas con ideas' },
          { label:'IDEAS SIN CATEGORÍA', value: fmt(a.sin.length, 'n0'),
            tone: a.sin.length ? 'warn' : 'ok', hint:'Deben quedar en cero antes de pasar al Ishikawa' },
          { label:'IDEA MÁS VOTADA', value: top && num(top.votos) > 0 ? txt(top.idea) : '—',
            tone: top && num(top.votos) > 0 ? 'ok' : '',
            hint: top && num(top.votos) > 0 ? fmt(num(top.votos), 'n0') + ' voto(s)' : 'Aún sin multivotación' }
        ];
      }},
      { type:'note', tone:'info', text:'Las CATEGORIES de este diagrama de afinidad son las espinas del Ishikawa: si usas las 6M (Mediciones, Materiales, Mano de Obra, Medio Ambiente, Métodos, Maquinaria) las ideas pasan directo al diagrama de causa y efecto.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ team:'B5', date:'C5', proyecto:'C18', ideasTxt:'B10', catsTxt:'D5', comentarios:'B20' },
      diagrams:[{ key:'aff', kind:'affinity', anchor:'E5', w:8, h:14 }]
    },
    bi: (d) => {
      const a = affinity(d), rows = filled(arr(d.ideas), 'idea');
      const top = rows.slice().sort((x, y) => num(y.votos) - num(x.votos))[0];
      return {
        bsIdeas: rows.length,
        bsCategorias: a.cats.length,
        bsSinCategoria: a.sin.length,
        bsVotos: sum(arr(d.ideas), 'votos'),
        bsIdeaTop: top && num(top.votos) > 0 ? txt(top.idea) : ''
      };
    }
  };

  /* ======================================================================
     2 · DIAGRAMAS ISHIKAWA  (6M + 4P de servicios)
     ==================================================================== */
  const T_ISH = {
    id: 'analizar.diagramas_ishikawa',
    mod: 'ANALIZAR',
    sheet: 'Diagramas Ishikawa',
    title: 'ISHIKAWA DIAGRAM - CAUSE AND EFFECT',
    desc: 'Dos diagramas de causa y efecto (espina de pescado): el clásico de las 6M para procesos y el de las 4P (Politicas, Personal, Procedimientos, Instalaciones) para servicios.',
    guide: [
      'Escribe primero el PROBLEMA en la cabeza del pescado: con dato, lugar y periodo (es el efecto, no la causa).',
      'Reparte las causas de la lluvia de ideas en las espinas; una causa por renglón de la tabla.',
      'Por cada causa pregunta «¿por qué ocurre?» y anota la SUBCAUSA (nivel 2): ahí suele estar la causa raíz.',
      'No confundas causa con síntoma ni con solución: la causa se puede verificar con datos.',
      'Usa el diagrama de las 4P cuando el problema sea de servicio (agenda, autorizaciones, atención al afiliado).',
      'Marca las causas más probables y llévalas a «Validacion de causas» con el botón de importar.'
    ],
    blocks: [
      { type:'fields', title:'DIAGRAMA 1 — 6M (PROCESOS)', cols:4, items:[
        { k:'problema1', label:'Problema (efecto)', input:'textarea', rows:2, w:4,
          ph:'Ej.: el 32% de las citas de terapia se reprograman en la sede norte (ene-jun)' },
        { k:'m1', label:'Espina 1 (arriba)', input:'text', ph:'Mediciones' },
        { k:'m2', label:'Espina 2 (arriba)', input:'text', ph:'Materiales' },
        { k:'m3', label:'Espina 3 (arriba)', input:'text', ph:'Mano de Obra' },
        { k:'m4', label:'Espina 4 (abajo)',  input:'text', ph:'Medio Ambiente' },
        { k:'m5', label:'Espina 5 (abajo)',  input:'text', ph:'Métodos' },
        { k:'m6', label:'Espina 6 (abajo)',  input:'text', ph:'Maquinaria' }
      ]},
      { type:'grid', key:'causas', title:'CAUSAS POR ESPINA (los dos diagramas)', min:12, max:120,
        addLabel:'Agregar causa',
        cols:(d) => [
          { k:'diag',     label:'DIAGRAMA', input:'select', w:110, opts:['6M','4P'] },
          { k:'espina',   label:'ESPINA / CATEGORIA', input:'select', w:170, opts: espinasAll(d) },
          { k:'causa',    label:'CAUSA (nivel 1)', input:'text', w:'3fr',
            ph:'¿Qué hace que ocurra el problema?' },
          { k:'subcausa', label:'SUBCAUSA (nivel 2 — ¿por qué?)', input:'text', w:'3fr',
            ph:'¿Por qué ocurre esa causa?' },
          { k:'obs',      label:'EVIDENCIA / OBSERVACIONES', input:'text', w:'2fr' }
        ],
        foot:[ { k:'diag', label:'TOTAL CAUSAS' },
               { k:'causa', calc:(rows) => filled(rows, 'causa').length, fmt:'n0' },
               { k:'subcausa', calc:(rows) => filled(rows, 'subcausa').length, fmt:'n0' } ]
      },
      { type:'diagram', kind:'ishikawa', key:'ish6m', h:540,
        title:'ISHIKAWA DIAGRAM - CAUSE AND EFFECT (6M)',
        tool:'analizar.diagramas_ishikawa', grid:'causas', diag:'6M', levels:2, editable:true,
        problemKey:'problema1', spineKeys: M6.map(s => s.k),
        headFrom:(d) => or(d.problema1, 'Problema'),
        spinesFrom:(d) => spinesOf(d, M6),
        data:(d) => ishData(d, M6, '6M', d.problema1)
      },
      { type:'fields', title:'DIAGRAMA 2 — 4P (SERVICIOS)', cols:4, items:[
        { k:'problema2', label:'Problema (efecto)', input:'textarea', rows:2, w:4,
          ph:'Problema del servicio prestado al afiliado / a la empresa afiliada a la ARL' },
        { k:'p1', label:'Espina 1 (arriba)', input:'text', ph:'Politicas' },
        { k:'p2', label:'Espina 2 (arriba)', input:'text', ph:'Personal' },
        { k:'p3', label:'Espina 3 (abajo)',  input:'text', ph:'Procedimientos' },
        { k:'p4', label:'Espina 4 (abajo)',  input:'text', ph:'Instalaciones' }
      ]},
      { type:'diagram', kind:'ishikawa', key:'ish4p', h:480,
        title:'ISHIKAWA DIAGRAM - CAUSE AND EFFECT (4P DE SERVICIOS)',
        tool:'analizar.diagramas_ishikawa', grid:'causas', diag:'4P', levels:2, editable:true,
        problemKey:'problema2', spineKeys: P4.map(s => s.k),
        headFrom:(d) => or(d.problema2, 'Problema'),
        spinesFrom:(d) => spinesOf(d, P4),
        data:(d) => ishData(d, P4, '4P', d.problema2)
      },
      { type:'chart', kind:'hbar', title:'Causas identificadas por espina', h:320,
        data:(d) => {
          const nombres = espinasAll(d), c = {};
          nombres.forEach(n => { c[n.toUpperCase()] = 0; });
          ishAll(d).forEach(x => { const k = x.spine.toUpperCase();
            if (c[k] !== undefined) c[k] += 1; });
          return { labels: nombres, values: nombres.map(n => c[n.toUpperCase()]) };
        }},
      { type:'cards', title:'RESUMEN DEL ANÁLISIS CAUSA-EFECTO', items:(d) => {
        const t6 = ishRows(d, '6M').length, t4 = ishRows(d, '4P').length;
        const all = ishAll(d), subs = filled(arr(d.causas), 'subcausa').length;
        const nombres = espinasAll(d), c = {};
        all.forEach(x => { const k = x.spine.toUpperCase(); c[k] = (c[k] || 0) + 1; });
        let top = '', tv = 0;
        nombres.forEach(n => { const v = c[n.toUpperCase()] || 0; if (v > tv){ tv = v; top = n; } });
        return [
          { label:'CAUSAS 6M', value: fmt(t6, 'n0') },
          { label:'CAUSAS 4P', value: fmt(t4, 'n0') },
          { label:'SUBCAUSAS (NIVEL 2)', value: fmt(subs, 'n0'),
            tone: subs ? 'ok' : 'warn', hint:'Sin nivel 2 el análisis se queda en síntomas' },
          { label:'ESPINA CON MÁS CAUSAS', value: top || '—',
            tone: top ? 'warn' : '', hint: top ? fmt(tv, 'n0') + ' causa(s)' : 'Aún sin causas registradas' }
        ];
      }},
      { type:'note', tone:'info', text:(d, ctx) => {
        const b = dataOf(ctx, 'analizar.brainstorming');
        const n = filled(arr(b.ideas), 'idea').length;
        return n ? 'En «Brainstorming» hay ' + n + ' idea(s) registradas: pásalas a las espinas de este diagrama antes de validar.'
                 : 'Empieza por «Brainstorming»: las ideas agrupadas por afinidad son las causas que van en cada espina.';
      }},
      { type:'note', tone:'warn', text:'El Ishikawa muestra causas POSIBLES, no causas probadas. Ninguna causa pasa a MEJORAR sin verificarse con datos en «Validacion de causas».' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ m1:'C5', m2:'I5', m3:'O5', problema1:'S23', m4:'C49', m5:'I49', m6:'O49',
               p1:'C59', p2:'K59', problema2:'Q77', p3:'C103', p4:'K103' },
      diagrams:[
        { key:'ish6m', kind:'ishikawa', anchor:'C8',  w:18, h:38 },
        { key:'ish4p', kind:'ishikawa', anchor:'C62', w:18, h:38 }
      ]
    },
    bi: (d) => {
      const all = ishAll(d), nombres = espinasAll(d), c = {};
      all.forEach(x => { const k = x.spine.toUpperCase(); c[k] = (c[k] || 0) + 1; });
      let top = '', tv = 0;
      nombres.forEach(n => { const v = c[n.toUpperCase()] || 0; if (v > tv){ tv = v; top = n; } });
      return {
        ishCausas6M: ishRows(d, '6M').length,
        ishCausas4P: ishRows(d, '4P').length,
        ishTotalCausas: all.length,
        ishSubcausas: filled(arr(d.causas), 'subcausa').length,
        ishEspinaCritica: top
      };
    }
  };

  /* ======================================================================
     3 · 5 WHY´S  (dos bloques idénticos)
     ==================================================================== */
  const T_5W = {
    id: 'analizar.5_whys',
    mod: 'ANALIZAR',
    sheet: '5 Why´s',
    title: '5 Whys - 5 Por que',
    desc: 'Cadena de porqués: del problema a la causa raíz preguntando cinco veces «¿por qué?», confirmando cada nivel con datos (Is confirmation necessary? / How is this confirmed).',
    guide: [
      'Parte de un problema concreto y medido, no de una opinión general.',
      'Cada «Why» debe ser la causa del renglón anterior: si lo lees al revés con «por lo tanto», la cadena debe tener sentido.',
      'Marca «Is confirmation necessary? = SI» cuando el porqué sea una hipótesis y escribe con qué dato se confirma.',
      'Detente cuando llegues a algo sobre lo que el equipo puede actuar (proceso, política, capacitación): esa es la causa raíz.',
      'Si aparecen dos ramas distintas usa el segundo bloque: un análisis por rama, no mezcles.',
      'Las causas raíz encontradas se importan a «Validacion de causas» para probarlas con datos.'
    ],
    blocks: [
      { type:'fields', title:'5 Whys - 5 Por que · ANÁLISIS 1', cols:3, items: whyItems('w1') },
      { type:'diagram', kind:'fivewhy', key:'fw1', h:380,
        title:'5 WHY´S — CADENA DE CAUSALIDAD (ANÁLISIS 1)',
        tool:'analizar.5_whys', flat:true, editable:true,
        problemKey:'w1_problema', rootKey:'w1_raiz',
        steps: W.map(i => ({ n:i, why: wk('w1', 'why', i), nec: wk('w1', 'nec', i), how: wk('w1', 'how', i) })),
        data:(d) => fiveWhy(d, 'w1')
      },
      { type:'fields', title:'5 Whys - 5 Por que · ANÁLISIS 2', cols:3, items: whyItems('w2') },
      { type:'diagram', kind:'fivewhy', key:'fw2', h:380,
        title:'5 WHY´S — CADENA DE CAUSALIDAD (ANÁLISIS 2)',
        tool:'analizar.5_whys', flat:true, editable:true,
        problemKey:'w2_problema', rootKey:'w2_raiz',
        steps: W.map(i => ({ n:i, why: wk('w2', 'why', i), nec: wk('w2', 'nec', i), how: wk('w2', 'how', i) })),
        data:(d) => fiveWhy(d, 'w2')
      },
      { type:'cards', title:'ESTADO DE LOS DOS ANÁLISIS', items:(d) => {
        const a = fiveWhy(d, 'w1'), b = fiveWhy(d, 'w2');
        const nv = f => f.steps.filter(s => s.why).length;
        const pend = f => f.steps.filter(s => s.nec === 'SI' && !s.how).length;
        const tp = pend(a) + pend(b);
        return [
          { label:'NIVELES — ANÁLISIS 1', value: fmt(nv(a), 'n0') + ' / 5',
            tone: nv(a) >= 5 ? 'ok' : (nv(a) ? 'warn' : ''),
            hint: a.root ? 'Causa raíz declarada' : 'Falta la Root Cause' },
          { label:'NIVELES — ANÁLISIS 2', value: fmt(nv(b), 'n0') + ' / 5',
            tone: nv(b) >= 5 ? 'ok' : (nv(b) ? 'warn' : ''),
            hint: b.root ? 'Causa raíz declarada' : 'Falta la Root Cause' },
          { label:'CONFIRMACIONES PENDIENTES', value: fmt(tp, 'n0'),
            tone: tp ? 'bad' : 'ok',
            hint:'Porqués marcados con SI que aún no dicen cómo se confirman' },
          { label:'CAUSAS RAÍZ DECLARADAS', value: fmt([a.root, b.root].filter(Boolean).length, 'n0') + ' / 2',
            tone: (a.root || b.root) ? 'ok' : 'warn' }
        ];
      }},
      { type:'note', tone:'warn', text:(d) => {
        const p = ['w1', 'w2'].reduce((a, k) => a + fiveWhy(d, k).steps
          .filter(s => s.nec === 'SI' && !s.how).length, 0);
        return p ? 'Hay ' + p + ' porqué(s) marcados como «Is confirmation necessary? = SI» sin indicar cómo se confirman: complétalos antes de dar por cerrada la cadena.' : '';
      }},
      { type:'note', tone:'info', text:'Si al llegar al quinto «por qué» la respuesta sigue siendo «porque la gente no cumple», la cadena está incompleta: pregunta por qué el proceso permite que no se cumpla.' },
      { type:'insight' }
    ],
    /* Celdas del formato original (escalera diagonal de cuadros combinados).
       Bloque 1: filas 4-36 · Bloque 2: idéntico, desplazado 36 filas. */
    xl: { file: XLF,
      fields:{
        w1_problema:'B6',
        w1_why1:'H6',  w1_nec1:'P7',  w1_how1:'S6',
        w1_why2:'K12', w1_nec2:'R13', w1_how2:'U12',
        w1_why3:'N18', w1_nec3:'T19', w1_how3:'Y18',
        w1_why4:'Q24', w1_nec4:'V25', w1_how4:'AA24',
        w1_why5:'S30', w1_nec5:'X31', w1_how5:'AC30',
        w1_raiz:'W36',
        w2_problema:'B42',
        w2_why1:'H42', w2_nec1:'P43', w2_how1:'S42',
        w2_why2:'K48', w2_nec2:'R49', w2_how2:'U48',
        w2_why3:'N54', w2_nec3:'T55', w2_how3:'Y54',
        w2_why4:'Q60', w2_nec4:'V61', w2_how4:'AA60',
        w2_why5:'S66', w2_nec5:'X67', w2_how5:'AC66',
        w2_raiz:'W72'
      }
    },
    bi: (d) => {
      const a = fiveWhy(d, 'w1'), b = fiveWhy(d, 'w2');
      const nv = f => f.steps.filter(s => s.why).length;
      return {
        whyNiveles1: nv(a),
        whyNiveles2: nv(b),
        whyRaices: [a.root, b.root].filter(Boolean).length,
        whyConfirmaciones: [a, b].reduce((x, f) => x + f.steps.filter(s => s.nec === 'SI' && s.how).length, 0),
        whyPendientes: [a, b].reduce((x, f) => x + f.steps.filter(s => s.nec === 'SI' && !s.how).length, 0)
      };
    }
  };

  /* ======================================================================
     4 · TREE DIAGRAM / WHY
     ==================================================================== */
  const T_TREE = {
    id: 'analizar.tree_diagram',
    mod: 'ANALIZAR',
    sheet: 'Tree diagram',
    title: 'TREE DIAGRAM/ WHY — Árbol de porqués',
    desc: 'Despliega el problema en ramas WHY de varios niveles hasta llegar a las hojas ROOT CAUSE; sirve cuando el problema tiene más de una causa raíz simultánea.',
    guide: [
      'Escribe el problema en la raíz: es el mismo enunciado del project charter y del Ishikawa.',
      'Cada renglón es un nodo: NIVEL 1 son las ramas principales, NIVEL 2 las subcausas, y así sucesivamente.',
      'El árbol se arma por indentación: un nodo cuelga del nodo anterior que tenga un nivel menor.',
      'Marca TIPO = ROOT CAUSE en las hojas donde ya no tiene sentido seguir preguntando «¿por qué?».',
      'Verifica el árbol al revés: leyendo de la hoja hacia la raíz con «esto causa aquello» debe sonar lógico.',
      'Lleva las hojas ROOT CAUSE a «Validacion de causas» para probarlas con datos.'
    ],
    blocks: [
      { type:'fields', title:'TREE DIAGRAM/ WHY', cols:1, items:[
        { k:'problema', label:'Problem — PROBLEMA (raíz del árbol)', input:'textarea', rows:2,
          ph:'Enuncia el problema con dato, lugar y periodo' }
      ]},
      { type:'grid', key:'nodos', title:'NODOS DEL ÁRBOL (esquema por niveles)', min:9, max:80,
        addLabel:'Agregar nodo',
        cols:[
          { k:'nivel',  label:'NIVEL', input:'select', w:100, opts:['1','2','3','4','5'],
            help:'1 = rama principal que cuelga del problema' },
          { k:'tipo',   label:'TIPO', input:'select', w:140, opts: TIPOS_TREE,
            help:'ROOT CAUSE marca la hoja como causa raíz' },
          { k:'texto',  label:'WHY / ROOT CAUSE', input:'text', w:'4fr',
            ph:'¿Por qué ocurre lo del nivel anterior?' },
          { k:'evid',   label:'EVIDENCIA / DATO', input:'text', w:'2fr' },
          { k:'padre',  label:'CUELGA DE', ro:true, w:180,
            calc:(r, i, rows, d) => {
              if (!txt(r.texto)) return '';
              const lv = Math.max(1, Math.round(num(r.nivel) || 1));
              for (let j = i - 1; j >= 0; j--){
                const p = rows[j];
                if (txt(p.texto) && Math.max(1, Math.round(num(p.nivel) || 1)) < lv) return txt(p.texto);
              }
              return or(d.problema, 'Problem');
            } }
        ],
        foot:[ { k:'nivel', label:'TOTAL NODOS' },
               { k:'texto', calc:(rows) => filled(rows, 'texto').length, fmt:'n0' } ]
      },
      { type:'diagram', kind:'tree', key:'tree', h:520,
        title:'TREE DIAGRAM/ WHY',
        tool:'analizar.tree_diagram', grid:'nodos', textField:'texto', levelField:'nivel',
        typeField:'tipo', types: TIPOS_TREE, rootFlag:'ROOT CAUSE', editable:true, maxLevel:5,
        rootFrom:(d) => or(d.problema, 'Problem'),
        data:(d) => treeData(d)
      },
      { type:'cards', title:'ESTRUCTURA DEL ÁRBOL', items:(d) => {
        const nodos = filled(arr(d.nodos), 'texto');
        const raices = treeRaices(d);
        const niveles = nodos.map(r => Math.max(1, Math.round(num(r.nivel) || 1)));
        const prof = niveles.length ? Math.max.apply(null, niveles) : 0;
        const sinEvid = raices.filter(r => !txt(r.evid)).length;
        return [
          { label:'NODOS DEL ÁRBOL', value: fmt(nodos.length, 'n0') },
          { label:'PROFUNDIDAD (NIVELES)', value: fmt(prof, 'n0'),
            tone: prof >= 3 ? 'ok' : (prof ? 'warn' : ''),
            hint:'Menos de 3 niveles suele quedarse en los síntomas' },
          { label:'HOJAS ROOT CAUSE', value: fmt(raices.length, 'n0'),
            tone: raices.length ? 'ok' : 'warn' },
          { label:'ROOT CAUSE SIN EVIDENCIA', value: fmt(sinEvid, 'n0'),
            tone: sinEvid ? 'bad' : 'ok', hint:'Toda causa raíz debe sustentarse con un dato' }
        ];
      }},
      { type:'note', tone:'info', text:(d) => {
        const r = treeRaices(d).map(x => txt(x.texto));
        return r.length ? 'Causas raíz marcadas en el árbol: ' + r.join(' · ') + '. Llévalas a «Validacion de causas».'
                        : 'Marca TIPO = ROOT CAUSE en las hojas del árbol: son las causas que hay que verificar con datos.';
      }},
      { type:'insight' }
    ],
    /* El árbol del formato original son cuadros de dibujo combinados
       (H3:J5, H8:J10, D13:F15, K13:M15, D19:F21, K19:M21, B25:D28, F25:H28,
        K25:M28, B31:D34, F31:H34): se exporta como imagen del lienzo. */
    xl: { file: XLF,
      fields:{ problema:'H3' },
      diagrams:[{ key:'tree', kind:'tree', anchor:'B7', w:12, h:28 }]
    },
    bi: (d) => {
      const nodos = filled(arr(d.nodos), 'texto');
      const niveles = nodos.map(r => Math.max(1, Math.round(num(r.nivel) || 1)));
      return {
        treeNodos: nodos.length,
        treeNiveles: niveles.length ? Math.max.apply(null, niveles) : 0,
        treeCausasRaiz: treeRaices(d).length
      };
    }
  };

  /* ======================================================================
     5 · VALIDACION DE CAUSAS  (PLAN DE VERIFICACION DE CAUSAS)
     ==================================================================== */
  const T_VAL = {
    id: 'analizar.validacion_de_causas',
    mod: 'ANALIZAR',
    sheet: 'Validacion de causas',
    title: 'PLAN DE VERIFICACION DE CAUSAS',
    desc: 'Prueba con datos cada causa posible: qué acción de verificación se hace, quién la hace, cuándo, y si quedó confirmada (CHECK = 1 pinta la fila de verde).',
    guide: [
      'Trae las causas posibles con los botones «Causas del Ishikawa» y «Causas de los 5 Why´s»: no las vuelvas a escribir.',
      'La VERIFICATION ACTION debe ser observable: medir, contar, comparar, muestrear o hacer una prueba controlada.',
      'Asigna RESPONSIBLE y DATE OF VALIDATION: una verificación sin dueño ni fecha no se hace.',
      'CHECK = 1 solo cuando el dato confirma la causa; si el dato la descarta, deja 0 y explícalo en COMMENTS.',
      'Solo las causas con CHECK = 1 pasan a MEJORAR: sobre las demás no se invierte tiempo ni dinero.'
    ],
    blocks: [
      { type:'grid', key:'rows', title:'PLAN DE VERIFICACION DE CAUSAS', min:12, max:60,
        addLabel:'Agregar causa posible', tools: BTN_IMPORT,
        cols:[
          { k:'causa',       label:'POSSIBLE CAUSE', input:'text', w:'3fr',
            ph:'Causa tomada del Ishikawa, del 5 Why o del árbol' },
          { k:'accion',      label:'VERIFICATION ACTION', input:'text', w:'3fr',
            ph:'¿Con qué dato o prueba se confirma o se descarta?' },
          { k:'responsable', label:'RESPONSIBLE', input:'text', w:150 },
          { k:'fecha',       label:'DATE OF VALIDATION', input:'date', w:150 },
          { k:'check',       label:'CHECK (1=SI)', input:'number', step:1, align:'right', w:110,
            help:'1 = causa confirmada con datos (la celda se pinta de verde)',
            tone:(v) => num(v) === 1 ? 'ok' : '' },
          { k:'comentarios', label:'COMMENTS', input:'text', w:'3fr' },
          { k:'estado',      label:'ESTADO', ro:true, w:130,
            calc:(r) => txt(r.causa) === '' ? ''
                      : (num(r.check) === 1 ? 'VERIFICADA'
                      : (txt(r.accion) ? 'EN VERIFICACION' : 'SIN PLAN')),
            tone:(v) => v === 'VERIFICADA' ? 'ok' : (v === 'SIN PLAN' ? 'bad' : (v ? 'warn' : '')) }
        ],
        foot:[
          { k:'causa', label:'TOTAL CAUSAS' },
          { k:'check', calc:(rows) => arr(rows).filter(r => num(r.check) === 1).length, fmt:'n0' },
          { k:'estado', calc:(rows) => safeDiv(arr(rows).filter(r => num(r.check) === 1).length,
              filled(rows, 'causa').length), fmt:'p0' }
        ]
      },
      { type:'chart', kind:'pie', title:'Estado de la verificación de causas', h:300,
        data:(d) => {
          const rows = filled(arr(d.rows), 'causa');
          const ok = rows.filter(r => num(r.check) === 1).length;
          const enc = rows.filter(r => num(r.check) !== 1 && txt(r.accion)).length;
          const sin = rows.length - ok - enc;
          return { labels:['VERIFICADAS (CHECK=1)', 'EN VERIFICACION', 'SIN PLAN'],
                   values:[ok, enc, sin] };
        }},
      { type:'cards', title:'AVANCE DE LA VERIFICACIÓN', items:(d) => {
        const rows = filled(arr(d.rows), 'causa');
        const ok = rows.filter(r => num(r.check) === 1).length;
        const sinResp = rows.filter(r => !txt(r.responsable)).length;
        const vencidas = rows.filter(r => num(r.check) !== 1 && txt(r.fecha) &&
          dDiff(r.fecha, hoy()) > 0).length;
        return [
          { label:'CAUSAS POSIBLES', value: fmt(rows.length, 'n0') },
          { label:'CAUSAS VERIFICADAS', value: fmt(ok, 'n0'),
            tone: ok ? 'ok' : 'warn', hint:'CHECK = 1' },
          { label:'% VERIFICACION', value: fmt(safeDiv(ok, rows.length), 'p0'),
            tone: safeDiv(ok, rows.length) >= 0.6 ? 'ok' : 'warn' },
          { label:'SIN RESPONSABLE', value: fmt(sinResp, 'n0'), tone: sinResp ? 'bad' : 'ok' },
          { label:'FECHA VENCIDA', value: fmt(vencidas, 'n0'), tone: vencidas ? 'bad' : 'ok',
            hint:'Verificaciones sin cerrar cuya fecha ya pasó' }
        ];
      }},
      { type:'note', tone:'info', text:(d, ctx) => {
        const n = causasIshikawa(ctx).length + causas5Why(ctx).length;
        return n ? 'Hay ' + n + ' causa(s) disponibles en el Ishikawa y los 5 Why´s: usa los botones de la tarjeta para traerlas sin volver a escribirlas.'
                 : 'Diligencia primero el Ishikawa o los 5 Why´s: desde allí se importan las causas posibles a esta tabla.';
      }},
      { type:'note', tone:'warn', text:'Una causa NO se valida por consenso del equipo: se valida con un dato. Si no hay dato, la acción de verificación es diseñar cómo obtenerlo.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      grids:[{ key:'rows', row:5, endRow:16,
        cols:{ causa:'B', accion:'C', responsable:'E', fecha:'F', check:'G', comentarios:'H' } }]
    },
    bi: (d) => {
      const rows = filled(arr(d.rows), 'causa');
      const ok = rows.filter(r => num(r.check) === 1).length;
      return {
        valCausas: rows.length,
        valVerificadas: ok,
        valPendientes: rows.length - ok,
        valPctVerificacion: safeDiv(ok, rows.length),
        valSinResponsable: rows.filter(r => !txt(r.responsable)).length
      };
    }
  };

  /* ======================================================================
     6 · DESCRIPCION CAUSA RAIZ
     ==================================================================== */
  const T_RAIZ = {
    id: 'analizar.descripcion_causa_raiz',
    mod: 'ANALIZAR',
    sheet: 'Descripcion causa raiz',
    title: 'ESTABLECE LA CAUSA RAIZ DEL PROBLEMA',
    desc: 'Cierra la fase ANALIZAR: un problema, las causas raíz verificadas y la descripción de cómo cada una produce el problema.',
    guide: [
      'PROBLEMA: el mismo enunciado del project charter, con su dato de línea base.',
      'CAUSA RAIZ: escribe solo las causas que quedaron con CHECK = 1 en el plan de verificación.',
      'DESCRIPCION: explica el mecanismo — cómo esa causa produce el efecto y con qué evidencia se probó.',
      'Si una causa raíz no se puede intervenir, no es causa raíz: sigue bajando un nivel más.',
      'La conclusión es el puente hacia MEJORAR: cada causa raíz debe originar al menos una solución.'
    ],
    blocks: [
      { type:'fields', title:'PROBLEMA', cols:1, items:[
        { k:'problema', label:'PROBLEMA', input:'textarea', rows:5,
          ph:'Enunciado del problema con dato, lugar y periodo (línea base)' }
      ]},
      { type:'fields', title:'CAUSA RAIZ / DESCRIPCION', cols:2, items:[
        { k:'causa1', label:'CAUSA RAIZ 1', input:'textarea', rows:5,
          ph:'Causa raíz verificada (CHECK = 1)' },
        { k:'desc1',  label:'DESCRIPCION 1', input:'textarea', rows:5,
          ph:'Cómo produce el problema y con qué evidencia quedó probada' },
        { k:'causa2', label:'CAUSA RAIZ 2', input:'textarea', rows:5,
          ph:'Segunda causa raíz verificada (si aplica)' },
        { k:'desc2',  label:'DESCRIPCION 2', input:'textarea', rows:5,
          ph:'Cómo produce el problema y con qué evidencia quedó probada' }
      ]},
      { type:'fields', title:'CONCLUSION', cols:1, items:[
        { k:'conclusion', label:'CONCLUSION DEL ANALISIS', input:'textarea', rows:3,
          ph:'Qué se concluye del análisis y qué se va a intervenir en MEJORAR' }
      ]},
      { type:'cards', title:'CIERRE DE LA FASE ANALIZAR', items:(d, ctx) => {
        const v = dataOf(ctx, 'analizar.validacion_de_causas');
        const ok = arr(v.rows).filter(r => num(r.check) === 1 && txt(r.causa)).length;
        const dec = [d.causa1, d.causa2].filter(x => txt(x)).length;
        const des = [txt(d.causa1) && txt(d.desc1), txt(d.causa2) && txt(d.desc2)].filter(Boolean).length;
        return [
          { label:'CAUSAS RAÍZ DECLARADAS', value: fmt(dec, 'n0') + ' / 2',
            tone: dec ? 'ok' : 'warn' },
          { label:'CON DESCRIPCIÓN', value: fmt(des, 'n0'),
            tone: des === dec && dec ? 'ok' : 'warn' },
          { label:'CAUSAS VERIFICADAS (CHECK=1)', value: fmt(ok, 'n0'),
            tone: ok ? 'ok' : 'bad', hint:'Vienen de «Validacion de causas»' },
          { label:'CONCLUSIÓN', value: txt(d.conclusion) ? 'ESCRITA' : 'PENDIENTE',
            tone: txt(d.conclusion) ? 'ok' : 'warn' }
        ];
      }},
      { type:'note', tone:'info', text:(d, ctx) => {
        const v = dataOf(ctx, 'analizar.validacion_de_causas');
        const ok = arr(v.rows).filter(r => num(r.check) === 1 && txt(r.causa)).map(r => txt(r.causa));
        return ok.length ? 'Causas ya VERIFICADAS en el plan de verificación: ' + ok.join(' · ') + '.'
                         : 'Todavía no hay causas con CHECK = 1 en «Validacion de causas»: la causa raíz se sustenta con datos, no con opinión.';
      }},
      { type:'note', tone:'warn', text:(d) => (txt(d.causa1) || txt(d.causa2)) ? '' :
        'Sin causa raíz declarada no se puede abrir la fase MEJORAR: las soluciones se diseñan contra la causa, no contra el síntoma.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ problema:'B4', causa1:'C4', desc1:'D4', causa2:'C10', desc2:'D10', conclusion:'B16' }
    },
    bi: (d) => ({
      raizDeclaradas: [d.causa1, d.causa2].filter(x => txt(x)).length,
      raizDescritas: [txt(d.causa1) && txt(d.desc1), txt(d.causa2) && txt(d.desc2)].filter(Boolean).length,
      raizConclusion: txt(d.conclusion) !== '' ? 1 : 0
    })
  };

  /* ======================================================================
     7 · A3 ANALIZAR
     ==================================================================== */
  const T_A3 = {
    id: 'analizar.a3_analizar',
    mod: 'ANALIZAR',
    sheet: 'A3 Analizar',
    title: 'A3 — ANALIZAR',
    desc: 'Resumen en una página de la fase ANALIZAR: análisis de la causa raíz, causas potenciales, su validación y la causa raíz identificada.',
    guide: [
      'El A3 se escribe al final de la fase, cuando la causa raíz ya está verificada con datos.',
      'ANALISIS DE LA CAUSA RAIZ: cómo se analizó (Ishikawa, 5 Why´s, árbol) y qué mostró el análisis.',
      'Inserta la imagen del Ishikawa: exporta el diagrama con el botón ⤓ PNG y súbela en el recuadro.',
      'CAUSAS POTENCIALES: la lista corta de causas candidatas; VALIDACION: el resultado de probarlas con datos.',
      'IDENTIFICACION DE LA CAUSA RAIZ: una redacción clara y accionable que abra la fase MEJORAR.'
    ],
    blocks: [
      { type:'a3', title:'A3 — ANALIZAR', cols:2, areas:[
        { k:'analisis', label:'ANALISIS DE LA CAUSA RAIZ', kind:'text', h:240, w:1,
          ph:'Herramientas usadas (Ishikawa, 5 Why´s, árbol), datos analizados y hallazgos principales' },
        { k:'ishikawa_img', label:'DIAGRAMA DE CAUSA Y EFECTO (imagen)', kind:'image', h:240, w:1 },
        { k:'causas', label:'CAUSAS POTENCIALES', kind:'text', h:210, w:1,
          ph:'Lista corta de causas candidatas surgidas del análisis' },
        { k:'validacion_ref', label:'VALIDACION DE CAUSAS POTENCIALES', kind:'ref',
          ref:'analizar.validacion_de_causas', h:210, w:1 },
        { k:'raiz', label:'IDENTIFICACION DE LA CAUSA RAIZ DEL PROBLEMA', kind:'text', h:220, w:2,
          ph:'Causa raíz verificada, evidencia que la sustenta y su efecto sobre el indicador' }
      ]},
      { type:'fields', title:'RESUMEN DE LA VALIDACIÓN (se genera solo y se exporta a E14:J22)',
        cols:1, items:[
          { k:'valResumen', label:'VALIDACION DE CAUSAS POTENCIALES', input:'textarea', rows:6, ro:true,
            calc:(d, ctx) => {
              const v = dataOf(ctx, 'analizar.validacion_de_causas');
              const rows = filled(arr(v.rows), 'causa');
              if (!rows.length) return '';
              return rows.map(r => txt(r.causa) + ' → ' + (txt(r.accion) || 'sin acción de verificación') +
                ' · ' + (num(r.check) === 1 ? 'VERIFICADA' : 'PENDIENTE') +
                (txt(r.responsable) ? ' · ' + txt(r.responsable) : '')).join('\n');
            } }
        ]},
      { type:'cards', title:'INSUMOS DE LA FASE ANALIZAR', items:(d, ctx) => {
        const b = dataOf(ctx, 'analizar.brainstorming');
        const i = dataOf(ctx, 'analizar.diagramas_ishikawa');
        const w = dataOf(ctx, 'analizar.5_whys');
        const v = dataOf(ctx, 'analizar.validacion_de_causas');
        const r = dataOf(ctx, 'analizar.descripcion_causa_raiz');
        const ok = arr(v.rows).filter(x => num(x.check) === 1 && txt(x.causa)).length;
        return [
          { label:'IDEAS (BRAINSTORMING)', value: fmt(filled(arr(b.ideas), 'idea').length, 'n0') },
          { label:'CAUSAS EN EL ISHIKAWA', value: fmt(ishAll(i).length, 'n0') },
          { label:'CADENAS 5 WHY´S', value: fmt(['w1', 'w2']
              .filter(p => fiveWhy(w, p).steps.some(s => s.why)).length, 'n0') + ' / 2' },
          { label:'CAUSAS VERIFICADAS', value: fmt(ok, 'n0'), tone: ok ? 'ok' : 'warn' },
          { label:'CAUSA RAIZ DECLARADA',
            value: [r.causa1, r.causa2].filter(x => txt(x)).length ? 'SI' : 'NO',
            tone: [r.causa1, r.causa2].filter(x => txt(x)).length ? 'ok' : 'bad' }
        ];
      }},
      { type:'note', tone:'info', text:'Todo lo que va en este A3 ya está en las hojas anteriores: aquí solo se resume. Si algo no se puede resumir en una página, es que el análisis todavía no está cerrado.' },
      { type:'note', tone:'warn', text:(d, ctx) => {
        const r = dataOf(ctx, 'analizar.descripcion_causa_raiz');
        return (txt(r.causa1) || txt(r.causa2) || txt(d.raiz)) ? '' :
          'Falta la causa raíz: complétala en «Descripcion causa raiz» y resúmela en el recuadro IDENTIFICACION DE LA CAUSA RAIZ DEL PROBLEMA.';
      }},
      { type:'insight' }
    ],
    xl: { file: XLF,
      fields:{ analisis:'B5', causas:'B14', valResumen:'E14', raiz:'B24' },
      images:[{ k:'ishikawa_img', anchor:'F5', w:5, h:8 }]
    },
    bi: (d) => ({
      a3AnalizarSecciones: [d.analisis, d.causas, d.raiz].filter(x => txt(x) !== '').length,
      a3AnalizarTotalSecciones: 3,
      a3AnalizarImagen: d.ishikawa_img ? 1 : 0
    })
  };

  /* ====================================================================== */
  return [T_BRAIN, T_ISH, T_5W, T_TREE, T_VAL, T_RAIZ, T_A3];

})();

registerTools(SPECS_ANALIZAR);
