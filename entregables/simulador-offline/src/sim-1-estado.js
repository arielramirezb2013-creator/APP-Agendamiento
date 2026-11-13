/* ============ Simulador: configuración, estado, almacenamiento local y conductor automático ============ */

/* ---------- Configuración: cuentas y datos del estudio ----------
   Una configuración incluida en el propio archivo manda sobre configuracion.js: así un simulador entregado
   como archivo único funciona sin nada más. */
const CFG = (() => {
  const c = window.SIM_CONFIG_INCLUIDA || window.SIM_CONFIG || null;
  const errores = c ? validarConfig(c) : ["no se encontró la configuración del estudio (configuracion.js)"];
  const estudio = Object.assign({}, GUION.estudio);
  Object.keys((c && c.estudio) || {}).forEach(k => { if (c.estudio[k] != null && c.estudio[k] !== "") estudio[k] = String(c.estudio[k]); });
  const envio = c && c.envio && typeof c.envio.url === "string" && c.envio.url.trim() ? { url:c.envio.url.trim(), clave:String(c.envio.clave || ""), modo:c.envio.modo === "final" ? "final" : "progresivo" } : null;
  return {
    ok:!errores.length, errores, origen:window.SIM_CONFIG_INCLUIDA ? "incluida" : c ? "externa" : null,
    demo:c && c.demo ? { clave:String(c.demo.clave || "") } : null,
    estudio, kdf:Object.assign({}, KDF, (c && c.kdf) || {}), envio,
    cuentas:errores.length ? [] : c.cuentas, consentimiento:(c && c.consentimiento) || {}, generado:(c && c.generado) || null
  };
})();
// Texto del consentimiento: el del guion, con lo que el investigador haya ajustado en la configuración.
const CONS = Object.assign({}, GUION.consentimiento, CFG.consentimiento);

/* ---------- Estado ---------- */
const estadoInicial = () => ({
  etapa:"acceso",                  // acceso | orientacion | consentimiento | rechazo | simulacion | cierre | retirado
  orient:0,                        // pantalla de la orientación
  cuenta:null,                     // { u, a, p }
  yo:null,                         // { id, nombre (alias), actor }
  ses:null, regs:[],               // sesión individual y bitácora de solo anexar
  consent:null,                    // declaración aceptada
  envio:{ estado:"pendiente" },    // pendiente | enviando | enviado | error
  descargado:0,
  acc:{ u:"", c:"", ver:false },   // formulario de acceso
  cons:{ decl:{}, anonimo:"si", datos:{}, resumen:false },
  form:{}, val:{}, ctxObs:"", comentario:"", abierto:0,
  verTodo:false, zoom:1, confirmar:null, guardado:0,
  retomar:null,                    // null | { origen:"local"|"servidor"|"archivo", t } : pantalla de reanudación
  buscando:false,                  // consultando al servidor si hay un avance guardado
  msg:"", msgErr:false
});
let S = estadoInicial();
let enLinea = typeof navigator === "undefined" || navigator.onLine !== false;
let falloGrave = "";               // error inesperado: se muestra la pantalla de recuperación

/* ---------- Almacenamiento en este dispositivo ----------
   Cada cambio se guarda de inmediato. Se conserva además la versión anterior como respaldo, por si el navegador
   se cierra a mitad de una escritura. Si el navegador no permite guardar de forma permanente, se usa el
   almacenamiento de la pestaña, que sobrevive a una recarga. */
