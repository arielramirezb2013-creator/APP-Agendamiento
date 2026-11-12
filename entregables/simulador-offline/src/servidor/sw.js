/* Service worker del simulador: deja abrir la página sin conexión después de la primera visita.
   Primero intenta la red (así siempre se sirve la versión publicada); si no hay conexión, usa la copia guardada.
   Solo guarda el simulador y su configuración. No toca el panel del investigador ni el receptor de respuestas. */
const CACHE = "simulador-ruta-v1";
const ARCHIVOS = ["index.html", "configuracion.js"];
const base = new URL("./", self.location).href;
const esDelSimulador = url => url === base || ARCHIVOS.some(a => url === base + a);

self.addEventListener("install", ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => Promise.all([base].concat(ARCHIVOS.map(a => base + a)).map(u => fetch(u, { cache:"no-store", credentials:"same-origin" }).then(r => (r.ok ? c.put(u, r) : null)).catch(() => null)))));
});
self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.indexOf("simulador-ruta-") === 0).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", ev => {
  const r = ev.request, url = r.url.split("#")[0].split("?")[0];
  if (r.method !== "GET" || !esDelSimulador(url)) return;
  ev.respondWith(
    fetch(r).then(resp => { if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(url, copia)); } return resp; })
      .catch(() => caches.match(url).then(x => x || (url === base ? caches.match(base + "index.html") : undefined)).then(x => x || Response.error()))
  );
});
