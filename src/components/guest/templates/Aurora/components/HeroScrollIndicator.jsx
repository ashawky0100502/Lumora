import { motion } from 'framer-motion';

export default function HeroScrollIndicator() {
  return (
    <motion.div
      className="aurora-scroll-indicator"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6, delay: 1.2, ease: 'easeOut' }}
    >
      <span className="aurora-scroll-line" />
      <span className="aurora-scroll-label">Scroll</span>
    </motion.div>
  );
}
