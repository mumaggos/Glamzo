const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetTrialStr = `const subscriptionData = (hasUsedTrial || finalSkipTrial || isTerminal) ? undefined : { trial_period_days: 14, trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } };`;
const replacementTrialStr = `const subscriptionData = (hasUsedTrial || finalSkipTrial || isTerminal) ? {} : { trial_period_days: 14 };`;

code = code.replace(targetTrialStr, replacementTrialStr);
fs.writeFileSync('server.ts', code);
console.log('server.ts trial logic restored');
