import { createClient } from '@supabase/supabase-js';

const client = createClient(
  'https://nxioldgpigozvrccfzsr.supabase.co',
  'sb_publishable_5WDV-uQyu2WDBzGXq9V-jg_64a3V_ur'
);

// Try to query the actual function definition from information_schema
const { data, error } = await client
  .from('information_schema.routines')
  .select('routine_definition')
  .eq('routine_name', 'upsert_template_price')
  .eq('routine_schema', 'public')
  .single();

if (error) {
  console.error('Error querying information_schema:', error.message);
  process.exit(1);
}

if (!data) {
  console.error('Function not found in database');
  process.exit(1);
}

console.log('=== ACTUAL FUNCTION IN DATABASE ===\n');
console.log(data.routine_definition);
