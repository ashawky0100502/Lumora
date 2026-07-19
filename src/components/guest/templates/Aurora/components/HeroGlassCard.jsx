import { motion } from 'framer-motion';

export default function HeroGlassCard({ children, className = '', style = {} }) {
  return (
    <motion.div
      className={`aurora-hero-card ${className}`.trim()}
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: [0, 0.4, 0] }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
