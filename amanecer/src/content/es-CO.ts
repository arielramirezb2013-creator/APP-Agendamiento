// Todo texto visible de la app vive aquí (§11-i18n, §13 tono de voz).
// Registro: el de una nieta atenta, no el de una enfermera ni el de un banco.
// Colombiano neutro, cálido, breve. Predeterminado "usted"; conmutable a "tú".
// Reglas: máx. 12 palabras por pregunta · nunca "síntoma", "paciente",
// "adherencia" en pantallas de paciente · nunca culpabilizar por días sin
// registrar · humor suave permitido, lástima prohibida.

export type Tratamiento = 'usted' | 'tu';

/** Frase con variante por tratamiento. Si es string, sirve para ambos. */
export type Frase = string | { usted: string; tu: string };

export function t(frase: Frase, trato: Tratamiento): string {
  if (typeof frase === 'string') return frase;
  return trato === 'tu' ? frase.tu : frase.usted;
}

export function interpolar(texto: string, valores: Record<string, string>): string {
  return texto.replace(/\{(\w+)\}/g, (_, k: string) => valores[k] ?? '');
}

export const comun = {
  volver: '‹ Volver',
  pasar: 'Pasar',
  guardar: 'Guardar',
  guardado: 'Guardado ✓',
  deshacer: 'Deshacer',
  listo: 'Listo ✓ Quedó guardado.',
  cancelar: 'Cancelar',
  seguir: 'Seguir',
  llamar: 'Llamar',
  whatsapp: 'WhatsApp',
  si: 'Sí',
  no: 'No',
  errorGuardar: 'No se pudo guardar. Ya lo intento de nuevo; no se perdió nada.',
  errorAudio: {
    usted: 'No se pudo guardar el audio. Vuelva a intentar o escriba la nota.',
    tu: 'No se pudo guardar el audio. Vuelve a intentar o escribe la nota.',
  } as Frase,
  grabarNota: '🎙️ Grabar nota de voz',
  escribir: '⌨️ Escribir',
  detenerGrabacion: 'Detener y guardar',
  grabando: 'Grabando…',
  noGracias: 'No, gracias',
  anotar: 'Anotar',
  comaDecimal: 'coma decimal',
} as const;

export const inicio = {
  buenosDias: 'Buenos días',
  buenasTardes: 'Buenas tardes',
  buenasNoches: 'Buenas noches',
  pregunta: {
    usted: '¿Cómo amaneció hoy?',
    tu: '¿Cómo amaneciste hoy?',
  } as Frase,
  contarle: 'Contarle ›',
  yaConto: {
    usted: 'Hoy ya me contó cómo amaneció. ¡Qué bueno verla!',
    tu: 'Hoy ya me contaste cómo amaneciste. ¡Qué bueno verte!',
  } as Frase,
  volverAContar: 'Cambiar mi respuesta de hoy',
  pasoAlgo: 'Pasó algo',
  miComida: 'Mi comida',
  aQuienLlamo: '¿A quién llamo? 📞',
  recordatoriosHoy: 'Hoy:',
  sinRecordatorios: 'Hoy no hay recordatorios.',
  soyCuidador: 'Soy el cuidador',
} as const;

