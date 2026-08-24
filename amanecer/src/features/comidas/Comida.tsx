// "Mi comida" (§6.3): registro por momento del día en ≤3 toques.
// "Se atoró" crea automáticamente un episodio de atragantamiento leve
// vinculado, sin repetir preguntas. La app JAMÁS recomienda texturas.

import { useEffect, useRef, useState } from 'react';
import { BigChoice } from '@/components/BigChoice';
import { CardQuestion } from '@/components/CardQuestion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { NotaVozBoton } from '@/components/NotaVozBoton';
import { comidas as copy, comun, interpolar, t } from '@/content/es-CO';
import { ahoraISO, db, hoyLocal, nuevoId } from '@/db/dexie';
import { procesarBanderas } from '@/services/banderas';
import type { BanderaDisparada } from '@/rules/flags';
import type {
  Comida as ComidaModelo,
  Episodio as EpisodioModelo,
  MomentoComida,
  Perfil,
  Rol,
} from '@/types/models';
import { useApp } from '@/store';
import { TarjetaAmbar } from '@/features/banderas/TarjetaAmbar';
import { Toast, type ToastEstado } from '@/components/Toast';

type Paso = 'momento' | 'que' | 'cuanto' | 'tragando' | 'cierre';

interface ComidaProps {
  perfil: Perfil;
  rol: Rol;
}

/** Reduce una foto a máx. 800 px y la devuelve como dataURL local (§6.3). */
async function fotoADataUrl(archivo: File): Promise<string> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

