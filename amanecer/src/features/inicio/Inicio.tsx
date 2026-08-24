// Inicio del modo paciente (§9.2): saludo cálido, check-in como único objetivo
// primario, accesos grandes y recordatorios del día. Sin menús, sin tabs.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  alsfrs as copyAlsfrs,
  comun,
  inicio,
  interpolar,
  recordatorios as copyRec,
  t,
} from '@/content/es-CO';
import { db, hoyLocal } from '@/db/dexie';
import { sumarDias } from '@/rules/recurrence';
import {
  desmarcarToma,
  itemsDeHoy,
  marcarToma,
  type ItemHoy,
} from '@/services/recordatorios';
import type { Perfil } from '@/types/models';
import { useApp } from '@/store';
import { Toast, type ToastEstado } from '@/components/Toast';

function saludoPorHora(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return inicio.buenosDias;
  if (h >= 12 && h < 19) return inicio.buenasTardes;
  return inicio.buenasNoches;
}

export function Inicio({ perfil }: { perfil: Perfil }) {
  const ir = useApp((s) => s.ir);
  const [items, setItems] = useState<ItemHoy[]>([]);
  const [toast, setToast] = useState<ToastEstado>();

  const checkinHoy = useLiveQuery(
    () => db.checkins.where('fecha').equals(hoyLocal()).first(),
    [],
  );

  // Recordatorio mensual suave del cuestionario (§6.4): aparece si no hay uno
  // completado en los últimos 28 días. "Luego" lo oculta por la sesión.
  const [cuestionarioPospuesto, setCuestionarioPospuesto] = useState(false);
  const alsfrsRegistros = useLiveQuery(() => db.alsfrs.toArray(), []);
  const hayBorradorAlsfrs = (alsfrsRegistros ?? []).some((r) => r.borrador);
  const cuestionarioPendiente =
    alsfrsRegistros !== undefined &&
    !cuestionarioPospuesto &&
    !(alsfrsRegistros ?? []).some(
      (r) => !r.borrador && r.fecha >= sumarDias(hoyLocal(), -28),
    );

  const cargarItems = useCallback(() => {
    void itemsDeHoy(perfil).then(setItems);
  }, [perfil]);

  useEffect(cargarItems, [cargarItems]);

  const confirmando = useRef(false);

  const confirmarToma = async (item: ItemHoy) => {
    if (!item.medicinaId || !item.hora || confirmando.current) return;
    confirmando.current = true;
    const { medicinaId, hora } = item;
    await marcarToma(medicinaId, hora, 'tomada');
    confirmando.current = false;
    // Confirmación en pasado + deshacer durante 6 s (§3.1).
    setToast({
      mensaje: comun.guardado,
      onDeshacer: () => {
        void desmarcarToma(medicinaId, hora).then(cargarItems);
      },
    });
    cargarItems();
  };

  return (
    <div className="transicion-tarjeta flex min-h-dvh flex-col gap-6 bg-fondo px-4 py-6">
      {/* Firma visual §10.3: la tarjeta de saludo es el único elemento expresivo. */}
      <header className="text-center">
        <p aria-hidden="true" className="text-[2rem] leading-none">
          ☀️
        </p>
        <h1 className="font-titular text-saludo text-tinta">
          {saludoPorHora()}, {perfil.nombre}
        </h1>
      </header>

      {!checkinHoy ? (
        <section className="rounded-token bg-superficie p-5 text-center shadow-sm">
          <p className="mb-4 text-pregunta text-tinta">{t(inicio.pregunta, perfil.tratamiento)}</p>
          <PrimaryButton onClick={() => ir({ id: 'checkin' })}>
            {inicio.contarle}
          </PrimaryButton>
        </section>
      ) : (
        <section className="rounded-token bg-superficie p-5 text-center shadow-sm">
          <p className="text-base text-exito">
            ✓ {t(inicio.yaConto, perfil.tratamiento)}
          </p>
          <button
            type="button"
            onClick={() => ir({ id: 'checkin' })}
            className="mt-2 min-h-chip w-full rounded-token text-boton text-primario underline"
          >
            {inicio.volverAContar}
          </button>
        </section>
      )}

      {cuestionarioPendiente ? (
        <section className="rounded-token border-2 border-primario/30 bg-superficie p-4">
          <p className="mb-3 text-base text-tinta">🗓️ {t(copyAlsfrs.invitacion, perfil.tratamiento)}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => ir({ id: 'alsfrs' })}
              className="min-h-chip rounded-token bg-primario px-3 text-boton font-bold text-white"
            >
              {hayBorradorAlsfrs ? copyAlsfrs.continuar : copyAlsfrs.empezar}
            </button>
            <button
              type="button"
              onClick={() => setCuestionarioPospuesto(true)}
              className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie
                px-3 text-boton text-tinta"
            >
              {copyAlsfrs.luego}
            </button>
          </div>
        </section>
      ) : null}

      {/* Todas las secciones a la vista, en fichas grandes (≥64 px). */}
      <section className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => ir({ id: 'episodio' })}
          className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie
            px-3 text-boton font-bold text-tinta"
        >
          {inicio.pasoAlgo}
        </button>
        <button
          type="button"
          onClick={() => ir({ id: 'comida' })}
          className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie
            px-3 text-boton font-bold text-tinta"
        >
          {inicio.miComida}
        </button>
        <button
          type="button"
          onClick={() => ir({ id: 'peso' })}
          className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie
            px-3 text-boton font-bold text-tinta"
        >
          ⚖️ {inicio.miPeso}
        </button>
        <button
          type="button"
          onClick={() => ir({ id: 'miSemana' })}
          className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie
            px-3 text-boton font-bold text-tinta"
        >
          🌤️ {inicio.miSemana}
        </button>
      </section>
      <button
        type="button"
        onClick={() => ir({ id: 'directorio' })}
        className="min-h-primario w-full rounded-token border-2 border-primario bg-superficie
          px-4 text-boton font-bold text-primario"
      >
        {inicio.aQuienLlamo}
      </button>
      <button
        type="button"
        onClick={() => ir({ id: 'redApoyo' })}
        className="min-h-chip w-full rounded-token border-2 border-tinta-suave/40 bg-superficie
          px-4 text-boton font-bold text-tinta"
      >
        {inicio.miRed}
      </button>

      <section aria-label={inicio.recordatoriosHoy} className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-tinta-suave">{inicio.recordatoriosHoy}</h2>
        {items.length === 0 ? (
          <p className="text-base text-tinta-suave">{inicio.sinRecordatorios}</p>
        ) : (
          items.map((item, i) => (
            <div
              key={`${item.tipo}-${item.medicinaId ?? item.titulo}-${item.hora ?? i}`}
              className="flex min-h-chip items-center justify-between gap-2 rounded-token
                bg-superficie px-4 py-2"
            >
              <span className="text-base text-tinta">
                {item.tipo === 'medicina'
                  ? interpolar(copyRec.pastilla, { hora: item.hora ?? '', nombre: item.titulo })
                  : item.tipo === 'peso'
                    ? copyRec.pesoSemanal
                    : item.tipo === 'laboratorio'
                      ? interpolar(copyRec.laboratorio, { titulo: item.titulo })
                      : item.tipo === 'ejercicio'
                        ? interpolar(copyRec.ejercicio, { titulo: item.titulo })
                        : interpolar(copyRec.cita, { titulo: item.titulo })}
                {item.tomada ? ' ✓' : ''}
              </span>
              {item.tipo === 'medicina' && !item.tomada ? (
                <button
                  type="button"
                  onClick={() => void confirmarToma(item)}
                  className="min-h-chip shrink-0 rounded-token bg-primario px-3
                    text-min font-bold text-white"
                >
                  {copyRec.yaLaTome}
                </button>
              ) : null}
              {item.tipo === 'peso' ? (
                <button
                  type="button"
                  onClick={() => ir({ id: 'peso' })}
                  className="min-h-chip shrink-0 rounded-token bg-primario px-3
                    text-min font-bold text-white"
                >
                  {comun.anotar}
                </button>
              ) : null}
            </div>
          ))
        )}
      </section>

      <footer className="mt-auto pt-4 text-center">
        <button
          type="button"
          onClick={() => ir({ id: 'cuidadorPin' })}
          className="min-h-chip rounded-token px-6 text-min text-tinta-suave underline"
        >
          {inicio.soyCuidador}
        </button>
      </footer>

      <Toast estado={toast} onCerrar={() => setToast(undefined)} />
    </div>
  );
}
