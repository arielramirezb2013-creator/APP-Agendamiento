/* ============================================================================
   SHELL DE LA APLICACIÓN · navegación, enlaces de datos, autoguardado
   ========================================================================== */
'use strict';

const UI = {

/* ------------------------------------------------------------- TOP BAR */
renderTop(){
  const p = ST.proj();
  // Sólo se muestran los logos que existen: nada de recuadros vacíos.
  // Los de la ARL y la empresa se cargan desde Ajustes y aparecen aquí al hacerlo.
  const slot = (id, label, src, fixed) => !src ? '' :
    '<div class="logo-slot' + (fixed ? ' fixed' : '') + '"' + (fixed ? '' : ' data-logo="' + id + '"') +
    ' title="' + esc(fixed ? 'Rehavid' : label) + '">' +
    '<img src="' + src + '" alt="' + esc(label) + '">' +
    (fixed ? '' : '<span class="logo-x" data-logorm="' + id + '">✕</span>') + '</div>';

  $('#topbar').innerHTML =
    '<button class="btn xs g" id="btnNav" title="Menú">' + ICO.menu + '</button>' +
    '<div class="logos">' +
      slot('rehavid', 'Rehavid', ST.cfg.logos.rehavid || REHAVID_LOGO_PNG, true) +
      (ST.cfg.logos.arl || ST.cfg.logos.empresa ? '<div class="topsep"></div>' : '') +
      slot('arl', 'ARL contratante', ST.cfg.logos.arl) +
      slot('empresa', 'Empresa atendida', ST.cfg.logos.empresa) +
    '</div>' +
    '<div class="topsep"></div>' +
    '<div style="min-width:0;flex:1">' +
      '<div style="font-weight:800;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        esc(p ? p.nombre : '—') + '</div>' +
      '<div style="font-size:11px;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        esc([p && p.empresa, p && p.arl].filter(Boolean).join(' · ') || 'Lean Six Sigma DMAIC') + '</div>' +
    '</div>' +
    '<span id="savebadge" class="pill">guardado</span>' +
    '<button class="btn sm g" data-view="bi" title="Tablero de inteligencia de negocio">' + ICO.bi + ' BI</button>' +
    '<button class="btn sm g" data-print="todo" title="Imprimir el informe completo">' + ICO.imprimir + '</button>' +
    '<button class="btn sm p" data-view="exportar">' + ICO.descargar + ' Exportar</button>' +
    '<button class="btn sm g" data-view="proyectos" title="Proyectos">' + ICO.proyectos + '</button>' +
    '<button class="btn xs g" id="btnTheme" title="Tema claro/oscuro">' + ICO.tema + '</button>';
},
saveBadge(state){
  const b = $('#savebadge'); if (!b) return;
  b.className = 'pill ' + (state === 'bad' ? 'bad' : 'ok');
  b.textContent = state === 'bad' ? 'error al guardar' : 'guardado';
  clearTimeout(UI._sb);
  UI._sb = setTimeout(() => { b.className = 'pill'; }, 1600);
},

/* ---------------------------------------------------------------- NAV */
renderNav(){
  const p = ST.proj();
  let h = '<div class="nv-top">' +
    '<button class="btn sm ' + (ROUTE.view === 'inicio' ? 'p' : 'g') + '" data-view="inicio" style="width:100%;justify-content:center">' + ICO.inicio + ' Inicio</button>' +
    '<div class="progress" style="margin-top:10px"><i style="width:' + (projProgress() * 100).toFixed(1) + '%"></i></div>' +
    '<div style="font-size:10.5px;color:var(--tx3);margin-top:5px;text-align:center">Avance DMAIC ' +
      fmt(projProgress(), 'p0') + '</div></div>';

  MODULES.forEach(m => {
    const ts = toolsOf(m.id);
    if (m.guia){
      if (!ts.length) return;
      const open = ROUTE.mod === m.id;
      h += '<div class="nv-ph' + (open ? ' open' : '') + '" data-ph="' + m.id + '" style="border-color:rgba(18,179,166,.3)">' +
        '<div class="nv-ph-h" data-phtoggle="' + m.id + '">' +
          '<div class="nv-dot" style="background:' + m.color + '">' + ICO.manual + '</div>' +
          '<div style="min-width:0"><div class="nv-ph-t">Cómo se usa</div>' +
            '<div class="nv-ph-sub">Manual · ' + ts.length + ' capítulos</div></div>' +
          '<span class="nv-chev">▸</span></div><div class="nv-sub">' +
        ts.map((t, i) => '<div class="nv-i' + (ROUTE.tool === t.id ? ' on' : '') + '" data-goto="' + t.id + '">' +
          '<span class="nv-n">' + (i + 1) + '</span><span class="nv-t" style="flex:1;min-width:0;overflow:hidden;' +
          'text-overflow:ellipsis;white-space:nowrap">' + esc(t.title) + '</span></div>').join('') +
        '</div></div>';
      return;
    }
    const on = ST.modOn(m.id);
    const open = ROUTE.mod === m.id;
    const pr = modProgress(m.id);
    h += '<div class="nv-ph' + (open ? ' open' : '') + (on ? '' : ' off') + '" data-ph="' + m.id + '">' +
      '<div class="nv-ph-h" data-phtoggle="' + m.id + '">' +
        '<div class="nv-dot" style="background:' + m.color + '">' + (ICO.fase[m.id] || m.letter) + '</div>' +
        '<div style="min-width:0"><div class="nv-ph-t">' + esc(m.name) + '</div>' +
          '<div class="nv-ph-sub">' + ts.filter(t => toolFilled(t)).length + '/' + ts.length + ' · ' + fmt(pr, 'p0') + '</div></div>' +
        '<label class="nv-sw nv-badge" title="Activar/desactivar este módulo" onclick="event.stopPropagation()">' +
          '<input type="checkbox" data-modtog="' + m.id + '"' + (on ? ' checked' : '') + '><span class="nv-sl"></span></label>' +
        '<span class="nv-chev">▸</span>' +
      '</div><div class="nv-sub">' +
        ts.map((t, i) => '<div class="nv-i' + (ROUTE.tool === t.id ? ' on' : '') + '" data-goto="' + t.id + '">' +
          '<span class="nv-n">' + (i + 1) + '</span><span class="nv-t" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
          esc(t.title) + '</span><span class="nv-fill' + (toolFilled(t) ? ' has' : '') + '"></span></div>').join('') +
      '</div></div>';
  });

  h += '<div class="nv-top" style="margin-top:14px">' +
    '<button class="btn sm g" data-view="bi" style="width:100%;justify-content:center">' + ICO.bi + ' Tablero BI</button>' +
    '<button class="btn sm g" data-view="exportar" style="width:100%;justify-content:center;margin-top:7px">' + ICO.descargar + ' Exportar</button>' +
    '<button class="btn sm g" data-view="ajustes" style="width:100%;justify-content:center;margin-top:7px">' + ICO.ajustes + ' Ajustes</button>' +
    '</div>';
  $('#nav').innerHTML = h;
},

/* --------------------------------------------------------------- VIEW */
renderView(){
  const v = $('#view');
  try {
    if (ROUTE.view === 'tool' && ROUTE.tool && TOOL_BY_ID[ROUTE.tool]) v.innerHTML = R.tool(TOOL_BY_ID[ROUTE.tool]);
    else if (ROUTE.view === 'modulo' && ROUTE.mod) v.innerHTML = UI.viewModulo(ROUTE.mod);
    else if (ROUTE.view === 'bi')        v.innerHTML = BI.render(ST.ctx());
    else if (ROUTE.view === 'exportar')  v.innerHTML = UI.viewExportar();
    else if (ROUTE.view === 'proyectos') v.innerHTML = UI.viewProyectos();
    else if (ROUTE.view === 'ajustes')   v.innerHTML = UI.viewAjustes();
    else                                 v.innerHTML = UI.viewInicio();
  } catch(e){
    console.error(e);
    v.innerHTML = '<div class="note bad"><b>Error al dibujar la vista.</b><br>' + esc(e.message) +
      '<br><br>Tus datos están a salvo. Recarga la página o cambia de sección.</div>';
  }
  if (typeof DIAG !== 'undefined' && DIAG.bind) { try { DIAG.bind(v); } catch(e){ console.warn(e); } }
  if (ROUTE.view === 'bi' && typeof BI !== 'undefined' && BI.bind) { try { BI.bind(v); } catch(e){ console.warn(e); } }
},

/* ------------------------------------------------------------- INICIO */
viewInicio(){
  const p = ST.proj(), g = (typeof ENGINE !== 'undefined') ? ENGINE.global(ST.ctx()) : null;
  let h = '<div class="page-h"><div style="flex:1">' +
    '<div class="crumb">Rehavid · Lean Six Sigma</div><h1>Metodología DMAIC</h1>' +
    '<div class="sub">Herramienta completa de mejora continua: 53 formatos en 5 fases, ' +
    'tablero de inteligencia de negocio, motor de interpretación y exportación a Excel.</div></div></div>';

  if (DEMO.esDemo())
    h += '<div class="note warn" style="display:flex;align-items:center;gap:12px">' + ICO.simular +
      '<div style="flex:1"><b>Estás viendo la simulación.</b> Es un caso completo de ejemplo ' +
      '(Rehavid contratada por una ARL para intervenir el servicio de terapia de una empresa afiliada) ' +
      'que sirve para recorrer toda la herramienta funcionando. Cuando quieras empezar tu proyecto real, ' +
      'límpiala.</div>' +
      '<button class="btn sm dg" data-democlear="1">' + ICO.limpiar + ' Limpiar simulación</button></div>';

  h += '<div class="card"><div class="card-b"><div class="fgrid" style="grid-template-columns:repeat(4,minmax(0,1fr))">' +
    [['nombre','Nombre del proyecto','text',2],['empresa','Empresa atendida','text',1],['arl','ARL contratante','text',1],
     ['area','Área o proceso','text',1],['lider','Líder del proyecto (Rehavid)','text',1],
     ['creado','Fecha de inicio','date',1],['actualizado','Última actualización','date',1]]
    .map(f => '<div class="fld" style="grid-column:span ' + f[3] + '"><label>' + esc(f[1]) + '</label>' +
      '<input class="inp" type="' + f[2] + '" data-proj="' + f[0] + '" value="' + esc(p[f[0]] || '') + '"></div>').join('') +
    '</div></div></div>';

  if (g){
    h += '<div class="grid2"><div class="card"><div class="card-h"><h3>Salud del proyecto</h3></div><div class="card-b">' +
      '<div style="display:flex;align-items:center;gap:16px">' +
      '<div style="font-size:44px;font-weight:800;font-family:var(--fm);color:var(--' +
        (g.semaforo === 'ok' ? 'ok' : g.semaforo === 'warn' ? 'warn' : 'bad') + ')">' + Math.round(g.salud) + '</div>' +
      '<div style="flex:1"><div class="progress"><i style="width:' + g.salud + '%"></i></div>' +
      '<div style="font-size:12px;color:var(--tx2);margin-top:7px">' + esc(g.resumen || '') + '</div></div></div>' +
      '</div></div>' +
      '<div class="card"><div class="card-h"><h3>Siguiente paso sugerido</h3></div><div class="card-b">' +
      (g.siguientePaso && g.siguientePaso.toolId
        ? '<div style="font-size:13px;margin-bottom:10px">' + esc(g.siguientePaso.motivo || '') + '</div>' +
          '<button class="btn p" data-goto="' + g.siguientePaso.toolId + '">Ir a «' +
          esc((TOOL_BY_ID[g.siguientePaso.toolId] || {}).title || '') + '» →</button>'
        : '<div class="muted">Completa la información del proyecto para recibir recomendaciones.</div>') +
      '</div></div></div>';
  }

  h += '<div class="sect-t">Fases de la metodología</div><div class="grid3">';
  FASES.forEach(m => {
    const ts = toolsOf(m.id), pr = modProgress(m.id), on = ST.modOn(m.id);
    h += '<div class="card" style="margin:0;' + (on ? '' : 'opacity:.5') + '"><div class="card-b">' +
      '<div style="display:flex;align-items:center;gap:11px;margin-bottom:10px">' +
      '<div class="nv-dot" style="background:' + m.color + ';width:38px;height:38px;flex:0 0 38px;font-size:17px">' + (ICO.fase[m.id] || m.letter) + '</div>' +
      '<div><div style="font-weight:800;font-size:14px">' + m.n + '. ' + esc(m.name) + '</div>' +
      '<div style="font-size:11px;color:var(--tx3)">' + esc(m.en) + ' · ' + ts.length + ' formatos</div></div></div>' +
      '<div style="font-size:12.5px;color:var(--tx2);min-height:36px">' + esc(m.desc) + '</div>' +
      '<div class="progress" style="margin:11px 0 6px"><i style="width:' + (pr * 100).toFixed(0) + '%;background:' + m.color + '"></i></div>' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<span style="font-size:11px;color:var(--tx3)">' + ts.filter(t => toolFilled(t)).length + '/' + ts.length + '</span>' +
      '<div class="spacer"></div>' +
      '<button class="btn sm ' + (on ? 'p' : 'g') + '" data-mod="' + m.id + '"' + (on ? '' : ' disabled') + '>Abrir →</button>' +
      '</div></div></div>';
  });
  h += '</div>';

  h += '<div class="sect-t">Accesos rápidos</div><div style="display:flex;gap:9px;flex-wrap:wrap">' +
    '<button class="btn" data-view="bi">' + ICO.bi + ' Tablero BI</button>' +
    '<button class="btn" data-view="exportar">' + ICO.excel + ' Exportar a Excel</button>' +
    '<button class="btn" data-view="proyectos">' + ICO.proyectos + ' Proyectos</button>' +
    '<button class="btn" data-print="todo">' + ICO.imprimir + ' Imprimir informe completo</button>' +
    '<button class="btn" data-view="ajustes">' + ICO.ajustes + ' Ajustes y logos</button>' +
    (DEMO.esDemo()
      ? '<button class="btn dg" data-democlear="1">' + ICO.limpiar + ' Limpiar simulación</button>'
      : '<button class="btn a" data-demoload="1">' + ICO.simular + ' Cargar datos de simulación</button>') +
    '</div>';
  return h;
},

/* -------------------------------------------------------------- MÓDULO */
viewModulo(modId){
  const m = MOD_BY_ID[modId], ts = toolsOf(modId);
  let h = '<div class="page-h"><div class="nv-dot" style="background:' + m.color + ';width:46px;height:46px;flex:0 0 46px;font-size:20px">' + m.letter + '</div>' +
    '<div style="flex:1"><div class="crumb">Fase ' + m.n + ' de 5</div><h1>' + esc(m.name) + ' · ' + esc(m.en) + '</h1>' +
    '<div class="sub">' + esc(m.desc) + '</div></div>' +
    '<button class="btn g" data-print="modulo|' + m.id + '">' + ICO.imprimir + ' Imprimir fase</button>' +
    '<button class="btn p" data-xlmod="' + m.id + '">' + ICO.excel + ' Excel de esta fase</button></div>';
  h += '<div class="grid3">' + ts.map((t, i) => {
    const full = toolFilled(t);
    return '<div class="card" style="margin:0;cursor:pointer" data-goto="' + t.id + '"><div class="card-b">' +
      '<div style="display:flex;gap:9px;align-items:flex-start">' +
      '<span class="nv-n" style="font-size:12px;font-weight:800;color:' + m.color + '">' + (i + 1) + '</span>' +
      '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13.5px;line-height:1.3">' + esc(t.title) + '</div>' +
      '<div style="font-size:11.5px;color:var(--tx3);margin-top:4px;min-height:32px">' + esc(t.desc || '') + '</div>' +
      '<div style="margin-top:7px"><span class="pill ' + (full ? 'ok' : '') + '">' + (full ? 'con datos' : 'vacío') + '</span> ' +
      '<span class="xlref">' + esc(t.sheet) + '</span></div></div></div>' +
      '</div></div>';
  }).join('') + '</div>';
  return h;
},

/* ----------------------------------------------------------- EXPORTAR */
viewExportar(){
  const p = ST.proj();
  let h = '<div class="page-h"><div style="flex:1"><div class="crumb">Entregables</div><h1>Exportar</h1>' +
    '<div class="sub">Descarga la información en los mismos libros de Excel de la metodología, ' +
    'o en un único libro consolidado con macros y tablero.</div></div></div>';

  h += '<div class="grid2">' +
    '<div class="card"><div class="card-h">' + ICO.excel + '<h3>Libros originales</h3></div><div class="card-b">' +
    '<div class="note">Se rellenan las <b>plantillas originales</b> de la metodología conservando ' +
    'formato, celdas combinadas, gráficos y fórmulas. Se abren en Excel y recalculan solas.</div>' +
    FASES.map(m => {
      const on = ST.modOn(m.id), ts = toolsOf(m.id).filter(enPlantilla);
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bd2)' + (on ? '' : ';opacity:.45') + '">' +
        '<div class="nv-dot" style="background:' + m.color + ';width:28px;height:28px;flex:0 0 28px;font-size:13px">' + (ICO.fase[m.id] || m.letter) + '</div>' +
        '<div style="flex:1"><div style="font-weight:700;font-size:13px">' + m.n + '. ' + esc(m.name) + '.xlsx</div>' +
        '<div style="font-size:11px;color:var(--tx3)">' + ts.length + ' hojas · ' +
        ts.filter(t => toolFilled(t)).length + ' con datos</div></div>' +
        '<button class="btn sm g" data-xlmod="' + m.id + '"' + (on ? '' : ' disabled') + '>' + ICO.descargar + '</button></div>';
    }).join('') +
    '<button class="btn p" data-xlall="1" style="width:100%;justify-content:center;margin-top:13px">' + ICO.descargar + ' Descargar los 5 libros (.zip)</button>' +
    '</div></div>' +

    '<div class="card"><div class="card-h">' + ICO.excel + '<h3>Libro consolidado con macros</h3></div><div class="card-b">' +
    '<div class="note warn">Un solo archivo <b>.xlsm</b> con las 53 hojas, tablero BI, fórmulas vivas, ' +
    'tablas, validaciones, formato condicional y un <b>módulo de macros VBA</b> ' +
    '(panel de control, informe ejecutivo, exportar a PDF, validación DMAIC y funciones ' +
    '<span class="mono">REHAVID_SIGMA</span>, <span class="mono">REHAVID_DPMO</span>, ' +
    '<span class="mono">REHAVID_CPK</span>, <span class="mono">REHAVID_MUESTRA_*</span>).</div>' +
    '<button class="btn a" data-xlsm="1" style="width:100%;justify-content:center">' + ICO.descargar + ' Descargar TODO EN UNO (.xlsm)</button>' +
    '<button class="btn g" data-xlsxall="1" style="width:100%;justify-content:center;margin-top:8px">' + ICO.descargar + ' Igual pero sin macros (.xlsx)</button>' +
    '<div class="hint" style="margin-top:9px">Al abrirlo Excel pedirá <b>Habilitar contenido</b> para activar las macros.</div>' +
    '</div></div></div>';

  h += '<div class="sect-t">Otros formatos</div><div class="grid3">' +
    '<div class="card" style="margin:0"><div class="card-b"><b>' + ICO.guardar + ' Copia de seguridad</b>' +
    '<div style="font-size:12px;color:var(--tx2);margin:7px 0 11px">Archivo <span class="mono">.json</span> con todo el ' +
    'proyecto. Sirve para respaldar o pasarlo a otro computador.</div>' +
    '<button class="btn sm p" data-expjson="1">' + ICO.descargar + ' Exportar .json</button> ' +
    '<button class="btn sm g" data-impjson="1">' + ICO.subir + ' Importar</button></div></div>' +

    '<div class="card" style="margin:0"><div class="card-b"><b>' + ICO.imprimir + ' Informe PDF</b>' +
    '<div style="font-size:12px;color:var(--tx2);margin:7px 0 11px">Documento paginado con portada y logos. ' +
    'Ninguna tabla ni gráfico queda partido entre hojas. En el diálogo elige «Guardar como PDF».</div>' +
    '<button class="btn sm p" data-print="todo">Informe completo</button> ' +
    '<button class="btn sm g" data-print="modulo|' + (ROUTE.mod || 'DEFINIR') + '">Sólo una fase</button></div></div>' +

    '<div class="card" style="margin:0"><div class="card-b"><b>' + ICO.tabla + ' Datos en CSV</b>' +
    '<div style="font-size:12px;color:var(--tx2);margin:7px 0 11px">Todas las tablas del proyecto en archivos ' +
    '<span class="mono">.csv</span> para análisis externo.</div>' +
    '<button class="btn sm p" data-expcsv="1">' + ICO.descargar + ' Exportar .csv</button></div></div>' +
    '</div>';
  return h;
},

