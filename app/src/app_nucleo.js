/* ============================================================
   NÚCLEO · estado, navegación, portada, formación y evaluación
   ============================================================ */

const CLAVE = 'rehavid_modelacion_v1';
let estado = {
  unidadActiva: 0,
  progreso: {},          // codigo unidad -> true
  intentos: [],          // historial de intentos
  examen: null,          // intento en curso
  perfil: { nombre: '', cargo: '' },
  lab: null
};

function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify({
    progreso: estado.progreso, intentos: estado.intentos, perfil: estado.perfil
  })); } catch (e) { /* file:// puede bloquear el almacenamiento; la app sigue funcionando */ }
}
function cargar() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    if (d.progreso) estado.progreso = d.progreso;
    if (d.intentos)  estado.intentos = d.intentos;
    if (d.perfil)    estado.perfil = d.perfil;
  } catch (e) { /* sin almacenamiento disponible */ }
}

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const h  = (t) => { const d = document.createElement('div'); d.innerHTML = t; return d; };

/* ------------------------------------------------------------
   SECCIONES
   ------------------------------------------------------------ */
const SECCIONES = [
  { id:'portada',       n:'0', t:'Portada y síntesis',        g:'Inicio' },
  { id:'formacion',     n:'1', t:'Módulo 1 · Formación',      g:'Módulos del documento' },
  { id:'evaluacion',    n:'2', t:'Evaluación y certificado',  g:'Módulos del documento' },
  { id:'operacion',     n:'3', t:'Módulo 2 · Operación',      g:'Módulos del documento' },
  { id:'especificacion',n:'4', t:'Módulo 3 · Especificación', g:'Módulos del documento' },
  { id:'laboratorio',   n:'5', t:'Laboratorio financiero',    g:'Herramientas' },
  { id:'motor',         n:'6', t:'Motor de análisis',         g:'Herramientas' },
  { id:'comofunciona',  n:'7', t:'Cómo funciona esta app',    g:'Herramientas' },
  { id:'documento',     n:'8', t:'Documento fuente íntegro',  g:'Referencia' },
  { id:'fuentes',       n:'9', t:'Fuentes y trazabilidad',    g:'Referencia' },
  { id:'descargas',     n:'10',t:'Descargas',                 g:'Referencia' }
];

function construirNav() {
  const grupos = [];
  SECCIONES.forEach(s => {
    let g = grupos.find(x => x.n === s.g);
    if (!g) { g = { n: s.g, items: [] }; grupos.push(g); }
    g.items.push(s);
  });
  $('#nav').innerHTML = `
    <div class="marca">
      <div class="logo"><span class="punto"></span>Rehavid</div>
      <div class="sub">Modulación financiera<br>Documento técnico maestro · v1.0</div>
    </div>` +
    grupos.map(g => `<div class="nav-grupo">
      <div class="titulo">${g.n}</div>
      ${g.items.map(s => `<a href="#${s.id}" data-ir="${s.id}"><span class="num">${s.n}</span>${s.t}</a>`).join('')}
    </div>`).join('');
}

function ir(id) {
  $$('.seccion').forEach(s => s.classList.toggle('activa', s.id === 'sec-' + id));
  $$('.nav a').forEach(a => a.classList.toggle('activo', a.dataset.ir === id));
  const s = SECCIONES.find(x => x.id === id);
  if (s) $('#ruta').innerHTML = `${s.g} · <strong>${s.t}</strong>`;
  window.scrollTo({ top: 0, behavior: 'instant' });
  location.hash = id;
}

/* ------------------------------------------------------------
   0 · PORTADA
   ------------------------------------------------------------ */
