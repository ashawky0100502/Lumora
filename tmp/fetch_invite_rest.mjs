const SUPABASE_URL = 'https://nxioldgpigozvrccfzsr.supabase.co';
const ANON_KEY = 'sb_publishable_5WDV-uQyu2WDBzGXq9V-jg_64a3V_ur';
const slug = process.argv[2] || 'ahmed-yomna-f6gqr';

const url = `${SUPABASE_URL}/rest/v1/invitations?slug=eq.${encodeURIComponent(slug)}&select=data`;

try {
  const res = await fetch(url, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    console.error('HTTP error', res.status, await res.text());
    process.exit(1);
  }
  const rows = await res.json();
  if (!rows || rows.length === 0) {
    console.log('not-found');
    process.exit(0);
  }
  // rows is array of objects with data field
  const data = rows[0].data;
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error('ERROR', err && err.message ? err.message : err);
  process.exit(1);
}
