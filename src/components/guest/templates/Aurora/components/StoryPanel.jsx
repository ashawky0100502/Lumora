import { motion, useReducedMotion } from 'framer-motion';

export default function StoryPanel({ title, body, signature }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="aurora-story-panel"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24, filter: 'blur(6px)' }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
    >
      <p className="aurora-story-eyebrow">The Story</p>
      <h2 className="aurora-story-title">{title}</h2>
      <div className="aurora-story-divider" />
      <p className="aurora-story-body">{body}</p>
      <p className="aurora-story-signature">{signature}</p>
    </motion.div>
  );
}
