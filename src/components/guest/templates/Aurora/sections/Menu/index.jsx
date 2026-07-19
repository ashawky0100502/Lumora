import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import '../../debugRender';
import './menu.css';

function normalizeMenu(data) {
  const sourceItems = Array.isArray(data?.menu?.items) ? data.menu.items : Array.isArray(data?.menu) ? data.menu : [];
  const items = sourceItems
    .map((item, index) => ({
      title: item?.title || item?.name || `Course ${index + 1}`,
      description: item?.description || item?.details || '',
      icon: item?.icon || '✦',
    }))
    .filter((item) => item.title || item.description);

  return {
    title: data?.menu?.title || 'Culinary Experience',
    description: data?.menu?.description || '',
    items,
  };
}

export default function AuroraMenu({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Menu component mounted');
  }
  const menu = useMemo(() => normalizeMenu(data), [data]);

  if (!menu.title && !menu.description && !menu.items.length) return null;

  return (
    <section className="aurora-menu" aria-labelledby="aurora-menu-title">
      <div className="aurora-menu__inner">
        <div className="aurora-menu__intro">
          <p className="aurora-menu__eyebrow">Culinary experience</p>
          <h2 id="aurora-menu-title" className="aurora-menu__title">CULINARY EXPERIENCE</h2>
          <p className="aurora-menu__copy">{menu.description}</p>
        </div>

        <motion.div
          className="aurora-menu__card"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aurora-menu__card-inner">
            <div className="aurora-menu__header">
              <h3 className="aurora-menu__header-title">{menu.title}</h3>
              <p className="aurora-menu__header-copy">A private dining invitation composed with warmth, precision, and quiet indulgence.</p>
            </div>

            <div className="aurora-menu__list">
              {menu.items.map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  className="aurora-menu__item"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.005 }}
                >
                  <div className="aurora-menu__icon">{item.icon}</div>
                  <div className="aurora-menu__item-content">
                    <div className="aurora-menu__item-title">{item.title}</div>
                    <p className="aurora-menu__item-description">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="aurora-menu__particles" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} className="aurora-menu__particle" style={{ left: `${12 + index * 10}%`, top: `${20 + (index % 4) * 14}%` }} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
