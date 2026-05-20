// GSN Training — Service Worker v1
// Cache-first: garante funcionamento offline e dados persistentes no iOS

const CACHE_NAME = 'gsn-training-v1';
const ASSETS = [
  '/',
  '/index.html'
];

// Instala e faz cache dos assets principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Limpa caches antigos quando uma nova versão ativa
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Cache-first: serve do cache, busca na rede em segundo plano
self.addEventListener('fetch', event => {
  // Só intercepta GETs da mesma origem
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          cache.put(event.request, response.clone());
        }
        return response;
      }).catch(() => null);

      return cached || fetchPromise;
    })
  );
});
