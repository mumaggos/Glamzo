const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('businesses').select('*').limit(3);
  console.log('Error:', error);
  console.log('Data:', data ? data.length : 0);
  if (data && data.length > 0) {
      console.log('Sample:', data[0].is_active);
  }
}
main();
