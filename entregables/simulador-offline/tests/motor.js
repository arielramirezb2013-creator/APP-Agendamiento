// Motor de pruebas sin navegador: carga los datos, el núcleo y el estado del simulador en un contexto aislado
// y recorre la simulación completa con respuestas deterministas. Sirve para probar el conductor automático
// y para generar archivos de respuestas de muestra.
//   node tests/motor.js            → recorre los 12 roles y valida cada documento
//   node tests/motor.js --muestras → además escribe los documentos en tests/salida/muestras/
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const RAIZ = path.resolve(__dirname, ".."), MESA = path.resolve(RAIZ, "..", "blueprint-simulacion");
const leer = f => fs.readFileSync(f, "utf8");
const FUENTES = [path.join(MESA, "src/datos-blueprint.js"), path.join(MESA, "src/datos-escenario.js"), path.join(RAIZ, "src/datos-guion.js"), "__PERFIL__", path.join(RAIZ, "src/datos-ramas.js"), path.join(RAIZ, "src/nucleo.js"), path.join(RAIZ, "src/sim-1-estado.js")];
// El perfil base del caso, igual que lo incluye build.py.
const perfilBase = () => "const PERFIL_BASE = " + JSON.stringify(JSON.parse(leer(path.join(RAIZ, "perfiles/perfil-ejemplo-mp.json"))).perfiles[0]) + ";";
const fuente = f => (f === "__PERFIL__" ? perfilBase() : leer(f));

function memoria() { const m = new Map(); return { getItem:k => (m.has(k) ? m.get(k) : null), setItem:(k, v) => { m.set(k, String(v)); }, removeItem:k => { m.delete(k); }, get length() { return m.size; }, _m:m }; }