export const checkin = {
  progreso: 'Pregunta {n}/{total}',
  animo: {
    pregunta: {
      usted: '¿Cómo se siente de ánimo hoy?',
      tu: '¿Cómo te sientes de ánimo hoy?',
    } as Frase,
    opciones: [
      { valor: 1, emoji: '😞', etiqueta: 'Muy triste' },
      { valor: 2, emoji: '😕', etiqueta: 'Triste' },
      { valor: 3, emoji: '😐', etiqueta: 'Más o menos' },
      { valor: 4, emoji: '🙂', etiqueta: 'Bien' },
      { valor: 5, emoji: '😄', etiqueta: 'Muy bien' },
    ],
  },
  dolor: {
    pregunta: {
      usted: '¿Tiene algún dolor hoy?',
      tu: '¿Tienes algún dolor hoy?',
    } as Frase,
    opciones: [
      { valor: 0, etiqueta: 'No' },
      { valor: 1, etiqueta: 'Un poco' },
      { valor: 2, etiqueta: 'Bastante' },
      { valor: 3, etiqueta: 'Mucho' },
    ],
    donde: '¿Dónde le duele?',
    dondeTu: '¿Dónde te duele?',
    zonas: ['Cabeza', 'Cuello', 'Hombros', 'Brazos', 'Espalda', 'Piernas', 'Otro'],
    listoZonas: 'Ya marqué dónde',
  },
  respiracion: {
    pregunta: {
      usted: '¿Cómo siente la respiración?',
      tu: '¿Cómo sientes la respiración?',
    } as Frase,
    opciones: [
      { valor: 'bien', etiqueta: 'Bien', emoji: '😊' },
      { valor: 'algo', etiqueta: 'Me falta un poco el aire', emoji: '😮‍💨' },
      { valor: 'mucho', etiqueta: 'Me falta mucho el aire', emoji: '😰' },
    ],
    confirmarAhora: {
      usted: '¿Le está pasando en este momento?',
      tu: '¿Te está pasando en este momento?',
    } as Frase,
    ahoraSi: 'Sí, ahora mismo',
    ahoraNo: 'No, ya pasó',
  },
  sueno: {
    pregunta: {
      usted: '¿Cómo durmió anoche?',
      tu: '¿Cómo dormiste anoche?',
    } as Frase,
    opciones: [
      { valor: 'bien', etiqueta: 'Bien', emoji: '😴' },
      { valor: 'regular', etiqueta: 'Regular', emoji: '😕' },
      { valor: 'mal', etiqueta: 'Mal', emoji: '😣' },
    ],
    quePaso: '¿Qué pasó?',
    puedeMarcarVarias: 'Puede marcar varias',
    puedeMarcarVariasTu: 'Puedes marcar varias',
    senales: [
      // Cefalea matutina y ortopnea = señales NICE Tabla 1 → alimentan bandera ámbar (§2.2-2)
      { valor: 'cefalea_matutina', etiqueta: 'Me desperté con dolor de cabeza' },
      { valor: 'ortopnea', etiqueta: 'Me faltaba el aire acostada' },
      { valor: 'pesadillas', etiqueta: 'Pesadillas o sueño intranquilo' },
      { valor: 'otra', etiqueta: 'Otra cosa' },
    ],
    listoSenales: 'Ya está',
  },
  tragar: {
    pregunta: {
      usted: '¿Le costó pasar la comida o la bebida hoy?',
      tu: '¿Te costó pasar la comida o la bebida hoy?',
    } as Frase,
    opciones: [
      { valor: 'no', etiqueta: 'No' },
      { valor: 'algo', etiqueta: 'Un poco' },
      { valor: 'bastante', etiqueta: 'Sí, bastante' },
    ],
  },
  saliva: {
    // Volumen y viscosidad son cosas distintas y el tratamiento difiere (§2.2-4, MND Assoc.)
    pregunta: {
      usted: '¿La saliva le molestó hoy?',
      tu: '¿La saliva te molestó hoy?',
    } as Frase,
    opciones: [
      { valor: 'no', etiqueta: 'No' },
      { valor: 'fina_abundante', etiqueta: 'Mucha y líquida' },
      { valor: 'espesa', etiqueta: 'Espesa y pegajosa' },
    ],
  },
  fatiga: {
    pregunta: {
      usted: '¿Cuánta energía tuvo hoy?',
      tu: '¿Cuánta energía tuviste hoy?',
    } as Frase,
    opciones: [
      { valor: 'buena', etiqueta: 'Buena', emoji: '⚡' },
      { valor: 'poca', etiqueta: 'Poca', emoji: '🔅' },
      { valor: 'casi_nada', etiqueta: 'Casi nada', emoji: '🪫' },
    ],
  },
  nota: {
    pregunta: {
      usted: '¿Quiere contar algo más?',
      tu: '¿Quieres contar algo más?',
    } as Frase,
    placeholder: {
      usted: 'Escriba aquí lo que quiera contar…',
      tu: 'Escribe aquí lo que quieras contar…',
    } as Frase,
  },
  cierre: {
    usted: 'Listo, {nombre} ✓ Gracias por contarme. Que tenga un lindo día.',
    tu: 'Listo, {nombre} ✓ Gracias por contarme. Que tengas un lindo día.',
  } as Frase,
  volverInicio: 'Volver al inicio',
} as const;

