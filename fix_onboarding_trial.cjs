const fs = require('fs');
let code = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');

code = code.replace(
  "subscription_status: 'trialing'",
  "subscription_status: 'trialing',\n        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()"
);

fs.writeFileSync('src/pages/Onboarding.tsx', code);
