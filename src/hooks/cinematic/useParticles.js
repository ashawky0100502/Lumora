import { useMemo } from 'react';

export default function useParticles({ count = 24, spread = 100 } = {}) {
  return useMemo(() => Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${(index * 37) % 100}%`,
    top: `${(index * 29) % 100}%`,
    size: 2 + (index % 5),
    drift: (index % 7) * 0.02,
    opacity: 0.25 + ((index * 13) % 10) * 0.05,
    spread,
  })), [count, spread]);
}
