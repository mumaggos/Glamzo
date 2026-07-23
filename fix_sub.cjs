const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

const match = content.indexOf("currency: formatPrice(0).includes(");
const endMatch = content.lastIndexOf(") ? 'usd' : 'eur' }),");

if (match !== -1 && endMatch !== -1 && endMatch > match) {
    const before = content.substring(0, match);
    const after = content.substring(endMatch + 21);
    content = before + "currency: (formatPrice(0).indexOf('$') !== -1) ? 'usd' : 'eur' })," + after;
    fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', content);
}
