const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

if (!code.includes("welcome_kit_sent:")) {
  code = code.replace(
    /cancellation_policy\?: string \| null;/,
    `cancellation_policy?: string | null;
  welcome_kit_sent?: boolean;
  subscription_status?: string;
  trial_ends_at?: string | null;`
  );
  fs.writeFileSync('src/types/index.ts', code);
}
