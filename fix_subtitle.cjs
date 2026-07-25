const fs = require('fs');
const file = 'src/pages/Partner.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{t("partnerPage.heroSubtitle", "A Glamzo é o ecossistema de elite focado a 100% no crescimento de Salões, Barbearias e SPAs. Agenda inteligente, pagamentos integrados e marketing automático.")}',
  '{t("partnerPage.heroSubtitle")}'
);
fs.writeFileSync(file, content);
