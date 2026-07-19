import { motion } from 'framer-motion';

export default function Typography({ title, subtitle, caption }) {
  return (
    <motion.div
      className="aurora-typography"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.6, delay: 0.9, ease: 'easeOut' }}
    >
      <div className="aurora-typography-card">
        <p className="aurora-subtitle">{subtitle}</p>
        <h1 className="aurora-title">{title}</h1>
        <p className="aurora-caption">{caption}</p>
      </div>
    </motion.div>
  );
}
