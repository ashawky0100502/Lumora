import { useCallback } from 'react';
import heroBackground from '../../../../assets/hero.png';

/**
 * GRAND PREMIERE — Hero Entrance (Phase 4: beginning of Hero; Phase 5:
 * complete Hero background).
 *
 * Phase 4 established what Hero reads and shows — the couple's names
 * and the cover image, nothing else. Phase 5 does not add any new
 * Builder field or any new content; it only gives that same cover
 * image the layered, cinematic treatment the brief asks for ("build
 * layers," not "simply display the image"): a `.gp-hero__frame`
 * wrapper (new this phase) clips a slow, subtle Ken Burns drift on the
 * image itself, and a `.gp-hero__vignette` layer (new this phase) sits
 * alongside the existing scrim/glow to darken the frame's edges for a
 * premium, film-composition feel. All of that is pure CSS on the same
 * `<img>` this component already rendered — see the "PHASE 5" block in
 * `styles/GrandPremiere.css` for the actual layering/animation.
 *
 * Story/Timeline/Gallery/Venue/Quran Verse/RSVP/Guestbook/Private
 * Message/Footer are still not started anywhere in this template (see
 * CLAUDE_HANDOFF.md "Next Phase") and nothing here reaches for them.
 * Countdown is likewise still not started — it was never part of
 * Hero's design language (Hero has only ever been names + cover
 * image), so per the Phase 5 brief it stays reserved for its own
 * future phase rather than being invented here.
 *
 * Builder is the only source of data. Every value below is read
 * straight from the real Builder field names verified in
 * `../config/builderFields.js` (`hero.bride`, `hero.groom`,
 * `coverImage`) — nothing is invented, aliased, or hardcoded, and a
 * missing field renders nothing (no placeholder text/image) rather
 * than being backfilled.
 */

function resolveName(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export default function HeroEntrance({ data }) {
  const bride = resolveName(data?.bride);
  const groom = resolveName(data?.groom);
  const heroImage = heroBackground;
  const hasNames = Boolean(groom || bride);

  const handleJumpToNextSection = useCallback(() => {
    const nextSection = document.querySelector('.gp-root [data-section]:not([data-section="hero"])');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <section className="gp-hero" aria-label="Hero" data-section="hero">
      {heroImage && (
        <div className="gp-hero__frame" aria-hidden="true">
          <img
            className="gp-hero__bg"
            src={heroImage}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      )}

      <div className="gp-hero__ambient" aria-hidden="true">
        <div className="gp-hero__fog gp-hero__fog--one" />
        <div className="gp-hero__fog gp-hero__fog--two" />
        <div className="gp-hero__dust" />
        <div className="gp-hero__rays" />
      </div>

      <div className="gp-hero__scrim" aria-hidden="true" />
      <div className="gp-hero__vignette" aria-hidden="true" />
      <div className="gp-hero__glow" aria-hidden="true" />
      <div className="gp-hero__frame-border" aria-hidden="true" />

      {hasNames && (
        <div className="gp-hero__content">
          <div className="gp-hero__ornament" aria-hidden="true">
            <span className="gp-hero__ornament-line" />
            <span className="gp-hero__ornament-flourish">✦</span>
            <span className="gp-hero__ornament-line" />
          </div>

          <p className="gp-hero__eyebrow">With love and celebration</p>

          <div className="gp-hero__names">
            {groom && <span className="gp-hero__name gp-hero__name--groom">{groom}</span>}
            {groom && bride && (
              <span className="gp-hero__ampersand" aria-hidden="true">
                &amp;
              </span>
            )}
            {bride && <span className="gp-hero__name gp-hero__name--bride">{bride}</span>}
          </div>

          <div className="gp-hero__divider" aria-hidden="true" />
          <p className="gp-hero__subtitle">A timeless wedding celebration, beautifully unveiled.</p>
          <p className="gp-hero__date">Saturday · 14 September · 2026</p>
          <button type="button" className="gp-hero__cta" onClick={handleJumpToNextSection}>
            Join the celebration
          </button>
        </div>
      )}
    </section>
  );
}
