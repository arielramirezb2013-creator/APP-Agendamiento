// ALSFRS-R autoadministrada (§6.4) — mapa 1:1 con la escala oficial.
// Cada ítem lleva el texto clínico en comentario; en pantalla solo va el
// lenguaje de casa. Puntuación 4 (mejor) → 0. El cuidador puede pedir a su
// neurólogo la verificación final del wording (CA §6.4).
// Subescalas (Mehdipour 2023): bulbar 1-3 (/12) · motora 4-9 (/24) ·
// respiratoria 10-12 (/12). SIEMPRE se presentan como perfil, nunca un
// único número protagonista.

export interface ItemAlsfrs {
  /** Dominio para la subescala. */
  dominio: 'bulbar' | 'motora' | 'respiratoria';
  pregunta: string;
  /** 5 opciones en orden 4 → 0. */
  opciones: [string, string, string, string, string];
}

export const ITEMS_ALSFRS: ItemAlsfrs[] = [
  {
    // Ítem 1 — Speech (Lenguaje)
    dominio: 'bulbar',
    pregunta: '¿Cómo está su forma de hablar?',
    opciones: [
      'Hablo normal', // 4: Procesos del habla normales
      'Se me nota algún cambio al hablar', // 3: Alteración detectable
      'Me entienden si repito las cosas', // 2: Inteligible con repeticiones
      'Combino la voz con señas o escritura', // 1: Voz + comunicación no verbal
      'Ya no puedo comunicarme con la voz', // 0: Pérdida del habla útil
    ],
  },
  {
    // Ítem 2 — Salivation (Salivación)
    dominio: 'bulbar',
    pregunta: '¿Cómo está la saliva?',
    opciones: [
      'Normal', // 4
      'Un poco más de saliva, sin que se salga', // 3: Exceso leve, puede haber babeo nocturno
      'A veces se me sale un poquito', // 2: Exceso moderado, babeo mínimo
      'Bastante saliva y algo de babeo', // 1: Exceso marcado con babeo
      'Se me sale constantemente', // 0: Babeo marcado
    ],
  },
  {
    // Ítem 3 — Swallowing (Deglución)
    dominio: 'bulbar',
    pregunta: '¿Cómo le va tragando la comida?',
    opciones: [
      'Como de todo, normal', // 4: Hábitos normales
      'A veces me atoro un poquito', // 3: Problemas tempranos, atoros ocasionales
      'Me cambiaron la consistencia de la comida', // 2: Cambios de consistencia
      'Necesito complemento por sonda', // 1: Alimentación por sonda suplementaria
      'Ya no como por la boca', // 0: Nada por vía oral
    ],
  },
  {
    // Ítem 4 — Handwriting (Escritura)
    dominio: 'motora',
    pregunta: '¿Cómo le va escribiendo a mano?',
    opciones: [
      'Escribo normal', // 4
      'Escribo más despacio o con letra distinta', // 3: Lenta o descuidada, legible
      'No toda mi letra se entiende', // 2: No todas las palabras legibles
      'Puedo agarrar el lapicero pero no escribir', // 1: Sujeta el lápiz, no escribe
      'No puedo agarrar el lapicero', // 0: No puede sujetarlo
    ],
  },
  {
    // Ítem 5 — Cutting food and handling utensils (sin gastrostomía)
    dominio: 'motora',
    pregunta: '¿Cómo le va con los cubiertos y partiendo la comida?',
    opciones: [
      'Normal', // 4
      'Más despacio y con torpeza, pero sola', // 3: Lento y torpe, sin ayuda
      'Puedo cortar casi todo, con algo de ayuda', // 2: Corta la mayoría, necesita algo de ayuda
      'Me cortan la comida, yo como despacio', // 1: Otros cortan; aún se alimenta despacio
      'Me tienen que dar la comida', // 0: Debe ser alimentada
    ],
  },
  {
    // Ítem 6 — Dressing and hygiene (Vestido e higiene)
    dominio: 'motora',
    pregunta: '¿Cómo le va vistiéndose y arreglándose?',
    opciones: [
      'Me arreglo sola, normal', // 4: Función normal
      'Me arreglo sola pero con esfuerzo', // 3: Independiente con esfuerzo o menor eficiencia
      'Necesito ayuda en algunas cosas', // 2: Asistencia intermitente
      'Necesito ayuda para casi todo', // 1: Asistencia para la mayoría
      'Dependo totalmente de otra persona', // 0: Dependencia total
    ],
  },
  {
    // Ítem 7 — Turning in bed and adjusting bed clothes (Girar en la cama)
    dominio: 'motora',
    pregunta: '¿Cómo le va volteándose en la cama y acomodando las cobijas?',
    opciones: [
      'Normal', // 4
      'Más despacio y con torpeza, pero sola', // 3: Lento y torpe
      'Puedo voltearme sola con mucha dificultad', // 2: Puede sola con gran dificultad
      'Empiezo a voltearme pero no termino sola', // 1: Inicia sin lograrlo sola
      'No puedo voltearme sin ayuda', // 0: Incapaz sin ayuda
    ],
  },
  {
    // Ítem 8 — Walking (Caminar)
    dominio: 'motora',
    pregunta: '¿Cómo le va caminando?',
    opciones: [
      'Camino normal', // 4
      'Camino, pero me cuesta un poco más', // 3: Dificultad temprana para deambular
      'Camino con ayuda o con apoyo', // 2: Camina con asistencia
      'Me muevo, pero ya no logro caminar', // 1: Movimiento funcional sin marcha
      'No puedo mover las piernas a propósito', // 0: Sin movimiento voluntario útil
    ],
  },
  {
    // Ítem 9 — Climbing stairs (Subir escaleras)
    dominio: 'motora',
    pregunta: '¿Cómo le va subiendo escaleras?',
    opciones: [
      'Normal', // 4
      'Más despacio', // 3: Lenta
      'Con cansancio o inestabilidad, a veces me apoyo', // 2: Fatiga leve o inestabilidad
      'Solo con ayuda', // 1: Necesita asistencia
      'No puedo subirlas', // 0: No puede
    ],
  },
  {
    // Ítem 10 — Dyspnea (Disnea)
    dominio: 'respiratoria',
    pregunta: '¿Cuándo le falta el aire?',
    opciones: [
      'No me falta el aire', // 4: Sin disnea
      'Al caminar', // 3: Al caminar
      'Al comer, bañarme o vestirme', // 2: En actividades básicas
      'Incluso quieta, sentada o acostada', // 1: En reposo
      'Me falta tanto que se piensa en apoyo de máquina', // 0: Dificultad importante, se considera soporte ventilatorio
    ],
  },
  {
    // Ítem 11 — Orthopnea (Ortopnea)
    dominio: 'respiratoria',
    pregunta: '¿Puede dormir acostada sin que le falte el aire?',
    opciones: [
      'Duermo normal', // 4: Sin ortopnea
      'A veces me cuesta respirar acostada, sin necesitar más almohadas', // 3: Alguna dificultad, no rutinaria
      'Necesito más de dos almohadas para dormir', // 2: Necesita >2 almohadas
      'Solo puedo dormir sentada', // 1: Solo duerme sentada
      'No logro dormir por la falta de aire', // 0: Incapaz de dormir por disnea
    ],
  },
  {
    // Ítem 12 — Respiratory insufficiency (Insuficiencia respiratoria)
    dominio: 'respiratoria',
    pregunta: '¿Usa algún aparato para ayudarse a respirar?',
    opciones: [
      'No uso ningún aparato', // 4: Sin apoyo
      'Uso el aparato (BiPAP) a ratos', // 3: BiPAP intermitente
      'Uso el aparato todas las noches', // 2: BiPAP continuo nocturno
      'Uso el aparato de día y de noche', // 1: BiPAP continuo día y noche
      'Respiro con ventilación por traqueostomía', // 0: Ventilación mecánica invasiva
    ],
  },
];

export const MAXIMOS_SUBESCALA = { bulbar: 12, motora: 24, respiratoria: 12 } as const;

export function calcularSubescalas(items: number[]): {
  bulbar: number;
  motora: number;
  respiratoria: number;
  total: number;
} {
  const suma = (desde: number, hasta: number) =>
    items.slice(desde, hasta).reduce((a, b) => a + Math.max(0, b), 0);
  const bulbar = suma(0, 3);
  const motora = suma(3, 9);
  const respiratoria = suma(9, 12);
  return { bulbar, motora, respiratoria, total: bulbar + motora + respiratoria };
}
