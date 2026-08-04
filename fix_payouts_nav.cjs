const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/PayoutsHistoryTab.tsx', 'utf8');

code = code.replace(
  '<div className="space-y-6">',
  '<div className="space-y-6 max-w-5xl mx-auto py-6">\n      <FinanceNav />'
);

fs.writeFileSync('src/pages/partner/tabs/PayoutsHistoryTab.tsx', code);
