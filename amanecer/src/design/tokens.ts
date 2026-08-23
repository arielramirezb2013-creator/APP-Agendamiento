// Tokens de diseño §10.1 — únicos permitidos en toda la app.
// Justificación tipográfica (mantener): Atkinson Hyperlegible fue creada por el
// Braille Institute para maximizar la distinción de caracteres en baja visión —
// es la elección correcta para una adulta mayor, no una decoración.

export const color = {
  fondo: '#FAF7F2', // "Lino" — cálido, sin deslumbrar
  superficie: '#FFFFFF',
  tinta: '#292019', // "Café tostado" — contraste 13.9:1 sobre Lino
  tintaSuave: '#5C5248',
  primario: '#0B6B5D', // "Esmeralda profundo" — acciones (AAA sobre blanco)
  primarioHi: '#0E8271',
  ambar: '#8A5A00', // texto/íconos de "consulta pronto" (AAA)
  ambarFondo: '#FFF3DC',
  rojo: '#B3261E', // urgencia (con fondo #FDECEA o inverso pleno)
  rojoFondo: '#FDECEA',
  exito: '#1E6B3A',
  foco: '#1A73E8', // anillo de foco 3px, solo foco
} as const;

export const fuente = {
  ui: '"Atkinson Hyperlegible", system-ui, sans-serif', // diseñada para baja visión
  titular: '"Bitter", Georgia, serif', // solo saludos/titulares
} as const;

export const tam = { base: 20, pregunta: 28, saludo: 32, boton: 22, min: 18 } as const;

export const target = { chip: 64, primario: 72, radio: 20 } as const;

// Nombre de la app configurable en un solo lugar (§1). El valor efectivo en
// tiempo de ejecución vive en Perfil.appName; este es el predeterminado.
export const APP_NAME = 'Amanecer';
