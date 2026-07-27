const fs = require('fs');
let content = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

// Add priority={index < 2} to the first two categories
content = content.replace(/<Image src=\{cat\.image\} alt="" fill className=/g, '<Image src={cat.image} priority={index < 2} alt="" fill className=');

fs.writeFileSync('src/components/HomeBelowFold.tsx', content);
