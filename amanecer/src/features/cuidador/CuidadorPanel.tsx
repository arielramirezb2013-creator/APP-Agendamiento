// Panel del cuidador (§9.3): resumen de la semana + banderas pendientes +
// accesos a todas las secciones de configuración.

import { useLiveQuery } from 'dexie-react-hooks';
import { cuidador as copy, miSemana as copyMiSemana } from '@/content/es-CO';
import { db, hoyLocal } from '@/db/dexie';
import { enVentana, sumarDias } from '@/rules/recurrence';
import { todasLasReglas } from '@/rules/flags';
import { decidirEventoAmbar } from '@/services/banderas';
import { copyReglas, interpolar, t } from '@/content/es-CO';
import { useApp } from '@/store';
import { GraficaPeso } from '@/components/graficas/GraficaPeso';
import { MapaAnimo } from '@/components/graficas/MapaAnimo';
import { PerfilAlsfrs } from '@/components/graficas/PerfilAlsfrs';

export function CuidadorPanel() {
  const { ir, aInicio } = useApp();
  const hoy = hoyLocal();

  const checkins = useLiveQuery(
    () => db.checkins.where('fecha').aboveOrEqual(sumarDias(hoy, -27)).toArray(),
    [hoy],
  );
  const eventos = useLiveQuery(() => db.eventosBandera.toArray(), []);
  const pesos = useLiveQuery(() => db.pesos.orderBy('fecha').toArray(), []);
  const alsfrs = useLiveQuery(
    () => db.alsfrs.orderBy('fecha').toArray().then((r) => r.filter((x) => !x.borrador)),
    [],
  );
  const pesos8 = (pesos ?? []).filter((p) => enVentana(p.fecha, hoy, 7 * 8));

  const pendientes = (eventos ?? []).filter(
    (e) => enVentana(e.fechaHora, hoy, 7) && !e.decision,
  );

  const secciones = [
    { etiqueta: copy.panel.verRegistros, pantalla: { id: 'cuidadorRegistros' } as const },
    { etiqueta: copy.panel.contactos, pantalla: { id: 'cuidadorContactos' } as const },
    { etiqueta: copy.panel.redApoyo, pantalla: { id: 'cuidadorRed' } as const },
    { etiqueta: copy.panel.medicinas, pantalla: { id: 'cuidadorMedicinas' } as const },
    { etiqueta: copy.panel.cuestionarioMes, pantalla: { id: 'alsfrs' } as const },
    { etiqueta: copy.panel.reporte, pantalla: { id: 'cuidadorReporte' } as const },
    { etiqueta: copy.panel.miPlan, pantalla: { id: 'cuidadorMiPlan' } as const },
    { etiqueta: copy.panel.ajustes, pantalla: { id: 'cuidadorAjustes' } as const },
  ];

  return (
    <div className="transicion-tarjeta flex min-h-dvh flex-col gap-5 bg-fondo px-4 py-4">
      <header className="flex min-h-chip items-center justify-between">
        <h1 className="text-pregunta font-bold text-tinta">{copy.panel.titulo}</h1>
        <button
          type="button"
          onClick={aInicio}
          className="min-h-chip rounded-token px-3 text-min text-tinta-suave underline"
        >
          {copy.panel.salir}
        </button>
      </header>

      {/* Ánimo del mes: emoji + palabra accesible, tinte de refuerzo (§3.1). */}
      <section aria-label={copy.panel.checkins} className="rounded-token bg-superficie p-4">
        <h2 className="mb-2 text-base font-bold text-tinta">{copyMiSemana.animoTitulo}</h2>
        <MapaAnimo checkins={checkins ?? []} hoy={hoy} semanas={4} />
        <button
          type="button"
          onClick={() => ir({ id: 'checkin' })}
          className="mt-3 min-h-chip w-full rounded-token border-2 border-primario
            text-boton font-bold text-primario"
        >
          {copy.panel.llenarPorElla}
        </button>
      </section>

      {pesos8.length >= 2 ? (
        <section className="rounded-token bg-superficie p-4">
          <h2 className="mb-2 text-base font-bold text-tinta">{copyMiSemana.pesoTitulo}</h2>
          <GraficaPeso pesos={pesos8} interactivo />
        </section>
      ) : null}

      {(alsfrs?.length ?? 0) > 0 ? (
        <section className="rounded-token bg-superficie p-4">
          <h2 className="mb-2 text-base font-bold text-tinta">
            {copy.panel.cuestionarioMes}
          </h2>
          <PerfilAlsfrs registros={alsfrs ?? []} />
        </section>
      ) : null}

      {/* Banderas pendientes de revisión */}
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-tinta-suave">
          {copy.panel.banderasPendientes}
        </h2>
        {pendientes.length === 0 ? (
          <p className="text-base text-tinta-suave">{copy.panel.sinBanderas}</p>
        ) : (
          pendientes.map((e) => {
            const regla = todasLasReglas.find((r) => r.id === e.reglaId);
            return (
              <div
                key={e.id}
                className={`rounded-token p-4 ${
                  e.nivel === 'roja'
                    ? 'bg-rojo-fondo text-rojo'
                    : 'bg-ambar-fondo text-ambar'
                }`}
              >
                <p className="text-base font-bold">
                  {e.nivel === 'roja' ? '🔴' : '🟡'} {e.reglaId} ·{' '}
                  {e.fechaHora.slice(0, 10)}
                </p>
                <p className="text-min text-tinta">
                  {interpolar(
                    t(copyReglas[e.reglaId] ?? regla?.fuente ?? '', 'usted'),
                    { contacto: 'su equipo' },
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => void decidirEventoAmbar(e.id, 'descartada_por_cuidador')}
                  className="mt-2 min-h-chip rounded-token px-3 text-min font-bold underline"
                >
                  {copy.panel.marcarRevisada}
                </button>
              </div>
            );
          })
        )}
        <button
          type="button"
          onClick={() => ir({ id: 'cuidadorChecklist' })}
          className="min-h-chip w-full rounded-token border-2 border-rojo bg-superficie
            text-boton font-bold text-rojo"
        >
          🚨 {copy.checklist.titulo}
        </button>
      </section>

      <section className="flex flex-col gap-2">
        {secciones.map((s) => (
          <button
            key={s.etiqueta}
            type="button"
            onClick={() => ir(s.pantalla)}
            className="flex min-h-chip w-full items-center justify-between rounded-token
              bg-superficie px-4 text-boton font-bold text-tinta"
          >
            <span>{s.etiqueta}</span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </section>

    </div>
  );
}
