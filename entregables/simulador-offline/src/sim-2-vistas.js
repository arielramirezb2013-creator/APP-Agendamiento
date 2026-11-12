/* ============ Simulador: vistas ============ */

/* ---------- Piezas comunes ---------- */
function opt(act, arg, ops, cur, multi) {
  return `<div class="optrow">${ops.map(o => {
    const on = multi ? (cur || []).indexOf(o[0]) >= 0 : String(cur) === String(o[0]);
    return `<button type="button" data-act="${act}" data-arg="${esc(arg)}" data-v="${esc(o[0])}" aria-pressed="${on}">${esc(o[1])}</button>`;
  }).join("")}</div>`;
}
// El mismo aviso de error de la barra superior, repetido junto al botón que lo causó (solo visual).
const errHtml = () => S.msgErr && S.msg ? `<p class="msg err en-linea" aria-hidden="true">${ico("estados-advertencia", "sm")}${esc(S.msg)}</p>` : "";
const chipSim = `<span class="chip ch-gold" title="Lo generó el sistema para representar a los actores que no están conectados">simulado</span>`;
const piezasTxt = ks => (ks || []).length ? ks.map(k => EV[k].sl).join(", ") : "información del trámite";
const piezasLargo = ks => (ks || []).length ? ks.map(k => EV[k].n + " (" + EV[k].sl + ")").join(", ") : "información del trámite, sin piezas de evidencia";
const finTxt = id => (FIN[id] || { n:id || "sin declarar" }).n;
function fraseRegistro(r) {
  const pl = r.payload || {};
  if (r.tipo === "solicitud") return `${nom(pl.de)} pide a ${nom(pl.a)}: ${piezasTxt(pl.piezas)}, con finalidad «${finTxt(pl.finalidad)}»`;
  if (r.tipo === "consulta") {
    if (pl.metadatos) return `${nom(pl.de)} consultó por el módulo el estado y las fechas del trámite en ${nom(pl.a)}, sin campos clínicos`;
    if (pl.denegada) return `El módulo denegó a ${nom(pl.de)} la consulta de ${EV[pl.pieza].sl}: ${pl.motivo}`;
    return `El módulo entregó a ${nom(pl.de)} ${pl.campos.length} de ${EV[pl.pieza].campos.length} campos de ${EV[pl.pieza].sl}, que custodia ${nom(pl.a)}`;
  }
  if (r.tipo === "notificacion") return pl.acuse ? `Notificación con acuse a ${(pl.a || []).map(nom).join(", ")}` : `Notificación sin acuse: ${pl.nota || "funcionamiento actual"}`;
  if (r.tipo === "acuse") return `${nom(pl.de)} confirmó el recibo`;
  if (r.tipo === "respuesta") return `Su respuesta quedó enlazada a la solicitud de ${nom(pl.a)}`;
  return r.tipo;
}
function etapasHtml() {
  const items = ["Orientación", "Declaración"].concat(ESC.rondas.map((r, i) => "Ronda " + (i + 1)), ["Entrega"]);
  const cur = S.etapa === "orientacion" ? 0 : S.etapa === "consentimiento" ? 1 : S.etapa === "simulacion" && S.ses ? 2 + ESC.rondas.map(r => r.id).indexOf(S.ses.rondaActual) : items.length - 1;
  return `<ol class="etapas" aria-label="Etapas de su participación">${items.map((t, i) => `<li class="${i < cur ? "hecha" : i === cur ? "actual" : ""}"${i === cur ? ' aria-current="step"' : ""}><span class="n">${i < cur ? ico("estados-completado", "sm") : i + 1}</span><span class="t">${esc(t)}</span></li>`).join("")}</ol>`;
}
function renderTop() {
  const msg = `<span class="msg ${S.msgErr ? "err" : ""}" role="${S.msgErr ? "alert" : "status"}">${S.msg ? ico(S.msgErr ? "estados-advertencia" : "estados-completado", "sm") : ""}${esc(S.msg)}</span>`;
  if (!S.cuenta) {
    pintar("appright", `<span class="who"><span><b>${esc(CFG.estudio.programa)}</b><small>${esc(CFG.estudio.institucion)}</small></span></span>`);
    pintar("top", `<span class="sp"></span>${msg}`);
    return;
  }
  const enCurso = !!S.consent && S.etapa !== "cierre";
  pintar("appright", `<span class="who"><span class="avatar">${icoActor(S.cuenta.a)}</span><span><b>${esc(nomL(S.cuenta.a))}</b><small>usuario ${esc(S.cuenta.u)}</small></span></span><button type="button" class="btn sm outline" data-act="salir">${ico(enCurso ? "acciones-pausar" : "acciones-salir", "sm")}${enCurso ? "Pausar" : "Salir"}</button>`);
  const guardado = ALM.tipo === "memoria" || guardadoFallo ? `<span class="badge sin-guardado">${ico("estados-advertencia", "sm")}Este navegador no guarda el avance: no cierre la pestaña</span>` : ALM.tipo === "pestana" ? `<span class="badge sin-guardado">${ico("estados-advertencia", "sm")}El avance se guarda solo mientras esta pestaña siga abierta</span>` : S.guardado ? `<span class="hm guardado">${ico("estados-guardado", "sm")}Guardado en este dispositivo · ${esc(hora(S.guardado))}</span>` : "";
  const red = !enLinea && (CFG.envio || /^https?:$/.test(location.protocol)) ? `<span class="badge sin-guardado">${ico("estados-sin-conexion", "sm")}Sin conexión: su avance sigue guardado en este dispositivo${CFG.envio ? " y se enviará al volver la conexión" : ""}</span>` : "";
  const conEtapas = ["orientacion", "consentimiento", "simulacion", "cierre"].indexOf(S.etapa) >= 0 && !S.retomar && !S.buscando && !falloGrave;
  pintar("top", `${conEtapas ? etapasHtml() : ""}<span class="sp"></span>${red}${guardado}${msg}`);
}
function confirmarHtml() {
  const c = S.confirmar; if (!c) return "";
  const M = {
    retirar:{ t:"¿Retirarse del estudio?", d:"Sus respuestas se borran de este dispositivo y no se podrán recuperar." + (CFG.envio ? " Si ya se enviaron, se pedirá al servidor que las elimine." : " Si ya entregó un archivo, pida al investigador que lo elimine."), si:"Sí, retirarme y borrar mis respuestas", cls:"danger", act:"retirar-si" },
    borrar:{ t:"¿Borrar sus datos de este dispositivo?", d:"Hágalo solo después de entregar sus respuestas. No se podrán recuperar desde este navegador.", si:"Sí, borrar", cls:"danger", act:"borrar-si" },
    salir:{ t:S.consent && S.etapa !== "cierre" ? "¿Pausar su participación?" : "¿Salir ahora?", d:ALM.tipo === "local" && !guardadoFallo ? "Su avance queda guardado en este dispositivo. Para retomar, entre de nuevo con su usuario y su contraseña en este mismo navegador y continuará donde quedó." + (CFG.envio && CFG.envio.modo === "progresivo" ? " Como sus respuestas también se envían al servidor del estudio, podrá retomar desde otro dispositivo." : S.consent ? " Si va a continuar en otro dispositivo, descargue antes su archivo de avance." : "") : "Este navegador no guarda el avance de forma permanente." + (S.consent ? " Descargue su archivo de avance: lo necesitará para continuar después." : ""), si:S.consent && S.etapa !== "cierre" ? "Pausar y salir" : "Salir", cls:"", act:"salir-si", extra:S.consent ? `<button type="button" class="btn sec" data-act="avance-descargar">${ico("investigacion-archivo-json")}Descargar mi avance</button>` : "" }
  }[c];
  return `<div class="modal"><div class="modal-fondo" data-act="confirmar-no"></div><div class="modal-caja" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-d"><h2 id="dlg-t">${esc(M.t)}</h2><p id="dlg-d">${esc(M.d)}</p><div class="nav-row"><span class="sp"></span><button type="button" class="btn outline" data-act="confirmar-no">Cancelar</button>${M.extra || ""}<button type="button" class="btn ${M.cls}" data-act="${M.act}">${esc(M.si)}</button></div></div></div>`;
}

