# LUMORA — Grand Premiere Handoff

This file tracks the `grand-premiere` template only
(`src/components/guest/GrandPremiere/`), split out from the shared
`CLAUDE_HANDOFF.md` log. From this point forward, all Grand Premiere
progress is appended here — not to `CLAUDE_HANDOFF.md`.

------------------------------------------------------------

## Current Completed Phases

- **Phase 1 — Architecture only:** isolated template folder scaffolded
  and registered (`templateRegistry.js`, `TemplateDispatcher.jsx`); no
  section UI yet.
- **Phase 2 — Cinematic Opening Scene:** decorative ring-box open/reveal
  moment; no Builder data read.
- **Phase 3 — Premium Opening Refinement:** ring box, rings, lighting,
  and animation refined.
- **Phase 4 — Cinematic Transition & Hero Entrance:** ring-box → Hero
  transition (stage state machine); Hero shows bride/groom names +
  cover image.
- **Phase 5 — Hero Experience:** cinematic background layering
  (focus-pull, Ken Burns drift, vignette) and Builder music integration
  (unlock/reveal/fade-in playback).
- **Phase 6 — Story Experience:** editorial letters/story section.
- **Phase 7 — Quran Verse Experience:** museum-frame styled verse/surah
  section.
- **Phase 8 — Memory Journey (Timeline):** cinematic scroll-driven
  timeline (horizontal dolly on desktop, vertical on mobile).
- **Phase 9A — Gallery Component (structure only):** Gallery.jsx built
  and mounted; Builder-bound; no CSS or animation polish yet.
- **Phase 9B — Gallery Layout (CSS only):** responsive layout, luxury
  spacing, and museum framing CSS added to Gallery.
- **Phase 10A — Venue Experience:** engraved-invitation-plate venue
  section (name, description, parking, elegant Open in Maps link);
  built, styled, and mounted.
- **Phase 11 — Countdown Experience:** engraved-dial luxury countdown
  (derived from `date`/`time`, no dedicated Builder field/toggle);
  built, styled, and mounted.
- **Phase 12 — RSVP Experience:** private-reply-card RSVP (underline
  name field, quiet reply choices, gold-pill submit), wired to the
  existing shared `submitRsvp` API; built, styled, and mounted.
- **Phase 13 — Guestbook Experience:** museum-guestbook wall of wishes
  (hairline-divided entries, underline write field, gold-pill submit),
  wired to the existing shared `loadComments`/`submitComment` APIs;
  built, styled, and mounted.
- **Phase 14 — Private Message Experience:** sealed-letter private
  correspondence (wax-seal mark, name gate, hairline-divided letter
  entries, underline write field, gold-pill submit, slow quiet reveal),
  wired to the existing shared `loadGuestThread`/`sendGuestMessage`
  APIs; built, styled, and mounted.
- **Phase 15 — Grand Finale Experience:** quiet closing title card
  (hairline, thank-you line, blessing line, fleuron ornament, tracked
  couple-name signature, slow staggered fade), self-gated on
  `groom`/`bride`; built, styled, and mounted as the invitation's last
  section.
- **Phase 16 — Director's Cut (Cinematic Master Pass):** direction-only
  pass across the whole template — closed the three remaining
  section-to-section color seams (Timeline→Gallery, Gallery→Venue,
  Private Message→Grand Finale), gave every section's existing
  atmosphere glow (plus Hero's own) one shared slow breathing
  animation, added Gallery's own overhead glow (its one missing
  atmosphere layer) as a CSS-only pseudo-element, and added a single
  persistent fixed vignette framing the whole scroll. No section,
  Builder field, or layout changed — CSS only.

------------------------------------------------------------

## Regression Audit (post-Phase 16)

Scope: audited the full render tree (`index.jsx` and every imported
section) against the reported symptom list — `How We Met`,
`Engagement`, `Gallery`, and `Guestbook` reported as not rendering at
all, not CSS-hidden.

### Finding 1 — `index.jsx` mounting: NOT broken

