const CACHE_NAME = 'linguist-flow-v2';

// Only cache the absolute essentials for the shell to load.
// We removed specific image references from here to prevent 
// the SW from failing if an image is missing.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

// Install SW
self.addEventListener('install', (event) => {
  // Force this SW to become the active service worker immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // We use 'addAll' cautiously. If one fails, we catch it so the SW still installs.
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Failed to cache some assets, but proceeding:', err);
        });
      })
  );
});

// Activate the SW
self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(clients.claim());

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (!cacheWhitelist.includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
});

// Listen for requests (Network First, Fallback to Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network works, return response and update cache
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
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
        // If network fails, look in cache
        return caches.match(event.request);
      })
  );
});
