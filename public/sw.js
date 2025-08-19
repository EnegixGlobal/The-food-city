// Basic service worker for The Food City PWA (no API caching)
const CACHE_NAME = 'tfc-cache-v2';
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/new_logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isApi = url.pathname.startsWith('/api/');

  // Always network-first & no caching for API (especially addresses)
  if (isApi) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        // Only cache successful basic/cors responses
        if (resp.ok && (resp.type === 'basic' || resp.type === 'cors')) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return resp;
      }).catch(() => undefined);
    })
  );
});
