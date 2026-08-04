const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<Route path="subscricao\/configuracoes" element={<FinanceSettingsTab \/>} \/>\n/g, '');

fs.writeFileSync('src/App.tsx', code);
