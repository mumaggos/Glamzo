import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

const formatDateFn = `
      const formatDateStr = (d: Date) => {
         const yyyy = d.getFullYear();
         const mm = String(d.getMonth() + 1).padStart(2, '0');
         const dd = String(d.getDate()).padStart(2, '0');
         return \`\${yyyy}-\${mm}-\${dd}\`;
      }
`;

code = code.replace(
  'const startStr = startDate.toISOString();',
  formatDateFn + '\n      const startStr = startDate.toISOString();'
);

code = code.replace(
  /\.eq\("booking_status", "completed"\)\.gte\("booking_date", startDate\.toISOString\(\)\.split\("T"\)\[0\]\)\.lte\("booking_date", endDate\.toISOString\(\)\.split\("T"\)\[0\]\)/g,
  '.gte("booking_date", formatDateStr(startDate)).lte("booking_date", formatDateStr(endDate))'
);

// update localCompleted filtering
code = code.replace(
  /const localCompleted = \(bkData \|\| \[\]\)\.filter\(b => b\.total_price > 0 && b\.payment_method === 'local'/g,
  "const localCompleted = (bkData || []).filter(b => b.total_price > 0 && b.payment_method === 'local' && (b.booking_status === 'completed' || b.booking_status === 'confirmed')"
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
