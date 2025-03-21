/**
 * DEPRECATED: This service worker is no longer in use.
 * Please use custom-sw.js instead.
 */

// Unregister and clear all caches from the old service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Deprecated service worker - Installing redirect');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Deprecated service worker - Activating and clearing caches');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
    .then(() => {
      console.log('[SW] Deprecated service worker - Redirecting');
      
      // Attempt to register the new service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/custom-sw.js')
          .then(reg => {
            console.log('[SW] New custom service worker registered', reg.scope);
          })
          .catch(error => {
            console.error('[SW] Registration of new service worker failed:', error);
          });
      }
      
      return self.clients.claim();
    })
  );
});

// Minimal fetch handler to avoid breaking the application
self.addEventListener('fetch', (event) => {
  // Pass through all requests to the network
  return;
});
