const CACHE_NAME = 'windows13-v4';
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

// Install event – cache alle statische assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event – verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(name => {
        if (name !== CACHE_NAME) return caches.delete(name);
      }))
    )
  );
  self.clients.claim();
});

// Fetch event – serve uit cache of fetch van netwerk
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback naar index.html bij navigatie (React Router)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
