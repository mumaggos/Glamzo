const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// replace )} followed by )} with just )} globally
content = content.replace(/\}\)\s*\}\)/g, ')}');
content = content.replace(/\}\)\s*\}\)/g, ')}');
content = content.replace(/\}\)\s*\}\)/g, ')}');

fs.writeFileSync('src/pages/Admin.tsx', content);
