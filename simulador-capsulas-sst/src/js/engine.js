"use strict";
/* Motor del simulador: valoración GTC 45, chat, matriz IPEVR y exportes. Los datos viven en src/data/. */

const FRECUENCIA_OPS = [
  { t: "Toda la jornada (permanente)", ne: 4 },
  { t: "Varias veces al día (frecuente)", ne: 3 },
  { t: "Algunas veces (ocasional)", ne: 2 },
  { t: "Rara vez (esporádica)", ne: 1 }
];

const SURA_CANALES = "Canales ARL SURA: líneas nacionales 01 8000 511 414 y 01 8000 941 414 · sura.co/arl (Servicios en Línea). Solicita el acompañamiento de tu asesor asignado.";

/* ===================== MOTOR DE VALORACIÓN GTC 45:2012 ===================== */
const GTC45 = {
  interpNP(np) { return np >= 24 ? "Muy Alto" : np >= 10 ? "Alto" : np >= 6 ? "Medio" : "Bajo"; },
  nivel(nr) { return nr >= 600 ? "I" : nr >= 150 ? "II" : nr >= 40 ? "III" : "IV"; },
  aceptabilidad(niv) {
    return niv === "I" ? "No Aceptable" : niv === "II" ? "No Aceptable o Aceptable con control específico" : niv === "III" ? "Mejorable" : "Aceptable";
  },
  /* ND "B" (Bajo): GTC 45 no asigna valor y clasifica directamente en nivel IV. */
  valorar(nd, ne, nc) {
    if (nd === "B") return { nd: "B", ne, np: "—", npI: "Bajo (controlado)", nc, nr: "—", nrNum: 0, niv: "IV", acc: "Aceptable" };
    const np = nd * ne, nr = np * nc, niv = this.nivel(nr);
    return { nd, ne, np, npI: this.interpNP(np), nc, nr, nrNum: nr, niv, acc: this.aceptabilidad(niv) };
  }
};

/* Clasificación del control declarado en Fuente / Medio / Individuo (palabras clave, sin acentos). Lo no reconocido va a Individuo. */
const CTRL_KW = {
  f: ["amasadora", "carretilla", "bultos pequenos", "guarda", "elevador", "soporte", "ayudas mecanicas", "horno cerrado", "desechable",
      "cuchillos afilados", "tolva", "vehiculo en regla", "horario diurno", "turnos", "carga organizada", "picos de carga", "gato", "grua"],
  m: ["ventilacion", "extractor", "extraccion", "cabina", "aire libre", "tapete", "antideslizante", "tomas", "polo a tierra", "orden", "aseo",
      "limpieza", "instalacion", "aislamiento", "senalizacion", "demarcacion", "almacenamiento", "extintor", "desinfeccion", "revision",
      "mantenimiento", "salidas", "aseguramiento", "silla", "puesto", "sobrecarga"]
};
function normTxt(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\b([a-z])\.(?=[a-z]\b|[a-z]\.)/g, "$1"); }
function clasificarControl(c, nd) {
  if (nd === 10 || !c || normTxt(c) === "sin control") return { f: "Sin control", m: "Sin control", i: "Sin control" };
  const out = { f: [], m: [], i: [] };
  String(c).split(/\s*[+;\/,]\s*|\s+y\s+/).map(s => s.trim()).filter(Boolean).forEach(frag => {
    const n = normTxt(frag);
    const tier = CTRL_KW.f.some(k => n.includes(k)) ? "f" : CTRL_KW.m.some(k => n.includes(k)) ? "m" : "i";
    out[tier].push(frag.charAt(0).toUpperCase() + frag.slice(1));
  });
  return { f: out.f.join("; ") || "—", m: out.m.join("; ") || "—", i: out.i.join("; ") || "—" };
}

const CLCOL = { "Físico": ["#e8f1ff", "#1b5fb0"], "Químico": ["#fdeede", "#b5571a"], "Biológico": ["#e7f7ec", "#1f8a4c"], "Biomecánico": ["#efeafe", "#5b3fd0"],
  "Psicosocial": ["#fdeaf3", "#b03a73"], "Seguridad": ["#fff1e0", "#a86412"], "Fenómenos": ["#eef0f3", "#5b6470"] };
function clKey(cl) {
  for (const k of ["Físico", "Químico", "Biológico", "Biomecánico", "Psicosocial", "Fenómenos"]) if (cl.indexOf(k) === 0) return k;
  return "Seguridad";
}
function suraServicio(cl) { return SURA[clKey(cl)] || SURA["Seguridad"]; }
const NIV_META = { I: { rgb: [192, 57, 43], txt: [255, 255, 255], hex: "#c0392b", label: "No aceptable" }, II: { rgb: [224, 122, 31], txt: [255, 255, 255], hex: "#e07a1f", label: "Control específico" },
  III: { rgb: [225, 180, 0], txt: [58, 46, 0], hex: "#e1b400", label: "Mejorable" }, IV: { rgb: [39, 174, 96], txt: [255, 255, 255], hex: "#27ae60", label: "Aceptable" } };

