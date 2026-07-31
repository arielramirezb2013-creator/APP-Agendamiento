/* ============================================================================
   ICONOGRAFÍA · SVG en línea, trazo uniforme, hereda el color del texto.
   Se prefieren íconos propios del método (espina de pescado, Pareto, carta de
   control, embudo DMAIC) antes que emojis genéricos.
   ========================================================================== */
'use strict';

const ICO = (function(){
  /* Todos los trazos se dibujan sobre una rejilla de 24 y heredan currentColor,
     así el ícono cambia solo con el tema y con el estado del botón. */
  const w = (d, extra) =>
    '<svg class="ico" viewBox="0 0 24 24" width="1em" height="1em" fill="none" ' +
    'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true" focusable="false">' + d + (extra || '') + '</svg>';

  const I = {
    /* --- navegación y acciones ------------------------------------- */
    inicio:    w('<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-6h5v6"/>'),
    menu:      w('<path d="M4 7h16M4 12h16M4 17h10"/>'),
    ayuda:     w('<circle cx="12" cy="12" r="9"/><path d="M9.3 9.2a2.8 2.8 0 1 1 3.4 3.1c-.5.2-.7.7-.7 1.2v.6"/><path d="M12 17.4h.01"/>'),
    limpiar:   w('<path d="M4 7h16"/><path d="M9 7V4.8h6V7"/><path d="M6.5 7l.9 12.2h9.2L17.5 7"/><path d="M10.3 10.6v6M13.7 10.6v6"/>'),
    imprimir:  w('<path d="M7 9V3.6h10V9"/><rect x="3.5" y="9" width="17" height="7.5" rx="1.6"/><path d="M7 14h10v6.4H7z"/><circle cx="17.3" cy="11.7" r=".9" fill="currentColor" stroke="none"/>'),
    descargar: w('<path d="M12 3.5v11"/><path d="M8 11l4 3.6 4-3.6"/><path d="M4.5 17.5v1.4a1.6 1.6 0 0 0 1.6 1.6h11.8a1.6 1.6 0 0 0 1.6-1.6v-1.4"/>'),
    subir:     w('<path d="M12 20.5v-11"/><path d="M8 13l4-3.6 4 3.6"/><path d="M4.5 6.5V5.1a1.6 1.6 0 0 1 1.6-1.6h11.8a1.6 1.6 0 0 1 1.6 1.6v1.4"/>'),
    guardar:   w('<path d="M4.5 5.6A1.6 1.6 0 0 1 6.1 4h9.6L20 8.3v10.1a1.6 1.6 0 0 1-1.6 1.6H6.1a1.6 1.6 0 0 1-1.6-1.6z"/><path d="M8 4v5h7"/><rect x="8" y="13" width="8" height="6.5"/>'),
    excel:     w('<path d="M6 3.2h8.4L19 7.8v13H6z"/><path d="M14.2 3.2v4.8H19"/><path d="M9 11.6l4.6 6.2M13.6 11.6L9 17.8"/>'),
    proyectos: w('<path d="M3.5 7.4a1.6 1.6 0 0 1 1.6-1.6h3.6l1.8 2.2h7.9a1.6 1.6 0 0 1 1.6 1.6v8.4a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6z"/>'),
    ajustes:   w('<circle cx="12" cy="12" r="3.1"/><path d="M19.1 14.4a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.5 1v.2a1.8 1.8 0 1 1-3.6 0v-.1a1.5 1.5 0 0 0-2.6-1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1-2.5h-.2a1.8 1.8 0 1 1 0-3.6h.1a1.5 1.5 0 0 0 1-2.6l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.2a1.8 1.8 0 1 1 3.6 0v.1a1.5 1.5 0 0 0 2.5 1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0-.3 1.7v.1a1.5 1.5 0 0 0 1.4.9h.2a1.8 1.8 0 1 1 0 3.6h-.1a1.5 1.5 0 0 0-1.4.9z"/>'),
    mas:       w('<path d="M12 5.5v13M5.5 12h13"/>'),
    quitar:    w('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
    antes:     w('<path d="M14.5 5.5 8 12l6.5 6.5"/>'),
    despues:   w('<path d="M9.5 5.5 16 12l-6.5 6.5"/>'),
    buscar:    w('<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.4 15.4 20 20"/>'),
    tema:      w('<circle cx="12" cy="12" r="8.3"/><path d="M12 3.7v16.6" /><path d="M12 3.7a8.3 8.3 0 0 1 0 16.6z" fill="currentColor" stroke="none"/>'),

    /* --- método Lean Six Sigma -------------------------------------- */
    manual:    w('<path d="M4 5.2A1.6 1.6 0 0 1 5.6 3.6H11v16.8H5.6A1.6 1.6 0 0 1 4 18.8z"/><path d="M20 5.2a1.6 1.6 0 0 0-1.6-1.6H13v16.8h5.4a1.6 1.6 0 0 0 1.6-1.6z"/>'),
    definir:   w('<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>'),
    medir:     w('<path d="M3.4 14.6 9.7 8.3l3.3 3.3 6.2-6.2"/><path d="M15.6 5.4h3.6V9"/><path d="M3.4 19.6h17"/>'),
    analizar:  w('<circle cx="10.6" cy="10.6" r="6.1"/><path d="M15 15l5 5"/><path d="M8.2 10.6h4.8M10.6 8.2v4.8"/>'),
    mejorar:   w('<path d="M12 3.6v7.2"/><path d="M8.4 7.2 12 3.6l3.6 3.6"/><path d="M5.4 13.2a6.9 6.9 0 1 0 13.2 0"/><path d="M9 20.4h6"/>'),
    controlar: w('<path d="M4 17.2h16"/><path d="M4 7.2h16" stroke-dasharray="2.6 2.6"/><path d="M4 12.2h16" stroke-dasharray="2.6 2.6"/><path d="M5.6 14.4 9 11l3.4 3.4L15.8 9l2.6 3.2"/>'),
    pareto:    w('<path d="M4 20V4"/><path d="M4 20h16"/><rect x="6.4" y="8.5" width="3" height="9"/><rect x="10.7" y="11.5" width="3" height="6"/><rect x="15" y="14.2" width="3" height="3.3"/><path d="M7.9 7.4 12.2 6l4.3 -.8"/>'),
    ishikawa:  w('<path d="M3 12h14.5"/><path d="M17.5 8.4 21.5 12l-4 3.6z"/><path d="M6.5 7.4 9 12M11 7.4 13.5 12M6.5 16.6 9 12M11 16.6 13.5 12"/>'),
    sigma:     w('<path d="M17 5.2H7l5.4 6.8L7 18.8h10"/>'),
    causa:     w('<circle cx="6.4" cy="12" r="2.6"/><circle cx="17.6" cy="6.6" r="2.6"/><circle cx="17.6" cy="17.4" r="2.6"/><path d="M8.7 10.8 15.3 7.7M8.7 13.2l6.6 3.1"/>'),
    alerta:    w('<path d="M12 4.2 21 19.4H3z"/><path d="M12 10v4.2"/><path d="M12 17.2h.01"/>'),
    ok:        w('<circle cx="12" cy="12" r="8.6"/><path d="M8.2 12.3 11 15l5-5.6"/>'),
    idea:      w('<path d="M9.2 17.4a5.6 5.6 0 1 1 5.6 0v1.5H9.2z"/><path d="M10 21.2h4"/>'),
    reloj:     w('<circle cx="12" cy="12" r="8.4"/><path d="M12 7.2V12l3.2 2"/>'),
    dinero:    w('<circle cx="12" cy="12" r="8.4"/><path d="M12 7v10"/><path d="M14.6 9.4a2.9 2.9 0 0 0-2.6-1.3c-1.6 0-2.6.9-2.6 2.1 0 2.9 5.2 1.5 5.2 4.3 0 1.2-1 2.2-2.6 2.2a3 3 0 0 1-2.7-1.4"/>'),
    equipo:    w('<circle cx="9.2" cy="8.6" r="3"/><path d="M3.6 19.2a5.6 5.6 0 0 1 11.2 0"/><path d="M16.4 6.2a3 3 0 0 1 0 5.8"/><path d="M17.6 13.8a5.6 5.6 0 0 1 3 5.4"/>'),
    tabla:     w('<rect x="3.6" y="4.6" width="16.8" height="14.8" rx="1.6"/><path d="M3.6 9.4h16.8M3.6 14.4h16.8M9.4 9.4v10"/>'),
    grafico:   w('<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="12.4" width="2.8" height="5.2"/><rect x="11.4" y="8.6" width="2.8" height="9"/><rect x="15.8" y="10.6" width="2.8" height="7"/>'),
    bi:        w('<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2.2"/><path d="M7.6 16.4v-3.6M12 16.4V8.2M16.4 16.4v-5.6"/>'),
    simular:   w('<path d="M6.6 4.4 18.4 12 6.6 19.6z"/>'),
    imagen:    w('<rect x="3.6" y="4.8" width="16.8" height="14.4" rx="1.8"/><circle cx="8.8" cy="9.8" r="1.6"/><path d="M4 16.6 9 12l3.4 3 2.6-2.2 5 4.2"/>'),
  };

  /* alias por fase, para que el ícono siga al módulo */
  I.fase = { GUIA:I.manual, DEFINIR:I.definir, MEDIR:I.medir,
             ANALIZAR:I.analizar, MEJORAR:I.mejorar, CONTROLAR:I.controlar };
  return I;
})();
