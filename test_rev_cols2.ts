import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  console.log("error:", error);
}
test();
