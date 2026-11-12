// Prueba de navegador del simulador abierto como archivo local (file://), sin red.
//   node tests/simulador.js            todo
//   node tests/simulador.js roles      solo el recorrido de los 12 roles
//   node tests/simulador.js sesion     solo acceso, pausa, reanudación y recuperación
//   node tests/simulador.js accesible  solo teléfono, nombres accesibles, foco y teclado
const L = require("./lib"), M = require("./motor");
const { clic, hay, texto, w, fs, path } = L;
const ARCHIVO = "file://" + path.join(L.RAIZ, "simulador.html");
const cual = process.argv[2] || "todo";
const T = L.contador("Simulador en archivo local, sin red (" + cual + ")");
const cfg = M.configDemo(), motor = M.crearMotor(cfg);
const esperadas = actor => motor.ESC.rondas.reduce((n, r) => n + motor.bloquesDe(actor, r.modo).filter(b => b.tipo === "actividad").length, 0);
const estado = pg => pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
const guardado = async (pg, u) => { const e = await estado(pg), k = Object.keys(e).filter(x => x.endsWith(":" + u))[0]; return k ? JSON.parse(e[k]) : null; };
const etapa = pg => pg.evaluate(() => document.body.getAttribute("data-etapa"));

async function roles(br, errores) {
  for (let i = 0; i < cfg.cuentas.length; i++) {
    const q = cfg.cuentas[i], ctx = await br.newContext({ viewport:{ width:1280, height:900 }, acceptDownloads:true }), pg = await L.pagina(ctx, errores);
    await pg.goto(ARCHIVO);
    await L.entrarDemo(pg, q.u); await L.pasarOrientacion(pg); await L.aceptarDeclaracion(pg, i % 4 === 0 ? { nombre:"Persona " + i, correo:"p" + i + "@ejemplo.org" } : null);
    const hechos = await L.recorrerInterfaz(pg, i);
    const enCierre = await hay(pg, "#titulo-cierre");
    let doc = null, errs = ["no llegó a la entrega"];
    if (enCierre) { const d = await L.descargar(pg, '[data-act="descargar"]'); doc = JSON.parse(d.texto); errs = motor.validarRespuesta(doc); if (!/^respuestas-/.test(d.nombre)) errs.push("nombre de archivo " + d.nombre); }
    const v = doc ? M.crearMotor(cfg).validarRespuesta(doc) && doc.registros : [], act = hechos.filter(h => h === "actividad").length;
    const vig = doc ? (() => { const r = {}; doc.registros.forEach(x => { if (x.reemplaza) r[x.reemplaza] = 1; }); return doc.registros.filter(x => !r[x.id]); })() : [];
    T.ok(enCierre && !errs.length && doc.estado === "completa" && act === esperadas(q.a) && vig.filter(r => r.tipo === "actividad").length === esperadas(q.a) && vig.filter(r => r.tipo === "valoracion").length === 2 && vig.filter(r => r.tipo === "preguntas").length === 2 && doc.cuenta.actor === q.a && doc.cuenta.demo === true,
      q.u + ": completa las dos rondas en la interfaz y entrega un documento válido (" + act + " actividades de " + esperadas(q.a) + ")", errs.join("; ") + " · hechos " + hechos.length);
    if (doc && i % 4 === 0) T.ok(doc.participante.anonimo === false && doc.participante.datos.nombre === "Persona " + i && !doc.registros.some(r => JSON.stringify(r).includes("Persona " + i)), q.u + ": los datos personales van solo en la ficha del participante, no en los registros");
    if (doc && i % 4 === 1) T.ok(doc.participante.anonimo === true && !Object.keys(doc.participante.datos).length, q.u + ": participación sin datos personales");
    await ctx.close();
  }
}

