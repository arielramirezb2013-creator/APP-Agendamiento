/* ============ Documentos sintéticos · operaria de prensas con cobertura histórica incompleta ============
   Expediente de Elena Marín Cuéllar, exoperaria de prensa mecánica en Dosquebradas (Risaralda), retirada desde el
   01/10/2025. Pérdida auditiva neurosensorial bilateral inducida por ruido (H83.3) con tinnitus persistente.
   Origen laboral calificado por EPS SURA (ORI-L04, 24/06/2025, en firme el 14/07/2025). PCL 51,00 % laboral con
   estructuración el 12/09/2025 (DIC-L04, 28/04/2026, notificado el 29/04/2026, en firme el 15/05/2026, FIR-L04).
   Solicitud radicada el 22/05/2026 (RAD-L04). La consulta de afiliación inicial solo dice «inactiva»; la
   certificación histórica acredita ARL SURA del 01/09/2012 al 30/09/2025. El anexo de exposición del SG-SST liga
   la dosimetría del 22/08/2023 (LAeq,8h 92,0 dB(A)) al puesto de 2012 a 2024.
   Aritmética del dictamen (Decreto 1507 de 2014, capítulo 9, tablas 9.1 a 9.3):
     Tres audiometrías de cierre (29/08, 05/09 y 12/09/2025), suma de umbrales en 500, 1.000, 2.000 y 3.000 Hz:
       oído derecho 255, 245 y 250 → promedio de las sumas 250 (promedio 62,5 dB) → (62,5 − 25) × 1,5 = 56,25 %
       oído izquierdo 275, 265 y 270 → promedio de las sumas 270 (promedio 67,5 dB) → (67,5 − 25) × 1,5 = 63,75 %
       binaural (5 × 56,25 + 63,75) / 6 = 57,50 % → tabla 9.3: 57,50 × 0,35 = 20,1 → 20 %
       tinnitus subjetivo 3 % (el Manual da 5 % solo al objetivo), suma aritmética → deficiencia 23,00 %
     Título I ponderado al 50 % = 11,50. Título II: rol laboral 25,00 + 2,50 + 2,00 = 29,50; otras áreas
     2,00 + 3,00 + 1,30 + 1,20 + 2,50 = 10,00; total 39,50. PCL = 11,50 + 39,50 = 51,00 %.
   Dosimetría: LAeq,T 92,1 dB(A) en 470 min → LAeq,8h = 92,1 + 10·log(470/480) = 92,0 dB(A); dosis 505 %.
   Todo es sintético: ninguna persona, número, profesional ni documento es real. */
