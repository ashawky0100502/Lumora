import { motion, useReducedMotion } from 'framer-motion';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export function SharedStorySection({ theme, story, title = 'Our Story', subtitle = '' }) {
  const prefersReducedMotion = useReducedMotion();
  const content = firstText(story);
  if (!content) return null;

  return (
    <motion.section
      className="mx-auto w-full max-w-2xl px-5"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="rounded-[22px] border px-6 py-8 shadow-sm"
        style={{
          background: theme.surface,
          borderColor: theme.surfaceBorder,
          color: theme.ink,
          fontFamily: theme.bodyFont,
        }}
      >
        <p className="mb-3 text-[0.68rem] uppercase tracking-[0.24em]" style={{ color: theme.accent, fontFamily: theme.uiFont }}>
          {subtitle || 'Our Story'}
        </p>
        <h2 className="mb-4 text-[1.4rem] leading-tight" style={{ color: theme.ink, fontFamily: theme.displayFont }}>
          {title}
        </h2>
        <p className="whitespace-pre-line text-[1.02rem] leading-[1.9]" style={{ color: theme.inkSoft }}>
          {content}
        </p>
      </div>
    </motion.section>
  );
}

export function SharedHowWeMetSection({ theme, content, title = 'How We Met' }) {
  const prefersReducedMotion = useReducedMotion();
  if (!content) return null;

  return (
    <motion.section
      className="mx-auto w-full max-w-2xl px-5"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="rounded-[22px] border px-6 py-8 shadow-sm"
        style={{
          background: theme.surface,
          borderColor: theme.surfaceBorder,
          color: theme.ink,
          fontFamily: theme.bodyFont,
        }}
      >
        <p className="mb-3 text-[0.68rem] uppercase tracking-[0.24em]" style={{ color: theme.accent, fontFamily: theme.uiFont }}>
          {title}
        </p>
        <p className="whitespace-pre-line text-[1.02rem] leading-[1.9]" style={{ color: theme.inkSoft }}>
          {content}
        </p>
      </div>
    </motion.section>
  );
}

export function SharedLifeStorySection({ theme, content, title = 'Life Story' }) {
  const prefersReducedMotion = useReducedMotion();
  if (!content) return null;

  return (
    <motion.section
      className="mx-auto w-full max-w-2xl px-5"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="rounded-[22px] border px-6 py-8 shadow-sm"
        style={{
          background: theme.surface,
          borderColor: theme.surfaceBorder,
          color: theme.ink,
          fontFamily: theme.bodyFont,
        }}
      >
        <p className="mb-3 text-[0.68rem] uppercase tracking-[0.24em]" style={{ color: theme.accent, fontFamily: theme.uiFont }}>
          {title}
        </p>
        <p className="whitespace-pre-line text-[1.02rem] leading-[1.9]" style={{ color: theme.inkSoft }}>
          {content}
        </p>
      </div>
    </motion.section>
  );
}
