import fs from 'fs';
let code = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf-8');

code = code.replace(
  /\.gte\("booking_date", start\.toISOString\(\)\.split\('T'\)\[0\]\)/g,
  ''
);

code = code.replace(
  /\.lte\("booking_date", end\.toISOString\(\)\.split\('T'\)\[0\]\)/g,
  ''
);

code = code.replace(
  /\.limit\(1000\)/g,
  '.limit(3000)'
);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', code);
