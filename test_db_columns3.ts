import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('businesses').select('qr_scans').limit(1);
  console.log("Error:", error);
}
test();
