import { supabaseClient } from '../src/lib/supabaseClient.js';

async function run() {
  const slug = 'e2e-test-statue';
  const { data, error } = await supabaseClient.from('invitations').select('data').eq('slug', slug).single();
  if (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }
  console.log(JSON.stringify(data.data, null, 2));
}

run().catch(e => { console.error(e); process.exit(1); });
