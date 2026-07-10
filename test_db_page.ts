import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('businesses').select('page_views_count').limit(1);
  console.log("page_views_count error:", error);
}
test();
