// Contenido curado del módulo Comunidad. Los GRUPOS y LUGARES son datos de
// arranque editables; las EXPERIENCIAS de ejemplo están marcadas esEjemplo y
// muestran cómo se verá la comunidad en línea (fase V1.1). Regla inquebrantable
// del módulo: toda experiencia lleva el sello "experiencia personal — no es
// consejo médico" y nada aquí sugiere medicamentos, dosis ni suspender
// tratamientos (§3.3 sigue vigente también en la comunidad).

import type { PublicacionComunidad, RolComunidad } from '@/types/models';

export interface GrupoComunidad {
  clave: string;
  nombre: string;
  emoji: string;
  descripcion: string;
}

export const GRUPOS: GrupoComunidad[] = [
  { clave: 'dia_a_dia', nombre: 'La ELA en el día a día', emoji: '🌻', descripcion: 'Trucos y ánimos entre quienes la viven' },
  { clave: 'alimentacion', nombre: 'Alimentación y deglución', emoji: '🥣', descripcion: 'Comidas que pasan bien y con gusto' },
  { clave: 'comunicacion', nombre: 'Comunicación y voz', emoji: '🗣️', descripcion: 'Apps, banco de voz y señas de casa' },
  { clave: 'movilidad', nombre: 'Movilidad y ayudas', emoji: '🦽', descripcion: 'Sillas, camas, adaptaciones del hogar' },
  { clave: 'cuidadores', nombre: 'Quienes cuidamos', emoji: '💞', descripcion: 'Para el que cuida también hay red' },
  { clave: 'tramites', nombre: 'Trámites y EPS', emoji: '📋', descripcion: 'Rutas, tutelas y papeles, sin enredos' },
];

export const ETIQUETA_ROL: Record<RolComunidad, { etiqueta: string; emoji: string }> = {
  persona: { etiqueta: 'Vive con ELA', emoji: '🌼' },
  cuidador: { etiqueta: 'Cuida a alguien', emoji: '💞' },
  institucion: { etiqueta: 'Institución', emoji: '🏥' },
};

// Experiencias de ejemplo: tono real, cero recomendaciones clínicas directas;
// siempre "a mí me sirvió" + remisión al equipo tratante.
export const EXPERIENCIAS_EJEMPLO: PublicacionComunidad[] = [
  {
    id: 'ej-1',
    fechaHora: '2026-08-20T09:10:00',
    autor: 'Marta, Medellín',
    rolAutor: 'cuidador',
    grupo: 'alimentacion',
    texto:
      'A mi mamá le costaban los líquidos y la fonoaudióloga nos enseñó a espesarlos. Ya se toma su jugo de lulo tranquila. Pregunten por eso en su control.',
    meSirvio: 24,
    esEjemplo: true,
  },
  {
    id: 'ej-2',
    fechaHora: '2026-08-18T16:40:00',
    autor: 'Jorge, Bogotá',
    rolAutor: 'persona',
    grupo: 'comunicacion',
    texto:
      'Grabé mi banco de voz cuando todavía hablaba claro. Hoy mi tablet habla con MI voz y eso no tiene precio. Háganlo temprano, con calma.',
    meSirvio: 41,
    esEjemplo: true,
  },
  {
    id: 'ej-3',
    fechaHora: '2026-08-15T11:05:00',
    autor: 'Rosalba, Cali',
    rolAutor: 'persona',
    grupo: 'dia_a_dia',
    texto:
      'En la Clínica de ELA del HUN nos vieron neuróloga, fono y nutrición la misma mañana. Vale la pena pedir esa ruta por la EPS aunque toque insistir.',
    meSirvio: 33,
    esEjemplo: true,
  },
  {
    id: 'ej-4',
    fechaHora: '2026-08-12T20:30:00',
    autor: 'Fundación de apoyo',
    rolAutor: 'institucion',
    grupo: 'cuidadores',
    texto:
      'Para quien cuida: descansar no es abandonar. Buscar relevo unas horas a la semana sostiene el cuidado en el tiempo. Nuestro voluntariado acompaña.',
    meSirvio: 52,
    esEjemplo: true,
  },
  {
    id: 'ej-5',
    fechaHora: '2026-08-10T08:20:00',
    autor: 'Hernán, Bucaramanga',
    rolAutor: 'persona',
    grupo: 'movilidad',
    texto:
      'La rampa de madera que armó mi yerno con planos de internet me devolvió el patio. A veces la ayuda grande es sencilla.',
    meSirvio: 19,
    esEjemplo: true,
  },
  {
    id: 'ej-6',
    fechaHora: '2026-08-07T14:00:00',
    autor: 'Lucía, Barranquilla',
    rolAutor: 'cuidador',
    grupo: 'tramites',
    texto:
      'La tutela por la silla de ruedas neurológica salió en tres semanas. En ACELA nos guiaron con los papeles paso a paso, gratis.',
    meSirvio: 37,
    esEjemplo: true,
  },
];

export interface LugarComunidad {
  id: string;
  nombre: string;
  tipo: 'clinica' | 'asociacion' | 'red_internacional';
  ciudad?: string;
  pais: string;
  paraQue: string;
  /** Búsqueda en el mapa (nombre + ciudad); si falta, solo web. */
  buscarEnMapa?: string;
  web?: string;
}

// Lugares reales. Solo se incluyen webs verificadas; los teléfonos se piden
// vía EPS/ACELA (no se inventan datos de contacto).
export const LUGARES: LugarComunidad[] = [
  {
    id: 'l-hun',
    nombre: 'Clínica de Excelencia en ELA — Hospital Universitario Nacional',
    tipo: 'clinica',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    paraQue: 'Atención multidisciplinaria de referencia; ruta por su EPS',
    buscarEnMapa: 'Hospital Universitario Nacional de Colombia, Bogotá',
  },
  {
    id: 'l-roosevelt',
    nombre: 'Instituto Roosevelt',
    tipo: 'clinica',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    paraQue: 'Nodo de referencia en rehabilitación',
    buscarEnMapa: 'Instituto Roosevelt, Bogotá',
  },
  {
    id: 'l-acela',
    nombre: 'ACELA — Asociación Colombiana de ELA',
    tipo: 'asociacion',
    pais: 'Colombia',
    paraQue: 'Orientación, voluntariado y compañía en todo el país',
  },
  {
    id: 'l-alsassoc',
    nombre: 'ALS Association',
    tipo: 'asociacion',
    pais: 'Estados Unidos',
    paraQue: 'Información y programas para pacientes y familias (en inglés)',
    web: 'https://www.als.org',
  },
  {
    id: 'l-alianza',
    nombre: 'Alianza Internacional de Asociaciones de ELA/EMN',
    tipo: 'red_internacional',
    pais: 'Mundial',
    paraQue: 'Directorio de asociaciones de ELA país por país',
    web: 'https://www.als-mnd.org',
  },
  {
    id: 'l-tricals',
    nombre: 'TRICALS',
    tipo: 'red_internacional',
    pais: 'Europa',
    paraQue: 'Consorcio de investigación y ensayos clínicos en ELA',
    web: 'https://www.tricals.org',
  },
];

export const ETIQUETA_TIPO_LUGAR: Record<LugarComunidad['tipo'], string> = {
  clinica: '🏥 Clínica',
  asociacion: '🤝 Asociación',
  red_internacional: '🌍 Red internacional',
};
