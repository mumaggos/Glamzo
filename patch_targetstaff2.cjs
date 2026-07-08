const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const targetStaffRegex = /const targetStaffId = manualBookingType === "block" \? \(manualStaffId === "all" \? null : manualStaffId\) : manualStaffId;/;
content = content.replace(targetStaffRegex, `const targetStaffId = (manualStaffId === "all" || manualStaffId === "") ? null : manualStaffId;`);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content);
