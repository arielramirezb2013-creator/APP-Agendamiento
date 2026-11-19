/* ============ Documentos sintéticos · operadora minera con tres dictámenes ============
   Expediente de Mónica Beltrán Rivas, operadora de cargador frontal reubicada en la báscula de Tópaga.
   Túnel carpiano bilateral (G56.0), calificado por ARL SURA en 2022 (CAR-L03, 16,20 %, firme el 06/05/2022,
   con indemnización por incapacidad permanente parcial), y discopatía lumbar degenerativa (M51.3), calificada de
   forma integral por la Junta Regional de Boyacá (REG-L03, 47,60 %, apelado) y por la Junta Nacional
   (DIC-L03, 52,40 %, firme el 17/04/2026 según FIR-L03). Solicitud RAD-L03 del 29/04/2026.
   Aritmética (Decreto 1507 de 2014: deficiencia combinada ponderada al 50 % + Título II):
     Dictamen de 2022 ....... manos 5 y 4 → 8,80 → 4,40 + rol 6,50 + otras áreas 5,30 = 16,20 %
     Junta Regional ......... lumbar 25, manos 5 y 4 → 28,75 → 31,60 → 15,80 + 23,50 + 8,30 = 47,60 %
     Junta Nacional ......... lumbar 29, manos 6 y 5 → 33,26 → 36,60 (36,597) → 18,30 + 23,50 + 10,60 = 52,40 %
   Extremidad superior a global: factor 0,6 redondeado al entero (8 → 5, 6 → 4, 10 → 6).
   Manos por atrapamiento (promedio de pruebas, historia y examen; la escala funcional fija el valor del rango):
     derecha 2022 y 2025: pérdida axonal residual, síntomas constantes, debilidad → rango 7–9; QuickDASH 63,6 / 68,2 → 8.
     izquierda 2022: retardo de conducción, síntomas intermitentes, hipoestesia → rango 4–6; QuickDASH 63,6 → 6.
     izquierda 2025: pérdida axonal con denervación y déficit motor → nervio periférico (mediano), sensitivo + motor → 10.
   IBC del período fijado (01/08/2023 a 31/07/2024): 6 × $3.040.000 + 6 × $3.200.000 = $37.440.000; promedio $3.120.000.
   Exportación de 2026 (01/04/2025 a 31/03/2026): 10 × $3.330.000 + 2 × $3.520.000 = $40.340.000.
   Vibración (ISO 2631-1): aw,z 0,77 m/s² durante 5 h → A(8) = 0,77 × √(5/8) = 0,61 m/s².
   Todo es sintético: ninguna persona, número, profesional ni documento es real. */
