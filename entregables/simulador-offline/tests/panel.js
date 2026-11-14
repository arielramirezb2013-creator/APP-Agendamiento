// Prueba de navegador del panel del investigador: clave, estudio, cuentas, publicación, respuestas,
// seguimiento y resultados, con los archivos reales que produce el simulador.
//   node tests/panel.js
const L = require("./lib"), M = require("./motor");
const { clic, hay, texto, w, fs, path } = L;
const T = L.contador("Panel del investigador");
const cfgDemo = M.configDemo(), motor = M.crearMotor(cfgDemo);
const CLAVE_PANEL = "clave-de-prueba-2026";
const VENENO = '<img src=x onerror="window.__roto=1"><script>window.__roto=1<\/script>';

const estado = pg => pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
// Índice + estudio abierto, tal como los guarda el panel (una llave por sesión de simulación).
const proyecto = async pg => {
  const e = await estado(pg), idx = e["simasinc-admin:v1"] ? JSON.parse(e["simasinc-admin:v1"]) : null;
  if (!idx) return null;
  const p = idx.actual && e["simasinc-admin:v1:p:" + idx.actual] ? JSON.parse(e["simasinc-admin:v1:p:" + idx.actual]) : null;
  return { admin:idx.admin, indice:idx, proyecto:p ? p.proyecto : null };
};
const roto = pg => pg.evaluate(() => !!window.__roto || !!document.querySelector("#vista img[src='x']"));
// Escribe y suelta el campo: el panel no repinta mientras un campo tiene el foco.
async function escribir(pg, sel, v) { await pg.fill(sel, v); await pg.locator(sel).first().evaluate(el => { el.dispatchEvent(new Event("change", { bubbles:true })); el.blur(); }); await w(pg, 400); }
async function entrarPanel(pg, clave, nueva) {
  await pg.fill('[data-in="ac-c1"]', clave);
  if (nueva) await pg.fill('[data-in="ac-c2"]', clave);
  await clic(pg, "#btn-admin", 0);
  await pg.waitForFunction(() => document.body.getAttribute("data-vista") !== "acceso" || /no coincide|al menos/.test(document.getElementById("top").textContent), null, { timeout:20000 });
  await w(pg, 120);
}
const ir = (pg, v) => clic(pg, '[data-act="ir"][data-arg="' + v + '"]', 200);
// Documento de respuestas real de un rol, con el usuario y el estudio que use el panel.
function documento(usuario, actor, estudioId, variante, hasta) {
  const cfg = JSON.parse(JSON.stringify(cfgDemo));
  cfg.estudio.id = estudioId; delete cfg.demo;   // documentos de cuentas reales, no de demostración
  const q = cfg.cuentas.filter(x => x.a === actor)[0];
  q.u = usuario; q.s = "00112233aabbccdd"; q.h = motor.huellaClave(usuario, cfgDemo.demo.clave, q.s, 5000); delete q.p;
  const m = M.crearMotor(cfg);
  const d = M.recorrer(m, usuario, cfgDemo.demo.clave, { variante:variante || 0, hasta, datos:variante === 1 ? { nombre:"Persona Dos " + VENENO, correo:"dos@ejemplo.org" } : null });
  return d;
}

