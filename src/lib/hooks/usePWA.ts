import { useState, useEffect } from 'react';
import { isPWA } from '@/lib/utils';
import { registerServiceWorker, updateServiceWorker } from '../serviceWorker';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if the app is already installed as PWA
    setIsInstalled(isPWA());

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches || isPWA());
    };
    
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Capture the beforeinstallprompt event to prevent the mini-infobar from appearing
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is running in standalone mode (iOS)
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    // Register service worker
    registerServiceWorker().then(registration => {
      if (registration) {
        setSwRegistration(registration);
        
        // Check if there's an update waiting
        if (registration.waiting) {
          setUpdateAvailable(true);
        }
        
        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (!newWorker) return;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      }
    });

    // Cleanup event listeners
    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Function to trigger the installation prompt
  const promptInstall = async (): Promise<boolean> => {
    if (!installPrompt) return false;
    
    try {
      // Show the installation prompt
      await installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await installPrompt.userChoice;
      
      // Reset the install prompt - it can only be used once
      setInstallPrompt(null);
      
      // Check if the user accepted the prompt
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }
      
      // The user declined
      return false;
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  };

  // Function to apply a service worker update
  const applyUpdate = () => {
    if (updateAvailable) {
      updateServiceWorker();
    }
  };

  return {
    isInstalled,
    canInstall,
    promptInstall,
    updateAvailable,
    applyUpdate
  };
} 