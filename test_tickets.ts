import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('support_tickets').select('*').limit(1);
  console.log("tickets:", error?.message);
}
test();
