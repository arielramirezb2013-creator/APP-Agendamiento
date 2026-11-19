/* ============ documentos-sinteticos.html: todos los documentos de los casos, para el investigador ============
   Un índice por caso y, en cada uno, cada soporte con sus versiones: la que llega al radicar y la de referencia
   que el participante obtiene cuando la pide. Aquí sí van los códigos del instrumento (soportes, versiones,
   identificadores de caso): esta página es del investigador y no se publica a los participantes. */
(function anexoDocs() {
  const casoHtml = c => {
    const D = DOCS.exp[c.id]; if (!D) return "";
    const sops = c.soportes.map(s => {
      const vs = Object.keys((D.soportes || {})[s.k] || {});
      return `<div class="anexo-sop"><h3>${esc(s.k)} · ${esc(s.n)} <span class="mini">· custodia ${esc(s.custN)} · al radicar: ${esc((EXP.estados[s.estado] || { n:s.estado }).n)}${s.ver ? " " + esc(s.ver) : ""} · referencia ${esc(s.verRef)}</span></h3>
        <p class="mini">${esc(s.notaEstado)} Criterio: ${esc(s.criterio)}</p>
        ${vs.map(v => `<details data-det="anexo-${esc(c.id)}-${esc(s.k)}-${esc(v)}"><summary><b>${esc(v)}</b> ${esc(D.soportes[s.k][v].titulo)} <span class="mini">· ${esc(v === s.verRef ? (v === s.ver ? "llega al radicar y es la de referencia" : "versión de referencia, cuando se pide") : "llega al radicar")}</span></summary>${docHtml(D.soportes[s.k][v], {})}</details>`).join("")}</div>`;
    }).join("");
    return `<section class="panel anexo-caso" id="caso-${esc(c.id)}"><h2>${esc(c.id)} · ${esc(c.persona.nombre)}</h2><p>${esc(c.titulo)}. ${esc(c.clinica.diagnostico)} · PCL ${esc(String(c.clinica.pcl).replace(".", ","))} %.</p>${sops}</section>`;
  };
  const rutaHtml = () => {
    const out = [];
    Object.keys(DOCS.ruta).forEach(pid => {
      const R = DOCS.ruta[pid], nombre = PERFIL_BASE && PERFIL_BASE.id === pid ? PERFIL_BASE.persona.nombre : pid;
      out.push(`<section class="panel anexo-caso" id="ruta-${esc(pid)}"><h2>Ruta de incapacidad · ${esc(nombre)}</h2><p class="mini">En la simulación, el participante ve tachado lo que no llegó a su entidad en ese punto del caso.</p>${Object.keys(R.piezas || {}).map(k => `<details data-det="anexo-ruta-${esc(pid)}-${esc(k)}"><summary><b>${esc(EV[k] ? EV[k].sl : k)}</b> ${esc(R.piezas[k].titulo)}</summary>${docHtml(R.piezas[k], {})}</details>`).join("")}</section>`);
    });
    return out.join("");
  };
  const indice = `<nav class="panel" aria-label="Casos"><h2>Casos</h2><ul class="lista">${EXP.casos.filter(c => DOCS.exp[c.id]).map(c => `<li><a href="#caso-${esc(c.id)}">${esc(c.id)} · ${esc(c.persona.nombre)} · ${esc(c.titulo)}</a></li>`).join("")}${Object.keys(DOCS.ruta).map(pid => `<li><a href="#ruta-${esc(pid)}">Ruta de incapacidad · ${esc(PERFIL_BASE && PERFIL_BASE.id === pid ? PERFIL_BASE.persona.nombre : pid)}</a></li>`).join("")}</ul></nav>`;
  pintar("vista", `<div class="hoja anexo"><h1>Documentos sintéticos de los casos</h1>
    <p>Lo que un actor real tendría en la mano en cada caso de la simulación: solicitudes, dictámenes, constancias, certificados, historia clínica con sus exámenes e imágenes diagnósticas, informes de higiene y de puesto, historia laboral. Son sintéticos y verosímiles, y coinciden con el expediente del instrumento: cada versión muestra el defecto que la hace no conforme y la versión de referencia lo resuelve.</p>
    <p class="mini">El participante abre cada documento desde el soporte o la pieza que tiene a la vista («Ver el documento»). Esta página no se publica a los participantes.</p>
    ${indice}${EXP.casos.map(casoHtml).join("")}${rutaHtml()}</div>`);
})();