function secPortada() {
  const altaP = RF.filter(r => r[1] === 'Alta').length;
  const rnfSinCriterio = RNF.filter(r => /por definir|Definir |queda por validar/i.test(r[2])).length;

  const porModulo = {};
  RF.forEach(r => porModulo[r[2]] = (porModulo[r[2]] || 0) + 1);
  const modOrden = Object.entries(porModulo).sort((a,b) => b[1]-a[1]);

  return `
  <h1>App de modulación financiera</h1>
  <p class="entradilla">${esc(META.proceso)}. Esta aplicación recoge el documento técnico
  maestro de ${esc(META.organizacion)}, lo convierte en material de formación, lo visualiza,
  lo analiza con reglas verificables y lo deja imprimible y descargable.</p>

  <div class="aviso">
    <span class="rotulo">Precisión terminológica · §1.1 del documento</span>
    <p>Rehavid denomina el producto <strong>app de modulación financiera</strong>. El término
    técnico del método es <strong>modelación financiera</strong>: representar mediante variables,
    relaciones y supuestos el comportamiento financiero de una empresa o proyecto. El nombre
    comercial conserva “modulación”; esta app usa “modelación” cuando habla del método, tal como
    el documento indica.</p>
  </div>

  <div class="rejilla c4">
    <div class="kpi"><div class="valor">${META.palabras.toLocaleString('es-CO')}</div><div class="rotulo">palabras</div></div>
    <div class="kpi"><div class="valor">${META.tablas}</div><div class="rotulo">tablas</div></div>
    <div class="kpi"><div class="valor">${RF.length}</div><div class="rotulo">req. funcionales</div></div>
    <div class="kpi"><div class="valor">${RNF.length}</div><div class="rotulo">no funcionales</div></div>
  </div>
  <div class="rejilla c4">
    <div class="kpi"><div class="valor">${UNIDADES.length}</div><div class="rotulo">unidades formativas</div></div>
    <div class="kpi"><div class="valor">${COMPONENTES.length}</div><div class="rotulo">componentes</div></div>
    <div class="kpi"><div class="valor">${RIESGOS.length}</div><div class="rotulo">riesgos con control</div></div>
    <div class="kpi"><div class="valor">${FUENTES.length}</div><div class="rotulo">fuentes registradas</div></div>
  </div>

  <h2>Propósito del producto</h2>
  <div class="tarjeta suave">
    <p>Formar, evaluar y certificar a usuarios de Rehavid; guiarlos en la construcción, simulación,
    auditoría e interpretación de modelos financieros; y apoyar decisiones de deuda y liquidez sin
    reemplazar el juicio profesional ni las condiciones contractuales del financiador.</p>
    <div class="procedencia doc">Texto del documento · §1</div>
  </div>

  <h2>El ciclo que organiza todo el producto</h2>
  ${figura('Ciclo de nueve pasos',
    'Aprender → modelar → validar → simular → interpretar → revisar → decidir → comparar → mejorar',
    infoCiclo(CICLO),
    'Fuente: §3 del documento. El ciclo refleja la combinación de deuda, liquidez, incertidumbre, práctica, auditoría y discusión estratégica.')}

  <h2>Qué problema resuelve</h2>
  <ul>${PROBLEMAS.map(p => `<li>${esc(p)}</li>`).join('')}</ul>

  <h2>Alcance</h2>
  <div class="rejilla c2">
    <div class="tarjeta">
      <h4 style="color:var(--green-dark)">Incluido en el alcance base</h4>
      <ul style="margin-bottom:0">${ALCANCE.incluido.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>
    <div class="tarjeta">
      <h4 style="color:var(--bad)">Excluido sin instrucción adicional</h4>
      <ul style="margin-bottom:0">${ALCANCE.excluido.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>
  </div>

  <h2>Distribución de los requisitos</h2>
  <div class="rejilla c2">
    ${figura('Requisitos funcionales por prioridad','32 requisitos declarados en §11.1',
      `<div style="max-width:300px;margin:0 auto">${anillo([['Alta',altaP],['Media',RF.length-altaP]],{centro:'requisitos'})}</div>`,
      null, leyendaDe([[PAL[0],'Prioridad alta'],[PAL[1],'Prioridad media']]))}
    ${figura('Requisitos no funcionales','14 categorías en §11.2',
      `<div style="max-width:300px;margin:0 auto">${anillo([['Con criterio',RNF.length-rnfSinCriterio],['Sin criterio verificable',rnfSinCriterio]],{centro:'RNF'})}</div>`,
      `<strong>${rnfSinCriterio} de ${RNF.length}</strong> quedan sin criterio comprobable porque su texto aplaza la definición. Ver el motor de análisis, hallazgo V-04.`,
      leyendaDe([[PAL[0],'Verificable'],[PAL[1],'Pendiente de definir']]))}
  </div>

  ${figura('Requisitos funcionales por módulo', 'Dónde se concentra el trabajo del producto',
    barrasH(modOrden, {anchoEtq: 150, color: (d,i) => PAL[i % 2 === 0 ? 0 : 4]}),
    'Fuente: columna “Módulo” de la tabla de §11.1. Evaluación es el módulo con más requisitos, lo que refleja el peso de la instrucción [R-03] sobre evaluación adaptativa.')}

  <h2>La base probatoria del documento</h2>
  ${figura('Segundos de transcripción efectivamente citados',
    'El documento declara un rango; las citas cubren una parte de él',
    infoBaseProbatoria(FUENTES),
    'Cálculo hecho por esta app sobre los rangos declarados en la tabla de fuentes (§13.2). El documento reconoce el alcance limitado de la transcripción en su advertencia de alcance probatorio.')}

  <div class="aviso aten">
    <span class="rotulo">Lectura honesta de ese dato</span>
    <p>Esto no invalida el documento. Significa que su contenido no <em>deriva</em> de la
    transcripción: se <em>apoya</em> en ella. El peso lo lleva el trabajo de ingeniería de
    requisitos y las fuentes institucionales. Por eso “pedir transcripciones adicionales”, que
    en §12.4 aparece como el último de trece pendientes, debería ser una prioridad.</p>
  </div>

  <h2>Ficha del documento</h2>
  <div class="tabla-caja"><table>
    <tbody>
      <tr><td style="width:200px"><strong>Organización</strong></td><td>${esc(META.organizacion)}</td></tr>
      <tr><td><strong>Estado</strong></td><td>${esc(META.estado)}</td></tr>
      <tr><td><strong>Versión</strong></td><td>${esc(META.version)}</td></tr>
      <tr><td><strong>Fecha</strong></td><td>${esc(META.fecha)}</td></tr>
      <tr><td><strong>Fuente primaria</strong></td><td>${esc(META.fuentePrimaria)}</td></tr>
      <tr><td><strong>Clasificación</strong></td><td>${esc(META.clasificacion)}</td></tr>
    </tbody>
  </table></div>`;
}

