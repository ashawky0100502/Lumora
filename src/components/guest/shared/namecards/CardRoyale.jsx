import { motion } from 'framer-motion';

// ---------------- ROYALE — engraved formal stationery: laurel medallion, ----------------
// ---------------- double hairline border, small foil ticks at each edge ---------------
function Laurel({ color, flip }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" transform={flip ? 'scale(-1,1)' : undefined}>
      <path d="M0 20 C 6 14, 6 6, 2 0" />
      <path d="M1 17 C 6 16, 9 13, 9 9 C 5 9, 2 12, 1 17 Z" fill={color} fillOpacity="0.65" strokeWidth="0.6" />
      <path d="M0 12 C 5 11, 8 8, 8 4 C 4 4.5, 1.5 7.5, 0 12 Z" fill={color} fillOpacity="0.55" strokeWidth="0.6" />
      <path d="M-1 6 C 3 5, 5.5 3, 5.5 0 C 2.5 0.5, 0.5 2.5, -1 6 Z" fill={color} fillOpacity="0.45" strokeWidth="0.6" />
    </g>
  );
}

function EdgeTick({ color }) {
  return (
    <svg viewBox="0 0 40 14" className="h-3 w-10">
      <g fill="none" stroke={color} strokeWidth="1">
        <path d="M0 7 H14" />
        <path d="M26 7 H40" />
        <circle cx="20" cy="7" r="3.2" />
      </g>
    </svg>
  );
}

export default function CardRoyale({ theme, groom, bride, dateStr, kicker }) {
  const initials = `${(groom?.[0] || '').toUpperCase()}${(bride?.[0] || '').toUpperCase()}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: theme.duration, ease: theme.ease }}
      className="relative mx-auto w-full max-w-[440px] px-9 py-12 sm:px-14 sm:py-14"
      style={{
        background: theme.surface,
        border: `1px solid ${theme.surfaceBorder}`,
        boxShadow: `0 34px 90px -38px rgba(${theme.accentRgb},0.5)`,
      }}
    >
      {/* engraved double hairline */}
      <div className="pointer-events-none absolute inset-[7px]" style={{ border: `1px solid rgba(${theme.accentRgb},0.35)` }} />
      <div className="pointer-events-none absolute inset-[11px]" style={{ border: `1px solid rgba(${theme.accentRgb},0.16)` }} />

      <div className="relative flex flex-col items-center text-center">
        {/* laurel medallion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: theme.duration, ease: theme.ease }}
          className="mb-6 flex items-center justify-center"
        >
          <svg width="30" height="26" viewBox="0 0 22 22"><Laurel color={theme.accent} /></svg>
          <div
            className="mx-2.5 flex h-14 w-14 items-center justify-center rounded-full border text-[1.05rem] sm:h-16 sm:w-16"
            style={{ borderColor: `rgba(${theme.accentRgb},0.5)`, color: theme.accent, fontFamily: theme.displayFont, boxShadow: `inset 0 0 0 3px rgba(${theme.accentRgb},0.12)` }}
          >
            {initials}
          </div>
          <svg width="30" height="26" viewBox="0 0 22 22"><Laurel color={theme.accent} flip /></svg>
        </motion.div>

        {kicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger }}
            className="mb-5 text-[0.62rem] uppercase"
            style={{ color: theme.accent, letterSpacing: '0.42em', fontFamily: theme.uiFont }}
          >
            {kicker}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 2, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.7rem, 7vw, 2.6rem)', letterSpacing: '0.06em', lineHeight: 1.2 }}
        >
          {groom}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: theme.duration * 0.7, delay: theme.stagger * 3 }}
          className="my-3 flex items-center gap-3"
        >
          <span className="h-px w-8" style={{ background: `rgba(${theme.accentRgb},0.5)` }} />
          <span className="rotate-45" style={{ width: 6, height: 6, background: theme.accent, display: 'inline-block' }} />
          <span className="h-px w-8" style={{ background: `rgba(${theme.accentRgb},0.5)` }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 4, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.7rem, 7vw, 2.6rem)', letterSpacing: '0.06em', lineHeight: 1.2 }}
        >
          {bride}
        </motion.div>

        {dateStr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 6 }}
            className="mt-6 text-[0.85rem] uppercase"
            style={{ color: theme.inkSoft, letterSpacing: '0.18em', fontFamily: theme.uiFont }}
          >
            {dateStr}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 7 }}
          className="mt-5"
        >
          <EdgeTick color={`rgba(${theme.accentRgb},0.55)`} />
        </motion.div>
      </div>
    </motion.div>
  );
}
