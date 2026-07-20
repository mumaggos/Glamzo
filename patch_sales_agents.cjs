const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

content = content.replace(
  /import \{ SalesAgent \} from '\.\.\/types';/,
  `import { SalesAgent } from '../types';\nimport GestaoLeads from './GestaoLeads';`
);

content = content.replace(
  /<div className="space-y-6 animate-fade-in">\s*<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">/,
  `<div className="space-y-6 animate-fade-in">
      <GestaoLeads agents={agents} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 pt-8">`
);

fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
