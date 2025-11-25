const CACHE_NAME = 'linguist-flow-v5';

// 1. CRITICAL ASSETS: These MUST exist for the app to work offline.
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

// 2. OPTIONAL ASSETS: These allow the SW to install even if they are missing (404).
const OPTIONAL_ASSETS = [
  '/logo192.png',
  '/logo512.png'
];

// Install SW
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('SW: Opened cache');
        
        // First, cache critical files. If this fails, the SW fails (correct behavior).
        await cache.addAll(CORE_ASSETS);
        
        // Next, TRY to cache optional files. If this fails, we catch it and continue.
        try {
          await cache.addAll(OPTIONAL_ASSETS);
        } catch (err) {
          console.warn('SW: Optional assets missing (e.g. icons). PWA functionality may be limited, but offline mode will work.', err);
        }
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
  // Ignore non-http requests
  if (!event.request.url.startsWith('http')) return;

  // Strategy: Network First, falling back to Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid network response, clone and cache it
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // Critical for React Apps: If navigation fails, return index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
