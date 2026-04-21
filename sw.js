const CACHE_NAME = 'loadleader-v5';

// Only cache static assets — NEVER cache HTML pages
const CACHEABLE = [
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHEABLE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never intercept: HTML pages, Firebase, API calls, fonts
  if (event.request.method !== 'GET') return;
  if (url.pathname.endsWith('.html') || url.pathname === '/') return;
  if (url.hostname.includes('firebase') || url.hostname.includes('google')) return;
  if (url.hostname.includes('onrender.com')) return;
  if (url.hostname.includes('fonts.g')) return;

  // For icons and images — cache first
  if (CACHEABLE.some(c => url.pathname === c)) {
    event.respondWith(
      caches.match(event.request).then(cached => 
        cached || fetch(event.request).then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Everything else — network only, no caching
  event.respondWith(fetch(event.request));
});

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'LoadLeader', {
      body: data.body || 'New update from LoadLeader',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
