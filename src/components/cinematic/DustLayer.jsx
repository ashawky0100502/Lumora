import { motion } from 'framer-motion';

export default function DustLayer({
  count = 48,
  color = 'rgba(255,255,255,0.72)',
  className = '',
  style = {},
  motionProps = {},
}) {
  const particles = Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${(index * 37) % 100}%`,
    top: `${(index * 29) % 100}%`,
    size: 2 + (index % 5),
    delay: index * 0.04,
  }));

  return (
    <motion.div className={`lumora-dust-layer ${className}`.trim()} style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', ...style }} {...motionProps}>
      {particles.map((particle) => (
        <span
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            borderRadius: '9999px',
            background: color,
            opacity: 0.35 + (particle.size % 5) * 0.08,
            filter: 'blur(0.2px)',
          }}
        />
      ))}
    </motion.div>
  );
}
