/* ============ Expediente: pantallas ============ */

/* ---------- Piezas comunes ---------- */
const CHIP_ESTADO = { conforme:"ch-teal", no_conforme:"ch-red", ausente:"ch-grey", pendiente:"ch-gold" };
function chipSoporte(est) {
  return `<span class="chip ${CHIP_ESTADO[est] || "ch-grey"}">${esc(estadoN(est))}</span>`;
}
const horasTxt = h => decimalCo(h) + " h";
const estadoN = est => (EXP.estados[est] || { n:est === "pendiente" ? "Llegó, sin verificar" : est }).n;
// «13 a 2 m 21 d» → «13 años, 2 meses y 21 días»; «9 m 24 d» → «9 meses y 24 días».
const durLlano = t => typeof t !== "string" ? t : t.replace(/(\d+) a(?: (\d+) m)?(?: (\d+) d)?(?=[\s.,;·]|$)|(\d+) m(?: (\d+) d)?(?=[\s.,;·]|$)/g,
  (m, a, m1, d1, m2, d2) => listaFrase([a && plural(+a, "año", "años"), (m1 || m2) && plural(+(m1 || m2), "mes", "meses"), (d1 || d2) && plural(+(d1 || d2), "día", "días")].filter(Boolean)));
// El papel del rol en el expediente: «ARL SURA, medicina laboral y prestaciones. Custodia el dictamen de PCL y …».
const papelTxt = (caso, a) => String(a.rol || "").replace(/\.$/, "") + "." + ((a.custodia || []).length ? " Custodia " + listaFrase(a.custodia.map(k => soporteF(caso, k))) + "." : "");
const enReglaRad = (caso, pid) => { const r = deRatio(EXPM.inicioDe(caso, pid)); return r + (/^1 de/.test(r) ? " estaba en regla" : " estaban en regla"); };
/* Lo que ve el participante va en lenguaje sencillo. Los códigos del instrumento —del expediente (PI-L01),
   de los puntos (P1), de los soportes (FIR), de las tareas (R01) y de los accesos (A1)— quedan en los datos y
   en el panel del investigador, que los usa para asociar los resultados, pero no se muestran aquí. */
const nomSop = (caso, k) => { const s = EXPM.soporteDe(caso, k); return s ? s.n : String(k); };
const listaSop = (caso, ks) => (ks || []).map(k => nomSop(caso, k)).join(" · ");
const numPunto = (caso, pid) => caso.puntos.findIndex(p => p.id === pid) + 1;
const nomPunto = (caso, pid) => { const p = EXPM.puntoDe(caso, pid); return "Punto " + numPunto(caso, pid) + (p ? " · " + p.n : ""); };
const nomExp = caso => "Expediente de " + caso.persona.nombre;
const deRatio = r => String(r || "").replace(/^(\d+)\/(\d+)$/, "$1 de $2");

/* Los textos del expediente vienen del documento del instrumento y nombran puntos y soportes por su código
   («al completar P2», «vincula FIR al DIC»). Al mostrarlos se dicen por su nombre, con el artículo que
   corresponde. El catálogo no se toca: la traducción es solo de lo que se ve. IBC queda como está: es el
   nombre que usa el sector. Los números de documento (DIC-L02, RAD-L01…) también quedan: identifican los
   documentos del expediente, como en un expediente real. */
