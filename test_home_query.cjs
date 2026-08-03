const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.from('businesses').select(`
    *,
    services (
      id, name, price, duration, category, discount_price, price_promotion, is_active
    )
  `);
  console.log("Services rel Error:", error);
  const { data: d2, error: e2 } = await supabase.from('businesses').select(`
    *,
    business_services (
      id
    )
  `);
  console.log("business_services rel Error:", e2);
}
main();
