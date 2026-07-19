import useScrollReveal from '../hooks/useScrollReveal';

/**
 * GRAND PREMIERE — Grand Finale Experience (Phase 15).
 *
 * Scope discipline: this phase builds ONLY the Grand Finale section,
 * per the Phase 15 brief. Opening Scene, Hero, Story, Quran Verse,
 * Timeline, Gallery, Venue, Countdown, RSVP, Guestbook, and Private
 * Message are all untouched — this file only adds a new section,
 * rendered last, after Private Message, in `index.jsx`. This closes
 * out `GRAND_PREMIERE_HANDOFF.md`'s "Next Phase" line, which named
 * this closing section "Footer" — the brief for this phase reframes
 * it explicitly as a cinematic closing scene rather than a utility
 * footer (no copyright line, no contact block, no site links), so it
 * is named/scoped here as `Finale`, not `Footer`.
 *
 * Builder data: no new field or endpoint is invented. The only real
 * content this section reads is `data.groom` / `data.bride` — the
 * exact two fields `../config/builderFields.js`'s own `footer` map
 * already reserved for this section ("No dedicated field — reads the
 * same couple-name fields Hero does"), the same fields every other
 * section in this template already treats as real, always-verified
 * Builder content (see `HeroEntrance.jsx`, `PrivateMessage.jsx`'s own
 * `resolveCoupleNames`). No section toggle exists for this content
 * anywhere in the project (the same situation `QuranVerse.jsx` and
 * `Countdown.jsx` document for themselves) — this section instead
 * self-gates purely on whether both names are still empty, per the
 * project-wide "no data -> no section, return null" rule stated in
 * `../config/builderFields.js`'s own file header. In practice this
 * never fires, since `StepNames.jsx` requires both names before a
 * couple can continue past step one — but the check is kept anyway so
 * this section follows the exact same defensive discipline as every
 * other one before it, rather than assuming Builder data is well-formed.
 *
 * Copy: the closing thank-you/blessing lines are short, static,
 * presentational copy — not Builder content and not a guest-facing
 * form label pulled from an existing shared map the way `Venue.jsx` /
 * `RSVP.jsx` / `Guestbook.jsx` / `PrivateMessage.jsx` all borrow from
 * `guestCopy()`'s existing section maps. `guestCopy()`'s `chat` map
 * gap (Phase 14) could be filled by borrowing an *existing* reviewed
 * line from another section because that gap was for a functional
 * label (a busy/error string) with a close semantic match already on
 * file. A closing scene's thank-you and blessing have no such existing
 * match anywhere in `guestCopy()` to borrow, and inventing one there
 * would mean editing a shared file every phase before this one has
 * deliberately left untouched (`GRAND_PREMIERE_HANDOFF.md` confirms
 * `guestCopy.js` has never been part of this template's change set —
 * every phase back to RSVP changed exactly three files: its own new
 * component, `index.jsx`, and `styles/GrandPremiere.css`). So, same as
 * `OpeningScene.jsx` being the one section that's fully data/copy-free
 * by design, this is the one content-bearing section that keeps its
 * two short closing lines local to its own file rather than reopening
 * a shared module — bilingual (ar/en), matching `data.language` the
 * same way every other section's copy already does.
 *
 * Design: very quiet, very minimal — a closing title card, not another
 * plate in the list. No corner ornaments (Quran Verse's), no wax seal
 * (Private Message's), no card/border box. Just a slim hairline above,
 * an oversized display-serif thank-you line, a single italic-serif
 * blessing line beneath it, a small centered fleuron ("&#10087;",
 * a different, purely typographic closing ornament from the
 * `&#10022;` mark already reused by Quran Verse/Private Message — this
 * one is the traditional printer's mark for the close of a chapter,
 * which is exactly what this section is), and the couple's names set
 * as a small tracked "signature" beneath it — reusing the exact
 * signature-line typographic treatment `PrivateMessage.jsx`'s own
 * `.gp-message__signature` established (small caps, wide tracking),
 * not a new "cursive script" invented for this one section. Generous
 * top/bottom padding — more than any section before it — so the whole
 * page visibly runs out of things to say rather than stopping abruptly.
 *
 * Motion: very slow, soft fade only — GPU-friendly opacity + transform
 * (translateY), no scale, no bounce, per the brief. One
 * `useScrollReveal()` call on the whole frame, reusing the shared
 * `.gp-reveal`/`.gp-reveal--visible` primitive every other section
 * already uses, slowed well past its 0.9s default (mirroring
 * `PrivateMessage.jsx`'s own `.gp-message__frame.gp-reveal` override
 * technique — a `transition-duration` override layered on the shared
 * rule via higher selector specificity, so the shared rule itself and
 * every other section's timing stay untouched). The thank-you line,
 * blessing line, ornament, and signature do not each run their own
 * `IntersectionObserver` — unlike Guestbook/Private Message's per-entry
 * reveal (needed there because a tall multi-item *list* defeats a
 * single viewport-relative observer, per Fix Pass 1's diagnosis), this
 * is four short, fixed lines that are always inside the same single
 * viewport together, so one observed frame is enough. Instead they
 * breathe in one after another via plain CSS `transition-delay` on
 * each line, gated by the parent's own `.gp-reveal--visible` class —
 * still one `IntersectionObserver`, just staggered opacity/transform
 * timing on its children, so nothing arrives at once. No keyframes, no
 * loops, no shimmer — the only rule the ornament reuses is the exact
 * `.gp-finale__rule` hairline gradient every other section's `__rule`
 * class already declares.
 */

function firstText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

function resolveSignature(data, isArabic) {
  const groom = firstText(data?.groom, data?.groom?.name);
  const bride = firstText(data?.bride, data?.bride?.name);
  if (!groom && !bride) return '';
  if (!groom) return bride;
  if (!bride) return groom;
  return isArabic ? `${groom} و ${bride}` : `${groom} & ${bride}`;
}

export default function Finale({ data }) {
  const isArabic = data?.language === 'ar';
  const signature = resolveSignature(data, isArabic);

  const [ref, visible] = useScrollReveal({ threshold: 0.3 });

  if (!signature) return null; // no couple names -> nothing real to close with

  const copy = isArabic
    ? {
        thanks: 'شكرًا لكونكم جزءًا من قصتنا',
        blessing: 'ها هي الصفحة الأولى من حكاية نرجو أن تمتد جميلة، عامًا بعد عام',
      }
    : {
        thanks: 'Thank You For Being Here',
        blessing: 'This is only the first page — may every page after it be just as beautiful',
      };

  return (
    <section
      className="gp-finale"
      id="finale"
      data-section="finale"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={copy.thanks}
    >
      <div className="gp-finale__atmosphere" aria-hidden="true" />

      <div
        ref={ref}
        className={`gp-finale__frame gp-reveal ${visible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-finale__rule gp-finale__rule--top" aria-hidden="true" />

        <h2 className="gp-finale__thanks">{copy.thanks}</h2>
        <p className="gp-finale__blessing">{copy.blessing}</p>

        <span className="gp-finale__ornament" aria-hidden="true">
          &#10087;
        </span>

        <p className="gp-finale__signature">{signature}</p>
      </div>
    </section>
  );
}
