import useScrollReveal from './lib/useScrollReveal';
import RSVPBlock from '../../shared/RSVPBlock';
import { guestCopy } from '../../../../lib/guestCopy';

/**
 * ETERNAL VOYAGE — RSVP section.
 *
 * Reuses the project's existing shared `RSVPBlock` (already talking to
 * the shared guest API, `submitRsvp`) — nothing new is duplicated here.
 * `RSVPBlock` already renders its own kicker/title/divider via the
 * shared `SectionHeading`, so this wrapper does not add a second
 * heading; it only adds a short romantic intro line and a decorative
 * divider above the card (presentational markup only, same
 * "hardcode presentational copy" pattern already used by Countdown/
 * Timeline), then restyles the card itself from the outside via CSS
 * (see `.ev-rsvp` rules) — same technique already used for Gallery
 * and Countdown. No RSVPBlock logic, props, or API bindings changed.
 */
export default function RSVP({ data, theme, slug }) {
  const t = guestCopy(data?.language);
  const [headerRef, headerVisible] = useScrollReveal();
  const [blockRef, blockVisible] = useScrollReveal();

  return (
    <section className="ev-rsvp" id="rsvp" data-section="rsvp">
      <div
        ref={headerRef}
        className={`ev-comm-header ev-reveal ${headerVisible ? 'ev-reveal--visible' : ''}`}
      >
        <p className="ev-comm-subtitle ev-rsvp__subtitle">
          Your presence is the gift we treasure most — a single word from you means the world.
        </p>
        <span className="ev-comm-divider" aria-hidden="true" />
      </div>
      <div
        ref={blockRef}
        className={`ev-comm-block ev-reveal ${blockVisible ? 'ev-reveal--visible' : ''}`}
        style={{ transitionDelay: blockVisible ? '120ms' : '0ms' }}
      >
        <RSVPBlock theme={theme} slug={slug} t={t.rsvp} />
      </div>
    </section>
  );
}
