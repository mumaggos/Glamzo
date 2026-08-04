const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

code = code.replace(
  'if (targetStep === 3 && (currentBiz.subscription_active || currentBiz.stripe_subscription_id)) {',
  'if ((targetStep === 3 || targetStep === 4) && (currentBiz.subscription_active || currentBiz.stripe_subscription_id)) {'
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
