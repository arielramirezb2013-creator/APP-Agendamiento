// Prueba de los documentos sintéticos (src/docs/*.js) contra los casos del instrumento, sin navegador:
//   · cada expediente trae un documento por soporte y por versión que el participante puede tener en la mano;
//   · el número y la fecha de la versión de referencia son los que dice el instrumento (`contenido`);
//   · todo documento tiene la forma de src/docs/FORMATO.md y sus figuras, los datos que su tipo necesita;
//   · las identificaciones son sintéticas (SIM-), no hay correos, direcciones web ni teléfonos;
//   · ningún texto trae los códigos con que el investigador analiza (los mismos que busca la interfaz);
//   · en la ruta, cada campo de cada pieza está en el documento, para que el visor tache lo que no llegó;
//   · y, si ya existe el visor (src/doc-1-render.js), cada documento se pinta sin errores.
//   node tests/documentos.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const M = require("./motor");
const RAIZ = M.RAIZ, DIR = path.join(RAIZ, "src/docs");
const T = (() => { let n = 0, f = 0; return { ok:(c, d, x) => { n++; if (!c) f++; console.log((c ? "OK    " : "FALLA ") + String(n).padStart(3) + " · " + d + (!c && x ? "  →  " + x : "")); }, fin:() => { console.log("\n" + (n - f) + " de " + n + " verificaciones" + (f ? " · " + f + " fallaron" : "")); return f; } }; })();

const COD = /(?<![\w-])(?:H[1-4]|SP\d|[Rr]\d{2}|P\d{1,2}|r[1-5]|[AED]\d|PI-L\d+|DGIT-[\w-]+|SOL|ORI|REG|CAR|FIR|AFI|APT|EXP|NEX|FUN|AUD|HC|INC|HL|DIC|SL)(?![\w-])|[①②③④⑤]|\d+ d\.(?:h\.)?(?=\s|$|[,;)·])/;
const archivos = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => /\.js$/.test(f) && f !== "base.js").sort() : [];
const m = M.crearMotor(M.configDemo());
let codigo = fs.readFileSync(path.join(DIR, "base.js"), "utf8") + "\n" + archivos.map(f => fs.readFileSync(path.join(DIR, f), "utf8")).join("\n");
const conVisor = fs.existsSync(path.join(RAIZ, "src/doc-1-render.js"));
if (conVisor) codigo += "\n" + fs.readFileSync(path.join(RAIZ, "src/doc-1-render.js"), "utf8");
codigo += "\nglobalThis.__D = { DOCS, docHtml:typeof docHtml === 'function' ? docHtml : null };";
try { vm.runInContext(codigo, m.ctx, { filename:"documentos.js" }); } catch (e) { T.ok(false, "los archivos de documentos se cargan", e.stack); process.exit(1); }
const { DOCS, docHtml } = m.ctx.__D;
T.ok(true, "se cargan " + archivos.length + " archivos de documentos" + (conVisor ? " y el visor" : ""));

