import { motion } from 'framer-motion';

export default function LightRays({ image }) {
  return (
    <motion.div
      className="aurora-layer aurora-layer--light"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.34, 0.46, 0.34], x: [-4, 6, -4], rotate: [-0.14, 0.16, -0.14] }}
      transition={{ duration: 28, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <img src={image} alt="" className="aurora-light-image" loading="lazy" decoding="async" />
    </motion.div>
  );
}
