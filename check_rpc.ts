import { supabase } from './src/lib/supabase';

async function check() {
  const { data, error } = await supabase.rpc('get_explore_shops_with_analytics');
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data ? data[0] : null, null, 2));
}

check();
