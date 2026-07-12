import * as fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `    const { businessId, planName, successUrl, cancelUrl } = req.body;`;
const new1 = `    const { businessId, planName, successUrl, cancelUrl, skipTrial } = req.body;`;

const target2 = `    const hasUsedTrial = !!business.trial_started_at;
    const subscriptionData = hasUsedTrial ? {} : { trial_period_days: 14 };`;

const new2 = `    const hasUsedTrial = !!business.trial_started_at;
    const subscriptionData = (hasUsedTrial || skipTrial) ? {} : { trial_period_days: 14 };`;

content = content.replace(target1, new1);
content = content.replace(target2, new2);

fs.writeFileSync('server.ts', content);
console.log('Patched server.ts successfully');
