import { useState } from 'react';
import { guestCopy } from '../../../../lib/guestCopy';
import { submitRsvp } from '../../../../lib/guestApi';
import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — RSVP Experience (Phase 12).
 *
 * Scope discipline: this phase builds ONLY the RSVP section, per the
 * Phase 12 brief. Opening Scene, Hero, Story, Quran Verse, Timeline,
 * Gallery, Venue, and Countdown are all untouched — this file only
 * adds a new section, rendered after Countdown in `index.jsx`.
 * Guestbook, Private Message, and Footer are still not started.
 *
 * Builder data / API: no new field or endpoint is invented. This
 * reuses the project's existing shared `submitRsvp(slug, { name,
 * status, guestCount })` (`src/lib/guestApi.js`) verbatim — the exact
 * same call the shared `RSVPBlock` (used by Eternal Voyage's own RSVP)
 * already makes; nothing about the API, its payload shape, or Supabase
 * underneath it is touched. `name`/`status`/`guestCount` are the
 * guest's own input, not Builder content, and `slug` is the same
 * invitation identifier every other template's RSVP already receives
 * from `TemplateDispatcher` (see `index.jsx`'s own header comment,
 * which already lists `slug` among the props this template receives).
 *
 * Section toggle: gated in `index.jsx` by `sections.rsvp !== false` —
 * the real `data.sections.rsvp` key already declared in
 * `config/builderFields.js` (`rsvp.sectionToggle`), the same external-
 * gate pattern `Story`/`Timeline`/`Venue` already use. Independently,
 * this component also self-gates on data: without a `slug` there is no
 * invitation to submit an RSVP against, so it returns null rather than
 * rendering a form that could never succeed — "disabled or has no
 * data" both resolve to null, per the brief.
 *
 * Copy: every string (kicker, title, name placeholder, guest-count
 * placeholder, the two reply choices, submit/sending labels, the
 * thank-you line, the error line) comes from the shared `guestCopy()`
 * module's existing `rsvp` map — the same map the shared `RSVPBlock`
 * already reads for this exact section — so Arabic/English both
 * render real, already-reviewed strings; nothing here is new copy
 * invented for this phase. `dir` follows `data.language`, matching the
 * pattern `Story`/`QuranVerse`/`Venue` already use. The one line that
 * isn't from Builder or `guestCopy` is the short italic invitation
 * line under the title — presentational-only, the same "hardcode a
 * short line where neither Builder nor guestCopy has one" pattern
 * already used for Countdown's kicker and Timeline's heading.
 *
 * Design language: deliberately NOT the shared `RSVPBlock` (a
 * Tailwind `GuestCard` with rounded-border radio "cards" and a solid-
 * fill submit button) — the brief explicitly rules out cards,
 * dashboards, generic forms, glassmorphism, and material design. This
 * reads as a private reply card slipped back to the couple, not a web
 * form: the same engraved-plate language `Venue.jsx`/`Countdown.jsx`
 * already established (gold hairline rules, large display-serif
 * title), an underline-only name field (no boxed input), the two
 * reply choices set as quiet text with a thin gold underline marking
 * the current choice (not filled "buttons"), and the submit action as
 * a thin gold-bordered pill — the exact same pill treatment
 * `Venue.jsx`'s "Open in Maps" link already uses — instead of a solid
 * CTA block. A successful reply replaces the form with a single quiet
 * italic line, mirroring `Countdown.jsx`'s "arrived" state rather than
 * a checkmark/toast.
 *
 * Interaction: elegant button/choice states only — a soft
 * border/color transition on hover and on the selected choice/pill,
 * same restrained language as Venue's map-link hover. No new
 * keyframe animation is added for these; only `transition` on
 * `border-color`/`color`/`opacity`/`box-shadow`, so it's GPU-friendly
 * and CSS-only.
 *
 * Motion: the section frame uses the same shared `.gp-reveal`/
 * `.gp-reveal--visible` fade-and-rise primitive every other section
 * already uses (`hooks/useScrollReveal.js`) — no new keyframes for
 * that. The one state swap (form -> thank-you / error) reuses the
 * same `.gp-countdown__tick`-style fade+drift technique already
 * established in Phase 11 (`.gp-rsvp__notice`, opacity + `transform:
 * translateY` only), retriggered by React's own `key` remount rather
 * than any animation library — no bounce, no scale, nothing flashy.
 */

export default function RSVP({ data, slug }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('attending');
  const [guestCount, setGuestCount] = useState('1');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const [frameRef, frameVisible] = useScrollReveal();

  if (!slug) return null;

  const t = guestCopy(data?.language).rsvp;
  const isArabic = data?.language === 'ar';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await submitRsvp(slug, { name, status, guestCount });
      setDone(true);
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="gp-rsvp"
      id="rsvp"
      data-section="rsvp"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={t.title}
    >
      <div className="gp-rsvp__atmosphere" aria-hidden="true" />

      <div
        ref={frameRef}
        className={`gp-rsvp__frame gp-reveal ${frameVisible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-rsvp__kicker">{t.kicker}</span>
        <span className="gp-rsvp__rule gp-rsvp__rule--top" aria-hidden="true" />

        <h2 className="gp-rsvp__title">{t.title}</h2>
        <p className="gp-rsvp__intro">
          {isArabic
            ? 'كلمة واحدة منكم تكفي لتكتمل الدعوة.'
            : 'A single word from you completes the invitation.'}
        </p>

        {done || error ? (
          <p key={done ? 'thanks' : 'error'} className="gp-rsvp__notice" role="status">
            {done ? t.thanks : error}
          </p>
        ) : (
          <form className="gp-rsvp__form" onSubmit={handleSubmit}>
            <label className="gp-rsvp__field">
              <span className="gp-rsvp__field-label">{t.namePlaceholder}</span>
              <input
                className="gp-rsvp__input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>

            <div className="gp-rsvp__choices" role="radiogroup" aria-label={t.title}>
              {[
                { v: 'attending', label: t.attending },
                { v: 'not_attending', label: t.notAttending },
              ].map((opt) => (
                <label
                  key={opt.v}
                  className={`gp-rsvp__choice ${status === opt.v ? 'gp-rsvp__choice--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="gp-rsvp-status"
                    value={opt.v}
                    checked={status === opt.v}
                    onChange={() => setStatus(opt.v)}
                    className="gp-rsvp__choice-input"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {status === 'attending' && (
              <label className="gp-rsvp__field gp-rsvp__field--count">
                <span className="gp-rsvp__field-label">{t.countPlaceholder}</span>
                <input
                  className="gp-rsvp__input"
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                />
              </label>
            )}

            <button className="gp-rsvp__submit" type="submit" disabled={busy}>
              {busy ? t.sending : t.submit}
            </button>
          </form>
        )}

        <span className="gp-rsvp__rule gp-rsvp__rule--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
