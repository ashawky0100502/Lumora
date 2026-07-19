import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import '../../debugRender';
import './countdown.css';

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function resolveDate(data) {
  return firstText(data?.countdown?.targetDate, data?.hero?.date, 'October 18, 2026');
}

function resolveTime(data) {
  return firstText(data?.countdown?.targetTime, '18:00');
}

function parseTargetDate(dateValue, timeValue) {
  if (!dateValue) return null;

  const normalizedDate = dateValue.trim();
  const normalizedTime = timeValue ? timeValue.trim() : '';

  const dateOnly = new Date(normalizedDate);
  if (!Number.isNaN(dateOnly.getTime())) {
    const base = new Date(dateOnly);
    if (normalizedTime) {
      const timeMatch = normalizedTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = Number(timeMatch[1]);
        const minutes = Number(timeMatch[2] || '0');
        const meridiem = timeMatch[3]?.toLowerCase();
        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;
        base.setHours(hours, minutes, 0, 0);
      }
    }
    return base;
  }

  const fallback = new Date(normalizedDate);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function getTimeLeft(targetDate) {
  if (!targetDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      completed: true,
    };
  }

  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      completed: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    completed: false,
  };
}

export default function AuroraCountdown({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Countdown component mounted');
  }
  const targetDate = useMemo(() => parseTargetDate(resolveDate(data), resolveTime(data)), [data]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));
  const [isComplete, setIsComplete] = useState(() => !targetDate || getTimeLeft(targetDate).completed);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(getTimeLeft(null));
      setIsComplete(true);
      return undefined;
    }

    const tick = () => {
      const next = getTimeLeft(targetDate);
      setTimeLeft(next);
      setIsComplete(next.completed);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const parts = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  const content = isComplete ? (
    <motion.div
      className="aurora-countdown__completion"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="aurora-countdown__completion-eyebrow">Today is the day</p>
      <h3 className="aurora-countdown__completion-title">Welcome to the beginning of forever.</h3>
    </motion.div>
  ) : (
    <div className="aurora-countdown__grid" role="timer" aria-label="Wedding countdown">
      {parts.map((part) => (
        <motion.div
          key={part.label}
          className="aurora-countdown__tile"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16, filter: 'blur(8px)' }}
          whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            key={`${part.label}-${part.value}`}
            className="aurora-countdown__value"
            initial={prefersReducedMotion ? false : { opacity: 0.6, y: 8, scale: 0.96 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {String(part.value).padStart(2, '0')}
          </motion.span>
          <span className="aurora-countdown__label">{part.label}</span>
        </motion.div>
      ))}
    </div>
  );

  return (
    <section className="aurora-countdown" aria-labelledby="aurora-countdown-title">
      <div className="aurora-countdown__inner">
        <motion.div
          className="aurora-countdown__content"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24, filter: 'blur(12px)' }}
          whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="aurora-countdown__eyebrow">Until the celebration</p>
          <h2 id="aurora-countdown-title" className="aurora-countdown__title">EVERY MOMENT<br />BRINGS US CLOSER</h2>
          <p className="aurora-countdown__copy">Every passing second carries us gently toward a day written in light, devotion, and unforgettable love.</p>
        </motion.div>

        <motion.div
          className="aurora-countdown__card"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 26, scale: 0.98 }}
          whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aurora-countdown__card-glow" aria-hidden="true" />
          <div className="aurora-countdown__card-shimmer" aria-hidden="true" />
          <div className="aurora-countdown__card-particles" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} className="aurora-countdown__particle" style={{ left: `${8 + index * 7}%`, top: `${10 + (index % 4) * 18}%` }} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            {content}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
