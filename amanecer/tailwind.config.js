/** @type {import('tailwindcss').Config} */
// Tokens §10.1 — únicos colores/tamaños permitidos en la app.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fondo: '#FAF7F2', // "Lino"
        superficie: '#FFFFFF',
        tinta: '#292019', // "Café tostado" — 13.9:1 sobre Lino
        'tinta-suave': '#5C5248',
        primario: '#0B6B5D', // "Esmeralda profundo"
        'primario-hi': '#0E8271',
        ambar: '#8A5A00',
        'ambar-fondo': '#FFF3DC',
        rojo: '#B3261E',
        'rojo-fondo': '#FDECEA',
        exito: '#1E6B3A',
        foco: '#1A73E8',
      },
      fontFamily: {
        ui: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
        titular: ['Bitter', 'Georgia', 'serif'],
      },
      fontSize: {
        min: ['18px', '1.4'],
        base: ['20px', '1.5'],
        boton: ['22px', '1.3'],
        pregunta: ['28px', '1.3'],
        saludo: ['32px', '1.25'],
        urgencia: ['32px', '1.2'],
      },
      minHeight: {
        chip: '64px',
        primario: '72px',
      },
      minWidth: {
        chip: '64px',
      },
      borderRadius: {
        token: '20px',
      },
    },
  },
  plugins: [],
};