/* ------------------------------------------------------------
   1 · FORMACIÓN
   ------------------------------------------------------------ */
function secFormacion() {
  return `
  <h1>Módulo 1 · Formación</h1>
  <p class="entradilla">Ruta de ocho unidades. El objetivo del documento (§4) es que el
  participante comprenda, construya, cuestione e interprete un modelo financiero de deuda y
  liquidez, y que pueda utilizar Risk Simulator con criterio técnico.</p>

  <div class="aviso">
    <span class="rotulo">Cómo leer este módulo</span>
    <p>Cada unidad tiene dos niveles. El <strong>nivel básico</strong> reproduce el desarrollo
    mínimo que fija el documento en §4.2. El <strong>nivel intermedio</strong> es contenido
    complementario elaborado para esta app: profundiza en los mismos conceptos y va marcado como
    aporte externo en cada bloque. Ninguno de los dos contiene cifras de Rehavid, porque el
    documento no aporta ninguna.</p>
  </div>

  ${figura('Ruta de aprendizaje', 'Las ocho unidades y su traducción al producto',
    infoRuta(UNIDADES),
    'Fuente: §4.1 del documento. La flecha indica cómo cada competencia se convierte en una funcionalidad de la app.')}

  <h2>Avance</h2>
  <div class="tarjeta no-imprimir">
    <div class="progreso" style="margin-bottom:9px"><i id="barra-form" style="width:0%"></i></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-3)">
      <span id="txt-form">0 de ${UNIDADES.length} unidades marcadas como leídas</span>
      <button class="secundario" onclick="reiniciarProgreso()">Reiniciar avance</button>
    </div>
  </div>

  <div class="interruptor no-imprimir" style="margin-bottom:18px;width:max-content">
    ${UNIDADES.map((u,i) => `<button data-uni="${i}" onclick="verUnidad(${i})">${u.codigo}</button>`).join('')}
  </div>

  <div id="unidad-cuerpo"></div>`;
}

