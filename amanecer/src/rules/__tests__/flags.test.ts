// Cobertura del 100% de las reglas del motor de banderas (§7.2 y §7.3):
// cada regla tiene al menos un caso positivo y uno negativo.

import { describe, expect, it } from 'vitest';
import {
  evaluarBanderas,
  filtrarYaAtendidas,
  reglasParaRecordar,
  seleccionarParaSesion,
  type ContextoEvaluacion,
} from '../flags';
import { sumarDias } from '../recurrence';
import { checkin, comida, ctxBase, episodio, HOY, peso } from './fixtures';
import type { EventoBandera } from '@/types/models';

function ids(ctx: ContextoEvaluacion): string[] {
  return evaluarBanderas(ctx).map((d) => d.regla.id);
}

// ————— ROJAS —————

describe('R1 — mucha falta de aire ahora mismo', () => {
  it('dispara con respiración "mucho" + confirmación "ahora"', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, { respiracion: 'mucho' as const }),
      respiracionAhora: true,
    };
    expect(ids(ctx)).toContain('R1');
  });
  it('NO dispara si ya pasó (confirmación negativa)', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, { respiracion: 'mucho' as const }),
      respiracionAhora: false,
    };
    expect(ids(ctx)).not.toContain('R1');
  });
});

describe('R2 — episodio de disnea "ahora"', () => {
  it('dispara con disnea ahora', () => {
    const ctx = {
      ...ctxBase(),
      episodioNuevo: episodio('disnea', `${HOY}T10:00:00`),
      episodioEsAhora: true,
    };
    expect(ids(ctx)).toContain('R2');
  });
  it('NO dispara si fue más temprano', () => {
    const ctx = {
      ...ctxBase(),
      episodioNuevo: episodio('disnea', `${HOY}T10:00:00`),
      episodioEsAhora: false,
    };
    expect(ids(ctx)).not.toContain('R2');
  });
});

describe('R3 — atragantamiento que sigue', () => {
  it('dispara si sigue atorada', () => {
    const ctx = {
      ...ctxBase(),
      episodioNuevo: episodio('atragantamiento', `${HOY}T12:00:00`),
      atragantamientoSigue: true,
    };
    expect(ids(ctx)).toContain('R3');
  });
  it('NO dispara si ya pasó', () => {
    const ctx = {
      ...ctxBase(),
      episodioNuevo: episodio('atragantamiento', `${HOY}T12:00:00`),
      atragantamientoSigue: false,
    };
    expect(ids(ctx)).not.toContain('R3');
  });
});

describe('R4 — botón SOS', () => {
  it('dispara con SOS presionado', () => {
    expect(ids({ ...ctxBase(), sosPresionado: true })).toContain('R4');
  });
  it('NO dispara sin SOS', () => {
    expect(ids(ctxBase())).not.toContain('R4');
  });
});

describe('R5 — checklist del cuidador', () => {
  it.each(['cianosis', 'confusion', 'no_habla_no_respira'])(
    'dispara con %s',
    (senal) => {
      expect(ids({ ...ctxBase(), checklistCuidador: [senal] })).toContain('R5');
    },
  );
  it('NO dispara con tos débil sola (esa es ámbar A4)', () => {
    const res = ids({ ...ctxBase(), checklistCuidador: ['tos_debil'] });
    expect(res).not.toContain('R5');
    expect(res).toContain('A4');
  });
});

// ————— ÁMBAR —————

describe('A1 — cefalea matutina ≥2 días en 7', () => {
  const conCefalea = (fecha: string) =>
    checkin(fecha, {
      sueno: { calidad: 'regular' as const, senales: ['cefalea_matutina' as const] },
    });
  it('dispara con 2 días', () => {
    const ctx = {
      ...ctxBase(),
      checkins: [conCefalea(HOY), conCefalea(sumarDias(HOY, -3))],
    };
    expect(ids(ctx)).toContain('A1');
  });
  it('NO dispara con 1 día', () => {
    expect(ids({ ...ctxBase(), checkins: [conCefalea(HOY)] })).not.toContain('A1');
  });
});

