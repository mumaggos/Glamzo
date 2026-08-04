const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessCard.tsx', 'utf8');

code = code.replace(
  "formatCurrency(b.lowestPrice || 15, currentLangCode)",
  "formatCurrency(b.startPrice || b.lowestPrice || 15, b.currency || 'EUR')"
);

fs.writeFileSync('src/components/BusinessCard.tsx', code);
