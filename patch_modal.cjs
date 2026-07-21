const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

content = content.replace(
  /import GestaoLeads from '\.\/GestaoLeads';/,
  `import GestaoLeads from './GestaoLeads';\nimport AgentLeadsModal from './AgentLeadsModal';`
);

content = content.replace(
  /const \[emptyTeams, setEmptyTeams\] = useState<string\[\]>\(\[\]\);/,
  `const [emptyTeams, setEmptyTeams] = useState<string[]>([]);\n  const [viewAgentLeads, setViewAgentLeads] = useState<SalesAgent | null>(null);`
);

content = content.replace(
  /<td className="p-4 font-bold text-slate-900">\{agent\.name\}<\/td>/g,
  `<td className="p-4 font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)} title="Ver Leads Atribuídas">
                                {agent.name}
                              </td>`
);

// also let's make sure the modal is rendered at the end
content = content.replace(
  /(\s*)<\/div>\s*\)\;\s*\}\s*$/,
  `$1
      {viewAgentLeads && (
        <AgentLeadsModal agent={viewAgentLeads} onClose={() => setViewAgentLeads(null)} />
      )}
    </div>
  );
}
`
);

fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
