/**
 * Utilities for handling application version checking and updates
 */

/**
 * Gets the current build timestamp from environment variables or generates a fallback
 */
export function getCurrentBuildTime(): string {
  return process.env.NEXT_PUBLIC_BUILD_TIME || Date.now().toString();
}

/**
 * Checks if a new version of the application is available
 * @returns boolean indicating if a new version is available
 */
export function checkForNewVersion(): boolean {
  // Only run in browser
  if (typeof window === 'undefined') return false;
  
  const currentBuildTime = getCurrentBuildTime();
  const storedBuildTime = localStorage.getItem('buildTime');
  
  // If there's no stored build time, this is the first visit
  if (!storedBuildTime) {
    localStorage.setItem('buildTime', currentBuildTime);
    return false;
  }
  
  // Return true if the build times don't match (new version available)
  return storedBuildTime !== currentBuildTime;
}

/**
 * Updates the stored build timestamp to the current one
 */
export function updateStoredBuildTime(): void {
  if (typeof window === 'undefined') return;
  
  const currentBuildTime = getCurrentBuildTime();
  localStorage.setItem('buildTime', currentBuildTime);
}

/**
 * Refreshes the page and updates the stored build timestamp
 */
export function refreshWithNewVersion(): void {
  updateStoredBuildTime();
  window.location.reload();
} 