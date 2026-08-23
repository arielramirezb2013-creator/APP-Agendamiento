// "Mi plan" (§6.10) — esqueleto en MVP: tarjetas informativas escritas por el
// cuidador con su equipo (kit por si acaso, voluntad anticipada, hospital
// preferido, instrucciones). La app no propone contenido propio.

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { comun, cuidador as copy } from '@/content/es-CO';
import { db, nuevoId } from '@/db/dexie';
import type { TarjetaPlan } from '@/types/models';
import { useApp } from '@/store';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BigChoice } from '@/components/BigChoice';

const FORM_VACIO = { titulo: '', contenido: '', visibleParaPaciente: false };

export function CuidadorMiPlan() {
  const { volver } = useApp();
  const tarjetas = useLiveQuery(() => db.tarjetasPlan.orderBy('orden').toArray(), []) ?? [];
  const [editando, setEditando] = useState<TarjetaPlan | 'nueva'>();
  const [form, setForm] = useState(FORM_VACIO);

  async function guardar() {
    if (!form.titulo.trim()) return;
    if (editando === 'nueva') {
      await db.tarjetasPlan.add({
        id: nuevoId(),
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        visibleParaPaciente: form.visibleParaPaciente,
        orden: tarjetas.length + 1,
      });
    } else if (editando) {
      await db.tarjetasPlan.update(editando.id, {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        visibleParaPaciente: form.visibleParaPaciente,
      });
    }
    setEditando(undefined);
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
            {editando === 'nueva' ? copy.miPlan.nueva : form.titulo}
          </h1>
        </header>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.miPlan.tituloCampo}
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.miPlan.contenidoCampo}
          <textarea
            value={form.contenido}
            onChange={(e) => setForm({ ...form, contenido: e.target.value })}
            rows={5}
            className="rounded-token border-2 border-tinta-suave/40 bg-superficie p-4 font-normal"
          />
        </label>
        <BigChoice
          ancho
          etiqueta={copy.miPlan.visiblePaciente}
          seleccionado={form.visibleParaPaciente}
          onSelect={() =>
            setForm((f) => ({ ...f, visibleParaPaciente: !f.visibleParaPaciente }))
          }
        />
        <PrimaryButton onClick={() => void guardar()}>{comun.guardar}</PrimaryButton>
        {editando !== 'nueva' ? (
          <button
            type="button"
            onClick={() => {
              void db.tarjetasPlan.delete(editando.id).then(() => setEditando(undefined));
            }}
            className="min-h-chip w-full rounded-token text-boton text-rojo underline"
          >
            {copy.contactos.eliminar}
          </button>
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
        <h1 className="text-pregunta font-bold text-tinta">{copy.miPlan.titulo}</h1>
      </header>
      <p className="text-min text-tinta-suave">{copy.miPlan.intro}</p>
      {tarjetas.length === 0 ? (
        <p className="text-base text-tinta-suave">{copy.miPlan.vacio}</p>
      ) : (
        tarjetas.map((tj) => (
          <button
            key={tj.id}
            type="button"
            onClick={() => {
              setForm({
                titulo: tj.titulo,
                contenido: tj.contenido,
                visibleParaPaciente: tj.visibleParaPaciente,
              });
              setEditando(tj);
            }}
            className="rounded-token bg-superficie p-4 text-left"
          >
            <p className="text-boton font-bold text-tinta">{tj.titulo}</p>
            <p className="text-min text-tinta-suave">{tj.contenido.slice(0, 120)}</p>
          </button>
        ))
      )}
      <PrimaryButton
        onClick={() => {
          setForm(FORM_VACIO);
          setEditando('nueva');
        }}
      >
        {copy.miPlan.nueva}
      </PrimaryButton>
    </div>
  );
}
