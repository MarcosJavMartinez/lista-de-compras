const CACHE_NAME = "neko-lista-v1";
const APP_SHELL = [
  "./",
  "index.html",
  "styles.css",
  "script.js",
  "manifest.json",
  "img/logo-header.png",
  "img/favicon-32.png",
  "img/favicon-16.png",
  "img/apple-touch-icon.png",
  "img/icon-192.png",
  "img/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

// Cache-first con actualización en segundo plano: sirve rápido y anda
// offline, pero cada visita refresca el cache para la próxima vez.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
