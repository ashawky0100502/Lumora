import { motion } from 'framer-motion';

export default function GlassOverlay({ texture }) {
  return (
    <motion.div
      className="aurora-layer aurora-layer--glass"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.9 }}
      transition={{ duration: 2.4, delay: 0.6, ease: 'easeOut' }}
    >
      <div className="aurora-glass" style={{ backgroundImage: `url(${texture})` }} />
    </motion.div>
  );
}
