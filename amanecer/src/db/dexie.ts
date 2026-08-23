// Almacenamiento local offline-first (§8, §11): IndexedDB vía Dexie.
// MVP: cero datos salen del dispositivo (§12). Blobs de audio/foto también aquí.

import Dexie, { type Table } from 'dexie';
import type {
  CheckinDiario,
  Comida,
  ConfigUmbrales,
  Contacto,
  Episodio,
  EventoBandera,
  Medicina,
  NotaVoz,
  Perfil,
  Peso,
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

export function ahoraISO(): string {
  return new Date().toISOString();
}
