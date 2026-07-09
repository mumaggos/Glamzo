const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');

text = text.replace(/  \);\nexport default ClientsTab;\n\}\);/g, '  );\n});\nexport default ClientsTab;');
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', text);
