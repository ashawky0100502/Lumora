import { useEffect, useState } from 'react';

/**
 * ETERNAL VOYAGE — Hero section.
 *
 * Full-viewport cinematic opener: bride & groom names, wedding date, a
 * short romantic line, and a CTA that glides the guest down into the
 * Quran Verse section. Everything guest-facing (names, date, background
 * image) is read from the existing Builder `data` object — nothing here
 * is hardcoded or placeholder.
 *
 * This file intentionally only reads `data`; it never writes to it and
 * never touches any other section, the Builder, or any API.
 */
// The Builder has grown a couple of shapes for name/date fields over time
// (plain strings vs. small { name } objects, `date` vs `weddingDate`) —
// resolve those defensively so this section renders correctly no matter
// which shape this invitation was saved with, without ever inventing a
// value that isn't there.
function resolveName(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') return (value.name || value.fullName || '').trim();
  return '';
}

function resolveDate(data) {
  return data?.date || data?.weddingDate || data?.eventDate || data?.hero?.date || '';
}

// Same field every other template reads (StepNames.jsx: "Invitation
// Message"), shown right under the couple's names/date there too.
function resolveInvitationMessage(data) {
  return typeof data?.invitationMessage === 'string' ? data.invitationMessage.trim() : '';
}

function formatWeddingDate(rawDate, language) {
  if (!rawDate) return '';
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return String(rawDate);

  try {
    return new Intl.DateTimeFormat(language || undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsed);
  } catch {
    return String(rawDate);
  }
}

// Scroll directly to the Quran Verse section using a real DOM element.
function scrollToQuranVerse() {
  const target = document.getElementById('quran-verse');

  if (!target) return;

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });

  const scrollContainer = target.closest('.ev-root');
  if (scrollContainer && typeof scrollContainer.scrollTo === 'function') {
    requestAnimationFrame(() => {
      scrollContainer.scrollTo({
        top: target.offsetTop,
        behavior: 'smooth',
      });
    });
  }
}

export default function Hero({ data, onBeginJourney }) {
  const bride = resolveName(data?.bride);
  const groom = resolveName(data?.groom);
  const dateLabel = formatWeddingDate(resolveDate(data), data?.language);
  const invitationMessage = resolveInvitationMessage(data);
  const [introPhase, setIntroPhase] = useState('black');
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (introComplete) return undefined;

    const timers = [
      window.setTimeout(() => setIntroPhase('glow'), 800),
      window.setTimeout(() => setIntroPhase('curtains'), 1800),
      window.setTimeout(() => setIntroPhase('open'), 3600),
      window.setTimeout(() => {
        setIntroPhase('complete');
        setIntroComplete(true);
      }, 5600),
    ];

    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
  }, [introComplete]);

  // Mirrors Gate.jsx's handleOpen pattern used by every other template:
  // MusicPlayer.play() must be invoked synchronously, inside the same
  // click handler as the guest's first interaction, or autoplay-
  // restricted browsers (Safari in particular) silently block sound.
  // Eternal Voyage has no Gate, so this button pair is its equivalent
  // "opening" gesture. No setTimeout/await in between — same call,
  // same click.
  function handleBegin() {
    onBeginJourney?.();
    scrollToQuranVerse();
  }

  return (
    <section className="ev-hero" id="hero" data-section="hero">
      <div className={`ev-hero__intro ${introComplete ? 'ev-hero__intro--complete' : 'ev-hero__intro--active'}`} aria-hidden="true">
        <div className={`ev-hero__intro-scene ev-hero__intro-scene--${introPhase}`} />
        <div className={`ev-hero__intro-glow ev-hero__intro-glow--${introPhase}`} />
        <div className={`ev-hero__curtain ev-hero__curtain--left ev-hero__curtain--${introPhase}`} />
        <div className={`ev-hero__curtain ev-hero__curtain--right ev-hero__curtain--${introPhase}`} />
      </div>

      <div className="ev-hero__overlay" aria-hidden="true" />

      <div className="ev-hero__ambient" aria-hidden="true">
        <span className="ev-hero__petal ev-hero__petal--1" />
        <span className="ev-hero__petal ev-hero__petal--2" />
        <span className="ev-hero__petal ev-hero__petal--3" />
        <span className="ev-hero__petal ev-hero__petal--4" />
        <span className="ev-hero__particle ev-hero__particle--1" />
        <span className="ev-hero__particle ev-hero__particle--2" />
        <span className="ev-hero__particle ev-hero__particle--3" />
        <span className="ev-hero__particle ev-hero__particle--4" />
        <span className="ev-hero__particle ev-hero__particle--5" />
        <span className="ev-hero__mist ev-hero__mist--1" />
        <span className="ev-hero__mist ev-hero__mist--2" />
        <span className="ev-hero__mist ev-hero__mist--3" />
      </div>

      <div className={`ev-hero__content ${introComplete ? 'ev-hero__content--revealed' : ''}`}>
        <p className="ev-hero__eyebrow">Together With Their Families</p>

        <h1 className="ev-hero__names">
          {groom && <span className="ev-hero__name">{groom}</span>}
          {groom && bride && <span className="ev-hero__ampersand">&amp;</span>}
          {bride && <span className="ev-hero__name">{bride}</span>}
        </h1>

        {dateLabel && <p className="ev-hero__date">{dateLabel}</p>}

        {invitationMessage && (
          <p className="ev-hero__message">{invitationMessage}</p>
        )}

        <p className="ev-hero__subtitle">
          Two hearts, one horizon — join us as our voyage begins.
        </p>

        <button
          type="button"
          className="ev-hero__cta"
          onClick={handleBegin}
        >
          Begin Our Journey
        </button>
      </div>

      <button
        type="button"
        className={`ev-hero__scroll ${introComplete ? 'ev-hero__scroll--revealed' : ''}`}
        onClick={handleBegin}
        aria-label="Scroll to our story"
      >
        <span className="ev-hero__scroll-line" />
      </button>
    </section>
  );
}
