const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

content = content.replace(/.*{ id: 'partners', label: 'Gestão de Parceiros 👑', icon: ShieldAlert },\n/g, "");

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Removed partners tab");
