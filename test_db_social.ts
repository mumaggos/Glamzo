import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('businesses').select('social_links').limit(1);
  console.log("social_links error:", error);
}
test();
