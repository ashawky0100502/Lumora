import useScrollReveal from './lib/useScrollReveal';
import CommentsBlock from '../../shared/CommentsBlock';
import { guestCopy } from '../../../../lib/guestCopy';

/**
 * ETERNAL VOYAGE — Guestbook section.
 *
 * Reuses the project's existing shared `CommentsBlock` (loadComments /
 * submitComment / reactions already wired to the shared guest API) —
 * nothing new is duplicated here. `CommentsBlock` already renders its
 * own kicker/title via `SectionHeading`, so this wrapper only adds a
 * short romantic intro line + divider above the card (same
 * presentational pattern as RSVP/Countdown) and restyles the card
 * from the outside via CSS. No CommentsBlock logic, props, or API
 * bindings changed.
 */
function resolveCoupleNames(data) {
  const groom = typeof data?.groom === 'string' ? data.groom : data?.groom?.name || '';
  const bride = typeof data?.bride === 'string' ? data.bride : data?.bride?.name || '';
  if (!groom && !bride) return '';
  return data?.language === 'ar' ? `${groom} و${bride}` : `${groom} & ${bride}`;
}

export default function Guestbook({ data, theme, slug }) {
  const t = guestCopy(data?.language);
  const [headerRef, headerVisible] = useScrollReveal();
  const [blockRef, blockVisible] = useScrollReveal();

  return (
    <section className="ev-guestbook" id="guestbook" data-section="guestbook">
      <div
        ref={headerRef}
        className={`ev-comm-header ev-reveal ${headerVisible ? 'ev-reveal--visible' : ''}`}
      >
        <p className="ev-comm-subtitle ev-guestbook__subtitle">
          Every wish you leave becomes part of our story — write yours into it.
        </p>
        <span className="ev-comm-divider" aria-hidden="true" />
      </div>
      <div
        ref={blockRef}
        className={`ev-comm-block ev-reveal ${blockVisible ? 'ev-reveal--visible' : ''}`}
        style={{ transitionDelay: blockVisible ? '120ms' : '0ms' }}
      >
        <CommentsBlock
          theme={theme}
          slug={slug}
          lang={data?.language}
          t={t.comments}
          coupleNames={resolveCoupleNames(data)}
        />
      </div>
    </section>
  );
}
