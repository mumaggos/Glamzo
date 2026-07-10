import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'supabase.from("bookings").select("id, created_at, total_price, payment_method, booking_status, staff_id, customer_id, customer_profile:profiles(id, full_name, email)")',
  'supabase.from("bookings").select("id, created_at, total_price, payment_method, booking_status, staff_id, customer_id, customer_profile:profiles(id, full_name, email), service:services(id, name, target_gender), staff:staff(id, name)")'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
console.log("Patched bindings for service and staff in FinanceTab");
