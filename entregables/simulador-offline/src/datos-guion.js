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
    subtitulo:"Interoperabilidad clínico-laboral · caso sintético {persona} · organización ancla SURA",
    programa:"Proyecto 2 · DGIT 6202",
    institucion:"Universidad de los Andes",
    investigador:"", director:"", contacto:"", comite:"", cierre:""
  },

  /* ---------- El caso sintético ----------
     Datos tomados del prototipo «Mapa de actores» y del service blueprint del proyecto. Ninguna persona es
     identificable: el nombre, la empresa y la aseguradora de pensiones son ficticios. */
  /* ---------- El caso ----------
     La ficha y el relato los trae el perfil cargado (perfiles/FORMATO-PERFILES.md); aquí quedan
     solo los textos que valen para cualquier caso. */
  caso: {
    disputa:"Lo que está en disputa es el origen de la enfermedad. Mientras no se defina, cada entidad actúa con una parte de la evidencia y la coordinación recae sobre la propia trabajadora.",
    recorrido:"En el recorrido usted vuelve a cada uno de los once pasos de la ruta, incluidos los que el caso ya dejó atrás, y responde por su cuenta. Lo que usted decida cambia el caso: el recorrido que salga depende de sus respuestas.",
    nota:"Caso sintético construido para la investigación. Los nombres, la empresa y los plazos en días son supuestos de simulación; no corresponden a ninguna persona ni a ningún expediente real.",
    fichaTitulo:"Quién es la persona del caso",
    resumenTitulo:"Por dónde va el caso"
  },

  /* ---------- Qué ocurre en cada paso de la ruta ----------
     Un relato corto por paso y por ronda, para que el participante sepa en qué estado le llega el caso.
     Se apoya en el service blueprint del proyecto y no añade hechos nuevos al escenario. */
  pasos: {
    A1:{ enJuego:"Dónde queda guardada la evidencia que más adelante van a necesitar todos.",
      hoy:"{persona} consulta en la IPS por el dolor lumbar. El médico tratante la examina y registra el diagnóstico; de esa consulta depende si le expide la primera incapacidad ese mismo día o si la remite antes a un especialista. Lo que salga de ahí sale en papel, y la historia clínica se queda en la IPS, sin resumen estructurado y sin versión: ninguna otra entidad sabe todavía que existe.",
      mod:"La consulta ocurre igual, y lo que el médico tratante resuelva queda indexado el mismo día. La historia sigue viviendo en la IPS: el módulo solo guarda que existe, de qué versión es y quién la custodia. Cada consulta posterior quedará registrada con quién la hizo y para qué." },
    A2:{ enJuego:"El subsidio que sostiene el ingreso de {persona} y el conteo de días que después dispara todo lo demás.",
      hoy:"La incapacidad se renueva cada treinta días durante cuatro meses. Cada prórroga llega a la EPS por ventanilla y al empleador por correo, sin acuse, y con cada una la EPS decide si reconoce y paga el subsidio o si pide soportes adicionales antes de pagar. Los certificados quedan en la EPS y el empleador tramita la nómina con las copias que reciba: el conteo de días vive en dos archivos distintos.",
      mod:"La incapacidad se renueva igual y cada prórroga queda registrada con el responsable que la reconoce. Los certificados siguen en la EPS, que decide como antes si reconoce el subsidio o si pide soportes; el empleador consulta los días acumulados y la fecha de inicio, sin ver el resto del certificado. El módulo avisa cuando el caso se acerca al día 120." },
    A3:{ enJuego:"La prueba de a qué estuvo expuesta {persona} en su puesto, que es la mitad de la discusión sobre el origen.",
      hoy:"Para calificar el origen hace falta saber a qué estaba expuesta {persona} en la línea de empaque. La EPS exige esa matriz, y la solicitud llega a la empresa por oficio después de pasar por las manos de la propia trabajadora. En la empresa la arma el responsable de seguridad y salud en el trabajo, que decide qué manda: el formato del SG-SST con versión y fecha, una copia sin ninguna de las dos, o nada hasta que haya una orden expresa. La matriz y las evaluaciones de puesto se quedan en el SG-SST.",
      mod:"La matriz de exposición está expuesta por contrato, en su versión v.2, con responsable y fecha, y la matriz misma permanece en el SG-SST. Quien consulta declara una finalidad y el módulo abre solo los campos que esa finalidad autoriza: el historial disciplinario se retiene en origen. El responsable del SG-SST sigue decidiendo qué expone y qué retiene, y cada suministro queda con constancia de versión, fecha y responsable." },
    E1:{ enJuego:"De esta decisión dependen quién paga, quién rehabilita y a qué régimen pertenece el caso.",
      hoy:"Llegó el día 120 y le corresponde a la EPS decir si la dolencia de {persona} es de origen común o laboral, o pedir más información antes de calificar. Para eso cuenta con lo que se haya podido reunir: una historia clínica parcial, sin el concepto del especialista, y una matriz de exposición sin versión ni fecha. Lo que la EPS resuelva sale por correo y nadie firma un acuse de recibo: no queda constancia de cuándo se enteraron la ARL ni {persona}",
      mod:"La EPS declara la finalidad con la que va a consultar y el módulo le abre la vista mínima de la historia clínica y de la matriz de exposición que esa finalidad autoriza; la historia laboral queda fuera, porque no es pertinente para calificar el origen. Con eso decide y firma. Lo que resuelva se notifica con acuse a la ARL, a la administradora de pensiones y a {persona}, y cada consulta queda registrada con quién la hizo y para qué." },
    E2:{ enJuego:"De esta respuesta depende si el caso se queda en la calificación de la EPS o pasa a la Junta Regional, y cuánto tiempo más queda el origen sin definir.",
      hoy:"A la ARL le llega la calificación por correo, sin los documentos que la sustentan. Para decidir si la acepta, si la controvierte ante la Junta Regional o si pide evidencia adicional, tiene que volver a reunir la prueba: se la pide a la EPS por oficio y, una vez más, a la propia {persona} Si radica ante la Junta, lo hace también por oficio y sin constancia de recibo.",
      mod:"La ARL declara «investigación de origen y prestaciones» y el módulo le abre, de la historia clínica, de la matriz y de los certificados, los campos que su contrato autoriza para esa finalidad; si intenta abrir la historia laboral, la consulta se deniega y la denegación queda registrada. Con eso decide si acepta, si controvierte o si pide más. Si radica ante la Junta, la radicación queda con acuse." },
    E3:{ enJuego:"El dictamen define el origen, el porcentaje de pérdida de capacidad y la fecha de estructuración: de ahí cuelga todo lo que sigue.",
      hoy:"El expediente llega a la Junta Regional en papel. Al revisarlo están la historia clínica, la matriz de exposición y los certificados de incapacidad, pero falta la historia laboral: ese certificado de semanas lo custodia la administradora de pensiones y no viene en el paquete. Con un expediente así, la Junta puede dictaminar con lo que tiene, suspender hasta que llegue el certificado o devolver el expediente para que lo completen; en la ruta de hoy, devolverlo significa que son {persona} y {acompana} las que tienen que ir hasta la ventanilla a conseguirlo y a radicar de nuevo. Lo que la Junta resuelva se comunica por correo.",
      mod:"Antes de radicar, el módulo verifica que el expediente esté completo: historia clínica, matriz de exposición, certificados e historia laboral. La Junta puede pedirle esa historia laboral a la administradora de pensiones por contrato, y decide sobre el expediente que tenga. Lo que dictamine se notifica con acuse a los cuatro destinatarios del caso: la EPS, la ARL, la administradora de pensiones y {persona}" },
    E4:{ enJuego:"Que la segunda instancia pueda revisar lo mismo que vio la primera, y que {persona} sepa que su caso sigue abierto.",
      hoy:"Corre el término para apelar el dictamen. Si la ARL apela, lo hace por oficio, y a la Junta Nacional le llega un paquete incompleto: sin la evolución clínica que usó la Regional y sin una cronología de lo ocurrido. {persona} no consta notificada de esa apelación; si se entera, es después y por terceros.",
      mod:"Si la ARL apela, el paquete viaja íntegro y con la traza de lo que consultó la primera instancia, y {persona} y la Junta Regional reciben acuse. En este prototipo la Junta Nacional no resuelve la apelación: revisa si ese paquete permite decidir con una motivación trazable y registra qué falta." },
    E5:{ enJuego:"El ingreso de {persona} a partir del día 181 y la claridad sobre quién responde por él.",
      hoy:"Pasó el día 180 y el subsidio de la EPS se agotó. La administradora de pensiones se entera del dictamen porque alguien se lo lleva en papel, y tiene que decidir si asume el subsidio desde el día 181, si lo remite a la ARL por tratarse de origen laboral o si espera la firmeza antes de decidir. Entre la ARL y la administradora se discute quién debe pagar, y de esa discusión no queda registro escrito: {persona} no sabe quién le paga a partir del día 181 ni a quién preguntárselo.",
      mod:"La administradora de pensiones consulta el dictamen y los certificados bajo su propia finalidad y decide sobre esa base: asumir el subsidio desde el día 181, remitir a la ARL o esperar la firmeza. Lo que resuelva se notifica con acuse a {persona}, a la EPS y a la ARL, y queda con responsable y con plazo." },
    D1:{ enJuego:"Que {persona} vuelva a un puesto compatible con sus restricciones funcionales, y qué respaldo escrito queda de esa decisión.",
      hoy:"{persona} vuelve a la empresa con restricciones. El concepto de rehabilitación está en la historia clínica de la IPS, no hay un formato común para escribir las restricciones ni un canal para recibirlas, y el empleador decide con lo que le llegue: reintegrarla con restricciones, reubicarla en otro cargo o esperar el concepto de rehabilitación. Lo que resuelva se comunica por carta y no deja registro.",
      mod:"El empleador consulta, bajo la finalidad «reubicación laboral», la vista mínima de restricciones que el módulo le expone —en esta simulación, las restricciones funcionales y el concepto de rehabilitación— y decide sobre esa base; el resto de la historia clínica no se abre. El concepto y las restricciones siguen en la IPS, con versión. Lo que el empleador resuelva queda registrado, y {persona} recibe el acuse con responsable y plazo.",
      supuesto:"La matriz de contratos del proyecto solo autoriza al empleador a consultar los certificados de incapacidad; el alcance de esta vista está pendiente de confirmar con el investigador." },
    D2:{ enJuego:"La prestación de la que depende el sostenimiento de {persona} a mediano plazo.",
      hoy:"Con el dictamen en firme hay que radicar la prestación en papel ante la administradora de pensiones o ante la ARL. La historia laboral y el dictamen están en archivos separados y ninguna de las dos entidades ve el expediente completo: la administradora decide si resuelve con eso, si pide una historia laboral actualizada o si remite a la ARL. La resolución sale por correo, después de meses en los que nadie informa el estado del trámite.",
      mod:"La administradora de pensiones consulta el dictamen y la historia laboral en origen, con la versión del estándar de pérdida de capacidad que corresponda, y decide sobre esa base: resolver la prestación, pedir la historia actualizada o remitir a la ARL. Si el origen quedó laboral, la ARL asume la prestación con una decisión motivada. Lo que se resuelva se notifica con acuse, y {persona} ve «prestación en estudio», con responsable y con la fecha en que vence." },
    D3:{ enJuego:"La vía que queda cuando la ruta no avanza: una queja ante la Superintendencia o una tutela, y lo que hay que reunir para presentarla.",
      hoy:"Si nada avanza, la queja ante la Superintendencia o la tutela se presentan con las copias que se hayan ido guardando, porque no hay una cronología común del caso. La Superintendencia decide qué hace con esa queja: enrutarla con responsable y plazo, pedir informes a la EPS por oficio, o archivarla por falta de competencia. Cada entidad responde con su propio archivo, y el despacho judicial que reciba una tutela reconstruye la línea de tiempo con lo que le aporten.",
      mod:"La vista de estado ya es la cronología del caso —etapas, responsables, plazos y acuses— y se puede adjuntar a la queja o a la tutela. La Superintendencia decide sobre esa misma cronología y puede consultar el estado y las fechas sin abrir campos clínicos. Si el caso llega a tutela, el despacho judicial consulta la cronología completa y el registro de accesos, y lo que ordene queda registrado con plazo." }
  },

  /* ---------- Quién es usted en este caso ---------- */
  roles: {
    tra:"Usted responde como {persona}: {edad} años, {cargo}, en el día {dia} de una incapacidad prolongada. {acompanaMayus} la acompaña a las diligencias. No se le pregunta qué dice la norma, sino qué entiende de su propio caso en cada momento, quién siente que le responde y qué le tocó hacer para que el trámite avanzara.",
    emp:"Usted responde por el empleador de {persona}, desde el área de seguridad y salud en el trabajo. Allí vive la matriz de exposición del puesto de empaque, que otras entidades le van a pedir, y más adelante le corresponderá decidir cómo recibe de vuelta a una trabajadora con restricciones.",
    ips:"Usted responde por la IPS que atiende a {persona} Allí están su historia clínica, el diagnóstico y el concepto de rehabilitación. Cuando alguien pide esa evidencia, usted decide qué entrega, en qué forma y en cuánto tiempo.",
    eps:"Usted responde por la EPS donde {persona} está afiliada. Ha reconocido sus incapacidades durante cinco meses y custodia los certificados. En el día 120 le corresponde decir, en primera oportunidad, si el origen de la dolencia es común o laboral.",
    arl:"Usted responde por la administradora de riesgos laborales de la empresa. Si el origen resulta laboral, las prestaciones corren por su cuenta. Cuando llegue la calificación de la EPS tendrá que decidir si la acepta o si la controvierte ante la Junta.",
    afp:"Usted responde por la administradora de pensiones donde {persona} cotiza, que en las tablas de la simulación aparece como «AFP / Colpensiones». Custodia su historia laboral y sus semanas cotizadas, y a partir del día 181 puede corresponderle el subsidio. También decide la prestación cuando el dictamen quede en firme.",
    jr:"Usted responde por la Junta Regional de Calificación de Invalidez. Cuando la controversia llegue, le corresponde dictaminar el origen, la pérdida de capacidad laboral y la fecha de estructuración, con el expediente que le hayan radicado.",
    jn:"Usted responde por la Junta Nacional. En este prototipo no resuelve la apelación: verifica si el paquete que le llega permite decidir con una motivación trazable y registra qué le falta.",
    mintrabajo:"Usted responde por el Ministerio del Trabajo, en su función de inspección, vigilancia y control sobre el empleador y la administradora de riesgos laborales. No le corresponde calificar ni pagar: le corresponde requerir lo que haga falta y, si un término se venció, escalar con un plazo. No necesita datos clínicos para eso.",
    minsalud:"Usted responde por el Ministerio de Salud, que fija el vocabulario y los contenidos mínimos de la información en salud. No consulta casos: gobierna el lenguaje con el que las demás entidades los escriben.",
    supersalud:"Usted responde por la Superintendencia Nacional de Salud, que vigila a las EPS y a las IPS. Si {persona} se queja por la demora, le corresponde decidir qué hace con esa queja: enrutarla con un responsable y un plazo, pedir informes, o archivarla si no es de su competencia. Para eso no necesita abrir su historia clínica.",
    jueces:"Usted responde por el despacho judicial que recibe una tutela de {persona} por la demora y por la falta de notificación. No le corresponde calificar el origen: le corresponde establecer si alguien incumplió un deber y ordenar lo que haya que ordenar, con un plazo, a partir de lo que el expediente le permita reconstruir."
  },

  orientacion: {
    pasos:[{ id:"estudio", n:"El estudio" },{ id:"caso", n:"El caso" },{ id:"mecanica", n:"Cómo funciona" },{ id:"rol", n:"Su rol" }],
    estudio: {
      titulo:"Qué es este estudio y qué se busca",
      parrafos:[
        "Esta simulación hace parte de una investigación doctoral sobre interoperabilidad clínico-laboral: cómo circula la evidencia clínica y laboral entre las entidades que intervienen cuando una incapacidad se prolonga y hay que definir su origen, quién paga y cómo regresa la persona al trabajo.",
        "Usted participa porque conoce uno de esos roles. Va a recorrer un caso sintético paso por paso, decidiendo lo que le corresponde a su entidad, y en cada paso verá qué cambiaría si la ruta funcionara con el módulo de interoperabilidad que propone la investigación."
      ],
      buscaTitulo:"Qué se busca con su participación",
      busca:[
        "Conocer cómo actúa su rol en cada paso de la ruta: con qué información cuenta, qué le falta, a quién se la pide y cuánto tarda.",
        "Conocer si esa actuación cambiaría, y en cuánto tiempo, si la evidencia le llegara como la entregaría el módulo propuesto.",
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
        { t:"Un recorrido, con la comparación dentro", d:"Recorre la ruta una sola vez, como funciona hoy. En cada paso, después de decidir, ve qué le habría llegado con el módulo propuesto y dice si su decisión sería la misma." },
        { t:"Paso a paso", d:"En cada paso verá en qué estado llega el caso, el expediente tal como le llega a su entidad, lo que le compete y su base normativa. Si su rol interviene, decide; si no, lee el contexto y continúa. En todos puede escribir lo que quiera añadir." },
        { t:"Los demás actores están simulados", d:"Nadie más está conectado. El sistema lleva el caso por usted: representa a los otros actores con los datos sintéticos del escenario y, en nombre de su entidad, anota los actos que se derivan de lo que usted responde: las solicitudes, las consultas, las notificaciones y los acuses. Todo eso aparece marcado como «simulado» y se cuenta aparte de sus respuestas. El renglón que enlaza su respuesta con la solicitud que la motivó no lleva ese distintivo, porque la respuesta es suya." },
        { t:"El caso reacciona a lo que usted decide", d:"No hay un guion fijo: si pide más información el término se alarga, si no entrega una pieza quien la necesitaba decide sin ella, y los actores que no están conectados responden a lo que usted hizo. Puede corregir una respuesta antes de pasar al paso siguiente." },
        { t:"Antes de empezar y al terminar", d:"Antes del recorrido responde unas preguntas sobre su perfil profesional. Al terminar lee el contrato de datos que el módulo propone para su rol, dice si lo aceptaría y responde cuatro preguntas sobre lo que recorrió." },
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
      intervieneNotaTodos:"Su rol interviene en todos los pasos de la ruta: no hay ninguno en el que solo mire.",
      terminosTitulo:"Términos que verá en la simulación",
      /* Dos términos que la simulación usa y que la lista del blueprint no trae. */
      terminos:[
        ["contrato de datos", "qué puede consultar un rol, qué tiene que entregar, quién responde y en qué plazo; es lo que usted valora al cerrar cada ronda."],
        ["vista de estado", "lo que {persona} alcanza a ver de su propio caso: etapa, responsable, plazo y acuses, sin campos clínicos."],
        ["administradora de pensiones", "la entidad donde {persona} cotiza, que custodia su historia laboral; en las tablas y los menús aparece con la etiqueta del documento del proyecto, «AFP / Colpensiones»."]
      ]
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
      { t:"Riesgos y beneficios", d:"No se prevén riesgos distintos de los de responder un cuestionario profesional. No hay compensación económica. Sus respuestas alimentan el diseño de un módulo que se propone reducir la carga administrativa que hoy recae sobre el trabajador y hacer explícito quién responde y en qué plazo. Si ese diseño sirve, y qué carga o qué riesgo le significaría a una entidad como la suya, es parte de lo que este estudio le pregunta." },
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

  /* ---------- Encuesta de perfil del participante ----------
     Va después de la declaración de participación y antes del recorrido. No identifica a nadie:
     describe la experiencia profesional de quien responde, para poder leer sus respuestas. */
  encuesta: {
    titulo:"Su perfil profesional",
    intro:"Antes de empezar, unas preguntas sobre usted. No se le pide su nombre ni el de su entidad: sirven para leer sus respuestas sabiendo desde qué experiencia las da.",
    nota:"Si alguna pregunta no aplica a su caso, escriba «no aplica». Puede cambiar estas respuestas antes de entregar.",
    guardar:"Guardar y comenzar el recorrido",
    campos:[
      { id:"edad", n:"Edad", tipo:"ops", req:true, ops:[["18-29","18 a 29"],["30-39","30 a 39"],["40-49","40 a 49"],["50-59","50 a 59"],["60+","60 o más"]] },
      { id:"formacion", n:"Profesión o formación de base", tipo:"ops", req:true, ops:[["salud","Área de la salud"],["derecho","Derecho"],["administracion","Administración o economía"],["ingenieria","Ingeniería o tecnología"],["sst","Seguridad y salud en el trabajo"],["otra","Otra"]] },
      { id:"formacionCual", n:"¿Cuál?", tipo:"texto", ayuda:"Su título o su formación principal.", req:true },
      { id:"complementarios", n:"Estudios complementarios", tipo:"texto", ayuda:"Especializaciones, maestrías, diplomados o certificaciones pertinentes a este trabajo. Si no tiene, escriba «ninguno»." },
      { id:"experiencia", n:"Años de experiencia en este tipo de trámites", tipo:"numero", req:true, ayuda:"Años trabajando con incapacidades, calificación de origen, prestaciones o seguridad y salud en el trabajo." },
      { id:"rolActual", n:"Cargo o función que desempeña hoy", tipo:"texto", req:true },
      { id:"trayectoria", n:"Entidades o empresas donde ha trabajado y el rol que tuvo en cada una", tipo:"largo", req:true, ayuda:"Una por renglón, sin nombres de personas. Por ejemplo: «EPS, analista de incapacidades, 4 años» o «empresa del sector alimentos, responsable de SG-SST, 3 años»." },
      { id:"frecuencia", n:"¿Con qué frecuencia atiende casos como este?", tipo:"ops", req:true, ops:[["diario","A diario"],["semanal","Varias veces por semana"],["mensual","Algunas veces al mes"],["rara","Rara vez"],["nunca","Nunca, pero conozco el trámite"]] },
      { id:"otrosRoles", n:"¿Ha trabajado en alguno de los otros roles de esta ruta?", tipo:"texto", ayuda:"Por ejemplo, si hoy está en una ARL pero antes estuvo en una EPS o en una IPS. Si no, escriba «no»." }
    ]
  },

  /* Títulos e instrucciones de las actividades por tipo. Se describe la situación, nunca lo que conviene responder. */
  actividad: {
    focal:{ titulo:"Cómo vive {persona} este paso",
      instr:"Póngase en el lugar de {persona} y responda desde ahí. Interesa qué entiende ella de lo que está pasando con su caso en este momento, a quién siente que le corresponde responderle y qué le tocó hacer por su cuenta para que el trámite avanzara. No hay respuestas correctas ni incorrectas: lo que se busca es lo que ocurre de verdad, no lo que debería ocurrir.",
      instrCorta:"Siga respondiendo como {persona}: qué entiende de su caso en este momento, a quién le corresponde responderle y qué le tocó hacer para que esto avanzara." },
    decide:{ titulo:"Le toca decidir en este paso",
      instr:"Mire primero con qué información cuenta y si le alcanza para actuar; si algo le falta, señálelo. Después declare con qué finalidad consultaría esa evidencia, tome la decisión y diga quién responde por ella en su entidad y en cuántos días. Responda como lo haría en su trabajo, con las limitaciones que tendría en la práctica." },
    custodia:{ titulo:"Le piden evidencia que usted custodia",
      instr:"Otra entidad necesita, para poder seguir con el caso, una pieza de evidencia que vive en su organización. En el bloque «Lo que le piden» verá qué pieza le solicitan y con qué finalidad la piden. Decida qué le entrega: todo lo que le piden, solo lo que es pertinente para esa finalidad, o nada. Diga también cuántos días le tomaría en la práctica, contando lo que implica buscarla, revisarla y enviarla.",
      instrMod:"Aquí el módulo atiende la solicitud por usted: abre únicamente los campos que el contrato de quien consulta autoriza para la finalidad que declaró, y el resto queda retenido en su entidad. En el bloque «Lo que el módulo ya entregó de su evidencia» verá qué campos salieron y cuáles no. Le preguntamos lo mismo que en la ronda 1, suponiendo que la ruta funcione así: qué entregaría usted y cuántos días le tomaría, contando lo que implique revisar y aprobar la versión que el módulo publica y mantenerla al día." },
    soporte:{ titulo:"Su entidad vigila o acompaña este paso",
      instr:"En este paso la decisión de fondo —calificar, dictaminar, pagar— no es suya: le corresponde a otra entidad. Lo suyo es qué alcanza a ver del caso desde su entidad y qué puede hacer con eso dentro de su competencia. Diga qué información le llega en este momento, si le llega alguna, y qué acción tomaría de las tres que tiene a mano: ninguna, requerir información u ordenar con plazo." }
  },

  /* Lo que se ve al guardar una respuesta y lo que sigue. */
  guardado: {
    titulo:"Su respuesta quedó registrada",
    comprobacionTituloHoy:"Cómo se vería esta consulta frente al contrato que propone el módulo",
    comprobacionTituloMod:"Comprobación frente al contrato de datos de su rol",
    comprobacionHoy:"Hoy nadie hace esta comprobación. Su respuesta queda registrada tal como la dio; el sistema la contrasta aparte, para poder compararla con lo que autorizaría el módulo.",
    comprobacionMod:"Con el módulo, esta comprobación se hace en cada consulta y queda registrada con quién consultó, para qué y con qué resultado.",
    efectos:"Qué ocurrió en la simulación después de su respuesta",
    efectosNota:"Esto lo generó el sistema a partir de su respuesta y de los datos sintéticos del caso. Según el paso, unos renglones son los actos de su propia entidad —las solicitudes que usted haría, sus consultas y sus notificaciones— y otros son la reacción de los actores que no están conectados. Ninguno es la respuesta de otra persona.",
    sigue:"Cuando quiera, continúe: el caso avanza al siguiente momento de la ruta."
  },

  /* ---------- El recorrido ----------
     La versión asíncrona recorre la ruta UNA sola vez: una persona sola, sin facilitador, no
     sostiene dos recorridos completos. La comparación con el módulo va dentro de cada paso. */
  ronda: {
    n:"El recorrido de la ruta",
    titulo:"Va a recorrer la ruta de este caso, paso por paso",
    parrafos:[
      "Va a recorrer los once pasos de la ruta de incapacidad de este caso, desde el primer día hasta el seguimiento. En cada paso verá el expediente tal como le llega a su entidad, con el contenido de cada documento y con los vacíos que tenga, lo que le compete decidir allí y la base normativa que lo sustenta.",
      "Lo que usted decida cambia el caso. Si pide más información, el término se alarga; si no entrega una pieza, quien la necesitaba decide sin ella; si califica el origen de un modo o de otro, el caso sigue por caminos distintos. Los demás actores no están conectados: el sistema los representa y reacciona a lo que usted hizo.",
      "Después de decidir, en la misma pantalla verá qué le habría llegado con el módulo de interoperabilidad que propone la investigación y se le preguntará si con esa información su decisión sería la misma. Esa comparación, paso por paso, es lo que el estudio necesita.",
      "Tómese el tiempo que necesite: son entre 30 y 45 minutos. Puede pausar y continuar después."
    ],
    reglasTitulo:"Las cinco reglas del módulo propuesto",
    contratoTitulo:"Lo que el módulo le permitiría a su rol",
    recorridoCierre:"Al final valorará el contrato de datos que el módulo propone para su rol y responderá cuatro preguntas sobre lo que recorrió.",
    cierre:"Terminó el recorrido. Para cerrar, lea el contrato de datos que el módulo propone para su rol —qué podría consultar, qué tendría que entregar, quién responde y en qué plazo—, diga si lo aceptaría tal como está y responda cuatro preguntas sobre lo que acaba de recorrer.",
    notaMejora:"Responda pensando en lo que vio paso por paso: en cada uno se le mostró qué le habría llegado con el módulo y qué habría cambiado."
  },

  /* ---------- El expediente que viaja ----------
     El blueprint nombra los campos de cada pieza; el perfil del caso trae su contenido. Esto es
     lo que convierte «HC parcial» en un documento que el participante puede leer. */
  expediente: {
    tituloHoy:"El expediente como le llega a usted",
    introHoy:"Esto es lo que hay en sus manos en este punto del caso. Lo que no llegó aparece dicho como lo que es: un vacío con nombre.",
    tituloMod:"Lo que le habría llegado con el módulo",
    introMod:"El módulo no le abre el expediente completo: de cada pieza le abre los campos que el contrato de su rol autoriza para la finalidad que usted declara, y el resto se queda en origen.",
    noLlego:"No llegó a su entidad",
    retenido:"Se queda en origen: fuera del contrato de su rol para esta finalidad",
    vacio:"No llegó",
    sinVersion:"sin versión, sin fecha y sin responsable",
    conVersion:"con versión, fecha y responsable",
    propia:"Evidencia que usted custodia",
    nada:"En este paso no entra ninguna pieza nueva de evidencia.",
    anade:"Lo que el módulo añadiría a lo que usted tiene ahora",
    anadeNada:"Con el módulo, en este paso usted no vería ningún campo más de lo que ya tiene."
  },

  /* ---------- Lo que le compete en el paso, y su base legal ---------- */
  competencia: {
    titulo:"Lo que le compete en este paso",
    normasTitulo:"Base normativa",
    precedentesTitulo:"Precedentes que pesan sobre su rol",
    plazoTitulo:"Responsable y plazo que el proyecto supone",
    nota:"Los plazos en días son supuestos de simulación tomados de la matriz de contratos del documento del proyecto; no son términos legales."
  },

  /* ---------- La comparación, dentro de cada paso ---------- */
  comparacion: {
    titulo:"Con esa información, ¿cambiaría su decisión?",
    intro:"Es lo que el estudio compara: no si el módulo le parece buena idea, sino si con esa información usted habría actuado distinto, y en cuánto tiempo.",
    pregunta:"Con lo que el módulo le habría abierto, su decisión sería…",
    ops:[["misma","La misma"],["otra","Otra decisión"],["no_debi","Con lo de hoy no debí decidir"]],
    cual:"¿Cuál habría sido, y por qué?",
    dias:"¿En cuántos días, con esa información?",
    diasAyuda:"Los días que le tomaría el mismo trámite si la evidencia le llegara así.",
    seguridad:"¿Con cuánta seguridad decidiría?",
    seguridadOps:[["alta","Con seguridad"],["media","Con dudas"],["baja","Seguiría sin poder decidir"]]
  },

  /* ---------- Lo que ocurre después de responder ---------- */
  consecuencia: {
    titulo:"Qué pasó en el caso con su respuesta",
    sistema:"Lo que hicieron los actores que no están conectados",
    estado:"Cómo queda el caso después de este paso",
    forzado:"El sistema tomó este curso para que su rol alcance a intervenir más adelante en la ruta.",
    sigue:"Cuando quiera, continúe: el caso avanza al siguiente paso de la ruta."
  },

  /* ---------- El espacio en blanco de cada paso ---------- */
  observacion: {
    titulo:"Lo que quiera añadir sobre este paso",
    ayuda:"Aquí escriba lo que la pregunta no alcanza a recoger: lo que en su experiencia no ocurre así, lo que falta, lo que le va a complicar el paso siguiente, la norma que usted aplicaría, el dato que echó de menos. Es opcional, pero es donde suelen estar los hallazgos.",
    marca:"opcional"
  },

  /* ---------- Rótulos de la ficha de la persona del caso ---------- */
  fichaPersona:[
    ["nombre","Quién"],["edad","Edad"],["cargo","Cargo"],["empresa","Dónde trabaja"],["sector","Sector"],
    ["antiguedad","Antigüedad"],["contrato","Contrato"],["jornada","Jornada"],["ingreso","Ingreso"],
    ["ciudad","Dónde"],["hogar","Hogar"],["acompana","Quién la acompaña"]
  ],

  contexto: {
    titulo:"Lo que ocurre mientras su rol no interviene",
    instr:"En estos pasos su rol no tiene que decidir ni entregar nada. Léalos para saber por dónde va el caso de {persona} y en qué estado le llegará cuando le toque actuar.",
    instrUno:"En este paso su rol no tiene que decidir ni entregar nada. Léalo para saber por dónde va el caso de {persona} y en qué estado le llegará cuando le toque actuar.",
    obs:"Si algo de lo que acaba de leer le llama la atención, escríbalo aquí (opcional)",
    obsAyuda:"Por ejemplo, algo que en su experiencia no ocurre así, algo que falta o algo que le parece que se le va a complicar después."
  },

  cierre: {
    titulo:"Terminó la simulación",
    gracias:"Gracias por recorrer la ruta completa y por compartir su criterio. Lo que respondió es la evidencia que esta investigación necesita.",
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

  /* Cómo se nombra, en los avisos, lo que falta por responder: en palabras y no con el código de la pregunta. */
  falta: {
    semaforo:"si aceptaría el contrato de datos de su rol",
    ajuste:"qué cambiaría del contrato",
    mejora:"la comparación frente a hoy",
    P1:"si están representados los actores y los documentos",
    P2:"si se comprenden las responsabilidades",
    P3:"las dificultades que aparecieron",
    P4:"los requisitos para el siguiente prototipo"
  },

  /* Minutos por pantalla, para estimar la duración que se informa al participante. */
  tiempos: { inicio:9, focal:2, decide:4, custodia:3, soporte:2.5, contexto:1, valoracion:6, cierre:3 }
};