const ALM = (() => {
  const sirve = s => { try { s.setItem("simasinc:prueba", "1"); s.removeItem("simasinc:prueba"); return true; } catch (e) { return false; } };
  let local = null, sesion = null;
  try { if (sirve(window.localStorage)) local = window.localStorage; } catch (e) {}
  try { if (sirve(window.sessionStorage)) sesion = window.sessionStorage; } catch (e) {}
  return { local, sesion, datos:local || sesion, tipo:local ? "local" : sesion ? "pestana" : "memoria" };
})();
const claveLocal = u => "simasinc:v1:" + CFG.estudio.id + ":" + u;
const CLAVE_SESION = "simasinc:v1:" + CFG.estudio.id + ":sesion";
const PERSISTE = ["etapa", "orient", "cuenta", "yo", "ses", "regs", "consent", "envio", "descargado", "cons", "form", "val", "ctxObs", "comentario", "abierto"];
let guardadoFallo = false;
function guardarLocal() {
  if (!S.cuenta || !ALM.datos) return false;
  const d = { v:1, t:ahora() }; PERSISTE.forEach(k => { d[k] = S[k]; });
  const k = claveLocal(S.cuenta.u), txt = JSON.stringify(d);
  try {
    const previo = ALM.datos.getItem(k);
    if (previo && previo !== txt) { try { ALM.datos.setItem(k + ":respaldo", previo); } catch (e) {} }
    ALM.datos.setItem(k, txt); S.guardado = d.t; guardadoFallo = false; return true;
  } catch (e) { guardadoFallo = true; return false; }
}
const estadoValido = d => !!(d && d.v === 1 && d.cuenta && d.yo && Array.isArray(d.regs));
function cargarLocal(u) {
  if (!ALM.datos) return null;
  const k = claveLocal(u);
  for (const x of [k, k + ":respaldo"]) { try { const d = JSON.parse(ALM.datos.getItem(x) || "null"); if (estadoValido(d)) return d; } catch (e) {} }
  return null;
}
function borrarLocal(u) { if (!ALM.datos) return; try { ALM.datos.removeItem(claveLocal(u)); ALM.datos.removeItem(claveLocal(u) + ":respaldo"); } catch (e) {} }
function recordarSesion(u) { try { if (u) ALM.sesion.setItem(CLAVE_SESION, u); else ALM.sesion.removeItem(CLAVE_SESION); } catch (e) {} }
function sesionRecordada() { try { return ALM.sesion.getItem(CLAVE_SESION) || ""; } catch (e) { return ""; } }

