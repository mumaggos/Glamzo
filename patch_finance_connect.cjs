const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
content = content.replace(/\/api\/stripe\/create-account-link/g, '/api/stripe/connect/onboard');
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content);
