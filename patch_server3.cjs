const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /const \{ userId, affiliate_balance, glamzo_points \} = req\.body;/g,
  `const { userId, wallet_balance, glamzo_points } = req.body;`
);
code = code.replace(
  /affiliate_balance: Number\(affiliate_balance\),\n\s*wallet_balance: Number\(affiliate_balance\)/g,
  `wallet_balance: Number(wallet_balance)`
);
fs.writeFileSync('server.ts', code);
