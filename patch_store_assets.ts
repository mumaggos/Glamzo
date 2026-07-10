import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', 'utf-8');

code = code.replace('Scans Totais', 'Visitas Totais');
code = code.replace('Scans do QR', 'Visitas (QR & Link)');

fs.writeFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', code);
