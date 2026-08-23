// Peso semanal (§6.3): entrada numérica GIGANTE y tendencia de 8 semanas con
// solo dos anotaciones posibles: estable ✓ / "ha bajado — coménteselo a
// [nutricionista]". Evidencia: hipermetabolismo ~50% (§2.2-3).

import { useEffect, useRef, useState } from 'react';
import { CardQuestion } from '@/components/CardQuestion';
import { NumericKeypad } from '@/components/NumericKeypad';
import { PrimaryButton } from '@/components/PrimaryButton';
import { comidas, comun, interpolar, t } from '@/content/es-CO';
import { ahoraISO, db, hoyLocal, nuevoId } from '@/db/dexie';
import { enVentana } from '@/rules/recurrence';
import { evaluarPeso, UMBRALES_PESO_DEFECTO, type UmbralesPeso } from '@/rules/weight';
import { contactoParaTema, procesarBanderas } from '@/services/banderas';
import type { BanderaDisparada } from '@/rules/flags';
import type { Perfil, Peso as PesoModelo, Rol } from '@/types/models';
import { useApp } from '@/store';
import { TarjetaAmbar } from '@/features/banderas/TarjetaAmbar';

const copy = comidas.peso;

interface PesoProps {
  perfil: Perfil;
  rol: Rol;
}

/** Línea simple de tendencia (§6.3): SVG accesible, sin librerías. */
function LineaTendencia({ pesos }: { pesos: PesoModelo[] }) {
  if (pesos.length < 2) return null;
  const kgs = pesos.map((p) => p.kg);
  const min = Math.min(...kgs);
  const max = Math.max(...kgs);
  const rango = Math.max(max - min, 1);
  const ancho = 300;
  const alto = 80;
  const puntos = pesos
    .map((p, i) => {
      const x = (i / (pesos.length - 1)) * (ancho - 20) + 10;
      const y = alto - 12 - ((p.kg - min) / rango) * (alto - 24);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label={`${pesos[0].kg} a ${pesos[pesos.length - 1].kg} kilos`}
      className="w-full"
    >
      <polyline
        points={puntos}
        fill="none"
        stroke="#0B6B5D"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Peso({ perfil, rol }: PesoProps) {
  const { volver, aInicio } = useApp();
  const trato = perfil.tratamiento;
  const [valor, setValor] = useState('');
  const [historial, setHistorial] = useState<PesoModelo[]>([]);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [ambar, setAmbar] = useState<BanderaDisparada>();
  const [nombreNutri, setNombreNutri] = useState<string>();
  const [error, setError] = useState<string>();
  // Umbrales editables por el cuidador (§6.3): la anotación de tendencia usa
  // la MISMA configuración que la regla A6, nunca solo los valores por defecto.
  const [umbrales, setUmbrales] = useState<UmbralesPeso>(UMBRALES_PESO_DEFECTO);

  const cargar = async () => {
    const hoy = hoyLocal();
    const todos = await db.pesos.orderBy('fecha').toArray();
    setHistorial(todos.filter((p) => enVentana(p.fecha, hoy, 7 * 8)));
  };

  useEffect(() => {
    void cargar();
    void contactoParaTema('nutricion').then((c) => setNombreNutri(c?.nombre));
    void db.config.get('default').then((c) => {
      if (c) {
        setUmbrales({
          pesoPorcentaje8Sem: c.pesoPorcentaje8Sem,
          pesoKg4Sem: c.pesoKg4Sem,
        });
      }
    });
  }, []);

  const guardando = useRef(false);

  async function guardar() {
    const kg = Number(valor);
    // Los errores dicen qué pasó y qué hacer (§10.2): nada de rechazos mudos.
    if (!kg || kg < 20 || kg > 250) {
      setError(t(copy.fueraDeRango, trato));
      return;
    }
    if (guardando.current) return;
    guardando.current = true;
    try {
      const registro: PesoModelo = {
        id: nuevoId(),
        fecha: hoyLocal(),
        kg,
        llenado: { por: rol, fecha: ahoraISO() },
      };
      await db.pesos.add(registro);
      await cargar();
      const res = await procesarBanderas({});
      setAmbar(res.ambar);
      setGuardadoOk(true);
    } catch {
      setError(comun.errorGuardar);
    } finally {
      guardando.current = false;
    }
  }

  if (guardadoOk) {
    if (ambar) {
      return <TarjetaAmbar disparada={ambar} onCerrada={() => setAmbar(undefined)} />;
    }
    const resultado = evaluarPeso(historial, hoyLocal(), umbrales);
    return (
      <div className="transicion-tarjeta flex min-h-dvh flex-col justify-center gap-6 bg-fondo px-4 py-8">
        <p className="text-center text-pregunta font-bold text-exito">{comun.listo}</p>
        <div className="rounded-token bg-superficie p-5">
          <h2 className="mb-2 text-base font-bold text-tinta">
            {trato === 'tu' ? copy.tendenciaTu : copy.tendencia}
          </h2>
          <LineaTendencia pesos={historial} />
          <p
            className={`mt-2 text-base font-bold ${
              resultado.nivel === 'ambar' ? 'text-ambar' : 'text-exito'
            }`}
          >
            {resultado.nivel === 'ambar'
              ? `⚠️ ${interpolar(copy.haBajado, { contacto: nombreNutri ?? 'su equipo' })}`
              : `✓ ${copy.estable}`}
          </p>
        </div>
        <PrimaryButton onClick={aInicio}>{comun.seguir}</PrimaryButton>
      </div>
    );
  }

  return (
    <CardQuestion
      pregunta={t(copy.pregunta, trato)}
      onVolver={volver}
      pie={
        <PrimaryButton onClick={() => void guardar()} deshabilitado={!Number(valor)}>
          {comun.guardar}
        </PrimaryButton>
      }
    >
      <NumericKeypad
        valor={valor}
        onCambio={(v) => {
          setError(undefined);
          setValor(v);
        }}
        maxLargo={4}
        conComa
        etiquetaBorrar={copy.borrar}
      />
      <p className="text-center text-base text-tinta-suave">{copy.kg}</p>
      {error ? (
        <p role="alert" className="text-center text-base font-bold text-rojo">
          {error}
        </p>
      ) : null}
    </CardQuestion>
  );
}
