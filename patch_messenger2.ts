import fs from 'fs';
let code = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf-8');

code = code.replace(
  /if \(!error\) \{/,
  'if (true) {'
);

fs.writeFileSync('src/components/GlamzoMessenger.tsx', code);
