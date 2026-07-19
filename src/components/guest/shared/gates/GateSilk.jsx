import { motion } from 'framer-motion';
import GateNames from '../GateNames';

// ---------------- SILK — two soft fabric panels parting sideways ----------------
export default function GateSilk({ theme, groom, bride, dateStr, kicker, sub, openLabel, opening, handleOpen }) {
  return (
    <>
      {['left', 'right'].map((side) => (
        <motion.div
          key={side}
          className="absolute top-[-4%] bottom-[-4%]"
          style={{
            [side]: '-2%',
            width: '52%',
            background: 'linear-gradient(180deg,#fdf9f5,#f1e6dc 55%,#e7d5c6)',
            boxShadow: side === 'left' ? 'inset -40px 0 60px -40px rgba(0,0,0,0.12)' : 'inset 40px 0 60px -40px rgba(0,0,0,0.12)',
          }}
          animate={opening ? { x: side === 'left' ? '-105%' : '105%' } : { x: 0 }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.28, 1] }}
        />
      ))}
      <motion.div
        className="relative z-10"
        animate={opening ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <GateNames theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} sub={sub} />
        <div className="mt-7 flex justify-center">
          <button type="button" onClick={handleOpen} className="rounded-full border px-8 py-3 text-[0.78rem]" style={{ borderColor: theme.accent, color: theme.accent, fontFamily: theme.uiFont, letterSpacing: '0.06em' }}>
            {openLabel}
          </button>
        </div>
      </motion.div>
    </>
  );
}
