import { createClient } from '@supabase/supabase-js';

// Kept identical to the original Lumora build — same project, same public key.
const SUPABASE_URL = 'https://nxioldgpigozvrccfzsr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5WDV-uQyu2WDBzGXq9V-jg_64a3V_ur';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
