// Regresión de punta a punta: una sesión completa en modalidad presencial, con un facilitador y siete participantes
// (dos de ellos representan a la EPS), dos rondas, revisión, cierre, exportaciones, recargas y accesos.
// Uso: node tests/e2e.js   ·   Sale con código distinto de 0 si alguna comprobación falla o hay errores de consola.
const L = require('./lib');

/* ---------- Comprobaciones, en el orden en que se informan ---------- */
const NOMBRES = [
  '1 sesión creada',
  '2 siete participantes registrados (Ana→tra, Dani→ips, Beto→eps, Carla→eps, Eli→arl, Fer→jr, Gus→afp)',
  '2b participante ve rol, escenario, paso y acción esperada antes de iniciar',
  '3 ronda 1 en curso, paso A1',
  '4 Dani ve actividad «Decidir» con instrucciones y ejemplo',
  '4b guardar sin campos avisa qué falta',
  '5 Dani: registro guardado y confirmado',
  '5b Ana: actividad focal guardada + observación',
  '6 recarga del facilitador recupera la sesión sin PIN en la URL',
  '6b condiciones de avance cumplidas → botón avanzar',
  '7 avanzó a A2',
  '8 Carla: finalidad no autorizada comprobada por el sistema',
  '8b dos representantes de la EPS conservan respuestas independientes (Beto «pedir», Carla «reconocer»)',
  '8c Dani (custodio) recibe la solicitud de HC generada por el sistema',
  '9 rectificación: la respuesta anterior se conserva (2 versiones)',
  '10 avanzó a A3',
  '11 pasos terminados con excepciones justificadas',
  '11b sin evidencia obligatoria el cierre es «Pendiente de evidencia»',
  '12 valoración guardada y confirmada a la participante',
  '13 ronda 1 cerrada; se ofrece iniciar la ronda 2',
  '13b ronda 2 (propuesto) en A1',
  '14 participante ve la nueva ronda y su actividad',
  '15 acuse simulado registrado y marcado como simulado',
  '16 sesión en revisión tras cerrar las dos rondas',
  '16b cambiar de ronda no mezcla valoraciones',
  '17 desacuerdo EPS detectado',
  '18 riesgo sin mitigación y conflicto abierto → «Requiere ajustes»',
  '19 con mitigación y conflicto comprobado → «Listo para revisión del facilitador»',
  '19b no se puede cerrar sin decisión documentada',
  '20 decisión guardada habilita el cierre',
  '21 «Cerrado con decisión documentada»',
  '22 informe: participantes, rondas, desacuerdos, barreras, requisitos',
  '22b informe muestra fórmula de cada indicador y separa percepción de observación',
  '22c H1–H4 no renombradas; P1–P4 vinculadas a subpreguntas',
  '22d tabla de valoraciones = registros (12)',
  '23 JSON sin credenciales',
  '23b informe HTML con estilos y sin PIN',
  '23c CSV de valoraciones con 12 filas',
  '24 recarga de participante recupera su identidad y estado',
  '25 resultados abiertos con el código al estar cerrada',
  '26 PIN incorrecto rechazado',
  '27 participante 1024 sin desbordamiento',
  '27 participante 390 sin desbordamiento'
];

/* ---------- Datos del recorrido (los valores son los data-v de la herramienta) ---------- */
const PIN = '2468', NOMBRE = 'Sesión de regresión';
const GENTE = [['Ana', 'tra'], ['Dani', 'ips'], ['Beto', 'eps'], ['Carla', 'eps'], ['Eli', 'arl'], ['Fer', 'jr'], ['Gus', 'afp']];
const ACTOR = { tra: 'M.P. y su familia', ips: 'IPS / médicos', eps: 'EPS SURA', arl: 'ARL SURA', jr: 'Junta Regional', afp: 'AFP / Colpensiones' };
const CORTO = { tra: 'M.P.', ips: 'IPS', eps: 'EPS', arl: 'ARL', jr: 'Junta Regional', afp: 'AFP' };
const ACTOR_DE = {}; GENTE.forEach(([n, a]) => { ACTOR_DE[n] = a; });
const PASOS = ['A1', 'A2', 'A3', 'E1', 'E2', 'E3', 'E4', 'E5', 'D1', 'D2', 'D3'];
const RONDA = { R1: 'Ronda 1 · funcionamiento actual', R2: 'Ronda 2 · funcionamiento propuesto con el módulo' };
const ESCENARIO = 'Caso M.P. · controversia de origen · SURA como organización ancla';
const OBS_ANA = 'Nadie me dijo quién responde por el certificado ni en cuántos días';
const JUST = (ronda, paso) => `Excepción ${ronda} ${paso}: sin representante o sin actividad del actor requerido`;
const MITIGACION = 'Vista de estado para M.P.: deja de llevar documentos entre entidades';
const PROPUESTA = 'Mostrar en cada paso un responsable visible con plazo';
const COMO = 'Verificado en la ronda 2: M.P. declaró saber qué pasa y quién responde';
const QUIEN = 'Comité del Proyecto 2 · facilitadora de la sesión';
const EVIDENCIA = 'Dos rondas recorridas, doce valoraciones y un desacuerdo entre representantes de la EPS';
const CONDICIONES = 'Avanzar al prototipo del módulo con acuse verificable en cada notificación';
const REQUISITO = 'Toda notificación genera acuse verificable';
const COMPROBACION = 'Prueba con dos actores: cada notificación deja acuse con fecha y destinatario';
const BARRERA = 'No estaba claro quién responde';
// Valoraciones de los actores requeridos (tra, eps×2, arl, jr, afp): distintas en cada ronda para detectar mezclas.
const VAL = {
  R1: {
    Ana: { semaforo: 'ajustar', ajuste: 'Que me avisen cada cambio de etapa y quién responde', mejora: 'igual', P1: 'parcial', P1cual: 'Falta el empleador', P2: 'parcial', P2cual: 'No queda claro quién paga desde el día 181', P3: ['informacion', 'responsable'], P3cual: 'Nadie me dijo quién responde', P4: 'Vista de estado para la trabajadora con responsable y plazo' },
    Beto: { semaforo: 'rechazar', ajuste: 'El contrato actual no fija un plazo verificable para la EPS', mejora: 'igual', P1: 'si', P2: 'si', P3: ['responsable'], P3cual: 'No se sabe quién entrega la historia clínica', P4: 'Acuse verificable de cada notificación' },
    Carla: { semaforo: 'ajustar', ajuste: 'Aclarar qué finalidad ampara la consulta de certificados', mejora: 'igual', P1: 'si', P2: 'parcial', P2cual: 'La finalidad autorizada no es evidente', P3: ['permiso'], P3cual: 'Dudas sobre la finalidad', P4: 'Mostrar la finalidad autorizada antes de decidir' },
    Eli: { semaforo: 'aceptar', mejora: 'igual', P1: 'si', P2: 'si', P3: ['coordinacion'], P3cual: 'Oficios sin acuse entre EPS y ARL', P4: 'Radicación con acuse ante la Junta' },
    Fer: { semaforo: 'aceptar', mejora: 'igual', P1: 'si', P2: 'si', P3: ['ninguna'], P4: 'Lista de chequeo del expediente antes de radicar' },
    Gus: { semaforo: 'aceptar', mejora: 'peor', P1: 'no', P1cual: 'Falta la historia laboral', P2: 'si', P3: ['informacion', 'responsable'], P3cual: 'La AFP se entera por M.P.', P4: 'Notificación del dictamen a la AFP con acuse' }
  },
  R2: {
    Ana: { semaforo: 'aceptar', mejora: 'mejor', P1: 'si', P2: 'si', P3: ['ninguna'], P4: 'Mantener la vista de estado con acuse' },
    Beto: { semaforo: 'aceptar', mejora: 'mejor', P1: 'si', P2: 'si', P3: ['ninguna'], P4: 'Registrar el acuse de cada destinatario' },
    Carla: { semaforo: 'ajustar', ajuste: 'Explicar por qué se deniega una pieza', mejora: 'mejor', P1: 'si', P2: 'si', P3: ['permiso'], P3cual: 'No es claro qué pieza puede consultar la EPS', P4: 'Mensaje claro al denegar una consulta' },
    Eli: { semaforo: 'aceptar', mejora: 'mejor', P1: 'si', P2: 'si', P3: ['ninguna'], P4: 'Traza de consultas visible para la ARL' },
    Fer: { semaforo: 'aceptar', mejora: 'igual', P1: 'si', P2: 'si', P3: ['ninguna'], P4: 'Lista de chequeo verificada por el módulo' },
    Gus: { semaforo: 'ajustar', ajuste: 'Definir quién notifica el pago desde el día 181', mejora: 'mejor', P1: 'si', P2: 'parcial', P2cual: 'Competencia entre AFP y ARL', P3: ['responsable'], P3cual: 'Quién paga desde el día 181', P4: 'Decisión de pago con responsable y plazo' }
  }
};
const VALORAN = Object.keys(VAL.R1);
const FILA_VAL = (r, n) => [r, ACTOR[ACTOR_DE[n]], n, VAL[r][n].semaforo, VAL[r][n].mejora, VAL[r][n].ajuste || ''].join('|');
const FILAS_VAL = ['R1', 'R2'].flatMap(r => VALORAN.map(n => FILA_VAL(r, n))).sort();

