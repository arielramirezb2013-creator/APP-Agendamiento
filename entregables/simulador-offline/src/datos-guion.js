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

  /* ---------- El caso sintético ----------
     Datos tomados del prototipo «Mapa de actores» y del service blueprint del proyecto. Ninguna persona es
     identificable: el nombre, la empresa y la aseguradora de pensiones son ficticios. */
  caso: {
    nombre:"M.P.",
    ficha:[
      ["Quién", "M.P., 41 años, operaria de empaque"],
      ["Dónde trabaja", "Alimentos Andinos S.A.S., una empresa sintética del sector de alimentos"],
      ["Diagnóstico", "Lumbago con ciática (CIE-10 M54.4)"],
      ["Dónde va el caso", "Día 150 de incapacidad continua; el origen sigue sin definirse desde el día 120"],
      ["Quién la acompaña", "Su hermana L.P., que la lleva a las diligencias y hace las filas con ella"],
      ["Afiliaciones", "EPS SURA, ARL SURA y una administradora de fondos de pensiones"]
    ],
    relato:[
      "Hace cinco meses M.P. consultó por un dolor lumbar que se le bajaba por la pierna izquierda. Le diagnosticaron lumbago con ciática y le expidieron la primera incapacidad. Desde entonces la ha renovado cada treinta días, y en cada renovación ha llevado copias a la EPS y a la empresa.",
      "En el día 120 le correspondía a la EPS decir si el origen de esa dolencia es común o laboral. De esa definición depende quién paga el subsidio, quién responde por la rehabilitación y a qué régimen pertenece el caso. La EPS calificó con lo que M.P. alcanzó a reunir; la ARL no estuvo de acuerdo y la controversia pasó a la Junta Regional.",
      "Hoy es el día 150. El subsidio de la EPS se agota en el día 180, el expediente se ha devuelto una vez por estar incompleto y M.P. todavía no sabe quién va a responderle después. Esta simulación recorre esa misma ruta dos veces: primero como funciona hoy y después como funcionaría con el módulo propuesto."
    ],
    disputa:"Lo que está en disputa es el origen de la enfermedad. Mientras no se defina, cada entidad actúa con una parte de la evidencia y la coordinación recae sobre la propia trabajadora.",
    nota:"Caso sintético construido para la investigación. Los nombres, la empresa y los plazos en días son supuestos de simulación; no corresponden a ninguna persona ni a ningún expediente real."
  },

  /* ---------- Qué ocurre en cada paso de la ruta ----------
     Un relato corto por paso y por ronda, para que el participante sepa en qué estado le llega el caso.
     Se apoya en el service blueprint del proyecto y no añade hechos nuevos al escenario. */
  pasos: {
    A1:{ enJuego:"Dónde queda guardada la evidencia que más adelante van a necesitar todos.",
      hoy:"M.P. consultó en la IPS por el dolor lumbar. El médico tratante la examinó, registró el diagnóstico y le expidió la primera incapacidad. Ella salió con el certificado impreso en la mano y lo llevó, en papel, a la EPS y a la empresa. La historia clínica quedó en la IPS, sin resumen estructurado y sin versión.",
      mod:"La consulta ocurre igual, pero el certificado y el resumen clínico quedan indexados el mismo día. La historia sigue viviendo en la IPS: el módulo solo sabe que existe, de qué versión es y quién la custodia. M.P. no tiene que llevar nada a ninguna parte." },
    A2:{ enJuego:"El subsidio que sostiene el ingreso de M.P. y el conteo de días que después dispara todo lo demás.",
      hoy:"Durante cuatro meses M.P. renovó la incapacidad cada treinta días. Cada prórroga significó una fila y dos copias: una para la ventanilla de la EPS y otra, por correo, para la empresa. La EPS reconoció y pagó el subsidio; el empleador tramitó la nómina con lo que ella fue entregando.",
      mod:"La EPS reconoce el subsidio y registra cada prórroga con un responsable. El empleador consulta los días acumulados y la fecha de inicio, sin ver el resto del certificado. M.P. ve «prórroga registrada · subsidio en curso» en su vista de estado y el módulo avisa cuando el caso se acerca al día 120." },
    A3:{ enJuego:"La prueba de a qué estuvo expuesta M.P. en su puesto, que es la mitad de la discusión sobre el origen.",
      hoy:"Para calificar el origen hace falta saber a qué estaba expuesta M.P. en la línea de empaque. La EPS le pide la matriz de exposición al empleador por oficio. En la empresa la arma el responsable de seguridad y salud en el trabajo, y llega sin versión ni fecha; a veces llega con el historial disciplinario anexo, que nadie necesitaba.",
      mod:"La matriz de exposición está expuesta por contrato, en su versión v.2, con responsable y fecha. El historial disciplinario se queda en el área de seguridad y salud en el trabajo porque no es pertinente para calificar el origen. M.P. no tiene nada que pedir ni que llevar." },
    E1:{ enJuego:"De esta decisión dependen quién paga, quién rehabilita y a qué régimen pertenece el caso.",
      hoy:"Llegó el día 120 y la EPS tiene que decir si la dolencia de M.P. es de origen común o laboral. Sobre la mesa está lo que ella alcanzó a reunir: una historia clínica parcial, sin el concepto del especialista, y una matriz de exposición sin versión. La calificación sale por correo y nadie firma un acuse de recibo.",
      mod:"La EPS declara la finalidad con la que va a consultar, abre la vista mínima de la historia clínica y de la matriz de exposición, decide y firma. La notificación llega con acuse a la ARL, a la AFP y a M.P. La historia laboral queda fuera de esa consulta: no es pertinente para calificar el origen." },
    E2:{ enJuego:"Si la controversia se abre, el caso pasa a la Junta y M.P. entra en una espera que hoy nadie le sabe explicar.",
      hoy:"A la ARL le llegó la calificación por correo, sin los documentos que la sustentan. Para decidir si la acepta o la controvierte vuelve a pedir la evidencia: a la EPS por oficio y, una vez más, a la propia M.P. Si controvierte, radica ante la Junta Regional también por oficio, sin constancia de recibo.",
      mod:"La ARL declara «investigación de origen y prestaciones» y consulta la historia clínica, la matriz y los certificados en la vista que su contrato autoriza. Si intenta abrir la historia laboral, el módulo lo deniega y deja el registro: esa pieza no es pertinente para esa finalidad. La radicación ante la Junta queda con acuse." },
    E3:{ enJuego:"El dictamen define el origen, el porcentaje de pérdida de capacidad y la fecha de estructuración: de ahí cuelga todo lo que sigue.",
      hoy:"El expediente llega a la Junta Regional en papel y sin la historia laboral. La Junta lo devuelve para que lo completen. M.P. y su hermana L.P. van hasta la oficina de la administradora de pensiones a pedir el certificado en ventanilla, lo radican de nuevo y vuelven a esperar. El dictamen sale por correo.",
      mod:"Antes de radicar, el módulo verifica que el expediente esté completo: historia clínica, matriz de exposición, certificados e historia laboral. La Junta le pide la historia laboral a la administradora de pensiones por contrato, dictamina el origen y la pérdida de capacidad laboral, y notifica con acuse a las cuatro entidades y a M.P." },
    E4:{ enJuego:"Que la segunda instancia pueda revisar lo mismo que vio la primera, y que M.P. sepa que su caso sigue abierto.",
      hoy:"Dentro del término, la ARL apela el dictamen por oficio. M.P. no consta notificada de esa apelación: se entera después, por terceros. A la Junta Nacional le llega un paquete incompleto, sin la evolución clínica que usó la Regional y sin una cronología de lo ocurrido.",
      mod:"Si la ARL apela, el paquete viaja íntegro y con la traza de lo que consultó la primera instancia. M.P. y la Junta Regional reciben acuse. En este prototipo la Junta Nacional no resuelve la apelación: verifica si el paquete permite decidir con una motivación trazable y registra qué falta." },
    E5:{ enJuego:"El ingreso de M.P. a partir del día 181 y la claridad sobre quién responde por él.",
      hoy:"Pasó el día 180 y el subsidio de la EPS se agotó. La administradora de pensiones se entera del dictamen porque M.P. se lo lleva en papel. Entre la ARL y la administradora se discute quién debe pagar, y esa discusión no deja registro. Mientras tanto M.P. lleva semanas sin ingreso y sin una respuesta con nombre y plazo.",
      mod:"La administradora de pensiones consulta el dictamen y los certificados bajo su propia finalidad, decide si asume el subsidio desde el día 181 o si remite a la ARL por tratarse de origen laboral, y notifica con acuse a M.P., a la EPS y a la ARL. La decisión queda con responsable y con plazo." },
    D1:{ enJuego:"Que M.P. vuelva a un puesto compatible con lo que su cuerpo puede hacer hoy.",
      hoy:"M.P. vuelve a la empresa con restricciones. Consigue el concepto de rehabilitación en la IPS y lo lleva al área de personal. El empleador la reubica con lo que ella alcance a aportar, porque no hay un formato común para escribir las restricciones ni un canal para recibirlas.",
      mod:"El empleador consulta las restricciones funcionales y el concepto de rehabilitación bajo la finalidad «reubicación laboral», registra el reintegro y M.P. recibe el acuse con responsable y plazo. El resto de la historia clínica no se abre." },
    D2:{ enJuego:"La prestación de la que depende el sostenimiento de M.P. a mediano plazo.",
      hoy:"Con el dictamen en firme, M.P. radica en papel ante la administradora de pensiones o ante la ARL y espera meses sin conocer el estado del trámite. La historia laboral y el dictamen están en archivos distintos, y ninguna de las dos entidades ve el expediente completo.",
      mod:"La administradora de pensiones decide con el dictamen y la historia laboral consultados en origen, y notifica con acuse. Si el origen quedó laboral, la ARL asume la prestación con una decisión motivada. M.P. ve «prestación en estudio», con responsable y con la fecha en que vence." },
    D3:{ enJuego:"La última puerta cuando el sistema no responde, y lo que le cuesta a M.P. tocarla.",
      hoy:"Si nada avanza, M.P. reconstruye su propia cronología con las copias que fue guardando, para quejarse ante la Superintendencia o para pedir una tutela. Cada entidad responde con su archivo y nadie tiene la línea de tiempo completa del caso.",
      mod:"Su vista de estado ya es la cronología: etapas, responsables, plazos y acuses. La adjunta a la queja o a la tutela. La Superintendencia enruta con responsable y plazo, y consulta el estado y las fechas sin abrir campos clínicos." }
  },

  /* ---------- Quién es usted en este caso ---------- */
  roles: {
    tra:"Usted responde como M.P.: 41 años, operaria de empaque, en el día 150 de una incapacidad que empezó hace cinco meses. Su hermana L.P. la acompaña a las diligencias. No se le pregunta qué dice la norma, sino qué entiende de su propio caso en cada momento, quién siente que le responde y qué le tocó hacer para que el trámite avanzara.",
    emp:"Usted responde por el empleador de M.P., desde el área de seguridad y salud en el trabajo. Allí vive la matriz de exposición del puesto de empaque, que otras entidades le van a pedir, y más adelante le corresponderá decidir cómo recibe de vuelta a una trabajadora con restricciones.",
    ips:"Usted responde por la IPS que atiende a M.P. Allí están su historia clínica, el diagnóstico y el concepto de rehabilitación. Cuando alguien pide esa evidencia, usted decide qué entrega, en qué forma y en cuánto tiempo.",
    eps:"Usted responde por la EPS donde M.P. está afiliada. Ha reconocido sus incapacidades durante cinco meses y custodia los certificados. En el día 120 le corresponde decir, en primera oportunidad, si el origen de la dolencia es común o laboral.",
    arl:"Usted responde por la administradora de riesgos laborales de la empresa. Si el origen resulta laboral, las prestaciones corren por su cuenta. Cuando llegue la calificación de la EPS tendrá que decidir si la acepta o si la controvierte ante la Junta.",
    afp:"Usted responde por la administradora de fondos de pensiones donde M.P. cotiza. Custodia su historia laboral y sus semanas cotizadas, y a partir del día 181 puede corresponderle el subsidio. También decide la prestación cuando el dictamen quede en firme.",
    jr:"Usted responde por la Junta Regional de Calificación de Invalidez. Cuando la controversia llegue, le corresponde dictaminar el origen, la pérdida de capacidad laboral y la fecha de estructuración, con el expediente que le hayan radicado.",
    jn:"Usted responde por la Junta Nacional. En este prototipo no resuelve la apelación: verifica si el paquete que le llega permite decidir con una motivación trazable y registra qué le falta.",
    mintrabajo:"Usted responde por el Ministerio del Trabajo, en su función de inspección, vigilancia y control sobre el empleador y la administradora de riesgos laborales. No ve datos clínicos: ve etapas, responsables, plazos y si algo se venció.",
    minsalud:"Usted responde por el Ministerio de Salud, que fija el vocabulario y los contenidos mínimos de la información en salud. No consulta casos: gobierna el lenguaje con el que las demás entidades los escriben.",
    supersalud:"Usted responde por la Superintendencia Nacional de Salud, que vigila a las EPS y a las IPS. Si M.P. se queja por la demora, le corresponde enrutar esa queja con responsable y plazo, sin abrir su historia clínica.",
    jueces:"Usted responde por el despacho judicial que recibe una tutela de M.P. por la demora y por la falta de notificación. Decide con lo que logre reconstruir del expediente."
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
        { t:"Puede hacer pausas", d:"Sus respuestas se guardan en este dispositivo a medida que avanza. Puede pausar y continuar después con el mismo usuario, en este mismo navegador. No use una ventana privada o de incógnito: al cerrarla se borra el avance." }
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

  /* Títulos e instrucciones de las actividades por tipo. Se describe la situación, nunca lo que conviene responder. */
  actividad: {
    focal:{ titulo:"Cómo vive M.P. este paso",
      instr:"Póngase en el lugar de M.P. en este momento de la ruta y responda como lo haría ella. Interesa qué entiende de lo que está pasando con su caso, a quién siente que le corresponde responderle y qué tuvo que hacer por su cuenta para que el trámite avanzara. No hay respuestas correctas ni incorrectas: lo que se busca es lo que ocurre de verdad, no lo que debería ocurrir." },
    decide:{ titulo:"Le toca decidir en este paso",
      instr:"Mire primero con qué información cuenta y si le alcanza para actuar; si algo le falta, señálelo. Después declare con qué finalidad consultaría esa evidencia, tome la decisión y diga quién responde por ella en su entidad y en cuántos días. Responda como lo haría en su trabajo, con las limitaciones que tendría en la práctica." },
    custodia:{ titulo:"Le piden evidencia que usted custodia",
      instr:"Otra entidad necesita, para poder seguir con el caso, una pieza que vive en su organización. Decida qué le entrega: todo lo que le piden, solo lo que es pertinente para la finalidad que declararon, o nada. Diga también cuántos días le tomaría en la práctica, contando lo que implica buscarla, revisarla y enviarla.",
      instrMod:"El módulo ya atendió la consulta con la vista mínima que autoriza su contrato: abajo puede ver qué se entregó y qué quedó retenido en origen. Diga qué haría usted en ese escenario y cuánto tiempo le tomaría la parte que sigue siendo suya." },
    soporte:{ titulo:"Su entidad vigila o acompaña este paso",
      instr:"Aquí no le corresponde decidir, pero algo alcanza a ver del caso. Diga qué información le llega en este momento y qué haría con ella: quedarse como está, requerir información o emitir una orden con plazo." }
  },

  /* Lo que se ve al guardar una respuesta y lo que sigue. */
  guardado: {
    titulo:"Su respuesta quedó registrada",
    comprobacionHoy:"Hoy nadie hace esta comprobación: el sistema la registra solo para poder compararla con la ronda del módulo.",
    comprobacionMod:"Con el módulo, esta comprobación se hace en cada consulta y queda registrada con quién consultó, para qué y con qué resultado.",
    efectos:"Qué ocurrió en la simulación después de su respuesta",
    efectosNota:"Lo generó el sistema para representar a los actores que no están conectados. No son respuestas de otras personas.",
    sigue:"Cuando quiera, continúe: el caso avanza al siguiente momento de la ruta."
  },

  rondas: {
    actual:{
      titulo:"Ronda 1 · la ruta como funciona hoy",
      parrafos:[
        "Va a recorrer la ruta de M.P. tal como funciona hoy, desde el primer día de incapacidad hasta el seguimiento. En este escenario la evidencia viaja por oficio, por correo o en las manos de la propia trabajadora, y cada entidad guarda su parte del expediente.",
        "En los pasos en los que su rol interviene, responda con lo que ocurre en la práctica y con lo que usted haría de verdad, con las limitaciones que tendría. En los demás, lea el contexto para saber en qué estado le llega el caso.",
        "Tómese el tiempo que necesite. Puede pausar y continuar después."
      ],
      notaMejora:"En esta ronda recorrió la ruta como funciona hoy. La misma pregunta se repite al cerrar la ronda 2 para poder comparar las dos."
    },
    propuesto:{
      titulo:"Ronda 2 · la ruta con el módulo propuesto",
      parrafos:[
        "Ahora va a recorrer el mismo caso de M.P., con los mismos pasos, pero suponiendo que la ruta funciona con el módulo de interoperabilidad que propone la investigación.",
        "El módulo no guarda la evidencia: cada entidad sigue conservando la suya en origen. Lo que el módulo guarda es un índice de qué existe y dónde, las reglas de quién puede ver qué y para qué, y el registro de cada consulta, entrega y notificación.",
        "Responda cómo actuaría usted si la ruta funcionara así. Es una hipótesis de diseño que esta simulación sirve justamente para poner a prueba."
      ],
      reglasTitulo:"Las cinco reglas del módulo",
      contratoTitulo:"Lo que el módulo le permitiría a su rol"
    }
  },

  contexto: {
    titulo:"Lo que ocurre mientras su rol no interviene",
    instr:"En estos pasos su rol no tiene que decidir ni entregar nada. Léalos para saber por dónde va el caso de M.P. y en qué estado le llegará cuando le toque actuar.",
    obs:"Si algo de lo que acaba de leer le llama la atención, escríbalo aquí (opcional)",
    obsAyuda:"Por ejemplo, algo que en su experiencia no ocurre así, algo que falta o algo que le parece que se le va a complicar después."
  },

  cierre: {
    titulo:"Terminó la simulación",
    gracias:"Gracias por recorrer las dos rondas y por compartir su criterio. Lo que respondió es la evidencia que esta investigación necesita.",
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
