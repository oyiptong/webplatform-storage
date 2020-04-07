const CACHE_KEY = 'nativefs_1.0.0';

self.addEventListener('install', (e) => {
  e.waitUntil(
      caches.open(CACHE_KEY).then(cache => {
        return cache.addAll([
          './',
          './index.html',
          './main.js',
          './manifest.json',
          './icon_192x192.png',
          './icon_512x512.png',
          './css/bootstrap.min.css',
          './webcomponents/webcomponents-loader.js',
        ]);
      }));
});

self.addEventListener('fetch', event => {
  event.respondWith(async function() {
    if (event.request.method != 'GET')
      return fetch(event.request);

    const cache = await caches.open(CACHE_KEY);
    const cachedResponse = await cache.match(event.request);

    if (cachedResponse) {
      event.waitUntil(cache.add(event.request));
      return cachedResponse;
    }

    return fetch(event.request);
  }());
});
