const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

code = code.replace(/, MessageSquare , MessageSquare/g, ', MessageSquare');
code = code.replace(/MessageSquare, (.*?) , MessageSquare/g, 'MessageSquare, $1');
code = code.replace(/, MessageSquare }/g, '}');

fs.writeFileSync('src/pages/Account.tsx', code);
