const fs = require('fs');
let content = fs.readFileSync('src/components/SalesAgentsTab.tsx', 'utf8');

// 1. Add Trash2 import
content = content.replace(
  /import \{ Loader2, Plus, Copy, Check, Users, Target, Link as LinkIcon, BadgeEuro, X \} from 'lucide-react';/,
  "import { Loader2, Plus, Copy, Check, Users, Target, Link as LinkIcon, BadgeEuro, X, Trash2 } from 'lucide-react';"
);

// 2. Fix the fetch to use selected_plan instead of active_plan
content = content.replace(
  /\.select\('agent_id, active_plan'\);/,
  ".select('agent_id, selected_plan');"
);

content = content.replace(
  /if \(business.active_plan === 'pro'\) \{/,
  "if (business.selected_plan === 'pro' || business.selected_plan === 'app_tablet') {"
);

content = content.replace(
  /\} else if \(business.active_plan === 'pro_terminal' \|\| business.active_plan\?\.includes\('terminal'\)\) \{/,
  "} else if (business.selected_plan === 'pro_terminal' || business.selected_plan?.includes('terminal')) {"
);

// 3. Add handle delete functions
content = content.replace(
  /const generateRefCode = \(name: string\) => \{/,
  `const handleDeleteTeam = (teamName: string) => {
    if (confirm(\`Tem a certeza que deseja apagar a equipa "\${teamName}"?\`)) {
      const teamAgents = agents.filter(a => a.team_name === teamName);
      if (teamAgents.length > 0) {
        alert('Não é possível apagar uma equipa que contenha comerciais.');
        return;
      }
      const updated = emptyTeams.filter(t => t !== teamName);
      setEmptyTeams(updated);
      localStorage.setItem('glamzo_sales_teams', JSON.stringify(updated));
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (confirm(\`Tem a certeza que deseja apagar o comercial "\${agentName}"?\`)) {
      try {
        const { error } = await supabase.from('sales_agents').delete().eq('id', agentId);
        if (error) throw error;
        setAgents(agents.filter(a => a.id !== agentId));
      } catch (err) {
        console.error(err);
        alert('Erro ao apagar comercial.');
      }
    }
  };

  const generateRefCode = (name: string) => {`
);

// 4. Render delete team button
content = content.replace(
  /<h4 className="font-extrabold text-lg text-slate-900">\{teamName\}<\/h4>/,
  `<div className="flex items-center gap-2">
    <h4 className="font-extrabold text-lg text-slate-900">{teamName}</h4>
    {teamAgents.length === 0 && (
      <button onClick={() => handleDeleteTeam(teamName)} className="text-slate-300 hover:text-rose-500 transition-colors" title="Apagar Equipa Vazia">
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>`
);

// 5. Render delete agent button (in team table)
content = content.replace(
  /className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"\n                                  title="Copiar Link de Afiliado"\n                                >\n                                  \{copiedId === agent.id \? <Check className="w-3 h-3 text-emerald-600" \/> : <LinkIcon className="w-3 h-3" \/>\}\n                                <\/button>\n                              <\/td>/g,
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
                                </button>
                              </td>`
);

fs.writeFileSync('src/components/SalesAgentsTab.tsx', content);
