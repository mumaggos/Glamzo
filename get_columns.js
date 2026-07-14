import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.rpc('get_columns', { table_name: 'messages' });
  console.log(data, error);
}
test();
