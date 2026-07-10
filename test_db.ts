import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data } = await supabase.from('bookings').select('id, customer_id, customer:profiles(id, full_name)').limit(1);
  console.log(data);
}
test();
