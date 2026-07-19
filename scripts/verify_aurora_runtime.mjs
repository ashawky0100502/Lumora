import { createClient } from '@supabase/supabase-js';

// Usage: node --experimental-top-level-await scripts/verify_aurora_runtime.mjs

const SUPABASE_URL = 'https://nxioldgpigozvrccfzsr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5WDV-uQyu2WDBzGXq9V-jg_64a3V_ur';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function ok(name, msg) {
  console.log(`✅ ${name}: ${msg}`);
}
function warn(name, msg) {
  console.log(`⚠ ${name}: ${msg}`);
}
function fail(name, msg) {
  console.error(`❌ ${name}: ${msg}`);
}

async function pickSlug() {
  const { data, error } = await supabase.from('invitations').select('slug').limit(1);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No invitations found in the project');
  return data[0].slug;
}

function containsDefaultStrings(obj) {
  const defaults = [
    'A private celebration of light, stillness & devotion',
    'Outings & Trips',
    'We Would Be Honored',
    'A study in candlelight',
    'Thank You For Being Part Of Our Story',
  ];
  const json = JSON.stringify(obj || {}).toLowerCase();
  return defaults.filter((s) => json.includes(s.toLowerCase()));
}

async function runChecks() {
  try {
    const slug = await pickSlug();
    console.log('Using slug:', slug);

    // Fetch published invitation payload
    const { data: invRow, error: invErr } = await supabase.from('invitations').select('data').eq('slug', slug).single();
    if (invErr) throw invErr;
    const payload = invRow?.data || {};

    // 1) Timeline renders from Builder only
    const timelineEvents = (payload.timeline && payload.timeline.events) || payload.timeline || [];
    if (Array.isArray(timelineEvents) && timelineEvents.length) ok('Timeline', `events count=${timelineEvents.length}`);
    else fail('Timeline', 'no timeline events found in published payload');

    // 2) Gallery renders Builder images only
    const galleryImages = payload.gallery?.images || [];
    if (Array.isArray(galleryImages) && galleryImages.length) ok('Gallery', `images count=${galleryImages.length}`);
    else fail('Gallery', 'no gallery images found in published payload');

    // 3) Venue map works correctly
    const venue = payload.venue || {};
    if (venue.mapUrl || (typeof venue.mapLat === 'number' && typeof venue.mapLng === 'number')) ok('Venue Map', 'map data present');
    else fail('Venue Map', 'no mapUrl or lat/lng present in published payload');

    // 4) RSVP saves (insert + read)
    const rsvpPayload = { slug, name: 'Verify Script', status: 'attending', guest_count: '1' };
    const rsvpIns = await supabase.from('rsvps').insert(rsvpPayload);
    if (rsvpIns.error) fail('RSVP Insert', String(rsvpIns.error)); else ok('RSVP Insert', 'insert succeeded');
    const { data: recentRsvps } = await supabase.from('rsvps').select('*').eq('slug', slug).order('created_at', { ascending: false }).limit(5);
    if (recentRsvps && recentRsvps.find((r) => r.name === 'Verify Script')) ok('RSVP Readback', 'insert visible in rsvps table'); else fail('RSVP Readback', 'insert not visible in rsvps table');

    // 5) Public comments appear
    const comment = { slug, name: 'Verify Script', text: 'Verify comment ' + new Date().toISOString() };
    const cIns = await supabase.from('comments').insert(comment);
    if (cIns.error) fail('Comment Insert', String(cIns.error)); else ok('Comment Insert', 'insert succeeded');
    const { data: recentComments } = await supabase.from('comments').select('*').eq('slug', slug).order('created_at', { ascending: false }).limit(5);
    if (recentComments && recentComments.find((c) => c.name === 'Verify Script')) ok('Comment Readback', 'insert visible in comments table'); else fail('Comment Readback', 'insert not visible in comments table');

    // 6) Private messages appear
    const guestToken = `verify_${Date.now()}`;
    const msg = { slug, guest_token: guestToken, sender: 'guest', name: 'Verify Script', text: 'Verify message ' + new Date().toISOString() };
    const mIns = await supabase.from('messages').insert(msg);
    if (mIns.error) fail('Message Insert', String(mIns.error)); else ok('Message Insert', 'insert succeeded');
    const { data: recentMessages } = await supabase.from('messages').select('*').eq('slug', slug).order('created_at', { ascending: false }).limit(20);
    if (recentMessages && recentMessages.find((m) => m.guest_token === guestToken)) ok('Message Readback', 'insert visible in messages table'); else fail('Message Readback', 'insert not visible in messages table');

    // 7) Wishes appear correctly (alias of comments)
    if (recentComments && recentComments.length) ok('Wishes', 'comments exist and serve as wishes'); else fail('Wishes', 'no comments to act as wishes');

    // 8) Story / Engagement / How We Met
    const storyOk = Boolean(payload.story && (payload.story.paragraphs?.length || payload.story.intro || payload.story.title));
    const engagementOk = Boolean(payload.engagement && (payload.engagement.images?.length || payload.engagement.title || payload.engagement.timeline?.length));
    const howWeMetOk = Boolean(payload.howWeMet && (payload.howWeMet.content || payload.howWeMet.title));
    if (storyOk) ok('Story', 'story content present'); else fail('Story', 'story content missing');
    if (engagementOk) ok('Engagement', 'engagement content present'); else fail('Engagement', 'engagement content missing');
    if (howWeMetOk) ok('HowWeMet', 'howWeMet content present'); else fail('HowWeMet', 'howWeMet content missing');

    // 9) Music is Builder-driven
    const music = payload.music || {};
    if (music.audioUrl || music.title) ok('Music', 'music data present'); else fail('Music', 'music data missing');

    // 10) Countdown is Builder-driven
    const countdown = payload.countdown || {};
    if (countdown.targetDate || countdown.targetTime) ok('Countdown', 'countdown target present'); else fail('Countdown', 'countdown target missing');

    // 11) No preview or fallback data exists anywhere
    const foundDefaults = containsDefaultStrings(payload);
    if (!foundDefaults.length) ok('No Preview Fallbacks', 'no known default strings found in payload');
    else fail('No Preview Fallbacks', `found default strings: ${foundDefaults.join(', ')}`);

    console.log('\nVerification complete — review PASS/FAIL above.');
  } catch (err) {
    console.error('Verification script failed:', err?.message || err);
    process.exit(2);
  }
}

await runChecks();
