import { motion } from 'framer-motion';

// ---------------- SILK — an arch-topped stationery card, a botanical branch ----------------
// ---------------- draping across the crown instead of corner stickers -------------------
function Branch({ color, soft }) {
  return (
    <svg viewBox="0 0 260 46" className="h-9 w-[210px] sm:h-11 sm:w-[240px]">
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round">
        <path d="M10 30 C 60 6, 130 4, 130 4 C 130 4, 200 6, 250 30" />
      </g>
      {[38, 66, 96, 164, 194, 222].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${i < 3 ? 22 - i * 3 : 22 - (5 - i) * 3} C ${x + 8} ${10 + (i % 2) * 4}, ${x + 14} ${8 + (i % 2) * 4}, ${x + 16} ${2 + (i % 2) * 3}`}
          stroke={color}
          strokeWidth="1"
          fill="none"
        />
      ))}
      {[46, 74, 172, 202].map((x, i) => (
        <ellipse key={x} cx={x} cy={14 - (i % 2) * 3} rx="5.5" ry="3.2" fill={soft} fillOpacity="0.65" transform={`rotate(${i % 2 ? 20 : -18} ${x} ${14 - (i % 2) * 3})`} />
      ))}
      <ellipse cx="130" cy="4" rx="4.5" ry="3" fill={color} fillOpacity="0.6" />
    </svg>
  );
}

export default function CardSilk({ theme, groom, bride, dateStr, kicker }) {
  const initials = `${(groom?.[0] || '').toUpperCase()}${(bride?.[0] || '').toUpperCase()}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: theme.duration, ease: theme.ease }}
      className="relative mx-auto w-full max-w-[420px] px-8 pb-12 pt-16 sm:px-11 sm:pb-14 sm:pt-[4.5rem]"
      style={{
        background: theme.surface,
        border: `1px solid ${theme.surfaceBorder}`,
        borderRadius: '999px 999px 26px 26px',
        boxShadow: `0 34px 90px -40px rgba(${theme.accentRgb},0.45)`,
      }}
    >
      <div
        className="pointer-events-none absolute left-3 right-3 top-3 bottom-3"
        style={{ border: `1px solid rgba(${theme.accentRgb},0.18)`, borderRadius: '999px 999px 20px 20px' }}
      />

      <div className="relative -mt-4 mb-1 flex justify-center sm:-mt-5">
        <Branch color={theme.accent} soft={theme.accentSoft} />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: theme.duration, ease: theme.ease }}
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full text-[0.85rem]"
          style={{ background: `rgba(${theme.accentRgb},0.1)`, color: theme.accent, fontFamily: theme.displayFont }}
        >
          {initials}
        </motion.div>

        {kicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger }}
            className="mb-4 text-[0.6rem] uppercase"
            style={{ color: theme.accent, letterSpacing: '0.38em', fontFamily: theme.uiFont }}
          >
            {kicker}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 2, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.7rem, 7vw, 2.6rem)', letterSpacing: '0.02em', lineHeight: 1.15 }}
        >
          {groom}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: theme.duration * 0.7, delay: theme.stagger * 3 }}
          className="my-1.5 text-[1.3rem] italic"
          style={{ color: theme.accentSoft, fontFamily: theme.bodyFont }}
        >
          &amp;
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 4, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.7rem, 7vw, 2.6rem)', letterSpacing: '0.02em', lineHeight: 1.15 }}
        >
          {bride}
        </motion.div>

        {dateStr && (
          <>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 5 }}
              className="mt-5 h-px w-16"
              style={{ background: `rgba(${theme.accentRgb},0.4)` }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 6 }}
              className="mt-4 text-[0.95rem] italic"
              style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}
            >
              {dateStr}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
