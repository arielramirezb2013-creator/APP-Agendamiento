// Prueba del instrumento de expediente de pensión de invalidez (marco DGIT-PENSION-R1):
// el catálogo frente al documento, el recorrido de las dos condiciones, el corte de 48 horas
// virtuales, la conformidad que solo cuenta cuando se verifica y se acepta, el control de acceso
// por finalidad, el reinicio entre condiciones y las medidas de H1, H2 y H3.
//   node tests/expediente.js
const path = require("path");
const M = require("./motor.js");
const L = require("./lib.js");
const T = L.contador("Expediente de pensión de invalidez (DGIT-PENSION-R1)");
const ARCHIVO = "file://" + path.join(L.RAIZ, "simulador.html");
// Se trabajan los puntos hasta el que resuelve, inclusive; los posteriores son ilustrativos.
const hastaResuelve = caso => caso.puntos.findIndex(p => p.resuelve) + 1;

// Configuración de demostración, que ya recorre el expediente.
const cfg = M.configDemo();
const motor0 = M.crearMotor(cfg);
const EXP = motor0.EXP, EXPM = motor0.EXPM;

/* ---------- 1. El catálogo frente al documento ---------- */
T.ok(EXP.casos.length === 4 && EXP.casos.every(c => c.origen === "laboral"),
  "el catálogo trae los cuatro expedientes y todos son de origen laboral", EXP.casos.map(c => c.id + ":" + c.origen).join(" "));
T.ok(EXP.marco.hipotesis.length === 3 && EXP.marco.hipotesis.map(h => h.id).join(",") === "H1,H2,H3" &&
  /completitud/i.test(EXP.marco.hipotesis[0].variable) && /responsabilidades/i.test(EXP.marco.hipotesis[1].variable) && /trazabilidad/i.test(EXP.marco.hipotesis[2].variable),
  "las tres hipótesis del marco están con su variable y su regla");
const desajustes = [];
EXP.casos.forEach(c => c.puntos.forEach(p => { const calc = EXPM.inicioDe(c, p.id); if (calc !== p.inicio) desajustes.push(c.id + " " + p.id + " doc " + p.inicio + " ≠ " + calc); }));
T.ok(!desajustes.length, "el cociente «Inicio n/m» del documento coincide con el que se calcula de la tabla de soportes", desajustes.join(" · "));
const malos = [];
EXP.casos.forEach(c => {
  c.h2.length === 6 || malos.push(c.id + ": H2 con " + c.h2.length);
  c.h3.length === 4 || malos.push(c.id + ": H3 con " + c.h3.length);
  c.h3.forEach(h => { if (!c.soportes.some(s => s.k === h.pieza)) malos.push(c.id + ": H3 apunta a " + h.pieza); });
  c.h2.forEach(h => { if (!c.actores.some(a => a.a === h.ref)) malos.push(c.id + ": H2 " + h.id + " responde " + h.ref); });
  c.soportes.forEach(s => { const a = c.actores.filter(x => x.a === s.cust)[0]; if (!a || (a.custodia || []).indexOf(s.k) < 0) malos.push(c.id + ": custodia de " + s.k); });
});
T.ok(!malos.length, "cada caso trae seis responsabilidades, cuatro accesos y custodios coherentes", malos.join(" · "));

/* ---------- 2. El orden de las condiciones alterna entre participantes ---------- */
const ordenes = cfg.cuentas.map(q => EXPM.ordenCondiciones(q.u).join(">"));
T.ok(new Set(ordenes).size === 2, "el orden de las dos condiciones alterna entre participantes", ordenes.join(" "));

