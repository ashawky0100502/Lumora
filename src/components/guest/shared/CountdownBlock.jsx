import { AnimatePresence, motion } from 'framer-motion';
import { useCountdown } from '../../../hooks/useCountdown';

function Digit({ value, theme }) {
  return (
    <span className="relative inline-block h-[1.15em] w-[0.62em] overflow-hidden align-top">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          className="absolute inset-0 flex items-center justify-center tabular-nums"
          initial={{ y: '60%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-60%', opacity: 0 }}
          transition={{ duration: 0.45, ease: theme.ease }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Unit({ n, label, theme }) {
  const str = String(Math.max(0, n)).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex items-center justify-center rounded-xl border px-3 py-2.5 text-[1.5rem] sm:text-[1.9rem]"
        style={{
          borderColor: `rgba(${theme.accentRgb},0.3)`,
          background: `rgba(${theme.accentRgb},0.06)`,
          color: theme.accent,
          fontFamily: theme.displayFont,
        }}
      >
        {str.split('').map((d, i) => (
          <Digit key={i} value={d} theme={theme} />
        ))}
      </div>
      <span
        className="text-[0.62rem] uppercase"
        style={{ color: theme.inkSoft, letterSpacing: '0.24em', fontFamily: theme.uiFont }}
      >
        {label}
      </span>
    </div>
  );
}

export default function CountdownBlock({ theme, date, time, labels }) {
  const target = date ? `${date}T${time || '00:00'}` : null;
  const c = useCountdown(target);
  if (!c) return null;

  const L = labels || { days: 'Days', hours: 'Hours', minutes: 'Min', seconds: 'Sec' };

  if (c.done) {
    return (
      <div
        className="text-[1rem] italic"
        style={{ color: theme.accent, fontFamily: theme.bodyFont }}
      >
        {L.arrived}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <Unit n={c.days} label={L.days} theme={theme} />
      <Unit n={c.hours} label={L.hours} theme={theme} />
      <Unit n={c.minutes} label={L.minutes} theme={theme} />
      <Unit n={c.seconds} label={L.seconds} theme={theme} />
    </div>
  );
}
