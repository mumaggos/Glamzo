const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

if (!code.includes("import { BusinessCard } from")) {
  code = "import { BusinessCard } from './BusinessCard';\n" + code;
}

code = code.replace(/BusinessCard,\n/g, '');

code = code.replace(/<BusinessCard b=\{b\} \/>/g, '<BusinessCard b={b} t={t} currentLangCode={currentLangCode} />');

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
