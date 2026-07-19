import { fetchInvitationBySlug } from '../src/lib/guestApi.js';
const slug = process.argv[2] || 'ahmed-yomna-f6gqr';

try {
  const data = await fetchInvitationBySlug(slug);
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error('ERROR', err && err.message ? err.message : err);
  process.exit(1);
}
