const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

code = code.replace(/19,99€/g, '19,90€');
code = code.replace(/24,99€/g, '24,90€');

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard step 3 patched.');
