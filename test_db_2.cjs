const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, role, business_id').eq('email', 'glamzo.suporte@gmail.com');
  if (error) console.error(error);
  console.log(data);
}

test();
