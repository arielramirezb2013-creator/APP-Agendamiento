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

/* ===== Ayudas añadidas para tests/e2e.js (las anteriores no cambian) ===== */
// Almacén local de la modalidad presencial: un documento por clave en localStorage ('sbsim_doc_v2:<ruta>').
// El lector también entiende el formato anterior (un solo objeto en 'sbsim_db_v1').
async function almacen(pg) { return pg.evaluate(() => (() => { const d = {}; try { Object.assign(d, JSON.parse(localStorage.getItem('sbsim_db_v1') || '{}')); } catch (e) {} for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('sbsim_doc_v2:') === 0) { try { d[k.slice(13)] = JSON.parse(localStorage.getItem(k)); } catch (e) {} } } return d; })()); }
// Sesión, participantes y registros (todas las versiones, por orden de creación) tal como están guardados.
async function estado(pg, code) {
  const d = await almacen(pg), base = 'sesiones/' + code, de = sub => Object.keys(d).filter(k => k.indexOf(base + '/' + sub + '/') === 0).map(k => d[k]);
  const regs = de('registros').sort((a, b) => (a.t || 0) - (b.t || 0)); const reemplazados = {}; regs.forEach(r => { if (r.reemplaza) reemplazados[r.reemplaza] = 1; });
  return { ses: d[base] || null, parts: de('participantes').sort((a, b) => (a.creado || 0) - (b.creado || 0)), regs, vigentes: regs.filter(r => !reemplazados[r.id]) };
}
// Espera activa en Node: devuelve el primer valor verdadero de fn() o null si vence el plazo (no lanza).
async function esperar(fn, ms, paso) { const fin = Date.now() + (ms || 6000); for (;;) { let v = null; try { v = await fn(); } catch (e) { v = null; } if (v) return v; if (Date.now() >= fin) return null; await w(paso || 80); } }
// Espera a que la página cumpla una condición; devuelve true/false (no lanza).
async function ve(pg, fn, arg, ms) { return pg.waitForFunction(fn, arg, { timeout: ms || 6000 }).then(() => true, () => false); }
// Quita el foco del campo activo para que la vista se repinte (el render se pospone mientras un campo tiene el foco).
async function soltar(pg) { await pg.evaluate(() => { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur(); }); await w(250); }
// Marca una casilla por DOM con foco (solo si no lo está): dispara input y change como un clic real.
async function marcar(pg, sel) { await pg.waitForSelector(sel, { state: 'attached' }); const hecho = await pg.$eval(sel, el => { if (el.checked) return false; el.focus(); el.click(); return true; }); await w(150); return hecho; }
// Latido: cada pestaña de participante escribe su «ultimo» cada 30 s, y el almacén local guarda el objeto entero desde la
// copia de la pestaña que escribe. Si un latido cae a pocos milisegundos de otra escritura, una de las dos se pierde.
// calma() lee cuándo late cada pestaña y, si viene un latido dentro de la ventana, espera a verlo guardado antes de seguir;
// así la acción que escribe a continuación no coincide con él. Devuelve los milisegundos que esperó.
async function calma(pg, code, ventana) {
  const T = 30000, antes = ventana || 1200, tope = 2500, t0 = Date.now(); let total = 0;
  while (Date.now() - t0 < 20000) {
    const ult = await pg.evaluate(c => { try { const d = (() => { const d = {}; try { Object.assign(d, JSON.parse(localStorage.getItem('sbsim_db_v1') || '{}')); } catch (e) {} for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('sbsim_doc_v2:') === 0) { try { d[k.slice(13)] = JSON.parse(localStorage.getItem(k)); } catch (e) {} } } return d; })(); return Object.keys(d).filter(k => k.indexOf('sesiones/' + c + '/participantes/') === 0).map(k => d[k].ultimo || 0).filter(Boolean); } catch (e) { return []; } }, code);
    const ahora = Date.now(); let espera = 0;
    ult.forEach(u => {
      const edad = ahora - u, desde = ((edad % T) + T) % T, falta = T - desde;
      if (edad < 80) espera = Math.max(espera, 80 - edad);                    // acaba de latir: se deja asentar
      else if (falta <= antes) espera = Math.max(espera, Math.min(falta, 120)); // viene un latido: se espera a que toque
      else if (edad >= T && desde <= tope) espera = Math.max(espera, 40);       // ya tocaba y aún no consta: se espera a verlo
    });
    if (!espera) break; total += espera; await w(espera);
  }
  return total;
}
// Varios participantes entran seguidos: todas las pestañas se abren y se llenan antes, y entran una tras otra, cada una
// cuando la anterior ya quedó guardada y la siguiente la ve. Así sus latidos quedan agrupados en pocos segundos.
async function unirVarios(ctx, url, errs, code, gente) {
  const pags = await Promise.all(gente.map(() => pagina(ctx, url, errs))); const P = {};
  for (let i = 0; i < gente.length; i++) { await pags[i].fill('input[data-in="e-code"]', code); await pags[i].fill('input[data-in="e-nombre"]', gente[i][0]); await pags[i].selectOption('select[data-in="e-actor"]', gente[i][1]); P[gente[i][0]] = pags[i]; }
  const consta = (pg, nombre) => ve(pg, a => { try { const d = (() => { const d = {}; try { Object.assign(d, JSON.parse(localStorage.getItem('sbsim_db_v1') || '{}')); } catch (e) {} for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('sbsim_doc_v2:') === 0) { try { d[k.slice(13)] = JSON.parse(localStorage.getItem(k)); } catch (e) {} } } return d; })(); return Object.keys(d).some(k => k.indexOf('sesiones/' + a.c + '/participantes/') === 0 && d[k].nombre === a.n && d[k].ultimo > 0); } catch (e) { return false; } }, { c: code, n: nombre });
  for (let i = 0; i < gente.length; i++) { await click(pags[i], '[data-act="entrar-part"]'); await ve(pags[i], () => !!document.querySelector('.pside')); await consta(pags[i], gente[i][0]); if (pags[i + 1]) { await consta(pags[i + 1], gente[i][0]); await w(80); } }
  return P;
}
module.exports = { serve, launch, w, click, txt, descargar, contexto, pagina, crearSesion, unir, informe, almacen, estado, esperar, ve, soltar, marcar, calma, unirVarios, ROOT, SALIDA, fs, path };
