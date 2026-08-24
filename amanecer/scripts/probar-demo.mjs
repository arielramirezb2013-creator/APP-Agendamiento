// Prueba de humo de la demo: sirve el HTML, entra al iframe, completa la
// configuración inicial y verifica que el inicio de la paciente aparece.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const html = readFileSync(process.argv[2]);
const server = http.createServer((_, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(html);
});
await new Promise((r) => server.listen(4599, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  // Vista de escritorio: debe verse el marco de teléfono.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:4599');
  const frame = page.frameLocator('#app');
  await frame.getByText('Configuración inicial').waitFor({ timeout: 15000 });
  console.log('OK escritorio: la app arrancó dentro del marco');

  // Completar la configuración (nombre + PIN) para validar IndexedDB.
  await frame.getByLabel(/¿Cómo se llama ella/).fill('Rosa');
  await frame.getByRole('button', { name: 'Guardar y empezar' }).click();
  for (let v = 0; v < 2; v++) {
    for (let i = 0; i < 4; i++) {
      await frame.getByRole('button', { name: '1', exact: true }).click();
    }
  }
  await frame.getByText(/Rosa/).first().waitFor({ timeout: 10000 });
  await frame.getByRole('button', { name: 'Contarle ›' }).waitFor();
  console.log('OK IndexedDB: perfil creado, inicio de paciente visible');

  // Reiniciar demo debe volver al primer arranque.
  await page.getByRole('button', { name: /Reiniciar la demo/ }).click();
  await frame.getByText('Configuración inicial').waitFor({ timeout: 15000 });
  console.log('OK reinicio: la demo volvió al primer arranque');
  await page.screenshot({ path: process.argv[2] + '.escritorio.png' });

  // Vista móvil: pantalla completa con barra fina.
  const movil = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await movil.goto('http://localhost:4599');
  await movil.frameLocator('#app').getByText('Configuración inicial').waitFor({ timeout: 15000 });
  const barra = await movil.getByText('demo de prueba').isVisible();
  console.log(`OK móvil: app a pantalla completa, barra de demo visible=${barra}`);
  await movil.screenshot({ path: process.argv[2] + '.movil.png' });
} finally {
  await browser.close();
  server.close();
}
console.log('TODO OK');
