// Registros (§9.3): ver los últimos 14 días con indicador de quién llenó
// (paciente/cuidador, §6.1 CA) y corregir el check-in de hoy "en nombre de".

import { useLiveQuery } from 'dexie-react-hooks';
import { comun, cuidador as copy, checkin as copyCheckin, etiquetasEpisodio } from '@/content/es-CO';
import { db, hoyLocal } from '@/db/dexie';
import { sumarDias } from '@/rules/recurrence';
import { useApp } from '@/store';

export function CuidadorRegistros() {
  const { ir, volver } = useApp();
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
            <p className="text-base font-bold text-tinta">
              {etiquetasEpisodio[e.tipo].emoji} {etiquetasEpisodio[e.tipo].etiqueta} ·{' '}
              {e.cuando.slice(0, 10)}
            </p>
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
            <p className="text-base font-bold text-tinta">
              🍲 {m.fecha} · {m.momento}
            </p>
            <p className="text-min text-tinta-suave">
              {m.descripcion ?? ''} · {m.cantidad} · {m.tragando} ·{' '}
              {copy.registros.llenadoPor[m.llenado.por]}
            </p>
          </div>
        ))}
    </div>
  );
}
