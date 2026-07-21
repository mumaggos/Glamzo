const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

// Add fields to the performance state type
content = content.replace(
  /totalStores: number, proStores: number, terminalStores: number, totalCommission: number/g,
  'totalStores: number, proStores: number, terminalStores: number, totalCommission: number, assignedLeads: number, contactedLeads: number'
);

// Add initialization to perfData
content = content.replace(
  /totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0/g,
  'totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0, assignedLeads: 0, contactedLeads: 0'
);

// Update fetch logic
content = content.replace(
  /setPerformance\(perfData\);\s*\}/,
  `
        // Fetch leads statistics
        const { data: leadsData } = await supabase.from('leads').select('vendedor_id, estado_chamada').not('vendedor_id', 'is', null);
        if (leadsData) {
          leadsData.forEach(lead => {
            if (perfData[lead.vendedor_id]) {
              perfData[lead.vendedor_id].assignedLeads++;
              if (lead.estado_chamada !== 'pendente') {
                perfData[lead.vendedor_id].contactedLeads++;
              }
            }
          });
        }
        
        setPerformance(perfData);
      }`
);

// Add columns to table headers (Teams)
content = content.replace(
  /<th className="p-4 text-center">Cliques<\/th>\s*<th className="p-4 text-center">Planos<\/th>/,
  `<th className="p-4 text-center">Cliques</th>
   <th className="p-4 text-center">Leads (Contactadas)</th>
   <th className="p-4 text-center">Planos</th>`
);

// Add columns to table body (Teams)
content = content.replace(
  /<td className="p-4 text-center font-bold text-slate-700">\{perf\.totalStores\}<\/td>/,
  `<td className="p-4 text-center font-bold text-slate-700">
     <div className="flex flex-col items-center">
       <span>{perf.assignedLeads}</span>
       <span className="text-[9px] text-emerald-600">{perf.contactedLeads} cont.</span>
     </div>
   </td>
   <td className="p-4 text-center font-bold text-slate-700">{perf.totalStores}</td>`
);

// Do the same for the agents without team table
content = content.replace(
  /<th className="p-4 text-center">Cliques<\/th>\s*<th className="p-4 text-center">Planos<\/th>/,
  `<th className="p-4 text-center">Cliques</th>
   <th className="p-4 text-center">Leads (Contactadas)</th>
   <th className="p-4 text-center">Planos</th>`
);

content = content.replace(
  /<td className="p-4 text-center font-bold text-slate-700">\{perf\.totalStores\}<\/td>/,
  `<td className="p-4 text-center font-bold text-slate-700">
     <div className="flex flex-col items-center">
       <span>{perf.assignedLeads}</span>
       <span className="text-[9px] text-emerald-600">{perf.contactedLeads} cont.</span>
     </div>
   </td>
   <td className="p-4 text-center font-bold text-slate-700">{perf.totalStores}</td>`
);


fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
