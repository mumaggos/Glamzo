const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

// replace inside StaffFinanceCard
code = code.replace(/formatCurrency\(Number\(item\.amount_total \|\| item\.amount \|\| 0\), business\?\.currency\)/g, "formatCurrency(Number(item.amount_total || item.amount || 0), currency)");

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
