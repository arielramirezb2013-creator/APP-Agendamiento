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
      // En rem sobre html{font-size:125%} → 1rem = 20px con la preferencia del
      // sistema en 100%, y TODA la tipografía escala si la usuaria agranda el
      // texto en su navegador/SO (§3.1: escalable a 200% sin romper el layout).
      fontSize: {
        min: ['0.9rem', '1.4'], // 18px
        base: ['1rem', '1.5'], // 20px
        boton: ['1.1rem', '1.3'], // 22px
        pregunta: ['1.4rem', '1.3'], // 28px
        saludo: ['1.6rem', '1.25'], // 32px
        urgencia: ['1.6rem', '1.2'], // 32px
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
