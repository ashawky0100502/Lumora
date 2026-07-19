import { motion } from 'framer-motion';
import GateNames from '../GateNames';

// ---------------- WAX — a parchment letter, seal cracks then the letter lifts away ----------------
export default function GateWax({ theme, groom, bride, dateStr, kicker, sub, openLabel, opening, handleOpen }) {
  return (
    <motion.div
      className="relative flex w-full max-w-[380px] flex-col items-center justify-center rounded-sm px-8 py-16"
      style={{ background: 'linear-gradient(160deg,#f7e4e0,#eeccc5 55%,#e6bdb5)', border: '1px solid rgba(140,60,55,0.22)', boxShadow: '0 40px 100px -24px rgba(60,20,15,0.35)' }}
      animate={opening ? { y: -140, opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 1.1, ease: [0.34, 1.1, 0.4, 1] }}
    >
      <GateNames theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} sub={sub} />
      <motion.button
        type="button"
        onClick={handleOpen}
        className="mt-7 flex h-16 w-16 items-center justify-center rounded-full text-[0.95rem]"
        style={{ background: 'radial-gradient(circle at 35% 30%, #b8433a, #7c1f1a 75%)', color: '#f2ddc8', fontFamily: theme.displayFont, boxShadow: '0 10px 24px rgba(90,20,15,0.4)' }}
        animate={opening ? { rotate: 25, scale: 0.85, opacity: 0 } : {}}
        transition={{ duration: 0.5 }}
        aria-label={openLabel}
      >
        ✉
      </motion.button>
    </motion.div>
  );
}
