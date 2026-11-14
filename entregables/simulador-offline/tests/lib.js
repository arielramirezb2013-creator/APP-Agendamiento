// Utilidades comunes de las pruebas de navegador de la versión asíncrona.
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const RAIZ = path.resolve(__dirname, "..");
const SALIDA = process.env.SALIDA || path.join(__dirname, "salida");
fs.mkdirSync(SALIDA, { recursive:true });
const TIPOS = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".css":"text/css; charset=utf-8", ".txt":"text/plain; charset=utf-8" };

// Servidor estático en el propio proceso. `extra(req, res, cuerpo)` puede atender una ruta y devolver true.
function servir(dir, extra) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const trozos = [];
      req.on("data", c => trozos.push(c));
      req.on("end", () => {
        const cuerpo = Buffer.concat(trozos).toString("utf8"), ruta = decodeURIComponent(req.url.split("?")[0]);
        if (extra && extra(req, res, cuerpo, ruta) === true) return;
        const f = path.join(dir, ruta === "/" ? "index.html" : ruta);
        if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404, { "Content-Type":"text/plain; charset=utf-8" }); res.end("no existe"); return; }
        res.writeHead(200, { "Content-Type":TIPOS[path.extname(f)] || "application/octet-stream", "Cache-Control":"no-store" }); res.end(fs.readFileSync(f));
      });
    });
    srv.listen(0, "127.0.0.1", () => resolve({ srv, base:"http://127.0.0.1:" + srv.address().port, cerrar:() => new Promise(r => srv.close(r)) }));
  });
}
async function lanzar() {
  process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  try { return await chromium.launch({ args:["--proxy-server=direct://"] }); }
  catch (e) { return chromium.launch({ executablePath:"/opt/pw-browsers/chromium", args:["--proxy-server=direct://", "--no-sandbox"] }); }
}
// Página que anota errores de consola, excepciones y peticiones fuera de lo permitido.
async function pagina(ctx, errores, permitido) {
  const pg = await ctx.newPage();
  pg.on("console", m => { if (m.type() === "error") errores.push("consola: " + m.text()); });
  pg.on("pageerror", e => errores.push("excepción: " + e.message));
  pg.on("request", r => { const u = r.url(); if (!/^(file|data|blob|about):/.test(u) && !(permitido && permitido(u))) errores.push("petición externa: " + u); });
  return pg;
}
const w = (pg, ms) => pg.waitForTimeout(ms == null ? 40 : ms);
// Clic por DOM con foco previo: equivale al de un usuario y no depende de que el elemento esté a la vista.
async function clic(pg, sel, ms) { await pg.locator(sel).first().evaluate(el => { el.focus(); el.click(); }); await w(pg, ms); }
const hay = async (pg, sel) => (await pg.locator(sel).count()) > 0;
const texto = async (pg, sel) => ((await pg.locator(sel).first().textContent()) || "").replace(/\s+/g, " ").trim();
async function descargar(pg, sel) {
  for (let i = 0; i < 3; i++) {
    try { const [d] = await Promise.all([pg.waitForEvent("download", { timeout:8000 }), clic(pg, sel)]); const f = path.join(SALIDA, "dl-" + Date.now() + "-" + d.suggestedFilename()); await d.saveAs(f); return { archivo:f, nombre:d.suggestedFilename(), texto:fs.readFileSync(f, "utf8") }; }
    catch (e) { if (i === 2) throw e; }
  }
}
function contador(titulo) {
  let n = 0, fallas = 0; const t0 = Date.now();
  console.log("== " + titulo);
  return {
    ok(cond, t, detalle) { n++; if (cond) console.log("OK    " + String(n).padStart(3) + " · " + t); else { fallas++; console.log("FALLA " + String(n).padStart(3) + " · " + t + (detalle ? "  →  " + String(detalle).slice(0, 400) : "")); } return !!cond; },
    fin() { console.log((fallas ? fallas + " falla(s) de " : "Todo en verde: ") + n + " comprobaciones · " + Math.round((Date.now() - t0) / 1000) + " s"); return fallas; }
  };
}
const temporal = prefijo => fs.mkdtempSync(path.join(os.tmpdir(), prefijo || "simasinc-"));

