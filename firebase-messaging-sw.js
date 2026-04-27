// Firebase Messaging service worker — handles push notifications when the
// app is in the background or closed. Must live at the domain root.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAzAeTkeBbkeuebjwhgj3nedgbdgbhJ1KI",
  authDomain: "load-leader.firebaseapp.com",
  projectId: "load-leader",
  storageBucket: "load-leader.firebasestorage.app",
  messagingSenderId: "411492756195",
  appId: "1:411492756195:web:ffd28b7e1dd32b2670f3d6"
});

const messaging = firebase.messaging();

// Background message handler — fired when the app is not focused
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'LoadLeader';
  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/favicon-32x32.png',
    badge: '/favicon-32x32.png',
    data: payload.data || {},
    tag: payload.data?.tag || 'loadleader-notification'
  };
  self.registration.showNotification(title, options);
});

// Click handler — opens or focuses the app, optionally on a specific URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
