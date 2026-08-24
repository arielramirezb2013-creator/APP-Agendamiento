// Tendencia de peso (§6.3): línea única en marrón café con relleno miel,
// eje de kg legible, rejilla recesiva y etiquetas directas en los extremos.
// Serie única → sin leyenda (el título la nombra). Tooltip al tocar/pasar.

import { useMemo, useRef, useState } from 'react';
import type { Peso } from '@/types/models';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fechaCorta(fecha: string): string {
  return `${Number(fecha.slice(8, 10))} ${MESES[Number(fecha.slice(5, 7)) - 1]}`;
}

interface GraficaPesoProps {
  pesos: Peso[]; // ordenados por fecha ascendente
  /** Tooltip al pasar/tocar (panel del cuidador). */
  interactivo?: boolean;
}

export function GraficaPeso({ pesos, interactivo }: GraficaPesoProps) {
  const [activo, setActivo] = useState<number>();
  const svgRef = useRef<SVGSVGElement>(null);

  const geo = useMemo(() => {
    if (pesos.length < 2) return undefined;
    const ancho = 320;
    const alto = 130;
    const m = { izq: 34, der: 14, arr: 12, aba: 22 };
    const kgs = pesos.map((p) => p.kg);
    const minD = Math.floor(Math.min(...kgs) - 1);
    const maxD = Math.ceil(Math.max(...kgs) + 1);
    const x = (i: number) =>
      m.izq + (i / (pesos.length - 1)) * (ancho - m.izq - m.der);
    const y = (kg: number) =>
      m.arr + (1 - (kg - minD) / (maxD - minD)) * (alto - m.arr - m.aba);
    const puntos = pesos.map((p, i) => ({ px: x(i), py: y(p.kg), p }));
    const linea = puntos.map((q) => `${q.px},${q.py}`).join(' ');
    const area = `${m.izq},${alto - m.aba} ${linea} ${x(pesos.length - 1)},${alto - m.aba}`;
    const rejilla = [minD, (minD + maxD) / 2, maxD];
    return { ancho, alto, m, minD, maxD, puntos, linea, area, rejilla, y };
  }, [pesos]);

  if (!geo) {
    return null;
  }

  const ultimo = geo.puntos[geo.puntos.length - 1];
  const primero = geo.puntos[0];
  const sel = activo !== undefined ? geo.puntos[activo] : undefined;

  const alPuntero = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactivo || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * geo.ancho;
    let mejor = 0;
    let dist = Infinity;
    geo.puntos.forEach((q, i) => {
      const d = Math.abs(q.px - px);
      if (d < dist) {
        dist = d;
        mejor = i;
      }
    });
    setActivo(mejor);
  };

  return (
    <figure className="m-0">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${geo.ancho} ${geo.alto}`}
        role="img"
        aria-label={`Peso: de ${primero.p.kg} kg (${fechaCorta(primero.p.fecha)}) a ${ultimo.p.kg} kg (${fechaCorta(ultimo.p.fecha)})`}
        className="w-full touch-none select-none"
        onPointerMove={alPuntero}
        onPointerLeave={() => setActivo(undefined)}
      >
        {/* rejilla recesiva + eje de kg */}
        {geo.rejilla.map((kg) => (
          <g key={kg}>
            <line
              x1={geo.m.izq}
              x2={geo.ancho - geo.m.der}
              y1={geo.y(kg)}
              y2={geo.y(kg)}
              stroke="#EADFCE"
              strokeWidth="1"
            />
            <text
              x={geo.m.izq - 6}
              y={geo.y(kg) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#7A6357"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {Number.isInteger(kg) ? kg : kg.toFixed(1)}
            </text>
          </g>
        ))}
        {/* fechas de los extremos */}
        <text x={geo.m.izq} y={geo.alto - 6} fontSize="10" fill="#7A6357">
          {fechaCorta(primero.p.fecha)}
        </text>
        <text
          x={geo.ancho - geo.m.der}
          y={geo.alto - 6}
          textAnchor="end"
          fontSize="10"
          fill="#7A6357"
        >
          {fechaCorta(ultimo.p.fecha)}
        </text>

        <polygon points={geo.area} fill="#D98E2B" opacity="0.12" />
        <polyline
          points={geo.linea}
          fill="none"
          stroke="#43302B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* punto final enfatizado con anillo de superficie */}
        <circle cx={ultimo.px} cy={ultimo.py} r="6" fill="#FFFFFF" />
        <circle cx={ultimo.px} cy={ultimo.py} r="4" fill="#43302B" />
        {/* etiquetas directas: primero y último */}
        <text
          x={primero.px}
          y={primero.py - 8}
          fontSize="11"
          fill="#7A6357"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {primero.p.kg}
        </text>
        <text
          x={ultimo.px}
          y={ultimo.py - 9}
          textAnchor="end"
          fontSize="12"
          fontWeight="bold"
          fill="#43302B"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {ultimo.p.kg} kg
        </text>

        {/* capa de hover/tap */}
        {interactivo && sel ? (
          <g>
            <line
              x1={sel.px}
              x2={sel.px}
              y1={geo.m.arr}
              y2={geo.alto - geo.m.aba}
              stroke="#7A6357"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={sel.px} cy={sel.py} r="6" fill="#FFFFFF" />
            <circle cx={sel.px} cy={sel.py} r="4" fill="#B4532A" />
          </g>
        ) : null}
      </svg>
      {interactivo ? (
        <p
          role="status"
          className="min-h-[1.4em] text-center text-min text-tinta-suave"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {sel ? `${fechaCorta(sel.p.fecha)}: ${sel.p.kg} kg` : ' '}
        </p>
      ) : null}
      <figcaption className="sr-only">
        {pesos.map((p) => `${p.fecha}: ${p.kg} kg`).join('; ')}
      </figcaption>
    </figure>
  );
}
