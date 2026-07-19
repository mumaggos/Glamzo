import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('businesses').select('id, name, email, selected_plan, tablet_requested, subscription_status').in('email', ['rubencoval2021@gmail.com', 'glamzo.info@gmail.com']);
  console.log(JSON.stringify(data, null, 2));
}
run();
