const fs = require('fs');
let text = fs.readFileSync('src/pages/PartnerLogin.tsx', 'utf8');

text = text.replace(
  "let redirect = '/dashboard';",
  "let redirect = '/partner/dashboard';"
);

fs.writeFileSync('src/pages/PartnerLogin.tsx', text);
