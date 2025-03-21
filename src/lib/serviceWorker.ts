/**
 * Service Worker Registration Utilities
 * 
 * This module provides functions to register and manage the service worker
 * for the Aquizi PWA.
 */

/**
 * Register the custom service worker and handle any existing service worker
 * 
 * @returns Promise<ServiceWorkerRegistration | null>
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  // In development mode, we don't want to register the service worker
  if (process.env.NODE_ENV === 'development') {
    console.log('Service worker registration skipped in development mode');
    // Attempt to unregister any existing service worker in development
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Unregistered service worker in development:', registration.scope);
      }
    } catch (error) {
      console.error('Error unregistering service worker in development:', error);
    }
    return null;
  }

  try {
    // First, try to unregister any existing service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('sw.js') && !registration.active.scriptURL.includes('custom-sw.js')) {
        await registration.unregister();
        console.log('Unregistered old service worker:', registration.active.scriptURL);
      }
    }

    // Register the new service worker
    const registration = await navigator.serviceWorker.register('/custom-sw.js', {
      scope: '/'
    });
    
    console.log('Service worker registered successfully:', registration.scope);
    
    // Handle updates
    if (registration.waiting) {
      console.log('New service worker waiting');
      // Optionally notify the user about an update
    }
    
    // Listen for new service workers
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New service worker installed and ready to take over');
          // Optionally notify the user about an update
        }
      });
    });
    
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Update the service worker
 * Called when the user accepts an update notification
 */
export function updateServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  
  navigator.serviceWorker.ready.then(registration => {
    if (registration.waiting) {
      // Send a message to the waiting service worker
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  });
}

/**
 * Unregister all service workers
 * Useful for debugging or when service workers cause issues
 */
export async function unregisterAllServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Unregistered service worker:', registration.scope);
    }
    console.log('All service workers unregistered');
  } catch (error) {
    console.error('Error unregistering service workers:', error);
  }
} 