/* ---------- Acceso ---------- */
function vistaAcceso() {
  if (!CFG.ok) return `<div class="hoja"><div class="card"><h1 tabindex="-1">${ico("estados-advertencia")}El simulador todavía no está configurado</h1><p>Avise a la persona que le envió este enlace.</p><details data-det="cfg"><summary>Detalle para quien administra el sitio</summary><ul class="lista">${CFG.errores.map(e => `<li>${esc(e)}</li>`).join("")}</ul><p class="mini">El archivo <span class="mono">configuracion.js</span> debe estar en la misma carpeta que esta página. Se genera en el panel del investigador.</p></details></div></div>`;
  const a = S.acc;
  const demo = CFG.demo ? `<div class="hoja"><details class="card demo" data-det="demo" open><summary>Cuentas de demostración</summary><p>Este archivo trae una cuenta de prueba por rol. La contraseña de todas es <b class="mono">${esc(CFG.demo.clave)}</b>. Elija un rol para entrar. Las respuestas de estas cuentas quedan marcadas como demostración.</p><div class="demo-grid">${CFG.cuentas.map(q => `<button type="button" class="demo-cta" data-act="demo-usar" data-arg="${esc(q.u)}"><span class="avatar">${icoActor(q.a)}</span><span><b>${esc(nomL(q.a))}</b><small class="mono">${esc(q.u)}</small></span></button>`).join("")}</div></details></div>` : "";
  return `<div class="auth-wrap"><form class="auth acceso" data-form="acceso" novalidate>
    <div class="auth-body">
      <div class="avatar xl">${ico("actores-participante")}</div>
      <h1 class="acceso-titulo" tabindex="-1">${esc(CFG.estudio.titulo)}</h1>
      <p class="mini centro">${esc(CFG.estudio.subtitulo)}</p>
      <label>Usuario<input type="text" data-in="a-u" value="${esc(a.u)}" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <label>Contraseña<input type="${a.ver ? "text" : "password"}" data-in="a-c" value="${esc(a.c)}" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <label class="check"><input type="checkbox" data-in="a-ver" ${a.ver ? "checked" : ""}>Mostrar la contraseña</label>
      ${errHtml()}<button type="submit" class="btn" id="btn-entrar">${ico("acciones-entrar")}Entrar</button>
    </div>
    <div class="auth-foot"><p class="mini">Use el usuario y la contraseña que le envió el investigador. Cada usuario corresponde a un rol de la ruta.</p></div>
  </form></div>
  <p class="intro claro">Simulación individual de la ruta de incapacidad con un caso sintético. Usted representa un rol, recorre la ruta dos veces y sus respuestas se usan en una investigación doctoral. Los demás actores están simulados.</p>${demo}`;
}

/* ---------- Reanudación ---------- */
function dondeQuedo() {
  const s = S.ses; if (!s) return "Orientación";
  if (S.etapa === "cierre" || s.estado === "cerrada") return "Entrega de sus respuestas";
  const r = rondaDef(s.rondaActual), rd = rondaAct();
  if (rd.estado === "pendiente") return "Inicio de la " + r.n.charAt(0).toLowerCase() + r.n.slice(1);
  if (rd.estado === "valoracion") return "Cierre de la " + r.n.charAt(0).toLowerCase() + r.n.slice(1);
  return r.n + " · paso " + s.pasoActual + " · " + PASOS[PIDX[s.pasoActual]].n;
}
function vistaRetomar() {
  const r = S.retomar, a = avance(), origen = { local:"en este dispositivo", servidor:"en el servidor del estudio", archivo:"en su archivo de avance" }[r.origen];
  return `<div class="hoja"><div class="card retomar"><h1 tabindex="-1">${ico("acciones-iniciar")}Bienvenido de nuevo</h1>
    <p>Su avance estaba guardado ${origen}. Último guardado: <b>${esc(fecha(r.t))}</b>. Puede continuar donde quedó.</p>
    <div class="ficha-rol"><div class="avatar xl">${icoActor(S.cuenta.a)}</div><div><div class="rol-n">${esc(nomL(S.cuenta.a))}</div><div class="kv"><b>Quedó en</b><span>${esc(dondeQuedo())}</span><b>Respuestas</b><span>${a.hechas} de ${a.total}<div class="meter"><span style="width:${a.pct}%"></span></div></span></div></div></div>
    <div class="nav-row">${r.origen !== "local" ? `<button type="button" class="enlace" data-act="retomar-nuevo">No es mi avance: empezar de nuevo</button>` : ""}<span class="sp"></span><button type="button" class="btn outline" data-act="orient-ver">${ico("navegacion-guia")}Ver la orientación</button><button type="button" class="btn green" data-act="retomar-continuar">Continuar donde quedé${ico("acciones-siguiente")}</button></div></div></div>`;
}
const vistaBuscando = () => `<div class="hoja"><div class="card"><p role="status"><span class="spinner"></span>Buscando si tiene un avance guardado…</p></div></div>`;
const vistaFallo = () => `<div class="hoja"><div class="card"><h1 tabindex="-1">${ico("estados-advertencia")}Ocurrió un error inesperado</h1><p>${ALM.tipo === "local" ? "Su avance está guardado en este dispositivo. " : ""}Recargue la página para continuar donde quedó.</p><div class="row"><button type="button" class="btn" data-act="recargar">${ico("acciones-reiniciar")}Recargar la página</button>${S.consent && S.ses ? `<button type="button" class="btn sec" data-act="avance-descargar">${ico("investigacion-archivo-json")}Descargar mi avance</button>` : ""}</div><details data-det="fallo"><summary>Detalle técnico para el investigador</summary><p class="mono">${esc(falloGrave)}</p></details></div></div>`;
const cargarAvanceHtml = () => `<p class="mini otro-equipo">¿Ya había comenzado en otro dispositivo? <button type="button" class="enlace" data-act="avance-elegir">Cargar mi archivo de avance</button><input type="file" id="avance-archivo" data-in="avance-archivo" accept=".json,application/json" hidden></p>`;

