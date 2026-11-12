/* ============ Panel del investigador: proyecto, almacenamiento, cuentas, configuración y respuestas ============ */

/* ---------- Constantes ---------- */
const ADM_LLAVE = "simasinc-admin:v1";              // índice: huella de la clave de administración y lista de estudios
const ADM_LLAVE_RESP = ADM_LLAVE + ":respuestas";   // formato anterior, de un solo estudio: se migra al abrir
const ADM_LLAVE_ABIERTO = ADM_LLAVE + ":abierto";   // desbloqueo de esta pestaña (sessionStorage)
// Cada estudio (una sesión de simulación con sus participantes) se guarda aparte, bajo una llave interna estable
// que no cambia aunque el investigador cambie el identificador público del estudio.
const llaveProy = c => ADM_LLAVE + ":p:" + c;
const llaveResp = c => ADM_LLAVE + ":r:" + c;
const claveEstudioNueva = () => "e" + hex(azar(5));
const RE_CLAVE_EST = /^e[0-9a-f]{10}$/;
const TIPO_COPIA = "copia_seguridad_panel", TIPO_PAQUETE = "paquete_respuestas";
const ROLES = BP.actores.map(a => a.id);
const PREFIJO_ROL = { tra:"trabajador", emp:"empleador", ips:"ips", eps:"eps", arl:"arl", afp:"afp", jr:"juntaregional", jn:"juntanacional", mintrabajo:"mintrabajo", minsalud:"minsalud", supersalud:"supersalud", jueces:"jueces" };
const ALFABETO_CLAVE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";   // sin letras ni cifras que se confunden al dictar
const CAMPOS_ESTUDIO = ["id", "titulo", "subtitulo", "programa", "institucion", "investigador", "director", "contacto", "comite", "cierre"];
const LARGO_ESTUDIO = { id:40, titulo:160, subtitulo:240, programa:120, institucion:120, investigador:120, director:120, contacto:160, comite:240, cierre:80 };
const LLAVES_INVITACION = ["url", "usuario", "clave", "rol", "minutos", "titulo", "investigador", "contacto", "cierre"];
const RE_CLAVE_SERVIDOR = /^[0-9a-f]{32,64}$/;
const MAX_ARCHIVO = 60 * 1024 * 1024, MAX_REGISTROS = 5000;
// Las líneas que dependen de un dato que el investigador dejó vacío se omiten al armar cada invitación.
const INVITACION_BASE = [
  "Cordial saludo.",
  "",
  "Le invito a participar en el estudio «{titulo}». Es una simulación individual con un caso sintético: usted representa el rol «{rol}» y responde desde su experiencia. Le tomará unos {minutos} minutos y puede hacerla en varias sesiones.",
  "",
  "Dónde entrar: {url}",
  "Usuario: {usuario}",
  "Contraseña: {clave}",
  "",
  "Participar es voluntario. El caso es sintético: no se le pedirá información de personas reales.",
  "Fecha límite para participar: {cierre}",
  "Investigador responsable: {investigador}",
  "Si tiene preguntas, escriba a: {contacto}",
  "",
  "Gracias por su tiempo."
].join("\n");

/* ---------- Ayudas ---------- */
const esPropia = (o, k) => typeof k === "string" && Object.prototype.hasOwnProperty.call(o, k);
const esObjeto = v => !!v && typeof v === "object" && !Array.isArray(v);
const esRol = a => esPropia(A, a);
const esPaso = id => esPropia(PIDX, id);
const mapaVacio = () => Object.create(null);
const evSigla = k => (esPropia(EV, k) ? EV[k].sl : String(k));
const finNombre = id => (esPropia(FIN, id) ? FIN[id].n : id ? String(id) : "sin declarar");
const fechaIso = t => { const n = Date.parse(t); return isNaN(n) ? 0 : n; };
// JSON que puede ir dentro de una etiqueta de código sin cerrarla: el signo menor se escribe como secuencia \u.
const jsonEnScript = t => t.replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

/* ---------- Estado ---------- */
function proyectoNuevo() {
  const estudio = {}; CAMPOS_ESTUDIO.forEach(k => { estudio[k] = String(GUION.estudio[k] || ""); });
  return {
    v:1, clave:claveEstudioNueva(), creado:ahora(), modificado:0,
    estudio, consentimiento:{ version:String(GUION.consentimiento.version || "1"), adicional:"" },
    url:"",                                   // dirección pública del simulador, para las invitaciones
    entrega:{ forma:"archivo", url:"recibir.php", modo:"progresivo", clave:"", claveAdmin:"" },
    cuentas:[],                               // { u, a, etiqueta, clave, s, p, creada, h, hd }
    invitacion:INVITACION_BASE, incluirPruebas:false,
    config:null,                              // { firma, generado }: última configuración generada
    publicado:null,                           // { firma, generado, id, config, unico }: última configuración descargada
    receptorPublicado:null                    // { firma, t }: último recibir-config.php descargado
  };
}
const uiInicial = () => ({
  abierto:false,                              // panel desbloqueado en esta pestaña
  acceso:{ c1:"", c2:"", ver:false, pendiente:null },   // pendiente: copia de seguridad leída, a la espera de la clave
  vista:"estudio", ficha:null, fichaDesde:"seguimiento",
  dialogo:null,                               // { id, arg, texto, error, vuelve }
  verClave:mapaVacio(), verTodas:false,       // contraseñas a la vista
  alta:{ rol:ROLES[0], n:"1" },               // formulario para añadir cuentas
  nuevoEstudio:"",                            // título de la sesión que se va a crear
  cambio:{ actual:"", c1:"", c2:"" },         // cambio de la clave de administración
  importe:null,                               // resultado de la última importación
  servidor:null,                              // { estado, texto, formulario }: «Traer del servidor»
  prueba:null,                                // { estado, texto }: «Probar el receptor»
  unico:null,                                 // { estado, texto, pedir }: simulador de archivo único
  foco:"",                                    // selector que debe recibir el foco después de pintar
  msg:"", msgErr:false
});
let PROY = proyectoNuevo();   // proyecto en edición
let RESP = [];                // respuestas importadas: { doc, importado, origen, archivo, recibido, excluida, ausente }
let ADMIN = null;             // { sal, huella, iter, sesion }: huella de la clave de administración; nunca se exporta
let UI = uiInicial();
let almacenDanado = false, falloGuardar = "";   // "", "proyecto" o "respuestas": el último intento de guardar no se pudo hacer

