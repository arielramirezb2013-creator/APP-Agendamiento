// Gestión de la red de apoyo (Modo Cuidador): entidades locales/nacionales
// editables y seguimiento de inquietudes — anotar aquí la respuesta recibida
// para que a ella le aparezca como "Respondida ✅".

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { comun, cuidador as copyCuidador, interpolar, redApoyo as copy } from '@/content/es-CO';
import { db, nuevoId } from '@/db/dexie';
import type { OrganizacionApoyo } from '@/types/models';
import { useApp } from '@/store';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BigChoice } from '@/components/BigChoice';

const FORM_VACIO = {
  nombre: '',
  alcance: 'local' as 'local' | 'nacional',
  ciudad: '',
  paraQue: '',
  telefono: '',
  whatsapp: '',
};

export function CuidadorRed() {
  const { volver } = useApp();
  const orgs = useLiveQuery(() => db.redApoyo.orderBy('orden').toArray(), []) ?? [];
  const inquietudes =
    useLiveQuery(() => db.inquietudes.orderBy('fechaHora').reverse().toArray(), []) ?? [];
  const [editando, setEditando] = useState<OrganizacionApoyo | 'nueva'>();
  const [form, setForm] = useState(FORM_VACIO);
  const [respondiendo, setRespondiendo] = useState<string>();
  const [respuesta, setRespuesta] = useState('');

  async function guardar() {
    if (!form.nombre.trim()) return;
    const base = {
      nombre: form.nombre.trim(),
      alcance: form.alcance,
      ciudad: form.alcance === 'local' ? form.ciudad.trim() || undefined : undefined,
      paraQue: form.paraQue.trim(),
      telefono: form.telefono.trim() || undefined,
      whatsapp: form.whatsapp.replace(/\D/g, '') || undefined,
    };
    if (editando === 'nueva') {
      await db.redApoyo.add({ id: nuevoId(), orden: orgs.length + 1, ...base });
    } else if (editando) {
      await db.redApoyo.update(editando.id, base);
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
            {editando === 'nueva' ? copy.nueva : form.nombre}
          </h1>
        </header>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.gestionTitulo}
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/20 bg-superficie px-4 font-normal"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <BigChoice
            etiqueta={copy.alcanceLocal}
            seleccionado={form.alcance === 'local'}
            onSelect={() => setForm({ ...form, alcance: 'local' })}
          />
          <BigChoice
            etiqueta={copy.alcanceNacional}
            seleccionado={form.alcance === 'nacional'}
            onSelect={() => setForm({ ...form, alcance: 'nacional' })}
          />
        </div>
        {form.alcance === 'local' ? (
          <label className="flex flex-col gap-1 text-base font-bold text-tinta">
            {copy.ciudadCampo}
            <input
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              className="min-h-chip rounded-token border-2 border-tinta-suave/20 bg-superficie px-4 font-normal"
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          ¿Para qué sirve? (una línea)
          <input
            value={form.paraQue}
            onChange={(e) => setForm({ ...form, paraQue: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/20 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          Teléfono
          <input
            value={form.telefono}
            inputMode="tel"
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/20 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          WhatsApp (con indicativo, ej. 573001234567)
          <input
            value={form.whatsapp}
            inputMode="tel"
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="min-h-chip rounded-token border-2 border-tinta-suave/20 bg-superficie px-4 font-normal"
          />
        </label>
        <PrimaryButton onClick={() => void guardar()}>{comun.guardar}</PrimaryButton>
        {editando !== 'nueva' ? (
          <button
            type="button"
            onClick={() => {
              void db.redApoyo.delete(editando.id).then(() => setEditando(undefined));
            }}
            className="min-h-chip w-full rounded-token text-boton text-rojo underline"
          >
            {copyCuidador.contactos.eliminar}
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
        <h1 className="text-pregunta font-bold text-tinta">🤝 {copy.gestionTitulo}</h1>
      </header>
      <p className="text-min text-tinta-suave">{copy.gestionNota}</p>

      {orgs.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => {
            setForm({
              nombre: o.nombre,
              alcance: o.alcance,
              ciudad: o.ciudad ?? '',
              paraQue: o.paraQue,
              telefono: o.telefono ?? '',
              whatsapp: o.whatsapp ?? '',
            });
            setEditando(o);
          }}
          className="flex min-h-chip w-full items-center justify-between rounded-token
            bg-superficie px-4 text-left"
        >
          <span>
            <span className="block text-boton font-bold text-tinta">{o.nombre}</span>
            <span className="block text-min text-tinta-suave">
              {o.alcance === 'nacional' ? copy.alcanceNacional : `${o.ciudad ?? ''}`} ·{' '}
              {o.telefono ?? 'sin teléfono'}
            </span>
          </span>
          <span aria-hidden="true">›</span>
        </button>
      ))}
      <PrimaryButton
        onClick={() => {
          setForm(FORM_VACIO);
          setEditando('nueva');
        }}
      >
        {copy.nueva}
      </PrimaryButton>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-tinta-suave">{copy.misPreguntas}</h2>
        {inquietudes.length === 0 ? (
          <p className="text-base text-tinta-suave">{copy.sinPreguntas}</p>
        ) : (
          inquietudes.map((q) => (
            <div key={q.id} className="rounded-token bg-superficie p-4">
              <p className="text-base text-tinta">"{q.texto}"</p>
              <p className="text-min text-tinta-suave">
                {q.fechaHora.slice(0, 10)} · {q.destinoNombre} ·{' '}
                {q.estado === 'respondida' ? copy.estadoRespondida : copy.estadoEnviada}
              </p>
              {q.respuesta ? (
                <p className="mt-1 text-min text-tinta">
                  {interpolar(copy.verRespuesta, { respuesta: q.respuesta })}
                </p>
              ) : null}
              {q.estado === 'enviada' ? (
                respondiendo === q.id ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <label className="flex flex-col gap-1 text-min font-bold text-tinta">
                      {copy.respuestaCampo}
                      <textarea
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        rows={2}
                        className="rounded-token border-2 border-tinta-suave/20 bg-superficie p-3 text-base font-normal"
                      />
                    </label>
                    <PrimaryButton
                      onClick={() => {
                        void db.inquietudes
                          .update(q.id, {
                            estado: 'respondida',
                            respuesta: respuesta.trim() || undefined,
                          })
                          .then(() => {
                            setRespondiendo(undefined);
                            setRespuesta('');
                          });
                      }}
                    >
                      {comun.guardar}
                    </PrimaryButton>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRespondiendo(q.id)}
                    className="mt-2 min-h-chip rounded-token px-3 text-min font-bold text-primario underline"
                  >
                    {copy.marcarRespondida}
                  </button>
                )
              ) : null}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
