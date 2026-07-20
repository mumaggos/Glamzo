const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

content = content.replace(
  /onboarding_step: 6, setup_step: 6/g,
  "onboarding_step: 4, setup_step: 4"
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
