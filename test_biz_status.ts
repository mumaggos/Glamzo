import { getSupabaseAdmin } from './src/lib/supabase';

async function test() {
  const { data } = await getSupabaseAdmin()
    .from('businesses')
    .select('id, name, slug, status, public_page_enabled')
    .limit(5);
  console.log(data);
}
test();
