// Funciones puras de ventanas y recurrencia (§6.2) — sin efectos, 100% testeables.
// Todas las fechas de día son "yyyy-mm-dd"; las de instante, ISO 8601.

import type { CheckinDiario, Episodio, TipoEpisodio } from '@/types/models';

/** Suma n días (puede ser negativo) a una fecha yyyy-mm-dd. */
export function sumarDias(fecha: string, n: number): string {
  const d = new Date(`${fecha}T12:00:00`); // mediodía evita saltos por DST
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Diferencia a - b en días calendario. */
export function diffDias(a: string, b: string): number {
  const da = new Date(`${a}T12:00:00`).getTime();
  const db = new Date(`${b}T12:00:00`).getTime();
  return Math.round((da - db) / 86_400_000);
}

/** ¿fecha cae dentro de los últimos `dias` días terminando en `hoy` (inclusive)? */
export function enVentana(fecha: string, hoy: string, dias: number): boolean {
  const diff = diffDias(hoy, fecha.slice(0, 10));
  return diff >= 0 && diff < dias;
}

/**
 * Cuenta días distintos con la señal dada en la ventana [hoy-(dias-1), hoy].
 * `pred` decide si el check-in de ese día presenta la señal.
 */
export function contarDiasConSenal(
  checkins: CheckinDiario[],
  hoy: string,
  dias: number,
  pred: (c: CheckinDiario) => boolean,
): number {
  const vistos = new Set<string>();
  for (const c of checkins) {
    if (enVentana(c.fecha, hoy, dias) && pred(c) && !vistos.has(c.fecha)) {
      vistos.add(c.fecha);
    }
  }
  return vistos.size;
}

/** Cuenta episodios de un tipo en la ventana de `dias` días terminando hoy. */
export function contarEpisodios(
  episodios: Episodio[],
  tipo: TipoEpisodio,
  hoy: string,
  dias: number,
): number {
  return episodios.filter((e) => e.tipo === tipo && enVentana(e.cuando, hoy, dias))
    .length;
}

/**
 * Días CONSECUTIVOS terminando en `hoy` en que el ánimo estuvo en las 2 caras
 * más bajas (1-2). Un día sin registro corta la racha (§6.2: "3 días seguidos").
 */
export function rachaAnimoBajo(checkins: CheckinDiario[], hoy: string): number {
  const porFecha = new Map<string, CheckinDiario>();
  for (const c of checkins) porFecha.set(c.fecha, c);
  let racha = 0;
  let dia = hoy;
  for (;;) {
    const c = porFecha.get(dia);
    if (!c || c.animo === undefined || c.animo > 2) break;
    racha += 1;
    dia = sumarDias(dia, -1);
  }
  return racha;
}
