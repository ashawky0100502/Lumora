import { guestCopy } from '../../../../lib/guestCopy';
import { useCountdown } from '../../../../hooks/useCountdown';
import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — Countdown Experience (Phase 11).
 *
 * Scope discipline: this phase builds ONLY the Countdown section, per
 * the Phase 11 brief. Opening Scene, Hero, Story, Quran Verse,
 * Timeline, Gallery, and Venue are all untouched — this file only
 * adds a new section, rendered after Venue in `index.jsx`. RSVP,
 * Guestbook, Private Message, and Footer are still not started.
 *
 * Builder data: no dedicated Countdown field or section toggle exists
 * (confirmed in `../config/builderFields.js`'s `countdown` map — the
 * same situation Eternal Voyage's own Countdown is in). The target
 * moment is derived from the real `hero.date` / `hero.time` fields
 * (`data.date`, `data.time`) already read by this template's Hero —
 * nothing invented. No Builder toggle to gate on, so this section
 * self-gates on data presence instead (the same pattern `QuranVerse`/
 * `Gallery` already use for fields with no dedicated toggle): no
 * `data.date` means nothing to count down to, so it returns null — no
 * placeholder, no empty frame.
 *
 * Countdown math: reuses the project's existing shared `useCountdown`
 * hook (`src/hooks/useCountdown.js`) verbatim — the same tick-once-a-
 * second logic Eternal Voyage's Countdown and the shared
 * `CountdownBlock` already run on. No new timer/date logic is written
 * here; the only new interval in this file is the one that hook
 * already owns.
 *
 * Copy: day/hour/minute/second labels and the "arrived" line come
 * from the shared `guestCopy()` module's existing `countdown` map
 * (already used by Eternal Voyage's own Countdown), so Arabic/English
 * both render real, already-reviewed strings. There is no Builder-
 * driven heading for this section (same situation Timeline's "The
 * Day's Journey" and Eternal Voyage's "The Countdown Begins" are in),
 * so the kicker below is presentational copy, not a Builder field.
 *
 * Design language: deliberately NOT the shared `CountdownBlock`'s
 * bordered/tinted digit boxes — the brief explicitly rules out "cheap
 * timer boxes," neon, glassmorphism, and dashboard styling. Instead
 * this reads as a single engraved dial: four oversized numerals set
 * in the same display serif Hero/Story/Venue already use, separated
 * by slim hairline dividers (not boxes), with small tracked labels
 * beneath each — the quiet, unornamented "final seconds before the
 * ceremony" read the brief asked for (Cartier/Rolex/Patek Philippe),
 * continuing the same engraved-plate language `Venue.jsx` established.
 *
 * Motion: CSS-first, minimal JavaScript. Layout/fade-in uses the same
 * shared `.gp-reveal`/`.gp-reveal--visible` primitive every other
 * section already uses — no new keyframes for that. The one per-
 * second change (a unit's two-digit value) gets a single quiet CSS
 * fade+drift (`.gp-countdown__tick`, opacity + transform only, GPU-
 * friendly), retriggered by React's own `key` remount rather than any
 * animation library — no bounce, no scale, nothing flashy. The only
 * timer in this file is `useCountdown`'s existing once-a-second tick;
 * no extra interval is added for animation.
 */

function pad2(n) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function DialUnit({ value, label }) {
  const str = pad2(value);
  return (
    <div className="gp-countdown__unit">
      <span className="gp-countdown__value" aria-hidden="true">
        <span key={str} className="gp-countdown__tick">
          {str}
        </span>
      </span>
      <span className="gp-countdown__label">{label}</span>
    </div>
  );
}

export default function Countdown({ data }) {
  const date = data?.date;
  const time = data?.time;
  const target = date ? `${date}T${time || '00:00'}` : null;
  const c = useCountdown(target);

  const [frameRef, frameVisible] = useScrollReveal();

  if (!c) return null;

  const t = guestCopy(data?.language).countdown;
  const isArabic = data?.language === 'ar';

  return (
    <section
      className="gp-countdown"
      id="countdown"
      data-section="countdown"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={t.days ? undefined : 'Countdown'}
    >
      <div className="gp-countdown__atmosphere" aria-hidden="true" />

      <div
        ref={frameRef}
        className={`gp-countdown__frame gp-reveal ${frameVisible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-countdown__kicker">
          {isArabic ? 'العد التنازلي' : 'The Countdown'}
        </span>
        <span className="gp-countdown__rule gp-countdown__rule--top" aria-hidden="true" />

        {c.done ? (
          <p className="gp-countdown__arrived">{t.arrived}</p>
        ) : (
          <div className="gp-countdown__dial" role="timer" aria-live="polite">
            <DialUnit value={c.days} label={t.days} />
            <span className="gp-countdown__sep" aria-hidden="true">
              :
            </span>
            <DialUnit value={c.hours} label={t.hours} />
            <span className="gp-countdown__sep" aria-hidden="true">
              :
            </span>
            <DialUnit value={c.minutes} label={t.minutes} />
            <span className="gp-countdown__sep" aria-hidden="true">
              :
            </span>
            <DialUnit value={c.seconds} label={t.seconds} />
          </div>
        )}

        <span className="gp-countdown__rule gp-countdown__rule--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
