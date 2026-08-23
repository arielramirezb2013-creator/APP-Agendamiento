// Pantalla roja (§7.1/§7.2): pantalla completa inmediata, fondo rojo,
// texto ≥32 px, llamada a 1 toque. NUNCA pide más datos: primero la llamada.

import { useEffect, useState } from 'react';
import { banderas, interpolar } from '@/content/es-CO';
import { contactoEmergencia } from '@/services/banderas';
import type { Contacto } from '@/types/models';
import { useApp } from '@/store';

export function BanderaRoja() {
  const aInicio = useApp((s) => s.aInicio);
  const [contacto, setContacto] = useState<Contacto>();

  useEffect(() => {
    void contactoEmergencia().then(setContacto);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col justify-center gap-8 bg-rojo px-4 py-8">
      <div className="text-center text-white">
        <p className="text-urgencia font-bold">{banderas.roja.titulo}</p>
        <p className="mt-2 text-pregunta">{banderas.roja.subtitulo}</p>
      </div>

      <div className="flex flex-col gap-4">
        <a
          href="tel:123"
          className="flex min-h-primario w-full items-center justify-center rounded-token
            bg-white px-6 text-center text-pregunta font-bold text-rojo no-underline"
        >
          {banderas.roja.llamar123}
        </a>
        {contacto && contacto.telefono !== '123' ? (
          <a
            href={`tel:${contacto.telefono}`}
            className="flex min-h-primario w-full items-center justify-center rounded-token
              border-4 border-white px-6 text-center text-boton font-bold text-white no-underline"
          >
            {interpolar(banderas.roja.llamarContacto, { contacto: contacto.nombre })}
          </a>
        ) : null}
      </div>

      <button
        type="button"
        onClick={aInicio}
        className="min-h-chip w-full rounded-token text-boton text-white underline"
      >
        {banderas.roja.yaEstoyBien}
      </button>
    </div>
  );
}
