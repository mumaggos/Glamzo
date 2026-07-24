const fs = require('fs');
let text = fs.readFileSync('src/components/DynamicLegalPage.tsx', 'utf8');
text = text.replace(
  "if (pageData && i18n.language.startsWith('pt')) {",
  "if (pageData && (i18n.resolvedLanguage || i18n.language || '').startsWith('pt')) {"
);
fs.writeFileSync('src/components/DynamicLegalPage.tsx', text);
