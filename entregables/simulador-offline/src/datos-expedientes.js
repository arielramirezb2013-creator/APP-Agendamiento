/* ============ Expedientes sintéticos de pensión de invalidez ============
   Transcripción del documento del proyecto «Expedientes sintéticos de pensión de invalidez ·
   Cuatro casos para el simulador doctoral en el caso SURA» (Ariel Ramírez, 14 de noviembre de
   2026), bajo el marco rector DGIT-PENSION-R1 (Proyecto 2, 5 de noviembre de 2026).

   Nada de este archivo se inventa: los textos, los porcentajes, las fechas, los estados de los
   soportes, las respuestas de referencia de H2 y los intentos de acceso de H3 vienen del
   documento. Lo único añadido son las claves con las que el motor los lee.

   La trayectoria, los datos clínicos, los porcentajes, las empresas y los desenlaces se crearon
   para la simulación. SURA cumple la función de organización ancla. */

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
        variable:"Completitud en P2", regla:"Elementos requeridos disponibles y conformes ÷ total de elementos requeridos. Reportar la diferencia en puntos porcentuales por origen." },
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
    nota:"Los cocientes iniciales de las fichas describen el estado del guion al radicar. La completitud observada se calcula sobre las ejecuciones. Un expediente completo puede sustentar tanto un reconocimiento como una negativa motivada."
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
    HL:  { n:"Historia laboral consolidada", sl:"HL" },
    PILA:{ n:"Comprobantes de períodos omitidos", sl:"PILA" },
    APT: { n:"Análisis de puesto", sl:"APT" },
    EXP: { n:"Informe de higiene", sl:"EXP" },
    FUN: { n:"Informe de función", sl:"FUN" },
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
    id:"PI-L01", origen:"laboral", titulo:"Montacarguista con firmeza sin verificar",
    resumenTabla:"La PCL supera el umbral. Falta la firmeza del dictamen y, para liquidar, debe recuperarse un período de IBC.",
    persona:{
      nombre:"Mateo Roldán Vega", edad:52, edadNota:"52 años al radicar", sexo:"masculino",
      ciudad:"Bello, Antioquia", nacimiento:"19/09/1973",
      formacion:"Bachiller con formación técnica en logística", dominancia:"derecha",
      situacion:"Solicitante y operador de montacargas reubicado a inventario",
      vinculo:"Contrato vigente con funciones de inventario adaptadas e incapacidades intermitentes",
      convivencia:"Vive con su pareja",
      pide:"Él radica la solicitud y pide saber a quién corresponde el siguiente paso."
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
    perspectiva:"Mateo quiere confirmar que la ARL recibió su dictamen y saber qué soporte sigue pendiente.",
    apertura:"Usted tramita una solicitud de pensión de un operario reubicado. Tiene un dictamen de PCL. Identifique qué falta para resolver, dónde está y cómo se verifica.",
    cronologia:[
      ["18/05/2023", "Consulta por dolor cervical, torpeza al agarrar herramientas y parestesias. Se solicita estudio."],
      ["30/08/2023", "Informe de vibración en Girardota con equipo, turno y recorrido identificados."],
      ["01/02/2024", "Reubicación por restricciones funcionales. Continúa el mismo contrato."],
      ["14/03/2024", "Resonancia registra compromiso cervical C5–C6. Cirugía el 22/05/2024, seguida de rehabilitación."],
      ["01/10/2024", "EPS SURA califica origen laboral en primera oportunidad. La ARL manifiesta inconformidad el 04/10/2024."],
      ["12/02/2025", "Junta Regional determina origen laboral. Tras apelación, la Junta Nacional confirma el origen el 31/03/2025."],
      ["10/12/2025", "Fecha de estructuración consignada en la calificación posterior de PCL."],
      ["18/03/2026", "ARL SURA emite dictamen de PCL de 56,80 %. Notificación el 19/03 y constancia de firmeza del 08/04."],
      ["21/04/2026", "Mateo solicita pensión a ARL SURA. El paquete de revisión llega sin la constancia de firmeza."]
    ],
    puntos:[
      { id:"P1", n:"Verificar dictamen y cobertura", decide:"arl", decideN:"ARL SURA", requiere:["ORI", "DIC", "FIR", "AFI"], inicio:"3/4" },
      { id:"P2", n:"Resolver solicitud pensional", decide:"arl", decideN:"ARL SURA", requiere:["SOL", "ORI", "DIC", "FIR", "AFI"], inicio:"4/5", resuelve:true },
      { id:"P3", n:"Preparar liquidación ilustrativa", decide:"arl", decideN:"ARL SURA", requiere:["DIC", "FIR", "IBC"], inicio:"1/3" }
    ],
    flujoActual:"Mateo adjunta lo que tiene. Prestaciones encuentra el DIC en su bandeja documental, pide la firmeza a medicina laboral y solicita por correo a nómina el mes de IBC faltante. Devuelve el certificado v1 si llega incompleto.",
    flujoPropuesto:"Prestaciones consulta el índice con finalidad pensional, vincula FIR al DIC y solicita a nómina la versión certificada del IBC. Las vistas muestran únicamente los campos autorizados para la decisión.",
    criterio:"Con DIC firme de 56,80 % laboral y cobertura verificada, la pauta prevé reconocimiento al completar P2. Si falta FIR, se requiere ese soporte. Si falta IBC tras resolver el derecho, la liquidación ilustrativa de P3 queda pendiente.",
    notas:["El análisis de puesto y el resumen clínico explican la calificación previa y puede revisarse en el ejercicio. El punto P2 evalúa el expediente de reconocimiento. La responsabilidad civil del empleador queda fuera de esa decisión."],
    soportes:[
      { k:"SOL", n:"Solicitud e identidad", cust:"tra", custN:"Solicitante", estado:"conforme", ver:"v1", notaEstado:"Radicado e identificación del caso visibles.", verRef:"v1", contenido:"RAD-L01, 21/04/2026. Solicitud de pensión e identificación sintética verificadas.", criterio:"Mismo titular, tipo de prestación y radicado." },
      { k:"ORI", n:"Confirmación del origen", cust:"jn", custN:"Junta Nacional", estado:"conforme", ver:"v1", notaEstado:"Providencia de calificación de origen identificable.", verRef:"v1", contenido:"ORI-L01, 31/03/2025. La Junta Nacional confirma origen laboral de M50.0.", criterio:"Emisor, caso, diagnóstico, sentido y fecha verificables." },
      { k:"DIC", n:"Dictamen de PCL", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v1", notaEstado:"Constan PCL, fecha de estructuración y emisor.", verRef:"v1", contenido:"DIC-L01, 18/03/2026. PCL 56,80 %, origen laboral, estructuración 10/12/2025.", criterio:"Documento firmado, trazado al ORI y con origen, PCL y estructuración." },
      { k:"FIR", n:"Constancia de firmeza", cust:"arl", custN:"ARL SURA", estado:"ausente", ver:"", notaEstado:"En el paquete solo está el dictamen.", verRef:"v1", contenido:"FIR-L01, 08/04/2026. Dictamen DIC-L01 firme, con fecha de notificación verificada.", criterio:"Firmeza vinculada al identificador y la versión del DIC." },
      { k:"AFI", n:"Afiliación y cobertura", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v2", notaEstado:"Certificado que identifica la ARL a la fecha de exigibilidad del caso.", verRef:"v2", contenido:"Cobertura ARL SURA desde 01/02/2013. Vigente al quedar firme DIC-L01 y al radicar.", criterio:"Identifica titular, ARL y vigencia en fecha relevante." },
      { k:"IBC", n:"Certificado de IBC", cust:"emp", custN:"Empleador", estado:"no_conforme", ver:"v1", notaEstado:"Falta septiembre de 2024.", verRef:"v2", contenido:"Período 01/10/2023–30/09/2024. Oct.–dic. de 2023: $3.280.000 mensuales. Ene.–sep. de 2024: $3.460.000 mensuales.", criterio:"Doce meses del escenario, legibles y certificados para verificar la base de liquidación." },
      { k:"APT", n:"Análisis de puesto y vibración", cust:"emp", custN:"Empleador", estado:"conforme", ver:"v2", notaEstado:"Informe técnico disponible en SG-SST.", verRef:"v2", contenido:"Medición 30/08/2023. Montacargas retráctil. A(8) 0,58 m/s². Factor de cresta 10,2.", criterio:"Identifica tarea, equipo, período observado y origen del dato." },
      { k:"HC", n:"Resumen clínico de columna", cust:"ips", custN:"IPS", estado:"conforme", ver:"v2", notaEstado:"Resumen clínico firmado en la IPS.", verRef:"v2", contenido:"M50.0. Resonancia 14/03/2024, cirugía 22/05/2024 y seguimiento funcional.", criterio:"Evolución y pruebas pertinentes con fecha y firma." }
    ],
    subsanacion:"Solicitar FIR a medicina laboral de la ARL. Para la liquidación ilustrativa, devolver el IBC incompleto a nómina indicando el mes faltante.",
    requerimiento:"Verificar con los actores cómo se traspasa a prestaciones una calificación generada en medicina laboral, cómo se enlaza la prueba de firmeza y quién corrige los períodos de IBC.",
    h2:[
      { id:"R01", tarea:"Aportar la solicitud e identificar el radicado", funcion:"Aporta", ref:"tra", refN:"Solicitante" },
      { id:"R02", tarea:"Suministrar y certificar los 12 meses de IBC", funcion:"Aporta", ref:"emp", refN:"Empleador · Nómina" },
      { id:"R03", tarea:"Emitir el dictamen que resuelve la apelación de origen", funcion:"Decide calificación", ref:"jn", refN:"Junta Nacional" },
      { id:"R04", tarea:"Certificar la firmeza del dictamen de PCL", funcion:"Aporta", ref:"arl", refN:"ARL SURA · Medicina laboral" },
      { id:"R05", tarea:"Verificar la cobertura y suficiencia del expediente", funcion:"Revisa", ref:"arl", refN:"ARL SURA · Prestaciones" },
      { id:"R06", tarea:"Resolver el reconocimiento pensional laboral", funcion:"Decide prestación", ref:"arl", refN:"ARL SURA · Prestaciones" }
    ],
    h3:[
      { momento:"+2 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"ORI", accion:"Consultar", finalidad:"Verificar origen definitivo", resultado:"Entrega de origen y fecha", denegado:false },
      { momento:"+8 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"FIR", accion:"Consultar", finalidad:"Confirmar firmeza del dictamen", resultado:"Constancia vinculada al DIC", denegado:false },
      { momento:"+28 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"IBC", accion:"Consultar", finalidad:"Verificar la base de liquidación prevista en P3", resultado:"Vista de doce meses", denegado:false },
      { momento:"+30 h", actor:"emp", actorN:"Empleador · Administración", pieza:"HC", accion:"Consultar", finalidad:"Control administrativo de asistencia", resultado:"Denegado. Se pueden comunicar restricciones funcionales por una finalidad pertinente.", denegado:true }
    ],
    procedencia:"Se tomó el patrón de exposición a vibración y de calificación en etapas. El porcentaje, el nivel medido, la localización cervical, las fechas y los actores del ejercicio fueron creados para la simulación.",
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
    id:"PI-L03", origen:"laboral", titulo:"Operadora minera con tres dictámenes",
    resumenTabla:"Un dictamen parcial previo y una decisión regional apelada conviven con una calificación integral en firme. El error de versión cambia el sentido de la decisión.",
    persona:{
      nombre:"Mónica Beltrán Rivas", edad:53, edadNota:"53 años al radicar", sexo:"femenino",
      ciudad:"Sogamoso, Boyacá", nacimiento:"10/11/1972",
      formacion:"Bachiller con formación técnica en operación de maquinaria amarilla", dominancia:"derecha",
      situacion:"Solicitante y operadora reubicada",
      vinculo:"Vínculo vigente. Desde febrero de 2024 realiza control de pesaje",
      convivencia:"",
      pide:"Solicita que prestaciones confirme cuál de los tres documentos de calificación corresponde a su caso."
    },
    trayectoria:[
      { periodo:"01/01/1993 a 31/12/2002", dur:"10 a", empresa:"Carbones Cuesta de Niebla", centro:"Sogamoso, patio de acopio", ciiu:"0510", cargo:"Auxiliar de patio", trabajo:"Ordena material, usa herramientas manuales y mueve sacos de 10 a 18 kg. La manipulación ocupa 2 h acumuladas de un turno de 8 h.", vinculo:"Indefinido", arl:"ARL histórica A" },
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
      detalle:"Túnel carpiano bilateral laboral, con cirugía en mano derecha, residual sensitivo y PCL de 16,20 % en dictamen previo. Discopatía lumbar degenerativa con dolor persistente y limitación para sedestación y desplazamiento. El dictamen integral de origen laboral consigna una PCL del 52,40 %. Gonartrosis leve en seguimiento, documentada como antecedente común. El dictamen final deja identificados el alcance y los antecedentes considerados.",
      funcion:"La cirugía de mano derecha y la rehabilitación de columna dejan limitaciones residuales para prensión, sedestación prolongada y marcha. El control de pesaje reduce las tareas de conducción y levantamiento.",
      pcl:52.40, pclOrigen:"laboral", estructuracion:"18/06/2025"
    },
    referenciasTemporales:[
      ["Primer síntoma registrado", "48 años", "12/11/2020"],
      ["Diagnóstico inicial", "48 años", "09/02/2021"],
      ["Estructuración en el dictamen final", "52 años", "18/06/2025"]
    ],
    actores:[
      { a:"arl", n:"ARL SURA", rol:"ARL SURA, medicina laboral y prestaciones", custodia:["CAR", "AFI"] },
      { a:"eps", n:"EPS SURA", rol:"EPS SURA, medicina laboral", custodia:[] },
      { a:"ips", n:"IPS", rol:"IPS de neurología, ortopedia y rehabilitación", custodia:["FUN"] },
      { a:"emp", n:"Empleador", rol:"SG-SST y nómina de Carbones Mesa Umbral", custodia:["IBC", "APT"] },
      { a:"jr", n:"Junta Regional", rol:"Junta Regional de Boyacá", custodia:["REG"] },
      { a:"jn", n:"Junta Nacional", rol:"Junta Nacional", custodia:["DIC", "FIR"] },
      { a:"tra", n:"Solicitante", rol:"Mónica Beltrán, solicitante", custodia:["SOL"] }
    ],
    perspectiva:"Mónica pide que le indiquen la versión que decide su pensión y qué pasa con la calificación anterior de la mano.",
    apertura:"Usted recibe una solicitud con dictámenes de distinto alcance. Identifique el antecedente, la versión pertinente al trámite de pensión y la constancia que le corresponde.",
    cronologia:[
      ["12/11/2020", "Consulta por parestesias en ambas manos. Electromiografía confirma G56.0 el 09/02/2021."],
      ["19/04/2022", "Tras cirugía de mano derecha y rehabilitación, ARL SURA emite dictamen laboral de G56.0, PCL 16,20 %, estructuración 19/01/2022. Queda firme el 06/05/2022. El expediente registra una IPP previa."],
      ["21/06/2023", "Consulta por dolor lumbar con síntomas persistentes. Medición de vibración del puesto el 23/08/2023."],
      ["01/02/2024", "Se formaliza la reubicación a la báscula. La IPS documenta evolución y rehabilitación de la columna."],
      ["01/08/2024", "EPS SURA califica origen laboral de M51.3 en primera oportunidad. ARL SURA manifiesta inconformidad el 05/08."],
      ["16/09/2025", "La Junta Regional ratifica origen laboral lumbar y establece PCL integral de 47,60 %, estructuración 18/06/2025."],
      ["22/09/2025", "Mónica apela. El expediente de segunda instancia incorpora el informe funcional del 30/10/2025."],
      ["31/03/2026", "La Junta Nacional expide PCL integral laboral de 52,40 %, estructuración 18/06/2025. Notifica el 01/04 y emite firmeza el 17/04."],
      ["29/04/2026", "Mónica radica pensión. El índice local conserva el dictamen anterior de 16,20 % y la decisión regional apelada."]
    ],
    puntos:[
      { id:"P1", n:"Distinguir alcances y versiones de dictamen", decide:"arl", decideN:"ARL SURA", requiere:["CAR", "REG", "DIC", "FIR"], inicio:"2/4" },
      { id:"P2", n:"Resolver solicitud pensional", decide:"arl", decideN:"ARL SURA", requiere:["SOL", "DIC", "FIR", "AFI"], inicio:"2/4", resuelve:true },
      { id:"P3", n:"Preparar liquidación ilustrativa", decide:"arl", decideN:"ARL SURA", requiere:["DIC", "FIR", "IBC"], inicio:"0/3" }
    ],
    flujoActual:"Prestaciones encuentra CAR y REG en distintas carpetas y recibe una constancia asociada al dictamen de 2022. Pide a Junta Nacional el dictamen integral y la firmeza correspondiente. Nómina verifica el período del IBC solicitado.",
    flujoPropuesto:"El índice enlaza cada calificación con su alcance, etapa, recurso y firmeza. Prestaciones consulta el dictamen válido, rechaza la firmeza mal asociada y solicita el certificado de IBC del período previsto.",
    criterio:"Con DIC-L03 firme de 52,40 % laboral, cobertura y soportes verificados, la pauta prevé reconocimiento en P2. La serie IBC se verifica en P3. El dictamen de 2022 y la IPP previa se conservan como antecedentes para eventual revisión separada. Si llega la constancia de 2022, se devuelve por discordancia y se solicita la de 2026.",
    notas:["El guion trae una calificación integral emitida. Los dictámenes previos se conservan como antecedentes. La pauta utiliza la PCL del dictamen integral para decidir. Las reubicaciones se documentan en el expediente."],
    soportes:[
      { k:"SOL", n:"Solicitud e identidad", cust:"tra", custN:"Solicitante", estado:"conforme", ver:"v1", notaEstado:"Radicado registrado.", verRef:"v1", contenido:"RAD-L03, 29/04/2026. Solicitud de pensión e identificación sintética.", criterio:"Titular, prestación y radicado inequívocos." },
      { k:"CAR", n:"Dictamen previo de túnel carpiano", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v1", notaEstado:"Está disponible como antecedente.", verRef:"v1", contenido:"CAR-L03, 19/04/2022. G56.0 laboral, PCL 16,20 %, estructuración 19/01/2022. Firme el 06/05/2022.", criterio:"Identifica patología, alcance, decisión previa y su estado." },
      { k:"REG", n:"Dictamen integral regional", cust:"jr", custN:"Junta Regional", estado:"conforme", ver:"v1", notaEstado:"Copia auténtica de la instancia apelada.", verRef:"v1", contenido:"REG-L03, 16/09/2025. PCL integral laboral 47,60 %, estructuración 18/06/2025. Apelado el 22/09.", criterio:"Emisor, fecha, alcance integral y marca de instancia." },
      { k:"DIC", n:"Dictamen integral nacional", cust:"jn", custN:"Junta Nacional", estado:"ausente", ver:"", notaEstado:"Solo circula REG-L03 en la bandeja de prestaciones.", verRef:"v1", contenido:"DIC-L03, 31/03/2026. PCL integral laboral 52,40 %, estructuración 18/06/2025. Resuelve recurso de REG-L03.", criterio:"Dictamen nacional autenticado, con alcance y versión claramente vinculados." },
      { k:"FIR", n:"Constancia de firmeza", cust:"jn", custN:"Junta Nacional", estado:"no_conforme", ver:"v0", notaEstado:"Constancia que corresponde a CAR-L03 de 2022.", verRef:"v1", contenido:"FIR-L03, 17/04/2026. Firmeza de DIC-L03 tras la notificación del 01/04.", criterio:"Debe enlazar DIC-L03 de 2026, con fechas y emisor verificables." },
      { k:"AFI", n:"Afiliación y cobertura", cust:"arl", custN:"ARL SURA", estado:"conforme", ver:"v2", notaEstado:"Certificado vigente.", verRef:"v2", contenido:"ARL SURA desde 01/01/2013. Cubre fecha de firmeza y de radicación.", criterio:"Titular y vigencia trazados al último vínculo." },
      { k:"IBC", n:"Certificado histórico de IBC", cust:"emp", custN:"Empleador", estado:"no_conforme", ver:"v1", notaEstado:"Exportación reciente con corte de 2026.", verRef:"v2", contenido:"Período 01/08/2023–31/07/2024, corte previo a primera calificación de origen lumbar según el guion. Ago. 2023–ene. 2024: $3.040.000 mensuales. Feb.–jul. 2024: $3.200.000 mensuales.", criterio:"Serie del período fijado para la liquidación ilustrativa, con firma y desglose mensual." },
      { k:"APT", n:"Análisis del puesto y reubicación", cust:"emp", custN:"Empleador", estado:"conforme", ver:"v2", notaEstado:"Versión con cronología del cambio.", verRef:"v2", contenido:"Vibración A(8) 0,61 m/s² en 2023 y constancia de paso a báscula desde 01/02/2024.", criterio:"Documenta condiciones medidas y fecha de reubicación." },
      { k:"FUN", n:"Resumen funcional de mano y columna", cust:"ips", custN:"IPS", estado:"conforme", ver:"v2", notaEstado:"Extracto firmado en la IPS.", verRef:"v2", contenido:"Constan secuelas de mano, restricción de sedestación prolongada, marcha con pausas e informe funcional usado en el recurso.", criterio:"Indica procedencia, fecha y alcance de las evaluaciones." }
    ],
    subsanacion:"Marcar CAR y REG como antecedentes de distinto alcance. Devolver FIR de 2022 y pedir su versión de 2026; para P3, solicitar la serie IBC del período correcto.",
    requerimiento:"Verificar cómo se identifican patologías y versiones, quién autoriza el extracto funcional y qué referencias preserva el motor para impedir el uso de una constancia del dictamen equivocado.",
    h2:[
      { id:"R01", tarea:"Aportar el análisis de puesto y la fecha de reubicación", funcion:"Aporta", ref:"emp", refN:"Empleador · SG-SST" },
      { id:"R02", tarea:"Aportar el extracto funcional de mano y columna", funcion:"Aporta", ref:"ips", refN:"IPS · Rehabilitación" },
      { id:"R03", tarea:"Emitir el dictamen integral de segunda instancia", funcion:"Decide calificación", ref:"jn", refN:"Junta Nacional" },
      { id:"R04", tarea:"Aportar la constancia de firmeza de la segunda instancia", funcion:"Aporta", ref:"jn", refN:"Junta Nacional" },
      { id:"R05", tarea:"Verificar alcance, versión y vigencia de los dictámenes", funcion:"Revisa", ref:"arl", refN:"ARL SURA · Prestaciones" },
      { id:"R06", tarea:"Resolver el reconocimiento pensional laboral", funcion:"Decide prestación", ref:"arl", refN:"ARL SURA · Prestaciones" }
    ],
    h3:[
      { momento:"+2 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"CAR", accion:"Consultar", finalidad:"Identificar alcance de la calificación previa", resultado:"Antecedente G56.0, con su alcance", denegado:false },
      { momento:"+6 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"DIC", accion:"Consultar", finalidad:"Verificar la PCL integral vigente", resultado:"Dictamen nacional con su versión", denegado:false },
      { momento:"+25 h", actor:"arl", actorN:"ARL SURA · Prestaciones", pieza:"FIR", accion:"Consultar", finalidad:"Verificar firmeza de la versión vigente", resultado:"Constancia asociada a DIC-L03", denegado:false },
      { momento:"+32 h", actor:"emp", actorN:"Empleador · Administración", pieza:"FUN", accion:"Consultar", finalidad:"Administrar turnos de báscula", resultado:"Denegado el extracto clínico. Solo vista de restricciones si se habilita para ese fin.", denegado:true }
    ],
    procedencia:"La T-364 aporta la sucesión de dictámenes sobre columna. La SU-111 aporta el antecedente separado de túnel carpiano bilateral. El fallo de Medellín aporta la prueba técnica de vibración. Se inventaron la biografía, los dictámenes, la PCL integral y el desenlace.",
    fuentes:[
      "Corte Constitucional, Sentencia T-364 de 2024, antecedentes 3 a 10",
      "Corte Constitucional, Sentencia SU-111 de 2025, párrs. 219 a 232",
      "Tribunal Superior de Medellín, Sala Quinta Laboral, 11 de febrero de 2025. Rad. 05001-31-05-022-2019-00619-01"
    ]
  },

  /* ======================= PI-C01 ======================= */
  {
    id:"PI-C01", origen:"comun", titulo:"Auxiliar de laboratorio con aportes omitidos",
    resumenTabla:"La AFP ve 46 semanas. Debe verificar y consolidar ocho semanas omitidas antes de resolver una solicitud con PCL firme de origen común.",
    persona:{
      nombre:"Laura Medina Torres", edad:44, edadNota:"44 años al radicar", sexo:"femenino",
      ciudad:"Medellín, Antioquia", nacimiento:"17/06/1981",
      formacion:"Técnica laboral como auxiliar de laboratorio clínico", dominancia:"derecha",
      situacion:"Solicitante y extrabajadora de laboratorio diagnóstico",
      vinculo:"Sin vínculo vigente desde el cierre del contrato en junio de 2025",
      convivencia:"Vive con una hermana y realiza trámites por el portal con ayuda para digitalizar documentos",
      pide:"Señala un contrato de 2023 y pide saber por qué no aparece en el reporte utilizado por la AFP."
    },
    trayectoria:[
      { periodo:"01/02/2004 a 31/01/2011", dur:"7 a", empresa:"Diagnóstico Nexo Prado", centro:"Medellín, procesamiento de muestras", ciiu:"8691", cargo:"Auxiliar de laboratorio", trabajo:"Rotula y alista cerca de 70 tubos por turno de 8 h. Alterna registro, pipeteo, clasificación y uso de centrífuga.", vinculo:"Indefinido", arl:"ARL histórica A" },
      { periodo:"01/04/2011 a 31/03/2016", dur:"5 a", empresa:"Laboratorio Quicio Valle", centro:"Envigado, sede ambulatoria", ciiu:"8691", cargo:"Auxiliar de toma y registro", trabajo:"Atiende cerca de 30 tomas al día durante 4 h acumuladas. Dedica el resto a ingreso de órdenes y alistamiento.", vinculo:"Indefinido", arl:"ARL histórica B" },
      { periodo:"06/02/2023 a 02/04/2023", dur:"1 m 28 d", empresa:"Laboratorio Ruta Linde", centro:"Medellín, sede de recepción", ciiu:"8691", cargo:"Auxiliar de recepción de muestras", trabajo:"Recibe, verifica y escanea unas 65 muestras por turno de 8 h. Predomina el registro y el agarre repetido de bandejas livianas.", vinculo:"Término fijo", arl:"ARL SURA" },
      { periodo:"15/07/2024 a 01/06/2025", dur:"10 m 18 d", empresa:"Diagnóstico Trama Clínica", centro:"Bello, laboratorio ambulatorio", ciiu:"8691", cargo:"Auxiliar de trazabilidad de muestras", trabajo:"Registra cerca de 60 muestras por turno. Desde 01/03/2025 alterna tareas de digitación y llamadas para reducir molestias de manos.", vinculo:"Término fijo", arl:"ARL SURA" }
    ],
    tiempos:"Diagnóstico Nexo Prado, 7 a · Laboratorio Quicio Valle, 5 a · Laboratorio Ruta Linde, 1 m 28 d · Diagnóstico Trama Clínica, 10 m 18 d. Vínculo acumulado al radicar 4.762 días.",
    actividad:"8691 actividades de apoyo diagnóstico.",
    vacios:"Sin vínculo en febrero y marzo de 2011, de abril de 2016 al 05/02/2023 y del 03/04/2023 al 14/07/2024. El guion registra labores de cuidado familiar en las dos interrupciones más largas y carece de aportes durante esos períodos.",
    exposicion:"La ficha laboral consigna movimientos repetidos de manos y carga estática al procesar y registrar muestras. Se describe a partir de registros de tareas, sin medición instrumental. El origen común de la artritis está consignado en el dictamen del guion. La descripción de exposición se conserva para SP1 y para interpretar el antecedente de mano.",
    clinica:{
      diagnostico:"Artritis reumatoide seropositiva (M05.9)",
      detalle:"Con afectación poliarticular, de origen común en el dictamen del ejercicio. Persiste limitación funcional de manos y rodillas pese al tratamiento prescrito y rehabilitación. El síndrome del túnel carpiano (G56.0) figura como antecedente clínico. Reumatología documenta dificultad para pinza fina, apertura de recipientes y marcha sostenida. El guion asigna PCL de 54,10 % de origen común.",
      funcion:"La IPS registra tratamiento farmacológico y rehabilitación, con persistencia de limitaciones para pinza fina, marcha sostenida y bipedestación. En el último vínculo ajusta sus tareas hasta el retiro.",
      pcl:54.10, pclOrigen:"común", estructuracion:"02/06/2025"
    },
    referenciasTemporales:[
      ["Primer síntoma registrado", "41 años", "18/08/2022"],
      ["Diagnóstico inicial", "42 años", "14/02/2024"],
      ["Estructuración en el dictamen final", "43 años", "02/06/2025"]
    ],
    actores:[
      { a:"arl", n:"ARL SURA", rol:"ARL SURA, antecedente de afiliación ocupacional", custodia:[] },
      { a:"eps", n:"EPS SURA", rol:"EPS SURA, medicina laboral", custodia:["DIC", "FIR"] },
      { a:"ips", n:"IPS", rol:"IPS de reumatología y rehabilitación", custodia:["HC"] },
      { a:"emp", n:"Empleador", rol:"Nómina de los empleadores de 2023 y 2024–2025", custodia:["PILA"] },
      { a:"afp", n:"AFP", rol:"AFP del ejercicio, historia laboral y prestaciones", custodia:["AFI", "HL"] },
      { a:"tra", n:"Solicitante", rol:"Laura Medina, solicitante", custodia:["SOL"] }
    ],
    perspectiva:"Laura señala un contrato de 2023 y pide saber por qué no aparece en el reporte utilizado por la AFP.",
    apertura:"Usted recibe una solicitud de pensión y una historia laboral con un período cuestionado. Defina la ventana a revisar y qué soportes acreditan las semanas.",
    cronologia:[
      ["18/08/2022", "Primera consulta por dolor y rigidez en manos y rodillas."],
      ["06/02/2023", "Inicia vínculo de ocho semanas con Laboratorio Ruta Linde. Las planillas quedan bajo una referencia de afiliación migrada."],
      ["14/02/2024", "Reumatología confirma M05.9. Inicia manejo y seguimiento."],
      ["15/07/2024", "Inicia vínculo con Diagnóstico Trama Clínica. Su historia consolidada refleja 46 semanas de este contrato."],
      ["01/03/2025", "Se ajustan las tareas por limitación funcional. En mayo se documenta deterioro y el vínculo concluye el 01/06/2025."],
      ["02/06/2025", "Fecha de estructuración fijada en el dictamen sintético. La ventana de cotización va del 02/06/2022 al 01/06/2025."],
      ["07/04/2026", "EPS SURA, en el guion, emite dictamen en primera oportunidad de 54,10 %, origen común. Se notifica el 08/04 y queda firme según constancia del 28/04."],
      ["22/05/2026", "Laura radica solicitud ante su AFP. El reporte visible indica 46 semanas en la ventana. Una carpeta de nómina conserva comprobantes que permiten corregir ocho semanas omitidas."]
    ],
    puntos:[
      { id:"P1", n:"Conciliar las semanas para la fecha de estructuración", decide:"afp", decideN:"AFP", requiere:["DIC", "HL", "PILA"], inicio:"1/3" },
      { id:"P2", n:"Resolver solicitud pensional", decide:"afp", decideN:"AFP", requiere:["SOL", "DIC", "FIR", "AFI", "HL"], inicio:"4/5", resuelve:true }
    ],
    flujoActual:"Laura aporta una certificación y pide corrección. Historia laboral coteja las planillas de 2023 con el registro de la AFP. Prestaciones solicita un reporte consolidado que retire la inconsistencia de la ventana.",
    flujoPropuesto:"El índice vincula la fecha de estructuración a la ventana. Historia laboral accede a las planillas pertinentes, verifica que no se dupliquen días y publica la versión certificada. Prestaciones consulta el total y la constancia del dictamen.",
    criterio:"Con 54 semanas conciliadas en la ventana, DIC firme de 54,10 % común y afiliación comprobada, la pauta prevé reconocimiento bajo la regla general usada en el caso. Con 46 semanas y una omisión identificada, la tarea es verificar y corregir antes de cerrar. Si no se acreditan las ocho semanas tras verificar, se deja el caso para revisión del fondo conforme al protocolo del estudio.",
    notas:["El expediente está diseñado con fecha de estructuración fija. El escenario trabaja con aportes anteriores a ella y con la regla general. La inclusión de cotizaciones posteriores o la reasignación de la fecha de estructuración requerirían otro escenario."],
    conciliacion:[
      "06/02/2023 al 02/04/2023. 56 días cubiertos por 3 planillas, confirmados al cotejar.",
      "15/07/2024 al 01/06/2025. 322 días verificados en la historia laboral.",
      "Ventana del 02/06/2022 al 01/06/2025. La AFP consolida 322 + 56 = 378 días, equivalentes a 54 semanas. El reporte inicial refleja 46 semanas. Las ocho omitidas pertenecen al vínculo de 2023."
    ],
    soportes:[
      { k:"SOL", n:"Solicitud e identidad", cust:"tra", custN:"Solicitante", estado:"conforme", ver:"v1", notaEstado:"Identificación y radicado visibles.", verRef:"v1", contenido:"RAD-C01, 22/05/2026. Solicitud de pensión e identificación sintética.", criterio:"Mismo titular, tipo de prestación y radicado." },
      { k:"DIC", n:"Dictamen de origen y PCL", cust:"eps", custN:"EPS SURA", estado:"conforme", ver:"v1", notaEstado:"Dictamen con fecha de estructuración visible.", verRef:"v1", contenido:"DIC-C01, 07/04/2026. Origen común, PCL 54,10 %, estructuración 02/06/2025.", criterio:"Identifica emisor, titular, origen, PCL, estructuración y firma." },
      { k:"FIR", n:"Constancia de firmeza", cust:"eps", custN:"EPS SURA", estado:"conforme", ver:"v1", notaEstado:"Constancia sobre DIC-C01 disponible.", verRef:"v1", contenido:"FIR-C01, 28/04/2026. Vinculada a DIC-C01, notificado el 08/04.", criterio:"Firmeza trazada a la versión del dictamen." },
      { k:"AFI", n:"Afiliación pensional", cust:"afp", custN:"AFP", estado:"conforme", ver:"v1", notaEstado:"Identifica a la administradora que tramita.", verRef:"v1", contenido:"AFP del ejercicio. Afiliación iniciada el 01/02/2004 y vigente para la solicitud.", criterio:"Identifica afiliación, período y titular." },
      { k:"HL", n:"Historia laboral consolidada", cust:"afp", custN:"AFP", estado:"no_conforme", ver:"v1", notaEstado:"46 semanas visibles en la ventana. Falta el período de 2023.", verRef:"v2", contenido:"Ventana 02/06/2022–01/06/2025. 378 días verificados tras conciliación, equivalentes a 54 semanas. Total histórico del guion: 680,29 semanas.", criterio:"Ventana correcta, períodos conciliados sin duplicados y versión certificada." },
      { k:"PILA", n:"Comprobantes de períodos omitidos", cust:"emp", custN:"Empleador", estado:"ausente", ver:"", notaEstado:"El certificado laboral indica vínculo, pero faltan las planillas y su confirmación.", verRef:"v1", contenido:"Períodos cubiertos del 06/02/2023 al 02/04/2023. Tres planillas pagadas y verificadas en el guion, asociadas a 56 días calendario sin duplicados.", criterio:"Aportes a pensión del mismo titular, empleador identificado, pagos y fechas trazables." },
      { k:"HC", n:"Resumen clínico pertinente", cust:"ips", custN:"IPS", estado:"conforme", ver:"v1", notaEstado:"Resumen clínico firmado disponible en la IPS.", verRef:"v1", contenido:"M05.9, función de manos y rodillas, evolución y limitaciones al cierre del vínculo.", criterio:"Origen del extracto, firma y fechas. Se usa como antecedente del dictamen." }
    ],
    subsanacion:"Pedir PILA al empleador de 2023. Verificar identidad, períodos y pago, conciliar sin duplicados y emitir HL certificada desde historia laboral de la AFP.",
    requerimiento:"Verificar quién concilia las planillas, qué datos comparte nómina con la AFP y qué debe ver la solicitante para impugnar o corregir un período omitido.",
    h2:[
      { id:"R01", tarea:"Aportar las planillas omitidas de 2023", funcion:"Aporta", ref:"emp", refN:"Empleador · Nómina de 2023" },
      { id:"R02", tarea:"Emitir el dictamen de origen y PCL del escenario", funcion:"Decide calificación", ref:"eps", refN:"EPS SURA · Medicina laboral" },
      { id:"R03", tarea:"Certificar la firmeza del dictamen", funcion:"Aporta", ref:"eps", refN:"EPS SURA · Medicina laboral" },
      { id:"R04", tarea:"Conciliar períodos y certificar la nueva historia laboral", funcion:"Revisa", ref:"afp", refN:"AFP · Historia laboral" },
      { id:"R05", tarea:"Aportar la solicitud pensional y señalar el período faltante", funcion:"Aporta", ref:"tra", refN:"Solicitante" },
      { id:"R06", tarea:"Resolver el reconocimiento pensional común", funcion:"Decide prestación", ref:"afp", refN:"AFP · Prestaciones" }
    ],
    h3:[
      { momento:"+2 h", actor:"afp", actorN:"AFP · Prestaciones", pieza:"DIC", accion:"Consultar", finalidad:"Fijar ventana de cotización", resultado:"Origen, PCL y estructuración visibles", denegado:false },
      { momento:"+12 h", actor:"afp", actorN:"AFP · Historia laboral", pieza:"PILA", accion:"Consultar", finalidad:"Conciliar aportes de 2023", resultado:"Comprobantes y períodos disponibles", denegado:false },
      { momento:"+29 h", actor:"afp", actorN:"AFP · Prestaciones", pieza:"HL", accion:"Consultar", finalidad:"Verificar semanas consolidadas", resultado:"Versión certificada con el total", denegado:false },
      { momento:"+33 h", actor:"emp", actorN:"Empleador · Administración", pieza:"HC", accion:"Consultar", finalidad:"Verificar planillas omitidas", resultado:"Denegado. La conciliación utiliza soportes de cotización.", denegado:true }
    ],
    procedencia:"El contraste del Tribunal de Medellín informó la coexistencia de trayectoria en laboratorio, calificaciones y trámite común. T-024 informa el problema de corregir un registro de aportes. La artritis, la PCL y el faltante de ocho semanas se diseñaron para el ejercicio.",
    fuentes:[
      "Tribunal Superior de Medellín, Sala Segunda Laboral, 27 de junio de 2025. Rad. 05001-31-05-008-2023-00254-01",
      "Corte Constitucional, Sentencia T-024 de 2025, antecedente sobre corrección de historia laboral"
    ]
  }
  ],

  /* ---------- Criterios jurídicos y fuentes del marco ---------- */
  referencias: {
    nota:"Los valores de PCL se leen de los dictámenes sintéticos. Los criterios de conformidad de las fichas son reglas operativas del ejercicio. La calificación médico-laboral, la decisión sobre la pensión y su liquidación son hitos diferenciados.",
    grupos:[
      { n:"Origen laboral",
        d:"El umbral de invalidez laboral es una PCL del 50 % o más. La IPP corresponde a una disminución definitiva desde el 5 % y por debajo del 50 %. En los tres casos laborales la afiliación de ARL SURA se mantiene hasta la fecha relevante. El certificado de IBC sirve para la liquidación ilustrativa de los casos que la incluyen.",
        fuentes:["Ley 776 de 2002, arts. 1, 5, 7, 9 y 10", "Ley 1562 de 2012, arts. 4 y 5", "Corte Suprema de Justicia, Sala de Casación Laboral, ficha oficial SL1469-2024"] },
      { n:"Origen común",
        d:"El caso PI-C01 aplica la regla general de PCL del 50 % o más y al menos 50 semanas cotizadas en los tres años anteriores a la fecha de estructuración. Los dos períodos usados en el ejercicio se verifican con días calendario cubiertos y sin duplicados.",
        fuentes:["Ley 100 de 1993, arts. 38, 39 y 41. Arts. 39 y 41 con sus modificaciones", "Corte Constitucional, Sentencia C-428 de 2009", "Corte Constitucional, Sentencia T-245 de 2026, párrs. 51 a 54", "Corte Suprema de Justicia, Sala de Casación Laboral, Sentencia SL138-2024"] },
      { n:"Calificación y control de versiones",
        d:"La referencia de 540 días se ubica en el supuesto reglamentario de acceso directo a Junta Regional ante ausencia de calificación en primera oportunidad. Las decisiones de las Juntas, la firmeza y el reconocimiento quedan identificados en hitos propios. El ejercicio de patologías concurrentes toma el porcentaje del dictamen integral fijado en el guion.",
        fuentes:["Decreto 1072 de 2015, arts. 2.2.5.1.25 y 2.2.5.1.28", "Decreto 1507 de 2014, Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional", "Corte Constitucional, Sentencia C-425 de 2005"] },
      { n:"Fuentes de trabajo",
        d:"",
        fuentes:["Perplexity Computer, Enfermedad laboral y pensión de invalidez. Cinco trabajadores, cinco sentencias. 14 de noviembre de 2026", "DANE, Clasificación Industrial Internacional Uniforme, Rev. 4 A.C., actualización 2022", "Auto cotejado. Corrobora el proceso y la solicitud de prueba para un dictamen. El texto del fallo de consulta de 15 de noviembre de 2024 quedó sin cotejo. Sus porcentajes y su desenlace se excluyeron como datos verificados."] }
    ]
  },

  /* El documento es para quien facilita y evalúa la sesión. */
  uso:"La trayectoria, los datos clínicos, los porcentajes, las empresas y los desenlaces se crearon para la simulación. SURA cumple la función de organización ancla. Los procesos operativos del guion se contrastan con los actores del caso antes de emplearlos como línea base de la tesis. La persona solicitante es el actor focal. Para aplicar un caso, se presentan al participante la apertura, su rol y la evidencia disponible en el punto del recorrido."
};
