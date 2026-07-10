import fs from 'fs';
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf-8');

code = code.replace(
  /return sum \+ \(Number\(b\.total_price \|\| 0\)\);/g,
  `return sum + Number(b.total_price || (b.service as any)?.price || 0);`
);

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
