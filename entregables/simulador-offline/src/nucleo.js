/* ============ Núcleo común del simulador asíncrono y del panel del investigador ============ */
const INSTRUMENTO = "simulador_blueprint_asincrono";
const FORMATO = 1;
const VERSION = "1.0";

/* ---------- DOM: repintado estable ---------- */
function claveFoco(el) {
  if (!el || !el.getAttribute) return null;
  const k = { act:el.getAttribute("data-act"), inp:el.getAttribute("data-in"), arg:el.getAttribute("data-arg"), v:el.getAttribute("data-v") };
  return k.act || k.inp ? k : null;
}
function buscarFoco(raiz, k) {
  const attr = k.inp ? "data-in" : "data-act", val = k.inp || k.act;
  return [...raiz.querySelectorAll("[" + attr + "]")].filter(x => x.getAttribute(attr) === val && x.getAttribute("data-arg") === k.arg && x.getAttribute("data-v") === k.v)[0] || null;
}
// Reemplaza el contenido solo si cambió. Con `conservar` mantiene desplazamientos, paneles abiertos, foco y cursor.
function setHtml(el, h, conservar) {
  if (el.__last === h) return false;
  el.__last = h;
  const ae = document.activeElement;
  const foco = ae && el.contains(ae) ? claveFoco(ae) : null;
  let cursor = null;
  if (foco && foco.inp) { try { if (typeof ae.selectionStart === "number") cursor = [ae.selectionStart, ae.selectionEnd]; } catch (e) {} }
  const desliz = conservar ? [...el.querySelectorAll(".sb-wrap,.twrap")].map(x => [x.scrollLeft, x.scrollTop]) : [];
  const abiertos = {};
  if (conservar) el.querySelectorAll("details[data-det]").forEach(d => { abiertos[d.getAttribute("data-det")] = d.open; });
  el.innerHTML = h;
  el.querySelectorAll(".sb-wrap,.twrap").forEach((x, i) => { if (desliz[i]) { x.scrollLeft = desliz[i][0]; x.scrollTop = desliz[i][1]; } });
  el.querySelectorAll("details[data-det]").forEach(d => { const k = d.getAttribute("data-det"); if (k in abiertos) d.open = abiertos[k]; });
  if (foco) {
    const x = buscarFoco(el, foco);
    if (x && x !== document.activeElement) { try { x.focus({ preventScroll:true }); if (cursor && x.setSelectionRange) x.setSelectionRange(cursor[0], cursor[1]); } catch (e) {} }
  }
  return true;
}
const $ = id => document.getElementById(id);
function pintar(id, h, conservar) { const el = $(id); return el ? setHtml(el, h, conservar) : false; }

/* ---------- Texto ---------- */
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const A = {}; BP.actores.forEach(a => { A[a.id] = a; });
const EV = BP.evidencia, CIRC = ["", "①", "②", "③", "④", "⑤"];
const FIN = {}; ESC.finalidades.forEach(f => { FIN[f.id] = f; });
const nom = id => id === "modulo" ? "Módulo" : id === "sistema" ? "Sistema" : A[id] ? A[id].corto : (id || "—");
const nomL = id => id === "modulo" ? "Índice + reglas + logs" : A[id] ? A[id].n : nom(id);
// Texto libre listo para guardar: sin caracteres de control ni mitades sueltas de un emoji, recortado por caracteres.
function textoLimpio(v, max) {
  const cs = Array.from(String(v == null ? "" : v)).filter(c => { const k = c.codePointAt(0); return !((k >= 0xD800 && k <= 0xDFFF) || (k < 32 && k !== 10 && k !== 9) || k === 127); });
  return cs.join("").trim().length > (max || 600) ? Array.from(cs.join("").trim()).slice(0, max || 600).join("") : cs.join("").trim();
}
const plural = (n, uno, varios) => n + " " + (n === 1 ? uno : varios);
const etiqueta = (ops, v) => { const o = (ops || []).filter(x => x[0] === v)[0]; return o ? o[1] : (v == null ? "" : String(v)); };

