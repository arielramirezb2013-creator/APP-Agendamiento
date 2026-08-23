// Puente entre la BD y el motor de reglas puro (§7). Aquí sí hay efectos:
// leer historial, registrar EventoBandera, decidir qué tarjeta mostrar.

import { db, hoyLocal, nuevoId, ahoraISO } from '@/db/dexie';
import {
  evaluarBanderas,
  filtrarYaAtendidas,
  reglasParaRecordar,
  seleccionarParaSesion,
  type BanderaDisparada,
  type ContextoEvaluacion,
} from '@/rules/flags';
import { UMBRALES_PESO_DEFECTO } from '@/rules/weight';
import { sumarDias } from '@/rules/recurrence';
import type { EventoBandera, Tema } from '@/types/models';

export interface ResultadoSesion {
  rojas: BanderaDisparada[];
  ambar?: BanderaDisparada;
}

/** Construye el contexto con el historial reciente (60 días bastan para toda regla). */
export async function construirContexto(
  extras: Partial<ContextoEvaluacion> = {},
): Promise<ContextoEvaluacion> {
  const hoy = hoyLocal();
  const desde = sumarDias(hoy, -60);
  const [checkins, episodios, comidas, pesos, config] = await Promise.all([
    db.checkins.where('fecha').aboveOrEqual(desde).toArray(),
    db.episodios.toArray(),
    db.comidas.where('fecha').aboveOrEqual(desde).toArray(),
    db.pesos.toArray(),
    db.config.get('default'),
  ]);
  return {
    hoy,
    checkins,
    episodios,
    comidas,
    pesos,
    umbrales: config
      ? { pesoPorcentaje8Sem: config.pesoPorcentaje8Sem, pesoKg4Sem: config.pesoKg4Sem }
      : UMBRALES_PESO_DEFECTO,
    ...extras,
  };
}

/**
 * Evalúa y registra. Devuelve las rojas (interrumpen ya) y máximo una ámbar
 * (se muestra al cierre del flujo, §6.1). Las ámbar restantes quedan
 * registradas en silencio para el Reporte de Control (§7.4).
 */
export async function procesarBanderas(
  extras: Partial<ContextoEvaluacion> = {},
): Promise<ResultadoSesion> {
  const ctx = await construirContexto(extras);
  const disparadas = evaluarBanderas(ctx);
  const eventos = await db.eventosBandera.toArray();
  // "Recordármelo mañana" de reglas puntuales: se re-ofrecen hoy una vez.
  const recordadas = reglasParaRecordar(eventos, ctx.hoy, ctx).filter(
    (r) => !disparadas.some((d) => d.regla.id === r.regla.id),
  );
  const vigentes = filtrarYaAtendidas([...disparadas, ...recordadas], eventos, ctx.hoy);
  const sel = seleccionarParaSesion(vigentes);

  // Registrar de una vez: rojas y silenciosas. La ámbar visible se registra al
  // mostrarse (registrarEventoAmbar) para poder guardar la decisión.
  for (const roja of sel.rojas) {
    await db.eventosBandera.add({
      id: nuevoId(),
      reglaId: roja.regla.id,
      nivel: 'roja',
      fechaHora: ahoraISO(),
    });
  }
  for (const s of sel.silenciosas) {
    await db.eventosBandera.add({
      id: nuevoId(),
      reglaId: s.regla.id,
      nivel: 'ambar',
      fechaHora: ahoraISO(),
      decision: undefined,
    });
  }
  return { rojas: sel.rojas, ambar: sel.ambar };
}

export async function registrarEventoAmbar(reglaId: string): Promise<string> {
  const id = nuevoId();
  await db.eventosBandera.add({
    id,
    reglaId,
    nivel: 'ambar',
    fechaHora: ahoraISO(),
  });
  return id;
}

export async function decidirEventoAmbar(
  eventoId: string,
  decision: NonNullable<EventoBandera['decision']>,
): Promise<void> {
  await db.eventosBandera.update(eventoId, { decision });
}

/** Contacto sugerido para un tema (para "¿La llamamos?"). */
export async function contactoParaTema(tema: Tema) {
  const contactos = await db.contactos.orderBy('orden').toArray();
  return contactos.find((c) => c.temas.includes(tema));
}

export async function contactoEmergencia() {
  const contactos = await db.contactos.orderBy('orden').toArray();
  return (
    contactos.find((c) => c.esEmergencia && c.telefono !== '123') ??
    contactos.find((c) => c.esEmergencia)
  );
}
