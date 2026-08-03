/* ============================================================
   NÚCLEO · estado, almacenamiento y navegación de la app
   Tres módulos: Formación · Manual de operación · Herramienta financiera
   ============================================================ */

const CLAVE = 'rehavid_mf_v2';

const MODULOS = [
  { id:'formacion', n:1, t:'Formación', ico:'formacion',
    sub:'Conceptos básicos e intermedios de modelación financiera',
    secciones:[
      { id:'f-ruta',        t:'Ruta de aprendizaje',      ico:'inicio' },
      { id:'f-unidad',      t:'Unidades U1–U8',           ico:'libro' },
      { id:'f-actividades', t:'Actividades formativas',   ico:'play' },
      { id:'f-rs',          t:'Laboratorio Risk Simulator', ico:'simulacion' },
      { id:'f-glosario',    t:'Glosario',                 ico:'buscar' },
      { id:'f-evaluacion',  t:'Evaluación certificable',  ico:'ok' },
      { id:'f-certificado', t:'Certificado',              ico:'certificado' }
    ] },
  { id:'manual', n:2, t:'Manual de operación', ico:'manual',
    sub:'Cómo se usa la app y cómo opera cada rol',
    secciones:[
      { id:'m-uso',      t:'Cómo usar esta app',       ico:'inicio' },
      { id:'m-roles',    t:'Perfiles y permisos',      ico:'usuario' },
      { id:'m-rutas',    t:'Rutas por rol',            ico:'flecha' },
      { id:'m-estados',  t:'Estados del modelo',       ico:'refrescar' },
      { id:'m-errores',  t:'Mensajes y bloqueos',      ico:'alerta' },
      { id:'m-rs',       t:'Risk Simulator',           ico:'simulacion' },
      { id:'m-calidad',  t:'Calidad del dato',         ico:'candado' },
      { id:'m-doc',      t:'Documento fuente',         ico:'reportes' }
    ] },
  { id:'herramienta', n:3, t:'Herramienta financiera', ico:'herramienta',
    sub:'Deuda, cobertura, liquidez, capacidad, escenarios y decisión',
    secciones:[
      { id:'h-panel',      t:'Panel',              ico:'tableros' },
      { id:'h-proyecto',   t:'Proyecto',           ico:'proyecto' },
      { id:'h-supuestos',  t:'Supuestos',          ico:'supuestos' },
      { id:'h-deuda',      t:'Deuda',              ico:'deuda' },
      { id:'h-flujo',      t:'Flujo y CFADS',      ico:'flujo' },
      { id:'h-covenants',  t:'Covenants',          ico:'covenant' },
      { id:'h-liquidez',   t:'Liquidez',           ico:'liquidez' },
      { id:'h-capacidad',  t:'Capacidad',          ico:'capacidad' },
      { id:'h-escenarios', t:'Escenarios',         ico:'escenarios' },
      { id:'h-simulacion', t:'Simulación',         ico:'simulacion' },
      { id:'h-auditoria',  t:'Auditoría',          ico:'auditoria' },
      { id:'h-backtest',   t:'Backtesting',        ico:'backtesting' },
      { id:'h-decision',   t:'Decisión',           ico:'decision' },
      { id:'h-reportes',   t:'Reportes',           ico:'reportes' }
    ] }
];

/* ------------------------------------------------------------
   ESTADO INICIAL
   Los valores de arranque son un EJEMPLO NEUTRO. El documento no
   contiene ninguna cifra financiera (§2.1), así que nada de esto
   procede de Rehavid.
   ------------------------------------------------------------ */
function proyectoNuevo() {
  return {
    nombre: '', proposito: '', responsable: '', alcance: '',
    horizonte: 12, periodicidad: 4, moneda: 'COP',
    version: 1, estado: 'Borrador', creado: null,
    advertencia: 'Modelo de apoyo a la decisión. No sustituye el juicio profesional ni las condiciones contractuales del financiador.'
  };
}

const EJEMPLO = {
  proyecto: {
    nombre: 'Ejemplo neutro · estructura de deuda', proposito: 'Demostrar el funcionamiento de la herramienta',
    responsable: 'Sin asignar', alcance: 'Datos de demostración, no corresponden a ninguna operación real',
    horizonte: 12, periodicidad: 4, moneda: 'COP', version: 1, estado: 'Borrador', creado: null,
    advertencia: 'Modelo de apoyo a la decisión. No sustituye el juicio profesional ni las condiciones contractuales del financiador.'
  },
  supuestos: [
    { variable:'Crecimiento de ingresos', valor:0, unidad:'% por periodo', periodo:'todo el horizonte',
      fuente:'', racional:'', responsable:'', tipo:'proyeccion' },
    { variable:'Tasa nominal del tramo A', valor:12, unidad:'% anual', periodo:'contractual',
      fuente:'Contrato de crédito (pendiente de adjuntar)', racional:'Condición pactada', responsable:'', tipo:'dato' }
  ],
  tramos: [
    { nombre:'Tramo A', monto:1000000, tasa:12, metodo:'frances', gracia:0, plazo:12, desde:1, baseDias:'30/360' }
  ],
  flujo: [
    { concepto:'Ingresos de caja operativos', tipo:'ingreso',   valor:420000, crec:0, elegible:true },
    { concepto:'Egresos operativos',          tipo:'egreso',    valor:280000, crec:0, elegible:true },
    { concepto:'Inversión comprometida',      tipo:'inversion', valor:20000,  crec:0, elegible:true },
    { concepto:'Ingreso no recurrente',       tipo:'ingreso',   valor:60000,  crec:0, elegible:false }
  ],
  covenants: [
    { indicador:'DSCR mínimo', umbral:1.20, frecuencia:'Cada periodo', cura:'', consecuencia:'', fuente:'', desde:1, hasta:0 }
  ],
  liquidez: { caja0:150000, cajaMin:80000 },
  escenarios: [],
  simulacion: null,
  backtest: [],
  decision: { responsable:'', fecha:'', comentario:'', residual:'', escenario:'' },
  revision: { revisor:'', hallazgos:[] }
};

