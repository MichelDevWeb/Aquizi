/**
 * Utility to fix the iOS Safari 100vh issue
 * iOS Safari includes the address bar in the viewport height calculation,
 * which causes issues with 100vh elements
 */

export function setupViewportHeight() {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Set the --vh custom property to the actual viewport height
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  // Set the value on initial load
  setVh();
  
  // Update the value on resize
  window.addEventListener('resize', setVh);
  
  // Update on orientation change (especially important for mobile)
  window.addEventListener('orientationchange', () => {
    // Small delay to ensure the browser has updated the viewport dimensions
    setTimeout(setVh, 100);
  });
  
  return () => {
    // Cleanup function
    window.removeEventListener('resize', setVh);
    window.removeEventListener('orientationchange', setVh);
  };
} 