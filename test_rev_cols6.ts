import { supabase } from './src/lib/supabase.ts';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Try with anon key, need to be logged in, or try with service role to see if it bypasses RLS
const adminSupa = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function test() {
  const tryInsert = async (payload: any) => {
    const { error } = await adminSupa.from('reviews').insert(payload);
    console.log("Admin tried", Object.keys(payload), "Error:", error?.message);
  }
  
  await tryInsert({ business_id: '123e4567-e89b-12d3-a456-426614174000', customer_id: '123e4567-e89b-12d3-a456-426614174000', rating: 5, comment: 'test', service_name: 'test' });
}
test();
