const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/PayoutsHistoryTab.tsx', 'utf8');

code = code.replace(
  'if (!business?.id) return;',
  `if (!business?.id) return;
      if (!business?.stripe_account_id) {
        setPayouts([]);
        setLoading(false);
        return;
      }`
);

fs.writeFileSync('src/pages/partner/tabs/PayoutsHistoryTab.tsx', code);
