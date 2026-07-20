const fs = require('fs');
let content = fs.readFileSync('src/pages/Account.tsx', 'utf8');

content = content.replace(
  /const \[glamzoPoints, setGlamzoPoints\] = useState\(0\);/,
  "const [glamzoPoints, setGlamzoPoints] = useState<number | null>(null);"
);

content = content.replace(
  /const \[walletBalance, setWalletBalance\] = useState\(0\);/,
  "const [walletBalance, setWalletBalance] = useState<number | null>(null);"
);

content = content.replace(
  /const currentPointsBalance = profile\?\.glamzo_points \|\| glamzoPoints \|\| 0;/,
  "const currentPointsBalance = glamzoPoints !== null ? glamzoPoints : (profile?.glamzo_points || 0);"
);

content = content.replace(
  /const currentAffiliateBalance = profile\?\.wallet_balance \|\| profile\?\.affiliate_balance \|\| walletBalance \|\| 0;/,
  "const currentAffiliateBalance = walletBalance !== null ? walletBalance : (profile?.wallet_balance || profile?.affiliate_balance || 0);"
);

fs.writeFileSync('src/pages/Account.tsx', content);
