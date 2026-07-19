import { useCallback, useEffect, useRef, useState } from 'react';
import './styles/GrandPremiere.css';
import OpeningScene from './components/OpeningScene';
import HeroEntrance from './components/HeroEntrance';
import HeroMusic from './components/HeroMusic';
import Story from './components/Story';
import QuranVerse from './components/QuranVerse';
import Timeline from './components/Timeline';
import Engagement from './components/Engagement';
import Gallery from './components/Gallery';
import Menu from './components/Menu';
import Venue from './components/Venue';
import Countdown from './components/Countdown';
import RSVP from './components/RSVP';
import Guestbook from './components/Guestbook';
import PrivateMessage from './components/PrivateMessage';
import Finale from './components/Finale';
import { useFontFamilies } from '../../../hooks/useThemeFonts';

/**
 * GRAND PREMIERE — template entry point.
 *
 * PHASE 15 — GRAND FINALE EXPERIENCE. Builds on Phase 14's Private
 * Message without touching it: `HeroEntrance`, `HeroMusic`, `Story`,
 * `QuranVerse`, `Timeline`, `Gallery`, `Venue`, `Countdown`, `RSVP`,
 * `Guestbook`, `PrivateMessage`, the `stage` state machine, and the
 * Opening Scene are all unchanged. What's new is rendering `Finale`
 * (new this phase — see `components/Finale.jsx`) last, after
 * `PrivateMessage`, closing out the invitation. No section toggle
 * exists for it (same situation `QuranVerse`/`Countdown` are already
 * in) — it self-gates on `data.groom`/`data.bride`, the two fields
 * `config/builderFields.js`'s own `footer` map already reserved for
 * this section. This closes out `GRAND_PREMIERE_HANDOFF.md`'s "Next
 * Phase" line.
 *
 * REGRESSION AUDIT (post-Phase 16) — render-tree restoration: added
 * the previously-missing `Engagement` section (see
 * `components/Engagement.jsx`'s header comment for the root cause —
 * its Builder fields were reserved but no component ever read them),
 * mounted here right after `Timeline` and before `Gallery`, gated by
 * the same `sections.engagement` toggle `Gallery.jsx`'s own
 * engagement-photo exhibit already reads. Also fixed `Story.jsx`
 * dropping `howWeMet` whenever a letter existed (see that file's own
 * header comment) — a content bug, not a mounting bug, so it isn't
 * visible from this file. Every other section listed above was
 * already correctly imported and mounted here; this pass changed
 * nothing about how they render.
 *
 * Isolation: this is a brand-new, fully isolated template — same
 * architecture as Eternal Voyage (see EternalVoyage/EternalVoyage.jsx's
 * own header comment for the full rationale). It does NOT render
 * through the shared `GuestPageLayout` — it has its own top-level
 * component and its own `components/` / `hooks/` / `styles/` /
 * `config/` / `assets/` folders, so it can grow independently without
 * touching any other template, GuestPageLayout, or Eternal Voyage.
 *
 * Builder compatibility: it receives the exact same props every other
 * template receives from TemplateDispatcher — `data` (the invitation's
 * full Builder data object, now passed through to `HeroEntrance`),
 * `theme` (resolved via `themeFor()`, not yet used — Grand Premiere
 * still has no dedicated entry in guestThemes.js, same situation
 * Eternal Voyage was in before it got its own design, so this template
 * keeps defining its own palette/typography directly in
 * `styles/GrandPremiere.css` rather than reading a theme that doesn't
 * describe it), and `slug` (now passed through to `RSVP`, `Guestbook`,
 * and `PrivateMessage`).
 * `OpeningScene` itself stays intentionally data-free — it is a
 * decorative cinematic moment, not a Builder section. `HeroEntrance`
 * reads only the fields listed
 * for it in `config/builderFields.js` (bride, groom, cover image).
 * `HeroMusic` (new this phase) reads only `config/builderFields.js`'s
 * `music` map (`audioUrl`, `audioFull`, `trimStart`, `trimEnd`) gated
 * by the same `sections.music` toggle every other template already
 * respects, and renders nothing when Builder has no track — see that
 * file for the verified real-field map every later section will also
 * read from.
 *
 * The transition itself (the `stage` state machine + `.gp-flare`
 * overlay below) is pure CSS + `setTimeout` sequencing, timed to match
 * the `.gp-flare` / `.gp-opening__stage` transition durations declared
 * in `styles/GrandPremiere.css`'s Phase 4 block — no animation
 * library, no video. `HERO_MUSIC_DELAY_MS` below uses the same
 * `setTimeout` approach to start music only once Hero's own entrance
 * animation (`.gp-hero__content`'s rise-in, see `GrandPremiere.css`)
 * has finished settling, per the Phase 5 brief's "start it naturally
 * after the Hero finishes appearing, not immediately."
 */
const STAGE = {
  OPENING: 'opening',
  ZOOMING: 'zooming',
  HERO: 'hero',
};

// Matches the .gp-flare "zooming" transition duration in
// GrandPremiere.css — kept as one constant so the JS stage-advance
// timer and the CSS animation it's waiting out can't silently drift
// apart.
const ZOOM_DURATION_MS = 1900;
const ZOOM_DURATION_MS_REDUCED = 350;

// How long the rings stay fully revealed, undisturbed, before the
// camera begins pushing in — this is what makes the push-in read as
// "after the rings are revealed" rather than an immediate cut.
const REVEAL_PAUSE_MS = 1500;
const REVEAL_PAUSE_MS_REDUCED = 300;

