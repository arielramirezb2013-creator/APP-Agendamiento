/* ============ Panel del investigador: análisis consolidado de las respuestas ============
   Análisis puro. Recibe documentos de respuestas ya validados y sin duplicados (apartado 6 del contrato) y
   devuelve capítulos y tablas. No lee el estado del panel ni del navegador; solo informeHtml() toma la hoja
   de estilos de la página para armar el documento imprimible.

   Reglas de este módulo:
   · Cada documento es una participación (participante.id) de un rol (cuenta.actor). Siempre se trabaja sobre
     los registros vigentes.
   · Lo que simuló el sistema se cuenta y se rotula aparte de lo que respondieron los participantes.
   · Los días son los que declaró cada persona: se resumen con mínimo, mediana y máximo, y nunca se suman.
   · El informe no muestra nombres ni correos: cada persona aparece con el usuario de su cuenta. La etiqueta
     privada de las cuentas no se usa.
   · Los archivos importados son datos no confiables: nada de lo que traen se usa como llave de un catálogo
     sin comprobarlo y todo texto pasa por esc() al llegar al HTML.
   · Las hipótesis se copian de ESC.hipotesis sin renombrarlas ni interpretarlas. */
const { analizar, vistaResultados, informeHtml, csvDeTabla, csvDeTodas, datosConsolidados } = (() => {

  /* ---------- Datos no confiables, texto y cifras ---------- */
  const lst = x => Array.isArray(x) ? x : [];
  const obj = x => x && typeof x === "object" && !Array.isArray(x) ? x : {};
  // Lectura de un catálogo con una llave que viene de un archivo: solo propiedades propias.
  const own = (o, k) => typeof k === "string" && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined;
  // Texto libre: una sola línea, sin caracteres de control y con un tope de longitud.
  function txt(x, max) {
    const m = max || 2000, s = (typeof x === "string" ? x : typeof x === "number" || typeof x === "boolean" ? String(x) : "").replace(/[\u0000-\u001f\u007f\s]+/g, " ").trim();
    return s.length > m ? s.slice(0, m) + "…" : s;
  }
  const fmtN = x => { const r = Math.round(x * 10) / 10; return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(".", ","); };
  const celN = x => { const r = Math.round(x * 10) / 10; return Number.isInteger(r) ? r : fmtN(r); };   // celda: el entero va como número; el decimal, con coma
  const deN = (k, n) => n ? k + " de " + n + " (" + Math.round(k * 100 / n) + " %)" : "sin datos";
  const cuantos = (k, n) => n ? k + " de " + n : "—";
  // Días declarados: un número mayor o igual a cero, o nada.
  function diasDe(v) {
    const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? parseFloat(v.replace(",", ".")) : NaN;
    return isFinite(n) && n >= 0 ? n : null;
  }
  function estad(xs) {
    const v = xs.filter(x => typeof x === "number" && isFinite(x)).sort((a, b) => a - b), n = v.length;
    return n ? { n, min:v[0], med:n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2, max:v[n - 1] } : null;
  }
  const diasTxt = xs => { const e = estad(xs); return e ? "mediana " + fmtN(e.med) + " · rango " + fmtN(e.min) + " a " + fmtN(e.max) + " · n " + e.n : "sin datos"; };
  const diasCeldas = xs => { const e = estad(xs); return e ? [e.n, celN(e.min), celN(e.med), celN(e.max)] : [0, "—", "—", "—"]; };
  const COLS_DIAS = ["Días: respuestas", "Días: mínimo", "Días: mediana", "Días: máximo"];
  function contar(xs) { const c = Object.create(null); xs.forEach(x => { const k = typeof x === "string" ? x : ""; c[k] = (c[k] || 0) + 1; }); return c; }
  // «Etiqueta: n · Etiqueta: n» en el orden del catálogo y sin los ceros; lo que no está en el catálogo va al final.
  function distTxt(ops, c, etq) {
    const ks = ops.map(o => o[0]), partes = ops.filter(o => c[o[0]]).map(o => (etq ? etq(o) : o[1]) + ": " + c[o[0]]);
    const otras = Object.keys(c).filter(k => ks.indexOf(k) < 0).reduce((n, k) => n + c[k], 0);
    if (otras) partes.push("Sin respuesta reconocida: " + otras);
    return partes.join(" · ") || "—";
  }
  const fechaSegura = t => typeof t === "number" && isFinite(t) && Math.abs(t) < 8.64e15 ? fecha(t) : "—";

  /* ---------- Escenario: rondas, pasos, roles y etiquetas legibles ---------- */
  const R = RONDAS, RID = R.map(r => r.id), REQ = lst(ESC.requeridos);
  const esRol = a => !!own(A, a);
  const idxPaso = id => { const i = own(PIDX, id); return typeof i === "number" ? i : -1; };
  const rondaC = id => { const i = RID.indexOf(id); return i < 0 ? "—" : "Ronda " + (i + 1) + " · " + (R[i].modo === "propuesto" ? "con el módulo" : "hoy"); };
  const pasoTxt = id => idxPaso(id) < 0 ? "—" : id + " · " + PASOS[idxPaso(id)].n;
  const rolL = a => esRol(a) ? nomL(a) : "—";
  const rolC = a => esRol(a) || a === "modulo" || a === "sistema" ? nom(a) : (txt(a, 30) || "—");
  const piezaC = k => own(EV, k) ? EV[k].sl : (txt(k, 20) || "—");
  const piezasC = ks => lst(ks).map(piezaC).join(", ");
  const finTxt = id => own(FIN, id) ? FIN[id].n : (txt(id, 60) || "Sin declarar");
  const finAutorizada = (id, rol) => !!(own(FIN, id) && FIN[id].actores.indexOf(rol) >= 0);
  const respondeTxt = (v, focal) => v === "yo" ? "Su propia entidad" : v === "nadie" ? (focal ? "No sabe" : "Nadie claramente") : esRol(v) ? nomL(v) : "Sin dato";
  const TIPO_ACT = { decide:"decidir", custodia:"responder por evidencia que custodia", focal:"vivir el paso como M.P.", soporte:"vigilar o apoyar" };
  const mayus = s => s.charAt(0).toUpperCase() + s.slice(1);
  const LETRA = { decide:"D", custodia:"C", focal:"M", soporte:"V" };
  const SUF_CORTA = { suficiente:"Suficiente", parcial:"Parcial", insuficiente:"Insuficiente" };
  const TIPO_REG = { valoracion:"Valoración del contrato", preguntas:"Preguntas de cierre", solicitud:"Solicitud de evidencia", consulta:"Consulta por el módulo", notificacion:"Notificación", acuse:"Acuse de recibo", respuesta:"Respuesta enlazada a una solicitud", inicio_ronda:"Inicio de ronda", avance:"Avance", cierre_ronda:"Cierre de ronda" };
  // Lo que le corresponde a cada rol en cada ronda: sus actividades, en el orden del recorrido.
  const ESP = {};
  BP.actores.forEach(a => { ESP[a.id] = {}; R.forEach(r => { ESP[a.id][r.id] = bloquesDe(a.id, r.modo).filter(b => b.tipo === "actividad").map(b => ({ paso:b.pasos[0], act:b.act })); }); });
  const esperadas = (rol, rid) => ESP[rol][rid].length;
  const slotDe = (rol, rid, paso) => RID.indexOf(rid) < 0 ? null : ESP[rol][rid].filter(s => s.paso === paso)[0] || null;

  /* ---------- Lectura: opciones del panel y una participación por documento ---------- */
  const ESTUDIO_CAMPOS = ["titulo", "subtitulo", "programa", "institucion", "investigador", "director", "contacto", "comite", "cierre"];
  // Del estudio solo se toman los campos conocidos; los vacíos toman el valor del guion, como en el simulador.
  function estudioLimpio(e) {
    const base = obj(typeof GUION !== "undefined" && GUION ? GUION.estudio : null), out = { id:txt(obj(e).id, 60) };
    ESTUDIO_CAMPOS.forEach(k => { out[k] = txt(obj(e)[k], 300) || txt(base[k], 300); });
    return out;
  }
  // De las cuentas del proyecto solo se toman el usuario, el rol y la marca de prueba.
  function cuentasLimpias(cs) {
    const vistos = Object.create(null), out = [];
    lst(cs).forEach(q => {
      if (!q || typeof q !== "object" || !esRol(q.a)) return;
      const u = txt(normUsuario(q.u), 60); if (!u || vistos[u]) return;
      vistos[u] = 1; out.push({ u, a:q.a, p:!!q.p });
    });
    return out;
  }
  // Registros que cuentan: sin los reemplazados por una corrección ni los efectos del sistema que nacieron de ellos.
  function vigentesDoc(doc) {
    const regs = lst(doc.registros).filter(r => r && typeof r === "object").map(r => r.payload && typeof r.payload === "object" && !Array.isArray(r.payload) ? r : Object.assign({}, r, { payload:{} }));
    const v = vigentesDe(regs), vivo = Object.create(null);
    v.forEach(r => { vivo[String(r.id)] = 1; });
    return v.filter(r => !r.payload.origenActividad || vivo[String(r.payload.origenActividad)]);
  }
  function leer(docs, cuentas) {
    const porId = Object.create(null), ctaDe = Object.create(null); let ilegibles = 0, repetidos = 0;
    cuentas.forEach(q => { ctaDe[q.u] = q; });
    lst(docs).forEach(doc => {
      const ok = doc && typeof doc === "object" && doc.cuenta && esRol(doc.cuenta.actor) && doc.participante && typeof doc.participante.id === "string" && txt(doc.participante.id, 60) && Array.isArray(doc.registros);
      if (!ok) { ilegibles++; return; }
      const id = txt(doc.participante.id, 60), previo = porId[id];
      // Dos documentos de una misma participación: vale el más reciente.
      if (previo) { repetidos++; if ((Date.parse(previo.generado) || 0) >= (Date.parse(doc.generado) || 0)) return; }
      porId[id] = doc;
    });
    const PS = Object.keys(porId).map(id => {
      const doc = porId[id], c = doc.cuenta, usuario = txt(normUsuario(c.usuario), 60) || "sin-usuario", cta = ctaDe[usuario] || null, datos = obj(doc.participante.datos), regs = vigentesDoc(doc);
      const P = { id, doc, usuario, alias:usuario, actor:c.actor, completa:doc.estado === "completa", demo:c.demo === true, prueba:c.demo === true || c.prueba === true || !!(cta && cta.p),
        enLista:!!cta, rolCuenta:cta ? cta.a : null, conDatos:Object.keys(datos).some(k => !!txt(datos[k])), generado:Date.parse(doc.generado) || 0,
        regs, descartados:lst(doc.registros).length - regs.length, act:{}, val:{}, preg:{}, obs:[], sim:[], cond:[], ajenos:0 };
      R.forEach(r => { P.act[r.id] = {}; });
      regs.forEach(x => {
        if (x.origen === "sistema") { (x.payload.simulado === true ? P.sim : P.cond).push(x); return; }
        if (x.origen !== "participante") { P.ajenos++; return; }
        // Una actividad cuenta si corresponde al recorrido del rol: ese paso, en esa ronda y con ese tipo de actividad.
        if (x.tipo === "actividad") { const s = slotDe(P.actor, x.ronda, x.paso); if (s && s.act.tipo === x.payload.tipo) P.act[x.ronda][x.paso] = x; else P.ajenos++; }
        else if (x.tipo === "valoracion" && RID.indexOf(x.ronda) >= 0) P.val[x.ronda] = x;
        else if (x.tipo === "preguntas" && RID.indexOf(x.ronda) >= 0) P.preg[x.ronda] = x;
        else if (x.tipo === "observacion") P.obs.push(x);
        else P.ajenos++;
      });
      // Avance como lo cuenta el simulador: las actividades del rol y un cierre (preguntas) por ronda.
      P.total = R.reduce((n, r) => n + esperadas(P.actor, r.id) + 1, 0);
      P.hechas = R.reduce((n, r) => n + Object.keys(P.act[r.id]).length + (P.preg[r.id] ? 1 : 0), 0);
      return P;
    });
    const orden = BP.actores.map(a => a.id);
    PS.sort((a, b) => orden.indexOf(a.actor) - orden.indexOf(b.actor) || (a.usuario < b.usuario ? -1 : a.usuario > b.usuario ? 1 : 0) || (a.id < b.id ? -1 : 1));
    // Si varias personas usaron la misma cuenta, el alias lleva el final del identificador de la participación.
    const veces = contar(PS.map(P => P.usuario));
    PS.forEach(P => { if (veces[P.usuario] > 1) P.alias = P.usuario + " (" + P.id.slice(-4) + ")"; if (P.prueba) P.alias += " · prueba"; });
    return { PS, ilegibles, repetidos, recibidos:lst(docs).length };
  }
  // En qué quedó una participación sin terminar.
  function quedoEn(P) {
    if (P.completa) return "Terminó";
    const s = obj(P.doc.sesion), rid = RID.indexOf(s.rondaActual) >= 0 ? s.rondaActual : null;
    if (!rid) return "—";
    const e = obj(own(obj(s.rondas), rid)).estado;
    return rondaC(rid) + ": " + (e === "pendiente" ? "sin comenzar" : e === "valoracion" ? "cierre de la ronda" : idxPaso(s.pasoActual) >= 0 ? "paso " + s.pasoActual : "en curso");
  }
  // Comprobación de la finalidad frente al contrato del rol: la que quedó registrada o, si no viene, la del escenario.
  function comprobacion(o) {
    const c = o.x.payload.comprobacion, rol = o.P.actor, fin = o.x.payload.finalidad, piezas = own(ESC.entradas, o.paso) || [];
    if (c && typeof c === "object" && typeof c.finalidadAutorizada === "boolean" && Array.isArray(c.piezasDenegadas)) return { autorizada:c.finalidadAutorizada, denegadas:c.piezasDenegadas.length };
    if (!own(FIN, fin)) return { autorizada:false, denegadas:piezas.filter(k => EV[k].cust !== rol).length };
    const r = comprobarFinalidad(rol, fin, piezas, o.paso);
    return { autorizada:r.finalidadAutorizada, denegadas:r.piezasDenegadas.length };
  }

  /* ---------- Registro completo: una línea legible por registro ---------- */
  const origenTxt = x => x.origen === "participante" ? "Participante" : x.origen === "sistema" ? (x.payload.simulado === true ? "Sistema · simulado" : "Sistema · conducción") : "—";
  function tipoTxt(x) {
    if (x.tipo === "actividad") return "Actividad: " + (own(TIPO_ACT, x.payload.tipo) || "sin tipo");
    if (x.tipo === "observacion") return x.payload.final === true ? "Comentario final" : "Observación";
    return own(TIPO_REG, x.tipo) || txt(x.tipo, 30) || "—";
  }
  function preguntaTxt(q, pl) {
    const v = pl[q.id], cual = txt(pl[q.id + "cual"], 600);
    const base = q.tipo === "texto" ? txt(v, 800) : q.tipo === "multi" ? lst(v).map(k => txt(etiqueta(q.ops, k), 80)).join(", ") : txt(etiqueta(q.ops, v), 80);
    return (base || "Sin respuesta") + (cual ? " · «" + cual + "»" : "");
  }
  function contenido(x) {
    const pl = x.payload, piezas = () => piezasC(pl.piezas) || "información del trámite";
    if (x.tipo === "actividad") return txt(resumenActividad(pl), 300) + (txt(pl.obs) ? " · «" + txt(pl.obs, 600) + "»" : "");
    if (x.tipo === "valoracion") return txt(etiqueta(ESC.valoracion.semaforo, pl.semaforo), 80) + " · " + txt(etiqueta(ESC.valoracion.mejora, pl.mejora), 80) + (txt(pl.ajuste) ? " · «" + txt(pl.ajuste, 600) + "»" : "");
    if (x.tipo === "preguntas") return ESC.preguntas.map(q => q.id + ": " + preguntaTxt(q, pl)).join(" · ");
    if (x.tipo === "observacion") return txt(pl.texto) || "(sin texto)";
    if (x.tipo === "solicitud") return rolC(pl.de) + " pide a " + rolC(pl.a) + ": " + piezas() + ", con finalidad «" + finTxt(pl.finalidad) + "»";
    if (x.tipo === "consulta") {
      if (pl.metadatos === true || !own(EV, pl.pieza)) return rolC(pl.de) + " consulta por el módulo el estado y las fechas del trámite en " + rolC(pl.a) + ", sin campos clínicos";
      if (pl.denegada) return "El módulo deniega a " + rolC(pl.de) + " la consulta de " + piezaC(pl.pieza) + (txt(pl.motivo) ? ": " + txt(pl.motivo, 200) : "");
      return "El módulo entrega a " + rolC(pl.de) + " " + lst(pl.campos).length + " de " + EV[pl.pieza].campos.length + " campos de " + piezaC(pl.pieza) + ", que custodia " + rolC(pl.a);
    }
    if (x.tipo === "notificacion") return pl.acuse === true ? "Notificación con acuse de " + rolC(pl.de) + " a " + (lst(pl.a).map(rolC).join(", ") || "—") : "Notificación sin acuse de " + rolC(pl.de);
    if (x.tipo === "acuse") return rolC(pl.de) + " confirma el recibo a " + rolC(pl.a);
    if (x.tipo === "respuesta") return "Respuesta de " + rolC(pl.de) + " a la solicitud de " + rolC(pl.a) + ": " + (txt(etiqueta(ESC.respCustodia, pl.respuesta), 80) || "—") + (diasDe(pl.dias) != null ? " · " + fmtN(diasDe(pl.dias)) + " d." : "");
    if (x.tipo === "inicio_ronda") return "Comienza la ronda";
    if (x.tipo === "cierre_ronda") return "Cierra la ronda";
    if (x.tipo === "avance") return "Termina " + (lst(pl.de).map(k => txt(k, 4)).join(", ") || "el tramo") + " y sigue " + (pl.a === "valoracion" ? "el cierre de la ronda" : "el paso " + txt(pl.a, 4));
    return "";
  }

  /* ---------- Análisis ---------- */
  function analizar(docs, opciones) {
    opciones = obj(opciones);
    const t0 = typeof opciones.ahora === "number" ? opciones.ahora : ahora();
    const est = estudioLimpio(opciones.estudio), ctas = cuentasLimpias(opciones.cuentas), L = leer(docs, ctas), PS = L.PS;
    const porRol = {}; BP.actores.forEach(a => { porRol[a.id] = PS.filter(P => P.actor === a.id); });
    const tablas = {}, capitulos = [];
    const T = (id, titulo, cols, rows, nota, simulado) => { tablas[id] = { titulo, cols, rows, nota }; if (simulado) tablas[id].simulado = true; return id; };
    const cap = (id, titulo, icono, intro, ids, aviso) => { const c = { id, n:capitulos.length + 1, titulo, icono, intro, tablas:ids }; if (aviso) c.aviso = aviso; capitulos.push(c); return c; };
    const colsR = sufijo => R.map(r => rondaC(r.id) + (sufijo || ""));
    const SOLO_CON = " Solo aparecen las situaciones con al menos una respuesta; la cobertura completa está en el capítulo 2.";

    // Todas las actividades respondidas, en el orden de la ruta: { P, x, rid, paso, act }.
    const ACT = [];
    R.forEach(r => PASOS.forEach(p => PS.forEach(P => { const s = slotDe(P.actor, r.id, p.id), x = s && P.act[r.id][p.id]; if (x) ACT.push({ P, x, rid:r.id, paso:p.id, act:s.act }); })));
    const actos = (tipo, rid) => ACT.filter(o => o.act.tipo === tipo && (!rid || o.rid === rid));
    // Situaciones (paso y rol) de un tipo de actividad con sus respuestas por ronda. Solo las que tienen alguna respuesta.
    function situaciones(tipo) {
      const out = [];
      PASOS.forEach(p => BP.actores.forEach(a => {
        const defs = R.map(r => { const s = slotDe(a.id, r.id, p.id); return s && s.act.tipo === tipo ? s.act : null; });
        if (!defs.some(Boolean)) return;
        const resp = R.map((r, i) => defs[i] ? ACT.filter(o => o.rid === r.id && o.paso === p.id && o.P.actor === a.id) : []);
        if (resp.some(x => x.length)) out.push({ paso:p.id, rol:a.id, act:defs.filter(Boolean)[0], defs, resp });
      }));
      return out;
    }
    const porRonda = (sits, f) => { const filas = []; sits.forEach(s => R.forEach((r, i) => { if (s.resp[i].length) filas.push(f(s, s.resp[i], r, s.defs[i])); })); return filas; };
    const valores = (os, k) => os.map(o => o.x.payload[k]);
    const diasDeLos = os => os.map(o => diasDe(o.x.payload.dias)).filter(d => d != null);

    /* 1. Qué se examinó y quiénes participaron */
    const nComp = PS.filter(P => P.completa).length, nPrueba = PS.filter(P => P.prueba).length, nDatos = PS.filter(P => P.conDatos).length;
    const rolesCon = BP.actores.filter(a => porRol[a.id].length).length, invitadas = ctas.filter(q => !q.p);
    const tipoCuenta = P => P.demo ? "De demostración" : P.prueba ? "De prueba" : ctas.length && !P.enLista ? "No figura en las cuentas del proyecto" : "Invitada";
    const mejorEstado = ps => ps.some(P => P.completa) ? "Completa" : ps.length ? "Parcial" : "Sin respuesta";
    T("estudio", "Estudio y escenario", ["Dato", "Valor"], [
      ["Estudio", est.titulo || "—"], ["Programa", est.programa || "—"], ["Institución", est.institucion || "—"]
    ].concat([["Investigador responsable", est.investigador], ["Director de la investigación", est.director], ["Comité de ética", est.comite]].filter(x => x[1]), [
      ["Identificador del estudio", est.id || "—"],
      ["Escenario", ESC.n], ["Nota del escenario", ESC.nota],
      ["Recorrido", PASOS.length + " pasos en " + SB.fases.length + " fases, en " + R.length + " rondas: " + R.map(r => r.n).join("; ")],
      ["Respuestas recibidas", PS.length], ["Completas", nComp], ["Parciales", PS.length - nComp],
      ["De cuentas de prueba o de demostración", nPrueba],
      ["Roles con al menos una respuesta", rolesCon + " de " + BP.actores.length],
      ["Participantes que dieron datos personales", nDatos + " de " + PS.length],
      ["Análisis generado", fechaSegura(t0)]
    ]), "Los datos del estudio son los que el investigador definió en el panel. Los conteos salen de los documentos de respuestas analizados: uno por participación. De los datos personales solo se informa cuántas personas los dieron.");
    T("participacion_rol", "Respuestas recibidas por rol", ["Rol", "Grupo", "Requerido por el escenario", "Cuentas invitadas", "Respuestas recibidas", "Completas", "Parciales", "De cuentas de prueba"],
      BP.actores.map(a => { const ps = porRol[a.id]; return [nomL(a.id), a.grupo, REQ.indexOf(a.id) >= 0 ? "Sí" : "No", ctas.length ? invitadas.filter(q => q.a === a.id).length : "—", ps.length, ps.filter(P => P.completa).length, ps.filter(P => !P.completa).length, ps.filter(P => P.prueba).length]; })
        .concat([["Total", "", "", ctas.length ? invitadas.length : "—", PS.length, nComp, PS.length - nComp, nPrueba]]),
      "Una respuesta es un documento de un participante. Es completa si la persona cerró las dos rondas; si no, es parcial. Las cuentas invitadas son las del proyecto que no están marcadas como de prueba. Las respuestas de cuentas de prueba se cuentan en las columnas anteriores y se muestran aparte en la última.");
    T("participantes", "Participaciones analizadas", ["Participante", "Rol", "Estado", "Avance", "Quedó en", "Tipo de cuenta", "Fecha del documento", "Registros vigentes"],
      PS.map(P => [P.alias, rolL(P.actor), P.completa ? "Completa" : "Parcial", P.hechas + " de " + P.total, quedoEn(P), tipoCuenta(P), P.generado ? fechaSegura(P.generado) : "—", P.regs.length]),
      "Cada fila es una participación. El participante aparece con el usuario de su cuenta, nunca con su nombre. El avance cuenta las actividades del rol y el cierre de cada ronda, como lo hace el simulador. Los registros vigentes no incluyen los reemplazados por una corrección.");
    const usuariosCon = contar(PS.map(P => P.usuario));
    T("cuentas", "Cuentas invitadas frente a respuestas", ["Usuario", "Rol", "Tipo de cuenta", "Respuestas recibidas", "Estado"],
      ctas.map(q => { const ps = PS.filter(P => P.usuario === q.u); return [q.u, rolL(q.a), q.p ? "De prueba" : "Invitada", ps.length, mejorEstado(ps)]; })
        .concat(ctas.length ? Object.keys(usuariosCon).filter(u => !ctas.some(q => q.u === u)).sort().map(u => { const ps = PS.filter(P => P.usuario === u); return [u, rolL(ps[0].actor), "No figura en las cuentas del proyecto", ps.length, mejorEstado(ps)]; }) : []),
      "Cuentas del proyecto que entregó el panel, con las respuestas recibidas de cada usuario. El estado es el de la respuesta más avanzada. Si la tabla está vacía, el panel no entregó la lista de cuentas.");
    cap("participacion", "Qué se examinó y quiénes participaron", "actores-participante",
      "Se examinó el recorrido de la ruta de incapacidad (" + PASOS.length + " pasos en " + SB.fases.length + " fases) en " + R.length + " rondas: " + R.map(r => r.n).join(" y ") + ". Cada persona entró sola con la cuenta de su rol. Los demás actores fueron simulados por el sistema.\n"
      + "Se analizaron " + plural(PS.length, "respuesta", "respuestas") + ": " + nComp + " " + (nComp === 1 ? "completa" : "completas") + " y " + (PS.length - nComp) + " " + (PS.length - nComp === 1 ? "parcial" : "parciales") + ", de " + rolesCon + " de los " + BP.actores.length + " roles. " + (nDatos === 1 ? "1 participante dio" : nDatos + " participantes dieron") + " datos personales; este informe solo muestra el usuario de cada cuenta.\n" + ESC.nota,
      ["estudio", "participacion_rol", "participantes", "cuentas"]);

    /* 2. Cobertura por rol */
    function estadoRol(a) {
      const ps = porRol[a], comp = ps.filter(P => P.completa), req = REQ.indexOf(a) >= 0;
      if (comp.some(P => !P.prueba)) return "Con respuesta completa";
      if (req) return "Pendiente de evidencia: " + (comp.length ? "solo hay respuestas de cuentas de prueba" : ps.length ? "solo hay respuestas parciales" : "sin respuestas");
      return comp.length ? "Con respuesta completa, solo de cuentas de prueba" : ps.length ? "Solo respuestas parciales" : "Sin respuestas";
    }
    const pendientes = REQ.filter(a => esRol(a) && !porRol[a].some(P => P.completa && !P.prueba));
    T("cobertura", "Cobertura por rol y ronda", ["Rol", "Requerido por el escenario", "Participaciones", "Actividades por ronda (" + RID.map((x, i) => i + 1).join(" + ") + ")"].concat(...R.map(r => [rondaC(r.id) + " · actividades", rondaC(r.id) + " · valoración", rondaC(r.id) + " · preguntas"]), ["Estado"]),
      BP.actores.map(a => { const ps = porRol[a.id], n = ps.length;
        return [nomL(a.id), REQ.indexOf(a.id) >= 0 ? "Sí" : "No", n, R.map(r => esperadas(a.id, r.id)).join(" + ")].concat(
          ...R.map(r => [cuantos(ps.reduce((k, P) => k + Object.keys(P.act[r.id]).length, 0), n * esperadas(a.id, r.id)), cuantos(ps.filter(P => P.val[r.id]).length, n), cuantos(ps.filter(P => P.preg[r.id]).length, n)]), [estadoRol(a.id)]); }),
      "Actividades: respondidas de esperadas. Las esperadas son las actividades que el recorrido le asigna al rol en la ronda, por el número de participaciones del rol. Valoración y preguntas: participaciones que las respondieron, de las participaciones del rol. Un rol requerido por el escenario queda «pendiente de evidencia» si no tiene ninguna respuesta completa de una cuenta que no sea de prueba.");
    T("cobertura_pasos", "Cobertura paso a paso", ["Rol", "Ronda"].concat(PASOS.map(p => p.id)),
      [].concat(...BP.actores.map(a => R.map(r => [nomL(a.id), rondaC(r.id)].concat(PASOS.map(p => { const s = slotDe(a.id, r.id, p.id), n = porRol[a.id].length; return s ? LETRA[s.act.tipo] + " " + (n ? porRol[a.id].filter(P => P.act[r.id][p.id]).length + "/" + n : "—") : "·"; }))))),
      "Cada celda dice qué le corresponde al rol en ese paso y cuántas participaciones respondieron: D decide, C responde por evidencia que custodia, M vive el paso como M.P., V vigila o apoya. «2/3» significa que respondieron 2 de 3 participaciones del rol; «—», que el rol no tiene participaciones; «·», que el rol no interviene en ese paso.");
    cap("cobertura", "Cobertura por rol", "capitulos-gestion-actores",
      "Qué respondió cada rol frente a lo que le correspondía. Las actividades esperadas salen del recorrido de cada rol en cada ronda." + (pendientes.length ? "\nRoles requeridos por el escenario que siguen pendientes de evidencia: " + pendientes.map(nomL).join(", ") + "." : REQ.length ? "\nTodos los roles requeridos por el escenario tienen al menos una respuesta completa." : ""),
      ["cobertura", "cobertura_pasos"]);

    /* 3. Decisiones por paso y ronda */
    const sitDec = situaciones("decide"), filasDec = [];
    sitDec.forEach(s => {
      const ops = s.act.ops, base = [pasoTxt(s.paso), rolL(s.rol)];
      ops.forEach(o => filasDec.push(base.concat([o[1]], s.resp.map(os => deN(os.filter(z => z.x.payload.decision === o[0]).length, os.length)))));
      const raras = s.resp.map(os => os.filter(z => !ops.some(o => o[0] === z.x.payload.decision)).length);
      if (raras.some(Boolean)) filasDec.push(base.concat(["Respuesta no reconocida"], s.resp.map((os, i) => deN(raras[i], os.length))));
    });
    T("decisiones", "Distribución de las decisiones", ["Paso", "Rol que decide", "Decisión"].concat(colsR()), filasDec,
      "Para cada paso con decisión se cuentan las respuestas vigentes de los participantes del rol que decide. Cada celda dice cuántos eligieron esa opción, de cuántos respondieron el paso en la ronda. En E4 deciden dos roles: la Junta Nacional valida el paquete y la ARL decide si apela." + SOLO_CON);
    T("decisiones_informacion", "Con qué información se decidió", ["Paso", "Rol que decide", "Ronda", "Decisiones"].concat(ESC.suficiencia.map(o => o[1]), ["Piezas que faltaron"]),
      porRonda(sitDec, (s, os, r) => { const c = contar(valores(os, "suficiencia")), falta = contar([].concat(...os.map(faltaDe)));
        return [pasoTxt(s.paso), rolL(s.rol), rondaC(r.id), os.length].concat(ESC.suficiencia.map(o => c[o[0]] || 0), [Object.keys(EV).filter(k => falta[k]).map(k => EV[k].sl + ": " + falta[k]).join(" · ") || "—"]); }),
      "Número de decisiones según la suficiencia de la información que declaró quien decide. Las piezas que faltaron son las que marcaron quienes respondieron «parcial» o «insuficiente», con el número de menciones." + SOLO_CON);
    T("decisiones_finalidad", "Finalidad declarada, quién responde y días", ["Paso", "Rol que decide", "Ronda", "Decisiones", "Finalidad declarada", "Finalidad autorizada para el rol", "Quién responde"].concat(COLS_DIAS),
      porRonda(sitDec, (s, os, r) => { const fin = contar(valores(os, "finalidad").map(f => own(FIN, f) ? f : "")), resp = contar(valores(os, "responde").map(v => respondeTxt(v)));
        return [pasoTxt(s.paso), rolL(s.rol), rondaC(r.id), os.length,
          distTxt(ESC.finalidades.map(f => [f.id, f.n]), fin, o => o[1] + (finAutorizada(o[0], s.rol) ? "" : " (no autorizada)")),
          deN(os.filter(o => comprobacion(o).autorizada).length, os.length),
          Object.keys(resp).sort().map(k => k + ": " + resp[k]).join(" · ")].concat(diasCeldas(diasDeLos(os))); }),
      "La finalidad es la que declaró quien decide. Está autorizada si el contrato de datos del escenario la permite para ese rol; se comprueba igual en las dos rondas, aunque hoy nadie hace esa comprobación. Los días son los que declaró cada persona: se resumen con mínimo, mediana y máximo y no se suman." + SOLO_CON);
    cap("decisiones", "Decisiones por paso y ronda", "acciones-decidir",
      "Qué decidieron los participantes del rol que decide en cada paso, con qué información, con qué finalidad y en cuántos días. Los días son los que declaró cada persona.",
      ["decisiones", "decisiones_informacion", "decisiones_finalidad"]);

    /* 4. Información que faltó y reprocesos */
    const decs = actos("decide");
    function faltaDe(o) { const s = o.x.payload.suficiencia; return s === "parcial" || s === "insuficiente" ? lst(o.x.payload.falta).filter((k, i, a) => own(EV, k) && a.indexOf(k) === i) : []; }
    const conVacios = o => o.x.payload.suficiencia === "parcial" || o.x.payload.suficiencia === "insuficiente";
    const solicitudesDe = o => o.P.sim.filter(s => s.tipo === "solicitud" && s.payload.origenActividad === o.x.id);
    T("reprocesos", "Decisiones con información parcial o insuficiente", ["Ronda", "Paso", "Rol", "Participante", "Información", "Piezas señaladas", "Decisión tomada", "Solicitudes simuladas que generó", "Cuenta como reproceso"],
      decs.filter(conVacios).map(o => { const sols = solicitudesDe(o);
        return [rondaC(o.rid), pasoTxt(o.paso), rolL(o.P.actor), o.P.alias, SUF_CORTA[o.x.payload.suficiencia], piezasC(faltaDe(o)) || "Ninguna", txt(etiqueta(o.act.ops, o.x.payload.decision), 120) || "—",
          sols.length ? sols.map(s => "a " + rolC(s.payload.a) + ": " + (piezasC(s.payload.piezas) || "información del trámite")).join("; ") + " (simulado)" : "Ninguna", faltaDe(o).length ? "Sí" : "No"]; }),
      "Decisiones en que quien decide declaró información parcial o insuficiente. Cuenta como reproceso si además señaló al menos una pieza faltante. Las solicitudes las simula el sistema en la ronda 1, una por cada custodio de las piezas señaladas; en la ronda 2 no hay solicitudes: el módulo simulado atiende o deniega consultas.");
    T("piezas_faltantes", "Piezas de evidencia que faltaron", ["Pieza", "Custodio"].concat(...R.map(r => [rondaC(r.id) + " · menciones", rondaC(r.id) + " · quién la señaló"])),
      Object.keys(EV).map(k => [EV[k].sl + " · " + EV[k].n, rolL(EV[k].cust)].concat(...R.map(r => { const os = decs.filter(o => o.rid === r.id && faltaDe(o).indexOf(k) >= 0), c = contar(os.map(o => o.P.actor)); return [os.length, BP.actores.filter(a => c[a.id]).map(a => nom(a.id) + " (" + c[a.id] + ")").join(", ") || "—"]; }))),
      "Menciones: decisiones con información parcial o insuficiente que señalaron la pieza como faltante. Entre paréntesis, cuántas decisiones de cada rol la señalaron.");
    T("solicitudes_simuladas", "Solicitudes simuladas que nacieron de esas decisiones", ["Ronda", "Paso", "Quién pide", "Participante", "A quién se le pide", "Piezas", "Finalidad declarada", "Finalidad autorizada", "Origen"],
      [].concat(...decs.map(o => solicitudesDe(o).map(s => [rondaC(o.rid), pasoTxt(o.paso), rolL(o.P.actor), o.P.alias, rolL(s.payload.a) + " (actor simulado)", piezasC(s.payload.piezas) || "información del trámite", finTxt(s.payload.finalidad), s.payload.autorizada === true ? "Sí" : "No", "Simulado por el sistema"]))),
      "Registros que generó el sistema, no los participantes: cuando una decisión de la ronda 1 señala piezas faltantes, el sistema simula la solicitud al custodio de cada pieza. Solo se cuentan las que nacen de una decisión vigente; las de una respuesta corregida se descartan.", true);
    cap("faltantes", "Información que faltó y reprocesos", "investigacion-reprocesos",
      "Decisiones tomadas con información parcial o insuficiente y piezas de evidencia que se echaron de menos. Cuando esto ocurre en la ronda 1, el sistema simula la solicitud al custodio: esas solicitudes van rotuladas como simuladas.",
      ["reprocesos", "piezas_faltantes", "solicitudes_simuladas"]);

    /* 5. Custodia */
    T("custodia", "Qué respondieron los custodios", ["Paso", "Rol que custodia", "Pieza", "Quién la pide (simulado)", "Ronda", "Respuestas"].concat(ESC.respCustodia.map(o => o[1]), COLS_DIAS),
      porRonda(situaciones("custodia"), (s, os, r, def) => { const c = contar(valores(os, "respuesta"));
        return [pasoTxt(s.paso), rolL(s.rol), piezasC(def.piezas) || "Información del trámite", rolC(def.pide), rondaC(r.id), os.length].concat(ESC.respCustodia.map(o => c[o[0]] || 0), diasCeldas(diasDeLos(os))); }),
      "Respuestas de quienes custodian evidencia que otro actor necesita en el paso. Quien la pide es el actor que decide en ese paso, simulado por el sistema: en la ronda 1 hace la solicitud; en la ronda 2 el custodio responde después de ver lo que el módulo simulado entregó con la vista mínima. Los días son los que declaró cada custodio y no se suman." + SOLO_CON);
    cap("custodia", "Custodia", "gobernanza-custodia",
      "Qué respondieron los custodios cuando otro actor necesitó su evidencia: entregar todo, entregar solo lo pertinente o denegar, y cuántos días les toma.", ["custodia"]);

    /* 6. Experiencia de M.P. */
    T("mp", "Lo que vive M.P. en cada paso", ["Paso", "Ronda", "Respuestas"].concat(ESC.focal.sabe.map(o => o[1]), ["Quién le responde", "Gestiones que tuvo que hacer"], COLS_DIAS),
      porRonda(situaciones("focal"), (s, os, r) => { const c = contar(valores(os, "sabe")), resp = contar(valores(os, "responde").map(v => respondeTxt(v, true))), hizo = contar([].concat(...os.map(o => lst(o.x.payload.hizo))));
        return [pasoTxt(s.paso), rondaC(r.id), os.length].concat(ESC.focal.sabe.map(o => c[o[0]] || 0), [Object.keys(resp).sort().map(k => k + ": " + resp[k]).join(" · "), distTxt(ESC.focal.hizo, hizo)], diasCeldas(diasDeLos(os))); }),
      "Respuestas de quienes representaron a M.P. Las gestiones son las que marcó cada persona; puede marcar varias. Los días solo cuentan cuando la persona dio un número: son los días en que espera respuesta y no se suman." + SOLO_CON);
    cap("mp", "Experiencia de M.P.", "actores-trabajador",
      "Lo que respondieron quienes representaron a la trabajadora: qué sabe de su caso en cada paso, quién le responde y qué gestiones le tocó hacer.", ["mp"]);

    /* 7. Vigilancia y apoyo */
    T("vigilancia", "Qué ven y qué hacen quienes vigilan o apoyan", ["Paso", "Rol", "Ronda", "Respuestas"].concat(ESC.soporte.ve.map(o => o[1]), ESC.soporte.accion.map(o => "Acción: " + o[1].toLowerCase())),
      porRonda(situaciones("soporte"), (s, os, r) => { const ve = contar(valores(os, "ve")), ac = contar(valores(os, "accion"));
        return [pasoTxt(s.paso), rolL(s.rol), rondaC(r.id), os.length].concat(ESC.soporte.ve.map(o => ve[o[0]] || 0), ESC.soporte.accion.map(o => ac[o[0]] || 0)); }),
      "Respuestas de los roles que vigilan o apoyan el paso: qué alcanzan a ver del caso y qué acción toman. Cada celda es el número de respuestas con esa opción." + SOLO_CON);
    cap("vigilancia", "Vigilancia y apoyo", "acciones-vigilar",
      "Qué alcanzan a ver del caso los actores que vigilan o apoyan y qué acción toman, por actor, paso y ronda.", ["vigilancia"]);

    /* 8. Desacuerdos entre representantes de un mismo rol */
    const ASPECTOS = {
      decide:[["decision", "La decisión", (v, act) => etiqueta(act.ops, v)]],
      custodia:[["respuesta", "La respuesta del custodio", v => etiqueta(ESC.respCustodia, v)]],
      focal:[["sabe", "Lo que M.P. sabe de su caso", v => etiqueta(ESC.focal.sabe, v)]],
      soporte:[["ve", "Lo que alcanza a ver", v => etiqueta(ESC.soporte.ve, v)], ["accion", "La acción que toma", v => etiqueta(ESC.soporte.accion, v)]]
    };
    const desac = [];
    const comparar = (rid, paso, rol, que, pares) => { if (pares.length > 1 && pares.some(z => z[1] !== pares[0][1])) desac.push({ rid, paso, rol, que, detalle:pares.map(z => z[0] + ": " + (txt(z[2], 160) || "sin respuesta")).join(" · ") }); };
    R.forEach(r => {
      PASOS.forEach(p => BP.actores.forEach(a => {
        const os = ACT.filter(o => o.rid === r.id && o.paso === p.id && o.P.actor === a.id);
        if (os.length > 1) ASPECTOS[os[0].act.tipo].forEach(asp => comparar(r.id, p.id, a.id, asp[1], os.map(o => [o.P.alias, o.x.payload[asp[0]], asp[2](o.x.payload[asp[0]], o.act)])));
      }));
      BP.actores.forEach(a => [["semaforo", "La valoración del contrato", ESC.valoracion.semaforo], ["mejora", "La percepción frente a hoy", ESC.valoracion.mejora]].forEach(asp =>
        comparar(r.id, "—", a.id, asp[1], porRol[a.id].filter(P => P.val[r.id]).map(P => [P.alias, P.val[r.id].payload[asp[0]], etiqueta(asp[2], P.val[r.id].payload[asp[0]])]))));
    });
    T("desacuerdos", "Respuestas distintas dentro de un mismo rol", ["Ronda", "Paso", "Rol", "Qué difiere", "Respuestas"],
      desac.map(d => [rondaC(d.rid), d.paso === "—" ? "Cierre de la ronda" : pasoTxt(d.paso), rolL(d.rol), d.que, d.detalle]),
      "Hay un desacuerdo cuando dos o más participaciones del mismo rol respondieron distinto en la misma ronda y el mismo paso, o valoraron distinto al cierre de la ronda. Se compara la decisión, la respuesta del custodio, lo que sabe M.P., lo que ve y hace quien vigila, la valoración del contrato y la percepción frente a hoy.");
    cap("desacuerdos", "Desacuerdos entre representantes de un mismo rol", "investigacion-claridad-roles",
      "Situaciones en que dos o más personas que representaron el mismo rol respondieron distinto. Solo puede haber desacuerdos en los roles con más de una participación" + (BP.actores.some(a => porRol[a.id].length > 1) ? ": " + BP.actores.filter(a => porRol[a.id].length > 1).map(a => nomL(a.id) + " (" + porRol[a.id].length + ")").join(", ") + "." : "; en este análisis ningún rol tiene más de una."),
      ["desacuerdos"]);

    /* 9. Valoración del contrato y percepción frente a hoy */
    const SEM = ESC.valoracion.semaforo, MEJ = ESC.valoracion.mejora;
    const filaVal = (nombre, ps, r) => { const vs = ps.filter(P => P.val[r.id]).map(P => P.val[r.id].payload), s = contar(vs.map(v => v.semaforo)), m = contar(vs.map(v => v.mejora)); return vs.length ? [[nombre, rondaC(r.id), vs.length].concat(SEM.map(o => s[o[0]] || 0), MEJ.map(o => m[o[0]] || 0))] : []; };
    T("valoracion", "Valoración del contrato y percepción frente a hoy", ["Rol", "Ronda", "Valoraciones"].concat(SEM.map(o => o[1]), MEJ.map(o => "Frente a hoy: " + o[1].toLowerCase())),
      [].concat(...BP.actores.map(a => [].concat(...R.map(r => filaVal(nomL(a.id), porRol[a.id], r)))), ...R.map(r => filaVal("Todos los roles", PS, r))),
      "Al cerrar cada ronda cada participante valora el contrato de datos de su rol y dice si esa forma de trabajar es mejor, igual o peor que hoy. Cada celda es el número de participaciones con esa respuesta. Es percepción, no comportamiento observado. Solo aparecen los roles con alguna valoración.");
    T("ajustes", "Ajustes propuestos al contrato", ["Ronda", "Rol", "Participante", "Valoración del contrato", "Frente a hoy", "Ajuste propuesto"],
      [].concat(...R.map(r => PS.filter(P => P.val[r.id] && txt(P.val[r.id].payload.ajuste)).map(P => { const v = P.val[r.id].payload; return [rondaC(r.id), rolL(P.actor), P.alias, txt(etiqueta(SEM, v.semaforo), 80), txt(etiqueta(MEJ, v.mejora), 80), txt(v.ajuste, 600)]; }))),
      "Texto que escribió cada participante cuando propuso un ajuste o rechazó el contrato. Se transcribe tal como se escribió.");
    cap("valoracion", "Valoración del contrato y percepción frente a hoy", "capitulos-validacion-contratos",
      "Al cerrar cada ronda, cada participante valoró el contrato de datos de su rol y dijo si esa forma de trabajar es mejor, igual o peor que hoy. Es percepción de los participantes.", ["valoracion", "ajustes"]);

    /* 10. Preguntas P1 a P4 */
    const Q = ESC.preguntas, Q_OPC = Q.filter(q => !q.tipo), Q_MULTI = Q.filter(q => q.tipo === "multi"), Q_TEXTO = Q.filter(q => q.tipo === "texto");
    const conPreg = [].concat(...R.map(r => PS.filter(P => P.preg[r.id]).map(P => ({ P, rid:r.id, pl:P.preg[r.id].payload }))));
    const filaPreg = (nombre, ps, r) => { const pls = ps.filter(P => P.preg[r.id]).map(P => P.preg[r.id].payload); return pls.length ? [[nombre, rondaC(r.id), pls.length].concat(...Q_OPC.map(q => { const c = contar(pls.map(pl => pl[q.id])); return q.ops.map(o => c[o[0]] || 0); }))] : []; };
    T("preguntas_rol", "Respuestas a " + Q_OPC.map(q => q.id).join(" y ") + " por rol y ronda", ["Rol", "Ronda", "Respuestas"].concat(...Q_OPC.map(q => q.ops.map(o => q.id + ": " + o[1]))),
      [].concat(...BP.actores.map(a => [].concat(...R.map(r => filaPreg(nomL(a.id), porRol[a.id], r)))), ...R.map(r => filaPreg("Todos los roles", PS, r))),
      "Número de participaciones con cada respuesta. " + Q_OPC.map(q => q.id + ": «" + q.t + "»").join(" ") + " Solo aparecen los roles con alguna respuesta.");
    T("preguntas", "Respuestas de cada participante", ["Ronda", "Rol", "Participante"].concat(Q.map(q => q.id)),
      conPreg.map(z => [rondaC(z.rid), rolL(z.P.actor), z.P.alias].concat(Q.map(q => preguntaTxt(q, z.pl)))),
      "Lo que respondió cada participante al cierre de cada ronda. Entre comillas va lo que escribió cuando la pregunta pedía un detalle.");
    const filasDif = [];
    Q_MULTI.forEach(q => q.ops.map((o, i) => { const zs = conPreg.filter(z => lst(z.pl[q.id]).indexOf(o[0]) >= 0);
      return { i, n:zs.length, fila:[o[1], zs.length].concat(R.map(r => zs.filter(z => z.rid === r.id).length), [zs.map(z => z.P.alias + " (" + rolC(z.P.actor) + ", ronda " + (RID.indexOf(z.rid) + 1) + ")").join("; ") || "—", zs.filter(z => txt(z.pl[q.id + "cual"])).map(z => "«" + txt(z.pl[q.id + "cual"], 600) + "» (" + z.P.alias + ", ronda " + (RID.indexOf(z.rid) + 1) + ")").join(" / ") || "—"]) }; })
      .sort((a, b) => b.n - a.n || a.i - b.i).forEach(z => filasDif.push(z.fila)));
    T("dificultades", "Dificultades al recorrer el escenario (" + Q_MULTI.map(q => q.id).join(", ") + ")", ["Dificultad", "Menciones"].concat(colsR(" · menciones"), ["Quién la señaló", "Descripción de la dificultad principal"]), filasDif,
      "Una mención es un participante que marcó la dificultad al cierre de una ronda; quien la marca en las dos rondas cuenta dos veces. La descripción es de la dificultad principal de cada participante: si marcó varias, la misma descripción aparece en cada una.");
    T("requisitos", "Requisitos para el siguiente prototipo (" + Q_TEXTO.map(q => q.id).join(", ") + ")", ["Ronda", "Rol", "Participante", "Requisito"],
      [].concat(...Q_TEXTO.map(q => conPreg.filter(z => txt(z.pl[q.id])).map(z => [rondaC(z.rid), rolL(z.P.actor), z.P.alias, txt(z.pl[q.id], 800)]))),
      "Texto que escribió cada participante. Se transcribe tal como se escribió.");
    const capPreg = cap("preguntas", "Preguntas " + Q[0].id + " a " + Q[Q.length - 1].id, "investigacion-pregunta-investigacion",
      "Respuestas a las preguntas de cierre de cada ronda.\n" + Q.map(q => q.id + ". " + q.t).join(" "), ["preguntas_rol", "preguntas", "dificultades", "requisitos"]);

    /* 11. Observaciones textuales */
    const filasObs = [];
    ACT.forEach(o => { if (txt(o.x.payload.obs)) filasObs.push({ r:RID.indexOf(o.rid), p:idxPaso(o.paso), fila:[rondaC(o.rid), pasoTxt(o.paso), rolL(o.P.actor), o.P.alias, "Actividad: " + TIPO_ACT[o.act.tipo].toLowerCase(), txt(o.x.payload.obs, 600)] }); });
    PS.forEach(P => P.obs.forEach(x => {
      if (!txt(x.payload.texto)) return;
      if (x.payload.final === true) { filasObs.push({ r:R.length, p:0, fila:["Al terminar", "—", rolL(P.actor), P.alias, "Comentario final", txt(x.payload.texto, 2000)] }); return; }
      const ps = lst(x.payload.pasos).filter(k => idxPaso(k) >= 0), ids = ps.length ? ps : idxPaso(x.paso) >= 0 ? [x.paso] : [];
      filasObs.push({ r:RID.indexOf(x.ronda) < 0 ? R.length : RID.indexOf(x.ronda), p:ids.length ? idxPaso(ids[0]) : PASOS.length, fila:[rondaC(x.ronda), ids.length > 2 ? ids[0] + " a " + ids[ids.length - 1] : ids.join(" y ") || "—", rolL(P.actor), P.alias, "Tramo de contexto", txt(x.payload.texto, 600)] });
    }));
    filasObs.forEach((z, i) => { z.i = i; });
    T("observaciones", "Observaciones de los participantes", ["Ronda", "Paso", "Rol", "Participante", "Dónde la escribió", "Observación"],
      filasObs.sort((a, b) => a.r - b.r || a.p - b.p || a.i - b.i).map(z => z.fila),
      "Texto libre de los participantes, tal como lo escribieron: la observación opcional de cada actividad, la de los tramos de contexto (pasos seguidos en que el rol no interviene) y el comentario final. No se corrige ni se resume.");
    cap("observaciones", "Observaciones textuales", "acciones-observar",
      "Lo que los participantes escribieron con sus palabras en las actividades, en los tramos de contexto y al terminar.", ["observaciones"]);

    /* 12. Indicadores comparados entre rondas */
    const IR = {};
    R.forEach(r => { const dec = actos("decide", r.id), foc = actos("focal", r.id);
      IR[r.id] = { dec, cus:actos("custodia", r.id), foc, sop:actos("soporte", r.id), comp:dec.map(comprobacion), vals:PS.filter(P => P.val[r.id]).map(P => P.val[r.id].payload), sim:[].concat(...PS.map(P => P.sim.filter(x => x.ronda === r.id))),
        gestiones:foc.reduce((n, o) => n + lst(o.x.payload.hizo).filter((k, i, a) => k !== "nada" && ESC.focal.hizo.some(h => h[0] === k) && a.indexOf(k) === i).length, 0) }; });
    const fila = (nombre, f, formula) => [nombre].concat(R.map(r => f(IR[r.id], r.id)), [formula]);
    const proporcion = (lista, k, v) => deN(lista.filter(o => o.x.payload[k] === v).length, lista.length);
    const NO_SUMA = " No se suman: son de pasos y personas distintos.";
    const indP = [
      fila("Participaciones con respuestas en la ronda", (I, rid) => PS.filter(P => Object.keys(P.act[rid]).length || P.val[rid] || P.preg[rid]).length, "Participaciones con al menos una actividad, una valoración o un juego de preguntas vigente en la ronda."),
      fila("Actividades respondidas", (I, rid) => deN(ACT.filter(o => o.rid === rid).length, PS.reduce((n, P) => n + esperadas(P.actor, rid), 0)), "Actividades con respuesta vigente ÷ actividades que el recorrido le asigna al rol de cada participación."),
      fila("Decisiones registradas", I => I.dec.length, "Actividades de decisión con respuesta vigente.")
    ].concat(
      ESC.suficiencia.map(o => fila("Información al decidir: " + o[1].toLowerCase(), I => proporcion(I.dec, "suficiencia", o[0]), "Decisiones con esa respuesta ÷ decisiones registradas.")),
      [
        fila("Decisiones con finalidad no autorizada", I => deN(I.comp.filter(c => !c.autorizada).length, I.dec.length), "Decisiones cuya finalidad declarada no está autorizada para el rol en el contrato del escenario ÷ decisiones registradas. Se comprueba igual en las dos rondas; hoy nadie hace esa comprobación."),
        fila("Piezas fuera de contrato", I => I.comp.reduce((n, c) => n + c.denegadas, 0), "Suma, en las decisiones de la ronda, de las piezas del paso que el rol no puede consultar con la finalidad que declaró."),
        fila("Reprocesos", I => deN(I.dec.filter(o => faltaDe(o).length).length, I.dec.length), "Decisiones con información parcial o insuficiente que señalan al menos una pieza faltante ÷ decisiones registradas."),
        fila("Días declarados al decidir", I => diasTxt(diasDeLos(I.dec)), "Mediana y rango de los días que declaró cada persona en cada decisión." + NO_SUMA),
        fila("Días declarados por los custodios", I => diasTxt(diasDeLos(I.cus)), "Mediana y rango de los días que declaró cada custodio en cada respuesta." + NO_SUMA),
        fila("Días de espera que declara M.P.", I => diasTxt(diasDeLos(I.foc)), "Mediana y rango de los días que declaró M.P. Solo cuentan las actividades en que dio un número." + NO_SUMA),
        fila("M.P. sabe qué pasa y quién le responde", I => proporcion(I.foc, "sabe", "si"), "Actividades de M.P. con la respuesta «" + etiqueta(ESC.focal.sabe, "si") + "» ÷ actividades de M.P. respondidas."),
        fila("Gestiones de M.P.", I => I.foc.length ? I.gestiones + " en " + plural(I.foc.length, "actividad", "actividades") + " (" + fmtN(I.gestiones / I.foc.length) + " por actividad)" : "sin datos", "Gestiones que marcó M.P.: " + ESC.focal.hizo.filter(h => h[0] !== "nada").map(h => h[1].toLowerCase()).join(", ") + ". «Nada» no cuenta."),
        fila("Actividades en que M.P. no tuvo que hacer nada", I => deN(I.foc.filter(o => { const h = lst(o.x.payload.hizo); return h.length === 1 && h[0] === "nada"; }).length, I.foc.length), "Actividades de M.P. en que solo marcó «Nada» ÷ actividades de M.P. respondidas.")
      ],
      ESC.respCustodia.map(o => fila("Custodia: " + o[1].toLowerCase(), I => proporcion(I.cus, "respuesta", o[0]), "Respuestas de custodia con esa opción ÷ respuestas de custodia.")),
      ESC.soporte.ve.map(o => fila("Vigilancia: " + o[1].toLowerCase(), I => proporcion(I.sop, "ve", o[0]), "Respuestas de vigilancia o apoyo con esa opción ÷ respuestas de vigilancia o apoyo.")),
      [fila("Vigilancia: toma alguna acción", I => deN(I.sop.filter(o => ESC.soporte.accion.some(a => a[0] !== "ninguna" && a[0] === o.x.payload.accion)).length, I.sop.length), "Respuestas de vigilancia o apoyo con una acción distinta de «ninguna» ÷ respuestas de vigilancia o apoyo.")],
      SEM.map(o => fila("Contrato: " + o[1].toLowerCase(), I => deN(I.vals.filter(v => v.semaforo === o[0]).length, I.vals.length), "Valoraciones con esa respuesta ÷ valoraciones de la ronda. Es percepción.")),
      MEJ.map(o => fila("Frente a hoy: " + o[1].toLowerCase(), I => deN(I.vals.filter(v => v.mejora === o[0]).length, I.vals.length), "Valoraciones con esa respuesta ÷ valoraciones de la ronda. Es percepción.")),
      [fila("Desacuerdos dentro de un mismo rol", (I, rid) => desac.filter(d => d.rid === rid).length, "Situaciones del capítulo 8: mismo rol, misma ronda y mismo paso con respuestas distintas, o valoraciones distintas al cierre.")]
    );
    T("indicadores_participantes", "Lo que respondieron los participantes", ["Indicador"].concat(colsR(), ["Cómo se calcula"]), indP,
      "Todos los indicadores de esta tabla salen de las respuestas vigentes de los participantes. Las proporciones van con su numerador y su denominador. Ningún registro simulado por el sistema entra aquí.");
    const simN = (I, f) => I.sim.filter(f).length;
    T("indicadores_sistema", "Lo que simuló el sistema", ["Indicador (simulado)"].concat(colsR(), ["Cómo se calcula"]), [
      fila("Solicitudes de evidencia al participante que custodia", I => simN(I, x => x.tipo === "solicitud" && x.payload.guion === true), "Solicitudes que el sistema hace en nombre de quien decide para que el custodio responda. Solo ocurren en la ronda 1."),
      fila("Solicitudes que nacen de una decisión", I => simN(I, x => x.tipo === "solicitud" && x.payload.guion !== true), "Solicitudes que el sistema simula cuando quien decide señala piezas faltantes: una por cada custodio. Solo ocurren en la ronda 1."),
      fila("Consultas por el módulo atendidas", I => simN(I, x => x.tipo === "consulta" && !x.payload.denegada), "Consultas que el módulo simulado atiende con la vista mínima del contrato, incluidas las de estado y fechas. Solo ocurren en la ronda 2."),
      fila("Consultas por el módulo denegadas", I => simN(I, x => x.tipo === "consulta" && !!x.payload.denegada), "Consultas que el módulo simulado deniega porque la finalidad no está autorizada o la pieza está fuera del contrato. Solo ocurren en la ronda 2."),
      fila("Notificaciones con acuse", I => simN(I, x => x.tipo === "notificacion" && x.payload.acuse === true), "Notificaciones de una decisión a los actores que el participante eligió, con acuse del módulo simulado. Solo ocurren en la ronda 2."),
      fila("Notificaciones sin acuse", I => simN(I, x => x.tipo === "notificacion" && x.payload.acuse !== true), "Una por cada decisión de la ronda 1: representa que hoy la decisión se notifica sin acuse."),
      fila("Acuses de recibo", I => simN(I, x => x.tipo === "acuse"), "Acuses que genera el módulo simulado: uno por cada actor notificado en la ronda 2."),
      fila("Total de registros simulados", I => I.sim.length, "Todos los registros vigentes que el sistema generó en nombre de actores que no estaban conectados.")
    ], "Estos registros no son respuestas de participantes: los genera el sistema para representar a los actores que no estaban conectados y al módulo propuesto. Siguen las reglas del escenario, por eso cambian con lo que cada participante responde, pero no miden una integración real. Se cuentan aparte y no entran en la tabla anterior.", true);
    const sitDias = [].concat(situaciones("decide"), situaciones("custodia"), situaciones("focal")).filter(s => s.resp.some(os => diasDeLos(os).length))
      .sort((a, b) => idxPaso(a.paso) - idxPaso(b.paso) || BP.actores.map(x => x.id).indexOf(a.rol) - BP.actores.map(x => x.id).indexOf(b.rol));
    T("indicadores_dias", "Días declarados por paso y rol", ["Paso", "Rol", "Actividad"].concat(colsR()),
      sitDias.map(s => [pasoTxt(s.paso), rolL(s.rol), TIPO_ACT[s.act.tipo]].concat(s.resp.map(os => diasTxt(diasDeLos(os))))),
      "Días que declaró cada persona en cada paso, resumidos por paso y rol con mediana, rango y número de respuestas. No se suman días de personas ni de pasos distintos: no forman una línea de tiempo. Los plazos del escenario son supuestos de simulación.");
    const capInd = cap("indicadores", "Indicadores comparados entre rondas", "capitulos-indicadores",
      "Conteos y proporciones por ronda, cada uno con su fórmula. Las dos rondas recorren el mismo caso y los mismos pasos. La primera tabla recoge lo que respondieron los participantes; la segunda, lo que simuló el sistema. No se mezclan.\nSi hay respuestas parciales, cada ronda tiene un número distinto de respuestas: mire siempre el denominador. Los días no se suman entre personas: se resumen con mediana y rango.",
      ["indicadores_participantes", "indicadores_sistema", "indicadores_dias"]);

    /* 13. Correspondencia con el proyecto doctoral */
    const ADVERTENCIA = "Este informe recoge percepción y comportamiento en una simulación con un caso sintético. No es el resultado técnico del módulo ni una comparación operativa: eso requiere sus propios instrumentos.";
    const SUB = obj(ESC.subpreguntas), pregDe = sub => Q.filter(q => q.sub === sub).map(q => q.id).join(" y ");
    T("correspondencia", "De las respuestas a las subpreguntas del proyecto", ["Qué aporta este informe", "Subpregunta del proyecto", "Dónde está"], [
      ["Preguntas " + pregDe("caracterizacion"), SUB.caracterizacion || "—", "Capítulo " + capPreg.n],
      ["Preguntas " + pregDe("diseno"), SUB.diseno || "—", "Capítulo " + capPreg.n],
      ["Indicadores observados en la simulación", SUB.evaluacion || "—", "Capítulo " + capInd.n]
    ], "Las subpreguntas se copian del escenario del proyecto. " + ADVERTENCIA);
    T("hipotesis", "Hipótesis del proyecto, tal como están formuladas", ["Hipótesis", "Formulación"], lst(ESC.hipotesis).map(h => [h[0], h[1]]),
      "Texto tomado sin cambios del escenario del proyecto. Este informe no renombra las hipótesis, no las interpreta y no las da por probadas.");
    cap("correspondencia", "Correspondencia con el proyecto doctoral", "capitulos-hipotesis",
      "Cómo se relaciona lo recogido con las subpreguntas y las hipótesis del proyecto. Las hipótesis se transcriben tal como están formuladas; este informe no las interpreta.",
      ["correspondencia", "hipotesis"], ADVERTENCIA);

    /* 14. Registro completo */
    T("registros", "Registros vigentes", ["Fecha y hora", "Participante", "Rol", "Ronda", "Paso", "Origen", "Tipo", "Contenido"],
      [].concat(...PS.map(P => P.regs.map(x => [fechaSegura(x.t), P.alias, rolL(P.actor), rondaC(x.ronda), idxPaso(x.paso) >= 0 ? x.paso : "—", origenTxt(x), tipoTxt(x), contenido(x)]))),
      "Todos los registros vigentes de las participaciones analizadas, en el orden en que se anotaron. Origen «Participante»: lo que la persona respondió. «Sistema · simulado»: lo que el sistema generó a partir de la respuesta, tanto los actos de la propia entidad del participante (solicitudes, consultas y notificaciones) como la reacción de los actores que no estaban conectados. «Sistema · conducción»: inicio, avance y cierre de las rondas, y el enlace de una respuesta con su solicitud.");
    const nRegs = PS.reduce((n, P) => n + P.regs.length, 0), nDesc = PS.reduce((n, P) => n + P.descartados, 0);
    cap("registro", "Registro completo", "documentos-evidencia",
      "Los " + nRegs + " registros vigentes de las participaciones analizadas." + (nDesc ? " No aparecen " + plural(nDesc, "registro reemplazado por una corrección o nacido de una respuesta corregida", "registros reemplazados por una corrección o nacidos de una respuesta corregida") + "." : ""),
      ["registros"]);

    /* Resumen para la cabecera y avisos */
    const avisos = [], nAjenos = PS.reduce((n, P) => n + P.ajenos, 0), otroEstudio = est.id ? PS.filter(P => txt(obj(P.doc.estudio).id, 60) !== est.id).length : 0;
    const otroEscenario = PS.filter(P => P.doc.escenario !== ESC.id).length, incompletas = PS.filter(P => P.completa && P.hechas < P.total), otroRol = PS.filter(P => P.rolCuenta && P.rolCuenta !== P.actor);
    if (nPrueba) avisos.push("El análisis incluye " + plural(nPrueba, "respuesta de una cuenta de prueba o de demostración", "respuestas de cuentas de prueba o de demostración") + ". Van marcadas con «prueba» y no son evidencia del estudio. Para dejarlas fuera, exclúyalas en «Respuestas».");
    if (pendientes.length) avisos.push("Roles requeridos por el escenario pendientes de evidencia: " + pendientes.map(nomL).join(", ") + ".");
    if (otroEstudio) avisos.push(plural(otroEstudio, "respuesta trae", "respuestas traen") + " el identificador de otro estudio. Revise que correspondan a este.");
    if (otroEscenario) avisos.push(plural(otroEscenario, "respuesta es", "respuestas son") + " de un escenario distinto de «" + ESC.id + "».");
    if (otroRol.length) avisos.push("El rol de la respuesta no coincide con el de la cuenta del proyecto en: " + otroRol.map(P => P.alias).join(", ") + ". Se analiza con el rol que trae la respuesta.");
    if (incompletas.length) avisos.push("Estas respuestas dicen estar completas pero les faltan actividades o cierres: " + incompletas.map(P => P.alias).join(", ") + ".");
    if (nAjenos) avisos.push(plural(nAjenos, "registro no corresponde", "registros no corresponden") + " al recorrido del rol y no se " + (nAjenos === 1 ? "cuenta" : "cuentan") + " en las tablas; " + (nAjenos === 1 ? "aparece" : "aparecen") + " en el registro completo.");
    if (L.repetidos) avisos.push("Se " + (L.repetidos === 1 ? "recibió 1 versión repetida" : "recibieron " + L.repetidos + " versiones repetidas") + " de una misma participación: se usó la más reciente.");
    if (L.ilegibles) avisos.push(plural(L.ilegibles, "documento no se pudo leer y quedó", "documentos no se pudieron leer y quedaron") + " fuera del análisis.");
    const resumen = {
      generado:new Date(t0).toISOString(), estudio:est, escenario:{ id:ESC.id, n:ESC.n, nota:ESC.nota },
      documentos:{ recibidos:L.recibidos, ilegibles:L.ilegibles, repetidos:L.repetidos },
      participaciones:PS.length, completas:nComp, parciales:PS.length - nComp, dePrueba:nPrueba, conDatos:nDatos,
      roles:{ total:BP.actores.length, conRespuesta:rolesCon },
      requeridos:{ total:REQ.length, conEvidencia:REQ.length - pendientes.length, pendientes:pendientes.slice(), pendientesTxt:pendientes.map(nomL) },
      cuentas:ctas.length ? { invitadas:invitadas.length, dePrueba:ctas.length - invitadas.length, conRespuesta:invitadas.filter(q => usuariosCon[q.u]).length, sinRespuesta:invitadas.filter(q => !usuariosCon[q.u]).length } : null,
      actividades:{ respondidas:ACT.length, esperadas:PS.reduce((n, P) => n + R.reduce((k, r) => k + esperadas(P.actor, r.id), 0), 0) },
      registros:{ vigentes:nRegs, deParticipantes:PS.reduce((n, P) => n + P.regs.filter(x => x.origen === "participante").length, 0), simulados:PS.reduce((n, P) => n + P.sim.length, 0), conduccion:PS.reduce((n, P) => n + P.cond.length, 0), descartados:nDesc },
      rondas:R.map(r => ({ id:r.id, n:r.n, modo:r.modo, participaciones:PS.filter(P => Object.keys(P.act[r.id]).length || P.val[r.id] || P.preg[r.id]).length, actividades:ACT.filter(o => o.rid === r.id).length, esperadas:PS.reduce((n, P) => n + esperadas(P.actor, r.id), 0), valoraciones:PS.filter(P => P.val[r.id]).length, preguntas:PS.filter(P => P.preg[r.id]).length, simulados:IR[r.id].sim.length })),
      desacuerdos:desac.length, avisos
    };
    return { resumen, capitulos, tablas };
  }

  /* ---------- Informe en pantalla ---------- */
  const esNum = v => typeof v === "number" || (typeof v === "string" && /^\d+(,\d+)?$/.test(v));
  const chipSim = () => ' <span class="chip ch-gold" title="Lo generó el sistema para representar a los actores que no estaban conectados">simulado</span>';
  function tablaHtml(an, id, ref, pantalla) {
    const t = obj(an.tablas)[id]; if (!t) return "";
    const cols = lst(t.cols), rows = lst(t.rows);
    // Una columna es numérica si todas sus celdas son números o rayas y al menos una es número.
    const num = cols.map((c, j) => rows.length > 0 && rows.some(r => esNum(r[j])) && rows.every(r => esNum(r[j]) || r[j] === "—"));
    const celda = (v, j) => { const s = String(v == null ? "" : v); return `<td${num[j] ? ' class="num"' : s.length <= 14 && !/\s/.test(s) ? ' class="nw"' : ""}>${esc(s)}</td>`; };
    const titulo = `<h3 id="inf-t-${esc(id)}">Tabla ${esc(ref)} · ${esc(t.titulo)}${t.simulado ? chipSim() : ""}</h3>`;
    const cab = pantalla ? `<div class="row inf-cab">${titulo}<span class="sp"></span><button type="button" class="btn sm sec" data-act="csv" data-arg="${esc(id)}" aria-label="Exportar a CSV la tabla ${esc(ref)}: ${esc(t.titulo)}">${ico("investigacion-archivo-csv", "sm")}Exportar CSV</button></div>` : titulo;
    return `${cab}<div class="twrap"><table class="t" data-tabla="${esc(id)}" aria-labelledby="inf-t-${esc(id)}"><thead><tr>${cols.map((c, j) => `<th scope="col"${num[j] ? ' class="num"' : ""}>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${lst(r).map(celda).join("")}</tr>`).join("") : `<tr><td colspan="${cols.length}" class="mini">Sin datos</td></tr>`}</tbody></table></div>${t.nota ? `<p class="mini inf-nota"><b>Cómo se calcula.</b> ${esc(t.nota)}</p>` : ""}`;
  }
  const parrafos = t => String(t || "").split("\n").filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("");
  function capituloHtml(an, c, pantalla) {
    const cuerpo = lst(c.tablas).map((id, i) => {
      const h = tablaHtml(an, id, c.n + "." + (i + 1), pantalla), t = obj(an.tablas)[id];
      // En pantalla el registro completo va plegado: puede tener miles de filas.
      return pantalla && id === "registros" && t && lst(t.rows).length > 40 ? `<details data-det="inf-registros"><summary>Ver los ${lst(t.rows).length} registros</summary>${h}</details>` : h;
    }).join("");
    return `<h2 id="inf-c-${esc(c.id)}">${ico(c.icono)}${esc(c.n)}. ${esc(c.titulo)}</h2>${parrafos(c.intro)}${c.aviso ? `<div class="guia">${ico("estados-advertencia")}<div>${esc(c.aviso)}</div></div>` : ""}${cuerpo}`;
  }
  function cifrasHtml(r) {
    const c = [["Respuestas analizadas", r.participaciones], ["Completas", r.completas], ["Parciales", r.parciales], ["Roles con respuesta", r.roles.conRespuesta + " de " + r.roles.total],
      ["Roles requeridos con respuesta completa", r.requeridos.conEvidencia + " de " + r.requeridos.total], ["Actividades respondidas", r.actividades.respondidas + " de " + r.actividades.esperadas],
      ["Registros de los participantes", r.registros.deParticipantes], ["Registros simulados por el sistema", r.registros.simulados]];
    return `<dl class="inf-cifras">${c.map(x => `<div><dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd></div>`).join("")}</dl>`;
  }
  const avisosHtml = r => lst(r.avisos).length ? `<div class="guia inf-avisos">${ico("estados-advertencia")}<div><b>Tenga presente</b><ul class="lista">${r.avisos.map(a => `<li>${esc(a)}</li>`).join("")}</ul></div></div>` : "";
  const indiceHtml = (an, clase) => `<nav class="${clase}" aria-label="Contenido del informe"><h2>Contenido</h2><ol>${lst(an.capitulos).map(c => `<li><a href="#inf-c-${esc(c.id)}">${esc(c.titulo)}</a></li>`).join("")}</ol></nav>`;
  function vacioHtml(r) {
    const ileg = r && r.documentos && r.documentos.recibidos ? `<p>Se ${r.documentos.recibidos === 1 ? "recibió 1 documento, pero no se pudo leer" : "recibieron " + esc(r.documentos.recibidos) + " documentos, pero ninguno se pudo leer"}. Revíselos en «Respuestas».</p>` : "";
    return `<div class="card informe" id="informe"><h2 style="margin-top:0">${ico("investigacion-informe")}Informe consolidado</h2>
      <div class="qpanel">${ico("estados-pendiente")}Todavía no hay respuestas para analizar.</div>${ileg}
      <p>Para ver el informe:</p>
      <ol class="lista"><li>Vaya a «Respuestas» e importe los archivos que le enviaron los participantes, o tráigalos del servidor.</li><li>Revise que estén validados y que no estén excluidos del análisis.</li><li>Vuelva a «Resultados»: el informe se arma solo.</li></ol>
      <p class="mini">Las respuestas de cuentas de prueba o de demostración solo entran al análisis si usted las incluye.</p></div>`;
  }
  function vistaResultados(an) {
    const r = an && an.resumen;
    if (!r || !r.participaciones) return vacioHtml(r);
    return `<div class="card informe" id="informe"><h2 style="margin-top:0">${ico("investigacion-informe")}Informe consolidado</h2>
      <p class="mini">${esc(r.estudio.titulo)} · ${esc(r.escenario.n)} · análisis del ${esc(fechaSegura(Date.parse(r.generado)))}</p>
      ${cifrasHtml(r)}${avisosHtml(r)}${indiceHtml(an, "inf-indice")}
      ${an.capitulos.map(c => capituloHtml(an, c, true)).join("")}
      <h2 id="inf-exportar">${ico("acciones-exportar")}Llevarse el informe</h2>
      <div class="row inf-acciones"><button type="button" class="btn sec" data-act="informe-imprimir">${ico("acciones-imprimir")}Imprimir o guardar como PDF</button><button type="button" class="btn sec" data-act="informe-html">${ico("investigacion-informe")}Descargar el informe (HTML)</button><button type="button" class="btn sec" data-act="csv-todo">${ico("investigacion-archivo-csv")}Descargar todas las tablas (CSV)</button><button type="button" class="btn sec" data-act="datos-json">${ico("investigacion-archivo-json")}Descargar los datos consolidados (JSON)</button></div>
      <p class="mini inf-nota">El informe y las tablas no llevan nombres ni correos de los participantes. El archivo de datos consolidados trae los registros vigentes y las tablas, sin datos personales ni contraseñas.</p></div>`;
  }

  /* ---------- Informe imprimible (documento independiente, A4) ---------- */
  const CSS_IMPRESION = `
  @page { size:A4; margin:16mm 14mm 18mm; }
  body.print-doc { background:#fff; color:#1B2537; font-size:13px; line-height:19px; display:block; min-height:0; }
  .print-doc .wrap { max-width:1040px; padding:28px 24px 40px; margin:0 auto; flex:none; }
  .print-doc .card.informe { border:0; padding:0; margin:0; box-shadow:none; }
  .doc-cover { border-bottom:3px solid #162546; padding:0 0 18px; margin:0 0 20px; }
  .doc-cover .doc-kicker { font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:#5F6470; font-weight:700; }
  .doc-cover h1 { font-size:28px; line-height:34px; margin:6px 0 4px; color:#162546; }
  .doc-cover .doc-sub { font-size:14px; line-height:20px; color:#4E5563; margin:0 0 12px; }
  .print-doc .inf-cifras { grid-template-columns:repeat(4, minmax(0,1fr)); gap:8px; margin:0; } .print-doc .inf-cifras dd { font-size:18px; line-height:24px; }
  .doc-ficha { margin:0 0 18px; } .doc-ficha h2, .doc-toc h2 { font-size:14px; line-height:20px; margin:0 0 6px; border:0; padding:0; }
  .doc-ficha .kv { font-size:13px; line-height:19px; } .doc-ficha .guia { margin-top:12px; font-size:13px; line-height:19px; }
  .doc-toc { border:1px solid #DCDFE5; border-radius:8px; padding:12px 16px; margin:0 0 22px; break-inside:avoid; }
  .doc-toc ol { margin:0; padding-left:20px; columns:2; column-gap:28px; font-size:13px; line-height:20px; } .doc-toc a { color:inherit; text-decoration:none; font-weight:400; }
  .print-doc .informe h2 { font-size:17px; line-height:22px; margin:26px 0 8px; padding-bottom:6px; border-bottom:2px solid #162546; color:#162546; break-after:avoid; page-break-after:avoid; }
  .print-doc .informe h3 { font-size:13.5px; line-height:18px; margin:16px 0 4px; break-after:avoid; page-break-after:avoid; }
  .print-doc .twrap { overflow:visible; border:0; border-radius:0; margin:6px 0 4px; }
  .print-doc table.t { font-size:11px; line-height:15px; width:100%; table-layout:auto; border:1px solid #DCDFE5; }
  .print-doc table.t th { background:#EAECF0; color:#2D313F; font-size:9.5px; line-height:13px; letter-spacing:.02em; padding:5px 6px; white-space:normal; min-width:0; }
  .print-doc table.t td { padding:5px 6px; vertical-align:top; word-break:normal; overflow-wrap:anywhere; }
  .print-doc thead { display:table-header-group; } .print-doc tr { break-inside:avoid; page-break-inside:avoid; } .print-doc table.t tbody tr:hover { background:transparent; }
  .print-doc td.nw, .print-doc td.num { white-space:nowrap; } .print-doc .chip { border:1px solid #C9CED6; } .print-doc .mini { color:#5F6470; }
  .print-doc .inf-nota { font-size:11px; line-height:15px; margin:4px 0 0; break-before:avoid; page-break-before:avoid; } .print-doc .guia { break-inside:avoid; }
  .print-doc .doc-foot { margin-top:26px; padding-top:10px; border-top:1px solid #DCDFE5; font-size:11px; line-height:16px; color:#5F6470; }
  @media print { .print-doc .wrap { max-width:none; padding:0; } .print-doc .bp-icon, .print-doc table.t th, .print-doc .inf-cifras > div, .print-doc .chip, .print-doc .guia { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }
`;
  function informeHtml(an, estudio) {
    an = obj(an);
    const r = obj(an.resumen), e = estudioLimpio(estudio || r.estudio), hay = !!r.participaciones;
    const hoja = typeof document !== "undefined" && document && typeof document.querySelector === "function" ? document.querySelector("style") : null;
    // La hoja de estilos es la de la propia página; se evita que un cierre de etiqueta corte el bloque.
    const css = (hoja && typeof hoja.textContent === "string" ? hoja.textContent : "").replace(/<\/(style)/gi, "<\\/$1");
    const ficha = [["Estudio", e.titulo], ["Programa", e.programa], ["Institución", e.institucion], ["Investigador responsable", e.investigador], ["Director de la investigación", e.director], ["Comité de ética", e.comite],
      ["Escenario", obj(r.escenario).n || ESC.n], ["Rondas", R.map(x => x.n).join(" · ")], ["Análisis generado", fechaSegura(Date.parse(r.generado))]].filter(x => x[1]);
    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">
<meta name="robots" content="noindex,nofollow">
<title>Informe consolidado · ${esc(e.titulo)}</title>
<style>${css}${CSS_IMPRESION}</style>
</head>
<body class="print-doc">
<div class="wrap">
<header class="doc-cover"><div class="doc-kicker">Simulación de la ruta de incapacidad · informe consolidado</div><h1>${esc(e.titulo)}</h1><p class="doc-sub">${esc([e.subtitulo, e.programa, e.institucion].filter(Boolean).join(" · "))}</p>${hay ? cifrasHtml(r) : `<p>No hay respuestas analizadas.</p>`}</header>
<section class="doc-ficha"><h2>Ficha del estudio</h2><div class="kv">${ficha.map(x => `<b>${esc(x[0])}</b><span>${esc(x[1])}</span>`).join("")}</div>${hay ? avisosHtml(r) : ""}</section>
${indiceHtml(an, "doc-toc")}
<main class="card informe">${lst(an.capitulos).map(c => capituloHtml(an, c, false)).join("")}</main>
<footer class="doc-foot">${esc(ESC.nota)} Lo marcado como «simulado» lo genera el sistema para representar a los actores que no estaban conectados y al módulo propuesto; no es una integración real. Los participantes aparecen con el usuario de su cuenta, sin nombres ni correos.</footer>
</div>
</body>
</html>
`;
  }

  /* ---------- Exportaciones ---------- */
  function csvDeTabla(an, id) { const t = own(obj(obj(an).tablas), id); return t ? csvTabla(lst(t.cols), lst(t.rows)) : ""; }
  // Todas las tablas en un solo archivo: título, nota, encabezados y filas; un renglón en blanco entre tablas.
  function csvDeTodas(an) {
    an = obj(an);
    return [].concat(...lst(an.capitulos).map(c => lst(c.tablas).map((id, i) => { const t = obj(an.tablas)[id]; return t ? [csvCelda("Tabla " + c.n + "." + (i + 1) + " · " + t.titulo), csvCelda("Cómo se calcula: " + (t.nota || "")), csvTabla(lst(t.cols), lst(t.rows))].join("\r\n") : ""; }))).filter(Boolean).join("\r\n\r\n");
  }
  // Objeto para exportar como JSON: participantes sin datos personales, registros vigentes y tablas. Sin credenciales.
  function datosConsolidados(docs, opciones) {
    const an = analizar(docs, opciones), L = leer(docs, cuentasLimpias(obj(opciones).cuentas));
    return {
      instrumento:INSTRUMENTO, formato:FORMATO, version:VERSION, tipo:"consolidado", fecha:an.resumen.generado,
      estudio:an.resumen.estudio, escenario:{ id:ESC.id, n:ESC.n, nota:ESC.nota, rondas:R.map(r => ({ id:r.id, modo:r.modo, n:r.n })) },
      resumen:an.resumen,
      participantes:L.PS.map(P => { const k = obj(P.doc.consentimiento);
        return { id:P.id, usuario:P.usuario, alias:P.alias, actor:P.actor, rol:rolL(P.actor), estado:P.completa ? "completa" : "parcial", avance:{ hechas:P.hechas, total:P.total }, prueba:P.prueba, demo:P.demo, dioDatosPersonales:P.conDatos,
          consentimiento:{ aceptado:k.aceptado === true, t:typeof k.t === "number" ? k.t : null, version:txt(k.version, 20) }, generado:txt(P.doc.generado, 40), huella:txt(P.doc.huella, 80), registros:P.regs.length }; }),
      registros:[].concat(...L.PS.map(P => P.regs.map(x => Object.assign({}, x, { participacion:P.id, rol:P.actor })))),
      capitulos:an.capitulos, tablas:an.tablas
    };
  }

  return { analizar, vistaResultados, informeHtml, csvDeTabla, csvDeTodas, datosConsolidados };
})();
