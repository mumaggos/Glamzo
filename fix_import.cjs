const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace("import { BusinessCard } from '../components/BusinessCard';\n", '');
code = "import { BusinessCard } from '../components/BusinessCard';\n" + code;

fs.writeFileSync('src/pages/Home.tsx', code);
