/* ============ Expediente: estado del participante y conducción ============
   Conduce el recorrido del instrumento DGIT-PENSION-R1: dos condiciones del mismo expediente, con
   su estado propio cada una, y al cierre H2 y H3. Se apoya en el mismo almacenamiento, la misma
   bitácora y el mismo documento de respuestas que el resto del simulador. */

const esExpediente = () => !!(S.ses && S.ses.instrumento === "expediente");
// El expediente con el que recorre este participante: el de su cuenta, o el que el estudio fijó.
function casoExp() {
  const id = (S.cuenta && S.cuenta.expediente) || (CFG.estudio && CFG.estudio.expediente) || (EXP.casos[0] || {}).id;
  return EXPM.casoDe(id);
}
function nuevaSesionExp() {
  const caso = casoExp(), orden = EXPM.ordenCondiciones(S.cuenta.u);
  const bs = EXPM.bloques(caso, S.yo.actor, S.cuenta.u);
  return { codigo:S.yo.id, nombre:CFG.estudio.titulo, instrumento:"expediente", escenario:EXP.marco.id,
    expediente:caso.id, orden:orden, modalidad:"asincrona", estado:"en_curso", creada:ahora(),
    bloque:0, total:bs.length, condiciones:{} };
}
const bloquesExp = () => EXPM.bloques(casoExp(), S.yo.actor, S.cuenta.u);
function bloqueExp() { const bs = bloquesExp(), i = Math.min(S.ses.bloque || 0, bs.length - 1); return { bs:bs, i:i, b:bs[i], sig:bs[i + 1] || null }; }
// Estado del expediente en una condición. Se crea al entrar en ella: así se reinicia entre las dos.
function estadoExp(cond) {
  if (!S.exp) S.exp = {};
  if (!S.exp[cond]) S.exp[cond] = EXPM.inicial(casoExp());
  return S.exp[cond];
}
const condActual = () => { const b = bloqueExp().b; return b && b.cond ? b.cond : (S.ses.orden || [])[0]; };

/* ---------- Avance ---------- */
function avanzarExp() {
  const pos = bloqueExp(), b = pos.b, t = ahora();
  if (!b) return;
  if (b.tipo === "punto" && !puntoHecho(b.cond, b.punto)) return;
  if (b.tipo === "h2" && !regsDe({ tipo:"h2", participanteId:S.yo.id }).length) return;
  if (b.tipo === "h3" && !regsDe({ tipo:"h3", participanteId:S.yo.id }).length) return;
  if (b.tipo === "punto-contexto" && textoLimpio(S.ctxObs)) registrar("observacion", { texto:textoLimpio(S.ctxObs, 2000), cond:b.cond, puntos:b.puntos }, { paso:b.puntos[0] });
  if (b.tipo === "cond-intro") { estadoExp(b.cond); registrarConduccion("inicio_condicion", { cond:b.cond, ronda:b.ronda, expediente:S.ses.expediente }, { paso:"—", ronda:b.cond }); }
  if (b.tipo === "cond-cierre") {
    const E = estadoExp(b.cond), caso = casoExp(), pr = (caso.puntos.filter(p => p.resuelve)[0] || {}).id;
    S.ses.condiciones[b.cond] = { cerrada:t, horas:E.horas, completitud:pr ? EXPM.completitud(E, caso, pr) : null };
    registrarConduccion("cierre_condicion", { cond:b.cond, horas:E.horas, completitud:S.ses.condiciones[b.cond].completitud }, { paso:"—", ronda:b.cond });
  }
  S.ses.bloque = pos.i + 1; S.form = {}; S.actu = {}; S.ctxObs = ""; S.abierto = t;
  if (S.ses.bloque >= pos.bs.length) { S.ses.estado = "cerrada"; S.ses.cerrada = t; S.etapa = "cierre"; registrarConduccion("cierre", { instrumento:"expediente" }, { paso:"—" }); }
}
const puntoHecho = (cond, pid) => !!regsDe({ tipo:"punto", ronda:cond, paso:pid, participanteId:S.yo.id })[0];
const miPunto = (cond, pid) => regsDe({ tipo:"punto", ronda:cond, paso:pid, participanteId:S.yo.id })[0] || null;

/* ---------- Actuaciones sobre los soportes ---------- */
function actuarSobre(k, que) {
  const pos = bloqueExp(), b = pos.b;
  if (!b || b.tipo !== "punto") return false;
  const caso = casoExp(), E = estadoExp(b.cond), p = EXPM.puntoDe(caso, b.punto);
  if (puntoHecho(b.cond, b.punto)) return false;
  // El corte del piloto no se puede pasar: verificar y aceptar lo que ya llegó sí se permite.
  const H = EXPM.horas[b.cond] || EXPM.horas.actual, cuesta = H[que] || 0, queda = EXP.protocolo.corteHoras - E.horas;
  if (que !== "aceptar" && que !== "rechazar" && cuesta > queda) {
    aviso(queda <= 0
      ? "Se agotó el corte de " + EXP.protocolo.corteHoras + " horas virtuales del piloto. Cierre el punto con lo que tenga."
      : "Esa actuación cuesta " + cuesta + " horas y solo quedan " + (Math.round(queda * 10) / 10) + " del corte de " + EXP.protocolo.corteHoras + ". Cierre el punto con lo que tenga o elija otra actuación.", true);
    return false;
  }
  const fin = (S.actu && S.actu.finalidad) || "";
  if (que === "consultar" && !fin) { aviso("Antes de consultar, declare con qué finalidad lo hace.", true); return false; }
  const r = EXPM.actuar(E, caso, b.cond, S.yo.actor, b.punto, k, que, fin);
  if (!r) return false;
  registrar("actuacion", { cond:b.cond, punto:b.punto, pieza:k, que:que, finalidad:fin || null, horas:r.horas, denegado:!!r.denegado, texto:r.texto, horasTotal:E.horas }, { paso:b.punto, ronda:b.cond });
  guardarLocal(); envioProgresivo();
  return true;
}