/* ---------- Acceso y reanudación ---------- */
function aplicarGuardado(d) { PERSISTE.forEach(k => { if (d[k] !== undefined) S[k] = d[k]; }); S.guardado = d.t || 0; }
// Abre la cuenta. Si hay avance guardado en este dispositivo, lo restablece y muestra la pantalla de reanudación.
function abrirCuenta(q, reanudar) {
  const d = cargarLocal(q.u), previo = d && d.cuenta.a === q.a ? d : null;
  const cuenta = { u:q.u, a:q.a, p:!!q.p, r:reanudar || (previo && previo.cuenta.r) || "" };
  S = estadoInicial();
  if (previo) {
    aplicarGuardado(previo); S.cuenta = cuenta;
    if (S.etapa === "acceso") S.etapa = "orientacion";
    if (S.envio && S.envio.estado === "enviando") S.envio = { estado:"pendiente" };
    if (S.consent) S.retomar = { origen:"local", t:previo.t };
  } else {
    S.cuenta = cuenta; S.yo = { id:"p" + hex(azar(8)), nombre:q.u, actor:q.a }; S.etapa = "orientacion"; S.abierto = ahora();
  }
  recordarSesion(q.u); guardarLocal();
  return !!previo;
}
function entrar() {
  const u = normUsuario(S.acc.u), c = S.acc.c;
  if (!u || !normClave(c)) return aviso("Escriba su usuario y su contraseña.", true);
  const q = CFG.cuentas.filter(x => x.u === u)[0];
  const h = huellaClave(u, c, q ? q.s : "00000000", CFG.kdf.iter);   // se calcula siempre: el tiempo no revela si el usuario existe
  if (!q || !igualSeguro(h, q.h)) return aviso("El usuario o la contraseña no coinciden. Revise los datos que le envió el investigador.", true);
  // Llave de reanudación: solo quien conoce la contraseña puede pedir al servidor el avance guardado.
  const habia = abrirCuenta(q, huellaClave(u, c, q.s + ":reanudar", CFG.kdf.iter));
  if (!habia && CFG.envio) buscarEnServidor();
}
function salir() { recordarSesion(""); S = estadoInicial(); }
// Un documento de respuestas (parcial o completo) trae todo lo necesario para continuar en otro dispositivo.
function documentoRestaurable(doc) {
  const e = validarRespuesta(doc); if (e.length) return e[0];
  if (doc.estudio.id !== CFG.estudio.id) return "el archivo es de otro estudio";
  if (doc.cuenta.usuario !== S.cuenta.u || doc.cuenta.actor !== S.cuenta.a) return "el archivo es de otra cuenta";
  const s = doc.sesion;
  if (!s || !s.rondas || !rondaDef(s.rondaActual) || PIDX[s.pasoActual] == null || !ESC.rondas.every(r => s.rondas[r.id] && s.rondas[r.id].pasos)) return "el archivo no trae una sesión que se pueda continuar";
  return "";
}
function restaurarDe(doc, origen) {
  const cuenta = S.cuenta;
  S = estadoInicial(); S.cuenta = cuenta;
  S.yo = { id:doc.participante.id, nombre:cuenta.u, actor:cuenta.a };
  S.ses = clone(doc.sesion); S.regs = clone(doc.registros);
  S.consent = { aceptado:true, t:doc.consentimiento.t, version:doc.consentimiento.version, declaraciones:doc.consentimiento.declaraciones || {}, anonimo:!!doc.participante.anonimo, datos:doc.participante.datos || {}, resumen:!!doc.participante.resumen, texto:doc.consentimiento.texto || [] };
  S.cons = { decl:Object.assign({}, S.consent.declaraciones), anonimo:S.consent.anonimo ? "si" : "no", datos:Object.assign({}, S.consent.datos), resumen:S.consent.resumen };
  S.etapa = S.ses.estado === "cerrada" ? "cierre" : "simulacion";
  S.retomar = { origen, t:Date.parse(doc.generado) || ahora() };
  if (rondaAct().estado === "en_curso") prepararBloque(bloqueActual());
  S.abierto = ahora(); guardarLocal();
}
async function buscarEnServidor() {
  const u = S.cuenta.u; S.buscando = true; render();
  let doc = null;
  try { const j = await llamarServidor({ accion:"recuperar", estudio:CFG.estudio.id, usuario:u, reanudar:S.cuenta.r }, 8000); doc = j.documento || null; } catch (e) {}
  if (!S.cuenta || S.cuenta.u !== u) return;
  S.buscando = false;
  if (doc && !S.consent && !documentoRestaurable(doc)) restaurarDe(doc, "servidor");
  render();
}
function cargarAvance(texto) {
  let doc = null; try { doc = JSON.parse(texto); } catch (e) {}
  const err = doc ? documentoRestaurable(doc) : "no es un archivo de avance de esta simulación";
  if (err) return aviso("No se pudo cargar: " + err + ".", true);
  if (S.regs.length > (doc.registros || []).length) return aviso("En este dispositivo ya hay un avance mayor que el del archivo. Se conserva el de este dispositivo.", true);
  restaurarDe(doc, "archivo"); aviso("Avance cargado. Continúa donde quedó.");
}
function empezarDeNuevo() {
  const c = S.cuenta; S = estadoInicial(); S.cuenta = c;
  S.yo = { id:"p" + hex(azar(8)), nombre:c.u, actor:c.a }; S.etapa = "orientacion"; S.abierto = ahora(); guardarLocal();
}