describe('A2 — ortopnea reportada hoy', () => {
  it('dispara con ortopnea en el check-in de hoy', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, {
        sueno: { calidad: 'mal' as const, senales: ['ortopnea' as const] },
      }),
    };
    expect(ids(ctx)).toContain('A2');
  });
  it('NO dispara con otras señales de sueño', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, {
        sueno: { calidad: 'mal' as const, senales: ['pesadillas' as const] },
      }),
    };
    expect(ids(ctx)).not.toContain('A2');
  });
});

describe('A3 — somnolencia diurna reportada (checklist del cuidador)', () => {
  it('dispara ámbar con somnolencia diurna sin señales de sueño', () => {
    const res = ids({ ...ctxBase(), checklistCuidador: ['somnolencia_diurna'] });
    expect(res).toContain('A3');
    expect(res).not.toContain('R5'); // la marcada con confusión es otra ruta
  });
});

describe('A9 — tropiezos reportados (checklist del cuidador)', () => {
  it('dispara ámbar con tropiezos sin caídas registradas', () => {
    expect(ids({ ...ctxBase(), checklistCuidador: ['tropiezos'] })).toContain('A9');
  });
});

describe('A3 — sueño malo ≥3 días en 7', () => {
  const mal = (f: string) => checkin(f, { sueno: { calidad: 'mal' as const } });
  it('dispara con 3 días', () => {
    const ctx = {
      ...ctxBase(),
      checkins: [mal(HOY), mal(sumarDias(HOY, -2)), mal(sumarDias(HOY, -5))],
    };
    expect(ids(ctx)).toContain('A3');
  });
  it('NO dispara con 2 días', () => {
    const ctx = { ...ctxBase(), checkins: [mal(HOY), mal(sumarDias(HOY, -2))] };
    expect(ids(ctx)).not.toContain('A3');
  });
});

describe('A4 — tos débil', () => {
  it('dispara desde checklist del cuidador', () => {
    expect(ids({ ...ctxBase(), checklistCuidador: ['tos_debil'] })).toContain('A4');
  });
  it('dispara desde episodio de tos débil en la semana', () => {
    const ctx = { ...ctxBase(), episodios: [episodio('tos_debil', HOY)] };
    expect(ids(ctx)).toContain('A4');
  });
  it('NO dispara sin señal', () => {
    expect(ids(ctxBase())).not.toContain('A4');
  });
});

describe('A5 — deglución', () => {
  it('dispara con 2.º atragantamiento en 7 días', () => {
    const ctx = {
      ...ctxBase(),
      episodios: [
        episodio('atragantamiento', HOY),
        episodio('atragantamiento', sumarDias(HOY, -4)),
      ],
    };
    expect(ids(ctx)).toContain('A5');
  });
  it('NO dispara con 1 atragantamiento', () => {
    const ctx = { ...ctxBase(), episodios: [episodio('atragantamiento', HOY)] };
    expect(ids(ctx)).not.toContain('A5');
  });
  it('dispara con ≥50% de comidas con esfuerzo en 3 días', () => {
    const ctx = {
      ...ctxBase(),
      comidas: [
        comida(HOY, 'esfuerzo'),
        comida(HOY, 'bien'),
        comida(sumarDias(HOY, -1), 'esfuerzo'),
        comida(sumarDias(HOY, -2), 'atoro'),
      ],
    };
    expect(ids(ctx)).toContain('A5');
  });
  it('NO dispara con una sola comida difícil registrada', () => {
    expect(ids({ ...ctxBase(), comidas: [comida(HOY, 'esfuerzo')] })).not.toContain(
      'A5',
    );
  });
  it('NO dispara con minoría de comidas difíciles', () => {
    const ctx = {
      ...ctxBase(),
      comidas: [
        comida(HOY, 'esfuerzo'),
        comida(HOY, 'bien'),
        comida(sumarDias(HOY, -1), 'bien'),
        comida(sumarDias(HOY, -2), 'bien'),
      ],
    };
    expect(ids(ctx)).not.toContain('A5');
  });
});

