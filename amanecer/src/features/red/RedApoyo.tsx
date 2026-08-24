// Mi red de apoyo: entidades LOCALES de la ciudad donde vive la persona y,
// si no existen, la red NACIONAL (ACELA) la acompaña igual. Desde aquí se
// puede llamar o enviar una inquietud: sale por WhatsApp (wa.me) y queda
// registrada en la app con su estado; el cuidador anota la respuesta.
// Guarda de alcance §14: la app es puente hacia canales reales, no chat propio.

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BigChoice } from '@/components/BigChoice';
import { CardQuestion } from '@/components/CardQuestion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { NotaVozBoton } from '@/components/NotaVozBoton';
import { comun, interpolar, redApoyo as copy, t } from '@/content/es-CO';
import { ahoraISO, db, nuevoId } from '@/db/dexie';
import type { Inquietud, OrganizacionApoyo, Perfil, Rol } from '@/types/models';
import { useApp } from '@/store';

interface RedApoyoProps {
  perfil: Perfil;
  rol: Rol;
}

type Paso = 'lista' | 'texto' | 'destino' | 'enviada';

export function RedApoyo({ perfil, rol }: RedApoyoProps) {
  const { volver } = useApp();
  const trato = perfil.tratamiento;
  const [paso, setPaso] = useState<Paso>('lista');
  const [texto, setTexto] = useState('');
  const [audioRef, setAudioRef] = useState<string>();
  const [escribiendo, setEscribiendo] = useState(false);
  const [destinoPre, setDestinoPre] = useState<OrganizacionApoyo>();
  const [error, setError] = useState<string>();

  const orgs = useLiveQuery(() => db.redApoyo.orderBy('orden').toArray(), []) ?? [];
  const inquietudes =
    useLiveQuery(() => db.inquietudes.orderBy('fechaHora').reverse().toArray(), []) ?? [];

  const ciudad = perfil.ciudad?.trim();
  const locales = ciudad
    ? orgs.filter(
        (o) => o.alcance === 'local' && o.ciudad?.toLowerCase() === ciudad.toLowerCase(),
      )
    : [];
  const nacionales = orgs.filter((o) => o.alcance === 'nacional');
  const conWhatsapp = orgs.filter((o) => o.whatsapp);

  async function enviar(destino: OrganizacionApoyo) {
    if (!texto.trim() || !destino.whatsapp) return;
    const registro: Inquietud = {
      id: nuevoId(),
      fechaHora: ahoraISO(),
      texto: texto.trim(),
      audioRef,
      destinoId: destino.id,
      destinoNombre: destino.nombre,
      canal: 'whatsapp',
      estado: 'enviada',
      llenado: { por: rol, fecha: ahoraISO() },
    };
    try {
      await db.inquietudes.add(registro);
    } catch {
      setError(comun.errorGuardar);
      return;
    }
    const mensaje = interpolar(copy.plantillaMensaje, {
      app: perfil.appName,
      nombre: perfil.nombre,
      texto: texto.trim(),
    });
    window.open(
      `https://wa.me/${destino.whatsapp}?text=${encodeURIComponent(mensaje)}`,
      '_blank',
      'noopener',
    );
    setPaso('enviada');
  }

  // ——— Escribir/dictar la inquietud ———
  if (paso === 'texto') {
    return (
      <CardQuestion
        pregunta={t(copy.escribaInquietud, trato)}
        onVolver={() => setPaso('lista')}
        pie={
          <PrimaryButton
            onClick={() => {
              if (destinoPre?.whatsapp) void enviar(destinoPre);
              else setPaso('destino');
            }}
            deshabilitado={!texto.trim()}
          >
            {destinoPre ? copy.enviarPorWhatsapp : comun.seguir}
          </PrimaryButton>
        }
      >
        <p className="text-min text-tinta-suave">{t(copy.inquietudDetalle, trato)}</p>
        <NotaVozBoton
          origen="episodio"
          trato={trato}
          onNota={(nota) => {
            setAudioRef(nota.id);
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
            aria-label={t(copy.escribaInquietud, trato)}
            className="w-full rounded-token border-2 border-tinta-suave/20 bg-superficie p-4 text-base"
          />
        ) : (
          <BigChoice ancho etiqueta={comun.escribir} onSelect={() => setEscribiendo(true)} />
        )}
        {error ? <p className="text-base text-rojo">{error}</p> : null}
      </CardQuestion>
    );
  }

  // ——— Elegir a quién ———
  if (paso === 'destino') {
    return (
      <CardQuestion pregunta={copy.aQuien} onVolver={() => setPaso('texto')}>
        <div className="flex flex-col gap-3">
          {conWhatsapp.map((o) => (
            <BigChoice
              key={o.id}
              ancho
              emoji="🤝"
              etiqueta={o.nombre}
              onSelect={() => void enviar(o)}
            />
          ))}
        </div>
        {error ? <p className="text-base text-rojo">{error}</p> : null}
      </CardQuestion>
    );
  }

  // ——— Confirmación de envío ———
  if (paso === 'enviada') {
    return (
      <div className="transicion-tarjeta flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8 text-center">
        <p className="text-pregunta font-bold text-exito">{copy.enviada}</p>
        <PrimaryButton
          onClick={() => {
            setTexto('');
            setAudioRef(undefined);
            setDestinoPre(undefined);
            setPaso('lista');
          }}
        >
          {comun.seguir}
        </PrimaryButton>
      </div>
    );
  }

  // ——— Lista principal ———
  const TarjetaOrg = ({ org }: { org: OrganizacionApoyo }) => (
    <div className="flex flex-col gap-2 rounded-token bg-superficie p-4">
      <p className="text-boton font-bold text-tinta">{org.nombre}</p>
      <p className="text-min text-tinta-suave">{org.paraQue}</p>
      <div className="flex flex-col gap-2">
        {org.telefono ? (
          <a
            href={`tel:${org.telefono}`}
            className="flex min-h-chip items-center justify-center rounded-token bg-primario
              text-boton font-bold text-white no-underline"
          >
            📞 {comun.llamar}
          </a>
        ) : null}
        {org.whatsapp ? (
          <button
            type="button"
            onClick={() => {
              setDestinoPre(org);
              setPaso('texto');
            }}
            className="min-h-chip rounded-token border-2 border-primario bg-superficie
              text-boton font-bold text-primario"
          >
            ✉️ {copy.preguntarAlgo}
          </button>
        ) : (
          <p className="text-min text-tinta-suave">{copy.soloLlamada}</p>
        )}
      </div>
    </div>
  );

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
        <h1 className="text-pregunta font-bold text-tinta">🤝 {copy.titulo}</h1>
      </header>
      <p className="text-min text-tinta-suave">{t(copy.intro, trato)}</p>

      {ciudad ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-tinta-suave">
            {interpolar(trato === 'tu' ? copy.cercaDeTi : copy.cercaDeUsted, { ciudad })}
          </h2>
          {locales.length > 0 ? (
            locales.map((o) => <TarjetaOrg key={o.id} org={o} />)
          ) : (
            <p className="rounded-token bg-ambar-fondo p-4 text-base text-tinta">
              {interpolar(copy.sinLocales, { ciudad })}
            </p>
          )}
        </section>
      ) : (
        <p className="text-min text-tinta-suave">{copy.sinCiudad}</p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-tinta-suave">{copy.enTodoElPais}</h2>
        {nacionales.map((o) => (
          <TarjetaOrg key={o.id} org={o} />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-tinta-suave">{copy.misPreguntas}</h2>
        {inquietudes.length === 0 ? (
          <p className="text-base text-tinta-suave">{copy.sinPreguntas}</p>
        ) : (
          inquietudes.map((q) => (
            <div key={q.id} className="rounded-token bg-superficie p-4">
              <p className="text-base text-tinta">"{q.texto}"</p>
              <p className="text-min text-tinta-suave">
                {q.fechaHora.slice(0, 10)} · {q.destinoNombre}
              </p>
              <p
                className={`mt-1 text-min font-bold ${
                  q.estado === 'respondida' ? 'text-exito' : 'text-ambar'
                }`}
              >
                {q.estado === 'respondida' ? copy.estadoRespondida : copy.estadoEnviada}
              </p>
              {q.respuesta ? (
                <p className="mt-1 text-min text-tinta">
                  {interpolar(copy.verRespuesta, { respuesta: q.respuesta })}
                </p>
              ) : null}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