/* ---------- Iconografía: identificadores del kit por concepto ---------- */
const ICO = {
  actor:{ tra:"actores-trabajador", emp:"actores-empleador", ips:"actores-ips", eps:"actores-eps", arl:"actores-arl", afp:"actores-afp", jr:"actores-junta-regional", jn:"actores-junta-nacional", mintrabajo:"actores-mintrabajo", minsalud:"actores-minsalud", supersalud:"actores-supersalud", jueces:"actores-jueces", modulo:"actores-modulo" },
  paso:{ A1:"pasos-a1-inicio-incapacidad", A2:"pasos-a2-certificados-prorrogas", A3:"pasos-a3-evidencia-laboral", E1:"pasos-e1-calificacion-origen", E2:"pasos-e2-controversia", E3:"pasos-e3-dictamen", E4:"pasos-e4-apelacion", E5:"pasos-e5-pago", D1:"pasos-d1-reintegro", D2:"pasos-d2-prestacion", D3:"pasos-d3-seguimiento" },
  fase:{ antes:"fases-antes", durante:"fases-durante", despues:"fases-despues" },
  modo:{ actual:"fases-flujo-actual", propuesto:"fases-flujo-propuesto" },
  carril:{ mp:"carriles-acciones-usuario", contacto:"carriles-puntos-contacto", front:"carriles-frontstage", back:"carriles-backstage", soporte:"carriles-soporte" },
  linea:{ contacto:"carriles-linea-interaccion", back:"carriles-linea-visibilidad", soporte:"carriles-linea-interna" },
  ev:{ hc:"documentos-historia-clinica", apt:"documentos-apt", inc:"documentos-incapacidad", hl:"documentos-historial-laboral", dic:"documentos-dictamen" },
  estado:{ pendiente:"estados-pendiente", en_curso:"estados-en-curso", completada:"estados-completado", completado:"estados-completado", valoracion:"capitulos-validacion-contratos", cerrada:"estados-cerrado", parcial:"estados-en-curso", completa:"estados-completado", retirada:"acciones-salir", sin_iniciar:"estados-pendiente" },
  actividad:{ focal:"carriles-acciones-usuario", decide:"acciones-decidir", custodia:"acciones-entregar", soporte:"acciones-vigilar", contexto:"acciones-observar" },
  sub:{ caracterizacion:"investigacion-sp1-caracterizacion", diseno:"investigacion-sp2-diseno", evaluacion:"investigacion-sp3-evaluacion" },
  regla:["", "gobernanza-custodia", "gobernanza-finalidad", "gobernanza-minimo-necesario", "gobernanza-responsable-plazo", "gobernanza-trazabilidad"],
  tipo:{ actividad:"acciones-decidir", observacion:"acciones-observar", solicitud:"acciones-solicitar", respuesta:"acciones-entregar", consulta:"acciones-consultar", notificacion:"acciones-notificar", acuse:"acciones-confirmar-recepcion", inicio_ronda:"acciones-iniciar", cierre_ronda:"acciones-cerrar-sesion", avance:"acciones-siguiente", valoracion:"capitulos-validacion-contratos", preguntas:"investigacion-pregunta-investigacion", consentimiento:"gobernanza-etica", comentario:"acciones-observar" }
};
// SVG en línea, decorativo (aria-hidden) salvo que se pase una etiqueta; sz: "sm" 16 px, sin sz 20 px, "lg" 24 px.
function ico(id, sz, label) {
  if (!id || typeof BPIcons === "undefined" || BPIcons.ids.indexOf(id) < 0) return "";
  let s = BPIcons.svg(id, label);
  if (sz) s = s.replace('class="bp-icon"', 'class="bp-icon bp-icon--' + sz + '"');
  return s;
}
const icoActor = (id, sz) => ico(ICO.actor[id], sz);

/* ---------- Tiempo, números e identificadores ---------- */
const ahora = () => Date.now();
const hora = t => t ? new Date(t).toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" }) : "";
const fecha = t => t ? new Date(t).toLocaleString("es-CO", { dateStyle:"medium", timeStyle:"short" }) : "";
const fechaArchivo = t => { const d = new Date(t || ahora()), z = n => String(n).padStart(2, "0"); return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + "-" + z(d.getHours()) + z(d.getMinutes()); };
const clone = o => JSON.parse(JSON.stringify(o));
const num = v => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) && n >= 0 ? n : 0; };
const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
function azar(n) {
  const b = new Uint8Array(n);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(b);
  else for (let i = 0; i < n; i++) b[i] = Math.floor(Math.random() * 256);
  return b;
}
const uid = () => hex(azar(6));

/* ---------- SHA-256, HMAC y PBKDF2 en JavaScript puro ----------
   Se implementan aquí porque crypto.subtle no existe en páginas servidas por http sin TLS. */
