const CACHE_NAME = 'windows13-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
  '/windows-logo.png',
  '/startup-sound.mp3',
  '/wallpapers/abstract-futuristic.png',
  '/wallpapers/chatgpt-liquid.png',
  '/wallpapers/chrome_liquid_metal_spheres_wallpaper.png',
  '/wallpapers/cosmic_aurora_nebula_wallpaper.png',
  '/wallpapers/geometric_crystal_prisms_wallpaper.png',
  '/wallpapers/neon_purple_blue_waves_wallpaper.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.log('Cache addAll failed, adding individually');
          return Promise.allSettled(
            STATIC_ASSETS.map(url => cache.add(url).catch(() => console.log('Failed to cache:', url)))
          );
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html'); // altijd je root fallback
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => {});
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});
