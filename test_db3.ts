import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('business_stats').select('*').limit(1);
  console.log("business_stats:", data, error);
}
test();