/* ---------- Forma de un documento ---------- */
const TIPOS = ["solicitud", "dictamen", "constancia", "certificado", "historia", "informe", "examen", "imagen", "incapacidad", "historia_laboral", "analisis_puesto", "oficio"];
const FIG = {
  audiograma:d => d.od && d.oi && [250, 500, 1000, 2000, 4000].every(f => typeof d.od[f] === "number" && typeof d.oi[f] === "number"),
  espirometria:d => ["fvc", "fvcPred", "fev1", "fev1Pred"].every(k => typeof d[k] === "number" && d[k] > 0) && d.fev1 <= d.fvc,
  rm_columna:d => ["cervical", "lumbar"].indexOf(d.region) >= 0 && Array.isArray(d.hallazgos) && d.hallazgos.every(h => h.nivel && ["hernia", "protrusion", "estenosis", "artrodesis", "mielopatia"].indexOf(h.tipo) >= 0),
  rx_torax:d => typeof d.profusion === "string" && Array.isArray(d.zonas),
  neuroconduccion:d => Array.isArray(d.filas) && d.filas.length > 0 && d.filas.every(f => f.nervio && typeof f.latencia === "number"),
  serie:d => Array.isArray(d.puntos) && d.puntos.length > 0 && d.puntos.every(p => Array.isArray(p) && typeof p[1] === "number")
};
const FECHA = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;
function textos(x, out) { if (typeof x === "string") out.push(x); else if (Array.isArray(x)) x.forEach(y => textos(y, out)); else if (x && typeof x === "object") Object.keys(x).forEach(k => textos(x[k], out)); return out; }
function forma(doc, donde, malos) {
  if (!doc || typeof doc !== "object") { malos.push(donde + ": no es un documento"); return; }
  if (TIPOS.indexOf(doc.tipo) < 0) malos.push(donde + ": tipo «" + doc.tipo + "»");
  if (!doc.titulo || !doc.emisor || !doc.emisor.n) malos.push(donde + ": sin título o sin emisor");
  if (!FECHA.test(doc.fecha || "")) malos.push(donde + ": fecha «" + doc.fecha + "»");
  if (!Array.isArray(doc.paginas) || !doc.paginas.length) { malos.push(donde + ": sin páginas"); return; }
  doc.paginas.forEach((pg, i) => {
    if (!Array.isArray(pg.bloques) || !pg.bloques.length) malos.push(donde + " página " + (i + 1) + ": sin bloques");
    (pg.bloques || []).forEach((b, j) => {
      const k = Object.keys(b).filter(x => x !== "campo");
      const tipo = ["h", "p", "kv", "tabla", "lista", "figura", "firma", "nota", "vacio"].filter(t => t in b);
      if (tipo.length !== 1) { malos.push(donde + " p" + (i + 1) + " b" + (j + 1) + ": bloque con " + k.join("+")); return; }
      if (b.kv && !(Array.isArray(b.kv) && b.kv.every(r => Array.isArray(r) && r.length >= 2))) malos.push(donde + ": kv mal formado");
      if (b.tabla && !(Array.isArray(b.tabla.cols) && Array.isArray(b.tabla.filas) && b.tabla.filas.every(r => Array.isArray(r) && r.length === b.tabla.cols.length))) malos.push(donde + ": tabla «" + (b.tabla.cols || []).join("|") + "» con filas de otro ancho");
      if (b.figura && !(FIG[b.figura.tipo] && FIG[b.figura.tipo](b.figura.datos || {}))) malos.push(donde + ": figura «" + b.figura.tipo + "» sin los datos que necesita");
      if (b.firma && !(b.firma.nombre && b.firma.cargo)) malos.push(donde + ": firma sin nombre o cargo");
    });
  });
  textos(doc, []).forEach(t => {
    const c = COD.exec(t); if (c) malos.push(donde + ": código «" + c[0] + "» en «" + t.slice(Math.max(0, c.index - 30), c.index + 30) + "»");
    if (/https?:|www\.|@[a-z]/i.test(t)) malos.push(donde + ": dirección web o correo en «" + t.slice(0, 60) + "»");
    if (/\b(?:tel\.?|teléfono|celular)\s*:?\s*\+?\d/i.test(t)) malos.push(donde + ": teléfono en «" + t.slice(0, 60) + "»");
    if (/\b(?:C\.?C\.?|NIT|cédula|RM|registro médico)\s*(?:No\.?|n\.?º)?\s*\d/i.test(t)) malos.push(donde + ": identificación sin el prefijo SIM- en «" + t.slice(0, 70) + "»");
  });
}

/* ---------- Expedientes ---------- */
m.EXP.casos.forEach(caso => {
  const D = DOCS.exp[caso.id], malos = [];
  if (!D) { T.ok(false, caso.id + ": tiene sus documentos", "falta DOCS.exp[\"" + caso.id + "\"]"); return; }
  Object.keys(D.identidad || {}).forEach(k => { if (!/SIM/.test(String(D.identidad[k]))) malos.push("identidad." + k + " no es sintética: " + D.identidad[k]); });
  caso.soportes.forEach(s => {
    const vs = [s.ver, s.verRef].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i), Ds = (D.soportes || {})[s.k] || {};
    vs.forEach(v => { if (!Ds[v]) malos.push(s.k + " " + v + ": falta el documento"); else forma(Ds[v], s.k + " " + v, malos); });
    // La versión de referencia trae el número y la fecha que dice el instrumento.
    const mm = /^([A-Z]{2,4}-L0\d), (\d\d\/\d\d\/\d{4})/.exec(s.contenido), ref = Ds[s.verRef];
    if (mm && ref && (ref.numero !== mm[1] || ref.fecha !== mm[2])) malos.push(s.k + " " + s.verRef + ": número y fecha «" + ref.numero + ", " + ref.fecha + "» en lugar de «" + mm[1] + ", " + mm[2] + "»");
    if (ref && ref.version && ref.version !== s.verRef) malos.push(s.k + " " + s.verRef + ": dice ser la versión «" + ref.version + "»");
    if (s.ver && s.ver !== s.verRef && Ds[s.ver] && Ds[s.ver].version && Ds[s.ver].version !== s.ver) malos.push(s.k + " " + s.ver + ": dice ser la versión «" + Ds[s.ver].version + "»");
  });
  Object.keys(D.soportes || {}).forEach(k => { if (!caso.soportes.some(s => s.k === k)) malos.push("documento de un soporte que el caso no tiene: " + k); });
  T.ok(!malos.length, caso.id + ": un documento por soporte y versión, con la forma del formato, sintético y sin códigos de análisis", malos.slice(0, 8).join(" | "));
});

