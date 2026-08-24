// Comunidad (pedida por la familia): grupos por tema, experiencias compartidas
// con sello de "no es consejo médico", lugares y clínicas con mapa (nacional e
// internacional) y "contar mi experiencia" (voz o texto). En el MVP sin
// servidor las experiencias ajenas son contenido curado de ejemplo y las
// propias viven en el aparato; la conversación directa llega con la fase en
// línea. La salvaguarda §3.3 sigue viva: nada de medicamentos ni dosis.

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BigChoice } from '@/components/BigChoice';
import { CardQuestion } from '@/components/CardQuestion';
import { Insignia } from '@/components/Insignia';
import { PrimaryButton } from '@/components/PrimaryButton';
import { NotaVozBoton } from '@/components/NotaVozBoton';
import { comun, comunidad as copy, t } from '@/content/es-CO';
import {
  ETIQUETA_ROL,
  ETIQUETA_TIPO_LUGAR,
  EXPERIENCIAS_EJEMPLO,
  GRUPOS,
  LUGARES,
} from '@/content/comunidad';
import { ahoraISO, db, nuevoId } from '@/db/dexie';
import type { Perfil, PublicacionComunidad, Rol } from '@/types/models';
import { useApp } from '@/store';

interface ComunidadProps {
  perfil: Perfil;
  rol: Rol;
}

type Paso = 'muro' | 'escribir' | 'grupo' | 'publicada';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaCorta = (iso: string) =>
  `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]}`;

