/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   SPECS MÓDULO 5 — CONTROLAR  (libro Excel original: 05CONTROLAR.xlsx · 8 hojas)
   ---------------------------------------------------------------------------
   Fuente de verdad: _dump/8f140e27-05CONTROLAR.txt (volcado celda por celda).
   Hojas: Estandar 1 · Estandar 2 · Estandar 3 · Plan de control ·
          Grafico Antes-Despues · A3 Controlar · Project Charter · A3 final
   Las únicas fórmulas del libro están en la hoja «Project Charter»
   (N33/P33/R33 = SUM de los ahorros · K56:K60 y K66:K70 = =D10..=D14 ·
    D69:D73 = =D59..=D63) y están replicadas como `calc` con la misma semántica.
   JavaScript de navegador plano: sin módulos, sin librerías, sin red.
   ========================================================================== */
'use strict';

const SPECS_CONTROLAR = (function(){

  /* ======================================================================
     HELPERS PRIVADOS DEL MÓDULO (no contaminan el ámbito global)
     ==================================================================== */
  const XLF = '05CONTROLAR';

  const T   = (ctx, id) => ((ctx && ctx.all && ctx.all[id]) || {});
  const RS  = (o, k) => (o && Array.isArray(o[k]) ? o[k] : []);
  const txt = v => (v === null || v === undefined ? '' : String(v)).trim();
  const filled = (rows, k) => arr(rows).filter(r => txt(r[k]) !== '');
  function first(){
    for (let i = 0; i < arguments.length; i++){ const v = txt(arguments[i]); if (v) return v; }
    return '';
  }
  const corta  = (s, n) => { const t = txt(s); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
  const lineas = v => txt(v).split(/\r?\n/).map(x => x.trim()).filter(x => x);

  const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
                 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE', 'ENERO'];

  /* ------------------------------------------------- ESTANDAR 1: 2 columnas
     El formato original tiene, por página, DOS columnas espejo de
     «Pasos del proceso» + «Instrucciones», con 4 bloques de 5 filas cada una
     (11-15, 16-20, 21-25 y 26-30 en la página 1; 42-46 … 57-61 en la 2).
     => 4 pasos por columna y por página = 8 pasos por página. */
  const E1_BLOQUES = 4;                       // bloques por columna y por página
  const e1Pag  = i => Math.floor(i / E1_BLOQUES) + 1;
  const e1Num  = (i, der) => (e1Pag(i) - 1) * (E1_BLOQUES * 2) + (der ? E1_BLOQUES : 0) + (i % E1_BLOQUES) + 1;
  /* filas del Excel para cada bloque (página 1 y página 2) */
  const E1_ROWS = [11, 16, 21, 26, 42, 47, 52, 57];
  /* Estandar 2: 6 actividades por página (filas 7-12 y 20-25) */
  const E2_ROWS = [7, 8, 9, 10, 11, 12, 20, 21, 22, 23, 24, 25];
  const E2_XPAG = 6;
  /* Estandar 3: herramientas (8 por página), procedimiento (9) y cambios (4) */
  const E3_HERR   = [8, 9, 10, 11, 12, 13, 14, 15, 39, 40, 41, 42, 43, 44, 45, 46];
  const E3_PROC   = [17, 18, 19, 20, 21, 22, 23, 24, 25, 48, 49, 50, 51, 52, 53, 54, 55, 56];
  const E3_CAMB   = [28, 29, 30, 31, 59, 60, 61, 62];

  const SI_NO = [{ v:'Yes', l:'Yes — sí' }, { v:'No', l:'No' }];

  /* ------------------------------------------------- herencia entre fases */
  function nombreProyecto(ctx){
    return first(T(ctx, 'definir.project_charter').nombre,
                 T(ctx, 'definir.gantt').proyecto,
                 T(ctx, 'definir.a3_definir').nombre,
                 (ctx && ctx.proj ? ctx.proj.nombre : ''));
  }
  function procesoProyecto(ctx){
    return first(T(ctx, 'definir.sipoc').proceso,
                 T(ctx, 'medir.process_mapping_detailed').proceso,
                 T(ctx, 'medir.swin_line').proceso,
                 T(ctx, 'definir.series_tiempo').proceso,
                 nombreProyecto(ctx));
  }
  function empresaProyecto(ctx){
    return first(T(ctx, 'definir.sipoc').empresa,
                 T(ctx, 'definir.gantt').empresa,
                 (ctx && ctx.proj ? ctx.proj.empresa : ''));
  }
  function areaProyecto(ctx){
    return first(T(ctx, 'medir.swin_line').dep1, (ctx && ctx.proj ? ctx.proj.area : ''));
  }
  function liderProyecto(ctx){
    return first(T(ctx, 'mejorar.plan_accion').lider,
                 T(ctx, 'definir.gantt').responsable,
                 (ctx && ctx.proj ? ctx.proj.lider : ''));
  }
  /** integrante i del equipo (Project Members / Project Charter de DEFINIR) */
  function miembro(ctx, i){
    const eq = RS(T(ctx, 'definir.project_charter'), 'equipo')[i];
    const pm = RS(T(ctx, 'definir.project_members'), 'rows')[i];
    return first(eq && eq.nombre, pm && pm.nombre);
  }

  /** Enunciado del problema (DEFINIR) */
  function problemaProyecto(ctx){
    return first(T(ctx, 'definir.project_charter').problema,
                 T(ctx, 'definir.clarificacion_problema').definicion,
                 T(ctx, 'definir.a3_definir').problema,
                 T(ctx, 'analizar.descripcion_causa_raiz').problema);
  }
  /** Objetivo del proyecto (DEFINIR) */
  function objetivoProyecto(ctx){
    return first(T(ctx, 'definir.project_charter').objetivo,
                 T(ctx, 'definir.objetivo_smart').smart,
                 T(ctx, 'definir.a3_definir').objetivo);
  }
  /** Causas raíz validadas (ANALIZAR) */
  function causasRaiz(ctx){
    const r = T(ctx, 'analizar.descripcion_causa_raiz');
    const out = [r.causa1, r.causa2].map(txt).filter(x => x);
    if (out.length) return out;
    return filled(RS(T(ctx, 'analizar.validacion_de_causas'), 'rows'), 'causa')
      .filter(x => num(x.check) === 1).map(x => txt(x.causa));
  }
  /** Soluciones implementadas (MEJORAR) */
  function solucionesImplementadas(ctx){
    const rows = RS(T(ctx, 'mejorar.seleccion_soluciones'), 'rows');
    const sel  = rows.filter(r => txt(r.sol) && /^s[ií]/i.test(txt(r.solucion)));
    const base = sel.length ? sel : filled(rows, 'sol');
    const out  = base.map(r => txt(r.sol)).filter(x => x);
    if (out.length) return out;
    return filled(RS(T(ctx, 'mejorar.plan_accion'), 'rows'), 'accion').map(r => txt(r.accion));
  }
  /** Mejoras que quedaron declaradas «a controlar» en el plan de acción */
  function mejorasAControlar(ctx){
    return filled(RS(T(ctx, 'mejorar.plan_accion'), 'rows'), 'mejora').map(r => txt(r.mejora));
  }
  /** Pasos del proceso mapeados en MEDIR (Process Mapping Detailed) */
  function pasosProceso(ctx){
    return filled(RS(T(ctx, 'medir.process_mapping_detailed'), 'rows'), 'steps');
  }

  /* ---------------------------------------------------- línea base (MEDIR) */
  /** DPMO con la misma semántica de la hoja «DPMO» de MEDIR
   *  (4 categorías de defecto · oportunidades = unidades × 4) */
  function dpmoProyecto(ctx){
    const rows = RS(T(ctx, 'medir.dpmo'), 'rows');
    const units = sum(rows, 'units');
    const defs  = rows.reduce((a, r) => a + num(r.c1) + num(r.c2) + num(r.c3) + num(r.c4), 0);
    const opps  = units * 4;
    return { units, defs, opps, dpmo: safeDiv(defs, opps) * 1e6 };
  }
  /** Promedio de la serie de 13 periodos de «Grafico Serie de tiempo» (MEDIR) */
  function serieMedir(ctx){
    const t = T(ctx, 'medir.grafico_serie_tiempo');
    const S = t.serie || {}, V = [];
    for (let i = 1; i <= 13; i++){
      const v = S['m' + i + '.valor'];
      if (v !== '' && v !== null && v !== undefined) V.push(num(v));
    }
    return { criterio: txt(t.criterio), n: V.length, valores: V,
             prom: V.length ? V.reduce((a, b) => a + b, 0) / V.length : NaN };
  }
  /** Línea base declarada en DEFINIR (Series de tiempo) */
  function baseLineDefinir(ctx){
    const st = T(ctx, 'definir.series_tiempo');
    const rows = RS(st, 'rows').filter(r => isNum(r.metrico));
    return { proceso: txt(st.proceso), n: rows.length,
             prom: rows.length ? avg(rows, 'metrico') : NaN,
             objetivo: txt(st.objetivo) === '' ? NaN : num(st.objetivo) };
  }
  /** Texto de línea base para los A3 */
  function baselineTxt(ctx){
    const p = [];
    const bl = baseLineDefinir(ctx);
    if (bl.n) p.push('Línea base ' + (bl.proceso ? '(' + bl.proceso + ')' : '') + ': ' +
                     fmt(bl.prom, 'n2') + ' — ' + bl.n + ' punto(s)' +
                     (isFinite(bl.objetivo) ? ' · objetivo ' + fmt(bl.objetivo, 'n2') : ''));
    const sm = serieMedir(ctx);
    if (sm.n) p.push('Serie de MEDIR ' + (sm.criterio ? '(' + sm.criterio + ')' : '') + ': promedio ' +
                     fmt(sm.prom, 'n2') + ' en ' + sm.n + ' periodo(s)');
    const dp = dpmoProyecto(ctx);
    if (dp.opps > 0) p.push('DPMO ' + fmt(dp.dpmo, 'n0') + ' · Nivel sigma ' +
                            fmt(sigmaLevel(dp.dpmo), 'n2') + ' σ');
    return p.join('\n');
  }

  /* --------------------------------------------- antes / después (control) */
  /** Estadísticos del gráfico ANTES-DESPUES */
  function adStats(d){
    const rows = RS(d, 'rows').filter(r => isNum(r.antes) || isNum(r.despues));
    const A = rows.filter(r => isNum(r.antes)).map(r => num(r.antes));
    const B = rows.filter(r => isNum(r.despues)).map(r => num(r.despues));
    const ma = A.length ? A.reduce((x, y) => x + y, 0) / A.length : NaN;
    const mb = B.length ? B.reduce((x, y) => x + y, 0) / B.length : NaN;
    return { rows, A, B, ma, mb, dif: mb - ma, pct: safeDiv(mb - ma, ma),
             menorMejor: txt(d.direccion) !== 'Mayor es mejor' };
  }
  const adOf = ctx => adStats(T(ctx, 'controlar.grafico_antes_despues'));
  /** ¿la variación lograda va en la dirección correcta? */
  function adMejoro(s){
    if (!isFinite(s.dif) || s.dif === 0) return null;
    return s.menorMejor ? s.dif < 0 : s.dif > 0;
  }
  /** Variación en % lograda, ya orientada (positiva = mejora) */
  function adMejoraPct(s){
    if (!isFinite(s.pct)) return NaN;
    return s.menorMejor ? -s.pct : s.pct;
  }

  /* --------------------------------------------------- plan de control (KPI) */
  function planControlStats(ctx){
    const d = T(ctx, 'controlar.plan_de_control');
    const rows = RS(d, 'rows').filter(r => txt(r.paso) || txt(r.caracteristica));
    const c = k => filled(rows, k).length;
    return { d, rows, n: rows.length, especs: c('especificaciones'), tecnica: c('tecnica'),
             metodo: c('metodo'), muestreo: c('tamano'), frecuencia: c('frecuencia'),
             documento: c('documento'), acciones: c('acciones'), responsable: c('responsable'),
             completo: rows.filter(r => txt(r.especificaciones) && txt(r.tecnica) &&
                                        txt(r.frecuencia) && txt(r.acciones) && txt(r.responsable)).length };
  }
  /** ¿cuántos estándares de trabajo quedaron documentados? */
  function estandaresStats(ctx){
    const e1 = T(ctx, 'controlar.estandar_1');
    const e2 = T(ctx, 'controlar.estandar_2');
    const e3 = T(ctx, 'controlar.estandar_3');
    const n1 = filled(RS(e1, 'pasos'), 'paso').length + filled(RS(e1, 'pasosDer'), 'paso').length;
    const n2 = filled(RS(e2, 'rows'), 'actividad').length;
    const n3 = filled(RS(e3, 'procedimiento'), 'paso').length;
    return { n1, n2, n3, total: n1 + n2 + n3,
             hojas: [n1, n2, n3].filter(x => x > 0).length };
  }

  /* --------------------------------------- Project Charter (versión cierre) */
  const ROLES_CH = ['Champion / Sponsor', 'Dueño del Proceso', 'Finanzas',
                    'Mentor (MBB-BB)', 'Facilitador (GB-BB)',
                    'Team member', 'Team member', 'Team member', 'Team member'];
  const CAT_AHORROS = ['Garantia', 'Scrap', 'Retrabajo', 'Suministros', 'Material',
                       'Inventario', 'Inventory', 'Cycle time', 'Ingresos', 'Desperdicios'];
  const FASES_DMAIC = ['DEFINIR', 'MEDIR', 'ANALIZAR', 'MEJORAR', 'CONTROLAR'];
  /** =SUM(N23:O29,N31:O32) → «Cycle time» (fila 30) NO suma */
  const sumaAhorros = (rows, k) => arr(rows).reduce((a, r, i) =>
    a + (CAT_AHORROS[i] === 'Cycle time' ? 0 : num(r[k])), 0);
  /** fila i de un grid del Project Charter de DEFINIR */
  const chRow = (ctx, key, i) => (RS(T(ctx, 'definir.project_charter'), key)[i] || {});
  /** ¿el valor logrado alcanzó el objetivo? (respeta la dirección base → objetivo) */
  function cumpleObjetivo(base, obj, logrado){
    if (!isNum(obj) || !isNum(logrado)) return null;
    const b = num(base), o = num(obj), l = num(logrado);
    if (!isNum(base) || b === o) return l === o ? true : null;
    return o < b ? l <= o : l >= o;
  }

  /* ======================================================================
     ACCIÓN UI · «Armar A3 final con lo mejor de las 5 fases»
     Va en window porque el manejador se declara en el atributo onclick del
     bloque html (el renderer genérico no tiene enganche propio de acciones).
     ==================================================================== */
  window.CTRL_armarA3final = function(){
    const ctx = (typeof ST !== 'undefined') ? ST.ctx() : { all:{} };
    const d = ST.d('controlar.a3_final');
    const puestos = [];
    const set = (k, v, label) => {
      if (txt(d[k]) || !txt(v)) return;
      d[k] = v; puestos.push(label);
    };
    set('proyecto', nombreProyecto(ctx), 'PROYECTO');
    set('area', areaProyecto(ctx), 'AREA');
    set('empresa', empresaProyecto(ctx), 'Empresa');
    set('definir', resumenDefinir(ctx), 'DEFINIR');
    set('medirAnalizar', resumenMedirAnalizar(ctx), 'MEDIR + ANALIZAR');
    set('mejorar', resumenMejorar(ctx), 'MEJORAR');
    set('controlar', resumenControlar(ctx), 'CONTROLAR');
    set('t1', 'DEFINIR — PROBLEMA Y OBJETIVO', 'título 1');
    set('t2', 'MEDIR Y ANALIZAR — LINEA BASE Y CAUSA RAIZ', 'título 2');
    set('t3', 'MEJORAR — SOLUCIONES IMPLEMENTADAS', 'título 3');
    set('t4', 'CONTROLAR — ESTANDARIZACION Y PLAN DE CONTROL', 'título 4');
    set('t5', 'RESULTADOS — ANTES Y DESPUES', 'título 5');
    ST.touch(); UI.renderView();
    toast(puestos.length
      ? 'A3 final armado con: ' + puestos.join(' · ') + '. Revisa y ajusta la redacción.'
      : 'El A3 final ya estaba diligenciado: no se sobrescribió ningún recuadro.',
      puestos.length ? 'ok' : '');
  };

  /* ------------------------------------------- textos auto-armados del A3 */
  function resumenDefinir(ctx){
    const p = [];
    const pr = problemaProyecto(ctx), ob = objetivoProyecto(ctx);
    const bc = first(T(ctx, 'definir.project_charter').businessCase,
                     T(ctx, 'definir.tabla_identificacion').caso);
    if (pr) p.push('PROBLEMA: ' + pr);
    if (bc) p.push('CASO DEL NEGOCIO: ' + bc);
    if (ob) p.push('OBJETIVO: ' + ob);
    return p.join('\n\n');
  }
  function resumenMedirAnalizar(ctx){
    const p = [];
    const bl = baselineTxt(ctx);
    if (bl) p.push('LINEA BASE:\n' + bl);
    const cs = causasRaiz(ctx);
    if (cs.length) p.push('CAUSA(S) RAIZ VALIDADA(S):\n' +
      cs.map((c, i) => (i + 1) + '. ' + c).join('\n'));
    const con = txt(T(ctx, 'analizar.descripcion_causa_raiz').conclusion);
    if (con) p.push('CONCLUSION DEL ANALISIS: ' + con);
    return p.join('\n\n');
  }
  function resumenMejorar(ctx){
    const p = [];
    const sols = solucionesImplementadas(ctx);
    if (sols.length) p.push('SOLUCIONES IMPLEMENTADAS:\n' +
      sols.slice(0, 8).map((s, i) => (i + 1) + '. ' + s).join('\n'));
    const rows = RS(T(ctx, 'mejorar.plan_accion'), 'rows').filter(r => txt(r.accion));
    if (rows.length){
      const real = rows.filter(r => txt(r.estatus).toUpperCase() === 'REALIZADA').length;
      p.push('PLAN DE ACCION: ' + real + ' de ' + rows.length + ' acciones realizadas (' +
             fmt(safeDiv(real, rows.length), 'p0') + ').');
    }
    const res = txt(T(ctx, 'mejorar.descripcion_solucion').conclusion);
    if (res) p.push('RESULTADO: ' + res);
    return p.join('\n\n');
  }
  function resumenControlar(ctx){
    const p = [];
    const e = estandaresStats(ctx);
    if (e.total) p.push('ESTANDARIZACION: ' + e.total + ' paso(s) de trabajo estandarizados en ' +
                        e.hojas + ' formato(s) de ESTANDAR DE TRABAJO.');
    const pc = planControlStats(ctx);
    if (pc.n) p.push('PLAN DE CONTROL: ' + pc.n + ' punto(s) de control · ' + pc.responsable +
                     ' con responsable · ' + pc.acciones + ' con acción correctiva definida.');
    const s = adOf(ctx);
    if (isFinite(s.pct)) p.push('RESULTADO ANTES-DESPUES: de ' + fmt(s.ma, 'n2') + ' a ' +
                                fmt(s.mb, 'n2') + ' (' + fmt(adMejoraPct(s), 'p1') + ' de mejora).');
    const a3 = txt(T(ctx, 'controlar.a3_controlar').beneficios);
    if (a3) p.push('BENEFICIOS: ' + a3);
    return p.join('\n\n');
  }

  /* ======================================================================
     1 · ESTANDAR DE TRABAJO  (hoja «Estandar 1»)
     Formato de 2 páginas · 2 columnas espejo · 4 bloques por columna
     ==================================================================== */
  const T_EST1 = {
    id: 'controlar.estandar_1',
    mod: 'CONTROLAR',
    sheet: 'Estandar 1',
    title: 'ESTANDAR DE TRABAJO (formato 1 — pasos e instrucciones)',
    desc: 'Hoja de estándar de trabajo: los pasos del proceso mejorado con su instrucción, sus requerimientos de seguridad y su ayuda visual.',
    guide: [
      'El estándar se escribe DESPUÉS de la mejora: documenta el proceso nuevo, no el viejo.',
      'Un renglón = un paso. La INSTRUCCIÓN dice cómo se hace bien (verbo + qué + con qué + criterio de aceptación).',
      'El formato original tiene dos columnas espejo por página (4 bloques cada una = 8 pasos por página) y se repite en 2 páginas; aquí puedes agregar las filas que necesites.',
      'REQUERIMIENTOS DE SEGURIDAD y OTROS REQUERIMIENTOS se diligencian por página: EPP, bioseguridad, historia clínica, habeas data.',
      'Sube la AYUDA VISUAL: una foto o esquema explica más que tres párrafos y es lo que hace sostenible el estándar.',
      'Firma quién lo realizó, quién lo revisó y quién lo liberó: sin firma el estándar no es exigible.'
    ],
    blocks: [
      { type:'fields', title:'ESTANDAR DE TRABAJO — Encabezado (página 1)', cols:3,
        items:(d, ctx) => [
          { k:'proceso',   label:'Proceso:', input:'text', w:2, ph: procesoProyecto(ctx) || 'Proceso estandarizado' },
          { k:'liberada',  label:'Liberada:', input:'text', w:1, ph:'Quién libera el estándar' },
          { k:'documento', label:'# Documento:', input:'text', w:1, ph:'Ej.: EST-REH-001' },
          { k:'realizo',   label:'Realizó:', input:'text', w:1, ph: liderProyecto(ctx) },
          { k:'revisada',  label:'Revisada:', input:'text', w:1 },
          { k:'pag',       label:'Pág', input:'text', w:1, ph:'1 de 2' }
        ] },
      { type:'fields', title:'Requerimientos (página 1)', cols:2, items:[
        { k:'seguridad', label:'Requerimientos de seguridad:', input:'textarea', rows:5, w:1,
          ph:'EPP, bioseguridad, condiciones del puesto, riesgos del paso.' },
        { k:'otros', label:'Otros requerimientos', input:'textarea', rows:5, w:1,
          ph:'Equipos, formatos, sistema de información, competencias del personal.' }
      ] },
      { type:'note', tone:'info', text:'El formato original reparte los pasos en DOS columnas espejo por página. ' +
        'Las filas 1 a 4 de cada tabla caen en la página 1 y las filas 5 a 8 en la página 2 del Excel.' },
      { type:'grid', key:'pasos', title:'Pasos del proceso · Instrucciones — COLUMNA IZQUIERDA',
        min:8, max:40, addLabel:'Agregar paso (columna izquierda)',
        cols:(d, ctx) => {
          const ps = pasosProceso(ctx);
          return [
            { k:'n',   label:'#', ro:true, w:44, calc:(r, i) => e1Num(i, false) },
            { k:'pag', label:'Pág', ro:true, w:52, calc:(r, i) => e1Pag(i) },
            { k:'paso', label:'Pasos del proceso', input:'textarea', rows:3, w:230,
              ph: ps.length ? corta(ps[0].steps, 40) : 'Paso del proceso mejorado' },
            { k:'instruccion', label:'Instrucciones', input:'textarea', rows:3, w:320,
              ph:'Cómo se hace bien: qué, con qué, cuánto y criterio de aceptación' },
            { k:'ayuda', label:'Ayuda visual (descripción)', input:'text', w:180,
              ph:'Foto / esquema que acompaña el paso' }
          ];
        } },
      { type:'grid', key:'pasosDer', title:'Pasos del proceso · Instrucciones — COLUMNA DERECHA',
        min:8, max:40, addLabel:'Agregar paso (columna derecha)',
        cols:[
          { k:'n',   label:'#', ro:true, w:44, calc:(r, i) => e1Num(i, true) },
          { k:'pag', label:'Pág', ro:true, w:52, calc:(r, i) => e1Pag(i) },
          { k:'paso', label:'Pasos del proceso', input:'textarea', rows:3, w:230,
            ph:'Paso del proceso mejorado' },
          { k:'instruccion', label:'Instrucciones', input:'textarea', rows:3, w:320,
            ph:'Cómo se hace bien: qué, con qué, cuánto y criterio de aceptación' },
          { k:'ayuda', label:'Ayuda visual (descripción)', input:'text', w:180,
            ph:'Foto / esquema que acompaña el paso' }
        ] },
      { type:'upload', k:'imgIzq1', label:'AYUDA VISUAL — página 1, columna izquierda', h:220 },
      { type:'upload', k:'imgDer1', label:'AYUDA VISUAL — página 1, columna derecha', h:220 },
      { type:'fields', title:'Nota de la página 1', cols:1, items:[
        { k:'nota1', label:'Nota / observaciones (pie de la página 1)', input:'textarea', rows:2, w:1,
          ph:'Ej.: Este estándar reemplaza al documento anterior desde la fecha de liberación.' }
      ] },
      { type:'fields', title:'ESTANDAR DE TRABAJO — Encabezado (página 2)', cols:3,
        items:(d) => [
          { k:'proceso2',   label:'Proceso:', input:'text', w:2, ph: txt(d.proceso) },
          { k:'liberada2',  label:'Liberada:', input:'text', w:1, ph: txt(d.liberada) },
          { k:'documento2', label:'# Documento:', input:'text', w:1, ph: txt(d.documento) },
          { k:'realizo2',   label:'Realizó:', input:'text', w:1, ph: txt(d.realizo) },
          { k:'revisada2',  label:'Revisada:', input:'text', w:1, ph: txt(d.revisada) },
          { k:'pag2',       label:'Pág', input:'text', w:1, ph:'2 de 2' }
        ] },
      { type:'fields', title:'Requerimientos (página 2)', cols:2, items:[
        { k:'seguridad2', label:'Requerimientos de seguridad:', input:'textarea', rows:5, w:1 },
        { k:'otros2', label:'Otros requerimientos', input:'textarea', rows:5, w:1 }
      ] },
      { type:'upload', k:'imgIzq2', label:'AYUDA VISUAL — página 2, columna izquierda', h:220 },
      { type:'upload', k:'imgDer2', label:'AYUDA VISUAL — página 2, columna derecha', h:220 },
      { type:'fields', title:'Nota final', cols:1, items:[
        { k:'nota2', label:'Nota final (pie del formato · B62)', input:'textarea', rows:2, w:1,
          ph:'Control de la versión, vigencia y dónde se publica el estándar.' }
      ] },
      { type:'cards', items:(d) => {
          const iz = filled(RS(d, 'pasos'), 'paso'), de = filled(RS(d, 'pasosDer'), 'paso');
          const tot = iz.length + de.length;
          if (!tot && !txt(d.proceso)) return [];
          const con = iz.filter(r => txt(r.instruccion)).length + de.filter(r => txt(r.instruccion)).length;
          const imgs = ['imgIzq1', 'imgDer1', 'imgIzq2', 'imgDer2'].filter(k => d[k]).length;
          const pgs = Math.max(1, Math.ceil(Math.max(RS(d, 'pasos').length, RS(d, 'pasosDer').length) / E1_BLOQUES));
          return [
            { label:'PASOS ESTANDARIZADOS', value: fmt(tot, 'n0'), tone: tot ? 'ok' : 'warn' },
            { label:'CON INSTRUCCIÓN', value: fmt(con, 'n0') + ' / ' + fmt(tot, 'n0'),
              tone: tot && con === tot ? 'ok' : 'warn', hint:'Un paso sin instrucción no es un estándar' },
            { label:'AYUDAS VISUALES', value: fmt(imgs, 'n0') + ' / 4', tone: imgs ? 'ok' : 'warn' },
            { label:'PÁGINAS', value: fmt(pgs, 'n0'), hint:'El Excel original imprime 2' },
            { label:'REQUERIM. SEGURIDAD', value: txt(d.seguridad) ? 'SÍ' : 'NO',
              tone: txt(d.seguridad) ? 'ok' : 'bad' },
            { label:'FIRMAS (Realizó / Revisada / Liberada)',
              value: [d.realizo, d.revisada, d.liberada].filter(x => txt(x)).length + ' / 3',
              tone: [d.realizo, d.revisada, d.liberada].filter(x => txt(x)).length === 3 ? 'ok' : 'warn' }
          ];
        } },
      { type:'note', tone:'warn', text:(d) => {
          const iz = filled(RS(d, 'pasos'), 'paso'), de = filled(RS(d, 'pasosDer'), 'paso');
          if (!iz.length && !de.length) return 'Sin pasos documentados no hay estándar: la mejora se pierde apenas rote el personal.';
          if (!txt(d.liberada)) return 'Falta la liberación del estándar: mientras no esté liberado y publicado, el proceso sigue dependiendo de la memoria de cada persona.';
          return '';
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* PÁGINA 1 (filas 2-31) · PÁGINA 2 (filas 33-62)
         B3 «Proceso:» → C3:E3 · H3 «Liberada:» → I3 · K3 «Pág» → K4:L4
         B4 «# Documento:» → C4:D4 · E4 «Realizó:» → F4:G4 · H4 «Revisada:» → I4
         B5:F5 rótulo seguridad → B6:F8 · G5:L5 rótulo otros → G6:L8
         Cuerpo: B/D (izquierda) y G/I (derecha) en las filas 11,16,21,26 (pág 1)
         y 42,47,52,57 (pág 2) · B31:L31 nota pág 1 · B62:L62 nota final */
      fields:{ proceso:'C3', liberada:'I3', pag:'K4', documento:'C4', realizo:'F4', revisada:'I4',
               seguridad:'B6', otros:'G6', nota1:'B31',
               proceso2:'C34', liberada2:'I34', pag2:'K35', documento2:'C35', realizo2:'F35',
               revisada2:'I35', seguridad2:'B37', otros2:'G37', nota2:'B62' },
      grids:[
        { key:'pasos',    rowsAt: E1_ROWS, cols:{ paso:'B', instruccion:'D' } },
        { key:'pasosDer', rowsAt: E1_ROWS, cols:{ paso:'G', instruccion:'I' } }
      ],
      /* el formato original no tiene celda de imagen: la ayuda visual se ancla
         sobre el primer bloque de instrucciones de cada columna (5 filas) */
      images:[
        { k:'imgIzq1', anchor:'D11', w:3, h:5 },
        { k:'imgDer1', anchor:'I11', w:4, h:5 },
        { k:'imgIzq2', anchor:'D42', w:3, h:5 },
        { k:'imgDer2', anchor:'I42', w:4, h:5 }
      ]
    },
    bi: (d) => {
      const iz = filled(RS(d, 'pasos'), 'paso'), de = filled(RS(d, 'pasosDer'), 'paso');
      const tot = iz.length + de.length;
      const con = iz.filter(r => txt(r.instruccion)).length + de.filter(r => txt(r.instruccion)).length;
      return {
        'Estandar 1 — pasos estandarizados': tot,
        'Estandar 1 — pasos con instrucción': con,
        'Estandar 1 — cobertura de instrucciones': safeDiv(con, tot),
        'Estandar 1 — ayudas visuales': ['imgIzq1', 'imgDer1', 'imgIzq2', 'imgDer2'].filter(k => d[k]).length,
        'Estandar 1 — liberado': txt(d.liberada) ? 1 : 0
      };
    }
  };

  /* ======================================================================
     2 · ESTANDAR DE TRABAJO — variante en tabla  (hoja «Estandar 2»)
     6 actividades por página · 2 páginas (filas 7-12 y 20-25)
     ==================================================================== */
  const T_EST2 = {
    id: 'controlar.estandar_2',
    mod: 'CONTROLAR',
    sheet: 'Estandar 2',
    title: 'ESTANDAR DE TRABAJO (formato 2 — tabla con ayuda visual)',
    desc: 'Estándar de trabajo en tabla: ayuda visual, actividad, estándar esperado, herramientas, responsable, tiempo y requerimientos de seguridad.',
    guide: [
      'Una fila = una actividad del proceso mejorado, en el orden real de ejecución.',
      'ESTANDAR es el criterio de aceptación medible (tiempo, cantidad, temperatura, tolerancia, formato diligenciado).',
      'RESPONSABLE es el cargo, no la persona: el estándar sobrevive a la rotación.',
      'TIEMPO permite sumar el tiempo de ciclo estandarizado y compararlo con el tiempo de la línea base de MEDIR.',
      'Sube una AYUDA VISUAL por actividad: es lo que se usa para entrenar y para auditar.',
      'El formato original tiene 6 actividades por página y se repite en 2 páginas (filas 7-12 y 20-25).'
    ],
    blocks: [
      { type:'fields', title:'ESTANDAR DE TRABAJO — Encabezado (página 1)', cols:4,
        items:(d, ctx) => [
          { k:'proceso', label:'Proceso:', input:'text', w:2, ph: procesoProyecto(ctx) },
          { k:'realizo', label:'Realizó:', input:'text', w:1, ph: liderProyecto(ctx) },
          { k:'fecha',   label:'Fecha:', input:'date', w:1, ph: hoy() },
          { k:'codigo',  label:'Código:', input:'text', w:1, ph:'Ej.: EST-REH-002' },
          { k:'pag',     label:'Pag:', input:'text', w:1, ph:'1 de 2' }
        ] },
      { type:'grid', key:'rows', title:'ESTANDAR DE TRABAJO', min:12, max:24,
        addLabel:'Agregar actividad',
        cols:(d, ctx) => {
          const sols = solucionesImplementadas(ctx);
          return [
            { k:'n',   label:'#', ro:true, w:44, calc:(r, i) => i + 1 },
            { k:'pag', label:'Pag', ro:true, w:52, calc:(r, i) => Math.floor(i / E2_XPAG) + 1 },
            { k:'ayuda', label:'Ayuda Visual', input:'text', w:170,
              ph:'Referencia de la foto/esquema (súbela abajo)' },
            { k:'actividad', label:'Actividad', input:'textarea', rows:3, w:240,
              ph: sols.length ? corta(sols[0], 45) : 'Actividad del proceso estandarizado' },
            { k:'estandar', label:'Estandar', input:'textarea', rows:3, w:230,
              ph:'Criterio de aceptación medible' },
            { k:'herramientas', label:'Herramientas', input:'text', w:170,
              ph:'Equipos, formatos, software' },
            { k:'responsable', label:'Responsable', input:'text', w:150, ph:'Cargo responsable' },
            { k:'tiempo', label:'Tiempo', input:'text', w:110, ph:'Ej.: 5 min' },
            { k:'seguridad', label:'Requerimientos de seguridad', input:'textarea', rows:3, w:220,
              ph:'EPP, bioseguridad, riesgo asociado' }
          ];
        },
        foot:[
          { k:'__label', label:'ACTIVIDADES' },
          { k:'actividad', fmt:'n0', calc:(rows) => filled(rows, 'actividad').length },
          { k:'tiempo', fmt:'n2', calc:(rows) => sum(rows, 'tiempo') }
        ] },
      { type:'note', tone:'info', text:'La columna «Ayuda Visual» del formato original es una celda de imagen por actividad: ' +
        'las 6 primeras filas caen en la página 1 y las 6 siguientes en la página 2.' },
      { type:'upload', k:'img1', label:'Ayuda visual — actividad 1 (pág. 1)', h:150 },
      { type:'upload', k:'img2', label:'Ayuda visual — actividad 2 (pág. 1)', h:150 },
      { type:'upload', k:'img3', label:'Ayuda visual — actividad 3 (pág. 1)', h:150 },
      { type:'upload', k:'img4', label:'Ayuda visual — actividad 4 (pág. 1)', h:150 },
      { type:'upload', k:'img5', label:'Ayuda visual — actividad 5 (pág. 1)', h:150 },
      { type:'upload', k:'img6', label:'Ayuda visual — actividad 6 (pág. 1)', h:150 },
      { type:'fields', title:'ESTANDAR DE TRABAJO — Encabezado (página 2)', cols:4,
        items:(d) => [
          { k:'proceso2', label:'Proceso:', input:'text', w:2, ph: txt(d.proceso) },
          { k:'realizo2', label:'Realizo:', input:'text', w:1, ph: txt(d.realizo) },
          { k:'fecha2',   label:'Fecha:', input:'date', w:1 },
          { k:'codigo2',  label:'Codigo:', input:'text', w:1, ph: txt(d.codigo) },
          { k:'pag2',     label:'Pag:', input:'text', w:1, ph:'2 de 2' }
        ] },
      { type:'upload', k:'img7',  label:'Ayuda visual — actividad 7 (pág. 2)', h:150 },
      { type:'upload', k:'img8',  label:'Ayuda visual — actividad 8 (pág. 2)', h:150 },
      { type:'upload', k:'img9',  label:'Ayuda visual — actividad 9 (pág. 2)', h:150 },
      { type:'upload', k:'img10', label:'Ayuda visual — actividad 10 (pág. 2)', h:150 },
      { type:'upload', k:'img11', label:'Ayuda visual — actividad 11 (pág. 2)', h:150 },
      { type:'upload', k:'img12', label:'Ayuda visual — actividad 12 (pág. 2)', h:150 },
      { type:'cards', items:(d) => {
          const rows = filled(RS(d, 'rows'), 'actividad');
          if (!rows.length && !txt(d.proceso)) return [];
          const est = rows.filter(r => txt(r.estandar)).length;
          const res = rows.filter(r => txt(r.responsable)).length;
          const seg = rows.filter(r => txt(r.seguridad)).length;
          const imgs = [];
          for (let i = 1; i <= 12; i++) if (d['img' + i]) imgs.push(i);
          const tt = sum(rows, 'tiempo');
          return [
            { label:'ACTIVIDADES', value: fmt(rows.length, 'n0'), tone: rows.length ? 'ok' : 'warn' },
            { label:'CON ESTÁNDAR MEDIBLE', value: fmt(est, 'n0') + ' / ' + fmt(rows.length, 'n0'),
              tone: rows.length && est === rows.length ? 'ok' : 'warn' },
            { label:'CON RESPONSABLE', value: fmt(res, 'n0') + ' / ' + fmt(rows.length, 'n0'),
              tone: rows.length && res === rows.length ? 'ok' : 'warn' },
            { label:'CON REQ. SEGURIDAD', value: fmt(seg, 'n0') + ' / ' + fmt(rows.length, 'n0'),
              tone: seg ? 'ok' : 'bad' },
            { label:'AYUDAS VISUALES', value: fmt(imgs.length, 'n0') + ' / 12',
              tone: imgs.length ? 'ok' : 'warn' },
            { label:'TIEMPO ESTANDARIZADO', value: tt ? fmt(tt, 'n2') : '—',
              hint:'Suma de la columna Tiempo' }
          ];
        } },
      { type:'note', tone:'warn', text:(d) => {
          const rows = filled(RS(d, 'rows'), 'actividad');
          if (!rows.length) return '';
          const sin = rows.filter(r => !txt(r.estandar)).length;
          return sin ? sin + ' actividad(es) sin ESTANDAR medible: si no hay criterio de aceptación, no se puede auditar el cumplimiento.' : '';
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* PÁGINA 1: C2:I2 título · J2 «Código:» · K2 «Pag:» (rótulos, sin celda de
         valor propia en el original) · C3 «Proceso:» → D3:F3 · G3 «Realizó:» →
         H3:I3 · J3 «Fecha:» → K3.  Encabezados de tabla en las filas 5-6 y
         actividades en las filas 7-12.  PÁGINA 2: idéntico en las filas 15-25.
         `codigo` y `pag` NO se exportan: en el original J2/K2 y J15/K15 están
         ocupadas por los rótulos y la plantilla no tiene celda de valor. */
      fields:{ proceso:'D3', realizo:'H3', fecha:'K3',
               proceso2:'D16', realizo2:'H16', fecha2:'K16' },
      grids:[{ key:'rows', rowsAt: E2_ROWS,
               cols:{ ayuda:'B', actividad:'D', estandar:'F', herramientas:'G',
                      responsable:'H', tiempo:'J', seguridad:'K' } }],
      images:[
        { k:'img1',  anchor:'B7',  w:2, h:1 }, { k:'img2',  anchor:'B8',  w:2, h:1 },
        { k:'img3',  anchor:'B9',  w:2, h:1 }, { k:'img4',  anchor:'B10', w:2, h:1 },
        { k:'img5',  anchor:'B11', w:2, h:1 }, { k:'img6',  anchor:'B12', w:2, h:1 },
        { k:'img7',  anchor:'B20', w:2, h:1 }, { k:'img8',  anchor:'B21', w:2, h:1 },
        { k:'img9',  anchor:'B22', w:2, h:1 }, { k:'img10', anchor:'B23', w:2, h:1 },
        { k:'img11', anchor:'B24', w:2, h:1 }, { k:'img12', anchor:'B25', w:2, h:1 }
      ]
    },
    bi: (d) => {
      const rows = filled(RS(d, 'rows'), 'actividad');
      let imgs = 0; for (let i = 1; i <= 12; i++) if (d['img' + i]) imgs++;
      return {
        'Estandar 2 — actividades': rows.length,
        'Estandar 2 — con estándar medible': rows.filter(r => txt(r.estandar)).length,
        'Estandar 2 — con responsable': rows.filter(r => txt(r.responsable)).length,
        'Estandar 2 — ayudas visuales': imgs,
        'Estandar 2 — tiempo estandarizado': sum(rows, 'tiempo')
      };
    }
  };

  /* ======================================================================
     3 · ESTANDAR DE TRABAJO — variante visual  (hoja «Estandar 3»)
     Ayuda visual grande + herramienta + seguridad + procedimiento numerado
     + control de cambios.  2 páginas (filas 2-31 y 33-62).
     ==================================================================== */
  const T_EST3 = {
    id: 'controlar.estandar_3',
    mod: 'CONTROLAR',
    sheet: 'Estandar 3',
    title: 'ESTANDAR DE TRABAJO (formato 3 — ayuda visual y procedimiento)',
    desc: 'Estándar visual de una sola página: una imagen grande del puesto o del equipo, las herramientas, los requerimientos de seguridad, el procedimiento numerado y el control de cambios.',
    guide: [
      'Es el formato para publicar EN EL PUESTO DE TRABAJO: la imagen manda y el texto es corto.',
      'PROCEDIMIENTO va numerado, una acción por renglón, con verbo en infinitivo y criterio de aceptación.',
      'HERRAMIENTA lista lo que se necesita para ejecutar el estándar (equipos, formatos, insumos).',
      'FRECUENCIA y RESPONSABLE definen cada cuánto se ejecuta y quién responde por el resultado.',
      'CONTROL DE CAMBIOS es obligatorio: cada revisión con su fecha y qué cambió; así el estándar es auditable.',
      'El formato original se repite en 2 páginas: las filas siguientes de cada lista continúan en la página 2.'
    ],
    blocks: [
      { type:'fields', title:'ESTANDAR DE TRABAJO — Encabezado (página 1)', cols:3,
        items:(d, ctx) => [
          { k:'proceso',     label:'Proceso:', input:'text', w:1, ph: procesoProyecto(ctx) },
          { k:'maquina',     label:'Máquina/equipo:', input:'text', w:1 },
          { k:'realizo',     label:'Realizadó por:', input:'text', w:1, ph: liderProyecto(ctx) },
          { k:'area',        label:'Area:', input:'text', w:1, ph: areaProyecto(ctx) },
          { k:'clase',       label:'Clase:', input:'text', w:1, ph:'Operativo / administrativo / asistencial' },
          { k:'aprobado',    label:'Aprobado por:', input:'text', w:1 },
          { k:'frecuencia',  label:'Frecuencia:', input:'text', w:1, ph:'Diaria / por atención / semanal' },
          { k:'responsable', label:'Responsable:', input:'text', w:1, ph:'Cargo responsable' },
          { k:'documento',   label:'#Documento:', input:'text', w:1, ph:'Ej.: EST-REH-003' }
        ] },
      { type:'upload', k:'imagen', label:'AYUDA VISUAL (página 1)', h:340 },
      { type:'grid', key:'herramientas', title:'HERRAMIENTA', min:8, max:16,
        addLabel:'Agregar herramienta',
        cols:[
          { k:'n',   label:'#', ro:true, w:44, calc:(r, i) => i + 1 },
          { k:'pag', label:'Pág', ro:true, w:52, calc:(r, i) => (i < 8 ? 1 : 2) },
          { k:'herramienta', label:'HERRAMIENTA', input:'text', w:380,
            ph:'Equipo, formato, insumo o software necesario' }
        ] },
      { type:'fields', title:'REQUERIMIENTOS SEGURIDAD (página 1)', cols:1, items:[
        { k:'seguridad', label:'REQUERIMIENTOS SEGURIDAD', input:'textarea', rows:6, w:1,
          ph:'EPP obligatorio, bioseguridad, riesgos del puesto, qué hacer ante un incidente.' }
      ] },
      { type:'grid', key:'procedimiento', title:'PROCEDIMIENTO', min:9, max:18,
        addLabel:'Agregar paso del procedimiento',
        cols:(d, ctx) => {
          const ps = pasosProceso(ctx);
          return [
            { k:'n',   label:'#', ro:true, w:44, calc:(r, i) => i + 1 },
            { k:'pag', label:'Pág', ro:true, w:52, calc:(r, i) => (i < 9 ? 1 : 2) },
            { k:'paso', label:'PROCEDIMIENTO', input:'textarea', rows:2, w:520,
              ph: ps.length ? corta(ps[0].steps, 60) : 'Acción numerada del procedimiento' }
          ];
        } },
      { type:'grid', key:'cambios', title:'Control de Cambios', min:4, max:8,
        addLabel:'Agregar revisión',
        cols:[
          { k:'revision', label:'Revisión', input:'text', w:100, ph:'01, 02…' },
          { k:'fecha',    label:'Fecha', input:'date', w:150 },
          { k:'cambio',   label:'Control de Cambios', input:'textarea', rows:2, w:420,
            ph:'Qué cambió respecto de la versión anterior y por qué' }
        ] },
      { type:'fields', title:'ESTANDAR DE TRABAJO — Encabezado (página 2)', cols:3,
        items:(d) => [
          { k:'proceso2',     label:'Proceso:', input:'text', w:1, ph: txt(d.proceso) },
          { k:'maquina2',     label:'Máquina/equipo:', input:'text', w:1, ph: txt(d.maquina) },
          { k:'realizo2',     label:'Realizadó por:', input:'text', w:1, ph: txt(d.realizo) },
          { k:'area2',        label:'Area:', input:'text', w:1, ph: txt(d.area) },
          { k:'clase2',       label:'Clase:', input:'text', w:1, ph: txt(d.clase) },
          { k:'aprobado2',    label:'Aprobado por:', input:'text', w:1, ph: txt(d.aprobado) },
          { k:'frecuencia2',  label:'Frecuencia:', input:'text', w:1, ph: txt(d.frecuencia) },
          { k:'responsable2', label:'Responsable:', input:'text', w:1, ph: txt(d.responsable) },
          { k:'documento2',   label:'#Documento:', input:'text', w:1, ph: txt(d.documento) }
        ] },
      { type:'upload', k:'imagen2', label:'AYUDA VISUAL (página 2)', h:340 },
      { type:'fields', title:'REQUERIMIENTOS SEGURIDAD (página 2)', cols:1, items:[
        { k:'seguridad2', label:'REQUERIMIENTOS SEGURIDAD', input:'textarea', rows:6, w:1 }
      ] },
      { type:'cards', items:(d) => {
          const pr = filled(RS(d, 'procedimiento'), 'paso');
          const he = filled(RS(d, 'herramientas'), 'herramienta');
          const ca = filled(RS(d, 'cambios'), 'cambio');
          if (!pr.length && !he.length && !txt(d.proceso)) return [];
          return [
            { label:'PASOS DEL PROCEDIMIENTO', value: fmt(pr.length, 'n0'), tone: pr.length ? 'ok' : 'warn' },
            { label:'HERRAMIENTAS LISTADAS', value: fmt(he.length, 'n0') },
            { label:'AYUDA VISUAL', value: (d.imagen ? 'SÍ' : 'NO'), tone: d.imagen ? 'ok' : 'bad',
              hint:'Es el corazón de este formato' },
            { label:'REQ. SEGURIDAD', value: txt(d.seguridad) ? 'SÍ' : 'NO',
              tone: txt(d.seguridad) ? 'ok' : 'bad' },
            { label:'REVISIONES REGISTRADAS', value: fmt(ca.length, 'n0'),
              tone: ca.length ? 'ok' : 'warn', hint:'Control de cambios' },
            { label:'APROBACIÓN', value: txt(d.aprobado) ? 'APROBADO' : 'PENDIENTE',
              tone: txt(d.aprobado) ? 'ok' : 'warn' }
          ];
        } },
      { type:'note', tone:'info', text:'Publica este formato impreso en el punto donde se ejecuta la actividad y usa la misma numeración del PROCEDIMIENTO en las auditorías de proceso.' },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* PÁGINA 1 (filas 2-31): E3 «Proceso:» → F3:G3 · H3:I3 «Máquina/equipo:» →
         J3:L3 · M3 «Realizadó por:» → N3:O3 · B4 «Area:» → C4:F4 · G4 «Clase:» →
         H4:L4 · M4 «Aprobado por:» → N4:O4 · B5 «Frecuencia:» → C5:F5 ·
         G5 «Responsable:» → H5:K5 · L5:M5 «#Documento:» → N5:O5.
         B7:H7 AYUDA VISUAL (imagen en B8:H25) · J7 HERRAMIENTA (J8:K15) ·
         M7 REQUERIMIENTOS SEGURIDAD (M8:O15) · J16 PROCEDIMIENTO (J17:O25) ·
         B27/C27/E27 Control de Cambios (filas 28-31).
         PÁGINA 2 (filas 33-62): mismo formato desplazado +31 filas. */
      fields:{ proceso:'F3', maquina:'J3', realizo:'N3', area:'C4', clase:'H4', aprobado:'N4',
               frecuencia:'C5', responsable:'H5', documento:'N5', seguridad:'M8',
               proceso2:'F34', maquina2:'J34', realizo2:'N34', area2:'C35', clase2:'H35',
               aprobado2:'N35', frecuencia2:'C36', responsable2:'H36', documento2:'N36',
               seguridad2:'M39' },
      grids:[
        { key:'herramientas',  rowsAt: E3_HERR, cols:{ herramienta:'J' } },
        { key:'procedimiento', rowsAt: E3_PROC, cols:{ paso:'J' } },
        { key:'cambios',       rowsAt: E3_CAMB, cols:{ revision:'B', fecha:'C', cambio:'E' } }
      ],
      images:[
        { k:'imagen',  anchor:'B8',  w:7, h:18 },
        { k:'imagen2', anchor:'B39', w:7, h:18 }
      ]
    },
    bi: (d) => ({
      'Estandar 3 — pasos del procedimiento': filled(RS(d, 'procedimiento'), 'paso').length,
      'Estandar 3 — herramientas': filled(RS(d, 'herramientas'), 'herramienta').length,
      'Estandar 3 — revisiones (control de cambios)': filled(RS(d, 'cambios'), 'cambio').length,
      'Estandar 3 — ayuda visual': (d.imagen ? 1 : 0) + (d.imagen2 ? 1 : 0),
      'Estandar 3 — aprobado': txt(d.aprobado) ? 1 : 0
    })
  };

  /* ======================================================================
     4 · PLAN DE CONTROL  (hoja «Plan de control»)
     ==================================================================== */
  const T_PLAN = {
    id: 'controlar.plan_de_control',
    mod: 'CONTROLAR',
    sheet: 'Plan de control',
    title: 'PLAN DE CONTROL',
    desc: 'Qué se vigila del proceso mejorado, cómo se mide, cada cuánto, con qué documento y qué se hace cuando se sale de especificación.',
    guide: [
      'Una fila por punto de control. Controla las X críticas de MEDIR y lo que quedó como «mejora a controlar» en MEJORAR.',
      'CARACTERISTICA es qué se vigila; VARIABLE dice si es variable (se mide) o atributo (se cuenta).',
      'ESPECIFICACIONES es el límite aceptable; TECNICA DE MEDICION, con qué se mide; METODO DE CONTROL, cómo se registra (gráfico de control, checklist, poka-yoke).',
      'MUESTREO: TAMAÑO y FRECUENCIA. Sin frecuencia el control no existe: «cuando se pueda» no es un plan.',
      'TOMA DE DECISIONES: DOCUMENTO donde se registra, ACCIONES CORRECTIVAS cuando se sale de especificación y RESPONSABLE (un cargo, no un área).',
      'Firma el pie del formato: APROBADO, REALIZADO y ACTUALIZACION son la evidencia de despliegue ante la ARL y la empresa.'
    ],
    blocks: [
      { type:'fields', title:'PLAN DE CONTROL — Encabezado', cols:3, items:(d, ctx) => [
        { k:'proceso',   label:'PROCESO:', input:'text', w:2, ph: procesoProyecto(ctx) },
        { k:'documento', label:'# DOCUMENTO', input:'text', w:1, ph:'Ej.: PC-REH-001' },
        { k:'fecha',     label:'FECHA:', input:'date', w:1, ph: hoy() },
        { k:'pag',       label:'PAG:', input:'text', w:1, ph:'1 de 1' },
        { k:'producto',  label:'PRODUCTO:', input:'text', w:1,
          ph:'Servicio o producto resultante del proceso' },
        { k:'autorizacion', label:'AUTORIZACION:', input:'text', w:1,
          ph:'Quién autoriza el plan de control' },
        { k:'elaboro',   label:'ELABORO:', input:'text', w:1, ph: liderProyecto(ctx) }
      ] },
      { type:'note', tone:'info', text:'GRUPOS DEL FORMATO · PROCESO (Nº, PASOS, CARACTERISTICA, VARIABLE) · ' +
        'MEDICION (ESPECIFICACIONES, TECNICA DE MEDICION, METODO DE CONTROL) · ' +
        'MUESTREO (TAMAÑO, FRECUENCIA) · TOMA DE DECISIONES (DOCUMENTO, ACCIONES CORRECTIVAS, RESPONSABLE).' },
      { type:'grid', key:'rows', title:'PLAN DE CONTROL', min:8, max:30,
        addLabel:'Agregar punto de control',
        rowStyle:(r) => {
          if (!txt(r.paso) && !txt(r.caracteristica)) return '';
          const ok = txt(r.especificaciones) && txt(r.tecnica) && txt(r.frecuencia) &&
                     txt(r.acciones) && txt(r.responsable);
          return ok ? 'cell-ok' : 'cell-warn';
        },
        cols:(d, ctx) => {
          const ps = pasosProceso(ctx);
          const mc = mejorasAControlar(ctx);
          const cs = causasRaiz(ctx);
          return [
            { k:'n', label:'Nº', ro:true, w:44, calc:(r, i) => i + 1 },
            { k:'paso', label:'PASOS', input:'textarea', rows:2, w:190,
              ph: first(ps.length ? corta(ps[0].steps, 40) : '', mc.length ? corta(mc[0], 40) : '',
                        'Paso del proceso a controlar') },
            { k:'caracteristica', label:'CARACTERISTICA', input:'textarea', rows:2, w:180,
              ph: cs.length ? corta(cs[0], 40) : 'Qué se vigila (CTQ / X crítica)' },
            { k:'variable', label:'VARIABLE', input:'select', w:130,
              opts:['Variable (se mide)', 'Atributo (se cuenta)'],
              help:'Variable = dato continuo · Atributo = pasa/no pasa' },
            { k:'especificaciones', label:'ESPECIFICACIONES', input:'textarea', rows:2, w:180,
              ph:'Límite aceptable (LIE / LSE / meta)' },
            { k:'tecnica', label:'TECNICA DE MEDICION', input:'text', w:170,
              ph:'Instrumento o método de medición' },
            { k:'metodo', label:'METODO DE CONTROL', input:'text', w:170,
              ph:'Gráfico de control, checklist, poka-yoke, auditoría' },
            { k:'tamano', label:'TAMAÑO', input:'text', w:100, ph:'n de la muestra' },
            { k:'frecuencia', label:'FRECUENCIA', input:'text', w:130,
              ph:'Diaria, semanal, por lote, por atención' },
            { k:'documento', label:'DOCUMENTO', input:'text', w:150,
              ph:'Registro donde queda la evidencia' },
            { k:'acciones', label:'ACCIONES CORRECTIVAS', input:'textarea', rows:2, w:210,
              ph:'Qué se hace cuando el resultado sale de especificación' },
            { k:'responsable', label:'RESPONSABLE', input:'text', w:150, ph:'Cargo responsable' }
          ];
        },
        foot:[
          { k:'__label', label:'PUNTOS DE CONTROL' },
          { k:'caracteristica', fmt:'n0', calc:(rows) => filled(rows, 'caracteristica').length },
          { k:'frecuencia', fmt:'n0', calc:(rows) => filled(rows, 'frecuencia').length },
          { k:'responsable', fmt:'n0', calc:(rows) => filled(rows, 'responsable').length }
        ] },
      { type:'note', tone:'warn', text:'En el Excel original la última columna dice «RESPONASBLE» (error de digitación del formato). ' +
        'La aplicación muestra «RESPONSABLE»; la celda exportada es la misma (M7).' },
      { type:'fields', title:'Pie del formato', cols:4, items:[
        { k:'aprobado',     label:'APROBADO:', input:'textarea', rows:3, w:1,
          ph:'Nombre, cargo y fecha' },
        { k:'realizado',    label:'REALIZADO:', input:'textarea', rows:3, w:1,
          ph:'Nombre, cargo y fecha' },
        { k:'actualizacion', label:'ACTUALIZACION:', input:'textarea', rows:3, w:1,
          ph:'Fecha de la próxima revisión del plan' },
        { k:'comentarios',  label:'COMENTARIOS:', input:'textarea', rows:3, w:1 }
      ] },
      { type:'cards', items:(d) => {
          const rows = RS(d, 'rows').filter(r => txt(r.paso) || txt(r.caracteristica));
          if (!rows.length) return [];
          const c = k => filled(rows, k).length;
          const comp = rows.filter(r => txt(r.especificaciones) && txt(r.tecnica) &&
                                        txt(r.frecuencia) && txt(r.acciones) && txt(r.responsable)).length;
          return [
            { label:'PUNTOS DE CONTROL', value: fmt(rows.length, 'n0'), tone:'ok' },
            { label:'CON ESPECIFICACIÓN', value: fmt(c('especificaciones'), 'n0') + ' / ' + fmt(rows.length, 'n0'),
              tone: c('especificaciones') === rows.length ? 'ok' : 'warn' },
            { label:'CON FRECUENCIA', value: fmt(c('frecuencia'), 'n0') + ' / ' + fmt(rows.length, 'n0'),
              tone: c('frecuencia') === rows.length ? 'ok' : 'bad',
              hint:'Sin frecuencia no hay control' },
            { label:'CON ACCIÓN CORRECTIVA', value: fmt(c('acciones'), 'n0') + ' / ' + fmt(rows.length, 'n0'),
              tone: c('acciones') === rows.length ? 'ok' : 'warn' },
            { label:'CON RESPONSABLE', value: fmt(c('responsable'), 'n0') + ' / ' + fmt(rows.length, 'n0'),
              tone: c('responsable') === rows.length ? 'ok' : 'bad' },
            { label:'PLAN COMPLETO', value: fmt(safeDiv(comp, rows.length), 'p0'),
              tone: comp === rows.length ? 'ok' : (comp ? 'warn' : 'bad'),
              hint: comp + ' de ' + rows.length + ' filas completas' }
          ];
        } },
      { type:'note', tone:'warn', text:(d, ctx) => {
          const rows = RS(d, 'rows').filter(r => txt(r.paso) || txt(r.caracteristica));
          const mc = mejorasAControlar(ctx);
          const p = [];
          if (!rows.length && mc.length)
            p.push('En MEJORAR quedaron ' + mc.length + ' mejora(s) declarada(s) «a controlar» y el plan de control está vacío.');
          const sinResp = rows.filter(r => !txt(r.responsable)).length;
          if (sinResp) p.push(sinResp + ' punto(s) de control sin responsable: lo que es de todos no es de nadie.');
          const sinAcc = rows.filter(r => !txt(r.acciones)).length;
          if (sinAcc) p.push(sinAcc + ' punto(s) sin acción correctiva: el control sirve para reaccionar, no sólo para observar.');
          if (!txt(d.aprobado) && rows.length) p.push('El plan aún no está APROBADO.');
          return p.join(' ');
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* B3:C3 «PROCESO:» → D3:E3 · F3 «# DOCUMENTO» → G3:H3 · I3 «FECHA:» →
         J3:K3 · L3 «PAG:» → M2:M4 · B4:C4 «PRODUCTO:» → D4:E4 ·
         F4 «AUTORIZACION:» → G4:H4 · I4 «ELABORO:» → J4:K4.
         Grupos en la fila 6 y encabezados en la 7; datos en las filas 8-15.
         Pie: B17:D17 APROBADO (valor B18:D20) · E17 REALIZADO (E18:F20) ·
         G17 ACTUALIZACION (G18:H20) · I17 COMENTARIOS (I18:M20). */
      fields:{ proceso:'D3', documento:'G3', fecha:'J3', pag:'M2', producto:'D4',
               autorizacion:'G4', elaboro:'J4',
               aprobado:'B18', realizado:'E18', actualizacion:'G18', comentarios:'I18' },
      grids:[{ key:'rows', row:8, endRow:15,
               cols:{ n:'B', paso:'C', caracteristica:'D', variable:'E', especificaciones:'F',
                      tecnica:'G', metodo:'H', tamano:'I', frecuencia:'J', documento:'K',
                      acciones:'L', responsable:'M' } }]
    },
    bi: (d) => {
      const rows = RS(d, 'rows').filter(r => txt(r.paso) || txt(r.caracteristica));
      const c = k => filled(rows, k).length;
      const comp = rows.filter(r => txt(r.especificaciones) && txt(r.tecnica) &&
                                    txt(r.frecuencia) && txt(r.acciones) && txt(r.responsable)).length;
      return {
        'Puntos de control': rows.length,
        'Controles con especificación': c('especificaciones'),
        'Controles con frecuencia': c('frecuencia'),
        'Controles con acción correctiva': c('acciones'),
        'Controles con responsable': c('responsable'),
        'Plan de control completo': safeDiv(comp, rows.length),
        'Plan de control aprobado': txt(d.aprobado) ? 1 : 0
      };
    }
  };

  /* ======================================================================
     5 · GRAFICO ANTES Y DESPUES DEL PROYECTO  (hoja «Grafico Antes-Despues»)
     ==================================================================== */
  const T_AD = {
    id: 'controlar.grafico_antes_despues',
    mod: 'CONTROLAR',
    sheet: 'Grafico Antes-Despues',
    title: 'GRAFICO ANTES Y DESPUES DEL PROYECTO',
    desc: 'Compara el mismo criterio antes y después de la mejora, periodo a periodo, y cuantifica la variación lograda.',
    guide: [
      'Usa EXACTAMENTE el mismo criterio, la misma unidad y la misma forma de medir que en la línea base de MEDIR.',
      'ANTES son los periodos previos a la implementación; DESPUES los periodos posteriores, con al menos 4-6 puntos para que el cambio sea creíble.',
      'Indica si en tu métrico «menor es mejor» (tiempos, reprocesos, quejas) o «mayor es mejor» (cumplimiento, satisfacción): de eso depende el signo de la mejora.',
      'La variación % lograda es la cifra que se lleva al A3 final, al cierre del charter y al informe para la ARL.',
      'En COMENTARIOS registra qué cambió entre los dos periodos: sin contexto el gráfico se presta para discusiones.'
    ],
    blocks: [
      { type:'fields', title:'GRAFICO ANTES Y DESPUES DEL PROYECTO', cols:3,
        items:(d, ctx) => {
          const sm = serieMedir(ctx), bl = baseLineDefinir(ctx);
          return [
            { k:'criterio', label:'Criterio:', input:'text', w:2,
              ph: first(sm.criterio, bl.proceso, 'Métrico comparado y su unidad') },
            { k:'direccion', label:'Dirección del métrico', input:'select', w:1,
              opts:['Menor es mejor', 'Mayor es mejor'],
              hint:'Define si la mejora es bajar o subir el indicador' }
          ];
        } },
      { type:'note', tone:'info', text:(d, ctx) => {
          const sm = serieMedir(ctx), bl = baseLineDefinir(ctx);
          const p = [];
          if (bl.n) p.push('Línea base de DEFINIR: ' + fmt(bl.prom, 'n2') + ' (' + bl.n + ' puntos)');
          if (sm.n) p.push('Serie de MEDIR: ' + fmt(sm.prom, 'n2') + ' en ' + sm.n + ' periodos');
          return p.length ? 'Referencia para la columna ANTES · ' + p.join(' · ') + '.'
                          : 'Carga primero la línea base en DEFINIR › Series de tiempo o en MEDIR › Grafico Serie de tiempo.';
        } },
      { type:'grid', key:'rows', title:'Periodo · ANTES · DESPUES', min:13, max:26,
        addLabel:'Agregar periodo',
        cols:(d) => {
          const menor = txt(d.direccion) !== 'Mayor es mejor';
          return [
            { k:'periodo', label:'Periodo', input:'text', w:150, ph:'Mes, semana o periodo' },
            { k:'antes',   label:'ANTES', input:'number', step:'any', align:'right', w:130 },
            { k:'despues', label:'DESPUES', input:'number', step:'any', align:'right', w:130 },
            { k:'dif', label:'Variación', ro:true, fmt:'n2', w:120,
              calc:(r) => (isNum(r.antes) && isNum(r.despues)) ? num(r.despues) - num(r.antes) : NaN,
              tone:(v) => !isFinite(v) ? '' : ((menor ? v < 0 : v > 0) ? 'ok' : (v === 0 ? '' : 'bad')) },
            { k:'pct', label:'Variación %', ro:true, fmt:'p1', w:120, databar:true,
              calc:(r) => (isNum(r.antes) && isNum(r.despues))
                ? safeDiv(num(r.despues) - num(r.antes), num(r.antes)) : NaN }
          ];
        },
        foot:[
          { k:'__label', label:'PROMEDIO' },
          { k:'antes',   fmt:'n2', calc:(rows) => avg(rows, 'antes') },
          { k:'despues', fmt:'n2', calc:(rows) => avg(rows, 'despues') },
          { k:'dif',     fmt:'n2', calc:(rows) => avg(rows, 'despues') - avg(rows, 'antes') },
          { k:'pct',     fmt:'p1', calc:(rows) =>
              safeDiv(avg(rows, 'despues') - avg(rows, 'antes'), avg(rows, 'antes')) }
        ] },
      { type:'chart', kind:'beforeAfter', title:'GRAFICO ANTES Y DESPUES DEL PROYECTO', h:360,
        data:(d) => {
          const rows = RS(d, 'rows').filter(r => txt(r.periodo) !== '' || isNum(r.antes) || isNum(r.despues));
          const labels  = rows.map((r, i) => txt(r.periodo) || MESES[i] || String(i + 1));
          const antes   = rows.map(r => isNum(r.antes) ? num(r.antes) : null);
          const despues = rows.map(r => isNum(r.despues) ? num(r.despues) : null);
          const s = adStats(d);
          return {
            labels: labels, antes: antes, despues: despues,
            before: antes, after: despues,
            values: despues, values2: antes,
            series: [{ name:'ANTES', values: antes }, { name:'DESPUES', values: despues }],
            names: ['ANTES', 'DESPUES'],
            meanBefore: s.ma, meanAfter: s.mb,
            title: txt(d.criterio), name: txt(d.criterio), ylabel: txt(d.criterio)
          };
        } },
      { type:'cards', items:(d) => {
          const s = adStats(d);
          if (!s.A.length && !s.B.length) return [];
          const mej = adMejoro(s), mp = adMejoraPct(s);
          return [
            { label:'PROMEDIO ANTES', value: fmt(s.ma, 'n2'), hint: s.A.length + ' periodo(s)' },
            { label:'PROMEDIO DESPUES', value: fmt(s.mb, 'n2'), hint: s.B.length + ' periodo(s)' },
            { label:'VARIACIÓN ABSOLUTA', value: fmt(s.dif, 'n2'),
              tone: mej === null ? '' : (mej ? 'ok' : 'bad') },
            { label:'VARIACIÓN % LOGRADA', value: isFinite(s.pct) ? fmt(s.pct, 'p1') : '—',
              tone: mej === null ? '' : (mej ? 'ok' : 'bad'),
              hint: (s.menorMejor ? 'Menor es mejor' : 'Mayor es mejor') },
            { label:'MEJORA LOGRADA', value: isFinite(mp) ? fmt(mp, 'p1') : '—',
              tone: mp > 0 ? 'ok' : (mp < 0 ? 'bad' : ''),
              hint:'Variación ya orientada: positiva = mejora' },
            { label:'PERIODOS COMPARADOS', value: fmt(Math.min(s.A.length, s.B.length), 'n0'),
              tone: Math.min(s.A.length, s.B.length) >= 4 ? 'ok' : 'warn',
              hint:'Recomendado ≥ 4 en cada lado' }
          ];
        } },
      { type:'fields', title:'Comentarios', cols:1, items:[
        { k:'comentarios', label:'Comentarios', input:'textarea', rows:8, w:1,
          ph:'Qué cambió entre los dos periodos, desde cuándo opera la mejora, qué factores externos hubo y qué evidencia respalda el dato.' }
      ] },
      { type:'note', tone:'warn', text:(d) => {
          const s = adStats(d);
          if (!s.A.length || !s.B.length) return '';
          const mej = adMejoro(s);
          if (Math.min(s.A.length, s.B.length) < 4)
            return 'Con menos de 4 periodos a cada lado el cambio puede ser variación normal del proceso: agrega más puntos antes de declarar la mejora.';
          if (mej === false)
            return 'El indicador se movió en la dirección CONTRARIA a la esperada: revisa el plan de control, la ejecución del estándar y si la causa raíz era la correcta.';
          return '';
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* B3 «Criterio:» → C3:D3 · E3:E17 comentarios · fila 4 encabezados ·
         datos en las filas 5-17 (13 periodos).  `direccion`, `dif` y `pct` son
         cálculos de la aplicación: la plantilla no tiene esas columnas. */
      fields:{ criterio:'C3', comentarios:'E3' },
      grids:[{ key:'rows', row:5, endRow:17, cols:{ periodo:'B', antes:'C', despues:'D' } }]
    },
    bi: (d) => {
      const s = adStats(d);
      return {
        'Antes-Después — criterio': txt(d.criterio),
        'Antes-Después — promedio antes': isFinite(s.ma) ? s.ma : 0,
        'Antes-Después — promedio después': isFinite(s.mb) ? s.mb : 0,
        'Antes-Después — variación absoluta': isFinite(s.dif) ? s.dif : 0,
        'Antes-Después — variación %': isFinite(s.pct) ? s.pct : 0,
        'Antes-Después — mejora lograda %': isFinite(adMejoraPct(s)) ? adMejoraPct(s) : 0,
        'Antes-Después — periodos comparados': Math.min(s.A.length, s.B.length)
      };
    }
  };

  /* ======================================================================
     6 · A3 CONTROLAR  (hoja «A3 Controlar»)
     ==================================================================== */
  const T_A3C = {
    id: 'controlar.a3_controlar',
    mod: 'CONTROLAR',
    sheet: 'A3 Controlar',
    title: 'A3 — CONTROLAR',
    desc: 'Resumen de una página de la fase CONTROLAR: el proceso bajo control, la estandarización del proceso nuevo, el plan de control y los beneficios logrados.',
    guide: [
      'Se diligencia al final de la fase, con lo que ya quedó documentado en los estándares y en el plan de control.',
      'CONTROL - PROCESO describe cómo queda vigilado el proceso: qué se mide, cada cuánto y quién responde.',
      'ESTANDARIZACION NUEVO PROCESO lista los estándares creados (formato, código, fecha de liberación y dónde se publicaron).',
      'PLAN DE CONTROL se incrusta en vivo desde la hoja «Plan de control»: no lo vuelvas a escribir.',
      'BENEFICIOS va con cifras: variación lograda, ahorro y beneficio no monetizable para la ARL y la empresa.'
    ],
    blocks: [
      { type:'a3', title:'CONTROLAR', cols:2, areas:(d, ctx) => {
          const e = estandaresStats(ctx);
          const pc = planControlStats(ctx);
          const s = adOf(ctx);
          return [
            { k:'control', label:'CONTROL -PROCESO', kind:'text', w:2, h:190,
              ph: pc.n ? ('Proceso vigilado con ' + pc.n + ' punto(s) de control · ' +
                          pc.frecuencia + ' con frecuencia definida · ' + pc.responsable + ' con responsable.')
                       : 'Cómo queda vigilado el proceso: qué se mide, con qué método, cada cuánto y quién responde.' },
            { k:'estandarizacion', label:'ESTANDARIZACION NUEVO PROCESO', kind:'text', w:1, h:260,
              ph: e.total ? ('Estándares creados: ' + e.hojas + ' formato(s) con ' + e.total +
                             ' paso(s)/actividad(es) estandarizado(s). Indica código, fecha de liberación y dónde se publicó.')
                          : 'Estándares de trabajo creados: formato, código, fecha de liberación, responsable y punto de publicación.' },
            { label:'PLAN DE CONTROL', kind:'ref', ref:'controlar.plan_de_control', w:1, h:260 },
            { k:'beneficios', label:'BENEFICIOS', kind:'text', w:1, h:230,
              ph: isFinite(s.pct)
                ? ('Métrico de ' + fmt(s.ma, 'n2') + ' a ' + fmt(s.mb, 'n2') + ' (' +
                   fmt(adMejoraPct(s), 'p1') + ' de mejora). Agrega el ahorro en dinero y el beneficio para el paciente, la ARL y la empresa.')
                : 'Beneficios logrados: variación del métrico, ahorro en dinero y beneficios no monetizables.' },
            { label:'BENEFICIOS — GRAFICO ANTES Y DESPUES', kind:'ref',
              ref:'controlar.grafico_antes_despues', w:1, h:230 }
          ];
        } },
      { type:'cards', items:(d, ctx) => {
          const e = estandaresStats(ctx);
          const pc = planControlStats(ctx);
          const s = adOf(ctx);
          const out = [];
          out.push({ label:'PUNTOS DE CONTROL', value: fmt(pc.n, 'n0'), tone: pc.n ? 'ok' : 'bad',
                     hint:'Hoja «Plan de control»' });
          out.push({ label:'PASOS ESTANDARIZADOS', value: fmt(e.total, 'n0'),
                     tone: e.total ? 'ok' : 'warn', hint: e.hojas + ' formato(s) de estándar' });
          if (isFinite(s.pct))
            out.push({ label:'MEJORA LOGRADA', value: fmt(adMejoraPct(s), 'p1'),
                       tone: adMejoraPct(s) > 0 ? 'ok' : 'bad',
                       hint: fmt(s.ma, 'n2') + ' → ' + fmt(s.mb, 'n2') });
          out.push({ label:'A3 CONTROLAR',
                     value: [d.control, d.estandarizacion, d.beneficios].filter(x => txt(x)).length + ' / 3',
                     tone: [d.control, d.estandarizacion, d.beneficios].filter(x => txt(x)).length === 3 ? 'ok' : 'warn',
                     hint:'Recuadros diligenciados' });
          return out;
        } },
      { type:'note', tone:'warn', text:(d, ctx) => {
          const pc = planControlStats(ctx);
          const e = estandaresStats(ctx);
          if (!pc.n) return 'El plan de control está vacío: sin plan de control la mejora se pierde en pocas semanas.';
          if (!e.total) return 'No hay ningún ESTANDAR DE TRABAJO documentado: estandarizar es lo que sostiene la mejora.';
          if (!txt(d.beneficios)) return 'Falta declarar los BENEFICIOS: es lo que la dirección, la ARL y la empresa afiliada leen primero.';
          return '';
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* B2:H2 CONTROLAR · B3:H3 rótulo CONTROL -PROCESO → B4:H8 ·
         B9:D9 rótulo ESTANDARIZACION → B10:D19 · E9:H9 rótulo PLAN DE CONTROL →
         E10:H19 (se incrusta la hoja «Plan de control») ·
         B20:H20 rótulo BENEFICIOS → B21:D28 (texto) y E21:H28 (gráfico). */
      fields:{ control:'B4', estandarizacion:'B10', beneficios:'B21' },
      refs:[
        { k:'planControl', anchor:'E10', ref:'controlar.plan_de_control', w:4, h:10 },
        { k:'grafBenef',   anchor:'E21', ref:'controlar.grafico_antes_despues', w:4, h:8 }
      ]
    },
    bi: (d, ctx) => {
      const pc = planControlStats(ctx), e = estandaresStats(ctx), s = adOf(ctx);
      return {
        'A3 Controlar — recuadros escritos': [d.control, d.estandarizacion, d.beneficios].filter(x => txt(x)).length,
        'A3 Controlar — total recuadros': 3,
        'A3 Controlar — puntos de control': pc.n,
        'A3 Controlar — pasos estandarizados': e.total,
        'A3 Controlar — mejora lograda %': isFinite(adMejoraPct(s)) ? adMejoraPct(s) : 0
      };
    }
  };

  /* ======================================================================
     7 · PROJECT CHARTER — VERSIÓN DE CIERRE  (hoja «Project Charter»)
     Es EL MISMO charter de DEFINIR: todo se lee de 'definir.project_charter'
     (sólo lectura) y aquí sólo se diligencia el cierre del proyecto.
     Fórmulas replicadas: N33/P33/R33 =SUM(...) sin «Cycle time» ·
     K56:K60 y K66:K70 = =D10..=D14 · D69:D73 = =D59..=D63
     ==================================================================== */
  const T_CHARTER = {
    id: 'controlar.charter_cierre',
    mod: 'CONTROLAR',
    sheet: 'Project Charter',
    title: 'Project Charter — CIERRE DEL PROYECTO',
    desc: 'Vista de CIERRE del mismo Project Charter de la fase DEFINIR: todo lo pactado se muestra en sólo lectura y aquí se diligencian los Metricos Clave de cierre (Mejoró / Logrado) y las firmas de cierre.',
    guide: [
      'No es un charter nuevo: es el charter de DEFINIR visto al cerrar. Si algo del acuerdo está mal, corrígelo en DEFINIR › Project Charter.',
      'Metricos Clave - Cierre: el Nombre, el Baseline y el Ideal se heredan de la fase DEFINIR (como el =D59 del original); tú registras Mejoró y Logrado.',
      'LOGRADO se toma del gráfico ANTES-DESPUES o de la serie de seguimiento, no de una estimación.',
      'La columna «Cumple objetivo» compara Logrado contra el Objetivo pactado respetando la dirección del métrico (bajar o subir).',
      'Las firmas de cierre son la aceptación formal del proyecto por el Champion, el Dueño del Proceso, Finanzas, el Mentor y el Facilitador.',
      'Sin firmas de cierre el proyecto no se cierra: queda en seguimiento.'
    ],
    blocks: [
      { type:'note', tone:'info', text:'Esta hoja es el MISMO Project Charter de DEFINIR en su versión de cierre. ' +
        'Los campos grises se leen de DEFINIR › Project Charter y no se editan aquí.' },
      { type:'fields', title:'Project Charter (heredado de DEFINIR — sólo lectura)', cols:2,
        items:[
          { k:'nombre', label:'Nombre del Proyecto', input:'text', ro:true, w:2,
            calc:(d, ctx) => first(T(ctx, 'definir.project_charter').nombre, nombreProyecto(ctx)) },
          { k:'problema', label:'Enunciado del Problema (Problem Statement)', input:'textarea', rows:5,
            ro:true, w:1, calc:(d, ctx) => problemaProyecto(ctx) },
          { k:'businessCase', label:'Business Case', input:'textarea', rows:5, ro:true, w:1,
            calc:(d, ctx) => first(T(ctx, 'definir.project_charter').businessCase,
                                   T(ctx, 'definir.tabla_identificacion').caso) },
          { k:'objetivo', label:'Objetivo del Proyecto', input:'textarea', rows:5, ro:true, w:1,
            calc:(d, ctx) => objetivoProyecto(ctx) },
          { k:'beneficios', label:'Beneficios', input:'textarea', rows:5, ro:true, w:1,
            calc:(d, ctx) => txt(T(ctx, 'definir.project_charter').beneficios) },
          { k:'scopeIn', label:'Scope In', input:'textarea', rows:4, ro:true, w:1,
            calc:(d, ctx) => txt(T(ctx, 'definir.project_charter').scopeIn) },
          { k:'scopeOut', label:'Scope Out', input:'textarea', rows:4, ro:true, w:1,
            calc:(d, ctx) => txt(T(ctx, 'definir.project_charter').scopeOut) },
          { k:'duracion', label:'Duracion del proyecto (semanas)', ro:true, fmt:'n0', w:1,
            calc:(d, ctx) => { const v = T(ctx, 'definir.project_charter').duracion;
                               return txt(v) === '' ? NaN : num(v); } }
        ] },
      { type:'grid', key:'equipo', title:'Equipo del proyecto (heredado)', min:9, max:9, fixed:true,
        cols:[
          { k:'rol', label:'ROL', ro:true, w:190,
            calc:(r, i) => ROLES_CH[i] !== undefined ? ROLES_CH[i] : 'Team member' },
          { k:'nombre', label:'NOMBRE', ro:true, w:320,
            calc:(r, i, rows, d, ctx) => miembro(ctx, i) }
        ] },
      { type:'grid', key:'ahorros', title:'Ahorros pactados (heredado)', min:10, max:10, fixed:true,
        cols:[
          { k:'cat', label:'Category', ro:true, w:170, calc:(r, i) => CAT_AHORROS[i] || '' },
          { k:'hard', label:'Hard Benefit', ro:true, fmt:'money', w:150,
            calc:(r, i, rows, d, ctx) => { const v = chRow(ctx, 'ahorros', i).hard;
                                           return isNum(v) ? num(v) : NaN; } },
          { k:'soft', label:'Soft Benefit', ro:true, fmt:'money', w:150,
            calc:(r, i, rows, d, ctx) => { const v = chRow(ctx, 'ahorros', i).soft;
                                           return isNum(v) ? num(v) : NaN; } },
          { k:'total', label:'Total', ro:true, fmt:'money', w:150,
            calc:(r, i, rows, d, ctx) => { const a = chRow(ctx, 'ahorros', i);
                                           return (isNum(a.hard) || isNum(a.soft))
                                             ? num(a.hard) + num(a.soft) : NaN; } }
        ],
        rowStyle:(r, i) => (CAT_AHORROS[i] === 'Cycle time' ? 'cell-warn' : ''),
        foot:[
          { k:'__label', label:'Total Benefit' },
          { k:'hard', fmt:'money', calc:(rows, d, ctx) =>
              sumaAhorros(RS(T(ctx, 'definir.project_charter'), 'ahorros'), 'hard') },
          { k:'soft', fmt:'money', calc:(rows, d, ctx) =>
              sumaAhorros(RS(T(ctx, 'definir.project_charter'), 'ahorros'), 'soft') },
          { k:'total', fmt:'money', calc:(rows, d, ctx) => {
              const a = RS(T(ctx, 'definir.project_charter'), 'ahorros');
              return sumaAhorros(a, 'hard') + sumaAhorros(a, 'soft');
            } }
        ] },
      { type:'note', tone:'info', text:'«Cycle time» NO entra en el Total Benefit: la fórmula del original es =SUM(N23:O29,N31:O32).' },
      { type:'grid', key:'plan', title:'Plan de seguimiento - Cronograma general (heredado)',
        min:5, max:5, fixed:true,
        cols:[
          { k:'fase', label:'Fase', ro:true, w:170, calc:(r, i) => FASES_DMAIC[i] || '' },
          { k:'inicio', label:'Fecha inicio', input:'date', ro:true, w:160,
            calc:(r, i, rows, d, ctx) => txt(chRow(ctx, 'plan', i).inicio) },
          { k:'fin', label:'fecha final', input:'date', ro:true, w:160,
            calc:(r, i, rows, d, ctx) => txt(chRow(ctx, 'plan', i).fin) },
          { k:'dias', label:'Días', ro:true, fmt:'n0', w:100,
            calc:(r, i, rows, d, ctx) => {
              const p = chRow(ctx, 'plan', i);
              const n = dDiff(p.inicio, p.fin);
              return isFinite(n) ? n + 1 : NaN;
            } }
        ] },
      { type:'grid', key:'metDef', title:'Metricos Clave - fase DEFINIR (heredado)',
        min:7, max:7, fixed:true,
        cols:[
          { k:'n', label:'#', ro:true, w:44, calc:(r, i) => i + 1 },
          { k:'nombre', label:'Nombre', ro:true, w:250,
            calc:(r, i, rows, d, ctx) => txt(chRow(ctx, 'metDef', i).nombre) },
          { k:'existe', label:'Existe', ro:true, w:90,
            calc:(r, i, rows, d, ctx) => txt(chRow(ctx, 'metDef', i).existe) },
          { k:'base', label:'Baseline', ro:true, fmt:'n2', w:120,
            calc:(r, i, rows, d, ctx) => { const v = chRow(ctx, 'metDef', i).base; return isNum(v) ? num(v) : NaN; } },
          { k:'obj', label:'Objetivo', ro:true, fmt:'n2', w:120,
            calc:(r, i, rows, d, ctx) => { const v = chRow(ctx, 'metDef', i).obj; return isNum(v) ? num(v) : NaN; } },
          { k:'ideal', label:'Ideal', ro:true, fmt:'n2', w:120,
            calc:(r, i, rows, d, ctx) => { const v = chRow(ctx, 'metDef', i).ideal; return isNum(v) ? num(v) : NaN; } }
        ] },
      { type:'grid', key:'metCie', title:'Metricos Clave - Cierre del Proyecto', min:7, max:7, fixed:true,
        rowStyle:(r, i, rows, d, ctx) => {
          const m = chRow(ctx, 'metDef', i);
          const c = cumpleObjetivo(m.base, m.obj, r.logrado);
          if (c === null) return '';
          return c ? 'cell-ok' : 'cell-warn';
        },
        cols:[
          { k:'n', label:'#', ro:true, w:44, calc:(r, i) => i + 1 },
          /* D69:D73 = =D59..=D63 (el nombre se hereda de la fase DEFINIR) */
          { k:'nombre', label:'Nombre', ro:true, w:250,
            calc:(r, i, rows, d, ctx) => txt(chRow(ctx, 'metDef', i).nombre) },
          { k:'mejoro', label:'Mejoró', input:'select', opts:SI_NO, w:100,
            help:'¿El métrico mejoró respecto de la línea base?' },
          { k:'base', label:'Baseline', ro:true, fmt:'n2', w:120,
            calc:(r, i, rows, d, ctx) => { const v = chRow(ctx, 'metDef', i).base; return isNum(v) ? num(v) : NaN; } },
          { k:'logrado', label:'Logrado', input:'number', step:'any', align:'right', w:120 },
          { k:'ideal', label:'Ideal', ro:true, fmt:'n2', w:120,
            calc:(r, i, rows, d, ctx) => { const v = chRow(ctx, 'metDef', i).ideal; return isNum(v) ? num(v) : NaN; } },
          { k:'delta', label:'Variación', ro:true, fmt:'n2', w:110,
            calc:(r, i, rows, d, ctx) => {
              const b = chRow(ctx, 'metDef', i).base;
              return (isNum(b) && isNum(r.logrado)) ? num(r.logrado) - num(b) : NaN;
            } },
          { k:'pct', label:'Variación %', ro:true, fmt:'p1', w:120,
            calc:(r, i, rows, d, ctx) => {
              const b = chRow(ctx, 'metDef', i).base;
              return (isNum(b) && isNum(r.logrado)) ? safeDiv(num(r.logrado) - num(b), num(b)) : NaN;
            } },
          { k:'cumple', label:'Cumple objetivo', ro:true, w:130,
            calc:(r, i, rows, d, ctx) => {
              const m = chRow(ctx, 'metDef', i);
              const c = cumpleObjetivo(m.base, m.obj, r.logrado);
              return c === null ? '' : (c ? 'SÍ' : 'NO');
            } }
        ] },
      { type:'grid', key:'firmasDef', title:'Firma y Fecha - fase DEFINIR (heredado)',
        min:5, max:5, fixed:true,
        cols:[
          /* K56:K60 = =D10..=D14 */
          { k:'nombre', label:'Nombre', ro:true, w:230,
            calc:(r, i, rows, d, ctx) => first(miembro(ctx, i), ROLES_CH[i]) },
          { k:'firma', label:'Firma', ro:true, w:230,
            calc:(r, i, rows, d, ctx) => txt(chRow(ctx, 'firmasDef', i).firma) },
          { k:'fecha', label:'Fecha', input:'date', ro:true, w:160,
            calc:(r, i, rows, d, ctx) => txt(chRow(ctx, 'firmasDef', i).fecha) }
        ] },
      { type:'grid', key:'firmasCie', title:'Firma y Fecha - Cierre del Proyecto',
        min:5, max:5, fixed:true,
        cols:[
          /* K66:K70 = =D10..=D14 */
          { k:'nombre', label:'Nombre', ro:true, w:230,
            calc:(r, i, rows, d, ctx) => first(miembro(ctx, i), ROLES_CH[i]) },
          { k:'firma', label:'Firma', input:'text', w:230, ph:'Nombre de quien firma el cierre' },
          { k:'fecha', label:'Fecha', input:'date', w:160 }
        ] },
      { type:'cards', items:(d, ctx) => {
          const met = RS(d, 'metCie');
          const conDato = met.filter((r, i) => isNum(r.logrado) && txt(chRow(ctx, 'metDef', i).nombre)).length;
          const cumplen = met.filter((r, i) => {
            const m = chRow(ctx, 'metDef', i);
            return cumpleObjetivo(m.base, m.obj, r.logrado) === true;
          }).length;
          const mejor = met.filter(r => /^y/i.test(txt(r.mejoro))).length;
          const firmas = filled(RS(d, 'firmasCie'), 'firma').length;
          const a = RS(T(ctx, 'definir.project_charter'), 'ahorros');
          const tb = sumaAhorros(a, 'hard') + sumaAhorros(a, 'soft');
          const defs = filled(RS(T(ctx, 'definir.project_charter'), 'metDef'), 'nombre').length;
          return [
            { label:'MÉTRICOS DE CIERRE', value: fmt(conDato, 'n0') + ' / ' + fmt(defs || 7, 'n0'),
              tone: defs && conDato >= defs ? 'ok' : 'warn', hint:'Con valor LOGRADO' },
            { label:'MARCADOS «MEJORÓ»', value: fmt(mejor, 'n0'), tone: mejor ? 'ok' : 'warn' },
            { label:'CUMPLEN OBJETIVO', value: fmt(cumplen, 'n0') + ' / ' + fmt(conDato, 'n0'),
              tone: conDato && cumplen === conDato ? 'ok' : (cumplen ? 'warn' : 'bad') },
            { label:'TOTAL BENEFIT PACTADO', value: fmt(tb, 'money'), hint:'Sin «Cycle time»' },
            { label:'FIRMAS DE CIERRE', value: fmt(firmas, 'n0') + ' / 5',
              tone: firmas === 5 ? 'ok' : (firmas ? 'warn' : 'bad') },
            { label:'PROYECTO CERRADO', value: (firmas === 5 && conDato) ? 'SÍ' : 'NO',
              tone: (firmas === 5 && conDato) ? 'ok' : 'warn' }
          ];
        } },
      { type:'note', tone:'warn', text:(d, ctx) => {
          const defs = filled(RS(T(ctx, 'definir.project_charter'), 'metDef'), 'nombre').length;
          if (!defs) return 'No hay Metricos Clave registrados en DEFINIR › Project Charter: sin ellos no hay contra qué comparar el cierre.';
          const met = RS(d, 'metCie').filter((r, i) => isNum(r.logrado)).length;
          if (!met) return 'Falta registrar el valor LOGRADO de los métricos clave: es la evidencia del resultado del proyecto.';
          const firmas = filled(RS(d, 'firmasCie'), 'firma').length;
          if (firmas < 5) return 'Faltan ' + (5 - firmas) + ' firma(s) de cierre: el proyecto no se cierra formalmente hasta que estén todas.';
          return '';
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* Mismo mapeo del Project Charter de DEFINIR, pero sobre la hoja
         «Project Charter» del libro 05CONTROLAR: así el libro de cierre sale
         completo.  No se escriben las celdas con fórmula: N33/P33/R33,
         K56:K60, K66:K70 y D69:D73. */
      fields:{ nombre:'D6', problema:'D21', businessCase:'D29', objetivo:'D37',
               scopeIn:'D46', scopeOut:'D51', duracion:'R53', beneficios:'J7' },
      grids:[
        { key:'equipo',    row:10, cols:{ nombre:'E' } },
        { key:'ahorros',   row:23, cols:{ hard:'N', soft:'P', total:'R' } },
        { key:'plan',      rowsAt:[39, 41, 43, 46, 50], cols:{ fase:'J', inicio:'P', fin:'R' } },
        { key:'metDef',    row:57, cols:{ nombre:'D', existe:'E', base:'F', obj:'G', ideal:'H' } },
        { key:'metCie',    row:67, cols:{ mejoro:'E', base:'F', logrado:'G', ideal:'H' } },
        { key:'firmasDef', row:56, cols:{ firma:'N', fecha:'P' } },
        { key:'firmasCie', row:66, cols:{ firma:'N', fecha:'P' } }
      ]
    },
    bi: (d, ctx) => {
      const met = RS(d, 'metCie');
      const conDato = met.filter(r => isNum(r.logrado)).length;
      const cumplen = met.filter((r, i) => {
        const m = chRow(ctx, 'metDef', i);
        return cumpleObjetivo(m.base, m.obj, r.logrado) === true;
      }).length;
      const firmas = filled(RS(d, 'firmasCie'), 'firma').length;
      return {
        'Cierre — métricos con resultado': conDato,
        'Cierre — métricos que cumplen objetivo': cumplen,
        'Cierre — métricos marcados Mejoró': met.filter(r => /^y/i.test(txt(r.mejoro))).length,
        'Cierre — cumplimiento de objetivos': safeDiv(cumplen, conDato),
        'Cierre — firmas de cierre': firmas,
        'Proyecto cerrado': (firmas === 5 && conDato) ? 1 : 0
      };
    }
  };

  /* ======================================================================
     8 · A3 FINAL — A3 LEAN SIX SIGMA DMAIC  (hoja «A3 final»)
     Pieza de cierre del proyecto: se auto-arma con lo mejor de las 5 fases.
     ==================================================================== */
  const T_A3F = {
    id: 'controlar.a3_final',
    mod: 'CONTROLAR',
    sheet: 'A3 final',
    title: 'A3 LEAN SIX SIGMA DMAIC — A3 FINAL DEL PROYECTO',
    desc: 'El A3 consolidado de todo el proyecto (DEFINIR, MEDIR, ANALIZAR, MEJORAR y CONTROLAR) en una sola página: es la pieza de cierre que se entrega a la ARL y a la empresa afiliada.',
    guide: [
      'Usa el botón «Armar A3 final»: trae automáticamente el problema y el objetivo (DEFINIR), la línea base (MEDIR), la causa raíz (ANALIZAR), las soluciones (MEJORAR) y el plan de control (CONTROLAR).',
      'El botón NO sobrescribe lo que ya escribiste: sólo llena los recuadros vacíos.',
      'Ajusta la redacción: el A3 se lee en 5 minutos y debe entenderse sin explicación verbal.',
      'PLAN DE CONTROL y el gráfico ANTES-DESPUES se incrustan en vivo desde las hojas de esta fase.',
      'LECCIONES APRENDIDAS es lo que evita repetir el error en el siguiente proyecto; RECONOCIMIENTO EQUIPO es lo que hace que haya un siguiente proyecto.',
      'Si algo no cabe en la página, sobra: el A3 obliga a priorizar.'
    ],
    blocks: [
      { type:'fields', title:'A3 LEAN SIX SIGMA DMAIC — Encabezado', cols:3, items:(d, ctx) => [
        { k:'proyecto', label:'PROYECTO:', input:'text', w:1, ph: nombreProyecto(ctx) },
        { k:'area',     label:'AREA:', input:'text', w:1, ph: areaProyecto(ctx) },
        { k:'periodo',  label:'PERIODO:', input:'text', w:1,
          ph:'Ej.: enero – junio de 2026' }
      ] },
      { type:'html', render:() =>
        '<div class="note" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
        '<span style="flex:1">Arma el A3 final con lo mejor de las 5 fases del proyecto. ' +
        'Sólo se llenan los recuadros que estén vacíos.</span>' +
        '<button class="btn sm p" onclick="CTRL_armarA3final()">⤵ Armar A3 final con las 5 fases</button></div>' },
      { type:'fields', title:'Títulos de los recuadros (bandas del formato original)', cols:5, items:[
        { k:'t1', label:'Título recuadro izq. superior', input:'text', w:1,
          ph:'DEFINIR — PROBLEMA Y OBJETIVO' },
        { k:'t2', label:'Título recuadro izq. inferior (B16)', input:'text', w:1,
          ph:'MEDIR Y ANALIZAR — LINEA BASE Y CAUSA RAIZ' },
        { k:'t3', label:'Título recuadro der. 1 (H12)', input:'text', w:1,
          ph:'MEJORAR — SOLUCIONES IMPLEMENTADAS' },
        { k:'t4', label:'Título recuadro der. 2 (H20)', input:'text', w:1,
          ph:'CONTROLAR — ESTANDARIZACION Y PLAN DE CONTROL' },
        { k:'t5', label:'Título pie izquierdo (B30)', input:'text', w:1,
          ph:'RESULTADOS — ANTES Y DESPUES' }
      ] },
      { type:'a3', title:'A3 LEAN SIX SIGMA DMAIC', cols:2, areas:(d, ctx) => [
        { k:'definir', label: first(d.t1, 'DEFINIR — PROBLEMA Y OBJETIVO'), kind:'text', w:1, h:300,
          ph: resumenDefinir(ctx) || 'Problema, caso del negocio y objetivo del proyecto (DEFINIR).' },
        { k:'mejorar', label: first(d.t3, 'MEJORAR — SOLUCIONES IMPLEMENTADAS'), kind:'text', w:1, h:300,
          ph: resumenMejorar(ctx) || 'Soluciones implementadas y avance del plan de acción (MEJORAR).' },
        { k:'medirAnalizar', label: first(d.t2, 'MEDIR Y ANALIZAR — LINEA BASE Y CAUSA RAIZ'),
          kind:'text', w:1, h:300,
          ph: resumenMedirAnalizar(ctx) || 'Línea base medida y causa raíz validada (MEDIR + ANALIZAR).' },
        { k:'controlar', label: first(d.t4, 'CONTROLAR — ESTANDARIZACION Y PLAN DE CONTROL'),
          kind:'text', w:1, h:300,
          ph: resumenControlar(ctx) || 'Estandarización, plan de control y beneficios logrados (CONTROLAR).' },
        { label: first(d.t5, 'RESULTADOS — ANTES Y DESPUES'), kind:'ref',
          ref:'controlar.grafico_antes_despues', w:1, h:230 },
        { label:'PLAN DE CONTROL', kind:'ref', ref:'controlar.plan_de_control', w:1, h:230 },
        { k:'lecciones', label:'LECCIONES APRENDIDAS', kind:'text', w:1, h:220,
          ph:'Qué haríamos igual, qué haríamos distinto y qué se replica en otros procesos o en otras empresas afiliadas.' },
        { k:'reconocimiento', label:'RECONOCIMIENTO EQUIPO', kind:'text', w:1, h:220,
          ph: (function(){
            const eq = [];
            for (let i = 0; i < 6; i++){ const m = miembro(ctx, i); if (m) eq.push(m); }
            return eq.length ? 'Equipo: ' + eq.join(' · ') + '. Reconoce el aporte de cada uno.'
                             : 'Nombre de cada integrante y su aporte concreto al resultado.';
          })() }
      ] },
      { type:'fields', title:'Cierre', cols:2, items:(d, ctx) => [
        { k:'empresa', label:'Empresa:', input:'text', w:1, ph: empresaProyecto(ctx) },
        { k:'fecha',   label:'Fecha de cierre', input:'date', w:1, ph: hoy() }
      ] },
      { type:'cards', items:(d, ctx) => {
          const s = adOf(ctx);
          const pc = planControlStats(ctx);
          const e = estandaresStats(ctx);
          const ch = T(ctx, 'controlar.charter_cierre');
          const firmas = filled(RS(ch, 'firmasCie'), 'firma').length;
          const a = RS(T(ctx, 'definir.project_charter'), 'ahorros');
          const tb = sumaAhorros(a, 'hard') + sumaAhorros(a, 'soft');
          const secc = ['definir', 'medirAnalizar', 'mejorar', 'controlar', 'lecciones', 'reconocimiento']
            .filter(k => txt(d[k])).length;
          return [
            { label:'A3 FINAL DILIGENCIADO', value: secc + ' / 6',
              tone: secc === 6 ? 'ok' : (secc ? 'warn' : 'bad'), hint:'Recuadros con contenido' },
            { label:'MEJORA LOGRADA', value: isFinite(adMejoraPct(s)) ? fmt(adMejoraPct(s), 'p1') : '—',
              tone: adMejoraPct(s) > 0 ? 'ok' : (isFinite(adMejoraPct(s)) ? 'bad' : ''),
              hint: isFinite(s.ma) ? fmt(s.ma, 'n2') + ' → ' + fmt(s.mb, 'n2') : 'Hoja «Grafico Antes-Despues»' },
            { label:'BENEFICIO TOTAL', value: fmt(tb, 'money'), tone: tb ? 'ok' : '',
              hint:'Total Benefit del Project Charter' },
            { label:'PUNTOS DE CONTROL', value: fmt(pc.n, 'n0'), tone: pc.n ? 'ok' : 'bad' },
            { label:'PASOS ESTANDARIZADOS', value: fmt(e.total, 'n0'), tone: e.total ? 'ok' : 'warn' },
            { label:'FIRMAS DE CIERRE', value: fmt(firmas, 'n0') + ' / 5',
              tone: firmas === 5 ? 'ok' : 'warn', hint:'Project Charter — cierre' }
          ];
        } },
      { type:'note', tone:'warn', text:(d, ctx) => {
          const faltan = [];
          if (!txt(d.definir)) faltan.push('DEFINIR');
          if (!txt(d.medirAnalizar)) faltan.push('MEDIR/ANALIZAR');
          if (!txt(d.mejorar)) faltan.push('MEJORAR');
          if (!txt(d.controlar)) faltan.push('CONTROLAR');
          if (faltan.length) return 'Faltan recuadros del A3 final: ' + faltan.join(', ') +
            '. Usa el botón «Armar A3 final con las 5 fases» y ajusta la redacción.';
          if (!txt(d.lecciones)) return 'Escribe las LECCIONES APRENDIDAS: es el único entregable del proyecto que sirve para el siguiente.';
          return '';
        } },
      { type:'insight' }
    ],
    xl: { file: XLF,
      /* B2:K2 título · B3 «PROYECTO:» → C3:F3 · G3:H3 «AREA:» → I3 ·
         J3 «PERIODO:» → K3 · columna izquierda B4:F15 y B17:F29 (banda de
         título en B16:F16) · columna derecha H4:K11, H13:K19 y H21:K29
         (bandas de título en H12:K12 y H20:K20) · G4:G29 separador ·
         B30:H30 banda de pie · I30 «Empresa:» → J30:K30 ·
         B32:H32 LECCIONES APRENDIDAS → B33:H38 ·
         I32:K32 RECONOCIMIENTO EQUIPO → I33:K38 */
      fields:{ proyecto:'C3', area:'I3', periodo:'K3',
               definir:'B4', t2:'B16', medirAnalizar:'B17',
               mejorar:'H4', t3:'H12', controlar:'H13', t4:'H20',
               t5:'B30', empresa:'J30', lecciones:'B33', reconocimiento:'I33' },
      /* H21:K29 es la única área libre para un gráfico: allí va el ANTES-DESPUES.
         El PLAN DE CONTROL se incrusta en la app y viaja como hoja propia del
         mismo libro, por eso no ocupa un área del A3 en el Excel. */
      refs:[{ k:'grafFinal', anchor:'H21', ref:'controlar.grafico_antes_despues', w:4, h:9 }]
    },
    bi: (d, ctx) => {
      const s = adOf(ctx), pc = planControlStats(ctx), e = estandaresStats(ctx);
      const secc = ['definir', 'medirAnalizar', 'mejorar', 'controlar', 'lecciones', 'reconocimiento']
        .filter(k => txt(d[k])).length;
      return {
        'A3 final — recuadros diligenciados': secc,
        'A3 final — total recuadros': 6,
        'A3 final — mejora lograda %': isFinite(adMejoraPct(s)) ? adMejoraPct(s) : 0,
        'A3 final — puntos de control': pc.n,
        'A3 final — pasos estandarizados': e.total,
        'A3 final — lecciones aprendidas': txt(d.lecciones) ? 1 : 0
      };
    }
  };

  /* ====================================================================== */
  return [T_EST1, T_EST2, T_EST3, T_PLAN, T_AD, T_A3C, T_CHARTER, T_A3F];

})();

registerTools(SPECS_CONTROLAR);
