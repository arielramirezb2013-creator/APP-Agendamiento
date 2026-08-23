// Modelo de datos §8 — fuente de verdad TypeScript.
// Supabase replicará estas estructuras en V1.1.

export type Rol = 'paciente' | 'cuidador';

export interface Llenado {
  por: Rol;
  fecha: string; // ISO
}

export interface Perfil {
  id: string;
  nombre: string;
  tratamiento: 'usted' | 'tu';
  fechaNacimiento?: string;
  notasEtapa?: string; // libre, escrita por cuidador
  appName: string; // "Amanecer" por defecto
  pinHash?: string; // SHA-256 del PIN de 4 dígitos del cuidador
  altoContraste?: boolean; // §10.2 modo alto contraste extra
  diaPeso?: number; // 0=domingo..6=sábado — recordatorio semanal de peso
}

export type Tema =
  | 'emergencia'
  | 'respiracion'
  | 'tragar'
  | 'nutricion'
  | 'moverme'
  | 'animo'
  | 'medicinas'
  | 'tramites'
  | 'otro';

export interface Contacto {
  id: string;
  nombre: string;
  foto?: string;
  telefono: string;
  whatsapp?: string;
  temas: Tema[];
  paraQue: string;
  esEmergencia: boolean;
  orden: number;
}

export type SenalSueno = 'cefalea_matutina' | 'ortopnea' | 'pesadillas' | 'otra';

export interface CheckinDiario {
  id: string;
  fecha: string; // yyyy-mm-dd único
  animo?: 1 | 2 | 3 | 4 | 5;
  dolor?: { nivel: 0 | 1 | 2 | 3; zonas?: string[] };
  respiracion?: 'bien' | 'algo' | 'mucho';
  sueno?: {
    calidad: 'bien' | 'regular' | 'mal';
    senales?: SenalSueno[];
  };
  tragar?: 'no' | 'algo' | 'bastante';
  saliva?: 'no' | 'fina_abundante' | 'espesa';
  fatiga?: 'buena' | 'poca' | 'casi_nada';
  nota?: { texto?: string; audioRef?: string };
  llenado: Llenado;
  banderas: string[]; // ids de reglas disparadas
}

export type TipoEpisodio =
  | 'caida'
  | 'atragantamiento'
  | 'disnea'
  | 'laringoespasmo'
  | 'pseudobulbar'
  | 'crisis_emocional'
  | 'infeccion'
  | 'tos_debil'
  | 'otro';

export interface Episodio {
  id: string;
  tipo: TipoEpisodio;
  cuando: string; // ISO
  severidad: 'leve' | 'moderado' | 'fuerte';
  queHicieron?: string;
  audioRef?: string;
  resueltoEnElMomento: boolean;
  llenado: Llenado;
  banderas: string[];
}

export type MomentoComida = 'desayuno' | 'almuerzo' | 'comida' | 'entre';

export interface Comida {
  id: string;
  fecha: string; // yyyy-mm-dd
  momento: MomentoComida;
  descripcion?: string;
  fotoRef?: string;
  audioRef?: string;
  cantidad: 'todo' | 'mitad' | 'poquito';
  tragando: 'bien' | 'esfuerzo' | 'atoro'; // 'atoro' => crea Episodio vinculado
  texturaDia?: 'normal' | 'blanda' | 'molida' | 'liquidos_espesados';
  episodioVinculadoId?: string;
  llenado: Llenado;
}

export interface Peso {
  id: string;
  fecha: string; // yyyy-mm-dd
  kg: number;
  llenado: Llenado;
}

export interface Medicina {
  id: string;
  nombre: string;
  fotoRef?: string;
  horarios: string[]; // "HH:mm"
  instruccionesDelMedico: string; // texto literal del cuidador — la app jamás sugiere dosis
  tomas: Array<{ fechaHora: string; estado: 'tomada' | 'pospuesta' | 'omitida' }>;
}

export interface Recordatorio {
  id: string;
  tipo: 'medicina' | 'laboratorio' | 'cita' | 'ejercicio' | 'peso' | 'alsfrs';
  titulo: string;
  detalle?: string;
  cron: string; // "HH:mm" diario · "D@HH:mm" semanal (D=0..6) · "fecha ISO" puntual
  activo: boolean;
  plantilla?: 'labs_riluzol'; // precarga editable
  queLlevar?: string; // citas: autocompleta "el Reporte de Control impreso"
}

export interface EventoBandera {
  id: string;
  reglaId: string;
  nivel: 'ambar' | 'roja';
  fechaHora: string; // ISO
  decision?: 'llamo' | 'recordar' | 'ya_hablado' | 'descartada_por_cuidador';
}

export interface NotaVoz {
  id: string;
  fechaHora: string; // ISO
  blob: Blob;
  transcripcion?: string;
  origen: 'checkin' | 'episodio' | 'comida';
}

// "Mi plan" §6.10 — esqueleto en MVP, solo tarjetas informativas del cuidador.
export interface TarjetaPlan {
  id: string;
  titulo: string;
  contenido: string;
  visibleParaPaciente: boolean;
  orden: number;
}

// Umbrales editables por el cuidador (§6.3 / A6).
export interface ConfigUmbrales {
  id: string; // 'default'
  pesoPorcentaje8Sem: number; // 5 (%)
  pesoKg4Sem: number; // 2 (kg)
}