/* ---------------------------------------------------------- PROYECTOS */
viewProyectos(){
  let h = '<div class="page-h"><div style="flex:1"><div class="crumb">Gestión</div><h1>Proyectos</h1>' +
    '<div class="sub">Cada empresa atendida puede tener su propio proyecto DMAIC. Todo se guarda en este equipo.</div></div>' +
    '<button class="btn p" data-newproj="1">' + ICO.mas + ' Nuevo proyecto</button></div>';
  h += '<div class="grid3">' + ST.db.projects.map(p => {
    const act = p.id === ST.db.activeId;
    const prev = ST.db.activeId; ST.db.activeId = p.id;
    const pr = projProgress(); ST.db.activeId = prev;
    return '<div class="card" style="margin:0;' + (act ? 'border-color:var(--br-2)' : '') + '"><div class="card-b">' +
      '<div style="font-weight:800;font-size:14px">' + esc(p.nombre) + (act ? ' <span class="pill ok">activo</span>' : '') + '</div>' +
      '<div style="font-size:11.5px;color:var(--tx3);margin:5px 0 9px">' +
        esc([p.empresa, p.arl].filter(Boolean).join(' · ') || 'sin empresa') + '<br>actualizado ' + esc(p.actualizado || '—') + '</div>' +
      '<div class="progress"><i style="width:' + (pr * 100).toFixed(0) + '%"></i></div>' +
      '<div style="display:flex;gap:6px;margin-top:11px">' +
      (act ? '' : '<button class="btn sm p" data-openproj="' + p.id + '">Abrir</button>') +
      '<button class="btn sm g" data-dupproj="' + p.id + '">Duplicar</button>' +
      '<div class="spacer"></div>' +
      '<button class="btn sm dg" data-delproj="' + p.id + '">Eliminar</button></div>' +
      '</div></div>';
  }).join('') + '</div>';
  return h;
},