/* ---------- Orientación ---------- */
function intervencionHtml(actor) {
  const TIPO = { focal:"Vive el paso como M.P.", decide:"Decide", custodia:"Responde por evidencia que custodia", soporte:"Vigila o apoya" };
  const filas = PASOS.map(p => {
    const porRonda = ESC.rondas.map(r => actividadDe(p, actor, r.modo));
    if (!porRonda.some(Boolean)) return "";
    const txt = porRonda.every((x, i) => (x && x.tipo) === (porRonda[0] && porRonda[0].tipo)) ? TIPO[porRonda[0].tipo] : porRonda.map((x, i) => "Ronda " + (i + 1) + ": " + (x ? TIPO[x.tipo].toLowerCase() : "no interviene")).join(" · ");
    return `<tr><td class="nw"><span class="step-tag sm">${esc(p.id)}</span></td><td>${ico(ICO.paso[p.id], "sm")}${esc(p.n)}</td><td>${esc(txt)}</td></tr>`;
  }).join("");
  return `<div class="twrap"><table class="t apila"><thead><tr><th scope="col">Paso</th><th scope="col">Qué ocurre</th><th scope="col">Qué hace usted</th></tr></thead><tbody>${filas}</tbody></table></div>`;
}
function vistaOrientacion() {
  const O = GUION.orientacion, i = Math.max(0, Math.min(S.orient, O.pasos.length - 1)), id = O.pasos[i].id, a = S.cuenta.a;
  let c = "";
  if (id === "estudio") {
    const E = O.estudio;
    c = `<h1 tabindex="-1">${esc(E.titulo)}</h1>${E.parrafos.map(p => `<p>${esc(p)}</p>`).join("")}
      <h2>${ico("investigacion-pregunta-investigacion")}${esc(E.buscaTitulo)}</h2><ol class="lista">${E.busca.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
      <h2>${ico("investigacion-hipotesis")}${esc(E.subTitulo)}</h2><ul class="lista limpia">${Object.keys(ESC.subpreguntas).map(k => `<li>${ico(ICO.sub[k], "sm")}${esc(ESC.subpreguntas[k])}</li>`).join("")}</ul>
      <div class="guia">${ico("gobernanza-etica")}<div><b>${esc(E.aclaraTitulo)}</b><ul class="lista">${E.aclara.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>${S.consent ? "" : cargarAvanceHtml()}`;
  } else if (id === "caso") {
    const C = O.caso;
    c = `<h1 tabindex="-1">${esc(C.titulo)}</h1><p>${esc(C.intro)}</p>
      <div class="ficha-caso">${ico("documentos-datos-sinteticos", "lg")}<div><b>Caso M.P.</b><p>${esc(BP.caso.ficha)}</p><p class="mini">${esc(BP.caso.alcance)}</p></div></div>
      <h2>${ico("navegacion-blueprint")}${esc(C.rutaTitulo)}</h2>
      <div class="ruta">${SB.fases.map(f => `<div class="ruta-fase"><div class="ruta-t">${ico(ICO.fase[f.id])}<b>${esc(f.n)}</b><span class="mini">${esc(f.sub)}</span></div><ol>${PASOS.filter(p => p.fase === f.id).map(p => `<li><span class="step-tag sm">${esc(p.id)}</span><span>${esc(p.n)}</span></li>`).join("")}</ol></div>`).join("")}</div>
      <h2>${ico("documentos-evidencia")}${esc(C.evidenciaTitulo)}</h2>
      <div class="twrap"><table class="t apila"><thead><tr><th scope="col">Pieza</th><th scope="col">Qué es</th><th scope="col">Custodio</th></tr></thead><tbody>${Object.keys(EV).map(k => `<tr><td class="nw">${ico(ICO.ev[k], "sm")}<b>${esc(EV[k].sl)}</b></td><td>${esc(EV[k].n)}</td><td>${esc(nomL(EV[k].cust))}</td></tr>`).join("")}</tbody></table></div>
      <p class="mini" style="margin-top:10px">${esc(ESC.nota)}</p>`;
  } else if (id === "mecanica") {
    const M = O.mecanica, canal = CFG.envio ? M.envio[CFG.envio.modo] : M.envio.archivo;
    c = `<h1 tabindex="-1">${esc(M.titulo)}</h1><ol class="puntos">${M.puntos.concat([canal]).map(x => `<li><b>${esc(x.t)}</b><span>${esc(x.d)}</span></li>`).join("")}</ol>
      <div class="guia">${ico("investigacion-tiempo")}<div>${esc(plantilla(M.tiempo))}</div></div>`;
  } else {
    const R = O.rol;
    c = `<h1 tabindex="-1">${esc(R.titulo)}</h1><p>${esc(R.intro)}</p>
      <div class="ficha-rol"><div class="avatar xl">${icoActor(a)}</div><div><div class="rol-n">${esc(nomL(a))}</div><div class="kv"><b>Función en la ruta</b><span>${esc(A[a].funcion)}</span><b>Tensión conocida</b><span>${esc(A[a].tension)}</span><b>Grupo</b><span>${esc(A[a].grupo)}</span></div></div></div>
      <h2>${ico("navegacion-blueprint")}${esc(R.intervieneTitulo)}</h2>${intervencionHtml(a)}<p class="mini" style="margin-top:8px">${esc(R.intervieneNota)}</p>
      <details data-det="terminos"><summary>${esc(R.terminosTitulo)}</summary><dl class="info">${BP.terminos.map(t => `<dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd>`).join("")}</dl></details>`;
  }
  const ult = i === O.pasos.length - 1, hecho = !!S.consent;
  return `<div class="hoja"><div class="card orient">
    <div class="orient-pasos" aria-hidden="true">${O.pasos.map((p, k) => `<span class="${k === i ? "on" : k < i ? "hecha" : ""}">${k + 1}. ${esc(p.n)}</span>`).join("")}</div>
    ${c}
    <div class="nav-row">${i > 0 ? `<button type="button" class="btn outline" data-act="orient" data-arg="${i - 1}">${ico("acciones-anterior")}Anterior</button>` : ""}<span class="sp"></span><span class="mini">Orientación · ${i + 1} de ${O.pasos.length}</span><button type="button" class="btn" data-act="orient" data-arg="${i + 1}">${ult ? (hecho ? "Volver a la simulación" : "Continuar a la declaración") : "Siguiente"}${ico("acciones-siguiente")}</button></div>
  </div></div>`;
}

/* ---------- Declaración de participación voluntaria ---------- */
function contactoHtml() {
  const e = CFG.estudio, filas = [["Investigador responsable", e.investigador], ["Contacto", e.contacto], ["Director de la investigación", e.director], ["Comité de ética", e.comite], ["Fecha límite para participar", e.cierre]].filter(x => x[1]);
  return filas.length ? `<div class="kv">${filas.map(x => `<b>${esc(x[0])}</b><span>${esc(x[1])}</span>`).join("")}</div>` : `<p class="mini">Si tiene preguntas sobre el estudio, escriba a la persona que le envió este enlace.</p>`;
}
function vistaConsentimiento() {
  const k = S.cons, conDatos = k.anonimo === "no";
  const casilla = (d, req) => `<label class="check"><input type="checkbox" data-in="c-decl" data-arg="${esc(d.id)}" ${k.decl[d.id] ? "checked" : ""}><span>${esc(d.t)}${req ? ' <span class="req">(necesaria para participar)</span>' : ""}</span></label>`;
  return `<div class="hoja"><div class="card consent">
    <h1 tabindex="-1">${ico("gobernanza-etica")}${esc(CONS.titulo)}</h1><p>${esc(CONS.intro)}</p>
    <dl class="info">${CONS.info.map(i => `<dt>${esc(i.t)}</dt><dd>${esc(plantilla(i.d))}</dd>`).join("")}</dl>
    ${CONS.adicional ? `<p>${esc(plantilla(CONS.adicional))}</p>` : ""}
    <h2>${ico("actores-referente-juridico")}${esc(CONS.contactoTitulo)}</h2>${contactoHtml()}
    <fieldset class="bloque"><legend>${ico("acciones-aceptar", "sm")}${esc(CONS.declaracionesTitulo)}</legend>${CONS.declaraciones.map(d => casilla(d, d.req)).join("")}</fieldset>
    <fieldset class="bloque"><legend>${ico("actores-participante", "sm")}${esc(CONS.datosTitulo)}</legend><p class="mini">${esc(CONS.datosIntro)}</p>${opt("c-anon", "anonimo", CONS.anonimo, k.anonimo)}
      ${conDatos ? `<div class="datos-grid">${CONS.datos.map(d => `<label>${esc(d.n)}<input type="${d.tipo}" data-in="c-dato" data-arg="${esc(d.id)}" value="${esc(k.datos[d.id] || "")}" autocomplete="${d.auto}" maxlength="200"${d.tipo === "number" ? ' min="0" max="80" inputmode="numeric"' : ""}></label>`).join("")}</div>${casilla(CONS.declaracionDatos, false)}<label class="check"><input type="checkbox" data-in="c-resumen" ${k.resumen ? "checked" : ""}><span>${esc(CONS.resumen.t)}</span></label>` : ""}
    </fieldset>${errHtml()}
    <div class="nav-row"><button type="button" class="btn outline" data-act="orient" data-arg="0">${ico("acciones-anterior")}Volver a la orientación</button><span class="sp"></span><button type="button" class="btn outline" data-act="consent-no">${esc(CONS.rechazar)}</button><button type="button" class="btn green" data-act="consent-si">${ico("acciones-aceptar")}${esc(CONS.aceptar)}</button></div>
  </div></div>`;
}
const vistaRechazo = () => `<div class="hoja"><div class="card"><h1 tabindex="-1">${esc(CONS.rechazoTitulo)}</h1><p>${esc(CONS.rechazoTexto)}</p><div class="nav-row"><button type="button" class="btn" data-act="volver-acceso">Volver al inicio</button></div></div></div>`;
const vistaRetirado = () => `<div class="hoja"><div class="card"><h1 tabindex="-1">Se retiró del estudio</h1><p>Sus respuestas se borraron de este dispositivo. ${S.retiroServidor === true ? "El servidor del estudio eliminó las que ya se habían enviado." : S.retiroServidor === false ? "No fue posible avisar al servidor del estudio: pida al investigador que elimine las respuestas que ya se habían enviado." : "Si ya había entregado un archivo, pida al investigador que lo elimine."} Gracias por su tiempo.</p><div class="nav-row"><button type="button" class="btn" data-act="volver-acceso">Volver al inicio</button></div></div></div>`;

