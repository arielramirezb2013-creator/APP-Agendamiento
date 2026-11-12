/* ============ Panel del investigador: pintado, eventos e inicio ============ */

/* ---------- Pintado ---------- */
const claveVistaAdm = () => !UI.abierto ? "acceso" + (UI.acceso.pendiente ? ":copia" : ADMIN ? ":entrar" : ":crear") : UI.vista + (UI.ficha ? ":" + UI.ficha : "");
let vkAdm = null, pendienteAdm = false;
const enCampo = el => !!el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && ["checkbox", "radio", "button", "submit", "file"].indexOf(el.type) < 0));
const VISTAS_ADM = { estudios:vistaEstudios, estudio:vistaEstudio, cuentas:vistaCuentas, publicar:vistaPublicar, respuestas:vistaRespuestas, seguimiento:vistaSeguimiento, resultados:vistaResultadosPanel };
function render() {
  document.body.setAttribute("data-rol", "admin");
  document.body.setAttribute("data-vista", UI.abierto ? UI.vista : "acceso");
  renderTop();
  // La fila de momentos se desplaza si no caben todos: el momento abierto queda siempre a la vista.
  const act = document.querySelector('.stepper button[aria-pressed="true"]');
  if (act && act.scrollIntoView) { try { act.scrollIntoView({ block:"nearest", inline:"nearest" }); } catch (e) {} }
  const vk = claveVistaAdm() + (UI.dialogo ? "?" + UI.dialogo.id : ""), cambio = vk !== vkAdm, ae = document.activeElement, vista = $("vista");
  // Mientras se escribe en un campo no se repinta: se espera a que pierda el foco.
  if (!cambio && enCampo(ae) && vista.contains(ae)) { pendienteAdm = true; return; }
  pendienteAdm = false;
  const primera = vkAdm === null;
  let html;
  try { html = (UI.abierto ? (VISTAS_ADM[UI.vista] || vistaEstudio) : vistaAcceso)() + dialogoHtml(); }
  catch (e) { html = `<div class="hoja"><div class="card"><h1 tabindex="-1">${ico("estados-advertencia")}Ocurrió un error al pintar esta pantalla</h1><p>Su proyecto sigue guardado. Vuelva a otro momento del panel o recargue la página.</p><details data-det="fallo"><summary>Detalle técnico</summary><p class="mono">${esc(String((e && e.stack) || e))}</p></details><div class="row">${btn("ir", "estudio", "Ir a «Estudio»", "sec")}${btn("recargar", "", "Recargar la página", "outline", "acciones-reiniciar")}</div></div></div>`; }
  pintar("vista", html, !cambio);
  if (UI.foco) { const el = vista.querySelector(UI.foco); if (el) { try { el.focus({ preventScroll:true }); } catch (e) {} } UI.foco = ""; }
  if (!cambio) return;
  vkAdm = vk;
  if (UI.dialogo) { const b = vista.querySelector(".modal-caja input, .modal-caja .btn"); if (b) b.focus(); return; }
  if (primera) return;
  window.scrollTo(0, 0);
  const t = vista.querySelector("h1[tabindex='-1']"); if (t) { try { t.focus({ preventScroll:true }); } catch (e) {} }
  vista.classList.add("enter"); clearTimeout(render.t); render.t = setTimeout(() => vista.classList.remove("enter"), 700);
}
// Al soltar un campo se repinta: así se ven de inmediato las validaciones y lo que depende de lo escrito.
document.addEventListener("focusout", ev => {
  const campo = ev.target && ev.target.getAttribute && ev.target.getAttribute("data-in");
  if (!pendienteAdm && !campo) return;
  setTimeout(() => { if (!enCampo(document.activeElement)) render(); }, 80);
});

