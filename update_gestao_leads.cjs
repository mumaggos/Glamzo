const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoLeads.tsx', 'utf8');

// Add new option to the renderer in GestaoLeads
content = content.replace(
  /lead\.estado_chamada === 'pendente' \? 'bg-amber-100 text-amber-700' :/,
  `lead.estado_chamada === 'pendente' ? 'bg-amber-100 text-amber-700' :
                            lead.estado_chamada === 'invalido' ? 'bg-slate-200 text-slate-700' :`
);

fs.writeFileSync('src/components/GestaoLeads.tsx', content);
