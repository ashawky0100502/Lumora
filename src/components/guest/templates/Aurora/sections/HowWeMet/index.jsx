import { motion, useReducedMotion } from 'framer-motion';
import '../Engagement/engagement.css';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export default function AuroraHowWeMet({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  const title = firstText(data?.howWeMet?.title, 'How We Met');
  const content = firstText(data?.howWeMet?.content, data?.howWeMet, data?.story?.intro, data?.story?.description);

  if (!content) return null;

  return (
    <motion.section
      className="aurora-engagement aurora-how-we-met"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="aurora-premium-surface aurora-premium-card">
        <p className="aurora-premium-eyebrow">How We Met</p>
        <h2 className="aurora-premium-title">{title}</h2>
        <p className="aurora-premium-body">{content}</p>
      </div>
    </motion.section>
  );
}
