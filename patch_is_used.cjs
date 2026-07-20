const fs = require('fs');

const files = [
  'src/components/AllCouponsTab.tsx',
  'src/components/BookingModal.tsx',
  'src/components/GlamzoClubModal.tsx',
  'src/components/ClientXRayModal.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\.is_used/g, '.used');
    content = content.replace(/is_used: /g, 'used: ');
    fs.writeFileSync(file, content);
  }
}