/* ---------- Sesión individual ---------- */
function nuevaSesion() {
  const rondas = {}; ESC.rondas.forEach(r => { rondas[r.id] = { estado:"pendiente", pasos:{} }; });
  return { codigo:S.yo.id, nombre:CFG.estudio.titulo, escenario:ESC.id, modalidad:"asincrona", estado:"en_curso", creada:ahora(), rondaActual:ESC.rondas[0].id, pasoActual:PASOS[0].id, rondas };
}
const vigentes = () => vigentesDe(S.regs);
const regsDe = f => vigentes().filter(r => cumple(r, f));
function diaVirtual(ronda) { let d = ESC.dia0; vigentes().forEach(r => { if (r.ronda === ronda && r.tipo === "actividad") d += num(r.payload.dias); }); return d; }
const pasoActual = () => PASOS[PIDX[S.ses.pasoActual] || 0];
const rondaAct = () => S.ses.rondas[S.ses.rondaActual];
const modoActual = () => modoDe(S.ses.rondaActual);
const miActividad = (ronda, pid) => regsDe({ ronda, paso:pid, tipo:"actividad", participanteId:S.yo.id })[0] || null;
const bloques = ronda => bloquesDe(S.yo.actor, modoDe(ronda || S.ses.rondaActual));
// Dónde va el participante en la ronda: el tramo actual y el que sigue.
function posicion() { const bs = bloques(), pid = S.ses.pasoActual; let i = bs.findIndex(b => b.pasos.indexOf(pid) >= 0); if (i < 0) i = 0; return { bs, i, b:bs[i], sig:bs[i + 1] || null }; }
const bloqueActual = () => posicion().b;
function minutosEstimados(actor) {
  const T = GUION.tiempos; let m = T.inicio + T.cierre;
  ESC.rondas.forEach(r => { bloquesDe(actor, r.modo).forEach(b => { m += b.tipo === "contexto" ? T.contexto * b.pasos.length : T[b.act.tipo]; }); m += T.valoracion; });
  return Math.max(10, Math.round(m / 5) * 5);
}
// Avance global del participante: actividades y valoraciones hechas frente a las que le corresponden.
function avance() {
  let total = 0, hechas = 0;
  ESC.rondas.forEach(r => {
    bloquesDe(S.yo.actor, r.modo).forEach(b => { if (b.tipo === "actividad") { total++; if (S.ses && miActividad(r.id, b.pasos[0])) hechas++; } });
    total++; if (S.ses && regsDe({ ronda:r.id, tipo:"preguntas", participanteId:S.yo.id }).length) hechas++;
  });
  return { total, hechas, pct:total ? Math.round(hechas * 100 / total) : 0 };
}

/* ---------- Bitácora ---------- */
function registrar(tipo, payload, extra) {
  const s = S.ses;
  const reg = Object.assign({ id:uid(), t:ahora(), sesion:s.codigo, escenario:s.escenario, ronda:s.rondaActual, modo:modoDe(s.rondaActual), paso:s.pasoActual, dia:diaVirtual(s.rondaActual), origen:"participante", participanteId:S.yo.id, participanteNombre:S.yo.nombre, actor:S.yo.actor, tipo, payload:payload || {}, reemplaza:null, version:1 }, extra || {});
  S.regs.push(reg);
  return reg;
}
// Conducción automática (lo que antes hacía el facilitador): inicio y cierre de ronda, avance, respuesta enlazada.
const registrarConduccion = (tipo, payload, extra) => registrar(tipo, payload, Object.assign({ origen:"sistema", participanteId:null, participanteNombre:null, actor:null }, extra || {}));
// Lo que el sistema hace en nombre de los actores que no están conectados. Siempre lleva simulado:true.
const registrarSimulado = (tipo, payload, extra) => registrarConduccion(tipo, Object.assign({ simulado:true }, payload), extra);

/* ---------- Conductor automático ---------- */
/* Al llegar a una actividad de custodia el sistema hace de quien decide en el paso:
   hoy le pide la evidencia; con el módulo, la consulta con la vista mínima de su contrato. */
