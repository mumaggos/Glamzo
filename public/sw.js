const CACHE_NAME = 'glamzo-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, list fresh in background (stale-while-revalidate pattern)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Ignore network error on revalidate */});
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache static files and font assets dynamically
        const url = event.request.url;
        if (
          url.includes('fonts.gstatic.com') ||
          url.includes('fonts.googleapis.com') ||
          url.endsWith('.webp') ||
          url.endsWith('.png') ||
          url.endsWith('.svg') ||
          url.endsWith('.css') ||
          url.endsWith('.js')
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch((err) => {
        // Offline support, falls back to offline-shell if needed
        return caches.match('/');
      });
    })
  );
});