// Configuración de demostración igual a la que escribe build.py (se lee del simulador construido).
function configDemo() {
  const h = leer(path.join(RAIZ, "simulador.html")), m = /\/\*CONFIG:INICIO\*\/window\.SIM_CONFIG_INCLUIDA=(.*?);\/\*CONFIG:FIN\*\//s.exec(h);
  return JSON.parse(m[1]);
}
function crearMotor(config, opciones) {
  opciones = opciones || {};
  const local = opciones.local || memoria(), sesion = opciones.sesion || memoria(), avisos = [];
  const ventana = { SIM_CONFIG_INCLUIDA:config, localStorage:local, sessionStorage:sesion };
  const ctx = { window:ventana, localStorage:local, sessionStorage:sesion, navigator:{ onLine:true }, location:{ protocol:"file:", hash:"" }, document:{ getElementById:() => null, createElement:() => ({}), body:{} },
    crypto:crypto.webcrypto, TextEncoder, URL, Blob:global.Blob, console, setTimeout, clearTimeout, BPIcons:{ ids:[], svg:() => "" }, fetch:opciones.fetch || (async () => { throw new Error("sin red"); }) };
  vm.createContext(ctx);
  const codigo = FUENTES.map(fuente).join("\n") + "\nfunction render() {}\n;globalThis.__M = { get S() { return S; }, set S(v) { S = v; }, CFG, CONS, ESC, BP, SIM, GUION, PASOS, PIDX, A, EV, ALM, entrar, salir, abrirCuenta, aceptarConsentimiento, iniciarRonda, avanzar, guardarActividad, guardarValoracion, guardarEncuesta, validarEncuesta, encuestaHecha, cerrarRonda, documentoRespuesta, validarRespuesta, validarConfig, huellaDoc, bloques, bloqueActual, posicion, rondaAct, pasoActual, modoActual, miActividad, actividadDe, bloquesDe, vigentes, regsDe, avance, minutosEstimados, guardarLocal, cargarLocal, restaurarDe, documentoRestaurable, cargarAvance, comprobarFinalidad, finalidadDe, vistaDe, RAMAS, casoActual, recomputarCaso, perfilActual, pasoNoOcurre, expedienteHoy, expedienteModulo, camposQueAnade, huellaClave, enviar, retirar, valoracionHecha, diaVirtual, resumenActividad, nombreArchivo, empezarDeNuevo };";
  vm.runInContext(codigo, ctx, { filename:"simulador-motor.js" });
  const M = ctx.__M; M.avisos = avisos; M.local = local; M.sesion = sesion;
  return M;
}
// Respuestas deterministas: `variante` desplaza las opciones para que dos participantes del mismo rol difieran.
function responder(M, variante) {
  const S = M.S, b = M.bloqueActual(), p = M.pasoActual(), act = b.act, yo = S.yo.actor, n = (variante || 0) + M.PIDX[p.id], pick = ops => ops[n % ops.length][0], f = {};
  if (act.tipo === "decide") {
    f.suficiencia = pick(M.ESC.suficiencia);
    if (f.suficiencia !== "suficiente") f.falta = Object.keys(M.EV).filter((k, i) => (i + n) % 3 === 0);
    f.finalidad = n % 4 === 3 ? "estadistica" : M.finalidadDe(yo); f.decision = pick(act.ops); f.responde = n % 5 === 4 ? "nadie" : "yo"; f.dias = String(3 + (n % 12));
    if (M.modoActual() === "propuesto") f.notifica = M.BP.actores.filter(a => a.id !== yo).slice(0, 1 + (n % 3)).map(a => a.id);
  } else if (act.tipo === "custodia") { f.respuesta = pick(M.ESC.respCustodia); f.dias = String(1 + (n % 7)); }
  else if (act.tipo === "focal") { f.sabe = pick(M.ESC.focal.sabe); f.responde = n % 3 === 0 ? "nadie" : "eps"; f.dias = n % 2 ? String(5 + n) : ""; f.hizo = n % 4 === 0 ? ["nada"] : ["llevar", "llamar"].slice(0, 1 + (n % 2)); }
  else if (act.tipo === "soporte") { f.ve = pick(M.ESC.soporte.ve); f.accion = pick(M.ESC.soporte.accion); }
  const C = M.GUION.comparacion;
  f.cmp = C.ops[n % C.ops.length][0];
  if (f.cmp === "otra") f.cmpCual = "Habría pedido la historia laboral antes de decidir";
  f.cmpDias = String(1 + (n % 9));
  f.cmpSeg = C.seguridadOps[n % C.seguridadOps.length][0];
  if (n % 3 === 1) f.obs = "Observación de prueba en " + p.id + " <b>negrita</b> & \"comillas\"";
  S.form = f;
}
function valorar(M, variante) {
  const n = variante || 0, r = 0, v = {};
  v.semaforo = M.ESC.valoracion.semaforo[(n + r) % 3][0]; if (v.semaforo !== "aceptar") v.ajuste = "Ajuste propuesto " + (n + r);
  v.mejora = M.ESC.valoracion.mejora[(n + 2 * r) % 3][0];
  M.ESC.preguntas.forEach((q, i) => { if (q.tipo === "texto") v[q.id] = "Requisito de prueba " + (n + r); else if (q.tipo === "multi") { v[q.id] = q.ops.slice(0, -1).filter((o, j) => (j + n + r) % 3 === 0).map(o => o[0]); if (!v[q.id].length) v[q.id] = ["ninguna"]; else v[q.id + "cual"] = "La principal fue la primera"; } else { v[q.id] = q.ops[(n + r + i) % q.ops.length][0]; if (v[q.id] !== "si") v[q.id + "cual"] = "Detalle " + q.id; } });
  M.S.val = v;
}
// Recorre toda la simulación con un rol. `hasta` permite detenerse antes: { ronda, paso } o "consentimiento".
function recorrer(M, usuario, clave, opc) {
  opc = opc || {};
  M.S.acc = { u:usuario, c:clave, ver:false }; M.entrar();
  if (!M.S.cuenta) throw new Error("no entró: " + usuario);
  if (M.S.retomar) M.S.retomar = null;
  if (!M.S.consent) {
    M.CONS.declaraciones.forEach(d => { M.S.cons.decl[d.id] = true; });
    if (opc.datos) { M.S.cons.anonimo = "no"; M.S.cons.datos = Object.assign({}, opc.datos); M.S.cons.decl[M.CONS.declaracionDatos.id] = true; }
    if (opc.hasta === "consentimiento") return null;
    if (!M.aceptarConsentimiento()) throw new Error("consentimiento rechazado para " + usuario);
  }
  if (M.S.etapa === "encuesta") {
    M.S.enc = { edad:"40-49", formacion:"salud", formacionCual:"Medicina del trabajo", complementarios:"Especialización en SST",
      experiencia:"8", rolActual:"Analista de la ruta de incapacidad", trayectoria:"EPS, analista de incapacidades, 4 años\nIPS, auditoría médica, 3 años",
      frecuencia:"semanal", otrosRoles:"Sí, estuve en una IPS" };
    if (!M.guardarEncuesta()) throw new Error("encuesta no guardada para " + usuario);
  }
  let guard = 0;
  while (M.S.etapa === "simulacion" && guard++ < 500) {
    const rd = M.rondaAct(), s = M.S.ses;
    if (rd.estado === "pendiente") { M.iniciarRonda(); continue; }
    if (rd.estado === "valoracion") { if (!M.valoracionHecha(s.rondaActual)) { valorar(M, opc.variante); if (!M.guardarValoracion()) throw new Error("valoración no guardada"); } M.cerrarRonda(); continue; }
    if (opc.hasta && opc.hasta.ronda === s.rondaActual && opc.hasta.paso === s.pasoActual) break;
    const b = M.bloqueActual();
    if (b.tipo === "actividad" && !M.miActividad(s.rondaActual, s.pasoActual) && !M.pasoNoOcurre(s.pasoActual)) { responder(M, opc.variante); if (!M.guardarActividad()) throw new Error("actividad no guardada en " + s.pasoActual + " (" + usuario + ") · " + (M.S.msg || "")); }
    if (b.tipo === "contexto" && opc.variante % 2) M.S.ctxObs = "Nota sobre " + b.pasos.join(",");
    M.avanzar();
  }
  M.guardarLocal();
  return M.documentoRespuesta();
}
module.exports = { crearMotor, configDemo, recorrer, responder, valorar, memoria, RAIZ, MESA };

