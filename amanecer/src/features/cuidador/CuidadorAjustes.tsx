// Ajustes (§9.3, §12): nombre, tratamiento, alto contraste, PIN, día de peso,
// exportar respaldo cifrado, restaurar y "Borrar todo" con doble confirmación.
// Los datos son de ella y de su familia, siempre.

import { useEffect, useRef, useState } from 'react';
import { comun, cuidador as copy } from '@/content/es-CO';
import { db } from '@/db/dexie';
import { borrarTodo, exportarTodo, hashPin, importarTodo } from '@/db/backup';
import { UMBRALES_PESO_DEFECTO } from '@/rules/weight';
import type { Perfil } from '@/types/models';
import { useApp } from '@/store';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BigChoice } from '@/components/BigChoice';
import { NumericKeypad } from '@/components/NumericKeypad';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function CuidadorAjustes({ perfil }: { perfil: Perfil }) {
  const { volver, aInicio } = useApp();
  const [nombre, setNombre] = useState(perfil.nombre);
  const [appName, setAppName] = useState(perfil.appName);
  const [ciudad, setCiudad] = useState(perfil.ciudad ?? '');
  const [passExport, setPassExport] = useState('');
  const [fase, setFase] = useState<'normal' | 'nuevoPin' | 'confirmarBorrado' | 'pinBorrado'>(
    'normal',
  );
  const [pin, setPin] = useState('');
  const [primerPin, setPrimerPin] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const archivoRef = useRef<HTMLInputElement>(null);
  // Umbrales de la regla de peso A6 (§6.3): editables por el cuidador con su equipo.
  const [umbralKg, setUmbralKg] = useState(String(UMBRALES_PESO_DEFECTO.pesoKg4Sem));
  const [umbralPct, setUmbralPct] = useState(
    String(UMBRALES_PESO_DEFECTO.pesoPorcentaje8Sem),
  );

  useEffect(() => {
    void db.config.get('default').then((c) => {
      if (c) {
        setUmbralKg(String(c.pesoKg4Sem));
        setUmbralPct(String(c.pesoPorcentaje8Sem));
      }
    });
  }, []);

  const guardarUmbrales = async () => {
    const kg = Number(umbralKg.replace(',', '.'));
    const pct = Number(umbralPct.replace(',', '.'));
    if (!kg || kg <= 0 || !pct || pct <= 0) return;
    await db.config.put({ id: 'default', pesoKg4Sem: kg, pesoPorcentaje8Sem: pct });
    setAviso(comun.guardado);
  };

  const actualizar = async (cambios: Partial<Perfil>) => {
    await db.perfiles.update(perfil.id, cambios);
    setAviso(comun.guardado);
  };

  async function exportar() {
    if (!passExport) return;
    const blob = await exportarTodo(passExport);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amanecer-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAviso(comun.guardado);
  }

  async function importar(archivo: File) {
    if (!passExport) return;
    try {
      await importarTodo(await archivo.text(), passExport);
      setAviso(comun.guardado);
    } catch {
      setAviso(comun.errorGuardar);
    }
  }

  if (fase === 'nuevoPin') {
    return (
      <div className="flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8">
        <h1 className="text-pregunta font-bold text-tinta">
          {primerPin ? copy.pin.confirmar : copy.pin.crear}
        </h1>
        <NumericKeypad
          valor={pin}
          onCambio={(v) => {
            setPin(v);
            if (v.length === 4) {
              if (!primerPin) {
                setPrimerPin(v);
                setPin('');
              } else if (primerPin === v) {
                void hashPin(v).then((h) =>
                  actualizar({ pinHash: h }).then(() => {
                    setFase('normal');
                    setPin('');
                    setPrimerPin(undefined);
                  }),
                );
              } else {
                setPrimerPin(undefined);
                setPin('');
                setAviso(copy.pin.noCoincide);
                setFase('normal');
              }
            }
          }}
          maxLargo={4}
          oculto
          etiquetaBorrar={copy.pin.borrar}
        />
      </div>
    );
  }

  if (fase === 'pinBorrado') {
    return (
      <div className="flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8">
        <h1 className="text-pregunta font-bold text-rojo">{copy.ajustes.borrarConfirmar2}</h1>
        <NumericKeypad
          valor={pin}
          onCambio={(v) => {
            setPin(v);
            if (v.length === 4) {
              void hashPin(v).then(async (h) => {
                if (h === perfil.pinHash) {
                  await borrarTodo();
                  aInicio();
                } else {
                  setAviso(copy.pin.error);
                  setPin('');
                  setFase('normal');
                }
              });
            }
          }}
          maxLargo={4}
          oculto
          etiquetaBorrar={copy.pin.borrar}
        />
      </div>
    );
  }

  if (fase === 'confirmarBorrado') {
    return (
      <div className="flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8">
        <h1 className="text-pregunta font-bold text-rojo">{copy.ajustes.borrarConfirmar}</h1>
        <PrimaryButton variante="rojo" onClick={() => setFase('pinBorrado')}>
          {copy.ajustes.borrarTodo}
        </PrimaryButton>
        <PrimaryButton variante="neutro" onClick={() => setFase('normal')}>
          {comun.cancelar}
        </PrimaryButton>
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
        <h1 className="text-pregunta font-bold text-tinta">{copy.ajustes.titulo}</h1>
      </header>

      {aviso ? (
        <p role="status" className="text-base font-bold text-exito">
          {aviso}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-base font-bold text-tinta">
        {copy.ajustes.nombre}
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => void actualizar({ nombre: nombre.trim() || perfil.nombre })}
          className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
        />
      </label>

      <label className="flex flex-col gap-1 text-base font-bold text-tinta">
        {copy.ajustes.appName}
        <input
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          onBlur={() => void actualizar({ appName: appName.trim() || perfil.appName })}
          className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
        />
      </label>

      <label className="flex flex-col gap-1 text-base font-bold text-tinta">
        {copy.ajustes.ciudad}
        <input
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          onBlur={() => void actualizar({ ciudad: ciudad.trim() || undefined })}
          className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
        />
      </label>

      <fieldset>
        <legend className="mb-2 text-base font-bold text-tinta">
          {copy.ajustes.tratamiento}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <BigChoice
            etiqueta={copy.bienvenida.usted}
            seleccionado={perfil.tratamiento === 'usted'}
            onSelect={() => void actualizar({ tratamiento: 'usted' })}
          />
          <BigChoice
            etiqueta={copy.bienvenida.tu}
            seleccionado={perfil.tratamiento === 'tu'}
            onSelect={() => void actualizar({ tratamiento: 'tu' })}
          />
        </div>
      </fieldset>

      <BigChoice
        ancho
        etiqueta={copy.ajustes.altoContraste}
        seleccionado={perfil.altoContraste ?? false}
        onSelect={() => void actualizar({ altoContraste: !perfil.altoContraste })}
      />

      <fieldset>
        <legend className="mb-2 text-base font-bold text-tinta">{copy.ajustes.diaPeso}</legend>
        <div className="grid grid-cols-2 gap-2">
          {DIAS.map((d, i) => (
            <BigChoice
              key={d}
              etiqueta={d}
              seleccionado={perfil.diaPeso === i}
              onSelect={() => void actualizar({ diaPeso: i })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-token bg-superficie p-4">
        <legend className="text-base font-bold text-tinta">
          ⚖️ {copy.ajustes.umbralesTitulo}
        </legend>
        <p className="mb-2 text-min text-tinta-suave">{copy.ajustes.umbralesNota}</p>
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.ajustes.umbralKg}
          <input
            value={umbralKg}
            inputMode="decimal"
            onChange={(e) => setUmbralKg(e.target.value)}
            onBlur={() => void guardarUmbrales()}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.ajustes.umbralPct}
          <input
            value={umbralPct}
            inputMode="decimal"
            onChange={(e) => setUmbralPct(e.target.value)}
            onBlur={() => void guardarUmbrales()}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
      </fieldset>

      <button
        type="button"
        onClick={() => setFase('nuevoPin')}
        className="min-h-chip w-full rounded-token border-2 border-primario bg-superficie
          text-boton font-bold text-primario"
      >
        {copy.ajustes.cambiarPin}
      </button>

      <section className="flex flex-col gap-2 rounded-token bg-superficie p-4">
        <label className="flex flex-col gap-1 text-base font-bold text-tinta">
          {copy.ajustes.exportarPass}
          <input
            type="password"
            value={passExport}
            onChange={(e) => setPassExport(e.target.value)}
            className="min-h-chip rounded-token border-2 border-tinta-suave/40 bg-superficie px-4 font-normal"
          />
        </label>
        <PrimaryButton onClick={() => void exportar()} deshabilitado={!passExport}>
          {copy.ajustes.exportar}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => archivoRef.current?.click()}
          disabled={!passExport}
          className="min-h-chip w-full rounded-token border-2 border-primario bg-superficie
            text-boton font-bold text-primario disabled:opacity-50"
        >
          {copy.ajustes.importar}
        </button>
        <input
          ref={archivoRef}
          type="file"
          accept="application/json"
          className="sr-only"
          aria-label={copy.ajustes.importar}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importar(f);
          }}
        />
      </section>

      <button
        type="button"
        onClick={() => setFase('confirmarBorrado')}
        className="min-h-chip w-full rounded-token border-2 border-rojo bg-superficie
          text-boton font-bold text-rojo"
      >
        {copy.ajustes.borrarTodo}
      </button>

      <p className="mt-4 text-min text-tinta-suave">{copy.ajustes.acercaDe}</p>
    </div>
  );
}