/* ---------- Simulación: piezas ---------- */
function progresoHtml() {
  const rd = rondaAct(), b = rd.estado === "en_curso" ? bloqueActual() : null, modo = modoActual();
  const hechos = PASOS.filter(p => (rd.pasos[p.id] || {}).estado === "completado").length;
  let h = `<div class="progress" role="img" aria-label="Recorrido de la ronda: ${hechos} de ${PASOS.length} pasos completados${b ? "; ahora " + b.pasos.join(", ") : ""}">`, fase = null;
  PASOS.forEach(p => {
    if (fase && p.fase !== fase) h += `<span class="gap"></span>`; fase = p.fase;
    const mia = !!actividadDe(p, S.yo.actor, modo);
    const cls = (rd.pasos[p.id] || {}).estado === "completado" ? "completado" : b && b.pasos.indexOf(p.id) >= 0 ? "actual" : "pendiente";
    h += `<span class="pstep ${cls}${mia ? " mia" : ""}" title="${esc(p.id)} · ${esc(p.n)}${mia ? " · su rol interviene" : ""}"><span>${esc(p.id)}</span><span class="fill"></span></span>`;
  });
  return h + `</div><p class="mini leyenda-prog"><span class="marca"></span>Pasos donde interviene su rol</p>`;
}
function pasoTarjeta(p, modo, actor, compacto) {
  const o = p[vModo(modo)], fase = SB.fases.filter(f => f.id === p.fase)[0];
  const fila = (n, x, cid) => `<div class="paso-fila lane-${cid}"><b>${ico(ICO.carril[cid], "sm")}${esc(n)}</b><span>${x && x.a ? `<span class="chip ${x.a === "modulo" ? "ch-teal" : x.a === actor ? "ch-navy" : "ch-grey"}">${icoActor(x.a, "sm")}${esc(nom(x.a))}</span> ` : ""}${esc(typeof x === "string" ? x : (x ? x.t : "—"))}</span></div>`;
  const propio = (o.otros || {})[actor] ? fila("Su entidad", { a:actor, t:o.otros[actor] }, "front") : "";
  const resto = fila("Contacto", o.contacto, "contacto") + fila("Custodia", o.back, "back") + fila("Soporte", o.soporte, "soporte");
  return `<div class="paso-card"><div class="step-banner"><span class="step-tag">${esc(p.id)}</span><span class="step-name">${esc(p.n)}</span><span class="step-day">${esc(fase.n)} · ${esc(p.dia)}</span></div>${fila("M.P.", o.mp, "mp")}${fila("Decide", o.front, "front")}${propio}${compacto ? `<details data-det="paso-${esc(p.id)}"><summary>Ver contacto, custodia y soporte</summary>${resto}</details>` : resto}</div>`;
}
function recorridoHtml(resaltar) {
  const s = S.ses, modo = modoActual(), v = vModo(modo), r0 = s.rondaActual, b = rondaAct().estado === "en_curso" ? bloqueActual() : null;
  const esCur = pid => !!(b && b.pasos.indexOf(pid) >= 0);
  const LANE = { mp:"M.P.", contacto:"Contacto", front:"Decide", back:"Custodia", soporte:"Soporte" };
  let h = `<div class="twrap sb-wrap" style="zoom:${S.zoom || 1}"><table class="sb"><thead><tr><th class="sb-lane sb-corner"><span class="sr-only">Carriles en filas, pasos en columnas</span></th>${SB.fases.map(f => `<th scope="colgroup" class="sb-fase sb-${f.id}" colspan="${PASOS.filter(p => p.fase === f.id).length}">${ico(ICO.fase[f.id])}<b>${esc(f.n)}</b><span class="mini">${esc(f.sub)}</span><span class="fase-chev"></span></th>`).join("")}</tr><tr><th class="sb-lane sb-corner2"></th>${PASOS.map(p => `<th scope="col" class="sb-paso ${esCur(p.id) ? "actual" : ""}"><span class="step-tag sm">${esc(p.id)}</span>${ico(ICO.paso[p.id], "sm")}${esc(p.n)}<span class="mini">${esc(p.dia)}</span>${esCur(p.id) ? `<span class="chip ch-navy">${ico("estados-en-curso", "sm")}paso actual</span>` : ""}</th>`).join("")}</tr></thead><tbody>`;
  SB.carriles.forEach(c => {
    if (SB.lineas[c.id]) h += `<tr class="sb-line"><td colspan="${PASOS.length + 1}"><span>${ico(ICO.linea[c.id], "sm")}${esc(SB.lineas[c.id])}</span></td></tr>`;
    h += `<tr class="sb-row-${c.id}"><th scope="row" class="sb-lane" title="${esc(c.n)} · ${esc(c.sub)}"><span class="lane-v">${ico(ICO.carril[c.id])}<b>${esc(LANE[c.id] || c.n)}</b></span></th>`;
    PASOS.forEach(p => {
      const o = p[v]; let cell = "";
      if (c.id === "mp") cell = `<div class="sb-cell ${resaltar === "tra" ? "es-actor" : ""}">${esc(o.mp)}</div>`;
      else if (c.id === "contacto") cell = `<div class="sb-cell">${esc(o.contacto)}</div>`;
      else {
        const x = o[c.id];
        cell = x ? `<div class="sb-cell ${x.a && x.a === resaltar ? "es-actor" : ""}">${x.a ? `<span class="chip ${x.a === "modulo" ? "ch-teal" : "ch-navy"}">${icoActor(x.a, "sm")}${esc(nom(x.a))}</span> ` : ""}${esc(x.t)}</div>` : "—";
        if (c.id === "front" && (o.otros || {})[resaltar]) cell += `<div class="sb-cell es-actor"><span class="chip ch-navy">${icoActor(resaltar, "sm")}${esc(nom(resaltar))}</span> ${esc(o.otros[resaltar])}</div>`;
      }
      const mio = miActividad(r0, p.id), aqui = mio && (c.id === "mp" ? resaltar === "tra" : (o[c.id] && o[c.id].a === resaltar) || (c.id === "front" && (o.otros || {})[resaltar]));
      if (aqui) cell += `<div class="sb-regs"><span class="chip ch-teal">${ico("estados-completado", "sm")}su respuesta</span></div>`;
      h += `<td class="${esCur(p.id) ? "actual" : ""}">${cell}</td>`;
    });
    h += `</tr>`;
  });
  h += `<tr class="sb-row-chips"><th scope="row" class="sb-lane sb-lane-chips"><span class="lane-v">${ico(v === "hoy" ? "capitulos-tensiones-rupturas" : "gobernanza-contrato-datos")}<b>${v === "hoy" ? "Rupturas" : "Reglas"}</b></span></th>${PASOS.map(p => `<td><div class="sb-chips">${p[v].ch.map(k => typeof k === "number" ? `<span class="chip ch-teal">${CIRC[k]} ${esc(BP.reglas[k - 1].nombre)}</span>` : `<span class="chip ch-red" title="${esc((BP.rupturas.filter(x => x.id === k)[0] || {}).t || k)}">${esc(k)}</span>`).join(" ")}</div></td>`).join("")}</tr></tbody></table></div><p class="sb-legend">${SB.carriles.map(c => `<b>${esc(LANE[c.id] || c.n)}</b> · ${esc(c.n)}: ${esc(c.sub)}`).join(" &nbsp;·&nbsp; ")}</p>`;
  return h;
}
const zoomTools = () => `<div class="sb-tools"><button type="button" class="zoom" data-act="sb-zoom" data-arg="out" aria-label="Reducir el recorrido">−</button><span class="zoom-val">${Math.round((S.zoom || 1) * 100)} %</span><button type="button" class="zoom" data-act="sb-zoom" data-arg="in" aria-label="Ampliar el recorrido">+</button><button type="button" class="zoom fit" data-act="sb-zoom" data-arg="fit">Ajustar</button></div>`;
function infoDisponible(p, actor, modo) {
  const piezas = ESC.entradas[p.id] || [];
  if (!piezas.length) return `<p class="mini">Este paso no requiere consultar piezas de evidencia.</p>`;
  return `<div class="twrap"><table class="t apila"><thead><tr><th scope="col">Pieza</th><th scope="col">Custodio</th><th scope="col">${modo === "actual" ? "Cómo llega hoy" : "Qué puede ver con el módulo"}</th></tr></thead><tbody>${piezas.map(pz => {
    let txt, no = false;
    if (EV[pz].cust === actor) txt = "Es evidencia que usted custodia: la tiene en origen.";
    else if (modo === "actual") txt = "Por oficio, por correo o en papel, según llegue. Campos de la pieza: " + EV[pz].campos.join(", ") + ".";
    else { const vv = vistaDe(actor, pz, p.id); if (vv) txt = camposTxt(pz, vv) + " (" + vv.length + " de " + EV[pz].campos.length + " campos)."; else { no = true; txt = (A[actor].fuera || []).indexOf(pz) >= 0 ? "Fuera de su finalidad: la consulta se deniega y queda registrada." : "No está en su contrato de consulta."; } }
    return `<tr><td>${ico(ICO.ev[pz], "sm")}<b>${esc(EV[pz].sl)}</b> ${esc(EV[pz].n)}</td><td>${esc(nom(EV[pz].cust))}</td><td${no ? ' class="regla-no"' : ""}>${esc(txt)}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}
