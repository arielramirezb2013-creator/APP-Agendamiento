// Botón primario (§10.2): 72 px de alto, ancho completo, anclado abajo con
// safe-area. Un objetivo primario por pantalla (§3.1).

import type { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick: () => void;
  variante?: 'primario' | 'rojo' | 'neutro';
  deshabilitado?: boolean;
}

export function PrimaryButton({
  children,
  onClick,
  variante = 'primario',
  deshabilitado,
}: PrimaryButtonProps) {
  const estilos = {
    primario: 'bg-primario text-white',
    rojo: 'bg-rojo text-white',
    neutro: 'bg-superficie text-tinta border-2 border-tinta-suave/40',
  }[variante];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      className={`min-h-primario w-full rounded-token px-6 text-boton font-bold font-ui
        disabled:opacity-50 ${estilos}`}
    >
      {children}
    </button>
  );
}

/** Contenedor que ancla el botón primario abajo con área segura. */
export function PieDeBoton({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-fondo/95 px-4 pt-3 safe-area-abajo">
      {children}
    </div>
  );
}