/* ---------- Almacenamiento en este navegador ---------- */
const ADM_ALM = (() => {
  const sirve = s => { try { s.setItem(ADM_LLAVE + ":prueba", "1"); s.removeItem(ADM_LLAVE + ":prueba"); return true; } catch (e) { return false; } };
  let local = null, sesion = null;
  try { if (sirve(window.localStorage)) local = window.localStorage; } catch (e) {}
  try { if (sirve(window.sessionStorage)) sesion = window.sessionStorage; } catch (e) {}
  return { local, sesion };
})();
// Índice de estudios: { v, admin, actual, estudios:[{ clave, id, titulo, creado, modificado, cuentas, respuestas, completas }] }
let IDX = { v:1, actual:"", estudios:[] };
const fichaEstudio = () => ({ clave:PROY.clave, id:PROY.estudio.id, titulo:estudioEfectivo().titulo, creado:PROY.creado, modificado:PROY.modificado, cuentas:PROY.cuentas.length, respuestas:RESP.length, completas:RESP.filter(e => e.doc.estado === "completa").length });
function guardarIndice() {
  if (!ADM_ALM.local || !ADMIN) return false;
  try { ADM_ALM.local.setItem(ADM_LLAVE, JSON.stringify({ v:1, admin:ADMIN, actual:IDX.actual, estudios:IDX.estudios })); return true; }
  catch (e) { falloGuardar = "proyecto"; return false; }
}
// Actualiza en el índice la ficha del estudio abierto.
function anotarEnIndice() {
  if (!PROY.clave) PROY.clave = claveEstudioNueva();
  const f = fichaEstudio(), i = IDX.estudios.map(x => x.clave).indexOf(PROY.clave);
  if (i < 0) IDX.estudios.push(f); else IDX.estudios[i] = f;
  IDX.actual = PROY.clave;
}
function guardarProyecto() {
  clearTimeout(guardarProyecto.t);
  if (!ADMIN) return false;
  PROY.modificado = ahora();
  if (!ADM_ALM.local) return false;
  try { ADM_ALM.local.setItem(llaveProy(PROY.clave), JSON.stringify({ v:1, proyecto:PROY })); anotarEnIndice(); guardarIndice(); if (falloGuardar === "proyecto") falloGuardar = ""; return true; }
  catch (e) { falloGuardar = "proyecto"; return false; }
}
// Guardado automático mientras se escribe: espera a una pausa corta.
function guardarPronto() { clearTimeout(guardarProyecto.t); guardarProyecto.t = setTimeout(() => { guardarProyecto(); render(); }, 600); }
const entradaGuardable = e => ({ doc:e.doc, importado:e.importado, origen:e.origen, archivo:e.archivo, recibido:e.recibido || null, excluida:!!e.excluida, ausente:e.ausente || null });
function guardarRespuestas() {
  if (!ADMIN || !ADM_ALM.local) return false;
  try { ADM_ALM.local.setItem(llaveResp(PROY.clave), JSON.stringify({ v:1, t:ahora(), respuestas:RESP.map(entradaGuardable) })); anotarEnIndice(); guardarIndice(); if (falloGuardar === "respuestas") falloGuardar = ""; return true; }
  catch (e) { falloGuardar = "respuestas"; return false; }
}
// Lee de su llave el proyecto y las respuestas de un estudio. Devuelve { proyecto, respuestas } o null.
function leerEstudio(clave) {
  if (!ADM_ALM.local || !RE_CLAVE_EST.test(String(clave || ""))) return null;
  let j = null; try { j = JSON.parse(ADM_ALM.local.getItem(llaveProy(clave)) || "null"); } catch (e) {}
  if (!esObjeto(j) || !esObjeto(j.proyecto)) return null;
  const proyecto = normalizarProyecto(j.proyecto, true).proyecto;
  proyecto.clave = clave;
  let r = null; try { r = JSON.parse(ADM_ALM.local.getItem(llaveResp(clave)) || "null"); } catch (e) {}
  return { proyecto, respuestas:leerEntradas(r && Array.isArray(r.respuestas) ? r.respuestas : []).entradas };
}
function borrarEstudioGuardado(clave) {
  try { if (ADM_ALM.local) { ADM_ALM.local.removeItem(llaveProy(clave)); ADM_ALM.local.removeItem(llaveResp(clave)); } } catch (e) {}
  IDX.estudios = IDX.estudios.filter(x => x.clave !== clave);
}
// Lee lo guardado. Devuelve { admin, proyecto, respuestas, descartadas } o null si no hay proyecto.
// Lee el índice y el estudio abierto. Migra el formato anterior, que guardaba un solo estudio.
function leerAlmacen() {
  almacenDanado = false;
  if (!ADM_ALM.local) return null;
  let crudo = null; try { crudo = ADM_ALM.local.getItem(ADM_LLAVE); } catch (e) {}
  if (!crudo) return null;
  let j = null; try { j = JSON.parse(crudo); } catch (e) {}
  const a = j && j.admin;
  if (!j || j.v !== 1 || !esObjeto(a) || !/^[0-9a-f]{64}$/.test(String(a.huella || "")) || !/^[0-9a-f]{8,64}$/.test(String(a.sal || ""))) { almacenDanado = true; return null; }
  const admin = { sal:a.sal, huella:a.huella, iter:parseInt(a.iter, 10) > 0 ? parseInt(a.iter, 10) : KDF.iter, sesion:/^[0-9a-f]{64}$/.test(String(a.sesion || "")) ? a.sesion : "" };
  // Formato anterior: un único proyecto dentro del índice.
  if (esObjeto(j.proyecto)) {
    const proyecto = normalizarProyecto(j.proyecto, true).proyecto;
    if (!RE_CLAVE_EST.test(String(proyecto.clave || ""))) proyecto.clave = claveEstudioNueva();
    let r = null; try { r = JSON.parse(ADM_ALM.local.getItem(ADM_LLAVE_RESP) || "null"); } catch (e) {}
    const respuestas = leerEntradas(r && Array.isArray(r.respuestas) ? r.respuestas : []).entradas;
    return { admin, indice:{ v:1, actual:proyecto.clave, estudios:[] }, proyecto, respuestas, migrado:true };
  }
  const fichas = (Array.isArray(j.estudios) ? j.estudios : []).map(x => esObjeto(x) && RE_CLAVE_EST.test(String(x.clave || "")) ? { clave:x.clave, id:textoLimpio(x.id, 40), titulo:textoLimpio(x.titulo, 160), creado:+x.creado || 0, modificado:+x.modificado || 0, cuentas:+x.cuentas || 0, respuestas:+x.respuestas || 0, completas:+x.completas || 0 } : null).filter(Boolean);
  const indice = { v:1, actual:RE_CLAVE_EST.test(String(j.actual || "")) ? j.actual : (fichas[0] || {}).clave || "", estudios:fichas };
  const est = indice.actual ? leerEstudio(indice.actual) : null;
  if (!est && fichas.length) { const otro = fichas.map(f => leerEstudio(f.clave)).filter(Boolean)[0]; if (otro) { indice.actual = otro.proyecto.clave; return { admin, indice, proyecto:otro.proyecto, respuestas:otro.respuestas }; } }
  return { admin, indice, proyecto:est ? est.proyecto : proyectoNuevo(), respuestas:est ? est.respuestas : [] };
}
// Entradas guardadas o de una copia de seguridad: cada documento se valida otra vez antes de aceptarlo.
function leerEntradas(lista) {
  const entradas = [], porId = mapaVacio(); let descartadas = 0;
  lista.forEach(x => {
    const doc = esObjeto(x) ? (x.doc || x.documento) : null;
    if (!esObjeto(doc) || validarRespuesta(doc).length || estructuraRespuesta(doc).length) { descartadas++; return; }
    const e = { doc, importado:typeof x.importado === "number" ? x.importado : ahora(), origen:x.origen === "servidor" ? "servidor" : "archivo", archivo:textoLimpio(x.archivo, 160), recibido:typeof x.recibido === "string" ? textoLimpio(x.recibido, 40) : null, excluida:x.excluida === true, ausente:typeof x.ausente === "number" ? x.ausente : null };
    const previo = porId[doc.participante.id];
    if (previo && fechaIso(previo.doc.generado) >= fechaIso(doc.generado)) return;
    if (previo) entradas.splice(entradas.indexOf(previo), 1);
    porId[doc.participante.id] = e; entradas.push(e);
  });
  return { entradas, descartadas };
}
function normalizarCuenta(q, deConfianza) {
  if (!esObjeto(q)) return null;
  const u = normUsuario(q.u), clave = textoLimpio(q.clave, 60).trim();
  if (!RE_ID.test(u) || !esRol(q.a) || normClave(clave).length < 4) return null;
  const c = { u, a:q.a, etiqueta:textoLimpio(q.etiqueta, 160), clave, s:/^[0-9a-f]{8,64}$/.test(String(q.s || "")) ? q.s : hex(azar(8)), p:q.p === true, creada:typeof q.creada === "number" ? q.creada : ahora() };
  if (deConfianza && /^[0-9a-f]{64}$/.test(String(q.h || "")) && typeof q.hd === "string") { c.h = q.h; c.hd = q.hd; }
  return c;
}
// Completa y limpia un proyecto leído del almacenamiento o de una copia de seguridad (que es un archivo no confiable).
function normalizarProyecto(p, deConfianza) {
  const base = proyectoNuevo(), avisos = [];
  if (!esObjeto(p)) return { proyecto:base, avisos:["no trae los datos del proyecto"] };
  const e = esObjeto(p.estudio) ? p.estudio : {};
  CAMPOS_ESTUDIO.forEach(k => { if (e[k] != null) base.estudio[k] = textoLimpio(e[k], LARGO_ESTUDIO[k]); });
  if (esObjeto(p.consentimiento)) { base.consentimiento.version = textoLimpio(p.consentimiento.version, 20) || base.consentimiento.version; base.consentimiento.adicional = textoLimpio(p.consentimiento.adicional, 2000); }
  base.url = textoLimpio(p.url, 300);
  const en = esObjeto(p.entrega) ? p.entrega : {};
  base.entrega = { forma:en.forma === "servidor" ? "servidor" : "archivo", url:textoLimpio(en.url, 300) || "recibir.php", modo:en.modo === "final" ? "final" : "progresivo", clave:RE_CLAVE_SERVIDOR.test(String(en.clave || "")) ? en.clave : "", claveAdmin:RE_CLAVE_SERVIDOR.test(String(en.claveAdmin || "")) ? en.claveAdmin : "" };
  const vistos = mapaVacio(); let malas = 0;
  (Array.isArray(p.cuentas) ? p.cuentas : []).forEach(q => { const c = normalizarCuenta(q, deConfianza); if (!c || vistos[c.u]) { malas++; return; } vistos[c.u] = 1; base.cuentas.push(c); });
  if (malas) avisos.push(plural(malas, "cuenta no se pudo leer y se omitió", "cuentas no se pudieron leer y se omitieron"));
  if (typeof p.invitacion === "string" && p.invitacion.trim()) base.invitacion = textoLimpio(p.invitacion, 4000);
  base.incluirPruebas = p.incluirPruebas === true;
  if (typeof p.creado === "number") base.creado = p.creado;
  if (typeof p.modificado === "number") base.modificado = p.modificado;
  const firma = x => esObjeto(x) && /^[0-9a-f]{64}$/.test(String(x.firma || ""));
  if (firma(p.config) && fechaIso(p.config.generado)) base.config = { firma:p.config.firma, generado:String(p.config.generado) };
  if (firma(p.publicado) && fechaIso(p.publicado.generado)) base.publicado = { firma:p.publicado.firma, generado:String(p.publicado.generado), id:textoLimpio(p.publicado.id, 40), config:+p.publicado.config || 0, unico:+p.publicado.unico || 0 };
  if (deConfianza && firma(p.receptorPublicado)) base.receptorPublicado = { firma:p.receptorPublicado.firma, t:+p.receptorPublicado.t || 0 };
  ordenarCuentas(base.cuentas);
  return { proyecto:base, avisos };
}