/* ---------- Utilidades ---------- */
const PIN_SUELTO = new RegExp('(^|[^0-9A-Za-z])' + PIN + '([^0-9A-Za-z]|$)'); // el PIN como dato, no dentro de una marca de tiempo o un identificador
const sinPin = t => !PIN_SUELTO.test(String(t));
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const rol = pg => pg.evaluate(() => document.body.getAttribute('data-rol'));
const aviso = pg => pg.evaluate(() => { const m = document.querySelector('#top .msg'); return { msg: m ? m.textContent.replace(/\s+/g, ' ').trim() : '', err: !!(m && m.classList.contains('err')) }; });
// Lo que ve un participante: identidad, llamadas de la barra lateral, título, estado y respuestas guardadas.
const ficha = pg => pg.evaluate(() => {
  const n = s => (s || '').replace(/\s+/g, ' ').trim(), t = s => { const e = document.querySelector(s); return e ? n(e.textContent) : ''; };
  const llamadas = {}; document.querySelectorAll('.pside .callout').forEach(c => { const b = c.querySelector('b'), k = b ? n(b.textContent) : ''; llamadas[k] = n(n(c.textContent).slice(k.length)); });
  const kv = {}, dk = document.querySelector('.done-kv'); if (dk) { const h = [...dk.children]; for (let i = 0; i + 1 < h.length; i += 2) kv[n(h[i].textContent)] = n(h[i + 1].textContent); }
  const m = document.querySelector('#top .msg');
  return { rol: document.body.getAttribute('data-rol'), nombreTop: t('#appright .who b'), actorTop: t('#appright .who small'), actor: t('.pside-actor'), nombre: t('.pside-name'), llamadas, titulo: t('.pmain h2.h1'), chip: t('.pmain .head-right .chip'), panel: t('.pmain .qpanel'), banda: t('.pmain .step-banner'), kv, comprobacion: t('.done-kv + p.mini'), listas: [...document.querySelectorAll('.pmain .actividad ul.lista li')].map(li => n(li.textContent)), msg: m ? n(m.textContent) : '', msgErr: !!(m && m.classList.contains('err')), top: t('#top'), hayGuardar: !!document.querySelector('[data-act="guardar"]'), hayValorar: !!document.querySelector('[data-act="guardar-val"]'), marcados: document.querySelectorAll('.actividad [aria-pressed="true"]').length, escritos: [...document.querySelectorAll('.actividad input[type="text"], .actividad input[type="number"]')].filter(i => i.value).length };
});
// Tabla del informe por su identificador, o cualquier tabla de la vista por su cabecera.
const tabla = (pg, id) => pg.evaluate(id => { const n = s => s.replace(/\s+/g, ' ').trim(), t = document.querySelector('table[data-tabla="' + id + '"]'); if (!t) return { cab: [], filas: [] }; return { cab: [...t.querySelectorAll('thead th')].map(x => n(x.textContent)), filas: [...t.querySelectorAll('tbody tr')].filter(tr => !(tr.children.length === 1 && tr.children[0].colSpan > 1)).map(tr => [...tr.children].map(td => n(td.textContent))) }; }, id);
const tablaCab = (pg, cab) => pg.evaluate(cab => { const n = s => s.replace(/\s+/g, ' ').trim(), t = [...document.querySelectorAll('#vista table')].filter(x => [...x.querySelectorAll('thead th')].map(th => n(th.textContent)).join('|') === cab.join('|'))[0]; return t ? [...t.querySelectorAll('tbody tr')].map(tr => [...tr.children].map(td => n(td.textContent))) : []; }, cab);
// Seguimiento por participante del facilitador (Ejecutar).
const monitor = pg => pg.evaluate(() => { const n = s => s.replace(/\s+/g, ' ').trim(), o = {}; document.querySelectorAll('table.monitor tbody tr').forEach(tr => { const c = [...tr.children]; o[n((c[0].querySelector('b') || c[0]).textContent)] = { actividad: n(c[3].textContent), coloco: n(c[4].textContent), problemas: [...c[5].querySelectorAll('.chip')].map(x => n(x.textContent)), rect: [...c[2].querySelectorAll('.ms.rect')].map(x => n(x.textContent)) }; }); return o; });
// Panel de cierre del facilitador (Cerrar).
const cierre = pg => pg.evaluate(() => {
  const n = s => (s || '').replace(/\s+/g, ' ').trim(), e = document.querySelector('.estado-cierre'), listas = {};
  document.querySelectorAll('.closing .lbl').forEach(l => { const ul = l.nextElementSibling; listas[n(l.textContent)] = ul ? [...ul.querySelectorAll('li')].map(li => n(li.textContent)) : []; });
  const g = document.querySelector('[data-act="d-guardar"]'), m = document.querySelector('#top .msg');
  return { estado: e ? n(e.textContent) : '', cls: e ? n(e.className.replace('estado-cierre', '')) : '', faltas: listas['Evidencia pendiente'] || [], ajustes: listas['Ajustes requeridos'] || [], boton: !!document.querySelector('[data-act="cerrar-sesion"]'), desc: n((document.querySelector('.closing-desc') || {}).textContent), nota: g ? n(g.parentElement.textContent) : '', msg: m ? n(m.textContent) : '', msgErr: !!(m && m.classList.contains('err')) };
});
const progreso = pg => pg.evaluate(() => { const o = {}; document.querySelectorAll('#vista .progress .pstep').forEach(s => { o[s.textContent.trim()] = s.className.replace('pstep', '').trim(); }); return o; });
// Primeras líneas de un error de Playwright (qué se esperaba y sobre qué selector), sin códigos de color.
const resumir = err => String((err && err.message) || err).replace(/\u001b\[\d+m/g, '').split('\n').map(x => x.trim()).filter(x => x && x !== 'Call log:').slice(0, 2).join(' ');
const leerCsv = t => t.replace(/^﻿/, '').split('\r\n').map(l => { const out = [], re = /"((?:[^"]|"")*)"(;|$)/g; let m; while ((m = re.exec(l))) { out.push(m[1].replace(/""/g, '"')); if (!m[2]) break; } return out; });