`Story`, `QuranVerse`, `Timeline`, `Gallery`, `Venue`, `Countdown`,
`RSVP`, `Guestbook`, `PrivateMessage`, and `Finale` were all already
correctly imported and mounted in `index.jsx`, each behind the correct
`stage === STAGE.HERO` gate and the correct real `sections.*` toggle.
Verified two ways: line-by-line diff against `config/builderFields.js`
+ `SECTION_TOGGLE_KEYS`, and an isolated `react-dom/server` render of
`Gallery.jsx`/`Guestbook.jsx`/`Story.jsx` with representative data —
all three render their full markup correctly given data. `App.jsx` →
`GuestView.jsx` → `TemplateDispatcher.jsx` pass `data`/`slug` straight
through with nothing filtered. So "Gallery" and "Guestbook" reading as
fully missing was not a mounting/render-tree defect in this snapshot —
both are self-gating components (per this project's own "no data ->
no section" rule) and render correctly once given photos/a slug.

### Finding 2 — `Story.jsx`: real content bug (fixed)

`resolveStoryPassages` treated `story`/`howWeMet` as a fallback shown
ONLY when neither `letterGroom` nor `letterBride` existed. Any couple
who filled in both a letter and their "How We Met" text silently lost
the latter — Builder had the data, the component just never read it.
Fixed: every field with content (`letterGroom`, `letterBride`,
`story`, `howWeMet`) is now its own passage, not an either/or.

### Finding 3 — `Engagement`: genuinely missing section (built)

`config/builderFields.js`'s `gallery.engagement` map reserved
`engagementDate`/`engagementStory`/`engagementDecor` for "a dedicated
Engagement section" (per `Gallery.jsx`'s own header comment), but no
such component was ever built anywhere in this template — confirmed
by grepping the whole folder; those three fields were read nowhere.
Added `components/Engagement.jsx` (engraved-plate design, mirroring
`Venue.jsx`) and mounted it in `index.jsx` between `Timeline` and
`Gallery`, gated by the same `sections.engagement` toggle `Gallery`'s
own engagement-photo exhibit already reads. `engagementPhotos` is
still only shown by `Gallery.jsx` (unchanged) so photos aren't
duplicated.

### Finding 4 — Timeline scroll/height bug (fixed, out of scope until now)

`useScrollProgress.js` measured progress across the outer `<section>`
(masthead + stage) using `span = rect.height + viewportHeight`, but
the sticky pin that actually holds the timeline on screen only lasts
for `stage.height - viewportHeight` — a much smaller, differently-
timed range. Progress could reach 1 either well before or well after
the pin actually released depending on stop count, leaving either
dead/unused scroll distance or a final memory that never fully
revealed. Fixed by measuring `.gp-timeline__stage` directly (not the
outer section) and deriving progress from the pin's real geometry on
desktop (falls back to the original whole-element formula on the
sub-861px non-pinned mobile layout). Also fixed `Timeline.jsx`'s fixed
0.14 `REVEAL_WINDOW`, which only happened to land the last stop at
progress 1 for ~7 stops — now `1 / count`, so stop reveal windows
exactly tile 0→1 for any stop count and the last event always finishes
exactly as the pin ends.

Verified via `npm install` + `npm run build` (clean) and `npx oxlint`
on the whole `GrandPremiere` folder (0 warnings/0 errors, 18 files).

------------------------------------------------------------

## Current Implementation Status

Section order rendered once `stage === 'hero'`: Opening Scene → Hero →
Story → Quran Verse → Timeline → Gallery → Venue → Countdown → RSVP →
Guestbook → Private Message → Grand Finale.

- Opening Scene, Hero, Story, Quran Verse, Timeline, Venue, Countdown,
  RSVP, Guestbook, Private Message, and Grand Finale are fully built
  (structure + styling + animation).
- Gallery has structure and layout CSS in place, but no animation or
  hover-polish pass yet (deliberately deferred).
- Nothing left unbuilt — Grand Finale was the last named section
  (previously tracked as "Footer" in this log; Phase 15's brief
  reframed it as a cinematic closing scene rather than a utility
  footer — see Phase 15's own section below for why).
- Phase 16 (Director's Cut) passed over every section for cinematic
  continuity/atmosphere only — no new section, no structural change;
  see Phase 16's own section below.
- No core project files have been modified at any phase — Builder,
  APIs, SQL, Supabase, Login, VisitorChat, and every other existing
  template remain untouched. Only two files outside the template's own
  folder were ever touched: `templateRegistry.js` and
  `TemplateDispatcher.jsx` (both in Phase 1, for registration).

------------------------------------------------------------

## Current Builder Integrations

- Bride Name / Groom Name (`data.bride`, `data.groom`)
- Cover Image (via shared `resolveCoverPhoto(data)` helper)
- Music (`audioUrl`, `audioFull`, `trimStart`, `trimEnd`; gated by
  `sections.music`)
- Story / Letters (`letterGroom`, `letterBride`, `story`,
  `howWeMet`; gated by `sections.letters`)
- Quran Verse (`data.quranVerse`, plain string with defensive
  object-shape fallback; no section toggle exists for this field)
- Timeline (`data.timeline` array — `time`/`title`/`description` with
  defensive alias fallbacks; gated by `sections.timeline`)
- Gallery: wedding photos (`data.photoGroom`, `data.photoBride`),
  engagement photos (`data.engagementPhotos`), outing photos
  (`data.outingPhotos`) — each gated independently by
  `sections.gallery` / `sections.engagement` / `sections.outings`
- Venue (`data.venueName`, `data.locationDescription`,
  `data.parkingInfo`), Map (`data.mapsLink`, with `data.mapsLat`/
  `data.mapsLng` as a derived-link fallback when no `mapsLink` was
  pasted) — gated by `sections.location`
- Countdown (`data.date`, `data.time`) — no dedicated section toggle
  exists; self-gates by returning `null` when there's no `date`
- RSVP: guest-submitted `name`/`status`/`guestCount` via the shared
  `submitRsvp(slug, ...)` API (`src/lib/guestApi.js`), keyed off the
  invitation's `slug` (same shared-API pattern as
  `guestbook`/`privateMessage` below) — gated by `sections.rsvp`; also
  self-gates by returning `null` when there's no `slug`
- Guestbook: guest-submitted wishes via the shared `loadComments(slug,
  { before })` / `submitComment(slug, { name, text })` API
  (`src/lib/guestApi.js`), keyed off the invitation's `slug` — gated by
  `sections.comments`; also self-gates by returning `null` when
  there's no `slug` or when the loaded guestbook has zero entries (no
  placeholder empty-state, per the brief)
- Private Message: guest<->couple private thread via the shared
  `getGuestName`/`setGuestName`, `loadGuestThread(slug)`,
  `markThreadSeen(slug)`, `sendGuestMessage(slug, text)` API
  (`src/lib/guestApi.js`), keyed off the invitation's `slug` — gated by
  `sections.messages`; also self-gates by returning `null` when
  there's no `slug` (unlike Guestbook, does NOT wait for an existing
  entry before showing itself — see Phase 14's own section for why)
- Grand Finale: `data.groom` / `data.bride` — the exact two fields
  `config/builderFields.js`'s own `footer` map already reserved for
  this section; no section toggle exists, so it self-gates by
  returning `null` when both names are empty (see Phase 15's own
  section for why)

All fields above are verified against `config/builderFields.js`; no
field or section-toggle key has been invented at any phase.

------------------------------------------------------------

## Current Known Issues

- `npm run build` / `oxlint` have not been run against the real dev
  toolchain since Phase 3 (sandbox has no network access to install
  `node_modules`); later phases were instead verified by hand
  (brace/paren balance, JSX/CSS parse checks). This needs to be run
  and confirmed clean before merging.
- Gallery has no animation, hover choreography, or visual-polish pass
  yet — explicitly deferred past Phase 9B.

------------------------------------------------------------

## Next Phase

None named. Grand Finale (Phase 15) was the last section on the brief
list, and Phase 16 (Director's Cut) was the last direction pass named
after it. Gallery's deferred hover/lightbox-transition polish (see
"Current Known Issues") remains the only open item.

------------------------------------------------------------

## Fix Pass 1

Scope: fixed Gallery's rendering bug and redesigned Story's and Quran
Verse's visual presentation only, per the Fix Pass 1 brief. Venue,
Countdown, and RSVP were not started (out of scope for this pass, as
instructed). No Builder field was renamed or invented; no API, SQL,
Supabase, Login, VisitorChat, or other-template file was touched.
`npm install` + `npm run build` were run against the real toolchain
this time (network was available) — build is clean, and `oxlint`
reports 0 warnings/0 errors on all three touched files.

### Issue 1 — Gallery rendering bug (found and fixed)

Root cause: `Gallery.jsx` wrapped its *entire* multi-exhibit,
multi-photo section in a single `useScrollReveal()` target
(`.gp-gallery__inner`), unlike every sibling section (`Story.jsx`'s
`StoryPassage`, for example), which reveals per small item.
`IntersectionObserver`'s `threshold` is a fraction of the *target's
own* total height, not the viewport — so once a gallery has more than
a couple of photos, the tallest the visible (viewport-sized) slice can
ever be relative to the whole section's height falls under the 0.2
threshold permanently, on any normal viewport. The images were always
correctly in the DOM, with correct `src`/Builder field mapping/gating
(all verified independently — `photoGroom`/`photoBride`/
`engagementPhotos`/`outingPhotos`, `sections.gallery`/`.engagement`/
`.outings`, and the `return null` guard all check out against
`config/builderFields.js` and `lib/wizardData.js`) — the section was
just stuck permanently at the primitive's initial `opacity: 0` state,
which reads to a guest as "images not rendering."

Fix: moved the reveal to per-photo granularity. Added a small
`GalleryPlate` component (mirroring `StoryPassage`'s pattern) that
calls its own `useScrollReveal()` and applies `gp-reveal`/
`gp-reveal--visible` to each `<figure className="gp-gallery__plate">`
individually. `.gp-gallery__inner` no longer carries a reveal target.
No CSS class was renamed, no markup structure changed beyond this,
and no Builder field/mapping/gating logic was touched.

Verified via `npm run build` (clean) and an isolated
`react-dom/server` render with representative data (all three photo
categories, RTL/LTR, and an empty-data case correctly returning
nothing).

### Issue 2 — Story: premium editorial redesign (visual only)

`resolveStoryPassages`/`firstText`/`resolveName` (the Builder-reading
logic) are unchanged. Composition changes only:
- Masthead is larger and more cinematic (bigger display title, wider
  kicker tracking, a small diamond flourish between two gold hairlines
  in place of the old single pulsing rule).
- Each passage's folio numeral is now a large, faint "chapter mark"
  watermark behind the text (`.gp-story__mark`) instead of a small
  inline label — reads as an editorial page mark, not a UI index.
- Alternating passages shift indent/alignment (`.gp-story__passage--alt`)
  so the column isn't a uniform repeating list, collapsing back to a
  single-width column on narrow viewports.
- The byline is now a quiet "signature line" (hairline rule + small
  caps) instead of a plain trailing paragraph.
- A thin center spine runs behind the passage column on wide
  viewports only (hidden under 640px).
- Still no cards, no border boxes, no shadows — the hairline rule
  between passages remains the only separator. Arabic (`dir="rtl"`)
  still skips the Latin-only drop cap, exactly as before.

### Issue 3 — Quran Verse: premium presentation (visual only)

`resolveQuranContent` (the Builder-reading logic) is unchanged —
still the same single `data.quranVerse` field with the same
defensive object-shape fallback, still no invented "surah" field.
Presentation changes only:
- Richer double gold frame: gradient border-image on the outer edge,
  the existing inset `::before` line kept, and four more ornate
  double-line filigree corners in place of the previous single-weight
  brackets.
- A warm inner glow (`.gp-quran__glow`) sits directly behind the verse
  text, in addition to the existing overhead spotlight glow — both
  static, no pulse/shimmer loop, per the brief's "no excessive
  animations."
- A small purely decorative diamond mark (`.gp-quran__mark`,
  `aria-hidden`) sits above the verse — not text content, doesn't
  imply any Quranic wording that isn't in Builder data.
- Added a lightweight Unicode-range check (`isArabicScript`, no
  language assumption) so Arabic-script verse text gets a larger,
  more generously-leaded size (`.gp-quran__verse--arabic`) than the
  Latin-tuned default — Arabic typography sized for Arabic, not
  shrunk to Latin metrics. `dir="auto"` bidi behavior is unchanged.

Verified via `npm run build` (clean) and an isolated
`react-dom/server` render with both an English verse and a real
Arabic verse (confirms `gp-quran__verse--arabic` applies correctly
and RTL Story passages still render their masthead/flourish intact).

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (this was already explicitly deferred past Phase 9B and is out of
  scope for Fix Pass 1, which only fixed the rendering bug).
- Venue, Countdown, RSVP, Guestbook, Private Message, and Footer are
  still not started — unchanged from before this pass, and explicitly
  out of scope per the Fix Pass 1 brief.

------------------------------------------------------------

## Cinematic Master Pass 1

Scope: visual-only polish of Opening Scene and Hero's cinematic
presentation, per the Cinematic Master Pass 1 brief. Only
`styles/GrandPremiere.css` was touched — confirmed by diffing the
whole project against the pre-pass zip, file by file. `OpeningScene.jsx`
and `HeroEntrance.jsx` were inspected but not edited; every addition
below layers onto elements those two files already render, either as
a `content: ''` pseudo-element (no new DOM node, so no JSX change
needed) or as `animation-*`/`transition` longhand rules added after
the existing declaration for that selector (only the named
timing/easing is overridden — background, filter math, gradients,
etc. from the earlier rule are untouched). No layout, spacing,
typography, or Builder-reading logic changed; no section was added,
removed, or reordered; Story, Quran Verse, Timeline, Gallery, and
every not-yet-started section were not referenced. Only `transform`,
`opacity`, and `filter` are animated — no layout-triggering
properties, no new JavaScript.

- **Opening scene** — the spotlight cone now breathes very slowly
  (10s, opacity only) instead of sitting fully static, so the room
  has a touch of ambient life before the guest ever taps the box.
- **Opening → Hero handoff** — the same expand/fade flare choreography,
  just slightly slower (1.5s/2.3s vs. 1.3s/1.9s) with a soft `filter:
  blur(6px)` diffusion as the flare dissolves into Hero, so the cut
  reads as film light settling rather than a hard fade.
- **Hero — luxury moving light** — a single soft diagonal beam
  (`.gp-hero::before`, `mix-blend-mode: screen`) drifts across the
  frame on a 36s loop, transform-only, sitting below the names
  (z-index 0 vs. content's 1). This is the main answer to the "feels
  static" brief — a slow beam of light gliding across the frame, the
  showroom-lighting read the brief asked for.
- **Hero — added depth** — a quiet radial falloff pinned to the top of
  `.gp-hero__frame` itself (`::after`, so it's clipped and drifts with
  the same Ken Burns move) layers a second, more realistic "key light
  from above" on top of the existing `.gp-hero__glow`, which now also
  breathes gently (9s, scale + opacity) instead of sitting static.
- **Hero — richer vignette** — a second, wider gradient band added
  under the existing radial vignette for a more deliberate
  film-composition edge.
- **Timing** — Hero's Ken Burns drift slowed from 26s to 32s, the
  focus-pull settle slowed from 2.2s to 2.6s with a softer easing
  curve, and the names' rise-in slowed from 1.4s to 1.8s with a later
  0.5s start — nothing sped up anywhere, only slowed and softened.
- All new animations (`gp-hero::before`, `.gp-hero__glow`,
  `.gp-opening__spotlight`) are disabled under
  `prefers-reduced-motion: reduce`, added alongside the block's
  existing reduced-motion overrides.

Verified via `npm install` + `npm run build` (clean, same chunk output
as before this pass) and `npx oxlint` on the whole GrandPremiere folder
(0 warnings/0 errors on all 11 files). A brace-balance check on the
edited CSS file also confirms 260 open / 260 close.

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to this pass's Hero/Opening
  scope).
- Venue, Countdown, RSVP, Guestbook, Private Message, and Footer are
  still not started — unchanged from before this pass.

------------------------------------------------------------

## Phase 10A — Venue Experience

Scope: built the Venue section only, per the Phase 10A brief. Opening
Scene, Hero, Story, Quran Verse, Timeline, and Gallery were not
touched — confirmed by diffing the whole project against the pre-phase
zip, file by file: exactly three files changed — the new
`components/Venue.jsx`, `index.jsx` (one import + one render line, for
registration), and `styles/GrandPremiere.css` (one new, additive
block). Countdown, RSVP, Guestbook, Private Message, and Footer were
not started (out of scope, as instructed). No Builder field was
invented; no API, SQL, Supabase, Login, VisitorChat, or other-template
file was touched.

### Builder data

Every field read is one already listed in `config/builderFields.js`'s
`venue`/`map` maps and cross-checked against
`src/lib/wizardData.js`'s `createInitialInvData()`:
`data.venueName`, `data.locationDescription`, `data.parkingInfo`,
`data.mapsLink`, `data.mapsLat`, `data.mapsLng`. The section is gated
in `index.jsx` by `sections.location !== false` — the real toggle
already declared for this content (`venue.sectionToggle` in
`config/builderFields.js`, defaulted `true` in `wizardData.js`), the
same external-gate pattern `Story`/`Timeline` already use. If none of
`venueName` / `locationDescription` / `parkingInfo` / a resolved map
link has any content, `Venue` returns `null` — no placeholder card, no
empty frame.

The "Open in Maps" link prefers the couple's own `mapsLink` verbatim.
Only when that's empty does it fall back to a plain
`https://www.google.com/maps?q=lat,lng` URL built from `mapsLat`/
`mapsLng` (both real, already-listed fields) — a derived link from
real data, not an invented field, so a pinned coordinate still gets a
working "Open in Maps" link even if the couple never pasted a share
URL.

### Design

Not a card, not a generic embedded map block (both explicitly ruled
out by the brief) — a single engraved invitation plate: a slim gold
hairline rule above and below the content (not a boxed border on all
four sides, so it doesn't repeat Quran Verse's museum-frame-with-
corners composition), generous vertical rhythm, and the venue name set
large in the same display serif Hero/Story already use. Parking
information and the map link sit in a quiet two-column "plaque" when
both exist (single column when only one does) rather than a grid of
boxes. The map link renders as a thin gold-bordered pill with a
locally-drawn gold-gradient pin icon (`VenuePin`, same inline-SVG-
with-gradient technique `OpeningScene.jsx` already uses for the ring
box) — never a raw hyperlink, never an iframe. Copy (kicker/title/
parking-label/"Open in Maps" text) comes from the shared
`guestCopy().location` map already used for this exact section by
other templates, so Arabic and English both render real, already-
reviewed strings; `dir` follows `data.language`, matching the pattern
`Story`/`QuranVerse` already use.

### Animation

Very subtle only, per the brief: the section reuses the same shared
`.gp-reveal`/`.gp-reveal--visible` fade-and-rise primitive every other
section already uses (`hooks/useScrollReveal.js`) — no new keyframes.
The one interactive element, the map-link pill, gets a single quiet
hover transition (border color / text color / soft glow), the same
restrained language as Story's signature-rule hover and Gallery's
plate hover. `.gp-reveal`'s existing `prefers-reduced-motion` override
(already in the shared block) covers this section automatically — no
new reduced-motion rule was needed.

### Verification

- `npm install` + `npm run build`: clean, no new warnings.
- `npx oxlint` on the whole `GrandPremiere/` folder: 0 warnings/0
  errors on all 12 files (11 before this phase + `Venue.jsx`).
- Brace-balance check on the edited CSS file: 279 open / 279 close.
- Isolated `react-dom/server` render with six representative data
  shapes: full data with `mapsLink`; `mapsLat`/`mapsLng`-only
  (confirms the derived-link fallback); no `venueName` but other
  content present (confirms the `t.title` fallback headline); a real
  Arabic data set (confirms `dir="rtl"`, translated copy, and RTL
  layout); a fully empty data object (confirms `return null`); and
  `mapsLat`/`mapsLng` left at their `wizardData.js` default of `null`
  with nothing else set (confirms this also correctly resolves to
  `return null`, not a broken map link).

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to Venue).
- Countdown, RSVP, Guestbook, Private Message, and Footer are still
  not started — unchanged from before this phase.

------------------------------------------------------------

## Phase 11 — Countdown Experience

Scope: built the Countdown section only, per the Phase 11 brief.
Opening Scene, Hero, Story, Quran Verse, Timeline, Gallery, and Venue
were not touched — confirmed by diffing the whole project against the
pre-phase zip, file by file: exactly three files changed — the new
`components/Countdown.jsx`, `index.jsx` (one import + one render line,
plus its own header comment updated for this phase, for registration),
and `styles/GrandPremiere.css` (one new, additive block). RSVP,
Guestbook, Private Message, and Footer were not started (out of scope,
as instructed). No Builder field was invented; no API, SQL, Supabase,
Login, VisitorChat, or other-template file was touched.

### Builder data

No dedicated Countdown field or section toggle exists in
`config/builderFields.js`'s `countdown` map — the same situation
Eternal Voyage's own Countdown is in. The target moment is derived
from the real `hero.date` / `hero.time` fields (`data.date`,
`data.time`), the same two fields this template's own Hero already
reads. Because there is no `sections.countdown` toggle to gate on,
the section self-gates on data presence instead — the same pattern
`QuranVerse`/`Gallery` already use for content with no dedicated
toggle: no `data.date` means nothing to count down to, so `Countdown`
`return null`s — no placeholder, no empty frame.

The countdown math itself is not new logic: it reuses the project's
existing shared `useCountdown` hook (`src/hooks/useCountdown.js`)
verbatim — the same tick-once-a-second hook Eternal Voyage's Countdown
and the shared `CountdownBlock` already run on. Day/hour/minute/second
labels and the "arrived" line come from the shared `guestCopy()`
module's existing `countdown` map (already used by Eternal Voyage's
own Countdown), so Arabic/English both render real, already-reviewed
strings. There is no Builder-driven heading for this section (the same
situation Timeline's "The Day's Journey" and Eternal Voyage's "The
Countdown Begins" are already in), so the small kicker above the dial
is presentational copy, not a Builder field.

### Design

Deliberately NOT the shared `CountdownBlock`'s bordered/tinted digit
boxes — no cheap timer boxes, no neon, no glassmorphism, no dashboard
look (all explicitly ruled out by the brief). Instead a single
engraved dial, continuing the same plate language `Venue.jsx`
established: a slim gold hairline rule above and below the content
(not a boxed border on all four sides), a small tracked kicker, and
four oversized numerals set in the same display serif Hero/Story/Venue
already use, separated by slim hairline colons rather than boxes, with
small tracked labels beneath each unit. When the target moment has
passed, the dial is replaced by the shared "the day has arrived" line
instead of showing zeroes.

### Animation

Very subtle, per the brief. The section frame uses the same shared
`.gp-reveal`/`.gp-reveal--visible` fade-and-rise primitive every other
section already uses (`hooks/useScrollReveal.js`) — no new keyframes
for that. Each unit's two-digit value gets one quiet fade+drift on
change (`.gp-countdown__tick`, opacity + `transform: translateY`
only — GPU-friendly, no layout-triggering properties), retriggered by
React's own `key` remount rather than any animation library — no
bounce, no scale, nothing flashy. The only interval in this file is
the one `useCountdown` already owns (once a second); no extra timer
was added for animation. `.gp-countdown__tick`'s animation is disabled
under `prefers-reduced-motion: reduce`, added alongside the block's own
override; `.gp-reveal`'s existing reduced-motion override (already in
the shared block) covers the frame's fade-in automatically.

