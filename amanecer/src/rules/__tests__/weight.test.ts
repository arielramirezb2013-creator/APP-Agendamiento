import { describe, expect, it } from 'vitest';
import { evaluarPeso } from '../weight';
import { sumarDias } from '../recurrence';
import { HOY, peso } from './fixtures';

describe('evaluarPeso (A6 §6.3/§7.3)', () => {
  it('sin datos → sin_datos', () => {
    expect(evaluarPeso([], HOY).nivel).toBe('sin_datos');
  });

  it('un solo peso → estable (no hay con qué comparar)', () => {
    expect(evaluarPeso([peso(HOY, 60)], HOY).nivel).toBe('estable');
  });

  it('estable si baja menos del umbral', () => {
    const pesos = [peso(sumarDias(HOY, -21), 60), peso(HOY, 59)];
    expect(evaluarPeso(pesos, HOY).nivel).toBe('estable');
  });

  it('ámbar si baja ≥2 kg en 4 semanas', () => {
    const pesos = [peso(sumarDias(HOY, -21), 60), peso(HOY, 58)];
    const r = evaluarPeso(pesos, HOY);
    expect(r.nivel).toBe('ambar');
    expect(r.motivo).toBe('kg_4_semanas');
    expect(r.deltaKg).toBe(-2);
  });

  it('ámbar si baja ≥5% en 8 semanas aunque no llegue a 2 kg en 4', () => {
    // 60 → 56.9 en 8 semanas = −5.2%; en las últimas 4 semanas solo −1 kg.
    const pesos = [
      peso(sumarDias(HOY, -7 * 7), 60),
      peso(sumarDias(HOY, -21), 57.9),
      peso(HOY, 56.9),
    ];
    const r = evaluarPeso(pesos, HOY);
    expect(r.nivel).toBe('ambar');
    expect(r.motivo).toBe('pct_8_semanas');
  });

  it('respeta umbrales editables por el cuidador', () => {
    const pesos = [peso(sumarDias(HOY, -21), 60), peso(HOY, 58.5)];
    expect(
      evaluarPeso(pesos, HOY, { pesoPorcentaje8Sem: 5, pesoKg4Sem: 1.5 }).nivel,
    ).toBe('ambar');
    expect(
      evaluarPeso(pesos, HOY, { pesoPorcentaje8Sem: 5, pesoKg4Sem: 3 }).nivel,
    ).toBe('estable');
  });

  it('pesos viejos fuera de 8 semanas no comparan (último dato muy viejo → sin_datos)', () => {
    const pesos = [peso(sumarDias(HOY, -100), 60), peso(sumarDias(HOY, -90), 55)];
    expect(evaluarPeso(pesos, HOY).nivel).toBe('sin_datos');
  });

  it('subir de peso nunca dispara', () => {
    const pesos = [peso(sumarDias(HOY, -21), 58), peso(HOY, 60)];
    expect(evaluarPeso(pesos, HOY).nivel).toBe('estable');
  });
});
