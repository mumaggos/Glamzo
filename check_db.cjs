const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabaseAdmin.from('businesses').select('welcome_kit_sent, terminal_sent').limit(1);
  if (error) {
    console.log("DB ERROR:", error.message);
  } else {
    console.log("COLUMNS EXIST!", data);
  }
}
check();
