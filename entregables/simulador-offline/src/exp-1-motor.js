/* ============ Motor del expediente de pensión de invalidez ============
   Instrumento del marco DGIT-PENSION-R1. El participante recorre UN expediente sintético en DOS
   condiciones —los canales del flujo actual y el módulo con acceso por finalidad— y al cierre
   responde las seis responsabilidades de H2 y reconstruye los cuatro accesos de H3.

   Reglas que vienen del documento y no se inventan aquí:
     · el estado inicial de cada soporte, su versión de referencia y su criterio de conformidad;
     · los puntos de decisión de cada caso y la evidencia que requieren;
     · «si el participante pide un soporte, el estado solo cambia cuando este llega, se verifica y
       se acepta»;
     · el corte de 48 horas virtuales y la instantánea antes de la decisión que resuelve (P2);
     · H1 se calcula en P2: requeridos disponibles y conformes ÷ total de requeridos.

   Lo que esta capa añade, como supuesto de simulación declarado en pantalla, son las horas
   virtuales que cuesta cada actuación en cada condición. */

const EXPM = {

  /* Horas virtuales por actuación. Supuesto de simulación: en el flujo actual una solicitud viaja
     por oficio o correo entre entidades; con el módulo la consulta por finalidad es inmediata y la
     solicitud queda enlazada al índice. El corte del piloto son 48 horas. */
  horas: {
    actual: { consultar:2, solicitar:20, devolver:20, verificar:1, decidir:1 },
    modulo: { consultar:1, solicitar:6,  devolver:6,  verificar:0.5, decidir:0.5 }
  },

  // Lo que cuesta una actuación: «Verificar y aceptar» y «Verificar y rechazar» cuestan lo que verificar.
  costo: function (cond, que) { const H = EXPM.horas[cond] || EXPM.horas.actual; return H[que === "aceptar" || que === "rechazar" ? "verificar" : que] || 0; },
  // Verificar y decidir se permiten aun con el corte agotado, pero las horas no pasan del corte.
  sumarHoras: function (E, h) { E.horas = Math.min(EXP.protocolo.corteHoras, E.horas + h); },
  casoDe: function (id) { return EXP.casos.filter(c => c.id === id)[0] || EXP.casos[0] || null; },
  // Igual, pero sin caer al primero: null si el id no está en el catálogo.
  casoExacto: function (id) { return EXP.casos.filter(c => c.id === id)[0] || null; },
  puntoDe: function (caso, id) { return caso.puntos.filter(p => p.id === id)[0] || null; },
  soporteDe: function (caso, k) { return caso.soportes.filter(s => s.k === k)[0] || null; },
  actorDe: function (caso, a) { return caso.actores.filter(x => x.a === a)[0] || null; },
  condDe: function (id) { return EXP.protocolo.condiciones.filter(c => c.id === id)[0] || EXP.protocolo.condiciones[0]; },

  /* ---------- Estado del expediente en una condición ----------
     Se reinicia al empezar cada condición, como pide el protocolo. */
  // «a la IPS», «al empleador», «a ARL SURA»: el custodio tal como entra en una frase.
  aCustodio: function (n) {
    const art = { "Junta Nacional":"la", "Junta Regional":"la", "Empleador":"el", "IPS":"la", "Solicitante":"el" }[n];
    return art === "el" ? "al " + n.toLowerCase() : art === "la" ? "a la " + n : "a " + n;
  },
  inicial: function (caso) {
    const E = { soportes:{}, puntos:{}, accesos:[], horas:0, historia:[], instantanea:null };
    caso.soportes.forEach(s => {
      E.soportes[s.k] = {
        estado:s.estado,            // conforme | no_conforme | ausente
        ver:s.ver || "",
        visto:false,                // el participante lo consultó
        solicitado:false,
        llegado:s.estado !== "ausente",   // lo que ya está en el expediente al radicar
        verificado:null,            // true | false: contrastado con el criterio de conformidad
        aceptado:s.estado === "conforme"  // solo lo conforme cuenta para la completitud
      };
    });
    caso.puntos.forEach(p => { E.puntos[p.id] = { cerrado:false, decision:null, cual:"", completitud:null }; });
    return E;
  },

  /* ---------- Completitud, la medida de H1 ----------
     «Elementos requeridos disponibles y conformes ÷ total de elementos requeridos». */
  completitud: function (E, caso, puntoId) {
    const p = EXPM.puntoDe(caso, puntoId); if (!p) return null;
    const req = p.requiere || [];
    const ok = req.filter(k => { const x = E.soportes[k]; return !!(x && x.llegado && x.aceptado && x.estado === "conforme"); });
    return { ok:ok.length, total:req.length, conformes:ok, faltan:req.filter(k => ok.indexOf(k) < 0),
      pct:req.length ? Math.round(ok.length * 1000 / req.length) / 10 : 0 };
  },
  // Lo que el documento imprime como «Inicio n/m», recalculado desde la tabla de soportes.
  inicioDe: function (caso, puntoId) {
    const p = EXPM.puntoDe(caso, puntoId); if (!p) return "";
    const ok = (p.requiere || []).filter(k => { const s = EXPM.soporteDe(caso, k); return s && s.estado === "conforme"; });
    return ok.length + "/" + (p.requiere || []).length;
  },

  /* ---------- Qué ve cada rol ----------
     El decisor del punto ve el estado de todos los soportes que el punto requiere. Quien custodia
     una pieza ve la suya y la solicitud que le llega. Nadie ve el contenido de una pieza ajena si
     su finalidad no lo autoriza: esa denegación es parte de lo que H3 mide. */
  piezasDelPunto: function (caso, puntoId) { const p = EXPM.puntoDe(caso, puntoId); return p ? (p.requiere || []).slice() : []; },
  custodiaDe: function (caso, actor) { return caso.soportes.filter(s => s.cust === actor).map(s => s.k); },
  /* Piezas clínicas: una finalidad administrativa no las abre, aunque quien consulte tenga un
     papel en el expediente. Es la regla que el documento deja expresamente denegada en H3. */
  clinicas: ["HC", "AUD", "FUN"],
  // ¿Puede este actor ver el contenido de esta pieza, con la finalidad que declaró?
  puedeVer: function (caso, actor, k, puntoId, finalidad) {
    const s = EXPM.soporteDe(caso, k); if (!s) return false;
    if (finalidad === "control_admin" && EXPM.clinicas.indexOf(k) >= 0) return false;
    if (s.cust === actor) return true;                      // su propia evidencia, en origen
    const p = EXPM.puntoDe(caso, puntoId);
    if (p && p.decide === actor && (p.requiere || []).indexOf(k) >= 0) return true;  // la necesita para decidir
    return false;
  },

  /* ---------- Actuaciones sobre un soporte ----------
     Devuelve { texto, horas } y deja el estado como queda. No cambia el estado a conforme por el
     solo hecho de pedirlo: tiene que llegar, verificarse y aceptarse. */
  actuar: function (E, caso, cond, actor, puntoId, k, que, finalidad) {
    const s = EXPM.soporteDe(caso, k), x = E.soportes[k], H = EXPM.horas[cond] || EXPM.horas.actual;
    const aCust = EXPM.aCustodio(s ? s.custN : "");
    if (!s || !x) return null;
    const esMod = cond === "modulo", r = { pieza:k, que:que, horas:EXPM.costo(cond, que), denegado:false };

    if (que === "consultar") {
      const puede = EXPM.puedeVer(caso, actor, k, puntoId, finalidad);
      x.visto = x.visto || puede;
      r.denegado = !puede;
      r.texto = puede
        ? (x.llegado
          ? "Consulta atendida. " + (x.estado === "conforme" ? "El soporte está en el expediente: " + s.contenido : "Lo que hay en el expediente no cumple el criterio. " + s.notaEstado)
          : (esMod
            ? "El índice registra que el soporte existe y quién lo custodia (" + s.custN + "), pero todavía no está en el expediente: hay que solicitarlo."
            : "No está en el expediente y no hay forma de verlo desde aquí: hay que pedirlo " + aCust + "."))
        : "Consulta denegada: la finalidad declarada no autoriza esta pieza. La denegación queda registrada.";
      if (esMod && puede && x.llegado && x.estado !== "conforme") r.texto += " El índice muestra además qué versión es la de referencia: " + s.verRef + ".";
    } else if (que === "solicitar") {
      x.solicitado = true; x.llegado = true; x.ver = s.verRef; x.verificado = null; x.aceptado = false; x.estado = "pendiente";
      r.texto = "Se envió la solicitud " + aCust + ". Llega la versión de referencia " + s.verRef + ". " + s.contenido + " Falta verificarla contra el criterio de conformidad y aceptarla.";
      if (esMod) r.texto += " La solicitud queda enlazada al índice, con su finalidad y su responsable.";
    } else if (que === "devolver") {
      x.solicitado = true; x.llegado = false; x.aceptado = false; x.verificado = false; x.estado = "ausente";
      r.texto = "Se devolvió " + aCust + " porque no cumple el criterio. Mientras no llegue la versión correcta, el soporte no está en el expediente.";
    } else if (que === "aceptar") {
      if (!x.llegado) { r.texto = "No se puede aceptar un soporte que no ha llegado."; r.horas = 0; return r; }
      x.verificado = true; x.aceptado = true; x.estado = "conforme";
      r.texto = "Se verificó contra el criterio («" + String(s.criterio || "").replace(/\.$/, "") + "») y se aceptó como conforme.";
    } else if (que === "rechazar") {
      x.verificado = false; x.aceptado = false;
      if (x.estado === "pendiente") x.estado = "no_conforme";
      r.texto = "Se verificó y se rechazó: no cumple el criterio. Queda la constancia y hay que pedir la versión que corresponde.";
    } else return null;

    const antes = E.horas; EXPM.sumarHoras(E, r.horas); r.horas = Math.round((E.horas - antes) * 10) / 10;
    E.accesos.push({ h:E.horas, actor:actor, pieza:k, finalidad:finalidad || "", accion:que, denegado:!!r.denegado, cond:cond });
    E.historia.push({ punto:puntoId, pieza:k, que:que, texto:r.texto, horas:r.horas });
    return r;
  },

  /* ---------- Cierre de un punto ---------- */
  opcionesPunto: function (caso, punto) {
    if (punto.resuelve) return [
      ["reconocer", "Reconocer la pensión"],
      ["negar", "Negar con decisión motivada"],
      ["pendiente", "Dejar pendiente de verificación y requerir lo que falta"]
    ];
    return [
      ["cerrado", "Cerrar el punto: tengo lo que necesito"],
      ["requerir", "Requerir lo que falta antes de cerrar"],
      ["sin_soporte", "No puedo cerrarlo con lo que hay"]
    ];
  },
  cerrarPunto: function (E, caso, cond, puntoId, decision, cual) {
    const p = EXPM.puntoDe(caso, puntoId), H = EXPM.horas[cond] || EXPM.horas.actual;
    if (!p) return null;
    const c = EXPM.completitud(E, caso, puntoId);
    const antes = E.horas; EXPM.sumarHoras(E, H.decidir); const hDec = Math.round((E.horas - antes) * 10) / 10;
    if (p.resuelve && !E.instantanea) E.instantanea = { h:E.horas, completitud:c, soportes:clone(E.soportes) };
    E.puntos[puntoId] = { cerrado:true, decision:decision, cual:textoLimpio(cual, 600) || "", completitud:c, horas:E.horas };
    E.historia.push({ punto:puntoId, que:"decidir", texto:"Decisión registrada", horas:hDec });
    return { completitud:c, horas:E.horas };
  },

  /* ---------- H2: identificación de responsabilidades ---------- */
  opcionesH2: function (caso) {
    return caso.actores.map(a => [a.a, a.n]).concat([["nadie", "Ninguno de los anteriores"], ["no_se", "No lo sé"]]);
  },
  calificarH2: function (caso, respuestas) {
    const r = (respuestas || {}), det = caso.h2.map(h => ({ id:h.id, dada:r[h.id] || null, ref:h.ref, correcta:r[h.id] === h.ref }));
    const ok = det.filter(x => x.correcta).length;
    return { ok:ok, total:caso.h2.length, pct:caso.h2.length ? Math.round(ok * 1000 / caso.h2.length) / 10 : 0, detalle:det };
  },

  /* ---------- H3: reconstrucción de accesos ----------
     Se le pide reconstruir, de cada intento de referencia, los cinco elementos que el marco exige:
     actor, finalidad, momento, acción y resultado. */
  camposH3: ["actor", "pieza", "momento", "accion", "resultado"],
  opcionesH3: function (caso) {
    const momentos = [["0-8", "En las primeras 8 horas"], ["8-24", "Entre 8 y 24 horas"], ["24-48", "Entre 24 y 48 horas"], ["no_se", "No lo sé"]];
    return {
      actor:caso.actores.map(a => [a.a, a.n]).concat([["no_se", "No lo sé"]]),
      pieza:caso.soportes.map(s => [s.k, s.n]).concat([["no_se", "No lo sé"]]),
      momento:momentos,
      accion:[["consultar", "Consultar"], ["solicitar", "Solicitar"], ["entregar", "Entregar"], ["no_se", "No lo sé"]],
      resultado:[["entregado", "Se entregó lo pedido"], ["parcial", "Se entregó solo una parte"], ["denegado", "Se denegó"], ["no_se", "No lo sé"]]
    };
  },
  // El momento de referencia, en el tramo que se le ofrece al participante.
  tramoDe: function (momento) {
    const h = parseFloat(String(momento).replace(/[^0-9.]/g, "")) || 0;
    return h <= 8 ? "0-8" : h <= 24 ? "8-24" : "24-48";
  },
  calificarH3: function (caso, respuestas) {
    const r = (respuestas || {}), det = caso.h3.map((h, i) => {
      const d = r["A" + (i + 1)] || {};
      const esperado = { actor:h.actor, pieza:h.pieza, momento:EXPM.tramoDe(h.momento), accion:String(h.accion || "").toLowerCase(), resultado:h.denegado ? "denegado" : "entregado" };
      const campos = EXPM.camposH3.map(k => ({ k:k, dada:d[k] || null, ref:esperado[k], correcta:d[k] === esperado[k] }));
      return { id:"A" + (i + 1), ref:h, campos:campos, correcta:campos.every(c => c.correcta) };
    });
    const ok = det.filter(x => x.correcta).length;
    const campos = det.reduce((n, x) => n + x.campos.filter(c => c.correcta).length, 0);
    return { ok:ok, total:caso.h3.length, pct:caso.h3.length ? Math.round(ok * 1000 / caso.h3.length) / 10 : 0,
      campos:campos, camposTotal:caso.h3.length * EXPM.camposH3.length, detalle:det };
  },

  /* ---------- El recorrido del participante ----------
     Dos condiciones del mismo expediente, en el orden que le toque, y al cierre H2 y H3.
     En cada condición entran los puntos donde su rol actúa: decide, o custodia algo que el punto
     requiere. Los demás puntos se resumen en un tramo de contexto. */
  participa: function (caso, actor, punto) {
    if (punto.decide === actor) return "decide";
    const mios = (punto.requiere || []).filter(k => { const s = EXPM.soporteDe(caso, k); return s && s.cust === actor; });
    return mios.length ? "aporta" : null;
  },
  ordenCondiciones: function (usuario) {
    // El protocolo pide alternar el orden entre participantes: se deriva del usuario, de forma estable.
    const C = EXP.protocolo.condiciones.map(c => c.id);
    let n = 0; String(usuario || "").split("").forEach(ch => { n = (n + ch.charCodeAt(0)) % 997; });
    return n % 2 ? [C[1], C[0]] : [C[0], C[1]];
  },
  bloques: function (caso, actor, usuario) {
    const out = [{ tipo:"caso" }], orden = EXPM.ordenCondiciones(usuario);
    // Los puntos posteriores al que resuelve el derecho son ilustrativos: se leen y se comentan, con
    // el expediente tal como lo deja el participante, pero no se vuelven a decidir en cada condición.
    // Así el recorrido completo cabe en los 45 minutos que fija el estudio.
    let iRes = -1; caso.puntos.forEach((p, j) => { if (p.resuelve) iRes = j; });
    orden.forEach((cond, i) => {
      out.push({ tipo:"cond-intro", cond:cond, ronda:i + 1 });
      let ctx = null;
      caso.puntos.forEach((p, j) => {
        const despues = iRes >= 0 && j > iRes, como = despues ? null : EXPM.participa(caso, actor, p);
        if (como) { ctx = null; out.push({ tipo:"punto", cond:cond, punto:p.id, como:como }); }
        else {
          if (!ctx || !!ctx.despues !== despues) { ctx = { tipo:"punto-contexto", cond:cond, puntos:[], despues:despues }; out.push(ctx); }
          ctx.puntos.push(p.id);
        }
      });
      out.push({ tipo:"cond-cierre", cond:cond, ronda:i + 1 });
    });
    out.push({ tipo:"h2" });
    out.push({ tipo:"h3" });
    return out;
  },
  // Minutos estimados del recorrido completo, para informar al participante.
  minutos: function (caso, actor, usuario) {
    const T = GUION.tiemposExp, bs = EXPM.bloques(caso, actor, usuario);
    let m = T.inicio + T.cierre + T.h2 + T.h3;
    bs.forEach(b => { m += b.tipo === "punto" ? T[b.como] : b.tipo === "punto-contexto" ? T.contexto * b.puntos.length : b.tipo === "cond-intro" ? T.condIntro : 0; });
    return Math.max(10, Math.round(m / 5) * 5);
  }
};
