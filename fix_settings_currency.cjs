const fs = require('fs');

// SettingsTab
let settings = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');
const settingsFind = "const { error } = await supabase.from('businesses').update(formData).eq('id', business.id);";
const settingsReplace = `
      // Remover campos que não existem na tabela
      const payloadToSave = { ...formData };
      if ('currency' in payloadToSave) delete payloadToSave.currency;
      
      const { error } = await supabase.from('businesses').update(payloadToSave).eq('id', business.id);`;
if(settings.includes(settingsFind)) {
    settings = settings.replace(settingsFind, settingsReplace);
    fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', settings);
}

// SetupWizard
let setup = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');
const setupFind = "const { error } = await supabase.from('businesses').update(updateData).eq('id', business.id);";
const setupReplace = `
        const payloadToSave = { ...updateData };
        if ('currency' in payloadToSave) delete payloadToSave.currency;
        const { error } = await supabase.from('businesses').update(payloadToSave).eq('id', business.id);`;
if(setup.includes(setupFind)) {
    setup = setup.replace(setupFind, setupReplace);
    fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setup);
}
console.log("Fixed currency payloads");