function verUnidad(i) {
  estado.unidadActiva = i;
  const u = UNIDADES[i];
  $$('[data-uni]').forEach(b => b.classList.toggle('activo', +b.dataset.uni === i));
  const leida = !!estado.progreso[u.codigo];
  const preg = PREGUNTAS.filter(p => p.u === u.codigo);

  $('#unidad-cuerpo').innerHTML = `
  <div class="unidad-cab">
    <div class="insignia">${u.codigo}</div>
    <div style="flex:1">
      <h2 style="margin:0;border:none;padding:0;font-size:19px">${esc(u.titulo)}</h2>
      <div class="competencia"><strong>Competencia:</strong> ${esc(u.competencia)}</div>
    </div>
  </div>

  <div class="aviso ok" style="margin-top:0">
    <span class="rotulo">Traducción a la app</span>
    <p>${esc(u.aplicacion)}</p>
  </div>

  <div class="nivel basico">
    <div class="rotulo">Nivel básico · desarrollo mínimo del documento</div>
    <div class="procedencia doc">Contenido del documento · §4.2</div>
    <ul>${u.basico.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
  </div>

  <div class="nivel intermedio">
    <div class="rotulo">Nivel intermedio</div>
    <div class="procedencia ext">Aporte externo · no está en el documento</div>
    <p>${esc(u.intermedio.intro)}</p>
    <dl class="glosario">
      ${u.intermedio.puntos.map(([t,d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}
    </dl>
    <h4 style="margin-top:18px">Errores frecuentes</h4>
    <ul>${u.intermedio.errores.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
  </div>

  <div class="tarjeta suave">
    <h4 style="margin-top:0">Preguntas de esta unidad en el banco</h4>
    <p style="font-size:12.5px;margin-bottom:8px">${preg.length} ítems ·
    ${preg.filter(p=>p.origen==='doc').length} del documento (Tabla 16) ·
    ${preg.filter(p=>p.origen==='ext').length} añadidos para poder construir la repregunta equivalente.</p>
    <button class="secundario no-imprimir" onclick="ir('evaluacion')">Ir a la evaluación</button>
  </div>

  <div class="no-imprimir" style="display:flex;gap:9px;margin-top:16px">
    <button class="${leida?'secundario':''}" onclick="marcarLeida('${u.codigo}')">
      ${leida ? '✓ Marcada como leída' : 'Marcar unidad como leída'}</button>
    ${i > 0 ? `<button class="secundario" onclick="verUnidad(${i-1})">← ${UNIDADES[i-1].codigo}</button>` : ''}
    ${i < UNIDADES.length-1 ? `<button class="secundario" onclick="verUnidad(${i+1})">${UNIDADES[i+1].codigo} →</button>` : ''}
  </div>`;
  actualizarProgreso();
}

function marcarLeida(cod) {
  estado.progreso[cod] = !estado.progreso[cod];
  guardar(); verUnidad(estado.unidadActiva);
}
function reiniciarProgreso() {
  estado.progreso = {}; guardar(); verUnidad(estado.unidadActiva);
}
function actualizarProgreso() {
  const n = Object.values(estado.progreso).filter(Boolean).length;
  const b = $('#barra-form'), t = $('#txt-form');
  if (b) b.style.width = (n / UNIDADES.length * 100) + '%';
  if (t) t.textContent = `${n} de ${UNIDADES.length} unidades marcadas como leídas`;
}

/* ------------------------------------------------------------
   2 · EVALUACIÓN ADAPTATIVA Y CERTIFICADO
   ------------------------------------------------------------ */
const BASE_POR_UNIDAD = 2;   // 16 preguntas base; el resto queda como equivalencias