/* ------------------------------------------------------------ AJUSTES */
viewAjustes(){
  const c = ST.cfg;
  let used = 0; try { used = new Blob([JSON.stringify(ST.db)]).size; } catch(e){}
  let h = '<div class="page-h"><div style="flex:1"><div class="crumb">Configuración</div><h1>Ajustes</h1>' +
    '<div class="sub">Marca, módulos activos y almacenamiento.</div></div></div>';

  h += '<div class="grid2"><div class="card"><div class="card-h"><h3>Logotipos</h3></div><div class="card-b">' +
    '<div class="note">El logo de <b>Rehavid</b> viene incluido y se estampa en los Excel exportados. ' +
    'Sube el de la <b>ARL contratante</b> y el de la <b>empresa atendida</b> para personalizar los entregables.</div>' +
    ['rehavid|Logo Rehavid (reemplazar por el oficial)','arl|Logo ARL contratante','empresa|Logo empresa atendida']
      .map(s => { const [k, l] = s.split('|');
        return '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--bd2)">' +
          '<div class="logo-slot" data-logo="' + k + '" style="height:52px;min-width:110px">' +
          ((k === 'rehavid' ? (c.logos.rehavid || REHAVID_LOGO_PNG) : c.logos[k])
            ? '<img src="' + (k === 'rehavid' ? (c.logos.rehavid || REHAVID_LOGO_PNG) : c.logos[k]) + '" style="max-height:46px">'
            : '<span class="lbl">subir</span>') + '</div>' +
          '<div style="flex:1;font-size:12.5px">' + esc(l) + '</div>' +
          (c.logos[k] ? '<button class="btn xs dg" data-logorm="' + k + '">Quitar</button>' : '') + '</div>'; }).join('') +
    '<div class="fgrid" style="grid-template-columns:1fr 1fr;margin-top:13px">' +
    '<div class="fld"><label>Nombre de la ARL</label><input class="inp" data-cfg="arlNombre" value="' + esc(c.arlNombre || '') + '"></div>' +
    '<div class="fld"><label>Nombre de la empresa</label><input class="inp" data-cfg="empresaNombre" value="' + esc(c.empresaNombre || '') + '"></div>' +
    '</div></div></div>';

  h += '<div class="card"><div class="card-h"><h3>Módulos del proyecto activo</h3></div><div class="card-b">' +
    '<div class="note">Desactiva las fases que la empresa no requiera. La app funciona <b>por módulos ' +
    'o completa</b>: los módulos apagados desaparecen del menú, del tablero y de la exportación.</div>' +
    FASES.map(m => '<div style="display:flex;align-items:center;gap:11px;padding:8px 0;border-bottom:1px solid var(--bd2)">' +
      '<div class="nv-dot" style="background:' + m.color + ';width:30px;height:30px;flex:0 0 30px;font-size:14px">' + (ICO.fase[m.id] || m.letter) + '</div>' +
      '<div style="flex:1"><div style="font-weight:700;font-size:13px">' + m.n + '. ' + esc(m.name) + '</div>' +
      '<div style="font-size:11px;color:var(--tx3)">' + toolsOf(m.id).length + ' formatos</div></div>' +
      '<label class="nv-sw"><input type="checkbox" data-modtog="' + m.id + '"' + (ST.modOn(m.id) ? ' checked' : '') +
      '><span class="nv-sl"></span></label></div>').join('') +
    '</div></div></div>';

  h += '<div class="grid2"><div class="card"><div class="card-h"><h3>Apariencia</h3></div><div class="card-b">' +
    '<div style="display:flex;gap:9px;flex-wrap:wrap">' +
    '<button class="btn ' + (c.theme === 'dark' ? 'p' : 'g') + '" data-settheme="dark">Oscuro</button>' +
    '<button class="btn ' + (c.theme === 'light' ? 'p' : 'g') + '" data-settheme="light">Claro</button>' +
    '</div></div></div>' +
    '<div class="card"><div class="card-h"><h3>Almacenamiento</h3></div><div class="card-b">' +
    '<div style="font-size:13px">Espacio usado: <b class="mono">' + fmt(used / 1024, 'n0') + ' KB</b> de ~5.000 KB<br>' +
    'Proyectos guardados: <b>' + ST.db.projects.length + '</b></div>' +
    '<div class="progress" style="margin:10px 0"><i style="width:' + clamp(used / 5242880 * 100, 0, 100).toFixed(1) + '%"></i></div>' +
    '<div class="hint">Los datos viven en este navegador. Exporta el <span class="mono">.json</span> ' +
    'periódicamente como respaldo.</div>' +
    '<div style="margin-top:11px;display:flex;gap:8px;flex-wrap:wrap">' +
    '<button class="btn sm p" data-expjson="1">⤓ Respaldar</button>' +
    '<button class="btn sm g" data-impjson="1">⤒ Restaurar</button>' +
    '<button class="btn sm dg" data-wipe="1">Borrar todo</button></div>' +
    '<div class="sect-t" style="margin-top:16px">Simulación</div>' +
    '<div class="hint">Carga un proyecto de ejemplo completo para recorrer la herramienta funcionando, ' +
    'y bórralo cuando vayas a empezar el proyecto real.</div>' +
    '<div style="margin-top:9px;display:flex;gap:8px;flex-wrap:wrap">' +
    '<button class="btn sm a" data-demoload="1">' + ICO.simular + ' Cargar simulación</button>' +
    '<button class="btn sm dg" data-democlear="1">' + ICO.limpiar + ' Limpiar simulación</button></div>' +
    '</div></div></div>';

  h += '<div class="card"><div class="card-h"><h3>Acerca de</h3></div><div class="card-b" style="font-size:12.5px;line-height:1.7">' +
    '<b>Rehavid · Lean Six Sigma DMAIC</b> — versión ' + APP_VERSION + '<br>' +
    'Aplicación autónoma en un solo archivo HTML: no requiere internet, servidor, instalación ni repositorios. ' +
    'Replica los 5 libros de Excel de la metodología (53 formatos) y agrega tablero BI, ' +
    'motor de interpretación y exportación con macros.<br>' +
    '<span class="muted">Compatibilidad de exportación: ' + (ZIP.supported ? 'completa' : 'limitada — usa Chrome, Edge o Firefox actualizados') + '</span>' +
    '</div></div>';
  return h;
},

