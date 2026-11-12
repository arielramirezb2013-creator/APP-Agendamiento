/* ============ Guion de la versión asíncrona: orientación, consentimiento y textos de conducción ============
   Aquí vive todo el texto que la versión asíncrona añade al blueprint. El contenido doctoral (caso, pasos,
   contratos, reglas, preguntas e hipótesis) sigue en datos-blueprint.js y datos-escenario.js y no se repite.
   Las llaves {titulo}, {programa}, {institucion}, {investigador}, {contacto}, {director}, {comite} y {minutos}
   se reemplazan con los datos del estudio que el investigador define en su panel. */
const GUION = {
  /* Datos del estudio por defecto. El investigador los completa en el panel; no se escriben nombres ni correos aquí. */
  estudio: {
    id:"ruta-incapacidad-p2",
    titulo:"Simulación de la ruta de incapacidad laboral",
    subtitulo:"Interoperabilidad clínico-laboral · caso sintético M.P. · organización ancla SURA",
    programa:"Proyecto 2 · DGIT 6202",
    institucion:"Universidad de los Andes",
    investigador:"", director:"", contacto:"", comite:"", cierre:""
  },

  orientacion: {
    pasos:[{ id:"estudio", n:"El estudio" },{ id:"caso", n:"El caso" },{ id:"mecanica", n:"Cómo funciona" },{ id:"rol", n:"Su rol" }],
    estudio: {
      titulo:"Qué es este estudio y qué se busca",
      parrafos:[
        "Esta simulación hace parte de una investigación doctoral sobre interoperabilidad clínico-laboral: cómo circula la evidencia clínica y laboral entre las entidades que intervienen cuando una incapacidad se prolonga y hay que definir su origen, quién paga y cómo regresa la persona al trabajo.",
        "Usted participa porque conoce uno de esos roles. Va a recorrer un caso sintético dos veces: primero como funciona la ruta hoy y después como funcionaría con un módulo de interoperabilidad propuesto."
      ],
      buscaTitulo:"Qué se busca con su participación",
      busca:[
        "Conocer cómo actúa su rol en cada paso de la ruta: con qué información cuenta, qué le falta, a quién se la pide y cuánto tarda.",
        "Conocer cómo cambiaría esa actuación si la ruta funcionara con el módulo propuesto.",
        "Recoger las dificultades que usted encuentra y los requisitos que debería cumplir el siguiente prototipo."
      ],
      subTitulo:"Sus respuestas aportan a tres subpreguntas del proyecto",
      aclaraTitulo:"Tenga presente",
      aclara:[
        "No se evalúa a las personas ni a las entidades.",
        "No hay respuestas correctas ni incorrectas: interesan su criterio y su experiencia.",
        "El caso es sintético. No se le pedirá información de pacientes, afiliados o casos reales."
      ]
    },
    caso: {
      titulo:"El caso y la ruta",
      intro:"Todo el recorrido usa un único caso sintético. Ninguna persona es identificable.",
      rutaTitulo:"La ruta: tres fases y once pasos",
      evidenciaTitulo:"Cinco piezas de evidencia y quién las custodia"
    },
    mecanica: {
      titulo:"Cómo funciona la simulación",
      puntos:[
        { t:"Dos rondas, el mismo caso", d:"En la ronda 1 recorre la ruta como funciona hoy. En la ronda 2 la recorre como funcionaría con el módulo propuesto." },
        { t:"Paso a paso", d:"En cada paso verá qué ocurre con el caso. Si su rol interviene, responde una actividad corta. Si no interviene, lee el contexto y continúa." },
        { t:"Los demás actores están simulados", d:"Nadie más está conectado. El sistema representa a los otros actores con los datos sintéticos del caso: le pide evidencia, consulta, notifica y deja registro. Lo que genera el sistema aparece marcado como «simulado»." },
        { t:"El recorrido es lineal", d:"Su respuesta queda registrada y el caso continúa según el escenario. Puede corregir una respuesta antes de pasar al paso siguiente." },
        { t:"Cierre de cada ronda", d:"Al terminar cada ronda valora el contrato de datos de su rol y responde cuatro preguntas." },
        { t:"Puede hacer pausas", d:"Sus respuestas se guardan en este dispositivo a medida que avanza. Puede salir y continuar después con el mismo usuario, en este mismo navegador." }
      ],
      envio:{
        progresivo:{ t:"Envío de sus respuestas", d:"Sus respuestas se envían al investigador a medida que avanza, para que pueda seguir el progreso del estudio. Si no hay conexión, al final podrá descargarlas en un archivo y enviarlas usted." },
        final:{ t:"Envío de sus respuestas", d:"Al terminar, sus respuestas se envían al investigador cuando usted lo confirme. Si no hay conexión, podrá descargarlas en un archivo y enviarlas usted." },
        archivo:{ t:"Entrega de sus respuestas", d:"Al terminar descarga un archivo con sus respuestas y lo envía al investigador por el medio que él le indicó." }
      },
      tiempo:"Tiempo estimado para su rol: unos {minutos} minutos en total. No hay límite de tiempo."
    },
    rol: {
      titulo:"Su rol en la simulación",
      intro:"Usted representa a este actor. Responda como lo haría en su trabajo.",
      intervieneTitulo:"Dónde interviene",
      intervieneNota:"En los demás pasos verá el contexto del caso y podrá dejar observaciones.",
      terminosTitulo:"Términos que verá en la simulación"
    }
  },

  /* Plantilla. El investigador debe validarla con el comité de ética de su institución antes de usarla. */
  consentimiento: {
    version:"1",
    titulo:"Declaración de participación voluntaria",
    intro:"Antes de comenzar, lea esta información y marque su decisión. Participar es voluntario.",
    info:[
      { t:"Para qué es", d:"Los resultados se usarán con fines académicos dentro del proyecto de investigación doctoral «{titulo}» ({programa}, {institucion}) y en las publicaciones académicas que se deriven de él." },
      { t:"Qué se le pide", d:"Recorrer una simulación con un caso sintético y responder desde su rol y su experiencia. Le tomará unos {minutos} minutos y puede hacerlo en varias sesiones." },
      { t:"Voluntariedad y retiro", d:"Puede salir cuando quiera y puede retirarse del estudio en cualquier momento, sin dar explicaciones y sin ninguna consecuencia. Si se retira, sus respuestas se borran de este dispositivo y puede pedir al investigador que elimine las que ya haya recibido." },
      { t:"Riesgos y beneficios", d:"No se prevén riesgos distintos de los de responder un cuestionario profesional. No hay compensación económica. Sus respuestas ayudan a diseñar un módulo que busca reducir la carga sobre los trabajadores y las entidades." },
      { t:"Datos del caso", d:"El caso es sintético y no corresponde a ninguna persona real. Por favor no escriba datos de pacientes, afiliados o terceros en los campos de texto." },
      { t:"Confidencialidad", d:"Sus respuestas se analizan por rol y de forma agregada. Dar su nombre, su entidad o su correo es opcional. Si los da, se usan solo para contactarle sobre el estudio y no se publican." },
      { t:"Tratamiento de datos personales", d:"Los datos personales que decida suministrar se tratan conforme a la Ley 1581 de 2012 y sus normas reglamentarias. Como titular puede conocerlos, actualizarlos, rectificarlos y pedir su supresión escribiendo al investigador." }
    ],
    contactoTitulo:"A quién preguntar",
    declaracionesTitulo:"Mi declaración",
    declaraciones:[
      { id:"orientacion", t:"Leí la orientación y entiendo de qué trata la simulación y qué se busca con ella.", req:true },
      { id:"voluntaria", t:"Participo de manera libre y voluntaria, y sé que puedo retirarme en cualquier momento.", req:true },
      { id:"academico", t:"Entiendo que el caso es sintético y que mis respuestas se usarán con fines académicos en una investigación doctoral.", req:true },
      { id:"uso", t:"Autorizo el uso de mis respuestas en el análisis del proyecto y en sus publicaciones académicas, sin que se me identifique.", req:true }
    ],
    declaracionDatos:{ id:"datos", t:"Autorizo el tratamiento de los datos personales que escribo en este formulario, para los fines descritos." },
    datosTitulo:"Sus datos personales (opcional)",
    datosIntro:"Usted decide si los da. Puede participar sin identificarse.",
    anonimo:[["si","Participar sin dar mis datos"],["no","Quiero dar mis datos"]],
    datos:[
      { id:"nombre", n:"Nombre", tipo:"text", auto:"name" },
      { id:"entidad", n:"Entidad u organización", tipo:"text", auto:"organization" },
      { id:"cargo", n:"Cargo o función", tipo:"text", auto:"organization-title" },
      { id:"experiencia", n:"Años de experiencia en este rol", tipo:"number", auto:"off" },
      { id:"correo", n:"Correo electrónico", tipo:"email", auto:"email" },
      { id:"telefono", n:"Teléfono", tipo:"tel", auto:"tel" }
    ],
    resumen:{ id:"resumen", t:"Deseo recibir un resumen de los resultados en mi correo." },
    aceptar:"Acepto participar y comenzar",
    rechazar:"No deseo participar",
    rechazoTitulo:"No participará en el estudio",
    rechazoTexto:"No se guardó ninguna respuesta. Gracias por su tiempo. Si cambia de opinión, puede volver a entrar con su usuario y su contraseña."
  },

  /* Títulos e instrucciones de las actividades por tipo. No se muestran ejemplos de respuesta para no inducirlas. */
  actividad: {
    focal:{ titulo:"Cómo vive M.P. este paso", instr:"Responda desde la experiencia de la trabajadora en este paso: qué sabe de su caso, quién le responde y qué le toca hacer." },
    decide:{ titulo:"Decidir en este paso", instr:"Revise la información disponible, declare con qué finalidad la consulta, decida y diga quién responde y en cuántos días. Si falta información, indique cuál." },
    custodia:{ titulo:"Responder por la evidencia que custodia", instr:"Otro actor necesita evidencia que usted custodia. Decida qué entrega y cuánto le toma.", instrMod:"El módulo atendió la consulta con la vista mínima del contrato. Revise qué entregó y diga qué haría usted y cuánto le toma." },
    soporte:{ titulo:"Vigilar o apoyar este paso", instr:"Diga qué alcanza a ver de este caso desde su entidad y qué acción tomaría." }
  },

  rondas: {
    actual:{
      titulo:"Ronda 1 · la ruta como funciona hoy",
      parrafos:[
        "Recorra la ruta como funciona hoy. La evidencia viaja por oficio, por correo o en manos de la trabajadora.",
        "Responda con lo que ocurre en la práctica y con lo que usted haría, no con lo que debería ocurrir."
      ],
      notaMejora:"En esta ronda recorrió la ruta como funciona hoy. La misma pregunta se repite en la ronda 2 para poder comparar."
    },
    propuesto:{
      titulo:"Ronda 2 · la ruta con el módulo propuesto",
      parrafos:[
        "Ahora recorre el mismo caso con el módulo propuesto. El módulo no guarda la evidencia: guarda un índice, las reglas y los registros de quién consultó qué.",
        "Responda cómo actuaría si la ruta funcionara así."
      ],
      reglasTitulo:"Las cinco reglas del módulo"
    }
  },

  contexto: {
    titulo:"Contexto: lo que ocurre mientras su rol no interviene",
    instr:"Lea lo que pasa con el caso en estos pasos. Su rol no tiene una actividad aquí.",
    obs:"¿Algo le llama la atención en estos pasos? (opcional)"
  },

  cierre: {
    titulo:"Terminó la simulación",
    gracias:"Gracias por su tiempo y por compartir su criterio.",
    comentario:"¿Quiere añadir algo para el investigador? (opcional)",
    archivoTitulo:"Entregue su archivo de respuestas",
    archivoPasos:["Descargue el archivo con el botón.","Envíelo al investigador por el medio que él le indicó.","Cuando el investigador confirme que lo recibió, puede borrar sus datos de este dispositivo."],
    enviadoTitulo:"Sus respuestas fueron enviadas",
    enviadoTexto:"El investigador ya las recibió. Puede descargar una copia para usted.",
    errorTitulo:"No fue posible enviar sus respuestas",
    errorTexto:"Sus respuestas siguen guardadas en este dispositivo. Reintente el envío o descargue el archivo y envíelo usted."
  },

  /* Vistas mínimas que el texto del paso concede y la matriz de contratos no trae.
     D1: el paso dice que el empleador «reubica con las restricciones (vista mínima)» bajo la finalidad «reubicación laboral»;
     se toman los campos «restricciones funcionales» y «concepto de rehabilitación» del resumen clínico.
     Supuesto de la versión asíncrona, pendiente de confirmar con el investigador. */
  vistasPaso: { D1:{ emp:{ hc:[2, 3] } } },

  /* Situaciones del catálogo que no se muestran porque no corresponden a la actividad del rol en ese paso:
     arl_e5 pide decidir si la ARL asume la prestación, pero en E5 la ARL responde como apoyo (decide la AFP). */
  retosOmitidos: ["arl_e5"],

  /* Minutos por pantalla, para estimar la duración que se informa al participante. */
  tiempos: { inicio:6, focal:1, decide:2.5, custodia:1.5, soporte:1, contexto:0.5, valoracion:4, cierre:2 }
};
