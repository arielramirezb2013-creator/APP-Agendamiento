// Contactos (§6.5): 100% editables SOLO en modo cuidador. Con precargas
// sugeridas de Colombia (123, ACELA) que se pueden editar o borrar.

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { comun, cuidador as copy, directorio } from '@/content/es-CO';
import { db, nuevoId } from '@/db/dexie';
import type { Contacto, Tema } from '@/types/models';
import { useApp } from '@/store';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BigChoice } from '@/components/BigChoice';

const TEMAS: Tema[] = [
  'emergencia',
  'respiracion',
  'tragar',
  'nutricion',
  'moverme',
  'animo',
  'medicinas',
  'tramites',
  'otro',
];

const FORM_VACIO = {
  nombre: '',
  telefono: '',
  whatsapp: '',
  paraQue: '',
  temas: [] as Tema[],
  esEmergencia: false,
};

export function CuidadorContactos() {
  const { volver } = useApp();
  const contactos = useLiveQuery(() => db.contactos.orderBy('orden').toArray(), []) ?? [];
  const [editando, setEditando] = useState<Contacto | 'nuevo'>();
  const [form, setForm] = useState(FORM_VACIO);

  const abrirNuevo = () => {
    setForm(FORM_VACIO);
    setEditando('nuevo');
  };
  const abrirEdicion = (c: Contacto) => {
    setForm({
      nombre: c.nombre,
      telefono: c.telefono,
      whatsapp: c.whatsapp ?? '',
      paraQue: c.paraQue,
      temas: c.temas,
      esEmergencia: c.esEmergencia,
    });
    setEditando(c);
  };

  async function guardar() {
    if (!form.nombre.trim() || !form.telefono.trim()) return;
    const base = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      whatsapp: form.whatsapp.trim() || undefined,
      paraQue: form.paraQue.trim(),
      temas: form.esEmergencia && !form.temas.includes('emergencia')
        ? ([...form.temas, 'emergencia'] as Tema[])
        : form.temas,
      esEmergencia: form.esEmergencia,
    };
    if (editando === 'nuevo') {
      await db.contactos.add({
        id: nuevoId(),
        orden: contactos.length + 1,
        ...base,
      });
    } else if (editando) {
      await db.contactos.update(editando.id, base);
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
            {editando === 'nuevo' ? copy.contactos.nuevo : form.nombre}
          </h1>
        </header>

        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.contactos.nombre}
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.contactos.telefono}
          <input
            value={form.telefono}
            inputMode="tel"
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.contactos.whatsappOpc}
          <input
            value={form.whatsapp}
            inputMode="tel"
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.contactos.paraQue}
          <input
            value={form.paraQue}
            onChange={(e) => setForm({ ...form, paraQue: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-base font-bold text-tinta">{copy.contactos.temas}</legend>
          <div className="grid grid-cols-2 gap-2">
            {TEMAS.map((tema) => (
              <BigChoice
                key={tema}
                etiqueta={`${directorio.temas[tema].emoji} ${directorio.temas[tema].etiqueta}`}
                seleccionado={form.temas.includes(tema)}
                onSelect={() =>
                  setForm((f) => ({
                    ...f,
                    temas: f.temas.includes(tema)
                      ? f.temas.filter((x) => x !== tema)
                      : [...f.temas, tema],
                  }))
                }
              />
            ))}
          </div>
        </fieldset>

        <BigChoice
          ancho
          etiqueta={`🚨 ${copy.contactos.esEmergencia}`}
          seleccionado={form.esEmergencia}
          onSelect={() => setForm((f) => ({ ...f, esEmergencia: !f.esEmergencia }))}
        />

        <PrimaryButton onClick={() => void guardar()}>
          {copy.contactos.guardar}
        </PrimaryButton>
        {editando !== 'nuevo' ? (
          <button
            type="button"
            onClick={() => {
              void db.contactos.delete(editando.id).then(() => setEditando(undefined));
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
        <h1 className="text-pregunta font-bold text-tinta">{copy.contactos.titulo}</h1>
      </header>
      <p className="text-min text-tinta-suave">{copy.contactos.precargaNota}</p>
      {contactos.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => abrirEdicion(c)}
          className="flex min-h-chip w-full items-center justify-between rounded-token
            bg-superficie px-4 text-left"
        >
          <span>
            <span className="block text-boton font-bold text-tinta">
              {c.esEmergencia ? '🚨 ' : ''}
              {c.nombre}
            </span>
            <span className="block text-min text-tinta-suave">{c.telefono} · {c.paraQue}</span>
          </span>
          <span aria-hidden="true">›</span>
        </button>
      ))}
      <PrimaryButton onClick={abrirNuevo}>{copy.contactos.nuevo}</PrimaryButton>
    </div>
  );
}
