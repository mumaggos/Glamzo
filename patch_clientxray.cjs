const fs = require('fs');
let code = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');
code = code.replace(
  /affiliate_balance: walletBalance/g,
  `wallet_balance: walletBalance`
);
fs.writeFileSync('src/components/ClientXRayModal.tsx', code);
