// Microcopy de contención por tipo de episodio (§6.2) — diccionario editable.
// Aparece tras guardar. Tono §13: calma, sin tecnicismos, sin alarmar.
// Trazabilidad clínica en comentarios (§2).

import type { TipoEpisodio } from '@/types/models';

export interface MicrocopyEpisodio {
  /** Mensaje de calma tras guardar. {contacto} se reemplaza por el contacto del tema. */
  mensaje: string;
  /** Tema del directorio al que se ofrece llamar, si aplica. */
  contactoTema?: 'respiracion' | 'tragar' | 'moverme' | 'animo' | 'medicinas';
  /** Si true se muestra además el botón rojo de urgencia visible. */
  botonRojoVisible?: boolean;
  /** Pregunta de seguimiento antes de guardar (para evaluar bandera roja). */
  preguntaSigue?: boolean;
}

export const microcopyEpisodios: Record<TipoEpisodio, MicrocopyEpisodio> = {
  atragantamiento: {
    // Base: MND Association — la muerte por atragantamiento es "excepcional" (§2.2-5).
    mensaje:
      'Qué susto. Respire tranquila: estos episodios casi nunca son peligrosos, pero si se repiten vale la pena contárselo a {contacto}. ¿La llamamos?',
    contactoTema: 'tragar',
    preguntaSigue: true,
  },
  laringoespasmo: {
    // Base: MND Association — el laringoespasmo "suele resolverse con el tiempo" (§2.2-6).
    mensaje:
      'Estos espasmos asustan mucho pero suelen pasar solos en poco tiempo. Si no cede o no puede respirar, es una urgencia.',
    botonRojoVisible: true,
  },
  disnea: {
    // "Falta de aire fuerte" con cuándo = Ahora salta directo a bandera roja (R2).
    mensaje:
      'Quedó anotado. Si vuelve a sentir mucha falta de aire, avíseme de una vez: ese botón siempre está aquí.',
    contactoTema: 'respiracion',
    botonRojoVisible: true,
  },
  caida: {
    mensaje:
      'Lo importante es que ya está registrado. Si hay dolor fuerte o golpe en la cabeza, mejor consultar hoy mismo.',
    contactoTema: 'moverme',
  },
  pseudobulbar: {
    // Afecto pseudobulbar (MND Assoc.) — nunca se usa la etiqueta clínica en pantalla.
    mensaje:
      'Ese llanto o risa que llega sin avisar es más común de lo que parece y tiene manejo. Su médico sabe de esto.',
    contactoTema: 'medicinas',
  },
  crisis_emocional: {
    mensaje:
      'Gracias por contarlo; eso también cuenta y mucho. Si quiere hablar con alguien, aquí está su gente.',
    contactoTema: 'animo',
  },
  infeccion: {
    // MND Assoc.: en infecciones respiratorias conviene consultar temprano (§7.3-A12).
    mensaje:
      'Quedó anotado. En gripas y fiebres conviene avisarle temprano a su equipo, sobre todo si nota cambios al respirar.',
    contactoTema: 'respiracion',
  },
  tos_debil: {
    // MND Assoc. (PCF): tos débil → fisioterapia respiratoria (§7.3-A4).
    mensaje:
      'Quedó anotado. Cuando la tos no logra sacar la flema, el equipo de fisioterapia respiratoria sabe cómo ayudar.',
    contactoTema: 'respiracion',
  },
  otro: {
    mensaje: 'Listo ✓ Quedó guardado para contárselo al equipo en el control.',
  },
};
