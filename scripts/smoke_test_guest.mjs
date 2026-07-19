import { createClient } from '@supabase/supabase-js';

// Uses the same public project as the app. Run with: node --experimental-top-level-await scripts/smoke_test_guest.mjs

const SUPABASE_URL = 'https://nxioldgpigozvrccfzsr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5WDV-uQyu2WDBzGXq9V-jg_64a3V_ur';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function pickSlug() {
  const { data, error } = await supabase.from('invitations').select('slug').limit(1);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No invitations found in the project');
  return data[0].slug;
}

async function run() {
  try {
    const slug = await pickSlug();
    console.log('Using slug:', slug);

    // 1) Submit RSVP
    const rsvpPayload = { slug, name: 'Smoke Tester', status: 'accepted', guest_count: '2' };
    console.log('Inserting RSVP...', rsvpPayload);
    let res = await supabase.from('rsvps').insert(rsvpPayload);
    console.log('RSVP result:', res.error || 'OK');

    // 2) Post a public comment
    const comment = { slug, name: 'Smoke Tester', text: 'Automated smoke test comment ' + new Date().toISOString() };
    console.log('Posting comment...', comment.text);
    res = await supabase.from('comments').insert(comment);
    console.log('Comment result:', res.error || 'OK');

    // 3) Send a private guest message (will use a random guest_token)
    const guestToken = `smoke_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const msg = { slug, guest_token: guestToken, sender: 'guest', name: 'Smoke Tester', text: 'Smoke test message ' + new Date().toISOString() };
    console.log('Inserting private message...', msg.text);
    res = await supabase.from('messages').insert(msg);
    console.log('Message result:', res.error || 'OK');

    // 4) Read back recent RSVPs, comments, messages for this slug
    const { data: rsvps } = await supabase.from('rsvps').select('*').eq('slug', slug).order('created_at', { ascending: false }).limit(5);
    const { data: comments } = await supabase.from('comments').select('*').eq('slug', slug).order('created_at', { ascending: false }).limit(5);
    const { data: messages } = await supabase.from('messages').select('*').eq('slug', slug).order('created_at', { ascending: false }).limit(10);

    console.log('Latest RSVPs:', rsvps && rsvps.slice(0,3));
    console.log('Latest Comments:', comments && comments.slice(0,3));
    console.log('Latest Messages (by guest_token):', messages && messages.filter(m => m.guest_token === guestToken));

    console.log('\nSmoke test finished. If inserts succeeded and reads show the new rows, backend is accepting writes.');
  } catch (err) {
    console.error('Smoke test failed:', err.message || err);
    process.exit(1);
  }
}

run();
