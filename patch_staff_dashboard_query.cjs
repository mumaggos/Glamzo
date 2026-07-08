const fs = require('fs');
let content = fs.readFileSync('src/pages/staff/StaffDashboard.tsx', 'utf8');

const queryMatch = /          \.eq\("business_id", businessId\)\n          \.eq\("staff_id", staffId\)/;
const replacement = `          .eq("business_id", businessId)
          .or(\`staff_id.eq.\${staffId},staff_id.is.null\`)`;

content = content.replace(queryMatch, replacement);

fs.writeFileSync('src/pages/staff/StaffDashboard.tsx', content);
