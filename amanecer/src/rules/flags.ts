// Motor de seguridad clínica (§7) — funciones puras, sin efectos.
// Cada regla conserva su trazabilidad: id, fuente (guía de origen), condición,
// nivel, contactoTema y copy. La app ORIENTA, nunca diagnostica (§3.3):
// las salidas son exactamente verde (nada), ámbar (tarjeta amable al cierre)
// o roja (pantalla completa con llamada a un toque).

import type {
  CheckinDiario,
  Comida,
  Episodio,
  EventoBandera,
  Peso,
  Tema,
} from '@/types/models';
import {
  contarDiasConSenal,
  contarEpisodios,
  enVentana,
  rachaAnimoBajo,
} from './recurrence';
import { evaluarPeso, UMBRALES_PESO_DEFECTO, type UmbralesPeso } from './weight';

export interface ContextoEvaluacion {
  hoy: string; // yyyy-mm-dd
  /** Check-in de hoy (posiblemente recién completado, aún sin persistir). */
  checkinHoy?: CheckinDiario;
  /** Historial (puede incluir el de hoy; se deduplica por fecha). */
  checkins: CheckinDiario[];
  episodios: Episodio[];
  comidas: Comida[];
  pesos: Peso[];
  umbrales?: UmbralesPeso;
  // ——— señales inmediatas que la UI pasa al motor ———
  /** R1: respondió "me falta mucho el aire" y confirmó "me pasa ahora". */
  respiracionAhora?: boolean;
  /** Episodio recién registrado en este flujo (aún puede no estar persistido). */
  episodioNuevo?: Episodio;
  /** R2: el episodio nuevo ocurre "ahora". */
  episodioEsAhora?: boolean;
  /** R3: atragantamiento que no cede ("sigue atorada"). */
  atragantamientoSigue?: boolean;
  /** R4: botón SOS del directorio. */
  sosPresionado?: boolean;
  /** R5/A4: checklist de señales del modo cuidador. */
  checklistCuidador?: string[];
}

export interface ReglaBandera {
  id: string;
  fuente: string; // guía de origen — trazabilidad §2
  nivel: 'ambar' | 'roja';
  contactoTema: Tema | ((ctx: ContextoEvaluacion) => Tema);
  /** Mayor = más prioritaria. Solo se muestra 1 tarjeta ámbar por sesión (§7.4). */
  prioridad: number;
  condicion: (ctx: ContextoEvaluacion) => boolean;
}

// ——— utilidades internas ———

function checkinsUnicos(ctx: ContextoEvaluacion): CheckinDiario[] {
  const porFecha = new Map<string, CheckinDiario>();
  for (const c of ctx.checkins) porFecha.set(c.fecha, c);
  if (ctx.checkinHoy) porFecha.set(ctx.checkinHoy.fecha, ctx.checkinHoy);
  return [...porFecha.values()];
}

function episodiosTodos(ctx: ContextoEvaluacion): Episodio[] {
  const lista = [...ctx.episodios];
  if (ctx.episodioNuevo && !lista.some((e) => e.id === ctx.episodioNuevo!.id)) {
    lista.push(ctx.episodioNuevo);
  }
  return lista;
}

function hoyCheckin(ctx: ContextoEvaluacion): CheckinDiario | undefined {
  if (ctx.checkinHoy?.fecha === ctx.hoy) return ctx.checkinHoy;
  return ctx.checkins.find((c) => c.fecha === ctx.hoy);
}

/** ¿Hubo alguna señal respiratoria en los últimos `dias` días? (para A12) */
function senalRespiratoriaEnVentana(ctx: ContextoEvaluacion, dias: number): boolean {
  const cs = checkinsUnicos(ctx);
  const conSenal = contarDiasConSenal(cs, ctx.hoy, dias, (c) => {
    if (c.respiracion === 'algo' || c.respiracion === 'mucho') return true;
    const s = c.sueno?.senales ?? [];
    return s.includes('ortopnea') || s.includes('cefalea_matutina');
  });
  if (conSenal > 0) return true;
  const eps = episodiosTodos(ctx);
  return eps.some(
    (e) =>
      (e.tipo === 'disnea' || e.tipo === 'tos_debil' || e.tipo === 'laringoespasmo') &&
      enVentana(e.cuando, ctx.hoy, dias),
  );
}

// ——— REGLAS ROJAS (§7.2 — informe §20 / NICE NG42 / MND Assoc.) ———
// La pantalla roja NUNCA pide más datos: primero la llamada.

