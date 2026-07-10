import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('bookings').select('id, customer_id, profiles(id, full_name)').limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
