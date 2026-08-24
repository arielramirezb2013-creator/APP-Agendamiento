// Enrutador por pila de pantallas (§9.1). Primer arranque: configuración del
// cuidador (§3.2); después, la app abre SIEMPRE en la pantalla de ella.

import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/dexie';
import { sembrarPrecargas } from '@/db/seed';
import { pantallaActual, useApp } from '@/store';
import { iniciarVigilanciaNotificaciones } from '@/services/recordatorios';
import { Inicio } from '@/features/inicio/Inicio';
import { Checkin } from '@/features/checkin/Checkin';
import { Episodio } from '@/features/episodios/Episodio';
import { Comida } from '@/features/comidas/Comida';
import { Peso } from '@/features/comidas/Peso';
import { Directorio } from '@/features/directorio/Directorio';
import { BanderaRoja } from '@/features/banderas/BanderaRoja';
import { ConfiguracionInicial } from '@/features/cuidador/ConfiguracionInicial';
import { CuidadorPin } from '@/features/cuidador/CuidadorPin';
import { CuidadorPanel } from '@/features/cuidador/CuidadorPanel';
import { CuidadorRegistros } from '@/features/cuidador/CuidadorRegistros';
import { CuidadorContactos } from '@/features/cuidador/CuidadorContactos';
import { CuidadorMedicinas } from '@/features/cuidador/CuidadorMedicinas';
import { CuidadorReporte } from '@/features/cuidador/CuidadorReporte';
import { CuidadorAjustes } from '@/features/cuidador/CuidadorAjustes';
import { CuidadorChecklist } from '@/features/cuidador/CuidadorChecklist';
import { CuidadorMiPlan } from '@/features/cuidador/CuidadorMiPlan';
import { CuidadorRed } from '@/features/cuidador/CuidadorRed';
import { RedApoyo } from '@/features/red/RedApoyo';
import { MiSemana } from '@/features/semana/MiSemana';
import { CuestionarioAlsfrs } from '@/features/alsfrs/CuestionarioAlsfrs';

const PANTALLAS_CUIDADOR = new Set([
  'cuidadorPanel',
  'cuidadorRegistros',
  'cuidadorContactos',
  'cuidadorMedicinas',
  'cuidadorReporte',
  'cuidadorAjustes',
  'cuidadorChecklist',
  'cuidadorMiPlan',
  'cuidadorRed',
]);

export default function App() {
  const pila = useApp((s) => s.pila);
  const cuidadorActivo = useApp((s) => s.cuidadorActivo);
  const perfiles = useLiveQuery(() => db.perfiles.toArray(), []);
  const perfil = perfiles?.[0];

  // Alto contraste extra (§10.2) aplicado al documento completo.
  useEffect(() => {
    document.documentElement.classList.toggle(
      'alto-contraste',
      perfil?.altoContraste ?? false,
    );
  }, [perfil?.altoContraste]);

  useEffect(() => {
    if (perfil) {
      void sembrarPrecargas();
      iniciarVigilanciaNotificaciones(perfil.nombre, perfil.tratamiento);
    }
  }, [perfil?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (perfiles === undefined) return null; // cargando IndexedDB
  if (!perfil) {
    return <ConfiguracionInicial onListo={() => undefined} />;
  }

  const pantalla = pantallaActual(pila);
  const rol = cuidadorActivo ? 'cuidador' : 'paciente';

  // Toda pantalla de cuidador exige la sesión con PIN (§4).
  if (PANTALLAS_CUIDADOR.has(pantalla.id) && !cuidadorActivo) {
    return <CuidadorPin perfil={perfil} />;
  }

  switch (pantalla.id) {
    case 'inicio':
      return <Inicio perfil={perfil} />;
    case 'checkin':
      return <Checkin perfil={perfil} rol={rol} />;
    case 'episodio':
      return <Episodio perfil={perfil} rol={rol} />;
    case 'comida':
      return <Comida perfil={perfil} rol={rol} />;
    case 'peso':
      return <Peso perfil={perfil} rol={rol} />;
    case 'directorio':
      return <Directorio />;
    case 'directorioTema':
      return <Directorio temaFiltro={pantalla.tema} />;
    case 'redApoyo':
      return <RedApoyo perfil={perfil} rol={rol} />;
    case 'miSemana':
      return <MiSemana perfil={perfil} />;
    case 'alsfrs':
      return <CuestionarioAlsfrs perfil={perfil} rol={rol} />;
    case 'cuidadorRed':
      return <CuidadorRed />;
    case 'banderaRoja':
      return <BanderaRoja />;
    case 'cuidadorPin':
      return <CuidadorPin perfil={perfil} />;
    case 'cuidadorPanel':
      return <CuidadorPanel />;
    case 'cuidadorRegistros':
      return <CuidadorRegistros />;
    case 'cuidadorContactos':
      return <CuidadorContactos />;
    case 'cuidadorMedicinas':
      return <CuidadorMedicinas />;
    case 'cuidadorReporte':
      return <CuidadorReporte perfil={perfil} />;
    case 'cuidadorAjustes':
      return <CuidadorAjustes perfil={perfil} />;
    case 'cuidadorChecklist':
      return <CuidadorChecklist />;
    case 'cuidadorMiPlan':
      return <CuidadorMiPlan />;
    default:
      return <Inicio perfil={perfil} />;
  }
}
