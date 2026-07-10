import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  /const localCompleted = \(bkData \|\| \[\]\)\.filter\(b => b\.total_price > 0 &&/g,
  `const localCompleted = (bkData || []).filter(b => Number(b.total_price || (b.service as any)?.price || 0) > 0 &&`
);

code = code.replace(
  /amount_total: b\.total_price,/g,
  `amount_total: Number(b.total_price || (b.service as any)?.price || 0),`
);

code = code.replace(
  /amount: b\.total_price,/g,
  `amount: Number(b.total_price || (b.service as any)?.price || 0),`
);

code = code.replace(
  /business_amount: b\.total_price,/g,
  `business_amount: Number(b.total_price || (b.service as any)?.price || 0),`
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
