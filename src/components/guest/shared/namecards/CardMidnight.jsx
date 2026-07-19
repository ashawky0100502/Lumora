import { motion } from 'framer-motion';

// ---------------- MIDNIGHT — Art-Deco sunburst crest: gold rays fan out behind ----------------
// ---------------- the monogram, concentric arcs frame the top like a 1920s marquee ------------
function Sunburst({ color }) {
  const rays = Array.from({ length: 16 });
  return (
    <svg viewBox="0 0 140 90" className="absolute -top-2 left-1/2 h-[70px] w-[140px] -translate-x-1/2 sm:-top-3 sm:h-20 sm:w-[160px]">
      {rays.map((_, i) => {
        const angle = -90 - 75 + (i * 150) / (rays.length - 1);
        const rad = (angle * Math.PI) / 180;
        const x2 = 70 + Math.cos(rad) * 62;
        const y2 = 70 + Math.sin(rad) * 62;
        return <line key={i} x1="70" y1="70" x2={x2} y2={y2} stroke={color} strokeWidth={i % 2 ? 0.7 : 1.3} opacity={i % 2 ? 0.35 : 0.55} />;
      })}
      <path d="M8 70 A62 62 0 0 1 132 70" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <path d="M20 70 A50 50 0 0 1 120 70" fill="none" stroke={color} strokeWidth="0.7" opacity="0.3" />
    </svg>
  );
}

export default function CardMidnight({ theme, groom, bride, dateStr, kicker }) {
  const initials = `${(groom?.[0] || '').toUpperCase()}${(bride?.[0] || '').toUpperCase()}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: theme.duration, ease: theme.ease }}
      className="relative mx-auto w-full max-w-[430px] px-9 pb-12 pt-16 sm:px-12 sm:pt-[4.5rem]"
      style={{ background: theme.surface, border: `1px solid ${theme.surfaceBorder}`, borderRadius: '4px', boxShadow: `0 0 60px -10px rgba(${theme.accentRgb},0.28), 0 34px 90px -40px rgba(0,0,0,0.6)` }}
    >
      <div className="pointer-events-none absolute inset-[8px]" style={{ border: `1px solid rgba(${theme.accentRgb},0.16)` }} />
      <Sunburst color={theme.accent} />

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: theme.duration, ease: theme.ease }}
          className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full text-[1.05rem]"
          style={{ border: `1px solid rgba(${theme.accentRgb},0.55)`, boxShadow: `0 0 0 4px rgba(${theme.accentRgb},0.08)`, color: theme.accent, fontFamily: theme.displayFont }}
        >
          {initials}
        </motion.div>

        {kicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger }}
            className="mb-5 text-[0.62rem] uppercase"
            style={{ color: theme.accent, letterSpacing: '0.44em', fontFamily: theme.uiFont }}
          >
            {kicker}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 2, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.7rem, 7vw, 2.6rem)', letterSpacing: '0.08em', lineHeight: 1.2 }}
        >
          {groom}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: theme.duration * 0.7, delay: theme.stagger * 3 }}
          className="my-3 flex items-center gap-2"
        >
          <span style={{ width: 4, height: 4, background: theme.accent, display: 'inline-block', transform: 'rotate(45deg)' }} />
          <span className="text-[0.95rem]" style={{ color: theme.accent }}>{theme.divider}</span>
          <span style={{ width: 4, height: 4, background: theme.accent, display: 'inline-block', transform: 'rotate(45deg)' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 4, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.7rem, 7vw, 2.6rem)', letterSpacing: '0.08em', lineHeight: 1.2 }}
        >
          {bride}
        </motion.div>

        {dateStr && (
          <>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 5 }}
              className="mt-6 h-px w-20"
              style={{ background: `linear-gradient(90deg, transparent, rgba(${theme.accentRgb},0.7), transparent)` }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 6 }}
              className="mt-4 text-[0.8rem] uppercase"
              style={{ color: theme.inkSoft, letterSpacing: '0.2em', fontFamily: theme.uiFont }}
            >
              {dateStr}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
