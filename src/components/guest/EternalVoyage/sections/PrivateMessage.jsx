import useScrollReveal from './lib/useScrollReveal';
import ChatBlock from '../../shared/ChatBlock';
import { guestCopy } from '../../../../lib/guestCopy';

/**
 * ETERNAL VOYAGE — Private Message section.
 *
 * Reuses the project's existing shared `ChatBlock` (already wired to
 * the shared guest API for private guest<->couple threads) — nothing
 * new is duplicated here. `ChatBlock` already renders its own kicker/
 * title via `SectionHeading`, so this wrapper only adds a small
 * romantic description line + divider above the card (same
 * presentational pattern as RSVP/Guestbook/Countdown) and restyles
 * the card from the outside via CSS. No ChatBlock logic, props, or
 * API bindings changed.
 */
function resolveCoupleNames(data) {
  const groom = typeof data?.groom === 'string' ? data.groom : data?.groom?.name || '';
  const bride = typeof data?.bride === 'string' ? data.bride : data?.bride?.name || '';
  if (!groom && !bride) return '';
  return data?.language === 'ar' ? `${groom} و${bride}` : `${groom} & ${bride}`;
}

export default function PrivateMessage({ data, theme, slug }) {
  const t = guestCopy(data?.language);
  const [headerRef, headerVisible] = useScrollReveal();
  const [blockRef, blockVisible] = useScrollReveal();

  return (
    <section className="ev-private-message" id="private-message" data-section="private-message">
      <div
        ref={headerRef}
        className={`ev-comm-header ev-reveal ${headerVisible ? 'ev-reveal--visible' : ''}`}
      >
        <p className="ev-comm-subtitle ev-private-message__subtitle">
          A quiet word, just for us.
        </p>
        <span className="ev-comm-divider" aria-hidden="true" />
      </div>
      <div
        ref={blockRef}
        className={`ev-comm-block ev-reveal ${blockVisible ? 'ev-reveal--visible' : ''}`}
        style={{ transitionDelay: blockVisible ? '120ms' : '0ms' }}
      >
        <ChatBlock
          theme={theme}
          slug={slug}
          lang={data?.language}
          t={t.chat}
          coupleNames={resolveCoupleNames(data)}
        />
      </div>
    </section>
  );
}
