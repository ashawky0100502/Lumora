import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — Quran Verse Experience (Phase 7).
 *
 * Scope discipline: this phase builds ONLY the Quran Verse section,
 * per the Phase 7 brief. Timeline, Gallery, Venue, Countdown, RSVP,
 * Guestbook, Private Message, and Footer are still not started
 * anywhere in this template (see CLAUDE_HANDOFF.md "Next Phase").
 * Hero and Story (`HeroEntrance.jsx`, `HeroMusic.jsx`, `Story.jsx`)
 * are untouched — this file only adds a new section rendered after
 * Story.
 *
 * Builder is the only source of content. The real field is
 * `data.quranVerse` (verified against `../config/builderFields.js`'s
 * `quranVerse` map, and the same field `StepNames.jsx` labels "Quran
 * Verse / Dua" and every other template — `GuestPageLayout.jsx` /
 * Eternal Voyage's `Prayer.jsx` — already reads). It has always been
 * stored as a plain string; the object-shape check below (`.text` /
 * `.verse` / `.surah` / `.surahName` / `.reference`) is defensive
 * only, mirroring the same multi-shape-tolerance pattern Eternal
 * Voyage's own `Story.jsx` already uses for `letters` — it does not
 * assume or invent a surah field that doesn't exist. There has never
 * been a dedicated "Surah name" field anywhere in the Builder (no
 * `StepNames.jsx` input, no `wizardData.js` key) — this component
 * simply doesn't render a surah caption unless that content is
 * actually present on `data.quranVerse` itself.
 *
 * No section toggle exists for this content anywhere in the project
 * (same situation `Prayer.jsx` documents for Eternal Voyage) — it
 * gates itself purely on whether there's real verse text to show,
 * per the project-wide "no data -> no section" rule.
 *
 * Typography: no Latin display webfont is applied to the verse or
 * caption text — both fall back through the same
 * `Georgia, 'Times New Roman', serif` stack the rest of this project
 * already uses, which lets the browser substitute a proper
 * Arabic-capable system font per-glyph instead of forcing a Latin
 * face that can't render Arabic. No letter-spacing or italic is
 * applied to Arabic-shaped text (both break Arabic's cursive letter
 * joining / synthetic-oblique rendering). `dir="auto"` is used
 * instead of hardcoding `rtl`, so the browser's own bidi algorithm
 * reads direction from the real Builder content rather than an
 * assumption about `data.language`.
 *
 * Fix Pass 1 (visual-only redesign, per `GRAND_PREMIERE_HANDOFF.md`):
 * `resolveQuranContent` below is untouched — same field, same shape
 * tolerance, same "no data -> no section" rule. What changed is the
 * frame itself: a richer double gold border with a warm inner glow
 * behind the verse (`.gp-quran__glow`), more ornate open corners, and
 * a small purely-decorative diamond mark above the verse (aria-hidden,
 * not text — it doesn't add or imply any Quranic content). The verse
 * itself now gets a lightweight Arabic-script check (Unicode range
 * only, no language assumption) purely to size and space Arabic text
 * a little more generously than Latin — respecting Arabic typography
 * rather than shrinking it to fit a Latin-tuned line-height.
 */

function firstText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

// Unicode-range check only — no assumption about `data.language`, just
// sizing the actual verse text appropriately for whichever script it's
// written in, since Builder content can be Arabic or English/Latin.
function isArabicScript(text) {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
}

function resolveQuranContent(data) {
  const raw = data?.quranVerse;

  if (typeof raw === 'string') {
    return { verse: firstText(raw), surah: '' };
  }

  if (raw && typeof raw === 'object') {
    return {
      verse: firstText(raw.text, raw.verse, raw.body),
      surah: firstText(raw.surah, raw.surahName, raw.reference),
    };
  }

  return { verse: '', surah: '' };
}

export default function QuranVerse({ data }) {
  const { verse, surah } = resolveQuranContent(data);
  const [ref, visible] = useScrollReveal();

  if (!verse) return null;

  const arabic = isArabicScript(verse);

  return (
    <section className="gp-quran" id="quran-verse" data-section="quran-verse">
      <div className="gp-quran__atmosphere" aria-hidden="true" />

      <div
        ref={ref}
        className={`gp-quran__frame gp-reveal ${visible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-quran__corner gp-quran__corner--tl" aria-hidden="true" />
        <span className="gp-quran__corner gp-quran__corner--tr" aria-hidden="true" />
        <span className="gp-quran__corner gp-quran__corner--bl" aria-hidden="true" />
        <span className="gp-quran__corner gp-quran__corner--br" aria-hidden="true" />

        <div className="gp-quran__glow" aria-hidden="true" />

        <span className="gp-quran__mark" aria-hidden="true">
          &#10022;
        </span>

        <p className={`gp-quran__verse ${arabic ? 'gp-quran__verse--arabic' : ''}`} dir="auto">
          {verse}
        </p>

        {surah && (
          <>
            <span className="gp-quran__rule" aria-hidden="true" />
            <p className="gp-quran__surah" dir="auto">
              {surah}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
