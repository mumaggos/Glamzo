const fs = require('fs');
let content = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

content = content.replace(
  /affiliate_balance: 0/g,
  'affiliate_balance: 0, wallet_balance: 0'
);

fs.writeFileSync('src/components/GlamzoClubModal.tsx', content);