(async () => {
  const br = await L.lanzar(), errores = [];
  const dir = L.temporal("panel-");
  fs.copyFileSync(path.join(L.RAIZ, "paquete-web/administrador.html"), path.join(dir, "administrador.html"));
  fs.copyFileSync(path.join(L.RAIZ, "paquete-web/index.html"), path.join(dir, "index.html"));
  const S = await L.servir(dir);
  try {
    const ctx = await br.newContext({ viewport:{ width:1360, height:950 }, acceptDownloads:true }), pg = await L.pagina(ctx, errores, u => u.startsWith(S.base));
    await pg.goto(S.base + "/administrador.html");
    /* ---------- Clave ---------- */
    T.ok(/Panel del investigador/.test(await texto(pg, "#vista h1")) && (await hay(pg, '[data-in="ac-c2"]')), "la primera vez pide crear una clave de administración");
    await entrarPanel(pg, "corta", true);
    T.ok((await pg.evaluate(() => document.body.getAttribute("data-vista"))) === "acceso" && /al menos 8/.test(await texto(pg, "#top")), "una clave demasiado corta no se acepta");
    await entrarPanel(pg, CLAVE_PANEL, true);
    T.ok((await pg.evaluate(() => document.body.getAttribute("data-vista"))) === "estudio", "con una clave válida se crea el proyecto y abre «Estudio»");
    const p0 = await proyecto(pg);
    T.ok(p0 && /^[0-9a-f]{64}$/.test(p0.admin.huella) && !JSON.stringify(p0).includes(CLAVE_PANEL), "la clave se guarda como huella, nunca en claro");
    /* ---------- Estudio ---------- */
    await escribir(pg, '[data-in="e-id"]', "estudio-de-prueba");
    await escribir(pg, '[data-in="e-titulo"]', "Estudio de prueba " + VENENO);
    await escribir(pg, '[data-in="e-investigador"]', "Investigadora de prueba");
    await escribir(pg, '[data-in="e-contacto"]', "contacto@ejemplo.org");
    await escribir(pg, '[data-in="e-url"]', S.base + "/");
    await clic(pg, '[data-act="entrega"][data-v="servidor"]');
    const p1 = await proyecto(pg);
    T.ok(p1.proyecto.estudio.id === "estudio-de-prueba" && /^[0-9a-f]{32}$/.test(p1.proyecto.entrega.clave) && /^[0-9a-f]{32}$/.test(p1.proyecto.entrega.claveAdmin), "al elegir entrega por servidor se generan las dos claves");
    T.ok(!(await roto(pg)) && /Estudio de prueba/.test(await texto(pg, "#appright")), "un título con código malicioso se muestra como texto y no se ejecuta");
    await escribir(pg, '[data-in="e-id"]', "ID Inválido");
    T.ok(/Solo letras minúsculas/.test(await texto(pg, "#vista")), "un identificador con mayúsculas y espacios se señala como inválido");
    await escribir(pg, '[data-in="e-id"]', "estudio-de-prueba");
    /* ---------- Cuentas ---------- */
    await ir(pg, "cuentas");
    await clic(pg, '[data-act="cuenta-roles"]', 400);
    let p = await proyecto(pg);
    T.ok(p.proyecto.cuentas.length === 12 && p.proyecto.cuentas.every(q => /^[a-z0-9][a-z0-9._-]*$/.test(q.u) && /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(q.clave)), "«Crear una por cada rol» crea 12 cuentas con usuario y contraseña válidos", JSON.stringify((p.proyecto.cuentas[0] || {})));
    await pg.selectOption('[data-in="alta-rol"]', "eps"); await pg.fill('[data-in="alta-n"]', "1"); await clic(pg, '[data-act="cuenta-crear"]', 300);
    p = await proyecto(pg);
    const eps = p.proyecto.cuentas.filter(q => q.a === "eps");
    T.ok(eps.length === 2 && eps[0].u !== eps[1].u, "se puede añadir una segunda cuenta del mismo rol, con otro usuario", eps.map(q => q.u).join(","));
    const usuarios = p.proyecto.cuentas.map(q => q.u);
    T.ok(new Set(usuarios).size === usuarios.length, "ningún usuario se repite");
    await escribir(pg, '[data-in="q-etiqueta"][data-arg="' + eps[0].u + '"]', "Para Ana" + VENENO);
    T.ok(!(await roto(pg)), "una etiqueta con código malicioso no se ejecuta");
    const claveAntes = eps[1].clave;
    await clic(pg, '[data-act="cuenta-clave"][data-arg="' + eps[1].u + '"]', 300);
    p = await proyecto(pg);
    T.ok(p.proyecto.cuentas.filter(q => q.u === eps[1].u)[0].clave !== claveAntes, "regenerar la contraseña de una cuenta la cambia");
    const csv = await L.descargar(pg, '[data-act="cuentas-csv"]');
    T.ok(csv.texto.includes(eps[0].u) && csv.texto.includes("Para Ana") && csv.texto.split("\r\n").length === 14, "la hoja de cuentas trae las 12 filas con su etiqueta privada", String(csv.texto.split("\r\n").length));
    /* ---------- Publicar ---------- */
    await ir(pg, "publicar");
    const cfgDesc = await L.descargar(pg, '[data-act="bajar-config"]');
    const cfg = JSON.parse(cfgDesc.texto.slice(cfgDesc.texto.indexOf("{"), cfgDesc.texto.lastIndexOf(";")));
    const errsCfg = motor.validarConfig(cfg);
    T.ok(cfgDesc.nombre === "configuracion.js" && !errsCfg.length && cfg.cuentas.length === 13 && cfg.envio && cfg.envio.modo === "progresivo", "configuracion.js es válida y trae las 13 cuentas", errsCfg.join("; "));
    const texto1 = JSON.stringify(cfg);
    const sinClaves = p.proyecto.cuentas.every(q => !texto1.includes(q.clave)) && !texto1.includes(CLAVE_PANEL) && !texto1.includes("Para Ana") && !texto1.includes(p.proyecto.entrega.claveAdmin);
    T.ok(sinClaves, "la configuración no lleva contraseñas en claro, ni etiquetas privadas, ni la clave de administración");
    const q0 = p.proyecto.cuentas[0], pub0 = cfg.cuentas.filter(x => x.u === q0.u)[0];
    T.ok(pub0 && motor.huellaClave(q0.u, q0.clave, pub0.s, cfg.kdf.iter) === pub0.h, "la huella publicada corresponde a la contraseña que muestra el panel");
    const php = await L.descargar(pg, '[data-act="bajar-receptor"]');
    T.ok(/clave_envio' => '[0-9a-f]{32}'/.test(php.texto) && /clave_admin_sha256' => '[0-9a-f]{64}'/.test(php.texto) && !php.texto.includes(p.proyecto.entrega.claveAdmin), "recibir-config.php lleva la clave de envío y solo la huella de la de administración");
    // Simulador de archivo único con estas cuentas
    const base = path.join(L.SALIDA, "base-simulador.html");
    fs.copyFileSync(path.join(L.RAIZ, "simulador.html"), base);
    const [unico] = await Promise.all([pg.waitForEvent("download", { timeout:20000 }), pg.setInputFiles("#unico-archivo", base)]);
    const fUnico = path.join(L.SALIDA, "unico.html"); await unico.saveAs(fUnico);
    const htmlUnico = fs.readFileSync(fUnico, "utf8");
    T.ok(htmlUnico.includes('"estudio-de-prueba"') && !htmlUnico.includes("demo-eps") && htmlUnico.length > 200000, "el simulador de archivo único queda con las cuentas del estudio y sin las de demostración");
    // El archivo único con entrega por servidor pregunta al receptor si hay avance guardado: esa petición es la suya.
    const ctxU = await br.newContext({ viewport:{ width:1100, height:800 } }), pgU = await L.pagina(ctxU, [], u => u.startsWith("file:") || u.startsWith(S.base));
    await pgU.goto("file://" + fUnico);
    await L.entrarDemo(pgU, q0.u, q0.clave);
    T.ok((await pgU.evaluate(() => document.body.getAttribute("data-etapa"))) === "orientacion", "y se puede entrar en él con una cuenta real del proyecto");
    await ctxU.close();
    /* ---------- Respuestas ---------- */
    const eps1 = p.proyecto.cuentas.filter(q => q.a === "eps")[0].u, eps2 = p.proyecto.cuentas.filter(q => q.a === "eps")[1].u, jr1 = p.proyecto.cuentas.filter(q => q.a === "jr")[0].u;
    const docs = [documento(eps1, "eps", "estudio-de-prueba", 0), documento(eps2, "eps", "estudio-de-prueba", 1), documento(jr1, "jr", "estudio-de-prueba", 2, { ronda:"R1", paso:"E3" })];
    const rutas = docs.map((d, i) => { const f = path.join(L.SALIDA, "resp-" + i + ".json"); fs.writeFileSync(f, JSON.stringify(d, null, 1)); return f; });
    const alterado = JSON.parse(JSON.stringify(docs[0])); alterado.participante.id = "p" + "f".repeat(16); alterado.registros.push({ id:"x", tipo:"observacion", payload:{ texto:"añadido a mano" } });
    const fAlt = path.join(L.SALIDA, "resp-alterada.json"); fs.writeFileSync(fAlt, JSON.stringify(alterado));
    await ir(pg, "respuestas");
    await pg.setInputFiles("#resp-archivo", rutas.concat([fAlt])); await w(pg, 900);
    const tablaImp = await texto(pg, ".importe");
    T.ok(/3 importada/.test(tablaImp) && /1 rechazada/.test(tablaImp) && /huella de integridad no coincide/.test(tablaImp), "importa las tres respuestas reales y rechaza la alterada diciendo por qué", tablaImp.slice(0, 260));
    await pg.setInputFiles("#resp-archivo", [rutas[0]]); await w(pg, 600);
    T.ok(/1 ya estaba/.test(await texto(pg, ".importe")), "importar dos veces el mismo archivo no duplica la respuesta");
    const dMas = documento(eps1, "eps", "estudio-de-prueba", 3);
    dMas.participante.id = docs[0].participante.id; dMas.generado = new Date(Date.parse(docs[0].generado) + 60000).toISOString(); dMas.huella = motor.huellaDoc(dMas);
    const fMas = path.join(L.SALIDA, "resp-mas-nueva.json"); fs.writeFileSync(fMas, JSON.stringify(dMas));
    await pg.setInputFiles("#resp-archivo", [fMas]); await w(pg, 600);
    T.ok(/1 reemplazó/.test(await texto(pg, ".importe")), "una versión más reciente de la misma participación reemplaza a la anterior");
    const filas = await pg.locator("table.t tbody tr").count();
    T.ok(filas >= 3 && !(await roto(pg)), "la tabla de respuestas se pinta y el texto malicioso de los datos personales no se ejecuta");
    /* ---------- Seguimiento ---------- */
    await ir(pg, "seguimiento");
    const seg = await texto(pg, "#vista");
    T.ok(/sin respuesta/.test(seg) && /Terminó el recorrido/.test(seg) && /paso E3/.test(seg), "el seguimiento muestra quién no ha respondido, quién terminó y en qué paso va el resto", seg.slice(0, 200));
    await clic(pg, '[data-act="seg-ficha"]', 400);
    const ficha = await texto(pg, "#vista");
    T.ok(/Qué respondió, paso a paso/.test(ficha) && /Declaración/.test(ficha) && !(await roto(pg)), "la ficha de un participante muestra sus respuestas en las dos rondas");
    await clic(pg, '[data-act="ficha-cerrar"]', 300);
    /* ---------- Resultados ---------- */
    await ir(pg, "resultados");
    await w(pg, 600);
    const inf = await texto(pg, "#informe");
    T.ok(/Informe consolidado/.test(inf) && /Respuestas analizadas/.test(inf), "el informe se arma con las respuestas incluidas");
    const h1h4 = await pg.evaluate(() => { const t = document.querySelector("#informe").textContent; return ["H1", "H2", "H3", "H4"].filter(k => t.includes(k)).length + "|" + (t.includes("completitud") ? "mal" : "ok") + "|" + (t.includes("pendiente de confirmar") ? "textual" : "cambiada"); });
    T.ok(h1h4 === "4|ok|textual", "las hipótesis H1 a H4 aparecen textuales y sin renombrar", h1h4);
    T.ok(/desacuerdo/i.test(inf), "el informe recoge los desacuerdos entre las dos personas del mismo rol");
    const tablas = await pg.locator("#informe table.t").count(), caps = await pg.locator("#informe h2").count();
    T.ok(tablas >= 12 && caps >= 10, "el informe trae todos sus capítulos y tablas", tablas + " tablas, " + caps + " capítulos");
    const csvT = await L.descargar(pg, '[data-act="csv-todo"]');
    T.ok(csvT.texto.includes("Tabla 1.1") && csvT.texto.split("\r\n").length > 40 && !/(^|\r\n)"?=/.test(csvT.texto), "las tablas se exportan a CSV sin celdas que una hoja de cálculo tome por fórmula");
    const infHtml = await L.descargar(pg, '[data-act="informe-html"]');
    const sinDatos = !infHtml.texto.includes("dos@ejemplo.org") && !infHtml.texto.includes("Persona Dos") && !/<script/i.test(infHtml.texto) && infHtml.texto.startsWith("<!doctype html>");
    T.ok(sinDatos && infHtml.texto.length > 40000, "el informe descargable es un documento completo, sin datos personales ni scripts");
    const json = await L.descargar(pg, '[data-act="datos-json"]');
    const dj = JSON.parse(json.texto);
    const limpio = !json.texto.includes(CLAVE_PANEL) && !json.texto.includes("dos@ejemplo.org") && p.proyecto.cuentas.every(q => !json.texto.includes(q.clave));
    T.ok(dj.tipo === "consolidado" && dj.participantes.length === 3 && limpio, "los datos consolidados salen sin contraseñas ni datos personales");
    /* ---------- Copia de seguridad ---------- */
    await ir(pg, "estudio");
    const copia = await L.descargar(pg, '[data-act="copia-exportar"]');
    const cp = JSON.parse(copia.texto);
    T.ok(cp.tipo === "copia_seguridad_panel" && cp.proyecto.cuentas.length === 13 && cp.respuestas.length === 3 && !copia.texto.includes(CLAVE_PANEL) && !JSON.stringify(cp.proyecto).includes(p.proyecto.entrega.claveAdmin) && !/"huella"/.test(JSON.stringify(cp.proyecto)),
      "la copia de seguridad lleva cuentas y respuestas, sin la clave del panel ni la del servidor");
    const fCopia = path.join(L.SALIDA, "copia-panel.json"); fs.writeFileSync(fCopia, copia.texto);
    /* ---------- Varias sesiones de simulación ---------- */
    await ir(pg, "estudios");
    T.ok(/Sesiones de simulación guardadas/.test(await texto(pg, "#vista")) && (await pg.locator("table.t tbody tr").count()) === 1, "la pantalla «Estudios» muestra la sesión abierta");
    await pg.fill('[data-in="est-titulo"]', "Segunda ronda");
    await clic(pg, '[data-act="est-duplicar"]', 600);
    let pd = await proyecto(pg);
    T.ok(pd.indice.estudios.length === 2 && pd.proyecto.estudio.titulo === "Segunda ronda" && pd.proyecto.cuentas.length === 13 && pd.proyecto.estudio.id !== "estudio-de-prueba",
      "duplicar crea una sesión aparte con las mismas cuentas y otro identificador", pd.proyecto.estudio.id);
    const clavesNuevas = pd.proyecto.cuentas.map(q => q.clave), clavesViejas = p.proyecto.cuentas.map(q => q.clave);
    T.ok(clavesNuevas.every(c => clavesViejas.indexOf(c) < 0), "las contraseñas de la sesión duplicada son nuevas");
    await ir(pg, "respuestas");
    await pg.setInputFiles("#resp-archivo", [rutas[1]]); await w(pg, 700);
    const avisoOtro = await texto(pg, ".importe");
    T.ok(/pertenece al estudio/.test(avisoOtro), "una respuesta de otra sesión se señala y no se suma a esta", avisoOtro.slice(0, 200));
    await ir(pg, "resultados"); await w(pg, 500);
    T.ok(/Todavía no hay respuestas para analizar/.test(await texto(pg, "#informe")), "la sesión nueva empieza sin respuestas: no hereda las de la otra");
    await ir(pg, "estudios");
    await clic(pg, '[data-act="est-abrir"]', 700);
    const pv = await proyecto(pg);
    T.ok(pv.proyecto.estudio.id === "estudio-de-prueba" && pv.proyecto.cuentas.length === 13, "se puede volver a la primera sesión");
    await ir(pg, "resultados"); await w(pg, 700);
    T.ok(/Respuestas analizadas/.test(await texto(pg, "#informe")), "y sus respuestas siguen allí, con su informe");
    await ir(pg, "estudios");
    await clic(pg, '[data-act="est-eliminar"][data-arg="' + pd.indice.actual + '"]', 300);
    await pg.fill('[data-in="dlg-texto"]', "ELIMINAR"); await clic(pg, '[data-act="dlg-si"]', 600);
    pd = await proyecto(pg);
    T.ok(pd.indice.estudios.length === 1 && pd.proyecto.estudio.id === "estudio-de-prueba", "eliminar una sesión deja la otra intacta");

    /* ---------- Bloquear y volver ---------- */
    await clic(pg, '[data-act="bloquear"]', 300);
    T.ok((await pg.evaluate(() => document.body.getAttribute("data-vista"))) === "acceso" && !(await hay(pg, '[data-in="ac-c2"]')), "«Bloquear» cierra el panel y después pide la clave");
    await entrarPanel(pg, "otra-clave-cualquiera");
    T.ok((await pg.evaluate(() => document.body.getAttribute("data-vista"))) === "acceso" && /no coincide/.test(await texto(pg, "#top")), "una clave equivocada no abre el panel");
    await entrarPanel(pg, CLAVE_PANEL);
    T.ok((await pg.evaluate(() => document.body.getAttribute("data-vista"))) !== "acceso" && (await proyecto(pg)).proyecto.cuentas.length === 13, "con la clave correcta vuelve el proyecto completo");
    await ir(pg, "resultados"); await w(pg, 700);
    T.ok(/Respuestas analizadas/.test(await texto(pg, "#informe")), "y el informe de la sesión abierta se vuelve a armar");
    /* ---------- Restaurar en un navegador limpio ---------- */
    const ctxB = await br.newContext({ viewport:{ width:1280, height:900 } }), pgB = await L.pagina(ctxB, errores, u => u.startsWith(S.base));
    await pgB.goto(S.base + "/administrador.html");
    await pgB.setInputFiles("#copia-archivo", fCopia); await w(pgB, 500);
    T.ok(/Restaurar una copia/.test(await texto(pgB, "#vista h1")) && /13 cuentas/.test(await texto(pgB, "#vista")) && /3 respuestas/.test(await texto(pgB, "#vista")), "en otro navegador la copia se lee y dice qué trae", await texto(pgB, "#vista"));
    await pgB.fill('[data-in="ac-c1"]', "otra-clave-de-prueba"); await pgB.fill('[data-in="ac-c2"]', "otra-clave-de-prueba");
    await clic(pgB, '[data-act="copia-restaurar"]', 800);
    const pb = await proyecto(pgB);
    T.ok((await pgB.evaluate(() => document.body.getAttribute("data-vista"))) !== "acceso" && pb && pb.proyecto.cuentas.length === 13 && pb.proyecto.estudio.id === "estudio-de-prueba", "al restaurarla con una clave nueva el proyecto queda completo");
    await ir(pgB, "resultados"); await w(pgB, 800);
    T.ok(/Informe consolidado/.test(await texto(pgB, "#informe")), "y el informe se vuelve a armar con las respuestas restauradas");
    await ctxB.close();
    T.ok(!errores.length, "sin errores de consola ni peticiones a terceros", errores.slice(0, 5).join(" | "));
  } catch (e) { T.ok(false, "la prueba se interrumpió", e.stack || e); }
  await br.close(); await S.cerrar();
  process.exit(T.fin() ? 1 : 0);
})();
