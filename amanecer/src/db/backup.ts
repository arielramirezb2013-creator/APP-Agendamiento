// Respaldo manual cifrado (§8, §12-4): export/import de un .json cifrado con
// contraseña del cuidador. AES-GCM con clave derivada por PBKDF2 (Web Crypto).
// Las notas de voz (blobs) se serializan en base64 dentro del mismo archivo.

import { db } from './dexie';

const SAL_BYTES = 16;
const IV_BYTES = 12;
const ITERACIONES = 310_000;

async function derivarClave(pass: string, sal: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pass),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sal as BufferSource, iterations: ITERACIONES, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function aBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function deBase64(s: string): Uint8Array {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function blobABase64(blob: Blob): Promise<string> {
  return aBase64(await blob.arrayBuffer());
}

export async function exportarTodo(password: string): Promise<Blob> {
  const notasVoz = await Promise.all(
    (await db.notasVoz.toArray()).map(async (n) => ({
      ...n,
      blob: undefined,
      blobB64: await blobABase64(n.blob),
      tipoMime: n.blob.type,
    })),
  );
  const datos = {
    version: 1,
    exportadoEn: new Date().toISOString(),
    perfiles: await db.perfiles.toArray(),
    contactos: await db.contactos.toArray(),
    checkins: await db.checkins.toArray(),
    episodios: await db.episodios.toArray(),
    comidas: await db.comidas.toArray(),
    pesos: await db.pesos.toArray(),
    medicinas: await db.medicinas.toArray(),
    recordatorios: await db.recordatorios.toArray(),
    eventosBandera: await db.eventosBandera.toArray(),
    tarjetasPlan: await db.tarjetasPlan.toArray(),
    config: await db.config.toArray(),
    notasVoz,
  };

  const sal = crypto.getRandomValues(new Uint8Array(SAL_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const clave = await derivarClave(password, sal);
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    clave,
    new TextEncoder().encode(JSON.stringify(datos)),
  );

  const archivo = {
    formato: 'amanecer-backup',
    version: 1,
    sal: aBase64(sal),
    iv: aBase64(iv),
    datos: aBase64(cifrado),
  };
  return new Blob([JSON.stringify(archivo)], { type: 'application/json' });
}

export async function importarTodo(archivo: string, password: string): Promise<void> {
  const parsed = JSON.parse(archivo) as {
    formato: string;
    sal: string;
    iv: string;
    datos: string;
  };
  if (parsed.formato !== 'amanecer-backup') {
    throw new Error('formato_desconocido');
  }
  const clave = await derivarClave(password, deBase64(parsed.sal));
  const plano = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: deBase64(parsed.iv) as BufferSource },
    clave,
    deBase64(parsed.datos) as BufferSource,
  );
  const datos = JSON.parse(new TextDecoder().decode(plano));

  await db.transaction(
    'rw',
    [
      db.perfiles,
      db.contactos,
      db.checkins,
      db.episodios,
      db.comidas,
      db.pesos,
      db.medicinas,
      db.recordatorios,
      db.eventosBandera,
      db.tarjetasPlan,
      db.config,
    ],
    async () => {
      await Promise.all([
        db.perfiles.clear(),
        db.contactos.clear(),
        db.checkins.clear(),
        db.episodios.clear(),
        db.comidas.clear(),
        db.pesos.clear(),
        db.medicinas.clear(),
        db.recordatorios.clear(),
        db.eventosBandera.clear(),
        db.tarjetasPlan.clear(),
        db.config.clear(),
      ]);
      await db.perfiles.bulkAdd(datos.perfiles ?? []);
      await db.contactos.bulkAdd(datos.contactos ?? []);
      await db.checkins.bulkAdd(datos.checkins ?? []);
      await db.episodios.bulkAdd(datos.episodios ?? []);
      await db.comidas.bulkAdd(datos.comidas ?? []);
      await db.pesos.bulkAdd(datos.pesos ?? []);
      await db.medicinas.bulkAdd(datos.medicinas ?? []);
      await db.recordatorios.bulkAdd(datos.recordatorios ?? []);
      await db.eventosBandera.bulkAdd(datos.eventosBandera ?? []);
      await db.tarjetasPlan.bulkAdd(datos.tarjetasPlan ?? []);
      await db.config.bulkAdd(datos.config ?? []);
    },
  );
  // Notas de voz fuera de la transacción (reconstruyen Blob).
  await db.notasVoz.clear();
  for (const n of datos.notasVoz ?? []) {
    const bytes = deBase64(n.blobB64 as string);
    await db.notasVoz.add({
      id: n.id,
      fechaHora: n.fechaHora,
      transcripcion: n.transcripcion,
      origen: n.origen,
      blob: new Blob([bytes as BlobPart], { type: n.tipoMime || 'audio/webm' }),
    });
  }
}

export async function borrarTodo(): Promise<void> {
  await db.delete();
  await db.open();
}

/** Hash SHA-256 del PIN (no es seguridad fuerte: protege de toques accidentales, §3.2). */
export async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return aBase64(buf);
}
