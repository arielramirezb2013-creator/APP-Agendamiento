// Notas de voz y dictado (§6.9): MediaRecorder para audio local (WebM/AAC) y
// Web Speech API es-CO para transcripción cuando el navegador la ofrece.
// Todo se degrada con gracia: sin micrófono o sin soporte, la app sigue.

import { db, nuevoId, ahoraISO } from '@/db/dexie';
import type { NotaVoz } from '@/types/models';

export interface Grabadora {
  detener: () => Promise<NotaVoz | undefined>;
  cancelar: () => void;
}

export function soportaGrabacion(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

export async function iniciarGrabacion(
  origen: NotaVoz['origen'],
): Promise<Grabadora> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mime = MediaRecorder.isTypeSupported('audio/webm')
    ? 'audio/webm'
    : undefined;
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const trozos: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) trozos.push(e.data);
  };
  rec.start();

  const transcripcion = iniciarDictado();

  const limpiar = () => {
    stream.getTracks().forEach((t) => t.stop());
  };

  return {
    detener: () =>
      new Promise<NotaVoz | undefined>((resolve) => {
        rec.onstop = async () => {
          limpiar();
          const texto = await transcripcion.terminar();
          const blob = new Blob(trozos, { type: rec.mimeType || 'audio/webm' });
          if (blob.size === 0) {
            resolve(undefined);
            return;
          }
          const nota: NotaVoz = {
            id: nuevoId(),
            fechaHora: ahoraISO(),
            blob,
            transcripcion: texto || undefined,
            origen,
          };
          await db.notasVoz.add(nota);
          resolve(nota);
        };
        rec.stop();
      }),
    cancelar: () => {
      transcripcion.cancelar();
      try {
        rec.stop();
      } catch {
        // ya detenida
      }
      limpiar();
    },
  };
}

// ——— Dictado (SpeechRecognition es-CO), opcional ———

interface Dictado {
  terminar: () => Promise<string>;
  cancelar: () => void;
}

function iniciarDictado(): Dictado {
  const Ctor =
    (window as unknown as Record<string, unknown>).SpeechRecognition ??
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  if (typeof Ctor !== 'function') {
    return { terminar: async () => '', cancelar: () => undefined };
  }
  type Reconocedor = {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
  };
  const rec = new (Ctor as new () => Reconocedor)();
  rec.lang = 'es-CO';
  rec.continuous = true;
  rec.interimResults = false;
  let texto = '';
  let terminado: (() => void) | undefined;
  rec.onresult = (e) => {
    texto = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript)
      .join(' ')
      .trim();
  };
  rec.onend = () => terminado?.();
  rec.onerror = () => terminado?.();
  try {
    rec.start();
  } catch {
    return { terminar: async () => '', cancelar: () => undefined };
  }
  return {
    terminar: () =>
      new Promise<string>((resolve) => {
        terminado = () => resolve(texto);
        try {
          rec.stop();
        } catch {
          resolve(texto);
        }
        // Si el reconocedor no responde, no bloqueamos el guardado del audio.
        setTimeout(() => resolve(texto), 1500);
      }),
    cancelar: () => {
      try {
        rec.abort();
      } catch {
        // sin soporte
      }
    },
  };
}
