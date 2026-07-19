# LUMORA – Eternal Voyage

## Current Status
- Eternal Voyage is fully integrated.
- Registered in TemplateRegistry.
- Connected in TemplateDispatcher.
- Template appears inside the Builder.
- Template opens successfully.
- Builder bindings are working.
- Existing project remains stable.
- Builder, Login, VisitorChat, SQL, Supabase and APIs remain untouched.
- 2026-07-15: page-scroll, music-autoplay-parity, and cinematic-
  visibility regressions found and fixed — see "Bug Fix — critical
  regressions" below for root causes.
- 2026-07-15: FINAL BUG FIX PASS — Hero cropping and four missing
  Builder image bindings (Groom Photo, Bride Photo, Engagement Photos,
  Outings & Trips) fixed — see "Bug Fix — final content pass (Hero
  crop + Builder image bindings)" below for root causes and the full
  Builder image-field verification table.
- 2026-07-15: PHASE 9A — Grand Premiere's Gallery component built
  (structure/Builder wiring only, no CSS, no animation polish) — see
  "Phase 9A — Gallery Component (structure only)" below. This entry
  is about the Grand Premiere template specifically, not Eternal
  Voyage (whose own Gallery was already completed in an earlier
  pass, see "Completed" above).
- 2026-07-15: PHASE 9B — Grand Premiere's Gallery Layout implemented
  (CSS only: responsive layout, luxury spacing, museum framing — no
  animation, no visual-polish pass, no logic changes) — see "Phase 9B
  — Gallery Layout (CSS only)" below.

------------------------------------------------------------

## Release Candidate

**Version:** Eternal Voyage v1.0

**Status:** Production Ready

**Completed Features**
- Hero — cinematic Ken Burns opener, premium typography, gold glow
  names, glass CTA, scroll indicator
- Story (love letters) — editorial glass cards, decorative quotation
  styling, staggered reveal
- Prayer / blessing — quiet glass card, gated on real content
- Timeline — alternating gold-spine journey with floating glass cards
- Venue — cinematic header + premium glass card, luxury-framed map
  link
- Menu — categorized glass cards with images
- Gallery — dense luxury masonry restyling the shared `GalleryBlock`
- Countdown — glass digit cards on a cinematic centerpiece glow
- Music Experience — floating glass "now playing" controller
- RSVP / Guestbook / Private Message — luxury communication suite on
  the shared `RSVPBlock` / `CommentsBlock` / `ChatBlock`
- Footer — quiet closing glass card with couple signature
- End-to-end final polish pass: consistent scroll-reveal timing on
  every section header, one shared pulsing gold-divider component
  (was 4 near-duplicate definitions), matched hover-lift distances
  and border-radius across the primary glass cards, full
  `prefers-reduced-motion` coverage on every animated element,
  reduced duplicated CSS

**Known Limitations**
- Prayer and Menu did not receive their own dedicated "premium
  cinematic pass" write-up the way the other 11 sections did (they
  were styled early and are visually consistent with the template,
  but weren't part of this final review's explicit section list).
- The Venue section's "map" is a luxury-framed link to the Builder's
  `mapUrl` (matching how it has always worked in this template) —
  there is no embedded map iframe, since none existed before this
  pass and adding one was out of scope.
- No dedicated automated visual-regression or cross-browser test pass
  has been run; this review was a manual code-level design/consistency
  audit.

**Future Improvements (optional)**
- Consider giving Prayer and Menu the same explicit "premium pass"
  documentation/treatment as the other sections for full parity.
- Consider adding a light entrance-reveal to Menu's category groups
  (currently static) to match the fade-up rhythm used elsewhere.
- Consider a shared `--ev-card-radius` / `--ev-card-shadow` custom
  property if more card-style sections are added later, so scale
  stays consistent by construction rather than by convention.

------------------------------------------------------------

## Completed
✅ Eternal Voyage integrated.
✅ Hero implemented.
✅ Hero premium visual polish completed.
Includes:
- Cinematic Ken Burns background
- Premium typography
- Gold glow behind names
- Cinematic overlay
- Luxury glass CTA
- Elegant scroll indicator
- Responsive improvements
✅ Story implemented.
✅ Story premium cinematic/editorial redesign completed.
Includes:
- Large elegant heading with decorative gold divider
- Luxury glass card (blur, gradient border, floating hover lift)
- Soft ambient background glow
- Elegant decorative quotation styling
- Comfortable reading width for single-letter content
- Staggered smooth fade-up reveal per card
- Fully responsive
✅ Prayer implemented.
✅ Timeline implemented.
✅ Timeline cinematic vertical-journey redesign completed.
Includes:
- Thin gold center spine with floating glass cards
- Alternating left/right layout on desktop, single column on mobile
- Elegant glowing timeline nodes with connecting stub lines
- Beautiful pill-styled date/time badges
- Staggered smooth fade-up reveal per event
- Soft gradient glow bridging the Story → Timeline transition
- Fully responsive
✅ Venue implemented.
✅ Venue premium cinematic luxury redesign completed.
Includes:
- Two-part layout: a centered section header (eyebrow, large Playfair
  Display heading, romantic subtitle, pulsing gold divider) above a
  large premium glass venue card
- Venue card: glass blur, gradient border, gold accent, layered
  shadow, generous centered padding, gentle hover lift
- Very large Playfair Display venue name, muted-gold elegant address
  line, optional italic note
- The existing Builder-provided map link is kept completely
  unchanged and elevated into a luxury glass "map frame" (rounded
  corners, glass border, soft contained gold glow, elegant shadow,
  gold pin) restyled into a gold glass pill button — no map
  embed/iframe/API was added, since none existed in this template
  before
- Cinematic gradient background with soft seam-glows bridging
  Gallery → Venue → Menu into one continuous space
- Header and card fade up on scroll via the shared `useScrollReveal`
  hook, staggered slightly; divider pulse reuses the existing
  `ev-countdown-pulse` keyframe (no duplicate animation)
- Fully responsive; renders nothing when there's no venue data at all
✅ Menu implemented.
✅ Footer implemented.
✅ Gallery wrapper uses GalleryBlock.
✅ Gallery luxury cinematic redesign completed.
Includes:
- Restyled section heading (kicker, title, divider) to match the
  template's serif/gold language, via CSS overrides only
- Responsive premium masonry layout (dense grid, mixed hero/
  supporting photo sizes) at mobile, tablet, and desktop
- Luxury glass frames: soft shadow, subtle border, rounded corners,
  glass sheen on hover
- Subtle hover experience: soft brightness lift, deeper shadow, gold
  accent ring — layered on top of, not replacing, the existing
  Framer Motion entrance reveal and hover zoom
