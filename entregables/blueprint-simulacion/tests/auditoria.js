// Regresión de las correcciones que salieron de la auditoría de código.
// Uso: node tests/auditoria.js
const L = require('./lib');
const { click, txt, w } = L;

async function decidir(pg, o) {
  await click(pg, `[data-act="f"][data-arg="suficiencia"][data-v="${o.suficiencia}"]`);
  if (o.falta) await L.marcar(pg, `input[data-in="f-falta"][data-arg="${o.falta}"]`);
  await pg.selectOption('select[data-in="f-finalidad"]', o.finalidad);
  await click(pg, `[data-act="f"][data-arg="decision"][data-v="${o.decision}"]`);
  await pg.selectOption('select[data-in="f-responde"]', 'yo'); await pg.fill('input[data-in="f-dias"]', String(o.dias || 5));
  await L.soltar(pg); await click(pg, '[data-act="guardar"]'); await w(300);
}
async function focal(pg) {
  await click(pg, '[data-act="f"][data-arg="sabe"][data-v="parcial"]'); await pg.selectOption('select[data-in="f-responde"]', 'eps');
  await click(pg, '[data-act="fm"][data-arg="hizo"][data-v="llevar"]'); await L.soltar(pg); await click(pg, '[data-act="guardar"]'); await w(300);
}
// Registros que cuentan: sin los reemplazados ni los efectos del sistema de una respuesta reemplazada.
function vigentes(regs) { const r = {}; regs.forEach(x => { if (x.reemplaza) r[x.reemplaza] = 1; }); return regs.filter(x => !r[x.id] && !(x.payload && x.payload.origenActividad && r[x.payload.origenActividad])); }