/* ---------- 3. Recorrido completo de un rol que decide ---------- */
// Recorre el instrumento respondiendo de forma determinista. `pedir` dice si subsana lo que falta.
function recorrerExp(usuario, opc) {
  opc = opc || {};
  const m = M.crearMotor(cfg);
  m.S.acc = { u:usuario, c:cfg.demo.clave, ver:false }; m.entrar();
  if (!m.S.cuenta) throw new Error("no entró: " + usuario);
  m.CONS.declaraciones.forEach(d => { m.S.cons.decl[d.id] = true; });
  if (!m.aceptarConsentimiento()) throw new Error("consentimiento");
  m.S.enc = { edad:"40-49", formacion:"salud", formacionCual:"Medicina del trabajo", experiencia:"8", rolActual:"Analista", trayectoria:"ARL, prestaciones, 8 años", frecuencia:"semanal" };
  if (!m.guardarEncuesta()) throw new Error("encuesta");
  const caso = m.casoExp();
  let guarda = 0;
  while (m.S.etapa === "simulacion" && guarda++ < 80) {
    const b = m.bloqueExp().b;
    if (!b) break;
    if (b.tipo === "punto" && !m.puntoHecho(b.cond, b.punto)) {
      const p = EXPM.puntoDe(caso, b.punto), E = m.estadoExp(b.cond);
      m.S.actu = { finalidad:opc.finalidad || "verificar_firmeza" };
      (b.como === "decide" ? p.requiere : EXPM.custodiaDe(caso, m.S.yo.actor)).forEach(k => {
        m.actuarSobre(k, "consultar");
        if (opc.pedir !== false && E.soportes[k].estado !== "conforme") { m.actuarSobre(k, "solicitar"); m.actuarSobre(k, "aceptar"); }
      });
      m.S.form = { decision:(EXPM.opcionesPunto(caso, p)[0] || [])[0], porQue:"Decidí con lo que quedó conforme." };
      if (!m.guardarPunto()) throw new Error("punto no guardado: " + b.punto + " · " + m.S.msg);
      continue;
    }
    if (b.tipo === "h2" && !m.regsDe({ tipo:"h2", participanteId:m.S.yo.id }).length) {
      m.S.h2 = {}; caso.h2.forEach(h => { m.S.h2[h.id] = opc.h2mal ? "no_se" : h.ref; });
      if (!m.guardarH2()) throw new Error("H2 no guardado: " + m.S.msg);
      continue;
    }
    if (b.tipo === "h3" && !m.regsDe({ tipo:"h3", participanteId:m.S.yo.id }).length) {
      m.S.h3 = {}; caso.h3.forEach((h, i) => {
        m.S.h3["A" + (i + 1)] = opc.h3mal
          ? { actor:"no_se", pieza:"no_se", momento:"no_se", accion:"no_se", resultado:"no_se" }
          : { actor:h.actor, pieza:h.pieza, momento:EXPM.tramoDe(h.momento), accion:String(h.accion).toLowerCase(), resultado:h.denegado ? "denegado" : "entregado" };
      });
      if (!m.guardarH3()) throw new Error("H3 no guardado: " + m.S.msg);
      continue;
    }
    m.avanzarExp();
  }
  return { m:m, doc:m.documentoRespuesta(), caso:caso };
}

const r1 = recorrerExp("demo-arl");
const d1 = r1.doc, e1 = d1.expediente;
T.ok(!r1.m.validarRespuesta(d1).length && d1.estado === "completa", "el rol que decide completa el instrumento y entrega un documento válido", r1.m.validarRespuesta(d1).join("; "));
T.ok(e1 && e1.caso === "PI-L01" && e1.marco === "DGIT-PENSION-R1" && e1.orden.length === 2 && Object.keys(e1.condiciones).length === 2,
  "el documento trae el expediente, el marco y las dos condiciones", JSON.stringify(e1 && e1.orden));
const puntos1 = d1.registros.filter(r => r.tipo === "punto");
T.ok(puntos1.length === hastaResuelve(r1.caso) * 2,
  "cierra, en las dos condiciones, los puntos que llevan hasta la decisión que resuelve (" + puntos1.length + ")");
const ilustra = r1.m.bloquesExp().filter(x => x.tipo === "punto-contexto" && x.despues);
T.ok(ilustra.length === (r1.caso.puntos.length > hastaResuelve(r1.caso) ? 2 : 0),
  "los puntos posteriores a esa decisión quedan como tramo ilustrativo, uno por condición", JSON.stringify(ilustra));
T.ok(Object.keys(e1.condiciones).every(c => e1.condiciones[c].completitud && e1.condiciones[c].completitud.total === 5),
  "cada condición reporta la completitud del punto que resuelve, sobre los cinco requeridos de P2");
