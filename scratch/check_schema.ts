import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdlgoalpjnefhvdgdisl.supabase.co';
const supabaseKey = 'sb_publishable_k6q41JIzuwPSzy5b5VTk3g_FNA6mapI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('--- DB SCHEMA CHECK ---');
  try {
    const { data, error } = await supabase.from('events').select('*').limit(1);
    if (error) {
      console.error('Error fetching event:', error);
    } else if (data && data.length > 0) {
      console.log('Event Keys:', Object.keys(data[0]));
    } else {
      console.log('No events found to check keys.');
    }
  } catch (e) {
    console.error('Catch error:', e);
  }
}

checkSchema();
