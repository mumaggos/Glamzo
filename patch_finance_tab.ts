import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'supabase.from("bookings").select("id, created_at, total_price, payment_method, booking_status, staff_id")',
  'supabase.from("bookings").select("id, created_at, total_price, payment_method, booking_status, staff_id, customer_id, customer_profile:profiles(id, full_name, email)")'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
console.log("Patched bindings for customer profile in FinanceTab");