// Datos sintéticos del caso para el carril del actor en una etapa E1 a E5.
function celdaDe(p, actor, modo) {
  if (p.fase !== "durante") return null;
  const k = ["F1", "F2", "F3", "F5"].filter(f => { const c = BP.celdas[p.id + f]; return c && (c.a === actor || (c.t || []).indexOf(actor) >= 0); })[0];
  return k ? BP.celdas[p.id + k][vModo(modo)] : null;
}
function situacionHtml(p, actor, modo, act) {
  const reto = SIM.retos.filter(x => x.actor === actor && (x.etapa === p.id || x.etapa === "*") && GUION.retosOmitidos.indexOf(x.id) < 0)[0], c = celdaDe(p, actor, modo);
  if (!reto && !c) return "";
  return `<div class="situacion"><div class="lbl">${ico("navegacion-escenario", "sm")}Su situación en este paso</div>
    ${reto ? `<p><b>${esc(reto.titulo)}.</b> ${esc(reto[vModo(modo)])}</p>` : ""}
    ${c ? `<div class="kv"><b>Evidencia</b><span>${esc(c.ev)}</span><b>Responsable y plazo</b><span>${esc(c.r)}</span><b>Registro</b><span>${esc(c.tz)}</span></div>` : ""}
    ${reto && reto.base && reto.base.length ? `<details data-det="base-${esc(p.id)}"><summary>Base normativa</summary><ul class="lista">${reto.base.map(k => `<li>${esc(SIM.normas[k] || k)}</li>`).join("")}</ul></details>` : ""}</div>`;
}
function simuladosHtml(regs, titulo) {
  if (!regs.length) return "";
  return `<div class="simulados"><div class="lbl">${ico("actores-modulo", "sm")}${esc(titulo)}</div><ul class="lista limpia">${regs.map(r => `<li>${ico(ICO.tipo[r.tipo], "sm")}<span>${esc(fraseRegistro(r))}${r.tipo === "consulta" && !r.payload.denegada && !r.payload.metadatos && r.payload.campos.length < EV[r.payload.pieza].campos.length ? `. <span class="mini">Retenido en origen: ${esc(retenidosTxt(r.payload.pieza, r.payload.campos))}</span>` : ""}</span> ${r.payload.simulado ? chipSim : ""}</li>`).join("")}</ul></div>`;
}
function formActividad(p, act, modo) {
  const f = S.form, yo = S.yo.actor, r = S.ses.rondaActual;
  const dias = `<input type="number" min="0" max="3650" step="1" inputmode="numeric" data-in="f-dias" value="${esc(f.dias == null ? "" : f.dias)}" style="width:110px">`;
  let h = "";
  if (act.tipo === "decide") {
    h += `<fieldset><legend>${ico("investigacion-completitud", "sm")}1. ¿La información disponible es suficiente para actuar?</legend>${opt("f", "suficiencia", ESC.suficiencia, f.suficiencia)}${f.suficiencia && f.suficiencia !== "suficiente" ? `<div class="campos"><span class="mini">¿Qué falta? Marque las piezas.</span><br>${Object.keys(EV).map(k => `<label><input type="checkbox" data-in="f-falta" data-arg="${k}" ${(f.falta || []).indexOf(k) >= 0 ? "checked" : ""}>${esc(EV[k].sl)} · ${esc(EV[k].n)}</label>`).join("")}</div>` : ""}</fieldset>`;
    h += `<fieldset><legend>${ico("gobernanza-finalidad", "sm")}2. ¿Con qué finalidad consulta la evidencia?</legend><select data-in="f-finalidad" aria-label="Finalidad de la consulta"><option value="">Elija una finalidad…</option>${ESC.finalidades.map(x => `<option value="${x.id}" ${f.finalidad === x.id ? "selected" : ""}>${esc(x.n)}</option>`).join("")}</select><p class="mini">Elija la que usaría en la práctica.</p></fieldset>`;
    h += `<fieldset><legend>${ico("acciones-decidir", "sm")}3. Su decisión</legend>${opt("f", "decision", act.ops, f.decision)}</fieldset>`;
    h += `<fieldset><legend>${ico("gobernanza-responsable-plazo", "sm")}4. ¿Quién responde por esta decisión y en cuántos días?</legend><div class="row"><label>Responde<select data-in="f-responde"><option value="">Elija…</option><option value="yo" ${f.responde === "yo" ? "selected" : ""}>Mi entidad (${esc(nom(yo))})</option>${BP.actores.filter(a => a.id !== yo).map(a => `<option value="${a.id}" ${f.responde === a.id ? "selected" : ""}>${esc(a.n)}</option>`).join("")}<option value="nadie" ${f.responde === "nadie" ? "selected" : ""}>Nadie claramente</option></select></label><label>Días${dias}</label></div>${modo === "propuesto" ? `<div class="campos" style="margin-top:8px"><span class="mini">¿A quién notifica? El módulo registra el acuse de cada uno.</span><br>${BP.actores.filter(a => a.id !== yo).map(a => `<label><input type="checkbox" data-in="f-notifica" data-arg="${a.id}" ${(f.notifica || []).indexOf(a.id) >= 0 ? "checked" : ""}>${esc(a.corto)}</label>`).join("")}</div>` : ""}</fieldset>`;
  } else if (act.tipo === "custodia") {
    const sim = regsDe({ ronda:r, paso:p.id }).filter(x => (x.tipo === "solicitud" || x.tipo === "consulta") && x.payload.a === yo);
    h += simuladosHtml(sim, modo === "actual" ? "Lo que le piden" : "Lo que el módulo ya entregó de su evidencia");
    h += `<fieldset><legend>${ico("acciones-entregar", "sm")}1. ¿Qué responde?</legend>${opt("f", "respuesta", ESC.respCustodia, f.respuesta)}</fieldset><fieldset><legend>${ico("investigacion-tiempo", "sm")}2. ¿Cuántos días le toma?</legend><label class="sr-only" for="f-dias-c">Días</label>${dias.replace("<input", '<input id="f-dias-c"')}</fieldset>`;
  } else if (act.tipo === "focal") {
    h += `<fieldset><legend>${ico("acciones-ver-detalle", "sm")}1. En este paso, ¿sabe qué pasa con su caso?</legend>${opt("f", "sabe", ESC.focal.sabe, f.sabe)}</fieldset>`;
    h += `<fieldset><legend>${ico("gobernanza-responsable-plazo", "sm")}2. ¿Quién le responde y en cuántos días?</legend><div class="row"><label>Le responde<select data-in="f-responde"><option value="">Elija…</option>${BP.actores.filter(a => a.id !== "tra").map(a => `<option value="${a.id}" ${f.responde === a.id ? "selected" : ""}>${esc(a.n)}</option>`).join("")}<option value="nadie" ${f.responde === "nadie" ? "selected" : ""}>No sé</option></select></label><label>Días (si lo sabe)${dias}</label></div></fieldset>`;
    h += `<fieldset><legend>${ico("investigacion-reprocesos", "sm")}3. ¿Qué tuvo que hacer usted? Puede marcar varias.</legend>${opt("fm", "hizo", ESC.focal.hizo, f.hizo, true)}</fieldset>`;
  } else if (act.tipo === "soporte") {
    h += `<fieldset><legend>${ico("acciones-ver-detalle", "sm")}1. ¿Qué alcanza a ver del caso?</legend>${opt("f", "ve", ESC.soporte.ve, f.ve)}</fieldset><fieldset><legend>${ico("acciones-vigilar", "sm")}2. ¿Qué acción toma?</legend>${opt("f", "accion", ESC.soporte.accion, f.accion)}</fieldset>`;
  }
  h += `<fieldset><legend>${ico("acciones-observar", "sm")}Observación (opcional)</legend><input type="text" data-in="f-obs" aria-label="Observación" value="${esc(f.obs || "")}" maxlength="600" class="ancho" placeholder="Qué le llamó la atención, qué faltó o qué chocó"></fieldset>`;
  return h;
}
const ETQ = { suficiencia:"Información", falta:"Faltó", finalidad:"Finalidad", decisionTxt:"Decisión", responde:"Responde", dias:"Días", notifica:"Notifica a", obs:"Observación", respuesta:"Respuesta", sabe:"Qué sabe", hizo:"Qué tuvo que hacer", ve:"Qué ve", accion:"Acción" };
function valorTxt(k, v, yo) {
  if (k === "suficiencia") return etiqueta(ESC.suficiencia, v);
  if (k === "finalidad") return finTxt(v);
  if (k === "responde") return v === "yo" ? "Mi entidad (" + nom(yo) + ")" : v === "nadie" ? (yo === "tra" ? "No sé" : "Nadie claramente") : nomL(v);
  if (k === "notifica") return v.map(nom).join(", ");
  if (k === "falta") return v.map(x => EV[x] ? EV[x].sl : x).join(", ");
  if (k === "respuesta") return etiqueta(ESC.respCustodia, v);
  if (k === "sabe") return etiqueta(ESC.focal.sabe, v);
  if (k === "hizo") return v.map(x => etiqueta(ESC.focal.hizo, x)).join(", ");
  if (k === "ve") return etiqueta(ESC.soporte.ve, v);
  if (k === "accion") return etiqueta(ESC.soporte.accion, v);
  return Array.isArray(v) ? v.join(", ") : String(v);
}
function respuestaKv(pl, yo) {
  return `<div class="kv done-kv">${Object.keys(ETQ).filter(k => pl[k] != null && pl[k] !== "" && !(Array.isArray(pl[k]) && !pl[k].length)).map(k => `<b>${esc(ETQ[k])}</b><span>${esc(valorTxt(k, pl[k], yo))}</span>`).join("")}</div>`;
}
function resultadoHtml(p, modo, reg) {
  const pl = reg.payload, c = pl.comprobacion, yo = S.yo.actor, sig = posicion().sig;
  const efectos = vigentes().filter(x => x.payload && x.payload.origenActividad === reg.id);
  let comp = "";
  if (c) {
    const perm = Object.keys(c.piezasPermitidas).map(k => EV[k].sl + " " + c.piezasPermitidas[k].length + " de " + EV[k].campos.length).join(" · ");
    comp = `<div class="comprobacion"><div class="lbl">${ico("gobernanza-contrato-datos", "sm")}Comprobación frente al contrato de datos de su rol</div><p>Finalidad declarada «${esc(finTxt(pl.finalidad))}»: ${c.finalidadAutorizada ? `<span class="regla-ok">autorizada para ${esc(nom(yo))}</span>` : `<span class="regla-no">no autorizada para ${esc(nom(yo))}</span>`}.${perm ? " Vista mínima: " + esc(perm) + "." : ""}${c.piezasDenegadas.length ? ` Fuera de su contrato: <span class="regla-no">${esc(c.piezasDenegadas.map(k => EV[k].sl).join(", "))}</span>.` : ""}${c.piezasPropias.length ? " Evidencia propia: " + esc(c.piezasPropias.map(k => EV[k].sl).join(", ")) + "." : ""}</p><p class="mini">${modo === "actual" ? "Hoy nadie hace esta comprobación. Se registra para comparar con la ronda 2." : "Con el módulo, esta comprobación se hace en cada consulta y queda registrada."}</p></div>`;
  }
  return `<div class="qpanel ok">${ico("estados-guardado")}Respuesta guardada · ${esc(hora(reg.t))}${reg.version > 1 ? " · corregida (la anterior queda en el historial)" : ""}</div>
    ${respuestaKv(pl, yo)}${comp}${simuladosHtml(efectos, "Qué ocurrió en la simulación después de su respuesta")}
    <div class="nav-row"><button type="button" class="btn outline" data-act="rectificar">${ico("acciones-editar")}Corregir mi respuesta</button><span class="sp"></span><button type="button" class="btn" data-act="continuar">${sig ? "Continuar al paso " + esc(sig.pasos[0]) : "Continuar al cierre de la ronda"}${ico("acciones-siguiente")}</button></div>`;
}
function contratoHtml(a) {
  const ac = A[a];
  const consulta = (ac.consulta || []).length ? ac.consulta.map(c => EV[c[0]].sl + ": " + camposTxt(c[0], c[1]) + " (" + c[1].length + " de " + EV[c[0]].campos.length + ")").join(" · ") + (ac.consultaNota ? " · " + ac.consultaNota : "") : (ac.consultaTxt || "—");
  const entrega = ac.entrega ? EV[ac.entrega.p].sl + ": " + camposTxt(ac.entrega.p, ac.entrega.ent) + (ac.entrega.ret.length ? " · retiene en origen: " + camposTxt(ac.entrega.p, ac.entrega.ret) : "") + (ac.entrega.nota ? " · " + ac.entrega.nota : "") : (ac.entregaTxt || "—");
  return `<div class="kv"><b>Contrato</b><span>${esc(ac.contrato)}</span><b>Finalidad autorizada</b><span>«${esc(ac.fin)}»</span><b>Qué consulta</b><span>${esc(consulta)}</span><b>Qué entrega</b><span>${esc(entrega)}</span><b>Responsable y plazo</b><span>${esc(ac.resp)} · ${esc(ac.plazo)}</span><b>Notifica a</b><span>${esc(ac.notifica)}</span><b>Registro</b><span>${esc(ac.traza)}</span></div>`;
}
function rondaIntroHtml(r) {
  const G = GUION.rondas[r.modo], bs = bloques(r.id), acts = bs.filter(b => b.tipo === "actividad");
  return `<div class="pmain-head"><div><div class="eyebrow">Ronda ${ESC.rondas.indexOf(r) + 1} de ${ESC.rondas.length}</div><h1 class="h1" tabindex="-1">${ico(ICO.modo[r.modo])}${esc(G.titulo)}</h1></div></div>
    ${G.parrafos.map(p => `<p>${esc(p)}</p>`).join("")}
    ${r.modo === "propuesto" ? `<h2>${ico("gobernanza-contrato-datos")}${esc(G.reglasTitulo)}</h2><ol class="reglas">${BP.reglas.map(x => `<li>${ico(ICO.regla[x.n])}<span><b>${esc(x.nombre)}.</b> ${esc(x.enun)}</span></li>`).join("")}</ol><h2>${icoActor(S.yo.actor)}El contrato de datos de su rol</h2>${contratoHtml(S.yo.actor)}` : ""}
    <div class="guia">${ico("navegacion-blueprint")}<div><b>Su recorrido en esta ronda.</b> ${acts.length ? "Interviene en " + plural(acts.length, "paso", "pasos") + ": " + esc(acts.map(b => b.pasos[0]).join(", ")) + ". En los demás lee el contexto." : "Su rol no tiene actividades en esta ronda: lee el contexto."} Al final valora el contrato y responde cuatro preguntas.</div></div>
    <button type="button" class="btn big" data-act="ronda-iniciar" style="margin-top:18px">${ico("acciones-iniciar")}Comenzar la ronda</button>`;
}
function valoracionHtml(r) {
  const v = S.val, yo = S.yo, hecha = valoracionHecha(r.id), sig = ESC.rondas[ESC.rondas.indexOf(r) + 1];
  if (hecha && !v.rectificando) {
    const val = regsDe({ ronda:r.id, tipo:"valoracion", participanteId:yo.id })[0], pre = regsDe({ ronda:r.id, tipo:"preguntas", participanteId:yo.id })[0];
    return `<div class="qpanel ok">${ico("estados-guardado")}Valoración y respuestas guardadas · ${esc(hora(pre.t))}</div>
      <div class="kv done-kv"><b>Contrato</b><span>${esc(etiqueta(ESC.valoracion.semaforo, val.payload.semaforo))}${val.payload.ajuste ? " · " + esc(val.payload.ajuste) : ""}</span><b>Frente a hoy</b><span>${esc(etiqueta(ESC.valoracion.mejora, val.payload.mejora))}</span>${ESC.preguntas.map(q => `<b>${esc(q.id)}</b><span>${esc(q.tipo === "multi" ? (pre.payload[q.id] || []).map(x => etiqueta(q.ops, x)).join(", ") : q.tipo === "texto" ? pre.payload[q.id] : etiqueta(q.ops, pre.payload[q.id]))}${pre.payload[q.id + "cual"] ? " · " + esc(pre.payload[q.id + "cual"]) : ""}</span>`).join("")}</div>
      <div class="nav-row"><button type="button" class="btn outline" data-act="val-rectificar">${ico("acciones-editar")}Corregir mi valoración</button><span class="sp"></span><button type="button" class="btn" data-act="ronda-cerrar">${sig ? "Continuar a la ronda " + (ESC.rondas.indexOf(sig) + 1) : "Terminar y pasar a la entrega"}${ico("acciones-siguiente")}</button></div>`;
  }
  return `<div class="actividad"><div class="qpanel">Valore el contrato de datos de ${esc(nomL(yo.actor))} tal como lo recorrió en esta ronda (${r.modo === "actual" ? "la ruta como funciona hoy" : "la ruta con el módulo propuesto"}) y responda las cuatro preguntas.</div>
    <details data-det="contrato"><summary>Ver el contrato de datos de su rol</summary>${contratoHtml(yo.actor)}</details>
    <fieldset><legend>${ico("capitulos-validacion-contratos", "sm")}El contrato de su rol</legend>${opt("v", "semaforo", ESC.valoracion.semaforo, v.semaforo)}${v.semaforo === "ajustar" || v.semaforo === "rechazar" ? `<input type="text" data-in="v-ajuste" aria-label="Qué cambiaría del contrato" value="${esc(v.ajuste || "")}" maxlength="600" class="ancho" placeholder="Qué cambiaría y por qué${v.semaforo === "rechazar" ? " (necesario si rechaza)" : ""}">` : ""}</fieldset>
    <fieldset><legend>${ico("investigacion-cambio-observado", "sm")}Frente a hoy, esta forma de trabajar es…</legend>${opt("v", "mejora", ESC.valoracion.mejora, v.mejora)}${r.modo === "actual" ? `<p class="mini">${esc(GUION.rondas.actual.notaMejora)}</p>` : ""}</fieldset>
    ${ESC.preguntas.map(q => `<fieldset><legend>${ico(ICO.sub[q.sub], "sm")}${esc(q.id)}. ${esc(q.t)}</legend>${q.tipo === "texto" ? `<input type="text" data-in="v-p" data-arg="${q.id}" aria-label="${esc(q.t)}" value="${esc(v[q.id] || "")}" maxlength="800" class="ancho" placeholder="Escriba al menos un requisito concreto">` : opt(q.tipo === "multi" ? "vm" : "v", q.id, q.ops, v[q.id], q.tipo === "multi")}${q.cual && (q.tipo === "multi" ? (v[q.id] || []).length && (v[q.id] || []).indexOf("ninguna") < 0 : v[q.id] && v[q.id] !== "si") ? `<input type="text" data-in="v-p" data-arg="${q.id}cual" aria-label="${esc(q.cual)}" value="${esc(v[q.id + "cual"] || "")}" maxlength="600" class="ancho" placeholder="${esc(q.cual)}">` : ""}</fieldset>`).join("")}
    ${errHtml()}<button type="button" class="btn big" data-act="guardar-val" style="margin-top:18px">${ico("acciones-guardar")}Guardar valoración y respuestas</button>${v.rectificando ? `<button type="button" class="btn outline" data-act="val-cancelar" style="margin-top:10px">${ico("acciones-cerrar")}Cancelar</button>` : ""}</div>`;
}