- Soft gradient glow bridging the Timeline → Gallery transition
- Existing lightbox, lazy loading, and GalleryBlock logic untouched
✅ Countdown wrapper uses CountdownBlock.
✅ Countdown luxury cinematic redesign completed.
Includes:
- Large centered centerpiece layout with luxury heading, romantic
  subtitle, and decorative gold divider (new presentational markup
  in Countdown.jsx, same pattern as Timeline's hardcoded heading)
- Premium glass cards for each digit: soft blur, gold border, layered
  shadow, floating lift on hover
- Cinematic dark background with a soft radial gold glow centerpiece
  and seam-glows blending Gallery → Countdown → RSVP
- Subtle pulse on the divider's gold accent, plus fade-up reveal on
  the header and card row via the shared `useScrollReveal` hook
- Existing `useCountdown` hook, digit-flip animation, and
  CountdownBlock logic completely untouched
✅ RSVP wrapper uses RSVPBlock.
✅ Guestbook wrapper uses CommentsBlock.
✅ PrivateMessage wrapper uses ChatBlock.
✅ RSVP / Guestbook / Private Message luxury communication suite
   completed.
Includes:
- Elegant/editorial headings via restyled existing SectionHeading
  (kicker + title + divider) in each block, plus a short romantic
  intro line and gold divider above each card
- Premium centered luxury glass containers (blur, gradient border,
  layered shadow) restyling the existing GuestCard from the outside
- Cinematic dark backgrounds with soft seam-glows bridging
  Countdown → RSVP → Guestbook → Private Message into one
  continuous space
- Fade-up reveal on header and card via the shared `useScrollReveal`
  hook, staggered slightly
- Existing RSVPBlock, CommentsBlock, and ChatBlock logic/API
  bindings completely untouched
✅ Music Experience wrapper uses MusicPlayer.
✅ Music luxury floating controller redesign completed.
Includes:
- Elegant floating glass panel (soft blur, gold border, luxury
  shadow, contained radial gold glow) replacing the plain circular
  button, gated on the Builder's own `sections.music` toggle
- "Now Playing" label built from the Builder's own `audioName` field
  (falls back to "♪ Wedding Soundtrack" when none is set — no
  invented metadata)
- Subtle CSS-only equalizer bars driven entirely by MusicPlayer's own
  existing `animate-pulse` class (already only present while playing)
- Soft entrance (fade + translateY + tiny scale) and gentle breathing
  glow, both CSS-only and `prefers-reduced-motion`-aware
- Fully responsive (desktop/tablet/mobile), renders nothing when the
  Builder has no `audioUrl`
- Existing `MusicPlayer` audio element, play/pause logic, trim-window
  handling, and autoplay behavior completely untouched — no new
  player, no new music API, no Builder bindings changed

------------------------------------------------------------

## Pending
Nothing outstanding — see "Release Candidate" below.

------------------------------------------------------------

## Project Rules
Never modify:
- Builder
- Builder logic
- Login
- VisitorChat
- SQL
- Supabase
- Existing APIs
- Existing templates

Only work inside:
src/components/guest/EternalVoyage/
unless explicitly requested.

Never duplicate logic.
Reuse existing project components.

Never create:
- new Countdown logic
- new Gallery logic
- new Lightbox
- duplicate APIs

------------------------------------------------------------

## Architecture Notes
The template is already integrated.

Registered in:
- TemplateRegistry
- TemplateDispatcher

Uses existing shared components:
- GalleryBlock
- CountdownBlock
- RSVPBlock
- CommentsBlock
- ChatBlock
- MusicPlayer

Only style or wrap these components.
Never replace them.

------------------------------------------------------------

## Development Strategy
Always read CLAUDE_HANDOFF.md first.
Never analyze the entire project unless explicitly requested.
Work on one visual feature at a time.
Update this file after every completed task.

------------------------------------------------------------

## Next Task
None — Eternal Voyage v1.0 is release-candidate complete (see
"Release Candidate" above). Future work should start from the
"Future Improvements" list there, or from new, explicitly-requested
scope.

------------------------------------------------------------

## Bug Fix — final content pass (Hero crop + Builder image bindings) (2026-07-15, 5)

Scope: `src/components/guest/EternalVoyage/` only (`EternalVoyage.jsx`,
`EternalVoyage.css`, `sections/Hero.jsx`, `sections/Gallery.jsx`), plus
this file. `lib/wizardData.js`, `lib/coverDefaults.js`,
`components/dashboard/create/steps/StepPhotos.jsx`,
`components/dashboard/create/steps/StepDesign.jsx`, and
`components/guest/GuestPageLayout.jsx` (+ `shared/EngagementBlock.jsx`,
`shared/GalleryBlock.jsx`) were **read** to find the real Builder field
names and the pattern every other template already uses for them, but
**not modified**. No redesign, no new features, no Builder/API/logic
changes — Builder, Login, VisitorChat, SQL, Supabase,
TemplateDispatcher, and TemplateRegistry remain untouched.

### Bug #1 — Hero image cropped incorrectly

**Root cause:** the hero photo was rendered as a CSS `background-image`
on a plain `<div>`, with `background-position: center; background-size:
cover;`. A flat center crop on a *background* box means the visible
crop window changes with the box's own aspect ratio — a wide desktop
viewport keeps much more of the photo's height in frame than a tall
mobile viewport does, so the same couple photo could show full
composition on desktop while cropping straight through the couple's
faces on a phone. There was no `object-fit`/`object-position` anywhere,
because those properties don't apply to CSS backgrounds — only to real
replaced elements like `<img>`.

**Fix:** `sections/Hero.jsx` now renders a real `<img className="ev-hero__bg">`
(instead of a background-image div). `EternalVoyage.css`'s `.ev-hero__bg`
now uses `object-fit: cover` (never stretches — always preserves the
photo's own aspect ratio, only crops) and `object-position: center 30%`,
tuned toward the upper-third where couple portraits are typically
framed, matching the existing vignette's own `50% 38%` focal point. A
`@media (max-width: 560px)` override pushes that further to
`center 18%`, since a tall/narrow viewport crops far more aggressively
than a wide one — so the couple's composition now stays in frame on
both desktop and mobile instead of only one. The Ken Burns zoom
(`transform: scale(...)`, `@keyframes ev-hero-kenburns`) was untouched —
it already worked identically on an `<img>` as it did on a `<div>`.

### Bug #2 / #3 — Groom Photo, Bride Photo, Engagement Photos, Outings & Trips never appear

**Root cause:** both `sections/Hero.jsx` (for the hero background) and
`sections/Gallery.jsx` (for the photo grid) guessed at field names that
don't exist anywhere in the real Builder data shape (`lib/wizardData.js`)
— `heroImage`, `hero.image`, `coverImage`, `mainPhoto`, `photos.hero`,
a top-level `photos`/`gallery` array, etc. Since none of those fields
are ever written by the Builder, Hero's background image and (for
`data.photos`/`data.gallery`) part of Gallery's photo resolution could
never have real data behind them. Separately, Engagement Photos and
Outings & Trips had **no rendering path at all** anywhere in
`EternalVoyage/` — `Gallery.jsx` only ever read `photoGroom`/
`photoBride`, so even though the Builder's Photos step (`StepPhotos.jsx`)
writes `engagementPhotos` and `outingPhotos` correctly, and every other
template already displays them (`GuestPageLayout.jsx`, via the shared
`EngagementBlock` and a second `GalleryBlock`), Eternal Voyage had no
component reading either field — a real bug, not a design gap.

**Fix:**
- `sections/Hero.jsx` now resolves the hero image via the same
  `resolveCoverPhoto(data)` helper (`lib/coverDefaults.js`) every other
  template's Hero/Gate already uses, reading the one real field,
  `data.coverPhoto` (written by the Design step's cover-photo picker).
- `sections/Gallery.jsx` now reads the four real Builder fields directly
  — `data.photoGroom`, `data.photoBride`, `data.engagementPhotos`,
  `data.outingPhotos` — and renders all three photo groups using the
  exact shared components every other template already uses for them
  (`GalleryBlock` for the wedding + outings grids, `EngagementBlock` for
  the engagement story + photos), inside the template's existing
  `.ev-gallery` luxury-masonry wrapper. No new gallery/lightbox UI was
  built. Each group is gated on its own Builder "Show / Hide Sections"
  toggle (`sections.gallery`, `sections.engagement`, `sections.outings`
  — the same keys `data.sections` already carries for every other
  template) and independently renders nothing when it has no real
  content, so nothing shows an empty placeholder when data doesn't
  exist, and nothing is silently skipped when it does.
- `EternalVoyage.jsx`: `<Gallery>` is no longer gated behind the single
  `sections.gallery` toggle at the call site (that would have hidden
  Engagement/Outings whenever only the Gallery toggle was off) — it now
  renders unconditionally and gates itself internally per photo group,
  the same pattern already used for Prayer/Countdown/Footer.

### Builder image-field verification (every image field Eternal Voyage reads)

| Builder field (real, from `lib/wizardData.js`) | Read by | Renders via | Behavior when empty |
|---|---|---|---|
| `data.coverPhoto` (+ template-default fallback via `resolveCoverPhoto()`) | `sections/Hero.jsx` | real `<img>`, `object-fit: cover` | no `<img>` rendered, hero still shows (color background only) |
| `data.photoGroom` | `sections/Gallery.jsx` (`resolveWeddingPhotos`) | shared `GalleryBlock` (wedding photo grid) | that photo simply omitted from the grid |
| `data.photoBride` | `sections/Gallery.jsx` (`resolveWeddingPhotos`) | shared `GalleryBlock` (wedding photo grid) | that photo simply omitted from the grid |
| `data.engagementPhotos` (+ `engagementStory`/`engagementDate`/`engagementDecor`) | `sections/Gallery.jsx` | shared `EngagementBlock` | whole block renders nothing (`hasContent` false) |
| `data.outingPhotos` | `sections/Gallery.jsx` | shared `GalleryBlock` (outings photo grid) | whole block renders nothing (empty array) |

All five confirmed working end-to-end (build + lint pass, see
"Verification performed" pattern below) — each renders when its
Builder field has data, and renders nothing (no broken image, no empty
card) when it doesn't.

------------------------------------------------------------

## Bug Fix — critical regressions (2026-07-15, 4)

Scope: `src/components/guest/EternalVoyage/` only (`EternalVoyage.jsx`,
`EternalVoyage.css`, `sections/Hero.jsx`, `sections/Music.jsx`), plus
this file. `src/index.css`, `src/App.jsx`, and
`src/components/guest/shared/MusicPlayer.jsx` were **read** to find
the root causes (their own comments explain the mechanisms these bugs
depend on) but **not modified** — every fix lives inside this
template's own folder. No redesign, no new features, no Builder/API/
logic changes.

### Bug #1 — page does not scroll

**Root cause:** the app shell is a fixed, non-scrolling surface by
design — `#app` in `App.jsx` is `fixed inset-0 overflow-hidden`, and
the global `html, body` (`src/index.css`) are `height: 100%;
overflow: hidden`. Every guest-facing page is expected to open its
*own* scroll region on top of that fixed shell. The shared
`GuestPageLayout` does this via a wrapper div —
`relative h-screen w-full overflow-y-auto overflow-x-hidden` — which
every other template gets automatically. Eternal Voyage was built as
"a brand-new, fully isolated template" that intentionally does not
render through `GuestPageLayout` (this was already documented at the
top of `EternalVoyage.jsx`) — but nobody gave its own root element
(`.ev-root`) the equivalent scroll-container treatment. With no
scrollable ancestor anywhere in the tree, the entire invitation was
silently clipped to a single viewport and could never scroll, no
matter how tall its content was.

**Fix:** `.ev-root` in `EternalVoyage.css` now carries
`height: 100vh` (with a `100svh` fallback), `overflow-y: auto`,
`overflow-x: hidden`, and `position: relative` — the same scroll-
container pattern `GuestPageLayout` already uses, scoped locally to
this template. Pure CSS, no JS, no layout/markup changes.

### Bug #2 — music autoplay regression

**Root cause:** `shared/MusicPlayer.jsx`'s own doc comment explains
the actual contract: browsers only allow audio-with-sound to start as
the *direct, synchronous* result of a user gesture, so its exposed
imperative `play()` must be called from inside the same click handler
that opens the invitation — not after a timeout or an async effect.
Every other template fulfills this via `Gate.jsx`: `GuestPageLayout`
holds a `musicRef`, passes `ref={musicRef}` to `MusicPlayer`, and
`Gate`'s `onOpenClick={() => musicRef.current?.play()}` fires
synchronously inside the gate-opening click. Eternal Voyage has no
Gate at all, and `Music.jsx` never accepted or forwarded a `ref` to
`MusicPlayer`, so nothing anywhere ever called `play()` from a user
gesture — the floating music button still worked for a manual click
(its own `toggle()` is a direct click handler), but there was no
"opening" moment that started the soundtrack the way there is
everywhere else in the app.

**Fix:** `Music.jsx` now forwards a `ref` straight through to
`MusicPlayer` (`React.forwardRef`, no logic added). `EternalVoyage.jsx`
holds a `musicRef` and passes it to `Music`, plus an `onBeginJourney`
callback to `Hero`. `Hero.jsx`'s existing "Begin Our Journey" button
and scroll-indicator button — Eternal Voyage's closest equivalent to
"opening the gate" — now call `onBeginJourney()` (which calls
`musicRef.current?.play()`) synchronously in the same click handler,
immediately before the existing `scrollToStory()` call. This mirrors
`Gate.jsx`'s pattern exactly: sound only ever starts as the direct
result of a real click, nothing is forced, no autoplay restriction is
bypassed, no Builder binding or `MusicPlayer` logic was touched.

### Bug #3 — cinematic effects not visible

**Root cause:** this was a downstream symptom of Bug #1, not a
separate design defect. Every effect on the "missing" list — Hero's
Ken Burns pan, its glow-breathe, the shared `.ev-reveal`/
`useScrollReveal` fade-ups, the seam gradients between sections, the
hover-lift transitions on the feature cards — was already present and
correctly wired in the CSS/JS (verified keyframe-by-keyframe and
selector-by-selector). But with the page clipped to a single viewport
and unable to scroll, every section after Hero was simply
unreachable: guests could never scroll an element into view, so its
`IntersectionObserver`-driven reveal could never fire, and the seam
gradients / hover states living in those sections were never seen
either. Hero's own above-the-fold effects (Ken Burns, glow) were
already rendering correctly the whole time — they just made the
missing scroll below them look like a broader "cinematic presentation
is missing" problem.

**Fix:** none needed beyond Bug #1 — restoring `.ev-root`'s scroll
container makes every section reachable again, and every effect that
was already correctly implemented is visible again as a direct
consequence. No animation code, timing, or design was changed.

### Verification performed
- `npm run build` succeeds cleanly before and after these changes (no
  new warnings/errors introduced).
- Confirmed no other `overflow: hidden` / `position: fixed` /
  scroll-locking pattern exists anywhere else in
  `src/components/guest/EternalVoyage/` (audited every section's CSS
  and every `.jsx` file line by line) — Bug #1's cause was singular
  and has been fully addressed.
- Confirmed `MusicPlayer`'s own `<audio>` element, trim-window math,
  and manual play/pause `toggle()` are byte-for-byte unchanged.
- Confirmed every keyframe declared in `EternalVoyage.css`
  (`ev-hero-kenburns`, `ev-hero-glow-breathe`, `ev-hero-fade`,
  `ev-hero-rise`, `ev-hero-scroll-dot`, `ev-countdown-pulse`,
  `ev-music-eq`, `ev-music-in`, `ev-music-breathe`) is actually
  referenced by an `animation:` rule with no typos/mismatches, and
  every one has `prefers-reduced-motion` coverage.

**Not touched:** Builder, Builder logic, Login, VisitorChat, SQL,
Supabase, APIs, TemplateRegistry, TemplateDispatcher, any other
existing template, and every shared component's own source
(`MusicPlayer`, `GalleryBlock`, `CountdownBlock`, `RSVPBlock`,
`CommentsBlock`, `ChatBlock`, `Reveal`, `GuestPageLayout`, `Gate`) —
all were read for context where noted above, none were modified.

------------------------------------------------------------

## Changelog

### 2026-07-15 (7) — Bug fix: Hero image cropping + Groom/Bride/Engagement/Outings Builder image bindings
Scope: `src/components/guest/EternalVoyage/` only (`EternalVoyage.jsx`,
`EternalVoyage.css`, `sections/Hero.jsx`, `sections/Gallery.jsx`).

Full root-cause writeup and the Builder image-field verification table
are in "Bug Fix — final content pass (Hero crop + Builder image
bindings)" above. Summary:
- **Hero cropping**: hero photo switched from a CSS `background-image`
  div to a real `<img>` with `object-fit: cover` + tuned
  `object-position` (desktop and mobile), so the couple's composition
  stays in frame on every viewport instead of being cropped
  differently depending on screen shape. Never stretches.
- **Groom Photo / Bride Photo / Engagement Photos / Outings & Trips**:
  `Gallery.jsx` was only ever reading `photoGroom`/`photoBride` (plus
  two speculative field names that don't exist), so Engagement Photos
  and Outings & Trips had no rendering path in this template at all.
  Now reads the real fields — `photoGroom`, `photoBride`,
  `engagementPhotos`, `outingPhotos` — and renders all three groups
  through the same shared `GalleryBlock`/`EngagementBlock` components
  every other template already uses, each gated on its own real
  Builder toggle (`sections.gallery`/`engagement`/`outings`).
- Hero's background-image field resolution also switched from nine
  guessed field names to the one real field, `data.coverPhoto`, via the
  same `resolveCoverPhoto()` helper every other template's Hero/Gate
  already uses.

### 2026-07-15 (6) — Bug fix: Quran Verse, Love Letters, Invitation Message not showing
Scope: `src/components/guest/EternalVoyage/sections/Prayer.jsx`,
`Story.jsx`, `Hero.jsx`, `EternalVoyage.css` only.

Same class of bug as the Venue fix above — content typed into the
Builder simply wasn't read from the field names the Builder actually
saves it under.

- **Quran Verse** (`data.quranVerse`, StepNames.jsx): `Prayer.jsx` was
  only checking `data.prayer`/`data.blessing`, a shape that has never
  existed. Now checks `data.quranVerse` first.
- **Love Letters** (`data.letterGroom` / `data.letterBride`,
  StepNames.jsx): `Story.jsx` was only checking a nested `data.letters`
  shape that has never existed. Now checks `letterGroom`/`letterBride`
  first — the same two fields the shared `LettersBlock.jsx` reads for
  every other template — before falling back to the old `data.letters`
  shape and then to the separate "Our Story" field (`data.story`).
- **Invitation Message** (`data.invitationMessage`, StepNames.jsx): had
  no home anywhere in Eternal Voyage at all. Every other template
  shows it right under the couple's names (inside the shared `Hero`
  component). Added the same content, in the same position, to
  Eternal Voyage's own `Hero.jsx` — a quiet italic line between the
  date and the template's fixed decorative subtitle, using the
  existing `ev-hero-fade` keyframe (no new animation), with
  `prefers-reduced-motion` coverage added alongside Hero's other
  elements. This is new markup inside an *existing* section, not a
  new section.

**Still not shown anywhere in Eternal Voyage** (flagged, not fixed —
see message to the user): **How We Met** (`data.howWeMet`), **Life
Story / bios** (`data.bioGroom`, `data.bioBride`), and **Engagement /
Engagement Story** (`data.engagementDate`, `data.engagementStory`,
`data.engagementPhotos`, `data.engagementDecor`). Eternal Voyage has
no section for any of these. Engagement has a reusable shared
`EngagementBlock.jsx` (same component every other template wraps in
`GuestPageLayout.jsx`) that could be wrapped the same way
Gallery/Countdown/RSVP already are here — low risk. How We Met and
Life Story have **no shared component anywhere in the app** (verified
zero usage outside the Builder step itself) — building these would
mean designing brand-new sections from scratch, which is out of scope
for a bug-fix pass and needs an explicit go-ahead.

**Not touched:** `LettersBlock.jsx`, `EngagementBlock.jsx`, shared
`Hero.jsx`, Builder, Builder logic, APIs, any other template.

### 2026-07-15 (5) — Bug fix: Venue address/map not showing despite Builder data
Scope: `src/components/guest/EternalVoyage/sections/Venue.jsx` only.

**Root cause:** `resolveVenue()` was reading a nested
`data.venue`/`data.location` object with keys like `address` and
`mapUrl` — a shape that has never actually existed. `StepLocation.jsx`
(the real Builder step) saves flat top-level fields:
`data.venueName`, `data.mapsLink`, `data.locationDescription`,
`data.parkingInfo` — the exact same fields the shared
`LocationBlock.jsx` already reads for every other template. Venue
name rendered fine only because `data?.venueName` happened to already
be one of its fallbacks; address and the map button silently stayed
empty for every invitation, no matter what the couple filled in,
because `data.mapUrl` was never the right key (`data.mapsLink` is) and
`data.locationDescription` was never checked at all.

**Fix:** `resolveVenue()` now also falls back to `data?.locationDescription`
for the address line, `data?.parkingInfo` for the note, and
`data?.mapsLink` for the map button — matching `LocationBlock.jsx`'s
field contract exactly. The old nested-object fallbacks were left in
place (harmless, in case any older invitation really does have that
shape) rather than removed. No markup, styling, or component structure
changed — this was a pure data-mapping fix.

**Not touched:** `LocationBlock.jsx`, `StepLocation.jsx`, Builder,
Builder logic, APIs, any other template.

### 2026-07-15 (4) — Bug fix: scroll, music autoplay parity, cinematic visibility
See "Bug Fix — critical regressions" above for full root-cause and fix
detail. Summary: `.ev-root` now opens its own scroll container
(Bug #1); `Music.jsx`/`Hero.jsx`/`EternalVoyage.jsx` now wire a
synchronous `play()` off Hero's opening click, matching `Gate.jsx`'s
pattern used by every other template (Bug #2); Bug #3 required no
independent fix — it was a visibility symptom of Bug #1, and every
cinematic effect was confirmed already correctly implemented.

### 2026-07-15 (3) — Release polish verification pass
Scope: `src/components/guest/EternalVoyage/EternalVoyage.css` only
(one property), plus this file. Re-read the whole template end to end
against the "Final Luxury Polish" changelog entry below and verified
each consistency claim in the actual CSS/JSX rather than trusting the
prose.

- Found one real gap: `.ev-venue__card:hover` was still using
  `translateY(-4px)`, even though the previous pass's changelog said
  the four primary floating glass cards (Story, Timeline, Countdown
  digits, Venue) had all been standardized to `-5px`. Fixed — Venue
  now matches the other three.
- Verified (no change needed): shared divider block (one definition
  for Story/Timeline/Countdown/Venue, reusing `ev-countdown-pulse`),
  `1.5rem` border-radius parity across Story/Venue/RSVP-suite primary
  cards, full `prefers-reduced-motion` coverage (10 media blocks, one
  per animated group), and the `useScrollReveal` wiring on both
  Story's and Timeline's headers.
- Menu and Prayer were spot-checked again for visual seam consistency
  with their neighbors (Gallery→Venue→Menu, Story→Prayer→Timeline
  backgrounds) — no issues found, still outside this pass's explicit
  section list per "Known Limitations" below.
- No functionality, logic, Builder, API, or shared-component changes.

### 2026-07-15 (2) — Final Luxury Polish (release candidate)
Scope: `src/components/guest/EternalVoyage/` only (Story.jsx,
Timeline.jsx, EternalVoyage.css, CLAUDE_HANDOFF.md). No new
components, sections, wrappers, or APIs; no Builder/functionality/
logic changes anywhere. Acted as a consistency/QA pass across the
already-completed premium redesign, not a redesign itself.

**Consistency fixes**
- Story's and Timeline's section headers now fade up on scroll via
  the shared `useScrollReveal` hook, matching every other section
  header in the template (Timeline/Countdown/Venue/RSVP/Guestbook/
  Private Message/Footer/Prayer already did this — Story and
  Timeline were the two gaps). Purely presentational: the hook was
  already imported in both files, this just wires it to the header
  wrapper the same way it's used elsewhere.
- Story's and Timeline's decorative dividers now pulse gently, same
  as Countdown/Venue/the RSVP suite — closing the one visible
  "divider consistency" gap in the template.
- Standardized the hover-lift distance on the four primary floating
  glass cards (Story, Timeline, Countdown digits, Venue) to a single
  `-5px`, replacing the previous `-4px`/`-5px`/`-6px` spread.
- Aligned the RSVP/Guestbook/Private Message card's border-radius
  from `1.4rem` to `1.5rem`, matching Story's and Venue's primary
  cards for consistent corner rounding across the template's main
  feature cards.

**Accessibility**
- Added the missing `prefers-reduced-motion` overrides for Story's
  and Timeline's hover-transition and divider-pulse animations —
  every other section already had this coverage; these two were the
  gaps. Every animated element in the template now respects reduced
  motion.
- Reviewed text/background contrast across the template (gold-on-
  near-black eyebrows/dividers, champagne body text, muted subtitles)
  — all comfortably clear AA for their sizes; no color changes were
  needed.

**Performance / duplicated CSS**
- Consolidated four near-identical divider definitions (Story,
  Timeline, Countdown, Venue — each previously ~20 lines of
  duplicated CSS) into one shared rule block plus one shared
  `prefers-reduced-motion` override, right after the existing shared
  `.ev-reveal` primitive. Net effect: same visual result everywhere,
  ~60 fewer lines of duplicated CSS, and any future divider tweak
  only needs to happen once.
- Fixed a stale top-of-file comment that still claimed "only Hero has
  a design pass" — left over from before every section got its
  premium treatment.

**Not touched:** Builder, Builder logic, Login, VisitorChat, SQL,
Supabase, APIs, TemplateRegistry, TemplateDispatcher, any shared
component (`GalleryBlock`, `CountdownBlock`, `RSVPBlock`,
`CommentsBlock`, `ChatBlock`, `MusicPlayer`, `LocationBlock`), any
other existing template. Menu and Prayer were reviewed for visual
consistency (backgrounds/seams read fine against their neighbors)
but were outside this task's explicit section list, so left as-is.

### 2026-07-15 — Venue premium cinematic luxury redesign
Scope: `src/components/guest/EternalVoyage/` only (Venue.jsx,
EternalVoyage.css). No other files touched — Builder, Builder logic,
APIs, Login, VisitorChat, SQL, Supabase, TemplateDispatcher,
TemplateRegistry, and every other existing template remain untouched.

- `resolveVenue()` (the existing defensive Builder-data lookup for
  `data.venue` / `data.location`, using the shared `firstText`
  helper) is completely unchanged — same fields, same fallbacks, same
  `mapUrl` resolution. No Builder bindings were touched.
- Added a two-part layout: a new section header (eyebrow, large
  Playfair Display heading, romantic subtitle, decorative gold
  divider) — the same "hardcode a heading when there's no
  data-driven title" pattern already used by Countdown/Timeline —
  sitting above the existing venue card, now redesigned as a large
  premium glass panel (blur, gradient border, gold accent, layered
  shadow, gentle hover lift).
- Venue name renders as a very large centered Playfair Display
  heading; address renders in a muted-gold elegant secondary style;
  the optional note keeps its quiet italic treatment.
- **On the map:** Eternal Voyage's Venue section has never had an
  embedded map/iframe — only an outbound link to the Builder's
  `mapUrl`. Per the "use only the existing map, don't recreate
  Google Maps, don't create new APIs" instruction, no map embed was
  introduced. The existing link is rendered exactly as before (same
  `href`, same `target`/`rel`, same Builder-provided URL, no link
  generated or modified) and is now wrapped in a premium glass "map
  frame": rounded corners, glass border, a soft contained radial gold
  glow, elegant shadow, and a small gold pin icon (inline SVG, drawn
  locally, not a copyrighted asset) above the restyled button.
- The map button itself is restyled from a plain outlined pill into a
  luxury gold glass button (soft frosted background, gold border,
  lift + glow on hover/focus) — copy and destination unchanged.
- Cinematic dark gradient background matching the same `#0b0b0d` /
  `#131114` palette family used elsewhere, with soft radial seam-glows
  at the top and bottom of the section bridging Gallery → Venue →
  Menu into one continuous space, the same technique used at every
  other transition in the template.
- Header and card each fade up on scroll via the shared
  `useScrollReveal` hook (already used by Story/Timeline/Countdown/
  RSVP), staggered slightly. The divider's pulsing gem reuses the
  existing `ev-countdown-pulse` keyframe rather than defining a new
  one — no duplicated CSS. All new transitions/animations respect
  `prefers-reduced-motion`.
- Fully responsive (desktop/tablet/mobile); the section still renders
  nothing when there's no name, address, or map URL at all.
- No new components, libraries, or APIs were introduced; no existing
  shared component (`LocationBlock`, or anything outside this
  directory) was read, imported, or modified.

### Music Experience — luxury floating controller
Scope: `src/components/guest/EternalVoyage/` only (new
`sections/Music.jsx`, `EternalVoyage.jsx`, `EternalVoyage.css`). No
other files touched — Builder, Builder logic, APIs, Login,
VisitorChat, SQL, Supabase, TemplateDispatcher, TemplateRegistry, and
every other existing template remain untouched. No new audio player
and no new music API were created: `Music.jsx` renders the existing
shared `MusicPlayer` (`guest/shared/MusicPlayer.jsx`) exactly as-is —
same `<audio>` element, same play/pause handler, same trim-window
math, same autoplay behavior — nothing in that file was changed.

- `EternalVoyage.jsx` previously never rendered `MusicPlayer` at all
  (Eternal Voyage doesn't go through `GuestPageLayout`, the layout
  that normally renders it), so this pass wires it in the same way
  `GuestPageLayout` already does: reading `data.audioUrl` /
  `audioFull` / `trimStart` / `trimEnd` straight from the Builder's
  existing data shape, gated on the same pre-existing
  `sections.music !== false` toggle key `StepDesign.jsx` already
  writes for every other template (no new toggle key invented).
- `Music.jsx` renders nothing when `data.audioUrl` is empty — same
  "no music → no player" behavior `MusicPlayer` already has built in,
  just guarded one level up so no empty panel/label ever appears
  either.
- A "now playing" label reads the Builder's own `audioName` field
  (already saved by `StepMusic.jsx` for both uploaded files and
  library picks) and displays it with the file extension stripped for
  elegance; falls back to a plain "♪ Wedding Soundtrack" label when
  the Builder hasn't stored a name. No metadata is invented.
- `MusicPlayer`'s own button is restyled from the outside into a
  single luxury glass panel (soft blur, gold border, layered shadow,
  contained radial gold glow, pill shape) using the same
  chained-class-out-specificity + `!important`-only-for-inline-styles
  technique already used for Gallery/Countdown/RSVP; the button is
  taken out of its own `position: fixed` and folded into the panel's
  flex layout as just the icon.
- The subtle "playing" equalizer is pure CSS: it targets
  `MusicPlayer`'s own existing `animate-pulse` class, which the
  component already only applies to the icon while the track is
  playing, and gives the two bars a staggered scale animation instead
  of the default opacity pulse — no playing/paused state is read or
  duplicated in `Music.jsx`, so there's no risk of it drifting out of
  sync with the real audio state.
- Hover feedback on the button intentionally only touches
  background/border-color, never `transform` — the button is a
  `motion.button` whose entrance animation resolves to an inline
  `transform` once settled, so a CSS `transform` there (even with
  `!important`) would fight it on every render; this mirrors the
  reasoning already documented for Countdown's digit cards, just
  applied to the side where the hover target itself is the animated
  element.
- Panel entrance (fade + translateY + tiny scale) and a slow breathing
  glow are both new, small, `prefers-reduced-motion`-respecting CSS
  keyframes — no GSAP/Three.js/Canvas/video, consistent with every
  other section so far.
- Fully responsive: panel width, padding, and label size scale down
  under 640px so it never crowds a phone screen.

### RSVP + Guestbook + Private Message luxury communication suite
Scope: `src/components/guest/EternalVoyage/` only (RSVP.jsx,
Guestbook.jsx, PrivateMessage.jsx, EternalVoyage.css). No other files
touched — Builder, Builder logic, APIs, Login, VisitorChat, SQL,
Supabase, TemplateDispatcher, TemplateRegistry, and every other
existing template remain untouched. `RSVPBlock`, `CommentsBlock`, and
`ChatBlock` were not recreated, replaced, or modified — all three are
rendered exactly as before, unchanged, with the same props and the
same calls into the shared guest API (`submitRsvp`, `loadComments` /
`submitComment` / `toggleCommentReaction`, and the guest chat thread
functions).

**RSVP / Guestbook / Private Message**
- All three shared blocks already render their own kicker/title/
  divider via the shared `SectionHeading` (from `guest/shared/
  GuestUI.jsx`), so no second heading was added. Instead, each
  section wrapper now adds one short romantic intro line plus a small
  gold divider above the card — presentational-only markup, the same
  "hardcode presentational copy" pattern already used by Countdown/
  Timeline for sections with no data-driven heading of their own.
- The existing `SectionHeading` (kicker, title, divider) inside each
  block is restyled from the outside into the template's serif/gold
  language — Guestbook's heading is sized larger and tracked wider
  for an editorial feel, Private Message's intro copy is smaller and
  narrower for an intimate feel, matching the brief for each section.
- Each block's existing `GuestCard` is restyled from the outside into
  a premium glass container: soft blur, gradient border, layered
  shadow, generous padding — reusing the exact compound-selector /
  `!important`-only-for-inline-styles technique already established
  for Gallery and Countdown, so no Tailwind utility class had to be
  removed or duplicated.
- New shared classes (`ev-comm-header`, `ev-comm-subtitle`,
  `ev-comm-divider`, `ev-comm-block`) are reused across all three
  sections instead of repeating the same rules three times; the
  divider's pulsing gem reuses the existing `ev-countdown-pulse`
  keyframe rather than defining a new one — no duplicated CSS.
- Cinematic dark backgrounds (same palette family as Countdown/
  Footer) with soft radial seam-glows at each section boundary, so
  Countdown → RSVP → Guestbook → Private Message now reads as one
  continuous luxury space, the same technique used at every other
  transition in the template so far.
- Header and card each fade up on scroll via the shared
  `useScrollReveal` hook (already used by Story/Timeline/Countdown),
  staggered slightly so the card settles a beat after the intro line.
  CSS-only fade + translateY, no GSAP/Three.js/Canvas/video.
- No RSVPBlock/CommentsBlock/ChatBlock logic, props, or API bindings
  were changed; no Builder bindings were touched.

### Story + Timeline premium redesign
Scope: `src/components/guest/EternalVoyage/` only (Story.jsx,
Timeline.jsx, EternalVoyage.css). No other files touched.

**Story**
- Added a header wrapper with a decorative gold divider under the
  heading, and bumped up heading size/tracking for editorial weight.
- Restyled cards into floating luxury glass panels: deeper blur,
  gradient border, layered shadow, gentle lift on hover.
- Added a soft radial gold glow behind the section and a subtle
  decorative quotation mark on each card.
- Single-letter invitations now get a narrower, comfortable reading
  column instead of stretching full width.
- Cards now fade up with a staggered delay per card (same reveal
  hook already used everywhere — `useScrollReveal` — no new logic).

**Timeline**
- Rebuilt the layout around a centered gold spine with alternating
  left/right floating glass cards on desktop, collapsing to the
  original single left-aligned column on narrower screens.
- Timeline nodes now glow softly and connect to their card via a
  slim gold stub line.
- Date/time now renders as a small pill badge; heading gets the
  same gold-divider treatment as Story.
- Added a faint radial glow at the top of the section so the
  Story → Timeline handoff (already the same background color on
  both sides) reads as one continuous, seamless space.

**Not touched:** Builder, Builder logic, APIs, Login, VisitorChat,
SQL, Supabase, TemplateDispatcher, TemplateRegistry, any other
existing template. No files were moved, renamed, or replaced; no
component logic or data resolution (`resolveStoryEntries`,
`resolveItems`) changed — only markup for the new divider elements
and styling/CSS.

### Gallery luxury cinematic redesign
Scope: `src/components/guest/EternalVoyage/EternalVoyage.css` only.
No JSX files touched — `Gallery.jsx` was already wrapping the
existing `GalleryBlock` inside `<section className="ev-gallery">`,
so this task added CSS rules only, scoped under `.ev-gallery`.

- The shared `GalleryBlock`, its Framer Motion reveal/hover-zoom, its
  lightbox, and its lazy-loaded images are completely untouched —
  restyled purely from the outside using compound selectors (two
  chained classes out-specificity a single Tailwind utility class),
  with `!important` used only for the handful of properties that
  arrive as inline styles from the theme (kicker/title color and
  font-family).
- Section heading (kicker, title, divider — already built into the
  shared `SectionHeading`) restyled to the template's serif/gold
  language; centered column widened from `max-w-3xl` to fit an
  editorial masonry grid.
- Rebuilt the plain 2/3-column grid into a responsive dense masonry
  layout — mobile (2 cols), tablet (4 cols), desktop (6 cols) — with
  a repeating nth-child pattern giving occasional large "hero" photos
  among smaller supporting ones, packed with `grid-auto-flow: dense`
  so no gaps appear.
- Added luxury framing (soft layered shadow, rounded corners) and a
  hover experience (glass sheen overlay, soft image brightness lift,
  gold accent ring via box-shadow) — deliberately avoiding the
  `transform` property since Framer Motion already animates that for
  the entrance reveal and the existing subtle hover zoom.
- Added the same soft radial-glow seam treatment used at the
  Story → Timeline handoff, now bridging Timeline → Gallery.
- The lightbox overlay markup was not restyled or touched at all, per
  the explicit "do not modify the lightbox" instruction.

### Countdown luxury cinematic redesign
Scope: `src/components/guest/EternalVoyage/` only (Countdown.jsx,
EternalVoyage.css). No other files touched.

- `CountdownBlock` had no heading/subtitle/divider of its own (unlike
  Gallery's `SectionHeading`), so `Countdown.jsx` gained new wrapper
  markup for a heading, a small romantic subtitle, and a decorative
  gold divider — the same "hardcode a heading when there's no
  data-driven title" pattern Timeline already used for "The Day's
  Journey". No new data/API dependency was introduced.
- The header and the card row each fade up on scroll via the shared
  `useScrollReveal` hook (already used by Story/Timeline), staggered
  slightly so the cards settle a beat after the heading.
- Each digit face (a plain div inside `CountdownBlock`) is restyled
  from the outside into a premium glass card: soft blur, gold border,
  layered shadow, gentle floating lift on hover. `!important` is used
  only for the properties `CountdownBlock` sets as inline styles
  (border-color, background, color, font-family); everything else
  overrides normally via a compound selector.
- Framer Motion's digit-flip animation only ever moves a child span
  inside the card, never the card itself, so the new hover lift never
  competes with it — confirmed by reading (not modifying)
  `CountdownBlock.jsx` and `useCountdown.js`, both untouched.
- Cinematic dark background with a soft radial gold glow as the
  section's centerpiece light, plus the same seam-glow technique used
  at every other transition so far, now blending Gallery → Countdown
  → RSVP into one continuous space.
- A subtle pulse animation (opacity + scale, `prefers-reduced-motion`
  respected) on the divider's gold accent — the only new keyframe
  animation added, kept deliberately gentle per the "no aggressive
  animation" instruction.

------------------------------------------------------------

# LUMORA — Grand Premiere (new cinematic template)

This section is append-only and tracks a second, entirely separate
template — `grand-premiere` — living in its own isolated folder
(`src/components/guest/GrandPremiere/`). It does not touch, replace,
or depend on Eternal Voyage or any other template above; it's logged
in this same file only because this file is the project's shared
build handoff. Do not overwrite the Eternal Voyage log above this
line — every future Grand Premiere update appends below.

## Phase 1 — Architecture only (2026-07-15)

**Completed:**
- Template structure created
- Registered safely
- Builder compatibility verified
- Core untouched

**Details:**
- Created a fully isolated template folder at
  `src/components/guest/GrandPremiere/`, using the same isolation
  architecture as Eternal Voyage (own top-level entry component, does
  **not** render through the shared `GuestPageLayout`, opens its own
  scroll region on top of the fixed app shell — see
  `styles/GrandPremiere.css`'s `.gp-root` comment for the same
  rationale already documented on Eternal Voyage's `.ev-root`).
- Folder layout: `assets/`, `components/`, `hooks/`, `styles/`,
  `config/`, `index.jsx` (entry point). `components/`, `hooks/`, and
  `assets/` are intentionally empty in this phase (each holds a short
  `README.md` explaining its future purpose) — no section UI is built
  yet, per Phase 1 scope.
- `index.jsx` is a genuine skeleton: it accepts the exact same props
  every template gets from `TemplateDispatcher` (`data`, `theme`,
  `slug`), renders the isolated `.gp-root` scroll container, and
  renders **no sections** — nothing hardcoded, nothing invented,
  nothing placeholder. There is simply nothing to show yet.
- `config/builderFields.js`: a verified map from every area named in
  the brief (Hero, Bride, Groom, Cover Image, Story, Timeline, Gallery,
  Venue, Venue Location, Map, Countdown, Music, Quran Verse, RSVP,
  Guestbook, Private Message, Footer) to the *real* Builder field names
  each will read in a later phase, cross-checked against
  `lib/wizardData.js` (`createInitialInvData()`) and the same fields
  GuestPageLayout.jsx / EternalVoyage.jsx already read for every other
  template. No field name is invented; this is how "Builder
  compatibility" is verified structurally before any section exists.
  Also documents `SECTION_TOGGLE_KEYS` — the exact `data.sections.*`
  toggle keys this template is allowed to read (same keys
  `StepDesign.jsx` already writes for every other template; no new
  toggle key invented).
- Registration mirrors Eternal Voyage's exactly, and only touches the
  same two files Eternal Voyage's own registration touched:
  - `src/lib/templateRegistry.js` — one new entry appended
    (`id: 'grand-premiere'`, badge "New", `readyMade: false`), so the
    Templates gallery, Builder's template picker, license/pricing
    settings, and the review step all pick it up automatically (they
    all render *from* this array — no per-page changes needed).
  - `src/components/guest/TemplateDispatcher.jsx` — one new `if`
    branch added (`data.template === 'grand-premiere'`), directly
    mirroring the existing `eternal-voyage` branch. No existing
    dispatch logic was changed; the shared-layout fallback
    (`GuestPageLayout`) and the Eternal Voyage branch are untouched.
  - No other file references `grand-premiere` or `GrandPremiere`
    (confirmed by grepping the whole existing template's touchpoints
    before adding — Eternal Voyage itself only ever needed these same
    two files).
- No new libraries added. No video backgrounds. Only plain CSS lives
  in `styles/GrandPremiere.css` so far (no animation yet — Phase 1 has
  no visual content to animate).

**Files Modified:**
- `src/components/guest/TemplateDispatcher.jsx` (new `grand-premiere`
  branch, mirroring the existing `eternal-voyage` branch)
- `src/lib/templateRegistry.js` (new registry entry appended)
- `src/components/guest/GrandPremiere/index.jsx` (new)
- `src/components/guest/GrandPremiere/styles/GrandPremiere.css` (new)
- `src/components/guest/GrandPremiere/config/builderFields.js` (new)
- `src/components/guest/GrandPremiere/components/README.md` (new,
  empty folder placeholder)
- `src/components/guest/GrandPremiere/hooks/README.md` (new, empty
  folder placeholder)
- `src/components/guest/GrandPremiere/assets/README.md` (new, empty
  folder placeholder)
- `CLAUDE_HANDOFF.md` (this entry)

**Core Files Changed:** None. Builder logic, APIs, SQL, Supabase,
Login, VisitorChat, `GuestPageLayout`, `EternalVoyage/`, every other
existing template, and `TemplateDispatcher`'s existing dispatch logic
are all untouched — only a new `if` branch and a new registry entry
were added, exactly as Eternal Voyage's own registration was added.

**Verification performed:**
- `npm run build` (`vite build`) — succeeds, 0 errors.
- `oxlint` on every new/touched file — 0 warnings, 0 errors.
- Diffed the full project tree against the pre-Phase-1 state — only
  the files listed above changed; no other file (existing template,
  Builder, API, SQL, Supabase, Login, VisitorChat) was touched.
- Confirmed via grep that `TemplateDispatcher.jsx` and
  `templateRegistry.js` are the *only* two files anywhere in the
  project that reference a template by id outside its own folder
  (the same pattern Eternal Voyage relies on), so no other file needed
  a `grand-premiere`-specific change for the template to be selectable
  end-to-end (Templates gallery → Builder → guest page).

**Next Phase (superseded — see Phase 2 below):**
- Opening Cinematic Scene
- Luxury Ring Box
- Ring Opening Animation
- Camera Transition

## Phase 2 — Cinematic Opening Scene

Completed

- Opening cinematic scene completed
- Luxury background completed
- Ring box component completed
- Hover interaction completed
- Click animation completed
- Ring reveal completed
- Performance verified
- Responsive verified
- Builder compatibility preserved

**Details:**
- New `components/OpeningScene.jsx`: a single full-viewport, purely
  decorative "movie opening" moment — warm cinematic lighting, a
  marble/walnut table, and a closed luxury velvet ring box. There is
  no Builder field for an opening scene or a ring box anywhere in
  `config/builderFields.js`, and none was invented — this section
  reads no invitation data at all (unlike every future section, which
  must). The two rings revealed on open are generic decorative
  iconography, drawn locally as an inline SVG (`RingGlyph`, same
  technique already used for the gold pin icon in Eternal Voyage's
  Venue section) — not Builder content, not a "Bride Ring"/"Groom
  Ring" field.
- Background/atmosphere is CSS-only: layered radial/linear gradients
  for warm lighting and depth, a soft blurred glow behind the box, and
  14 small CSS-animated particles (plain `<span>`s, deterministic
  per-particle timing via `index % 7` modulo classes — no per-frame
  JS, no canvas, no video, no asset files).
- Ring box interaction: the whole box is a single `<button>` (native
  keyboard support, `aria-pressed`, `aria-label` swaps between "Open"/
  "Close the ring box"). Hover/focus-visible adds a soft premium gold
  glow and a small `translateY` lift. Click plays a single
  `cubic-bezier(0.22, 1, 0.36, 1)` lid rotation (0.9s) — no bounce, no
  overshoot, no sparkle bursts — then fades/scales in the cushion and
  the two rings, plus a soft ambient glow bloom. Matches the brief's
  "smooth, premium, Apple-quality, no exaggerated/childish effects"
  requirement.
- `index.jsx` now renders `<OpeningScene />` as the template's only
  content. `data`/`theme`/`slug` are still received (same prop
  contract as every other template) but intentionally unused this
  phase — `OpeningScene` needs none of them. Per the brief, opening
  the box reveals the rings and **stops there**; no Hero/Story/
  Timeline/Gallery/Venue/Countdown/Quran Verse/RSVP/Guestbook/Private
  Message/Footer code was started, and no transition into Hero was
  wired — that hookup is explicitly reserved for Phase 3 ("Cinematic
  Transition from Ring Box to Hero").
- All new CSS lives in the existing single `styles/GrandPremiere.css`
  file (same one-file-per-template convention Eternal Voyage uses —
  no new per-section CSS file was introduced), under a clearly marked
  "PHASE 2 — Opening Cinematic Scene" block.
- Accessibility: full `prefers-reduced-motion` coverage (particles and
  glow-breathe animation disabled, all transitions shortened to 0.25s,
  lid still reaches its open state without a long 3D sweep); visible
  `:focus-visible` outline on the box for keyboard users.
- Fully responsive: box and table dimensions scale down under a
  640px breakpoint; layout is otherwise fluid (`vw`-based glow/table
  sizing) so it holds up between that and desktop.

Modified Files

- `src/components/guest/GrandPremiere/components/OpeningScene.jsx`
  (new)
- `src/components/guest/GrandPremiere/index.jsx` (renders
  `OpeningScene`; header comment updated from Phase 1 → Phase 2)
- `src/components/guest/GrandPremiere/styles/GrandPremiere.css`
  (Phase 2 Opening Scene styles appended)
- `CLAUDE_HANDOFF.md` (this entry)

Core Files Modified

None.

Builder Compatibility

✅ Fully Compatible — `config/builderFields.js`, `templateRegistry.js`,
and `TemplateDispatcher.jsx` are all untouched from Phase 1; the
Opening Scene reads no Builder data (nothing to bind yet) and
invents/hardcodes no invitation content.

**Verification performed:**
- `npm run build` (`vite build`) — succeeds, 0 errors.
- `oxlint` scoped to `src/components/guest/GrandPremiere` — 0
  warnings, 0 errors.
- Confirmed only the three files listed above (plus this handoff)
  changed; Builder, APIs, SQL, Supabase, Login, VisitorChat, every
  other existing template, `TemplateDispatcher.jsx`, and
  `templateRegistry.js` were not touched in this phase.

Next Phase (superseded — see Phase 3 below)

Phase 3 — Cinematic Transition from Ring Box to Hero

## Phase 3 — Premium Opening Refinement

Completed

- Luxury ring box redesigned
- Premium rings implemented
- Background refined
- Lighting improved
- Animation refined
- Performance verified
- Builder compatibility preserved

**Details:**

Scope for this whole phase: `components/OpeningScene.jsx` and
`styles/GrandPremiere.css` only, inside
`src/components/guest/GrandPremiere/`. No section beyond the Opening
Scene was started (no Hero, Story, Gallery, Timeline, Venue, Countdown,
Quran Verse, RSVP, Guestbook, Private Message, or Footer code exists
anywhere in this template). No Builder field was read, invented, or
hardcoded — this scene still has zero Builder-data dependency, same as
Phase 2.

**Ring box**
- Reproportioned (176×108 → 196×116, lid 44px → 48px) for a more
  believable jewelry-box silhouette, with the lid rotation increased
  from -122deg to -128deg so it swings fully open rather than resting
  half-lifted.
- Velvet material deepened: the flat two-stop gradient became a
  three-layer stack (a soft top-left sheen highlight + the original
  radial velvet tone + a new dark edge falloff), plus a very faint
  repeating-radial-gradient "nap" dot texture (5×5px, ~5% opacity) —
  still pure CSS, no texture image.
- Added interior details that didn't exist before: a satin-lined lid
  underside (`gp-ringbox__lid-interior`) using the standard two-face
  flip-panel technique (a second face rotated 180deg from the outer
  lid face, `backface-visibility: hidden` on both) so a warm gold
  satin lining with a faint diagonal quilting pattern is revealed as
  the lid opens instead of showing nothing/the same velvet; and a soft
  interior bounce-light (`gp-ringbox__interior-glow`) that fades in
  once open, so the box interior doesn't stay flat-lit.
- Cushion redesigned from a single flat pad into two individually
  recessed circular slots (`gp-ringbox__slot`, inset radial shadow)
  that actually cradle each ring, closer to a real ring box's interior
  than a flat strip.
- Added a soft diagonal sheen that sweeps across the closed lid on
  hover/focus (`gp-ringbox__lid-face::after`, opacity ~0.16, 1s ease)
  — a quiet premium affordance rather than a constant shimmer loop.
  Hover lift increased slightly (-2px → -3px) and its glow strengthened
  to match.

**Rings**
- Replaced the Phase 2 placeholder glyph (a single `currentColor`
  circle + triangle, reused for both rings) with two distinct,
  gradient-shaded SVGs, still drawn locally — no image assets, no new
  libraries:
  - `BrideRing`: a gold-gradient band (linearGradient, cream → gold →
    bronze, simulating a lit metal curve) with four prongs holding a
    faceted diamond (radialGradient white → pale ice-blue, with
    internal facet lines and a highlight edge) and one small
    four-point sparkle glint that gently pulses in place
    (`gp-gem-sparkle` / `@keyframes gp-sparkle`, 3.4s, respects
    reduced motion).
  - `GroomRing`: a wider band using a five-stop linear gradient
    (light → mid → dark → mid → light) to read as a brushed-metal
    finish under directional light, plus a thin white top arc for a
    soft reflection highlight — no gem, matching a plain wedding band.
- Ring size increased (26px → 30px, 22px → 24px on mobile) so the new
  detail is actually visible rather than shrunk to illegibility.

**Lighting**
- Added a directional spotlight cone above the box
  (`gp-opening__spotlight`, a `clip-path` triangle with a soft
  top-to-bottom gradient, `mix-blend-mode: screen`) so light visibly
  falls onto the box from above instead of the box floating in flat
  ambient glow.
- Existing ambient glow behind the box was warmed and intensified
  slightly (added a brighter inner stop, `rgba(244,224,170,…)`) and
  its open-state bloom made larger/softer (`220%`→`230%` size, longer
  `1.1s` ease-out) for a more "camera flare" feel at the reveal moment.
- Box shadows deepened and warmed across base, lid, and hover states
  (larger blur radii, added a top-left inset highlight on the base
  face) so the box reads with real dimensional lighting rather than a
  flat card.

**Background**
- Refined, not replaced, per the brief: kept the same dark gradient
  base and particle field, and added three soft blurred "bokeh" light
  pools (`gp-opening__bokeh--1/2/3`, blurred radial gradients, gentle
  11s breathing animation) positioned like out-of-focus window/
  chandelier light sources, so the space now reads as a luxury suite
  interior rather than a plain dark void.
- Table gained faint marble/walnut veining
  (`gp-opening__table-veins`, two angled `repeating-linear-gradient`
  layers at 5–10% opacity, `mix-blend-mode: overlay`) under the
  existing sheen highlight — still no texture image.
- Two extra soft corner glows were added to the scene's base
  background gradient stack for a touch more depth at the edges.

**Animation**
- Lid-open easing changed from `cubic-bezier(0.22, 1, 0.36, 1)` to a
  slower, more expo-style `cubic-bezier(0.16, 1, 0.3, 1)` at `1.05s`
  (was `0.9s`) — reads as a deliberate, handcrafted swing rather than
  a quick snap. Cushion/glow/interior-glow reveal delays were
  re-tuned to stay staggered against the new lid timing (cushion now
  starts at `0.45s`/`0.75s` duration, interior glow at `0.5s`,
  ambient glow bloom at `0.2s`/`1.1s`) so the sequence still reads as
  lid → interior light → cushion+rings, just slightly slower and
  smoother overall. No new animation library — CSS transitions/
  keyframes only, same as Phase 2.
- `prefers-reduced-motion` coverage extended to cover every new
  animated/transitioned piece (bokeh breathing, gem sparkle, sheen
  sweep, interior glow) — nothing new animates when the user has
  reduced motion enabled; the box still reaches the same open end
  state via a short 0.25s fade.

**Performance**
- No new libraries, no video, no image/texture assets — everything
  above is CSS gradients/shadows/clip-path plus small inline SVG
  (two ring components, each a handful of shape elements). Total new
  CSS is one stylesheet section, same single-file-per-template
  convention as before. Blur usage stayed modest (three small bokeh
  elements + the existing glow) — confirmed no layout thrash by using
  only `transform`/`opacity` for anything animated (spotlight and
  veins are static, not animated).

Modified Files

- `src/components/guest/GrandPremiere/components/OpeningScene.jsx`
  (ring box markup restructured — interior lining, recessed slots,
  spotlight/bokeh elements, table veins; `RingGlyph` replaced with
  `BrideRing/GroomRing`; header comment updated to Phase 3)
- `src/components/guest/GrandPremiere/styles/GrandPremiere.css`
  (Phase 2 Opening Scene block revised in place with the Phase 3
  refinements above; header comment updated)
- `CLAUDE_HANDOFF.md` (this entry)

Core Files Modified

None.

Builder Compatibility

✅ Fully Compatible — `config/builderFields.js`, `templateRegistry.js`,
and `TemplateDispatcher.jsx` are all untouched; the Opening Scene still
reads no Builder data and invents/hardcodes no invitation content.

**Verification performed:**
- `npm run build` (`vite build`) — succeeds, 0 errors.
- `oxlint` scoped to `src/components/guest/GrandPremiere` — 0
  warnings, 0 errors.
- Confirmed only the two files listed above (plus this handoff)
  changed; Builder, APIs, SQL, Supabase, Login, VisitorChat, every
  other existing template, `TemplateDispatcher.jsx`, and
  `templateRegistry.js` were not touched in this phase.
- Confirmed no Hero/Story/Gallery/Timeline/Venue/Countdown/Quran
  Verse/RSVP/Guestbook/Private Message/Footer code was introduced —
  `index.jsx` still renders only `<OpeningScene />`, and the click
  handler still only toggles the box open/closed with no transition
  or navigation wired.

Next Phase

Phase 4 — Cinematic Camera Transition From Ring Box To Hero

## Phase 4 — Cinematic Transition & Hero Entrance

Completed

- Cinematic camera transition completed
- Diamond light transition completed
- Hero entrance created
- Hero connected to Builder
- Visual continuity preserved
- Performance verified
- Responsive verified
- Builder compatibility preserved

**Scope for this phase:** `index.jsx`, `components/OpeningScene.jsx`,
`components/HeroEntrance.jsx` (new), and `styles/GrandPremiere.css`,
all inside `src/components/guest/GrandPremiere/`. Nothing outside this
template's own folder was touched. Note: `npm run build` / `npm run
lint` could not be executed in this sandbox (no network access to
install `node_modules`) — all four files were instead reviewed by hand
(brace/paren balance checked programmatically, every relative import
path resolved and confirmed to exist on disk). Please run `npm run
build` and `oxlint` before shipping to get the usual automated
confirmation.

**Sequencing (`index.jsx`)**
- `index.jsx` now owns a small `stage` state machine —
  `'opening' | 'zooming' | 'hero'` — stored on `.gp-root` as
  `data-stage`, so the entire transition is driven by CSS reacting to
  one attribute rather than inline styles or a new animation library.
- `OpeningScene` gained one new prop, `onOpened`, fired the moment the
  ring box finishes opening. `index.jsx` waits 1.5s after that (rings
  fully revealed and settled) before moving to `'zooming'`, then
  1.9s more (matching the CSS transition durations below) before
  moving to `'hero'` — both delays are halved-and-under for
  `prefers-reduced-motion` (300ms / 350ms) rather than skipped
  outright, so reduced-motion users still get a legible, much faster
  version of the same sequence instead of an instant jump-cut.
- All `setTimeout` ids are tracked in a ref and cleared on unmount —
  no state updates fire after the guest navigates away mid-transition.
- `OpeningScene` is unmounted only once `stage === 'hero'`, i.e. only
  once the light overlay (`.gp-flare`) is fully opaque — the swap from
  Opening Scene to Hero happens completely hidden behind the light, so
  there's no visible cut, per the brief.

**Opening Scene changes (`OpeningScene.jsx`)**
- The box no longer toggles closed. Per the Phase 4 brief this is now
  a one-way "movie opening" moment: opening it kicks off the onward
  transition, so re-closing it to re-inspect the rings no longer makes
  narrative sense. `handleToggle` now no-ops once `isOpen` is true, the
  button is `disabled={isOpen}` (with a small CSS rule so the frozen
  open state doesn't read as visually "disabled"), and `onOpened` fires
  exactly once, on the closed->open transition only.
- Nothing about the box/rings/lighting/background visuals themselves
  changed — Phase 3's refinements are untouched.

**Diamond-light transition (`GrandPremiere.css`, new "PHASE 4" block)**
- Camera push-in: while `data-stage="zooming"`, `.gp-opening__stage`
  scales to `1.22` over 2s (`cubic-bezier(0.16, 1, 0.3, 1)`, the same
  "handcrafted" easing Phase 3 already uses for the lid) and the
  atmosphere/hint fade out — a slow dolly toward the box rather than a
  hard cut.
- `.gp-flare`: a `position: fixed`, full-viewport radial-gradient
  (white core -> gold -> champagne -> dim gold, i.e. the same palette
  as the rest of the scene) that starts as `clip-path: circle(1% at
  50% 52%)` (a pinprick roughly where the ring box sits) and expands to
  `circle(145% at 50% 52%)` (145% comfortably covers the viewport
  regardless of aspect ratio) over 1.9s while its opacity ramps to 1
  over 1.3s — this is the "camera entering the diamond" / "screen
  gradually fills with light" beat from the brief. Once `data-stage`
  becomes `'hero'`, only opacity changes (1 -> 0 over 1.2s, no clip-path
  replay), so the light fades away in place to reveal Hero rather than
  visibly "un-expanding."
- No video, no new libraries — `clip-path` + `opacity` + `transform`
  only, same techniques already used throughout Phases 2-3.

**Hero entrance (`HeroEntrance.jsx`, new; `.gp-hero*` in
`GrandPremiere.css`)**
- Deliberately minimal, per the brief: bride name, groom name, cover
  image, and the template's luxury typography — nothing else. No
  date, no invitation message, no CTA, no scroll indicator; those (and
  the rest of Hero) are explicitly reserved for Phase 5.
- Builder fields read: `data.bride`, `data.groom` (both plain strings,
  trimmed, matching `config/builderFields.js`'s documented shape —
  no defensive object-shape handling was added since that shape isn't
  real here), and the cover image via `resolveCoverPhoto(data)` (same
  shared helper — `lib/coverDefaults.js` — every other template's
  Hero/Gate already uses, so the couple's-own-upload-wins-over-
  template-default behavior is identical). A missing field renders
  nothing: no name span, no `<img>`, no placeholder text/image.
- Layout: full-viewport section, the cover photo (a real `<img
  object-fit: cover>`, not a CSS background, matching Eternal Voyage's
  Hero) behind a dark luxury scrim + soft gold ambient glow (same
  `--gp-*` custom properties as the Opening Scene), names set in
  `'Playfair Display'` (large, `clamp()`-sized, letter-spaced) with a
  smaller italic gold ampersand between them — continuing the exact
  palette/typography the Opening Scene already established, no new
  visual language introduced.
- The name block fades/rises in (`opacity` + `translateY`, 1.4s) once
  mounted, timed to read as materializing out of the fading light
  rather than popping in abruptly.
- `'Playfair Display'` (already used for the Opening Scene's "Tap to
  open" hint, but never actually requested from Google Fonts in
  Phases 2-3) is now loaded once via `useFontFamilies(['Playfair
  Display'])` (`hooks/useThemeFonts.js` -> `lib/fontLoader.js`, the
  same font-loading module every other guest page/theme and the
  dashboard chrome already use) — so the "elegant luxury typography"
  the brief asks for actually renders in the real typeface instead of
  silently falling back to the browser's default serif.

**Animation**
- Every new transition/animation added this phase (`.gp-opening__stage`
  push-in, `.gp-flare` expand/fade, `.gp-hero__content` rise-in) uses
  the same slow, "handcrafted" cubic-bezier easing already established
  in Phase 3, not a new easing curve or animation library.
- `prefers-reduced-motion` coverage extended to every new
  transition/animation: the push-in, the flare, and the hero rise-in
  all collapse to a 0.25s crossfade (matching the box's existing
  reduced-motion end state), and the JS pause/duration constants that
  drive the stage machine are shortened for the same media query so
  reduced-motion guests aren't stuck waiting through un-animated pauses.

**Performance**
- No videos, no new libraries, no new image/texture assets — the
  entire transition is `clip-path`/`opacity`/`transform` on two
  elements (`.gp-opening__stage`, `.gp-flare`) plus the existing Phase
  2/3 scene, all GPU-friendly properties, no layout-triggering
  properties animated.
- The Hero's cover image uses `loading="eager"` + `fetchPriority="high"`
  since it only mounts once the light is about to reveal it (it's
  never competing with the Opening Scene for bandwidth on first paint).

Modified Files

- `src/components/guest/GrandPremiere/index.jsx` (now owns the
  `stage` state machine; renders `OpeningScene`, the `.gp-flare`
  overlay, and — once revealed — `HeroEntrance`; loads
  `'Playfair Display'` via `useFontFamilies`; header comment updated
  to Phase 4)
- `src/components/guest/GrandPremiere/components/OpeningScene.jsx`
  (added `onOpened` prop; box now freezes open instead of toggling
  closed; header comment updated)
- `src/components/guest/GrandPremiere/components/HeroEntrance.jsx`
  (new — reads `data.bride` / `data.groom` / cover image only, per the
  Phase 4 brief)
- `src/components/guest/GrandPremiere/styles/GrandPremiere.css` (new
  "PHASE 4" block appended: push-in, `.gp-flare`, `.gp-hero*` rules,
  keyframes, responsive tweak, reduced-motion additions; existing
  Phase 2/3 rules untouched except the one small `.gp-ringbox:disabled`
  addition noted above)

Core Files Modified

None

Builder Compatibility

✅ Hero Builder Fields
✅ Cover Image
✅ Bride Name
✅ Groom Name
✅ Builder untouched

**Verification performed:**
- Confirmed only the four files listed above (plus this handoff) were
  changed; Builder, APIs, SQL, Supabase, Login, VisitorChat, every
  other existing template, `TemplateDispatcher.jsx`, and
  `templateRegistry.js` were not touched.
- Confirmed every new/edited file has balanced braces/parens (checked
  programmatically) and every relative import path (`../../../hooks/
  useThemeFonts`, `../../../../lib/coverDefaults`) resolves to a real
  file on disk.
- `npm run build` / `oxlint` were **not** run — this sandbox has no
  network access to install dependencies (`npm install` failed with a
  403 fetching `vite`). This needs to be run and confirmed clean
  before merging.
- Confirmed no Story/Gallery/Timeline/Venue/Countdown/Quran
  Verse/RSVP/Guestbook/Private Message/Footer code was introduced, and
  Hero itself only renders names + cover image (no date, message, CTA,
  or scroll indicator) — matching the "beginning of Hero only" scope.

Next Phase

Phase 5 — Complete Hero Experience

## Phase 5 — Hero Experience

Completed

- Hero completed
- Hero background refined
- Typography completed
- Cover image integrated
- Music timing integrated
- Responsive verified
- Performance verified
- Builder compatibility preserved

**Scope discipline**

Phase 4 already covered the beginning of Hero: bride/groom names and
the cover image. Phase 5 does not touch that data layer or invent any
new Builder field — it finishes Hero exactly as scoped: giving the
same cover image real cinematic layering, and wiring the one thing the
brief explicitly asked for beyond visuals — Builder music, timed to
start once Hero has settled. Story, Timeline, Gallery, Venue, Quran
Verse, RSVP, Guestbook, Private Message, and Footer were not started —
see "Next Phase" below. Countdown was deliberately **not** added:
Hero's design language coming out of Phase 4 was names + cover image
only, with no Countdown anywhere in it, so per the brief's own
instruction ("if Countdown is already in the current design language,
read it from Builder — otherwise leave it for its own phase") it stays
out of scope rather than being invented here.

**Cinematic background (`HeroEntrance.jsx`, `GrandPremiere.css` new
"PHASE 5" block)**
- The Builder cover image is no longer just an `<img>` sitting behind
  the names — it's now wrapped in a new `.gp-hero__frame` (clips
  overflow) and layered with a new `.gp-hero__vignette` alongside the
  scrim/glow Phase 4 already added, per the brief's "build layers, not
  simply display the image."
- **Focus-pull entrance**: the image itself starts very slightly
  blurred/enlarged/dim (`blur(5px)`, `scale(1.03)`, `opacity: 0.82`)
  and settles to full clarity over 2.2s (`gp-hero-focus` keyframes,
  same handcrafted cubic-bezier used throughout this template) —
  timed via a 0.2s delay so guests only ever see the *settled* part of
  it, since Hero mounts while `.gp-flare` is still opaque (unchanged
  from Phase 4) and the light itself takes ~1.3s to fade away.
- **Ken Burns drift**: a separate, indefinite, very slow scale
  (`1` → `1.045` over 26s, `ease-in-out`, alternating) lives on
  `.gp-hero__frame`, not on the image itself — kept on a different
  element specifically so it never fights the focus-pull's `filter`/
  `opacity`/`transform` over the same property. This is the "the cover
  image must become cinematic" / "atmospheric" requirement — no video,
  no new image asset, just `transform`/`filter`/`opacity`, all
  GPU-friendly.
- `.gp-hero__vignette`: a radial gradient that darkens the frame's
  corners/edges while leaving the center (where the names sit) clear —
  the "gentle vignette" / "premium composition" the brief asked for,
  layered with the existing scrim (which handles top-to-bottom
  legibility) and glow (soft warm light behind the names) rather than
  replacing either.
- Typography itself (names, ampersand, sizing, spacing, the single
  subtle rise-in) is unchanged from Phase 4 — it already met the
  brief's "premium, large, elegant, luxury spacing, subtle animation,
  no dramatic movement" bar, so nothing there needed rewriting; Phase 5
  only changed what sits *behind* it.

**Music (`HeroMusic.jsx`, new; wired in `index.jsx`)**
- Reads only the real Builder fields verified in
  `config/builderFields.js`'s `music` map — `audioUrl`, `audioFull`,
  `trimStart`, `trimEnd` — gated by `data.sections?.music !== false`
  (the same toggle-default convention `GuestPageLayout.jsx` already
  uses). No `audioUrl` -> renders nothing, per "if Builder has no
  music, return null."
- Trim-window handling (percentages resolved to seconds once metadata
  loads, looping within that window) mirrors the existing shared
  `guest/shared/MusicPlayer.jsx` exactly, just re-implemented locally
  rather than imported — see `HeroMusic.jsx`'s header comment for why:
  every other template starts music the instant its Gate opens, but
  this brief specifically requires music to start only "naturally,
  after the Hero finishes appearing, not immediately when opening the
  invitation," which is a different timing contract than the shared
  component's `ref.play()`-on-Gate-open pattern was built for.
- Getting "not immediately, but still needs a real user gesture"
  correct required an explicit two-step design, since browsers only
  allow audio-with-sound to start as a *direct, synchronous* result of
  a user gesture, and the only gesture in this template happens
  seconds before Hero even finishes revealing:
  1. **Unlock** — `index.jsx` now has an `onClickCapture`/
     `onKeyDownCapture` on the whole `.gp-root`, which fires
     synchronously on the same click/keypress that opens the ring box
     (capture phase, so it doesn't require `OpeningScene.jsx` to know
     music exists — that file was **not** touched this phase). It
     calls `HeroMusic`'s imperative `unlock()`, which silently
     `play()`s then immediately `pause()`s the `<audio>` element
     (volume forced to 0 first, so there's no audible blip) — this
     momentary, gesture-synchronous play is what registers user
     activation on the element for the rest of the session.
  2. **Reveal** — once `stage` becomes `'hero'`, `index.jsx` waits
     `HERO_MUSIC_DELAY_MS` (1800ms — matched to `.gp-hero__content`'s
     own 0.3s delay + 1.4s rise-in, so music starts just after the
     names have visibly settled, not underneath their motion; 400ms
     under `prefers-reduced-motion`, matching Hero's own reduced-motion
     end state) before flipping `heroSettled` true. `HeroMusic` only
     calls its real, audible `play()` once it receives `reveal=true` —
     already-unlocked by step 1, so this un-gestured call succeeds
     instead of being silently blocked — and fades `volume` from 0 to
     1 over 1.6s via `requestAnimationFrame`, so it arrives like room
     ambience rather than a track being switched on.
  3. If step 1 never happened (guest somehow reaches Hero without a
     genuine tap/keypress) or an unusually strict browser blocks it
     anyway, the `play()` promise's `.catch()` fails silently — no
     forced sound, same guard every autoplay-policy-aware component in
     this codebase already follows.
- A small floating mute/unmute toggle (`.gp-hero__sound`, new CSS)
  fades in once audio is actually audible (`data-visible="true"`,
  driven by the same `audible` state that flips right after `play()`
  resolves) — bottom-corner, gold-bordered, matching the exact
  ink/gold/champagne palette already established, not a new design
  language. This wasn't explicitly requested by the brief, but shipping
  autoplaying sound with zero guest-facing control isn't acceptable UX
  and every other template already has an equivalent (`MusicPlayer.jsx`'s
  play/pause button); this is the same courtesy, restyled to match
  Grand Premiere.
- `sections` toggle aside, nothing about Countdown, RSVP, Guestbook, or
  any other Builder-backed section was touched by adding this — Music
  was explicitly called out by name in the Phase 5 brief itself
  ("MUSIC" section, with its own instructions), unlike those others.

**Animation**
- Every new animation this phase (`gp-hero-focus`, `gp-hero-kenburns`)
  uses the template's existing slow, handcrafted easing conventions
  (`cubic-bezier(0.16, 1, 0.3, 1)` for the one-time focus-pull;
  `ease-in-out` for the indefinite, very slow Ken Burns drift) — no new
  easing philosophy, no animation library.
- `prefers-reduced-motion` coverage extended to both: `.gp-hero__frame`
  (Ken Burns) and `.gp-hero__bg` (focus-pull) both collapse to their
  settled end state (`animation: none`, `filter: none`, `opacity: 1`,
  `transform: none`) — a real gap that was caught and fixed during this
  phase: the Ken Burns animation lives on `.gp-hero__frame`, a
  different element than the focus-pull's `.gp-hero__bg`, and an
  earlier pass only disabled the latter. The mute button's
  opacity/transform transition is also disabled under reduced motion,
  so it appears instantly rather than easing in.

**Performance**
- No videos, no new libraries, no new image/texture assets — the
  background layering is `transform`/`filter`/`opacity` on two existing
  elements, and the vignette is a single `radial-gradient` `<div>`, all
  GPU-friendly, no layout-triggering properties animated.
- The `<audio>` element uses `preload="metadata"` (not `preload="auto"`)
  — only duration/trim-bounds are fetched eagerly; the actual audio
  bytes stream once `play()` is actually called, so a guest who never
  taps to open never downloads any audio at all.

Modified Files

- `src/components/guest/GrandPremiere/index.jsx` (imports and mounts
  `HeroMusic`; adds `heroSettled` state + its settle-timer effect;
  adds `onClickCapture`/`onKeyDownCapture` gesture-capture wiring for
  `HeroMusic.unlock()`; header comment updated to Phase 5)
- `src/components/guest/GrandPremiere/components/HeroEntrance.jsx`
  (background `<img>` now wrapped in a new `.gp-hero__frame`; new
  `.gp-hero__vignette` layer added; no data-reading logic changed;
  header comment updated)
- `src/components/guest/GrandPremiere/components/HeroMusic.jsx` (new —
  reads only `music.*` Builder fields per `config/builderFields.js`,
  handles the unlock/reveal/fade-in playback sequence described above)
- `src/components/guest/GrandPremiere/styles/GrandPremiere.css`
  (`.gp-hero__bg`/`.gp-hero__scrim` section extended with
  `.gp-hero__frame`/`.gp-hero__vignette`; reduced-motion block extended
  to cover both; new "PHASE 5" block appended: Ken Burns + focus-pull
  keyframes, `.gp-hero__sound` mute-toggle styles; existing Phase 2-4
  rules otherwise untouched)

Core Files Modified

None

Builder Compatibility

✅ Hero
✅ Cover Image
✅ Bride Name
✅ Groom Name
✅ Music
✅ Builder untouched

**Verification performed:**
- Confirmed only the four files listed above (plus this handoff) were
  changed; Builder, APIs, SQL, Supabase, Login, VisitorChat,
  `OpeningScene.jsx`, every other existing template,
  `TemplateDispatcher.jsx`, and `templateRegistry.js` were not touched.
- Confirmed every new/edited file has balanced braces/parens (checked
  programmatically) and every relative import path resolves to a real
  file on disk.
- Confirmed `HeroMusic` only reads `audioUrl`/`audioFull`/`trimStart`/
  `trimEnd`/`sections.music` — no field outside `config/builderFields.js`'s
  `music` map — and that a missing `audioUrl` renders nothing (no
  `<audio>`, no button), matching the "no data -> null" rule.
- Caught and fixed a real reduced-motion gap during self-review: the
  Ken Burns animation lives on `.gp-hero__frame`, not `.gp-hero__bg`,
  and the first pass at the reduced-motion override only disabled the
  latter — both are now covered.
- `npm run build` / `oxlint` were **not** run — this sandbox still has
  no network access to install dependencies. This needs to be run and
  confirmed clean before merging.
- Confirmed no Story/Timeline/Gallery/Venue/Countdown/Quran
  Verse/RSVP/Guestbook/Private Message/Footer code was introduced.

Next Phase

Phase 6 — Story Experience

## Phase 6 — Story Experience

Completed

- Story Experience completed
- Story connected to Builder
- Cinematic layout completed
- Responsive verified
- Performance verified
- Builder compatibility preserved

**Scope discipline**

Only the Story section was built this phase, per the brief. Hero
(`HeroEntrance.jsx`, `HeroMusic.jsx`), the Opening Scene, and the
`stage` transition state machine in `index.jsx` are all unchanged —
Story is simply mounted after `HeroEntrance` once `stage === 'hero'`.
Quran Verse, Timeline, Gallery, Venue, Countdown, RSVP, Guestbook,
Private Message, and Footer were not started — see "Next Phase" below.

**Details**

- New `components/Story.jsx`: reads only the real fields verified in
  `config/builderFields.js`'s `story` map — `letterGroom`,
  `letterBride`, `story`, `howWeMet`. Letters take priority when
  either exists (the couple's own words to each other); falls back to
  `story` then `howWeMet` only when there are no letters at all.
  Whichever source is used, only fields that actually have content
  become passages — nothing is padded or invented. No content at
  all → `return null`, same rule every other section in this project
  follows.
- Section toggle: gated in `index.jsx` by `sections.letters !== false`
  — the same real `data.sections.letters` key Eternal Voyage's own
  Story already reads (confirmed in `EternalVoyage.jsx`), not a new
  toggle invented for this template.
- Copy: the masthead kicker/title ("A Letter" / "Words From The
  Heart" and their Arabic equivalents) comes from the shared
  `guestCopy(data.language).letters` object in `lib/guestCopy.js` —
  the same already-reviewed strings Gallery/Countdown/RSVP/Guestbook/
  PrivateMessage already read for every other template — rather than
  a new hardcoded string. `lib/guestCopy.js` itself was only read, not
  modified.
- Per-passage bylines use the couple's own real names
  (`data.groom`/`data.bride`, already verified for Hero) instead of an
  invented phrase like "From the Groom" — an editorial "byline"
  reads naturally for a magazine layout and ties back to the same
  names Hero already shows. A passage with no letter author (the
  `story`/`howWeMet` fallback) simply has no byline.
- Arabic/English: the section's `dir` attribute follows
  `data.language` (`rtl` for `'ar'`, `ltr` otherwise) so passages and
  the folio-numeral column lay out in the correct reading direction
  instead of always rendering left-to-right. Body text uses the same
  `Georgia, 'Times New Roman', serif` fallback stack already used
  project-wide (not a forced Latin display font), so Arabic content
  renders in the browser/OS's own Arabic-capable serif instead of
  being squeezed into a font that can't render it. The one Latin-only
  flourish — a floated drop-cap on the lead passage's opening
  letter — is explicitly scoped to `.gp-story:not([dir='rtl'])` so it
  never applies to Arabic content, where a floated first-letter cap
  doesn't translate to right-to-left reading.

**Design language (why this isn't Eternal Voyage's Story)**

- Eternal Voyage's Story is a grid of quotation-styled glass cards.
  Grand Premiere's is a luxury editorial spread instead: a magazine
  masthead (italic kicker, large Playfair Display title, one pulsing
  gold folio rule — a new keyframe, `gp-story-pulse`, not reused from
  another phase) above a single column of numbered "passages." Each
  passage pairs a large italic folio numeral (`01`, `02`, ...) with
  the passage text and optional byline — no card container, no
  border box, no drop shadow. The only separator between passages is
  a 1px gold hairline rule, which is what keeps the section reading
  as one continuous printed page rather than a stack of UI
  components, per the brief's "no obvious section change."
- Continuity with Hero: `.gp-story`'s background gradient begins at
  the exact color `.gp-hero`'s own gradient ends on (`#060506`), so
  the seam between the two sections is a color match rather than a
  hard cut, plus one soft centered radial glow
  (`.gp-story__atmosphere`) as the only added light — "the movie
  continues," not a new scene.
- Motion: passages and the masthead fade + rise in via a scroll
  reveal (`hooks/useScrollReveal.js`, new — this template's own
  isolated copy of the same IntersectionObserver primitive Eternal
  Voyage's Story already uses, per this template's isolation
  architecture; no cross-template import). Staggered by ~140ms per
  passage, slow and understated — no dramatic entrance, per the
  brief's "avoid exaggerated animations."

**Responsive**

- Desktop/tablet: passage grid is `3.5rem` folio column + fluid text
  column, max-width 780px, centered.
- Mobile (≤640px): folio column narrows to `2.5rem` and its font size
  steps down; section horizontal padding tightens. Layout otherwise
  stays fluid via `clamp()` throughout (masthead title, passage
  padding, text size) rather than a hard breakpoint rewrite.

**Performance**

- No new libraries, no images, no video — the section is CSS
  (gradients, one hairline rule per passage, one small keyframe pulse
  on the divider) plus the existing `IntersectionObserver`-based
  reveal hook. `prefers-reduced-motion` disables the divider pulse and
  collapses every reveal transition to a 0.25s opacity fade.

Modified Files

- `src/components/guest/GrandPremiere/components/Story.jsx` (new)
- `src/components/guest/GrandPremiere/hooks/useScrollReveal.js` (new)
- `src/components/guest/GrandPremiere/index.jsx` (imports and mounts
  `Story` after `HeroEntrance` once `stage === 'hero'`, gated by
  `sections.letters`; header comment updated to Phase 6)
- `src/components/guest/GrandPremiere/styles/GrandPremiere.css` (new
  "PHASE 6" block appended: masthead, passage/folio/byline layout,
  drop-cap, reveal classes, responsive + reduced-motion coverage;
  existing Phase 2-5 rules untouched)
- `CLAUDE_HANDOFF.md` (this entry)

Core Files Modified

None

Builder Compatibility

✅ Story
✅ Builder untouched

**Verification performed**

- Confirmed only the four files listed above (plus this handoff)
  changed; Builder, APIs, SQL, Supabase, Login, VisitorChat,
  `OpeningScene.jsx`, `HeroEntrance.jsx`, `HeroMusic.jsx`, every other
  existing template, `TemplateDispatcher.jsx`, and
  `templateRegistry.js` were not touched.
- Confirmed every new/edited file has balanced braces/parens (checked
  programmatically) and every relative import path
  (`../../../../lib/guestCopy`, `../hooks/useScrollReveal`) resolves
  to a real file on disk.
- Confirmed `Story.jsx` only reads `letterGroom`/`letterBride`/
  `story`/`howWeMet`/`groom`/`bride`/`language`/`sections.letters` —
  no field outside `config/builderFields.js`'s `story` map — and that
  no story content at all renders nothing (no heading, no empty
  section, no placeholder text).
- `npm run build` / `oxlint` were **not** run — this sandbox still has
  no network access to install dependencies. This needs to be run and
  confirmed clean before merging.
- Confirmed no Quran Verse/Timeline/Gallery/Venue/Countdown/RSVP/
  Guestbook/Private Message/Footer code was introduced.

Next Phase

Phase 7 — Quran Verse Experience

## Phase 7 — Quran Verse Experience

Completed

- Quran Verse Experience completed
- Luxury frame completed
- Verse connected to Builder
- Surah connected to Builder (if available)
- Responsive verified
- Performance verified
- Builder compatibility preserved

**Scope discipline**

Only the Quran Verse section was built this phase, per the brief.
Hero and Story (`HeroEntrance.jsx`, `HeroMusic.jsx`, `Story.jsx`) are
unchanged — `QuranVerse` is simply mounted after `Story` once
`stage === 'hero'`. Timeline, Gallery, Venue, Countdown, RSVP,
Guestbook, Private Message, and Footer were not started — see "Next
Phase" below.

**Details**

- New `components/QuranVerse.jsx`: reads only `data.quranVerse` — the
  real field verified in `config/builderFields.js`'s `quranVerse` map,
  the same field `StepNames.jsx` labels "Quran Verse / Dua" and every
  other template (`GuestPageLayout.jsx` / Eternal Voyage's
  `Prayer.jsx`) already reads. It has always been stored as a plain
  string; the object-shape fallback (`.text`/`.verse` for the verse,
  `.surah`/`.surahName`/`.reference` for a caption) is defensive only,
  mirroring the same multi-shape-tolerance technique Eternal Voyage's
  `Story.jsx` already uses for `letters` — it does not invent or
  assume a dedicated "Surah name" field, because none exists anywhere
  in the Builder (confirmed by grepping the whole project for
  "surah" — zero hits outside this new file). A surah caption only
  ever renders if that content is actually present on
  `data.quranVerse` itself.
- No section toggle: there is no `sections.*` key for this content
  anywhere in the project (same situation Eternal Voyage's own
  `Prayer.jsx` documents) — the component gates purely on whether
  `data.quranVerse` resolves to real text, per the project-wide "no
  data -> no section" rule. No verse -> `return null`; no surah
  caption -> the caption and its divider rule simply don't render
  (the frame still shows, verse-only).
- Arabic typography: no Latin display webfont (`Playfair Display` or
  any of `fontLoader.js`'s other curated families — all Latin-only)
  is applied to the verse or caption; both use the same
  `Georgia, 'Times New Roman', serif` fallback stack already used
  project-wide, which lets the browser substitute a proper
  Arabic-capable system font per-glyph. Neither element uses
  letter-spacing, uppercase, or italic — all three degrade Arabic's
  cursive letter-joining or force a synthetic-oblique rendering, so
  they're avoided entirely rather than only being avoided when
  `data.language === 'ar'`. `dir="auto"` is used on both the verse
  and the caption instead of hardcoding `rtl` or relying on
  `data.language`, so the browser's real bidi algorithm reads
  direction from the actual verse content — correct even for the
  edge case of an English dua being entered in a Builder set to
  Arabic, or vice versa.

**Design language ("museum-quality framed artwork," not a card)**

- A matte-gold double border: one hairline outer border plus a second
  inset line 10px in (`::before`), with four open corner brackets at
  the true corners standing in for a picture-frame's mitred corner
  joins — no rounded corners, no glass blur, no dashboard-card
  styling anywhere in this section.
- One soft warm radial glow above the frame (`.gp-quran__atmosphere`)
  reads as a single gallery spotlight rather than ambient scene
  lighting; the frame itself carries a layered soft shadow (a large
  soft drop shadow plus a subtle inset top highlight) for real
  depth, "premium depth" per the brief.
- Continuity with Story: `.gp-quran`'s background gradient starts
  exactly where `.gp-story`'s ends (`var(--gp-ink-2)`), so the two
  sections read as one continuing space rather than a new scene —
  "continue the cinematic atmosphere from Story," per the brief.
- Motion is the calmest section in the template so far: verse fades
  and rises in once via the same shared `.gp-reveal`/`.gp-reveal--visible`
  primitive Story already introduced (`hooks/useScrollReveal.js`, no
  new hook needed) — no divider pulse, no drift, no staggering.
  "Everything should feel calm," per the brief.

**Responsive**

- Frame width is fluid (`max-width: 640px`, 100% below that), verse
  font size and frame padding both use `clamp()` so the section stays
  legible and proportioned from mobile through desktop without a
  layout rewrite at any breakpoint. Below 640px, horizontal padding
  and the inner border's inset both tighten slightly so the frame
  never crowds the viewport edge.

**Performance**

- No new libraries, no images, no video — the frame is pure CSS
  (borders, one radial-gradient glow, layered box-shadow); the only
  motion is the existing `IntersectionObserver`-based reveal hook,
  already covered by the reduced-motion rule Phase 6 added for
  `.gp-reveal` (no new reduced-motion block needed this phase, since
  no new animation was introduced beyond that shared primitive).

Modified Files

- `src/components/guest/GrandPremiere/components/QuranVerse.jsx` (new)
- `src/components/guest/GrandPremiere/index.jsx` (imports and mounts
  `QuranVerse` after `Story`; header comment updated to Phase 7)
- `src/components/guest/GrandPremiere/styles/GrandPremiere.css` (new
  "PHASE 7" block appended: frame, corner brackets, verse/surah
  typography, atmosphere glow, responsive coverage; existing Phase
  2-6 rules untouched)
- `CLAUDE_HANDOFF.md` (this entry)

Core Files Modified

None

Builder Compatibility

✅ Quran Verse
✅ Surah Name (if available)
✅ Builder untouched

**Verification performed**

- Confirmed only the three files listed above (plus this handoff)
  changed; Builder, APIs, SQL, Supabase, Login, VisitorChat,
  `OpeningScene.jsx`, `HeroEntrance.jsx`, `HeroMusic.jsx`,
  `Story.jsx`, every other existing template, `TemplateDispatcher.jsx`,
  and `templateRegistry.js` were not touched.
- Confirmed every new/edited file has balanced braces/parens (checked
  programmatically) and every relative import path
  (`../hooks/useScrollReveal`) resolves to a real file on disk.
- Confirmed `QuranVerse.jsx` only reads `data.quranVerse` (in its
  plain-string real shape and its defensive object-shape fallback) —
  no field outside `config/builderFields.js`'s `quranVerse` map — and
  that no verse content renders nothing (no frame, no empty section).
- Grepped the whole project for "surah" to confirm no dedicated
  Builder field exists for it anywhere, so the surah caption is
  correctly optional/defensive rather than reading a real dedicated
  field that was skipped.
- `npm run build` / `oxlint` were **not** run — this sandbox still has
  no network access to install dependencies. This needs to be run and
  confirmed clean before merging.
- Confirmed no Timeline/Gallery/Venue/Countdown/RSVP/Guestbook/Private
  Message/Footer code was introduced.

Next Phase

Phase 8 — Timeline Journey

## Phase 8 — Memory Journey

Completed

- Memory Journey completed
- Cinematic Timeline completed
- Timeline connected to Builder
- Timeline animations completed
- Responsive verified
- Performance verified
- Builder compatibility preserved

**Scope discipline**

Only the Timeline (Memory Journey) section was built this phase, per
the brief. Hero, Story, and Quran Verse (`HeroEntrance.jsx`,
`HeroMusic.jsx`, `Story.jsx`, `QuranVerse.jsx`) are unchanged —
`Timeline` is simply mounted after `QuranVerse` once `stage ===
'hero'`. Gallery, Venue, Countdown, RSVP, Guestbook, Private Message,
and Footer were not started — see "Next Phase" below.

**Details**

- New `components/Timeline.jsx`: reads only `data.timeline` — the
  real array verified in `config/builderFields.js`'s `timeline` map,
  the same array `StepLocation.jsx`'s "Wedding Day Timeline" editor
  writes `{ time, title, description }` rows to, and the same three
  fields Eternal Voyage's own `sections/Timeline.jsx` already reads.
  There is **no fourth Builder field for a per-event image anywhere in
  the project** — confirmed by grepping the whole codebase for
  `timelineImage`/`timelinePhoto`/etc (zero hits) and by re-reading
  `StepLocation.jsx`'s `TimelineRow` editor, which only ever writes
  `time`/`title`/`description`. The Phase 8 brief speculatively
  allowed for Builder-provided timeline images ("if Builder provides
  timeline images, use them naturally... if Builder has no timeline
  images, render beautifully using available Builder data only");
  since that field doesn't exist today, this component simply never
  renders one, per the project-wide "never invent a field" rule —
  the same discipline `QuranVerse.jsx` already documented for the
  non-existent "surah name" field last phase. The defensive alias
  fallbacks (`event`/`name`, `hour`/`label`, `details`/`text`) mirror
  the exact tolerance `EternalVoyage/sections/Timeline.jsx` already
  applies to this same array — not new fields, just the same
  shape-tolerance every existing reader of `data.timeline` already
  has.
- Section toggle: gated in `index.jsx` by `sections.timeline !==
  false` — the same real `data.sections.timeline` key
  `EternalVoyage/EternalVoyage.jsx` already reads for this exact
  section (not a new toggle invented here). Independent of the
  toggle, `Timeline.jsx` still returns `null` outright the moment
  `data.timeline` resolves to zero usable rows, matching every other
  section in this project.
- Copy: the masthead kicker/title ("The Day" / "Timeline" and their
  Arabic equivalents) comes from the shared
  `guestCopy(data.language).timeline` object in `lib/guestCopy.js` —
  the same already-reviewed strings Eternal Voyage's own Timeline
  reads — rather than a new hardcoded string.
- Arabic/English: the section's `dir` attribute follows
  `data.language` (`rtl` for `'ar'`, `ltr` otherwise), which flips the
  mobile layout's plaque text-alignment via `.gp-timeline[dir='rtl']
  .gp-timeline__plaque`. Typography uses the same `Georgia, 'Times New
  Roman', serif` fallback stack already used project-wide for body
  copy, so Arabic titles/descriptions render in a real Arabic-capable
  serif rather than being squeezed into a Latin-only display font.

**Design language (why this isn't a repaint of Eternal Voyage's
Timeline, and why it isn't "just a timeline")**

- Eternal Voyage's Timeline is a vertical list of dot-marker + content
  rows — a straightforward schedule. Grand Premiere's Memory Journey
  makes the connecting gold path the visual hero instead: on desktop,
  the whole section pins in place (`.gp-timeline__viewport`, `position:
  sticky`) while an oversized scroll "stage" behind it
  (`.gp-timeline__stage`, height scales with how many memories exist —
  `clamp(160vh, calc(60vh * stopCount + 90vh), 480vh)`) scrolls by,
  panning a horizontal track of memories left-to-right and drawing a
  golden line across it as the guest scrolls down the page — ordinary
  vertical page-scroll steering a horizontal cinematic dolly shot, not
  a separate horizontal-scrollbar widget the guest has to discover.
  Memories alternate above/below the path (`--up`/`--down`, via CSS
  grid row placement so the marker always sits exactly on the
  centerline) and cycle through three subtly different compositions
  (`--v0`/`--v1`/`--v2` — width, italic titles) so no two stops in a
  row read identically, per the brief's "avoid repetitive layouts" and
  "every stop should feel different." There is no card container, no
  border box, no drop shadow anywhere in the section — a stop is only
  a marker dot on the path plus a floating "plaque" of type, the way a
  museum placard sits beside an exhibit rather than boxing it in,
  which is what keeps this from reading as "dashboard-style cards,"
  per the brief.
- A single JS-computed value, `--gp-progress` (0→1 across the whole
  section, from new `hooks/useScrollProgress.js`), drives three things
  at once: the track's horizontal pan (`translateX`, expressed as
  `min(0px, calc(progress * -100% + progress * 100vw))` — no pixel
  measurement in JS, so it can never drift out of sync with the
  browser's actual layout), the gold path's draw-in (`scaleX` on
  `.gp-timeline__path-fill`, over a static, dim `.gp-timeline__path-base`
  so the guest can always see the full path ahead, half-lit, as a
  preview of "more memories to come"), and each stop's own fade + rise
  (computed per-stop in `Timeline.jsx` from the same `progress` value
  against an evenly-spaced threshold, `index / count`, with a
  `REVEAL_WINDOW` of 0.14) — "every destination appears only after the
  line reaches it," per the brief, and because it's one shared number
  rather than three independent systems (no per-item
  `IntersectionObserver`, no separate scroll-jack library), the path,
  the pan, and the reveals can't drift apart from each other or from
  where the guest has actually scrolled to.
- Continuity with Quran Verse: `.gp-timeline`'s background gradient
  begins at the same near-black Quran Verse ends on and returns to it
  by the section's end, so the seam is a color match, not a cut — "the
  movie continues," same technique every earlier phase has used — with
  one soft radial glow (`.gp-timeline__atmosphere`) as the only added
  light. The masthead (italic kicker, Playfair Display title, one
  pulsing gold rule) reuses the exact visual treatment Story/Quran
  Verse's own mastheads already established — the brief's "continue
  exactly the same atmosphere... do NOT introduce a new design
  language" — so only the memory content itself, not the surrounding
  frame, is what's new.

**Responsive**

- Above 860px: the horizontal dolly described above. Track and stop
  widths use `clamp()` so spacing stays proportioned across desktop
  and tablet-landscape widths without a breakpoint rewrite.
- 860px and below ("Mobile... transform naturally into a vertical
  journey... keep exactly the same feeling," per the brief): the
  sticky pin and artificial scroll-stage height are both switched off
  (`position: static`, `height: auto`), the track becomes a normal
  top-to-bottom flex column, and the same `.gp-timeline__path-fill`
  element is simply re-pointed from `scaleX` to `scaleY` against a
  vertical `left`-positioned base line — the *same* `--gp-progress`
  value, not a second animation system, which is what makes the
  mobile version feel like a natural continuation of the desktop one
  rather than a different section. Each stop collapses to a simple
  marker-column + text-column grid row, still cycling the same
  `--v0`/`--v1`/`--v2` variants for visual variety within a
  necessarily simpler layout.

**Performance**

- No new libraries, no images, no video. The path-draw, pan, and
  per-stop reveal are all driven by a single rAF-throttled,
  passive `scroll`/`resize` listener pair
  (`hooks/useScrollProgress.js`) — one listener regardless of how many
  memories exist, not one observer per stop — updating one CSS custom
  property that only affects compositor-friendly `transform`/`opacity`
  properties (no layout- or paint-triggering properties are animated).
  `will-change: transform`/`opacity` is scoped to just the track, the
  path-fill, and the plaques. `prefers-reduced-motion` makes
  `useScrollProgress` return a static `1` immediately (no scroll
  listener attached at all), so the path renders fully drawn, the
  track sits at its final pan position, and every stop renders fully
  visible in place — no scroll-jacking for guests who've asked not to
  see motion, matching the reduced-motion pattern already established
  in Phase 6/7.

Modified Files

- `src/components/guest/GrandPremiere/components/Timeline.jsx` (new)
- `src/components/guest/GrandPremiere/hooks/useScrollProgress.js` (new)
- `src/components/guest/GrandPremiere/index.jsx` (imports and mounts
  `Timeline` after `QuranVerse` once `stage === 'hero'`, gated by
  `sections.timeline`; header comment updated to Phase 8)
- `src/components/guest/GrandPremiere/styles/GrandPremiere.css` (new
  "PHASE 8" block appended: masthead, scroll-stage/sticky-viewport/
  track, path base + fill, stop/marker/plaque anatomy and its three
  variants, responsive breakpoint at 860px, reduced-motion coverage;
  existing Phase 2-7 rules untouched)
- `CLAUDE_HANDOFF.md` (this entry)

Core Files Modified

None

Builder Compatibility

✅ Timeline
✅ Timeline Images (if available)
✅ Builder untouched

**Verification performed**

- Confirmed only the four files listed above (plus this handoff)
  changed; Builder, APIs, SQL, Supabase, Login, VisitorChat,
  `OpeningScene.jsx`, `HeroEntrance.jsx`, `HeroMusic.jsx`, `Story.jsx`,
  `QuranVerse.jsx`, every other existing template, `TemplateDispatcher.jsx`,
  and `templateRegistry.js` were not touched.
- Confirmed every new/edited file has balanced braces/parens (checked
  programmatically) and that both `index.jsx` and `Timeline.jsx` parse
  as valid JSX and `GrandPremiere.css` parses as valid CSS (checked
  with esbuild's JSX and CSS parsers, since this sandbox still has no
  network access to install the project's own toolchain).
- Confirmed `Timeline.jsx` only reads `data.timeline` (array) and
  `data.language` / `data.sections.timeline` — no field outside
  `config/builderFields.js`'s `timeline` map — and that an empty or
  all-blank `data.timeline` renders nothing (no heading, no empty
  section, no placeholder rows).
- Re-grepped the whole project for any per-event image field
  (`timelineImage`, `timelinePhoto`, etc.) to confirm none exists
  before deciding not to render one — same verification discipline
  `QuranVerse.jsx` documented for the "surah name" field last phase.
- `npm run build` / `oxlint` were **not** run — this sandbox still has
  no network access to install dependencies. This needs to be run and
  confirmed clean before merging.
- Confirmed no Gallery/Venue/Countdown/RSVP/Guestbook/Private
  Message/Footer code was introduced.

Next Phase

Phase 9A — Gallery Component (see entry below)

------------------------------------------------------------

## Phase 9A — Gallery Component (structure only)

Completed

- Gallery.jsx built (new)
- Gallery mounted in `index.jsx` after Timeline
- Builder-bound: wedding photos, engagement photos, outing photos
- No CSS written this phase (per brief)
- No animation polish added this phase (per brief)
- Builder compatibility preserved

**Scope discipline**

Only `Gallery.jsx` was built this phase, per the brief. `HeroEntrance`,
`HeroMusic`, `Story`, `QuranVerse`, and `Timeline` are unchanged —
`Gallery` is simply mounted after `Timeline` once `stage === 'hero'`.
No Gallery CSS was written and no animation was polished this phase —
both are explicitly deferred to a later pass. Venue, Countdown, RSVP,
Guestbook, Private Message, and Footer were not started — see "Next
Phase" below.

**Builder fields (verified against `config/builderFields.js`'s
`gallery` map — nothing invented)**

- Wedding photos: `[data.photoGroom, data.photoBride]`, combined —
  the same two fields every other template already reads for this.
- Engagement photos: `data.engagementPhotos` (array). Only the photos
  themselves are shown — `engagementStory` / `engagementDate` /
  `engagementDecor` are narrative fields for a separate Engagement
  section and are intentionally untouched here.
- Outing photos: `data.outingPhotos` (array).
- Each of the three is independently gated on its own real toggle
  (`sections.gallery`, `sections.engagement`, `sections.outings` —
  already listed in `SECTION_TOGGLE_KEYS`) and independently renders
  nothing without real photos. If none of the three have content,
  `Gallery` returns `null` — no placeholder, ever.
- Labels ("Gallery" / "The Engagement" / "Outings & Trips" and their
  Arabic equivalents) come from the shared `guestCopy(data.language)`
  object already used project-wide (`t.gallery` / `t.engagement` /
  `t.outings`) — no new hardcoded copy, no invented category beyond
  the three that already exist in the Builder field map.

**Design intent ("Luxury Photo Exhibition")**

Per the brief: no masonry, no grid, no carousel, no slider — images
are the focus. Each photo renders as its own single full-width plate
in a simple vertical procession (one `<figure>` per photo, stacked in
document order, no grid/columns wrapper), the way a guest walks a
gallery corridor one frame at a time rather than scanning a tiled
wall of thumbnails. This is a structural/markup decision, so the "no
grid/masonry" rule holds regardless of what CSS a later phase adds.
A quiet click-to-enlarge lightbox (single image, click again or click
the backdrop to close — no prev/next controls, so it can never become
a slider) mirrors the same interaction the shared `GalleryBlock`
already uses elsewhere in the project, re-expressed as this template's
own markup so it can take on the `gp-` visual language once styled.

**Class names (unstyled — reserved for a later CSS/animation pass)**

`gp-gallery`, `gp-gallery__inner`, `gp-gallery__exhibit`,
`gp-gallery__masthead`, `gp-gallery__kicker`, `gp-gallery__title`,
`gp-gallery__rule`, `gp-gallery__procession`, `gp-gallery__plate`,
`gp-gallery__frame`, `gp-gallery__image`, `gp-gallery__lightbox`,
`gp-gallery__lightbox-image` — same `gp-<section>__<part>` naming
convention `QuranVerse.jsx` / `Timeline.jsx` already establish. None
of these are defined in `GrandPremiere.css` yet; the section renders
with browser-default styling until a later phase styles it.

**Animation**

The only wiring is the same one-line `useScrollReveal` usage every
other section already uses, toggling the existing generic
`.gp-reveal` / `.gp-reveal--visible` classes (already defined in
`GrandPremiere.css`, not new) to fade the whole section in. No
per-item stagger, hover choreography, or lightbox transition was
authored this phase.

**Bilingual**

The section's `dir` follows `data.language` (`rtl` for `'ar'`, `ltr`
otherwise) — the same pattern `Timeline.jsx` / `QuranVerse.jsx` use.

Modified Files

- `src/components/guest/GrandPremiere/components/Gallery.jsx` (new)
- `src/components/guest/GrandPremiere/index.jsx` (imports and mounts
  `Gallery` after `Timeline` once `stage === 'hero'`; header comment
  updated to Phase 9A)
- `CLAUDE_HANDOFF.md` (this entry)

Core Files Modified

None

Builder Compatibility

✅ Gallery (wedding photos)
✅ Engagement photos
✅ Outing photos
✅ Builder untouched

**Verification performed**

- Confirmed only the two files listed above (plus this handoff)
  changed; Builder, APIs, SQL, Supabase, Login, VisitorChat,
  `OpeningScene.jsx`, `HeroEntrance.jsx`, `HeroMusic.jsx`, `Story.jsx`,
  `QuranVerse.jsx`, `Timeline.jsx`, every other existing template,
  `TemplateDispatcher.jsx`, `templateRegistry.js`, and
  `GrandPremiere.css` were not touched.
- Confirmed `Gallery.jsx` only reads `data.photoGroom`,
  `data.photoBride`, `data.engagementPhotos`, `data.outingPhotos`,
  `data.language`, and `data.sections.{gallery,engagement,outings}` —
  no field outside `config/builderFields.js`'s `gallery` map — and
  that having no real photos in any of the three collections renders
  nothing (no heading, no empty section, no placeholder).
- Confirmed both `index.jsx` and `Gallery.jsx` parse as valid JSX
  (checked with esbuild's JSX parser, same verification approach
  Phase 8 used).
- Confirmed no Venue/Countdown/RSVP/Guestbook/Private Message/Footer
  code was introduced, and no CSS was added to `GrandPremiere.css`.
- `npm run build` / `oxlint` were **not** run against the dev
  toolchain (only `esbuild` was installed, purely to validate JSX
  syntax) — this needs to be run and confirmed clean before merging.

Next Phase

Phase 9B — Gallery Layout (see entry below)

------------------------------------------------------------

## Phase 9B — Gallery Layout (CSS only)

Completed

- Gallery CSS layout added to `GrandPremiere.css` (new "PHASE 9B"
  block appended; all earlier phases' rules untouched)
- Responsive breakpoints added (860px, 480px)
- Luxury spacing (generous section/exhibit/procession/plate gaps
  using the same `clamp()` fluid-spacing approach every other phase
  uses)
- Premium composition (masthead typography reusing the established
  kicker/title language from Story/Timeline; narrow single-column
  "procession" so photos read as large, deliberate plates)
- Museum framing (`.gp-gallery__frame`): a padded, bordered "mat"
  each photo sits inset within, plus a matching contained treatment
  on the lightbox image
- No animation added — no new keyframes, no transitions, no reveal
  timing changes. `.gp-gallery__rule` is a **static** gold line (the
  Story/Timeline equivalent's pulse animation was deliberately not
  copied, since the brief for this phase explicitly excludes
  animation)
- No visual-polish additions — no shadows, no glows/atmosphere
  gradients, no hover choreography; `.gp-gallery__frame`/lightbox use
  only a hairline border + solid backing tone
- `Gallery.jsx` was not opened or modified this phase — every
  selector added targets the exact class list Phase 9A's handoff
  entry already documented (`gp-gallery`, `gp-gallery__inner`,
  `gp-gallery__exhibit`, `gp-gallery__masthead`, `gp-gallery__kicker`,
  `gp-gallery__title`, `gp-gallery__rule`, `gp-gallery__procession`,
  `gp-gallery__plate`, `gp-gallery__frame`, `gp-gallery__image`,
  `gp-gallery__lightbox`, `gp-gallery__lightbox-image`) — no class
  names were invented
- `index.jsx` was not opened or modified this phase
- Builder was not inspected or modified this phase
- Venue was not started this phase

**Scope discipline**

Only `GrandPremiere.css` changed. Per the brief, this phase is CSS
layout exclusively: spacing, responsiveness, and museum framing. Two
things a "full luxury pass" would normally include were deliberately
left out because the brief excluded them:
- **Animation** — no pulsing rule, no per-plate stagger, no
  hover-lift, no lightbox transition. The existing `.gp-reveal` /
  `.gp-reveal--visible` section-level fade-in (defined in the PHASE 6
  block, wired by Phase 9A) is untouched and still applies.
- **Visual polish** — no glow/atmosphere backgrounds, no box-shadows,
  no gradient sheens. Framing was achieved with a hairline border and
  a solid backing tone only.

**Design intent**

The "procession" (vertical stack, no grid/masonry/carousel — a
structural decision Phase 9A already made and this phase preserves)
is kept narrower than the section's full width so each photo reads as
a large, deliberate plate with generous luxury margins either side,
the way a single print is presented on a gallery wall rather than
tiled. Each plate's `.gp-gallery__frame` adds a padded mat + hairline
border around the image — "museum framing" — without cropping the
photo (`height: auto` keeps the natural aspect ratio). The masthead
(kicker/title/rule) reuses Story's and Timeline's exact typographic
scale and gold palette so Gallery reads as part of the same template,
not a bolted-on section.

**Bilingual**

No directional CSS was needed — the masthead is center-aligned and
the procession is a single centered column, both of which already
read correctly in `dir='rtl'` without extra rules (the same approach
`Story`'s masthead uses).

Modified Files

- `src/components/guest/GrandPremiere/styles/GrandPremiere.css`
  (new "PHASE 9B" block appended: `.gp-gallery` and all its
  `__`-suffixed descendants, plus two responsive breakpoints;
  existing Phase 1–8 rules untouched)
- `CLAUDE_HANDOFF.md` (this entry)

Core Files Modified

None

Builder Compatibility

✅ Builder untouched
✅ Gallery.jsx untouched
✅ index.jsx untouched

**Verification performed**

- Confirmed only `GrandPremiere.css` (plus this handoff) changed —
  `Gallery.jsx`, `index.jsx`, Builder, APIs, SQL, Supabase, Login,
  VisitorChat, every existing template, `TemplateDispatcher.jsx`, and
  `templateRegistry.js` were not opened or touched.
- Confirmed brace balance across the full stylesheet
  programmatically (net brace depth 0 at EOF) after the new block was
  appended.
- Confirmed every new selector targets only class names already
  documented in Phase 9A's handoff entry — no class name was
  invented, and no selector reaches into `GalleryBlock`, `Venue`, or
  any other section.
- Confirmed no `@keyframes`, `animation:`, or `transition:` properties
  were added anywhere in the new block (grepped the new block
  specifically) — satisfies the "no animations" instruction.
- Confirmed no `box-shadow`, `filter: blur`, or gradient "atmosphere"
  backgrounds were added in the new block — satisfies the "no visual
  polish" instruction; only solid colors and a single hairline border
  per frame.
- `npm run build` / `oxlint` were **not** run against the dev
  toolchain — this sandbox has no installed `node_modules` for this
  project. This needs to be run and confirmed clean before merging.

Next Phase

Venue (not started this phase, per the brief's explicit scope stop)

