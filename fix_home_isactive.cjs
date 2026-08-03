const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(".eq('is_active', true)", "");

fs.writeFileSync('src/pages/Home.tsx', code);