let estado = {
  modulo: 'formacion',
  seccion: 'f-ruta',
  perfil: { nombre:'', cargo:'', rol:'Participante / modelador' },
  formacion: { leidas:{}, actividades:{}, rs:{} },
  intentos: [],
  examen: null,
  unidad: 0,
  m: JSON.parse(JSON.stringify(EJEMPLO))   // «m» = el modelo financiero en curso
};

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({
      perfil: estado.perfil, formacion: estado.formacion,
      intentos: estado.intentos, m: estado.m
    }));
  } catch (e) { /* file:// puede bloquear el almacenamiento */ }
}
function cargar() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    if (d.perfil)    estado.perfil = Object.assign(estado.perfil, d.perfil);
    if (d.formacion) estado.formacion = Object.assign(estado.formacion, d.formacion);
    if (d.intentos)  estado.intentos = d.intentos;
    if (d.m)         estado.m = Object.assign(estado.m, d.m);
  } catch (e) { /* sin almacenamiento */ }
}

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ------------------------------------------------------------
   NAVEGACIÓN
   ------------------------------------------------------------ */
function construirBarra() {
  $('#pestanas').innerHTML = MODULOS.map(m =>
    `<button data-mod="${m.id}" onclick="irModulo('${m.id}')" title="${esc(m.sub)}">
       <span class="n">${m.n}</span>${ico(m.ico, 17)}<span class="txt">${esc(m.t)}</span>
     </button>`).join('');
}

function construirLateral() {
  const m = MODULOS.find(x => x.id === estado.modulo);
  $('#lateral').innerHTML = `<div class="grupo">
    <div class="tit">${esc(m.t)}</div>
    ${m.secciones.map(s => `<a data-sec="${s.id}" onclick="irSeccion('${s.id}')">
        ${ico(s.ico, 16)}<span>${esc(s.t)}</span>${marcaEstado(s.id)}
      </a>`).join('')}
  </div>`;
  $$('#lateral a').forEach(a => a.classList.toggle('activo', a.dataset.sec === estado.seccion));
}

/* Punto de color a la derecha de una entrada del menú lateral */
function marcaEstado(sid) {
  if (estado.modulo !== 'herramienta') {
    if (sid === 'f-unidad') {
      const n = Object.values(estado.formacion.leidas).filter(Boolean).length;
      return n === UNIDADES.length ? '<span class="marca-est ok"></span>' : '';
    }
    if (sid === 'f-certificado')
      return estado.intentos.some(i => i.aprobado) ? '<span class="marca-est ok"></span>' : '';
    return '';
  }
  const v = validar();
  const mapa = {
    'h-proyecto': v.filter(x => x.donde === 'proyecto'),
    'h-supuestos': v.filter(x => x.donde === 'supuestos'),
    'h-covenants': v.filter(x => x.donde === 'covenants'),
    'h-deuda': v.filter(x => x.donde === 'deuda'),
    'h-liquidez': v.filter(x => x.donde === 'liquidez'),
    'h-decision': v.filter(x => x.donde === 'decision'),
    'h-simulacion': v.filter(x => x.donde === 'simulacion')
  };
  const h = mapa[sid];
  if (!h) return '';
  if (h.some(x => x.sev === 'critico')) return '<span class="marca-est mal"></span>';
  if (h.length) return '<span class="marca-est aten"></span>';
  return '<span class="marca-est ok"></span>';
}

function irModulo(id) {
  estado.modulo = id;
  const m = MODULOS.find(x => x.id === id);
  estado.seccion = m.secciones[0].id;
  $$('#pestanas button').forEach(b => b.classList.toggle('activo', b.dataset.mod === id));
  construirLateral();
  pintar();
  location.hash = estado.seccion;
}

