const CACHE = 'domu-staff-v4';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/manifest.webmanifest',
      '/favicon.ico',
      '/icons/icon-192.png',
      '/icons/icon-512.png',
    ]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/')))
  );
});

/** Push remoto (app fechado / tela bloqueada). */
self.addEventListener('push', (event) => {
  let data = {
    title: 'Domu Staff',
    body: '',
    url: '/',
    view: null,
    tag: 'domu',
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    try {
      const text = event.data?.text?.();
      if (text) data.body = text;
    } catch { /* ignore */ }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Domu Staff', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/favicon.ico',
      tag: data.tag || 'domu',
      renotify: true,
      data: {
        url: data.url || '/',
        view: data.view || null,
      },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const view = event.notification.data?.view || null;
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if ('focus' in client) {
        client.postMessage({ type: 'domu-notification-click', view });
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(view ? `${targetUrl}?view=${encodeURIComponent(view)}` : targetUrl);
    }
    return undefined;
  })());
});
