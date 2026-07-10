import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    // If empty, insert a dummy without booking_id to see what fails
    const { error: err } = await supabase.from('reviews').insert({ rating: 5, business_id: '123e4567-e89b-12d3-a456-426614174000', customer_id: '123e4567-e89b-12d3-a456-426614174000', comment: 'a' });
    console.log("Insert error:", err);
  }
}
test();
