// Qué archivo es para qué: la demostración lleva cuentas de demostración y los cuatro expedientes; lo que se
// publica para uso real no lleva ninguna cuenta, y lo dice con claridad hasta que se le pone la configuración
// del estudio.
//   node tests/entregables.js
const L = require("./lib"), M = require("./motor");
const { clic, hay, texto, w, fs, path } = L;
const T = L.contador("Entregables: demostración frente a uso real");
const leer = f => fs.readFileSync(path.join(L.RAIZ, f), "utf8");
const incluida = h => { const m = /\/\*CONFIG:INICIO\*\/window\.SIM_CONFIG_INCLUIDA=(.*?);\/\*CONFIG:FIN\*\//s.exec(h); return m ? JSON.parse(m[1]) : undefined; };
const RASTROS_DEMO = [/DEMO-?2026/i, /"demo"\s*:/, /"u"\s*:\s*"demo-/];

/* ---------- 1. Uso real: sin cuentas de demostración ---------- */
const real = leer("simulador.html"), cfgReal = incluida(real);
T.ok(cfgReal === null, "simulador.html (uso real) no trae configuración ni cuentas incluidas", JSON.stringify(cfgReal));
T.ok(RASTROS_DEMO.every(re => !re.test(real)), "y no trae ningún rastro de las cuentas de demostración ni de su contraseña");
const plantilla = leer("paquete-web/configuracion.js");
T.ok(/window\.SIM_CONFIG = null;/.test(plantilla) && RASTROS_DEMO.every(re => !re.test(plantilla)) && !/"cuentas"/.test(plantilla),
  "el configuracion.js del paquete es una plantilla sin estudio y sin cuentas", plantilla.slice(0, 160));
const indexWeb = leer("paquete-web/index.html");
T.ok(incluida(indexWeb) === null && RASTROS_DEMO.every(re => !re.test(indexWeb)), "el index.html del paquete tampoco trae cuentas incluidas");
// El zip que se entrega lleva exactamente esa plantilla.
const zipBin = fs.readFileSync(path.join(L.RAIZ, "paquete-web.zip"));
const zlib = require("zlib");
function entradaZip(buf, nombre) {
  let i = 0;
  while ((i = buf.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), i)) >= 0) {
    const met = buf.readUInt16LE(i + 8), tam = buf.readUInt32LE(i + 18), ln = buf.readUInt16LE(i + 26), le = buf.readUInt16LE(i + 28);
    const n = buf.slice(i + 30, i + 30 + ln).toString("utf8"), ini = i + 30 + ln + le, datos = buf.slice(ini, ini + tam);
    if (n === nombre) return (met === 8 ? zlib.inflateRawSync(datos) : datos).toString("utf8");
    i = ini + tam;
  }
  return null;
}
const enZip = entradaZip(zipBin, "paquete-web/configuracion.js");
T.ok(enZip === plantilla, "y el paquete-web.zip que se entrega lleva esa misma plantilla, no la de demostración");
T.ok(!fs.existsSync(path.join(L.RAIZ, "paquete-web", "simulador-demo.html")) && entradaZip(zipBin, "paquete-web/simulador-demo.html") === null,
  "la demostración no viaja dentro del paquete de uso real");

/* ---------- 2. Demostración: cuentas de demostración y los cuatro expedientes ---------- */
const demo = incluida(leer("simulador-demo.html"));
const cats = M.crearMotor(demo).EXP.casos.map(c => c.id);
const porExp = {}; demo.cuentas.forEach(q => { const e = q.expediente || demo.estudio.expediente; (porExp[e] = porExp[e] || []).push(q.u); });
T.ok(demo.demo && demo.demo.clave === "DEMO-2026" && demo.cuentas.length === 15 && demo.cuentas.every(q => /^demo-/.test(q.u) && q.p === true),
  "simulador-demo.html trae las cuentas de demostración, marcadas como tales", demo.cuentas.length + " cuentas");
T.ok(cats.every(id => (porExp[id] || []).length > 0), "y con ellas se pueden recorrer los cuatro expedientes sintéticos", JSON.stringify(porExp));
const rutaDemo = incluida(leer("simulador-ruta-demo.html"));
T.ok(rutaDemo.demo && rutaDemo.estudio.instrumento === "ruta" && rutaDemo.cuentas.length === 12 && rutaDemo.cuentas.every(q => !q.expediente),
  "simulador-ruta-demo.html es la demostración del otro instrumento, con una cuenta por rol");