function secEvaluacion() {
  return `
  <h1>Evaluación adaptativa y certificado</h1>
  <p class="entradilla">Implementa el diseño de §5: corrección inmediata, repregunta equivalente
  distinta, umbral del 80 % y certificado con nombre, cargo y resultado.</p>

  <h2>Cómo está diseñada</h2>
  <div class="tabla-caja"><table>
    <caption>§5.1 · Etapas de la evaluación</caption>
    <thead><tr><th style="width:150px">Etapa</th><th>Comportamiento de la app</th><th style="width:210px">Efecto en el resultado</th></tr></thead>
    <tbody>${EVAL_ETAPAS.map(e => `<tr><td><strong>${esc(e[0])}</strong></td><td>${esc(e[1])}</td><td>${esc(e[2])}</td></tr>`).join('')}</tbody>
  </table></div>

  <div class="aviso aten">
    <span class="rotulo">Dos decisiones tomadas ante vacíos del documento</span>
    <p><strong>1 · Denominador del intento.</strong> §5.4 define el resultado como “respuestas
    correctas en primera respuesta ÷ <em>preguntas válidas</em> × 100”, pero no define qué son
    preguntas válidas, y §5.1 introduce repreguntas dentro del examen. Si las repreguntas entraran
    al denominador, cada error penalizaría dos veces. <strong>Esta app cuenta solo los ${BASE_POR_UNIDAD * UNIDADES.length}
    ítems base</strong>, que es la lectura que preserva el significado del 80 %. Es una decisión de
    implementación, no algo que el documento diga.</p>
    <p><strong>2 · Grupo de equivalencia.</strong> §5.2 exige repreguntar con otro ítem del mismo
    objetivo, pero la Tabla 16 aporta una sola pregunta por unidad. <strong>Esta app usa la unidad
    como grupo de equivalencia</strong> y añade ítems propios, marcados como aporte externo.</p>
  </div>

  <h2>Tu perfil</h2>
  <div class="tarjeta no-imprimir">
    <div class="rejilla c2" style="margin-bottom:0">
      <div class="campo"><label for="in-nombre">Nombre completo</label>
        <input type="text" id="in-nombre" placeholder="Como debe aparecer en el certificado"
               value="${esc(estado.perfil.nombre)}" oninput="estado.perfil.nombre=this.value;guardar()"></div>
      <div class="campo"><label for="in-cargo">Cargo en Rehavid</label>
        <input type="text" id="in-cargo" placeholder="Cargo registrado"
               value="${esc(estado.perfil.cargo)}" oninput="estado.perfil.cargo=this.value;guardar()"></div>
    </div>
    <div class="campo" style="margin-bottom:0"><div class="ayuda">§6.2 pide confirmar nombre y cargo
    antes del examen. Estos datos se guardan solo en este navegador; la app no los envía a ningún sitio.</div></div>
  </div>

  <div id="examen-zona"></div>

  <h2>Historial de intentos</h2>
  <div id="historial"></div>`;
}

function iniciarExamen() {
  if (!estado.perfil.nombre.trim() || !estado.perfil.cargo.trim()) {
    alert('Registra nombre y cargo antes de iniciar. §6.2 del documento lo exige antes del examen.');
    return;
  }
  const base = [], pool = {};
  UNIDADES.forEach(u => {
    const items = PREGUNTAS.filter(p => p.u === u.codigo).slice();
    barajar(items);
    base.push(...items.slice(0, BASE_POR_UNIDAD));
    pool[u.codigo] = items.slice(BASE_POR_UNIDAD);
  });
  barajar(base);
  estado.examen = {
    base, pool, i: 0, aciertosPrimera: 0,
    respuestas: [], repregunta: null, objetivosDominados: {},
    objetivosFallados: {}, inicio: Date.now(), terminado: false
  };
  pintarExamen();
}

function barajar(a) { for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } }

function pintarExamen() {
  const e = estado.examen, z = $('#examen-zona');
  if (!e) {
    const ult = estado.intentos[estado.intentos.length-1];
    z.innerHTML = `<h2>Evaluación certificable</h2>
      <div class="tarjeta">
        <p>El examen toma <strong>${BASE_POR_UNIDAD} ítems por unidad</strong>
        (${BASE_POR_UNIDAD*UNIDADES.length} en total), en orden aleatorio y balanceado por unidades,
        como pide §5.1. Ante un error verás la corrección, la explicación y una repregunta distinta
        de la misma unidad; esa repregunta no puntúa, pero sí registra dominio.</p>
        <p style="margin-bottom:16px">Se aprueba con <strong>80 % o más</strong> sobre los ítems base.</p>
        <button class="no-imprimir" onclick="iniciarExamen()">Iniciar evaluación certificable</button>
      </div>
      ${ult && ult.aprobado ? renderCertificado(ult) : ''}`;
    pintarHistorial();
    return;
  }
  if (e.terminado) return;

  const total = e.base.length;
  const preg = e.repregunta || e.base[e.i];
  const esRe = !!e.repregunta;
  const resp = e.respuestas[e.i];

  z.innerHTML = `<h2>Evaluación en curso</h2>
  <div class="tarjeta no-imprimir" style="margin-bottom:14px">
    <div class="progreso" style="margin-bottom:8px"><i style="width:${e.i/total*100}%"></i></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-3)">
      <span>Ítem base ${Math.min(e.i+1,total)} de ${total}${esRe ? ' · <strong style="color:var(--warn)">repregunta de refuerzo</strong>' : ''}</span>
      <span>Aciertos en primera respuesta: <strong>${e.aciertosPrimera}</strong></span>
    </div>
  </div>

  <div class="pregunta">
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">
      <span class="etiqueta">${preg.u}</span>
      <span class="etiqueta ${preg.origen==='doc'?'verde':'ambar'}">${preg.origen==='doc'?'Pregunta del documento':'Ítem añadido'}</span>
      <span style="font-size:10.5px;color:var(--ink-4)">Objetivo: ${esc(preg.objetivo)}</span>
    </div>
    <div class="enunciado">${esc(preg.enunciado)}</div>
    <div class="opciones" id="opciones">
      ${preg.opciones.map((o,k) => `<div class="opcion" data-k="${k}" onclick="responder(${k})">
        <span class="letra">${'ABCD'[k]}</span><span>${esc(o)}</span></div>`).join('')}
    </div>
    <div id="retro"></div>
  </div>`;
}

function responder(k) {
  const e = estado.examen;
  if (!e || e.terminado) return;
  const preg = e.repregunta || e.base[e.i];
  const esRe = !!e.repregunta;
  // Un ítem base solo puntúa una vez: la primera respuesta es la que cuenta (§5.1).
  if (!esRe && e.respuestas[e.i]) return;
  const ok = k === preg.correcta;

  $$('#opciones .opcion').forEach(o => {
    o.classList.add('bloqueada');
    const kk = +o.dataset.k;
    if (kk === preg.correcta) o.classList.add('correcta');
    else if (kk === k) o.classList.add('incorrecta');
  });

  if (!esRe) {
    e.respuestas[e.i] = { id: preg.id, ok, u: preg.u };
    if (ok) { e.aciertosPrimera++; e.objetivosDominados[preg.objetivo] = true; }
    else e.objetivosFallados[preg.objetivo] = true;
  } else if (ok) {
    e.objetivosDominados[preg.objetivo] = true;
  }

  const hayEquivalente = e.pool[preg.u] && e.pool[preg.u].length > 0;

  $('#retro').innerHTML = `
    <div class="aviso ${ok ? 'ok' : 'mal'}" style="margin-bottom:12px">
      <span class="rotulo">${ok ? 'Respuesta correcta' : 'Respuesta incorrecta'}</span>
      <p style="margin-bottom:6px">${esc(ok ? preg.bien : preg.mal)}</p>
      ${!ok ? `<p style="margin-bottom:6px"><strong>Respuesta correcta:</strong> ${esc(preg.opciones[preg.correcta])}</p>` : ''}
      <p style="margin-bottom:0;font-size:12px"><strong>Riesgo de aplicar mal el concepto:</strong> ${esc(preg.riesgo)}</p>
    </div>
    ${!ok && !esRe && hayEquivalente
      ? `<div class="aviso aten" style="margin-bottom:12px">
           <span class="rotulo">Repregunta · §5.2</span>
           <p style="margin-bottom:0">Esta respuesta queda como incorrecta para el intento. A
           continuación verás <strong>otro ítem de ${preg.u}</strong>, con enunciado y opciones
           distintos, para comprobar si el concepto quedó claro. Esa pregunta no modifica el resultado.</p>
         </div>
         <button class="no-imprimir" onclick="lanzarRepregunta('${preg.u}')">Ver la repregunta</button>`
      : `<button class="no-imprimir" onclick="siguiente()">${e.i >= e.base.length-1 ? 'Ver resultado' : 'Siguiente pregunta'}</button>`}
    ${!ok && !esRe && !hayEquivalente
      ? `<div class="aviso" style="margin-top:12px"><span class="rotulo">Sin equivalencias disponibles</span>
         <p style="margin-bottom:0">El banco de ${preg.u} agotó sus ítems equivalentes en este intento.
         El documento no fija un mínimo de ítems por objetivo: es el vacío V-02 del motor de análisis.</p></div>` : ''}`;
}

