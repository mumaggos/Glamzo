import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

// Fix 1: Add price to service select
code = code.replace(
  /service:services\(id, name, target_gender\)/g,
  'service:services(id, name, target_gender, price)'
);

// Fix 2 & 3: Modify localCompleted mapping
code = code.replace(
  /return fallbackPrice > 0 && isLocal && \(b\.booking_status === 'completed' \|\| b\.booking_status === 'confirmed'\) && !stripePaymentBookingIds\.has\(b\.id\);/g,
  "return fallbackPrice >= 0 && isLocal && (b.booking_status === 'completed' || b.booking_status === 'confirmed') && !stripePaymentBookingIds.has(b.id);"
);

code = code.replace(
  /created_at: b\.booking_date \+ "T12:00:00Z",/g,
  'created_at: b.booking_date ? b.booking_date + "T12:00:00Z" : b.created_at,'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
