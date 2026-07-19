import { useState } from 'react';
import { guestCopy } from '../../../../lib/guestCopy';
import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — Gallery (Phase 9A — structure only).
 *
 * Scope discipline: this phase builds ONLY Gallery.jsx. No CSS is
 * added anywhere in this pass (no new block in `GrandPremiere.css`) —
 * the class names below are the same naming convention every other
 * section already establishes (`gp-<section>`, `gp-<section>__part`,
 * see `QuranVerse.jsx` / `Timeline.jsx`) so a later phase can style
 * them without touching this file's structure or markup again. No
 * per-item stagger or hover choreography is authored here — each
 * photo's `useScrollReveal` usage (see `GalleryPlate` below, added in
 * Fix Pass 1) is the same one-line wiring every other section already
 * uses to fade its content in, not new animation. It is applied per
 * photo, not once for the whole section — see the `GalleryPlate`
 * comment for why that granularity is required for a tall multi-photo
 * section.
 *
 * Builder is the only source of content, read from
 * `../config/builderFields.js`'s `gallery` map — no field is invented
 * and no new category is introduced beyond the three that already
 * exist there:
 *   - `weddingPhotos`: `[data.photoGroom, data.photoBride]`, combined
 *     — the exact same two fields every other template already reads
 *     for this (see EternalVoyage's `Gallery.jsx`).
 *   - `engagementPhotos`: `data.engagementPhotos` (array). Only the
 *     photos themselves are shown here — `engagementStory` /
 *     `engagementDate` / `engagementDecor` are narrative fields that
 *     belong to a dedicated Engagement section, not this "Luxury
 *     Photo Exhibition," and are intentionally left untouched, same
 *     scope discipline every earlier phase in this project practices.
 *   - `outingPhotos`: `data.outingPhotos` (array).
 * Each collection is independently gated on its own real "Show / Hide
 * Sections" toggle (`sections.gallery`, `sections.engagement`,
 * `sections.outings` — the same keys `SECTION_TOGGLE_KEYS` already
 * lists and every other template already reads) and independently
 * renders nothing when it has no real photos. If none of the three
 * have content, the whole section returns `null` — no placeholder, no
 * empty heading, ever.
 *
 * Labels for each collection ("Gallery" / "The Engagement" / "Outings
 * & Trips" and their Arabic equivalents) come from the shared
 * `guestCopy(data.language)` object already used project-wide — the
 * same `t.gallery` / `t.engagement` / `t.outings` keys
 * EternalVoyage's own `Gallery.jsx` reads — not new hardcoded copy.
 *
 * Design intent ("Luxury Photo Exhibition," per the brief — explicitly
 * NOT a masonry grid, tiled grid, carousel, or slider): each photo is
 * laid out as its own single full-width "plate" in a simple vertical
 * procession, the way a guest walks a gallery corridor one frame at a
 * time, rather than scanning a tiled wall of thumbnails. This is a
 * structural/markup decision (one `<figure>` per photo, stacked in
 * document order, no grid/columns wrapper) so the "no grid/masonry"
 * rule is satisfied by the markup itself, independent of whatever CSS
 * a later phase adds. A quiet click-to-enlarge lightbox (single image,
 * click backdrop or the image again to close — no prev/next controls,
 * so it never becomes a slider) mirrors the same interaction the
 * shared `GalleryBlock` already uses elsewhere in this project, just
 * re-expressed as Grand Premiere's own markup instead of reusing that
 * Tailwind-based component, so it can take on this template's bespoke
 * `gp-` visual language once Phase 9B styles it.
 *
 * Bilingual: the section's `dir` follows `data.language` (`rtl` for
 * `'ar'`, `ltr` otherwise), the same pattern `Timeline.jsx` /
 * `QuranVerse.jsx` already use.
 */

function resolveWeddingPhotos(data) {
  return [data?.photoGroom, data?.photoBride].filter(Boolean);
}

function resolvePhotoArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

