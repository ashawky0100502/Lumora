import { guestCopy } from '../../../../lib/guestCopy';
import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — Story Experience (Phase 6).
 *
 * Scope discipline: this phase builds ONLY the Story section, per the
 * Phase 6 brief. Quran Verse, Timeline, Gallery, Venue, Countdown,
 * RSVP, Guestbook, Private Message, and Footer are still not started
 * anywhere in this template (see CLAUDE_HANDOFF.md "Next Phase").
 * Hero (`HeroEntrance.jsx`, `HeroMusic.jsx`) and the Opening Scene are
 * untouched — this file only adds a new section rendered after Hero.
 *
 * Builder is the only source of content. Every field read below is
 * the real one verified in `../config/builderFields.js`'s `story` map
 * (`letterGroom`, `letterBride`, `story`, `howWeMet`) — nothing is
 * invented, and a missing field is simply omitted rather than
 * backfilled. If Builder has no story content at all, this component
 * returns null, per the project-wide "no data -> no section" rule.
 *
 * Section toggle: gated by `sections.letters` in `index.jsx` (the
 * same real `data.sections.*` key `StepDesign.jsx`/Eternal Voyage's
 * own Story already use — see `SECTION_TOGGLE_KEYS` in
 * `../config/builderFields.js`), not a new toggle invented here.
 *
 * Design language: deliberately NOT a repaint of Eternal Voyage's
 * Story (quotation-styled glass cards in a grid). This is a luxury
 * editorial spread — a magazine masthead (kicker + oversized title +
 * a small ornamental flourish) beside a column of numbered "passages,"
 * each with an optional byline set in the couple's own name (real
 * Builder data, not an invented "From the Groom" phrase) rather than
 * a card.
 *
 * Fix Pass 1 (visual-only redesign, per `GRAND_PREMIERE_HANDOFF.md`):
 * the previous pass, while avoiding literal card containers, still
 * read as a plain blog list — a single narrow column of stacked
 * paragraph blocks with a small inline numeral. This pass keeps the
 * exact same Builder-driven passages/byline logic (nothing below this
 * comment changes what data is read) and only changes how it's
 * composed: each passage's folio numeral is now a large, faint
 * background "chapter mark" behind the text rather than a small inline
 * label; alternating passages shift their indent (`--alt`) so the
 * column breathes asymmetrically instead of reading as a uniform list;
 * the byline becomes a quiet "signature line" (hairline rule + small
 * caps) instead of a plain paragraph; and a thin vertical spine plus a
 * small diamond flourish under the masthead replace the previous
 * pulsing rule, for a more cinematic, considered composition. Kicker/
 * title copy still comes from the shared `guestCopy()` module (the
 * same `letters.kicker`/`letters.title` strings Gallery/Countdown/
 * RSVP/Guestbook/PrivateMessage already read for every other
 * template) so Arabic/English both render real, already-reviewed
 * copy instead of a new hardcoded string. The section's `dir`
 * attribute follows `data.language` so Arabic content lays out
 * correctly (right-to-left passages, folio numerals on the trailing
 * edge) rather than only ever rendering left-to-right.
 */

function firstText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

function resolveName(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Every field that has content becomes its own passage — letters
 * (`letterGroom` / `letterBride`, the couple's own words, addressed to
 * each other) together with the narrative fields (`story`, then
 * `howWeMet`), not an either/or. (Fix Pass 2: this previously treated
 * `story`/`howWeMet` as a fallback shown ONLY when neither letter
 * existed, so a couple who filled in both a letter and their "How We
 * Met" story would silently lose the latter — Builder had the data,
 * the section just never read it. Every field with real content is
 * now its own passage, in this fixed order.) Nothing here pads the
 * layout with invented text; a field left empty in Builder is simply
 * omitted.
 */
function resolveStoryPassages(data) {
  const groomName = resolveName(data?.groom);
  const brideName = resolveName(data?.bride);
  const letterGroom = firstText(data?.letterGroom);
  const letterBride = firstText(data?.letterBride);
  const storyText = firstText(typeof data?.story === 'string' ? data.story : '', data?.story?.text);
  const howWeMetText = firstText(data?.howWeMet);

  const passages = [];
  if (letterGroom) passages.push({ text: letterGroom, byline: groomName });
  if (letterBride) passages.push({ text: letterBride, byline: brideName });
  if (storyText) passages.push({ text: storyText, byline: '' });
  if (howWeMetText) passages.push({ text: howWeMetText, byline: '' });

  return passages;
}

function StoryPassage({ passage, index, isFirst }) {
  const [ref, visible] = useScrollReveal();
  const paragraphs = passage.text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

  return (
    <article
      ref={ref}
      className={`gp-story__passage gp-reveal ${visible ? 'gp-reveal--visible' : ''} ${
        isFirst ? 'gp-story__passage--lead' : 'gp-story__passage--folio'
      } ${index % 2 === 1 ? 'gp-story__passage--alt' : ''}`}
      style={{ transitionDelay: visible ? `${Math.min(index, 4) * 140}ms` : '0ms' }}
    >
      <span className="gp-story__mark" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="gp-story__passage-body">
        {(paragraphs.length ? paragraphs : [passage.text]).map((paragraph, pIndex) => (
          <p className="gp-story__text" key={pIndex}>
            {paragraph}
          </p>
        ))}
        {passage.byline && (
          <p className="gp-story__signature">
            <span className="gp-story__signature-rule" aria-hidden="true" />
            {passage.byline}
          </p>
        )}
      </div>
    </article>
  );
}

export default function Story({ data }) {
  const passages = resolveStoryPassages(data);
  const [headerRef, headerVisible] = useScrollReveal();

  if (!passages.length) return null;

  const t = guestCopy(data?.language).letters;
  const isArabic = data?.language === 'ar';

  return (
    <section
      className="gp-story"
      id="story"
      data-section="story"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={t.title}
    >
      <div className="gp-story__atmosphere" aria-hidden="true" />
      <span className="gp-story__spine" aria-hidden="true" />

      <div
        ref={headerRef}
        className={`gp-story__masthead gp-reveal ${headerVisible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-story__kicker">{t.kicker}</span>
        <h2 className="gp-story__title">{t.title}</h2>
        <span className="gp-story__flourish" aria-hidden="true">
          <span className="gp-story__flourish-line" />
          <span className="gp-story__flourish-mark">&#10022;</span>
          <span className="gp-story__flourish-line" />
        </span>
      </div>

      <div className="gp-story__spread">
        {passages.map((passage, index) => (
          <StoryPassage
            key={`${passage.byline}-${index}`}
            passage={passage}
            index={index}
            isFirst={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