export const episodios = {
  titulo: 'Pasó algo',
  quePaso: '¿Qué pasó?',
  cuando: '¿Cuándo pasó?',
  cuandoOpciones: [
    { valor: 'ahora', etiqueta: 'Ahora' },
    { valor: 'hoy', etiqueta: 'Hoy más temprano' },
    { valor: 'otro', etiqueta: 'Otro día' },
  ],
  elegirDia: '¿Qué día fue?',
  ayer: 'Ayer',
  anteayer: 'Anteayer',
  haceUnosDias: 'Hace unos días',
  queTanFuerte: '¿Qué tan fuerte fue?',
  severidad: [
    { valor: 'leve', etiqueta: 'Leve' },
    { valor: 'moderado', etiqueta: 'Moderado' },
    { valor: 'fuerte', etiqueta: 'Fuerte' },
  ],
  queHicieron: '¿Qué hicieron?',
  queHicieronDetalle: {
    usted: 'Puede contarlo con voz o por escrito. También puede pasar.',
    tu: 'Puedes contarlo con voz o por escrito. También puedes pasar.',
  } as Frase,
  sigueAtorada: {
    usted: '¿Ya pasó o sigue atorada?',
    tu: '¿Ya pasó o sigues atorada?',
  } as Frase,
  yaPaso: 'Ya pasó',
  sigue: 'Sigue',
  guardadoEpisodio: 'Quedó guardado ✓',
} as const;

export const comidas = {
  titulo: 'Mi comida',
  momento: '¿Qué comida es?',
  momentos: [
    { valor: 'desayuno', etiqueta: 'Desayuno', emoji: '🍳' },
    { valor: 'almuerzo', etiqueta: 'Almuerzo', emoji: '🍲' },
    { valor: 'comida', etiqueta: 'Comida', emoji: '🥣' },
    { valor: 'entre', etiqueta: 'Entre comidas', emoji: '🍌' },
  ],
  queComio: {
    usted: '¿Qué comió?',
    tu: '¿Qué comiste?',
  } as Frase,
  queComioDetalle: {
    usted: 'Puede contarlo con voz, con foto o por escrito.',
    tu: 'Puedes contarlo con voz, con foto o por escrito.',
  } as Frase,
  foto: '📷 Tomar foto',
  fotoAlt: 'Foto de la comida',
  atoroEpisodioConDescripcion: 'Comiendo: {descripcion}',
  atoroEpisodioSinDescripcion: 'Durante la comida',
  cuanto: {
    usted: '¿Cuánto se comió?',
    tu: '¿Cuánto te comiste?',
  } as Frase,
  cantidades: [
    { valor: 'todo', etiqueta: 'Todo' },
    { valor: 'mitad', etiqueta: 'La mitad' },
    { valor: 'poquito', etiqueta: 'Poquito' },
  ],
  comoTragando: {
    usted: '¿Cómo le fue tragando?',
    tu: '¿Cómo te fue tragando?',
  } as Frase,
  tragando: [
    { valor: 'bien', etiqueta: 'Bien' },
    { valor: 'esfuerzo', etiqueta: 'Con esfuerzo' },
    { valor: 'atoro', etiqueta: 'Se atoró' },
  ],
  atoroNota: 'Qué susto. Lo anoté también como episodio, para que el equipo lo vea.',
  vacio: 'Todavía no hay comidas hoy. Cuando quiera, me cuenta.',
  vacioTu: 'Todavía no hay comidas hoy. Cuando quieras, me cuentas.',
  registradasHoy: 'Hoy:',
  peso: {
    titulo: 'Mi peso',
    pregunta: {
      usted: '¿Cuánto pesó hoy?',
      tu: '¿Cuánto pesaste hoy?',
    } as Frase,
    kg: 'kilos',
    borrar: 'Borrar',
    tendencia: 'Su peso en las últimas 8 semanas',
    tendenciaTu: 'Tu peso en las últimas 8 semanas',
    estable: 'Estable ✓',
    haBajado: 'Ha bajado — vale la pena comentárselo a {contacto}',
    registrar: 'Anotar mi peso',
    sinDatos: 'Aún no hay pesos anotados.',
    fueraDeRango: {
      usted: 'Ese número no parece un peso. Revíselo y vuelva a intentar.',
      tu: 'Ese número no parece un peso. Revísalo y vuelve a intentar.',
    } as Frase,
  },
} as const;

