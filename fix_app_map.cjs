const fs = require('fs');

let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');
code = code.replace(
  /const hasRealPromotion = b\.is_promoted \|\| false;/g,
  'let hasRealPromotion = b.is_promoted || false;'
);
fs.writeFileSync('src/pages/Home.tsx', code);