/* ---------- Ayudas de la interfaz ---------- */
const nombreArchivoAdm = (base, ext) => base + "-" + (PROY.estudio.id || "estudio") + "-" + fechaArchivo() + "." + ext;
async function bajar(nombre, datos, mime, aviso1) {
  const ok = await descargarArchivo(nombre, datos, mime);
  aviso(ok ? (aviso1 || "Archivo descargado.") : "No se descargó el archivo. Inténtelo de nuevo.", !ok);
  return ok;
}
async function copiarTexto(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
  try { const x = document.createElement("textarea"); x.value = t; x.setAttribute("readonly", ""); x.style.cssText = "position:fixed;left:-9999px;top:0"; document.body.appendChild(x); x.select(); const ok = document.execCommand("copy"); x.remove(); return ok; } catch (e) { return false; }
}
// Imprime un documento independiente sin salir del panel.
function imprimirDocumento(html, nombre) {
  const f = document.createElement("iframe");
  f.setAttribute("aria-hidden", "true"); f.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0";
  f.srcdoc = html; document.body.appendChild(f);
  f.onload = () => {
    try { f.contentWindow.focus(); f.contentWindow.print(); aviso("Se abrió el cuadro de impresión: elija «Guardar como PDF» si quiere un archivo."); }
    catch (e) { aviso("El navegador no permitió imprimir aquí: descargue el archivo y use Imprimir desde su visor.", true); }
    setTimeout(() => f.remove(), 120000);
  };
  f.onerror = () => { f.remove(); aviso("No se pudo preparar el documento para imprimir.", true); };
  return nombre;
}
function leerArchivos(lista, cuando) {
  const archivos = [].slice.call(lista || []);
  if (!archivos.length) { cuando([]); return; }
  let faltan = archivos.length; const out = [];
  archivos.forEach((f, i) => {
    if (f.size > MAX_ARCHIVO) { out[i] = { nombre:f.name, error:"el archivo es demasiado grande" }; if (!--faltan) cuando(out); return; }
    const fr = new FileReader();
    fr.onload = () => { out[i] = { nombre:f.name, texto:String(fr.result || "") }; if (!--faltan) cuando(out); };
    fr.onerror = () => { out[i] = { nombre:f.name, error:"no se pudo leer el archivo" }; if (!--faltan) cuando(out); };
    fr.readAsText(f);
  });
}
const abrirArchivo = id => { const i = $(id); if (i) { i.value = ""; i.click(); } };
function invitacionesHtml() {
  const e = estudioEfectivo();
  const css = "body{font:13px/19px 'Segoe UI',Roboto,Arial,sans-serif;color:#2D313F;margin:0;padding:12mm}h1{font-size:16px;color:#162546;margin:0 0 2mm}.inv{border:1px solid #DCDFE5;border-radius:6px;padding:6mm;margin:0 0 6mm;break-inside:avoid}.inv h2{font-size:14px;margin:0 0 2mm;color:#162546}pre{white-space:pre-wrap;font:inherit;margin:0}@page{size:A4;margin:0}";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Invitaciones · ${esc(e.titulo)}</title><style>${css}</style></head><body><h1>Invitaciones · ${esc(e.titulo)}</h1>${PROY.cuentas.map(q => `<div class="inv"><h2>${esc(nomL(q.a))} · ${esc(q.u)}${q.etiqueta ? " · " + esc(q.etiqueta) : ""}</h2><pre>${esc(textoInvitacion(q))}</pre></div>`).join("")}</body></html>`;
}

/* ---------- Acciones ---------- */
function entrarPanel(clave) {
  UI.abierto = true; UI.acceso = { c1:"", c2:"", ver:false, pendiente:null };
  recordarDesbloqueo(clave);
  if (PROY.entrega.forma === "servidor") prepararEntrega();
  render();
}
async function accederPanel() {
  const a = UI.acceso;
  if (ADMIN) {
    if (!claveAdminCorrecta(a.c1)) return aviso("La clave no coincide.", true);
    entrarPanel(a.c1); aviso("");
    return;
  }
  const err = definirClaveAdmin(a.c1, a.c2);
  if (err) return aviso(err, true);
  guardarProyecto(); entrarPanel(a.c1); aviso("Proyecto creado. Empiece por los datos del estudio.");
}
const COPIAS = {
  "clave-servidor":arg => (arg === "claveAdmin" ? PROY.entrega.claveAdmin : PROY.entrega.clave),
  "clave-cuenta":arg => (cuentaDe(arg) || {}).clave || "",
  "invitacion":arg => { const q = cuentaDe(arg); return q ? textoInvitacion(q) : ""; },
  "dialogo":() => (UI.dialogo && UI.dialogo.texto) || ""
};
const ACC = {
  /* acceso */
  "copia-elegir":() => abrirArchivo("copia-archivo"),
  "copia-elegir-panel":() => abrirArchivo("copia-archivo-panel"),
  "copia-cancelar":() => { UI.acceso.pendiente = null; render(); },
  "copia-restaurar":() => {
    const p = UI.acceso.pendiente; if (!p) return;
    if (!ADMIN) { const err = definirClaveAdmin(UI.acceso.c1, UI.acceso.c2); if (err) return aviso(err, true); }
    aplicarCopia(p); analisisMemo = null;
    entrarPanel(UI.acceso.c1 || null);
    aviso("Copia restaurada: " + plural(PROY.cuentas.length, "cuenta", "cuentas") + " y " + plural(RESP.length, "respuesta", "respuestas") + ".");
  },
  "proyecto-nuevo":() => { borrarProyecto(); render(); aviso("Puede empezar un proyecto nuevo."); },
  "bloquear":() => { recordarDesbloqueo(null); UI.abierto = false; UI.acceso = { c1:"", c2:"", ver:false, pendiente:null }; render(); },
  "recargar":() => location.reload(),
  "ir":arg => { if (VISTAS_ADM[arg]) { UI.vista = arg; UI.ficha = null; UI.importe = UI.importe && arg === "respuestas" ? UI.importe : null; render(); } },
  /* estudios (sesiones de simulación) */
  "est-abrir":arg => { if (abrirEstudio(arg)) { analisisMemo = null; UI.ficha = null; UI.importe = null; render(); aviso("Abrió «" + estudioEfectivo().titulo + "»."); } else aviso("Esa sesión no se pudo abrir.", true); },
  "est-nuevo":() => { const p = crearEstudio(UI.nuevoEstudio, null); UI.nuevoEstudio = ""; analisisMemo = null; UI.ficha = null; UI.importe = null; UI.vista = "estudio"; render(); aviso("Sesión creada. Complete los datos del estudio."); },
  "est-duplicar":arg => { crearEstudio(UI.nuevoEstudio, arg); UI.nuevoEstudio = ""; analisisMemo = null; UI.ficha = null; UI.importe = null; UI.vista = "estudio"; render(); aviso("Sesión duplicada con cuentas y contraseñas nuevas. Revise el identificador del estudio."); },
  "est-eliminar":arg => { UI.dialogo = { id:"est-eliminar", arg, texto:"", error:"" }; render(); },
  /* estudio */
  "entrega":(arg, v) => { PROY.entrega.forma = v === "servidor" ? "servidor" : "archivo"; prepararEntrega(); guardarProyecto(); render(); },
  "modo-envio":(arg, v) => { PROY.entrega.modo = v === "final" ? "final" : "progresivo"; guardarProyecto(); render(); },
  "ver-clave":arg => { UI.verClave[arg] = !UI.verClave[arg]; render(); },
  "clave-servidor-nueva":arg => { PROY.entrega[arg === "claveAdmin" ? "claveAdmin" : "clave"] = claveServidorNueva(); UI.verClave["srv-" + arg] = true; guardarProyecto(); render(); aviso("Clave generada. Descargue de nuevo los archivos en «Publicar»."); },
  "copiar":async (arg, v) => { const f = COPIAS[arg]; if (!f) return; const t = f(v); if (!t) return aviso("No hay nada que copiar.", true); aviso(await copiarTexto(t) ? "Copiado." : "No se pudo copiar: selecciónelo con el ratón.", false); },
  "probar-receptor":async () => {
    UI.prueba = { estado:"cargando", texto:"Hablando con el servidor…" }; render();
    try { const j = await probarReceptor(); UI.prueba = { estado:"ok", texto:"El receptor responde y puede guardar." + (typeof j.documentos === "number" ? " Tiene " + plural(j.documentos, "documento", "documentos") + "." : "") }; }
    catch (e) { UI.prueba = { estado:"mal", texto:"No respondió: " + String((e && e.message) || e) }; }
    render();
  },
  "clave-cambiar":() => { UI.cambio = { actual:"", c1:"", c2:"" }; UI.dialogo = { id:"clave-cambiar", error:"" }; render(); },
  "copia-exportar":() => bajar(nombreArchivoAdm("copia-panel", "json"), JSON.stringify(copiaSeguridad(), null, 1), "application/json", "Copia descargada. Guárdela como un documento confidencial."),
  "proyecto-borrar":() => { UI.dialogo = { id:"proyecto-borrar", texto:"", error:"" }; render(); },
  /* cuentas */
  "cuenta-crear":() => {
    const n = Math.max(1, Math.min(20, parseInt(UI.alta.n, 10) || 1)), rol = esRol(UI.alta.rol) ? UI.alta.rol : ROLES[0];
    let ultima = null; for (let i = 0; i < n; i++) ultima = crearCuenta(rol);
    guardarProyecto(); UI.foco = ultima ? '[data-in="q-etiqueta"][data-arg="' + ultima.u + '"]' : ""; render();
    aviso(plural(n, "cuenta creada", "cuentas creadas") + " para " + nomL(rol) + ".");
  },
  "cuenta-roles":() => { const n = crearPorRol(false); guardarProyecto(); render(); aviso(plural(n, "cuenta creada", "cuentas creadas") + ", una por rol."); },
  "cuenta-faltantes":() => { const n = crearPorRol(true); guardarProyecto(); render(); aviso(n ? plural(n, "cuenta creada", "cuentas creadas") + " para los roles que faltaban." : "Ya hay una cuenta por cada rol."); },
  "cuenta-clave":arg => { if (regenerarClave(arg)) { UI.verClave[arg] = true; guardarProyecto(); render(); aviso("Contraseña nueva. Envíela a esa persona y descargue de nuevo la configuración en «Publicar»."); } },
  "cuenta-eliminar":arg => { UI.dialogo = { id:"cuenta-eliminar", arg, error:"" }; render(); },
  "cuenta-invitacion":async arg => { const q = cuentaDe(arg); if (!q) return; aviso(await copiarTexto(textoInvitacion(q)) ? "Invitación copiada. Péguela en su correo." : "No se pudo copiar: use «Ver cómo queda».", false); },
  "invitacion-ver":arg => { const q = cuentaDe(arg); if (!q) return; UI.dialogo = { id:"invitacion-ver", arg, texto:textoInvitacion(q) }; render(); },
  "invitacion-restablecer":() => { PROY.invitacion = INVITACION_BASE; guardarProyecto(); render(); aviso("Texto restablecido."); },
  "cuentas-csv":() => bajar(nombreArchivoAdm("cuentas", "csv"), "﻿" + cuentasCsv(), "text/csv", "Hoja de cuentas descargada. Lleva las contraseñas: trátela como confidencial."),
  "invitaciones-imprimir":() => { imprimirDocumento(invitacionesHtml()); },
  /* publicar */
  "bajar-config":async () => {
    const imp = impedimentosPublicar(); if (imp.length) return aviso(imp[0], true);
    aviso("Calculando las huellas de las contraseñas…");
    const cfg = await configPublicable(false, (i, n) => { UI.msg = "Preparando la cuenta " + i + " de " + n + "…"; renderTop(); });
    anotarPublicado("config"); guardarProyecto();
    await bajar("configuracion.js", textoConfiguracion(cfg), "text/javascript", "configuracion.js descargado. Entréguelo a quien publica el sitio.");
    render();
  },
  "bajar-receptor":async () => {
    if (!RE_CLAVE_SERVIDOR.test(PROY.entrega.clave) || !PROY.entrega.claveAdmin) return aviso("Genere antes las dos claves del receptor en «Estudio».", true);
    PROY.receptorPublicado = { firma:firmaReceptor(), t:ahora() }; guardarProyecto();
    await bajar("recibir-config.php", textoReceptor(), "text/plain", "recibir-config.php descargado. Va junto a recibir.php en el sitio.");
    render();
  },
  "unico-elegir":() => { const imp = impedimentosPublicar(); if (imp.length) return aviso(imp[0], true); abrirArchivo("unico-archivo"); },
  /* respuestas */
  "resp-elegir":() => abrirArchivo("resp-archivo"),
  "resp-servidor":async () => {
    UI.servidor = { estado:"cargando", texto:"Pidiendo las respuestas al servidor…" }; render();
    try { const imp = await traerDelServidor(); analisisMemo = null; UI.servidor = { estado:"ok", texto:plural(imp.filas.length, "documento recibido", "documentos recibidos") + "." }; }
    catch (e) { UI.servidor = { estado:"mal", texto:"No se pudo: " + String((e && e.message) || e), formulario:true }; }
    render();
  },
  "resp-ficha":arg => { UI.ficha = arg; UI.fichaDesde = "respuestas"; UI.vista = "seguimiento"; render(); },
  "seg-ficha":arg => { UI.ficha = arg; UI.fichaDesde = "seguimiento"; render(); },
  "ficha-cerrar":() => { UI.vista = UI.fichaDesde === "respuestas" ? "respuestas" : "seguimiento"; UI.ficha = null; render(); },
  "resp-eliminar":arg => { UI.dialogo = { id:"resp-eliminar", arg, error:"" }; render(); },
  "resp-borrar-servidor":arg => { UI.dialogo = { id:"resp-borrar-servidor", arg, error:"" }; render(); },
  "resp-json":() => bajar(nombreArchivoAdm("respuestas", "json"), JSON.stringify(paqueteRespuestas(), null, 1), "application/json"),
  "resp-datos-csv":() => bajar(nombreArchivoAdm("datos-personales", "csv"), "﻿" + datosPersonalesCsv(), "text/csv", "Archivo descargado. Contiene datos personales: trátelo como confidencial."),
  "resp-ficha-json":arg => { const e = entradaDe(arg); if (e) bajar("respuesta-" + e.doc.cuenta.usuario + "-" + fechaArchivo() + ".json", JSON.stringify(e.doc, null, 1), "application/json"); },
  /* resultados */
  "csv":arg => bajar(nombreArchivoAdm("tabla-" + arg, "csv"), "﻿" + csvDeTabla(analisisActual(), arg), "text/csv"),
  "csv-todo":() => bajar(nombreArchivoAdm("tablas", "csv"), "﻿" + csvDeTodas(analisisActual()), "text/csv"),
  "informe-html":() => bajar(nombreArchivoAdm("informe", "html"), informeHtml(analisisActual(), estudioEfectivo()), "text/html"),
  "informe-imprimir":() => { imprimirDocumento(informeHtml(analisisActual(), estudioEfectivo())); },
  "datos-json":() => bajar(nombreArchivoAdm("datos-consolidados", "json"), JSON.stringify(datosConsolidados(docsIncluidos(), { cuentas:PROY.cuentas, estudio:estudioEfectivo() }), null, 1), "application/json"),
  /* diálogos */
  "dlg-no":() => { UI.dialogo = null; render(); },
  "dlg-si":async () => {
    const dl = UI.dialogo; if (!dl) return;
    if (dl.id === "proyecto-borrar") {
      if (normClave(dl.texto) !== "BORRAR") { dl.error = "Escriba BORRAR para confirmar."; return render(); }
      borrarProyecto(); analisisMemo = null; vkAdm = null; render(); aviso("El proyecto se borró de este navegador.");
      return;
    }
    if (dl.id === "clave-cambiar") {
      const c = UI.cambio;
      if (!claveAdminCorrecta(c.actual)) { dl.error = "La clave actual no coincide."; return render(); }
      const err = definirClaveAdmin(c.c1, c.c2); if (err) { dl.error = err; return render(); }
      guardarProyecto(); recordarDesbloqueo(c.c1); UI.cambio = { actual:"", c1:"", c2:"" }; UI.dialogo = null; render(); aviso("Clave cambiada.");
      return;
    }
    if (dl.id === "est-eliminar") {
      if (normClave(dl.texto) !== "ELIMINAR") { dl.error = "Escriba ELIMINAR para confirmar."; return render(); }
      eliminarEstudio(dl.arg); analisisMemo = null; UI.ficha = null; UI.importe = null; UI.dialogo = null; render(); aviso("Sesión eliminada.");
      return;
    }
    if (dl.id === "cuenta-eliminar") { eliminarCuenta(dl.arg); guardarProyecto(); UI.dialogo = null; render(); aviso("Cuenta quitada."); return; }
    if (dl.id === "resp-eliminar") { eliminarRespuesta(dl.arg); analisisMemo = null; UI.dialogo = null; render(); aviso("Respuesta quitada del panel."); return; }
    if (dl.id === "resp-borrar-servidor") {
      const e = entradaDe(dl.arg); if (!e) { UI.dialogo = null; return render(); }
      try { await borrarEnServidor(e); } catch (err) { dl.error = "El servidor no la borró: " + String((err && err.message) || err); return render(); }
      eliminarRespuesta(dl.arg); analisisMemo = null; UI.dialogo = null; render(); aviso("Respuesta borrada del servidor y del panel.");
      return;
    }
    UI.dialogo = null; render();
  }
};

/* ---------- Eventos ---------- */
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act]"); if (!b || b.disabled) return;
  const fn = ACC[b.getAttribute("data-act")]; if (!fn) return;
  const esBtn = b.classList.contains("btn");
  if (esBtn) { b.classList.add("is-busy"); b.setAttribute("aria-busy", "true"); }
  try { await fn(b.getAttribute("data-arg") || "", b.getAttribute("data-v") || ""); }
  catch (e) { aviso("Ocurrió un error: " + String((e && e.message) || e), true); }
  finally { if (esBtn && b.isConnected) { b.classList.remove("is-busy"); b.removeAttribute("aria-busy"); } }
});
let guardarT = null;
// Al escribir se guarda y se repinta: mientras el campo tenga el foco, render() aplaza el repintado hasta soltarlo.
const guardarLuego = () => { clearTimeout(guardarT); guardarT = setTimeout(() => { guardarProyecto(); render(); }, 600); };
document.addEventListener("input", ev => {
  const i = ev.target.closest("[data-in]"); if (!i || i.type === "checkbox" || i.type === "file") return;
  const k = i.getAttribute("data-in"), arg = i.getAttribute("data-arg") || "", v = i.value;
  if (k === "ac-c1") { UI.acceso.c1 = v; return; }
  if (k === "ac-c2") { UI.acceso.c2 = v; return; }
  if (k === "dlg-texto") { if (UI.dialogo) UI.dialogo.texto = v; return; }
  if (k === "dlg-actual" || k === "dlg-c1" || k === "dlg-c2") { UI.cambio[k.slice(4)] = v; return; }
  if (k === "alta-n") { UI.alta.n = v; return; }
  if (k === "est-titulo") { UI.nuevoEstudio = textoLimpio(v, 160); return; }
  if (k.indexOf("e-") === 0) {
    const campo = k.slice(2);
    if (campo === "url") PROY.url = textoLimpio(v, 300);
    else if (CAMPOS_ESTUDIO.indexOf(campo) >= 0) PROY.estudio[campo] = textoLimpio(v, LARGO_ESTUDIO[campo] || 160);
    else return;
  }
  else if (k === "en-url") PROY.entrega.url = textoLimpio(v, 200);
  else if (k === "c-version") PROY.consentimiento.version = textoLimpio(v, 20);
  else if (k === "c-adicional") PROY.consentimiento.adicional = textoLimpio(v, 2000);
  else if (k === "inv-texto") PROY.invitacion = String(v).slice(0, 4000);
  else if (k === "q-etiqueta") { const q = cuentaDe(arg); if (q) q.etiqueta = textoLimpio(v, 120); else return; }
  else if (k === "q-usuario") return;   // se aplica al salir del campo
  else return;
  guardarLuego();
});
document.addEventListener("change", async ev => {
  const i = ev.target.closest("[data-in]"); if (!i) return;
  const k = i.getAttribute("data-in"), arg = i.getAttribute("data-arg") || "";
  if (k === "ac-ver") { UI.acceso.ver = i.checked; return render(); }
  if (k === "alta-rol") { UI.alta.rol = i.value; return; }
  if (k === "ver-todas") { UI.verTodas = i.checked; return render(); }
  if (k === "q-prueba") { const q = cuentaDe(arg); if (q) { q.p = i.checked; guardarProyecto(); analisisMemo = null; render(); } return; }
  if (k === "q-usuario") {
    const r = renombrarCuenta(arg, i.value);
    if (r === true) { guardarProyecto(); analisisMemo = null; render(); aviso("Usuario cambiado. Descargue de nuevo la configuración en «Publicar»."); }
    else { render(); aviso(typeof r === "string" ? r : "No se pudo cambiar el usuario.", true); }
    return;
  }
  if (k === "incluir-pruebas") { PROY.incluirPruebas = i.checked; guardarProyecto(); analisisMemo = null; render(); return; }
  if (k === "resp-incluir") { const e = entradaDe(arg); if (e) { e.excluida = !i.checked; guardarRespuestas(); analisisMemo = null; render(); } return; }
  if (k === "copia-archivo") { const fs0 = [].slice.call(i.files); i.value = ""; leerArchivos(fs0, out => { const c = leerCopia(out[0] && out[0].texto || ""); if (c.error) return aviso(c.error, true); UI.acceso.pendiente = c; render(); }); return; }
  if (k === "copia-archivo-panel") { const fs0 = [].slice.call(i.files); i.value = ""; leerArchivos(fs0, out => { const c = leerCopia(out[0] && out[0].texto || ""); if (c.error) return aviso(c.error, true); const reemplazo = aplicarCopia(c); analisisMemo = null; UI.ficha = null; UI.importe = null; UI.vista = "estudio"; render(); aviso(reemplazo ? "Copia restaurada sobre la sesión «" + estudioEfectivo().titulo + "»." : "Copia restaurada como una sesión nueva."); }); return; }
  if (k === "resp-archivo") { const fs = [].slice.call(i.files); i.value = ""; leerArchivos(fs, out => { importarTextos(out, "archivo"); analisisMemo = null; render(); aviso("Importación terminada."); }); return; }
  if (k === "unico-archivo") {
    const fs = [].slice.call(i.files); i.value = "";
    UI.unico = { estado:"cargando", texto:"Preparando el archivo…" }; render();
    leerArchivos(fs, async out => {
      try {
        if (!out[0] || out[0].error) throw new Error(out[0] && out[0].error || "no se pudo leer el archivo");
        const cfg = await configPublicable(true, (a, b) => { UI.unico = { estado:"cargando", texto:"Preparando la cuenta " + a + " de " + b + "…" }; render(); });
        const html = simuladorUnico(out[0].texto, cfg);
        if (!html) throw new Error("ese archivo no es el simulador: elija simulador.html o el index.html del paquete");
        anotarPublicado("unico"); guardarProyecto();
        const ok = await descargarArchivo("simulador-" + (PROY.estudio.id || "estudio") + ".html", html, "text/html");
        UI.unico = ok ? { estado:"ok", texto:"Listo: el archivo trae sus " + plural(PROY.cuentas.length, "cuenta", "cuentas") + "." } : { estado:"mal", texto:"No se descargó el archivo." };
      } catch (e) { UI.unico = { estado:"mal", texto:String((e && e.message) || e) }; }
      render();
    });
    return;
  }
});
document.addEventListener("submit", ev => { ev.preventDefault(); if (ev.target.getAttribute("data-form") === "admin") accederPanel(); });
document.addEventListener("keydown", ev => {
  if (!UI.dialogo) return;
  if (ev.key === "Escape") { UI.dialogo = null; render(); return; }
  if (ev.key === "Tab") { const bs = [...document.querySelectorAll(".modal-caja button, .modal-caja input")]; if (!bs.length) return; const i = bs.indexOf(document.activeElement), n = ev.shiftKey ? (i <= 0 ? bs.length - 1 : i - 1) : (i === bs.length - 1 ? 0 : i + 1); ev.preventDefault(); bs[n].focus(); }
});
// Arrastrar archivos de respuestas sobre su zona.
document.addEventListener("dragover", ev => { const z = ev.target.closest("#zona-soltar"); if (!z) return; ev.preventDefault(); z.classList.add("sobre"); });
document.addEventListener("dragleave", ev => { const z = ev.target.closest("#zona-soltar"); if (z) z.classList.remove("sobre"); });
document.addEventListener("drop", ev => {
  const z = ev.target.closest("#zona-soltar"); if (!z) return;
  ev.preventDefault(); z.classList.remove("sobre");
  leerArchivos(ev.dataTransfer && ev.dataTransfer.files, out => { importarTextos(out, "archivo"); analisisMemo = null; render(); aviso("Importación terminada."); });
});
window.addEventListener("pagehide", () => { clearTimeout(guardarT); guardarProyecto(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) { clearTimeout(guardarT); guardarProyecto(); } });

(async function init() {
  if (!document.documentElement.lang) document.documentElement.lang = "es";
  cargarDeAlmacen();
  if (ADMIN && desbloqueoRecordado()) { UI.abierto = true; if (PROY.entrega.forma === "servidor") prepararEntrega(); }
  render();
  await initDescargas();
})();
