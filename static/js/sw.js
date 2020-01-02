const CACHE_NAME = 'turtle-cache-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/vendor/jquery/plugins/qtip/jquery.qtip.css',
  '/static/vendor/jquery/1.7.1/jquery.js',
  '/static/vendor/jquery/plugins/qtip/jquery.qtip.js',
  '/static/vendor/fabric.js',
  '/static/js/main.js',
  '/static/img/mascot.png',
  '/static/img/bubble.png',
  '/static/css/fonts/Quicksand_Book.woff',
  '/static/css/fonts/Quicksand_Bold.woff',
  '/static/img/mascot.ico'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});