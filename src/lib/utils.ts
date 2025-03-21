import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function roundIfNumber(value: string | number | null) {
  if (typeof value === "number") {
    return parseFloat(value.toFixed(2));
  } else if (typeof value === "string") {
    const num = parseFloat(value);
    const rounded = parseFloat(num.toFixed(2));
    return rounded;
  }
  return value;
}

export function convertDateToString(
  date: Date | string,
  isDMY: boolean = true
): string {
  const timestampDate = new Date(date);
  const year = timestampDate.getFullYear();
  const month = String(timestampDate.getMonth() + 1).padStart(2, '0');
  const day = String(timestampDate.getDate()).padStart(2, '0');

  const formattedDate = isDMY
    ? `${day}/${month}/${year}`
    : `${year}/${month}/${day}`;
  return formattedDate;
}

export const PRICE_ID: string = "price_1PtqHJKoq4v6ODRvcFMOJ8By";

export function formatTimeDelta(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secs = Math.floor(seconds - hours * 3600 - minutes * 60);
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0) {
    parts.push(`${secs}s`);
  }
  return parts.join(" ");
}

/**
 * Gets the base URL for API calls, using the current origin in the browser
 * or a default URL based on the environment on the server
 */
export function getBaseUrl(): string {
  // In the browser, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // In server-side rendering, use a default URL based on the environment
  // This is only used for server-side rendering and will be replaced with the actual URL in the browser
  if (process.env.NODE_ENV === 'production') {
    return 'https://mdw-aquizi.web.app'; // Production URL
  }
  return 'http://localhost:3000'; // Development URL
}

/**
 * Detects if the application is currently running as a PWA
 * Checks for standalone mode, iOS standalone, or Android app referrer
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for display-mode: standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for iOS standalone mode
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  // Check for Android app referrer
  const isAndroidApp = document.referrer.includes('android-app://');
  
  return isStandalone || isIOSStandalone || isAndroidApp;
}