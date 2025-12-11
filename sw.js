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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(name => name !== CACHE_NAME)
           .map(name => caches.delete(name))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') return caches.match('/index.html');
          return new Response('Offline', { status: 503 });
        });
    })
  );
});
