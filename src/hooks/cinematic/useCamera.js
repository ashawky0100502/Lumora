import { useMemo } from 'react';

export default function useCamera({ offsetX = 0, offsetY = 0, scale = 1 } = {}) {
  return useMemo(() => ({
    offsetX,
    offsetY,
    scale,
    style: {
      transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
      transformOrigin: 'center center',
    },
  }), [offsetX, offsetY, scale]);
}
