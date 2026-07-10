import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', 'utf-8');

code = code.replace(/qr_scans/g, 'qr_scans_count');

fs.writeFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', code);
console.log("Patched StoreAssetsTab to use qr_scans_count");
