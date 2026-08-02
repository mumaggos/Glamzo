const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Find the block from "// Cartão Minimalista de Elite (Estilo Airbnb)" to "const homeSchema"
// and delete it.
const regex = /\/\/ Cartão Minimalista de Elite \(Estilo Airbnb\)[\s\S]*?(?=const homeSchema = \{)/g;
code = code.replace(regex, '');

fs.writeFileSync('src/pages/Home.tsx', code);
