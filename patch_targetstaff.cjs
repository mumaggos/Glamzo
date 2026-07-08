const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

content = content.replace(/const targetStaffId = manualStaffId === "all" \? null : \(manualStaffId \|\| null\);/, '');

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content);
