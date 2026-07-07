const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
code = code.replace(/navigate\(\`\/business\/\$\{b\.slug\}\`\)/g, 'navigate(`/business/${b.slug || b.id}`)');
fs.writeFileSync('src/pages/Explore.tsx', code);
