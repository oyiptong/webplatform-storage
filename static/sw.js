self.addEventListener('install', (e) => {
  e.waitUntil(
      caches.open('nativefs_ed').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/main.js',
          '/icon_192x192.png',
          '/icon_512x512.png',
          '/css/bootstrap.min.css',
          '/webcomponents/webcomponents-loader.js',
        ]);
      }));
});

self.addEventListener('fetch', (event) => {});
