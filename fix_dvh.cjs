const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

code = code.replace(/100vh/g, '100dvh');
fs.writeFileSync('src/pages/Explore.tsx', code);
