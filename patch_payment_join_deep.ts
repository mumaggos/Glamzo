import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'supabase.from("payments").select("*, booking:bookings(*)").eq("business_id", business.id).gte("created_at", startStr).lte("created_at", endStr)',
  'supabase.from("payments").select("*, booking:bookings(id, created_at, booking_date, total_price, payment_method, booking_status, staff_id, customer_id, profiles!bookings_customer_id_fkey(id, full_name, email), service:services(id, name, target_gender), staff:staff(id, full_name))").eq("business_id", business.id).gte("created_at", startStr).lte("created_at", endStr)'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
