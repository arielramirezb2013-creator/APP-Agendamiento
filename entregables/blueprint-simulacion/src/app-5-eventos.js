/* ============ Render principal ============ */
function render() { const vk = [S.rol, S.fsub, S.verTodo, S.code, S.ses && S.ses.pasoActual, S.ses && S.ses.rondaActual, S.ses && S.ses.estado, S.yo && S.yo.id, S.form.rectificando, S.previewId, S.previewSplit].join("|"); const changed = vk !== S.lastView; renderInner(); if (S.pendingRender) return; S.lastView = vk; if (changed) { const v = $("vista").el; v.classList.add("enter"); clearTimeout(S.enterT); S.enterT = setTimeout(() => v.classList.remove("enter"), 700); } }
function renderInner() {
  const ae = document.activeElement; const enCampo = ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName) && ae.closest("#vista") && ae.type !== "checkbox" && !/^(e-|n-)/.test(ae.getAttribute("data-in") || "");
  const ses = S.ses || {}; const pasoK = S.ses ? [S.code, ses.rondaActual, ses.pasoActual].join("|") : ""; const ctxK = S.ses ? pasoK + "|" + ses.estado + "|" + (((ses.rondas || {})[ses.rondaActual] || {}).estado || "") : "";
  const cambioCtx = S.rol === "participante" && S.ctxK !== undefined && ctxK !== S.ctxK;
  if (S.rol === "participante" && S.pasoK !== undefined && pasoK !== S.pasoK) { if (Object.keys(S.form).length) S.msg = "El facilitador cambió de paso: lo que tenía a medio responder no se guardó. Responda el paso actual."; S.form = {}; if ((pasoK.split("|")[1] || "") !== ((S.pasoK || "").split("|")[1] || "")) S.val = {}; }
  S.pasoK = pasoK; S.ctxK = ctxK;
  if (enCampo && !cambioCtx) { S.pendingRender = true; document.body.setAttribute("data-rol", S.rol || "entrada"); renderTop(); return; }
  S.pendingRender = false; const fk = ae && ae.tagName === "BUTTON" && ae.closest("#vista,#top,#appright") ? { a:ae.getAttribute("data-act"), g:ae.getAttribute("data-arg") } : null; setTimeout(() => { if (fk && document.activeElement === document.body) { const el = document.querySelector(`[data-act="${fk.a}"]${fk.g ? `[data-arg="${fk.g}"]` : ""}`); if (el) el.focus({ preventScroll:true }); } }, 0); document.body.setAttribute("data-rol", S.rol || "entrada"); renderTop();
  if (S.rol === "entrada" || !S.code) return renderEntrada();
  if (S.cargando && !S.ses) { $("vista").innerHTML = `<div class="card"><p><span class="spinner"></span>Cargando la sesión ${esc(S.code)}…</p></div>`; return; }
  if (!S.ses) { $("vista").innerHTML = `<div class="card"><p class="msg err">${esc(S.error || "Sesión no encontrada.")}</p><button type="button" class="btn sec" data-act="salir">Volver</button></div>`; return; }
  if (S.rol === "facilitador") return renderFac();
  if (S.rol === "resultados") { $("vista").innerHTML = renderResultados(); return; }
  if (S.rol === "participante" && S.yo) return renderPart();
  return renderElegir();
}
document.addEventListener("focusout", () => { if (S.pendingRender) setTimeout(() => { if (S.pendingRender && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) render(); }, 150); });
setInterval(() => { if (S.rol === "facilitador" && !S.pendingRender) render(); }, 30000);

