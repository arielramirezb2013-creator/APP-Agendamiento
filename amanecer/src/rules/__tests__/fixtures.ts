// Fábricas de datos para los tests de reglas (§15.2 Fase 3: fixture de escenarios).

import type {
  CheckinDiario,
  Comida,
  Episodio,
  Llenado,
  Peso,
  TipoEpisodio,
} from '@/types/models';

export const HOY = '2026-08-23';

const llenado: Llenado = { por: 'paciente', fecha: `${HOY}T08:00:00.000Z` };

let seq = 0;
const id = () => `t-${++seq}`;

export function checkin(fecha: string, extra: Partial<CheckinDiario> = {}): CheckinDiario {
  return { id: id(), fecha, llenado, banderas: [], ...extra };
}

export function episodio(
  tipo: TipoEpisodio,
  cuando: string,
  extra: Partial<Episodio> = {},
): Episodio {
  return {
    id: id(),
    tipo,
    cuando,
    severidad: 'moderado',
    resueltoEnElMomento: true,
    llenado,
    banderas: [],
    ...extra,
  };
}

export function comida(
  fecha: string,
  tragando: Comida['tragando'],
  extra: Partial<Comida> = {},
): Comida {
  return {
    id: id(),
    fecha,
    momento: 'almuerzo',
    cantidad: 'todo',
    tragando,
    llenado,
    ...extra,
  };
}

export function peso(fecha: string, kg: number): Peso {
  return { id: id(), fecha, kg, llenado };
}

export function ctxBase() {
  return {
    hoy: HOY,
    checkins: [] as CheckinDiario[],
    episodios: [] as Episodio[],
    comidas: [] as Comida[],
    pesos: [] as Peso[],
  };
}
