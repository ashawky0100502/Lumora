import { useEffect, useRef, useState } from 'react';
import { buildNotificationItems, timeAgoPortal } from '../../lib/portalNotifications';

function seenKey(slug) {
  return `lumora_portal_notif_seen_${slug}`;
}

function getLastSeen(slug) {
  try {
    return sessionStorage.getItem(seenKey(slug)) || '';
  } catch {
    return '';
  }
}

function setLastSeen(slug, iso) {
  try {
    sessionStorage.setItem(seenKey(slug), iso);
  } catch {
    /* private-browsing / storage disabled — badge just won't persist across reloads */
  }
}

export default function PortalNotifications({ theme, lang, slug, rsvps, threads, comments }) {
  const t =
    lang !== 'en'
      ? { title: 'الإشعارات', markAllRead: 'تعليم الكل كمقروء', empty: 'مفيش نشاط جديد لسه' }
      : { title: 'Notifications', markAllRead: 'Mark all read', empty: 'No activity yet' };
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeenState] = useState(() => getLastSeen(slug));
  const wrapRef = useRef(null);

  const items = buildNotificationItems(lang, rsvps, threads, comments);
  const unreadCount = items.filter((i) => !lastSeen || new Date(i.ts) > new Date(lastSeen)).length;

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function markAllRead() {
    const newest = items[0]?.ts || new Date().toISOString();
    setLastSeen(slug, newest);
    setLastSeenState(newest);
  }

  const isDark = theme.id === 'velvet' || theme.id === 'midnight' || theme.id === 'amour';

  return (
    <div ref={wrapRef} className="relative" style={{ zIndex: 30 }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const opening = !open;
          setOpen(opening);
          if (opening) markAllRead();
        }}
        aria-label={t.title}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300"
        style={{ borderColor: theme.surfaceBorder, color: theme.accent, background: theme.surface }}
      >
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 right-[3px] flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold rtl:right-auto rtl:left-[3px]"
            style={{ background: '#c25a5a', color: '#fff' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      </button>

      <div
        className="absolute top-[calc(100%+12px)] right-0 z-[80] w-[310px] max-w-[85vw] rounded-2xl border text-left transition-all duration-200 rtl:right-auto rtl:left-0 rtl:text-right"
        style={{
          background: isDark ? 'rgba(14,12,18,0.97)' : 'rgba(255,255,255,0.97)',
          borderColor: theme.surfaceBorder,
          boxShadow: '0 30px 70px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(18px)',
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
        }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: theme.surfaceBorder }}>
          <span style={{ fontFamily: theme.displayFont, color: theme.accent, fontSize: '0.78rem', letterSpacing: '0.05em' }}>
            {t.title}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              markAllRead();
            }}
            className="text-[0.66rem]"
            style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}
          >
            {t.markAllRead}
          </button>
        </div>
        <div className="max-h-[340px] overflow-y-auto p-1.5">
          {items.length === 0 && (
            <div className="p-8 text-center text-sm" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
              {t.empty}
            </div>
          )}
          {items.map((item) => (
            <div key={item.key} className="flex items-start gap-2.5 rounded-[10px] p-2.5">
              <div
                className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full border text-[0.8rem]"
                style={{ background: `rgba(${theme.accentRgb},0.12)`, borderColor: `rgba(${theme.accentRgb},0.28)` }}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.78rem] leading-snug" style={{ color: theme.ink, fontFamily: theme.uiFont }}>
                  <b style={{ color: theme.accent }}>{item.guestName}</b> {item.text}
                </div>
                <div className="mt-0.5 text-[0.64rem]" style={{ color: theme.inkSoft, fontFamily: theme.uiFont }}>
                  {timeAgoPortal(item.ts, lang)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
