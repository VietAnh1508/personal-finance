const APP_SHELL_CACHE = 'app-shell-v1';
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_SHELL_CACHE)
            .map((key) => caches.delete(key))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const canUseRuntimeCache =
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'worker';

  if (!canUseRuntimeCache) {
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function handleNavigationRequest(request) {
  const cache = await caches.open(APP_SHELL_CACHE);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && new URL(request.url).origin === self.location.origin) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (_error) {
    const cachedRoute = await cache.match(request);

    if (cachedRoute) {
      return cachedRoute;
    }

    const cachedShell = await cache.match('/index.html');

    if (cachedShell) {
      return cachedShell;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const cachedResponse = await cache.match(request);

  const networkRequest = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => null);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await networkRequest;

  if (networkResponse) {
    return networkResponse;
  }

  return new Response('Offline', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain' },
  });
}
