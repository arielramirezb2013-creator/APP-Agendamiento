// Medicinas y recordatorios (§6.6). La app NUNCA muestra ni sugiere dosis
// distintas a las escritas por el cuidador. Incluye la plantilla editable de
// laboratorios de riluzol con su disclaimer (§2.2-8).

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { comun, cuidador as copy } from '@/content/es-CO';
import { db, nuevoId } from '@/db/dexie';
import { activarPlantillaRiluzol, pedirPermisoNotificaciones } from '@/services/recordatorios';
import type { Medicina, Recordatorio } from '@/types/models';
import { useApp } from '@/store';
import { PrimaryButton } from '@/components/PrimaryButton';

const FORM_MED = { nombre: '', horarios: '', instrucciones: '' };
const FORM_CITA = { titulo: '', fechaHora: '', queLlevar: '' };

export function CuidadorMedicinas() {
  const { volver } = useApp();
  const medicinas = useLiveQuery(() => db.medicinas.toArray(), []) ?? [];
  const recordatorios = useLiveQuery(() => db.recordatorios.toArray(), []) ?? [];
  const [editando, setEditando] = useState<Medicina | 'nueva'>();
  const [form, setForm] = useState(FORM_MED);
  const [formCita, setFormCita] = useState(FORM_CITA);
  const [mostrandoCita, setMostrandoCita] = useState(false);
  const [plantillaOk, setPlantillaOk] = useState(false);

  const labs = recordatorios.filter((r) => r.tipo === 'laboratorio' && r.activo);
  const citas = recordatorios.filter((r) => r.tipo === 'cita' && r.activo);
  const hayPlantilla = labs.some((r) => r.plantilla === 'labs_riluzol');

  async function guardarMedicina() {
    if (!form.nombre.trim()) return;
    const horarios = form.horarios
      .split(',')
      .map((h) => h.trim())
      .filter((h) => /^\d{1,2}:\d{2}$/.test(h))
      .map((h) => (h.length === 4 ? `0${h}` : h));
    if (editando === 'nueva') {
      await db.medicinas.add({
        id: nuevoId(),
        nombre: form.nombre.trim(),
        horarios,
        instruccionesDelMedico: form.instrucciones.trim(),
        tomas: [],
      });
    } else if (editando) {
      await db.medicinas.update(editando.id, {
        nombre: form.nombre.trim(),
        horarios,
        instruccionesDelMedico: form.instrucciones.trim(),
      });
    }
    await pedirPermisoNotificaciones();
    setEditando(undefined);
  }

  async function guardarCita() {
    if (!formCita.titulo.trim() || !formCita.fechaHora) return;
    const r: Recordatorio = {
      id: nuevoId(),
      tipo: 'cita',
      titulo: formCita.titulo.trim(),
      detalle: formCita.queLlevar.trim() || copy.medicinas.queLlevarDefecto,
      cron: formCita.fechaHora,
      activo: true,
      queLlevar: formCita.queLlevar.trim() || copy.medicinas.queLlevarDefecto,
    };
    await db.recordatorios.add(r);
    setFormCita(FORM_CITA);
    setMostrandoCita(false);
  }

  if (editando) {
    return (
      <div className="transicion-tarjeta flex min-h-dvh flex-col gap-4 bg-fondo px-4 py-4">
        <header className="flex min-h-chip items-center gap-2">
          <button
            type="button"
            onClick={() => setEditando(undefined)}
            className="min-h-chip min-w-chip rounded-token px-3 text-boton text-tinta"
          >
            {comun.volver}
          </button>
          <h1 className="text-pregunta font-bold text-tinta">
            {editando === 'nueva' ? copy.medicinas.nueva : form.nombre}
          </h1>
        </header>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.medicinas.nombre}
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.medicinas.horarios}
          <input
            value={form.horarios}
            onChange={(e) => setForm({ ...form, horarios: e.target.value })}
            placeholder="08:00, 20:00"
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.medicinas.instrucciones}
          <textarea
            value={form.instrucciones}
            onChange={(e) => setForm({ ...form, instrucciones: e.target.value })}
            rows={3}
            className="rounded-token border-2 border-tinta-suave/40 bg-superficie p-4 font-normal"
          />
        </label>
        <p className="text-min text-tinta-suave">{copy.medicinas.instruccionesNota}</p>
        <PrimaryButton onClick={() => void guardarMedicina()}>
          {copy.medicinas.guardar}
        </PrimaryButton>
        {editando !== 'nueva' ? (
          <>
            <section className="rounded-token bg-superficie p-4">
              <h2 className="mb-1 text-base font-bold text-tinta">{copy.medicinas.historial}</h2>
              {editando.tomas.slice(-14).map((toma) => (
                <p key={toma.fechaHora} className="text-min text-tinta-suave">
                  {toma.fechaHora.replace('T', ' ')} — {toma.estado}
                </p>
              ))}
            </section>
            <button
              type="button"
              onClick={() => {
                void db.medicinas.delete(editando.id).then(() => setEditando(undefined));
              }}
              className="min-h-chip w-full rounded-token text-boton text-rojo underline"
            >
              {copy.medicinas.eliminar}
            </button>
          </>
        ) : null}
      </div>
    );
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
        <h1 className="text-pregunta font-bold text-tinta">{copy.medicinas.titulo}</h1>
      </header>

      {medicinas.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => {
            setForm({
              nombre: m.nombre,
              horarios: m.horarios.join(', '),
              instrucciones: m.instruccionesDelMedico,
            });
            setEditando(m);
          }}
          className="flex min-h-chip w-full items-center justify-between rounded-token
            bg-superficie px-4 text-left"
        >
          <span>
            <span className="block text-boton font-bold text-tinta">💊 {m.nombre}</span>
            <span className="block text-min text-tinta-suave">{m.horarios.join(' · ')}</span>
          </span>
          <span aria-hidden="true">›</span>
        </button>
      ))}
      <PrimaryButton
        onClick={() => {
          setForm(FORM_MED);
          setEditando('nueva');
        }}
      >
        {copy.medicinas.nueva}
      </PrimaryButton>

      {/* Plantilla de laboratorios de riluzol (§6.6) */}
      <section className="rounded-token bg-superficie p-4">
        <h2 className="text-base font-bold text-tinta">🧪 {copy.medicinas.labsRiluzol}</h2>
        <p className="mb-2 text-min text-tinta-suave">{copy.medicinas.labsRiluzolDetalle}</p>
        {hayPlantilla || plantillaOk ? (
          <>
            <p className="text-base font-bold text-exito">{copy.medicinas.plantillaActivada}</p>
            {labs.map((laboratorio) => (
              <div key={laboratorio.id} className="flex items-center justify-between gap-2">
                <p className="text-min text-tinta-suave">
                  {laboratorio.cron.slice(0, 10)} — {laboratorio.titulo}
                </p>
                <button
                  type="button"
                  onClick={() => void db.recordatorios.delete(laboratorio.id)}
                  className="min-h-[48px] rounded-token px-2 text-min text-rojo underline"
                >
                  {copy.medicinas.eliminar}
                </button>
              </div>
            ))}
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              void activarPlantillaRiluzol().then(() => setPlantillaOk(true));
            }}
            className="min-h-chip w-full rounded-token border-2 border-primario
              text-boton font-bold text-primario"
          >
            {copy.medicinas.activarPlantilla}
          </button>
        )}
      </section>

      {/* Citas (§6.6) */}
      <section className="rounded-token bg-superficie p-4">
        <h2 className="mb-2 text-base font-bold text-tinta">📅 {copy.medicinas.citas}</h2>
        {citas.map((cita) => (
          <div key={cita.id} className="flex items-center justify-between gap-2">
            <p className="text-min text-tinta-suave">
              {cita.cron.replace('T', ' ')} — {cita.titulo} · {cita.queLlevar}
            </p>
            <button
              type="button"
              onClick={() => void db.recordatorios.delete(cita.id)}
              className="min-h-[48px] rounded-token px-2 text-min text-rojo underline"
            >
              {copy.medicinas.eliminar}
            </button>
          </div>
        ))}
        {mostrandoCita ? (
          <div className="mt-2 flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-base font-bold text-tinta">
              {copy.medicinas.tituloCita}
              <input
                value={formCita.titulo}
                onChange={(e) => setFormCita({ ...formCita, titulo: e.target.value })}
                className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-base font-bold text-tinta">
              {copy.medicinas.fechaHora}
              <input
                type="datetime-local"
                value={formCita.fechaHora}
                onChange={(e) => setFormCita({ ...formCita, fechaHora: e.target.value })}
                className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-base font-bold text-tinta">
              {copy.medicinas.queLlevar}
              <input
                value={formCita.queLlevar}
                placeholder={copy.medicinas.queLlevarDefecto}
                onChange={(e) => setFormCita({ ...formCita, queLlevar: e.target.value })}
                className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
              />
            </label>
            <PrimaryButton onClick={() => void guardarCita()}>
              {copy.medicinas.guardar}
            </PrimaryButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMostrandoCita(true)}
            className="min-h-chip w-full rounded-token border-2 border-primario
              text-boton font-bold text-primario"
          >
            {copy.medicinas.nuevaCita}
          </button>
        )}
      </section>
    </div>
  );
}