/* ============ Acciones del participante ============ */
async function guardarActividad() {
  const s = S.ses, p = pasoActual(), modo = (rondaDef(s.rondaActual) || {}).modo || "actual", act = actividadDe(p, S.yo.actor, modo), f = S.form;
  const falta = validarForm(act); if (falta.length) return aviso("Falta completar: " + falta.join(", ") + ".", true);
  const payload = { tipo:act.tipo, obs:(f.obs || "").trim() || null };
  if (act.tipo === "decide") { Object.assign(payload, { suficiencia:f.suficiencia, falta:f.suficiencia === "suficiente" ? [] : (f.falta || []), finalidad:f.finalidad, decision:f.decision, responde:f.responde, dias:num(f.dias), notifica:f.notifica || [] }); payload.comprobacion = comprobarFinalidad(S.yo.actor, f.finalidad, ESC.entradas[p.id] || []); }
  if (act.tipo === "custodia") Object.assign(payload, { respuesta:f.respuesta, dias:num(f.dias) });
  if (act.tipo === "focal") Object.assign(payload, { sabe:f.sabe, responde:f.responde, dias:num(f.dias), hizo:f.hizo || [] });
  if (act.tipo === "soporte") Object.assign(payload, { ve:f.ve, accion:f.accion });
  const previo = f.rectificando ? regsDe({ ronda:s.rondaActual, paso:p.id, tipo:"actividad", participanteId:S.yo.id })[0] : null;
  const reg = await registrar("actividad", payload, previo ? { reemplaza:previo.id, version:(previo.version || 1) + 1 } : {});
  // Efectos simulados del sistema, identificados como tales
  if (act.tipo === "decide") {
    if (modo === "actual" && payload.suficiencia !== "suficiente" && payload.falta.length) { const porCust = {}; payload.falta.forEach(k => { const c = EV[k].cust; (porCust[c] = porCust[c] || []).push(k); }); for (const c of Object.keys(porCust)) if (c !== S.yo.actor) await registrarSistema("solicitud", { de:S.yo.actor, a:c, piezas:porCust[c], finalidad:payload.finalidad, autorizada:payload.comprobacion.finalidadAutorizada, origenActividad:reg.id, simulado:true }); }
    if (modo === "propuesto") { for (const k of ESC.entradas[p.id] || []) { const perm = payload.comprobacion.piezasPermitidas[k]; await registrarSistema("consulta", { origenActividad:reg.id, de:S.yo.actor, a:EV[k].cust, pieza:k, campos:perm || [], denegada:!perm, motivo:perm ? "" : (payload.comprobacion.finalidadAutorizada ? "pieza fuera de su contrato" : "finalidad no autorizada"), simulado:true }); }
      if (payload.notifica.length) { await registrarSistema("notificacion", { origenActividad:reg.id, de:S.yo.actor, a:payload.notifica, acuse:true, simulado:true }); for (const a of payload.notifica) await registrarSistema("acuse", { origenActividad:reg.id, de:a, a:S.yo.actor, simulado:true, nota:"acuse generado por el módulo simulado" }); } }
    if (modo === "actual" && payload.responde) await registrarSistema("notificacion", { origenActividad:reg.id, de:S.yo.actor, a:[], acuse:false, simulado:true, nota:"funcionamiento actual: notificación sin acuse" });
  }
  if (act.tipo === "custodia") { const sol = regsDe({ ronda:s.rondaActual, paso:p.id, tipo:"solicitud" }).filter(r => r.payload.a === S.yo.actor); for (const r of sol) await registrarSistema("respuesta", { solicitud:r.id, de:S.yo.actor, a:r.payload.de, respuesta:payload.respuesta, dias:payload.dias, origenActividad:reg.id }); }
  if (payload.obs) await registrar("observacion", { texto:payload.obs, origenActividad:reg.id });
  S.form = {}; aviso("Guardado: registro " + reg.id + " a las " + hora(reg.t) + (previo ? " (rectificación; la anterior queda en el historial)" : "") + ".");
}
async function guardarValoracion() {
  const v = S.val, s = S.ses; if (!v.semaforo) return aviso("Falta la valoración del contrato.", true); if (v.semaforo === "rechazar" && !(v.ajuste || "").trim()) return aviso("Si rechaza el contrato, escriba qué cambiaría.", true); if (!v.mejora) return aviso("Falta la percepción frente a hoy.", true);
  const faltaP = ESC.preguntas.filter(q => q.tipo === "texto" ? !(v[q.id] || "").trim() : q.tipo === "multi" ? !(v[q.id] || []).length : !v[q.id]).map(q => q.id); if (faltaP.length) return aviso("Falta responder " + faltaP.join(", ") + ".", true);
  const prevV = regsDe({ ronda:s.rondaActual, tipo:"valoracion", participanteId:S.yo.id })[0], prevP = regsDe({ ronda:s.rondaActual, tipo:"preguntas", participanteId:S.yo.id })[0];
  await registrar("valoracion", { semaforo:v.semaforo, ajuste:v.semaforo === "aceptar" ? "" : (v.ajuste || "").trim(), mejora:v.mejora }, Object.assign({ paso:"—" }, prevV ? { reemplaza:prevV.id, version:(prevV.version || 1) + 1 } : {}));
  const pp = {}; ESC.preguntas.forEach(q => { pp[q.id] = v[q.id] || (q.tipo === "multi" ? [] : ""); const visto = q.cual && (q.tipo === "multi" ? (v[q.id] || []).length && (v[q.id] || []).indexOf("ninguna") < 0 : v[q.id] && v[q.id] !== "si"); if (visto && v[q.id + "cual"]) pp[q.id + "cual"] = v[q.id + "cual"]; });
  await registrar("preguntas", pp, Object.assign({ paso:"—" }, prevP ? { reemplaza:prevP.id, version:(prevP.version || 1) + 1 } : {}));
  S.val = {}; aviso("Valoración y preguntas guardadas.");
}
/* ============ Acciones del facilitador ============ */
async function avanzar(justificacion) {
  const s = S.ses, pid = s.pasoActual, i = PIDX[pid], r = s.rondaActual; const patch = { rondas:{} }; patch.rondas[r] = { pasos:{} }; patch.rondas[r].pasos[pid] = { estado:"completado", completado:ahora(), excepcion:justificacion ? { texto:justificacion, quien:"Facilitador", t:ahora() } : null };
  const ultimo = i === PASOS.length - 1; if (ultimo) patch.rondas[r].estado = "valoracion"; else { patch.pasoActual = PASOS[i + 1].id; patch.rondas[r].pasos[PASOS[i + 1].id] = { estado:"en_curso", iniciado:ahora() }; }
  await actualizarSes(patch); await registrarFacilitador("avance", { de:pid, a:ultimo ? "valoracion" : PASOS[i + 1].id, excepcion:justificacion || null, condiciones:condicionesAvance(r, pid) }, { paso:pid });
  aviso(ultimo ? "Pasos terminados: los participantes pasan a la valoración." : "Paso " + PASOS[i + 1].id + " en curso." + (justificacion ? " Excepción registrada." : ""));
}
async function iniciarRonda(id) { const patch = { rondaActual:id, pasoActual:PASOS[0].id, estado:"en_curso", rondas:{} }; patch.rondas[id] = { estado:"en_curso", iniciada:ahora(), pasos:{} }; patch.rondas[id].pasos[PASOS[0].id] = { estado:"en_curso", iniciado:ahora() }; await actualizarSes(patch); await registrarFacilitador("inicio_ronda", { ronda:id }, { ronda:id, paso:PASOS[0].id }); S.fsub = "ejecutar"; aviso((rondaDef(id) || {}).n + " iniciada."); }

