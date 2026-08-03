const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  let { data, error } = await supabase.from('services').select('*').limit(1);
  console.log("Services Error:", error);
  let { data: d2, error: e2 } = await supabase.from('business_services').select('*').limit(1);
  console.log("business_services Error:", e2);
}
main();
