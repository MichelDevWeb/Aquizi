'use client';

import React, { useState, useEffect } from 'react';
import { usePWA } from '@/lib/hooks/usePWA';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PWAInstallBannerProps {
  className?: string;
}

export function PWAInstallBanner({ className }: PWAInstallBannerProps) {
  const { isInstalled, canInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  // Check if the user is on a mobile device and load dismissal status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      setIsMobile(/android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent.toLowerCase()));
    };
    
    checkMobile();
    
    // Check for previous dismissal
    const dismissedTime = localStorage.getItem('pwa-banner-dismissed-time');
    if (dismissedTime) {
      const dismissExpiry = parseInt(dismissedTime, 10) + (1 * 24 * 60 * 60 * 1000); // 1 day
      if (Date.now() < dismissExpiry) {
        setDismissed(true);
      } else {
        // Expired dismissal
        localStorage.removeItem('pwa-banner-dismissed');
        localStorage.removeItem('pwa-banner-dismissed-time');
      }
    }
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show if can be installed and not dismissed
  if (isInstalled || !canInstall || dismissed) {
    return (<></>);
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (!installed) {
      // User canceled, we can show again later
      return;
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember for 1 day
    localStorage.setItem('pwa-banner-dismissed', 'true');
    localStorage.setItem('pwa-banner-dismissed-time', Date.now().toString());
  };

  return (
    <div className={cn(
      "fixed left-0 right-0 bg-primary z-50 text-primary-foreground p-4 shadow-lg",
      isMobile ? "bottom-0" : "top-16", // Display at bottom on mobile, top on desktop
      className
    )}>
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {isMobile ? (
            <Smartphone className="h-6 w-6 shrink-0" />
          ) : (
            <Laptop className="h-6 w-6 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isMobile 
                ? (t('addToHomescreen') || "Add to Homescreen") 
                : (t('installApp') || "Install Aquizi")}
            </p>
            <p className="text-xs opacity-90">
              {isMobile
                ? (t('addToHomescreenDesc') || "For a better experience")
                : (t('installAppDesc') || "Use Aquizi even when offline")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            className="whitespace-nowrap"
            onClick={handleInstall}
          >
            <Download className="h-4 w-4 mr-1" />
            {t('install') || "Install"}
          </Button>
        </div>
      </div>
    </div>
  );
} 