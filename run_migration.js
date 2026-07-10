import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  let { data, error } = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;' });
  console.log("page_views:", data, error);
  let res2 = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS qr_scans INTEGER DEFAULT 0;' });
  console.log("qr_scans:", res2.data, res2.error);
}
run();