/* ---------- Simulación: pantalla ---------- */
function vistaSimulacion() {
  const s = S.ses, yo = S.yo, rd = rondaAct(), r = rondaDef(s.rondaActual), modo = r.modo, a = avance();
  const side = `<aside class="pside" aria-label="Su rol y su avance"><div class="avatar xl">${icoActor(yo.actor)}</div><div class="pside-actor">${esc(nomL(yo.actor))}</div><div class="pside-name">usuario ${esc(S.cuenta.u)}${S.cuenta.p || CFG.demo ? " · cuenta de prueba" : ""}</div>
    <div class="callouts"><div class="callout"><b>${ico("navegacion-escenario", "sm")}Caso</b>${esc(ESC.n)}</div><div class="callout"><b>${ico(ICO.modo[modo], "sm")}Ronda</b>${esc(r.n)}</div><div class="callout"><b>${ico("capitulos-indicadores", "sm")}Su avance</b>${a.hechas} de ${a.total} respuestas<div class="meter"><span style="width:${a.pct}%"></span></div></div></div>
    <p class="mini" style="margin-top:12px">${esc(ESC.nota)}</p>
    <button type="button" class="btn outline sm" data-act="orient-ver">${ico("navegacion-guia", "sm")}Ver la orientación</button>
    <button type="button" class="enlace" data-act="retirar">Retirarme del estudio</button></aside>`;
  let main;
  if (rd.estado === "pendiente") main = rondaIntroHtml(r);
  else if (rd.estado === "valoracion") main = `<div class="pmain-head"><div><div class="eyebrow">${esc(r.n)}</div><h1 class="h1" tabindex="-1">${ico("capitulos-validacion-contratos")}Cierre de la ronda</h1></div><div class="head-right"><span class="chip ch-navy">${ico(ICO.estado.valoracion, "sm")}valoración</span></div></div>${progresoHtml()}${valoracionHtml(r)}`;
  else {
    const b = bloqueActual(), verTodo = `<button type="button" class="btn green" data-act="ver-todo">${S.verTodo ? ico("acciones-filtrar", "sm") + "Ver solo este paso" : ico("acciones-expandir", "sm") + "Ver la ruta completa"}</button>`;
    const completo = S.verTodo ? `<div class="panel"><div class="row"><h2 style="margin-right:auto">${ico("navegacion-blueprint")}La ruta completa en esta ronda</h2>${zoomTools()}</div>${recorridoHtml(yo.actor)}<p class="mini" style="margin-top:8px">Las intervenciones de su rol aparecen resaltadas.</p></div>` : "";
    if (b.tipo === "contexto") {
      const sig = posicion().sig;
      main = `<div class="pmain-head"><div><div class="eyebrow">${esc(r.n)}</div><h1 class="h1" tabindex="-1">${ico(ICO.actividad.contexto)}${b.pasos.length > 1 ? "Pasos " + esc(b.pasos[0]) + " a " + esc(b.pasos[b.pasos.length - 1]) : "Paso " + esc(b.pasos[0])}: contexto</h1></div><div class="head-right"><span class="chip ch-grey">${ico("acciones-observar", "sm")}su rol no interviene</span>${verTodo}</div></div>${progresoHtml()}
        <div class="qpanel">${esc(GUION.contexto.instr)}</div>${b.pasos.map(pid => pasoTarjeta(PASOS[PIDX[pid]], modo, yo.actor, true)).join("")}
        <fieldset class="bloque"><legend>${ico("acciones-observar", "sm")}${esc(GUION.contexto.obs)}</legend><input type="text" data-in="x-obs" aria-label="Observación sobre estos pasos" value="${esc(S.ctxObs || "")}" maxlength="600" class="ancho"></fieldset>
        <div class="nav-row"><span class="sp"></span><button type="button" class="btn" data-act="continuar">${sig ? "Continuar al paso " + esc(sig.pasos[0]) : "Continuar al cierre de la ronda"}${ico("acciones-siguiente")}</button></div>${completo}`;
    } else {
      const p = pasoActual(), act = b.act, mio = miActividad(s.rondaActual, p.id), editando = !mio || S.form.rectificando;
      const cuerpo = editando ? `<div class="actividad"><div class="qpanel">${esc(act.tipo === "custodia" && modo === "propuesto" ? act.instrMod : act.instr)}</div>${situacionHtml(p, yo.actor, modo, act)}${act.tipo === "decide" ? `<details data-det="info" open><summary>Información disponible en este paso</summary>${infoDisponible(p, yo.actor, modo)}</details>` : ""}${formActividad(p, act, modo)}${errHtml()}<button type="button" class="btn big" data-act="guardar" style="margin-top:18px">${ico("acciones-guardar")}Guardar mi respuesta</button>${mio ? `<button type="button" class="btn outline" data-act="cancelar-rect" style="margin-top:10px">${ico("acciones-cerrar")}Cancelar</button>` : ""}</div>` : resultadoHtml(p, modo, mio);
      main = `<div class="pmain-head"><div><div class="eyebrow">${esc(r.n)}</div><h1 class="h1" tabindex="-1">${ico(ICO.actividad[act.tipo])}${esc(act.titulo)}</h1></div><div class="head-right"><span class="chip ${editando ? "ch-navy live" : "ch-teal"}">${ico(editando ? "estados-en-curso" : "estados-completado", "sm")}${editando ? "su turno" : "respondida"}</span>${verTodo}</div></div>${progresoHtml()}
        <div class="lbl" style="margin-bottom:6px">${ico("navegacion-blueprint", "sm")}Qué ocurre en este paso</div>${pasoTarjeta(p, modo, yo.actor, false)}<div class="sep-bloque"></div>${cuerpo}${completo}`;
    }
  }
  return `<div class="pcard">${side}<div class="pmain">${main}</div></div>`;
}