export const directorio = {
  titulo: '¿A quién llamo?',
  emergencia: 'EMERGENCIA',
  llamar123: 'Llamar 123 ▶',
  sos: 'SOS — Necesito ayuda ya',
  paraQue: '¿Para qué la llamo?',
  sinContactos: 'El cuidador aún no ha cargado contactos aquí.',
  temas: {
    emergencia: { etiqueta: 'Emergencia', emoji: '🚨' },
    respiracion: { etiqueta: 'Respirar', emoji: '😮‍💨' },
    tragar: { etiqueta: 'Comer y tragar', emoji: '🍲' },
    nutricion: { etiqueta: 'Alimentación', emoji: '🥗' },
    moverme: { etiqueta: 'Moverme', emoji: '🚶‍♀️' },
    animo: { etiqueta: 'Ánimo', emoji: '💙' },
    medicinas: { etiqueta: 'Mis medicinas', emoji: '💊' },
    tramites: { etiqueta: 'Trámites de la EPS', emoji: '📋' },
    otro: { etiqueta: 'Otro', emoji: '📞' },
  } as Record<string, { etiqueta: string; emoji: string }>,
} as const;

export const banderas = {
  roja: {
    titulo: '🚨 ESTO ES URGENTE',
    subtitulo: 'Vamos a pedir ayuda ya.',
    llamar123: '📞 LLAMAR 123',
    llamarContacto: '📞 Llamar a {contacto}',
    yaEstoyBien: 'Ya estoy bien',
    registrada: 'La alerta quedó anotada para el equipo.',
    botonUrgencia: 'Es una urgencia — pedir ayuda',
  },
  ambar: {
    titulo: 'Algo para comentar',
    llamamos: '¿La llamamos?',
    llamarA: '📞 Llamar a {contacto}',
    recordarManana: 'Recordármelo mañana',
    yaHablamos: 'Ya lo hablamos',
    sinContacto: 'Coméntelo en su próximo control. Quedó anotado para el reporte.',
  },
} as const;

export const recordatorios = {
  titulo: 'Mis recuerdos de hoy',
  pastilla: '💊 {hora} — {nombre}',
  yaLaTome: 'Ya la tomé ✓',
  masTarde: 'Más tarde',
  cita: '📅 {titulo}',
  laboratorio: '🧪 {titulo}',
  pesoSemanal: '⚖️ Hoy toca anotar el peso',
  ejercicio: '🤸 {titulo}',
  anotarPeso: 'Anotar el peso',
  // Voz de casa en la notificación del sistema (§6.6).
  notificacionPastilla: {
    usted: '{nombre}, es hora de su pastilla de las {hora}: {medicina}',
    tu: '{nombre}, es hora de tu pastilla de las {hora}: {medicina}',
  } as Frase,
  labsTituloMes: 'Laboratorio de riluzol (mes {n})',
  labsTituloTrimestral: 'Laboratorio de riluzol (trimestral)',
  labsTituloAnual: 'Laboratorio de riluzol (anual)',
  labsDisclaimer: 'Esquema orientativo de guía; confirme fechas con su médico tratante.',
} as const;

