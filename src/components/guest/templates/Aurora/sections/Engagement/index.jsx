import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import '../../debugRender';
import './engagement.css';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export default function AuroraEngagement({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Engagement component mounted');
  }
  const enabled = data?.engagement?.enabled !== false && data?.sections?.engagement !== false;

  const title = firstText(data?.engagement?.title) || '';
  const description = firstText(data?.engagement?.description) || '';
  const date = firstText(data?.engagement?.date) || '';
  const location = firstText(data?.engagement?.location) || '';
  const timeline = useMemo(() => {
    const source = data?.engagement?.timeline || [];
    if (Array.isArray(source)) {
      return source
        .map((item) => ({
          label: firstText(item?.label, item?.title, item?.name),
          value: firstText(item?.value, item?.time, item?.description),
        }))
        .filter((item) => item.label || item.value);
    }
    return [];
  }, [data]);
  const images = useMemo(() => (data?.engagement?.images || []), [data]);
  const story = firstText(data?.engagement?.story) || '';

  if (!enabled) return null;
  if (!title && !description && !date && !location && !timeline.length && !images.length && !story) return null;

  return (
    <section className="aurora-engagement" aria-labelledby="aurora-engagement-title">
      <div className="aurora-engagement__inner">
        <motion.div
          className="aurora-engagement__copy"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="aurora-engagement__eyebrow">Private story</p>
          <h2 id="aurora-engagement-title" className="aurora-engagement__title">{title}</h2>
          {description ? <p className="aurora-engagement__description">{description}</p> : null}
          <div className="aurora-engagement__meta">
            {date ? <div className="aurora-engagement__detail">{date}</div> : null}
            {location ? <div className="aurora-engagement__detail">{location}</div> : null}
          </div>
          {timeline.length ? (
            <div className="aurora-engagement__timeline" aria-label="Engagement timeline">
              {timeline.map((item, index) => (
                <div key={`${item.label}-${index}`} className="aurora-engagement__timeline-item">
                  <span className="aurora-engagement__timeline-label">{item.label}</span>
                  <span className="aurora-engagement__timeline-value">{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}
          {story ? <p className="aurora-engagement__description">{story}</p> : null}
        </motion.div>

        {images.length ? (
          <motion.div
            className="aurora-engagement__gallery"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {images.slice(0, 4).map((image, index) => (
              <img key={`${image.src}-${index}`} className="aurora-engagement__image" src={image.src} alt={title || 'Engagement image'} loading="lazy" decoding="async" />
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
