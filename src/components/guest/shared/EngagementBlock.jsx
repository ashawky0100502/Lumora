import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestCard, SectionHeading } from './GuestUI';
import Reveal from './Reveal';

// Small per-decor accents — kept intentionally light (an icon + a warmer
// tint) rather than heavy ornamentation, so it still works across every
// theme's color palette.
const DECOR = {
  floral: { icon: '✿', tint: 0.08 },
  candles: { icon: '🕯', tint: 0.1 },
  fairylights: { icon: '✦', tint: 0.09 },
  none: { icon: null, tint: 0.045 },
};

export default function EngagementBlock({ theme, groom, bride, engagementDate, engagementStory, engagementPhotos, engagementDecor, lang, t }) {
  const [active, setActive] = useState(null);
  const photos = engagementPhotos || [];
  const hasContent = Boolean(engagementStory || engagementDate || photos.length > 0);
  if (!hasContent) return null;

  const decor = DECOR[engagementDecor] || DECOR.none;
  const dateStr = engagementDate
    ? new Date(engagementDate).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-2xl px-5">
      <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />

      {(engagementStory || dateStr) && (
        <GuestCard theme={theme} className="mb-6" style={{ background: `rgba(${theme.accentRgb},${decor.tint})` }}>
          {decor.icon && (
            <div className="mb-3 text-center text-[1.1rem]" style={{ color: theme.accent }}>
              {decor.icon}
            </div>
          )}
          {dateStr && (
            <div
              className="mb-3 text-center text-[0.68rem] uppercase"
              style={{ color: theme.accent, letterSpacing: '0.24em', fontFamily: theme.uiFont }}
            >
              {dateStr}
            </div>
          )}
          {engagementStory && (
            <p
              className="whitespace-pre-line text-center text-[1.02rem] italic leading-[1.9]"
              style={{ color: theme.ink, fontFamily: theme.bodyFont }}
            >
              {engagementStory}
            </p>
          )}
        </GuestCard>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((src, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setActive(src)}
              className="aspect-square overflow-hidden rounded-xl border"
              style={{ borderColor: theme.surfaceBorder }}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: theme.duration * 0.7, delay: i * (theme.stagger * 0.5), ease: theme.ease }}
              whileHover={{ scale: 1.03 }}
            >
              <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.img
              src={active}
              alt=""
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: theme.ease }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}
