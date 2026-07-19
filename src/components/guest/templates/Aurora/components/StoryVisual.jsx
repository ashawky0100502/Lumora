import { motion, useReducedMotion } from 'framer-motion';

export default function StoryVisual({ image, accentImage, glassTexture, dustTexture }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="aurora-story-visual"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 1.3, ease: 'easeOut' }}
    >
      <div className="aurora-story-frame">
        <img className="aurora-story-image" src={image} alt="Aurora story scene" loading="lazy" decoding="async" />
        <div className="aurora-story-glass" style={{ backgroundImage: `url(${glassTexture})` }} />
        <div className="aurora-story-marble" style={{ backgroundImage: `url(${accentImage})` }} />
        <div className="aurora-story-dust" style={{ backgroundImage: `url(${dustTexture})` }} />
      </div>
    </motion.div>
  );
}
