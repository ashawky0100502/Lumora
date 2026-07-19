import { useEffect, useRef, useState } from 'react';
import { notifText, timeAgo } from '../../lib/notifications';
import { subscribeNotifications, refreshNotificationsNow } from '../../lib/notificationsStore';
import { markAllSeenNow } from '../../lib/myInvites';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    // Joins the shared poll (see notificationsStore.js) instead of
    // running its own — NotificationToasts subscribes to the same feed,
    // so the expensive per-invite query set only ever runs once per tick
    // no matter how many components are listening.
    return subscribeNotifications((data) => {
      setItems(data);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <div
      ref={wrapRef}
      id="notif-bell"
      className="icon-btn relative flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(212,175,55,0.14)' }}
      onClick={(e) => {
        e.stopPropagation();
        const opening = !open;
        setOpen(opening);
        if (opening) refreshNotificationsNow();
      }}
    >
      {unreadCount > 0 && (
        <span
          className="absolute top-1.5 right-[7px] h-1.5 w-1.5 rounded-full"
          style={{ background: '#ff6767', boxShadow: '0 0 6px #ff6767' }}
        />
      )}
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="var(--gold-soft)" strokeWidth="1.6">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>

      <div
        id="notif-panel"
        className="absolute top-[calc(100%+14px)] right-0 z-[80] w-[320px] max-w-[88vw] cursor-default rounded-2xl border text-left transition-all duration-200"
        style={{
          background: 'rgba(18,14,26,0.96)',
          borderColor: 'var(--glass-border)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
          backdropFilter: 'blur(18px)',
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
        }}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3.5"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <span className="font-display text-[0.8rem]" style={{ letterSpacing: '0.06em', color: 'var(--gold-soft)' }}>
            Notifications
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              markAllSeenNow();
              refreshNotificationsNow();
            }}
            className="text-[0.68rem]"
            style={{ color: 'rgba(246,244,239,0.4)' }}
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-1.5">
          {loaded && items.length === 0 && (
            <div className="p-8 text-center text-sm" style={{ color: 'rgba(246,244,239,0.4)' }}>
              No activity yet — share your invitation link to start getting responses.
            </div>
          )}
          {items.map((item) => {
            const t = notifText(item);
            return (
              <div
                key={`${item.table}:${item.row?.id ?? item.created_at}`}
                className="flex items-start gap-2.5 rounded-[10px] p-2.5 transition-colors"
                style={{ background: item.unread ? 'rgba(212,175,55,0.05)' : 'transparent' }}
              >
                <div
                  className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border text-[0.85rem]"
                  style={{ background: 'rgba(212,175,55,0.12)', borderColor: 'rgba(212,175,55,0.25)' }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.8rem] leading-snug" style={{ color: 'rgba(246,244,239,0.9)' }}>
                    <b style={{ color: 'var(--gold-soft)' }}>{t.guestName}</b>{' '}
                    {t.verb || t.text} <b style={{ color: 'var(--gold-soft)' }}>{t.couple}</b>
                  </div>
                  <div className="mt-1 text-[0.65rem]" style={{ color: 'rgba(246,244,239,0.35)' }}>
                    {timeAgo(item.created_at, item.invite.language)}
                  </div>
                </div>
                {item.unread && (
                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: '#ff6767' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