export const cuidador = {
  titulo: 'Modo cuidador',
  pin: {
    ingrese: 'Ingrese el PIN de cuidador',
    crear: 'Cree un PIN de 4 dígitos para el modo cuidador',
    confirmar: 'Repita el PIN para confirmar',
    error: 'PIN incorrecto. Intente de nuevo.',
    noCoincide: 'Los PIN no coinciden. Empecemos de nuevo.',
    borrar: 'Borrar',
  },
  bienvenida: {
    titulo: 'Configuración inicial',
    intro:
      'Bienvenido. Este espacio es para quien cuida y administra la app. Aquí se configura todo; ella nunca tendrá que hacerlo.',
    nombreLabel: '¿Cómo se llama ella? (así la saludará la app)',
    tratamientoLabel: '¿Cómo prefiere que le hable la app?',
    usted: 'De "usted"',
    tu: 'De "tú"',
    empezar: 'Guardar y empezar',
  },
  panel: {
    titulo: 'Panel de la semana',
    checkins: 'Registros del día a día',
    banderasPendientes: 'Alertas para revisar',
    sinBanderas: 'Sin alertas pendientes esta semana.',
    verRegistros: 'Ver registros',
    contactos: 'Contactos',
    medicinas: 'Medicinas y recordatorios',
    reporte: 'Preparar reporte para la cita',
    ajustes: 'Ajustes',
    miPlan: 'Mi plan',
    salir: 'Salir del modo cuidador',
    llenarPorElla: 'Llenar el registro de hoy por ella',
    dias: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    marcarRevisada: 'Marcar como revisada',
  },
  registros: {
    titulo: 'Registros',
    editar: 'Corregir',
    llenadoPor: { paciente: 'Llenado por ella', cuidador: 'Llenado por el cuidador' },
    sinRegistros: 'No hay registros en este periodo.',
  },
  contactos: {
    titulo: 'Contactos',
    nuevo: 'Agregar contacto',
    nombre: 'Nombre',
    telefono: 'Teléfono',
    whatsappOpc: 'WhatsApp (opcional)',
    paraQue: '¿Para qué se le llama? (una línea)',
    temas: 'Temas',
    esEmergencia: 'Es el contacto de emergencia',
    guardar: 'Guardar contacto',
    eliminar: 'Eliminar',
    precargaNota: 'Sugerencias precargadas para Colombia: 123 y ACELA. Edítelas o elimínelas.',
  },
  medicinas: {
    titulo: 'Medicinas y recordatorios',
    nueva: 'Agregar medicina',
    nombre: 'Nombre de la medicina',
    horarios: 'Horarios (ej. 08:00, 20:00)',
    instrucciones: 'Instrucciones del médico (texto literal)',
    instruccionesNota:
      'La app mostrará este texto tal cual. Nunca sugiere ni calcula dosis.',
    historial: 'Historial de tomas',
    labsRiluzol: 'Plantilla: laboratorios de riluzol',
    labsRiluzolDetalle:
      'Esquema orientativo de guía: mensual los primeros 3 meses, luego trimestral el primer año, luego anual. Confirme fechas con su médico tratante.',
    activarPlantilla: 'Activar plantilla',
    plantillaActivada: 'Plantilla activada ✓ Revise las fechas.',
    citas: 'Citas',
    nuevaCita: 'Agregar cita',
    tituloCita: 'Con quién / dónde',
    fechaHora: 'Fecha y hora',
    queLlevar: 'Qué llevar',
    queLlevarDefecto: 'El Reporte de Control impreso',
    eliminar: 'Eliminar',
    guardar: 'Guardar',
  },
  reporte: {
    titulo: 'Reporte de Control',
    intro:
      'Resumen de las últimas semanas para llevar a la cita. Pensado para que el equipo lo lea en 90 segundos.',
    periodo: 'Periodo: últimas {semanas} semanas',
    generar: 'Preparar reporte para la cita',
    generando: 'Preparando el reporte…',
    listo: 'Reporte listo ✓ Se descargó el PDF.',
  },
  ajustes: {
    titulo: 'Ajustes',
    nombre: 'Nombre de ella',
    appName: 'Nombre de la app',
    tratamiento: 'Tratamiento',
    altoContraste: 'Alto contraste extra',
    cambiarPin: 'Cambiar PIN',
    diaPeso: 'Día del recordatorio de peso',
    exportar: 'Exportar todo (respaldo cifrado)',
    exportarPass: 'Contraseña para cifrar el respaldo',
    importar: 'Restaurar desde respaldo',
    borrarTodo: 'Borrar todo',
    borrarConfirmar:
      'Esto borra TODOS los registros de este aparato y no se puede deshacer. ¿Seguro?',
    borrarConfirmar2: 'Escriba el PIN para confirmar el borrado.',
    borrado: 'Todo fue borrado.',
    acercaDe:
      'Amanecer es una bitácora personal de apoyo. No es un dispositivo médico ni reemplaza la valoración de su equipo de salud.',
  },
  checklist: {
    titulo: 'Señales urgentes',
    intro: '¿Está viendo alguna de estas señales en este momento?',
    opciones: [
      // Rojas (R5): urgencia inmediata.
      { valor: 'cianosis', etiqueta: 'Labios o cara morados' },
      { valor: 'confusion', etiqueta: 'Confusión o somnolencia marcada' },
      { valor: 'no_habla_no_respira', etiqueta: 'No puede hablar ni respirar' },
      // Ámbar: rutas de consulta (A4, A3, A9).
      { valor: 'tos_debil', etiqueta: 'Tos débil que no saca la flema' },
      { valor: 'somnolencia_diurna', etiqueta: 'Somnolencia durante el día' },
      { valor: 'tropiezos', etiqueta: 'Tropiezos al caminar' },
    ],
    ninguna: 'Ninguna de estas',
  },
  miPlan: {
    titulo: 'Mi plan',
    intro:
      'Tarjetas informativas para la familia y cuidadores suplentes: kit por si acaso, voluntad anticipada, hospital preferido, instrucciones.',
    nueva: 'Agregar tarjeta',
    tituloCampo: 'Título',
    contenidoCampo: 'Contenido',
    visiblePaciente: 'Ella puede verla',
    vacio: 'Aún no hay tarjetas. El cuidador las escribe con el equipo tratante.',
  },
} as const;