### Verification

- `npm install` + `npm run build`: clean, no new warnings (pre-existing
  chunk-size notice only, unrelated to this phase).
- `npx oxlint` on the whole `GrandPremiere/` folder: 0 warnings/0
  errors on all 13 files (12 before this phase + `Countdown.jsx`).
- Brace-balance check on the edited CSS file: 302 open / 302 close.
- Isolated `react-dom/server` render with six representative data
  shapes: full data with `date` + `time` (confirms the dial renders);
  `date` only, no `time` (confirms the `00:00` fallback); a real
  Arabic data set (confirms `dir="rtl"` and translated kicker/labels);
  a past `date` (confirms the dial is replaced by the "arrived" line,
  not zeroes); no `date` at all (confirms `return null`); and a fully
  empty data object (confirms `return null`, not a broken dial).

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to Countdown).
- RSVP, Guestbook, Private Message, and Footer are still not started —
  unchanged from before this phase.

------------------------------------------------------------

## Phase 12 — RSVP Experience

Scope: built the RSVP section only, per the Phase 12 brief. Opening
Scene, Hero, Story, Quran Verse, Timeline, Gallery, Venue, and
Countdown were not touched — confirmed by diffing the whole project
against the pre-phase zip, file by file: exactly three files
changed — the new `components/RSVP.jsx`, `index.jsx` (one import, one
render line, `slug` now passed through instead of voided, and its own
header comment updated for this phase), and `styles/GrandPremiere.css`
(one new, additive block). Guestbook, Private Message, and Footer were
not started (out of scope, as instructed). No Builder field was
invented; no API, SQL, Supabase, Login, VisitorChat, or other-template
file was touched.

