import { useMemo } from 'react';

export default function useParallax({ x = 0, y = 0, scale = 1 } = {}) {
  return useMemo(() => ({
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    transformOrigin: 'center center',
  }), [x, y, scale]);
}
