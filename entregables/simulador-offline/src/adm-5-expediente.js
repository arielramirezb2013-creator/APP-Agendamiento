/* ============ Panel: resultados del instrumento de expediente ============
   Lee los documentos de respuesta del marco DGIT-PENSION-R1 y arma el informe con las medidas que
   pide el estudio: H1 (completitud de la evidencia requerida en el punto que resuelve, comparando
   las dos condiciones del mismo expediente), H2 (identificación de responsabilidades) y H3
   (reconstrucción de los accesos). Devuelve la misma forma que `analizar()` —{ resumen, capitulos,
   tablas }— para que el informe en pantalla, el imprimible y las exportaciones sirvan igual. */

const { analizarExp, datosExpConsolidados } = (() => {
  const { lst, obj, own, txt, fmtN, celN, cuantos, estad, contar, distTxt, fechaSegura,
    estudioLimpio, cuentasLimpias, vigentesDoc, rolL, rolC, esRol, origenTxt,
    filasPerfilResumen, COLS_PERFIL, filasPerfil, NOTA_PERFIL } = COMUN;

  /* ---------- El marco, las condiciones y las etiquetas del expediente ---------- */
  const COND = lst(EXP.protocolo.condiciones), CID = COND.map(c => c.id), CORTE = EXP.protocolo.corteHoras;
  const condN = id => { const c = COND.filter(x => x.id === id)[0]; return c ? c.n : (txt(id, 40) || "—"); };
  const casoDe = id => EXPM.casoExacto(id);
  const casoN = id => { const c = casoDe(id); return c ? c.id + " · " + c.persona.nombre : (txt(id, 40) || "—"); };
  const puntoN = (caso, pid) => { const p = caso && EXPM.puntoDe(caso, pid); return p ? p.id + " · " + p.n : (txt(pid, 40) || "—"); };
  const piezaN = (caso, k) => { const s = caso && EXPM.soporteDe(caso, k); return s ? k + " · " + s.n : (txt(k, 20) || "—"); };
  const estadoN = e => { const x = own(EXP.estados, e); return x ? x.n : e === "pendiente" ? "Llegó, sin verificar" : (txt(e, 30) || "—"); };
  const FIN_EXP = lst(obj(GUION.exp).finalidades);
  const finN = id => { const f = FIN_EXP.filter(x => x[0] === id)[0]; return f ? f[1] : (txt(id, 80) || "Sin declarar"); };
  const OPS_PUNTO = { resuelve:EXPM.opcionesPunto({}, { resuelve:true }), normal:EXPM.opcionesPunto({}, { resuelve:false }) };
  const opsPunto = p => p && p.resuelve ? OPS_PUNTO.resuelve : OPS_PUNTO.normal;
  const decisionN = (p, v) => { const o = opsPunto(p).filter(x => x[0] === v)[0]; return o ? o[1] : (txt(v, 60) || "—"); };
  const QUE = { consultar:"Consultas", solicitar:"Solicitudes", devolver:"Devoluciones", aceptar:"Aceptaciones", rechazar:"Rechazos" };
  const ACTOR_H2 = (caso, a) => { const x = caso.actores.filter(y => y.a === a)[0]; return x ? x.n : a === "nadie" ? "Ninguno de los anteriores" : a === "no_se" ? "No lo sé" : (txt(a, 60) || "—"); };
  const CAMPO_H3 = { actor:"Quién accedió", pieza:"A qué pieza", momento:"En qué momento", accion:"Qué acción", resultado:"Con qué resultado" };

  /* ---------- Cifras ---------- */
  const media = xs => { const v = xs.filter(x => typeof x === "number" && isFinite(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const pctTxt = x => x == null ? "—" : fmtN(x) + " %";
  const ppTxt = x => x == null ? "—" : (x > 0 ? "+" : "") + fmtN(x);
  const medTxt = xs => { const e = estad(xs); return e ? fmtN(e.med) : "—"; };
  const nOk = (k, n) => n ? k + " de " + n : "—";

  /* ---------- Lectura de los documentos ---------- */
  const esDocExp = doc => !!(doc && typeof doc === "object" && obj(doc.expediente).marco);
  function leerExp(docs, ctas) {
    const porId = Object.create(null), ctaDe = Object.create(null);
    let ilegibles = 0, repetidos = 0, otroInstrumento = 0, sinCatalogo = 0;
    ctas.forEach(q => { ctaDe[q.u] = q; });
    lst(docs).forEach(doc => {
      if (!esDocExp(doc)) { if (doc && typeof doc === "object" && Array.isArray(doc.registros)) otroInstrumento++; else ilegibles++; return; }
      const ok = doc.cuenta && esRol(doc.cuenta.actor) && doc.participante && typeof doc.participante.id === "string" && txt(doc.participante.id, 60) && Array.isArray(doc.registros);
      if (!ok) { ilegibles++; return; }
      if (!casoDe(txt(obj(doc.expediente).caso, 40))) { sinCatalogo++; return; }
      const id = txt(doc.participante.id, 60), previo = porId[id];
      if (previo) { repetidos++; if ((Date.parse(previo.generado) || 0) >= (Date.parse(doc.generado) || 0)) return; }
      porId[id] = doc;
    });
    const PS = Object.keys(porId).map(id => {
      const doc = porId[id], c = doc.cuenta, X = obj(doc.expediente), caso = casoDe(txt(X.caso, 40));
      const usuario = txt(normUsuario(c.usuario), 60) || "sin-usuario", cta = ctaDe[usuario] || null, datos = obj(doc.participante.datos);
      const regs = vigentesDoc(doc);
      const P = { id, doc, usuario, alias:usuario, actor:c.actor, caso:caso, cond:{}, puntos:{}, actu:[], obs:[], enc:null, h2:null, h3:null,
        orden:lst(X.orden).filter(x => CID.indexOf(x) >= 0), completa:doc.estado === "completa", demo:c.demo === true,
        prueba:c.demo === true || c.prueba === true || !!(cta && cta.p), enLista:!!cta, rolCuenta:cta ? cta.a : null,
        conDatos:Object.keys(datos).some(k => !!txt(datos[k])), generado:Date.parse(doc.generado) || 0, regs, ajenos:0, conduccion:0 };
      CID.forEach(k => { P.cond[k] = obj(own(obj(X.condiciones), k)); P.puntos[k] = {}; });
      regs.forEach(x => {
        if (x.origen === "sistema") { P.conduccion++; return; }
        if (x.origen !== "participante") { P.ajenos++; return; }
        const cond = CID.indexOf(x.ronda) >= 0 ? x.ronda : null;
        if (x.tipo === "punto" && cond && EXPM.puntoDe(caso, x.payload.punto)) P.puntos[cond][x.payload.punto] = x;
        else if (x.tipo === "actuacion" && cond) P.actu.push(x);
        else if (x.tipo === "observacion") P.obs.push(x);
        else if (x.tipo === "encuesta") P.enc = x;
        else if (x.tipo === "h2") P.h2 = x;
        else if (x.tipo === "h3") P.h3 = x;
        else P.ajenos++;
      });
      // Avance como lo cuenta el simulador: los puntos que le toca trabajar en las dos condiciones, más H2 y H3.
      P.bloques = EXPM.bloques(caso, P.actor, usuario);
      P.total = P.bloques.filter(b => b.tipo === "punto").length + 2;
      P.hechas = CID.reduce((n, k) => n + Object.keys(P.puntos[k]).length, 0) + (P.h2 ? 1 : 0) + (P.h3 ? 1 : 0);
      return P;
    });
    const orden = BP.actores.map(a => a.id);
    PS.sort((a, b) => orden.indexOf(a.actor) - orden.indexOf(b.actor) || (a.usuario < b.usuario ? -1 : a.usuario > b.usuario ? 1 : 0) || (a.id < b.id ? -1 : 1));
    const veces = contar(PS.map(P => P.usuario));
    PS.forEach(P => { if (veces[P.usuario] > 1) P.alias = P.usuario + " (" + P.id.slice(-4) + ")"; if (P.prueba) P.alias += " · prueba"; });
    return { PS, ilegibles, repetidos, otroInstrumento, sinCatalogo, recibidos:lst(docs).length };
  }

  /* ---------- H1: la completitud en el punto que resuelve, por condición ---------- */
  const puntoResuelve = caso => caso.puntos.filter(p => p.resuelve)[0] || null;
  // La completitud que cuenta es la del momento en que cerró la decisión que resuelve; si no llegó
  // a cerrarla, la de la instantánea del protocolo y, en último lugar, la del cierre de la condición.
  function h1De(P, cond) {
    const pr = puntoResuelve(P.caso), reg = pr ? P.puntos[cond][pr.id] : null;
    const c = reg ? obj(reg.payload.completitud) : obj(P.cond[cond]).instantanea ? obj(obj(P.cond[cond]).instantanea.completitud) : obj(obj(P.cond[cond]).completitud);
    return typeof c.ok === "number" && typeof c.total === "number" && c.total > 0
      ? { ok:c.ok, total:c.total, pct:Math.round(c.ok * 1000 / c.total) / 10, cerrada:!!reg } : null;
  }
  const horasDe = (P, cond) => { const h = obj(P.cond[cond]).horas; return typeof h === "number" && isFinite(h) ? h : null; };
  function decisionDe(P, cond) {
    const pr = puntoResuelve(P.caso), reg = pr ? P.puntos[cond][pr.id] : null;
    return reg ? (txt(reg.payload.decisionTxt, 80) || decisionN(pr, reg.payload.decision)) : "No llegó a decidir";
  }
  // Diferencia entre condiciones en puntos porcentuales, para una participación que hizo las dos.
  function difDe(P) {
    const a = h1De(P, "actual"), m = h1De(P, "modulo");
    return a && m ? Math.round((m.pct - a.pct) * 10) / 10 : null;
  }

  /* ---------- El informe ---------- */
  function analizarExp(docs, opciones) {
    opciones = obj(opciones);
    const t0 = typeof opciones.ahora === "number" ? opciones.ahora : ahora();
    const est = estudioLimpio(opciones.estudio), ctas = cuentasLimpias(opciones.cuentas);
    const L = leerExp(docs, ctas), PS = L.PS;
    const tablas = {}, capitulos = [];
    const T = (id, titulo, cols, rows, nota) => { tablas[id] = { titulo, cols, rows, nota }; return id; };
    const cap = (id, titulo, icono, intro, ids, aviso) => { const c = { id, n:capitulos.length + 1, titulo, icono, intro, tablas:ids }; if (aviso) c.aviso = aviso; capitulos.push(c); return c; };
    const porRol = {}; BP.actores.forEach(a => { porRol[a.id] = PS.filter(P => P.actor === a.id); });
    const casos = EXP.casos.filter(c => PS.some(P => P.caso.id === c.id));
    const conH1 = cond => PS.filter(P => h1De(P, cond));
    const nComp = PS.filter(P => P.completa).length, nPrueba = PS.filter(P => P.prueba).length, nDatos = PS.filter(P => P.conDatos).length;
    const rolesCon = BP.actores.filter(a => porRol[a.id].length).length;
    const invitadas = ctas.filter(q => !q.p);
    const H1 = {}; CID.forEach(k => { H1[k] = { pct:media(conH1(k).map(P => h1De(P, k).pct)), horas:media(PS.map(P => horasDe(P, k)).filter(x => x != null)) }; });
    const difs = PS.map(difDe).filter(x => x != null);
    const h2ok = PS.filter(P => P.h2).map(P => obj(obj(P.h2.payload).calificacion).ok);
    const h3ok = PS.filter(P => P.h3).map(P => obj(obj(P.h3.payload).calificacion).ok);
    const h3campos = PS.filter(P => P.h3).map(P => obj(obj(P.h3.payload).calificacion).campos);

    /* 1. Qué se examinó y quiénes participaron */
    T("estudio", "Estudio, marco e instrumento", ["Dato", "Valor"], [
      ["Estudio", est.titulo || "—"], ["Programa", est.programa || "—"], ["Institución", est.institucion || "—"]
    ].concat([["Investigador responsable", est.investigador], ["Director de la investigación", est.director], ["Comité de ética", est.comite]].filter(x => x[1]), [
      ["Identificador del estudio", est.id || "—"],
      ["Marco del instrumento", EXP.marco.id],
      ["Pregunta de investigación", EXP.marco.pregunta],
      ["Expedientes con respuestas", casos.length ? casos.map(c => c.id).join(" · ") : "—"],
      ["Condiciones comparadas", COND.map(c => c.n).join(" y ")],
      ["Corte del piloto", CORTE + " horas virtuales por condición"],
      ["Respuestas recibidas", PS.length], ["Completas", nComp], ["Parciales", PS.length - nComp],
      ["De cuentas de prueba o de demostración", nPrueba],
      ["Roles con al menos una respuesta", rolesCon + " de " + BP.actores.length],
      ["Participantes que dieron datos personales", nDatos + " de " + PS.length],
      ["Análisis generado", fechaSegura(t0)]
    ]), "Los datos del estudio son los que el investigador definió en el panel. El marco, la pregunta y las condiciones son los del documento del instrumento. Los conteos salen de los documentos de respuestas analizados: uno por participación.");
    // Las hipótesis tal como las formula el documento del instrumento, con su código: así viajan también en el CSV.
    T("hipotesis", "Hipótesis del marco, tal como están formuladas", ["Código", "Nombre", "Formulación", "Variable", "Regla de medida"],
      EXP.marco.hipotesis.map(h => [h.id, h.n || "", h.t, h.variable || "—", h.regla || "—"]),
      "Textuales, del documento del instrumento (" + EXP.marco.id + "). Los códigos H1, H2 y H3 son los que usan las tablas de este informe; el participante no los ve.");
    T("participacion_rol", "Respuestas recibidas por rol", ["Rol", "Grupo", "Cuentas invitadas", "Respuestas recibidas", "Completas", "Parciales", "De cuentas de prueba", "Expedientes"],
      BP.actores.map(a => { const ps = porRol[a.id];
        return [rolL(a.id), a.grupo, ctas.length ? invitadas.filter(q => q.a === a.id).length : "—", ps.length, ps.filter(P => P.completa).length, ps.filter(P => !P.completa).length, ps.filter(P => P.prueba).length,
          ps.length ? Object.keys(contar(ps.map(P => P.caso.id))).sort().join(" · ") : "—"]; })
        .concat([["Total", "", ctas.length ? invitadas.length : "—", PS.length, nComp, PS.length - nComp, nPrueba, casos.map(c => c.id).join(" · ") || "—"]]),
      "Una respuesta es un documento de un participante. Es completa si recorrió las dos condiciones y respondió las preguntas de cierre; si no, es parcial.");
    T("participantes", "Participaciones analizadas", ["Participante", "Rol", "Expediente", "Orden de las condiciones", "Estado", "Avance", "Tipo de cuenta", "Fecha del documento", "Registros vigentes"],
      PS.map(P => [P.alias, rolL(P.actor), P.caso.id, P.orden.map(condN).join(" → ") || "—", P.completa ? "Completa" : "Parcial", P.hechas + " de " + P.total,
        P.demo ? "De demostración" : P.prueba ? "De prueba" : ctas.length && !P.enLista ? "No figura en las cuentas del proyecto" : "Invitada",
        P.generado ? fechaSegura(P.generado) : "—", P.regs.length]),
      "Cada fila es una participación, con el usuario de su cuenta y nunca con su nombre. El orden de las condiciones lo alterna el simulador según la cuenta, como pide el protocolo. El avance cuenta los puntos de decisión de las dos condiciones más las dos preguntas de cierre.");
    T("perfil", "Perfil profesional de quienes respondieron", ["Dato", "Lo que declararon"], filasPerfilResumen(PS), NOTA_PERFIL);
    T("perfil_detalle", "Perfil declarado, participación por participación", COLS_PERFIL, filasPerfil(PS), NOTA_PERFIL + " Cada fila es una participación, con el usuario de su cuenta.");
    cap("participacion", "Qué se examinó y quiénes participaron", "actores-participante",
      "Cada participante recorrió el mismo expediente dos veces: una con los canales reconstruidos del flujo actual y otra con el módulo interoperable, en el orden que le tocó por su cuenta y con el expediente reiniciado al empezar cada condición. En cada punto de decisión vio los soportes requeridos con su estado y su criterio de conformidad, declaró con qué finalidad consultaba y pudo consultar, solicitar o devolver, con un corte de " + CORTE + " horas virtuales.\n"
      + "Se analizaron " + plural(PS.length, "respuesta", "respuestas") + ": " + nComp + " " + (nComp === 1 ? "completa" : "completas") + " y " + (PS.length - nComp) + " " + (PS.length - nComp === 1 ? "parcial" : "parciales") + ", de " + rolesCon + " de los " + BP.actores.length + " roles, sobre " + plural(casos.length, "expediente", "expedientes") + ".\n" + EXP.marco.nota,
      ["estudio", "hipotesis", "participacion_rol", "participantes", "perfil", "perfil_detalle"]);

    /* 2. H1 · Completitud de la evidencia */
    const h1 = EXP.marco.hipotesis.filter(h => h.id === "H1")[0] || {};
    T("h1_condicion", "Completitud en el punto que resuelve, por condición", ["Condición", "Participaciones con dato", "Completitud media", "Mediana", "Mínimo", "Máximo", "Horas usadas: mediana", "Horas usadas: máximo", "Se quedaron sin margen"],
      CID.map(k => { const ps = conH1(k), pcts = ps.map(P => h1De(P, k).pct), e = estad(pcts), hs = PS.map(P => horasDe(P, k)).filter(x => x != null), eh = estad(hs);
        return [condN(k), ps.length, pctTxt(media(pcts)), e ? pctTxt(e.med) : "—", e ? pctTxt(e.min) : "—", e ? pctTxt(e.max) : "—",
          eh ? fmtN(eh.med) : "—", eh ? fmtN(eh.max) : "—", hs.filter(h => h > CORTE - 2).length]; }),
      "La completitud es la proporción de elementos de evidencia requeridos que, en el momento de cerrar la decisión que resuelve, estaban en el expediente y cumplían su criterio de conformidad: un soporte pedido no cuenta hasta que llega, se verifica y se acepta. «Se quedaron sin margen» cuenta las participaciones que terminaron la condición a menos de 2 horas del corte de " + CORTE + ".");
    T("h1_rol", "Completitud y horas por rol, en las dos condiciones", ["Rol", "Participaciones", COND[0].n + ": completitud", COND[1].n + ": completitud", "Diferencia (puntos porcentuales)", COND[0].n + ": horas", COND[1].n + ": horas"],
      BP.actores.filter(a => porRol[a.id].length).map(a => { const ps = porRol[a.id];
        const pa = media(ps.filter(P => h1De(P, CID[0])).map(P => h1De(P, CID[0]).pct)), pm = media(ps.filter(P => h1De(P, CID[1])).map(P => h1De(P, CID[1]).pct));
        const ds = ps.map(difDe).filter(x => x != null);
        return [rolL(a.id), ps.length, pctTxt(pa), pctTxt(pm), ds.length ? ppTxt(media(ds)) : "—",
          fmtN(media(ps.map(P => horasDe(P, CID[0])).filter(x => x != null)) || 0), fmtN(media(ps.map(P => horasDe(P, CID[1])).filter(x => x != null)) || 0)]; }),
      "Promedios por rol. La diferencia se calcula participación por participación (módulo menos flujo actual) y solo con quienes tienen dato en las dos condiciones, de modo que cada persona es su propio control.");
    T("h1_caso", "Completitud por expediente", ["Expediente", "Quién solicita", "Punto que resuelve", "Requeridos", "Conformes al radicar", "Participaciones", COND[0].n, COND[1].n, "Diferencia (pp)"],
      casos.map(c => { const pr = puntoResuelve(c), ps = PS.filter(P => P.caso.id === c.id), ds = ps.map(difDe).filter(x => x != null);
        return [c.id, c.persona.nombre, pr ? pr.id : "—", pr ? pr.requiere.length : "—", pr ? EXPM.inicioDe(c, pr.id) : "—", ps.length,
          pctTxt(media(ps.filter(P => h1De(P, CID[0])).map(P => h1De(P, CID[0]).pct))), pctTxt(media(ps.filter(P => h1De(P, CID[1])).map(P => h1De(P, CID[1]).pct))), ds.length ? ppTxt(media(ds)) : "—"]; }),
      "«Conformes al radicar» es el cociente del documento del instrumento: cuántos de los soportes requeridos por el punto estaban conformes cuando se radicó el expediente, antes de cualquier actuación del participante.");
    T("h1_participacion", "Completitud, horas y decisión, participación por participación", ["Participante", "Rol", "Expediente", "Orden", COND[0].n + ": conformes", COND[0].n + ": horas", COND[0].n + ": decisión", COND[1].n + ": conformes", COND[1].n + ": horas", COND[1].n + ": decisión", "Diferencia (pp)"],
      PS.map(P => { const a = h1De(P, CID[0]), m = h1De(P, CID[1]), d = difDe(P);
        return [P.alias, rolL(P.actor), P.caso.id, P.orden.map(condN).join(" → ") || "—",
          a ? nOk(a.ok, a.total) : "—", horasDe(P, CID[0]) == null ? "—" : celN(horasDe(P, CID[0])), decisionDe(P, CID[0]),
          m ? nOk(m.ok, m.total) : "—", horasDe(P, CID[1]) == null ? "—" : celN(horasDe(P, CID[1])), decisionDe(P, CID[1]),
          d == null ? "—" : ppTxt(d)]; }),
      "Una fila por participación. «Conformes» son los requeridos del punto que resuelve que estaban disponibles y conformes al cerrar esa decisión. La decisión es la que la persona tomó en ese punto.");
    T("h1_soporte", "Dónde se rompe la completitud: soporte por soporte", ["Expediente", "Soporte", "Quién lo custodia", "Estado al radicar", "Conforme al decidir · " + COND[0].n, "Conforme al decidir · " + COND[1].n, "Participaciones"],
      [].concat(...casos.map(c => { const pr = puntoResuelve(c), ps = PS.filter(P => P.caso.id === c.id);
        return pr ? pr.requiere.map(k => { const s = EXPM.soporteDe(c, k);
          const cuenta = cond => ps.filter(P => { const reg = P.puntos[cond][pr.id]; const ss = reg ? lst(reg.payload.soportes).filter(x => x.k === k)[0] : null; return ss && ss.estado === "conforme" && ss.aceptado; }).length;
          return [c.id, piezaN(c, k), s ? s.custN : "—", s ? estadoN(s.estado) : "—", cuenta(CID[0]), cuenta(CID[1]), ps.length]; }) : []; })),
      "Para cada soporte requerido por la decisión que resuelve, en cuántas participaciones quedó conforme y aceptado al cerrarla, en cada condición. Es la lectura fina de H1: muestra qué pieza queda fuera y con qué condición se consigue.");
    cap("h1", "H1 · Completitud de la evidencia requerida", "capitulos-decision-avance",
      txt(h1.t, 1200) + "\nVariable: " + txt(h1.variable, 200) + ". Regla de medida: " + txt(h1.regla, 400) + "\n"
      + (difs.length ? "En las " + difs.length + " participaciones con dato en las dos condiciones, la diferencia media es de " + ppTxt(media(difs)) + " puntos porcentuales a favor del módulo interoperable (" + pctTxt(H1[CID[1]].pct) + " frente a " + pctTxt(H1[CID[0]].pct) + ")."
        : "Todavía no hay participaciones con dato en las dos condiciones: la comparación se podrá leer cuando las haya."),
      ["h1_condicion", "h1_rol", "h1_caso", "h1_participacion", "h1_soporte"],
      "Son datos de una simulación con expedientes sintéticos y un corte de " + CORTE + " horas virtuales. Describen el comportamiento de los participantes en el instrumento, no el rendimiento de una integración real.");

    /* 3. Las actuaciones y las decisiones */
    const ACTU = [].concat(...PS.map(P => P.actu.map(x => ({ P, x }))));
    const deQue = (cond, que) => ACTU.filter(o => o.x.ronda === cond && o.x.payload.que === que).length;
    T("actuaciones", "Actuaciones sobre los soportes, por condición", ["Condición"].concat(Object.keys(QUE).map(k => QUE[k]), ["Consultas denegadas", "Horas usadas: mediana"]),
      CID.map(k => [condN(k)].concat(Object.keys(QUE).map(q => deQue(k, q)),
        [ACTU.filter(o => o.x.ronda === k && o.x.payload.denegado === true).length, medTxt(PS.map(P => horasDe(P, k)).filter(x => x != null))])),
      "Cada actuación cuesta horas virtuales, y cuestan menos con el módulo que con el flujo actual: por eso la misma ruta de actuaciones deja más margen dentro del corte. Las consultas denegadas son las que el control de acceso por finalidad no autorizó.");
    T("actuaciones_rol", "Actuaciones por rol y condición", ["Rol", "Condición", "Consultas", "Solicitudes", "Devoluciones", "Aceptaciones", "Rechazos", "Denegadas", "Horas usadas: mediana"],
      [].concat(...BP.actores.filter(a => porRol[a.id].length).map(a => CID.map(k => { const os = ACTU.filter(o => o.P.actor === a.id && o.x.ronda === k);
        return [rolL(a.id), condN(k)].concat(Object.keys(QUE).map(q => os.filter(o => o.x.payload.que === q).length),
          [os.filter(o => o.x.payload.denegado === true).length, medTxt(porRol[a.id].map(P => horasDe(P, k)).filter(x => x != null))]); }))),
      "Lo mismo, abierto por rol: deja ver quién pide, quién devuelve y quién decide con lo que tiene.");
    T("finalidades", "Con qué finalidad se consultó, y qué se denegó", ["Finalidad declarada", "Consultas", "Sobre piezas clínicas", "Denegadas", "Roles que la declararon"],
      FIN_EXP.map(f => { const os = ACTU.filter(o => o.x.payload.que === "consultar" && o.x.payload.finalidad === f[0]);
        return [f[1], os.length, os.filter(o => EXPM.clinicas.indexOf(o.x.payload.pieza) >= 0).length, os.filter(o => o.x.payload.denegado === true).length,
          Object.keys(contar(os.map(o => o.P.actor))).map(rolC).join(" · ") || "—"]; }).filter(r => r[1] > 0),
      "Antes de consultar, el participante declara para qué lo hace. El módulo abre solo los campos que esa finalidad autoriza: una finalidad de control administrativo no abre las piezas clínicas (" + EXPM.clinicas.join(", ") + ") y la denegación queda registrada. Solo aparecen las finalidades que alguien declaró.");
    T("decisiones", "Qué decidieron en cada punto", ["Expediente", "Punto", "Quién decide", "Condición", "Participaciones", "Lo que decidieron"],
      [].concat(...casos.map(c => [].concat(...c.puntos.map(p => CID.map(k => { const regs = PS.filter(P => P.caso.id === c.id).map(P => P.puntos[k][p.id]).filter(Boolean);
        return [c.id, puntoN(c, p.id), p.decideN, condN(k), regs.length, distTxt(opsPunto(p), contar(regs.map(r => r.payload.decision)))]; }))))).filter(r => r[4] > 0),
      "Distribución de las decisiones en cada punto y condición. Solo aparecen los puntos con al menos una decisión registrada.");
    cap("actuaciones", "Cómo buscaron la evidencia y qué decidieron", "acciones-solicitar",
      "El instrumento registra cada actuación sobre los soportes —consultar, solicitar, devolver, verificar y aceptar o rechazar— con su finalidad declarada, su costo en horas virtuales y si el control de acceso la denegó. Esta es la parte que explica los resultados de H1: con qué actuaciones llegó cada participante al punto que resuelve y qué decidió allí.",
      ["actuaciones", "actuaciones_rol", "finalidades", "decisiones"]);

    /* 4. H2 · Identificación de responsabilidades */
    const h2h = EXP.marco.hipotesis.filter(h => h.id === "H2")[0] || {};
    T("h2_global", "Responsabilidades identificadas", ["Dato", "Valor"], [
      ["Participaciones que respondieron", cuantos(h2ok.length, PS.length)],
      ["Aciertos medios", h2ok.length ? fmtN(media(h2ok)) + " de 6" : "—"],
      ["Mediana", h2ok.length ? medTxt(h2ok) + " de 6" : "—"],
      ["Proporción media de acierto", h2ok.length ? pctTxt(media(h2ok) * 100 / 6) : "—"],
      ["Distribución de aciertos", h2ok.length ? [0, 1, 2, 3, 4, 5, 6].filter(n => h2ok.filter(x => x === n).length).map(n => n + " de 6: " + h2ok.filter(x => x === n).length).join(" · ") : "—"],
      ["Respuestas «No lo sé»", [].concat(...PS.filter(P => P.h2).map(P => lst(obj(P.h2.payload).calificacion.detalle))).filter(d => d.dada === "no_se").length]
    ], "Se le piden seis tareas del expediente y debe decir a quién le corresponde cada una. Se cuenta como acierto la coincidencia con la respuesta de referencia del documento del instrumento.");
    T("h2_rol", "Responsabilidades identificadas por rol", ["Rol", "Participaciones", "Aciertos medios de 6", "Proporción de acierto", "Mínimo", "Máximo"],
      BP.actores.filter(a => porRol[a.id].some(P => P.h2)).map(a => { const xs = porRol[a.id].filter(P => P.h2).map(P => obj(obj(P.h2.payload).calificacion).ok), e = estad(xs);
        return [rolL(a.id), xs.length, fmtN(media(xs)), pctTxt(media(xs) * 100 / 6), e ? e.min : "—", e ? e.max : "—"]; }),
      "Promedio de aciertos de las seis preguntas, por el rol que representó cada participante.");
    T("h2_item", "Tarea por tarea: quién creen que responde", ["Expediente", "Id", "Tarea", "Función", "Responsable de referencia", "Aciertos", "Respondieron", "Respuesta equivocada más frecuente"],
      [].concat(...casos.map(c => c.h2.map(h => { const ds = [].concat(...PS.filter(P => P.caso.id === c.id && P.h2).map(P => lst(obj(P.h2.payload).calificacion.detalle).filter(d => d.id === h.id)));
        const malas = contar(ds.filter(d => !d.correcta).map(d => d.dada)), ks = Object.keys(malas).sort((x, y) => malas[y] - malas[x]);
        return [c.id, h.id, h.tarea, h.funcion, ACTOR_H2(c, h.ref), ds.filter(d => d.correcta).length, ds.length,
          ks.length ? ACTOR_H2(c, ks[0]) + " (" + malas[ks[0]] + ")" : "—"]; }))).filter(r => r[6] > 0),
      "Una fila por tarea de cada expediente. La última columna dice a quién se le atribuye la tarea con más frecuencia cuando la respuesta no coincide con la de referencia: es donde la responsabilidad se desdibuja.");
    cap("h2", "H2 · Identificación de responsabilidades", "gobernanza-responsable-plazo",
      txt(h2h.t, 1200) + "\nVariable: " + txt(h2h.variable, 200) + ". Regla de medida: " + txt(h2h.regla, 400),
      ["h2_global", "h2_rol", "h2_item"]);

    /* 5. H3 · Trazabilidad de los accesos */
    const h3h = EXP.marco.hipotesis.filter(h => h.id === "H3")[0] || {};
    const detH3 = [].concat(...PS.filter(P => P.h3).map(P => lst(obj(P.h3.payload).calificacion.detalle).map((d, i) => ({ P, d, i }))));
    T("h3_global", "Accesos reconstruidos", ["Dato", "Valor"], [
      ["Participaciones que respondieron", cuantos(h3ok.length, PS.length)],
      ["Accesos reconstruidos por completo", h3ok.length ? fmtN(media(h3ok)) + " de 4" : "—"],
      ["Proporción media de acceso completo", h3ok.length ? pctTxt(media(h3ok) * 100 / 4) : "—"],
      ["Elementos correctos", h3campos.length ? fmtN(media(h3campos)) + " de 20" : "—"],
      ["Proporción media de elementos correctos", h3campos.length ? pctTxt(media(h3campos) * 100 / 20) : "—"],
      ["Distribución de accesos completos", h3ok.length ? [0, 1, 2, 3, 4].filter(n => h3ok.filter(x => x === n).length).map(n => n + " de 4: " + h3ok.filter(x => x === n).length).join(" · ") : "—"]
    ], "De cada acceso de referencia se le piden los cinco elementos que exige el marco: quién accedió, a qué pieza, en qué momento, con qué acción y con qué resultado. Un acceso cuenta como reconstruido solo si los cinco coinciden.");
    T("h3_elemento", "Qué elemento del acceso se pierde", ["Elemento", "Correctos", "Respondidos", "Proporción"],
      EXPM.camposH3.map(k => { const cs = [].concat(...detH3.map(o => lst(o.d.campos).filter(c => c.k === k)));
        return [CAMPO_H3[k] || k, cs.filter(c => c.correcta).length, cs.length, cs.length ? pctTxt(cs.filter(c => c.correcta).length * 100 / cs.length) : "—"]; }),
      "Suma de los cinco elementos de todos los accesos de todas las participaciones. Dice cuál de los cinco se reconstruye peor: es la lectura fina de la trazabilidad.");
    T("h3_acceso", "Acceso por acceso", ["Expediente", "Acceso", "Quién accedió", "Pieza", "Momento de referencia", "Resultado de referencia", "Reconstruidos completos", "Respondieron", "Elementos correctos de 5"],
      [].concat(...casos.map(c => c.h3.map((h, i) => { const id = "A" + (i + 1), os = detH3.filter(o => o.P.caso.id === c.id && o.d.id === id);
        return [c.id, id, ACTOR_H2(c, h.actor), piezaN(c, h.pieza), h.momento + " (" + EXPM.tramoDe(h.momento) + " h)", h.denegado ? "Se denegó" : "Se entregó lo pedido",
          os.filter(o => o.d.correcta).length, os.length, os.length ? fmtN(media(os.map(o => lst(o.d.campos).filter(c2 => c2.correcta).length))) : "—"]; }))).filter(r => r[7] > 0),
      "Los cuatro accesos de referencia de cada expediente, con lo que los participantes alcanzaron a reconstruir de cada uno. Solo aparecen los accesos con al menos una respuesta.");
    cap("h3", "H3 · Trazabilidad de los accesos", "gobernanza-trazabilidad",
      txt(h3h.t, 1200) + "\nVariable: " + txt(h3h.variable, 200) + ". Regla de medida: " + txt(h3h.regla, 400),
      ["h3_global", "h3_elemento", "h3_acceso"]);

    /* 6. Lo que escribieron: la tabla buscable */
    const TEXTOS = [];
    PS.forEach(P => {
      CID.forEach(k => Object.keys(P.puntos[k]).forEach(pid => { const x = P.puntos[k][pid], pl = obj(x.payload);
        if (txt(pl.porQue)) TEXTOS.push([P.alias, rolL(P.actor), P.caso.id, condN(k), puntoN(P.caso, pid), "Por qué decidió así", txt(pl.porQue, 2000)]);
        if (txt(pl.obs)) TEXTOS.push([P.alias, rolL(P.actor), P.caso.id, condN(k), puntoN(P.caso, pid), "Lo que quiso añadir del punto", txt(pl.obs, 2000)]);
      }));
      P.obs.forEach(x => { const pl = obj(x.payload);
        if (txt(pl.texto)) TEXTOS.push([P.alias, rolL(P.actor), P.caso.id, condN(pl.cond), lst(pl.puntos).join(" · ") || "—", "Observación sobre los puntos que no decide", txt(pl.texto, 2000)]); });
    });
    T("textos", "Lo que escribieron los participantes", ["Participante", "Rol", "Expediente", "Condición", "Punto", "Qué se le preguntó", "Lo que escribió"], TEXTOS,
      "Todo el texto libre del recorrido: la motivación de cada decisión, lo que quiso añadir en cada punto y las observaciones de los tramos que su rol no decide. La caja de búsqueda filtra lo que se ve en pantalla; la exportación a CSV lleva la tabla completa.");
    cap("textos", "Lo que escribieron los participantes", "acciones-observar",
      "Cada paso del instrumento deja un espacio en blanco. Aquí está todo lo que escribieron, con su rol, su expediente, su condición y el punto en el que lo escribieron. Busque por palabras: la caja de arriba de la tabla filtra por cualquier columna, de modo que puede leer, por ejemplo, todo lo que dijo un rol sobre un soporte.",
      ["textos"]);

    /* 7. Registro completo */
    const DET = {
      punto:pl => "Punto " + txt(pl.punto, 10) + " · " + (txt(pl.decisionTxt, 120) || txt(pl.decision, 40)) + " · conformes " + obj(pl.completitud).ok + " de " + obj(pl.completitud).total + " · " + celN(pl.horas) + " h",
      actuacion:pl => (QUE[pl.que] || txt(pl.que, 20)) + " · " + txt(pl.pieza, 10) + " · finalidad: " + finN(pl.finalidad) + (pl.denegado ? " · DENEGADA" : "") + " · " + celN(pl.horas) + " h",
      observacion:pl => "Observación sobre " + (lst(pl.puntos).join(", ") || "—"),
      h2:pl => "Responsabilidades: " + obj(pl.calificacion).ok + " de " + obj(pl.calificacion).total,
      h3:pl => "Accesos: " + obj(pl.calificacion).ok + " de " + obj(pl.calificacion).total + " completos, " + obj(pl.calificacion).campos + " de " + obj(pl.calificacion).camposTotal + " elementos",
      encuesta:() => "Encuesta de perfil respondida",
      inicio_condicion:pl => "Comienza la condición " + condN(pl.cond),
      cierre_condicion:pl => "Cierra la condición " + condN(pl.cond) + " con " + celN(pl.horas) + " h",
      cierre:() => "Cierra el recorrido"
    };
    const TIPO_REG_EXP = { punto:"Decisión en un punto", actuacion:"Actuación sobre un soporte", observacion:"Observación", h2:"Responsabilidades (H2)", h3:"Accesos (H3)", encuesta:"Encuesta de perfil", inicio_condicion:"Inicio de condición", cierre_condicion:"Cierre de condición", cierre:"Cierre", avance:"Avance" };
    T("registros", "Registro completo de los documentos analizados", ["Fecha", "Participante", "Rol", "Expediente", "Condición", "Punto", "Origen", "Tipo", "Detalle", "Versión"],
      [].concat(...PS.map(P => P.regs.map(x => { const pl = obj(x.payload), f = own(DET, x.tipo);
        return [fechaSegura(x.t), P.alias, rolL(P.actor), P.caso.id, CID.indexOf(x.ronda) >= 0 ? condN(x.ronda) : "—", txt(x.paso, 10) || "—", origenTxt(x),
          own(TIPO_REG_EXP, x.tipo) || txt(x.tipo, 30), f ? f(pl) : "—", typeof x.version === "number" ? x.version : 1]; }))),
      "Todos los registros vigentes, en el orden en que ocurrieron. No incluye los reemplazados por una corrección del participante. Los registros de conducción los escribe el simulador al abrir y cerrar cada condición.");
    cap("registros", "Registro completo", "documentos-evidencia",
      "El detalle de lo que quedó registrado en cada documento. Sirve para auditar cualquier cifra de este informe: cada fila de arriba se puede rastrear hasta estas líneas.",
      ["registros"]);

    /* Avisos y resumen */
    const avisos = [];
    const incompletas = PS.filter(P => P.completa && P.hechas < P.total);
    if (L.otroInstrumento) avisos.push(plural(L.otroInstrumento, "respuesta corresponde", "respuestas corresponden") + " al recorrido de la ruta de incapacidad y no " + (L.otroInstrumento === 1 ? "entra" : "entran") + " en este informe: cambie el instrumento del estudio para analizarlas.");
    if (L.sinCatalogo) avisos.push(plural(L.sinCatalogo, "respuesta trae", "respuestas traen") + " un expediente que no está en el catálogo del instrumento y quedó fuera del análisis.");
    if (incompletas.length) avisos.push("Estas respuestas dicen estar completas pero les faltan puntos o preguntas de cierre: " + incompletas.map(P => P.alias).join(", ") + ".");
    const sinH2 = PS.filter(P => !P.h2).length, sinH3 = PS.filter(P => !P.h3).length;
    if (sinH2 || sinH3) avisos.push("Sin las preguntas de cierre: " + sinH2 + " sin responsabilidades (H2) y " + sinH3 + " sin accesos (H3).");
    if (!difs.length && PS.length) avisos.push("Ninguna participación tiene dato en las dos condiciones todavía: la comparación de H1 queda pendiente.");
    const nAjenos = PS.reduce((n, P) => n + P.ajenos, 0);
    if (nAjenos) avisos.push(plural(nAjenos, "registro no corresponde", "registros no corresponden") + " al recorrido del expediente; " + (nAjenos === 1 ? "aparece" : "aparecen") + " en el registro completo.");
    if (L.repetidos) avisos.push("Se " + (L.repetidos === 1 ? "recibió 1 versión repetida" : "recibieron " + L.repetidos + " versiones repetidas") + " de una misma participación: se usó la más reciente.");
    if (L.ilegibles) avisos.push(plural(L.ilegibles, "documento no se pudo leer y quedó", "documentos no se pudieron leer y quedaron") + " fuera del análisis.");
    const cifras = [["Respuestas analizadas", PS.length], ["Completas", nComp], ["Expedientes", casos.length],
      ["Roles con respuesta", rolesCon + " de " + BP.actores.length],
      ["Completitud en el punto que resuelve · " + COND[0].n, pctTxt(H1[CID[0]].pct)],
      ["Completitud en el punto que resuelve · " + COND[1].n, pctTxt(H1[CID[1]].pct)],
      ["Responsabilidades acertadas", h2ok.length ? fmtN(media(h2ok)) + " de 6" : "—"],
      ["Accesos reconstruidos", h3ok.length ? fmtN(media(h3ok)) + " de 4" : "—"]];
    const resumen = {
      instrumento:"expediente", generado:new Date(t0).toISOString(), estudio:est,
      escenario:{ id:EXP.marco.id, n:"Expediente de pensión de invalidez · marco " + EXP.marco.id, nota:EXP.marco.nota },
      kicker:"Simulación con expedientes sintéticos de pensión de invalidez · informe consolidado",
      ficha:[["Marco del instrumento", EXP.marco.id], ["Expedientes analizados", casos.map(c => c.id).join(" · ")], ["Condiciones", COND.map(c => c.n).join(" · ")], ["Corte del piloto", CORTE + " horas virtuales"]],
      pie:EXP.marco.nota + " Los expedientes son sintéticos y las horas son virtuales: el informe describe el comportamiento de los participantes en el instrumento, no el rendimiento de una integración real. Los participantes aparecen con el usuario de su cuenta, sin nombres ni correos.",
      cifras:cifras,
      documentos:{ recibidos:L.recibidos, ilegibles:L.ilegibles, repetidos:L.repetidos, otroInstrumento:L.otroInstrumento, sinCatalogo:L.sinCatalogo },
      participaciones:PS.length, completas:nComp, parciales:PS.length - nComp, dePrueba:nPrueba, conDatos:nDatos,
      roles:{ total:BP.actores.length, conRespuesta:rolesCon },
      casos:casos.map(c => ({ id:c.id, persona:c.persona.nombre, participaciones:PS.filter(P => P.caso.id === c.id).length })),
      condiciones:CID.map(k => ({ id:k, n:condN(k), completitud:H1[k].pct, horas:H1[k].horas, conDato:conH1(k).length })),
      h1:{ diferenciaMedia:difs.length ? Math.round(media(difs) * 10) / 10 : null, conDatoEnLasDos:difs.length },
      h2:{ respondieron:h2ok.length, aciertosMedios:h2ok.length ? Math.round(media(h2ok) * 10) / 10 : null, total:6 },
      h3:{ respondieron:h3ok.length, accesosMedios:h3ok.length ? Math.round(media(h3ok) * 10) / 10 : null, total:4, elementosMedios:h3campos.length ? Math.round(media(h3campos) * 10) / 10 : null, elementosTotal:20 },
      registros:{ vigentes:PS.reduce((n, P) => n + P.regs.length, 0), deParticipantes:PS.reduce((n, P) => n + P.regs.filter(x => x.origen === "participante").length, 0), conduccion:PS.reduce((n, P) => n + P.conduccion, 0) },
      textos:TEXTOS.length, avisos
    };
    return { resumen, capitulos, tablas, buscable:"textos" };
  }

  /* ---------- Datos consolidados para exportar ---------- */
  function datosExpConsolidados(docs, opciones) {
    opciones = obj(opciones);
    const an = opciones.analisis || analizarExp(docs, opciones), L = leerExp(docs, cuentasLimpias(opciones.cuentas));
    return {
      instrumento:INSTRUMENTO, formato:FORMATO, version:VERSION, tipo:"consolidado", subtipo:"expediente", fecha:an.resumen.generado,
      estudio:an.resumen.estudio,
      marco:{ id:EXP.marco.id, pregunta:EXP.marco.pregunta, hipotesis:EXP.marco.hipotesis, condiciones:COND, corteHoras:CORTE },
      resumen:an.resumen,
      participantes:L.PS.map(P => { const k = obj(P.doc.consentimiento), a = h1De(P, CID[0]), m = h1De(P, CID[1]);
        return { id:P.id, usuario:P.usuario, alias:P.alias, actor:P.actor, rol:rolL(P.actor), expediente:P.caso.id, orden:P.orden,
          estado:P.completa ? "completa" : "parcial", avance:{ hechas:P.hechas, total:P.total }, prueba:P.prueba, demo:P.demo, dioDatosPersonales:P.conDatos,
          consentimiento:{ aceptado:k.aceptado === true, t:typeof k.t === "number" ? k.t : null, version:txt(k.version, 20) },
          h1:{ actual:a, modulo:m, diferencia:difDe(P) }, horas:{ actual:horasDe(P, CID[0]), modulo:horasDe(P, CID[1]) },
          h2:P.h2 ? obj(P.h2.payload).calificacion : null, h3:P.h3 ? obj(P.h3.payload).calificacion : null,
          encuesta:P.enc ? obj(P.enc.payload) : null, generado:txt(P.doc.generado, 40), huella:txt(P.doc.huella, 80), registros:P.regs.length }; }),
      registros:[].concat(...L.PS.map(P => P.regs.map(x => Object.assign({}, x, { participacion:P.id, rol:P.actor, expediente:P.caso.id })))),
      capitulos:an.capitulos, tablas:an.tablas
    };
  }

  return { analizarExp, datosExpConsolidados };
})();
