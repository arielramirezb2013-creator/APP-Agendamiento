/* ============ Panel del investigador: pantallas ============ */

/* ---------- Piezas comunes ---------- */
function optAdm(act, arg, ops, cur) {
  return `<div class="optrow">${ops.map(o => `<button type="button" data-act="${act}" data-arg="${esc(arg)}" data-v="${esc(o[0])}" aria-pressed="${String(cur) === String(o[0])}">${esc(o[1])}</button>`).join("")}</div>`;
}
const campoTexto = (clave, arg, valor, attrs) => `<input type="text" data-in="${esc(clave)}"${arg ? ` data-arg="${esc(arg)}"` : ""} value="${esc(valor == null ? "" : valor)}" ${attrs || ""}>`;
const btn = (act, arg, texto, clase, icono, extra) => `<button type="button" class="btn ${clase || "sec"}"${arg ? ` data-arg="${esc(arg)}"` : ""} data-act="${esc(act)}"${extra || ""}>${icono ? ico(icono, /\bsm\b/.test(clase || "") ? "sm" : null) : ""}${esc(texto)}</button>`;
const copiar = (clave, arg, etiqueta) => `<button type="button" class="btn sm outline" data-act="copiar" data-arg="${esc(clave)}" data-v="${esc(arg || "")}">${ico("acciones-copiar", "sm")}${esc(etiqueta || "Copiar")}</button>`;
// Archivo oculto: el botón lo abre. `multiple` y el tipo se fijan aquí.
const archivoOculto = (id, acepta, varios) => `<input type="file" id="${esc(id)}" data-in="${esc(id)}" accept="${esc(acepta)}"${varios ? " multiple" : ""} hidden>`;
const chipEstado = (cls, t, icono) => `<span class="chip ${cls}">${icono ? ico(icono, "sm") : ""}${esc(t)}</span>`;
const guia = (texto, icono) => `<div class="guia">${ico(icono || "navegacion-guia")}<div>${texto}</div></div>`;
const seccion = (titulo, icono, cuerpo, clase) => `<div class="card ${clase || ""}"><h2>${ico(icono)}${esc(titulo)}</h2>${cuerpo}</div>`;
const nada = t => `<p class="mini">${esc(t)}</p>`;
const MOMENTOS = [["estudios", "Estudios", "navegacion-sesiones"], ["estudio", "Estudio", "navegacion-configuracion"], ["cuentas", "Cuentas", "actores-participante"], ["publicar", "Publicar", "acciones-compartir-enlace"], ["respuestas", "Respuestas", "acciones-importar"], ["seguimiento", "Seguimiento", "administracion-revisar"], ["resultados", "Resultados", "investigacion-informe"]];

/* ---------- Barra superior ---------- */
function renderTop() {
  const msg = `<span class="msg ${UI.msgErr ? "err" : ""}" role="${UI.msgErr ? "alert" : "status"}">${UI.msg ? ico(UI.msgErr ? "estados-advertencia" : "estados-completado", "sm") : ""}${esc(UI.msg)}</span>`;
  if (!UI.abierto) {
    pintar("appright", `<span class="who"><span><b>Panel del investigador</b><small>${esc(GUION.estudio.programa)}</small></span></span>`);
    pintar("top", `<span class="sp"></span>${msg}`);
    return;
  }
  const e = estudioEfectivo();
  pintar("appright", `<span class="who"><span><b>${esc(e.titulo)}</b><small>${esc(PROY.estudio.id || "sin identificador")} · ${esc(plural(PROY.cuentas.length, "cuenta", "cuentas"))} · ${esc(plural(RESP.length, "respuesta", "respuestas"))}</small></span></span>${btn("bloquear", "", "Bloquear", "sm outline", "gobernanza-autenticacion")}`);
  const aviso = !ADM_ALM.local ? `<span class="badge sin-guardado">${ico("estados-advertencia", "sm")}Este navegador no guarda el proyecto: exporte una copia antes de cerrar</span>`
    : falloGuardar ? `<span class="badge sin-guardado">${ico("estados-advertencia", "sm")}No se pudo guardar ${esc(falloGuardar === "proyecto" ? "el proyecto" : "las respuestas")}: el almacenamiento puede estar lleno</span>`
    : PROY.modificado ? `<span class="hm guardado">${ico("estados-guardado", "sm")}Guardado · ${esc(hora(PROY.modificado))}</span>` : "";
  pintar("top", `<div class="stepper" role="tablist" aria-label="Momentos del panel">${MOMENTOS.map(m => `<button type="button" role="tab" aria-selected="${UI.vista === m[0]}" aria-pressed="${UI.vista === m[0]}" data-act="ir" data-arg="${m[0]}">${ico(m[2], "sm")}${esc(m[1])}</button>`).join("")}</div><span class="sp"></span>${aviso}${msg}`);
}

