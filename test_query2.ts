import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('bookings').select('id, customer_id, customer_profile:profiles(id, full_name)').limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
