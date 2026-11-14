/* ============ Ramificación: estado del caso, consecuencias y actores simulados ============
   La versión asíncrona no tiene facilitador, así que el caso tiene que reaccionar a lo que el
   participante decide. En lugar de un árbol de caminos (once pasos por dos o tres opciones son
   miles de recorridos imposibles de escribir), el caso lleva un ESTADO que se acumula:

     · cada decisión aplica efectos sobre ese estado y deja una consecuencia escrita;
     · cada paso siguiente se describe desde el estado en que le llega el caso;
     · los actores que no están conectados deciden por reglas sobre ese mismo estado.

   Así se escribe una vez por opción —unas treinta por caso— y salen todos los recorridos.
   Nada de esto contradice el contenido doctoral: las opciones son las de ESC.decisiones, las
   piezas y sus campos los de BP.evidencia, y las vistas mínimas las de BP.actores. */

const RAMAS = {

  /* ---------- Estado inicial del caso ----------
     piezas[k]: qué se sabe de cada pieza de evidencia en el expediente que viaja.
       llego      si la pieza llegó a quien la necesitaba;
       conVersion si llegó con versión, fecha y responsable;
       campos     posiciones de los campos que alcanzaron a llegar (null = todos los que existen). */
  inicial: function (perfil) {
    const E = {
      piezas: {}, origen: null, acuse: false, controversia: null, dictamen: null,
      devoluciones: 0, apelacion: null, paquete: null, pago: null, reintegro: null,
      prestacion: null, queja: null, vigilancia: [], gestionesMP: 0, acuses: 0, dias: 0,
      saltados: {}, historia: []
    };
    Object.keys(EV).forEach(k => { E.piezas[k] = { llego: false, conVersion: false, campos: null }; });
    // El resumen clínico y los certificados nacen en la ruta; la historia laboral existe desde antes.
    E.piezas.hl.existe = true;
    if (perfil && perfil.caso && perfil.caso.origenEnDisputa === false) E.sinDisputa = true;
    return E;
  },

  /* ---------- Qué piezas pide cada paso ----------
     Se toma de ESC.entradas. La función solo existe para no repetirla en cada regla. */
  piezasDe: function (pasoId) { return (ESC.entradas[pasoId] || []).slice(); },

  /* ---------- Consecuencias de cada decisión ----------
     Una entrada por paso. `ops[valor]` trae el efecto sobre el estado y la frase que se le muestra
     al participante después de guardar. `sistema(E, yo)` dice qué hace el actor cuando no es el
     participante quien lo juega. */
  pasos: {

    A1: {
      actor: "ips",
      ops: {
        expedir: {
          texto: "Se expide la primera incapacidad. El certificado sale impreso y queda en manos de la trabajadora; la historia clínica se queda en la IPS, sin resumen estructurado y sin versión.",
          efecto: function (E) { E.piezas.inc.llego = true; E.piezas.inc.conVersion = true; E.piezas.hc.existe = true; }
        },
        remitir: {
          texto: "La remisión al especialista aplaza la incapacidad: hasta que no haya concepto no empieza a contarse el término, y conseguir esa cita queda del lado de la trabajadora.",
          efecto: function (E, d) { E.dias += d; E.gestionesMP += 1; E.piezas.hc.existe = true; }
        }
      },
      sistema: function () { return "expedir"; }
    },

    A2: {
      actor: "eps",
      ops: {
        reconocer: {
          texto: "La EPS reconoce la prórroga y paga el subsidio. Los certificados quedan en la EPS y el empleador tramita la nómina con las copias que reciba.",
          efecto: function (E) { E.piezas.inc.llego = true; E.piezas.inc.conVersion = true; E.pago = "eps"; }
        },
        pedir: {
          texto: "Pedir soportes adicionales detiene el pago hasta que lleguen, y conseguirlos recae en la trabajadora.",
          efecto: function (E, d) { E.dias += d; E.gestionesMP += 1; }
        }
      },
      sistema: function () { return "reconocer"; }
    },

    A3: {
      actor: "emp",
      ops: {
        entregar: {
          texto: "La matriz de exposición llega con versión, fecha y responsable: se puede saber a qué estaba expuesta la trabajadora y en qué puesto.",
          efecto: function (E) { E.piezas.apt.llego = true; E.piezas.apt.conVersion = true; }
        },
        entregar_sin: {
          texto: "La matriz llega sin versión ni fecha. Nadie puede verificar si corresponde al puesto en el que la trabajadora estaba cuando apareció la dolencia.",
          efecto: function (E) { E.piezas.apt.llego = true; E.piezas.apt.conVersion = false; }
        },
        negar: {
          texto: "Sin la matriz de exposición, la definición del origen tendrá que hacerse sin la prueba de a qué estaba expuesta la trabajadora. Conseguirla, si alguien insiste, recae en ella.",
          efecto: function (E) { E.piezas.apt.llego = false; E.gestionesMP += 1; }
        }
      },
      sistema: function (E, yo, perfil) {
        const f = ((perfil || {}).evidencia || {}).apt;
        return f && (f.faltaHoy || []).indexOf(3) >= 0 ? "entregar_sin" : "entregar";
      }
    },

    E1: {
      actor: "eps",
      ops: {
        comun: {
          texto: "Con el origen calificado como común, el subsidio y la rehabilitación siguen a cargo del sistema de salud. La ARL queda fuera del costo, y de ella depende si acepta esa calificación o la discute.",
          efecto: function (E) { E.origen = "comun"; }
        },
        laboral: {
          texto: "Con el origen calificado como laboral, las prestaciones pasan a la ARL. De ella depende si lo acepta o lo controvierte, porque es la que paga.",
          efecto: function (E) { E.origen = "laboral"; }
        },
        mas_info: {
          texto: "El origen sigue sin definirse. El reloj del día 180 no se detiene por eso: cuando el subsidio de la EPS se agote, nadie habrá dicho todavía a quién le corresponde pagar.",
          efecto: function (E, d) { E.dias += d; E.origen = null; E.gestionesMP += 1; }
        }
      },
      // Sin la prueba de exposición es difícil sostener el origen laboral.
      sistema: function (E) { return E.piezas.apt.llego && E.piezas.apt.conVersion ? "laboral" : "comun"; }
    },

    E2: {
      actor: "arl",
      ops: {
        aceptar: {
          texto: "La ARL acepta la calificación. El caso no pasa a la Junta Regional: el origen queda como lo definió la EPS.",
          efecto: function (E) { E.controversia = "aceptada"; if (E.origen === "laboral") E.pago = "arl"; }
        },
        controvertir: {
          texto: "La controversia queda abierta y el caso pasa a la Junta Regional de Calificación de Invalidez. Mientras la Junta no dictamine, el origen sigue sin definirse.",
          efecto: function (E) { E.controversia = "abierta"; }
        },
        mas_info: {
          texto: "Pedir evidencia adicional alarga el término sin cerrar nada, y buena parte de esa evidencia se la vuelven a pedir a la trabajadora.",
          efecto: function (E, d) { E.dias += d; E.gestionesMP += 1; }
        }
      },
      /* La ARL controvierte cuando el origen laboral la pone a pagar. Si la calificación fue común
         no tiene por qué discutirla, salvo que el caso siga su curso hacia la Junta porque el
         recorrido del participante lo necesita (ver mantenerViva). */
      sistema: function (E) { return E.origen === "laboral" ? "controvertir" : "aceptada" && "aceptar"; }
    },

    E3: {
      actor: "jr",
      ops: {
        dictaminar: {
          texto: "La Junta dictamina con el expediente que tiene.",
          efecto: function (E, d, ctx) {
            E.dictamen = { origen: E.origen || "laboral", por: ctx && ctx.por || "sistema", conVacios: !RAMAS.expedienteCompleto(E) };
            E.dias += d;
          },
          extra: function (E) {
            return RAMAS.expedienteCompleto(E)
              ? "El expediente estaba completo, así que la motivación se apoya en todas las piezas."
              : "El expediente estaba incompleto: faltaba " + RAMAS.faltaTxt(E) + ", y eso queda escrito en el dictamen.";
          }
        },
        suspender: {
          texto: "El trámite se suspende hasta que llegue la pieza que falta. La Junta la pide por oficio y el término se alarga.",
          efecto: function (E, d) { E.dias += d; E.piezas.hl.llego = true; E.piezas.hl.conVersion = true; }
        },
        devolver: {
          texto: "El expediente vuelve a manos de la trabajadora para que lo complete: es ella la que va hasta la ventanilla a conseguir lo que falta y a radicar de nuevo.",
          efecto: function (E, d) { E.devoluciones += 1; E.gestionesMP += 1; E.dias += d; E.piezas.hl.llego = true; }
        }
      },
      sistema: function (E) { return E.piezas.hl.llego ? "dictaminar" : "suspender"; }
    },

    E4: {
      actor: "jn",
      ops: {
        valida: {
          texto: "La segunda instancia da por bueno el paquete: hay con qué decidir y la motivación se puede rastrear.",
          efecto: function (E) { E.paquete = "ok"; }
        },
        incompleto: {
          texto: "La segunda instancia registra que el paquete no permite decidir: falta la evolución clínica que usó la primera instancia o la cronología de lo ocurrido.",
          efecto: function (E) { E.paquete = "incompleto"; }
        }
      },
      sistema: function (E) { return E.dictamen && !E.dictamen.conVacios ? "valida" : "incompleto"; },
      extraOps: {
        apelar: {
          texto: "La apelación queda radicada y el caso sube a la Junta Nacional. La trabajadora no consta notificada de esa apelación.",
          efecto: function (E) { E.apelacion = true; }
        },
        no_apelar: {
          texto: "Sin apelación, el dictamen queda en firme y empieza a contar para las prestaciones.",
          efecto: function (E) { E.apelacion = false; }
        }
      },
      extraSistema: function (E) { return E.dictamen && E.dictamen.origen === "laboral" ? "apelar" : "no_apelar"; }
    },

    E5: {
      actor: "afp",
      ops: {
        subsidio: {
          texto: "La administradora de pensiones asume el subsidio desde el día 181. Hay por fin una entidad con nombre que responde por el pago.",
          efecto: function (E) { E.pago = "afp"; }
        },
        remitir: {
          texto: "El caso se remite a la ARL por tratarse de origen laboral. Si la ARL no lo recibe de inmediato, el pago queda entre las dos entidades.",
          efecto: function (E) { E.pago = E.origen === "laboral" ? "arl" : "nadie"; }
        },
        esperar: {
          texto: "Esperar la firmeza antes de decidir deja el pago en suspenso: pasado el día 180, nadie está pagando.",
          efecto: function (E, d) { E.pago = "nadie"; E.dias += d; }
        }
      },
      sistema: function (E) { return E.origen === "laboral" ? "remitir" : E.origen === "comun" ? "subsidio" : "esperar"; }
    },

    D1: {
      actor: "emp",
      ops: {
        reintegrar: {
          texto: "La trabajadora se reintegra con restricciones a su mismo puesto.",
          efecto: function (E) { E.reintegro = "reintegrada"; },
          extra: function (E) {
            return RAMAS.campoLlego(E, "hc", 2)
              ? "Las restricciones estaban escritas, así que el puesto se ajusta a lo que dice el concepto."
              : "Las restricciones no llegaron por escrito: el reintegro se hace con lo que la trabajadora alcance a explicar.";
          }
        },
        reubicar: {
          texto: "La trabajadora se reubica en otro cargo compatible con sus restricciones.",
          efecto: function (E) { E.reintegro = "reubicada"; }
        },
        esperar: {
          texto: "Esperar el concepto de rehabilitación deja el reintegro en el aire, y conseguir ese concepto recae otra vez en la trabajadora.",
          efecto: function (E, d) { E.reintegro = "pendiente"; E.dias += d; E.gestionesMP += 1; }
        }
      },
      sistema: function (E) { return RAMAS.campoLlego(E, "hc", 2) ? "reubicar" : "esperar"; }
    },

    D2: {
      actor: "afp",
      ops: {
        resolver: {
          texto: "La prestación se resuelve con el dictamen y la historia laboral que haya en el expediente.",
          efecto: function (E) { E.prestacion = "resuelta"; }
        },
        pedir: {
          texto: "Pedir la historia laboral actualizada alarga el trámite. Es la misma pieza que ya debería estar en el expediente.",
          efecto: function (E, d) { E.dias += d; E.piezas.hl.llego = true; }
        },
        remitir: {
          texto: "El caso se remite a la ARL, que asume la prestación si el origen quedó laboral.",
          efecto: function (E) { E.prestacion = "arl"; }
        }
      },
      sistema: function (E) { return E.dictamen && E.piezas.hl.llego ? "resolver" : "pedir"; }
    },

    D3: {
      actor: "supersalud",
      ops: {
        enrutar: {
          texto: "La queja queda enrutada con un responsable y un plazo: por primera vez hay alguien con nombre a cargo de responderle.",
          efecto: function (E) { E.queja = "enrutada"; E.acuses += 1; }
        },
        pedir: {
          texto: "Se piden informes a la EPS por oficio. Cada entidad contestará con su propio archivo.",
          efecto: function (E, d) { E.queja = "informes"; E.dias += d; }
        },
        archivar: {
          texto: "La queja se archiva por falta de competencia. La vía que queda es la judicial, y reunir el expediente para esa vía recae en la trabajadora.",
          efecto: function (E) { E.queja = "archivada"; E.gestionesMP += 1; }
        }
      },
      sistema: function () { return "enrutar"; }
    }
  },

  /* ---------- Consecuencias de las respuestas que no son decisiones ---------- */

  // Custodia: qué sale de la entidad que conserva la pieza.
  custodia: {
    completa: {
      texto: "Se entrega todo lo que piden. Sale también lo que no era pertinente para la finalidad declarada, y de eso no queda control.",
      efecto: function (E, d, ctx) { (ctx.piezas || []).forEach(k => { E.piezas[k].llego = true; E.piezas[k].conVersion = true; E.piezas[k].campos = null; }); }
    },
    parcial: {
      texto: "Se entrega solo lo pertinente para la finalidad declarada. El resto se queda en la entidad.",
      efecto: function (E, d, ctx) {
        (ctx.piezas || []).forEach(k => {
          const v = vistaDe(ctx.pide, k, ctx.paso);
          E.piezas[k].llego = true; E.piezas[k].conVersion = true; E.piezas[k].campos = v ? v.slice() : [];
        });
      }
    },
    denegar: {
      texto: "No se entrega nada. Quien necesita esa pieza tendrá que conseguirla por otra vía, y la vía que queda hoy es pedírsela a la trabajadora.",
      efecto: function (E, d, ctx) { (ctx.piezas || []).forEach(k => { E.piezas[k].llego = false; }); E.gestionesMP += 1; }
    }
  },

  // Vigilancia y apoyo: no decide el fondo, pero deja requerimientos.
  soporte: {
    ninguna: { texto: "No se toma ninguna acción: el trámite sigue su curso sin intervención." },
    requerir: {
      texto: "Queda un requerimiento de información a la entidad responsable.",
      efecto: function (E, d, ctx) { E.vigilancia.push({ paso: ctx.paso, de: ctx.actor, tipo: "requerimiento" }); }
    },
    ordenar: {
      texto: "Queda una orden con plazo, y el plazo empieza a correr desde que se notifica.",
      efecto: function (E, d, ctx) { E.vigilancia.push({ paso: ctx.paso, de: ctx.actor, tipo: "orden" }); E.acuses += 1; }
    }
  },

  /* ---------- Reglas de lectura del estado ---------- */

  // ¿El expediente tiene todo lo que el paso necesita?
  expedienteCompleto: function (E, pasoId) {
    return RAMAS.piezasDe(pasoId || "E3").every(k => E.piezas[k].llego);
  },
  faltaTxt: function (E, pasoId) {
    const f = RAMAS.piezasDe(pasoId || "E3").filter(k => !E.piezas[k].llego);
    return f.length ? listaFrase(f.map(k => EV[k].n.toLowerCase() + " (" + EV[k].sl + ")")) : "nada";
  },
  // ¿Llegó un campo concreto de una pieza?
  campoLlego: function (E, pieza, i) {
    const p = E.piezas[pieza];
    return !!(p && p.llego && (p.campos == null || p.campos.indexOf(i) >= 0));
  },

  /* ---------- El estado del caso, para el informe y para la pantalla ---------- */
  // Versión compacta, que viaja dentro de cada respuesta: así el investigador ve qué ruta produjo.
  compacto: function (E) {
    const p = {};
    Object.keys(E.piezas).forEach(k => {
      const x = E.piezas[k];
      p[k] = !x.llego ? "no_llego" : x.campos == null ? (x.conVersion ? "completa" : "sin_version") : "parcial";
    });
    return { piezas:p, origen:E.origen, controversia:E.controversia,
      dictamen:E.dictamen ? E.dictamen.origen + (E.dictamen.conVacios ? "_con_vacios" : "") : null,
      apelacion:E.apelacion, paquete:E.paquete, pago:E.pago, reintegro:E.reintegro, prestacion:E.prestacion,
      queja:E.queja, devoluciones:E.devoluciones, gestionesMP:E.gestionesMP, acuses:E.acuses,
      vigilancia:(E.vigilancia || []).length, diasDeclarados:E.diasDeclarados || 0 };
  },
  // Versión legible, que se le muestra al participante después de cada paso.
  resumenEstado: function (E) {
    const ORI = { comun:"común", laboral:"laboral" }, PAGO = { eps:"la EPS", arl:"la ARL", afp:"la administradora de pensiones", nadie:"nadie, por ahora" };
    const out = [];
    out.push(["Origen de la dolencia", E.origen ? "calificado " + ORI[E.origen] : "sin definir"]);
    const falta = Object.keys(EV).filter(k => !E.piezas[k].llego && k !== "dic");
    out.push(["Expediente", falta.length ? "falta " + listaFrase(falta.map(k => EV[k].sl)) : "completo con lo que la ruta ha producido"]);
    if (E.controversia) out.push(["Controversia", E.controversia === "abierta" ? "abierta ante la Junta Regional" : "no se abrió"]);
    if (E.dictamen) out.push(["Dictamen", "origen " + ORI[E.dictamen.origen] + (E.dictamen.conVacios ? ", con vacíos en el expediente" : ", con el expediente completo")]);
    if (E.apelacion != null) out.push(["Apelación", E.apelacion ? "radicada" : "no hubo"]);
    if (E.pago) out.push(["Quién paga desde el día 181", PAGO[E.pago] || E.pago]);
    if (E.reintegro) out.push(["Reintegro", E.reintegro]);
    if (E.prestacion) out.push(["Prestación", E.prestacion === "resuelta" ? "resuelta" : E.prestacion]);
    if (E.queja) out.push(["Queja", E.queja]);
    out.push(["Gestiones que le tocaron a la trabajadora", String(E.gestionesMP)]);
    out.push(["Acuses que quedaron", String(E.acuses)]);
    if (E.devoluciones) out.push(["Devoluciones del expediente", String(E.devoluciones)]);
    if ((E.vigilancia || []).length) out.push(["Requerimientos y órdenes", String(E.vigilancia.length)]);
    return out;
  },

  /* ---------- Pasos que no ocurren en este recorrido ----------
     Si no hubo controversia, el caso no llega a la Junta; si no hubo apelación, no hay segunda
     instancia. El paso se muestra igual, diciendo por qué no ocurrió: es parte del hallazgo. */
  noOcurre: function (E, pasoId, yo) {
    if (yo && actividadDe(PASOS[PIDX[pasoId]], yo, "actual")) return null;
    if (pasoId === "E3" && E.controversia === "aceptada") return "La ARL aceptó la calificación de la EPS, así que la controversia no se abrió y el caso no llegó a la Junta Regional.";
    if (pasoId === "E4" && E.apelacion === false) return "Nadie apeló el dictamen dentro del término, así que no hubo segunda instancia.";
    if (pasoId === "E4" && E.controversia === "aceptada") return "Sin controversia no hubo dictamen de la Junta, así que no hay nada que apelar.";
    return null;
  },

  /* ---------- Decisión de un actor que no está conectado ----------
     Regla general: la del paso. Excepción: si ese curso dejaría sin actividad al participante,
     el sistema toma el que mantiene vivo su rol, porque la persona entró a jugar ese rol.
     La excepción queda registrada y se informa, para que el investigador sepa cuándo actuó. */
  decidirSistema: function (pasoId, E, yo, perfil) {
    const r = RAMAS.pasos[pasoId]; if (!r) return null;
    let v = r.sistema ? r.sistema(E, yo, perfil) : null;
    const forzado = RAMAS.mantenerViva(pasoId, v, yo);
    return { valor: forzado || v, forzado: !!forzado };
  },
  /* ¿Qué curso hay que tomar para que el participante alcance a jugar su rol?
     Solo se aplica en los dos puntos donde una decisión ajena puede cerrar la ruta. */
  mantenerViva: function (pasoId, valor, yo) {
    const tiene = pid => !!actividadDe(PASOS[PIDX[pid]], yo, "actual");
    if (pasoId === "E2" && valor === "aceptar" && (tiene("E3") || tiene("E4"))) return "controvertir";
    if (pasoId === "E4" && valor === "no_apelar" && tiene("E4")) return "apelar";
    return null;
  }
};
