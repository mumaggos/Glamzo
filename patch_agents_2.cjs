const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

content = content.replace(
  /className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"\n                            >\n                              \{copiedId === agent.id \? <Check className="w-3 h-3 text-emerald-600" \/> : <LinkIcon className="w-3 h-3" \/>\}\n                            <\/button>/,
  `className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                              title="Copiar Link de Afiliado"
                            >
                              {copiedId === agent.id ? <Check className="w-3 h-3 text-emerald-600" /> : <LinkIcon className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agent.id, agent.name)}
                              className="inline-flex items-center justify-center w-7 h-7 ml-2 rounded bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                              title="Apagar Comercial"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>`
);

fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
