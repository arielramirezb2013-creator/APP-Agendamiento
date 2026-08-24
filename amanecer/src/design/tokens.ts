// Tokens de diseño §10.1 — únicos permitidos en toda la app.
// Justificación tipográfica (mantener): Atkinson Hyperlegible fue creada por el
// Braille Institute para maximizar la distinción de caracteres en baja visión —
// es la elección correcta para una adulta mayor, no una decoración.

// Paleta "casa al amanecer" — rediseño cálido pedido por la familia:
// crema durazno de fondo, marrón café para el texto, terracota para las
// acciones y miel como acento. La urgencia sigue en rojo inconfundible.
export const color = {
  fondo: '#FAF1E4', // crema cálida, sin deslumbrar
  fondoHero: '#FBE2C7', // durazno del saludo del día
  superficie: '#FFFCF7',
  tinta: '#43302B', // marrón café — 11:1 sobre el fondo
  tintaSuave: '#7A6357',
  primario: '#B4532A', // terracota — acciones (≥5:1 con blanco)
  primarioHi: '#C96A3F',
  primarioSuave: '#F6DFD0',
  miel: '#D98E2B', // acento decorativo
  ambar: '#8A5A00', // "consulta pronto"
  ambarFondo: '#FFF1D6',
  rojo: '#B3261E', // urgencia (con fondo #FDECEA o inverso pleno)
  rojoFondo: '#FDECEA',
  exito: '#3E6B3A',
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
