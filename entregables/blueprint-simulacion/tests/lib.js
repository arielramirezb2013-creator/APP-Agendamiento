// Utilidades comunes de las pruebas: servidor estático propio, navegador y ayudas de interacción.
// Uso: node tests/<prueba>.js   (requiere Playwright; se busca también en la instalación global)
const http = require('http'), fs = require('fs'), path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '..');
const SALIDA = process.env.SALIDA || path.join(__dirname, 'salida');
fs.mkdirSync(SALIDA, { recursive: true });

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      const f = path.join(ROOT, u === '/' ? 'index.html' : u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}`, url: `http://127.0.0.1:${srv.address().port}/index.html` }));
  });
}
async function launch() {
  const args = ['--proxy-server=direct://', '--proxy-bypass-list=*', '--disable-background-networking'];
  try { return await chromium.launch({ args }); } catch (e) { return chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args }); }
}
const w = ms => new Promise(r => setTimeout(r, ms));
// Clic por DOM: la barra de estado es fija y el render se pospone mientras un campo tiene el foco.
async function click(pg, sel) { await pg.waitForSelector(sel, { state: 'attached' }); await pg.$eval(sel, el => { el.focus(); el.click(); }); await w(250); }
async function txt(pg, sel) { return pg.evaluate(s => (document.querySelector(s) || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), sel); }
// Descarga con reintento: el evento de descarga a veces compite con el repintado.
async function descargar(pg, sel) { for (let i = 0; i < 3; i++) { const ev = pg.waitForEvent('download', { timeout: 5000 }).catch(() => null); await pg.$eval(sel, el => el.click()); const d = await ev; if (d) return d; await w(500); } throw new Error('sin descarga: ' + sel); }

function contexto(browser, opts) { return browser.newContext(Object.assign({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }, opts || {})); }
function pagina(ctx, url, errs) {
  return (async () => {
    const p = await ctx.newPage(); p.setDefaultTimeout(7000);
    p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + ' @ ' + ((e.stack || '').split('\n')[1] || '')));
    p.on('console', m => { if (m.type() === 'error' && !/net::|googleapis|gstatic/.test(m.text())) errs.push('CONSOLE: ' + m.text()); });
    await p.route(/googleapis|gstatic/, r => r.abort());
    await p.goto(url, { waitUntil: 'domcontentloaded' }); await w(300); return p;
  })();
}
async function crearSesion(ctx, url, errs, nombre, pin) {
  const F = await pagina(ctx, url, errs); await F.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await F.reload({ waitUntil: 'domcontentloaded' }); await w(300);
  await F.fill('input[data-in="n-nombre"]', nombre || 'Sesión de prueba'); await F.fill('input[data-in="n-pin"]', pin || '2468'); await click(F, '[data-act="crear"]'); await w(300);
  const code = await F.evaluate(() => (document.querySelector('#top').textContent.match(/código\s*([A-Z0-9]{4})/) || [])[1]);
  return { F, code };
}
async function unir(ctx, url, errs, code, nombre, actor) {
  const p = await pagina(ctx, url, errs); await p.fill('input[data-in="e-code"]', code); await p.fill('input[data-in="e-nombre"]', nombre); await p.selectOption('select[data-in="e-actor"]', actor); await click(p, '[data-act="entrar-part"]'); await w(400); return p;
}
function informe() {
  let ok = 0, fail = 0;
  const T = (nombre, cond, extra) => { cond ? ok++ : fail++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + nombre + (extra ? ' · ' + extra : '')); };
  const fin = errs => { console.log(errs && errs.length ? errs.join('\n') : 'SIN ERRORES DE CONSOLA'); console.log(`RESULTADO: ${ok} OK, ${fail} FAIL`); return fail || (errs && errs.length) ? 1 : 0; };
  return { T, fin };
}
module.exports = { serve, launch, w, click, txt, descargar, contexto, pagina, crearSesion, unir, informe, ROOT, SALIDA, fs, path };
