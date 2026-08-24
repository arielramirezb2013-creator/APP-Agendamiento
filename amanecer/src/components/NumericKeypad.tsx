// Teclado numérico GIGANTE (§6.3): botones de 72 px para el peso y el PIN.

import { comun } from '@/content/es-CO';

interface NumericKeypadProps {
  valor: string;
  onCambio: (v: string) => void;
  maxLargo?: number;
  conComa?: boolean;
  etiquetaBorrar: string;
  /** Oculta el valor (PIN). */
  oculto?: boolean;
}

export function NumericKeypad({
  valor,
  onCambio,
  maxLargo = 5,
  conComa,
  etiquetaBorrar,
  oculto,
}: NumericKeypadProps) {
  const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const pulsar = (t: string) => {
    if (t === ',' && (valor.includes('.') || valor === '')) return;
    const nuevo = t === ',' ? `${valor}.` : `${valor}${t}`;
    if (nuevo.replace('.', '').length > maxLargo) return;
    onCambio(nuevo);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <output
        aria-live="polite"
        className="min-h-primario w-full rounded-token border-2 border-tinta-suave/20
          bg-superficie px-4 text-center font-ui text-[2.2rem] font-bold leading-[72px] tracking-widest"
      >
        {/* En Colombia el decimal se escribe con coma; el valor interno usa punto. */}
        {oculto ? '•'.repeat(valor.length) : valor.replace('.', ',') || ' '}
      </output>
      <div className="grid w-full grid-cols-3 gap-2">
        {teclas.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => pulsar(t)}
            className="min-h-primario rounded-token bg-superficie text-[1.6rem] font-bold
              border-2 border-tinta-suave/20"
          >
            {t}
          </button>
        ))}
        {conComa ? (
          <button
            type="button"
            onClick={() => pulsar(',')}
            aria-label={comun.comaDecimal}
            className="min-h-primario rounded-token bg-superficie text-[1.6rem] font-bold
              border-2 border-tinta-suave/20"
          >
            ,
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => pulsar('0')}
          className="min-h-primario rounded-token bg-superficie text-[1.6rem] font-bold
            border-2 border-tinta-suave/20"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => onCambio(valor.slice(0, -1))}
          className="min-h-primario rounded-token bg-superficie text-boton font-bold
            border-2 border-tinta-suave/20"
        >
          {etiquetaBorrar}
        </button>
      </div>
    </div>
  );
}
