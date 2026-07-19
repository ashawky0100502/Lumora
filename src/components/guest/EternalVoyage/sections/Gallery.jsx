import GalleryBlock from '../../shared/GalleryBlock';
import EngagementBlock from '../../shared/EngagementBlock';
import { guestCopy } from '../../../../lib/guestCopy';

/**
 * ETERNAL VOYAGE — Gallery section.
 *
 * Bug fix: this used to only ever check two speculative field names
 * (`data.photos` / `data.gallery`) that don't exist anywhere in the real
 * Builder data shape (see lib/wizardData.js) — so Groom/Bride Photo was
 * the only thing that ever had a chance to render, and Engagement Photos
 * / Outings & Trips had nowhere to go at all. Every field below is one
 * of the real fields the Builder's Photos step actually writes
 * (StepPhotos.jsx: `photoGroom`, `photoBride`, `engagementPhotos`,
 * `outingPhotos`), read the same way GuestPageLayout.jsx already reads
 * them for every other template. No field name is invented.
 *
 * Per integration rules: no new lightbox/gallery UI is built here. This
 * wraps the project's existing shared `GalleryBlock` (wedding + outings
 * photos) and `EngagementBlock` (engagement story + photos) — the exact
 * same two shared components every other template already uses for
 * these three Builder sections — inside the template's existing
 * `.ev-gallery` luxury-masonry wrapper, so no new design/animation is
 * introduced. Each piece is gated on its own Builder "Show / Hide
 * Sections" toggle (`gallery`, `engagement`, `outings` — the same keys
 * every other template already reads from `data.sections`) and
 * independently renders nothing when it has no real content, so no
 * empty placeholder ever shows when data doesn't exist — and nothing is
 * ever silently skipped when it does.
 */
function resolveWeddingPhotos(data) {
  return [data?.photoGroom, data?.photoBride].filter(Boolean);
}

export default function Gallery({ data, theme, sections = {} }) {
  const t = guestCopy(data?.language);

  const weddingPhotos = resolveWeddingPhotos(data);
  const engagementPhotos = Array.isArray(data?.engagementPhotos) ? data.engagementPhotos.filter(Boolean) : [];
  const outingPhotos = Array.isArray(data?.outingPhotos) ? data.outingPhotos.filter(Boolean) : [];

  const showWedding = sections.gallery !== false && weddingPhotos.length > 0;
  // Mirrors EngagementBlock's own `hasContent` check (story/date/photos)
  // so this wrapper's decision to render always agrees with the block's.
  const showEngagement =
    sections.engagement !== false &&
    Boolean(data?.engagementStory || data?.engagementDate || engagementPhotos.length > 0);
  const showOutings = sections.outings !== false && outingPhotos.length > 0;

  if (!showWedding && !showEngagement && !showOutings) return null;

  return (
    <section className="ev-gallery" id="gallery" data-section="gallery">
      {showWedding && <GalleryBlock theme={theme} photos={weddingPhotos} t={t.gallery} />}

      {showEngagement && (
        <div className="ev-gallery__block">
          <EngagementBlock
            theme={theme}
            groom={data?.groom}
            bride={data?.bride}
            engagementDate={data?.engagementDate}
            engagementStory={data?.engagementStory}
            engagementPhotos={engagementPhotos}
            engagementDecor={data?.engagementDecor}
            lang={data?.language}
            t={t.engagement}
          />
        </div>
      )}

      {showOutings && (
        <div className="ev-gallery__block">
          <GalleryBlock theme={theme} photos={outingPhotos} t={t.outings} />
        </div>
      )}
    </section>
  );
}
