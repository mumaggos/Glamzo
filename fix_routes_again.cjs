const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<Route path="subscricao\/faturacao" element={<FinanceTab \/>} \/>/g, '<Route path="financeiro" element={<FinanceTab />} />');

fs.writeFileSync('src/App.tsx', code);
