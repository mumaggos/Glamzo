const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The original routes inside PartnerLayout
code = code.replace(/<Route path="financeiro" element={<FinanceTab \/>} \/>/g, '<Route path="subscricao/faturacao" element={<FinanceTab />} />');
code = code.replace(/<Route path="financeiro\/configuracoes" element={<FinanceSettingsTab \/>} \/>/g, '<Route path="subscricao/configuracoes" element={<FinanceSettingsTab />} />');
code = code.replace(/<Route path="financeiro\/repasses" element={<PayoutsHistoryTab \/>} \/>/g, '<Route path="subscricao/repasses" element={<PayoutsHistoryTab />} />');
code = code.replace(/<Route path="financeiro\/hardware" element={<HardwareManagerTab \/>} \/>/g, '<Route path="subscricao/hardware" element={<HardwareManagerTab />} />');

fs.writeFileSync('src/App.tsx', code);
