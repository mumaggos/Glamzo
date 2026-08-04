const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.from('businesses').select('id, name, status, subscription_status, subscription_active, stripe_customer_id, public_page_enabled');
  console.log("Biz Data:", data);
}
main();
