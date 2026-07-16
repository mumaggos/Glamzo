const fs = require('fs');
let code = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');

code = code.replace(/if \(bkErr\) throw bkErr;/g, "");

fs.writeFileSync('src/components/ClientXRayModal.tsx', code);
