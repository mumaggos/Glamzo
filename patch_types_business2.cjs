const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

if (!code.includes("door_number:")) {
  code = code.replace(
    /address: string;/,
    `address: string;
  door_number?: string | null;`
  );
  fs.writeFileSync('src/types/index.ts', code);
}
