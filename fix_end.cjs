const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

code = code.replace(
  /\s*<\/div>\s*<\/div>\s*\);\s*\}/g,
  '\n    </div>\n  );\n}'
);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', code);
