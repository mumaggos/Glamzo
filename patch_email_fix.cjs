const fs = require('fs');
let code = fs.readFileSync('src/services/EmailService.tsx', 'utf8');
code = code.replace(/getResend\(\)/g, 'getResendClient()');
fs.writeFileSync('src/services/EmailService.tsx', code);