### Builder data / API

No new field or endpoint was created. `RSVP.jsx` calls the project's
existing shared `submitRsvp(slug, { name, status, guestCount })`
(`src/lib/guestApi.js`) verbatim — the exact same call the shared
`RSVPBlock` (used by Eternal Voyage's own RSVP) already makes.
`name`/`status`/`guestCount` are the guest's own form input, not
Builder content; `slug` is the same invitation identifier
`TemplateDispatcher` already passes to every template (previously
voided in `index.jsx` since no section consumed it yet — now passed
through to `RSVP`). Nothing about `submitRsvp`'s payload shape or the
Supabase table underneath it was touched.

Section toggle: gated in `index.jsx` by `sections.rsvp !== false` —
the real `data.sections.rsvp` key already declared in
`config/builderFields.js` (`rsvp.sectionToggle`), the same external-
gate pattern `Story`/`Timeline`/`Venue` already use. `RSVP.jsx` also
self-gates independently of that toggle: without a `slug` there is no
invitation to submit against, so it returns `null` rather than
rendering a form that could never succeed — "disabled or has no data"
both resolve to `null`, per the brief.

### Copy

Every string — kicker, title, name placeholder, guest-count
placeholder, the two reply choices, submit/sending labels, the
thank-you line, and the error line — comes from the shared
`guestCopy()` module's existing `rsvp` map, the same map the shared
`RSVPBlock` already reads for this exact section. Arabic/English both
render real, already-reviewed strings; nothing here is new copy
invented for the phase, aside from one short presentational intro
line under the title (no Builder field or `guestCopy` entry exists for
it, the same "hardcode a short line" situation Countdown's kicker and
Timeline's heading were already in).

### Design

Deliberately NOT the shared `RSVPBlock` (a Tailwind `GuestCard` with
rounded-border radio "cards" and a solid-fill submit button) — the
brief explicitly rules out cards, dashboards, generic forms,
glassmorphism, and material design. This reads as a private reply
slipped back to the couple, continuing the same engraved-plate
language `Venue.jsx`/`Countdown.jsx` already established: gold
hairline rules above and below, an oversized display-serif title, a
bare underline-only name field (no boxed input, no native number-input
spin buttons on the guest-count field), the two reply choices set as
quiet tracked text with a thin gold underline marking the current
choice (not filled "buttons"), and the submit action as the same thin
gold-bordered pill `Venue.jsx`'s "Open in Maps" link already uses
instead of a solid CTA block. A successful reply — or an error —
replaces the form with a single quiet italic line, mirroring
`Countdown.jsx`'s "arrived" state rather than a checkmark/toast.

### Interaction / Animation

Elegant states only, per the brief: a soft `border-color`/`color`
transition on the name field's underline, the selected reply choice's
underline, and the submit pill's hover/focus (same restrained language
as Venue's map-link hover) — no new keyframe for any of these, just
`transition` on non-layout properties. The section frame uses the same
shared `.gp-reveal`/`.gp-reveal--visible` fade-and-rise primitive every
other section already uses — no new keyframes there either. The one
state swap (form → thank-you/error line) reuses the exact fade+drift
keyframe already introduced for Countdown's ticking digits
(`gp-countdown-tick`) instead of declaring a second, near-identical
one; it's disabled under `prefers-reduced-motion: reduce`, added
alongside the block's own override.

### Verification

- `npm install` + `npm run build`: clean, no new warnings (pre-existing
  chunk-size notice only, unrelated to this phase).
- `npx oxlint` on the whole `GrandPremiere/` folder: 0 warnings/0
  errors on all 14 files (13 before this phase + `RSVP.jsx`).
- Brace-balance check on the edited CSS file: 338 open / 338 close.
- Isolated `react-dom/server` render with four representative data/prop
  shapes: a `slug` present with English copy (confirms the full form
  renders); a `slug` present with Arabic (confirms `dir="rtl"` and
  translated copy); no `slug` (confirms `return null`); and a fully
  empty `data` object with no `slug` prop at all (confirms `return
  null`, not a broken form). Submission itself was not exercised in
  this isolated render (it would require a live Supabase call, out of
  scope for a render-only check) — the request shape passed to
  `submitRsvp` is unchanged from the shared `RSVPBlock`'s own call, so
  no new payload risk was introduced.

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to RSVP).
- Guestbook, Private Message, and Footer are still not started —
  unchanged from before this phase.

------------------------------------------------------------

## Phase 13 — Guestbook Experience

Scope: built the Guestbook section only, per the Phase 13 brief.
Opening Scene, Hero, Story, Quran Verse, Timeline, Gallery, Venue,
Countdown, and RSVP were not touched — confirmed by diffing the whole
project against the pre-phase zip, file by file: exactly three files
changed — the new `components/Guestbook.jsx`, `index.jsx` (one import,
one render line, its own header comment updated for this phase), and
`styles/GrandPremiere.css` (one new, additive block). Private Message
and Footer were not started (out of scope, as instructed). No Builder
field was invented; no API, SQL, Supabase, Login, VisitorChat, or
other-template file was touched.

### Builder data / API

No new field or endpoint was created. `Guestbook.jsx` calls the
project's existing shared `loadComments(slug, { before })` and
`submitComment(slug, { name, text })` (`src/lib/guestApi.js`)
verbatim — the same calls the shared `CommentsBlock` (`guestbook`'s
`component` entry in `config/builderFields.js`) already makes against
the same `comments` table. `name`/`text` are the guest's own form
input, not Builder content; `slug` is the same invitation identifier
already passed to `RSVP`. `toggleCommentReaction` and the emoji picker
were deliberately left unwired — see Design below.

Section toggle: gated in `index.jsx` by `sections.comments !== false`
— the real `data.sections.comments` key already declared in
`config/builderFields.js` (`guestbook.sectionToggle`), the same
external-gate pattern `Story`/`Timeline`/`Venue`/`RSVP` already use.
`Guestbook.jsx` also self-gates independently of that toggle: without
a `slug` there is nothing to load or write against, so it returns
`null`; and once the first page of comments has loaded, an empty
result also returns `null` rather than showing a "no wishes yet"
placeholder line — this project's own established rule is "Builder has
none -> return null, no placeholder, ever" (see
`config/builderFields.js`'s file header), and the Phase 13 brief makes
the same call explicit for this section: "disabled or contains no
entries" both resolve to `null`. Because `comments` rows are keyed by
`slug` rather than by template, an invitation that already has wishes
from any other surface still shows them here; only a genuinely fresh,
empty guestbook stays silent.

### Copy

Every string — kicker, title, name placeholder, wish placeholder,
submit/sending/loading/error labels, and the load-more label — comes
from the shared `guestCopy()` module's existing `comments` map, the
same map the shared `CommentsBlock` already reads for this exact
section. Arabic/English both render real, already-reviewed strings;
no new copy was invented for this phase.

### Design

Deliberately NOT the shared `CommentsBlock` (a Tailwind `GuestCard`
with circular-initials "avatars," an emoji-reaction tray, and an emoji
picker) — the brief explicitly states this is not a comments section
or a chat: no chat bubbles, no social-media styling, no cards, no
avatars (none were already established for this template), no
glassmorphism. Instead each wish reads as a handwritten entry in a
museum guestbook, continuing the same engraved-plate language
`Venue.jsx`/`RSVP.jsx` already established: gold hairline rules above
and below the whole section, an oversized display-serif title, each
wish set in quiet italic serif with only a thin hairline dividing one
entry from the next (no card, no border box, no avatar circle), the
guest's name and a relative date set small and tracked beneath their
own words, and a write area continuing RSVP's bare-underline field
language (name field and a borderless multi-line wish field, both
underline-only, no boxed textarea) with the same thin gold-bordered
pill submit `Venue.jsx`/`RSVP.jsx` already use. Unlike RSVP's one-time
reply, this is a running wall a guest can add to more than once, so a
successful post leaves the form in place and simply prepends the new
wish to the list (the same optimistic-add pattern the shared
`CommentsBlock` already uses) rather than swapping to a thank-you
line; only a failed submit surfaces a quiet inline line.

### Interaction / Animation

Elegant states only, per the brief: a soft `border-color` transition
on the name/wish fields' underline and the submit pill's hover/focus
and the "show more" label's hover — no new keyframe for any of these,
just `transition` on non-layout properties. The section frame uses the
same shared `.gp-reveal`/`.gp-reveal--visible` fade-and-rise primitive
every other section already uses. Individual wishes do NOT share one
reveal target on the whole list — Fix Pass 1 already diagnosed exactly
this mistake in `Gallery.jsx` (a tall multi-item container's own
height permanently defeats `IntersectionObserver`'s viewport-relative
threshold once it has more than a couple of items) — so, mirroring
that fix's `GalleryPlate` pattern (and `Story.jsx`'s `StoryPassage`),
each wish is its own small `GuestbookEntry` component with its own
`useScrollReveal()` call. The one inline error line reuses the exact
fade+drift keyframe already introduced for Countdown's ticking digits
and reused by RSVP (`gp-countdown-tick`) instead of declaring a third
near-identical keyframe; disabled under `prefers-reduced-motion:
reduce`, added alongside the block's own override.

