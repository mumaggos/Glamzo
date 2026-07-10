import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('business_metrics').select('*').limit(1);
  console.log("Error:", error);
}
test();
