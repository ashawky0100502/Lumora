/**
 * Shared shape + small pure helpers for the invitation builder wizard.
 * Ported 1:1 from the original Lumora build (same field names) so the
 * publish payload stays compatible with the existing `invitations` table
 * and every guest/couple view that reads it.
 */
import { compressImage } from './imageCompress';

export function createInitialInvData() {
  return {
    groom: '',
    bride: '',
    date: '',
    time: '',
    language: 'ar',
    story: '',
    howWeMet: '',
    letterGroom: '',
    letterBride: '',
    engagementDate: '',
    engagementStory: '',
    engagementPhotos: [],
    engagementDecor: 'none',
    outingPhotos: [],
    bioGroom: '',
    bioBride: '',
    venueName: '',
    mapsLink: '',
    mapsLat: null,
    mapsLng: null,
    locationDescription: '',
    parkingInfo: '',
    photoGroom: null,
    photoBride: null,
    silkPalette: 'sage',
    // Kept for backward-compat with invitations published before the
    // cover-photo picker worked on every template — new invitations use
    // the generic `coverPhoto` field below regardless of which template
    // they picked.
    silkCoverPhoto: null,
    coverPhoto: null,
    audioUrl: '',
    audioName: '',
    audioFull: true,
    trimStart: 0,
    trimEnd: 100,
    menu: [],
    quranVerse: '',
    invitationMessage: '',
    timeline: [],
    templateConfig: {},
    sections: {
      location: true,
      gallery: true,
      engagement: true,
      outings: true,
      letters: true,
      music: true,
      menu: true,
      messages: true,
      comments: true,
      rsvp: true,
      timeline: false,
    },
    bgTheme: 'midnight',
    coverMotif: 'floral',
    gateStyle: 'classic',
    template: 'midnight',
    slug: null,
  };
}

export function slugify(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Pulls lat/lng out of the common Google Maps URL shapes, when possible. */
export function parseMapsLink(url) {
  if (!url) return null;
  let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!m) m = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!m) m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

export const BRAND_DOMAIN = 'lumora.wedding';

export const STEP_LABELS = [
  { step: 1, label: 'Names' },
  { step: 2, label: 'Date & Time' },
  { step: 3, label: 'Location' },
  { step: 4, label: 'Photos' },
  { step: 5, label: 'Music' },
  { step: 6, label: 'Menu' },
  { step: 7, label: 'Design' },
  { step: 8, label: 'Review & Publish' },
];

/** Read a File as a base64 data URL (used for every image upload — no
 * storage bucket needed, mirrors the original build exactly).
 *
 * The image is compressed/resized first (same pipeline as the Gallery
 * uploads) — this is embedded directly in the invitation row, so an
 * uncompressed phone photo here doesn't just cost storage, it's downloaded
 * in full by every single guest who opens the link. */
export function readAsDataUrl(file) {
  return compressImage(file).then(
    (optimized) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(optimized);
      })
  );
}

/**
 * Lightweight "how complete is this step" scoring — powers the done
 * checkmarks on the step dots and the checklist on the review step.
 * Steps 1,4,5,6 are fully optional beyond names, so they only ever
 * report "touched" rather than blocking progress.
 */
export function stepCompletion(data) {
  return {
    1: Boolean(data.groom.trim() && data.bride.trim()),
    2: Boolean(data.date),
    3: Boolean(data.venueName.trim() || data.mapsLink.trim()),
    4: Boolean(data.photoGroom || data.photoBride),
    5: Boolean(data.audioUrl),
    6: Boolean(data.menu.some((m) => m.name.trim())),
    7: true,
    8: false,
  };
}
