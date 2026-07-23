const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

content = content.replace(
    'body: JSON.stringify({ businessId: business.id, planName: planName, skipTrial: hasUsedTrial }),',
    "body: JSON.stringify({ businessId: business.id, planName: planName, skipTrial: hasUsedTrial, currency: formatPrice(0).includes('$') ? 'usd' : 'eur' }),"
);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', content);

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(
    'const { businessId, planName, skipTrial } = req.body;',
    'const { businessId, planName, skipTrial, currency = "eur" } = req.body;'
);
server = server.replace(
    /currency: 'eur',\s*product_data/g,
    'currency: currency,\n            product_data'
);
server = server.replace(
    /unit_amount: 9900/g,
    'unit_amount: currency === "usd" ? 10890 : 9900'
);
fs.writeFileSync('server.ts', server);

