/* ============ Expedientes sintéticos de pensión de invalidez ============
   Transcripción del documento del proyecto «Expedientes sintéticos de pensión de invalidez por
   enfermedad laboral · Cuatro casos para el simulador doctoral en el caso SURA» (Ariel Ramírez),
   bajo el marco rector DGIT-PENSION-R1 (Proyecto 2, 5 de noviembre de 2026). Versión final: los
   cuatro expedientes son de origen laboral.

   Nada de este archivo se inventa: los textos, los porcentajes, las fechas, los estados de los
   soportes, las respuestas de referencia de H2 y los intentos de acceso de H3 vienen del
   documento. Lo único añadido son las claves con las que el motor los lee.

   La trayectoria, los datos clínicos, los porcentajes, las empresas y los desenlaces se crearon
   para la simulación. SURA cumple la función de organización ancla.

   Ajuste del investigador (19/11/2026). Un dictamen de 50 % o más ya en firme da por sí mismo el derecho a la
   pensión, y la simulación perdería su objeto. Por eso, en PI-L01, PI-L03 y PI-L04 la calificación de 50 % o
   más todavía NO está en firme cuando se radica la solicitud: en PI-L01 el solicitante objetó la fecha de
   estructuración y el caso está en la Junta Regional; en PI-L03 la calificación integral de 52,40 % es la de la
   Junta Regional, apelada por ARL SURA y sin decisión de la Junta Nacional (el soporte DIC es ahora la constancia
   del estado de ese recurso); en PI-L04 la solicitud se radica
   mientras corre el término de inconformidad. Si hay pensión depende de la evidencia y de la instancia: con el
   expediente completo, la pauta prevé dejar pendiente el reconocimiento. PI-L02 se conserva: la Junta Nacional
   redujo la PCL a 44,30 % y ese dictamen sí está en firme. */

