const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetTrialStr = `const subscriptionData = (hasUsedTrial || finalSkipTrial || isTerminal) ? {} : { trial_period_days: 14 };`;
const replacementTrialStr = `const subscriptionData = (hasUsedTrial || finalSkipTrial || isTerminal) ? {} : { trial_period_days: 14 };
    console.log("hasUsedTrial:", hasUsedTrial, "finalSkipTrial:", finalSkipTrial, "isTerminal:", isTerminal);
    console.log("Calculated subscriptionData:", subscriptionData);`;

code = code.replace(targetTrialStr, replacementTrialStr);
fs.writeFileSync('server.ts', code);
console.log('server.ts trial log patched');
