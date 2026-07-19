import test from 'node:test';
import assert from 'node:assert/strict';
import { getMapsNavigationUrl, getNavigationUrl, normalizeVenueData } from './mapService.js';

test('builds latitude/longitude navigation links from Google Maps coordinates', () => {
  const url = getNavigationUrl({
    mapsLink: 'https://www.google.com/maps/place/Grand+Hotel/@40.7484,-73.9857,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d40.7484!4d-73.9857',
  });

  assert.equal(url, 'https://www.google.com/maps/search/?api=1&query=40.7484,-73.9857');
});

test('uses encoded address when coordinates are absent', () => {
  const url = getNavigationUrl({
    mapsLink: 'https://www.google.com/maps/search/?api=1&query=%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%20%D8%A7%D9%84%D9%85%D9%84%D9%8A%D8%A9',
  });

  assert.equal(url, 'https://www.google.com/maps/search/?api=1&query=%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%20%D8%A7%D9%84%D9%85%D9%84%D9%8A%D8%A9');
});

test('normalizes structured venue data without relying on the raw URL', () => {
  const data = normalizeVenueData({
    venueName: 'The Diamond Hall',
    venueAddress: 'Cairo, Egypt',
    latitude: 30.0444,
    longitude: 31.2357,
    googlePlaceId: 'ChIJexample',
  });

  assert.equal(data.venueName, 'The Diamond Hall');
  assert.equal(data.venueAddress, 'Cairo, Egypt');
  assert.equal(data.latitude, 30.0444);
  assert.equal(data.longitude, 31.2357);
  assert.equal(data.googlePlaceId, 'ChIJexample');
});

test('prefers a geo intent URI on Android so the Maps app opens the venue directly', () => {
  const originalNavigator = globalThis.navigator;
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Mozilla/5.0 (Linux; Android 14)' },
    configurable: true,
    writable: true,
  });

  try {
    const url = getMapsNavigationUrl({
      venueAddress: 'Cairo, Egypt',
    });

    assert.equal(url, 'geo:0,0?q=Cairo%2C%20Egypt');
  } finally {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  }
});
