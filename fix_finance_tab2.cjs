const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

code = code.replace(/<FinanceNav \/>\n\s*/g, '');
code = code.replace(/import FinanceNav from '.*?';\n/g, '');

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
