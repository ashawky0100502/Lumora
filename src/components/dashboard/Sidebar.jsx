import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sfxClick } from '../../lib/sfx';
import { ownerListConversations, subscribeToAllConversations } from '../../lib/ownerInboxApi';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    id: 'create',
    label: 'Create Invitation',
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 10h16" />
      </>
    ),
  },
  {
    id: 'invitations',
    label: 'My Invitations',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 17-5-5-4 4-3-3-6 6" />
      </>
    ),
  },
  {
    id: 'music',
    label: 'Music Studio',
    icon: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
  },
  {
    id: 'guests',
    label: 'Guests',
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 20c0-3.7 3-6 6.5-6s6.5 2.3 6.5 6" />
        <circle cx="17" cy="8" r="2.6" />
        <path d="M15.5 20c0-2.8-1-4.7-2.8-5.9" />
      </>
    ),
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: (
      <>
        <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-4.5a8.5 8.5 0 1 1 17-4Z" />
      </>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <path d="M4 20V10M12 20V4M20 20v-7" />,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L10 21h4l.5-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" />
      </>
    ),
  },
];

function NavItem({ item, active, onClick, badge }) {
  return (
    <div
      className="group relative mb-1 flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-[11px] px-4 py-3.5 text-[0.87rem] transition-all duration-300 hover:translate-x-1"
      style={{
        letterSpacing: '0.02em',
        color: active ? 'var(--gold-soft)' : 'rgba(246,244,239,0.65)',
        background: active ? 'rgba(212,175,55,0.14)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
      onClick={onClick}
    >
      {active && (
        <span
          className="absolute top-[14%] bottom-[14%] left-0 w-[3px] rounded-[3px]"
          style={{ background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }}
        />
      )}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-[17px] w-[17px] flex-shrink-0 transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-110"
      >
        {item.icon}
      </svg>
      <span>{item.label}</span>
      {badge > 0 && (
        <span
          className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[0.62rem] font-semibold"
          style={{ background: '#ff6767', color: '#1a0606' }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// Nav items hidden entirely for a member (demo) account — Messages,
// Notifications (the bell lives in Topbar) and Analytics are visible only
// to the owner, Settings is owner-only account/pricing/license config.
// Gallery and Music Studio are locked too: those libraries are scoped
// per-browser rather than per-account (see Dashboard.jsx), so they're
// hidden to avoid one member ever seeing another member's uploads.
const DEMO_LOCKED_IDS = new Set(['messages', 'analytics', 'settings', 'gallery', 'music']);

export default function Sidebar({ activeView, onNavigate, onLogout, session = { type: 'owner' }, isMobile = false, open = true, onClose }) {
  const isDemo = session.type === 'demo';
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // The owner inbox is global, single-tenant data — a member account has
    // no business reading it (or triggering the realtime subscription for
    // it), on top of the nav item being hidden below anyway.
    if (isDemo) return;
    function refreshUnread() {
      ownerListConversations()
        .then((list) => setUnreadMessages(list.filter((c) => c.unread_by_owner).length))
        .catch(() => {});
    }
    refreshUnread();
    const unsub = subscribeToAllConversations(refreshUnread);
    // The realtime subscription above is the primary update path — this
    // is just a safety net in case a socket silently drops, so it doesn't
    // need to run every 30s. Was previously doing a full refetch every
    // 30s on top of realtime, i.e. redundant work most of the time.
    const poll = setInterval(refreshUnread, 120000);
    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [isDemo]);

  const visibleNavItems = isDemo ? NAV_ITEMS.filter((item) => !DEMO_LOCKED_IDS.has(item.id)) : NAV_ITEMS;

  const sidebarBody = (
    <motion.div
      id="sidebar"
      key="sidebar-panel"
      className={isMobile ? 'fixed inset-y-0 left-0 z-[70] flex w-[78vw] max-w-[300px] flex-col border-r px-[18px] py-7' : 'flex flex-col border-r px-[18px] py-7'}
      style={{ background: isMobile ? 'rgba(10,8,16,0.94)' : 'rgba(10,8,16,0.55)', borderColor: 'rgba(212,175,55,0.16)', backdropFilter: 'blur(18px)' }}
      initial={{ x: '-100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '-100%' }}
      transition={{ duration: isMobile ? 0.35 : 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-[38px] flex flex-col items-center">
        <img
          src="/logo-icon.svg"
          alt="Lumora"
          className="mb-2.5 h-11 w-11"
          style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.35))' }}
        />
        <div
          id="side-logo"
          className="font-display pl-[0.24em] text-center text-[1.3rem]"
          style={{
            letterSpacing: '0.24em',
            background: 'linear-gradient(100deg, var(--gold-dim), var(--gold-soft), var(--gold-dim))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          LUMORA
        </div>
      </div>

      {visibleNavItems.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          active={activeView === item.id}
          badge={item.id === 'messages' ? unreadMessages : 0}
          onClick={() => {
            sfxClick();
            onNavigate(item.id);
          }}
        />
      ))}

      <div className="flex-1" />

      <NavItem
        item={{ id: 'logout', label: 'Logout', icon: (
          <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </>
        ) }}
        active={false}
        onClick={() => {
          sfxClick();
          onLogout();
        }}
      />
    </motion.div>
  );

  if (!isMobile) return sidebarBody;

  // Mobile: overlay + backdrop, only mounted while `open`. Tapping the
  // backdrop (or a nav item, handled by the parent) closes it.
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sidebar-backdrop"
            className="fixed inset-0 z-[65] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          {sidebarBody}
        </>
      )}
    </AnimatePresence>
  );
}
