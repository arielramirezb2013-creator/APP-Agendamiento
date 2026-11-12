// Iconografía: SVG decorativos, tamaños, sin acumulación, informe exportado y archivo autocontenido.
const L = require('./lib');
(async () => {
  const { srv, url } = await L.serve(); const b = await L.launch(); const ctx = await L.contexto(b); const errs = []; const { T, fin } = L.informe();
  const { F, code } = await L.crearSesion(ctx, url, errs, 'Sesión iconos');
  const ana = await L.unir(ctx, url, errs, code, 'Ana', 'tra'); const beto = await L.unir(ctx, url, errs, code, 'Beto', 'eps');
  await L.click(F, '[data-act="iniciar"]'); await L.w(400); await F.reload({ waitUntil: 'domcontentloaded' }); await L.w(400); await beto.reload({ waitUntil: 'domcontentloaded' }); await L.w(400);
  await L.click(beto, '[data-act="ver-todo"]'); await L.w(400);
  const n1 = await beto.evaluate(() => document.querySelectorAll('#vista svg.bp-icon').length);
  await L.click(beto, '[data-act="ver-todo"]'); await L.w(300); await L.click(beto, '[data-act="ver-todo"]'); await L.w(300);
  const n2 = await beto.evaluate(() => document.querySelectorAll('#vista svg.bp-icon').length); T('iconos no se acumulan al re-renderizar', n1 === n2, n1 + ' = ' + n2);
  const svg = await beto.evaluate(() => { const all = [...document.querySelectorAll('svg.bp-icon')]; return { total: all.length, hidden: all.filter(s => s.getAttribute('aria-hidden') === 'true' && s.getAttribute('focusable') === 'false').length, inOption: document.querySelectorAll('option svg').length, viewBox: all.every(s => s.getAttribute('viewBox') === '0 0 24 24') }; });
  T('todos los SVG son decorativos, ninguno en <option>, viewBox 24', svg.hidden === svg.total && svg.inOption === 0 && svg.viewBox, JSON.stringify(svg));
  const sizes = await beto.evaluate(() => { const m = {}; [...document.querySelectorAll('svg.bp-icon')].forEach(s => { const r = s.getBoundingClientRect(); const k = Math.round(r.width) + 'x' + Math.round(r.height); m[k] = (m[k] || 0) + 1; }); return m; });
  T('iconos cuadrados (proporción conservada)', Object.keys(sizes).every(k => { const [a, c] = k.split('x'); return a === c; }), JSON.stringify(sizes));
  T('recorrido completo con iconos de actores EPS y ARL', await beto.evaluate(() => { const t = document.querySelector('table.sb'); return !!t && /EPS/.test(t.textContent) && /ARL/.test(t.textContent) && t.querySelectorAll('svg.bp-icon').length > 20; }));
  const ids = await beto.evaluate(() => typeof BPIcons !== 'undefined' && BPIcons.ids.length); T('kit de iconos cargado (154 identificadores)', ids === 154, String(ids));
  await L.click(beto, '[data-act="ver-todo"]');
  for (let i = 0; i < 11; i++) { await F.fill('input[data-in="f-just"]', 'prueba de iconos').catch(() => {}); const ex = await F.$('[data-act="avanzar-exc"]'); if (ex) await L.click(F, '[data-act="avanzar-exc"]'); else await L.click(F, '[data-act="avanzar"]'); await L.w(250); }
  await L.click(F, '[data-act="fsub"][data-arg="resultados"]'); await L.w(400);
  const html = L.fs.readFileSync(await (await L.descargar(F, '[data-act="exp-informe"]')).path(), 'utf8');
  T('informe exportado conserva SVG en línea y CSS .bp-icon, sin botones', /<svg[^>]*class="bp-icon/.test(html) && /\.bp-icon\{/.test(html) && !/<button/.test(html), (html.match(/<svg/g) || []).length + ' svg');
  await F.setViewportSize({ width: 390, height: 844 }); await L.w(300); const sw = await F.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); T('resultados a 390 px sin desbordamiento', sw[0] <= sw[1], sw.join('/'));
  const off = await ctx.newPage(); await off.route(/googleapis|gstatic/, r => r.abort()); await off.goto('file://' + L.path.join(L.ROOT, 'service-blueprint-simulacion.html'), { waitUntil: 'domcontentloaded' }); await L.w(400);
  T('archivo autocontenido abre desde file:// con iconos', await off.evaluate(() => document.querySelectorAll('#vista svg.bp-icon').length > 3 && typeof BPIcons !== 'undefined'));
  const rc = fin(errs); await b.close(); srv.close(); process.exit(rc);
})().catch(e => { console.log('ERR', e.message.split('\n')[0]); process.exit(1); });
