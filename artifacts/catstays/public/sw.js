const CACHE_NAME = 'catstays-pwa-v3';
const APP_SHELL = [
  '/',
  '/app',
  '/staff-dashboard',
  '/client-portal',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/apple-touch-icon-v2.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/') || Response.error()));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() || '' }; }
  const title = data.title || 'CatStays';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || 'You have a new CatStays update.',
    icon: data.icon || '/icons/icon-maskable-192.png',
    badge: data.badge || '/icons/icon-maskable-192.png',
    tag: data.tag || 'catstays-update',
    renotify: true,
    vibrate: [180, 80, 180],
    data: { url: data.url || '/app' },
    actions: [{ action: 'open', title: 'Open CatStays' }],
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/app', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const current = windows.find((client) => client.url.startsWith(self.location.origin));
    if (current) return current.focus().then(() => current.navigate(target));
    return clients.openWindow(target);
  }));
});