/* ===================== ESTADO + UTILIDADES ===================== */
const $ = id => document.getElementById(id);
const ui = { chat: $("chat"), status: $("waStatus"), hint: $("inputPh") };
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const S = { run: 0, speed: REDUCED ? 0 : CONFIG.velocidad, capId: null, sectorId: null, personas: null, resp: [], rows: [] };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function subst(raw) { return String(raw).split("{nombre}").join(CONFIG.persona || "afiliado").split("{remitente}").join(CONFIG.remitente || "Remitente"); }
function md(raw) {
  let s = esc(subst(raw));
  s = s.replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>").replace(/_([^_\n]+)_/g, "<em>$1</em>");
  return s.replace(/\n/g, "<br>");
}
function hora() {
  const d = new Date(); let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0"), ap = h < 12 ? "a. m." : "p. m.";
  h = h % 12 || 12;
  return { hm: `${h}:${m}`, full: `${h}:${m} ${ap}` };
}
function fechaHoy() {
  try { return new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }); } catch (e) { return new Date().toLocaleDateString(); }
}
function slug(s) { return normTxt(s).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); }
function scrollChat() { ui.chat.scrollTop = ui.chat.scrollHeight; }
function setStatus(t) { ui.status.textContent = t; }
function setHint(t) { ui.hint.textContent = t; }
function newRun() { S.run++; return S.run; }
function typingMs(raw) { const base = Math.min(1400, Math.max(450, subst(raw).length * 20)); return (typeof F !== "undefined" && (F.phase === "ask" || F.phase === "confirm") ? Math.min(base, 550) : base) * S.speed; }

/* ===================== MOTOR DE CHAT (único para cápsulas y matriz) ===================== */
function dayPill() { const el = document.createElement("div"); el.className = "day-pill"; el.textContent = "HOY"; ui.chat.appendChild(el); }
function bubble(side, html) {
  const row = document.createElement("div");
  row.className = "wa-row " + (side === "in" ? "in" : "out");
  const meta = hora().full + (side === "out" ? ' <span class="wa-checks">✓✓</span>' : "");
  row.innerHTML = `<div class="wa-bubble ${side === "in" ? "in" : "out"}"><span class="txt">${html}</span><span class="wa-meta">${meta}</span></div>`;
  ui.chat.appendChild(row); scrollChat();
}
function typingOn() {
  if ($("typingRow")) return;
  const row = document.createElement("div"); row.className = "wa-row in"; row.id = "typingRow";
  row.innerHTML = '<div class="wa-bubble in typing" aria-label="escribiendo"><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>';
  ui.chat.appendChild(row); scrollChat(); setStatus("escribiendo…");
}
function typingOff() { const r = $("typingRow"); if (r) r.remove(); setStatus("en línea"); }

/* Envía mensajes entrantes con retardo de escritura. Devuelve false si la sesión cambió (reinicio). */
async function say(msgs, run) {
  const arr = Array.isArray(msgs) ? msgs : [msgs];
  for (const raw of arr) {
    if (run !== S.run) return false;
    if (S.speed > 0) { typingOn(); await sleep(typingMs(raw)); if (run !== S.run) { typingOff(); return false; } typingOff(); }
    bubble("in", md(raw));
    if (S.speed > 0) await sleep(320 * S.speed);
    if (run !== S.run) return false;
  }
  return true;
}
/* Botones de respuesta rápida. Al tocar uno, se eco-envía como mensaje saliente y se invoca cb(op). */
function options(list, run, cb) {
  setHint("Toca una opción ↑");
  const box = document.createElement("div"); box.className = "wa-actions"; box.setAttribute("role", "group");
  list.forEach(op => {
    const b = document.createElement("button"); b.type = "button"; b.className = "wa-action";
    b.innerHTML = '<span class="ic" aria-hidden="true">↩</span>' + esc(subst(op.t));
    b.addEventListener("click", () => {
      if (run !== S.run) return;
      box.remove(); setHint("Mensaje"); bubble("out", md(op.t));
      setTimeout(() => { if (run === S.run) cb(op); }, S.speed > 0 ? 400 * S.speed : 0);
    });
    box.appendChild(b);
  });
  ui.chat.appendChild(box); scrollChat();
}
function finDeFlujo(run) {
  setHint("Mensaje"); setStatus("en línea");
  options([{ t: "🏠 Volver al inicio" }], run, boot);
}

