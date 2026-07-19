import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionHeading } from './GuestUI';
import Reveal from './Reveal';

export default function GalleryBlock({ theme, photos, t }) {
  const [active, setActive] = useState(null);
  if (!photos || photos.length === 0) return null;

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-3xl px-5">
      <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />
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
