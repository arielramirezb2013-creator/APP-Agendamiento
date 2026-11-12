/* ============ Estado de la vista y sesión ============ */
let S = { rol:"entrada", code:null, ses:null, parts:{}, regs:[], yo:null, fac:false, sub:"actividad", fsub:"preparar", cargando:false, error:"", msg:"", msgErr:false, form:{}, val:{}, entrada:{ code:"", nombre:"", actor:"", pin:"" }, nuevo:{ nombre:"Sesión 1", pin:"" }, verTodo:false, zoom:1, previewId:null, previewSplit:false, pendingRender:false };
let unsubs = [];
function leerHash() { const h = {}; location.hash.replace(/^#/, "").split("&").forEach(p => { const [k, v] = p.split("="); if (k) h[decodeURIComponent(k)] = decodeURIComponent(v || ""); }); return h; }
function ponerHash(o) { const s = Object.keys(o).filter(k => o[k] != null && o[k] !== "").map(k => k + "=" + encodeURIComponent(o[k])).join("&"); if (("#" + s) !== location.hash) history.replaceState(null, "", s ? "#" + s : location.pathname + location.search); }
function cerrarSuscripciones() { unsubs.forEach(u => { try { u(); } catch (e) {} }); unsubs = []; }
const memKey = c => "sbsim_yo_" + c;
function abrirSesion(code, rol) {
  cerrarSuscripciones(); S.code = code; S.rol = rol; S.ses = null; S.parts = {}; S.regs = []; S.cargando = true; S.error = "";
  unsubs.push(refSes(code).onSnapshot(snap => { S.cargando = false; if (!snap.exists) { S.error = "No existe una sesión con el código " + code + "."; S.ses = null; } else { S.ses = snap.data(); S.error = ""; } render(); }, e => { S.error = "No se pudo leer la sesión (" + e.code + ")."; S.cargando = false; render(); }));
  unsubs.push(colPart(code).onSnapshot(snap => { const o = {}; snap.docs.forEach(d => { if (d.exists) o[d.id] = d.data(); }); S.parts = o; render(); }, () => {}));
  unsubs.push(colReg(code).onSnapshot(snap => { S.regs = snap.docs.filter(d => d.exists).map(d => d.data()).sort((a, b) => (a.t || 0) - (b.t || 0)); render(); }, () => {}));
  ponerHash({ s:code, r:rol === "resultados" ? "1" : null });
}
function recordarYo() { try { sessionStorage.setItem(memKey(S.code), JSON.stringify(S.yo)); } catch (e) {} }
function recuperarYo(code) { try { return JSON.parse(sessionStorage.getItem(memKey(code)) || "null"); } catch (e) { return null; } }
function facAuth(code) { try { return sessionStorage.getItem("sbsim_fac_" + code) === "1"; } catch (e) { return false; } }
function setFacAuth(code, ok) { try { if (ok) sessionStorage.setItem("sbsim_fac_" + code, "1"); else sessionStorage.removeItem("sbsim_fac_" + code); } catch (e) {} }

/* ============ Escrituras ============ */
async function crearSesion() {
  const n = S.nuevo; if (!(n.pin || "").trim() || n.pin.trim().length < 4) return aviso("Escriba un PIN de facilitación de al menos 4 caracteres.", true);
  const code = nuevoCodigo(); const rondas = {}; ESC.rondas.forEach(r => { rondas[r.id] = { estado:"pendiente", pasos:{} }; });
  await refSes(code).set({ codigo:code, nombre:(n.nombre || "Sesión").trim(), escenario:ESC.id, estado:"preparacion", modalidad:MODALIDAD, creada:ahora(), pinHash:hash(n.pin.trim()), rondaActual:"R1", pasoActual:PASOS[0].id, rondas, revision:{ observaciones:{}, riesgos:{} }, decision:null, seq:0 });
  setFacAuth(code, true); S.fac = true; S.nuevo.pin = ""; abrirSesion(code, "facilitador"); S.fsub = "preparar"; aviso("Sesión " + code + " creada. Modalidad: " + (MODALIDAD === "compartida" ? "compartida (conexión verificada)" : "presencial, en este computador") + ".");
}
async function actualizarSes(patch) { if (!S.code) return; try { await refSes(S.code).update(patch); } catch (e) { aviso("No se pudo guardar (" + (e.code || e.message) + "). Revise la conexión e intente de nuevo.", true); throw e; } }
async function unirse(nombre, actor) {
  const id = uid(); const p = { id, nombre:nombre.trim(), actor, rol:"participante", creado:ahora(), ultimo:ahora() };
  try { await colPart(S.code).doc(id).set(p); } catch (e) { return aviso("No se pudo registrar su participación (" + (e.code || e.message) + ").", true); }
  S.yo = { id, nombre:p.nombre, actor }; recordarYo(); S.rol = "participante"; S.sub = "actividad"; latido(); render();
}
let latidoT = null; function latido() { clearInterval(latidoT); const tick = () => { if (S.rol === "participante" && S.yo) colPart(S.code).doc(S.yo.id).update({ ultimo:ahora() }).catch(() => {}); }; tick(); latidoT = setInterval(tick, 30000); }
function contexto() { const s = S.ses || {}; return { sesion:S.code, escenario:s.escenario || ESC.id, ronda:s.rondaActual, modo:(ESC.rondas.filter(r => r.id === s.rondaActual)[0] || {}).modo || "actual", paso:s.pasoActual }; }
async function registrar(tipo, payload, extra) {
  if (!extra || !extra.origen) { const s0 = S.ses || {}, rd0 = (s0.rondas || {})[s0.rondaActual] || {}; const enPasos = s0.estado === "en_curso" && rd0.estado === "en_curso"; const enVal = rd0.estado === "valoracion" || s0.estado === "revision";
    if (((tipo === "actividad" || tipo === "observacion") && !enPasos) || ((tipo === "valoracion" || tipo === "preguntas") && !enVal)) { aviso("La sesión cambió de estado (" + lozengeTxt(s0.estado === "en_curso" ? rd0.estado : s0.estado) + "): esta respuesta no se guardó.", true); throw { code:"estado", message:"estado" }; } }
  const c = contexto(); const id = uid(); const reg = Object.assign({ id, t:ahora(), sesion:c.sesion, escenario:c.escenario, ronda:c.ronda, modo:c.modo, paso:c.paso, dia:diaVirtual(c.ronda), origen:"participante", participanteId:S.yo ? S.yo.id : null, participanteNombre:S.yo ? S.yo.nombre : null, actor:S.yo ? S.yo.actor : null, tipo, payload:payload || {}, reemplaza:null, version:1 }, extra || {});
  try { await colReg(S.code).doc(id).set(reg); } catch (e) { aviso("No se pudo guardar el registro (" + (e.code || e.message) + "). Su respuesta sigue en pantalla: intente de nuevo.", true); throw e; }
  return reg;
}
async function registrarSistema(tipo, payload, extra) { return registrar(tipo, payload, Object.assign({ origen:"sistema", participanteId:null, participanteNombre:null, actor:null }, extra || {})); }
async function registrarFacilitador(tipo, payload, extra) { return registrar(tipo, payload, Object.assign({ origen:"facilitador", participanteId:null, participanteNombre:"Facilitador", actor:null }, extra || {})); }

/* ============ Derivaciones ============ */
function vigentes(regs) { const todos = regs || S.regs; const reemplazados = {}; todos.forEach(r => { if (r.reemplaza) reemplazados[r.reemplaza] = 1; });
  const vivos = todos.filter(r => !reemplazados[r.id] && !(r.payload && r.payload.origenActividad && reemplazados[r.payload.origenActividad])); const ids = {}; vivos.forEach(r => { ids[r.id] = 1; });
  return vivos.filter(r => !(r.tipo === "respuesta" && r.payload && r.payload.solicitud && !ids[r.payload.solicitud])); }
function regsDe(f) { return vigentes().filter(r => Object.keys(f).every(k => f[k] == null || r[k] === f[k])); }
function diaVirtual(ronda) { let d = ESC.dia0; vigentes().forEach(r => { if (r.ronda === ronda && r.tipo === "actividad" && r.payload) d += num(r.payload.dias); }); return d; }
function rondaDef(id) { return ESC.rondas.filter(r => r.id === id)[0]; }
function pasoActual() { return PASOS[PIDX[(S.ses || {}).pasoActual] || 0]; }
function estadoActividad(pid, actor, partId, ronda) {
  const s = S.ses || {}; ronda = ronda || s.rondaActual; const rd = (s.rondas || {})[ronda] || {}; const ps = (rd.pasos || {})[pid] || {}; const idx = PIDX[pid], cur = PIDX[s.pasoActual];
  const p = PASOS[idx], modo = (rondaDef(ronda) || {}).modo || "actual"; const act = actividadDe(p, actor, modo);
  const hecho = regsDe({ ronda, paso:pid, tipo:"actividad", participanteId:partId }).length > 0;
  if (hecho) return "completada";
  if (ps.estado === "completado" || idx < cur) return "omitida";
  if (idx > cur || rd.estado !== "en_curso") return "pendiente";
  if (s.estado === "pausada") return "bloqueada";
  if (act && act.tipo === "custodia" && modo === "actual" && !regsDe({ ronda, paso:pid, tipo:"solicitud" }).some(r => r.payload && r.payload.a === actor)) return "bloqueada";
  return "en_curso";
}
function participantesDe(actor) { return Object.values(S.parts).filter(p => p.actor === actor); }
function condicionesAvance(ronda, pid) {
  const p = PASOS[PIDX[pid]], modo = (rondaDef(ronda) || {}).modo || "actual", r = reglasDe(p, modo);
  return r.requeridos.map(a => { const ps = participantesDe(a); const hechos = ps.filter(x => regsDe({ ronda, paso:pid, tipo:"actividad", participanteId:x.id }).length); return { actor:a, participantes:ps.length, completadas:hechos.length, ok:ps.length > 0 && hechos.length > 0, motivo:ps.length === 0 ? "sin participante que represente a " + nomL(a) : hechos.length === 0 ? "actividad de " + nomL(a) + " sin completar" : "" }; });
}
function puedeAvanzar(ronda, pid) { return condicionesAvance(ronda, pid).every(c => c.ok); }
function comprobarFinalidad(actor, finId, piezas) { const f = FIN[finId]; const aut = !!(f && f.actores.indexOf(actor) >= 0); const ac = A[actor] || {}; const perm = {}, den = []; (piezas || []).forEach(pz => { if (EV[pz] && EV[pz].cust === actor) { perm[pz] = EV[pz].campos.map((_, i) => i); return; } const c = (ac.consulta || []).filter(x => x[0] === pz)[0]; if (!aut || !c || (ac.fuera || []).indexOf(pz) >= 0) den.push(pz); else perm[pz] = c[1]; }); return { finalidadAutorizada:aut, piezasPermitidas:perm, piezasDenegadas:den }; }
function desacuerdos(ronda) {
  const out = []; BP.actores.forEach(a => { const ps = participantesDe(a.id); if (ps.length < 2) return;
    PASOS.forEach(p => { const rs = ps.map(x => regsDe({ ronda, paso:p.id, tipo:"actividad", participanteId:x.id })[0]).filter(Boolean); if (rs.length >= 2) { const vals = rs.map(r => r.payload.decision || r.payload.sabe || r.payload.respuesta || r.payload.ve || ""); if (vals.some(v => v !== vals[0])) out.push({ tipo:"actividad", actor:a.id, paso:p.id, ronda, detalle:rs.map(r => r.participanteNombre + ": " + (vals[rs.indexOf(r)] || "—")).join(" · ") }); } });
    const vs = ps.map(x => regsDe({ ronda, tipo:"valoracion", participanteId:x.id })[0]).filter(Boolean); if (vs.length >= 2) { const sem = vs.map(v => v.payload.semaforo); if (sem.some(v => v !== sem[0])) out.push({ tipo:"valoracion", actor:a.id, paso:"—", ronda, detalle:vs.map(v => v.participanteNombre + ": " + v.payload.semaforo).join(" · ") }); } });
  return out;
}
function estadoCierre() {
  const s = S.ses || {}; const rondasCerradas = ESC.rondas.filter(r => ((s.rondas || {})[r.id] || {}).estado === "cerrada"); const faltas = [], ajustes = [];
  if (!rondasCerradas.length) faltas.push("Ninguna ronda está cerrada.");
  rondasCerradas.forEach(r => { ESC.requeridos.forEach(a => { const ps = participantesDe(a); if (!ps.length) { faltas.push(r.id + ": ningún participante representó a " + nomL(a) + "."); return; } if (!ps.some(x => regsDe({ ronda:r.id, tipo:"valoracion", participanteId:x.id }).length)) faltas.push(r.id + ": falta la valoración final de " + nomL(a) + "."); }); if (!regsDe({ ronda:r.id, tipo:"preguntas" }).length) faltas.push(r.id + ": nadie respondió las preguntas P1 a P4."); });
  const rev = s.revision || { observaciones:{}, riesgos:{} };
  vigentes().filter(r => r.tipo === "observacion").forEach(r => { const o = (rev.observaciones || {})[r.id] || {}; if (o.tipo === "conflicto" && !o.comprobado) ajustes.push("Conflicto de rol abierto (" + nom(r.actor) + ", " + r.paso + "): " + String((r.payload || {}).texto || "").slice(0, 60)); });
  ESC.riesgos.forEach(k => { const x = rev.riesgos[k.id] || {}; if (x.aplica && !(x.mitigacion || "").trim()) ajustes.push("Riesgo «" + k.t + "» marcado sin descripción de mitigación."); });
  vigentes().filter(r => r.tipo === "valoracion" && r.payload.semaforo === "rechazar" && !(r.payload.ajuste || "").trim()).forEach(r => ajustes.push("Rechazo de " + nom(r.actor) + " (" + r.participanteNombre + ") sin propuesta de solución."));
  const d = s.decision; const decisionOk = !!(d && (d.quien || "").trim() && (d.condiciones || "").trim() && (d.requisitos || []).some(q => (q.texto || "").trim() && (q.comprobacion || "").trim()));
  const cerrada = s.estado === "cerrada" || (s.estado === "archivada" && !!s.cerrada); let estado, cls; if (cerrada && decisionOk) { estado = "Cerrado con decisión documentada"; cls = "ok"; } else if (faltas.length) { estado = "Pendiente de evidencia"; cls = "wait"; } else if (ajustes.length) { estado = "Requiere ajustes"; cls = "adj"; } else { estado = "Listo para revisión del facilitador"; cls = "ready"; }
  return { estado, cls, faltas, ajustes, decisionOk, rondasCerradas:rondasCerradas.map(r => r.id) };
}
function indicadores(ronda) {
  const rs = vigentes().filter(r => r.ronda === ronda); const act = rs.filter(r => r.tipo === "actividad"); const dec = act.filter(r => r.payload.tipo === "decide");
  const suf = k => dec.filter(r => r.payload.suficiencia === k).length; const finNo = dec.filter(r => r.payload.comprobacion && !r.payload.comprobacion.finalidadAutorizada).length; const denegadas = dec.reduce((n, r) => n + ((r.payload.comprobacion || {}).piezasDenegadas || []).length, 0);
  const solic = rs.filter(r => r.tipo === "solicitud").length, resp = rs.filter(r => r.tipo === "respuesta").length, acuses = rs.filter(r => r.tipo === "acuse").length, sinAcuse = rs.filter(r => r.tipo === "notificacion" && !r.payload.acuse).length;
  const s = S.ses || {}; const rd = (s.rondas || {})[ronda] || {}; const pasos = Object.keys(rd.pasos || {}); const exc = pasos.filter(k => rd.pasos[k].excepcion).length; const reproc = dec.filter(r => r.payload.suficiencia !== "suficiente" && (r.payload.falta || []).length).length;
  const focal = act.filter(r => r.payload.tipo === "focal"); const mpSabe = focal.filter(r => r.payload.sabe === "si").length; const mpHizo = focal.reduce((n, r) => n + (r.payload.hizo || []).filter(x => x !== "nada").length, 0);
  return { registros:rs.length, actividades:act.length, decisiones:dec.length, suficiente:suf("suficiente"), parcial:suf("parcial"), insuficiente:suf("insuficiente"), finalidadesNoAutorizadas:finNo, piezasDenegadas:denegadas, solicitudes:solic, respuestas:resp, reprocesos:reproc, acusesSimulados:acuses, notificacionesSinAcuse:sinAcuse, pasosCompletados:pasos.filter(k => rd.pasos[k].estado === "completado").length, excepciones:exc, diaFinal:diaVirtual(ronda), diasVirtuales:diaVirtual(ronda) - ESC.dia0, mpSabe, mpFocal:focal.length, mpGestiones:mpHizo, desacuerdos:desacuerdos(ronda).length };
}
const FORMULAS = { suficiente:"decisiones con suficiencia «suficiente» ÷ decisiones registradas", finalidadesNoAutorizadas:"decisiones cuya finalidad declarada no está autorizada para el actor en el escenario", piezasDenegadas:"piezas solicitadas que el actor no puede consultar según su contrato", reprocesos:"decisiones con suficiencia parcial o insuficiente que señalan una pieza faltante", acusesSimulados:"acuses generados por el sistema (comportamiento simulado del módulo)", notificacionesSinAcuse:"notificaciones registradas sin acuse (funcionamiento actual)", excepciones:"pasos avanzados por el facilitador sin cumplir las condiciones", diasVirtuales:"suma de los días declarados en las actividades de la ronda", mpSabe:"actividades de M.P. donde declara saber qué pasa y quién responde ÷ actividades de M.P.", mpGestiones:"gestiones que M.P. declara haber hecho (llevar, ventanilla, llamar)", desacuerdos:"pares de representantes del mismo actor con decisiones o valoraciones distintas" };
const lozengeTxt = e => ({ pausada:"en pausa", cerrada:"cerrada", archivada:"archivada", valoracion:"en valoración", revision:"en revisión", preparacion:"en preparación", pendiente:"sin iniciar" }[e] || String(e || ""));
let avisoT = null; function aviso(t, err) { S.msg = t; S.msgErr = !!err; render(); clearTimeout(avisoT); avisoT = setTimeout(() => { S.msg = ""; render(); }, 4500); }

