// Prueba del receptor PHP real (src/servidor/recibir.php) con el servidor integrado de PHP:
// protocolo, validaciones, intentos de abuso y recorrido de punta a punta con el simulador en el navegador.
const L = require("./lib"), M = require("./motor");
const { fs, path } = L, { spawn } = require("child_process"), net = require("net"), crypto = require("crypto");
const T = L.contador("Receptor PHP de respuestas");
const ENVIO = "clave-de-envio-123456", ADMIN = "clave-de-administracion-del-servidor-0001", CLAVE = "K7QF-M2XD";
const cfgDemo = M.configDemo(), motor = M.crearMotor(cfgDemo);

const puertoLibre = () => new Promise(r => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => r(p)); }); });
function configPhp(o) {
  const q = s => "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  return "<?php\nreturn [\n    'clave_envio' => " + q(o.envio) + ",\n    'clave_admin_sha256' => " + q(o.admin ? crypto.createHash("sha256").update(o.admin).digest("hex") : "") + ",\n    'carpeta' => __DIR__ . '/respuestas',\n    'max_bytes' => " + (o.max || 1048576) + ",\n    'max_documentos' => " + (o.docs || 2000) + ",\n];\n";
}
// Sitio de prueba: copia del simulador del paquete, el receptor y la configuración indicada, servido con php -S.
async function sitio(opc) {
  const dir = L.temporal("receptor-"), puerto = await puertoLibre();
  fs.copyFileSync(path.join(L.RAIZ, "src/servidor/recibir.php"), path.join(dir, "recibir.php"));
  fs.writeFileSync(path.join(dir, "recibir-config.php"), opc.plantilla ? fs.readFileSync(path.join(L.RAIZ, "src/servidor/recibir-config.php")) : configPhp(opc));
  fs.copyFileSync(path.join(L.RAIZ, "paquete-web/index.html"), path.join(dir, "index.html"));
  fs.copyFileSync(path.join(L.RAIZ, "paquete-web/sw.js"), path.join(dir, "sw.js"));
  if (opc.simulador) fs.writeFileSync(path.join(dir, "configuracion.js"), "window.SIM_CONFIG = " + JSON.stringify(opc.simulador) + ";");
  const php = spawn("php", ["-S", "127.0.0.1:" + puerto, "-t", dir], { stdio:["ignore", "ignore", "pipe"] }); let registro = "";
  php.stderr.on("data", d => { registro += d; });
  const base = "http://127.0.0.1:" + puerto;
  for (let i = 0; i < 80; i++) { try { await fetch(base + "/recibir.php"); break; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }
  const post = async (cuerpo, o) => {
    o = o || {};
    const r = await fetch(base + "/recibir.php", { method:o.metodo || "POST", headers:{ "Content-Type":o.tipo || "text/plain;charset=UTF-8" }, body:o.metodo === "GET" || o.metodo === "OPTIONS" ? undefined : (typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo)) });
    const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {}
    return { codigo:r.status, j, txt, cab:r.headers };
  };
  return { dir, base, post, registro:() => registro, cerrar:() => new Promise(r => { php.on("exit", r); php.kill(); }), archivos:() => (fs.existsSync(path.join(dir, "respuestas")) ? fs.readdirSync(path.join(dir, "respuestas")).filter(f => f.endsWith(".json.php")) : []) };
}
// Documento real de un rol, producido por el motor del simulador.
function documento(usuario, variante, hasta) {
  const m = M.crearMotor(cfgDemo), d = M.recorrer(m, usuario, cfgDemo.demo.clave, { variante:variante || 0, hasta });
  return { doc:d, llave:m.S.cuenta.r, motor:m };
}
const sellar = d => { d.huella = motor.huellaDoc(d); return d; };

