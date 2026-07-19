import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePreviewDraftData } from './previewDraft.js';

test('prefers custom event detail over storage fallback', () => {
  const storage = {
    getItem: () => JSON.stringify({ groom: 'Aly', bride: 'Mina' }),
  };

  const eventDetail = { groom: 'Noor', bride: 'Lina', template: 'aurora' };

  assert.deepEqual(resolvePreviewDraftData(storage, eventDetail, null), eventDetail);
});

test('parses draft payload from storage when no event detail is present', () => {
  const storage = {
    getItem: () => JSON.stringify({ groom: 'Aly', bride: 'Mina', date: '2026-10-18' }),
  };

  assert.deepEqual(resolvePreviewDraftData(storage), {
    groom: 'Aly',
    bride: 'Mina',
    date: '2026-10-18',
  });
});
