/* ============ Documentos sintéticos · expediente «Montacarguista con firmeza sin verificar» ============
   Mateo Roldán Vega, operador de montacargas reubicado a inventario. Trastorno de disco cervical con
   mielopatía C5–C6 (M50.0), origen laboral confirmado por la Junta Nacional (ORI-L01, 31/03/2025), PCL de
   56,80 % con estructuración el 10/12/2025 (DIC-L01, 18/03/2026), firmeza del 08/04/2026 (FIR-L01),
   solicitud radicada el 21/04/2026 (RAD-L01).
   Aritmética del dictamen (Decreto 1507 de 2014): deficiencias 25, 20, 10 y 10 combinadas = 51,40 %;
   ponderadas al 50 % = 25,70; rol laboral 23,00 + otras áreas ocupacionales 8,10 = 31,10; PCL = 56,80 %.
   IBC: oct.–dic. de 2023 a $3.280.000 y ene.–sep. de 2024 a $3.460.000; suma $40.980.000; promedio $3.415.000.
   Vibración (ISO 2631-1): a_w,z 0,73 m/s² durante 5 h → A(8) = 0,73 × √(5/8) = 0,58 m/s².
   Todo es sintético: ninguna persona, número, profesional ni documento es real. */
DOCS.exp["PI-L01"] = {
  identidad: {
    documento: "C.C. SIM-71.384.226",
    historia: "Historia clínica SIM-0471-2023",
    afiliacionArl: "SIM-ARL-2013-55810",
    afiliacionEps: "SIM-EPS-2004-310572",
    afiliacionAfp: "SIM-AFP-1996-208841",
    nitEmpleador: "NIT SIM-900.412.733-5",
    nitArl: "NIT SIM-800.256.433-1",
    nitEps: "NIT SIM-811.040.215-6",
    nitIps: "NIT SIM-901.227.604-0",
    nitJuntaNacional: "NIT SIM-830.026.324-5",
    nitHigiene: "NIT SIM-901.554.208-3",
    dictamenOrigenEps: "SIM-EPS-ML-2024-08812",
    dictamenJuntaRegional: "SIM-JRCIA-2025-01173",
    radicadoJuntaNacional: "SIM-JNCI-2025-02417",
    actaNotificacion: "SIM-NOT-2026-03311",
    informeVibracion: "SIM-HI-2023-0877",
    analisisPuesto: "SIM-SST-APT-2024-031",
    resumenClinico: "SIM-IPS-RC-2026-0047",
    certificadoAfiliacion: "SIM-CAF-2026-04187",
    certificadoIbcInicial: "SIM-NOM-2026-0388",
    certificadoIbcCorregido: "SIM-NOM-2026-0412",
    cuentaBancaria: "SIM-0012-4477-0931"
  },

  soportes: {

    /* ---------------------------------------------------------------- Solicitud e identidad */
    SOL: {
      v1: {
        tipo: "solicitud",
        titulo: "Solicitud de reconocimiento de pensión de invalidez de origen laboral",
        emisor: { n: "Mateo Roldán Vega", area: "Solicitante", ciudad: "Bello, Antioquia", id: "C.C. SIM-71.384.226" },
        numero: "RAD-L01",
        fecha: "21/04/2026",
        version: "v1",
        estadoNota: "",
        paginas: [
          { titulo: "Solicitud", bloques: [
            { kv: [
              ["Dirigida a", "ARL SURA · Prestaciones económicas"],
              ["Radicado", "RAD-L01"],
              ["Fecha de radicación", "21/04/2026"],
              ["Prestación solicitada", "Pensión de invalidez de origen laboral"],
              ["Canal", "Oficina de atención de ARL SURA en Medellín, de forma presencial"]
            ] },
            { h: "Datos del solicitante" },
            { kv: [
              ["Nombre", "Mateo Roldán Vega"],
              ["Documento de identidad", "C.C. SIM-71.384.226"],
              ["Fecha de nacimiento", "19/09/1973"],
              ["Edad", "52 años"],
              ["Sexo", "Masculino"],
              ["Municipio de residencia", "Bello, Antioquia"],
              ["Afiliación a riesgos laborales", "ARL SURA · afiliación SIM-ARL-2013-55810"],
              ["EPS", "EPS SURA"],
              ["Fondo de pensiones", "Cordillera Pensiones y Cesantías"],
              ["Empleador", "Depósitos Andén Umbral · NIT SIM-900.412.733-5"],
              ["Cargo actual", "Auxiliar de inventario, reubicado desde el 01/02/2024"],
              ["Notificaciones", "Autoriza la notificación electrónica a los datos de contacto que tiene registrados en la ARL. No se reproducen en esta copia."]
            ] },
            { h: "Hechos" },
            { lista: [
              "Trabajo en Depósitos Andén Umbral desde el 01/02/2013. Entre esa fecha y el 31/01/2024 conduje un montacargas retráctil en el centro de distribución de Girardota. Antes, entre 2004 y 2013, fui operador de montacargas de combustión en otra empresa.",
              "Me diagnosticaron un trastorno de disco cervical con mielopatía (M50.0). El 22/05/2024 me operaron de la columna cervical y después hice 24 sesiones de rehabilitación.",
              "Desde el 01/02/2024 trabajo como auxiliar de inventario en la misma empresa, con restricciones médicas. No puedo conducir.",
              "La Junta Nacional de Calificación de Invalidez confirmó el 31/03/2025 que la enfermedad es de origen laboral (dictamen ORI-L01).",
              "ARL SURA me calificó una pérdida de capacidad laboral del 56,80 %, de origen laboral, con fecha de estructuración del 10/12/2025 (dictamen DIC-L01 del 18/03/2026). Me lo notificaron el 19/03/2026 y no presenté inconformidad.",
              "Estoy afiliado a ARL SURA por mi empleador desde el 01/02/2013."
            ] },
            { h: "Petición" },
            { p: "Solicito que ARL SURA reconozca y pague la pensión de invalidez de origen laboral, de acuerdo con los artículos 9 y 10 de la Ley 776 de 2002, desde la fecha que corresponda según el dictamen." },
            { p: "Pido también que me informen a quién le corresponde el siguiente paso del trámite y si falta algún documento. No tengo la constancia de firmeza del dictamen: ARL SURA no me la ha entregado." },
            { h: "Documentos que adjunto" },
            { tabla: {
              cols: ["N.º", "Documento", "Folios"],
              filas: [
                ["1", "Copia de la cédula de ciudadanía C.C. SIM-71.384.226", "1"],
                ["2", "Copia del dictamen de pérdida de capacidad laboral DIC-L01 del 18/03/2026, notificado el 19/03/2026", "5"],
                ["3", "Copia del dictamen de la Junta Nacional de Calificación de Invalidez ORI-L01 del 31/03/2025", "3"],
                ["4", "Certificado de ingreso base de cotización SIM-NOM-2026-0388, expedido por Depósitos Andén Umbral el 16/04/2026", "2"],
                ["5", "Certificación de la cuenta de ahorros SIM-0012-4477-0931 del Banco Ladera, para el pago", "1"]
              ],
              nota: "Con el formulario (2 folios), la solicitud suma 14 folios."
            } },
            { p: "Declaro que la información es cierta. Autorizo a ARL SURA a consultar mi historia clínica y mi historia laboral solo para resolver esta solicitud." },
            { firma: { nombre: "Mateo Roldán Vega", cargo: "Solicitante", registro: "C.C. SIM-71.384.226", fecha: "21/04/2026" } }
          ] },
          { titulo: "Constancia de radicación", bloques: [
            { kv: [
              ["Entidad", "ARL SURA · Prestaciones económicas"],
              ["Radicado", "RAD-L01"],
              ["Fecha y hora", "21/04/2026, 10:42"],
              ["Trámite", "Solicitud de pensión de invalidez de origen laboral"],
              ["Titular", "Mateo Roldán Vega · C.C. SIM-71.384.226"],
              ["Verificación de identidad", "Documento original exhibido en ventanilla. Coincide con el titular del dictamen DIC-L01 y de la afiliación SIM-ARL-2013-55810."],
              ["Folios recibidos", "14"]
            ] },
            { h: "Documentos recibidos" },
            { tabla: {
              cols: ["Documento", "Folios"],
              filas: [
                ["Formulario de solicitud firmado", "2"],
                ["Copia de la cédula de ciudadanía", "1"],
                ["Copia del dictamen DIC-L01 del 18/03/2026", "5"],
                ["Copia del dictamen ORI-L01 del 31/03/2025", "3"],
                ["Certificado de IBC SIM-NOM-2026-0388 del 16/04/2026", "2"],
                ["Certificación bancaria", "1"]
              ],
              nota: ""
            } },
            { p: "La radicación no implica que la solicitud haya sido aceptada. Prestaciones económicas revisará el expediente y, si falta algún soporte, lo pedirá a la dependencia o a la entidad que lo custodia, o al solicitante." },
            { p: "ARL SURA comunicará al solicitante el estado del trámite por el canal de notificación que autorizó." },
            { firma: { nombre: "Kelly Tatiana Úsuga Mesa", cargo: "Auxiliar de radicación, ARL SURA", registro: "", fecha: "21/04/2026" } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Confirmación del origen */
    ORI: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de calificación del origen · Recurso de apelación",
        emisor: { n: "Junta Nacional de Calificación de Invalidez", area: "Sala de decisión n.º 2", ciudad: "Bogotá D.C.", id: "NIT SIM-830.026.324-5" },
        numero: "ORI-L01",
        fecha: "31/03/2025",
        version: "v1",
        estadoNota: "",
        paginas: [
          { titulo: "Dictamen", bloques: [
            { kv: [
              ["Número del dictamen", "ORI-L01"],
              ["Radicado interno", "SIM-JNCI-2025-02417"],
              ["Fecha del dictamen", "31/03/2025"],
              ["Tipo de calificación", "Origen de la enfermedad"],
              ["Instancia", "Segunda instancia · recurso de apelación"],
              ["Dictamen recurrido", "Junta Regional de Calificación de Invalidez de Antioquia, n.º SIM-JRCIA-2025-01173 del 12/02/2025"],
              ["Recurrente", "ARL SURA, recurso presentado el 27/02/2025"],
              ["Recibo del expediente", "12/03/2025"],
              ["Médica ponente", "Beatriz Elena Lozano Prada"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Mateo Roldán Vega"],
              ["Documento", "C.C. SIM-71.384.226"],
              ["Fecha de nacimiento", "19/09/1973"],
              ["Edad", "51 años"],
              ["Sexo", "Masculino"],
              ["Residencia", "Bello, Antioquia"],
              ["Escolaridad", "Bachiller con formación técnica en logística"],
              ["Dominancia", "Diestro"],
              ["Ocupación", "Operador de montacargas retráctil hasta el 31/01/2024; auxiliar de inventario desde el 01/02/2024"],
              ["Empleador", "Depósitos Andén Umbral · NIT SIM-900.412.733-5"]
            ] },
            { h: "Entidades interesadas" },
            { tabla: {
              cols: ["Entidad", "Calidad en el trámite"],
              filas: [
                ["ARL SURA", "Administradora de riesgos laborales. Manifestó inconformidad y apeló."],
                ["EPS SURA", "Entidad promotora de salud. Calificó el origen en primera oportunidad."],
                ["Depósitos Andén Umbral", "Empleador"],
                ["Cordillera Pensiones y Cesantías", "Administradora de fondos de pensiones"]
              ],
              nota: ""
            } },
            { h: "Antecedentes del trámite" },
            { tabla: {
              cols: ["Fecha", "Actuación"],
              filas: [
                ["01/10/2024", "EPS SURA califica en primera oportunidad el diagnóstico M50.0 como de origen laboral (dictamen SIM-EPS-ML-2024-08812)."],
                ["04/10/2024", "ARL SURA manifiesta inconformidad. El expediente se remite a la Junta Regional de Calificación de Invalidez de Antioquia."],
                ["12/02/2025", "La Junta Regional determina origen laboral (dictamen SIM-JRCIA-2025-01173). Se notifica el 14/02/2025."],
                ["27/02/2025", "ARL SURA interpone recurso de apelación dentro del término de 10 días hábiles."],
                ["12/03/2025", "La Junta Nacional recibe el expediente y lo asigna a la Sala de decisión n.º 2."]
              ],
              nota: ""
            } },
            { h: "Argumentos del recurrente" },
            { lista: [
              "La medición de vibración corresponde a un único turno y no demuestra la exposición de once años en el cargo.",
              "El valor A(8) de 0,58 m/s² no supera el valor límite de 1,15 m/s² que el mismo informe toma como referencia.",
              "La enfermedad discal cervical es degenerativa y frecuente a esta edad, y la vibración de cuerpo entero se ha asociado sobre todo con patología lumbar."
            ] }
          ] },
          { titulo: "Consideraciones y decisión", bloques: [
            { h: "Fundamentos de hecho" },
            { p: "El calificado trabajó 8 años como auxiliar de despachos con manipulación manual de cargas (1996 a 2004), 9 años como operador de montacargas de combustión en un patio de carga, con unas 4,5 horas de conducción por turno de 8 horas (2004 a 2013), y 11 años como operador de montacargas retráctil en el centro de distribución de Girardota de Depósitos Andén Umbral, con unas 5 horas de conducción y cerca de 75 ciclos de elevación y ubicación por turno (2013 a 2024)." },
            { p: "El 18/05/2023 consultó por dolor cervical, torpeza para agarrar herramientas y parestesias en ambas manos. Ortopedia encontró signos de mielopatía el 13/09/2023. La resonancia magnética del 14/03/2024 mostró hernia discal C5–C6 con estenosis del canal y señal de mielopatía compresiva. El 22/05/2024 se practicó discectomía y artrodesis cervical anterior C5–C6, seguida de 60 días de incapacidad y 24 sesiones de rehabilitación entre julio y octubre de 2024. Persisten alteración de la marcha y pérdida de destreza manual. Desde el 01/02/2024 fue reubicado como auxiliar de inventario." },
            { p: "El informe de medición SIM-HI-2023-0877 del 30/08/2023 identifica el equipo (montacargas retráctil eléctrico SIM-MR-07), el operador, el turno de 06:00 a 14:00 y el recorrido por muelles y pasillos con juntas de piso. Registró en el eje z, dominante, un valor A(8) de 0,58 m/s², un factor de cresta de 10,2 y un valor de dosis de vibración diario de 13,1 m/s^1,75." },
            { h: "Análisis de la relación de causalidad" },
            { lista: [
              "Diagnóstico: el trastorno de disco cervical con mielopatía C5–C6 está demostrado por la clínica, la resonancia magnética del 14/03/2024 y los hallazgos operatorios del 22/05/2024.",
              "Exposición: unos 20 años de conducción de montacargas. En el equipo que operó los últimos 11 años, la medición registró vibración de cuerpo entero por encima del valor de acción (A(8) de 0,58 m/s² frente a 0,5 m/s²) y con impactos repetidos, como indica el factor de cresta superior a 9.",
              "Carga cervical: la tarea exigía extensión cervical de 25° a 40° para ver el mástil y rotación mayor de 45° al retroceder, unas 75 veces por turno, según el análisis de puesto SIM-SST-APT-2024-031.",
              "Temporalidad: los síntomas se registran por primera vez el 18/05/2023, cuando el trabajador llevaba más de 19 años conduciendo montacargas y seguía expuesto.",
              "Factores extralaborales: sin antecedente de trauma cervical; no fuma; no practica deportes de contacto. La hipertensión arterial, controlada, no se relaciona con la patología discal."
            ] },
            { h: "Respuesta a los argumentos del recurso" },
            { p: "Sobre el primer argumento: el informe identifica equipo, operador, turno y recorrido, y el empleador certificó que el trabajador operó ese modelo de equipo por las mismas rutas durante todo el período en el cargo, y el registro de horas de operación, disponible desde 2018, muestra unas 5 horas diarias de conducción. La reparación parcial del piso ocurrió en 2024, después del período de exposición evaluado." },
            { p: "Sobre el segundo: el valor de acción marca el nivel desde el cual la exposición supone un riesgo para la salud que obliga a adoptar medidas; el valor límite no es un umbral por debajo del cual la exposición sea inocua. Con un factor de cresta superior a 9, la norma ISO 2631-1 advierte que el método básico subestima el efecto de los impactos; por eso el informe calcula el valor de dosis de vibración, que también supera el valor de acción." },
            { p: "Sobre el tercero: la Sala reconoce el componente degenerativo, presente en varios niveles. Sin embargo, la lesión que comprime la médula está en C5–C6, el segmento más solicitado por la extensión y la rotación cervical forzadas que exigía la tarea, sumadas a la carga transmitida por los impactos. La calificación del origen exige establecer la relación de causalidad entre la enfermedad y los factores de riesgo del trabajo (Ley 1562 de 2012, art. 4), y la Sala la encuentra demostrada aun con cambios degenerativos asociados a la edad." },
            { h: "Decisión" },
            { p: "La Sala de decisión n.º 2 de la Junta Nacional de Calificación de Invalidez, por unanimidad, resuelve confirmar el dictamen SIM-JRCIA-2025-01173 del 12/02/2025 de la Junta Regional de Calificación de Invalidez de Antioquia en cuanto al origen." },
            { kv: [
              ["Diagnóstico", "M50.0 · Trastorno de disco cervical con mielopatía"],
              ["Origen", "Enfermedad laboral"],
              ["Fecha de la decisión", "31/03/2025"]
            ] },
            { h: "Fundamentos de derecho" },
            { lista: [
              "Ley 100 de 1993, art. 41, modificado por el Decreto Ley 019 de 2012, art. 142: calificación en primera oportunidad y controversia ante las juntas.",
              "Ley 1562 de 2012, art. 4: definición de enfermedad laboral.",
              "Decreto 1477 de 2014: tabla de enfermedades laborales y relación de causalidad con los factores de riesgo ocupacional.",
              "Decreto 1352 de 2013, compilado en el Decreto 1072 de 2015: organización de las juntas de calificación de invalidez y trámite del recurso de apelación."
            ] },
            { h: "Recursos y comunicación" },
            { p: "Este dictamen resuelve el recurso de apelación y contra él no procede recurso alguno ante las juntas. Las controversias sobre su contenido corresponden a la justicia laboral ordinaria. Se comunica a la persona calificada, a ARL SURA, a EPS SURA, a Depósitos Andén Umbral y a Cordillera Pensiones y Cesantías." },
            { firma: { nombre: "Beatriz Elena Lozano Prada", cargo: "Médica ponente, especialista en medicina del trabajo", registro: "Registro médico SIM-25-30418", fecha: "31/03/2025" } },
            { firma: { nombre: "Fernando Ignacio Castañeda Rivas", cargo: "Médico integrante de la Sala de decisión n.º 2", registro: "Registro médico SIM-11-27093", fecha: "31/03/2025" } },
            { firma: { nombre: "Liliana Patricia Herrán Ortiz", cargo: "Terapeuta ocupacional integrante de la Sala de decisión n.º 2", registro: "Tarjeta profesional SIM-TO-2290", fecha: "31/03/2025" } }
          ] },
          { titulo: "Anexo · Pruebas que integran el expediente", bloques: [
            { tabla: {
              cols: ["Documento", "Fecha", "Emisor", "Aporte a la decisión"],
              filas: [
                ["Historia clínica de la EPS y su red", "18/05/2023 a 01/10/2024", "EPS SURA", "Síntomas registrados desde el 18/05/2023 y signos de mielopatía desde el 13/09/2023"],
                ["Radiografía de columna cervical", "06/06/2023", "Servicio de radiología de la red de la EPS", "Disminución del espacio discal C5–C6 con osteofitos"],
                ["Electromiografía y neuroconducciones", "23/01/2024", "Laboratorio de electrodiagnóstico", "Radiculopatía C6 derecha crónica leve, sin neuropatía por atrapamiento"],
                ["Resonancia magnética de columna cervical", "14/03/2024", "Servicio de radiología", "Hernia discal C5–C6, estenosis del canal y señal de mielopatía"],
                ["Descripción quirúrgica", "22/05/2024", "IPS Eje Raquídeo Aburrá", "Complejo disco-osteofitario C5–C6 que comprimía el saco dural"],
                ["Informe de medición de vibración SIM-HI-2023-0877", "30/08/2023", "Medición Ocupacional Altiplano S.A.S.", "A(8) eje z 0,58 m/s², factor de cresta 10,2, valor de dosis diario 13,1 m/s^1,75"],
                ["Certificación de cargos y funciones", "09/08/2024", "Depósitos Andén Umbral, gestión humana", "Cargos, fechas y equipo asignado entre 2013 y 2024"],
                ["Análisis de puesto de trabajo SIM-SST-APT-2024-031", "21/08/2024", "Depósitos Andén Umbral, SG-SST", "5 horas de conducción por turno y 75 ciclos con extensión y rotación cervical"],
                ["Dictamen de origen SIM-EPS-ML-2024-08812", "01/10/2024", "EPS SURA", "Origen laboral en primera oportunidad"],
                ["Dictamen SIM-JRCIA-2025-01173", "12/02/2025", "Junta Regional de Calificación de Invalidez de Antioquia", "Origen laboral"],
                ["Recurso de apelación", "27/02/2025", "ARL SURA", "Argumentos resumidos en este dictamen"]
              ],
              nota: "El expediente se recibió completo y foliado. No se requirieron pruebas adicionales."
            } },
            { nota: "Comunicado a las partes el 02/04/2025." }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Dictamen de PCL */
    DIC: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de pérdida de capacidad laboral y ocupacional",
        emisor: { n: "ARL SURA", area: "Medicina laboral", ciudad: "Medellín", id: "NIT SIM-800.256.433-1" },
        numero: "DIC-L01",
        fecha: "18/03/2026",
        version: "v1",
        estadoNota: "",
        paginas: [
          { titulo: "Dictamen", bloques: [
            { kv: [
              ["Número del dictamen", "DIC-L01"],
              ["Versión", "v1"],
              ["Fecha del dictamen", "18/03/2026"],
              ["Tipo de calificación", "Pérdida de capacidad laboral y ocupacional, primera oportunidad"],
              ["Entidad calificadora", "ARL SURA · Medicina laboral · Medellín"],
              ["Manual aplicado", "Decreto 1507 de 2014, Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional"],
              ["Motivo", "Calificar las secuelas de la enfermedad cuyo origen laboral quedó definido por la Junta Nacional (ORI-L01, 31/03/2025)"],
              ["Valoración presencial", "24/02/2026"],
              ["Código de verificación", "SIM-VER-7F3A-21C9"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Mateo Roldán Vega"],
              ["Documento", "C.C. SIM-71.384.226"],
              ["Fecha de nacimiento", "19/09/1973"],
              ["Edad", "52 años"],
              ["Sexo", "Masculino"],
              ["Residencia", "Bello, Antioquia"],
              ["Escolaridad", "Bachiller con formación técnica en logística"],
              ["Dominancia", "Diestro"],
              ["Estado civil", "Unión marital de hecho"],
              ["Afiliación a la ARL", "ARL SURA · SIM-ARL-2013-55810"],
              ["EPS", "EPS SURA · SIM-EPS-2004-310572"],
              ["Fondo de pensiones", "Cordillera Pensiones y Cesantías · SIM-AFP-1996-208841"],
              ["Empleador", "Depósitos Andén Umbral · NIT SIM-900.412.733-5"],
              ["Cargo habitual", "Operador de montacargas retráctil (01/02/2013 a 31/01/2024)"],
              ["Cargo actual", "Auxiliar de inventario, reubicado desde el 01/02/2024"]
            ] },
            { h: "Antecedentes laborales" },
            { tabla: {
              cols: ["Período", "Empresa", "Cargo", "Exposición relevante"],
              filas: [
                ["01/02/1996 a 31/01/2004", "Bodegas Travesía Norte", "Auxiliar de despachos", "Manipulación manual de cajas de 12 a 22 kg, 2,5 h por turno"],
                ["01/02/2004 a 31/01/2013", "Operaciones Cauce Industrial", "Operador de montacargas de combustión", "Conducción 4,5 h por turno; marcha atrás en muelles"],
                ["01/02/2013 a 31/01/2024", "Depósitos Andén Umbral", "Operador de montacargas retráctil", "Conducción 5 h por turno; vibración con impactos; extensión y rotación cervical"],
                ["01/02/2024 a la fecha", "Depósitos Andén Umbral", "Auxiliar de inventario", "Sin conducción; alterna sentado y de pie"]
              ],
              nota: ""
            } },
            { h: "Fundamentos de hecho" },
            { p: "Hombre de 52 años, diestro. Trabajó 20 años como operador de montacargas: 9 en montacargas de combustión y 11 en montacargas retráctil en el centro de distribución de Girardota, con unas 5 horas de conducción por turno, vibración de cuerpo entero con impactos y posturas forzadas de cuello. Desde el 01/02/2024 trabaja como auxiliar de inventario en la misma empresa, con restricciones médicas." },
            { p: "Consultó el 18/05/2023 por dolor cervical, torpeza para agarrar herramientas y parestesias en las manos. La resonancia magnética del 14/03/2024 mostró hernia discal C5–C6 con estenosis del canal y signos de mielopatía compresiva. El 22/05/2024 se le practicó discectomía y artrodesis cervical anterior C5–C6, con incapacidad de 60 días (22/05/2024 a 20/07/2024) y 24 sesiones de rehabilitación ambulatoria entre julio y octubre de 2024." },
            { p: "La resonancia de control del 18/11/2025 muestra la artrodesis C5–C6 sin compresión residual y un foco de mielomalacia a ese nivel. En la valoración por fisiatría del 10/12/2025 se documenta mejoría médica máxima, con alteración de la marcha y pérdida de destreza manual bilateral de predominio derecho, y se mantiene la restricción de conducción. La valoración presencial del 24/02/2026 en ARL SURA confirma esos hallazgos (anexo 2)." },
            { p: "El origen laboral del diagnóstico quedó definido por la Junta Nacional de Calificación de Invalidez en el dictamen ORI-L01 del 31/03/2025, que confirmó el dictamen SIM-JRCIA-2025-01173 de la Junta Regional de Antioquia." },
            { h: "Diagnósticos" },
            { tabla: {
              cols: ["CIE-10", "Diagnóstico", "Origen", "Se califica"],
              filas: [
                ["M50.0", "Trastorno de disco cervical con mielopatía, operado (artrodesis C5–C6)", "Laboral (ORI-L01)", "Sí"],
                ["I10X", "Hipertensión esencial (primaria), controlada", "Común", "No. Antecedente sin relación con la enfermedad laboral"]
              ],
              nota: ""
            } }
          ] },
          { titulo: "Título I · Valoración de las deficiencias", bloques: [
            { tabla: {
              cols: ["Capítulo y criterio", "Deficiencia", "Clase", "Factores de ajuste", "Valor (%)"],
              filas: [
                ["Capítulo 12 · Uso de las extremidades superiores", "Extremidad superior derecha (dominante): usa la extremidad, pero con dificultad para el autocuidado (abotonarse, cortar alimentos duros); pérdida de destreza digital y agarre débil; dificultad para sostener herramientas y escribir", "Clase 3", "No aplican en este capítulo", "25,00"],
                ["Capítulo 12 · Estación y marcha", "Se levanta y camina sin ayudas técnicas, con dificultad y por distancias cortas; base ampliada, tándem no logrado; en escaleras y desniveles necesita el pasamanos", "Clase 2", "No aplican en este capítulo", "20,00"],
                ["Capítulo 12 · Uso de las extremidades superiores", "Extremidad superior izquierda (no dominante): agarre disminuido y torpeza digital; sostiene objetos con dificultad", "Clase 2", "No aplican en este capítulo", "10,00"],
                ["Capítulo 15 · Columna cervical", "Hernia discal C5–C6 operada (discectomía y artrodesis instrumentada de un nivel), con radiculopatía C6 derecha residual documentada; la mielopatía se califica en el capítulo 12", "Clase 2", "Factor principal: clase 2. Historia funcional: grado 1, dolor cervical intermitente con los esfuerzos (ajuste −1); la limitación funcional por la mielopatía ya se valora en el capítulo 12. Examen físico y estudios clínicos usados para asignar la clase. Ajuste neto −1", "10,00"]
              ],
              nota: "Las deficiencias neurológicas se califican por la mielopatía residual; la de columna, por la lesión estructural y la radiculopatía C6 residual. Ningún hallazgo se cuenta dos veces."
            } },
            { h: "Combinación de las deficiencias" },
            { tabla: {
              cols: ["Paso", "Valores que se combinan", "Cálculo", "Resultado (%)"],
              filas: [
                ["1", "25,00 y 20,00", "25,00 + 20,00 × (100 − 25,00) / 100", "40,00"],
                ["2", "40,00 y 10,00", "40,00 + 10,00 × (100 − 40,00) / 100", "46,00"],
                ["3", "46,00 y 10,00", "46,00 + 10,00 × (100 − 46,00) / 100", "51,40"]
              ],
              nota: "Fórmula de combinación del Decreto 1507 de 2014: A + B × (100 − A) / 100, de mayor a menor valor."
            } },
            { kv: [
              ["Valor final de las deficiencias", "51,40 %"],
              ["Título I ponderado al 50 %", "25,70 %"]
            ] },
            { nota: "La hipertensión arterial, de origen común y controlada, no hace parte de esta calificación." }
          ] },
          { titulo: "Título II y concepto final", bloques: [
            { h: "Título II · Valoración del rol laboral, rol ocupacional y otras áreas ocupacionales" },
            { p: "Valoración realizada por terapia ocupacional el 24/02/2026, con entrevista, observación de actividades y revisión del análisis de puesto SIM-SST-APT-2024-031 y del cargo actual." },
            { tabla: {
              cols: ["Rol laboral", "Criterio aplicado", "Valor (%)", "Máximo (%)"],
              filas: [
                ["Restricciones del rol laboral", "Restricciones completas para el rol laboral habitual: no puede conducir montacargas ni manipular cargas. Reubicación laboral definitiva en un cargo distinto dentro de la misma empresa.", "20,00", "25,00"],
                ["Autosuficiencia económica", "Reajustado: conserva el salario, con gastos adicionales derivados de la enfermedad", "1,00", "2,50"],
                ["Edad", "52 años", "2,00", "2,50"],
                ["Subtotal", "", "23,00", "30,00"]
              ],
              nota: ""
            } },
            { tabla: {
              cols: ["Otras áreas ocupacionales", "Actividades con dificultad", "Valor (%)", "Máximo (%)"],
              filas: [
                ["Aprendizaje y aplicación del conocimiento", "Escritura manual lenta y poco legible", "0,40", "4,00"],
                ["Comunicación", "Producción de mensajes escritos; uso de dispositivos con teclado pequeño", "0,60", "4,00"],
                ["Movilidad", "Andar distancias largas, subir escaleras, levantar y llevar objetos, uso fino de la mano, conducir", "3,00", "4,00"],
                ["Autocuidado personal", "Vestirse (botones y cordones), cortar los alimentos, cuidado de partes del cuerpo", "1,80", "4,00"],
                ["Vida doméstica", "Preparar comidas, quehaceres de la casa, cuidado de los objetos del hogar", "2,30", "4,00"],
                ["Subtotal", "", "8,10", "20,00"]
              ],
              nota: "Cada área suma diez actividades calificadas de 0 a 0,4 según el grado de dificultad."
            } },
            { kv: [["Total Título II", "31,10 %"]] },
            { h: "Concepto final" },
            { tabla: {
              cols: ["Componente", "Valor (%)"],
              filas: [
                ["Título I · Deficiencias, ponderado al 50 %", "25,70"],
                ["Título II · Rol laboral, rol ocupacional y otras áreas ocupacionales", "31,10"],
                ["Pérdida de capacidad laboral y ocupacional", "56,80"]
              ],
              nota: ""
            } },
            { kv: [
              ["Pérdida de capacidad laboral", "56,80 %"],
              ["Origen", "Laboral · enfermedad laboral (ORI-L01 del 31/03/2025)"],
              ["Diagnóstico calificado", "M50.0 · Trastorno de disco cervical con mielopatía"],
              ["Fecha de estructuración", "10/12/2025"],
              ["Requiere de terceras personas para las actividades de la vida diaria", "No. Necesita ayuda ocasional para abotonarse y cortar alimentos duros"],
              ["Requiere de terceras personas para tomar decisiones", "No"]
            ] },
            { h: "Fundamento de la fecha de estructuración" },
            { p: "Se fija el 10/12/2025, fecha de la valoración por fisiatría que documenta la mejoría médica máxima y las secuelas que sustentan la pérdida calificada (Decreto 1507 de 2014, art. 3)." },
            { p: "Las mediciones de octubre de 2024 ya eran parecidas, pero entonces no podía establecerse que las secuelas fueran permanentes: la recuperación neurológica después de la descompresión medular puede continuar durante uno a dos años, la artrodesis seguía en consolidación en el control del 21/01/2025 y la lesión medular permanente (mielomalacia) solo se documentó en la resonancia de control del 18/11/2025. La valoración del 10/12/2025, a más de 18 meses de la cirugía y tras más de un año sin cambios, es la primera que establece la mejoría médica máxima y las restricciones permanentes; antes de ella la historia clínica no permite fijar el momento en que se alcanzó el 50 % de pérdida." },
            { h: "Fundamentos de derecho" },
            { lista: [
              "Ley 100 de 1993, art. 41, modificado por el Decreto Ley 019 de 2012, art. 142.",
              "Ley 776 de 2002, prestaciones económicas del Sistema General de Riesgos Laborales.",
              "Ley 1562 de 2012, que modifica el Sistema General de Riesgos Laborales.",
              "Decreto 1507 de 2014, Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional.",
              "Dictamen ORI-L01 de la Junta Nacional de Calificación de Invalidez, que definió el origen laboral."
            ] },
            { h: "Notificación y recursos" },
            { p: "Este dictamen se notifica a la persona calificada y se comunica a Depósitos Andén Umbral, a EPS SURA y a Cordillera Pensiones y Cesantías. Cualquiera de ellos puede manifestar su inconformidad ante ARL SURA dentro de los 10 días hábiles siguientes a su notificación. En ese caso, ARL SURA remitirá el expediente a la Junta Regional de Calificación de Invalidez de Antioquia dentro de los 5 días siguientes. Si nadie manifiesta inconformidad dentro del término, el dictamen queda en firme." },
            { p: "El reconocimiento de las prestaciones económicas que se deriven de este dictamen se tramita por separado ante prestaciones económicas de ARL SURA." },
            { firma: { nombre: "Esteban Quiroz Llano", cargo: "Médico especialista en medicina del trabajo, ARL SURA", registro: "Registro médico SIM-05-220711", fecha: "18/03/2026" } },
            { firma: { nombre: "Daniela Ospina Rentería", cargo: "Terapeuta ocupacional, especialista en seguridad y salud en el trabajo, ARL SURA", registro: "Tarjeta profesional SIM-TO-4418", fecha: "18/03/2026" } },
            { nota: "Notificado personalmente a la persona calificada el 19/03/2026 (acta SIM-NOT-2026-03311). Comunicado el mismo día al empleador, a EPS SURA y al fondo de pensiones." }
          ] },
          { titulo: "Anexo 1 · Documentos y pruebas valorados", bloques: [
            { tabla: {
              cols: ["Documento", "Fecha", "Emisor", "Hallazgo relevante"],
              filas: [
                ["Dictamen de origen ORI-L01", "31/03/2025", "Junta Nacional de Calificación de Invalidez", "Origen laboral de M50.0"],
                ["Resumen de historia clínica SIM-IPS-RC-2026-0047", "20/01/2026", "IPS Eje Raquídeo Aburrá", "Evolución desde 2023, cirugía, rehabilitación y restricciones"],
                ["Electromiografía y neuroconducciones", "23/01/2024", "Laboratorio de electrodiagnóstico", "Radiculopatía C6 derecha crónica leve"],
                ["Resonancia magnética de columna cervical", "14/03/2024", "Servicio de radiología", "Hernia discal C5–C6 con estenosis del canal y mielopatía"],
                ["Descripción quirúrgica", "22/05/2024", "IPS Eje Raquídeo Aburrá", "Discectomía y artrodesis cervical anterior C5–C6"],
                ["Informe de rehabilitación", "10/10/2024", "IPS Eje Raquídeo Aburrá", "24 sesiones; mejoría parcial de marcha y destreza"],
                ["Resonancia magnética de control", "18/11/2025", "Servicio de radiología", "Artrodesis sin compresión; mielomalacia C5–C6"],
                ["Valoración por fisiatría", "10/12/2025", "IPS Eje Raquídeo Aburrá", "Mejoría médica máxima; restricciones permanentes"],
                ["Análisis de puesto de trabajo SIM-SST-APT-2024-031", "21/08/2024", "Depósitos Andén Umbral, SG-SST", "Cargo habitual y cargo actual"],
                ["Valoración presencial y de terapia ocupacional", "24/02/2026", "ARL SURA, medicina laboral", "Examen físico y pruebas funcionales (anexo 2)"]
              ],
              nota: ""
            } }
          ] },
          { titulo: "Anexo 2 · Valoración presencial del 24/02/2026", bloques: [
            { h: "Examen físico" },
            { lista: [
              "Columna cervical: cicatriz anterior derecha sana. Flexión 30°, extensión 20°, rotación 50° a cada lado, con dolor al final del arco.",
              "Fuerza: 4/5 en los músculos intrínsecos de ambas manos y en los flexores de los dedos de la mano derecha; 5/5 en el resto de los grupos.",
              "Reflejos: bicipital disminuido y braquiorradial invertido a la derecha; tricipitales y rotulianos aumentados; Hoffmann positivo bilateral; clonus aquíleo agotable bilateral.",
              "Sensibilidad: hipoestesia en guante en ambas manos, de predominio derecho, e hipoestesia en la cara lateral del antebrazo y el pulgar derechos (dermatoma C6).",
              "Marcha: base ampliada; tándem no logrado; Romberg con oscilación, sin caída. Sube y baja escaleras paso a paso con apoyo en el pasamanos."
            ] },
            { h: "Pruebas funcionales" },
            { tabla: {
              cols: ["Prueba", "Resultado", "Referencia"],
              filas: [
                ["Dinamometría de agarre", "Derecha 22 kg · izquierda 27 kg", "Cerca de 45 kg (derecha) y 42 kg (izquierda) para hombres de su edad"],
                ["Prueba de las nueve clavijas", "Derecha 31 s · izquierda 27 s", "Cerca de 19 s (derecha) y 20 s (izquierda)"],
                ["Escala mJOA de mielopatía cervical", "13 de 18 (mielopatía moderada)", "18"],
                ["Velocidad de marcha en 10 metros", "0,88 m/s", "1,2 m/s o más"],
                ["Escala de equilibrio de Berg", "48 de 56", "56"],
                ["Índice de discapacidad cervical", "36 %", "0 %"]
              ],
              nota: "Los valores son similares a los de la valoración por fisiatría del 10/12/2025, lo que confirma que la función está estable."
            } },
            { h: "Entrevista ocupacional" },
            { p: "Trabaja como auxiliar de inventario: concilia referencias y conteos en tableta, alterna sentado y de pie y tiene pausas programadas. Tarda más que sus compañeros en digitar y en contar unidades pequeñas. No conduce vehículos desde enero de 2024. En casa necesita ayuda para cortar alimentos duros, abotonarse y hacer arreglos domésticos; usa el pasamanos en las escaleras." },
            { firma: { nombre: "Daniela Ospina Rentería", cargo: "Terapeuta ocupacional, ARL SURA", registro: "Tarjeta profesional SIM-TO-4418", fecha: "24/02/2026" } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Constancia de firmeza */
    FIR: {
      v1: {
        tipo: "constancia",
        titulo: "Constancia de firmeza del dictamen de pérdida de capacidad laboral",
        emisor: { n: "ARL SURA", area: "Medicina laboral", ciudad: "Medellín", id: "NIT SIM-800.256.433-1" },
        numero: "FIR-L01",
        fecha: "08/04/2026",
        version: "v1",
        estadoNota: "",
        paginas: [
          { titulo: "Constancia", bloques: [
            { kv: [
              ["Constancia", "FIR-L01"],
              ["Fecha", "08/04/2026"],
              ["Dictamen al que se refiere", "DIC-L01, versión v1, del 18/03/2026"],
              ["Código de verificación del dictamen", "SIM-VER-7F3A-21C9"],
              ["Persona calificada", "Mateo Roldán Vega · C.C. SIM-71.384.226"],
              ["Pérdida de capacidad laboral", "56,80 %"],
              ["Origen", "Laboral"],
              ["Fecha de estructuración", "10/12/2025"],
              ["Diagnóstico", "M50.0 · Trastorno de disco cervical con mielopatía"]
            ] },
            { h: "Notificaciones y términos" },
            { tabla: {
              cols: ["Interesado", "Medio", "Fecha de notificación", "Término", "Vencimiento", "Inconformidad"],
              filas: [
                ["Mateo Roldán Vega, persona calificada", "Notificación personal, acta SIM-NOT-2026-03311", "19/03/2026", "10 días hábiles", "07/04/2026", "No presentó"],
                ["Depósitos Andén Umbral, empleador", "Comunicación electrónica con acuse de recibo", "19/03/2026", "10 días hábiles", "07/04/2026", "No presentó"],
                ["EPS SURA", "Comunicación electrónica con acuse de recibo", "19/03/2026", "10 días hábiles", "07/04/2026", "No presentó"],
                ["Cordillera Pensiones y Cesantías", "Comunicación electrónica con acuse de recibo", "19/03/2026", "10 días hábiles", "07/04/2026", "No presentó"]
              ],
              nota: "El término corrió del 20/03/2026 al 07/04/2026. No se cuentan el festivo del 23/03/2026 ni el jueves y el viernes santos (02/04/2026 y 03/04/2026)."
            } },
            { h: "Constancia" },
            { p: "ARL SURA, medicina laboral, hace constar que el dictamen DIC-L01, versión v1, emitido el 18/03/2026, fue notificado a todos los interesados el 19/03/2026 y que dentro de los 10 días hábiles siguientes ninguno manifestó inconformidad. En consecuencia, el dictamen quedó en firme el 08/04/2026, con una pérdida de capacidad laboral del 56,80 %, de origen laboral y con fecha de estructuración del 10/12/2025." },
            { p: "Esta constancia corresponde únicamente a la versión v1 del dictamen DIC-L01, identificada con el código de verificación SIM-VER-7F3A-21C9. Cualquier otra versión o copia con un código distinto no está cubierta por ella." },
            { h: "Fundamento" },
            { p: "Ley 100 de 1993, art. 41, modificado por el Decreto Ley 019 de 2012, art. 142: término de 10 días para manifestar inconformidad con la calificación en primera oportunidad; vencido sin inconformidad, el dictamen queda en firme." },
            { p: "Se expide para el expediente de calificación y para los trámites de prestaciones económicas que se deriven del dictamen." },
            { firma: { nombre: "Paula Andrea Cárdenas Villegas", cargo: "Coordinadora de medicina laboral, ARL SURA", registro: "Registro médico SIM-05-198342", fecha: "08/04/2026" } }
          ] },
          { titulo: "Anexo · Acta de notificación personal", bloques: [
            { kv: [
              ["Acta", "SIM-NOT-2026-03311"],
              ["Fecha y hora", "19/03/2026, 09:15"],
              ["Lugar", "Oficina de atención de ARL SURA en Medellín"],
              ["Persona notificada", "Mateo Roldán Vega · C.C. SIM-71.384.226"],
              ["Documento notificado", "Dictamen DIC-L01, versión v1, del 18/03/2026 (5 folios)"]
            ] },
            { p: "Se entregó a la persona calificada copia íntegra del dictamen y se le informó que puede manifestar su inconformidad ante ARL SURA dentro de los 10 días hábiles siguientes a esta notificación, para que el expediente se remita a la Junta Regional de Calificación de Invalidez de Antioquia." },
            { firma: { nombre: "Mateo Roldán Vega", cargo: "Persona notificada", registro: "C.C. SIM-71.384.226", fecha: "19/03/2026" } },
            { firma: { nombre: "Yesenia Marcela Toro Giraldo", cargo: "Gestora de notificaciones, ARL SURA", registro: "", fecha: "19/03/2026" } }
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
        numero: "SIM-CAF-2026-04187",
        fecha: "21/04/2026",
        version: "v2",
        estadoNota: "Segunda versión del certificado: reemplaza la expedida el 04/06/2024 para la calificación del origen y certifica la vigencia en las fechas del dictamen y de la radicación.",
        paginas: [
          { titulo: "Certificado", bloques: [
            { p: "ARL SURA certifica que la persona identificada a continuación está afiliada al Sistema General de Riesgos Laborales por medio de esta administradora, con los siguientes datos:" },
            { kv: [
              ["Afiliado", "Mateo Roldán Vega"],
              ["Documento", "C.C. SIM-71.384.226"],
              ["Número de afiliación", "SIM-ARL-2013-55810"],
              ["Tipo de afiliado", "Dependiente"],
              ["Empleador", "Depósitos Andén Umbral · NIT SIM-900.412.733-5"],
              ["Centro de trabajo", "Girardota, centro de distribución (SIM-CT-0042)"],
              ["Actividad económica", "5210 · Almacenamiento y depósito"],
              ["Clase de riesgo", "III · tarifa 2,436 %"],
              ["Inicio de la cobertura", "01/02/2013"],
              ["Estado a la fecha de expedición", "Activo"]
            ] },
            { h: "Períodos de cobertura" },
            { tabla: {
              cols: ["Desde", "Hasta", "Empleador", "Cargo reportado", "Clase", "Estado"],
              filas: [
                ["01/02/2013", "31/01/2024", "Depósitos Andén Umbral", "Operador de montacargas retráctil", "III", "Cubierto sin interrupción"],
                ["01/02/2024", "Vigente al 21/04/2026", "Depósitos Andén Umbral", "Auxiliar de inventario (reubicación, mismo contrato)", "III", "Cubierto sin interrupción"]
              ],
              nota: "La reubicación del 01/02/2024 se reportó como cambio de cargo dentro del mismo contrato y no interrumpió la cobertura."
            } },
            { h: "Vigencia en las fechas relevantes" },
            { tabla: {
              cols: ["Fecha", "Hecho", "Cobertura de ARL SURA"],
              filas: [
                ["01/10/2024", "Calificación del origen en primera oportunidad", "Vigente"],
                ["31/03/2025", "Dictamen de origen de la Junta Nacional ORI-L01", "Vigente"],
                ["10/12/2025", "Fecha de estructuración", "Vigente"],
                ["18/03/2026", "Dictamen de pérdida de capacidad laboral DIC-L01", "Vigente"],
                ["08/04/2026", "Firmeza del dictamen DIC-L01 registrada por medicina laboral", "Vigente"],
                ["21/04/2026", "Radicación de la solicitud RAD-L01", "Vigente"]
              ],
              nota: ""
            } },
            { nota: "Antes del 01/02/2013 la persona estuvo afiliada a otras administradoras de riesgos laborales por medio de empleadores anteriores. ARL SURA no certifica esos períodos." },
            { p: "Se expide a solicitud de prestaciones económicas de ARL SURA para el trámite de la solicitud RAD-L01. Este certificado no contiene información clínica." },
            { firma: { nombre: "Jorge Iván Patiño Ossa", cargo: "Analista de afiliaciones y novedades, ARL SURA", registro: "", fecha: "21/04/2026" } }
          ] },
          { titulo: "Anexo · Estado de los aportes recientes", bloques: [
            { tabla: {
              cols: ["Período cotizado", "Planilla", "Fecha de pago", "Días", "Estado"],
              filas: [
                ["Diciembre de 2025", "SIM-PL-2601-0057", "08/01/2026", "30", "Pagado"],
                ["Enero de 2026", "SIM-PL-2602-0412", "06/02/2026", "30", "Pagado"],
                ["Febrero de 2026", "SIM-PL-2603-0398", "06/03/2026", "30", "Pagado"],
                ["Marzo de 2026", "SIM-PL-2604-0371", "08/04/2026", "30", "Pagado"]
              ],
              nota: "Aportes al día a la fecha de expedición."
            } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Certificado de IBC */
    IBC: {
      v1: {
        tipo: "certificado",
        titulo: "Certificado de ingreso base de cotización",
        emisor: { n: "Depósitos Andén Umbral", area: "Gestión humana · Nómina", ciudad: "Girardota, Antioquia", id: "NIT SIM-900.412.733-5" },
        numero: "SIM-NOM-2026-0388",
        fecha: "16/04/2026",
        version: "v1",
        estadoNota: "Generado a partir de la exportación del sistema de nómina del 15/04/2026.",
        paginas: [
          { titulo: "Certificado", bloques: [
            { p: "La coordinación de nómina de Depósitos Andén Umbral certifica los ingresos base de cotización (IBC) reportados en la planilla integrada de liquidación de aportes para el trabajador que se identifica a continuación." },
            { kv: [
              ["Trabajador", "Mateo Roldán Vega"],
              ["Documento", "C.C. SIM-71.384.226"],
              ["Fecha de ingreso", "01/02/2013"],
              ["Contrato", "Término indefinido, vigente"],
              ["Cargo", "Auxiliar de inventario desde el 01/02/2024; antes, operador de montacargas retráctil"],
              ["Período certificado", "01/10/2023 a 30/09/2024 (12 meses)"],
              ["Solicitado por", "El trabajador, para su trámite de pensión ante ARL SURA"],
              ["Fuente", "Exportación del sistema de nómina del 15/04/2026"]
            ] },
            { tabla: {
              cols: ["Período", "Días", "IBC", "Planilla", "Fecha de pago", "Novedades"],
              filas: [
                ["Octubre de 2023", "30", "$3.280.000", "SIM-PL-2311-0482", "08/11/2023", "Ninguna"],
                ["Noviembre de 2023", "30", "$3.280.000", "SIM-PL-2312-0517", "07/12/2023", "Ninguna"],
                ["Diciembre de 2023", "30", "$3.280.000", "SIM-PL-2401-0036", "10/01/2024", "Ninguna"],
                ["Enero de 2024", "30", "$3.460.000", "SIM-PL-2402-0471", "07/02/2024", "Variación permanente de salario"],
                ["Febrero de 2024", "30", "$3.460.000", "SIM-PL-2403-0455", "07/03/2024", "Ninguna"],
                ["Marzo de 2024", "30", "$3.460.000", "SIM-PL-2404-0390", "05/04/2024", "Ninguna"],
                ["Abril de 2024", "30", "$3.460.000", "SIM-PL-2405-0502", "08/05/2024", "Ninguna"],
                ["Mayo de 2024", "30", "$3.460.000", "SIM-PL-2406-0461", "07/06/2024", "Incapacidad desde el 22/05/2024 (10 días)"],
                ["Junio de 2024", "30", "$3.460.000", "SIM-PL-2407-0429", "05/07/2024", "Incapacidad (30 días)"],
                ["Julio de 2024", "30", "$3.460.000", "SIM-PL-2408-0447", "06/08/2024", "Incapacidad hasta el 20/07/2024 (20 días)"],
                ["Agosto de 2024", "30", "$3.460.000", "SIM-PL-2409-0418", "06/09/2024", "Ninguna"]
              ],
              nota: "Durante la incapacidad de mayo a julio de 2024 la empresa mantuvo la cotización sobre el salario mensual."
            } },
            { vacio: "Septiembre de 2024: sin registro en esta exportación." },
            { kv: [
              ["Meses incluidos en el certificado", "11"],
              ["Suma del IBC de los meses incluidos", "$37.520.000"]
            ] },
            { p: "Se expide a solicitud del interesado el 16/04/2026." },
            { firma: { nombre: "Leidy Johana Moreno Pulgarín", cargo: "Analista de nómina, Depósitos Andén Umbral", registro: "", fecha: "16/04/2026" } }
          ] },
          { titulo: "Anexo · IBC mensual del período", bloques: [
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Ingreso base de cotización por mes",
                unidad: "pesos",
                forma: "barras",
                puntos: [
                  ["Oct. 2023", 3280000], ["Nov. 2023", 3280000], ["Dic. 2023", 3280000],
                  ["Ene. 2024", 3460000], ["Feb. 2024", 3460000], ["Mar. 2024", 3460000],
                  ["Abr. 2024", 3460000], ["May. 2024", 3460000], ["Jun. 2024", 3460000],
                  ["Jul. 2024", 3460000], ["Ago. 2024", 3460000]
                ]
              },
              pie: "Meses incluidos en la exportación del 15/04/2026."
            } },
            { nota: "El gráfico reproduce los valores de la tabla del certificado." }
          ] }
        ]
      },
      v2: {
        tipo: "certificado",
        titulo: "Certificado de ingreso base de cotización",
        emisor: { n: "Depósitos Andén Umbral", area: "Gestión humana · Nómina", ciudad: "Girardota, Antioquia", id: "NIT SIM-900.412.733-5" },
        numero: "SIM-NOM-2026-0412",
        fecha: "23/04/2026",
        version: "v2",
        estadoNota: "Reemplaza el certificado SIM-NOM-2026-0388 del 16/04/2026.",
        paginas: [
          { titulo: "Certificado", bloques: [
            { p: "La coordinación de nómina de Depósitos Andén Umbral certifica los ingresos base de cotización (IBC) reportados en la planilla integrada de liquidación de aportes para el trabajador que se identifica a continuación." },
            { kv: [
              ["Trabajador", "Mateo Roldán Vega"],
              ["Documento", "C.C. SIM-71.384.226"],
              ["Fecha de ingreso", "01/02/2013"],
              ["Contrato", "Término indefinido, vigente"],
              ["Cargo", "Auxiliar de inventario desde el 01/02/2024; antes, operador de montacargas retráctil"],
              ["Período certificado", "01/10/2023 a 30/09/2024 (12 meses)"],
              ["Motivo del período", "Último año anterior a la calificación del origen en primera oportunidad (01/10/2024), según el art. 5 de la Ley 1562 de 2012"],
              ["Solicitado por", "ARL SURA, prestaciones económicas, para el trámite RAD-L01"],
              ["Fuente", "Planillas pagadas, conciliadas con los dos operadores de información que usó la empresa en el período"]
            ] },
            { tabla: {
              cols: ["Período", "Días", "IBC", "Planilla", "Fecha de pago", "Novedades"],
              filas: [
                ["Octubre de 2023", "30", "$3.280.000", "SIM-PL-2311-0482", "08/11/2023", "Ninguna"],
                ["Noviembre de 2023", "30", "$3.280.000", "SIM-PL-2312-0517", "07/12/2023", "Ninguna"],
                ["Diciembre de 2023", "30", "$3.280.000", "SIM-PL-2401-0036", "10/01/2024", "Ninguna"],
                ["Enero de 2024", "30", "$3.460.000", "SIM-PL-2402-0471", "07/02/2024", "Variación permanente de salario"],
                ["Febrero de 2024", "30", "$3.460.000", "SIM-PL-2403-0455", "07/03/2024", "Ninguna"],
                ["Marzo de 2024", "30", "$3.460.000", "SIM-PL-2404-0390", "05/04/2024", "Ninguna"],
                ["Abril de 2024", "30", "$3.460.000", "SIM-PL-2405-0502", "08/05/2024", "Ninguna"],
                ["Mayo de 2024", "30", "$3.460.000", "SIM-PL-2406-0461", "07/06/2024", "Incapacidad desde el 22/05/2024 (10 días)"],
                ["Junio de 2024", "30", "$3.460.000", "SIM-PL-2407-0429", "05/07/2024", "Incapacidad (30 días)"],
                ["Julio de 2024", "30", "$3.460.000", "SIM-PL-2408-0447", "06/08/2024", "Incapacidad hasta el 20/07/2024 (20 días)"],
                ["Agosto de 2024", "30", "$3.460.000", "SIM-PL-2409-0418", "06/09/2024", "Ninguna"],
                ["Septiembre de 2024", "30", "$3.460.000", "SIM-PL-2410-0977", "08/10/2024", "Ninguna"]
              ],
              nota: "Durante la incapacidad de mayo a julio de 2024 la empresa mantuvo la cotización sobre el salario mensual."
            } },
            { kv: [
              ["Meses certificados", "12"],
              ["Suma del IBC de los 12 meses", "$40.980.000"],
              ["Promedio mensual del período", "$3.415.000"]
            ] },
            { h: "Corrección respecto del certificado anterior" },
            { p: "La planilla de septiembre de 2024 (SIM-PL-2410-0977, pagada el 08/10/2024) se liquidó con el operador de información que la empresa usa desde octubre de 2024 y no quedó en la exportación del sistema de nómina del 15/04/2026. Este certificado la incorpora y reemplaza el SIM-NOM-2026-0388 del 16/04/2026, que certificaba 11 meses." },
            { nota: "El promedio es informativo. La base de liquidación de las prestaciones la determina la ARL." },
            { firma: { nombre: "Leidy Johana Moreno Pulgarín", cargo: "Analista de nómina, Depósitos Andén Umbral", registro: "", fecha: "23/04/2026" } },
            { firma: { nombre: "Carlos Mario Zuluaga Henao", cargo: "Coordinador de gestión humana, Depósitos Andén Umbral", registro: "", fecha: "23/04/2026" } }
          ] },
          { titulo: "Anexo · IBC mensual del período", bloques: [
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Ingreso base de cotización por mes",
                unidad: "pesos",
                forma: "barras",
                puntos: [
                  ["Oct. 2023", 3280000], ["Nov. 2023", 3280000], ["Dic. 2023", 3280000],
                  ["Ene. 2024", 3460000], ["Feb. 2024", 3460000], ["Mar. 2024", 3460000],
                  ["Abr. 2024", 3460000], ["May. 2024", 3460000], ["Jun. 2024", 3460000],
                  ["Jul. 2024", 3460000], ["Ago. 2024", 3460000], ["Sep. 2024", 3460000]
                ],
                limite: { valor: 3415000, etiqueta: "Promedio de los 12 meses: $3.415.000" }
              },
              pie: "Doce meses del período 01/10/2023 a 30/09/2024. La línea marca el promedio mensual."
            } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Análisis de puesto y vibración */
    APT: {
      v2: {
        tipo: "analisis_puesto",
        titulo: "Análisis de puesto de trabajo y exposición a vibración de cuerpo entero",
        emisor: { n: "Depósitos Andén Umbral", area: "Sistema de gestión de seguridad y salud en el trabajo", ciudad: "Girardota, Antioquia", id: "NIT SIM-900.412.733-5" },
        numero: "SIM-SST-APT-2024-031",
        fecha: "21/08/2024",
        version: "v2",
        estadoNota: "Segunda versión: incorpora como anexo el informe de medición de vibración del 30/08/2023 y describe el cargo actual.",
        paginas: [
          { titulo: "Análisis de puesto de trabajo", bloques: [
            { kv: [
              ["Trabajador", "Mateo Roldán Vega · C.C. SIM-71.384.226"],
              ["Cargo evaluado", "Operador de montacargas retráctil"],
              ["Período en el cargo", "01/02/2013 a 31/01/2024"],
              ["Centro de trabajo", "Girardota, centro de distribución · CIIU 5210"],
              ["Jornada", "Turnos rotativos de 8 horas (06:00 a 14:00 y 14:00 a 22:00)"],
              ["Equipo", "Montacargas retráctil eléctrico, n.º interno SIM-MR-07: capacidad de 1.600 kg, elevación máxima de 9,5 m, ruedas de carga de poliuretano, puesto de conducción lateral con asiento de suspensión mecánica"],
              ["Solicitado por", "EPS SURA, medicina laboral, para la calificación del origen"],
              ["Fuentes", "Observación directa del puesto el 30/08/2023, durante el turno de la medición; entrevista al trabajador (12/08/2024) y al jefe de operaciones (13/08/2024); registro de asignación de equipos y horas de operación del sistema de gestión de almacén, enero de 2018 a enero de 2024; informe de vibración SIM-HI-2023-0877"]
            ] },
            { h: "Descripción del cargo" },
            { p: "Recibe estibas en los muelles, las traslada por los pasillos y las ubica en estantería de hasta 9,5 m; luego abastece las zonas de alistamiento y despacha por los muelles. Conduce sentado de lado, con el tronco y el cuello girados hacia la dirección de marcha. Para ubicar en altura extiende el cuello para ver las horquillas y el mástil; al retroceder gira el cuello hacia atrás. Los pasillos tienen juntas de dilatación cada 6 m y, en 2023, desniveles de 8 a 15 mm en los pasillos 3 y 4." },
            { h: "Tareas y tiempos por turno" },
            { tabla: {
              cols: ["Tarea", "Tiempo por turno", "Frecuencia", "Exigencia postural y física", "Factor de riesgo"],
              filas: [
                ["Inspección del equipo y cambio de batería", "15 min", "1 por turno", "De pie; flexión de tronco ocasional", "Biomecánico bajo"],
                ["Desplazamiento con carga por pasillos y muelles", "2 h 30 min", "Unos 75 recorridos", "Sentado de lado, tronco y cuello rotados", "Vibración de cuerpo entero con impactos en juntas de piso; postura forzada de cuello"],
                ["Elevación y ubicación de estibas en estantería", "1 h 30 min", "Unos 75 ciclos", "Extensión cervical de 25° a 40° durante 8 a 12 s por ciclo", "Postura forzada de cuello; vibración"],
                ["Maniobras en retroceso", "1 h", "Unas 75 maniobras", "Rotación cervical de 45° a 70°", "Postura forzada de cuello; vibración con impactos"],
                ["Registro de movimientos en la terminal del equipo", "45 min", "Continuo", "Sentado", "Bajo"],
                ["Apoyo en conteo y tareas de muelle", "1 h", "Variable", "De pie y caminando", "Bajo"],
                ["Pausas y alimentación", "1 h", "", "", ""]
              ],
              nota: "Total: 8 horas. Tiempo de conducción: 5 horas por turno (desplazamiento, ubicación en altura y retroceso), confirmado por el registro de horas de operación (4 h 50 min a 5 h 10 min por turno)."
            } },
            { h: "Evaluación postural" },
            { tabla: {
              cols: ["Postura", "Ángulo observado", "Duración o frecuencia", "Método", "Resultado"],
              filas: [
                ["Rotación cervical al retroceder", "45° a 70°", "Cerca de 1 hora por turno; unas 75 maniobras", "REBA", "8 · riesgo alto"],
                ["Extensión cervical para ver el mástil", "25° a 40°", "8 a 12 s por ciclo; unos 75 ciclos", "REBA", "8 · riesgo alto"],
                ["Sedente lateral con rotación de tronco", "15° a 30°", "5 horas por turno", "REBA", "6 · riesgo medio"]
              ],
              nota: ""
            } },
            { h: "Conclusiones" },
            { lista: [
              "El cargo expone a vibración de cuerpo entero durante unas 5 horas por turno. La medición del 30/08/2023 registró A(8) de 0,58 m/s² en el eje dominante (z) y factor de cresta de 10,2, por encima del valor de acción adoptado como criterio técnico (anexo 1).",
              "La tarea exige posturas forzadas de cuello repetidas: extensión para ver el mástil y rotación al retroceder, unas 75 veces por turno.",
              "La exposición en la empresa duró 11 años (01/02/2013 a 31/01/2024) y estuvo precedida de 9 años de conducción de montacargas de combustión en otra empresa (anexo 2).",
              "La medición representa el equipo SIM-MR-07, el turno y el estado del piso del 30/08/2023. En abril de 2024 se repararon las juntas de los pasillos 3 y 4."
            ] },
            { firma: { nombre: "Sandra Milena Arboleda Cano", cargo: "Fisioterapeuta especialista en seguridad y salud en el trabajo", registro: "Licencia en SST SIM-LSST-2016-2271", fecha: "21/08/2024" } }
          ] },
          { titulo: "Anexo 1 · Informe de medición de vibración de cuerpo entero (30/08/2023)", bloques: [
            { kv: [
              ["Informe", "SIM-HI-2023-0877"],
              ["Elaborado por", "Medición Ocupacional Altiplano S.A.S. · NIT SIM-901.554.208-3"],
              ["Fecha de la medición y del informe", "30/08/2023"],
              ["Trabajador medido", "Mateo Roldán Vega, operador titular del equipo"],
              ["Equipo", "Montacargas retráctil eléctrico SIM-MR-07; asiento con espuma deteriorada y suspensión de recorrido limitado"],
              ["Turno", "06:00 a 14:00"],
              ["Recorrido", "Muelles 1 a 3 y pasillos 1 a 6, con juntas de dilatación cada 6 m y desniveles de 8 a 15 mm en los pasillos 3 y 4; velocidad promedio de 7 km/h"],
              ["Instrumento", "Analizador de vibraciones humanas de tres canales, serie SIM-VB-3307, con acelerómetro triaxial de asiento tipo cojín, conforme a ISO 8041-1:2017"],
              ["Calibración", "Certificado SIM-CAL-2023-0611 del 14/06/2023; verificación en campo conforme antes y después de la medición"],
              ["Método", "ISO 2631-1:1997; ponderación Wd en los ejes x y y, Wk en el eje z; factores k de 1,4 (x, y) y 1,0 (z)"],
              ["Tiempo de medición", "200 minutos de operación efectiva (06:40 a 08:20 y 08:40 a 10:20)"],
              ["Tiempo de exposición diaria", "5 horas, según el registro de horas de operación de agosto de 2023"]
            ] },
            { h: "Resultados por eje" },
            { tabla: {
              cols: ["Eje", "a_w (m/s²)", "k", "k · a_w (m/s²)", "A(8) (m/s²)", "Factor de cresta", "Dosis medida (m/s^1,75)", "Dosis diaria (m/s^1,75)", "Valor transitorio máximo (m/s²)"],
              filas: [
                ["x", "0,31", "1,4", "0,43", "0,34", "6,8", "5,9", "6,5", "1,1"],
                ["y", "0,28", "1,4", "0,39", "0,31", "7,1", "5,4", "6,0", "1,0"],
                ["z", "0,73", "1,0", "0,73", "0,58", "10,2", "11,8", "13,1", "2,6"]
              ],
              nota: "Eje dominante: z. Las dosis de vibración incluyen el factor k de cada eje."
            } },
            { h: "Cálculo" },
            { p: "A(8) = k · a_w · √(T / 8 h) = 1,0 × 0,73 × √(5 / 8) = 0,58 m/s² en el eje z." },
            { p: "Dosis diaria = dosis medida × (tiempo de exposición / tiempo de medición) elevado a 1/4 = 11,8 × (300 / 200) elevado a 1/4 = 13,1 m/s^1,75." },
            { h: "Comparación con los criterios de referencia" },
            { tabla: {
              cols: ["Indicador", "Valor de acción", "Valor límite", "Resultado"],
              filas: [
                ["A(8) del eje dominante", "0,5 m/s²", "1,15 m/s²", "0,58 m/s²: supera el valor de acción; no supera el valor límite"],
                ["Dosis de vibración diaria", "9,1 m/s^1,75", "21 m/s^1,75", "13,1 m/s^1,75: supera el valor de acción; no supera el valor límite"]
              ],
              nota: "Colombia no tiene un valor límite reglamentario específico para vibración de cuerpo entero. El informe toma como criterio técnico la norma ISO 2631-1:1997 y los valores de la Directiva 2002/44/CE."
            } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Aceleración ponderada del eje z por intervalo de 20 minutos",
                unidad: "m/s²",
                forma: "barras",
                puntos: [
                  ["06:40", 0.62], ["07:00", 0.81], ["07:20", 0.95], ["07:40", 0.70], ["08:00", 0.62],
                  ["08:40", 0.66], ["09:00", 0.88], ["09:20", 0.74], ["09:40", 0.60], ["10:00", 0.63]
                ]
              },
              pie: "Valor eficaz del muestreo: 0,73 m/s². Los intervalos de 07:20 y 09:00 corresponden al pasillo 4 y a maniobras en retroceso por el pasillo 3."
            } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "A(8) del eje z según las horas diarias de conducción",
                unidad: "m/s²",
                forma: "linea",
                puntos: [["1 h", 0.26], ["2 h", 0.37], ["3 h", 0.45], ["4 h", 0.52], ["5 h", 0.58], ["6 h", 0.63]],
                limite: { valor: 0.5, etiqueta: "Valor de acción A(8) 0,5 m/s²" }
              },
              pie: "Con las 5 horas diarias registradas, la exposición supera el valor de acción."
            } },
            { h: "Interpretación" },
            { lista: [
              "El factor de cresta del eje z (10,2) es mayor que 9. Según ISO 2631-1, en ese caso el método básico puede subestimar el efecto de los impactos; por eso se informan la dosis de vibración y el valor transitorio máximo.",
              "La relación entre el valor transitorio máximo y la aceleración ponderada del eje z es de 3,6, mayor que 1,5: los impactos son significativos.",
              "Los valores más altos coinciden con el paso por las juntas deterioradas del pasillo 4 y con las maniobras en retroceso.",
              "El asiento tiene la espuma deteriorada y la suspensión con recorrido limitado, lo que aumenta la transmisión de los impactos."
            ] },
            { h: "Recomendaciones" },
            { lista: [
              "Reparar las juntas de piso de los pasillos 3 y 4 y nivelar los desniveles.",
              "Reemplazar el asiento del equipo SIM-MR-07 por uno con suspensión ajustada al peso del operador y revisar las ruedas de carga.",
              "Reducir la velocidad al cruzar las juntas y rotar a los operadores entre conducción y tareas de piso.",
              "Incluir a los operadores de montacargas en el programa de vigilancia epidemiológica de desórdenes musculoesqueléticos."
            ] },
            { h: "Alcance" },
            { p: "La medición representa el turno, el equipo SIM-MR-07, el operador y el estado del piso del día medido. No representa otros equipos ni las condiciones posteriores a reparaciones del piso." },
            { firma: { nombre: "Julián Ferro Montoya", cargo: "Ingeniero, higienista ocupacional, Medición Ocupacional Altiplano S.A.S.", registro: "Licencia en SST SIM-LSST-2011-0874", fecha: "30/08/2023" } }
          ] },
          { titulo: "Anexo 2 · Historia ocupacional y cargo actual", bloques: [
            { tabla: {
              cols: ["Período", "Empresa", "Centro de trabajo", "CIIU", "Cargo", "Exposición relevante"],
              filas: [
                ["01/02/1996 a 31/01/2004", "Bodegas Travesía Norte", "Bello, bodega de despachos", "5210", "Auxiliar de despachos", "Paletiza de 35 a 45 cajas por turno, de 12 a 22 kg; 2,5 h acumuladas de manipulación en turno de 8 h"],
                ["01/02/2004 a 31/01/2013", "Operaciones Cauce Industrial", "Itagüí, patio de carga", "5224", "Operador de montacargas de combustión", "Conduce 4,5 h por turno de 8 h y mueve unos 55 palés; marcha atrás en muelles y ubicación en estantería alta"],
                ["01/02/2013 a 31/01/2024", "Depósitos Andén Umbral", "Girardota, centro de distribución", "5210", "Operador de montacargas retráctil", "Conduce 5 h por turno de 8 h, cerca de 75 ciclos; mira hacia atrás al retroceder y extiende el cuello para ver el mástil"],
                ["01/02/2024 a la fecha", "Depósitos Andén Umbral", "Girardota, centro de distribución", "5210", "Auxiliar de inventario", "Sin conducción ni manipulación de cargas"]
              ],
              nota: "Los dos primeros períodos se toman de la entrevista al trabajador y de las certificaciones laborales que aportó."
            } },
            { kv: [
              ["Manipulación manual de cargas", "8 años (1996 a 2004)"],
              ["Conducción de montacargas", "20 años (2004 a 2024): 9 en montacargas de combustión y 11 en montacargas retráctil"]
            ] },
            { h: "Cargo actual desde el 01/02/2024" },
            { kv: [
              ["Cargo", "Auxiliar de inventario, mismo contrato"],
              ["Tareas", "Concilia referencias y conteos en tableta"],
              ["Postura", "Alterna sentado y de pie, con pausas programadas"],
              ["Exclusiones", "No conduce montacargas ni vehículos; no manipula cargas de más de 10 kg; no trabaja en alturas"],
              ["Exposición a vibración", "Ninguna"],
              ["Compatibilidad", "Compatible con las recomendaciones médicas vigentes"]
            ] },
            { firma: { nombre: "Óscar Darío Bedoya Lopera", cargo: "Coordinador del SG-SST, Depósitos Andén Umbral", registro: "Licencia en SST SIM-LSST-2014-1530", fecha: "21/08/2024" } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Resumen clínico de columna */
    HC: {
      v2: {
        tipo: "historia",
        titulo: "Resumen de historia clínica · Columna cervical",
        emisor: { n: "IPS Eje Raquídeo Aburrá", area: "Unidad de columna y rehabilitación", ciudad: "Medellín", id: "NIT SIM-901.227.604-0" },
        numero: "SIM-IPS-RC-2026-0047",
        fecha: "20/01/2026",
        version: "v2",
        estadoNota: "Resumen firmado por neurocirugía y fisiatría.",
        paginas: [
          { titulo: "Resumen clínico", bloques: [
            { kv: [
              ["Paciente", "Mateo Roldán Vega"],
              ["Documento", "C.C. SIM-71.384.226"],
              ["Historia clínica", "SIM-0471-2023"],
              ["Fecha de nacimiento", "19/09/1973 · 52 años"],
              ["EPS", "EPS SURA · SIM-EPS-2004-310572"],
              ["ARL", "ARL SURA · SIM-ARL-2013-55810"],
              ["Ocupación", "Operador de montacargas retráctil hasta el 31/01/2024; auxiliar de inventario desde el 01/02/2024"],
              ["Dominancia", "Diestro"],
              ["Ingreso a la unidad de columna", "02/04/2024, por remisión de EPS SURA"],
              ["Solicitado por", "ARL SURA, medicina laboral, para la calificación de la pérdida de capacidad laboral. Autorización del paciente del 15/01/2026."]
            ] },
            { h: "Motivo de consulta y evolución" },
            { p: "Hombre de 52 años que consultó por primera vez el 18/05/2023 por dolor cervical, torpeza para agarrar herramientas y parestesias en ambas manos, de predominio derecho, de varios meses de evolución. Ortopedia encontró signos de mielopatía el 13/09/2023. La electromiografía del 23/01/2024 mostró compromiso radicular C6 derecho crónico leve, y la resonancia magnética del 14/03/2024, hernia discal C5–C6 con estenosis del canal y mielopatía compresiva." },
            { p: "Ingresó a la unidad de columna el 02/04/2024 con puntaje mJOA de 11 sobre 18. El 22/05/2024 se practicó discectomía cervical anterior y artrodesis C5–C6 sin complicaciones, con incapacidad de 60 días (22/05/2024 a 20/07/2024). Entre el 23/07/2024 y el 10/10/2024 cumplió 24 sesiones de terapia física y ocupacional, con mejoría parcial de la marcha y de la destreza manual." },
            { p: "Desde octubre de 2024 la función se mantiene estable. Ha tenido episodios de dolor cervical que requirieron incapacidades cortas en junio y septiembre de 2025. La resonancia de control del 18/11/2025 muestra la artrodesis sin compresión residual y mielomalacia focal C5–C6. En la valoración por fisiatría del 10/12/2025 se considera alcanzada la mejoría médica máxima y se mantiene la restricción de conducción." },
            { h: "Antecedentes" },
            { kv: [
              ["Patológicos", "Hipertensión arterial esencial desde 2016, controlada con losartán 50 mg cada 12 horas"],
              ["Quirúrgicos", "Discectomía y artrodesis cervical anterior C5–C6 (22/05/2024)"],
              ["Traumáticos", "Niega trauma cervical"],
              ["Tóxicos", "No fuma. Consumo ocasional de alcohol"],
              ["Alérgicos", "Niega"],
              ["Ocupacionales", "8 años de manipulación manual de cargas (1996 a 2004) y 20 años de conducción de montacargas (2004 a 2024)"],
              ["Familiares", "Madre con hipertensión arterial"]
            ] },
            { h: "Diagnósticos" },
            { tabla: {
              cols: ["CIE-10", "Diagnóstico", "Tipo", "Estado"],
              filas: [
                ["M50.0", "Trastorno de disco cervical con mielopatía", "Principal", "Operado, con secuelas"],
                ["G99.2", "Mielopatía en enfermedades clasificadas en otra parte (asociado a M50.0)", "Relacionado", "Secuela estable"],
                ["I10X", "Hipertensión esencial (primaria)", "Antecedente", "Controlada"]
              ],
              nota: ""
            } },
            { h: "Procedimientos" },
            { tabla: {
              cols: ["Fecha", "Procedimiento"],
              filas: [["22/05/2024", "Discectomía cervical anterior C5–C6 con descompresión medular, artrodesis intersomática y fijación con placa anterior (anexo 4)"]],
              nota: ""
            } },
            { h: "Estado funcional en la última valoración (10/12/2025)" },
            { tabla: {
              cols: ["Prueba", "Resultado", "Referencia"],
              filas: [
                ["Escala mJOA de mielopatía cervical", "13 de 18 (mielopatía moderada)", "18"],
                ["Dinamometría de agarre", "Derecha 22 kg · izquierda 26 kg", "Cerca de 45 kg (derecha) y 42 kg (izquierda) para su edad y sexo"],
                ["Prueba de las nueve clavijas", "Derecha 32 s · izquierda 28 s", "Cerca de 19 s (derecha) y 20 s (izquierda)"],
                ["Velocidad de marcha en 10 metros", "0,86 m/s", "1,2 m/s o más"],
                ["Escala de equilibrio de Berg", "48 de 56", "56"],
                ["Índice de discapacidad cervical", "36 %", "0 %"]
              ],
              nota: ""
            } },
            { h: "Restricciones y recomendaciones" },
            { lista: [
              "No conducir vehículos ni montacargas. Restricción permanente.",
              "No levantar ni transportar cargas de más de 10 kg.",
              "Evitar la flexión, la extensión y la rotación cervical sostenidas o repetitivas.",
              "Alternar las posturas sentado y de pie cada 45 a 60 minutos.",
              "No trabajar en alturas ni sobre escaleras de mano.",
              "Usar herramientas con mango engrosado y hacer pausas activas.",
              "Continuar el programa de ejercicio en casa y los controles anuales por neurocirugía y fisiatría."
            ] },
            { h: "Concepto" },
            { p: "Mielopatía cervical compresiva C5–C6 operada, con mejoría parcial tras la descompresión y la rehabilitación y función estable desde octubre de 2024. Persisten alteración de la marcha y pérdida de destreza manual bilateral de predominio derecho, con dificultad para subir escaleras, sostener herramientas y manipular cargas. Mejoría médica máxima alcanzada el 10/12/2025." },
            { firma: { nombre: "Ricardo Albornoz Peñaranda", cargo: "Neurocirujano, unidad de columna", registro: "Registro médico SIM-05-176602", fecha: "20/01/2026" } },
            { firma: { nombre: "Natalia Ceballos Duque", cargo: "Médica fisiatra", registro: "Registro médico SIM-05-208815", fecha: "20/01/2026" } },
            { nota: "Resumen expedido con autorización del paciente y solo para la finalidad de calificación indicada (Resolución 1995 de 1999, art. 14). La historia clínica completa permanece bajo custodia de la IPS." }
          ] },
          { titulo: "Anexo 1 · Consultas y controles registrados", bloques: [
            { tabla: {
              cols: ["Fecha", "Servicio", "Hallazgos y conducta"],
              filas: [
                ["18/05/2023", "Medicina general, EPS SURA", "Dolor cervical, torpeza para agarrar herramientas y parestesias en ambas manos, de predominio derecho, de varios meses de evolución. Reflejos vivos en miembros superiores. Solicita radiografía de columna cervical y electromiografía; remite a ortopedia."],
                ["06/06/2023", "Radiología", "Radiografía de columna cervical (anexo 2)."],
                ["13/09/2023", "Ortopedia, EPS SURA", "Hoffmann positivo bilateral, reflejos tricipitales y rotulianos aumentados, marcha con base ligeramente ampliada. Sospecha de mielopatía cervical. Ordena resonancia magnética."],
                ["23/01/2024", "Electrodiagnóstico", "Electromiografía y neuroconducciones (anexo 2)."],
                ["25/01/2024", "Medicina laboral, EPS SURA", "Recomendaciones laborales: suspender la conducción de montacargas y vehículos; no levantar cargas de más de 10 kg. El empleador reubica al trabajador desde el 01/02/2024."],
                ["14/03/2024", "Radiología", "Resonancia magnética de columna cervical (anexo 3)."],
                ["02/04/2024", "Neurocirugía, unidad de columna", "mJOA 11 de 18. Hoffmann positivo bilateral, braquiorradial invertido derecho, hiperreflexia en miembros inferiores, clonus aquíleo agotable, tándem no logrado. Indica discectomía y artrodesis cervical anterior C5–C6."],
                ["22/05/2024", "Cirugía", "Discectomía y artrodesis C5–C6 (anexo 4). Incapacidad inicial de 30 días. Egreso el 24/05/2024."],
                ["19/06/2024", "Neurocirugía, control posoperatorio", "Herida sana. Radiografía de control con placa, tornillos y dispositivo intersomático en buena posición. Mejoran las parestesias; persiste la torpeza manual. Prórroga de incapacidad por 30 días y orden de 24 sesiones de rehabilitación."],
                ["18/07/2024", "Fisiatría", "Ingreso a rehabilitación: mJOA 12 de 18. Reintegro previsto para el 22/07/2024, primer día hábil después de la incapacidad, como auxiliar de inventario con restricciones."],
                ["10/10/2024", "Fisiatría", "Fin del programa de 24 sesiones (anexo 6). mJOA 13 de 18."],
                ["21/01/2025", "Neurocirugía", "Radiografías dinámicas: artrodesis en consolidación, sin movilidad anormal del segmento. Examen neurológico sin cambios."],
                ["16/06/2025", "Medicina general, EPS SURA", "Dolor cervical con espasmo muscular. Incapacidad de 5 días."],
                ["15/09/2025", "Medicina general, EPS SURA", "Nuevo episodio de dolor cervical. Incapacidad de 5 días."],
                ["18/11/2025", "Radiología", "Resonancia magnética de control (anexo 7)."],
                ["10/12/2025", "Fisiatría", "Valoración funcional de seguimiento (anexo 7). Mejoría médica máxima. Mantiene la restricción de conducción."]
              ],
              nota: "Las consultas en la red de EPS SURA se transcriben de la remisión y de los soportes aportados por el paciente."
            } }
          ] },
          { titulo: "Anexo 2 · Radiografía y electrodiagnóstico", bloques: [
            { h: "Radiografía de columna cervical · 06/06/2023" },
            { p: "Proyecciones anteroposterior, lateral y oblicuas. Rectificación de la lordosis cervical. Disminución del espacio discal C5–C6 con osteofitos marginales anteriores y posteriores y uncoartrosis C5–C6. Agujeros de conjunción C5–C6 estrechos en las oblicuas, de predominio derecho. Altura de los cuerpos vertebrales conservada. Sin listesis." },
            { h: "Electromiografía y neuroconducciones de miembros superiores · 23/01/2024" },
            { tabla: {
              cols: ["Nervio", "Tipo", "Latencia (ms)", "Amplitud", "Velocidad (m/s)", "Interpretación"],
              filas: [
                ["Mediano derecho", "Sensitivo", "3,2", "24 µV", "52", "Normal"],
                ["Mediano derecho", "Motor", "3,6", "7,8 mV", "54", "Normal"],
                ["Cubital derecho", "Sensitivo", "2,9", "15 µV", "55", "Normal"],
                ["Cubital derecho", "Motor", "2,8", "8,6 mV", "58", "Normal"],
                ["Radial superficial derecho", "Sensitivo", "2,3", "19 µV", "56", "Normal"],
                ["Mediano izquierdo", "Sensitivo", "3,1", "26 µV", "53", "Normal"],
                ["Cubital izquierdo", "Motor", "2,7", "9,1 mV", "59", "Normal"]
              ],
              nota: "Referencias del laboratorio: latencia sensitiva del mediano de 3,5 ms o menos; amplitud sensitiva del mediano de 20 µV o más; velocidad de 50 m/s o más."
            } },
            { figura: {
              tipo: "neuroconduccion",
              datos: { filas: [
                { nervio: "Mediano derecho", tipo: "sensitivo", latencia: 3.2, latRef: 3.5, amplitud: 24, ampRef: 20, velocidad: 52, velRef: 50 },
                { nervio: "Mediano derecho", tipo: "motor", latencia: 3.6, latRef: 4.2, amplitud: 7.8, ampRef: 5, velocidad: 54, velRef: 50 },
                { nervio: "Cubital derecho", tipo: "sensitivo", latencia: 2.9, latRef: 3.1, amplitud: 15, ampRef: 10, velocidad: 55, velRef: 50 },
                { nervio: "Cubital derecho", tipo: "motor", latencia: 2.8, latRef: 3.3, amplitud: 8.6, ampRef: 6, velocidad: 58, velRef: 50 },
                { nervio: "Radial superficial derecho", tipo: "sensitivo", latencia: 2.3, latRef: 2.8, amplitud: 19, ampRef: 15, velocidad: 56, velRef: 50 },
                { nervio: "Mediano izquierdo", tipo: "sensitivo", latencia: 3.1, latRef: 3.5, amplitud: 26, ampRef: 20, velocidad: 53, velRef: 50 },
                { nervio: "Cubital izquierdo", tipo: "motor", latencia: 2.7, latRef: 3.3, amplitud: 9.1, ampRef: 6, velocidad: 59, velRef: 50 }
              ] },
              pie: "Neuroconducciones dentro de los límites normales en ambos miembros superiores."
            } },
            { tabla: {
              cols: ["Músculo", "Raíz", "Actividad espontánea", "Unidades motoras", "Reclutamiento"],
              filas: [
                ["Deltoides derecho", "C5–C6", "Ausente", "Normales", "Normal"],
                ["Bíceps braquial derecho", "C5–C6", "Ausente", "Amplitud y duración aumentadas", "Reducido"],
                ["Braquiorradial derecho", "C5–C6", "Ausente", "Amplitud y duración aumentadas", "Reducido"],
                ["Pronador redondo derecho", "C6–C7", "Ausente", "Normales", "Normal"],
                ["Tríceps braquial derecho", "C7", "Ausente", "Normales", "Normal"],
                ["Primer interóseo dorsal derecho", "C8–T1", "Ausente", "Normales", "Normal"],
                ["Bíceps braquial izquierdo", "C5–C6", "Ausente", "Normales", "Normal"]
              ],
              nota: "Paraespinales cervicales bajos sin actividad espontánea."
            } },
            { p: "Conclusión: signos de compromiso radicular C6 derecho crónico, leve, sin denervación activa. No hay neuropatía por atrapamiento del mediano ni del cubital. El estudio no descarta compromiso medular; se sugiere resonancia magnética de columna cervical." },
            { firma: { nombre: "Gustavo Adolfo Montes Rendón", cargo: "Médico fisiatra, electrodiagnóstico", registro: "Registro médico SIM-05-150927", fecha: "23/01/2024" } }
          ] },
          { titulo: "Anexo 3 · Resonancia magnética de columna cervical (14/03/2024)", bloques: [
            { kv: [
              ["Estudio", "Resonancia magnética de columna cervical simple"],
              ["Fecha", "14/03/2024"],
              ["Equipo", "Resonador de 1,5 teslas"],
              ["Técnica", "Secuencias sagitales T1, T2 y STIR; axiales T2 y eco de gradiente. Sin medio de contraste."],
              ["Indicación", "Sospecha de mielopatía cervical"]
            ] },
            { h: "Hallazgos" },
            { lista: [
              "Rectificación de la lordosis cervical. Altura de los cuerpos vertebrales conservada. Unión craneocervical normal.",
              "C4–C5: protrusión discal posterocentral que borra parcialmente el espacio subaracnoideo anterior, sin compresión medular.",
              "C5–C6: disco deshidratado y de menor altura. Complejo disco-osteofitario posterior con hernia discal posterocentral y paracentral derecha que reduce el diámetro anteroposterior del canal a 7,2 mm (12,8 mm en C3–C4), borra el espacio subaracnoideo anterior y posterior y comprime la médula.",
              "C5–C6: lesión intramedular hiperintensa en T2, de 9 mm de extensión craneocaudal, sin alteración en T1.",
              "C5–C6: uncoartrosis con estrechamiento foraminal bilateral moderado, de predominio derecho.",
              "C6–C7: protrusión discal leve, sin compromiso medular ni radicular."
            ] },
            { figura: {
              tipo: "rm_columna",
              datos: {
                region: "cervical",
                secuencia: "T2 sagital",
                hallazgos: [
                  { nivel: "C4-C5", tipo: "protrusion" },
                  { nivel: "C5-C6", tipo: "hernia" },
                  { nivel: "C5-C6", tipo: "estenosis" },
                  { nivel: "C5-C6", tipo: "mielopatia" },
                  { nivel: "C6-C7", tipo: "protrusion" }
                ]
              },
              pie: "Esquema sintético dibujado a partir de los hallazgos del informe; no es la imagen del estudio."
            } },
            { h: "Conclusión" },
            { p: "Enfermedad discal degenerativa C5–C6 con hernia discal y estenosis central del canal, con compresión medular y señal intramedular compatible con mielopatía compresiva. Protrusiones discales C4–C5 y C6–C7 sin compresión." },
            { firma: { nombre: "Iván Darío Galvis Mora", cargo: "Médico radiólogo", registro: "Registro médico SIM-05-163348", fecha: "14/03/2024" } }
          ] },
          { titulo: "Anexo 4 · Descripción quirúrgica (22/05/2024)", bloques: [
            { kv: [
              ["Fecha", "22/05/2024"],
              ["Hora de inicio y de fin", "07:30 a 09:40"],
              ["Cirujano", "Ricardo Albornoz Peñaranda, neurocirujano"],
              ["Ayudante", "Andrés Felipe Echeverri Saldarriaga, neurocirujano"],
              ["Anestesia", "General"],
              ["Diagnóstico preoperatorio", "M50.0 · Trastorno de disco cervical con mielopatía C5–C6"],
              ["Diagnóstico posoperatorio", "El mismo"],
              ["Procedimiento", "Discectomía cervical anterior C5–C6, descompresión del canal y de los agujeros de conjunción, artrodesis intersomática y fijación con placa anterior"],
              ["Material", "Dispositivo intersomático de polieteretercetona de 6 mm relleno de matriz ósea; placa cervical anterior de titanio de 20 mm con cuatro tornillos de 14 mm"],
              ["Neuromonitoreo", "Potenciales evocados somatosensoriales y motores estables durante todo el procedimiento"],
              ["Sangrado", "80 mL"],
              ["Complicaciones", "Ninguna"]
            ] },
            { h: "Descripción" },
            { p: "Paciente en decúbito supino con el cuello en extensión leve. Abordaje cervical anterior derecho por incisión transversa. Disección por planos hasta la columna. Localización del nivel C5–C6 con fluoroscopia. Colocación de distractor intervertebral. Discectomía completa, resección de los osteofitos posteriores y del ligamento longitudinal posterior engrosado, con descompresión del saco dural y foraminotomía bilateral. Colocación del dispositivo intersomático y de la placa anterior. Control con fluoroscopia: nivel y posición del material correctos. Hemostasia, dren y cierre por planos." },
            { h: "Hallazgos operatorios" },
            { p: "Complejo disco-osteofitario posterior C5–C6 con fragmento discal paracentral derecho que comprimía el saco dural. Ligamento longitudinal posterior engrosado. Tras la descompresión, saco dural libre y con pulsación." },
            { h: "Evolución y egreso" },
            { p: "Sin déficit neurológico nuevo. Retiro del dren a las 24 horas. Egreso el 24/05/2024 con collar cervical rígido por 4 semanas, analgesia y una incapacidad inicial de 30 días." },
            { firma: { nombre: "Ricardo Albornoz Peñaranda", cargo: "Neurocirujano, unidad de columna", registro: "Registro médico SIM-05-176602", fecha: "22/05/2024" } }
          ] },
          { titulo: "Anexo 5 · Certificados de incapacidad", bloques: [
            { h: "Certificado de incapacidad SIM-IT-2024-551208" },
            { kv: [
              ["Paciente", "Mateo Roldán Vega · C.C. SIM-71.384.226"],
              ["Fecha de expedición", "22/05/2024"],
              ["Tipo de atención", "Hospitalaria, posquirúrgica"],
              ["Días", "30"],
              ["Desde", "22/05/2024"],
              ["Hasta", "20/06/2024"],
              ["Tipo", "Inicial"],
              ["Diagnóstico", "M50.0 · Trastorno de disco cervical con mielopatía"],
              ["Origen registrado", "Enfermedad general. El origen estaba pendiente de calificación."],
              ["Profesional", "Ricardo Albornoz Peñaranda, neurocirujano"]
            ] },
            { h: "Incapacidades registradas" },
            { tabla: {
              cols: ["Certificado", "Expedición", "Desde", "Hasta", "Días", "Tipo", "Origen registrado"],
              filas: [
                ["SIM-IT-2024-551208", "22/05/2024", "22/05/2024", "20/06/2024", "30", "Inicial", "Enfermedad general, origen en estudio"],
                ["SIM-IT-2024-563377", "19/06/2024", "21/06/2024", "20/07/2024", "30", "Prórroga", "Enfermedad general, origen en estudio"],
                ["SIM-IT-2025-118450", "16/06/2025", "16/06/2025", "20/06/2025", "5", "Inicial", "Enfermedad laboral"],
                ["SIM-IT-2025-170932", "15/09/2025", "15/09/2025", "19/09/2025", "5", "Inicial", "Enfermedad laboral"]
              ],
              nota: "Incapacidad posquirúrgica: 60 días continuos, del 22/05/2024 al 20/07/2024. Reintegro el 22/07/2024 como auxiliar de inventario, con restricciones."
            } },
            { nota: "Las incapacidades de 2024 se expidieron como de origen común porque el origen aún no se había calificado. El origen laboral se calificó el 01/10/2024 y quedó confirmado por la Junta Nacional el 31/03/2025." }
          ] },
          { titulo: "Anexo 6 · Rehabilitación ambulatoria (julio a octubre de 2024)", bloques: [
            { kv: [
              ["Orden", "Neurocirugía, 19/06/2024"],
              ["Programa", "Terapia física y terapia ocupacional"],
              ["Sesiones", "24, dos por semana"],
              ["Inicio y fin", "23/07/2024 a 10/10/2024"],
              ["Objetivos", "Equilibrio y marcha, fuerza y destreza de las manos, control postural cervical, actividades de la vida diaria y adaptación al cargo de inventario"]
            ] },
            { tabla: {
              cols: ["Mes", "Fechas", "Sesiones"],
              filas: [
                ["Julio de 2024", "23, 25 y 30", "3"],
                ["Agosto de 2024", "1, 6, 8, 13, 15, 20, 22, 27 y 29", "9"],
                ["Septiembre de 2024", "3, 5, 10, 12, 17, 19, 24 y 26", "8"],
                ["Octubre de 2024", "1, 3, 8 y 10", "4"],
                ["Total", "", "24"]
              ],
              nota: "Asistencia completa."
            } },
            { h: "Mediciones" },
            { tabla: {
              cols: ["Prueba", "Inicio (23/07/2024)", "Final (10/10/2024)", "Seguimiento (10/12/2025)", "Referencia"],
              filas: [
                ["Escala mJOA de mielopatía cervical (puntos)", "12", "13", "13", "18"],
                ["Dinamometría derecha (kg)", "16", "21", "22", "Cerca de 45"],
                ["Dinamometría izquierda (kg)", "20", "25", "26", "Cerca de 42"],
                ["Nueve clavijas, mano derecha (s)", "40", "33", "32", "Cerca de 19"],
                ["Nueve clavijas, mano izquierda (s)", "34", "29", "28", "Cerca de 20"],
                ["Velocidad de marcha en 10 metros (m/s)", "0,72", "0,85", "0,86", "1,2 o más"],
                ["Escala de equilibrio de Berg (puntos)", "42", "48", "48", "56"],
                ["Índice de discapacidad cervical (%)", "48", "38", "36", "0"]
              ],
              nota: ""
            } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Escala mJOA de mielopatía cervical",
                unidad: "puntos",
                forma: "linea",
                puntos: [["Abr. 2024", 11], ["Jul. 2024", 12], ["Oct. 2024", 13], ["Dic. 2025", 13]],
                limite: { valor: 18, etiqueta: "Función normal: 18 puntos" }
              },
              pie: "Mejoría tras la cirugía y la rehabilitación, y meseta desde octubre de 2024."
            } },
            { h: "Notas de evolución" },
            { lista: [
              "23/07/2024: marcha con base ampliada y apoyo en pared en los giros. Agarre débil; dificultad para abotonarse. Se inicia entrenamiento de equilibrio, fortalecimiento y destreza fina.",
              "29/08/2024: mejora la estabilidad en los giros; aún no logra el tándem. Escribe con letra más grande y lenta. Se adapta el mango de las herramientas de oficina.",
              "10/10/2024: marcha independiente sin ayudas, con base ampliada. Sube escaleras paso a paso con pasamanos. Persiste la torpeza fina, mayor en la mano derecha. Egreso con programa de ejercicio en casa."
            ] },
            { firma: { nombre: "Mónica Alejandra Restrepo Vahos", cargo: "Fisioterapeuta, coordinadora de rehabilitación", registro: "Tarjeta profesional SIM-FT-6631", fecha: "10/10/2024" } }
          ] },
          { titulo: "Anexo 7 · Resonancia de control y valoración por fisiatría", bloques: [
            { h: "Resonancia magnética de columna cervical de control · 18/11/2025" },
            { lista: [
              "Cambios posquirúrgicos por discectomía y artrodesis C5–C6 con placa anterior y dispositivo intersomático, con artefacto metálico leve.",
              "Canal amplio en C5–C6 (diámetro anteroposterior de 11,4 mm), sin compresión residual.",
              "Foco intramedular hiperintenso en T2 a nivel de C5–C6, de 7 mm, con leve hipointensidad en T1, compatible con mielomalacia.",
              "Protrusiones C4–C5 y C6–C7 sin cambios respecto del estudio de 2024, sin compresión medular."
            ] },
            { figura: {
              tipo: "rm_columna",
              datos: {
                region: "cervical",
                secuencia: "T2 sagital",
                hallazgos: [
                  { nivel: "C4-C5", tipo: "protrusion" },
                  { nivel: "C5-C6", tipo: "artrodesis" },
                  { nivel: "C5-C6", tipo: "mielopatia" },
                  { nivel: "C6-C7", tipo: "protrusion" }
                ]
              },
              pie: "Esquema sintético dibujado a partir de los hallazgos del informe; no es la imagen del estudio."
            } },
            { p: "Conclusión: artrodesis C5–C6 sin compresión residual. Mielomalacia focal C5–C6, secuela de la mielopatía compresiva." },
            { firma: { nombre: "Adriana Lucía Pérez Soler", cargo: "Médica radióloga", registro: "Registro médico SIM-05-201174", fecha: "18/11/2025" } },
            { h: "Valoración por fisiatría · 10/12/2025" },
            { p: "Refiere estabilidad desde la rehabilitación. Trabaja como auxiliar de inventario con las adaptaciones indicadas. Al examen: bicipital disminuido y braquiorradial invertido a la derecha, Hoffmann positivo bilateral, clonus aquíleo agotable, hipoestesia en guante de predominio derecho y en el dermatoma C6 derecho, fuerza 4/5 en los músculos intrínsecos de las manos, marcha con base ampliada y tándem no logrado. Mediciones del anexo 6, sin cambios significativos frente a octubre de 2024." },
            { p: "Concepto: mielopatía cervical operada con secuelas neurológicas estables durante más de un año. Se considera alcanzada la mejoría médica máxima. Se mantienen la restricción de conducción y las demás restricciones de forma permanente." },
            { firma: { nombre: "Natalia Ceballos Duque", cargo: "Médica fisiatra", registro: "Registro médico SIM-05-208815", fecha: "10/12/2025" } }
          ] }
        ]
      }
    }
  }
};
