const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessCard.tsx', 'utf8');

code = code.replace(
  "A partir de {formatCurrency(b.startPrice || b.lowestPrice || 15, b.currency || 'EUR')}",
  "{t('business.from', { defaultValue: 'A partir de ' })} {formatCurrency(b.startPrice || b.lowestPrice || 15, b.currency || 'EUR')}"
);

fs.writeFileSync('src/components/BusinessCard.tsx', code);
