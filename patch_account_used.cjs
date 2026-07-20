const fs = require('fs');
let content = fs.readFileSync('src/pages/Account.tsx', 'utf8');

content = content.replace(/\.eq\('is_used', true\)/g, ".eq('used', true)");
content = content.replace(/is_used: false/g, "used: false");

fs.writeFileSync('src/pages/Account.tsx', content);
