const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

// Add import
content = content.replace(
  /import AgentLeadsModal from '\.\/AgentLeadsModal';/,
  `import AgentLeadsModal from './AgentLeadsModal';
import AgentStoresModal from './AgentStoresModal';`
);

// Add state
content = content.replace(
  /const \[viewAgentLeads, setViewAgentLeads\] = useState<SalesAgent \| null>\(null\);/,
  `const [viewAgentLeads, setViewAgentLeads] = useState<SalesAgent | null>(null);
  const [viewAgentStores, setViewAgentStores] = useState<SalesAgent | null>(null);`
);

// Add the modal component rendering at the end before final div
content = content.replace(
  /\{viewAgentLeads && \(/,
  `{viewAgentStores && (
        <AgentStoresModal
          agent={viewAgentStores}
          onClose={() => setViewAgentStores(null)}
        />
      )}

      {viewAgentLeads && (`
);

// Replace headers and table rows for both teamAgents and unassignedAgents
// We will just do a regex replace for both using match.
content = content.replace(
  /<th className="p-4">Comercial<\/th>\s*<th className="p-4 text-center">Cliques<\/th>\s*<th className="p-4 text-center">Inscrições<\/th>\s*<th className="p-4 text-center">Plano PRO<\/th>\s*<th className="p-4 text-center">PRO \+ Terminal<\/th>\s*<th className="p-4 text-right">Faturado<\/th>\s*<th className="p-4 text-right">Link<\/th>/g,
  `<th className="p-4">Comercial</th>
                          <th className="p-4 text-center">Cliques</th>
                          <th className="p-4 text-center">Leads CRM</th>
                          <th className="p-4 text-center">Inscrições</th>
                          <th className="p-4 text-center">Plano PRO</th>
                          <th className="p-4 text-center">PRO + Terminal</th>
                          <th className="p-4 text-right">Faturado</th>
                          <th className="p-4 text-right">Link</th>`
);

// Row replacer
const renderCells = (agent, perf) => `
                              <td className="p-4 font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)} title="Ver Leads Atribuídas">
                                {agent.name}
                              </td>
                              <td className="p-4 text-center font-bold text-blue-600">
    <div className="flex flex-col items-center">
      <span>{agent.clicks_count}</span>
      <span className="text-[9px] text-slate-400 font-normal">cliques</span>
    </div>
  </td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)}>
     <div className="flex flex-col items-center">
       <span>{perf.assignedLeads}</span>
       <span className="text-[9px] text-emerald-600">{perf.contactedLeads} cont.</span>
     </div>
   </td>
   <td className="p-4 text-center font-bold text-slate-700">{perf.totalStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title="Ver Lojas">{perf.proStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title="Ver Lojas">{perf.terminalStores}</td>
                              <td className="p-4 text-right font-black text-emerald-600">{perf.totalCommission.toFixed(2)} €</td>
`;

// we have two tables in the file, teamAgents and the other one.
content = content.replace(
  /<td className="p-4 font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick=\{\(\) => setViewAgentLeads\(agent\)\} title="Ver Leads Atribuídas">[\s\S]*?<td className="p-4 text-right">/g,
  `<td className="p-4 font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)} title="Ver Leads Atribuídas">
                                {agent.name}
                              </td>
                              <td className="p-4 text-center font-bold text-blue-600">
    <div className="flex flex-col items-center">
      <span>{agent.clicks_count}</span>
      <span className="text-[9px] text-slate-400 font-normal">cliques</span>
    </div>
  </td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)}>
     <div className="flex flex-col items-center">
       <span>{perf.assignedLeads}</span>
       <span className="text-[9px] text-emerald-600">{perf.contactedLeads} cont.</span>
     </div>
   </td>
   <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title="Ver Lojas">{perf.totalStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title="Ver Lojas">{perf.proStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title="Ver Lojas">{perf.terminalStores}</td>
                              <td className="p-4 text-right font-black text-emerald-600">{perf.totalCommission.toFixed(2)} €</td>
                              <td className="p-4 text-right">`
);


fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
