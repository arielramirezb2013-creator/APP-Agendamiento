// Precargas sugeridas editables para Colombia (§2.2-10, §6.5):
// línea 123 y voluntariado ACELA. El cuidador puede editarlas o borrarlas.

import { db, nuevoId } from './dexie';
import type { Contacto } from '@/types/models';

export async function sembrarPrecargas(): Promise<void> {
  const existentes = await db.contactos.count();
  if (existentes > 0) return;

  const precargas: Contacto[] = [
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
      paraQue: 'Asociación de pacientes con ELA: orientación y acompañamiento',
      esEmergencia: false,
      orden: 10,
    },
  ];
  await db.contactos.bulkAdd(precargas);
}

/** Plantilla de laboratorios de riluzol (§6.6 / §2.2-8, MND Association):
 * monitoreo hepático mensual ×3 meses, luego trimestral el primer año, luego
 * anual. Esquema orientativo: el cuidador confirma fechas con el médico. */
export function fechasLabsRiluzol(desde: Date): Array<{ fecha: string; titulo: string }> {
  const fechas: Array<{ fecha: string; titulo: string }> = [];
  const agregar = (meses: number, titulo: string) => {
    const d = new Date(desde);
    d.setMonth(d.getMonth() + meses);
    fechas.push({ fecha: d.toISOString().slice(0, 10), titulo });
  };
  agregar(1, 'Laboratorio de riluzol (mes 1)');
  agregar(2, 'Laboratorio de riluzol (mes 2)');
  agregar(3, 'Laboratorio de riluzol (mes 3)');
  agregar(6, 'Laboratorio de riluzol (trimestral)');
  agregar(9, 'Laboratorio de riluzol (trimestral)');
  agregar(12, 'Laboratorio de riluzol (trimestral)');
  agregar(24, 'Laboratorio de riluzol (anual)');
  return fechas;
}
