const fs = require('fs');
let code = fs.readFileSync('src/services/EmailService.tsx', 'utf8');
code = code.replace(/getResend\(\)/g, 'resend');
code = code.replace(/!resend/g, '!getResend()');
code = code.replace(/resend\.emails/g, 'getResend()!.emails');
fs.writeFileSync('src/services/EmailService.tsx', code);
