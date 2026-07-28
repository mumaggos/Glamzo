const fs = require('fs');

const fixEnv = (filePath) => {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/import\.meta\.env/g, '(import.meta as any).env');
  fs.writeFileSync(filePath, code);
};

fixEnv('src/pages/partner/SetupWizard.tsx');
fixEnv('src/pages/partner/tabs/SettingsTab.tsx');
