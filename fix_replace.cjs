const fs = require('fs');

function fixFile(file, searchStr, replacementStr) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(searchStr, () => replacementStr);
    fs.writeFileSync(file, content);
}

fixFile('src/pages/partner/SetupWizard.tsx', 
  /currency: formatPrice\(0\)\.includes\('[\s\S]*?successUrl/m, 
  "currency: formatPrice(0).includes('$') ? 'usd' : 'eur',\n            successUrl"
);

fixFile('src/pages/partner/tabs/HardwareManagerTab.tsx',
  /currency: formatPrice\(0\)\.includes\('[\s\S]*?}\),/m,
  "currency: formatPrice(0).includes('$') ? 'usd' : 'eur' }),"
);

fixFile('src/pages/partner/tabs/SubscriptionTab.tsx',
  /currency: formatPrice\(0\)\.includes\('[\s\S]*?}\),/m,
  "currency: formatPrice(0).includes('$') ? 'usd' : 'eur' }),"
);

