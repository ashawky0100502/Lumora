import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useMemo } from 'react';
import '../../debugRender';
import './timeline.css';

function normalizeTimeline(data) {
  const rawEvents = data?.timeline?.events || [];
  if (!rawEvents || !rawEvents.length) return [];
  return rawEvents
    .map((item) => ({
      title: item?.title || '',
      time: item?.time || '',
      description: item?.description || '',
      icon: item?.icon || '',
    }))
    .filter((e) => e.title || e.time || e.description);
}

export default function AuroraTimeline({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Timeline component mounted');
  }
  const { scrollYProgress } = useScroll();
  const lineScale = useSpring(useTransform(scrollYProgress, [0, 0.4], [0.1, 1]), { stiffness: 90, damping: 24 });

  const events = useMemo(() => normalizeTimeline(data), [data]);
  const introTitle = useMemo(() => data?.timeline?.title || '', [data]);
  const introCopy = useMemo(() => data?.timeline?.description || '', [data]);

  const particles = useMemo(() => Array.from({ length: 10 }, (_, index) => ({
    id: index,
    left: `${8 + (index % 5) * 16}%`,
    top: `${12 + (index % 4) * 16}%`,
  })), []);

  if (!events.length) return null;

  return (
    <section className="aurora-timeline" aria-labelledby="aurora-timeline-title">
      <div className="aurora-timeline__inner">
        <div className="aurora-timeline__intro">
          <p className="aurora-timeline__eyebrow">The day unfolds</p>
          <h2 id="aurora-timeline-title" className="aurora-timeline__title">{introTitle}</h2>
          <p className="aurora-timeline__copy">{introCopy}</p>
        </div>

        <div className="aurora-timeline__track">
          <motion.div
            className="aurora-timeline__line"
            initial={prefersReducedMotion ? false : { opacity: 0.2 }}
            whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ scaleY: prefersReducedMotion ? 1 : lineScale }}
          />
          <motion.div
            className="aurora-timeline__node"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.7 }}
            whileInView={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ opacity: prefersReducedMotion ? 1 : 0.95 }}
          />
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="aurora-timeline__particle"
              style={{ left: particle.left, top: particle.top }}
            />
          ))}

          {events.map((event, index) => {
            const isRight = index % 2 === 1;
            return (
              <motion.article
                key={`${event.title}-${index}`}
                className={`aurora-timeline__item${isRight ? ' aurora-timeline__item--right' : ''}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="aurora-timeline__card"
                  whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.01, boxShadow: '0 28px 60px rgba(85, 60, 30, 0.18)' }}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="aurora-timeline__card-top">
                    <div className="aurora-timeline__icon">{event.icon}</div>
                    <div className="aurora-timeline__meta">
                      <div className="aurora-timeline__title-text">{event.title}</div>
                      <div className="aurora-timeline__time">{event.time}</div>
                    </div>
                  </div>
                  <p className="aurora-timeline__description">{event.description}</p>
                </motion.div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