/* ---------- Clave de administración ----------
   Protege la entrada al panel en este navegador. No cifra lo guardado: quien tenga acceso al equipo puede leerlo. */
function definirClaveAdmin(c1, c2) {
  if (normClave(c1).length < 8) return "La clave debe tener al menos 8 caracteres, sin contar espacios ni guiones.";
  if (normClave(c1) !== normClave(c2)) return "Las dos claves no coinciden.";
  const sal = hex(azar(8));
  // La ficha de sesión se deriva de la clave: con solo leer lo guardado no se puede fabricar un desbloqueo.
  ADMIN = { sal, huella:huellaClave("admin", c1, sal, KDF.iter), iter:KDF.iter, sesion:SHA.hex(fichaSesion(c1, sal, KDF.iter)) };
  return "";
}
const fichaSesion = (clave, sal, iter) => huellaClave("admin", clave, sal + ":sesion", iter);
const claveAdminCorrecta = c => !!ADMIN && igualSeguro(huellaClave("admin", c, ADMIN.sal, ADMIN.iter), ADMIN.huella);
function recordarDesbloqueo(clave) {
  try { if (clave == null) ADM_ALM.sesion.removeItem(ADM_LLAVE_ABIERTO); else ADM_ALM.sesion.setItem(ADM_LLAVE_ABIERTO, fichaSesion(clave, ADMIN.sal, ADMIN.iter)); } catch (e) {}
}
function desbloqueoRecordado() {
  try { const f = ADM_ALM.sesion.getItem(ADM_LLAVE_ABIERTO); return !!(ADMIN && ADMIN.sesion && f && igualSeguro(SHA.hex(f), ADMIN.sesion)); } catch (e) { return false; }
}
// Carga lo guardado en este navegador. Devuelve true si había un proyecto.
function cargarDeAlmacen() {
  const st = leerAlmacen();
  if (!st) { ADMIN = null; IDX = { v:1, actual:"", estudios:[] }; PROY = proyectoNuevo(); RESP = []; return false; }
  ADMIN = st.admin; IDX = st.indice; PROY = st.proyecto; RESP = st.respuestas;
  if (st.migrado) { guardarProyecto(); guardarRespuestas(); try { ADM_ALM.local.removeItem(ADM_LLAVE_RESP); } catch (e) {} }
  else anotarEnIndice();
  return true;
}
// Borra todo lo del panel en este navegador: el índice y todos los estudios.
function borrarProyecto() {
  clearTimeout(guardarProyecto.t);
  try {
    if (ADM_ALM.local) {
      IDX.estudios.forEach(f => { ADM_ALM.local.removeItem(llaveProy(f.clave)); ADM_ALM.local.removeItem(llaveResp(f.clave)); });
      ADM_ALM.local.removeItem(llaveProy(PROY.clave)); ADM_ALM.local.removeItem(llaveResp(PROY.clave));
      ADM_ALM.local.removeItem(ADM_LLAVE); ADM_ALM.local.removeItem(ADM_LLAVE_RESP);
    }
  } catch (e) {}
  try { if (ADM_ALM.sesion) ADM_ALM.sesion.removeItem(ADM_LLAVE_ABIERTO); } catch (e) {}
  ADMIN = null; IDX = { v:1, actual:"", estudios:[] }; PROY = proyectoNuevo(); RESP = []; UI = uiInicial(); almacenDanado = false; falloGuardar = "";
}

/* ---------- Varios estudios (sesiones de simulación) ----------
   Cada estudio guarda sus cuentas y las respuestas de sus participantes por separado. El identificador público
   del estudio (estudio.id) es el que viaja en la configuración y en cada respuesta: por él se sabe a qué estudio
   pertenece un archivo que llega. */
