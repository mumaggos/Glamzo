const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessCard.tsx', 'utf8');
code = code.replace(
  "b.startPrice !== undefined ? b.startPrice : (b.lowestPrice !== undefined ? b.lowestPrice : 15)",
  "b.startPrice ?? b.lowestPrice ?? 0"
);
fs.writeFileSync('src/components/BusinessCard.tsx', code);