### Verification

- `npm install` + `npm run build`: clean, no new warnings (pre-existing
  chunk-size notice only, unrelated to this phase).
- `npx oxlint` on the whole `GrandPremiere/` folder: 0 warnings/0
  errors on all 15 files (14 before this phase + `Guestbook.jsx`).
- Brace-balance check on the edited CSS file: 374 open / 374 close.
- Manual trace of the self-gating logic against four representative
  states: no `slug` (returns `null`); `slug` present, first page not
  yet resolved (returns `null`, no loading placeholder); `slug`
  present, first page resolves to zero rows (returns `null`, no empty-
  state placeholder); `slug` present with one or more rows (renders
  the frame, the list, and the write form). A full `react-dom/server`
  render pass — the technique used for prior phases' isolated
  verification — was not exercised for the "has entries" path in this
  sandbox, since `useEffect` (and therefore `loadComments`) never runs
  during server-side rendering; that path was instead verified by
  hand against `CommentsBlock`'s own already-shipped handling of the
  same `loadComments` return shape (`{ items, hasMore, nextBefore }`).

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to Guestbook).
- Private Message and Footer are still not started — unchanged from
  before this phase.

------------------------------------------------------------

## Phase 14 — Private Message Experience

Scope: built the Private Message section only, per the Phase 14
brief. Opening Scene, Hero, Story, Quran Verse, Timeline, Gallery,
Venue, Countdown, RSVP, and Guestbook were not touched — confirmed by
diffing the whole project against the pre-phase zip, file by file:
exactly three files changed — the new `components/PrivateMessage.jsx`,
`index.jsx` (one import, one render line, its own header comment
updated for this phase), and `styles/GrandPremiere.css` (one new,
additive block). Footer was not started (out of scope, as instructed).
No Builder field was invented; no API, SQL, Supabase, Login,
VisitorChat, or other-template file was touched — `shared/ChatBlock.jsx`
was read (never edited) purely to confirm the real shape of the
guest<->couple thread this section reads from.

### Builder data / API

