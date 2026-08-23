// Checklist de señales urgentes del cuidador (R5 §7.2 / A4 §7.3):
// labios morados, confusión/somnolencia marcada, no puede hablar ni respirar
// → roja inmediata. Tos débil → ámbar hacia fisioterapia respiratoria.

import { useState } from 'react';
import { BigChoice } from '@/components/BigChoice';
import { CardQuestion } from '@/components/CardQuestion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { cuidador as copy } from '@/content/es-CO';
import { ahoraISO, db, nuevoId } from '@/db/dexie';
import { procesarBanderas } from '@/services/banderas';
import type { BanderaDisparada } from '@/rules/flags';
import { useApp } from '@/store';
import { TarjetaAmbar } from '@/features/banderas/TarjetaAmbar';

export function CuidadorChecklist() {
  const { ir, volver } = useApp();
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [ambar, setAmbar] = useState<BanderaDisparada>();

  const evaluar = async () => {
    if (marcadas.includes('tos_debil')) {
      // La tos débil queda además registrada como episodio para el reporte.
      await db.episodios.add({
        id: nuevoId(),
        tipo: 'tos_debil',
        cuando: ahoraISO(),
        severidad: 'moderado',
        resueltoEnElMomento: true,
        llenado: { por: 'cuidador', fecha: ahoraISO() },
        banderas: [],
      });
    }
    const res = await procesarBanderas({ checklistCuidador: marcadas });
    if (res.rojas.length > 0) {
      ir({ id: 'banderaRoja', reglaId: res.rojas[0].regla.id });
      return;
    }
    if (res.ambar) {
      setAmbar(res.ambar);
      return;
    }
    volver();
  };

  if (ambar) {
    return <TarjetaAmbar disparada={ambar} onCerrada={volver} />;
  }

  return (
    <CardQuestion
      pregunta={copy.checklist.intro}
      onVolver={volver}
      pie={
        <PrimaryButton onClick={() => void evaluar()} deshabilitado={marcadas.length === 0}>
          {copy.checklist.titulo} ›
        </PrimaryButton>
      }
    >
      <div className="flex flex-col gap-3">
        {copy.checklist.opciones.map((o) => (
          <BigChoice
            key={o.valor}
            ancho
            etiqueta={o.etiqueta}
            seleccionado={marcadas.includes(o.valor)}
            onSelect={() =>
              setMarcadas((prev) =>
                prev.includes(o.valor)
                  ? prev.filter((x) => x !== o.valor)
                  : [...prev, o.valor],
              )
            }
          />
        ))}
        <BigChoice ancho etiqueta={copy.checklist.ninguna} onSelect={volver} />
      </div>
    </CardQuestion>
  );
}
