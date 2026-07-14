import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('businesses').select('profiles!businesses_owner_id_fkey(last_active)').limit(1);
  console.log("Data:", data, "Error:", error);
}
test();
