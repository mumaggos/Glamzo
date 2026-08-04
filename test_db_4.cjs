const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, role');
  console.log(profiles);
}

test();