DOCS.exp["PI-L04"] = {
  identidad: {
    documento: "C.C. SIM-42.118.637",
    historiaIps: "Historia clínica SIM-OTO-2021-03318",
    afiliacionArl: "SIM-ARL-2012-48113",
    afiliacionEps: "SIM-EPS-1996-207714",
    afiliacionAfp: "SIM-AFP-1996-311052",
    nitArl: "ARL SURA · NIT SIM-800.256.433-1",
    nitEps: "EPS SURA · NIT SIM-811.040.215-6",
    nitEmpleador: "Prensas Umbral del Otún S.A.S. · NIT SIM-900.587.214-9",
    nitIps: "IPS Audiológica Cauce Claro · NIT SIM-901.318.640-2",
    nitHigiene: "Acústica Ocupacional Guayacán S.A.S. · NIT SIM-901.442.806-1",
    dictamenOrigenInterno: "SIM-EPS-ML-2025-06241",
    expedienteMedicinaLaboralArl: "SIM-ARL-ML-2025-10342",
    actaNotificacionDictamen: "SIM-NOT-2026-04417",
    consultaAfiliacion: "SIM-CON-2026-0522-0952",
    certificacionHistorica: "SIM-ARL-CH-2026-02215",
    anexoExposicion: "SIM-SST-NEX-2026-007",
    informeDosimetria: "SIM-HI-2023-0918",
    ordenReubicacion: "SIM-SST-REU-2024-019",
    extractoAudiologico: "SIM-AUD-EX-2025-0912"
  },

  soportes: {

    /* ---------------------------------------------------------------- Solicitud e identidad */
    SOL: {
      v1: {
        tipo: "solicitud",
        titulo: "Solicitud de reconocimiento de pensión de invalidez de origen laboral",
        emisor: { n: "Elena Marín Cuéllar", area: "Solicitante · dirigida a ARL SURA, Prestaciones económicas", ciudad: "Dosquebradas, Risaralda", id: "C.C. SIM-42.118.637" },
        numero: "RAD-L04",
        fecha: "22/05/2026",
        version: "v1",
        estadoNota: "Ejemplar radicado en la oficina de ARL SURA en Pereira, con el formato de canal de notificación escrito firmado por la solicitante.",
        paginas: [
          { titulo: "Solicitud", bloques: [
            { kv: [
              ["Dirigida a", "ARL SURA · Prestaciones económicas"],
              ["Radicado", "RAD-L04"],
              ["Fecha de radicación", "22/05/2026"],
              ["Oficina", "Oficina de atención de ARL SURA en Pereira, de forma presencial"],
              ["Prestación solicitada", "Pensión de invalidez de origen laboral"],
              ["Canal de notificación", "Escrito, según el formato de autorización anexo (no recibe notificaciones por llamada telefónica)"]
            ] },
            { h: "Datos de la solicitante" },
            { kv: [
              ["Nombre", "Elena Marín Cuéllar"],
              ["Documento de identidad", "C.C. SIM-42.118.637 de Pereira"],
              ["Fecha de nacimiento", "12/02/1971"],
              ["Edad", "55 años"],
              ["Sexo", "Femenino"],
              ["Municipio de residencia", "Dosquebradas, Risaralda"],
              ["Escolaridad", "Bachiller y técnica laboral en procesos metalmecánicos"],
              ["Situación laboral", "Sin vínculo laboral desde el 01/10/2025. Último empleador: Prensas Umbral del Otún S.A.S. · NIT SIM-900.587.214-9"],
              ["Última administradora de riesgos laborales", "ARL SURA · afiliación SIM-ARL-2012-48113"],
              ["EPS", "EPS SURA"],
              ["Fondo de pensiones", "Cordillera Pensiones y Cesantías"],
              ["Datos de contacto", "Registrados en el formato de autorización; no se reproducen en esta copia"]
            ] },
            { h: "Hechos" },
            { lista: [
              "Trabajé desde 1996 en la industria metalmecánica: 8 años en Fundición Quebrada Larga (Pereira), en desmoldeo y acabado; 8 años y 7 meses en Mecanizados Nudo Alto (Pereira), puliendo y esmerilando piezas; y desde el 01/09/2012 en Prensas Umbral del Otún S.A.S. (Dosquebradas), donde operé prensas mecánicas en la nave de estampado hasta el 31/12/2024.",
              "En el control periódico del 11/11/2021 informé que tenía zumbido en los oídos y que no entendía las instrucciones en la nave. El 05/03/2024 otorrinolaringología confirmó que tengo hipoacusia neurosensorial bilateral. Uso audífonos en los dos oídos desde abril de 2024.",
              "Desde el 01/01/2025 la empresa me reubicó en el almacén como auxiliar de inventario de repuestos. El 30/09/2025 terminé mi contrato por retiro voluntario. Desde entonces no trabajo y no estoy afiliada a ninguna ARL.",
              "EPS SURA calificó el origen laboral de mi enfermedad el 24/06/2025 (dictamen ORI-L04). Ese dictamen quedó en firme el 14/07/2025.",
              "ARL SURA me calificó con una pérdida de capacidad laboral de 51,00 %, de origen laboral, con fecha de estructuración del 12/09/2025 (dictamen DIC-L04 del 28/04/2026). Me lo notificaron por escrito el 29/04/2026 y no presenté inconformidad.",
              "ARL SURA fue la última ARL a la que estuve afiliada. Con mis empleadores anteriores estuve afiliada a otras administradoras. Entre el 01/08/2012 y el 31/08/2012 no trabajé."
            ] },
            { h: "Peticiones" },
            { lista: [
              "Que ARL SURA reconozca y pague la pensión de invalidez de origen laboral a que tengo derecho, de acuerdo con los artículos 9 y 10 de la Ley 776 de 2002.",
              "Que me informen por escrito si el hecho de haberme retirado el 30/09/2025 cambia la entidad que debe resolver mi pensión y, si falta algún documento, quién debe aportarlo.",
              "Que todas las comunicaciones, citaciones, requerimientos y decisiones me lleguen por escrito, por el canal que autorizo en el formato anexo, porque uso audífonos y no entiendo bien por teléfono."
            ] },
            { h: "Documentos que adjunto" },
            { tabla: {
              cols: ["N.º", "Documento", "Folios"],
              filas: [
                ["1", "Copia de la cédula de ciudadanía C.C. SIM-42.118.637", "1"],
                ["2", "Copia del dictamen de pérdida de capacidad laboral DIC-L04 del 28/04/2026, con el acta de notificación del 29/04/2026", "7"],
                ["3", "Copia del dictamen de origen ORI-L04 de EPS SURA del 24/06/2025, con su constancia de firmeza", "5"],
                ["4", "Certificado laboral de Prensas Umbral del Otún S.A.S. del 30/09/2025 (cargos y fechas del contrato)", "1"],
                ["5", "Formato de autorización del canal de notificación escrito", "1"]
              ],
              nota: "Con el formulario de solicitud (2 folios), la radicación suma 17 folios."
            } },
            { p: "Declaro que la información es cierta. Autorizo a ARL SURA a consultar mi historia clínica, mi historia laboral y mis afiliaciones, y a pedir a otras entidades y a mi último empleador los soportes necesarios, solo para resolver esta solicitud." },
            { firma: { nombre: "Elena Marín Cuéllar", cargo: "Solicitante", registro: "C.C. SIM-42.118.637", fecha: "22/05/2026" } }
          ] },
          { titulo: "Autorización del canal de notificación escrito", bloques: [
            { p: "Yo, Elena Marín Cuéllar, identificada con C.C. SIM-42.118.637, solicito que ARL SURA me comunique por escrito todas las actuaciones del trámite RAD-L04, como ajuste razonable por mi pérdida auditiva (Ley 1618 de 2013), y autorizo el siguiente canal de notificación (Ley 1437 de 2011, artículos 56 y 67):" },
            { kv: [
              ["Canal principal", "Comunicación escrita entregada en el domicilio por correo certificado, con copia en la oficina de ARL SURA en Pereira si la solicitante la pide"],
              ["Canal adicional", "Mensaje de datos a la cuenta de correo electrónico registrada en este formato (no se reproduce en esta copia)"],
              ["Llamadas telefónicas", "No autorizadas como medio de notificación ni de citación"],
              ["Citaciones y requerimientos", "Por escrito, con la fecha, la hora, el lugar y lo que debe llevar"],
              ["Atención presencial", "Con apoyo escrito y en un lugar sin ruido de fondo; puede asistir acompañada de su hija, sin que esta decida por ella"],
              ["Ayudas que usa", "Audífonos retroauriculares en ambos oídos; apoyo en la lectura de labios"]
            ] },
            { firma: { nombre: "Elena Marín Cuéllar", cargo: "Solicitante", registro: "C.C. SIM-42.118.637", fecha: "22/05/2026" } },
            { nota: "Formato registrado en el expediente RAD-L04. La dirección y la cuenta de correo constan en el original y no se reproducen en las copias." }
          ] },
          { titulo: "Constancia de radicación", bloques: [
            { kv: [
              ["Entidad que recibe", "ARL SURA · Prestaciones económicas, oficina de Pereira"],
              ["Radicado", "RAD-L04"],
              ["Fecha y hora", "22/05/2026, 09:48"],
              ["Trámite", "Pensión de invalidez de origen laboral"],
              ["Titular", "Elena Marín Cuéllar · C.C. SIM-42.118.637"],
              ["Verificación de identidad", "Documento original exhibido en ventanilla. Coincide con la titular del dictamen DIC-L04 y de la afiliación SIM-ARL-2012-48113"],
              ["Canal de notificación registrado", "Escrito (correo certificado al domicilio y mensaje de datos a la cuenta registrada)"],
              ["Folios recibidos", "17"]
            ] },
            { h: "Lista de verificación al recibir" },
            { tabla: {
              cols: ["Documento", "Estado al radicar", "Observación"],
              filas: [
                ["Solicitud firmada", "Recibida", "Mismo titular del documento de identidad"],
                ["Documento de identidad", "Recibido", "Copia simple cotejada con el original"],
                ["Dictamen de pérdida de capacidad laboral", "Recibida copia", "DIC-L04 del 28/04/2026; el original reposa en Medicina laboral de ARL SURA"],
                ["Constancia de firmeza del dictamen", "No aportada", "La expide Medicina laboral de ARL SURA; se incorpora de oficio"],
                ["Dictamen de origen", "Recibida copia", "ORI-L04 de EPS SURA del 24/06/2025, con constancia de firmeza"],
                ["Certificación de afiliación y cobertura", "No aportada", "La consulta de estado del sistema (SIM-CON-2026-0522-0952) muestra la afiliación como inactiva, sin fechas; Prestaciones económicas verificará la cobertura"],
                ["Soporte de la exposición en el puesto", "No aportado", "Sin observación de la ventanilla"],
                ["Certificado laboral", "Recibido", "Prensas Umbral del Otún S.A.S., 30/09/2025"],
                ["Canal de notificación escrito", "Recibido", "Formato firmado por la solicitante"]
              ],
              nota: "La verificación de la afiliación, de la cobertura y de los soportes corresponde a Prestaciones económicas. Esta lista no es una decisión sobre la solicitud."
            } },
            { p: "La radicación no implica que la solicitud haya sido aceptada. Prestaciones económicas revisará el expediente y, si falta algún soporte, lo pedirá a la dependencia o a la entidad que lo custodia, o a la solicitante, y se lo informará por escrito." },
            { firma: { nombre: "Kevin Alexis Arias Montoya", cargo: "Auxiliar de atención y radicación, ARL SURA, Pereira", fecha: "22/05/2026" } }
          ] },
          { titulo: "Anexo 1 · Copia del documento de identidad", bloques: [
            { kv: [
              ["Documento", "Cédula de ciudadanía"],
              ["Número", "SIM-42.118.637"],
              ["Apellidos", "Marín Cuéllar"],
              ["Nombres", "Elena"],
              ["Fecha de nacimiento", "12/02/1971"],
              ["Lugar de nacimiento", "Pereira (Risaralda)"],
              ["Estatura", "1,58 m"],
              ["Grupo sanguíneo y factor", "A positivo"],
              ["Sexo", "F"],
              ["Fecha y lugar de expedición", "20/03/1989 · Pereira"]
            ] },
            { nota: "Copia simple aportada por la solicitante. Número sintético: no corresponde a una cédula real." }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Calificación del origen */
    ORI: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de calificación del origen en primera oportunidad",
        emisor: { n: "EPS SURA", area: "Medicina laboral, regional Eje Cafetero", ciudad: "Pereira", id: "NIT SIM-811.040.215-6" },
        numero: "ORI-L04",
        fecha: "24/06/2025",
        version: "v1",
        estadoNota: "Copia firmada del dictamen, con la constancia de firmeza del origen laboral expedida el 14/07/2025.",
        paginas: [
          { titulo: "Dictamen · información general", bloques: [
            { kv: [
              ["Número del dictamen", "ORI-L04"],
              ["Radicado interno", "SIM-EPS-ML-2025-06241"],
              ["Fecha del dictamen", "24/06/2025"],
              ["Tipo de calificación", "Origen de la enfermedad, primera oportunidad"],
              ["Entidad calificadora", "EPS SURA · Medicina laboral, regional Eje Cafetero"],
              ["Motivo", "Diagnóstico de pérdida auditiva neurosensorial bilateral con antecedente de exposición ocupacional a ruido, reportado por otorrinolaringología"],
              ["Valoración presencial", "10/06/2025, Pereira"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Elena Marín Cuéllar"],
              ["Documento", "C.C. SIM-42.118.637"],
              ["Fecha de nacimiento", "12/02/1971"],
              ["Edad", "54 años"],
              ["Sexo", "Femenino"],
              ["Residencia", "Dosquebradas, Risaralda"],
              ["Escolaridad", "Bachiller y técnica laboral en procesos metalmecánicos"],
              ["Dominancia", "Diestra"],
              ["Ocupación", "Operaria de prensa mecánica hasta el 31/12/2024; auxiliar de inventario de repuestos desde el 01/01/2025, por reubicación"],
              ["Empleador", "Prensas Umbral del Otún S.A.S. · NIT SIM-900.587.214-9"],
              ["EPS", "EPS SURA · SIM-EPS-1996-207714"],
              ["Administradora de riesgos laborales", "ARL SURA · SIM-ARL-2012-48113"],
              ["Fondo de pensiones", "Cordillera Pensiones y Cesantías · SIM-AFP-1996-311052"]
            ] },
            { h: "Historia ocupacional" },
            { tabla: {
              cols: ["Período", "Empresa y centro de trabajo", "CIIU", "Cargo", "Exposición a ruido descrita"],
              filas: [
                ["01/01/1996 a 31/12/2003", "Fundición Quebrada Larga · Pereira, área de acabado", "2431", "Auxiliar de desmoldeo y acabado", "Retira arena y rebabas con herramientas neumáticas; cerca de 4 h por turno de 8 h junto al desmoldeo y el esmerilado. Sin mediciones disponibles"],
                ["01/01/2004 a 31/07/2012", "Mecanizados Nudo Alto · Pereira, banco de mecanizado", "2592", "Operaria de pulido de piezas", "Esmerila y desbarba piezas unas 5 h acumuladas por turno de 8 h. Tapones con registro parcial de recambios. Sin mediciones disponibles"],
                ["01/09/2012 a 31/12/2024", "Prensas Umbral del Otún S.A.S. · Dosquebradas, nave de estampado", "2591", "Operaria de prensa mecánica", "Alimenta la prensa, activa el ciclo y verifica la pieza unas 5 h acumuladas por turno de 8 h. Ruido impulsivo en el troquelado"],
                ["01/01/2025 a la fecha", "Prensas Umbral del Otún S.A.S. · Dosquebradas, almacén segregado", "2591", "Auxiliar de inventario de repuestos", "Reubicación fuera de la nave, con avisos visuales"]
              ],
              nota: "Sin vínculo laboral en agosto de 2012. Tiempo acumulado en oficios con ruido: casi 29 años (28 años y 11 meses)."
            } },
            { h: "Entidades interesadas" },
            { tabla: {
              cols: ["Entidad o persona", "Calidad en el trámite"],
              filas: [
                ["Elena Marín Cuéllar", "Persona calificada"],
                ["ARL SURA", "Administradora de riesgos laborales"],
                ["Prensas Umbral del Otún S.A.S.", "Empleador"],
                ["Cordillera Pensiones y Cesantías", "Administradora de fondos de pensiones"]
              ],
              nota: ""
            } }
          ] },
          { titulo: "Fundamentos y análisis del origen", bloques: [
            { h: "Historia clínica pertinente" },
            { p: "Mujer de 54 años, diestra, sin antecedentes de otitis crónica, trauma craneal, uso de medicamentos ototóxicos, enfermedades metabólicas ni hipoacusia familiar. No practica actividades recreativas ruidosas. En el control periódico ocupacional del 11/11/2021 refirió tinnitus bilateral y dificultad para seguir instrucciones en la nave; la audiometría de ese control mostró descenso bilateral de los umbrales con máximo en 4.000 Hz, y la trabajadora fue remitida a su EPS." },
            { p: "El 05/03/2024 otorrinolaringología confirmó hipoacusia neurosensorial bilateral, simétrica, de predominio en frecuencias agudas, con compromiso de frecuencias conversacionales, timpanometría normal y otoemisiones ausentes. Inició adaptación de audífonos en abril de 2024 y, desde el 01/01/2025, trabaja reubicada en el almacén, fuera de la nave de estampado." },
            { h: "Audiometrías seriadas" },
            { tabla: {
              cols: ["Fecha", "Contexto", "Promedio 500 a 3.000 Hz, oído derecho (dB)", "Promedio 500 a 3.000 Hz, oído izquierdo (dB)", "Umbral en 4.000 Hz, derecho / izquierdo (dB)"],
              filas: [
                ["27/08/2012", "Examen de ingreso a Prensas Umbral del Otún", "20,0", "23,8", "40 / 45"],
                ["09/10/2018", "Control periódico", "41,3", "46,3", "70 / 75"],
                ["11/11/2021", "Control periódico; refiere tinnitus", "52,5", "57,5", "80 / 85"],
                ["05/03/2024", "Otorrinolaringología, diagnóstico", "62,5", "67,5", "85 / 90"]
              ],
              nota: "Fuente: audiometrías de la IPS Audiológica Cauce Claro, que realiza las del programa de vigilancia del empleador y la atención audiológica de la red de EPS SURA."
            } },
            { h: "Exposición" },
            { p: "El empleador remitió el 19/05/2025 un resumen de condiciones de exposición del cargo de operaria de prensa mecánica. El resumen cita el informe de dosimetría personal del 22/08/2023, realizado en la nave de estampado, con un nivel equivalente normalizado a 8 horas de 92 dB(A), por encima del valor límite permisible de 85 dB(A) para 8 horas, y ruido impulsivo en el troquelado. Informa que en 2024 se instaló una barrera parcial y se registró el uso de orejeras, y que la trabajadora fue reubicada fuera de la nave el 01/01/2025." },
            { p: "El resumen no trae anexos: el informe de dosimetría con el equipo, la tarea y el turno, y la ficha del puesto con las fechas, permanecen en el archivo del sistema de gestión de seguridad y salud en el trabajo del empleador." },
            { h: "Análisis de la relación de causalidad" },
            { lista: [
              "Diagnóstico: pérdida auditiva neurosensorial bilateral inducida por ruido (H83.3), confirmada por otorrinolaringología con audiometría tonal, logoaudiometría, inmitancia y otoemisiones, con tinnitus persistente (H93.1).",
              "Exposición: casi 29 años en oficios metalmecánicos con ruido, los últimos 12 años y 4 meses como operaria de prensa mecánica, con 92 dB(A) en la dosimetría personal del 22/08/2023 y ruido impulsivo.",
              "Patrón audiométrico: compromiso bilateral y simétrico, con máximo en 4.000 Hz y recuperación parcial en 8.000 Hz, característico del daño coclear por ruido. El compromiso de 500 y 1.000 Hz es mayor que el habitual en la pérdida inducida por ruido; es concordante con casi 29 años de exposición, con el componente impulsivo del troquelado y con una protección auditiva cuyo uso no se verificó hasta 2024.",
              "Temporalidad: la audiometría de ingreso de 2012 muestra una muesca leve en 4.000 Hz y la progresión ocurre durante la exposición en la nave de estampado; los síntomas se registran el 11/11/2021, con la trabajadora expuesta.",
              "Factores extralaborales: no se identifican causas otológicas, tóxicas, traumáticas ni hereditarias que expliquen el cuadro. Glucemia, perfil lipídico y función tiroidea normales en el estudio de otorrinolaringología del 05/03/2024."
            ] },
            { p: "La pérdida auditiva inducida por ruido figura en la tabla de enfermedades laborales del Decreto 1477 de 2014, con el ruido como agente de riesgo. Se cumplen los criterios de la Guía de Atención Integral Basada en la Evidencia para Hipoacusia Neurosensorial Inducida por Ruido en el Lugar de Trabajo (Resolución 2844 de 2007): exposición ocupacional significativa, patrón audiométrico compatible y exclusión de otras causas." }
          ] },
          { titulo: "Decisión, notificación y recursos", bloques: [
            { h: "Diagnósticos calificados" },
            { tabla: {
              cols: ["CIE-10", "Diagnóstico", "Origen"],
              filas: [
                ["H83.3", "Pérdida auditiva neurosensorial bilateral inducida por ruido (efectos del ruido sobre el oído interno)", "Laboral · enfermedad laboral"],
                ["H93.1", "Tinnitus persistente, asociado al diagnóstico anterior", "Laboral · enfermedad laboral"]
              ],
              nota: ""
            } },
            { h: "Decisión" },
            { p: "Medicina laboral de EPS SURA califica en primera oportunidad como de origen laboral la pérdida auditiva neurosensorial bilateral inducida por ruido (H83.3) de Elena Marín Cuéllar, con el tinnitus asociado." },
            { kv: [
              ["Diagnóstico principal", "H83.3 · Pérdida auditiva neurosensorial bilateral inducida por ruido"],
              ["Origen", "Enfermedad laboral"],
              ["Fecha de la decisión", "24/06/2025"]
            ] },
            { h: "Fundamentos de derecho" },
            { lista: [
              "Ley 100 de 1993, art. 41, modificado por el Decreto Ley 019 de 2012, art. 142: calificación del origen en primera oportunidad y controversia ante las juntas de calificación de invalidez.",
              "Ley 1562 de 2012, art. 4: definición de enfermedad laboral.",
              "Decreto 1477 de 2014: tabla de enfermedades laborales.",
              "Resolución 2844 de 2007: guías de atención integral de salud ocupacional basadas en la evidencia, entre ellas la de hipoacusia neurosensorial inducida por ruido."
            ] },
            { h: "Notificación y recursos" },
            { p: "Este dictamen se notifica a la persona calificada y se comunica a ARL SURA, a Prensas Umbral del Otún S.A.S. y a Cordillera Pensiones y Cesantías. Cualquiera de ellos puede manifestar su inconformidad ante EPS SURA dentro de los 10 días hábiles siguientes a su notificación. En ese caso, el expediente se remitirá a la Junta Regional de Calificación de Invalidez de Risaralda. Si nadie manifiesta inconformidad dentro del término, el dictamen queda en firme." },
            { p: "La calificación de la pérdida de capacidad laboral corresponde a la administradora de riesgos laborales, una vez en firme el origen y concluido el tratamiento y la rehabilitación." },
            { firma: { nombre: "Sandra Viviana Ocampo Herrera", cargo: "Médica especialista en salud ocupacional, Medicina laboral, EPS SURA", registro: "Registro médico SIM-66-118204", fecha: "24/06/2025" } },
            { firma: { nombre: "Óscar Fernando Salazar Montes", cargo: "Médico laboral, coordinador de calificación, EPS SURA", registro: "Registro médico SIM-66-097531", fecha: "24/06/2025" } },
            { nota: "Notificado por escrito a la persona calificada el 25/06/2025. Comunicado a ARL SURA el 25/06/2025 y al empleador y al fondo de pensiones el 26/06/2025." }
          ] },
          { titulo: "Constancia de firmeza del origen", bloques: [
            { kv: [
              ["Dictamen", "ORI-L04 del 24/06/2025 · radicado interno SIM-EPS-ML-2025-06241"],
              ["Persona calificada", "Elena Marín Cuéllar · C.C. SIM-42.118.637"],
              ["Diagnóstico", "H83.3 · Pérdida auditiva neurosensorial bilateral inducida por ruido"],
              ["Origen", "Laboral"]
            ] },
            { h: "Notificaciones y término" },
            { tabla: {
              cols: ["Interesado", "Medio", "Fecha", "Inconformidad"],
              filas: [
                ["Elena Marín Cuéllar, persona calificada", "Notificación personal por escrito, en la oficina de EPS SURA en Pereira", "25/06/2025", "No presentó"],
                ["ARL SURA", "Comunicación electrónica con acuse de recibo", "25/06/2025", "No presentó"],
                ["Prensas Umbral del Otún S.A.S., empleador", "Comunicación electrónica con acuse de recibo", "26/06/2025", "No presentó"],
                ["Cordillera Pensiones y Cesantías", "Comunicación electrónica con acuse de recibo", "26/06/2025", "No presentó"]
              ],
              nota: "Cada interesado tuvo 10 días hábiles desde su notificación: para la persona calificada y ARL SURA el término venció el 10/07/2025; para el empleador y el fondo de pensiones corrió del 27/06/2025 al 11/07/2025. No se cuenta el festivo del 30/06/2025."
            } },
            { p: "Medicina laboral de EPS SURA hace constar que, vencido el término sin que ninguno de los interesados manifestara inconformidad, el dictamen ORI-L04 quedó en firme. La firmeza se registra el 14/07/2025, primer día hábil siguiente al vencimiento del término." },
            { kv: [["Fecha de firmeza del origen", "14/07/2025"]] },
            { firma: { nombre: "Carlos Mario Henao Villa", cargo: "Coordinador de medicina laboral, EPS SURA, regional Eje Cafetero", registro: "Registro médico SIM-66-085312", fecha: "14/07/2025" } },
            { nota: "Copia firmada expedida para el expediente de la persona calificada. Remitida a ARL SURA, Medicina laboral, el 15/07/2025 para la calificación de la pérdida de capacidad laboral." }
          ] },
          { titulo: "Anexo · Pruebas valoradas", bloques: [
            { tabla: {
              cols: ["Documento", "Fecha", "Emisor", "Aporte a la decisión"],
              filas: [
                ["Audiometría de ingreso", "27/08/2012", "IPS Audiológica Cauce Claro, programa de vigilancia del empleador", "Muesca leve en 4.000 Hz al ingreso"],
                ["Audiometrías de control periódico", "2015, 2018, 2021 y 2023", "IPS Audiológica Cauce Claro", "Progresión bilateral durante la exposición en la nave de estampado"],
                ["Consulta de control periódico", "11/11/2021", "IPS Audiológica Cauce Claro, medicina del trabajo", "Primer registro de tinnitus y de dificultad para seguir instrucciones"],
                ["Consulta de otorrinolaringología y estudio audiológico completo", "05/03/2024", "IPS Audiológica Cauce Claro", "Diagnóstico de hipoacusia neurosensorial bilateral inducida por ruido"],
                ["Resumen de condiciones de exposición del cargo", "19/05/2025", "Prensas Umbral del Otún S.A.S., SG-SST", "Cita la dosimetría personal del 22/08/2023: 92 dB(A) en 8 horas en estampado. Sin anexos"],
                ["Certificado laboral con cargos y fechas", "21/05/2025", "Prensas Umbral del Otún S.A.S., gestión humana", "Cargo de operaria de prensa del 01/09/2012 al 31/12/2024 y reubicación desde el 01/01/2025"],
                ["Constancias de oficio de empleadores anteriores", "Mayo de 2025", "Fundición Quebrada Larga y Mecanizados Nudo Alto", "Cargos y fechas; sin mediciones de ruido"],
                ["Valoración presencial", "10/06/2025", "EPS SURA, Medicina laboral", "Anamnesis ocupacional y exclusión de causas extralaborales"]
              ],
              nota: "El informe de dosimetría y la ficha del puesto se citan según el resumen del empleador; no se incorporaron como anexos a este dictamen."
            } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Dictamen de PCL */
    DIC: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de pérdida de capacidad laboral y ocupacional",
        emisor: { n: "ARL SURA", area: "Medicina laboral, regional Eje Cafetero", ciudad: "Pereira", id: "NIT SIM-800.256.433-1" },
        numero: "DIC-L04",
        fecha: "28/04/2026",
        version: "v1",
        estadoNota: "Ejemplar firmado por los calificadores, con el código de verificación SIM-VER-6K2T-94QX.",
        paginas: [
          { titulo: "Dictamen", bloques: [
            { kv: [
              ["Número del dictamen", "DIC-L04"],
              ["Versión", "v1"],
              ["Fecha del dictamen", "28/04/2026"],
              ["Expediente de medicina laboral", "SIM-ARL-ML-2025-10342"],
              ["Tipo de calificación", "Pérdida de capacidad laboral y ocupacional, primera oportunidad"],
              ["Entidad calificadora", "ARL SURA · Medicina laboral, regional Eje Cafetero · Pereira"],
              ["Manual aplicado", "Decreto 1507 de 2014, Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional"],
              ["Motivo", "Calificar las secuelas de la enfermedad cuyo origen laboral definió EPS SURA en el dictamen ORI-L04 del 24/06/2025, en firme desde el 14/07/2025"],
              ["Valoración presencial", "07/04/2026, Pereira (anexo 2)"],
              ["Código de verificación", "SIM-VER-6K2T-94QX"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Elena Marín Cuéllar"],
              ["Documento", "C.C. SIM-42.118.637"],
              ["Fecha de nacimiento", "12/02/1971"],
              ["Edad", "55 años"],
              ["Sexo", "Femenino"],
              ["Residencia", "Dosquebradas, Risaralda"],
              ["Escolaridad", "Bachiller y técnica laboral en procesos metalmecánicos"],
              ["Dominancia", "Diestra"],
              ["Convivencia", "Vive con su hija adulta"],
              ["Afiliación a la ARL", "ARL SURA · SIM-ARL-2012-48113"],
              ["EPS", "EPS SURA · SIM-EPS-1996-207714"],
              ["Fondo de pensiones", "Cordillera Pensiones y Cesantías · SIM-AFP-1996-311052"],
              ["Último empleador", "Prensas Umbral del Otún S.A.S. · NIT SIM-900.587.214-9 (contrato terminado el 30/09/2025)"],
              ["Cargo habitual", "Operaria de prensa mecánica (01/09/2012 a 31/12/2024)"],
              ["Último cargo", "Auxiliar de inventario de repuestos, por reubicación (01/01/2025 a 30/09/2025)"],
              ["Ayudas técnicas", "Audífonos retroauriculares en ambos oídos desde el 22/04/2024"]
            ] },
            { h: "Antecedentes laborales" },
            { tabla: {
              cols: ["Período", "Empresa", "Cargo", "Exposición relevante"],
              filas: [
                ["01/01/1996 a 31/12/2003", "Fundición Quebrada Larga", "Auxiliar de desmoldeo y acabado", "Herramientas neumáticas, desmoldeo y esmerilado, cerca de 4 h por turno de 8 h"],
                ["01/01/2004 a 31/07/2012", "Mecanizados Nudo Alto", "Operaria de pulido de piezas", "Esmerilado y desbarbado, unas 5 h acumuladas por turno de 8 h; tapones con registro parcial"],
                ["01/09/2012 a 31/12/2024", "Prensas Umbral del Otún S.A.S.", "Operaria de prensa mecánica", "Unas 5 h acumuladas por turno de 8 h en la prensa; ruido impulsivo del troquelado; 92 dB(A) en la dosimetría personal del 22/08/2023"],
                ["01/01/2025 a 30/09/2025", "Prensas Umbral del Otún S.A.S.", "Auxiliar de inventario de repuestos", "Almacén segregado, fuera de la nave; avisos visuales"]
              ],
              nota: "Sin vínculo laboral en agosto de 2012. Retiro voluntario el 30/09/2025; sin vínculo laboral desde el 01/10/2025."
            } },
            { h: "Fundamentos de hecho" },
            { p: "Mujer de 55 años, diestra, que trabajó casi 29 años en oficios metalmecánicos con ruido: 8 años en desmoldeo y acabado de fundición, 8 años y 7 meses en pulido y esmerilado de piezas y 12 años y 4 meses como operaria de prensa mecánica en la nave de estampado de Prensas Umbral del Otún S.A.S., con ruido impulsivo del troquelado." },
            { p: "En el control periódico del 11/11/2021 refirió tinnitus y dificultad para seguir instrucciones en la nave. El 05/03/2024 otorrinolaringología confirmó hipoacusia neurosensorial bilateral de predominio agudo, con compromiso de frecuencias conversacionales. Usa audífonos binaurales desde el 22/04/2024, con ajustes en julio y octubre de 2024, y cumplió ocho sesiones de entrenamiento auditivo entre enero y marzo de 2025. Desde el 01/01/2025 trabajó reubicada en el almacén, con avisos visuales, hasta su retiro el 30/09/2025." },
            { p: "La valoración funcional de cierre de la IPS Audiológica Cauce Claro, del 12/09/2025, registra umbrales estables frente a 2024 y, con las ayudas auditivas, dificultad para seguir conversaciones, reconocer alarmas y orientarse por los sonidos, con tinnitus persistente (documentos valorados en el anexo 1). La valoración presencial del 07/04/2026 en ARL SURA confirma esos hallazgos (anexo 2)." },
            { p: "El origen laboral quedó definido por EPS SURA en el dictamen ORI-L04 del 24/06/2025, que cita la dosimetría personal del 22/08/2023 en la nave de estampado (92 dB(A) en 8 horas) y quedó en firme el 14/07/2025." },
            { h: "Diagnósticos" },
            { tabla: {
              cols: ["CIE-10", "Diagnóstico", "Origen", "Se califica"],
              filas: [
                ["H83.3", "Pérdida auditiva neurosensorial bilateral inducida por ruido", "Laboral (ORI-L04)", "Sí"],
                ["H93.1", "Tinnitus persistente, asociado a la pérdida auditiva", "Laboral (ORI-L04)", "Sí, como deficiencia que se suma a la auditiva"],
                ["Z97.4", "Usuaria de audífonos externos", "No aplica", "No. Condición que se tiene en cuenta en el Título II"]
              ],
              nota: ""
            } }
          ] },
          { titulo: "Título I · Valoración de las deficiencias", bloques: [
            { p: "Capítulo 9 del Manual, deficiencias por alteraciones del oído, nariz, garganta y estructuras relacionadas, sección de audición. Se califica con las tres audiometrías tonales del protocolo de cierre de la IPS Audiológica Cauce Claro (29/08/2025, 05/09/2025 y 12/09/2025; extracto SIM-AUD-EX-2025-0912), por vía aérea y sin audífonos, separadas por una semana, con reposo auditivo y sin exposición a ruido laboral desde el 01/01/2025. Son concordantes entre sí, con la audiometría de diagnóstico del 05/03/2024, con la logoaudiometría y con la acumetría de la valoración presencial: la pérdida es neurosensorial y no progresó después del retiro de la exposición." },
            { h: "Suma de los umbrales de vía aérea en 500, 1.000, 2.000 y 3.000 Hz (dB)" },
            { tabla: {
              cols: ["Oído", "29/08/2025", "05/09/2025", "12/09/2025", "Promedio de las sumas", "Promedio por frecuencia"],
              filas: [
                ["Derecho", "255", "245", "250", "250", "62,5"],
                ["Izquierdo", "275", "265", "270", "270", "67,5"]
              ],
              nota: "Umbrales del 12/09/2025: oído derecho 40, 55, 75 y 80 dB; oído izquierdo 45, 60, 80 y 85 dB. Logoaudiometría concordante: umbral de recepción del habla de 60 dB en el oído derecho y de 65 dB en el izquierdo."
            } },
            { h: "Cálculo de la deficiencia auditiva" },
            { tabla: {
              cols: ["Paso", "Cálculo", "Resultado"],
              filas: [
                ["Deficiencia monoaural, oído derecho", "Tabla 9.1, suma de 250 dB: (62,5 − 25) × 1,5", "56,25 %"],
                ["Deficiencia monoaural, oído izquierdo", "Tabla 9.1, suma de 270 dB: (67,5 − 25) × 1,5", "63,75 %"],
                ["Deficiencia auditiva binaural", "Tabla 9.2, cruce del oído con menor pérdida (250 dB) y del oído con mayor pérdida (270 dB): (5 × 56,25 + 63,75) / 6", "57,50 %"],
                ["Deficiencia global por la pérdida auditiva", "Tabla 9.3, conversión de la deficiencia binaural a la persona total: 57,50 × 0,35 = 20,1", "20,00 %"],
                ["Tinnitus", "Tinnitus subjetivo persistente, documentado por otorrinolaringología desde el 05/03/2024, que altera el sueño y la concentración (índice de discapacidad por tinnitus de 62 puntos). El Manual asigna 3 % al tinnitus subjetivo y 5 % solo al objetivo, y su valor se suma aritméticamente a la otra deficiencia", "3,00 %"],
                ["Valor final de las deficiencias", "20,00 + 3,00", "23,00 %"]
              ],
              nota: "Se promedian las sumas de las tres audiometrías; con menos de tres, el Manual toma la mejor. Una suma de 100 dB o menos en un oído corresponde a 0 %."
            } },
            { p: "No se identifican otras deficiencias: el equilibrio es normal en la valoración clínica (Romberg y marcha en tándem normales, sin nistagmo espontáneo) y no hay alteraciones de la voz, el habla ni la deglución." },
            { kv: [
              ["Valor final de las deficiencias", "23,00 %"],
              ["Título I ponderado al 50 %", "11,50 %"]
            ] }
          ] },
          { titulo: "Título II y concepto final", bloques: [
            { h: "Título II · Valoración del rol laboral, rol ocupacional y otras áreas ocupacionales" },
            { p: "Valoración realizada por terapia ocupacional el 07/04/2026, con entrevista, observación de actividades con y sin audífonos y revisión del extracto audiológico y de la valoración funcional de cierre del 12/09/2025." },
            { tabla: {
              cols: ["Rol laboral", "Criterio aplicado", "Valor (%)", "Máximo (%)"],
              filas: [
                ["Restricciones del rol laboral", "Rol laboral posible solo en condiciones especiales, con restricciones completas para su oficio: no puede volver a operar prensas ni a otro oficio de su formación metalmecánica (restricción permanente de ruido de 80 dB(A) o más, de trabajo junto a maquinaria en movimiento y de tareas que dependan de alarmas sonoras o de comunicación verbal continua). Ya en la valoración funcional de cierre del 12/09/2025, en el cargo de reubicación solo podía trabajar con avisos visuales y con un compañero que le transmitía los llamados por altavoz, el paso de montacargas y la alarma de evacuación", "25,00", "25,00"],
                ["Autosuficiencia económica", "No autosuficiente: sin ingresos propios desde el retiro del 30/09/2025; depende económicamente de su hija", "2,50", "2,50"],
                ["Edad", "55 años a la fecha de la calificación (54 a la fecha de estructuración, en el mismo rango de la tabla)", "2,00", "2,50"],
                ["Subtotal", "", "29,50", "30,00"]
              ],
              nota: ""
            } },
            { tabla: {
              cols: ["Otras áreas ocupacionales", "Actividades con dificultad en su desempeño habitual con audífonos (grado de dificultad)", "Valor (%)", "Máximo (%)"],
              filas: [
                ["Aprendizaje y aplicación del conocimiento", "Escuchar (severa); aprender con instrucciones orales (severa); adquirir habilidades en capacitaciones de grupo (severa); centrar la atención con el tinnitus (severa); pensar (moderada); resolver problemas con información hablada (moderada); tomar decisiones con información hablada (moderada); seguir instrucciones verbales de varios pasos (moderada)", "2,00", "4,00"],
                ["Comunicación", "Recibir mensajes hablados (severa); recibir mensajes sonoros no verbales, como timbres, alarmas y bocinas (severa); conversar con una persona (moderada); conversar con varias personas (completa); participar en discusiones (completa); usar el teléfono (severa); usar altavoces e intercomunicadores (completa); comunicarse en lugares con ruido (completa); tomar la palabra en reuniones (moderada); regular el volumen de la propia voz (leve)", "3,00", "4,00"],
                ["Movilidad", "Desplazarse por la calle y cruzar vías sin localizar por el sonido vehículos ni bocinas (severa); desplazarse por lugares concurridos (severa); usar el transporte público sin oír los anuncios (severa); desplazarse por zonas con maquinaria o vehículos en movimiento (completa)", "1,30", "4,00"],
                ["Autocuidado personal", "Cuidar de la propia salud, con citas y orientaciones de viva voz o por teléfono (severa); cuidar de la propia seguridad ante alarmas de humo y de gas (completa); descansar y conciliar el sueño con el tinnitus (severa); cuidado diario de los audífonos (moderada)", "1,20", "4,00"],
                ["Vida doméstica", "Hacer compras con atención verbal (severa); hacer trámites en ventanillas (severa); atender la puerta y el timbre (completa); atender el teléfono de la casa (severa); atender los avisos sonoros de los electrodomésticos (severa); oír los llamados de otros miembros del hogar desde otra habitación (severa); recibir visitas y atender a varias personas a la vez (severa); participar en reuniones de la comunidad (severa)", "2,50", "4,00"],
                ["Subtotal", "", "10,00", "20,00"]
              ],
              nota: "Cada área suma diez actividades calificadas de 0 a 0,4: dificultad leve 0,1, moderada 0,2, severa 0,3 y completa 0,4. Las actividades que no se mencionan no tienen dificultad."
            } },
            { kv: [["Total Título II", "39,50 %"]] },
            { h: "Concepto final" },
            { tabla: {
              cols: ["Componente", "Valor (%)"],
              filas: [
                ["Título I · Deficiencias, ponderado al 50 %", "11,50"],
                ["Título II · Rol laboral, rol ocupacional y otras áreas ocupacionales", "39,50"],
                ["Pérdida de capacidad laboral y ocupacional", "51,00"]
              ],
              nota: ""
            } },
            { kv: [
              ["Pérdida de capacidad laboral", "51,00 %"],
              ["Origen", "Laboral · enfermedad laboral (ORI-L04 de EPS SURA, del 24/06/2025, en firme el 14/07/2025)"],
              ["Diagnóstico calificado", "H83.3 · Pérdida auditiva neurosensorial bilateral inducida por ruido, con tinnitus persistente"],
              ["Fecha de estructuración", "12/09/2025"],
              ["Edad en la fecha de estructuración", "54 años"],
              ["Requiere ayuda de otra persona para las actividades básicas", "No"],
              ["Requiere ayuda de otra persona para tomar decisiones", "No"]
            ] },
            { h: "Fundamento de la fecha de estructuración" },
            { p: "Se fija el 12/09/2025, fecha de la valoración funcional de cierre de la IPS Audiológica Cauce Claro. En esa fecha, terminados la adaptación de audífonos y el entrenamiento auditivo, quedaron establecidas y documentadas en la historia clínica las secuelas que sustentan la pérdida calificada: la deficiencia auditiva definitiva, con tres audiometrías de cierre concordantes; el tinnitus persistente; y las limitaciones residuales que le impiden su oficio y solo le permiten trabajar en condiciones especiales (Decreto 1507 de 2014, art. 3: la fecha de estructuración se determina con base en la evolución de las secuelas y se soporta en la historia clínica). Las audiometrías de cierre son iguales, dentro de 5 dB, a la del 05/03/2024: la pérdida no progresó con la doble protección auditiva ni después del retiro de la exposición. Antes del cierre la persona estaba en rehabilitación y la historia clínica no permitía establecer las limitaciones que persistían con las ayudas auditivas. La valoración presencial del 07/04/2026 no encontró cambios en la audición ni en la función." },
            { h: "Fundamentos de derecho" },
            { lista: [
              "Ley 100 de 1993, art. 41, modificado por el Decreto Ley 019 de 2012, art. 142.",
              "Ley 776 de 2002, prestaciones económicas del Sistema General de Riesgos Laborales.",
              "Ley 1562 de 2012, que modifica el Sistema General de Riesgos Laborales.",
              "Decreto 1507 de 2014, Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional.",
              "Dictamen ORI-L04 de EPS SURA, del 24/06/2025, que definió el origen laboral."
            ] },
            { h: "Notificación y recursos" },
            { p: "Este dictamen se notifica por escrito a la persona calificada, por el canal que tiene registrado, y se comunica a EPS SURA, a Cordillera Pensiones y Cesantías y a Prensas Umbral del Otún S.A.S., último empleador. Cualquiera de ellos puede manifestar su inconformidad ante ARL SURA dentro de los 10 días hábiles siguientes a su notificación. En ese caso, ARL SURA remitirá el expediente a la Junta Regional de Calificación de Invalidez de Risaralda dentro de los 5 días siguientes. Si nadie manifiesta inconformidad dentro del término, el dictamen queda en firme." },
            { p: "El reconocimiento de las prestaciones económicas que se deriven de este dictamen se tramita por separado ante Prestaciones económicas de ARL SURA." },
            { firma: { nombre: "Germán Augusto Quintana Restrepo", cargo: "Médico especialista en medicina del trabajo, ARL SURA", registro: "Registro médico SIM-66-204417", fecha: "28/04/2026" } },
            { firma: { nombre: "Luz Adriana Becerra Holguín", cargo: "Terapeuta ocupacional, especialista en seguridad y salud en el trabajo, ARL SURA", registro: "Tarjeta profesional SIM-TO-5172", fecha: "28/04/2026" } },
            { nota: "Notificado por escrito y en forma personal a la persona calificada el 29/04/2026 (acta SIM-NOT-2026-04417). Comunicado el mismo día a EPS SURA, al fondo de pensiones y al último empleador." }
          ] },
          { titulo: "Anexo 1 · Documentos y pruebas valorados", bloques: [
            { tabla: {
              cols: ["Documento", "Fecha", "Emisor", "Hallazgo relevante"],
              filas: [
                ["Dictamen de origen ORI-L04, con constancia de firmeza", "24/06/2025 · firme el 14/07/2025", "EPS SURA, Medicina laboral", "Origen laboral de H83.3"],
                ["Extracto audiológico y valoración funcional de cierre SIM-AUD-EX-2025-0912", "12/09/2025", "IPS Audiológica Cauce Claro", "Audiometrías de 2012 a 2025, logoaudiometría, inmitancia, otoemisiones, audífonos, entrenamiento auditivo y limitaciones residuales"],
                ["Audiometrías tonales del protocolo de cierre", "29/08/2025, 05/09/2025 y 12/09/2025", "IPS Audiológica Cauce Claro", "Concordantes entre sí; promedio de las sumas de 250 dB en el oído derecho y de 270 dB en el izquierdo (promedios de 62,5 y 67,5 dB); máximo en 4.000 Hz"],
                ["Consulta de otorrinolaringología", "05/03/2024", "IPS Audiológica Cauce Claro", "Diagnóstico de hipoacusia neurosensorial bilateral inducida por ruido; glucemia, perfil lipídico y función tiroidea normales"],
                ["Recomendaciones médico-laborales", "18/11/2024", "IPS Audiológica Cauce Claro, medicina del trabajo", "Retiro definitivo de la nave de estampado y avisos visuales en el puesto"],
                ["Certificado laboral", "30/09/2025", "Prensas Umbral del Otún S.A.S., gestión humana", "Cargos y fechas del 01/09/2012 al 30/09/2025; terminación por retiro voluntario"],
                ["Valoración presencial y de terapia ocupacional", "07/04/2026", "ARL SURA, Medicina laboral", "Examen otológico, acumetría, pruebas de comunicación y entrevista ocupacional (anexo 2)"]
              ],
              nota: ""
            } }
          ] },
          { titulo: "Anexo 2 · Valoración presencial del 07/04/2026", bloques: [
            { h: "Condiciones de la valoración" },
            { p: "Consultorio con baja reverberación y sin ruido de fondo. Se entregaron por escrito las instrucciones de cada prueba. Asiste sola; usa sus audífonos, que se retiran para la acumetría." },
            { h: "Examen físico" },
            { lista: [
              "Otoscopia: conductos auditivos externos permeables y membranas timpánicas íntegras, nacaradas y móviles en ambos oídos.",
              "Acumetría con diapasón de 512 Hz: Weber central; Rinne positivo en ambos oídos. Compatible con pérdida neurosensorial simétrica.",
              "Equilibrio: Romberg y Romberg sensibilizado negativos; marcha en tándem normal; sin nistagmo espontáneo.",
              "Voz y habla: articulación normal; intensidad de la voz aumentada en la conversación."
            ] },
            { h: "Pruebas de comunicación" },
            { tabla: {
              cols: ["Prueba", "Resultado", "Referencia"],
              filas: [
                ["Repetición de frases a 1 m, con audífonos, mirando a la evaluadora", "8 de 10", "10 de 10"],
                ["Repetición de frases a 1 m, con audífonos, sin ver los labios", "5 de 10", "10 de 10"],
                ["Repetición de frases a 1 m, con audífonos, con ruido de fondo de una radio", "3 de 10", "10 de 10"],
                ["Índice de discapacidad por tinnitus", "62 de 100 (grado severo)", "16 o menos: grado muy leve"],
                ["Cuestionario de discapacidad auditiva para adultos", "72 de 100 (discapacidad severa)", "16 o menos: sin discapacidad"]
              ],
              nota: "Los resultados concuerdan con la valoración funcional de cierre del 12/09/2025: la función está estable."
            } },
            { h: "Entrevista ocupacional" },
            { p: "Trabajó como auxiliar de inventario de repuestos desde enero hasta septiembre de 2025, con lector de códigos y avisos visuales; necesitaba que sus compañeros la tocaran en el hombro para avisarle del paso de montacargas y de los llamados por altavoz. Se retiró el 30/09/2025. En casa no oye el timbre ni el teléfono desde otra habitación; su hija la llama por mensaje escrito. Evita las reuniones familiares numerosas porque no puede seguir la conversación. Al cruzar la calle se apoya solo en la vista. El tinnitus le dificulta conciliar el sueño la mayoría de las noches." },
            { firma: { nombre: "Luz Adriana Becerra Holguín", cargo: "Terapeuta ocupacional, ARL SURA", registro: "Tarjeta profesional SIM-TO-5172", fecha: "07/04/2026" } },
            { firma: { nombre: "Germán Augusto Quintana Restrepo", cargo: "Médico especialista en medicina del trabajo, ARL SURA", registro: "Registro médico SIM-66-204417", fecha: "07/04/2026" } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Constancia de firmeza */
    FIR: {
      v1: {
        tipo: "constancia",
        titulo: "Constancia de firmeza del dictamen de pérdida de capacidad laboral",
        emisor: { n: "ARL SURA", area: "Medicina laboral, regional Eje Cafetero", ciudad: "Pereira", id: "NIT SIM-800.256.433-1" },
        numero: "FIR-L04",
        fecha: "15/05/2026",
        version: "v1",
        estadoNota: "Constancia vinculada al dictamen DIC-L04 por su número, su versión y su código de verificación.",
        paginas: [
          { titulo: "Constancia", bloques: [
            { kv: [
              ["Constancia", "FIR-L04"],
              ["Fecha", "15/05/2026"],
              ["Dictamen al que se refiere", "DIC-L04, versión v1, del 28/04/2026"],
              ["Código de verificación del dictamen", "SIM-VER-6K2T-94QX"],
              ["Expediente de medicina laboral", "SIM-ARL-ML-2025-10342"],
              ["Persona calificada", "Elena Marín Cuéllar · C.C. SIM-42.118.637"],
              ["Pérdida de capacidad laboral", "51,00 %"],
              ["Origen", "Laboral (ORI-L04 de EPS SURA, en firme el 14/07/2025)"],
              ["Fecha de estructuración", "12/09/2025"],
              ["Diagnóstico", "H83.3 · Pérdida auditiva neurosensorial bilateral inducida por ruido"]
            ] },
            { h: "Notificaciones y términos" },
            { tabla: {
              cols: ["Interesado", "Medio", "Fecha de notificación", "Término", "Vencimiento", "Inconformidad"],
              filas: [
                ["Elena Marín Cuéllar, persona calificada", "Notificación personal por escrito, acta SIM-NOT-2026-04417", "29/04/2026", "10 días hábiles", "14/05/2026", "No presentó"],
                ["EPS SURA", "Comunicación electrónica con acuse de recibo", "29/04/2026", "10 días hábiles", "14/05/2026", "No presentó"],
                ["Cordillera Pensiones y Cesantías", "Comunicación electrónica con acuse de recibo", "29/04/2026", "10 días hábiles", "14/05/2026", "No presentó"],
                ["Prensas Umbral del Otún S.A.S., último empleador", "Comunicación electrónica con acuse de recibo", "29/04/2026", "10 días hábiles", "14/05/2026", "No presentó"]
              ],
              nota: "El término corrió del 30/04/2026 al 14/05/2026. No se cuenta el festivo del 01/05/2026."
            } },
            { h: "Constancia" },
            { p: "Medicina laboral de ARL SURA hace constar que el dictamen DIC-L04, versión v1, emitido el 28/04/2026, fue notificado a la persona calificada y comunicado a los demás interesados el 29/04/2026, y que dentro de los 10 días hábiles siguientes ninguno manifestó inconformidad. En consecuencia, el dictamen quedó en firme el 15/05/2026, con una pérdida de capacidad laboral del 51,00 %, de origen laboral y con fecha de estructuración del 12/09/2025." },
            { p: "Esta constancia corresponde únicamente a la versión v1 del dictamen DIC-L04, identificada con el código de verificación SIM-VER-6K2T-94QX." },
            { h: "Fundamento" },
            { p: "Ley 100 de 1993, art. 41, modificado por el Decreto Ley 019 de 2012, art. 142: término de 10 días para manifestar inconformidad con la calificación en primera oportunidad; vencido sin inconformidad, el dictamen queda en firme." },
            { p: "Se expide para el expediente de calificación y para el trámite de prestaciones económicas que se derive del dictamen." },
            { firma: { nombre: "Juliana María Tobón Agudelo", cargo: "Coordinadora de medicina laboral, ARL SURA, regional Eje Cafetero", registro: "Registro médico SIM-66-173058", fecha: "15/05/2026" } }
          ] },
          { titulo: "Anexo · Acta de notificación personal", bloques: [
            { kv: [
              ["Acta", "SIM-NOT-2026-04417"],
              ["Fecha y hora", "29/04/2026, 10:20"],
              ["Lugar", "Oficina de atención de ARL SURA en Pereira, sala sin ruido de fondo"],
              ["Persona notificada", "Elena Marín Cuéllar · C.C. SIM-42.118.637"],
              ["Documento notificado", "Dictamen DIC-L04, versión v1, del 28/04/2026 (6 folios)"],
              ["Forma de la notificación", "Escrita: entrega de copia íntegra del dictamen y de una hoja con la explicación de los recursos; la persona usa audífonos y pidió la información por escrito"]
            ] },
            { p: "Se entregó a la persona calificada copia íntegra del dictamen y se le informó por escrito que puede manifestar su inconformidad ante ARL SURA dentro de los 10 días hábiles siguientes a esta notificación, para que el expediente se remita a la Junta Regional de Calificación de Invalidez de Risaralda." },
            { firma: { nombre: "Elena Marín Cuéllar", cargo: "Persona notificada", registro: "C.C. SIM-42.118.637", fecha: "29/04/2026" } },
            { firma: { nombre: "Yurany Andrea Castaño Loaiza", cargo: "Gestora de notificaciones, ARL SURA, Pereira", registro: "", fecha: "29/04/2026" } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Afiliación y cobertura */
    AFI: {
      v1: {
        tipo: "constancia",
        titulo: "Consulta de estado de afiliación · impresión de la pantalla",
        emisor: { n: "ARL SURA", area: "Consulta de afiliados · vista de estado actual", ciudad: "Pereira", id: "NIT SIM-800.256.433-1" },
        numero: "SIM-CON-2026-0522-0952",
        fecha: "22/05/2026",
        version: "v1",
        estadoNota: "Impresión de la consulta de estado actual hecha al radicar: dice «inactiva», sin fechas de cobertura ni identificación del último vínculo. No es una certificación.",
        paginas: [
          { titulo: "Resultado de la consulta", bloques: [
            { kv: [
              ["Sistema", "Consulta de afiliados a riesgos laborales · vista de estado actual"],
              ["Fecha y hora de la consulta", "22/05/2026, 09:52"],
              ["Dependencia que consulta", "Prestaciones económicas · radicación, oficina de Pereira"],
              ["Usuario", "SIM-USR-PRE-0417"],
              ["Motivo registrado", "Radicación RAD-L04"],
              ["Criterio de búsqueda", "Cédula de ciudadanía SIM-42.118.637"]
            ] },
            { h: "Resultado" },
            { tabla: {
              cols: ["Documento", "Nombre", "Administradora", "Estado"],
              filas: [["C.C. SIM-42.118.637", "MARÍN CUÉLLAR ELENA", "ARL SURA", "INACTIVA"]],
              nota: "Un registro encontrado."
            } },
            { vacio: "Tipo de afiliado: sin dato en esta vista." },
            { vacio: "Empleador o contratante del último vínculo: la vista de estado actual no lo muestra." },
            { vacio: "Fecha de inicio de la cobertura: sin dato en esta vista." },
            { vacio: "Fecha de retiro o de inactivación: sin dato en esta vista." },
            { vacio: "Motivo de la inactivación: sin dato en esta vista." },
            { vacio: "Historial de afiliaciones y novedades: no se incluye en la consulta de estado actual." },
            { nota: "La consulta muestra el estado a la fecha y hora indicadas. No certifica períodos de cobertura, no identifica empleadores y no reemplaza la certificación que expide Afiliaciones y novedades." },
            { nota: "Impreso por el usuario SIM-USR-PRE-0417 el 22/05/2026 a las 09:53. Sin firma." }
          ] }
        ]
      },
      v2: {
        tipo: "certificado",
        titulo: "Certificación histórica de afiliación y cobertura en riesgos laborales",
        emisor: { n: "ARL SURA", area: "Afiliaciones y novedades", ciudad: "Medellín", id: "NIT SIM-800.256.433-1" },
        numero: "SIM-ARL-CH-2026-02215",
        fecha: "25/05/2026",
        version: "v2",
        estadoNota: "Certificación expedida por Afiliaciones y novedades a solicitud de Prestaciones económicas para el trámite RAD-L04, con el historial cotejado y sin afiliación posterior al retiro.",
        paginas: [
          { titulo: "Certificación", bloques: [
            { p: "ARL SURA certifica que la persona identificada a continuación estuvo afiliada al Sistema General de Riesgos Laborales por medio de esta administradora, con los siguientes datos:" },
            { kv: [
              ["Afiliada", "Elena Marín Cuéllar"],
              ["Documento", "C.C. SIM-42.118.637"],
              ["Número de afiliación", "SIM-ARL-2012-48113"],
              ["Tipo de afiliada", "Dependiente"],
              ["Empleador", "Prensas Umbral del Otún S.A.S. · NIT SIM-900.587.214-9"],
              ["Actividad económica del empleador", "CIIU 2591 · forja, prensado, estampado y laminado de metal; pulvimetalurgia"],
              ["Fecha de inicio de la cobertura", "01/09/2012 (novedad de ingreso)"],
              ["Fecha de retiro", "30/09/2025 (novedad de retiro reportada por el empleador)"],
              ["Último día de cobertura", "30/09/2025"],
              ["Estado a la fecha de expedición", "Inactiva por retiro desde el 01/10/2025"]
            ] },
            { h: "Períodos de cobertura" },
            { tabla: {
              cols: ["Desde", "Hasta", "Empleador", "Centro de trabajo", "Cargo reportado", "Clase de riesgo", "Estado"],
              filas: [
                ["01/09/2012", "31/12/2024", "Prensas Umbral del Otún S.A.S.", "Dosquebradas, nave de estampado", "Operaria de prensa mecánica", "IV", "Cubierto sin interrupción"],
                ["01/01/2025", "30/09/2025", "Prensas Umbral del Otún S.A.S.", "Dosquebradas, almacén segregado", "Auxiliar de inventario de repuestos (reubicación, mismo contrato)", "II", "Cubierto sin interrupción"]
              ],
              nota: "El traslado al almacén del 01/01/2025 se reportó como cambio de centro de trabajo dentro del mismo contrato y no interrumpió la cobertura. Total cubierto: 157 meses."
            } },
            { h: "Cobertura en las fechas pertinentes" },
            { tabla: {
              cols: ["Fecha", "Hecho", "Cobertura de ARL SURA"],
              filas: [
                ["11/11/2021", "Primer registro de síntomas en el control periódico", "Vigente"],
                ["22/08/2023", "Dosimetría personal en la nave de estampado", "Vigente"],
                ["05/03/2024", "Diagnóstico por otorrinolaringología", "Vigente"],
                ["31/12/2024", "Último día en el puesto de operaria de prensa", "Vigente"],
                ["24/06/2025", "Calificación del origen, dictamen ORI-L04", "Vigente"],
                ["12/09/2025", "Fecha de estructuración", "Vigente"],
                ["30/09/2025", "Retiro", "Último día de cobertura"],
                ["28/04/2026", "Dictamen de pérdida de capacidad laboral DIC-L04", "Sin afiliación vigente; ARL SURA es la última administradora"],
                ["22/05/2026", "Radicación de la solicitud RAD-L04", "Sin afiliación vigente; ARL SURA es la última administradora"]
              ],
              nota: "Fechas indicadas por Prestaciones económicas en la solicitud de certificación."
            } },
            { h: "Cotejo de afiliaciones posteriores y anteriores" },
            { kv: [
              ["Consulta del registro único de afiliados", "25/05/2026: no registra afiliación a riesgos laborales posterior al 30/09/2025 en ninguna administradora"],
              ["Historial interno de ARL SURA", "Sin afiliaciones de la persona distintas de la certificada"],
              ["Períodos anteriores al 01/09/2012", "Corresponden a otras administradoras, entonces de riesgos profesionales (ARL histórica A, 1996 a 2003; ARL histórica B, 2004 a julio de 2012), según la historia laboral aportada. ARL SURA no los certifica"],
              ["Agosto de 2012", "Sin afiliación registrada"]
            ] },
            { p: "En consecuencia, ARL SURA es la última administradora de riesgos laborales a la que estuvo afiliada la persona, con cobertura continua del 01/09/2012 al 30/09/2025 por medio de Prensas Umbral del Otún S.A.S." },
            { p: "Se expide a solicitud de Prestaciones económicas de ARL SURA para el trámite RAD-L04. Esta certificación no contiene información clínica." },
            { firma: { nombre: "Natalia Andrea Grajales Toro", cargo: "Analista de afiliaciones y novedades, ARL SURA", registro: "", fecha: "25/05/2026" } },
            { nota: "Certificación verificable con el número SIM-ARL-CH-2026-02215 y el código SIM-VER-2H7M-51QA." }
          ] },
          { titulo: "Anexo · Historial de novedades y aportes", bloques: [
            { h: "Novedades registradas" },
            { tabla: {
              cols: ["Fecha de la novedad", "Novedad", "Reportada por", "Planilla"],
              filas: [
                ["01/09/2012", "Ingreso", "Prensas Umbral del Otún S.A.S.", "SIM-PL-1210-0233"],
                ["01/01/2025", "Cambio de centro de trabajo: de la nave de estampado al almacén segregado", "Prensas Umbral del Otún S.A.S.", "SIM-PL-2502-0418"],
                ["30/09/2025", "Retiro", "Prensas Umbral del Otún S.A.S.", "SIM-PL-2510-0391"]
              ],
              nota: ""
            } },
            { h: "Cobertura por año" },
            { tabla: {
              cols: ["Año", "Meses cubiertos", "Meses con aporte registrado", "Observación"],
              filas: [
                ["2012", "4 (septiembre a diciembre)", "4", "Ingreso el 01/09/2012"],
                ["2013 a 2024", "144 (12 por año)", "144", "Sin interrupciones"],
                ["2025", "9 (enero a septiembre)", "9", "Retiro el 30/09/2025"],
                ["2026", "0", "0", "Sin afiliación"],
                ["Total", "157", "157", ""]
              ],
              nota: ""
            } },
            { h: "Últimos aportes" },
            { tabla: {
              cols: ["Período cotizado", "Planilla", "Fecha de pago", "Días", "Estado"],
              filas: [
                ["Julio de 2025", "SIM-PL-2508-0377", "06/08/2025", "30", "Pagado"],
                ["Agosto de 2025", "SIM-PL-2509-0362", "08/09/2025", "30", "Pagado"],
                ["Septiembre de 2025", "SIM-PL-2510-0391", "07/10/2025", "30", "Pagado, con novedad de retiro"],
                ["Octubre de 2025 en adelante", "Sin planilla", "No aplica", "0", "Sin aportes"]
              ],
              nota: "Información tomada del historial de novedades y de las planillas de aportes recibidas por ARL SURA."
            } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Anexo de exposición fechado */
    NEX: {
      v1: {
        tipo: "informe",
        titulo: "Anexo de exposición ocupacional a ruido · puesto de operaria de prensa mecánica (2012 a 2024)",
        emisor: { n: "Prensas Umbral del Otún S.A.S.", area: "Sistema de gestión de seguridad y salud en el trabajo", ciudad: "Dosquebradas, Risaralda", id: "NIT SIM-900.587.214-9" },
        numero: "SIM-SST-NEX-2026-007",
        fecha: "26/05/2026",
        version: "v1",
        estadoNota: "Anexo fechado remitido por el SG-SST a Prestaciones económicas de ARL SURA el 26/05/2026. Incorpora el informe de dosimetría del 22/08/2023 y la ficha del puesto de 2012 a 2024.",
        paginas: [
          { titulo: "Anexo de exposición", bloques: [
            { kv: [
              ["Remitido a", "ARL SURA · Prestaciones económicas"],
              ["Solicitud", "Requerimiento del 22/05/2026 para el trámite RAD-L04"],
              ["Trabajadora", "Elena Marín Cuéllar · C.C. SIM-42.118.637 (retirada el 30/09/2025)"],
              ["Cargo evaluado", "Operaria de prensa mecánica"],
              ["Período en el cargo", "01/09/2012 a 31/12/2024"],
              ["Centro de trabajo", "Dosquebradas, nave de estampado · CIIU 2591"],
              ["Jornada", "Turnos rotativos de 8 horas (06:00 a 14:00 y 14:00 a 22:00)"],
              ["Agente", "Ruido continuo con componente impulsivo del troquelado"],
              ["Fuentes", "Ficha del puesto (versiones de 2012, 2017 y 2022); informe de dosimetría SIM-HI-2023-0918; historial de mediciones del programa de conservación auditiva; registros de entrega y uso de protección auditiva; orden de reubicación SIM-SST-REU-2024-019; novedades de nómina y planillas de aportes"]
            ] },
            { h: "Objeto" },
            { p: "Relacionar la exposición a ruido medida en el puesto con el cargo que desempeñó la trabajadora, con las fechas de ese cargo y de su afiliación a riesgos laborales, y con el dictamen de origen ORI-L04 de EPS SURA, que cita el informe de dosimetría del 22/08/2023." },
            { h: "Relación entre el riesgo, el puesto, el período y el dictamen de origen" },
            { tabla: {
              cols: ["Elemento", "Dato", "Fuente"],
              filas: [
                ["Puesto", "Operaria de prensa mecánica, nave de estampado; prensa excéntrica SIM-PR-03 (2012 a 2018) y SIM-PR-04 (2019 a 2024)", "Ficha del puesto (hoja 2)"],
                ["Período de exposición en el puesto", "01/09/2012 a 31/12/2024 (12 años y 4 meses)", "Novedades de nómina"],
                ["Tarea y turno", "Alimentar la prensa, activar el ciclo y verificar la pieza, unas 5 h acumuladas por turno de 8 h; el resto del turno, dentro de la nave salvo 45 minutos de pausas", "Ficha del puesto (hoja 2)"],
                ["Medición", "Dosimetría personal del 22/08/2023, turno de 06:00 a 14:00, prensa SIM-PR-04: LAeq,8h de 92,0 dB(A) y pico máximo de 132,6 dB(C)", "Informe SIM-HI-2023-0918 (hoja 3)"],
                ["Representatividad", "Mismo cargo, mismas tareas y prensas del mismo tipo durante todo el período; mediciones de 2013, 2016 y 2019 entre 92,6 y 94,0 dB(A)", "Historial de mediciones (hoja 4)"],
                ["Afiliación a riesgos laborales durante la exposición", "ARL SURA durante todo el vínculo, del 01/09/2012 al 30/09/2025", "Planillas de aportes del empleador"],
                ["Fin de la exposición", "31/12/2024. Reubicación en el almacén segregado desde el 01/01/2025 (64,0 dB(A))", "Orden de reubicación SIM-SST-REU-2024-019"],
                ["Dictamen de origen", "ORI-L04 de EPS SURA, del 24/06/2025: H83.3 de origen laboral. Cita este informe de dosimetría según el resumen de exposición que el empleador remitió el 19/05/2025, sin anexos", "Copia del dictamen comunicada al empleador el 26/06/2025"]
              ],
              nota: ""
            } },
            { h: "Conclusión" },
            { p: "La exposición a ruido por encima del valor límite permisible de 85 dB(A) para 8 horas ocurrió en el puesto de operaria de prensa mecánica durante todo el período del 01/09/2012 al 31/12/2024, que está comprendido íntegramente en la afiliación a ARL SURA. La dosimetría del 22/08/2023 que cita el dictamen ORI-L04 corresponde a ese puesto, a esa tarea y al turno de 06:00 a 14:00, y es representativa del período según la ficha del puesto y las mediciones anteriores." },
            { p: "Se remite solo la información de exposición necesaria para la finalidad indicada. Este anexo no contiene datos clínicos de la trabajadora." },
            { firma: { nombre: "Wilson Arley Rendón Gallego", cargo: "Coordinador del SG-SST, Prensas Umbral del Otún S.A.S.", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2015-3381", fecha: "26/05/2026" } },
            { firma: { nombre: "Héctor Fabio Morales Quintero", cargo: "Jefe de producción, nave de estampado · certifica las tareas y los equipos asignados", registro: "", fecha: "26/05/2026" } }
          ] },
          { titulo: "Hoja 2 · Ficha del puesto de operaria de prensa mecánica (2012 a 2024)", bloques: [
            { kv: [
              ["Ficha", "SIM-SST-FP-ESTAMP-02 · versiones del 03/09/2012, 14/03/2017 y 08/02/2022, sin cambios en las tareas"],
              ["Área", "Nave de estampado"],
              ["Proceso", "Estampado y troquelado de soportes y herrajes en lámina de acero de 1,5 a 3 mm"],
              ["Equipos asignados a la trabajadora", "Prensa excéntrica de 80 toneladas SIM-PR-03 (01/09/2012 a 31/12/2018) y prensa excéntrica de 100 toneladas SIM-PR-04 (01/01/2019 a 31/12/2024), con troquel progresivo y alimentador neumático de fleje"],
              ["Cadencia", "25 a 35 golpes por minuto en ciclo continuo; golpe a golpe en piezas grandes"],
              ["Otras fuentes de ruido", "Cuatro prensas vecinas, expulsión de piezas con aire comprimido, caída de piezas en canastas metálicas, montacargas"]
            ] },
            { h: "Tareas y tiempos por turno" },
            { tabla: {
              cols: ["Tarea", "Tiempo por turno", "Fuente de ruido principal", "Nivel medido el 22/08/2023"],
              filas: [
                ["Alimentación de fleje o pieza en la prensa", "2 h", "Golpe del troquel y alimentador neumático", "92,8 dB(A)"],
                ["Activación del ciclo y troquelado", "2 h", "Impacto del troquel; expulsión de piezas con aire comprimido", "95,4 dB(A) · pico 132,6 dB(C)"],
                ["Verificación de la pieza en la mesa junto a la prensa", "1 h", "Prensa propia y prensas vecinas", "90,6 dB(A)"],
                ["Abastecimiento de fleje y retiro de canastas", "1 h 30 min", "Prensas vecinas y montacargas", "89,8 dB(A)"],
                ["Retiro de retal, limpieza y entrega de turno", "45 min", "Prensas vecinas", "89,3 dB(A)"],
                ["Pausa activa (15 min) y almuerzo (30 min)", "45 min", "Comedor y zona de pausas, fuera de la nave", "68,5 dB(A)"]
              ],
              nota: "Total: 8 horas. Tiempo en la prensa: unas 5 horas acumuladas por turno (alimentación, troquelado y verificación). La estimación ponderada por tareas (92,4 dB(A) en 8 horas) concuerda con la dosimetría de la jornada (92,0 dB(A))."
            } },
            { h: "Controles y protección auditiva" },
            { tabla: {
              cols: ["Período o fecha", "Control o protección", "Registro"],
              filas: [
                ["2012 a 2023", "Tapones de inserción de espuma (reducción nominal de 29 dB), entregados cada semana", "Registro de entrega; sin registro de uso"],
                ["09/10/2018", "Audiometría de control clasificada como caso sospechoso en el programa de conservación auditiva; refuerzo del uso de tapones", "Informe del programa de vigilancia"],
                ["16/04/2024", "Barrera acústica parcial entre las prensas SIM-PR-04 y SIM-PR-05", "Orden de trabajo SIM-OT-2024-0311"],
                ["Desde el 16/04/2024", "Orejeras de copa (reducción nominal de 25 dB) sobre los tapones", "Registro diario de uso firmado por el supervisor"],
                ["18/11/2024", "Recomendación médico-laboral de retiro definitivo de la exposición a ruido", "IPS Audiológica Cauce Claro, medicina del trabajo"],
                ["01/01/2025", "Reubicación en el almacén segregado como auxiliar de inventario de repuestos", "Orden de reubicación SIM-SST-REU-2024-019 del 12/12/2024"]
              ],
              nota: ""
            } },
            { h: "Restricción y reubicación" },
            { kv: [
              ["Restricción", "No exponerse a ruido de 80 dB(A) o más; no trabajar junto a maquinaria en movimiento sin señalización visual; avisos visuales o vibratorios en lugar de alarmas sonoras"],
              ["Fecha de la reubicación", "01/01/2025"],
              ["Nuevo puesto", "Auxiliar de inventario de repuestos, almacén segregado: 64,0 dB(A) en la sonometría del 20/01/2025"]
            ] },
            { firma: { nombre: "Wilson Arley Rendón Gallego", cargo: "Coordinador del SG-SST, Prensas Umbral del Otún S.A.S.", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2015-3381", fecha: "26/05/2026" } }
          ] },
          { titulo: "Hoja 3 · Informe de dosimetría personal de ruido (22/08/2023)", bloques: [
            { kv: [
              ["Informe", "SIM-HI-2023-0918"],
              ["Elaborado por", "Acústica Ocupacional Guayacán S.A.S. · NIT SIM-901.442.806-1"],
              ["Fecha de la medición", "22/08/2023"],
              ["Fecha del informe", "01/09/2023"],
              ["Trabajadora medida", "Elena Marín Cuéllar, operaria de prensa mecánica"],
              ["Equipo de trabajo", "Prensa excéntrica de 100 toneladas SIM-PR-04, troquel progresivo de soportes"],
              ["Turno", "06:00 a 14:00; producción de 9.400 piezas, dentro de lo habitual"],
              ["Instrumento", "Dosímetro personal de ruido conforme a IEC 61252, serie SIM-DS-4471, con el micrófono en el hombro izquierdo, del lado de la prensa"],
              ["Calibración", "Certificado SIM-CAL-2023-0377 del 12/05/2023; verificación en campo con calibrador acústico clase 1 a 94 dB y 1.000 Hz: diferencia de 0,1 dB entre el inicio y el final"],
              ["Método", "ISO 9612:2009, estrategia de medición de jornada completa"],
              ["Configuración", "Ponderación A y respuesta lenta. Canal 1: criterio 85 dB(A), intercambio de 3 dB, umbral 80 dB(A). Canal 2: criterio 85 dB(A), intercambio de 5 dB. Pico con ponderación C"],
              ["Tiempo de medición", "470 minutos (06:05 a 13:55)"],
              ["Mediciones complementarias", "Sonometría por tarea con sonómetro integrador clase 1, el mismo día (resultados en la hoja 2)"]
            ] },
            { h: "Resultados" },
            { tabla: {
              cols: ["Indicador", "Resultado", "Referencia", "Valoración"],
              filas: [
                ["Nivel equivalente en el tiempo medido (LAeq,T)", "92,1 dB(A) en 470 min", "No aplica", "No aplica"],
                ["Nivel equivalente normalizado a 8 horas (LAeq,8h)", "92,0 dB(A)", "85 dB(A) en 8 horas (Resolución 1792 de 1990)", "Supera el valor límite en 7 dB"],
                ["Dosis con intercambio de 5 dB", "256 %", "100 % (tabla de la Resolución 1792 de 1990)", "Supera"],
                ["Tiempo máximo diario con 92 dB(A) según la tabla de la Resolución 1792 de 1990", "Unas 3 horas", "8 horas con 85 dB(A)", "Excedido: la jornada es de 8 horas"],
                ["Dosis con intercambio de 3 dB", "505 %", "100 % (criterio de 85 dB(A) e intercambio de 3 dB que recomienda la guía de atención integral)", "Supera"],
                ["Tiempo permitido con 92,0 dB(A) e intercambio de 3 dB", "95 minutos", "8 horas con 85 dB(A)", "Excedido"],
                ["Nivel pico máximo (LCpeak)", "132,6 dB(C)", "140 dB(C), valor máximo para ruido de impacto", "No supera"]
              ],
              nota: "LAeq,8h = LAeq,T + 10 · log(T / 8 h) = 92,1 + 10 · log(470 / 480) = 92,0 dB(A)."
            } },
            { h: "Nivel por intervalo" },
            { tabla: {
              cols: ["Intervalo", "Duración (min)", "LAeq (dB(A))", "Pico máximo (dB(C))", "Actividad"],
              filas: [
                ["06:05 a 07:00", "55", "91,6", "129,8", "Arranque, cambio de rollo de fleje y alimentación"],
                ["07:00 a 08:00", "60", "93,5", "131,2", "Troquelado en ciclo continuo"],
                ["08:00 a 09:00", "60", "93,8", "132,6", "Troquelado en ciclo continuo"],
                ["09:00 a 10:00", "60", "91,4", "130,4", "Troquelado; pausa activa de 09:30 a 09:45 fuera de la nave"],
                ["10:00 a 11:00", "60", "93,5", "131,7", "Troquelado y verificación de piezas"],
                ["11:00 a 12:00", "60", "93,0", "130,9", "Troquelado y abastecimiento de fleje"],
                ["12:00 a 13:00", "60", "86,2", "128,3", "Almuerzo de 12:00 a 12:30 en el comedor; verificación de piezas"],
                ["13:00 a 13:55", "55", "89,4", "127,5", "Retiro de retal, limpieza y entrega de turno"]
              ],
              nota: ""
            } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Nivel equivalente por intervalo · dosimetría personal del 22/08/2023",
                unidad: "dB(A)",
                forma: "barras",
                puntos: [["06:05", 91.6], ["07:00", 93.5], ["08:00", 93.8], ["09:00", 91.4], ["10:00", 93.5], ["11:00", 93.0], ["12:00", 86.2], ["13:00", 89.4]],
                limite: { valor: 85, etiqueta: "Valor límite permisible 85 dB(A) en 8 horas" }
              },
              pie: "LAeq,8h de la jornada: 92,0 dB(A). Todos los intervalos superan 85 dB(A), incluso el del almuerzo, por el tiempo que la trabajadora pasa dentro de la nave."
            } },
            { h: "Interpretación" },
            { lista: [
              "La exposición diaria de la operaria de prensa (92,0 dB(A) en 8 horas) supera el valor límite permisible y el nivel de acción. La exposición no es aceptable sin controles.",
              "El ruido tiene un componente impulsivo por el impacto del troquel: unos 9.400 golpes en la jornada, con picos máximos por intervalo de 127,5 a 132,6 dB(C), por debajo del límite de 140 dB(C). El ruido de impacto repetido sobre un ruido continuo alto es más lesivo para el oído que un ruido continuo del mismo nivel equivalente.",
              "Con tapones de inserción bien colocados, la exposición efectiva estimada sería de unos 81 dB(A). El registro de uso no permite confirmar que se usaran durante toda la jornada.",
              "El resultado representa el puesto, la tarea, la prensa SIM-PR-04 y el turno medidos, con producción normal."
            ] },
            { h: "Recomendaciones" },
            { lista: [
              "Encerrar o apantallar las prensas y aislar la expulsión de piezas con aire comprimido.",
              "Mientras los controles de ingeniería no bajen la exposición por debajo de 85 dB(A), protección auditiva seleccionada por su atenuación, con prueba de ajuste y registro de uso; doble protección (tapones y orejeras) para las operarias con pérdida auditiva ya documentada.",
              "Mantener a las operarias en el programa de vigilancia epidemiológica de conservación auditiva, con audiometría anual, según la guía de atención integral para hipoacusia neurosensorial inducida por ruido.",
              "Repetir la evaluación después de instalar los controles."
            ] },
            { h: "Marco normativo" },
            { lista: [
              "Resolución 1792 de 1990: valores límites permisibles para la exposición ocupacional al ruido.",
              "Resolución 8321 de 1983: protección y conservación de la audición.",
              "Resolución 2844 de 2007: guías de atención integral basadas en la evidencia, entre ellas la de hipoacusia neurosensorial inducida por ruido.",
              "Decreto 1072 de 2015, Libro 2, Parte 2, Título 4, Capítulo 6: identificación de peligros, mediciones ambientales y conservación de los documentos del sistema de gestión."
            ] },
            { firma: { nombre: "Ingrid Johanna Marulanda Soto", cargo: "Ingeniera, especialista en higiene ocupacional · Acústica Ocupacional Guayacán S.A.S.", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2017-5528", fecha: "01/09/2023" } },
            { nota: "Informe archivado por el SG-SST el 04/09/2023 en la carpeta del puesto de operaria de prensa mecánica, con el período y la tarea." }
          ] },
          { titulo: "Hoja 4 · Historial de mediciones de ruido en el puesto (2013 a 2025)", bloques: [
            { tabla: {
              cols: ["Fecha", "Tipo de medición", "Puesto o zona", "Resultado", "Responsable"],
              filas: [
                ["18/06/2013", "Sonometría por puesto", "Nave de estampado, prensa SIM-PR-03", "94,0 dB(A)", "Acústica Ocupacional Guayacán S.A.S."],
                ["20/09/2016", "Sonometría por puesto", "Nave de estampado, prensa SIM-PR-03", "93,2 dB(A)", "Acústica Ocupacional Guayacán S.A.S."],
                ["11/07/2019", "Dosimetría personal de tres operarias", "Nave de estampado, prensas SIM-PR-04 a SIM-PR-06", "92,6 dB(A) en 8 horas, promedio", "Acústica Ocupacional Guayacán S.A.S."],
                ["22/08/2023", "Dosimetría personal de la trabajadora", "Nave de estampado, prensa SIM-PR-04", "92,0 dB(A) en 8 horas", "Acústica Ocupacional Guayacán S.A.S."],
                ["12/06/2024", "Sonometría de verificación después de la barrera parcial", "Nave de estampado, prensa SIM-PR-04", "89,0 dB(A)", "Acústica Ocupacional Guayacán S.A.S."],
                ["20/01/2025", "Sonometría por puesto", "Almacén segregado, puesto de inventario", "64,0 dB(A)", "Acústica Ocupacional Guayacán S.A.S."]
              ],
              nota: "Las sonometrías de 2013 y 2016 son niveles equivalentes del puesto durante el ciclo de trabajo; las dosimetrías son niveles normalizados a 8 horas."
            } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Nivel de ruido en el puesto de la trabajadora por fecha de medición",
                unidad: "dB(A)",
                forma: "linea",
                puntos: [["Jun. 2013", 94.0], ["Sep. 2016", 93.2], ["Jul. 2019", 92.6], ["Ago. 2023", 92.0], ["Jun. 2024", 89.0], ["Ene. 2025", 64.0]],
                limite: { valor: 85, etiqueta: "Valor límite permisible 85 dB(A) en 8 horas" }
              },
              pie: "Entre 2013 y 2024 el puesto de prensa superó el valor límite en todas las mediciones, aun después de la barrera parcial. El último punto corresponde al almacén, después de la reubicación."
            } },
            { p: "Los registros originales se conservan en el archivo del sistema de gestión de seguridad y salud en el trabajo, conforme al artículo 2.2.4.6.13 del Decreto 1072 de 2015." },
            { firma: { nombre: "Wilson Arley Rendón Gallego", cargo: "Coordinador del SG-SST, Prensas Umbral del Otún S.A.S.", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2015-3381", fecha: "26/05/2026" } }
          ] }
        ]
      }
    },

    /* ---------------------------------------------------------------- Extracto audiológico */
    AUD: {
      v1: {
        tipo: "historia",
        titulo: "Extracto de historia clínica audiológica y valoración funcional de cierre",
        emisor: { n: "IPS Audiológica Cauce Claro", area: "Otorrinolaringología y audiología ocupacional", ciudad: "Pereira", id: "NIT SIM-901.318.640-2" },
        numero: "SIM-AUD-EX-2025-0912",
        fecha: "12/09/2025",
        version: "v1",
        estadoNota: "Extracto firmado por otorrinolaringología y audiología, con la valoración funcional de cierre y las pruebas anexas autenticadas por la IPS como copia fiel de la historia clínica.",
        paginas: [
          { titulo: "Extracto", bloques: [
            { kv: [
              ["Paciente", "Elena Marín Cuéllar"],
              ["Documento", "C.C. SIM-42.118.637"],
              ["Historia clínica", "SIM-OTO-2021-03318"],
              ["Fecha de nacimiento", "12/02/1971 · 54 años"],
              ["Sexo", "Femenino"],
              ["EPS", "EPS SURA · SIM-EPS-1996-207714"],
              ["ARL", "ARL SURA · SIM-ARL-2012-48113"],
              ["Ocupación", "Operaria de prensa mecánica hasta el 31/12/2024; auxiliar de inventario de repuestos desde el 01/01/2025, por reubicación"],
              ["Empleador", "Prensas Umbral del Otún S.A.S. · NIT SIM-900.587.214-9"],
              ["Atención en la IPS", "Audiometrías del programa de vigilancia del empleador desde el 27/08/2012; historia clínica abierta en el control periódico del 11/11/2021"],
              ["Solicitado por", "ARL SURA, Medicina laboral, para la calificación de la pérdida de capacidad laboral. Autorización de la paciente del 04/09/2025"]
            ] },
            { h: "Motivo de consulta y evolución" },
            { p: "Mujer de 54 años que trabajó casi 29 años en oficios metalmecánicos con ruido, los últimos 12 años y 4 meses como operaria de prensa mecánica en una nave de estampado. En el control periódico ocupacional del 11/11/2021 refirió tinnitus bilateral de predominio nocturno y dificultad para seguir las instrucciones del supervisor en la nave; la audiometría mostró descenso bilateral de los umbrales con máximo en 4.000 Hz y se remitió a su EPS." },
            { p: "El 05/03/2024 otorrinolaringología confirmó hipoacusia neurosensorial bilateral, simétrica, inducida por ruido, con compromiso de frecuencias conversacionales, timpanometría normal y otoemisiones ausentes, y ordenó audífonos. Se adaptaron audífonos binaurales el 22/04/2024, con ajustes el 15/07/2024 y el 28/10/2024. El 18/11/2024 medicina del trabajo recomendó el retiro definitivo de la exposición a ruido; la empresa la reubicó en el almacén desde el 01/01/2025." },
            { p: "Entre el 15/01/2025 y el 26/03/2025 cumplió ocho sesiones de entrenamiento auditivo. Las tres audiometrías del protocolo de cierre (29/08/2025, 05/09/2025 y 12/09/2025) son concordantes entre sí e iguales, dentro de 5 dB, a la de marzo de 2024. En la valoración funcional de cierre del 12/09/2025, con los audífonos, persisten dificultades para seguir conversaciones, reconocer alarmas y orientarse por los sonidos." },
            { h: "Antecedentes" },
            { kv: [
              ["Ocupacionales", "Desmoldeo y acabado de fundición con herramientas neumáticas (1996 a 2003); pulido y esmerilado de piezas (2004 a julio de 2012); operaria de prensa mecánica (septiembre de 2012 a 2024)"],
              ["Patológicos", "Niega otitis crónica, trauma craneal, enfermedades metabólicas y autoinmunes. Glucemia, perfil lipídico y función tiroidea normales (05/03/2024)"],
              ["Farmacológicos", "Niega uso de aminoglucósidos, quimioterapia, diuréticos de asa o dosis altas de ácido acetilsalicílico"],
              ["Tóxicos", "No fuma"],
              ["Extralaborales", "Sin actividades recreativas ruidosas ni uso de armas de fuego"],
              ["Familiares", "Sin hipoacusia hereditaria conocida"],
              ["Incapacidades", "No registra incapacidades temporales por este diagnóstico"]
            ] },
            { h: "Diagnósticos" },
            { tabla: {
              cols: ["CIE-10", "Diagnóstico", "Tipo", "Estado"],
              filas: [
                ["H83.3", "Pérdida auditiva neurosensorial bilateral inducida por ruido (efectos del ruido sobre el oído interno)", "Principal", "Estable desde el retiro de la exposición"],
                ["H90.3", "Hipoacusia neurosensorial bilateral", "Relacionado", "Grado moderadamente severo en el promedio conversacional"],
                ["H93.1", "Tinnitus", "Relacionado", "Subjetivo y persistente; grado severo en el índice de discapacidad"],
                ["Z97.4", "Usuaria de audífonos externos", "Condición", "Adaptación binaural desde el 22/04/2024"]
              ],
              nota: ""
            } },
            { h: "Audiometrías seriadas" },
            { tabla: {
              cols: ["Fecha", "Contexto", "Promedio 500 a 3.000 Hz, oído derecho (dB)", "Promedio 500 a 3.000 Hz, oído izquierdo (dB)", "4.000 Hz, derecho / izquierdo (dB)"],
              filas: [
                ["27/08/2012", "Examen de ingreso", "20,0", "23,8", "40 / 45"],
                ["14/10/2015", "Control periódico", "30,0", "33,8", "55 / 60"],
                ["09/10/2018", "Control periódico", "41,3", "46,3", "70 / 75"],
                ["11/11/2021", "Control periódico; refiere tinnitus", "52,5", "57,5", "80 / 85"],
                ["07/11/2023", "Control periódico", "57,5", "62,5", "85 / 90"],
                ["05/03/2024", "Otorrinolaringología, diagnóstico", "62,5", "67,5", "85 / 90"],
                ["29/08/2025", "Protocolo de cierre, primera audiometría", "63,8", "68,8", "85 / 90"],
                ["05/09/2025", "Protocolo de cierre, segunda audiometría", "61,3", "66,3", "85 / 90"],
                ["12/09/2025", "Protocolo de cierre, tercera audiometría", "62,5", "67,5", "85 / 90"]
              ],
              nota: "Detalle por frecuencia en los anexos 1 y 3."
            } },
            { h: "Concepto de cierre" },
            { p: "Pérdida auditiva neurosensorial bilateral inducida por ruido, simétrica, de grado moderadamente severo en las frecuencias conversacionales y severo en las agudas, con tinnitus persistente. La pérdida progresó durante la exposición en la nave de estampado y no ha cambiado desde marzo de 2024, con doble protección auditiva desde abril de 2024 y fuera de la nave desde el 01/01/2025. El compromiso de 500 y 1.000 Hz es mayor que el habitual en la pérdida inducida por ruido; se explica por la exposición prolongada, con componente impulsivo y con protección de uso no verificado hasta 2024, y no se encontró otra causa. Terminadas la adaptación de audífonos y el entrenamiento auditivo, se alcanzó la mejoría máxima esperable." },
            { h: "Limitaciones residuales, con audífonos" },
            { lista: [
              "Seguir conversaciones en grupo o con ruido de fondo.",
              "Reconocer alarmas, timbres y señales sonoras, sobre todo las de frecuencias agudas.",
              "Orientarse por el sonido y localizar de dónde viene una voz o un vehículo.",
              "Comunicarse por teléfono y atender avisos por altavoz.",
              "Conciliar el sueño y sostener la atención por el tinnitus."
            ] },
            { h: "Recomendaciones" },
            { lista: [
              "Uso permanente de los audífonos y control audiológico anual.",
              "No exponerse a ruido de 80 dB(A) o más, en el trabajo ni fuera de él.",
              "Avisos visuales o vibratorios en lugar de alarmas sonoras, en el trabajo y en la vivienda (timbre, alarma de humo).",
              "Instrucciones críticas, citaciones y decisiones por escrito.",
              "Continuar las estrategias de manejo del tinnitus aprendidas en el entrenamiento."
            ] },
            { firma: { nombre: "Mauricio Alberto Londoño Isaza", cargo: "Otorrinolaringólogo", registro: "Registro médico SIM-66-152309", fecha: "12/09/2025" } },
            { firma: { nombre: "Lina Marcela Arango Bedoya", cargo: "Fonoaudióloga, especialista en audiología", registro: "Tarjeta profesional SIM-FON-3317", fecha: "12/09/2025" } },
            { nota: "Extracto expedido con autorización de la paciente y solo para la finalidad indicada (Resolución 1995 de 1999, art. 14). Las pruebas anexas son copia fiel de los registros de la historia clínica SIM-OTO-2021-03318, que permanece bajo custodia de la IPS." }
          ] },
          { titulo: "Anexo 1 · Audiometrías tonales del protocolo de cierre (29/08, 05/09 y 12/09/2025)", bloques: [
            { kv: [
              ["Equipo", "Audiómetro clínico de dos canales, serie SIM-AU-2210, calibrado según la norma ISO 389 el 03/03/2025"],
              ["Transductores", "Auriculares supraaurales y vibrador óseo"],
              ["Lugar", "Cabina sonoamortiguada con ruido de fondo verificado; la misma cabina y el mismo audiómetro en las tres pruebas"],
              ["Condiciones", "Tres audiometrías con una semana de intervalo; sin exposición a ruido laboral desde el 01/01/2025 y reposo auditivo de más de 12 horas antes de cada prueba; sin audífonos durante la prueba"],
              ["Enmascaramiento", "Ruido de banda estrecha en la vía ósea"],
              ["Confiabilidad", "Buena; diferencia de 5 dB o menos entre las tres pruebas en cada frecuencia"]
            ] },
            { h: "Umbrales de vía aérea de 500 a 3.000 Hz en las tres audiometrías (dB)" },
            { tabla: {
              cols: ["Fecha", "Oído", "500", "1.000", "2.000", "3.000", "Suma", "Promedio"],
              filas: [
                ["29/08/2025", "Derecho", "40", "55", "80", "80", "255", "63,8"],
                ["29/08/2025", "Izquierdo", "50", "60", "80", "85", "275", "68,8"],
                ["05/09/2025", "Derecho", "40", "50", "75", "80", "245", "61,3"],
                ["05/09/2025", "Izquierdo", "45", "55", "80", "85", "265", "66,3"],
                ["12/09/2025", "Derecho", "40", "55", "75", "80", "250", "62,5"],
                ["12/09/2025", "Izquierdo", "45", "60", "80", "85", "270", "67,5"],
                ["Promedio de las tres", "Derecho", "", "", "", "", "250", "62,5"],
                ["Promedio de las tres", "Izquierdo", "", "", "", "", "270", "67,5"]
              ],
              nota: "Frecuencias en hercios. Detalle completo de las dos primeras audiometrías en el anexo 3."
            } },
            { h: "Audiometría del 12/09/2025 · vía aérea (dB)" },
            { tabla: {
              cols: ["Oído", "250", "500", "1.000", "2.000", "3.000", "4.000", "6.000", "8.000"],
              filas: [
                ["Derecho", "30", "40", "55", "75", "80", "85", "75", "65"],
                ["Izquierdo", "35", "45", "60", "80", "85", "90", "80", "70"]
              ],
              nota: "Frecuencias en hercios; umbrales en decibeles de nivel de audición."
            } },
            { h: "Vía ósea con enmascaramiento (dB)" },
            { tabla: {
              cols: ["Oído", "500", "1.000", "2.000", "3.000", "4.000"],
              filas: [
                ["Derecho", "35", "50", "70", "Sin respuesta a 70", "Sin respuesta a 70"],
                ["Izquierdo", "40", "55", "Sin respuesta a 70", "Sin respuesta a 70", "Sin respuesta a 70"]
              ],
              nota: "70 dB es la salida máxima del vibrador óseo en esas frecuencias."
            } },
            { figura: {
              tipo: "audiograma",
              datos: {
                od: { 250: 30, 500: 40, 1000: 55, 2000: 75, 3000: 80, 4000: 85, 6000: 75, 8000: 65 },
                oi: { 250: 35, 500: 45, 1000: 60, 2000: 80, 3000: 85, 4000: 90, 6000: 80, 8000: 70 },
                via: "aérea"
              },
              pie: "Audiograma de vía aérea del 12/09/2025. Esquema sintético dibujado a partir de los umbrales registrados."
            } },
            { kv: [
              ["Promedio de 500, 1.000, 2.000 y 3.000 Hz", "Oído derecho 62,5 dB · oído izquierdo 67,5 dB"],
              ["Promedio de 500, 1.000 y 2.000 Hz", "Oído derecho 56,7 dB · oído izquierdo 61,7 dB"]
            ] },
            { p: "Interpretación: hipoacusia neurosensorial bilateral, simétrica (el oído izquierdo, del lado de la prensa, es 5 dB peor en cada frecuencia), de grado moderadamente severo en el promedio conversacional, con pendiente hacia los agudos, máximo en 4.000 Hz y recuperación de 20 dB en 8.000 Hz. Sin brecha aéreo-ósea mayor de 10 dB en las frecuencias medibles. Las tres audiometrías del protocolo son concordantes y no muestran cambios frente a la del 05/03/2024." },
            { firma: { nombre: "Lina Marcela Arango Bedoya", cargo: "Fonoaudióloga, especialista en audiología", registro: "Tarjeta profesional SIM-FON-3317", fecha: "12/09/2025" } }
          ] },
          { titulo: "Anexo 2 · Logoaudiometría, inmitancia y otoemisiones (12/09/2025)", bloques: [
            { h: "Logoaudiometría con auriculares, sin audífonos" },
            { tabla: {
              cols: ["Prueba", "Oído derecho", "Oído izquierdo", "Referencia"],
              filas: [
                ["Umbral de recepción del habla", "60 dB", "65 dB", "Concordante con el promedio tonal, con diferencia de 10 dB o menos"],
                ["Discriminación máxima con palabras bisílabas", "72 % a 95 dB", "64 % a 100 dB", "90 % o más"],
                ["Umbral de molestia para el habla", "100 dB", "100 dB", "Rango dinámico de 40 dB en el oído derecho y de 35 dB en el izquierdo"]
              ],
              nota: ""
            } },
            { h: "Reconocimiento del habla en campo libre, con audífonos" },
            { tabla: {
              cols: ["Condición", "Resultado", "Referencia"],
              filas: [
                ["Palabras en silencio a 65 dB", "80 %", "90 % o más"],
                ["Frases con ruido, relación señal/ruido de +5 dB", "44 %", "80 % o más"],
                ["Frases con ruido, relación señal/ruido de 0 dB", "28 %", "70 % o más"]
              ],
              nota: ""
            } },
            { h: "Inmitancia acústica y otoemisiones" },
            { tabla: {
              cols: ["Prueba", "Oído derecho", "Oído izquierdo"],
              filas: [
                ["Timpanometría", "Tipo A · presión −10 daPa · admitancia 0,6 mL", "Tipo A · presión −15 daPa · admitancia 0,7 mL"],
                ["Reflejo estapedial ipsilateral en 500 y 1.000 Hz", "100 y 100 dB", "105 y 105 dB"],
                ["Reflejo estapedial ipsilateral en 2.000 y 4.000 Hz", "Ausente", "Ausente"],
                ["Otoemisiones acústicas por productos de distorsión, 1.000 a 8.000 Hz", "Ausentes", "Ausentes"]
              ],
              nota: ""
            } },
            { p: "Interpretación: logoaudiometría concordante con los umbrales tonales, con discriminación disminuida. Oído medio normal en ambos lados. Reflejos estapediales a 45 dB del umbral tonal en 1.000 Hz, compatibles con reclutamiento coclear. Otoemisiones ausentes, por daño de las células ciliadas externas. Con los audífonos la comprensión en silencio es aceptable y cae con el ruido de fondo." },
            { firma: { nombre: "Lina Marcela Arango Bedoya", cargo: "Fonoaudióloga, especialista en audiología", registro: "Tarjeta profesional SIM-FON-3317", fecha: "12/09/2025" } }
          ] },
          { titulo: "Anexo 3 · Audiometrías de vigilancia y seguimiento (2012 a 2025)", bloques: [
            { h: "Oído derecho, vía aérea (dB)" },
            { tabla: {
              cols: ["Fecha", "Contexto", "250", "500", "1.000", "2.000", "3.000", "4.000", "6.000", "8.000"],
              filas: [
                ["27/08/2012", "Ingreso", "15", "15", "15", "20", "30", "40", "35", "25"],
                ["14/10/2015", "Control periódico", "15", "20", "20", "35", "45", "55", "45", "35"],
                ["09/10/2018", "Control periódico", "20", "25", "30", "50", "60", "70", "60", "45"],
                ["11/11/2021", "Control periódico", "25", "30", "45", "65", "70", "80", "70", "55"],
                ["07/11/2023", "Control periódico", "30", "35", "50", "70", "75", "85", "75", "60"],
                ["05/03/2024", "Otorrinolaringología", "30", "40", "55", "75", "80", "85", "75", "65"],
                ["29/08/2025", "Cierre, primera", "30", "40", "55", "80", "80", "85", "75", "65"],
                ["05/09/2025", "Cierre, segunda", "30", "40", "50", "75", "80", "85", "75", "65"],
                ["12/09/2025", "Cierre, tercera", "30", "40", "55", "75", "80", "85", "75", "65"]
              ],
              nota: ""
            } },
            { h: "Oído izquierdo, vía aérea (dB)" },
            { tabla: {
              cols: ["Fecha", "Contexto", "250", "500", "1.000", "2.000", "3.000", "4.000", "6.000", "8.000"],
              filas: [
                ["27/08/2012", "Ingreso", "15", "15", "20", "25", "35", "45", "40", "30"],
                ["14/10/2015", "Control periódico", "20", "20", "25", "40", "50", "60", "50", "40"],
                ["09/10/2018", "Control periódico", "25", "30", "35", "55", "65", "75", "65", "50"],
                ["11/11/2021", "Control periódico", "30", "35", "50", "70", "75", "85", "75", "60"],
                ["07/11/2023", "Control periódico", "35", "40", "55", "75", "80", "90", "80", "65"],
                ["05/03/2024", "Otorrinolaringología", "35", "45", "60", "80", "85", "90", "80", "70"],
                ["29/08/2025", "Cierre, primera", "35", "50", "60", "80", "85", "90", "80", "70"],
                ["05/09/2025", "Cierre, segunda", "35", "45", "55", "80", "85", "90", "80", "70"],
                ["12/09/2025", "Cierre, tercera", "35", "45", "60", "80", "85", "90", "80", "70"]
              ],
              nota: "Audiometrías de 2012 a 2023 hechas para el programa de vigilancia del empleador, en cabina y con 14 horas de reposo auditivo; las de 2024 y 2025, en la consulta clínica, en cabina y con reposo auditivo."
            } },
            { figura: {
              tipo: "audiograma",
              datos: {
                od: { 250: 15, 500: 15, 1000: 15, 2000: 20, 3000: 30, 4000: 40, 6000: 35, 8000: 25 },
                oi: { 250: 15, 500: 15, 1000: 20, 2000: 25, 3000: 35, 4000: 45, 6000: 40, 8000: 30 },
                via: "aérea"
              },
              pie: "Audiometría de ingreso del 27/08/2012: muesca leve en 4.000 Hz en ambos oídos, con frecuencias conversacionales normales. Esquema sintético."
            } },
            { figura: {
              tipo: "audiograma",
              datos: {
                od: { 250: 25, 500: 30, 1000: 45, 2000: 65, 3000: 70, 4000: 80, 6000: 70, 8000: 55 },
                oi: { 250: 30, 500: 35, 1000: 50, 2000: 70, 3000: 75, 4000: 85, 6000: 75, 8000: 60 },
                via: "aérea"
              },
              pie: "Audiometría del control periódico del 11/11/2021: la muesca de 4.000 Hz se profundiza y se extiende a las frecuencias conversacionales. Esquema sintético."
            } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Promedio de umbrales de 500 a 3.000 Hz, media de ambos oídos",
                unidad: "dB",
                forma: "linea",
                puntos: [["2012", 21.9], ["2015", 31.9], ["2018", 43.8], ["2021", 55.0], ["2023", 60.0], ["Mar. 2024", 65.0], ["Sep. 2025", 65.0]],
                limite: { valor: 25, etiqueta: "Límite de la audición normal: 25 dB" }
              },
              pie: "La pérdida progresa mientras dura la exposición en la nave de estampado y no cambia después de la reubicación del 01/01/2025."
            } },
            { firma: { nombre: "Lina Marcela Arango Bedoya", cargo: "Fonoaudióloga, especialista en audiología", registro: "Tarjeta profesional SIM-FON-3317", fecha: "12/09/2025" } }
          ] },
          { titulo: "Anexo 4 · Consultas de otorrinolaringología, audiología y medicina del trabajo", bloques: [
            { tabla: {
              cols: ["Fecha", "Servicio", "Hallazgos y conducta"],
              filas: [
                ["27/08/2012", "Audiología, examen de ingreso", "Muesca leve bilateral en 4.000 Hz (40 y 45 dB) con frecuencias conversacionales normales. Apta, con protección auditiva y control periódico."],
                ["09/10/2018", "Audiología, control periódico", "Progresión bilateral: promedio de 41,3 dB en el oído derecho y de 46,3 dB en el izquierdo. Caso sospechoso en el programa de conservación auditiva; refuerzo del uso de tapones."],
                ["11/11/2021", "Medicina del trabajo y audiología, control periódico", "Tinnitus bilateral de predominio nocturno y dificultad para seguir las instrucciones del supervisor en la nave. Máximo en 4.000 Hz (80 y 85 dB). Remisión a la EPS para otorrinolaringología; recomienda doble protección auditiva."],
                ["07/11/2023", "Audiología, control periódico", "Progresión en las frecuencias conversacionales. Se reitera la remisión a otorrinolaringología."],
                ["05/03/2024", "Otorrinolaringología", "Otoscopia normal. Audiometría, logoaudiometría, inmitancia y otoemisiones. Glucemia, perfil lipídico y función tiroidea normales. Diagnóstico: pérdida auditiva neurosensorial bilateral inducida por ruido (H83.3) con tinnitus subjetivo persistente (H93.1). Ordena audífonos binaurales y reporta el caso a la EPS como posible enfermedad laboral."],
                ["22/04/2024", "Audiología, adaptación de audífonos", "Adaptación binaural (anexo 5)."],
                ["15/07/2024", "Audiología, control", "Usa los audífonos 10 horas al día; en la nave se los retira para usar la doble protección. Ajuste de la reducción de ruido."],
                ["28/10/2024", "Audiología, control", "Ajuste de la ganancia en 2.000 y 3.000 Hz y programa para conversación en grupo. Ordena entrenamiento auditivo."],
                ["18/11/2024", "Medicina del trabajo", "Recomendaciones médico-laborales: retiro definitivo de la exposición a ruido de 80 dB(A) o más; avisos visuales o vibratorios; instrucciones críticas por escrito. Copia al empleador."],
                ["15/01/2025 a 26/03/2025", "Audiología, entrenamiento auditivo", "Ocho sesiones (anexo 6)."],
                ["29/08/2025 y 05/09/2025", "Audiología, protocolo de cierre", "Primera y segunda audiometrías tonales, con reposo auditivo (anexo 1)."],
                ["12/09/2025", "Otorrinolaringología y audiología, cierre", "Tercera audiometría (anexo 1), logoaudiometría, inmitancia y otoemisiones (anexo 2) y valoración funcional de cierre (anexo 7). Umbrales estables. Cierre de la rehabilitación con limitaciones residuales."]
              ],
              nota: "Transcripción de los registros de la historia clínica SIM-OTO-2021-03318 y de las audiometrías del programa de vigilancia."
            } },
            { firma: { nombre: "Mauricio Alberto Londoño Isaza", cargo: "Otorrinolaringólogo", registro: "Registro médico SIM-66-152309", fecha: "12/09/2025" } }
          ] },
          { titulo: "Anexo 5 · Adaptación de audífonos (2024)", bloques: [
            { kv: [
              ["Fecha de adaptación", "22/04/2024"],
              ["Audífonos", "Retroauriculares con receptor en el conducto, digitales, de 16 canales, con micrófonos direccionales, reducción de ruido y bobina telefónica"],
              ["Adaptación", "Binaural, con domos cerrados"],
              ["Prescripción", "Método NAL-NL2, verificado con medición en oído real"],
              ["Programas", "General, conversación en ruido y teléfono"],
              ["Ajustes", "15/07/2024 y 28/10/2024"],
              ["Uso registrado por los audífonos", "10 a 12 horas al día"]
            ] },
            { h: "Ganancia funcional en campo libre" },
            { tabla: {
              cols: ["Frecuencia (Hz)", "Sin audífonos (dB)", "Con audífonos (dB)", "Ganancia funcional (dB)"],
              filas: [
                ["500", "40", "25", "15"],
                ["1.000", "55", "35", "20"],
                ["2.000", "75", "50", "25"],
                ["3.000", "80", "55", "25"],
                ["4.000", "85", "65", "20"]
              ],
              nota: "Umbrales binaurales en campo libre con tonos modulados."
            } },
            { p: "Con los audífonos, los sonidos del habla a intensidad de conversación quedan audibles en 500 y 1.000 Hz y solo en parte en 2.000 Hz; los componentes de 3.000 y 4.000 Hz siguen por debajo del umbral. La comprensión con ruido de fondo no mejora en la misma proporción que la audibilidad." },
            { firma: { nombre: "Lina Marcela Arango Bedoya", cargo: "Fonoaudióloga, especialista en audiología", registro: "Tarjeta profesional SIM-FON-3317", fecha: "28/10/2024" } }
          ] },
          { titulo: "Anexo 6 · Entrenamiento auditivo (enero a marzo de 2025)", bloques: [
            { kv: [
              ["Orden", "Audiología, 28/10/2024"],
              ["Programa", "Ocho sesiones individuales de 45 minutos, con audífonos"],
              ["Objetivos", "Discriminación de palabras y frases con ruido, apoyo en la lectura labiofacial, estrategias de comunicación, manejo del tinnitus y uso de avisos visuales en el nuevo puesto"]
            ] },
            { tabla: {
              cols: ["Sesión", "Fecha", "Contenido"],
              filas: [
                ["1", "15/01/2025", "Evaluación inicial; orientación sobre el tinnitus y la higiene del sueño"],
                ["2", "29/01/2025", "Discriminación de palabras en silencio; lectura labiofacial"],
                ["3", "05/02/2025", "Discriminación de frases con ruido de fondo"],
                ["4", "19/02/2025", "Estrategias de comunicación: pedir que le hablen de frente, repetir y confirmar por escrito"],
                ["5", "26/02/2025", "Conversación con dos interlocutores; uso del programa de ruido"],
                ["6", "05/03/2025", "Uso del teléfono con bobina telefónica y mensajes escritos"],
                ["7", "19/03/2025", "Reconocimiento de alarmas y avisos del almacén; ajuste de avisos visuales con el SG-SST"],
                ["8", "26/03/2025", "Evaluación final y plan de mantenimiento en casa"]
              ],
              nota: "Asistencia completa."
            } },
            { h: "Mediciones" },
            { tabla: {
              cols: ["Prueba", "Inicio (15/01/2025)", "Final (26/03/2025)", "Cierre (12/09/2025)"],
              filas: [
                ["Frases con ruido, relación señal/ruido de +5 dB, con audífonos", "36 %", "44 %", "44 %"],
                ["Palabras en silencio a 65 dB, con audífonos", "76 %", "80 %", "80 %"],
                ["Índice de discapacidad por tinnitus (puntos)", "70", "62", "62"],
                ["Cuestionario de discapacidad auditiva para adultos (puntos)", "78", "72", "72"]
              ],
              nota: ""
            } },
            { figura: {
              tipo: "serie",
              datos: {
                titulo: "Reconocimiento de frases con ruido (+5 dB), con audífonos",
                unidad: "%",
                forma: "linea",
                puntos: [["15/01/2025", 36], ["05/02/2025", 38], ["26/02/2025", 40], ["19/03/2025", 42], ["26/03/2025", 44], ["12/09/2025", 44]],
                limite: { valor: 80, etiqueta: "Referencia de audición normal: 80 %" }
              },
              pie: "Mejoría de 8 puntos con el entrenamiento y meseta al cierre, lejos de la referencia."
            } },
            { p: "Conclusión: mejoría modesta de la comprensión con ruido y de la molestia por el tinnitus. Usa las estrategias de comunicación, pero sigue dependiendo de la lectura labiofacial y de los avisos visuales." },
            { firma: { nombre: "Yessica Paola Duque Montoya", cargo: "Fonoaudióloga, rehabilitación auditiva", registro: "Tarjeta profesional SIM-FON-4120", fecha: "26/03/2025" } }
          ] },
          { titulo: "Anexo 7 · Valoración funcional de cierre (12/09/2025)", bloques: [
            { kv: [
              ["Motivo", "Cierre de la rehabilitación auditiva y valoración de las limitaciones residuales"],
              ["Condición de la prueba", "Con audífonos, en el programa general"],
              ["Puesto actual", "Auxiliar de inventario de repuestos, almacén segregado, desde el 01/01/2025"]
            ] },
            { h: "Pruebas funcionales" },
            { tabla: {
              cols: ["Prueba", "Resultado", "Referencia"],
              filas: [
                ["Seguimiento de una conversación de cuatro personas en sala sin ruido", "Comprende una de cada tres intervenciones; pide repetir con frecuencia", "Comprensión completa"],
                ["Reconocimiento de 10 alarmas y señales sonoras grabadas, con ruido de fondo de 70 dB(A)", "Identifica 4 de 10; no reconoce la alarma de reversa de montacargas ni el timbre", "10 de 10"],
                ["Localización de la fuente sonora en 12 posiciones del plano horizontal", "Acierta en 5 de 12", "12 de 12"],
                ["Uso del teléfono", "Solo con el programa de teléfono y en silencio; prefiere los mensajes escritos", "Sin dificultad"],
                ["Índice de discapacidad por tinnitus", "62 de 100 · grado severo", "16 o menos"],
                ["Cuestionario de discapacidad auditiva para adultos", "72 de 100 · discapacidad severa", "16 o menos"]
              ],
              nota: ""
            } },
            { h: "Barreras de comunicación identificadas" },
            { lista: [
              "Conversaciones en grupo y con ruido de fondo, en el trabajo y en la familia.",
              "Personas que le hablan de lado, de espaldas o a distancia.",
              "Avisos por altavoz, llamados a distancia y alarmas sonoras.",
              "Llamadas telefónicas, en especial con números desconocidos o con mala señal.",
              "Atención en ventanillas con vidrio o con ruido ambiental."
            ] },
            { h: "Situación en el puesto reubicado" },
            { p: "En el almacén registra entradas con lector de códigos y recibe los pedidos en pantalla. Una baliza luminosa avisa el paso de montacargas. Los llamados por altavoz y la alarma de evacuación le llegan porque un compañero le avisa; el SG-SST tiene en trámite una alarma luminosa para el almacén." },
            { h: "Concepto" },
            { p: "Pérdida auditiva neurosensorial bilateral inducida por ruido, estable, con tinnitus persistente. Terminada la rehabilitación, persisten, aun con audífonos, limitaciones para comunicarse en grupo, atender señales sonoras y orientarse por el sonido. Se considera alcanzada la mejoría máxima esperable y se cierra la rehabilitación en esta fecha." },
            { firma: { nombre: "Mauricio Alberto Londoño Isaza", cargo: "Otorrinolaringólogo", registro: "Registro médico SIM-66-152309", fecha: "12/09/2025" } },
            { firma: { nombre: "Lina Marcela Arango Bedoya", cargo: "Fonoaudióloga, especialista en audiología", registro: "Tarjeta profesional SIM-FON-3317", fecha: "12/09/2025" } }
          ] }
        ]
      }
    }
  }
};