/* ------------------------------------------------- REFRESCO QUIRÚRGICO
   Nunca se vuelve a dibujar un campo editable: eso destruía el elemento que el
   usuario tenía enfocado y se perdían las pulsaciones. Sólo se actualiza lo
   que se deriva de los datos. */
softRefresh(){
  clearTimeout(UI._sr);
  UI._sr = setTimeout(() => { UI.recompute(); UI.renderNav(); }, 180);
},

/** Recalcula celdas derivadas y vuelve a dibujar los bloques volátiles. */
recompute(){
  if (ROUTE.view !== 'tool') { UI.renderView(); return; }
  const t = TOOL_BY_ID[ROUTE.tool]; if (!t) return;
  const d = ST.d(t.id), ctx = ST.ctx();
  const body = $('#toolbody'); if (!body) return;
  const foco = document.activeElement;

  (t.blocks || []).forEach((b, i) => {
    const cont = body.querySelector('[data-blk="' + i + '"]'); if (!cont) return;

    // bloques que sólo muestran resultados: se redibujan enteros
    if (b.type === 'chart' || b.type === 'cards' || b.type === 'insight' ||
        b.type === 'note'  || b.type === 'html'  || b.type === 'diagram'){
      if (b.type === 'diagram' && cont.contains(foco)) return;   // se está editando el lienzo
      try {
        const nuevo = R.block(b, t, d, ctx, i);
        if (cont.innerHTML !== nuevo) cont.innerHTML = nuevo;
      } catch(e){ console.warn('recompute', b.type, e); }
      return;
    }

    // formularios y tablas: sólo se tocan las celdas calculadas y los totales
    try { UI.recalcCeldas(cont, b, t, d, ctx); }
    catch(e){ console.warn('recalcCeldas', b.type, e); }
  });
},