export const reglasRojas: ReglaBandera[] = [
  {
    id: 'R1',
    fuente: 'Informe §20 / NICE NG42',
    nivel: 'roja',
    contactoTema: 'emergencia',
    prioridad: 1000,
    condicion: (ctx) =>
      hoyCheckin(ctx)?.respiracion === 'mucho' && ctx.respiracionAhora === true,
  },
  {
    id: 'R2',
    fuente: 'Informe §20',
    nivel: 'roja',
    contactoTema: 'emergencia',
    prioridad: 1000,
    condicion: (ctx) =>
      ctx.episodioNuevo?.tipo === 'disnea' && ctx.episodioEsAhora === true,
  },
  {
    id: 'R3',
    fuente: 'Informe §20 / MND Assoc.',
    nivel: 'roja',
    contactoTema: 'emergencia',
    prioridad: 1000,
    condicion: (ctx) =>
      ctx.episodioNuevo?.tipo === 'atragantamiento' &&
      ctx.atragantamientoSigue === true,
  },
  {
    id: 'R4',
    fuente: 'Diseño §6.5 (botón SOS siempre disponible)',
    nivel: 'roja',
    contactoTema: 'emergencia',
    prioridad: 1000,
    condicion: (ctx) => ctx.sosPresionado === true,
  },
  {
    id: 'R5',
    fuente: 'Informe §20 (checklist del cuidador)',
    nivel: 'roja',
    contactoTema: 'emergencia',
    prioridad: 1000,
    condicion: (ctx) => {
      const lista = ctx.checklistCuidador ?? [];
      return (
        lista.includes('cianosis') ||
        lista.includes('confusion') ||
        lista.includes('no_habla_no_respira')
      );
    },
  },
];

// ——— REGLAS ÁMBAR (§7.3 — informe §17.2 / NICE Tabla 1 / EAN 2024) ———

