// GSN Training — Service Worker v3
// Corrigido para GitHub Pages subpath (/treino-app/)

const CACHE_NAME = 'gsn-training-v3';
const ASSETS = [
  '/treino-app/',
  '/treino-app/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll com fallback — não quebra se um asset falhar
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('SW: removendo cache antigo:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(event.request);

      // Busca na rede em segundo plano e atualiza o cache
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          cache.put(event.request, response.clone());
        }
        return response;
      }).catch(() => null);

      // Serve do cache se disponível, senão espera a rede
      return cached || fetchPromise;
    })
  );
});
