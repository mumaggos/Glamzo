const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  if (data && data.length > 0) {
      console.log('Keys:', Object.keys(data[0]));
  }
}
main();
