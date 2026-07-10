import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  if (data) {
    console.log(Object.keys(data[0]));
  }
}
test();