/* ===================== FLUJO: INICIO Y CÁPSULAS ===================== */
function boot() {
  closeModal();
  const run = newRun();
  confirmandoReinicio = false;
  resetMatriz(); S.capId = null; furatMode(false); F.cur = null; F.phase = "idle";
  ui.chat.innerHTML = ""; setStatus("en línea"); setHint("Mensaje"); dayPill();
  setTimeout(() => { if (run === S.run) askFork(run); }, S.speed > 0 ? 300 : 0);
}
async function askFork(run) {
  if (!await say(["¡Hola! 👋 Soy tu asesor de SST por WhatsApp.", "¿Qué necesitas hacer hoy? 👇"], run)) return;
  options([{ t: "💬 Interactuar con una cápsula", v: "cap" }, { t: "📋 Generar mi matriz de peligros", v: "mtx" }, { t: "🚑 Reportar un accidente (FURAT)", v: "furat" }], run,
    op => { if (op.v === "cap") askCapsula(run); else if (op.v === "mtx") askSector(run); else furatStart(run); });
}
async function askCapsula(run) {
  if (!await say("Perfecto. ¿Sobre qué tema quieres la cápsula? 👇", run)) return;
  options(Object.keys(CAPSULAS).map(id => ({ t: CAPSULAS[id].icon + " " + CAPSULAS[id].nombre, v: id })), run, op => { S.capId = op.v; playNode(CAPSULAS[op.v].inicio, run); });
}
async function playNode(nodeId, run) {
  const cap = CAPSULAS[S.capId], node = cap && cap.nodes[nodeId];
  if (!node || run !== S.run) return;
  if (!await say(node.msgs, run)) return;
  if (node.opciones) {
    options(node.opciones.map(o => ({ t: o.txt, next: o.next })), run, op => playNode(op.next, run));
  } else if (node.next) {
    if (S.speed > 0) await sleep(500 * S.speed);
    if (run === S.run) playNode(node.next, run);
  } else {
    finDeFlujo(run);
  }
}

/* ===================== FLUJO: ENTREVISTA PARA LA MATRIZ ===================== */
function resetMatriz() {
  S.sectorId = null; S.personas = null; S.resp = []; S.rows = [];
  $("sumPanel").hidden = true; $("hazCount").hidden = true; $("nivDist").hidden = true; $("nivDist").innerHTML = "";
  document.body.classList.remove("has-doc");
}
async function askSector(run) {
  resetMatriz();
  if (!await say(["Vamos a construir tu *matriz de peligros (IPEVR)* con plantillas precargadas por sector. 📋", "¿A qué se dedica tu empresa? Elige la opción más parecida 👇"], run)) return;
  options(Object.keys(SECTORES).map(id => ({ t: SECTORES[id].icon + " " + SECTORES[id].nombre, v: id })), run, op => { S.sectorId = op.v; renderResumen(); afterSector(run); });
}
async function afterSector(run) {
  const s = SECTORES[S.sectorId];
  const como = CONFIG.preguntarFrecuencia
    ? "Por cada uno me dices: si aplica, qué control tienes hoy y con qué frecuencia ocurre. Así la valoración sale de *tus respuestas*."
    : "Por cada uno me dices si aplica y cómo lo manejan hoy. Así la valoración sale de *tus respuestas*.";
  if (!await say(["Perfecto: *" + s.nombre + "* (CIIU " + s.ciiu + "). ✅", "Para *no asumir nada*, te preguntaré por *cada peligro potencial* de tu actividad. 🔍", como, "Primero, un dato general 👇"], run)) return;
  if (!await say(PERSONAS_Q.q, run)) return;
  options(PERSONAS_Q.ops, run, op => { S.personas = op.v; askPeligro(run, 0); });
}
async function askPeligro(run, i) {
  const s = SECTORES[S.sectorId];
  if (i >= s.peligros.length) { finish(run); return; }
  const p = s.peligros[i];
  if (!await say(["🔹 *Punto " + (i + 1) + " de " + s.peligros.length + "*", p.q], run)) return;
  options(p.ops.map((o, k) => ({ t: o.t, k })), run, op => {
    const o = p.ops[op.k];
    if (o.na) { S.resp[i] = { aplica: false }; askPeligro(run, i + 1); return; }
    S.resp[i] = { aplica: true, nd: o.nd, ne: o.ne, c: o.c, neDeclarado: false };
    if (CONFIG.preguntarFrecuencia && !p.neFijo) askFrecuencia(run, i); else askPeligro(run, i + 1);
  });
}
async function askFrecuencia(run, i) {
  if (!await say("¿Con qué *frecuencia* ocurre esa situación? 👇", run)) return;
  options(FRECUENCIA_OPS, run, op => { S.resp[i].ne = op.ne; S.resp[i].neDeclarado = true; askPeligro(run, i + 1); });
}
function buildRows() {
  const s = SECTORES[S.sectorId], rows = [];
  s.peligros.forEach((p, i) => {
    const r = S.resp[i]; if (!r || !r.aplica) return;
    const v = GTC45.valorar(r.nd, r.ne, p.nc), cc = clasificarControl(r.c, r.nd);
    rows.push(Object.assign({}, p, v, { cf: cc.f, cm: cc.m, ci: cc.i, exp: S.personas, sura: suraServicio(p.cl), neDeclarado: r.neDeclarado }));
  });
  rows.sort((a, b) => (b.nrNum - a.nrNum) || (b.nc - a.nc));
  return rows;
}
function distribucion(rows) { const d = { I: 0, II: 0, III: 0, IV: 0 }; rows.forEach(r => { d[r.niv]++; }); return d; }
async function finish(run) {
  S.rows = buildRows();
  const d = distribucion(S.rows), n = S.rows.length;
  const partes = [];
  if (d.I) partes.push("🔴 *" + d.I + "* de nivel I (no aceptable)");
  if (d.II) partes.push("🟠 *" + d.II + "* de nivel II (control específico)");
  if (d.III) partes.push("🟡 *" + d.III + "* de nivel III (mejorable)");
  if (d.IV) partes.push("🟢 *" + d.IV + "* de nivel IV (aceptable)");
  const msgs = ["¡Listo! 🎉 Con tus respuestas armé tu matriz de peligros."];
  if (n === 0) {
    msgs.push("Según lo que respondiste, *ninguno de los peligros de la plantilla aplica* a tu operación. Revisa si alguna situación quedó por fuera y vuelve a intentarlo. 🔍");
    if (!await say(msgs, run)) return;
    finDeFlujo(run); return;
  }
  msgs.push("Identifiqué *" + n + " peligro" + (n === 1 ? "" : "s") + "* para tu actividad: " + partes.join(" · ") + ". 📊");
  msgs.push("Te envío el documento aquí en el chat 👇 Tócalo para verlo y descargarlo en *PDF*, *Excel* o *CSV*.");
  if (!await say(msgs, run)) return;
  buildModal(); docCard(); renderResumen();
  finDeFlujo(run);
}
function docCard() {
  const s = SECTORES[S.sectorId], fname = "Matriz_peligros_" + slug(s.nombre) + ".pdf";
  const row = document.createElement("div"); row.className = "wa-row in";
  row.innerHTML = '<div class="wa-bubble in doc"><button class="wa-doc" type="button" aria-haspopup="dialog"><span class="wa-doc-ic" aria-hidden="true">📊</span><span class="wa-doc-meta"><span class="wa-doc-name">' + esc(fname) +
    '</span><span class="wa-doc-sub">' + S.rows.length + ' peligros · ' + COLS.length + ' columnas · GTC 45</span></span><span class="wa-doc-dl">VER</span></button><span class="wa-meta">' + hora().full + '</span></div>';
  ui.chat.appendChild(row); row.querySelector(".wa-doc").addEventListener("click", openModal); scrollChat();
}
function renderResumen() {
  const s = SECTORES[S.sectorId]; if (!s) return;
  $("sumDetail").innerHTML = [["Actividad", s.nombre], ["CIIU", s.ciiu], ["Descripción", s.actividad]]
    .map(kv => '<div class="drow"><span class="dk">' + kv[0] + '</span><span class="dv">' + esc(kv[1]) + '</span></div>').join("");
  $("sumPanel").hidden = false;
  if (S.rows.length) {
    $("hazN").textContent = S.rows.length; $("hazCount").hidden = false;
    const d = distribucion(S.rows);
    $("nivDist").innerHTML = ["I", "II", "III", "IV"].map(k => '<span class="niv-chip" style="--c:' + NIV_META[k].hex + '"><b>' + d[k] + '</b> nivel ' + k + '</span>').join("");
    $("nivDist").hidden = false;
  }
}

