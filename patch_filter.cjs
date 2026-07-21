const fs = require('fs');
let content = fs.readFileSync('src/pages/ChamadasCRM.tsx', 'utf8');

const target = `  // Filter based on tab and search
  // Combine edits with base leads for display
  const currentData = leads.map(l => ({ ...l, ...(edits[l.id] || {}) }));
  
  const pendentes = currentData.filter(l => l.estado_chamada === 'pendente' && (l.nome_loja.toLowerCase().includes(searchTerm.toLowerCase()) || l.telefone.includes(searchTerm)));
  const contactados = currentData.filter(l => l.estado_chamada !== 'pendente' && (l.nome_loja.toLowerCase().includes(searchTerm.toLowerCase()) || l.telefone.includes(searchTerm)));
  
  const activeList = activeTab === 'pendentes' ? pendentes : contactados;`;

const replacement = `  // Filter based on tab and search
  // Use original leads array for determining which tab a lead belongs to,
  // so it doesn't disappear from the tab before clicking 'Guardar'.
  
  const pendentes = leads.filter(l => l.estado_chamada === 'pendente' && (l.nome_loja.toLowerCase().includes(searchTerm.toLowerCase()) || l.telefone.includes(searchTerm)))
                         .map(l => ({ ...l, ...(edits[l.id] || {}) }));
                         
  const contactados = leads.filter(l => l.estado_chamada !== 'pendente' && (l.nome_loja.toLowerCase().includes(searchTerm.toLowerCase()) || l.telefone.includes(searchTerm)))
                           .map(l => ({ ...l, ...(edits[l.id] || {}) }));
  
  const activeList = activeTab === 'pendentes' ? pendentes : contactados;`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/ChamadasCRM.tsx', content);
