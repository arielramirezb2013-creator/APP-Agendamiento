// Stub de 'virtual:pwa-register' para el build de demo de un solo archivo:
// la demo corre embebida (sin service worker) y no debe intentar registrarlo.
export function registerSW(_opciones?: unknown): (reload?: boolean) => void {
  return () => undefined;
}
