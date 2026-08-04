const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

code = code.replace(
  "category: 'Cabelo & Barbearia'",
  "category: 'Cabelo & Barbearia',\n          subscription_status: 'trialing',\n          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()"
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
