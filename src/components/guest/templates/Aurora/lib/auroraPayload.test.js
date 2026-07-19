import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAuroraPayload } from './auroraPayload.js';

test('normalizes canonical builder fields for Aurora sections', () => {
  const payload = normalizeAuroraPayload({
    groom: 'Noor',
    bride: 'Lina',
    date: '2026-10-18',
    time: '18:30',
    invitationMessage: 'Please join us for a private celebration',
    quranVerse: 'وَإِذَا سَأَلَكَ',
    venueName: 'The Palace',
    locationDescription: 'A serene garden venue',
    parkingInfo: 'Valet available',
    mapsLink: 'https://maps.google.com/?q=The+Palace',
    mapsLat: 30.1,
    mapsLng: 31.2,
    photoGroom: 'groom.png',
    photoBride: 'bride.png',
    engagementStory: 'We met in college',
    engagementPhotos: ['engagement-1.png'],
    menu: [{ name: 'Appetizer', description: 'Citrus salad' }],
    story: 'Our story began in the city',
    howWeMet: 'We met at a rooftop dinner',
    audioUrl: 'https://cdn.example.com/song.mp3',
    audioName: 'The Song',
    audioFull: false,
    trimStart: 12,
    trimEnd: 45,
    timeline: [{ title: 'Ceremony', time: '18:30', description: 'The vows' }],
    sections: { gallery: false, menu: false, rsvp: false },
  });

  assert.equal(payload.names.coupleName, 'Noor & Lina');
  assert.equal(payload.hero.subtitle, 'Please join us for a private celebration');
  assert.equal(payload.gallery.images[0].src, 'engagement-1.png');
  assert.equal(payload.gallery.title, '');
  assert.equal(payload.venue.name, 'The Palace');
  assert.equal(payload.venue.mapUrl, 'https://maps.google.com/?q=The+Palace');
  assert.equal(payload.venue.parkingInfo, 'Valet available');
  assert.equal(payload.menu.items[0].title, 'Appetizer');
  assert.equal(payload.quran.verseArabic, 'وَإِذَا سَأَلَكَ');
  assert.equal(payload.quran.verseTranslation, '');
  assert.equal(payload.quran.surahName, '');
  assert.equal(payload.story.paragraphs[0], 'Our story began in the city');
  assert.equal(payload.engagement.story, 'We met in college');
  assert.equal(payload.engagement.images[0].src, 'engagement-1.png');
  assert.equal(payload.footer.message, 'Please join us for a private celebration');
  assert.equal(payload.invitation.message, 'Please join us for a private celebration');
  assert.equal(payload.sections.gallery, false);
  assert.equal(payload.sections.menu, false);
  assert.equal(payload.sections.rsvp, false);
  assert.equal(payload.music.audioUrl, 'https://cdn.example.com/song.mp3');
  assert.equal(payload.music.audioFull, false);
  assert.equal(payload.music.trimStart, 12);
  assert.equal(payload.music.trimEnd, 45);
  assert.equal(payload.countdown.targetDate, '2026-10-18');
  assert.equal(payload.rsvp.enabled, false);
});
