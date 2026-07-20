import test from 'node:test';
import assert from 'node:assert/strict';
import { orderGuestbookComments, setCommentFeatureOverride } from './commentFeatures.js';

const storage = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem(key) {
      return storage[key] ?? null;
    },
    setItem(key, value) {
      storage[key] = String(value);
    },
    removeItem(key) {
      delete storage[key];
    },
  },
  configurable: true,
});

test('orders pinned comments first without duplicating them', () => {
  const comments = [
    { id: 'one', created_at: '2024-01-01T00:00:00.000Z' },
    { id: 'two', created_at: '2024-01-02T00:00:00.000Z', pinned_at: '2024-01-03T00:00:00.000Z' },
    { id: 'three', created_at: '2024-01-03T00:00:00.000Z' },
  ];

  const ordered = orderGuestbookComments(comments);

  assert.deepEqual(ordered.map((comment) => comment.id), ['two', 'three', 'one']);
  assert.equal(ordered.filter((comment) => comment.id === 'two').length, 1);
});

test('uses local feature overrides for pinned state', () => {
  const comments = [
    { id: 'alpha', created_at: '2024-01-01T00:00:00.000Z' },
    { id: 'beta', created_at: '2024-01-02T00:00:00.000Z' },
  ];

  setCommentFeatureOverride('alpha', { pinned_at: '2024-01-03T00:00:00.000Z' });
  const ordered = orderGuestbookComments(comments);

  assert.deepEqual(ordered.map((comment) => comment.id), ['alpha', 'beta']);
});
