const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `const { businessId, planName, successUrl, cancelUrl, skipTrial } = req.body;`;
const replacementStr = `const { businessId, planName, successUrl, cancelUrl, skipTrial, force_no_trial } = req.body;
    const finalSkipTrial = skipTrial || force_no_trial;`;

code = code.replace(targetStr, replacementStr);

const targetTrialStr = `const subscriptionData = (hasUsedTrial || skipTrial || isTerminal) ? {} : { trial_period_days: 14 };`;
const replacementTrialStr = `const subscriptionData = (hasUsedTrial || finalSkipTrial || isTerminal) ? undefined : { trial_period_days: 14, trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } };`;

code = code.replace(targetTrialStr, replacementTrialStr);
fs.writeFileSync('server.ts', code);
console.log('server.ts trial logic patched');
