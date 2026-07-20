const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('affiliate_referrals').select('*, business:businesses(name)').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
