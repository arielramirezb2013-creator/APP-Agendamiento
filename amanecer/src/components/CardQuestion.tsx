// Patrón de tarjeta de pregunta (§9.2) — layout de todo flujo:
// ‹ Volver (64px) · progreso · pregunta 28px · opciones · pie (Pasar / primario).

import type { ReactNode } from 'react';
import { comun } from '@/content/es-CO';

interface CardQuestionProps {
  pregunta: string;
  progreso?: string; // "Pregunta 2/8"
  onVolver?: () => void;
  onPasar?: () => void;
  children: ReactNode;
  pie?: ReactNode;
}

export function CardQuestion({
  pregunta,
  progreso,
  onVolver,
  onPasar,
  children,
  pie,
}: CardQuestionProps) {
  return (
    <div className="transicion-tarjeta flex min-h-dvh flex-col bg-fondo">
      <header className="flex min-h-chip items-center justify-between px-2">
        {onVolver ? (
          <button
            type="button"
            onClick={onVolver}
            className="min-h-chip min-w-chip rounded-token px-3 text-boton text-tinta"
          >
            {comun.volver}
          </button>
        ) : (
          <span />
        )}
        {progreso ? (
          <span className="mr-2 rounded-full bg-primario-suave px-3 py-1 text-min font-bold text-tinta">
            {progreso}
          </span>
        ) : null}
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 pb-4">
        {/* Bitter también en las preguntas: voz de casa, no de formulario. */}
        <h1 className="font-titular text-pregunta font-semibold text-tinta">{pregunta}</h1>
        <div className="flex flex-col gap-4">{children}</div>
      </main>

      <footer className="safe-area-abajo flex flex-col items-stretch gap-2 px-4">
        {pie}
        {onPasar ? (
          <button
            type="button"
            onClick={onPasar}
            className="min-h-chip w-full rounded-token text-boton text-tinta-suave underline"
          >
            {comun.pasar}
          </button>
        ) : null}
      </footer>
    </div>
  );
}
