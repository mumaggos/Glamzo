const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');
code = code.replace(
  /discount_value: voucherValue/g,
  `discount_amount: voucherValue`
);
fs.writeFileSync('src/pages/Account.tsx', code);
