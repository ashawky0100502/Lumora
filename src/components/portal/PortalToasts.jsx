import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { buildNotificationItems } from '../../lib/portalNotifications';
import { sfxNotify } from '../../lib/sfx';

const AUTO_DISMISS_MS = 7000;

export default function PortalToasts({ theme, lang, rsvps, threads, comments }) {
  const [toasts, setToasts] = useState([]);
  const seenKeys = useRef(null); // null until first data resolves — avoids toasting the whole backlog on load
  const timers = useRef({});

  function dismiss(id) {
    setToasts((prev) => prev.filter((tt) => tt.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }

  useEffect(() => {
    // Wait until the portal's real polls have resolved (all three arrays exist).
    if (rsvps === null || threads === null || comments === null) return;
    if (rsvps === undefined || threads === undefined || comments === undefined) return;

    const items = buildNotificationItems(lang, rsvps, threads, comments);
    const keys = new Set(items.map((i) => i.key));

    if (seenKeys.current === null) {
      seenKeys.current = keys;
      return;
    }

    const fresh = items.filter((i) => !seenKeys.current.has(i.key));
    seenKeys.current = keys;
    if (fresh.length === 0) return;

    sfxNotify();
    const newToasts = fresh.slice(0, 4).map((item) => ({ id: `${item.key}-${Date.now()}`, ...item }));
    setToasts((prev) => [...newToasts, ...prev].slice(0, 5));
    newToasts.forEach((tt) => {
      timers.current[tt.id] = setTimeout(() => dismiss(tt.id), AUTO_DISMISS_MS);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rsvps, threads, comments]);

  useEffect(() => {
    return () => Object.values(timers.current).forEach(clearTimeout);
  }, []);

  const isDark = theme.id === 'velvet' || theme.id === 'midnight' || theme.id === 'amour';

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(340px,92vw)] flex-col gap-2.5 rtl:right-5"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((tt) => (
          <motion.div
            key={tt.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border p-3.5 pr-4"
            style={{
              background: isDark ? 'rgba(16,13,20,0.94)' : 'rgba(255,255,255,0.96)',
              borderColor: theme.surfaceBorder,
              boxShadow: `0 24px 60px -18px rgba(${theme.accentRgb},0.4)`,
              backdropFilter: 'blur(18px)',
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
            />
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-[0.95rem]"
              style={{ background: `rgba(${theme.accentRgb},0.14)`, borderColor: `rgba(${theme.accentRgb},0.32)` }}
            >
              {tt.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.78rem] leading-snug" style={{ color: theme.ink, fontFamily: theme.uiFont }}>
                <b style={{ color: theme.accent }}>{tt.guestName}</b> {tt.text}
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismiss(tt.id)}
              aria-label="Dismiss"
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[0.7rem] opacity-50 transition-opacity hover:opacity-90"
              style={{ color: theme.accent }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
