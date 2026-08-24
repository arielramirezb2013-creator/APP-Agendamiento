// "Pasó algo" (§6.2): registrar un evento en ≤4 toques + voz opcional.
// Atragantamiento que sigue → roja R3. Disnea "ahora" → roja R2.
// Tras guardar: microcopy de contención por tipo + evaluación de recurrencia.

import { useRef, useState } from 'react';
import { BigChoice } from '@/components/BigChoice';
import { CardQuestion } from '@/components/CardQuestion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { NotaVozBoton } from '@/components/NotaVozBoton';
import { banderas as banderasCopy, comun, episodios as copy, interpolar, t } from '@/content/es-CO';
import { etiquetasEpisodio } from '@/content/es-CO';
import { microcopyEpisodios } from '@/copy/episodes';
import { ahoraISO, db, hoyLocal, nuevoId } from '@/db/dexie';
import { sumarDias } from '@/rules/recurrence';
import { contactoParaTema, procesarBanderas } from '@/services/banderas';
import type { BanderaDisparada } from '@/rules/flags';
import type { Contacto, Episodio as EpisodioModelo, Perfil, Rol, TipoEpisodio } from '@/types/models';
import { useApp } from '@/store';
import { TarjetaAmbar } from '@/features/banderas/TarjetaAmbar';
import { Toast, type ToastEstado } from '@/components/Toast';

type Paso = 'tipo' | 'sigue' | 'cuando' | 'cuandoDia' | 'severidad' | 'queHicieron' | 'contencion';

// El tipo "tos débil" se registra desde el checklist del cuidador (A4);
// aquí se ofrecen los 8 tipos del flujo de paciente (§6.2).
const TIPOS_PACIENTE: TipoEpisodio[] = [
  'caida',
  'atragantamiento',
  'disnea',
  'laringoespasmo',
  'pseudobulbar',
  'crisis_emocional',
  'infeccion',
  'otro',
];

interface EpisodioProps {
  perfil: Perfil;
  rol: Rol;
}