T.ok(Object.keys(e1.condiciones).every(c => e1.condiciones[c].horas <= EXP.protocolo.corteHoras),
  "ninguna condición se pasa del corte de " + EXP.protocolo.corteHoras + " horas virtuales",
  Object.keys(e1.condiciones).map(c => c + ":" + e1.condiciones[c].horas).join(" "));
T.ok(Object.keys(e1.condiciones).every(c => e1.condiciones[c].instantanea), "queda la instantánea anterior a la decisión que resuelve");
T.ok(e1.h2 && e1.h2.ok === 6 && e1.h2.total === 6, "H2 se califica contra la respuesta de referencia del documento", JSON.stringify(e1.h2 && [e1.h2.ok, e1.h2.total]));
T.ok(e1.h3 && e1.h3.ok === 4 && e1.h3.total === 4 && e1.h3.campos === 20, "H3 se califica exigiendo los cinco elementos de cada acceso", JSON.stringify(e1.h3 && [e1.h3.ok, e1.h3.campos]));

/* ---------- 4. Las medidas distinguen a quien no acierta ---------- */
const r2 = recorrerExp("demo-juntanacional", { h2mal:true, h3mal:true });
T.ok(r2.doc.expediente.h2.ok === 0 && r2.doc.expediente.h3.ok === 0,
  "quien no identifica responsabilidades ni reconstruye accesos puntúa cero, y el recorrido se completa igual");

/* ---------- 4b. Los doce roles completan el instrumento dentro del tiempo declarado ---------- */
(() => {
  const malos = [], tiempos = [];
  cfg.cuentas.forEach(q => {
    let r;
    try { r = recorrerExp(q.u); } catch (e) { malos.push(q.u + ": " + (e.message || e)); return; }
    const errs = r.m.validarRespuesta(r.doc), min = r.m.minutosEstimados(q.a);
    if (errs.length) malos.push(q.u + ": " + errs.join("; "));
    if (r.doc.estado !== "completa") malos.push(q.u + ": estado " + r.doc.estado);
    if (r.doc.avance.hechas !== r.doc.avance.total) malos.push(q.u + ": avance " + r.doc.avance.hechas + "/" + r.doc.avance.total);
    if (JSON.stringify(r.doc).indexOf(q.h) >= 0 || /DEMO-?2026/i.test(JSON.stringify(r.doc))) malos.push(q.u + ": credenciales en el documento");
    if (min < 25 || min > 45) malos.push(q.u + ": " + min + " minutos estimados");
    tiempos.push(q.u.replace("demo-", "") + " " + min + "′");
  });
  T.ok(!malos.length, "los doce roles completan el expediente, entregan un documento válido y caben en los 45 minutos", malos.join(" · "));
  console.log("       " + tiempos.join(" · "));
})();

/* ---------- 5. Un soporte no cuenta hasta que se verifica y se acepta ---------- */
(() => {
  const m = M.crearMotor(cfg);
  m.S.acc = { u:"demo-arl", c:cfg.demo.clave, ver:false }; m.entrar();
  m.CONS.declaraciones.forEach(d => { m.S.cons.decl[d.id] = true; }); m.aceptarConsentimiento();
  m.S.enc = { edad:"40-49", formacion:"salud", formacionCual:"x", experiencia:"8", rolActual:"x", trayectoria:"x", frecuencia:"semanal" }; m.guardarEncuesta();
  const caso = m.casoExp();
  while (m.bloqueExp().b.tipo !== "punto") m.avanzarExp();
  const b = m.bloqueExp().b, E = m.estadoExp(b.cond);
  const c0 = EXPM.completitud(E, caso, b.punto);
  m.S.actu = { finalidad:"verificar_firmeza" };
  m.actuarSobre("FIR", "solicitar");
  const c1 = EXPM.completitud(E, caso, b.punto);
  m.actuarSobre("FIR", "aceptar");
  const c2 = EXPM.completitud(E, caso, b.punto);
  T.ok(c0.ok === 3 && c1.ok === 3 && c2.ok === 4,
    "pedir un soporte no lo hace conforme: cuenta cuando llega, se verifica y se acepta", [c0.ok, c1.ok, c2.ok].join(" → "));
  // Control de acceso por finalidad: lo administrativo no abre lo clínico.
  m.S.actu = { finalidad:"control_admin" };
  const antes = E.accesos.length;
  m.actuarSobre("HC", "consultar");
  const ult = E.accesos[E.accesos.length - 1];
  T.ok(E.accesos.length === antes + 1 && ult.pieza === "HC" && ult.denegado === true,
    "una finalidad de control administrativo no abre una pieza clínica, y la denegación queda registrada");
  // Reinicio entre condiciones.
  const otra = (m.S.ses.orden || []).filter(x => x !== b.cond)[0];
  const E2 = m.estadoExp(otra);
  T.ok(E2.soportes.FIR.estado === "ausente" && E2.horas === 0,
    "el expediente se reinicia al empezar la otra condición", E2.soportes.FIR.estado + " · " + E2.horas + " h");
})();