export const reporte = {
  // Términos clínicos permitidos aquí (§3.2): este documento es para el equipo médico.
  titulo: 'Reporte de Control — {app}',
  encabezado: '{nombre} · Periodo: {desde} a {hasta}',
  advertencia:
    'Registro de autorreporte generado por la app {app} — no es un documento clínico.',
  peso: 'Tendencia de peso (kg)',
  animo: 'Resumen de ánimo (1=muy triste, 5=muy bien)',
  animoResumen:
    'Días registrados: {dias} · promedio {promedio}/5 · días con ánimo bajo (≤2): {bajos}',
  medicacion: 'Adherencia a medicación',
  medicacionLinea:
    '{nombre} ({horarios}): {tomadas} tomas confirmadas ({pct}% de las programadas desde {desde})',
  medicacionSinTomas: '{nombre} ({horarios}): sin registros de toma en el periodo',
  pesoUmbralCruzado: '⚠ Pérdida de peso que cruza el umbral configurado ({umbral}).',
  umbralKg4Sem: '≥{kg} kg en 4 semanas',
  umbralPct8Sem: '≥{pct}% en 8 semanas',
  episodios: 'Episodios',
  episodiosCols: ['Fecha', 'Tipo', 'Severidad', 'Qué se hizo'],
  senalesRespiratorias: 'Señales respiratorias reportadas',
  diasOrtopnea: 'Días con ortopnea (disnea en decúbito): {n}',
  diasCefalea: 'Días con cefalea matutina: {n}',
  diasSuenoMalo: 'Días con sueño no reparador: {n}',
  deglucion: 'Dificultades de deglución',
  comidasEsfuerzo: 'Comidas "con esfuerzo": {n}',
  comidasAtoro: 'Comidas con atragantamiento: {n}',
  diasDisfagia: 'Días con disfagia reportada en el registro diario: {n}',
  saliva: 'Sialorrea',
  salivaFina: 'Días con saliva fina y abundante: {n}',
  salivaEspesa: 'Días con saliva espesa: {n}',
  dolorTitulo: 'Dolor',
  diasDolor: 'Días con dolor moderado o intenso: {n}',
  banderasTitulo: 'Alertas del periodo (motor de reglas orientativo)',
  notas: 'Notas destacadas',
  sinDatos: 'Sin datos en el periodo.',
  pie: 'Elaborado para el control multidisciplinario. Frecuencia sugerida por guías: cada 2-3 meses (NICE NG42).',
  tiposEpisodio: {
    caida: 'Caída',
    atragantamiento: 'Atragantamiento',
    disnea: 'Disnea intensa',
    laringoespasmo: 'Laringoespasmo',
    pseudobulbar: 'Labilidad emocional (afecto pseudobulbar)',
    crisis_emocional: 'Crisis emocional',
    infeccion: 'Fiebre / infección respiratoria',
    tos_debil: 'Tos débil / ineficaz',
    otro: 'Otro',
  } as Record<string, string>,
} as const;

export const etiquetasEpisodio: Record<
  string,
  { etiqueta: string; emoji: string }