function prepararBloque(b) {
  if (!b || b.tipo !== "actividad" || b.act.tipo !== "custodia") return;
  const r = S.ses.rondaActual, modo = modoDe(r), p = PASOS[PIDX[b.pasos[0]]], yo = S.yo.actor, pide = b.act.pide, piezas = b.act.piezas, fin = finalidadDe(pide);
  if (regsDe({ ronda:r, paso:p.id }).some(x => (x.tipo === "solicitud" || x.tipo === "consulta") && x.payload.guion && x.payload.a === yo)) return;
  const en = { paso:p.id };
  if (modo === "actual") { registrarSimulado("solicitud", { de:pide, a:yo, piezas, finalidad:fin, autorizada:true, guion:true }, en); return; }
  if (!piezas.length) { registrarSimulado("consulta", { de:pide, a:yo, pieza:null, campos:[], denegada:false, metadatos:true, finalidad:fin, guion:true }, en); return; }
  const c = comprobarFinalidad(pide, fin, piezas, p.id);
  piezas.forEach(k => { const perm = c.piezasPermitidas[k]; registrarSimulado("consulta", { de:pide, a:yo, pieza:k, campos:perm || [], denegada:!perm, motivo:perm ? "" : "pieza fuera del contrato de " + nom(pide), finalidad:fin, guion:true }, en); });
}
function iniciarRonda() {
  const s = S.ses, rd = rondaAct(), t = ahora(), p0 = PASOS[0].id;
  if (rd.estado !== "pendiente") return;
  rd.estado = "en_curso"; rd.iniciada = t; s.pasoActual = p0;
  const b = bloqueActual(); b.pasos.forEach(pid => { rd.pasos[pid] = { estado:"en_curso", iniciado:t }; });
  registrarConduccion("inicio_ronda", { ronda:s.rondaActual }, { paso:p0 });
  prepararBloque(b); S.form = {}; S.ctxObs = ""; S.abierto = t;
}
function avanzar() {
  const s = S.ses, rd = rondaAct(), pos = posicion(), b = pos.b, sig = pos.sig, t = ahora();
  if (rd.estado !== "en_curso") return;
  if (b.tipo === "actividad" && !miActividad(s.rondaActual, b.pasos[0])) return;
  if (b.tipo === "contexto" && textoLimpio(S.ctxObs)) registrar("observacion", { texto:textoLimpio(S.ctxObs), pasos:b.pasos }, { paso:b.pasos[0] });
  b.pasos.forEach(pid => { rd.pasos[pid] = Object.assign(rd.pasos[pid] || {}, { estado:"completado", completado:t }); });
  registrarConduccion("avance", { de:b.pasos, a:sig ? sig.pasos[0] : "valoracion", bloque:b.tipo }, { paso:b.pasos[b.pasos.length - 1] });
  if (sig) { s.pasoActual = sig.pasos[0]; sig.pasos.forEach(pid => { rd.pasos[pid] = { estado:"en_curso", iniciado:t }; }); prepararBloque(sig); }
  else rd.estado = "valoracion";
  S.form = {}; S.ctxObs = ""; S.verTodo = false; S.abierto = t;
}
// «a», «a y b», «a, b y c»: los avisos de lo que falta se leen como una frase.
function listaFrase(xs) { return xs.length < 2 ? (xs[0] || "") : xs.slice(0, -1).join(", ") + " y " + xs[xs.length - 1]; }
function validarForm(act) {
  const f = S.form, falta = [], sinDias = f.dias == null || String(f.dias).trim() === "" || !isFinite(parseFloat(String(f.dias).replace(",", "."))) || parseFloat(String(f.dias).replace(",", ".")) < 0;
  if (act.tipo === "decide") { if (!f.suficiencia) falta.push("si con lo que tiene puede actuar"); if (!f.finalidad) falta.push("con qué finalidad consultaría"); if (!f.decision) falta.push("qué decide"); if (!f.responde) falta.push("quién responde por la decisión"); if (sinDias) falta.push("en cuántos días"); }
  if (act.tipo === "custodia") { if (!f.respuesta) falta.push("qué entrega"); if (sinDias) falta.push("cuántos días le tomaría"); }
  if (act.tipo === "focal") { if (!f.sabe) falta.push("qué sabe de su caso"); if (!f.responde) falta.push("quién le responde"); if (!(f.hizo || []).length) falta.push("qué le tocó hacer"); }
  if (act.tipo === "soporte") { if (!f.ve) falta.push("qué alcanza a ver del caso"); if (!f.accion) falta.push("qué acción tomaría"); }
  return falta;
}
function guardarActividad() {
  const s = S.ses, r = s.rondaActual, p = pasoActual(), modo = modoDe(r), yo = S.yo.actor, act = actividadDe(p, yo, modo), f = S.form;
  if (!act || rondaAct().estado !== "en_curso") return null;
  const falta = validarForm(act);
  if (falta.length) { aviso("Antes de guardar falta responder " + listaFrase(falta) + ".", true); return null; }
  const payload = { tipo:act.tipo, obs:textoLimpio(f.obs) || null, abierto:S.abierto || null };
  if (act.tipo === "decide") {
    Object.assign(payload, { suficiencia:f.suficiencia, falta:f.suficiencia === "suficiente" ? [] : (f.falta || []).slice(), finalidad:f.finalidad, decision:f.decision, decisionTxt:etiqueta(act.ops, f.decision), responde:f.responde, dias:num(f.dias), notifica:modo === "propuesto" ? (f.notifica || []).slice() : [] });
    payload.comprobacion = comprobarFinalidad(yo, f.finalidad, ESC.entradas[p.id] || [], p.id);
  }
  if (act.tipo === "custodia") Object.assign(payload, { respuesta:f.respuesta, dias:num(f.dias), piezas:act.piezas, pide:act.pide });
  if (act.tipo === "focal") Object.assign(payload, { sabe:f.sabe, responde:f.responde, dias:f.dias == null || String(f.dias).trim() === "" ? null : num(f.dias), hizo:(f.hizo || []).slice() });
  if (act.tipo === "soporte") Object.assign(payload, { ve:f.ve, accion:f.accion });
  const previo = miActividad(r, p.id);
  const reg = registrar("actividad", payload, previo ? { reemplaza:previo.id, version:(previo.version || 1) + 1 } : {});
  const de = { origenActividad:reg.id };
  if (act.tipo === "decide") {
    const c = payload.comprobacion;
    if (modo === "actual") {
      const porCust = {}; payload.falta.forEach(k => { const cu = EV[k].cust; if (cu !== yo) (porCust[cu] = porCust[cu] || []).push(k); });
      Object.keys(porCust).forEach(cu => registrarSimulado("solicitud", Object.assign({ de:yo, a:cu, piezas:porCust[cu], finalidad:payload.finalidad, autorizada:c.finalidadAutorizada }, de)));
      registrarSimulado("notificacion", Object.assign({ de:yo, a:[], acuse:false, nota:"funcionamiento actual: la decisión se notifica sin acuse" }, de));
    } else {
      (ESC.entradas[p.id] || []).forEach(k => { if (EV[k].cust === yo) return; const perm = c.piezasPermitidas[k]; registrarSimulado("consulta", Object.assign({ de:yo, a:EV[k].cust, pieza:k, campos:perm || [], denegada:!perm, motivo:perm ? "" : (c.finalidadAutorizada ? "pieza fuera de su contrato" : "finalidad no autorizada"), finalidad:payload.finalidad }, de)); });
      if (payload.notifica.length) { registrarSimulado("notificacion", Object.assign({ de:yo, a:payload.notifica, acuse:true }, de)); payload.notifica.forEach(a => registrarSimulado("acuse", Object.assign({ de:a, a:yo, nota:"acuse generado por el módulo simulado" }, de))); }
    }
  }
  if (act.tipo === "custodia") regsDe({ ronda:r, paso:p.id, tipo:"solicitud" }).filter(x => x.payload.a === yo).forEach(x => registrarConduccion("respuesta", Object.assign({ solicitud:x.id, de:yo, a:x.payload.de, respuesta:payload.respuesta, dias:payload.dias }, de)));
  S.form = {};
  return reg;
}
function validarValoracion() {
  const v = S.val, L = GUION.falta, falta = [];
  if (!v.semaforo) falta.push(L.semaforo);
  if (v.semaforo === "rechazar" && !(v.ajuste || "").trim()) falta.push(L.ajuste);
  if (!v.mejora) falta.push(L.mejora);
  ESC.preguntas.forEach(q => { if (q.tipo === "texto" ? !(v[q.id] || "").trim() : q.tipo === "multi" ? !(v[q.id] || []).length : !v[q.id]) falta.push(L[q.id] || q.id); });
  return falta;
}
function guardarValoracion() {
  const s = S.ses, r = s.rondaActual, v = S.val;
  if (rondaAct().estado !== "valoracion") return false;
  const falta = validarValoracion();
  if (falta.length) { aviso("Antes de guardar falta responder " + listaFrase(falta) + ".", true); return false; }
  const prevV = regsDe({ ronda:r, tipo:"valoracion", participanteId:S.yo.id })[0], prevP = regsDe({ ronda:r, tipo:"preguntas", participanteId:S.yo.id })[0];
  const rep = x => Object.assign({ paso:"—" }, x ? { reemplaza:x.id, version:(x.version || 1) + 1 } : {});
  registrar("valoracion", { semaforo:v.semaforo, ajuste:textoLimpio(v.ajuste), mejora:v.mejora }, rep(prevV));
  const pp = {}; ESC.preguntas.forEach(q => { pp[q.id] = q.tipo === "multi" ? (v[q.id] || []).slice() : q.tipo === "texto" ? textoLimpio(v[q.id], 800) : v[q.id]; if (textoLimpio(v[q.id + "cual"])) pp[q.id + "cual"] = textoLimpio(v[q.id + "cual"]); });
  registrar("preguntas", pp, rep(prevP));
  S.val = {};
  return true;
}
const valoracionHecha = ronda => regsDe({ ronda, tipo:"valoracion", participanteId:S.yo.id })[0] && regsDe({ ronda, tipo:"preguntas", participanteId:S.yo.id })[0];
function cerrarRonda() {
  const s = S.ses, r = s.rondaActual, rd = rondaAct(), t = ahora();
  if (rd.estado !== "valoracion" || !valoracionHecha(r)) return;
  rd.estado = "cerrada"; rd.cerrada = t;
  registrarConduccion("cierre_ronda", { ronda:r }, { paso:"—" });
  const sig = ESC.rondas[ESC.rondas.map(x => x.id).indexOf(r) + 1];
  if (sig) { s.rondaActual = sig.id; s.pasoActual = PASOS[0].id; }
  else { s.estado = "cerrada"; s.cerrada = t; S.etapa = "cierre"; }
  S.form = {}; S.val = {}; S.verTodo = false;
}

