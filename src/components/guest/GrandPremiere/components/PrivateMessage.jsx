import { useEffect, useState } from 'react';
import { guestCopy } from '../../../../lib/guestCopy';
import {
  getGuestName,
  setGuestName,
  loadGuestThread,
  markThreadSeen,
  sendGuestMessage,
} from '../../../../lib/guestApi';
import { timeAgo } from '../../../../lib/guestFormat';
import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — Private Message Experience (Phase 14).
 *
 * Scope discipline: this phase builds ONLY the Private Message section,
 * per the Phase 14 brief. Opening Scene, Hero, Story, Quran Verse,
 * Timeline, Gallery, Venue, Countdown, RSVP, and Guestbook are all
 * untouched — this file only adds a new section, rendered after
 * Guestbook in `index.jsx`. Footer is still not started. Builder,
 * APIs, SQL, Supabase, Login, and VisitorChat were not touched — this
 * file only *calls* existing exported functions from the project's
 * existing shared `src/lib/guestApi.js`, the same discipline
 * `RSVP.jsx`/`Guestbook.jsx` already established (call the shared
 * function, never edit it).
 *
 * Builder data / API: no new field or endpoint is invented.
 * `privateMessage` (`../config/builderFields.js`) is not a raw Builder
 * field — like `rsvp`/`guestbook`, it's declared as
 * `{ component: 'ChatBlock', sectionToggle: 'sections.messages' }`,
 * meaning it goes through the project's existing shared guest<->couple
 * thread API, keyed off the invitation's `slug`, not off `data`
 * directly. This file calls that same API verbatim —
 * `getGuestName`/`setGuestName`, `loadGuestThread(slug)`,
 * `markThreadSeen(slug)`, and `sendGuestMessage(slug, text)`
 * (`src/lib/guestApi.js`) — the exact functions the shared `ChatBlock`
 * (`src/components/guest/shared/ChatBlock.jsx`, read only for this
 * phase to confirm the data shape, never edited) already calls against
 * the same `messages` table. `toggleGuestMessageReaction` and the
 * emoji picker are deliberately not wired here — see "Design" below,
 * the same call Guestbook already made for its own reactions/emoji
 * picker. `name`/`text` are the guest's own form input, not Builder
 * content; `slug` is the same invitation identifier already passed to
 * `RSVP`/`Guestbook`.
 *
 * Section toggle: gated in `index.jsx` by `sections.messages !== false`
 * — the real `data.sections.messages` key already declared in
 * `../config/builderFields.js` (`privateMessage.sectionToggle`) and
 * already listed in `SECTION_TOGGLE_KEYS`, the same external-gate
 * pattern `RSVP`/`Guestbook` already use.
 *
 * Self-gating ("no private message exists" -> return `null`, per the
 * brief): without a `slug` there is no invitation identifier to open a
 * thread against, so this returns `null` immediately — the same "no
 * channel, no section" rule `RSVP` already applies. Deliberately NOT
 * Guestbook's stricter rule (which also hides itself once loaded if
 * zero entries exist): a private thread is a channel a guest opens for
 * themselves the first time they write, the same situation RSVP's
 * one-time reply is in, not a public wall that only earns a place on
 * the page once other guests have already left something to read (the
 * reason Guestbook hides on an empty result). So "no private message
 * exists" here reads as "no `slug` to correspond through exists" —
 * once a `slug` exists, the guest can always open and start their own
 * letter, exactly like they can always open the RSVP card.
 *
 * Copy: kicker/title/intro/name placeholder/continue/loading/empty/
 * placeholder/send all come from the shared `guestCopy()` module's
 * existing `chat` map — the same map the shared `ChatBlock` already
 * reads for this exact section — so Arabic/English both render real,
 * already-reviewed strings; no new copy is invented for this phase.
 * The `chat` map has no `sending`/`error` entry (a pre-existing gap in
 * that shared module, not something invented here), so the busy/error
 * states reuse `guestCopy()`'s existing `rsvp.sending`/`rsvp.error`
 * strings verbatim — still real, already-reviewed copy, not new text,
 * the same "borrow an existing reviewed line rather than invent one"
 * choice RSVP/Countdown already made for their own presentational gaps
 * (see those files' own header comments). `dir` follows
 * `data.language`, matching every other section's pattern.
 *
 * Design: deliberately NOT the shared `ChatBlock` (a Tailwind
 * `GuestCard` with rounded message "bubbles" aligned left/right by
 * sender, an emoji-reaction tray, and an emoji picker) — the brief is
 * explicit this is not a chat: no chat bubbles, no speech bubbles, no
 * cards, no glassmorphism. Instead this reads as a sealed handwritten
 * letter: the same engraved-plate frame language `Venue.jsx`/
 * `RSVP.jsx`/`Guestbook.jsx` already established (gold hairline rules,
 * oversized display-serif title), a small wax-seal mark above the
 * kicker (`.gp-message__seal`, pure CSS + the same `&#10022;` glyph
 * `QuranVerse.jsx`'s own decorative mark already uses, for visual
 * continuity rather than a new invented motif), and every message —
 * from either side — set as its own quiet italic-serif paragraph with
 * a small tracked "signature" line above it (the sender's name) and a
 * thin hairline dividing one entry from the next, continuing exactly
 * the same anatomy `Guestbook.jsx`'s wall entries already use. There
 * is deliberately no left/right alignment, no colored fill, and no
 * bubble shape distinguishing guest from couple — only the signature
 * line and a slightly warmer text color for the couple's own words —
 * so the thread reads as correspondence in one shared letter, not a
 * messaging UI. The write area continues the same bare-underline field
 * language RSVP/Guestbook already use (borderless multi-line field, no
 * boxed textarea) with the same thin gold-bordered pill submit. The
 * one-time name gate (asking who is writing, before any thread loads)
 * reuses that identical field language rather than a "chat onboarding"
 * card.
 *
 * Motion: very slow and quiet, per the brief — GPU-friendly opacity +
 * transform only, no new animation library. The section frame reuses
 * the same `.gp-reveal`/`.gp-reveal--visible` primitive every other
 * section already uses, but scoped inside `.gp-message` its transition
 * duration is slowed well past the shared default (see the CSS block's
 * own comment) so the whole letter settles into place gradually,
 * rather than at the same pace as the plate sections around it. Each
 * message is its own small `LetterEntry` with its own
 * `useScrollReveal()` call — mirroring `GuestbookEntry`'s pattern,
 * which itself mirrors the `GalleryPlate` fix from Fix Pass 1 (one
 * shared reveal target on a tall multi-item list permanently defeats
 * `IntersectionObserver`'s viewport-relative threshold once there is
 * more than a couple of items) — also slowed the same way. The wax
 * seal and title carry no animation of their own beyond the frame's
 * single fade-and-rise; "elegant typography animation only," per the
 * brief, meant restraint here rather than a second effect layered on
 * top. The one inline error line reuses the exact fade+drift keyframe
 * already introduced for Countdown's ticking digits and reused by
 * RSVP/Guestbook (`gp-countdown-tick`) instead of declaring a fourth
 * near-identical keyframe; disabled under `prefers-reduced-motion:
 * reduce` via the same shared override that already disables it for
 * those two sections, plus `.gp-message`'s own reveal-duration override
 * is itself neutralized by `.gp-reveal`'s existing reduced-motion rule
 * (immediate opacity fade, no transform), so no separate override was
 * needed here.
 */

function resolveCoupleNames(data) {
  const groom = typeof data?.groom === 'string' ? data.groom : data?.groom?.name || '';
  const bride = typeof data?.bride === 'string' ? data.bride : data?.bride?.name || '';
  if (!groom && !bride) return '';
  return data?.language === 'ar' ? `${groom} و${bride}` : `${groom} & ${bride}`;
}

function LetterEntry({ message, isCouple, coupleNames, guestName, lang }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.15 });

  return (
    <li
      ref={ref}
      className={`gp-message__entry gp-reveal ${visible ? 'gp-reveal--visible' : ''} ${
        isCouple ? 'gp-message__entry--couple' : ''
      }`}
    >
      <span className="gp-message__signature">{isCouple ? coupleNames : guestName}</span>
      <p className="gp-message__text">{message.text}</p>
      {message.created_at && <span className="gp-message__time">{timeAgo(message.created_at, lang)}</span>}
    </li>
  );
}

