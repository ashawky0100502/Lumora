import { guestCopy } from '../../../../lib/guestCopy';
import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — Engagement Experience (Regression Audit restoration).
 *
 * Root cause this file fixes: `config/builderFields.js`'s `gallery`
 * map has always reserved `engagementDate` / `engagementStory` /
 * `engagementDecor` as "narrative fields that belong to a dedicated
 * Engagement section" (see `Gallery.jsx`'s own header comment, which
 * explicitly left them untouched on that basis) — but no such
 * dedicated section was ever built anywhere in this template. Those
 * three fields were reserved and documented, never orphaned by
 * accident, but also never actually read by any component, so a
 * couple who filled them in saw nothing. This file is that
 * previously-missing section. `engagementPhotos` is deliberately NOT
 * re-read here — `Gallery.jsx`'s own "Engagement" exhibit already
 * shows those photos, and duplicating them here would just repeat the
 * same images in two places.
 *
 * Builder is the only source of content: `data.engagementDate` /
 * `data.engagementStory` / `data.engagementDecor`, the exact fields
 * already verified in `../config/builderFields.js`'s `gallery.engagement`
 * map and cross-checked against `src/lib/wizardData.js`'s
 * `createInitialInvData()` — nothing invented. `engagementDecor` is a
 * couple-picked accent (`floral` / `candles` / `fairylights` / `none`,
 * the same option set the shared `EngagementBlock.jsx` already reads
 * for other templates) rendered as one small `aria-hidden` mark, not
 * text content. If neither `engagementStory` nor `engagementDate` has
 * anything, the section returns `null` — no placeholder, ever.
 *
 * Section toggle: gated in `index.jsx` by `sections.engagement`, the
 * same real `data.sections.engagement` key `Gallery.jsx`'s own
 * engagement-photo exhibit already reads for this same content
 * category — not a new toggle invented here.
 *
 * Design language: the same engraved-invitation-plate composition
 * `Venue.jsx` already established for this template (slim gold
 * hairline above/below, generous vertical rhythm, display-serif
 * headline) — reused deliberately for continuity rather than
 * inventing a fourth section language, since this section shares
 * Venue's "quiet plaque of facts" register rather than Story's dense
 * editorial one. Copy (kicker/title) comes from the shared
 * `guestCopy().engagement` map already used by `Gallery.jsx` for its
 * own Engagement exhibit label, so both stay in sync.
 */

const DECOR_MARK = {
  floral: '✿',
  candles: '✦',
  fairylights: '✧',
};

function firstText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

function resolveDateLabel(value, lang) {
  const raw = firstText(value);
  if (!raw) return '';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Engagement({ data }) {
  const story = firstText(data?.engagementStory);
  const dateLabel = resolveDateLabel(data?.engagementDate, data?.language);
  const mark = DECOR_MARK[data?.engagementDecor] || null;

  const [frameRef, frameVisible] = useScrollReveal();

  if (!story && !dateLabel) return null;

  const t = guestCopy(data?.language).engagement;
  const isArabic = data?.language === 'ar';

  return (
    <section
      className="gp-engagement"
      id="engagement"
      data-section="engagement"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={t.title}
    >
      <div className="gp-engagement__atmosphere" aria-hidden="true" />

      <div
        ref={frameRef}
        className={`gp-engagement__frame gp-reveal ${frameVisible ? 'gp-reveal--visible' : ''}`}
      >
        {mark && (
          <span className="gp-engagement__mark" aria-hidden="true">
            {mark}
          </span>
        )}
        <span className="gp-engagement__kicker">{t.kicker}</span>
        <span className="gp-engagement__rule gp-engagement__rule--top" aria-hidden="true" />

        <h2 className="gp-engagement__title">{t.title}</h2>

        {dateLabel && <span className="gp-engagement__date">{dateLabel}</span>}
        {story && <p className="gp-engagement__story">{story}</p>}

        <span className="gp-engagement__rule gp-engagement__rule--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
