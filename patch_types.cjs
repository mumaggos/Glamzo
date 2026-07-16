const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  /export interface UserProfile \{/,
  `export interface UserProfile {
  glamzo_points?: number;
  affiliate_balance?: number;`
);

fs.writeFileSync('src/types/index.ts', code);
