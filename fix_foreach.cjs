const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');

text = text.replace('      }\n    return map;', '      }\n    });\n    return map;');
text = text.replace('      sum += c.spent;\n    return sum;', '      sum += c.spent;\n    });\n    return sum;');

fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', text);
