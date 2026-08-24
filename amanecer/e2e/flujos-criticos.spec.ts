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
  // 7. Habla: Bien, como siempre
  await page.getByRole('button', { name: 'Bien, como siempre' }).click();
  // 8. Movilidad: Bien, sola
  await page.getByRole('button', { name: 'Bien, sola' }).click();
  // 9. Energía: Buena
  await page.getByRole('button', { name: /Buena/ }).click();
  // 10. Nota: No, gracias
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

test('todas las secciones a la vista: red de apoyo, mi semana y cuestionario del mes', async ({
  page,
}) => {
  await configurarPerfil(page);
  // Invitación mensual al cuestionario (sin registros previos).
  await expect(page.getByText(/cuestionario del mes/i)).toBeVisible();

  // Red de apoyo: nacional (ACELA) siempre presente, con opción de preguntar.
  await page.getByRole('button', { name: /Mi red de apoyo/ }).click();
  await expect(page.getByText(/ACELA/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Preguntar algo/ }).first()).toBeVisible();
  await page.getByRole('button', { name: '‹ Volver' }).click();

  // Mi semana existe y no alarma cuando está vacía.
  await page.getByRole('button', { name: /Mi semana/ }).click();
  await expect(page.getByText(/se verá su semana|se verá tu semana/)).toBeVisible();
});

test('el cuestionario del mes guarda por subescalas', async ({ page }) => {
  await configurarPerfil(page);
  await page.getByRole('button', { name: 'Empezar', exact: true }).click();
  // Responder las 12 preguntas con la primera opción (4 puntos).
  for (let i = 0; i < 12; i++) {
    await page
      .locator('main')
      .getByRole('button')
      .first()
      .click();
  }
  await expect(page.getByText(/Habla, saliva y tragar/)).toBeVisible();
  // Perfil por subescalas: bulbar 12/12, motora 24/24, respiratoria 12/12.
  await expect(page.getByText('12/12')).toHaveCount(2);
  await expect(page.getByText('24/24')).toBeVisible();
});

test('la comunidad muestra grupos, experiencias con sello y lugares con mapa', async ({
  page,
}) => {
  await configurarPerfil(page);
  await page.getByRole('button', { name: 'Comunidad' }).click();
  await expect(page.getByText('Experiencias compartidas')).toBeVisible();
  await expect(page.getByText(/banco de voz/i)).toBeVisible();
  await expect(
    page.getByText(/Experiencia personal — no es consejo médico/).first(),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Cómo llegar/ }).first()).toHaveAttribute(
    'href',
    /google\.com\/maps/,
  );

  // Compartir una experiencia propia queda guardada localmente.
  await page.getByRole('button', { name: /Contar mi experiencia/ }).click();
  await page.getByRole('button', { name: '⌨️ Escribir' }).click();
  await page
    .getByLabel(/¿Qué le ha servido/)
    .fill('El cojín de la abuela me ayudó a estar más cómoda en la sala.');
  await page.getByRole('button', { name: 'Seguir' }).click();
  await page.getByRole('button', { name: /La ELA en el día a día/ }).click();
  await expect(page.getByText(/Guardada ✓/)).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();
  await expect(page.getByText(/cojín de la abuela/)).toBeVisible();
  await expect(page.getByText(/· Tuya/)).toBeVisible();
});

test('el modo cuidador exige PIN y abre el panel', async ({ page }) => {
  await configurarPerfil(page);
  await page.getByRole('button', { name: 'Soy el cuidador' }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '1', exact: true }).click();
  }
  await expect(page.getByText('Panel de la semana')).toBeVisible();
});
