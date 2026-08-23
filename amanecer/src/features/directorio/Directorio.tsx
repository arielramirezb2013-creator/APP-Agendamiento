// "¿A quién llamo?" (§6.5): tarjetas por TEMA, no por cargo. Emergencia roja
// SIEMPRE primera e inconfundible (ícono + palabra + color). Llamar: ≤2 toques
// desde el inicio. El botón SOS dispara la regla R4.

import { useLiveQuery } from 'dexie-react-hooks';
import { comun, directorio as copy } from '@/content/es-CO';
import { db } from '@/db/dexie';
import { procesarBanderas } from '@/services/banderas';
import type { Contacto, Tema } from '@/types/models';
import { useApp } from '@/store';

const ORDEN_TEMAS: Tema[] = [
  'respiracion',
  'tragar',
  'nutricion',
  'moverme',
  'animo',
  'medicinas',
  'tramites',
  'otro',
];

function TarjetaContacto({ contacto }: { contacto: Contacto }) {
  return (
    <div className="flex flex-col gap-2 rounded-token bg-superficie p-4">
      {contacto.foto ? (
        <img
          src={contacto.foto}
          alt=""
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : null}
      <p className="text-boton font-bold text-tinta">{contacto.nombre}</p>
      <p className="text-min text-tinta-suave">{contacto.paraQue}</p>
      <a
        href={`tel:${contacto.telefono}`}
        className="flex min-h-chip items-center justify-center rounded-token bg-primario
          text-boton font-bold text-white no-underline"
      >
        📞 {comun.llamar}
      </a>
      {contacto.whatsapp ? (
        <a
          href={`https://wa.me/${contacto.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-chip items-center justify-center rounded-token border-2
            border-primario text-boton font-bold text-primario no-underline"
        >
          💬 {comun.whatsapp}
        </a>
      ) : null}
    </div>
  );
}

export function Directorio({ temaFiltro }: { temaFiltro?: Tema }) {
  const { volver, ir } = useApp();
  const contactos = useLiveQuery(() => db.contactos.orderBy('orden').toArray(), []) ?? [];

  const emergencia = contactos.filter((c) => c.esEmergencia);
  const porTema = (tema: Tema) =>
    contactos.filter((c) => !c.esEmergencia && c.temas.includes(tema));

  const temas = temaFiltro ? [temaFiltro] : ORDEN_TEMAS;
  const hayNoEmergencia = contactos.some((c) => !c.esEmergencia);

  const sos = async () => {
    // R4: el SOS queda registrado como evento rojo y abre la pantalla de urgencia.
    await procesarBanderas({ sosPresionado: true });
    ir({ id: 'banderaRoja', reglaId: 'R4' });
  };

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
        <h1 className="text-pregunta font-bold text-tinta">{copy.titulo}</h1>
      </header>

      {/* Tarjeta de emergencia: roja, primera, ícono + palabra (§6.5 CA). */}
      {!temaFiltro || temaFiltro === 'emergencia' ? (
        <section className="flex flex-col gap-2 rounded-token bg-rojo p-4">
          <p className="text-boton font-bold text-white">🚨 {copy.emergencia}</p>
          <a
            href="tel:123"
            className="flex min-h-primario items-center justify-center rounded-token
              bg-white text-pregunta font-bold text-rojo no-underline"
          >
            📞 {copy.llamar123}
          </a>
          {emergencia
            .filter((c) => c.telefono !== '123')
            .map((c) => (
              <a
                key={c.id}
                href={`tel:${c.telefono}`}
                className="flex min-h-chip items-center justify-center rounded-token
                  border-4 border-white text-boton font-bold text-white no-underline"
              >
                📞 {comun.llamar}: {c.nombre}
              </a>
            ))}
          <button
            type="button"
            onClick={() => void sos()}
            className="min-h-chip rounded-token border-4 border-white bg-rojo text-boton
              font-bold text-white"
          >
            🆘 {copy.sos}
          </button>
        </section>
      ) : null}

      {!hayNoEmergencia && !temaFiltro ? (
        <p className="text-base text-tinta-suave">{copy.sinContactos}</p>
      ) : null}

      {temas.map((tema) => {
        const lista = porTema(tema);
        if (lista.length === 0) return null;
        const info = copy.temas[tema];
        return (
          <section key={tema} className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-tinta-suave">
              {info.emoji} {info.etiqueta}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {lista.map((c) => (
                <TarjetaContacto key={c.id} contacto={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
