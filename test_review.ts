import { supabase } from './src/lib/supabase.ts';
import crypto from 'crypto';

async function test() {
  const { data, error } = await supabase.from('reviews').insert({
    booking_id: crypto.randomUUID(),
    business_id: '123e4567-e89b-12d3-a456-426614174000',
    customer_id: '123e4567-e89b-12d3-a456-426614174000',
    customer_name: 'test',
    rating: 5,
    comment: 'test',
    service_id: crypto.randomUUID(),
    service_name: 'test'
  });
  console.log("error:", error);
}
test();
