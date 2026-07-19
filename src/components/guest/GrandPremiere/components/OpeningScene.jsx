import { useState } from 'react';

/**
 * GRAND PREMIERE — Opening Cinematic Scene (Phase 2, refined in Phase 3,
 * wired to the Hero transition in Phase 4).
 *
 * Purely decorative, cinematic "movie opening" moment: a luxury ring
 * box resting on a premium table, in a warm lit environment. This is
 * NOT a Builder-data section — there is no Builder field for "ring
 * box" or "opening scene" anywhere in `config/builderFields.js`, and
 * there never should be; nothing here reads, invents, or hardcodes
 * invitation content. The two rings revealed on open are generic
 * decorative iconography (drawn locally as inline SVG, same technique
 * already used for the gold pin icon in Eternal Voyage's Venue
 * section), not a "Bride Ring" / "Groom Ring" Builder field.
 *
 * Per the Phase 2 brief: click opens the box and reveals the two
 * rings. Phase 3 only refined the visual quality of this same scene
 * (box, rings, lighting, background, animation timing) — it did not
 * change that boundary, and it did not touch any other section.
 *
 * Phase 4 adds exactly one thing on top of that: once the box is
 * opened, `onOpened` fires so the parent (`index.jsx`) can start the
 * cinematic camera-transition into Hero on its own timer — this
 * component still does not know about Hero, the transition, or
 * Builder data; it only announces "the rings have been revealed."
 * The box intentionally stops responding to further clicks once open
 * (`disabled={isOpen}`) — this is a one-way "movie opening" moment
 * now that opening it kicks off the onward transition, not a
 * reusable open/close toggle to re-inspect.
 *
 * No video, no images, no animation libraries — CSS + inline SVG only
 * (gradients for metal/gem shading, transforms/transitions for motion),
 * respecting `prefers-reduced-motion` (see `styles/GrandPremiere.css`).
 */
export default function OpeningScene({ onOpened }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleToggle() {
    if (isOpen) return;
    setIsOpen(true);
    onOpened?.();
  }

  function handleKeyDown(event) {
    // Space/Enter already trigger a <button>'s click natively; this
    // only guards against Space scrolling the (non-scrolling) page.
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  return (
    <section className="gp-opening" aria-label="Opening scene">
      <div className="gp-opening__backdrop" aria-hidden="true">
        <div className="gp-opening__fog gp-opening__fog--1" />
        <div className="gp-opening__fog gp-opening__fog--2" />
        <div className="gp-opening__rays" />
        <div className="gp-opening__halo" />
      </div>

      <div className="gp-opening__atmosphere" aria-hidden="true">
        <div className="gp-opening__bokeh gp-opening__bokeh--1" />
        <div className="gp-opening__bokeh gp-opening__bokeh--2" />
        <div className="gp-opening__bokeh gp-opening__bokeh--3" />
        <div className="gp-opening__spotlight" />
        <div className="gp-opening__glow" />
        <div className="gp-opening__particles">
          {Array.from({ length: 14 }).map((_, index) => (
            <span key={index} className={`gp-particle gp-particle--${index % 7}`} />
          ))}
        </div>
      </div>

      <div className="gp-opening__title" aria-hidden="true">
        <p className="gp-opening__eyebrow">The Opening</p>
        <h1 className="gp-opening__title-text">A cinematic love story begins</h1>
        <p className="gp-opening__subtitle">Luxury, light, and a timeless premiere.</p>
      </div>

      <div className="gp-opening__stage">
        <div className="gp-opening__table" aria-hidden="true">
          <div className="gp-opening__table-veins" />
          <div className="gp-opening__table-sheen" />
        </div>

        <button
          type="button"
          className={`gp-lux-box${isOpen ? ' gp-lux-box--open' : ''}`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={isOpen}
          aria-label={isOpen ? 'Jewelry box open' : 'Open the jewelry box'}
        >
          <span className="gp-lux-box__shadow" aria-hidden="true" />

          <span className="gp-lux-box__exterior" aria-hidden="true">
            <span className="gp-lux-box__leather" />
            <span className="gp-lux-box__trim" />
          </span>

          <span className={`gp-lux-box__interior${isOpen ? ' gp-lux-box__interior--visible' : ''}`} aria-hidden="true">
            <span className="gp-lux-box__velvet" />
            <span className="gp-lux-box__tray">
              <span className="gp-lux-box__slot">
                <BrideRing className="gp-ring gp-ring--bride" />
              </span>
              <span className="gp-lux-box__slot">
                <GroomRing className="gp-ring gp-ring--groom" />
              </span>
            </span>
            <span className="gp-lux-box__glow" aria-hidden="true" />
            <span className="gp-lux-box__particles" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <i key={i} className={`gp-lux-box__particle gp-lux-box__particle--${i}`} />
              ))}
            </span>
          </span>

          <span className="gp-lux-box__lid" aria-hidden="true">
            <span className="gp-lux-box__lid-surface" />
            <span className="gp-lux-box__lid-crest" />
            <span className="gp-lux-box__lid-edge" />
          </span>
        </button>

        <p className={`gp-opening__hint${isOpen ? ' gp-opening__hint--hidden' : ''}`} aria-hidden={isOpen}>
          Tap to open
        </p>
      </div>
    </section>
  );
}

/**
 * Locally-drawn premium diamond ring — not a Builder asset. Gradient-
 * shaded band + faceted gem + a single soft sparkle glint, in place of
 * the earlier plain circle/triangle glyph.
 */
function BrideRing({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gpBrideBand" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#f8ecc7" />
          <stop offset="45%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#8a6f34" />
        </linearGradient>
        <radialGradient id="gpBrideGem" cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#eaf3ff" />
          <stop offset="100%" stopColor="#b7d2ec" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="33.5" rx="13.5" ry="8.5" fill="none" stroke="url(#gpBrideBand)" strokeWidth="3" />
      <path d="M17.5 27 L24 12.5 L30.5 27" fill="none" stroke="url(#gpBrideBand)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M24 12.5 L29.5 21.5 L24 27 L18.5 21.5 Z" fill="url(#gpBrideGem)" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.5" />
      <path d="M24 12.5 L24 27 M18.5 21.5 L29.5 21.5" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.5" />
      <path className="gp-gem-sparkle" d="M34 9 L35 12 L38 13 L35 14 L34 17 L33 14 L30 13 L33 12 Z" fill="#ffffff" />
    </svg>
  );
}

/**
 * Locally-drawn premium wedding band — not a Builder asset. Brushed-
 * metal gradient band with a soft top reflection arc, in place of the
 * earlier plain circle glyph.
 */
function GroomRing({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gpGroomBand" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#e9d29c" />
          <stop offset="28%" stopColor="#c9a24b" />
          <stop offset="52%" stopColor="#8f7238" />
          <stop offset="76%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#7d6330" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="26" rx="14.5" ry="10" fill="none" stroke="url(#gpGroomBand)" strokeWidth="5.5" />
      <path d="M13 21 A15 10 0 0 1 30 15.5" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
