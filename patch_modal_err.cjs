const fs = require('fs');
let content = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

content = content.replace(
  /setMessage\(\{ type: 'error', text: 'Erro ao registar levantamento.' \}\);/g,
  (match, offset, string) => {
    // Only replace the second occurrence (which is inside handleBalanceToPoints)
    if (offset > 10000) { // arbitrary, but handleBalanceToPoints is further down
       return `setMessage({ type: 'error', text: 'Erro ao converter saldo.' });`;
    }
    return match;
  }
);

fs.writeFileSync('src/components/GlamzoClubModal.tsx', content);
