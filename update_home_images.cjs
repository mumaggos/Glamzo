const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/w=200&q=75&fm=webp/g, 'w=200&q=50&fm=webp');

fs.writeFileSync('src/pages/Home.tsx', content);