const COD_SOP_TXT = /(?:^|(?<=[\s(«"¿¡—,;:]))([A-Za-záéíóúñÁÉÍÓÚÑ]+\s+)?(SOL|ORI|REG|CAR|DIC|FIR|AFI|APT|EXP|NEX|FUN|AUD|HC)(?![\w-])/g;
const mayusIni = (t, como) => como && como.charAt(0) === como.charAt(0).toUpperCase() && como.charAt(0) !== como.charAt(0).toLowerCase() ? t.charAt(0).toUpperCase() + t.slice(1) : t;
function llano(caso, t) {
  if (typeof t !== "string" || !t || !caso) return t;
  let r = t.replace(/\bpunto P([1-9])\b/g, "punto $1")
    .replace(/\b(de|De) P([1-9])\b/g, (m, d, n2) => (d === "De" ? "Del" : "del") + " punto " + n2)
    .replace(/\b(a|A) P([1-9])\b/g, (m, a, n2) => (a === "A" ? "Al" : "al") + " punto " + n2)
    .replace(/\b([A-Za-záéíóúñ]+(?:ción|sión)) P([1-9])\b/g, "$1 del punto $2")
    .replace(/\bP([1-9])\b/g, "el punto $1");
  r = r.replace(COD_SOP_TXT, (m, previa, k, pos, todo) => {
    const inicio = !previa && /(^|[.!?¿¡]\s*)$/.test(todo.slice(0, pos));   // comienzo de frase: con mayúscula
    const s2 = EXPM.soporteDe(caso, k); if (!s2) return m;
    const nombre = s2.n, bajo = nombre.charAt(0).toLowerCase() + nombre.slice(1), art = soporteF(caso, k).split(" ")[0];
    const pw = (previa || "").trim(), p = pw.toLowerCase();
    if (p && p === nombre.split(" ")[0].toLowerCase()) return pw + nombre.slice(nombre.indexOf(" "));   // «el informe FUN»
    if (p === "el" || p === "la") return mayusIni(art, pw) + " " + bajo;
    if (p === "al" || p === "a") return mayusIni(art === "el" ? "al" : "a la", pw) + " " + bajo;
    if (p === "del" || p === "de") return mayusIni(art === "el" ? "del" : "de la", pw) + " " + bajo;
    return (previa || "") + (inicio ? art.charAt(0).toUpperCase() + art.slice(1) : art) + " " + bajo;
  });
  return r;
}
// Una copia del expediente para mostrar: los textos, en lenguaje llano; los códigos y la estructura, intactos,
// así que sirve igual para el motor. Se arma una sola vez por expediente.
const VISTAS_CASO = {};
function casoVista() {
  const caso = casoExp(); if (!caso) return caso;
  if (VISTAS_CASO[caso.id]) return VISTAS_CASO[caso.id];
  const c = clone(caso), L = x => llano(caso, x), todo = o => { Object.keys(o).forEach(k => { if (typeof o[k] === "string") o[k] = L(o[k]); }); };
  ["titulo", "apertura", "perspectiva", "tiempos", "actividad", "vacios", "exposicion", "flujoActual", "flujoPropuesto", "criterio", "subsanacion", "requerimiento"].forEach(k => { if (typeof c[k] === "string") c[k] = L(c[k]); });
  if (c.persona) todo(c.persona);
  if (c.clinica) todo(c.clinica);
  (c.trayectoria || []).forEach(todo);
  (c.trayectoria || []).forEach(t => { if (typeof t.dur === "string") t.dur = durLlano(t.dur); });
  if (typeof c.tiempos === "string") c.tiempos = durLlano(c.tiempos);
  ["cronologia", "referenciasTemporales"].forEach(k => { c[k] = (c[k] || []).map(f => Array.isArray(f) ? f.map(L) : f); });
  (c.actores || []).forEach(a => { a.n = L(a.n); a.rol = L(a.rol); });
  (c.puntos || []).forEach(p => { p.n = L(p.n); p.decideN = L(p.decideN); });
  (c.soportes || []).forEach(x => { ["custN", "notaEstado", "contenido", "criterio"].forEach(k => { x[k] = L(x[k]); }); });
  (c.h2 || []).forEach(h => { h.tarea = L(h.tarea); h.funcion = L(h.funcion); });
  return (VISTAS_CASO[caso.id] = c);
}
// El nombre de un soporte en prosa, con su artículo y sin romper las siglas: «el certificado de IBC».
const ART_SOPORTE = { SOL:"la", ORI:"la", FIR:"la", AFI:"la" };
function soporteF(caso, k) {
  const s = EXPM.soporteDe(caso, k), n = (s && s.n) || (EXP.piezas[k] || {}).n || k, uno = n.split(" ")[0];
  const art = ART_SOPORTE[k] || (/(ción|sión|dad|tud|cia|eza|ura|a)$/i.test(uno) ? "la" : "el");
  return art + " " + n.charAt(0).toLowerCase() + n.slice(1);
}

// «4 de 5 en regla · falta la constancia de firmeza»: lo que el participante lee sobre los soportes de un punto.
function listosTxt(caso, c, pasado) {
  const f = (c && c.faltan) || [];
  return (c ? c.ok + " de " + c.total : "—") + " en regla" + (f.length ? " · " + (f.length > 1 ? (pasado ? "faltaron " : "faltan ") : (pasado ? "faltó " : "falta ")) + listaFrase(f.map(k => soporteF(caso, k))) : "");
}

// La ficha del expediente: quién solicita, su trayectoria, lo clínico y la cronología.
function expFichaHtml(caso, compacta) {
  const X = GUION.exp, p = caso.persona, c = caso.clinica;
  const ficha = [["Quién", p.nombre], ["Edad", p.edadNota || (p.edad + " años")], ["Dónde", p.ciudad],
    ["Formación", p.formacion], ["Situación", p.situacion], ["Vínculo", p.vinculo]]
    .concat(p.convivencia ? [["Hogar", p.convivencia]] : [], p.ajustes ? [["Ajustes que pide", p.ajustes]] : [],
      [["Diagnóstico", c.diagnostico], ["PCL del dictamen", String(c.pcl).replace(".", ",") + " % · origen " + c.pclOrigen], ["Fecha de estructuración", c.estructuracion]]);
  const tray = `<div class="twrap"><table class="t apila"><thead><tr><th scope="col">Período</th><th scope="col">Empresa y centro</th><th scope="col">Cargo y trabajo real</th><th scope="col">Vínculo y ARL</th></tr></thead><tbody>${caso.trayectoria.map(t => `<tr><td class="nw">${esc(t.periodo)}<div class="mini">${esc(t.dur)}</div></td><td>${esc(t.empresa)}<div class="mini">${esc(t.centro)} · CIIU ${esc(t.ciiu)}</div></td><td><b>${esc(t.cargo)}</b><div class="mini">${esc(t.trabajo)}</div></td><td class="mini">${esc(t.vinculo)}<div>${esc(t.arl)}</div></td></tr>`).join("")}</tbody></table></div>
    <p class="mini">${esc(caso.tiempos)} ${esc(caso.actividad)}${caso.vacios ? " " + esc(caso.vacios) : ""}</p>
    <p><b>Exposición y controles.</b> ${esc(caso.exposicion)}</p>`;
  const clin = `<p>${esc(c.detalle)}</p><p>${esc(c.funcion)}</p>${c.rehabilitacion ? `<p><b>Rehabilitación e incapacidades.</b> ${esc(c.rehabilitacion)}</p>` : ""}
    <div class="twrap"><table class="t apila"><thead><tr><th scope="col">Referencia temporal</th><th scope="col">Edad</th><th scope="col">Fecha</th></tr></thead><tbody>${caso.referenciasTemporales.map(r => `<tr><td>${esc(r[0])}</td><td class="nw">${esc(r[1])}</td><td class="nw">${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`;
  const crono = `<div class="twrap"><table class="t apila"><thead><tr><th scope="col">Fecha</th><th scope="col">Hito del expediente</th></tr></thead><tbody>${caso.cronologia.map(h => `<tr><td class="nw">${esc(h[0])}</td><td>${esc(h[1])}</td></tr>`).join("")}</tbody></table></div>`;
  const actores = `<div class="twrap"><table class="t apila"><thead><tr><th scope="col">Actor</th><th scope="col">Papel en el expediente</th><th scope="col">Qué custodia</th></tr></thead><tbody>${caso.actores.map(a => `<tr><td class="nw">${icoActor(a.a)}<b>${esc(a.n)}</b></td><td>${esc(a.rol)}</td><td>${(a.custodia || []).length ? esc(listaSop(caso, a.custodia)) : "—"}</td></tr>`).join("")}</tbody></table></div>`;
  const puntos = `<div class="twrap"><table class="t apila"><thead><tr><th scope="col">Punto</th><th scope="col">Decide</th><th scope="col">Evidencia requerida</th><th scope="col">Al radicar</th></tr></thead><tbody>${caso.puntos.map((p2, j) => `<tr><td><b>${j + 1}.</b> ${esc(p2.n)}</td><td class="nw">${esc(p2.decideN)}</td><td class="mini">${esc(listaSop(caso, p2.requiere))}</td><td class="nw">${esc(deRatio(EXPM.inicioDe(caso, p2.id)))} en regla</td></tr>`).join("")}</tbody></table></div>`;
  const det = (t, ico2, cuerpo, abierto) => `<details data-det="exp-${esc(t)}"${abierto ? " open" : ""}><summary>${ico(ico2, "sm")}${esc(t)}</summary>${cuerpo}</details>`;
  return `<div class="ficha-caso">${ico("documentos-datos-sinteticos", "lg")}<div><b>${esc(X.fichaTitulo)}</b><div class="kv ficha-kv">${ficha.map(f => `<b>${esc(f[0])}</b><span>${esc(f[1])}</span>`).join("")}</div></div></div>
    <p>${esc(caso.perspectiva)}</p>
    ${det(X.trayectoriaTitulo, "capitulos-mapa-actores", tray, !compacta)}
    ${det(X.clinicaTitulo, "documentos-evidencia", clin, false)}
    ${det(X.cronologiaTitulo, "investigacion-tiempo", crono, !compacta)}
    ${det(X.actoresTitulo, "actores-modulo", actores, false)}
    ${det(X.puntosTitulo, "capitulos-decision-avance", puntos, !compacta)}
    <p class="mini">${esc(X.nota)}</p>`;
}

/* Dónde interviene el rol en el expediente, para la pantalla de orientación. */
function intervencionExpHtml(actor) {
  const caso = casoVista(), a = EXPM.actorDe(caso, actor);
  if (!a) return `<p class="mini">${esc(GUION.exp.sinPapel)}</p>`;
  // Misma regla que EXPM.bloques: lo que viene después de la decisión que resuelve es tramo ilustrativo.
  let iRes = -1; caso.puntos.forEach((p, j) => { if (p.resuelve) iRes = j; });
  const filas = caso.puntos.map((p, j) => {
    const como = iRes >= 0 && j > iRes ? "ilustra" : EXPM.participa(caso, actor, p);
    return `<tr><td class="nw"><b>${j + 1}</b></td><td>${esc(p.n)}</td><td>${esc(como === "decide" ? "Decide" : como === "aporta" ? "Aporta la evidencia que custodia" : como === "ilustra" ? "Lo lee como tramo ilustrativo" : "No interviene")}</td></tr>`;
  }).join("");
  return `<div class="twrap"><table class="t apila"><thead><tr><th scope="col">Punto</th><th scope="col">Decisión</th><th scope="col">Qué hace usted</th></tr></thead><tbody>${filas}</tbody></table></div>
    <p class="mini">${esc(papelTxt(caso, a))}</p>`;
}

/* ---------- Presentación del expediente ---------- */
function expCasoHtml() {
  const X = GUION.exp, caso = casoVista(), yo = S.yo.actor, a = EXPM.actorDe(caso, yo);
  const bs = bloquesExp(), mios = bs.filter(b => b.tipo === "punto");
  const papel = a
    ? `<div class="qpanel">${icoActor(yo)} ${esc(papelTxt(caso, a))}</div>`
    : `<div class="qpanel">${esc(X.sinPapel)}</div>`;
  const recorrido = mios.length
    ? "Interviene en " + plural(mios.filter(b => b.cond === (S.ses.orden || [])[0]).length, "punto", "puntos") + " de cada condición: " + esc(listaFrase([...new Set(mios.map(b => b.punto))].map(pid => "el " + numPunto(caso, pid)))) + "."
    : "Su rol no actúa en los puntos de este expediente: lo recorrerá como observador.";
  return `<div class="pmain-head"><div><div class="eyebrow">${esc(nomExp(caso))} · ${esc(caso.origen === "laboral" ? "origen laboral" : "origen común")}</div><h1 class="h1" tabindex="-1">${ico("navegacion-escenario")}${esc(caso.titulo)}</h1></div></div>
    <div class="qpanel">${esc(caso.apertura)}</div>
    ${X.parrafos.map(p => `<p>${esc(p)}</p>`).join("")}
    ${papel}
    ${expFichaHtml(caso, false)}
    <div class="guia">${ico("navegacion-blueprint")}<div><b>${esc(X.rolTitulo)}.</b> ${recorrido} Cada condición empieza con el expediente reiniciado. Al final responderá las preguntas de cierre.</div></div>
    <button type="button" class="btn big" data-act="exp-seguir" style="margin-top:18px">${ico("acciones-iniciar")}${esc(X.comenzar)}</button>`;
}

/* ---------- Inicio y cierre de una condición ---------- */
function expCondIntroHtml(b) {
  const C = GUION.condicion, cond = EXPM.condDe(b.cond), caso = casoVista();
  return `<div class="pmain-head"><div><div class="eyebrow">${esc(b.ronda === 1 ? C.tituloA : C.tituloB)} · ${esc(nomExp(caso))}</div><h1 class="h1" tabindex="-1">${ico(b.cond === "modulo" ? "actores-modulo" : "capitulos-tensiones-rupturas")}${esc(cond.n)}</h1></div></div>
    <div class="qpanel">${esc(cond.d)}</div>
    <p>${esc(C.reinicio)}</p><p class="mini">${esc(C.corte)}</p>
    <div class="guia">${ico("navegacion-escenario")}<div>${esc(b.cond === "modulo" ? caso.flujoPropuesto : caso.flujoActual)}</div></div>
    <button type="button" class="btn big" data-act="exp-seguir" style="margin-top:18px">${ico("acciones-iniciar")}${esc(C.comenzar)}</button>`;
}
function expCondCierreHtml(b) {
  const caso = casoVista(), E = estadoExp(b.cond), cond = EXPM.condDe(b.cond);
  const pr = caso.puntos.filter(p => p.resuelve)[0], c = pr ? EXPM.completitud(E, caso, pr.id) : null;
  const hechos = caso.puntos.filter(p => E.puntos[p.id] && E.puntos[p.id].cerrado);
  return `<div class="pmain-head"><div><div class="eyebrow">${esc(cond.n)}</div><h1 class="h1" tabindex="-1">${ico("estados-cerrado")}Terminó esta condición</h1></div></div>
    <div class="kv">${hechos.map(p => `<b>${esc(nomPunto(caso, p.id))}</b><span>${esc(etiqueta(EXPM.opcionesPunto(caso, p), E.puntos[p.id].decision))}</span>`).join("")}
      ${c ? `<b>${esc(GUION.punto.completitudTitulo)} al resolver</b><span>${esc(listosTxt(caso, c))}</span>` : ""}
      <b>Horas virtuales</b><span>${esc(horasTxt(E.horas))} de ${EXP.protocolo.corteHoras}</span></div>
    <button type="button" class="btn big" data-act="exp-seguir" style="margin-top:18px">${ico("acciones-siguiente")}Continuar</button>`;
}

/* ---------- Un punto de decisión ---------- */
function expSoporteHtml(caso, E, cond, k, puedeActuar, puntoId) {
  const s = EXPM.soporteDe(caso, k), x = E.soportes[k], X = GUION.punto;
  const fin = (S.actu && S.actu.finalidad) || "";
  const visible = x.visto && EXPM.puedeVer(caso, S.yo.actor, k, puntoId, fin);
  const acciones = [];
  if (puedeActuar) {
    acciones.push(["consultar", "Consultar"]);
    if (!x.llegado || x.estado === "no_conforme") acciones.push(["solicitar", x.llegado ? "Solicitar la versión correcta" : "Solicitar el soporte"]);
    if (x.llegado && x.verificado === null && x.estado !== "conforme") { acciones.push(["aceptar", "Verificar y aceptar"]); acciones.push(["rechazar", "Verificar y rechazar"]); }
    if (x.llegado && x.estado === "no_conforme") acciones.push(["devolver", "Devolver al custodio"]);
  }
  return `<details data-det="sop-${esc(cond)}-${esc(puntoId)}-${esc(k)}"${x.estado !== "conforme" ? " open" : ""}>
    <summary><b>${esc(s.n)}</b> ${chipSoporte(x.estado)} <span class="mini">custodia ${esc(s.custN)}${x.ver ? " · " + esc(x.ver) : ""}</span></summary>
    <p class="mini">${esc(x.estado === "pendiente" ? "Llegó la versión " + s.verRef + ". Falta verificarla y aceptarla."
      : x.estado === "conforme" && (x.solicitado || x.verificado) ? "Se verificó contra el criterio y se aceptó como conforme" + (x.ver ? " (versión " + x.ver + ")" : "") + "."
      : x.verificado === false && x.llegado ? "Se verificó y se rechazó: no cumple el criterio."
      : x.estado === "ausente" && x.solicitado ? "Se devolvió al custodio: mientras no llegue la versión correcta, no está en el expediente."
      : s.notaEstado)}</p>
    <div class="kv"><b>${esc(X.criterioTitulo)}</b><span>${esc(s.criterio)}</span>${visible || x.estado === "conforme" ? `<b>Contenido</b><span>${esc(s.contenido)}</span>` : ""}</div>
    ${acciones.length ? `<div class="optrow">${acciones.map(a => { const h = EXPM.costo(cond, a[0]); return `<button type="button" class="btn sm ${a[0] === "aceptar" ? "green" : a[0] === "devolver" || a[0] === "rechazar" ? "outline" : "sec"}" data-act="exp-act" data-arg="${esc(k)}" data-v="${esc(a[0])}">${esc(a[1])}${h ? " · " + esc(horasTxt(h)) : ""}</button>`; }).join("")}</div>` : ""}
  </details>`;
}
function expPuntoHtml(b) {
  const X = GUION.punto, caso = casoVista(), E = estadoExp(b.cond), p = EXPM.puntoDe(caso, b.punto), cond = EXPM.condDe(b.cond);
  const hecho = miPunto(b.cond, b.punto), f = S.form, decide = b.como === "decide";
  const piezas = decide ? p.requiere : EXPM.custodiaDe(caso, S.yo.actor).filter(k => p.requiere.indexOf(k) >= 0);
  const c = EXPM.completitud(E, caso, b.punto);
  const cab = `<div class="pmain-head"><div><div class="eyebrow">${esc(cond.n)} · punto ${numPunto(caso, p.id)} de ${caso.puntos.length}</div><h1 class="h1" tabindex="-1">${ico(decide ? "acciones-decidir" : "acciones-entregar")}${esc(decide ? X.tituloDecide : X.tituloAporta)}</h1></div><div class="head-right"><span class="chip ch-navy">${esc(horasTxt(E.horas))} de ${EXP.protocolo.corteHoras}</span></div></div>`;
  if (hecho) return cab + expPuntoResultadoHtml(b, hecho);
  const finalidades = GUION.exp.finalidades;
  return `${cab}
    <div class="qpanel"><b>${esc(nomPunto(caso, p.id))}.</b> ${esc(caso.apertura)}</div>
    <details data-det="exp-ficha-corta"><summary>${ico("documentos-datos-sinteticos", "sm")}Ver la ficha del expediente</summary>${expFichaHtml(caso, true)}</details>
    <div class="situacion"><div class="lbl">${ico("investigacion-completitud", "sm")}${esc(X.requiereTitulo)}</div>
      <p>${esc(listaSop(caso, p.requiere))}. Cuando se radicó el expediente, ${esc(enReglaRad(caso, p.id))}.</p>
      <div class="kv"><b>${esc(X.completitudTitulo)}</b><span>${esc(listosTxt(caso, c))}</span></div>
      <p class="mini">${esc(X.completitudAyuda)}</p></div>
    <div class="expediente"><div class="lbl">${ico("documentos-evidencia", "sm")}${esc(X.estadoTitulo)}</div>
      ${piezas.map(k => expSoporteHtml(caso, E, b.cond, k, true, b.punto)).join("")}</div>
    <div class="modulo"><div class="lbl">${ico("gobernanza-finalidad", "sm")}${esc(X.actuarTitulo)}</div>
      <p class="mini">${esc(X.actuarAyuda)}</p>
      <label class="campo">Finalidad con la que actúa<select data-in="u-finalidad" aria-label="Finalidad de la actuación"><option value="">Elija una finalidad…</option>${finalidades.map(o => `<option value="${esc(o[0])}" ${(S.actu && S.actu.finalidad) === o[0] ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select></label>
      ${E.historia.filter(h => h.punto === b.punto).length ? `<div class="lbl mini">Lo que ha hecho en este punto</div><ul class="lista limpia">${E.historia.filter(h => h.punto === b.punto).map(h => `<li>${ico("estados-guardado", "sm")}<span>${h.pieza ? `<b>${esc(nomSop(caso, h.pieza))}.</b> ` : ""}${esc(llano(caso, h.texto))} <span class="mini">(${esc(horasTxt(h.horas))})</span></span></li>`).join("")}</ul>` : ""}</div>
    <div class="sep-bloque"></div>
    <div class="actividad">
      <fieldset><legend>${ico("acciones-decidir", "sm")}${esc(X.decidirTitulo)}</legend><p class="mini ayuda">${esc(X.decidirAyuda)}</p>${opt("f", "decision", EXPM.opcionesPunto(caso, p), f.decision)}</fieldset>
      <fieldset><legend>${ico("acciones-observar", "sm")}${esc(X.porQue)}</legend><textarea data-in="f-porQue" aria-label="${esc(X.porQue)}" maxlength="2000" rows="3">${esc(f.porQue || "")}</textarea></fieldset>
      <fieldset><legend>${ico("acciones-observar", "sm")}${esc(GUION.observacion.titulo)} <span class="mini">(${esc(GUION.observacion.marca)})</span></legend><p class="mini ayuda">${esc(GUION.observacion.ayuda)}</p><textarea data-in="f-obs" aria-label="${esc(GUION.observacion.titulo)}" maxlength="2000" rows="3">${esc(f.obs || "")}</textarea></fieldset>
      ${errHtml()}<button type="button" class="btn big" data-act="exp-guardar-punto" style="margin-top:18px">${ico("acciones-guardar")}Guardar y ver qué pasa</button></div>`;
}
function expPuntoResultadoHtml(b, reg) {
  const caso = casoVista(), E = estadoExp(b.cond), pl = reg.payload, p = EXPM.puntoDe(caso, b.punto), X = GUION.punto;
  const c = pl.completitud || {};
  return `<div class="qpanel ok">${ico("estados-guardado")}<b>Su decisión quedó registrada</b> a las ${esc(hora(reg.t))}</div>
    <div class="kv done-kv"><b>Decisión</b><span>${esc(pl.decisionTxt || pl.decision)}</span><b>Por qué</b><span>${esc(pl.porQue)}</span>
      <b>${esc(X.completitudTitulo)}</b><span>${esc(listosTxt(caso, c, true))}</span>
      <b>${esc(X.horas)}</b><span>${esc(horasTxt(pl.horas || E.horas))}</span></div>
    <div class="consecuencia"><div class="lbl">${ico("capitulos-decision-avance", "sm")}Cómo queda el expediente</div>
      <div class="kv">${p.requiere.map(k => `<b>${esc(nomSop(caso, k))}</b><span>${esc(estadoN(E.soportes[k].estado))}</span>`).join("")}</div>
      <p class="mini">${esc(caso.criterio)}</p></div>
    <p class="mini sigue">${ico("acciones-siguiente", "sm")}${esc(X.sigue)}</p>
    <div class="nav-row"><span class="sp"></span><button type="button" class="btn" data-act="exp-seguir">Continuar${ico("acciones-siguiente")}</button></div>`;
}
function expContextoHtml(b) {
  const caso = casoVista(), E = estadoExp(b.cond), X = GUION.punto, cond = EXPM.condDe(b.cond);
  return `<div class="pmain-head"><div><div class="eyebrow">${esc(cond.n)} · ${esc(nomExp(caso))}</div><h1 class="h1" tabindex="-1">${ico("acciones-observar")}${esc(b.despues ? X.despuesTitulo : X.contextoTitulo)}</h1></div></div>
    ${b.despues ? `<div class="qpanel">${esc(X.despuesIntro)}</div>` : ""}
    ${b.puntos.map(pid => { const p = EXPM.puntoDe(caso, pid), c = EXPM.completitud(E, caso, pid);
      return `<div class="relato"><div class="lbl">${esc(nomPunto(caso, pid))}</div><p>Lo decide ${esc(p.decideN)} con ${esc(listaFrase(p.requiere.map(k => soporteF(caso, k))))}. Cuando se radicó el expediente, ${esc(enReglaRad(caso, pid))}.${b.despues ? " Con el expediente tal como lo deja ahora, estarían en regla " + c.ok + " de " + c.total + (c.faltan.length ? ": " + (c.faltan.length > 1 ? "faltan " : "falta ") + listaFrase(c.faltan.map(k => soporteF(caso, k))) + "." : ".") : ""}</p></div>`; }).join("")}
    ${b.despues ? `<p class="mini">${esc(caso.criterio)}</p>` : ""}
    <fieldset class="bloque"><legend>${ico("acciones-observar", "sm")}${esc(GUION.observacion.titulo)} <span class="mini">(${esc(GUION.observacion.marca)})</span></legend><p class="mini ayuda">${esc(GUION.observacion.ayuda)}</p><textarea data-in="x-obs" aria-label="${esc(GUION.observacion.titulo)}" maxlength="2000" rows="3">${esc(S.ctxObs || "")}</textarea></fieldset>
    <div class="nav-row"><span class="sp"></span><button type="button" class="btn" data-act="exp-seguir">Continuar${ico("acciones-siguiente")}</button></div>`;
}

/* ---------- H2 y H3 ---------- */
function expH2Html() {
  const Q = GUION.h2, caso = casoVista(), ops = EXPM.opcionesH2(caso), v = S.h2 || {};
  const hecho = regsDe({ tipo:"h2", participanteId:S.yo.id })[0];
  return `<div class="pmain-head"><div><div class="eyebrow">Preguntas de cierre · 1 de 2</div><h1 class="h1" tabindex="-1">${ico("gobernanza-responsable-plazo")}${esc(Q.titulo)}</h1></div></div>
    <div class="qpanel">${esc(Q.intro)}</div>
    ${hecho ? `<div class="qpanel ok">${ico("estados-guardado")}Sus respuestas quedaron guardadas.</div>` : ""}
    <div class="actividad">${caso.h2.map((h, i) => `<fieldset><legend>${i + 1}. ${esc(h.tarea)} <span class="mini">(${esc(h.funcion)})</span></legend><select data-in="h2" data-arg="${esc(h.id)}" aria-label="${esc(h.tarea)}"><option value="">Elija el responsable…</option>${ops.map(o => `<option value="${esc(o[0])}" ${v[h.id] === o[0] ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select></fieldset>`).join("")}
      ${hecho ? "" : errHtml() + `<button type="button" class="btn big" data-act="exp-guardar-h2" style="margin-top:18px">${ico("acciones-guardar")}Guardar</button>`}</div>
    ${hecho ? `<div class="nav-row"><span class="sp"></span><button type="button" class="btn" data-act="exp-seguir">Continuar${ico("acciones-siguiente")}</button></div>` : ""}`;
}
function expH3Html() {
  const Q = GUION.h3, caso = casoVista(), ops = EXPM.opcionesH3(caso), v = S.h3 || {};
  const hecho = regsDe({ tipo:"h3", participanteId:S.yo.id })[0];
  const fila = (h, i) => {
    const id = "A" + (i + 1), d = v[id] || {};
    const campo = k => `<label class="campo">${esc(Q.campos[k])}<select data-in="h3" data-arg="${esc(id)}.${esc(k)}" aria-label="${esc(Q.campos[k])} del acceso ${i + 1}"><option value="">Elija…</option>${ops[k].map(o => `<option value="${esc(o[0])}" ${d[k] === o[0] ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select></label>`;
    return `<fieldset><legend>${ico("gobernanza-trazabilidad", "sm")}Acceso ${i + 1}</legend><div class="campos-grid">${EXPM.camposH3.map(campo).join("")}</div></fieldset>`;
  };
  return `<div class="pmain-head"><div><div class="eyebrow">Preguntas de cierre · 2 de 2</div><h1 class="h1" tabindex="-1">${ico("gobernanza-trazabilidad")}${esc(Q.titulo)}</h1></div></div>
    <div class="qpanel">${esc(Q.intro)}</div><p class="mini">${esc(Q.ayuda)}</p>
    ${hecho ? `<div class="qpanel ok">${ico("estados-guardado")}Sus respuestas quedaron guardadas.</div>` : ""}
    <div class="actividad">${caso.h3.map(fila).join("")}
      ${hecho ? "" : errHtml() + `<button type="button" class="btn big" data-act="exp-guardar-h3" style="margin-top:18px">${ico("acciones-guardar")}Guardar</button>`}</div>
    ${hecho ? `<div class="nav-row"><span class="sp"></span><button type="button" class="btn" data-act="exp-seguir">Terminar y pasar a la entrega${ico("acciones-siguiente")}</button></div>` : ""}`;
}

/* ---------- Pantalla del recorrido ---------- */
function vistaExpediente() {
  const caso = casoVista(), yo = S.yo, pos = bloqueExp(), b = pos.b;
  const E = b && b.cond ? estadoExp(b.cond) : null;
  const hechos = bloquesExp().filter(x => x.tipo === "punto").length;
  const resp = regsDe({ tipo:"punto", participanteId:S.yo.id }).length;
  const side = `<aside class="pside" aria-label="Su rol y su avance"><div class="avatar xl">${icoActor(yo.actor)}</div><div class="pside-actor">${esc(nomRol(yo.actor))}</div><div class="pside-name">usuario ${esc(S.cuenta.u)}${S.cuenta.p || CFG.demo ? " · cuenta de prueba" : ""}</div>
    <div class="callouts"><div class="callout"><b>${ico("navegacion-escenario", "sm")}El expediente</b>${esc(caso.persona.nombre)}<div class="mini">${esc(caso.clinica.diagnostico)}</div></div>
      ${b && b.cond ? `<div class="callout"><b>${ico(b.cond === "modulo" ? "actores-modulo" : "capitulos-tensiones-rupturas", "sm")}Condición</b>${esc(EXPM.condDe(b.cond).n)}</div>` : ""}
      ${E ? `<div class="callout"><b>${ico("investigacion-tiempo", "sm")}Horas virtuales</b>${esc(horasTxt(E.horas))} de ${EXP.protocolo.corteHoras}<div class="meter"><span style="width:${Math.min(100, Math.round(E.horas * 100 / EXP.protocolo.corteHoras))}%"></span></div></div>` : ""}
      <div class="callout"><b>${ico("capitulos-indicadores", "sm")}Su avance</b>${resp} de ${hechos} decisiones<div class="meter"><span style="width:${hechos ? Math.round(resp * 100 / hechos) : 0}%"></span></div></div></div>
    <button type="button" class="btn outline sm" data-act="orient-ver">${ico("navegacion-guia", "sm")}Ver la orientación</button>
    <button type="button" class="enlace" data-act="retirar">Retirarme del estudio</button></aside>`;
  let main;
  if (!b) main = expCasoHtml();
  else if (b.tipo === "caso") main = expCasoHtml();
  else if (b.tipo === "cond-intro") main = expCondIntroHtml(b);
  else if (b.tipo === "cond-cierre") main = expCondCierreHtml(b);
  else if (b.tipo === "punto") main = expPuntoHtml(b);
  else if (b.tipo === "punto-contexto") main = expContextoHtml(b);
  else if (b.tipo === "h2") main = expH2Html();
  else if (b.tipo === "h3") main = expH3Html();
  else main = expCasoHtml();
  return `<div class="pcard">${side}<div class="pmain">${main}</div></div>`;
}
