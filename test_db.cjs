const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  console.log('Businesses:', error ? error : 'success');
  
  const { data: rev, error: revError } = await supabase.from('reviews').select('*').limit(1);
  console.log('Reviews:', revError ? revError : 'success');
}
test();