No new field or endpoint was created. `privateMessage`
(`config/builderFields.js`) is not a raw Builder field — like
`rsvp`/`guestbook`, it's declared as `{ component: 'ChatBlock',
sectionToggle: 'sections.messages' }`, so it goes through the existing
shared guest<->couple thread API keyed off the invitation's `slug`.
`PrivateMessage.jsx` calls that API verbatim —
`getGuestName`/`setGuestName`, `loadGuestThread(slug)`,
`markThreadSeen(slug)`, `sendGuestMessage(slug, text)`
(`src/lib/guestApi.js`) — the same functions the shared `ChatBlock`
already calls against the same `messages` table.
`toggleGuestMessageReaction` and the emoji picker were deliberately
left unwired, the same call Guestbook already made for reactions on
the `comments` table. `name`/`text` are the guest's own form input,
not Builder content; `slug` is the same invitation identifier already
passed to `RSVP`/`Guestbook`.

Section toggle: gated in `index.jsx` by `sections.messages !== false`
— the real `data.sections.messages` key already declared in
`config/builderFields.js` (`privateMessage.sectionToggle`) and already
listed in `SECTION_TOGGLE_KEYS`, the same external-gate pattern
`Story`/`Timeline`/`Venue`/`RSVP`/`Guestbook` already use.
`PrivateMessage.jsx` also self-gates independently of that toggle:
without a `slug` there is no invitation identifier to open a thread
against, so it returns `null` — "no private message exists" here
resolves to "no `slug` to correspond through exists." This is
deliberately RSVP's self-gate rule, not Guestbook's stricter one
(which also hides once loaded if it finds zero entries): a private
thread is a channel a guest opens for themselves the first time they
write, the same situation RSVP's one-time reply is in, not a public
wall that only earns a place on the page once other guests have
already left something to read. So once a `slug` exists, the section
always offers the guest a place to open their own letter — it does not
wait for a prior message (from either side) to already exist before
showing itself.

### Copy

Kicker/title/intro/name placeholder/continue/loading/empty/
placeholder/send all come from the shared `guestCopy()` module's
existing `chat` map — the same map the shared `ChatBlock` already
reads for this exact section — so Arabic/English both render real,
already-reviewed strings; no new copy was invented for this phase. The
`chat` map has no `sending`/`error` entry (a pre-existing gap in that
shared module), so the busy/error states reuse `guestCopy()`'s
existing `rsvp.sending`/`rsvp.error` strings verbatim — still real,
already-reviewed copy, the same "borrow an existing reviewed line
rather than invent one" choice RSVP/Countdown already made for their
own presentational gaps.

### Design

Deliberately NOT the shared `ChatBlock` (a Tailwind `GuestCard` with
rounded message bubbles aligned left/right by sender, colored fills,
and an emoji-reaction tray) — the brief explicitly states this is not
a chat: no chat bubbles, no speech bubbles, no cards, no glassmorphism.
Instead this reads as a sealed handwritten letter: the same
engraved-plate frame language `Venue.jsx`/`RSVP.jsx`/`Guestbook.jsx`
already established (gold hairline rules, oversized display-serif
title), a small wax-seal mark above the kicker reusing the exact
`&#10022;` glyph `QuranVerse.jsx`'s own decorative mark already uses
(visual continuity, not a new invented motif), and every message —
from either side — set as its own quiet italic-serif paragraph with a
small tracked signature line above it, divided from the next entry by
the same thin hairline `Guestbook.jsx`'s wall entries already use.
There is no left/right alignment, no bubble shape, and no fill color
distinguishing guest from couple — only the signature line and a
slightly warmer text color for the couple's own words — so the thread
reads as correspondence in one shared letter, not a messaging UI. The
one-time name gate (asking who is writing, before any thread loads)
and the write area both continue the exact same bare-underline field
language RSVP/Guestbook already use (borderless multi-line field, no
boxed textarea) with the same thin gold-bordered pill submit.

### Interaction / Animation

Very slow and quiet, per the brief — GPU-friendly opacity + transform
only. The section frame reuses the same `.gp-reveal`/
`.gp-reveal--visible` primitive every other section already uses, but
scoped inside `.gp-message` its transition duration is slowed well
past the shared 0.9s default (1.7s for the frame, 1.3s for each
entry), so the letter settles into place gradually rather than at the
same pace as the plate sections around it — this only layers a
`transition-duration` override on top of the shared `.gp-reveal`
rule's existing `opacity`/`transform` declarations via higher
selector specificity, so the shared rule itself, and every other
section's reveal timing, is untouched. Each message is its own small
`LetterEntry` with its own `useScrollReveal()` call, mirroring
`GuestbookEntry`'s pattern (itself mirroring the `GalleryPlate` fix
from Fix Pass 1 — one shared reveal target on a tall multi-item list
permanently defeats `IntersectionObserver`'s viewport-relative
threshold once there is more than a couple of items). The wax seal and
title carry no animation beyond the frame's single fade-and-rise — "no
excessive animations," restraint over a second effect layered on top.
The one inline error line reuses the exact fade+drift keyframe already
introduced for Countdown's ticking digits and reused by RSVP/Guestbook
(`gp-countdown-tick`), disabled under `prefers-reduced-motion: reduce`
via the same shared override already covering those two sections.

### Verification

- `npm install` + `npm run build`: clean, no new warnings (pre-existing
  chunk-size notice only, unrelated to this phase).
- `npx oxlint` on the whole `GrandPremiere/` folder: 0 warnings/0
  errors on all 16 files (15 before this phase + `PrivateMessage.jsx`).
- Brace-balance check on the edited CSS file: 415 open / 415 close.
- Isolated `react-dom/server` render (via an esbuild-bundled harness
  with a minimal in-memory `localStorage` stub, since this section is
  the first to read `guestApi.js`'s browser-storage-backed guest
  identity) with four representative data/prop shapes: no `slug`
  (confirms `return null`); `slug` present with English copy (confirms
  the name-gate frame renders with `dir="ltr"` and the real `chat.title`
  copy); `slug` present with Arabic (confirms `dir="rtl"` and
  translated copy); and a fully empty `data` object with no `slug`
  prop at all (confirms `return null`, not a broken frame). As with
  RSVP/Guestbook's own isolated-render notes, `useEffect` (and
  therefore `loadGuestThread`) never runs during server-side rendering,
  so the "thread already loaded" and "name already known" states were
  instead verified by hand against `ChatBlock`'s own already-shipped
  handling of the same `loadGuestThread`/`getGuestName` return shapes,
  and by tracing `PrivateMessage.jsx`'s own state transitions
  (`nameKnown` -> load thread -> render list/status -> compose form).

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to Private Message).
- Footer is still not started — unchanged from before this phase.

------------------------------------------------------------

## Phase 15 — Grand Finale Experience

Scope: built the Grand Finale section only, per the Phase 15 brief.
Opening Scene, Hero, Story, Quran Verse, Timeline, Gallery, Venue,
Countdown, RSVP, Guestbook, and Private Message were not touched —
confirmed by diffing the whole project against the pre-phase zip, file
by file: exactly three files changed — the new
`components/Finale.jsx`, `index.jsx` (one import, one render line, its
own header comment updated for this phase), and
`styles/GrandPremiere.css` (one new, additive block). No Builder field
was invented; no API, SQL, Supabase, Login, VisitorChat, or
other-template file was touched.

### Naming: "Grand Finale," not "Footer"

This log's own "Next Phase" line (going back to Phase 9A) had this
section pencilled in as "Footer." The Phase 15 brief handed to this
phase named it "Grand Finale Experience" instead and was explicit
about what it is not: not a footer, not a copyright block, not a
contact section — "the closing scene of the invitation." So this
phase built exactly that brief, under that name (`Finale.jsx`,
`.gp-finale`, `id="finale"`), rather than a conventional page footer.
Nothing about site navigation, copyright, or contact info was added,
since the brief explicitly ruled that out.

### Builder data

