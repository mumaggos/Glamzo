const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k] = v;
});

const supabase = createClient(
  env['VITE_SUPABASE_URL'],
  env['VITE_SUPABASE_ANON_KEY']
);

async function test() {
  console.log("URL:", env['VITE_SUPABASE_URL']);
  console.log("Key length:", env['VITE_SUPABASE_ANON_KEY']?.length);
  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  console.log('Businesses:', error ? error : 'success');
}
test();
