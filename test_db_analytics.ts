import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('analytics').select('*').limit(1);
  console.log("analytics error:", error);
}
test();
