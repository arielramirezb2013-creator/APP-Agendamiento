/* ============================================================================
   FLUJO DEL PROYECTO · trazabilidad, propagación y puertas de fase
   ----------------------------------------------------------------------------
   Un proyecto DMAIC es una cadena: el problema define el métrico, el métrico da
   la línea base, la línea base sostiene la causa raíz, la causa raíz justifica
   la solución y la solución se sostiene con el control. Este módulo:
     · resuelve cada HECHO del proyecto desde su fuente canónica,
     · PROPAGA ese hecho a los formatos que lo repiten (sin pisar lo escrito),
     · evalúa la CADENA y señala los eslabones rotos,
     · y abre o cierra la PUERTA de cada fase con criterios explícitos.
   ========================================================================== */
'use strict';

const FLUJO = (function(){

  const D = id => ST.d(id);
  const T = (v) => String(v == null ? '' : v).trim();
  const primero = (...xs) => { for (const x of xs){ if (T(x)) return T(x); } return ''; };
  const primeroNum = (...xs) => { for (const x of xs){ if (isNum(x)) return num(x); } return NaN; };

  /* ==================================================================
     1 · HECHOS — cada dato clave, con su fuente canónica y sus respaldos
     ================================================================ */
  function hechos(){
    const cl = D('definir.clarificacion_problema'), ch = D('definir.project_charter'),
          sm = D('definir.objetivo_smart'),         ti = D('definir.tabla_identificacion'),
          ct = D('definir.arbol_ctq'),              st = D('definir.series_tiempo'),
          pa = D('definir.pareto'),                 be = D('definir.beneficios'),
          a3d= D('definir.a3_definir');
    const yi = D('medir.yield'), dp = D('medir.dpmo'), pp = D('medir.ppm'),
          ry = D('medir.rty_fpy'), va = D('medir.valor_add');
    const cr = D('analizar.descripcion_causa_raiz'), w5 = D('analizar.5_whys'),
          vc = D('analizar.validacion_de_causas');
    const ss = D('mejorar.seleccion_soluciones'), pl = D('mejorar.plan_accion');
    const ad = D('controlar.grafico_antes_despues'), pc = D('controlar.plan_de_control');

    const filaTI = arr(ti.rows).find(r => T(r.ctq)) || {};
    const serie  = vals(arr(st.rows), 'metrico');
    const paretoR = arr(pa.rows).filter(r => isNum(r.fre))
                      .map(r => ({ cat:T(r.cat), fre:num(r.fre) }))
                      .sort((a, b) => b.fre - a.fre);
    const paretoTot = paretoR.reduce((a, r) => a + r.fre, 0);
    let acum = 0; const vitales = [];
    paretoR.forEach(r => { if (acum / (paretoTot || 1) < 0.8){ vitales.push(r); acum += r.fre; } });

    const causasVal = arr(vc.rows).filter(r => num(r.check) === 1 && T(r.causa)).map(r => T(r.causa));
    const causasTot = arr(vc.rows).filter(r => T(r.causa)).length;
    const solElegidas = arr(ss.rows).filter(r => /^s[íi]$/i.test(T(r.solucion)) && T(r.sol)).map(r => T(r.sol));
    const acciones = arr(pl.rows).filter(r => T(r.accion));
    const realizadas = acciones.filter(r => /REALIZADA/i.test(T(r.estatus))).length;

    const antes   = vals(arr(ad.rows), 'antes');
    const despues = vals(arr(ad.rows), 'despues');

    // nivel sigma desde la mejor fuente disponible
    const unidades = sum(arr(dp.rows), 'units');
    const defDpmo  = arr(dp.rows).reduce((a, r) => a + num(r.c1) + num(r.c2) + num(r.c3) + num(r.c4), 0);
    const oport    = ['cat1','cat2','cat3','cat4'].filter(k => T(dp[k])).length || 4;
    let dpmo = (unidades && oport) ? defDpmo / (unidades * oport) * 1e6 : NaN;
    if (!isFinite(dpmo)){
      const u = sum(arr(pp.rows), 'units'), df = sum(arr(pp.rows), 'defects');
      if (u) dpmo = df / u * 1e6;
    }
    if (!isFinite(dpmo) && num(yi.totales)) dpmo = num(yi.malas) / num(yi.totales) * 1e6;

    const yields = [];
    let ent0 = num(ry.inicio);
    arr(ry.rows).forEach(r => {
      const inn = ent0; const out = inn - num(r.defects);
      if (inn > 0) yields.push(out / inn);
      ent0 = out + num(r.rework) - num(r.rework) + num(r.rework);   // entra el retrabajo al siguiente paso
      ent0 = out;
    });
    const rty = yields.length ? yields.reduce((a, b) => a * b, 1) : NaN;

    const vaT = arr(va.rows).filter(r => T(r.categoria) === 'VA').reduce((a, r) => a + num(r.tiempo), 0);
    const totT = sum(arr(va.rows), 'tiempo');

    return {
      problema:   primero(cl.definicion, ch.problema, a3d.problema),
      objetivo:   primero(sm.smart, ch.objetivo, a3d.objetivo),
      metrico:    primero(filaTI.ctq, (arr(ct.rows)[0] || {}).ctq, a3d.metricKey, st.proceso),
      baseline:   primeroNum(filaTI.base, serie.length ? avg(serie) : NaN),
      meta:       primeroNum(filaTI.obj, st.objetivo),
      ideal:      primeroNum(filaTI.ideal),
      ahorro:     primeroNum(filaTI.ahorro, (be.ben || {})['des2.ahorro']),
      serie, vitales, paretoTot,
      dpmo, sigma: isFinite(dpmo) ? sigmaLevel(dpmo) : NaN,
      rty, valorAgregado: totT ? vaT / totT : NaN,
      causaRaiz:  primero(cr.causa1, w5.w1_raiz, D('analizar.a3_analizar').raiz),
      causasVal, causasTot,
      solElegidas, accionesTot: acciones.length, accionesOk: realizadas,
      logrado: despues.length ? avg(despues) : NaN,
      base2:   antes.length ? avg(antes) : NaN,
      control: arr(pc.rows).filter(r => T(r.paso)).length,
      controlOk: arr(pc.rows).filter(r => T(r.paso) && T(r.metodo) && T(r.frecuencia) && T(r.responsable)).length,
      empresa: (ST.proj() || {}).empresa, arl: (ST.proj() || {}).arl
    };
  }

  /* ==================================================================
     2 · PROPAGACIÓN — el mismo dato no se vuelve a teclear
     Sólo rellena campos VACÍOS; nunca pisa lo que el usuario escribió.
     ================================================================ */
  const MAPA = [
    // destino                                campo             hecho
    ['definir.project_charter',               'problema',       'problema'],
    ['definir.project_charter',               'objetivo',       'objetivo'],
    ['definir.a3_definir',                    'problema',       'problema'],
    ['definir.a3_definir',                    'objetivo',       'objetivo'],
    ['definir.a3_definir',                    'metricKey',      'metrico'],
    ['definir.tabla_identificacion',          'caso',           'problema'],
    ['medir.a3_medir',                        'baseline',       'baselineTxt'],
    ['analizar.diagramas_ishikawa',           'problema1',      'problema'],
    ['analizar.diagramas_ishikawa',           'problema2',      'problema'],
    ['analizar.5_whys',                       'w1_problema',    'problema'],
    ['analizar.descripcion_causa_raiz',       'problema',       'problema'],
    ['analizar.tree_diagram',                 'problema',       'problema'],
    ['analizar.a3_analizar',                  'raiz',           'causaRaiz'],
    ['analizar.correlacion_regresion',        'causa',          'metrico'],
    ['mejorar.seleccion_soluciones',          'problema',       'problema'],
    ['mejorar.seleccion_soluciones',          'causaRaiz',      'causaRaiz'],
    ['mejorar.descripcion_solucion',          'problema',       'problema'],
    ['mejorar.poka_yoke',                     'causaRaiz',      'causaRaiz'],
    ['mejorar.a3_mejorar',                    'controlar',      'controlTxt'],
    ['controlar.a3_final',                    'definir',        'resumenDefinir'],
    ['controlar.a3_final',                    'medirAnalizar',  'resumenMedirAnalizar'],
    ['controlar.a3_final',                    'mejorar',        'resumenMejorar'],
    ['controlar.grafico_antes_despues',       'criterio',       'metrico'],
    ['controlar.graficos_control',            'caracteristica', 'metrico'],
    ['controlar.plan_de_control',             'proceso',        'procesoTxt']
  ];

  /** Textos derivados que también se propagan. */
  function derivados(h){
    return {
      baselineTxt: [
        isFinite(h.baseline) ? 'Línea base ' + fmt(h.baseline, 'n1') : '',
        isFinite(h.sigma)    ? 'nivel sigma ' + fmt(h.sigma, 'n2') + 'σ' : '',
        isFinite(h.rty)      ? 'RTY ' + fmt(h.rty, 'p1') : '',
        isFinite(h.valorAgregado) ? 'valor agregado ' + fmt(h.valorAgregado, 'p1') : ''
      ].filter(Boolean).join(' · '),
      controlTxt: h.causaRaiz ? 'Sostener la solución que ataca: ' + h.causaRaiz : '',
      procesoTxt: h.metrico || '',
      resumenDefinir: h.problema ? (h.problema.slice(0, 220) +
        (isFinite(h.meta) ? ' Meta: ' + fmt(h.meta, 'n1') + '.' : '')) : '',
      resumenMedirAnalizar: [
        isFinite(h.sigma) ? 'Nivel sigma ' + fmt(h.sigma, 'n2') + 'σ.' : '',
        h.causaRaiz ? 'Causa raíz: ' + h.causaRaiz : '',
        h.causasTot ? '(' + h.causasVal.length + ' de ' + h.causasTot + ' causas validadas con datos)' : ''
      ].filter(Boolean).join(' '),
      resumenMejorar: h.solElegidas.length
        ? 'Soluciones implementadas: ' + h.solElegidas.join(' · ') +
          (h.accionesTot ? '. Plan de acción: ' + h.accionesOk + ' de ' + h.accionesTot + ' acciones realizadas.' : '')
        : ''
    };
  }

  /** Rellena los huecos del formato indicado (o de todos). Devuelve cuántos llenó. */
  function propagar(soloTool){
    const h = hechos(), dv = derivados(h), fuente = Object.assign({}, h, dv);
    let n = 0;
    MAPA.forEach(([tool, campo, hecho]) => {
      if (soloTool && tool !== soloTool) return;
      if (!TOOL_BY_ID[tool]) return;
      const v = fuente[hecho];
      if (!T(v)) return;
      const d = D(tool);
      if (T(d[campo])) return;                       // ya hay algo escrito: no se toca
      d[campo] = v;
      (d._her = d._her || {})[campo] = hecho;        // queda marcado como heredado
      n++;
    });
    if (n) ST.save();
    return n;
  }

  /* ==================================================================
     3 · CADENA DE TRAZABILIDAD
     ================================================================ */
  function cadena(){
    const h = hechos();
    const L = [
      { k:'problema', t:'Problema definido', v:h.problema, ok:!!h.problema, ir:'definir.clarificacion_problema',
        falta:'Escribe la definición del problema en Clarificación del Problema.' },
      { k:'metrico',  t:'Métrico crítico (CTQ)', v:h.metrico, ok:!!h.metrico, ir:'definir.arbol_ctq',
        falta:'Define el CTQ: qué se va a medir para saber si el problema mejora.' },
      { k:'baseline', t:'Línea base medida', v:isFinite(h.baseline) ? fmt(h.baseline, 'n2') : '',
        ok:isFinite(h.baseline), ir:'definir.series_tiempo',
        falta:'Sin línea base no hay contra qué comparar la mejora.' },
      { k:'sigma',    t:'Desempeño cuantificado', v:isFinite(h.sigma) ? fmt(h.sigma, 'n2') + 'σ' : '',
        ok:isFinite(h.sigma), ir:'medir.dpmo',
        falta:'Calcula DPMO, PPM o YIELD para traducir el problema a nivel sigma.' },
      { k:'causa',    t:'Causa raíz identificada', v:h.causaRaiz, ok:!!h.causaRaiz, ir:'analizar.descripcion_causa_raiz',
        falta:'Llega hasta la causa raíz con Ishikawa y los 5 por qué.' },
      { k:'validada', t:'Causa validada con datos', v:h.causasVal.length ? h.causasVal.join(' · ') : '',
        ok:h.causasVal.length > 0, ir:'analizar.validacion_de_causas',
        falta:'Ninguna causa está validada: se estaría mejorando sobre una opinión.' },
      { k:'solucion', t:'Solución seleccionada', v:h.solElegidas.join(' · '), ok:h.solElegidas.length > 0,
        ir:'mejorar.seleccion_soluciones',
        falta:'Marca en la tabla de selección cuál solución se va a implementar.' },
      { k:'accion',   t:'Acción ejecutada', v:h.accionesTot ? h.accionesOk + ' de ' + h.accionesTot + ' realizadas' : '',
        ok:h.accionesOk > 0, ir:'mejorar.plan_accion',
        falta:'El plan de acción no tiene ninguna acción realizada.' },
      { k:'resultado',t:'Resultado medido', v:isFinite(h.logrado) ? fmt(h.logrado, 'n2') : '',
        ok:isFinite(h.logrado), ir:'controlar.grafico_antes_despues',
        falta:'Falta medir el después para demostrar que la mejora ocurrió.' },
      { k:'control',  t:'Control establecido', v:h.controlOk ? h.controlOk + ' punto(s) de control completos' : '',
        ok:h.controlOk > 0, ir:'controlar.plan_de_control',
        falta:'Sin plan de control la mejora se pierde en pocos meses.' }
    ];
    // el primer eslabón roto es el que corta la cadena
    const roto = L.findIndex(x => !x.ok);
    L.forEach((x, i) => { x.corte = (roto >= 0 && i === roto); });
    return { eslabones:L, completos:L.filter(x => x.ok).length, total:L.length, corte:roto };
  }

  /* ==================================================================
     4 · PUERTAS DE FASE — ¿puedo pasar a la siguiente?
     ================================================================ */
  const CRITERIOS = {
    DEFINIR: h => [
      { ok:!!h.problema, t:'El problema está enunciado con qué, cuánto, dónde y desde cuándo', ir:'definir.clarificacion_problema' },
      { ok:!!h.metrico,  t:'Hay un métrico crítico (CTQ) que traduce el problema a número', ir:'definir.arbol_ctq' },
      { ok:isFinite(h.baseline), t:'La línea base está medida, no estimada', ir:'definir.series_tiempo' },
      { ok:isFinite(h.meta), t:'La meta es numérica y tiene plazo', ir:'definir.objetivo_smart' },
      { ok:isFinite(h.ahorro) && h.ahorro > 0, t:'El beneficio esperado está cuantificado en dinero', ir:'definir.beneficios' },
      { ok:toolFilled(TOOL_BY_ID['definir.project_charter'] || {}), t:'El Project Charter está diligenciado y aprobado', ir:'definir.project_charter' }
    ],
    MEDIR: h => [
      { ok:isFinite(h.sigma), t:'El desempeño está traducido a nivel sigma (DPMO, PPM o YIELD)', ir:'medir.dpmo' },
      { ok:isFinite(h.rty),   t:'El rendimiento acumulado del proceso (RTY) está calculado', ir:'medir.rty_fpy' },
      { ok:toolFilled(TOOL_BY_ID['medir.msa_grr'] || {}), t:'El sistema de medición está validado (GR&R): los datos son confiables', ir:'medir.msa_grr' },
      { ok:toolFilled(TOOL_BY_ID['medir.plan_recoleccion'] || {}), t:'Existe un plan de recolección de datos', ir:'medir.plan_recoleccion' },
      { ok:isFinite(h.valorAgregado), t:'Se sabe qué proporción del tiempo agrega valor', ir:'medir.valor_add' }
    ],
    ANALIZAR: h => [
      { ok:h.causasTot > 0, t:'Se listaron las causas posibles con el equipo', ir:'analizar.diagramas_ishikawa' },
      { ok:h.causasVal.length > 0, t:'Al menos una causa está VALIDADA CON DATOS, no con opinión', ir:'analizar.validacion_de_causas' },
      { ok:!!h.causaRaiz, t:'La causa raíz está enunciada y es accionable', ir:'analizar.descripcion_causa_raiz' },
      { ok:h.vitales.length > 0, t:'El Pareto separó las pocas vitales de las muchas triviales', ir:'definir.pareto' }
    ],
    MEJORAR: h => [
      { ok:h.solElegidas.length > 0, t:'Hay una solución seleccionada con criterio, no por intuición', ir:'mejorar.seleccion_soluciones' },
      { ok:!!h.causaRaiz, t:'La solución ataca la causa raíz validada en ANALIZAR', ir:'analizar.descripcion_causa_raiz' },
      { ok:h.accionesTot > 0, t:'El plan de acción tiene responsable y fecha por actividad', ir:'mejorar.plan_accion' },
      { ok:h.accionesTot > 0 && h.accionesOk / h.accionesTot >= 0.6, t:'Al menos el 60 % de las acciones está realizada', ir:'mejorar.plan_accion' },
      { ok:isFinite(h.logrado), t:'Se midió el después: la mejora está demostrada con datos', ir:'controlar.grafico_antes_despues' }
    ],
    CONTROLAR: h => [
      { ok:h.controlOk > 0, t:'El plan de control define método, frecuencia y responsable', ir:'controlar.plan_de_control' },
      { ok:toolFilled(TOOL_BY_ID['controlar.estandar_1'] || {}), t:'El nuevo proceso está estandarizado y firmado', ir:'controlar.estandar_1' },
      { ok:toolFilled(TOOL_BY_ID['controlar.graficos_control'] || {}), t:'Hay una carta de control vigilando el indicador', ir:'controlar.graficos_control' },
      { ok:toolFilled(TOOL_BY_ID['controlar.plan_reaccion'] || {}), t:'Existe plan de reacción para cuando el indicador se salga', ir:'controlar.plan_reaccion' },
      { ok:toolFilled(TOOL_BY_ID['controlar.a3_final'] || {}), t:'El A3 final está listo para entregar a la ARL y a la empresa', ir:'controlar.a3_final' }
    ]
  };

  /** Evalúa la puerta de una fase y decide si se puede avanzar. */
  function puerta(modId){
    const h = hechos();
    const f = CRITERIOS[modId]; if (!f) return null;
    const cs = f(h);
    const ok = cs.filter(c => c.ok).length;
    const idx = FASES.findIndex(m => m.id === modId);
    const sig = FASES.slice(idx + 1).find(m => ST.modOn(m.id));
    const listo = ok === cs.length;
    const casi  = ok >= Math.ceil(cs.length * 0.7);
    return {
      mod: modId, criterios: cs, cumplidos: ok, total: cs.length,
      listo, semaforo: listo ? 'ok' : casi ? 'warn' : 'bad',
      siguiente: sig || null,
      decision: listo
        ? (sig ? 'AVANZAR a ' + sig.name + '. Esta fase entregó todo lo que la siguiente necesita.'
               : 'CERRAR el proyecto y entregarlo. Están los cinco entregables de la metodología.')
        : casi
          ? 'AVANZAR CON RIESGO. Faltan ' + (cs.length - ok) + ' criterio(s); documenta por qué se decide seguir.'
          : 'NO AVANZAR todavía. Faltan ' + (cs.length - ok) + ' de ' + cs.length +
            ' criterios y la siguiente fase se construiría sobre información incompleta.'
    };
  }

  /* ==================================================================
     5 · PANELES
     ================================================================ */
  function panelPuerta(modId){
    const p = puerta(modId); if (!p) return '';
    const m = MOD_BY_ID[modId];
    const tono = p.semaforo === 'ok' ? 'ok' : p.semaforo === 'warn' ? 'warn' : 'bad';
    return '<div class="card fl-puerta ' + tono + '"><div class="card-h">' +
      (p.listo ? ICO.ok : ICO.alerta) +
      '<h3>Puerta de fase · ¿se puede pasar a la siguiente?</h3><div class="spacer"></div>' +
      '<span class="pill ' + tono + '">' + p.cumplidos + ' de ' + p.total + '</span></div>' +
      '<div class="card-b">' +
      '<div class="fl-dec ' + tono + '">' + esc(p.decision) + '</div>' +
      '<ul class="fl-crit">' + p.criterios.map(c =>
        '<li class="' + (c.ok ? 'si' : 'no') + '">' +
        '<span class="mk">' + (c.ok ? ICO.ok : ICO.quitar) + '</span>' +
        '<span class="tx">' + esc(c.t) + '</span>' +
        (c.ok ? '' : '<button class="btn xs g" data-goto="' + c.ir + '">Completar →</button>') +
        '</li>').join('') + '</ul>' +
      (p.siguiente && p.listo
        ? '<button class="btn p" data-mod="' + p.siguiente.id + '" style="margin-top:12px">' +
          (ICO.fase[p.siguiente.id] || '') + ' Continuar a ' + esc(p.siguiente.name) + ' →</button>'
        : '') +
      '</div></div>';
  }

  function panelCadena(){
    const c = cadena();
    return '<div class="card"><div class="card-h">' + ICO.causa +
      '<h3>Trazabilidad del proyecto</h3><div class="spacer"></div>' +
      '<span class="pill ' + (c.completos === c.total ? 'ok' : c.corte >= 0 ? 'warn' : '') + '">' +
      c.completos + ' de ' + c.total + ' eslabones</span></div><div class="card-b">' +
      '<p class="muted" style="font-size:12.5px;margin:0 0 12px">Cada eslabón debe apoyarse en el anterior. ' +
      'Donde la cadena se rompe, lo que sigue se construye sobre un supuesto.</p>' +
      '<ol class="fl-cadena">' + c.eslabones.map(e =>
        '<li class="' + (e.ok ? 'si' : 'no') + (e.corte ? ' corte' : '') + '">' +
        '<span class="pt"></span>' +
        '<div class="bd"><b>' + esc(e.t) + '</b>' +
        (e.ok ? '<span class="v">' + esc(String(e.v).slice(0, 150)) + '</span>'
              : '<span class="f">' + esc(e.falta) + '</span>') + '</div>' +
        '<button class="btn xs g" data-goto="' + e.ir + '">' + (e.ok ? 'Ver' : 'Ir') + '</button>' +
        '</li>').join('') + '</ol></div></div>';
  }

  return { hechos, derivados, propagar, cadena, puerta, panelPuerta, panelCadena, CRITERIOS };
})();