No new field or endpoint was created. The only real content this
section reads is `data.groom` / `data.bride` — the exact two fields
`config/builderFields.js`'s own `footer` map already reserved for this
section ("No dedicated field — reads the same couple-name fields Hero
does"), verified against `wizardData.js`'s `createInitialInvData()`
the same way every prior phase's fields were. No section toggle exists
for this content anywhere in the project (the same situation
`QuranVerse.jsx`/`Countdown.jsx` are already in) — it instead
self-gates purely on whether both names are empty, per this project's
own "Builder has none -> return null" rule. In practice this never
fires, since `StepNames.jsx` requires both names before a couple can
continue past step one, but the check is kept anyway for the same
defensive discipline every other section already follows.

### Copy

The closing thank-you and blessing lines are short, static,
presentational copy kept local to `Finale.jsx` itself (bilingual
ar/en, switched on `data.language` the same way every other section's
copy already is) rather than added to the shared `guestCopy()` module.
This is a deliberate departure from Phases 12–14's own pattern of
borrowing an existing map from `guestCopy()` — but in each of those
cases there was an existing, closely-matching entry to borrow (RSVP's
`sending`/`error` reused for Private Message's own gaps, per Phase
14's section above). A closing scene's thank-you/blessing content has
no existing match anywhere in `guestCopy()`, and every phase back to
RSVP has changed exactly three files each time — its own new
component, `index.jsx`, `styles/GrandPremiere.css` — never
`guestCopy.js`. Rather than break that discipline by adding a first-
ever new entry to a shared file this template has otherwise left
completely untouched, this phase kept the same "no cross-template
dependency introduced" posture `OpeningScene.jsx` (the template's other
fully self-contained, copy-owning section) already established, and
wrote its two lines directly in `Finale.jsx`.

### Design

Deliberately not another plate in the section list and not a
conventional footer (no copyright line, no contact block, no site
links, per the brief). A quiet closing title card: a slim hairline
above, an oversized `Playfair Display` thank-you line, one italic
`Georgia` blessing line beneath it, a small centered fleuron
(`&#10087;` — the traditional printer's mark for the close of a
chapter), and the couple's names set as a small tracked signature line
— reusing `PrivateMessage.jsx`'s own `.gp-message__signature`
small-caps/wide-tracking treatment rather than inventing a new
"cursive script" style for one section. No corner ornaments (Quran
Verse's), no wax seal (Private Message's), no card, no border box.
Padding is more generous than any section before it, top and bottom,
so the page visibly runs out of things to say rather than stopping
abruptly.

### Interaction / Animation

Very slow, soft fade only — GPU-friendly opacity + `translateY`, no
scale, no bounce, per the brief. One `useScrollReveal()` call on the
whole frame, reusing the shared `.gp-reveal`/`.gp-reveal--visible`
primitive, slowed to 2.2s via a `transition-duration`-only override on
top of the shared rule's existing `opacity`/`transform` declarations —
the same layering technique `.gp-message__frame.gp-reveal` already
used in Phase 14, so the shared rule itself, and every other section's
timing, stays untouched. The hairline, thank-you line, blessing line,
ornament, and signature do not each run their own
`IntersectionObserver` — this is four short, fixed lines always inside
one viewport together, unlike Guestbook/Private Message's tall,
variable-length lists (the reason those needed a `useScrollReveal()`
per entry, per Fix Pass 1's diagnosis) — so they instead breathe in
one after another via plain CSS `transition-delay` on each line, all
still gated by the single parent `.gp-reveal--visible` class. No
keyframes, no loops, no shimmer. `prefers-reduced-motion: reduce`
collapses every one of those delays/transforms to an immediate 0.25s
opacity fade, matching the pattern every other section's own reduced-
motion override already follows.

### Verification

- `npm install` + `npm run build`: clean, no new warnings (pre-existing
  chunk-size notice only, unrelated to this phase).
- `npx oxlint` on the whole `GrandPremiere/` folder: 0 warnings/0
  errors on all 17 files (16 before this phase + `Finale.jsx`).
- Brace-balance check on the edited CSS file: 434 open / 434 close.
- Isolated `react-dom/server` render (via a `vite build --ssr` harness
  importing `Finale.jsx` directly, no bundling hacks needed since this
  section has no browser-storage or effect dependency) with four
  representative data shapes: an empty `data` object (confirms `return
  null`); `groom`+`bride` with `language: 'en'` (confirms `dir="ltr"`
  and the English thank-you/blessing/signature copy); `groom`+`bride`
  with `language: 'ar'` (confirms `dir="rtl"` and the Arabic copy); and
  `groom` only, no `bride` (confirms the section still renders with
  just the one name, rather than an empty or broken signature line).
  All four matched expectations.

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to Grand Finale).
- `npm run build` / `oxlint` were run against the real dev toolchain
  this phase (network was available) — both clean, per "Verification"
  above.

------------------------------------------------------------

## Phase 16 — Director's Cut (Cinematic Master Pass)

Scope: a direction-only pass over the whole, already feature-complete
template, per the Phase 16 brief. No new section, no new Builder
field, no Builder/API/SQL/Supabase/Login/VisitorChat/other-template
file touched, no layout changed. Confirmed by diffing the whole
project against the pre-phase zip, file by file: exactly one file
changed — `styles/GrandPremiere.css` (three existing rules corrected
in place, one new block appended). `index.jsx` and every
`components/*.jsx` file, including `Gallery.jsx`, are byte-for-byte
unchanged from Phase 15.

### Continuity: closing the section-to-section seams

Read every section's own background gradient (or flat fill) top-to-
bottom, in render order, and compared each section's top color stop
against the previous section's bottom color stop. Eight of the eleven
boundaries already matched exactly — the project's own prior phases
had already hand-tuned most of this chain. Three did not:

- **Timeline → Gallery**: Timeline's own bottom stop is `var(--gp-ink)`;
  Gallery was a flat `var(--gp-ink-2)` fill, a visibly different
  (warmer) tone.
- **Gallery → Venue**: Venue's own top stop is `#0a0808`; Gallery's
  flat `var(--gp-ink-2)` fill didn't match that either.
- **Private Message → Grand Finale**: Message's own bottom stop is
  `#050405`; Finale opened on `var(--gp-ink-2)`, one shade too warm.

Fixed by turning Gallery's flat fill into a three-stop gradient whose
top and bottom stops now match Timeline's bottom and Venue's top
exactly (`var(--gp-ink)` → `var(--gp-ink-2)` → `#0a0808`), and by
changing Finale's own top stop from `var(--gp-ink-2)` to `#050405` to
match Message's bottom exactly. Both edits are in place, at each
section's own existing rule (Gallery's PHASE 9B block, Finale's PHASE
15 block) — not overridden again later in the file — so each
section's background still has exactly one source of truth. No other
boundary needed touching.

### Atmosphere: one shared breathing light

Every section since Story already carries its own static soft-gold
radial "atmosphere" layer, and Hero has its own analogous `.gp-hero__
glow` — together already this template's strongest piece of shared
visual language. This phase gave all of them (`.gp-hero__glow`,
`.gp-story__atmosphere`, `.gp-quran__atmosphere`,
`.gp-timeline__atmosphere`, `.gp-venue__atmosphere`,
`.gp-countdown__atmosphere`, `.gp-rsvp__atmosphere`,
`.gp-guestbook__atmosphere`, `.gp-message__atmosphere`,
`.gp-finale__atmosphere`) one shared, very slow (10s, ease-in-out,
looping) opacity breathe between 0.85 and 1 — small enough to be felt
rather than seen, matching the restraint every existing motion rule in
this file already keeps to. Opacity-only, GPU-composited, no layout
property touched, so it costs nothing on scroll and never shifts
anything beneath it. `prefers-reduced-motion: reduce` turns the
animation off entirely (added as its own new media-query block,
mirroring the pattern every other section's reduced-motion override
already follows) rather than collapsing it to a instant state, since
there is no discrete end-state for a loop to jump to.

Gallery was the one section with no atmosphere layer of its own —
Phase 9B's own brief was layout-only, so it never got one. Per this
phase's brief ("the gallery should feel like walking through an
exhibition"), it now gets the same quiet overhead glow every other
room in the invitation already has, added as `.gp-gallery::before`
(same radial shape/strength language as its Venue/Countdown/RSVP
neighbors) rather than a new JSX element or a Builder-bound prop, so
`Gallery.jsx` itself needed no change and Phase 9B's own "no hover
choreography yet" scope line still stands untouched. `.gp-gallery`
already had `position: relative`; `isolation: isolate` was added
alongside it purely so this new pseudo-element's stacking stays scoped
to the section, matching the containment every other section's outer
element already has.

### Depth: one persistent vignette

