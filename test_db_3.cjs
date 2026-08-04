const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, role').eq('email', 'glamzo.suporte@gmail.com');
  console.log(profiles);
  if(profiles && profiles.length > 0) {
    const { data: staff } = await supabase.from('business_staff').select('business_id, businesses(name)').eq('profile_id', profiles[0].id);
    console.log(staff);
  }
}

test();
