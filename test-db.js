import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('businesses').select('selected_plan, tablet_requested');
  const plans = new Set(data.map(d => d.selected_plan));
  console.log("Unique selected_plan values:", Array.from(plans));
}
run();
