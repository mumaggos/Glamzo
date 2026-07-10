import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email)').limit(1);
  console.log("biz email:", data, error?.message);
}
test();