describe('A6 — pérdida de peso', () => {
  it('dispara con −2 kg en 4 semanas', () => {
    const ctx = {
      ...ctxBase(),
      pesos: [peso(sumarDias(HOY, -21), 60), peso(HOY, 57.5)],
    };
    expect(ids(ctx)).toContain('A6');
  });
  it('NO dispara estable', () => {
    const ctx = {
      ...ctxBase(),
      pesos: [peso(sumarDias(HOY, -21), 60), peso(HOY, 59.5)],
    };
    expect(ids(ctx)).not.toContain('A6');
  });
  it('respeta umbral editable', () => {
    const ctx = {
      ...ctxBase(),
      pesos: [peso(sumarDias(HOY, -21), 60), peso(HOY, 58.5)],
      umbrales: { pesoPorcentaje8Sem: 5, pesoKg4Sem: 1 },
    };
    expect(ids(ctx)).toContain('A6');
  });
});

describe('A7 — saliva espesa ≥3 días en 7', () => {
  const espesa = (f: string) => checkin(f, { saliva: 'espesa' as const });
  it('dispara con 3 días de saliva espesa', () => {
    const ctx = {
      ...ctxBase(),
      checkins: [espesa(HOY), espesa(sumarDias(HOY, -1)), espesa(sumarDias(HOY, -6))],
    };
    expect(ids(ctx)).toContain('A7');
  });
  it('la saliva fina NO cuenta para esta ruta (§2.2-4)', () => {
    const fina = (f: string) => checkin(f, { saliva: 'fina_abundante' as const });
    const ctx = {
      ...ctxBase(),
      checkins: [fina(HOY), fina(sumarDias(HOY, -1)), fina(sumarDias(HOY, -2))],
    };
    expect(ids(ctx)).not.toContain('A7');
  });
});

describe('A8 — dolor', () => {
  const dolorFuerte = (f: string) => checkin(f, { dolor: { nivel: 2 as const } });
  it('dispara con dolor fuerte ≥3 días en 7', () => {
    const ctx = {
      ...ctxBase(),
      checkins: [
        dolorFuerte(HOY),
        dolorFuerte(sumarDias(HOY, -1)),
        dolorFuerte(sumarDias(HOY, -3)),
      ],
    };
    expect(ids(ctx)).toContain('A8');
  });
  it('dispara con dolor nuevo tras ≥3 registros sin dolor', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, { dolor: { nivel: 1 as const } }),
      checkins: [
        checkin(sumarDias(HOY, -1), { dolor: { nivel: 0 as const } }),
        checkin(sumarDias(HOY, -2), { dolor: { nivel: 0 as const } }),
        checkin(sumarDias(HOY, -3), { dolor: { nivel: 0 as const } }),
      ],
    };
    expect(ids(ctx)).toContain('A8');
  });
  it('NO dispara con dolor leve un solo día sin historial', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, { dolor: { nivel: 1 as const } }),
    };
    expect(ids(ctx)).not.toContain('A8');
  });
  it('mapea contacto según localización: piernas → moverme, cabeza → medicinas', () => {
    const base = {
      ...ctxBase(),
      checkins: [
        dolorFuerte(sumarDias(HOY, -1)),
        dolorFuerte(sumarDias(HOY, -2)),
      ],
    };
    const conPiernas = {
      ...base,
      checkinHoy: checkin(HOY, { dolor: { nivel: 2 as const, zonas: ['Piernas'] } }),
    };
    const conCabeza = {
      ...base,
      checkinHoy: checkin(HOY, { dolor: { nivel: 2 as const, zonas: ['Cabeza'] } }),
    };
    const dPiernas = evaluarBanderas(conPiernas).find((d) => d.regla.id === 'A8');
    const dCabeza = evaluarBanderas(conCabeza).find((d) => d.regla.id === 'A8');
    expect(dPiernas?.contactoTema).toBe('moverme');
    expect(dCabeza?.contactoTema).toBe('medicinas');
  });
});