export const reglasAmbar: ReglaBandera[] = [
  {
    id: 'A2', // Ortopnea ≥1 vez — señal directa de compromiso respiratorio nocturno
    fuente: 'NICE NG42 Tabla 1',
    nivel: 'ambar',
    contactoTema: 'respiracion',
    prioridad: 100,
    condicion: (ctx) =>
      (hoyCheckin(ctx)?.sueno?.senales ?? []).includes('ortopnea'),
  },
  {
    id: 'A1', // Cefalea matutina ≥2 días en 7
    fuente: 'NICE NG42 Tabla 1',
    nivel: 'ambar',
    contactoTema: 'respiracion',
    prioridad: 95,
    condicion: (ctx) =>
      contarDiasConSenal(checkinsUnicos(ctx), ctx.hoy, 7, (c) =>
        (c.sueno?.senales ?? []).includes('cefalea_matutina'),
      ) >= 2,
  },
  {
    id: 'A12', // Fiebre/gripa + cualquier señal respiratoria (misma semana)
    fuente: 'MND Assoc. (antibióticos precoces en infecciones)',
    nivel: 'ambar',
    contactoTema: 'respiracion',
    prioridad: 90,
    condicion: (ctx) =>
      contarEpisodios(episodiosTodos(ctx), 'infeccion', ctx.hoy, 7) >= 1 &&
      senalRespiratoriaEnVentana(ctx, 7),
  },
  {
    id: 'A3', // Sueño "mal" ≥3 días en 7, o somnolencia diurna reportada
    // (la somnolencia MARCADA con confusión es roja R5; esta es la ruta suave).
    fuente: 'NICE NG42 Tabla 1',
    nivel: 'ambar',
    contactoTema: 'respiracion',
    prioridad: 85,
    condicion: (ctx) =>
      contarDiasConSenal(
        checkinsUnicos(ctx),
        ctx.hoy,
        7,
        (c) => c.sueno?.calidad === 'mal',
      ) >= 3 || (ctx.checklistCuidador ?? []).includes('somnolencia_diurna'),
  },
  {
    id: 'A4', // Tos débil que no saca la flema (checklist cuidador u episodio)
    fuente: 'MND Assoc. (PCF / fisioterapia respiratoria)',
    nivel: 'ambar',
    contactoTema: 'respiracion',
    prioridad: 80,
    condicion: (ctx) =>
      (ctx.checklistCuidador ?? []).includes('tos_debil') ||
      contarEpisodios(episodiosTodos(ctx), 'tos_debil', ctx.hoy, 7) >= 1,
  },
  {
    id: 'A5', // 2.º atragantamiento en 7 días, o "con esfuerzo" en ≥50% de comidas de 3 días
    fuente: 'EAN 2024',
    nivel: 'ambar',
    contactoTema: 'tragar',
    prioridad: 75,
    condicion: (ctx) => {
      if (contarEpisodios(episodiosTodos(ctx), 'atragantamiento', ctx.hoy, 7) >= 2) {
        return true;
      }
      // ≥50% de las comidas de los últimos 3 días con esfuerzo o atoro
      // (se exigen ≥2 comidas registradas para no disparar con una sola).
      const recientes = ctx.comidas.filter((m) => enVentana(m.fecha, ctx.hoy, 3));
      if (recientes.length < 2) return false;
      const dificiles = recientes.filter(
        (m) => m.tragando === 'esfuerzo' || m.tragando === 'atoro',
      ).length;
      return dificiles * 2 >= recientes.length;
    },
  },
  {
    id: 'A7', // Saliva espesa ≥3 días en 7 (ruta distinta a saliva fina, §2.2-4)
    fuente: 'MND Assoc.',
    nivel: 'ambar',
    contactoTema: 'tragar',
    prioridad: 70,
    condicion: (ctx) =>
      contarDiasConSenal(
        checkinsUnicos(ctx),
        ctx.hoy,
        7,
        (c) => c.saliva === 'espesa',
      ) >= 3,
  },
  {
    id: 'A6', // Pérdida de peso: −5% en 8 semanas o −2 kg en 4 (umbral editable)
    fuente: 'EAN / MND Assoc.',
    nivel: 'ambar',
    contactoTema: 'nutricion',
    prioridad: 65,
    condicion: (ctx) =>
      evaluarPeso(ctx.pesos, ctx.hoy, ctx.umbrales ?? UMBRALES_PESO_DEFECTO)
        .nivel === 'ambar',
  },
  {
    id: 'A8', // Dolor "Bastante/Mucho" ≥3 días en 7, o dolor nuevo de aparición
    fuente: 'EAN 2024 ("evaluar activamente el dolor")',
    nivel: 'ambar',
    // Según localización: zonas musculoesqueléticas → fisioterapia (moverme);
    // cabeza u otro → médico tratante (medicinas). Si hoy no hay zonas
    // marcadas, se usan las del registro más reciente de la semana con dolor.
    contactoTema: (ctx) => {
      const recientes = checkinsUnicos(ctx)
        .filter((c) => enVentana(c.fecha, ctx.hoy, 7) && (c.dolor?.zonas?.length ?? 0) > 0)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
      const zonas = hoyCheckin(ctx)?.dolor?.zonas?.length
        ? hoyCheckin(ctx)!.dolor!.zonas!
        : (recientes[0]?.dolor?.zonas ?? []);
      const fisio = ['Cuello', 'Hombros', 'Brazos', 'Espalda', 'Piernas'];
      return zonas.some((z) => fisio.includes(z)) ? 'moverme' : 'medicinas';
    },
    prioridad: 60,
    condicion: (ctx) => {
      const cs = checkinsUnicos(ctx);
      const diasFuertes = contarDiasConSenal(
        cs,
        ctx.hoy,
        7,
        (c) => (c.dolor?.nivel ?? 0) >= 2,
      );
      if (diasFuertes >= 3) return true;
      // Dolor nuevo: hoy hay dolor y en los 7 días previos (con ≥3 registros)
      // no lo hubo.
      const hoyC = hoyCheckin(ctx);
      if ((hoyC?.dolor?.nivel ?? 0) >= 1) {
        const previos = cs.filter(
          (c) => c.fecha !== ctx.hoy && enVentana(c.fecha, ctx.hoy, 8),
        );
        if (
          previos.length >= 3 &&
          previos.every((c) => (c.dolor?.nivel ?? 0) === 0)
        ) {
          return true;
        }
      }
      return false;
    },
  },
  {
    id: 'A9', // 2.ª caída en 30 días, o tropiezos reportados
    fuente: 'NICE NG42',
    nivel: 'ambar',
    contactoTema: 'moverme',
    prioridad: 55,
    condicion: (ctx) =>
      contarEpisodios(episodiosTodos(ctx), 'caida', ctx.hoy, 30) >= 2 ||
      (ctx.checklistCuidador ?? []).includes('tropiezos'),
  },
  {
    id: 'A11', // Risa/llanto sin control recurrente (≥2 episodios / 14 días)
    fuente: 'MND Assoc. (afecto pseudobulbar)',
    nivel: 'ambar',
    contactoTema: 'medicinas',
    prioridad: 50,
    condicion: (ctx) =>
      contarEpisodios(episodiosTodos(ctx), 'pseudobulbar', ctx.hoy, 14) >= 2,
  },
  {
    id: 'A10', // Ánimo en las 2 caras más bajas ≥3 días seguidos, o crisis emocional
    fuente: 'EAN 2024',
    nivel: 'ambar',
    contactoTema: 'animo',
    prioridad: 45,
    condicion: (ctx) =>
      rachaAnimoBajo(checkinsUnicos(ctx), ctx.hoy) >= 3 ||
      ctx.episodioNuevo?.tipo === 'crisis_emocional',
  },
];

