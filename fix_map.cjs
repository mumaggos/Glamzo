const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');
text = text.replace('          lastVisit: lastV,\n      } else {', '          lastVisit: lastV,\n        });\n      } else {');
text = text.replace('          lastVisit: prev.lastVisit > lastV ? prev.lastVisit : lastV,\n      }', '          lastVisit: prev.lastVisit > lastV ? prev.lastVisit : lastV,\n        });\n      }');
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', text);