DOCS.exp["PI-L03"] = {
  identidad: {
    documento: "C.C. SIM-46.372.518",
    historia: "Historia clínica SIM-NOP-2021-04417",
    afiliacionArl: "SIM-ARL-2013-61942",
    afiliacionEps: "SIM-EPS-1999-227315",
    afiliacionAfp: "SIM-AFP-1994-118306",
    empleador: "Carbones Mesa Umbral · NIT SIM-900.618.274-3",
    arl: "ARL SURA · NIT SIM-800.256.433-1",
    eps: "EPS SURA · NIT SIM-811.040.215-6",
    ips: "IPS Neuroeje Peñas Altas · NIT SIM-900.874.512-6",
    juntaRegional: "Junta Regional de Calificación de Invalidez de Boyacá · NIT SIM-820.004.316-8",
    juntaNacional: "Junta Nacional de Calificación de Invalidez · NIT SIM-830.512.447-0",
    higiene: "Higiene Industrial Cordillera Oriental S.A.S. · NIT SIM-901.338.150-2",
    expedienteRegional: "SIM-JRCIB-2024-0873",
    expedienteNacional: "SIM-JNCI-2025-11408",
    dictamenOrigenEps: "SIM-EPS-ML-2024-05126",
    actaNotificacion2022: "SIM-NOT-2022-01562",
    constanciaFirmeza2022: "SIM-ARL-CF-2022-0587",
    resolucionIpp: "SIM-ARL-IPP-2022-0731",
    verificacionDictamen2022: "SIM-VER-3C81-0D44",
    verificacionDictamenNacional: "SIM-VER-JN-5B27-9E13",
    analisisPuesto: "SIM-SST-APT-2024-019",
    informeVibracion: "SIM-HI-2023-0412",
    resumenFuncional: "SIM-IPS-RF-2025-0311",
    informeFuncional: "SIM-IPS-EF-2025-1030",
    certificadoAfiliacion: "SIM-ARL-CA-2026-10214",
    reporteIbcPortal: "SIM-NOM-AUT-2026-0419",
    certificadoIbc: "SIM-NOM-2026-0527",
    incapacidadCirugia: "SIM-IT-2021-208114"
  },

  soportes: {

    /* ---------------------------------------------------------------- Solicitud e identidad */
    SOL: {
      v1: {
        tipo: "solicitud",
        titulo: "Solicitud de reconocimiento de pensión de invalidez de origen laboral",
        emisor: { n: "Mónica Beltrán Rivas", area: "Solicitante · dirigida a ARL SURA, Prestaciones económicas", ciudad: "Sogamoso", id: "C.C. SIM-46.372.518" },
        numero: "RAD-L03",
        fecha: "29/04/2026",
        version: "v1",
        estadoNota: "Ejemplar radicado, con la constancia de la ventanilla de ARL SURA en Sogamoso.",
        paginas: [
          { titulo: "Solicitud", bloques: [
            { kv: [
              ["Radicado", "RAD-L03"],
              ["Fecha de radicación", "29/04/2026"],
              ["Oficina", "ARL SURA · atención presencial, Sogamoso"],
              ["Destinatario", "ARL SURA · Prestaciones económicas"],
              ["Prestación que solicita", "Pensión de invalidez de origen laboral"]
            ] },
            { h: "Datos de la solicitante" },
            { kv: [
              ["Nombre", "Mónica Beltrán Rivas"],
              ["Documento de identidad", "C.C. SIM-46.372.518 de Sogamoso"],
              ["Fecha de nacimiento", "10/11/1972 (53 años)"],
              ["Sexo", "Femenino"],
              ["Ciudad de residencia", "Sogamoso, Boyacá"],
              ["Escolaridad", "Bachiller, con formación técnica en operación de maquinaria amarilla"],
              ["Empleador actual", "Carbones Mesa Umbral · NIT SIM-900.618.274-3"],
              ["Cargo actual", "Auxiliar de control de pesaje, báscula exterior de Tópaga, en reubicación desde el 01/02/2024"],
              ["Afiliación a riesgos laborales", "ARL SURA · afiliación SIM-ARL-2013-61942"],
              ["Fondo de pensiones", "Cordillera Pensiones y Cesantías · afiliación SIM-AFP-1994-118306"],
              ["Datos de contacto", "Registrados en el formulario de la ventanilla; no se reproducen en esta copia"]
            ] },
            { h: "Hechos" },
            { lista: [
              "Trabajo en minería de carbón desde 1993: 10 años como auxiliar de patio en Carbones Cuesta de Niebla (Sogamoso), casi 10 años como operadora de cargador frontal en Carbones Ventana Alta (Nobsa) y, desde el 01/01/2013, en Carbones Mesa Umbral (Tópaga), donde operé cargador frontal y retroexcavadora hasta el 31/01/2024.",
              "En noviembre de 2020 empecé con adormecimiento y hormigueo en las dos manos. En febrero de 2021 la electromiografía mostró túnel carpiano en ambas manos y en abril de 2021 me operaron la mano derecha.",
              "ARL SURA me calificó el túnel carpiano el 19/04/2022 con 16,20 % de pérdida de capacidad laboral, de origen laboral. Ese dictamen quedó en firme y en junio de 2022 recibí la indemnización por incapacidad permanente parcial.",
              "Desde comienzos de 2023 tengo dolor en la parte baja de la espalda que me baja a las piernas; consulté por eso en junio de 2023. Desde el 01/02/2024 trabajo en la báscula, con restricciones para manejar maquinaria y levantar peso.",
              "EPS SURA calificó de origen laboral la enfermedad de la columna el 01/08/2024. ARL SURA no estuvo de acuerdo y el caso pasó a la Junta Regional de Calificación de Invalidez de Boyacá, que el 16/09/2025 confirmó el origen laboral y me calificó de manera integral con 47,60 %.",
              "Apelé ese dictamen el 22/09/2025. La Junta Nacional de Calificación de Invalidez resolvió la apelación en marzo de 2026 y me notificó por medio electrónico el 01/04/2026. No tengo copia impresa de ese dictamen; por eso no lo anexo.",
              "Me han hecho tres calificaciones con porcentajes distintos y tengo una constancia de firmeza que me entregó ARL SURA en 2022. No sé cuál de ellas es la que sirve para la pensión."
            ] },
            { h: "Peticiones" },
            { lista: [
              "Que se estudie y se reconozca la pensión de invalidez de origen laboral a que tenga derecho, conforme a la Ley 776 de 2002.",
              "Que se me informe por escrito cuál dictamen de calificación se tiene en cuenta para resolver esta solicitud y qué pasa con la calificación de las manos de 2022 y con la indemnización que recibí.",
              "Que, si falta algún documento, se me indique quién debe aportarlo o se pida directamente a la entidad que lo tiene."
            ] },
            { h: "Documentos que anexo" },
            { tabla: { cols: ["N.º", "Documento", "Folios"], filas: [
              ["1", "Copia del documento de identidad", "1"],
              ["2", "Copia del dictamen CAR-L03 de ARL SURA, del 19/04/2022", "6"],
              ["3", "Constancia de firmeza expedida por ARL SURA el 10/05/2022", "2"],
              ["4", "Copia auténtica del dictamen REG-L03 de la Junta Regional de Boyacá, del 16/09/2025, con constancia del estado del trámite", "7"],
              ["5", "Reporte de ingreso base de cotización descargado del portal de nómina de Carbones Mesa Umbral (corte 31/03/2026)", "2"]
            ], nota: "Folios contados por la ventanilla al recibir." } },
            { p: "Declaro que la información de esta solicitud es cierta. Autorizo a ARL SURA a consultar y a pedir a otras entidades los dictámenes, las constancias y los soportes clínicos y laborales necesarios para resolverla, solo con esa finalidad." },
            { firma: { nombre: "Mónica Beltrán Rivas", cargo: "Solicitante · C.C. SIM-46.372.518", fecha: "29/04/2026" } }
          ] },
          { titulo: "Constancia de radicación", bloques: [
            { kv: [
              ["Entidad que recibe", "ARL SURA · atención presencial, Sogamoso"],
              ["Radicado", "RAD-L03"],
              ["Fecha y hora", "29/04/2026, 09:42"],
              ["Trámite", "Pensión de invalidez de origen laboral"],
              ["Solicitante", "Mónica Beltrán Rivas · C.C. SIM-46.372.518"],
              ["Folios recibidos", "20 (solicitud, 2; anexos, 18)"]
            ] },
            { h: "Lista de verificación al recibir" },
            { tabla: { cols: ["Documento", "Estado al radicar", "Observación"], filas: [
              ["Solicitud firmada", "Recibida", "Mismo titular del documento de identidad"],
              ["Documento de identidad", "Recibido", "Copia simple"],
              ["Dictamen de calificación", "Recibidas dos copias", "Dictamen CAR-L03 de ARL SURA (19/04/2022, 16,20 %) y dictamen REG-L03 de la Junta Regional de Boyacá (16/09/2025, 47,60 %); la constancia de este último indica que fue apelado"],
              ["Dictamen que resolvió la apelación", "No aportado", "La solicitante informa que la Junta Nacional la notificó por medio electrónico el 01/04/2026"],
              ["Constancia de firmeza", "Recibida", "Constancia SIM-ARL-CF-2022-0587 de ARL SURA, del 10/05/2022"],
              ["Certificado de ingreso base de cotización", "Recibido reporte", "Reporte del portal de autoservicio de nómina, corte 31/03/2026, sin firma"]
            ], nota: "La verificación del dictamen vigente, de su firmeza y del período de cotización corresponde a Prestaciones económicas. Esta lista no es una decisión sobre la solicitud." } },
            { p: "ARL SURA informará a la solicitante el estado del trámite y dará respuesta de fondo dentro de los términos legales." },
            { firma: { nombre: "Jhon Fredy Ochoa Sanabria", cargo: "Auxiliar de atención y radicación · ARL SURA, Sogamoso", fecha: "29/04/2026" } }
          ] },
          { titulo: "Anexo 1 · Copia del documento de identidad", bloques: [
            { kv: [
              ["Documento", "Cédula de ciudadanía"],
              ["Número", "SIM-46.372.518"],
              ["Apellidos", "Beltrán Rivas"],
              ["Nombres", "Mónica"],
              ["Fecha de nacimiento", "10/11/1972"],
              ["Lugar de nacimiento", "Sogamoso (Boyacá)"],
              ["Estatura", "1,60 m"],
              ["Grupo sanguíneo y factor", "A positivo"],
              ["Sexo", "F"],
              ["Fecha y lugar de expedición", "22/11/1990 · Sogamoso"]
            ] },
            { nota: "Copia simple aportada por la solicitante. Número sintético: no corresponde a una cédula real." }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Dictamen previo de túnel carpiano (2022) */
    CAR: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de calificación del origen y de la pérdida de capacidad laboral y ocupacional · primera oportunidad",
        emisor: { n: "ARL SURA", area: "Medicina laboral", ciudad: "Tunja", id: "NIT SIM-800.256.433-1" },
        numero: "CAR-L03",
        fecha: "19/04/2022",
        version: "v1",
        estadoNota: "Copia del archivo de medicina laboral de ARL SURA, con la anotación de firmeza del 06/05/2022 y de la indemnización reconocida.",
        paginas: [
          { titulo: "Dictamen", bloques: [
            { kv: [
              ["Número del dictamen", "CAR-L03"],
              ["Fecha del dictamen", "19/04/2022"],
              ["Tipo de calificación", "Origen, pérdida de capacidad laboral y ocupacional y fecha de estructuración, en primera oportunidad"],
              ["Entidad calificadora", "ARL SURA · Medicina laboral · Tunja"],
              ["Manual aplicado", "Decreto 1507 de 2014, Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional"],
              ["Diagnóstico calificado", "G56.0 · Síndrome del túnel carpiano, bilateral"],
              ["Alcance", "Califica solo el síndrome del túnel carpiano bilateral. No califica otras patologías."],
              ["Motivo", "Reporte de presunta enfermedad laboral de la IPS Neuroeje Peñas Altas del 15/02/2021, con mejoría médica máxima documentada el 19/01/2022"],
              ["Valoración presencial", "28/03/2022, Sogamoso"],
              ["Código de verificación", "SIM-VER-3C81-0D44"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Mónica Beltrán Rivas"],
              ["Documento", "C.C. SIM-46.372.518"],
              ["Fecha de nacimiento", "10/11/1972"],
              ["Edad", "49 años"],
              ["Sexo", "Femenino"],
              ["Residencia", "Sogamoso, Boyacá"],
              ["Escolaridad", "Bachiller, con formación técnica en operación de maquinaria amarilla"],
              ["Dominancia", "Diestra"],
              ["Afiliación a la ARL", "ARL SURA · SIM-ARL-2013-61942"],
              ["EPS", "EPS SURA · SIM-EPS-1999-227315"],
              ["Fondo de pensiones", "Cordillera Pensiones y Cesantías · SIM-AFP-1994-118306"],
              ["Empleador", "Carbones Mesa Umbral · NIT SIM-900.618.274-3"],
              ["Cargo", "Operadora de cargador frontal y retroexcavadora, Tópaga, patio de despacho, desde el 01/01/2013"]
            ] },
            { h: "Antecedentes laborales" },
            { tabla: { cols: ["Período", "Empresa y centro de trabajo", "Cargo", "Exposición relevante"], filas: [
              ["01/01/1993 a 31/12/2002", "Carbones Cuesta de Niebla · Sogamoso, patio de acopio", "Auxiliar de patio", "Herramientas manuales (pala, pica, rastrillo) y sacos de 10 a 18 kg; 2 h acumuladas de manipulación por turno de 8 h"],
              ["01/03/2003 a 31/12/2012", "Carbones Ventana Alta · Nobsa, frente y patio de carbón", "Operadora de cargador frontal", "Palancas y volante 4,5 h efectivas por turno de 8 h; piso granular irregular"],
              ["01/01/2013 a la fecha", "Carbones Mesa Umbral · Tópaga, patio de despacho", "Operadora de cargador frontal y retroexcavadora", "Mandos 5 h por turno de 8 h; agarre repetido de palancas y flexión sostenida de muñeca"]
            ], nota: "Sin vínculo registrado en enero y febrero de 2003. Las tareas de los dos primeros empleadores se reconstruyen con sus fichas de cargo; no hay mediciones de esos puestos." } },
            { h: "Fundamentos de hecho" },
            { p: "Mujer de 49 años, diestra, con 29 años de trabajo en minería de carbón: 10 como auxiliar de patio con herramientas manuales y 19 como operadora de cargador frontal y retroexcavadora. Consultó el 12/11/2020 por adormecimiento y hormigueo nocturno en ambas manos, de predominio derecho. La electromiografía y las neuroconducciones del 09/02/2021 mostraron neuropatía del nervio mediano en el carpo bilateral: moderada a severa a la derecha y moderada a la izquierda." },
            { p: "El 13/04/2021 se practicó liberación abierta del túnel del carpo derecho, con 30 días de incapacidad (13/04/2021 a 12/05/2021) y 12 sesiones de terapia de mano entre mayo y junio de 2021. La neuroconducción de control del 12/01/2022 muestra mejoría a la derecha, con compromiso residual leve y secuela axonal (amplitud sensitiva disminuida y reinervación crónica del abductor corto del pulgar), y compromiso moderado persistente a la izquierda. La fisiatría del 19/01/2022 documenta secuela sensitiva en los dedos 1 a 3 de la mano derecha y síntomas activos en la izquierda; la paciente aplaza la cirugía izquierda y se considera alcanzada la mejoría médica máxima con el tratamiento instaurado (férula nocturna y ajustes de la tarea)." },
            { p: "Continúa como operadora de cargador frontal con recomendaciones: pausas activas cada hora, rotación con tareas sin agarre sostenido y no usar herramientas manuales vibrátiles." },
            { h: "Diagnósticos" },
            { tabla: { cols: ["CIE-10", "Diagnóstico", "Origen", "Se califica"], filas: [
              ["G56.0", "Síndrome del túnel carpiano bilateral; mano derecha operada el 13/04/2021", "Laboral (se determina en este dictamen)", "Sí"]
            ], nota: "No se registran otras patologías de miembros superiores ni de columna en la fecha de la calificación." } }
          ] },
          { titulo: "Calificación del origen", bloques: [
            { p: "El síndrome del túnel carpiano figura en la tabla de enfermedades laborales del Decreto 1477 de 2014 para la exposición a movimientos repetitivos, posturas forzadas de muñeca y fuerza de agarre. La guía de atención integral basada en la evidencia para desórdenes musculoesqueléticos de miembros superiores relacionados con movimientos repetitivos (Resolución 2844 de 2007) reconoce esos factores como asociados al síndrome." },
            { tabla: { cols: ["Factor", "Evidencia", "Valoración"], filas: [
              ["Agarre repetido de palancas y flexión sostenida de muñeca", "Análisis de puesto cualitativo de Carbones Mesa Umbral del 30/06/2021: 5 h de operación de mandos por turno, ciclos de cargue de 40 a 50 segundos, muñeca derecha en flexión de 20° a 40° durante la mayor parte del ciclo", "Exposición suficiente"],
              ["Fuerza y herramientas manuales", "Ficha de cargo de Carbones Cuesta de Niebla: pala, pica y sacos de 10 a 18 kg durante 10 años", "Exposición previa relevante"],
              ["Tiempo de exposición", "29 años en tareas con exigencia de mano y muñeca", "Suficiente"],
              ["Factores no laborales", "IMC 27,4; sin diabetes, hipotiroidismo, artritis inflamatoria ni fracturas de muñeca; glucemia y hormona estimulante de tiroides normales (febrero de 2021)", "No explican el cuadro"]
            ] } },
            { p: "Conclusión: enfermedad laboral, conforme a la definición del artículo 4 de la Ley 1562 de 2012." }
          ] },
          { titulo: "Título I · Valoración de las deficiencias", bloques: [
            { tabla: { cols: ["Deficiencia", "Capítulo", "Hallazgos que la sustentan", "Extremidad superior (%)", "Global (%)"], filas: [
              ["Mano derecha (dominante): neuropatía del mediano en el carpo, operada", "14 · Extremidades superiores, neuropatía por atrapamiento", "Pruebas: pérdida axonal residual en el control del 12/01/2022 (latencias de 3,9 y 4,6 ms, amplitud sensitiva de 14 µV, reinervación crónica del abductor corto del pulgar). Historia: síntomas sensitivos constantes en los dedos 1 a 3. Examen: abductor corto del pulgar 4+/5; monofilamento 3,61. Escala funcional: QuickDASH 63,6", "8", "5,00"],
              ["Mano izquierda: neuropatía del mediano en el carpo, no operada", "14 · Extremidades superiores, neuropatía por atrapamiento", "Pruebas: retardo de la conducción sensitiva y motora en el control del 12/01/2022 (latencias de 4,3 y 5,2 ms; amplitud sensitiva de 11 µV). Historia: síntomas nocturnos frecuentes, intermitentes. Examen: hipoestesia en el territorio del mediano, Phalen y Tinel positivos, fuerza conservada. Escala funcional: QuickDASH 63,6", "6", "4,00"]
            ], nota: "En la tabla de neuropatías por atrapamiento, la severidad resulta del promedio de los hallazgos en las pruebas, la historia y el examen físico, y la escala funcional fija el valor dentro del rango: la derecha queda en el rango más alto con su valor central (8 %) y la izquierda en el rango intermedio con su valor superior (6 %). La deficiencia de la extremidad superior se convierte a deficiencia global con el factor 0,6, redondeado al entero: 8 % → 5 % (4,8); 6 % → 4 % (3,6)." } },
            { h: "Combinación de las deficiencias" },
            { tabla: { cols: ["Paso", "Valores que se combinan", "Cálculo", "Resultado (%)"], filas: [
              ["1", "5,00 y 4,00", "5,00 + 4,00 × (100 − 5,00) / 100", "8,80"]
            ], nota: "Fórmula de combinación del Decreto 1507 de 2014: A + B × (100 − A) / 100, de mayor a menor valor." } },
            { kv: [
              ["Valor final de las deficiencias", "8,80 %"],
              ["Título I ponderado al 50 %", "4,40 %"]
            ] }
          ] },
          { titulo: "Título II y concepto final", bloques: [
            { h: "Título II · Valoración del rol laboral, rol ocupacional y otras áreas ocupacionales" },
            { p: "Valoración realizada por terapia ocupacional el 28/03/2022, con entrevista, observación de actividades y revisión del análisis de puesto de la empresa del 30/06/2021." },
            { tabla: { cols: ["Rol laboral", "Criterio aplicado", "Valor (%)", "Máximo (%)"], filas: [
              ["Restricciones del rol laboral", "Desempeña su oficio de operadora con recomendaciones de pausas y rotación de tareas", "5,00", "25,00"],
              ["Autosuficiencia económica", "Autosuficiente: conserva el empleo y el salario", "0,00", "2,50"],
              ["Edad", "49 años", "1,50", "2,50"],
              ["Subtotal", "Suma de los tres componentes", "6,50", "30,00"]
            ] } },
            { tabla: { cols: ["Otras áreas ocupacionales", "Actividades con dificultad", "Valor (%)", "Máximo (%)"], filas: [
              ["Aprendizaje y aplicación del conocimiento", "Escribir a mano por tiempo prolongado", "0,30", "4,00"],
              ["Comunicación", "Uso prolongado del teléfono y del teclado", "0,40", "4,00"],
              ["Movilidad", "Uso fino de la mano, levantar y llevar objetos, manipular herramientas, sostener el volante por tiempo prolongado", "2,00", "4,00"],
              ["Autocuidado personal", "Abotonarse, peinarse, cortar los alimentos", "1,20", "4,00"],
              ["Vida doméstica", "Lavar y escurrir ropa a mano, picar alimentos, escurrir el trapero", "1,40", "4,00"],
              ["Subtotal", "Suma de las cinco áreas", "5,30", "20,00"]
            ], nota: "Cada área suma diez actividades calificadas de 0 a 0,4 según el grado de dificultad." } },
            { kv: [["Total Título II", "11,80 %"]] },
            { h: "Concepto final" },
            { tabla: { cols: ["Componente", "Valor (%)"], filas: [
              ["Título I · Deficiencias, ponderado al 50 %", "4,40"],
              ["Título II · Rol laboral, rol ocupacional y otras áreas ocupacionales", "11,80"],
              ["Pérdida de capacidad laboral y ocupacional", "16,20"]
            ] } },
            { kv: [
              ["Pérdida de capacidad laboral", "16,20 %"],
              ["Origen", "Laboral · enfermedad laboral"],
              ["Diagnóstico calificado", "G56.0 · Síndrome del túnel carpiano, bilateral"],
              ["Fecha de estructuración", "19/01/2022"],
              ["Requiere ayuda de otra persona para las actividades básicas", "No"],
              ["Requiere ayuda de otra persona para tomar decisiones", "No"]
            ] },
            { h: "Fundamento de la fecha de estructuración" },
            { p: "Se fija el 19/01/2022, fecha de la valoración por fisiatría que, con la neuroconducción de control del 12/01/2022, documenta la secuela estable de la mano derecha operada y el compromiso persistente de la izquierda, terminados la cirugía y la terapia de mano." },
            { h: "Fundamentos de derecho" },
            { lista: [
              "Ley 100 de 1993, art. 41, modificado por el Decreto Ley 019 de 2012, art. 142.",
              "Ley 776 de 2002, prestaciones económicas del Sistema General de Riesgos Laborales.",
              "Ley 1562 de 2012, art. 4: definición de enfermedad laboral.",
              "Decreto 1477 de 2014: tabla de enfermedades laborales.",
              "Decreto 1507 de 2014: Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional."
            ] },
            { h: "Notificación y recursos" },
            { p: "Este dictamen se notifica a la persona calificada y se comunica a Carbones Mesa Umbral, a EPS SURA y a Cordillera Pensiones y Cesantías. Cualquiera de ellos puede manifestar su inconformidad ante ARL SURA dentro de los 10 días hábiles siguientes a la notificación; en ese caso, ARL SURA remitirá el expediente a la Junta Regional de Calificación de Invalidez de Boyacá. Si nadie manifiesta inconformidad dentro del término, el dictamen queda en firme." },
            { p: "Las prestaciones económicas que se deriven de este dictamen se tramitan por separado ante Prestaciones económicas de ARL SURA." },
            { firma: { nombre: "Hernando Iván Sáchica Rojas", cargo: "Médico especialista en medicina del trabajo · ARL SURA", registro: "Registro médico SIM-RM-15-1104", fecha: "19/04/2022" } },
            { firma: { nombre: "Claudia Patricia Avendaño Mesa", cargo: "Terapeuta ocupacional, especialista en seguridad y salud en el trabajo · ARL SURA", registro: "Tarjeta profesional SIM-TO-3307", fecha: "19/04/2022" } },
            { nota: "Notificado personalmente a la persona calificada el 21/04/2022 (acta SIM-NOT-2022-01562). Comunicado el mismo día al empleador, a EPS SURA y al fondo de pensiones." }
          ] },
          { titulo: "Anexo 1 · Documentos y pruebas valorados", bloques: [
            { tabla: { cols: ["Documento", "Fecha", "Emisor", "Hallazgo relevante"], filas: [
              ["Electromiografía y neuroconducciones de miembros superiores", "09/02/2021", "IPS Neuroeje Peñas Altas", "Mediano en el carpo: derecho moderado a severo; izquierdo moderado"],
              ["Reporte de presunta enfermedad laboral", "15/02/2021", "IPS Neuroeje Peñas Altas", "Síndrome del túnel carpiano bilateral en operadora de maquinaria"],
              ["Descripción quirúrgica", "13/04/2021", "IPS Neuroeje Peñas Altas", "Liberación abierta del túnel del carpo derecho"],
              ["Certificado de incapacidad SIM-IT-2021-208114", "13/04/2021", "IPS Neuroeje Peñas Altas", "30 días, del 13/04/2021 al 12/05/2021"],
              ["Informe de terapia de mano", "25/06/2021", "IPS Neuroeje Peñas Altas", "12 sesiones; mejoría parcial de fuerza y sensibilidad"],
              ["Análisis de puesto de trabajo cualitativo", "30/06/2021", "Carbones Mesa Umbral, SG-SST", "Operación de mandos 5 h por turno; agarre repetido y flexión de muñeca"],
              ["Neuroconducción de control", "12/01/2022", "IPS Neuroeje Peñas Altas", "Derecho residual leve, con secuela axonal; izquierdo moderado"],
              ["Valoración por fisiatría", "19/01/2022", "IPS Neuroeje Peñas Altas", "Mejoría médica máxima; secuela sensitiva derecha; síntomas activos izquierdos"],
              ["Fichas de cargo de empleadores anteriores", "Sin fecha", "Carbones Cuesta de Niebla y Carbones Ventana Alta", "Tareas descritas, sin mediciones"],
              ["Valoración presencial y de terapia ocupacional", "28/03/2022", "ARL SURA, medicina laboral", "Examen y pruebas funcionales (anexo 2)"]
            ] } }
          ] },
          { titulo: "Anexo 2 · Valoración presencial del 28/03/2022", bloques: [
            { h: "Examen físico" },
            { lista: [
              "Mano derecha: cicatriz palmar de 3 cm, sana, levemente sensible a la presión. Hipoestesia en los pulpejos del pulgar, el índice y el medio. Sin atrofia tenar. Abductor corto del pulgar 4+/5.",
              "Mano izquierda: Phalen positivo a los 25 segundos; Tinel positivo en el carpo. Hipoestesia en el territorio del mediano. Trofismo tenar conservado. Abductor corto del pulgar 5/5.",
              "Arcos de movilidad de muñecas y dedos completos. Spurling negativo y reflejos simétricos: sin signos de compromiso radicular cervical."
            ] },
            { h: "Pruebas funcionales" },
            { tabla: { cols: ["Prueba", "Derecha", "Izquierda", "Referencia"], filas: [
              ["Dinamometría de agarre (kg)", "16", "18", "Cerca de 25 para mujeres de su edad"],
              ["Pinza lateral (kg)", "5,0", "5,5", "Cerca de 7"],
              ["Prueba de las nueve clavijas (s)", "22", "21", "Cerca de 18"],
              ["Monofilamento de Semmes-Weinstein, territorio del mediano", "3,61", "3,61", "2,83"],
              ["Discriminación de dos puntos (mm)", "7", "6", "Menos de 6"]
            ] } },
            { kv: [["QuickDASH (0 a 100)", "63,6"]] },
            { h: "Entrevista ocupacional" },
            { p: "Opera cargador frontal con pausas activas cada hora y alterna con tareas de registro en el patio. Refiere adormecimiento constante de los dedos de la mano derecha, adormecimiento de la izquierda al final del turno y al despertar, y que el dolor la despierta varias noches por semana; usa férula nocturna en la mano izquierda. En casa tiene dificultad para escurrir ropa, picar alimentos, abrir frascos, cargar las bolsas del mercado y abotonarse." },
            { firma: { nombre: "Claudia Patricia Avendaño Mesa", cargo: "Terapeuta ocupacional · ARL SURA", registro: "Tarjeta profesional SIM-TO-3307", fecha: "28/03/2022" } }
          ] },
          { titulo: "Anotaciones del archivo de medicina laboral", bloques: [
            { kv: [
              ["Estado del dictamen", "En firme desde el 06/05/2022: ningún interesado manifestó inconformidad dentro del término (constancia SIM-ARL-CF-2022-0587 del 10/05/2022)"],
              ["Prestación derivada", "Indemnización por incapacidad permanente parcial reconocida por Prestaciones económicas en la resolución SIM-ARL-IPP-2022-0731 del 14/06/2022 y pagada el 28/06/2022"],
              ["Alcance", "Califica solo el síndrome del túnel carpiano bilateral (G56.0). No incluye la columna lumbar."],
              ["Revisión de la calificación", "No se ha solicitado revisión de este dictamen"]
            ] },
            { nota: "Anotaciones del archivo de medicina laboral de ARL SURA. No modifican el contenido del dictamen." },
            { firma: { nombre: "Yaneth Rocío Barrera Suárez", cargo: "Gestora documental, medicina laboral · ARL SURA", fecha: "28/06/2022" } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Dictamen integral de la Junta Regional (copia auténtica, apelado) */
    REG: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de calificación del origen y de la pérdida de capacidad laboral y ocupacional · copia auténtica",
        emisor: { n: "Junta Regional de Calificación de Invalidez de Boyacá", area: "Sala de Decisión Dos", ciudad: "Tunja", id: "NIT SIM-820.004.316-8" },
        numero: "REG-L03",
        fecha: "16/09/2025",
        version: "v1",
        estadoNota: "Copia auténtica expedida el 08/10/2025, con constancia del estado del trámite: apelado por la persona calificada el 22/09/2025, sin firmeza.",
        paginas: [
          { titulo: "Dictamen · información general", bloques: [
            { kv: [
              ["Dictamen", "REG-L03"],
              ["Fecha del dictamen", "16/09/2025"],
              ["Expediente", "SIM-JRCIB-2024-0873"],
              ["Tipo de calificación", "Origen de la discopatía lumbar; pérdida de capacidad laboral y ocupacional integral; fecha de estructuración"],
              ["Instancia", "Junta Regional · primera instancia"],
              ["Motivo", "Inconformidad de ARL SURA, del 05/08/2024, con la calificación del origen en primera oportunidad de EPS SURA (SIM-EPS-ML-2024-05126, del 01/08/2024), que definió como laboral la discopatía lumbar (M51.3)"],
              ["Entidad que remite", "EPS SURA · Medicina laboral, 21/08/2024"],
              ["Radicación en la Junta", "26/08/2024"],
              ["Solicitud acumulada", "Calificación integral de la pérdida de capacidad laboral pedida directamente a la Junta por la persona calificada el 22/07/2025: pasados 30 días calendario desde la terminación del proceso de rehabilitación (mejoría médica máxima del 18/06/2025) y más de 540 días desde el diagnóstico de la enfermedad lumbar, sin calificación de la pérdida de capacidad laboral en primera oportunidad (Decreto 1352 de 2013, compilado en el Decreto 1072 de 2015). La Sala acumuló la solicitud al expediente de origen"],
              ["Trámite", "El 20/11/2024 la Sala pidió a la persona calificada las fichas de cargo de los empleadores anteriores y a la IPS la historia clínica completa de columna; se allegaron el 28/02/2025"],
              ["Valoración presencial", "26/08/2025, Tunja"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Mónica Beltrán Rivas"],
              ["Identificación", "C.C. SIM-46.372.518"],
              ["Fecha de nacimiento", "10/11/1972"],
              ["Edad a la fecha del dictamen", "52 años"],
              ["Sexo", "Femenino"],
              ["Escolaridad", "Bachiller, con formación técnica en operación de maquinaria amarilla"],
              ["Dominancia", "Diestra"],
              ["Residencia", "Sogamoso, Boyacá"],
              ["Ocupación habitual", "Operadora de cargador frontal y retroexcavadora"],
              ["Ocupación actual", "Auxiliar de control de pesaje, báscula exterior de Tópaga, en reubicación desde el 01/02/2024"],
              ["Empleador", "Carbones Mesa Umbral · NIT SIM-900.618.274-3"],
              ["Administradora de riesgos laborales", "ARL SURA, desde el 01/01/2013"]
            ] },
            { h: "Antecedentes laborales" },
            { tabla: { cols: ["Período", "Empresa y centro de trabajo", "Cargo", "Exposición descrita"], filas: [
              ["01/01/1993 a 31/12/2002", "Carbones Cuesta de Niebla · Sogamoso, patio de acopio (CIIU 0510)", "Auxiliar de patio", "Herramientas manuales y sacos de 10 a 18 kg; 2 h acumuladas de manipulación por turno de 8 h"],
              ["01/03/2003 a 31/12/2012", "Carbones Ventana Alta · Nobsa, frente y patio de carbón (CIIU 0510)", "Operadora de cargador frontal", "Palancas 4,5 h efectivas por turno de 8 h; piso granular irregular; cargas repetidas de material"],
              ["01/01/2013 a 31/01/2024", "Carbones Mesa Umbral · Tópaga, patio de despacho (CIIU 0510)", "Operadora de cargador frontal y retroexcavadora", "Mandos 5 h por turno de 8 h; tolva, reversa y rampas. Medición del 23/08/2023: A(8) 0,61 m/s² de vibración de cuerpo entero"],
              ["01/02/2024 a la fecha", "Carbones Mesa Umbral · Tópaga, báscula exterior (CIIU 0510)", "Auxiliar de control de pesaje", "Sin conducción de maquinaria ni levantamiento de cargas; alterna posturas"]
            ], nota: "Sin vínculo registrado en enero y febrero de 2003. Las mediciones disponibles corresponden solo al puesto de Tópaga en 2023." } },
            { h: "Calificaciones anteriores" },
            { tabla: { cols: ["Entidad", "Documento", "Fecha", "Objeto", "Resultado", "Estado"], filas: [
              ["ARL SURA", "CAR-L03", "19/04/2022", "Origen y pérdida de capacidad laboral del túnel carpiano bilateral (G56.0)", "Laboral · 16,20 % · estructuración 19/01/2022", "En firme desde el 06/05/2022"],
              ["EPS SURA", "SIM-EPS-ML-2024-05126", "01/08/2024", "Origen de la discopatía lumbar (M51.3)", "Laboral", "Controvertido por ARL SURA el 05/08/2024"]
            ] } }
          ] },
          { titulo: "Fundamentos de hecho y pruebas", bloques: [
            { h: "Documentos y pruebas que obran en el expediente" },
            { lista: [
              "Dictamen de origen SIM-EPS-ML-2024-05126 de EPS SURA, del 01/08/2024, y escrito de inconformidad de ARL SURA del 05/08/2024.",
              "Dictamen CAR-L03 de ARL SURA, del 19/04/2022, con su anotación de firmeza.",
              "Análisis de puesto de trabajo SIM-SST-APT-2024-019 de Carbones Mesa Umbral, versión 2 del 12/07/2024, con el informe de medición de vibración de cuerpo entero SIM-HI-2023-0412 (23/08/2023).",
              "Historia clínica de EPS SURA y de la IPS Neuroeje Peñas Altas: consultas de columna desde el 21/06/2023, resonancia magnética lumbar del 22/09/2023, rehabilitación lumbar de 2024, concepto de cirugía de columna del 08/04/2025, electromiografía de miembros inferiores del 05/06/2025 y valoración por fisiatría del 18/06/2025.",
              "Recomendaciones laborales de EPS SURA del 15/01/2024 y del 28/06/2024, y constancia de reubicación del empleador.",
              "Fichas de cargo de Carbones Cuesta de Niebla y Carbones Ventana Alta."
            ] },
            { h: "Historia clínica pertinente" },
            { p: "Columna. Consultó el 21/06/2023 por dolor lumbar de cinco meses con irradiación a la pierna izquierda. La resonancia magnética del 22/09/2023 mostró discopatía degenerativa de L3–L4 a L5–S1, con hernia discal L4–L5 que estrecha ambos recesos laterales y los forámenes, y protrusión L5–S1 con contacto de la raíz S1 izquierda. Tuvo incapacidades de 5 y 7 días en junio y noviembre de 2023. Desde el 01/02/2024 trabaja en la báscula, con restricciones. Entre febrero y abril de 2024 cumplió 16 sesiones de rehabilitación lumbar. El 08/04/2025 cirugía de columna no indicó tratamiento quirúrgico. La electromiografía del 05/06/2025 documenta radiculopatía L5 bilateral crónica, de predominio izquierdo, y radiculopatía S1 izquierda leve. En la valoración por fisiatría del 18/06/2025 se considera alcanzada la mejoría médica máxima: índice de Oswestry de 46 %; la paciente refiere tolerar 40 minutos sentada y caminar unos 500 m." },
            { p: "Manos. Túnel carpiano bilateral calificado por ARL SURA en 2022, con la mano derecha operada en 2021. El expediente no contiene estudios de las manos posteriores a la neuroconducción del 12/01/2022; la nota de fisiatría del 18/06/2025 menciona atrofia tenar izquierda incipiente y la orden de una neuroconducción de control, sin resultado aportado." },
            { p: "Otros. Gonartrosis primaria bilateral leve (radiografía del 12/03/2024, grado 2 de Kellgren y Lawrence), en seguimiento por ortopedia con ejercicio, sin limitación de los arcos de movilidad. Sin otras enfermedades crónicas." },
            { h: "Valoración presencial del 26/08/2025" },
            { kv: [
              ["Síntomas", "Dolor lumbar continuo (6 de 10 en la escala visual análoga) con irradiación a ambas piernas, mayor en la izquierda; adormecimiento de las manos al despertar"],
              ["Columna lumbar", "Flexión 40° y extensión 10°, con dolor. Lasègue izquierdo positivo a 50°, derecho negativo. Hipoestesia en el dorso del pie izquierdo. Extensor largo del hallux izquierdo 4/5. Reflejos aquilianos simétricos"],
              ["Manos", "Cicatriz palmar derecha sana; hipoestesia en los dedos 1 a 3 de ambas manos; Phalen positivo a la izquierda; atrofia tenar izquierda leve"],
              ["Rodillas", "Crepitación leve, sin derrame ni inestabilidad; arcos completos"],
              ["Marcha y postura", "Marcha antálgica, independiente. Se pone de pie a los 35 minutos de la entrevista por dolor"],
              ["Funcionalidad referida", "Independiente para el autocuidado, con dificultad para ponerse medias y calzado; apoyo familiar para las tareas domésticas pesadas"]
            ] }
          ] },
          { titulo: "Origen de la discopatía lumbar", bloques: [
            { p: "La discopatía lumbar figura en la tabla de enfermedades laborales del Decreto 1477 de 2014 en relación con la vibración de cuerpo entero y la manipulación manual de cargas. La guía de atención integral basada en la evidencia para dolor lumbar inespecífico y enfermedad discal relacionados con la manipulación manual de cargas y otros factores de riesgo en el lugar de trabajo (Resolución 2844 de 2007) incluye la conducción de maquinaria con vibración de cuerpo entero entre esos factores." },
            { tabla: { cols: ["Factor", "Evidencia", "Valoración"], filas: [
              ["Vibración de cuerpo entero", "Medición del 23/08/2023 en el cargador frontal de Tópaga: A(8) de 0,61 m/s² en el eje vertical, por encima del valor de acción de 0,5 m/s²", "Exposición significativa medida"],
              ["Tiempo de operación de maquinaria", "21 años (2003 a 2024), con 4,5 a 5 h efectivas por turno", "Suficiente"],
              ["Manipulación manual de cargas", "10 años como auxiliar de patio, sacos de 10 a 18 kg, 2 h por turno", "Exposición previa relevante"],
              ["Posturas", "Sedestación prolongada, rotación de tronco en reversa, ascenso y descenso de la cabina", "Concurrentes"],
              ["Factores no laborales", "IMC 28,1; sin trauma lumbar; sin enfermedad reumatológica", "No explican el cuadro"]
            ] } },
            { p: "La Sala ratifica el origen laboral de la discopatía lumbar, conforme al artículo 4 de la Ley 1562 de 2012. El origen laboral del túnel carpiano bilateral quedó en firme con el dictamen CAR-L03 y no es objeto de esta controversia. La gonartrosis bilateral leve es de origen común." }
          ] },
          { titulo: "Calificación · Título I · Deficiencias", bloques: [
            { p: "Calificación integral según el Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional (Decreto 1507 de 2014). Se valoran todas las deficiencias actuales; no se suma el porcentaje del dictamen CAR-L03." },
            { tabla: { cols: ["Diagnóstico", "CIE-10", "Origen", "Capítulo", "Clase o valor de la extremidad", "Deficiencia global"], filas: [
              ["Discopatía lumbar degenerativa L3–L4 a L5–S1 con radiculopatía", "M51.3", "Laboral", "15 · Columna lumbar", "Clase 4, grado A", "25,00 %"],
              ["Síndrome del túnel carpiano, mano derecha operada", "G56.0", "Laboral", "14 · Extremidades superiores", "Extremidad superior 8 %", "5,00 %"],
              ["Síndrome del túnel carpiano, mano izquierda", "G56.0", "Laboral", "14 · Extremidades superiores", "Extremidad superior 6 %", "4,00 %"],
              ["Gonartrosis primaria bilateral leve", "M17.0", "Común", "14 · Extremidades inferiores", "Clase 0", "0,00 %"]
            ] } },
            { h: "Columna lumbar: clase y factores moduladores" },
            { tabla: { cols: ["Elemento", "Hallazgo", "Clase"], filas: [
              ["Diagnóstico y estudios (definen la clase)", "Discopatía en tres niveles con radiculopatía L5 bilateral y S1 izquierda documentada por electromiografía", "4"],
              ["Historia funcional", "Índice de Oswestry de 46 % (fisiatría, 18/06/2025); tolerancia referida a la sedestación de 40 minutos", "3"],
              ["Examen físico", "Lasègue izquierdo positivo; hipoestesia L5 izquierda; extensor largo del hallux izquierdo 4/5", "3"]
            ], nota: "Ajuste neto: (3 − 4) + (3 − 4) = −2. Grado A de la clase 4: 25,00 %." } },
            { h: "Manos" },
            { p: "Sin estudios de las manos posteriores a 2022 en el expediente, la Sala acoge la valoración del dictamen CAR-L03: extremidad superior derecha 8 % e izquierda 6 %, que equivalen a 5 % y 4 % de deficiencia global." },
            { h: "Combinación de las deficiencias" },
            { tabla: { cols: ["Paso", "Valores que se combinan", "Cálculo", "Resultado (%)"], filas: [
              ["1", "25,00 y 5,00", "25,00 + 5,00 × (100 − 25,00) / 100", "28,75"],
              ["2", "28,75 y 4,00", "28,75 + 4,00 × (100 − 28,75) / 100", "31,60"]
            ], nota: "Fórmula de combinación del Decreto 1507 de 2014: A + B × (100 − A) / 100, de mayor a menor valor. La gonartrosis no aporta deficiencia." } },
            { kv: [
              ["Deficiencia global (Título I)", "31,60 %"],
              ["Valor ponderado de las deficiencias (50 %)", "15,80 %"]
            ] }
          ] },
          { titulo: "Calificación · Título II · Rol laboral, rol ocupacional y otras áreas ocupacionales", bloques: [
            { tabla: { cols: ["Componente", "Criterio aplicado", "Valor"], filas: [
              ["Restricciones del rol laboral", "No puede desempeñar su oficio de operadora de maquinaria pesada; reubicada en un cargo distinto, con restricciones permanentes para conducir y levantar peso", "20,00 %"],
              ["Autosuficiencia económica", "Conserva el salario por la reubicación, con gastos adicionales de transporte y tratamiento", "1,50 %"],
              ["Edad", "52 años", "2,00 %"],
              ["Subtotal rol laboral", "Suma de los tres componentes", "23,50 %"]
            ] } },
            { h: "Otras áreas ocupacionales" },
            { tabla: { cols: ["Área", "Dificultades registradas", "Valor"], filas: [
              ["Aprendizaje y aplicación del conocimiento", "Escribir a mano por tiempo prolongado; sostener la atención con dolor", "0,40 %"],
              ["Comunicación", "Uso prolongado del teléfono y del teclado", "0,60 %"],
              ["Movilidad", "Mantener la posición sentada, caminar distancias largas, levantar y llevar objetos, uso fino de la mano, conducir", "3,00 %"],
              ["Autocuidado", "Ponerse medias y calzado, lavarse los pies, abotonarse", "1,80 %"],
              ["Vida doméstica", "Barrer y trapear, lavar ropa, cargar compras, picar alimentos", "2,50 %"],
              ["Total otras áreas ocupacionales", "Suma de las cinco áreas", "8,30 %"]
            ] } },
            { kv: [
              ["Rol laboral", "23,50 %"],
              ["Otras áreas ocupacionales", "8,30 %"],
              ["Total Título II", "31,80 %"]
            ] }
          ] },
          { titulo: "Concepto final y decisión", bloques: [
            { kv: [
              ["Valor ponderado de las deficiencias (Título I)", "15,80 %"],
              ["Rol laboral, rol ocupacional y otras áreas ocupacionales (Título II)", "31,80 %"],
              ["Pérdida de capacidad laboral y ocupacional integral", "47,60 %"],
              ["Origen", "Enfermedad laboral · M51.3 y G56.0"],
              ["Antecedente común considerado", "Gonartrosis primaria bilateral leve (M17.0), sin deficiencia calificable"],
              ["Fecha de estructuración", "18/06/2025"],
              ["Requiere ayuda de terceros para las actividades básicas", "No"],
              ["Requiere ayuda de terceros para tomar decisiones", "No"]
            ] },
            { h: "Sustentación" },
            { p: "Fecha de estructuración. Se fija el 18/06/2025, fecha de la valoración por fisiatría que documenta la mejoría médica máxima de la columna lumbar con radiculopatía bilateral, terminada la rehabilitación. A esa fecha concurren las deficiencias de la columna y de ambas manos que integran esta calificación." },
            { p: "Relación con el dictamen de 2022. El dictamen CAR-L03 calificó solo el túnel carpiano bilateral, con 16,20 %, y está en firme. Esta calificación es integral: valora el estado actual de todas las deficiencias y no suma ni reemplaza aquel porcentaje." },
            { h: "Fundamentos de derecho" },
            { lista: [
              "Ley 100 de 1993, artículo 41, modificado por el artículo 142 del Decreto Ley 019 de 2012.",
              "Ley 776 de 2002 y Ley 1562 de 2012.",
              "Decreto 1352 de 2013, compilado en el Decreto 1072 de 2015: organización y funcionamiento de las juntas de calificación de invalidez.",
              "Decreto 1477 de 2014: tabla de enfermedades laborales.",
              "Decreto 1507 de 2014: Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional."
            ] },
            { h: "Decisión" },
            { p: "Primero. Ratificar el origen laboral de la discopatía lumbar degenerativa (M51.3) calificado en primera oportunidad por EPS SURA." },
            { p: "Segundo. Calificar a Mónica Beltrán Rivas con una pérdida de capacidad laboral y ocupacional integral de 47,60 %, de origen laboral, con fecha de estructuración del 18/06/2025." },
            { p: "Tercero. Notificar este dictamen a la persona calificada y comunicarlo a ARL SURA, a EPS SURA, a Carbones Mesa Umbral y a Cordillera Pensiones y Cesantías." },
            { p: "Cuarto. Contra este dictamen proceden los recursos de reposición y de apelación, que pueden presentarse ante esta Junta dentro de los 10 días hábiles siguientes a su notificación. La apelación la resuelve la Junta Nacional de Calificación de Invalidez." },
            { firma: { nombre: "Álvaro Enrique Pesca Salamanca", cargo: "Médico ponente · Sala de Decisión Dos", registro: "Registro médico SIM-RM-15-0912", fecha: "16/09/2025" } },
            { firma: { nombre: "Luz Marina Cárdenas Ochoa", cargo: "Médica integrante · Sala de Decisión Dos", registro: "Registro médico SIM-RM-15-1236", fecha: "16/09/2025" } },
            { firma: { nombre: "Yolanda Patricia Rincón Fagua", cargo: "Terapeuta ocupacional integrante · Sala de Decisión Dos", registro: "Tarjeta profesional SIM-TO-0861", fecha: "16/09/2025" } },
            { nota: "Notificado a la persona calificada el 18/09/2025. Comunicado a ARL SURA, a EPS SURA y a Cordillera Pensiones y Cesantías el 17/09/2025 y a Carbones Mesa Umbral el 18/09/2025." }
          ] },
          { titulo: "Constancia de autenticidad y estado del trámite", bloques: [
            { p: "La Secretaría de la Junta Regional de Calificación de Invalidez de Boyacá hace constar que la presente es copia auténtica y completa del dictamen REG-L03 del 16/09/2025, que reposa en el expediente SIM-JRCIB-2024-0873." },
            { kv: [
              ["Dictamen", "REG-L03 · 16/09/2025"],
              ["Notificación a la persona calificada", "18/09/2025"],
              ["Recurso interpuesto", "Apelación de la persona calificada, radicada el 22/09/2025, dentro del término. Pide que se valoren las limitaciones funcionales de la columna y la progresión de la mano izquierda"],
              ["Otros interesados", "ARL SURA, EPS SURA, Cordillera Pensiones y Cesantías y el empleador no interpusieron recursos"],
              ["Trámite del recurso", "Apelación concedida el 03/10/2025, vencido el término de los demás interesados; expediente remitido a la Junta Nacional de Calificación de Invalidez el 07/10/2025"],
              ["Estado del dictamen", "No está en firme: la decisión sobre el recurso corresponde a la Junta Nacional"],
              ["Copia expedida a solicitud de", "Mónica Beltrán Rivas, persona calificada"],
              ["Fecha de expedición de la copia", "08/10/2025"]
            ] },
            { firma: { nombre: "Martha Cecilia Niño Corredor", cargo: "Secretaria · Junta Regional de Calificación de Invalidez de Boyacá", fecha: "08/10/2025" } },
            { nota: "Esta constancia certifica el estado del trámite en la fecha de expedición. Las decisiones posteriores sobre el recurso deben verificarse con la Junta Nacional de Calificación de Invalidez." }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Dictamen integral de la Junta Nacional (resuelve la apelación) */
    DIC: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de la Junta Nacional de Calificación de Invalidez · recurso de apelación",
        emisor: { n: "Junta Nacional de Calificación de Invalidez", area: "Sala de Decisión Uno", ciudad: "Bogotá D.C.", id: "NIT SIM-830.512.447-0" },
        numero: "DIC-L03",
        fecha: "31/03/2026",
        version: "v1",
        estadoNota: "Ejemplar oficial firmado por la Sala, con código de verificación y sello de notificación del 01/04/2026.",
        paginas: [
          { titulo: "Dictamen · información general", bloques: [
            { kv: [
              ["Dictamen", "DIC-L03"],
              ["Versión", "v1 · única versión expedida"],
              ["Fecha", "31/03/2026"],
              ["Código de verificación", "SIM-VER-JN-5B27-9E13"],
              ["Expediente de la Junta Nacional", "SIM-JNCI-2025-11408"],
              ["Sala", "Sala de Decisión Uno"],
              ["Asunto", "Recurso de apelación contra el dictamen REG-L03 del 16/09/2025 de la Junta Regional de Calificación de Invalidez de Boyacá (expediente SIM-JRCIB-2024-0873)"],
              ["Recurrente", "Mónica Beltrán Rivas, persona calificada · recurso radicado el 22/09/2025"],
              ["Recibo del expediente en la Junta Nacional", "15/10/2025"],
              ["Pruebas allegadas en esta instancia", "Extracto SIM-IPS-RF-2025-0311 de la IPS Neuroeje Peñas Altas, con el informe funcional SIM-IPS-EF-2025-1030 del 30/10/2025 y la neuroconducción de control del 21/10/2025"],
              ["Alcance", "Calificación integral: columna lumbar (M51.3) y túnel carpiano bilateral (G56.0), de origen laboral. Gonartrosis bilateral leve (M17.0), de origen común, como antecedente considerado"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Mónica Beltrán Rivas"],
              ["Identificación", "C.C. SIM-46.372.518"],
              ["Fecha de nacimiento", "10/11/1972"],
              ["Edad a la fecha del dictamen", "53 años"],
              ["Sexo", "Femenino"],
              ["Dominancia", "Diestra"],
              ["Ocupación habitual", "Operadora de cargador frontal y retroexcavadora"],
              ["Ocupación actual", "Auxiliar de control de pesaje, en reubicación desde el 01/02/2024"],
              ["Empleador", "Carbones Mesa Umbral · NIT SIM-900.618.274-3"],
              ["Administradora de riesgos laborales", "ARL SURA"]
            ] },
            { h: "Calificaciones anteriores" },
            { tabla: { cols: ["Instancia", "Documento", "Fecha", "Alcance", "Resultado", "Estado"], filas: [
              ["ARL SURA · primera oportunidad", "CAR-L03", "19/04/2022", "Solo túnel carpiano bilateral (G56.0)", "Laboral · 16,20 % · estructuración 19/01/2022", "En firme desde el 06/05/2022; indemnización por incapacidad permanente parcial reconocida en 2022"],
              ["EPS SURA · primera oportunidad", "SIM-EPS-ML-2024-05126", "01/08/2024", "Origen de la discopatía lumbar (M51.3)", "Laboral", "Controvertido por ARL SURA el 05/08/2024"],
              ["Junta Regional de Boyacá", "REG-L03", "16/09/2025", "Integral: origen de M51.3 y pérdida de capacidad laboral por M51.3 y G56.0", "Laboral · 47,60 % · estructuración 18/06/2025", "Apelado por la persona calificada el 22/09/2025"]
            ] } },
            { h: "Argumentos del recurso" },
            { lista: [
              "La Junta Regional calificó las manos con los estudios de 2022, aunque la nota de fisiatría del 18/06/2025 ya registraba atrofia tenar izquierda.",
              "No se midieron con pruebas las limitaciones para permanecer sentada y para caminar, que son las que más afectan su trabajo en la báscula y su vida diaria.",
              "Pide una valoración funcional y la modificación del porcentaje. No controvierte el origen ni la fecha de estructuración."
            ] },
            { p: "ARL SURA, EPS SURA, Cordillera Pensiones y Cesantías y el empleador no se pronunciaron sobre el recurso." },
            { h: "Pruebas incorporadas en esta instancia" },
            { p: "El 10/11/2025 la recurrente allegó el extracto firmado SIM-IPS-RF-2025-0311 de la IPS Neuroeje Peñas Altas, del 06/11/2025, con el informe funcional del 30/10/2025 y la neuroconducción de control del 21/10/2025. La Sala lo incorporó el 18/11/2025 y corrió traslado a ARL SURA, que no se pronunció." }
          ] },
          { titulo: "Consideraciones de la Sala", bloques: [
            { h: "Alcance de la calificación" },
            { p: "La Sala califica de manera integral el estado actual de la persona: la discopatía lumbar degenerativa (M51.3) y el síndrome del túnel carpiano bilateral (G56.0), ambos de origen laboral. La gonartrosis primaria bilateral leve (M17.0), de origen común, se registra como antecedente considerado: no genera deficiencia calificable y no modifica el resultado." },
            { p: "El dictamen CAR-L03 de 2022 calificó solo el túnel carpiano y está en firme. Su porcentaje no se suma: las secuelas de las manos se valoran aquí en su estado actual, dentro de la calificación integral. Este dictamen no revoca ni modifica el CAR-L03. La indemnización por incapacidad permanente parcial pagada con base en aquel dictamen es un antecedente que la Sala registra; su relación con las prestaciones que se deriven de esta calificación corresponde a la administradora de riesgos laborales." },
            { h: "Origen" },
            { p: "No fue objeto del recurso. Se confirma el origen laboral de la discopatía lumbar ratificado por la Junta Regional, con exposición medida a vibración de cuerpo entero (A(8) de 0,61 m/s² en 2023) y 21 años de operación de maquinaria. El origen laboral del túnel carpiano está en firme desde 2022." },
            { h: "Columna lumbar" },
            { p: "La electromiografía del 05/06/2025 documenta radiculopatía L5 bilateral crónica y S1 izquierda: discopatía en varios niveles con radiculopatía en más de un nivel, que corresponde a la clase 4, como lo estableció la Junta Regional." },
            { p: "El informe funcional del 30/10/2025 mide con pruebas estandarizadas un índice de Oswestry de 62 %, una tolerancia a la sedestación de 25 minutos y una marcha de 360 m en 6 minutos con dos pausas: la historia funcional corresponde a la clase 4. El examen del informe registra Lasègue bilateral, hipoestesia L5 bilateral, debilidad del extensor largo del hallux izquierdo (4/5) y reflejo aquiliano izquierdo disminuido: clase 4. Son los signos que corresponden a la radiculopatía L5 bilateral y S1 izquierda que la electromiografía documentó desde el 05/06/2025; en la valoración de la Junta Regional solo se encontraron los del lado izquierdo. El ajuste neto es 0 y la deficiencia queda en el grado C de la clase 4 (29,00 %)." },
            { p: "La diferencia con el índice de Oswestry de junio de 2025 (46 %) y con las tolerancias de 40 minutos sentada y 500 m de marcha anotadas entonces obedece a la forma de medir: en junio el cuestionario se diligenció en una consulta de control y las tolerancias fueron las que refirió la paciente; en octubre se aplicó dentro de una valoración estandarizada de tres horas, con pruebas medidas de sedestación, marcha y carga. La Sala da mayor peso a la valoración de octubre, que concuerda con el examen físico y con la electromiografía." },
            { h: "Manos" },
            { p: "La neuroconducción del 21/10/2025 muestra en la mano izquierda neuropatía severa del mediano en el carpo, con pérdida axonal: latencia motora distal de 6,6 ms, amplitud motora de 2,4 mV, potencial sensitivo de 5 µV y actividad de denervación en el abductor corto del pulgar. El examen registra atrofia tenar, abductor corto del pulgar 4/5, monofilamento 4,31 y discriminación de dos puntos de 9 mm. La atrofia tenar y la debilidad ya constaban en la valoración por fisiatría del 18/06/2025." },
            { p: "Con pérdida axonal y déficit motor objetivo, la tabla de neuropatías por atrapamiento no recoge la magnitud de la deficiencia de la mano izquierda. La Sala la valora como deficiencia del nervio periférico afectado (mediano por debajo del antebrazo, capítulo 14), combinando el déficit sensitivo, moderado, y el déficit motor, leve: extremidad superior 10 %, deficiencia global 6 %. La paciente ha aplazado la liberación quirúrgica de esa mano, propuesta desde 2022, y con la pérdida axonal la recuperación esperada sería parcial; la Sala califica el estado actual, como lo hizo ARL SURA en 2022." },
            { p: "La mano derecha operada conserva, estable, la secuela de 2022: hipoestesia constante en los dedos 1 a 3, abductor corto del pulgar 4+/5, amplitud sensitiva disminuida (15 µV) y reinervación crónica del abductor corto del pulgar, con QuickDASH de 68,2. Por la tabla de neuropatías por atrapamiento: extremidad superior 8 %, deficiencia global 5 %, el mismo valor de 2022." },
            { h: "Rol laboral y otras áreas ocupacionales" },
            { p: "Se confirman las restricciones del rol laboral (20,00 %), la autosuficiencia económica (1,50 %) y la edad (2,00 %): no puede volver a su oficio y conserva el empleo por la reubicación en la báscula." },
            { p: "El informe funcional documenta dificultades mayores que las registradas por la Junta Regional en movilidad (sedestación, marcha y carga), autocuidado (calzado y aseo de los pies) y vida doméstica, y en la comunicación por teléfono y por mensajes escritos por la debilidad de la mano izquierda. La Sala ajusta las otras áreas ocupacionales a 10,60 %." },
            { h: "Fecha de estructuración" },
            { p: "Con una pérdida del 52,40 %, la fecha de estructuración corresponde al momento en que la persona alcanzó el 50 % de pérdida de capacidad laboral y debe soportarse en la historia clínica y en los exámenes (Decreto 1507 de 2014). La Sala mantiene el 18/06/2025: a esa fecha ya constaban la mejoría médica máxima de la columna, sin indicación quirúrgica; la radiculopatía L5 bilateral y S1 izquierda en la electromiografía del 05/06/2025; y la atrofia tenar con debilidad del abductor corto del pulgar izquierdo. Son los hallazgos que sustentan esta calificación." },
            { p: "Entre junio y octubre de 2025 no hubo tratamiento, intervención ni accidente que cambiara el cuadro. La valoración de octubre mide con pruebas estandarizadas las mismas limitaciones y no muestra un hecho clínico nuevo que justifique otra fecha. La recurrente no controvirtió la fecha de estructuración." }
          ] },
          { titulo: "Calificación · Título I · Deficiencias", bloques: [
            { p: "Calificación integral según el Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional (Decreto 1507 de 2014)." },
            { tabla: { cols: ["Diagnóstico", "CIE-10", "Origen", "Capítulo", "Clase o valor de la extremidad", "Deficiencia global"], filas: [
              ["Discopatía lumbar degenerativa L3–L4 a L5–S1 con radiculopatía L5 bilateral y S1 izquierda", "M51.3", "Laboral", "15 · Columna lumbar", "Clase 4, grado C", "29,00 %"],
              ["Síndrome del túnel carpiano izquierdo, severo, con pérdida axonal (valorado como deficiencia del nervio mediano)", "G56.0", "Laboral", "14 · Extremidades superiores", "Extremidad superior 10 %", "6,00 %"],
              ["Síndrome del túnel carpiano derecho, operado, secuela estable (neuropatía por atrapamiento)", "G56.0", "Laboral", "14 · Extremidades superiores", "Extremidad superior 8 %", "5,00 %"],
              ["Gonartrosis primaria bilateral leve", "M17.0", "Común", "14 · Extremidades inferiores", "Clase 0", "0,00 %"]
            ] } },
            { h: "Columna lumbar: clase y factores moduladores" },
            { tabla: { cols: ["Elemento", "Hallazgo", "Clase"], filas: [
              ["Diagnóstico y estudios (definen la clase)", "Discopatía en tres niveles; radiculopatía L5 bilateral y S1 izquierda en la electromiografía del 05/06/2025", "4"],
              ["Historia funcional", "Oswestry 62 %; sedestación tolerada 25 minutos; marcha de 360 m en 6 minutos con dos pausas (30/10/2025)", "4"],
              ["Examen físico", "Lasègue bilateral; hipoestesia L5 bilateral; extensor largo del hallux izquierdo 4/5; aquiliano izquierdo disminuido", "4"]
            ], nota: "Ajuste neto: (4 − 4) + (4 − 4) = 0. Grado C de la clase 4: 29,00 %." } },
            { h: "Conversión de las extremidades superiores" },
            { p: "Factor 0,6 redondeado al entero: mano izquierda 10 % → 6 %; mano derecha 8 % → 5 %." },
            { h: "Combinación de las deficiencias" },
            { tabla: { cols: ["Paso", "Valores que se combinan", "Cálculo", "Resultado (%)"], filas: [
              ["1", "29,00 y 6,00", "29,00 + 6,00 × (100 − 29,00) / 100", "33,26"],
              ["2", "33,26 y 5,00", "33,26 + 5,00 × (100 − 33,26) / 100", "36,60"]
            ], nota: "El paso 2 da 36,597, redondeado a dos decimales. La gonartrosis no aporta deficiencia." } },
            { kv: [
              ["Deficiencia global (Título I)", "36,60 %"],
              ["Valor ponderado de las deficiencias (50 %)", "18,30 %"]
            ] }
          ] },
          { titulo: "Calificación · Título II · Rol laboral, rol ocupacional y otras áreas ocupacionales", bloques: [
            { tabla: { cols: ["Componente", "Criterio aplicado", "Valor"], filas: [
              ["Restricciones del rol laboral", "No puede desempeñar su oficio de operadora de maquinaria pesada; reubicada en un cargo distinto, con restricciones permanentes", "20,00 %"],
              ["Autosuficiencia económica", "Conserva el salario por la reubicación, con gastos adicionales de transporte y tratamiento", "1,50 %"],
              ["Edad", "53 años", "2,00 %"],
              ["Subtotal rol laboral", "Suma de los tres componentes", "23,50 %"]
            ] } },
            { h: "Otras áreas ocupacionales" },
            { tabla: { cols: ["Área", "Dificultades que se valoran", "Valor"], filas: [
              ["Aprendizaje y aplicación del conocimiento", "Escribir a mano por tiempo prolongado; sostener la atención con dolor", "0,40 %"],
              ["Comunicación", "Escribir mensajes en el teléfono y sostenerlo con la mano izquierda; conversaciones largas de pie", "0,80 %"],
              ["Movilidad", "Permanecer sentada más de 25 minutos, caminar más de 300 m, subir pendientes, levantar más de 5 kg, uso fino de ambas manos, conducir", "3,60 %"],
              ["Autocuidado", "Ponerse medias y calzado, lavarse los pies, abotonarse, cortar alimentos duros", "2,60 %"],
              ["Vida doméstica", "Barrer, trapear, lavar ropa, cargar compras, cocinar de pie por tiempo prolongado", "3,20 %"],
              ["Total otras áreas ocupacionales", "Suma de las cinco áreas", "10,60 %"]
            ] } },
            { kv: [
              ["Rol laboral", "23,50 %"],
              ["Otras áreas ocupacionales", "10,60 %"],
              ["Total Título II", "34,10 %"]
            ] },
            { h: "Comparación con la calificación de la Junta Regional" },
            { tabla: { cols: ["Componente", "Junta Regional REG-L03", "Junta Nacional DIC-L03"], filas: [
              ["Columna lumbar", "25,00 % · clase 4, grado A", "29,00 % · clase 4, grado C"],
              ["Mano izquierda", "4,00 % (valoración de 2022)", "6,00 % (neuroconducción del 21/10/2025)"],
              ["Mano derecha", "5,00 %", "5,00 %"],
              ["Deficiencia global combinada", "31,60 %", "36,60 %"],
              ["Valor ponderado (50 %)", "15,80 %", "18,30 %"],
              ["Rol laboral", "23,50 %", "23,50 %"],
              ["Otras áreas ocupacionales", "8,30 %", "10,60 %"],
              ["Pérdida de capacidad laboral", "47,60 %", "52,40 %"]
            ] } }
          ] },
          { titulo: "Decisión", bloques: [
            { kv: [
              ["Valor ponderado de las deficiencias (Título I)", "18,30 %"],
              ["Rol laboral, rol ocupacional y otras áreas ocupacionales (Título II)", "34,10 %"],
              ["Pérdida de capacidad laboral y ocupacional integral", "52,40 %"],
              ["Origen", "Enfermedad laboral · M51.3 y G56.0"],
              ["Antecedente común considerado", "Gonartrosis primaria bilateral leve (M17.0), sin deficiencia calificable"],
              ["Antecedente de calificación", "Dictamen CAR-L03 del 19/04/2022 (G56.0, 16,20 %), en firme; no se suma ni se modifica"],
              ["Fecha de estructuración", "18/06/2025"],
              ["Requiere ayuda de terceros para las actividades básicas", "No"],
              ["Requiere ayuda de terceros para tomar decisiones", "No"]
            ] },
            { h: "Fundamentos de derecho" },
            { lista: [
              "Decreto 1352 de 2013, compilado en el Decreto 1072 de 2015: competencia de la Junta Nacional para resolver la apelación de los dictámenes de las juntas regionales.",
              "Decreto 1507 de 2014: Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional.",
              "Ley 1562 de 2012, artículo 4, y Decreto 1477 de 2014: enfermedad laboral y tabla de enfermedades laborales.",
              "Ley 776 de 2002."
            ] },
            { h: "Resuelve" },
            { p: "Primero. Modificar el dictamen REG-L03 del 16/09/2025 de la Junta Regional de Calificación de Invalidez de Boyacá en cuanto al porcentaje: la pérdida de capacidad laboral y ocupacional integral de Mónica Beltrán Rivas se fija en 52,40 %." },
            { p: "Segundo. Confirmar el origen laboral de la discopatía lumbar (M51.3) y del síndrome del túnel carpiano bilateral (G56.0), y la fecha de estructuración del 18/06/2025." },
            { p: "Tercero. Dejar constancia de que este dictamen califica de manera integral el estado actual y no modifica el dictamen CAR-L03 de 2022, que se conserva como antecedente." },
            { p: "Cuarto. Notificar este dictamen a la persona calificada, comunicarlo a ARL SURA, a EPS SURA, a Carbones Mesa Umbral y a Cordillera Pensiones y Cesantías, y devolver el expediente a la Junta Regional de Calificación de Invalidez de Boyacá." },
            { p: "Contra este dictamen no procede recurso en vía administrativa. Las controversias sobre el dictamen en firme corresponden a la justicia laboral ordinaria." },
            { firma: { nombre: "Jaime Orlando Castañeda Ruiz", cargo: "Médico ponente · Sala de Decisión Uno", registro: "Registro médico SIM-RM-11-2741", fecha: "31/03/2026" } },
            { firma: { nombre: "Beatriz Elena Quintana Lozano", cargo: "Médica integrante · Sala de Decisión Uno", registro: "Registro médico SIM-RM-11-3368", fecha: "31/03/2026" } },
            { firma: { nombre: "Fernando Andrés Moya Téllez", cargo: "Terapeuta ocupacional integrante · Sala de Decisión Uno", registro: "Tarjeta profesional SIM-TO-1342", fecha: "31/03/2026" } },
            { nota: "Sello de notificación: notificado a la persona calificada el 01/04/2026 por medio electrónico con acuse de recibo; comunicaciones enviadas a ARL SURA, a EPS SURA, a Cordillera Pensiones y Cesantías y a Carbones Mesa Umbral el 01/04/2026." }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Constancia de firmeza: la de 2022 y la de 2026 */
    FIR: {
      v0: {
        tipo: "constancia",
        titulo: "Constancia de firmeza del dictamen de calificación",
        emisor: { n: "ARL SURA", area: "Medicina laboral", ciudad: "Tunja", id: "NIT SIM-800.256.433-1" },
        numero: "SIM-ARL-CF-2022-0587",
        fecha: "10/05/2022",
        version: "v0",
        estadoNota: "Ejemplar aportado por la solicitante con la radicación del 29/04/2026; expedido por ARL SURA en 2022.",
        paginas: [
          { titulo: "Constancia", bloques: [
            { kv: [
              ["Constancia", "SIM-ARL-CF-2022-0587"],
              ["Fecha", "10/05/2022"],
              ["Dictamen al que se refiere", "CAR-L03 del 19/04/2022, primera oportunidad"],
              ["Código de verificación del dictamen", "SIM-VER-3C81-0D44"],
              ["Persona calificada", "Mónica Beltrán Rivas · C.C. SIM-46.372.518"],
              ["Pérdida de capacidad laboral", "16,20 %"],
              ["Origen", "Laboral"],
              ["Fecha de estructuración", "19/01/2022"],
              ["Diagnóstico", "G56.0 · Síndrome del túnel carpiano, bilateral"]
            ] },
            { h: "Notificaciones y términos" },
            { tabla: { cols: ["Interesado", "Medio", "Fecha de notificación", "Término", "Vencimiento", "Inconformidad"], filas: [
              ["Mónica Beltrán Rivas, persona calificada", "Notificación personal, acta SIM-NOT-2022-01562", "21/04/2022", "10 días hábiles", "05/05/2022", "No presentó"],
              ["Carbones Mesa Umbral, empleador", "Comunicación electrónica con acuse de recibo", "21/04/2022", "10 días hábiles", "05/05/2022", "No presentó"],
              ["EPS SURA", "Comunicación electrónica con acuse de recibo", "21/04/2022", "10 días hábiles", "05/05/2022", "No presentó"],
              ["Cordillera Pensiones y Cesantías", "Comunicación electrónica con acuse de recibo", "21/04/2022", "10 días hábiles", "05/05/2022", "No presentó"]
            ], nota: "El término corrió del 22/04/2022 al 05/05/2022." } },
            { h: "Constancia" },
            { p: "ARL SURA, medicina laboral, hace constar que el dictamen CAR-L03, emitido el 19/04/2022, fue notificado a todos los interesados el 21/04/2022 y que dentro de los 10 días hábiles siguientes ninguno manifestó inconformidad. En consecuencia, el dictamen quedó en firme el 06/05/2022, con una pérdida de capacidad laboral del 16,20 %, de origen laboral y con fecha de estructuración del 19/01/2022." },
            { p: "Esta constancia se refiere únicamente al dictamen CAR-L03, identificado con el código de verificación SIM-VER-3C81-0D44." },
            { h: "Fundamento" },
            { p: "Ley 100 de 1993, art. 41, modificado por el Decreto Ley 019 de 2012, art. 142: término de 10 días para manifestar inconformidad con la calificación en primera oportunidad; vencido sin inconformidad, el dictamen queda en firme." },
            { p: "Se expide para el expediente de calificación y para el trámite de la indemnización por incapacidad permanente parcial (Ley 776 de 2002)." },
            { firma: { nombre: "Ricardo Alfonso Gil Barrera", cargo: "Coordinador de medicina laboral · ARL SURA", registro: "Registro médico SIM-RM-15-0987", fecha: "10/05/2022" } }
          ] },
          { titulo: "Anexo · Acta de notificación personal", bloques: [
            { kv: [
              ["Acta", "SIM-NOT-2022-01562"],
              ["Fecha y hora", "21/04/2022, 10:20"],
              ["Lugar", "Oficina de atención de ARL SURA en Sogamoso"],
              ["Persona notificada", "Mónica Beltrán Rivas · C.C. SIM-46.372.518"],
              ["Documento notificado", "Dictamen CAR-L03 del 19/04/2022 (6 folios)"]
            ] },
            { p: "Se entregó a la persona calificada copia íntegra del dictamen y se le informó que puede manifestar su inconformidad ante ARL SURA dentro de los 10 días hábiles siguientes a esta notificación, para que el expediente se remita a la Junta Regional de Calificación de Invalidez de Boyacá." },
            { firma: { nombre: "Mónica Beltrán Rivas", cargo: "Persona notificada", registro: "C.C. SIM-46.372.518", fecha: "21/04/2022" } },
            { firma: { nombre: "Diana Lorena Fonseca Pinzón", cargo: "Gestora de notificaciones · ARL SURA", fecha: "21/04/2022" } }
          ] }
        ]
      },
      v1: {
        tipo: "constancia",
        titulo: "Constancia de firmeza del dictamen",
        emisor: { n: "Junta Nacional de Calificación de Invalidez", area: "Secretaría Técnica", ciudad: "Bogotá D.C.", id: "NIT SIM-830.512.447-0" },
        numero: "FIR-L03",
        fecha: "17/04/2026",
        version: "v1",
        estadoNota: "Constancia expedida por la Secretaría Técnica; se refiere al dictamen DIC-L03 de 2026.",
        paginas: [
          { titulo: "Constancia", bloques: [
            { p: "La Secretaría Técnica de la Junta Nacional de Calificación de Invalidez hace constar:" },
            { kv: [
              ["Dictamen", "DIC-L03 del 31/03/2026, versión v1"],
              ["Código de verificación del dictamen", "SIM-VER-JN-5B27-9E13"],
              ["Sala", "Sala de Decisión Uno"],
              ["Expediente", "SIM-JNCI-2025-11408"],
              ["Persona calificada", "Mónica Beltrán Rivas · C.C. SIM-46.372.518"],
              ["Decisión", "Resolvió la apelación de la persona calificada contra el dictamen REG-L03 del 16/09/2025 de la Junta Regional de Calificación de Invalidez de Boyacá"],
              ["Resultado", "PCL integral 52,40 % · origen laboral (M51.3 y G56.0) · fecha de estructuración 18/06/2025"],
              ["Notificación a la persona calificada", "01/04/2026"],
              ["Fecha de firmeza", "17/04/2026"]
            ] },
            { h: "Notificaciones y comunicaciones" },
            { tabla: { cols: ["Destinatario", "Calidad", "Medio", "Enviada", "Acreditada"], filas: [
              ["Mónica Beltrán Rivas", "Persona calificada y recurrente", "Notificación electrónica con acuse de recibo", "01/04/2026", "01/04/2026"],
              ["ARL SURA", "Administradora de riesgos laborales", "Comunicación electrónica", "01/04/2026", "01/04/2026"],
              ["EPS SURA", "Entidad promotora de salud", "Comunicación electrónica", "01/04/2026", "01/04/2026"],
              ["Cordillera Pensiones y Cesantías", "Administradora de pensiones", "Comunicación electrónica", "01/04/2026", "06/04/2026"],
              ["Carbones Mesa Umbral", "Empleador", "Comunicación electrónica sin acuse de recibo; reenvío por correo certificado el 08/04/2026", "01/04/2026", "17/04/2026"],
              ["Junta Regional de Calificación de Invalidez de Boyacá", "Instancia que profirió el dictamen apelado", "Comunicación y devolución del expediente", "06/04/2026", "07/04/2026"]
            ] } },
            { p: "Contra los dictámenes de la Junta Nacional no procede recurso en vía administrativa. Conforme al Decreto 1352 de 2013, compilado en el Decreto 1072 de 2015, el dictamen que resuelve los recursos queda en firme cuando ha sido notificado o comunicado en su totalidad. Acreditadas la notificación a la persona calificada y las comunicaciones a las partes interesadas, la última el 17/04/2026 con la prueba de entrega del correo certificado al empleador, el dictamen DIC-L03 quedó en firme el 17/04/2026." },
            { p: "Esta constancia se refiere solo al dictamen DIC-L03 del 31/03/2026. El dictamen REG-L03 de la Junta Regional fue modificado por él y no adquirió firmeza. El dictamen CAR-L03 de ARL SURA, del 19/04/2022, tiene su propia constancia de firmeza (06/05/2022) y no está cubierto por esta." },
            { p: "Se expide para las partes interesadas el 17/04/2026." },
            { firma: { nombre: "Natalia Forero Lozano", cargo: "Secretaria técnica · Junta Nacional de Calificación de Invalidez", fecha: "17/04/2026" } },
            { nota: "Constancia verificable en la Secretaría Técnica con el número FIR-L03 y el expediente SIM-JNCI-2025-11408." }
          ] },
          { titulo: "Anexo · Trazabilidad del trámite", bloques: [
            { tabla: { cols: ["Fecha", "Actuación"], filas: [
              ["01/08/2024", "EPS SURA califica en primera oportunidad el origen laboral de la discopatía lumbar."],
              ["05/08/2024", "ARL SURA manifiesta su inconformidad con el origen."],
              ["26/08/2024", "La Junta Regional de Boyacá radica el expediente."],
              ["22/07/2025", "La persona calificada pide la calificación integral de la pérdida de capacidad laboral."],
              ["16/09/2025", "La Junta Regional emite el dictamen REG-L03: origen laboral, PCL integral 47,60 %."],
              ["18/09/2025", "Notificación a la persona calificada."],
              ["22/09/2025", "La persona calificada interpone recurso de apelación."],
              ["07/10/2025", "La Junta Regional remite el expediente."],
              ["15/10/2025", "La Junta Nacional recibe el expediente y lo reparte a la Sala de Decisión Uno."],
              ["10/11/2025", "La recurrente allega el informe funcional del 30/10/2025."],
              ["31/03/2026", "La Sala de Decisión Uno emite el dictamen DIC-L03: PCL integral 52,40 %."],
              ["01/04/2026", "Notificación a la persona calificada y comunicaciones a las partes."],
              ["17/04/2026", "Última comunicación acreditada. El dictamen DIC-L03 queda en firme."]
            ] } },
            { nota: "Trazabilidad tomada del expediente SIM-JNCI-2025-11408." }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Afiliación y cobertura */
    AFI: {
      v2: {
        tipo: "certificado",
        titulo: "Certificado de afiliación y cobertura en riesgos laborales",
        emisor: { n: "ARL SURA", area: "Afiliaciones y novedades", ciudad: "Medellín", id: "NIT SIM-800.256.433-1" },
        numero: "SIM-ARL-CA-2026-10214",
        fecha: "30/04/2026",
        version: "v2",
        estadoNota: "Segunda versión del certificado: actualiza la expedida el 12/08/2024 para la controversia del origen y certifica la vigencia en las fechas de la firmeza y de la radicación.",
        paginas: [
          { titulo: "Certificado", bloques: [
            { p: "ARL SURA certifica que la persona identificada a continuación está afiliada al Sistema General de Riesgos Laborales por medio de esta administradora, con los siguientes datos:" },
            { kv: [
              ["Afiliada", "Mónica Beltrán Rivas"],
              ["Documento", "C.C. SIM-46.372.518"],
              ["Número de afiliación", "SIM-ARL-2013-61942"],
              ["Tipo de afiliado", "Dependiente"],
              ["Empleador", "Carbones Mesa Umbral · NIT SIM-900.618.274-3"],
              ["Centro de trabajo", "Tópaga · patio de despacho y báscula exterior (SIM-CT-0117)"],
              ["Actividad económica", "0510 · Extracción de hulla (carbón de piedra)"],
              ["Clase de riesgo", "V · tarifa 6,960 %"],
              ["Inicio de la cobertura", "01/01/2013"],
              ["Estado a la fecha de expedición", "Activa"]
            ] },
            { h: "Períodos de cobertura" },
            { tabla: { cols: ["Desde", "Hasta", "Empleador", "Cargo reportado", "Clase", "Estado"], filas: [
              ["01/01/2013", "31/01/2024", "Carbones Mesa Umbral", "Operadora de cargador frontal y retroexcavadora", "V", "Cubierto sin interrupción"],
              ["01/02/2024", "Vigente al 30/04/2026", "Carbones Mesa Umbral", "Auxiliar de control de pesaje (reubicación, mismo contrato)", "V", "Cubierto sin interrupción"]
            ], nota: "La reubicación del 01/02/2024 se reportó como novedad de cargo dentro del mismo contrato y no interrumpió la cobertura. El empleador conserva la clase de riesgo del centro de trabajo." } },
            { h: "Vigencia en las fechas relevantes" },
            { tabla: { cols: ["Fecha", "Hecho", "Cobertura de ARL SURA"], filas: [
              ["19/01/2022", "Fecha de estructuración del dictamen CAR-L03", "Vigente"],
              ["01/08/2024", "Calificación del origen de la discopatía lumbar en primera oportunidad", "Vigente"],
              ["18/06/2025", "Fecha de estructuración de la calificación integral", "Vigente"],
              ["31/03/2026", "Dictamen DIC-L03 de la Junta Nacional", "Vigente"],
              ["17/04/2026", "Firmeza del dictamen DIC-L03", "Vigente"],
              ["29/04/2026", "Radicación de la solicitud RAD-L03", "Vigente"]
            ] } },
            { h: "Antecedentes con otras administradoras" },
            { p: "ARL SURA no registra afiliaciones de esta persona anteriores al 01/01/2013. Los períodos laborados entre 1993 y 2012 corresponden al Instituto de Seguros Sociales y a otras administradoras de riesgos laborales, y deben certificarse por ellas." },
            { p: "Se expide a solicitud de Prestaciones económicas de ARL SURA para el trámite de la solicitud RAD-L03. Este certificado no contiene información clínica." },
            { firma: { nombre: "Sandra Liliana Montaña Pérez", cargo: "Analista de afiliaciones y novedades · ARL SURA", fecha: "30/04/2026" } },
            { nota: "Certificado expedido electrónicamente. Código de verificación SIM-VER-8M2T-2026." }
          ] },
          { titulo: "Anexo · Estado de los aportes recientes", bloques: [
            { tabla: { cols: ["Período cotizado", "Planilla", "Fecha de pago", "Días", "Estado"], filas: [
              ["Diciembre de 2025", "SIM-PL-2601-0058", "08/01/2026", "30", "Pagado"],
              ["Enero de 2026", "SIM-PL-2602-0631", "06/02/2026", "30", "Pagado"],
              ["Febrero de 2026", "SIM-PL-2603-0617", "06/03/2026", "30", "Pagado"],
              ["Marzo de 2026", "SIM-PL-2604-0624", "08/04/2026", "30", "Pagado"],
              ["Abril de 2026", "Período en curso", "Se liquida en la planilla de mayo", "30", "Pendiente de pago, dentro del plazo"]
            ], nota: "Aportes al día a la fecha de expedición." } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Certificado de IBC: la exportación de 2026 y el histórico */
    IBC: {
      v1: {
        tipo: "certificado",
        titulo: "Reporte de ingreso base de cotización · últimos 12 meses",
        emisor: { n: "Carbones Mesa Umbral", area: "Gestión humana · Portal de autoservicio de nómina", ciudad: "Tópaga, Boyacá", id: "NIT SIM-900.618.274-3" },
        numero: "SIM-NOM-AUT-2026-0419",
        fecha: "20/04/2026",
        version: "v1",
        estadoNota: "Exportación generada por la trabajadora en el portal de autoservicio, con corte al 31/03/2026.",
        paginas: [
          { titulo: "Reporte", bloques: [
            { p: "El portal de autoservicio de nómina de Carbones Mesa Umbral genera el siguiente reporte de los ingresos base de cotización (IBC) informados en la planilla integrada de liquidación de aportes:" },
            { kv: [
              ["Trabajadora", "Mónica Beltrán Rivas"],
              ["Documento", "C.C. SIM-46.372.518"],
              ["Fecha de ingreso", "01/01/2013"],
              ["Contrato", "Término indefinido, vigente"],
              ["Cargo actual", "Auxiliar de control de pesaje"],
              ["Período del reporte", "01/04/2025 a 31/03/2026 (últimos 12 meses con planilla pagada)"],
              ["Fecha de corte", "31/03/2026"],
              ["Generado", "20/04/2026, 19:06, por la usuaria titular"],
              ["Fuente", "Exportación automática del sistema de nómina"]
            ] },
            { tabla: { cols: ["Período", "Días", "IBC", "Planilla", "Fecha de pago", "Novedades"], filas: [
              ["Abril de 2025", "30", "$3.330.000", "SIM-PL-2505-0633", "08/05/2025", "Ninguna"],
              ["Mayo de 2025", "30", "$3.330.000", "SIM-PL-2506-0619", "06/06/2025", "Ninguna"],
              ["Junio de 2025", "30", "$3.330.000", "SIM-PL-2507-0627", "08/07/2025", "Ninguna"],
              ["Julio de 2025", "30", "$3.330.000", "SIM-PL-2508-0641", "08/08/2025", "Ninguna"],
              ["Agosto de 2025", "30", "$3.330.000", "SIM-PL-2509-0608", "05/09/2025", "Ninguna"],
              ["Septiembre de 2025", "30", "$3.330.000", "SIM-PL-2510-0615", "07/10/2025", "Ninguna"],
              ["Octubre de 2025", "30", "$3.330.000", "SIM-PL-2511-0622", "07/11/2025", "Ninguna"],
              ["Noviembre de 2025", "30", "$3.330.000", "SIM-PL-2512-0610", "05/12/2025", "Ninguna"],
              ["Diciembre de 2025", "30", "$3.330.000", "SIM-PL-2601-0058", "08/01/2026", "Ninguna"],
              ["Enero de 2026", "30", "$3.330.000", "SIM-PL-2602-0631", "06/02/2026", "Ninguna"],
              ["Febrero de 2026", "30", "$3.520.000", "SIM-PL-2603-0617", "06/03/2026", "Variación permanente de salario"],
              ["Marzo de 2026", "30", "$3.520.000", "SIM-PL-2604-0624", "08/04/2026", "Ninguna"]
            ] } },
            { kv: [
              ["Meses incluidos en el reporte", "12"],
              ["Suma del IBC de los meses incluidos", "$40.340.000"],
              ["Promedio mensual del reporte", "$3.361.667"]
            ] },
            { nota: "Reporte generado electrónicamente para consulta de la trabajadora. No lleva firma ni sello de gestión humana. Para trámites ante terceros, solicite a nómina el certificado firmado del período que la entidad requiera." }
          ] },
          { titulo: "Anexo · IBC mensual del reporte", bloques: [
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Ingreso base de cotización por mes",
                unidad: "pesos",
                forma: "barras",
                puntos: [
                  ["Abr. 2025", 3330000], ["May. 2025", 3330000], ["Jun. 2025", 3330000],
                  ["Jul. 2025", 3330000], ["Ago. 2025", 3330000], ["Sep. 2025", 3330000],
                  ["Oct. 2025", 3330000], ["Nov. 2025", 3330000], ["Dic. 2025", 3330000],
                  ["Ene. 2026", 3330000], ["Feb. 2026", 3520000], ["Mar. 2026", 3520000]
                ],
                limite: { valor: 3361667, etiqueta: "Promedio del reporte: $3.361.667" }
              },
              pie: "Meses incluidos en la exportación del 20/04/2026, con corte al 31/03/2026."
            } },
            { nota: "El gráfico reproduce los valores de la tabla del reporte." }
          ] }
        ]
      },
      v2: {
        tipo: "certificado",
        titulo: "Certificado de ingreso base de cotización",
        emisor: { n: "Carbones Mesa Umbral", area: "Gestión humana · Nómina", ciudad: "Tópaga, Boyacá", id: "NIT SIM-900.618.274-3" },
        numero: "SIM-NOM-2026-0527",
        fecha: "07/05/2026",
        version: "v2",
        estadoNota: "Certificado firmado por nómina, del período que pidió Prestaciones económicas de ARL SURA.",
        paginas: [
          { titulo: "Certificado", bloques: [
            { p: "La coordinación de nómina de Carbones Mesa Umbral certifica los ingresos base de cotización (IBC) informados en la planilla integrada de liquidación de aportes para la trabajadora que se identifica a continuación." },
            { kv: [
              ["Trabajadora", "Mónica Beltrán Rivas"],
              ["Documento", "C.C. SIM-46.372.518"],
              ["Fecha de ingreso", "01/01/2013"],
              ["Contrato", "Término indefinido, vigente"],
              ["Cargo", "Auxiliar de control de pesaje desde el 01/02/2024; antes, operadora de cargador frontal y retroexcavadora"],
              ["Período certificado", "01/08/2023 a 31/07/2024 (12 meses)"],
              ["Motivo del período", "Año anterior a la calificación del origen en primera oportunidad de la discopatía lumbar (EPS SURA, 01/08/2024), período fijado por ARL SURA para la liquidación (Ley 1562 de 2012, art. 5)"],
              ["Solicitado por", "ARL SURA, Prestaciones económicas, oficio del 04/05/2026, trámite RAD-L03"],
              ["Fuente", "Planillas pagadas, conciliadas con el operador de información"]
            ] },
            { tabla: { cols: ["Período", "Días", "IBC", "Planilla", "Fecha de pago", "Novedades"], filas: [
              ["Agosto de 2023", "30", "$3.040.000", "SIM-PL-2309-0611", "08/09/2023", "Ninguna"],
              ["Septiembre de 2023", "30", "$3.040.000", "SIM-PL-2310-0587", "06/10/2023", "Ninguna"],
              ["Octubre de 2023", "30", "$3.040.000", "SIM-PL-2311-0602", "08/11/2023", "Ninguna"],
              ["Noviembre de 2023", "30", "$3.040.000", "SIM-PL-2312-0574", "07/12/2023", "Incapacidad del 14/11/2023 al 20/11/2023 (7 días)"],
              ["Diciembre de 2023", "30", "$3.040.000", "SIM-PL-2401-0049", "10/01/2024", "Ninguna"],
              ["Enero de 2024", "30", "$3.040.000", "SIM-PL-2402-0598", "07/02/2024", "Ninguna"],
              ["Febrero de 2024", "30", "$3.200.000", "SIM-PL-2403-0566", "07/03/2024", "Variación permanente de salario; cambio de cargo desde el 01/02/2024"],
              ["Marzo de 2024", "30", "$3.200.000", "SIM-PL-2404-0541", "05/04/2024", "Ninguna"],
              ["Abril de 2024", "30", "$3.200.000", "SIM-PL-2405-0613", "08/05/2024", "Ninguna"],
              ["Mayo de 2024", "30", "$3.200.000", "SIM-PL-2406-0590", "07/06/2024", "Ninguna"],
              ["Junio de 2024", "30", "$3.200.000", "SIM-PL-2407-0572", "05/07/2024", "Ninguna"],
              ["Julio de 2024", "30", "$3.200.000", "SIM-PL-2408-0606", "06/08/2024", "Ninguna"]
            ], nota: "Durante la incapacidad de noviembre de 2023 la empresa mantuvo la cotización sobre el salario mensual." } },
            { kv: [
              ["Meses certificados", "12"],
              ["Suma del IBC de los 12 meses", "$37.440.000"],
              ["Promedio mensual del período", "$3.120.000"]
            ] },
            { h: "Desglose de los valores del período" },
            { lista: [
              "Agosto de 2023 a enero de 2024: $3.040.000 mensuales, salario de operadora de cargador frontal y retroexcavadora (6 meses, $18.240.000).",
              "Febrero a julio de 2024: $3.200.000 mensuales, por el incremento salarial anual de 2024, aplicado desde el 01/02/2024 junto con el cambio de cargo (6 meses, $19.200.000)."
            ] },
            { p: "Este certificado no reemplaza el reporte de autoservicio SIM-NOM-AUT-2026-0419, que corresponde a otro período (abril de 2025 a marzo de 2026)." },
            { nota: "El promedio es informativo. La base de liquidación de las prestaciones la determina la ARL." },
            { firma: { nombre: "Yuli Andrea Fonseca Camargo", cargo: "Analista de nómina · Carbones Mesa Umbral", fecha: "07/05/2026" } },
            { firma: { nombre: "Edgar Mauricio Puentes Vega", cargo: "Coordinador de gestión humana · Carbones Mesa Umbral", fecha: "07/05/2026" } }
          ] },
          { titulo: "Anexo · IBC mensual del período", bloques: [
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Ingreso base de cotización por mes",
                unidad: "pesos",
                forma: "barras",
                puntos: [
                  ["Ago. 2023", 3040000], ["Sep. 2023", 3040000], ["Oct. 2023", 3040000],
                  ["Nov. 2023", 3040000], ["Dic. 2023", 3040000], ["Ene. 2024", 3040000],
                  ["Feb. 2024", 3200000], ["Mar. 2024", 3200000], ["Abr. 2024", 3200000],
                  ["May. 2024", 3200000], ["Jun. 2024", 3200000], ["Jul. 2024", 3200000]
                ],
                limite: { valor: 3120000, etiqueta: "Promedio de los 12 meses: $3.120.000" }
              },
              pie: "Doce meses del período 01/08/2023 a 31/07/2024. La línea marca el promedio mensual."
            } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Análisis del puesto y reubicación */
    APT: {
      v2: {
        tipo: "analisis_puesto",
        titulo: "Análisis de puesto de trabajo, exposición a vibración de cuerpo entero y reubicación",
        emisor: { n: "Carbones Mesa Umbral", area: "Sistema de gestión de seguridad y salud en el trabajo", ciudad: "Tópaga, Boyacá", id: "NIT SIM-900.618.274-3" },
        numero: "SIM-SST-APT-2024-019",
        fecha: "12/07/2024",
        version: "v2",
        estadoNota: "Segunda versión: incorpora la cronología de la reubicación a la báscula desde el 01/02/2024 y reemplaza la versión del 05/10/2023.",
        paginas: [
          { titulo: "Análisis de puesto de trabajo", bloques: [
            { kv: [
              ["Trabajadora", "Mónica Beltrán Rivas · C.C. SIM-46.372.518"],
              ["Cargo evaluado", "Operadora de cargador frontal y retroexcavadora"],
              ["Período en el cargo", "01/01/2013 a 31/01/2024"],
              ["Centro de trabajo", "Tópaga, patio de despacho · CIIU 0510, extracción de hulla"],
              ["Jornada", "Turnos de 8 horas (06:00 a 14:00 y 14:00 a 22:00)"],
              ["Equipos", "Cargador frontal sobre llantas SIM-CF-03 (cucharón de 3,1 m³, palanca de mando y volante, asiento con suspensión mecánica) y retroexcavadora SIM-RX-02 (dos palancas de mando)"],
              ["Solicitado por", "EPS SURA, medicina laboral, para la calificación del origen de la discopatía lumbar"],
              ["Fuentes", "Observación directa el 23/08/2023, durante el turno de la medición, y el 02/07/2024 en el cargo actual; entrevista a la trabajadora y al jefe de patio (02/07/2024); registro de horómetros de 2019 a 2023; informe de vibración SIM-HI-2023-0412; análisis de puesto cualitativo del 30/06/2021, elaborado para la calificación del túnel carpiano; fichas de cargo de los empleadores anteriores"]
            ] },
            { h: "Descripción del cargo" },
            { p: "Carga carbón desde las pilas del patio a las volquetas y a la tolva de despacho, y alterna con la retroexcavadora para conformar pilas y limpiar cunetas. El patio tiene piso granular irregular, con baches, y rampas de acceso a la tolva de 10 % a 12 % de pendiente. Cada ciclo de cargue dura de 40 a 50 segundos: avance, llenado del cucharón, reversa con giro de tronco y cuello, avance y descargue. Para subir y bajar de la cabina usa tres peldaños." },
            { h: "Tareas y tiempos por turno" },
            { tabla: { cols: ["Tarea", "Tiempo por turno", "Frecuencia", "Exigencia postural y física", "Factor de riesgo"], filas: [
              ["Inspección preoperacional y engrase", "20 min", "1 por turno", "De pie; flexión de tronco; engrasadora manual", "Biomecánico bajo"],
              ["Cargue de volquetas y tolva con cargador frontal", "4 h", "Unos 300 ciclos", "Sentada; agarre de la palanca de mando con la mano derecha y del volante con la izquierda; flexión de muñeca derecha de 20° a 40°", "Vibración de cuerpo entero con impactos; movimientos repetitivos de mano y muñeca; rotación de tronco en reversa"],
              ["Conformación de pilas y limpieza con retroexcavadora", "1 h", "Variable", "Sentada; dos palancas con agarre palmar; flexión y desviación cubital de las muñecas", "Movimientos repetitivos; vibración"],
              ["Subida y bajada de la cabina", "10 min acumulados", "Unas 20 veces", "Tres peldaños; apoyo en pasamanos", "Impacto axial en columna"],
              ["Registro de viajes y comunicación por radio", "30 min", "Continuo", "Sentada", "Bajo"],
              ["Apoyo en patio: señalización y limpieza de derrames con pala", "1 h", "Variable", "De pie; pala", "Carga física moderada"],
              ["Pausas y alimentación", "1 h", "No aplica", "No aplica", "No aplica"]
            ], nota: "Total: 8 horas. Operación de mandos: 5 horas por turno (cargador y retroexcavadora), confirmada por el registro de horómetros (4 h 45 min a 5 h 15 min por turno)." } },
            { h: "Evaluación de miembros superiores" },
            { tabla: { cols: ["Segmento", "Hallazgo", "Método", "Resultado"], filas: [
              ["Mano y muñeca derechas", "Agarre repetido de la palanca de mando, unas 26 acciones técnicas por minuto; flexión de muñeca de 20° a 40° durante más de la mitad del ciclo", "Lista de chequeo OCRA", "18,5 · riesgo medio"],
              ["Mano y muñeca izquierdas", "Agarre del volante y de la palanca de la retroexcavadora; desviación cubital en los giros", "Lista de chequeo OCRA", "12,5 · riesgo bajo"]
            ], nota: "Escala de la lista de chequeo OCRA: hasta 7,5 aceptable; 7,6 a 11,0 muy bajo; 11,1 a 14,0 bajo; 14,1 a 22,5 medio; más de 22,5 alto." } },
            { h: "Evaluación de la columna" },
            { tabla: { cols: ["Factor", "Hallazgo", "Duración o frecuencia", "Resultado"], filas: [
              ["Vibración de cuerpo entero", "A(8) del eje vertical de 0,61 m/s² (anexo 1)", "5 h por turno", "Supera el valor de acción de 0,5 m/s²"],
              ["Sedestación prolongada", "Bloques de 1,5 a 2 h de operación continua", "5 h por turno", "Exigencia alta"],
              ["Rotación de tronco en reversa", "Rotación de 30° a 60° con inclinación lateral", "Unas 300 veces por turno", "REBA 8 · riesgo alto"],
              ["Subida y bajada de la cabina", "Salto del último peldaño observado", "Unas 20 veces por turno", "Impacto axial repetido"]
            ] } },
            { h: "Conclusiones" },
            { lista: [
              "El cargo expuso a vibración de cuerpo entero durante unas 5 horas por turno. La medición del 23/08/2023 registró A(8) de 0,61 m/s² en el eje vertical, por encima del valor de acción adoptado como criterio técnico (anexo 1).",
              "La operación de mandos exige agarre repetido de palancas y flexión sostenida de muñeca: riesgo medio en la mano derecha y bajo en la izquierda según la lista de chequeo OCRA.",
              "La exposición en la empresa duró 11 años y 1 mes (01/01/2013 a 31/01/2024), precedida por 9 años y 10 meses de operación de cargador frontal y 10 años de manipulación manual de cargas con otros empleadores (anexo 3).",
              "Desde el 01/02/2024 la trabajadora está reubicada como auxiliar de control de pesaje, sin exposición a vibración ni a manipulación de cargas (anexo 2).",
              "La medición representa el equipo SIM-CF-03, el turno y el estado del patio del 23/08/2023. No hay mediciones de los puestos anteriores ni de la retroexcavadora."
            ] },
            { firma: { nombre: "Paula Andrea Monroy Cuervo", cargo: "Fisioterapeuta, especialista en seguridad y salud en el trabajo", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2018-5120", fecha: "12/07/2024" } }
          ] },
          { titulo: "Anexo 1 · Informe de medición de vibración de cuerpo entero (23/08/2023)", bloques: [
            { kv: [
              ["Informe", "SIM-HI-2023-0412"],
              ["Elaborado por", "Higiene Industrial Cordillera Oriental S.A.S. · NIT SIM-901.338.150-2"],
              ["Fecha de la medición", "23/08/2023"],
              ["Fecha del informe", "06/09/2023"],
              ["Trabajadora medida", "Mónica Beltrán Rivas, operadora titular del equipo"],
              ["Equipo", "Cargador frontal sobre llantas SIM-CF-03, modelo 2014; asiento con suspensión mecánica con desgaste visible"],
              ["Turno", "06:00 a 14:00"],
              ["Recorrido", "Pilas del patio, rampa de acceso a la tolva (12 %) y zona de cargue de volquetas; piso granular con baches; velocidad promedio de 9 km/h"],
              ["Instrumento", "Analizador de vibraciones humanas de tres canales, serie SIM-VB-2209, con acelerómetro triaxial de asiento tipo cojín, conforme a ISO 8041-1:2017"],
              ["Calibración", "Certificado SIM-CAL-2023-0388 del 02/06/2023; verificación en campo conforme antes y después de la medición"],
              ["Método", "ISO 2631-1:1997; ponderación Wd en los ejes x y y, Wk en el eje z; factores k de 1,4 (x, y) y 1,0 (z)"],
              ["Tiempo de medición", "180 minutos de operación efectiva (06:30 a 08:10 y 09:00 a 10:20)"],
              ["Tiempo de exposición diaria", "5 horas en el cargador SIM-CF-03, según el registro de horómetros de agosto de 2023; ese mes la retroexcavadora estuvo asignada a otro frente y la operadora trabajó solo en el cargador"]
            ] },
            { h: "Resultados por eje" },
            { tabla: { cols: ["Eje", "Aceleración ponderada aw (m/s²)", "k", "k · aw (m/s²)", "A(8) (m/s²)", "Factor de cresta", "Dosis medida (m/s¹,⁷⁵)", "Dosis diaria (m/s¹,⁷⁵)"], filas: [
              ["x", "0,29", "1,4", "0,41", "0,32", "6,2", "4,1", "4,7"],
              ["y", "0,33", "1,4", "0,46", "0,37", "6,5", "4,6", "5,2"],
              ["z", "0,77", "1,0", "0,77", "0,61", "7,6", "9,8", "11,1"]
            ], nota: "Eje dominante: z. Las dosis de vibración incluyen el factor k de cada eje." } },
            { h: "Cálculo" },
            { p: "A(8) = k · aw · √(T / 8 h) = 1,0 × 0,77 × √(5 / 8) = 0,61 m/s² en el eje z." },
            { p: "Dosis diaria = dosis medida × (tiempo de exposición / tiempo de medición) elevado a 1/4 = 9,8 × (300 / 180) elevado a 1/4 = 11,1 m/s¹,⁷⁵." },
            { h: "Comparación con los criterios de referencia" },
            { tabla: { cols: ["Indicador", "Valor de acción", "Valor límite", "Resultado"], filas: [
              ["A(8) del eje dominante", "0,5 m/s²", "1,15 m/s²", "0,61 m/s²: supera el valor de acción; no supera el valor límite"],
              ["Dosis de vibración diaria", "9,1 m/s¹,⁷⁵", "21 m/s¹,⁷⁵", "11,1 m/s¹,⁷⁵: supera el valor de acción; no supera el valor límite"]
            ], nota: "Colombia no tiene un valor límite reglamentario específico para vibración de cuerpo entero. El informe toma como criterio técnico la norma ISO 2631-1:1997 y los valores de la Directiva 2002/44/CE." } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Aceleración ponderada del eje z por intervalo de 20 minutos",
                unidad: "m/s²",
                forma: "barras",
                puntos: [
                  ["06:30", 0.71], ["06:50", 0.84], ["07:10", 0.92], ["07:30", 0.69], ["07:50", 0.66],
                  ["09:00", 0.74], ["09:20", 0.88], ["09:40", 0.79], ["10:00", 0.70]
                ]
              },
              pie: "Valor eficaz del muestreo: 0,77 m/s². Los intervalos de 07:10 y 09:20 corresponden a la rampa de la tolva y a reversas sobre el piso con baches."
            } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "A(8) del eje z según las horas diarias de operación",
                unidad: "m/s²",
                forma: "linea",
                puntos: [["1 h", 0.27], ["2 h", 0.39], ["3 h", 0.47], ["4 h", 0.54], ["5 h", 0.61], ["6 h", 0.67]],
                limite: { valor: 0.5, etiqueta: "Valor de acción A(8) 0,5 m/s²" }
              },
              pie: "Con las 5 horas diarias registradas en los horómetros, la exposición supera el valor de acción."
            } },
            { h: "Interpretación" },
            { lista: [
              "El factor de cresta del eje z (7,6) es menor que 9: el método básico de la ISO 2631-1 es adecuado. La dosis de vibración se informa como complemento.",
              "Los valores más altos coinciden con el ascenso por la rampa de la tolva y con las reversas sobre el piso con baches.",
              "La suspensión del asiento tiene desgaste y recorrido limitado, lo que aumenta la transmisión de los impactos."
            ] },
            { h: "Recomendaciones" },
            { lista: [
              "Nivelar el patio de cargue y la rampa de la tolva y reparar los baches.",
              "Reemplazar el asiento del equipo SIM-CF-03 por uno con suspensión ajustada al peso de quien opera y revisar la presión de las llantas.",
              "Reducir la velocidad en reversa y en la rampa, y rotar a quienes operan entre maquinaria y tareas de piso.",
              "Incluir a quienes operan maquinaria en el programa de vigilancia epidemiológica de desórdenes musculoesqueléticos, conforme a la guía de atención integral para dolor lumbar y enfermedad discal (Resolución 2844 de 2007)."
            ] },
            { h: "Alcance" },
            { p: "La medición representa el turno, el equipo SIM-CF-03, la operadora y el estado del patio del día medido. No representa la retroexcavadora, otros equipos ni las condiciones posteriores a reparaciones del patio." },
            { firma: { nombre: "Camilo Andrés Suesca Rojas", cargo: "Ingeniero, higienista ocupacional · Higiene Industrial Cordillera Oriental S.A.S.", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2012-1196", fecha: "06/09/2023" } }
          ] },
          { titulo: "Anexo 2 · Cronología de la reubicación y cargo actual", bloques: [
            { tabla: { cols: ["Fecha", "Hecho", "Soporte"], filas: [
              ["21/06/2023", "Consulta por dolor lumbar; incapacidad de 5 días", "Certificado de incapacidad de la EPS"],
              ["23/08/2023", "Medición de vibración de cuerpo entero en el cargador SIM-CF-03", "Informe SIM-HI-2023-0412"],
              ["05/10/2023", "Versión 1 de este análisis de puesto", "Archivo del sistema de gestión"],
              ["14/11/2023", "Incapacidad de 7 días por dolor lumbar con irradiación", "Certificado de incapacidad de la EPS"],
              ["15/01/2024", "Recomendaciones de medicina laboral de EPS SURA: no conducir maquinaria, no levantar más de 10 kg, alternar posturas cada 30 a 45 minutos; vigencia de 6 meses", "Oficio de EPS SURA"],
              ["23/01/2024", "Mesa laboral con la trabajadora, el jefe de patio, el sistema de gestión y la asesoría de ARL SURA: se define el cargo de auxiliar de control de pesaje", "Acta SIM-ACT-SST-2024-004"],
              ["29/01/2024", "Otrosí al contrato: cambio de cargo con conservación del salario y aplicación del incremento anual desde el 01/02/2024", "Otrosí firmado por las partes"],
              ["01/02/2024", "Inicia labores en la báscula exterior de Tópaga", "Novedad de cargo reportada a la ARL"],
              ["15/04/2024", "Seguimiento: silla con soporte lumbar, soporte para el escáner de mano y pausas cada 45 minutos", "Acta de seguimiento"],
              ["28/06/2024", "EPS SURA declara permanentes las recomendaciones laborales", "Oficio de EPS SURA"],
              ["03/07/2024", "Seguimiento: cumple las restricciones; se ajusta el horario de pausas", "Acta de seguimiento"]
            ] } },
            { h: "Cargo actual desde el 01/02/2024" },
            { kv: [
              ["Cargo", "Auxiliar de control de pesaje, mismo contrato"],
              ["Lugar", "Báscula exterior de Tópaga, caseta de control"],
              ["Tareas", "Registra guías de despacho y lecturas de la báscula camionera, verifica placas y documentos de los conductores y usa escáner de mano con soporte"],
              ["Postura", "Alterna sentada y de pie, con pausas cada 45 minutos"],
              ["Exclusiones", "No conduce maquinaria ni vehículos; no levanta más de 10 kg; no sube a volquetas ni recorre el patio"],
              ["Exposición a vibración", "Ninguna"],
              ["Compatibilidad", "Compatible con las recomendaciones médicas vigentes"]
            ] },
            { firma: { nombre: "Wilson Fernando Gómez Pacheco", cargo: "Coordinador del sistema de gestión de seguridad y salud en el trabajo · Carbones Mesa Umbral", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2015-3381", fecha: "12/07/2024" } }
          ] },
          { titulo: "Anexo 3 · Historia ocupacional", bloques: [
            { tabla: { cols: ["Período", "Empresa", "Centro de trabajo", "CIIU", "Cargo", "Exposición relevante", "Administradora de riesgos"], filas: [
              ["01/01/1993 a 31/12/2002", "Carbones Cuesta de Niebla", "Sogamoso, patio de acopio", "0510", "Auxiliar de patio", "Ordena material con herramientas manuales y mueve sacos de 10 a 18 kg; 2 h acumuladas de manipulación por turno de 8 h", "Instituto de Seguros Sociales y luego otra administradora"],
              ["01/03/2003 a 31/12/2012", "Carbones Ventana Alta", "Nobsa, frente y patio de carbón", "0510", "Operadora de cargador frontal", "Opera palancas 4,5 h efectivas por turno de 8 h; piso granular irregular; cargas repetidas de material", "Otra administradora"],
              ["01/01/2013 a 31/01/2024", "Carbones Mesa Umbral", "Tópaga, patio de despacho", "0510", "Operadora de cargador frontal y retroexcavadora", "Mandos 5 h por turno de 8 h; llenado de tolva, reversa y posicionamiento en rampas", "ARL SURA"],
              ["01/02/2024 a la fecha", "Carbones Mesa Umbral", "Tópaga, báscula exterior", "0510", "Auxiliar de control de pesaje", "Sin conducción ni levantamiento de cargas", "ARL SURA"]
            ], nota: "Sin vínculo registrado en enero y febrero de 2003. Los dos primeros períodos se reconstruyen con las fichas de cargo de esos empleadores y la entrevista a la trabajadora; no hay mediciones de esos puestos. Las mediciones disponibles solo cubren el puesto de Tópaga en 2023." } },
            { kv: [
              ["Manipulación manual de cargas", "10 años (1993 a 2002)"],
              ["Operación de maquinaria pesada", "21 años (2003 a 2024): 9 años y 10 meses en Carbones Ventana Alta y 11 años y 1 mes en Carbones Mesa Umbral"]
            ] },
            { firma: { nombre: "Wilson Fernando Gómez Pacheco", cargo: "Coordinador del sistema de gestión de seguridad y salud en el trabajo · Carbones Mesa Umbral", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2015-3381", fecha: "12/07/2024" } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Resumen funcional de mano y columna */
    FUN: {
      v2: {
        tipo: "informe",
        titulo: "Resumen funcional de mano y columna lumbar",
        emisor: { n: "IPS Neuroeje Peñas Altas", area: "Neurología, ortopedia y rehabilitación", ciudad: "Sogamoso", id: "NIT SIM-900.874.512-6" },
        numero: "SIM-IPS-RF-2025-0311",
        fecha: "06/11/2025",
        version: "v2",
        estadoNota: "Extracto firmado en la IPS por fisiatría y terapia ocupacional. Segunda versión: incorpora el informe funcional del 30/10/2025 al extracto del 25/09/2025.",
        paginas: [
          { titulo: "Resumen funcional", bloques: [
            { kv: [
              ["Paciente", "Mónica Beltrán Rivas"],
              ["Documento", "C.C. SIM-46.372.518"],
              ["Historia clínica", "SIM-NOP-2021-04417"],
              ["Fecha de nacimiento", "10/11/1972 · 52 años"],
              ["EPS", "EPS SURA · SIM-EPS-1999-227315"],
              ["ARL", "ARL SURA · SIM-ARL-2013-61942"],
              ["Ocupación", "Operadora de cargador frontal y retroexcavadora hasta el 31/01/2024; auxiliar de control de pesaje desde el 01/02/2024"],
              ["Dominancia", "Diestra"],
              ["Atención en la IPS", "Desde el 09/02/2021: electrodiagnóstico, cirugía de mano, terapia de mano, columna y rehabilitación"],
              ["Solicitado por", "La paciente, para el recurso de apelación ante la Junta Nacional de Calificación de Invalidez (autorización escrita del 04/11/2025)"],
              ["Alcance", "Extracto limitado a mano, columna lumbar y antecedentes considerados en la calificación. No incluye el resto de la historia clínica"]
            ] },
            { h: "Procedencia de la información" },
            { tabla: { cols: ["Evaluación", "Fecha", "Servicio y profesional", "Fuente"], filas: [
              ["Electromiografía y neuroconducciones de miembros superiores", "09/02/2021", "Electrodiagnóstico · Germán Darío Patarroyo Sierra", "Historia clínica de la IPS (anexo 2)"],
              ["Liberación del túnel del carpo derecho", "13/04/2021", "Cirugía de mano · Julio César Barrera Molano", "Descripción quirúrgica (anexo 3)"],
              ["Terapia de mano, 12 sesiones", "18/05/2021 a 25/06/2021", "Terapia ocupacional · Lina Fernanda Chaparro Ávila", "Informe de egreso (anexo 4)"],
              ["Neuroconducción de control", "12/01/2022", "Electrodiagnóstico · Germán Darío Patarroyo Sierra", "Historia clínica de la IPS (anexo 2)"],
              ["Resonancia magnética de columna lumbar", "22/09/2023", "Unidad de imágenes · Mauricio Esteban Pineda Ortiz", "Informe radiológico (anexo 5)"],
              ["Rehabilitación lumbar, 16 sesiones", "12/02/2024 a 05/04/2024", "Fisioterapia · Edwin Alexander Higuera Plazas", "Informe de egreso (anexo 6)"],
              ["Radiografía de rodillas", "12/03/2024", "Unidad de imágenes y ortopedia", "Antecedente común (anexo 9)"],
              ["Concepto de cirugía de columna", "08/04/2025", "Cirugía de columna · Ramiro Esteban Quintero Ladino", "Historia clínica de la IPS (anexo 1)"],
              ["Electromiografía de miembros inferiores", "05/06/2025", "Electrodiagnóstico · Germán Darío Patarroyo Sierra", "Historia clínica de la IPS (anexo 7)"],
              ["Valoración de mejoría médica máxima", "18/06/2025", "Fisiatría · Adriana Marcela Vargas Holguín", "Historia clínica de la IPS (anexo 7)"],
              ["Neuroconducción de control de miembros superiores", "21/10/2025", "Electrodiagnóstico · Germán Darío Patarroyo Sierra", "Informe funcional (anexo 8)"],
              ["Informe funcional SIM-IPS-EF-2025-1030", "30/10/2025", "Fisiatría y terapia ocupacional", "Anexo 8"]
            ], nota: "Las consultas de medicina general y de medicina laboral de EPS SURA se transcriben de las remisiones y de los soportes aportados por la paciente." } },
            { h: "Evolución" },
            { p: "Manos. Consultó el 12/11/2020 por adormecimiento nocturno de ambas manos. La electromiografía del 09/02/2021 confirmó neuropatía del mediano en el carpo bilateral, moderada a severa a la derecha y moderada a la izquierda. El 13/04/2021 se practicó liberación del túnel del carpo derecho, con 30 días de incapacidad y 12 sesiones de terapia de mano. Desde 2022 la mano derecha conserva una secuela sensitiva constante y estable, leve en el electrodiagnóstico. La mano izquierda, no operada, progresó: en junio de 2025 se observó atrofia tenar incipiente y la neuroconducción del 21/10/2025 muestra compromiso severo con pérdida axonal." },
            { p: "Columna lumbar. Dolor lumbar desde comienzos de 2023, con irradiación a la pierna izquierda y luego a ambas. La resonancia del 22/09/2023 muestra discopatía degenerativa de L3–L4 a L5–S1 con hernia discal L4–L5 y compresión de las raíces L5. Incapacidades de 5 y 7 días en 2023. Reubicada en la báscula desde el 01/02/2024. Cumplió 16 sesiones de rehabilitación lumbar en 2024, con mejoría parcial. En abril de 2025 cirugía de columna no indicó tratamiento quirúrgico. La electromiografía del 05/06/2025 documenta radiculopatía L5 bilateral y S1 izquierda. Mejoría médica máxima el 18/06/2025." },
            { h: "Diagnósticos" },
            { tabla: { cols: ["CIE-10", "Diagnóstico", "Tipo", "Estado"], filas: [
              ["G56.0", "Síndrome del túnel carpiano bilateral", "Principal", "Mano derecha operada (2021) con secuela sensitiva estable; mano izquierda severa, con pérdida axonal"],
              ["M51.3", "Otras degeneraciones especificadas de disco intervertebral: discopatía lumbar L3–L4 a L5–S1", "Principal", "Crónica, con radiculopatía L5 bilateral y S1 izquierda"],
              ["M54.1", "Radiculopatía, asociada a la discopatía lumbar", "Relacionado", "Crónica, sin denervación activa"],
              ["M17.0", "Gonartrosis primaria bilateral, leve", "Antecedente común", "En seguimiento por ortopedia"]
            ] } },
            { h: "Estado funcional en el informe del 30/10/2025" },
            { tabla: { cols: ["Prueba", "Resultado", "Referencia"], filas: [
              ["Índice de discapacidad de Oswestry", "62 %", "0 %"],
              ["Tolerancia a la sedestación", "25 minutos", "Más de 60 minutos"],
              ["Tolerancia a la bipedestación", "30 minutos", "Más de 60 minutos"],
              ["Marcha de 6 minutos", "360 m, con dos pausas", "Cerca de 540 m"],
              ["Levantamiento ocasional del piso a la cintura", "5 kg", "Cerca de 15 kg"],
              ["Dinamometría de agarre", "Derecha 15 kg · izquierda 10 kg", "Cerca de 25 kg"],
              ["Prueba de las nueve clavijas", "Derecha 23 s · izquierda 28 s", "Cerca de 18 s"],
              ["QuickDASH", "68,2", "0"]
            ] } },
            { h: "Restricciones y recomendaciones" },
            { lista: [
              "No conducir maquinaria ni vehículos de carga. Restricción permanente.",
              "No levantar ni transportar cargas de más de 5 kg.",
              "Alternar sentada y de pie cada 20 a 30 minutos, con silla de soporte lumbar.",
              "No caminar por terreno irregular ni subir a vehículos o plataformas.",
              "Evitar el agarre sostenido y las herramientas vibrátiles; escáner de mano con soporte.",
              "Valoración por cirugía de mano para la mano izquierda, que la paciente ha aplazado; con la pérdida axonal, la recuperación esperada después de la liberación sería parcial. Continuar el programa de ejercicio en casa."
            ] },
            { h: "Concepto" },
            { p: "Discopatía lumbar degenerativa en tres niveles con radiculopatía L5 bilateral y S1 izquierda, en mejoría médica máxima desde el 18/06/2025, con limitación para permanecer sentada más de 25 minutos, caminar más de 300 m sin pausa y levantar cargas. Síndrome del túnel carpiano bilateral con secuela sensitiva estable en la mano derecha operada y compromiso severo con pérdida axonal en la izquierda, con disminución de la fuerza de agarre y de la destreza en ambas manos. Las limitaciones son permanentes." },
            { firma: { nombre: "Adriana Marcela Vargas Holguín", cargo: "Médica fisiatra", registro: "Registro médico SIM-RM-15-1452", fecha: "06/11/2025" } },
            { firma: { nombre: "Lina Fernanda Chaparro Ávila", cargo: "Terapeuta ocupacional", registro: "Tarjeta profesional SIM-TO-2215", fecha: "06/11/2025" } },
            { nota: "Extracto expedido con autorización de la paciente y solo para la finalidad indicada (Resolución 1995 de 1999). La historia clínica completa permanece bajo custodia de la IPS. Las restricciones laborales se comunican al empleador por separado, sin información clínica." }
          ] },
          { titulo: "Anexo 1 · Consultas y controles registrados", bloques: [
            { tabla: { cols: ["Fecha", "Servicio", "Hallazgos y conducta"], filas: [
              ["12/11/2020", "Medicina general, EPS SURA", "Adormecimiento y hormigueo nocturno en ambas manos de 4 meses, de predominio derecho; Phalen positivo bilateral. Férulas nocturnas; remite a electrodiagnóstico y a cirugía de mano."],
              ["09/02/2021", "Electrodiagnóstico", "Electromiografía y neuroconducciones (anexo 2): túnel carpiano bilateral."],
              ["15/02/2021", "Cirugía de mano", "Indica liberación del túnel del carpo derecho y manejo conservador a la izquierda. Diligencia el reporte de presunta enfermedad laboral."],
              ["13/04/2021", "Cirugía de mano", "Liberación abierta del túnel del carpo derecho (anexo 3). Incapacidad de 30 días."],
              ["11/05/2021", "Cirugía de mano, control", "Herida sana; mejora el dolor nocturno; persiste hipoestesia. Ordena 12 sesiones de terapia de mano."],
              ["25/06/2021", "Terapia ocupacional", "Egreso del programa de terapia de mano (anexo 4)."],
              ["12/01/2022", "Electrodiagnóstico", "Neuroconducción de control (anexo 2)."],
              ["19/01/2022", "Fisiatría", "Mejoría médica máxima de la mano derecha con secuela sensitiva; mano izquierda moderada, la paciente aplaza la cirugía; férula nocturna y recomendaciones laborales."],
              ["21/06/2023", "Medicina general, EPS SURA", "Dolor lumbar de 5 meses con irradiación a la pierna izquierda (7 de 10). Incapacidad de 5 días; remite a ortopedia de columna."],
              ["22/09/2023", "Unidad de imágenes", "Resonancia magnética de columna lumbar (anexo 5)."],
              ["10/10/2023", "Ortopedia de columna", "Discopatía L3–L4 a L5–S1 con compresión de raíces L5. Manejo no quirúrgico: analgesia, pregabalina y rehabilitación. Remite a medicina laboral."],
              ["14/11/2023", "Medicina general, EPS SURA", "Exacerbación del dolor lumbar con irradiación. Incapacidad de 7 días (anexo 6)."],
              ["15/01/2024", "Medicina laboral, EPS SURA", "Recomendaciones laborales: no conducir maquinaria, no levantar más de 10 kg, alternar posturas. El empleador reubica a la paciente desde el 01/02/2024."],
              ["12/02/2024", "Fisioterapia", "Inicia rehabilitación lumbar de 16 sesiones (anexo 6)."],
              ["12/03/2024", "Ortopedia", "Dolor mecánico de rodillas al subir escaleras. Radiografía con gonartrosis leve (anexo 9)."],
              ["05/04/2024", "Fisioterapia", "Egreso de la rehabilitación lumbar."],
              ["28/06/2024", "Medicina laboral, EPS SURA", "Recomendaciones laborales permanentes."],
              ["08/04/2025", "Cirugía de columna", "Discopatía en tres niveles sin inestabilidad segmentaria. No indica cirugía por el beneficio limitado que se espera; continuar manejo conservador y remitir a fisiatría para el cierre de la rehabilitación."],
              ["05/06/2025", "Electrodiagnóstico", "Electromiografía de miembros inferiores (anexo 7)."],
              ["18/06/2025", "Fisiatría", "Mejoría médica máxima de la columna (anexo 7). Atrofia tenar izquierda incipiente: ordena neuroconducción de control de miembros superiores."],
              ["25/09/2025", "Fisiatría", "A solicitud de la paciente, ordena una valoración funcional integral para el recurso ante la Junta Nacional."],
              ["21/10/2025", "Electrodiagnóstico", "Neuroconducción de control de miembros superiores (anexo 8)."],
              ["30/10/2025", "Fisiatría y terapia ocupacional", "Informe funcional (anexo 8)."]
            ] } }
          ] },
          { titulo: "Anexo 2 · Electrodiagnóstico de miembros superiores (2021 y 2022)", bloques: [
            { h: "Electromiografía y neuroconducciones · 09/02/2021" },
            { tabla: { cols: ["Nervio", "Tipo", "Latencia (ms)", "Amplitud", "Velocidad (m/s)", "Interpretación"], filas: [
              ["Mediano derecho", "Sensitivo", "4,6", "8 µV", "34", "Latencia prolongada, amplitud disminuida"],
              ["Mediano derecho", "Motor", "5,8", "5,1 mV", "51", "Latencia distal prolongada"],
              ["Mediano izquierdo", "Sensitivo", "4,1", "13 µV", "40", "Latencia prolongada, amplitud disminuida"],
              ["Mediano izquierdo", "Motor", "4,9", "6,8 mV", "53", "Latencia distal prolongada"],
              ["Cubital derecho", "Sensitivo", "2,8", "18 µV", "55", "Normal"],
              ["Cubital izquierdo", "Sensitivo", "2,7", "20 µV", "56", "Normal"]
            ], nota: "Referencias del laboratorio: latencia sensitiva del mediano de 3,5 ms o menos y motora distal de 4,2 ms o menos; amplitud sensitiva del mediano de 20 µV o más y motora de 5 mV o más; velocidad de 50 m/s o más." } },
            { figura: {
              tipo: "neuroconduccion",
              datos: { filas: [
                { nervio: "Mediano derecho", tipo: "sensitivo", latencia: 4.6, latRef: 3.5, amplitud: 8, ampRef: 20, velocidad: 34, velRef: 50 },
                { nervio: "Mediano derecho", tipo: "motor", latencia: 5.8, latRef: 4.2, amplitud: 5.1, ampRef: 5, velocidad: 51, velRef: 50 },
                { nervio: "Mediano izquierdo", tipo: "sensitivo", latencia: 4.1, latRef: 3.5, amplitud: 13, ampRef: 20, velocidad: 40, velRef: 50 },
                { nervio: "Mediano izquierdo", tipo: "motor", latencia: 4.9, latRef: 4.2, amplitud: 6.8, ampRef: 5, velocidad: 53, velRef: 50 },
                { nervio: "Cubital derecho", tipo: "sensitivo", latencia: 2.8, latRef: 3.1, amplitud: 18, ampRef: 10, velocidad: 55, velRef: 50 },
                { nervio: "Cubital izquierdo", tipo: "sensitivo", latencia: 2.7, latRef: 3.1, amplitud: 20, ampRef: 10, velocidad: 56, velRef: 50 }
              ] },
              pie: "Neuroconducciones del 09/02/2021: compromiso del mediano en el carpo, mayor a la derecha; cubitales normales."
            } },
            { tabla: { cols: ["Músculo", "Raíz y nervio", "Actividad espontánea", "Unidades motoras", "Reclutamiento"], filas: [
              ["Abductor corto del pulgar derecho", "C8–T1 · mediano", "Fibrilaciones escasas (1+)", "Amplitud levemente aumentada", "Levemente reducido"],
              ["Abductor corto del pulgar izquierdo", "C8–T1 · mediano", "Ausente", "Normales", "Normal"],
              ["Primer interóseo dorsal derecho", "C8–T1 · cubital", "Ausente", "Normales", "Normal"],
              ["Bíceps braquial derecho", "C5–C6", "Ausente", "Normales", "Normal"]
            ] } },
            { p: "Conclusión: neuropatía del mediano en el carpo bilateral; derecha moderada a severa, desmielinizante con pérdida axonal leve; izquierda moderada, desmielinizante. Sin neuropatía cubital ni signos de radiculopatía cervical." },
            { firma: { nombre: "Germán Darío Patarroyo Sierra", cargo: "Médico fisiatra, electrodiagnóstico", registro: "Registro médico SIM-RM-15-0774", fecha: "09/02/2021" } },
            { h: "Neuroconducción de control · 12/01/2022" },
            { tabla: { cols: ["Nervio", "Tipo", "Latencia (ms)", "Amplitud", "Velocidad (m/s)", "Comparación con 2021"], filas: [
              ["Mediano derecho", "Sensitivo", "3,9", "14 µV", "42", "Mejoría; compromiso residual leve"],
              ["Mediano derecho", "Motor", "4,6", "6,0 mV", "52", "Mejoría"],
              ["Mediano izquierdo", "Sensitivo", "4,3", "11 µV", "38", "Sin mejoría"],
              ["Mediano izquierdo", "Motor", "5,2", "6,2 mV", "51", "Leve progresión"]
            ] } },
            { p: "Electromiografía de aguja del abductor corto del pulgar derecho: sin actividad espontánea; unidades motoras de amplitud aumentada, de reinervación crónica." },
            { p: "Conclusión: mediano derecho con compromiso residual leve después de la liberación, con secuela axonal (amplitud sensitiva disminuida y reinervación crónica); mediano izquierdo con compromiso moderado persistente." },
            { firma: { nombre: "Germán Darío Patarroyo Sierra", cargo: "Médico fisiatra, electrodiagnóstico", registro: "Registro médico SIM-RM-15-0774", fecha: "12/01/2022" } }
          ] },
          { titulo: "Anexo 3 · Cirugía de la mano derecha e incapacidad", bloques: [
            { kv: [
              ["Fecha", "13/04/2021"],
              ["Hora de inicio y de fin", "08:10 a 08:45"],
              ["Cirujano", "Julio César Barrera Molano, ortopedista, cirugía de mano"],
              ["Anestesia", "Regional intravenosa, con torniquete en el brazo"],
              ["Diagnóstico preoperatorio", "G56.0 · Síndrome del túnel carpiano derecho"],
              ["Procedimiento", "Liberación abierta del túnel del carpo derecho"],
              ["Complicaciones", "Ninguna"]
            ] },
            { h: "Descripción" },
            { p: "Incisión palmar longitudinal de 3 cm. Apertura de la fascia palmar y sección completa del ligamento transverso del carpo bajo visión directa. Nervio mediano adelgazado y con hiperemia en el sitio de compresión, sin lesión de la rama motora tenar. No se requiere neurólisis. Hemostasia, cierre de piel y vendaje con férula de muñeca en posición neutra." },
            { p: "Egreso el mismo día con analgesia, movilización activa de los dedos e incapacidad de 30 días." },
            { firma: { nombre: "Julio César Barrera Molano", cargo: "Ortopedista, cirugía de mano", registro: "Registro médico SIM-RM-15-0658", fecha: "13/04/2021" } },
            { h: "Certificado de incapacidad SIM-IT-2021-208114" },
            { kv: [
              ["Paciente", "Mónica Beltrán Rivas · C.C. SIM-46.372.518"],
              ["Fecha de expedición", "13/04/2021"],
              ["Tipo de atención", "Ambulatoria, posquirúrgica"],
              ["Tipo", "Inicial"],
              ["Desde", "13/04/2021"],
              ["Hasta", "12/05/2021"],
              ["Días", "30 (treinta)"],
              ["Diagnóstico", "G56.0 · Síndrome del túnel carpiano"],
              ["Origen registrado", "Enfermedad general; reportada como presunta enfermedad laboral el 15/02/2021, origen en estudio"],
              ["Profesional", "Julio César Barrera Molano, ortopedista"]
            ] },
            { nota: "La incapacidad se expidió antes de la calificación del origen. ARL SURA calificó el origen laboral el 19/04/2022." }
          ] },
          { titulo: "Anexo 4 · Terapia de mano (mayo y junio de 2021)", bloques: [
            { kv: [
              ["Orden", "Cirugía de mano, 11/05/2021"],
              ["Programa", "Terapia ocupacional de mano"],
              ["Sesiones", "12, dos por semana"],
              ["Inicio y fin", "18/05/2021 a 25/06/2021"],
              ["Objetivos", "Manejo de la cicatriz, desensibilización, deslizamiento tendinoso y neural, fuerza de agarre y pinza, adaptación de la tarea"]
            ] },
            { tabla: { cols: ["Mes", "Fechas", "Sesiones"], filas: [
              ["Mayo de 2021", "18, 20, 25 y 27", "4"],
              ["Junio de 2021", "1, 3, 9, 11, 16, 18, 23 y 25", "8"],
              ["Total", "Asistencia completa", "12"]
            ] } },
            { h: "Mediciones de la mano derecha" },
            { tabla: { cols: ["Prueba", "Inicio (18/05/2021)", "Final (25/06/2021)", "Referencia"], filas: [
              ["Dinamometría de agarre (kg)", "9", "15", "Cerca de 25"],
              ["Pinza lateral (kg)", "3,0", "4,5", "Cerca de 7"],
              ["Monofilamento de Semmes-Weinstein", "4,31", "3,61", "2,83"],
              ["Dolor en la cicatriz a la presión (0 a 10)", "5", "2", "0"],
              ["QuickDASH (0 a 100)", "61,4", "40,9", "0"]
            ] } },
            { p: "Egreso: mejoría parcial de la fuerza y de la sensibilidad; persiste hipoestesia en los pulpejos del pulgar, el índice y el medio. Programa de ejercicios en casa y recomendaciones para el reintegro como operadora: pausas cada hora y rotación de tareas." },
            { firma: { nombre: "Lina Fernanda Chaparro Ávila", cargo: "Terapeuta ocupacional, rehabilitación de mano", registro: "Tarjeta profesional SIM-TO-2215", fecha: "25/06/2021" } }
          ] },
          { titulo: "Anexo 5 · Resonancia magnética de columna lumbar (22/09/2023)", bloques: [
            { kv: [
              ["Estudio", "Resonancia magnética de columna lumbosacra simple"],
              ["Fecha", "22/09/2023"],
              ["Equipo", "Resonador de 1,5 teslas"],
              ["Técnica", "Secuencias sagitales T1, T2 y STIR; axiales T2 de L2 a S1. Sin medio de contraste."],
              ["Indicación", "Lumbalgia crónica con irradiación a miembros inferiores"]
            ] },
            { h: "Hallazgos" },
            { lista: [
              "Lordosis lumbar conservada. Altura de los cuerpos vertebrales conservada. Cambios de tipo 2 de Modic en los platillos de L4–L5.",
              "Deshidratación discal de L3–L4 a L5–S1 (grados III a IV de Pfirrmann), con disminución de la altura del disco L4–L5.",
              "L3–L4: protrusión discal posterocentral leve, sin compromiso radicular.",
              "L4–L5: hernia discal posterocentral de base amplia que, con la hipertrofia facetaria y del ligamento amarillo, estrecha ambos recesos laterales y comprime las raíces L5 descendentes, de predominio izquierdo. Estenosis foraminal bilateral moderada. Canal central de 11 mm en el diámetro anteroposterior (estenosis central relativa).",
              "L5–S1: protrusión discal posterolateral izquierda que contacta la raíz S1 izquierda; forámenes de amplitud conservada.",
              "Cono medular en L1, de señal normal."
            ] },
            { figura: {
              tipo: "rm_columna",
              datos: {
                region: "lumbar",
                secuencia: "T2 sagital",
                hallazgos: [
                  { nivel: "L3-L4", tipo: "protrusion" },
                  { nivel: "L4-L5", tipo: "hernia" },
                  { nivel: "L4-L5", tipo: "estenosis" },
                  { nivel: "L5-S1", tipo: "protrusion" }
                ]
              },
              pie: "Esquema sintético dibujado a partir de los hallazgos del informe; no es la imagen del estudio."
            } },
            { h: "Conclusión" },
            { p: "Discopatía degenerativa de L3–L4 a L5–S1. Hernia discal L4–L5 con estenosis central relativa, de los recesos laterales y foraminal bilateral, y compresión de las raíces L5. Protrusión L5–S1 con contacto de la raíz S1 izquierda." },
            { firma: { nombre: "Mauricio Esteban Pineda Ortiz", cargo: "Médico radiólogo", registro: "Registro médico SIM-RM-15-1029", fecha: "22/09/2023" } }
          ] },
          { titulo: "Anexo 6 · Rehabilitación lumbar (2024) e incapacidades por columna", bloques: [
            { kv: [
              ["Orden", "Ortopedia de columna, 10/10/2023; autorizada por EPS SURA el 30/01/2024"],
              ["Programa", "Fisioterapia de columna: control motor, fortalecimiento de tronco, ejercicio aeróbico, higiene postural y educación en dolor"],
              ["Sesiones", "16, dos por semana"],
              ["Inicio y fin", "12/02/2024 a 05/04/2024"]
            ] },
            { tabla: { cols: ["Prueba", "Inicio (12/02/2024)", "Final (05/04/2024)", "Referencia"], filas: [
              ["Dolor lumbar (0 a 10)", "8", "5", "0"],
              ["Índice de Oswestry", "52 %", "38 %", "0 %"],
              ["Prueba de Schober (cm)", "3", "4", "5 o más"],
              ["Tolerancia a la sedestación", "20 minutos", "45 minutos", "Más de 60 minutos"],
              ["Marcha continua", "300 m", "600 m", "Sin límite"]
            ] } },
            { p: "Egreso con mejoría parcial del dolor y de la tolerancia a la sedestación. Persisten el dolor irradiado a la pierna izquierda y la limitación para cargar. Programa de ejercicio en casa; se recomienda mantener la reubicación." },
            { firma: { nombre: "Edwin Alexander Higuera Plazas", cargo: "Fisioterapeuta, rehabilitación de columna", registro: "Tarjeta profesional SIM-FT-3108", fecha: "05/04/2024" } },
            { h: "Incapacidades por columna" },
            { tabla: { cols: ["Certificado", "Expedición", "Desde", "Hasta", "Días", "Diagnóstico", "Origen registrado"], filas: [
              ["SIM-IT-2023-331905", "21/06/2023", "21/06/2023", "25/06/2023", "5", "M54.5 · Lumbago no especificado", "Enfermedad general"],
              ["SIM-IT-2023-472660", "14/11/2023", "14/11/2023", "20/11/2023", "7", "M51.3 · Otras degeneraciones especificadas de disco intervertebral", "Enfermedad general, origen en estudio"]
            ], nota: "Las incapacidades por columna se expidieron como de origen común. El origen laboral de la discopatía se calificó el 01/08/2024." } }
          ] },
          { titulo: "Anexo 7 · Electromiografía de miembros inferiores y mejoría médica máxima", bloques: [
            { h: "Electromiografía y neuroconducciones de miembros inferiores · 05/06/2025" },
            { tabla: { cols: ["Nervio", "Tipo", "Latencia (ms)", "Amplitud", "Velocidad (m/s)", "Interpretación"], filas: [
              ["Peroneo profundo derecho", "Motor", "4,9", "2,6 mV", "43", "Amplitud en el límite inferior"],
              ["Peroneo profundo izquierdo", "Motor", "5,1", "1,8 mV", "42", "Amplitud disminuida"],
              ["Tibial posterior derecho", "Motor", "4,2", "9,8 mV", "46", "Normal"],
              ["Tibial posterior izquierdo", "Motor", "4,4", "8,1 mV", "45", "Normal"],
              ["Sural derecho", "Sensitivo", "3,1", "12 µV", "46", "Normal"],
              ["Sural izquierdo", "Sensitivo", "3,2", "10 µV", "45", "Normal"]
            ], nota: "Reflejo H del sóleo: 31,2 ms a la derecha y 34,0 ms a la izquierda (diferencia de 2,8 ms, prolongado a la izquierda)." } },
            { tabla: { cols: ["Músculo", "Raíz", "Actividad espontánea", "Unidades motoras", "Reclutamiento"], filas: [
              ["Tibial anterior derecho", "L4–L5", "Ausente", "Amplitud y duración aumentadas", "Reducido"],
              ["Tibial anterior izquierdo", "L4–L5", "Ausente", "Amplitud y duración aumentadas", "Reducido"],
              ["Extensor largo del hallux derecho", "L5", "Ausente", "Amplitud aumentada", "Levemente reducido"],
              ["Extensor largo del hallux izquierdo", "L5", "Ausente", "Polifásicas, de gran amplitud", "Reducido"],
              ["Glúteo medio izquierdo", "L5", "Ausente", "Amplitud aumentada", "Reducido"],
              ["Gastrocnemio medial izquierdo", "S1", "Ausente", "Amplitud aumentada", "Levemente reducido"],
              ["Gastrocnemio medial derecho", "S1", "Ausente", "Normales", "Normal"],
              ["Vasto medial izquierdo", "L3–L4", "Ausente", "Normales", "Normal"]
            ], nota: "Paraespinales lumbares bajos sin actividad espontánea." } },
            { p: "Conclusión: radiculopatía L5 bilateral, crónica, de predominio izquierdo, y radiculopatía S1 izquierda leve, sin signos de denervación activa. Sin polineuropatía." },
            { firma: { nombre: "Germán Darío Patarroyo Sierra", cargo: "Médico fisiatra, electrodiagnóstico", registro: "Registro médico SIM-RM-15-0774", fecha: "05/06/2025" } },
            { h: "Valoración por fisiatría · 18/06/2025" },
            { p: "Refiere dolor lumbar continuo (6 de 10) con irradiación a ambas piernas, mayor en la izquierda, sin cambios desde la rehabilitación pese al tratamiento farmacológico. Trabaja en la báscula con las adaptaciones indicadas. Al examen: Lasègue izquierdo positivo a 50°, hipoestesia L5 izquierda, extensor largo del hallux izquierdo 4/5, reflejos aquilianos simétricos. Índice de Oswestry de 46 %, diligenciado en la consulta; refiere que tolera unos 40 minutos sentada y que camina unos 500 m antes de detenerse (no medidos). Concepto de cirugía de columna del 08/04/2025: no indica tratamiento quirúrgico." },
            { p: "Manos: mano derecha con hipoestesia en los dedos 1 a 3 y cicatriz sana. Mano izquierda con Phalen y Tinel positivos, atrofia tenar incipiente y abductor corto del pulgar 4/5." },
            { p: "Concepto: discopatía lumbar con radiculopatía bilateral en mejoría médica máxima; restricciones permanentes. Se ordena neuroconducción de control de miembros superiores por la progresión de la mano izquierda y se sugiere calificación integral." },
            { firma: { nombre: "Adriana Marcela Vargas Holguín", cargo: "Médica fisiatra", registro: "Registro médico SIM-RM-15-1452", fecha: "18/06/2025" } }
          ] },
          { titulo: "Anexo 8 · Informe funcional del 30/10/2025", bloques: [
            { kv: [
              ["Informe", "SIM-IPS-EF-2025-1030"],
              ["Fecha", "30/10/2025"],
              ["Orden", "Fisiatría, 25/09/2025, a solicitud de la paciente para el recurso ante la Junta Nacional"],
              ["Profesionales", "Adriana Marcela Vargas Holguín, fisiatra; Lina Fernanda Chaparro Ávila, terapeuta ocupacional"],
              ["Duración de la valoración", "3 horas, con pausas"],
              ["Componentes", "Entrevista, cuestionarios estandarizados, pruebas de tolerancia postural y de marcha, pruebas de mano, examen neurológico y neuroconducción de control del 21/10/2025"]
            ] },
            { h: "Neuroconducción de control de miembros superiores · 21/10/2025" },
            { tabla: { cols: ["Nervio", "Tipo", "Latencia (ms)", "Amplitud", "Velocidad (m/s)", "Interpretación"], filas: [
              ["Mediano derecho", "Sensitivo", "3,8", "15 µV", "43", "Compromiso residual leve, estable desde 2022"],
              ["Mediano derecho", "Motor", "4,5", "6,3 mV", "52", "Latencia distal levemente prolongada"],
              ["Mediano izquierdo", "Sensitivo", "5,0", "5 µV", "31", "Compromiso severo"],
              ["Mediano izquierdo", "Motor", "6,6", "2,4 mV", "48", "Latencia prolongada, amplitud disminuida: pérdida axonal"],
              ["Cubital izquierdo", "Motor", "2,9", "8,4 mV", "57", "Normal"],
              ["Cubital derecho", "Sensitivo", "2,8", "17 µV", "55", "Normal"]
            ] } },
            { figura: {
              tipo: "neuroconduccion",
              datos: { filas: [
                { nervio: "Mediano derecho", tipo: "sensitivo", latencia: 3.8, latRef: 3.5, amplitud: 15, ampRef: 20, velocidad: 43, velRef: 50 },
                { nervio: "Mediano derecho", tipo: "motor", latencia: 4.5, latRef: 4.2, amplitud: 6.3, ampRef: 5, velocidad: 52, velRef: 50 },
                { nervio: "Mediano izquierdo", tipo: "sensitivo", latencia: 5.0, latRef: 3.5, amplitud: 5, ampRef: 20, velocidad: 31, velRef: 50 },
                { nervio: "Mediano izquierdo", tipo: "motor", latencia: 6.6, latRef: 4.2, amplitud: 2.4, ampRef: 5, velocidad: 48, velRef: 50 },
                { nervio: "Cubital izquierdo", tipo: "motor", latencia: 2.9, latRef: 3.3, amplitud: 8.4, ampRef: 6, velocidad: 57, velRef: 50 },
                { nervio: "Cubital derecho", tipo: "sensitivo", latencia: 2.8, latRef: 3.1, amplitud: 17, ampRef: 10, velocidad: 55, velRef: 50 }
              ] },
              pie: "Neuroconducciones del 21/10/2025: secuela leve a la derecha y compromiso severo del mediano izquierdo, con caída de la amplitud motora."
            } },
            { p: "Electromiografía de aguja: abductor corto del pulgar izquierdo con fibrilaciones y ondas positivas (1+), unidades motoras de gran amplitud y reclutamiento reducido; abductor corto del pulgar derecho sin actividad espontánea, con unidades motoras de reinervación crónica. Conclusión: neuropatía del mediano en el carpo severa a la izquierda, con pérdida axonal; secuela leve estable a la derecha." },
            { firma: { nombre: "Germán Darío Patarroyo Sierra", cargo: "Médico fisiatra, electrodiagnóstico", registro: "Registro médico SIM-RM-15-0774", fecha: "21/10/2025" } },
            { h: "Pruebas de tolerancia, marcha y carga" },
            { tabla: { cols: ["Prueba", "Resultado", "Observación"], filas: [
              ["Tolerancia a la sedestación", "25 minutos", "Se pone de pie por dolor lumbar irradiado"],
              ["Tolerancia a la bipedestación", "30 minutos", "Cambia el apoyo con frecuencia"],
              ["Marcha de 6 minutos", "360 m (cerca de 540 m previstos)", "Dos pausas de 30 segundos; dolor 7 de 10 al final"],
              ["Velocidad de marcha en 10 metros", "0,92 m/s", "Referencia de 1,2 m/s o más"],
              ["Levantamiento del piso a la cintura", "5 kg ocasional", "Se detiene por dolor lumbar"],
              ["Levantamiento de la cintura al hombro", "4 kg ocasional", "Agarre insuficiente con la mano izquierda"],
              ["Índice de Oswestry", "62 %", "Discapacidad en el rango de 61 a 80 %"]
            ] } },
            { h: "Pruebas de mano" },
            { tabla: { cols: ["Prueba", "Derecha", "Izquierda", "Referencia"], filas: [
              ["Dinamometría de agarre (kg)", "15", "10", "Cerca de 25"],
              ["Pinza lateral (kg)", "4,5", "3,0", "Cerca de 7"],
              ["Prueba de las nueve clavijas (s)", "23", "28", "Cerca de 18"],
              ["Monofilamento de Semmes-Weinstein", "3,61", "4,31", "2,83"],
              ["Discriminación de dos puntos (mm)", "7", "9", "Menos de 6"]
            ] } },
            { kv: [["QuickDASH (0 a 100)", "68,2"]] },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Índice de discapacidad de Oswestry",
                unidad: "%",
                forma: "linea",
                puntos: [["Feb. 2024", 52], ["Abr. 2024", 38], ["Jun. 2025", 46], ["Oct. 2025", 62]],
                limite: { valor: 40, etiqueta: "Límite superior de la discapacidad moderada: 40 %" }
              },
              pie: "Febrero y abril de 2024: inicio y fin de la rehabilitación lumbar. Junio de 2025: aplicado en consulta de fisiatría. Octubre de 2025: aplicado en esta valoración estandarizada."
            } },
            { h: "Examen neurológico" },
            { lista: [
              "Lasègue positivo a 45° a la izquierda y a 60° a la derecha.",
              "Hipoestesia en el dermatoma L5 bilateral, mayor a la izquierda.",
              "Extensor largo del hallux 4/5 a la izquierda y 4+/5 a la derecha.",
              "Reflejo aquiliano izquierdo disminuido; rotulianos simétricos.",
              "Mano izquierda: atrofia tenar leve; abductor corto del pulgar 4/5; Phalen y Tinel positivos.",
              "Mano derecha: cicatriz sana; hipoestesia constante en los dedos 1 a 3; abductor corto del pulgar 4+/5; sin atrofia."
            ] },
            { h: "Conclusión" },
            { p: "Limitación funcional permanente para permanecer sentada más de 25 minutos, caminar más de 300 m sin pausa, levantar más de 5 kg y realizar tareas de agarre sostenido y de destreza fina, mayor con la mano izquierda. Los hallazgos son compatibles con los estudios de imagen y de electrodiagnóstico. El cargo de control de pesaje es compatible si se mantienen las restricciones." },
            { firma: { nombre: "Adriana Marcela Vargas Holguín", cargo: "Médica fisiatra", registro: "Registro médico SIM-RM-15-1452", fecha: "30/10/2025" } },
            { firma: { nombre: "Lina Fernanda Chaparro Ávila", cargo: "Terapeuta ocupacional", registro: "Tarjeta profesional SIM-TO-2215", fecha: "30/10/2025" } }
          ] },
          { titulo: "Anexo 9 · Antecedente común: gonartrosis", bloques: [
            { h: "Radiografía de rodillas · 12/03/2024" },
            { p: "Proyecciones anteroposterior con apoyo y lateral de ambas rodillas. Osteofitos marginales pequeños en los compartimentos femorotibiales mediales, con disminución leve del espacio articular medial bilateral. Sin esclerosis subcondral significativa ni deformidad. Grado 2 de Kellgren y Lawrence, bilateral." },
            { firma: { nombre: "Mauricio Esteban Pineda Ortiz", cargo: "Médico radiólogo", registro: "Registro médico SIM-RM-15-1029", fecha: "12/03/2024" } },
            { h: "Ortopedia · 12/03/2024" },
            { p: "Dolor mecánico de rodillas al subir escaleras, sin bloqueos ni derrame. Arcos completos, sin inestabilidad. Diagnóstico: gonartrosis primaria bilateral leve (M17.0), de origen común. Manejo con ejercicio de fortalecimiento y control de peso; seguimiento anual. Sin restricción laboral por esta causa." },
            { firma: { nombre: "Óscar Javier Rodríguez Daza", cargo: "Ortopedista", registro: "Registro médico SIM-RM-15-0841", fecha: "12/03/2024" } },
            { nota: "Se incluye para que la calificación identifique los antecedentes considerados. La gonartrosis no hace parte de las enfermedades laborales del extracto." }
          ] }
        ]
      }
    }
  }
};
