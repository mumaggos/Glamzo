const fs = require('fs');

let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminCode = adminCode.replace(
  /href=\{`https:\/\/wa\.me\/\$\{selectedSalon\.whatsapp\.replace\(\/\[\^0-9\]\/g, ''\)\}`\}/g,
  'href={`https://wa.me/${(selectedSalon.whatsapp || "").replace(/[^0-9]/g, "")}`}'
);
fs.writeFileSync('src/pages/Admin.tsx', adminCode);
