import { useEffect, useRef, useState } from 'react';

/**
 * One shared reveal-on-scroll primitive, reused by every section below
 * Hero instead of each section wiring up its own IntersectionObserver.
 *
 * Returns [ref, isVisible]. Attach `ref` to the element that should
 * fade + translateY into place; toggle a class off `isVisible` in CSS.
 *
 * - Reveals once and stops observing (no re-triggering on scroll back up).
 * - Respects prefers-reduced-motion by revealing immediately.
 * - Falls back to immediately visible if IntersectionObserver isn't
 *   available, so content is never accidentally hidden.
 */
export default function useScrollReveal({ threshold = 0.2, rootMargin = '0px 0px -10% 0px' } = {}) {
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isVisible];
}
