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
function entradasZip(buf) {
  const out = []; let i = 0;
  while ((i = buf.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), i)) >= 0) {
    const met = buf.readUInt16LE(i + 8), tam = buf.readUInt32LE(i + 18), ln = buf.readUInt16LE(i + 26), le = buf.readUInt16LE(i + 28);
    const n = buf.slice(i + 30, i + 30 + ln).toString("utf8"), ini = i + 30 + ln + le, datos = buf.slice(ini, ini + tam);
    out.push({ n, texto:(met === 8 ? zlib.inflateRawSync(datos) : datos).toString("utf8") }); i = ini + tam;
  }
  return out;
}
const USUARIOS_DEMO = /\bdemo-(trabajador|empleador|ips|eps|arl|afp|juntaregional|juntanacional|mintrabajo|minsalud|supersalud|jueces)\b/;
const conRastro = t => RASTROS_DEMO.some(re => re.test(t)) || USUARIOS_DEMO.test(t);
const todoZip = entradasZip(zipBin);
const sucios = todoZip.filter(e => conRastro(e.texto)).map(e => e.n);
T.ok(todoZip.length >= 10 && !sucios.length, "ningún archivo del paquete-web.zip —guías y LEEME incluidos— nombra usuarios ni la contraseña de la demostración (" + todoZip.length + " archivos)", sucios.join(", "));
const raiz = fs.readdirSync(L.RAIZ).filter(f => /\.html$/.test(f));
const malNombrados = raiz.filter(f => conRastro(leer(f)) && !/demo/.test(f));
T.ok(!malNombrados.length && raiz.some(f => f === "simulador-demo-artefacto.html") && !raiz.includes("simulador-artefacto.html"),
  "todo archivo que trae cuentas de demostración lleva «demo» en el nombre", malNombrados.join(", ") || raiz.join(", "));
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
T.ok(rutaDemo.estudio.id !== demo.estudio.id, "las dos demostraciones son estudios distintos, así que su avance no se mezcla en el mismo navegador", rutaDemo.estudio.id + " / " + demo.estudio.id);
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
    // Servidor como uno de verdad sin configurar: solo Last-Modified, viejo, y ninguna cabecera de caché.
    {
      const http = require("http"), dirC = L.temporal(), viejo = new Date(Date.UTC(2026, 0, 1)).toUTCString();
      ["index.html", "configuracion.js", "sw.js"].forEach(f => fs.copyFileSync(path.join(L.RAIZ, "paquete-web", f), path.join(dirC, f)));
      const pedidos = [];
      const srv = http.createServer((req, res) => {
        const f = req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0], ruta = path.join(dirC, f);
        pedidos.push(f);
        if (!fs.existsSync(ruta)) { res.writeHead(404); return res.end(); }
        if (req.headers["if-modified-since"] && fs.statSync(ruta).mtimeMs < Date.parse(req.headers["if-modified-since"]) + 1000) { res.writeHead(304); return res.end(); }
        res.writeHead(200, { "Content-Type":/\.js$/.test(f) ? "text/javascript; charset=utf-8" : "text/html; charset=utf-8", "Last-Modified":new Date(fs.statSync(ruta).mtimeMs).toUTCString() });
        res.end(fs.readFileSync(ruta));
      });
      await new Promise(r => srv.listen(0, "127.0.0.1", r));
      const base = "http://127.0.0.1:" + srv.address().port;
      fs.utimesSync(path.join(dirC, "configuracion.js"), new Date(viejo), new Date(viejo));
      fs.utimesSync(path.join(dirC, "index.html"), new Date(viejo), new Date(viejo));
      const ctxC = await br.newContext(), pgC = await L.pagina(ctxC, errores, u => u.startsWith(base));
      await pgC.goto(base + "/index.html");
      const c1 = await texto(pgC, "#vista");
      // El investigador sube su configuración.
      const motor = M.crearMotor(demo), sal = "0011223344556677";
      const real = { formato:1, estudio:{ id:"estudio-real", titulo:"Estudio real de prueba", instrumento:"expediente", expediente:"PI-L02" }, kdf:{ alg:"PBKDF2-HMAC-SHA256", iter:5000 }, envio:null,
        cuentas:[{ u:"ana-01", a:"arl", s:sal, h:motor.huellaClave("ana-01", "CLAVE-REAL-1", sal, 5000) }], generado:"2026-11-16T00:00:00.000Z" };
      fs.writeFileSync(path.join(dirC, "configuracion.js"), "/* Configuración del estudio. */\nwindow.SIM_CONFIG = " + JSON.stringify(real, null, 1) + ";\n");
      await pgC.goto(base + "/index.html"); await w(pgC, 900);
      const c2 = await texto(pgC, "#vista");
      T.ok(/plantilla del paquete/.test(c1) && /Estudio real de prueba/.test(c2) && (await hay(pgC, '[data-in="a-u"]')),
        "si el servidor no manda Cache-Control, al subir la configuración del investigador el sitio la toma sin recarga forzada", c2.slice(0, 160));
      await L.entrarDemo(pgC, "ana-01", "CLAVE-REAL-1");
      T.ok((await pgC.evaluate(() => document.body.getAttribute("data-etapa"))) === "orientacion", "y la cuenta del estudio entra");
      await ctxC.close(); srv.close();
    }
    // El panel convierte el archivo de uso real en el simulador con las cuentas del estudio: lo prueba tests/panel.js.
    // Demostración: muestra las cuentas y los expedientes de cada una.
    const pgD = await L.pagina(ctx, errores);
    await pgD.goto("file://" + path.join(L.RAIZ, "simulador-demo.html"));
    const v3 = await texto(pgD, "#vista");
    T.ok(/Cuentas de demostración/.test(v3) && /DEMO-2026/.test(v3) && (await pgD.locator(".demo-cta").count()) === 15
      && /PI-L02/.test(v3) && /PI-L03/.test(v3) && /PI-L04/.test(v3) && /no entran al análisis/.test(v3),
      "la demostración muestra sus quince cuentas, el expediente de las que tienen uno propio y que no cuentan para el estudio");
    T.ok(!/\{[a-z]+\}/i.test(await texto(pgD, ".acceso")) && /Trae 15 cuentas/.test(v3), "el acceso no muestra marcas sin resolver y dice cuántas cuentas trae");
    await L.entrarDemo(pgD, "demo-arl-l03", "DEMO-2026");
    await clic(pgD, '[data-act="orient"][data-arg="1"]');
    const o2 = await texto(pgD, "#vista");
    T.ok(/El expediente con el que va a trabajar/.test(o2) && /PI-L03/.test(o2) && /Mónica Beltrán Rivas/.test(o2) && !/M\.P\./.test(o2) && !/once pasos/.test(o2),
      "la orientación presenta el expediente de la cuenta, no el caso de la ruta", o2.slice(0, 200));
    await clic(pgD, '[data-act="orient"][data-arg="2"]');
    const o3 = await texto(pgD, "#vista");
    T.ok(/dos condiciones/i.test(o3) && /48 horas/.test(o3) && !/Recorre la ruta una sola vez/.test(o3), "y explica la mecánica de las dos condiciones", o3.slice(0, 200));
    await clic(pgD, '[data-act="orient"][data-arg="3"]');
    const o4 = await texto(pgD, "#vista");
    T.ok(/Su papel en este expediente/.test(o4) && /tramo ilustrativo/.test(o4) && !/día 120|Cuando llegue la calificación de la EPS/.test(o4),
      "y presenta el papel del rol en ese expediente, con los puntos posteriores a la decisión como tramo ilustrativo", o4.slice(0, 240));
    await clic(pgD, '[data-act="orient"][data-arg="4"]');
    await L.aceptarDeclaracion(pgD, null); await L.llenarEncuesta(pgD, 0);
    const v4 = await texto(pgD, "#vista");
    T.ok(/PI-L03/.test(v4) && /Mónica Beltrán Rivas/.test(v4), "y una cuenta de la demostración entra en su propio expediente sintético", v4.slice(0, 160));
    // La otra demostración, en el mismo navegador y con un usuario que existe en las dos, empieza de cero.
    // demo-arl avanza en la demostración del expediente…
    const pgR0 = await L.pagina(ctx, errores);
    await pgR0.goto("file://" + path.join(L.RAIZ, "simulador-demo.html")); await L.entrarDemo(pgR0, "demo-arl", "DEMO-2026");
    await L.pasarOrientacion(pgR0); await L.aceptarDeclaracion(pgR0, null); await L.llenarEncuesta(pgR0, 0);
    // …y en otra pestaña del mismo navegador entra con el mismo usuario a la de la ruta: debe empezar de cero.
    const pgR = await L.pagina(ctx, errores);
    await pgR.goto("file://" + path.join(L.RAIZ, "simulador-ruta-demo.html")); await L.entrarDemo(pgR, "demo-arl", "DEMO-2026");
    const vR2 = await texto(pgR, "#vista");
    T.ok(!/Bienvenido de nuevo/.test(vR2) && !/PI-L01/.test(vR2) && /Qué es este estudio/.test(vR2) && (await pgR.evaluate(() => document.body.getAttribute("data-etapa"))) === "orientacion",
      "la demostración de la ruta no continúa el avance de la del expediente, aunque el usuario se llame igual", vR2.slice(0, 200));
    await ctx.close();
  } catch (e) { T.ok(false, "la prueba se interrumpió", e.stack || e); }
  await br.close();
  T.ok(!errores.length, "sin errores de consola ni peticiones a terceros", errores.slice(0, 4).join(" | "));
  process.exit(T.fin() ? 1 : 0);
})();
