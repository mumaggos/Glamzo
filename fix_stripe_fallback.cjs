const fs = require('fs');

let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');
content = content.replace("'Falha na subscrição. Por favor, tente novamente.'", "t('setupWizard.errSubscriptionFailed')");
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
const langs = ['en', 'pt', 'es', 'fr'];
for (const lang of langs) {
  const regex = new RegExp(`(${lang}:\\s*{\\s*translation:\\s*{\\s*setupWizard:\\s*{)`);
  i18n = i18n.replace(regex, `$1\n            errSubscriptionFailed: "Falha na subscrição. Por favor, tente novamente.",`);
}
fs.writeFileSync('src/i18n.ts', i18n);
