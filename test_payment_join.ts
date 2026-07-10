import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'supabase.from("payments").select("*").eq("business_id", business.id).gte("created_at", startStr).lte("created_at", endStr)',
  'supabase.from("payments").select("*, booking:bookings(*)").eq("business_id", business.id).gte("created_at", startStr).lte("created_at", endStr)'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