const estudiosGuardados = () => IDX.estudios.slice().sort((a, b) => (b.modificado || b.creado || 0) - (a.modificado || a.creado || 0));
const fichaDeClave = c => IDX.estudios.filter(x => x.clave === c)[0] || null;
// Estudio guardado cuyo identificador público coincide con el de un documento que llega.
const estudioConId = id => IDX.estudios.filter(x => x.id && x.id === id)[0] || null;
function abrirEstudio(clave) {
  if (clave === PROY.clave) return true;
  const est = leerEstudio(clave);
  if (!est) return false;
  guardarProyecto(); guardarRespuestas();
  PROY = est.proyecto; RESP = est.respuestas; IDX.actual = clave;
  memoSeguimiento.clear(); guardarIndice();
  if (PROY.entrega.forma === "servidor") prepararEntrega();
  return true;
}
// Crea un estudio nuevo. Con `desde` copia el estudio indicado: sus datos y sus cuentas, nunca sus respuestas.
function crearEstudio(titulo, desde) {
  guardarProyecto(); guardarRespuestas();
  const copia = desde ? leerEstudio(desde) : null;
  const p = copia ? copia.proyecto : proyectoNuevo();
  p.clave = claveEstudioNueva(); p.creado = ahora(); p.modificado = 0;
  p.config = null; p.publicado = null; p.receptorPublicado = null;
  if (copia) {
    p.estudio.id = idLibre(p.estudio.id || "estudio");
    p.cuentas.forEach(q => { q.clave = claveNueva(); q.s = hex(azar(8)); delete q.h; delete q.hd; q.creada = ahora(); });
    if (p.entrega.forma === "servidor") { p.entrega.clave = claveServidorNueva(); p.entrega.claveAdmin = claveServidorNueva(); }
  } else p.estudio.id = idLibre(GUION.estudio.id || "estudio");
  if (String(titulo || "").trim()) p.estudio.titulo = textoLimpio(titulo, 160);
  PROY = p; RESP = []; memoSeguimiento.clear();
  guardarProyecto(); guardarRespuestas();
  return p;
}
// Identificador público libre: si ya hay un estudio con ese id, se numera.
function idLibre(base) {
  const raiz = String(base || "estudio").replace(/-\d+$/, "") || "estudio";
  if (!estudioConId(raiz)) return raiz;
  for (let i = 2; i < 100; i++) { const c = raiz + "-" + i; if (!estudioConId(c)) return c; }
  return raiz + "-" + hex(azar(2));
}
function eliminarEstudio(clave) {
  const f = fichaDeClave(clave); if (!f) return false;
  if (clave === PROY.clave) {
    borrarEstudioGuardado(clave);
    const otra = (estudiosGuardados()[0] || {}).clave;
    if (otra && abrirEstudioForzado(otra)) { guardarIndice(); return true; }
    PROY = proyectoNuevo(); RESP = []; memoSeguimiento.clear(); guardarProyecto(); guardarRespuestas();
    return true;
  }
  borrarEstudioGuardado(clave); guardarIndice();
  return true;
}
function abrirEstudioForzado(clave) {
  const est = leerEstudio(clave); if (!est) return false;
  PROY = est.proyecto; RESP = est.respuestas; IDX.actual = clave; memoSeguimiento.clear();
  return true;
}

/* ---------- Estudio ---------- */
// Datos del estudio como los verá el participante: lo que quede vacío toma el valor del guion.
function estudioEfectivo() {
  const e = Object.assign({}, GUION.estudio);
  CAMPOS_ESTUDIO.forEach(k => { const v = String(PROY.estudio[k] == null ? "" : PROY.estudio[k]).trim(); if (v) e[k] = v; });
  return e;
}
const idEstudioValido = () => RE_ID.test(String(PROY.estudio.id || ""));
// Dirección pública del simulador: solo se acepta http o https.
function urlPublica() {
  const t = String(PROY.url || "").trim(); if (!t) return "";
  try { const u = new URL(t); return /^https?:$/.test(u.protocol) ? u.href.split("#")[0] : ""; } catch (e) { return ""; }
}
const urlInvalida = () => !!String(PROY.url || "").trim() && !urlPublica();
const claveServidorNueva = () => hex(azar(16));
// Al elegir la entrega por servidor se generan las dos claves: así nunca queda una sin definir.
function prepararEntrega() {
  const en = PROY.entrega;
  if (en.forma !== "servidor") return;
  if (!RE_CLAVE_SERVIDOR.test(en.clave)) en.clave = claveServidorNueva();
  if (!RE_CLAVE_SERVIDOR.test(en.claveAdmin)) en.claveAdmin = claveServidorNueva();
  if (!String(en.url || "").trim()) en.url = "recibir.php";
}
// Dirección completa del receptor: se resuelve frente a la dirección pública del simulador o, si el panel está en el sitio, frente a esta página.
function urlReceptor() {
  const dir = String(PROY.entrega.url || "").trim() || "recibir.php", base = urlPublica() || (/^https?:$/.test(location.protocol) ? location.href : "");
  try { const u = base ? new URL(dir, base) : new URL(dir); return /^https?:$/.test(u.protocol) ? u.href : ""; } catch (e) { return ""; }
}

