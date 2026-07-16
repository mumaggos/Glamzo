const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

content = content.replace(/\}\)\s*\}\)/g, ')}');
content = content.replace(/\}\)\s*\}\)\s*\{\/\*/g, ')}\n              {/*');

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Fixed double parenthesis again");