export function Comida({ perfil, rol }: ComidaProps) {
  const { volver, aInicio } = useApp();
  const trato = perfil.tratamiento;
  const [paso, setPaso] = useState<Paso>('momento');
  const [momento, setMomento] = useState<MomentoComida>();
  const [descripcion, setDescripcion] = useState('');
  const [fotoRef, setFotoRef] = useState<string>();
  const [audioRef, setAudioRef] = useState<string>();
  const [cantidad, setCantidad] = useState<ComidaModelo['cantidad']>();
  const [escribiendo, setEscribiendo] = useState(false);
  const [error, setError] = useState<string>();
  const [ambar, setAmbar] = useState<BanderaDisparada>();
  const [huboAtoro, setHuboAtoro] = useState(false);
  const [texturaDia, setTexturaDia] = useState<ComidaModelo['texturaDia']>();
  const [toast, setToast] = useState<ToastEstado>();
  // Un doble toque (motricidad reducida, E2) no debe crear registros duplicados
  // ni disparar banderas falsas (A5 con dos "atoros" del mismo momento).
  const guardando = useRef(false);

  // Textura del día: la configura el cuidador según fonoaudiología; aquí solo
  // etiqueta el registro (§6.3). Se hereda de la última comida de hoy.
  useEffect(() => {
    void db.comidas
      .where('fecha')
      .equals(hoyLocal())
      .last()
      .then((ultima) => setTexturaDia(ultima?.texturaDia));
  }, []);

  const retroceder = () => {
    if (paso === 'que') return setPaso('momento');
    if (paso === 'cuanto') return setPaso('que');
    if (paso === 'tragando') return setPaso('cuanto');
    volver();
  };

  async function guardar(tragando: ComidaModelo['tragando']) {
    if (guardando.current) return;
    guardando.current = true;
    const id = nuevoId();
    let episodioVinculadoId: string | undefined;
    try {
      if (tragando === 'atoro') {
        // Episodio vinculado sin repetir captura (§6.3 CA).
        const episodio: EpisodioModelo = {
          id: nuevoId(),
          tipo: 'atragantamiento',
          cuando: ahoraISO(),
          severidad: 'leve',
          queHicieron: descripcion
            ? interpolar(copy.atoroEpisodioConDescripcion, { descripcion })
            : copy.atoroEpisodioSinDescripcion,
          resueltoEnElMomento: true,
          llenado: { por: rol, fecha: ahoraISO() },
          banderas: [],
        };
        await db.episodios.add(episodio);
        episodioVinculadoId = episodio.id;
        setHuboAtoro(true);
      }
      const registro: ComidaModelo = {
        id,
        fecha: hoyLocal(),
        momento: momento ?? 'entre',
        descripcion: descripcion || undefined,
        fotoRef,
        audioRef,
        cantidad: cantidad ?? 'todo',
        tragando,
        texturaDia,
        episodioVinculadoId,
        llenado: { por: rol, fecha: ahoraISO() },
      };
      await db.comidas.add(registro);
      const res = await procesarBanderas({});
      setAmbar(res.ambar);
      if (!res.ambar) {
        // Deshacer durante 6 s (§3.1): retira la comida y su episodio vinculado.
        setToast({
          mensaje: comun.guardado,
          onDeshacer: () => {
            void (async () => {
              await db.comidas.delete(id);
              if (episodioVinculadoId) await db.episodios.delete(episodioVinculadoId);
              aInicio();
            })();
          },
        });
      }
      setPaso('cierre');
    } catch {
      setError(comun.errorGuardar);
      setPaso('cierre');
    } finally {
      guardando.current = false;
    }
  }

  if (paso === 'momento') {
    return (
      <CardQuestion pregunta={copy.momento} onVolver={retroceder}>
        <div className="grid grid-cols-2 gap-3">
          {copy.momentos.map((m) => (
            <BigChoice
              key={m.valor}
              emoji={m.emoji}
              etiqueta={m.etiqueta}
              seleccionado={momento === m.valor}
              onSelect={() => {
                setMomento(m.valor as MomentoComida);
                setPaso('que');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'que') {
    return (
      <CardQuestion
        pregunta={t(copy.queComio, trato)}
        onVolver={retroceder}
        onPasar={() => setPaso('cuanto')}
        pie={
          descripcion || fotoRef || audioRef ? (
            <PrimaryButton onClick={() => setPaso('cuanto')}>{comun.seguir}</PrimaryButton>
          ) : undefined
        }
      >
        <p className="text-min text-tinta-suave">{t(copy.queComioDetalle, trato)}</p>
        <NotaVozBoton
          origen="comida"
          trato={trato}
          onNota={(nota) => {
            setAudioRef(nota.id);
            if (nota.transcripcion) setDescripcion(nota.transcripcion);
          }}
          onError={setError}
        />
        <label
          className="flex min-h-chip w-full cursor-pointer items-center justify-center
            rounded-token border-2 border-tinta-suave/20 bg-superficie text-boton"
        >
          {copy.foto}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) {
                void fotoADataUrl(archivo)
                  .then(setFotoRef)
                  .catch(() => setError(comun.errorGuardar));
              }
            }}
          />
        </label>
        {fotoRef ? (
          <img src={fotoRef} alt={copy.fotoAlt} className="max-h-40 w-auto rounded-token" />
        ) : null}
        {escribiendo ? (
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            aria-label={t(copy.queComio, trato)}
            className="w-full rounded-token border-2 border-tinta-suave/20 bg-superficie p-4 text-base"
          />
        ) : (
          <BigChoice ancho etiqueta={comun.escribir} onSelect={() => setEscribiendo(true)} />
        )}
        {error ? <p className="text-base text-rojo">{error}</p> : null}
      </CardQuestion>
    );
  }

  if (paso === 'cuanto') {
    return (
      <CardQuestion pregunta={t(copy.cuanto, trato)} onVolver={retroceder}>
        <div className="flex flex-col gap-3">
          {copy.cantidades.map((c) => (
            <BigChoice
              key={c.valor}
              ancho
              etiqueta={c.etiqueta}
              seleccionado={cantidad === c.valor}
              onSelect={() => {
                setCantidad(c.valor as ComidaModelo['cantidad']);
                setPaso('tragando');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'tragando') {
    return (
      <CardQuestion pregunta={t(copy.comoTragando, trato)} onVolver={retroceder}>
        <div className="flex flex-col gap-3">
          {copy.tragando.map((op) => (
            <BigChoice
              key={op.valor}
              ancho
              etiqueta={op.etiqueta}
              onSelect={() => void guardar(op.valor as ComidaModelo['tragando'])}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  // Cierre
  if (ambar) {
    return <TarjetaAmbar disparada={ambar} onCerrada={() => setAmbar(undefined)} />;
  }
  return (
    <div className="transicion-tarjeta flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8 text-center">
      <p className="text-pregunta font-bold text-exito">{comun.listo}</p>
      {huboAtoro ? (
        <div className="rounded-token bg-superficie p-5 text-left">
          <p className="text-base text-tinta">{copy.atoroNota}</p>
        </div>
      ) : null}
      {error ? <p className="text-base text-rojo">{error}</p> : null}
      <PrimaryButton onClick={aInicio}>{comun.seguir}</PrimaryButton>
      <Toast estado={toast} onCerrar={() => setToast(undefined)} />
    </div>
  );
}