async function sesion(br, errores) {
  const ctx = await br.newContext({ viewport:{ width:1280, height:900 }, acceptDownloads:true }), pg = await L.pagina(ctx, errores);
  // Acceso
  await pg.goto(ARCHIVO + "#u=demo-arl");
  T.ok((await pg.inputValue('[data-in="a-u"]')) === "demo-arl", "el enlace con #u= deja escrito el usuario");
  await L.entrarDemo(pg, "demo-arl", "clave-equivocada");
  T.ok((await etapa(pg)) === "acceso" && /no coinciden/.test(await texto(pg, "#top")), "una contraseña equivocada no entra y explica por qué");
  await L.entrarDemo(pg, "no-existe", "DEMO-2026");
  T.ok((await etapa(pg)) === "acceso", "un usuario inexistente no entra");
  await L.entrarDemo(pg, " Demo-ARL ", "demo 2026");
  T.ok((await etapa(pg)) === "orientacion", "el usuario y la contraseña no distinguen mayúsculas, espacios ni guiones");
  T.ok(/ARL SURA/.test(await texto(pg, "#appright")), "la cuenta asigna el rol (ARL)");
  // Orientación y declaración
  T.ok(/Qué es este estudio y qué se busca/.test(await texto(pg, "#vista h1")), "la orientación abre con qué es el estudio y qué se busca");
  await L.pasarOrientacion(pg);
  T.ok((await etapa(pg)) === "consentimiento" && /Declaración de participación voluntaria/.test(await texto(pg, "#vista h1")), "después de la orientación viene la declaración de participación voluntaria");
  await clic(pg, '[data-act="consent-si"]', 120);
  T.ok((await etapa(pg)) === "consentimiento" && /debe marcar/.test(await texto(pg, "#top")), "sin marcar las declaraciones no se puede comenzar");
  await clic(pg, '[data-act="c-anon"][data-v="no"]'); await pg.fill('[data-in="c-dato"][data-arg="nombre"]', "Nombre Sin Autorización");
  for (let i = 0; i < 4; i++) await pg.locator('[data-in="c-decl"]').nth(i).check();
  await clic(pg, '[data-act="consent-si"]', 120);
  T.ok((await etapa(pg)) === "consentimiento" && /autorización/.test(await texto(pg, "#top")), "si escribe datos personales debe autorizar su tratamiento");
  await clic(pg, '[data-act="consent-no"]', 120);
  T.ok(/No participará/.test(await texto(pg, "#vista h1")) && !(await guardado(pg, "demo-arl")), "quien no desea participar sale sin que quede nada guardado");
  await clic(pg, '[data-act="volver-acceso"]');
  // Avance, borrador y recarga
  await L.entrarDemo(pg, "demo-arl"); await L.pasarOrientacion(pg); await L.aceptarDeclaracion(pg, null);
  await L.recorrerInterfaz(pg, 0, h => h.filter(x => x === "actividad").length === 1);   // responde E2 en la ronda 1
  await clic(pg, '[data-act="continuar"]');                                             // pasa a E3 (contexto) … hasta E4
  while (!(await hay(pg, '[data-act="guardar"]'))) await L.pantalla(pg, 0);
  const pasoAntes = (await guardado(pg, "demo-arl")).ses.pasoActual;
  await clic(pg, '[data-act="f"][data-arg="suficiencia"][data-v="parcial"]'); await pg.selectOption('[data-in="f-finalidad"]', "investigacion"); await pg.fill('[data-in="f-obs"]', "borrador a medias"); await w(pg, 900);
  await pg.reload(); await w(pg, 300);
  const tras = await guardado(pg, "demo-arl");
  T.ok((await etapa(pg)) === "simulacion" && tras.ses.pasoActual === pasoAntes && pasoAntes === "E4" && (await pg.inputValue('[data-in="f-obs"]')) === "borrador a medias" && (await pg.locator('[data-act="f"][data-arg="suficiencia"][data-v="parcial"]').getAttribute("aria-pressed")) === "true" && (await pg.inputValue('[data-in="f-finalidad"]')) === "investigacion",
    "al recargar la página se restablece el mismo paso con el borrador del formulario", JSON.stringify({ e:await etapa(pg), p:tras.ses.pasoActual }));
  // Pausa y regreso
  await clic(pg, '[data-act="salir"]');
  T.ok(/Pausar su participación/.test(await texto(pg, ".modal-caja")) && /continuará donde quedó/.test(await texto(pg, ".modal-caja")), "pausar explica cómo retomar");
  await pg.keyboard.press("Escape"); await w(pg);
  T.ok(!(await hay(pg, ".modal")), "el diálogo se cierra con Escape");
  await clic(pg, '[data-act="salir"]'); await clic(pg, '[data-act="salir-si"]', 150);
  T.ok((await etapa(pg)) === "acceso", "pausar vuelve a la pantalla de acceso");
  await L.entrarDemo(pg, "demo-arl");
  T.ok(/Bienvenido de nuevo/.test(await texto(pg, "#vista h1")) && /paso E4/.test(await texto(pg, "#vista")) && /1 de 10/.test(await texto(pg, "#vista")), "al volver a entrar muestra dónde quedó y cuánto lleva", await texto(pg, "#vista"));
  await clic(pg, '[data-act="retomar-continuar"]');
  T.ok((await pg.inputValue('[data-in="f-obs"]')) === "borrador a medias", "continúa en el mismo formulario con su borrador");
  // Cierre inesperado del navegador: se cierra la página sin avisar y se abre otra
  await pg.fill('[data-in="f-dias"]', "9"); await w(pg, 900);
  await pg.close({ runBeforeUnload:false });
  const pg2 = await L.pagina(ctx, errores); await pg2.goto(ARCHIVO); await L.entrarDemo(pg2, "demo-arl");
  T.ok(/Bienvenido de nuevo/.test(await texto(pg2, "#vista h1")), "tras un cierre inesperado del navegador el avance sigue ahí");
  await clic(pg2, '[data-act="retomar-continuar"]');
  T.ok((await pg2.inputValue('[data-in="f-dias"]')) === "9", "y conserva lo último que había escrito");
  // Corrección de una respuesta
  await clic(pg2, '[data-act="f"][data-arg="decision"][data-v="apelar"]'); await pg2.selectOption('[data-in="f-responde"]', "yo"); await clic(pg2, '[data-act="guardar"]');
  await clic(pg2, '[data-act="rectificar"]');
  T.ok((await pg2.inputValue('[data-in="f-dias"]')) === "9" && (await pg2.locator('[data-act="f"][data-arg="decision"][data-v="apelar"]').getAttribute("aria-pressed")) === "true", "corregir abre el formulario con la respuesta anterior");
  await clic(pg2, '[data-act="f"][data-arg="decision"][data-v="no_apelar"]'); await clic(pg2, '[data-act="guardar"]');
  const g = await guardado(pg2, "demo-arl"), e4 = g.regs.filter(r => r.ronda === "R1" && r.paso === "E4" && r.tipo === "actividad");
  T.ok(e4.length === 2 && e4[1].reemplaza === e4[0].id && e4[1].version === 2 && e4[1].payload.decision === "no_apelar", "la corrección queda como registro nuevo que reemplaza al anterior");
  // Respaldo: se daña la copia principal y se usa la anterior
  await pg2.evaluate(() => { const k = Object.keys(localStorage).filter(x => x.endsWith(":demo-arl"))[0]; localStorage.setItem(k, "{dañado"); });
  await pg2.reload(); await w(pg2, 300);
  T.ok((await etapa(pg2)) === "simulacion" && (await guardado(pg2, "demo-arl")) !== null, "si el guardado principal se daña, se restablece desde el respaldo");
  // Archivo de avance: se descarga y se carga en otro navegador
  await clic(pg2, '[data-act="salir"]');
  const av = await L.descargar(pg2, '[data-act="avance-descargar"]');
  T.ok(/^avance-demo-arl-/.test(av.nombre) && JSON.parse(av.texto).estado === "parcial" && !motor.validarRespuesta(JSON.parse(av.texto)).length, "el archivo de avance es un documento parcial válido");
  const ctx3 = await br.newContext({ viewport:{ width:1280, height:900 } }), pg3 = await L.pagina(ctx3, errores);
  await pg3.goto(ARCHIVO); await L.entrarDemo(pg3, "demo-arl");
  T.ok((await etapa(pg3)) === "orientacion" && (await hay(pg3, '[data-act="avance-elegir"]')), "en otro navegador empieza de cero y ofrece cargar el archivo de avance");
  await pg3.setInputFiles("#avance-archivo", av.archivo); await w(pg3, 400);
  T.ok(/Bienvenido de nuevo/.test(await texto(pg3, "#vista h1")) && /archivo de avance/.test(await texto(pg3, "#vista")), "con el archivo de avance retoma en otro dispositivo", await texto(pg3, "#vista"));
  await clic(pg3, '[data-act="retomar-continuar"]');
  T.ok((await guardado(pg3, "demo-arl")).yo.id === JSON.parse(av.texto).participante.id, "y sigue siendo la misma participación");
  const ajeno = path.join(L.SALIDA, "ajeno.json"); fs.writeFileSync(ajeno, av.texto.replace('"demo-arl"', '"demo-eps"'));
  await clic(pg3, '[data-act="orient-ver"]');
  T.ok(!(await hay(pg3, '[data-act="avance-elegir"]')), "una vez iniciada la participación ya no se ofrece cargar otro avance");
  await ctx3.close();
  // Retiro
  await clic(pg2, '[data-act="confirmar-no"]'); await clic(pg2, '[data-act="retirar"]'); await clic(pg2, '[data-act="retirar-si"]', 200);
  T.ok(/Se retiró del estudio/.test(await texto(pg2, "#vista h1")) && !(await guardado(pg2, "demo-arl")) && !Object.keys(await estado(pg2)).some(k => /demo-arl/.test(k)), "retirarse borra las respuestas de este dispositivo, incluido el respaldo");
  await ctx.close();
  // Navegador que no permite guardar
  const ctx4 = await br.newContext({ viewport:{ width:1280, height:900 } });
  await ctx4.addInitScript(() => { const tirar = () => { throw new Error("bloqueado"); }; Object.defineProperty(window, "localStorage", { get:tirar }); Object.defineProperty(window, "sessionStorage", { get:tirar }); });
  const pg4 = await L.pagina(ctx4, errores); await pg4.goto(ARCHIVO); await L.entrarDemo(pg4, "demo-jueces"); await L.pasarOrientacion(pg4); await L.aceptarDeclaracion(pg4, null);
  T.ok(/no guarda el avance/.test(await texto(pg4, "#top")), "si el navegador no deja guardar, lo advierte de forma visible");
  const h4 = await L.recorrerInterfaz(pg4, 2);
  T.ok((await hay(pg4, "#titulo-cierre")) && h4.filter(x => x === "actividad").length === esperadas("jueces"), "y aun así la simulación se puede completar y entregar");
  await ctx4.close();
}

