const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY); // Or just use the anon key if RLS allows
async function main() {
  const { data, error } = await supabase.from('businesses').select('id, name, status, subscription_status, subscription_active');
  console.log("Biz Error:", error);
  console.log("Biz Data:", data);
}
main();
