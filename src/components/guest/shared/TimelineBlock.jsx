import { motion } from 'framer-motion';
import { SectionHeading } from './GuestUI';
import Reveal from './Reveal';

export default function TimelineBlock({ theme, items, t }) {
  if (!items || items.length === 0) return null;

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-lg px-5">
      <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />
      <div className="relative pl-8">
        <motion.div
          className="absolute left-[9px] top-1 w-px"
          style={{ background: `rgba(${theme.accentRgb},0.3)` }}
          initial={{ height: 0 }}
          whileInView={{ height: '100%' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: theme.duration * 1.4, ease: theme.ease }}
        />
        <div className="flex flex-col gap-7">
          {items.map((it, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{ duration: theme.duration * 0.7, delay: i * theme.stagger, ease: theme.ease }}
            >
              <span
                className="absolute -left-8 top-1 h-[9px] w-[9px] rounded-full"
                style={{ background: theme.accent, boxShadow: `0 0 0 4px rgba(${theme.accentRgb},0.15)` }}
              />
              <div className="text-[0.72rem] uppercase" style={{ color: theme.accent, letterSpacing: '0.14em', fontFamily: theme.uiFont }}>
                {it.time}
              </div>
              <div className="mt-0.5 text-[1.02rem]" style={{ color: theme.ink, fontFamily: theme.bodyFont }}>
                {it.title}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
