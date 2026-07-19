import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getOwnerRsvps, getOwnerComments, countConfirmedGuests } from '../../lib/ownerApi';

function StatCard({ label, value, sub }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-[0.68rem] uppercase" style={{ color: 'rgba(246,244,239,0.5)', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div className="font-display mt-1.5 text-[1.6rem]" style={{ color: 'var(--gold-soft)' }}>
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// 14-day RSVP activity, plain CSS bars — no charting library required.
function ActivityChart({ rsvps }) {
  const days = useMemo(() => {
    const buckets = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      buckets.push({ date: d, count: 0 });
    }
    rsvps.forEach((r) => {
      const rd = new Date(r.created_at);
      rd.setHours(0, 0, 0, 0);
      const bucket = buckets.find((b) => b.date.getTime() === rd.getTime());
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }, [rsvps]);

  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="font-display mb-1 text-[0.95rem]" style={{ color: 'var(--gold-soft)' }}>
        Responses — last 14 days
      </div>
      <div className="mb-5 text-[0.74rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
        RSVP activity across all your events.
      </div>
      <div className="flex h-[140px] items-end gap-1.5 sm:gap-2.5">
        {days.map((d, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center">
            <div
              className="w-full rounded-t-[4px] transition-opacity duration-200 group-hover:opacity-100"
              style={{
                height: `${Math.max(4, (d.count / max) * 120)}px`,
                background: d.count
                  ? 'linear-gradient(180deg, var(--gold-soft), var(--gold))'
                  : 'rgba(212,175,55,0.12)',
              }}
            />
            <div
              className="pointer-events-none absolute -top-6 rounded-md px-1.5 py-0.5 text-[0.6rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{ background: 'rgba(0,0,0,0.75)', color: 'var(--gold-soft)' }}
            >
              {d.count}
            </div>
            <div className="mt-1.5 text-[0.55rem]" style={{ color: 'rgba(246,244,239,0.35)' }}>
              {d.date.toLocaleDateString('en-US', { day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  const [state, setState] = useState(null); // { invites, rsvps, comments } | 'error'

  useEffect(() => {
    let alive = true;
    getOwnerRsvps()
      .then(async ({ invites, rsvps }) => {
        const comments = await getOwnerComments(invites.map((i) => i.slug)).catch(() => []);
        if (alive) setState({ invites, rsvps, comments });
      })
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
    };
  }, []);

  if (state === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
        Crunching the numbers…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[0.85rem]" style={{ color: '#e08a8a' }}>
        Couldn't load analytics. Try refreshing the page.
      </div>
    );
  }

  if (!state.invites.length) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <div className="font-display text-xl" style={{ color: 'var(--gold-soft)' }}>
          Nothing to analyze yet
        </div>
        <div className="font-serif-alt mt-2 italic" style={{ color: 'rgba(246,244,239,0.45)' }}>
          Publish an invitation and its stats will show up here.
        </div>
      </div>
    );
  }

  const { invites, rsvps, comments } = state;
  const attending = rsvps.filter((r) => r.status === 'attending');
  const responseRate = rsvps.length ? Math.round((attending.length / rsvps.length) * 100) : 0;
  const totalGuests = countConfirmedGuests(rsvps);

  const perEvent = invites.map((inv) => {
    const evRsvps = rsvps.filter((r) => r.slug === inv.slug);
    const evAttending = evRsvps.filter((r) => r.status === 'attending');
    const evComments = comments.filter((c) => c.slug === inv.slug);
    return {
      slug: inv.slug,
      name: `${inv.groom || ''} & ${inv.bride || ''}`,
      responses: evRsvps.length,
      attending: evAttending.length,
      guests: countConfirmedGuests(evRsvps),
      comments: evComments.length,
    };
  });
  perEvent.sort((a, b) => b.responses - a.responses);

  return (
    <div>
      <div className="mb-7">
        <div className="font-display text-[1.5rem]" style={{ letterSpacing: '0.02em' }}>
          Analytics
        </div>
        <div className="font-serif-alt mt-1 italic" style={{ color: 'rgba(246,244,239,0.5)' }}>
          How your invitations are performing, at a glance.
        </div>
      </div>

      <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))' }}>
        <StatCard label="Invitations" value={invites.length} />
        <StatCard label="Total Responses" value={rsvps.length} />
        <StatCard label="Attendance Rate" value={`${responseRate}%`} sub={`${attending.length} of ${rsvps.length} attending`} />
        <StatCard label="Guests Confirmed" value={totalGuests} />
        <StatCard label="Guestbook Comments" value={comments.length} />
      </div>

      <div className="mb-6">
        <ActivityChart rsvps={rsvps} />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="border-b p-5" style={{ borderColor: 'rgba(212,175,55,0.14)' }}>
          <div className="font-display text-[0.9rem]" style={{ color: 'var(--gold-soft)' }}>
            Per-event breakdown
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr style={{ color: 'rgba(246,244,239,0.45)' }}>
                <th className="px-5 py-3 text-left font-normal">Event</th>
                <th className="px-5 py-3 text-left font-normal">Responses</th>
                <th className="px-5 py-3 text-left font-normal">Attending</th>
                <th className="px-5 py-3 text-left font-normal">Guests</th>
                <th className="px-5 py-3 text-left font-normal">Comments</th>
              </tr>
            </thead>
            <tbody>
              {perEvent.map((ev, i) => (
                <motion.tr
                  key={ev.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t"
                  style={{ borderColor: 'rgba(212,175,55,0.08)' }}
                >
                  <td className="px-5 py-3" style={{ color: 'var(--gold-soft)' }}>
                    {ev.name || ev.slug}
                  </td>
                  <td className="px-5 py-3">{ev.responses}</td>
                  <td className="px-5 py-3">{ev.attending}</td>
                  <td className="px-5 py-3">{ev.guests}</td>
                  <td className="px-5 py-3">{ev.comments}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
