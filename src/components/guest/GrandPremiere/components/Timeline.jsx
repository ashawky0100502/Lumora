import { useEffect, useRef, useState } from 'react';
import { guestCopy } from '../../../../lib/guestCopy';
import useScrollProgress from '../hooks/useScrollProgress';
import useScrollReveal from '../hooks/useScrollReveal';
import { findScrollParent } from '../hooks/scrollParent';

function firstText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

function resolveItems(data) {
  const raw = Array.isArray(data?.timeline) ? data.timeline : [];

  return raw
    .map((item) => {
      if (!item) return null;
      const time = firstText(item.time, item.hour, item.label);
      const title = firstText(item.title, item.event, item.name);
      const description = firstText(item.description, item.details, item.text);
      if (!time && !title && !description) return null;
      return { time, title, description };
    })
    .filter(Boolean);
}

const TIMELINE_ICONS = [
  (lit) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="gp-timeline__icon-svg">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={lit ? 1 : 0.5} />
      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  (lit) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="gp-timeline__icon-svg">
      <path
        d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.7L12 16.4 6.4 20.5l2.1-6.7L3 9.8h6.8L12 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity={lit ? 1 : 0.5}
      />
    </svg>
  ),
  (lit) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="gp-timeline__icon-svg">
      <path
        d="M6 18c0-3.3 2.7-8 6-8s6 4.7 6 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.3" opacity={lit ? 1 : 0.5} />
    </svg>
  ),
  (lit) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="gp-timeline__icon-svg">
      <path
        d="M4 14c2.5-4 5-6 8-6s5.5 2 8 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M8 10l1.5 1.5M16 10l-1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
];

function useScrollActive() {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const scrollRoot = findScrollParent(node);
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { root: scrollRoot, threshold: 0.35, rootMargin: '-32% 0px -32% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, active];
}

function TimelineEvent({ item, index }) {
  const [stopRef, active] = useScrollActive();
  const [cardRef, visible] = useScrollReveal({ threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  const side = index % 2 === 0 ? 'left' : 'right';
  const Icon = TIMELINE_ICONS[index % TIMELINE_ICONS.length];
  const past = visible && !active;
  const lit = active || past;

  return (
    <li
      ref={stopRef}
      className={[
        'gp-timeline__stop',
        `gp-timeline__stop--${side}`,
        visible && 'gp-timeline__stop--revealed',
        active && 'gp-timeline__stop--active',
        past && 'gp-timeline__stop--past',
        !visible && 'gp-timeline__stop--future',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="gp-timeline__node" aria-hidden="true">
        <span className="gp-timeline__node-halo" />
        <span className="gp-timeline__node-core" />
      </div>

      <article
        ref={cardRef}
        className={`gp-timeline__card gp-reveal ${visible ? 'gp-reveal--visible' : ''}`}
      >
        <div className="gp-timeline__card-shine" aria-hidden="true" />
        <div className="gp-timeline__card-border" aria-hidden="true" />

        <div className={`gp-timeline__icon ${lit ? 'gp-timeline__icon--lit' : ''}`}>{Icon(lit)}</div>

        {item.time && <time className="gp-timeline__time">{item.time}</time>}
        {item.title && <h3 className="gp-timeline__stop-title">{item.title}</h3>}
        {item.description && <p className="gp-timeline__desc">{item.description}</p>}
      </article>
    </li>
  );
}

export default function Timeline({ data }) {
  const items = resolveItems(data);
  const [journeyRef, progress] = useScrollProgress();

  if (!items.length) return null;

  const language = data?.language;
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const copy = guestCopy(language).timeline;

  return (
    <section
      className="gp-timeline"
      id="timeline"
      data-section="timeline"
      dir={dir}
      style={{ '--gp-progress': progress, '--gp-stops': items.length }}
    >
      <div className="gp-timeline__scene" aria-hidden="true">
        <div className="gp-timeline__fog" />
        <div className="gp-timeline__rays" />
        <div className="gp-timeline__particles">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="gp-timeline__particle" style={{ '--gp-particle-i': i }} />
          ))}
        </div>
        <div className="gp-timeline__vignette" />
      </div>

      <header className="gp-timeline__masthead">
        <span className="gp-timeline__kicker">{copy.kicker}</span>
        <h2 className="gp-timeline__title">{copy.title}</h2>
        <span className="gp-timeline__rule" aria-hidden="true" />
      </header>

      <div className="gp-timeline__journey" ref={journeyRef}>
        <div className="gp-timeline__spine" aria-hidden="true">
          <div className="gp-timeline__path-base" />
          <div className="gp-timeline__path-glow" />
          <div className="gp-timeline__path-fill" />
        </div>

        <ol className="gp-timeline__events">
          {items.map((item, index) => (
            <TimelineEvent
              key={`${item.time}-${item.title}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
