import { motion } from 'framer-motion';

export default function MarbleReflection({ texture }) {
  return (
    <motion.div
      className="aurora-layer aurora-layer--marble"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 0.9, y: 0 }}
      transition={{ duration: 2.2, delay: 0.4, ease: 'easeOut' }}
    >
      <div className="aurora-marble" style={{ backgroundImage: `url(${texture})` }} />
    </motion.div>
  );
}
