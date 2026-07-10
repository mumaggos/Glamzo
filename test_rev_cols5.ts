import { supabase } from './src/lib/supabase.ts';
async function test() {
  const tryInsert = async (payload: any) => {
    const { error } = await supabase.from('reviews').insert(payload);
    console.log("Tried", Object.keys(payload), "Error:", error?.message);
  }
  
  await tryInsert({ business_id: '123e4567-e89b-12d3-a456-426614174000', user_id: '123e4567-e89b-12d3-a456-426614174000' });
  await tryInsert({ business_id: '123e4567-e89b-12d3-a456-426614174000', customer_id: '123e4567-e89b-12d3-a456-426614174000' });
}
test();