(async () => {
  const t0 = Date.now(); const { srv, url } = await L.serve(); const b = await L.launch(); const ctx = await L.contexto(b); const errs = []; const { T, fin } = L.informe();
  let hechas = 0, code = null, etapa = 'preparación de la prueba'; const latido = { veces: 0, ms: 0 };
  // Cada comprobación recibe sus condiciones con nombre: pasa si todas se cumplen; si no, dice cuáles fallan y guarda una captura.
  const C = async (nombre, partes, info, pg) => {
    if (NOMBRES[hechas] !== nombre) throw new Error(`orden de comprobaciones alterado: tocaba «${NOMBRES[hechas]}» y llegó «${nombre}»`);
    hechas++; const mal = Object.keys(partes).filter(k => !partes[k]);
    T(nombre, !mal.length, [mal.length ? 'no se cumple: ' + mal.join(' | ') : '', info || ''].filter(Boolean).join(' · '));
    if (mal.length && pg) await pg.screenshot({ path: L.path.join(L.SALIDA, 'e2e-fallo-' + nombre.replace(/^(\S+) participante (\d+).*$/, '$1-$2').split(' ')[0] + '.png'), fullPage: true }).catch(() => {});
  };
  const cerrarTodo = async motivo => {
    if (motivo) console.log('ERR ' + motivo);
    while (hechas < NOMBRES.length) T(NOMBRES[hechas++], false, 'no se ejecutó: la suite se interrumpió antes');
    console.log(`Duración: ${Math.round((Date.now() - t0) / 1000)} s · ${NOMBRES.length} comprobaciones · esperas para no coincidir con un latido: ${latido.veces} (${(latido.ms / 1000).toFixed(1)} s)`);
    const rc = fin(errs); await b.close().catch(() => {}); srv.close(); process.exit(rc || (motivo ? 1 : 0));
  };
  try {
    // Toda acción que escribe espera primero a que no haya un latido inminente (ver calma en lib.js).
    const calma = async (pg, ventana) => { const ms = await L.calma(pg, code, ventana); if (ms) { latido.veces++; latido.ms += ms; } };
    const clic = async (pg, sel, ventana) => { await calma(pg, ventana); await L.click(pg, sel); };
    const donde = x => `${x.ses.rondaActual} · ${x.ses.pasoActual} · ${x.ses.estado}`;
    const E = () => L.estado(F, code);
    const hasta = (cond, ms) => L.esperar(async () => { const e = await E(); return e.ses && cond(e) ? e : null; }, ms);
    // Tras la acción de un participante, espera a que la pestaña del facilitador tenga ya todos los registros que produjo.
    const asentado = async cond => { let x = await hasta(cond) || await E(); for (let i = 0; i < 20; i++) { await L.w(150); const y = await E(); if (y.regs.length === x.regs.length) return y; x = y; } return x; };
    const pestana = async cual => { await clic(F, `[data-act="fsub"][data-arg="${cual}"]`); };
    const recargar = async pg => { await calma(pg, 2500); await pg.reload({ waitUntil: 'domcontentloaded' }); await L.w(500); };
    // Formularios de actividad y de valoración, tal como los llena una persona.
    const decidir = async (pg, d) => {
      await clic(pg, `[data-act="f"][data-arg="suficiencia"][data-v="${d.suficiencia}"]`);
      for (const k of d.falta || []) await L.marcar(pg, `input[data-in="f-falta"][data-arg="${k}"]`);
      await pg.selectOption('select[data-in="f-finalidad"]', d.finalidad);
      await clic(pg, `[data-act="f"][data-arg="decision"][data-v="${d.decision}"]`);
      await pg.selectOption('select[data-in="f-responde"]', d.responde);
      for (const a of d.notifica || []) await L.marcar(pg, `input[data-in="f-notifica"][data-arg="${a}"]`);
      await pg.fill('input[data-in="f-dias"]', String(d.dias));
      await clic(pg, '[data-act="guardar"]');
    };
    const vivencia = async (pg, d) => {
      await clic(pg, `[data-act="f"][data-arg="sabe"][data-v="${d.sabe}"]`);
      await pg.selectOption('select[data-in="f-responde"]', d.responde);
      for (const h of d.hizo) await clic(pg, `[data-act="fm"][data-arg="hizo"][data-v="${h}"]`);
      if (d.obs) await pg.fill('input[data-in="f-obs"]', d.obs);
      await clic(pg, '[data-act="guardar"]');
    };
    const valorar = async (pg, v, sinAjuste) => {
      await clic(pg, `[data-act="v"][data-arg="semaforo"][data-v="${v.semaforo}"]`);
      if (v.ajuste && !sinAjuste) await pg.fill('input[data-in="v-ajuste"]', v.ajuste);
      await clic(pg, `[data-act="v"][data-arg="mejora"][data-v="${v.mejora}"]`);
      for (const q of ['P1', 'P2']) { await clic(pg, `[data-act="v"][data-arg="${q}"][data-v="${v[q]}"]`); if (v[q + 'cual']) await pg.fill(`input[data-in="v-p"][data-arg="${q}cual"]`, v[q + 'cual']); }
      for (const k of v.P3) await clic(pg, `[data-act="vm"][data-arg="P3"][data-v="${k}"]`);
      if (v.P3cual) await pg.fill('input[data-in="v-p"][data-arg="P3cual"]', v.P3cual);
      await pg.fill('input[data-in="v-p"][data-arg="P4"]', v.P4);
      await clic(pg, '[data-act="guardar-val"]');
    };
    const valoraronTodos = ronda => hasta(e => VALORAN.every(n => e.vigentes.some(r => r.ronda === ronda && r.tipo === 'preguntas' && r.participanteNombre === n)));
    // Avance con excepción: la justificación es obligatoria y queda guardada en el paso.
    const conExcepcion = async (ronda, paso) => {
      const ofrecido = await L.ve(F, () => !!document.querySelector('[data-act="avanzar-exc"]') && !document.querySelector('[data-act="avanzar"]'));
      await F.fill('input[data-in="f-just"]', JUST(ronda, paso)); await clic(F, '[data-act="avanzar-exc"]');
      const i = PASOS.indexOf(paso);
      return ofrecido && !!(await hasta(e => { const rd = e.ses.rondas[ronda] || {}, ps = (rd.pasos || {})[paso] || {}; return ps.estado === 'completado' && (i === PASOS.length - 1 ? rd.estado === 'valoracion' : e.ses.pasoActual === PASOS[i + 1]); }));
    };
    // Desbordamiento horizontal de una vista de participante a 1024 y 390 px.
    const medidas = [];
    const medir = async (pg, donde) => { for (const ancho of [1024, 390]) { await pg.setViewportSize({ width: ancho, height: ancho === 390 ? 844 : 768 }); await L.w(350); const m = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })); medidas.push({ ancho, donde, sw: m.sw, cw: m.cw }); } await pg.setViewportSize({ width: 1440, height: 900 }); await L.w(250); };

    /* ========== 1 · El facilitador crea la sesión ========== */
    etapa = 'crear la sesión';
    const creada = await L.crearSesion(ctx, url, errs, NOMBRE, PIN); const F = creada.F; code = creada.code;
    let e = await E(), top = await L.txt(F, '#top');
    await C('1 sesión creada', {
      'el código tiene cuatro caracteres del alfabeto de la herramienta': /^[A-HJKMNP-Z2-9]{4}$/.test(code || ''),
      'queda dentro como facilitador': (await rol(F)) === 'facilitador' && /^Facilitador/.test(top),
      'el código se muestra en Preparar para compartirlo': (await L.txt(F, '.code-big')) === code,
      'la sesión se guardó en preparación, ronda R1 y paso A1': !!e.ses && e.ses.codigo === code && e.ses.nombre === NOMBRE && e.ses.estado === 'preparacion' && e.ses.rondaActual === 'R1' && e.ses.pasoActual === 'A1',
      'modalidad presencial indicada': !!e.ses && e.ses.modalidad === 'presencial' && /modalidad presencial/.test(top),
      'el PIN no se guarda en claro': !!e.ses && typeof e.ses.pinHash === 'string' && e.ses.pinHash.length > 1 && e.ses.pinHash !== PIN && sinPin(JSON.stringify(e.ses))
    }, 'código ' + code, F);
    const huella = (e.ses || {}).pinHash || '\u0000';

    /* ========== 2 · Entran siete participantes, cada uno en su pestaña ========== */
    etapa = 'entrada de los participantes';
    await calma(F, 2500); const P = await L.unirVarios(ctx, url, errs, code, GENTE);
    const ana = P.Ana, dani = P.Dani, beto = P.Beto, carla = P.Carla;
    await L.ve(F, () => document.querySelectorAll('#vista table.t tbody tr').length === 7);
    e = await E(); const prep = await F.$$eval('#vista table.t tbody tr', trs => trs.map(tr => [...tr.children].map(td => td.textContent.replace(/\s+/g, ' ').trim())));
    const fichas = {}; for (const [n] of GENTE) fichas[n] = await ficha(P[n]);
    await C(NOMBRES[1], {
      'siete participantes guardados, cada uno con su actor': e.parts.length === 7 && GENTE.every(([n, a]) => e.parts.filter(p => p.nombre === n && p.actor === a).length === 1),
      'el facilitador los ve en Preparar con su actor': prep.length === 7 && GENTE.every(([n, a]) => prep.some(f => f[0] === n && f[1] === ACTOR[a])),
      'cada pestaña conserva su propia identidad': GENTE.every(([n, a]) => fichas[n].rol === 'participante' && fichas[n].nombreTop === n && fichas[n].actorTop === ACTOR[a]),
      'las dos personas de la EPS son participantes distintos': e.parts.filter(p => p.actor === 'eps').map(p => p.id).filter((x, i, v) => v.indexOf(x) === i).length === 2
    }, prep.map(f => f[0] + '→' + f[1]).join(', '), F);

    await C('2b participante ve rol, escenario, paso y acción esperada antes de iniciar', {
      'rol: actor y nombre': fichas.Ana.actor === ACTOR.tra && fichas.Ana.nombre === 'Ana · ' + ACTOR.tra && fichas.Dani.actor === ACTOR.ips,
      'escenario': fichas.Ana.llamadas['Escenario'] === ESCENARIO && fichas.Dani.llamadas['Escenario'] === ESCENARIO,
      'ronda y paso actual': [RONDA.R1, 'A1 · Inicio de la incapacidad'].every(x => (fichas.Ana.llamadas['Ronda y paso actual'] || '').includes(x)),
      'acción esperada, distinta según el actor': fichas.Ana.llamadas['Acción esperada'] === 'Cómo vive M.P. este paso' && fichas.Dani.llamadas['Acción esperada'] === 'Decidir en este paso',
      'todavía no hay actividad que responder': fichas.Ana.titulo === 'En preparación' && /todavía no inició la sesión/.test(fichas.Ana.panel) && !fichas.Ana.hayGuardar && !fichas.Dani.hayGuardar
    }, 'Ana: ' + fichas.Ana.llamadas['Acción esperada'] + ' · Dani: ' + fichas.Dani.llamadas['Acción esperada'], ana);

    /* ========== 3 · Inicia la ronda 1 ========== */
    etapa = 'inicio de la ronda 1';
    await clic(F, '[data-act="iniciar"]');
    e = await hasta(x => x.ses.estado === 'en_curso') || await E(); top = await L.txt(F, '#top');
    const r1 = (e.ses.rondas || {}).R1 || {};
    await C('3 ronda 1 en curso, paso A1', {
      'sesión en curso en la ronda R1 y el paso A1': e.ses.estado === 'en_curso' && e.ses.rondaActual === 'R1' && e.ses.pasoActual === 'A1',
      'la ronda 1 y su primer paso quedan en curso': r1.estado === 'en_curso' && ((r1.pasos || {}).A1 || {}).estado === 'en_curso',
      'el inicio queda registrado como intervención del facilitador': e.regs.some(r => r.tipo === 'inicio_ronda' && r.origen === 'facilitador' && r.ronda === 'R1' && r.modo === 'actual'),
      'la barra muestra ronda, paso y estado': ['En curso', RONDA.R1, 'Paso A1 · Inicio de la incapacidad'].every(x => top.includes(x)),
      'el facilitador pasa a «Ejecutar»': (await F.getAttribute('[data-act="fsub"][aria-selected="true"]', 'data-arg')) === 'ejecutar' && (await progreso(F)).A1 === 'actual'
    }, donde(e), F);
    // Con la sesión en curso, alguien que solo tiene el código intenta ver los resultados (se usa en la comprobación 25).
    const V = await L.pagina(ctx, url, errs); await V.fill('input[data-in="e-code2"]', code); await L.click(V, '[data-act="entrar-res"]');
    const resAntes = Object.assign({ rol: await rol(V) }, await aviso(V));

    /* ========== 4 · Paso A1: decide la IPS (Dani) y M.P. (Ana) cuenta su vivencia ========== */
    etapa = 'ronda 1 · paso A1';
    await L.ve(dani, () => !!document.querySelector('[data-act="guardar"]'));
    let f = await ficha(dani);
    const form = await dani.evaluate(() => { const n = s => s.replace(/\s+/g, ' ').trim(), q = document.querySelector('.actividad .qpanel'), ej = q ? q.querySelector('p.mini') : null; return { instr: q ? n(q.textContent.replace(ej ? ej.textContent : '', '')) : '', ejemplo: ej ? n(ej.textContent) : '', leyendas: [...document.querySelectorAll('.actividad fieldset legend')].map(l => n(l.textContent)), opciones: [...document.querySelectorAll('.actividad [data-act="f"][data-arg="decision"]')].map(x => n(x.textContent)) }; });
    await C('4 Dani ve actividad «Decidir» con instrucciones y ejemplo', {
      'la actividad es «Decidir en este paso» y está en curso': f.titulo === 'Decidir en este paso' && f.chip === 'En curso',
      'instrucciones: qué revisar, declarar y decidir': ['Revise la información disponible', 'finalidad', 'quién responde y en cuántos días'].every(x => form.instr.includes(x)),
      'ejemplo breve con la finalidad de su actor': /^Ejemplo: /.test(form.ejemplo) && form.ejemplo.includes('«Plan de rehabilitación»'),
      'cuatro preguntas numeradas y la observación': ['1. ', '2. ', '3. ', '4. '].every((x, i) => (form.leyendas[i] || '').indexOf(x) === 0) && /Observación/.test(form.leyendas[4] || ''),
      'las opciones de decisión son las del paso A1': igual(form.opciones, ['Expedir la incapacidad y entregar el certificado', 'Remitir a especialista antes de expedir'])
    }, form.ejemplo, dani);

    await clic(dani, '[data-act="guardar"]'); const vacio = await aviso(dani);
    await clic(dani, '[data-act="f"][data-arg="suficiencia"][data-v="suficiente"]'); await clic(dani, '[data-act="f"][data-arg="decision"][data-v="expedir"]'); await clic(dani, '[data-act="guardar"]');
    const parcial = await aviso(dani); f = await ficha(dani); e = await E();
    await C('4b guardar sin campos avisa qué falta', {
      'aviso de error que nombra los cinco campos': vacio.err && /^Falta completar: /.test(vacio.msg) && ['suficiencia', 'finalidad', 'decisión', 'quién responde', 'días'].every(x => vacio.msg.includes(x)),
      'al completar dos campos, el aviso nombra solo los tres que faltan': parcial.err && ['finalidad', 'quién responde', 'días'].every(x => parcial.msg.includes(x)) && !/suficiencia|decisión/.test(parcial.msg),
      'no se guardó ningún registro': e.regs.filter(r => r.tipo === 'actividad').length === 0,
      'sigue en el formulario con lo ya marcado': f.hayGuardar && f.titulo === 'Decidir en este paso' && f.marcados === 2
    }, vacio.msg, dani);

    await dani.selectOption('select[data-in="f-finalidad"]', 'rehabilitacion'); await dani.selectOption('select[data-in="f-responde"]', 'yo'); await dani.fill('input[data-in="f-dias"]', '1'); await clic(dani, '[data-act="guardar"]');
    f = await ficha(dani); e = await asentado(x => x.regs.some(r => r.tipo === 'actividad' && r.participanteNombre === 'Dani'));
    let reg = e.vigentes.filter(r => r.tipo === 'actividad' && r.participanteNombre === 'Dani')[0] || { payload: {} };
    await C('5 Dani: registro guardado y confirmado', {
      'aviso de guardado con el identificador del registro': !f.msgErr && (f.msg.match(/^Guardado: registro (\w+) a las /) || [])[1] === reg.id && !!reg.id,
      'la pantalla pasa a «Actividad completada»': f.titulo === 'Actividad completada' && f.chip === 'Completada' && /Registro guardado a las/.test(f.panel) && !f.hayGuardar,
      'muestra lo que respondió': f.kv['Suficiencia'] === 'suficiente' && f.kv['Finalidad'] === 'Plan de rehabilitación' && f.kv['Decisión'] === 'expedir' && f.kv['Responde'] === 'Yo' && f.kv['Días'] === '1',
      'el registro identifica sesión, ronda, modo, paso, participante y actor': reg.sesion === code && reg.ronda === 'R1' && reg.modo === 'actual' && reg.paso === 'A1' && reg.actor === 'ips' && reg.origen === 'participante' && reg.version === 1 && reg.reemplaza === null,
      'el registro guarda la decisión': reg.payload.tipo === 'decide' && reg.payload.suficiencia === 'suficiente' && reg.payload.finalidad === 'rehabilitacion' && reg.payload.decision === 'expedir' && reg.payload.responde === 'yo' && reg.payload.dias === 1,
      'la finalidad se comprobó y está autorizada': !!reg.payload.comprobacion && reg.payload.comprobacion.finalidadAutorizada === true && /finalidad autorizada/.test(f.comprobacion)
    }, f.msg, dani);
    // Con solo la IPS completada, el facilitador todavía no puede avanzar (se usa en la comprobación 6b).
    await L.esperar(async () => (await tablaCab(F, ['Actor', 'Participante', 'Actividad', 'Estado'])).some(x => x[1] === 'Dani' && x[3] === 'Completada'));
    const antesAvance = await F.evaluate(() => ({ avanzar: !!document.querySelector('[data-act="avanzar"]'), exc: !!document.querySelector('[data-act="avanzar-exc"]'), texto: document.querySelector('#vista').textContent.replace(/\s+/g, ' ') }));

    await vivencia(ana, { sabe: 'parcial', responde: 'nadie', hizo: ['llevar', 'ventanilla'], obs: OBS_ANA });
    f = await ficha(ana); e = await asentado(x => x.regs.some(r => r.tipo === 'observacion' && r.participanteNombre === 'Ana'));
    reg = e.vigentes.filter(r => r.tipo === 'actividad' && r.participanteNombre === 'Ana')[0] || { payload: {} };
    const obsAna = e.vigentes.filter(r => r.tipo === 'observacion' && r.participanteNombre === 'Ana')[0] || { payload: {} };
    await C('5b Ana: actividad focal guardada + observación', {
      'aviso de guardado y pantalla «Actividad completada»': !f.msgErr && /^Guardado: registro /.test(f.msg) && f.titulo === 'Actividad completada',
      'muestra su vivencia': f.kv['Qué sabe'] === 'parcial' && f.kv['Responde'] === 'Nadie claramente' && f.kv['Qué tuvo que hacer'] === 'llevar, ventanilla' && f.kv['Observación'] === OBS_ANA,
      'registro focal de M.P. en R1 · A1': reg.actor === 'tra' && reg.ronda === 'R1' && reg.paso === 'A1' && reg.payload.tipo === 'focal' && reg.payload.sabe === 'parcial' && reg.payload.responde === 'nadie' && igual(reg.payload.hizo, ['llevar', 'ventanilla']),
      'la observación queda como registro propio, ligado a la actividad': obsAna.actor === 'tra' && obsAna.paso === 'A1' && obsAna.payload.texto === OBS_ANA && obsAna.payload.origenActividad === reg.id && !!reg.id,
      'no altera el registro de Dani': e.vigentes.filter(r => r.tipo === 'actividad' && r.paso === 'A1').length === 2
    }, f.msg, ana);

    /* ========== 6 · El facilitador recarga la página ========== */
    etapa = 'recarga del facilitador y avance a A2';
    const uAntes = new URL(F.url());
    await F.reload({ waitUntil: 'domcontentloaded' }); await L.ve(F, () => !!document.querySelector('table.monitor')); await L.w(300);
    top = await L.txt(F, '#top'); let mon = await monitor(F); const u = new URL(F.url());
    await C('6 recarga del facilitador recupera la sesión sin PIN en la URL', {
      'sigue como facilitador sin volver a pedir el PIN': (await rol(F)) === 'facilitador' && /^Facilitador/.test(top) && !(await F.$('input[data-in="e-pin"]')),
      'la URL que se recarga solo lleva el código de la sesión': uAntes.hash === '#s=' + code && uAntes.search === '',
      'tras recargar, la URL sigue llevando solo el código': u.hash === '#s=' + code && u.search === '',
      'ni el PIN ni su huella están en la URL, antes o después': [uAntes, u].every(x => sinPin(x.pathname + x.search + x.hash) && !x.href.includes(huella)),
      'recupera ronda, paso y estado': ['código ' + code, 'En curso', RONDA.R1, 'Paso A1'].every(x => top.includes(x)),
      'recupera lo que registraron los participantes': /expedir/.test((mon.Dani || {}).coloco || '') && /sabe: parcial/.test((mon.Ana || {}).coloco || '') && Object.keys(mon).length === 7
    }, u.pathname + u.hash, F);

    const ahoraAvance = await F.evaluate(() => { const n = s => s.replace(/\s+/g, ' ').trim(), x = document.querySelector('[data-act="avanzar"]'), g = document.querySelector('.guia'); return { avanzar: x ? n(x.textContent) : '', exc: !!document.querySelector('[data-act="avanzar-exc"]'), guia: g ? n(g.textContent) : '' }; });
    await C('6b condiciones de avance cumplidas → botón avanzar', {
      'con solo la IPS completada no se ofrecía avanzar y se decía por qué': !antesAvance.avanzar && antesAvance.exc && /Condiciones sin cumplir: actividad de M\.P\. y su familia sin completar/.test(antesAvance.texto),
      'con M.P. y la IPS completadas aparece «Avanzar al paso A2»': ahoraAvance.avanzar === 'Avanzar al paso A2',
      'ya no se pide una excepción': !ahoraAvance.exc,
      'la guía del facilitador lo indica': /puede avanzar al siguiente paso/.test(ahoraAvance.guia)
    }, ahoraAvance.avanzar, F);

    await clic(F, '[data-act="avanzar"]');
    e = await hasta(x => x.ses.pasoActual === 'A2') || await E(); top = await L.txt(F, '#top');
    let rd = e.ses.rondas.R1, av = e.regs.filter(r => r.tipo === 'avance')[0] || { payload: {} };
    await C('7 avanzó a A2', {
      'el paso actual es A2 y está en curso': e.ses.pasoActual === 'A2' && (rd.pasos.A2 || {}).estado === 'en_curso',
      'A1 queda completado, sin excepción': (rd.pasos.A1 || {}).estado === 'completado' && !rd.pasos.A1.excepcion,
      'el avance queda registrado con las condiciones cumplidas': av.origen === 'facilitador' && av.payload.de === 'A1' && av.payload.a === 'A2' && av.payload.excepcion === null && (av.payload.condiciones || []).length === 2 && av.payload.condiciones.every(c => c.ok),
      'el facilitador ve el paso A2': top.includes('Paso A2 · Certificados y prórrogas'),
      'los participantes ven el paso A2 sin recargar': await L.ve(ana, () => /A2/.test((document.querySelector('.pmain .step-banner') || {}).textContent || '') && !!document.querySelector('[data-act="guardar"]'))
    }, donde(e), F);

    /* ========== 8 · Paso A2: dos representantes de la EPS, una solicitud al custodio y una rectificación ========== */
    etapa = 'ronda 1 · paso A2';
    await L.ve(dani, () => /no le corresponde/.test((document.querySelector('.pmain h2.h1') || {}).textContent || ''));
    const daniAntes = await ficha(dani);
    await L.ve(beto, () => !!document.querySelector('[data-act="guardar"]'));
    await decidir(beto, { suficiencia: 'parcial', falta: ['hc'], finalidad: 'calificacion', decision: 'pedir', responde: 'yo', dias: 5 });
    await decidir(carla, { suficiencia: 'suficiente', finalidad: 'investigacion', decision: 'reconocer', responde: 'yo', dias: 3 });
    await vivencia(ana, { sabe: 'no', responde: 'eps', hizo: ['ventanilla'] });
    e = await asentado(x => x.vigentes.filter(r => r.tipo === 'actividad' && r.paso === 'A2').length === 3);
    await L.esperar(async () => { const m = await monitor(F); return /pedir/.test((m.Beto || {}).coloco || '') && /reconocer/.test((m.Carla || {}).coloco || ''); });
    const deA2 = n => e.vigentes.filter(r => r.tipo === 'actividad' && r.paso === 'A2' && r.ronda === 'R1' && r.participanteNombre === n)[0] || { payload: { comprobacion: {} } };
    const rBeto = deA2('Beto'), rCarla = deA2('Carla'), fBeto = await ficha(beto), fCarla = await ficha(carla); mon = await monitor(F);
    await C('8 Carla: finalidad no autorizada comprobada por el sistema', {
      'Carla declaró una finalidad que el escenario no autoriza a la EPS': rCarla.payload.finalidad === 'investigacion' && fCarla.kv['Finalidad'] === 'Investigación de origen y prestaciones',
      'el registro la marca como no autorizada': (rCarla.payload.comprobacion || {}).finalidadAutorizada === false,
      'Carla lo ve en su pantalla': /finalidad no autorizada para su actor/.test(fCarla.comprobacion),
      'la misma comprobación da por autorizada la finalidad de Beto': (rBeto.payload.comprobacion || {}).finalidadAutorizada === true && /finalidad autorizada/.test(fBeto.comprobacion),
      'el facilitador ve el problema en Carla y no en Beto': ((mon.Carla || {}).problemas || []).includes('finalidad no autorizada') && !((mon.Beto || {}).problemas || ['finalidad no autorizada']).includes('finalidad no autorizada')
    }, fCarla.comprobacion, carla);

    const actos = await tablaCab(F, ['Actor', 'Participante', 'Actividad', 'Estado']);
    await C('8b dos representantes de la EPS conservan respuestas independientes (Beto «pedir», Carla «reconocer»)', {
      'dos registros vigentes de la EPS en A2, uno por persona': !!rBeto.id && !!rCarla.id && rBeto.id !== rCarla.id && rBeto.participanteId !== rCarla.participanteId && rBeto.actor === 'eps' && rCarla.actor === 'eps',
      'Beto conserva «pedir» y Carla «reconocer»': rBeto.payload.decision === 'pedir' && rCarla.payload.decision === 'reconocer',
      'ninguno reemplaza al otro': rBeto.reemplaza === null && rCarla.reemplaza === null,
      'cada pantalla muestra su propia respuesta': fBeto.kv['Decisión'] === 'pedir' && fBeto.kv['Días'] === '5' && fCarla.kv['Decisión'] === 'reconocer' && fCarla.kv['Días'] === '3',
      'el facilitador ve las dos por separado': ['Beto', 'Carla'].every(n => actos.some(x => x[1] === n && /^EPS SURA/.test(x[0]) && x[3] === 'Completada')) && /pedir/.test(mon.Beto.coloco) && /reconocer/.test(mon.Carla.coloco)
    }, 'Beto: ' + rBeto.payload.decision + ' · Carla: ' + rCarla.payload.decision, F);

    await L.ve(dani, () => /solicitud/.test((document.querySelector('.pmain h2.h1') || {}).textContent || ''));
    f = await ficha(dani); const sols = e.vigentes.filter(r => r.tipo === 'solicitud' && r.paso === 'A2'), sol = sols[0] || { payload: {} };
    await C('8c Dani (custodio) recibe la solicitud de HC generada por el sistema', {
      'antes de la solicitud, el paso no le correspondía': daniAntes.titulo === 'Este paso no le corresponde',
      'ahora su actividad es responder una solicitud de evidencia': f.titulo === 'Responder una solicitud de evidencia' && f.llamadas['Acción esperada'] === 'Responder una solicitud de evidencia',
      've quién pide, qué pieza y con qué finalidad': f.listas.length === 1 && /^EPS pide HC con finalidad «Calificación de origen en primera oportunidad»/.test(f.listas[0]),
      'la solicitud la generó el sistema y está marcada como simulada': sols.length === 1 && sol.origen === 'sistema' && sol.participanteId === null && sol.payload.simulado === true,
      'va de la EPS al custodio de la HC, por la pieza que Beto dijo que faltaba': sol.payload.de === 'eps' && sol.payload.a === 'ips' && igual(sol.payload.piezas, ['hc']) && sol.payload.origenActividad === rBeto.id
    }, f.listas[0], dani);

    const v1antes = JSON.stringify(rBeto), carlaAntes = JSON.stringify(rCarla);
    await clic(beto, '[data-act="rectificar"]'); const enRect = await beto.evaluate(() => ({ cancelar: !!document.querySelector('[data-act="cancelar-rect"]'), guardar: !!document.querySelector('[data-act="guardar"]') }));
    await decidir(beto, { suficiencia: 'parcial', falta: ['hc'], finalidad: 'calificacion', decision: 'pedir', responde: 'ips', dias: 8 });
    f = await ficha(beto); e = await asentado(x => x.regs.filter(r => r.tipo === 'actividad' && r.paso === 'A2' && r.participanteNombre === 'Beto').length === 2);
    await L.esperar(async () => (((await monitor(F)).Beto || {}).problemas || []).includes('rectificó su respuesta')); mon = await monitor(F);
    const vers = e.regs.filter(r => r.tipo === 'actividad' && r.paso === 'A2' && r.ronda === 'R1' && r.participanteNombre === 'Beto'), v1 = vers.filter(r => r.id === rBeto.id)[0] || {}, v2 = vers.filter(r => r.id !== rBeto.id)[0] || { payload: {} };
    await C('9 rectificación: la respuesta anterior se conserva (2 versiones)', {
      'al rectificar se abre el formulario, con opción de cancelar': enRect.cancelar && enRect.guardar,
      'el aviso dice que es una rectificación y que la anterior se conserva': !f.msgErr && /rectificación; la anterior queda en el historial/.test(f.msg),
      'quedan guardadas dos versiones de la respuesta de Beto': vers.length === 2,
      'la primera sigue intacta': JSON.stringify(v1) === v1antes && v1.version === 1,
      'la segunda la reemplaza sin borrarla': v2.version === 2 && v2.reemplaza === rBeto.id && v2.payload.dias === 8 && v2.payload.responde === 'ips' && v2.payload.decision === 'pedir',
      'la vigente es la rectificada': igual(e.vigentes.filter(r => r.tipo === 'actividad' && r.paso === 'A2' && r.participanteNombre === 'Beto').map(r => r.id), [v2.id]) && f.kv['Días'] === '8' && f.kv['Responde'] === ACTOR.ips,
      'el facilitador ve que Beto rectificó en A2': ((mon.Beto || {}).problemas || []).includes('rectificó su respuesta') && igual(mon.Beto.rect, ['A2']),
      'la respuesta de Carla no cambió': JSON.stringify(e.vigentes.filter(r => r.id === rCarla.id)[0]) === carlaAntes
    }, 'versiones: ' + vers.map(r => 'v' + r.version + ' (' + r.payload.dias + ' días, responde ' + r.payload.responde + ')').join(' → '), beto);

    await L.ve(F, () => !!document.querySelector('[data-act="avanzar"]'));
    await clic(F, '[data-act="avanzar"]');
    e = await hasta(x => x.ses.pasoActual === 'A3') || await E(); top = await L.txt(F, '#top'); rd = e.ses.rondas.R1; let pr = await progreso(F);
    await C('10 avanzó a A3', {
      'el paso actual es A3': e.ses.pasoActual === 'A3' && (rd.pasos.A3 || {}).estado === 'en_curso',
      'A2 queda completado sin excepción: M.P. y la EPS habían respondido': (rd.pasos.A2 || {}).estado === 'completado' && !rd.pasos.A2.excepcion,
      'el facilitador ve el paso A3': top.includes('Paso A3 · Evidencia laboral (APT)'),
      'la tira de progreso marca A1 y A2 completados y A3 actual': pr.A1 === 'completado' && pr.A2 === 'completado' && pr.A3 === 'actual' && pr.E1 === 'pendiente'
    }, donde(e), F);

    /* ========== 11 · De A3 a D3 con excepción justificada ========== */
    etapa = 'ronda 1 · avance con excepciones';
    await clic(F, '[data-act="avanzar-exc"]'); const sinJust = Object.assign({ paso: (await E()).ses.pasoActual }, await aviso(F));
    const avances = []; for (const p of PASOS.slice(2)) avances.push(await conExcepcion('R1', p));
    e = await E(); rd = e.ses.rondas.R1; pr = await progreso(F); av = e.regs.filter(r => r.tipo === 'avance' && r.ronda === 'R1');
    const finPasos = await F.evaluate(() => ({ texto: /Los pasos de esta ronda terminaron/.test(document.querySelector('#vista').textContent), cerrar: !!document.querySelector('[data-act="cerrar-ronda"]') }));
    await C('11 pasos terminados con excepciones justificadas', {
      'sin justificación no se avanza y se pide escribirla': sinJust.err && /Escriba la justificación de la excepción/.test(sinJust.msg) && sinJust.paso === 'A3',
      'los nueve pasos restantes avanzaron uno a uno con su excepción': avances.length === 9 && avances.every(Boolean),
      'los once pasos quedan completados y la ronda pasa a valoración': PASOS.every(p => (rd.pasos[p] || {}).estado === 'completado') && rd.estado === 'valoracion',
      'cada excepción guarda su justificación y quién la hizo': PASOS.slice(2).every(p => { const x = (rd.pasos[p] || {}).excepcion; return !!x && x.texto === JUST('R1', p) && x.quien === 'Facilitador' && x.t > 0; }),
      'A1 y A2 siguen sin excepción': !rd.pasos.A1.excepcion && !rd.pasos.A2.excepcion,
      'cada avance queda en el registro; nueve con excepción': av.length === 11 && av.filter(r => r.payload.excepcion).length === 9 && av.every(r => r.origen === 'facilitador') && av[av.length - 1].payload.a === 'valoracion',
      'la tira de progreso distingue completados (2) y con excepción (9)': PASOS.filter(p => pr[p] === 'completado').length === 2 && PASOS.filter(p => pr[p] === 'omitido').length === 9,
      'el facilitador ve el fin de los pasos y puede cerrar la ronda': finPasos.texto && finPasos.cerrar,
      'los participantes pasan a valorar': await L.ve(ana, () => !!document.querySelector('[data-act="guardar-val"]'))
    }, 'excepciones: ' + PASOS.filter(p => (rd.pasos[p] || {}).excepcion).join(', '), F);

    await pestana('cerrar'); let c = await cierre(F);
    await C('11b sin evidencia obligatoria el cierre es «Pendiente de evidencia»', {
      'estado «Pendiente de evidencia»': c.estado === 'Pendiente de evidencia' && c.cls === 'wait',
      'dice qué evidencia falta': c.faltas.includes('Ninguna ronda está cerrada.') && /Falta evidencia obligatoria/.test(c.desc),
      'no se ofrece cerrar la sesión': !c.boton
    }, c.estado + ': ' + c.faltas.join(' '), F);
    await pestana('ejecutar');

    /* ========== 12 · Valoración de la ronda 1 ========== */
    etapa = 'valoración y cierre de la ronda 1';
    await clic(ana, '[data-act="guardar-val"]'); const valVacia = await aviso(ana);
    await valorar(ana, VAL.R1.Ana); f = await ficha(ana);
    await valorar(beto, VAL.R1.Beto, true); const rechazoSinTexto = await aviso(beto);
    await beto.fill('input[data-in="v-ajuste"]', VAL.R1.Beto.ajuste); await clic(beto, '[data-act="guardar-val"]');
    for (const n of ['Carla', 'Eli', 'Fer', 'Gus']) await valorar(P[n], VAL.R1[n]);
    e = await valoraronTodos('R1') || await E();
    reg = e.vigentes.filter(r => r.tipo === 'valoracion' && r.ronda === 'R1' && r.participanteNombre === 'Ana')[0] || { payload: {} };
    const preg = e.vigentes.filter(r => r.tipo === 'preguntas' && r.ronda === 'R1' && r.participanteNombre === 'Ana')[0] || { payload: {} };
    await C('12 valoración guardada y confirmada a la participante', {
      'sin valorar el contrato no se guarda y se dice qué falta': valVacia.err && /Falta la valoración del contrato/.test(valVacia.msg),
      'aviso de guardado': !f.msgErr && f.msg === 'Valoración y preguntas guardadas.',
      'la pantalla confirma que quedó guardada': f.titulo === RONDA.R1 + ' cerrada para usted' && /quedaron guardadas/.test(f.panel) && !f.hayValorar,
      'valoración del contrato guardada en su ronda': reg.ronda === 'R1' && reg.actor === 'tra' && reg.payload.semaforo === 'ajustar' && reg.payload.ajuste === VAL.R1.Ana.ajuste && reg.payload.mejora === 'igual',
      'preguntas P1 a P4 guardadas': preg.payload.P1 === 'parcial' && preg.payload.P1cual === VAL.R1.Ana.P1cual && preg.payload.P2 === 'parcial' && igual(preg.payload.P3, VAL.R1.Ana.P3) && preg.payload.P3cual === VAL.R1.Ana.P3cual && preg.payload.P4 === VAL.R1.Ana.P4,
      'rechazar el contrato sin decir qué cambiaría no se acepta': rechazoSinTexto.err && /Si rechaza el contrato, escriba qué cambiaría/.test(rechazoSinTexto.msg),
      'valoraron los seis representantes de los actores requeridos': e.vigentes.filter(r => r.tipo === 'valoracion' && r.ronda === 'R1').length === 6
    }, f.titulo, ana);

    await L.ve(F, () => /Valoraciones recibidas: 6 · preguntas: 6/.test(document.querySelector('#vista').textContent));
    const antesCierre = (await L.txt(F, '#vista'));
    await clic(F, '[data-act="cerrar-ronda"]');
    e = await hasta(x => x.ses.rondas.R1.estado === 'cerrada') || await E();
    const ofrece = await F.evaluate(() => { const x = document.querySelector('[data-act="iniciar-ronda"]'); return { arg: x ? x.getAttribute('data-arg') : '', texto: x ? x.textContent.replace(/\s+/g, ' ').trim() : '', titulo: x ? x.getAttribute('title') : '', otros: ['avanzar', 'avanzar-exc', 'cerrar-ronda'].filter(a => document.querySelector('[data-act="' + a + '"]')) }; });
    reg = e.regs.filter(r => r.tipo === 'cierre_ronda' && r.payload.ronda === 'R1')[0] || { payload: {} };
    await C('13 ronda 1 cerrada; se ofrece iniciar la ronda 2', {
      'antes de cerrar constaban las seis valoraciones y ningún actor requerido pendiente': /Valoraciones recibidas: 6 · preguntas: 6\. Actores requeridos sin valoración: ninguno\./.test(antesCierre) && /5 de 5/.test(antesCierre),
      'la ronda 1 queda cerrada, con su fecha': e.ses.rondas.R1.estado === 'cerrada' && e.ses.rondas.R1.cerrada > 0,
      'la sesión sigue en curso: falta la ronda 2': e.ses.estado === 'en_curso' && e.ses.rondas.R2.estado === 'pendiente',
      'el cierre queda registrado con sus seis valoraciones': reg.origen === 'facilitador' && reg.payload.valoraciones === 6,
      'se ofrece «Iniciar la ronda 2»': ofrece.arg === 'R2' && ofrece.texto === 'Iniciar la ronda 2' && ofrece.titulo === RONDA.R2,
      'ya no se puede avanzar ni cerrar de nuevo': ofrece.otros.length === 0
    }, ofrece.texto, F);

    /* ========== 13b · Ronda 2: funcionamiento propuesto ========== */
    etapa = 'ronda 2';
    await clic(F, '[data-act="iniciar-ronda"]');
    e = await hasta(x => x.ses.rondaActual === 'R2') || await E(); top = await L.txt(F, '#top');
    await C('13b ronda 2 (propuesto) en A1', {
      'ronda actual R2, paso A1, en curso': e.ses.rondaActual === 'R2' && e.ses.pasoActual === 'A1' && e.ses.estado === 'en_curso' && e.ses.rondas.R2.estado === 'en_curso',
      'es la ronda del funcionamiento propuesto': top.includes(RONDA.R2) && e.regs.some(r => r.tipo === 'inicio_ronda' && r.ronda === 'R2' && r.modo === 'propuesto'),
      'la barra muestra el paso A1': top.includes('Paso A1 · Inicio de la incapacidad'),
      'el día virtual vuelve al del escenario': /Día virtual 120/.test(top),
      'la ronda 1 sigue cerrada': e.ses.rondas.R1.estado === 'cerrada'
    }, donde(e) + ' · modo propuesto', F);

    await L.ve(dani, () => !!document.querySelector('input[data-in="f-notifica"]')); await L.ve(ana, () => !!document.querySelector('[data-act="guardar"]'));
    f = await ficha(dani); const fAna2 = await ficha(ana);
    const form2 = await dani.evaluate(() => ({ notifica: [...document.querySelectorAll('input[data-in="f-notifica"]')].map(i => i.getAttribute('data-arg')), soporte: ((document.querySelector('.paso-card .lane-soporte') || {}).textContent || '').replace(/\s+/g, ' ').trim() }));
    await C('14 participante ve la nueva ronda y su actividad', {
      'sin recargar, Dani ve la ronda 2 y el paso A1': [RONDA.R2, 'A1 · Inicio de la incapacidad'].every(x => (f.llamadas['Ronda y paso actual'] || '').includes(x)),
      'su actividad vuelve a estar disponible': f.titulo === 'Decidir en este paso' && f.chip === 'En curso' && f.hayGuardar,
      'el formulario empieza vacío: no arrastra la ronda 1': f.marcados === 0 && f.escritos === 0,
      'en el funcionamiento propuesto puede notificar a otros actores': form2.notifica.includes('eps') && !form2.notifica.includes('ips'),
      'el recorrido muestra el módulo como soporte del paso': /Módulo/.test(form2.soporte),
      'M.P. también ve su actividad de la ronda 2': fAna2.titulo === 'Cómo vive M.P. este paso' && fAna2.hayGuardar && (fAna2.llamadas['Ronda y paso actual'] || '').includes(RONDA.R2)
    }, f.llamadas['Ronda y paso actual'], dani);
    await medir(dani, 'formulario de decisión');

    await decidir(dani, { suficiencia: 'suficiente', finalidad: 'rehabilitacion', decision: 'expedir', responde: 'yo', notifica: ['eps'], dias: 1 });
    f = await ficha(dani); e = await asentado(x => x.regs.some(r => r.tipo === 'acuse'));
    await L.ve(F, () => [...document.querySelectorAll('ul.feed li')].some(li => / acuse /.test(li.textContent)));
    const feed = await F.$$eval('ul.feed li', lis => lis.map(li => ({ texto: li.textContent.replace(/\s+/g, ' ').trim(), chips: [...li.querySelectorAll('.chip')].map(x => x.textContent.trim()) })));
    const acuses = e.vigentes.filter(r => r.tipo === 'acuse'), acuse = acuses[0] || { payload: {} }, notif2 = e.vigentes.filter(r => r.tipo === 'notificacion' && r.ronda === 'R2')[0] || { payload: {} };
    await C('15 acuse simulado registrado y marcado como simulado', {
      'la notificación de la ronda 2 va a la EPS y lleva acuse': notif2.origen === 'sistema' && notif2.payload.de === 'ips' && igual(notif2.payload.a, ['eps']) && notif2.payload.acuse === true,
      'el sistema registró el acuse de la EPS en R2 · A1': acuses.length === 1 && acuse.origen === 'sistema' && acuse.ronda === 'R2' && acuse.modo === 'propuesto' && acuse.paso === 'A1' && acuse.payload.de === 'eps' && acuse.payload.a === 'ips',
      'el acuse está marcado como simulado': acuse.payload.simulado === true && /simulado/.test(acuse.payload.nota || ''),
      'el facilitador lo ve con la etiqueta «simulado»': feed.some(x => / acuse /.test(x.texto) && x.chips.includes('sistema') && x.chips.includes('simulado')),
      'en la ronda 1 las notificaciones quedaron sin acuse': e.vigentes.filter(r => r.tipo === 'notificacion' && r.ronda === 'R1').length > 0 && e.vigentes.filter(r => r.tipo === 'notificacion' && r.ronda === 'R1').every(r => r.payload.acuse === false),
      'Dani ve a quién notificó': f.titulo === 'Actividad completada' && f.kv['Notifica a'] === 'EPS'
    }, (feed.filter(x => / acuse /.test(x.texto))[0] || {}).texto, F);
    // A mitad de la sesión, Dani recarga su pestaña (se usa en la comprobación 24).
    await recargar(dani); await L.ve(dani, () => !!document.querySelector('.done-kv')); const daniRecargado = await ficha(dani);

    await vivencia(ana, { sabe: 'si', responde: 'ips', hizo: ['nada'] });
    await L.ve(F, () => !!document.querySelector('[data-act="avanzar"]')); await clic(F, '[data-act="avanzar"]'); await hasta(x => x.ses.pasoActual === 'A2');
    const avances2 = []; for (const p of PASOS.slice(1)) avances2.push(await conExcepcion('R2', p));
    // Al abrirse la valoración de la ronda 2, el formulario de quien ya valoró la ronda 1 debe estar en blanco (comprobación 16b).
    await L.ve(ana, () => !!document.querySelector('[data-act="guardar-val"]')); const valNueva = await ficha(ana);
    await medir(ana, 'formulario de valoración');
    for (const n of VALORAN) await valorar(P[n], VAL.R2[n]);
    await valoraronTodos('R2'); await L.ve(F, () => /Valoraciones recibidas: 6 · preguntas: 6/.test(document.querySelector('#vista').textContent));
    await clic(F, '[data-act="cerrar-ronda"]');
    e = await hasta(x => x.ses.estado === 'revision') || await E(); top = await L.txt(F, '#top');
    reg = e.regs.filter(r => r.tipo === 'cierre_ronda' && r.payload.ronda === 'R2')[0] || { payload: {} };
    await C('16 sesión en revisión tras cerrar las dos rondas', {
      'la ronda 2 se recorrió entera: A1 con las condiciones cumplidas y diez pasos con excepción': avances2.length === 10 && avances2.every(Boolean) && !e.ses.rondas.R2.pasos.A1.excepcion && PASOS.every(p => (e.ses.rondas.R2.pasos[p] || {}).estado === 'completado'),
      'las dos rondas están cerradas': e.ses.rondas.R1.estado === 'cerrada' && e.ses.rondas.R2.estado === 'cerrada',
      'la sesión pasa a revisión': e.ses.estado === 'revision' && top.includes('En revisión'),
      'el cierre de la ronda 2 queda registrado con sus seis valoraciones': reg.payload.valoraciones === 6,
      'el facilitador queda en «Revisar»': (await F.getAttribute('[data-act="fsub"][aria-selected="true"]', 'data-arg')) === 'revisar' && /Revisar · faltantes/.test(await L.txt(F, '#vista'))
    }, `sesión ${e.ses.estado} · R1 ${e.ses.rondas.R1.estado} · R2 ${e.ses.rondas.R2.estado}`, F);

    const vals = e.vigentes.filter(r => r.tipo === 'valoracion'), pregs = e.vigentes.filter(r => r.tipo === 'preguntas');
    const deVal = (lista, r, n) => lista.filter(x => x.ronda === r && x.participanteNombre === n)[0] || { payload: {} };
    await C('16b cambiar de ronda no mezcla valoraciones', {
      'doce valoraciones vigentes: seis por ronda': vals.length === 12 && ['R1', 'R2'].every(r => vals.filter(x => x.ronda === r).length === 6),
      'ninguna valoración de la ronda 2 reemplazó a una de la ronda 1': e.regs.filter(r => r.tipo === 'valoracion' || r.tipo === 'preguntas').every(r => r.version === 1 && r.reemplaza === null),
      'cada valoración conserva lo respondido en su ronda': ['R1', 'R2'].every(r => VALORAN.every(n => { const p = deVal(vals, r, n).payload, v = VAL[r][n]; return p.semaforo === v.semaforo && p.mejora === v.mejora && p.ajuste === (v.ajuste || ''); })),
      'las respuestas a P1–P4 tampoco se mezclan': pregs.length === 12 && ['R1', 'R2'].every(r => VALORAN.every(n => { const p = deVal(pregs, r, n).payload, v = VAL[r][n]; return p.P1 === v.P1 && p.P2 === v.P2 && igual(p.P3, v.P3) && p.P4 === v.P4; })),
      'al abrirse la ronda 2, el formulario de quien ya había valorado estaba en blanco': /^Cierre de la ronda/.test(valNueva.titulo) && valNueva.hayValorar && valNueva.marcados === 0 && valNueva.escritos === 0 && /funcionamiento propuesto/.test(valNueva.panel)
    }, 'Ana R1: ' + deVal(vals, 'R1', 'Ana').payload.semaforo + '/' + deVal(vals, 'R1', 'Ana').payload.mejora + ' · Ana R2: ' + deVal(vals, 'R2', 'Ana').payload.semaforo + '/' + deVal(vals, 'R2', 'Ana').payload.mejora, F);

    /* ========== 17 · Revisar ========== */
    etapa = 'revisar';
    const partes = s => String(s || '').split(' · ').sort().join(' · ');
    let des = await tablaCab(F, ['Ronda', 'Actor', 'Paso', 'Tipo', 'Detalle']);
    const desAct = des.filter(x => x[0] === 'R1' && x[1] === ACTOR.eps && x[2] === 'A2' && x[3] === 'actividad')[0] || [];
    await C('17 desacuerdo EPS detectado', {
      'la tabla de desacuerdos muestra a la EPS en el paso A2 de la ronda 1': desAct.length === 5,
      'con lo que respondió cada representante': partes(desAct[4]) === 'Beto: pedir · Carla: reconocer',
      'también el desacuerdo al valorar el contrato': des.some(x => x[0] === 'R1' && x[1] === ACTOR.eps && x[3] === 'valoracion' && partes(x[4]) === 'Beto: rechazar · Carla: ajustar'),
      'solo hay desacuerdos de actores con más de un representante': des.length > 0 && des.every(x => x[1] === ACTOR.eps)
    }, desAct.join(' · '), F);

    const rev = async () => (await E()).ses.revision || { observaciones: {}, riesgos: {} };
    const revObs = async () => ((await rev()).observaciones || {})[obsAna.id] || {};
    const revRiesgo = async () => ((await rev()).riesgos || {}).carga || {};
    await calma(F); await L.marcar(F, 'input[data-in="riesgo-aplica"][data-arg="carga"]'); await L.esperar(async () => (await revRiesgo()).aplica === true);
    await calma(F); await F.selectOption(`select[data-in="rev-tipo"][data-arg="${obsAna.id}"]`, 'conflicto'); await L.esperar(async () => (await revObs()).tipo === 'conflicto');
    await pestana('cerrar'); const c18a = await cierre(F);
    // Se describe la mitigación y se propone una solución al conflicto, sin marcarlo como comprobado: proponer no es comprobar.
    await pestana('revisar');
    await calma(F, 2200); await F.fill('input[data-in="riesgo-mit"][data-arg="carga"]', MITIGACION); await L.esperar(async () => (await revRiesgo()).mitigacion === MITIGACION);
    await calma(F, 2200); await F.fill(`input[data-in="rev-prop"][data-arg="${obsAna.id}"]`, PROPUESTA); await L.esperar(async () => (await revObs()).propuesta === PROPUESTA);
    await pestana('cerrar'); const c18b = await cierre(F);
    const esRiesgo = x => /^Riesgo «Carga sobre el trabajador» marcado sin descripción de mitigación/.test(x), esConflicto = x => /^Conflicto de rol abierto \(M\.P\., A1\)/.test(x);
    await C('18 riesgo sin mitigación y conflicto abierto → «Requiere ajustes»', {
      'con el riesgo marcado y la observación clasificada como conflicto, el estado es «Requiere ajustes»': c18a.estado === 'Requiere ajustes' && c18a.cls === 'adj',
      'el riesgo sin mitigación figura entre los ajustes requeridos': c18a.ajustes.some(esRiesgo),
      'el conflicto de rol abierto figura entre los ajustes requeridos': c18a.ajustes.some(esConflicto),
      'descrita la mitigación, el conflicto solo propuesto (sin comprobar) mantiene «Requiere ajustes»': c18b.estado === 'Requiere ajustes' && c18b.ajustes.length === 1 && esConflicto(c18b.ajustes[0]),
      'mientras tanto no se ofrece cerrar la sesión': !c18a.boton && !c18b.boton
    }, `con riesgo y conflicto: «${c18a.estado}», ajustes [${c18a.ajustes.join(' / ')}] · con mitigación y conflicto sin comprobar: «${c18b.estado}», ajustes [${c18b.ajustes.join(' / ')}]`, F);

    await pestana('revisar');
    const persiste = await F.evaluate(id => ({ mit: (document.querySelector('input[data-in="riesgo-mit"][data-arg="carga"]') || {}).value, prop: (document.querySelector('input[data-in="rev-prop"][data-arg="' + id + '"]') || {}).value, tipo: (document.querySelector('select[data-in="rev-tipo"][data-arg="' + id + '"]') || {}).value }), obsAna.id);
    await calma(F); await L.marcar(F, `input[data-in="rev-comp"][data-arg="${obsAna.id}"]`); await L.esperar(async () => (await revObs()).comprobado === true);
    await L.ve(F, id => !!document.querySelector('input[data-in="rev-como"][data-arg="' + id + '"]'), obsAna.id);
    await calma(F, 2200); await F.fill(`input[data-in="rev-como"][data-arg="${obsAna.id}"]`, COMO); await L.esperar(async () => (await revObs()).como === COMO);
    await pestana('cerrar'); c = await cierre(F); const o = await revObs(), k = await revRiesgo();
    await C('19 con mitigación y conflicto comprobado → «Listo para revisión del facilitador»', {
      'la pantalla de revisión conserva lo escrito': persiste.mit === MITIGACION && persiste.prop === PROPUESTA && persiste.tipo === 'conflicto',
      'la revisión guarda mitigación, solución propuesta, comprobación y cómo se comprobó': k.aplica === true && k.mitigacion === MITIGACION && o.tipo === 'conflicto' && o.propuesta === PROPUESTA && o.comprobado === true && o.como === COMO,
      'estado «Listo para revisión del facilitador»': c.estado === 'Listo para revisión del facilitador' && c.cls === 'ready',
      'sin evidencia pendiente ni ajustes': c.faltas.length === 0 && c.ajustes.length === 0
    }, c.estado, F);

    /* ========== 19b · Cerrar ========== */
    etapa = 'cerrar';
    const forzarCierre = async () => { await F.evaluate(() => { const x = document.createElement('button'); x.setAttribute('data-act', 'cerrar-sesion'); x.hidden = true; document.body.appendChild(x); x.click(); x.remove(); }); await L.w(250); return aviso(F); };
    const sinDecision = { boton: c.boton, nota: c.nota };
    await F.fill('input[data-in="d-quien"]', QUIEN); await F.fill('textarea[data-in="d-cond"]', CONDICIONES); await clic(F, '[data-act="d-guardar"]');
    e = await hasta(x => !!x.ses.decision && x.ses.decision.quien === QUIEN) || await E(); const incompleta = await cierre(F), forzado = await forzarCierre(); e = await E();
    await C('19b no se puede cerrar sin decisión documentada', {
      'sin decisión no se ofrece cerrar': !sinDecision.boton,
      'la pantalla explica qué exige el cierre': /Cerrar la sesión requiere .*una decisión completa \(quién, condiciones y al menos un requisito con comprobación\)/.test(sinDecision.nota),
      'con la decisión a medias (quién y condiciones, sin requisito) tampoco': !!e.ses.decision && e.ses.decision.quien === QUIEN && (e.ses.decision.requisitos || []).length === 0 && !incompleta.boton,
      'la acción de cerrar se rechaza aunque se dispare sin botón': forzado.err && /No se puede cerrar: la decisión está incompleta/.test(forzado.msg),
      'la sesión sigue en revisión, sin decisión final registrada': e.ses.estado === 'revision' && !e.regs.some(r => r.tipo === 'decision_final')
    }, forzado.msg, F);

    await F.fill('textarea[data-in="d-evidencia"]', EVIDENCIA); await F.fill('input[data-in="d-req"][data-arg="0"]', REQUISITO); await F.fill('input[data-in="d-comp"][data-arg="0"]', COMPROBACION); await clic(F, '[data-act="d-guardar"]');
    const avisoDecision = await aviso(F); e = await hasta(x => !!x.ses.decision && (x.ses.decision.requisitos || []).length === 1) || await E(); c = await cierre(F); const d = e.ses.decision || {};
    await C('20 decisión guardada habilita el cierre', {
      'aviso «Decisión guardada»': !avisoDecision.err && avisoDecision.msg === 'Decisión guardada.',
      'la decisión guarda quién, con qué evidencia y qué condiciones': d.quien === QUIEN && d.evidencia === EVIDENCIA && d.condiciones === CONDICIONES && d.t > 0,
      'y el requisito con su forma de comprobación': igual(d.requisitos, [{ texto: REQUISITO, comprobacion: COMPROBACION }]),
      'el estado sigue «Listo para revisión del facilitador»': c.estado === 'Listo para revisión del facilitador',
      'ahora sí se ofrece cerrar la sesión': c.boton && /La decisión está completa/.test(c.nota)
    }, `${d.quien} · requisito: ${((d.requisitos || [])[0] || {}).texto}`, F);

    if (c.boton) await clic(F, '[data-act="cerrar-sesion"]');
    e = await hasta(x => x.ses.estado === 'cerrada', c.boton ? 6000 : 500) || await E(); c = await cierre(F); top = await L.txt(F, '#top');
    reg = e.regs.filter(r => r.tipo === 'decision_final')[0] || { payload: { decision: {} } };
    await C('21 «Cerrado con decisión documentada»', {
      'la sesión queda cerrada, con su fecha': e.ses.estado === 'cerrada' && e.ses.cerrada > 0,
      'estado «Cerrado con decisión documentada»': c.estado === 'Cerrado con decisión documentada' && c.cls === 'ok',
      'la decisión final queda en el registro como intervención del facilitador': reg.origen === 'facilitador' && reg.payload.decision.quien === QUIEN && igual(reg.payload.decision.requisitos, [{ texto: REQUISITO, comprobacion: COMPROBACION }]),
      'ya no se ofrece cerrar': !c.boton,
      'la barra muestra «Cerrada»': top.includes('Cerrada'),
      'los participantes ven la sesión cerrada': await L.ve(ana, () => /La sesión está cerrada con decisión documentada/.test((document.querySelector('.pmain .qpanel') || {}).textContent || ''))
    }, c.estado, F);

    /* ========== 22 · Informe ========== */
    etapa = 'informe';
    await pestana('resultados'); await L.ve(F, () => !!document.getElementById('informe'));
    const cabecera = await L.txt(F, '#informe'); const t = {}; for (const id of ['participantes', 'ronda_R1', 'ronda_R2', 'desacuerdos', 'barreras', 'requisitos', 'valoraciones', 'preguntas', 'indicadores', 'registros']) t[id] = await tabla(F, id);
    const rondasInf = await F.$$eval('#informe h3', hs => hs.map(h => h.textContent.replace(/\s+/g, ' ').trim()));
    const propios = n => e.vigentes.filter(r => r.participanteNombre === n && r.participanteId).length;
    const filaPaso = (id, p) => t[id].filas.filter(x => x[0].indexOf(p + ' · ') === 0)[0] || [];
    const menciones = ['R1', 'R2'].flatMap(r => VALORAN.filter(n => VAL[r][n].P3.includes('responsable')).map(n => CORTO[ACTOR_DE[n]] + ' (' + r + ')'));
    const barrera = t.barreras.filas.filter(x => x[0] === BARRERA)[0] || [];
    await C('22 informe: participantes, rondas, desacuerdos, barreras, requisitos', {
      'encabezado con el nombre de la sesión y el estado de cierre': cabecera.includes('Informe de la sesión «' + NOMBRE + '»') && cabecera.includes('estado de cierre: Cerrado con decisión documentada'),
      'participantes: los siete, con su actor': t.participantes.filas.length === 7 && GENTE.every(([n, a]) => t.participantes.filas.some(x => x[0] === n && x[1] === ACTOR[a])),
      'participantes: el número de registros de cada uno es el del almacén': GENTE.every(([n]) => t.participantes.filas.some(x => x[0] === n && +x[2] === propios(n) && propios(n) > 0)),
      'rondas: las dos, cerradas y con sus once pasos completados': rondasInf.some(x => x.indexOf(RONDA.R1 + ' Cerrada') === 0) && rondasInf.some(x => x.indexOf(RONDA.R2 + ' Cerrada') === 0) && ['ronda_R1', 'ronda_R2'].every(id => t[id].filas.length === 11 && t[id].filas.every(x => x[1] === 'completado')),
      'rondas: decisiones y excepciones de cada paso': /EPS pedir/.test(filaPaso('ronda_R1', 'A2')[3]) && /EPS reconocer/.test(filaPaso('ronda_R1', 'A2')[3]) && filaPaso('ronda_R1', 'A2')[4] === '' && filaPaso('ronda_R1', 'A3')[4] === JUST('R1', 'A3') && t.ronda_R1.filas.filter(x => x[4]).length === 9 && t.ronda_R2.filas.filter(x => x[4]).length === 10,
      'desacuerdos: la EPS en A2 con las dos respuestas': t.desacuerdos.filas.some(x => x[0] === 'R1' && x[1] === ACTOR.eps && x[2] === 'A2' && x[3] === 'actividad' && partes(x[4]) === 'Beto: pedir · Carla: reconocer'),
      'barreras: «No estaba claro quién responde» con sus menciones y quién la señaló': +barrera[1] === menciones.length && menciones.length === 4 && igual(String(barrera[2]).split(', ').sort(), menciones.slice().sort()) && String(barrera[3]).includes(VAL.R1.Beto.P3cual),
      'requisitos: la decisión y el requisito con su comprobación': igual(t.requisitos.filas, [[REQUISITO, COMPROBACION]]) && cabecera.includes('Decisión de ' + QUIEN) && cabecera.includes(CONDICIONES)
    }, `${t.participantes.filas.length} participantes · barrera «${barrera[0]}»: ${barrera[1]} menciones (${barrera[2]})`, F);

    const cap = await F.evaluate(() => {
      const n = s => s.replace(/\s+/g, ' ').trim(), inf = document.getElementById('informe'), hs = [...inf.querySelectorAll(':scope > h2')];
      const capitulo = id => { const tb = inf.querySelector('table[data-tabla="' + id + '"]'); let c = ''; hs.forEach(h => { if (tb && (h.compareDocumentPosition(tb) & Node.DOCUMENT_POSITION_FOLLOWING)) c = n(h.textContent); }); return c; };
      const nota = ini => { const h = hs.filter(x => n(x.textContent).indexOf(ini) === 0)[0], p = h ? h.nextElementSibling : null; return p && p.tagName === 'P' ? n(p.textContent) : ''; };
      const h10 = hs.filter(x => n(x.textContent).indexOf('10.') === 0)[0], lis = [];
      for (let x = h10 ? h10.nextElementSibling : null; x && x.tagName !== 'H2'; x = x.nextElementSibling) x.querySelectorAll('li').forEach(li => lis.push({ b: n((li.querySelector('b') || { textContent: '' }).textContent), t: n(li.textContent) }));
      return { titulos: hs.map(h => n(h.textContent)), valoraciones: capitulo('valoraciones'), preguntas: capitulo('preguntas'), indicadores: capitulo('indicadores'), nota8: nota('8.'), nota9: nota('9.'), cap10: h10 ? n(h10.textContent) : '', lis };
    });
    const ind = {}; t.indicadores.filas.forEach(x => { ind[x[0]] = x; });
    const FORMULAS = { reprocesos: 'decisiones con suficiencia parcial o insuficiente que señalan una pieza faltante', acusesSimulados: 'acuses generados por el sistema (comportamiento simulado del módulo)', excepciones: 'pasos avanzados por el facilitador sin cumplir las condiciones', desacuerdos: 'pares de representantes del mismo actor con decisiones o valoraciones distintas' };
    const par = clave => (ind[clave] || []).slice(1, 3).map(Number);
    await C('22b informe muestra fórmula de cada indicador y separa percepción de observación', {
      'la tabla de indicadores compara las dos rondas y explica el cálculo': igual(t.indicadores.cab, ['Indicador', 'R1 (actual)', 'R2 (propuesto)', 'Cómo se calcula']),
      'cada indicador muestra cómo se calcula': t.indicadores.filas.length >= 16 && t.indicadores.filas.every(x => (x[3] || '').length >= 20),
      'las fórmulas describen el cálculo de cada indicador': Object.keys(FORMULAS).every(x => (ind[x] || [])[3] === FORMULAS[x]),
      'los valores reflejan lo ocurrido en cada ronda': igual(par('acusesSimulados'), [0, 1]) && igual(par('excepciones'), [9, 10]) && igual(par('finalidadesNoAutorizadas'), [1, 0]) && par('desacuerdos')[0] >= 1,
      'las valoraciones van en su capítulo, como percepción': cap.valoraciones === '8. Valoraciones subjetivas' && cap.preguntas === '8. Valoraciones subjetivas' && cap.nota8 === 'Percepción de los participantes; no es comportamiento observado.' && t.valoraciones.cab.includes('Percepción frente a hoy'),
      'los indicadores van en otro capítulo, como comportamiento observado': cap.indicadores === '9. Indicadores observados en la simulación' && /comparables/.test(cap.nota9)
    }, `${t.indicadores.filas.length} indicadores con fórmula · acuses simulados R1/R2: ${par('acusesSimulados').join('/')} · excepciones: ${par('excepciones').join('/')}`, F);

    const hip = cap.lis.filter(x => /^H/.test(x.b)), enlace = (b, sub) => cap.lis.some(x => x.b === b && x.t.indexOf(b + ' → ' + sub + ':') === 0);
    await C('22c H1–H4 no renombradas; P1–P4 vinculadas a subpreguntas', {
      'el informe tiene el capítulo de correspondencia con el proyecto doctoral': cap.cap10 === '10. Correspondencia con el proyecto doctoral',
      'las hipótesis aparecen como H1, H2, H3 y H4, en ese orden y sin otro nombre': igual(hip.map(x => x.b), ['H1', 'H2', 'H3', 'H4']) && hip.every(x => x.t.indexOf(x.b + ': ') === 0 && x.t.length > 12),
      'P1 y P3 se vinculan a la subpregunta de caracterización': enlace('P1 y P3', 'Caracterización'),
      'P2 y P4 se vinculan a la subpregunta de diseño': enlace('P2 y P4', 'Diseño'),
      'los indicadores observados se vinculan a la subpregunta de evaluación': enlace('Indicadores observados', 'Evaluación'),
      'la tabla de preguntas conserva P1 a P4 con su tema': igual(t.preguntas.cab.slice(3), ['P1 representación', 'P2 comprensión', 'P3 dificultades', 'P4 requisitos']) && t.preguntas.filas.length === 12
    }, hip.map(x => x.b).join(', ') + ' · ' + cap.lis.filter(x => /→/.test(x.t)).map(x => x.t.split(':')[0]).join(' · '), F);

    const enPantalla = t.valoraciones.filas.map(x => x.join('|')).sort(), enAlmacen = e.vigentes.filter(r => r.tipo === 'valoracion').map(r => [r.ronda, ACTOR[r.actor], r.participanteNombre, r.payload.semaforo, r.payload.mejora, r.payload.ajuste || ''].join('|')).sort();
    await C('22d tabla de valoraciones = registros (12)', {
      'la tabla del informe tiene 12 filas': t.valoraciones.filas.length === 12,
      'el almacén tiene 12 valoraciones vigentes': enAlmacen.length === 12,
      'fila a fila, la tabla y los registros coinciden': igual(enPantalla, enAlmacen),
      'y son las que respondió cada participante en cada ronda': igual(enPantalla, FILAS_VAL)
    }, `${t.valoraciones.filas.length} filas en pantalla · ${enAlmacen.length} registros`, F);

    /* ========== 23 · Exportaciones ========== */
    etapa = 'exportaciones';
    const bajar = async (sel, nombre) => { await L.soltar(F); const dl = await L.descargar(F, sel); const texto = L.fs.readFileSync(await dl.path(), 'utf8'); L.fs.writeFileSync(L.path.join(L.SALIDA, nombre), texto); return { archivo: dl.suggestedFilename(), texto }; };
    const xHtml = await bajar('[data-act="exp-informe"]', 'e2e-informe.html'), xCsv = await bajar('[data-act="csv"][data-arg="valoraciones"]', 'e2e-valoraciones.csv');
    await pestana('cerrar'); const xJson = await bajar('[data-act="exp-json"]', 'e2e-sesion.json');
    let J = null; try { J = JSON.parse(xJson.texto); } catch (err) { J = null; }
    const claves = [], valores = []; (function andar(x) { if (x && typeof x === 'object') Object.keys(x).forEach(q => { if (!Array.isArray(x)) claves.push(q); andar(x[q]); }); else valores.push(x); })(J);
    await C('23 JSON sin credenciales', {
      'se descarga sesion-<código>.json y es JSON válido': xJson.archivo === 'sesion-' + code + '.json' && !!J,
      'es la exportación completa de esta sesión': !!J && J.instrumento === 'service_blueprint_simulacion' && (J.sesion || {}).codigo === code && (J.participantes || []).length === 7 && (J.registros || []).length === e.regs.length && (J.cierre || {}).estado === 'Cerrado con decisión documentada',
      'incluye las versiones anteriores de lo rectificado': !!J && (J.registros || []).filter(r => r.tipo === 'actividad' && r.participanteNombre === 'Beto' && r.paso === 'A2').length === 2,
      'el almacén sí guarda la huella del PIN; la exportación la quita': huella.length > 1 && !!J && !('pinHash' in (J.sesion || {})) && !xJson.texto.includes(huella),
      'ninguna clave con nombre de credencial': claves.length > 50 && !claves.some(q => /^pin|pinhash|password|contrase/i.test(q)),
      'el PIN no aparece en ningún valor': valores.length > 500 && !valores.some(x => x === PIN || x === +PIN) && sinPin(xJson.texto)
    }, `${xJson.archivo} · ${(J && J.registros || []).length} registros · ${xJson.texto.length} caracteres`, F);

    const estilo = (xHtml.texto.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
    await C('23b informe HTML con estilos y sin PIN', {
      'se descarga informe-sesion-<código>.html, un documento completo': xHtml.archivo === 'informe-sesion-' + code + '.html' && /^<!doctype html>/i.test(xHtml.texto) && xHtml.texto.includes('<title>Informe · ' + NOMBRE + '</title>'),
      'lleva la hoja de estilos de la herramienta (--ui-primary)': /--ui-primary\s*:/.test(estilo) && estilo.length > 10000,
      'contiene el informe: portada, capítulos y tablas': /class="doc-cover"/.test(xHtml.texto) && xHtml.texto.includes('11. Registro completo') && (xHtml.texto.match(/data-tabla="/g) || []).length >= 12 && xHtml.texto.includes(REQUISITO),
      'sin botones ni controles': !/<button/i.test(xHtml.texto),
      'sin el PIN ni su huella': sinPin(xHtml.texto) && !xHtml.texto.includes(huella) && !/pinhash/i.test(xHtml.texto)
    }, `${xHtml.archivo} · ${xHtml.texto.length} caracteres · estilos: ${estilo.length}`, F);

    const lineas = leerCsv(xCsv.texto), datos = lineas.slice(1);
    await C('23c CSV de valoraciones con 12 filas', {
      'se descarga sesion-<código>-valoraciones.csv, con marca de orden de bytes para Excel': xCsv.archivo === 'sesion-' + code + '-valoraciones.csv' && xCsv.texto.charCodeAt(0) === 0xFEFF,
      'cabecera de la tabla de valoraciones': igual(lineas[0], ['Ronda', 'Actor', 'Participante', 'Contrato', 'Percepción frente a hoy', 'Ajuste propuesto']),
      '12 filas de datos, seis por ronda': datos.length === 12 && ['R1', 'R2'].every(r => datos.filter(x => x[0] === r).length === 6),
      'son las mismas filas que la tabla del informe': igual(datos.map(x => x.join('|')).sort(), FILAS_VAL),
      'sin el PIN': sinPin(xCsv.texto) && !xCsv.texto.includes(huella)
    }, `${xCsv.archivo} · ${datos.length} filas`, F);

    /* ========== 24 · Recarga de participante ========== */
    etapa = 'recarga de participante';
    await recargar(ana); await L.ve(ana, () => !!document.querySelector('.pside')); await L.w(300);
    f = await ficha(ana); e = await E(); const ua = new URL(ana.url());
    await C('24 recarga de participante recupera su identidad y estado', {
      'a mitad de la sesión, Dani recargó y siguió siendo Dani (IPS)': daniRecargado.rol === 'participante' && daniRecargado.nombreTop === 'Dani' && daniRecargado.actorTop === ACTOR.ips && daniRecargado.actor === ACTOR.ips,
      'y recuperó su actividad completada, con lo que había respondido': daniRecargado.titulo === 'Actividad completada' && daniRecargado.kv['Decisión'] === 'expedir' && daniRecargado.kv['Notifica a'] === 'EPS' && (daniRecargado.llamadas['Ronda y paso actual'] || '').includes(RONDA.R2),
      'con la sesión cerrada, Ana recarga y sigue siendo Ana (M.P.)': f.rol === 'participante' && f.nombreTop === 'Ana' && f.actorTop === ACTOR.tra && f.nombre === 'Ana · ' + ACTOR.tra,
      'y ve su estado: ronda valorada y sesión cerrada': f.titulo === RONDA.R2 + ' cerrada para usted' && /La sesión está cerrada con decisión documentada/.test(f.panel) && f.chip === 'Cerrada' && !f.hayValorar,
      'la URL solo lleva el código de la sesión': ua.hash === '#s=' + code && ua.search === '',
      'recargar no crea participantes nuevos': e.parts.length === 7
    }, 'Dani: ' + daniRecargado.titulo + ' · Ana: ' + f.titulo, ana);

    /* ========== 25 · Consulta de resultados y acceso de facilitador ========== */
    etapa = 'consulta de resultados y PIN';
    const aLaEntrada = async () => { if ((await rol(V)) !== 'entrada') { await L.click(V, '[data-act="salir"]'); await L.ve(V, () => !!document.querySelector('input[data-in="e-pin"]')); } };
    await aLaEntrada(); await V.fill('input[data-in="e-code2"]', code); const pinEscrito = await V.$eval('input[data-in="e-pin"]', el => el.value);
    await L.click(V, '[data-act="entrar-res"]'); await L.ve(V, () => !!document.getElementById('informe'));
    const consulta = await V.evaluate(() => ({ rol: document.body.getAttribute('data-rol'), top: document.querySelector('#top').textContent.replace(/\s+/g, ' ').trim(), quien: document.querySelector('#appright').textContent.replace(/\s+/g, ' ').trim(), informe: ((document.querySelector('#informe h2') || {}).textContent || '').replace(/\s+/g, ' ').trim(), filas: document.querySelectorAll('table[data-tabla="valoraciones"] tbody tr').length, controles: ['fsub', 'd-guardar', 'archivar', 'cerrar-sesion', 'exp-json'].filter(a => document.querySelector('[data-act="' + a + '"]')) }));
    await C('25 resultados abiertos con el código al estar cerrada', {
      'con la sesión en curso, el código solo no abría los resultados': resAntes.rol === 'entrada' && resAntes.err && /Los resultados se abren cuando la sesión está cerrada, o con el PIN de facilitación/.test(resAntes.msg),
      'con la sesión cerrada, el código los abre sin escribir el PIN': consulta.rol === 'resultados' && pinEscrito === '',
      'se presenta como consulta de resultados': /^Resultados/.test(consulta.top) && consulta.top.includes('código ' + code) && /consulta de resultados/.test(consulta.quien),
      'muestra el informe de la sesión, con sus 12 valoraciones': consulta.informe === 'Informe de la sesión «' + NOMBRE + '»' && consulta.filas === 12,
      'sin controles de facilitación': consulta.controles.length === 0
    }, `en curso: «${resAntes.msg}» · cerrada: entra como ${consulta.rol}`, V);

    await aLaEntrada();
    await V.fill('input[data-in="e-code2"]', code); await V.fill('input[data-in="e-pin"]', '0000'); await L.click(V, '[data-act="entrar-fac"]');
    const malo = Object.assign({ rol: await rol(V), tabs: await V.$$eval('[data-act="fsub"]', x => x.length) }, await aviso(V));
    await aLaEntrada(); await V.fill('input[data-in="e-code2"]', code); await V.fill('input[data-in="e-pin"]', PIN); await L.click(V, '[data-act="entrar-fac"]');
    const entro = await L.ve(V, () => document.body.getAttribute('data-rol') === 'facilitador' && document.querySelectorAll('[data-act="fsub"]').length === 6);
    await C('26 PIN incorrecto rechazado', {
      'con un PIN equivocado no se entra': malo.rol === 'entrada',
      'se avisa que el PIN no coincide': malo.err && /El PIN no coincide/.test(malo.msg),
      'no aparecen los momentos del facilitador': malo.tabs === 0,
      'con el PIN correcto sí se entra (control)': entro
    }, malo.msg, V);

    /* ========== 27 · Anchos de pantalla del participante ========== */
    etapa = 'anchos de pantalla';
    await medir(ana, 'sesión cerrada');
    if (await ana.$('[data-act="ver-todo"]')) { await clic(ana, '[data-act="ver-todo"]'); if (await L.ve(ana, () => !!document.querySelector('table.sb'))) await medir(ana, 'recorrido completo'); }
    for (const ancho of [1024, 390]) {
      const ms = medidas.filter(m => m.ancho === ancho), partesAncho = { 'se midieron las cuatro vistas del participante': ms.length === 4 };
      ms.forEach(m => { partesAncho[`${m.donde}: el contenido (${m.sw} px) cabe en la ventana (${m.cw} px)`] = m.sw <= m.cw && m.cw > 0; });
      await C(`27 participante ${ancho} sin desbordamiento`, partesAncho, ms.map(m => `${m.donde} ${m.sw}/${m.cw}`).join(' · '), ana);
    }
    await cerrarTodo(null);
  } catch (err) { await cerrarTodo(`en «${etapa}»: ` + resumir(err)); }
})().catch(err => { console.log('ERR', resumir(err)); process.exit(1); });