const SHA = (() => {
  const K = new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const W = new Uint32Array(64);
  const utf8 = s => new TextEncoder().encode(s);
  function bytes(m) {
    if (typeof m === "string") m = utf8(m);
    const l = m.length, n = ((l + 9 + 63) >> 6) << 6, b = new Uint8Array(n), dv = new DataView(b.buffer);
    b.set(m); b[l] = 0x80; dv.setUint32(n - 8, Math.floor(l / 0x20000000)); dv.setUint32(n - 4, (l << 3) >>> 0);
    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    for (let i = 0; i < n; i += 64) {
      for (let t = 0; t < 16; t++) W[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const x = W[t - 15], y = W[t - 2];
        const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
      }
      let a = h0, b2 = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let t = 0; t < 64; t++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[t] + W[t]) | 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const t2 = (S0 + ((a & b2) ^ (a & c) ^ (b2 & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b2; b2 = a; a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b2) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }
    const out = new Uint8Array(32), o = new DataView(out.buffer);
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach((v, i) => o.setUint32(i * 4, v >>> 0));
    return out;
  }
  function hmac(clave, msg) {
    let k = typeof clave === "string" ? utf8(clave) : clave; if (k.length > 64) k = bytes(k);
    const ip = new Uint8Array(64 + msg.length), op = new Uint8Array(96);
    for (let i = 0; i < 64; i++) { const x = k[i] || 0; ip[i] = x ^ 0x36; op[i] = x ^ 0x5c; }
    ip.set(msg, 64); op.set(bytes(ip), 64);
    return bytes(op);
  }
  // PBKDF2-HMAC-SHA256, un bloque de salida (32 bytes). Equivale a hashlib.pbkdf2_hmac("sha256", clave, sal, iter).
  function pbkdf2(clave, sal, iter) {
    const p = utf8(clave), s = utf8(sal), s1 = new Uint8Array(s.length + 4);
    s1.set(s); s1[s.length + 3] = 1;
    let u = hmac(p, s1); const t = u.slice();
    for (let i = 1; i < iter; i++) { u = hmac(p, u); for (let j = 0; j < 32; j++) t[j] ^= u[j]; }
    return t;
  }
  return { bytes, hex:m => hex(bytes(m)), hmac, pbkdf2 };
})();

/* ---------- Cuentas: usuario y contraseña ---------- */
const KDF = { alg:"PBKDF2-HMAC-SHA256", iter:5000 };
const normUsuario = u => String(u == null ? "" : u).trim().toLowerCase();
// La contraseña no distingue mayúsculas ni cuenta espacios o guiones: se dicta y se copia sin tropiezos.
const normClave = c => String(c == null ? "" : c).normalize("NFKC").toUpperCase().replace(/[\s\-–—_.]/g, "");
const huellaClave = (usuario, clave, sal, iter) => hex(SHA.pbkdf2(normUsuario(usuario) + "\n" + normClave(clave), sal, iter || KDF.iter));
function igualSeguro(a, b) { a = String(a); b = String(b); let d = a.length ^ b.length; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ (b.charCodeAt(i % (b.length || 1)) || 0); return d === 0; }

/* ---------- Huella de integridad de un documento (JSON canónico) ---------- */
function canonico(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v === undefined ? null : v);
  if (Array.isArray(v)) return "[" + v.map(canonico).join(",") + "]";
  return "{" + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ":" + canonico(v[k])).join(",") + "}";
}
function huellaDoc(doc) { const d = Object.assign({}, doc); delete d.huella; return SHA.hex(canonico(d)); }

