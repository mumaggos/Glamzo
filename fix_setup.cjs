const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const match = content.indexOf("currency: formatPrice(0).includes(");
const endMatch = content.lastIndexOf(") ? 'usd' : 'eur',");

if (match !== -1 && endMatch !== -1 && endMatch > match) {
    const before = content.substring(0, match);
    const after = content.substring(endMatch + 18); // length of ") ? 'usd' : 'eur',"
    content = before + "currency: (formatPrice(0).indexOf('$') !== -1) ? 'usd' : 'eur'," + after;
    fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
}