/* ---------- Ruta ---------- */
(() => {
  const R = DOCS.ruta.mp, malos = [];
  if (!R) { T.ok(false, "la ruta (perfil mp) tiene sus documentos", "falta DOCS.ruta.mp"); return; }
  Object.keys(R.identidad || {}).forEach(k => { if (!/SIM/.test(String(R.identidad[k]))) malos.push("identidad." + k + " no es sintética"); });
  ["hc", "apt", "inc", "hl"].forEach(k => {
    const doc = (R.piezas || {})[k]; if (!doc) { malos.push(k + ": falta"); return; }
    forma(doc, "ruta " + k, malos);
    const usados = new Set();
    doc.paginas.forEach(pg => (pg.bloques || []).forEach(b => { if (typeof b.campo === "number") usados.add(b.campo); (b.kv || []).forEach(r => { if (typeof r[2] === "number") usados.add(r[2]); }); }));
    m.EV[k].campos.forEach((c, i) => { if (!usados.has(i)) malos.push(k + ": el campo «" + c + "» (" + i + ") no está marcado en el documento"); });
    [...usados].forEach(i => { if (!(i >= 0 && i < m.EV[k].campos.length)) malos.push(k + ": campo " + i + " no existe"); });
  });
  T.ok(!malos.length, "ruta: las cuatro piezas con cada campo marcado para poder tacharlo, sintéticas y sin códigos", malos.slice(0, 8).join(" | "));
})();

/* ---------- El visor pinta cada documento ---------- */
if (docHtml) {
  const malos = []; let n = 0;
  const pintar = (doc, donde, opc) => {
    try {
      const h = docHtml(doc, opc || {}); n++;
      if (typeof h !== "string" || h.length < 200) malos.push(donde + ": salida vacía");
      if (/undefined|NaN|\[object Object\]/.test(h)) malos.push(donde + ": «" + (/undefined|NaN|\[object Object\]/.exec(h) || [""])[0] + "» en el HTML");
      if (!/sint[ée]tic/i.test(h)) malos.push(donde + ": sin la marca de documento sintético");
      if (/<script/i.test(h)) malos.push(donde + ": trae <script>");
    } catch (e) { malos.push(donde + ": " + e.message); }
  };
  Object.keys(DOCS.exp).forEach(id => Object.keys(DOCS.exp[id].soportes || {}).forEach(k => Object.keys(DOCS.exp[id].soportes[k]).forEach(v => pintar(DOCS.exp[id].soportes[k][v], id + " " + k + " " + v))));
  const R = DOCS.ruta.mp || { piezas:{} };
  Object.keys(R.piezas || {}).forEach(k => { pintar(R.piezas[k], "ruta " + k); pintar(R.piezas[k], "ruta " + k + " con campos tachados", { visible:i => i % 2 === 0, motivo:"Retenido en origen" }); });
  T.ok(!malos.length && n > 0, "el visor pinta los " + n + " documentos con su marca de sintético y sin valores rotos", malos.slice(0, 6).join(" | "));
  // Lo tachado no viaja en el HTML.
  if (R.piezas && R.piezas.hc) {
    const campos = [], tachado = docHtml(R.piezas.hc, { visible:() => false, motivo:"Retenido en origen" });
    R.piezas.hc.paginas.forEach(pg => pg.bloques.forEach(b => (b.kv || []).forEach(r => { if (typeof r[2] === "number") campos.push(String(r[1])); })));
    const fuga = campos.filter(v => v.length > 12 && tachado.indexOf(v.replace(/&/g, "&amp;").replace(/</g, "&lt;")) >= 0);
    T.ok(!fuga.length && /Retenido en origen/.test(tachado), "lo que no está a la vista se tacha y su valor no viaja en el HTML", fuga.slice(0, 2).join(" | "));
  }
}
process.exit(T.fin() ? 1 : 0);
