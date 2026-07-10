import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'staff:staff(id, name)',
  'staff:staff(id, full_name)'
);
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
