import { motion } from 'framer-motion';
import GateNames from '../GateNames';

// ---------------- MIDNIGHT — the card materializes / dissolves into starlight ----------------
export default function GateMidnight({ theme, groom, bride, dateStr, kicker, sub, openLabel, opening, handleOpen }) {
  return (
    <motion.div
      className="relative z-10"
      animate={opening ? { opacity: 0, scale: 1.15, filter: 'blur(10px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <GateNames theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} sub={sub} />
      <div className="mt-7 flex justify-center">
        <motion.button
          type="button"
          onClick={handleOpen}
          className="rounded-full px-8 py-3 text-[0.78rem]"
          style={{ background: `linear-gradient(120deg, ${theme.accent}, ${theme.accentSoft})`, color: '#1a1206', fontFamily: theme.uiFont, letterSpacing: '0.06em' }}
          animate={{ boxShadow: [`0 0 0px rgba(${theme.accentRgb},0.4)`, `0 0 24px rgba(${theme.accentRgb},0.55)`, `0 0 0px rgba(${theme.accentRgb},0.4)`] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        >
          {openLabel}
        </motion.button>
      </div>
    </motion.div>
  );
}
