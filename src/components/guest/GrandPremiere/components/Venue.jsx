import { guestCopy } from '../../../../lib/guestCopy';
import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — Venue Experience (Phase 10A).
 *
 * Scope discipline: this phase builds ONLY the Venue section, per the
 * Phase 10A brief. Opening Scene, Hero, Story, Quran Verse, Timeline,
 * and Gallery are all untouched — this file only adds a new section,
 * rendered after Gallery in `index.jsx`. Countdown, RSVP, Guestbook,
 * Private Message, and Footer are still not started.
 *
 * Builder is the only source of content. Every field read below is
 * the real one verified in `../config/builderFields.js`'s `venue`/
 * `map` maps (`venueName`, `locationDescription`, `parkingInfo`,
 * `mapsLink`, `mapsLat`, `mapsLng`) and cross-checked against
 * `src/lib/wizardData.js`'s `createInitialInvData()` — nothing is
 * invented. `mapHref` prefers the couple's own `mapsLink` verbatim;
 * only when that's empty does it fall back to building a standard
 * `https://www.google.com/maps?q=lat,lng` URL from `mapsLat`/
 * `mapsLng` (both real fields) so a pinned coordinate still gets a
 * working link even if the couple never pasted a share URL — this is
 * deriving a link from real data, not inventing a field. If none of
 * the four content fields (`venueName`, `locationDescription`,
 * `parkingInfo`, resolved `mapHref`) has anything, the section
 * `return null`s — no placeholder text, no empty frame.
 *
 * Section toggle: gated in `index.jsx` by `sections.location` — the
 * real `data.sections.location` key already declared in
 * `../config/builderFields.js` (`venue.sectionToggle`) and defaulted
 * `true` in `wizardData.js`, not a new toggle invented here.
 *
 * Copy: kicker/title/parking-label/map-link copy comes from the
 * shared `guestCopy()` module's existing `location` map (already used
 * for this exact section by every other template — Eternal Voyage's
 * own Venue, `GuestPageLayout`'s `LocationBlock`), so Arabic/English
 * both render real, already-reviewed strings instead of new hardcoded
 * text. `venueName` itself — the couple's real Builder content — is
 * the headline whenever it exists; `t.title` ("Location" / "مكان
 * الحفل") is only a fallback headline for the rare case where the
 * couple filled in a description/parking/map but never typed a venue
 * name.
 *
 * Design language: deliberately NOT another bordered "card" or a
 * plain embedded map block (both explicitly ruled out by the brief).
 * This reads as a single engraved invitation plate — a slim, exact
 * hairline rule above and below (not a boxed border on all four
 * sides, so it doesn't repeat Quran Verse's museum-frame corners),
 * generous vertical rhythm, and a locally-drawn gold-gradient pin
 * icon (same inline-SVG-with-gradient technique already used for the
 * ring box in `OpeningScene.jsx` and the Venue pin Eternal Voyage
 * already draws locally for its own template) instead of any Google
 * Maps embed or icon font. Motion is the same single soft fade + rise
 * every other section already uses (`gp-reveal`/`gp-reveal--visible`,
 * see `hooks/useScrollReveal.js`) — no new keyframes, no shimmer, no
 * parallax — "very subtle only," per the brief.
 */

function firstText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

/**
 * The couple's own pasted share link always wins. Falls back to a
 * plain Google Maps query URL built from `mapsLat`/`mapsLng` — both
 * real fields already read for this section — only when no link was
 * ever pasted. Returns '' when neither exists, so "no map" stays "no
 * map" rather than a broken/empty link.
 */
function resolveMapHref(data) {
  const navigationUrl = getMapsNavigationUrl({
    venueName: firstText(data?.venueName),
    venueAddress: firstText(data?.locationDescription),
    latitude: data?.mapsLat,
    longitude: data?.mapsLng,
    mapsLink: firstText(data?.mapsLink),
  });

  return navigationUrl;
}

/**
 * Locally-drawn gold-gradient location pin — not a Builder asset, not
 * an icon font/image. Same gradient-shaded inline-SVG technique
 * `OpeningScene.jsx` already uses for the two rings.
 */
import normalizeExternalUrl from '../../../../lib/normalizeUrl.js';
import { getMapsNavigationUrl } from '../../../../lib/mapService.js';

function VenuePin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gpVenuePin" x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor="#f8ecc7" />
          <stop offset="50%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#8a6f34" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.25c-4.28 0-7.75 3.43-7.75 7.66 0 5.62 6.78 11.62 7.07 11.87a1 1 0 0 0 1.36 0c.29-.25 7.07-6.25 7.07-11.87 0-4.23-3.47-7.66-7.75-7.66Z"
        fill="none"
        stroke="url(#gpVenuePin)"
        strokeWidth="1.3"
      />
      <circle cx="12" cy="9.9" r="2.6" fill="url(#gpVenuePin)" />
    </svg>
  );
}

export default function Venue({ data }) {
  const venueName = firstText(data?.venueName);
  const description = firstText(data?.locationDescription);
  const parking = firstText(data?.parkingInfo);
  const mapHref = resolveMapHref(data);

  const [frameRef, frameVisible] = useScrollReveal();

  if (!venueName && !description && !parking && !mapHref) return null;

  const t = guestCopy(data?.language).location;
  const isArabic = data?.language === 'ar';

  return (
    <section
      className="gp-venue"
      id="venue"
      data-section="venue"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={t.title}
    >
      <div className="gp-venue__atmosphere" aria-hidden="true" />

      <div
        ref={frameRef}
        className={`gp-venue__frame gp-reveal ${frameVisible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-venue__kicker">{t.kicker}</span>
        <span className="gp-venue__rule gp-venue__rule--top" aria-hidden="true" />

        <h2 className="gp-venue__name">{venueName || t.title}</h2>

        {description && <p className="gp-venue__description">{description}</p>}

        {(parking || mapHref) && (
          <div className="gp-venue__meta">
            {parking && (
              <div className="gp-venue__parking">
                <span className="gp-venue__meta-label">{t.parking}</span>
                <p className="gp-venue__meta-text">{parking}</p>
              </div>
            )}

            {mapHref && (
              <a className="gp-venue__map" href={normalizeExternalUrl(mapHref)} target="_blank" rel="noopener noreferrer">
                <VenuePin className="gp-venue__map-icon" />
                <span>{t.openMap}</span>
              </a>
            )}
          </div>
        )}

        <span className="gp-venue__rule gp-venue__rule--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
