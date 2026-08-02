const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace all multiple sizes= with just one
code = code.replace(/sizes="[^"]+"\n\s*sizes="[^"]+"/g, 'sizes="(max-width: 640px) 280px, 280px"');
fs.writeFileSync('src/pages/Home.tsx', code);
