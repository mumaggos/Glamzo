const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

content = content.replace(
  /<th className="p-4 text-center">Lojas Inscr\.<\/th>\n\s*<th className="p-4 text-center">PRO<\/th>\n\s*<th className="p-4 text-center">Terminal<\/th>/g,
  `<th className="p-4 text-center">Cliques</th>
                          <th className="p-4 text-center">Inscrições</th>
                          <th className="p-4 text-center">Plano PRO</th>
                          <th className="p-4 text-center">PRO + Terminal</th>`
);

content = content.replace(
  /<th className="p-4 w-12 font-extrabold">Link \(Cliques\)<\/th>/g,
  `<th className="p-4 text-center">Cliques</th>`
);

content = content.replace(
  /<th className="p-4">Nome<\/th>/g,
  `<th className="p-4">Comercial</th>`
);


fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
