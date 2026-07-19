/**
 * GRAND PREMIERE — Builder field map (Phase 1: config only).
 *
 * Builder is the single source of truth. Nothing in this template may
 * hardcode invitation content or invent a field name — every value a
 * future section reads must come from this map, and every field listed
 * here has been verified against the *real* Builder data shape
 * (`src/lib/wizardData.js` → `createInitialInvData()`), the same shape
 * every other template (GuestPageLayout.jsx, EternalVoyage.jsx) already
 * reads. Nothing below is guessed or aliased.
 *
 * Phase 1 does not implement any section UI yet — this file exists so
 * "Builder compatibility" can be verified structurally before any pixel
 * is drawn: every area the brief lists (Hero, Bride, Groom, Cover
 * Image, Story, Timeline, Gallery, Venue, Venue Location, Map,
 * Countdown, Music, Quran Verse, RSVP, Guestbook, Private Message,
 * Footer) has a confirmed real field (or real shared-component wiring)
 * to read from once its section is built in a later phase.
 *
 * Rule every future section must follow:
 *   Builder has data  -> render it.
 *   Builder has none  -> `return null` (no placeholder, ever).
 */

export const BUILDER_FIELDS = {
  // -- Hero / couple --------------------------------------------------
  hero: {
    groom: 'groom', // string
    bride: 'bride', // string
    date: 'date', // 'YYYY-MM-DD'
    time: 'time', // 'HH:mm'
    invitationMessage: 'invitationMessage', // string
    language: 'language', // 'ar' | 'en'
  },

  // -- Bride / Groom portraits -----------------------------------------
  // Same two single-image fields every other template reads
  // (GuestPageLayout.jsx: `[data.photoGroom, data.photoBride]`).
  bride: {
    photo: 'photoBride',
    bio: 'bioBride', // optional, not yet read by any template
  },
  groom: {
    photo: 'photoGroom',
    bio: 'bioGroom', // optional, not yet read by any template
  },

  // -- Cover image ------------------------------------------------------
  // Resolved through the shared `resolveCoverPhoto()` helper
  // (lib/coverDefaults.js), NOT a raw field read — the couple's own
  // upload always wins over any template default. No default cover is
  // registered for Grand Premiere yet (see lib/coverDefaults.js
  // DEFAULT_COVERS), so this resolves to `data.coverPhoto` or null
  // until one is added.
  coverImage: {
    resolver: 'resolveCoverPhoto(data)', // from ../../../../lib/coverDefaults
    rawField: 'coverPhoto',
  },

  // -- Story / letters ----------------------------------------------------
  story: {
    story: 'story',
    howWeMet: 'howWeMet',
    letterGroom: 'letterGroom',
    letterBride: 'letterBride',
  },

  // -- Timeline -----------------------------------------------------------
  timeline: {
    items: 'timeline', // array
    sectionToggle: 'sections.timeline',
  },

  // -- Gallery (wedding / engagement / outings) ----------------------------
  gallery: {
    weddingPhotos: ['photoGroom', 'photoBride'], // combined, same as GuestPageLayout.jsx
    engagement: {
      date: 'engagementDate',
      story: 'engagementStory',
      photos: 'engagementPhotos',
      decor: 'engagementDecor',
    },
    outingPhotos: 'outingPhotos',
    sectionToggles: ['sections.gallery', 'sections.engagement', 'sections.outings'],
  },

  // -- Venue / location / map ----------------------------------------------
  venue: {
    venueName: 'venueName',
    locationDescription: 'locationDescription',
    parkingInfo: 'parkingInfo',
    sectionToggle: 'sections.location',
  },
  map: {
    mapsLink: 'mapsLink',
    mapsLat: 'mapsLat',
    mapsLng: 'mapsLng',
  },

  // -- Countdown ------------------------------------------------------------
  // No dedicated Builder toggle exists yet (same situation Eternal
  // Voyage's Countdown is in) — derived from `hero.date` + `hero.time`,
  // not a separate field.
  countdown: {
    date: 'date',
    time: 'time',
  },

  // -- Music ------------------------------------------------------------------
  music: {
    audioUrl: 'audioUrl',
    audioName: 'audioName',
    audioFull: 'audioFull',
    trimStart: 'trimStart',
    trimEnd: 'trimEnd',
    sectionToggle: 'sections.music',
  },

  // -- Quran verse --------------------------------------------------------------
  quranVerse: {
    verse: 'quranVerse',
  },

  // -- Menu ------------------------------------------------------------------------
  menu: {
    items: 'menu', // array
    sectionToggle: 'sections.menu',
  },

  // -- RSVP / Guestbook / Private Message ------------------------------------------
  // Not raw Builder fields — these three go through the shared guest
  // API + shared blocks every other template already uses
  // (`RSVPBlock`, `CommentsBlock`, `ChatBlock` from guest/shared), keyed
  // off the invitation's `slug`, not off `data` directly.
  rsvp: {
    component: 'RSVPBlock',
    sectionToggle: 'sections.rsvp',
  },
  guestbook: {
    component: 'CommentsBlock',
    sectionToggle: 'sections.comments',
  },
  privateMessage: {
    component: 'ChatBlock',
    sectionToggle: 'sections.messages',
  },

  // -- Footer -----------------------------------------------------------------------
  // No dedicated field — reads the same couple-name fields Hero does.
  footer: {
    groom: 'groom',
    bride: 'bride',
  },
};

/**
 * Every `data.sections.*` toggle this template is allowed to read.
 * These are the exact keys `StepDesign.jsx` (Builder) and every
 * existing template already write/read on `data.sections` — no new
 * toggle key is invented here, matching the same rule Eternal Voyage
 * follows (see its own file header comment).
 */
export const SECTION_TOGGLE_KEYS = [
  'location',
  'gallery',
  'engagement',
  'outings',
  'letters',
  'music',
  'menu',
  'messages',
  'comments',
  'rsvp',
  'timeline',
];
