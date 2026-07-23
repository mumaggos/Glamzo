const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
    'const { businessId, planName, successUrl, cancelUrl, skipTrial, force_no_trial } = req.body;',
    'const { businessId, planName, successUrl, cancelUrl, skipTrial, force_no_trial, currency = "eur" } = req.body;'
);
fs.writeFileSync('server.ts', content);