export const todasLasReglas: ReglaBandera[] = [...reglasRojas, ...reglasAmbar];

export interface BanderaDisparada {
  regla: ReglaBandera;
  contactoTema: Tema;
}

/** Evalúa TODAS las reglas sobre el contexto. Rojas primero, luego ámbar por prioridad. */
export function evaluarBanderas(ctx: ContextoEvaluacion): BanderaDisparada[] {
  const disparadas: BanderaDisparada[] = [];
  for (const regla of todasLasReglas) {
    if (regla.condicion(ctx)) {
      const tema =
        typeof regla.contactoTema === 'function'
          ? regla.contactoTema(ctx)
          : regla.contactoTema;
      disparadas.push({ regla, contactoTema: tema });
    }
  }
  return disparadas.sort((a, b) => b.regla.prioridad - a.regla.prioridad);
}

/**
 * Filtra reglas ámbar ya atendidas (§7.1: "recuerda máx. 1 vez"):
 * - hoy ya se mostró la misma regla → no repetir en la sesión;
 * - decisión "llamó", "ya lo hablamos" o descartada por cuidador en los
 *   últimos 7 días → silenciar (si ya llamó, no se insiste esa semana);
 * - ya hubo 2 recordatorios ("recordar") en 7 días → silenciar (quedó 1 recordatorio).
 */
export function filtrarYaAtendidas(
  disparadas: BanderaDisparada[],
  eventos: EventoBandera[],
  hoy: string,
): BanderaDisparada[] {
  return disparadas.filter((d) => {
    if (d.regla.nivel === 'roja') return true; // una urgencia jamás se silencia
    const delRegla = eventos.filter(
      (e) => e.reglaId === d.regla.id && enVentana(e.fechaHora, hoy, 7),
    );
    if (delRegla.some((e) => e.fechaHora.slice(0, 10) === hoy)) return false;
    if (
      delRegla.some(
        (e) =>
          e.decision === 'llamo' ||
          e.decision === 'ya_hablado' ||
          e.decision === 'descartada_por_cuidador',
      )
    ) {
      return false;
    }
    const recordatorios = delRegla.filter((e) => e.decision === 'recordar').length;
    return recordatorios < 2;
  });
}

/**
 * "Recordármelo mañana" para reglas puntuales (§7.1): una regla cuya condición
 * solo mira el registro de HOY (p. ej. A2-ortopnea o la crisis de A10) no
 * volvería a dispararse sola al día siguiente. Esta función devuelve las
 * reglas ámbar con decisión "recordar" AYER, para re-ofrecerlas hoy una vez.
 * El silenciamiento fino (máx. 1 recordatorio, ya hablado, etc.) lo aplica
 * después filtrarYaAtendidas sobre el resultado combinado.
 */
export function reglasParaRecordar(
  eventos: EventoBandera[],
  hoy: string,
  ctx: ContextoEvaluacion,
): BanderaDisparada[] {
  const ayer = eventos.filter(
    (e) =>
      e.nivel === 'ambar' &&
      e.decision === 'recordar' &&
      // diffDias(hoy, día del evento) === 1 → fue ayer
      enVentana(e.fechaHora, hoy, 2) &&
      e.fechaHora.slice(0, 10) !== hoy,
  );
  const vistos = new Set<string>();
  const resultado: BanderaDisparada[] = [];
  for (const e of ayer) {
    if (vistos.has(e.reglaId)) continue;
    vistos.add(e.reglaId);
    const regla = reglasAmbar.find((r) => r.id === e.reglaId);
    if (!regla) continue;
    const tema =
      typeof regla.contactoTema === 'function' ? regla.contactoTema(ctx) : regla.contactoTema;
    resultado.push({ regla, contactoTema: tema });
  }
  return resultado;
}

/**
 * Selección final para la sesión (§7.4): todas las rojas (interrumpen ya) y
 * MÁXIMO UNA tarjeta ámbar (la de mayor prioridad); el resto va silenciosa al
 * reporte.
 */
export function seleccionarParaSesion(disparadas: BanderaDisparada[]): {
  rojas: BanderaDisparada[];
  ambar?: BanderaDisparada;
  silenciosas: BanderaDisparada[];
} {
  const rojas = disparadas.filter((d) => d.regla.nivel === 'roja');
  const ambares = disparadas.filter((d) => d.regla.nivel === 'ambar');
  const [ambar, ...resto] = ambares;
  return { rojas, ambar, silenciosas: resto };
}
