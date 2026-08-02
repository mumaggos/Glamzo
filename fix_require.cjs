const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const distPath = require("path").join(process.cwd(), "dist");',
  'const distPath = path.join(process.cwd(), "dist");'
);

fs.writeFileSync('server.ts', code);
