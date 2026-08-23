// Botón 🎙️ presente en check-in, episodios y comidas (§6.9).
// Graba audio local + transcripción es-CO si el navegador la ofrece.

import { useRef, useState } from 'react';
import { comun, t, type Tratamiento } from '@/content/es-CO';
import { iniciarGrabacion, soportaGrabacion, type Grabadora } from '@/services/voz';
import type { NotaVoz } from '@/types/models';

interface NotaVozBotonProps {
  origen: NotaVoz['origen'];
  onNota: (nota: NotaVoz) => void;
  onError: (mensaje: string) => void;
  trato?: Tratamiento;
}

export function NotaVozBoton({ origen, onNota, onError, trato = 'usted' }: NotaVozBotonProps) {
  const [grabando, setGrabando] = useState(false);
  const grabadora = useRef<Grabadora>();

  if (!soportaGrabacion()) return null;

  const alternar = async () => {
    if (grabando) {
      setGrabando(false);
      try {
        const nota = await grabadora.current?.detener();
        if (nota) onNota(nota);
        else onError(t(comun.errorAudio, trato));
      } catch {
        onError(t(comun.errorAudio, trato));
      }
      return;
    }
    try {
      grabadora.current = await iniciarGrabacion(origen);
      setGrabando(true);
    } catch {
      onError(t(comun.errorAudio, trato));
    }
  };

  return (
    <button
      type="button"
      onClick={() => void alternar()}
      aria-pressed={grabando}
      className={`min-h-chip w-full rounded-token border-2 px-4 text-boton font-bold
        ${
          grabando
            ? 'border-rojo bg-rojo-fondo text-rojo'
            : 'border-primario bg-superficie text-primario'
        }`}
    >
      {grabando ? `⏺ ${comun.grabando} — ${comun.detenerGrabacion}` : comun.grabarNota}
    </button>
  );
}
