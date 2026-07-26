require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data: b } = await supabase.from('businesses').select('id').limit(1);
  if(b && b.length > 0){
    const { error } = await supabase.from('businesses').update({timezone: 'Europe/Lisbon', currency: 'EUR', door_number: '123'}).eq('id', b[0].id);
    console.log(error);
  }
}
test();
