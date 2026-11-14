// Prueba de navegador del simulador publicado en un sitio (http) con un receptor de respuestas simulado:
// envío a medida que avanza, caída de la conexión, reintento, recuperación desde el servidor en otro
// dispositivo, envío al final, retiro, reapertura sin conexión (service worker) y sitio sin configurar.
// El receptor PHP real se prueba en tests/servidor.js; aquí se prueba el lado del simulador.
const L = require("./lib"), M = require("./motor");
const { clic, hay, texto, w, fs, path } = L;
const T = L.contador("Simulador en un sitio web, con receptor simulado");
const motor = M.crearMotor(M.configDemo());
const CLAVE = "K7QF-M2XD", ENVIO = "clave-de-envio-de-prueba";
function configuracion(envio, estudio) {   // `estudio` permite montar varias sesiones de simulación distintas
  const cuentas = [["eps-01", "eps"], ["jn-01", "jn"]].map(([u, a], i) => { const s = "00112233aabbcc0" + i; return { u, a, s, h:motor.huellaClave(u, CLAVE, s, 5000) }; });
  return { formato:1, estudio:Object.assign({ id:"estudio-prueba", titulo:"Estudio de prueba", investigador:"Investigador de prueba", contacto:"contacto@ejemplo.org" }, estudio || {}), kdf:{ alg:"PBKDF2-HMAC-SHA256", iter:5000 }, envio, cuentas, generado:"2026-01-01T00:00:00.000Z" };
}
// Sitio de prueba: copia de paquete-web con la configuración indicada y un receptor en memoria.
async function sitio(cfg, conSw) {
  const dir = L.temporal();
  fs.copyFileSync(path.join(L.RAIZ, "paquete-web", "index.html"), path.join(dir, "index.html"));
  if (conSw) fs.copyFileSync(path.join(L.RAIZ, "paquete-web", "sw.js"), path.join(dir, "sw.js"));
  if (cfg) fs.writeFileSync(path.join(dir, "configuracion.js"), typeof cfg === "string" ? cfg : "window.SIM_CONFIG = " + JSON.stringify(cfg) + ";");
  const R = { docs:{}, llamadas:[], fallar:false, retirados:[] };
  const s = await L.servir(dir, (req, res, cuerpo, ruta) => {
    if (ruta !== "/recibir.php") return false;
    const fin = (c, o) => { res.writeHead(c, { "Content-Type":"application/json; charset=utf-8" }); res.end(JSON.stringify(o)); return true; };
    if (req.method !== "POST") return fin(405, { ok:false, error:"solo POST" });
    let b; try { b = JSON.parse(cuerpo); } catch (e) { return fin(400, { ok:false, error:"JSON inválido" }); }
    R.llamadas.push({ accion:b.accion, tipo:req.headers["content-type"], reanudar:b.reanudar });
    if (R.fallar) return fin(500, { ok:false, error:"falla simulada del servidor" });
    if (b.clave !== ENVIO) return fin(403, { ok:false, error:"clave de envío incorrecta" });
    if (b.accion === "guardar") { const d = b.documento; R.docs[d.estudio.id + "/" + d.cuenta.usuario + "/" + d.participante.id] = { documento:d, reanudar:b.reanudar, t:Date.now() }; return fin(200, { ok:true, recibido:new Date().toISOString() }); }
    if (b.accion === "recuperar") { const c = Object.keys(R.docs).filter(k => k.startsWith(b.estudio + "/" + b.usuario + "/")).map(k => R.docs[k]).filter(x => x.reanudar === b.reanudar).sort((x, y) => y.t - x.t)[0]; return fin(200, { ok:true, documento:c ? c.documento : null }); }
    if (b.accion === "retirar") { delete R.docs[b.estudio + "/" + b.usuario + "/" + b.participante]; R.retirados.push(b.participante); return fin(200, { ok:true }); }
    return fin(400, { ok:false, error:"acción desconocida" });
  });
  return Object.assign(s, { dir, R, url:s.base + "/index.html" });
}
const docDe = (R, u) => { const k = Object.keys(R.docs).filter(x => x.indexOf("/" + u + "/") > 0)[0]; return k ? R.docs[k].documento : null; };
const esperar = async (cond, ms) => { const t = Date.now(); while (Date.now() - t < (ms || 6000)) { if (await cond()) return true; await new Promise(r => setTimeout(r, 100)); } return false; };
const actividades = d => (d ? d.registros.filter(r => r.tipo === "actividad").length : -1);

