import { motion } from 'framer-motion';

// ---------------- WAX — a folded parchment letter: deckle-torn edges, a real ----------------
// ---------------- wax-seal medallion pressed over the fold, date as a postmark --------------
const DECKLE_TOP =
  'polygon(0% 6px,3% 0,7% 5px,12% 1px,17% 6px,22% 0,27% 4px,33% 1px,38% 6px,43% 0,48% 5px,53% 1px,58% 6px,63% 0,68% 4px,73% 1px,78% 6px,83% 0,88% 5px,93% 1px,97% 6px,100% 0,100% 100%,0 100%)';

function Seal({ theme, initials }) {
  return (
    <div className="relative -mt-14 mb-5 flex h-16 w-16 items-center justify-center rounded-full sm:-mt-16 sm:h-[4.5rem] sm:w-[4.5rem]" style={{ boxShadow: '0 10px 20px rgba(60,15,15,0.35)' }}>
      <svg viewBox="0 0 72 72" className="absolute inset-0">
        <defs>
          <radialGradient id="waxgrad" cx="35%" cy="28%" r="75%">
            <stop offset="0%" stopColor={theme.accentSoft} />
            <stop offset="100%" stopColor={theme.accent} />
          </radialGradient>
        </defs>
        {/* irregular drip silhouette */}
        <path
          d="M36 4 C50 4 62 10 65 22 C68 33 62 38 66 47 C69 55 60 62 50 63 C44 68 30 68 24 62 C13 62 6 54 8 44 C4 36 8 27 14 22 C15 11 24 4 36 4 Z"
          fill="url(#waxgrad)"
        />
        <circle cx="36" cy="35" r="24" fill="none" stroke="#3a1010" strokeOpacity="0.35" strokeWidth="1" />
      </svg>
      <span className="relative" style={{ color: '#3a1010', fontFamily: theme.displayFont, fontSize: '1.15rem', letterSpacing: '0.03em' }}>
        {initials}
      </span>
    </div>
  );
}

export default function CardWax({ theme, groom, bride, dateStr, kicker }) {
  const initials = `${(groom?.[0] || '').toUpperCase()}${(bride?.[0] || '').toUpperCase()}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98, rotate: -0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: -0.6 }}
      transition={{ duration: theme.duration, ease: theme.ease }}
      className="relative mx-auto w-full max-w-[400px] px-8 pb-11 pt-4 sm:px-11"
      style={{
        background: 'linear-gradient(165deg,#fbf3e6,#f0e2cd 60%,#e8d6ba)',
        clipPath: DECKLE_TOP,
        boxShadow: '0 34px 80px -34px rgba(60,30,15,0.4), 0 0 0 1px rgba(140,60,55,0.14)',
      }}
    >
      <div className="relative flex flex-col items-center text-center">
        <Seal theme={theme} initials={initials} />

        {kicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger }}
            className="mb-4 text-[0.6rem] uppercase"
            style={{ color: theme.accent, letterSpacing: '0.34em', fontFamily: theme.uiFont }}
          >
            {kicker}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 2, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.8rem, 7.5vw, 2.7rem)', letterSpacing: '0.02em', lineHeight: 1.15 }}
        >
          {groom}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: theme.duration * 0.7, delay: theme.stagger * 3 }}
          className="my-2 flex items-center gap-2"
        >
          <span className="h-px w-6" style={{ background: 'rgba(31,45,61,0.3)' }} />
          <span className="text-[0.85rem] italic" style={{ color: theme.accent, fontFamily: theme.bodyFont }}>&amp;</span>
          <span className="h-px w-6" style={{ background: 'rgba(31,45,61,0.3)' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 4, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.8rem, 7.5vw, 2.7rem)', letterSpacing: '0.02em', lineHeight: 1.15 }}
        >
          {bride}
        </motion.div>

        {dateStr && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 6 }}
            className="mt-6 flex items-center justify-center rounded-full px-5 py-2 text-[0.75rem] uppercase"
            style={{ border: `1px dashed rgba(31,45,61,0.4)`, color: theme.ink, letterSpacing: '0.1em', fontFamily: theme.uiFont }}
          >
            {dateStr}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
