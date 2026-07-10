import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data } = await supabase.from('businesses').select('page_views, qr_scans').limit(1);
  console.log(data);
}
test();
