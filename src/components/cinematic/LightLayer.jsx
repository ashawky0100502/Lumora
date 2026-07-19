import { motion } from 'framer-motion';

export default function LightLayer({
  color = '#f6d18b',
  intensity = 0.5,
  position = { x: 50, y: 25 },
  size = 44,
  blur = 90,
  className = '',
  style = {},
  motionProps = {},
}) {
  const lightStyle = {
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${size}vw`,
    height: `${size}vw`,
    transform: 'translate(-50%, -50%)',
    borderRadius: '9999px',
    background: color,
    filter: `blur(${blur}px)`,
    opacity: intensity,
    pointerEvents: 'none',
    zIndex: 1,
    ...style,
  };

  return (
    <motion.div className={`lumora-light-layer ${className}`.trim()} style={lightStyle} {...motionProps} />
  );
}
