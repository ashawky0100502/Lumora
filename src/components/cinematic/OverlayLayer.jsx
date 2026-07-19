import { motion } from 'framer-motion';

export default function OverlayLayer({
  children,
  color = 'rgba(5, 7, 11, 0.28)',
  blend = 'multiply',
  className = '',
  style = {},
  motionProps = {},
}) {
  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: color,
    mixBlendMode: blend,
    pointerEvents: 'none',
    ...style,
  };

  return (
    <motion.div className={`lumora-overlay-layer ${className}`.trim()} style={overlayStyle} {...motionProps}>
      {children}
    </motion.div>
  );
}
