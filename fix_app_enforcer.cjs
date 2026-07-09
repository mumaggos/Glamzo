const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(
  "const isPartnerRoute = path.startsWith('/partner') || path.startsWith('/setup');",
  "const isPartnerRoute = path.startsWith('/partner') || path.startsWith('/setup') || path.startsWith('/dashboard');"
);

fs.writeFileSync('src/App.tsx', text);