/* ---------- Recorrido genérico del simulador por la interfaz ---------- */
async function entrarDemo(pg, usuario, clave) {
  await pg.fill('[data-in="a-u"]', usuario); await pg.fill('[data-in="a-c"]', clave || "DEMO-2026");
  await clic(pg, "#btn-entrar", 0); await pg.waitForFunction(() => document.body.getAttribute("data-etapa") !== "acceso" || /no coinciden/.test(document.getElementById("top").textContent), null, { timeout:15000 });
  await w(pg, 60);
}
async function pasarOrientacion(pg) { for (let i = 1; i <= 4; i++) await clic(pg, '[data-act="orient"][data-arg="' + i + '"]'); }
async function aceptarDeclaracion(pg, datos) {
  const n = await pg.locator('[data-in="c-decl"]').count();
  for (let i = 0; i < n; i++) await pg.locator('[data-in="c-decl"]').nth(i).check();
  if (datos) {
    await clic(pg, '[data-act="c-anon"][data-v="no"]');
    for (const k of Object.keys(datos)) await pg.fill('[data-in="c-dato"][data-arg="' + k + '"]', String(datos[k]));
    await pg.locator('[data-in="c-decl"][data-arg="datos"]').check();
  }
  await clic(pg, '[data-act="consent-si"]');
}
async function opcion(pg, act, arg, i) {
  const ops = pg.locator('[data-act="' + act + '"][data-arg="' + arg + '"]'), n = await ops.count();
  if (!n) return null;
  const v = await ops.nth(i % n).getAttribute("data-v");
  await clic(pg, '[data-act="' + act + '"][data-arg="' + arg + '"][data-v="' + v + '"]', 0);
  return v;
}
async function llenarActividad(pg, n) {
  if (await hay(pg, '[data-act="f"][data-arg="suficiencia"]')) {
    const s = await opcion(pg, "f", "suficiencia", n);
    if (s !== "suficiente") await pg.locator('[data-in="f-falta"]').nth(n % 5).check();
    const fins = await pg.locator('[data-in="f-finalidad"] option').evaluateAll(os => os.map(o => o.value).filter(Boolean));
    await pg.selectOption('[data-in="f-finalidad"]', fins[n % fins.length]);
    await opcion(pg, "f", "decision", n);
    await pg.selectOption('[data-in="f-responde"]', n % 4 === 3 ? "nadie" : "yo"); await pg.fill('[data-in="f-dias"]', String(2 + (n % 11)));
    if (await hay(pg, '[data-in="f-notifica"]')) await pg.locator('[data-in="f-notifica"]').nth(n % 3).check();
  } else if (await hay(pg, '[data-act="f"][data-arg="respuesta"]')) { await opcion(pg, "f", "respuesta", n); await pg.fill('[data-in="f-dias"]', String(1 + (n % 6))); }
  else if (await hay(pg, '[data-act="f"][data-arg="sabe"]')) { await opcion(pg, "f", "sabe", n); await pg.selectOption('[data-in="f-responde"]', n % 3 ? "eps" : "nadie"); await opcion(pg, "fm", "hizo", n); }
  else if (await hay(pg, '[data-act="f"][data-arg="ve"]')) { await opcion(pg, "f", "ve", n); await opcion(pg, "f", "accion", n + 1); }
  else throw new Error("actividad sin formulario reconocible");
  // La comparación con el módulo aparece cuando ya respondió lo suyo.
  if (await hay(pg, '[data-act="f"][data-arg="cmp"]')) {
    const v = await opcion(pg, "f", "cmp", n);
    if (v === "otra") await pg.fill('[data-in="f-cmpCual"]', "Habría pedido la historia laboral antes de decidir");
    await pg.fill('[data-in="f-cmpDias"]', String(1 + (n % 9)));
    await opcion(pg, "f", "cmpSeg", n);
  }
  if (n % 3 === 0) await pg.fill('[data-in="f-obs"]', "Observación " + n);
}
async function llenarValoracion(pg, n) {
  const s = await opcion(pg, "v", "semaforo", n);
  if (s !== "aceptar") await pg.fill('[data-in="v-ajuste"]', "Ajuste " + n);
  await opcion(pg, "v", "mejora", n);
  for (const q of ["P1", "P2"]) { const v = await opcion(pg, "v", q, n); if (v !== "si") await pg.fill('[data-in="v-p"][data-arg="' + q + 'cual"]', "Detalle " + q); }
  const p3 = await opcion(pg, "vm", "P3", n); if (p3 !== "ninguna") await pg.fill('[data-in="v-p"][data-arg="P3cual"]', "La principal");
  await pg.fill('[data-in="v-p"][data-arg="P4"]', "Requisito " + n);
}
// Avanza una pantalla de la simulación y dice qué hizo.
// Rellena la encuesta de perfil del participante, que va entre la declaración y el recorrido.
async function llenarEncuesta(pg, n) {
  for (const k of ["edad", "formacion", "frecuencia"]) await opcion(pg, "e", k, n);
  const txt = { formacionCual:"Medicina del trabajo", complementarios:"Especialización en SST", experiencia:String(3 + (n % 15)),
    rolActual:"Analista de la ruta de incapacidad", trayectoria:"EPS, analista de incapacidades, 4 años", otrosRoles:"Sí, estuve en una IPS" };
  for (const k of Object.keys(txt)) { const sel = '[data-in="e-campo"][data-arg="' + k + '"]'; if (await hay(pg, sel)) await pg.fill(sel, txt[k]); }
  await clic(pg, '[data-act="enc-guardar"]');
}
async function pantalla(pg, n) {
  if (await hay(pg, "#titulo-cierre")) return "cierre";
  if (await hay(pg, '[data-act="enc-guardar"]')) { await llenarEncuesta(pg, n); return "encuesta"; }
  if (await hay(pg, '[data-act="ronda-iniciar"]')) { await clic(pg, '[data-act="ronda-iniciar"]'); return "inicio"; }
  if (await hay(pg, '[data-act="guardar"]')) { await llenarActividad(pg, n); await clic(pg, '[data-act="guardar"]'); return "actividad"; }
  if (await hay(pg, '[data-act="guardar-val"]')) { await llenarValoracion(pg, n); await clic(pg, '[data-act="guardar-val"]'); return "valoracion"; }
  if (await hay(pg, '[data-act="ronda-cerrar"]')) { await clic(pg, '[data-act="ronda-cerrar"]'); return "cierre-ronda"; }
  if (await hay(pg, '[data-act="continuar"]')) { await clic(pg, '[data-act="continuar"]'); return "continuar"; }
  throw new Error("pantalla desconocida: " + (await texto(pg, "#vista")).slice(0, 200));
}
// Recorre hasta la entrega (o hasta que `parar(hechos)` devuelva true). Devuelve la lista de lo hecho.
async function recorrerInterfaz(pg, variante, parar) {
  const hechos = [];
  for (let i = 0; i < 400; i++) {
    const h = await pantalla(pg, (variante || 0) + hechos.filter(x => x === "actividad" || x === "valoracion").length);
    if (h === "cierre") break;
    hechos.push(h);
    if (parar && parar(hechos)) break;
  }
  return hechos;
}
module.exports = { chromium, servir, lanzar, pagina, w, clic, hay, texto, descargar, contador, temporal, entrarDemo, pasarOrientacion, aceptarDeclaracion, opcion, llenarActividad, llenarValoracion, llenarEncuesta, pantalla, recorrerInterfaz, RAIZ, SALIDA, fs, path };