const EXP = {

  marco: {
    id:"DGIT-PENSION-R1",
    fecha:"5 de noviembre de 2026",
    titulo:"Marco rector doctoral DGIT-PENSION-R1, Proyecto 2",
    pregunta:"¿En qué medida la aplicación de una metodología para diseñar soluciones de interoperabilidad clínico-laboral cambia la completitud de la evidencia requerida para decidir sobre el reconocimiento de la pensión de invalidez de origen común o laboral en Colombia, frente al flujo actual de información, en el caso SURA?",
    problema:"Fragmentación de la evidencia necesaria para tramitar y decidir sobre el reconocimiento de la pensión de invalidez en Colombia, de origen común o laboral, en el caso SURA. Esta es la síntesis de la delimitación registrada en Proyecto 2. La persona solicitante es el actor focal.",
    subpreguntas:[
      { id:"SP1", t:"¿Qué requerimientos de interoperabilidad se derivan de los actores, sistemas, flujos, documentos y puntos de ruptura del proceso de reconocimiento de la pensión de invalidez de origen común o laboral en el caso SURA?" },
      { id:"SP2", t:"¿Qué pasos, reglas y criterios debe incorporar la metodología para diseñar una solución de interoperabilidad clínico-laboral que articule la gobernanza entre actores y el intercambio de evidencia para el reconocimiento de la pensión de invalidez de origen común o laboral, sin centralizar historias clínicas?" },
      { id:"SP3", t:"¿Qué resultados técnicos, operativos y de viabilidad se observan al aplicar y evaluar, en el caso SURA, una solución diseñada con la metodología para el reconocimiento de la pensión de invalidez de origen común o laboral, frente al flujo actual de información?" }
    ],
    /* Formulación aprobada de las hipótesis, textual. */
    hipotesis:[
      { id:"H1", n:"Completitud de la evidencia", t:"En escenarios equivalentes del proceso de reconocimiento de la pensión de invalidez de origen común o laboral, en el caso SURA, el uso de una solución diseñada mediante la metodología de interoperabilidad clínico-laboral aumenta la proporción de elementos de evidencia requeridos que están disponibles y cumplen los requisitos definidos para cada decisión, frente al flujo actual de información.",
        variable:"Completitud en P2", regla:"Elementos requeridos disponibles y conformes ÷ total de elementos requeridos. Comparar ambas condiciones del mismo expediente en puntos porcentuales." },
      { id:"H2", n:"Identificación de responsabilidades", t:"En escenarios equivalentes del proceso de reconocimiento de la pensión de invalidez de origen común o laboral, en el caso SURA, los participantes que utilizan el blueprint de gobernanza federada identifican correctamente una mayor proporción de responsabilidades sobre el aporte y la revisión de la evidencia y la toma de decisiones que cuando utilizan la descripción del flujo actual.",
        variable:"Identificación de responsabilidades", regla:"Respuestas correctas ÷ responsabilidades evaluadas. Aplicar individualmente seis tareas por caso. Revisar la pauta con los actores antes del estudio." },
      { id:"H3", n:"Trazabilidad de accesos", t:"En escenarios equivalentes de intercambio de evidencia para el reconocimiento de la pensión de invalidez de origen común o laboral, en el caso SURA, el uso del módulo interoperable definido por la metodología aumenta la proporción de accesos cuyo actor, finalidad, momento, acción y resultado pueden reconstruirse correctamente mediante una revisión independiente de los registros, frente al flujo actual de información.",
        variable:"Trazabilidad de accesos", regla:"Accesos reconstruidos correctamente ÷ accesos que debían registrarse. Exigir actor, finalidad, momento, acción y resultado en los cuatro intentos de referencia." }
    ],
    evidenciaSub:[
      { id:"SP1", t:"Registrar actor, sistema fuente, canal, soporte y punto de ruptura." },
      { id:"SP2", t:"Convertir los hallazgos en pasos de la metodología, reglas de custodia, permisos por finalidad y criterios de conformidad." },
      { id:"SP3", t:"Registrar completitud, reprocesos, tiempos de simulación y dificultades de viabilidad, con el soporte y el actor afectados." }
    ],
    conjunto:"Este conjunto de cuatro expedientes aplica la formulación doctoral a las solicitudes de pensión por enfermedad laboral.",
    nota:"Los cocientes iniciales de las fichas describen el estado del guion al radicar. La completitud observada se calcula sobre las ejecuciones. Un expediente completo sustenta una decisión motivada: reconocer, negar o dejar pendiente el reconocimiento mientras el dictamen no esté en firme."
  },

  /* ---------- Protocolo de comparación, del documento ---------- */
  protocolo: {
    aplicacion:"Asignar un expediente y un rol. Presentar la ficha y la evidencia pertinente al participante. Preparar dos condiciones con el mismo expediente de origen, versiones fuente, criterios de conformidad y oportunidad de respuesta. En la primera se usan los canales reconstruidos del flujo actual y en la otra se aplica el índice con acceso por finalidad y custodia distribuida.",
    reinicio:"Reiniciar el expediente al comenzar cada condición y alternar el orden entre participantes. Mantener un corte de 48 horas virtuales para el piloto y guardar una instantánea justo antes de la decisión P2. Si el participante pide un soporte, el estado solo cambia cuando este llega, se verifica y se acepta. Comunicar el resultado al solicitante.",
    corteHoras:48,
    condiciones:[
      { id:"actual", n:"Flujo actual", d:"Los canales reconstruidos del flujo actual: oficio, correo, bandejas documentales y lo que la persona solicitante alcance a aportar." },
      { id:"modulo", n:"Módulo interoperable", d:"El índice con acceso por finalidad y custodia distribuida: cada consulta declara para qué y el módulo abre solo los campos autorizados." }
    ]
  },

  /* ---------- Soportes que circulan en los expedientes ----------
     Cada caso usa los que le corresponden. El código es el del documento. */
  piezas: {
    SOL: { n:"Solicitud e identidad", sl:"SOL" },
    ORI: { n:"Confirmación del origen", sl:"ORI" },
    REG: { n:"Dictamen de Junta Regional", sl:"REG" },
    CAR: { n:"Dictamen previo de túnel carpiano", sl:"CAR" },
    DIC: { n:"Dictamen de PCL", sl:"DIC" },
    FIR: { n:"Constancia de firmeza", sl:"FIR" },
    AFI: { n:"Afiliación y cobertura", sl:"AFI" },
    IBC: { n:"Certificado de IBC", sl:"IBC" },
    APT: { n:"Análisis de puesto", sl:"APT" },
    EXP: { n:"Informe de higiene", sl:"EXP" },
    NEX: { n:"Anexo de exposición fechado", sl:"NEX" },
    FUN: { n:"Informe de función", sl:"FUN" },
    AUD: { n:"Extracto audiológico", sl:"AUD" },
    HC:  { n:"Resumen clínico", sl:"HC" }
  },

  /* Estados iniciales posibles de un soporte, con lo que significan para la completitud de H1. */
  estados: {
    conforme:    { n:"Conforme", cuenta:true,  d:"Está en el expediente y cumple el criterio de conformidad." },
    no_conforme: { n:"No conforme", cuenta:false, d:"Está en el expediente pero no cumple el criterio: versión, período o alcance equivocados." },
    ausente:     { n:"Ausente", cuenta:false, d:"No está en el expediente." }
  },

  /* Lo que un participante puede hacer con un soporte en cada punto de decisión. */
  actuaciones: [
    ["consultar", "Consultar el soporte", "Declara la finalidad y mira lo que el soporte le muestre."],
    ["solicitar", "Solicitar o subsanar", "Pide el soporte, o su versión correcta, al actor que lo custodia."],
    ["aceptar", "Aceptar como conforme", "Da por cumplido el criterio de conformidad con lo que tiene a la vista."],
    ["devolver", "Devolver por no conforme", "Rechaza el soporte indicando qué le falta o qué está mal."]
  ],

  /* ---------- Los cuatro expedientes ---------- */
  casos: [

  /* ======================= PI-L01 ======================= */
  {
    id:"PI-L01", origen:"laboral", titulo:"Montacarguista con dictamen aún sin firmeza",
    resumenTabla:"La PCL supera el umbral, pero el dictamen no está en firme: el solicitante objetó la fecha de estructuración y el caso está en la Junta Regional. Para liquidar, además, falta un período de IBC.",
    persona:{
      nombre:"Mateo Roldán Vega", edad:52, edadNota:"52 años al radicar", sexo:"masculino",
      ciudad:"Bello, Antioquia", nacimiento:"19/09/1973",
      formacion:"Bachiller con formación técnica en logística", dominancia:"derecha",
      situacion:"Solicitante y operador de montacargas reubicado a inventario",
      vinculo:"Contrato vigente con funciones de inventario adaptadas e incapacidades intermitentes",
      convivencia:"Vive con su pareja",
      pide:"Él radica la solicitud y pide saber a quién corresponde el siguiente paso y si su inconformidad con la fecha detiene la pensión."
    },
    trayectoria:[
      { periodo:"01/02/1996 a 31/01/2004", dur:"8 a", empresa:"Bodegas Travesía Norte", centro:"Bello, bodega de despachos", ciiu:"5210", cargo:"Auxiliar de despachos", trabajo:"Paletiza 35 a 45 cajas por turno, de 12 a 22 kg. La manipulación ocupa 2,5 h acumuladas de un turno de 8 h.", vinculo:"Indefinido", arl:"ARL histórica A" },
      { periodo:"01/02/2004 a 31/01/2013", dur:"9 a", empresa:"Operaciones Cauce Industrial", centro:"Itagüí, patio de carga", ciiu:"5224", cargo:"Operador de montacargas de combustión", trabajo:"Conduce 4,5 h por turno de 8 h y mueve unos 55 palés. Alterna marcha atrás en muelles y ubicación en estantería alta.", vinculo:"Indefinido", arl:"ARL histórica B" },
      { periodo:"01/02/2013 a 31/01/2024", dur:"11 a", empresa:"Depósitos Andén Umbral", centro:"Girardota, centro de distribución", ciiu:"5210", cargo:"Operador de montacargas retráctil", trabajo:"Conduce 5 h por turno de 8 h, cerca de 75 ciclos por turno. Mira hacia atrás al retroceder y eleva el cuello para ver el mástil.", vinculo:"Indefinido", arl:"ARL SURA" },
      { periodo:"01/02/2024 a vigente al corte", dur:"2 a 2 m 21 d", empresa:"Depósitos Andén Umbral", centro:"Girardota, centro de distribución", ciiu:"5210", cargo:"Auxiliar de inventario", trabajo:"Concilia referencias y conteos en tablet. Alterna sentado y de pie y cuenta con pausas. Las tareas asignadas excluyen la conducción.", vinculo:"Indefinido · reubicación", arl:"ARL SURA" }
    ],
    tiempos:"Bodegas Travesía Norte, 8 a · Operaciones Cauce Industrial, 9 a · Depósitos Andén Umbral, 13 a 2 m 21 d. Vínculo acumulado al radicar 11.038 días.",
    actividad:"5210 almacenamiento y depósito · 5224 manipulación de carga.",
    vacios:"",
    exposicion:"Dos décadas de conducción de montacargas. En 2023, una medición personal de vibración de cuerpo entero en Girardota consignó A(8) de 0,58 m/s² y factor de cresta de 10,2 en el eje dominante. El informe identifica el equipo, el asiento y el recorrido por juntas de piso. En 2024 se reparó parte del pavimento. La medición representa ese turno y equipo.",
    clinica:{
      diagnostico:"Trastorno de disco cervical con mielopatía C5–C6 (M50.0)",
      detalle:"Persisten alteración de la marcha y pérdida de destreza manual después de cirugía y rehabilitación. La IPS registró dificultad para subir escaleras, sostener herramientas y manipular cargas. Hipertensión controlada como antecedente común. PCL laboral de 56,80 %, consignada en dictamen sintético.",
      funcion:"Tras una cirugía y rehabilitación ambulatoria conserva limitaciones de marcha, agarre y destreza. El cargo de inventario permite alternar postura y excluye la conducción.",
      rehabilitacion:"Tras la cirugía cervical del 22/05/2024 se registra una incapacidad de 60 días. Luego realiza 24 sesiones ambulatorias de rehabilitación entre julio y octubre de 2024. El seguimiento de diciembre de 2025 mantiene la restricción de conducción.",
      pcl:56.80, pclOrigen:"laboral", estructuracion:"10/12/2025"
    },
    referenciasTemporales:[
      ["Primer síntoma registrado", "49 años", "18/05/2023"],
      ["Diagnóstico inicial", "50 años", "14/03/2024"],
      ["Estructuración en el dictamen final", "52 años", "10/12/2025"]
    ],
    actores:[
      { a:"arl", n:"ARL SURA", rol:"ARL SURA, medicina laboral y prestaciones", custodia:["DIC", "FIR", "AFI"] },
      { a:"eps", n:"EPS SURA", rol:"EPS SURA, medicina laboral", custodia:[] },
      { a:"ips", n:"IPS", rol:"IPS de columna y rehabilitación", custodia:["HC"] },
      { a:"emp", n:"Empleador", rol:"SG-SST y nómina de Depósitos Andén Umbral", custodia:["IBC", "APT"] },
      { a:"jr", n:"Junta Regional", rol:"Junta Regional de Antioquia", custodia:[] },
      { a:"jn", n:"Junta Nacional", rol:"Junta Nacional", custodia:["ORI"] },
      { a:"tra", n:"Solicitante", rol:"Mateo Roldán, solicitante", custodia:["SOL"] }
    ],
    perspectiva:"Mateo quiere saber si su inconformidad con la fecha de estructuración detiene la pensión y qué soporte sigue pendiente.",
    apertura:"Usted tramita una solicitud de pensión de un operario reubicado. Tiene un dictamen de PCL. Identifique qué falta para resolver, dónde está y cómo se verifica.",
    cronologia:[
      ["18/05/2023", "Consulta por dolor cervical, torpeza al agarrar herramientas y parestesias. Se solicita estudio."],
      ["30/08/2023", "Informe de vibración en Girardota con equipo, turno y recorrido identificados."],
      ["01/02/2024", "Reubicación por restricciones funcionales. Continúa el mismo contrato."],
      ["14/03/2024", "Resonancia registra compromiso cervical C5–C6. Cirugía el 22/05/2024, seguida de rehabilitación."],
      ["01/10/2024", "EPS SURA califica origen laboral en primera oportunidad. La ARL manifiesta inconformidad el 04/10/2024."],
      ["12/02/2025", "Junta Regional determina origen laboral. Tras apelación, la Junta Nacional confirma el origen el 31/03/2025."],
      ["10/12/2025", "Fecha de estructuración consignada en la calificación posterior de PCL."],
      ["18/03/2026", "ARL SURA emite dictamen de PCL de 56,80 %, estructuración 10/12/2025. Notificación el 19/03."],
      ["31/03/2026", "Mateo manifiesta inconformidad con la fecha de estructuración: pide que sea la de la cirugía. ARL SURA remite el expediente a la Junta Regional de Antioquia el 07/04/2026."],
      ["21/04/2026", "Mateo solicita pensión a ARL SURA. El paquete de revisión llega sin constancia sobre el estado del dictamen."]
    ],
    puntos:[
      { id:"P1", n:"Verificar dictamen y cobertura", decide:"arl", decideN:"ARL SURA", requiere:["ORI", "DIC", "FIR", "AFI"], inicio:"3/4" },
      { id:"P2", n:"Resolver solicitud pensional", decide:"arl", decideN:"ARL SURA", requiere:["SOL", "ORI", "DIC", "FIR", "AFI"], inicio:"4/5", resuelve:true },
      { id:"P3", n:"Preparar liquidación ilustrativa", decide:"arl", decideN:"ARL SURA", requiere:["DIC", "FIR", "IBC"], inicio:"1/3" }
    ],
    flujoActual:"Mateo adjunta lo que tiene. Prestaciones encuentra el DIC en su bandeja documental, pide a medicina laboral la constancia de firmeza —y así confirma, con soporte, que el dictamen está en la Junta Regional, como dice Mateo en su carta— y solicita por correo a nómina el mes de IBC faltante. Devuelve el certificado v1 si llega incompleto.",
    flujoPropuesto:"Prestaciones consulta el índice con finalidad pensional y ve que DIC-L01 está en recurso ante la Junta Regional, con la fecha de remisión. Solicita a nómina la versión certificada del IBC. Las vistas muestran únicamente los campos autorizados para la decisión.",
    criterio:"Con el expediente completo, DIC-L01 (56,80 % laboral) no está en firme: la inconformidad sobre la fecha de estructuración está en la Junta Regional. La pauta prevé dejar pendiente el reconocimiento hasta el dictamen de la Junta y comunicárselo a Mateo. Reconocer con un dictamen sin firmeza sería un error, y negar también, porque la PCL supera el umbral. Si falta la constancia del estado del dictamen, se requiere. Si falta IBC, la liquidación ilustrativa de P3 queda pendiente.",
    notas:["El análisis de puesto y el resumen clínico explican la calificación previa y pueden revisarse en el ejercicio. El punto P2 evalúa el expediente de reconocimiento de la prestación."],
    soportes:[
      { k:"SOL", n:"Solicitud e identidad", cust:"tra", custN:"Solicitante", estado:"conforme", ver:"v1", notaEstado:"Radicado e identificación del caso visibles.", verRef:"v1", contenido:"RAD-L01, 21/04/2026. Solicitud de pensión e identificación sintética verificadas.", criterio:"Mismo titular, tipo de prestación y radicado." },
      { k:"ORI", n:"Confirmación del origen", cust:"jn", custN:"Junta Nacional", estado:"conforme", ver:"v1", notaEstado:"Providencia de calificación de origen identificable.", verRef:"v1", contenido:"ORI-L01, 31/03/2025. La Junta Nacional confirma origen laboral de M50.0.", criterio:"Emisor, caso, diagnóstico, sentido y fecha verificables." },
      { k:"DIC", n:"Dictamen de PCL", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v1", notaEstado:"Constan PCL, fecha de estructuración y emisor.", verRef:"v1", contenido:"DIC-L01, 18/03/2026. PCL 56,80 %, origen laboral, estructuración 10/12/2025.", criterio:"Documento firmado, trazado al ORI y con origen, PCL y estructuración." },
      { k:"FIR", n:"Constancia del estado de firmeza", cust:"arl", custN:"ARL SURA", estado:"ausente", ver:"", notaEstado:"En el paquete solo está el dictamen.", verRef:"v1", contenido:"FIR-L01, 08/04/2026. DIC-L01 no está en firme: inconformidad del 31/03/2026 sobre la fecha de estructuración, remitida a la Junta Regional de Antioquia el 07/04/2026.", criterio:"Estado de firmeza de DIC-L01 verificable: en firme, o recurso con instancia y fecha." },
      { k:"AFI", n:"Afiliación y cobertura", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v2", notaEstado:"Certificado que identifica la ARL a la fecha de exigibilidad del caso.", verRef:"v2", contenido:"Cobertura ARL SURA desde 01/02/2013. Vigente a la fecha de estructuración y al radicar.", criterio:"Identifica titular, ARL y vigencia en fecha relevante." },
      { k:"IBC", n:"Certificado de IBC", cust:"emp", custN:"Empleador", estado:"no_conforme", ver:"v1", notaEstado:"Falta septiembre de 2024.", verRef:"v2", contenido:"Período 01/10/2023–30/09/2024. Oct.–dic. de 2023: $3.280.000 mensuales. Ene.–sep. de 2024: $3.460.000 mensuales.", criterio:"Doce meses del escenario, legibles y certificados para verificar la base de liquidación." },
      { k:"APT", n:"Análisis de puesto y vibración", cust:"emp", custN:"Empleador", estado:"conforme", ver:"v2", notaEstado:"Informe técnico disponible en SG-SST.", verRef:"v2", contenido:"Medición 30/08/2023. Montacargas retráctil. A(8) 0,58 m/s². Factor de cresta 10,2.", criterio:"Identifica tarea, equipo, período observado y origen del dato." },
      { k:"HC", n:"Resumen clínico de columna", cust:"ips", custN:"IPS", estado:"conforme", ver:"v2", notaEstado:"Resumen clínico firmado en la IPS.", verRef:"v2", contenido:"M50.0. Resonancia 14/03/2024, cirugía 22/05/2024 y seguimiento funcional.", criterio:"Evolución y pruebas pertinentes con fecha y firma." }
    ],
    subsanacion:"Solicitar a medicina laboral la constancia del estado de DIC-L01, que está en recurso ante la Junta Regional, y dejar pendiente el reconocimiento. Para la liquidación ilustrativa, devolver el IBC incompleto a nómina indicando el mes faltante.",
    requerimiento:"Verificar con los actores cómo se traspasa a prestaciones una calificación generada en medicina laboral, cómo conoce prestaciones que el dictamen está en recurso y quién corrige los períodos de IBC.",
    h2:[
      { id:"R01", tarea:"Aportar la solicitud e identificar el radicado", funcion:"Aporta", ref:"tra", refN:"Solicitante" },
      { id:"R02", tarea:"Suministrar y certificar los 12 meses de IBC", funcion:"Aporta", ref:"emp", refN:"Empleador · Nómina" },
      { id:"R03", tarea:"Emitir el dictamen que resuelve la apelación de origen", funcion:"Decide calificación", ref:"jn", refN:"Junta Nacional" },
      { id:"R04", tarea:"Certificar el estado de firmeza del dictamen de PCL", funcion:"Aporta", ref:"arl", refN:"ARL SURA · Medicina laboral" },
      { id:"R05", tarea:"Verificar la cobertura y suficiencia del expediente", funcion:"Revisa", ref:"arl", refN:"ARL SURA · Prestaciones" },
      { id:"R06", tarea:"Resolver el reconocimiento pensional laboral", funcion:"Decide prestación", ref:"arl", refN:"ARL SURA · Prestaciones" }
    ],
    h3:[
      { momento:"+2 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"ORI", accion:"Consultar", finalidad:"Verificar origen definitivo", resultado:"Entrega de origen y fecha", denegado:false },
      { momento:"+8 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"FIR", accion:"Consultar", finalidad:"Confirmar firmeza del dictamen", resultado:"Constancia: dictamen en recurso ante la Junta Regional", denegado:false },
      { momento:"+28 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"IBC", accion:"Consultar", finalidad:"Verificar la base de liquidación prevista en P3", resultado:"Vista de doce meses", denegado:false },
      { momento:"+30 h", actor:"emp", actorN:"Empleador · Administración", pieza:"HC", accion:"Consultar", finalidad:"Control administrativo de asistencia", resultado:"Denegado. Se pueden comunicar restricciones funcionales por una finalidad pertinente.", denegado:true }
    ],
    procedencia:"Se tomó el patrón de exposición a vibración y la secuencia de calificación de una enfermedad cervical laboral. Las empresas, las fechas, los valores medidos, los hallazgos específicos y la PCL del expediente fueron creados para la simulación.",
    fuentes:["Tribunal Superior de Medellín, Sala Quinta Laboral, 11 de febrero de 2025. Rad. 05001-31-05-022-2019-00619-01"]
  },

  /* ======================= PI-L02 ======================= */
  {
    id:"PI-L02", origen:"laboral", titulo:"Perforista con reducción de PCL en apelación",
    resumenTabla:"La Junta Regional supera el umbral y la Nacional lo reduce. La pensión depende del dictamen que efectivamente quedó en firme.",
    persona:{
      nombre:"Javier Pardo Navas", edad:56, edadNota:"56 años al radicar", sexo:"masculino",
      ciudad:"Cúcuta, Norte de Santander", nacimiento:"23/01/1970",
      formacion:"Secundaria. Formación interna como perforista", dominancia:"derecha",
      situacion:"Solicitante y operario reubicado",
      vinculo:"Contrato vigente. Cumple funciones de portería fuera del proceso de trituración",
      convivencia:"Acude a las valoraciones con apoyo de su esposa",
      pide:"Solicita conocer el dictamen que rige."
    },
    trayectoria:[
      { periodo:"01/01/1997 a 31/12/2000", dur:"4 a", empresa:"Minería Socavón de Bruma", centro:"Sardinata, frente subterráneo", ciiu:"0510", cargo:"Ayudante de frente", trabajo:"Retira y acopia carbón durante 3 h por turno de 8 h. La ventilación es localizada y hay registro parcial de uso de respirador.", vinculo:"Indefinido", arl:"ARL histórica A" },
      { periodo:"01/01/2001 a 31/12/2007", dur:"7 a", empresa:"Minería Socavón de Bruma", centro:"Sardinata, frente subterráneo", ciiu:"0510", cargo:"Perforista de frente", trabajo:"Perfora roca y despeja el frente, unas 4 h acumuladas por turno de 8 h. El archivo conserva descripción de tareas y carece de mediciones personales comparables.", vinculo:"Indefinido", arl:"ARL histórica A" },
      { periodo:"01/01/2008 a 31/12/2017", dur:"10 a", empresa:"Cantera Delta de Arcilla", centro:"El Zulia, banco de extracción", ciiu:"0811", cargo:"Operador de perforación", trabajo:"Realiza perforación y apoyo a trituración, 3,5 a 4 h acumuladas. La humectación que figura en las órdenes se aplica de modo intermitente.", vinculo:"Indefinido", arl:"ARL histórica B" },
      { periodo:"01/03/2018 a 30/06/2025", dur:"7 a 4 m", empresa:"Agregados Ladera Bruma", centro:"El Zulia, planta de trituración", ciiu:"0811", cargo:"Operador de trituración y cribado", trabajo:"Supervisa tolva, retiro de atascos y correas en turno de 8 h, con 4 h cerca del proceso. Se instaló supresión húmeda en 2024.", vinculo:"Indefinido", arl:"ARL SURA" },
      { periodo:"01/07/2025 a vigente al corte", dur:"9 m 24 d", empresa:"Agregados Ladera Bruma", centro:"El Zulia, portería del predio", ciiu:"0811", cargo:"Auxiliar de control de accesos", trabajo:"Controla ingresos en portería separada de trituración. Tiene restricciones para ingresar a frentes y zonas con polvo respirable.", vinculo:"Indefinido · reubicación", arl:"ARL SURA" }
    ],
    tiempos:"Minería Socavón de Bruma, 11 a · Cantera Delta de Arcilla, 10 a · Agregados Ladera Bruma, 8 a 1 m 24 d. Vínculo acumulado al radicar 10.647 días.",
    actividad:"0510 extracción de hulla · 0811 extracción de piedra y arena.",
    vacios:"Sin vínculo registrado en enero y febrero de 2018.",
    exposicion:"Entorno de polvo de carbón y, más tarde, perforación y trituración de piedra. En 2023, una muestra personal de 8 h en trituración reportó 0,07 mg/m³ de sílice cristalina respirable, con método y turno consignados. Los primeros empleadores solo aportan constancias de oficio. La medición de 2023 corresponde al turno y puesto muestreados.",
    clinica:{
      diagnostico:"Neumoconiosis debida a otros polvos con sílice (J62.8)",
      detalle:"De origen laboral en todos los dictámenes del caso. Disnea de esfuerzo y menor tolerancia a escaleras. El informe funcional completo describe CVF del 72 % del predicho y DLCO del 65 % del predicho. Hipertensión arterial controlada de origen común.",
      funcion:"Neumología y rehabilitación documentan disnea al caminar en pendiente y necesidad de pausas. Portería reduce su proximidad al polvo y evita desplazamientos por zonas de producción.",
      rehabilitacion:"La IPS registra una incapacidad de 15 días desde el 17/07/2024 para estudio y ajuste de tareas. En julio de 2025 inicia 12 sesiones de rehabilitación respiratoria. Portería queda como puesto de reubicación desde el 01/07/2025.",
      pcl:44.30, pclOrigen:"laboral", estructuracion:"30/05/2025"
    },
    referenciasTemporales:[
      ["Primer síntoma registrado", "54 años", "05/02/2024"],
      ["Diagnóstico inicial", "54 años", "19/07/2024"],
      ["Estructuración en el dictamen final", "55 años", "30/05/2025"]
    ],
    actores:[
      { a:"arl", n:"ARL SURA", rol:"ARL SURA, medicina laboral y prestaciones", custodia:["AFI"] },
      { a:"ips", n:"IPS", rol:"IPS de neumología y laboratorio pulmonar", custodia:["FUN"] },
      { a:"emp", n:"Empleador", rol:"SG-SST de Agregados Ladera Bruma", custodia:["EXP"] },
      { a:"jr", n:"Junta Regional", rol:"Junta Regional de Norte de Santander", custodia:["REG"] },
      { a:"jn", n:"Junta Nacional", rol:"Junta Nacional", custodia:["DIC", "FIR"] },
      { a:"tra", n:"Solicitante", rol:"Javier Pardo, solicitante", custodia:["SOL"] }
    ],
    perspectiva:"Javier recibió documentos de distintas instancias y quiere saber cuál rige su solicitud.",
    apertura:"Usted recibe una solicitud con copia de un dictamen regional. Verifique si hubo recurso y qué documentos se necesitan para emitir una decisión motivada.",
    cronologia:[
      ["17/05/2023", "Muestreo personal de sílice en trituración. El informe se archiva en SG-SST."],
      ["05/02/2024", "Consulta por disnea al subir pendientes. Se abre estudio en neumología."],
      ["19/07/2024", "Tomografía y neumología documentan J62.8. Se indica seguimiento y retiro de exposición."],
      ["30/05/2025", "Fecha de estructuración empleada en las tres calificaciones del guion."],
      ["09/07/2025", "Laboratorio genera informe pulmonar firmado. En julio inicia rehabilitación respiratoria y reubicación."],
      ["02/09/2025", "ARL SURA emite calificación en primera oportunidad. Origen laboral, PCL 40,80 %. Javier presenta inconformidad el 05/09."],
      ["19/11/2025", "Junta Regional fija PCL de 51,40 % laboral. La ARL apela el 24/11."],
      ["24/03/2026", "Junta Nacional fija PCL de 44,30 % laboral. Mantiene estructuración. Consta notificación el 25/03 y firmeza el 09/04."],
      ["24/04/2026", "Javier radica solicitud de pensión. La copia regional y una exportación pulmonar incompleta circulan en el expediente."]
    ],
    puntos:[
      { id:"P1", n:"Reconstruir versiones y antecedentes", decide:"arl", decideN:"ARL SURA", requiere:["REG", "DIC", "FIR", "FUN"], inicio:"1/4" },
      { id:"P2", n:"Resolver solicitud pensional", decide:"arl", decideN:"ARL SURA", requiere:["SOL", "DIC", "FIR", "AFI"], inicio:"2/4", resuelve:true }
    ],
    flujoActual:"Prestaciones recibe el dictamen regional. Pide a la Junta Nacional copia oficial y firmeza. Medicina laboral solicita a la IPS completar la exportación pulmonar para documentar el antecedente.",
    flujoPropuesto:"El índice permite enlazar el recurso, el dictamen nacional y su firmeza. Medicina laboral consulta el extracto funcional. Prestaciones ve el dictamen operativo y el estado de los soportes.",
    criterio:"Con DIC-L02 firme de 44,30 %, la pauta prevé negar el reconocimiento de pensión en este expediente e informar la ruta separada de incapacidad permanente parcial (IPP). Si falta el dictamen vigente o su firmeza, la solicitud queda pendiente de verificación.",
    notas:[
      "La reconstrucción P1 puede quedar incompleta por falta de FUN. La revisión P2 usa el dictamen en firme y sus soportes propios. La IPS aporta evidencia y la Junta Nacional resuelve la apelación.",
      "La copia regional puede ser auténtica y útil para reconstruir el trámite. Su vigencia como fundamento de la decisión se determina con el recurso, la instancia que lo resolvió y la prueba de firmeza."
    ],
    soportes:[
      { k:"SOL", n:"Solicitud e identidad", cust:"tra", custN:"Solicitante", estado:"conforme", ver:"v1", notaEstado:"Radicación visible.", verRef:"v1", contenido:"RAD-L02, 24/04/2026. Solicitud de pensión e identificación sintética.", criterio:"Mismo titular, tipo de prestación y radicado." },
      { k:"REG", n:"Dictamen de Junta Regional", cust:"jr", custN:"Junta Regional", estado:"conforme", ver:"v1", notaEstado:"Documento auténtico de instancia anterior.", verRef:"v1", contenido:"REG-L02, 19/11/2025. PCL 51,40 %, laboral, estructuración 30/05/2025. Apelado el 24/11.", criterio:"Copia autenticada, identificador y estado de instancia." },
      { k:"DIC", n:"Dictamen de Junta Nacional", cust:"jn", custN:"Junta Nacional", estado:"ausente", ver:"", notaEstado:"La carpeta de prestaciones solo muestra la copia REG-L02.", verRef:"v1", contenido:"DIC-L02, 24/03/2026. PCL 44,30 %, laboral, estructuración 30/05/2025. Decide la apelación de REG-L02.", criterio:"Dictamen firmado de la instancia vigente con referencia al recurso resuelto." },
      { k:"FIR", n:"Constancia de firmeza", cust:"jn", custN:"Junta Nacional", estado:"ausente", ver:"", notaEstado:"La constancia nacional no está en el radicado local.", verRef:"v1", contenido:"FIR-L02, 09/04/2026, asociada a DIC-L02, notificado el 25/03.", criterio:"Corresponde al dictamen nacional y tiene fecha verificable." },
      { k:"AFI", n:"Afiliación y cobertura", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v1", notaEstado:"Vigencia al momento de la solicitud.", verRef:"v1", contenido:"ARL SURA desde 01/03/2018. Activa a la fecha relevante del ejercicio.", criterio:"Entidad, titular y cobertura del periodo verificables." },
      { k:"FUN", n:"Informe de función pulmonar", cust:"ips", custN:"IPS", estado:"no_conforme", ver:"v1", notaEstado:"Exportación con CVF. Falta anexo firmado de DLCO.", verRef:"v2", contenido:"Informe funcional 09/07/2025. CVF 72 % y DLCO 65 % del predicho. Incluye firma y calidad de la prueba.", criterio:"Contiene ambos parámetros, referencia, fecha y firma. Se usa para reconstruir el antecedente." },
      { k:"EXP", n:"Informe de higiene", cust:"emp", custN:"Empleador", estado:"conforme", ver:"v2", notaEstado:"Medición con tarea, jornada y fecha identificadas.", verRef:"v2", contenido:"Muestra personal 17/05/2023. Sílice cristalina respirable 0,07 mg/m³, 8 h en trituración.", criterio:"Identifica tipo de muestra, periodo, sitio, tarea y método." }
    ],
    subsanacion:"Pedir DIC y FIR a la Junta Nacional. Para reconstruir la calificación, pedir a la IPS el informe FUN con su anexo.",
    requerimiento:"Precisar cómo se sincronizan las versiones regional y nacional, qué actor remite la firmeza y cómo la IPS completa un anexo sin ampliar innecesariamente el acceso clínico.",
    h2:[
      { id:"R01", tarea:"Aportar el informe funcional con el anexo faltante", funcion:"Aporta", ref:"ips", refN:"IPS · Lab. pulmonar" },
      { id:"R02", tarea:"Aportar la medición de sílice de la planta actual", funcion:"Aporta", ref:"emp", refN:"Empleador · SG-SST" },
      { id:"R03", tarea:"Emitir el dictamen que decide la apelación", funcion:"Decide calificación", ref:"jn", refN:"Junta Nacional" },
      { id:"R04", tarea:"Vincular firmeza al dictamen nacional", funcion:"Aporta", ref:"jn", refN:"Junta Nacional" },
      { id:"R05", tarea:"Verificar qué dictamen corresponde a la decisión pensional", funcion:"Revisa", ref:"arl", refN:"ARL SURA · Prestaciones" },
      { id:"R06", tarea:"Resolver la solicitud pensional laboral", funcion:"Decide prestación", ref:"arl", refN:"ARL SURA · Prestaciones" }
    ],
    h3:[
      { momento:"+3 h", actor:"arl", actorN:"ARL SURA · Medicina laboral", pieza:"FUN", accion:"Consultar", finalidad:"Reconstruir antecedentes de calificación", resultado:"Informe funcional firmado", denegado:false },
      { momento:"+9 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"DIC", accion:"Consultar", finalidad:"Verificar el dictamen aplicable", resultado:"Dictamen nacional", denegado:false },
      { momento:"+26 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"FIR", accion:"Consultar", finalidad:"Confirmar firmeza", resultado:"Constancia vinculada", denegado:false },
      { momento:"+31 h", actor:"emp", actorN:"Empleador · Administración", pieza:"FUN", accion:"Consultar", finalidad:"Control de ingreso en portería", resultado:"Denegado. El informe funcional clínico permanece en la IPS.", denegado:true }
    ],
    procedencia:"El fallo de Cundinamarca aporta el patrón de prueba de exposición. El informe de Perplexity sugirió el cambio de PCL en apelación en el caso de Cúcuta. Se corroboró el proceso y el requerimiento de prueba mediante un auto. Los porcentajes y fechas del caso sintético se fijaron para el ejercicio.",
    fuentes:[
      "Tribunal Superior de Cundinamarca, Sala Laboral, 21 de marzo de 2024. Rad. 25843-31-03-001-2020-00115-01",
      "Juzgado Tercero Laboral del Circuito de Cúcuta. Auto de 12 de septiembre de 2022, publicado por estado del 13. Rad. 54-001-31-05-003-2019-00216-00"
    ]
  },

  /* ======================= PI-L03 ======================= */
  {
    id:"PI-L03", origen:"laboral", titulo:"Operadora minera con calificación integral apelada",
    resumenTabla:"Un dictamen parcial previo y una calificación integral regional de 52,40 % apelada por la ARL conviven en el expediente, junto a una constancia de firmeza del dictamen de 2022. Ninguno permite reconocer todavía.",
    persona:{
      nombre:"Mónica Beltrán Rivas", edad:53, edadNota:"53 años al radicar", sexo:"femenino",
      ciudad:"Sogamoso, Boyacá", nacimiento:"10/11/1972",
      formacion:"Bachiller con formación técnica en operación de maquinaria amarilla", dominancia:"derecha",
      situacion:"Solicitante y operadora reubicada",
      vinculo:"Vínculo vigente. Desde febrero de 2024 realiza control de pesaje",
      convivencia:"",
      pide:"Solicita que prestaciones confirme cuál de los documentos de calificación corresponde a su caso y si la apelación de la ARL detiene su pensión."
    },
    trayectoria:[
      { periodo:"01/01/1993 a 31/12/2002", dur:"10 a", empresa:"Carbones Cuesta de Niebla", centro:"Sogamoso, patio de acopio", ciiu:"0510", cargo:"Auxiliar de patio", trabajo:"Ordena material, usa herramientas manuales y mueve sacos de 10 a 18 kg. La manipulación ocupa 2 h acumuladas de un turno de 8 h.", vinculo:"Indefinido", arl:"ISS y luego ARL histórica A" },
      { periodo:"01/03/2003 a 31/12/2012", dur:"9 a 10 m", empresa:"Carbones Ventana Alta", centro:"Nobsa, frente y patio de carbón", ciiu:"0510", cargo:"Operadora de cargador frontal", trabajo:"Opera palancas 4,5 h efectivas por turno de 8 h. Recorre piso granular irregular y realiza cargas repetidas de material.", vinculo:"Indefinido", arl:"ARL histórica B" },
      { periodo:"01/01/2013 a 31/01/2024", dur:"11 a 1 m", empresa:"Carbones Mesa Umbral", centro:"Tópaga, patio de despacho", ciiu:"0510", cargo:"Operadora de cargador frontal y retroexcavadora", trabajo:"Conduce y opera mandos 5 h por turno de 8 h. Alterna llenado de tolva, reversa y posicionamiento de la máquina en rampas.", vinculo:"Indefinido", arl:"ARL SURA" },
      { periodo:"01/02/2024 a vigente al corte", dur:"2 a 2 m 29 d", empresa:"Carbones Mesa Umbral", centro:"Tópaga, báscula exterior", ciiu:"0510", cargo:"Auxiliar de control de pesaje", trabajo:"Registra guías y lecturas, alterna posiciones y usa escáner de mano con apoyo. Tiene restricciones para conducir maquinaria y levantar peso.", vinculo:"Indefinido · reubicación", arl:"ARL SURA" }
    ],
    tiempos:"Carbones Cuesta de Niebla, 10 a · Carbones Ventana Alta, 9 a 10 m · Carbones Mesa Umbral, 13 a 3 m 29 d. Vínculo acumulado al radicar 12.113 días.",
    actividad:"0510 extracción de hulla.",
    vacios:"Sin vínculo registrado en enero y febrero de 2003.",
    exposicion:"En 2023, el informe de puesto de Tópaga consignó A(8) de 0,61 m/s² de vibración de cuerpo entero, con equipo, piso y turno identificados. El análisis del puesto describe agarre repetido de palancas y flexión sostenida de muñeca. Las fichas de los dos primeros empleadores permiten reconstruir las tareas. Las mediciones históricas solo cubren el puesto de 2023.",
    clinica:{
      diagnostico:"Síndrome del túnel carpiano bilateral (G56.0) y discopatía lumbar degenerativa (M51.3)",
      detalle:"Túnel carpiano bilateral laboral, con cirugía en mano derecha, residual sensitivo y PCL de 16,20 % en dictamen previo. Discopatía lumbar degenerativa con dolor persistente y limitación para sedestación y desplazamiento. La calificación integral regional de origen laboral consigna una PCL del 52,40 %, apelada por ARL SURA. Gonartrosis leve en seguimiento, documentada como antecedente común. La calificación regional deja identificados el alcance y los antecedentes considerados; la Junta Nacional no ha decidido el recurso.",
      funcion:"La cirugía de mano derecha y la rehabilitación de columna dejan limitaciones residuales para prensión, sedestación prolongada y marcha. El control de pesaje reduce las tareas de conducción y levantamiento.",
      rehabilitacion:"Después de la intervención de mano derecha en 2021 el expediente registra 30 días de incapacidad y 12 sesiones de terapia de mano. En 2024 realiza 16 sesiones de rehabilitación lumbar. La reubicación a báscula se mantiene al radicar.",
      pcl:52.40, pclOrigen:"laboral", estructuracion:"18/06/2025"
    },
    referenciasTemporales:[
      ["Primer síntoma registrado", "48 años", "12/11/2020"],
      ["Diagnóstico inicial", "48 años", "09/02/2021"],
      ["Estructuración en la calificación integral regional", "52 años", "18/06/2025"]
    ],
    actores:[
      { a:"arl", n:"ARL SURA", rol:"ARL SURA, medicina laboral y prestaciones", custodia:["CAR", "AFI"] },
      { a:"eps", n:"EPS SURA", rol:"EPS SURA, medicina laboral", custodia:[] },
      { a:"ips", n:"IPS", rol:"IPS de neurología, ortopedia y rehabilitación", custodia:["FUN"] },
      { a:"emp", n:"Empleador", rol:"SG-SST y nómina de Carbones Mesa Umbral", custodia:["IBC", "APT"] },
      { a:"jr", n:"Junta Regional", rol:"Junta Regional de Boyacá", custodia:["REG", "FIR"] },
      { a:"jn", n:"Junta Nacional", rol:"Junta Nacional", custodia:["DIC"] },
      { a:"tra", n:"Solicitante", rol:"Mónica Beltrán, solicitante", custodia:["SOL"] }
    ],
    perspectiva:"Mónica pide que le indiquen qué calificación decide su pensión, si la apelación de la ARL la detiene y qué pasa con la calificación anterior de la mano.",
    apertura:"Usted recibe una solicitud con dictámenes de distinto alcance. Identifique el antecedente, la versión pertinente al trámite de pensión y la constancia que le corresponde.",
    cronologia:[
      ["12/11/2020", "Consulta por parestesias en ambas manos. Electromiografía confirma G56.0 el 09/02/2021."],
      ["19/04/2022", "Tras cirugía de mano derecha y rehabilitación, ARL SURA emite dictamen laboral de G56.0, PCL 16,20 %, estructuración 19/01/2022. Queda firme el 06/05/2022. El expediente registra una IPP previa."],
      ["21/06/2023", "Consulta por dolor lumbar con síntomas persistentes. Medición de vibración del puesto el 23/08/2023."],
      ["01/02/2024", "Se formaliza la reubicación a la báscula. La IPS documenta evolución y rehabilitación de la columna."],
      ["01/08/2024", "EPS SURA califica origen laboral de M51.3 en primera oportunidad. ARL SURA manifiesta inconformidad el 05/08."],
      ["16/09/2025", "La Junta Regional ratifica origen laboral lumbar y establece PCL integral de 52,40 %, estructuración 18/06/2025."],
      ["22/09/2025", "ARL SURA apela. La Junta Regional concede el recurso el 03/10/2025 y remite el expediente a la Junta Nacional el 07/10/2025; el expediente de segunda instancia incorpora el informe funcional del 30/10/2025."],
      ["29/04/2026", "Mónica radica pensión. La Junta Nacional no ha decidido. El índice local conserva el dictamen de 16,20 %, la calificación regional apelada y una constancia de firmeza de 2022."]
    ],
    puntos:[
      { id:"P1", n:"Distinguir alcances y versiones de dictamen", decide:"arl", decideN:"ARL SURA", requiere:["CAR", "REG", "DIC", "FIR"], inicio:"2/4" },
      { id:"P2", n:"Resolver solicitud pensional", decide:"arl", decideN:"ARL SURA", requiere:["SOL", "DIC", "FIR", "AFI"], inicio:"2/4", resuelve:true },
      { id:"P3", n:"Preparar liquidación ilustrativa", decide:"arl", decideN:"ARL SURA", requiere:["DIC", "FIR", "IBC"], inicio:"0/3" }
    ],
    flujoActual:"Prestaciones encuentra CAR y REG en distintas carpetas y recibe una constancia asociada al dictamen de 2022. Pide a la Junta Regional la constancia del estado de REG-L03 y a la Junta Nacional el estado del recurso, que sigue sin decisión. Nómina verifica el período del IBC solicitado.",
    flujoPropuesto:"El índice enlaza cada calificación con su alcance, etapa, recurso y firmeza. Prestaciones ve que REG-L03 está en recurso ante la Junta Nacional, rechaza la firmeza mal asociada y solicita el certificado de IBC del período previsto.",
    criterio:"Con el expediente completo, la calificación integral vigente es REG-L03 (52,40 %), apelada por ARL SURA y sin decisión de la Junta Nacional: no está en firme. La pauta prevé dejar pendiente el reconocimiento hasta la segunda instancia e informar a Mónica. Reconocer con REG-L03 o con el dictamen de 2022 sería un error, y negar también. La serie IBC se verifica en P3. El dictamen de 2022 y la IPP previa se conservan como antecedentes para eventual revisión separada. Si llega la constancia de 2022, se devuelve por discordancia y se solicita la del estado de REG-L03.",
    notas:["El expediente trae una calificación integral regional apelada y aún sin decisión de segunda instancia. Los dictámenes previos se conservan como antecedentes. La pauta no reconoce con una calificación que no está en firme. Las reubicaciones se documentan en el expediente."],
    soportes:[
      { k:"SOL", n:"Solicitud e identidad", cust:"tra", custN:"Solicitante", estado:"conforme", ver:"v1", notaEstado:"Radicado registrado.", verRef:"v1", contenido:"RAD-L03, 29/04/2026. Solicitud de pensión e identificación sintética.", criterio:"Titular, prestación y radicado inequívocos." },
      { k:"CAR", n:"Dictamen previo de túnel carpiano", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v1", notaEstado:"Está disponible como antecedente.", verRef:"v1", contenido:"CAR-L03, 19/04/2022. G56.0 laboral, PCL 16,20 %, estructuración 19/01/2022. Firme el 06/05/2022.", criterio:"Identifica patología, alcance, decisión previa y su estado." },
      { k:"REG", n:"Dictamen integral regional", cust:"jr", custN:"Junta Regional", estado:"conforme", ver:"v1", notaEstado:"Copia auténtica de la calificación apelada.", verRef:"v1", contenido:"REG-L03, 16/09/2025. PCL integral laboral 52,40 %, estructuración 18/06/2025. Apelado por ARL SURA el 22/09/2025.", criterio:"Emisor, fecha, alcance integral, PCL, estructuración y recurso identificables." },
      { k:"DIC", n:"Estado del recurso ante la Junta Nacional", cust:"jn", custN:"Junta Nacional", estado:"ausente", ver:"", notaEstado:"En la bandeja de prestaciones no hay noticia de la segunda instancia.", verRef:"v1", contenido:"JN-L03, 30/04/2026. Recurso de ARL SURA contra REG-L03 recibido el 07/10/2025, en trámite y sin dictamen nacional a la fecha.", criterio:"Constancia de la Junta Nacional sobre el recurso: radicado, fecha y estado, decidido o en trámite." },
      { k:"FIR", n:"Constancia del estado de firmeza", cust:"jr", custN:"Junta Regional", estado:"no_conforme", ver:"v0", notaEstado:"Constancia que corresponde a CAR-L03 de 2022.", verRef:"v1", contenido:"FIR-L03, 30/04/2026. REG-L03 no está en firme: recurso de apelación de ARL SURA concedido el 03/10/2025 y remitido a la Junta Nacional el 07/10/2025, sin decisión a la fecha.", criterio:"Debe referirse a REG-L03, con su estado de firmeza, el recurso, la instancia y las fechas." },
      { k:"AFI", n:"Afiliación y cobertura", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v2", notaEstado:"Certificado vigente.", verRef:"v2", contenido:"ARL SURA desde 01/01/2013. Cubre la fecha de estructuración y la de radicación.", criterio:"Titular y vigencia trazados al último vínculo." },
      { k:"IBC", n:"Certificado histórico de IBC", cust:"emp", custN:"Empleador", estado:"no_conforme", ver:"v1", notaEstado:"Exportación reciente con corte de 2026.", verRef:"v2", contenido:"Período 01/08/2023–31/07/2024, corte previo a primera calificación de origen lumbar según el guion. Ago. 2023–ene. 2024: $3.040.000 mensuales. Feb.–jul. 2024: $3.200.000 mensuales.", criterio:"Serie del período fijado para la liquidación ilustrativa, con firma y desglose mensual." },
      { k:"APT", n:"Análisis del puesto y reubicación", cust:"emp", custN:"Empleador", estado:"conforme", ver:"v2", notaEstado:"Versión con cronología del cambio.", verRef:"v2", contenido:"Vibración A(8) 0,61 m/s² en 2023 y constancia de paso a báscula desde 01/02/2024.", criterio:"Documenta condiciones medidas y fecha de reubicación." },
      { k:"FUN", n:"Resumen funcional de mano y columna", cust:"ips", custN:"IPS", estado:"conforme", ver:"v2", notaEstado:"Extracto firmado en la IPS.", verRef:"v2", contenido:"Constan secuelas de mano, restricción de sedestación prolongada, marcha con pausas e informe funcional usado en el recurso.", criterio:"Indica procedencia, fecha y alcance de las evaluaciones." }
    ],
    subsanacion:"Marcar CAR como antecedente de distinto alcance y REG como calificación apelada. Devolver la constancia de 2022 y pedir a la Junta Regional la del estado de REG-L03 y a la Junta Nacional la del estado del recurso; para P3, solicitar la serie IBC del período correcto.",
    requerimiento:"Verificar cómo se identifican patologías, versiones y recursos, quién autoriza el extracto funcional y qué referencias preserva el motor para impedir el uso de una constancia del dictamen equivocado.",
    h2:[
      { id:"R01", tarea:"Aportar el análisis de puesto y la fecha de reubicación", funcion:"Aporta", ref:"emp", refN:"Empleador · SG-SST" },
      { id:"R02", tarea:"Aportar el extracto funcional de mano y columna", funcion:"Aporta", ref:"ips", refN:"IPS · Rehabilitación" },
      { id:"R03", tarea:"Emitir el dictamen integral de segunda instancia", funcion:"Decide calificación", ref:"jn", refN:"Junta Nacional" },
      { id:"R04", tarea:"Certificar el estado de firmeza de la calificación regional", funcion:"Aporta", ref:"jr", refN:"Junta Regional" },
      { id:"R05", tarea:"Verificar alcance, versión y vigencia de los dictámenes", funcion:"Revisa", ref:"arl", refN:"ARL SURA · Prestaciones" },
      { id:"R06", tarea:"Resolver el reconocimiento pensional laboral", funcion:"Decide prestación", ref:"arl", refN:"ARL SURA · Prestaciones" }
    ],
    h3:[
      { momento:"+2 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"CAR", accion:"Consultar", finalidad:"Identificar alcance de la calificación previa", resultado:"Antecedente G56.0, con su alcance", denegado:false },
      { momento:"+6 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"DIC", accion:"Consultar", finalidad:"Verificar si la Junta Nacional decidió el recurso", resultado:"Recurso en trámite, sin dictamen nacional", denegado:false },
      { momento:"+25 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"FIR", accion:"Consultar", finalidad:"Verificar firmeza de la versión vigente", resultado:"Constancia: REG-L03 apelada, sin firmeza", denegado:false },
      { momento:"+32 h", actor:"emp", actorN:"Empleador · Administración", pieza:"FUN", accion:"Consultar", finalidad:"Administrar turnos de báscula", resultado:"Denegado el extracto clínico. Solo vista de restricciones si se habilita para ese fin.", denegado:true }
    ],
    procedencia:"La T-364 aporta la sucesión de dictámenes sobre columna. La SU-111 aporta el antecedente separado de túnel carpiano bilateral. El fallo de Medellín aporta la prueba técnica de vibración. Se inventaron la biografía, los dictámenes, la PCL integral y el desenlace.",
    fuentes:[
      "Corte Constitucional, Sentencia T-364 de 2024, antecedentes 3 a 10",
      "Corte Constitucional, Sentencia SU-111 de 2025, párrs. 219 a 232",
      "Tribunal Superior de Medellín, Sala Quinta Laboral, 11 de febrero de 2025. Rad. 05001-31-05-022-2019-00619-01"
    ]
  },

  /* ======================= PI-L04 ======================= */
  {
    id:"PI-L04", origen:"laboral", titulo:"Operaria de prensas con dictamen sin firmeza y cobertura incompleta",
    resumenTabla:"Una exoperaria de prensas radica la pensión con un dictamen de 51 % que aún no está en firme: corre el término de inconformidad. Su solicitud exige además verificar la última ARL y vincular la exposición a un período cubierto.",
    persona:{
      nombre:"Elena Marín Cuéllar", edad:55, edadNota:"55 años al radicar", sexo:"femenino",
      ciudad:"Dosquebradas, Risaralda", nacimiento:"12/02/1971",
      formacion:"Bachiller y técnica laboral en procesos metalmecánicos", dominancia:"derecha",
      situacion:"Solicitante y exoperaria de prensas",
      vinculo:"Retirada desde el 01/10/2025",
      convivencia:"Vive con su hija adulta",
      ajustes:"Usa audífonos y pide recibir por escrito las solicitudes y decisiones",
      pide:"Solicita una respuesta escrita. Quiere saber si su fecha de retiro cambia quién debe resolver su pensión y desde cuándo se la pagarían."
    },
    trayectoria:[
      { periodo:"01/01/1996 a 31/12/2003", dur:"8 a", empresa:"Fundición Quebrada Larga", centro:"Pereira, área de acabado", ciiu:"2431", cargo:"Auxiliar de desmoldeo y acabado", trabajo:"Retira arena y rebabas con herramientas neumáticas. Pasa cerca de 4 h por turno de 8 h junto al desmoldeo y esmerilado.", vinculo:"Indefinido", arl:"ARL histórica A" },
      { periodo:"01/01/2004 a 31/07/2012", dur:"8 a 7 m", empresa:"Mecanizados Nudo Alto", centro:"Pereira, banco de mecanizado", ciiu:"2592", cargo:"Operaria de pulido de piezas", trabajo:"Esmerila y desbarba piezas en cerca de 5 h acumuladas por turno de 8 h. Recibe tapones. El archivo conserva registro parcial de recambios.", vinculo:"Indefinido", arl:"ARL histórica B" },
      { periodo:"01/09/2012 a 31/12/2024", dur:"12 a 4 m", empresa:"Prensas Umbral del Otún", centro:"Dosquebradas, nave de estampado", ciiu:"2591", cargo:"Operaria de prensa mecánica", trabajo:"Alimenta la prensa, activa el ciclo y verifica la pieza. Opera unas 5 h acumuladas por turno de 8 h. Hay ruido impulsivo en troquelado.", vinculo:"Indefinido", arl:"ARL SURA" },
      { periodo:"01/01/2025 a 30/09/2025", dur:"9 m", empresa:"Prensas Umbral del Otún", centro:"Dosquebradas, almacén segregado", ciiu:"2591", cargo:"Auxiliar de inventario de repuestos", trabajo:"Registra entradas con lector y usa avisos visuales. Realiza verificaciones de inventario. La orden de reubicación limita el trabajo en la nave.", vinculo:"Indefinido · reubicación", arl:"ARL SURA" }
    ],
    tiempos:"Fundición Quebrada Larga, 8 a · Mecanizados Nudo Alto, 8 a 7 m · Prensas Umbral del Otún, 13 a 1 m. Vínculo acumulado al radicar 10.835 días.",
    actividad:"2431 fundición de hierro y de acero · 2592 tratamiento y mecanizado de metales · 2591 forja, prensado y estampado.",
    vacios:"Sin vínculo en agosto de 2012. Finaliza su último contrato el 30/09/2025 por retiro voluntario registrado en el guion. Carece de una afiliación posterior a riesgos laborales.",
    exposicion:"La dosimetría personal del 22/08/2023 registró 92 dB(A) como nivel equivalente normalizado a 8 h en estampado. El informe identifica equipo, tarea y turno. En 2024 la empresa instaló una barrera parcial y registró el uso de orejeras. El expediente conserva la restricción y fecha de reubicación.",
    clinica:{
      diagnostico:"Pérdida auditiva neurosensorial bilateral inducida por ruido (H83.3)",
      detalle:"De origen laboral en el escenario, con tinnitus persistente. La audiometría y la valoración funcional documentan afectación en frecuencias conversacionales y agudas. Con ayudas auditivas persisten dificultades para seguir conversaciones, reconocer alarmas y orientarse por sonidos. El dictamen sintético fija una PCL de 51,00 % laboral y recoge el impacto en su rol laboral y en la comunicación cotidiana.",
      funcion:"La reubicación habilitó señales visuales para tareas de inventario. En el cierre de rehabilitación persisten dificultades para comunicarse en grupo y atender señales sonoras, aun con ayudas auditivas.",
      rehabilitacion:"La IPS ajusta los audífonos en 2024 y realiza ocho sesiones de entrenamiento auditivo entre enero y marzo de 2025. El 12/09/2025 documenta las limitaciones residuales. En el guion, el último vínculo finaliza por retiro voluntario después de la reubicación.",
      pcl:51.00, pclOrigen:"laboral", estructuracion:"12/09/2025"
    },
    referenciasTemporales:[
      ["Primer síntoma registrado", "50 años", "11/11/2021"],
      ["Diagnóstico inicial", "53 años", "05/03/2024"],
      ["Estructuración en el dictamen final", "54 años", "12/09/2025"]
    ],
    actores:[
      { a:"arl", n:"ARL SURA", rol:"ARL SURA, Afiliaciones, Medicina Laboral y Prestaciones", custodia:["DIC", "FIR", "AFI"] },
      { a:"eps", n:"EPS SURA", rol:"EPS SURA, Medicina Laboral. Calificó el origen en primera oportunidad", custodia:["ORI"] },
      { a:"ips", n:"IPS", rol:"IPS de otorrinolaringología y audiología ocupacional", custodia:["AUD"] },
      { a:"emp", n:"Empleador", rol:"SG-SST de Prensas Umbral del Otún", custodia:["NEX"] },
      { a:"tra", n:"Solicitante", rol:"Elena Marín, solicitante", custodia:["SOL"] }
    ],
    perspectiva:"Elena solicita una respuesta escrita. Quiere saber si su fecha de retiro cambia quién debe resolver su pensión y desde cuándo se la pagarían.",
    apertura:"Usted recibe un dictamen laboral de 51 % notificado hace una semana y una consulta de afiliación que muestra estado inactivo. Verifique en qué estado está el dictamen, qué administradora corresponde y qué soportes permiten decidir.",
    cronologia:[
      ["11/11/2021", "Reporta tinnitus y dificultad para seguir instrucciones en la nave durante el control periódico."],
      ["22/08/2023", "Dosimetría personal en la prensa. SG-SST archiva el informe con el período y la tarea."],
      ["05/03/2024", "Otorrinolaringología confirma hipoacusia neurosensorial bilateral. Comienza adaptación a ayudas auditivas."],
      ["01/01/2025", "Se formaliza la reubicación a inventario. La IPS registra terapia auditiva y seguimiento."],
      ["24/06/2025", "EPS SURA califica el origen laboral en primera oportunidad. Su firmeza consta el 14/07/2025."],
      ["12/09/2025", "Evaluación funcional de cierre. El dictamen posterior fija su estructuración en esta fecha."],
      ["30/09/2025", "Finaliza el vínculo. ARL SURA es la última administradora en el expediente."],
      ["28/04/2026", "ARL SURA fija PCL laboral de 51,00 %. Notifica a Elena el 29/04; el término para manifestar inconformidad corre hasta el 14/05."],
      ["06/05/2026", "Elena radica la pensión una semana después de la notificación, antes de que el dictamen quede en firme. El expediente digital muestra un estado inactivo y carece del anexo que liga la exposición al período de afiliación."]
    ],
    puntos:[
      { id:"P1", n:"Verificar última cobertura y nexo", decide:"arl", decideN:"ARL SURA", requiere:["ORI", "AFI", "NEX"], inicio:"1/3" },
      { id:"P2", n:"Resolver solicitud pensional", decide:"arl", decideN:"ARL SURA", requiere:["SOL", "ORI", "DIC", "FIR", "AFI", "NEX"], inicio:"3/6", resuelve:true }
    ],
    flujoActual:"Prestaciones ve el estado inactivo y pide a Afiliaciones la vigencia histórica. Pide a medicina laboral la constancia de firmeza y encuentra que el término sigue corriendo. Solicita a SG-SST el anexo citado y coteja la exposición con el origen calificado y la cobertura.",
    flujoPropuesto:"El índice permite consultar por separado el estado actual y el histórico de afiliación, y muestra que DIC-L04 está en término de inconformidad. Prestaciones vincula al dictamen la vista pertinente del anexo de puesto para verificar la cobertura.",
    criterio:"Con el expediente completo, DIC-L04 (51,00 % laboral) todavía no está en firme: el término de inconformidad corre hasta el 14/05/2026. La pauta prevé dejar pendiente la decisión, pedir la constancia de firmeza cuando venza el término e informar por escrito a Elena; con firmeza, última afiliación a ARL SURA y nexo con un período cubierto verificados, procedería el reconocimiento. Reconocer antes de la firmeza, o negar por el estado «inactivo», serían errores. Si falta AFI o NEX, se requiere el soporte.",
    notas:["La comprobación de cobertura se hace respecto de los períodos pertinentes del caso. El eventual recobro entre administradoras sigue su trámite propio."],
    soportes:[
      { k:"SOL", n:"Solicitud e identidad", cust:"tra", custN:"Solicitante", estado:"conforme", ver:"v1", notaEstado:"Identificación, radicado y canal escrito visibles.", verRef:"v1", contenido:"RAD-L04, 06/05/2026. Solicitud de pensión y canal de notificación escrito.", criterio:"Mismo titular, radicado, prestación y canal registrado." },
      { k:"ORI", n:"Calificación del origen", cust:"eps", custN:"EPS SURA", estado:"conforme", ver:"v1", notaEstado:"Copia firmada con constancia de origen laboral.", verRef:"v1", contenido:"ORI-L04, 24/06/2025. H83.3 laboral. Firmeza de origen 14/07/2025.", criterio:"Titular, diagnóstico, origen, emisor y firmeza identificados." },
      { k:"DIC", n:"Dictamen de PCL", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v1", notaEstado:"PCL, origen y estructuración verificables.", verRef:"v1", contenido:"DIC-L04, 28/04/2026. PCL 51,00 % laboral. Estructuración 12/09/2025.", criterio:"Firmado y vinculado a ORI-L04. Titular, PCL, origen y fecha verificables." },
      { k:"FIR", n:"Constancia del estado de firmeza de PCL", cust:"arl", custN:"ARL SURA", estado:"ausente", ver:"", notaEstado:"En el expediente no hay constancia sobre el estado del dictamen.", verRef:"v1", contenido:"FIR-L04, 08/05/2026. DIC-L04 notificado el 29/04/2026; el término de inconformidad corre hasta el 14/05/2026, sin inconformidades radicadas a la fecha. No está en firme.", criterio:"Identifica el dictamen, la fecha de notificación y su estado: en firme, o el término o recurso pendiente." },
      { k:"AFI", n:"Certificación histórica de cobertura", cust:"arl", custN:"ARL SURA", estado:"no_conforme", ver:"v1", notaEstado:"Consulta «inactiva» sin fechas ni identificación del último vínculo.", verRef:"v2", contenido:"Última afiliación a ARL SURA del 01/09/2012 al 30/09/2025. Historial cotejado sin afiliación posterior.", criterio:"Acredita empleador, última ARL, fechas de inicio y retiro, y titular." },
      { k:"NEX", n:"Anexo de exposición fechado", cust:"emp", custN:"Empleador", estado:"ausente", ver:"", notaEstado:"El resumen de origen cita el informe. Falta el anexo con puesto y fechas.", verRef:"v1", contenido:"SG-SST. Dosimetría 22/08/2023 en estampado. Vincula tarea y turno a la ficha de puesto de 2012 a 2024.", criterio:"Relaciona el riesgo con el puesto, el período cubierto y ORI-L04." },
      { k:"AUD", n:"Extracto audiológico", cust:"ips", custN:"IPS", estado:"conforme", ver:"v1", notaEstado:"Valoración clínica y funcional firmada.", verRef:"v1", contenido:"Audiometría seriada y cierre funcional del 12/09/2025. Ayudas auditivas y barreras de comunicación.", criterio:"Emisor, identificación, fechas y pruebas pertinentes autenticadas." }
    ],
    subsanacion:"Pedir a medicina laboral la constancia del estado de DIC-L04 y dejar pendiente la decisión hasta que venza el término. Solicitar AFI v2 a Afiliaciones y el anexo NEX v1 a SG-SST. Cotejar el puesto y la fecha del informe con el período cubierto y el origen calificado.",
    requerimiento:"Precisar quién verifica la afiliación después del retiro, cómo se vincula el informe de exposición al dictamen y qué datos puede consultar cada parte.",
    h2:[
      { id:"R01", tarea:"Aportar el anexo fechado de exposición a ruido", funcion:"Aporta", ref:"emp", refN:"Empleador · SG-SST" },
      { id:"R02", tarea:"Aportar la valoración audiológica de cierre", funcion:"Aporta", ref:"ips", refN:"IPS · Audiología" },
      { id:"R03", tarea:"Emitir la calificación de origen en primera oportunidad", funcion:"Decide calificación", ref:"eps", refN:"EPS SURA · Medicina laboral" },
      { id:"R04", tarea:"Certificar la última afiliación y el período de cobertura", funcion:"Aporta", ref:"arl", refN:"ARL SURA · Afiliaciones" },
      { id:"R05", tarea:"Verificar origen calificado, nexo y cobertura histórica", funcion:"Revisa", ref:"arl", refN:"ARL SURA · Prestaciones" },
      { id:"R06", tarea:"Resolver y comunicar la solicitud de pensión laboral", funcion:"Decide prestación", ref:"arl", refN:"ARL SURA · Prestaciones" }
    ],
    h3:[
      { momento:"+3 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"DIC", accion:"Consultar", finalidad:"Verificar PCL y estructuración", resultado:"Dictamen firmado; término de inconformidad en curso", denegado:false },
      { momento:"+16 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"AFI", accion:"Consultar", finalidad:"Verificar última ARL y fechas de cobertura", resultado:"Historial certificado con inicio y retiro", denegado:false },
      { momento:"+24 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"NEX", accion:"Consultar", finalidad:"Vincular la exposición al período cubierto", resultado:"Vista autorizada del anexo fechado", denegado:false },
      { momento:"+30 h", actor:"emp", actorN:"Empleador · Administración", pieza:"AUD", accion:"Consultar", finalidad:"Actualizar registro de retiro", resultado:"Denegado. El registro de retiro utiliza la constancia laboral.", denegado:true }
    ],
    procedencia:"T-524 de 2020 y STP1368-2023 aportaron el patrón de exposición a ruido, hipoacusia laboral y evidencia audiológica. La dosimetría, la PCL, los datos personales y la solicitud de pensión de este expediente son sintéticos. El caso aplica el criterio de cobertura del artículo 1 de la Ley 776 de 2002.",
    fuentes:[
      "Corte Constitucional, Sentencia T-524 de 2020, antecedentes 2.1.2 y 2.1.6 y análisis del caso",
      "Corte Suprema de Justicia, Sentencia STP1368-2023, 9 de febrero de 2023, apartados de hechos y trámite",
      "Ley 776 de 2002, arts. 1, 5, 7, 9 y 10",
      "Corte Suprema de Justicia, Sala de Casación Laboral, ficha oficial SL1469-2024"
    ]
  }
  ],

  /* ---------- Criterios jurídicos y fuentes del marco ---------- */
  referencias: {
    nota:"Los valores de PCL se leen de los dictámenes sintéticos. Los criterios de conformidad de las fichas son reglas operativas del ejercicio. La calificación médico-laboral, la decisión sobre la pensión y su liquidación son hitos diferenciados.",
    grupos:[
      { n:"Origen laboral",
        d:"El umbral de invalidez laboral es una PCL del 50 % o más. La IPP corresponde a una disminución definitiva desde el 5 % y por debajo del 50 %. El certificado de IBC se usa en los casos con liquidación ilustrativa. En PI-L04, con la solicitante desvinculada del sistema de riesgos, se verifica la última ARL y que el origen de la enfermedad sea atribuible a un período cubierto por el sistema.",
        fuentes:["Ley 776 de 2002, arts. 1, 5, 7, 9 y 10", "Ley 1562 de 2012, arts. 4 y 5", "Corte Suprema de Justicia, Sala de Casación Laboral, ficha oficial SL1469-2024", "Decreto 1477 de 2014, Anexo técnico, agentes físicos y enfermedades asociadas al ruido"] },
      { n:"Calificación y control de versiones",
        d:"La referencia de 540 días se ubica en el supuesto reglamentario de acceso directo a Junta Regional ante ausencia de calificación en primera oportunidad. Las decisiones de las Juntas, la firmeza y el reconocimiento quedan identificados en hitos propios. El ejercicio de patologías concurrentes toma el porcentaje del dictamen integral fijado en el guion.",
        fuentes:["Ley 100 de 1993, art. 41 y sus modificaciones", "Decreto 1072 de 2015, arts. 2.2.5.1.25 y 2.2.5.1.28", "Decreto 1507 de 2014, Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional", "Corte Constitucional, Sentencia C-425 de 2005"] },
      { n:"Fuentes de trabajo",
        d:"",
        fuentes:["Perplexity Computer, Enfermedad laboral y pensión de invalidez. Cinco trabajadores, cinco sentencias. 14 de noviembre de 2026", "DANE, Clasificación Industrial Internacional Uniforme, Rev. 4 A.C., actualización 2022", "Auto cotejado. Corrobora el proceso y la solicitud de prueba para un dictamen. El texto del fallo de consulta de 15 de noviembre de 2024 quedó sin cotejo. Sus porcentajes y su desenlace se excluyeron como datos verificados."] }
    ]
  },

  /* El documento es para quien facilita y evalúa la sesión. */
  uso:"La trayectoria, los datos clínicos, los porcentajes, las empresas y los desenlaces se crearon para la simulación. SURA cumple la función de organización ancla. Los procesos operativos del guion se contrastan con los actores del caso antes de emplearlos como línea base de la tesis. La persona solicitante es el actor focal. Para aplicar un caso, se presentan al participante la apertura, su rol y la evidencia disponible en el punto del recorrido."
};
