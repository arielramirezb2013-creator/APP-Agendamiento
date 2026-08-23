// Precargas sugeridas editables para Colombia (§2.2-10, §6.5):
// línea 123 y voluntariado ACELA. El cuidador puede editarlas o borrarlas.

import { db, nuevoId } from './dexie';
import type { Contacto } from '@/types/models';
import { interpolar, recordatorios as copyRec } from '@/content/es-CO';

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
      // §13: nunca "paciente" en pantallas de paciente.
      paraQue: 'Personas que conocen la ELA de cerca: orientación y compañía',
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
