// Estado de sesión (Zustand §11). La navegación es una pila de pantallas con
// botones — no hay tab bar, hamburguesa ni swipe (§9.1). "Volver" = pop.

import { create } from 'zustand';
import type { Tema } from '@/types/models';

export type Pantalla =
  | { id: 'inicio' }
  | { id: 'checkin' }
  | { id: 'episodio' }
  | { id: 'comida' }
  | { id: 'peso' }
  | { id: 'directorio' }
  | { id: 'directorioTema'; tema: Tema; reglaId?: string }
  | { id: 'banderaRoja'; reglaId: string }
  | { id: 'cuidadorPin' }
  | { id: 'cuidadorPanel' }
  | { id: 'cuidadorRegistros' }
  | { id: 'cuidadorContactos' }
  | { id: 'cuidadorMedicinas' }
  | { id: 'cuidadorReporte' }
  | { id: 'cuidadorAjustes' }
  | { id: 'cuidadorChecklist' }
  | { id: 'cuidadorMiPlan' };

interface EstadoApp {
  pila: Pantalla[];
  cuidadorActivo: boolean;
  ir: (p: Pantalla) => void;
  reemplazar: (p: Pantalla) => void;
  volver: () => void;
  aInicio: () => void;
  setCuidadorActivo: (v: boolean) => void;
}

export const useApp = create<EstadoApp>((set) => ({
  pila: [{ id: 'inicio' }],
  cuidadorActivo: false,
  ir: (p) => set((s) => ({ pila: [...s.pila, p] })),
  reemplazar: (p) => set((s) => ({ pila: [...s.pila.slice(0, -1), p] })),
  volver: () => set((s) => ({ pila: s.pila.length > 1 ? s.pila.slice(0, -1) : s.pila })),
  aInicio: () => set({ pila: [{ id: 'inicio' }], cuidadorActivo: false }),
  setCuidadorActivo: (v) => set({ cuidadorActivo: v }),
}));

export function pantallaActual(pila: Pantalla[]): Pantalla {
  return pila[pila.length - 1];
}
