import http from 'node:http';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const html = readFileSync(process.argv[2]);
const server = http.createServer((_, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(html);
});
await new Promise((r) => server.listen(4603, r));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 1100 } });
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto('http://localhost:4603');
  await page.getByText('PROMPT MAESTRO').first().waitFor({ timeout: 8000 });
  const h2 = await page.locator('main h2').count();
  const tablas = await page.locator('main table').count();
  const citas = await page.locator('main blockquote').count();
  const prompt = await page.evaluate(() => {
    const desde = MD.indexOf('## 1.');
    const corte = MD.indexOf('\n---', desde);
    return MD.slice(desde, corte).split('\n').filter((l) => /^>\s?/.test(l)).map((l) => l.replace(/^>\s?/, '')).join('\n').trim();
  });
  console.log('h2:', h2, '· tablas:', tablas, '· citas:', citas);
  console.log('prompt maestro:', prompt.length, 'caracteres · empieza:', prompt.slice(0, 60));
  console.log('errores JS:', errores.length ? errores : 'ninguno');
  await page.screenshot({ path: process.argv[2] + '.png', fullPage: false });
  await page.evaluate(() => window.scrollTo(0, 2400));
  await page.screenshot({ path: process.argv[2] + '.2.png' });
} finally {
  await browser.close();
  server.close();
}
