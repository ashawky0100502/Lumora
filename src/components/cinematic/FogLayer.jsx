import { motion } from 'framer-motion';

export default function FogLayer({
  color = 'rgba(255,255,255,0.24)',
  blur = 70,
  opacity = 0.6,
  className = '',
  style = {},
  motionProps = {},
}) {
  const fogStyle = {
    position: 'absolute',
    inset: '-10% -5%',
    zIndex: 2,
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    filter: `blur(${blur}px)`,
    opacity,
    pointerEvents: 'none',
    ...style,
  };

  return (
    <motion.div className={`lumora-fog-layer ${className}`.trim()} style={fogStyle} {...motionProps} />
  );
}
