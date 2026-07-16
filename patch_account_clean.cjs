const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');
code = code.replace(
  /const isFullyCompleted = \(bk\.client_completed && bk\.business_completed\) \|\| \(bk\.business_completed && \(new Date\(\)\.getTime\(\) - bookingDate\.getTime\(\)\) > 48 \* 60 \* 60 \* 1000\);/g,
  ``
);
code = code.replace(
  /\!isFullyCompleted &&/g,
  ``
);
fs.writeFileSync('src/pages/Account.tsx', code);
