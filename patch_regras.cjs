const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

code = code.replace(
  /\/\/ Persist logic \(fake if columns don't exist, real if they do\)[\s\S]*?setSavingRegras\(false\);\n      \}, 800\);/g,
  `const { error } = await supabase.from('businesses').update({ 
        min_booking_notice: parseInt(rules.min_notice),
        cancellation_policy: rules.cancellation_policy
      }).eq('id', business.id);
      
      if (error) throw error;
      showMessage('success', 'Regras de agendamento atualizadas com sucesso.');`
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', code);
