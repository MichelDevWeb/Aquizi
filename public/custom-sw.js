/**
 * Custom Service Worker for Aquizi PWA
 * This service worker:
 * 1. Skips problematic files like app-build-manifest.json
 * 2. Focuses on caching essential assets
 * 3. Has improved error handling
 */

const CACHE_NAME = 'aquizi-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other essential static assets here
];

// Files to skip during fetch handling to avoid 404 errors
const SKIP_URLS = [
  '/_next/app-build-manifest.json',
  'app-build-manifest.json',
];

self.addEventListener('install', (event) => {
  console.log('[Custom SW] Installing');
  
  // Cache essential assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Custom SW] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Custom SW] Skip waiting on install');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Custom SW] Cache error during install:', error);
        // Continue with installation even if caching fails
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Custom SW] Activating');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('[Custom SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
    .then(() => {
      console.log('[Custom SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip problematic URLs that might cause 404 errors
  const url = new URL(event.request.url);
  const shouldSkip = SKIP_URLS.some(skipUrl => url.pathname.includes(skipUrl));
  
  if (shouldSkip) {
    console.log('[Custom SW] Skipping problematic URL:', url.pathname);
    return;
  }
  
  // For navigation requests, try network first, then fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-success responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache successful responses
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('[Custom SW] Cache put error:', error);
              });
              
            return response;
          })
          .catch((error) => {
            console.error('[Custom SW] Fetch error:', error);
            // For image requests, return a fallback image
            if (event.request.destination === 'image') {
              return caches.match('/icons/icon-192x192.png');
            }
            throw error;
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 