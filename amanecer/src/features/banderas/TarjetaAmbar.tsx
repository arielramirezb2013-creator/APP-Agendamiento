// Tarjeta ámbar (§7.1): aparece al CIERRE del flujo, nunca a mitad.
// "Esto vale la pena contárselo a [contacto]. ¿La llamamos?"
// Nunca alarmista; registra la decisión; recuerda máx. 1 vez.

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { BanderaDisparada } from '@/rules/flags';
import type { Contacto } from '@/types/models';
import { banderas, copyReglas, interpolar, t } from '@/content/es-CO';
import { db } from '@/db/dexie';
import {
  contactoParaTema,
  decidirEventoAmbar,
  registrarEventoAmbar,
} from '@/services/banderas';

interface TarjetaAmbarProps {
  disparada: BanderaDisparada;
  onCerrada: () => void;
}

export function TarjetaAmbar({ disparada, onCerrada }: TarjetaAmbarProps) {
  const [contacto, setContacto] = useState<Contacto>();
  const [eventoId, setEventoId] = useState<string>();
  const trato =
    useLiveQuery(() => db.perfiles.toArray(), [])?.[0]?.tratamiento ?? 'usted';

  useEffect(() => {
    let activo = true;
    void (async () => {
      const c = await contactoParaTema(disparada.contactoTema);
      const id = await registrarEventoAmbar(disparada.regla.id);
      if (activo) {
        setContacto(c);
        setEventoId(id);
      }
    })();
    return () => {
      activo = false;
    };
  }, [disparada]);

  const decidir = async (decision: 'llamo' | 'recordar' | 'ya_hablado') => {
    if (eventoId) await decidirEventoAmbar(eventoId, decision);
    if (decision === 'llamo' && contacto) {
      window.location.href = `tel:${contacto.telefono}`;
    }
    onCerrada();
  };

  const nombreContacto = contacto?.nombre ?? '';
  const copy = interpolar(t(copyReglas[disparada.regla.id] ?? '', trato), {
    contacto: nombreContacto || (trato === 'tu' ? 'tu equipo' : 'su equipo'),
  });

  return (
    <div className="transicion-tarjeta flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8">
      <div className="rounded-token border-2 border-ambar/40 bg-ambar-fondo p-5">
        <p className="mb-2 text-boton font-bold text-ambar">
          🟡 {banderas.ambar.titulo}
        </p>
        <p className="text-base text-tinta">{copy}</p>
      </div>

      <div className="flex flex-col gap-3">
        {contacto ? (
          <button
            type="button"
            onClick={() => void decidir('llamo')}
            className="min-h-primario w-full rounded-token bg-primario px-6 text-boton font-bold text-white"
          >
            {interpolar(banderas.ambar.llamarA, { contacto: nombreContacto })}
          </button>
        ) : (
          <p className="text-base text-tinta-suave">
            {t(banderas.ambar.sinContacto, trato)}
          </p>
        )}
        <button
          type="button"
          onClick={() => void decidir('recordar')}
          className="min-h-chip w-full rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 text-boton"
        >
          {banderas.ambar.recordarManana}
        </button>
        <button
          type="button"
          onClick={() => void decidir('ya_hablado')}
          className="min-h-chip w-full rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 text-boton"
        >
          {banderas.ambar.yaHablamos}
        </button>
      </div>
    </div>
  );
}
