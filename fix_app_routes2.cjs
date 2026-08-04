const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<Route path="subscricao\/repasses" element={<PayoutsHistoryTab \/>} \/>/g,
  '<Route path="subscricao/configuracoes" element={<FinanceSettingsTab />} />\n                    <Route path="subscricao/repasses" element={<PayoutsHistoryTab />} />'
);

fs.writeFileSync('src/App.tsx', code);
