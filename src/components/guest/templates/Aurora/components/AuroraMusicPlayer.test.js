import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePlaybackBounds } from '../lib/musicPlayback.js';

test('resolvePlaybackBounds uses the builder trim window', () => {
  assert.deepEqual(resolvePlaybackBounds(120, false, 25, 75), { start: 30, end: 90 });
});

test('resolvePlaybackBounds keeps full-track playback when audioFull is enabled', () => {
  assert.deepEqual(resolvePlaybackBounds(120, true, 25, 75), { start: 0, end: null });
});