/* ---------- Pasos del blueprint y reglas por paso ---------- */
function pasoDurante(e) {
  const c = k => BP.celdas[e.id + k];
  const out = { id:e.id, fase:"durante", n:e.n, dia:e.resp + " · " + e.plazo + (e.nota ? " · " + e.nota : "") };
  ["hoy", "mod"].forEach(v => {
    const f1 = c("F1")[v], f2 = c("F2"), f3 = c("F3"), f4 = c("F4"), f5 = c("F5");
    const o = { mp:f1.h, contacto:SB.contactos[e.id][v], front:{ a:f2.a, t:f2[v].h }, back:{ a:f3.a, t:f3[v].h }, soporte:v === "mod" ? { a:"modulo", t:f4[v].h } : { a:f5.a, t:f5[v].h }, otros:{}, ch:[] };
    if (v === "mod") o.otros[f5.a] = f5[v].h;
    (f2.t || []).forEach(x => { o.otros[x] = o.otros[x] || f2[v].h; });
    (f3.t || []).forEach(x => { o.otros[x] = o.otros[x] || f3[v].h; });
    const set = {}; [f1, f2[v], f3[v], f4[v], f5[v]].forEach(x => (x.ch || []).forEach(k => { set[k] = 1; }));
    o.ch = Object.keys(set).sort().map(k => v === "mod" ? +k : k);
    out[v] = o;
  });
  return out;
}
const PASOS = SB.pasos.filter(p => p.fase === "antes").concat(BP.etapas.map(pasoDurante), SB.pasos.filter(p => p.fase === "despues"));
const PIDX = {}; PASOS.forEach((p, i) => { PIDX[p.id] = i; });
const vModo = m => m === "propuesto" ? "mod" : "hoy";
const rondaDef = id => ESC.rondas.filter(r => r.id === id)[0];
const modoDe = ronda => (rondaDef(ronda) || {}).modo || "actual";
function reglasDe(p, modo) {
  const o = p[vModo(modo)], dec = ESC.decisiones[p.id];
  const front = dec ? dec.a : o.front.a;
  const custodios = []; if (o.back && o.back.a && A[o.back.a] && o.back.a !== front) custodios.push(o.back.a);
  const soporte = o.soporte && o.soporte.a && A[o.soporte.a] ? o.soporte.a : null;
  const extras = dec && dec.extra ? [dec.extra.a] : [];
  const otros = Object.keys(o.otros || {}).filter(x => A[x] && x !== front && custodios.indexOf(x) < 0 && x !== soporte);
  return { front, custodios, soporte, extras, otros, entradas:ESC.entradas[p.id] || [], salidas:ESC.salidas[p.id] || [] };
}
// Piezas de evidencia que el paso necesita y que este actor custodia.
const piezasCustodia = (p, actor) => (ESC.entradas[p.id] || []).filter(k => EV[k].cust === actor);
// Finalidad que el contrato autoriza a un actor.
const finalidadDe = actor => (ESC.finalidades.filter(f => f.actores.indexOf(actor) >= 0)[0] || {}).id || null;
/* Actividad de un actor en un paso. En la versión asíncrona no hay otros participantes conectados:
   el custodio de una pieza que el paso necesita responde siempre (el sistema simula quién se la pide). */
function actividadDe(p, actor, modo) {
  if (!actor || !A[actor]) return null;
  const r = reglasDe(p, modo), dec = ESC.decisiones[p.id], T = GUION.actividad;
  if (actor === "tra") return Object.assign({ tipo:"focal" }, T.focal);
  if (actor === r.front) return Object.assign({ tipo:"decide", ops:dec ? dec.ops : [] }, T.decide);
  if (dec && dec.extra && dec.extra.a === actor) return Object.assign({ tipo:"decide", ops:dec.extra.ops, extra:true }, T.decide);
  if (r.custodios.indexOf(actor) >= 0 || piezasCustodia(p, actor).length) return Object.assign({ tipo:"custodia", piezas:piezasCustodia(p, actor), pide:r.front }, T.custodia);
  if (actor === r.soporte || r.otros.indexOf(actor) >= 0) return Object.assign({ tipo:"soporte" }, T.soporte);
  return null;
}
// Recorrido de un actor en una ronda: actividades propias y tramos de contexto (pasos seguidos donde no interviene).
function bloquesDe(actor, modo) {
  const out = []; let ctx = null;
  PASOS.forEach(p => {
    const act = actividadDe(p, actor, modo);
    if (act) { ctx = null; out.push({ tipo:"actividad", pasos:[p.id], act }); }
    else { if (!ctx) { ctx = { tipo:"contexto", pasos:[] }; out.push(ctx); } ctx.pasos.push(p.id); }
  });
  return out;
}
/* Comprobación de una consulta frente al contrato de datos del actor.
   La evidencia propia no pasa por el contrato de consulta: el custodio la tiene en origen.
   Las vistas por paso (GUION.vistasPaso) recogen lo que el texto del paso concede y la matriz de contratos no trae. */
function vistaDe(actor, pieza, pasoId) {
  const porPaso = ((GUION.vistasPaso[pasoId] || {})[actor] || {})[pieza];
  if (porPaso) return porPaso;
  const ac = A[actor] || {};
  if ((ac.fuera || []).indexOf(pieza) >= 0) return null;
  const c = (ac.consulta || []).filter(x => x[0] === pieza)[0];
  return c ? c[1] : null;
}
function comprobarFinalidad(actor, finId, piezas, pasoId) {
  const f = FIN[finId], aut = !!(f && f.actores.indexOf(actor) >= 0);
  const perm = {}, den = [], propias = [];
  (piezas || []).forEach(pz => {
    if (EV[pz].cust === actor) { propias.push(pz); return; }
    const v = aut ? vistaDe(actor, pz, pasoId) : null;
    if (v) perm[pz] = v; else den.push(pz);
  });
  return { finalidadAutorizada:aut, piezasPermitidas:perm, piezasDenegadas:den, piezasPropias:propias };
}
const camposTxt = (pz, idx) => idx.map(i => EV[pz].campos[i]).join(", ");
const retenidosTxt = (pz, idx) => EV[pz].campos.filter((c, i) => idx.indexOf(i) < 0).join(", ");

