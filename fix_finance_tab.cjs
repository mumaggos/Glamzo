const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

text = text.replace(
`      if (ledgerFilter === 'today') {
        const today = new Date();
        today.setHours(0,0,0,0);
        return itemDate >= today;
      }
      const itemDate = new Date(item.created_at);`,
`      const itemDate = new Date(item.created_at);
      if (ledgerFilter === 'today') {
        const today = new Date();
        today.setHours(0,0,0,0);
        return itemDate >= today;
      }`
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', text);
