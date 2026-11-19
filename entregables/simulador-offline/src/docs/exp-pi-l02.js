/* ============ Documentos sintéticos · perforista con reducción de la PCL en apelación ============
   Expediente de Javier Pardo Navas: solicitud, dictamen regional apelado, dictamen nacional que resuelve la
   apelación y su constancia de firmeza, certificado de afiliación, informe de función pulmonar (la exportación
   incompleta y el informe firmado con sus anexos) e informe de higiene con la medición de sílice.
   Todo es sintético: personas, números, profesionales y entidades no corresponden a documentos reales.
   Aritmética de las calificaciones (Decreto 1507 de 2014: deficiencia ponderada al 50 % + Título II):
     ARL SURA, 02/09/2025 ........ 24,00 % → 12,00 + 23,50 + 5,30  = 40,80 %
     Junta Regional, REG-L02 ..... 32,00 % → 16,00 + 23,50 + 11,90 = 51,40 %
     Junta Nacional, DIC-L02 ..... 28,00 % → 14,00 + 23,50 + 6,80  = 44,30 % */
DOCS.exp["PI-L02"] = {
  identidad: {
    documento: "C.C. SIM-88.214.507",
    historia: "Historia clínica SIM-NEU-2024-01873",
    afiliacionArl: "SIM-ARL-2018-30417",
    empleador: "Agregados Ladera Bruma S.A.S. · NIT SIM-901.188.462-7",
    ips: "IPS Laboratorio Pulmonar Vientoalto · NIT SIM-900.731.226-4",
    juntaRegional: "NIT SIM-807.006.214-3",
    juntaNacional: "NIT SIM-830.512.447-0",
    arl: "ARL SURA · NIT SIM-860.555.214-1",
    expedienteRegional: "SIM-JRNS-2025-1487",
    expedienteNacional: "SIM-JNCI-2025-09316",
    calificacionArl: "SIM-ARL-CPO-2025-11853",
    informeFuncional: "SIM-LFP-2025-0709-031",
    informeHigiene: "SIM-HI-2023-017",
    incapacidad: "SIM-INC-2024-71542",
    certificadoAfiliacion: "SIM-ARL-CA-2026-08812"
  },
  soportes: {

    /* ---------- Solicitud e identidad ---------- */
    SOL: {
      v1: {
        tipo: "solicitud",
        titulo: "Solicitud de reconocimiento de pensión de invalidez de origen laboral",
        emisor: { n: "Javier Pardo Navas", area: "Solicitante · dirigida a ARL SURA, Prestaciones económicas", ciudad: "Cúcuta", id: "C.C. SIM-88.214.507" },
        numero: "RAD-L02",
        fecha: "24/04/2026",
        version: "v1",
        estadoNota: "Ejemplar radicado, con la constancia de la ventanilla de ARL SURA en Cúcuta.",
        paginas: [
          { titulo: "Solicitud", bloques: [
            { kv: [
              ["Radicado", "RAD-L02"],
              ["Fecha de radicación", "24/04/2026"],
              ["Oficina", "ARL SURA · atención presencial, Cúcuta"],
              ["Destinatario", "ARL SURA · Prestaciones económicas"],
              ["Prestación que solicita", "Pensión de invalidez de origen laboral"]
            ] },
            { h: "Datos del solicitante" },
            { kv: [
              ["Nombre", "Javier Pardo Navas"],
              ["Documento de identidad", "C.C. SIM-88.214.507 de Cúcuta"],
              ["Fecha de nacimiento", "23/01/1970 (56 años)"],
              ["Sexo", "Masculino"],
              ["Ciudad de residencia", "Cúcuta, Norte de Santander"],
              ["Escolaridad", "Secundaria. Formación interna como perforista"],
              ["Empleador actual", "Agregados Ladera Bruma S.A.S. · NIT SIM-901.188.462-7"],
              ["Cargo actual", "Auxiliar de control de accesos, en reubicación desde el 01/07/2025"],
              ["Afiliación a riesgos laborales", "ARL SURA · afiliación SIM-ARL-2018-30417"],
              ["Datos de contacto", "Registrados en el formulario de la ventanilla; no se reproducen en esta copia"]
            ] },
            { h: "Hechos" },
            { lista: [
              "Trabajé más de 28 años en minería de carbón y en perforación y trituración de piedra: 11 años en Minería Socavón de Bruma (Sardinata), 10 años en Cantera Delta de Arcilla (El Zulia) y, desde el 01/03/2018, en Agregados Ladera Bruma S.A.S. (El Zulia).",
              "Desde febrero de 2024 me falta el aire al subir pendientes y escaleras. En julio de 2024 neumología me diagnosticó neumoconiosis por polvo con sílice y ordenó retirarme de la exposición al polvo.",
              "Desde el 01/07/2025 trabajo en la portería del predio, separada de la planta de trituración.",
              "ARL SURA me calificó el 02/09/2025 con 40,80 % de pérdida de capacidad laboral de origen laboral. No estuve de acuerdo y presenté inconformidad el 05/09/2025.",
              "La Junta Regional de Calificación de Invalidez de Norte de Santander me calificó el 19/11/2025 con 51,40 % de origen laboral. Anexo la copia auténtica de ese dictamen.",
              "Supe que ARL SURA apeló el dictamen de la Junta Regional y que el caso pasó a la Junta Nacional. He recibido documentos de varias entidades y no tengo claro cuál dictamen es el que rige.",
              "Anexo la impresión de la espirometría que me entregó el laboratorio en julio de 2025."
            ] },
            { h: "Peticiones" },
            { lista: [
              "Que se estudie y se reconozca la pensión de invalidez de origen laboral a que tenga derecho, conforme a la Ley 776 de 2002.",
              "Que se me informe por escrito cuál dictamen de calificación se tiene en cuenta para resolver esta solicitud y, si falta algún documento, quién debe aportarlo."
            ] },
            { h: "Documentos que anexo" },
            { tabla: { cols: ["N.º", "Documento", "Folios"], filas: [
              ["1", "Copia del documento de identidad", "1"],
              ["2", "Copia auténtica del dictamen REG-L02 de la Junta Regional, del 19/11/2025, con constancia del estado del trámite", "6"],
              ["3", "Impresión de la espirometría del 09/07/2025 entregada por el laboratorio", "2"]
            ], nota: "Folios contados por la ventanilla al recibir." } },
            { p: "Declaro que la información de esta solicitud es cierta. Autorizo a ARL SURA a consultar y a pedir a otras entidades los dictámenes y los soportes clínicos necesarios para resolverla, solo con esa finalidad." },
            { firma: { nombre: "Javier Pardo Navas", cargo: "Solicitante · C.C. SIM-88.214.507", fecha: "24/04/2026" } }
          ] },
          { titulo: "Constancia de radicación", bloques: [
            { kv: [
              ["Entidad que recibe", "ARL SURA · atención presencial, Cúcuta"],
              ["Radicado", "RAD-L02"],
              ["Fecha y hora", "24/04/2026, 10:17"],
              ["Trámite", "Pensión de invalidez de origen laboral"],
              ["Solicitante", "Javier Pardo Navas · C.C. SIM-88.214.507"],
              ["Folios recibidos", "11 (solicitud, 2; anexos, 9)"]
            ] },
            { h: "Lista de verificación al recibir" },
            { tabla: { cols: ["Documento", "Estado al radicar", "Observación"], filas: [
              ["Solicitud firmada", "Recibida", "Mismo titular del documento de identidad"],
              ["Documento de identidad", "Recibido", "Copia simple"],
              ["Dictamen de calificación", "Recibida copia", "Dictamen REG-L02 de la Junta Regional; su constancia indica que fue apelado"],
              ["Dictamen que resolvió la apelación", "No aportado", "El solicitante informa que el caso pasó a la Junta Nacional"],
              ["Constancia de firmeza del dictamen", "No aportada", "Sin observación"],
              ["Soporte de función pulmonar", "Recibida impresión", "Impresión del equipo, sin firma de quien interpreta"]
            ], nota: "La verificación del dictamen vigente y de su firmeza corresponde a Prestaciones económicas. Esta lista no es una decisión sobre la solicitud." } },
            { p: "ARL SURA informará al solicitante el estado del trámite y dará respuesta de fondo dentro de los términos legales." },
            { firma: { nombre: "Julián Andrés Mora Pabón", cargo: "Auxiliar de atención y radicación · ARL SURA, Cúcuta", fecha: "24/04/2026" } }
          ] },
          { titulo: "Anexo 1 · Copia del documento de identidad", bloques: [
            { kv: [
              ["Documento", "Cédula de ciudadanía"],
              ["Número", "SIM-88.214.507"],
              ["Apellidos", "Pardo Navas"],
              ["Nombres", "Javier"],
              ["Fecha de nacimiento", "23/01/1970"],
              ["Lugar de nacimiento", "Cúcuta (Norte de Santander)"],
              ["Estatura", "1,68 m"],
              ["Grupo sanguíneo y factor", "O positivo"],
              ["Sexo", "M"],
              ["Fecha y lugar de expedición", "08/02/1988 · Cúcuta"]
            ] },
            { nota: "Copia simple aportada por el solicitante. Número sintético: no corresponde a una cédula real." }
          ] }
        ]
      }
    },

    /* ---------- Dictamen de la Junta Regional (copia auténtica, apelado) ---------- */
    REG: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de calificación de la pérdida de capacidad laboral y ocupacional · copia auténtica",
        emisor: { n: "Junta Regional de Calificación de Invalidez de Norte de Santander", area: "Sala de Decisión Uno", ciudad: "Cúcuta", id: "NIT SIM-807.006.214-3" },
        numero: "REG-L02",
        fecha: "19/11/2025",
        version: "v1",
        estadoNota: "Copia auténtica expedida el 05/12/2025, con constancia del estado del trámite: apelado por ARL SURA el 24/11/2025, sin firmeza.",
        paginas: [
          { titulo: "Dictamen · información general", bloques: [
            { kv: [
              ["Dictamen", "REG-L02"],
              ["Fecha del dictamen", "19/11/2025"],
              ["Expediente", "SIM-JRNS-2025-1487"],
              ["Tipo de calificación", "Pérdida de capacidad laboral y ocupacional, origen y fecha de estructuración"],
              ["Instancia", "Junta Regional · controversia de la calificación en primera oportunidad"],
              ["Motivo", "Inconformidad de la persona calificada, del 05/09/2025, contra el dictamen SIM-ARL-CPO-2025-11853 de ARL SURA, del 02/09/2025"],
              ["Entidad que remite", "ARL SURA · Medicina laboral"],
              ["Fecha de radicación en la Junta", "15/09/2025"],
              ["Valoración presencial", "28/10/2025, Cúcuta"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Javier Pardo Navas"],
              ["Identificación", "C.C. SIM-88.214.507"],
              ["Fecha de nacimiento", "23/01/1970"],
              ["Edad a la fecha del dictamen", "55 años"],
              ["Sexo", "Masculino"],
              ["Estado civil", "Casado; acude a las valoraciones con su esposa"],
              ["Escolaridad", "Secundaria. Formación interna como perforista"],
              ["Dominancia", "Diestro"],
              ["Ciudad de residencia", "Cúcuta, Norte de Santander"],
              ["Ocupación habitual", "Operador de trituración y cribado"],
              ["Ocupación actual", "Auxiliar de control de accesos, en reubicación desde el 01/07/2025"],
              ["Empleador", "Agregados Ladera Bruma S.A.S. · NIT SIM-901.188.462-7"],
              ["Administradora de riesgos laborales", "ARL SURA, desde el 01/03/2018"]
            ] },
            { h: "Antecedentes laborales" },
            { tabla: { cols: ["Periodo", "Empresa y centro de trabajo", "Cargo", "Exposición descrita"], filas: [
              ["01/01/1997 a 31/12/2000", "Minería Socavón de Bruma · Sardinata, frente subterráneo (CIIU 0510)", "Ayudante de frente", "Polvo de carbón y de roca, 3 h por turno de 8 h. Ventilación localizada; registro parcial de uso de respirador"],
              ["01/01/2001 a 31/12/2007", "Minería Socavón de Bruma · Sardinata, frente subterráneo (CIIU 0510)", "Perforista de frente", "Perforación de roca y despeje del frente, unas 4 h acumuladas por turno. Sin mediciones personales comparables"],
              ["01/01/2008 a 31/12/2017", "Cantera Delta de Arcilla · El Zulia, banco de extracción (CIIU 0811)", "Operador de perforación", "Perforación y apoyo a trituración, 3,5 a 4 h acumuladas. Humectación intermitente"],
              ["01/03/2018 a 30/06/2025", "Agregados Ladera Bruma S.A.S. · El Zulia, planta de trituración (CIIU 0811)", "Operador de trituración y cribado", "4 h por turno cerca del proceso. Muestra personal del 17/05/2023: sílice cristalina respirable 0,07 mg/m³ en 8 h. Supresión húmeda desde 2024"],
              ["01/07/2025 a la fecha", "Agregados Ladera Bruma S.A.S. · El Zulia, portería del predio (CIIU 0811)", "Auxiliar de control de accesos", "Portería separada de la trituración. Restricción de ingreso a frentes y zonas con polvo respirable"]
            ], nota: "Sin vínculo registrado en enero y febrero de 2018. Los empleadores anteriores aportan constancias de oficio, sin mediciones." } }
          ] },
          { titulo: "Fundamentos de hecho y pruebas", bloques: [
            { h: "Documentos y pruebas que obran en el expediente" },
            { lista: [
              "Dictamen SIM-ARL-CPO-2025-11853 de ARL SURA, del 02/09/2025: origen laboral, PCL 40,80 %, estructuración 30/05/2025.",
              "Escrito de inconformidad de la persona calificada, del 05/09/2025.",
              "Resumen de historia clínica de neumología de la IPS Laboratorio Pulmonar Vientoalto, del 05/02/2024 al 30/05/2025, remitido por ARL SURA.",
              "Tomografía de tórax de alta resolución del 19/07/2024.",
              "Prueba de ejercicio cardiopulmonar del 30/05/2025.",
              "Impresión de la espirometría del 09/07/2025: exportación del equipo, sin informe firmado ni anexo de difusión de monóxido de carbono.",
              "Radiografía de tórax con lectura según la clasificación de la OIT, del 09/07/2025.",
              "Informe de higiene SIM-HI-2023-017 de Agregados Ladera Bruma S.A.S., con la muestra personal del 17/05/2023.",
              "Constancias de oficio de Minería Socavón de Bruma y de Cantera Delta de Arcilla.",
              "Notas de rehabilitación respiratoria de julio y agosto de 2025."
            ] },
            { h: "Historia clínica pertinente" },
            { p: "Hombre de 55 años, no fumador, con hipertensión arterial esencial controlada con losartán. Consultó a neumología el 05/02/2024 por disnea al subir pendientes y se abrió estudio. El 17/07/2024 recibió incapacidad de 15 días para estudio y ajuste de tareas. La tomografía de alta resolución del 19/07/2024 mostró micronódulos de predominio en lóbulos superiores, algunos calcificados, y adenopatías hiliares con calcificación en cáscara de huevo; neumología diagnosticó neumoconiosis por polvo con sílice (J62.8) e indicó el retiro de la exposición. La prueba de liberación de interferón gamma de agosto de 2024 fue negativa." },
            { p: "La prueba de ejercicio cardiopulmonar del 30/05/2025 registró un consumo pico de oxígeno de 16,8 mL/kg/min (60 % del predicho), con desaturación de 95 % a 88 % y suspensión por disnea. La espirometría del 09/07/2025 registró CVF de 2,95 L (72 % del predicho) con relación VEF1/CVF conservada. Desde el 01/07/2025 trabaja en la portería y en julio inició 12 sesiones de rehabilitación respiratoria." },
            { h: "Valoración presencial del 28/10/2025" },
            { kv: [
              ["Síntomas", "Disnea al caminar en pendiente y al subir dos pisos, con pausas; refiere detenerse tras caminar unos 100 m a paso rápido. Tos seca ocasional"],
              ["Signos vitales", "PA 128/80 mmHg · FC 78 lpm · FR 18 rpm · SpO2 94 % al aire ambiente"],
              ["Antropometría", "Peso 74 kg · talla 168 cm · IMC 26,2"],
              ["Tórax", "Murmullo vesicular conservado, sin ruidos agregados. Sin acropaquias, sin edemas, sin ingurgitación yugular"],
              ["Marcha en el pasillo", "Desaturación a 89 % tras 3 minutos de marcha, con disnea"],
              ["Funcionalidad referida", "Independiente para el autocuidado, con pausas. Refiere apoyo de su esposa en tareas domésticas pesadas y desplazamientos largos"]
            ] }
          ] },
          { titulo: "Calificación · Título I · Deficiencias", bloques: [
            { p: "Calificación según el Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional (Decreto 1507 de 2014)." },
            { tabla: { cols: ["Diagnóstico", "CIE-10", "Origen", "Capítulo", "Clase", "Grado", "Deficiencia"], filas: [
              ["Neumoconiosis debida a otros polvos que contienen sílice", "J62.8", "Laboral", "3 · Sistema respiratorio", "3", "C", "32,00 %"],
              ["Hipertensión arterial esencial, controlada, sin lesión de órgano blanco", "I10", "Común", "2 · Sistema cardiovascular", "0", "No aplica", "0,00 %"]
            ] } },
            { h: "Factor principal: pruebas de función pulmonar y de ejercicio" },
            { tabla: { cols: ["Prueba", "Fecha", "Resultado", "Clase que indica"], filas: [
              ["CVF (espirometría)", "09/07/2025", "2,95 L · 72 % del predicho", "1"],
              ["VEF1 (espirometría)", "09/07/2025", "2,30 L · 71 % del predicho", "1"],
              ["Relación VEF1/CVF", "09/07/2025", "0,78 · conservada", "0"],
              ["DLCO", "Sin dato", "No aportada en el expediente remitido", "No valorable"],
              ["Consumo pico de oxígeno", "30/05/2025", "16,8 mL/kg/min · 60 % del predicho", "3"]
            ], nota: "La clase se asigna con la prueba objetiva más comprometida: clase 3." } },
            { h: "Factores moduladores" },
            { tabla: { cols: ["Factor", "Hallazgo", "Clase"], filas: [
              ["Historia clínica y funcional", "Disnea que obliga a detenerse al caminar en pendiente, al subir escaleras y tras unos 100 m a paso rápido", "3"],
              ["Examen físico", "Desaturación a 89 % en la marcha de 3 minutos en el pasillo", "3"]
            ], nota: "Ajuste neto: (3 − 3) + (3 − 3) = 0. Se mantiene el grado central de la clase 3 (grado C)." } },
            { kv: [
              ["Deficiencia global (Título I)", "32,00 %"],
              ["Valor ponderado de las deficiencias (50 %)", "16,00 %"]
            ] }
          ] },
          { titulo: "Calificación · Título II · Rol laboral, rol ocupacional y otras áreas ocupacionales", bloques: [
            { tabla: { cols: ["Componente", "Criterio aplicado", "Valor"], filas: [
              ["Restricciones del rol laboral", "No puede desempeñar su oficio habitual de perforación y trituración. Reubicado en un cargo distinto, con restricción de ingreso a zonas con polvo", "20,00 %"],
              ["Autosuficiencia económica", "Conserva ingresos por el vínculo vigente, condicionados a la reubicación", "1,50 %"],
              ["Edad", "55 años", "2,00 %"],
              ["Subtotal rol laboral", "Suma de los tres componentes", "23,50 %"]
            ] } },
            { h: "Otras áreas ocupacionales" },
            { tabla: { cols: ["Área", "Dificultades registradas", "Valor"], filas: [
              ["Aprendizaje y aplicación del conocimiento", "Dificultad leve para sostener la atención en tareas prolongadas por fatiga", "0,50 %"],
              ["Comunicación", "Interrumpe conversaciones largas al caminar", "0,60 %"],
              ["Movilidad", "Dificultad severa para caminar distancias largas, subir escaleras, cargar objetos y andar por terreno irregular", "3,80 %"],
              ["Autocuidado", "Requiere pausas para bañarse y vestirse; dificultad para acudir solo a controles", "3,20 %"],
              ["Vida doméstica", "No realiza tareas domésticas pesadas, compras con carga ni mantenimiento de la vivienda", "3,80 %"],
              ["Total otras áreas ocupacionales", "Suma de las cinco áreas", "11,90 %"]
            ] } },
            { kv: [
              ["Rol laboral", "23,50 %"],
              ["Otras áreas ocupacionales", "11,90 %"],
              ["Total Título II", "35,40 %"]
            ] }
          ] },
          { titulo: "Concepto final y decisión", bloques: [
            { kv: [
              ["Valor ponderado de las deficiencias (Título I)", "16,00 %"],
              ["Rol laboral, rol ocupacional y otras áreas ocupacionales (Título II)", "35,40 %"],
              ["Pérdida de capacidad laboral y ocupacional", "51,40 %"],
              ["Origen", "Enfermedad laboral · J62.8"],
              ["Fecha de estructuración", "30/05/2025"],
              ["Requiere ayuda de terceros para las actividades básicas", "No"],
              ["Requiere ayuda de terceros para tomar decisiones", "No"]
            ] },
            { h: "Sustentación" },
            { p: "Origen. La neumoconiosis por polvo con sílice figura en la tabla de enfermedades laborales del Decreto 1477 de 2014. Hay exposición a polvo con sílice cristalina durante más de 28 años en perforación de roca y trituración, con una muestra personal de 0,07 mg/m³ en 2023, por encima del valor límite de referencia, y latencia compatible. Se califica de origen laboral conforme a la definición de enfermedad laboral del artículo 4 de la Ley 1562 de 2012." },
            { p: "Fecha de estructuración. Se fija el 30/05/2025, fecha de la prueba de ejercicio cardiopulmonar que documentó la limitación funcional que determina la clase de la deficiencia." },
            { p: "Porcentaje. La Sala se aparta de la calificación en primera oportunidad (40,80 %): la valoración presencial documenta desaturación con la marcha y dificultades en las otras áreas ocupacionales mayores que las registradas por la administradora." },
            { h: "Fundamentos de derecho" },
            { lista: [
              "Ley 100 de 1993, artículo 41, modificado por el artículo 142 del Decreto Ley 019 de 2012.",
              "Ley 776 de 2002 y Ley 1562 de 2012.",
              "Decreto 1352 de 2013, compilado en el Decreto 1072 de 2015: organización y funcionamiento de las juntas de calificación de invalidez.",
              "Decreto 1477 de 2014: tabla de enfermedades laborales.",
              "Decreto 1507 de 2014: Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional."
            ] },
            { h: "Decisión" },
            { p: "Primero. Calificar a Javier Pardo Navas con una pérdida de capacidad laboral y ocupacional de 51,40 %, de origen laboral, con fecha de estructuración del 30/05/2025." },
            { p: "Segundo. Notificar este dictamen a la persona calificada y comunicarlo a ARL SURA y al empleador." },
            { p: "Tercero. Contra este dictamen proceden los recursos de reposición y de apelación, que pueden presentarse ante esta Junta dentro de los 10 días hábiles siguientes a su notificación. La apelación la resuelve la Junta Nacional de Calificación de Invalidez." },
            { firma: { nombre: "Fabio Ernesto Rangel Ocampo", cargo: "Médico ponente · Sala de Decisión Uno", registro: "Registro médico SIM-RM-54-0611", fecha: "19/11/2025" } },
            { firma: { nombre: "Sandra Milena Jaimes Luna", cargo: "Médica integrante · Sala de Decisión Uno", registro: "Registro médico SIM-RM-54-0745", fecha: "19/11/2025" } },
            { firma: { nombre: "Ruth Esperanza Contreras Gil", cargo: "Terapeuta ocupacional integrante · Sala de Decisión Uno", registro: "Tarjeta profesional SIM-TO-0459", fecha: "19/11/2025" } },
            { nota: "Notificado a la persona calificada el 21/11/2025. Comunicado a ARL SURA el 20/11/2025 y al empleador el 21/11/2025." }
          ] },
          { titulo: "Constancia de autenticidad y estado del trámite", bloques: [
            { p: "La Secretaría de la Junta Regional de Calificación de Invalidez de Norte de Santander hace constar que la presente es copia auténtica y completa del dictamen REG-L02 del 19/11/2025, que reposa en el expediente SIM-JRNS-2025-1487." },
            { kv: [
              ["Dictamen", "REG-L02 · 19/11/2025"],
              ["Notificación a la persona calificada", "21/11/2025"],
              ["Recurso interpuesto", "Apelación de ARL SURA, radicada el 24/11/2025, dentro del término"],
              ["Trámite del recurso", "Expediente remitido a la Junta Nacional de Calificación de Invalidez el 05/12/2025"],
              ["Estado del dictamen", "No está en firme: la decisión sobre el recurso corresponde a la Junta Nacional"],
              ["Copia expedida a solicitud de", "Javier Pardo Navas, persona calificada"],
              ["Fecha de expedición de la copia", "05/12/2025"]
            ] },
            { firma: { nombre: "Diana Marcela Ortega Rincón", cargo: "Secretaria · Junta Regional de Calificación de Invalidez de Norte de Santander", fecha: "05/12/2025" } },
            { nota: "Esta constancia certifica el estado del trámite en la fecha de expedición. Las decisiones posteriores sobre el recurso deben verificarse con la Junta Nacional de Calificación de Invalidez." }
          ] }
        ]
      }
    },

    /* ---------- Dictamen de la Junta Nacional (decide la apelación) ---------- */
    DIC: {
      v1: {
        tipo: "dictamen",
        titulo: "Dictamen de la Junta Nacional de Calificación de Invalidez · recurso de apelación",
        emisor: { n: "Junta Nacional de Calificación de Invalidez", area: "Sala de Decisión Dos", ciudad: "Bogotá D.C.", id: "NIT SIM-830.512.447-0" },
        numero: "DIC-L02",
        fecha: "24/03/2026",
        version: "v1",
        estadoNota: "Ejemplar oficial firmado por la Sala, con sello de notificación del 25/03/2026.",
        paginas: [
          { titulo: "Dictamen · información general", bloques: [
            { kv: [
              ["Dictamen", "DIC-L02"],
              ["Fecha", "24/03/2026"],
              ["Expediente de la Junta Nacional", "SIM-JNCI-2025-09316"],
              ["Sala", "Sala de Decisión Dos"],
              ["Asunto", "Recurso de apelación contra el dictamen REG-L02 del 19/11/2025 de la Junta Regional de Calificación de Invalidez de Norte de Santander (expediente SIM-JRNS-2025-1487)"],
              ["Recurrente", "ARL SURA · recurso radicado el 24/11/2025"],
              ["Recibo del expediente en la Junta Nacional", "12/12/2025"],
              ["Modalidad", "Revisión integral del expediente, con pruebas allegadas a solicitud de la Sala"]
            ] },
            { h: "Datos de la persona calificada" },
            { kv: [
              ["Nombre", "Javier Pardo Navas"],
              ["Identificación", "C.C. SIM-88.214.507"],
              ["Fecha de nacimiento", "23/01/1970"],
              ["Edad a la fecha del dictamen", "56 años"],
              ["Ocupación habitual", "Operador de trituración y cribado"],
              ["Ocupación actual", "Auxiliar de control de accesos, en reubicación desde el 01/07/2025"],
              ["Empleador", "Agregados Ladera Bruma S.A.S. · NIT SIM-901.188.462-7"],
              ["Administradora de riesgos laborales", "ARL SURA"]
            ] },
            { h: "Calificaciones anteriores" },
            { tabla: { cols: ["Instancia", "Documento", "Fecha", "PCL", "Origen", "Estructuración"], filas: [
              ["ARL SURA · primera oportunidad", "SIM-ARL-CPO-2025-11853", "02/09/2025", "40,80 %", "Laboral", "30/05/2025"],
              ["Junta Regional de Norte de Santander", "REG-L02", "19/11/2025", "51,40 %", "Laboral", "30/05/2025"]
            ] } },
            { h: "Argumentos del recurso" },
            { lista: [
              "La Junta Regional calificó sin el informe de función pulmonar firmado: el expediente solo contenía la impresión del equipo, sin el anexo de difusión de monóxido de carbono.",
              "La desaturación al esfuerzo se tomó como modificador del examen físico, cuando ya está considerada en la prueba de ejercicio que define la clase.",
              "Las otras áreas ocupacionales se valoraron con dificultades severas que no coinciden con las notas de rehabilitación respiratoria.",
              "Pide modificar el porcentaje de pérdida de capacidad laboral. No controvierte el origen ni la fecha de estructuración."
            ] },
            { p: "La persona calificada no interpuso recurso. El empleador no se pronunció." },
            { h: "Pruebas solicitadas por la Sala" },
            { p: "El 20/01/2026 la Sala pidió a la IPS Laboratorio Pulmonar Vientoalto el informe de función pulmonar del 09/07/2025 con su anexo firmado de DLCO y las notas de rehabilitación respiratoria. La IPS los allegó el 03/02/2026 y se incorporaron al expediente." }
          ] },
          { titulo: "Consideraciones de la Sala", bloques: [
            { h: "Diagnóstico y origen" },
            { p: "La tomografía de alta resolución del 19/07/2024 y la radiografía del 09/07/2025, con lectura de profusión 2/1 y opacidades pequeñas redondeadas en zonas superiores y medias según la clasificación de la OIT, confirman la neumoconiosis debida a otros polvos que contienen sílice (J62.8). Hay exposición a polvo con sílice cristalina en perforación de roca y trituración durante más de 28 años y una muestra personal de 8 h, del 17/05/2023, de 0,07 mg/m³, por encima del valor límite de referencia de 0,025 mg/m³. La enfermedad figura en la tabla del Decreto 1477 de 2014. Se confirma el origen laboral, que no fue objeto del recurso." },
            { h: "Deficiencia" },
            { p: "El informe firmado del 09/07/2025 registra CVF del 72 % y DLCO del 65 % del predicho, con calidad grado A en ambas pruebas; ambos parámetros corresponden a la clase 1. La prueba de ejercicio cardiopulmonar del 30/05/2025 registra un consumo pico de 16,8 mL/kg/min, que corresponde a la clase 3 y es la prueba objetiva más comprometida: la clase 3 se mantiene." },
            { p: "La Sala acoge el recurso en cuanto al examen físico: no hay hipoxemia en reposo (SpO2 94 % al aire ambiente) ni signos de hipertensión pulmonar o de insuficiencia cardiaca derecha, y la desaturación al esfuerzo ya está incorporada en el factor principal; contarla de nuevo como modificador duplica el hallazgo. El modificador del examen físico corresponde a la clase 2. Se mantiene el modificador de la historia clínica en clase 3. El ajuste neto es de −1 y la deficiencia queda en el grado B (28,00 %)." },
            { h: "Rol laboral y otras áreas ocupacionales" },
            { p: "Se confirman las restricciones del rol laboral (20,00 %), la autosuficiencia económica (1,50 %) y la edad (2,00 %): no puede volver a su oficio y conserva el empleo por la reubicación en portería." },
            { p: "Las notas de rehabilitación de julio y agosto de 2025 registran independencia para bañarse y vestirse, marcha en plano a su propio paso, uso de transporte público para acudir a las sesiones y conversación sin interrupciones en reposo. La Sala ajusta las otras áreas ocupacionales a 6,80 %: conserva las dificultades de movilidad en pendientes, escaleras y cargas y las de vida doméstica en tareas pesadas, y retira las de aprendizaje y aplicación del conocimiento, que no tienen soporte clínico." },
            { h: "Fecha de estructuración" },
            { p: "Se mantiene el 30/05/2025: la prueba de ejercicio cardiopulmonar de esa fecha documenta la limitación que determina la clase de la deficiencia, y los estudios posteriores no muestran un cambio que justifique otra fecha." }
          ] },
          { titulo: "Calificación · Título I · Deficiencias", bloques: [
            { p: "Calificación según el Manual Único para la Calificación de la Pérdida de la Capacidad Laboral y Ocupacional (Decreto 1507 de 2014)." },
            { tabla: { cols: ["Diagnóstico", "CIE-10", "Origen", "Capítulo", "Clase", "Grado", "Deficiencia"], filas: [
              ["Neumoconiosis debida a otros polvos que contienen sílice", "J62.8", "Laboral", "3 · Sistema respiratorio", "3", "B", "28,00 %"],
              ["Hipertensión arterial esencial, controlada, sin lesión de órgano blanco", "I10", "Común", "2 · Sistema cardiovascular", "0", "No aplica", "0,00 %"]
            ] } },
            { h: "Factor principal: pruebas de función pulmonar y de ejercicio" },
            { tabla: { cols: ["Prueba", "Fecha", "Resultado", "Clase que indica"], filas: [
              ["CVF (espirometría)", "09/07/2025", "2,95 L · 72 % del predicho", "1"],
              ["VEF1 (espirometría)", "09/07/2025", "2,30 L · 71 % del predicho", "1"],
              ["Relación VEF1/CVF", "09/07/2025", "0,78 · conservada", "0"],
              ["DLCO (anexo firmado)", "09/07/2025", "16,8 mL/min/mmHg · 65 % del predicho", "1"],
              ["Consumo pico de oxígeno", "30/05/2025", "16,8 mL/kg/min · 60 % del predicho", "3"]
            ], nota: "La clase se asigna con la prueba objetiva más comprometida: clase 3." } },
            { h: "Factores moduladores" },
            { tabla: { cols: ["Factor", "Hallazgo", "Clase"], filas: [
              ["Historia clínica y funcional", "Disnea que obliga a detenerse al caminar en pendiente y al subir escaleras, documentada por neumología y rehabilitación", "3"],
              ["Examen físico", "SpO2 94 % en reposo; sin acropaquias, sin signos de hipertensión pulmonar ni de insuficiencia cardiaca derecha", "2"]
            ], nota: "Ajuste neto: (3 − 3) + (2 − 3) = −1. Grado B de la clase 3." } },
            { kv: [
              ["Deficiencia global (Título I)", "28,00 %"],
              ["Valor ponderado de las deficiencias (50 %)", "14,00 %"]
            ] }
          ] },
          { titulo: "Calificación · Título II · Rol laboral, rol ocupacional y otras áreas ocupacionales", bloques: [
            { tabla: { cols: ["Componente", "Criterio aplicado", "Valor"], filas: [
              ["Restricciones del rol laboral", "No puede desempeñar su oficio habitual; reubicado en un cargo distinto, sin exposición a polvo", "20,00 %"],
              ["Autosuficiencia económica", "Conserva ingresos por el vínculo vigente, condicionados a la reubicación", "1,50 %"],
              ["Edad", "56 años", "2,00 %"],
              ["Subtotal rol laboral", "Suma de los tres componentes", "23,50 %"]
            ] } },
            { h: "Otras áreas ocupacionales" },
            { tabla: { cols: ["Área", "Dificultades que se mantienen", "Valor"], filas: [
              ["Aprendizaje y aplicación del conocimiento", "Sin dificultad documentada", "0,00 %"],
              ["Comunicación", "Dificultad leve para conversar mientras camina en pendiente", "0,20 %"],
              ["Movilidad", "Dificultad moderada a severa para subir escaleras, caminar en pendiente, cargar objetos y recorrer distancias largas", "2,80 %"],
              ["Autocuidado", "Dificultad leve: se baña y se viste solo, con pausas; los desplazamientos a controles le exigen descansos", "1,20 %"],
              ["Vida doméstica", "No realiza tareas domésticas pesadas ni mantenimiento de la vivienda; hace compras livianas", "2,60 %"],
              ["Total otras áreas ocupacionales", "Suma de las cinco áreas", "6,80 %"]
            ] } },
            { kv: [
              ["Rol laboral", "23,50 %"],
              ["Otras áreas ocupacionales", "6,80 %"],
              ["Total Título II", "30,30 %"]
            ] },
            { h: "Comparación con las calificaciones anteriores" },
            { tabla: { cols: ["Componente", "ARL SURA 02/09/2025", "Junta Regional REG-L02", "Junta Nacional DIC-L02"], filas: [
              ["Deficiencia (Título I)", "24,00 % · clase 3, grado A", "32,00 % · clase 3, grado C", "28,00 % · clase 3, grado B"],
              ["Valor ponderado (50 %)", "12,00 %", "16,00 %", "14,00 %"],
              ["Rol laboral", "23,50 %", "23,50 %", "23,50 %"],
              ["Otras áreas ocupacionales", "5,30 %", "11,90 %", "6,80 %"],
              ["Total Título II", "28,80 %", "35,40 %", "30,30 %"],
              ["Pérdida de capacidad laboral", "40,80 %", "51,40 %", "44,30 %"]
            ] } }
          ] },
          { titulo: "Decisión", bloques: [
            { kv: [
              ["Valor ponderado de las deficiencias (Título I)", "14,00 %"],
              ["Rol laboral, rol ocupacional y otras áreas ocupacionales (Título II)", "30,30 %"],
              ["Pérdida de capacidad laboral y ocupacional", "44,30 %"],
              ["Origen", "Enfermedad laboral · J62.8"],
              ["Fecha de estructuración", "30/05/2025"],
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
            { p: "Primero. Modificar el dictamen REG-L02 del 19/11/2025 de la Junta Regional de Calificación de Invalidez de Norte de Santander en cuanto al porcentaje: la pérdida de capacidad laboral y ocupacional de Javier Pardo Navas se fija en 44,30 %." },
            { p: "Segundo. Confirmar el origen laboral del diagnóstico J62.8 y la fecha de estructuración del 30/05/2025." },
            { p: "Tercero. Notificar este dictamen a la persona calificada, comunicarlo a ARL SURA y al empleador, y devolver el expediente a la Junta Regional." },
            { p: "Contra este dictamen no procede recurso en vía administrativa. Las controversias sobre el dictamen en firme corresponden a la justicia laboral ordinaria." },
            { firma: { nombre: "Gustavo Adolfo Peñaranda Mejía", cargo: "Médico ponente · Sala de Decisión Dos", registro: "Registro médico SIM-RM-11-2290", fecha: "24/03/2026" } },
            { firma: { nombre: "Ángela Patricia Rubiano Silva", cargo: "Médica integrante · Sala de Decisión Dos", registro: "Registro médico SIM-RM-11-3104", fecha: "24/03/2026" } },
            { firma: { nombre: "Óscar Iván Melo Cárdenas", cargo: "Terapeuta ocupacional integrante · Sala de Decisión Dos", registro: "Tarjeta profesional SIM-TO-1187", fecha: "24/03/2026" } },
            { nota: "Sello de notificación: notificado a la persona calificada el 25/03/2026; comunicación enviada a ARL SURA y al empleador el 25/03/2026." }
          ] }
        ]
      }
    },

    /* ---------- Constancia de firmeza del dictamen nacional ---------- */
    FIR: {
      v1: {
        tipo: "constancia",
        titulo: "Constancia de firmeza del dictamen",
        emisor: { n: "Junta Nacional de Calificación de Invalidez", area: "Secretaría Técnica", ciudad: "Bogotá D.C.", id: "NIT SIM-830.512.447-0" },
        numero: "FIR-L02",
        fecha: "09/04/2026",
        version: "v1",
        estadoNota: "Constancia expedida por la Secretaría Técnica; se refiere al dictamen DIC-L02.",
        paginas: [
          { titulo: "Constancia", bloques: [
            { p: "La Secretaría Técnica de la Junta Nacional de Calificación de Invalidez hace constar:" },
            { kv: [
              ["Dictamen", "DIC-L02 del 24/03/2026"],
              ["Sala", "Sala de Decisión Dos"],
              ["Expediente", "SIM-JNCI-2025-09316"],
              ["Persona calificada", "Javier Pardo Navas · C.C. SIM-88.214.507"],
              ["Decisión", "Resolvió la apelación de ARL SURA contra el dictamen REG-L02 del 19/11/2025 de la Junta Regional de Calificación de Invalidez de Norte de Santander"],
              ["Resultado", "PCL 44,30 % · origen laboral · fecha de estructuración 30/05/2025"],
              ["Notificación a la persona calificada", "25/03/2026"],
              ["Fecha de firmeza", "09/04/2026"]
            ] },
            { h: "Notificaciones y comunicaciones" },
            { tabla: { cols: ["Destinatario", "Calidad", "Medio", "Enviada", "Acreditada"], filas: [
              ["Javier Pardo Navas", "Persona calificada", "Notificación electrónica con acuse de recibo", "25/03/2026", "25/03/2026"],
              ["ARL SURA", "Entidad recurrente", "Comunicación electrónica", "25/03/2026", "25/03/2026"],
              ["Agregados Ladera Bruma S.A.S.", "Empleador", "Correo certificado", "25/03/2026", "09/04/2026"],
              ["Junta Regional de Calificación de Invalidez de Norte de Santander", "Instancia que profirió el dictamen apelado", "Comunicación y devolución del expediente", "26/03/2026", "27/03/2026"]
            ] } },
            { p: "Contra los dictámenes de la Junta Nacional no procede recurso en vía administrativa. Acreditadas la notificación y las comunicaciones a las partes interesadas, el dictamen DIC-L02 quedó en firme el 09/04/2026." },
            { p: "El dictamen REG-L02 de la Junta Regional fue modificado por el dictamen DIC-L02 y no adquirió firmeza. Esta constancia se refiere solo al dictamen DIC-L02." },
            { p: "Se expide para las partes interesadas el 09/04/2026." },
            { firma: { nombre: "Natalia Forero Lozano", cargo: "Secretaria técnica · Junta Nacional de Calificación de Invalidez", fecha: "09/04/2026" } },
            { nota: "Constancia verificable en la Secretaría Técnica con el número FIR-L02 y el expediente SIM-JNCI-2025-09316." }
          ] },
          { titulo: "Anexo · Trazabilidad del trámite", bloques: [
            { tabla: { cols: ["Fecha", "Actuación"], filas: [
              ["02/09/2025", "ARL SURA califica en primera oportunidad: origen laboral, PCL 40,80 %, estructuración 30/05/2025."],
              ["05/09/2025", "La persona calificada manifiesta su inconformidad."],
              ["19/11/2025", "La Junta Regional de Norte de Santander emite el dictamen REG-L02: PCL 51,40 %."],
              ["24/11/2025", "ARL SURA interpone recurso de apelación."],
              ["05/12/2025", "La Junta Regional remite el expediente."],
              ["12/12/2025", "La Junta Nacional recibe el expediente y lo reparte a la Sala de Decisión Dos."],
              ["20/01/2026", "La Sala pide a la IPS el informe de función pulmonar con su anexo de DLCO."],
              ["03/02/2026", "La IPS allega el informe firmado y sus anexos."],
              ["24/03/2026", "La Sala de Decisión Dos emite el dictamen DIC-L02: PCL 44,30 %."],
              ["25/03/2026", "Notificación a la persona calificada y comunicación a ARL SURA y al empleador."],
              ["09/04/2026", "Última comunicación acreditada. El dictamen DIC-L02 queda en firme."]
            ] } },
            { nota: "Trazabilidad tomada del expediente SIM-JNCI-2025-09316." }
          ] }
        ]
      }
    },

    /* ---------- Afiliación y cobertura ---------- */
    AFI: {
      v1: {
        tipo: "certificado",
        titulo: "Certificado de afiliación y cobertura en riesgos laborales",
        emisor: { n: "ARL SURA", area: "Afiliaciones y novedades", ciudad: "Medellín", id: "NIT SIM-860.555.214-1" },
        numero: "SIM-ARL-CA-2026-08812",
        fecha: "24/04/2026",
        version: "v1",
        estadoNota: "Certificado generado el día de la radicación, con la vigencia a esa fecha.",
        paginas: [
          { titulo: "Certificado", bloques: [
            { p: "ARL SURA certifica que la persona relacionada está afiliada al Sistema General de Riesgos Laborales a través de esta administradora, con la información siguiente:" },
            { kv: [
              ["Afiliado", "Javier Pardo Navas"],
              ["Identificación", "C.C. SIM-88.214.507"],
              ["Número de afiliación", "SIM-ARL-2018-30417"],
              ["Tipo de afiliado", "Dependiente"],
              ["Empleador", "Agregados Ladera Bruma S.A.S. · NIT SIM-901.188.462-7"],
              ["Actividad económica del empleador", "CIIU 0811 · extracción de piedra, arena, arcillas comunes, yeso y anhidrita"],
              ["Fecha de inicio de la cobertura", "01/03/2018"],
              ["Estado de la afiliación", "Activa"],
              ["Fecha de corte de la información", "24/04/2026"]
            ] },
            { h: "Centro de trabajo y clase de riesgo" },
            { tabla: { cols: ["Desde", "Hasta", "Centro de trabajo", "Cargo reportado", "Clase de riesgo"], filas: [
              ["01/03/2018", "30/06/2025", "El Zulia, planta de trituración", "Operador de trituración y cribado", "V"],
              ["01/07/2025", "Vigente", "El Zulia, portería del predio", "Auxiliar de control de accesos", "V"]
            ], nota: "El cambio de cargo del 01/07/2025 se reportó como novedad del mismo vínculo laboral. El empleador conserva la clase de riesgo del predio." } },
            { h: "Cobertura por año" },
            { tabla: { cols: ["Año", "Meses cubiertos", "Meses con aporte registrado", "Novedades"], filas: [
              ["2018", "10 (marzo a diciembre)", "10", "Ingreso el 01/03/2018"],
              ["2019", "12", "12", "Ninguna"],
              ["2020", "12", "12", "Ninguna"],
              ["2021", "12", "12", "Ninguna"],
              ["2022", "12", "12", "Ninguna"],
              ["2023", "12", "12", "Ninguna"],
              ["2024", "12", "12", "Incapacidad temporal de 15 días en julio"],
              ["2025", "12", "12", "Cambio de cargo por reubicación desde el 01/07/2025"],
              ["2026", "4 (enero a abril)", "3", "Abril es el periodo en curso; su aporte se liquida en la planilla siguiente"]
            ], nota: "Sin interrupciones de cobertura desde el 01/03/2018." } },
            { h: "Antecedentes con otras administradoras" },
            { p: "ARL SURA no registra afiliaciones de esta persona anteriores al 01/03/2018. Los periodos laborados entre 1997 y 2017 corresponden a otras administradoras de riesgos laborales y deben certificarse por ellas." },
            { firma: { nombre: "Luisa Fernanda Cardona Ríos", cargo: "Analista de afiliaciones y novedades · ARL SURA", fecha: "24/04/2026" } },
            { nota: "Certificado expedido electrónicamente para el trámite RAD-L02. Código de verificación SIM-VER-7Q4K-2026." }
          ] }
        ]
      }
    },

    /* ---------- Informe de función pulmonar ---------- */
    FUN: {
      v1: {
        tipo: "examen",
        titulo: "Espirometría · impresión exportada por el equipo",
        emisor: { n: "IPS Laboratorio Pulmonar Vientoalto", area: "Laboratorio de función pulmonar", ciudad: "Cúcuta", id: "NIT SIM-900.731.226-4" },
        numero: "SIM-LFP-2025-0709-031",
        fecha: "09/07/2025",
        version: "v1",
        estadoNota: "Exportación automática del equipo: trae la espirometría con la CVF, pero no el anexo firmado de DLCO, ni la firma de quien interpreta, ni el grado de calidad.",
        paginas: [
          { titulo: "Exportación del equipo · hoja 1 de 2", bloques: [
            { kv: [
              ["Paciente", "PARDO NAVAS JAVIER"],
              ["Identificación", "SIM-88.214.507"],
              ["Edad", "55"],
              ["Sexo", "M"],
              ["Talla", "168 cm"],
              ["Peso", "74 kg"],
              ["Fecha y hora de la prueba", "09/07/2025, 08:42"],
              ["Prueba", "Espirometría forzada · fase prebroncodilatador"],
              ["Ecuaciones de referencia", "GLI-2012"]
            ] },
            { tabla: { cols: ["Parámetro", "Mejor valor", "Predicho", "% del predicho"], filas: [
              ["CVF (L)", "2,95", "4,10", "72 %"],
              ["VEF1 (L)", "2,30", "3,25", "71 %"],
              ["VEF1/CVF", "0,78", "0,79", "99 %"],
              ["FEP (L/s)", "6,9", "8,9", "78 %"],
              ["FEF 25-75 (L/s)", "2,20", "2,90", "76 %"]
            ] } },
            { figura: { tipo: "espirometria", datos: { fvc: 2.95, fvcPred: 4.10, fev1: 2.30, fev1Pred: 3.25, pef: 6.9, pefPred: 8.9, patron: "restrictivo" }, pie: "Curva flujo-volumen de la mejor maniobra, tal como la exporta el equipo. Esquema sintético dibujado a partir de los valores medidos." } },
            { kv: [["Interpretación automática del equipo", "Patrón sugestivo de restricción. No validada por un médico."]] },
            { vacio: "Grado de calidad de la sesión: campo vacío en esta exportación." },
            { vacio: "Difusión de monóxido de carbono (DLCO): el anexo firmado no está incluido en esta exportación." },
            { vacio: "Interpretación y firma del médico responsable: no registradas." },
            { nota: "Impresión generada por el software del equipo. No reemplaza el informe firmado del laboratorio." }
          ] },
          { titulo: "Exportación del equipo · hoja 2 de 2", bloques: [
            { h: "Maniobras registradas" },
            { tabla: { cols: ["Maniobra", "CVF (L)", "VEF1 (L)", "FEP (L/s)", "Tiempo espiratorio (s)"], filas: [
              ["1", "2,95", "2,30", "6,9", "7,4"],
              ["2", "2,91", "2,27", "6,7", "7,1"],
              ["3", "2,88", "2,25", "6,8", "6,9"]
            ] } },
            { vacio: "Aceptabilidad y repetibilidad de las maniobras: sin evaluar en esta exportación." },
            { nota: "Fin de la exportación. Archivo entregado al paciente en papel." }
          ] }
        ]
      },
      v2: {
        tipo: "informe",
        titulo: "Informe de función pulmonar",
        emisor: { n: "IPS Laboratorio Pulmonar Vientoalto", area: "Neumología y laboratorio de función pulmonar", ciudad: "Cúcuta", id: "NIT SIM-900.731.226-4" },
        numero: "SIM-LFP-2025-0709-031",
        fecha: "09/07/2025",
        version: "v2",
        estadoNota: "Informe firmado, con el anexo firmado de DLCO, la calidad de las pruebas y los soportes clínicos relacionados.",
        paginas: [
          { titulo: "Informe", bloques: [
            { kv: [
              ["Paciente", "Javier Pardo Navas"],
              ["Identificación", "C.C. SIM-88.214.507"],
              ["Historia clínica", "SIM-NEU-2024-01873"],
              ["Edad y sexo", "55 años · masculino"],
              ["Talla y peso", "168 cm · 74 kg"],
              ["Fecha del estudio", "09/07/2025"],
              ["Solicitado por", "Neumología · seguimiento de neumoconiosis (J62.8)"],
              ["Estudios realizados", "Espirometría pre y posbroncodilatador; difusión de monóxido de carbono por respiración única"],
              ["Ecuaciones de referencia", "GLI-2012 para espirometría y GLI-2017 para DLCO"],
              ["Condiciones", "Presión barométrica 732 mmHg · 26 °C · no fumador · sin broncodilatador en las 12 horas previas"]
            ] },
            { h: "Resultados" },
            { tabla: { cols: ["Parámetro", "Medido", "Predicho", "% del predicho", "Límite inferior normal", "Puntaje z"], filas: [
              ["CVF (L)", "2,95", "4,10", "72 %", "3,28", "−2,31"],
              ["VEF1 (L)", "2,30", "3,25", "71 %", "2,58", "−2,33"],
              ["VEF1/CVF", "0,78", "0,79", "No aplica", "0,69", "−0,16"],
              ["FEP (L/s)", "6,9", "8,9", "78 %", "No aplica", "No aplica"],
              ["DLCO (mL/min/mmHg)", "16,8", "25,8", "65 %", "19,4", "−2,31"],
              ["VA (L)", "4,50", "6,05", "74 %", "No aplica", "No aplica"],
              ["KCO (mL/min/mmHg/L)", "3,73", "4,26", "88 %", "No aplica", "No aplica"]
            ] } },
            { h: "Calidad de las pruebas" },
            { kv: [
              ["Espirometría", "Grado A (ATS/ERS 2019): tres maniobras aceptables; repetibilidad de CVF 0,04 L y de VEF1 0,03 L"],
              ["DLCO", "Grado A (ERS/ATS 2017): dos maniobras aceptables con diferencia de 0,3 mL/min/mmHg; volumen inspirado del 95 % de la capacidad vital; apnea de 10,2 y 10,4 s"],
              ["Hemoglobina", "14,6 g/dL (11/06/2025); no requiere corrección de la DLCO"]
            ] },
            { h: "Interpretación" },
            { p: "Capacidad vital forzada disminuida (72 % del predicho) con relación VEF1/CVF conservada: patrón sugestivo de restricción de grado leve. Sin respuesta significativa al broncodilatador. Difusión de monóxido de carbono disminuida en grado leve (65 % del predicho), con volumen alveolar reducido y KCO conservada, compatible con compromiso del parénquima pulmonar." },
            { p: "Correlación clínica: los resultados concuerdan con la neumoconiosis por polvo con sílice (J62.8). La limitación al esfuerzo documentada en la prueba de ejercicio del 30/05/2025 (anexo 4) es mayor que la que sugiere la función en reposo." },
            { h: "Recomendaciones" },
            { lista: [
              "Mantener el retiro de la exposición a polvo respirable con sílice.",
              "Rehabilitación respiratoria de 12 sesiones (anexo 7).",
              "Control por neumología en 6 meses, con espirometría y DLCO.",
              "Vacunación contra influenza y neumococo; vigilancia anual de tuberculosis."
            ] },
            { firma: { nombre: "Mariela Quintero Solano", cargo: "Neumóloga · interpreta y firma el informe", registro: "Registro médico SIM-RM-54-1187", fecha: "09/07/2025" } },
            { firma: { nombre: "Yeison Arévalo Duarte", cargo: "Terapeuta respiratorio · realiza las pruebas", registro: "Tarjeta profesional SIM-TR-2016-0392", fecha: "09/07/2025" } }
          ] },
          { titulo: "Anexo 1 · Espirometría pre y posbroncodilatador", bloques: [
            { kv: [
              ["Equipo", "Espirómetro de neumotacógrafo, verificado con jeringa de 3 L el 09/07/2025 (error 0,9 %)"],
              ["Posición", "Sentado, con pinza nasal"]
            ] },
            { figura: { tipo: "espirometria", datos: { fvc: 2.95, fvcPred: 4.10, fev1: 2.30, fev1Pred: 3.25, pef: 6.9, pefPred: 8.9, patron: "restrictivo" }, pie: "Curva flujo-volumen de la mejor maniobra prebroncodilatador frente al predicho. Esquema sintético dibujado a partir de los valores medidos." } },
            { h: "Maniobras prebroncodilatador" },
            { tabla: { cols: ["Maniobra", "CVF (L)", "VEF1 (L)", "FEP (L/s)", "Tiempo espiratorio (s)", "Aceptable"], filas: [
              ["1", "2,95", "2,30", "6,9", "7,4", "Sí"],
              ["2", "2,91", "2,27", "6,7", "7,1", "Sí"],
              ["3", "2,88", "2,25", "6,8", "6,9", "Sí"]
            ] } },
            { h: "Respuesta al broncodilatador" },
            { tabla: { cols: ["Parámetro", "Pre", "Post", "Cambio"], filas: [
              ["CVF (L)", "2,95", "2,98", "+0,03 L (+1 %)"],
              ["VEF1 (L)", "2,30", "2,34", "+0,04 L (+2 %)"],
              ["VEF1/CVF", "0,78", "0,79", "Sin cambio relevante"]
            ], nota: "Salbutamol 400 µg con inhalocámara; medición a los 15 minutos. Respuesta no significativa." } }
          ] },
          { titulo: "Anexo 2 · Difusión de monóxido de carbono (DLCO) · anexo firmado", bloques: [
            { kv: [
              ["Técnica", "Respiración única con monóxido de carbono y gas trazador; apnea de 10 segundos"],
              ["Mezcla de prueba", "CO 0,3 % · metano 0,3 % · O2 21 % · balance de nitrógeno"],
              ["Hemoglobina", "14,6 g/dL"],
              ["Presión barométrica", "732 mmHg"]
            ] },
            { tabla: { cols: ["Maniobra", "DLCO (mL/min/mmHg)", "VA (L)", "Volumen inspirado (L)", "Apnea (s)", "Aceptable"], filas: [
              ["1", "16,9", "4,52", "2,82", "10,2", "Sí"],
              ["2", "16,6", "4,47", "2,79", "10,4", "Sí"],
              ["Promedio", "16,8", "4,50", "No aplica", "No aplica", "No aplica"]
            ] } },
            { kv: [
              ["DLCO", "16,8 mL/min/mmHg · 65 % del predicho (predicho 25,8; límite inferior 19,4)"],
              ["VA", "4,50 L · 74 % del predicho"],
              ["KCO", "3,73 mL/min/mmHg/L · 88 % del predicho"],
              ["Calidad", "Grado A"]
            ] },
            { p: "Difusión disminuida en grado leve, con volumen alveolar reducido y KCO conservada." },
            { firma: { nombre: "Mariela Quintero Solano", cargo: "Neumóloga · firma el anexo de difusión", registro: "Registro médico SIM-RM-54-1187", fecha: "09/07/2025" } },
            { nota: "Anexo del informe SIM-LFP-2025-0709-031. El informe queda completo con este anexo." }
          ] },
          { titulo: "Anexo 3 · Radiografía de tórax con lectura según la clasificación de la OIT", bloques: [
            { kv: [
              ["Estudio", "Radiografía de tórax posteroanterior"],
              ["Fecha", "09/07/2025"],
              ["Sistema de lectura", "Clasificación Internacional de Radiografías de Neumoconiosis de la OIT, edición revisada de 2011"],
              ["Calidad técnica", "1 (buena)"],
              ["Opacidades pequeñas · forma", "Primaria q · secundaria p (redondeadas)"],
              ["Zonas afectadas", "Superior y media, derecha e izquierda"],
              ["Profusión", "2/1"],
              ["Opacidades grandes", "0 (ausentes)"],
              ["Anomalías pleurales", "No"],
              ["Símbolos", "hi (aumento de los ganglios hiliares) · es (calcificación en cáscara de huevo)"]
            ] },
            { figura: { tipo: "rx_torax", datos: { profusion: "2/1", forma: "q/p", zonas: ["sd", "si", "md", "mi"], grandes: "0" }, pie: "Esquema sintético de la lectura OIT: opacidades pequeñas redondeadas en zonas superiores y medias de ambos campos. No es la imagen radiográfica." } },
            { p: "Conclusión: hallazgos compatibles con silicosis nodular simple, sin opacidades grandes. Concuerda con la tomografía del 19/07/2024." },
            { firma: { nombre: "Hernán Villamizar Peña", cargo: "Radiólogo · lector de la clasificación OIT", registro: "Registro médico SIM-RM-54-0876", fecha: "09/07/2025" } }
          ] },
          { titulo: "Anexo 4 · Prueba de ejercicio cardiopulmonar", bloques: [
            { kv: [
              ["Fecha", "30/05/2025"],
              ["Protocolo", "Cicloergómetro, rampa de 15 W/min, con análisis de gases respiración a respiración"],
              ["Duración del ejercicio", "5 min 40 s"],
              ["Motivo de suspensión", "Disnea (Borg 7/10); fatiga de piernas Borg 5/10"]
            ] },
            { tabla: { cols: ["Variable", "Medido", "Referencia", "Valoración"], filas: [
              ["Consumo pico de oxígeno", "1,24 L/min · 16,8 mL/kg/min", "2,06 L/min", "60 % del predicho"],
              ["Carga máxima", "85 W", "150 W", "57 % del predicho"],
              ["Frecuencia cardiaca pico", "138 lpm", "165 lpm", "84 % del predicho"],
              ["Umbral anaeróbico", "0,83 L/min · 11,2 mL/kg/min", "Mayor de 40 % del consumo predicho", "En el límite (40 %)"],
              ["Ventilación máxima", "62 L/min", "93 L/min (ventilación voluntaria máxima estimada)", "Reserva respiratoria 33 %"],
              ["Pendiente VE/VCO2", "36", "Menor de 30", "Aumentada"],
              ["Saturación de oxígeno", "95 % en reposo · 88 % en el pico", "Caída menor de 4 puntos", "Desaturación de 7 puntos"],
              ["Presión arterial", "126/80 en reposo · 178/88 mmHg en el pico", "Respuesta normal", "Normal"]
            ] } },
            { figura: { tipo: "serie", datos: { titulo: "Saturación de oxígeno durante la prueba", unidad: "%", puntos: [["Reposo", 95], ["25 W", 94], ["50 W", 92], ["75 W", 89], ["Pico 85 W", 88], ["Recuperación 2 min", 93]], limite: { valor: 90, etiqueta: "Umbral de desaturación 90 %" }, forma: "linea" }, pie: "Saturación por pulsioximetría en cada etapa de la rampa. Esquema sintético." } },
            { p: "Conclusión: capacidad aeróbica moderadamente disminuida (consumo pico de 60 % del predicho), con desaturación al esfuerzo y pendiente VE/VCO2 aumentada, compatible con limitación por alteración del intercambio gaseoso. Reserva respiratoria conservada. Electrocardiograma de esfuerzo sin cambios isquémicos ni arritmias. Componente de desacondicionamiento asociado." },
            { firma: { nombre: "Mariela Quintero Solano", cargo: "Neumóloga · supervisa e interpreta la prueba", registro: "Registro médico SIM-RM-54-1187", fecha: "30/05/2025" } }
          ] },
          { titulo: "Anexo 5 · Resumen de atenciones de neumología", bloques: [
            { tabla: { cols: ["Fecha", "Atención", "Hallazgos", "Conducta"], filas: [
              ["05/02/2024", "Neumología · consulta de primera vez", "Disnea al subir pendientes, de varios meses. Tos seca ocasional. No fumador. Hipertensión arterial controlada con losartán. 27 años en minería, perforación y trituración. Radiografía de la EPS con opacidades nodulares en campos superiores", "Abre estudio: tomografía de alta resolución y pruebas de función pulmonar. Pide al empleador la información de exposición. Recomienda protección respiratoria"],
              ["17/07/2024", "Neumología · control", "Persiste la disnea de esfuerzo. Tomografía programada para el 19/07/2024", "Incapacidad de 15 días, del 17/07/2024 al 31/07/2024, para estudio y ajuste de tareas (anexo 6)"],
              ["19/07/2024", "Tomografía de tórax de alta resolución y neumología", "Micronódulos centrolobulillares y perilinfáticos de 2 a 5 mm de predominio en lóbulos superiores y segmentos posteriores, algunos calcificados. Adenopatías hiliares y mediastinales con calcificación en cáscara de huevo. Sin masas conglomeradas ni panal de abejas", "Diagnóstico: neumoconiosis debida a otros polvos que contienen sílice (J62.8). Seguimiento por neumología y retiro de la exposición. Reporte de enfermedad laboral diligenciado"],
              ["12/08/2024", "Laboratorio clínico", "Prueba de liberación de interferón gamma negativa", "Sin infección tuberculosa latente. Control anual"],
              ["30/05/2025", "Neumología y laboratorio pulmonar", "Disnea al caminar en pendiente, con necesidad de pausas. Prueba de ejercicio cardiopulmonar: consumo pico de 16,8 mL/kg/min (60 %), desaturación a 88 % (anexo 4)", "Pide informe funcional completo con espirometría y DLCO. Recomienda reubicación definitiva sin exposición a polvo"],
              ["09/07/2025", "Laboratorio pulmonar y neumología", "CVF 72 % y DLCO 65 % del predicho. Radiografía con profusión 2/1", "Informe firmado. Orden de rehabilitación respiratoria (anexo 7)"]
            ] } },
            { nota: "Extracto de la historia clínica SIM-NEU-2024-01873, conforme a la Resolución 1995 de 1999. Se limita a lo pertinente para la evaluación funcional respiratoria." },
            { firma: { nombre: "Mariela Quintero Solano", cargo: "Neumóloga tratante", registro: "Registro médico SIM-RM-54-1187", fecha: "09/07/2025" } }
          ] },
          { titulo: "Anexo 6 · Certificado de incapacidad", bloques: [
            { kv: [
              ["Certificado", "SIM-INC-2024-71542"],
              ["Fecha de expedición", "17/07/2024"],
              ["Paciente", "Javier Pardo Navas · C.C. SIM-88.214.507"],
              ["Tipo", "Inicial"],
              ["Modalidad", "Ambulatoria"],
              ["Fecha de inicio", "17/07/2024"],
              ["Fecha de terminación", "31/07/2024"],
              ["Días", "15 (quince)"],
              ["Diagnóstico principal", "J84.9 · Enfermedad pulmonar intersticial, no especificada (en estudio)"],
              ["Diagnóstico relacionado", "Z57.2 · Exposición ocupacional al polvo"],
              ["Origen registrado", "Enfermedad general, pendiente de calificación de origen"],
              ["Motivo", "Estudio de neumopatía por exposición a polvo y ajuste de tareas"]
            ] },
            { firma: { nombre: "Mariela Quintero Solano", cargo: "Neumóloga · expide la incapacidad", registro: "Registro médico SIM-RM-54-1187", fecha: "17/07/2024" } },
            { nota: "Expedida antes del diagnóstico confirmado del 19/07/2024." }
          ] },
          { titulo: "Anexo 7 · Orden de rehabilitación respiratoria", bloques: [
            { kv: [
              ["Fecha", "09/07/2025"],
              ["Programa", "Rehabilitación respiratoria ambulatoria"],
              ["Sesiones", "12, tres por semana, de 60 minutos"],
              ["Componentes", "Entrenamiento aeróbico en banda y cicloergómetro, fuerza de miembros superiores e inferiores, técnicas de respiración y educación"],
              ["Objetivos", "Mejorar la tolerancia al esfuerzo, enseñar el control de la disnea y el uso de pausas"]
            ] },
            { h: "Prueba de marcha de 6 minutos (línea de base)" },
            { tabla: { cols: ["Variable", "Inicio", "Final"], filas: [
              ["Saturación de oxígeno", "95 %", "89 %"],
              ["Frecuencia cardiaca", "82 lpm", "126 lpm"],
              ["Disnea (Borg)", "0", "5"],
              ["Fatiga de piernas (Borg)", "0", "3"]
            ] } },
            { kv: [
              ["Distancia recorrida", "402 m (72 % del predicho)"],
              ["Detenciones", "Una, de 30 segundos, en el minuto 4"]
            ] },
            { h: "Recomendaciones laborales" },
            { lista: [
              "Sin exposición a polvo respirable con sílice ni ingreso a frentes de extracción y zonas de producción.",
              "Puede desempeñar tareas de control de accesos en una portería separada del proceso.",
              "Evitar cargas pesadas y desplazamientos prolongados en pendiente."
            ] },
            { firma: { nombre: "Claudia Marcela Ibarra Peñaloza", cargo: "Fisioterapeuta · rehabilitación respiratoria", registro: "Tarjeta profesional SIM-FT-2012-0718", fecha: "09/07/2025" } },
            { firma: { nombre: "Mariela Quintero Solano", cargo: "Neumóloga · ordena el programa", registro: "Registro médico SIM-RM-54-1187", fecha: "09/07/2025" } }
          ] }
        ]
      }
    },

    /* ---------- Informe de higiene ---------- */
    EXP: {
      v2: {
        tipo: "informe",
        titulo: "Informe de evaluación de la exposición ocupacional a sílice cristalina respirable",
        emisor: { n: "Agregados Ladera Bruma S.A.S.", area: "Sistema de gestión de seguridad y salud en el trabajo", ciudad: "El Zulia, Norte de Santander", id: "NIT SIM-901.188.462-7" },
        numero: "SIM-HI-2023-017",
        fecha: "16/06/2023",
        version: "v2",
        estadoNota: "Versión 2 del informe: incorpora el certificado de laboratorio y reemplaza la versión preliminar de campo del 19/05/2023.",
        paginas: [
          { titulo: "Informe", bloques: [
            { h: "1. Identificación" },
            { kv: [
              ["Empresa", "Agregados Ladera Bruma S.A.S. · NIT SIM-901.188.462-7"],
              ["Actividad económica", "CIIU 0811 · extracción de piedra, arena, arcillas comunes, yeso y anhidrita"],
              ["Centro de trabajo", "El Zulia, planta de trituración"],
              ["Fecha del muestreo", "17/05/2023"],
              ["Jornada muestreada", "Turno de 06:00 a 14:00 (8 h)"],
              ["Agente evaluado", "Sílice cristalina respirable (cuarzo y cristobalita) y polvo respirable"],
              ["Tipo de muestra", "Personal, en la zona respiratoria del trabajador, durante la jornada completa"],
              ["Elaborado por", "Higiene Ocupacional Serranía S.A.S., contratista del sistema de gestión"]
            ] },
            { h: "2. Objetivo" },
            { p: "Evaluar la exposición personal a sílice cristalina respirable de los trabajadores de la planta de trituración, compararla con el valor límite permisible de referencia y definir los controles y la vigilancia de la salud." },
            { h: "3. Descripción del proceso y de los puestos" },
            { p: "La planta procesa roca de arenisca con trituradora de mandíbula primaria, trituradora de cono secundaria, dos cribas vibratorias y bandas transportadoras. El operador de trituración y cribado supervisa la tolva, retira atascos de la trituradora primaria y limpia correas y faldones; pasa unas 4 h del turno cerca del proceso. En la fecha del muestreo no había supresión húmeda; las bandas tienen encerramiento parcial y la ventilación es natural." },
            { p: "Protección respiratoria entregada: respirador de media cara con filtros P100. El registro de uso es parcial: en el muestreo se observó el respirador puesto durante el 55 % del tiempo de proximidad al proceso." },
            { h: "4. Metodología" },
            { kv: [
              ["Muestreo", "Bomba de muestreo personal con ciclón de nailon de 10 mm a 1,7 L/min y filtro de PVC de 37 mm y 5 µm"],
              ["Calibración", "Calibrador primario antes y después de cada muestra; variación máxima admitida del 5 %"],
              ["Análisis de sílice", "Método NIOSH 7500, difracción de rayos X"],
              ["Polvo respirable", "Método NIOSH 0600, gravimetría"],
              ["Control de calidad", "Dos blancos de campo; laboratorio con método acreditado según ISO/IEC 17025"],
              ["Valor límite de referencia", "TLV-TWA de la ACGIH para cuarzo y cristobalita, fracción respirable: 0,025 mg/m³ (8 h). Nivel de acción: 50 % del valor límite"]
            ] }
          ] },
          { titulo: "Resultados, interpretación y recomendaciones", bloques: [
            { h: "5. Resultados" },
            { tabla: { cols: ["Muestra", "Puesto y tarea", "Tiempo (min)", "Volumen (m³)", "Polvo respirable (mg/m³)", "Cuarzo en el filtro (µg)", "Sílice cristalina respirable, 8 h (mg/m³)", "Fracción del valor límite"], filas: [
              ["M-01", "Operador de trituración y cribado: tolva, atascos y correas (Javier Pardo Navas)", "480", "0,816", "0,58", "57", "0,070", "2,80"],
              ["M-02", "Operador de cribas y bandas (trabajador 2)", "470", "0,799", "0,45", "41", "0,050", "2,00"],
              ["M-03", "Ayudante de patio y despacho (trabajador 3)", "475", "0,808", "0,24", "17", "0,021", "0,84"],
              ["M-04", "Operador de cargador frontal, cabina cerrada (trabajador 4)", "480", "0,816", "0,11", "7", "0,009", "0,36"],
              ["B-01 y B-02", "Blancos de campo", "No aplica", "No aplica", "Menor que el límite de detección", "Menor de 5", "No aplica", "No aplica"]
            ], nota: "Concentraciones ponderadas a 8 h, suponiendo exposición nula en el tiempo no muestreado. Cristobalita por debajo del límite de detección en todas las muestras. M-04 está entre los límites de detección (5 µg) y de cuantificación (15 µg): valor estimado." } },
            { figura: { tipo: "serie", datos: { titulo: "Sílice cristalina respirable por muestra personal, 17/05/2023", unidad: "mg/m³", puntos: [["M-01 Trituración y cribado", 0.070], ["M-02 Cribas y bandas", 0.050], ["M-03 Patio y despacho", 0.021], ["M-04 Cargador frontal", 0.009]], limite: { valor: 0.025, etiqueta: "TLV-TWA ACGIH 0,025 mg/m³" }, forma: "barras" }, pie: "Concentración ponderada a 8 h frente al valor límite permisible de referencia." } },
            { h: "6. Interpretación" },
            { p: "La muestra personal M-01, del operador de trituración y cribado, registra 0,070 mg/m³ de sílice cristalina respirable en 8 h: 2,8 veces el valor límite de referencia. La exposición no es aceptable. M-02 también supera el valor límite; M-03 supera el nivel de acción." },
            { p: "El resultado corresponde a la jornada, al puesto y a las tareas muestreadas el 17/05/2023, con producción normal del turno. No se extrapola a otros periodos ni a otros puestos." },
            { h: "7. Recomendaciones" },
            { lista: [
              "Instalar supresión húmeda con agua pulverizada en la trituradora primaria, en la de cono y en los puntos de transferencia de las bandas.",
              "Completar el encerramiento de cribas y bandas y limpiar por aspiración o vía húmeda; no usar aire comprimido.",
              "Programa de protección respiratoria con pruebas de ajuste, mientras los controles de ingeniería no reduzcan la exposición.",
              "Incluir el grupo de trituración en el sistema de vigilancia epidemiológica de sílice: radiografía de tórax con lectura OIT y espirometría, según la guía de atención integral basada en la evidencia para neumoconiosis (Resolución 2844 de 2007).",
              "Repetir la evaluación cuando se instalen los controles y, después, al menos una vez al año."
            ] },
            { h: "8. Marco normativo" },
            { lista: [
              "Decreto 1072 de 2015, Libro 2, Parte 2, Título 4, Capítulo 6: sistema de gestión de seguridad y salud en el trabajo, identificación de peligros y mediciones ambientales.",
              "Resolución 2400 de 1979: valores límite permisibles de la ACGIH como referencia para la exposición a sustancias químicas.",
              "Resolución 2844 de 2007: guías de atención integral de salud ocupacional basadas en la evidencia, entre ellas la de neumoconiosis."
            ] },
            { firma: { nombre: "Paola Andrea Suárez Gélvez", cargo: "Ingeniera, especialista en higiene y seguridad industrial · Higiene Ocupacional Serranía S.A.S.", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2019-4471", fecha: "16/06/2023" } },
            { firma: { nombre: "Wilmer Alexis Rozo Carrillo", cargo: "Coordinador del sistema de gestión de seguridad y salud en el trabajo · Agregados Ladera Bruma S.A.S.", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2017-2208", fecha: "16/06/2023" } }
          ] },
          { titulo: "Anexo 1 · Registro de campo de la muestra M-01", bloques: [
            { kv: [
              ["Trabajador", "Javier Pardo Navas · operador de trituración y cribado"],
              ["Bomba", "SIM-BMP-07"],
              ["Filtro", "PVC de 37 mm, lote SIM-F-2305-112"],
              ["Caudal antes y después", "1,70 L/min · 1,69 L/min (variación 0,6 %)"],
              ["Inicio y fin", "06:02 · 14:02"],
              ["Tiempo de muestreo", "480 min"],
              ["Condiciones ambientales", "31 °C · humedad relativa 62 % · viento leve"],
              ["Producción del turno", "410 t, dentro de lo habitual"]
            ] },
            { h: "Actividades observadas" },
            { tabla: { cols: ["Hora", "Actividad", "Observación"], filas: [
              ["06:02 a 07:30", "Supervisión de la tolva de alimentación", "Polvo visible en la descarga de volquetas"],
              ["07:30 a 08:10", "Retiro de atasco en la trituradora primaria", "Polvo visible abundante; respirador retirado parte del tiempo para comunicarse"],
              ["08:10 a 10:00", "Recorrido de cribas y bandas", "Limpieza de faldones con pala"],
              ["10:00 a 10:30", "Pausa en caseta", "Lejos del proceso"],
              ["10:30 a 12:30", "Supervisión de tolva y de la trituradora de cono", "Polvo visible intermitente"],
              ["12:30 a 13:00", "Almuerzo en caseta", "Lejos del proceso"],
              ["13:00 a 14:02", "Limpieza de correas y entrega de turno", "Barrido en seco cerca de la banda principal"]
            ] } },
            { firma: { nombre: "Paola Andrea Suárez Gélvez", cargo: "Higienista responsable del muestreo", registro: "Licencia en seguridad y salud en el trabajo SIM-LSST-2019-4471", fecha: "17/05/2023" } }
          ] },
          { titulo: "Anexo 2 · Certificado de análisis de laboratorio", bloques: [
            { kv: [
              ["Laboratorio", "Laboratorio Analítico Meseta Gris · método acreditado según ISO/IEC 17025 (certificado SIM-LAB-17025-0412)"],
              ["Fecha de recepción", "19/05/2023"],
              ["Fecha de análisis", "01/06/2023"],
              ["Fecha del certificado", "05/06/2023"],
              ["Métodos", "NIOSH 7500 (difracción de rayos X) · NIOSH 0600 (gravimetría)"],
              ["Límites del método", "Detección 5 µg · cuantificación 15 µg de cuarzo por filtro"],
              ["Incertidumbre expandida", "± 18 % para cuarzo en el intervalo cuantificable"]
            ] },
            { tabla: { cols: ["Muestra", "Filtro", "Masa respirable (mg)", "Cuarzo (µg)", "Cristobalita (µg)"], filas: [
              ["M-01", "SIM-F-2305-112", "0,473", "57", "Menor de 5"],
              ["M-02", "SIM-F-2305-113", "0,367", "41", "Menor de 5"],
              ["M-03", "SIM-F-2305-114", "0,196", "17", "Menor de 5"],
              ["M-04", "SIM-F-2305-115", "0,090", "7 (estimado)", "Menor de 5"],
              ["B-01", "SIM-F-2305-116", "Menor de 0,010", "Menor de 5", "Menor de 5"],
              ["B-02", "SIM-F-2305-117", "Menor de 0,010", "Menor de 5", "Menor de 5"]
            ] } },
            { firma: { nombre: "Diana Carolina Pabón Rivera", cargo: "Química analista · Laboratorio Analítico Meseta Gris", fecha: "05/06/2023" } }
          ] }
        ]
      }
    }
  }
};
