import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('businesses').select('metadata').limit(1);
  console.log("metadata error:", error);
}
test();