(async () => {
  let S = null, br = null;
  try {
    /* ---------- Sin configurar ---------- */
    S = await sitio({ plantilla:true });
    let r = await S.post({ accion:"probar", clave:"" });
    T.ok(r.codigo === 403 && r.j && r.j.ok === false && /no está configurado/.test(r.j.error), "con la configuración de ejemplo (sin claves) no atiende nada", r.txt);
    r = await S.post({ accion:"listar", claveAdmin:"" });
    T.ok(r.codigo === 403, "ni siquiera el listado");
    await S.cerrar();

    /* ---------- Protocolo ---------- */
    S = await sitio({ envio:ENVIO, admin:ADMIN, max:300000, docs:3 });
    r = await S.post({ accion:"probar", clave:ENVIO });
    T.ok(r.codigo === 200 && r.j.ok === true && r.j.guarda === true && r.j.version && r.j.documentos === undefined && /application\/json/.test(r.cab.get("content-type")) && r.cab.get("cache-control") === "no-store" && r.cab.get("x-content-type-options") === "nosniff", "probar con la clave de envío responde que puede guardar", r.txt);
    r = await S.post({ accion:"probar", clave:"otra-clave-cualquiera" });
    T.ok(r.codigo === 403 && /clave de envío/.test(r.j.error), "con una clave de envío equivocada responde 403");
    r = await S.post(null, { metodo:"GET" });
    T.ok(r.codigo === 405 && r.j.ok === false, "no atiende GET");
    r = await S.post(null, { metodo:"OPTIONS" });
    T.ok(r.codigo === 204 && r.cab.get("access-control-allow-origin") === "*", "responde a la verificación previa de otro origen");
    const eps = documento("demo-eps", 0, { ronda:"R1", paso:"E3" });
    r = await S.post({ accion:"guardar", clave:ENVIO, documento:eps.doc, reanudar:eps.llave });
    const nombre = "demostracion~demo-eps~" + eps.doc.participante.id + ".json.php";
    T.ok(r.codigo === 200 && r.j.ok && /^\d{4}-\d\d-\d\dT/.test(r.j.recibido) && S.archivos().length === 1 && S.archivos()[0] === nombre, "guardar deja un archivo por participación", r.txt + " " + S.archivos());
    const crudo = fs.readFileSync(path.join(S.dir, "respuestas", nombre), "utf8");
    T.ok(crudo.startsWith("<?php http_response_code(404); exit; __halt_compiler();\n") && !crudo.slice(crudo.indexOf("\n")).includes("<") && !crudo.includes(eps.llave), "el archivo empieza con la guarda, no contiene etiquetas y no guarda la llave de reanudación en claro");
    let g = await fetch(S.base + "/respuestas/" + encodeURIComponent(nombre)); let gt = await g.text();
    T.ok(g.status === 404 && gt === "", "el archivo guardado no se puede leer desde la web", g.status + " " + gt.slice(0, 80));
    const eps2 = documento("demo-eps", 0); eps2.doc.participante.id = eps.doc.participante.id; sellar(eps2.doc);
    r = await S.post({ accion:"guardar", clave:ENVIO, documento:eps2.doc, reanudar:eps.llave });
    T.ok(r.j.ok && S.archivos().length === 1, "un envío posterior de la misma participación reemplaza al anterior");
    /* ---------- Recuperación ---------- */
    r = await S.post({ accion:"recuperar", clave:ENVIO, estudio:"demostracion", usuario:"demo-eps", reanudar:eps.llave });
    T.ok(r.j.ok && r.j.documento && r.j.documento.estado === "completa" && r.j.documento.participante.id === eps.doc.participante.id && !motor.validarRespuesta(r.j.documento).length, "recuperar con la llave correcta devuelve el documento íntegro (la huella sigue coincidiendo)", JSON.stringify(motor.validarRespuesta(r.j.documento || {})));
    r = await S.post({ accion:"recuperar", clave:ENVIO, estudio:"demostracion", usuario:"demo-eps", reanudar:"0".repeat(64) });
    const r2 = await S.post({ accion:"recuperar", clave:ENVIO, estudio:"demostracion", usuario:"usuario-que-no-existe", reanudar:eps.llave });
    T.ok(r.j.ok && r.j.documento === null && r2.j.ok && r2.j.documento === null && r.txt === r2.txt, "con otra llave o con un usuario inexistente la respuesta es la misma: nada");
    r = await S.post({ accion:"recuperar", clave:ENVIO, estudio:"demostracion", usuario:"demo-eps", reanudar:"" });
    T.ok(r.codigo === 400, "recuperar sin llave se rechaza");
    r = await S.post({ accion:"recuperar", clave:ENVIO, estudio:"demostracion", usuario:"demo-*", reanudar:eps.llave });
    T.ok(r.codigo === 400, "recuperar no acepta comodines en el usuario");
    /* ---------- Validaciones e intentos de abuso ---------- */
    const base = () => JSON.parse(JSON.stringify(eps.doc));
    const malos = [
      ["instrumento ajeno", d => { d.instrumento = "otro"; }], ["formato desconocido", d => { d.formato = 2; }],
      ["estudio con ruta", d => { d.estudio.id = "../../etc"; }], ["usuario con barra", d => { d.cuenta.usuario = "a/b"; }], ["usuario con barra invertida", d => { d.cuenta.usuario = "a\\b"; }],
      ["usuario con byte nulo", d => { d.cuenta.usuario = "a\u0000b"; }], ["usuario en mayúsculas", d => { d.cuenta.usuario = "EPS"; }], ["participación con ruta", d => { d.participante.id = "p/../../../x"; }],
      ["participación corta", d => { d.participante.id = "p123"; }], ["sin declaración", d => { d.consentimiento.aceptado = false; }], ["registros que no son lista", d => { d.registros = { a:1 }; }], ["estudio que no es texto", d => { d.estudio.id = ["x"]; }]
    ];
    const antes = S.archivos().length; let rechazos = [];
    for (const [n, f] of malos) { const d = base(); f(d); const x = await S.post({ accion:"guardar", clave:ENVIO, documento:d }); if (x.codigo !== 400 || x.j.ok !== false) rechazos.push(n + "→" + x.codigo); }
    T.ok(!rechazos.length && S.archivos().length === antes && fs.readdirSync(S.dir).sort().join(",") === "index.html,recibir-config.php,recibir.php,respuestas,sw.js", "rechaza " + malos.length + " documentos mal formados o con rutas y no escribe nada fuera de su carpeta", rechazos.join(" ") + " · " + fs.readdirSync(S.dir));
    r = await S.post("esto no es json");
    T.ok(r.codigo === 400, "rechaza un cuerpo que no es JSON");
    r = await S.post({ accion:"guardar", clave:ENVIO, documento:"texto" });
    T.ok(r.codigo === 400, "rechaza un documento que no es un objeto");
    const grande = base(); grande.registros.push({ relleno:"x".repeat(400000) });
    r = await S.post({ accion:"guardar", clave:ENVIO, documento:grande });
    T.ok(r.codigo === 413, "rechaza un documento más grande que el límite configurado", r.codigo + " " + r.txt.slice(0, 100));
    r = await S.post({ accion:"guardar", clave:ENVIO, documento:base(), reanudar:"no-es-una-llave" });
    T.ok(r.codigo === 400, "rechaza una llave de reanudación con otra forma");
    r = await S.post({ accion:"inventada", clave:ENVIO });
    T.ok(r.codigo === 400, "rechaza una acción desconocida");
    const veneno = base(); veneno.participante.id = "p" + "a".repeat(16); veneno.registros.push({ id:"x", tipo:"observacion", payload:{ texto:"<?php file_put_contents('pwn.txt','x'); ?> <script>alert(1)</script>" } });
    r = await S.post({ accion:"guardar", clave:ENVIO, documento:veneno });
    const nv = "demostracion~demo-eps~p" + "a".repeat(16) + ".json.php"; g = await fetch(S.base + "/respuestas/" + encodeURIComponent(nv)); gt = await g.text();
    T.ok(r.j.ok && g.status === 404 && gt === "" && !fs.existsSync(path.join(S.dir, "respuestas", "pwn.txt")) && !fs.existsSync(path.join(S.dir, "pwn.txt")) && !fs.readFileSync(path.join(S.dir, "respuestas", nv), "utf8").slice(60).includes("<?"), "un texto con código PHP dentro de una respuesta se guarda como dato y nunca se ejecuta");
    /* ---------- Límite de documentos ---------- */
    const arl = documento("demo-arl", 1), afp = documento("demo-afp", 2);
    r = await S.post({ accion:"guardar", clave:ENVIO, documento:arl.doc, reanudar:arl.llave });
    const lleno = await S.post({ accion:"guardar", clave:ENVIO, documento:afp.doc, reanudar:afp.llave });
    const reemplazo = await S.post({ accion:"guardar", clave:ENVIO, documento:eps2.doc, reanudar:eps.llave });
    T.ok(r.j.ok && lleno.codigo === 507 && lleno.j.ok === false && reemplazo.j.ok && S.archivos().length === 3, "al llegar al máximo de documentos rechaza los nuevos y sigue aceptando actualizaciones de los existentes", lleno.codigo + " " + S.archivos().length);
    /* ---------- Investigador ---------- */
    r = await S.post({ accion:"listar", clave:ENVIO });
    const sinClave = await S.post({ accion:"listar", claveAdmin:ENVIO });
    T.ok(r.codigo === 403 && sinClave.codigo === 403, "la clave de envío no sirve para listar las respuestas");
    r = await S.post({ accion:"listar", claveAdmin:ADMIN });
    T.ok(r.codigo === 200 && r.j.ok && r.j.documentos.length === 3 && r.j.documentos.every(x => x.recibido && x.documento && x.documento.instrumento) && !/reanudar_sha256/.test(r.txt) && !r.txt.includes(eps.llave), "con la clave de administración lista los documentos, sin las llaves de reanudación");
    const listados = r.j.documentos.filter(x => x.documento.cuenta.usuario === "demo-arl")[0];
    T.ok(listados && !motor.validarRespuesta(listados.documento).length, "los documentos listados conservan su huella de integridad");
    r = await S.post({ accion:"listar", claveAdmin:ADMIN, estudio:"otro-estudio" });
    T.ok(r.j.ok && r.j.documentos.length === 0, "listar se puede limitar a un estudio");
    r = await S.post("accion=listar&claveAdmin=" + encodeURIComponent(ADMIN), { tipo:"application/x-www-form-urlencoded" });
    T.ok(r.codigo === 200 && /attachment; filename="respuestas-\d{8}-\d{4}\.json"/.test(r.cab.get("content-disposition") || "") && r.j.documentos.length === 3, "como formulario, el listado llega como archivo adjunto", r.cab.get("content-disposition"));
    r = await S.post({ accion:"probar", clave:ENVIO, claveAdmin:ADMIN });
    T.ok(r.j.ok && r.j.documentos === 3, "probar con la clave de administración dice cuántos documentos hay");
    r = await S.post({ accion:"borrar", clave:ENVIO, estudio:"demostracion", usuario:"demo-arl", participante:arl.doc.participante.id });
    T.ok(r.codigo === 403 && S.archivos().length === 3, "borrar exige la clave de administración");
    r = await S.post({ accion:"borrar", claveAdmin:ADMIN, estudio:"demostracion", usuario:"demo-arl", participante:arl.doc.participante.id });
    T.ok(r.j.ok && r.j.eliminado === true && S.archivos().length === 2, "el investigador puede borrar un documento");
    r = await S.post({ accion:"retirar", clave:ENVIO, estudio:"demostracion", usuario:"demo-eps", participante:"../../recibir" });
    T.ok(r.codigo === 400 && fs.existsSync(path.join(S.dir, "recibir.php")), "retirar no acepta rutas");
    r = await S.post({ accion:"retirar", clave:ENVIO, estudio:"demostracion", usuario:"demo-eps", participante:eps.doc.participante.id });
    const otraVez = await S.post({ accion:"retirar", clave:ENVIO, estudio:"demostracion", usuario:"demo-eps", participante:eps.doc.participante.id });
    T.ok(r.j.ok && r.j.eliminado === true && otraVez.j.ok && otraVez.j.eliminado === false && S.archivos().length === 1, "retirar elimina el documento de esa participación");
    /* ---------- Envíos simultáneos ---------- */
    const varios = await Promise.all(Array.from({ length:12 }, (x, i) => { const d = base(); d.avance.hechas = i; return S.post({ accion:"guardar", clave:ENVIO, documento:sellar(d), reanudar:eps.llave }); }));
    r = await S.post({ accion:"recuperar", clave:ENVIO, estudio:"demostracion", usuario:"demo-eps", reanudar:eps.llave });
    T.ok(varios.every(x => x.j && x.j.ok) && r.j.documento && !motor.validarRespuesta(r.j.documento).length && !fs.readdirSync(path.join(S.dir, "respuestas")).some(f => f.startsWith(".tmp-")), "doce envíos simultáneos de la misma participación dejan un documento íntegro y ningún temporal");
    T.ok(!/respuestas de prueba|Persona|ejemplo\.org/.test(S.registro()) && !/Warning|Notice|Deprecated|Fatal/.test(S.registro()), "PHP no emitió avisos ni escribió contenido de respuestas en su registro", S.registro().split("\n").filter(l => /Warning|Notice|Deprecated|Fatal/.test(l)).slice(0, 3).join(" | "));
    await S.cerrar();

    /* ---------- De punta a punta con el simulador ---------- */
    const cuentas = [["eps-01", "eps"], ["jn-01", "jn"]].map(([u, a], i) => { const s = "0011223344556600".slice(0, 15) + i; return { u, a, s, h:motor.huellaClave(u, CLAVE, s, 5000) }; });
    S = await sitio({ envio:ENVIO, admin:ADMIN, simulador:{ formato:1, estudio:{ id:"estudio-real", titulo:"Estudio con receptor" }, kdf:{ alg:"PBKDF2-HMAC-SHA256", iter:5000 }, envio:{ url:"recibir.php", clave:ENVIO, modo:"progresivo" }, cuentas, generado:"2026-01-01T00:00:00.000Z" } });
    br = await L.lanzar(); const errores = [], propio = u => u.startsWith(S.base);
    const ctx = await br.newContext({ viewport:{ width:1280, height:900 } }), pg = await L.pagina(ctx, errores, propio);
    await pg.goto(S.base + "/index.html"); await L.entrarDemo(pg, "eps-01", CLAVE); await L.pasarOrientacion(pg); await L.aceptarDeclaracion(pg, { nombre:"Persona Real", correo:"persona@ejemplo.org" });
    await L.recorrerInterfaz(pg, 0, h => h.filter(x => x === "actividad").length === 2); await L.w(pg, 600);
    const leer = () => { const f = S.archivos().filter(x => x.startsWith("estudio-real~eps-01~"))[0]; if (!f) return null; const l = fs.readFileSync(path.join(S.dir, "respuestas", f), "utf8").split("\n"); return Object.assign(JSON.parse(l[1]), { documento:JSON.parse(l.slice(2).join("\n")) }); };
    let w1 = leer();
    T.ok(w1 && w1.documento.registros.filter(x => x.tipo === "actividad").length === 2 && w1.documento.participante.datos.nombre === "Persona Real" && /^[0-9a-f]{64}$/.test(w1.reanudar_sha256), "el simulador real envía cada respuesta al receptor PHP", w1 ? String(w1.documento.registros.length) : "sin archivo");
    const ctxB = await br.newContext({ viewport:{ width:1280, height:900 } }), pgB = await L.pagina(ctxB, errores, propio);
    await pgB.goto(S.base + "/index.html"); await L.entrarDemo(pgB, "eps-01", CLAVE);
    let visto = ""; for (let i = 0; i < 50; i++) { visto = await L.texto(pgB, "#vista"); if (/Bienvenido de nuevo/.test(visto)) break; await L.w(pgB, 100); }
    T.ok(/Bienvenido de nuevo/.test(visto) && /servidor del estudio/.test(visto) && /2 de 16/.test(visto), "en otro navegador, con el mismo usuario y contraseña, el receptor devuelve el avance", visto.slice(0, 200));
    await L.clic(pgB, '[data-act="retomar-continuar"]'); await L.recorrerInterfaz(pgB, 0); await L.w(pgB, 800);
    w1 = leer();
    T.ok(w1 && w1.documento.estado === "completa" && !motor.validarRespuesta(w1.documento).length && /Sus respuestas fueron enviadas/.test(await L.texto(pgB, "#vista")), "y al terminar allí queda en el servidor el documento completo y válido");
    const ctxC = await br.newContext(), pgC = await L.pagina(ctxC, errores, propio);
    await pgC.goto(S.base + "/index.html"); await L.entrarDemo(pgC, "jn-01", CLAVE); await L.w(pgC, 500);
    T.ok(!/Bienvenido de nuevo/.test(await L.texto(pgC, "#vista")), "otra cuenta con la misma contraseña no recibe ese avance");
    await L.clic(pgB, '[data-act="retirar"]'); await L.clic(pgB, '[data-act="retirar-si"]', 500);
    T.ok(!leer(), "retirarse desde el simulador elimina el documento del servidor");
    T.ok(!errores.length, "sin errores de consola ni peticiones a terceros", errores.slice(0, 4).join(" | "));
  } catch (e) { T.ok(false, "la prueba se interrumpió", e.stack || e); }
  if (br) await br.close();
  if (S) await S.cerrar().catch(() => {});
  process.exit(T.fin() ? 1 : 0);
})();
