/* ============================================================
   MÓDULO 1 · FORMACIÓN
   Ruta completa de §4 y §5, más el contenido obligatorio de §9.1.
   ============================================================ */

const BASE_POR_UNIDAD = 2;   // 16 ítems base; el resto queda como equivalencias

function avanceFormacion() {
  const leidas = Object.values(estado.formacion.leidas).filter(Boolean).length;
  const act = Object.values(estado.formacion.actividades).filter(Boolean).length;
  const rs = Object.values(estado.formacion.rs).filter(Boolean).length;
  const total = UNIDADES.length + ACTIVIDADES.length + RS_FORMATIVO.length;
  return { leidas, act, rs, total, hechas: leidas + act + rs,
           pct: Math.round((leidas + act + rs) / total * 100) };
}

/* ============================================================
   RUTA DE APRENDIZAJE
   ============================================================ */
VISTAS['f-ruta'] = () => {
  const a = avanceFormacion();
  const aprobado = estado.intentos.find(i => i.aprobado);
  return cabecera('formacion', 'Ruta de aprendizaje',
    'Ocho unidades, ocho actividades y el laboratorio de Risk Simulator. Al final, evaluación certificable con umbral del 80 %.',
    `<button onclick="irSeccion('f-unidad')">${ico('play',15)} Continuar</button>`) + `

  ${avisoHTML('', 'Objetivo del módulo · §4',
    '<p style="margin:0">Que el participante <strong>comprenda, construya, cuestione e interprete</strong> un modelo financiero de deuda y liquidez, y pueda utilizar Risk Simulator con criterio técnico. La formación cubre todos los temas identificables en la fuente, sin convertirla en un glosario.</p>')}

  <div class="rejilla c4">
    ${tile('Avance total', a.pct + '<small>%</small>', `${a.hechas} de ${a.total} elementos`, a.pct === 100 ? 'ok' : '', 'ok')}
    ${tile('Unidades leídas', `${a.leidas}<small>/${UNIDADES.length}</small>`, '', '', 'libro')}
    ${tile('Actividades', `${a.act}<small>/${ACTIVIDADES.length}</small>`, '', '', 'play')}
    ${tile('Laboratorio RS', `${a.rs}<small>/${RS_FORMATIVO.length}</small>`, 'contenido obligatorio §9.1', '', 'simulacion')}
  </div>

  <div class="tarjeta">
    <div class="progreso" style="margin-bottom:8px"><i style="width:${a.pct}%"></i></div>
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--ink-3)">
      <span>${aprobado ? `Certificado obtenido con ${fmtN(aprobado.resultado,1)} %` : 'Aún sin certificado'}</span>
      <button class="mini sec no-imprimir" onclick="reiniciarFormacion()">Reiniciar avance</button>
    </div>
  </div>

  <h2>Las ocho unidades</h2>
  <div class="uni-lista">
    ${UNIDADES.map((u, i) => `<button class="uni-tarjeta ${estado.formacion.leidas[u.codigo] ? 'leida' : ''}" onclick="abrirUnidad(${i})">
      <span class="cod">${u.codigo}</span>
      <span style="flex:1;min-width:0">
        <span class="t">${esc(u.titulo)}</span>
        <span class="d">${esc(u.competencia.slice(0, 118))}${u.competencia.length > 118 ? '…' : ''}</span>
      </span>
      ${estado.formacion.leidas[u.codigo] ? ico('ok', 17) : ico('flecha', 15)}
    </button>`).join('')}
  </div>

  ${figura('Cómo cada competencia se convierte en función de la app', 'La columna de la derecha es lo que existe en el módulo 3',
    infoRuta(UNIDADES), 'Fuente: §4.1 del documento.')}

  <h2>Referentes de validación · §4.3</h2>
  ${avisoHTML('', 'El documento no atribuye contenidos a autores que no nombra',
    '<p style="margin:0">El segmento transcrito no menciona autores, obras, instituciones ni cursos. Para respetar la fuente, el módulo no inventa esas referencias: la base de validación se construye con referentes institucionales.</p>')}
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:220px">Referente</th><th>Para qué se usa</th><th style="width:80px">Fuente</th></tr></thead>
    <tbody>${REFERENTES.map(r => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td>
      <td><code>${esc(r[2])}</code></td></tr>`).join('')}</tbody></table></div>`;
};

function reiniciarFormacion() {
  if (!confirm('Se borrará el avance de formación. ¿Continuar?')) return;
  estado.formacion = { leidas:{}, actividades:{}, rs:{} };
  guardar(); pintar(); toast('Avance reiniciado');
}
function abrirUnidad(i) { estado.unidad = i; irSeccion('f-unidad'); }

/* ============================================================
   UNIDAD
   ============================================================ */
VISTAS['f-unidad'] = () => {
  const i = estado.unidad, u = UNIDADES[i];
  const leida = !!estado.formacion.leidas[u.codigo];
  const forms = (FORMULAS_UNIDAD[u.codigo] || []).map(id => FORMULAS.find(f => f.id === id)).filter(Boolean);
  const reglas = (REGLAS_UNIDAD[u.codigo] || []).map(c => REGLAS_FIN.find(r => r[0] === c)).filter(Boolean);
  const casos = (CASOS_UNIDAD[u.codigo] || []).map(c => CASOS.find(x => x[0] === c)).filter(Boolean);
  const terminos = GLOSARIO.filter(g => g[2] === u.codigo);
  const acts = ACTIVIDADES.filter(a => a.u === u.codigo);
  const preg = PREGUNTAS.filter(p => p.u === u.codigo);

  return cabecera('libro', `${u.codigo} · ${u.titulo}`, esc(u.competencia),
    `<div class="segmentado">${UNIDADES.map((x, k) =>
      `<button class="${k === i ? 'activo' : ''}" onclick="estado.unidad=${k};pintar()">${x.codigo}</button>`).join('')}</div>`) + `

  ${avisoHTML('ok', 'Traducción a la app', `<p style="margin:0">${esc(u.aplicacion)}</p>`)}

  <div class="nivel basico">
    <div class="rot">${ico('libro',13)} Nivel básico · desarrollo mínimo</div>
    <div class="procedencia doc">Contenido del documento · §4.2</div>
    <ul style="margin-top:8px">${u.basico.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
  </div>

  <div class="nivel intermedio">
    <div class="rot">${ico('bombilla',13)} Nivel intermedio</div>
    <div class="procedencia ext">Aporte externo · no está en el documento</div>
    <p style="margin-top:8px">${esc(u.intermedio.intro)}</p>
    <dl class="glosario">${u.intermedio.puntos.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl>
    <h4>Errores frecuentes</h4>
    <ul>${u.intermedio.errores.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
  </div>

  ${forms.length ? `<h2>Fórmulas de esta unidad</h2>
    <div class="tabla-caja"><table>
      <thead><tr><th style="width:44px">ID</th><th style="width:170px">Concepto</th><th>Expresión</th></tr></thead>
      <tbody>${forms.map(f => `<tr><td class="mono">${f.id}</td><td><strong>${esc(f.nombre)}</strong>
        <div class="ayuda">§${f.seccion}</div></td>
        <td><code>${esc(f.expr)}</code>${f.nota ? `<div class="ayuda">${esc(f.nota)}</div>` : ''}</td></tr>`).join('')}
      </tbody></table></div>` : ''}

  ${reglas.length ? `<h2>Reglas de negocio que aplica</h2>
    <div class="tabla-caja"><table><tbody>${reglas.map(r =>
      `<tr><td style="width:110px" class="mono">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}
    </tbody></table></div>` : ''}

  ${terminos.length ? `<h2>Términos clave</h2>
    <dl class="glosario">${terminos.map(t => `<dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd>`).join('')}</dl>` : ''}

  ${acts.length ? `<h2>Actividad formativa</h2>
    ${acts.map(a => tarjetaActividad(a)).join('')}` : ''}

  ${casos.length ? `<h2>Cómo se comprueba en la herramienta</h2>
    ${casos.map(c => avisoHTML('', c[0] + ' · ' + c[1],
      `<p style="margin:0">${esc(c[2])}
       <button class="mini sec no-imprimir" style="margin-left:8px" onclick="irSeccion('h-panel')">Abrir la herramienta</button></p>`)).join('')}` : ''}

  <div class="tarjeta plana">
    <h4 style="margin-top:0">Preguntas de esta unidad en el banco</h4>
    <p style="margin-bottom:8px">${preg.length} ítems · ${preg.filter(p => p.origen === 'doc').length} del documento (Tabla 16)
      · ${preg.filter(p => p.origen === 'ext').length} añadidos para poder construir la repregunta equivalente.</p>
    <button class="sec no-imprimir" onclick="irSeccion('f-evaluacion')">${ico('ok',15)} Ir a la evaluación</button>
  </div>

  <div class="barra-acc no-imprimir">
    <button class="${leida ? 'sec' : ''}" onclick="marcarLeida('${u.codigo}')">
      ${ico(leida ? 'ok' : 'guardar', 15)} ${leida ? 'Marcada como leída' : 'Marcar como leída'}</button>
    <span class="sep"></span>
    ${i > 0 ? `<button class="sec" onclick="estado.unidad=${i-1};pintar()">← ${UNIDADES[i-1].codigo}</button>` : ''}
    ${i < UNIDADES.length - 1 ? `<button class="sec" onclick="estado.unidad=${i+1};pintar()">${UNIDADES[i+1].codigo} →</button>` : ''}
    <span class="expandir ayuda">Unidad ${i + 1} de ${UNIDADES.length}</span>
  </div>`;
};

function marcarLeida(cod) {
  estado.formacion.leidas[cod] = !estado.formacion.leidas[cod];
  guardar(); pintar();
}

function tarjetaActividad(a) {
  const hecha = !!estado.formacion.actividades[a.nombre];
  return `<div class="tarjeta">
    <div class="tarjeta-cab">
      ${ico('play', 16)}<h3>${esc(a.nombre)}</h3>
      <span class="eti gris">${esc(a.u)}</span>
      <div class="acc no-imprimir">
        <button class="mini ${hecha ? 'verde' : 'sec'}" onclick="marcarActividad('${esc(a.nombre)}')">
          ${ico(hecha ? 'ok' : 'mas', 13)} ${hecha ? 'Hecha' : 'Marcar hecha'}</button>
      </div>
    </div>
    <p><strong>Producto de aprendizaje:</strong> ${esc(a.producto)}</p>
    <div class="procedencia doc">Actividad y producto · §4.4 del documento</div>
    <h4>Cómo hacerla</h4>
    <div class="procedencia ext">Procedimiento · aporte externo</div>
    <ol style="margin-top:8px;margin-bottom:0">${a.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
  </div>`;
}
function marcarActividad(n) {
  estado.formacion.actividades[n] = !estado.formacion.actividades[n];
  guardar(); pintar();
}

/* ============================================================
   ACTIVIDADES
   ============================================================ */
VISTAS['f-actividades'] = () => {
  const hechas = Object.values(estado.formacion.actividades).filter(Boolean).length;
  return cabecera('play', 'Actividades formativas',
    'Las ocho actividades de §4.4 y su producto de aprendizaje. El procedimiento es aporte externo.') + `
  <div class="tarjeta">
    <div class="progreso verde" style="margin-bottom:8px"><i style="width:${hechas / ACTIVIDADES.length * 100}%"></i></div>
    <div style="font-size:12px;color:var(--ink-3)">${hechas} de ${ACTIVIDADES.length} actividades completadas</div>
  </div>
  ${ACTIVIDADES.map(a => tarjetaActividad(a)).join('')}`;
};

/* ============================================================
   LABORATORIO RISK SIMULATOR · §9.1
   ============================================================ */
VISTAS['f-rs'] = () => {
  const hechos = Object.values(estado.formacion.rs).filter(Boolean).length;
  return cabecera('simulacion', 'Laboratorio Risk Simulator',
    'Contenido formativo obligatorio de §9.1. Risk Simulator es un complemento de Excel de Real Options Valuation [RS-01].') + `

  ${avisoHTML('aten', 'La simulación no mejora un modelo malo',
    '<p style="margin:0">Propaga su incertidumbre. Por eso el primer punto obligatorio es verificar el modelo determinístico antes de simular: un error de fórmula simulado diez mil veces sigue siendo un error, ahora con apariencia estadística.</p>')}

  <div class="tarjeta">
    <div class="progreso" style="margin-bottom:8px"><i style="width:${hechos / RS_FORMATIVO.length * 100}%"></i></div>
    <div style="font-size:12px;color:var(--ink-3)">${hechos} de ${RS_FORMATIVO.length} puntos cubiertos</div>
  </div>

  <div class="procedencia doc">Los diez puntos son del documento · §9.1</div>
  <div class="tabla-caja" style="margin-top:10px"><table>
    <thead><tr><th style="width:44px">#</th><th>Punto obligatorio</th><th style="width:120px">Estado</th></tr></thead>
    <tbody>${RS_FORMATIVO.map((p, i) => `<tr>
      <td>${i + 1}</td><td>${esc(p)}</td>
      <td class="no-imprimir"><button class="mini ${estado.formacion.rs[i] ? 'verde' : 'sec'}" onclick="marcarRS(${i})">
        ${ico(estado.formacion.rs[i] ? 'ok' : 'mas', 13)} ${estado.formacion.rs[i] ? 'Cubierto' : 'Pendiente'}</button></td>
    </tr>`).join('')}</tbody></table></div>

  <h2>Flujo del producto mínimo · §9.2</h2>
  <div class="pasos">${FLUJO_RS.map((p, i) => `<div class="paso"><span class="n">${i + 1}</span>${esc(p.slice(0, 34))}…</div>`).join('')}</div>
  <ol>${FLUJO_RS.map(p => `<li>${esc(p)}</li>`).join('')}</ol>

  ${avisoHTML('', 'Decisión de arquitectura · §9.3',
    '<p style="margin:0">MVP: interoperabilidad asistida por archivos estructurados. Fase posterior: integración directa únicamente mediante mecanismo autorizado por el fabricante. Esta separación evita prometer una conexión no confirmada.</p>')}

  <div class="tarjeta plana">
    <h4 style="margin-top:0">Practica el flujo completo</h4>
    <p style="margin-bottom:10px">La herramienta financiera implementa los pasos 1, 2, 6 y 7: valida el modelo, exporta la especificación con su huella, valida la correspondencia al importar y marca el resultado como ejecución externa.</p>
    <button class="sec no-imprimir" onclick="irSeccion('h-simulacion')">${ico('herramienta',15)} Abrir simulación en la herramienta</button>
  </div>`;
};
function marcarRS(i) { estado.formacion.rs[i] = !estado.formacion.rs[i]; guardar(); pintar(); }

/* ============================================================
   GLOSARIO
   ============================================================ */
VISTAS['f-glosario'] = () => cabecera('buscar', 'Glosario',
  `${GLOSARIO.length} términos que el documento usa. Las definiciones son aporte externo: el documento no los define uno a uno.`) + `
  <div class="tarjeta no-imprimir" style="padding:12px">
    <input type="text" id="g-buscar" placeholder="Buscar término…" oninput="filtrarGlosario(this.value)">
  </div>
  <div id="g-lista">${listaGlosario('')}</div>`;

function listaGlosario(q) {
  const t = q.toLowerCase().trim();
  const items = GLOSARIO.filter(g => !t || g[0].toLowerCase().includes(t) || g[1].toLowerCase().includes(t));
  if (!items.length) return vacio('buscar', 'Ningún término coincide con la búsqueda.');
  return `<div class="tabla-caja"><table>
    <thead><tr><th style="width:210px">Término</th><th>Definición</th><th style="width:70px">Unidad</th></tr></thead>
    <tbody>${items.map(g => `<tr><td><strong>${esc(g[0])}</strong></td><td>${esc(g[1])}</td>
      <td><button class="mini sec no-imprimir" onclick="abrirUnidad(${UNIDADES.findIndex(u => u.codigo === g[2])})">${esc(g[2])}</button></td>
    </tr>`).join('')}</tbody></table></div>`;
}
function filtrarGlosario(q) { $('#g-lista').innerHTML = listaGlosario(q); }

/* ============================================================
   EVALUACIÓN
   ============================================================ */
VISTAS['f-evaluacion'] = () => cabecera('ok', 'Evaluación certificable',
  'Corrección inmediata, repregunta equivalente distinta y umbral del 80 % (§5).') + `

  ${avisoHTML('aten', 'Dos decisiones tomadas ante vacíos del documento',
    `<p><strong>1 · Denominador.</strong> §5.4 define el resultado como «correctas en primera respuesta ÷ preguntas válidas × 100»
     pero no define «preguntas válidas», y §5.1 mete repreguntas dentro del examen. Si contaran, cada error penalizaría dos
     veces. <strong>Esta app cuenta solo los ${BASE_POR_UNIDAD * UNIDADES.length} ítems base.</strong></p>
     <p style="margin:0"><strong>2 · Equivalencia.</strong> §5.2 exige repreguntar con otro ítem del mismo objetivo, pero la
     Tabla 16 da una sola pregunta por unidad. <strong>Esta app usa la unidad como grupo de equivalencia</strong> y añade
     ${PREGUNTAS.filter(p => p.origen === 'ext').length} ítems propios, marcados.</p>`)}

  <div class="tarjeta">
    <div class="tarjeta-cab">${ico('usuario',16)}<h3>Identificación</h3>
      <span class="ayuda acc">§6.2 exige confirmar nombre y cargo antes del examen</span></div>
    <div class="rejilla c3" style="margin:0">
      <div class="campo"><label class="requerido">Nombre completo</label>
        <input type="text" id="in-nombre" value="${esc(estado.perfil.nombre)}"
               onchange="estado.perfil.nombre=this.value;guardar();actualizarChip()"></div>
      <div class="campo"><label class="requerido">Cargo en Rehavid</label>
        <input type="text" id="in-cargo" value="${esc(estado.perfil.cargo)}"
               onchange="estado.perfil.cargo=this.value;guardar()"></div>
      <div class="campo"><label>Rol</label>
        <select onchange="estado.perfil.rol=this.value;guardar()">
          ${ROLES.map(r => `<option ${r[0] === estado.perfil.rol ? 'selected' : ''}>${esc(r[0])}</option>`).join('')}
        </select></div>
    </div>
    <div class="ayuda">Estos datos se guardan solo en este navegador. La app no los envía a ningún sitio.</div>
  </div>

  <div id="examen-zona"></div>`;

function despuesDePintar(sec) {
  if (sec === 'f-evaluacion') pintarExamen();
}

function iniciarExamen() {
  if (!estado.perfil.nombre.trim() || !estado.perfil.cargo.trim()) {
    toast('Registra nombre y cargo antes de iniciar (§6.2)', 'mal'); return;
  }
  const base = [], pool = {};
  UNIDADES.forEach(u => {
    const items = PREGUNTAS.filter(p => p.u === u.codigo).slice();
    barajar(items);
    base.push(...items.slice(0, BASE_POR_UNIDAD));
    pool[u.codigo] = items.slice(BASE_POR_UNIDAD);
  });
  barajar(base);
  estado.examen = { base, pool, i:0, aciertosPrimera:0, respuestas:[], repregunta:null,
                    dominados:{}, fallados:{}, inicio: Date.now() };
  pintarExamen();
}
function barajar(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }

function pintarExamen() {
  const z = $('#examen-zona'); if (!z) return;
  const e = estado.examen;
  if (!e) {
    z.innerHTML = `<h2>Comenzar</h2>
      <div class="tarjeta">
        <p>El examen toma <strong>${BASE_POR_UNIDAD} ítems por unidad</strong> (${BASE_POR_UNIDAD * UNIDADES.length} en total),
        en orden aleatorio y balanceado, como pide §5.1. Ante un error verás la corrección, la explicación y una repregunta
        distinta de la misma unidad; esa repregunta <strong>no puntúa</strong>, pero sí registra dominio.</p>
        <p style="margin-bottom:14px">Se aprueba con <strong>80 % o más</strong> sobre los ítems base.</p>
        <button onclick="iniciarExamen()">${ico('play',15)} Iniciar evaluación</button>
      </div>`;
    return;
  }
  const total = e.base.length;
  const preg = e.repregunta || e.base[e.i];
  const esRe = !!e.repregunta;
  z.innerHTML = `<h2>Evaluación en curso</h2>
    <div class="tarjeta no-imprimir" style="margin-bottom:12px">
      <div class="progreso" style="margin-bottom:7px"><i style="width:${e.i / total * 100}%"></i></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-3)">
        <span>Ítem ${Math.min(e.i + 1, total)} de ${total}${esRe ? ' · <strong style="color:var(--warn)">repregunta de refuerzo</strong>' : ''}</span>
        <span>Aciertos en primera: <strong>${e.aciertosPrimera}</strong></span>
      </div>
    </div>
    <div class="pregunta">
      <div style="display:flex;gap:7px;align-items:center;margin-bottom:10px;flex-wrap:wrap">
        <span class="eti">${preg.u}</span>
        <span class="eti ${preg.origen === 'doc' ? 'verde' : 'ambar'}">${preg.origen === 'doc' ? 'Del documento' : 'Ítem añadido'}</span>
        <span style="font-size:10.5px;color:var(--ink-4)">Objetivo: ${esc(preg.objetivo)}</span>
      </div>
      <div class="enunciado">${esc(preg.enunciado)}</div>
      <div class="opciones" id="opciones">
        ${preg.opciones.map((o, k) => `<button class="opcion" data-k="${k}" onclick="responder(${k})">
          <span class="letra">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}
      </div>
      <div id="retro"></div>
    </div>`;
}

function responder(k) {
  const e = estado.examen;
  if (!e) return;
  const preg = e.repregunta || e.base[e.i];
  const esRe = !!e.repregunta;
  if (!esRe && e.respuestas[e.i]) return;      // un ítem base solo puntúa una vez
  const ok = k === preg.correcta;

  $$('#opciones .opcion').forEach(o => {
    o.classList.add('bloqueada');
    const kk = +o.dataset.k;
    if (kk === preg.correcta) o.classList.add('correcta');
    else if (kk === k) o.classList.add('incorrecta');
  });

  if (!esRe) {
    e.respuestas[e.i] = { id:preg.id, ok, u:preg.u };
    if (ok) { e.aciertosPrimera++; e.dominados[preg.objetivo] = true; }
    else e.fallados[preg.objetivo] = true;
  } else if (ok) e.dominados[preg.objetivo] = true;

  const hayEq = e.pool[preg.u] && e.pool[preg.u].length > 0;
  $('#retro').innerHTML = `
    ${avisoHTML(ok ? 'ok' : 'mal', ok ? 'Respuesta correcta' : 'Respuesta incorrecta',
      `<p style="margin-bottom:5px">${esc(ok ? preg.bien : preg.mal)}</p>
       ${!ok ? `<p style="margin-bottom:5px"><strong>Respuesta correcta:</strong> ${esc(preg.opciones[preg.correcta])}</p>` : ''}
       <p style="margin:0;font-size:12px"><strong>Riesgo de aplicar mal el concepto:</strong> ${esc(preg.riesgo)}</p>`)}
    ${!ok && !esRe && hayEq
      ? avisoHTML('aten', 'Repregunta · §5.2',
          `<p style="margin:0">Esta respuesta queda como incorrecta para el intento. A continuación verás
           <strong>otro ítem de ${preg.u}</strong>, con enunciado y opciones distintos. Esa pregunta no modifica el resultado.</p>`) +
        `<button class="no-imprimir" onclick="lanzarRepregunta('${preg.u}')">${ico('flecha',15)} Ver la repregunta</button>`
      : `<button class="no-imprimir" onclick="siguiente()">${e.i >= e.base.length - 1 ? 'Ver resultado' : 'Siguiente'} ${ico('flecha',15)}</button>`}`;
}
function lanzarRepregunta(u) { estado.examen.repregunta = estado.examen.pool[u].shift(); pintarExamen(); }
function siguiente() {
  const e = estado.examen;
  e.repregunta = null; e.i++;
  if (e.i >= e.base.length) cerrarIntento(); else pintarExamen();
}

function cerrarIntento() {
  const e = estado.examen, total = e.base.length;
  const resultado = e.aciertosPrimera / total * 100;
  const objetivos = new Set([...Object.keys(e.dominados), ...Object.keys(e.fallados)]).size;
  const dominio = objetivos ? Object.keys(e.dominados).length / objetivos * 100 : 0;
  const porUnidad = {};
  e.respuestas.forEach(r => {
    if (!porUnidad[r.u]) porUnidad[r.u] = { ok:0, n:0 };
    porUnidad[r.u].n++; if (r.ok) porUnidad[r.u].ok++;
  });
  const it = {
    n: estado.intentos.length + 1, nombre: estado.perfil.nombre, cargo: estado.perfil.cargo,
    resultado: Math.round(resultado * 10) / 10, dominio: Math.round(dominio * 10) / 10,
    aprobado: resultado >= 80, aciertos: e.aciertosPrimera, total,
    fecha: new Date().toISOString(), porUnidad,
    codigo: codigoCertificado(estado.perfil.nombre, estado.intentos.length + 1, Math.round(resultado))
  };
  estado.intentos.push(it);
  estado.examen = null;
  guardar();

  const flojas = Object.entries(porUnidad).filter(([, v]) => v.ok < v.n).map(([u]) => u);
  $('#examen-zona').innerHTML = `<h2>Resultado del intento ${it.n}</h2>
    <div class="rejilla c4">
      ${tile('Resultado del intento', fmtN(it.resultado, 1) + '<small>%</small>', 'sobre ítems base', it.aprobado ? 'ok' : 'mal', 'ok')}
      ${tile('Aciertos en primera', `${it.aciertos}<small>/${total}</small>`, '', '', 'libro')}
      ${tile('Dominio posterior', fmtN(it.dominio, 1) + '<small>%</small>', 'tras el refuerzo', '', 'bombilla')}
      ${tile('Criterio ≥ 80 %', it.aprobado ? 'Aprobado' : 'No aprobado', '', it.aprobado ? 'ok' : 'mal', 'certificado')}
    </div>
    ${figura('Aciertos por unidad', 'Sobre los ítems base del intento',
      barrasH(UNIDADES.map(u => [u.codigo + ' · ' + u.titulo.slice(0, 26), (porUnidad[u.codigo] || {ok:0}).ok]),
              { anchoEtq: 230, color: (d, i) => (porUnidad[UNIDADES[i].codigo] || {ok:0}).ok === BASE_POR_UNIDAD ? PAL[1] : PAL[0] }))}
    ${flojas.length ? avisoHTML('aten', 'Ruta de refuerzo',
      `<p style="margin:0">Repasa ${esc(flojas.join(', '))} antes del siguiente intento. §5.1 habilita el reintento después del refuerzo, con ítems nuevos o variantes equivalentes.</p>`) : ''}
    ${it.aprobado
      ? avisoHTML('ok', 'Certificado disponible', `<p style="margin:0">Ve a la sección Certificado para verlo e imprimirlo.
          <button class="mini sec no-imprimir" style="margin-left:8px" onclick="irSeccion('f-certificado')">Abrir certificado</button></p>`)
      : avisoHTML('mal', 'Sin certificado · CP-001',
          '<p style="margin:0">Un resultado inferior al 80 % no emite certificado. El intento queda conservado en el historial.</p>')}
    <button class="sec no-imprimir" onclick="estado.examen=null;pintarExamen()">Volver</button>`;
}

function codigoCertificado(nombre, intento, resultado) {
  return 'RHV-MF-' + huella((nombre || '') + '|' + intento + '|' + resultado + '|' +
    new Date().toISOString().slice(0, 10)).replace(/(.{4})/, '$1-');
}

/* ============================================================
   CERTIFICADO · §5.5 y §5.6
   ============================================================ */
VISTAS['f-certificado'] = () => {
  const ap = estado.intentos.filter(i => i.aprobado);
  const ult = ap[ap.length - 1];
  return cabecera('certificado', 'Certificado',
    'Certificación interna de Rehavid. No es certificación oficial del fabricante de Risk Simulator (§5.5).',
    ult ? `<button onclick="imprimir(false)">${ico('imprimir',15)} Imprimir certificado</button>` : '') + `

  ${ult ? renderCertificado(ult) : vacio('certificado',
    'Todavía no hay un intento aprobado. Se emite certificado con 80 % o más.',
    '<button onclick="irSeccion(\'f-evaluacion\')">Ir a la evaluación</button>')}

  <h2>Contenido exigido · §5.5</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:150px">Grupo</th><th>Contenido</th><th style="width:100px">En esta app</th></tr></thead>
    <tbody>
      <tr><td><strong>Identidad</strong></td><td>Nombre completo del participante.</td><td><span class="eti verde">sí</span></td></tr>
      <tr><td><strong>Vinculación</strong></td><td>Cargo registrado y validado en Rehavid.</td><td><span class="eti verde">sí</span></td></tr>
      <tr><td><strong>Formación</strong></td><td>Nombre y versión de la ruta aprobada.</td><td><span class="eti verde">sí</span></td></tr>
      <tr><td><strong>Resultado</strong></td><td>Porcentaje del intento aprobatorio y estado.</td><td><span class="eti verde">sí</span></td></tr>
      <tr><td><strong>Trazabilidad</strong></td><td>Fecha y hora, número de intento, código único y versión del contenido.</td><td><span class="eti verde">sí</span></td></tr>
      <tr><td><strong>Verificación</strong></td><td>Código QR o URL interna; estado vigente, revocado o reemplazado.</td><td><span class="eti ambar">código, sin URL</span></td></tr>
      <tr><td><strong>Emisor</strong></td><td>Rehavid S.A.S. y responsable autorizado.</td><td><span class="eti ambar">pendiente §12.4</span></td></tr>
      <tr><td><strong>Alcance</strong></td><td>Certificación interna, no del fabricante de Risk Simulator.</td><td><span class="eti verde">sí</span></td></tr>
    </tbody></table></div>

  <h2>Control de expedición · §5.6</h2>
  <ul>${CERT_CONTROL.map(c => `<li>${esc(c)}</li>`).join('')}</ul>

  <h2>Historial de intentos</h2>
  ${estado.intentos.length ? `<div class="tabla-caja"><table>
    <thead><tr><th>Intento</th><th>Fecha</th><th class="num">Resultado</th><th class="num">Dominio posterior</th>
      <th>Estado</th><th>Código</th></tr></thead>
    <tbody>${estado.intentos.slice().reverse().map(i => `<tr>
      <td>N.º ${i.n}</td><td>${new Date(i.fecha).toLocaleDateString('es-CO')}</td>
      <td class="num">${fmtN(i.resultado, 1)} %</td><td class="num">${fmtN(i.dominio, 1)} %</td>
      <td><span class="eti ${i.aprobado ? 'verde' : 'roja'}">${i.aprobado ? 'Aprobado' : 'No aprobado'}</span></td>
      <td class="mono" style="font-size:10.5px">${i.aprobado ? esc(i.codigo) : '—'}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="ayuda">§5.4 conserva por separado el resultado del intento certificable y el dominio alcanzado tras el refuerzo. El certificado muestra el resultado del intento aprobatorio, no el dominio posterior.</p>`
   : '<p class="ayuda">Sin intentos registrados.</p>'}`;
};

function renderCertificado(it) {
  const f = new Date(it.fecha);
  return `<div class="certificado" id="certificado">
    <div class="emisor">Rehavid S.A.S.</div>
    <div class="tit">Certificado de formación</div>
    <div class="cuerpo">
      Rehavid S.A.S. certifica que
      <span class="nombre">${esc(it.nombre)}</span>
      quien se desempeña como <strong>${esc(it.cargo)}</strong>, aprobó la ruta de formación en modelación financiera
      y uso aplicado de Risk Simulator, con un resultado de <strong>${fmtN(it.resultado, 1)} %</strong>,
      conforme al criterio mínimo de aprobación del 80 %.
    </div>
    <div class="datos">
      <div><div class="r">Resultado</div><div class="v">${fmtN(it.resultado, 1)} %</div></div>
      <div><div class="r">Estado</div><div class="v">Aprobado</div></div>
      <div><div class="r">Fecha</div><div class="v">${f.toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' })}</div></div>
      <div><div class="r">Intento</div><div class="v">N.º ${it.n}</div></div>
      <div><div class="r">Versión</div><div class="v">v1.0</div></div>
      <div><div class="r">Código verificable</div><div class="v mono">${esc(it.codigo)}</div></div>
    </div>
    <div style="margin-top:18px;font-size:10.5px;color:var(--ink-4);max-width:64ch;margin-left:auto;margin-right:auto">
      Certificación interna de formación de Rehavid S.A.S. No constituye certificación oficial emitida por el
      fabricante de Risk Simulator.
    </div>
  </div>`;
}
