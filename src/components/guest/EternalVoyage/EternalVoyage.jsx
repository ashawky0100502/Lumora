import { useRef } from 'react';

import './EternalVoyage.css';

import Hero from './sections/Hero';
import Music from './sections/Music';
import Story from './sections/Story';
import Prayer from './sections/Prayer';
import Timeline from './sections/Timeline';
import Gallery from './sections/Gallery';
import Venue from './sections/Venue';
import Menu from './sections/Menu';
import Countdown from './sections/Countdown';
import RSVP from './sections/RSVP';
import Guestbook from './sections/Guestbook';
import PrivateMessage from './sections/PrivateMessage';
import Footer from './sections/Footer';

/**
 * ETERNAL VOYAGE — template skeleton only.
 *
 * This is a brand-new, fully isolated template — it does NOT go through
 * GuestPageLayout (the shared layout the other templates render through).
 * It has its own top-level component and its own section files, so it
 * can grow its own design/animations later without touching any other
 * template.
 *
 * It still plugs into the exact same Builder system as every other
 * template, though: same `data` shape coming out of the wizard/Builder,
 * same `slug`, and the sections that talk to the backend (RSVP,
 * Guestbook, Private Message) reuse the existing shared blocks/APIs
 * under guest/shared + lib/guestApi — nothing new is duplicated there.
 *
 * Section toggles below intentionally reuse the exact keys the Builder's
 * "Show / Hide Sections" step (StepDesign.jsx → SECTION_ROWS) already
 * writes onto `data.sections` for every other template — gallery, menu,
 * rsvp, timeline, comments, messages, location, letters, music. No new
 * toggle keys are invented here. A few sections (Hero, Prayer, Countdown,
 * Footer) have no Builder toggle at all yet — same situation
 * GuestPageLayout is already in for e.g. its Hero/EngagementBlock — so
 * they render unconditionally rather than being gated on a key that
 * doesn't actually exist in the Builder.
 *
 * NO DESIGN. NO ANIMATIONS. Skeleton structure only — every section here
 * is a plain placeholder until the real Eternal Voyage design is built.
 *
 * Props:
 *   data     — the invitation's Builder data object (same shape used by
 *              every other template: groom, bride, date, photos, timeline,
 *              menu, venue info, sections toggles, language, etc.)
 *   theme    — resolved theme object (see lib/guestThemes.js). Eternal
 *              Voyage doesn't have its own theme entry yet (no design
 *              yet) — themeFor() falls back to a default theme for now.
 *   slug     — this invitation's public slug/token, needed by the
 *              sections that call the shared guest APIs (RSVP, comments,
 *              chat).
 */
export default function EternalVoyage({ data, theme, slug }) {
  const sections = data?.sections || {};
  const musicRef = useRef(null);

  return (
    <div className="ev-root" data-template="eternal-voyage">
      {sections.music !== false && <Music ref={musicRef} data={data} theme={theme} />}

      <Hero
        data={data}
        theme={theme}
        sections={sections}
        onBeginJourney={() => musicRef.current?.play()}
      />

      <Prayer data={data} theme={theme} sections={sections} />

      {sections.letters !== false && <Story data={data} theme={theme} sections={sections} />}

      {sections.timeline !== false && <Timeline data={data} theme={theme} sections={sections} />}

      {/* Gallery now covers three independent Builder toggles (gallery,
          engagement, outings — see sections/Gallery.jsx), so it isn't
          gated on a single one here; it renders nothing itself when none
          of the three have content, same as Prayer/Venue below. */}
      <Gallery data={data} theme={theme} sections={sections} />

      {sections.location !== false && <Venue data={data} theme={theme} sections={sections} />}

      {sections.menu !== false && <Menu data={data} theme={theme} sections={sections} />}

      <Countdown data={data} theme={theme} sections={sections} />

      {sections.rsvp !== false && <RSVP data={data} theme={theme} sections={sections} slug={slug} />}

      {sections.comments !== false && <Guestbook data={data} theme={theme} sections={sections} slug={slug} />}

      {sections.messages !== false && (
        <PrivateMessage data={data} theme={theme} sections={sections} slug={slug} />
      )}

      <Footer data={data} theme={theme} sections={sections} />
    </div>
  );
}
