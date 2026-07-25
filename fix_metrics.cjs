const fs = require('fs');
const file = 'src/pages/Partner.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('Aumento de Marcações', '{t("partnerPage.metric1", "Aumento de Marcações")}');
content = content.replace('Redução de No-Shows', '{t("partnerPage.metric2", "Redução de No-Shows")}');
content = content.replace('Poupadas por Dia', '{t("partnerPage.metric3", "Poupadas por Dia")}');
content = content.replace('Retenção de Clientes', '{t("partnerPage.metric4", "Retenção de Clientes")}');
fs.writeFileSync(file, content);
console.log("Fixed metrics");
