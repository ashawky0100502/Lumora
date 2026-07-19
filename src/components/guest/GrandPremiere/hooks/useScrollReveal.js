import { useEffect, useRef, useState } from 'react';
import { findScrollParent } from './scrollParent';

/**
 * GRAND PREMIERE — shared scroll-reveal primitive (Phase 6).
 *
 * Returns [ref, isVisible]. Attach `ref` to the element that should
 * fade/rise into place; toggle a class off `isVisible` in CSS.
 *
 * Uses the template's real scroll container (`.gp-root`) as the
 * IntersectionObserver root — the app shell is `overflow: hidden`, so
 * the viewport is not what scrolls; observing against it leaves
 * sections permanently at opacity 0.
 */
export default function useScrollReveal({ threshold = 0.2, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const scrollRoot = findScrollParent(node);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
        root: scrollRoot,
      }
    );

    observer.observe(node);

    // If the node is already on screen when mounted (late async sections),
    // IntersectionObserver may not fire until the next scroll tick.
    const rect = node.getBoundingClientRect();
    const rootRect = scrollRoot
      ? scrollRoot.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight, height: window.innerHeight };
    const visibleTop = Math.max(rect.top, rootRect.top);
    const visibleBottom = Math.min(rect.bottom, rootRect.bottom);
    if (visibleBottom - visibleTop > rect.height * threshold) {
      setIsVisible(true);
      observer.unobserve(node);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isVisible];
}
