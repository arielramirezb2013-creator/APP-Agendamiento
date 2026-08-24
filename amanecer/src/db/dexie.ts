// Almacenamiento local offline-first (§8, §11): IndexedDB vía Dexie.
// MVP: cero datos salen del dispositivo (§12). Blobs de audio/foto también aquí.

import Dexie, { type Table } from 'dexie';
import type {
  AlsfrsR,
  CheckinDiario,
  Comida,
  ConfigUmbrales,
  Contacto,
  Episodio,
  EventoBandera,
  Inquietud,
  Medicina,
  NotaVoz,
  OrganizacionApoyo,
  Perfil,
  Peso,
  PublicacionComunidad,
  Recordatorio,
  TarjetaPlan,
} from '@/types/models';

export class AmanecerDB extends Dexie {
  perfiles!: Table<Perfil, string>;
  contactos!: Table<Contacto, string>;
  checkins!: Table<CheckinDiario, string>;
  episodios!: Table<Episodio, string>;
  comidas!: Table<Comida, string>;
  pesos!: Table<Peso, string>;
  medicinas!: Table<Medicina, string>;
  recordatorios!: Table<Recordatorio, string>;
  eventosBandera!: Table<EventoBandera, string>;
  notasVoz!: Table<NotaVoz, string>;
  tarjetasPlan!: Table<TarjetaPlan, string>;
  config!: Table<ConfigUmbrales, string>;
  redApoyo!: Table<OrganizacionApoyo, string>;
  inquietudes!: Table<Inquietud, string>;
  alsfrs!: Table<AlsfrsR, string>;
  publicaciones!: Table<PublicacionComunidad, string>;

  constructor() {
    super('amanecer');
    this.version(1).stores({
      perfiles: 'id',
      contactos: 'id, orden, esEmergencia',
      checkins: 'id, &fecha',
      episodios: 'id, tipo, cuando',
      comidas: 'id, fecha, momento',
      pesos: 'id, fecha',
      medicinas: 'id',
      recordatorios: 'id, tipo',
      eventosBandera: 'id, reglaId, fechaHora, nivel',
      notasVoz: 'id, fechaHora',
      tarjetasPlan: 'id, orden',
      config: 'id',
    });
    // v2: red de apoyo (local/nacional), inquietudes y ALSFRS-R mensual.
    this.version(2).stores({
      redApoyo: 'id, alcance, orden',
      inquietudes: 'id, fechaHora, estado',
      alsfrs: 'id, fecha',
    });
    // v3: publicaciones propias de la comunidad (locales hasta la fase en línea).
    this.version(3).stores({
      publicaciones: 'id, fechaHora, grupo',
    });
  }
}

export const db = new AmanecerDB();

export function nuevoId(): string {
  return crypto.randomUUID();
}

/** Fecha local de hoy en yyyy-mm-dd (la vida de la casa, no UTC). */
export function hoyLocal(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/**
 * Instante actual en hora LOCAL (sin zona): "yyyy-mm-ddTHH:mm:ss".
 * Importante para las reglas: en Colombia (UTC−5) un registro nocturno en UTC
 * caería en el día siguiente y se saldría de las ventanas de recurrencia.
 * El formato conserva el orden lexicográfico y slice(0,10) = día local.
 */
export function ahoraISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
