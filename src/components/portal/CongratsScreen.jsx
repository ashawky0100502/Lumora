import { motion } from 'framer-motion';
import { GuestButton } from '../guest/shared/GuestUI';
import { coupleCopy } from '../../lib/coupleCopy';

function Sparkles({ theme }) {
  const dots = Array.from({ length: 22 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => {
        const left = (i * 4.6) % 100;
        const size = 2 + (i % 4);
        const delay = 0.2 + (i % 9) * 0.18;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              bottom: -10,
              width: size,
              height: size,
              background: `radial-gradient(circle, ${theme.accentSoft}, ${theme.accent})`,
              boxShadow: `0 0 8px rgba(${theme.accentRgb},0.8)`,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -520 - (i % 5) * 40, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4.5 + (i % 6) * 0.5, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.2 }}
          />
        );
      })}
    </div>
  );
}

export default function CongratsScreen({ theme, lang, groom, bride, onContinue }) {
  const t = coupleCopy(lang);
  const coupleNames = lang === 'ar' ? `${groom} و${bride}` : `${groom} & ${bride}`;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden px-6"
      style={{ background: theme.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
      transition={{ duration: 0.9, ease: theme.ease }}
    >
      <Sparkles theme={theme} />

      <div className="relative z-10 max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: theme.ease }}
          className="mb-6 text-[0.68rem] uppercase"
          style={{ color: theme.accent, fontFamily: theme.uiFont, letterSpacing: '0.5em' }}
        >
          {t.congratsKicker}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: theme.duration, delay: 0.45, ease: theme.ease }}
          style={{
            color: theme.ink,
            fontFamily: theme.displayFont,
            fontSize: 'clamp(1.9rem, 7vw, 2.8rem)',
            letterSpacing: '0.04em',
            lineHeight: 1.3,
          }}
        >
          {coupleNames}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: theme.ease }}
          className="mx-auto mt-5 max-w-[380px] text-[1.05rem] italic leading-[1.8]"
          style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}
        >
          {t.congratsLine1}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15, ease: theme.ease }}
          className="mx-auto mt-3 max-w-[380px] text-[0.9rem] leading-relaxed"
          style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}
        >
          {t.congratsLine2}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.55, ease: theme.ease }}
          className="mt-9"
        >
          <GuestButton theme={theme} onClick={onContinue}>
            {t.congratsContinue}
          </GuestButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