/** Actualiza in situ los valores de solo-lectura, totales, barras y semáforos. */
recalcCeldas(cont, b, t, d, ctx){
  if (b.type === 'fields'){
    (callv(b.items, d, ctx) || []).forEach(f => {
      if (!f.calc) return;
      const el = cont.querySelector('[data-f="' + f.k + '"][data-calc]'); if (!el) return;
      const r = f.calc(d, ctx);
      const v = (typeof r === 'number' && !isFinite(r)) ? '' : (f.fmt ? fmt(r, f.fmt) : (r == null ? '' : r));
      if (el.value !== String(v)) el.value = v;
    });
    return;
  }

  if (b.type === 'matrix'){
    const M = d[b.key] || {};
    Object.keys(b.calc || {}).forEach(key => {
      const el = cont.querySelector('[data-mk="' + key + '"][data-calc]'); if (!el) return;
      const cols = callv(b.cols, d, ctx) || [];
      const ck = key.split('.').pop(), cs = cols.find(c => c.k === ck) || {};
      const r = b.calc[key](M, d, ctx);
      const v = (typeof r === 'number' && !isFinite(r)) ? '' : (cs.fmt ? fmt(r, cs.fmt) : (r == null ? '' : r));
      if (el.value !== String(v)) el.value = v;
    });
    return;
  }

  if (b.type !== 'grid') return;

  const rows = arr(d[b.key]);
  const cols = callv(b.cols, d, ctx) || [];
  const computed = rows.map((r, i) => {
    const o = {}; cols.forEach(c => { o[c.k] = c.calc ? c.calc(r, i, rows, d, ctx) : r[c.k]; }); return o;
  });
  const maxes = {};
  cols.forEach(c => { if (c.databar)
    maxes[c.k] = Math.max.apply(null, [1e-9].concat(computed.map(v => Math.abs(num(v[c.k]))))); });

  rows.forEach((r, i) => {
    cols.forEach(c => {
      const el = cont.querySelector('[data-g="' + b.key + '"][data-r="' + i + '"][data-c="' + c.k + '"]');
      if (!el) return;
      const raw = computed[i][c.k];
      if (c.calc){
        const v = (typeof raw === 'number' && !isFinite(raw)) ? '' : (c.fmt ? fmt(raw, c.fmt) : (raw == null ? '' : raw));
        if (el.value !== String(v)) el.value = v;
      }
      const td = el.closest('td');
      if (td && c.tone){
        const tone = c.tone(raw, r, i, rows, d, ctx) || '';
        td.className = tone ? 'cell-' + tone : '';
      }
      if (c.databar){
        const barra = el.parentNode && el.parentNode.querySelector('.dbf');
        if (barra) barra.style.width = clamp(Math.abs(num(raw)) / maxes[c.k] * 100, 0, 100).toFixed(1) + '%';
      }
    });
  });

  // fila de totales
  if (b.foot){
    const tf = cont.querySelector('tfoot tr'); if (!tf) return;
    const fs = callv(b.foot, rows, d, ctx) || [];
    cols.forEach((c, ci) => {
      const f = fs.find(x => x.k === c.k); if (!f) return;
      const celda = tf.children[ci + 1]; if (!celda) return;
      const v = (f.label !== undefined && ci === 0) ? f.label : fmt(f.calc(rows, d, ctx, computed), f.fmt);
      if (celda.textContent !== String(v)) celda.textContent = v;
    });
  }
},
_sr:null, _sb:null
};

