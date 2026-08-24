// Build de DEMO: toda la app en un único index.html autocontenido (JS, CSS,
// fuentes e íconos inlined). Se usa para la demo interactiva embebida en un
// artefacto; la PWA real se sigue construyendo con vite.config.ts.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      'virtual:pwa-register': fileURLToPath(
        new URL('./src/pwa/registerSW-stub.ts', import.meta.url),
      ),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist-demo',
    assetsInlineLimit: 100_000_000, // fuentes e íconos como data URI
    chunkSizeWarningLimit: 5_000,
  },
});
