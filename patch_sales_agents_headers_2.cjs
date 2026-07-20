const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

content = content.replace(
  /<th className="p-4 text-center">Lojas<\/th>\n\s*<th className="p-4 text-center">Pro<\/th>\n\s*<th className="p-4 text-center">Terminal<\/th>/g,
  `<th className="p-4 text-center">Inscrições</th>
                          <th className="p-4 text-center">Plano PRO</th>
                          <th className="p-4 text-center">PRO + Terminal</th>`
);


fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