/* ---------- Cuentas ---------- */
const cuentaDe = u => PROY.cuentas.filter(q => q.u === u)[0] || null;
function ordenarCuentas(lista) { (lista || PROY.cuentas).sort((x, y) => ROLES.indexOf(x.a) - ROLES.indexOf(y.a) || (x.u < y.u ? -1 : x.u > y.u ? 1 : 0)); }
// Usuario automático: prefijo del rol y consecutivo de dos cifras que no esté en uso ni en las cuentas ni en las respuestas.
function usuarioLibre(rol) {
  const pre = PREFIJO_ROL[rol] || rol, usados = mapaVacio();
  PROY.cuentas.forEach(q => { usados[q.u] = 1; }); RESP.forEach(e => { usados[e.doc.cuenta.usuario] = 1; });
  for (let i = 1; i < 1000; i++) { const u = pre + "-" + String(i).padStart(2, "0"); if (!usados[u]) return u; }
  return pre + "-" + uid();
}
// Contraseña en dos grupos de cuatro con el alfabeto del contrato; se descartan los bytes que sesgarían el sorteo.
function claveNueva() {
  let s = "";
  while (s.length < 8) { const b = azar(16); for (let i = 0; i < b.length && s.length < 8; i++) if (b[i] < 248) s += ALFABETO_CLAVE[b[i] % ALFABETO_CLAVE.length]; }
  return s.slice(0, 4) + "-" + s.slice(4);
}
function crearCuenta(rol) {
  if (!esRol(rol)) return null;
  const q = { u:usuarioLibre(rol), a:rol, etiqueta:"", clave:claveNueva(), s:hex(azar(8)), p:false, creada:ahora() };
  PROY.cuentas.push(q); ordenarCuentas();
  return q;
}
const rolesSinCuenta = () => ROLES.filter(a => !PROY.cuentas.some(q => q.a === a));
function crearPorRol(soloFaltantes) { const roles = soloFaltantes ? rolesSinCuenta() : ROLES; roles.forEach(crearCuenta); return roles.length; }
function renombrarCuenta(u, nuevo) {
  const q = cuentaDe(u), n = normUsuario(nuevo);
  if (!q) return "La cuenta ya no existe.";
  if (n === u) return "";
  if (!RE_ID.test(n)) return "El usuario solo admite minúsculas, números, puntos y guiones, hasta 40 caracteres, y empieza por letra o número.";
  if (cuentaDe(n)) return "Ya hay una cuenta con el usuario «" + n + "».";
  if (respuestasDeCuenta(u).length) return "Esta cuenta ya tiene respuestas importadas: no se le puede cambiar el usuario.";
  if (RESP.some(e => e.doc.cuenta.usuario === n)) return "Hay respuestas importadas con el usuario «" + n + "»: elija otro.";
  q.u = n; delete q.h; delete q.hd; ordenarCuentas();
  if (UI.verClave[u]) { delete UI.verClave[u]; UI.verClave[n] = true; }
  return "";
}
function regenerarClave(u) { const q = cuentaDe(u); if (!q) return false; q.clave = claveNueva(); q.s = hex(azar(8)); delete q.h; delete q.hd; return true; }
function eliminarCuenta(u) {
  if (respuestasDeCuenta(u).length) return "La cuenta tiene respuestas importadas: no se puede eliminar.";
  PROY.cuentas = PROY.cuentas.filter(q => q.u !== u); delete UI.verClave[u];
  return "";
}
const enlaceCuenta = q => (urlPublica() || "index.html") + "#u=" + encodeURIComponent(q.u);
// Igual que minutosEstimados() del simulador: duración que se informa al participante según su rol.
function minutosDeRol(actor) {
  const T = GUION.tiempos; let m = T.inicio + T.cierre;
  ESC.rondas.forEach(r => { bloquesDe(actor, r.modo).forEach(b => { m += b.tipo === "contexto" ? T.contexto * b.pasos.length : T[b.act.tipo]; }); m += T.valoracion; });
  return Math.max(10, Math.round(m / 5) * 5);
}
function textoInvitacion(q) {
  const e = estudioEfectivo();
  const v = { url:urlPublica() ? enlaceCuenta(q) : "abra el archivo del simulador que acompaña este mensaje", usuario:q.u, clave:q.clave, rol:nomL(q.a), minutos:String(minutosDeRol(q.a)), titulo:e.titulo, investigador:e.investigador, contacto:e.contacto, cierre:e.cierre };
  const llaves = l => (l.match(/\{(\w+)\}/g) || []).map(x => x.slice(1, -1)).filter(k => esPropia(v, k));
  return String(PROY.invitacion || INVITACION_BASE).split("\n")
    .filter(l => { const ks = llaves(l); return !ks.length || ks.some(k => String(v[k]).trim()); })
    .map(l => l.replace(/\{(\w+)\}/g, (m, k) => (esPropia(v, k) ? v[k] : m))).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function cuentasCsv() {
  const conUrl = !!urlPublica();
  return csvTabla(["Usuario", "Rol", "Para quién es", "Contraseña", "Enlace", "Cuenta de prueba"], PROY.cuentas.map(q => [q.u, nomL(q.a), q.etiqueta, q.clave, conUrl ? enlaceCuenta(q) : "", q.p ? "sí" : "no"]));
}

/* ---------- Configuración publicada ---------- */
function estudioPublicable() { const e = {}; CAMPOS_ESTUDIO.forEach(k => { e[k] = String(PROY.estudio[k] == null ? "" : PROY.estudio[k]).trim(); }); return e; }
const consentimientoPublicable = () => ({ version:String(PROY.consentimiento.version || "").trim() || String(GUION.consentimiento.version || "1"), adicional:String(PROY.consentimiento.adicional || "").trim() });
function envioPublicable(completa) {
  const en = PROY.entrega; if (en.forma !== "servidor") return null;
  return { url:completa ? urlReceptor() : (String(en.url || "").trim() || "recibir.php"), clave:en.clave, modo:en.modo === "final" ? "final" : "progresivo" };
}
// Huella de todo lo que entra en la configuración: si cambia, lo publicado quedó desactualizado.
function firmaPublicable() {
  return SHA.hex(canonico({ estudio:estudioPublicable(), consentimiento:consentimientoPublicable(), envio:envioPublicable(false), cuentas:PROY.cuentas.map(q => [q.u, q.a, q.s, normClave(q.clave), !!q.p]) }));
}
const firmaReceptor = () => SHA.hex(PROY.entrega.clave + "\n" + PROY.entrega.claveAdmin);
// La huella de cada contraseña tarda: se calcula una sola vez por cuenta y se recuerda mientras no cambien sus datos.
async function huellasDeCuentas(progreso) {
  const out = [];
  for (let i = 0; i < PROY.cuentas.length; i++) {
    const q = PROY.cuentas[i], hd = SHA.hex(q.u + "\n" + normClave(q.clave) + "\n" + q.s + "\n" + KDF.iter).slice(0, 16);
    if (q.hd !== hd || !/^[0-9a-f]{64}$/.test(String(q.h || ""))) {
      if (progreso) progreso(i + 1, PROY.cuentas.length);
      await new Promise(r => setTimeout(r, 0));
      q.h = huellaClave(q.u, q.clave, q.s, KDF.iter); q.hd = hd;
    }
    out.push(q.h);
  }
  return out;
}
// Lo que impide publicar. Lista vacía si se puede.
function impedimentosPublicar() {
  const p = [];
  if (!idEstudioValido()) p.push("El identificador del estudio no es válido.");
  if (!PROY.cuentas.length) p.push("No hay cuentas de participantes.");
  if (PROY.entrega.forma === "servidor" && !RE_CLAVE_SERVIDOR.test(PROY.entrega.clave)) p.push("Falta la clave de envío del receptor.");
  return p;
}
// Arma la configuración (apartado 5 del contrato). `completa` escribe la dirección completa del receptor: la necesita el simulador de archivo único.
async function configPublicable(completa, progreso) {
  const firma = firmaPublicable(), hs = await huellasDeCuentas(progreso);
  if (!PROY.config || PROY.config.firma !== firma) PROY.config = { firma, generado:new Date().toISOString() };
  return {
    formato:FORMATO, estudio:estudioPublicable(), consentimiento:consentimientoPublicable(), kdf:{ alg:KDF.alg, iter:KDF.iter }, envio:envioPublicable(completa),
    cuentas:PROY.cuentas.map((q, i) => { const c = { u:q.u, a:q.a, s:q.s, h:hs[i] }; if (q.p) c.p = true; return c; }),
    generado:PROY.config.generado
  };
}
function anotarPublicado(cual) {
  const firma = firmaPublicable();
  if (!PROY.publicado || PROY.publicado.firma !== firma) PROY.publicado = { firma, generado:PROY.config.generado, id:PROY.estudio.id, config:0, unico:0 };
  PROY.publicado[cual] = ahora();
}
const configDesactualizada = () => !!PROY.publicado && PROY.publicado.firma !== firmaPublicable();
const textoConfiguracion = cfg => "/* Configuración del estudio. La genera el panel del investigador (momento «Publicar»). No la edite a mano: descárguela de nuevo desde el panel. */\nwindow.SIM_CONFIG = " + jsonEnScript(JSON.stringify(cfg, null, 1)) + ";\n";
// recibir-config.php con la forma exacta del apartado 7 del contrato. Solo lleva el SHA-256 de la clave de administración del servidor.
function textoReceptor() {
  const q = s => "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  return "<?php\n// Configuración del receptor de respuestas. La genera el panel del investigador (momento «Publicar»).\nreturn [\n    'clave_envio' => " + q(PROY.entrega.clave) + ",\n    'clave_admin_sha256' => " + q(SHA.hex(PROY.entrega.claveAdmin)) + ",\n    'carpeta' => __DIR__ . '/respuestas',\n    'max_bytes' => 1048576,\n    'max_documentos' => 2000,\n];\n";
}
/* Simulador en un solo archivo: reemplaza lo que hay entre los dos marcadores del HTML base.
   Los marcadores se arman por partes para que esta página no los contenga escritos de corrido. */
const MARCA_INI = "<" + "script>/*CONFIG:" + "INICIO*/window.SIM_CONFIG_INCLUIDA=", MARCA_FIN = ";/*CONFIG:" + "FIN*/</" + "script>";
function simuladorUnico(base, cfg) {
  base = String(base || "");
  const i = base.indexOf(MARCA_INI), j = i < 0 ? -1 : base.indexOf(MARCA_FIN, i + MARCA_INI.length);
  if (i < 0 || j < 0 || base.indexOf(MARCA_INI, i + 1) >= 0) return null;
  const json = jsonEnScript(JSON.stringify(cfg));
  try { if (canonico(JSON.parse(json)) !== canonico(cfg)) return null; } catch (e) { return null; }
  // El archivo único no necesita configuracion.js: se quita esa línea si el HTML base es el del sitio.
  return (base.slice(0, i) + MARCA_INI + json + base.slice(j)).replace("<" + 'script src="configuracion.js"></' + "script>\n", "");
}

/* ---------- Respuestas: validación e importación ----------
   Los archivos que importa el investigador son datos no confiables: además de validarRespuesta() se revisa
   el tipo de cada campo que el panel y el análisis leen, para que un archivo mal formado se rechace con su motivo. */
function estructuraRespuesta(d) {
  const e = [], mal = t => { if (e.length < 3 && e.indexOf(t) < 0) e.push(t); };
  const txt = v => typeof v === "string", txtN = v => v == null || typeof v === "string", numN = v => v == null || (typeof v === "number" && isFinite(v)), bolN = v => v == null || typeof v === "boolean";
  const lista = v => Array.isArray(v) && v.every(txt), listaN = v => v == null || lista(v), objN = v => v == null || esObjeto(v), numsN = v => v == null || (Array.isArray(v) && v.every(x => typeof x === "number"));
  const escalarN = v => v == null || ["string", "number", "boolean"].indexOf(typeof v) >= 0;
  const cada = (o, f) => Object.keys(o).every(k => f(o[k]));
  if (!esObjeto(d.estudio) || !txt(d.estudio.id) || !txtN(d.estudio.titulo) || !txtN(d.estudio.configuracion)) mal("los datos del estudio");
  if (!esObjeto(d.cuenta) || !txt(d.cuenta.usuario) || !RE_ID.test(d.cuenta.usuario) || !esRol(d.cuenta.actor) || !bolN(d.cuenta.prueba) || !bolN(d.cuenta.demo)) mal("la cuenta");
  const p = d.participante;
  if (!esObjeto(p) || !txt(p.id) || !bolN(p.anonimo) || !bolN(p.resumen) || !objN(p.datos) || (p.datos && !cada(p.datos, escalarN))) mal("los datos del participante");
  const c = d.consentimiento;
  if (!esObjeto(c) || !numN(c.t) || !escalarN(c.version) || !objN(c.declaraciones) || !listaN(c.texto)) mal("la declaración");
  if (!txtN(d.estado) || !objN(d.avance) || !txt(d.generado) || !fechaIso(d.generado) || !txtN(d.escenario)) mal("el estado o la fecha del documento");
  const s = d.sesion;
  if (!esObjeto(s) || !txtN(s.rondaActual) || !txtN(s.pasoActual) || !txtN(s.estado) || !objN(s.rondas) || (s.rondas && !cada(s.rondas, x => esObjeto(x) && txtN(x.estado) && objN(x.pasos)))) mal("la sesión");
  if (!Array.isArray(d.registros) || d.registros.length > MAX_REGISTROS) { mal("la lista de registros"); return e; }
  const comprobacion = x => x == null || (esObjeto(x) && bolN(x.finalidadAutorizada) && listaN(x.piezasDenegadas) && listaN(x.piezasPropias) && objN(x.piezasPermitidas) && (!x.piezasPermitidas || cada(x.piezasPermitidas, numsN)));
  const CAMPOS = {
    actividad:{ tipo:txtN, obs:txtN, suficiencia:txtN, falta:listaN, finalidad:txtN, decision:txtN, decisionTxt:txtN, responde:txtN, dias:numN, notifica:listaN, respuesta:txtN, piezas:listaN, pide:txtN, sabe:txtN, hizo:listaN, ve:txtN, accion:txtN, comprobacion },
    valoracion:{ semaforo:txtN, ajuste:txtN, mejora:txtN }, observacion:{ texto:txtN, pasos:listaN, final:bolN },
    solicitud:{ de:txtN, a:txtN, piezas:listaN, finalidad:txtN }, consulta:{ de:txtN, a:txtN, pieza:txtN, campos:numsN, motivo:txtN, finalidad:txtN },
    notificacion:{ de:txtN, a:listaN, nota:txtN }, acuse:{ de:txtN, a:txtN, nota:txtN }, respuesta:{ solicitud:txtN, de:txtN, a:txtN, respuesta:txtN, dias:numN }, avance:{ de:listaN, a:txtN, bloque:txtN }
  };
  d.registros.forEach((r, i) => {
    let ok = esObjeto(r) && txt(r.id) && txt(r.tipo) && txtN(r.ronda) && txtN(r.paso) && txtN(r.origen) && numN(r.t) && numN(r.dia) && txtN(r.actor) && txtN(r.participanteId) && txtN(r.participanteNombre) && txtN(r.reemplaza) && numN(r.version) && objN(r.payload);
    if (ok && r.payload) {
      const pl = r.payload, f = esPropia(CAMPOS, r.tipo) ? CAMPOS[r.tipo] : null;
      if (f) ok = Object.keys(f).every(k => f[k](pl[k]));
      else if (r.tipo === "preguntas") ok = cada(pl, v => (Array.isArray(v) ? lista(v) : txtN(v)));
    }
    if (!ok) mal("el registro " + (i + 1) + (esObjeto(r) && txt(r.tipo) ? " (" + r.tipo.slice(0, 24) + ")" : ""));
  });
  return e;
}
// Convierte el texto de un archivo en la lista de documentos que trae: uno solo, varios, o el paquete del receptor.
function leerDocumentos(texto) {
  let j; try { j = JSON.parse(texto); } catch (e) { return { error:"no es un archivo JSON legible" }; }
  if (esObjeto(j) && j.tipo === TIPO_COPIA) return { error:"es una copia de seguridad del proyecto: restáurela desde «Copia de seguridad»" };
  if (esObjeto(j) && j.ok === false) return { error:"el servidor respondió con un error" + (typeof j.error === "string" ? ": " + j.error.slice(0, 200) : "") };
  const lista = Array.isArray(j) ? j : esObjeto(j) && Array.isArray(j.documentos) ? j.documentos : [j];
  return { items:lista.map(x => (esObjeto(x) && esObjeto(x.documento) ? { doc:x.documento, recibido:typeof x.recibido === "string" ? x.recibido : null, excluida:x.excluida === true } : { doc:x })) };
}
const entradaDe = pid => RESP.filter(e => e.doc.participante.id === pid)[0] || null;
const respuestasDeCuenta = u => RESP.filter(e => e.doc.cuenta.usuario === u);
const esDePrueba = e => !!(e.doc.cuenta.prueba || e.doc.cuenta.demo || (cuentaDe(e.doc.cuenta.usuario) || {}).p);
const entraAlAnalisis = e => !e.excluida && (PROY.incluirPruebas || !esDePrueba(e));
const docsIncluidos = () => respuestasOrdenadas().filter(entraAlAnalisis).map(e => e.doc);
// Lo que conviene que el investigador sepa de un documento frente a su proyecto.
function avisosDe(e) {
  const d = e.doc, q = cuentaDe(d.cuenta.usuario), out = [];
  if (d.estudio.id !== PROY.estudio.id) out.push({ k:"estudio", t:"es de otro estudio (" + d.estudio.id + ")" });
  if (!q) out.push({ k:"cuenta", t:"su cuenta no está en este proyecto" });
  else if (q.a !== d.cuenta.actor) out.push({ k:"rol", t:"el rol del documento (" + nom(d.cuenta.actor) + ") no coincide con el de la cuenta (" + nom(q.a) + ")" });
  if (e.ausente) out.push({ k:"ausente", t:"ya no está en el servidor: la persona pudo haberse retirado" });
  return out;
}
function respuestasOrdenadas() {
  const pos = e => { const i = PROY.cuentas.map(q => q.u).indexOf(e.doc.cuenta.usuario); return i < 0 ? 1e6 + ROLES.indexOf(e.doc.cuenta.actor) : i; };
  return RESP.slice().sort((x, y) => pos(x) - pos(y) || (x.doc.cuenta.usuario < y.doc.cuenta.usuario ? -1 : x.doc.cuenta.usuario > y.doc.cuenta.usuario ? 1 : 0) || fechaIso(x.doc.generado) - fechaIso(y.doc.generado));
}
// Importa un documento. Devuelve la fila del informe de importación: { res, usuario, texto, avisos }.
function importarDocumento(doc, meta) {
  meta = meta || {};
  const fila = { archivo:meta.archivo || "", usuario:"", res:"rechazado", texto:"", avisos:[] };
  const errs = validarRespuesta(doc);
  if (esObjeto(doc) && esObjeto(doc.cuenta) && typeof doc.cuenta.usuario === "string") fila.usuario = doc.cuenta.usuario.slice(0, 40);
  if (errs.length) { fila.texto = errs.join("; "); return fila; }
  const est = estructuraRespuesta(doc);
  if (est.length) { fila.texto = "tiene una forma que el panel no reconoce en " + est.join(", "); return fila; }
  const pid = doc.participante.id, previo = entradaDe(pid);
  const e = { doc, importado:ahora(), origen:meta.origen === "servidor" ? "servidor" : "archivo", archivo:textoLimpio(meta.archivo, 160), recibido:meta.recibido ? textoLimpio(meta.recibido, 40) : null, excluida:meta.excluida === true, ausente:null };
  if (previo) {
    if (previo.doc.huella === doc.huella) { if (e.origen === "servidor") { previo.origen = "servidor"; previo.recibido = e.recibido || previo.recibido; previo.ausente = null; } fila.res = "igual"; fila.texto = "ya estaba importado, sin cambios"; return fila; }
    if (fechaIso(previo.doc.generado) >= fechaIso(doc.generado)) { fila.res = "antiguo"; fila.texto = "se conserva la versión que ya estaba, que es más reciente (" + fecha(fechaIso(previo.doc.generado)) + ")"; return fila; }
    e.excluida = previo.excluida;
    if (previo.doc.cuenta.usuario !== doc.cuenta.usuario) fila.avisos.push("la versión anterior venía con otro usuario (" + previo.doc.cuenta.usuario + ")");
    RESP[RESP.indexOf(previo)] = e;
    fila.res = "reemplazo"; fila.texto = "reemplazó a la versión anterior del mismo participante (" + fecha(fechaIso(previo.doc.generado)) + ")";
  } else {
    // Un documento de otro estudio no entra al análisis sin que el investigador lo decida (salvo demostración, que tiene su interruptor).
    if (doc.estudio.id !== PROY.estudio.id && !doc.cuenta.demo) e.excluida = true;
    const otro = doc.estudio.id !== PROY.estudio.id ? estudioConId(doc.estudio.id) : null;
    if (otro) fila.avisos.push("pertenece al estudio «" + otro.titulo + "»: ábralo para analizarla allí");
    RESP.push(e);
    fila.res = "nuevo"; fila.texto = doc.estado === "completa" ? "importado: participación completa" : "importado: participación parcial";
  }
  avisosDe(e).forEach(a => fila.avisos.push(a.t));
  if (!previo && e.excluida && meta.excluida !== true) fila.avisos.push("queda fuera del análisis hasta que usted lo incluya");
  if (esDePrueba(e)) fila.avisos.push(doc.cuenta.demo ? "es de una cuenta de demostración" : "es de una cuenta de prueba");
  return fila;
}
// Importa el contenido de varios archivos ya leídos: [{ nombre, texto }] o [{ nombre, error }].
function importarTextos(archivos, origen) {
  const filas = [];
  archivos.forEach(f => {
    if (f.error) { filas.push({ archivo:f.nombre, usuario:"", res:"rechazado", texto:f.error, avisos:[] }); return; }
    const r = leerDocumentos(f.texto);
    if (r.error) { filas.push({ archivo:f.nombre, usuario:"", res:"rechazado", texto:r.error, avisos:[] }); return; }
    if (!r.items.length) { filas.push({ archivo:f.nombre, usuario:"", res:"rechazado", texto:"no trae documentos", avisos:[] }); return; }
    r.items.forEach(x => filas.push(importarDocumento(x.doc, { archivo:f.nombre, origen, recibido:x.recibido, excluida:x.excluida })));
  });
  return anotarImportacion(filas);
}
function anotarImportacion(filas, nota) {
  const n = { nuevo:0, reemplazo:0, igual:0, antiguo:0, rechazado:0 }; filas.forEach(f => { n[f.res]++; });
  UI.importe = { t:ahora(), filas, n, nota:nota || "" };
  if (n.nuevo || n.reemplazo || filas.some(f => f.res === "igual")) guardarRespuestas();
  return UI.importe;
}
function eliminarRespuesta(pid) { const e = entradaDe(pid); if (!e) return false; RESP.splice(RESP.indexOf(e), 1); if (UI.ficha === pid) UI.ficha = null; guardarRespuestas(); return true; }
const paqueteRespuestas = () => ({ instrumento:INSTRUMENTO, tipo:TIPO_PAQUETE, formato:FORMATO, version:VERSION, generado:new Date().toISOString(), estudio:{ id:PROY.estudio.id, titulo:estudioEfectivo().titulo }, documentos:respuestasOrdenadas().map(e => ({ recibido:e.recibido || null, importado:e.importado, origen:e.origen, excluida:!!e.excluida, documento:e.doc })) });
const conDatosPersonales = () => respuestasOrdenadas().filter(e => e.doc.participante.datos && Object.keys(e.doc.participante.datos).length);
function datosPersonalesCsv() {
  const campos = GUION.consentimiento.datos;
  return csvTabla(["Usuario", "Rol", "Participación"].concat(campos.map(c => c.n), ["Desea el resumen de resultados", "Estado", "Fecha del documento"]),
    conDatosPersonales().map(e => { const d = e.doc, dt = d.participante.datos; return [d.cuenta.usuario, nomL(d.cuenta.actor), d.participante.id].concat(campos.map(c => (dt[c.id] == null ? "" : dt[c.id])), [d.participante.resumen ? "sí" : "no", d.estado === "completa" ? "completa" : "parcial", fecha(fechaIso(d.generado))]); }));
}

/* ---------- Receptor del servidor ---------- */
async function llamarReceptor(cuerpo) {
  const url = urlReceptor();
  if (!url) throw new Error("falta la dirección completa del receptor: escriba la dirección pública del simulador en «Estudio»");
  const r = await fetch(url, { method:"POST", headers:{ "Content-Type":"text/plain;charset=UTF-8" }, body:JSON.stringify(cuerpo), cache:"no-store", credentials:"same-origin" });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j || j.ok !== true) throw new Error(j && typeof j.error === "string" ? j.error.slice(0, 300) : r.ok ? "el servidor dio una respuesta que el panel no reconoce" : "el servidor respondió " + r.status);
  return j;
}
async function traerDelServidor() {
  const cuerpo = { accion:"listar", claveAdmin:PROY.entrega.claveAdmin }; if (idEstudioValido()) cuerpo.estudio = PROY.estudio.id;
  const j = await llamarReceptor(cuerpo);
  if (!Array.isArray(j.documentos)) throw new Error("el servidor no devolvió la lista de documentos");
  const filas = j.documentos.map(x => importarDocumento(esObjeto(x) ? x.documento : null, { archivo:"servidor", origen:"servidor", recibido:esObjeto(x) && typeof x.recibido === "string" ? x.recibido : null }));
  // Lo que antes vino del servidor y ya no está allí: la persona pudo haberse retirado.
  const presentes = mapaVacio(); j.documentos.forEach(x => { const d = esObjeto(x) && esObjeto(x.documento) ? x.documento : null; if (d && esObjeto(d.participante) && typeof d.participante.id === "string") presentes[d.participante.id] = 1; });
  let ausentes = 0;
  RESP.forEach(e => { if (e.origen !== "servidor" || e.doc.estudio.id !== PROY.estudio.id) return; if (presentes[e.doc.participante.id]) e.ausente = null; else { if (!e.ausente) e.ausente = ahora(); ausentes++; } });
  const imp = anotarImportacion(filas, j.documentos.length ? "" : "El servidor todavía no tiene documentos de este estudio.");
  imp.ausentes = ausentes; guardarRespuestas();
  return imp;
}
function borrarEnServidor(e) { const d = e.doc; return llamarReceptor({ accion:"borrar", claveAdmin:PROY.entrega.claveAdmin, estudio:d.estudio.id, usuario:d.cuenta.usuario, participante:d.participante.id }); }
const probarReceptor = () => llamarReceptor({ accion:"probar", clave:PROY.entrega.clave, claveAdmin:PROY.entrega.claveAdmin });

