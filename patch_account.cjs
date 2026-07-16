const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

code = code.replace(
  /const currentPointsBalance = financeService\.getCustomerPoints\(user\?\.id \|\| 'default'\);/,
  `const currentPointsBalance = profile?.glamzo_points || 0;
  const currentAffiliateBalance = profile?.affiliate_balance || 0;`
);

fs.writeFileSync('src/pages/Account.tsx', code);
