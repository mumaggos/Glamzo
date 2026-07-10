import fs from 'fs';
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf-8');

code = code.replace(
  /const isCompletedLocal = b\.payment_method === 'local' && \(b\.booking_status === 'completed' \|\| b\.booking_status === 'confirmed'\);/g,
  "const isCompletedLocal = (b.payment_method === 'local' || !b.payment_method) && (b.booking_status === 'completed' || b.booking_status === 'confirmed');"
);

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
