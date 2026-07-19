import { useMemo } from 'react';

export default function useAmbientLight({ color = '#f6d18b', intensity = 0.5, position = { x: 50, y: 25 } } = {}) {
  return useMemo(() => ({
    color,
    intensity,
    position,
    style: {
      left: `${position.x}%`,
      top: `${position.y}%`,
      opacity: intensity,
      background: color,
    },
  }), [color, intensity, position]);
}
