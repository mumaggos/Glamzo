import fs from 'fs';
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf-8');

code = code.replace(
  /const filteredRevenue = filteredBookingsList\.reduce\(\(sum, b\) => \{[\s\S]*?return sum;\n\s*\}, 0\);/m,
  `const filteredRevenue = filteredBookingsList.reduce((sum, b) => {
    const isPaidOnline = b.payment_status === 'paid';
    const isCompletedLocal = b.payment_method === 'local' && (b.booking_status === 'completed' || b.booking_status === 'confirmed');
    if (isPaidOnline || isCompletedLocal) {
      return sum + (Number(b.total_price || 0));
    }
    return sum;
  }, 0);`
);

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
