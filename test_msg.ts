import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { error } = await supabase.from('messages').insert({
    business_id: '123e4567-e89b-12d3-a456-426614174000',
    customer_id: '123e4567-e89b-12d3-a456-426614174000',
    sender: 'customer',
    content: 'test'
  });
  console.log("msg error:", error);
}
test();
