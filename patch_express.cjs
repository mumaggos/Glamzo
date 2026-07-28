const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /type: 'custom',/g,
  `type: 'express',`
);

fs.writeFileSync('server.ts', code);
