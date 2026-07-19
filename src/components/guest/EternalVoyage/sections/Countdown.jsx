import useScrollReveal from './lib/useScrollReveal';
import CountdownBlock from '../../shared/CountdownBlock';
import { guestCopy } from '../../../../lib/guestCopy';

/**
 * ETERNAL VOYAGE — Countdown section.
 *
 * Per integration rules: no new countdown logic is built here. This
 * wraps the project's existing shared `CountdownBlock` (backed by the
 * shared `useCountdown` hook), passing it the same `date`/`time`/
 * `labels` shape it already expects. The heading/subtitle/divider
 * below are presentational only — same pattern already used by
 * Timeline's hardcoded "The Day's Journey" heading, since neither
 * section has a data-driven title in the Builder.
 */
export default function Countdown({ data, theme }) {
  const date = data?.date || data?.weddingDate || data?.eventDate;
  const [headerRef, headerVisible] = useScrollReveal();
  const [blockRef, blockVisible] = useScrollReveal();
  if (!date) return null;

  const t = guestCopy(data?.language);

  return (
    <section className="ev-countdown" id="countdown" data-section="countdown">
      <div
        ref={headerRef}
        className={`ev-countdown__header ev-reveal ${headerVisible ? 'ev-reveal--visible' : ''}`}
      >
        <h2 className="ev-countdown__heading">The Countdown Begins</h2>
        <p className="ev-countdown__subtitle">Every moment brings us closer to forever.</p>
        <span className="ev-countdown__divider" aria-hidden="true" />
      </div>
      <div
        ref={blockRef}
        className={`ev-countdown__block ev-reveal ${blockVisible ? 'ev-reveal--visible' : ''}`}
        style={{ transitionDelay: blockVisible ? '120ms' : '0ms' }}
      >
        <CountdownBlock theme={theme} date={date} time={data?.time} labels={t.countdown} />
      </div>
    </section>
  );
}
