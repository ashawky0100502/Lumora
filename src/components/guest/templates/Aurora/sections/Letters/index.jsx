import { motion, useReducedMotion } from 'framer-motion';
import '../Engagement/engagement.css';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export default function AuroraLetters({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  const groomLetter = firstText(data?.letters?.groom, data?.letterGroom);
  const brideLetter = firstText(data?.letters?.bride, data?.letterBride);
  const hasContent = Boolean(groomLetter || brideLetter);

  if (!hasContent) return null;

  return (
    <motion.section
      className="aurora-engagement aurora-letters"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="aurora-premium-surface aurora-premium-card" style={{ maxWidth: '980px' }}>
        {groomLetter ? (
          <div>
            <p className="aurora-premium-eyebrow">Letter from the groom</p>
            <p className="aurora-premium-body">{groomLetter}</p>
          </div>
        ) : null}
        {brideLetter ? (
          <div>
            <p className="aurora-premium-eyebrow">Letter from the bride</p>
            <p className="aurora-premium-body">{brideLetter}</p>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