/* ============ Eventos ============ */
const enVuelo = {};
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act]"); if (!b || b.closest("[inert]")) return; const act = b.getAttribute("data-act"), arg = b.getAttribute("data-arg") || "", v = b.getAttribute("data-v") || "";
  const larga = /^(crear|entrar-|unirse|guardar|p-add|p-del|s-guardar|iniciar|pausar|reanudar|avanzar|cerrar-|incidencia|d-guardar|archivar)/.test(act); if (larga) { if (enVuelo[act]) return; enVuelo[act] = 1; }
  if (S.ses && ["cerrada", "archivada"].indexOf(S.ses.estado) >= 0 && /^(iniciar|iniciar-ronda|pausar|reanudar|avanzar|avanzar-exc|cerrar-ronda|p-add|incidencia)$/.test(act)) { if (larga) delete enVuelo[act]; return aviso("La sesión está " + S.ses.estado + ": ya no admite cambios.", true); }
  if (b.classList.contains("btn")) { b.classList.add("is-busy"); b.setAttribute("aria-busy", "true"); }
  try {
    if (act === "crear") { await crearSesion(); }
    else if (act === "entrar-part") { const e = S.entrada; const c = (e.code || "").trim().toUpperCase(); if (!/^[A-Z0-9]{4}$/.test(c)) return aviso("El código tiene 4 letras o números.", true); if (!(e.nombre || "").trim()) return aviso("Escriba su nombre.", true); if (!e.actor) return aviso("Elija el actor que representa.", true); abrirSesion(c, "elegir"); render(); clearInterval(S.esperaT); const esperar = S.esperaT = setInterval(() => { if (S.ses) { clearInterval(esperar); unirse(e.nombre, e.actor); } else if (S.error) clearInterval(esperar); }, 150); }
    else if (act === "unirse") { const e = S.entrada; if (!(e.nombre || "").trim() || !e.actor) return aviso("Escriba su nombre y elija el actor.", true); await unirse(e.nombre, e.actor); }
    else if (act === "entrar-fac") { const c = (S.entrada.code || "").trim().toUpperCase(); if (c.length !== 4) return aviso("Escriba el código de la sesión.", true); if (!(S.entrada.pin || "").trim()) return aviso("Escriba el PIN.", true); const snap = await refSes(c).get(); if (!snap.exists) return aviso("No existe la sesión " + c + ".", true); if (snap.data().pinHash !== hash(S.entrada.pin.trim())) return aviso("El PIN no coincide.", true); setFacAuth(c, true); S.fac = true; S.entrada.pin = ""; abrirSesion(c, "facilitador"); S.fsub = snap.data().estado === "preparacion" ? "preparar" : snap.data().estado === "en_curso" || snap.data().estado === "pausada" ? "ejecutar" : "cerrar"; }
    else if (act === "entrar-res") { const c = (S.entrada.code || "").trim().toUpperCase(); if (c.length !== 4) return aviso("Escriba el código de la sesión.", true); const snap = await refSes(c).get(); if (!snap.exists) return aviso("No existe la sesión " + c + ".", true); const d = snap.data(); if (!(d.estado === "cerrada" || d.estado === "archivada" || facAuth(c) || (S.entrada.pin && d.pinHash === hash(S.entrada.pin.trim())))) return aviso("Los resultados se abren cuando la sesión está cerrada, o con el PIN de facilitación.", true); abrirSesion(c, "resultados"); }
    else if (act === "salir") { if (S.code) setFacAuth(S.code, false); S.nuevo.pin = ""; S.entrada.pin = ""; cerrarSuscripciones(); clearInterval(latidoT); S.rol = "entrada"; S.code = null; S.ses = null; S.yo = null; S.fac = false; S.form = {}; S.val = {}; ponerHash({}); render(); }
    else if (act === "fsub") { S.fsub = arg; render(); }
    else if (act === "ver-todo") { S.verTodo = !S.verTodo; render(); }
    else if (act === "ver-part") { S.previewId = arg; S.fsub = "vista"; render(); }
    else if (act === "prev-sel") { S.previewId = arg; render(); }
    else if (act === "prev-split") { S.previewSplit = arg === "1"; render(); }
    else if (act === "print-informe") { if (!$("informe")) { const prev = S.fsub; S.fsub = "resultados"; render(); S.fsub = prev; } imprimirInforme(); render(); }
    else if (act === "sb-zoom") { const z = S.zoom || 1; if (arg === "fit") { const w = document.querySelector(".sb-wrap"), t = w && w.querySelector("table.sb"); const disp = w ? w.parentElement.clientWidth - 2 : 0; S.zoom = t && disp ? Math.max(0.35, Math.min(1, +((disp / (t.getBoundingClientRect().width / z))).toFixed(2))) : 1; } else S.zoom = arg === "in" ? Math.min(1.6, +(z + 0.1).toFixed(2)) : arg === "out" ? Math.max(0.35, +(z - 0.1).toFixed(2)) : 1; render(); }
    else if (act === "f") { S.form[arg] = S.form[arg] === v ? null : v; render(); }
    else if (act === "fm") { S.form[arg] = S.form[arg] || []; const i = S.form[arg].indexOf(v); if (i >= 0) S.form[arg].splice(i, 1); else S.form[arg].push(v); render(); }
    else if (act === "v") { S.val[arg] = S.val[arg] === v ? null : v; render(); }
    else if (act === "vm") { S.val[arg] = S.val[arg] || []; const i = S.val[arg].indexOf(v); if (i >= 0) S.val[arg].splice(i, 1); else S.val[arg].push(v); render(); }
    else if (act === "guardar") { await guardarActividad(); }
    else if (act === "guardar-obs") { if (!(S.form.obs || "").trim()) return aviso("Escriba la observación.", true); const r = await registrar("observacion", { texto:S.form.obs.trim() }); S.form = {}; aviso("Observación guardada (" + r.id + ")."); }
    else if (act === "rectificar") { S.form = { rectificando:true }; render(); } else if (act === "cancelar-rect") { S.form = {}; render(); }
    else if (act === "guardar-val") { await guardarValoracion(); }
    else if (act === "p-add") { const f = S.form; if (!(f.pNombre || "").trim() || !f.pActor) return aviso("Nombre y actor son obligatorios.", true); const id = uid(); await colPart(S.code).doc(id).set({ id, nombre:f.pNombre.trim(), actor:f.pActor, rol:"participante", creado:ahora(), ultimo:0, registradoPor:"facilitador" }); S.form.pNombre = ""; aviso("Participante añadido."); }
    else if (act === "p-del") { if (regsDe({ participanteId:arg }).length) return aviso("Este participante ya tiene registros; no se elimina para conservar la evidencia.", true); await colPart(S.code).doc(arg).delete(); aviso("Participante quitado."); }
    else if (act === "s-guardar") { const patch = {}; if ((S.form.sNombre || "").trim()) patch.nombre = S.form.sNombre.trim(); const pinN = (S.form.sPin || "").trim(); if (pinN && pinN.length < 4) return aviso("El PIN nuevo necesita al menos 4 caracteres; no se guardó nada.", true); if (pinN) patch.pinHash = hash(pinN); if (!Object.keys(patch).length) return aviso("Nada que guardar (el PIN necesita 4 caracteres).", true); await actualizarSes(patch); S.form.sPin = ""; aviso("Configuración guardada."); }
    else if (act === "iniciar") { if (!Object.keys(S.parts).length) return aviso("Registre al menos un participante antes de iniciar.", true); await iniciarRonda(ESC.rondas[0].id); }
    else if (act === "iniciar-ronda") { await iniciarRonda(arg); }
    else if (act === "pausar") { await actualizarSes({ estado:"pausada" }); await registrarFacilitador("pausa", {}); } else if (act === "reanudar") { await actualizarSes({ estado:"en_curso" }); await registrarFacilitador("reanudacion", {}); }
    else if ((act === "avanzar" || act === "avanzar-exc") && arg && arg !== S.ses.pasoActual) { return aviso("La sesión ya está en el paso " + S.ses.pasoActual + ": revise la pantalla antes de avanzar.", true); }
    else if (act === "avanzar") { if (!puedeAvanzar(S.ses.rondaActual, S.ses.pasoActual)) return aviso("Las condiciones de avance no se cumplen; use la excepción justificada.", true); await avanzar(null); }
    else if (act === "avanzar-exc") { if (!(S.form.just || "").trim()) return aviso("Escriba la justificación de la excepción.", true); await avanzar(S.form.just.trim()); S.form.just = ""; }
    else if (act === "cerrar-ronda") { const r = S.ses.rondaActual; const patch = { rondas:{} }; patch.rondas[r] = { estado:"cerrada", cerrada:ahora() }; const sig = ESC.rondas[ESC.rondas.map(x => x.id).indexOf(r) + 1]; if (!sig) patch.estado = "revision"; await actualizarSes(patch); await registrarFacilitador("cierre_ronda", { ronda:r, valoraciones:regsDe({ ronda:r, tipo:"valoracion" }).length }, { paso:"—" }); if (!sig) S.fsub = "revisar"; aviso("Ronda " + r + " cerrada." + (sig ? "" : " La sesión pasa a revisión.")); }
    else if (act === "incidencia") { if (!(S.form.inc || "").trim()) return aviso("Escriba la incidencia.", true); await registrarFacilitador("incidencia", { texto:S.form.inc.trim() }); S.form.inc = ""; aviso("Incidencia registrada."); }
    else if (act === "d-req-add") { const d = S.ses.decision || {}; S.form.reqs = (S.form.reqs || clone((d.requisitos || []).length ? d.requisitos : [{ texto:"", comprobacion:"" }])).concat([{ texto:"", comprobacion:"" }]); render(); }
    else if (act === "d-guardar") { const d = S.ses.decision || {}; const f = S.form; const dec = { quien:(f.dQuien != null ? f.dQuien : d.quien || "").trim(), evidencia:(f.dEvid != null ? f.dEvid : d.evidencia || "").trim(), condiciones:(f.dCond != null ? f.dCond : d.condiciones || "").trim(), requisitos:(f.reqs || d.requisitos || []).filter(q => (q.texto || "").trim() || (q.comprobacion || "").trim()), t:ahora() }; await actualizarSes({ decision:dec }); aviso("Decisión guardada."); }
    else if (act === "cerrar-sesion") { const c = estadoCierre(); if (!(c.cls === "ready" && c.decisionOk)) return aviso("No se puede cerrar: " + (c.faltas.concat(c.ajustes)[0] || "la decisión está incompleta"), true); await actualizarSes({ estado:"cerrada", cerrada:ahora() }); await registrarFacilitador("decision_final", { decision:S.ses.decision, evidencia:evidenciaResumen() }, { paso:"—" }); aviso("Sesión cerrada con decisión documentada."); }
    else if (act === "archivar") { if (S.confirmaArchivo !== S.code) { S.confirmaArchivo = S.code; return aviso("Archivar deja la sesión solo para consulta. Pulse «Archivar» otra vez para confirmar.", true); } S.confirmaArchivo = null; await actualizarSes({ estado:"archivada", archivada:ahora() }); await registrarFacilitador("archivo", {}, { paso:"—" }); aviso("Sesión archivada; la evidencia se conserva."); }
    else if (act === "csv") { if (!TABLAS[arg]) renderResultados(); await descargar("sesion-" + S.code + "-" + arg + ".csv", "﻿" + csvDe(arg), "text/csv"); }
    else if (act === "exp-csv-todo") { renderResultados(); const partes = Object.keys(TABLAS).map(k => "### " + k + "\r\n" + csvDe(k)).join("\r\n\r\n"); await descargar("sesion-" + S.code + "-tablas.csv", "﻿" + partes, "text/csv"); }
    else if (act === "exp-informe") { if (!$("informe")) { const prev = S.fsub; S.fsub = "resultados"; render(); S.fsub = prev; } const html = informeHtml(); render(); await descargar("informe-sesion-" + S.code + ".html", html, "text/html"); }
    else if (act === "exp-json") { await descargar("sesion-" + S.code + ".json", JSON.stringify(exportarJSON(), null, 2), "application/json"); }
    else if (act === "copy-json") { try { await navigator.clipboard.writeText(JSON.stringify(exportarJSON(), null, 2)); aviso("JSON copiado."); } catch (e) { aviso("No se pudo copiar.", true); } }
  } catch (e) { if (!S.msg) aviso("Error: " + (e && (e.message || e.code) || e), true); } finally { if (larga) delete enVuelo[act]; if (b.isConnected) { b.classList.remove("is-busy"); b.removeAttribute("aria-busy"); } }
});
document.addEventListener("input", ev => {
  const i = ev.target.closest("[data-in]"); if (!i) return; const k = i.getAttribute("data-in"), arg = i.getAttribute("data-arg") || "";
  const map = { "e-code":["entrada","code"], "e-code2":["entrada","code"], "e-nombre":["entrada","nombre"], "e-pin":["entrada","pin"], "n-nombre":["nuevo","nombre"], "n-pin":["nuevo","pin"], "f-dias":["form","dias"], "f-obs":["form","obs"], "f-just":["form","just"], "f-inc":["form","inc"], "p-nombre":["form","pNombre"], "s-nombre":["form","sNombre"], "s-pin":["form","sPin"], "v-ajuste":["val","ajuste"], "d-quien":["form","dQuien"], "d-evidencia":["form","dEvid"], "d-cond":["form","dCond"] };
  if (map[k]) { S[map[k][0]][map[k][1]] = i.value; if (k === "e-code") { const f = i.closest(".field"); if (f) f.classList.toggle("ok", i.value.trim().length === 4); } return; }
  if (k === "v-p") { S.val[arg] = i.value; return; }
  if (k === "d-req" || k === "d-comp") { const d = S.ses.decision || {}; S.form.reqs = S.form.reqs || clone(d.requisitos || [{ texto:"", comprobacion:"" }]); S.form.reqs[+arg] = S.form.reqs[+arg] || { texto:"", comprobacion:"" }; S.form.reqs[+arg][k === "d-req" ? "texto" : "comprobacion"] = i.value; return; }
  if (k === "rev-prop" || k === "rev-como" || k === "riesgo-mit") { clearTimeout(revT[k + arg]); revT[k + arg] = setTimeout(() => { const patch = { revision:{} }; if (k === "riesgo-mit") { patch.revision.riesgos = {}; patch.revision.riesgos[arg] = { mitigacion:i.value.trim() }; } else { patch.revision.observaciones = {}; patch.revision.observaciones[arg] = {}; patch.revision.observaciones[arg][k === "rev-prop" ? "propuesta" : "como"] = i.value.trim(); patch.revision.observaciones[arg].quien = "Facilitador"; patch.revision.observaciones[arg].t = ahora(); } actualizarSes(patch).catch(() => {}); }, 600); }
});
const revT = {};
document.addEventListener("change", async ev => {
  const i = ev.target.closest("[data-in]"); if (!i) return; const k = i.getAttribute("data-in"), arg = i.getAttribute("data-arg") || "";
  if (k === "e-actor") { S.entrada.actor = i.value; render(); return; } if (k === "p-actor") { S.form.pActor = i.value; return; }
  if (k === "f-finalidad" || k === "f-responde") { S.form[k.slice(2)] = i.value; return; }
  if (k === "f-falta" || k === "f-notifica") { const key = k.slice(2); S.form[key] = S.form[key] || []; const j = S.form[key].indexOf(arg); if (i.checked && j < 0) S.form[key].push(arg); if (!i.checked && j >= 0) S.form[key].splice(j, 1); return; }
  if (k === "rev-tipo") { const patch = { revision:{ observaciones:{} } }; patch.revision.observaciones[arg] = { tipo:i.value, quien:"Facilitador", t:ahora() }; await actualizarSes(patch); }
  if (k === "rev-comp") { const patch = { revision:{ observaciones:{} } }; patch.revision.observaciones[arg] = { comprobado:i.checked, quien:"Facilitador", t:ahora() }; await actualizarSes(patch); }
  if (k === "riesgo-aplica") { const patch = { revision:{ riesgos:{} } }; patch.revision.riesgos[arg] = { aplica:i.checked }; await actualizarSes(patch); }
});
document.addEventListener("submit", ev => ev.preventDefault());
window.addEventListener("hashchange", () => { const h = leerHash(); if (h.s && h.s.toUpperCase() !== S.code) entrarPorHash(h); });
function entrarPorHash(h) { const c = (h.s || "").toUpperCase(); if (!/^[A-Z0-9]{4}$/.test(c)) return; const yo = recuperarYo(c); if (yo && yo.id) { S.yo = yo; abrirSesion(c, "participante"); latido(); } else if (facAuth(c)) { S.fac = true; abrirSesion(c, "facilitador"); S.fsub = "ejecutar"; } else if (h.r === "1") { refSes(c).get().then(snap => { const d = snap.exists ? snap.data() : null; if (d && (d.estado === "cerrada" || d.estado === "archivada")) abrirSesion(c, "resultados"); else { S.entrada.code = c; ponerHash({}); aviso(d ? "Los resultados se abren cuando la sesión está cerrada, o con el PIN de facilitación." : "No existe la sesión " + c + ".", true); } }).catch(() => aviso("No se pudo leer la sesión.", true)); } else { S.entrada.code = c; abrirSesion(c, "elegir"); } }
(async function init() { if (!document.documentElement.lang) document.documentElement.lang = "es"; render(); try { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap"; document.head.appendChild(l); } catch (e) {} await initAlmacen(); render(); const h = leerHash(); if (h.s) entrarPorHash(h); render(); })();
})();