/* ============================================================ EVENTOS */
function bindGlobal(){

  /* ---- entrada de datos (delegación) ---- */
  const onInput = e => {
    const el = e.target;
    if (!el.dataset) return;
    const val = el.type === 'checkbox' ? el.checked : el.value;

    if (el.dataset.proj){ const p = ST.proj(); p[el.dataset.proj] = val; ST.touch(); UI.renderTop(); return; }
    if (el.dataset.cfg){ ST.cfg[el.dataset.cfg] = val; ST.save(); return; }

    const tid = el.dataset.t; if (!tid) return;
    if (el.hasAttribute('readonly')) return;
    const d = ST.d(tid);

    if (el.dataset.f !== undefined && el.dataset.f !== ''){ d[el.dataset.f] = val; }
    else if (el.dataset.g){
      const rows = rowsOf(d, el.dataset.g, 0), i = +el.dataset.r;
      if (rows[i]) rows[i][el.dataset.c] = val;
    }
    else if (el.dataset.mk){
      if (!d[el.dataset.m]) d[el.dataset.m] = {};
      d[el.dataset.m][el.dataset.mk] = val;
    }
    else if (el.dataset.diag && typeof DIAG !== 'undefined' && DIAG.setPath){
      DIAG.setPath(el.dataset.diag, val); ST.touch(); UI.softRefresh(); return;
    }
    else return;
    ST.touch();
    UI.softRefresh();
  };
  document.addEventListener('input', onInput);
  document.addEventListener('change', e => {
    if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox' || e.target.type === 'date') onInput(e);
  });

  /* ---- clics ---- */
  document.addEventListener('click', async e => {
    const T = s => e.target.closest('[' + s + ']');
    let el;

    if ((el = T('data-goto'))){ const t = TOOL_BY_ID[el.dataset.goto]; if (t) go('tool', t.mod, t.id); return; }
    if ((el = T('data-mod'))){ go('modulo', el.dataset.mod); return; }
    if ((el = T('data-view'))){ go(el.dataset.view); return; }
    if ((el = T('data-phtoggle'))){
      const m = el.dataset.phtoggle;
      if (ROUTE.mod === m && ROUTE.view === 'modulo') { ROUTE.mod = null; UI.renderNav(); }
      else go('modulo', m);
      return;
    }
    if ((el = T('data-modtog'))) return;   // lo maneja change

    /* filas */
    if ((el = T('data-addrow')) || (el = T('data-addrow5'))){
      const five = !!el.dataset.addrow5;
      const [tid, key] = (el.dataset.addrow || el.dataset.addrow5).split('|');
      const d = ST.d(tid), rows = rowsOf(d, key, 0);
      const blk = (TOOL_BY_ID[tid].blocks || []).find(b => b.type === 'grid' && b.key === key);
      const max = (blk && blk.max) || 500;
      for (let i = 0; i < (five ? 5 : 1); i++) if (rows.length < max) rows.push({ _id: uid() });
      ST.touch(); UI.renderView(); UI.renderNav(); return;
    }
    if ((el = T('data-delrow'))){
      const [tid, key, i] = el.dataset.delrow.split('|');
      const d = ST.d(tid), rows = rowsOf(d, key, 0);
      const blk = (TOOL_BY_ID[tid].blocks || []).find(b => b.type === 'grid' && b.key === key);
      rows.splice(+i, 1);
      if (blk && blk.min) rowsOf(d, key, blk.min);
      ST.touch(); UI.renderView(); UI.renderNav(); return;
    }

    /* imágenes */
    if ((el = T('data-up'))){
      const [tid, k] = el.dataset.up.split('|');
      pickImage(async url => { ST.d(tid)[k] = await shrinkImage(url, 1200, 1200, .85); ST.touch(); UI.renderView(); });
      return;
    }
    if ((el = T('data-uprm'))){
      e.stopPropagation();
      const [tid, k] = el.dataset.uprm.split('|');
      delete ST.d(tid)[k]; ST.touch(); UI.renderView(); return;
    }
    if ((el = T('data-logo'))){
      const k = el.dataset.logo;
      pickImage(async url => { ST.cfg.logos[k] = await shrinkImage(url, 600, 240, .92);
        ST.save(true); UI.renderTop(); UI.renderView(); toast('Logo actualizado', 'ok'); });
      return;
    }
    if ((el = T('data-logorm'))){
      e.stopPropagation();
      ST.cfg.logos[el.dataset.logorm] = null; ST.save(true); UI.renderTop(); UI.renderView(); return;
    }

    /* herramienta */
    if ((el = T('data-cleartool'))){
      const tid = el.dataset.cleartool;
      confirmar('¿Borrar toda la información de «' + TOOL_BY_ID[tid].title + '»?', () => {
        ST.proj().data[tid] = {}; ST.touch(); UI.renderView(); UI.renderNav();
        toast('Formato limpiado', 'ok');
      }, true);
      return;
    }
    if ((el = T('data-guide'))){
      const t = TOOL_BY_ID[el.dataset.guide];
      modal({ title: t.title, html:'<div class="note">' + esc(t.desc || '') + '</div>' +
        '<ul style="font-size:13.5px;line-height:1.75;padding-left:20px">' +
        arr(t.guide).map(g => '<li>' + esc(g) + '</li>').join('') + '</ul>' +
        '<div class="hint" style="margin-top:12px">Hoja del Excel original: <span class="mono">' + esc(t.sheet) + '</span></div>' });
      return;
    }

    /* gráficos → PNG */
    if ((el = T('data-pngchart'))){
      const box = el.closest('.card').querySelector('.dg-wrap svg');
      if (box){ const b = await CHART.toPNG(box, 2); download(b, 'grafico.png'); }
      return;
    }

    /* proyectos */
    if ((el = T('data-newproj'))){ prompt2('Nuevo proyecto', 'Nombre del proyecto', '', n => {
      ST.newProject(n); go('inicio'); UI.renderTop(); }); return; }
    if ((el = T('data-openproj'))){ ST.db.activeId = el.dataset.openproj; ST.save(true); go('inicio'); UI.renderTop(); return; }
    if ((el = T('data-dupproj'))){ ST.dupProject(el.dataset.dupproj); UI.renderTop(); UI.renderView(); return; }
    if ((el = T('data-delproj'))){
      const p = ST.db.projects.find(x => x.id === el.dataset.delproj);
      confirmar('¿Eliminar el proyecto «' + p.nombre + '» y toda su información?', () => {
        ST.delProject(p.id); UI.renderTop(); UI.renderView(); UI.renderNav(); toast('Proyecto eliminado', 'ok');
      }, true); return;
    }

    /* tema */
    if ((el = T('data-settheme'))){ setTheme(el.dataset.settheme); UI.renderView(); return; }
    if (e.target.closest('#btnTheme')){ setTheme(ST.cfg.theme === 'dark' ? 'light' : 'dark'); return; }
    if (e.target.closest('#btnNav')){
      if (window.innerWidth <= 900) document.body.classList.toggle('navopen');
      else { document.body.classList.toggle('navmin'); ST.cfg.navmin = document.body.classList.contains('navmin'); ST.save(); }
      return;
    }

    /* exportaciones */
    if ((el = T('data-xlmod'))){ await withBusy('Generando Excel…', () => XL.exportModule(el.dataset.xlmod)); return; }
    if ((el = T('data-xlall'))){ await withBusy('Generando los 5 libros…', () => XL.exportAllTemplates()); return; }
    if ((el = T('data-xlsm'))){ await withBusy('Generando libro con macros…', () => GEN.exportConsolidado(true)); return; }
    if ((el = T('data-xlsxall'))){ await withBusy('Generando libro consolidado…', () => GEN.exportConsolidado(false)); return; }
    if ((el = T('data-expjson'))){ exportJSON(); return; }
    if ((el = T('data-impjson'))){ importJSON(); return; }
    if ((el = T('data-expcsv'))){ await withBusy('Generando CSV…', () => GEN.exportCSV()); return; }
    if ((el = T('data-print'))){
      const [alcance, ref] = String(el.dataset.print).split('|');
      PRINT.imprimir(alcance || 'todo', ref); return;
    }
    if ((el = T('data-demoload'))){
      confirmar('Se cargará un proyecto de ejemplo completo sobre el proyecto activo, ' +
                'reemplazando lo que tenga escrito. ¿Continuar?', () => {
        const n = DEMO.cargar(); UI.renderTop(); go('inicio');
        toast('Simulación cargada: ' + n + ' formatos diligenciados', 'ok', 5000);
      });
      return;
    }
    if ((el = T('data-democlear'))){
      confirmar('Se borrarán TODOS los datos de la simulación y el proyecto quedará en blanco ' +
                'para empezar a usarlo. ¿Continuar?', () => {
        DEMO.limpiar(); UI.renderTop(); go('inicio');
        toast('Listo, el proyecto quedó en blanco', 'ok');
      }, true);
      return;
    }
    if ((el = T('data-wipe'))){
      confirmar('Se borrarán TODOS los proyectos de este navegador. ¿Continuar?', () => {
        localStorage.removeItem(DB_KEY); location.reload();
      }, true); return;
    }
  });

  /* módulos on/off */
  document.addEventListener('change', e => {
    if (e.target.dataset && e.target.dataset.modtog){
      const p = ST.proj(); if (!p.mods) p.mods = {};
      p.mods[e.target.dataset.modtog] = e.target.checked;
      ST.touch(); UI.renderNav(); UI.renderView();
    }
  });

  /* arrastrar imágenes a las zonas de subida */
  document.addEventListener('dragover', e => { if (e.target.closest('.upz')) e.preventDefault(); });
  document.addEventListener('drop', async e => {
    const z = e.target.closest('.upz'); if (!z || !z.dataset.up) return;
    e.preventDefault();
    const f = e.dataTransfer.files[0]; if (!f || !/^image\//.test(f.type)) return;
    const [tid, k] = z.dataset.up.split('|');
    ST.d(tid)[k] = await shrinkImage(await fileToDataURL(f), 1200, 1200, .85);
    ST.touch(); UI.renderView();
  });

  /* atajos */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's'){ e.preventDefault(); ST.save(true); toast('Guardado', 'ok'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'p'){ /* deja imprimir */ }
    if (e.key === 'Escape'){ const o = $('.ovl'); if (o) o.remove(); }
  });

  window.addEventListener('beforeunload', e => { if (ST.dirty){ ST.save(true); } });
}

