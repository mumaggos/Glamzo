const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

content = content.replace(
    'planName: selectedPlan,',
    "planName: selectedPlan,\n            currency: formatPrice(0).includes('$') ? 'usd' : 'eur',"
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
