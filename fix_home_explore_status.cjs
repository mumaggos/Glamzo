const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace(
  /\`\)\.eq\('status', 'active'\);/,
  "\`).eq('status', 'active').in('subscription_status', ['active', 'trialing']);"
);
fs.writeFileSync('src/pages/Home.tsx', home);
