const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data: user } = await supabase.from('profiles').select('id').limit(1).single();
  const { data: biz } = await supabase.from('businesses').select('id').limit(1).single();
  console.log(user, biz);
  if (user && biz) {
    const { error } = await supabase.from('affiliate_referrals').insert({ referrer_id: user.id, referred_business_id: biz.id, status: 'pending' });
    console.log('insert error:', error);
  }
}
test();
