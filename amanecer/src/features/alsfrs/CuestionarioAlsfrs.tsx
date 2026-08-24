// Cuestionario mensual ALSFRS-R autoadministrado (§6.4): 12 preguntas en
// lenguaje de casa, una por pantalla, con pausa y reanudación. Resultados
// SIEMPRE por subescalas como perfil; sello de autorreporte permanente.
// La app no interpreta caídas de puntaje con mensajes alarmantes.

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BigChoice } from '@/components/BigChoice';
import { CardQuestion } from '@/components/CardQuestion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { alsfrs as copy, comun, interpolar, t } from '@/content/es-CO';
import { calcularSubescalas, ITEMS_ALSFRS } from '@/content/alsfrs';
import { ahoraISO, db, hoyLocal, nuevoId } from '@/db/dexie';
import type { AlsfrsR, Perfil, Rol } from '@/types/models';
import { useApp } from '@/store';
import { PerfilAlsfrs } from '@/components/graficas/PerfilAlsfrs';

interface CuestionarioProps {
  perfil: Perfil;
  rol: Rol;
}

export function CuestionarioAlsfrs({ perfil, rol }: CuestionarioProps) {
  const { volver, aInicio } = useApp();
  const trato = perfil.tratamiento;
  const [items, setItems] = useState<number[]>(Array(12).fill(-1));
  const [indice, setIndice] = useState(0);
  const [borradorId, setBorradorId] = useState<string>();
  const [terminado, setTerminado] = useState(false);
  const [cargado, setCargado] = useState(false);

  const completados =
    useLiveQuery(
      () => db.alsfrs.orderBy('fecha').toArray().then((r) => r.filter((x) => !x.borrador)),
      [],
    ) ?? [];

  // Reanudar borrador si existe (§6.4: se puede pausar y retomar).
  useEffect(() => {
    void db.alsfrs
      .toArray()
      .then((todos) => {
        const borrador = todos.find((r) => r.borrador);
        if (borrador) {
          setItems(borrador.items);
          setBorradorId(borrador.id);
          const primeroPendiente = borrador.items.findIndex((v) => v < 0);
          setIndice(primeroPendiente === -1 ? 11 : primeroPendiente);
        }
        setCargado(true);
      });
  }, []);

  async function guardarBorrador(nuevos: number[]) {
    const registro: AlsfrsR = {
      id: borradorId ?? nuevoId(),
      fecha: hoyLocal(),
      items: nuevos,
      sub: { bulbar: 0, motora: 0, respiratoria: 0 },
      total: 0,
      autorreporte: true,
      borrador: true,
      llenado: { por: rol, fecha: ahoraISO() },
    };
    await db.alsfrs.put(registro);
    setBorradorId(registro.id);
  }

  async function responder(valor: number) {
    const nuevos = [...items];
    nuevos[indice] = valor;
    setItems(nuevos);
    if (indice < 11) {
      await guardarBorrador(nuevos);
      setIndice(indice + 1);
      return;
    }
    // Completo: calcular subescalas y cerrar el borrador.
    const sub = calcularSubescalas(nuevos);
    const registro: AlsfrsR = {
      id: borradorId ?? nuevoId(),
      fecha: hoyLocal(),
      items: nuevos,
      sub: { bulbar: sub.bulbar, motora: sub.motora, respiratoria: sub.respiratoria },
      total: sub.total,
      autorreporte: true,
      borrador: false,
      llenado: { por: rol, fecha: ahoraISO() },
    };
    await db.alsfrs.put(registro);
    setTerminado(true);
  }

  if (!cargado) return null;

  if (terminado) {
    const todos = [...completados.filter((r) => !r.borrador)];
    return (
      <div className="transicion-tarjeta flex min-h-dvh flex-col justify-center gap-5 bg-fondo px-4 py-8">
        <p className="text-center text-pregunta font-bold text-exito">
          {t(copy.cierre, trato)}
        </p>
        <section className="rounded-token bg-superficie p-4">
          <PerfilAlsfrs registros={todos} />
        </section>
        <PrimaryButton onClick={aInicio}>{comun.seguir}</PrimaryButton>
      </div>
    );
  }

  const item = ITEMS_ALSFRS[indice];
  return (
    <CardQuestion
      pregunta={item.pregunta}
      progreso={interpolar(copy.progreso, { n: String(indice + 1) })}
      onVolver={() => {
        if (indice > 0) setIndice(indice - 1);
        else volver();
      }}
      pie={
        <button
          type="button"
          onClick={() => {
            void guardarBorrador(items).then(volver);
          }}
          className="min-h-chip w-full rounded-token text-boton text-tinta-suave underline"
        >
          {copy.pausar}
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {item.opciones.map((opcion, i) => {
          const valor = 4 - i;
          return (
            <BigChoice
              key={opcion}
              ancho
              etiqueta={opcion}
              seleccionado={items[indice] === valor}
              onSelect={() => void responder(valor)}
            />
          );
        })}
      </div>
    </CardQuestion>
  );
}