describe('A9 — 2.ª caída en 30 días', () => {
  it('dispara con 2 caídas en 30 días', () => {
    const ctx = {
      ...ctxBase(),
      episodios: [episodio('caida', HOY), episodio('caida', sumarDias(HOY, -20))],
    };
    expect(ids(ctx)).toContain('A9');
  });
  it('NO dispara si la caída anterior fue hace más de 30 días', () => {
    const ctx = {
      ...ctxBase(),
      episodios: [episodio('caida', HOY), episodio('caida', sumarDias(HOY, -35))],
    };
    expect(ids(ctx)).not.toContain('A9');
  });
});

describe('A10 — ánimo bajo sostenido o crisis', () => {
  it('dispara con 3 días seguidos de ánimo en las 2 caras más bajas', () => {
    const ctx = {
      ...ctxBase(),
      checkins: [
        checkin(HOY, { animo: 1 as const }),
        checkin(sumarDias(HOY, -1), { animo: 2 as const }),
        checkin(sumarDias(HOY, -2), { animo: 2 as const }),
      ],
    };
    expect(ids(ctx)).toContain('A10');
  });
  it('dispara con episodio de crisis emocional', () => {
    const ctx = {
      ...ctxBase(),
      episodioNuevo: episodio('crisis_emocional', HOY),
    };
    expect(ids(ctx)).toContain('A10');
  });
  it('NO dispara con racha interrumpida', () => {
    const ctx = {
      ...ctxBase(),
      checkins: [
        checkin(HOY, { animo: 1 as const }),
        checkin(sumarDias(HOY, -1), { animo: 4 as const }),
        checkin(sumarDias(HOY, -2), { animo: 1 as const }),
      ],
    };
    expect(ids(ctx)).not.toContain('A10');
  });
});

describe('A13 — habla (regla de producto, ruta fonoaudiología)', () => {
  it('dispara si hoy "casi no me entienden"', () => {
    const ctx = { ...ctxBase(), checkinHoy: checkin(HOY, { habla: 'casi_no' as const }) };
    const d = evaluarBanderas(ctx).find((x) => x.regla.id === 'A13');
    expect(d?.contactoTema).toBe('tragar');
  });
  it('dispara con habla "con esfuerzo" ≥3 días en 7', () => {
    const ctx = {
      ...ctxBase(),
      checkins: [
        checkin(HOY, { habla: 'esfuerzo' as const }),
        checkin(sumarDias(HOY, -2), { habla: 'esfuerzo' as const }),
        checkin(sumarDias(HOY, -4), { habla: 'esfuerzo' as const }),
      ],
    };
    expect(ids(ctx)).toContain('A13');
  });
  it('NO dispara con habla bien o esfuerzo aislado', () => {
    const ctx = { ...ctxBase(), checkinHoy: checkin(HOY, { habla: 'esfuerzo' as const }) };
    expect(ids(ctx)).not.toContain('A13');
  });
});

describe('A14 — movilidad (regla de producto, ruta fisioterapia)', () => {
  it('dispara si hoy "casi no me pude mover"', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, { movilidad: 'casi_no' as const }),
    };
    const d = evaluarBanderas(ctx).find((x) => x.regla.id === 'A14');
    expect(d?.contactoTema).toBe('moverme');
  });
  it('dispara con "necesité ayuda" ≥3 días en 7', () => {
    const ctx = {
      ...ctxBase(),
      checkins: [
        checkin(HOY, { movilidad: 'con_ayuda' as const }),
        checkin(sumarDias(HOY, -1), { movilidad: 'con_ayuda' as const }),
        checkin(sumarDias(HOY, -3), { movilidad: 'con_ayuda' as const }),
      ],
    };
    expect(ids(ctx)).toContain('A14');
  });
  it('NO dispara con ayuda un solo día', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, { movilidad: 'con_ayuda' as const }),
    };
    expect(ids(ctx)).not.toContain('A14');
  });
});

