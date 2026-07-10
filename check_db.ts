import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');

async function run() {
  const { data: bData } = await supabase.from('businesses').select('id, name').limit(1);
  if (!bData || bData.length === 0) return console.log("No business");
  
  const bId = bData[0].id;
  console.log("Business:", bData[0].name, bId);
  
  const { data: bkData, error } = await supabase.from("bookings").select("id, total_price, payment_method, booking_status").eq("business_id", bId);
  console.log("Bookings:", bkData, error);
}
run();
