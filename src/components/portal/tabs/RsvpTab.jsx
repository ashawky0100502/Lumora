import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuestCard, GuestInput } from '../../guest/shared/GuestUI';
import { initialsOf, timeAgo } from '../../../lib/guestFormat';

export default function RsvpTab({ theme, t, rsvps }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = rsvps || [];
    if (filter === 'attending') list = list.filter((r) => r.status === 'attending');
    if (filter === 'not') list = list.filter((r) => r.status !== 'attending');
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => (r.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [rsvps, filter, query]);

  const filters = [
    { id: 'all', label: t.rsvp.filterAll },
    { id: 'attending', label: t.rsvp.filterAttending },
    { id: 'not', label: t.rsvp.filterNot },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <h2 style={{ color: theme.ink, fontFamily: theme.displayFont, fontSize: 'clamp(1.3rem, 4vw, 1.6rem)' }}>{t.rsvp.title}</h2>
        <p className="mt-2 text-[0.85rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>{t.rsvp.sub}</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="rounded-full px-4 py-1.5 text-[0.76rem] transition-colors duration-300"
              style={{
                background: filter === f.id ? `linear-gradient(120deg, ${theme.accent}, ${theme.accentSoft})` : 'transparent',
                color: filter === f.id ? (theme.id === 'velvet' || theme.id === 'midnight' ? '#1a1206' : '#fff') : theme.inkSoft,
                border: `1px solid ${filter === f.id ? 'transparent' : theme.surfaceBorder}`,
                fontFamily: theme.uiFont,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <GuestInput theme={theme} placeholder={t.rsvp.searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 220 }} />
      </div>

      {rsvps === null ? (
        <div className="py-10 text-center text-[0.85rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>{t.rsvp.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-[0.85rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>{t.rsvp.empty}</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {filtered.map((r, i) => (
              <motion.div key={r.id ?? i} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GuestCard theme={theme} className="flex items-center gap-4 !p-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.72rem]"
                    style={{ background: `rgba(${theme.accentRgb},0.16)`, color: theme.accent, fontFamily: theme.uiFont }}
                  >
                    {initialsOf(r.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.92rem]" style={{ color: theme.ink, fontFamily: theme.uiFont }}>{r.name || '—'}</div>
                    <div className="text-[0.7rem]" style={{ color: theme.inkSoft }}>{timeAgo(r.created_at)}</div>
                  </div>
                  <div className="shrink-0 text-right rtl:text-left">
                    <span
                      className="rounded-full px-3 py-1 text-[0.72rem]"
                      style={{
                        background: r.status === 'attending' ? 'rgba(120,180,130,0.16)' : 'rgba(194,90,90,0.14)',
                        color: r.status === 'attending' ? '#5f9d6e' : '#c25a5a',
                        fontFamily: theme.uiFont,
                      }}
                    >
                      {r.status === 'attending' ? t.rsvp.filterAttending : t.rsvp.filterNot}
                    </span>
                    {r.status === 'attending' && r.guest_count && (
                      <div className="mt-1 text-[0.7rem]" style={{ color: theme.inkSoft }}>
                        {r.guest_count} {t.rsvp.guestsSuffix}
                      </div>
                    )}
                  </div>
                </GuestCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