/* ---------- 6. El contraste entre condiciones: lo que mide H1 ---------- */
(() => {
  // El mismo camino de actuaciones en las dos condiciones, con el corte aplicado como lo aplica la
  // interfaz. «estricto» agrega lo que manda el protocolo cuando una pieza no cumple el criterio:
  // devolverla al custodio y pedirle la versión de referencia.
  const sim = (caso, cond, estricto) => {
    const E = EXPM.inicial(caso), H = EXPM.horas[cond], pr = caso.puntos.filter(p => p.resuelve)[0];
    const hacer = (p, k, que) => {
      const cuesta = H[que] || 0;
      if (que !== "aceptar" && que !== "rechazar" && cuesta > EXP.protocolo.corteHoras - E.horas) return false;
      return !!EXPM.actuar(E, caso, cond, p.decide, p.id, k, que, "verificar_firmeza");
    };
    caso.puntos.forEach(p => p.requiere.forEach(k => {
      hacer(p, k, "consultar");
      if (estricto && E.soportes[k].estado === "no_conforme") hacer(p, k, "devolver");
      if (E.soportes[k].estado !== "conforme" && hacer(p, k, "solicitar")) hacer(p, k, "aceptar");
    }));
    return { c:EXPM.completitud(E, caso, pr.id), horas:E.horas };
  };
  const caras = [], gana = [], pierde = [];
  EXP.casos.forEach(c => {
    const a = sim(c, "actual", false), b = sim(c, "modulo", false);
    if (!(b.horas < a.horas)) caras.push(c.id + ": " + a.horas + " h en el flujo actual y " + b.horas + " con el módulo");
    const ae = sim(c, "actual", true), be = sim(c, "modulo", true);
    if (be.c.ok > ae.c.ok) gana.push(c.id + " " + ae.c.ok + "→" + be.c.ok + " de " + be.c.total);
    if (be.c.ok < ae.c.ok) pierde.push(c.id + " " + ae.c.ok + "→" + be.c.ok);
  });
  T.ok(!caras.length, "el mismo camino de actuaciones consume menos horas virtuales con el módulo que con el flujo actual, en los cuatro expedientes", caras.join(" · "));
  T.ok(gana.length >= 2 && !pierde.length,
    "cuando hay que devolver y volver a pedir lo que no cumple el criterio, el corte de 48 horas deja al flujo actual con menos requeridos conformes en el punto que resuelve",
    "mejoran con el módulo: " + (gana.join(", ") || "ninguno") + (pierde.length ? " · empeoran: " + pierde.join(", ") : ""));
})();

