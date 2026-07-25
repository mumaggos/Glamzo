const fs = require('fs');
const file = 'src/pages/Partner.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("Sincronização direta com a {t('partnerPage.planProFeat1')}", "{t('partnerPage.planTermFeat3', 'Sincronização direta com a Gestão de Agenda')}");

content = content.replace("{t('partnerPage.planProFeat1')} Inteligente", "{t('partnerPage.heroPill2', 'Gestão de Agenda Inteligente')}");

fs.writeFileSync(file, content);
console.log("Fixed sync");