> = {
  caida: { etiqueta: 'Caída', emoji: '🤕' },
  atragantamiento: { etiqueta: 'Atragantamiento', emoji: '😵' },
  disnea: { etiqueta: 'Falta de aire fuerte', emoji: '😰' },
  laringoespasmo: { etiqueta: 'Espasmo en la garganta', emoji: '😖' },
  pseudobulbar: { etiqueta: 'Llanto o risa sin control', emoji: '🥲' },
  crisis_emocional: { etiqueta: 'Crisis de tristeza o angustia', emoji: '💔' },
  infeccion: { etiqueta: 'Fiebre o gripa', emoji: '🤒' },
  tos_debil: { etiqueta: 'Tos que no saca la flema', emoji: '😮‍💨' },
  otro: { etiqueta: 'Otra cosa', emoji: '📝' },
};

// Copy de reglas ámbar (§7.3) — patrón: cercano, sin tecnicismos, sin miedo.
// {contacto} se reemplaza por el nombre del contacto mapeado al tema.
export const copyReglas: Record<string, Frase> = {
  A1: {
    usted:
      'Ha amanecido con dolor de cabeza varios días. A veces eso tiene que ver con cómo se respira de noche, y su especialista sabe qué revisar. ¿Le avisamos a {contacto}?',
    tu: 'Has amanecido con dolor de cabeza varios días. A veces eso tiene que ver con cómo se respira de noche, y tu especialista sabe qué revisar. ¿Le avisamos a {contacto}?',
  },
  A2: {
    usted:
      'Anoche le faltó el aire estando acostada. Eso vale la pena contárselo pronto a {contacto}. ¿La llamamos?',
    tu: 'Anoche te faltó el aire estando acostada. Eso vale la pena contárselo pronto a {contacto}. ¿La llamamos?',
  },
  A3: {
    usted:
      'Lleva varias noches durmiendo mal. Su equipo sabe qué revisar para que descanse mejor. ¿Le avisamos a {contacto}?',
    tu: 'Llevas varias noches durmiendo mal. Tu equipo sabe qué revisar para que descanses mejor. ¿Le avisamos a {contacto}?',
  },
  A4: 'Esa tos que no logra sacar la flema tiene ayuda. ¿Le avisamos a {contacto}?',
  A5: {
    usted:
      'La comida ha costado más estos días. {contacto} sabe cómo hacerla más fácil y segura. ¿La llamamos?',
    tu: 'La comida ha costado más estos días. {contacto} sabe cómo hacerla más fácil y segura. ¿La llamamos?',
  },
  A6: 'El peso ha bajado un poquito estas semanas. Vale la pena comentárselo a {contacto}. ¿La llamamos?',
  A7: 'La saliva espesa lleva varios días molestando. Eso tiene manejo. ¿Le contamos a {contacto}?',
  A8: 'El dolor ha estado presente varios días. No hay que aguantarlo. ¿Le avisamos a {contacto}?',
  A9: {
    usted:
      'Van dos tropiezos en poco tiempo. {contacto} puede ayudar a que se mueva con más seguridad. ¿La llamamos?',
    tu: 'Van dos tropiezos en poco tiempo. {contacto} puede ayudar a que te muevas con más seguridad. ¿La llamamos?',
  },
  A10: {
    usted:
      'La he notado triste estos días. ¿Quiere que llamemos a {contacto}? También puede contárselo a su familia.',
    tu: 'Te he notado triste estos días. ¿Quieres que llamemos a {contacto}? También puedes contárselo a tu familia.',
  },
  A11: {
    usted:
      'Ese llanto o risa que llega sin avisar se ha repetido. Su médico sabe de esto y tiene manejo. ¿Le avisamos a {contacto}?',
    tu: 'Ese llanto o risa que llega sin avisar se ha repetido. Tu médico sabe de esto y tiene manejo. ¿Le avisamos a {contacto}?',
  },
  A12: 'Con gripa o fiebre, y más si la respiración cambia, conviene consultar temprano. ¿Le avisamos a {contacto}?',
};

export const texturas = [
  { valor: 'normal', etiqueta: 'Normal' },
  { valor: 'blanda', etiqueta: 'Blanda' },
  { valor: 'molida', etiqueta: 'Molida' },
  { valor: 'liquidos_espesados', etiqueta: 'Líquidos espesados' },
] as const;
