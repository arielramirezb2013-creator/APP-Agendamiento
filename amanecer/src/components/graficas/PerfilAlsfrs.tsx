// Perfil ALSFRS-R por subescalas (§6.4): PEQUEÑOS MÚLTIPLOS — tres mini
// gráficas de una sola serie (esmeralda), una por subescala, con el valor
// vigente en grande. Evita paleta categórica y presenta el perfil, nunca un
// único número protagonista (Mehdipour 2023).

import { alsfrs as copy } from '@/content/es-CO';
import { MAXIMOS_SUBESCALA } from '@/content/alsfrs';
import type { AlsfrsR } from '@/types/models';

interface PerfilAlsfrsProps {
  registros: AlsfrsR[]; // completados, orden ascendente por fecha
}

function MiniLinea({ valores, max }: { valores: number[]; max: number }) {
  const ancho = 120;
  const alto = 34;
  if (valores.length === 0) return null;
  const x = (i: number) =>
    valores.length === 1 ? ancho / 2 : 6 + (i / (valores.length - 1)) * (ancho - 12);
  const y = (v: number) => 4 + (1 - v / max) * (alto - 8);
  const linea = valores.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const fx = x(valores.length - 1);
  const fy = y(valores[valores.length - 1]);
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} aria-hidden="true" className="h-[34px] w-[120px]">
      <line x1="6" x2={ancho - 6} y1={y(0)} y2={y(0)} stroke="#EADFCE" strokeWidth="1" />
      {valores.length > 1 ? (
        <polyline
          points={linea}
          fill="none"
          stroke="#43302B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      <circle cx={fx} cy={fy} r="5" fill="#FFFFFF" />
      <circle cx={fx} cy={fy} r="3.5" fill="#43302B" />
    </svg>
  );
}

export function PerfilAlsfrs({ registros }: PerfilAlsfrsProps) {
  if (registros.length === 0) {
    return <p className="text-base text-tinta-suave">{copy.sinRegistros}</p>;
  }
  const ultimo = registros[registros.length - 1];
  const filas: Array<{ clave: keyof typeof MAXIMOS_SUBESCALA; nombre: string }> = [
    { clave: 'bulbar', nombre: copy.subescalas.bulbar },
    { clave: 'motora', nombre: copy.subescalas.motora },
    { clave: 'respiratoria', nombre: copy.subescalas.respiratoria },
  ];
  return (
    <div className="flex flex-col gap-2">
      {filas.map((fila) => (
        <div
          key={fila.clave}
          className="flex items-center justify-between gap-2 rounded-lg bg-fondo px-3 py-2"
        >
          <span className="min-w-0 flex-1 text-min font-bold text-tinta">{fila.nombre}</span>
          <MiniLinea
            valores={registros.map((r) => r.sub[fila.clave])}
            max={MAXIMOS_SUBESCALA[fila.clave]}
          />
          <span
            className="w-14 text-right text-base font-bold text-tinta"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {ultimo.sub[fila.clave]}/{MAXIMOS_SUBESCALA[fila.clave]}
          </span>
        </div>
      ))}
      {/* Sello permanente de autorreporte (§6.4) */}
      <p className="text-[0.72rem] leading-snug text-tinta-suave">{copy.selloAutorreporte}</p>
    </div>
  );
}
