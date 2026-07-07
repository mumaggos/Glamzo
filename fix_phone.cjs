const fs = require('fs');
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

code = code.replace(
  /\`https:\/\/wa.me\/\$\{business\.phone\.replace\(\/\[\^0-9\]\/g, ''\)\}\`/g,
  "\`https://wa.me/${business?.phone?.replace(/[^0-9]/g, '') || ''}\`"
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
