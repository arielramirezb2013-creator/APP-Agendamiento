// Check-in diario "¿Cómo amaneció?" (§6.1): una pregunta por pantalla,
// fichas grandes, todas omitibles con "Pasar", ≤90 segundos.
// Bandera roja interrumpe de inmediato (R1); la ámbar espera al cierre.

import { useEffect, useMemo, useRef, useState } from 'react';
import { BigChoice } from '@/components/BigChoice';
import { CardQuestion } from '@/components/CardQuestion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { NotaVozBoton } from '@/components/NotaVozBoton';
import { checkin as copy, comun, interpolar, t } from '@/content/es-CO';
import { ahoraISO, db, hoyLocal, nuevoId } from '@/db/dexie';
import { procesarBanderas } from '@/services/banderas';
import type { BanderaDisparada } from '@/rules/flags';
import type { CheckinDiario, Perfil, Rol, SenalSueno } from '@/types/models';
import { useApp } from '@/store';
import { TarjetaAmbar } from '@/features/banderas/TarjetaAmbar';

type Paso =
  | 'animo'
  | 'dolor'
  | 'dolorZonas'
  | 'respiracion'
  | 'respiracionAhora'
  | 'sueno'
  | 'suenoSenales'
  | 'tragar'
  | 'saliva'
  | 'habla'
  | 'movilidad'
  | 'fatiga'
  | 'nota'
  | 'cierre';

const ORDEN: Paso[] = [
  'animo',
  'dolor',
  'respiracion',
  'sueno',
  'tragar',
  'saliva',
  'habla',
  'movilidad',
  'fatiga',
  'nota',
];

const TOTAL_PREGUNTAS = ORDEN.length;

interface CheckinProps {
  perfil: Perfil;
  rol: Rol;
}

