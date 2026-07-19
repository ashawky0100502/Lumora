import { motion } from 'framer-motion';

export default function TypographyReveal({
  children,
  as: Component = 'div',
  delay = 0,
  duration = 0.8,
  className = '',
  style = {},
}) {
  return (
    <motion.div
      as={Component}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
