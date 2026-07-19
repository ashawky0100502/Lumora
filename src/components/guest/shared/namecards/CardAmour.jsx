import { motion } from 'framer-motion';

// ---------------- AMOUR — a trailing rose vine across the crown, the monogram ----------------
// ---------------- sits inside a small wreath instead of a bare circle -------------------------
function RoseVine({ color, soft }) {
  return (
    <svg viewBox="0 0 260 40" className="h-8 w-[210px] sm:h-9 sm:w-[240px]">
      <path d="M6 14 C 60 30, 90 4, 130 14 C 170 24, 200 2, 254 14" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {[26, 78, 130, 182, 232].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 20 : 8})`}>
          <circle r="5.5" fill="none" stroke={color} strokeWidth="1" />
          <path d="M0 -5.5 C2.6 -4, 2.6 -1.2, 0 0 C-2.6 -1.2, -2.6 -4, 0 -5.5 Z" fill={soft} fillOpacity="0.85" />
          <path d="M5.5 0 C4 2.6, 1.2 2.6, 0 0 C1.2 -2.6, 4 -2.6, 5.5 0 Z" fill={color} fillOpacity="0.7" />
          <path d="M0 5.5 C-2.6 4, -2.6 1.2, 0 0 C2.6 1.2, 2.6 4, 0 5.5 Z" fill={soft} fillOpacity="0.6" />
        </g>
      ))}
      {[50, 104, 156, 210].map((x) => (
        <path key={x} d={`M${x} 18 C ${x + 4} 12, ${x + 9} 10, ${x + 12} 5`} stroke={color} strokeWidth="0.8" fill="none" opacity="0.6" />
      ))}
    </svg>
  );
}

function Wreath({ color }) {
  const leaves = Array.from({ length: 10 });
  return (
    <svg viewBox="0 0 76 76" className="absolute inset-0">
      {leaves.map((_, i) => {
        const angle = (360 / leaves.length) * i;
        return (
          <g key={i} transform={`rotate(${angle} 38 38)`}>
            <path d="M38 4 C 42 9, 42 15, 38 18 C 34 15, 34 9, 38 4 Z" fill={color} fillOpacity="0.55" stroke={color} strokeWidth="0.4" />
          </g>
        );
      })}
      <circle cx="38" cy="38" r="24" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export default function CardAmour({ theme, groom, bride, dateStr, kicker }) {
  const initials = `${(groom?.[0] || '').toUpperCase()}${(bride?.[0] || '').toUpperCase()}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: theme.duration, ease: theme.ease }}
      className="relative mx-auto w-full max-w-[420px] px-8 pb-12 pt-8 sm:px-11 sm:pb-14"
      style={{ background: theme.surface, border: `1px solid ${theme.surfaceBorder}`, borderRadius: theme.radius, boxShadow: `0 34px 90px -38px rgba(${theme.accentRgb},0.5)` }}
    >
      <div className="pointer-events-none absolute inset-[8px] rounded-[inherit]" style={{ border: `1px solid rgba(${theme.accentRgb},0.16)` }} />

      <div className="relative mb-3 flex justify-center">
        <RoseVine color={theme.accent} soft={theme.accentSoft} />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: theme.duration, ease: theme.ease }}
          className="relative mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center"
        >
          <Wreath color={theme.accent} />
          <span className="relative" style={{ color: theme.accent, fontFamily: theme.displayFont, fontSize: '1rem' }}>{initials}</span>
        </motion.div>

        {kicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger }}
            className="mb-5 text-[0.6rem] uppercase"
            style={{ color: theme.accent, letterSpacing: '0.4em', fontFamily: theme.uiFont }}
          >
            {kicker}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 2, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.7rem, 7vw, 2.6rem)', letterSpacing: '0.03em', lineHeight: 1.2 }}
        >
          {groom}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: theme.duration * 0.7, delay: theme.stagger * 3 }}
          className="my-2.5 text-[1.2rem]"
          style={{ color: theme.accent }}
        >
          {theme.divider}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 4, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.7rem, 7vw, 2.6rem)', letterSpacing: '0.03em', lineHeight: 1.2 }}
        >
          {bride}
        </motion.div>

        {dateStr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 6 }}
            className="mt-5 text-[0.95rem] italic"
            style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}
          >
            {dateStr}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
