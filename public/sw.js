const CACHE_NAME = 'linguist-flow-v4';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  'https://cdn.tailwindcss.com'
];

// Install SW
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // We catch errors here so one missing file doesn't break the whole app
        return cache.addAll(urlsToCache).catch(err => {
          console.error('SW: Failed to cache some initial assets', err);
        });
      })
  );
});

// Activate and Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Take control immediately

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (!cacheWhitelist.includes(cacheName)) {
          console.log('SW: Deleting old cache', cacheName);
          return caches.delete(cacheName);
        }
      })
    ))
  );
});

// Fetch Handler
self.addEventListener('fetch', (event) => {
  // 1. Ignore non-http requests (like chrome-extension://)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 2. Check if response is valid
        if (!response || response.status !== 200) {
          return response;
        }

        // 3. Clone response to save it to cache
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            // Only cache GET requests
            if (event.request.method === 'GET') {
               cache.put(event.request, responseToCache);
            }
          });

        return response;
      })
      .catch(() => {
        // 4. Network failed, fall back to cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 5. Critical for React Apps: If navigation fails, return index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
