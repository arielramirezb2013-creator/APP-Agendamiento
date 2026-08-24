/** @type {import('tailwindcss').Config} */
// Tokens §10.1 — únicos colores/tamaños permitidos en la app.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Paleta "casa al amanecer" (rediseño pedido por la familia): crema
      // durazno, marrón café, terracota para acciones y miel como acento.
      // Contrastes verificados: tinta 11:1 sobre fondo; primario ≥5:1 con blanco.
      colors: {
        fondo: '#FAF1E4', // crema cálida
        'fondo-hero': '#FBE2C7', // durazno del saludo del día
        superficie: '#FFFCF7',
        tinta: '#43302B', // marrón café
        'tinta-suave': '#7A6357',
        primario: '#B4532A', // terracota — acciones
        'primario-hi': '#C96A3F',
        'primario-suave': '#F6DFD0', // relleno tibio de selección
        miel: '#D98E2B', // acento decorativo
        ambar: '#8A5A00',
        'ambar-fondo': '#FFF1D6',
        rojo: '#B3261E',
        'rojo-fondo': '#FDECEA',
        exito: '#3E6B3A',
        foco: '#1A73E8',
      },
      boxShadow: {
        calida: '0 2px 10px rgba(140, 90, 50, 0.10), 0 1px 3px rgba(140, 90, 50, 0.08)',
        'calida-alta': '0 6px 22px rgba(140, 90, 50, 0.16)',
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
        token: '26px', // formas más suaves y amables
      },
    },
  },
  plugins: [],
};
