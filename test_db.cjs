const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('businesses').select('id, name, status, subscription_status, trial_ends_at');
  if (error) console.error(error);
  console.log(data);
}

test();
