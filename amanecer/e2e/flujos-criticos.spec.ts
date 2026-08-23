// Flujos críticos E2E (§11 pruebas): configuración inicial del cuidador,
// check-in diario completo, y SOS → pantalla roja con llamada a un toque.

import { expect, test, type Page } from '@playwright/test';

/** Completa la configuración inicial (cuidador) hasta llegar al inicio de ella. */
async function configurarPerfil(page: Page) {
  await page.goto('/');
  await page.getByLabel(/¿Cómo se llama ella/).fill('Rosa');
  await page.getByRole('button', { name: 'Guardar y empezar' }).click();
  // PIN 1111 dos veces (crear + confirmar)
  for (let vuelta = 0; vuelta < 2; vuelta++) {
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: '1', exact: true }).click();
    }
  }
  await expect(page.getByText(/Rosa/)).toBeVisible();
}

test('configuración inicial y check-in completo en toques simples', async ({ page }) => {
  await configurarPerfil(page);

  // Inicio: la invitación al check-in es el objetivo primario.
  await page.getByRole('button', { name: 'Contarle ›' }).click();

  // 1. Ánimo
  await page.getByRole('button', { name: 'Bien', exact: true }).click();
  // 2. Dolor: No
  await page.getByRole('button', { name: 'No', exact: true }).click();
  // 3. Respiración: Bien
  await page.getByRole('button', { name: 'Bien', exact: true }).click();
  // 4. Sueño: Bien
  await page.getByRole('button', { name: 'Bien', exact: true }).click();
  // 5. Tragar: No
  await page.getByRole('button', { name: 'No', exact: true }).click();
  // 6. Saliva: No
  await page.getByRole('button', { name: 'No', exact: true }).click();
  // 7. Energía: Buena
  await page.getByRole('button', { name: /Buena/ }).click();
  // 8. Nota: No, gracias
  await page.getByRole('button', { name: 'No, gracias' }).click();

  // Cierre cálido con su nombre.
  await expect(page.getByText(/Listo, Rosa/)).toBeVisible();
  await page.getByRole('button', { name: 'Volver al inicio' }).click();
  await expect(page.getByText(/ya me contó/)).toBeVisible();
});

test('respiración "me falta mucho el aire" ahora → pantalla roja inmediata (R1)', async ({
  page,
}) => {
  await configurarPerfil(page);
  await page.getByRole('button', { name: 'Contarle ›' }).click();
  // Saltar hasta respiración con "Pasar" (siempre visible, §6.1).
  await page.getByRole('button', { name: 'Pasar' }).click(); // ánimo
  await page.getByRole('button', { name: 'Pasar' }).click(); // dolor
  await page.getByRole('button', { name: /Me falta mucho el aire/ }).click();
  await page.getByRole('button', { name: 'Sí, ahora mismo' }).click();

  // Roja: interrumpe todo, texto grande, llamada a un toque.
  await expect(page.getByText('ESTO ES URGENTE')).toBeVisible();
  await expect(page.getByRole('link', { name: /LLAMAR 123/ })).toHaveAttribute(
    'href',
    'tel:123',
  );
});

test('SOS del directorio → pantalla roja con 123 (R4), en ≤2 toques', async ({ page }) => {
  await configurarPerfil(page);
  await page.getByRole('button', { name: /¿A quién llamo/ }).click();
  // La tarjeta de emergencia es la primera y ofrece 123 directo (1 toque = llamar).
  await expect(page.getByRole('link', { name: /Llamar 123/ })).toHaveAttribute(
    'href',
    'tel:123',
  );
  await page.getByRole('button', { name: /SOS/ }).click();
  await expect(page.getByText('ESTO ES URGENTE')).toBeVisible();
});

test('el modo cuidador exige PIN y abre el panel', async ({ page }) => {
  await configurarPerfil(page);
  await page.getByRole('button', { name: 'Soy el cuidador' }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '1', exact: true }).click();
  }
  await expect(page.getByText('Panel de la semana')).toBeVisible();
});