/* ===================== MATRIZ IPEVR: VISTA, PDF, EXCEL, CSV ===================== */
const COLS = ["ID", "Proceso", "Zona/lugar", "Actividad", "Tarea", "Rutinaria", "Descripción del peligro", "Clasificación", "Efectos posibles",
  "Control existente - Fuente", "Control existente - Medio", "Control existente - Individuo", "ND", "NE", "NP", "Interpretación NP", "NC", "NR",
  "Nivel del riesgo", "Aceptabilidad", "Nº expuestos (total empresa)", "Peor consecuencia", "Requisito legal", "Eliminación", "Sustitución", "Ingeniería", "Administrativos/Señalización", "EPP"];
function rowArr(r) {
  return [r.id, r.pr, r.zo, r.ac, r.ta, r.ru, r.de, r.cl, r.ef, r.cf, r.cm, r.ci, r.nd, r.ne, r.np, r.npI, r.nc, r.nr, r.niv, r.acc, r.exp, r.pe, r.rl, r.e1, r.e2, r.e3, r.e4, r.e5];
}
function notaMetodo(html) {
  const ne = CONFIG.preguntarFrecuencia
    ? "el NE, de la frecuencia de exposición que declaraste (Permanente = 4 · Frecuente = 3 · Ocasional = 2 · Esporádica = 1)"
    : "el NE se estimó a partir de la situación que describiste en cada respuesta (frecuencia típica de esa tarea en tu sector: Permanente = 4 · Frecuente = 3 · Ocasional = 2 · Esporádica = 1)";
  const b = html ? (t => "<b>" + t + "</b>") : (t => t);
  return [
    b("Valoración (GTC 45:2012):") + " NP = ND × NE; NR = NP × NC. Niveles: I (4000–600) No aceptable · II (500–150) No aceptable o aceptable con control específico · III (120–40) Mejorable · IV (20 o menos) Aceptable.",
    b("Cómo se determinó (desde tus respuestas):") + " el ND proviene del control declarado por peligro (Sin control = 10 · control parcial, solo EPP o administrativo = 6 · control de ingeniería en fuente/medio = 2); " + ne + "; el NC es la peor consecuencia inherente del peligro. Solo se incluyen los peligros que confirmaste; ninguno se asume.",
    b("Marco:") + " GTC 45:2012, Decreto 1072 de 2015 (art. 2.2.4.6.15) y Resolución 0312 de 2019. Borrador técnico elaborado a partir de la autodeclaración del empleador; revísalo y valídalo con el responsable del SG-SST antes de adoptarlo."
  ];
}
function clTag(cl) { const c = CLCOL[clKey(cl)]; return '<span class="tag-cl" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(cl) + '</span>'; }
function claves(rows) { const out = []; rows.forEach(r => { const k = clKey(r.cl); if (out.indexOf(k) < 0) out.push(k); }); return out; }

function buildModal() {
  const s = SECTORES[S.sectorId], rows = S.rows, d = distribucion(rows);
  const head = '<thead><tr><th colspan="6">Descripción</th><th colspan="3">Identificación del peligro</th><th colspan="3">Controles existentes</th><th colspan="6">Evaluación del riesgo</th><th colspan="2">Valoración</th><th colspan="3">Criterios para controles</th><th colspan="5">Medidas de intervención</th></tr>' +
    '<tr><th>ID</th><th>Proceso</th><th>Zona / lugar</th><th>Actividad</th><th>Tarea</th><th>Rutinaria</th><th>Descripción</th><th>Clasificación</th><th>Efectos posibles</th><th>Fuente</th><th>Medio</th><th>Individuo</th><th>ND</th><th>NE</th><th>NP</th><th>Interp. NP</th><th>NC</th><th>NR</th><th>Nivel</th><th>Aceptabilidad</th><th>Nº exp.</th><th>Peor consecuencia</th><th>Req. legal</th><th>Eliminación</th><th>Sustitución</th><th>Ingeniería</th><th>Administrativos / señalización</th><th>EPP</th></tr></thead>';
  const body = rows.map(r => '<tr><td class="c">' + esc(r.id) + '</td><td>' + esc(r.pr) + '</td><td>' + esc(r.zo) + '</td><td>' + esc(r.ac) + '</td><td>' + esc(r.ta) + '</td><td class="c">' + esc(r.ru) + '</td><td>' + esc(r.de) + '</td><td>' + clTag(r.cl) +
    '</td><td>' + esc(r.ef) + '</td><td>' + esc(r.cf) + '</td><td>' + esc(r.cm) + '</td><td>' + esc(r.ci) + '</td><td class="c">' + esc(r.nd) + '</td><td class="c">' + r.ne + '</td><td class="c">' + esc(r.np) + '</td><td class="c">' + esc(r.npI) + '</td><td class="c">' + r.nc +
    '</td><td class="nr nr-' + r.niv + '">' + esc(r.nr) + '</td><td class="c">' + r.niv + '</td><td class="acc acc-' + r.niv + '">' + esc(r.acc) + '</td><td class="c">' + esc(r.exp) + '</td><td>' + esc(r.pe) + '</td><td>' + esc(r.rl) + '</td><td>' + esc(r.e1) + '</td><td>' + esc(r.e2) + '</td><td>' + esc(r.e3) + '</td><td>' + esc(r.e4) + '</td><td>' + esc(r.e5) + '</td></tr>').join("");
  const suraHtml = '<div class="sura-box"><h3>Acompañamiento sugerido con ARL SURA</h3>' + claves(rows).map(k => '<div class="sura-row"><span class="sura-k">' + esc(k) + '</span><span class="sura-v">' + esc(SURA[k] || SURA["Seguridad"]) + '</span></div>').join("") + '<p class="sura-foot">' + esc(SURA_CANALES) + '</p></div>';
  const dist = ["I", "II", "III", "IV"].map(k => '<span class="lg"><span class="sw" style="background:' + NIV_META[k].hex + '"></span>' + k + ' · ' + NIV_META[k].label + ': <b>' + d[k] + '</b></span>').join("");
  $("mtxBody").innerHTML =
    '<div class="matriz-meta"><span class="chip">Actividad: <b>' + esc(s.nombre) + '</b></span><span class="chip">CIIU: <b>' + esc(s.ciiu) + '</b></span><span class="chip">Personas: <b>' + esc(S.personas) + '</b></span><span class="chip">Peligros: <b>' + rows.length + '</b></span><span class="chip">Método: <b>GTC 45:2012</b></span><span class="chip">Fecha: <b>' + fechaHoy() + '</b></span></div>' +
    '<div class="export-row"><button class="exp-btn primary" id="btnPdf" type="button">📄 Descargar PDF</button><button class="exp-btn" id="btnXlsx" type="button">📗 Excel (.xlsx)</button><button class="exp-btn" id="btnCsv" type="button">⬇️ CSV</button><button class="exp-btn" id="btnPrint" type="button">🖨️ Imprimir</button></div>' +
    '<div class="matriz-scroll" tabindex="0"><table class="matriz">' + head + '<tbody>' + body + '</tbody></table></div>' +
    '<div class="matriz-legend">' + dist + '</div>' + suraHtml +
    '<p class="matriz-foot">' + notaMetodo(true).join("<br>") + '</p>';
  document.querySelector(".mtx-doc-ic").textContent = "📊";
  $("mtxName").textContent = "Matriz_peligros_" + slug(s.nombre) + ".pdf";
  $("mtxSub").textContent = s.nombre + " · CIIU " + s.ciiu + " · " + rows.length + " peligros";
  $("btnPdf").addEventListener("click", downloadPdf);
  $("btnXlsx").addEventListener("click", downloadXlsx);
  $("btnCsv").addEventListener("click", downloadCsv);
  $("btnPrint").addEventListener("click", () => window.print());
  setPrintPage("landscape");
  document.body.classList.add("has-doc");
}
/* Espera hasta 3 s a que carguen las librerías de exporte (CDN con defer) antes de declarar «Requiere conexión». */
function conLibs(check, cb, id) { let n = 0; (function t() { if (check()) { cb(); return; } if (++n > 15) { flash(id, "Requiere conexión"); return; } setTimeout(t, 200); })(); }
/* El rótulo original se guarda una sola vez: dos avisos seguidos no dejan el botón pegado en el texto temporal. */
function flash(id, txt) { const b = $(id); if (!b) return; if (b._ft) clearTimeout(b._ft); else b._fo = b.textContent; b.textContent = txt; b._ft = setTimeout(() => { b.textContent = b._fo; b._ft = null; }, 1600); }
/* Orientación de impresión según el documento abierto: matriz apaisada, FURAT vertical. */
function setPrintPage(orient) { let st = $("pageOrient"); if (!st) { st = document.createElement("style"); st.id = "pageOrient"; document.head.appendChild(st); } st.textContent = "@media print{@page{size:" + orient + ";margin:" + (orient === "landscape" ? "7mm" : "10mm") + "}}"; }

function downloadPdf() {
  if (!(window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable)) { conLibs(() => window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable, downloadPdf, "btnPdf"); return; }
  const s = SECTORES[S.sectorId], rows = S.rows, d = distribucion(rows);
  const doc = new window.jspdf.jsPDF({ orientation: "landscape", unit: "pt", format: "a3", compress: true });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 28;
  doc.setProperties({ title: "Matriz IPEVR · " + s.nombre, subject: "Identificación de peligros y valoración de riesgos (GTC 45:2012)", author: CONFIG.autor, creator: CONFIG.autor + " · Simulador Cápsulas SST " + CONFIG.version, keywords: "IPEVR, GTC 45, SG-SST, " + s.nombre });
  const logo = document.querySelector(".brand-logo");
  const cabecera = (titulo, sub) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(35, 26, 77); doc.text(titulo, M, 32);
    try { if (logo && /^data:/.test(logo.src)) doc.addImage(logo.src, "PNG", W - M - 92, 18, 92, 17.5); } catch (e) { /* sin logo */ }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(90, 90, 90);
    doc.text("Método GTC 45:2012  -  Decreto 1072/2015 (art. 2.2.4.6.15)  -  Resolución 0312/2019", M, 48);
    doc.text(sub || ("Actividad: " + s.nombre + "   |   CIIU: " + s.ciiu + "   |   Personas: " + (S.personas || "-") + "   |   Peligros: " + rows.length + "   |   Fecha: " + fechaHoy()), M, 62);
  };
  const colorNivel = (nivIdx, nrIdx) => data => {
    if (data.section !== "body") return;
    const ci = data.column.index; if (ci !== nivIdx && ci !== nrIdx) return;
    const m = NIV_META[data.row.raw[nivIdx]]; if (!m) return;
    data.cell.styles.fillColor = m.rgb; data.cell.styles.textColor = m.txt; data.cell.styles.fontStyle = "bold"; data.cell.styles.halign = "center";
  };
  const base = { theme: "grid", margin: { left: M, right: M }, styles: { fontSize: 7, cellPadding: 2.2, overflow: "linebreak", valign: "top", lineColor: [208, 208, 208], lineWidth: 0.3, textColor: [40, 40, 40] },
    headStyles: { fillColor: [35, 26, 77], textColor: [255, 255, 255], fontSize: 7, fontStyle: "bold", halign: "center", valign: "middle" }, alternateRowStyles: { fillColor: [250, 250, 252] } };
  const titulo = (t, y) => { doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(35, 26, 77); doc.text(t, M, y); };

  /* Página 1: resumen de valoración */
  cabecera("Matriz de Identificación de Peligros y Valoración de Riesgos (IPEVR)");
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(60, 60, 60);
  doc.text("Resultado: " + rows.length + " peligros confirmados  -  Nivel I (no aceptable): " + d.I + "   |   Nivel II (control específico): " + d.II + "   |   Nivel III (mejorable): " + d.III + "   |   Nivel IV (aceptable): " + d.IV, M, 78);
  titulo("1. Ranking de riesgos (ordenado por NR)", 98);
  const RANK = ["ID", "Descripción del peligro", "Clasificación", "Tarea", "ND", "NE", "NP", "Interp. NP", "NC", "NR", "Nivel", "Aceptabilidad", "Control existente (declarado)"];
  doc.autoTable(Object.assign({}, base, { startY: 104, head: [RANK], styles: Object.assign({}, base.styles, { fontSize: 8, cellPadding: 3 }), headStyles: Object.assign({}, base.headStyles, { fontSize: 8 }),
    body: rows.map(r => [r.id, r.de, r.cl, r.ta, r.nd, r.ne, r.np, r.npI, r.nc, r.nr, r.niv, r.acc, [r.cf, r.cm, r.ci].filter(x => x && x !== "—").join(" / ")].map(String)),
    columnStyles: { 0: { cellWidth: 42, halign: "center" }, 1: { cellWidth: 220 }, 2: { cellWidth: 120 }, 3: { cellWidth: 150 }, 4: { cellWidth: 26, halign: "center" }, 5: { cellWidth: 26, halign: "center" }, 6: { cellWidth: 28, halign: "center" }, 7: { cellWidth: 52, halign: "center" }, 8: { cellWidth: 28, halign: "center" }, 9: { cellWidth: 36 }, 10: { cellWidth: 32 }, 11: { cellWidth: 118 } },
    didParseCell: colorNivel(10, 9) }));
  let y = doc.lastAutoTable.finalY + 22;
  if (y > H - 170) { doc.addPage(); cabecera("Matriz IPEVR (continuación)"); y = 84; }
  titulo("2. Acompañamiento sugerido con ARL SURA", y);
  doc.autoTable(Object.assign({}, base, { startY: y + 6, head: [["Clasificación", "Servicio ARL SURA"]], body: claves(rows).map(k => [k, SURA[k] || SURA["Seguridad"]]),
    styles: Object.assign({}, base.styles, { fontSize: 8, cellPadding: 3.5 }), headStyles: Object.assign({}, base.headStyles, { fillColor: [0, 168, 132], fontSize: 8 }), columnStyles: { 0: { cellWidth: 120, fontStyle: "bold" }, 1: { cellWidth: W - 2 * M - 120 } } }));
  y = doc.lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.8); doc.setTextColor(90, 90, 90);
  doc.text(doc.splitTextToSize(SURA_CANALES, W - 2 * M), M, y); y += 14;
  doc.setFontSize(6.9); doc.setTextColor(115, 115, 115);
  notaMetodo(false).forEach(n => { const lines = doc.splitTextToSize(n, W - 2 * M); if (y + lines.length * 8.5 > H - 24) { doc.addPage(); y = 40; } doc.text(lines, M, y); y += lines.length * 8.5 + 3; });

  /* Página 2: bloque A (identificación y controles existentes) */
  doc.addPage(); cabecera("Matriz IPEVR - Bloque A: identificación del peligro y controles existentes");
  const A = ["ID", "Proceso", "Zona / lugar", "Actividad", "Tarea", "Rut.", "Descripción del peligro", "Clasificación", "Efectos posibles", "Control existente - Fuente", "Control existente - Medio", "Control existente - Individuo"];
  doc.autoTable(Object.assign({}, base, { startY: 76, head: [A], body: rows.map(r => [r.id, r.pr, r.zo, r.ac, r.ta, r.ru, r.de, r.cl, r.ef, r.cf, r.cm, r.ci].map(String)),
    columnStyles: { 0: { cellWidth: 38, halign: "center" }, 1: { cellWidth: 72 }, 2: { cellWidth: 72 }, 3: { cellWidth: 92 }, 4: { cellWidth: 118 }, 5: { cellWidth: 30, halign: "center" }, 6: { cellWidth: 156 }, 7: { cellWidth: 104 }, 9: { cellWidth: 98 }, 10: { cellWidth: 98 }, 11: { cellWidth: 98 } } }));

  /* Página 3: bloque B (evaluación, valoración y medidas de intervención) */
  doc.addPage(); cabecera("Matriz IPEVR - Bloque B: evaluación, valoración y medidas de intervención");
  const B = ["ID", "Descripción del peligro", "ND", "NE", "NP", "Interp. NP", "NC", "NR", "Nivel", "Aceptabilidad", "Nº exp.", "Peor consecuencia", "Requisito legal", "Eliminación", "Sustitución", "Ingeniería", "Administrativos / señalización", "EPP"];
  doc.autoTable(Object.assign({}, base, { startY: 76, head: [B], body: rows.map(r => [r.id, r.de, r.nd, r.ne, r.np, r.npI, r.nc, r.nr, r.niv, r.acc, r.exp, r.pe, r.rl, r.e1, r.e2, r.e3, r.e4, r.e5].map(String)),
    columnStyles: { 0: { cellWidth: 38, halign: "center" }, 2: { cellWidth: 22, halign: "center" }, 3: { cellWidth: 22, halign: "center" }, 4: { cellWidth: 24, halign: "center" }, 5: { cellWidth: 46, halign: "center" }, 6: { cellWidth: 24, halign: "center" }, 7: { cellWidth: 30 }, 8: { cellWidth: 28 }, 9: { cellWidth: 78 }, 10: { cellWidth: 34, halign: "center" }, 11: { cellWidth: 92 }, 12: { cellWidth: 92 }, 13: { cellWidth: 74 }, 14: { cellWidth: 90 }, 15: { cellWidth: 100 }, 16: { cellWidth: 112 }, 17: { cellWidth: 90 } },
    didParseCell: colorNivel(8, 7) }));

  const pc = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text(CONFIG.autor + "  -  Matriz IPEVR  -  " + s.nombre + "  -  Borrador para validación con el responsable del SG-SST", M, H - 12);
    doc.text("Página " + i + " de " + pc, W - M - 60, H - 12);
  }
  const fn = "Matriz_peligros_" + slug(s.nombre) + ".pdf";
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) { let w = null; try { w = window.open(doc.output("bloburl"), "_blank"); } catch (e) { w = null; } if (w) flash("btnPdf", "✅ Abierto (Compartir → Guardar)"); else { doc.save(fn); flash("btnPdf", "✅ Descargado"); } }
  else { doc.save(fn); flash("btnPdf", "✅ Descargado"); }
}

