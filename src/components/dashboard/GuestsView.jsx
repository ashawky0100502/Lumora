import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOwnerRsvps, countConfirmedGuests } from '../../lib/ownerApi';
import { initialsOf, timeAgo } from '../../lib/guestFormat';

function StatPill({ label, value }) {
  return (
    <div className="glass-card rounded-xl px-4 py-3">
      <div className="text-[0.68rem] uppercase" style={{ color: 'rgba(246,244,239,0.5)', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div className="font-display mt-0.5 text-[1.25rem]" style={{ color: 'var(--gold-soft)' }}>
        {value}
      </div>
    </div>
  );
}

const PAGE_SIZE = 40;

export default function GuestsView({ session = { type: 'owner' } }) {
  const [state, setState] = useState(null); // { invites, rsvps } | 'error'
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let alive = true;
    getOwnerRsvps(session)
      .then((res) => alive && setState(res))
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
    };
  }, [session]);

  const inviteBySlug = useMemo(() => {
    const map = {};
    (state && state !== 'error' ? state.invites : []).forEach((inv) => (map[inv.slug] = inv));
    return map;
  }, [state]);

  const rows = useMemo(() => {
    if (!state || state === 'error') return [];
    let list = state.rsvps;
    if (filter === 'attending') list = list.filter((r) => r.status === 'attending');
    if (filter === 'not') list = list.filter((r) => r.status !== 'attending');
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => (r.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [state, filter, query]);

  // Resets the render window whenever the filter/search actually narrows
  // (or widens) what's being shown — otherwise switching from "All" to
  // "Attending" on a long list could leave visibleCount smaller than the
  // new list needs, hiding rows that should be visible immediately.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, query]);

  const visibleRows = rows.slice(0, visibleCount);

  if (state === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
        Loading guests…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[0.85rem]" style={{ color: '#e08a8a' }}>
        Couldn't load guest data. Try refreshing the page.
      </div>
    );
  }

  if (!state.invites.length) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <div className="font-display text-xl" style={{ color: 'var(--gold-soft)' }}>
          {session.type === 'demo' ? 'No invitations published yet' : 'No invitations published from this browser yet'}
        </div>
        <div className="font-serif-alt mt-2 italic" style={{ color: 'rgba(246,244,239,0.45)' }}>
          Publish an invitation and guest responses will show up here.
        </div>
      </div>
    );
  }

  const attending = state.rsvps.filter((r) => r.status === 'attending');
  const notAttending = state.rsvps.filter((r) => r.status !== 'attending');
  const totalGuests = countConfirmedGuests(state.rsvps);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'attending', label: 'Attending' },
    { id: 'not', label: 'Not Attending' },
  ];

  return (
    <div>
      <div className="mb-7">
        <div className="font-display text-[1.5rem]" style={{ letterSpacing: '0.02em' }}>
          Guests
        </div>
        <div className="font-serif-alt mt-1 italic" style={{ color: 'rgba(246,244,239,0.5)' }}>
          Responses received across all your events.
        </div>
      </div>

      <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
        <StatPill label="Total Responses" value={state.rsvps.length} />
        <StatPill label="Attending" value={attending.length} />
        <StatPill label="Not Attending" value={notAttending.length} />
        <StatPill label="Guests Confirmed" value={totalGuests} />
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
                background: filter === f.id ? 'linear-gradient(120deg, var(--gold), var(--gold-soft))' : 'transparent',
                color: filter === f.id ? '#1a1206' : 'rgba(246,244,239,0.6)',
                border: `1px solid ${filter === f.id ? 'transparent' : 'rgba(212,175,55,0.2)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="rounded-full border bg-transparent px-4 py-1.5 text-[0.8rem] outline-none"
          style={{ borderColor: 'rgba(212,175,55,0.2)', color: 'var(--gold-soft)', maxWidth: 220 }}
        />
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center text-[0.85rem] italic" style={{ color: 'rgba(246,244,239,0.45)' }}>
          No guests match this filter.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {visibleRows.map((r) => {
              const inv = inviteBySlug[r.slug];
              const coupleNames = inv ? `${inv.groom || ''} & ${inv.bride || ''}` : r.slug;
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card flex items-center gap-4 rounded-2xl p-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.72rem]"
                    style={{ background: 'rgba(212,175,55,0.14)', color: 'var(--gold-soft)' }}
                  >
                    {initialsOf(r.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.92rem]" style={{ color: 'var(--gold-soft)' }}>
                      {r.name || '—'}
                    </div>
                    <div className="truncate text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                      {coupleNames} · {timeAgo(r.created_at)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className="rounded-full px-3 py-1 text-[0.72rem]"
                      style={{
                        background: r.status === 'attending' ? 'rgba(120,180,130,0.16)' : 'rgba(194,90,90,0.14)',
                        color: r.status === 'attending' ? '#5f9d6e' : '#c25a5a',
                      }}
                    >
                      {r.status === 'attending' ? 'Attending' : 'Not Attending'}
                    </span>
                    {r.status === 'attending' && r.guest_count && (
                      <div className="mt-1 text-[0.68rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                        {r.guest_count} guests
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {rows.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="mx-auto mt-1 rounded-full px-5 py-2 text-[0.78rem]"
              style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-soft)' }}
            >
              Show more ({rows.length - visibleCount} left)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
