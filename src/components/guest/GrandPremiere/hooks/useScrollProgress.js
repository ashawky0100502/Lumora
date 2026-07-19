import { useEffect, useRef, useState } from 'react';
import { findScrollParent } from './scrollParent';

/**
 * GRAND PREMIERE — scroll-progress primitive (Phase 8).
 *
 * Returns [ref, progress]. Attach `ref` to `.gp-timeline__stage`.
 * Progress is 0 before the pin begins, rises monotonically to 1 as the
 * guest scrolls through the pin, and stays at 1 once the pin ends.
 */
export default function useScrollProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const maxProgressRef = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof window === 'undefined') {
      setProgress(1);
      return undefined;
    }

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setProgress(1);
      return undefined;
    }

    const pinnedQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 861px)') : null;

    const measure = () => {
      rafRef.current = null;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isPinned = pinnedQuery ? pinnedQuery.matches : false;

      let raw;
      if (isPinned && rect.height > viewportHeight) {
        const pinRange = rect.height - viewportHeight;
        raw = pinRange > 0 ? -rect.top / pinRange : 1;
      } else {
        const span = rect.height + viewportHeight;
        if (span <= 0) return;
        raw = (viewportHeight - rect.top) / span;
      }

      const clamped = Math.min(1, Math.max(0, raw));
      // Monotonic forward progress — sticky/layout jitter must never
      // make the path or plaques feel like they rewind mid-scroll.
      maxProgressRef.current = Math.max(maxProgressRef.current, clamped);
      setProgress(maxProgressRef.current);
    };

    const requestMeasure = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(measure);
    };

    const scrollTarget = findScrollParent(node) || window;

    measure();
    scrollTarget.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return [ref, progress];
}