T.ok(!fs.existsSync(path.join(L.RAIZ, "simulador-ruta.html")), "y el nombre anterior, que no decía que era de demostración, ya no se construye");
// Cada cuenta con expediente propio entra en ese expediente.
const casos = {};
demo.cuentas.filter(q => q.expediente).forEach(q => {
  const m = M.crearMotor(demo);
  m.S.acc = { u:q.u, c:demo.demo.clave, ver:false }; m.entrar();
  casos[q.u] = m.S.cuenta ? m.casoExp().id : "no entró";
});
T.ok(Object.keys(casos).length === 3 && Object.keys(casos).every(u => casos[u] === demo.cuentas.filter(q => q.u === u)[0].expediente),
  "cada cuenta de demostración con expediente propio trabaja ese expediente", JSON.stringify(casos));

/* ---------- 3. Por la interfaz ---------- */
(async () => {
  const errores = [], br = await L.lanzar();
  try {
    const ctx = await br.newContext({ viewport:{ width:1280, height:900 } });
    // Uso real, archivo único: no deja entrar y explica qué falta.
    const pg = await L.pagina(ctx, errores);
    await pg.goto("file://" + path.join(L.RAIZ, "simulador.html"));
    const v1 = await texto(pg, "#vista");
    T.ok(/todavía no está configurado/.test(v1) && !(await hay(pg, '[data-in="a-u"]')) && !(await hay(pg, ".demo-cta")),
      "abierto tal cual, el archivo de uso real no deja entrar ni muestra cuentas de demostración");
    T.ok(/versión para uso real/.test(v1) && /Simulador en un solo archivo/.test(v1) && /simulador-demo\.html/.test(v1),
      "y explica que las cuentas se las pone el panel, y dónde está la demostración", v1.slice(0, 260));
    // Uso real, sitio con la plantilla del paquete.
    const dir = L.temporal();
    ["index.html", "configuracion.js"].forEach(f => fs.copyFileSync(path.join(L.RAIZ, "paquete-web", f), path.join(dir, f)));
    const S = await L.servir(dir), pgS = await L.pagina(ctx, errores, u => u.startsWith(S.base));
    await pgS.goto(S.base + "/index.html");
    const v2 = await texto(pgS, "#vista");
    T.ok(/todavía no está configurado/.test(v2) && /plantilla del paquete/.test(v2) && /configuracion\.js/.test(v2) && !(await hay(pgS, '[data-in="a-u"]')),
      "un sitio recién publicado con el paquete dice que falta la configuración del investigador y no deja entrar", v2.slice(0, 260));
    await S.cerrar();
    // El panel convierte el archivo de uso real en el simulador con las cuentas del estudio: lo prueba tests/panel.js.
    // Demostración: muestra las cuentas y los expedientes de cada una.
    const pgD = await L.pagina(ctx, errores);
    await pgD.goto("file://" + path.join(L.RAIZ, "simulador-demo.html"));
    const v3 = await texto(pgD, "#vista");
    T.ok(/Cuentas de demostración/.test(v3) && /DEMO-2026/.test(v3) && (await pgD.locator(".demo-cta").count()) === 15
      && /PI-L02/.test(v3) && /PI-L03/.test(v3) && /PI-L04/.test(v3) && /no entran al análisis/.test(v3),
      "la demostración muestra sus quince cuentas, el expediente de las que tienen uno propio y que no cuentan para el estudio");
    await L.entrarDemo(pgD, "demo-arl-l03", "DEMO-2026");
    await L.pasarOrientacion(pgD); await L.aceptarDeclaracion(pgD, null); await L.llenarEncuesta(pgD, 0);
    const v4 = await texto(pgD, "#vista");
    T.ok(/PI-L03/.test(v4) && /Mónica Beltrán Rivas/.test(v4), "y una cuenta de la demostración entra en su propio expediente sintético", v4.slice(0, 160));
    await ctx.close();
  } catch (e) { T.ok(false, "la prueba se interrumpió", e.stack || e); }
  await br.close();
  T.ok(!errores.length, "sin errores de consola ni peticiones a terceros", errores.slice(0, 4).join(" | "));
  process.exit(T.fin() ? 1 : 0);
})();