/**
 * Bug fix (Fix Pass 1): each photo now gets its own `useScrollReveal`
 * target, the same per-item granularity `Story.jsx`'s `StoryPassage`
 * already uses — instead of one `useScrollReveal` wrapping the whole
 * multi-exhibit, multi-photo `.gp-gallery__inner` (the previous
 * approach). `IntersectionObserver`'s threshold is a fraction of the
 * *target's own* height, not the viewport's — so for a target as tall
 * as an entire photo procession (several full-width plates stacked
 * with luxury spacing), the visible fraction could never reach the
 * 0.2 threshold on any normal viewport, and the whole section stayed
 * at `opacity: 0` forever. That's the actual rendering bug: the
 * images were always in the DOM with correct `src`/markup, just
 * permanently invisible. Reveal granularity is now per `<figure>`
 * plate, so each photo's own (much shorter) element correctly
 * crosses the threshold as it scrolls into view — no CSS or markup
 * class changed, no redesign, same `gp-reveal` / `gp-reveal--visible`
 * primitive every other section already uses.
 */
function GalleryPlate({ exhibit, src, onOpen }) {
  const [ref, visible] = useScrollReveal();

  return (
    <figure
      ref={ref}
      className={`gp-gallery__plate gp-reveal ${visible ? 'gp-reveal--visible' : ''}`}
    >
      <button
        type="button"
        className="gp-gallery__frame"
        onClick={() => onOpen(src)}
        aria-label={exhibit.title}
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="gp-gallery__image"
        />
      </button>
    </figure>
  );
}

export default function Gallery({ data }) {
  const sections = data?.sections || {};
  const language = data?.language;
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = guestCopy(language);

  const weddingPhotos = resolveWeddingPhotos(data);
  const engagementPhotos = resolvePhotoArray(data?.engagementPhotos);
  const outingPhotos = resolvePhotoArray(data?.outingPhotos);

  const showWedding = sections.gallery !== false && weddingPhotos.length > 0;
  const showEngagement = sections.engagement !== false && engagementPhotos.length > 0;
  const showOutings = sections.outings !== false && outingPhotos.length > 0;

  const [activeSrc, setActiveSrc] = useState(null);

  if (!showWedding && !showEngagement && !showOutings) return null;

  // Ordered list of the collections that actually have content — each
  // keeps its own existing Builder-backed label, no invented category.
  const exhibits = [];
  if (showWedding) {
    exhibits.push({ key: 'wedding', kicker: t.gallery.kicker, title: t.gallery.title, photos: weddingPhotos });
  }
  if (showEngagement) {
    exhibits.push({
      key: 'engagement',
      kicker: t.engagement.kicker,
      title: t.engagement.title,
      photos: engagementPhotos,
    });
  }
  if (showOutings) {
    exhibits.push({ key: 'outings', kicker: t.outings.kicker, title: t.outings.title, photos: outingPhotos });
  }

  return (
    <section className="gp-gallery" id="gallery" data-section="gallery" dir={dir}>
      <div className="gp-gallery__inner">
        {exhibits.map((exhibit) => (
          <div key={exhibit.key} className="gp-gallery__exhibit" data-exhibit={exhibit.key}>
            <div className="gp-gallery__masthead">
              <span className="gp-gallery__kicker">{exhibit.kicker}</span>
              <h2 className="gp-gallery__title">{exhibit.title}</h2>
              <span className="gp-gallery__rule" aria-hidden="true" />
            </div>

            <div className="gp-gallery__procession">
              {exhibit.photos.map((src, index) => (
                <GalleryPlate
                  key={`${exhibit.key}-${index}`}
                  exhibit={exhibit}
                  src={src}
                  onOpen={setActiveSrc}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeSrc && (
        <div
          className="gp-gallery__lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveSrc(null)}
        >
          <img src={activeSrc} alt="" className="gp-gallery__lightbox-image" />
        </div>
      )}
    </section>
  );
}
