(function () {
"use strict";
/* ============ Utilidades ============ */
const _smart = {};
function setHtml(el, h) { if (el.__last === h) return false; el.__last = h;
  const porClave = (lista, base) => { const cuenta = {}, out = []; lista.forEach(x => { const b = base(x); cuenta[b] = (cuenta[b] || 0) + 1; out.push([b + "#" + cuenta[b], x]); }); return out; };
  const kDet = d => ((d.querySelector("summary") || {}).textContent || "").replace(/\d+/g, "").trim();
  const kScr = x => x.classList.contains("sb-wrap") ? "sb" : x.classList.contains("feed") ? "feed" : "t:" + (((x.querySelector("table") || { getAttribute() {} }).getAttribute("data-tabla")) || (x.querySelector("table") || {}).className || "");
  const scroll = {}; porClave([...el.querySelectorAll(".sb-wrap,.feed,.twrap")], kScr).forEach(p => { scroll[p[0]] = [p[1].scrollLeft, p[1].scrollTop]; });
  const abiertos = {}; porClave([...el.querySelectorAll("details")], kDet).forEach(p => { abiertos[p[0]] = p[1].open; });
  const ae = document.activeElement; let foco = null; if (ae && el.contains(ae)) { foco = { inp:ae.getAttribute("data-in"), act:ae.getAttribute("data-act"), arg:ae.getAttribute("data-arg"), v:ae.getAttribute("data-v") }; try { foco.ss = ae.selectionStart; foco.se = ae.selectionEnd; } catch (e) {} }
  el.innerHTML = h;
  porClave([...el.querySelectorAll(".sb-wrap,.feed,.twrap")], kScr).forEach(p => { const s = scroll[p[0]]; if (s) { p[1].scrollLeft = s[0]; p[1].scrollTop = s[1]; } });
  porClave([...el.querySelectorAll("details")], kDet).forEach(p => { if (p[0] in abiertos && abiertos[p[0]] !== p[1].open) p[1].open = abiertos[p[0]]; });
  if (foco && (foco.inp || foco.act)) { const q = s => String(s).replace(/["\\]/g, "\\$&"); const selq = (foco.inp ? '[data-in="' + q(foco.inp) + '"]' : '[data-act="' + q(foco.act) + '"]') + (foco.arg ? '[data-arg="' + q(foco.arg) + '"]' : "") + (foco.v ? '[data-v="' + q(foco.v) + '"]' : ""); const x = el.querySelector(selq); if (x && x !== document.activeElement) { try { x.focus({ preventScroll:true }); if (foco.inp && foco.ss != null && x.setSelectionRange) x.setSelectionRange(foco.ss, foco.se); } catch (e) {} } } return true; }
function smartEl(id) { const el = document.getElementById(id); if (!el) return null; if (!_smart[id]) _smart[id] = { get el() { return el; }, get innerHTML() { return el.innerHTML; }, set innerHTML(h) { setHtml(el, h); }, get classList() { return el.classList; }, get textContent() { return el.textContent; }, querySelector: s => el.querySelector(s), querySelectorAll: s => el.querySelectorAll(s) }; return _smart[id]; }
const $ = id => (id === "vista" || id === "top" || id === "appright") ? smartEl(id) : document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const A = {}; BP.actores.forEach(a => { A[a.id] = a; });
const EV = BP.evidencia, CIRC = ["", "①", "②", "③", "④", "⑤"];
const nom = id => id === "modulo" ? "Módulo" : id === "sistema" ? "Sistema" : A[id] ? A[id].corto : (id || "—");
/* ============ Iconografía: identificadores del kit (manifest.json) por concepto ============ */
const ICO = {
  actor:{ tra:"actores-trabajador", emp:"actores-empleador", ips:"actores-ips", eps:"actores-eps", arl:"actores-arl", afp:"actores-afp", jr:"actores-junta-regional", jn:"actores-junta-nacional", mintrabajo:"actores-mintrabajo", minsalud:"actores-minsalud", supersalud:"actores-supersalud", jueces:"actores-jueces", modulo:"actores-modulo" },
  paso:{ A1:"pasos-a1-inicio-incapacidad", A2:"pasos-a2-certificados-prorrogas", A3:"pasos-a3-evidencia-laboral", E1:"pasos-e1-calificacion-origen", E2:"pasos-e2-controversia", E3:"pasos-e3-dictamen", E4:"pasos-e4-apelacion", E5:"pasos-e5-pago", D1:"pasos-d1-reintegro", D2:"pasos-d2-prestacion", D3:"pasos-d3-seguimiento" },
  fase:{ antes:"fases-antes", durante:"fases-durante", despues:"fases-despues" },
  modo:{ actual:"fases-flujo-actual", propuesto:"fases-flujo-propuesto" },
  carril:{ mp:"carriles-acciones-usuario", contacto:"carriles-puntos-contacto", front:"carriles-frontstage", back:"carriles-backstage", soporte:"carriles-soporte" },
  linea:{ contacto:"carriles-linea-interaccion", back:"carriles-linea-visibilidad", soporte:"carriles-linea-interna" },
  ev:{ hc:"documentos-historia-clinica", apt:"documentos-apt", inc:"documentos-incapacidad", hl:"documentos-historial-laboral", dic:"documentos-dictamen" },
  estado:{ pendiente:"estados-pendiente", en_curso:"estados-en-curso", bloqueada:"estados-bloqueado", completada:"estados-completado", completado:"estados-completado", omitida:"acciones-anterior", preparacion:"navegacion-configuracion", pausada:"acciones-pausar", valoracion:"capitulos-validacion-contratos", revision:"administracion-revisar", cerrada:"estados-cerrado", archivada:"acciones-archivar" },
  actividad:{ focal:"carriles-acciones-usuario", decide:"acciones-decidir", custodia:"acciones-entregar", soporte:"carriles-soporte", observador:"acciones-observar" },
  cierre:{ wait:"estados-pendiente", adj:"estados-requiere-ajustes", ready:"estados-listo-revision", ok:"estados-cerrado" },
  sub:{ caracterizacion:"investigacion-sp1-caracterizacion", diseno:"investigacion-sp2-diseno", evaluacion:"investigacion-sp3-evaluacion" },
  tipo:{ actividad:"acciones-decidir", observacion:"acciones-observar", solicitud:"acciones-solicitar", respuesta:"acciones-entregar", consulta:"acciones-consultar", notificacion:"acciones-notificar", acuse:"acciones-confirmar-recepcion", incidencia:"estados-advertencia", inicio_ronda:"acciones-iniciar", cierre_ronda:"acciones-cerrar-sesion", avance:"acciones-siguiente", pausa:"acciones-pausar", reanudacion:"acciones-iniciar", decision_final:"capitulos-decision-avance", archivo:"acciones-archivar", valoracion:"capitulos-validacion-contratos", preguntas:"investigacion-pregunta-investigacion" }
};
// SVG inline decorativo (aria-hidden) salvo que se pase una etiqueta; sz: "sm" 16 px, sin sz 20 px, "lg" 24 px.
function ico(id, sz, label) { if (!id || typeof BPIcons === "undefined" || BPIcons.ids.indexOf(id) < 0) return ""; let s = BPIcons.svg(id, label); if (sz) s = s.replace('class="bp-icon"', 'class="bp-icon bp-icon--' + sz + '"'); return s; }
const icoActor = (id, sz) => ico(ICO.actor[id], sz);
const nomL = id => id === "modulo" ? "Índice + reglas + logs" : A[id] ? A[id].n : nom(id);
const ahora = () => Date.now();
const hora = t => t ? new Date(t).toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" }) : "";
const fecha = t => t ? new Date(t).toLocaleString("es-CO", { dateStyle:"medium", timeStyle:"short" }) : "";
const uid = () => Math.random().toString(36).slice(2, 8) + ahora().toString(36).slice(-4);
const ALFA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; const nuevoCodigo = () => Array.from({ length:4 }, () => ALFA[Math.floor(Math.random() * ALFA.length)]).join("");
const clone = o => JSON.parse(JSON.stringify(o)); const num = v => { const n = parseFloat(v); return isFinite(n) && n >= 0 ? n : 0; };
const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return "h" + (h >>> 0).toString(36); };
const FIN = {}; ESC.finalidades.forEach(f => { FIN[f.id] = f; });

/* ============ LocalDB: misma API mínima que db, en este navegador ============ */
function LocalDB() {
  const PRE = "sbsim_doc_v2:", VIEJA = "sbsim_db_v1", REV = "sbsim_rev_v2"; const subs = [], mem = {};
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const leerDoc = p => { const raw = lsGet(PRE + p); if (raw == null) { delete mem[p]; return undefined; } const m = mem[p]; if (m && m.raw === raw) return m.obj; try { const obj = JSON.parse(raw); mem[p] = { raw, obj }; return obj; } catch (e) { return undefined; } };
  const rutas = () => { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(PRE) === 0) out.push(k.slice(PRE.length)); } } catch (e) {} return out; };
  // Cada escritura toca SOLO la clave de su documento: dos pestañas que guardan a la vez documentos distintos no se pisan.
  const escribirDoc = (p, d) => { try { if (d === undefined) localStorage.removeItem(PRE + p); else localStorage.setItem(PRE + p, JSON.stringify(d)); localStorage.setItem(REV, ahora() + ":" + Math.random()); } catch (e) { throw { code:"quota_exceeded", message:"el almacenamiento de este navegador está lleno" }; } avisar(p); try { bc && bc.postMessage(p); } catch (e) {} };
  // Migración única del formato anterior (un solo objeto). Si el JSON antiguo está dañado se deja intacto para poder recuperarlo.
  try { const v = lsGet(VIEJA); if (v) { const o = JSON.parse(v); if (o && typeof o === "object") { Object.keys(o).forEach(p => { if (lsGet(PRE + p) == null) localStorage.setItem(PRE + p, JSON.stringify(o[p])); }); localStorage.removeItem(VIEJA); } } } catch (e) {}
  const pend = {}; let tPend = null; const programar = p => { pend[p == null ? "*" : p] = 1; if (!tPend) tPend = setTimeout(() => { tPend = null; const ps = Object.keys(pend); ps.forEach(k => delete pend[k]); if (ps.indexOf("*") >= 0) avisar(null); else ps.forEach(avisar); }, 0); };
  let bc = null; try { bc = new BroadcastChannel("sbsim_db_v2"); bc.onmessage = ev => programar(ev.data); } catch (e) {}
  window.addEventListener("storage", ev => { if (ev.key == null) programar(null); else if (ev.key.indexOf(PRE) === 0) programar(ev.key.slice(PRE.length)); });
  let rev = lsGet(REV); setInterval(() => { const r = lsGet(REV); if (r !== rev) avisar(null); }, 3000);
  const meta = { fromCache:false, hasPendingWrites:false };
  const snapDoc = (path) => { const d = leerDoc(path); return { id:path.split("/").pop(), exists:d !== undefined, data:() => d !== undefined ? clone(d) : undefined, metadata:meta }; };
  const hijo = (colPath, p) => p.indexOf(colPath + "/") === 0 && p.slice(colPath.length + 1).indexOf("/") < 0;
  const enCol = (colPath) => rutas().filter(p => hijo(colPath, p)).sort();
  const cmp = (op, a, b) => op === "==" ? a === b : op === "!=" ? a !== b : op === "<" ? a < b : op === "<=" ? a <= b : op === ">" ? a > b : op === ">=" ? a >= b : op === "in" ? (b || []).indexOf(a) >= 0 : false;
  const snapCol = (q) => { let docs = enCol(q.path).map(snapDoc).filter(s => s.exists && q.filters.every(f => cmp(f[1], (s.data() || {})[f[0]], f[2]))); if (q.order) docs.sort((x, y) => { const a = (x.data() || {})[q.order[0]], b = (y.data() || {})[q.order[0]]; const r = a == null ? 1 : b == null ? -1 : a < b ? -1 : a > b ? 1 : 0; return q.order[1] === "desc" ? -r : r; }); if (q.lim) docs = docs.slice(0, q.lim); return { docs, size:docs.length, empty:!docs.length, docChanges:() => [], metadata:meta }; };
  const afecta = (s, p) => p == null || (s.kind === "doc" ? s.path === p : hijo(s.q.path, p));
  function avisar(p) { rev = lsGet(REV); subs.slice().forEach(s => { if (!afecta(s, p)) return; try { s.cb(s.kind === "doc" ? snapDoc(s.path) : snapCol(s.q)); } catch (e) {} }); }
  const suscribir = (s) => { subs.push(s); setTimeout(() => { if (subs.indexOf(s) >= 0) s.cb(s.kind === "doc" ? snapDoc(s.path) : snapCol(s.q)); }, 0); return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); }; };
  const merge = (t, s) => { Object.keys(s).forEach(k => { if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k]) && t[k] && typeof t[k] === "object" && !Array.isArray(t[k])) merge(t[k], s[k]); else t[k] = clone(s[k]); }); };
  const doc = (path) => ({ id:path.split("/").pop(), path, get:async () => snapDoc(path), set:async (data) => { escribirDoc(path, clone(data)); },
    update:async (data) => { const d0 = leerDoc(path); if (d0 === undefined) throw { code:"invalid_argument", message:"no existe" }; const d = clone(d0); merge(d, data); escribirDoc(path, d); },
    delete:async () => { escribirDoc(path, undefined); }, onSnapshot:(cb) => suscribir({ kind:"doc", path, cb }), collection:(sub) => col(path + "/" + sub) });
  const query = (path, filters, order, lim) => ({ path, filters, order, lim, where:(f, op, v) => query(path, filters.concat([[f, op, v]]), order, lim), orderBy:(f, dir) => query(path, filters, [f, dir || "asc"], lim), limit:(n) => query(path, filters, order, n), get:async function () { return snapCol(this); }, onSnapshot:function (cb) { return suscribir({ kind:"col", q:this, cb }); } });
  const col = (path) => Object.assign(query(path, [], null, null), { doc:(id) => doc(path + "/" + (id || uid())), add:async (data) => { const d = doc(path + "/" + uid()); await d.set(data); return d; } });
  return { doc, collection:col, local:true };
}
let DB = null, ROOM = null, DL = null, MODALIDAD = "presencial";
async function initAlmacen() {
  const usar = async (n) => { try { if (window.claude && typeof window.claude.use === "function") return await window.claude.use(n); } catch (e) {} return null; };
  const [db, room, dl] = await Promise.all([usar("db"), usar("room"), usar("downloads")]);
  if (db) { DB = db; MODALIDAD = "compartida"; } else { DB = LocalDB(); MODALIDAD = "presencial"; } ROOM = room; DL = dl;
}
const refSes = c => DB.doc("sesiones/" + c), colPart = c => DB.collection("sesiones/" + c + "/participantes"), colReg = c => DB.collection("sesiones/" + c + "/registros");

