// Acceso al modo cuidador (§3.2): botón visible "Soy el cuidador" + PIN de
// 4 dígitos. Jamás un gesto oculto. Si no hay PIN aún, se crea aquí.

import { useState } from 'react';
import { CardQuestion } from '@/components/CardQuestion';
import { NumericKeypad } from '@/components/NumericKeypad';
import { cuidador as copy } from '@/content/es-CO';
import { db } from '@/db/dexie';
import { hashPin } from '@/db/backup';
import type { Perfil } from '@/types/models';
import { useApp } from '@/store';

export function CuidadorPin({ perfil }: { perfil: Perfil }) {
  const { volver, reemplazar, setCuidadorActivo } = useApp();
  const creando = !perfil.pinHash;
  const [pin, setPin] = useState('');
  const [primero, setPrimero] = useState<string>();
  const [error, setError] = useState<string>();

  const titulo = creando
    ? primero
      ? copy.pin.confirmar
      : copy.pin.crear
    : copy.pin.ingrese;

  const procesar = async (valor: string) => {
    if (valor.length !== 4) return;
    if (creando) {
      if (!primero) {
        setPrimero(valor);
        setPin('');
        return;
      }
      if (primero !== valor) {
        setError(copy.pin.noCoincide);
        setPrimero(undefined);
        setPin('');
        return;
      }
      await db.perfiles.update(perfil.id, { pinHash: await hashPin(valor) });
      setCuidadorActivo(true);
      reemplazar({ id: 'cuidadorPanel' });
      return;
    }
    if ((await hashPin(valor)) === perfil.pinHash) {
      setCuidadorActivo(true);
      reemplazar({ id: 'cuidadorPanel' });
    } else {
      setError(copy.pin.error);
      setPin('');
    }
  };

  return (
    <CardQuestion pregunta={titulo} onVolver={volver}>
      <NumericKeypad
        valor={pin}
        onCambio={(v) => {
          setError(undefined);
          setPin(v);
          if (v.length === 4) void procesar(v);
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
    </CardQuestion>
  );
}
