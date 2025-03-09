"use client";

import React, { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { checkForNewVersion, refreshWithNewVersion, updateStoredBuildTime } from '@/lib/version-utils';

/**
 * Component that checks for new app versions and shows a toast notification
 * when an update is available, allowing users to refresh the page.
 */
export default function UpdateNotification() {
  const { toast } = useToast();

  // Check for new version on component mount
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if there's a new version available
    const hasNewVersion = checkForNewVersion();
    
    // Always update the stored build time to prevent notification after manual refresh
    updateStoredBuildTime();
    
    // If there's a new version, show the notification
    if (hasNewVersion) {
      toast({
        title: "New version available!",
        description: "A new version of the app is available. Reload to update.",
        duration: Infinity, // Toast won't auto-close
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshWithNewVersion}
            className="gap-1 items-center"
          >
            <RefreshCw className="h-4 w-4" />
            Update Now
          </Button>
        ),
      });
    }
  }, [toast]);

  return null; // This component doesn't render anything
} 