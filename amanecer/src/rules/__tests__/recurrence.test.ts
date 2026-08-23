import { describe, expect, it } from 'vitest';
import {
  contarDiasConSenal,
  contarEpisodios,
  diffDias,
  enVentana,
  rachaAnimoBajo,
  sumarDias,
} from '../recurrence';
import { checkin, episodio, HOY } from './fixtures';

describe('sumarDias / diffDias', () => {
  it('suma y resta días cruzando meses', () => {
    expect(sumarDias('2026-08-31', 1)).toBe('2026-09-01');
    expect(sumarDias('2026-08-01', -1)).toBe('2026-07-31');
    expect(diffDias('2026-08-23', '2026-08-16')).toBe(7);
    expect(diffDias('2026-08-16', '2026-08-23')).toBe(-7);
  });
});

describe('enVentana', () => {
  it('incluye hoy y los N-1 días previos', () => {
    expect(enVentana(HOY, HOY, 7)).toBe(true);
    expect(enVentana(sumarDias(HOY, -6), HOY, 7)).toBe(true);
    expect(enVentana(sumarDias(HOY, -7), HOY, 7)).toBe(false);
  });
  it('excluye fechas futuras', () => {
    expect(enVentana(sumarDias(HOY, 1), HOY, 7)).toBe(false);
  });
  it('acepta timestamps ISO completos', () => {
    expect(enVentana(`${HOY}T14:30:00.000Z`, HOY, 7)).toBe(true);
  });
});

describe('contarDiasConSenal', () => {
  it('cuenta días distintos dentro de la ventana', () => {
    const cs = [
      checkin(HOY, { sueno: { calidad: 'mal' } }),
      checkin(sumarDias(HOY, -1), { sueno: { calidad: 'mal' } }),
      checkin(sumarDias(HOY, -8), { sueno: { calidad: 'mal' } }), // fuera de 7 días
      checkin(sumarDias(HOY, -2), { sueno: { calidad: 'bien' } }),
    ];
    expect(contarDiasConSenal(cs, HOY, 7, (c) => c.sueno?.calidad === 'mal')).toBe(2);
  });
});

describe('contarEpisodios', () => {
  it('cuenta solo el tipo pedido dentro de la ventana', () => {
    const eps = [
      episodio('caida', `${HOY}T09:00:00`),
      episodio('caida', sumarDias(HOY, -29)),
      episodio('caida', sumarDias(HOY, -31)), // fuera de 30 días
      episodio('atragantamiento', HOY),
    ];
    expect(contarEpisodios(eps, 'caida', HOY, 30)).toBe(2);
  });
});

describe('rachaAnimoBajo', () => {
  it('cuenta días consecutivos terminando hoy con ánimo 1-2', () => {
    const cs = [
      checkin(HOY, { animo: 2 }),
      checkin(sumarDias(HOY, -1), { animo: 1 }),
      checkin(sumarDias(HOY, -2), { animo: 2 }),
      checkin(sumarDias(HOY, -3), { animo: 4 }),
    ];
    expect(rachaAnimoBajo(cs, HOY)).toBe(3);
  });
  it('un día sin registro corta la racha', () => {
    const cs = [
      checkin(HOY, { animo: 1 }),
      // -1 sin registro
      checkin(sumarDias(HOY, -2), { animo: 1 }),
    ];
    expect(rachaAnimoBajo(cs, HOY)).toBe(1);
  });
  it('ánimo 3 o superior corta la racha', () => {
    const cs = [checkin(HOY, { animo: 3 })];
    expect(rachaAnimoBajo(cs, HOY)).toBe(0);
  });
});
