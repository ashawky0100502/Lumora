import assert from 'node:assert/strict';
import { normalizeInvitationData } from './invitationDataAdapter.js';

const data = normalizeInvitationData({
  story: { text: 'Our story text' },
  engagement: { story: 'We met in college' },
});

assert.equal(data.story.text, 'Our story text');
assert.equal(data.howWeMet, 'Our story text');
assert.equal(data.lifeStory, 'Our story text');
assert.equal(data.engagementStory, 'We met in college');
assert.equal(data.brideStory, undefined);
assert.equal(data.groomStory, undefined);

const dataWithLetters = normalizeInvitationData({
  letterBride: 'Bride letter',
  bioGroom: 'Groom bio',
});

assert.equal(dataWithLetters.brideStory, 'Bride letter');
assert.equal(dataWithLetters.groomStory, 'Groom bio');

console.log('guestApi normalization tests passed');
