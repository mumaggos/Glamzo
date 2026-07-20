const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

content = content.replace(
  /<th className="p-4 w-12"><\/th>/g,
  `<th className="p-4 w-12 font-extrabold">Link (Cliques)</th>`
);

content = content.replace(
  /<td className="p-4 text-center font-bold text-blue-600">\{agent\.clicks_count\}<\/td>/g,
  `<td className="p-4 text-center font-bold text-blue-600">
    <div className="flex flex-col items-center">
      <span>{agent.clicks_count}</span>
      <span className="text-[9px] text-slate-400 font-normal">cliques</span>
    </div>
  </td>`
);


fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
