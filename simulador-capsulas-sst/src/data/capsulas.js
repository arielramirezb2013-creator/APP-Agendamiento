"use strict";
/* Contenido de las cápsulas SST. Cada nodo: msgs[] (mensajes entrantes) y luego opciones[] (botones) o next (automático). */
const CAPSULAS = {
  pausas: {
    icon: "🧘",
    nombre: "Pausas activas",
    tema: "Riesgo biomecánico",
    objetivo: "Pausas activas adaptadas a cada tipo de actividad",
    duracion: "~2–3 min",
    inicio: "inicio",
    nodes: {
      inicio: {
        msgs: ["¡Hola, {nombre}! 👋 Te saluda el equipo de Bienestar de *{remitente}*.", "Las pausas activas previenen molestias musculares, pero las mejores dependen de *lo que haces cada día*. 💪", "Para darte tips a tu medida: ¿cómo es tu trabajo la mayor parte del día?"],
        opciones: [
          { txt: "Administrativo (sentado)", next: "admin" },
          { txt: "Operativo", next: "operativo" }
        ]
      },
      operativo: {
        msgs: ["¡Perfecto! ¿Qué predomina en tu labor operativa?"],
        opciones: [
          { txt: "Conducción", next: "conduccion" },
          { txt: "De pie / parado", next: "depie" },
          { txt: "Movimiento repetitivo", next: "repetitivo" }
        ]
      },
      admin: {
        msgs: ["Trabajo sentado y frente a pantalla 💻. Tus pausas ideales:", "👁️ *Vista:* regla 20-20-20 — cada 20 min, mira algo a 6 metros por 20 segundos.", "🧎 *Cuello y hombros:* inclina la cabeza a cada lado y gira los hombros, cada 1 a 2 horas.", "🚶 *Circulación:* ponte de pie y camina 2 a 3 minutos cada hora.", "✅ *Beneficio:* menos fatiga visual y mental, mejor circulación y concentración.", "🛡️ *Evitas:* dolor de cuello y espalda, fatiga visual, túnel carpiano y los riesgos del sedentarismo."],
        next: "quiz"
      },
      conduccion: {
        msgs: ["Pasas muchas horas al volante 🚗. Tus pausas ideales:", "🅿️ *Cada 2 horas:* detente en un lugar seguro, baja y camina 3 a 5 minutos.", "🦵 *Piernas:* estira pantorrillas y muslos; haz círculos con los tobillos para activar la circulación.", "🔙 *Espalda:* de pie, estírate hacia atrás y rota el tronco suavemente.", "💧 Aprovecha para hidratarte y descansar la vista mirando a lo lejos.", "✅ *Beneficio:* reactivas la circulación en las piernas, reduces la somnolencia y descansas la espalda.", "🛡️ *Evitas:* dolor lumbar, várices y coágulos por inmovilidad, y la fatiga que aumenta el riesgo de accidente."],
        next: "quiz"
      },
      depie: {
        msgs: ["Pasas la jornada de pie 🧍. Tus pausas ideales:", "⚖️ *Alterna el peso* entre ambas piernas; si puedes, apoya un pie en un escalón bajo.", "🦵 *Pantorrillas:* ponte en puntas de pie y baja, 10 a 15 veces; mueve los tobillos en círculos.", "🪑 *Siéntate* o camina unos pasos cada cierto tiempo para descargar la espalda.", "✅ *Beneficio:* mejoras el retorno de sangre y descargas piernas y espalda baja.", "🛡️ *Evitas:* várices e hinchazón en las piernas, dolor de pies y lumbar, y la fatiga."],
        next: "quiz"
      },
      repetitivo: {
        msgs: ["Haces movimientos repetitivos con manos o brazos 🔁. Tus pausas ideales:", "✋ *Muñecas:* estíralas hacia arriba y abajo, y haz círculos suaves.", "🤲 *Manos:* abre y cierra los dedos con fuerza moderada 10 veces; suelta el agarre.", "💪 *Antebrazos y hombros:* estira el brazo extendido y rota los hombros hacia atrás.", "✅ *Beneficio:* relajas los músculos sobrecargados y mejoras la circulación en manos y brazos.", "🛡️ *Evitas:* túnel carpiano, tendinitis, epicondilitis (codo de tenista) y la fatiga muscular."],
        next: "quiz"
      },
      quiz: {
        msgs: ["Una pregunta rápida para cerrar 🧠", "¿Cada cuánto conviene moverte o hacer una pausa durante la jornada?"],
        opciones: [
          { txt: "Cada 1 a 2 horas", next: "ok", correcta: true },
          { txt: "Una vez al día", next: "no" },
          { txt: "Solo cuando duele", next: "no" }
        ]
      },
      ok: {
        msgs: ["¡Exacto, {nombre}! ✅ Moverte cada 1 a 2 horas (con micro-pausas más seguido) marca la diferencia."],
        next: "cierre"
      },
      no: {
        msgs: ["¡Casi! 👀 Lo ideal es moverte cada 1 a 2 horas, sin esperar a sentir dolor. Prevenir es la clave."],
        next: "cierre"
      },
      cierre: {
        msgs: ["Recuerda: tu cuerpo es tu principal herramienta de trabajo. Cuídalo todos los días. 💚", "¿Quieres una rutina completa para tu actividad? Responde *PAUSA* y te la enviamos. 📲", "¡Gracias por tu tiempo, {nombre}! — *{remitente}*"]
      }
    }
  },
  cargas: {
    icon: "📦",
    nombre: "Manejo de cargas",
    tema: "Manejo manual de cargas",
    objetivo: "Técnica y ayudas según el tipo de labor",
    duracion: "~2–3 min",
    inicio: "inicio",
    nodes: {
      inicio: {
        msgs: ["¡Hola, {nombre}! 👋 Aquí *{remitente}*, cuidando tu espalda en el trabajo. 🦴", "Levantar cargas con buena técnica —y con las *ayudas correctas*— previene lesiones.", "Para darte tips a tu medida: ¿cómo manejas cargas habitualmente?"],
        opciones: [
          { txt: "Ocasional / liviano", next: "ocasional" },
          { txt: "Frecuente / operativo", next: "operativo" }
        ]
      },
      operativo: {
        msgs: ["Entendido. ¿En qué contexto manejas cargas?"],
        opciones: [
          { txt: "Bodega o almacén", next: "bodega" },
          { txt: "Reparto a domicilio", next: "reparto" },
          { txt: "Obra / cargas pesadas", next: "obra" }
        ]
      },
      ocasional: {
        msgs: ["Manejas cargas livianas de vez en cuando: resmas, cajas de archivo, garrafones. 📦", "✅ *Técnica:* dobla las *rodillas* (no la espalda), pega la carga al cuerpo y no gires la cintura.", "🛠️ *Ayudas:* usa un *carrito o carretilla* para varias cajas, divide la carga en partes y pide apoyo si es voluminosa.", "🧯 Para garrafones, usa *dispensador con base* o un carrito; evita levantarlos por encima de los hombros.", "🛡️ *Evitas:* tirones lumbares y sobreesfuerzos por levantar a la rápida."],
        next: "quiz"
      },
      bodega: {
        msgs: ["Trabajas en bodega o almacén, con cargas frecuentes. 🏬", "✅ *Técnica:* rodillas flexionadas, espalda recta, carga pegada al cuerpo y giro con los pies.", "🛠️ *Ayudas mecánicas:* *gato hidráulico* y *estibadora* para estibas; *carretilla o zorra* para cajas; *montacargas* para lo pesado o en altura.", "📊 Ubica lo más pesado y de uso frecuente a la altura de la cadera, no en el piso ni muy arriba.", "🛡️ *Evitas:* lesiones por repetir levantamientos todo el día, como lumbalgia y hernias."],
        next: "quiz"
      },
      reparto: {
        msgs: ["Haces reparto o domicilios, cargando y a veces subiendo escaleras. 🛵", "✅ *Técnica:* dobla rodillas, carga pegada al cuerpo; sube de frente, sin torcer el tronco.", "🛠️ *Ayudas:* *carretilla plegable* o *diablito* para escaleras, *mochila o caja ergonómica* ajustada a la espalda, y correas para repartir el peso.", "⚖️ Distribuye el peso en ambos lados del cuerpo y haz varios viajes en vez de uno muy cargado.", "🛡️ *Evitas:* dolor de espalda y hombros, y caídas por cargar de más."],
        next: "quiz"
      },
      obra: {
        msgs: ["Manejas materiales pesados en obra o construcción. 🏗️", "✅ *Técnica:* rodillas flexionadas, espalda recta, carga cerca del cuerpo; nunca gires la cintura con peso.", "🛠️ *Ayudas:* *carretilla (buggy)*, *poleas o malacates* para subir material, *grúas* para lo muy pesado y *trabajo en equipo* para cargas grandes.", "🤝 Si la carga supera lo recomendado, *entre dos o más* o con equipo. La faja no reemplaza la buena técnica.", "🛡️ *Evitas:* hernias discales, lesiones lumbares graves y aplastamientos."],
        next: "quiz"
      },
      quiz: {
        msgs: ["Una pregunta para cerrar 🧠", "Al levantar una carga del piso, ¿qué haces primero?"],
        opciones: [
          { txt: "Doblo rodillas, espalda recta", next: "ok", correcta: true },
          { txt: "Doblo la espalda", next: "no" },
          { txt: "La levanto rápido", next: "no" }
        ]
      },
      ok: {
        msgs: ["¡Muy bien, {nombre}! ✅ Doblar las rodillas y mantener la espalda recta protege tu zona lumbar."],
        next: "cierre"
      },
      no: {
        msgs: ["¡Cuidado! ⚠️ Doblar la espalda o ir a la rápida sobrecarga la columna. Dobla las *rodillas* y mantén la espalda recta."],
        next: "cierre"
      },
      cierre: {
        msgs: ["Regla de oro: si la carga es muy pesada, *usa una ayuda o pide apoyo*. Como referencia, evita levantar más de ~25 kg solo. 🤝", "Tu espalda te acompaña toda la vida. ¡Cuídala! 💚 — *{remitente}*"]
      }
    }
  },
  calor: {
    icon: "☀️",
    nombre: "Hidratación y calor",
    tema: "Estrés térmico e hidratación",
    objetivo: "Hidratación, alimentación y protección según la labor",
    duracion: "~2–3 min",
    inicio: "inicio",
    nodes: {
      inicio: {
        msgs: ["¡Hola, {nombre}! ☀️ Te saluda *{remitente}*.", "Con calor, tu cuerpo pierde agua rápido. Cuidarte depende de *dónde y cómo* trabajas. 💧", "¿Cómo es tu jornada la mayor parte del tiempo?"],
        opciones: [
          { txt: "Bajo el sol / intemperie", next: "sol" },
          { txt: "Calor en lugar cerrado", next: "cerrado" },
          { txt: "Esfuerzo físico fuerte", next: "esfuerzo" }
        ]
      },
      sol: {
        msgs: ["Trabajas bajo el sol o a la intemperie ☀️ (obra, agro, mensajería...). Cuídate así:", "💧 *Hidrátate:* agua antes de tener sed, un trago cada 15 a 20 minutos.", "🥗 *Sí ayudan:* frutas con agua (sandía, melón, naranja, piña), pepino, agua de coco y ensaladas.", "🚫 *Evita:* alcohol, exceso de café y bebidas muy azucaradas o energizantes; *deshidratan más*. Cuida también el exceso de sal.", "👕 *Ropa:* manga larga *fresca y de colores claros*, sombrero o gorra de ala y gafas con filtro UV.", "🧴 *Piel:* protector solar FPS 30+ en zonas expuestas; reaplica cada 2 a 3 horas y más si sudas.", "✅ *Beneficio:* mantienes energía y concentración. 🛡️ *Evitas:* golpe de calor, quemaduras, calambres y agotamiento."],
        next: "quiz"
      },
      cerrado: {
        msgs: ["Trabajas en un ambiente caluroso cerrado 🔥 (cocina, hornos, calderas...). Cuídate así:", "💧 *Hidrátate seguido:* agua fresca a sorbos durante todo el turno, no de golpe al final.", "🥗 *Sí ayudan:* frutas con agua, sopas ligeras y ensaladas; reponen líquidos.", "🚫 *Evita:* alcohol, mucho café y bebidas muy azucaradas; y comidas muy saladas o pesadas que dan más sed.", "👕 *Ropa:* ligera y *transpirable*; aprovecha la ventilación y haz pausas en zonas frescas.", "✅ *Beneficio:* evitas el sobrecalentamiento. 🛡️ *Evitas:* mareos, calambres por calor y agotamiento."],
        next: "quiz"
      },
      esfuerzo: {
        msgs: ["Tu labor exige *esfuerzo físico fuerte* 💪 (cargue, trabajo pesado). Cuídate así:", "💧 *Hidrátate antes, durante y después:* agua a sorbos cada 15 a 20 minutos mientras trabajas.", "🧂 *Reposición:* en jornadas largas con mucho sudor, suma *bebidas con electrolitos* o suero oral; el agua de coco también aporta sales.", "🥗 *Sí ayudan:* frutas (banano por el potasio, sandía, naranja) y ensaladas.", "🚫 *Evita:* alcohol y bebidas muy azucaradas o energizantes; *deshidratan y descompensan*.", "👕 *Ropa* transpirable y, si hay sol, protección de piel (FPS 30+) y gorra.", "✅ *Beneficio:* rindes mejor y te recuperas. 🛡️ *Evitas:* calambres, fatiga extrema y golpe de calor."],
        next: "quiz"
      },
      quiz: {
        msgs: ["Una pregunta para cerrar 🧠", "¿Cuándo deberías empezar a hidratarte?"],
        opciones: [
          { txt: "Antes de sentir sed", next: "ok", correcta: true },
          { txt: "Cuando tengo mucha sed", next: "no" },
          { txt: "Al final de la jornada", next: "no" }
        ]
      },
      ok: {
        msgs: ["¡Exacto, {nombre}! ✅ La sed ya es una señal de deshidratación. Toma agua *antes* de tenerla."],
        next: "cierre"
      },
      no: {
        msgs: ["¡Ojo! 👀 Cuando sientes mucha sed ya estás algo deshidratado. Lo mejor es tomar agua *antes*, de a poquitos."],
        next: "cierre"
      },
      cierre: {
        msgs: ["🚨 *Señales de alerta:* mareo, dolor de cabeza, piel muy caliente o dejar de sudar. Si las sientes, busca sombra, hidrátate y pide ayuda.", "Cuidarte del calor también es trabajar seguro. ¡Gracias, {nombre}! 💚 — *{remitente}*"]
      }
    }
  },
  matriz: {
    icon: "🗺️",
    nombre: "Matriz de peligros",
    tema: "Identificación de peligros (IPEVR)",
    objetivo: "Cómo diligenciarla, su importancia y qué te permite gestionar",
    duracion: "~2–3 min",
    inicio: "inicio",
    nodes: {
      inicio: {
        msgs: ["¡Hola, {nombre}! 👋 Aquí *{remitente}*.", "La *matriz de peligros* (IPEVR) identifica los peligros de cada tarea y cómo controlarlos. Es obligatoria y es la base de tu SG-SST. 🗺️", "Te la explico en 3 partes: cómo se diligencia, por qué importa y qué te permite lograr."],
        opciones: [
          { txt: "Empecemos 👍", next: "diligencia" }
        ]
      },
      diligencia: {
        msgs: ["✍️ *Cómo se diligencia, paso a paso:*", "1️⃣ Lista tus procesos, actividades y tareas (rutinarias y ocasionales).", "2️⃣ Identifica el peligro de cada tarea: físico, químico, biológico, biomecánico, psicosocial, de seguridad o natural.", "3️⃣ Anota los controles que ya tienes (en la fuente, el medio y la persona).", "4️⃣ Evalúa el riesgo: deficiencia × exposición = probabilidad; × consecuencia = nivel de riesgo.", "5️⃣ Define si el riesgo es aceptable o no y *prioriza* los más altos.", "6️⃣ Define controles en orden: eliminar → sustituir → ingeniería → administrativos → EPP."],
        opciones: [
          { txt: "¿Por qué es importante?", next: "importancia" }
        ]
      },
      importancia: {
        msgs: ["⭐ *Por qué importa:*", "• Es *obligatoria* (Decreto 1072 de 2015) y es la base de todo tu SG-SST.", "• Te muestra dónde están los riesgos *antes* de que ocurra un accidente.", "• Se actualiza *mínimo una vez al año*, o cuando hay cambios, nuevas tareas o un accidente."],
        opciones: [
          { txt: "¿Qué me permite lograr?", next: "gestion" }
        ]
      },
      gestion: {
        msgs: ["🎯 *Qué te permite lograr y gestionar:*", "✔️ Priorizar dónde invertir en prevención.", "✔️ Planear las actividades del año y definir controles y EPP.", "✔️ Cumplir ante la ARL y el Ministerio en una inspección.", "✔️ Reducir accidentes y enfermedades laborales (y sus costos)."],
        next: "quiz"
      },
      quiz: {
        msgs: ["Una pregunta para cerrar 🧠", "¿Cada cuánto debes actualizar tu matriz de peligros como mínimo?"],
        opciones: [
          { txt: "Mínimo una vez al año", next: "ok", correcta: true },
          { txt: "Cada 5 años", next: "no" },
          { txt: "Una vez y basta", next: "no" }
        ]
      },
      ok: {
        msgs: ["¡Exacto, {nombre}! ✅ Mínimo una vez al año, y siempre que haya cambios o un accidente."],
        next: "cierre"
      },
      no: {
        msgs: ["¡Ojo! 👀 Es mínimo una vez al año, y además cada vez que haya cambios o un accidente."],
        next: "cierre"
      },
      cierre: {
        msgs: ["La matriz no es un papel para archivar: es tu *mapa para trabajar seguro*. 🗺️", "¿Quieres una plantilla guía? Responde *MATRIZ* y te la enviamos. 📲", "¡Gracias, {nombre}! — *{remitente}*"]
      }
    }
  },
  estandares: {
    icon: "📋",
    nombre: "Estándares mínimos",
    tema: "Estándares Mínimos · Res. 0312/2019",
    objetivo: "Cuáles te aplican, cómo diligenciarlos y qué logras",
    duracion: "~2–3 min",
    inicio: "inicio",
    nodes: {
      inicio: {
        msgs: ["¡Hola, {nombre}! 👋 Aquí *{remitente}*.", "Los *Estándares Mínimos* (Resolución 0312 de 2019) son los requisitos de tu SG-SST. *Cuántos te aplican* depende de tu número de trabajadores y tu nivel de riesgo. 📋", "Tu *actividad económica* define tu clase de riesgo (de I a V). ¿Cuántos trabajadores tienes?"],
        opciones: [
          { txt: "10 o menos", next: "t10" },
          { txt: "Entre 11 y 50", next: "t50" },
          { txt: "Más de 50", next: "rAlto" }
        ]
      },
      t10: {
        msgs: ["Con *10 o menos* trabajadores depende de tu nivel de riesgo. ¿Cuál es?", "(Una oficina suele ser riesgo I-II; construcción o minería, IV-V.)"],
        opciones: [
          { txt: "Riesgo I, II o III", next: "r10bajo" },
          { txt: "Riesgo IV o V", next: "rAlto" }
        ]
      },
      t50: {
        msgs: ["Con *11 a 50* trabajadores depende de tu nivel de riesgo. ¿Cuál es?", "(Una oficina suele ser riesgo I-II; construcción o minería, IV-V.)"],
        opciones: [
          { txt: "Riesgo I, II o III", next: "r50" },
          { txt: "Riesgo IV o V", next: "rAlto" }
        ]
      },
      r10bajo: {
        msgs: ["Te aplican *7 Estándares Mínimos*. ✅", "Cubren lo esencial: responsable del SG-SST, afiliación a la ARL, capacitación, plan anual de trabajo, evaluaciones médicas, identificación de peligros y medidas de control.", "(Si eres unidad de producción agropecuaria con 10 o menos trabajadores y riesgo I-III, te aplican 3 estándares.)"],
        next: "comoDiligenciar"
      },
      r50: {
        msgs: ["Te aplican *21 Estándares Mínimos*. ✅", "Incluyen lo anterior y más: política y objetivos, investigación de incidentes, indicadores y plan de emergencias."],
        next: "comoDiligenciar"
      },
      rAlto: {
        msgs: ["Te aplican los *60 Estándares Mínimos* (la totalidad), por tu tamaño o tu nivel de riesgo. ✅", "Cubren todo el ciclo PHVA del SG-SST: planear, hacer, verificar y actuar, con auditoría y mejora continua."],
        next: "comoDiligenciar"
      },
      comoDiligenciar: {
        msgs: ["✍️ *Cómo se diligencia:*", "1️⃣ Identifica cuántos estándares te aplican (7, 21 o 60) según tu tamaño y riesgo.", "2️⃣ *Autoevalúate:* marca cada estándar como Cumple / No cumple / No aplica.", "3️⃣ Con los hallazgos, elabora tu *plan de mejoramiento* con responsables y fechas.", "4️⃣ Ejecuta el plan, hazle seguimiento y repite tu *autoevaluación cada año*."],
        next: "logra"
      },
      logra: {
        msgs: ["🎯 *Qué te permite lograr:*", "✔️ Saber qué te exige la ley y evitar *sanciones*.", "✔️ Tener tu SG-SST ordenado y al día ante la ARL y el Ministerio.", "✔️ Proteger mejor a tus trabajadores y reducir accidentes.", "✔️ Mejorar de forma continua con metas claras."],
        next: "quiz"
      },
      quiz: {
        msgs: ["Una pregunta para cerrar 🧠", "¿Qué determina cuántos Estándares Mínimos te aplican?"],
        opciones: [
          { txt: "Mis trabajadores y mi nivel de riesgo", next: "ok", correcta: true },
          { txt: "El tamaño de mi oficina", next: "no" },
          { txt: "Los años de mi empresa", next: "no" }
        ]
      },
      ok: {
        msgs: ["¡Exacto, {nombre}! ✅ El número de trabajadores y la clase de riesgo (que viene de tu actividad económica)."],
        next: "cierre"
      },
      no: {
        msgs: ["¡Casi! 👀 Lo definen tu número de trabajadores y tu clase de riesgo (según tu actividad económica)."],
        next: "cierre"
      },
      cierre: {
        msgs: ["Cumplir no es solo llenar papeles: es construir un trabajo más seguro y evitar multas. 🛡️", "¿Quieres la tabla de autoevaluación? Responde *0312* y te la enviamos. 📲", "¡Gracias, {nombre}! — *{remitente}*"]
      }
    }
  }
};