function lanzarRepregunta(unidad) {
  const e = estado.examen;
  e.repregunta = e.pool[unidad].shift();
  pintarExamen();
}
function siguiente() {
  const e = estado.examen;
  e.repregunta = null;
  e.i++;
  if (e.i >= e.base.length) cerrarIntento(); else pintarExamen();
}

function cerrarIntento() {
  const e = estado.examen;
  const total = e.base.length;
  const resultado = e.aciertosPrimera / total * 100;
  const objetivos = Object.keys(e.objetivosDominados).length + Object.keys(e.objetivosFallados)
    .filter(o => !e.objetivosDominados[o]).length;
  const dominio = objetivos ? Object.keys(e.objetivosDominados).length / objetivos * 100 : 0;

  const porUnidad = {};
  e.respuestas.forEach(r => {
    if (!porUnidad[r.u]) porUnidad[r.u] = { ok: 0, n: 0 };
    porUnidad[r.u].n++; if (r.ok) porUnidad[r.u].ok++;
  });

  const intento = {
    n: estado.intentos.length + 1,
    nombre: estado.perfil.nombre, cargo: estado.perfil.cargo,
    resultado: Math.round(resultado * 10) / 10,
    dominio: Math.round(dominio * 10) / 10,
    aprobado: resultado >= 80,
    aciertos: e.aciertosPrimera, total,
    fecha: new Date().toISOString(),
    minutos: Math.max(1, Math.round((Date.now() - e.inicio) / 60000)),
    porUnidad,
    codigo: codigoCertificado(estado.perfil.nombre, estado.intentos.length + 1, Math.round(resultado))
  };
  estado.intentos.push(intento);
  estado.examen = null;
  guardar();

  const flojas = Object.entries(porUnidad).filter(([,v]) => v.ok < v.n).map(([u]) => u);

  $('#examen-zona').innerHTML = `
    <h2>Resultado del intento ${intento.n}</h2>
    <div class="rejilla c4">
      <div class="kpi"><div class="valor">${fmtN(intento.resultado,1)}<small>%</small></div><div class="rotulo">resultado del intento</div></div>
      <div class="kpi"><div class="valor">${intento.aciertos}<small>/${total}</small></div><div class="rotulo">aciertos en primera</div></div>
      <div class="kpi"><div class="valor">${fmtN(intento.dominio,1)}<small>%</small></div><div class="rotulo">dominio posterior</div></div>
      <div class="kpi"><div class="valor" style="color:${intento.aprobado?'var(--green-dark)':'var(--bad)'}">${intento.aprobado?'Aprobado':'No aprobado'}</div><div class="rotulo">criterio ≥ 80 %</div></div>
    </div>

    ${figura('Aciertos por unidad', 'Sobre los ítems base del intento',
      barrasH(UNIDADES.map(u => [u.codigo + ' · ' + u.titulo.slice(0,28), (porUnidad[u.codigo]||{ok:0}).ok]),
              {anchoEtq: 240, color: (d,i) => (porUnidad[UNIDADES[i].codigo]||{ok:0,n:1}).ok === BASE_POR_UNIDAD ? PAL[1] : PAL[0]}),
      'Verde: unidad completa. Morado: quedan ítems fallados en primera respuesta.')}

    ${flojas.length ? `<div class="aviso aten"><span class="rotulo">Ruta de refuerzo</span>
      <p style="margin-bottom:0">Repasa ${esc(flojas.join(', '))} antes del siguiente intento.
      §5.1 habilita el reintento después del refuerzo, con ítems nuevos o variantes equivalentes.</p></div>` : ''}

    ${intento.aprobado ? renderCertificado(intento) : `<div class="aviso mal">
      <span class="rotulo">Sin certificado · CP-001</span>
      <p style="margin-bottom:0">Un resultado inferior al 80 % no emite certificado. El intento
      queda conservado en el historial, como exige el caso de prueba CP-001.</p></div>`}

    <button class="no-imprimir" style="margin-top:14px" onclick="estado.examen=null;pintarExamen()">Volver</button>`;
  pintarHistorial();
}

