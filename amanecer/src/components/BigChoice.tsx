// Un solo componente para TODAS las respuestas (§10.2): chips ≥64 px,
// ícono opcional + palabra, seleccionado = ✓ + relleno primario claro.
// Nunca comunica estado solo con color (§3.1).

interface BigChoiceProps {
  etiqueta: string;
  emoji?: string;
  seleccionado?: boolean;
  onSelect: () => void;
  /** Ocupa todo el ancho (para listas verticales). */
  ancho?: boolean;
}

export function BigChoice({ etiqueta, emoji, seleccionado, onSelect, ancho }: BigChoiceProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={seleccionado ?? false}
      className={`min-h-chip min-w-chip rounded-token border-2 px-4 py-3 text-boton font-ui
        flex items-center justify-center gap-3 text-center leading-tight
        ${ancho ? 'w-full' : ''}
        ${
          seleccionado
            ? 'border-primario bg-primario/10 text-primario font-bold'
            : 'border-tinta-suave/40 bg-superficie text-tinta'
        }`}
    >
      {emoji ? (
        <span aria-hidden="true" className="text-[32px] leading-none">
          {emoji}
        </span>
      ) : null}
      <span>{etiqueta}</span>
      {seleccionado ? <span aria-hidden="true">✓</span> : null}
    </button>
  );
}