/* ============================================================================
   PANEL DE VARIABLES POR FASE (para el tablero BI)
   No mide "cuántos formatos se llenaron" sino las VARIABLES propias de cada
   paso del método: qué valor tienen hoy, contra qué se comparan y qué dicen.
   ========================================================================== */
const VARS = (function(){

  const NA = { v:NaN, txt:'—' };
  const P = (v, f) => (isFinite(v) ? fmt(v, f || 'n2') : '—');

  /** Devuelve las variables de una fase con su lectura. */
  function deFase(modId){
    const h = FLUJO.hechos();
    const F = {

    DEFINIR: () => [
      { k:'Proyectos priorizados', v:arr(ST.d('definir.matriz_priorizacion').rows).filter(r => num(r.cliente)).length,
        u:'', ref:'≥ 3 para poder comparar', tono: x => x >= 3 ? 'ok' : x > 0 ? 'warn' : 'bad',
        lee: x => x >= 3 ? 'Hay con qué comparar y sustentar la elección.' :
             x > 0 ? 'Sólo ' + x + ' proyecto(s) calificado(s): la elección queda débil.' :
             'Nadie calificó los proyectos: la prioridad sale en 0 para todos.' },
      { k:'Línea base', v:h.baseline, u:'', ref:'medida, no estimada', fmt:'n2',
        tono: x => isFinite(x) ? 'ok' : 'bad',
        lee: x => isFinite(x) ? 'Es el número contra el que se medirá todo el proyecto.' :
             'Sin línea base no se puede demostrar ninguna mejora.' },
      { k:'Meta comprometida', v:h.meta, u:'', ref:'numérica y con plazo', fmt:'n2',
        tono: x => isFinite(x) ? 'ok' : 'bad',
        lee: x => isFinite(x) && isFinite(h.baseline)
             ? 'Brecha a cerrar: ' + fmt(Math.abs(h.baseline - x), 'n2') + ' (' +
               fmt(Math.abs(h.baseline - x) / Math.abs(h.baseline || 1), 'p1') + ' del valor actual).'
             : 'Falta fijar la meta en el objetivo SMART.' },
      { k:'Ahorro proyectado', v:h.ahorro, u:'$', ref:'> 10 % del costo del problema', fmt:'money',
        tono: x => x > 0 ? 'ok' : 'warn',
        lee: x => x > 0 ? 'Es lo que justifica el proyecto ante la ARL.' :
             'Sin beneficio cuantificado el proyecto no compite por recursos.' },
      { k:'Pocas vitales del Pareto', v:h.vitales.length, u:'categorías',
        ref:'concentran el 80 % de los casos',
        tono: x => x > 0 && x <= 3 ? 'ok' : x > 0 ? 'warn' : 'bad',
        lee: x => x > 0
             ? 'El 80 % del problema está en ' + x + ' causa(s): ' +
               h.vitales.map(z => z.cat).join(', ') + '.'
             : 'Sin Pareto no se sabe dónde concentrar el esfuerzo.' },
      { k:'Equipo definido', v:arr(ST.d('definir.project_members').rows).filter(r => txt(r.nombre)).length,
        u:'personas', ref:'≥ 5 roles', tono: x => x >= 5 ? 'ok' : x > 0 ? 'warn' : 'bad',
        lee: x => x >= 5 ? 'Están cubiertos los roles del método.' :
             'Faltan roles: sin Champion ni dueño del proceso el proyecto se frena.' }
    ],

    MEDIR: () => [
      { k:'DPMO', v:h.dpmo, u:'', ref:'< 6.210 equivale a 4σ', fmt:'n0',
        tono: x => !isFinite(x) ? 'bad' : x < 6210 ? 'ok' : x < 66807 ? 'warn' : 'bad',
        lee: x => isFinite(x) ? 'Defectos por millón de oportunidades del proceso actual.' :
             'Falta calcular DPMO, PPM o YIELD.' },
      { k:'Nivel sigma', v:h.sigma, u:'σ', ref:'4σ es el promedio de la industria', fmt:'n2',
        tono: x => !isFinite(x) ? 'bad' : x >= 5 ? 'ok' : x >= 4 ? 'warn' : 'bad',
        lee: x => !isFinite(x) ? 'Sin nivel sigma no hay lenguaje común con la ARL.' :
             x < 3 ? 'Muy por debajo del promedio: el proceso necesita rediseño, no ajustes.' :
             x < 4 ? 'Por debajo del promedio de la industria.' :
             x < 5 ? 'En el promedio de la industria.' : 'Por encima del promedio.' },
      { k:'RTY (rendimiento acumulado)', v:h.rty, u:'', ref:'≥ 90 %', fmt:'p1',
        tono: x => !isFinite(x) ? 'bad' : x >= 0.9 ? 'ok' : x >= 0.7 ? 'warn' : 'bad',
        lee: x => isFinite(x) ? 'Probabilidad de que una unidad pase todo el proceso sin defecto.' :
             'Falta la cadena de rendimientos por estación.' },
      { k:'Tiempo que agrega valor', v:h.valorAgregado, u:'', ref:'> 25 %', fmt:'p1',
        tono: x => !isFinite(x) ? 'bad' : x >= 0.25 ? 'ok' : 'warn',
        lee: x => isFinite(x) ? (x < 0.25
             ? 'Menos de la cuarta parte del tiempo agrega valor: hay desperdicio dominante.'
             : 'Proporción razonable de valor agregado.')
             : 'Falta clasificar las actividades en VA / NVA.' },
      { k:'Sistema de medición validado', v:toolFilled(TOOL_BY_ID['medir.msa_grr'] || {}) ? 1 : 0,
        u:'', ref:'GR&R %Estudio < 30 %', bool:true,
        tono: x => x ? 'ok' : 'bad',
        lee: x => x ? 'Los datos son confiables para decidir.' :
             'Sin GR&R no se sabe si la variación es del proceso o del instrumento.' },
      { k:'Muestra planificada', v:num(ST.d('medir.tamano_muestra_cualitativos').pobN) ? 1 : 0,
        u:'', ref:'calculada con nivel de confianza', bool:true,
        tono: x => x ? 'ok' : 'warn',
        lee: x => x ? 'El tamaño de muestra tiene sustento estadístico.' :
             'Sin plan de muestreo los datos pueden no representar al proceso.' }
    ],

    ANALIZAR: () => [
      { k:'Causas identificadas', v:h.causasTot, u:'', ref:'≥ 6 en el Ishikawa',
        tono: x => x >= 6 ? 'ok' : x > 0 ? 'warn' : 'bad',
        lee: x => x > 0 ? 'El equipo puso sobre la mesa ' + x + ' causa(s) posible(s).' :
             'Todavía no hay causas listadas.' },
      { k:'Causas validadas con datos', v:h.causasVal.length, u:'', ref:'≥ 1 obligatoria',
        tono: x => x > 0 ? 'ok' : 'bad',
        lee: x => x > 0
             ? 'Confirmadas con evidencia: ' + h.causasVal.slice(0, 3).join(' · ') + '.'
             : 'Ninguna causa está validada: mejorar aquí sería apostar.' },
      { k:'Tasa de validación', v:h.causasTot ? h.causasVal.length / h.causasTot : NaN, u:'',
        ref:'40 % a 70 % es lo normal', fmt:'p0',
        tono: x => !isFinite(x) ? 'bad' : x >= 0.3 ? 'ok' : 'warn',
        lee: x => !isFinite(x) ? 'Falta el plan de verificación de causas.' :
             x === 1 ? 'Todas resultaron ciertas: revisa que la verificación haya sido exigente.' :
             'Descartar causas con datos es tan valioso como confirmarlas.' },
      { k:'Causa raíz enunciada', v:h.causaRaiz ? 1 : 0, u:'', ref:'una sola, accionable', bool:true,
        tono: x => x ? 'ok' : 'bad',
        lee: x => x ? h.causaRaiz.slice(0, 130) : 'Sin causa raíz, MEJORAR ataca síntomas.' },
      { k:'Profundidad del 5 por qué', v:(function(){ const w = ST.d('analizar.5_whys');
          return [1,2,3,4,5].filter(i => txt(w['w1_why' + i])).length; })(), u:'niveles',
        ref:'5 niveles', tono: x => x >= 5 ? 'ok' : x >= 3 ? 'warn' : 'bad',
        lee: x => x >= 5 ? 'Se llegó hasta el fondo.' :
             x > 0 ? 'La cadena se detuvo en el nivel ' + x + ': suele quedarse en la causa aparente.' :
             'Sin los 5 por qué no hay profundidad de análisis.' }
    ],

    MEJORAR: () => [
      { k:'Soluciones evaluadas', v:arr(ST.d('mejorar.seleccion_soluciones').rows).filter(r => txt(r.sol)).length,
        u:'', ref:'≥ 3 para poder elegir',
        tono: x => x >= 3 ? 'ok' : x > 0 ? 'warn' : 'bad',
        lee: x => x >= 3 ? 'Hubo alternativas reales que comparar.' :
             'Con menos de 3 opciones no hay selección, hay resignación.' },
      { k:'Soluciones elegidas', v:h.solElegidas.length, u:'', ref:'≥ 1',
        tono: x => x > 0 ? 'ok' : 'bad',
        lee: x => x > 0 ? h.solElegidas.slice(0, 2).join(' · ') : 'Falta marcar cuál se implementa.' },
      { k:'Cumplimiento del plan', v:h.accionesTot ? h.accionesOk / h.accionesTot : NaN, u:'',
        ref:'≥ 80 % para cerrar la fase', fmt:'p0',
        tono: x => !isFinite(x) ? 'bad' : x >= 0.8 ? 'ok' : x >= 0.5 ? 'warn' : 'bad',
        lee: x => isFinite(x) ? h.accionesOk + ' de ' + h.accionesTot + ' acciones realizadas.' :
             'El plan de acción está vacío.' },
      { k:'Acciones vencidas', v:(function(){ const hoyv = hoy();
          return arr(ST.d('mejorar.plan_accion').rows).filter(r =>
            txt(r.limite) && r.limite < hoyv && !/REALIZADA/i.test(txt(r.estatus))).length; })(),
        u:'', ref:'0', tono: x => x === 0 ? 'ok' : x <= 2 ? 'warn' : 'bad',
        lee: x => x === 0 ? 'Ninguna acción está vencida.' :
             x + ' acción(es) pasaron su fecha límite sin cerrarse.' },
      { k:'Mejora lograda', v:(isFinite(h.base2) && isFinite(h.logrado) && h.base2)
          ? Math.abs(h.base2 - h.logrado) / Math.abs(h.base2) : NaN, u:'', ref:'vs la meta', fmt:'p1',
        tono: x => !isFinite(x) ? 'bad' : x >= 0.3 ? 'ok' : x > 0 ? 'warn' : 'bad',
        lee: x => isFinite(x)
             ? 'De ' + P(h.base2) + ' a ' + P(h.logrado) + ' en el periodo medido.'
             : 'Falta medir el después para demostrar la mejora.' },
      { k:'Dispositivos a prueba de error', v:arr(ST.d('mejorar.poka_yoke').rows).filter(r => txt(r.dispositivo)).length,
        u:'', ref:'≥ 1 de nivel I', tono: x => x > 0 ? 'ok' : 'warn',
        lee: x => x > 0 ? 'La solución no depende sólo de la disciplina de las personas.' :
             'Sin poka yoke la mejora se sostiene sólo con voluntad.' }
    ],

    CONTROLAR: () => [
      { k:'Puntos de control completos', v:h.controlOk, u:'de ' + h.control,
        ref:'todos con método, frecuencia y responsable',
        tono: x => x > 0 && x === h.control ? 'ok' : x > 0 ? 'warn' : 'bad',
        lee: x => x === 0 ? 'El plan de control está vacío o incompleto.' :
             x < h.control ? (h.control - x) + ' punto(s) sin método, frecuencia o responsable.' :
             'Cada punto de control sabe qué se mide, cada cuánto y quién responde.' },
      { k:'Proceso estandarizado', v:toolFilled(TOOL_BY_ID['controlar.estandar_1'] || {}) ? 1 : 0,
        u:'', ref:'documentado y firmado', bool:true,
        tono: x => x ? 'ok' : 'bad',
        lee: x => x ? 'El nuevo modo de trabajo está escrito.' :
             'Sin estándar, en tres meses cada quien vuelve a su forma anterior.' },
      { k:'Carta de control activa', v:toolFilled(TOOL_BY_ID['controlar.graficos_control'] || {}) ? 1 : 0,
        u:'', ref:'con límites calculados', bool:true,
        tono: x => x ? 'ok' : 'warn',
        lee: x => x ? 'El indicador está siendo vigilado estadísticamente.' :
             'Sin carta de control no se distingue una variación normal de una alarma real.' },
      { k:'Plan de reacción', v:arr(ST.d('controlar.plan_reaccion').rows).filter(r => txt(r.accion)).length,
        u:'reglas', ref:'≥ 2', tono: x => x >= 2 ? 'ok' : x > 0 ? 'warn' : 'bad',
        lee: x => x > 0 ? 'Está definido qué hacer cuando el indicador se salga.' :
             'Nadie sabe qué hacer si el indicador se dispara.' },
      { k:'Resultado sostenido', v:h.logrado, u:'', ref:isFinite(h.meta) ? 'meta ' + P(h.meta) : 'contra la meta',
        fmt:'n2',
        tono: x => (!isFinite(x) || !isFinite(h.meta)) ? 'warn'
             : (h.baseline > h.meta ? (x <= h.meta ? 'ok' : 'warn') : (x >= h.meta ? 'ok' : 'warn')),
        lee: x => (!isFinite(x)) ? 'Falta la medición del después.'
             : !isFinite(h.meta) ? 'Sin meta no se puede declarar el cumplimiento.'
             : (h.baseline > h.meta ? (x <= h.meta) : (x >= h.meta))
               ? 'La meta se cumplió y se mantiene.'
               : 'Todavía no se alcanza la meta comprometida.' }
    ]
    };
    const f = F[modId];
    return f ? f() : [];
  }
  const txt = v => String(v == null ? '' : v).trim();

  /** Tabla de variables de una fase, lista para el tablero. */
  function panel(modId){
    const m = MOD_BY_ID[modId], vs = deFase(modId);
    if (!vs.length) return '';
    const okN = vs.filter(v => v.tono(v.v) === 'ok').length;
    return '<div class="card"><div class="card-h">' +
      '<span class="vr-dot" style="background:' + m.color + '">' + (ICO.fase[modId] || '') + '</span>' +
      '<h3>' + esc(m.name) + ' · variables del paso</h3><div class="spacer"></div>' +
      '<span class="pill ' + (okN === vs.length ? 'ok' : okN >= vs.length * 0.6 ? 'warn' : 'bad') + '">' +
      okN + ' de ' + vs.length + ' en verde</span></div>' +
      '<div class="card-b tight"><div class="twrap"><table class="gt vr"><thead><tr>' +
      '<th>Variable</th><th class="n">Valor</th><th>Referencia</th><th>Lectura</th></tr></thead><tbody>' +
      vs.map(v => {
        const t = v.tono(v.v);
        const val = v.bool ? (v.v ? 'Sí' : 'No')
                  : (isFinite(v.v) ? fmt(v.v, v.fmt || (Number.isInteger(v.v) ? 'n0' : 'n2')) : '—');
        return '<tr><td class="vr-k">' + esc(v.k) + '</td>' +
          '<td class="vr-v ' + t + '">' + esc(val) + (v.u ? ' <i>' + esc(v.u) + '</i>' : '') + '</td>' +
          '<td class="vr-r">' + esc(v.ref || '') + '</td>' +
          '<td class="vr-l">' + esc(v.lee(v.v)) + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>';
  }

  return { deFase, panel };
})();