// How long to wait, once `stage` becomes `'hero'`, before starting
// music. Matches `.gp-hero__content`'s rise-in (0.3s animation-delay +
// 1.4s duration ≈ 1.7s) plus a small margin so the track begins after
// the names have visibly settled, not underneath their motion — "after
// the Hero finishes appearing," per the brief. The reduced-motion
// figure matches HeroEntrance's own reduced-motion end state, which
// settles near-instantly.
const HERO_MUSIC_DELAY_MS = 1800;
const HERO_MUSIC_DELAY_MS_REDUCED = 400;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function GrandPremiere({ data, theme, slug }) {
  // Referenced (not yet consumed) so the exact prop shape this
  // Builder-compatible entry point expects is explicit and won't
  // silently bit-rot before later phases' sections start reading them.
  void theme;

  // The template's own typography, loaded once via the same
  // `lib/fontLoader.js` module every theme-driven guest page already
  // uses (see `useThemeFonts.js`) — just for the one display family
  // this template's Opening Scene hint and Hero names both use,
  // instead of a full theme (Grand Premiere has no guestThemes.js
  // entry yet, see the header comment above).
  useFontFamilies(['Playfair Display']);

  const [stage, setStage] = useState(STAGE.OPENING);
  const [heroSettled, setHeroSettled] = useState(false);
  const timeoutIdsRef = useRef([]);
  const musicRef = useRef(null);

  const scheduleTimeout = useCallback((callback, delayMs) => {
    const id = window.setTimeout(callback, delayMs);
    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  useEffect(
    () => () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    },
    []
  );

  // Fired by OpeningScene once the box has opened and the rings are
  // revealed. This only starts the *next* leg (the push-in + light
  // expansion); it does not itself change what's on screen.
  const handleRingsRevealed = useCallback(() => {
    const pause = prefersReducedMotion() ? REVEAL_PAUSE_MS_REDUCED : REVEAL_PAUSE_MS;
    scheduleTimeout(() => setStage(STAGE.ZOOMING), pause);
  }, [scheduleTimeout]);

  // Once the camera has finished pushing in and the light has fully
  // covered the screen (see .gp-flare in GrandPremiere.css), swap the
  // Opening Scene out for the Hero entrance underneath the light, then
  // let the light fade away to reveal it. Because the swap happens
  // while the light is fully opaque, there's no visible cut.
  useEffect(() => {
    if (stage !== STAGE.ZOOMING) return undefined;
    const duration = prefersReducedMotion() ? ZOOM_DURATION_MS_REDUCED : ZOOM_DURATION_MS;
    scheduleTimeout(() => setStage(STAGE.HERO), duration);
    return undefined;
  }, [stage, scheduleTimeout]);

  // Once Hero is on screen, wait for its own entrance animation to
  // settle before flagging it "settled" — HeroMusic only starts
  // playback once this flips true (see HERO_MUSIC_DELAY_MS above).
  useEffect(() => {
    if (stage !== STAGE.HERO) return undefined;
    const delay = prefersReducedMotion() ? HERO_MUSIC_DELAY_MS_REDUCED : HERO_MUSIC_DELAY_MS;
    scheduleTimeout(() => setHeroSettled(true), delay);
    return undefined;
  }, [stage, scheduleTimeout]);

  // Fires on the *capture* phase of any click/keypress-click inside the
  // whole template — including the ring box's own "tap to open" button
  // in OpeningScene — without OpeningScene needing to know music exists
  // (it stays intentionally data-free, see the header comment above).
  // Capture fires synchronously, in the same call stack as the trusted
  // user gesture, which is what satisfies browsers' autoplay-with-sound
  // requirement; see HeroMusic.jsx's own comment for the full picture.
  const handleGestureCapture = useCallback(() => {
    musicRef.current?.unlock();
  }, []);

  const sections = data?.sections || {};
  const sectionsMusicEnabled = sections.music !== false;

  return (
    <div
      className="gp-root"
      data-template="grand-premiere"
      data-stage={stage}
      onClickCapture={handleGestureCapture}
      onKeyDownCapture={handleGestureCapture}
    >
      {stage !== STAGE.HERO && <OpeningScene onOpened={handleRingsRevealed} />}

      {/* The diamond-light transition itself: a soft radial light that
          expands from roughly where the rings sit until it covers the
          entire screen, then fades away once Hero is mounted beneath
          it. Purely presentational — see the "PHASE 4" block in
          GrandPremiere.css for the actual expand/fade timing per
          `data-stage`. */}
      <div className="gp-flare" aria-hidden="true" />

      {stage === STAGE.HERO && <HeroEntrance data={data} />}

      {stage === STAGE.HERO && sections.letters !== false && <Story data={data} />}

      {stage === STAGE.HERO && <QuranVerse data={data} />}

      {stage === STAGE.HERO && sections.timeline !== false && <Timeline data={data} />}

      {stage === STAGE.HERO && sections.engagement !== false && <Engagement data={data} />}

      {stage === STAGE.HERO && <Gallery data={data} />}

      {stage === STAGE.HERO && sections.menu !== false && <Menu data={data} />}

      {stage === STAGE.HERO && sections.location !== false && <Venue data={data} />}

      {stage === STAGE.HERO && <Countdown data={data} />}

      {stage === STAGE.HERO && sections.rsvp !== false && <RSVP data={data} slug={slug} />}

      {stage === STAGE.HERO && sections.comments !== false && <Guestbook data={data} slug={slug} />}

      {stage === STAGE.HERO && sections.messages !== false && (
        <PrivateMessage data={data} slug={slug} />
      )}

      {stage === STAGE.HERO && <Finale data={data} />}

      {sectionsMusicEnabled && (
        <HeroMusic
          ref={musicRef}
          audioUrl={data?.audioUrl}
          audioFull={data?.audioFull}
          trimStart={data?.trimStart}
          trimEnd={data?.trimEnd}
          reveal={stage === STAGE.HERO && heroSettled}
        />
      )}
    </div>
  );
}
