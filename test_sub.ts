import { supabase } from './src/lib/supabase';

async function test() {
  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  console.log('Businesses:', error ? error : 'success');
}
test();
