// Regla de peso (§6.3 / §7.3-A6) — función pura con umbrales en config.
// Evidencia: ~50% de personas con ELA son hipermetabólicas; evitar pérdida de
// peso es prioridad (EAN/MND, §2.2-3). Umbral por defecto: −5% en 8 semanas o
// −2 kg en 4 semanas; editable por el cuidador con su equipo.

import type { Peso } from '@/types/models';
import { enVentana } from './recurrence';

export interface UmbralesPeso {
  pesoPorcentaje8Sem: number; // p. ej. 5 (%)
  pesoKg4Sem: number; // p. ej. 2 (kg)
}

export const UMBRALES_PESO_DEFECTO: UmbralesPeso = {
  pesoPorcentaje8Sem: 5,
  pesoKg4Sem: 2,
};

export interface ResultadoPeso {
  nivel: 'sin_datos' | 'estable' | 'ambar';
  /** Qué umbral se cruzó, si alguno. */
  motivo?: 'pct_8_semanas' | 'kg_4_semanas';
  /** Cambio en kg dentro de la ventana que disparó (negativo = bajó). */
  deltaKg?: number;
  ultimo?: Peso;
}

/** Peso más antiguo dentro de la ventana (referencia de comparación). */
function referenciaEnVentana(pesos: Peso[], hoy: string, dias: number): Peso | undefined {
  const enRango = pesos
    .filter((p) => enVentana(p.fecha, hoy, dias))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  return enRango[0];
}

export function evaluarPeso(
  pesos: Peso[],
  hoy: string,
  umbrales: UmbralesPeso = UMBRALES_PESO_DEFECTO,
): ResultadoPeso {
  const ordenados = [...pesos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ultimo = ordenados[ordenados.length - 1];
  if (!ultimo || !enVentana(ultimo.fecha, hoy, 7 * 8 + 1)) {
    return { nivel: 'sin_datos', ultimo };
  }

  // −N kg en 4 semanas
  const ref4 = referenciaEnVentana(ordenados, hoy, 7 * 4);
  if (ref4 && ref4.id !== ultimo.id) {
    const delta = ultimo.kg - ref4.kg;
    if (-delta >= umbrales.pesoKg4Sem) {
      return { nivel: 'ambar', motivo: 'kg_4_semanas', deltaKg: delta, ultimo };
    }
  }

  // −N% en 8 semanas
  const ref8 = referenciaEnVentana(ordenados, hoy, 7 * 8);
  if (ref8 && ref8.id !== ultimo.id && ref8.kg > 0) {
    const delta = ultimo.kg - ref8.kg;
    const pct = (-delta / ref8.kg) * 100;
    if (pct >= umbrales.pesoPorcentaje8Sem) {
      return { nivel: 'ambar', motivo: 'pct_8_semanas', deltaKg: delta, ultimo };
    }
  }

  return { nivel: 'estable', ultimo };
}
