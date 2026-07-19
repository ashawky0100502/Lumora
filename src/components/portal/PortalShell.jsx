import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCoupleRsvps, getCoupleThreads, getCoupleComments, clearCode } from '../../lib/coupleApi';
import { coupleCopy } from '../../lib/coupleCopy';
import { initialsOf } from '../../lib/guestFormat';
import OverviewTab from './tabs/OverviewTab';
import RsvpTab from './tabs/RsvpTab';
import MessagesTab from './tabs/MessagesTab';
import CommentsTab from './tabs/CommentsTab';
import PortalNotifications from './PortalNotifications';
import PortalToasts from './PortalToasts';

const POLL_MS = 15000;

export default function PortalShell({ slug, code, data, theme, lang }) {
  const t = coupleCopy(lang);
  const [tab, setTab] = useState('overview');
  const [rsvps, setRsvps] = useState(null);
  const [threads, setThreads] = useState(null);
  const [comments, setComments] = useState(null);
  const [threadsError, setThreadsError] = useState('');

  const coupleNames = lang === 'ar' ? `${data.groom} و${data.bride}` : `${data.groom} & ${data.bride}`;

  const refreshRsvps = useCallback(() => {
    getCoupleRsvps(slug, code).then(setRsvps).catch(() => setRsvps((p) => p ?? []));
  }, [slug, code]);

  const refreshThreads = useCallback(() => {
    getCoupleThreads(slug, code)
      .then((data) => {
        setThreads(data);
        setThreadsError('');
      })
      .catch((err) => {
        // Previously this failed silently and just fell back to an empty
        // list — indistinguishable from "genuinely no messages yet". Now
        // the couple (and whoever's debugging with them) can actually see
        // why the thread list didn't load.
        console.error('[PortalShell] getCoupleThreads failed:', err);
        setThreadsError(err?.message || 'Could not load messages.');
        setThreads((p) => p ?? []);
      });
  }, [slug, code]);

  const refreshComments = useCallback(() => {
    getCoupleComments(slug, code).then(setComments).catch(() => setComments((p) => p ?? []));
  }, [slug, code]);

  useEffect(() => {
    refreshRsvps();
    refreshThreads();
    refreshComments();
    const id = setInterval(() => {
      refreshRsvps();
      refreshThreads();
      refreshComments();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [refreshRsvps, refreshThreads, refreshComments]);

  function handleSignOut() {
    clearCode(slug);
    window.location.href = `${location.origin}${location.pathname}?couple=${encodeURIComponent(slug)}`;
  }

  const unreadTotal = (threads || []).reduce((sum, th) => sum + Number(th.unread_count || 0), 0);

  const dateStr = data.date
    ? new Date(`${data.date}T${data.time || '00:00'}`).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const tabs = [
    { id: 'overview', label: t.nav.overview },
    { id: 'rsvp', label: t.nav.rsvp },
    { id: 'messages', label: t.nav.messages, badge: unreadTotal },
    { id: 'comments', label: t.nav.comments },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* ---- Profile header ---- */}
      <div
        className="relative shrink-0 px-6 pb-6 pt-10 sm:px-10"
        style={{
          background: `linear-gradient(160deg, rgba(${theme.accentRgb},0.14), transparent 70%)`,
          borderBottom: `1px solid ${theme.surfaceBorder}`,
        }}
      >
        <div className="absolute right-5 top-5 flex items-center gap-2.5 sm:right-8 rtl:right-auto rtl:left-5 rtl:sm:left-8">
          <PortalNotifications theme={theme} lang={lang} slug={slug} rsvps={rsvps} threads={threads} comments={comments} />
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border px-4 py-1.5 text-[0.7rem] transition-colors duration-300"
            style={{ borderColor: theme.surfaceBorder, color: theme.inkSoft, fontFamily: theme.uiFont }}
          >
            {t.signOut}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left rtl:sm:text-right">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[1.1rem]"
            style={{
              background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})`,
              color: theme.id === 'velvet' || theme.id === 'midnight' ? '#1a1206' : '#fff',
              fontFamily: theme.displayFont,
              boxShadow: `0 10px 26px -6px rgba(${theme.accentRgb},0.5)`,
            }}
          >
            {initialsOf(`${data.groom} ${data.bride}`)}
          </div>

          <div>
            <div className="text-[0.62rem] uppercase" style={{ color: theme.accent, fontFamily: theme.uiFont, letterSpacing: '0.35em' }}>
              {t.welcomeBack}
            </div>
            <h1
              className="mt-1"
              style={{ color: theme.ink, fontFamily: theme.displayFont, fontSize: 'clamp(1.3rem, 4.5vw, 1.7rem)', letterSpacing: '0.02em' }}
            >
              {coupleNames}
            </h1>
            {dateStr && (
              <div className="mt-1 text-[0.85rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>
                {dateStr}
              </div>
            )}
          </div>
        </div>

        {/* ---- Tab bar ---- */}
        <div className="mt-7 flex flex-wrap justify-center gap-2 sm:justify-start">
          {tabs.map((tb) => {
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setTab(tb.id)}
                className="relative rounded-full px-5 py-2 text-[0.8rem] transition-all duration-300"
                style={{
                  background: active ? `linear-gradient(120deg, ${theme.accent}, ${theme.accentSoft})` : 'transparent',
                  color: active ? (theme.id === 'velvet' || theme.id === 'midnight' ? '#1a1206' : '#fff') : theme.inkSoft,
                  border: `1px solid ${active ? 'transparent' : theme.surfaceBorder}`,
                  fontFamily: theme.uiFont,
                }}
              >
                {tb.label}
                {Boolean(tb.badge) && (
                  <span
                    className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[0.6rem] rtl:ml-0 rtl:mr-1.5"
                    style={{ background: '#c25a5a', color: '#fff' }}
                  >
                    {tb.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Content ---- */}
      <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-10">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {tab === 'overview' && (
            <OverviewTab theme={theme} t={t} lang={lang} data={data} rsvps={rsvps} threads={threads} comments={comments} onNavigate={setTab} />
          )}
          {tab === 'rsvp' && <RsvpTab theme={theme} t={t} rsvps={rsvps} />}
          {tab === 'messages' && (
            <MessagesTab theme={theme} t={t} lang={lang} slug={slug} code={code} threads={threads} onThreadsChange={setThreads} loadError={threadsError} />
          )}
          {tab === 'comments' && (
            <CommentsTab theme={theme} t={t} lang={lang} slug={slug} code={code} comments={comments} onCommentsChange={setComments} />
          )}
        </motion.div>
      </div>
      <PortalToasts theme={theme} lang={lang} rsvps={rsvps} threads={threads} comments={comments} />
    </div>
  );
}
