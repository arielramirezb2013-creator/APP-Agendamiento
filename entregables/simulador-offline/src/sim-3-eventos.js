/* ============ Simulador: pintado, eventos e inicio ============ */
const VISTAS = { acceso:vistaAcceso, orientacion:vistaOrientacion, consentimiento:vistaConsentimiento, rechazo:vistaRechazo, retirado:vistaRetirado, simulacion:vistaSimulacion, cierre:vistaCierre };
// Identifica la pantalla: al cambiar se lleva el foco al título y la página al inicio.
function claveVista() {
  if (falloGrave) return "fallo";
  if (S.buscando) return "buscando";
  if (S.retomar) return "retomar";
  if (S.etapa === "orientacion") return "orientacion:" + S.orient;
  if (S.etapa !== "simulacion" || !S.ses) return S.etapa;
  const s = S.ses, rd = rondaAct();
  const sub = rd.estado === "valoracion" ? (valoracionHecha(s.rondaActual) && !S.val.rectificando ? "hecha" : "form") : rd.estado === "en_curso" ? (bloqueActual().tipo === "actividad" && miActividad(s.rondaActual, s.pasoActual) && !S.form.rectificando ? "resultado" : "form") : "";
  return ["simulacion", s.rondaActual, rd.estado, s.pasoActual, sub].join(":");
}
let vkActual = null, pendiente = false;
const esCampoTexto = el => !!el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && ["checkbox", "radio", "button", "submit"].indexOf(el.type) < 0));
function render() {
  document.body.setAttribute("data-rol", "participante");
  document.body.setAttribute("data-etapa", S.etapa);
  renderTop();
  const vk = claveVista() + (S.confirmar ? "?" + S.confirmar : ""), cambio = vk !== vkActual, ae = document.activeElement, vista = $("vista");
  // Mientras se escribe no se repinta la pantalla: se espera a que el campo pierda el foco.
  if (!cambio && esCampoTexto(ae) && vista.contains(ae)) { pendiente = true; return; }
  pendiente = false;
  const primera = vkActual === null;
  let html;
  try { html = (falloGrave ? vistaFallo : S.buscando ? vistaBuscando : S.retomar ? vistaRetomar : VISTAS[S.etapa] || vistaAcceso)() + confirmarHtml(); }
  catch (e) { guardarLocal(); falloGrave = String((e && e.stack) || e); vkActual = "fallo"; html = vistaFallo(); }
  pintar("vista", html, !cambio);
  if (!cambio) return;
  vkActual = vk;
  if (S.confirmar) { const b = vista.querySelector(".modal-caja .btn"); if (b) b.focus(); return; }
  if (primera) return;
  window.scrollTo(0, 0);
  const t = vista.querySelector("h1[tabindex='-1'], #titulo-cierre"); if (t) { try { t.focus({ preventScroll:true }); } catch (e) {} }
  vista.classList.add("enter"); clearTimeout(render.t); render.t = setTimeout(() => vista.classList.remove("enter"), 700);
}
document.addEventListener("focusout", () => { if (pendiente) setTimeout(() => { if (pendiente && !esCampoTexto(document.activeElement)) render(); }, 120); });