/* ---------- Cierre de un punto ---------- */
function validarPunto() {
  const f = S.form, falta = [];
  if (!f.decision) falta.push("qué decide en este punto");
  if (!textoLimpio(f.porQue)) falta.push("por qué decidió así");
  return falta;
}
function guardarPunto() {
  const pos = bloqueExp(), b = pos.b;
  if (!b || b.tipo !== "punto" || puntoHecho(b.cond, b.punto)) return false;
  const falta = validarPunto();
  if (falta.length) { aviso("Antes de guardar falta responder " + listaFrase(falta) + ".", true); return false; }
  const caso = casoExp(), E = estadoExp(b.cond), f = S.form;
  const r = EXPM.cerrarPunto(E, caso, b.cond, b.punto, f.decision, f.porQue);
  const reg = registrar("punto", { cond:b.cond, punto:b.punto, como:b.como, decision:f.decision,
    decisionTxt:etiqueta(EXPM.opcionesPunto(caso, EXPM.puntoDe(caso, b.punto)), f.decision),
    porQue:textoLimpio(f.porQue, 2000), obs:textoLimpio(f.obs, 2000) || null,
    completitud:r.completitud, horas:r.horas, resuelve:!!EXPM.puntoDe(caso, b.punto).resuelve,
    soportes:EXPM.puntoDe(caso, b.punto).requiere.map(k => ({ k:k, estado:E.soportes[k].estado, aceptado:!!E.soportes[k].aceptado })) },
    { paso:b.punto, ronda:b.cond });
  S.form = {}; S.actu = {};
  return reg;
}

/* ---------- H2 y H3 ---------- */
function validarH2() {
  const caso = casoExp(), v = S.h2 || {};
  return caso.h2.filter(h => !v[h.id]).map(h => h.id.toLowerCase());
}
function guardarH2() {
  const falta = validarH2();
  if (falta.length) { aviso("Falta decir a quién le corresponde " + listaFrase(falta) + ".", true); return false; }
  const caso = casoExp(), cal = EXPM.calificarH2(caso, S.h2);
  registrar("h2", { expediente:caso.id, respuestas:clone(S.h2), calificacion:cal }, { paso:"—" });
  return true;
}
function validarH3() {
  const caso = casoExp(), v = S.h3 || {}, falta = [];
  caso.h3.forEach((h, i) => {
    const id = "A" + (i + 1), d = v[id] || {};
    const sin = EXPM.camposH3.filter(k => !d[k]);
    if (sin.length) falta.push("el acceso " + (i + 1));
  });
  return falta.filter((x, i, a) => a.indexOf(x) === i);
}
function guardarH3() {
  const falta = validarH3();
  if (falta.length) { aviso("Falta completar los cinco elementos de " + listaFrase(falta) + ".", true); return false; }
  const caso = casoExp(), cal = EXPM.calificarH3(caso, S.h3);
  registrar("h3", { expediente:caso.id, respuestas:clone(S.h3), calificacion:cal }, { paso:"—" });
  return true;
}

/* ---------- Lo que entra en el documento de respuestas ---------- */
function expedienteDoc() {
  if (!esExpediente()) return null;
  const caso = casoExp(), pr = (caso.puntos.filter(p => p.resuelve)[0] || {}).id;
  const conds = {};
  (S.ses.orden || []).forEach(c => {
    const E = S.exp && S.exp[c];
    conds[c] = E ? { horas:E.horas, soportes:clone(E.soportes), accesos:clone(E.accesos),
      completitud:pr ? EXPM.completitud(E, caso, pr) : null, instantanea:E.instantanea ? { h:E.instantanea.h, completitud:E.instantanea.completitud } : null,
      puntos:clone(E.puntos) } : null;
  });
  const h2 = regsDe({ tipo:"h2", participanteId:S.yo.id })[0], h3 = regsDe({ tipo:"h3", participanteId:S.yo.id })[0];
  return { marco:EXP.marco.id, caso:caso.id, origen:caso.origen, orden:(S.ses.orden || []).slice(),
    corteHoras:EXP.protocolo.corteHoras, condiciones:conds,
    h2:h2 ? h2.payload.calificacion : null, h3:h3 ? h3.payload.calificacion : null };
}
