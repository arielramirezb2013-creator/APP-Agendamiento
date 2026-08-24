// "Mi semana" (§2.1: visualización de datos a la medida, cara a la paciente):
// mapa de ánimo, tendencia de peso y comidas de la semana, en tono cálido y
// sin alarmas — la lectura clínica fina vive en el panel del cuidador y el PDF.

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { comidas as copyComidas, comun, interpolar, miSemana as copy, t } from '@/content/es-CO';
import { db, hoyLocal } from '@/db/dexie';
import { enVentana, sumarDias } from '@/rules/recurrence';
import { evaluarPeso, UMBRALES_PESO_DEFECTO, type UmbralesPeso } from '@/rules/weight';
import { contactoParaTema } from '@/services/banderas';
import type { Perfil } from '@/types/models';
import { useApp } from '@/store';
import { GraficaPeso } from '@/components/graficas/GraficaPeso';
import { MapaAnimo } from '@/components/graficas/MapaAnimo';

export function MiSemana({ perfil }: { perfil: Perfil }) {
  const { volver } = useApp();
  const trato = perfil.tratamiento;
  const hoy = hoyLocal();
  const [umbrales, setUmbrales] = useState<UmbralesPeso>(UMBRALES_PESO_DEFECTO);
  const [nombreNutri, setNombreNutri] = useState<string>();

  const checkins =
    useLiveQuery(
      () => db.checkins.where('fecha').aboveOrEqual(sumarDias(hoy, -27)).toArray(),
      [hoy],
    ) ?? [];
  const pesos = useLiveQuery(() => db.pesos.orderBy('fecha').toArray(), []) ?? [];
  const comidas =
    useLiveQuery(
      () => db.comidas.where('fecha').aboveOrEqual(sumarDias(hoy, -6)).toArray(),
      [hoy],
    ) ?? [];

  useEffect(() => {
    void db.config.get('default').then((c) => {
      if (c) {
        setUmbrales({ pesoPorcentaje8Sem: c.pesoPorcentaje8Sem, pesoKg4Sem: c.pesoKg4Sem });
      }
    });
    void contactoParaTema('nutricion').then((c) => setNombreNutri(c?.nombre));
  }, []);

  const pesos8 = pesos.filter((p) => enVentana(p.fecha, hoy, 7 * 8));
  const resultadoPeso = evaluarPeso(pesos, hoy, umbrales);
  const comidasBien = comidas.filter((m) => m.tragando === 'bien').length;
  const hayAlgo = checkins.length > 0 || pesos8.length > 0 || comidas.length > 0;

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
        <h1 className="text-pregunta font-bold text-tinta">🌤️ {copy.titulo}</h1>
      </header>
      <p className="text-min text-tinta-suave">{t(copy.intro, trato)}</p>

      {!hayAlgo ? (
        <p className="rounded-token bg-superficie p-5 text-base text-tinta-suave">
          {trato === 'tu' ? copy.sinDatosSemanaTu : copy.sinDatosSemana}
        </p>
      ) : null}

      {checkins.length > 0 ? (
        <section className="rounded-token bg-superficie p-4">
          <h2 className="mb-2 text-base font-bold text-tinta">{copy.animoTitulo}</h2>
          <MapaAnimo checkins={checkins} hoy={hoy} semanas={4} />
        </section>
      ) : null}

      {pesos8.length >= 2 ? (
        <section className="rounded-token bg-superficie p-4">
          <h2 className="mb-2 text-base font-bold text-tinta">{copy.pesoTitulo}</h2>
          <GraficaPeso pesos={pesos8} />
          <p
            className={`mt-1 text-base font-bold ${
              resultadoPeso.nivel === 'ambar' ? 'text-ambar' : 'text-exito'
            }`}
          >
            {resultadoPeso.nivel === 'ambar'
              ? `⚠️ ${interpolar(copyComidas.peso.haBajado, {
                  contacto: nombreNutri ?? (trato === 'tu' ? 'tu equipo' : 'su equipo'),
                })}`
              : copyComidas.peso.estable}
          </p>
        </section>
      ) : null}

      {comidas.length > 0 ? (
        <section className="rounded-token bg-superficie p-4">
          <h2 className="mb-1 text-base font-bold text-tinta">{copy.comidasTitulo}</h2>
          <p className="text-base text-tinta" style={{ fontVariantNumeric: 'tabular-nums' }}>
            🍲 {interpolar(copy.comidasBien, {
              n: String(comidas.length),
              bien: String(comidasBien),
            })}
          </p>
        </section>
      ) : null}
    </div>
  );
}
