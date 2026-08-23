# Amanecer — Bitácora de cuidado para ELA

PWA offline-first para que una persona con ELA (esclerosis lateral amiotrófica)
cuente cada mañana cómo está en menos de 2 minutos, la app sepa a quién llamar
cuando algo no anda bien, y su equipo médico reciba en cada control una foto
fiel de sus últimas semanas.

> **Amanecer es una bitácora personal de apoyo. No es un dispositivo médico ni
> reemplaza la valoración del equipo de salud.**

La especificación completa del producto vive en [`CLAUDE.md`](./CLAUDE.md).

## Qué incluye este MVP (100% offline, sin backend)

- **Check-in diario conversacional** — 8 preguntas, una por pantalla, chips de
  64 px, todas omitibles ("Pasar"), editable, llenable por el cuidador.
- **Episodios ("Pasó algo")** — caída, atragantamiento, falta de aire,
  laringoespasmo, llanto/risa sin control, crisis emocional, fiebre, otro; con
  microcopy de contención por tipo (`src/copy/episodes.ts`).
- **Comidas y peso** — registro en ≤3 toques; "se atoró" crea episodio
  vinculado; peso semanal con teclado gigante y tendencia de 8 semanas.
- **Directorio "¿A quién llamo?"** — tarjetas por tema, emergencia roja
  primera (123 precargado + ACELA), llamada en ≤2 toques, botón SOS.
- **Motor de banderas** (`src/rules/flags.ts`) — reglas rojas R1–R5 y ámbar
  A1–A12 como funciones puras con trazabilidad a NICE NG42 / EAN 2024 / MND
  Association, 100% cubiertas por tests. Máx. 1 tarjeta ámbar por sesión;
  nunca diagnostica.
- **Recordatorios locales** — medicinas con confirmación de 1 toque, citas,
  plantilla de laboratorios de riluzol (orientativa, confirmable con el médico).
- **Modo cuidador con PIN** — panel semanal, registros "en nombre de",
  contactos, medicinas, ajustes, checklist de señales urgentes, "Mi plan".
- **Reporte de Control en PDF** — 2 páginas generadas offline (jsPDF),
  marcadas como autorreporte.
- **Notas de voz y dictado** — MediaRecorder + Web Speech API es-CO.
- **Respaldo cifrado** — export/import AES-GCM con contraseña del cuidador;
  "Borrar todo" con doble confirmación y PIN.

## Desarrollo

```bash
npm install
npm run dev        # desarrollo
npm test           # tests unitarios de reglas (Vitest)
npm run lint       # ESLint + jsx-a11y estricto
npm run build      # producción (PWA con service worker)
PW_CHROMIUM_PATH=/ruta/a/chromium npm run test:e2e  # flujos críticos (Playwright)
```

## Principios no negociables (§3 de la especificación)

Objetivos táctiles ≥64 px (primario 72 px) · una acción principal por pantalla ·
sin swipe/drag/long-press/temporizadores · tipografía Atkinson Hyperlegible
≥20 px · contraste AAA · estado siempre con ícono + palabra · foco visible de
3 px · `prefers-reduced-motion` · offline-first: nada se pierde sin red ·
la app **orienta, nunca diagnostica**.

## Estructura

```
src/
  content/es-CO.ts      ← TODO texto visible (revisable por la familia)
  copy/episodes.ts      ← microcopy de contención por episodio
  design/tokens.ts      ← únicos tokens de color/tipografía permitidos
  rules/                ← reglas clínicas puras + tests (100% cobertura)
  db/                   ← Dexie (IndexedDB), precargas Colombia, respaldo cifrado
  services/             ← banderas, recordatorios, voz
  components/           ← BigChoice, PrimaryButton, CardQuestion, …
  features/             ← checkin, episodios, comidas, directorio, banderas, cuidador, reporte
e2e/                    ← flujos críticos (check-in, R1, SOS, PIN)
```
