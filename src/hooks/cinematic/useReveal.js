import { useMemo } from 'react';

export default function useReveal({ delay = 0, duration = 0.8 } = {}) {
  return useMemo(() => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration, ease: 'easeOut' },
  }), [delay, duration]);
}