/* ---------- Consentimiento ---------- */
const varsTexto = () => Object.assign({}, CFG.estudio, { minutos:S.cuenta ? minutosEstimados(S.cuenta.a) : "" });
const plantilla = t => String(t == null ? "" : t).replace(/\{(\w+)\}/g, (m, k) => { const v = varsTexto()[k]; return v != null && v !== "" ? v : m; });
function datosLimpios() {
  const out = {}; if (S.cons.anonimo !== "no") return out;
  CONS.datos.forEach(d => { const v = textoLimpio(S.cons.datos[d.id], 200); if (v) out[d.id] = v; });
  return out;
}
function validarConsentimiento() {
  const falta = CONS.declaraciones.filter(d => d.req && !S.cons.decl[d.id]);
  if (falta.length) return "Para participar debe marcar las " + (falta.length === 1 ? "declaración que falta" : falta.length + " declaraciones que faltan") + ".";
  const datos = datosLimpios();
  if (Object.keys(datos).length && !S.cons.decl[CONS.declaracionDatos.id]) return "Si escribe sus datos, marque la autorización para tratarlos, o elija participar sin darlos.";
  if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) return "Revise el correo electrónico.";
  if (S.cons.resumen && !datos.correo) return "Para recibir el resumen escriba su correo, o desmarque esa opción.";
  return "";
}
function aceptarConsentimiento() {
  const err = validarConsentimiento(); if (err) { aviso(err, true); return false; }
  const datos = datosLimpios(), decl = {};
  CONS.declaraciones.forEach(d => { decl[d.id] = !!S.cons.decl[d.id]; });
  if (Object.keys(datos).length) decl[CONS.declaracionDatos.id] = true;
  const texto = [CONS.titulo].concat(CONS.info.map(i => i.t + ": " + plantilla(i.d)), CONS.adicional ? [plantilla(CONS.adicional)] : [], CONS.declaraciones.filter(d => decl[d.id]).map(d => d.t), decl[CONS.declaracionDatos.id] ? [CONS.declaracionDatos.t] : []);
  S.consent = { aceptado:true, t:ahora(), version:String(CONS.version), declaraciones:decl, anonimo:!Object.keys(datos).length, datos, resumen:!!(S.cons.resumen && datos.correo), texto };
  if (!S.ses) S.ses = nuevaSesion();
  S.etapa = "simulacion"; S.abierto = ahora();
  return true;
}