/* ---------- 7. Los cuatro expedientes se pueden recorrer con el rol que decide ---------- */
(() => {
  const malos = [];
  EXP.casos.forEach(c => {
    const decide = c.puntos[0].decide;
    const q = cfg.cuentas.filter(x => x.a === decide)[0];
    if (!q) { malos.push(c.id + ": no hay cuenta de demostración para " + decide); return; }
    const cfg2 = JSON.parse(JSON.stringify(cfg)); cfg2.estudio.expediente = c.id;
    const m = M.crearMotor(cfg2);
    m.S.acc = { u:q.u, c:cfg.demo.clave, ver:false }; m.entrar();
    m.CONS.declaraciones.forEach(d => { m.S.cons.decl[d.id] = true; }); m.aceptarConsentimiento();
    m.S.enc = { edad:"40-49", formacion:"salud", formacionCual:"x", experiencia:"8", rolActual:"x", trayectoria:"x", frecuencia:"semanal" }; m.guardarEncuesta();
    if (m.casoExp().id !== c.id) { malos.push(c.id + ": el estudio no fijó el expediente"); return; }
    const bs = m.bloquesExp(), puntos = bs.filter(x => x.tipo === "punto");
    if (puntos.length !== hastaResuelve(c) * 2) malos.push(c.id + ": " + puntos.length + " puntos en el recorrido");
    if (c.puntos.length > hastaResuelve(c) && bs.filter(x => x.tipo === "punto-contexto" && x.despues).length !== 2) malos.push(c.id + ": falta el tramo ilustrativo");
    if (!bs.some(x => x.tipo === "h2") || !bs.some(x => x.tipo === "h3")) malos.push(c.id + ": falta H2 o H3");
  });
  T.ok(!malos.length, "los cuatro expedientes se abren con el rol que decide y traen sus puntos en las dos condiciones", malos.join(" · "));
})();

/* ---------- 8. Por la interfaz: una pasada corta y la pausa a mitad del expediente ---------- */
(async () => {
  const errores = [];
  const br = await L.lanzar();
  try {
    const ctx = await br.newContext({ viewport:{ width:1280, height:900 } }), pg = await L.pagina(ctx, errores);
    await pg.goto(ARCHIVO);
    await L.entrarDemo(pg, "demo-arl");
    await L.pasarOrientacion(pg); await L.aceptarDeclaracion(pg, null); await L.llenarEncuesta(pg, 0);
    const caso1 = await L.texto(pg, "#vista");
    T.ok(/PI-L01/.test(caso1) && /Mateo Roldán/.test(caso1) && /Montacarguista/.test(caso1), "la interfaz presenta el expediente con su ficha", caso1.slice(0, 120));
    await L.clic(pg, '[data-act="exp-seguir"]');   // caso → intro de la condición
    await L.clic(pg, '[data-act="exp-seguir"]');   // intro → primer punto
    T.ok(await L.hay(pg, '[data-act="exp-guardar-punto"]'), "llega al primer punto de decisión");
    await pg.selectOption('[data-in="u-finalidad"]', "verificar_firmeza");
    await L.clic(pg, '[data-act="exp-act"][data-arg="FIR"][data-v="solicitar"]');
    const trasPedir = await L.texto(pg, "#vista");
    T.ok(/Solicitud enviada/.test(trasPedir) && /Verificar y aceptar/.test(trasPedir), "pedir un soporte lo hace llegar y queda por verificar");
    await L.clic(pg, '[data-act="exp-act"][data-arg="FIR"][data-v="aceptar"]');
    T.ok(/4 de 4 requeridos conformes/.test(await L.texto(pg, "#vista")), "aceptarlo lo hace contar para la completitud del punto");
    // Pausa y regreso a mitad del expediente.
    await L.clic(pg, '[data-act="salir"]'); await L.clic(pg, '[data-act="salir-si"]', 150);
    await L.entrarDemo(pg, "demo-arl");
    const vuelta = await L.texto(pg, "#vista");
    T.ok(/Bienvenido de nuevo/.test(vuelta) && /punto P1/.test(vuelta), "al volver retoma en el punto donde quedó", vuelta.slice(0, 140));
    await L.clic(pg, '[data-act="retomar-continuar"]');
    T.ok(/4 de 4 requeridos conformes/.test(await L.texto(pg, "#vista")), "y conserva lo que ya había conseguido del expediente");
    await ctx.close();
  } catch (e) { T.ok(false, "la prueba de interfaz se interrumpió", e.stack || e); }
  await br.close();
  T.ok(!errores.length, "sin errores de consola ni excepciones", errores.slice(0, 4).join(" | "));
  process.exit(T.fin() ? 1 : 0);
})();
