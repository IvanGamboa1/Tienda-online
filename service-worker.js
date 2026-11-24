const CACHE_NAME = 'k1ko-app-v12';
const APP_SHELL = [
  './index.html',
  './Coleccion.html',
  './Descuento.html',
  './admin.html',
  './admin.webmanifest',
  './style.css?v=3',
  './script.js',
  './admin.css',
  './admin.js',
  './pos.js?v=2',
  './pos.css?v=3',
  './pwa.js?v=4',
  './manifest.webmanifest',
  './img/logo.jpeg',
  './img/pwa-icon-192.png',
  './img/pwa-icon-512.png',
  './img/pwa-icon-maskable.png'
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

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const adminUrl = new URL(event.notification.data?.url || './admin.html', self.location).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        const existingClient = clients.find(client => new URL(client.url).pathname === new URL(adminUrl).pathname);
        if (existingClient) {
          return existingClient.navigate(adminUrl).then(() => existingClient.focus());
        }
        return self.clients.openWindow(adminUrl);
      })
  );
});

self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('No se pudo interpretar el contenido de la notificación push:', error);
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'K1KO: nuevo pedido', {
      body: payload.body || 'Hay un nuevo pedido en la tienda.',
      icon: './img/pwa-icon-192.png',
      badge: './img/pwa-icon-192.png',
      tag: payload.tag || `k1ko-pedido-${Date.now()}`,
      data: { url: payload.url || './admin.html' }
    })
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
