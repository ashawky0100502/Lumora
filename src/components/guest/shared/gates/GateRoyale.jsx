import { motion } from 'framer-motion';
import GateNames from '../GateNames';

function Petals({ theme }) {
  const petals = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {petals.map((_, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-[0_100%_0_100%]"
          style={{
            left: `${(i * 7.3) % 100}%`,
            width: 8 + (i % 3) * 3,
            height: 8 + (i % 3) * 3,
            background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})`,
            top: -20,
          }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: 620, opacity: [0, 1, 1, 0], rotate: 340 }}
          transition={{ duration: 3.6 + (i % 5) * 0.4, delay: 0.4 + i * 0.12, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

// ---------------- ROYALE — four gilt flaps folding open like a wax envelope ----------------
export default function GateRoyale({ theme, groom, bride, dateStr, kicker, sub, openLabel, opening, handleOpen }) {
  return (
    <>
      {opening && <Petals theme={theme} />}
      <div className="relative flex w-full max-w-[400px] items-center justify-center" style={{ minHeight: 480, perspective: 1600 }}>
        <motion.div
          animate={opening ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <GateNames theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} sub={sub} />
        </motion.div>
        {['top', 'bottom', 'left', 'right'].map((side, i) => (
          <motion.div
            key={side}
            className="absolute inset-3.5 rounded-sm"
            style={{
              background: 'linear-gradient(160deg, #fbf3e8, #efdcc4 55%, #e6cba3)',
              border: `1px solid rgba(${theme.accentRgb},0.32)`,
              clipPath:
                side === 'top' ? 'polygon(0 0,100% 0,50% 50%)' :
                side === 'bottom' ? 'polygon(0 100%,100% 100%,50% 50%)' :
                side === 'left' ? 'polygon(0 0,0 100%,50% 50%)' :
                'polygon(100% 0,100% 100%,50% 50%)',
              transformOrigin: side === 'top' ? 'top center' : side === 'bottom' ? 'bottom center' : side === 'left' ? 'left center' : 'right center',
              transformStyle: 'preserve-3d',
            }}
            animate={
              opening
                ? {
                    rotateX: side === 'top' ? -165 : side === 'bottom' ? 165 : 0,
                    rotateY: side === 'left' ? 165 : side === 'right' ? -165 : 0,
                    opacity: 0,
                  }
                : {}
            }
            transition={{ duration: 1.15, delay: 0.55 + i * 0.1, ease: [0.6, 0, 0.3, 1] }}
          />
        ))}
        <motion.button
          type="button"
          onClick={handleOpen}
          className="absolute z-30 flex h-[74px] w-[74px] items-center justify-center rounded-full text-[1.15rem]"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${theme.accentSoft}, ${theme.accent} 70%)`,
            fontFamily: theme.displayFont,
            color: '#fff',
            boxShadow: `0 0 40px rgba(${theme.accentRgb},0.5)`,
          }}
          animate={opening ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] } : { scale: [1, 1.05, 1] }}
          transition={opening ? { duration: 0.7 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-label={openLabel}
        >
          ✦
        </motion.button>
      </div>
    </>
  );
}
