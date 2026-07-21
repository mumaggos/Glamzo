const fs = require('fs');
let content = fs.readFileSync('src/components/AgentLeadsModal.tsx', 'utf8');

// Add new option to getStatusColor
content = content.replace(
  /case 'desligou': return 'bg-rose-50 text-rose-600 border-rose-200';/,
  `case 'desligou': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'invalido': return 'bg-slate-200 text-slate-700 border-slate-300';`
);

// Add new option to getStatusLabel
content = content.replace(
  /case 'desligou': return 'Desligou Chamada';/,
  `case 'desligou': return 'Desligou Chamada';
      case 'invalido': return 'Número Inválido/Desligado';`
);

fs.writeFileSync('src/components/AgentLeadsModal.tsx', content);
