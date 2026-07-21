const fs = require('fs');
let content = fs.readFileSync('src/pages/ChamadasCRM.tsx', 'utf8');

content = content.replace(
  /notas: string;\n}/,
  `notas: string;
  vendedor_id?: string | null;
  senha_acesso?: string | null;
}`
);

fs.writeFileSync('src/pages/ChamadasCRM.tsx', content);
