import { motion } from 'framer-motion';

const particles = [
  { id: 1, left: '12%', top: '20%', size: '8px', duration: 24, delay: 0 },
  { id: 2, left: '24%', top: '34%', size: '6px', duration: 26, delay: 2.2 },
  { id: 3, left: '42%', top: '18%', size: '9px', duration: 28, delay: 4.3 },
  { id: 4, left: '61%', top: '24%', size: '7px', duration: 25, delay: 5.6 },
  { id: 5, left: '77%', top: '28%', size: '8px', duration: 27, delay: 1.2 },
  { id: 6, left: '30%', top: '62%', size: '6px', duration: 30, delay: 3.1 },
  { id: 7, left: '54%', top: '58%', size: '7px', duration: 23, delay: 7.1 },
  { id: 8, left: '82%', top: '54%', size: '6px', duration: 26, delay: 6.2 },
];

export default function DustParticles({ texture }) {
  return (
    <motion.div className="aurora-layer aurora-layer--dust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.4, delay: 0.8, ease: 'easeOut' }}>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="aurora-particle"
          initial={{ opacity: 0, y: 18, scale: 0.9 }}
          animate={{ opacity: [0, 0.32, 0], y: [14, -8, -18], x: [0, 2, 1], scale: [0.9, 1, 0.95] }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeOut' }}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            backgroundImage: texture ? `url(${texture})` : 'none',
          }}
        />
      ))}
    </motion.div>
  );
}
