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

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first met fallback naar network, en SPA fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));

          return networkResponse;
        })
        .catch(() => {
          // React SPA fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});
