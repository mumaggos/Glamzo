const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

const regex = /\{\/\* 2\. Conta Bancária \/ Stripe \*\/\}.*?(?=\s*<\/div>\s*<\/div>\s*\);)/s;
code = code.replace(regex, '');

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', code);
