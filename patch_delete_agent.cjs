const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

content = content.replace(
  /const handleDeleteAgent = async \(agentId: string, agentName: string\) => \{([\s\S]*?)try \{([\s\S]*?)const \{ error \} = await supabase\.from\('sales_agents'\)\.delete\(\)\.eq\('id', agentId\);/m,
  `const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (confirm(\`Tem a certeza que deseja apagar o comercial "\${agentName}"? As leads pendentes voltarão para distribuição.\`)) {
      try {
        // Unassign pending leads
        await supabase
          .from('leads')
          .update({ vendedor_id: null, senha_acesso: null })
          .eq('vendedor_id', agentId)
          .eq('estado_chamada', 'pendente');
          
        const { error } = await supabase.from('sales_agents').delete().eq('id', agentId);`
);

fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
