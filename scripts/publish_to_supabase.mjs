import { serializeInvitationPayload } from '../src/components/dashboard/create/steps/publishSerializer.js';
import { supabaseClient } from '../src/lib/supabaseClient.js';

async function run() {
  const mapsLink = 'https://www.google.com/maps/place/Statue+of+Liberty/@40.6892494,-74.0445004,17z/data=!3m1!4b1!4m5!3m4!1s0x89c250b1b1d5d9ab:0x6c6d6e8f1f1d1e2b';
  const data = {
    groom: 'Auto',
    bride: 'Tester',
    venueName: 'Statue of Liberty',
    mapsLink,
    locationDescription: 'Liberty Island, New York, NY',
    date: '2026-09-01',
    time: '17:00',
    template: 'midnight',
  };

  const slug = 'e2e-test-statue';
  const payload = serializeInvitationPayload(data, slug);

  const { error } = await supabaseClient.from('invitations').upsert({ slug, data: payload, updated_at: new Date().toISOString(), owner_account_id: null });
  if (error) {
    console.error('Supabase upsert failed:', error);
    process.exit(1);
  }
  console.log('Published invitation with slug:', slug);
  console.log('Open URL: http://localhost:5173/?invite=' + encodeURIComponent(slug));
}

run().catch((e) => { console.error(e); process.exit(1); });
