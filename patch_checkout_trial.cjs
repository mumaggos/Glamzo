const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const subscriptionData = isTrialing \? \{\s+trial_period_days: 14,\s+trial_settings: \{ end_behavior: \{ missing_payment_method: 'cancel' \} \}\s+\} : undefined;/g,
  `const subscriptionData = isTrialing ? { 
       trial_period_days: 14
    } : undefined;`
);

fs.writeFileSync('server.ts', content);
