const CACHE_NAME = 'k1ko-app-v7';
const APP_SHELL = [
  './index.html',
  './Coleccion.html',
  './Descuento.html',
  './admin.html',
  './style.css?v=3',
  './script.js',
  './admin.css',
  './admin.js',
  './pwa.js?v=3',
  './manifest.webmanifest',
  './img/logo.jpeg',
  './img/pwa-icon-192.png',
  './img/pwa-icon-512.png'
];
const APP_PATHS = new Set(
  APP_SHELL.map(path => new URL(path, self.location).pathname)
);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('k1ko-app-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok && APP_PATHS.has(url.pathname)) {
            await caches.open(CACHE_NAME)
              .then(cache => cache.put(request, response.clone()))
              .catch(error => console.error(`No se pudo actualizar ${url.pathname} en caché:`, error));
          }
          return response;
        })
        .catch(async networkError => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const fallbackPath = url.pathname.endsWith('/admin.html')
            ? './admin.html'
            : './index.html';
          const fallbackPage = await caches.match(new URL(fallbackPath, self.location).href);
          return fallbackPage || Promise.reject(networkError);
        })
    );
    return;
  }

  if (!APP_PATHS.has(url.pathname)) return;

  event.respondWith(
    fetch(request)
      .then(async response => {
        if (response.ok) {
          await caches.open(CACHE_NAME)
            .then(cache => cache.put(request, response.clone()))
            .catch(error => console.error(`No se pudo actualizar ${url.pathname} en caché:`, error));
        }
        return response;
      })
      .catch(async networkError => {
        const cachedResource = await caches.match(request);
        return cachedResource || Promise.reject(networkError);
      })
  );
});