/* ---------- Seguimiento: en qué va cada participante ---------- */
// Registros que cuentan: sin los reemplazados ni los efectos del sistema que nacieron de un registro reemplazado.
function vigentesDoc(d) {
  const fuera = mapaVacio(); d.registros.forEach(x => { if (x.reemplaza) fuera[x.reemplaza] = 1; });
  return vigentesDe(d.registros).filter(x => !(x.payload && typeof x.payload.origenActividad === "string" && fuera[x.payload.origenActividad]));
}
const memoSeguimiento = new Map();   // por huella del documento
function seguimientoDe(d) {
  if (memoSeguimiento.has(d.huella)) return memoSeguimiento.get(d.huella);
  const actor = d.cuenta.actor, s = d.sesion, regs = vigentesDoc(d), mios = regs.filter(r => r.origen === "participante");
  const acts = mios.filter(r => r.tipo === "actividad" && r.payload), completa = d.estado === "completa";
  const ids = ESC.rondas.map(r => r.id), iR = ids.indexOf(s.rondaActual), rondasSes = s.rondas || {};
  const estadoRonda = id => (esPropia(rondasSes, id) && rondasSes[id].estado) || "pendiente";
  const est = iR >= 0 ? estadoRonda(s.rondaActual) : "";
  let donde;
  if (completa) donde = { etapa:"Entrega", texto:"Terminó las dos rondas" };
  else if (iR < 0) donde = { etapa:"Simulación", texto:"Aceptó la declaración" };
  else if (est === "pendiente") donde = { etapa:"Simulación", texto:"Ronda " + (iR + 1) + " · por iniciar" };
  else if (est === "valoracion") donde = { etapa:"Simulación", texto:"Ronda " + (iR + 1) + " · cierre de la ronda" };
  else donde = { etapa:"Simulación", texto:"Ronda " + (iR + 1) + " · paso " + (s.pasoActual || "—") + (esPaso(s.pasoActual) ? " · " + PASOS[PIDX[s.pasoActual]].n : "") };
  const rondas = ESC.rondas.map((r, i) => {
    const porPaso = mapaVacio(); acts.forEach(x => { if (x.ronda === r.id && esPaso(x.paso)) porPaso[x.paso] = x; });
    const actual = !completa && s.rondaActual === r.id && est === "en_curso" ? s.pasoActual : null;
    const pasos = PASOS.map(p => { const act = actividadDe(p, actor, r.modo), reg = porPaso[p.id] || null; return { p, act, reg, estado:reg ? (num(reg.version) > 1 ? "rect" : "ok") : actual === p.id ? "cur" : act ? "" : "na" }; });
    const de = t => mios.filter(x => x.ronda === r.id && x.tipo === t && x.payload)[0] || null;
    return { r, i, pasos, esperadas:pasos.filter(x => x.act).length, hechas:pasos.filter(x => x.act && x.reg).length, val:de("valoracion"), pre:de("preguntas"), estado:estadoRonda(r.id) };
  });
  const total = rondas.reduce((n, x) => n + x.esperadas + 1, 0), hechas = rondas.reduce((n, x) => n + x.hechas + (x.pre ? 1 : 0), 0);
  // Problemas: lectura directa de lo que la persona respondió. No se comparan los días con ningún umbral.
  const problemas = [];
  acts.forEach(x => {
    const pl = x.payload, c = esObjeto(pl.comprobacion) ? pl.comprobacion : null, en = t => problemas.push(Object.assign({ ronda:x.ronda, paso:x.paso }, t));
    if (pl.tipo === "decide" && (pl.suficiencia === "parcial" || pl.suficiencia === "insuficiente")) en({ k:pl.suficiencia, n:"información " + pl.suficiencia, t:"decidió con información " + pl.suficiencia + ((pl.falta || []).length ? ": faltó " + pl.falta.map(evSigla).join(", ") : ", sin señalar qué faltó") });
    if (c && c.finalidadAutorizada === false) en({ k:"finalidad", n:"finalidad no autorizada", t:"declaró una finalidad que su contrato no autoriza: «" + finNombre(pl.finalidad) + "»" });
    if (c && (c.piezasDenegadas || []).length) en({ k:"denegadas", n:"piezas denegadas", t:"piezas denegadas frente a su contrato: " + c.piezasDenegadas.map(evSigla).join(", ") });
    if (pl.responde === "nadie") en({ k:"responsable", n:actor === "tra" ? "no sabe quién le responde" : "sin responsable claro", t:actor === "tra" ? "no sabe quién le responde" : "nadie responde claramente por la decisión" });
    if (pl.sabe === "no") en({ k:"sabe", n:"no sabe qué pasa con su caso", t:"no sabe qué pasa con su caso" });
    if (pl.respuesta === "denegar") en({ k:"denego", n:"denegó la entrega", t:"denegó la entrega de la evidencia que custodia" });
  });
  const observaciones = [];
  mios.forEach(x => {
    const pl = x.payload || {};
    if (x.tipo === "actividad" && pl.obs) observaciones.push({ ronda:x.ronda, paso:x.paso, texto:pl.obs, t:x.t });
    if (x.tipo === "observacion" && pl.texto) observaciones.push({ ronda:x.ronda, paso:pl.final ? "cierre" : (pl.pasos || []).length ? pl.pasos.join(", ") : x.paso, texto:pl.texto, final:!!pl.final, t:x.t });
  });
  const g = { completa, donde, rondas, total, hechas, pct:total ? Math.round(hechas * 100 / total) : 0, problemas, observaciones, regs, mios, ultAct:acts[acts.length - 1] || null, ult:mios[mios.length - 1] || null,
    nParticipante:mios.length, nSistema:regs.length - mios.length, nSimulados:regs.filter(r => r.payload && r.payload.simulado === true).length, corregidas:d.registros.length - vigentesDe(d.registros).length };
  memoSeguimiento.set(d.huella, g);
  if (memoSeguimiento.size > 600) memoSeguimiento.delete(memoSeguimiento.keys().next().value);
  return g;
}

