const CACHE_NAME = 'loadleader-v4';

// On install — skip waiting immediately
self.addEventListener('install', event => {
  self.skipWaiting();
});

// On activate — delete ALL caches and take control
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        console.log('LoadLeader SW: Clearing cache', key);
        return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch — ALWAYS network first, never serve from cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firebaseapp.com')) return;
  if (event.request.url.includes('googleapis.com')) return;
  if (event.request.url.includes('onrender.com')) return;
  if (event.request.url.includes('gstatic.com')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
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