/* ---------- Acceso ---------- */
function vistaAcceso() {
  const a = UI.acceso, hay = !!ADMIN, p = a.pendiente;
  if (p) {
    return `<div class="hoja"><div class="card"><h1 tabindex="-1">${ico("acciones-importar")}Restaurar una copia de seguridad</h1>
      <p>La copia es del <b>${esc(fecha(p.generado) || "sin fecha")}</b>. Trae ${esc(plural(p.proyecto.cuentas.length, "cuenta", "cuentas"))} y ${esc(plural(p.respuestas.length, "respuesta", "respuestas"))}.</p>
      ${p.avisos.length ? `<div class="guia">${ico("estados-advertencia")}<div><b>Tenga presente</b><ul class="lista">${p.avisos.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>` : ""}
      ${hay ? `<p>Al restaurarla se reemplaza el proyecto que hay en este navegador. Su clave de administración no cambia.</p>` : `<p>Defina una clave de administración para este navegador. La copia no trae ninguna clave.</p>${formClaveNueva()}`}
      <div class="nav-row">${btn("copia-cancelar", "", "Cancelar", "outline", "acciones-cerrar")}<span class="sp"></span>${btn("copia-restaurar", "", "Restaurar la copia", "green", "acciones-importar")}</div></div></div>`;
  }
  const cuerpo = hay
    ? `<label>Clave de administración<input type="${a.ver ? "text" : "password"}" data-in="ac-c1" value="${esc(a.c1)}" autocomplete="current-password" autocapitalize="none" spellcheck="false"></label>
       <label class="check"><input type="checkbox" data-in="ac-ver" ${a.ver ? "checked" : ""}>Mostrar la clave</label>
       ${errHtmlAdm()}<button type="submit" class="btn" id="btn-admin">${ico("acciones-entrar")}Entrar al panel</button>`
    : `<p class="mini centro">Es la primera vez que abre el panel en este navegador. Defina una clave para proteger el proyecto.</p>${formClaveNueva()}${errHtmlAdm()}<button type="submit" class="btn" id="btn-admin">${ico("acciones-crear")}Crear el proyecto</button>`;
  return `<div class="auth-wrap"><form class="auth acceso" data-form="admin" novalidate><div class="auth-body">
      <div class="avatar xl">${ico("actores-facilitador")}</div>
      <h1 class="acceso-titulo" tabindex="-1">Panel del investigador</h1>
      <p class="mini centro">Simulación de la ruta de incapacidad · versión individual</p>
      ${cuerpo}
    </div><div class="auth-foot">
      <p class="mini">${hay ? "El proyecto está guardado en este navegador. La clave no se puede recuperar: si la olvidó, restaure una copia de seguridad." : "La clave protege la entrada al panel en este navegador. No cifra lo guardado."}</p>
      <button type="button" class="enlace" data-act="copia-elegir">${esc(hay ? "Restaurar una copia de seguridad" : "Ya tengo una copia de seguridad")}</button>${archivoOculto("copia-archivo", ".json,application/json")}
    </div></form></div>
    ${almacenDanado ? `<div class="hoja"><div class="card"><p class="msg err">${ico("estados-advertencia", "sm")}Lo guardado en este navegador no se pudo leer. Restaure una copia de seguridad o empiece un proyecto nuevo.</p>${btn("proyecto-nuevo", "", "Empezar un proyecto nuevo", "danger", "acciones-reiniciar")}</div></div>` : ""}
    ${!ADM_ALM.local ? `<div class="hoja"><div class="card"><p class="msg err">${ico("estados-advertencia", "sm")}Este navegador no permite guardar datos. Puede trabajar, pero el proyecto se pierde al cerrar la pestaña: exporte una copia de seguridad antes de salir.</p></div></div>` : ""}`;
}
const formClaveNueva = () => `<label>Clave nueva<input type="${UI.acceso.ver ? "text" : "password"}" data-in="ac-c1" value="${esc(UI.acceso.c1)}" autocomplete="new-password" autocapitalize="none" spellcheck="false"></label>
  <label>Repítala<input type="${UI.acceso.ver ? "text" : "password"}" data-in="ac-c2" value="${esc(UI.acceso.c2)}" autocomplete="new-password" autocapitalize="none" spellcheck="false"></label>
  <label class="check"><input type="checkbox" data-in="ac-ver" ${UI.acceso.ver ? "checked" : ""}>Mostrar las claves</label>`;
const errHtmlAdm = () => UI.msgErr && UI.msg ? `<p class="msg err en-linea" aria-hidden="true">${ico("estados-advertencia", "sm")}${esc(UI.msg)}</p>` : "";

/* ---------- Estudios: varias sesiones de simulación ---------- */
function vistaEstudios() {
  const lista = estudiosGuardados(), abierto = PROY.clave;
  const fila = f => {
    const es = f.clave === abierto, cuentas = es ? PROY.cuentas.length : f.cuentas, nr = es ? RESP.length : f.respuestas;
    const comp = es ? RESP.filter(e => e.doc.estado === "completa").length : f.completas;
    return `<tr${es ? ' class="abierto"' : ""}>
      <td><b>${esc(es ? estudioEfectivo().titulo : f.titulo || "Sin título")}</b>${es ? " " + chipEstado("ch-teal", "abierto", "estados-completado") : ""}<div class="mini mono">${esc((es ? PROY.estudio.id : f.id) || "sin identificador")}</div></td>
      <td class="num">${cuentas}</td>
      <td class="num">${nr}<div class="mini">${comp} ${esc(comp === 1 ? "completa" : "completas")}</div></td>
      <td class="nw mini">${esc(fecha(f.modificado || f.creado) || "—")}</td>
      <td class="nw acc">${es ? "" : btn("est-abrir", f.clave, "Abrir", "sm sec", "acciones-entrar")}${btn("est-duplicar", f.clave, "Duplicar", "sm outline", "acciones-copiar")}${lista.length > 1 || !es ? btn("est-eliminar", f.clave, "Eliminar", "sm outline", "acciones-eliminar") : ""}</td></tr>`;
  };
  const total = lista.reduce((n, f) => n + (f.clave === abierto ? RESP.length : f.respuestas), 0);
  return `<div class="hoja">
    ${guia("<b>Cada estudio es una sesión de simulación aparte,</b> con sus propias cuentas y las respuestas de sus participantes. Trabaje siempre con uno abierto; los demás quedan guardados en este navegador.", "navegacion-sesiones")}
    ${seccion("Sesiones de simulación guardadas", "navegacion-archivo-sesiones", `
      <div class="twrap"><table class="t"><thead><tr><th scope="col">Estudio</th><th scope="col" class="num">Cuentas</th><th scope="col" class="num">Respuestas</th><th scope="col">Última vez</th><th scope="col">Acciones</th></tr></thead><tbody>${lista.length ? lista.map(fila).join("") : fila(fichaEstudio())}</tbody></table></div>
      <p class="mini">${esc(plural(Math.max(lista.length, 1), "sesión guardada", "sesiones guardadas"))} · ${esc(plural(total, "respuesta en total", "respuestas en total"))}. Cada respuesta se guarda con su participación y su cuenta, así que dos personas del mismo rol no se mezclan.</p>`)}
    ${seccion("Crear otra sesión", "acciones-crear", `
      <p>Útil cuando repite la simulación con otro grupo, en otra entidad o en otro momento del proyecto. Cada sesión lleva su propio identificador, sus cuentas y sus respuestas.</p>
      <div class="row alta"><label class="campo" style="flex:1 1 280px">Título de la sesión nueva${campoTexto("est-titulo", "", UI.nuevoEstudio, 'maxlength="160" placeholder="Por ejemplo: Segunda ronda · otra entidad"')}</label>
        ${btn("est-nuevo", "", "Crear vacía", "", "acciones-crear")}${btn("est-duplicar", PROY.clave, "Duplicar la abierta", "sec", "acciones-copiar")}</div>
      <p class="mini">Al duplicar se copian los datos del estudio y sus cuentas, con contraseñas nuevas. Las respuestas no se copian.</p>`)}
    ${seccion("Cómo se diferencian", "investigacion-trazabilidad-accesos", `<ul class="lista">
      <li>Cada sesión tiene un <b>identificador propio</b> que viaja en la configuración y en cada respuesta: por él sabe el panel a qué sesión pertenece un archivo.</li>
      <li>Cada persona entra con su <b>usuario</b>, y cada recorrido queda con un <b>identificador de participación</b>. Si alguien recorre la simulación dos veces, verá las dos por separado.</li>
      <li>El receptor del servidor guarda un archivo por sesión, usuario y participación, así que tampoco se mezclan allí.</li>
      <li>Si importa aquí un archivo de otra sesión, el panel se lo dice y no lo suma a este análisis.</li></ul>`)}
  </div>`;
}

/* ---------- Estudio ---------- */
const CAMPOS_FORM = [
  { k:"id", n:"Identificador del estudio", ayuda:"Letras minúsculas, cifras, punto, guion o guion bajo. No lo cambie con el estudio en marcha: el navegador de cada participante guarda su avance con él." },
  { k:"titulo", n:"Título del estudio" }, { k:"subtitulo", n:"Subtítulo" },
  { k:"programa", n:"Programa" }, { k:"institucion", n:"Institución" },
  { k:"investigador", n:"Investigador responsable", ayuda:"Aparece en la declaración que lee el participante." },
  { k:"director", n:"Director de la investigación" },
  { k:"contacto", n:"Contacto para los participantes", ayuda:"Un correo o un teléfono al que puedan escribir." },
  { k:"comite", n:"Comité de ética y número de aprobación" },
  { k:"cierre", n:"Fecha límite para participar", ayuda:"Texto libre; aparece en la invitación." }
];
function vistaEstudio() {
  const e = PROY.estudio, en = PROY.entrega, idMal = String(e.id || "").trim() && !idEstudioValido();
  const campo = c => `<label class="campo${c.k === "id" && idMal ? " mal" : ""}">${esc(c.n)}${campoTexto("e-" + c.k, "", e[c.k], `maxlength="${LARGO_ESTUDIO[c.k] || 160}"${c.k === "id" ? ' autocapitalize="none" spellcheck="false"' : ""}`)}${c.ayuda ? `<span class="mini">${esc(c.ayuda)}</span>` : ""}${c.k === "id" && idMal ? `<span class="msg err">Solo letras minúsculas, cifras, punto, guion o guion bajo.</span>` : ""}</label>`;
  const url = `<label class="campo${urlInvalida() ? " mal" : ""}">Dirección pública del simulador${campoTexto("e-url", "", PROY.url, 'maxlength="300" placeholder="https://su-sitio.example/simulacion/" autocapitalize="none" spellcheck="false"')}<span class="mini">La carpeta del sitio donde se publicará el simulador. Se usa para armar las invitaciones y para hablar con el receptor.</span>${urlInvalida() ? `<span class="msg err">Escriba una dirección que empiece por https:// o http://</span>` : ""}</label>`;
  const srv = en.forma === "servidor" ? `
    <div class="sub">
      <label class="campo">Dirección del receptor${campoTexto("en-url", "", en.url, 'maxlength="200" autocapitalize="none" spellcheck="false"')}<span class="mini">Normalmente <span class="mono">recibir.php</span>, junto al simulador.${urlReceptor() ? " Dirección completa: " + esc(urlReceptor()) : " Escriba antes la dirección pública del simulador."}</span></label>
      <div class="campo"><span class="lbl">Cuándo se envían las respuestas</span>${optAdm("modo-envio", "", [["progresivo", "A medida que el participante avanza"], ["final", "Solo al terminar, cuando lo confirme"]], en.modo)}<span class="mini">${esc(en.modo === "final" ? "El participante decide cuándo enviar. Usted no ve el progreso hasta que lo haga." : "Usted ve el progreso de cada persona y puede retomarse desde otro dispositivo.")}</span></div>
      ${claveFila("clave", "Clave de envío", en.clave, "Va dentro de configuracion.js: la conocen todos los participantes. Solo frena el ruido de internet.")}
      ${claveFila("claveAdmin", "Clave de administración del servidor", en.claveAdmin, "Solo suya. Hace falta para traer o borrar respuestas del servidor. En el servidor queda únicamente su huella.")}
      <div class="row">${btn("probar-receptor", "", "Probar el receptor", "sec", "acciones-sincronizar")}${UI.prueba ? estadoLinea(UI.prueba) : ""}</div>
      <p class="mini">Para probarlo, el sitio ya debe tener <span class="mono">recibir.php</span> y el <span class="mono">recibir-config.php</span> que descargue en «Publicar».</p>
    </div>` : `<p class="mini">El participante descarga un archivo con sus respuestas al terminar y se lo envía a usted. Funciona en cualquier sitio, sin PHP.</p>`;
  return `<div class="hoja">
    ${guia("<b>Empiece por aquí.</b> Estos datos aparecen en la declaración que lee cada participante y en las invitaciones.")}
    ${seccion("Datos del estudio", "navegacion-escenario", `<div class="campos-grid">${CAMPOS_FORM.map(campo).join("")}</div>${url}`)}
    ${seccion("Declaración de participación voluntaria", "gobernanza-etica", `
      <p class="mini">El simulador trae un texto completo. Revíselo con su comité de ética antes de usarlo. Aquí puede añadir un párrafo propio y la versión del documento.</p>
      <div class="campos-grid"><label class="campo">Versión del texto${campoTexto("c-version", "", PROY.consentimiento.version, 'maxlength="20"')}<span class="mini">Queda registrada en cada respuesta.</span></label></div>
      <label class="campo">Párrafo adicional (opcional)<textarea data-in="c-adicional" maxlength="2000" rows="3" placeholder="Por ejemplo, el número de aprobación del comité o una aclaración de su institución.">${esc(PROY.consentimiento.adicional)}</textarea></label>
      <details data-det="cons-vista"><summary>Ver el texto que leerá el participante</summary>${textoConsentimientoHtml()}</details>`)}
    ${seccion("Cómo le llegan las respuestas", "acciones-importar", `${optAdm("entrega", "", [["archivo", "Por archivo: el participante me lo envía"], ["servidor", "Por servidor: llegan solas al sitio"]], en.forma)}${srv}`)}
    ${seccion("Copia de seguridad del proyecto", "gobernanza-custodia", `
      <p>La copia trae esta sesión: el estudio, sus cuentas con las contraseñas, la invitación y las respuestas importadas. <b>Guárdela como un documento confidencial.</b> No incluye la clave de este panel ni la clave de administración del servidor.</p>
      <p class="mini">Al restaurar una copia, si ya hay una sesión con el mismo identificador de estudio se reemplaza; si no, se añade como una sesión más.</p>
      <div class="row">${btn("copia-exportar", "", "Exportar una copia de esta sesión", "sec", "acciones-exportar")}${btn("copia-elegir-panel", "", "Restaurar una copia", "outline", "acciones-importar")}${archivoOculto("copia-archivo-panel", ".json,application/json")}<span class="sp"></span>${btn("clave-cambiar", "", "Cambiar la clave del panel", "outline", "gobernanza-autenticacion")}${btn("proyecto-borrar", "", "Borrar todo el panel de este navegador", "danger", "acciones-eliminar")}</div>`)}
  </div>`;
}
function claveFila(cual, titulo, valor, ayuda) {
  const visible = !!UI.verClave["srv-" + cual];
  return `<div class="campo clave-fila"><span class="lbl">${esc(titulo)}</span>
    <div class="row"><span class="mono clave-valor">${esc(visible ? valor || "sin generar" : valor ? "•".repeat(Math.min(32, valor.length)) : "sin generar")}</span>
    ${btn("ver-clave", "srv-" + cual, visible ? "Ocultar" : "Ver", "sm outline", visible ? "acciones-filtrar" : "acciones-ver-detalle")}${valor ? copiar("clave-servidor", cual) : ""}${btn("clave-servidor-nueva", cual, valor ? "Generar otra" : "Generar", "sm outline", "acciones-reiniciar")}</div>
    <span class="mini">${esc(ayuda)}</span></div>`;
}
const estadoLinea = p => `<span class="estado-linea ${esc(p.estado)}">${p.estado === "cargando" ? `<span class="spinner"></span>` : ico(p.estado === "ok" ? "estados-completado" : "estados-advertencia", "sm")}${esc(p.texto)}</span>`;
function textoConsentimientoHtml() {
  const C = GUION.consentimiento, v = Object.assign({}, estudioEfectivo(), { minutos:"30 a 45" });
  const pl = t => String(t || "").replace(/\{(\w+)\}/g, (m, k) => (esPropia(v, k) && v[k] ? v[k] : m));
  return `<div class="vista-cons"><h3>${esc(C.titulo)}</h3><p>${esc(C.intro)}</p>
    <dl class="info">${C.info.map(i => `<dt>${esc(i.t)}</dt><dd>${esc(pl(i.d))}</dd>`).join("")}</dl>
    ${PROY.consentimiento.adicional ? `<p>${esc(PROY.consentimiento.adicional)}</p>` : ""}
    <h4>${esc(C.declaracionesTitulo)}</h4><ul class="lista">${C.declaraciones.map(d => `<li>${esc(d.t)}</li>`).join("")}</ul>
    <p class="mini">${esc(C.declaracionDatos.t)}</p></div>`;
}

/* ---------- Cuentas ---------- */
function vistaCuentas() {
  const faltan = rolesSinCuenta(), conUrl = !!urlPublica();
  const fila = q => {
    const rs = respuestasDeCuenta(q.u), g = rs.length ? seguimientoDe(rs[rs.length - 1].doc) : null;
    const estado = !rs.length ? chipEstado("ch-grey", "sin respuesta", "estados-pendiente") : g.completa ? chipEstado("ch-teal", "completa", "estados-completado") : chipEstado("ch-navy", g.pct + " %", "estados-en-curso");
    const ver = UI.verTodas || UI.verClave[q.u];
    return `<tr${UI.foco === q.u ? ' class="nueva"' : ""}>
      <td class="nw"><span class="avatar sm">${icoActor(q.a)}</span></td>
      <td><b>${esc(nomL(q.a))}</b><div class="mono mini">${campoTexto("q-usuario", q.u, q.u, 'size="16" maxlength="40" aria-label="Usuario" autocapitalize="none" spellcheck="false"')}</div></td>
      <td>${campoTexto("q-etiqueta", q.u, q.etiqueta, 'maxlength="120" placeholder="¿Para quién es?" aria-label="Para quién es"')}</td>
      <td class="nw"><span class="mono clave-valor">${esc(ver ? q.clave : "••••••••")}</span>
        <div class="acc">${btn("ver-clave", q.u, ver ? "Ocultar" : "Ver", "sm outline")}${copiar("clave-cuenta", q.u)}${btn("cuenta-clave", q.u, "Otra", "sm outline", "acciones-reiniciar")}</div></td>
      <td class="nw"><label class="check mini"><input type="checkbox" data-in="q-prueba" data-arg="${esc(q.u)}" ${q.p ? "checked" : ""}>prueba</label></td>
      <td class="nw">${estado}${rs.length > 1 ? `<span class="mini"> ${esc(plural(rs.length, "respuesta", "respuestas"))}</span>` : ""}</td>
      <td class="nw acc">${btn("cuenta-invitacion", q.u, "Invitación", "sm sec", "acciones-copiar")}${conUrl ? `<a class="btn sm outline" href="${esc(enlaceCuenta(q))}" target="_blank" rel="noopener">${ico("acciones-entrar", "sm")}Abrir</a>` : ""}${rs.length ? "" : btn("cuenta-eliminar", q.u, "Quitar", "sm outline", "acciones-eliminar")}</td></tr>`;
  };
  const tabla = PROY.cuentas.length ? `<div class="twrap"><table class="t cuentas"><thead><tr><th><span class="sr-only">Rol</span></th><th scope="col">Rol y usuario</th><th scope="col">Para quién es</th><th scope="col">Contraseña</th><th scope="col">Prueba</th><th scope="col">Respuestas</th><th scope="col">Acciones</th></tr></thead><tbody>${PROY.cuentas.map(fila).join("")}</tbody></table></div>` : nada("Todavía no hay cuentas. Cree una por cada persona que va a participar.");
  return `<div class="hoja">
    ${guia("<b>Una cuenta por persona.</b> Cada cuenta lleva el rol que esa persona representará. El panel genera el usuario y la contraseña; usted envía la invitación.")}
    ${seccion("Crear cuentas", "acciones-crear", `
      <div class="row alta">
        <label>Rol<select data-in="alta-rol">${BP.actores.map(a => `<option value="${a.id}" ${UI.alta.rol === a.id ? "selected" : ""}>${esc(a.n)}</option>`).join("")}</select></label>
        <label>¿Cuántas?<input type="number" min="1" max="20" step="1" inputmode="numeric" data-in="alta-n" value="${esc(UI.alta.n)}" style="width:90px"></label>
        ${btn("cuenta-crear", "", "Añadir", "", "acciones-crear")}
        <span class="sp"></span>
        ${faltan.length ? btn("cuenta-faltantes", "", "Crear las " + faltan.length + " que faltan", "sec", "actores-participante") : ""}
        ${PROY.cuentas.length ? "" : btn("cuenta-roles", "", "Crear una por cada rol (12)", "sec", "actores-participante")}
      </div>
      ${faltan.length && PROY.cuentas.length ? `<p class="mini">Sin cuenta todavía: ${esc(faltan.map(nomL).join(", "))}.</p>` : ""}`)}
    ${seccion("Cuentas del estudio", "actores-participante", `${tabla}
      ${PROY.cuentas.length ? `<div class="row" style="margin-top:12px"><label class="check mini"><input type="checkbox" data-in="ver-todas" ${UI.verTodas ? "checked" : ""}>Mostrar todas las contraseñas</label><span class="sp"></span>${btn("cuentas-csv", "", "Descargar las cuentas (CSV)", "sec", "investigacion-archivo-csv")}${btn("invitaciones-imprimir", "", "Imprimir las invitaciones", "sec", "acciones-imprimir")}</div>
      <p class="mini">La hoja de cuentas lleva las contraseñas: es un archivo confidencial. La columna «Para quién es» no sale del panel.</p>` : ""}`)}
    ${seccion("Texto de la invitación", "acciones-notificar", `
      <p class="mini">Se usa para copiar e imprimir las invitaciones. Las llaves se reemplazan con los datos de cada cuenta: ${LLAVES_INVITACION.map(k => `<span class="mono">{${esc(k)}}</span>`).join(" ")}. Las líneas cuyo dato esté vacío se omiten.</p>
      <textarea data-in="inv-texto" rows="8" maxlength="4000">${esc(PROY.invitacion)}</textarea>
      <div class="row">${btn("invitacion-restablecer", "", "Restablecer el texto original", "outline", "acciones-reiniciar")}${PROY.cuentas.length ? `<span class="sp"></span>${btn("invitacion-ver", PROY.cuentas[0].u, "Ver cómo queda", "sec", "acciones-ver-detalle")}` : ""}</div>`)}
  </div>`;
}

/* ---------- Publicar ---------- */
function vistaPublicar() {
  const imp = impedimentosPublicar(), pub = PROY.publicado, vieja = configDesactualizada(), srv = PROY.entrega.forma === "servidor";
  const estadoPub = !pub ? chipEstado("ch-grey", "sin publicar", "estados-pendiente") : vieja ? chipEstado("ch-gold", "desactualizada", "estados-requiere-ajustes") : chipEstado("ch-teal", "al día", "estados-completado");
  const paso = (n, t, cuerpo) => `<li><b>${esc(t)}</b>${cuerpo}</li>`;
  return `<div class="hoja">
    ${guia("<b>Qué entregar a quien publica el sitio.</b> Descargue los archivos y envíeselos. Cada vez que cambie las cuentas o el estudio tendrá que volver aquí.")}
    ${imp.length ? `<div class="card"><div class="guia">${ico("estados-advertencia")}<div><b>Falta algo antes de publicar</b><ul class="lista">${imp.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div></div>` : ""}
    ${seccion("Archivos para el sitio", "acciones-exportar", `
      <div class="row"><span class="lbl">Estado de la configuración publicada</span>${estadoPub}${pub ? `<span class="mini">Última descarga: ${esc(fecha(pub.config || pub.unico))}</span>` : ""}</div>
      ${vieja ? `<div class="guia">${ico("estados-advertencia")}<div>El estudio o las cuentas cambiaron después de la última descarga. Descargue la configuración de nuevo y entréguela a quien publica el sitio.</div></div>` : ""}
      <ol class="pasos-pub">
        ${paso(1, "configuracion.js", `<p class="mini">Datos del estudio y cuentas, con la huella de cada contraseña. Nunca la contraseña.</p><div class="row">${btn("bajar-config", "", "Descargar configuracion.js", imp.length ? "sec" : "green", "investigacion-archivo-json", imp.length ? " disabled" : "")}</div>`)}
        ${srv ? paso(2, "recibir-config.php", `<p class="mini">Claves del receptor. Va junto a <span class="mono">recibir.php</span> en el sitio.</p><div class="row">${btn("bajar-receptor", "", "Descargar recibir-config.php", RE_CLAVE_SERVIDOR.test(PROY.entrega.clave) && PROY.entrega.claveAdmin ? "green" : "sec", "gobernanza-autenticacion", RE_CLAVE_SERVIDOR.test(PROY.entrega.clave) && PROY.entrega.claveAdmin ? "" : " disabled")}${PROY.receptorPublicado && PROY.receptorPublicado.firma !== firmaReceptor() ? chipEstado("ch-gold", "las claves cambiaron", "estados-requiere-ajustes") : ""}</div>`) : ""}
        ${paso(3, "El resto del paquete", `<p class="mini">Entregue también <span class="mono">index.html</span>, <span class="mono">sw.js</span>${srv ? `, <span class="mono">recibir.php</span> y la carpeta <span class="mono">respuestas/</span>` : ""} y las guías. Quien publica encuentra el detalle en <span class="mono">guia-despliegue.html</span>.</p>`)}
      </ol>`)}
    ${seccion("Simulador en un solo archivo", "investigacion-informe", `
      <p>Un único HTML con sus cuentas, que abre con doble clic. Sirve para enviarlo por correo a alguien que lo abrirá en un computador. En teléfonos use la dirección del sitio.</p>
      <p class="mini">Elija el archivo base: <span class="mono">simulador.html</span> o el <span class="mono">index.html</span> del paquete.</p>
      <div class="row">${btn("unico-elegir", "", "Elegir el archivo base y generar", imp.length ? "sec" : "", "acciones-importar", imp.length ? " disabled" : "")}${archivoOculto("unico-archivo", ".html,text/html")}${UI.unico ? estadoLinea(UI.unico) : ""}</div>
      ${pub && pub.unico ? `<p class="mini">Último generado: ${esc(fecha(pub.unico))}.</p>` : ""}`)}
    ${srv ? seccion("Comprobar el receptor", "acciones-sincronizar", `<p class="mini">Cuando el sitio ya esté publicado con <span class="mono">recibir.php</span> y su <span class="mono">recibir-config.php</span>.</p><div class="row">${btn("probar-receptor", "", "Probar el receptor", "sec", "acciones-sincronizar")}${UI.prueba ? estadoLinea(UI.prueba) : ""}</div>`) : ""}
  </div>`;
}

/* ---------- Respuestas ---------- */
function vistaRespuestas() {
  const lista = respuestasOrdenadas(), srv = PROY.entrega.forma === "servidor";
  const fila = e => {
    const d = e.doc, g = seguimientoDe(d), av = avisosDe(e), dentro = entraAlAnalisis(e);
    return `<tr class="${dentro ? "" : "fuera"}">
      <td class="nw"><span class="avatar sm">${icoActor(d.cuenta.actor)}</span></td>
      <td><b class="mono">${esc(d.cuenta.usuario)}</b><div class="mini">${esc(nomL(d.cuenta.actor))}${esDePrueba(e) ? " · " + esc(d.cuenta.demo ? "demostración" : "prueba") : ""}</div>${av.length ? `<div class="mini aviso-fila">${ico("estados-advertencia", "sm")}${esc(av.map(x => x.t).join(" · "))}</div>` : ""}</td>
      <td class="nw">${g.completa ? chipEstado("ch-teal", "completa", "estados-completado") : chipEstado("ch-navy", "parcial", "estados-en-curso")}<div class="mini">${g.hechas} de ${g.total}</div></td>
      <td class="nw">${esc(fecha(fechaIso(d.generado)))}<div class="mini">${esc(e.origen === "servidor" ? "del servidor" : "archivo")}${e.recibido ? " · " + esc(fecha(fechaIso(e.recibido))) : ""}</div></td>
      <td class="nw">${chipEstado("ch-teal", "íntegra", "gobernanza-trazabilidad")}</td>
      <td class="nw"><label class="check mini"><input type="checkbox" data-in="resp-incluir" data-arg="${esc(d.participante.id)}" ${dentro ? "checked" : ""} ${esDePrueba(e) && !PROY.incluirPruebas ? "disabled" : ""}>analizar</label></td>
      <td class="nw acc">${btn("resp-ficha", d.participante.id, "Ver", "sm sec", "acciones-ver-detalle")}${btn("resp-eliminar", d.participante.id, "Quitar", "sm outline", "acciones-eliminar")}${srv && e.origen === "servidor" ? btn("resp-borrar-servidor", d.participante.id, "Borrar del servidor", "sm outline", "acciones-eliminar") : ""}</td></tr>`;
  };
  const tabla = lista.length ? `<div class="twrap"><table class="t"><thead><tr><th><span class="sr-only">Rol</span></th><th scope="col">Cuenta</th><th scope="col">Estado</th><th scope="col">Fecha</th><th scope="col">Integridad</th><th scope="col">Análisis</th><th scope="col">Acciones</th></tr></thead><tbody>${lista.map(fila).join("")}</tbody></table></div>` : nada("Todavía no ha importado ninguna respuesta.");
  const dp = conDatosPersonales().length;
  return `<div class="hoja">
    ${guia("<b>Traiga las respuestas aquí.</b> El panel comprueba cada archivo: que sea de este simulador, que no esté alterado y de qué cuenta viene.")}
    ${seccion("Importar", "acciones-importar", `
      <div class="zona-soltar" id="zona-soltar"><div>${ico("acciones-importar", "lg")}<p><b>Arrastre aquí los archivos</b> que le enviaron los participantes, o</p><div class="row centro-fila">${btn("resp-elegir", "", "Elegir archivos", "", "investigacion-archivo-json")}${archivoOculto("resp-archivo", ".json,application/json", true)}</div><p class="mini">Acepta los archivos de respuestas, los de avance y el paquete que devuelve el receptor.</p></div></div>
      ${srv ? `<div class="row" style="margin-top:12px">${btn("resp-servidor", "", "Traer del servidor", "sec", "acciones-sincronizar")}${UI.servidor ? estadoLinea(UI.servidor) : ""}</div>${UI.servidor && UI.servidor.formulario ? formularioServidor() : ""}` : ""}
      ${UI.importe ? informeImportacion(UI.importe) : ""}`)}
    ${seccion("Respuestas recibidas", "documentos-evidencia", `${tabla}
      <div class="row" style="margin-top:12px"><label class="check mini"><input type="checkbox" data-in="incluir-pruebas" ${PROY.incluirPruebas ? "checked" : ""}>Incluir en el análisis las cuentas de prueba y de demostración</label><span class="sp"></span>${lista.length ? btn("resp-json", "", "Descargar todas (JSON)", "sec", "investigacion-archivo-json") : ""}${dp ? btn("resp-datos-csv", "", "Datos personales (CSV)", "outline", "investigacion-archivo-csv") : ""}</div>
      ${dp ? `<p class="mini">${esc(plural(dp, "participante dio sus datos personales", "participantes dieron sus datos personales"))}. Ese archivo es confidencial y no se usa en el informe.</p>` : ""}`)}
  </div>`;
}
function formularioServidor() {
  return `<form class="form-servidor" method="post" action="${esc(urlReceptor())}" target="_blank" rel="noopener">
    <p class="mini">Si el panel no puede hablar con el servidor desde aquí, descargue el paquete con este botón y luego impórtelo como un archivo.</p>
    <input type="hidden" name="accion" value="listar"><input type="hidden" name="claveAdmin" value="${esc(PROY.entrega.claveAdmin)}"><input type="hidden" name="estudio" value="${esc(PROY.estudio.id)}">
    <button type="submit" class="btn sec">${ico("acciones-exportar")}Descargar el paquete del servidor</button></form>`;
}
function informeImportacion(imp) {
  const R = { nuevo:["ch-teal", "importada"], reemplazo:["ch-navy", "reemplazó"], igual:["ch-grey", "ya estaba"], antiguo:["ch-gold", "más antigua"], rechazado:["ch-red", "rechazada"] };
  const resumen = Object.keys(imp.n).filter(k => imp.n[k]).map(k => imp.n[k] + " " + R[k][1]).join(" · ");
  return `<div class="importe"><div class="lbl">${ico("estados-completado", "sm")}Importación del ${esc(hora(imp.t))} · ${esc(resumen || "sin cambios")}</div>
    ${imp.nota ? `<p class="mini">${esc(imp.nota)}</p>` : ""}
    ${imp.ausentes ? `<p class="mini">${esc(plural(imp.ausentes, "respuesta ya no está", "respuestas ya no están"))} en el servidor: la persona pudo haberse retirado.</p>` : ""}
    <div class="twrap"><table class="t"><thead><tr><th scope="col">Archivo</th><th scope="col">Cuenta</th><th scope="col">Resultado</th><th scope="col">Detalle</th></tr></thead><tbody>${imp.filas.map(f => `<tr><td class="mini">${esc(f.archivo)}</td><td class="nw mono">${esc(f.usuario || "—")}</td><td class="nw">${chipEstado(R[f.res][0], R[f.res][1])}</td><td>${esc(f.texto)}${f.avisos.length ? `<div class="mini aviso-fila">${ico("estados-advertencia", "sm")}${esc(f.avisos.join(" · "))}</div>` : ""}</td></tr>`).join("")}</tbody></table></div></div>`;
}

/* ---------- Seguimiento ---------- */
function vistaSeguimiento() {
  if (UI.ficha) return fichaParticipante(UI.ficha);
  const cuentas = PROY.cuentas, sueltas = respuestasOrdenadas().filter(e => !cuentaDe(e.doc.cuenta.usuario));
  const tira = g => `<div class="rondas-tira">${g.rondas.map(r => `<div class="ronda-tira"><span class="mini">${esc(r.r.id)}</span><span class="mini-strip">${r.pasos.map(x => `<span class="ms ${x.estado}" title="${esc(x.p.id + " · " + x.p.n + (x.act ? " · " + x.act.titulo : " · su rol no interviene"))}">${esc(x.p.id)}</span>`).join("")}</span>${r.pre ? ico("estados-completado", "sm") : ""}</div>`).join("")}</div>`;
  const filaCuenta = q => {
    const rs = respuestasDeCuenta(q.u);
    if (!rs.length) return `<tr class="sin"><td class="nw"><span class="avatar sm">${icoActor(q.a)}</span></td><td><b>${esc(nomL(q.a))}</b><div class="mini mono">${esc(q.u)}${q.etiqueta ? " · " + esc(q.etiqueta) : ""}</div></td><td colspan="4">${chipEstado("ch-grey", "sin respuesta", "estados-pendiente")}<span class="mini"> Todavía no ha entregado nada.</span></td></tr>`;
    return rs.map(e => filaSeg(e, q)).join("");
  };
  const filaSeg = (e, q) => {
    const d = e.doc, g = seguimientoDe(d), ult = g.ultAct;
    const probl = {}; g.problemas.forEach(p => { probl[p.n] = (probl[p.n] || 0) + 1; });
    return `<tr>
      <td class="nw"><span class="avatar sm">${icoActor(d.cuenta.actor)}</span></td>
      <td><b>${esc(nomL(d.cuenta.actor))}</b><div class="mini mono">${esc(d.cuenta.usuario)}${q && q.etiqueta ? " · " + esc(q.etiqueta) : ""}</div>${esDePrueba(e) ? `<span class="chip ch-grey">${esc(d.cuenta.demo ? "demostración" : "prueba")}</span>` : ""}</td>
      <td><div class="donde">${g.completa ? ico("estados-completado", "sm") : ico("estados-en-curso", "sm")}${esc(g.donde.texto)}</div><div class="meter"><span style="width:${g.pct}%"></span></div><div class="mini">${g.hechas} de ${g.total} respuestas</div>${tira(g)}</td>
      <td>${ult ? `<div class="mini">${esc(ult.ronda)} · ${esc(ult.paso)}</div><div>${esc(resumenActividad(ult.payload))}</div>${ult.payload.obs ? `<div class="mini">«${esc(ult.payload.obs)}»</div>` : ""}` : nada("Sin actividades todavía")}</td>
      <td>${Object.keys(probl).length ? `<ul class="lista mini">${Object.keys(probl).map(k => `<li>${esc(k)}${probl[k] > 1 ? " ×" + probl[k] : ""}</li>`).join("")}</ul>` : `<span class="mini">—</span>`}${g.observaciones.length ? `<div class="mini">${esc(plural(g.observaciones.length, "observación", "observaciones"))}</div>` : ""}</td>
      <td class="nw">${btn("seg-ficha", d.participante.id, "Ver ficha", "sm sec", "acciones-ver-detalle")}<div class="mini">${esc(fecha(fechaIso(d.generado)))}</div></td></tr>`;
  };
  if (!cuentas.length && !sueltas.length) return `<div class="hoja">${seccion("Seguimiento", "administracion-revisar", nada("Cree las cuentas en «Cuentas» e importe las respuestas en «Respuestas». Aquí verá en qué va cada participante."))}</div>`;
  const total = cuentas.length, conResp = cuentas.filter(q => respuestasDeCuenta(q.u).length).length;
  const completas = respuestasOrdenadas().filter(e => seguimientoDe(e.doc).completa).length;
  return `<div class="hoja">
    ${guia("<b>En qué va cada participante.</b> La tira de once casillas muestra los pasos de cada ronda: verde los respondidos, azul el actual y gris los que su rol no recorre.")}
    ${seccion("Resumen", "capitulos-indicadores", `<dl class="cifras"><div><dt>Cuentas</dt><dd>${total}</dd></div><div><dt>Con alguna respuesta</dt><dd>${conResp}</dd></div><div><dt>Participaciones completas</dt><dd>${completas}</dd></div><div><dt>Sin respuesta</dt><dd>${total - conResp}</dd></div></dl>`)}
    ${seccion("Participantes", "actores-participante", `<div class="twrap"><table class="t seguimiento"><thead><tr><th><span class="sr-only">Rol</span></th><th scope="col">Cuenta</th><th scope="col">En qué va</th><th scope="col">Lo último que respondió</th><th scope="col">Qué problemas registró</th><th scope="col"><span class="sr-only">Acciones</span></th></tr></thead><tbody>${cuentas.map(filaCuenta).join("")}${sueltas.length ? `<tr class="sep"><td colspan="6" class="mini">Respuestas de cuentas que no están en este proyecto</td></tr>${sueltas.map(e => filaSeg(e, null)).join("")}` : ""}</tbody></table></div>`)}
  </div>`;
}

/* ---------- Ficha de un participante ---------- */
function fichaParticipante(pid) {
  const e = entradaDe(pid);
  if (!e) return `<div class="hoja">${seccion("Ficha", "actores-participante", nada("Esa respuesta ya no está en el panel.") + btn("ficha-cerrar", "", "Volver", "sec", "acciones-anterior"))}</div>`;
  const d = e.doc, g = seguimientoDe(d), dt = d.participante.datos || {};
  const campos = GUION.consentimiento.datos.filter(c => dt[c.id]);
  const celdaRonda = (r, x) => {
    if (!x.act) return `<td class="na"><span class="mini">no interviene</span></td>`;
    if (!x.reg) return `<td class="pend"><span class="mini">sin responder</span></td>`;
    const pl = x.reg.payload;
    return `<td><b>${esc(resumenActividad(pl))}</b>${pl.obs ? `<div class="mini">«${esc(pl.obs)}»</div>` : ""}${pl.comprobacion && !pl.comprobacion.finalidadAutorizada ? `<div class="mini regla-no">finalidad no autorizada</div>` : ""}${num(x.reg.version) > 1 ? `<div class="mini">corregida</div>` : ""}</td>`;
  };
  const filasPasos = PASOS.map(p => {
    const porRonda = g.rondas.map(r => r.pasos.filter(x => x.p.id === p.id)[0]);
    if (!porRonda.some(x => x && x.act)) return "";
    return `<tr><td class="nw"><span class="step-tag sm">${esc(p.id)}</span></td><td class="mini">${esc(p.n)}</td>${g.rondas.map((r, i) => celdaRonda(r, porRonda[i])).join("")}</tr>`;
  }).join("");
  const cierres = g.rondas.map(r => `<tr><td class="nw" colspan="2"><b>Cierre de ${esc(r.r.id)}</b></td>${g.rondas.map((x, i) => i === r.i ? `<td>${r.val ? `${esc(etiqueta(ESC.valoracion.semaforo, r.val.payload.semaforo))} · ${esc(etiqueta(ESC.valoracion.mejora, r.val.payload.mejora))}${r.val.payload.ajuste ? `<div class="mini">«${esc(r.val.payload.ajuste)}»</div>` : ""}` : `<span class="mini">sin valorar</span>`}${r.pre ? `<div class="mini">${ESC.preguntas.map(q => esc(q.id) + ": " + esc(Array.isArray(r.pre.payload[q.id]) ? r.pre.payload[q.id].map(v => etiqueta(q.ops, v)).join(", ") : q.tipo === "texto" ? r.pre.payload[q.id] : etiqueta(q.ops, r.pre.payload[q.id]))).join(" · ")}</div>` : ""}</td>` : `<td class="na"></td>`).join("")}</tr>`).join("");
  return `<div class="hoja"><div class="card ficha-part">
    <div class="row"><button type="button" class="btn sm outline" data-act="ficha-cerrar">${ico("acciones-anterior", "sm")}Volver</button><span class="sp"></span>${btn("resp-ficha-json", pid, "Descargar esta respuesta", "sm sec", "investigacion-archivo-json")}</div>
    <div class="ficha-cab"><div class="avatar xl">${icoActor(d.cuenta.actor)}</div><div><h1 tabindex="-1">${esc(nomL(d.cuenta.actor))}</h1>
      <div class="kv"><b>Cuenta</b><span class="mono">${esc(d.cuenta.usuario)}</span><b>Participación</b><span class="mono">${esc(d.participante.id)}</span><b>Estado</b><span>${esc(g.completa ? "completa" : "parcial")} · ${g.hechas} de ${g.total} respuestas · ${esc(g.donde.texto)}</span><b>Declaración</b><span>aceptada el ${esc(fecha(d.consentimiento.t))} (versión ${esc(d.consentimiento.version)})</span><b>Documento</b><span>${esc(fecha(fechaIso(d.generado)))} · ${esc(e.origen === "servidor" ? "recibido por el servidor" : "importado de un archivo")}</span></div></div></div>
    ${campos.length ? `<details data-det="ficha-datos"><summary>Datos personales que esta persona decidió dar</summary><div class="kv">${campos.map(c => `<b>${esc(c.n)}</b><span>${esc(dt[c.id])}</span>`).join("")}${d.participante.resumen ? `<b>Resumen</b><span>desea recibir los resultados</span>` : ""}</div><p class="mini">Úselos solo para contactarle sobre el estudio. No aparecen en el informe.</p></details>` : `<p class="mini">${ico("gobernanza-etica", "sm")}Participó sin dar sus datos personales.</p>`}
    <h2>${ico("navegacion-blueprint")}Qué respondió, paso a paso</h2>
    <div class="twrap"><table class="t ficha-tabla"><thead><tr><th scope="col">Paso</th><th scope="col">Nombre</th>${g.rondas.map(r => `<th scope="col">${ico(ICO.modo[r.r.modo], "sm")}${esc(r.r.id)} · ${esc(r.r.modo === "actual" ? "hoy" : "con el módulo")}</th>`).join("")}</tr></thead><tbody>${filasPasos}${cierres}</tbody></table></div>
    ${g.problemas.length ? `<h2>${ico("investigacion-barreras")}Qué problemas registró</h2><div class="twrap"><table class="t"><thead><tr><th scope="col">Ronda</th><th scope="col">Paso</th><th scope="col">Qué ocurrió</th></tr></thead><tbody>${g.problemas.map(p => `<tr><td class="nw">${esc(p.ronda)}</td><td class="nw">${esc(p.paso)}</td><td>${esc(p.t)}</td></tr>`).join("")}</tbody></table></div>` : ""}
    ${g.observaciones.length ? `<h2>${ico("acciones-observar")}Sus observaciones</h2><ul class="lista obs-lista">${g.observaciones.map(o => `<li><span class="mini">${esc(o.ronda || "")} ${esc(o.paso || "")}</span> «${esc(o.texto)}»</li>`).join("")}</ul>` : ""}
    <h2>${ico("documentos-evidencia")}Registros</h2>
    <p class="mini">${g.nParticipante} de la persona · ${g.nSimulados} simulados por el sistema · ${g.nSistema - g.nSimulados} de conducción${g.corregidas ? " · " + g.corregidas + " reemplazados por una corrección" : ""}.</p>
  </div></div>`;
}

/* ---------- Resultados ---------- */
let analisisMemo = null;
function analisisActual() {
  const docs = docsIncluidos();
  const firma = SHA.hex(docs.map(d => d.huella).join("|") + "|" + PROY.estudio.id + "|" + PROY.cuentas.map(q => q.u + ":" + q.a + ":" + (q.p ? 1 : 0)).join(",") + "|" + canonico(estudioPublicable()));
  if (!analisisMemo || analisisMemo.firma !== firma) analisisMemo = { firma, an:analizar(docs, { cuentas:PROY.cuentas, estudio:estudioEfectivo() }) };
  return analisisMemo.an;
}
const vistaResultadosPanel = () => `<div class="hoja ancha">${guia("<b>El informe se arma solo</b> con las respuestas que están marcadas para analizar. Cada tabla se exporta a CSV; abajo puede descargar el informe completo.")}${vistaResultados(analisisActual())}</div>`;

/* ---------- Diálogos ---------- */
const DIALOGOS = {
  "proyecto-borrar":{ t:"¿Borrar todo el panel de este navegador?", d:"Se borran TODAS las sesiones de simulación: sus cuentas con las contraseñas y las respuestas importadas. No se puede deshacer. Exporte antes una copia de cada sesión.", pide:"BORRAR", si:"Sí, borrar todo", cls:"danger" },
  "cuenta-eliminar":{ t:"¿Quitar esta cuenta?", d:"La cuenta deja de existir en el proyecto. Si ya la envió, esa persona no podrá entrar cuando se publique la configuración nueva.", si:"Quitar la cuenta", cls:"danger" },
  "resp-eliminar":{ t:"¿Quitar esta respuesta del panel?", d:"Se quita de este navegador. Si vino del servidor, allí sigue estando.", si:"Quitar", cls:"danger" },
  "resp-borrar-servidor":{ t:"¿Borrar esta respuesta del servidor?", d:"Se elimina del servidor y del panel. Hágalo cuando la persona pida retirarse. No se puede deshacer.", si:"Borrar del servidor", cls:"danger" },
  "clave-cambiar":{ t:"Cambiar la clave del panel", d:"Escriba la clave actual y la nueva. La clave protege la entrada al panel en este navegador.", si:"Cambiar la clave", cls:"", campos:"clave" },
  "est-eliminar":{ t:"¿Eliminar esta sesión de simulación?", d:"Se borran sus cuentas y las respuestas de sus participantes en este navegador. No se puede deshacer: exporte antes una copia de seguridad.", pide:"ELIMINAR", si:"Sí, eliminar la sesión", cls:"danger" },
  "invitacion-ver":{ t:"Así queda la invitación", si:"Cerrar", cls:"", soloCerrar:true }
};
function dialogoHtml() {
  const dl = UI.dialogo; if (!dl) return "";
  const M = DIALOGOS[dl.id]; if (!M) return "";
  const cuerpo = M.campos === "clave"
    ? `<label class="campo">Clave actual<input type="password" data-in="dlg-actual" value="${esc(UI.cambio.actual)}" autocomplete="current-password"></label><label class="campo">Clave nueva<input type="password" data-in="dlg-c1" value="${esc(UI.cambio.c1)}" autocomplete="new-password"></label><label class="campo">Repítala<input type="password" data-in="dlg-c2" value="${esc(UI.cambio.c2)}" autocomplete="new-password"></label>`
    : dl.id === "invitacion-ver" ? `<pre class="invitacion">${esc(dl.texto || "")}</pre>`
    : M.pide ? `<label class="campo">Para confirmar, escriba <b>${esc(M.pide)}</b>${campoTexto("dlg-texto", "", dl.texto, 'autocapitalize="characters"')}</label>` : "";
  return `<div class="modal"><div class="modal-fondo" data-act="dlg-no"></div><div class="modal-caja ${M.campos || dl.id === "invitacion-ver" ? "ancho" : ""}" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t">
    <h2 id="dlg-t">${esc(M.t)}</h2>${M.d ? `<p>${esc(M.d)}</p>` : ""}${cuerpo}
    ${dl.error ? `<p class="msg err">${ico("estados-advertencia", "sm")}${esc(dl.error)}</p>` : ""}
    <div class="nav-row"><span class="sp"></span>${M.soloCerrar ? "" : `<button type="button" class="btn outline" data-act="dlg-no">Cancelar</button>`}${dl.id === "invitacion-ver" ? copiar("dialogo", "") : ""}<button type="button" class="btn ${M.cls}" data-act="${M.soloCerrar ? "dlg-no" : "dlg-si"}">${esc(M.si)}</button></div></div></div>`;
}
