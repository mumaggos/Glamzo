const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
content = content.replace(/\/api\/stripe\/create-checkout-session/g, '/api/stripe/create-subscription');
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content);
