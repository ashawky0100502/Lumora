const { fetchInvitationBySlug } = require('../src/lib/guestApi');
const slug = process.argv[2] || 'ahmed-yomna-f6gqr';

fetchInvitationBySlug(slug)
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  });
