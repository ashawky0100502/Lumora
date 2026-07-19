import { motion } from 'framer-motion';

// ---------------- VELVET — sharp Art-Deco stationery: stepped mitre corners, ----------------
// ---------------- a hexagonal monogram badge, condensed wide-tracked caps -------------------
function MitreCorner({ color, flipX, flipY }) {
  return (
    <svg
      viewBox="0 0 34 34"
      className="pointer-events-none absolute h-7 w-7 sm:h-9 sm:w-9"
      style={{
        top: flipY ? 'auto' : -1,
        bottom: flipY ? -1 : 'auto',
        left: flipX ? 'auto' : -1,
        right: flipX ? -1 : 'auto',
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      }}
    >
      <g fill="none" stroke={color} strokeWidth="1.4">
        <path d="M0 0 H34 M0 0 V34" />
        <path d="M0 10 H8 V0" />
        <path d="M22 0 V8 H34" />
      </g>
    </svg>
  );
}

function Hexagon({ color, children }) {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg viewBox="0 0 60 60" className="absolute inset-0">
        <polygon points="30,2 55,16 55,44 30,58 5,44 5,16" fill="none" stroke={color} strokeWidth="1.4" />
        <polygon points="30,9 49,19.5 49,40.5 30,51 11,40.5 11,19.5" fill="none" stroke={color} strokeWidth="0.7" opacity="0.6" />
      </svg>
      <span className="relative">{children}</span>
    </div>
  );
}

export default function CardVelvet({ theme, groom, bride, dateStr, kicker }) {
  const initials = `${(groom?.[0] || '').toUpperCase()}${(bride?.[0] || '').toUpperCase()}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: theme.duration, ease: theme.ease }}
      className="relative mx-auto w-full max-w-[420px] px-9 py-14 sm:px-12"
      style={{ background: theme.surface, border: `1.5px solid ${theme.surfaceBorder}`, boxShadow: `0 34px 90px -38px rgba(${theme.accentRgb},0.45)` }}
    >
      <MitreCorner color={theme.accent} />
      <MitreCorner color={theme.accent} flipX />
      <MitreCorner color={theme.accent} flipY />
      <MitreCorner color={theme.accent} flipX flipY />
      <div className="pointer-events-none absolute inset-[9px]" style={{ border: `1px solid rgba(${theme.accentRgb},0.16)` }} />

      <div className="relative flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: theme.duration, ease: theme.ease }} className="mb-6">
          <Hexagon color={theme.accent}>
            <span style={{ color: theme.accent, fontFamily: theme.displayFont, fontSize: '1rem', letterSpacing: '0.05em' }}>{initials}</span>
          </Hexagon>
        </motion.div>

        {kicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger }}
            className="mb-5 text-[0.6rem] uppercase"
            style={{ color: theme.accent, letterSpacing: '0.46em', fontFamily: theme.uiFont }}
          >
            {kicker}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 2, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.6rem, 6.5vw, 2.4rem)', letterSpacing: '0.12em', lineHeight: 1.25 }}
        >
          {groom?.toUpperCase?.() || groom}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: theme.duration * 0.7, delay: theme.stagger * 3 }}
          className="my-4 flex items-center gap-2.5"
        >
          <span className="h-px w-12" style={{ background: `rgba(${theme.accentRgb},0.55)` }} />
          <span style={{ width: 5, height: 5, background: theme.accent, display: 'inline-block', transform: 'rotate(45deg)' }} />
          <span className="h-px w-12" style={{ background: `rgba(${theme.accentRgb},0.55)` }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: theme.duration, delay: theme.stagger * 4, ease: theme.ease }}
          style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.6rem, 6.5vw, 2.4rem)', letterSpacing: '0.12em', lineHeight: 1.25 }}
        >
          {bride?.toUpperCase?.() || bride}
        </motion.div>

        {dateStr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: theme.duration * 0.8, delay: theme.stagger * 6 }}
            className="mt-6 text-[0.78rem] uppercase"
            style={{ color: theme.inkSoft, letterSpacing: '0.24em', fontFamily: theme.uiFont }}
          >
            {dateStr}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
