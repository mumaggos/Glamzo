import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('businesses').select('qr_scans_count').limit(1);
  console.log("qr_scans_count error:", error);
}
test();
