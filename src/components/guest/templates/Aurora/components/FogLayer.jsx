import { motion } from 'framer-motion';

export default function FogLayer({ image }) {
  return (
    <motion.div
      className="aurora-layer aurora-layer--fog"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.12, 0.2, 0.12], x: [-6, 8, -6], y: [0, -4, 0] }}
      transition={{ duration: 30, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <img src={image} alt="" className="aurora-fog-image" loading="lazy" decoding="async" />
    </motion.div>
  );
}
