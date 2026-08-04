const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('businesses').insert({ name: 'Test Schema Default', owner_id: 'cb0a78db-f0fb-4d3d-b11d-46be16415ed0' }).select('subscription_status').single();
  if (error) console.error(error);
  console.log(data);
  if(data) {
     await supabase.from('businesses').delete().eq('id', data.id);
  }
}

test();
