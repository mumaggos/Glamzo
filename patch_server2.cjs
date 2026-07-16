const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /affiliate_balance: Number\(affiliate_balance\),/g,
  `affiliate_balance: Number(affiliate_balance),\n      wallet_balance: Number(affiliate_balance),`
);
fs.writeFileSync('server.ts', code);
