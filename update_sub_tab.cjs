const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

if (!code.includes('FinanceNav')) {
  code = code.replace(/import React/, "import FinanceNav from '../../../components/partner/FinanceNav';\nimport React");
  code = code.replace(/<div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6">/, '<div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6">\n      <FinanceNav />');
  fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', code);
}
