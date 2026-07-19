import { useEffect, useState } from 'react';

// Below this width the dashboard switches from a permanent side-by-side
// sidebar to a collapsible overlay sidebar driven by the hamburger button.
const MOBILE_BREAKPOINT = 900;

function readIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/** True while the viewport is narrower than the mobile breakpoint. Updates
 * live on resize/orientation change, so rotating a phone or resizing a
 * browser window across the breakpoint re-renders automatically. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(readIsMobile);

  useEffect(() => {
    function handleResize() {
      setIsMobile(readIsMobile());
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isMobile;
}
