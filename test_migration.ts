import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;' });
  console.log("page_views:", data, error);
  const res2 = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS qr_scans INTEGER DEFAULT 0;' });
  console.log("qr_scans:", res2.data, res2.error);
}
test();