// Revisión de cada pantalla en un teléfono angosto: título, nombres accesibles, foco y ancho.
const revisar = pg => pg.evaluate(() => {
  const p = [], vista = document.getElementById("vista");
  const titulos = vista.querySelectorAll("h1, #titulo-cierre");
  if (titulos.length !== 1) p.push("títulos principales: " + titulos.length);
  const nombre = el => {
    if (el.getAttribute("aria-label")) return el.getAttribute("aria-label");
    if (el.id) { const l = document.querySelector('label[for="' + el.id + '"]'); if (l) return l.textContent; }
    const env = el.closest("label"); if (env) return env.textContent;
    if (el.tagName === "BUTTON") return el.textContent;
    return el.getAttribute("title") || "";
  };
  document.querySelectorAll("button, input:not([hidden]):not([type=hidden]), select, textarea").forEach(el => { if (!String(nombre(el)).trim()) p.push("sin nombre accesible: " + el.outerHTML.slice(0, 90)); });
  document.querySelectorAll("svg").forEach(el => { if (el.getAttribute("aria-hidden") !== "true" && !el.getAttribute("aria-label")) p.push("icono sin aria-hidden ni etiqueta"); });
  document.querySelectorAll("[aria-pressed]").forEach(el => { if (["true", "false"].indexOf(el.getAttribute("aria-pressed")) < 0) p.push("aria-pressed inválido"); });
  const ids = {}; document.querySelectorAll("[id]").forEach(el => { ids[el.id] = (ids[el.id] || 0) + 1; }); Object.keys(ids).forEach(k => { if (ids[k] > 1) p.push("id repetido: " + k); });
  const cw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth; if (sw > cw + 1) p.push("desborde horizontal " + sw + " > " + cw);
  if (!document.documentElement.lang) p.push("sin idioma");
  return { p, foco:document.activeElement ? document.activeElement.tagName + (document.activeElement.id ? "#" + document.activeElement.id : "") : "", h:titulos[0] ? titulos[0].textContent.trim() : "" };
});
async function accesible(br, errores) {
  const problemas = [], vistas = new Set();
  const anotar = async (pg, donde, pideFoco) => { const r = await revisar(pg); vistas.add(r.h); r.p.forEach(x => problemas.push(donde + ": " + x)); if (pideFoco && !/^(H1|DIV#titulo-cierre)/.test(r.foco)) problemas.push(donde + ": el foco no fue al título (" + r.foco + ")"); };
  for (const [u, ancho] of [["demo-eps", 360], ["demo-trabajador", 320], ["demo-mintrabajo", 390]]) {
    const ctx = await br.newContext({ viewport:{ width:ancho, height:780 }, acceptDownloads:true }), pg = await L.pagina(ctx, errores);
    await pg.goto(ARCHIVO); await anotar(pg, u + " acceso", false);
    await L.entrarDemo(pg, u);
    for (let i = 1; i <= 4; i++) { await anotar(pg, u + " orientación " + i, true); await clic(pg, '[data-act="orient"][data-arg="' + i + '"]'); }
    await anotar(pg, u + " declaración", true); await clic(pg, '[data-act="c-anon"][data-v="no"]'); await anotar(pg, u + " declaración con datos", false); await clic(pg, '[data-act="c-anon"][data-v="si"]');
    await L.aceptarDeclaracion(pg, null);
    for (let i = 0; i < 400; i++) {
      await anotar(pg, u + " pantalla " + i + " «" + (await texto(pg, "#vista h1, #titulo-cierre")).slice(0, 40) + "»", true);
      if (i === 3) { await clic(pg, '[data-act="salir"]'); const r = await revisar(pg); if (!/BUTTON/.test(r.foco)) problemas.push(u + ": el diálogo no recibe el foco"); r.p.filter(x => !/títulos principales/.test(x)).forEach(x => problemas.push(u + " diálogo: " + x)); await pg.keyboard.press("Tab"); await pg.keyboard.press("Tab"); await pg.keyboard.press("Tab"); if (!(await pg.evaluate(() => !!document.activeElement.closest(".modal-caja")))) problemas.push(u + ": el foco se escapa del diálogo con Tab"); await pg.keyboard.press("Escape"); await w(pg); }
      if (i === 5) { await clic(pg, '[data-act="ver-todo"]'); await anotar(pg, u + " ruta completa", false); await clic(pg, '[data-act="ver-todo"]'); }
      const h = await L.pantalla(pg, i); if (h === "cierre") break;
    }
    await ctx.close();
  }
  T.ok(!problemas.length, "en teléfono (390, 360 y 320 px) cada pantalla tiene un título, nombres accesibles, foco en el título al cambiar y no desborda", problemas.slice(0, 8).join(" | "));
  T.ok(vistas.size >= 12, "se revisaron " + vistas.size + " pantallas distintas");
  // Teclado: entrar con Enter y responder una actividad sin ratón
  const ctx = await br.newContext({ viewport:{ width:1280, height:900 } }), pg = await L.pagina(ctx, errores);
  await pg.goto(ARCHIVO); await pg.focus('[data-in="a-u"]'); await pg.keyboard.type("demo-jueces"); await pg.keyboard.press("Tab"); await pg.keyboard.type("DEMO-2026"); await pg.keyboard.press("Enter");
  await pg.waitForFunction(() => document.body.getAttribute("data-etapa") === "orientacion", null, { timeout:15000 });
  T.ok(true, "se puede entrar solo con el teclado (Enter envía el acceso)");
  await L.pasarOrientacion(pg); await L.aceptarDeclaracion(pg, null); await clic(pg, '[data-act="ronda-iniciar"]'); while (!(await hay(pg, '[data-act="guardar"]'))) await L.pantalla(pg, 0);
  await pg.focus('[data-act="f"][data-arg="ve"][data-v="parcial"]'); await pg.keyboard.press("Enter"); await w(pg);
  const foco = await pg.evaluate(() => { const a = document.activeElement; return a.getAttribute("data-arg") + "/" + a.getAttribute("data-v") + "/" + a.getAttribute("aria-pressed"); });
  T.ok(foco === "ve/parcial/true", "al elegir una opción con el teclado el foco se queda en esa opción", foco);
  await ctx.close();
}

(async () => {
  const br = await L.lanzar(), errores = [];
  try {
    if (cual === "todo" || cual === "roles") await roles(br, errores);
    if (cual === "todo" || cual === "sesion") await sesion(br, errores);
    if (cual === "todo" || cual === "accesible") await accesible(br, errores);
    T.ok(!errores.length, "sin errores de consola, sin excepciones y sin peticiones de red", errores.slice(0, 5).join(" | "));
  } catch (e) { T.ok(false, "la prueba se interrumpió", e.stack || e); }
  await br.close();
  process.exit(T.fin() ? 1 : 0);
})();