/* ---------- Registros (bitácora de solo anexar) ---------- */
function vigentesDe(regs) { const r = {}; regs.forEach(x => { if (x.reemplaza) r[x.reemplaza] = 1; }); return regs.filter(x => !r[x.id]); }
const cumple = (r, f) => Object.keys(f).every(k => f[k] == null || r[k] === f[k]);
// Qué respondió un participante en una actividad, en una frase corta.
function resumenActividad(pl) {
  if (!pl) return "";
  if (pl.tipo === "decide") return (pl.decisionTxt || pl.decision || "") + " · información " + (pl.suficiencia || "—");
  if (pl.tipo === "custodia") return etiqueta(ESC.respCustodia, pl.respuesta) + " · " + num(pl.dias) + " d.";
  if (pl.tipo === "focal") return etiqueta(ESC.focal.sabe, pl.sabe);
  if (pl.tipo === "soporte") return etiqueta(ESC.soporte.ve, pl.ve) + " · " + etiqueta(ESC.soporte.accion, pl.accion);
  return "";
}

/* ---------- Validación de documentos ---------- */
const RE_ID = /^[a-z0-9][a-z0-9._-]{0,39}$/;
function validarConfig(c) {
  const e = [];
  if (!c || typeof c !== "object") return ["no hay configuración"];
  if (c.formato !== FORMATO) e.push("formato de configuración no reconocido");
  if (!c.estudio || !RE_ID.test(String(c.estudio.id || ""))) e.push("falta el identificador del estudio");
  if (!Array.isArray(c.cuentas) || !c.cuentas.length) e.push("no hay cuentas de participantes");
  (c.cuentas || []).forEach((q, i) => {
    if (!q || !RE_ID.test(String(q.u || "")) || !A[q.a] || !/^[0-9a-f]{8,64}$/.test(String(q.s || "")) || !/^[0-9a-f]{64}$/.test(String(q.h || ""))) e.push("la cuenta " + (i + 1) + " está incompleta");
  });
  const us = (c.cuentas || []).map(q => q && q.u); if (us.some((u, i) => us.indexOf(u) !== i)) e.push("hay usuarios repetidos");
  return e;
}
function validarRespuesta(d) {
  const e = [];
  if (!d || typeof d !== "object") return ["el archivo no contiene un documento"];
  if (d.instrumento !== INSTRUMENTO) e.push("no es un archivo de respuestas de este simulador");
  if (d.formato !== FORMATO) e.push("formato no reconocido");
  if (!d.cuenta || !A[d.cuenta.actor] || !RE_ID.test(String(d.cuenta.usuario || ""))) e.push("falta la cuenta o el rol");
  if (!d.participante || !/^[a-z0-9]{6,40}$/.test(String(d.participante.id || ""))) e.push("falta el identificador del participante");
  if (!d.consentimiento || d.consentimiento.aceptado !== true) e.push("no consta la declaración de participación voluntaria");
  if (!Array.isArray(d.registros)) e.push("no trae registros");
  if (!e.length && d.huella !== huellaDoc(d)) e.push("la huella de integridad no coincide: el archivo fue modificado o está incompleto");
  return e;
}

/* ---------- Descarga de archivos ----------
   Dentro de un visor que bloquea los enlaces de descarga (un artefacto publicado) se usa la capacidad de
   descargas del visor: la persona confirma el guardado y puede rechazarlo. Fuera de él, un enlace de descarga. */
let DL = null, enVisor = false;
async function initDescargas() {
  enVisor = !!(window.claude && typeof window.claude.use === "function");
  if (enVisor) { try { DL = await window.claude.use("downloads"); } catch (e) { DL = null; } }
}
// Devuelve true solo si el archivo se entregó a la persona.
async function descargarArchivo(nombre, datos, mime) {
  if (DL) { try { await DL.save({ filename:nombre, data:datos }); return true; } catch (e) { return false; } }
  if (enVisor) return false;
  try {
    const a = document.createElement("a"), url = URL.createObjectURL(new Blob([datos], { type:mime || "application/octet-stream" }));
    a.href = url; a.download = nombre; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  } catch (e) { return false; }
}
// CSV para hojas de cálculo: separador «;», comillas dobladas y neutralización de fórmulas.
function csvCelda(v) {
  let s = String(v == null ? "" : v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
const csvTabla = (cols, rows) => [cols.map(csvCelda).join(";")].concat(rows.map(r => r.map(csvCelda).join(";"))).join("\r\n");
