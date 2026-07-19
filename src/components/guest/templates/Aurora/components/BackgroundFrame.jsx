import { motion } from 'framer-motion';

export default function BackgroundFrame({ image, alt = 'Aurora cinematic background' }) {
  return (
    <motion.div
      className="aurora-layer aurora-layer--background"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
      transition={{ duration: 24, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <img
        src={image}
        alt={alt}
        className="aurora-image aurora-image--background"
        loading="lazy"
        decoding="async"
      />
    </motion.div>
  );
}