export function Episodio({ perfil, rol }: EpisodioProps) {
  const { ir, volver, aInicio } = useApp();
  const [paso, setPaso] = useState<Paso>('tipo');
  const [tipo, setTipo] = useState<TipoEpisodio>();
  const [cuando, setCuando] = useState<string>();
  const [esAhora, setEsAhora] = useState(false);
  const [severidad, setSeveridad] = useState<EpisodioModelo['severidad']>();
  const [queHicieron, setQueHicieron] = useState('');
  const [audioRef, setAudioRef] = useState<string>();
  const [escribiendo, setEscribiendo] = useState(false);
  const [error, setError] = useState<string>();
  const [ambar, setAmbar] = useState<BanderaDisparada>();
  const [contacto, setContacto] = useState<Contacto>();
  const [guardado, setGuardado] = useState<EpisodioModelo>();
  const [toast, setToast] = useState<ToastEstado>();
  // Guarda anti-doble-toque: dos toques rápidos no deben duplicar el episodio
  // (dos atragantamientos falsos dispararían A5 de inmediato).
  const guardando = useRef(false);

  const retroceder = () => {
    const orden: Paso[] = ['tipo', 'sigue', 'cuando', 'cuandoDia', 'severidad', 'queHicieron'];
    const idx = orden.indexOf(paso);
    if (idx <= 0) return volver();
    // 'sigue' y 'cuandoDia' son subpasos: retroceden a su paso principal.
    if (paso === 'sigue') return setPaso('tipo');
    if (paso === 'cuandoDia') return setPaso('cuando');
    if (paso === 'cuando') return setPaso('tipo');
    if (paso === 'severidad') return setPaso('cuando');
    if (paso === 'queHicieron') return setPaso('severidad');
  };

  async function guardar(extra: Partial<EpisodioModelo> = {}) {
    if (!tipo || guardado) return guardado;
    const registro: EpisodioModelo = {
      id: nuevoId(),
      tipo,
      cuando: cuando ?? ahoraISO(),
      severidad: severidad ?? 'moderado',
      queHicieron: queHicieron || undefined,
      audioRef,
      resueltoEnElMomento: true,
      llenado: { por: rol, fecha: ahoraISO() },
      banderas: [],
      ...extra,
    };
    try {
      await db.episodios.add(registro);
      setGuardado(registro);
      return registro;
    } catch {
      setError(comun.errorGuardar);
      return undefined;
    }
  }

  /** R3: atragantamiento que no cede → roja inmediata, el registro se completa después. */
  async function responderSigue(sigue: boolean) {
    if (guardando.current) return;
    guardando.current = true;
    try {
      await responderSigueInterno(sigue);
    } finally {
      guardando.current = false;
    }
  }

  async function responderSigueInterno(sigue: boolean) {
    if (sigue) {
      const registro = await guardar({
        cuando: ahoraISO(),
        resueltoEnElMomento: false,
        severidad: 'fuerte',
      });
      if (registro) {
        const res = await procesarBanderas({
          episodioNuevo: registro,
          atragantamientoSigue: true,
        });
        if (res.rojas.length > 0) {
          await db.episodios.update(registro.id, {
            banderas: res.rojas.map((r) => r.regla.id),
          });
          ir({ id: 'banderaRoja', reglaId: res.rojas[0].regla.id });
          return;
        }
      }
    }
    setPaso('cuando');
  }

  /** R2: disnea "ahora" → roja directa antes de pedir más datos (§6.2). */
  async function responderCuando(valor: 'ahora' | 'hoy' | 'otro') {
    if (guardando.current) return;
    guardando.current = true;
    try {
      await responderCuandoInterno(valor);
    } finally {
      guardando.current = false;
    }
  }

  async function responderCuandoInterno(valor: 'ahora' | 'hoy' | 'otro') {
    if (valor === 'ahora') {
      setEsAhora(true);
      setCuando(ahoraISO());
      if (tipo === 'disnea') {
        const registro = await guardar({ cuando: ahoraISO(), severidad: 'fuerte' });
        if (registro) {
          const res = await procesarBanderas({
            episodioNuevo: registro,
            episodioEsAhora: true,
          });
          if (res.rojas.length > 0) {
            await db.episodios.update(registro.id, {
              banderas: res.rojas.map((r) => r.regla.id),
            });
            ir({ id: 'banderaRoja', reglaId: res.rojas[0].regla.id });
            return;
          }
        }
      }
      setPaso('severidad');
      return;
    }
    if (valor === 'hoy') {
      setEsAhora(false);
      setCuando(`${hoyLocal()}T08:00:00`);
      setPaso('severidad');
      return;
    }
    setPaso('cuandoDia');
  }

  async function cerrarYEvaluar() {
    if (guardando.current) return;
    guardando.current = true;
    try {
      await cerrarYEvaluarInterno();
    } finally {
      guardando.current = false;
    }
  }

  async function cerrarYEvaluarInterno() {
    const registro = guardado ?? (await guardar());
    if (!registro) return;
    const res = await procesarBanderas({
      episodioNuevo: registro,
      episodioEsAhora: esAhora,
    });
    if (res.rojas.length > 0) {
      ir({ id: 'banderaRoja', reglaId: res.rojas[0].regla.id });
      return;
    }
    const mc = microcopyEpisodios[registro.tipo];
    if (mc.contactoTema) {
      setContacto(await contactoParaTema(mc.contactoTema));
    }
    if (res.ambar) {
      await db.episodios.update(registro.id, { banderas: [res.ambar.regla.id] });
    }
    setAmbar(res.ambar);
    if (!res.ambar) {
      // Deshacer durante 6 s (§3.1): un registro por error se puede retirar.
      setToast({
        mensaje: comun.guardado,
        onDeshacer: () => {
          void db.episodios.delete(registro.id).then(aInicio);
        },
      });
    }
    setPaso('contencion');
  }

  // ——— Pantallas ———

  if (paso === 'tipo') {
    return (
      <CardQuestion pregunta={copy.quePaso} onVolver={retroceder}>
        <div className="flex flex-col gap-3">
          {TIPOS_PACIENTE.map((tp) => (
            <BigChoice
              key={tp}
              ancho
              emoji={etiquetasEpisodio[tp].emoji}
              etiqueta={etiquetasEpisodio[tp].etiqueta}
              seleccionado={tipo === tp}
              onSelect={() => {
                setTipo(tp);
                // Atragantamiento pregunta primero si ya cedió (R3).
                if (tp === 'atragantamiento') setPaso('sigue');
                else setPaso('cuando');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'sigue') {
    return (
      <CardQuestion pregunta={t(copy.sigueAtorada, perfil.tratamiento)} onVolver={retroceder}>
        <div className="flex flex-col gap-3">
          <BigChoice ancho etiqueta={copy.yaPaso} onSelect={() => void responderSigue(false)} />
          <BigChoice ancho etiqueta={copy.sigue} onSelect={() => void responderSigue(true)} />
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'cuando') {
    return (
      <CardQuestion pregunta={copy.cuando} onVolver={retroceder}>
        <div className="flex flex-col gap-3">
          {copy.cuandoOpciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              etiqueta={o.etiqueta}
              onSelect={() => void responderCuando(o.valor as 'ahora' | 'hoy' | 'otro')}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'cuandoDia') {
    const hoy = hoyLocal();
    const opciones = [
      { etiqueta: copy.ayer, fecha: sumarDias(hoy, -1) },
      { etiqueta: copy.anteayer, fecha: sumarDias(hoy, -2) },
      { etiqueta: copy.haceUnosDias, fecha: sumarDias(hoy, -4) },
    ];
    return (
      <CardQuestion pregunta={copy.elegirDia} onVolver={retroceder}>
        <div className="flex flex-col gap-3">
          {opciones.map((o) => (
            <BigChoice
              key={o.etiqueta}
              ancho
              etiqueta={o.etiqueta}
              onSelect={() => {
                setEsAhora(false);
                setCuando(`${o.fecha}T12:00:00`);
                setPaso('severidad');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'severidad') {
    return (
      <CardQuestion pregunta={copy.queTanFuerte} onVolver={retroceder}>
        <div className="flex flex-col gap-3">
          {copy.severidad.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              etiqueta={o.etiqueta}
              seleccionado={severidad === o.valor}
              onSelect={() => {
                setSeveridad(o.valor as EpisodioModelo['severidad']);
                setPaso('queHicieron');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'queHicieron') {
    return (
      <CardQuestion
        pregunta={copy.queHicieron}
        onVolver={retroceder}
        onPasar={() => void cerrarYEvaluar()}
        pie={<PrimaryButton onClick={() => void cerrarYEvaluar()}>{comun.guardar}</PrimaryButton>}
      >
        <p className="text-min text-tinta-suave">
          {t(copy.queHicieronDetalle, perfil.tratamiento)}
        </p>
        <NotaVozBoton
          origen="episodio"
          trato={perfil.tratamiento}
          onNota={(nota) => {
            setAudioRef(nota.id);
            if (nota.transcripcion) setQueHicieron(nota.transcripcion);
          }}
          onError={setError}
        />
        {escribiendo ? (
          <textarea
            value={queHicieron}
            onChange={(e) => setQueHicieron(e.target.value)}
            rows={3}
            aria-label={copy.queHicieron}
            className="w-full rounded-token border-2 border-tinta-suave/20 bg-superficie p-4 text-base"
          />
        ) : (
          <BigChoice ancho etiqueta={comun.escribir} onSelect={() => setEscribiendo(true)} />
        )}
        {error ? <p className="text-base text-rojo">{error}</p> : null}
      </CardQuestion>
    );
  }

  // paso === 'contencion' — microcopy de calma por tipo (§6.2) + ámbar si aplica.
  if (ambar) {
    return <TarjetaAmbar disparada={ambar} onCerrada={() => setAmbar(undefined)} />;
  }
  const mc = tipo ? microcopyEpisodios[tipo] : undefined;
  const mensaje = mc
    ? interpolar(t(mc.mensaje, perfil.tratamiento), {
        contacto:
          contacto?.nombre ?? (perfil.tratamiento === 'tu' ? 'tu equipo' : 'su equipo'),
      })
    : comun.listo;
  return (
    <div className="transicion-tarjeta flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8">
      <p className="text-center text-base font-bold text-exito">{copy.guardadoEpisodio}</p>
      <div className="rounded-token bg-superficie p-5">
        <p className="text-base text-tinta">{mensaje}</p>
      </div>
      {mc?.contactoTema && contacto ? (
        <a
          href={`tel:${contacto.telefono}`}
          className="flex min-h-chip w-full items-center justify-center rounded-token
            border-2 border-primario bg-superficie text-boton font-bold text-primario no-underline"
        >
          📞 {comun.llamar}: {contacto.nombre}
        </a>
      ) : null}
      {mc?.botonRojoVisible ? (
        <button
          type="button"
          onClick={() => {
            void procesarBanderas({ sosPresionado: true }).then(() =>
              ir({ id: 'banderaRoja', reglaId: 'R4' }),
            );
          }}
          className="min-h-chip w-full rounded-token bg-rojo px-4 text-boton font-bold text-white"
        >
          🚨 {banderasCopy.roja.botonUrgencia}
        </button>
      ) : null}
      <PrimaryButton onClick={aInicio}>{comun.seguir}</PrimaryButton>
      <Toast estado={toast} onCerrar={() => setToast(undefined)} />
    </div>
  );
}
