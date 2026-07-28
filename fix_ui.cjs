const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

code = code.replace(
  /const triggerStripeOnboarding = async \(\) => \{\n    if \(!business\) return;\n    setLoading\(true\);\n    try \{/,
  `const triggerStripeOnboarding = async () => {
    if (!business) return;
    
    console.log("Triggering stripe onboarding. Business ID:", business.id, "Owner ID:", user?.id);
    
    setLoading(true);
    try {`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