function codigoCertificado(nombre, intento, resultado) {
  const s = (nombre || '') + '|' + intento + '|' + resultado + '|' + new Date().toISOString().slice(0,10);
  let a = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { a ^= s.charCodeAt(i); a = Math.imul(a, 0x01000193) >>> 0; }
  const hex = a.toString(16).toUpperCase().padStart(8, '0');
  return 'RHV-MF-' + hex.slice(0,4) + '-' + hex.slice(4);
}

function renderCertificado(it) {
  const f = new Date(it.fecha);
  const fecha = f.toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' });
  return `
  <h2 class="salto-antes">Certificado</h2>
  <div class="certificado" id="certificado">
    <div class="emisor">${esc(META.organizacion)}</div>
    <div class="titulo">Certificado de formación</div>
    <div class="cuerpo">
      ${esc(META.organizacion)} certifica que
      <span class="nombre">${esc(it.nombre)}</span>
      quien se desempeña como <strong>${esc(it.cargo)}</strong>, aprobó la ruta de formación en
      modelación financiera y uso aplicado de Risk Simulator, con un resultado de
      <strong>${fmtN(it.resultado,1)} %</strong>, conforme al criterio mínimo de aprobación del 80 %.
    </div>
    <div class="datos">
      <div><div class="r">Resultado</div><div class="v">${fmtN(it.resultado,1)} %</div></div>
      <div><div class="r">Estado</div><div class="v">Aprobado</div></div>
      <div><div class="r">Fecha</div><div class="v">${esc(fecha)}</div></div>
      <div><div class="r">Intento</div><div class="v">N.º ${it.n}</div></div>
      <div><div class="r">Versión del contenido</div><div class="v">v1.0</div></div>
      <div><div class="r">Código verificable</div><div class="v mono">${esc(it.codigo)}</div></div>
    </div>
    <div style="margin-top:20px;font-size:10.5px;color:var(--ink-4);max-width:64ch;margin-left:auto;margin-right:auto">
      Certificación interna de formación de ${esc(META.organizacion)}. No constituye certificación
      oficial emitida por el fabricante de Risk Simulator. §5.5 del documento.
    </div>
  </div>
  <div class="no-imprimir" style="margin-top:12px;display:flex;gap:9px">
    <button onclick="imprimirCertificado()">Imprimir certificado</button>
  </div>`;
}

function imprimirCertificado() {
  document.body.classList.remove('imprimir-todo');
  ir('evaluacion');
  window.print();
}

function pintarHistorial() {
  const z = $('#historial');
  if (!z) return;
  if (!estado.intentos.length) {
    z.innerHTML = `<p style="color:var(--ink-4);font-size:13px">Todavía no hay intentos registrados.</p>`;
    return;
  }
  z.innerHTML = `<div class="tabla-caja"><table>
    <thead><tr><th>Intento</th><th>Fecha</th><th>Resultado</th><th>Dominio posterior</th><th>Estado</th><th>Código</th></tr></thead>
    <tbody>${estado.intentos.slice().reverse().map(i => `<tr>
      <td>N.º ${i.n}</td>
      <td>${new Date(i.fecha).toLocaleDateString('es-CO')}</td>
      <td class="num">${fmtN(i.resultado,1)} %</td>
      <td class="num">${fmtN(i.dominio,1)} %</td>
      <td><span class="etiqueta ${i.aprobado?'verde':'roja'}">${i.aprobado?'Aprobado':'No aprobado'}</span></td>
      <td class="mono" style="font-size:10.5px">${i.aprobado?esc(i.codigo):'—'}</td>
    </tr>`).join('')}</tbody>
  </table></div>
  <p style="font-size:11.5px;color:var(--ink-4)">§5.4 conserva por separado el resultado del intento
  certificable y el dominio alcanzado después del refuerzo. El certificado muestra el resultado del
  intento aprobatorio, no el dominio posterior.</p>`;
}