(async () => {
  const br = await L.lanzar(), errores = [];
  try {
    /* ---------- Envío a medida que avanza ---------- */
    const A = await sitio(configuracion({ url:"recibir.php", clave:ENVIO, modo:"progresivo" }));
    const local = u => u.startsWith(A.base);
    const ctx = await br.newContext({ viewport:{ width:1280, height:900 }, acceptDownloads:true }), pg = await L.pagina(ctx, errores, local);
    await pg.goto(A.url);
    T.ok(!(await hay(pg, ".demo")) && /Estudio de prueba/.test(await texto(pg, "#vista")), "el sitio usa configuracion.js y no muestra cuentas de demostración");
    await L.entrarDemo(pg, "eps-01", CLAVE);
    T.ok(await esperar(() => A.R.llamadas.some(x => x.accion === "recuperar")) && (await pg.evaluate(() => document.body.getAttribute("data-etapa"))) === "orientacion", "en un dispositivo nuevo pregunta al servidor si hay avance guardado y, si no, empieza por la orientación");
    T.ok(/se envían al investigador a medida que avanza/.test(await (async () => { await clic(pg, '[data-act="orient"][data-arg="1"]'); await clic(pg, '[data-act="orient"][data-arg="2"]'); return texto(pg, "#vista"); })()), "la orientación explica que las respuestas se envían a medida que avanza");
    await clic(pg, '[data-act="orient"][data-arg="3"]'); await clic(pg, '[data-act="orient"][data-arg="4"]'); await L.aceptarDeclaracion(pg, { nombre:"Persona Uno" });
    T.ok(await esperar(() => !!docDe(A.R, "eps-01")), "al aceptar la declaración el servidor recibe el primer documento");
    const ll = A.R.llamadas.filter(x => x.accion === "guardar")[0];
    T.ok(/^text\/plain/.test(ll.tipo) && /^[0-9a-f]{64}$/.test(ll.reanudar) && !A.R.llamadas.some(x => x.reanudar && configuracion().cuentas.some(c => c.h === x.reanudar)), "el envío va como texto plano con la llave de reanudación, que no es la huella de la contraseña");
    await L.recorrerInterfaz(pg, 0, h => h.filter(x => x === "actividad").length === 1);
    T.ok(await esperar(() => actividades(docDe(A.R, "eps-01")) === 1) && docDe(A.R, "eps-01").estado === "parcial", "cada respuesta actualiza el documento en el servidor");
    /* ---------- Caída de la conexión ---------- */
    await ctx.setOffline(true); await pg.evaluate(() => window.dispatchEvent(new Event("offline"))); await w(pg, 100);
    T.ok(/Sin conexión/.test(await texto(pg, "#top")), "sin conexión lo avisa y dice que el avance sigue guardado");
    await L.recorrerInterfaz(pg, 0, h => h.filter(x => x === "actividad").length === 2);
    const guardadoLocal = await pg.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(k => k.endsWith(":eps-01"))[0])));
    T.ok(guardadoLocal.regs.filter(r => r.tipo === "actividad").length === 3 && actividades(docDe(A.R, "eps-01")) === 1, "sin conexión la simulación continúa y guarda en el dispositivo");
    await ctx.setOffline(false); await pg.evaluate(() => window.dispatchEvent(new Event("online")));
    T.ok(await esperar(() => actividades(docDe(A.R, "eps-01")) === 3), "al volver la conexión se envía lo pendiente sin que el participante haga nada");
    /* ---------- Falla del servidor ---------- */
    A.R.fallar = true; errores.length = 0;
    await L.recorrerInterfaz(pg, 0, h => h.filter(x => x === "actividad").length === 1); await w(pg, 300);
    const consola = errores.splice(0).filter(e => !/500|Failed to load resource/.test(e));
    T.ok(!consola.length && (await pg.evaluate(() => document.body.getAttribute("data-etapa"))) === "simulacion", "si el servidor falla, el participante sigue sin interrupciones", consola.join(" | "));
    A.R.fallar = false;
    await L.recorrerInterfaz(pg, 0, h => h.filter(x => x === "actividad").length === 1);
    T.ok(await esperar(() => actividades(docDe(A.R, "eps-01")) === 5), "y el siguiente envío lleva todo lo acumulado");
    /* ---------- Recuperación en otro dispositivo ---------- */
    const pasoEn = (await pg.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(k => k.endsWith(":eps-01"))[0])))).ses.pasoActual;
    const ctxB = await br.newContext({ viewport:{ width:1280, height:900 } }), pgB = await L.pagina(ctxB, errores, local);
    await pgB.goto(A.url); await L.entrarDemo(pgB, "eps-01", CLAVE);
    T.ok(await esperar(async () => /Bienvenido de nuevo/.test(await texto(pgB, "#vista"))) && /servidor del estudio/.test(await texto(pgB, "#vista")) && new RegExp("paso " + pasoEn).test(await texto(pgB, "#vista")), "en otro dispositivo, con el mismo usuario y contraseña, recupera el avance desde el servidor", await texto(pgB, "#vista"));
    await clic(pgB, '[data-act="retomar-continuar"]');
    const gB = await pgB.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(k => k.endsWith(":eps-01"))[0])));
    T.ok(gB.yo.id === guardadoLocal.yo.id && gB.consent.datos.nombre === "Persona Uno" && gB.regs.filter(r => r.tipo === "actividad").length === 5, "con la misma participación, sus datos y sus respuestas");
    await ctxB.close();
    const ctxC = await br.newContext(), pgC = await L.pagina(ctxC, errores, local);
    await pgC.goto(A.url); await L.entrarDemo(pgC, "jn-01", CLAVE); await w(pgC, 400);
    T.ok((await pgC.evaluate(() => document.body.getAttribute("data-etapa"))) === "orientacion" && !/Bienvenido de nuevo/.test(await texto(pgC, "#vista")), "otra cuenta no recibe el avance de nadie más");
    await ctxC.close();
    /* ---------- Final y entrega ---------- */
    await L.recorrerInterfaz(pg, 0);
    T.ok((await hay(pg, "#titulo-cierre")) && await esperar(async () => /Sus respuestas fueron enviadas/.test(await texto(pg, "#vista"))) && docDe(A.R, "eps-01").estado === "completa", "al terminar, el documento completo queda en el servidor y la pantalla lo confirma");
    await pg.fill('[data-in="x-comentario"]', "Comentario final"); await clic(pg, '[data-act="guardar-comentario"]');
    T.ok(await esperar(() => docDe(A.R, "eps-01").registros.some(r => r.tipo === "observacion" && r.payload.final && r.payload.texto === "Comentario final")), "el comentario final también se envía");
    /* ---------- Retiro ---------- */
    const pid = docDe(A.R, "eps-01").participante.id;
    await clic(pg, '[data-act="retirar"]'); await clic(pg, '[data-act="retirar-si"]', 300);
    T.ok(A.R.retirados.indexOf(pid) >= 0 && !docDe(A.R, "eps-01") && /Se retiró del estudio/.test(await texto(pg, "#vista")), "retirarse pide al servidor eliminar lo enviado");
    await ctx.close(); await A.cerrar();

    /* ---------- Envío solo al final ---------- */
    const F = await sitio(configuracion({ url:"recibir.php", clave:ENVIO, modo:"final" }));
    const ctxF = await br.newContext({ viewport:{ width:1280, height:900 }, acceptDownloads:true }), pgF = await L.pagina(ctxF, errores, u => u.startsWith(F.base));
    await pgF.goto(F.url); await L.entrarDemo(pgF, "jn-01", CLAVE); await L.pasarOrientacion(pgF); await L.aceptarDeclaracion(pgF, null); await L.recorrerInterfaz(pgF, 1);
    T.ok((await hay(pgF, "#titulo-cierre")) && !F.R.llamadas.some(x => x.accion === "guardar") && (await hay(pgF, '[data-act="enviar"]')), "en modo «al final» nada se envía hasta que el participante lo confirma");
    F.R.fallar = true; await clic(pgF, '[data-act="enviar"]', 500); errores.splice(0);
    T.ok(/No fue posible enviar sus respuestas/.test(await texto(pgF, "#vista")) && /falla simulada/.test(await texto(pgF, "#vista")) && (await hay(pgF, '[data-act="descargar"]')), "si el envío falla lo dice, deja reintentar y ofrece descargar el archivo");
    F.R.fallar = false; await clic(pgF, '[data-act="enviar"]', 500);
    T.ok(/Sus respuestas fueron enviadas/.test(await texto(pgF, "#vista")) && docDe(F.R, "jn-01").estado === "completa", "al reintentar, el envío llega");
    await ctxF.close(); await F.cerrar();

    /* ---------- Reapertura sin conexión ---------- */
    const W = await sitio(configuracion(null), true);
    const ctxW = await br.newContext({ viewport:{ width:1280, height:900 } }), pgW = await L.pagina(ctxW, errores, u => u.startsWith(W.base));
    await pgW.goto(W.url); await pgW.evaluate(() => navigator.serviceWorker.ready); await w(pgW, 500);
    await L.entrarDemo(pgW, "eps-01", CLAVE); await L.pasarOrientacion(pgW); await L.aceptarDeclaracion(pgW, null); await L.recorrerInterfaz(pgW, 0, h => h.filter(x => x === "actividad").length === 1);
    await ctxW.setOffline(true);
    let recargo = true; try { await pgW.reload({ timeout:10000 }); } catch (e) { recargo = false; }
    await w(pgW, 400);
    const consolaW = errores.splice(0).filter(e => !/ERR_INTERNET_DISCONNECTED|Failed to load resource|sw\.js/.test(e));
    T.ok(recargo && (await pgW.evaluate(() => document.body.getAttribute("data-etapa"))) === "simulacion" && (await hay(pgW, '[data-act="continuar"]')) && !consolaW.length, "después de la primera visita la página abre sin conexión y restablece la sesión donde iba", consolaW.join(" | "));
    T.ok(/descarga un archivo/.test(await (async () => { await clic(pgW, '[data-act="orient-ver"]'); await clic(pgW, '[data-act="orient"][data-arg="1"]'); await clic(pgW, '[data-act="orient"][data-arg="2"]'); return texto(pgW, "#vista"); })()), "sin receptor, la orientación explica que la entrega es por archivo");
    await ctxW.close(); await W.cerrar();

    /* ---------- Dos sesiones de simulación en el mismo navegador ---------- */
    const D = await sitio(configuracion(null, { id:"estudio-uno", titulo:"Sesión uno" }), true);
    fs.writeFileSync(path.join(D.dir, "dos.html"), fs.readFileSync(path.join(D.dir, "index.html"), "utf8").replace('<script src="configuracion.js"></script>', "<script>window.SIM_CONFIG = " + JSON.stringify(configuracion(null, { id:"estudio-dos", titulo:"Sesión dos" })) + ";</script>"));
    const ctxD = await br.newContext({ viewport:{ width:1280, height:900 } }), pgD = await L.pagina(ctxD, errores, u => u.startsWith(D.base));
    await pgD.goto(D.url); await L.entrarDemo(pgD, "eps-01", CLAVE); await L.pasarOrientacion(pgD); await L.aceptarDeclaracion(pgD, null);
    await L.recorrerInterfaz(pgD, 0, h => h.filter(x => x === "actividad").length === 2);
    const llaves = () => pgD.evaluate(() => Object.keys(localStorage).filter(k => k.indexOf("simasinc:v1:") === 0).sort());
    const tras1 = await llaves();
    await pgD.goto(D.base + "/dos.html"); await L.entrarDemo(pgD, "eps-01", CLAVE);
    T.ok((await pgD.evaluate(() => document.body.getAttribute("data-etapa"))) === "orientacion" && !/Bienvenido de nuevo/.test(await texto(pgD, "#vista")), "con el mismo usuario en otra sesión de simulación se empieza de cero, sin arrastrar el avance");
    await L.pasarOrientacion(pgD); await L.aceptarDeclaracion(pgD, null); await L.recorrerInterfaz(pgD, 1, h => h.filter(x => x === "actividad").length === 1);
    const tras2 = await llaves();
    T.ok(tras2.length > tras1.length && tras2.some(k => k.indexOf("estudio-uno") > 0) && tras2.some(k => k.indexOf("estudio-dos") > 0), "cada sesión guarda su avance en su propia llave, sin pisarse", tras2.join(" "));
    // En la misma pestaña, cada sesión recuerda su propio acceso: al volver se continúa sin pedir la contraseña.
    await pgD.goto(D.url); await L.w(pgD, 500);
    T.ok((await pgD.evaluate(() => document.body.getAttribute("data-etapa"))) === "simulacion" && /2 de 8/.test(await texto(pgD, "#vista")), "y al volver a la primera sesión se retoma donde iba", (await texto(pgD, "#vista")).slice(0, 160));
    await ctxD.close(); await D.cerrar();

    /* ---------- Sitio sin configurar o mal configurado ---------- */
    for (const [cfg, nombre] of [[null, "sin configuracion.js"], ["window.SIM_CONFIG = { formato:1, estudio:{ id:'x' }, cuentas:[] };", "con una configuración sin cuentas"], ["esto no es javascript {", "con un configuracion.js dañado"]]) {
      const N = await sitio(cfg), ctxN = await br.newContext(), pgN = await L.pagina(ctxN, [], u => u.startsWith(N.base));
      await pgN.goto(N.url);
      T.ok(/todavía no está configurado/.test(await texto(pgN, "#vista")) && !(await hay(pgN, '[data-in="a-u"]')), "un sitio " + nombre + " lo dice con claridad y no deja entrar");
      await ctxN.close(); await N.cerrar();
    }
    T.ok(!errores.length, "sin errores de consola ni peticiones a terceros", errores.slice(0, 5).join(" | "));
  } catch (e) { T.ok(false, "la prueba se interrumpió", e.stack || e); }
  await br.close();
  process.exit(T.fin() ? 1 : 0);
})();