export function Comunidad({ perfil, rol }: ComunidadProps) {
  const { volver } = useApp();
  const trato = perfil.tratamiento;
  const [paso, setPaso] = useState<Paso>('muro');
  const [grupoActivo, setGrupoActivo] = useState<string>();
  const [texto, setTexto] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [error, setError] = useState<string>();
  // "Me sirvió" local a la sesión (los conteos reales llegan con la fase en línea).
  const [corazones, setCorazones] = useState<Set<string>>(new Set());
  const [notaConversar, setNotaConversar] = useState<string>();

  const propias =
    useLiveQuery(() => db.publicaciones.orderBy('fechaHora').reverse().toArray(), []) ?? [];

  const todas: PublicacionComunidad[] = [...propias, ...EXPERIENCIAS_EJEMPLO].sort(
    (a, b) => b.fechaHora.localeCompare(a.fechaHora),
  );
  const visibles = grupoActivo ? todas.filter((p) => p.grupo === grupoActivo) : todas;

  async function publicar(grupo: string) {
    const registro: PublicacionComunidad = {
      id: nuevoId(),
      fechaHora: ahoraISO(),
      autor: perfil.nombre,
      rolAutor: rol === 'cuidador' ? 'cuidador' : 'persona',
      grupo,
      texto: texto.trim(),
      meSirvio: 0,
      esEjemplo: false,
      llenado: { por: rol, fecha: ahoraISO() },
    };
    try {
      await db.publicaciones.add(registro);
      setPaso('publicada');
    } catch {
      setError(comun.errorGuardar);
    }
  }

  if (paso === 'escribir') {
    return (
      <CardQuestion
        pregunta={t(copy.compartirPregunta, trato)}
        onVolver={() => setPaso('muro')}
        pie={
          <PrimaryButton onClick={() => setPaso('grupo')} deshabilitado={!texto.trim()}>
            {comun.seguir}
          </PrimaryButton>
        }
      >
        <p className="text-min text-tinta-suave">{t(copy.compartirDetalle, trato)}</p>
        <NotaVozBoton
          origen="episodio"
          trato={trato}
          onNota={(nota) => {
            if (nota.transcripcion) setTexto(nota.transcripcion);
            setEscribiendo(true);
          }}
          onError={setError}
        />
        {escribiendo || texto ? (
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            aria-label={t(copy.compartirPregunta, trato)}
            className="w-full rounded-token bg-superficie p-4 text-base"
          />
        ) : (
          <BigChoice ancho etiqueta={comun.escribir} onSelect={() => setEscribiendo(true)} />
        )}
        {error ? <p className="text-base text-rojo">{error}</p> : null}
      </CardQuestion>
    );
  }

  if (paso === 'grupo') {
    return (
      <CardQuestion pregunta={copy.elegirGrupo} onVolver={() => setPaso('escribir')}>
        <div className="flex flex-col gap-3">
          {GRUPOS.map((g) => (
            <BigChoice
              key={g.clave}
              ancho
              emoji={g.emoji}
              etiqueta={g.nombre}
              onSelect={() => void publicar(g.clave)}
            />
          ))}
        </div>
        {error ? <p className="text-base text-rojo">{error}</p> : null}
      </CardQuestion>
    );
  }

  if (paso === 'publicada') {
    return (
      <div className="transicion-tarjeta flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8 text-center">
        <p className="font-titular text-pregunta font-semibold text-exito">{copy.publicada}</p>
        <PrimaryButton
          onClick={() => {
            setTexto('');
            setPaso('muro');
          }}
        >
          {comun.seguir}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="transicion-tarjeta flex min-h-dvh flex-col gap-4 bg-fondo px-4 py-4">
      <header className="flex min-h-chip items-center gap-2">
        <button
          type="button"
          onClick={volver}
          className="min-h-chip min-w-chip rounded-token px-3 text-boton text-tinta"
        >
          {comun.volver}
        </button>
        <Insignia emoji="💬" />
        <h1 className="font-titular text-pregunta font-semibold text-tinta">{copy.titulo}</h1>
      </header>
      <p className="text-min text-tinta-suave">{t(copy.intro, trato)}</p>
      <p className="rounded-token bg-ambar-fondo px-4 py-3 text-min text-tinta">
        🕊️ {copy.enLineaNota}
      </p>

      <PrimaryButton onClick={() => setPaso('escribir')}>
        ✍️ {copy.compartir}
      </PrimaryButton>

      {/* Grupos por tema */}
      <section className="flex flex-col gap-2">
        <h2 className="font-titular text-base font-semibold text-tinta">{copy.grupos}</h2>
        <div className="grid grid-cols-2 gap-2">
          <BigChoice
            etiqueta={copy.todos}
            seleccionado={!grupoActivo}
            onSelect={() => setGrupoActivo(undefined)}
          />
          {GRUPOS.map((g) => (
            <BigChoice
              key={g.clave}
              emoji={g.emoji}
              etiqueta={g.nombre}
              seleccionado={grupoActivo === g.clave}
              onSelect={() =>
                setGrupoActivo((prev) => (prev === g.clave ? undefined : g.clave))
              }
            />
          ))}
        </div>
      </section>

      {/* Experiencias */}
      <section className="flex flex-col gap-3">
        <h2 className="font-titular text-base font-semibold text-tinta">{copy.experiencias}</h2>
        {visibles.length === 0 ? (
          <p className="text-base text-tinta-suave">{copy.sinPublicaciones}</p>
        ) : (
          visibles.map((p) => {
            const rolInfo = ETIQUETA_ROL[p.rolAutor];
            const grupo = GRUPOS.find((g) => g.clave === p.grupo);
            const conCorazon = corazones.has(p.id);
            return (
              <article key={p.id} className="flex flex-col gap-2 rounded-token bg-superficie p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Insignia emoji={rolInfo.emoji} />
                  <div className="min-w-0">
                    <p className="text-base font-bold text-tinta">{p.autor}</p>
                    <p className="text-[0.78rem] text-tinta-suave">
                      {rolInfo.etiqueta} · {grupo?.nombre ?? ''} · {fechaCorta(p.fechaHora)}
                      {p.esEjemplo ? ` · ${copy.ejemplo}` : ` · ${copy.tuya}`}
                    </p>
                  </div>
                </div>
                <p className="text-base leading-relaxed text-tinta">{p.texto}</p>
                <p className="text-[0.72rem] text-tinta-suave">{copy.selloExperiencia}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-pressed={conCorazon}
                    onClick={() =>
                      setCorazones((prev) => {
                        const s = new Set(prev);
                        if (s.has(p.id)) s.delete(p.id);
                        else s.add(p.id);
                        return s;
                      })
                    }
                    className={`min-h-chip flex-1 rounded-token px-3 text-boton font-bold
                      ${conCorazon ? 'bg-primario-suave text-primario' : 'bg-fondo text-tinta'}`}
                  >
                    {conCorazon ? '🧡' : '🤍'} {copy.meSirvio} ({p.meSirvio + (conCorazon ? 1 : 0)})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNotaConversar((prev) => (prev === p.id ? undefined : p.id))
                    }
                    className="min-h-chip flex-1 rounded-token bg-fondo px-3 text-boton font-bold text-tinta"
                  >
                    💬 {copy.conversar}
                  </button>
                </div>
                {notaConversar === p.id ? (
                  <p className="rounded-token bg-fondo px-3 py-2 text-min text-tinta-suave">
                    {copy.conversarNota}
                  </p>
                ) : null}
              </article>
            );
          })
        )}
      </section>

      {/* Lugares y clínicas: GPS vía el mapa del teléfono */}
      <section className="flex flex-col gap-2">
        <h2 className="font-titular text-base font-semibold text-tinta">📍 {copy.lugares}</h2>
        <p className="text-min text-tinta-suave">{copy.lugaresNota}</p>
        {LUGARES.map((l) => (
          <div key={l.id} className="flex flex-col gap-2 rounded-token bg-superficie p-4">
            <p className="text-base font-bold text-tinta">{l.nombre}</p>
            <p className="text-min text-tinta-suave">
              {ETIQUETA_TIPO_LUGAR[l.tipo]} · {l.ciudad ? `${l.ciudad}, ` : ''}
              {l.pais}
            </p>
            <p className="text-min text-tinta">{l.paraQue}</p>
            <div className="flex gap-2">
              {l.buscarEnMapa ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.buscarEnMapa)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-chip flex-1 items-center justify-center rounded-token
                    bg-primario text-boton font-bold text-white no-underline"
                >
                  🗺️ {copy.comoLlegar}
                </a>
              ) : null}
              {l.web ? (
                <a
                  href={l.web}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-chip flex-1 items-center justify-center rounded-token
                    bg-fondo text-boton font-bold text-primario no-underline"
                >
                  🌐 {copy.sitioWeb}
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
