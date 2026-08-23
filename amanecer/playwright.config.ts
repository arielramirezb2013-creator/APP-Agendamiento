import { defineConfig } from '@playwright/test';

// Flujos críticos (§11): check-in completo y SOS. Corren contra el build real.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 390, height: 844 }, // teléfono en vertical
    // En CI/entornos gestionados con Chromium preinstalado, PW_CHROMIUM_PATH
    // evita descargar navegadores (p. ej. /opt/pw-browsers/chromium).
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : undefined,
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
