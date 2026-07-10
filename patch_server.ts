import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/qr_scans/g, 'qr_scans_count');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts to use qr_scans_count");