A single soft vignette — corners/edges very slightly dimmed, center
untouched — added as `.gp-root::after`, `position: fixed` rather than
scrolling with the page content, so it reads as one continuous lens
the whole film is watched through rather than something redrawn per
section. `position: fixed` on a descendant still resolves against the
viewport (not `.gp-root`'s own scroll container) as long as no
ancestor sets a `transform`, which none in this file does, so it stays
put through the full scroll. Given `z-index: 300` — above the
gallery lightbox's own `z-index: 200` — so it keeps framing the screen
even while a photo is open, at an opacity low enough (`0.38` at the
extreme corners, `0` through the center 62%) that it never competes
with the photo itself. `pointer-events: none` throughout, so it never
intercepts the lightbox, RSVP form, guestbook field, or any other
interactive element beneath it. No animation of its own — one
breathing layer per screen (the atmosphere glows, above) is enough,
per the brief's "guided, not simply stop" restraint applying equally
to restraint on how many things move at once.

### What was deliberately left alone

- The `stage` state machine, the ring-box → Hero transition itself
  (`.gp-flare`), and `HeroEntrance`/`HeroMusic`'s own timing in
  `index.jsx` — already reads as a single continuous camera move per
  Phase 4/5's own design, and the brief's "invisible transition" is
  already satisfied; touching the JS state machine risked exactly the
  "no unnecessary JavaScript" instruction this phase was given.
- Section internal layout, spacing, and copy — untouched everywhere,
  per "no redesign."
- Gallery's deferred hover/lightbox-transition polish (see "Known
  issues carried forward" below) — this phase added Gallery's missing
  *ambient* atmosphere layer (matching its neighbors) but did not
  start the separate, larger hover-choreography pass still deferred
  since Phase 9B; that remains future scope, not folded into this one.

### Verification

- `npm install` + `npm run build`: clean, no new warnings (pre-existing
  chunk-size notice only, unrelated to this phase).
- `npx oxlint` on the whole `GrandPremiere/` folder: 0 warnings/0
  errors on all 17 files — unchanged from Phase 15, since no `.jsx`/
  `.js` file in the folder was touched this phase.
- Brace-balance check on the edited CSS file: 442 open / 442 close.
- Diffed the entire project directory against the pre-phase zip,
  file by file: exactly one file differs,
  `styles/GrandPremiere.css`.

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B; this phase added Gallery's ambient
  atmosphere layer, matching its neighbors, but did not start that
  separate, larger pass).
- `npm run build` / `oxlint` were run against the real dev toolchain
  this phase (network was available) — both clean, per "Verification"
  above.

------------------------------------------------------------

## Fix Pass 2

Scope: fixed the Timeline rendering bug only, per the Fix Pass 2
brief. `index.jsx` and `styles/GrandPremiere.css` were inspected but
did not need changes — confirmed by diffing the whole project against
the pre-pass zip, file by file: exactly one file changed,
`components/Timeline.jsx` (one line). No Builder field, section
toggle, layout, typography, or cinematic styling was touched.

### Issue — Timeline reveal formula (found and fixed)

Root cause: each stop's fade/rise reveal is driven by a `local` value
computed from `progress` (the section's own 0→1 scroll progress, from
`useScrollProgress`) and that stop's `threshold` (`index / count`).
The file's own comment on `REVEAL_WINDOW` describes the intended
behavior precisely: "how much scroll-progress runway a stop takes to
fully reveal **once the path reaches it**" — i.e. the reveal window
should begin at `progress === threshold` and finish at
`threshold + REVEAL_WINDOW`. The formula instead read:

```js
const local = Math.min(1, Math.max(0, (progress - threshold + REVEAL_WINDOW) / REVEAL_WINDOW));
```

The extra `+ REVEAL_WINDOW` shifts the whole window a full
`REVEAL_WINDOW` earlier, so a stop finishes revealing (`local === 1`)
*at* its own threshold instead of starting there. For the first stop
(`threshold = 0`), the resulting window is `[-REVEAL_WINDOW, 0]` —
entirely outside the reachable `progress` range of `[0, 1]` — so
`local` was pinned at `1` unconditionally from the very first render.
The first event never animates in at all; it is simply always
"revealed," which is what the brief's "the first event is broken"
symptom was describing. Every other stop revealed a full
`REVEAL_WINDOW` earlier than the horizontal pan (driven by the same
`progress` value) actually brought it into view, so they visibly
displayed out of sync with the scroll — "the remaining events do not
display correctly."

Builder data mapping, field names (`time`/`title`/`description`,
verified against `config/builderFields.js` and
`StepLocation.jsx`'s `addTimeline()`), the render loop, the
`if (!items.length) return null` guard, and the CSS (verified nothing
hides `.gp-timeline` or its children) were all checked independently
and are correct — the bug was isolated to this one JS formula.

Fix: removed the erroneous `+ REVEAL_WINDOW` term so a stop's reveal
window now starts at its own `threshold` and finishes at
`threshold + REVEAL_WINDOW`, matching the comment's own stated intent
and keeping every stop's fade-in synchronized with the same `progress`
value that drives the horizontal pan and the path-fill draw-in.

### Verification

- `npm install` + `npm run build`: clean, no new warnings (pre-existing
  chunk-size notice only, unrelated to this fix).
- `npx oxlint` on the changed file: 0 warnings/0 errors.
- Diffed the entire project directory against the pre-pass zip, file
  by file: exactly one file differs, `components/Timeline.jsx`.

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to this pass).

------------------------------------------------------------

## Fix Pass 3

Scope: fixed the actual root cause of the still-broken Timeline
(reported after Fix Pass 2 with screenshots: markers visible on the
path, but no date/title/description text ever appears, and a lot of
dead-feeling empty scroll space). Exactly one file changed —
`hooks/useScrollProgress.js`. `Timeline.jsx`'s own reveal formula
(fixed in Fix Pass 2) was correct and did not need further changes;
the real defect was one level lower, in the primitive it depends on.

### Issue — progress was frozen at its initial mount-time value

Root cause: `useScrollProgress.js` computed `progress` once on mount,
then re-measured it on every `scroll` event — but that listener was
attached to `window`:

```js
window.addEventListener('scroll', requestMeasure, { passive: true });
```

This app's shell (`#app` in `App.jsx`) is `fixed inset-0; overflow:
hidden`, so the document/`window` itself never scrolls. `.gp-root`
(this template's own top-level element) is what actually scrolls —
it declares `overflow-y: auto` for exactly this reason, per its own
header comment at the top of `styles/GrandPremiere.css`. Because
`window` never fires a `scroll` event in this app, `progress` never
updated past whatever `measure()` computed at mount time — which
happens immediately when the template mounts, long before the guest
has scrolled anywhere near the Timeline section, so it was frozen at
(or very near) `0` for the entire guest session. Every stop's `local`
reveal value is derived from this same frozen `progress`, so no
plaque ever revealed; the path-fill and the horizontal pan
(`--gp-progress`, also driven by this value) never animated either —
which is what read as "a lot of empty space," since scrolling through
the section's large "stage" height produced no visible change at all.

This also explains why every *other* section reveals correctly and
only Timeline was affected: every other section's reveal uses the
sibling `useScrollReveal.js` hook, which is built on
`IntersectionObserver` — an API that detects intersection against the
real layout viewport regardless of which DOM element owns the
scrollbar, so it was never affected by this app's fixed-shell/internal-
scroll-container architecture. `useScrollProgress.js` was the only
place in this template with a hand-rolled `scroll` listener, and it
was listening on the wrong element.

Fix: added a small `findScrollParent()` helper that walks up from the
observed node to find the nearest ancestor that actually scrolls
(`overflow-y: auto`/`scroll` with `scrollHeight > clientHeight` —
`.gp-root` in practice), and listens for `scroll` there instead of on
`window`. `resize` stays on `window` (a viewport-size change is still
a `window`-level event regardless of which element scrolls).
`measure()`'s own `getBoundingClientRect()` logic needed no change —
it already returns coordinates relative to the layout viewport
regardless of which ancestor owns the scrollbar; only *which element
the listener was attached to* was wrong.

### Verification

- `npm install` + `npm run build`: clean, no new warnings (pre-existing
  chunk-size notice only, unrelated to this fix).
- `npx oxlint` on the changed file: 0 warnings/0 errors.
- Diffed the entire project directory against the pre-pass zip, file
  by file: exactly one file differs, `hooks/useScrollProgress.js`.

### Known issues carried forward

- Gallery still has no hover choreography/lightbox-transition polish
  (deferred past Phase 9B, unrelated to this pass).
