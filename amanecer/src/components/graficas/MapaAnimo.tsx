// Mapa de ánimo de las últimas 4 semanas. La marca principal es el EMOJI con
// su palabra accesible (regla §3.1: nunca solo color); el tinte de fondo es
// refuerzo. Leyenda siempre presente con cara + palabra.

import { checkin as copyCheckin, cuidador, miSemana } from '@/content/es-CO';
import type { CheckinDiario } from '@/types/models';
import { sumarDias } from '@/rules/recurrence';

// Tintes divergentes de refuerzo (ámbar → neutro → salvia), decorativos:
// la identidad la lleva el emoji + texto accesible.
const TINTES: Record<number, string> = {
  1: '#F3CDA6',
  2: '#F8E0C2',
  3: '#F1EADC',
  4: '#E3E8D3',
  5: '#CFE3C6',
};

interface MapaAnimoProps {
  checkins: CheckinDiario[];
  hoy: string; // yyyy-mm-dd
  semanas?: number;
}

export function MapaAnimo({ checkins, hoy, semanas = 4 }: MapaAnimoProps) {
  const porFecha = new Map(checkins.map((c) => [c.fecha, c]));
  const dias = semanas * 7;
  // Alinear para que la última columna sea el día de la semana de hoy.
  const fechas = Array.from({ length: dias }, (_, i) => sumarDias(hoy, i - (dias - 1)));
  const filas: string[][] = [];
  for (let f = 0; f < semanas; f++) filas.push(fechas.slice(f * 7, f * 7 + 7));

  const etiqueta = (valor?: number) =>
    valor
      ? copyCheckin.animo.opciones.find((o) => o.valor === valor)?.etiqueta ?? ''
      : miSemana.diasSinRegistro;

  return (
    <figure className="m-0">
      <div className="grid grid-cols-7 gap-1" role="img" aria-label={miSemana.animoTitulo}>
        {filas[0].map((f) => (
          <span
            key={`enc-${f}`}
            aria-hidden="true"
            className="text-center text-min text-tinta-suave"
          >
            {cuidador.panel.dias[new Date(`${f}T12:00:00`).getDay()]}
          </span>
        ))}
        {fechas.map((f) => {
          const c = porFecha.get(f);
          const valor = c?.animo;
          const emoji = valor
            ? copyCheckin.animo.opciones.find((o) => o.valor === valor)?.emoji
            : undefined;
          return (
            <span
              key={f}
              title={`${f}: ${etiqueta(valor)}`}
              className="flex aspect-square items-center justify-center rounded-lg text-[1.05rem]"
              style={{ background: valor ? TINTES[valor] : 'transparent' }}
            >
              <span aria-hidden="true">{emoji ?? '·'}</span>
              <span className="sr-only">{`${f}: ${etiqueta(valor)}`}</span>
            </span>
          );
        })}
      </div>
      {/* Leyenda: cara + palabra, nunca color solo */}
      <figcaption className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-min text-tinta-suave">
        {copyCheckin.animo.opciones.map((o) => (
          <span key={o.valor} className="whitespace-nowrap">
            <span aria-hidden="true">{o.emoji}</span> {o.etiqueta}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
