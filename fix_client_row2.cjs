const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');
if (!text.includes('});\nconst ClientsTab =')) {
  text = text.replace('const ClientsTab = React.memo(function ClientsTab() {', '});\nconst ClientsTab = React.memo(function ClientsTab() {');
}
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', text);
