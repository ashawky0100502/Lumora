import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { notifText } from '../../lib/notifications';
import { subscribeNotifications } from '../../lib/notificationsStore';
import { sfxNotify } from '../../lib/sfx';

const AUTO_DISMISS_MS = 7000;

function keyOf(item) {
  return `${item.table}:${item.row?.id ?? item.created_at}`;
}

export default function NotificationToasts() {
  const [toasts, setToasts] = useState([]);
  const seenKeys = useRef(null); // null until first poll resolves — avoids toasting the whole backlog on load
  const timers = useRef({});

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }

  function handleData(data) {
    const keys = new Set(data.map(keyOf));

    if (seenKeys.current === null) {
      // First load: just remember what already exists, don't toast history.
      seenKeys.current = keys;
      return;
    }

    const freshItems = data.filter((item) => !seenKeys.current.has(keyOf(item)));
    seenKeys.current = keys;

    if (freshItems.length === 0) return;

    sfxNotify();
    const newToasts = freshItems.slice(0, 4).map((item) => {
      const t = notifText(item);
      const id = `${keyOf(item)}-${Date.now()}`;
      return { id, icon: item.icon, guestName: t.guestName, verb: t.verb || t.text, couple: t.couple };
    });

    setToasts((prev) => [...newToasts, ...prev].slice(0, 5));
    newToasts.forEach((t) => {
      timers.current[t.id] = setTimeout(() => dismiss(t.id), AUTO_DISMISS_MS);
    });
  }

  useEffect(() => {
    // Joins the same shared poll NotificationBell subscribes to (see
    // notificationsStore.js) instead of running a second independent one.
    const unsubscribe = subscribeNotifications(handleData);
    return () => {
      unsubscribe();
      Object.values(timers.current).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(360px,92vw)] flex-col gap-2.5"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border p-3.5 pr-4"
            style={{
              background: 'rgba(16,13,22,0.92)',
              borderColor: 'var(--glass-border)',
              boxShadow: '0 24px 60px -18px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.06)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, var(--gold-dim), var(--gold-soft), var(--gold-dim))' }}
            />
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-[0.95rem]"
              style={{ background: 'rgba(212,175,55,0.12)', borderColor: 'rgba(212,175,55,0.3)' }}
            >
              {t.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.78rem] leading-snug" style={{ color: 'rgba(246,244,239,0.92)' }}>
                <b style={{ color: 'var(--gold-soft)' }}>{t.guestName}</b> {t.verb}{' '}
                <b style={{ color: 'var(--gold-soft)' }}>{t.couple}</b>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[0.7rem] opacity-50 transition-opacity hover:opacity-90"
              style={{ color: 'var(--gold-soft)' }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
