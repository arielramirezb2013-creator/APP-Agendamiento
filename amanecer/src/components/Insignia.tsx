// Insignia cálida: el emoji deja de estar "desnudo" y vive en un círculo
// tibio. Es decorativa (aria-hidden); la palabra al lado lleva el significado.

interface InsigniaProps {
  emoji: string;
  tono?: 'durazno' | 'miel' | 'rojo';
  tamano?: 'normal' | 'grande';
}

export function Insignia({ emoji, tono = 'durazno', tamano = 'normal' }: InsigniaProps) {
  const fondo = {
    durazno: 'bg-primario-suave',
    miel: 'bg-ambar-fondo',
    rojo: 'bg-rojo-fondo',
  }[tono];
  const medida = tamano === 'grande' ? 'h-14 w-14 text-[1.7rem]' : 'h-11 w-11 text-[1.35rem]';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${fondo} ${medida}`}
    >
      {emoji}
    </span>
  );
}
