import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'service:services(id, name, target_gender, price)',
  'service:services(id, name, price)'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
