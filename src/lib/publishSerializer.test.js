import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeInvitationPayload } from '../components/dashboard/create/steps/publishSerializer.js';
import { getMapsNavigationUrl } from './mapService.js';

test('publish serializer prefers coordinates and exposes structured venue fields', () => {
  const sample = {
    venueName: 'Test Venue',
    mapsLink:
      'https://www.google.com/maps/place/Test+Venue/@30.0444,31.2357,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d30.0444!4d31.2357',
    locationDescription: 'Cairo, Egypt',
  };

  const published = serializeInvitationPayload(sample, 'test-slug');

  // Published mapUrl must use coordinates
  const expectedNav = 'https://www.google.com/maps/search/?api=1&query=30.0444,31.2357';
  assert.equal(published.venue.mapUrl, expectedNav);

  // Structured numeric coordinates must exist
  assert.equal(typeof published.venue.mapLat, 'number');
  assert.equal(typeof published.venue.mapLng, 'number');
  assert.equal(published.latitude, 30.0444);
  assert.equal(published.longitude, 31.2357);

  // Final rendered href from MapService when given published venue should prefer coords
  const finalHref = getMapsNavigationUrl({ venueAddress: published.venue.address, latitude: published.latitude, longitude: published.longitude });
  assert.equal(finalHref, expectedNav);
});
