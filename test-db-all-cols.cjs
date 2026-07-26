require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('businesses').select('name, address, door_number, postal_code, city, phone, email, timezone').limit(1);
  console.log("Cols select result:", error || "Success");
}
test();