(async () => {
  const { T, fin } = L.informe(), errs = [];
  const s = await L.serve(), br = await L.launch(), ctx = await L.contexto(br);
  try {
    const { F, code } = await L.crearSesion(ctx, s.url, errs, 'Auditoría', '2468');
    T('A1 el PIN no queda escrito en el formulario después de crear la sesión', (await F.evaluate(() => Object.keys(sessionStorage).length)) >= 1 && !(await F.content()).includes('value="2468"'));

    const X = await L.pagina(ctx, s.url + '#s=' + code + '&r=1', errs); await w(600);
    T('A2 los resultados no se abren por enlace mientras la sesión no esté cerrada', !(await X.$('#informe')) && /Los resultados se abren cuando la sesión está cerrada/.test(await txt(X, '#top')), await txt(X, '#top'));
    await X.close();

    const FORMULA = '=HYPERLINK("http://ejemplo.invalid","clic")';
    const P = await L.unirVarios(ctx, s.url, errs, code, [['Ana', 'tra'], [FORMULA, 'ips'], ['Beto', 'eps'], ['Carla', 'eps']]);
    await click(F, '[data-act="iniciar"]'); await w(400);
    await focal(P.Ana); await decidir(P[FORMULA], { suficiencia: 'suficiente', finalidad: 'rehabilitacion', decision: 'expedir' });
    await L.calma(F, code); await click(F, '[data-act="fsub"][data-arg="ejecutar"]'); await click(F, '[data-act="avanzar"]'); await w(500);
    T('A3 el botón de avanzar lleva el paso que muestra', (await L.estado(F, code)).ses.pasoActual === 'A2');

    // A2: la EPS decide sobre su propia pieza (INC) y pide una ajena (HC)
    await decidir(P.Beto, { suficiencia: 'parcial', falta: 'hc', finalidad: 'calificacion', decision: 'pedir', dias: 8 });
    let e = await L.estado(F, code), act = vigentes(e.regs).filter(r => r.tipo === 'actividad' && r.paso === 'A2' && r.participanteNombre === 'Beto')[0];
    T('A4 la evidencia que el propio actor custodia no cuenta como «fuera de su contrato»', !!act && act.payload.comprobacion.piezasDenegadas.length === 0 && (act.payload.comprobacion.piezasPermitidas.inc || []).length === 4, JSON.stringify(act && act.payload.comprobacion));
    const sol1 = vigentes(e.regs).filter(r => r.tipo === 'solicitud' && r.paso === 'A2').length;
    await click(P.Beto, '[data-act="rectificar"]'); await decidir(P.Beto, { suficiencia: 'parcial', falta: 'hc', finalidad: 'calificacion', decision: 'reconocer', dias: 6 });
    e = await L.estado(F, code); const v = vigentes(e.regs);
    T('A5 corregir una respuesta no duplica las solicitudes ni las notificaciones del sistema', sol1 === 1 && v.filter(r => r.tipo === 'solicitud' && r.paso === 'A2').length === 1 && v.filter(r => r.tipo === 'notificacion' && r.paso === 'A2').length === 1 && e.regs.filter(r => r.tipo === 'solicitud' && r.paso === 'A2').length === 2,
      'vigentes ' + v.filter(r => r.tipo === 'solicitud' && r.paso === 'A2').length + ' de ' + e.regs.filter(r => r.tipo === 'solicitud' && r.paso === 'A2').length);
    await click(F, '[data-act="fsub"][data-arg="resultados"]'); await w(300);
    const filaSol = await F.evaluate(() => { const t = document.querySelector('table[data-tabla="indicadores"]'); const f = t && [...t.querySelectorAll('tbody tr')].filter(r => r.cells[0].textContent === 'solicitudes')[0]; return f ? f.cells[1].textContent : null; });
    T('A6 el indicador de solicitudes cuenta solo las vigentes', filaSol === '1', String(filaSol));

    // La segunda representante de la EPS no ve la respuesta de la primera en el recorrido completo
    await click(P.Carla, '[data-act="ver-todo"]'); await w(300);
    const chipsCarla = await P.Carla.evaluate(() => document.querySelectorAll('.sb-regs .chip').length);
    await click(F, '[data-act="fsub"][data-arg="vista"]'); await w(300);
    T('A7 una participante no ve en el recorrido las respuestas de otra persona', chipsCarla === 0, 'chips visibles para Carla: ' + chipsCarla);

    // CSV: un nombre que parece fórmula se neutraliza
    await click(F, '[data-act="fsub"][data-arg="resultados"]'); await w(300);
    const d = await L.descargar(F, '[data-act="csv"][data-arg="participantes"]'), ruta = L.path.join(L.SALIDA, 'auditoria-participantes.csv'); await d.saveAs(ruta);
    const csv = L.fs.readFileSync(ruta, 'utf8');
    T('A8 el CSV neutraliza las celdas que una hoja de cálculo leería como fórmula', csv.includes('"\'=HYPERLINK(') && !/(^|;|\n)"=HYPERLINK/.test(csv), csv.slice(0, 200));

    // Archivar pide confirmar con un segundo clic; una sesión archivada no admite conducción
    await click(F, '[data-act="fsub"][data-arg="cerrar"]'); await w(300);
    await click(F, '[data-act="archivar"]'); await w(300);
    const tras1 = (await L.estado(F, code)).ses.estado;
    await click(F, '[data-act="archivar"]'); await w(400);
    const tras2 = (await L.estado(F, code)).ses.estado;
    T('A9 archivar pide un segundo clic de confirmación', tras1 !== 'archivada' && tras2 === 'archivada', tras1 + ' → ' + tras2);
    const antes = (await L.estado(F, code)).regs.length;
    await F.evaluate(() => { const b = document.createElement('button'); b.setAttribute('data-act', 'pausar'); b.id = 'forzado'; document.body.appendChild(b); b.click(); }); await w(400);
    const despues = await L.estado(F, code);
    T('A10 una sesión archivada ya no admite acciones de conducción', despues.ses.estado === 'archivada' && despues.regs.length === antes && /ya no admite cambios/.test(await txt(F, '#top')), await txt(F, '#top'));

    // Salir revoca la autorización de facilitador en este navegador
    await click(F, '[data-act="salir"]'); await w(300);
    await F.goto(s.url + '#s=' + code, { waitUntil: 'domcontentloaded' }); await F.reload({ waitUntil: 'domcontentloaded' }); await w(600);
    T('A11 después de «Salir», el enlace de la sesión ya no entra como facilitador', !(await F.$('.stepper')) && !(await F.$('[data-act="fsub"]')), await txt(F, '#vista h2'));
  } catch (err) { T('la prueba se interrumpió', false, String(err && err.stack || err).slice(0, 500)); }
  await br.close(); s.srv.close();
  process.exit(fin(errs));
})();
