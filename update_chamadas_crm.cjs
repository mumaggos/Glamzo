const fs = require('fs');
let content = fs.readFileSync('src/pages/ChamadasCRM.tsx', 'utf8');

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

// Add new option to the select dropdown
content = content.replace(
  /<option value="nao_atendeu">Não Atendeu \(Avisa SMS\)<\/option>\s*<option value="desligou">Desligou Chamada<\/option>/,
  `<option value="nao_atendeu">Não Atendeu (Avisa SMS e Devolve)</option>
                            <option value="desligou">Desligou Chamada</option>
                            <option value="invalido">Número Inválido/Desligado</option>`
);

// Update saveLead logic
content = content.replace(
  /const updates = edits\[id\];\s*if \(!updates\) return;\s*setSavingId\(id\);\s*\/\/ Auto-check SMS if nao_atendeu\s*if \(updates\.estado_chamada === 'nao_atendeu'\) \{\s*const lead = leads\.find\(l => l\.id === id\);\s*if \(lead && !lead\.sms_enviado\) \{\s*updates\.sms_enviado = true;\s*\}\s*\}/s,
  `const updates = edits[id];
    if (!updates) return;

    setSavingId(id);
    
    let finalUpdates = { ...updates };
    const lead = leads.find(l => l.id === id);
    
    // Auto-check SMS if nao_atendeu
    if (finalUpdates.estado_chamada === 'nao_atendeu') {
      if (lead && !lead.sms_enviado) {
        finalUpdates.sms_enviado = true;
      }
      
      // Devolve para a lista a atribuir
      finalUpdates.vendedor_id = null;
      finalUpdates.senha_acesso = null;
      finalUpdates.estado_chamada = 'pendente';
      const existingNotas = finalUpdates.notas !== undefined ? finalUpdates.notas : (lead?.notas || '');
      finalUpdates.notas = existingNotas + (existingNotas ? ' | ' : '') + 'Não Atendeu';
    }`
);

// Update supabase call to use finalUpdates
content = content.replace(
  /const \{ error \} = await supabase\s*\.from\('leads'\)\s*\.update\(updates\)\s*\.eq\('id', id\);/s,
  `const { error } = await supabase
        .from('leads')
        .update(finalUpdates)
        .eq('id', id);`
);

// Update state after successful save
content = content.replace(
  /setLeads\(prev => prev\.map\(l => l\.id === id \? \{ \.\.\.l, \.\.\.updates \} : l\)\);\s*setEdits\(prev => \{/,
  `if (finalUpdates.vendedor_id === null) {
        setLeads(prev => prev.filter(l => l.id !== id));
      } else {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...finalUpdates } : l));
      }
      setEdits(prev => {`
);

fs.writeFileSync('src/pages/ChamadasCRM.tsx', content);
