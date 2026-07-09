const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');
text = text.replace(/  \);\n\}\}\);\nexport default ClientsTab;/, '  );\n});\nexport default ClientsTab;');
text = text.replace(/  \);\n\}\n\}\);\n\nexport default ClientsTab;/, '  );\n});\nexport default ClientsTab;');
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', text);
