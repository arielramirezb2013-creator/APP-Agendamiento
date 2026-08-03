/* ============================================================
   ICONOS · SVG de trazo, dibujados a mano. Sin librerías.
   Uso: ico('proyecto')  ·  ico('deuda', 22)
   ============================================================ */

const ICONOS = {
  formacion:   'M4 5a2 2 0 0 1 2-2h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M14 3v4h4 M8 12h8 M8 16h5',
  manual:      'M3 5.5A2.5 2.5 0 0 1 5.5 3H10v16H5.5A2.5 2.5 0 0 0 3 21Z M21 5.5A2.5 2.5 0 0 0 18.5 3H14v16h4.5A2.5 2.5 0 0 1 21 21Z M12 19V3',
  herramienta: 'M5 3h14v18H5Z M8 7h8 M8 11h2 M12 11h2 M16 11h0.01 M8 15h2 M12 15h2 M16 15v4',
  inicio:      'M4 11 12 4l8 7 M6 10v9h12v-9',
  proyecto:    'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
  supuestos:   'M5 4h14v16H5Z M9 8h6 M9 12h6 M9 16h3',
  deuda:       'M3 10 12 4l9 6 M5 10v8 M9 10v8 M15 10v8 M19 10v8 M3 20h18',
  flujo:       'M4 17c3 0 3-10 6-10s3 10 6 10 3-6 4-6 M4 21h16',
  covenant:    'M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6Z M9 12l2 2 4-4',
  liquidez:    'M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10Z',
  tableros:    'M4 4h7v7H4Z M13 4h7v4h-7Z M13 10h7v10h-7Z M4 13h7v7H4Z',
  capacidad:   'M12 3v18 M3 12h18 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',
  escenarios:  'M12 3 3 8l9 5 9-5Z M3 13l9 5 9-5 M3 18l9 4 9-4',
  simulacion:  'M4 4h16v16H4Z M8 8h0.01 M16 8h0.01 M8 16h0.01 M16 16h0.01 M12 12h0.01',
  auditoria:   'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z M21 21l-5.2-5.2 M8 10.5h5 M10.5 8v5',
  backtesting: 'M12 4a8 8 0 1 1-7.5 5.3 M4 4v5h5 M12 8v4l3 2',
  decision:    'M4 12l5 5L20 6',
  reportes:    'M6 3h8l4 4v14H6Z M14 3v4h4 M9 13h6 M9 17h4',
  imprimir:    'M7 8V3h10v5 M6 8h12a2 2 0 0 1 2 2v6h-4v5H8v-5H4v-6a2 2 0 0 1 2-2Z',
  descarga:    'M12 3v12 M7 11l5 5 5-5 M4 20h16',
  usuario:     'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21c0-4 3.6-6 8-6s8 2 8 6',
  alerta:      'M12 4 2.5 20h19Z M12 10v4 M12 17h0.01',
  ok:          'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M8 12.5l2.5 2.5L16 9.5',
  error:       'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M9 9l6 6 M15 9l-6 6',
  info:        'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 11v5 M12 8h0.01',
  mas:         'M12 5v14 M5 12h14',
  basura:      'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
  editar:      'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17Z',
  guardar:     'M5 3h11l3 3v15H5Z M8 3v6h7V3 M8 14h8v7H8Z',
  calcular:    'M5 3h14v18H5Z M9 8h6 M8.5 12.5h1 M11.5 12.5h1 M14.5 12.5h1 M8.5 16.5h1 M11.5 16.5h1 M14.5 16.5h1',
  refrescar:   'M20 12a8 8 0 1 1-2.6-5.9 M20 4v5h-5',
  certificado: 'M12 3 3 7l9 4 9-4Z M7 10v4c0 2 2.5 3.5 5 3.5s5-1.5 5-3.5v-4 M12 17v4',
  play:        'M7 4l12 8-12 8Z',
  buscar:      'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z M20 20l-4-4',
  flecha:      'M5 12h14 M13 6l6 6-6 6',
  cerrar:      'M6 6l12 12 M18 6 6 18',
  copiar:      'M9 9h11v11H9Z M5 15H4V4h11v1',
  subir:       'M12 20V8 M7 12l5-5 5 5 M4 4h16',
  reloj:       'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M12 7v5.5l3.5 2',
  libro:       'M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4Z M20 4h-4a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h5Z',
  bombilla:    'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2h5c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z',
  candado:     'M6 10h12v11H6Z M9 10V7a3 3 0 0 1 6 0v3'
};

function ico(nombre, tam = 18, extra = '') {
  const d = ICONOS[nombre] || ICONOS.info;
  return `<svg class="ico ${extra}" viewBox="0 0 24 24" width="${tam}" height="${tam}"
    fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true">${
    d.split(' M').map((p, i) => `<path d="${i ? 'M' + p : p}"/>`).join('')}</svg>`;
}