/* ---------- Copia de seguridad del proyecto ----------
   Lleva el estudio, las cuentas con sus contraseñas, la invitación y las respuestas. No lleva ninguna credencial de
   administración: ni la huella de la clave del panel ni la clave de administración del servidor. */
function copiaSeguridad() {
  const p = clone(PROY);
  delete p.clave;
  delete p.entrega.claveAdmin; delete p.receptorPublicado;
  p.cuentas.forEach(q => { delete q.h; delete q.hd; });
  return { instrumento:INSTRUMENTO, tipo:TIPO_COPIA, formato:FORMATO, version:VERSION, generado:new Date().toISOString(), proyecto:p, respuestas:respuestasOrdenadas().map(e => ({ importado:e.importado, origen:e.origen, archivo:e.archivo, recibido:e.recibido || null, excluida:!!e.excluida, documento:e.doc })) };
}
// Lee una copia de seguridad. Devuelve { error } o { proyecto, respuestas, avisos, generado }.
function leerCopia(texto) {
  let j; try { j = JSON.parse(texto); } catch (e) { return { error:"El archivo no es un JSON legible." }; }
  if (!esObjeto(j) || j.instrumento !== INSTRUMENTO || j.tipo !== TIPO_COPIA) return { error:"El archivo no es una copia de seguridad de este panel." };
  if (j.formato !== FORMATO) return { error:"La copia es de un formato que este panel no reconoce." };
  const n = normalizarProyecto(j.proyecto, false), r = leerEntradas(Array.isArray(j.respuestas) ? j.respuestas : []);
  if (r.descartadas) n.avisos.push(plural(r.descartadas, "documento de respuestas no pasó la validación y se omitió", "documentos de respuestas no pasaron la validación y se omitieron"));
  if (n.proyecto.entrega.forma === "servidor") n.avisos.push("la copia no trae la clave de administración del servidor: escríbala o genere una nueva en «Estudio»");
  return { proyecto:n.proyecto, respuestas:r.entradas, avisos:n.avisos, generado:typeof j.generado === "string" ? fechaIso(j.generado) : 0 };
}
// Restaurar una copia: si ya hay un estudio con el mismo identificador público, se reemplaza; si no, se añade uno.
function aplicarCopia(c) {
  guardarProyecto(); guardarRespuestas();
  const mismo = estudioConId(c.proyecto.estudio.id);
  c.proyecto.clave = mismo ? mismo.clave : claveEstudioNueva();
  PROY = c.proyecto; RESP = c.respuestas; memoSeguimiento.clear();
  guardarProyecto(); guardarRespuestas();
  return !!mismo;
}

/* ---------- Avisos ---------- */
let avisoT = null;
function aviso(t, err) { UI.msg = t || ""; UI.msgErr = !!err; render(); clearTimeout(avisoT); if (t) avisoT = setTimeout(() => { UI.msg = ""; render(); }, err ? 9000 : 5000); }
