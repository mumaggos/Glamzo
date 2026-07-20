const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

content = content.replace(
  /setUnreadMessages\(0\);\n        setNotifications\(prev => prev.filter\(n => n\.id !== 999\)\);\n      \}/,
  `setUnreadMessages(0);
        setNotifications(prev => prev.filter(n => n.id !== 999));
        sessionStorage.removeItem('dismissed_messages_count');
      }`
);

content = content.replace(
  /setNotifications\(prev => prev.filter\(n => n\.id !== 888\)\);\n      \}/,
  `setNotifications(prev => prev.filter(n => n.id !== 888));
        sessionStorage.removeItem('dismissed_disputes_count');
      }`
);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
