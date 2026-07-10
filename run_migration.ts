import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS page_views_count INTEGER DEFAULT 0;' });
  console.log("page_views_count:", data, error);
}
test();
