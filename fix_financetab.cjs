const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

code = code.replace(
  'staff:staff(id, full_name)), original_service_price, discount_applied"',
  'staff:staff(id, full_name), original_service_price, discount_applied)"'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
