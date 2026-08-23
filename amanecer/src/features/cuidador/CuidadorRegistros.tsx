// Registros (§9.3): ver los últimos 14 días con indicador de quién llenó
// (paciente/cuidador, §6.1 CA), corregir el check-in de hoy "en nombre de" y
// eliminar episodios/comidas registrados por error (§4: el cuidador puede
// editar/corregir registros) — con deshacer de 6 s (§3.1).

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { comun, cuidador as copy, checkin as copyCheckin, etiquetasEpisodio } from '@/content/es-CO';
import { db, hoyLocal } from '@/db/dexie';
import { sumarDias } from '@/rules/recurrence';
import { useApp } from '@/store';
import { Toast, type ToastEstado } from '@/components/Toast';
import type { Comida, Episodio } from '@/types/models';

export function CuidadorRegistros() {
  const { ir, volver } = useApp();
  const [toast, setToast] = useState<ToastEstado>();

  const eliminarEpisodio = async (e: Episodio) => {
    await db.episodios.delete(e.id);
    setToast({
      mensaje: copy.registros.eliminado,
      onDeshacer: () => {
        void db.episodios.add(e);
      },
    });
  };

  const eliminarComida = async (m: Comida) => {
    await db.comidas.delete(m.id);
    const vinculado = m.episodioVinculadoId
      ? await db.episodios.get(m.episodioVinculadoId)
      : undefined;
    if (vinculado) await db.episodios.delete(vinculado.id);
    setToast({
      mensaje: copy.registros.eliminado,
      onDeshacer: () => {
        void (async () => {
          await db.comidas.add(m);
          if (vinculado) await db.episodios.add(vinculado);
        })();
      },
    });
  };
  const hoy = hoyLocal();
  const desde = sumarDias(hoy, -13);

  const checkins = useLiveQuery(
    () => db.checkins.where('fecha').aboveOrEqual(desde).reverse().sortBy('fecha'),
    [desde],
  );
  const episodios = useLiveQuery(() => db.episodios.toArray(), []);
  const comidas = useLiveQuery(
    () => db.comidas.where('fecha').aboveOrEqual(desde).toArray(),
    [desde],
  );

  const vacio =
    (checkins?.length ?? 0) === 0 &&
    (episodios?.length ?? 0) === 0 &&
    (comidas?.length ?? 0) === 0;

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
        <h1 className="text-pregunta font-bold text-tinta">{copy.registros.titulo}</h1>
      </header>

      {vacio ? <p className="text-base text-tinta-suave">{copy.registros.sinRegistros}</p> : null}

      {(checkins ?? []).map((c) => {
        const animo = copyCheckin.animo.opciones.find((o) => o.valor === c.animo);
        return (
          <div key={c.id} className="rounded-token bg-superficie p-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-tinta">
                {c.fecha} {animo ? `· ${animo.emoji} ${animo.etiqueta}` : ''}
              </p>
              {c.fecha === hoy ? (
                <button
                  type="button"
                  onClick={() => ir({ id: 'checkin' })}
                  className="min-h-chip rounded-token px-3 text-min font-bold text-primario underline"
                >
                  {copy.registros.editar}
                </button>
              ) : null}
            </div>
            <p className="text-min text-tinta-suave">
              {copy.registros.llenadoPor[c.llenado.por]}
              {c.banderas.length > 0 ? ` · 🟡 ${c.banderas.join(', ')}` : ''}
            </p>
          </div>
        );
      })}

      {(episodios ?? [])
        .filter((e) => e.cuando.slice(0, 10) >= desde)
        .sort((a, b) => b.cuando.localeCompare(a.cuando))
        .map((e) => (
          <div key={e.id} className="rounded-token bg-superficie p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-bold text-tinta">
                {etiquetasEpisodio[e.tipo].emoji} {etiquetasEpisodio[e.tipo].etiqueta} ·{' '}
                {e.cuando.slice(0, 10)}
              </p>
              <button
                type="button"
                onClick={() => void eliminarEpisodio(e)}
                className="min-h-chip shrink-0 rounded-token px-3 text-min font-bold text-rojo underline"
              >
                {copy.registros.eliminar}
              </button>
            </div>
            <p className="text-min text-tinta-suave">
              {e.severidad}
              {e.queHicieron ? ` · ${e.queHicieron}` : ''} ·{' '}
              {copy.registros.llenadoPor[e.llenado.por]}
            </p>
          </div>
        ))}

      {(comidas ?? [])
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .map((m) => (
          <div key={m.id} className="rounded-token bg-superficie p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-bold text-tinta">
                🍲 {m.fecha} · {m.momento}
              </p>
              <button
                type="button"
                onClick={() => void eliminarComida(m)}
                className="min-h-chip shrink-0 rounded-token px-3 text-min font-bold text-rojo underline"
              >
                {copy.registros.eliminar}
              </button>
            </div>
            <p className="text-min text-tinta-suave">
              {m.descripcion ?? ''} · {m.cantidad} · {m.tragando} ·{' '}
              {copy.registros.llenadoPor[m.llenado.por]}
            </p>
          </div>
        ))}
      <Toast estado={toast} onCerrar={() => setToast(undefined)} />
    </div>
  );
}
