// Capturas de revisión visual de la demo con datos de ejemplo.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [ruta, dirSalida] = process.argv.slice(2);
const html = readFileSync(ruta);
const server = http.createServer((_, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(html);
});
await new Promise((r) => server.listen(4601, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:4601');
  const f = page.frameLocator('#app');

  // Configuración inicial
  await f.getByLabel(/¿Cómo se llama ella/).fill('Rosa');
  await f.getByRole('button', { name: 'Guardar y empezar' }).click();
  for (let v = 0; v < 2; v++)
    for (let i = 0; i < 4; i++)
      await f.getByRole('button', { name: '1', exact: true }).click();
  await f.getByRole('button', { name: 'Contarle ›' }).waitFor();

  // Sembrar datos de ejemplo directamente en IndexedDB del iframe (4 semanas).
  await page.frames()[1].evaluate(async () => {
    const abrir = () =>
      new Promise((res, rej) => {
        const req = indexedDB.open('amanecer');
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
    const db = await abrir();
    const poner = (tabla, filas) =>
      new Promise((res, rej) => {
        const tx = db.transaction(tabla, 'readwrite');
        const st = tx.objectStore(tabla);
        filas.forEach((fila) => st.put(fila));
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });
    const dia = (n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString().slice(0, 10);
    };
    const checkins = [];
    const animos = [4, 4, 3, 5, 4, 2, 3, 4, 4, 3, 4, 5, 4, 4, 3, 2, 3, 4, 4, 5, 4, 3, 4, 4];
    for (let i = 1; i <= 24; i++) {
      checkins.push({
        id: `demo-c${i}`,
        fecha: dia(i),
        animo: animos[i - 1],
        llenado: { por: 'paciente', fecha: `${dia(i)}T08:00:00` },
        banderas: [],
      });
    }
    await poner('checkins', checkins);
    const pesos = [62.5, 62.1, 62.3, 61.8, 61.9, 61.5, 61.6, 61.2].map((kg, i) => ({
      id: `demo-p${i}`,
      fecha: dia((7 - i) * 7 + 2),
      kg,
      llenado: { por: 'cuidador', fecha: `${dia((7 - i) * 7 + 2)}T09:00:00` },
    }));
    await poner('pesos', pesos);
    const sub = { bulbar: 10, motora: 20, respiratoria: 11 };
    await poner('alsfrs', [
      {
        id: 'demo-a1',
        fecha: dia(60),
        items: [4, 3, 3, 4, 3, 4, 3, 3, 2, 4, 4, 3],
        sub: { bulbar: 10, motora: 19, respiratoria: 11 },
        total: 40,
        autorreporte: true,
        borrador: false,
        llenado: { por: 'paciente', fecha: `${dia(60)}T10:00:00` },
      },
      {
        id: 'demo-a2',
        fecha: dia(30),
        items: [4, 3, 3, 4, 3, 3, 3, 3, 2, 4, 4, 3],
        sub,
        total: 41,
        autorreporte: true,
        borrador: false,
        llenado: { por: 'paciente', fecha: `${dia(30)}T10:00:00` },
      },
    ]);
    db.close();
  });
  await page.reload();

  await f.getByRole('button', { name: 'Contarle ›' }).waitFor();
  await page.screenshot({ path: `${dirSalida}/v2-inicio.png` });

  await f.getByRole('button', { name: /Mi semana/ }).click();
  await f.getByText(/Ánimo de los últimos días/).waitFor();
  await page.screenshot({ path: `${dirSalida}/v2-mi-semana.png`, fullPage: false });

  await f.getByRole('button', { name: '‹ Volver' }).click();
  await f.getByRole('button', { name: /Mi red de apoyo/ }).click();
  await f.getByText(/ACELA/).waitFor();
  await page.screenshot({ path: `${dirSalida}/v2-red.png` });

  // Panel del cuidador con las gráficas
  await f.getByRole('button', { name: '‹ Volver' }).click();
  await f.getByRole('button', { name: 'Soy el cuidador' }).click();
  for (let i = 0; i < 4; i++)
    await f.getByRole('button', { name: '1', exact: true }).click();
  await f.getByText('Panel de la semana').waitFor();
  await page.screenshot({ path: `${dirSalida}/v2-panel.png` });
} finally {
  await browser.close();
  server.close();
}
console.log('capturas listas');
