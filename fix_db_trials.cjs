const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fix() {
  const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from('businesses')
    .update({ trial_ends_at: futureDate })
    .is('trial_ends_at', null)
    .eq('subscription_status', 'trialing')
    .select('id, name');
    
  if (error) console.error(error);
  console.log("Updated businesses:", data);
}

fix();