function irSeccion(sid) {
  const m = MODULOS.find(x => x.secciones.some(s => s.id === sid));
  if (!m) return;
  estado.modulo = m.id;
  estado.seccion = sid;
  $$('#pestanas button').forEach(b => b.classList.toggle('activo', b.dataset.mod === m.id));
  construirLateral();
  pintar();
  location.hash = sid;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

const VISTAS = {};   // sid -> función que devuelve el HTML

function pintar() {
  const fn = VISTAS[estado.seccion];
  $('#vista').innerHTML = `<div class="panel activo" id="p-${estado.seccion}">${
    fn ? fn() : '<div class="vacio">Sección no disponible.</div>'}</div>
    <div class="pie-impresion" id="pie-impresion"></div>`;
  if (typeof despuesDePintar === 'function') despuesDePintar(estado.seccion);
  construirLateral();
}

/* ------------------------------------------------------------
   AUXILIARES DE INTERFAZ
   ------------------------------------------------------------ */
function cabecera(iconoN, titulo, sub, acciones) {
  return `<div class="vista-cab">
    <div class="emblema">${ico(iconoN, 22)}</div>
    <div style="flex:1;min-width:0"><h1>${esc(titulo)}</h1>
      ${sub ? `<div class="sub">${sub}</div>` : ''}</div>
    ${acciones ? `<div class="acc no-imprimir">${acciones}</div>` : ''}
  </div>`;
}

function avisoHTML(tipo, rotulo, cuerpo) {
  const iconos = { '': 'info', ok: 'ok', aten: 'alerta', mal: 'error' };
  return `<div class="aviso ${tipo}">${ico(iconos[tipo] || 'info', 17)}
    <div class="txt"><span class="rot">${esc(rotulo)}</span>${cuerpo}</div></div>`;
}

function tile(rotulo, valor, pie, clase, iconoN) {
  return `<div class="tile ${clase || ''}">
    <div class="rot">${iconoN ? ico(iconoN, 13) : ''}${esc(rotulo)}</div>
    <div class="val">${valor}</div>
    ${pie ? `<div class="pie">${pie}</div>` : ''}</div>`;
}

function vacio(iconoN, texto, boton) {
  return `<div class="vacio">${ico(iconoN, 30)}<p>${texto}</p>${boton || ''}</div>`;
}

let tempToast;
function toast(msg, tipo) {
  clearTimeout(tempToast);
  const previo = $('#toast'); if (previo) previo.remove();
  const d = document.createElement('div');
  d.className = 'toast ' + (tipo || '');
  d.id = 'toast';
  d.innerHTML = ico(tipo === 'mal' ? 'error' : (tipo === 'ok' ? 'ok' : 'info'), 17) + '<span>' + esc(msg) + '</span>';
  document.body.appendChild(d);
  tempToast = setTimeout(() => d.remove(), 3600);
}

/* ------------------------------------------------------------
   IMPRESIÓN
   ------------------------------------------------------------ */
function fijarPapel(tam) {
  let st = document.getElementById('regla-papel');
  if (!st) { st = document.createElement('style'); st.id = 'regla-papel'; document.head.appendChild(st); }
  st.textContent = `@page { size: ${tam}; margin: 18mm 16mm 16mm; }`;
  try { localStorage.setItem(CLAVE + '_papel', tam); } catch (e) {}
  $$('[data-papel]').forEach(b => b.classList.toggle('activo', b.dataset.papel === tam));
}

function imprimir(todo) {
  const pie = () => {
    const p = $('#pie-impresion');
    if (p) p.textContent = 'Rehavid S.A.S. · App de modulación financiera · impreso el ' +
      new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' });
  };
  if (!todo) { document.body.classList.remove('imprimir-todo'); pie(); window.print(); return; }

  // Imprimir todo: se renderizan todas las secciones en el DOM
  const mod = estado.modulo, sec = estado.seccion;
  const todas = MODULOS.flatMap(m => m.secciones.map(s => s.id));
  $('#vista').innerHTML = todas.map(sid => {
    const fn = VISTAS[sid];
    return `<div class="panel" id="p-${sid}">${fn ? fn() : ''}</div>`;
  }).join('') + '<div class="pie-impresion" id="pie-impresion"></div>';
  document.body.classList.add('imprimir-todo');
  pie();
  window.print();
  setTimeout(() => {
    document.body.classList.remove('imprimir-todo');
    estado.modulo = mod; estado.seccion = sec; pintar();
  }, 400);
}
window.addEventListener('afterprint', () => document.body.classList.remove('imprimir-todo'));

/* ------------------------------------------------------------
   ARRANQUE
   ------------------------------------------------------------ */
function arrancar() {
  cargar();
  construirBarra();
  fijarPapel(localStorage.getItem(CLAVE + '_papel') || 'Letter');
  actualizarChip();

  const inicial = (location.hash || '').slice(1);
  const m = MODULOS.find(x => x.secciones.some(s => s.id === inicial));
  if (m) { estado.modulo = m.id; estado.seccion = inicial; }
  $$('#pestanas button').forEach(b => b.classList.toggle('activo', b.dataset.mod === estado.modulo));
  construirLateral();
  pintar();
}

function actualizarChip() {
  const n = estado.perfil.nombre.trim();
  const iniciales = n ? n.split(/\s+/).slice(0, 2).map(x => x[0].toUpperCase()).join('') : '··';
  $('#chip-usuario').innerHTML =
    `<span class="av">${iniciales}</span><span>${esc(n || 'Sin identificar')}</span>`;
}

document.addEventListener('DOMContentLoaded', arrancar);
