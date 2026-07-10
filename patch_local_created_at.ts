import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'id: `loc_${b.id}`,\n        created_at: b.created_at,',
  'id: `loc_${b.id}`,\n        created_at: b.booking_date + "T12:00:00Z", // Use booking_date as the revenue date for local payments'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
