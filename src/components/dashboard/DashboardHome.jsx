import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getOwnerRsvps, countConfirmedGuests } from '../../lib/ownerApi';
import { countGalleryPhotos } from '../../lib/galleryApi';
import { countMusicTracks } from '../../lib/musicApi';
import { getOwnerName } from '../../lib/settingsStore';

const STATIC_CARDS = [
  {
    title: 'Active Invitations',
    desc: 'Invitations you\u2019ve published, across all your celebrations.',
    stat: null, // filled in live below
    nav: 'invitations',
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    title: 'Guests Confirmed',
    desc: 'Responses received across all your events.',
    stat: null, // filled in live below
    nav: 'guests',
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 20c0-3.7 3-6 6.5-6s6.5 2.3 6.5 6" />
      </>
    ),
  },
  {
    title: 'Gallery Moments',
    desc: 'Photos and films saved to your private gallery.',
    stat: null, // filled in live below
    nav: 'gallery',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="2" />
      </>
    ),
  },
  {
    title: 'Music Studio',
    desc: 'Curated soundtracks ready for your ceremony.',
    stat: null, // filled in live below
    nav: 'music',
    icon: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
      </>
    ),
  },
];

function useTypedName(name, active) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!active) return;
    setTyped('');
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(name.slice(0, i));
      if (i >= name.length) clearInterval(iv);
    }, 110);
    return () => clearInterval(iv);
  }, [name, active]);

  return typed;
}

export default function DashboardHome({ active, onNavigate, session = { type: 'owner' } }) {
  const welcomeName = session.type === 'demo' ? session.account?.displayName || '' : getOwnerName();
  const typedName = useTypedName(welcomeName, active);
  const [guestsConfirmed, setGuestsConfirmed] = useState(null);
  const [invitationCount, setInvitationCount] = useState(null);
  const [galleryCount, setGalleryCount] = useState(null);
  const [musicCount, setMusicCount] = useState(null);

  useEffect(() => {
    let alive = true;
    getOwnerRsvps(session)
      .then(({ invites, rsvps }) => {
        if (!alive) return;
        setGuestsConfirmed(countConfirmedGuests(rsvps));
        setInvitationCount(invites.length);
      })
      .catch(() => {
        if (!alive) return;
        setGuestsConfirmed(0);
        setInvitationCount(0);
      });
    countGalleryPhotos()
      .then((n) => alive && setGalleryCount(n))
      .catch(() => alive && setGalleryCount(0));
    countMusicTracks()
      .then((n) => alive && setMusicCount(n))
      .catch(() => alive && setMusicCount(0));
    return () => {
      alive = false;
    };
  }, [session]);

  const cards = STATIC_CARDS.map((card) => {
    if (card.title === 'Guests Confirmed') {
      return { ...card, stat: guestsConfirmed === null ? '…' : guestsConfirmed };
    }
    if (card.title === 'Active Invitations') {
      // A member's real count now comes straight from the server (via the
      // same session-scoped call above) instead of this browser's local
      // list, so it's correct from any device — same source Guests/My
      // Invitations use, so all three screens always agree.
      return { ...card, stat: invitationCount === null ? '…' : invitationCount };
    }
    if (card.title === 'Gallery Moments') {
      return { ...card, stat: galleryCount === null ? '…' : galleryCount };
    }
    if (card.title === 'Music Studio') {
      return { ...card, stat: musicCount === null ? '…' : musicCount };
    }
    return card;
  });

  return (
    <div>
      <div id="welcome-block" className="mb-9">
        <div id="welcome-heading" className="font-display text-[2rem] font-semibold" style={{ letterSpacing: '0.02em' }}>
          Welcome Back,{' '}
          <span
            id="welcome-name"
            style={{
              background: 'linear-gradient(100deg, var(--gold-dim), var(--gold-soft), var(--gold))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 14px rgba(212,175,55,0.4))',
            }}
          >
            {typedName}
          </span>
          <span
            id="welcome-caret"
            className="ml-0.5 inline-block w-0.5"
            style={{ background: 'var(--gold-soft)', animation: 'blinkCaret .9s steps(1) infinite' }}
          >
            &nbsp;
          </span>
        </div>
        <div id="welcome-sub2" className="font-serif-alt mt-2 italic" style={{ color: 'rgba(246,244,239,0.5)', fontSize: '1.05rem' }}>
          Your next celebration is waiting to be designed.
        </div>
      </div>

      <div id="card-grid" className="grid gap-[22px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))' }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            className="lux-card relative cursor-pointer overflow-hidden rounded-[18px] border p-[26px]"
            style={{ background: 'var(--glass)', borderColor: 'rgba(212,175,55,0.16)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={active ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.7 + i * 0.12, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={{ y: -6, scale: 1.015 }}
            onClick={() => card.nav && onNavigate?.(card.nav)}
          >
            <div
              className="mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
              style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-soft)' }}
            >
              <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" stroke="currentColor" strokeWidth="1.6">
                {card.icon}
              </svg>
            </div>
            <h3 className="font-display mb-1.5 text-[0.95rem] font-semibold" style={{ letterSpacing: '0.03em' }}>
              {card.title}
            </h3>
            <p className="text-[0.78rem] leading-relaxed" style={{ color: 'rgba(246,244,239,0.5)' }}>
              {card.desc}
            </p>
            <div className="font-display mt-4 text-[1.5rem]" style={{ color: 'var(--gold-soft)' }}>
              {card.stat}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
