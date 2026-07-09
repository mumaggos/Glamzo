const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');
text = text.replace('    </tr>\n  );\nconst ClientsTab = React.memo(function ClientsTab() {', '    </tr>\n  );\n});\nconst ClientsTab = React.memo(function ClientsTab() {');
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', text);
