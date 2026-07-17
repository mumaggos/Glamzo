const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const targetCheck = `        if (currentBiz.status === 'active' && currentBiz.setup_completed) {
          navigate('/partner/dashboard', { replace: true });
          return;
        }`;

const replacementCheck = `        const hasValidSubscription = currentBiz.subscription_active !== false && 
                                     currentBiz.subscription_status !== 'canceled' &&
                                     currentBiz.subscription_status !== 'expired';

        if (currentBiz.status === 'active' && currentBiz.setup_completed && hasValidSubscription) {
          navigate('/partner/dashboard', { replace: true });
          return;
        }
        
        // If they finished setup but their subscription is canceled/expired, force them to the plans step
        if (currentBiz.setup_completed && !hasValidSubscription) {
          setStep(4);
        }`;

code = code.replace(targetCheck, replacementCheck);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log("SetupWizard patched!");
