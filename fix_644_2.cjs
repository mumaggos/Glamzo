const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

content = content.replace(/message: 'O seu Glamzo Terminal foi enviado via CTT!'\s*\)\s*\}\);/g, "message: 'O seu Glamzo Terminal foi enviado via CTT!'\n          })\n        });");

fs.writeFileSync('src/pages/Admin.tsx', content);