export function Checkin({ perfil, rol }: CheckinProps) {
  const { ir, volver, aInicio } = useApp();
  const trato = perfil.tratamiento;
  const [paso, setPaso] = useState<Paso>('animo');
  const [datos, setDatos] = useState<Partial<CheckinDiario>>({});
  const [zonas, setZonas] = useState<string[]>([]);
  const [senales, setSenales] = useState<SenalSueno[]>([]);
  const [textoNota, setTextoNota] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [ambar, setAmbar] = useState<BanderaDisparada>();
  const [error, setError] = useState<string>();
  // Un doble toque (frecuente con motricidad reducida, E2) no debe guardar dos veces.
  const guardando = useRef(false);

  // Un check-in por día, editable (§6.1): precarga si ya existe.
  useEffect(() => {
    void db.checkins.where('fecha').equals(hoyLocal()).first().then((existente) => {
      if (existente) {
        setDatos(existente);
        setZonas(existente.dolor?.zonas ?? []);
        setSenales(existente.sueno?.senales ?? []);
        setTextoNota(existente.nota?.texto ?? '');
      }
    });
  }, []);

  const numeroPregunta = useMemo(() => {
    const base: Record<string, number> = {
      animo: 1,
      dolor: 2,
      dolorZonas: 2,
      respiracion: 3,
      respiracionAhora: 3,
      sueno: 4,
      suenoSenales: 4,
      tragar: 5,
      saliva: 6,
      habla: 7,
      movilidad: 8,
      fatiga: 9,
      nota: 10,
    };
    return base[paso] ?? TOTAL_PREGUNTAS;
  }, [paso]);

  const progreso = interpolar(copy.progreso, {
    n: String(numeroPregunta),
    total: String(TOTAL_PREGUNTAS),
  });

  const avanzar = (desde: Paso) => {
    const principal = ORDEN.indexOf(
      desde === 'dolorZonas'
        ? 'dolor'
        : desde === 'respiracionAhora'
          ? 'respiracion'
          : desde === 'suenoSenales'
            ? 'sueno'
            : desde,
    );
    const siguiente = ORDEN[principal + 1];
    if (siguiente) setPaso(siguiente);
    else void cerrar();
  };

  const retroceder = () => {
    if (paso === 'dolorZonas') return setPaso('dolor');
    if (paso === 'respiracionAhora') return setPaso('respiracion');
    if (paso === 'suenoSenales') return setPaso('sueno');
    const idx = ORDEN.indexOf(paso);
    if (idx > 0) setPaso(ORDEN[idx - 1]);
    else volver();
  };

  async function persistir(parcial: Partial<CheckinDiario>): Promise<CheckinDiario> {
    const hoy = hoyLocal();
    const existente = await db.checkins.where('fecha').equals(hoy).first();
    const registro: CheckinDiario = {
      id: existente?.id ?? nuevoId(),
      fecha: hoy,
      banderas: existente?.banderas ?? [],
      ...existente,
      ...parcial,
      llenado: { por: rol, fecha: ahoraISO() },
    };
    await db.checkins.put(registro);
    return registro;
  }

  /** R1: "me falta mucho el aire" + "me está pasando ahora" → roja inmediata. */
  async function confirmarRespiracionAhora(ahora: boolean) {
    const nuevos = { ...datos, respiracion: 'mucho' as const };
    setDatos(nuevos);
    if (!ahora) return avanzar('respiracionAhora');
    if (guardando.current) return;
    guardando.current = true;
    const registro = await persistir(nuevos);
    const res = await procesarBanderas({
      checkinHoy: registro,
      respiracionAhora: true,
    });
    if (res.rojas.length > 0) {
      await db.checkins.update(registro.id, {
        banderas: [...new Set([...registro.banderas, ...res.rojas.map((r) => r.regla.id)])],
      });
      ir({ id: 'banderaRoja', reglaId: res.rojas[0].regla.id });
    } else {
      guardando.current = false;
      avanzar('respiracionAhora');
    }
  }

  /**
   * Cierra y persiste. `extra` permite pasar datos recién producidos (p. ej. la
   * nota de voz) SIN depender del estado de React, que aún no se actualizó.
   */
  async function cerrar(extra: Partial<CheckinDiario> = {}) {
    if (guardando.current) return;
    guardando.current = true;
    try {
      const registro = await persistir({
        ...datos,
        nota: textoNota ? { ...datos.nota, texto: textoNota } : datos.nota,
        ...extra,
      });
      const res = await procesarBanderas({ checkinHoy: registro });
      const ids = [
        ...res.rojas.map((r) => r.regla.id),
        ...(res.ambar ? [res.ambar.regla.id] : []),
      ];
      if (ids.length) {
        await db.checkins.update(registro.id, {
          banderas: [...new Set([...registro.banderas, ...ids])],
        });
      }
      if (res.rojas.length > 0) {
        ir({ id: 'banderaRoja', reglaId: res.rojas[0].regla.id });
        return;
      }
      setAmbar(res.ambar);
      setPaso('cierre');
    } catch {
      setError(comun.errorGuardar);
      setPaso('cierre');
    } finally {
      guardando.current = false;
    }
  }

  // ——— Cierre: agradecimiento + tarjeta ámbar si aplica (§6.1) ———
  if (paso === 'cierre') {
    if (ambar) {
      return <TarjetaAmbar disparada={ambar} onCerrada={() => setAmbar(undefined)} />;
    }
    return (
      <div className="transicion-tarjeta flex min-h-dvh flex-col justify-center gap-8 bg-fondo px-4 py-8 text-center">
        <p className="font-titular text-saludo text-tinta">
          {interpolar(t(copy.cierre, trato), { nombre: perfil.nombre })}
        </p>
        {error ? <p className="text-base text-rojo">{error}</p> : null}
        <PrimaryButton onClick={aInicio}>{copy.volverInicio}</PrimaryButton>
      </div>
    );
  }

  // ——— Preguntas, una por pantalla ———

  if (paso === 'animo') {
    return (
      <CardQuestion
        pregunta={t(copy.animo.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('animo')}
      >
        <div className="flex flex-col gap-3" role="group" aria-label={t(copy.animo.pregunta, trato)}>
          {copy.animo.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              emoji={o.emoji}
              etiqueta={o.etiqueta}
              seleccionado={datos.animo === o.valor}
              onSelect={() => {
                setDatos((d) => ({ ...d, animo: o.valor as CheckinDiario['animo'] }));
                avanzar('animo');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'dolor') {
    // El dolor no siempre se menciona espontáneamente → se pregunta SIEMPRE (§2.2-1).
    return (
      <CardQuestion
        pregunta={t(copy.dolor.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('dolor')}
      >
        <div className="grid grid-cols-2 gap-3">
          {copy.dolor.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              etiqueta={o.etiqueta}
              seleccionado={datos.dolor?.nivel === o.valor}
              onSelect={() => {
                const nivel = o.valor as 0 | 1 | 2 | 3;
                setDatos((d) => ({ ...d, dolor: { nivel, zonas: nivel ? zonas : [] } }));
                if (nivel === 0) avanzar('dolor');
                else setPaso('dolorZonas');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'dolorZonas') {
    const preguntaZonas = trato === 'tu' ? copy.dolor.dondeTu : copy.dolor.donde;
    return (
      <CardQuestion
        pregunta={preguntaZonas}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => {
          // "Pasar" no descarta lo ya marcado: las zonas elegidas se conservan.
          setDatos((d) => ({ ...d, dolor: { nivel: d.dolor?.nivel ?? 1, zonas } }));
          avanzar('dolorZonas');
        }}
        pie={
          <PrimaryButton
            onClick={() => {
              setDatos((d) => ({
                ...d,
                dolor: { nivel: d.dolor?.nivel ?? 1, zonas },
              }));
              avanzar('dolorZonas');
            }}
          >
            {copy.dolor.listoZonas}
          </PrimaryButton>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          {copy.dolor.zonas.map((z) => (
            <BigChoice
              key={z}
              etiqueta={z}
              seleccionado={zonas.includes(z)}
              onSelect={() =>
                setZonas((prev) =>
                  prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z],
                )
              }
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'respiracion') {
    return (
      <CardQuestion
        pregunta={t(copy.respiracion.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('respiracion')}
      >
        <div className="flex flex-col gap-3">
          {copy.respiracion.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              emoji={o.emoji}
              etiqueta={o.etiqueta}
              seleccionado={datos.respiracion === o.valor}
              onSelect={() => {
                const valor = o.valor as CheckinDiario['respiracion'];
                setDatos((d) => ({ ...d, respiracion: valor }));
                if (valor === 'mucho') setPaso('respiracionAhora');
                else avanzar('respiracion');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'respiracionAhora') {
    return (
      <CardQuestion
        pregunta={t(copy.respiracion.confirmarAhora, trato)}
        progreso={progreso}
        onVolver={retroceder}
      >
        <div className="flex flex-col gap-3">
          <BigChoice
            ancho
            etiqueta={copy.respiracion.ahoraSi}
            onSelect={() => void confirmarRespiracionAhora(true)}
          />
          <BigChoice
            ancho
            etiqueta={copy.respiracion.ahoraNo}
            onSelect={() => void confirmarRespiracionAhora(false)}
          />
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'sueno') {
    return (
      <CardQuestion
        pregunta={t(copy.sueno.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('sueno')}
      >
        <div className="flex flex-col gap-3">
          {copy.sueno.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              emoji={o.emoji}
              etiqueta={o.etiqueta}
              seleccionado={datos.sueno?.calidad === o.valor}
              onSelect={() => {
                const calidad = o.valor as 'bien' | 'regular' | 'mal';
                // "Bien" limpia señales previas: si corrige la respuesta, no
                // deben quedar ortopnea/cefalea huérfanas que disparen A1/A2.
                if (calidad === 'bien') {
                  setSenales([]);
                  setDatos((d) => ({ ...d, sueno: { calidad, senales: [] } }));
                  avanzar('sueno');
                } else {
                  setDatos((d) => ({ ...d, sueno: { calidad, senales } }));
                  setPaso('suenoSenales');
                }
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'suenoSenales') {
    return (
      <CardQuestion
        pregunta={copy.sueno.quePaso}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => {
          // "Pasar" no descarta señales NICE ya marcadas (ortopnea/cefalea → A1/A2).
          setDatos((d) => ({
            ...d,
            sueno: { calidad: d.sueno?.calidad ?? 'regular', senales },
          }));
          avanzar('suenoSenales');
        }}
        pie={
          <PrimaryButton
            onClick={() => {
              setDatos((d) => ({
                ...d,
                sueno: { calidad: d.sueno?.calidad ?? 'regular', senales },
              }));
              avanzar('suenoSenales');
            }}
          >
            {copy.sueno.listoSenales}
          </PrimaryButton>
        }
      >
        <p className="text-min text-tinta-suave">
          {trato === 'tu' ? copy.sueno.puedeMarcarVariasTu : copy.sueno.puedeMarcarVarias}
        </p>
        <div className="flex flex-col gap-3">
          {copy.sueno.senales.map((s) => (
            <BigChoice
              key={s.valor}
              ancho
              etiqueta={s.etiqueta}
              seleccionado={senales.includes(s.valor as SenalSueno)}
              onSelect={() =>
                setSenales((prev) =>
                  prev.includes(s.valor as SenalSueno)
                    ? prev.filter((x) => x !== s.valor)
                    : [...prev, s.valor as SenalSueno],
                )
              }
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'tragar') {
    return (
      <CardQuestion
        pregunta={t(copy.tragar.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('tragar')}
      >
        <div className="flex flex-col gap-3">
          {copy.tragar.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              etiqueta={o.etiqueta}
              seleccionado={datos.tragar === o.valor}
              onSelect={() => {
                setDatos((d) => ({ ...d, tragar: o.valor as CheckinDiario['tragar'] }));
                avanzar('tragar');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'saliva') {
    // Volumen y viscosidad se registran por separado (§2.2-4).
    return (
      <CardQuestion
        pregunta={t(copy.saliva.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('saliva')}
      >
        <div className="flex flex-col gap-3">
          {copy.saliva.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              etiqueta={o.etiqueta}
              seleccionado={datos.saliva === o.valor}
              onSelect={() => {
                setDatos((d) => ({ ...d, saliva: o.valor as CheckinDiario['saliva'] }));
                avanzar('saliva');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'habla') {
    // Dominio bulbar (ruta fonoaudiología, regla A13).
    return (
      <CardQuestion
        pregunta={t(copy.habla.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('habla')}
      >
        <div className="flex flex-col gap-3">
          {copy.habla.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              etiqueta={o.etiqueta}
              seleccionado={datos.habla === o.valor}
              onSelect={() => {
                setDatos((d) => ({ ...d, habla: o.valor as CheckinDiario['habla'] }));
                avanzar('habla');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'movilidad') {
    // Ruta fisioterapia (regla A14).
    return (
      <CardQuestion
        pregunta={t(copy.movilidad.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('movilidad')}
      >
        <div className="flex flex-col gap-3">
          {copy.movilidad.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              etiqueta={o.etiqueta}
              seleccionado={datos.movilidad === o.valor}
              onSelect={() => {
                setDatos((d) => ({
                  ...d,
                  movilidad: o.valor as CheckinDiario['movilidad'],
                }));
                avanzar('movilidad');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  if (paso === 'fatiga') {
    return (
      <CardQuestion
        pregunta={t(copy.fatiga.pregunta, trato)}
        progreso={progreso}
        onVolver={retroceder}
        onPasar={() => avanzar('fatiga')}
      >
        <div className="flex flex-col gap-3">
          {copy.fatiga.opciones.map((o) => (
            <BigChoice
              key={o.valor}
              ancho
              emoji={o.emoji}
              etiqueta={o.etiqueta}
              seleccionado={datos.fatiga === o.valor}
              onSelect={() => {
                setDatos((d) => ({ ...d, fatiga: o.valor as CheckinDiario['fatiga'] }));
                avanzar('fatiga');
              }}
            />
          ))}
        </div>
      </CardQuestion>
    );
  }

  // paso === 'nota' — ánimo abierto opcional (§6.1-8)
  return (
    <CardQuestion
      pregunta={t(copy.nota.pregunta, trato)}
      progreso={progreso}
      onVolver={retroceder}
      pie={
        escribiendo || textoNota ? (
          <PrimaryButton onClick={() => void cerrar()}>{comun.guardar}</PrimaryButton>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3">
        <NotaVozBoton
          origen="checkin"
          trato={trato}
          onNota={(nota) => {
            // La nota se pasa DIRECTO a cerrar(): el setState de React es
            // asíncrono y `datos` aún no la tendría al persistir.
            const notaFinal = {
              ...datos.nota,
              audioRef: nota.id,
              texto: nota.transcripcion ?? textoNota ?? datos.nota?.texto,
            };
            setDatos((d) => ({ ...d, nota: notaFinal }));
            void cerrar({ nota: notaFinal });
          }}
          onError={(m) => setError(m)}
        />
        {escribiendo ? (
          <textarea
            value={textoNota}
            onChange={(e) => setTextoNota(e.target.value)}
            rows={4}
            aria-label={t(copy.nota.pregunta, trato)}
            placeholder={t(copy.nota.placeholder, trato)}
            className="w-full rounded-token border-2 border-tinta-suave/20 bg-superficie p-4 text-base"
          />
        ) : (
          <BigChoice ancho etiqueta={comun.escribir} onSelect={() => setEscribiendo(true)} />
        )}
        <BigChoice ancho etiqueta={comun.noGracias} onSelect={() => void cerrar()} />
        {error ? <p className="text-base text-rojo">{error}</p> : null}
      </div>
    </CardQuestion>
  );
}
