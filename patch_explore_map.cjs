const fs = require('fs');
let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

content = content.replace(
  "  const { t } = useTranslation();",
  "  const { t, i18n } = useTranslation();\n  const currentLangCode = (i18n.language || 'pt').split('-')[0].toLowerCase();"
);

content = content.replace(
  /<APIProvider apiKey=\{mapApiKey\}>/g,
  '<APIProvider apiKey={mapApiKey} language={currentLangCode}>'
);

fs.writeFileSync('src/pages/Explore.tsx', content);