/* ---------- Acciones ---------- */
let guardarT = null;
const guardarLuego = () => { clearTimeout(guardarT); guardarT = setTimeout(guardarLocal, 700); };
function acceder() {
  const b = $("btn-entrar"); if (b) { b.classList.add("is-busy"); b.disabled = true; }
  setTimeout(() => { try { entrar(); } finally { const x = $("btn-entrar"); if (x) { x.classList.remove("is-busy"); x.disabled = false; } } render(); }, 30);
}
function prellenar(pl) {
  const f = { rectificando:true };
  ["suficiencia", "finalidad", "decision", "responde", "respuesta", "sabe", "ve", "accion"].forEach(k => { if (pl[k] != null) f[k] = pl[k]; });
  ["falta", "notifica", "hizo"].forEach(k => { if (pl[k]) f[k] = pl[k].slice(); });
  if (pl.dias != null) f.dias = String(pl.dias);
  if (pl.obs) f.obs = pl.obs;
  return f;
}
function prellenarValoracion(ronda) {
  const val = regsDe({ ronda, tipo:"valoracion", participanteId:S.yo.id })[0], pre = regsDe({ ronda, tipo:"preguntas", participanteId:S.yo.id })[0], v = { rectificando:true };
  if (val) { v.semaforo = val.payload.semaforo; v.ajuste = val.payload.ajuste; v.mejora = val.payload.mejora; }
  if (pre) Object.keys(pre.payload).forEach(k => { v[k] = Array.isArray(pre.payload[k]) ? pre.payload[k].slice() : pre.payload[k]; });
  return v;
}
// Opciones que excluyen a las demás en una selección múltiple.
const EXCLUYE = { hizo:"nada", P3:"ninguna" };
function alternar(obj, k, v) {
  const a = (obj[k] || []).slice(), i = a.indexOf(v), ex = EXCLUYE[k];
  if (i >= 0) a.splice(i, 1);
  else if (ex && v === ex) { a.length = 0; a.push(v); }
  else { if (ex && a.indexOf(ex) >= 0) a.splice(a.indexOf(ex), 1); a.push(v); }
  obj[k] = a;
}
async function copiarTexto(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
  try { const x = document.createElement("textarea"); x.value = t; x.setAttribute("readonly", ""); x.style.cssText = "position:fixed;left:-9999px;top:0"; document.body.appendChild(x); x.select(); const ok = document.execCommand("copy"); x.remove(); return ok; } catch (e) { return false; }
}
const jsonRespuesta = () => JSON.stringify(documentoRespuesta(), null, 2);
const ACCIONES = {
  "demo-usar":arg => { if (!CFG.demo) return; S.acc.u = arg; S.acc.c = CFG.demo.clave; acceder(); },
  "orient":arg => {
    const n = parseInt(arg, 10) || 0;
    if (n >= GUION.orientacion.pasos.length) S.etapa = S.consent ? (S.ses && S.ses.estado === "cerrada" ? "cierre" : "simulacion") : "consentimiento";
    else { S.etapa = "orientacion"; S.orient = Math.max(0, n); }
    guardarLocal(); render();
  },
  "orient-ver":() => { S.retomar = null; S.etapa = "orientacion"; S.orient = 0; guardarLocal(); render(); },
  "retomar-continuar":() => { S.retomar = null; S.abierto = ahora(); render(); },
  "retomar-nuevo":() => { empezarDeNuevo(); render(); },
  "avance-elegir":() => { const i = $("avance-archivo"); if (i) i.click(); },
  "avance-descargar":async () => { const ok = await descargarArchivo(nombreArchivo(), jsonRespuesta(), "application/json"); if (ok) { S.descargado = ahora(); guardarLocal(); } aviso(ok ? "Archivo de avance descargado. Guárdelo: con él puede continuar en otro dispositivo." : "El navegador no permitió la descarga.", !ok); },
  "recargar":() => { guardarLocal(); location.reload(); },
  "c-anon":(arg, v) => { S.cons.anonimo = v; guardarLocal(); render(); },
  "consent-si":() => { if (aceptarConsentimiento()) { guardarLocal(); envioProgresivo(); aviso("Gracias. Su declaración quedó registrada."); } },
  "consent-no":() => { const u = S.cuenta.u; borrarLocal(u); salir(); S.etapa = "rechazo"; render(); },
  "volver-acceso":() => { S.etapa = "acceso"; render(); },
  "ronda-iniciar":() => { iniciarRonda(); guardarLocal(); render(); },
  "f":(arg, v) => { S.form[arg] = S.form[arg] === v ? null : v; guardarLocal(); render(); },
  "fm":(arg, v) => { alternar(S.form, arg, v); guardarLocal(); render(); },
  "v":(arg, v) => { S.val[arg] = S.val[arg] === v ? null : v; guardarLocal(); render(); },
  "vm":(arg, v) => { alternar(S.val, arg, v); guardarLocal(); render(); },
  "guardar":() => { const reg = guardarActividad(); if (reg) { guardarLocal(); envioProgresivo(); aviso("Respuesta guardada."); } },
  "rectificar":() => { const mio = miActividad(S.ses.rondaActual, S.ses.pasoActual); if (mio) { S.form = prellenar(mio.payload); render(); } },
  "cancelar-rect":() => { S.form = {}; guardarLocal(); render(); },
  "continuar":() => { avanzar(); guardarLocal(); envioProgresivo(); render(); },
  "guardar-val":() => { if (guardarValoracion()) { guardarLocal(); envioProgresivo(); aviso("Valoración y respuestas guardadas."); } },
  "val-rectificar":() => { S.val = prellenarValoracion(S.ses.rondaActual); render(); },
  "val-cancelar":() => { S.val = {}; guardarLocal(); render(); },
  "ronda-cerrar":() => { cerrarRonda(); guardarLocal(); render(); if (S.etapa === "cierre" && CFG.envio && CFG.envio.modo === "progresivo") enviar(false); },
  "ver-todo":() => { S.verTodo = !S.verTodo; render(); },
  "sb-zoom":arg => {
    const z = S.zoom || 1;
    if (arg === "fit") { const w = document.querySelector(".sb-wrap"), t = w && w.querySelector("table.sb"), disp = w ? w.parentElement.clientWidth - 2 : 0; S.zoom = t && disp ? Math.max(0.35, Math.min(1, +((disp / (t.getBoundingClientRect().width / z))).toFixed(2))) : 1; }
    else S.zoom = arg === "in" ? Math.min(1.6, +(z + 0.1).toFixed(2)) : arg === "out" ? Math.max(0.35, +(z - 0.1).toFixed(2)) : 1;
    render();
  },
  "enviar":async () => { const ok = await enviar(false); aviso(ok ? "Respuestas enviadas." : "No fue posible enviar. Reintente o descargue el archivo.", !ok); },
  "descargar":async () => { const ok = await descargarArchivo(nombreArchivo(), jsonRespuesta(), "application/json"); if (ok) { S.descargado = ahora(); guardarLocal(); aviso("Archivo descargado. Envíelo al investigador."); } else aviso("El navegador no permitió la descarga. Use «Copiar como texto».", true); },
  "compartir":async () => { try { await navigator.share({ files:[new File([jsonRespuesta()], nombreArchivo(), { type:"application/json" })], title:CFG.estudio.titulo, text:"Archivo de respuestas de la simulación" }); S.descargado = ahora(); guardarLocal(); aviso("Archivo compartido."); } catch (e) { if (!e || e.name !== "AbortError") aviso("No fue posible compartir. Descargue el archivo.", true); } },
  "copiar":async () => { const ok = await copiarTexto(jsonRespuesta()); aviso(ok ? "Respuestas copiadas. Péguelas en un correo para el investigador." : "No fue posible copiar. Descargue el archivo.", !ok); },
  "guardar-comentario":() => {
    const t = (S.comentario || "").trim(), prev = regsDe({ tipo:"observacion", participanteId:S.yo.id }).filter(r => r.payload.final)[0];
    if (!t && !prev) return aviso("Escriba el comentario.", true);
    registrar("observacion", { texto:t, final:true }, Object.assign({ paso:"—" }, prev ? { reemplaza:prev.id, version:(prev.version || 1) + 1 } : {}));
    if (S.envio.estado === "enviado") S.envio = { estado:"pendiente" };
    guardarLocal(); aviso("Comentario guardado."); envioProgresivo();
  },
  "salir":() => { S.confirmar = "salir"; render(); },
  "salir-si":() => { guardarLocal(); salir(); render(); aviso("Su avance quedó guardado en este dispositivo."); },
  "retirar":() => { S.confirmar = "retirar"; render(); },
  "retirar-si":async () => { await retirar(); render(); },
  "borrar":() => { S.confirmar = "borrar"; render(); },
  "borrar-si":() => { borrarLocal(S.cuenta.u); salir(); render(); aviso("Sus datos se borraron de este dispositivo."); },
  "confirmar-no":() => { S.confirmar = null; render(); }
};
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act]"); if (!b) return;
  const fn = ACCIONES[b.getAttribute("data-act")]; if (!fn) return;
  const esBtn = b.classList.contains("btn");
  if (esBtn) { b.classList.add("is-busy"); b.setAttribute("aria-busy", "true"); }
  try { await fn(b.getAttribute("data-arg") || "", b.getAttribute("data-v") || ""); }
  catch (e) { aviso("Ocurrió un error: " + ((e && e.message) || e), true); }
  finally { if (esBtn && b.isConnected) { b.classList.remove("is-busy"); b.removeAttribute("aria-busy"); } }
});
document.addEventListener("input", ev => {
  const i = ev.target.closest("[data-in]"); if (!i || i.type === "checkbox") return;
  const k = i.getAttribute("data-in"), arg = i.getAttribute("data-arg") || "";
  if (k === "a-u") S.acc.u = i.value; else if (k === "a-c") S.acc.c = i.value;
  else if (k === "c-dato") S.cons.datos[arg] = i.value;
  else if (k === "f-dias") S.form.dias = i.value; else if (k === "f-obs") S.form.obs = i.value;
  else if (k === "x-obs") S.ctxObs = i.value; else if (k === "x-comentario") S.comentario = i.value;
  else if (k === "v-ajuste") S.val.ajuste = i.value; else if (k === "v-p") S.val[arg] = i.value;
  else return;
  if (k !== "a-u" && k !== "a-c") guardarLuego();
});
document.addEventListener("change", ev => {
  const i = ev.target.closest("[data-in]"); if (!i) return;
  const k = i.getAttribute("data-in"), arg = i.getAttribute("data-arg") || "";
  if (k === "a-ver") { S.acc.ver = i.checked; render(); return; }
  if (k === "avance-archivo") { const f = i.files && i.files[0]; if (f) { const fr = new FileReader(); fr.onload = () => cargarAvance(String(fr.result || "")); fr.onerror = () => aviso("No se pudo leer el archivo.", true); fr.readAsText(f); } i.value = ""; return; }
  if (k === "c-decl") S.cons.decl[arg] = i.checked;
  else if (k === "c-resumen") S.cons.resumen = i.checked;
  else if (k === "f-finalidad" || k === "f-responde") S.form[k.slice(2)] = i.value;
  else if (k === "f-falta" || k === "f-notifica") { const key = k.slice(2), a = (S.form[key] || []).slice(), j = a.indexOf(arg); if (i.checked && j < 0) a.push(arg); if (!i.checked && j >= 0) a.splice(j, 1); S.form[key] = a; }
  else return;
  guardarLuego();
});
document.addEventListener("submit", ev => { ev.preventDefault(); if (ev.target.getAttribute("data-form") === "acceso") acceder(); });
document.addEventListener("keydown", ev => {
  if (!S.confirmar) return;
  if (ev.key === "Escape") { S.confirmar = null; render(); return; }
  if (ev.key === "Tab") { const bs = [...document.querySelectorAll(".modal-caja button")]; if (!bs.length) return; const i = bs.indexOf(document.activeElement), n = ev.shiftKey ? (i <= 0 ? bs.length - 1 : i - 1) : (i === bs.length - 1 ? 0 : i + 1); ev.preventDefault(); bs[n].focus(); }
});
// Dos pestañas con la misma cuenta: se toma la versión guardada más reciente.
window.addEventListener("storage", ev => {
  if (!S.cuenta || ev.key !== claveLocal(S.cuenta.u)) return;
  const d = cargarLocal(S.cuenta.u); if (!d || d.t <= S.guardado) return;
  PERSISTE.forEach(k => { if (d[k] !== undefined) S[k] = d[k]; }); S.guardado = d.t; render();
});
window.addEventListener("pagehide", () => { clearTimeout(guardarT); guardarLocal(); });
// Conexión: la simulación no la necesita para continuar; solo se reintenta el envío cuando vuelve.
window.addEventListener("online", () => { enLinea = true; render(); reintentarEnvio(); });
window.addEventListener("offline", () => { enLinea = false; render(); });
setInterval(reintentarEnvio, 60000);
// Error inesperado del navegador o de la página: se guarda de inmediato lo que haya en pantalla.
window.addEventListener("error", () => { try { guardarLocal(); } catch (e) {} });
window.addEventListener("unhandledrejection", () => { try { guardarLocal(); } catch (e) {} });
document.addEventListener("visibilitychange", () => { if (document.hidden) { clearTimeout(guardarT); guardarLocal(); } });

(async function init() {
  if (!document.documentElement.lang) document.documentElement.lang = "es";
  const m = /[#&]u=([^&]+)/.exec(location.hash || ""); if (m) { try { S.acc.u = decodeURIComponent(m[1]); } catch (e) {} }
  // Recarga de la página o cierre inesperado del navegador con la pestaña restaurada: se retoma sin pedir la contraseña.
  const u = CFG.ok ? sesionRecordada() : "";
  if (u) { const q = CFG.cuentas.filter(x => x.u === u)[0]; if (q && cargarLocal(u)) { abrirCuenta(q); S.retomar = null; } }
  render();
  reintentarEnvio();
  // En el sitio web, un service worker deja abrir la página sin conexión después de la primera visita.
  if (CFG.origen === "externa" && "serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(() => {});
  await initDescargas();
})();