if (require.main === module) {
  const cfg = configDemo(), muestras = process.argv.includes("--muestras"), dir = path.join(RAIZ, "tests", "salida", "muestras");
  if (muestras) fs.mkdirSync(dir, { recursive:true });
  let fallas = 0; const ok = (c, t) => { if (!c) { fallas++; console.log("  FALLA · " + t); } };
  cfg.cuentas.forEach((q, i) => {
    const M = crearMotor(cfg), doc = recorrer(M, q.u, cfg.demo.clave, { variante:i, datos:i % 3 === 0 ? { nombre:"Persona de prueba " + i, entidad:"Entidad " + i, correo:"p" + i + "@ejemplo.org" } : null });
    const v = M.vigentes(), act = v.filter(r => r.tipo === "actividad"), errs = M.validarRespuesta(doc);
    const esperadas = M.bloquesDe(q.a, "actual").filter(b => b.tipo === "actividad" && !M.pasoNoOcurre(b.pasos[0])).length;
    ok(!errs.length, q.u + ": documento válido (" + errs.join("; ") + ")");
    ok(doc.estado === "completa", q.u + ": estado completa");
    ok(act.length === esperadas, q.u + ": " + act.length + " actividades de " + esperadas);
    ok(v.filter(r => r.tipo === "valoracion").length === 1 && v.filter(r => r.tipo === "preguntas").length === 1, q.u + ": una valoración y un juego de preguntas");
    ok(act.every(r => r.payload.comparacion && r.payload.comparacion.decision), q.u + ": cada respuesta trae la comparación con el módulo");
    ok(act.every(r => r.payload.estado && r.payload.estado.piezas), q.u + ": cada respuesta trae el estado del caso");
    ok(v.some(r => r.tipo === "decision" && r.origen === "sistema"), q.u + ": los actores simulados decidieron");
    ok(doc.avance.hechas === doc.avance.total, q.u + ": avance completo");
    ok(!JSON.stringify(doc).includes(q.h) && !/DEMO-?2026/i.test(JSON.stringify(doc)), q.u + ": sin credenciales en el documento");
    const tipos = {}; v.forEach(r => { tipos[r.tipo] = (tipos[r.tipo] || 0) + 1; });
    console.log((errs.length ? "FALLA " : "OK    ") + q.u.padEnd(20) + " min~" + String(M.minutosEstimados(q.a)).padStart(2) + "  " + Object.keys(tipos).sort().map(k => k + ":" + tipos[k]).join(" "));
    if (muestras) fs.writeFileSync(path.join(dir, "respuestas-" + q.u + ".json"), JSON.stringify(doc, null, 2));
  });
  console.log(fallas ? fallas + " falla(s)" : "Los 12 roles completan el recorrido, con el caso ramificado.");
  process.exit(fallas ? 1 : 0);
}
