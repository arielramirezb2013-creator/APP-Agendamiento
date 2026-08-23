// Confirmación en pasado + deshacer durante 6 s (§3.1).

import { useEffect, useState } from 'react';
import { comun } from '@/content/es-CO';

export interface ToastEstado {
  mensaje: string;
  onDeshacer?: () => void;
}

interface ToastProps {
  estado?: ToastEstado;
  onCerrar: () => void;
}

export function Toast({ estado, onCerrar }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!estado) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onCerrar();
    }, 6000);
    return () => clearTimeout(t);
  }, [estado, onCerrar]);

  if (!estado || !visible) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 flex min-h-chip items-center justify-between
        gap-3 rounded-token bg-tinta px-4 py-2 text-boton text-white shadow-lg"
    >
      <span>{estado.mensaje}</span>
      {estado.onDeshacer ? (
        <button
          type="button"
          onClick={() => {
            estado.onDeshacer?.();
            setVisible(false);
            onCerrar();
          }}
          className="min-h-chip min-w-chip rounded-token px-3 font-bold underline"
        >
          {comun.deshacer}
        </button>
      ) : null}
    </div>
  );
}
