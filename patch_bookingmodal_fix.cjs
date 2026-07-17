const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

code = code.replace(/const servicesText = selectedServices\.map\(s => `• \$\{s\.name\}`\)\.join\('\\n'\);\n\s*const servicesText = selectedServices\.map/, "const servicesText = selectedServices.map");

fs.writeFileSync('src/components/BookingModal.tsx', code);