/* ---------- Documento de respuestas y entrega ---------- */
function documentoRespuesta() {
  const a = avance(), s = S.ses;
  const doc = {
    instrumento:INSTRUMENTO, formato:FORMATO, version:VERSION,
    estudio:{ id:CFG.estudio.id, titulo:CFG.estudio.titulo, configuracion:CFG.generado },
    cuenta:{ usuario:S.cuenta.u, actor:S.cuenta.a, prueba:!!S.cuenta.p, demo:!!CFG.demo },
    participante:{ id:S.yo.id, anonimo:S.consent.anonimo, datos:S.consent.datos, resumen:S.consent.resumen },
    consentimiento:{ aceptado:true, t:S.consent.t, version:S.consent.version, declaraciones:S.consent.declaraciones, texto:S.consent.texto },
    estado:s.estado === "cerrada" ? "completa" : "parcial",
    avance:{ ronda:s.rondaActual, paso:s.estado === "cerrada" ? null : s.pasoActual, hechas:a.hechas, total:a.total },
    escenario:ESC.id, sesion:clone(s), registros:clone(S.regs),
    generado:new Date().toISOString()
  };
  doc.huella = huellaDoc(doc);
  return doc;
}
const nombreArchivo = () => (S.ses && S.ses.estado === "cerrada" ? "respuestas-" : "avance-") + S.cuenta.u + "-" + fechaArchivo() + ".json";
async function llamarServidor(cuerpo, plazoMs) {
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null, t = ctl ? setTimeout(() => ctl.abort(), plazoMs || 20000) : null;
  try {
    const r = await fetch(CFG.envio.url, { method:"POST", headers:{ "Content-Type":"text/plain;charset=UTF-8" }, body:JSON.stringify(Object.assign({ clave:CFG.envio.clave }, cuerpo)), cache:"no-store", credentials:"same-origin", signal:ctl ? ctl.signal : undefined });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j || j.ok !== true) throw new Error((j && j.error) || (r.ok ? "respuesta no reconocida del servidor" : "el servidor respondió " + r.status));
    return j;
  } catch (e) {
    throw new Error(e && e.name === "AbortError" ? "el servidor no respondió a tiempo" : e && e.name === "TypeError" ? "no hay conexión con el servidor" : String((e && e.message) || e));
  } finally { if (t) clearTimeout(t); }
}
let enviando = null;
// Envía el documento completo; cada envío reemplaza al anterior del mismo participante.
async function enviar(silencioso) {
  if (!CFG.envio || !S.consent || !S.ses) return false;
  if (enviando) { await enviando.catch(() => {}); }
  const cuenta = S.cuenta.u, doc = documentoRespuesta();
  if (!silencioso) { S.envio = { estado:"enviando", t:ahora() }; render(); }
  enviando = llamarServidor({ accion:"guardar", documento:doc, reanudar:S.cuenta.r || "" });
  try {
    await enviando;
    if (!S.cuenta || S.cuenta.u !== cuenta) return true;
    S.envio = { estado:"enviado", t:ahora(), registros:doc.registros.length, completa:doc.estado === "completa" };
  } catch (e) {
    if (!S.cuenta || S.cuenta.u !== cuenta) return false;
    S.envio = { estado:"error", t:ahora(), error:String((e && e.message) || e) };
  } finally { enviando = null; }
  guardarLocal(); render();
  return S.envio.estado === "enviado";
}
const envioProgresivo = () => { if (CFG.envio && CFG.envio.modo === "progresivo") enviar(true); };
// Hay algo por enviar: nunca se envió, falló, o hay registros posteriores al último envío.
const envioPendiente = () => !!(CFG.envio && S.cuenta && S.consent && S.ses && (S.envio.estado !== "enviado" || S.envio.registros !== S.regs.length));
// Reintento automático: al volver la conexión y cada minuto mientras quede algo por enviar.
function reintentarEnvio() { if (enLinea && !enviando && CFG.envio && CFG.envio.modo === "progresivo" && envioPendiente()) enviar(true); }
// Retiro: borra lo guardado en este dispositivo y pide al servidor eliminar lo enviado. Devuelve si el servidor lo confirmó.
async function retirar() {
  const u = S.cuenta.u, pid = S.yo && S.yo.id; let servidor = null;
  if (CFG.envio && S.consent && pid) { try { await llamarServidor({ accion:"retirar", estudio:CFG.estudio.id, usuario:u, participante:pid }, 10000); servidor = true; } catch (e) { servidor = false; } }
  borrarLocal(u); recordarSesion("");
  S = estadoInicial(); S.etapa = "retirado"; S.retiroServidor = servidor;
}

/* ---------- Avisos ---------- */
let avisoT = null;
function aviso(t, err) { S.msg = t || ""; S.msgErr = !!err; render(); clearTimeout(avisoT); if (t) avisoT = setTimeout(() => { S.msg = ""; render(); }, err ? 7000 : 4500); }
