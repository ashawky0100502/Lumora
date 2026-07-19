import { motion, useReducedMotion } from 'framer-motion';
import './transition-card.css';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export default function AuroraTransitionCoupleCard({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  const groomName = firstText(data?.names?.groom, data?.groom?.name, data?.couple?.groom?.name);
  const brideName = firstText(data?.names?.bride, data?.bride?.name, data?.couple?.bride?.name);
  const coupleName = firstText(data?.names?.coupleName, data?.coupleName);
  const weddingDate = firstText(data?.hero?.date, data?.weddingDate, data?.date);
  const venueName = firstText(data?.venue?.name, data?.location?.name);

  const displayNames = [groomName, brideName].filter(Boolean);
  const headline = displayNames.length === 2 ? `${groomName} & ${brideName}` : coupleName || 'Our Celebration';

  return (
    <motion.section
      className="aurora-transition-card"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="aurora-transition-card__surface">
        <div className="aurora-transition-card__glow" />
        <p className="aurora-transition-card__eyebrow">With love</p>
        <h2 className="aurora-transition-card__title">{headline}</h2>
        <div className="aurora-transition-card__divider" />
        <p className="aurora-transition-card__date">{weddingDate || 'A celebration to remember'}</p>
        {venueName ? <p className="aurora-transition-card__venue">{venueName}</p> : null}
      </div>
    </motion.section>
  );
}
