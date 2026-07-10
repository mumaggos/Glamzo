import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'supabase.from("bookings").select("id, created_at, total_price, payment_method, booking_status, staff_id, customer_id, customer_profile:profiles(id, full_name, email), service:services(id, name, target_gender), staff:staff(id, name)").eq("business_id", business.id).eq("booking_status", "completed").gte("created_at", startStr).lte("created_at", endStr)',
  'supabase.from("bookings").select("id, created_at, booking_date, total_price, payment_method, booking_status, staff_id, customer_id, customer_profile:profiles(id, full_name, email), service:services(id, name, target_gender), staff:staff(id, name)").eq("business_id", business.id).eq("booking_status", "completed").gte("booking_date", startDate.toISOString().split("T")[0]).lte("booking_date", endDate.toISOString().split("T")[0])'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
console.log("Patched bookings date query in FinanceTab");
