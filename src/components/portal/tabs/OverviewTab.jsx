import { motion } from 'framer-motion';
import { GuestCard } from '../../guest/shared/GuestUI';

function StatCard({ theme, label, value, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={onClick ? { y: -3 } : {}}
      className="flex flex-col items-start gap-1.5 rounded-2xl border p-5 text-left transition-colors duration-300 rtl:text-right"
      style={{ background: theme.surface, borderColor: theme.surfaceBorder }}
    >
      <div className="text-[0.68rem] uppercase" style={{ color: theme.accent, fontFamily: theme.uiFont, letterSpacing: '0.15em' }}>
        {label}
      </div>
      <div style={{ color: theme.ink, fontFamily: theme.displayFont, fontSize: '1.7rem' }}>{value}</div>
    </motion.button>
  );
}

export default function OverviewTab({ theme, t, lang, data, rsvps, threads, comments, onNavigate }) {
  const loading = rsvps === null || threads === null || comments === null;

  const attending = (rsvps || []).filter((r) => r.status === 'attending');
  const notAttending = (rsvps || []).filter((r) => r.status !== 'attending');
  const totalGuests = attending.reduce((sum, r) => sum + (parseInt(r.guest_count, 10) || 1), 0);
  const unreadMessages = (threads || []).reduce((sum, th) => sum + Number(th.unread_count || 0), 0);

  let daysLeft = null;
  if (data.date) {
    const wedding = new Date(`${data.date}T${data.time || '00:00'}`).getTime();
    const diff = wedding - Date.now();
    daysLeft = Math.ceil(diff / 86400000);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h2 style={{ color: theme.ink, fontFamily: theme.displayFont, fontSize: 'clamp(1.3rem, 4vw, 1.6rem)' }}>
          {t.overview.title}
        </h2>
        <p className="mt-2 text-[0.85rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>
          {t.overview.sub}
        </p>
      </div>

      {daysLeft !== null && (
        <GuestCard theme={theme} className="mb-6 text-center">
          <div style={{ color: theme.ink, fontFamily: theme.displayFont, fontSize: '1.4rem' }}>
            {daysLeft > 0 ? (
              <>
                {daysLeft} <span className="text-[0.9rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>{t.overview.daysToGo}</span>
              </>
            ) : (
              t.overview.today
            )}
          </div>
        </GuestCard>
      )}

      {loading ? (
        <div className="py-10 text-center text-[0.85rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
          {t.rsvp.loading}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard theme={theme} label={t.overview.totalResponses} value={(rsvps || []).length} onClick={() => onNavigate('rsvp')} />
          <StatCard theme={theme} label={t.overview.attending} value={attending.length} onClick={() => onNavigate('rsvp')} />
          <StatCard theme={theme} label={t.overview.notAttending} value={notAttending.length} onClick={() => onNavigate('rsvp')} />
          <StatCard theme={theme} label={t.overview.totalGuests} value={totalGuests} onClick={() => onNavigate('rsvp')} />
          <StatCard theme={theme} label={t.overview.unreadMessages} value={unreadMessages} onClick={() => onNavigate('messages')} />
          <StatCard theme={theme} label={t.overview.comments} value={(comments || []).length} onClick={() => onNavigate('comments')} />
        </div>
      )}
    </div>
  );
}
