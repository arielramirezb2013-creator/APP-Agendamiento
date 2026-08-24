// Precargas sugeridas editables para Colombia (§2.2-10, §6.5):
// línea 123 y voluntariado ACELA. El cuidador puede editarlas o borrarlas.

import { db, nuevoId } from './dexie';
import type { Contacto, OrganizacionApoyo } from '@/types/models';
import { interpolar, recordatorios as copyRec } from '@/content/es-CO';

export async function sembrarPrecargas(): Promise<void> {
  await sembrarRedApoyo();
  // Transacción: la siembra puede invocarse dos veces casi a la vez (creación
  // del perfil + efecto de arranque); el conteo+inserción debe ser atómico.
  await db.transaction('rw', db.contactos, async () => {
    const existentes = await db.contactos.count();
    if (existentes > 0) return;
    await db.contactos.bulkAdd(precargasContactos());
  });
}

function precargasContactos(): Contacto[] {
  return [
    {
      id: nuevoId(),
      nombre: 'Emergencias 123',
      telefono: '123',
      temas: ['emergencia'],
      paraQue: 'Cualquier urgencia: respiración, atragantamiento, caída grave',
      esEmergencia: true,
      orden: 0,
    },
    {
      id: nuevoId(),
      nombre: 'ACELA — voluntariado',
      telefono: '3002037108',
      whatsapp: '573002037108',
      temas: ['tramites', 'animo', 'otro'],
      // §13: nunca "paciente" en pantallas de paciente.
      paraQue: 'Personas que conocen la ELA de cerca: orientación y compañía',
      esEmergencia: false,
      orden: 10,
    },
  ];
}

/** Red de apoyo precargada (§2.2-10, verificaciones Colombia ago-2026).
 * Solo datos de contacto verificados: ACELA (teléfono/WhatsApp del informe
 * familiar). Los nodos de referencia de Bogotá (HUN, Instituto Roosevelt) se
 * cargan SIN teléfono: el cuidador lo completa con su EPS o con ACELA.
 * Todo es editable y eliminable desde el Modo Cuidador. */
async function sembrarRedApoyo(): Promise<void> {
  await db.transaction('rw', db.redApoyo, async () => {
    const existentes = await db.redApoyo.count();
    if (existentes > 0) return;
    await db.redApoyo.bulkAdd(precargasRed());
  });
}

function precargasRed(): OrganizacionApoyo[] {
  return [
    {
      id: nuevoId(),
      nombre: 'ACELA — Asociación Colombiana de ELA',
      alcance: 'nacional',
      paraQue: 'Personas que conocen la ELA de cerca: orientación, compañía y voluntariado',
      telefono: '3002037108',
      whatsapp: '573002037108',
      precargada: true,
      orden: 0,
    },
    {
      id: nuevoId(),
      nombre: 'Clínica de Excelencia en ELA — Hospital Universitario Nacional',
      alcance: 'local',
      ciudad: 'Bogotá',
      paraQue: 'Atención multidisciplinaria de referencia; pida la ruta por su EPS',
      precargada: true,
      orden: 1,
    },
    {
      id: nuevoId(),
      nombre: 'Instituto Roosevelt',
      alcance: 'local',
      ciudad: 'Bogotá',
      paraQue: 'Nodo de referencia en rehabilitación; pida la ruta por su EPS',
      precargada: true,
      orden: 2,
    },
  ];
}

/** Plantilla de laboratorios de riluzol (§6.6 / §2.2-8, MND Association):
 * monitoreo hepático mensual ×3 meses, luego trimestral el primer año, luego
 * anual. Esquema orientativo: el cuidador confirma fechas con el médico. */
export function fechasLabsRiluzol(desde: Date): Array<{ fecha: string; titulo: string }> {
  const fechas: Array<{ fecha: string; titulo: string }> = [];
  const agregar = (meses: number, titulo: string) => {
    const d = new Date(desde);
    d.setMonth(d.getMonth() + meses);
    const p = (n: number) => String(n).padStart(2, '0');
    fechas.push({
      fecha: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
      titulo,
    });
  };
  agregar(1, interpolar(copyRec.labsTituloMes, { n: '1' }));
  agregar(2, interpolar(copyRec.labsTituloMes, { n: '2' }));
  agregar(3, interpolar(copyRec.labsTituloMes, { n: '3' }));
  agregar(6, copyRec.labsTituloTrimestral);
  agregar(9, copyRec.labsTituloTrimestral);
  agregar(12, copyRec.labsTituloTrimestral);
  agregar(24, copyRec.labsTituloAnual);
  return fechas;
}
