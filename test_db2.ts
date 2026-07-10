import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('page_views').select('*').limit(1);
  console.log("page_views:", data, error);
}
test();
