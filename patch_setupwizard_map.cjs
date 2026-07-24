const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

content = content.replace(
  "    const { t } = useTranslation();",
  "    const { t, i18n } = useTranslation();\n    const currentLangCode = (i18n.language || 'pt').split('-')[0].toLowerCase();"
);

content = content.replace(
  /<APIProvider apiKey=\{API_KEY\}>/g,
  '<APIProvider apiKey={API_KEY} language={currentLangCode}>'
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);

