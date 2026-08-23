// "Preparar reporte para la cita" (§6.8): vista previa del contenido y botón
// único de generación. El PDF se produce 100% offline.

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { comun, cuidador as copy, interpolar } from '@/content/es-CO';
import { db, hoyLocal } from '@/db/dexie';
import { enVentana, sumarDias } from '@/rules/recurrence';
import type { Perfil } from '@/types/models';
import { useApp } from '@/store';
import { PrimaryButton } from '@/components/PrimaryButton';

const SEMANAS = 12;

export function CuidadorReporte({ perfil }: { perfil: Perfil }) {
  const { volver } = useApp();
  const [estado, setEstado] = useState<'listo' | 'generando' | 'generado' | 'error'>('listo');
  const hoy = hoyLocal();
  const desde = sumarDias(hoy, -7 * SEMANAS);

  const checkins = useLiveQuery(
    () => db.checkins.where('fecha').aboveOrEqual(desde).count(),
    [desde],
  );
  const episodios = useLiveQuery(() => db.episodios.toArray(), []);
  const pesos = useLiveQuery(() => db.pesos.toArray(), []);

  const nEpisodios = (episodios ?? []).filter((e) => enVentana(e.cuando, hoy, 7 * SEMANAS)).length;
  const nPesos = (pesos ?? []).filter((p) => enVentana(p.fecha, hoy, 7 * SEMANAS)).length;

  async function generar() {
    setEstado('generando');
    try {
      // jsPDF se carga bajo demanda: el arranque diario de ella queda liviano.
      const { generarReporte } = await import('@/features/reporte/generarPdf');
      await generarReporte(perfil);
      setEstado('generado');
    } catch {
      setEstado('error');
    }
  }

  return (
    <div className="transicion-tarjeta flex min-h-dvh flex-col gap-4 bg-fondo px-4 py-4">
      <header className="flex min-h-chip items-center gap-2">
        <button
          type="button"
          onClick={volver}
          className="min-h-chip min-w-chip rounded-token px-3 text-boton text-tinta"
        >
          {comun.volver}
        </button>
        <h1 className="text-pregunta font-bold text-tinta">{copy.reporte.titulo}</h1>
      </header>

      <p className="text-base text-tinta-suave">{copy.reporte.intro}</p>
      <div className="rounded-token bg-superficie p-4">
        <p className="text-base font-bold text-tinta">
          {interpolar(copy.reporte.periodo, { semanas: String(SEMANAS) })}
        </p>
        <ul className="mt-2 list-none text-base text-tinta-suave">
          <li>· Registros diarios: {checkins ?? 0}</li>
          <li>· Episodios: {nEpisodios}</li>
          <li>· Pesos anotados: {nPesos}</li>
        </ul>
      </div>

      {estado === 'generado' ? (
        <p className="text-base font-bold text-exito">{copy.reporte.listo}</p>
      ) : null}
      {estado === 'error' ? (
        <p className="text-base font-bold text-rojo">{comun.errorGuardar}</p>
      ) : null}

      <PrimaryButton onClick={() => void generar()} deshabilitado={estado === 'generando'}>
        {estado === 'generando' ? copy.reporte.generando : copy.reporte.generar}
      </PrimaryButton>
    </div>
  );
}
