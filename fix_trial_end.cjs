const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const syncedExpiry = new Date\([\s\S]*?\)\.toISOString\(\);/,
  `const syncedExpiry = new Date(
        ((liveSubscription as any).trial_end || (liveSubscription as any).current_period_end) * 1000,
      ).toISOString();`
);

fs.writeFileSync('server.ts', code);
