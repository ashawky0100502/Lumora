import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeInvitationPayload } from './publishSerializer.js';

test('serializes builder fields into runtime payload sections', () => {
  const payload = serializeInvitationPayload({
    groom: 'Ahmed',
    bride: 'Nadeen',
    date: '2027-10-20',
    time: '20:00',
    story: 'Our story',
    menu: [{ name: 'Cake', category: 'Dessert' }],
    venueName: 'Legend Hall',
    locationDescription: 'A lovely place',
    mapsLink: 'https://maps.example',
    mapsLat: 1.2,
    mapsLng: 3.4,
    timeline: [{ title: 'Ceremony', time: '18:00', description: 'Starts' }],
    quranVerse: 'Peace',
    quranVerseArabic: 'سلام',
    quranVerseTranslation: 'Peace',
    quranSurahName: 'Al-Fatiha',
    sections: { rsvp: true },
    template: 'aurora',
  }, 'demo-slug');

  assert.equal(payload.template, 'aurora');
  assert.equal(payload.story, 'Our story');
  assert.equal(payload.menu[0].name, 'Cake');
  assert.equal(payload.gallery.images.length, 0);
  assert.equal(payload.venue.name, 'Legend Hall');
  assert.equal(payload.timeline.events[0].title, 'Ceremony');
  assert.equal(payload.quran.verse, 'Peace');
  assert.equal(payload.countdown.targetDate, '2027-10-20');
  assert.equal(payload.rsvp.enabled, true);
});