function downloadXlsx() {
  if (!(window.XLSX && window.XLSX.utils)) { conLibs(() => window.XLSX && window.XLSX.utils, downloadXlsx, "btnXlsx"); return; }
  const X = window.XLSX, s = SECTORES[S.sectorId], rows = S.rows, d = distribucion(rows);
  const meta = [["Matriz de Identificación de Peligros y Valoración de Riesgos (IPEVR)"],
    ["Actividad", s.nombre, "CIIU", s.ciiu, "Personas", S.personas, "Fecha", fechaHoy(), "Método", "GTC 45:2012", "Peligros", rows.length],
    ["Nivel I", d.I, "Nivel II", d.II, "Nivel III", d.III, "Nivel IV", d.IV], []];
  const ws = X.utils.aoa_to_sheet(meta.concat([COLS], rows.map(rowArr)));
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];
  ws["!cols"] = COLS.map(c => ({ wch: /^(ID|ND|NE|NP|NC|NR|Rutinaria)$/.test(c) ? 9 : /Nivel|Nº|Interp/.test(c) ? 14 : /Aceptabilidad/.test(c) ? 24 : 30 }));
  const ws2 = X.utils.aoa_to_sheet([["Método de valoración"]].concat(notaMetodo(false).map(n => [n])).concat([[], ["Acompañamiento sugerido con ARL SURA"]], claves(rows).map(k => [k, SURA[k] || SURA["Seguridad"]]), [[SURA_CANALES]]));
  ws2["!cols"] = [{ wch: 18 }, { wch: 140 }];
  const wb = X.utils.book_new();
  X.utils.book_append_sheet(wb, ws, "Matriz IPEVR"); X.utils.book_append_sheet(wb, ws2, "Método");
  wb.Props = { Title: "Matriz IPEVR · " + s.nombre, Subject: "GTC 45:2012", Author: CONFIG.autor, Company: CONFIG.autor, CreatedDate: new Date() };
  X.writeFile(wb, "Matriz_peligros_" + slug(s.nombre) + ".xlsx");
  flash("btnXlsx", "✅ Descargado");
}

