const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

code = code.replace(
  /const \{ error \} = await supabase\.from\('businesses'\)\.update\(\{/,
  `try {
      const { error } = await supabase.from('businesses').update({`
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', code);
