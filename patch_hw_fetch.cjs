const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/HardwareManagerTab.tsx', 'utf8');

const oldFetch = `body: JSON.stringify({ businessId: business.id }),`;
const newFetch = `body: JSON.stringify({ businessId: business.id, currency: formatPrice(0).includes('$') ? 'usd' : 'eur' }),`;
content = content.replace(oldFetch, newFetch);

fs.writeFileSync('src/pages/partner/tabs/HardwareManagerTab.tsx', content);