/* ---------- Entrega ---------- */
function misRespuestasHtml() {
  const filas = vigentes().filter(r => r.origen === "participante").map(r => {
    const pl = r.payload, txt = r.tipo === "actividad" ? resumenActividad(pl) + (pl.obs ? " · «" + pl.obs + "»" : "") : r.tipo === "valoracion" ? etiqueta(ESC.valoracion.semaforo, pl.semaforo) + " · " + etiqueta(ESC.valoracion.mejora, pl.mejora) : r.tipo === "preguntas" ? ESC.preguntas.map(q => q.id + ": " + (Array.isArray(pl[q.id]) ? pl[q.id].join(", ") : pl[q.id])).join(" · ") : pl.texto || "";
    return `<tr><td class="nw">${esc(r.ronda)}</td><td class="nw">${esc(r.paso)}</td><td class="nw">${esc(r.tipo)}</td><td>${esc(txt)}</td></tr>`;
  }).join("");
  return `<div class="twrap"><table class="t apila"><thead><tr><th scope="col">Ronda</th><th scope="col">Paso</th><th scope="col">Tipo</th><th scope="col">Lo que respondió</th></tr></thead><tbody>${filas}</tbody></table></div>`;
}
function vistaCierre() {
  const C = GUION.cierre, v = vigentes(), n = t => v.filter(r => r.origen === "participante" && r.tipo === t).length, e = S.envio || {}, obsAct = v.filter(r => r.tipo === "actividad" && r.payload.obs).length;
  const ultimo = S.regs.length ? S.regs[S.regs.length - 1].t : 0, pendienteDescarga = !S.descargado || S.descargado < ultimo;
  let entrega;
  if (CFG.envio) {
    const est = e.estado === "enviado" ? `<div class="qpanel ok">${ico("estados-completado")}<b>${esc(C.enviadoTitulo)}</b> · ${esc(fecha(e.t))}<p class="mini">${esc(C.enviadoTexto)}</p></div>` : e.estado === "enviando" ? `<div class="qpanel"><span class="spinner"></span>Enviando sus respuestas…</div>` : e.estado === "error" ? `<div class="qpanel error">${ico("estados-advertencia")}<b>${esc(C.errorTitulo)}</b><p class="mini">${esc(C.errorTexto)} Detalle: ${esc(e.error || "")}</p></div>` : `<div class="qpanel">${ico("acciones-sincronizar")}Sus respuestas están listas para enviarse.</div>`;
    entrega = `${est}<div class="row">${e.estado !== "enviado" ? `<button type="button" class="btn green" data-act="enviar">${ico("acciones-sincronizar")}${e.estado === "error" ? "Reintentar el envío" : "Enviar mis respuestas"}</button>` : ""}<button type="button" class="btn ${e.estado === "enviado" ? "outline" : "sec"}" data-act="descargar">${ico("investigacion-archivo-json")}Descargar una copia</button></div>`;
  } else {
    entrega = `<div class="qpanel ${pendienteDescarga ? "" : "ok"}">${ico(pendienteDescarga ? "acciones-exportar" : "estados-completado")}<b>${pendienteDescarga ? esc(C.archivoTitulo) : "Archivo descargado · " + esc(fecha(S.descargado))}</b><ol class="lista">${C.archivoPasos.map(x => `<li>${esc(x)}</li>`).join("")}</ol>${CFG.estudio.contacto ? `<p class="mini">Contacto del investigador: <b>${esc(CFG.estudio.contacto)}</b></p>` : ""}</div>
      <div class="row"><button type="button" class="btn green" data-act="descargar">${ico("investigacion-archivo-json")}Descargar mi archivo de respuestas</button>${puedeCompartir() ? `<button type="button" class="btn sec" data-act="compartir">${ico("acciones-compartir-enlace")}Compartir el archivo</button>` : ""}<button type="button" class="btn outline" data-act="copiar">${ico("acciones-copiar")}Copiar como texto</button></div>
      <p class="mini" style="margin-top:8px">El archivo se llama <span class="mono">${esc(nombreArchivo())}</span>. Si su navegador no descarga, use «Copiar como texto» y péguelo en un correo.</p>`;
  }
  return `<div class="hoja"><div class="card cierre">
    <div class="closing"><div class="estado-cierre ok" tabindex="-1" id="titulo-cierre">${ico("estados-cerrado", "lg")}${esc(C.titulo)}</div><p class="closing-desc">${esc(C.gracias)}</p>
      <table class="st"><thead><tr><th scope="col">Lo que registró</th><th scope="col">Cantidad</th></tr></thead><tbody><tr><td>Actividades respondidas</td><td>${n("actividad")}</td></tr><tr><td>Valoraciones del contrato</td><td>${n("valoracion")}</td></tr><tr><td>Preguntas P1 a P4 respondidas</td><td>${n("preguntas")} de ${ESC.rondas.length}</td></tr><tr><td>Observaciones</td><td>${n("observacion") + obsAct}</td></tr></tbody></table></div>
    <h2>${ico("acciones-exportar")}Entrega de sus respuestas</h2>${entrega}
    <fieldset class="bloque"><legend>${ico("acciones-observar", "sm")}${esc(C.comentario)}</legend><textarea data-in="x-comentario" aria-label="Comentario para el investigador" maxlength="2000" rows="3">${esc(S.comentario || "")}</textarea><button type="button" class="btn sec" data-act="guardar-comentario" style="margin-top:8px">${ico("acciones-guardar")}Guardar comentario</button></fieldset>
    <details data-det="mis"><summary>Ver lo que respondí</summary>${misRespuestasHtml()}</details>
    <h2>${ico("gobernanza-custodia")}Sus datos en este dispositivo</h2><p class="mini">Sus respuestas siguen guardadas en este navegador hasta que usted las borre. Si usa un computador compartido, bórrelas después de entregarlas.</p>
    <div class="row"><button type="button" class="btn danger" data-act="borrar">${ico("acciones-eliminar")}Borrar mis datos de este dispositivo</button><button type="button" class="btn outline" data-act="salir">${ico("acciones-salir")}Salir</button><span class="sp"></span><button type="button" class="enlace" data-act="retirar">Retirarme del estudio</button></div>
  </div></div>`;
}
function puedeCompartir() {
  try { return !!(navigator.canShare && typeof File !== "undefined" && navigator.canShare({ files:[new File(["{}"], "r.json", { type:"application/json" })] })); } catch (e) { return false; }
}
