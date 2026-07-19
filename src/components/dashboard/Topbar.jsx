import { motion } from 'framer-motion';
import NotificationBell from './NotificationBell';
import { sfxClick } from '../../lib/sfx';

function HamburgerButton({ open, onClick }) {
  return (
    <button
      type="button"
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={() => {
        sfxClick();
        onClick();
      }}
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
      style={{ color: 'var(--gold-soft)' }}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        {open ? (
          <>
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </>
        ) : (
          <>
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </>
        )}
      </svg>
    </button>
  );
}

export default function Topbar({ isMobile = false, sidebarOpen = false, onToggleSidebar, session = { type: 'owner' } }) {
  return (
    <motion.div
      id="topbar"
      className={isMobile ? 'flex items-center justify-between gap-3 border-b px-4' : 'flex items-center justify-between border-b px-[30px]'}
      style={{ background: 'rgba(10,8,16,0.35)', borderColor: 'rgba(212,175,55,0.14)', backdropFilter: 'blur(18px)' }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
    >
      {isMobile && <HamburgerButton open={sidebarOpen} onClick={onToggleSidebar} />}

      {isMobile ? (
        <div
          className="font-display flex-1 truncate text-center text-[1.05rem]"
          style={{
            letterSpacing: '0.2em',
            background: 'linear-gradient(100deg, var(--gold-dim), var(--gold-soft), var(--gold-dim))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          LUMORA
        </div>
      ) : (
        <div
          id="search-box"
          className="hidden w-[280px] items-center gap-2.5 rounded-[10px] border px-4 py-2.5 sm:flex"
          style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(212,175,55,0.18)' }}
        >
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search Lumora..."
            className="w-full bg-transparent text-[0.85rem] outline-none"
            style={{ color: 'var(--white)' }}
          />
        </div>
      )}

      <div id="top-actions" className="ml-auto flex items-center gap-5">
        {session.type !== 'demo' && <NotificationBell />}
        <div
          id="avatar"
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full p-0.5"
          style={{
            background: 'conic-gradient(from 0deg, var(--gold), var(--galaxy-purple), var(--blue), var(--gold))',
            animation: 'spinAvatar 6s linear infinite',
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "#1a1425 url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%228%22 r=%224%22 fill=%22%23D4AF37%22/><path d=%22M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7%22 fill=%22%23D4AF37%22/></svg>') center/60% no-repeat",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
