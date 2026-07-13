import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove ClientFAB function definition
const clientFabRegex = /function ClientFAB\(\) \{[\s\S]*?return \([\s\S]*?<\/Link>\s*\);\s*\}/;
content = content.replace(clientFabRegex, '');

// Remove <ClientFAB /> usage
content = content.replace(/\s*<ClientFAB \/>/g, '');

fs.writeFileSync('src/App.tsx', content);
console.log("Removed ClientFAB from App.tsx");
