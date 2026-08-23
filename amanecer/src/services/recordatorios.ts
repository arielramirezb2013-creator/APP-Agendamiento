// Recordatorios locales (§6.6): funcionan sin conexión. Notificaciones del
// sistema si hay permiso; SIEMPRE visibles al abrir la app como respaldo.

import { db, hoyLocal, nuevoId } from '@/db/dexie';
import type { Medicina, Perfil, Recordatorio } from '@/types/models';
import { fechasLabsRiluzol } from '@/db/seed';
import {
  interpolar,
  recordatorios as copyRec,
  t,
  type Tratamiento,
} from '@/content/es-CO';

export interface ItemHoy {
  tipo: 'medicina' | 'laboratorio' | 'cita' | 'ejercicio' | 'peso' | 'alsfrs';
  hora?: string; // HH:mm
  titulo: string;
  medicinaId?: string;
  tomada?: boolean;
}

function horaYaTomada(m: Medicina, hora: string, hoy: string): boolean {
  return m.tomas.some(
    (t) => t.estado === 'tomada' && t.fechaHora.startsWith(hoy) && t.fechaHora.includes(`T${hora}`),
  );
}

/** Lista de "Hoy:" para el inicio (§9.2) y para "Mis recuerdos de hoy". */
export async function itemsDeHoy(perfil?: Perfil): Promise<ItemHoy[]> {
  const hoy = hoyLocal();
  const items: ItemHoy[] = [];

  const medicinas = await db.medicinas.toArray();
  for (const m of medicinas) {
    for (const hora of m.horarios) {
      items.push({
        tipo: 'medicina',
        hora,
        titulo: m.nombre,
        medicinaId: m.id,
        tomada: horaYaTomada(m, hora, hoy),
      });
    }
  }

  const recordatorios = (await db.recordatorios.toArray()).filter((r) => r.activo);
  for (const r of recordatorios) {
    if (r.tipo === 'peso') {
      const dia = Number(r.cron.split('@')[0]);
      if (new Date().getDay() === dia) items.push({ tipo: 'peso', titulo: r.titulo });
    } else if (r.cron.startsWith(hoy)) {
      // puntual (cita / laboratorio) con fecha de hoy
      const hora = r.cron.includes('T') ? r.cron.slice(11, 16) : undefined;
      items.push({ tipo: r.tipo, hora, titulo: r.titulo });
    }
  }

  // Recordatorio semanal de peso configurado en el perfil (sin recordatorio explícito).
  if (
    perfil?.diaPeso !== undefined &&
    new Date().getDay() === perfil.diaPeso &&
    !items.some((i) => i.tipo === 'peso')
  ) {
    items.push({ tipo: 'peso', titulo: copyRec.anotarPeso });
  }

  return items.sort((a, b) => (a.hora ?? '99').localeCompare(b.hora ?? '99'));
}

export async function marcarToma(
  medicinaId: string,
  hora: string,
  estado: 'tomada' | 'pospuesta',
): Promise<void> {
  const m = await db.medicinas.get(medicinaId);
  if (!m) return;
  const hoy = hoyLocal();
  await db.medicinas.update(medicinaId, {
    tomas: [...m.tomas, { fechaHora: `${hoy}T${hora}`, estado }],
  });
}

/** Deshacer (§3.1): retira la última toma registrada hoy para esa hora. */
export async function desmarcarToma(medicinaId: string, hora: string): Promise<void> {
  const m = await db.medicinas.get(medicinaId);
  if (!m) return;
  const clave = `${hoyLocal()}T${hora}`;
  const idx = m.tomas.map((t) => t.fechaHora).lastIndexOf(clave);
  if (idx === -1) return;
  await db.medicinas.update(medicinaId, {
    tomas: m.tomas.filter((_, i) => i !== idx),
  });
}

/** Activa la plantilla de laboratorios de riluzol (§6.6): crea recordatorios
 * puntuales editables. Incluye el disclaimer en el detalle. */
export async function activarPlantillaRiluzol(): Promise<void> {
  const fechas = fechasLabsRiluzol(new Date());
  for (const f of fechas) {
    const r: Recordatorio = {
      id: nuevoId(),
      tipo: 'laboratorio',
      titulo: f.titulo,
      detalle: copyRec.labsDisclaimer,
      cron: `${f.fecha}T08:00`,
      activo: true,
      plantilla: 'labs_riluzol',
    };
    await db.recordatorios.add(r);
  }
}

// ——— Notificaciones del sistema (mejor esfuerzo; el respaldo es la lista visible) ———

let intervalo: number | undefined;
const notificadas = new Set<string>();

export async function pedirPermisoNotificaciones(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const r = await Notification.requestPermission();
  return r === 'granted';
}

export function iniciarVigilanciaNotificaciones(
  nombre: string,
  trato: Tratamiento = 'usted',
): void {
  if (!('Notification' in window)) return;
  if (intervalo !== undefined) return;
  const revisar = async () => {
    if (Notification.permission !== 'granted') return;
    const ahora = new Date();
    const hhmm = `${String(ahora.getHours()).padStart(2, '0')}:${String(
      ahora.getMinutes(),
    ).padStart(2, '0')}`;
    const items = await itemsDeHoy();
    for (const item of items) {
      if (item.tipo !== 'medicina' || item.tomada || item.hora !== hhmm) continue;
      const clave = `${hoyLocal()}-${item.medicinaId}-${item.hora}`;
      if (notificadas.has(clave)) continue;
      notificadas.add(clave);
      // Voz de casa (§6.6): "[Nombre], es hora de su pastilla de las 8".
      // La confirmación de toma sigue siendo explícita en pantalla ("Ya la tomé ✓").
      new Notification('Amanecer', {
        body: interpolar(t(copyRec.notificacionPastilla, trato), {
          nombre,
          hora: String(Number(item.hora.slice(0, 2))),
          medicina: item.titulo,
        }),
      });
    }
  };
  intervalo = window.setInterval(revisar, 30_000);
  void revisar();
}

export function detenerVigilanciaNotificaciones(): void {
  if (intervalo !== undefined) {
    clearInterval(intervalo);
    intervalo = undefined;
  }
}
