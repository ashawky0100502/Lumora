import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRenderAuroraRsvp } from './rsvpVisibility.js';

test('does not render RSVP when the section is disabled in payload', () => {
  assert.equal(shouldRenderAuroraRsvp({ sections: { rsvp: false } }, 'preview-slug'), false);
});

test('renders RSVP in preview mode even when no slug is available', () => {
  assert.equal(shouldRenderAuroraRsvp({}, undefined), true);
});
