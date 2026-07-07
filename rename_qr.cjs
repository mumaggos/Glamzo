const fs = require('fs');

const files = [
  'src/components/DashboardLoja.tsx',
  'src/pages/BusinessDetail.tsx',
  'src/pages/partner/tabs/StoreAssetsTab.tsx',
  'src/types/index.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/qr_scans_count/g, 'qr_scans');
    fs.writeFileSync(file, code);
  }
});
console.log("Renamed to qr_scans");
