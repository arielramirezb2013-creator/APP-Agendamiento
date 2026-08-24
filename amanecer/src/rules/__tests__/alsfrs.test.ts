import { describe, expect, it } from 'vitest';
import { calcularSubescalas, ITEMS_ALSFRS, MAXIMOS_SUBESCALA } from '@/content/alsfrs';

describe('ALSFRS-R (§6.4)', () => {
  it('tiene 12 ítems con 5 opciones cada uno y dominios correctos', () => {
    expect(ITEMS_ALSFRS).toHaveLength(12);
    for (const item of ITEMS_ALSFRS) expect(item.opciones).toHaveLength(5);
    expect(ITEMS_ALSFRS.slice(0, 3).every((i) => i.dominio === 'bulbar')).toBe(true);
    expect(ITEMS_ALSFRS.slice(3, 9).every((i) => i.dominio === 'motora')).toBe(true);
    expect(ITEMS_ALSFRS.slice(9).every((i) => i.dominio === 'respiratoria')).toBe(true);
  });

  it('calcula subescalas y total como perfil (bulbar/12, motora/24, respiratoria/12)', () => {
    const todo4 = calcularSubescalas(Array(12).fill(4));
    expect(todo4).toEqual({ bulbar: 12, motora: 24, respiratoria: 12, total: 48 });
    expect(todo4.bulbar).toBe(MAXIMOS_SUBESCALA.bulbar);

    const mixto = calcularSubescalas([4, 3, 2, 4, 4, 3, 2, 1, 0, 4, 3, 2]);
    expect(mixto).toEqual({ bulbar: 9, motora: 14, respiratoria: 9, total: 32 });
  });

  it('ignora ítems sin responder (−1) sin romper el total', () => {
    const conPendientes = calcularSubescalas([4, -1, 2, 4, 4, 3, 2, 1, 0, 4, 3, 2]);
    expect(conPendientes.bulbar).toBe(6);
  });
});
