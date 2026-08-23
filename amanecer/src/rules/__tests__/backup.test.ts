// Respaldo cifrado (§12-4): el export y el import deben ser un ciclo sin
// pérdida, y una contraseña equivocada jamás debe importar datos.

import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, nuevoId } from '@/db/dexie';
import { exportarTodo, hashPin, importarTodo } from '@/db/backup';
import { HOY } from './fixtures';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('exportarTodo / importarTodo', () => {
  it('conserva registros y notas de voz tras el ciclo completo', async () => {
    await db.perfiles.add({
      id: 'p1',
      nombre: 'Rosa',
      tratamiento: 'usted',
      appName: 'Amanecer',
    });
    await db.checkins.add({
      id: nuevoId(),
      fecha: HOY,
      animo: 4,
      llenado: { por: 'paciente', fecha: `${HOY}T08:00:00` },
      banderas: [],
    });
    await db.notasVoz.add({
      id: 'n1',
      fechaHora: `${HOY}T09:00:00`,
      blob: new Blob(['audio-de-prueba'], { type: 'audio/webm' }),
      transcripcion: 'hola',
      origen: 'checkin',
    });

    const blob = await exportarTodo('clave-secreta');
    const texto = await blob.text();

    // El archivo cifrado no expone datos en claro.
    expect(texto).not.toContain('Rosa');
    expect(texto).not.toContain('hola');

    await db.perfiles.clear();
    await db.checkins.clear();
    await db.notasVoz.clear();

    await importarTodo(texto, 'clave-secreta');

    expect((await db.perfiles.toArray())[0]?.nombre).toBe('Rosa');
    expect(await db.checkins.count()).toBe(1);
    const nota = await db.notasVoz.get('n1');
    expect(nota?.transcripcion).toBe('hola');
    expect(await nota?.blob.text()).toBe('audio-de-prueba');
  });

  it('rechaza una contraseña equivocada sin tocar los datos', async () => {
    await db.perfiles.add({
      id: 'p1',
      nombre: 'Rosa',
      tratamiento: 'usted',
      appName: 'Amanecer',
    });
    const blob = await exportarTodo('clave-buena');
    const texto = await blob.text();
    await expect(importarTodo(texto, 'clave-mala')).rejects.toThrow();
    expect(await db.perfiles.count()).toBe(1);
  });

  it('rechaza archivos con formato desconocido', async () => {
    await expect(importarTodo('{"formato":"otro"}', 'x')).rejects.toThrow(
      'formato_desconocido',
    );
  });
});

describe('hashPin', () => {
  it('es determinista y distingue PIN distintos', async () => {
    expect(await hashPin('1234')).toBe(await hashPin('1234'));
    expect(await hashPin('1234')).not.toBe(await hashPin('4321'));
  });
});
