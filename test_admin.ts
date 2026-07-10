import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  let { data, error } = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS page_views_count INTEGER DEFAULT 0;' });
  console.log("page_views_count:", data, error);
}
run();