describe('A11 — afecto pseudobulbar recurrente', () => {
  it('dispara con 2 episodios en 14 días', () => {
    const ctx = {
      ...ctxBase(),
      episodios: [
        episodio('pseudobulbar', HOY),
        episodio('pseudobulbar', sumarDias(HOY, -10)),
      ],
    };
    expect(ids(ctx)).toContain('A11');
  });
  it('NO dispara con 1 episodio', () => {
    const ctx = { ...ctxBase(), episodios: [episodio('pseudobulbar', HOY)] };
    expect(ids(ctx)).not.toContain('A11');
  });
});

describe('A12 — infección + señal respiratoria', () => {
  it('dispara con fiebre + respiración "algo" en la semana', () => {
    const ctx = {
      ...ctxBase(),
      episodios: [episodio('infeccion', HOY)],
      checkins: [checkin(HOY, { respiracion: 'algo' as const })],
    };
    expect(ids(ctx)).toContain('A12');
  });
  it('NO dispara con fiebre sin señal respiratoria', () => {
    const ctx = {
      ...ctxBase(),
      episodios: [episodio('infeccion', HOY)],
      checkins: [checkin(HOY, { respiracion: 'bien' as const })],
    };
    expect(ids(ctx)).not.toContain('A12');
  });
});

// ————— Selección y silenciamiento —————

describe('seleccionarParaSesion — máx. 1 tarjeta ámbar (§7.4)', () => {
  it('con varias ámbar solo muestra la de mayor prioridad; el resto silencioso', () => {
    const ctx = {
      ...ctxBase(),
      // A2 (ortopnea, prioridad 100) + A7 (saliva espesa) + A9 (caídas)
      checkinHoy: checkin(HOY, {
        sueno: { calidad: 'mal' as const, senales: ['ortopnea' as const] },
        saliva: 'espesa' as const,
      }),
      checkins: [
        checkin(sumarDias(HOY, -1), { saliva: 'espesa' as const }),
        checkin(sumarDias(HOY, -2), { saliva: 'espesa' as const }),
      ],
      episodios: [episodio('caida', HOY), episodio('caida', sumarDias(HOY, -5))],
    };
    const sel = seleccionarParaSesion(evaluarBanderas(ctx));
    expect(sel.ambar?.regla.id).toBe('A2');
    expect(sel.silenciosas.map((s) => s.regla.id)).toEqual(
      expect.arrayContaining(['A7', 'A9']),
    );
    expect(sel.rojas).toHaveLength(0);
  });

  it('las rojas van aparte y siempre completas', () => {
    const ctx = {
      ...ctxBase(),
      sosPresionado: true,
      checkinHoy: checkin(HOY, {
        sueno: { calidad: 'mal' as const, senales: ['ortopnea' as const] },
      }),
    };
    const sel = seleccionarParaSesion(evaluarBanderas(ctx));
    expect(sel.rojas.map((r) => r.regla.id)).toContain('R4');
    expect(sel.ambar?.regla.id).toBe('A2');
  });
});

