import { motion } from 'framer-motion';
import GateNames from '../GateNames';

// ---------------- VELVET — heavy theater curtains drawing open, slow & dramatic ----------------
export default function GateVelvet({ theme, groom, bride, dateStr, kicker, sub, openLabel, opening, handleOpen }) {
  return (
    <>
      {['left', 'right'].map((side) => (
        <motion.div
          key={side}
          className="absolute top-[-4%] bottom-[-4%]"
          style={{
            [side]: '-2%',
            width: '52%',
            background: 'linear-gradient(180deg,#16241c,#0a120d 55%,#060a07)',
            borderRight: side === 'left' ? `1px solid rgba(${theme.accentRgb},0.35)` : undefined,
            borderLeft: side === 'right' ? `1px solid rgba(${theme.accentRgb},0.35)` : undefined,
          }}
          animate={opening ? { x: side === 'left' ? '-108%' : '108%', rotateZ: side === 'left' ? -1 : 1 } : { x: 0 }}
          transition={{ duration: 1.5, ease: [0.65, 0, 0.28, 1] }}
        />
      ))}
      <motion.div
        className="relative z-10"
        animate={opening ? { opacity: 0, scale: 1.05, filter: 'blur(4px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: opening ? 0.3 : 0 }}
      >
        <GateNames theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} sub={sub} />
        <div className="mt-7 flex justify-center">
          <button type="button" onClick={handleOpen} className="rounded-full px-8 py-3 text-[0.78rem]" style={{ background: theme.accent, color: '#1a1206', fontFamily: theme.uiFont, letterSpacing: '0.06em' }}>
            {openLabel}
          </button>
        </div>
      </motion.div>
    </>
  );
}
