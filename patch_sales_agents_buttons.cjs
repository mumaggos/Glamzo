const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

// Replace both places where the table actions are (teams and no-team)
content = content.replace(
  /<button\s+onClick=\{\(\) => copyToClipboard\(agent\.ref_code, agent\.id\)\}\s+className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"\s+title="Copiar Link de Afiliado"\s+>\s+\{copiedId === agent\.id \? <Check className="w-3 h-3 text-emerald-600" \/> : <LinkIcon className="w-3 h-3" \/>\}\s+<\/button>/g,
  `<button
    onClick={() => copyToClipboard(agent.ref_code, agent.id)}
    className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
    title="Copiar Link de Afiliado"
  >
    {copiedId === agent.id ? <Check className="w-3 h-3 text-emerald-600" /> : <LinkIcon className="w-3 h-3" />}
  </button>
  <button
    onClick={() => {
      const link = \`\${window.location.origin}/chamadas/\${agent.id}\`;
      navigator.clipboard.writeText(link);
      setCopiedId('crm_' + agent.id);
      setTimeout(() => setCopiedId(null), 2000);
    }}
    className="inline-flex items-center justify-center w-7 h-7 ml-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
    title="Copiar Link do CRM de Chamadas"
  >
    {copiedId === 'crm_' + agent.id ? <Check className="w-3 h-3 text-blue-600" /> : <Phone className="w-3 h-3" />}
  </button>`
);

content = content.replace(/import \{ SalesAgent \} from '\.\.\/types';/, `import { SalesAgent } from '../types';\nimport { Phone } from 'lucide-react';`);

fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
