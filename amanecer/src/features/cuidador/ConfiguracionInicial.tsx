// Primer arranque (§3.2): la paciente nunca configura nada — el cuidador crea
// aquí el perfil (nombre, tratamiento) y su PIN, una sola vez. Después la app
// abre siempre en la pantalla de ella.

import { useState } from 'react';
import { NumericKeypad } from '@/components/NumericKeypad';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BigChoice } from '@/components/BigChoice';
import { cuidador as copy } from '@/content/es-CO';
import { APP_NAME } from '@/design/tokens';
import { db, nuevoId } from '@/db/dexie';
import { hashPin } from '@/db/backup';
import { sembrarPrecargas } from '@/db/seed';

export function ConfiguracionInicial({ onListo }: { onListo: () => void }) {
  const [nombre, setNombre] = useState('');
  const [trato, setTrato] = useState<'usted' | 'tu'>('usted');
  const [pin, setPin] = useState('');
  const [pinConfirmado, setPinConfirmado] = useState<string>();
  const [fase, setFase] = useState<'datos' | 'pin' | 'pin2'>('datos');
  const [error, setError] = useState<string>();

  async function crear(pinFinal: string) {
    await db.perfiles.add({
      id: nuevoId(),
      nombre: nombre.trim(),
      tratamiento: trato,
      appName: APP_NAME,
      pinHash: await hashPin(pinFinal),
    });
    await sembrarPrecargas();
    onListo();
  }

  if (fase === 'pin' || fase === 'pin2') {
    return (
      <div className="flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8">
        <h1 className="text-pregunta font-bold text-tinta">
          {fase === 'pin' ? copy.pin.crear : copy.pin.confirmar}
        </h1>
        <NumericKeypad
          valor={pin}
          onCambio={(v) => {
            setError(undefined);
            setPin(v);
            if (v.length === 4) {
              if (fase === 'pin') {
                setPinConfirmado(v);
                setPin('');
                setFase('pin2');
              } else if (pinConfirmado === v) {
                void crear(v);
              } else {
                setError(copy.pin.noCoincide);
                setPin('');
                setPinConfirmado(undefined);
                setFase('pin');
              }
            }
          }}
          maxLargo={4}
          oculto
          etiquetaBorrar={copy.pin.borrar}
        />
        {error ? (
          <p role="alert" className="text-center text-base font-bold text-rojo">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8">
      <h1 className="font-titular text-saludo text-tinta">{copy.bienvenida.titulo}</h1>
      <p className="text-base text-tinta-suave">{copy.bienvenida.intro}</p>

      <label className="flex flex-col gap-2 text-base font-bold text-tinta">
        {copy.bienvenida.nombreLabel}
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="min-h-chip rounded-token border-2 border-tinta-suave/20 bg-superficie px-4 text-base font-normal"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-base font-bold text-tinta">
          {copy.bienvenida.tratamientoLabel}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <BigChoice
            etiqueta={copy.bienvenida.usted}
            seleccionado={trato === 'usted'}
            onSelect={() => setTrato('usted')}
          />
          <BigChoice
            etiqueta={copy.bienvenida.tu}
            seleccionado={trato === 'tu'}
            onSelect={() => setTrato('tu')}
          />
        </div>
      </fieldset>

      <PrimaryButton
        onClick={() => setFase('pin')}
        deshabilitado={nombre.trim().length === 0}
      >
        {copy.bienvenida.empezar}
      </PrimaryButton>
    </div>
  );
}