describe('filtrarYaAtendidas (§7.1 — recuerda máx. 1 vez)', () => {
  const disparada = () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, {
        sueno: { calidad: 'mal' as const, senales: ['ortopnea' as const] },
      }),
    };
    return evaluarBanderas(ctx).filter((d) => d.regla.id === 'A2');
  };
  const evento = (dec: EventoBandera['decision'], fecha: string): EventoBandera => ({
    id: 'e1',
    reglaId: 'A2',
    nivel: 'ambar',
    fechaHora: `${fecha}T08:00:00.000Z`,
    decision: dec,
  });

  it('"llamó" silencia la regla esa semana (no se insiste tras llamar)', () => {
    expect(
      filtrarYaAtendidas(disparada(), [evento('llamo', sumarDias(HOY, -2))], HOY),
    ).toHaveLength(0);
  });
  it('"ya lo hablamos" silencia la regla esa semana', () => {
    expect(
      filtrarYaAtendidas(disparada(), [evento('ya_hablado', sumarDias(HOY, -2))], HOY),
    ).toHaveLength(0);
  });
  it('descartada por el cuidador silencia la regla', () => {
    expect(
      filtrarYaAtendidas(
        disparada(),
        [evento('descartada_por_cuidador', sumarDias(HOY, -1))],
        HOY,
      ),
    ).toHaveLength(0);
  });
  it('"recordármelo mañana" permite exactamente un recordatorio más', () => {
    expect(
      filtrarYaAtendidas(disparada(), [evento('recordar', sumarDias(HOY, -1))], HOY),
    ).toHaveLength(1);
    expect(
      filtrarYaAtendidas(
        disparada(),
        [
          evento('recordar', sumarDias(HOY, -2)),
          { ...evento('recordar', sumarDias(HOY, -1)), id: 'e2' },
        ],
        HOY,
      ),
    ).toHaveLength(0);
  });
  it('no repite la misma regla dos veces el mismo día', () => {
    expect(
      filtrarYaAtendidas(disparada(), [evento(undefined, HOY)], HOY),
    ).toHaveLength(0);
  });
  it('una roja jamás se silencia', () => {
    const ctx = { ...ctxBase(), sosPresionado: true };
    const rojas = evaluarBanderas(ctx);
    const eventos: EventoBandera[] = [
      { id: 'r', reglaId: 'R4', nivel: 'roja', fechaHora: `${HOY}T07:00:00.000Z` },
    ];
    expect(filtrarYaAtendidas(rojas, eventos, HOY).length).toBeGreaterThan(0);
  });
});

describe('reglasParaRecordar — "recordármelo mañana" en reglas puntuales (§7.1)', () => {
  const eventoRecordar = (reglaId: string, fecha: string): EventoBandera => ({
    id: `e-${reglaId}-${fecha}`,
    reglaId,
    nivel: 'ambar',
    fechaHora: `${fecha}T08:00:00`,
    decision: 'recordar',
  });

  it('re-ofrece hoy una regla puntual recordada ayer (A2)', () => {
    const ctx = ctxBase();
    const recordadas = reglasParaRecordar(
      [eventoRecordar('A2', sumarDias(HOY, -1))],
      HOY,
      ctx,
    );
    expect(recordadas.map((r) => r.regla.id)).toEqual(['A2']);
    expect(recordadas[0].contactoTema).toBe('respiracion');
    // Y el filtro fino aún la deja pasar (solo 1 "recordar" en la semana).
    expect(
      filtrarYaAtendidas(recordadas, [eventoRecordar('A2', sumarDias(HOY, -1))], HOY),
    ).toHaveLength(1);
  });

  it('NO re-ofrece recordatorios de hace 2 días ni de hoy', () => {
    const ctx = ctxBase();
    expect(
      reglasParaRecordar([eventoRecordar('A2', sumarDias(HOY, -2))], HOY, ctx),
    ).toHaveLength(0);
    expect(reglasParaRecordar([eventoRecordar('A2', HOY)], HOY, ctx)).toHaveLength(0);
  });

  it('tras el segundo "recordar", filtrarYaAtendidas corta la cadena (máx. 1 recordatorio)', () => {
    const ctx = ctxBase();
    const eventos = [
      eventoRecordar('A2', sumarDias(HOY, -2)),
      eventoRecordar('A2', sumarDias(HOY, -1)),
    ];
    const recordadas = reglasParaRecordar(eventos, HOY, ctx);
    expect(filtrarYaAtendidas(recordadas, eventos, HOY)).toHaveLength(0);
  });
});

describe('A8 — zonas con memoria para el mapeo de contacto', () => {
  it('sin zonas hoy, usa las del registro más reciente de la semana', () => {
    const ctx = {
      ...ctxBase(),
      checkinHoy: checkin(HOY, { dolor: { nivel: 2 as const } }),
      checkins: [
        checkin(sumarDias(HOY, -1), { dolor: { nivel: 2 as const, zonas: ['Piernas'] } }),
        checkin(sumarDias(HOY, -2), { dolor: { nivel: 2 as const, zonas: ['Cabeza'] } }),
      ],
    };
    const d = evaluarBanderas(ctx).find((x) => x.regla.id === 'A8');
    expect(d?.contactoTema).toBe('moverme');
  });
});
