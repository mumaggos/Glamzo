import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('payments').select('*').limit(1);
  console.log("payments:", error?.message);
}
test();
