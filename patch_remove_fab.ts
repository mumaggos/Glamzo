import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove ClientFAB component definition
content = content.replace(/function ClientFAB\(\) \{[\s\S]*?\}\n/g, '');
// Remove its usage
content = content.replace(/<ClientFAB \/>\n/g, '');

fs.writeFileSync('src/App.tsx', content);
console.log("Patched FAB removal");