function downloadCsv() {
  /* Celdas que empiezan por = + @ o -dígito se neutralizan con un espacio para que ningún importador las ejecute como fórmula. */
  const q = v => { v = String(v); if (/^[=+@]|^-\d/.test(v)) v = " " + v; v = v.replace(/"/g, '""'); return /[",\r\n;]/.test(v) ? '"' + v + '"' : v; };
  const lines = [COLS.map(q).join(";")].concat(S.rows.map(r => rowArr(r).map(q).join(";")));
  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = "Matriz_peligros_" + slug(SECTORES[S.sectorId].nombre) + ".csv";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  flash("btnCsv", "✅ Descargado");
}

/* ===================== MODAL (diálogo accesible) ===================== */
let lastFocus = null;
function openModal() {
  const m = $("mtxModal"); if (!m.hidden) return;
  lastFocus = document.activeElement; m.hidden = false; document.body.style.overflow = "hidden";
  $("mtxClose").focus();
}
function closeModal() {
  const m = $("mtxModal"); if (!m || m.hidden) return;
  m.hidden = true; document.body.style.overflow = "";
  if (lastFocus && typeof lastFocus.focus === "function" && document.contains(lastFocus)) lastFocus.focus();
}
$("mtxModal").addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const f = Array.from($("mtxDialog").querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ===================== ARRANQUE ===================== */
/* Con un FURAT a medias, reiniciar pide confirmación en el chat antes de borrar lo dictado. */
let confirmandoReinicio = false;
function restartSeguro() {
  const enCurso = typeof F !== "undefined" && (F.phase === "ask" || F.phase === "confirm") && Object.keys(F.ans).length >= 3;
  if (!enCurso) { boot(); return; }
  if (confirmandoReinicio) return;
  confirmandoReinicio = true;
  const run = S.run;
  bubble("in", md("⚠️ Tienes un *FURAT en curso* con *" + Object.keys(F.ans).length + "* datos registrados. Si reinicias, se pierden."));
  options([{ t: "🗑️ Sí, borrar y reiniciar", v: 1 }, { t: "↩️ Seguir con el FURAT", v: 0 }], run, op => {
    confirmandoReinicio = false;
    if (op.v) { boot(); return; }
    if (F.cur && F.cur.type === "guion") guionFocus(F.cur.g); else furatListen();
  });
}
$("btnRestart").addEventListener("click", restartSeguro);
$("waBack").addEventListener("click", restartSeguro);
$("mtxClose").addEventListener("click", closeModal);
$("mtxModal").addEventListener("click", e => { if (e.target === $("mtxModal")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
function tick() { $("sbTime").textContent = hora().hm; }
tick(); setInterval(tick, 30000);