export default function PrivateMessage({ data, slug }) {
  const [nameKnown, setNameKnown] = useState(() => Boolean(slug && getGuestName(slug)));
  const [guestDisplayName, setGuestDisplayName] = useState(() => (slug ? getGuestName(slug) : ''));
  const [nameInput, setNameInput] = useState('');
  const [thread, setThread] = useState(null); // null = not yet resolved
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [frameRef, frameVisible] = useScrollReveal();

  useEffect(() => {
    if (!slug || !nameKnown) return undefined;
    let alive = true;
    loadGuestThread(slug)
      .then((data_) => {
        if (!alive) return;
        setThread(data_ || []);
        markThreadSeen(slug);
      })
      .catch(() => {
        if (alive) setThread((prev) => prev ?? []);
      });
    return () => {
      alive = false;
    };
  }, [slug, nameKnown]);

  if (!slug) return null; // no invitation identifier -> no channel to open a letter through

  const copy = guestCopy(data?.language);
  const t = copy.chat;
  const isArabic = data?.language === 'ar';
  const lang = isArabic ? 'ar' : 'en';
  const coupleNames = resolveCoupleNames(data);

  function handleNameContinue(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setGuestName(slug, trimmed);
    setGuestDisplayName(trimmed);
    setNameKnown(true);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError('');
    const optimisticText = text.trim();
    setText('');
    try {
      await sendGuestMessage(slug, optimisticText);
      setThread((prev) => [
        ...(prev || []),
        { sender: 'guest', text: optimisticText, created_at: new Date().toISOString() },
      ]);
    } catch {
      setError(copy.rsvp.error);
      setText(optimisticText);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="gp-message"
      id="private-message"
      data-section="private-message"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={t.title}
    >
      <div className="gp-message__atmosphere" aria-hidden="true" />

      <div
        ref={frameRef}
        className={`gp-message__frame gp-reveal ${frameVisible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-message__seal" aria-hidden="true">
          &#10022;
        </span>

        <span className="gp-message__kicker">{t.kicker}</span>
        <span className="gp-message__rule gp-message__rule--top" aria-hidden="true" />

        <h2 className="gp-message__title">{t.title}</h2>
        <p className="gp-message__intro">{t.intro}</p>

        {!nameKnown ? (
          <form className="gp-message__gate" onSubmit={handleNameContinue}>
            <label className="gp-message__field">
              <span className="gp-message__field-label">{t.namePlaceholder}</span>
              <input
                className="gp-message__input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
            <button className="gp-message__submit" type="submit">
              {t.continue}
            </button>
          </form>
        ) : (
          <>
            {thread === null ? (
              <p className="gp-message__status">{t.loading}</p>
            ) : thread.length === 0 ? (
              <p className="gp-message__status gp-message__status--empty">{t.empty}</p>
            ) : (
              <ul className="gp-message__list">
                {thread.map((m, i) => (
                  <LetterEntry
                    key={(m.id || m.created_at || i) + '-' + i}
                    message={m}
                    isCouple={m.sender === 'couple'}
                    coupleNames={coupleNames}
                    guestName={guestDisplayName}
                    lang={lang}
                  />
                ))}
              </ul>
            )}

            <span className="gp-message__rule gp-message__rule--mid" aria-hidden="true" />

            <form className="gp-message__form" onSubmit={handleSend}>
              <label className="gp-message__field">
                <span className="gp-message__field-label">{t.placeholder}</span>
                <textarea
                  className="gp-message__input gp-message__input--text"
                  rows={2}
                  style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </label>

              {error && (
                <p key={error} className="gp-message__notice" role="status">
                  {error}
                </p>
              )}

              <button className="gp-message__submit" type="submit" disabled={busy}>
                {busy ? copy.rsvp.sending : t.send}
              </button>
            </form>
          </>
        )}

        <span className="gp-message__rule gp-message__rule--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
