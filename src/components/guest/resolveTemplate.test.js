import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveGuestTemplate } from './resolveTemplate.js';

test('prefers an explicit aurora template', () => {
  assert.equal(resolveGuestTemplate({ template: 'aurora' }), 'aurora');
});

test('detects aurora from nested builder config', () => {
  assert.equal(resolveGuestTemplate({ templateConfig: { template: 'aurora' } }), 'aurora');
});

test('falls back to the shared layout for non-aurora content', () => {
  assert.equal(resolveGuestTemplate({ template: 'midnight' }), 'midnight');
});
