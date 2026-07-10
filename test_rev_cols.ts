import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (data) console.log("Reviews columns:", Object.keys(data[0]));
}
test();