/* ------------------------------------------------------------ helpers */
function pickImage(cb){
  const i = document.createElement('input');
  i.type = 'file'; i.accept = 'image/*';
  i.onchange = async () => { const f = i.files[0]; if (f) cb(await fileToDataURL(f)); };
  i.click();
}
function setTheme(t){
  ST.cfg.theme = t; ST.save();
  document.documentElement.setAttribute('data-theme', t);
  UI.renderTop();
}
async function withBusy(msg, fn){
  const m = modal({ title:'Procesando', html:'<div style="text-align:center;padding:22px">' +
    '<div style="font-size:34px">⏳</div><div style="margin-top:11px;font-size:14px">' + esc(msg) + '</div>' +
    '<div class="hint" style="margin-top:8px">Puede tardar unos segundos.</div></div>', footer:'' });
  await new Promise(r => setTimeout(r, 60));
  try { const r = await fn(); m.close(); toast('Listo ✓', 'ok'); return r; }
  catch(err){ m.close(); console.error(err); toast('Error: ' + err.message, 'bad', 8000); }
}
function exportJSON(){
  const p = ST.proj();
  const payload = { app:'Rehavid LSS DMAIC', version:APP_VERSION, exportado:new Date().toISOString(),
    cfg:{ logos:ST.cfg.logos, arlNombre:ST.cfg.arlNombre, empresaNombre:ST.cfg.empresaNombre }, proyecto:p };
  download(new Blob([JSON.stringify(payload, null, 1)], { type:'application/json' }),
    XL.sanitize(p.nombre) + '.rehavid.json');
  toast('Copia de seguridad descargada', 'ok');
}
function importJSON(){
  const i = document.createElement('input');
  i.type = 'file'; i.accept = '.json,application/json';
  i.onchange = () => {
    const f = i.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        const proyectos = o.proyecto ? [o.proyecto] : (o.projects || (o.db && o.db.projects) || []);
        if (!proyectos.length) throw new Error('El archivo no contiene proyectos');
        proyectos.forEach(p => { p.id = uid(); ST.db.projects.push(p); });
        ST.db.activeId = ST.db.projects[ST.db.projects.length - 1].id;
        if (o.cfg && o.cfg.logos) Object.assign(ST.cfg.logos, o.cfg.logos);
        ST.save(true); UI.renderTop(); go('inicio');
        toast('Se importaron ' + proyectos.length + ' proyecto(s)', 'ok');
      } catch(e){ toast('Archivo inválido: ' + e.message, 'bad', 7000); }
    };
    r.readAsText(f);
  };
  i.click();
}

/* --------------------------------------------------------------- BOOT */
function boot(){
  ST.load();
  document.documentElement.setAttribute('data-theme', ST.cfg.theme || 'dark');
  if (ST.cfg.navmin) document.body.classList.add('navmin');
  if (typeof INFO !== 'undefined') { try { INFO.montar(); } catch(e){ console.warn('infografías', e); } }
  UI.renderTop();
  bindGlobal();
  try { const r = JSON.parse(ST.cfg.lastRoute || '{}'); if (r.view) Object.assign(ROUTE, r); } catch(e){}
  if (ROUTE.view === 'tool' && !TOOL_BY_ID[ROUTE.tool]) { ROUTE.view = 'inicio'; ROUTE.tool = null; }
  UI.renderNav();
  UI.renderView();
  console.log('%cRehavid LSS DMAIC ' + APP_VERSION, 'color:#12B3A6;font-weight:bold',
    '· ' + TOOLS.length + ' herramientas cargadas');
}