/* ============ Pasos del blueprint (fases, carriles) + reglas ============ */
function pasoDurante(e) {
  const c = k => BP.celdas[e.id + k]; const out = { id:e.id, fase:"durante", n:e.n, dia:e.resp + " · " + e.plazo + (e.nota ? " · " + e.nota : "") };
  ["hoy", "mod"].forEach(v => { const f1 = c("F1")[v], f2 = c("F2"), f3 = c("F3"), f4 = c("F4"), f5 = c("F5"); const o = { mp:f1.h, contacto:SB.contactos[e.id][v], front:{ a:f2.a, t:f2[v].h }, back:{ a:f3.a, t:f3[v].h }, soporte:v === "mod" ? { a:"modulo", t:f4[v].h } : { a:f5.a, t:f5[v].h }, otros:{}, ch:[] };
    if (v === "mod") o.otros[f5.a] = f5[v].h; (f2.t || []).forEach(x => { o.otros[x] = o.otros[x] || f2[v].h; }); (f3.t || []).forEach(x => { o.otros[x] = o.otros[x] || f3[v].h; });
    const set = {}; [f1, f2[v], f3[v], f4[v], f5[v]].forEach(x => (x.ch || []).forEach(k => { set[k] = 1; })); o.ch = Object.keys(set).sort().map(k => v === "mod" ? +k : k); out[v] = o; });
  return out;
}
const PASOS = SB.pasos.filter(p => p.fase === "antes").concat(BP.etapas.map(pasoDurante), SB.pasos.filter(p => p.fase === "despues"));
const PIDX = {}; PASOS.forEach((p, i) => { PIDX[p.id] = i; });
const vModo = m => m === "propuesto" ? "mod" : "hoy";
function actoresDe(p, modo) { const o = p[vModo(modo)], m = {}; m.tra = o.mp; [o.front, o.back, o.soporte].forEach(x => { if (x && x.a && !m[x.a]) m[x.a] = x.t; }); Object.keys(o.otros || {}).forEach(k => { if (!m[k]) m[k] = o.otros[k]; }); return m; }
function reglasDe(p, modo) {
  const o = p[vModo(modo)]; const dec = ESC.decisiones[p.id]; const front = dec ? dec.a : o.front.a; const custodios = []; [o.back].forEach(x => { if (x && x.a && A[x.a] && x.a !== front) custodios.push(x.a); }); const sop = o.soporte && o.soporte.a && A[o.soporte.a] ? o.soporte.a : null;
  const extras = dec && dec.extra ? [dec.extra.a] : []; const otros = Object.keys(o.otros || {}).filter(x => A[x] && x !== front && custodios.indexOf(x) < 0 && x !== sop);
  return { front, custodios, soporte:sop, extras, otros, requeridos:["tra", front], entradas:ESC.entradas[p.id] || [], salidas:ESC.salidas[p.id] || [], acciones:{ [front]:["decidir"], tra:["experiencia"] } };
}
function actividadDe(p, actor, modo) {
  const r = reglasDe(p, modo), dec = ESC.decisiones[p.id]; if (!actor) return null;
  if (actor === "tra") return { tipo:"focal", titulo:"Cómo vive M.P. este paso", instr:"Responda desde la experiencia de la trabajadora en este paso. No hay respuestas correctas: se estudia qué sabe y qué le toca hacer.", ejemplo:"Ejemplo: «Sé que algo pasa, no quién responde» y «Llevar documentos»." };
  if (actor === r.front) return { tipo:"decide", titulo:"Decidir en este paso", instr:"Revise la información disponible, declare con qué finalidad la consulta, decida y diga quién responde y en cuántos días. Si falta información, indique cuál.", ejemplo:"Ejemplo: suficiencia «parcial», falta HL; finalidad «" + (FIN[(ESC.finalidades.filter(f => f.actores.indexOf(actor) >= 0)[0] || {}).id] || { n:"la de su contrato" }).n + "»; decisión; responde usted en 10 días.", ops:dec ? dec.ops : [["actuar","Actuar según el contrato"],["esperar","Esperar más información"]] };
  if (dec && dec.extra && dec.extra.a === actor) return { tipo:"decide", titulo:"Decidir en este paso", instr:"Decida como " + nomL(actor) + " y diga con qué finalidad consulta, quién responde y en cuántos días.", ejemplo:"Ejemplo: «Apelar el dictamen» · responde usted · 10 días.", ops:dec.extra.ops };
  const haySolicitud = S && S.ses && regsDe({ ronda:S.ses.rondaActual, paso:p.id, tipo:"solicitud" }).some(x => x.payload && x.payload.a === actor);
  if (r.custodios.indexOf(actor) >= 0 || haySolicitud) return { tipo:"custodia", titulo:"Responder una solicitud de evidencia", instr:"Alguien pidió evidencia que usted custodia. Decida qué entrega y cuánto tarda. Con el módulo, revise lo que el módulo ya entregó por finalidad.", ejemplo:"Ejemplo: «Entregar solo los campos pertinentes a la finalidad» · 3 días." };
  if (actor === r.soporte || r.otros.indexOf(actor) >= 0) return { tipo:"soporte", titulo:"Vigilar o apoyar este paso", instr:"Diga qué alcanza a ver de este caso desde su entidad y qué acción tomaría.", ejemplo:"Ejemplo: «Veo algo, sin plazos» · «Requerir información»." };
  return { tipo:"observador", titulo:"Este paso no le corresponde", instr:"Puede dejar una observación sobre lo que ve y esperar al siguiente paso.", ejemplo:"" };
}

